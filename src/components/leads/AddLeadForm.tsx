"use client";
import { useState } from "react";
import type { BusinessType } from "@/types";

interface AddLeadFormProps {
  onAdded: () => void;
  onCancel: () => void;
}

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "barber", label: "Barber / Hair Salon" },
  { value: "clinic", label: "Clinic / Medical" },
  { value: "construction", label: "Construction / Trades" },
  { value: "convenience", label: "Convenience Store" },
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "auto", label: "Auto Shop" },
  { value: "retail", label: "Retail / Shop" },
  { value: "other", label: "Other" },
];

export function AddLeadForm({ onAdded, onCancel }: AddLeadFormProps) {
  const [form, setForm] = useState({
    businessName: "",
    businessType: "" as BusinessType | "",
    city: "",
    address: "",
    phone: "",
    websiteUrl: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim()) {
      setError("Business name is required");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        businessType: form.businessType || null,
      }),
    });

    if (res.ok) {
      onAdded();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add lead");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Business Name *</label>
          <input
            className={inputClass}
            value={form.businessName}
            onChange={(e) => set("businessName", e.target.value)}
            placeholder="Mike's Barbershop"
            required
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Business Type</label>
          <select
            className={inputClass}
            value={form.businessType}
            onChange={(e) => set("businessType", e.target.value)}
          >
            <option value="">Select type…</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>City</label>
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Toronto"
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Address</label>
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="123 Main St"
          />
        </div>

        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="416-555-0100"
          />
        </div>

        <div>
          <label className={labelClass}>Existing Website</label>
          <input
            className={inputClass}
            value={form.websiteUrl}
            onChange={(e) => set("websiteUrl", e.target.value)}
            placeholder="https://…"
            type="url"
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea
            className={inputClass}
            rows={2}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Spotted on Google Maps, no website…"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Lead"}
        </button>
      </div>
    </form>
  );
}
