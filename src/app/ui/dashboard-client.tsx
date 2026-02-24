"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { JobItem, Source } from "@/lib/types";
import { sourceLabel } from "@/lib/sourceLabel";

type DateFilter = "today" | "3days";

export default function DashboardClient({ initialJobs }: { initialJobs: JobItem[] }) {
  const [jobs] = useState<JobItem[]>(initialJobs);
  const [source, setSource] = useState<"all" | Source>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [openShareId, setOpenShareId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const saved = window.localStorage.getItem("moabom-theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });
  const isDark = theme === "dark";

  useEffect(() => {
    window.localStorage.setItem("moabom-theme", theme);
  }, [theme]);

  const filtered = useMemo(() => {
    const now = new Date();
    const start = new Date();
    if (dateFilter === "today") {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(now.getDate() - 2);
      start.setHours(0, 0, 0, 0);
    }

    return jobs
      .filter((j) => (source === "all" ? true : j.source === source))
      .filter((j) => new Date(j.collectedAt) >= start)
      .sort((a, b) => +new Date(b.collectedAt) - +new Date(a.collectedAt));
  }, [jobs, source, dateFilter]);

  const summary = useMemo(() => {
    const base = { total: filtered.length, saramin: 0, jobkorea: 0, work24: 0 };
    filtered.forEach((j) => {
      base[j.source] += 1;
    });
    return base;
  }, [filtered]);

  function openShare(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function shareTelegram(job: JobItem) {
    const text = encodeURIComponent(job.title);
    const url = encodeURIComponent(job.url);
    openShare(`https://t.me/share/url?url=${url}&text=${text}`);
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  async function shareInstagram(job: JobItem) {
    const text = `${job.title}\n${job.url}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("인스타 공유용 텍스트를 복사했어");
    } catch {
      showToast("복사에 실패했어. 다시 시도해줘");
    }
    openShare("https://www.instagram.com/");
  }

  function shareX(job: JobItem) {
    const text = encodeURIComponent(job.title);
    const url = encodeURIComponent(job.url);
    openShare(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  }

  async function copyUrl(job: JobItem) {
    try {
      await navigator.clipboard.writeText(job.url);
      showToast("주소를 복사해봄");
    } catch {
      showToast("주소 복사에 실패했어");
    }
  }

  return (
    <main className={isDark ? "min-h-screen bg-[radial-gradient(circle_at_top,#312e81,#0f172a)] text-slate-100" : "min-h-screen bg-[radial-gradient(circle_at_top,#fff1f2,#eef2ff)] text-slate-800"}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
        <div className={isDark ? "rounded-2xl border border-indigo-200/20 bg-indigo-200/10 p-5 shadow-xl shadow-indigo-900/30 backdrop-blur" : "rounded-2xl border border-rose-200 bg-white/95 p-5 shadow-xl shadow-rose-100"}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300">MOABOM</p>
              <h1 className="mt-1 text-2xl font-bold md:text-3xl">일자리 모아봄</h1>
              <p className="mt-1 text-sm text-slate-400">채용 정보를 빠르게 확인하고 SNS로 공유해요.</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="테마 전환"
                title="테마 전환"
                className={isDark ? "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-base hover:bg-white/20" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm hover:bg-slate-50"}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <Link href="/" className={isDark ? "rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/20" : "rounded-lg border border-rose-200 bg-rose-100 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-200"}>
                메인으로
              </Link>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          <Card label="총 공고" value={summary.total} isDark={isDark} />
          <Card label="사람인" value={summary.saramin} isDark={isDark} />
          <Card label="잡코리아" value={summary.jobkorea} isDark={isDark} />
          <Card label="고용24" value={summary.work24} isDark={isDark} />
        </section>

        <section className={isDark ? "flex flex-wrap gap-2 rounded-2xl border border-indigo-200/20 bg-indigo-200/10 p-4" : "flex flex-wrap gap-2 rounded-2xl border border-indigo-200 bg-white/95 p-4"}>
          <Select label="플랫폼" value={source} onChange={(v) => setSource(v as "all" | Source)} options={["all", "saramin", "jobkorea", "work24"]} isDark={isDark} />
          <Select label="기간" value={dateFilter} onChange={(v) => setDateFilter(v as DateFilter)} options={["today", "3days"]} isDark={isDark} />
        </section>

        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
          {filtered.map((job) => {
            const tone = getSourceTone(job.source, isDark);
            return (
            <article key={job.id} className={`${tone.card} relative rounded-xl p-3 shadow-sm`}>
              <div className="space-y-2">
                <div className={isDark ? "flex items-center gap-2 text-[11px] text-slate-400" : "flex items-center gap-2 text-[11px] text-slate-500"}>
                  <span className={`${tone.badge} rounded px-1.5 py-0.5`}>{sourceLabel[job.source]}</span>
                  <span className="truncate">{new Date(job.collectedAt).toLocaleDateString()}</span>
                </div>

                <a
                  href={job.url}
                  target="_blank"
                  className={isDark ? "line-clamp-3 block text-sm font-semibold leading-5 text-sky-300 decoration-sky-400/60 underline-offset-4 transition hover:text-sky-200 hover:underline" : "line-clamp-3 block text-sm font-semibold leading-5 text-blue-700 decoration-blue-500/50 underline-offset-4 transition hover:text-blue-600 hover:underline"}
                  rel="noreferrer"
                >
                  {job.title}
                </a>

                <div className="pt-1">
                  <button
                    className={isDark ? "rounded-md border border-fuchsia-300/40 bg-fuchsia-400/15 px-2.5 py-1.5 text-[11px] font-medium text-fuchsia-200 hover:bg-fuchsia-400/25" : "rounded-md border border-fuchsia-200 bg-fuchsia-100 px-2.5 py-1.5 text-[11px] font-semibold text-fuchsia-700 hover:bg-fuchsia-200"}
                    onClick={() => setOpenShareId((prev) => (prev === job.id ? null : job.id))}
                  >
                    공유하기
                  </button>
                </div>

                {openShareId === job.id && (
                  <div className={isDark ? "mt-2 rounded-xl border border-white/15 bg-slate-900/95 p-2 shadow-2xl backdrop-blur md:absolute md:left-3 md:right-3 md:top-24 md:z-20" : "mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl md:absolute md:left-3 md:right-3 md:top-24 md:z-20"}>
                    <div className="grid grid-cols-3 gap-2 pb-2">
                      <IconButton label="텔레그램" icon={<TelegramIcon />} onClick={() => shareTelegram(job)} isDark={isDark} />
                      <IconButton label="인스타" icon={<InstagramIcon />} onClick={() => shareInstagram(job)} isDark={isDark} />
                      <IconButton label="X" icon={<XIcon />} onClick={() => shareX(job)} isDark={isDark} />
                    </div>
                    <button
                      className={isDark ? "w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-slate-200 hover:bg-white/10" : "w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100"}
                      onClick={() => copyUrl(job)}
                    >
                      주소 복사하기
                    </button>
                  </div>
                )}
              </div>
            </article>
            );
          })}
          {filtered.length === 0 && <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>조건에 맞는 공고가 없습니다.</p>}
        </section>

        {toast && (
          <div className={isDark ? "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/30 bg-emerald-500/25 px-5 py-2 text-sm font-semibold text-emerald-50 shadow-2xl backdrop-blur" : "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/40 bg-emerald-100 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-2xl"}>
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ label, value, isDark }: { label: string; value: number; isDark: boolean }) {
  return (
    <div className={isDark ? "rounded-xl border border-indigo-200/20 bg-indigo-200/10 p-3" : "rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-rose-50 p-3"}>
      <div className={isDark ? "text-xs text-indigo-100/70" : "text-xs text-violet-600"}>{label}</div>
      <div className={isDark ? "text-xl font-bold text-white" : "text-xl font-bold text-violet-900"}>{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options, isDark }: { label: string; value: string; onChange: (v: string) => void; options: string[]; isDark: boolean }) {
  return (
    <label className={isDark ? "text-sm text-slate-200" : "text-sm text-slate-800"}>
      <span className={isDark ? "mr-2 text-slate-400" : "mr-2 text-slate-500"}>{label}</span>
      <select
        className={isDark ? "rounded-lg border border-white/15 bg-slate-900 px-2 py-1" : "rounded-lg border border-slate-300 bg-white px-2 py-1"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function getSourceTone(source: Source, isDark: boolean) {
  if (source === "saramin") {
    return isDark
      ? { card: "border border-sky-300/35 bg-sky-400/10", badge: "bg-sky-300/20 text-sky-100" }
      : { card: "border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50", badge: "bg-sky-100 text-sky-700" };
  }
  if (source === "jobkorea") {
    return isDark
      ? { card: "border border-fuchsia-300/35 bg-fuchsia-400/10", badge: "bg-fuchsia-300/20 text-fuchsia-100" }
      : { card: "border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-rose-50", badge: "bg-fuchsia-100 text-fuchsia-700" };
  }
  return isDark
    ? { card: "border border-emerald-300/35 bg-emerald-400/10", badge: "bg-emerald-300/20 text-emerald-100" }
    : { card: "border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50", badge: "bg-emerald-100 text-emerald-700" };
}

function IconButton({ label, icon, onClick, isDark }: { label: string; icon: ReactNode; onClick: () => void; isDark: boolean }) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={isDark ? "flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/10" : "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"}
    >
      <span className="flex h-8 w-8 items-center justify-center">{icon}</span>
    </button>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#27A7E7" />
      <path d="M17.7 7.4 6.9 11.5c-.7.3-.7 1.2 0 1.5l2.8 1 1 3c.2.5.8.7 1.2.3l1.6-1.6 2.8 2c.5.4 1.2.1 1.3-.6l1.8-8.7c.1-.6-.4-1.1-1-1z" fill="#fff" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#igGrad)" />
      <circle cx="12" cy="12" r="4" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="1.2" fill="#fff" />
      <defs>
        <linearGradient id="igGrad" x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#111827" />
      <path d="M9.1 7.2h2.4l2 2.8 2.3-2.8h1.9l-3.4 4.2 3.7 5.4h-2.4l-2.3-3.2-2.7 3.2H8.6l3.8-4.6-3.3-5z" fill="#fff" />
    </svg>
  );
}
