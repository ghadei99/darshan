const STEPS = [
  {
    n: "01",
    title: "Bring a question",
    body: "A claim, argument, ethical dilemma, belief, or statement you've heard somewhere.",
  },
  {
    n: "02",
    title: "Choose a lens",
    body: "Nyāya, Prāmāṇa, Yoga, Dharma, Debate, or Syādvāda — each examines a question differently.",
  },
  {
    n: "03",
    title: "Read the reasoning",
    body: "Don't just look at the final label. See how the system got there, step by step.",
  },
  {
    n: "04",
    title: "Check the source",
    body: "Notice what's a fixed traditional category, and what's the model's own generated reading.",
  },
  {
    n: "05",
    title: "Explore further",
    body: "Use the result as a doorway — look up the terms, question the reasoning, go deeper.",
  },
] as const;

export function HowToUse() {
  return (
    <section aria-labelledby="how-to-use-heading" className="relative mb-20">
      <div className="mb-10 text-center">
        <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
          Orientation
        </p>
        <h2
          id="how-to-use-heading"
          className="font-serif text-2xl font-semibold text-heading sm:text-3xl"
        >
          How to use Darshana Suite
        </h2>
      </div>

      <ol className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-5">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="flex flex-col gap-2 p-6"
            style={{ background: "var(--card-bg)" }}
          >
            <span className="font-mono text-xs tracking-[0.2em] text-accent">
              {step.n}
            </span>
            <h3 className="font-serif text-base font-medium text-heading">
              {step.title}
            </h3>
            <p className="text-[13px] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
