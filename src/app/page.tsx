"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDefaultWatchlists } from "@/lib/watchlist-service";
import { WatchlistCard } from "@/lib/watchlist-types";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("moabom-theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  const isDark = theme === "dark";
  const [watchlists, setWatchlists] = useState<WatchlistCard[]>(() => getDefaultWatchlists());
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["jobs", "living-cost", "fx", "traffic"];
    const saved = window.localStorage.getItem("moabom-card-order");
    return saved ? JSON.parse(saved) : ["jobs", "living-cost", "fx", "traffic"];
  });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem("moabom-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("moabom-card-order", JSON.stringify(cardOrder));
  }, [cardOrder]);

  useEffect(() => {
    let mounted = true;

    async function loadWatchlists() {
      try {
        const res = await fetch("/api/watchlists", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && Array.isArray(json.watchlists)) {
          setWatchlists(json.watchlists);
        }
      } catch {
        // keep fallback cards
      }
    }

    loadWatchlists();
    const id = setInterval(loadWatchlists, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const watchMap = useMemo(() => Object.fromEntries(watchlists.map((w) => [w.id, w])), [watchlists]);
  const orderedIds = useMemo(() => {
    const all = ["jobs", ...watchlists.map((w) => w.id)];
    const merged = [...cardOrder.filter((id) => all.includes(id)), ...all.filter((id) => !cardOrder.includes(id))];
    return merged;
  }, [cardOrder, watchlists]);

  const jobsUpdatedAt = useMemo(() => new Date().toLocaleTimeString(), []);

  function moveCard(overId: string) {
    if (!dragId || dragId === overId) return;
    setCardOrder((prev) => {
      const base = prev.length ? prev : orderedIds;
      const from = base.indexOf(dragId);
      const to = base.indexOf(overId);
      if (from < 0 || to < 0 || from === to) return base;
      const next = [...base];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  return (
    <main className={isDark ? "min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 text-white" : "min-h-screen bg-gradient-to-b from-rose-50 via-violet-50 to-sky-50 text-slate-800"}>
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <div className="w-full space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={isDark ? "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-slate-100 sm:px-4 sm:text-sm" : "inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium tracking-wide text-violet-700 sm:px-4 sm:text-sm"}>
              <span className={isDark ? "h-2 w-2 rounded-full bg-emerald-300" : "h-2 w-2 rounded-full bg-emerald-500"} />
              MOABOM <span className="opacity-60">·</span> Daily Feed
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

          <section className="space-y-3">
            <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orderedIds.map((id) => {
                const isJobs = id === "jobs";
                const w = watchMap[id];
                if (!isJobs && !w) return null;

                const watchTone = !isJobs
                  ? w.id === "living-cost"
                    ? isDark
                      ? "border-rose-200/30 bg-gradient-to-r from-rose-400/20 to-pink-400/10 shadow-xl shadow-rose-900/20"
                      : "border-rose-200 bg-gradient-to-r from-rose-100 via-pink-50 to-fuchsia-100 shadow-xl shadow-rose-100"
                    : w.id === "fx"
                    ? isDark
                      ? "border-violet-200/30 bg-gradient-to-r from-violet-400/20 to-indigo-400/10 shadow-xl shadow-indigo-900/20"
                      : "border-violet-200 bg-gradient-to-r from-violet-100 via-indigo-50 to-sky-100 shadow-xl shadow-violet-100"
                    : isDark
                    ? "border-sky-200/30 bg-gradient-to-r from-sky-400/20 to-cyan-400/10 shadow-xl shadow-sky-900/20"
                    : "border-sky-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-emerald-100 shadow-xl shadow-sky-100"
                  : "";

                const cardBody = isJobs ? (
                  <article className={isDark ? "group h-full rounded-2xl border border-violet-200/30 bg-gradient-to-r from-violet-400/20 to-sky-400/10 p-4 shadow-xl shadow-indigo-900/20" : "group h-full rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-100 via-fuchsia-50 to-indigo-100 p-4 shadow-xl shadow-rose-100"}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                        <h2 className="mt-1 text-xl font-bold">일자리 모아봄</h2>
                        <p className={isDark ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-600"}>오늘 수집된 채용 정보를 필터링하고 공유 중심으로 빠르게 확인해요.</p>
                        <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {jobsUpdatedAt} · 데일리 11:00 집계</p>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className={`h-full rounded-2xl border p-4 ${watchTone}`}>
                    <div className="flex items-center justify-between">
                      <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                      <span className={isDark ? "rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300" : "rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"}>{w.badge}</span>
                    </div>
                    <h2 className={isDark ? "mt-1 text-xl font-bold text-slate-100" : "mt-1 text-xl font-bold text-slate-800"}>{w.title}</h2>
                    <p className={isDark ? "mt-1 text-xs text-slate-300" : "mt-1 text-xs text-slate-500"}>{w.subtitle}</p>
                    <p className={isDark ? "mt-2 text-sm text-slate-100" : "mt-2 text-sm text-slate-700"}>{w.summary}</p>
                    <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {new Date(w.updatedAt).toLocaleTimeString()}</p>
                  </article>
                );

                const wrapped = isJobs ? (
                  <Link href="/jobs" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "living-cost" ? (
                  <Link href="/watchlists/living-cost" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : (
                  cardBody
                );

                const isDragging = dragId === id;
                const isOver = dragOverId === id && dragId !== id;

                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverId(id);
                    }}
                    onDragEnter={() => setDragOverId(id)}
                    onDrop={() => moveCard(id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverId(null);
                    }}
                    className={[
                      "cursor-grab select-none transition-all duration-200 ease-out",
                      isDragging ? "scale-[0.98] opacity-60" : "opacity-100",
                      isOver ? (isDark ? "-translate-y-1 rounded-2xl ring-2 ring-violet-300/60 shadow-2xl shadow-violet-900/30" : "-translate-y-1 rounded-2xl ring-2 ring-violet-300 shadow-xl") : "",
                    ].join(" ")}
                  >
                    {wrapped}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
