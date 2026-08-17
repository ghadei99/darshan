"use client";

import { useState } from "react";

import { warnIfHeuristicFallback } from "@/lib/analyzer-status";
import type { AnalyzeResponse } from "@/lib/types";

import { PerspectiveGrid } from "./PerspectiveGrid";
import { ViewToggle } from "./ViewToggle";

export function SyadvadaEngine() {
  const [statement, setStatement] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [viewMode, setViewMode] = useState<"classical" | "stakeholder">(
    "classical",
  );
  const [copied, setCopied] = useState(false);

  async function handleShatter() {
    const text = statement.trim();
    if (!text) {
      setError("Enter a statement to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/syadvada/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data as AnalyzeResponse);
      warnIfHeuristicFallback((data as AnalyzeResponse).analyzer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function copyAllPerspectives() {
    if (!result) return;

    const lines = result.perspectives.map((p, i) => {
      const content = viewMode === "classical" ? p.classical : p.stakeholder;
      return `${i + 1}. ${p.sanskrit} — ${p.label}\n${content}`;
    });

    const header =
      viewMode === "classical"
        ? "Classical Saptabhaṅgī"
        : "Modern Stakeholder View";

    const text = `Syādvāda Analysis: ${result.statement}\n${header}\n\n${lines.join("\n\n")}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-16 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          Saptabhaṅgī · Seven-fold Logic
        </p>
        <h1 className="text-4xl font-light tracking-tight text-heading sm:text-5xl">
          Syādvāda{" "}
          <span className="text-accent">Engine</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Shatter rigid absolutes through Jain conditional predication — seven
          nuanced perspectives on any polarizing claim.
        </p>
      </header>

      <section className="relative mb-12">
        <div className="rounded-3xl suite-card p-6 sm:p-8">
          <label htmlFor="statement" className="sr-only">
            Statement to analyze
          </label>
          <textarea
            id="statement"
            rows={4}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Enter an absolute opinion, polarizing statement, or rigid problem..."
            className="w-full resize-none bg-transparent text-lg leading-relaxed text-foreground placeholder:text-subtle focus:outline-none"
            disabled={loading}
          />
          <div className="mt-6 flex justify-center sm:justify-end">
            <button
              type="button"
              onClick={handleShatter}
              disabled={loading || !statement.trim()}
              className="btn-primary group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Shattering perspective…
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12.5 3H21"
                    />
                  </svg>
                  Shatter Perspective
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}
      </section>

      {result && (
        <section className="animate-in fade-in duration-700">
          <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            <button
              type="button"
              onClick={copyAllPerspectives}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm text-muted transition-colors hover:text-accent-strong"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? "Copied!" : "Copy All Perspectives"}
            </button>
          </div>

          <blockquote className="mb-8 border-l-2 border-accent/30 pl-4 text-muted italic">
            &ldquo;{result.statement}&rdquo;
          </blockquote>

          <PerspectiveGrid perspectives={result.perspectives} viewMode={viewMode} />
        </section>
      )}

      <footer className="mt-20 text-center text-xs text-subtle">
        Conditional truth · Anekāntavāda · No single perspective exhausts reality
      </footer>
    </div>
  );
}
