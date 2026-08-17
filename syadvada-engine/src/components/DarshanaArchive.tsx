"use client";

import { useMemo, useState } from "react";

import { ARCHIVE_TERMS, TOOL_TAGS, type ToolTag } from "@/lib/archive/terms";

export function DarshanaArchive() {
  const [query, setQuery] = useState("");
  const [toolFilter, setToolFilter] = useState<ToolTag | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCHIVE_TERMS.filter((term) => {
      const matchesTool =
        toolFilter === "all" || term.tools.includes(toolFilter);
      if (!matchesTool) return false;
      if (!q) return true;
      return (
        term.transliteration.toLowerCase().includes(q) ||
        term.devanagari.includes(query.trim()) ||
        term.definition.toLowerCase().includes(q) ||
        term.etymology.toLowerCase().includes(q) ||
        term.school.toLowerCase().includes(q) ||
        term.tools.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, toolFilter]);

  return (
    <div className="archive relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-10 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          darśana · reference index
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Darśana Archive
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          A searchable glossary of classical Indian philosophical terms used
          across the Darshana Suite tools.
        </p>
      </header>

      <section className="archive-banner mb-8 rounded-2xl border border-accent/20 bg-accent-muted/20 p-6 sm:p-8">
        <h2 className="mb-3 font-serif text-xl text-accent-strong">
          How to Use These Reference Terms
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-body">
          <p>
            Each term in this archive connects to one or more tools in the
            suite. When you encounter unfamiliar Sanskrit in your analysis,
            return here to clarify meaning and context.
          </p>
          <ul className="ml-4 list-disc space-y-2 text-muted">
            <li>
              <strong className="text-body">Nyāya-Logic</strong> — use
              Pratijñā, Hetu, Udāharaṇa, Upanaya, Nigamana, and Hetvābhāsa
              entries when interpreting syllogism steps and fallacy flags.
            </li>
            <li>
              <strong className="text-body">Syādvāda Engine</strong> — refer to
              Anekāntavāda, Syādvāda, Saptabhaṅgī, and Syāt-asti / Syāt-nāsti
              to understand each conditional perspective card.
            </li>
            <li>
              <strong className="text-body">Other tools</strong> — Prāmāṇa,
              Citta-Vṛtti, Kleśa, and Puruṣārtha entries apply to the Prāmāṇa
              Explorer, Yoga-Sūtra Analyzer, and Dharma Dilemma Solver
              respectively.
            </li>
          </ul>
        </div>
      </section>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, definitions, schools…"
            className="w-full rounded-xl border border-border bg-input py-3 pr-4 pl-10 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
            aria-label="Search archive terms"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setToolFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              toolFilter === "all"
                ? "bg-accent-muted text-accent-strong"
                : "text-muted hover:text-body"
            }`}
          >
            All
          </button>
          {TOOL_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setToolFilter(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                toolFilter === tag
                  ? "bg-accent-muted text-accent-strong"
                  : "text-muted hover:text-body"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-6 font-mono text-xs text-subtle">
        {filtered.length} of {ARCHIVE_TERMS.length} terms
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-6 py-12 text-center text-muted">
          No terms match your search. Try a different keyword or filter.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((term) => (
            <article
              key={term.id}
              className="archive-card rounded-2xl suite-card p-5 transition-shadow hover:shadow-[var(--card-hover-shadow)]"
            >
              <p className="mb-1 font-serif text-2xl text-heading">
                {term.devanagari}
              </p>
              <p className="mb-3 font-mono text-sm font-medium text-accent-strong">
                {term.transliteration}
              </p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="archive-badge rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                  {term.school}
                </span>
                {term.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded bg-border/60 px-2 py-0.5 font-mono text-[10px] text-subtle"
                  >
                    {tool}
                  </span>
                ))}
              </div>

              <p className="mb-3 text-xs leading-relaxed text-muted italic">
                <span className="font-medium not-italic text-body">
                  Etymology:{" "}
                </span>
                {term.etymology}
              </p>

              <p className="text-sm leading-relaxed text-body">
                {term.definition}
              </p>
            </article>
          ))}
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Darśana Archive · {ARCHIVE_TERMS.length} terms across the suite
      </footer>
    </div>
  );
}
