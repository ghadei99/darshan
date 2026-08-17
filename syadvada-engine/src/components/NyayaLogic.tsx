"use client";

import { useState } from "react";

import { analyzerStatusLabel } from "@/lib/analyzer-status";
import type { NyayaAnalyzeResponse } from "@/lib/nyaya/types";

const STEPS = [
  { key: "pratijna" as const, label: "Pratijñā", sub: "Thesis" },
  { key: "hetu" as const, label: "Hetu", sub: "Reason" },
  { key: "udaharana" as const, label: "Udāharaṇa", sub: "Example" },
  { key: "upanaya" as const, label: "Upanaya", sub: "Application" },
  { key: "nigamana" as const, label: "Nigamana", sub: "Conclusion" },
];

const VALIDITY_COLORS: Record<string, string> = {
  valid: "text-emerald-500",
  "partially valid": "text-amber-500",
  invalid: "text-red-400",
};

export function NyayaLogic() {
  const [argument, setArgument] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NyayaAnalyzeResponse | null>(null);

  async function handleAnalyze() {
    const text = argument.trim();
    if (!text) {
      setError("Please enter an argument to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/nyaya/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argument: text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data as NyayaAnalyzeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const validityKey = (result?.validity ?? "").toLowerCase();

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-12 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          pañcāvayava · five-membered syllogism
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Nyāya-Logic
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Decompose arguments through classical Nyāya epistemology — Pratijñā,
          Hetu, Udāharaṇa, Upanaya, and Nigamana.
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          प्रतिज्ञा · हेतु · उदाहरण · उपनय · निगमन
        </p>
      </header>

      <section className="relative mb-10 rounded-2xl suite-card p-6 sm:p-8">
        <label
          htmlFor="argument"
          className="mb-3 block font-serif text-lg text-accent-strong"
        >
          Present Your Argument
        </label>
        <p className="mb-4 text-sm text-muted">
          Enter a political speech, philosophical claim, or essay passage. The
          sages will decompose it through classical Nyāya epistemology.
        </p>
        <textarea
          id="argument"
          rows={8}
          value={argument}
          onChange={(e) => setArgument(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze();
          }}
          placeholder="e.g. Democracy is essential for human flourishing, because it allows citizens to participate in governance. For example, nations with free elections tend to have higher civic trust. Therefore, democratic institutions should be strengthened."
          className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25 min-h-[180px]"
          disabled={loading}
        />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-subtle">
            {analyzerStatusLabel(result?.analyzer)}
          </p>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !argument.trim()}
            className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Consulting the sages…
              </>
            ) : (
              "Consult the Nyāya Sages"
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
        <section className="animate-in space-y-6">
          <div className="rounded-2xl suite-card p-6 text-center">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
              Syllogistic Validity
            </p>
            <p
              className={`font-serif text-3xl font-bold ${VALIDITY_COLORS[validityKey] ?? "text-heading"}`}
            >
              {result.validity}
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-serif text-xl text-accent-strong">
              The Five Avayavas
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {STEPS.map((step, i) => (
                <div
                  key={step.key}
                  className={`rounded-xl suite-card p-5 ${i === 4 ? "md:col-span-2" : ""}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="badge-accent inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                      {step.label}
                    </span>
                    <span className="font-mono text-xs text-subtle">
                      {step.sub}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-body">
                    {result.steps[step.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {result.fallacies.length > 0 && (
            <div className="error-panel rounded-2xl p-6">
              <h2 className="mb-3 font-serif text-lg">
                Detected Fallacies (Hetvābhāsa)
              </h2>
              <ul className="space-y-2">
                {result.fallacies.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-400" />
                    <span className="error-badge inline-block rounded px-2 py-1 font-mono text-xs">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Nyāya-Logic · Classical Indian epistemology meets modern discourse
      </footer>
    </div>
  );
}
