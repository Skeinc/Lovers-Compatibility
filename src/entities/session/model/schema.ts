import { z } from "zod";

import { compatibilityReportSchema } from "@/shared/api";
import { coupleDraftSchema, coupleProfileSchema } from "@/entities/couple/@x/session";

const answerValueSchema = z.union([z.string(), z.array(z.string())]);

const scoreSchema = z.object({
  total: z.number(),
});

const quizSessionObjectSchema = z.object({
  id: z.string().min(1),
  version: z.literal(2),
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
  questionIndex: z.number().int().min(0).max(13),
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

function dropStaleReport(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  if (compatibilityReportSchema.safeParse(record.report).success) return record;
  delete record.report;
  delete record.reportSource;
  delete record.fallbackReason;
  if (record.phase === "results") record.phase = "analyzing";
  return record;
}

export const quizSessionSchema = z.preprocess(dropStaleReport, quizSessionObjectSchema);
