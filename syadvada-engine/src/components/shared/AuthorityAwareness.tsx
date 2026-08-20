export function AuthorityAwareness() {
  return (
    <section
      aria-labelledby="authority-heading"
      className="relative mb-20 rounded-3xl border border-border p-8 sm:p-10"
      style={{ background: "var(--card-bg)" }}
    >
      <p className="mb-3 font-mono text-xs tracking-[0.3em] text-accent/80 uppercase">
        Source awareness
      </p>
      <h2
        id="authority-heading"
        className="font-serif text-xl font-semibold text-heading sm:text-2xl"
      >
        Don&apos;t get fooled by authority
      </h2>
      <div className="mt-5 grid gap-x-10 gap-y-3 text-[15px] leading-relaxed text-muted sm:grid-cols-2">
        <p>Speaking in Sanskrit doesn&apos;t make a claim ancient.</p>
        <p>A quote attributed to a famous name isn&apos;t automatically theirs.</p>
        <p>A verse circulating online isn&apos;t automatically found in scripture.</p>
        <p>&ldquo;Scientists proved it&rdquo; isn&apos;t automatically evidence.</p>
        <p>
          &ldquo;A guru said it&rdquo; isn&apos;t automatically beyond
          question — and Nyāya has a name for that move: śabda-doṣa,
          testimony taken as proof without being examined.
        </p>
        <p>
          &ldquo;Ancient India knew X&rdquo; requires an actual historical
          source, not a resemblance someone noticed centuries later.
        </p>
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-subtle">
        This isn&apos;t a case against tradition or belief. It&apos;s the
        opposite: Indian intellectual traditions themselves — especially
        Nyāya and Prāmāṇa-śāstra — developed some of the most careful methods
        anywhere for asking <em>how</em> a claim is known before accepting it.
        That habit of examination is one of the strongest reasons this tool
        exists.
      </p>
    </section>
  );
}
