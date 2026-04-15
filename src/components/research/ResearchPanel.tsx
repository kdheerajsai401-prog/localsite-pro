"use client";
import { useState, useEffect, useCallback } from "react";
import type { BusinessProfileRow } from "@/db/schema";
import type { BusinessTone } from "@/types";

interface ResearchPanelProps {
  leadId: string;
  onProfileApproved: () => void;
}

const TONES: { value: BusinessTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
];

export function ResearchPanel({ leadId, onProfileApproved }: ResearchPanelProps) {
  const [profile, setProfile] = useState<BusinessProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Local editable state (mirrors profile fields)
  const [fields, setFields] = useState({
    contactEmail: "",
    services: [] as string[],
    description: "",
    tagline: "",
    tone: "professional" as BusinessTone,
  });

  const fetchProfile = useCallback(async () => {
    const res = await fetch(`/api/research/${leadId}`);
    const json = await res.json();
    if (json.data) {
      setProfile(json.data);
      setFields({
        contactEmail: json.data.contactEmail ?? "",
        services: json.data.services ?? [],
        description: json.data.description ?? "",
        tagline: json.data.tagline ?? "",
        tone: (json.data.tone as BusinessTone) ?? "professional",
      });
    }
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function runResearch() {
    setRunning(true);
    setError("");
    const res = await fetch(`/api/research/${leadId}`, { method: "POST" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Research failed");
      setRunning(false);
      return;
    }
    setProfile(json.data);
    setFields({
      contactEmail: json.data.contactEmail ?? "",
      services: json.data.services ?? [],
      description: json.data.description ?? "",
      tagline: json.data.tagline ?? "",
      tone: (json.data.tone as BusinessTone) ?? "professional",
    });
    setRunning(false);
  }

  async function saveChanges() {
    setSaving(true);
    const res = await fetch(`/api/research/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const json = await res.json();
    if (res.ok) setProfile(json.data);
    setSaving(false);
  }

  async function approveProfile() {
    setApproving(true);
    const res = await fetch(`/api/research/${leadId}/approve`, { method: "POST" });
    if (res.ok) {
      onProfileApproved();
    } else {
      const json = await res.json();
      setError(json.error || "Approval failed");
      setApproving(false);
    }
  }

  function setService(index: number, value: string) {
    setFields((prev) => {
      const updated = [...prev.services];
      updated[index] = value;
      return { ...prev, services: updated };
    });
  }

  function addService() {
    setFields((prev) => ({ ...prev, services: [...prev.services, ""] }));
  }

  function removeService(index: number) {
    setFields((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading…</div>;
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Business Research</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Claude generates a draft profile. Review every field, edit as needed, then approve.
          </p>
        </div>
        <button
          onClick={runResearch}
          disabled={running}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {running ? "Researching…" : profile ? "Re-run Research" : "Run Research"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {!profile && !running && (
        <div className="py-16 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
          No profile yet — click &ldquo;Run Research&rdquo; to generate one with Claude.
        </div>
      )}

      {running && (
        <div className="py-16 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <div className="animate-pulse">Claude is researching this business…</div>
        </div>
      )}

      {profile && !running && (
        <>
          {/* Unverified warning */}
          {!profile.isVerified && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-500 mt-0.5">⚠</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Unverified — review before approving</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  All fields below were generated by Claude. Edit anything that looks wrong, then click Approve Profile.
                </p>
              </div>
            </div>
          )}

          {/* Verified badge */}
          {profile.isVerified && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-green-500">✓</span>
              <p className="text-sm font-medium text-green-800">
                Profile approved on {profile.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString("en-CA") : "—"}
              </p>
            </div>
          )}

          {/* Editable fields */}
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {/* Contact email */}
            <div className="p-5">
              <label className={labelClass}>Contact Email</label>
              <input
                className={inputClass}
                type="email"
                value={fields.contactEmail}
                onChange={(e) => setFields((p) => ({ ...p, contactEmail: e.target.value }))}
                placeholder="owner@business.com — enter manually, never guessed"
                disabled={profile.isVerified}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Enter this yourself — Claude does not guess contact info.
              </p>
            </div>

            {/* Tagline */}
            <div className="p-5">
              <label className={labelClass}>Tagline</label>
              <input
                className={inputClass}
                value={fields.tagline}
                onChange={(e) => setFields((p) => ({ ...p, tagline: e.target.value }))}
                placeholder="Short punchy tagline"
                disabled={profile.isVerified}
              />
            </div>

            {/* Description */}
            <div className="p-5">
              <label className={labelClass}>About / Description</label>
              <textarea
                className={inputClass}
                rows={4}
                value={fields.description}
                onChange={(e) => setFields((p) => ({ ...p, description: e.target.value }))}
                placeholder="Business description for the About section"
                disabled={profile.isVerified}
              />
            </div>

            {/* Services */}
            <div className="p-5">
              <label className={labelClass}>Services</label>
              <div className="space-y-2">
                {fields.services.map((service, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className={inputClass}
                      value={service}
                      onChange={(e) => setService(i, e.target.value)}
                      placeholder={`Service ${i + 1}`}
                      disabled={profile.isVerified}
                    />
                    {!profile.isVerified && (
                      <button
                        type="button"
                        onClick={() => removeService(i)}
                        className="px-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {!profile.isVerified && (
                  <button
                    type="button"
                    onClick={addService}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
                  >
                    + Add service
                  </button>
                )}
              </div>
            </div>

            {/* Tone */}
            <div className="p-5">
              <label className={labelClass}>Tone</label>
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => !profile.isVerified && setFields((p) => ({ ...p, tone: t.value }))}
                    disabled={profile.isVerified}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      fields.tone === t.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                    } disabled:cursor-default`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action row */}
          {!profile.isVerified && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={saveChanges}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={approveProfile}
                disabled={approving}
                className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {approving ? "Approving…" : "✓ Approve Profile"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
