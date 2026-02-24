import { NextResponse } from "next/server";
import { getJobs } from "@/lib/jobs-repo";

export async function GET() {
  return NextResponse.json({ jobs: await getJobs() });
}
