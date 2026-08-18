import type { AnalyzerMeta } from "@/lib/ai/types";

export type DebateSchool = "carvaka" | "advaita" | "nyaya" | "madhyamika";

export type DebateAction = "reply" | "conclude";

export interface DebateMessage {
  role: "user" | "opponent";
  content: string;
}

export interface DebateReplyResponse extends AnalyzerMeta {
  reply: string;
  school: DebateSchool;
  schoolLabel: string;
}

export interface DebateConcludeResponse extends AnalyzerMeta {
  summary: string;
  verdict: string;
  key_points: string[];
  strengths_user: string;
  strengths_opponent: string;
}

export interface SchoolMeta {
  id: DebateSchool;
  label: string;
  sanskrit: string;
  description: string;
  badgeClass: string;
  avatar: string;
}

export const SCHOOL_META: Record<DebateSchool, SchoolMeta> = {
  carvaka: {
    id: "carvaka",
    label: "Cārvāka",
    sanskrit: "लोकायत",
    description:
      "Radical empiricism — only pratyakṣa counts; śabda, karma, and soul are rejected without sensory proof",
    badgeClass: "debate-badge--carvaka",
    avatar: "⚱",
  },
  advaita: {
    id: "advaita",
    label: "Advaita Vedānta",
    sanskrit: "अद्वैत",
    description: "Non-dual Brahman — consciousness as ultimate reality",
    badgeClass: "debate-badge--advaita",
    avatar: "ॐ",
  },
  nyaya: {
    id: "nyaya",
    label: "Nyāya",
    sanskrit: "न्याय",
    description: "Logical realism — inference and debate as paths to truth",
    badgeClass: "debate-badge--nyaya",
    avatar: "⚖",
  },
  madhyamika: {
    id: "madhyamika",
    label: "Mādhyamika",
    sanskrit: "माध्यमिक",
    description: "Middle Way — emptiness and dependent origination",
    badgeClass: "debate-badge--madhyamika",
    avatar: "☸",
  },
};

export const DEBATE_SCHOOLS: DebateSchool[] = [
  "carvaka",
  "advaita",
  "nyaya",
  "madhyamika",
];
