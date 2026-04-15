// Lead status flow
export type LeadStatus =
  | "new"
  | "researched"
  | "site_ready"
  | "deployed"
  | "outreach_drafted"
  | "sent"
  | "converted"
  | "lost";

export type BusinessType =
  | "barber"
  | "clinic"
  | "construction"
  | "convenience"
  | "restaurant"
  | "auto"
  | "retail"
  | "other";

export type TemplateId = "bold" | "clean" | "warm";
export type BusinessTone = "professional" | "friendly" | "bold";

export interface Lead {
  id: string;
  businessName: string;
  businessType: BusinessType | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  websiteUrl: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessProfile {
  id: string;
  leadId: string;
  contactEmail: string | null;
  services: string[];
  description: string | null;
  tagline: string | null;
  tone: BusinessTone | null;
  isVerified: boolean;
  verifiedAt: Date | null;
  rawOutput: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Site {
  id: string;
  leadId: string;
  templateId: TemplateId;
  templateVariant: string | null;
  content: SiteConfig | null;
  previewUrl: string | null;
  vercelDeployId: string | null;
  vercelProjectId: string | null;
  status: "draft" | "deploying" | "live" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Outreach {
  id: string;
  leadId: string;
  siteId: string;
  recipientEmail: string | null;
  subject: string | null;
  body: string | null;
  status: "draft" | "sent";
  sendMethod: "copy_paste" | "resend" | null;
  templateLabel: string | null;
  sentAt: Date | null;
  createdAt: Date;
}

// Single source of truth for site content — used by templates, API, and DB
export interface SiteConfig {
  businessName: string;
  city: string;
  phone: string;
  address: string;
  headline: string;
  subheadline: string;
  cta: string;
  about: string;
  services: Array<{ name: string; description: string }>;
  primaryColor: string;
  accentColor: string;
  metaTitle: string;
  metaDescription: string;
}

// API response shapes
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: string;
}
