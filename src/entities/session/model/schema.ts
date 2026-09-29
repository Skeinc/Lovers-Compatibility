import { z } from "zod";

import { compatibilityReportSchema } from "@/shared/api";
import { coupleDraftSchema, coupleProfileSchema } from "@/entities/couple/@x/session";

const answerValueSchema = z.union([z.string(), z.array(z.string())]);

const scoreSchema = z.object({
  total: z.number(),
  label: z.string(),
  breakdown: z.object({
    commonPreferences: z.number(),
    values: z.number(),
    relationshipDynamics: z.number(),
    textSimilarity: z.number(),
  }),
});

export const quizSessionSchema = z.object({
  id: z.string().min(1),
  version: z.literal(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  phase: z.enum([
    "landing",
    "setup",
    "player1-intro",
    "player1",
    "handoff",
    "player2-intro",
    "player2",
    "analyzing",
    "results",
  ]),
  setupStep: z.number().int().min(0).max(4),
  questionIndex: z.number().int().min(0).max(11),
  substep: z.enum(["predict", "actual"]),
  couple: coupleProfileSchema.nullable(),
  draft: coupleDraftSchema,
  player1: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: answerValueSchema,
        prediction: answerValueSchema.optional(),
      }),
    ),
    completedAt: z.string().optional(),
  }),
  player2: z.object({
    answers: z.array(
      z.object({
        questionId: z.string(),
        answer: answerValueSchema,
        prediction: answerValueSchema.optional(),
      }),
    ),
    completedAt: z.string().optional(),
  }),
  player1Locked: z.boolean(),
  scoring: scoreSchema.optional(),
  report: compatibilityReportSchema.optional(),
  reportSource: z.enum(["ai", "fallback"]).optional(),
  fallbackReason: z.enum(["missing-config", "error"]).optional(),
});
