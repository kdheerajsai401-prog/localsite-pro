"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { ResearchPanel } from "@/components/research/ResearchPanel";
import { SiteBuilderPanel } from "@/components/sites/SiteBuilderPanel";
import { EmailDraftPanel } from "@/components/outreach/EmailDraftPanel";
import type { LeadRow } from "@/db/schema";
import type { LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

type Tab = "research" | "site" | "outreach";

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<LeadRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("research");

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.status === 404) {
      router.push("/leads");
      return;
    }
    const json = await res.json();
    setLead(json.data);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
    );
  }

  if (!lead) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "research", label: "Research" },
    { id: "site", label: "Site Builder" },
    { id: "outreach", label: "Outreach" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/leads")}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3"
        >
          ← Leads
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{lead.businessName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {[lead.city, lead.businessType].filter(Boolean).join(" · ") || "No details"}
            </p>
          </div>
          <LeadStatusBadge status={lead.status as LeadStatus} />
        </div>
      </div>

      {/* Lead info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Phone</span>
          <span className="text-gray-700">{lead.phone || "—"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Address</span>
          <span className="text-gray-700">{lead.address || "—"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Existing Site</span>
          {lead.websiteUrl ? (
            <a href={lead.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block">
              {lead.websiteUrl}
            </a>
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
        {lead.notes && (
          <div className="col-span-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Notes</span>
            <span className="text-gray-700">{lead.notes}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab panels */}
      {tab === "research" && <ResearchPanel leadId={lead.id} onProfileApproved={fetchLead} />}
      {tab === "site" && (
        <SiteBuilderPanel
          leadId={lead.id}
          isResearched={["researched", "site_ready", "deployed", "outreach_drafted", "sent", "converted"].includes(lead.status)}
          onDeployed={fetchLead}
        />
      )}
      {tab === "outreach" && (
        <EmailDraftPanel
          leadId={lead.id}
          isDeployed={["deployed", "outreach_drafted", "sent", "converted"].includes(lead.status)}
          onSent={fetchLead}
        />
      )}
    </div>
  );
}

