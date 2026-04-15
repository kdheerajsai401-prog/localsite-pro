import { cn } from "@/lib/utils";
import type { TemplateId } from "@/types";

const TEMPLATES: {
  id: TemplateId;
  label: string;
  description: string;
  bestFor: string;
  preview: { bg: string; accent: string };
}[] = [
  {
    id: "bold",
    label: "Bold",
    description: "Dark, high-contrast with a full-screen parallax hero.",
    bestFor: "Barbers · Construction · Auto · Gyms",
    preview: { bg: "#0f0f0f", accent: "#ea580c" },
  },
  {
    id: "clean",
    label: "Clean",
    description: "White, minimal, trust-forward with sticky navigation.",
    bestFor: "Clinics · Dental · Law · Professional services",
    preview: { bg: "#ffffff", accent: "#0ea5e9" },
  },
  {
    id: "warm",
    label: "Warm",
    description: "Friendly and community-focused with hours front and centre.",
    bestFor: "Convenience · Restaurants · Retail · Local shops",
    preview: { bg: "#fafaf8", accent: "#d97706" },
  },
];

interface TemplateSelectorProps {
  selected: TemplateId | null;
  onSelect: (id: TemplateId) => void;
  disabled?: boolean;
}

export function TemplateSelector({ selected, onSelect, disabled }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TEMPLATES.map((t) => (
        <button
          key={t.id}
          onClick={() => !disabled && onSelect(t.id)}
          disabled={disabled}
          className={cn(
            "text-left rounded-xl border-2 overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500",
            selected === t.id
              ? "border-indigo-600 shadow-md"
              : "border-gray-200 hover:border-gray-300",
            disabled && "cursor-default opacity-70"
          )}
        >
          {/* Mini preview bar */}
          <div
            className="h-14 flex items-center justify-center relative"
            style={{ backgroundColor: t.preview.bg }}
          >
            <div
              className="w-16 h-1.5 rounded-full"
              style={{ backgroundColor: t.preview.accent }}
            />
            <div
              className="absolute top-2.5 left-3 w-6 h-1 rounded-full opacity-30"
              style={{ backgroundColor: t.preview.accent }}
            />
            <div
              className="absolute bottom-2.5 right-3 w-4 h-4 rounded-full opacity-15"
              style={{ backgroundColor: t.preview.accent }}
            />
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-gray-900">{t.label}</span>
              {selected === t.id && (
                <span className="text-xs font-bold text-indigo-600">Selected</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">{t.description}</p>
            <p className="text-[11px] text-gray-400 font-medium">{t.bestFor}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
