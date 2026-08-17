"use client";

import { useState } from "react";

import type { PramanaAnalyzeResponse, PramanaId } from "@/lib/pramana/types";
import { PRAMANA_META } from "@/lib/pramana/types";

const EXAMPLES = [
  {
    text: "Water boils at 100°C because we can measure it with a thermometer.",
    label: "Pratyakṣa",
    sub: "Direct Perception",
  },
  {
    text: "There must be life on other planets because the universe is infinite and harbors similar chemical compounds.",
    label: "Anumāna",
    sub: "Inference",
  },
  {
    text: "According to ancient texts, this particular herb cleanses the blood.",
    label: "Śabda",
    sub: "Testimony",
  },
];

const PRAMANA_ORDER: PramanaId[] = [
  "pratyaksha",
  "anumana",
  "upamana",
  "shabda",
];

function strengthColor(pct: number): string {
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  if (pct >= 30) return "bg-orange-400";
  return "bg-red-400";
}

export function PramanaExplorer() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PramanaAnalyzeResponse | null>(null);
  const [examplesOpen, setExamplesOpen] = useState(false);

  async function handleAnalyze() {
    const text = claim.trim();
    if (!text) {
      setError("Please enter a claim to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/pramana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data as PramanaAnalyzeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function selectExample(text: string) {
    setClaim(text);
    setExamplesOpen(false);
    setError(null);
  }

  const dominantMeta = result
    ? PRAMANA_META[result.dominant_pramana]
    : null;
  const strengthPct = result ? Math.round(result.strength * 100) : 0;

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-12 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          pramāṇa · means of valid knowledge
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Prāmāṇa Explorer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Classify how a claim grounds its truth — through perception, inference,
          comparison, or testimony — and assess its epistemological strength.
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          प्रत्यक्ष · अनुमान · उपमान · शब्द
        </p>
      </header>

      <section className="relative mb-10 rounded-2xl suite-card p-6 sm:p-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setExamplesOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-hover"
            aria-expanded={examplesOpen}
          >
            <span className="font-serif text-sm text-accent-strong">
              Examples &amp; References
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
            <div className="mt-3 space-y-2 animate-in">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => selectExample(ex.text)}
                  className="group w-full rounded-xl border border-border bg-input px-4 py-3 text-left transition-all hover:border-accent/30 hover:bg-accent-muted/30"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="badge-accent inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
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
          htmlFor="claim"
          className="mb-3 block font-serif text-lg text-accent-strong"
        >
          Enter Your Claim
        </label>
        <p className="mb-4 text-sm text-muted">
          Present a statement, belief, or assertion. The explorer will identify
          which classical pramāṇas ground it and evaluate epistemic strength.
        </p>
        <textarea
          id="claim"
          rows={6}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
          }}
          placeholder="e.g. I saw lightning strike the tree, so the storm must be directly overhead."
          className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25 min-h-[140px]"
          disabled={loading}
        />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-subtle">
            {result
              ? `Analyzed via ${result.analyzer}`
              : "Works without API key — heuristic fallback enabled"}
          </p>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !claim.trim()}
            className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Examining pramāṇas…
              </>
            ) : (
              "Explore Epistemic Grounds"
            )}
          </button>
        </div>
      </section>

      {error && (
        <p className="error-panel mb-6 rounded-xl px-4 py-3 text-center text-sm font-mono">
          {error}
        </p>
      )}

      {result && dominantMeta && (
        <section className="animate-in space-y-6">
          <blockquote className="border-l-2 border-accent/30 pl-4 text-muted italic">
            &ldquo;{result.claim}&rdquo;
          </blockquote>

          <div className="rounded-2xl suite-card p-6 text-center ring-2 ring-accent/20">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
              Dominant Pramāṇa
            </p>
            <p className="font-serif text-3xl font-bold text-accent-strong">
              {dominantMeta.label}
            </p>
            <p className="mt-1 font-mono text-sm text-muted">
              {dominantMeta.sanskrit} · {dominantMeta.description}
            </p>
          </div>

          <div className="rounded-2xl suite-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-serif text-lg text-accent-strong">
                Epistemological Strength
              </p>
              <span className="font-mono text-sm text-muted">
                {strengthPct}% · {result.strength_label}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all duration-700 ${strengthColor(strengthPct)}`}
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-subtle">
              How robustly the claim is grounded in valid means of knowledge
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl text-accent-strong">
              Pramāṇa Breakdown
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PRAMANA_ORDER.map((id) => {
                const meta = PRAMANA_META[id];
                const detail = result.pramanas[id];
                const isDominant = result.dominant_pramana === id;

                return (
                  <div
                    key={id}
                    className={`rounded-xl suite-card p-5 ${
                      isDominant ? "ring-1 ring-accent/30" : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="badge-accent inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs text-subtle">
                          {meta.sanskrit}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-xs ${
                          detail.detected
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-border text-subtle"
                        }`}
                      >
                        {detail.detected ? "detected" : "not detected"}
                      </span>
                    </div>
                    <p className="mb-2 text-sm leading-relaxed text-body">
                      <span className="font-medium text-heading">Role: </span>
                      {detail.role}
                    </p>
                    <p className="text-sm leading-relaxed text-muted">
                      <span className="font-medium text-body">Critique: </span>
                      {detail.critique}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl suite-card p-6">
            <h2 className="mb-3 font-serif text-lg text-accent-strong">
              Philosophical Critique
            </h2>
            <p className="text-sm leading-relaxed text-body">
              {result.philosophical_critique}
            </p>
          </div>
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Prāmāṇa Explorer · How do we know what we claim to know?
      </footer>
    </div>
  );
}
