import { NextRequest, NextResponse } from "next/server";
import { db, sites } from "@/db";
import { eq } from "drizzle-orm";
import type { SiteConfig } from "@/types";

// GET a site record by site ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: site });
}

// PATCH — update content fields (user editing before deploy)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  // Merge partial content update
  const [existing] = await db.select().from(sites).where(eq(sites.id, id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const merged: SiteConfig = {
    ...(existing.content as SiteConfig),
    ...body.content,
  };

  const [updated] = await db
    .update(sites)
    .set({ content: merged, updatedAt: new Date() })
    .where(eq(sites.id, id))
    .returning();

  return NextResponse.json({ data: updated });
}
