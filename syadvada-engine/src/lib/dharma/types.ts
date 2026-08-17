export type PurusharthaId = "dharma" | "artha" | "kama" | "moksha";

export interface PurusharthaImpact {
  short_term: number;
  long_term: number;
  analysis: string;
}

export interface OptionAnalysis {
  dharma: PurusharthaImpact;
  artha: PurusharthaImpact;
  kama: PurusharthaImpact;
  moksha: PurusharthaImpact;
}

export interface DharmaAnalyzeResponse {
  dilemma: string;
  option_a: string;
  option_b: string;
  matrix: {
    option_a: OptionAnalysis;
    option_b: OptionAnalysis;
  };
  dominant_tension: string;
  synthesis: string;
  recommendation: string;
  analyzer: "gemini" | "heuristic";
}

export const PURUSHARTHA_META: Record<
  PurusharthaId,
  { label: string; sanskrit: string; description: string }
> = {
  dharma: {
    label: "Dharma",
    sanskrit: "धर्म",
    description: "Righteous duty, ethical order, moral law",
  },
  artha: {
    label: "Artha",
    sanskrit: "अर्थ",
    description: "Material prosperity, security, worldly success",
  },
  kama: {
    label: "Kāma",
    sanskrit: "काम",
    description: "Desire, pleasure, aesthetic and emotional fulfillment",
  },
  moksha: {
    label: "Mokṣa",
    sanskrit: "मोक्ष",
    description: "Liberation, spiritual freedom, ultimate fulfillment",
  },
};

export const PURUSHARTHA_ORDER: PurusharthaId[] = [
  "dharma",
  "artha",
  "kama",
  "moksha",
];
