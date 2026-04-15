export function buildOutreachPrompt(params: {
  businessName: string;
  contactName?: string;
  city: string | null;
  businessType: string | null;
  previewUrl: string;
  senderName?: string;
}): string {
  const { businessName, city, businessType, previewUrl } = params;

  return `You are helping write a short, genuine cold outreach email for a web design pitch. The sender built a free demo website for the business and is reaching out to offer it.

Business details:
- Name: ${businessName}
- Type: ${businessType ?? "local business"}
- City: ${city ?? ""}
- Demo site URL: ${previewUrl}

Write a cold email with this structure:
1. Opening line — mention you built a free demo website for them specifically (not generic)
2. One sentence on what the site includes / what it looks like
3. The demo URL on its own line so it's easy to click
4. A soft close — invite them to reply if they want to take it live, no pressure

Rules:
- 4-5 sentences total. Short. Conversational. Not salesy.
- Do NOT use phrases like "I hope this email finds you well", "reach out", "touch base", "leverage", "synergy"
- Address them by business name, not "Dear Sir/Madam"
- The tone should feel like a real person, not a template
- Subject line should be specific and curiosity-driven, under 8 words
- Return JSON only, no markdown:

{
  "subject": "subject line here",
  "body": "full email body here"
}`;
}
