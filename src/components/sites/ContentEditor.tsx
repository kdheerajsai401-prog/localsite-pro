import type { SiteConfig } from "@/types";

interface ContentEditorProps {
  content: SiteConfig;
  onChange: (updated: SiteConfig) => void;
  disabled?: boolean;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500";
const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

export function ContentEditor({ content, onChange, disabled }: ContentEditorProps) {
  function set(key: keyof SiteConfig, value: unknown) {
    onChange({ ...content, [key]: value });
  }

  function setService(i: number, field: "name" | "description", value: string) {
    const updated = content.services.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s
    );
    onChange({ ...content, services: updated });
  }

  function addService() {
    onChange({ ...content, services: [...content.services, { name: "", description: "" }] });
  }

  function removeService(i: number) {
    onChange({ ...content, services: content.services.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {/* Hero */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Hero Section</p>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Headline</label>
            <input
              className={inputClass}
              value={content.headline}
              onChange={(e) => set("headline", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>Subheadline</label>
            <input
              className={inputClass}
              value={content.subheadline}
              onChange={(e) => set("subheadline", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>CTA Button Text</label>
            <input
              className={inputClass}
              value={content.cta}
              onChange={(e) => set("cta", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">About</p>
        <textarea
          className={inputClass}
          rows={4}
          value={content.about}
          onChange={(e) => set("about", e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Services */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Services</p>
        <div className="space-y-4">
          {content.services.map((service, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Service {i + 1}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeService(i)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                className={inputClass}
                placeholder="Service name"
                value={service.name}
                onChange={(e) => setService(i, "name", e.target.value)}
                disabled={disabled}
              />
              <input
                className={inputClass}
                placeholder="One-sentence description"
                value={service.description}
                onChange={(e) => setService(i, "description", e.target.value)}
                disabled={disabled}
              />
            </div>
          ))}
          {!disabled && (
            <button
              type="button"
              onClick={addService}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              + Add service
            </button>
          )}
        </div>
      </div>

      {/* Colors */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Brand Colors</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={content.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                disabled={disabled}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-1 disabled:cursor-default"
              />
              <input
                className={inputClass}
                value={content.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                disabled={disabled}
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={content.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                disabled={disabled}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-1 disabled:cursor-default"
              />
              <input
                className={inputClass}
                value={content.accentColor}
                onChange={(e) => set("accentColor", e.target.value)}
                disabled={disabled}
                placeholder="#ea580c"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact info (read-only from lead) */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Contact Info</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={content.phone} onChange={(e) => set("phone", e.target.value)} disabled={disabled} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input className={inputClass} value={content.city} onChange={(e) => set("city", e.target.value)} disabled={disabled} />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Address</label>
            <input className={inputClass} value={content.address} onChange={(e) => set("address", e.target.value)} disabled={disabled} />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">SEO</p>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Meta Title</label>
            <input className={inputClass} value={content.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} disabled={disabled} />
          </div>
          <div>
            <label className={labelClass}>Meta Description</label>
            <textarea className={inputClass} rows={2} value={content.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} disabled={disabled} />
          </div>
        </div>
      </div>
    </div>
  );
}
