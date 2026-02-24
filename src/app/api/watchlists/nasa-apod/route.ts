import { NextResponse } from "next/server";
import { getNasaApod } from "@/lib/nasa-service";

export async function GET() {
  const apod = await getNasaApod();
  return NextResponse.json(apod);
}
