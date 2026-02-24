import { NextRequest, NextResponse } from "next/server";
import { updateJob } from "@/lib/jobs-repo";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const { id } = await params;
  const updated = await updateJob(id, {
    status: body.status,
    note: body.note,
  });

  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ job: updated });
}
