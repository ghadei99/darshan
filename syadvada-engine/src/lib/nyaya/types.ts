export interface NyayaSteps {
  pratijna: string;
  hetu: string;
  udaharana: string;
  upanaya: string;
  nigamana: string;
}

export interface NyayaAnalyzeResponse {
  validity: string;
  steps: NyayaSteps;
  fallacies: string[];
  analyzer: "gemini" | "heuristic";
}
