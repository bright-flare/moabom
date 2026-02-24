import fs from "node:fs";
import path from "node:path";
import { JobItem } from "./types";
import { sampleJobs } from "./sample-data";
import { getSupabaseServerClient, hasSupabase } from "./supabase";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "jobs.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(sampleJobs, null, 2), "utf-8");
  }
}

function fileGetJobs(): JobItem[] {
  ensureFile();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw) as JobItem[];
}

function fileUpdateJob(id: string, patch: Partial<Pick<JobItem, "status" | "note">>): JobItem | null {
  const jobs = fileGetJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx < 0) return null;
  jobs[idx] = { ...jobs[idx], ...patch };
  fs.writeFileSync(dataFile, JSON.stringify(jobs, null, 2), "utf-8");
  return jobs[idx];
}

export async function getJobs(): Promise<JobItem[]> {
  if (!hasSupabase) return fileGetJobs();

  const supabase = getSupabaseServerClient();
  if (!supabase) return fileGetJobs();

  const { data, error } = await supabase
    .from("jobs")
    .select("id,source,title,url,collected_at,status,note")
    .order("collected_at", { ascending: false });

  if (error || !data) return fileGetJobs();

  return data.map((row) => ({
    id: row.id,
    source: row.source,
    title: row.title,
    url: row.url,
    collectedAt: row.collected_at,
    status: row.status,
    note: row.note || "",
  })) as JobItem[];
}

export async function updateJob(
  id: string,
  patch: Partial<Pick<JobItem, "status" | "note">>
): Promise<JobItem | null> {
  if (!hasSupabase) return fileUpdateJob(id, patch);

  const supabase = getSupabaseServerClient();
  if (!supabase) return fileUpdateJob(id, patch);

  const updates: { status?: string; note?: string } = {};
  if (patch.status) updates.status = patch.status;
  if (typeof patch.note === "string") updates.note = patch.note;

  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select("id,source,title,url,collected_at,status,note")
    .single();

  if (error || !data) return fileUpdateJob(id, patch);

  return {
    id: data.id,
    source: data.source,
    title: data.title,
    url: data.url,
    collectedAt: data.collected_at,
    status: data.status,
    note: data.note || "",
  } as JobItem;
}
