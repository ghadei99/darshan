import type { AnalyzerMeta } from "@/lib/ai/types";

export const PERSPECTIVE_IDS = [
  "syat-asti",
  "syat-nasti",
  "syat-asti-nasti",
  "syat-avaktavya",
  "syat-asti-avaktavya",
  "syat-nasti-avaktavya",
  "syat-asti-nasti-avaktavya",
] as const;

export type PerspectiveId = (typeof PERSPECTIVE_IDS)[number];

export interface PerspectiveMeta {
  id: PerspectiveId;
  sanskrit: string;
  label: string;
  shortLabel: string;
}

export const PERSPECTIVE_META: Record<PerspectiveId, PerspectiveMeta> = {
  "syat-asti": {
    id: "syat-asti",
    sanskrit: "Syāt-asti",
    label: "In some respect, it is",
    shortLabel: "It is",
  },
  "syat-nasti": {
    id: "syat-nasti",
    sanskrit: "Syāt-nāsti",
    label: "In some respect, it is not",
    shortLabel: "It is not",
  },
  "syat-asti-nasti": {
    id: "syat-asti-nasti",
    sanskrit: "Syāt-asti-nāsti",
    label: "In some respect, it is and is not",
    shortLabel: "It is & is not",
  },
  "syat-avaktavya": {
    id: "syat-avaktavya",
    sanskrit: "Syāt-avaktavyaḥ",
    label: "In some respect, it is indescribable",
    shortLabel: "Indescribable",
  },
  "syat-asti-avaktavya": {
    id: "syat-asti-avaktavya",
    sanskrit: "Syāt-asti-ca-avaktavyaḥ",
    label: "In some respect, it is and is indescribable",
    shortLabel: "It is & indescribable",
  },
  "syat-nasti-avaktavya": {
    id: "syat-nasti-avaktavya",
    sanskrit: "Syāt-nāsti-ca-avaktavyaḥ",
    label: "In some respect, it is not and is indescribable",
    shortLabel: "It is not & indescribable",
  },
  "syat-asti-nasti-avaktavya": {
    id: "syat-asti-nasti-avaktavya",
    sanskrit: "Syāt-asti-nāsti-ca-avaktavyaḥ",
    label: "In some respect, it is, is not, and is indescribable",
    shortLabel: "All three",
  },
};

export interface Perspective {
  id: PerspectiveId;
  sanskrit: string;
  label: string;
  classical: string;
  stakeholder: string;
}

export interface AnalyzeResponse extends AnalyzerMeta {
  statement: string;
  perspectives: Perspective[];
}
