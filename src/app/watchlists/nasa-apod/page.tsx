"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Apod {
  date: string;
  title: string;
  url: string;
  hdurl?: string;
  explanation?: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
}

export default function NasaApodPage() {
  const [data, setData] = useState<Apod | null>(null);

  async function load() {
    const res = await fetch("/api/watchlists/nasa-apod", { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch("/api/watchlists/nasa-apod", { cache: "no-store" });
      const json = await res.json();
      if (mounted) setData(json);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const imageSrc = data?.media_type === "image" ? data.url : data?.thumbnail_url;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="rounded-2xl border border-indigo-300/30 bg-indigo-300/10 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">NASA 우주사진 모아봄</h1>
              <p className="text-sm text-indigo-100/80">APOD 데일리 수집</p>
            </div>
            <button onClick={load} className="rounded-lg border border-indigo-200/40 bg-indigo-200/20 px-3 py-2 text-sm">새로고침</button>
          </div>
        </div>

        {data && imageSrc && (
          <div className="overflow-hidden rounded-2xl border border-indigo-200/30 bg-black/30">
            <div className="relative aspect-video w-full">
              <Image src={imageSrc} alt={data.title} fill className="object-cover" sizes="100vw" />
            </div>
            <div className="space-y-2 p-4">
              <h2 className="text-xl font-semibold">{data.title}</h2>
              <p className="text-xs text-indigo-100/70">{data.date}</p>
              <p className="text-sm text-slate-200">{data.explanation?.slice(0, 280)}...</p>
              <a href={data.hdurl || data.url} target="_blank" rel="noreferrer" className="inline-block rounded-lg border border-indigo-200/40 bg-indigo-200/10 px-3 py-2 text-sm">
                원본 보기
              </a>
            </div>
          </div>
        )}

        <Link href="/" className="inline-block rounded-lg border border-slate-500/40 bg-white/10 px-3 py-2 text-sm">메인으로</Link>
      </div>
    </main>
  );
}
