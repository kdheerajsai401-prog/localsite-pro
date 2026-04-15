import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  websiteUrl: text("website_url"),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  contactEmail: text("contact_email"),
  services: text("services").array().notNull().default([]),
  description: text("description"),
  tagline: text("tagline"),
  tone: text("tone"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  rawOutput: jsonb("raw_output"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  templateId: text("template_id").notNull(),
  templateVariant: text("template_variant"),
  content: jsonb("content"),
  previewUrl: text("preview_url"),
  vercelDeployId: text("vercel_deploy_id"),
  vercelProjectId: text("vercel_project_id"),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const outreach = pgTable("outreach", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  siteId: uuid("site_id").references(() => sites.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email"),
  subject: text("subject"),
  body: text("body"),
  status: text("status").notNull().default("draft"),
  sendMethod: text("send_method"),
  templateLabel: text("template_label"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LeadRow = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type BusinessProfileRow = typeof businessProfiles.$inferSelect;
export type NewBusinessProfile = typeof businessProfiles.$inferInsert;
export type SiteRow = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type OutreachRow = typeof outreach.$inferSelect;
export type NewOutreach = typeof outreach.$inferInsert;
