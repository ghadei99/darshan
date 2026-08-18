export type PramanaId = "pratyaksha" | "anumana" | "upamana" | "shabda";

export interface PramanaDetail {
  detected: boolean;
  role: string;
  critique: string;
}

import type { AnalyzerMeta } from "@/lib/ai/types";

export interface PramanaAnalyzeResponse extends AnalyzerMeta {
  claim: string;
  dominant_pramana: PramanaId;
  strength: number;
  strength_label: string;
  pramanas: {
    pratyaksha: PramanaDetail;
    anumana: PramanaDetail;
    upamana: PramanaDetail;
    shabda: PramanaDetail;
  };
  philosophical_critique: string;
}

export const PRAMANA_META: Record<
  PramanaId,
  { label: string; sanskrit: string; description: string }
> = {
  pratyaksha: {
    label: "Pratyakṣa",
    sanskrit: "प्रत्यक्ष",
    description: "Direct perception — knowledge through the senses",
  },
  anumana: {
    label: "Anumāna",
    sanskrit: "अनुमान",
    description: "Inference — knowledge derived from logical connection",
  },
  upamana: {
    label: "Upamāna",
    sanskrit: "उपमान",
    description: "Comparison — knowledge through analogy or similarity",
  },
  shabda: {
    label: "Śabda",
    sanskrit: "शब्द",
    description: "Testimony — knowledge from reliable word or scripture",
  },
};
