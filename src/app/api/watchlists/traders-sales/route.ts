import { NextResponse } from "next/server";
import { getTradersDeals } from "@/lib/traders-service";

export async function GET() {
  const data = await getTradersDeals();
  return NextResponse.json(data);
}
