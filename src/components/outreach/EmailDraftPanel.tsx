"use client";
import { useState, useEffect, useCallback } from "react";
import type { OutreachRow } from "@/db/schema";

interface EmailDraftPanelProps {
  leadId: string;
  isDeployed: boolean;
  onSent: () => void;
}

export function EmailDraftPanel({ leadId, isDeployed, onSent }: EmailDraftPanelProps) {
  const [drafts, setDrafts] = useState<OutreachRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Active draft (latest)
  const draft = drafts[0] ?? null;
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const fetchDrafts = useCallback(async () => {
    const res = await fetch(`/api/outreach/${leadId}`);
    const json = await res.json();
    const rows: OutreachRow[] = json.data ?? [];
    setDrafts(rows);
    if (rows[0]) {
      setSubject(rows[0].subject ?? "");
      setBody(rows[0].body ?? "");
      setRecipientEmail(rows[0].recipientEmail ?? "");
    }
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  async function generateDraft() {
    setGenerating(true);
    setError("");
    const res = await fetch(`/api/outreach/${leadId}`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Generation failed");
      setGenerating(false);
      return;
    }
    const newDraft: OutreachRow = json.data;
    setDrafts([newDraft, ...drafts]);
    setSubject(newDraft.subject ?? "");
    setBody(newDraft.body ?? "");
    setRecipientEmail(newDraft.recipientEmail ?? "");
    setGenerating(false);
  }

  async function saveChanges() {
    if (!draft) return;
    setSaving(true);
    await fetch(`/api/outreach/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreachId: draft.id, subject, emailBody: body, recipientEmail }),
    });
    setSaving(false);
  }

  async function copyToClipboard() {
    const text = `Subject: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function markSent() {
    if (!draft) return;
    setMarking(true);
    await saveChanges();
    const res = await fetch(`/api/outreach/${leadId}/mark-sent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outreachId: draft.id, sendMethod: "copy_paste" }),
    });
    if (res.ok) {
      await fetchDrafts();
      onSent();
    }
    setMarking(false);
  }

  const isSent = draft?.status === "sent";

  if (!isDeployed) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Outreach</h2>
        <div className="py-10 text-center text-sm text-gray-400">
          Deploy a site first — the email needs a live preview URL to include.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading…</div>;
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Outreach</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Draft a cold email with your preview site link. Review before sending.
          </p>
        </div>
        <button
          onClick={generateDraft}
          disabled={generating || isSent}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {generating ? "Drafting…" : draft ? "Re-draft Email" : "Draft Email"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {generating && (
        <div className="py-12 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl animate-pulse">
          Claude is writing a personalized email…
        </div>
      )}

      {!draft && !generating && (
        <div className="py-16 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No draft yet — click &ldquo;Draft Email&rdquo; to generate one.
        </div>
      )}

      {draft && !generating && (
        <>
          {/* Sent badge */}
          {isSent && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-green-500">✓</span>
              <p className="text-sm font-medium text-green-800">
                Marked as sent on {draft.sentAt ? new Date(draft.sentAt).toLocaleDateString("en-CA") : "—"}
              </p>
            </div>
          )}

          {/* Email fields */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {/* To */}
              <div className="flex items-center px-5 py-3 gap-4">
                <span className="text-xs font-bold text-gray-400 w-12 shrink-0">To</span>
                <input
                  className="flex-1 text-sm focus:outline-none bg-transparent"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="owner@business.com — add manually"
                  disabled={isSent}
                />
              </div>

              {/* Subject */}
              <div className="flex items-center px-5 py-3 gap-4">
                <span className="text-xs font-bold text-gray-400 w-12 shrink-0">Subject</span>
                <input
                  className="flex-1 text-sm focus:outline-none bg-transparent font-medium"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSent}
                />
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <textarea
                  className="w-full text-sm text-gray-700 leading-relaxed focus:outline-none resize-none bg-transparent disabled:text-gray-500"
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={isSent}
                />
              </div>
            </div>
          </div>

          {/* Action row */}
          {!isSent && (
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy to Clipboard"}
                </button>

                <button
                  onClick={markSent}
                  disabled={marking}
                  className="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {marking ? "Marking…" : "✓ Mark as Sent"}
                </button>
              </div>
            </div>
          )}

          {/* History count */}
          {drafts.length > 1 && (
            <p className="text-xs text-gray-400 text-right">
              {drafts.length} drafts generated for this lead
            </p>
          )}
        </>
      )}
    </div>
  );
}
