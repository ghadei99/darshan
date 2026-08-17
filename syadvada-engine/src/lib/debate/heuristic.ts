import { CARVAKA_OPENAI_PERSONA, generateCarvakaReply } from "./carvaka";
import type {
  DebateConcludeResponse,
  DebateMessage,
  DebateReplyResponse,
  DebateSchool,
} from "./types";
import { SCHOOL_META } from "./types";

function lastUserMessage(history: DebateMessage[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user") return history[i].content;
  }
  return history[0]?.content ?? "";
}

function excerpt(text: string, max = 60): string {
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

const ADVAITA_REPLIES = [
  (arg: string) =>
    `You assert "${excerpt(arg)}" — yet this presupposes a duality between knower and known that Advaita dissolves. Brahman alone is real; the universe (jagat) is māyā, an apparent modification of consciousness. The brain you invoke is itself an object within awareness, not the ground of awareness.`,
  (arg: string) =>
    `Neti neti — not this, not that. Your claim "${excerpt(arg)}" clings to vyavahārika (empirical) truth while ignoring pāramārthika (ultimate) truth. When the veil of ignorance (avidyā) lifts, the Self (Ātman) is seen as identical with Brahman. Matter is not the sole reality; consciousness is not a byproduct but the very substratum.`,
  (arg: string) =>
    `The Māṇḍūkya Upaniṣad teaches: turīya — the fourth state — transcends waking, dreaming, and deep sleep. Your argument "${excerpt(arg)}" operates entirely within the first three. Until you inquire "Who am I?" (koham), you debate shadows on the cave wall.`,
];

const NYAYA_REPLIES = [
  (arg: string) =>
    `Let us formalize your thesis. You state "${excerpt(arg)}" — but where is the hetu (reason)? A Nyāya syllogism requires five avayavas: pratijñā, hetu, udāharaṇa, upanaya, nigamana. Your argument lacks a vyāpti (invariable concomitance). Without it, the inference is a hetvābhāsa — a fallacious reason.`,
  (arg: string) =>
    `The Nyāya-sūtra demands logical proof (tarka), not mere assertion. "${excerpt(arg)}" — is your middle term (pakṣadharmatā) established? Does it reside in the subject? Is it present in the sapakṣa and absent in the vipakṣa? Until these conditions are met, your claim remains an unproven pratijñā.`,
  (arg: string) =>
    `You dismiss śabda too hastily. Nyāya accepts four pramāṇas: pratyakṣa, anumāna, upamāna, and śabda from āpta (reliable authority). "${excerpt(arg)}" — if your rejection of scripture is itself unverified, you commit āhārya (the fallacy of the impossible). Prove your standard of proof without circularity.`,
];

const MADHYAMIKA_REPLIES = [
  (arg: string) =>
    `You claim "${excerpt(arg)}" — but on what ground? Mādhyamika shows all dharmas are śūnya (empty) of svabhāva (inherent existence). Your suffering, your attachment, your social reform — all arise dependently (pratītyasamutpāda). Neither absolute self-creation nor absolute externality withstands madhyamaka analysis.`,
  (arg: string) =>
    `The Middle Way avoids eternalism and nihilism. "${excerpt(arg)}" — if suffering is entirely self-created, who is this "self"? If reform is useless, who suffers its absence? Nāgārjuna's catuṣkoṭi rejects all four extremes. Your thesis is a prapañca — conceptual proliferation — that collapses under prasāṅga (reductio).`,
  (arg: string) =>
    `Attachment (upādāna) indeed fuels dukkha — the Buddha taught this. Yet "${excerpt(arg)}" erects a false dichotomy. Social conditions and mental formations co-arise; neither is independent. Clinging to either pole as absolute is avidyā. Release both, and the debate itself loses its sharp edges.`,
];

const REPLY_BANK: Record<Exclude<DebateSchool, "carvaka">, ((arg: string) => string)[]> = {
  advaita: ADVAITA_REPLIES,
  nyaya: NYAYA_REPLIES,
  madhyamika: MADHYAMIKA_REPLIES,
};

export function heuristicReply(
  school: DebateSchool,
  history: DebateMessage[],
): DebateReplyResponse {
  const arg = lastUserMessage(history);
  const turn = history.filter((m) => m.role === "opponent").length;

  if (school === "carvaka") {
    return {
      reply: generateCarvakaReply(arg, turn),
      school,
      schoolLabel: SCHOOL_META[school].label,
      analyzer: "heuristic",
    };
  }

  const bank = REPLY_BANK[school];
  const reply = bank[turn % bank.length](arg);

  return {
    reply,
    school,
    schoolLabel: SCHOOL_META[school].label,
    analyzer: "heuristic",
  };
}

export function heuristicConclude(
  school: DebateSchool,
  history: DebateMessage[],
): DebateConcludeResponse {
  const userTurns = history.filter((m) => m.role === "user").length;
  const opponent = SCHOOL_META[school].label;
  const opening = history.find((m) => m.role === "user")?.content ?? "the opening thesis";

  const key_points = [
    `The debate opened with the thesis: "${excerpt(opening, 80)}"`,
    `The ${opponent} school pressed its characteristic standards of valid knowledge and reality.`,
    `${userTurns} rejoinder(s) were exchanged across ${history.length} total statements.`,
    "Classical vāda demands mutual refutation (vitarka) without mere victory — truth emerges through scrutiny.",
  ];

  const verdicts: Record<DebateSchool, string> = {
    carvaka: `The Lokāyata held the line: no śabda, no unperceived inference, no karma or soul without sensory proof. Every non-empirical claim in "${excerpt(opening, 40)}" was challenged to produce pratyakṣa — and found wanting.`,
    advaita: `Advaita reframed the dispute at the level of ultimate vs. empirical truth. The central tension: can ${excerpt(opening, 40)} be sustained once duality is dissolved?`,
    nyaya: `Nyāya demanded formal logical structure. The exchange hinges on whether the user's hetu satisfies vyāpti and avoids hetvābhāsa.`,
    madhyamika: `Mādhyamika exposed relational dependence in both poles. Neither extreme in "${excerpt(opening, 40)}" withstands śūnyatā analysis.`,
  };

  return {
    summary: `A vāda-kathā of ${history.length} statements between the challenger and ${opponent}. The exchange examined epistemological and metaphysical commitments through the lens of classical Indian debate (pariṣad-vāda).`,
    verdict: verdicts[school],
    key_points,
    strengths_user:
      "The challenger articulated a clear, provocative thesis and maintained argumentative pressure across turns.",
    strengths_opponent:
      school === "carvaka"
        ? `${opponent} relentlessly demanded pratyakṣa for every claim, rejected śabda outright, and exposed metaphysical and karmic assertions as unverifiable.`
        : `${opponent} consistently applied its school's pramāṇas, categories, and classical refutation strategies (nigraha-sthāna).`,
    analyzer: "heuristic",
  };
}
