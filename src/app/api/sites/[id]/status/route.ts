import { NextRequest, NextResponse } from "next/server";
import { db, sites, leads } from "@/db";
import { eq } from "drizzle-orm";

const VERCEL_API = "https://api.vercel.com";

// Poll Vercel status for an in-progress deployment and update the DB
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If not deploying, return current state
  if (site.status !== "deploying" || !site.vercelDeployId) {
    return NextResponse.json({ data: site });
  }

  const token = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID || undefined;
  if (!token) return NextResponse.json({ data: site });

  // Check Vercel
  const url = new URL(`${VERCEL_API}/v13/deployments/${site.vercelDeployId}`);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return NextResponse.json({ data: site });

  const vercelData = await res.json();
  const readyState: string = vercelData.readyState ?? vercelData.status;

  if (readyState === "READY") {
    const previewUrl = `https://${vercelData.url}`;
    const [updated] = await db
      .update(sites)
      .set({ status: "live", previewUrl, updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();

    // Advance lead to deployed
    await db
      .update(leads)
      .set({ status: "deployed", updatedAt: new Date() })
      .where(eq(leads.id, site.leadId));

    return NextResponse.json({ data: updated });
  }

  if (readyState === "ERROR" || readyState === "CANCELED") {
    const [updated] = await db
      .update(sites)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(sites.id, id))
      .returning();
    return NextResponse.json({ data: updated });
  }

  // Still building
  return NextResponse.json({ data: site });
}
