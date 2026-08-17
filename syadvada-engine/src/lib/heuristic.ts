import {
  AnalyzeResponse,
  PERSPECTIVE_IDS,
  PERSPECTIVE_META,
  type Perspective,
  type PerspectiveId,
} from "./types";

const ABSOLUTE_PATTERN =
  /\b(always|never|everyone|no one|all|none|must|impossible|undeniable|obviously|clearly|only|best|worst|perfect|total)\b/i;
const POLARIZING_PATTERN =
  /\b(either|or else|versus|against|debate|controversy|polarizing|divisive|radical|extreme)\b/i;
const CONDITIONAL_PATTERN =
  /\b(sometimes|often|may|might|could|perhaps|in some cases|depending|context|relative)\b/i;

const STAKEHOLDER_LENSES: Record<PerspectiveId, string> = {
  "syat-asti": "Primary beneficiary / advocate stakeholder",
  "syat-nasti": "Dissenting minority / harmed party",
  "syat-asti-nasti": "Cross-functional teams with split incentives",
  "syat-avaktavya": "Regulators & ethicists facing incomplete data",
  "syat-asti-avaktavya": "Investors weighing upside amid uncertainty",
  "syat-nasti-avaktavya": "Frontline workers experiencing harm without clear metrics",
  "syat-asti-nasti-avaktavya": "Civic society holding plural, unresolved views",
};

function truncateStatement(text: string, max = 120): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function detectTone(text: string): "absolute" | "polarized" | "nuanced" {
  if (ABSOLUTE_PATTERN.test(text)) return "absolute";
  if (POLARIZING_PATTERN.test(text)) return "polarized";
  if (CONDITIONAL_PATTERN.test(text)) return "nuanced";
  return "absolute";
}

function classicalFor(id: PerspectiveId, statement: string, tone: string): string {
  const s = truncateStatement(statement);
  const templates: Record<PerspectiveId, string> = {
    "syat-asti": `From a particular standpoint — temporal, spatial, or contextual — the claim "${s}" holds a measure of truth. A defender might cite evidence, lived experience, or tradition where this assertion accurately describes reality.`,
    "syat-nasti": `Under other conditions — different time, place, or frame of reference — the same claim "${s}" fails to hold. Counterexamples, exceptions, or alternate interpretations reveal where the statement does not apply.`,
    "syat-asti-nasti": `The proposition "${s}" is simultaneously affirmed and denied when viewed from multiple valid perspectives at once. What is true for one community or moment may be false for another without either side being wholly mistaken.`,
    "syat-avaktavya": `Regarding "${s}", language itself reaches a limit. The phenomenon may transcend binary description — too complex, emergent, or ineffable to be captured by simple affirmation or denial.`,
    "syat-asti-avaktavya": `In one respect "${s}" is demonstrably so, yet the full nature of what is affirmed resists complete articulation. We can point to it without exhausting its meaning.`,
    "syat-nasti-avaktavya": `The negation of "${s}" carries weight in some contexts, but the underlying reality behind that negation remains partially opaque — we sense what is not, without full clarity on why or how.`,
    "syat-asti-nasti-avaktavya": `The seven-fold truth of "${s}" converges here: affirmation, negation, and indescribability coexist. No single verdict captures the whole; multiplicity itself is the accurate response.`,
  };

  if (tone === "nuanced" && id === "syat-asti-nasti") {
    return `The statement "${s}" already gestures toward conditionality — Syādvāda reveals that its partial truth and partial falsity are not contradictions but co-present aspects of a multifaceted reality.`;
  }

  if (tone === "absolute" && id === "syat-nasti") {
    return `The absolutism of "${s}" invites Syādvāda's corrective: in some respect it is not so. Universal quantifiers ("always," "never," "all") conceal exceptions that classical Jain logic insists we acknowledge.`;
  }

  return templates[id];
}

function stakeholderFor(id: PerspectiveId, statement: string, tone: string): string {
  const s = truncateStatement(statement);
  const lens = STAKEHOLDER_LENSES[id];

  const templates: Record<PerspectiveId, string> = {
    "syat-asti": `Through the ${lens} lens: stakeholders who benefit from "${s}" can marshal data, testimonials, and ROI narratives showing the claim delivers value — for them, in their context, it is.`,
    "syat-nasti": `Through the ${lens} lens: those bearing costs of "${s}" document harms, inequities, or failures — for this group, in their lived conditions, the claim is not.`,
    "syat-nasti-avaktavya": `Through the ${lens} lens: harm from "${s}" is felt viscerally yet poorly measured — exit interviews, burnout, and quiet attrition signal "it is not" while dashboards stay ambiguous.`,
    "syat-asti-nasti": `Through the ${lens} lens: "${s}" splits internal stakeholders — sales sees opportunity where operations sees risk; both readings are operationally real within the same organization.`,
    "syat-avaktavya": `Through the ${lens} lens: "${s}" triggers policy debate before evidence matures — the claim is not yet decidable, and premature labeling would mislead markets or citizens.`,
    "syat-asti-avaktavya": `Through the ${lens} lens: early adopters of "${s}" report gains, but the long-term stakeholder impact (communities, supply chains) remains unquantified — upside is real yet incomplete.`,
    "syat-asti-nasti-avaktavya": `Through the ${lens} lens: public hearings on "${s}" surface advocates, critics, and those who say the question itself is malformed — civic pluralism mirrors the full seven-fold response.`,
  };

  if (tone === "polarized" && id === "syat-asti-nasti") {
    return `Through the ${lens} lens: "${s}" maps onto opposing campaign narratives — each coalition's stakeholder story is internally coherent yet mutually exclusive at the ballot box.`;
  }

  return templates[id];
}

function buildPerspective(id: PerspectiveId, statement: string, tone: string): Perspective {
  const meta = PERSPECTIVE_META[id];
  return {
    id,
    sanskrit: meta.sanskrit,
    label: meta.label,
    classical: classicalFor(id, statement, tone),
    stakeholder: stakeholderFor(id, statement, tone),
  };
}

export function heuristicAnalyze(statement: string): AnalyzeResponse {
  const text = statement.trim();
  const tone = detectTone(text);

  const perspectives: Perspective[] = PERSPECTIVE_IDS.map((id) =>
    buildPerspective(id, text, tone),
  );

  return {
    statement: text,
    analyzer: "heuristic",
    perspectives,
  };
}
