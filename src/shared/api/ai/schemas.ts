import { z } from "zod";

const cardSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(800),
});

export const aiNarrativeSchema = z.object({
  archetype: z.object({
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(500),
  }),
  summary: z.string().trim().min(1).max(900),
  strengths: z.array(cardSchema).min(1).max(4),
  differences: z.array(cardSchema).min(1).max(4),
  surprisingAnswers: z.array(cardSchema).max(4),
  roast: z.string().trim().min(1).max(700),
  positiveObservation: z.string().trim().min(1).max(700),
  finalVerdict: z.string().trim().min(1).max(400),
});

export const compatibilityReportSchema = z.object({
  archetype: z.object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }),
  summary: z.string().trim().min(1),
  strengths: z.array(cardSchema).min(1).max(4),
  differences: z.array(cardSchema).min(1).max(4),
  surprisingAnswers: z.array(
    z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  ),
  likelyTo: z.array(
    z.object({
      title: z.string(),
      person: z.string(),
      explanation: z.string(),
    }),
  ),
  roast: z.string().trim().min(1),
  positiveObservation: z.string().trim().min(1),
  finalVerdict: z.string().trim().min(1),
  achievements: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ),
});

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

export interface AnalysisAnswer {
  question: string;
  prediction?: string;
  answer: string;
}

export interface CompatibilityAnalysisInput {
  couple: {
    player1: { name: string; age: number };
    player2: { name: string; age: number };
    relationshipDuration: string;
    howMet: string;
    howMetDetails?: string;
    goals: string[];
  };
  player1: AnalysisAnswer[];
  player2: AnalysisAnswer[];
  scoring: {
    total: number;
    label: string;
  };
  likelyTo: CompatibilityReport["likelyTo"];
  achievements: CompatibilityReport["achievements"];
}
