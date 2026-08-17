export const GEMINI_ENV_VAR = "GEMINI_API_KEY";

export function analyzerStatusLabel(analyzer?: string): string {
  if (analyzer) {
    return `Analyzed via ${analyzer}`;
  }
  return `Set ${GEMINI_ENV_VAR} on Vercel to enable Gemini — heuristic fallback active without it`;
}
