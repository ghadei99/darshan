"use client";

import { useState } from "react";

/**
 * Compact provenance note shown under every analyzer result.
 *
 * The app has no scripture database and verifies no citations — every result
 * is either a fixed traditional category the app ships with (school names,
 * the five avayava labels, the four pramāṇas, etc.) or freeform text a
 * language model generated for this specific input. Users have no way to
 * tell those apart without this note, and a confident-sounding AI paragraph
 * is easy to mistake for settled scholarship. This makes the distinction
 * explicit without turning every result page into a disclaimer wall.
 */
export function ResultProvenance({
  analyzer,
  model,
}: {
  analyzer?: string;
  model?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const isHeuristic = analyzer === "heuristic";

  return (
    <div className="mt-4 rounded-xl border border-border px-4 py-3 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left text-subtle transition-colors hover:text-muted"
      >
        <span className="flex items-center gap-2">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${isHeuristic ? "bg-subtle" : "bg-accent"}`}
            aria-hidden
          />
          {isHeuristic
            ? "Pattern-based reading (no AI model available) — treat cautiously"
            : "AI-generated reading — not a scriptural source"}
        </span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-2 leading-relaxed text-subtle">
          <p>
            <strong className="text-muted">Traditional categories</strong>{" "}
            (school names, the five avayavas, the four pramāṇas, and similar
            fixed terms) come from the classical framework this tool is
            built on.
          </p>
          <p>
            <strong className="text-muted">Everything else</strong> — the
            specific wording, examples, and verdict for{" "}
            <em>your</em> input — is generated
            {model ? ` by ${model}` : " by a language model"} for this one
            request. It is one reading, not a citation. It can be wrong, and
            it never quotes scripture verbatim unless you provided the text
            yourself.
          </p>
          {isHeuristic && (
            <p>
              No AI provider was reachable for this request, so a simple
              pattern-matching fallback produced this result instead. Treat
              it as rougher than the AI-backed reading.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
