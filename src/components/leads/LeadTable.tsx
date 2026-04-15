"use client";
import { useRouter } from "next/navigation";
import { LeadStatusBadge } from "./LeadStatusBadge";
import type { LeadRow } from "@/db/schema";
import type { LeadStatus } from "@/types";

interface LeadTableProps {
  leads: LeadRow[];
}

export function LeadTable({ leads }: LeadTableProps) {
  const router = useRouter();

  if (leads.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No leads yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Business</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Type</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">City</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Added</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => router.push(`/leads/${lead.id}`)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900">{lead.businessName}</span>
              </td>
              <td className="py-3 px-4 text-gray-500 capitalize">{lead.businessType ?? "—"}</td>
              <td className="py-3 px-4 text-gray-500">{lead.city ?? "—"}</td>
              <td className="py-3 px-4">
                <LeadStatusBadge status={lead.status as LeadStatus} />
              </td>
              <td className="py-3 px-4 text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString("en-CA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
