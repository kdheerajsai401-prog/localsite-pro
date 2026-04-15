import { db, leads } from "@/db";
import { sql } from "drizzle-orm";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

async function getStats() {
  const rows = await db
    .select({ status: leads.status, count: sql<number>`count(*)::int` })
    .from(leads)
    .groupBy(leads.status);

  const map: Record<string, number> = {};
  for (const r of rows) map[r.status] = r.count;
  return map;
}

async function getRecentLeads() {
  return db
    .select()
    .from(leads)
    .orderBy(leads.createdAt)
    .limit(5);
}

const STATUSES = [
  { key: "new", label: "New" },
  { key: "researched", label: "Researched" },
  { key: "deployed", label: "Deployed" },
  { key: "sent", label: "Sent" },
];

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentLeads()]);

  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div>
      <DashboardHeader
        title="Overview"
        description="Your lead pipeline at a glance"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        {STATUSES.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats[key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Leads</h2>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No leads yet. Head to the Leads page to add your first one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((lead) => (
              <a
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.businessName}</p>
                  <p className="text-xs text-gray-400">{lead.city ?? "—"} · {lead.businessType ?? "—"}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(lead.createdAt).toLocaleDateString("en-CA")}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
