import { NextRequest, NextResponse } from "next/server";
import { db, leads, sites, outreach, businessProfiles } from "@/db";
import { eq, desc } from "drizzle-orm";
import { getAnthropicClient } from "@/lib/claude";
import { buildOutreachPrompt } from "@/lib/prompts/outreach";
import type { NewOutreach } from "@/db/schema";

// GET — fetch all outreach drafts for this lead
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const rows = await db
    .select()
    .from(outreach)
    .where(eq(outreach.leadId, leadId))
    .orderBy(desc(outreach.createdAt));
  return NextResponse.json({ data: rows });
}

// POST — generate a new email draft via Claude
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Need a deployed site to reference in the email
  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.leadId, leadId))
    .limit(1);

  if (!site || !site.previewUrl) {
    return NextResponse.json(
      { error: "Deploy a site first — the email needs a preview URL to include" },
      { status: 422 }
    );
  }

  // Get contact email from profile if available
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.leadId, leadId))
    .limit(1);

  const prompt = buildOutreachPrompt({
    businessName: lead.businessName,
    city: lead.city,
    businessType: lead.businessType,
    previewUrl: site.previewUrl,
  });

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: { subject: string; body: string } = { subject: "", body: rawText };
  try {
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // keep raw text as body
  }

  const newOutreach: NewOutreach = {
    leadId,
    siteId: site.id,
    recipientEmail: profile?.contactEmail ?? null,
    subject: parsed.subject || `Free website built for ${lead.businessName}`,
    body: parsed.body || rawText,
    status: "draft",
    templateLabel: "cold_intro_v1",
  };

  const [created] = await db.insert(outreach).values(newOutreach).returning();

  // Advance lead status
  if (lead.status === "deployed") {
    await db
      .update(leads)
      .set({ status: "outreach_drafted", updatedAt: new Date() })
      .where(eq(leads.id, leadId));
  }

  return NextResponse.json({ data: created }, { status: 201 });
}

// PATCH — update draft fields (subject, body, recipientEmail)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body = await req.json();
  const { outreachId, subject, emailBody, recipientEmail } = body;

  if (!outreachId) {
    return NextResponse.json({ error: "outreachId required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (subject !== undefined) updates.subject = subject;
  if (emailBody !== undefined) updates.body = emailBody;
  if (recipientEmail !== undefined) updates.recipientEmail = recipientEmail;

  const [updated] = await db
    .update(outreach)
    .set(updates)
    .where(eq(outreach.id, outreachId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
