import { NextRequest, NextResponse } from "next/server";
import { db, outreach, leads } from "@/db";
import { eq } from "drizzle-orm";

// POST — mark an outreach draft as sent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const { outreachId, sendMethod } = await req.json();

  if (!outreachId) {
    return NextResponse.json({ error: "outreachId required" }, { status: 400 });
  }

  const now = new Date();
  const [updated] = await db
    .update(outreach)
    .set({
      status: "sent",
      sentAt: now,
      sendMethod: sendMethod ?? "copy_paste",
    })
    .where(eq(outreach.id, outreachId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Advance lead status to 'sent'
  await db
    .update(leads)
    .set({ status: "sent", updatedAt: now })
    .where(eq(leads.id, leadId));

  return NextResponse.json({ data: updated });
}
