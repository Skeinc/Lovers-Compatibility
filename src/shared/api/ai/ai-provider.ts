import type { CompatibilityAnalysisInput, CompatibilityReport } from "./schemas";

export interface AIProvider {
  analyzeRelationship(input: CompatibilityAnalysisInput): Promise<CompatibilityReport>;
}
