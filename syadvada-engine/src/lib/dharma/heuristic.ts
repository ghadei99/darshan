import type {
  DharmaAnalyzeResponse,
  OptionAnalysis,
  PurusharthaId,
  PurusharthaImpact,
} from "./types";
import { PURUSHARTHA_META } from "./types";

const DHARMA_PATTERNS = [
  /\b(duty|dharma|ethical|moral|righteous|values?|integrity|honest|compliance|report|parents?|care|caring|family duty|responsibilit)\b/i,
  /\b(align|alignment|principle|virtue|justice|fair|truth)\b/i,
];

const ARTHA_PATTERNS = [
  /\b(pay|paying|salary|money|wealth|career|corporate|job|financial|security|growth|abroad|relocate)\b/i,
  /\b(prosper|economic|income|stable|advancement)\b/i,
];

const KAMA_PATTERNS = [
  /\b(creative|passion|fulfill|pleasure|joy|energy|drain|exhaust|love|desire|enjoy)\b/i,
  /\b(happiness|satisf|fulfilling|non-profit|meaningful)\b/i,
];

const MOKSHA_PATTERNS = [
  /\b(liberat|spiritual|moksha|freedom|transcend|inner|soul|growth|individual|self-?realiz)\b/i,
  /\b(detach|peace|wisdom|ultimate|higher purpose)\b/i,
];

function scorePatterns(text: string, patterns: RegExp[]): number {
  let score = 0;
  for (const p of patterns) {
    if (p.test(text)) score += 1;
  }
  return score;
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0.1, n));
}

function buildImpact(
  base: number,
  isPositive: boolean,
  shortBoost: number,
  longBoost: number,
  analysis: string,
): PurusharthaImpact {
  const magnitude = clamp(0.35 + base * 0.15);
  return {
    short_term: clamp(isPositive ? magnitude + shortBoost : magnitude - shortBoost),
    long_term: clamp(isPositive ? magnitude + longBoost : magnitude - longBoost),
    analysis,
  };
}

function analyzeOption(
  optionText: string,
  dilemmaText: string,
  isOptionA: boolean,
): OptionAnalysis {
  const combined = `${optionText} ${dilemmaText}`;
  const scores: Record<PurusharthaId, number> = {
    dharma: scorePatterns(combined, DHARMA_PATTERNS),
    artha: scorePatterns(combined, ARTHA_PATTERNS),
    kama: scorePatterns(combined, KAMA_PATTERNS),
    moksha: scorePatterns(combined, MOKSHA_PATTERNS),
  };

  const drain = /\b(drain|exhaust|tired|stress|burnout)\b/i.test(optionText);
  const creative = /\b(creative|values?|align|non-profit|passion)\b/i.test(optionText);
  const corporate = /\b(corporate|high-paying|pay|salary|career)\b/i.test(optionText);
  const report = /\b(report|compliance|violation|honest)\b/i.test(optionText);
  const compassion = /\b(compassion|colleague|family to support|close)\b/i.test(optionText);
  const parents = /\b(parents?|aging|care|caring|stay behind)\b/i.test(optionText);
  const abroad = /\b(abroad|relocate|individual|growth)\b/i.test(optionText);

  const analyses: Record<PurusharthaId, string> = {
    dharma: creative
      ? "Strong alignment with personal values and ethical purpose, though material sacrifice may strain familial obligations."
      : report
        ? "Upholds institutional integrity and truth-telling, but may cause harm to a dependent colleague."
        : parents
          ? "Honors filial duty (pitṛ-dharma) and caregiving — a cornerstone of classical ethics."
          : corporate
            ? "May compromise dharmic alignment if work conflicts with inner conscience or social good."
            : "Moderate dharmic weight — duty considerations are present but not dominant.",
    artha: corporate
      ? "Substantial material gain and career capital in the short and long term."
      : creative
        ? "Limited financial security; artha is deprioritized for other puruṣārthas."
        : abroad
          ? "Significant career and economic opportunity through geographic mobility."
          : parents
            ? "May preserve local stability but forego major economic advancement."
            : "Moderate material implications — neither extreme wealth nor poverty.",
    kama: drain
      ? "Low kāma fulfillment — energy depletion undermines pleasure and sustainable desire."
      : creative
        ? "High aesthetic and emotional fulfillment through meaningful, values-aligned work."
        : compassion && !report
          ? "Preserves relational harmony and compassion — a form of emotional satisfaction."
          : corporate && !drain
            ? "Status and comfort may satisfy worldly desires, but hollow if misaligned."
            : "Mixed kāma — pleasure and fulfillment depend on inner alignment with the choice.",
    moksha: abroad
      ? "Individual spiritual/career liberation through expanded horizons and self-authorship."
      : parents
        ? "Mokṣa through service and duty — liberation found in fulfilling right action, not escape."
      : creative
        ? "Path toward authentic self-expression — a stepping stone to inner freedom."
      : corporate && drain
        ? "Risk of binding karma through sustained misalignment — mokṣa recedes when energy is drained."
        : "Moderate mokṣa potential — spiritual growth depends on consciousness brought to the choice.",
  };

  const shortMod = isOptionA ? 0.05 : 0;
  const longMod = isOptionA ? 0 : 0.05;

  return {
    dharma: buildImpact(
      scores.dharma,
      scores.dharma >= 2 || creative || report || parents,
      shortMod,
      longMod + (parents ? 0.1 : 0),
      analyses.dharma,
    ),
    artha: buildImpact(
      scores.artha,
      corporate || abroad,
      corporate ? 0.15 : 0,
      corporate || abroad ? 0.1 : -0.05,
      analyses.artha,
    ),
    kama: buildImpact(
      scores.kama,
      creative || (compassion && !report),
      drain ? -0.15 : 0.05,
      creative ? 0.1 : drain ? -0.1 : 0,
      analyses.kama,
    ),
    moksha: buildImpact(
      scores.moksha,
      creative || parents || abroad,
      drain ? -0.1 : 0,
      abroad || creative ? 0.1 : drain ? -0.15 : 0.05,
      analyses.moksha,
    ),
  };
}

function detectTension(
  a: OptionAnalysis,
  b: OptionAnalysis,
): string {
  const pairs: [PurusharthaId, PurusharthaId][] = [
    ["dharma", "artha"],
    ["dharma", "kama"],
    ["artha", "moksha"],
    ["kama", "moksha"],
  ];

  let bestPair = pairs[0];
  let bestGap = 0;

  for (const [p1, p2] of pairs) {
    const gapA = Math.abs(a[p1].long_term - a[p2].long_term);
    const gapB = Math.abs(b[p1].long_term - b[p2].long_term);
    const gap = gapA + gapB;
    if (gap > bestGap) {
      bestGap = gap;
      bestPair = [p1, p2];
    }
  }

  return `${PURUSHARTHA_META[bestPair[0]].label} vs ${PURUSHARTHA_META[bestPair[1]].label}`;
}

function synthesize(
  dilemma: string,
  optionA: string,
  optionB: string,
  matrix: DharmaAnalyzeResponse["matrix"],
  tension: string,
): { synthesis: string; recommendation: string } {
  const aDharma = matrix.option_a.dharma.long_term;
  const bDharma = matrix.option_b.dharma.long_term;
  const aArtha = matrix.option_a.artha.long_term;
  const bArtha = matrix.option_b.artha.long_term;
  const aKama = matrix.option_a.kama.long_term;
  const bKama = matrix.option_b.kama.long_term;

  const synthesis = `This dilemma sits at the intersection of ${tension} — a classic puruṣārtha tension recognized across the Itihāsas and Dharmaśāstras. Neither option is purely "right"; each nourishes some goals while constraining others. The Bhagavad Gītā teaches karmany evādhikāras te (II.47): you have authority over action, not over fruits. The wise deliberator weighs short-term pressures against long-term character and cosmic order (ṛta).`;

  let lean: string;
  if (bDharma > aDharma + 0.1 && bKama > aKama) {
    lean = `Option B ("${optionB.slice(0, 50)}…") appears stronger on dharma and sustainable fulfillment over the long arc.`;
  } else if (aArtha > bArtha + 0.15 && aDharma >= bDharma - 0.1) {
    lean = `Option A offers meaningful artha without catastrophic dharma compromise — but monitor for kāma depletion.`;
  } else if (bDharma > aDharma) {
    lean = `Option B aligns more closely with dharmic duty, even at material cost.`;
  } else if (aArtha > bArtha && bDharma <= aDharma) {
    lean = `Option A serves artha and worldly security; ensure dharma is not silently sacrificed.`;
  } else {
    lean = `Both paths hold merit; the decisive factor may lie outside the matrix — in dialogue with mentors, family, and your own antaḥkaraṇa (inner conscience).`;
  }

  const recommendation = `${lean} Consider a hybrid path if possible: can elements of both options be integrated? Classical ethics does not demand absolute renunciation — it demands conscious choice (saṅkalpa) with full awareness of trade-offs. Reflect: which choice will you respect in ten years? Which builds the person you wish to become?`;

  return { synthesis, recommendation };
}

export function heuristicAnalyze(
  dilemma: string,
  optionA: string,
  optionB: string,
): DharmaAnalyzeResponse {
  const matrix = {
    option_a: analyzeOption(optionA, dilemma, true),
    option_b: analyzeOption(optionB, dilemma, false),
  };

  const tension = detectTension(matrix.option_a, matrix.option_b);
  const { synthesis, recommendation } = synthesize(
    dilemma,
    optionA,
    optionB,
    matrix,
    tension,
  );

  return {
    dilemma: dilemma.trim(),
    option_a: optionA.trim(),
    option_b: optionB.trim(),
    matrix,
    dominant_tension: tension,
    synthesis,
    recommendation,
    analyzer: "heuristic",
  };
}
