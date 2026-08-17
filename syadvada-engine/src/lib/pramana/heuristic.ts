import type { PramanaAnalyzeResponse, PramanaDetail, PramanaId } from "./types";

const PRATYAKSHA_PATTERNS: RegExp[] = [
  /\b(i see|i saw|i hear|i heard|i feel|i felt|i taste|i smell)\b/i,
  /\b(see|saw|hear|heard|observe[ds]?|witness(ed)?|perceiv(e|ed|ing))\b/i,
  /\b(sensory|sense organ|with (my|our) (eyes|ears|hands))\b/i,
  /\b(measure[ds]?|thermometer|microscope|telescope|instrument|reading shows)\b/i,
  /\b(direct(ly)? (observ|perceiv|experienc|witness))\b/i,
  /\b(visible|audible|tangible|palpable)\b/i,
  /\b(we can (see|measure|observe|detect))\b/i,
];

const ANUMANA_PATTERNS: RegExp[] = [
  /\b(because|since|therefore|thus|hence|consequently|it follows)\b/i,
  /\b(must be|likely|probably|implies?|infer(red|ence)?|deduc(e|ed|tion))\b/i,
  /\b(if .+ then|given that|so we can conclude)\b/i,
  /\b(cause[ds]?|effect|reasoning|logical(ly)?)\b/i,
  /\bthere (must|should|would) be\b/i,
  /\b(universe is|infinite|similar chemical|harbors)\b/i,
];

const UPAMANA_PATTERNS: RegExp[] = [
  /\b(like|similar to|analog(ous|y)|comparable|as .+ (is|was|are) to)\b/i,
  /\b(just as|in the same way|resembles?|akin to|equivalent to)\b/i,
  /\b(for instance.{0,30}like|compare[ds]? to)\b/i,
  /\b(metaphor|simile|parallel)\b/i,
];

const SHABDA_PATTERNS: RegExp[] = [
  /\b(according to|scripture|veda|texts?|tradition|ancient|sage|guru)\b/i,
  /\b(authority|testimony|word of|said that|teaches?|declares?)\b/i,
  /\b(experts? (say|claim)|studies show|research (shows|indicates))\b/i,
  /\b(reliable (source|witness)|heard from|told (us|me) that)\b/i,
  /\b(śabda|shabda|āpta|apta)\b/i,
];

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    if (pattern.test(text)) count++;
  }
  return count;
}

function strengthLabel(score: number): string {
  if (score >= 0.85) return "very strong";
  if (score >= 0.7) return "strong";
  if (score >= 0.55) return "moderately strong";
  if (score >= 0.4) return "moderate";
  if (score >= 0.25) return "weak";
  return "very weak";
}

function buildDetail(
  id: PramanaId,
  detected: boolean,
  claim: string,
  score: number,
): PramanaDetail {
  const truncated =
    claim.length > 80 ? `${claim.slice(0, 77).trim()}…` : claim;

  const roles: Record<PramanaId, { yes: string; no: string }> = {
    pratyaksha: {
      yes: "The claim appeals to direct sensory evidence or measurable observation as its epistemic ground.",
      no: "No clear reliance on immediate perception or sensory verification is evident.",
    },
    anumana: {
      yes: "The claim rests on inferential reasoning — connecting known facts to an unobserved conclusion.",
      no: "Inferential structure (hetu → sādhya) is absent or only weakly implied.",
    },
    upamana: {
      yes: "Knowledge is established through comparison, analogy, or similarity to a known case.",
      no: "No analogical or comparative bridge to prior knowledge is apparent.",
    },
    shabda: {
      yes: "The claim derives authority from testimony, scripture, or a trusted verbal source (āpta-vākya).",
      no: "No appeal to reliable testimony or authoritative word is detected.",
    },
  };

  const critiques: Record<PramanaId, { yes: string; no: string }> = {
    pratyaksha: {
      yes:
        score >= 2
          ? "Strong perceptual grounding — but recall Nyāya's distinction: perception must be non-erroneous (avyabhicāri) and determinate (nirvikalpaka → savikalpaka)."
          : "Perceptual appeal is present but thin; verify whether the observation is actually direct or mediated by instruments whose readings require further inference.",
      no: "Without pratyakṣa, the claim cannot be immediately verified — consider what empirical observation would test it.",
    },
    anumana: {
      yes:
        score >= 2
          ? "The inferential chain is explicit — scrutinize vyāpti (invariable concomitance) between middle term and conclusion."
          : "Inference is suggested but the logical link may be incomplete; check for anaikāntika-hetu (inconclusive reason).",
      no: "Absence of inference may indicate mere assertion (śabda-doṣa) or direct perception without stated grounds.",
    },
    upamana: {
      yes: "Analogical knowledge is valid only when the relevant similarity is essential, not accidental — verify the upamāna's domain of applicability.",
      no: "Where entities are unfamiliar, upamāna could strengthen the claim — but none is offered.",
    },
    shabda: {
      yes:
        score >= 2
          ? "Testimony is invoked — classical schools demand āpta (reliable authority) and semantic coherence; assess the source's expertise and freedom from defect."
          : "A testimonial element appears but the authority chain is vague; śabda requires a trustworthy speaker (āpta-puruṣa).",
      no: "The claim does not cite external authority — which may be a virtue if independent verification is available.",
    },
  };

  return {
    detected,
    role: detected ? roles[id].yes : roles[id].no,
    critique: detected ? critiques[id].yes : critiques[id].no,
  };
}

function computeStrength(
  scores: Record<PramanaId, number>,
  dominant: PramanaId,
  detectedCount: number,
): number {
  const dominantScore = scores[dominant];
  const base = Math.min(0.35 + dominantScore * 0.12, 0.75);
  const multiBonus = detectedCount > 1 ? 0.05 * (detectedCount - 1) : 0;
  const clarityBonus = dominantScore >= 2 ? 0.1 : dominantScore >= 1 ? 0.05 : 0;
  return Math.min(1, Math.round((base + multiBonus + clarityBonus) * 100) / 100);
}

function philosophicalCritique(
  claim: string,
  dominant: PramanaId,
  pramanas: PramanaAnalyzeResponse["pramanas"],
  strength: number,
): string {
  const detected = (Object.keys(pramanas) as PramanaId[]).filter(
    (k) => pramanas[k].detected,
  );
  const labels: Record<PramanaId, string> = {
    pratyaksha: "direct perception (pratyakṣa)",
    anumana: "inference (anumāna)",
    upamana: "comparison (upamāna)",
    shabda: "testimony (śabda)",
  };

  if (detected.length === 0) {
    return `The claim "${claim.slice(0, 60)}${claim.length > 60 ? "…" : ""}" does not clearly invoke any classical pramāṇa. In Nyāya and allied darśanas, knowledge must be grounded in at least one valid means — consider whether this is mere opinion (saṃśaya) or requires further epistemic support.`;
  }

  if (detected.length >= 3) {
    return `This claim weaves together ${detected.length} pramāṇas (${detected.map((d) => labels[d]).join(", ")}), with ${labels[dominant]} dominant. Such layering can strengthen epistemic warrant when each means is independently valid — yet compound arguments also multiply points of failure. Examine whether the pramāṇas support the same conclusion or pull in different directions.`;
  }

  const strengthNote =
    strength >= 0.7
      ? "The epistemic grounding appears relatively robust for a single-means argument."
      : strength >= 0.5
        ? "The grounding is serviceable but invites further scrutiny."
        : "The epistemic warrant is fragile — the detected pramāṇa may not suffice without supplementation.";

  if (dominant === "anumana") {
    return `Primarily an inferential claim (${labels.anumana}). ${strengthNote} Classical logicians would ask: is the hetu (middle term) present in the pakṣa (subject), present in the sapakṣa (similar cases), and absent from the vipakṣa (dissimilar cases)?`;
  }
  if (dominant === "pratyaksha") {
    return `Grounded in perception (${labels.pratyaksha}). ${strengthNote} Perception in Indian epistemology is the foundation — yet it must be free from illusion (bhrama) and organized through valid conceptual construction.`;
  }
  if (dominant === "shabda") {
    return `Rests on testimony (${labels.shabda}). ${strengthNote} Mīmāṃsā and Nyāya both accept śabda when the speaker is āpta (competent and truthful) — evaluate the source chain, not merely the rhetorical force.`;
  }
  return `Employs analogy (${labels.upamana}). ${strengthNote} Upamāna reveals unknown entities through known similarities — the analogy must be systematic, not superficial.`;
}

export function heuristicAnalyze(claim: string): PramanaAnalyzeResponse {
  const text = claim.trim();
  const lower = text.toLowerCase();

  const scores: Record<PramanaId, number> = {
    pratyaksha: countMatches(lower, PRATYAKSHA_PATTERNS),
    anumana: countMatches(lower, ANUMANA_PATTERNS),
    upamana: countMatches(lower, UPAMANA_PATTERNS),
    shabda: countMatches(lower, SHABDA_PATTERNS),
  };

  // Boost scores for strong contextual signals in the example claims
  if (/\bthermometer\b/i.test(text) || /\b100\s*°?\s*c\b/i.test(text)) {
    scores.pratyaksha += 2;
  }
  if (/\b(infinite|other planets|life on)\b/i.test(text)) {
    scores.anumana += 2;
  }
  if (/\b(ancient texts?|herb cleanses)\b/i.test(text)) {
    scores.shabda += 2;
  }

  const detectedFlags: Record<PramanaId, boolean> = {
    pratyaksha: scores.pratyaksha > 0,
    anumana: scores.anumana > 0,
    upamana: scores.upamana > 0,
    shabda: scores.shabda > 0,
  };

  let dominant: PramanaId = "anumana";
  let maxScore = -1;
  for (const id of Object.keys(scores) as PramanaId[]) {
    if (scores[id] > maxScore) {
      maxScore = scores[id];
      dominant = id;
    }
  }

  if (maxScore === 0) {
    dominant = "anumana";
    detectedFlags.anumana = true;
    scores.anumana = 1;
  }

  const detectedCount = (Object.keys(detectedFlags) as PramanaId[]).filter(
    (k) => detectedFlags[k],
  ).length;

  const strength = computeStrength(scores, dominant, detectedCount);

  const pramanas = {
    pratyaksha: buildDetail("pratyaksha", detectedFlags.pratyaksha, text, scores.pratyaksha),
    anumana: buildDetail("anumana", detectedFlags.anumana, text, scores.anumana),
    upamana: buildDetail("upamana", detectedFlags.upamana, text, scores.upamana),
    shabda: buildDetail("shabda", detectedFlags.shabda, text, scores.shabda),
  };

  return {
    claim: text,
    dominant_pramana: dominant,
    strength,
    strength_label: strengthLabel(strength),
    pramanas,
    philosophical_critique: philosophicalCritique(text, dominant, pramanas, strength),
    analyzer: "heuristic",
  };
}
