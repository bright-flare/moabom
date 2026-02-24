"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("moabom-theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  const isDark = theme === "dark";

  useEffect(() => {
    window.localStorage.setItem("moabom-theme", theme);
  }, [theme]);

  return (
    <main className={isDark ? "min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" : "min-h-screen bg-gradient-to-b from-rose-50 via-indigo-50 to-sky-50 text-slate-800"}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="w-full space-y-8">
          <div className="flex items-center justify-between">
            <p className={isDark ? "inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm" : "inline-flex rounded-full border border-violet-200 bg-white px-4 py-1 text-sm text-violet-700"}>
              MOABOM · Daily Insight Hub
            </p>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="테마 전환"
              title="테마 전환"
              className={isDark ? "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base hover:bg-white/20" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm hover:bg-slate-50"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">필요한 정보를 모아, 한눈에.</h1>
          <p className={isDark ? "max-w-2xl text-slate-300 md:text-lg" : "max-w-2xl text-slate-600 md:text-lg"}>
            구직 정보부터 생활에 유용한 신호까지, MOABOM이 매일 정리해서 보여줘.
          </p>

          <Link href="/jobs" className={isDark ? "group block max-w-xl rounded-3xl border border-orange-300/30 bg-gradient-to-r from-orange-500/20 to-rose-500/10 p-6 shadow-2xl shadow-orange-900/30 transition hover:scale-[1.01] hover:border-orange-200/50" : "group block max-w-xl rounded-3xl border border-rose-200 bg-gradient-to-r from-rose-100 to-indigo-100 p-6 shadow-xl shadow-rose-100 transition hover:scale-[1.01] hover:border-rose-300"}>
            <div className="flex items-center justify-between">
              <div>
                <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                <h2 className="mt-1 text-2xl font-bold">일자리 모아봄</h2>
                <p className={isDark ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-600"}>오늘 수집된 채용 정보를 필터링하고 공유 중심으로 빠르게 확인해요.</p>
              </div>
              <span className={isDark ? "rounded-xl bg-white/15 px-3 py-2 text-sm group-hover:bg-white/25" : "rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 group-hover:bg-white"}>상세 보기 →</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
