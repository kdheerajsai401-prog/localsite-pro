import { NextRequest, NextResponse } from "next/server";
import { db, leads } from "@/db";
import { desc } from "drizzle-orm";
import type { NewLead } from "@/db/schema";

export async function GET() {
  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));
  return NextResponse.json({ data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { businessName, businessType, address, city, phone, websiteUrl, notes } = body;

  if (!businessName || typeof businessName !== "string" || businessName.trim().length === 0) {
    return NextResponse.json({ error: "businessName is required" }, { status: 400 });
  }

  const newLead: NewLead = {
    businessName: businessName.trim(),
    businessType: businessType || null,
    address: address || null,
    city: city || null,
    phone: phone || null,
    websiteUrl: websiteUrl || null,
    notes: notes || null,
    status: "new",
  };

  const [created] = await db.insert(leads).values(newLead).returning();
  return NextResponse.json({ data: created }, { status: 201 });
}
