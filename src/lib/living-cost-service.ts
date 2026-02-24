import { LivingCostSnapshot, PriceMoveItem } from "./living-cost-types";

const FALLBACK_ITEMS: Omit<PriceMoveItem, "changeKrw">[] = [
  { name: "사과", unit: "1개", price: 3980, changePct: 6.2 },
  { name: "배추", unit: "1포기", price: 5120, changePct: 4.8 },
  { name: "달걀", unit: "30구", price: 7290, changePct: 3.9 },
  { name: "우유", unit: "1L", price: 2980, changePct: 2.7 },
  { name: "쌀", unit: "10kg", price: 31900, changePct: 2.3 },
  { name: "돼지고기", unit: "100g", price: 2380, changePct: 1.8 },
  { name: "양파", unit: "1kg", price: 3490, changePct: 1.4 },
  { name: "대파", unit: "1단", price: 2690, changePct: 1.1 },
  { name: "식용유", unit: "900ml", price: 6980, changePct: 0.8 },
  { name: "커피믹스", unit: "100T", price: 12900, changePct: 0.5 },
  { name: "감자", unit: "1kg", price: 2980, changePct: -0.6 },
  { name: "토마토", unit: "1kg", price: 4880, changePct: -0.9 },
  { name: "두부", unit: "1모", price: 2380, changePct: -1.2 },
  { name: "참치캔", unit: "150g", price: 2580, changePct: -1.4 },
  { name: "라면", unit: "5입", price: 4280, changePct: -1.8 },
  { name: "바나나", unit: "1송이", price: 3480, changePct: -2.1 },
  { name: "당근", unit: "1kg", price: 2590, changePct: -2.4 },
  { name: "시금치", unit: "1단", price: 1980, changePct: -2.9 },
  { name: "오이", unit: "1개", price: 980, changePct: -3.2 },
  { name: "고등어", unit: "1마리", price: 3490, changePct: -3.7 },
];

function withKrwDelta(item: Omit<PriceMoveItem, "changeKrw">): PriceMoveItem {
  const krw = Math.round((item.price * item.changePct) / 100);
  return { ...item, changeKrw: krw };
}

function toNumber(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[^0-9.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

async function fetchKamisItems(): Promise<PriceMoveItem[]> {
  const key = process.env.KAMIS_API_KEY;
  const certId = process.env.KAMIS_CERT_ID || "moabom";
  if (!key) return [];

  const endpoint =
    `https://www.kamis.or.kr/service/price/json.do?action=dailyPriceByCategoryList` +
    `&p_cert_key=${encodeURIComponent(key)}` +
    `&p_cert_id=${encodeURIComponent(certId)}` +
    `&p_returntype=json`;

  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();

  const rows =
    data?.data?.item ??
    data?.price ??
    data?.items ??
    data?.data ??
    [];

  if (!Array.isArray(rows)) return [];

  const mapped: PriceMoveItem[] = rows
    .map((r: Record<string, unknown>) => {
      const name = String(r.productName || r.productname || r.item_name || r.itemname || "").trim();
      const unit = String(r.unit || r.unitname || "1개").trim();
      const price = toNumber(r.price || r.dpr1 || r.todayPrice || r.today_price);
      const changePct = toNumber(r.rate || r.changeRate || r.chanYearday || r.day_change_rate);
      if (!name || !price) return null;
      const base = { name, unit, price, changePct };
      return withKrwDelta(base);
    })
    .filter((x): x is PriceMoveItem => Boolean(x));

  return mapped;
}

export async function getLivingCostSnapshot(): Promise<LivingCostSnapshot> {
  const live = await fetchKamisItems();
  const source = live.length >= 10 ? live : FALLBACK_ITEMS.map(withKrwDelta);

  const risingTop10 = [...source]
    .filter((i) => i.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 10);

  const fallingTop10 = [...source]
    .filter((i) => i.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 10);

  return {
    updatedAt: new Date().toISOString(),
    risingTop10,
    fallingTop10,
  };
}
