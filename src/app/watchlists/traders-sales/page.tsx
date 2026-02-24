"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DealData {
  updatedAt: string;
  total: number;
  items: { title: string; url: string }[];
}

export default function TradersSalesPage() {
  const [data, setData] = useState<DealData | null>(null);

  async function load() {
    const res = await fetch('/api/watchlists/traders-sales', { cache: 'no-store' });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch('/api/watchlists/traders-sales', { cache: 'no-store' });
      const json = await res.json();
      if (mounted) setData(json);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-yellow-50 to-orange-50 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">이마트 트레이더스 세일 모아봄</h1>
              <p className="text-sm text-slate-600">행사/기획전 페이지 기준 수집</p>
              {data && <p className="mt-1 text-xs text-slate-500">업데이트: {new Date(data.updatedAt).toLocaleString()} · 총 {data.total}건</p>}
            </div>
            <button onClick={load} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">새로고침</button>
          </div>
        </div>

        <ul className="space-y-2">
          {(data?.items || []).map((it, idx) => (
            <li key={`${it.title}-${idx}`} className="rounded-xl border border-amber-200 bg-white p-3 text-sm">
              <a href={it.url} target="_blank" rel="noreferrer" className="font-medium text-amber-700 hover:underline">
                {idx + 1}. {it.title}
              </a>
            </li>
          ))}
        </ul>

        <Link href="/" className="inline-block rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-sm shadow-sm hover:bg-white">메인으로</Link>
      </div>
    </main>
  );
}
