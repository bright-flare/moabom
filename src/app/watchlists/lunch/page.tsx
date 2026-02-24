"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

const PICKS = [
  ["제육볶음", "한식", "매콤 + 단백질"],
  ["돈까스", "일식", "든든한 한 끼"],
  ["쌀국수", "아시안", "가볍고 따뜻하게"],
  ["초밥", "일식", "깔끔한 선택"],
  ["김치찌개", "한식", "국물로 리프레시"],
  ["샐러드볼", "라이트", "오후 집중력"],
  ["부대찌개", "한식", "든든한 공유 메뉴"],
  ["마라탕", "중식", "칼칼한 자극"],
  ["파스타", "양식", "무난하고 실패 적음"],
  ["덮밥", "일식", "빠르고 든든"],
  ["쭈꾸미볶음", "한식", "매운맛 리프레시"],
  ["버거", "패스트", "간편하고 빠름"],
] as const;

function pickFive(seed: number) {
  const arr = [...PICKS];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 5);
}

export default function Page() {
  const [seed, setSeed] = useState(() => Date.now());
  const picks = useMemo(() => pickFive(seed), [seed]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-orange-200 bg-white/95 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">점심 추천 모아봄</h1>
            <button
              onClick={() => setSeed(Date.now())}
              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 shadow-sm hover:bg-orange-100"
            >
              새로고침
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-600">랜덤 5개 추천 · 버튼 누르면 다시 뽑아줘</p>
        </div>

        <ul className="space-y-2">
          {picks.map(([menu, type, reason], idx) => (
            <li key={`${menu}-${idx}`} className="rounded-xl border border-orange-200 bg-white p-3 text-sm">
              <p className="font-semibold text-orange-700">{idx + 1}. {menu}</p>
              <p className="mt-1 text-slate-600">타입: {type}</p>
              <p className="text-slate-600">추천 이유: {reason}</p>
            </li>
          ))}
        </ul>

        <Link href="/" className="inline-block rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white">메인으로</Link>
      </div>
    </main>
  );
}
