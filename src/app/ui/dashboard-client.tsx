"use client";

import { useMemo, useState } from "react";
import { JobItem, JobStatus, Source } from "@/lib/types";
import { sourceLabel } from "@/lib/sourceLabel";

type DateFilter = "today" | "3days";
type StatusFilter = "all" | JobStatus;

export default function DashboardClient({ initialJobs }: { initialJobs: JobItem[] }) {
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [source, setSource] = useState<"all" | Source>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
      .filter((j) => (statusFilter === "all" ? true : j.status === statusFilter))
      .filter((j) => new Date(j.collectedAt) >= start)
      .sort((a, b) => +new Date(b.collectedAt) - +new Date(a.collectedAt));
  }, [jobs, source, dateFilter, statusFilter]);

  const summary = useMemo(() => {
    const base = { total: filtered.length, bookmarked: 0, saramin: 0, jobkorea: 0, work24: 0 };
    filtered.forEach((j) => {
      if (j.status === "bookmarked") base.bookmarked += 1;
      base[j.source] += 1;
    });
    return base;
  }, [filtered]);

  async function patchJob(id: string, patch: Partial<Pick<JobItem, "status" | "note">>) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    setJobs((prev) => prev.map((j) => (j.id === id ? json.job : j)));
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold">🔥 MOABOM 대시보드</h1>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Card label="총 공고" value={summary.total} />
          <Card label="북마크" value={summary.bookmarked} />
          <Card label="사람인" value={summary.saramin} />
          <Card label="잡코리아" value={summary.jobkorea} />
          <Card label="고용24" value={summary.work24} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap gap-2">
          <Select label="플랫폼" value={source} onChange={(v) => setSource(v as "all" | Source)} options={["all", "saramin", "jobkorea", "work24"]} />
          <Select label="기간" value={dateFilter} onChange={(v) => setDateFilter(v as DateFilter)} options={["today", "3days"]} />
          <Select label="상태" value={statusFilter} onChange={(v) => setStatusFilter(v as StatusFilter)} options={["all", "normal", "bookmarked", "hidden"]} />
        </section>

        <section className="space-y-3">
          {filtered.map((job) => (
            <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">{sourceLabel[job.source]} · {new Date(job.collectedAt).toLocaleString()}</div>
                  <a href={job.url} target="_blank" className="font-semibold text-blue-700 hover:underline" rel="noreferrer">
                    {job.title}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md bg-amber-100 px-2 py-1 text-xs" onClick={() => patchJob(job.id, { status: job.status === "bookmarked" ? "normal" : "bookmarked" })}>북마크</button>
                  <button className="rounded-md bg-slate-200 px-2 py-1 text-xs" onClick={() => patchJob(job.id, { status: job.status === "hidden" ? "normal" : "hidden" })}>제외</button>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  defaultValue={job.note || ""}
                  placeholder="메모"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  onBlur={(e) => patchJob(job.id, { note: e.target.value })}
                />
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="text-sm text-slate-500">조건에 맞는 공고가 없습니다.</p>}
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="text-sm">
      <span className="mr-2 text-slate-500">{label}</span>
      <select className="rounded-md border border-slate-300 bg-white px-2 py-1" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
