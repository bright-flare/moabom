import { WatchlistCard } from "./watchlist-types";

function nowIso() {
  return new Date().toISOString();
}

function asTrend(n: number): "up" | "down" | "flat" {
  if (n > 0.001) return "up";
  if (n < -0.001) return "down";
  return "flat";
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "moabom/1.0" }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function buildFxCard(): Promise<WatchlistCard> {
  const latest = await fetchJson("https://api.frankfurter.app/latest?from=USD&to=KRW,JPY,EUR");
  const krw = Number(latest?.rates?.KRW ?? 0);

  let diff = 0;
  try {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.toISOString().slice(0, 10);
    const prev = await fetchJson(`https://api.frankfurter.app/${y}?from=USD&to=KRW`);
    const prevKrw = Number(prev?.rates?.KRW ?? krw);
    diff = krw - prevKrw;
  } catch {
    diff = 0;
  }

  return {
    id: "fx",
    title: "오늘의 환율 모아봄",
    subtitle: "USD/KRW · JPY · EUR",
    summary: `USD/KRW ${krw.toFixed(2)} (${diff >= 0 ? "+" : ""}${diff.toFixed(2)})`,
    updatedAt: nowIso(),
    trend: asTrend(-diff),
    badge: "실시간",
  };
}

async function buildTrafficCard(): Promise<WatchlistCard> {
  const data = await fetchJson("https://topis.seoul.go.kr/main/selectSpdStat.do");
  const row = data?.rows?.[0] || { val1: "0", val2: "0", trfClsCd2: "2" };
  const v1 = Number(row.val1 || 0);
  const v2 = Number(row.val2 || 0);
  const status = row.trfClsCd2 === "1" ? "원활" : row.trfClsCd2 === "2" ? "서행" : "정체";

  return {
    id: "traffic",
    title: "출퇴근 정체 모아봄",
    subtitle: "서울 TOPIS 실시간 속도",
    summary: `도심 ${v1.toFixed(1)}km/h · 간선 ${v2.toFixed(1)}km/h (${status})`,
    updatedAt: nowIso(),
    trend: row.trfClsCd2 === "3" ? "up" : row.trfClsCd2 === "1" ? "down" : "flat",
    badge: status,
  };
}

async function buildLivingCostCard(): Promise<WatchlistCard> {
  const { getLivingCostSnapshot } = await import("./living-cost-service");
  const snap = await getLivingCostSnapshot();
  const topUp = snap.risingTop10[0];
  const topDown = snap.fallingTop10[0];

  return {
    id: "living-cost",
    title: "생활물가 모아봄",
    subtitle: "공공 농수산물 가격 동향",
    summary: `상승 ${topUp?.name ?? "-"} +${topUp?.changeKrw ?? 0}원 / 하락 ${topDown?.name ?? "-"} ${topDown?.changeKrw ?? 0}원`,
    updatedAt: snap.updatedAt || nowIso(),
    trend: (topUp?.changePct || 0) >= Math.abs(topDown?.changePct || 0) ? "up" : "down",
    badge: "실시간",
  };
}

export function getDefaultWatchlists(): WatchlistCard[] {
  return [
    {
      id: "living-cost",
      title: "생활물가 모아봄",
      subtitle: "장바구니 · 유가 · 생활요금",
      summary: "핵심 품목 변동 데이터를 불러오는 중",
      updatedAt: nowIso(),
      trend: "flat",
      badge: "로딩",
    },
    {
      id: "fx",
      title: "오늘의 환율 모아봄",
      subtitle: "USD/KRW · JPY/KRW · EUR/KRW",
      summary: "실시간 환율 데이터를 불러오는 중",
      updatedAt: nowIso(),
      trend: "flat",
      badge: "로딩",
    },
    {
      id: "traffic",
      title: "출퇴근 정체 모아봄",
      subtitle: "내 경로 · 평균 대비 소요시간",
      summary: "실시간 교통 데이터를 불러오는 중",
      updatedAt: nowIso(),
      trend: "flat",
      badge: "로딩",
    },
  ];
}

export async function getLiveWatchlists(): Promise<WatchlistCard[]> {
  const [living, fx, traffic] = await Promise.allSettled([
    buildLivingCostCard(),
    buildFxCard(),
    buildTrafficCard(),
  ]);

  const fallback = getDefaultWatchlists();

  return [
    living.status === "fulfilled" ? living.value : fallback[0],
    fx.status === "fulfilled" ? fx.value : fallback[1],
    traffic.status === "fulfilled" ? traffic.value : fallback[2],
  ];
}
