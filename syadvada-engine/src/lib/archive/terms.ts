export type DarshanaSchool =
  | "Nyāya"
  | "Jain"
  | "General"
  | "Sāṅkhya-Yoga"
  | "Mīmāṃsā"
  | "Vedānta"
  | "Ethics";

export type ToolTag =
  | "Nyāya-Logic"
  | "Syādvāda Engine"
  | "Prāmāṇa Explorer"
  | "Yoga-Sūtra Analyzer"
  | "Dharma Solver"
  | "General";

export interface ArchiveTerm {
  id: string;
  devanagari: string;
  transliteration: string;
  etymology: string;
  school: DarshanaSchool;
  tools: ToolTag[];
  definition: string;
}

export const ARCHIVE_TERMS: ArchiveTerm[] = [
  {
    id: "nyaya",
    devanagari: "न्याय",
    transliteration: "Nyāya",
    etymology: "From ni- ('into, back') + i ('to go') — 'that into which one goes back,' i.e. the proper method or standard.",
    school: "Nyāya",
    tools: ["Nyāya-Logic", "General"],
    definition:
      "A classical darśana (philosophical school) devoted to logic, epistemology, and rigorous debate. Nyāya provides systematic tools for valid inference, fallacy detection, and the theory of knowledge (pramāṇa-śāstra).",
  },
  {
    id: "avayava",
    devanagari: "अवयव",
    transliteration: "Avayava",
    etymology: "a- + vi- + ava- + i — 'that which goes to make up a whole'; a constituent part.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "A member or component part. In Nyāya, the five avayavas are the five members of a complete syllogism (pañcāvayava-anumāna) used to establish a conclusion through inference.",
  },
  {
    id: "pratijna",
    devanagari: "प्रतिज्ञा",
    transliteration: "Pratijñā",
    etymology: "prati- ('toward, in return') + jñā ('to know') — a declaration or proposition put forward.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "The thesis or major premise — the statement to be proved. First member of the Nyāya five-part syllogism. Example: 'The hill has fire.'",
  },
  {
    id: "hetu",
    devanagari: "हेतु",
    transliteration: "Hetu",
    etymology: "From hi ('to impel') — cause, reason, motive; the logical middle term.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "The reason or middle term that connects the subject to the predicate through invariable concomitance (vyāpti). Second member: 'Because it has smoke.'",
  },
  {
    id: "udaharana",
    devanagari: "उदाहरण",
    transliteration: "Udāharaṇa",
    etymology: "ud- ('forth') + āhṛ ('to bring') — an example brought forth for illustration.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "The illustrative example demonstrating the invariable relation between reason and predicate. Third member: 'Where there is smoke, there is fire, as in the kitchen.'",
  },
  {
    id: "upanaya",
    devanagari: "उपनय",
    transliteration: "Upanaya",
    etymology: "upa- ('near') + ni- ('down') + i — application, bringing near; subsumption.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "The application — subsuming the subject under the rule established by the example. Fourth member: 'This hill likewise has smoke.'",
  },
  {
    id: "nigamana",
    devanagari: "निगमन",
    transliteration: "Nigamana",
    etymology: "ni- ('down') + gam ('to go') — conclusion, the going down to the final assertion.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "The conclusion — the restatement of the thesis now established. Fifth member: 'Therefore, the hill has fire.'",
  },
  {
    id: "hetvabhasa",
    devanagari: "हेत्वाभास",
    transliteration: "Hetvābhāsa",
    etymology: "hetu + ābhāsa ('appearance, semblance') — the semblance of a reason; a fallacious middle term.",
    school: "Nyāya",
    tools: ["Nyāya-Logic"],
    definition:
      "A fallacious reason — a hetu that appears valid but violates the conditions of good inference (asiddha, anaikāntika, viruddha, etc.). The Nyāya-Logic tool detects these logical fallacies in arguments.",
  },
  {
    id: "anekantavada",
    devanagari: "अनेकान्तवाद",
    transliteration: "Anekāntavāda",
    etymology: "aneka ('not one') + anta ('end, aspect') + vāda ('doctrine') — the doctrine of non-one-sidedness.",
    school: "Jain",
    tools: ["Syādvāda Engine", "General"],
    definition:
      "The Jain philosophical principle that reality is many-sided (anekānta) and cannot be fully captured from a single viewpoint. It is the metaphysical foundation for Syādvāda — conditional predication.",
  },
  {
    id: "syadvada",
    devanagari: "स्याद्वाद",
    transliteration: "Syādvāda",
    etymology: "syāt ('in some respect, perhaps') + vāda — the doctrine of conditional predication.",
    school: "Jain",
    tools: ["Syādvāda Engine"],
    definition:
      "The Jain method of seven-fold conditional logic (Saptabhaṅgī) that qualifies every proposition with 'syāt' (in some respect). It avoids dogmatic absolutism by acknowledging multiple valid perspectives.",
  },
  {
    id: "saptabhangi",
    devanagari: "सप्तभङ्गी",
    transliteration: "Saptabhaṅgī",
    etymology: "sapta ('seven') + bhaṅgī ('mode, fold') — the seven-fold mode of predication.",
    school: "Jain",
    tools: ["Syādvāda Engine"],
    definition:
      "The seven conditional viewpoints through which any proposition may be qualified: syāt-asti, syāt-nāsti, syāt-asti-nāsti, syāt-avaktavyaḥ, and three combined forms with avaktavya (indescribability).",
  },
  {
    id: "syat-asti",
    devanagari: "स्याद् अस्ति",
    transliteration: "Syāt-asti",
    etymology: "syāt (conditional 'in some respect') + asti ('it is').",
    school: "Jain",
    tools: ["Syādvāda Engine"],
    definition:
      "In some respect, it is. The first of the seven Saptabhaṅgī modes — affirming existence from a particular standpoint (spatial, temporal, or contextual).",
  },
  {
    id: "syat-nasti",
    devanagari: "स्याद् नास्ति",
    transliteration: "Syāt-nāsti",
    etymology: "syāt + nāsti ('it is not').",
    school: "Jain",
    tools: ["Syādvāda Engine"],
    definition:
      "In some respect, it is not. The second mode — denying existence from another valid standpoint without contradicting the first.",
  },
  {
    id: "pramana",
    devanagari: "प्रमाण",
    transliteration: "Prāmāṇa",
    etymology: "pra- ('forth') + mā ('to measure') — a means of measuring forth valid knowledge.",
    school: "General",
    tools: ["Prāmāṇa Explorer", "General"],
    definition:
      "A valid means of knowledge — an instrument by which reliable cognition (pramā) is produced. Different schools accept different numbers of pramāṇas; the Prāmāṇa Explorer analyzes claims through the four most widely discussed.",
  },
  {
    id: "pratyaksha",
    devanagari: "प्रत्यक्ष",
    transliteration: "Pratyakṣa",
    etymology: "prati- ('before') + akṣa ('eye, sense') — present before the senses; direct perception.",
    school: "General",
    tools: ["Prāmāṇa Explorer"],
    definition:
      "Direct perception — knowledge obtained through immediate sensory contact with the object. The Cārvāka school accepts only pratyakṣa as valid; Nyāya and others accept additional pramāṇas.",
  },
  {
    id: "anumana",
    devanagari: "अनुमान",
    transliteration: "Anumāna",
    etymology: "anu- ('after') + mā ('to measure') — knowledge that follows from something else; inference.",
    school: "Nyāya",
    tools: ["Prāmāṇa Explorer", "Nyāya-Logic"],
    definition:
      "Inference — knowledge of the unperceived through its mark (liṅga). The Nyāya syllogism is a formalized expression of anumāna; the Prāmāṇa Explorer detects when claims rely on inferential reasoning.",
  },
  {
    id: "upamana",
    devanagari: "उपमान",
    transliteration: "Upamāna",
    etymology: "upa- ('near') + mā — knowledge derived from comparison or analogy.",
    school: "General",
    tools: ["Prāmāṇa Explorer"],
    definition:
      "Comparison — knowledge of something unknown through its similarity to something known. Example: knowing what a 'gavaya' (wild cow) is after being told it resembles a domestic cow.",
  },
  {
    id: "shabda",
    devanagari: "शब्द",
    transliteration: "Śabda",
    etymology: "From śabd ('to sound') — word, testimony, verbal authority.",
    school: "Mīmāṃsā",
    tools: ["Prāmāṇa Explorer"],
    definition:
      "Verbal testimony — valid knowledge derived from the words of a reliable authority (āpta). Mīmāṃsā elevates Vedic śabda; Nyāya accepts śabda from trustworthy persons.",
  },
  {
    id: "citta-vritti",
    devanagari: "चित्तवृत्ति",
    transliteration: "Citta-Vṛtti",
    etymology: "citta ('mind-stuff') + vṛtti ('modification, fluctuation') — modifications of the mind.",
    school: "Sāṅkhya-Yoga",
    tools: ["Yoga-Sūtra Analyzer"],
    definition:
      "Mental fluctuations — the five modifications of consciousness identified by Patañjali (YS I.5–11): pramāṇa, viparyaya, vikalpa, nidrā, and smṛti. Yoga aims at citta-vṛtti-nirodha — stilling these fluctuations.",
  },
  {
    id: "klesha",
    devanagari: "क्लेश",
    transliteration: "Kleśa",
    etymology: "From kliś ('to afflict, torment') — affliction, pain, defilement.",
    school: "Sāṅkhya-Yoga",
    tools: ["Yoga-Sūtra Analyzer"],
    definition:
      "Affliction — the five root causes of suffering (YS II.3): avidyā (ignorance), asmitā (egoism), rāga (attachment), dveṣa (aversion), and abhiniveśa (clinging to life). The Yoga-Sūtra Analyzer maps emotional patterns to these kleśas.",
  },
  {
    id: "purushartha",
    devanagari: "पुरुषार्थ",
    transliteration: "Puruṣārtha",
    etymology: "puruṣa ('person, human') + artha ('aim, goal') — the aims of human life.",
    school: "Ethics",
    tools: ["Dharma Solver", "General"],
    definition:
      "The four legitimate goals of human life in classical Indian ethics: Dharma, Artha, Kāma, and Mokṣa. The Dharma Dilemma Solver evaluates choices by their impact on each puruṣārtha.",
  },
  {
    id: "dharma",
    devanagari: "धर्म",
    transliteration: "Dharma",
    etymology: "From dhṛ ('to hold, support') — that which upholds; righteousness, duty, cosmic order.",
    school: "Ethics",
    tools: ["Dharma Solver", "General"],
    definition:
      "Righteous duty, moral law, and ethical order. Dharma is context-dependent (svadharma varies by role and stage of life) and is considered the foundation among the puruṣārthas — artha and kāma should be pursued within dharmic bounds.",
  },
  {
    id: "artha",
    devanagari: "अर्थ",
    transliteration: "Artha",
    etymology: "From artha ('aim, purpose, meaning') — material prosperity and worldly success.",
    school: "Ethics",
    tools: ["Dharma Solver"],
    definition:
      "Material prosperity, economic security, and political power — a legitimate life goal when pursued without violating dharma. Artha provides the material foundation for fulfilling duty and desire.",
  },
  {
    id: "kama",
    devanagari: "काम",
    transliteration: "Kāma",
    etymology: "From kam ('to desire, love') — pleasure, desire, aesthetic enjoyment.",
    school: "Ethics",
    tools: ["Dharma Solver"],
    definition:
      "Desire, pleasure, and emotional fulfillment — including love, art, and sensory enjoyment. Kāma is a valid puruṣārtha when integrated with dharma; the Kāmasūtra tradition treats it as a science of refined living.",
  },
  {
    id: "moksha",
    devanagari: "मोक्ष",
    transliteration: "Mokṣa",
    etymology: "From muc ('to release, liberate') — liberation, release from saṃsāra.",
    school: "Vedānta",
    tools: ["Dharma Solver", "General"],
    definition:
      "Liberation — freedom from the cycle of birth and death (saṃsāra) and from ignorance (avidyā). The ultimate puruṣārtha in most darśanas; achieved through knowledge (jñāna), devotion (bhakti), or disciplined practice (yoga).",
  },
];

export const TOOL_TAGS: ToolTag[] = [
  "Nyāya-Logic",
  "Syādvāda Engine",
  "Prāmāṇa Explorer",
  "Yoga-Sūtra Analyzer",
  "Dharma Solver",
  "General",
];
