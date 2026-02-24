import { NextResponse } from "next/server";
import { getLiveWatchlists } from "@/lib/watchlist-service";

export async function GET() {
  const watchlists = await getLiveWatchlists();
  return NextResponse.json({ watchlists });
}
