import { NextRequest, NextResponse } from "next/server";
import { db, leads, businessProfiles, sites } from "@/db";
import { eq } from "drizzle-orm";
import { getAnthropicClient } from "@/lib/claude";
import { buildContentPrompt, applyLeadDefaults } from "@/lib/prompts/content";
import type { NewSite } from "@/db/schema";
import type { SiteConfig, TemplateId } from "@/types";

export async function POST(req: NextRequest) {
  const { leadId, templateId } = await req.json();

  if (!leadId || !templateId) {
    return NextResponse.json({ error: "leadId and templateId are required" }, { status: 400 });
  }

  const validTemplates: TemplateId[] = ["bold", "clean", "warm"];
  if (!validTemplates.includes(templateId)) {
    return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
  }

  // Fetch lead
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId));
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // Fetch verified profile
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.leadId, leadId))
    .limit(1);

  if (!profile || !profile.isVerified) {
    return NextResponse.json(
      { error: "Business profile must be approved before generating site content" },
      { status: 422 }
    );
  }

  // Call Haiku to fill SiteConfig
  const prompt = buildContentPrompt(lead, profile, templateId);
  const client = getAnthropicClient();

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";

  let parsed: Partial<SiteConfig> = {};
  try {
    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    // Fall through — applyLeadDefaults fills in everything
  }

  const siteConfig = applyLeadDefaults(parsed, lead, templateId);

  // Delete any existing draft site for this lead+template combo
  await db
    .delete(sites)
    .where(eq(sites.leadId, leadId));

  const newSite: NewSite = {
    leadId,
    templateId,
    content: siteConfig,
    status: "draft",
  };

  const [created] = await db.insert(sites).values(newSite).returning();

  // Advance lead to site_ready
  await db
    .update(leads)
    .set({ status: "site_ready", updatedAt: new Date() })
    .where(eq(leads.id, leadId));

  return NextResponse.json({ data: created }, { status: 201 });
}
