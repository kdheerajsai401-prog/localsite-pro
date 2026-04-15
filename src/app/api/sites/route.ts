import { NextRequest, NextResponse } from "next/server";
import { db, sites } from "@/db";
import { eq } from "drizzle-orm";

// GET /api/sites?leadId=xxx — fetch site for a lead
export async function GET(req: NextRequest) {
  const leadId = req.nextUrl.searchParams.get("leadId");
  if (!leadId) {
    return NextResponse.json({ error: "leadId is required" }, { status: 400 });
  }

  const [site] = await db
    .select()
    .from(sites)
    .where(eq(sites.leadId, leadId))
    .limit(1);

  return NextResponse.json({ data: site ?? null });
}
