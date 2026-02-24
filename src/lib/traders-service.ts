export interface TradersDealItem {
  title: string;
  url: string;
}

function extract(html: string, base: string): TradersDealItem[] {
  const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const out: TradersDealItem[] = [];
  const seen = new Set<string>();

  for (const m of links) {
    const href = m[1] || "";
    const title = (m[2] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!href || !title || title.length < 4) continue;

    const full = href.startsWith("http") ? href : `${base}${href.startsWith("/") ? "" : "/"}${href}`;

    const looksLikeDeal = /(event|deal|special|promotion|goods|product|sale|기획|이벤트|특가)/i.test(href + title);
    if (!looksLikeDeal) continue;

    // 트레이더스 전용 항목만 남기기
    const tradersOnly =
      /traders/i.test(full) ||
      /트레이더스/.test(title) ||
      /traders\.ssg\.com/i.test(full);
    if (!tradersOnly) continue;

    // 노이즈 링크 제외
    if (/costco|coupang|11st|gmarket|auction/i.test(full)) continue;

    const key = `${title}|${full}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ title, url: full });
    if (out.length >= 30) break;
  }

  return out;
}

export async function getTradersDeals() {
  const base = "https://traders.ssg.com";
  const pages = [
    "/",
    "/event/eventMain.ssg",
    "/special/index.ssg",
  ];
  const all: TradersDealItem[] = [];

  for (const p of pages) {
    try {
      const res = await fetch(`${base}${p}`, {
        headers: { "User-Agent": "Mozilla/5.0 (moabom)" },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const html = await res.text();
      all.push(...extract(html, base));
    } catch {
      // ignore
    }
  }

  const dedup = Array.from(new Map(all.map((i) => [`${i.title}|${i.url}`, i])).values());
  return {
    updatedAt: new Date().toISOString(),
    total: dedup.length,
    items: dedup.slice(0, 20),
  };
}
