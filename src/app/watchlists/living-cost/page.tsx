"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LivingCostSnapshot } from "@/lib/living-cost-types";

export default function LivingCostPage() {
  const [data, setData] = useState<LivingCostSnapshot | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("moabom-theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  const isDark = theme === "dark";

  useEffect(() => {
    window.localStorage.setItem("moabom-theme", theme);
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch("/api/watchlists/living-cost", { cache: "no-store" });
      const json = await res.json();
      if (mounted) setData(json);
    }
    load();
    const id = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <main className={isDark ? "min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 p-4 text-slate-100 md:p-6" : "min-h-screen bg-gradient-to-b from-rose-50 via-violet-50 to-sky-50 p-4 text-slate-800 md:p-6"}>
      <div className="mx-auto max-w-6xl space-y-4">
        <div className={isDark ? "flex items-center justify-between rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4" : "flex items-center justify-between rounded-2xl border border-rose-200 bg-white/90 p-4"}>
          <div>
            <h1 className="text-2xl font-bold">생활물가 모아봄</h1>
            <p className={isDark ? "text-sm text-slate-300" : "text-sm text-slate-600"}>상승/하락 품목 TOP 10 비교</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="테마 전환"
              title="테마 전환"
              className={isDark ? "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base hover:bg-white/20" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm hover:bg-slate-50"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
            <Link href="/" className={isDark ? "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"}>
              메인으로
            </Link>
          </div>
        </div>

        {!data ? (
          <div className={isDark ? "rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-slate-300" : "rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500"}>데이터 불러오는 중...</div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            <div className={isDark ? "rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4" : "rounded-2xl border border-rose-200 bg-white p-4"}>
              <h2 className={isDark ? "mb-3 text-lg font-semibold text-rose-200" : "mb-3 text-lg font-semibold text-rose-700"}>상승 TOP 10</h2>
              <ul className="space-y-2">
                {data.risingTop10.map((item, idx) => (
                  <li key={item.name} className={isDark ? "flex items-center justify-between rounded-lg bg-rose-400/10 px-3 py-2 text-sm" : "flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-sm"}>
                    <span>{idx + 1}. {item.name} ({item.unit})</span>
                    <span className={isDark ? "font-semibold text-rose-200" : "font-semibold text-rose-600"}>+{item.changeKrw.toLocaleString()}원 · +{item.changePct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={isDark ? "rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4" : "rounded-2xl border border-emerald-200 bg-white p-4"}>
              <h2 className={isDark ? "mb-3 text-lg font-semibold text-emerald-200" : "mb-3 text-lg font-semibold text-emerald-700"}>하락 TOP 10</h2>
              <ul className="space-y-2">
                {data.fallingTop10.map((item, idx) => (
                  <li key={item.name} className={isDark ? "flex items-center justify-between rounded-lg bg-emerald-400/10 px-3 py-2 text-sm" : "flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm"}>
                    <span>{idx + 1}. {item.name} ({item.unit})</span>
                    <span className={isDark ? "font-semibold text-emerald-200" : "font-semibold text-emerald-600"}>{item.changeKrw.toLocaleString()}원 · {item.changePct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
