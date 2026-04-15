"use client";
import { useState, useEffect, useCallback } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { AddLeadForm } from "@/components/leads/AddLeadForm";
import type { LeadRow } from "@/db/schema";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/leads");
    const json = await res.json();
    setLeads(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function handleAdded() {
    setShowForm(false);
    fetchLeads();
  }

  return (
    <div>
      <DashboardHeader
        title="Leads"
        description="All businesses in your pipeline"
        action={
          !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Lead
            </button>
          )
        }
      />

      {/* Add lead form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">New Lead</h2>
          <AddLeadForm onAdded={handleAdded} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <LeadTable leads={leads} />
        )}
      </div>
    </div>
  );
}
