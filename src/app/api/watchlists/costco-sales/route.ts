import { NextResponse } from "next/server";
import { getCostcoDeals } from "@/lib/costco-service";

export async function GET() {
  const data = await getCostcoDeals();
  return NextResponse.json(data);
}
