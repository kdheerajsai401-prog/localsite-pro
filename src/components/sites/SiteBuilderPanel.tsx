"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { TemplateSelector } from "./TemplateSelector";
import { ContentEditor } from "./ContentEditor";
import type { SiteRow } from "@/db/schema";
import type { SiteConfig, TemplateId } from "@/types";

interface SiteBuilderPanelProps {
  leadId: string;
  isResearched: boolean;
  onDeployed: () => void;
}

export function SiteBuilderPanel({ leadId, isResearched, onDeployed }: SiteBuilderPanelProps) {
  const [site, setSite] = useState<SiteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [content, setContent] = useState<SiteConfig | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSite = useCallback(async () => {
    const res = await fetch(`/api/sites?leadId=${leadId}`);
    const json = await res.json();
    if (json.data) {
      setSite(json.data);
      setContent(json.data.content as SiteConfig);
      setSelectedTemplate(json.data.templateId as TemplateId);
    }
    setLoading(false);
  }, [leadId]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  // Poll for deploy completion
  useEffect(() => {
    if (site?.status === "deploying" && site.id) {
      pollRef.current = setInterval(async () => {
        const res = await fetch(`/api/sites/${site.id}/status`);
        const json = await res.json();
        if (json.data?.status === "live") {
          setSite(json.data);
          setDeploying(false);
          if (pollRef.current) clearInterval(pollRef.current);
          onDeployed();
        } else if (json.data?.status === "failed") {
          setSite(json.data);
          setDeploying(false);
          setError("Deployment failed. Check your Vercel project settings.");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 6000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [site?.status, site?.id, onDeployed]);

  async function generateContent() {
    if (!selectedTemplate) return;
    setGenerating(true);
    setError("");

    const res = await fetch("/api/sites/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, templateId: selectedTemplate }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Generation failed");
      setGenerating(false);
      return;
    }

    setSite(json.data);
    setContent(json.data.content as SiteConfig);
    setGenerating(false);
  }

  async function saveContent() {
    if (!site || !content) return;
    setSaving(true);
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const json = await res.json();
    if (res.ok) setSite(json.data);
    setSaving(false);
  }

  async function deployToVercel() {
    if (!site) return;
    setDeploying(true);
    setError("");

    // Save latest content first
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const res = await fetch(`/api/sites/${site.id}/deploy`, { method: "POST" });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Deploy failed");
      setDeploying(false);
      return;
    }

    setSite((prev) => prev ? { ...prev, status: "deploying" } : prev);
  }

  if (!isResearched) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Site Builder</h2>
        <p className="text-sm text-gray-400 py-8 text-center">
          Approve the business profile in the Research tab first.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-400">Loading…</div>;
  }

  const isLive = site?.status === "live";
  const isDeploying = site?.status === "deploying" || deploying;
  const hasDraft = !!site && !!content;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Site Builder</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Pick a template, generate content, edit as needed, then deploy.
          </p>
        </div>

        {isLive && site.previewUrl && (
          <a
            href={site.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            View Live Site →
          </a>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Deploy success */}
      {isLive && site.previewUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-800 mb-1">Site is live</p>
          <a
            href={site.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-700 underline break-all"
          >
            {site.previewUrl}
          </a>
        </div>
      )}

      {/* Deploying state */}
      {isDeploying && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Deploying to Vercel…</p>
              <p className="text-xs text-blue-600 mt-0.5">This takes 1–3 minutes. Stay on this page — we&apos;ll update automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Template selector */}
      {!isLive && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
            1. Choose Template
          </p>
          <TemplateSelector
            selected={selectedTemplate}
            onSelect={setSelectedTemplate}
            disabled={isDeploying || hasDraft}
          />
          {hasDraft && (
            <p className="text-xs text-gray-400 mt-3">
              Template locked — content generated. Re-generate to switch templates.
            </p>
          )}
        </div>
      )}

      {/* Generate button */}
      {!isLive && selectedTemplate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
            2. Generate Content
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={generateContent}
              disabled={generating || isDeploying}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {generating
                ? "Generating…"
                : hasDraft
                ? "Re-generate Content"
                : "Generate Content"}
            </button>
            {hasDraft && (
              <span className="text-xs text-gray-400">
                Using <strong>{site?.templateId}</strong> template
              </span>
            )}
          </div>
          {generating && (
            <p className="text-xs text-gray-400 mt-2 animate-pulse">
              Claude is filling in your site content…
            </p>
          )}
        </div>
      )}

      {/* Content editor */}
      {hasDraft && content && !generating && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              3. Review &amp; Edit Content
            </p>
            {!isLive && !isDeploying && (
              <button
                onClick={saveContent}
                disabled={saving}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
          <ContentEditor
            content={content}
            onChange={setContent}
            disabled={isLive || isDeploying}
          />
        </div>
      )}

      {/* Deploy button */}
      {hasDraft && !isLive && !isDeploying && (
        <div className="flex justify-end pt-2">
          <button
            onClick={deployToVercel}
            disabled={deploying}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 transition-all"
          >
            Deploy to Vercel →
          </button>
        </div>
      )}
    </div>
  );
}
