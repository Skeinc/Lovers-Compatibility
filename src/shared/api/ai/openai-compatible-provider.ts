import { readAiConfig } from "@/shared/config/env";
import { parseJson, readErrorMessage } from "@/shared/lib/json";

import type { AIProvider } from "./ai-provider";
import { SYSTEM_PROMPT } from "./prompts";
import {
  aiNarrativeSchema,
  chatResponseSchema,
  type CompatibilityAnalysisInput,
  type CompatibilityReport,
} from "./schemas";

const TIMEOUT_MS = 30_000;

function stripFences(content: string): string {
  const trimmed = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenced?.[1]?.trim() ?? trimmed;
}

function withLocalFacts(
  narrative: ReturnType<typeof aiNarrativeSchema.parse>,
  input: CompatibilityAnalysisInput,
): CompatibilityReport {
  return {
    ...narrative,
    partnerKnowledge: {
      player1Score: input.predictions.player1Percent,
      player2Score: input.predictions.player2Percent,
      explanation: narrative.partnerKnowledge.explanation,
    },
    likelyTo: input.likelyTo,
    achievements: input.achievements,
  };
}

async function requestReport(input: CompatibilityAnalysisInput): Promise<CompatibilityReport> {
  const config = readAiConfig();
  if (!config) throw new Error("AI не настроен");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${config.url}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.key}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("AI ответил ошибкой");
    const payload = chatResponseSchema.parse(parseJson(await response.text()));
    const content = payload.choices[0]?.message.content;
    if (!content) throw new Error("Пустой ответ AI");
    const narrative = aiNarrativeSchema.parse(parseJson(stripFences(content)));
    return withLocalFacts(narrative, input);
  } catch (error) {
    if (error instanceof Error) throw new Error(readErrorMessage(error), { cause: error });
    throw new Error("Не удалось разобрать ответ AI", { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

export function createOpenAiCompatibleProvider(): AIProvider {
  return { analyzeRelationship: requestReport };
}
