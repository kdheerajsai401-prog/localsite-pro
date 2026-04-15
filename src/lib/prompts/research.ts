export function buildResearchPrompt(params: {
  businessName: string;
  businessType: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  notes: string | null;
}): string {
  const { businessName, businessType, city, address, phone, websiteUrl, notes } = params;

  const context = [
    `Business name: ${businessName}`,
    businessType ? `Business type: ${businessType}` : null,
    city ? `City: ${city}` : null,
    address ? `Address: ${address}` : null,
    phone ? `Phone: ${phone}` : null,
    websiteUrl ? `Existing website: ${websiteUrl}` : null,
    notes ? `Notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are helping build a professional website for a local business.

Use the web_search tool to look up this business and find their REAL services, what they actually do, and any details about them. Do not guess or invent services — find what they truly offer.

${context}

Search for the business by name and city/address. Look for their Google listing, website, Facebook, Yelp, or any directory listing. Find:
- Their actual services (exactly what they offer, not generic guesses)
- How they describe themselves
- Their tone/vibe (professional, warm and friendly, or bold/edgy)

After searching, return a JSON object with exactly this shape (no extra fields, no markdown):
{
  "services": ["real service 1", "real service 2", "real service 3"],
  "description": "2-3 sentence description of this specific business based on what you found",
  "tagline": "Short punchy tagline under 10 words that fits this business",
  "tone": "professional" | "friendly" | "bold"
}

Guidelines:
- services: Use ONLY services you actually found for this business. 3-6 items.
- description: Based on real info found. Write as if for their About page — warm, confident, customer-focused.
- tagline: Something this specific business would actually use. No clichés.
- tone: Match the business. Medical/legal/financial = professional. Salon/restaurant/retail = friendly. Barber/auto/construction = bold.

Return only the JSON object. No explanation, no markdown, no code blocks.`;
}
