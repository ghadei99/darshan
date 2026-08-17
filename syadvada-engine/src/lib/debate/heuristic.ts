import { generateCarvakaReply } from "./carvaka";
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
    `Think about it like this: "${excerpt(arg)}" assumes there's a "you" over here and a world over there. Advaita says that's the mirage. Brahman alone is real — consciousness isn't brain static, it's the screen the whole movie plays on. So before we debate your thesis… who is the one debating?`,
  (arg: string) =>
    `Neti neti — not this, not that. "${excerpt(arg)}" is vyavahārika (everyday) talk, fine for groceries, useless for ultimate truth. The separate ego you're defending? Māyā. A rope mistaken for a snake. Care to look again before you grip it tighter?`,
];

const NYAYA_REPLIES = [
  (arg: string) =>
    `Okay, slow down. You said "${excerpt(arg)}" — but where's your hetu? The reason that *actually* connects your claim to your conclusion? A Nyāya syllogism needs five steps, not vibes. Give me the middle term, or admit this is assertion, not inference. What's the vyāpti here — the "whenever X, always Y" link?`,
  (arg: string) =>
    `Here's what I'm hearing: "${excerpt(arg)}." Detective mode: is your reason present in the subject? In similar cases? Absent in counterexamples? If not, that's hetvābhāsa — a fallacy in a scholar's robe. So which condition fails first?`,
];

const MADHYAMIKA_REPLIES = [
  (arg: string) =>
    `"${excerpt(arg)}" — here's the twist. You're gripping one side of the rope like it's solid. Mādhyamika says: everything's empty of fixed essence, including your thesis. Suffering, attachment, reform — all dependently arisen. So what happens to your argument when neither pole can stand alone?`,
  (arg: string) =>
    `Look, I hear you on "${excerpt(arg)}." But who's suffering? What's being reformed? The Middle Way won't let you smuggle in a permanent "self" through the back door. Your view collapses if I push — but so does the opposite. Ready to loosen your grip, or still clinging?`,
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
