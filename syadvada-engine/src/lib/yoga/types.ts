export type VrittiId =
  | "pramana"
  | "viparyaya"
  | "vikalpa"
  | "nidra"
  | "smriti";

export type KleshaId =
  | "avidya"
  | "asmita"
  | "raga"
  | "dvesha"
  | "abhinivesha";

export interface PatternDetail {
  detected: boolean;
  intensity: number;
  insight: string;
}

export interface AbhyasaPractice {
  name: string;
  sanskrit: string;
  description: string;
}

export interface YogaAnalyzeResponse {
  journal: string;
  dominant_vritti: VrittiId;
  dominant_klesha: KleshaId;
  vritti_summary: string;
  klesha_summary: string;
  vrittis: Record<VrittiId, PatternDetail>;
  kleshas: Record<KleshaId, PatternDetail>;
  abhyasa: {
    practices: AbhyasaPractice[];
    philosophical_alignment: string;
    psychological_insight: string;
  };
  analyzer: "gemini" | "heuristic";
}

export const VRITTI_META: Record<
  VrittiId,
  { label: string; sanskrit: string; description: string }
> = {
  pramana: {
    label: "Pramāṇa",
    sanskrit: "प्रमाण",
    description: "Correct knowledge — clear, verified perception",
  },
  viparyaya: {
    label: "Viparyaya",
    sanskrit: "विपर्यय",
    description: "Misconception — false knowledge mistaken for truth",
  },
  vikalpa: {
    label: "Vikalpa",
    sanskrit: "विकल्प",
    description: "Imagination — verbal constructs without substance",
  },
  nidra: {
    label: "Nidrā",
    sanskrit: "निद्रा",
    description: "Sleep — withdrawal or dullness of consciousness",
  },
  smriti: {
    label: "Smṛti",
    sanskrit: "स्मृति",
    description: "Memory — replay of past experience in the present",
  },
};

export const KLESHA_META: Record<
  KleshaId,
  { label: string; sanskrit: string; description: string }
> = {
  avidya: {
    label: "Avidyā",
    sanskrit: "अविद्या",
    description: "Ignorance — misidentification of the transient as permanent",
  },
  asmita: {
    label: "Asmitā",
    sanskrit: "अस्मिता",
    description: "Egoism — conflating the Seer with the seen",
  },
  raga: {
    label: "Rāga",
    sanskrit: "राग",
    description: "Attachment — clinging to pleasant experience",
  },
  dvesha: {
    label: "Dveṣa",
    sanskrit: "द्वेष",
    description: "Aversion — resistance to unpleasant experience",
  },
  abhinivesha: {
    label: "Abhiniveśa",
    sanskrit: "अभिनिवेश",
    description: "Clinging to life — deep-seated fear of change or loss",
  },
};

export const VRITTI_ORDER: VrittiId[] = [
  "pramana",
  "viparyaya",
  "vikalpa",
  "nidra",
  "smriti",
];

export const KLESHA_ORDER: KleshaId[] = [
  "avidya",
  "asmita",
  "raga",
  "dvesha",
  "abhinivesha",
];
