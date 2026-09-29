import { z } from "zod";

export const aiNarrativeSchema = z.object({
  roleName: z.string().trim().min(1).max(80),
  insight: z.string().trim().min(1).max(900),
  paradox: z.string().trim().min(1).max(700),
  discussQuestion: z.string().trim().min(1).max(400),
  finalScene: z.string().trim().min(1).max(900),
});

export const compatibilityReportSchema = aiNarrativeSchema;

export const chatResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
});

export type AiNarrative = z.infer<typeof aiNarrativeSchema>;
export type CompatibilityReport = z.infer<typeof compatibilityReportSchema>;

export interface AnalysisChoice {
  topic: string;
  player1: string;
  player2: string;
  same: boolean;
}

export interface CompatibilityAnalysisInput {
  players: { player1: string; player2: string };
  agreementPercent: number;
  reading: { player1to2: string; player2to1: string };
  bestHit: string | null;
  worstMiss: string | null;
  green: string[];
  interesting: string[];
  spicy: string | null;
  choices: AnalysisChoice[];
  valuesOverlap: 0 | 1 | 2 | 3;
  sharedValues: string[];
  valuesByPlayer: { player1: string[]; player2: string[] };
  earnings: AnalysisChoice;
  helm: { player1Points: number; player2Points: number; line: string };
  discussionTopic: "family" | "relocation" | "earnings" | "values" | "red-flag" | "household-fight";
  discussionTopicLabel: string;
  sentences: { player1: string; player2: string };
}
