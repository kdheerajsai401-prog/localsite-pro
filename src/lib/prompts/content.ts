import type { SiteConfig } from "@/types";
import type { BusinessProfileRow } from "@/db/schema";
import type { LeadRow } from "@/db/schema";

const TEMPLATE_COLORS = {
  bold: { primaryColor: "#0f0f0f", accentColor: "#ea580c" },
  clean: { primaryColor: "#0f172a", accentColor: "#0ea5e9" },
  warm: { primaryColor: "#1c1917", accentColor: "#d97706" },
};

const ACCENT_HINTS = {
  bold: "a vivid, high-energy color — orange, red, yellow, or amber work well for dark high-contrast sites",
  clean: "a trustworthy, calm color — sky blue, teal, or slate blue work well for clinical/professional sites",
  warm: "a warm, inviting color — amber, orange, or golden yellow work well for neighbourhood businesses",
};

export function buildContentPrompt(
  lead: LeadRow,
  profile: BusinessProfileRow,
  templateId: string
): string {
  const colors = TEMPLATE_COLORS[templateId as keyof typeof TEMPLATE_COLORS] ?? TEMPLATE_COLORS.bold;
  const accentHint = ACCENT_HINTS[templateId as keyof typeof ACCENT_HINTS] ?? ACCENT_HINTS.bold;

  return `You are generating website content for a local business. Return a valid JSON object that matches the SiteConfig type exactly. No markdown, no explanation, just JSON.

Business details:
- Name: ${lead.businessName}
- Type: ${lead.businessType ?? "local business"}
- City: ${lead.city ?? ""}
- Phone: ${lead.phone ?? ""}
- Address: ${lead.address ?? ""}
- Profile description: ${profile.description ?? ""}
- Tagline: ${profile.tagline ?? ""}
- Services: ${(profile.services ?? []).join(", ")}
- Tone: ${profile.tone ?? "professional"}
- Template style: ${templateId} (${templateId === "bold" ? "dark, high-contrast, bold typography" : templateId === "clean" ? "white, minimal, trust-forward" : "warm, friendly, community-focused"})

Generate this JSON object:
{
  "businessName": "${lead.businessName}",
  "city": "${lead.city ?? ""}",
  "phone": "${lead.phone ?? ""}",
  "address": "${lead.address ?? ""}",
  "headline": "A compelling 3-8 word headline. Not generic. Specific to this business type. Bold, punchy.",
  "subheadline": "One sentence expanding on the headline. Specific, confident, customer-focused. Max 20 words.",
  "cta": "2-4 word call to action button text (e.g. 'Book Now', 'Call Today', 'Get a Quote')",
  "about": "${profile.description ?? "Write 2-3 sentences about this business. Warm, professional, customer-focused."}",
  "services": [
    ${(profile.services ?? []).slice(0, 6).map((s) => `{ "name": "${s}", "description": "One specific, benefit-focused sentence describing this service." }`).join(",\n    ")}
  ],
  "primaryColor": "${colors.primaryColor}",
  "accentColor": "Pick ${accentHint}. Return a hex code.",
  "metaTitle": "${lead.businessName} | ${lead.city ?? ""}",
  "metaDescription": "One sentence SEO description. 120-155 chars. Include city and main service."
}

Rules:
- headline: avoid clichés like "Your trusted partner" or "Quality you can count on"
- services descriptions: one specific sentence each, not generic
- accentColor: a real hex code, not a CSS variable
- Return only the JSON object`;
}

export function applyLeadDefaults(
  partial: Partial<SiteConfig>,
  lead: LeadRow,
  templateId: string
): SiteConfig {
  const colors = TEMPLATE_COLORS[templateId as keyof typeof TEMPLATE_COLORS] ?? TEMPLATE_COLORS.bold;
  return {
    businessName: lead.businessName,
    city: lead.city ?? "",
    phone: lead.phone ?? "",
    address: lead.address ?? "",
    headline: `Welcome to ${lead.businessName}`,
    subheadline: `Serving ${lead.city ?? "the area"} with quality ${lead.businessType ?? "services"}.`,
    cta: "Contact Us",
    about: "",
    services: [],
    primaryColor: colors.primaryColor,
    accentColor: colors.accentColor,
    metaTitle: `${lead.businessName} | ${lead.city ?? ""}`,
    metaDescription: `${lead.businessName} in ${lead.city ?? ""}. Call ${lead.phone ?? "us"} today.`,
    ...partial,
  };
}
