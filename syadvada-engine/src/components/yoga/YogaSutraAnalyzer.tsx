"use client";

import Link from "next/link";
import { useState } from "react";

import { ResultProvenance } from "@/components/shared/ResultProvenance";
import { warnIfHeuristicFallback } from "@/lib/utils/analyzer-diagnostics";
import type { YogaAnalyzeResponse } from "@/lib/yoga/types";
import {
  KLESHA_META,
  KLESHA_ORDER,
  VRITTI_META,
  VRITTI_ORDER,
} from "@/lib/yoga/types";

const EXAMPLES = [
  {
    text: "I know I should study, but I keep getting distracted and putting it off.",
    label: "Procrastination",
    sub: "Study · Distraction",
  },
  {
    text: "I am constantly worried about what my peers think of my work, and I can't stop comparing myself to them.",
    label: "Asmitā & Rāga",
    sub: "Egoism · Attachment",
  },
  {
    text: "I feel completely unmotivated, tired, and want to sleep all day to escape my responsibilities.",
    label: "Nidrā & Avidyā",
    sub: "Sleep · Ignorance",
  },
  {
    text: "I keep replaying a past argument in my head, feeling intense anger and a desire for revenge.",
    label: "Smṛti & Dveṣa",
    sub: "Memory · Aversion",
  },
];

function intensityColor(pct: number): string {
  if (pct >= 70) return "bg-indigo-500";
  if (pct >= 45) return "bg-amber-500";
  return "bg-slate-400";
}

export function YogaSutraAnalyzer() {
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YogaAnalyzeResponse | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);

  async function handleAnalyze() {
    const text = journal.trim();
    if (!text) {
      setError("Please share your emotional state to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/yoga-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journal: text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      const typed = data as YogaAnalyzeResponse;
      setResult(typed);
      warnIfHeuristicFallback({
        analyzer: typed.analyzer,
        fallbackReason: typed.fallbackReason,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function selectExample(text: string) {
    setJournal(text);
    setExamplesOpen(false);
    setError(null);
  }

  const dominantVritti = result ? VRITTI_META[result.dominant_vritti] : null;
  const dominantKlesha = result ? KLESHA_META[result.dominant_klesha] : null;

  return (
    <div className="yoga-analyzer relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-12 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-indigo-400/90 uppercase">
          yoga-sūtra · citta-vṛtti analysis
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Yoga-Sūtra Pattern Analyzer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Illuminate the fluctuations of mind and root afflictions through
          Patañjali&apos;s framework — with gentle guidance for abhyāsa
          (practice).
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          चित्तवृत्ति · क्लेश · अभ्यास
        </p>
        <p className="mt-3 text-center text-sm">
          <Link href="/archive" className="text-accent transition-colors hover:text-accent-strong">
            Learn these terms → Archive
          </Link>
        </p>
      </header>

      <section className="yoga-analyzer__panel relative mb-10 rounded-2xl suite-card p-6 sm:p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setExamplesOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-hover"
            aria-expanded={examplesOpen}
          >
            <span className="font-serif text-sm text-accent-strong">
              Examples &amp; Reference States
            </span>
            <svg
              className={`h-4 w-4 text-muted transition-transform ${examplesOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {examplesOpen && (
            <div className="mt-3 space-y-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => selectExample(ex.text)}
                  className="group w-full rounded-xl border border-border bg-input px-4 py-3 text-left transition-all hover:border-indigo-400/30 hover:bg-indigo-500/5"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="yoga-badge inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                      {ex.label}
                    </span>
                    <span className="font-mono text-xs text-subtle">
                      {ex.sub}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-body group-hover:text-heading">
                    {ex.text}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <label
          htmlFor="journal"
          className="mb-3 block font-serif text-lg text-accent-strong"
        >
          Your Inner State
        </label>
        <p className="mb-4 text-sm text-muted">
          Write freely about what you feel — worry, fatigue, anger, attachment.
          The analyzer maps your words to citta-vṛttis and kleśas.
        </p>
        <textarea
          id="journal"
          rows={6}
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
          }}
          placeholder="I notice that when I wake up, my mind immediately races to…"
          className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-indigo-400/25 min-h-[140px]"
          disabled={loading}
        />

        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !journal.trim()}
            className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="yoga-spinner h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                Illuminating patterns…
              </>
            ) : (
              "Analyze Patterns"
            )}
          </button>
        </div>
      </section>

      {error && (
        <p className="error-panel mb-6 rounded-xl px-4 py-3 text-center text-sm font-mono">
          {error}
        </p>
      )}

      {result && dominantVritti && dominantKlesha && (
        <section className="animate-in space-y-6">
          <blockquote className="border-l-2 border-indigo-400/30 pl-4 text-muted italic">
            &ldquo;{result.journal}&rdquo;
          </blockquote>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="yoga-analyzer__highlight rounded-2xl suite-card p-6 text-center">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
                Dominant Vṛtti
              </p>
              <p className="font-serif text-2xl font-bold text-indigo-300 dark:text-indigo-300">
                {dominantVritti.label}
              </p>
              <p className="mt-1 font-mono text-sm text-muted">
                {dominantVritti.sanskrit}
              </p>
              <p className="mt-3 text-sm text-body">{result.vritti_summary}</p>
            </div>
            <div className="yoga-analyzer__highlight rounded-2xl suite-card p-6 text-center ring-1 ring-amber-400/20">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
                Dominant Kleśa
              </p>
              <p className="font-serif text-2xl font-bold text-amber-400">
                {dominantKlesha.label}
              </p>
              <p className="mt-1 font-mono text-sm text-muted">
                {dominantKlesha.sanskrit}
              </p>
              <p className="mt-3 text-sm text-body">{result.klesha_summary}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-2 font-serif text-xl text-accent-strong">
              Citta-Vṛttis
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              Here <em>pramāṇa</em> refers to a vṛtti — a mode of cognition
              described in the Yoga Sūtras. This is different from the broader use
              of pramāṇa as a means of valid knowledge in Indian epistemology.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {VRITTI_ORDER.map((id) => {
                const meta = VRITTI_META[id];
                const detail = result.vrittis[id];
                const pct = Math.round(detail.intensity * 100);
                const isDominant = result.dominant_vritti === id;

                return (
                  <div
                    key={id}
                    className={`rounded-xl suite-card p-5 ${
                      isDominant ? "ring-1 ring-indigo-400/30" : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="yoga-badge inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs text-subtle">
                          {meta.sanskrit}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                          detail.detected
                            ? "bg-indigo-500/15 text-indigo-400"
                            : "bg-border text-subtle"
                        }`}
                      >
                        {detail.detected ? "active" : "quiet"}
                      </span>
                    </div>
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${intensityColor(pct)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-body">
                      {detail.insight}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl text-accent-strong">
              Kleśas · Root Afflictions
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {KLESHA_ORDER.map((id) => {
                const meta = KLESHA_META[id];
                const detail = result.kleshas[id];
                const pct = Math.round(detail.intensity * 100);
                const isDominant = result.dominant_klesha === id;

                return (
                  <div
                    key={id}
                    className={`rounded-xl suite-card p-5 ${
                      isDominant ? "ring-1 ring-amber-400/30" : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="font-serif text-sm text-heading">
                        {meta.label}
                      </span>
                      <span className="font-mono text-xs text-subtle">
                        {meta.sanskrit}
                      </span>
                    </div>
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pct >= 45 ? "bg-amber-500" : "bg-slate-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-sm leading-relaxed text-muted">
                      {detail.insight}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl suite-card p-6 sm:p-8">
            <h2 className="mb-2 font-serif text-xl text-accent-strong">
              Abhyāsa · Suggested Practice
            </h2>
            <p className="mb-6 text-sm text-muted">
              Traditional remedies from the Yoga Sūtra tradition, offered with
              compassion — not prescription.
            </p>
            <div className="space-y-4">
              {result.abhyasa.practices.map((practice) => (
                <div
                  key={practice.name}
                  className="rounded-xl border border-border bg-surface/50 px-5 py-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="font-serif text-base font-medium text-heading">
                      {practice.name}
                    </span>
                    {practice.sanskrit && (
                      <span className="font-mono text-xs text-amber-400/80">
                        {practice.sanskrit}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-body">
                    {practice.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl suite-card p-6">
              <h3 className="mb-3 font-serif text-lg text-indigo-300">
                Philosophical Alignment
              </h3>
              <p className="text-sm leading-relaxed text-body">
                {result.abhyasa.philosophical_alignment}
              </p>
            </div>
            <div className="rounded-2xl suite-card p-6">
              <h3 className="mb-3 font-serif text-lg text-amber-400">
                Psychological Insight
              </h3>
              <p className="text-sm leading-relaxed text-body">
                {result.abhyasa.psychological_insight}
              </p>
            </div>
          </div>

          <ResultProvenance analyzer={result.analyzer} model={result.model} />
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Yoga-Sūtra Pattern Analyzer · Yogāś citta-vṛtti-nirodhaḥ
      </footer>
    </div>
  );
}
