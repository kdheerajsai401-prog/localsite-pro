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
    websiteUrl ? `Existing website: ${websiteUrl}` : "No existing website",
    notes ? `Notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are helping build a professional website for a local business. Based on the information below, generate a realistic business profile.

${context}

Return a JSON object with exactly this shape (no extra fields, no markdown):
{
  "services": ["service 1", "service 2", "service 3"],
  "description": "2-3 sentence professional description of this business",
  "tagline": "Short punchy tagline under 10 words",
  "tone": "professional" | "friendly" | "bold"
}

Guidelines:
- services: 3-6 realistic services this type of business typically offers. Be specific to the business type, not generic.
- description: Write as if for their About section. Warm, confident, focused on the customer.
- tagline: Something a real business owner would be proud of. No clichés like "Your trusted partner" or "Quality you can count on".
- tone: Choose based on business type. Construction/auto/barber = bold. Clinic/dental/professional = professional. Restaurant/convenience/retail = friendly.

Return only the JSON object. No explanation, no markdown, no code blocks.`;
}
