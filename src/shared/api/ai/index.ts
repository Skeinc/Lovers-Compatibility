export type { AIProvider } from "./ai-provider";
export { createOpenAiCompatibleProvider } from "./openai-compatible-provider";
export { AXIS_IDS, AXIS_POSITIONS, aiNarrativeSchema, compatibilityReportSchema } from "./schemas";
export type {
  AiNarrative,
  AxisId,
  AxisPosition,
  CompatibilityAnalysisInput,
  CompatibilityReport,
  CoupleAxis,
} from "./schemas";

import { createOpenAiCompatibleProvider } from "./openai-compatible-provider";

const provider = createOpenAiCompatibleProvider();

export function analyzeRelationship(input: Parameters<typeof provider.analyzeRelationship>[0]) {
  return provider.analyzeRelationship(input);
}
