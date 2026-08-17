import type {
  AbhyasaPractice,
  KleshaId,
  PatternDetail,
  VrittiId,
  YogaAnalyzeResponse,
} from "./types";
import { KLESHA_META, VRITTI_META } from "./types";

type ScoreMap<T extends string> = Record<T, number>;

const ASMITA_PATTERNS = [
  /\b(compare|comparing|comparison|peers?|colleagues?|what .+ think|judg(e|ment)|status|ego|self[- ]?worth|inadequa)\b/i,
  /\b(i am|i'm) (not )?(good|smart|worthy) enough\b/i,
  /\b(reputation|impress|validation|approval)\b/i,
];

const RAGA_PATTERNS = [
  /\b(attach|attachment|cling|craving|want|desire|need|can't stop|obsess)\b/i,
  /\b(compare|comparing|jealous|envy|fomo)\b/i,
  /\b(must have|can't let go|holding on)\b/i,
];

const AVIDYA_PATTERNS = [
  /\b(escape|avoid|numb|don't know why|confus|lost|unclear|unmotivat)\b/i,
  /\b(tired|exhaust|drain|hopeless|meaningless|pointless)\b/i,
  /\b(responsibilit|overwhelm|stuck)\b/i,
];

const DVESHA_PATTERNS = [
  /\b(anger|angry|rage|furious|resent|revenge|hatred|hate|bitter)\b/i,
  /\b(replay|replaying|ruminat|can't forgive|grudge)\b/i,
  /\b(argument|fight|wronged|unfair)\b/i,
];

const ABHINIVESHA_PATTERNS = [
  /\b(afraid|fear|anxious|anxiety|panic|terror|dread|worried|worry)\b/i,
  /\b(what if|worst case|can't lose|death|dying|survive)\b/i,
];

const NIDRA_PATTERNS = [
  /\b(sleep|sleeping|tired|fatigue|exhaust|letharg|sluggish|unmotivat)\b/i,
  /\b(escape|numb|withdraw|shut down|all day|bed)\b/i,
  /\b(no energy|can't get up|drowsy)\b/i,
];

const SMRITI_PATTERNS = [
  /\b(replay|replaying|remember|memory|past|again and again|keep thinking)\b/i,
  /\b(argument|incident|happened|what (he|she|they) said)\b/i,
  /\b(ruminat|dwell|stuck in the past)\b/i,
];

const VIPARYAYA_PATTERNS = [
  /\b(they (all|always)|everyone thinks|nobody|never|always)\b/i,
  /\b(i am (worthless|a failure|broken)|nothing will)\b/i,
  /\b(must be|definitely|certainly) (true|wrong|hate)\b/i,
];

const VIKALPA_PATTERNS = [
  /\b(what if|imagine|suppose|maybe they|probably thinks)\b/i,
  /\b(scenario|fantasy|worst case|catastroph)\b/i,
];

function scorePatterns(text: string, patterns: RegExp[]): number {
  let score = 0;
  for (const p of patterns) {
    if (p.test(text)) score += 1;
  }
  return score;
}

function dominant<T extends string>(scores: ScoreMap<T>, fallback: T): T {
  let best = fallback;
  let bestScore = -1;
  for (const [key, val] of Object.entries(scores) as [T, number][]) {
    if (val > bestScore) {
      bestScore = val;
      best = key;
    }
  }
  return best;
}

function intensity(score: number, max = 4): number {
  return Math.min(1, Math.max(0.15, score / max));
}

function buildVrittiDetail(
  id: VrittiId,
  detected: boolean,
  score: number,
  journal: string,
): PatternDetail {
  const insights: Record<VrittiId, { yes: string; no: string }> = {
    pramana: {
      yes: "Moments of clear, grounded awareness are present — a foundation for abhyāsa.",
      no: "Little stable pramāṇa (correct knowledge) is evident; the mind is caught in fluctuation.",
    },
    viparyaya: {
      yes: "Viparyaya (misconception) colors perception — false conclusions mistaken for reality, as Patañjali warns in YS I.8.",
      no: "No strong viparyaya detected; perceptions may be closer to direct experience.",
    },
    vikalpa: {
      yes: "Vikalpa (imagination) weaves scenarios without substance — the mind constructs what is not present.",
      no: "Imaginative elaboration is minimal; experience feels more anchored.",
    },
    nidra: {
      yes: "Nidrā (sleep/dullness) pervades — tamas obscures clarity, pulling consciousness toward withdrawal.",
      no: "Alertness is relatively preserved; dullness is not the dominant vṛtti.",
    },
    smriti: {
      yes: "Smṛti (memory) dominates — past impressions (saṃskāra) replay and disturb present stillness (YS I.11).",
      no: "Memory-fluctuation is subdued; less bound to past impressions.",
    },
  };

  return {
    detected,
    intensity: detected ? intensity(score) : 0.1,
    insight: detected ? insights[id].yes : insights[id].no,
  };
}

function buildKleshaDetail(
  id: KleshaId,
  detected: boolean,
  score: number,
): PatternDetail {
  const insights: Record<KleshaId, { yes: string; no: string }> = {
    avidya: {
      yes: "Avidyā (ignorance) underlies the pattern — mistaking the impermanent for permanent, the painful for pleasant.",
      no: "Avidyā is not strongly indicated as the root affliction here.",
    },
    asmita: {
      yes: "Asmitā (egoism) arises — the sense of 'I' and 'mine' fused with social comparison and self-image.",
      no: "Asmitā is subdued; less fusion of identity with external judgment.",
    },
    raga: {
      yes: "Rāga (attachment) fuels the pattern — clinging to approval, outcomes, or pleasant self-concepts.",
      no: "Rāga is not the primary affliction; attachment is relatively quiet.",
    },
    dvesha: {
      yes: "Dveṣa (aversion) burns — resistance to pain, injustice, or unwanted memory creates suffering.",
      no: "Dveṣa is mild; aversion does not dominate the emotional field.",
    },
    abhinivesha: {
      yes: "Abhiniveśa (clinging to existence) manifests as anxiety about loss, change, or survival of self-image.",
      no: "Abhiniveśa is not strongly present in this reflection.",
    },
  };

  return {
    detected,
    intensity: detected ? intensity(score) : 0.1,
    insight: detected ? insights[id].yes : insights[id].no,
  };
}

function abhyasaFor(
  vritti: VrittiId,
  klesha: KleshaId,
): { practices: AbhyasaPractice[]; philosophical: string; psychological: string } {
  const base: AbhyasaPractice[] = [
    {
      name: "Abhyāsa",
      sanskrit: "अभ्यास",
      description:
        "Sustained practice over long time without interruption, with devotional attitude (YS I.14). Begin with 10 minutes of daily seated awareness.",
    },
    {
      name: "Vairāgya",
      sanskrit: "वैराग्य",
      description:
        "Non-attachment to the fruits of practice and to mental fluctuations themselves (YS I.12–16). Observe without feeding the vṛtti.",
    },
  ];

  const specific: Record<string, AbhyasaPractice> = {
    smriti_dvesha: {
      name: "Pratipakṣa Bhāvanā",
      sanskrit: "प्रतिपक्षभावना",
      description:
        "When anger or memory arises, consciously cultivate the opposite quality — forgiveness, equanimity, or compassion (YS II.33).",
    },
    nidra_avidya: {
      name: "Tapas & Prāṇāyāma",
      sanskrit: "तपः · प्राणायाम",
      description:
        "Gentle discipline of body and breath to counter tamas. Even five conscious breaths can pierce dullness without force.",
    },
    asmita_raga: {
      name: "Svādhyāya",
      sanskrit: "स्वाध्याय",
      description:
        "Self-study through honest journaling: 'Who is the I that seeks approval?' Separate the Seer (draṣṭṛ) from the seen (YS II.1).",
    },
    viparyaya: {
      name: "Vitarka-Bādhane Pratipakṣa",
      sanskrit: "वितर्कबाधने प्रतिपक्ष",
      description:
        "Challenge distorted cognitions with inquiry: Is this thought pramāṇa (verified) or viparyaya (misconception)?",
    },
    general: {
      name: "Īśvara Praṇidhāna",
      sanskrit: "ईश्वरप्रणिधान",
      description:
        "Surrender the fruits of effort to a higher principle — releasing the ego's grip on outcomes (YS II.45).",
    },
  };

  const practices = [...base];

  if (vritti === "smriti" || klesha === "dvesha") {
    practices.push(specific.smriti_dvesha);
  }
  if (vritti === "nidra" || klesha === "avidya") {
    practices.push(specific.nidra_avidya);
  }
  if (klesha === "asmita" || klesha === "raga") {
    practices.push(specific.asmita_raga);
  }
  if (vritti === "viparyaya" || vritti === "vikalpa") {
    practices.push(specific.viparyaya);
  }
  practices.push(specific.general);

  const philosophical = `Patañjali teaches that citta-vṛttis are stilled through abhyāsa and vairāgya (YS I.12). The dominant pattern — ${VRITTI_META[vritti].label} colored by ${KLESHA_META[klesha].label} — is not the Self (puruṣa) but a fluctuation in the mind-stuff (citta). Recognition itself is the beginning of kaivalya (liberation).`;

  const psychological = `Modern psychology aligns: naming the pattern (${KLESHA_META[klesha].label} + ${VRITTI_META[vritti].label}) creates space between stimulus and response. You are not the vṛtti; you are the awareness in which it arises and subsides.`;

  return { practices, philosophical, psychological };
}

export function heuristicAnalyze(journal: string): YogaAnalyzeResponse {
  const text = journal.trim();

  const vrittiScores: ScoreMap<VrittiId> = {
    pramana: 0,
    viparyaya: scorePatterns(text, VIPARYAYA_PATTERNS),
    vikalpa: scorePatterns(text, VIKALPA_PATTERNS),
    nidra: scorePatterns(text, NIDRA_PATTERNS),
    smriti: scorePatterns(text, SMRITI_PATTERNS),
  };

  const kleshaScores: ScoreMap<KleshaId> = {
    avidya: scorePatterns(text, AVIDYA_PATTERNS),
    asmita: scorePatterns(text, ASMITA_PATTERNS),
    raga: scorePatterns(text, RAGA_PATTERNS),
    dvesha: scorePatterns(text, DVESHA_PATTERNS),
    abhinivesha: scorePatterns(text, ABHINIVESHA_PATTERNS),
  };

  const dominantVritti = dominant(vrittiScores, "smriti");
  const dominantKlesha = dominant(kleshaScores, "avidya");

  if (vrittiScores[dominantVritti] === 0) {
    if (/worr|think|peer|compar/.test(text)) {
      vrittiScores.vikalpa = 2;
      kleshaScores.asmita = Math.max(kleshaScores.asmita, 2);
      kleshaScores.raga = Math.max(kleshaScores.raga, 2);
    }
  }

  const finalVritti = dominant(vrittiScores, dominantVritti);
  const finalKlesha = dominant(kleshaScores, dominantKlesha);

  const vrittis = {
    pramana: buildVrittiDetail("pramana", vrittiScores.pramana > 0, vrittiScores.pramana, text),
    viparyaya: buildVrittiDetail("viparyaya", vrittiScores.viparyaya > 0, vrittiScores.viparyaya, text),
    vikalpa: buildVrittiDetail("vikalpa", vrittiScores.vikalpa > 0, vrittiScores.vikalpa, text),
    nidra: buildVrittiDetail("nidra", vrittiScores.nidra > 0, vrittiScores.nidra, text),
    smriti: buildVrittiDetail("smriti", vrittiScores.smriti > 0, vrittiScores.smriti, text),
  };

  const kleshas = {
    avidya: buildKleshaDetail("avidya", kleshaScores.avidya > 0, kleshaScores.avidya),
    asmita: buildKleshaDetail("asmita", kleshaScores.asmita > 0, kleshaScores.asmita),
    raga: buildKleshaDetail("raga", kleshaScores.raga > 0, kleshaScores.raga),
    dvesha: buildKleshaDetail("dvesha", kleshaScores.dvesha > 0, kleshaScores.dvesha),
    abhinivesha: buildKleshaDetail("abhinivesha", kleshaScores.abhinivesha > 0, kleshaScores.abhinivesha),
  };

  const abhyasa = abhyasaFor(finalVritti, finalKlesha);

  return {
    journal: text,
    dominant_vritti: finalVritti,
    dominant_klesha: finalKlesha,
    vritti_summary: `The mind-fluctuation (${VRITTI_META[finalVritti].label}) appears most active — ${VRITTI_META[finalVritti].description.toLowerCase()}.`,
    klesha_summary: `The underlying affliction (${KLESHA_META[finalKlesha].label}) colors this state — ${KLESHA_META[finalKlesha].description.toLowerCase()}.`,
    vrittis,
    kleshas,
    abhyasa: {
      practices: abhyasa.practices,
      philosophical_alignment: abhyasa.philosophical,
      psychological_insight: abhyasa.psychological,
    },
    analyzer: "heuristic",
  };
}
