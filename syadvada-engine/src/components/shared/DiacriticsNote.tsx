"use client";

import { useState } from "react";

const MARKS = [
  { mark: "ā", gloss: "Long a — held twice as long as a" },
  { mark: "ī", gloss: "Long i" },
  { mark: "ū", gloss: "Long u" },
  { mark: "ṛ", gloss: "A vowel-like r sound, as in the R of \"grr\"" },
  { mark: "ṅ / ñ", gloss: "Nasal sounds tied to the consonant after them" },
  { mark: "ṭ / ḍ / ṇ", gloss: "Retroflex t/d/n — tongue curled further back" },
  { mark: "ś", gloss: "A soft \"sh\", as in \"ship\"" },
  { mark: "ṣ", gloss: "A harder, retroflex \"sh\"" },
] as const;

export function DiacriticsNote() {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="diacritics-heading"
      className="relative mb-20 rounded-3xl border border-border p-6 sm:p-8"
      style={{ background: "var(--card-bg)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span>
          <span className="mb-1 block font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
            A small note on spelling
          </span>
          <span
            id="diacritics-heading"
            className="font-serif text-lg font-semibold text-heading sm:text-xl"
          >
            Why does &ldquo;<span className="text-accent-strong">ā</span>&rdquo; have a line on top?
          </span>
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="mt-6 space-y-5">
          <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
            The line is a <strong className="text-body">diacritic</strong>. Sanskrit
            has sounds that the plain Latin alphabet can&apos;t represent on its own, so
            scholars add small marks to spell them accurately.{" "}
            <strong className="text-body">&ldquo;ā&rdquo;</strong> is a long vowel;{" "}
            <strong className="text-body">&ldquo;a&rdquo;</strong> is short — genuinely
            different sounds, the way &ldquo;bit&rdquo; and &ldquo;beet&rdquo; differ in
            English.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {MARKS.map((m) => (
              <div
                key={m.mark}
                className="flex items-baseline gap-3 rounded-xl border border-border px-4 py-3"
              >
                <span className="font-serif text-xl font-medium text-accent-strong">
                  {m.mark}
                </span>
                <span className="text-[13px] leading-snug text-muted">{m.gloss}</span>
              </div>
            ))}
          </div>

          <p className="max-w-2xl text-[13px] leading-relaxed text-subtle">
            This is also why the suite writes{" "}
            <strong className="text-body">Nyāya</strong> rather than Nyaya, and{" "}
            <strong className="text-body">Prāmāṇa</strong> rather than Pramana — not
            pedantry, just preserving information about how the word actually
            sounds in the original language.
          </p>
        </div>
      )}
    </section>
  );
}
