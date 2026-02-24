import { NextResponse } from "next/server";
import { getLivingCostSnapshot } from "@/lib/living-cost-service";

export async function GET() {
  return NextResponse.json(await getLivingCostSnapshot());
}
