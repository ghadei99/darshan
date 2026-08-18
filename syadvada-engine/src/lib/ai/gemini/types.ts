export interface GenerateTextParams {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerateJsonParams {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
}
