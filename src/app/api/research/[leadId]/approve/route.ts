import { NextRequest, NextResponse } from "next/server";
import { db, leads, businessProfiles } from "@/db";
import { eq } from "drizzle-orm";

// POST — approve the business profile, advance lead status to 'researched'
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.leadId, leadId))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "No profile to approve" }, { status: 404 });
  }

  const now = new Date();

  const [updatedProfile] = await db
    .update(businessProfiles)
    .set({ isVerified: true, verifiedAt: now })
    .where(eq(businessProfiles.leadId, leadId))
    .returning();

  const [updatedLead] = await db
    .update(leads)
    .set({ status: "researched", updatedAt: now })
    .where(eq(leads.id, leadId))
    .returning();

  return NextResponse.json({ data: { profile: updatedProfile, lead: updatedLead } });
}
