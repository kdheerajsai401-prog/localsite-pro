import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const STATUS_CONFIG: Record<LeadStatus, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-gray-100 text-gray-700" },
  researched: { label: "Researched", classes: "bg-blue-100 text-blue-700" },
  site_ready: { label: "Site Ready", classes: "bg-yellow-100 text-yellow-700" },
  deployed: { label: "Deployed", classes: "bg-purple-100 text-purple-700" },
  outreach_drafted: { label: "Email Drafted", classes: "bg-orange-100 text-orange-700" },
  sent: { label: "Sent", classes: "bg-green-100 text-green-700" },
  converted: { label: "Converted", classes: "bg-emerald-100 text-emerald-700" },
  lost: { label: "Lost", classes: "bg-red-100 text-red-700" },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config.classes)}>
      {config.label}
    </span>
  );
}
