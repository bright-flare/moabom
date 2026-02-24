"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const SPOTS = [
  { name: "강남 회식포차", lat: 37.4979, lon: 127.0276, tag: "8인 가능 · 가성비" },
  { name: "역삼 숯불모아", lat: 37.5006, lon: 127.0364, tag: "고기 · 단체석" },
  { name: "선릉 모임식당", lat: 37.5045, lon: 127.0489, tag: "조용한 분위기" },
  { name: "시청 한식당", lat: 37.5664, lon: 126.9779, tag: "대형 룸" },
  { name: "합정 이자카야", lat: 37.5499, lon: 126.9137, tag: "2차까지" },
];

function km(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Page() {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>(new Date().toLocaleTimeString());

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
        setUpdatedAt(new Date().toLocaleTimeString());
        setLoading(false);
      },
      () => {
        setUpdatedAt(new Date().toLocaleTimeString());
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 6000 }
    );
  }, []);

  const list = useMemo(() => {
    if (!pos) return SPOTS.map((s) => ({ ...s, dist: null as number | null }));
    return [...SPOTS]
      .map((s) => ({ ...s, dist: km(pos.lat, pos.lon, s.lat, s.lon) }))
      .filter((s) => (s.dist ?? 99) <= 3)
      .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0));
  }, [pos]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-cyan-50 to-sky-50 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl border border-teal-200 bg-white/95 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">회식장소 모아봄</h1>
              <p className="mt-1 text-sm text-slate-600">{pos ? "현재 위치 기반 추천" : "위치 권한 허용 시 근거리 추천"}</p>
              <p className="mt-1 text-xs text-slate-500">업데이트: {updatedAt}</p>
            </div>
            <button
              onClick={refreshLocation}
              className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm hover:bg-teal-100"
            >
              {loading ? "새로고침 중..." : "새로고침"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-white/95 p-4 shadow-sm">
          <p className="text-sm font-semibold text-cyan-700">네이버 지도 기반 보기</p>
          <p className="mt-1 text-xs text-slate-500">아래 각 카드의 네이버지도 버튼으로 해당 장소를 지도에서 바로 열 수 있어.</p>
        </div>

        <ul className="space-y-2">
          {list.length === 0 && pos && (
            <li className="rounded-xl border border-teal-200 bg-white p-3 text-sm text-slate-600">
              3km 반경 내 추천 장소가 없어요. 위치를 새로고침하거나 반경을 확장해봐.
            </li>
          )}
          {list.map((s, i) => (
            <li key={s.name} className="rounded-xl border border-teal-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{i + 1}. {s.name}</p>
                  <p className="mt-1 text-slate-600">{s.tag}</p>
                </div>
                <div className="text-right">
                  <p className="text-teal-700">{s.dist == null ? "거리 계산 대기" : `${s.dist.toFixed(1)}km`}</p>
                  <a
                    className="mt-1 inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(s.name)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    네이버지도
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/" className="inline-block rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white">메인으로</Link>
      </div>
    </main>
  );
}
