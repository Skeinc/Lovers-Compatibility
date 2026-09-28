export type { AIProvider } from "./ai-provider";
export { createOpenAiCompatibleProvider } from "./openai-compatible-provider";
export { aiNarrativeSchema, compatibilityReportSchema } from "./schemas";
export type { AiNarrative, CompatibilityAnalysisInput, CompatibilityReport } from "./schemas";

import { createOpenAiCompatibleProvider } from "./openai-compatible-provider";

const provider = createOpenAiCompatibleProvider();

export function analyzeRelationship(input: Parameters<typeof provider.analyzeRelationship>[0]) {
  return provider.analyzeRelationship(input);
}
