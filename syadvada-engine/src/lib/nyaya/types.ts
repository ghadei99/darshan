import type { AnalyzerMeta } from "@/lib/ai/types";

export interface NyayaSteps {
  pratijna: string;
  hetu: string;
  udaharana: string;
  upanaya: string;
  nigamana: string;
}

export interface NyayaAnalyzeResponse extends AnalyzerMeta {
  validity: string;
  steps: NyayaSteps;
  fallacies: string[];
}
