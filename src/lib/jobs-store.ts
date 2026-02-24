import fs from "node:fs";
import path from "node:path";
import { JobItem } from "./types";
import { sampleJobs } from "./sample-data";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "jobs.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(sampleJobs, null, 2), "utf-8");
  }
}

export function getJobs(): JobItem[] {
  ensureFile();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw) as JobItem[];
}

export function updateJob(id: string, patch: Partial<Pick<JobItem, "status" | "note">>): JobItem | null {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx < 0) return null;
  jobs[idx] = { ...jobs[idx], ...patch };
  fs.writeFileSync(dataFile, JSON.stringify(jobs, null, 2), "utf-8");
  return jobs[idx];
}
