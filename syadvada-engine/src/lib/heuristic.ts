import {
  AnalyzeResponse,
  PERSPECTIVE_IDS,
  PERSPECTIVE_META,
  type Perspective,
  type PerspectiveId,
} from "./types";
import { parseInput } from "./syadvada/input";
import { buildPerspectiveCopy } from "./syadvada/perspectives";

function buildPerspective(id: PerspectiveId, statement: string): Perspective {
  const analysis = parseInput(statement);
  const meta = PERSPECTIVE_META[id];
  const copy = buildPerspectiveCopy(id, analysis);

  return {
    id,
    sanskrit: meta.sanskrit,
    label: meta.label,
    classical: copy.classical,
    stakeholder: copy.stakeholder,
  };
}

export function heuristicAnalyze(statement: string): AnalyzeResponse {
  const text = statement.trim();

  const perspectives: Perspective[] = PERSPECTIVE_IDS.map((id) =>
    buildPerspective(id, text),
  );

  return {
    statement: text,
    analyzer: "heuristic",
    perspectives,
  };
}
