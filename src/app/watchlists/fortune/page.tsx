"use client";
import Link from "next/link";

const LINES = [
  "작은 시작이 큰 기회로 이어져요.",
  "오늘은 빠른 결정이 유리해요.",
  "협업에서 의외의 힌트를 얻어요.",
  "정리한 만큼 일이 가벼워져요.",
  "연락 하나가 흐름을 바꿔요.",
  "휴식 10분이 생산성을 올려줘요.",
  "지금의 선택이 다음주를 편하게 해줘요.",
];

export default function Page() {
  const idx = new Date().getDate() % LINES.length;
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-white/95 p-5 shadow-sm">
          <h1 className="text-2xl font-bold">오늘의 운세 모아봄</h1>
          <p className="mt-2 text-slate-600">{LINES[idx]}</p>
          <p className="mt-2 text-sm text-slate-500">오늘의 키워드: 집중 · 연결 · 작은 실행</p>
        </div>
        <Link href="/" className="inline-block rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white">메인으로</Link>
      </div>
    </main>
  );
}
