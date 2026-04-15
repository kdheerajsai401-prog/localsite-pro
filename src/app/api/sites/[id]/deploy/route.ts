import { NextRequest, NextResponse } from "next/server";
import { db, sites, leads } from "@/db";
import { eq } from "drizzle-orm";
import { deployTemplate } from "@/lib/vercel-deploy";
import type { SiteConfig } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  if (!site.content) {
    return NextResponse.json({ error: "Site has no content yet" }, { status: 422 });
  }

  // Mark as deploying immediately
  await db
    .update(sites)
    .set({ status: "deploying", updatedAt: new Date() })
    .where(eq(sites.id, id));

  try {
    const { deployId, deployUrl } = await deployTemplate(
      site.templateId,
      site.content as SiteConfig
    );

    // Vercel deployment is queued — update DB with deploy ID
    // The frontend polls /api/sites/[id]/status to track readiness
    await db
      .update(sites)
      .set({
        vercelDeployId: deployId,
        previewUrl: `https://${deployUrl}`,
        status: "deploying",
        updatedAt: new Date(),
      })
      .where(eq(sites.id, id));

    return NextResponse.json({ data: { deployId, deployUrl, status: "deploying" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deploy failed";
    await db
      .update(sites)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(sites.id, id));

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
