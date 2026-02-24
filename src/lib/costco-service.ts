export interface CostcoDealItem {
  title: string;
  url: string;
  discountLabel?: string;
}

function extractDiscountLabel(text: string) {
  const krw = text.match(/([₩￦]?[0-9]{1,3}(?:[,][0-9]{3})+\s*원?\s*(?:할인|쿠폰|즉시할인)?|[0-9]{2,6}\s*원\s*(?:할인|쿠폰|즉시할인)?)/i);
  if (krw) return krw[1].replace(/\s+/g, " ").trim();
  const pct = text.match(/([0-9]{1,2}\s*%\s*(?:할인|off|OFF))/i);
  if (pct) return pct[1].replace(/\s+/g, " ").trim();
  const instant = text.match(/(Instant\s+Savings\s*[:\-]?\s*[₩￦]?[0-9,]+)/i);
  if (instant) return instant[1].replace(/\s+/g, " ").trim();
  return undefined;
}

function extractDealsFromHtml(html: string, base: string): CostcoDealItem[] {
  const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const items: CostcoDealItem[] = [];
  const seen = new Set<string>();

  for (const m of links) {
    const href = m[1] || "";
    const inner = m[2] || "";
    const title = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!href || !title || title.length < 4) continue;
    if (!href.includes('/p/') && !href.includes('/product/')) continue;

    const full = href.startsWith('http') ? href : `${base}${href.startsWith('/') ? '' : '/'}${href}`;
    const key = `${title}::${full}`;
    if (seen.has(key)) continue;

    const idx = typeof m.index === 'number' ? m.index : 0;
    const snippet = html.slice(Math.max(0, idx - 350), Math.min(html.length, idx + 500));
    const discountLabel = extractDiscountLabel(`${title} ${snippet}`);

    seen.add(key);
    items.push({ title, url: full, discountLabel });
    if (items.length >= 30) break;
  }

  return items;
}

export async function getCostcoDeals() {
  const base = 'https://www.costco.co.kr';
  const pages = ['/c/SpecialPriceOffers', '/c/OnlineDeals'];
  const all: CostcoDealItem[] = [];

  for (const p of pages) {
    try {
      const res = await fetch(`${base}${p}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (moabom)' },
        cache: 'no-store',
      });
      if (!res.ok) continue;
      const html = await res.text();
      all.push(...extractDealsFromHtml(html, base));
    } catch {
      // ignore single source failure
    }
  }

  const dedup = Array.from(new Map(all.map((i) => [`${i.title}|${i.url}`, i])).values());

  return {
    updatedAt: new Date().toISOString(),
    total: dedup.length,
    items: dedup.slice(0, 20),
  };
}
