"use client";

import { useEffect, useRef, useState } from "react";

import type {
  DebateConcludeResponse,
  DebateMessage,
  DebateSchool,
} from "@/lib/debate/types";
import { DEBATE_SCHOOLS, SCHOOL_META } from "@/lib/debate/types";

const PREMISES = [
  {
    text: "Suffering is entirely self-created through mental attachment, so external social reform is useless.",
    label: "vs Cārvāka / Buddhist",
    sub: "Challenge materialism or the Middle Way",
    school: "carvaka" as DebateSchool,
  },
  {
    text: "The physical universe is the sole reality; consciousness is just a byproduct of brain chemistry.",
    label: "vs Advaita Vedānta",
    sub: "Debate non-dual consciousness",
    school: "advaita" as DebateSchool,
  },
  {
    text: "True knowledge requires rigorous logical proof; unverified scriptural authority is invalid.",
    label: "vs Nyāya",
    sub: "Test a logical realist",
    school: "nyaya" as DebateSchool,
  },
];

export function VadaKatha() {
  const [school, setSchool] = useState<DebateSchool>("nyaya");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DebateConcludeResponse | null>(null);
  const [premisesOpen, setPremisesOpen] = useState(false);
  const [inArena, setInArena] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, summary]);

  function selectPremise(text: string, suggestedSchool: DebateSchool) {
    setInput(text);
    setSchool(suggestedSchool);
    setPremisesOpen(false);
    setError(null);
    setSummary(null);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    const userMessage: DebateMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setInArena(true);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          school,
          message: text,
          history: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Debate failed");

      if (Array.isArray(data.history)) {
        setMessages(data.history);
      } else if (data.reply) {
        setMessages([
          ...nextMessages,
          { role: "opponent", content: data.reply },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }

  async function concludeDebate() {
    if (messages.length === 0 || concluding) return;

    setConcluding(true);
    setError(null);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "conclude",
          school,
          history: messages,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not conclude");

      setSummary(data as DebateConcludeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setConcluding(false);
    }
  }

  function resetArena() {
    setMessages([]);
    setInput("");
    setSummary(null);
    setError(null);
    setInArena(false);
  }

  const opponent = SCHOOL_META[school];

  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="relative mb-10 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          vāda-kathā · classical debate arena
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-wide text-accent-strong sm:text-5xl">
          Vāda-Katha
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted">
          Enter the arena of classical Indian debate. Present your thesis and
          face a rigorous philosophical opponent from the darśana of your
          choosing.
        </p>
        <p className="mt-2 font-mono text-xs text-subtle">
          परिषद् · वितर्क · निग्रहस्थान
        </p>
      </header>

      {!inArena && (
        <section className="relative mb-8 rounded-2xl suite-card p-6 sm:p-8">
          <h2 className="mb-4 font-serif text-lg text-accent-strong">
            Choose Your Opponent
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEBATE_SCHOOLS.map((id) => {
              const meta = SCHOOL_META[id];
              const selected = school === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSchool(id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    selected
                      ? "border-accent/40 bg-accent-muted/40 ring-1 ring-accent/25"
                      : "border-border bg-input hover:border-border-hover"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`debate-avatar ${meta.badgeClass}`}
                      aria-hidden
                    >
                      {meta.avatar}
                    </span>
                    <span className="font-serif text-sm font-medium text-heading">
                      {meta.label}
                    </span>
                    <span className="font-mono text-xs text-subtle">
                      {meta.sanskrit}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    {meta.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setPremisesOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-border-hover"
              aria-expanded={premisesOpen}
            >
              <span className="font-serif text-sm text-accent-strong">
                Examples &amp; References / Starting Premises
              </span>
              <svg
                className={`h-4 w-4 text-muted transition-transform ${premisesOpen ? "rotate-180" : ""}`}
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

            {premisesOpen && (
              <div className="mt-3 space-y-2">
                {PREMISES.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => selectPremise(p.text, p.school)}
                    className="group w-full rounded-xl border border-border bg-input px-4 py-3 text-left transition-all hover:border-accent/30 hover:bg-accent-muted/30"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="badge-accent inline-block rounded px-2 py-0.5 font-mono text-xs font-medium">
                        {p.label}
                      </span>
                      <span className="font-mono text-xs text-subtle">
                        {p.sub}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-body group-hover:text-heading">
                      {p.text}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label
            htmlFor="opening"
            className="mt-6 mb-3 block font-serif text-lg text-accent-strong"
          >
            Opening Argument
          </label>
          <textarea
            id="opening"
            rows={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage();
            }}
            placeholder="State your thesis boldly — the arena awaits…"
            className="w-full resize-y rounded-xl border border-border bg-input px-4 py-3 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25 min-h-[120px]"
            disabled={loading}
          />

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-primary inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Summoning opponent…
                </>
              ) : (
                <>Enter the Arena</>
              )}
            </button>
          </div>
        </section>
      )}

      {inArena && (
        <section className="debate-arena relative rounded-2xl suite-card overflow-hidden">
          <div className="debate-arena__header flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span
                className={`debate-avatar debate-avatar--lg ${opponent.badgeClass}`}
              >
                {opponent.avatar}
              </span>
              <div>
                <p className="font-serif text-sm font-medium text-heading">
                  Arena · vs {opponent.label}
                </p>
                <p className="font-mono text-xs text-subtle">
                  {opponent.sanskrit}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={concludeDebate}
                disabled={concluding || messages.length < 2}
                className="rounded-full border border-accent/30 bg-accent-muted/30 px-4 py-1.5 text-xs font-medium text-accent-strong transition-colors hover:bg-accent-muted/50 disabled:opacity-40"
              >
                {concluding ? "Concluding…" : "Conclude Debate"}
              </button>
              <button
                type="button"
                onClick={resetArena}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:text-body"
              >
                Leave Arena
              </button>
            </div>
          </div>

          <div className="debate-arena__chat max-h-[28rem] overflow-y-auto px-4 py-6 sm:px-6">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[85%] gap-2.5 sm:max-w-[75%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <span
                    className={`debate-avatar shrink-0 ${
                      msg.role === "user"
                        ? "debate-badge--user"
                        : opponent.badgeClass
                    }`}
                    aria-hidden
                  >
                    {msg.role === "user" ? "🗡" : opponent.avatar}
                  </span>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "debate-bubble--user"
                        : "debate-bubble--opponent"
                    }`}
                  >
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-subtle">
                      {msg.role === "user" ? "Challenger" : opponent.label}
                    </p>
                    <p className="text-sm leading-relaxed text-body">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="mb-4 flex justify-start">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`debate-avatar ${opponent.badgeClass}`}
                    aria-hidden
                  >
                    {opponent.avatar}
                  </span>
                  <div className="debate-bubble--opponent rounded-2xl px-4 py-3">
                    <span className="inline-flex gap-1">
                      <span className="debate-typing-dot" />
                      <span className="debate-typing-dot" />
                      <span className="debate-typing-dot" />
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {!summary && (
            <div className="border-t border-border px-4 py-4 sm:px-6">
              <div className="flex gap-3">
                <textarea
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Your rejoinder…"
                  className="min-h-[52px] flex-1 resize-none rounded-xl border border-border bg-input px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/25"
                  disabled={loading || concluding}
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading || concluding || !input.trim()}
                  className="btn-primary shrink-0 self-end rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {error && (
        <p className="error-panel mt-6 rounded-xl px-4 py-3 text-center text-sm font-mono">
          {error}
        </p>
      )}

      {summary && (
        <section className="mt-8 animate-in space-y-6">
          <div className="rounded-2xl suite-card p-6 text-center ring-2 ring-accent/20">
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-subtle">
              Debate Concluded
            </p>
            <p className="font-serif text-xl text-accent-strong">
              Vāda Summary
            </p>
          </div>

          <div className="rounded-2xl suite-card p-6">
            <h2 className="mb-3 font-serif text-lg text-accent-strong">
              Overview
            </h2>
            <p className="text-sm leading-relaxed text-body">{summary.summary}</p>
          </div>

          <div className="rounded-2xl suite-card p-6">
            <h2 className="mb-3 font-serif text-lg text-accent-strong">
              Verdict
            </h2>
            <p className="text-sm leading-relaxed text-body">{summary.verdict}</p>
          </div>

          <div className="rounded-2xl suite-card p-6">
            <h2 className="mb-3 font-serif text-lg text-accent-strong">
              Key Points
            </h2>
            <ul className="space-y-2">
              {summary.key_points.map((point, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm leading-relaxed text-body"
                >
                  <span className="font-mono text-accent">·</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl suite-card p-5">
              <h3 className="mb-2 font-serif text-sm text-accent-strong">
                Challenger&apos;s Strengths
              </h3>
              <p className="text-sm text-muted">{summary.strengths_user}</p>
            </div>
            <div className="rounded-xl suite-card p-5">
              <h3 className="mb-2 font-serif text-sm text-accent-strong">
                {opponent.label}&apos;s Strengths
              </h3>
              <p className="text-sm text-muted">{summary.strengths_opponent}</p>
            </div>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={resetArena}
              className="btn-primary rounded-full px-8 py-3 text-sm font-semibold text-white"
            >
              New Debate
            </button>
          </div>
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-subtle">
        Vāda-Katha · Truth emerges through rigorous mutual examination
      </footer>
    </div>
  );
}
