import Link from "next/link";

import { AuthorityAwareness } from "./AuthorityAwareness";
import { DarshanaIcon } from "./DarshanaIcon";
import { DiacriticsNote } from "./DiacriticsNote";
import { HowToUse } from "./HowToUse";
import { WhyUseThis } from "./WhyUseThis";

const modules = [
  {
    href: "/nyaya",
    title: "Nyāya-Logic",
    subtitle: "pañcāvayava · five-membered syllogism",
    description:
      "Classical syllogistic argument analysis through Pratijñā, Hetu, Udāharaṇa, Upanaya, and Nigamana — with hetvābhāsa fallacy detection.",
    sanskrit: "प्रतिज्ञा · हेतु · उदाहरण · उपनय · निगमन",
    accentClass: "module-accent--warm",
  },
  {
    href: "/pramana",
    title: "Prāmāṇa Explorer",
    subtitle: "pramāṇa · means of valid knowledge",
    description:
      "Identify how claims ground their truth — through perception, inference, comparison, or testimony — and assess epistemological strength.",
    sanskrit: "प्रत्यक्ष · अनुमान · उपमान · शब्द",
    accentClass: "module-accent--warm",
  },
  {
    href: "/yoga-analyzer",
    title: "Yoga-Sūtra Analyzer",
    subtitle: "citta-vṛtti · mental fluctuations",
    description:
      "Map emotional states to Patañjali's vṛttis and kleśas — with compassionate abhyāsa guidance for inner alignment.",
    sanskrit: "चित्तवृत्ति · क्लेश · अभ्यास",
    accentClass: "module-accent--yoga",
  },
  {
    href: "/dharma",
    title: "Dharma Dilemma Solver",
    subtitle: "puruṣārtha · four life goals",
    description:
      "Resolve ethical crossroads through Dharma, Artha, Kāma, and Mokṣa — with a side-by-side comparison matrix and wise synthesis.",
    sanskrit: "धर्म · अर्थ · काम · मोक्ष",
    accentClass: "module-accent--warm",
  },
  {
    href: "/debate",
    title: "Vāda-Katha",
    subtitle: "vāda · classical debate arena",
    description:
      "Enter the philosophical arena — debate Cārvāka, Advaita, Nyāya, or Mādhyamika opponents in rigorous classical Indian disputation.",
    sanskrit: "परिषद् · वितर्क · निग्रहस्थान",
    accentClass: "module-accent--cool",
  },
  {
    href: "/syadvada",
    title: "Syādvāda Engine",
    subtitle: "Anekāntavāda · Syādvāda · Saptabhaṅgī",
    description:
      "In the Jain philosophical framework, explore conditional predication (Syādvāda) and its sevenfold scheme (Saptabhaṅgī) — grounded in many-sidedness (Anekāntavāda).",
    sanskrit: "अनेकान्तवाद · स्याद्वाद · सप्तभङ्गी",
    accentClass: "module-accent--cool",
  },
];

export function LandingPage() {
  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="relative mb-20 text-center">
        <div className="mb-6 flex justify-center">
          <DarshanaIcon size={72} />
        </div>
        <p className="mb-4 font-mono text-xs tracking-[0.35em] text-accent/80 uppercase">
          Classical Indian Epistemology
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-heading sm:text-6xl">
          Darshana{" "}
          <span className="text-accent">Suite</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          A growing collection of reasoning tools drawn from the classical
          darśanas — syllogistic analysis, conditional logic, and other
          philosophical lenses — gathered in one calm, contemplative
          workspace.
        </p>
      </header>

      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group relative overflow-hidden rounded-3xl suite-card p-8 transition-all duration-500 hover:shadow-[var(--card-hover-shadow)]"
          >
            <div
              className={`pointer-events-none absolute inset-0 module-accent ${mod.accentClass} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
            />
            <div className="relative">
              <p className="font-mono text-xs tracking-[0.25em] text-accent/90 uppercase">
                {mod.subtitle}
              </p>
              <h2 className="mt-3 text-2xl font-medium text-heading transition-colors group-hover:text-accent-strong">
                {mod.title}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                {mod.description}
              </p>
              <p className="mt-4 font-mono text-xs text-subtle">
                {mod.sanskrit}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors group-hover:text-accent-strong">
                Enter module
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-24">
        <HowToUse />
        <WhyUseThis />
        <AuthorityAwareness />
        <DiacriticsNote />
      </div>

      <footer className="text-center text-xs text-subtle">
        Multiple valid standpoints · No single perspective exhausts reality
      </footer>
    </div>
  );
}
