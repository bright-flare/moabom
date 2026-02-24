"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDefaultWatchlists } from "@/lib/watchlist-service";
import { WatchlistCard } from "@/lib/watchlist-types";

const DEFAULT_ORDER = [
  "jobs",
  "living-cost",
  "fx",
  "traffic",
  "fortune",
  "meme",
  "countdown",
  "lunch",
  "dinner-spots",
];

const FORTUNES = [
  "작은 시작이 큰 기회로 이어져요.",
  "오늘은 빠른 결정이 유리해요.",
  "협업에서 의외의 힌트를 얻어요.",
  "정리한 만큼 일이 가벼워져요.",
  "연락 하나가 흐름을 바꿔요.",
  "휴식 10분이 생산성을 올려줘요.",
  "지금의 선택이 다음주를 편하게 해줘요.",
];

const MEMES = [
  { title: "월요일 모드 ON", url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" },
  { title: "퇴근 5분 전 텐션", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" },
  { title: "점심 메뉴 고르는 중", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" },
  { title: "금요일의 나", url: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif" },
];

const DINNER_SPOTS = [
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
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("moabom-theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  const isDark = theme === "dark";

  const [watchlists, setWatchlists] = useState<WatchlistCard[]>(() => getDefaultWatchlists());
  const [customWatchlists] = useState<WatchlistCard[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("moabom-custom-watchlists");
    return saved ? JSON.parse(saved) : [];
  });
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ORDER;
    const saved = window.localStorage.getItem("moabom-card-order");
    return saved ? JSON.parse(saved) : DEFAULT_ORDER;
  });

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [userPos, setUserPos] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    window.localStorage.setItem("moabom-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("moabom-card-order", JSON.stringify(cardOrder));
  }, [cardOrder]);


  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 4000 }
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadWatchlists() {
      try {
        const res = await fetch("/api/watchlists", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && Array.isArray(json.watchlists)) setWatchlists(json.watchlists);
      } catch {}
    }
    loadWatchlists();
    const id = setInterval(loadWatchlists, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const funCards = useMemo<WatchlistCard[]>(() => {
    const dayIndex = Number(now.toISOString().slice(8, 10)) % 7;
    const meme = MEMES[dayIndex % MEMES.length];

    const leave = new Date(now);
    leave.setHours(18, 0, 0, 0);
    if (leave <= now) leave.setDate(leave.getDate() + 1);
    const mins = Math.max(0, Math.round((leave.getTime() - now.getTime()) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;

    const lunchPick = ["제육볶음", "돈까스", "쌀국수", "김치찌개", "초밥", "샐러드"][(now.getDay() + now.getHours()) % 6];

    const nearest = userPos
      ? [...DINNER_SPOTS]
          .map((s) => ({ ...s, dist: km(userPos.lat, userPos.lon, s.lat, s.lon) }))
          .sort((a, b) => a.dist - b.dist)
      : [...DINNER_SPOTS].map((s) => ({ ...s, dist: 0 }));

    const first = nearest[0];
    const second = nearest[1];

    return [
      {
        id: "fortune",
        title: "오늘의 운세 모아봄",
        subtitle: "가벼운 하루 힌트",
        summary: FORTUNES[dayIndex],
        updatedAt: now.toISOString(),
        trend: "flat",
        badge: "Daily",
      },
      {
        id: "meme",
        title: "오늘의 밈 모아봄",
        subtitle: "클릭해서 보기",
        summary: meme.title,
        updatedAt: now.toISOString(),
        trend: "up",
        badge: "Fun",
      },
      {
        id: "countdown",
        title: "퇴근 카운트다운 모아봄",
        subtitle: "오늘 퇴근까지",
        summary: `${h}시간 ${m}분 남았어`,
        updatedAt: now.toISOString(),
        trend: "flat",
        badge: "Live",
      },
      {
        id: "lunch",
        title: "점심 추천 모아봄",
        subtitle: "오늘의 랜덤 메뉴",
        summary: `오늘 추천: ${lunchPick}`,
        updatedAt: now.toISOString(),
        trend: "flat",
        badge: "Pick",
      },
      {
        id: "dinner-spots",
        title: "회식장소 모아봄",
        subtitle: userPos ? "현재 위치 기반" : "기본 위치 기준",
        summary: userPos
          ? `${first?.name ?? "추천 없음"} (${first?.dist.toFixed(1)}km) · ${second?.name ?? "-"}`
          : `${first?.name ?? "추천 없음"} · 위치 권한 허용 시 근거리 추천`,
        updatedAt: now.toISOString(),
        trend: "up",
        badge: "Nearby",
      },
    ];
  }, [now, userPos]);

  const allWatchlists = useMemo(() => [...watchlists, ...funCards, ...customWatchlists], [watchlists, funCards, customWatchlists]);
  const watchMap = useMemo(() => Object.fromEntries(allWatchlists.map((w) => [w.id, w])), [allWatchlists]);
  const orderedIds = useMemo(() => {
    const all = ["jobs", ...allWatchlists.map((w) => w.id)];
    const merged = [...cardOrder.filter((id) => all.includes(id)), ...all.filter((id) => !cardOrder.includes(id))];
    const tailIds = ["fx", "traffic", "living-cost"];
    const head = merged.filter((id) => !tailIds.includes(id));
    const tail = tailIds.filter((id) => merged.includes(id));
    return [...head, ...tail];
  }, [cardOrder, allWatchlists]);

  const jobsUpdatedAt = useMemo(() => new Date().toLocaleTimeString(), []);
  const memeOfDay = useMemo(() => MEMES[Number(now.toISOString().slice(8, 10)) % MEMES.length], [now]);
  const countdownDisplay = useMemo(() => {
    const leave = new Date(now);
    leave.setHours(18, 0, 0, 0);
    if (leave <= now) leave.setDate(leave.getDate() + 1);
    const sec = Math.max(0, Math.floor((leave.getTime() - now.getTime()) / 1000));
    const hh = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }, [now]);

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

  function emojiForCard(id: string) {
    if (id === "jobs") return "💼";
    if (id === "living-cost") return "🛒";
    if (id === "fx") return "💱";
    if (id === "traffic") return "🚦";
    if (id === "fortune") return "🔮";
    if (id === "meme") return "😂";
    if (id === "countdown") return "⏳";
    if (id === "lunch") return "🍱";
    if (id === "dinner-spots") return "🍻";
    return "✨";
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
                    : w.id === "traffic"
                    ? isDark
                      ? "border-sky-200/30 bg-gradient-to-r from-sky-400/20 to-cyan-400/10 shadow-xl shadow-sky-900/20"
                      : "border-sky-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-emerald-100 shadow-xl shadow-sky-100"
                    : w.id === "fortune"
                    ? isDark
                      ? "border-amber-200/30 bg-gradient-to-r from-amber-400/20 to-orange-400/10 shadow-xl shadow-amber-900/20"
                      : "border-amber-200 bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 shadow-xl shadow-amber-100"
                    : w.id === "meme"
                    ? isDark
                      ? "border-fuchsia-200/30 bg-gradient-to-r from-fuchsia-400/20 to-pink-400/10 shadow-xl shadow-fuchsia-900/20"
                      : "border-fuchsia-200 bg-gradient-to-r from-fuchsia-100 via-pink-50 to-rose-100 shadow-xl shadow-fuchsia-100"
                    : w.id === "countdown"
                    ? isDark
                      ? "border-lime-200/30 bg-gradient-to-r from-lime-400/20 to-emerald-400/10 shadow-xl shadow-lime-900/20"
                      : "border-lime-200 bg-gradient-to-r from-lime-100 via-emerald-50 to-green-100 shadow-xl shadow-lime-100"
                    : w.id === "lunch"
                    ? isDark
                      ? "border-orange-200/30 bg-gradient-to-r from-orange-400/20 to-amber-400/10 shadow-xl shadow-orange-900/20"
                      : "border-orange-200 bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 shadow-xl shadow-orange-100"
                    : w.id === "dinner-spots"
                    ? isDark
                      ? "border-teal-200/30 bg-gradient-to-r from-teal-400/20 to-cyan-400/10 shadow-xl shadow-teal-900/20"
                      : "border-teal-200 bg-gradient-to-r from-teal-100 via-cyan-50 to-sky-100 shadow-xl shadow-teal-100"
                    : isDark
                    ? "border-white/20 bg-white/[0.08] shadow-xl"
                    : "border-slate-200 bg-white shadow-xl"
                  : "";

                const cardBody = isJobs ? (
                  <article className={isDark ? "group h-full rounded-2xl border border-violet-200/30 bg-gradient-to-r from-violet-400/20 to-sky-400/10 p-4 shadow-xl shadow-indigo-900/20" : "group h-full rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-100 via-fuchsia-50 to-indigo-100 p-4 shadow-xl shadow-rose-100"}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                        <h2 className="mt-1 text-xl font-bold">{emojiForCard("jobs")} 일자리 모아봄</h2>
                        <p className={isDark ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-600"}>오늘 수집된 채용 정보를 필터링하고 공유 중심으로 빠르게 확인해요.</p>
                        <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {jobsUpdatedAt} · 데일리 11:00 집계</p>
                      </div>
                    </div>
                  </article>
                ) : w.id === "meme" ? (
                  <article className={`h-full overflow-hidden rounded-2xl border p-4 text-center ${watchTone}`}>
                    <div className="flex items-center justify-between">
                      <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                      <span className={isDark ? "rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300" : "rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"}>{w.badge}</span>
                    </div>
                    <h2 className={isDark ? "mt-1 text-xl font-bold text-slate-100" : "mt-1 text-xl font-bold text-slate-800"}>{emojiForCard(w.id)} {w.title}</h2>
                    <p className={isDark ? "mt-1 text-xs text-slate-300" : "mt-1 text-xs text-slate-500"}>{w.subtitle}</p>
                    <div className="relative mx-auto mt-2 h-28 w-[92%] overflow-hidden rounded-xl">
                      <Image src={memeOfDay.url} alt={memeOfDay.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 30vw" />
                    </div>
                    <p className={isDark ? "mt-2 text-sm text-slate-100" : "mt-2 text-sm text-slate-700"}>{w.summary}</p>
                    <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {new Date(w.updatedAt).toLocaleTimeString()}</p>
                  </article>
                ) : w.id === "countdown" ? (
                  <article className={`h-full rounded-2xl border p-4 ${watchTone}`}>
                    <div className="flex items-center justify-between">
                      <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                      <span className={isDark ? "rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300" : "rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"}>{w.badge}</span>
                    </div>
                    <h2 className={isDark ? "mt-1 text-xl font-bold text-slate-100" : "mt-1 text-xl font-bold text-slate-800"}>{emojiForCard(w.id)} {w.title}</h2>
                    <p className={isDark ? "mt-1 text-xs text-slate-300" : "mt-1 text-xs text-slate-500"}>{w.subtitle}</p>
                    <p className={isDark ? "mt-3 text-4xl font-black tracking-widest text-lime-200" : "mt-3 text-4xl font-black tracking-widest text-lime-700"}>{countdownDisplay}</p>
                    <p className={isDark ? "mt-2 text-sm text-slate-100 animate-wiggle-cute" : "mt-2 text-sm text-slate-700 animate-wiggle-cute"}>퇴근까지 남은 시간</p>
                    <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {new Date(w.updatedAt).toLocaleTimeString()}</p>
                  </article>
                ) : (
                  <article className={`h-full rounded-2xl border p-4 ${watchTone}`}>
                    <div className="flex items-center justify-between">
                      <p className={isDark ? "text-sm text-orange-200" : "text-sm text-rose-600"}>카테고리</p>
                      <span className={isDark ? "rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300" : "rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"}>{w.badge}</span>
                    </div>
                    <h2 className={isDark ? "mt-1 text-xl font-bold text-slate-100" : "mt-1 text-xl font-bold text-slate-800"}>{emojiForCard(w.id)} {w.title}</h2>
                    <p className={isDark ? "mt-1 text-xs text-slate-300" : "mt-1 text-xs text-slate-500"}>{w.subtitle}</p>
                    <p className={isDark ? "mt-2 text-sm text-slate-100" : "mt-2 text-sm text-slate-700"}>{w.summary}</p>
                    <p className={isDark ? "mt-2 text-[11px] text-slate-300" : "mt-2 text-[11px] text-slate-500"}>업데이트: {new Date(w.updatedAt).toLocaleTimeString()}</p>
                  </article>
                );

                const wrapped = isJobs ? (
                  <Link href="/jobs" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "living-cost" ? (
                  <Link href="/watchlists/living-cost" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "fortune" ? (
                  <Link href="/watchlists/fortune" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "lunch" ? (
                  <Link href="/watchlists/lunch" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "dinner-spots" ? (
                  <Link href="/watchlists/dinner-spots" className="block transition hover:scale-[1.01]">{cardBody}</Link>
                ) : w.id === "meme" ? (
                  <a href={memeOfDay.url} target="_blank" rel="noreferrer" className="block transition hover:scale-[1.01]">{cardBody}</a>
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
