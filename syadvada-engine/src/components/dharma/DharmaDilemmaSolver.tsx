"use client";

import Link from "next/link";
import { useState } from "react";

import { ResultProvenance } from "@/components/shared/ResultProvenance";
import { warnIfHeuristicFallback } from "@/lib/utils/analyzer-diagnostics";
import type {
  DharmaAnalyzeResponse,
  OptionAnalysis,
  PurusharthaId,
} from "@/lib/dharma/types";
import { PURUSHARTHA_META, PURUSHARTHA_ORDER } from "@/lib/dharma/types";

const EXAMPLES = [
  {
    dilemma:
      "I have been offered a very lucrative job, but the role requires me to mislead customers.",
    option_a: "Accept the lucrative job",
    option_b: "Decline the job to avoid misleading customers",
    label: "Integrity dilemma",
    sub: "Career · Honesty",
  },
  {
    dilemma:
      "Should I take a high-paying corporate job that drains my energy (Artha) or stay at a low-paying creative non-profit that aligns with my values (Dharma)?",
    option_a: "Take the high-paying corporate job",
    option_b: "Stay at the low-paying creative non-profit",
    label: "Artha vs Dharma",
    sub: "Career · Values",
  },
  {
    dilemma:
      "Should I report a minor compliance violation by a close colleague who has a family to support (Dharma vs. Compassion)?",
    option_a: "Report the compliance violation",
    option_b: "Stay silent to protect my colleague's family",
    label: "Dharma vs Compassion",
    sub: "Integrity · Loyalty",
  },
  {
    dilemma:
      "Should I relocate abroad for individual career growth (Mokṣa/Artha) or stay behind to care for aging parents (Dharma/Duty)?",
    option_a: "Relocate abroad for career growth",
    option_b: "Stay behind to care for aging parents",
    label: "Mokṣa/Artha vs Dharma",
    sub: "Growth · Filial duty",
  },
];

function scoreColor(value: number): string {
  if (value >= 0.7) return "text-emerald-400";
  if (value >= 0.5) return "text-amber-400";
  return "text-red-400";
}

function barColor(value: number): string {
  if (value >= 0.7) return "bg-emerald-500";
  if (value >= 0.5) return "bg-amber-500";
  return "bg-red-400/80";
}

function ImpactCell({
  impact,
  label,
}: {
  impact: OptionAnalysis[PurusharthaId];
  label: string;
}) {
  const shortPct = Math.round(impact.short_term * 100);
  const longPct = Math.round(impact.long_term * 100);

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-mono text-subtle">{label} · short</span>
          <span className={`font-mono ${scoreColor(impact.short_term)}`}>
            {shortPct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${barColor(impact.short_term)}`}
            style={{ width: `${shortPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs">
          <span className="font-mono text-subtle">{label} · long</span>
          <span className={`font-mono ${scoreColor(impact.long_term)}`}>
            {longPct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${barColor(impact.long_term)}`}
            style={{ width: `${longPct}%` }}
          />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted">{impact.analysis}</p>
    </div>
  );
}

export function DharmaDilemmaSolver() {
  const [dilemma, setDilemma] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DharmaAnalyzeResponse | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);

  async function handleAnalyze() {
    if (!dilemma.trim() || !optionA.trim() || !optionB.trim()) {
      setError("Please complete the dilemma and both options.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dharma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma: dilemma.trim(),
          option_a: optionA.trim(),
          option_b: optionB.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed");

      const typed = data as DharmaAnalyzeResponse;
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

  function selectExample(ex: (typeof EXAMPLES)[number]) {
    setDilemma(ex.dilemma);
    setOptionA(ex.option_a);
    setOptionB(ex.option_b);
    setExamplesOpen(false);
    setError(null);
  }

  return (
    <div className="dharma-solver relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-12 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          dharma · puruṣārtha deliberation
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Dharma Dilemma Solver
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Navigate ethical crossroads through the four life goals — Dharma,
          Artha, Kāma, and Mokṣa — with balanced classical wisdom.
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          धर्म · अर्थ · काम · मोक्ष
        </p>
        <p className="mt-3 text-center text-sm">
          <Link href="/archive" className="text-accent transition-colors hover:text-accent-strong">
            Learn these terms → Archive
          </Link>
        </p>
      </header>

      <section className="dharma-solver__workspace relative mb-10 rounded-2xl suite-card p-6 sm:p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setExamplesOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-hover"
            aria-expanded={examplesOpen}
          >
            <span className="font-serif text-sm text-accent-strong">
              Examples &amp; Common Dilemmas
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
                  onClick={() => selectExample(ex)}
                  className="group w-full rounded-xl border border-border bg-input px-4 py-3 text-left transition-all hover:border-accent/30 hover:bg-accent-muted/20"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="dharma-badge inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                      {ex.label}
                    </span>
                    <span className="font-mono text-xs text-subtle">
                      {ex.sub}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-body group-hover:text-heading">
                    {ex.dilemma}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <label
          htmlFor="dilemma"
          className="mb-3 block font-serif text-lg text-accent-strong"
        >
          Your Dilemma
        </label>
        <textarea
          id="dilemma"
          rows={3}
          value={dilemma}
          onChange={(e) => setDilemma(e.target.value)}
          placeholder="Describe the ethical crossroads you face…"
          className="mb-6 w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
          disabled={loading}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="option-a"
              className="mb-2 block font-serif text-sm text-accent-strong"
            >
              Option A
            </label>
            <textarea
              id="option-a"
              rows={3}
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder="First path of action…"
              className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="option-b"
              className="mb-2 block font-serif text-sm text-accent-strong"
            >
              Option B
            </label>
            <textarea
              id="option-b"
              rows={3}
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder="Alternative path of action…"
              className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={
              loading || !dilemma.trim() || !optionA.trim() || !optionB.trim()
            }
            className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Deliberating…
              </>
            ) : (
              "Resolve Dilemma"
            )}
          </button>
        </div>
      </section>

      {error && (
        <p className="error-panel mb-6 rounded-xl px-4 py-3 text-center text-sm font-mono">
          {error}
        </p>
      )}

      {result && (
        <section className="animate-in space-y-8">
          <div className="rounded-2xl suite-card p-6 text-center">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
              Dominant Tension
            </p>
            <p className="font-serif text-2xl text-accent-strong">
              {result.dominant_tension}
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl text-accent-strong">
              Puruṣārtha Comparison Matrix
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="dharma-matrix w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-surface/80">
                    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-subtle">
                      Goal
                    </th>
                    <th className="px-4 py-3 font-serif text-sm text-heading">
                      Option A
                      <span className="mt-1 block font-mono text-xs font-normal text-muted">
                        {result.option_a.length > 60
                          ? `${result.option_a.slice(0, 57)}…`
                          : result.option_a}
                      </span>
                    </th>
                    <th className="px-4 py-3 font-serif text-sm text-heading">
                      Option B
                      <span className="mt-1 block font-mono text-xs font-normal text-muted">
                        {result.option_b.length > 60
                          ? `${result.option_b.slice(0, 57)}…`
                          : result.option_b}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PURUSHARTHA_ORDER.map((id) => {
                    const meta = PURUSHARTHA_META[id];
                    return (
                      <tr
                        key={id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-5 align-top">
                          <span className="dharma-badge inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                            {meta.label}
                          </span>
                          <p className="mt-1 font-mono text-xs text-subtle">
                            {meta.sanskrit}
                          </p>
                          <p className="mt-2 text-xs text-muted">
                            {meta.description}
                          </p>
                        </td>
                        <td className="px-4 py-5 align-top">
                          <ImpactCell
                            impact={result.matrix.option_a[id]}
                            label="ST"
                          />
                        </td>
                        <td className="px-4 py-5 align-top">
                          <ImpactCell
                            impact={result.matrix.option_b[id]}
                            label="ST"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl suite-card p-6">
              <h3 className="mb-3 font-serif text-lg text-accent-strong">
                Philosophical Synthesis
              </h3>
              <p className="text-sm leading-relaxed text-body">
                {result.synthesis}
              </p>
            </div>
            <div className="dharma-solver__recommendation rounded-2xl suite-card p-6 ring-1 ring-accent/20">
              <h3 className="mb-2 font-serif text-lg text-accent-strong">
                Reflective Guidance
              </h3>
              <p className="mb-3 text-xs leading-relaxed text-subtle">
                This is a structured reflection through the puruṣārthas, not a
                single objectively correct ethical answer.
              </p>
              <p className="text-sm leading-relaxed text-body">
                {result.recommendation}
              </p>
            </div>
          </div>

          <ResultProvenance analyzer={result.analyzer} model={result.model} />
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Dharma Dilemma Solver · Karmany evādhikāras te mā phaleṣu kadācana
      </footer>
    </div>
  );
}
