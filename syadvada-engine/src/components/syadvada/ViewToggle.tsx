"use client";

type ViewMode = "classical" | "stakeholder";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => onChange("classical")}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          viewMode === "classical"
            ? "text-accent-strong shadow-sm"
            : "text-muted hover:text-body"
        }`}
        style={
          viewMode === "classical"
            ? { background: "var(--accent-muted)" }
            : undefined
        }
      >
        Classical Saptabhaṅgī
      </button>
      <button
        type="button"
        onClick={() => onChange("stakeholder")}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          viewMode === "stakeholder"
            ? "text-accent-strong shadow-sm"
            : "text-muted hover:text-body"
        }`}
        style={
          viewMode === "stakeholder"
            ? { background: "var(--accent-muted)" }
            : undefined
        }
      >
        Modern Stakeholder
      </button>
    </div>
  );
}
