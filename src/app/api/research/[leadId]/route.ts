import { NextRequest, NextResponse } from "next/server";
import { db, leads, businessProfiles } from "@/db";
import { eq } from "drizzle-orm";
import { getAnthropicClient } from "@/lib/claude";
import { buildResearchPrompt } from "@/lib/prompts/research";
import type { NewBusinessProfile } from "@/db/schema";

// GET — fetch existing profile for this lead
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.leadId, leadId))
    .limit(1);

  if (!profile) return NextResponse.json({ data: null });
  return NextResponse.json({ data: profile });
}

// POST — run Claude research, save profile (overwrite if exists)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const prompt = buildResearchPrompt({
    businessName: lead.businessName,
    businessType: lead.businessType,
    city: lead.city,
    address: lead.address,
    phone: lead.phone,
    websiteUrl: lead.websiteUrl,
    notes: lead.notes,
  });

  const client = getAnthropicClient();
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: {
    services: string[];
    description: string;
    tagline: string;
    tone: string;
  };

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Claude returned invalid JSON", raw: rawText },
      { status: 500 }
    );
  }

  // Delete any existing profile for this lead (re-research replaces it)
  await db
    .delete(businessProfiles)
    .where(eq(businessProfiles.leadId, leadId));

  const newProfile: NewBusinessProfile = {
    leadId,
    services: parsed.services ?? [],
    description: parsed.description ?? null,
    tagline: parsed.tagline ?? null,
    tone: parsed.tone ?? null,
    isVerified: false,
    rawOutput: { rawText, parsedAt: new Date().toISOString() },
  };

  const [created] = await db
    .insert(businessProfiles)
    .values(newProfile)
    .returning();

  return NextResponse.json({ data: created }, { status: 201 });
}

// PATCH — update individual profile fields (user editing before approval)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await params;
  const body = await req.json();

  const allowed = ["contactEmail", "services", "description", "tagline", "tone"];
  const updates: Record<string, unknown> = {};
  for (const field of allowed) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const [updated] = await db
    .update(businessProfiles)
    .set(updates)
    .where(eq(businessProfiles.leadId, leadId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ data: updated });
}
