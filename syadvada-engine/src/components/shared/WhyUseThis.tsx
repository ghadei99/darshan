import Link from "next/link";

const USE_CASES = [
  {
    href: "/nyaya",
    tag: "Arguments",
    prompt:
      "Someone states something confidently. How do I actually examine the reasoning?",
    tool: "Nyāya",
    example: "“If many people believe something, it must be true.”",
  },
  {
    href: "/pramana",
    tag: "Information",
    prompt: "How do I know whether a claim is actually supported, and by what kind of evidence?",
    tool: "Prāmāṇa",
    example: "“This Sanskrit quote proves ancient Indians already knew modern quantum physics.”",
  },
  {
    href: "/dharma",
    tag: "Ethical dilemmas",
    prompt: "I have two competing responsibilities. How can I think through them side by side?",
    tool: "Dharma",
    example: "“Should I choose what benefits me, or what I believe is right?”",
  },
  {
    href: "/yoga-analyzer",
    tag: "Mental patterns",
    prompt: "Why does the same kind of thought keep pulling me back?",
    tool: "Yoga",
    example: null,
  },
  {
    href: "/debate",
    tag: "Disagreement",
    prompt: "I disagree with someone. Can I understand their position before attacking it?",
    tool: "Debate",
    example: "“My friend and I disagree — does either argument actually follow?”",
  },
  {
    href: "/syadvada",
    tag: "Ambiguous questions",
    prompt: "Could two apparently contradictory positions each make sense from different standpoints?",
    tool: "Syādvāda",
    example: null,
  },
] as const;

export function WhyUseThis() {
  return (
    <section aria-labelledby="why-use-heading" className="relative mb-20">
      <div className="mb-4 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          Everyday reasoning
        </p>
        <h2
          id="why-use-heading"
          className="font-serif text-2xl font-semibold text-heading sm:text-3xl"
        >
          Why would an ordinary person use this?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          Philosophy doesn&apos;t settle every question. But these traditions
          built precise tools for examining an argument, weighing a claim, or
          sitting with a dilemma — tools worth having whether or not
          you’ve ever opened a philosophy book.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((useCase) => (
          <Link
            key={useCase.href}
            href={useCase.href}
            className="group flex flex-col gap-3 rounded-2xl border border-border p-6 transition-colors hover:border-border-hover"
            style={{ background: "var(--card-bg)" }}
          >
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent/80 uppercase">
              {useCase.tag}
            </p>
            <p className="text-[15px] leading-relaxed text-body">
              &ldquo;{useCase.prompt}&rdquo;
            </p>
            {useCase.example && (
              <p className="text-[13px] italic leading-relaxed text-subtle">
                e.g. {useCase.example}
              </p>
            )}
            <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-accent transition-colors group-hover:text-accent-strong">
              Try it with {useCase.tool}
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-subtle">
        None of these tools tell you who&apos;s right. They help you examine
        the reasoning — you stay the one doing the thinking.
      </p>
    </section>
  );
}
