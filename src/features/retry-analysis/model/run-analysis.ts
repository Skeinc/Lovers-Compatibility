import type { ReportContext } from "@/entities/report";
import { buildAnalysisInput, buildFallbackReport } from "@/entities/report";
import type { CompatibilityReport } from "@/shared/api";
import { readAiConfig } from "@/shared/config";

export interface AnalysisOutcome {
  report: CompatibilityReport;
  source: "ai" | "fallback";
  fallbackReason?: "missing-config" | "error";
}

export async function runAnalysis(context: ReportContext): Promise<AnalysisOutcome> {
  const fallback = buildFallbackReport(context);
  if (!readAiConfig()) {
    return { report: fallback, source: "fallback", fallbackReason: "missing-config" };
  }
  try {
    const ai = await import("@/shared/api");
    const report = await ai.analyzeRelationship(buildAnalysisInput(context));
    return { report, source: "ai" };
  } catch {
    return { report: fallback, source: "fallback", fallbackReason: "error" };
  }
}
