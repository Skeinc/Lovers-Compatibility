import { z } from "zod";

const xrayIdSchema = z.enum(["relationships", "money", "household", "spontaneity", "career", "future"]);

const xrayItemSchema = z.object({
  id: xrayIdSchema,
  score: z.number().min(0).max(1),
  reason: z.string().trim().min(1).max(160),
});

export const AXIS_IDS = [
  "green-flag",
  "red-flag",
  "leader",
  "mind-reader",
  "initiator",
  "stability-adventure",
  "money",
  "future",
] as const;

export const AXIS_POSITIONS = ["player1", "lean-player1", "even", "lean-player2", "player2"] as const;

const axisIdSchema = z.enum(AXIS_IDS);
const axisPositionSchema = z.enum(AXIS_POSITIONS);

const coupleAxisSchema = z.object({
  id: axisIdSchema,
  position: axisPositionSchema,
  label: z.string().trim().min(1).max(80),
  explanation: z.string().trim().min(1).max(160),
});

export const aiNarrativeSchema = z.object({
  verdict: z.string().trim().min(1).max(80),
  roleName: z.string().trim().min(1).max(80),
  roleNotes: z.array(z.string().trim().min(1).max(140)).min(1).max(2).optional(),
  insight: z.string().trim().min(1).max(450),
  paradox: z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(700),
  }),
  discussQuestion: z.string().trim().min(1).max(400),
  finalScene: z.string().trim().min(1).max(900),
  decade: z.string().trim().min(1).max(280),
  moneyReading: z.string().trim().min(1).max(280),
  mirror: z.object({
    green: z.string().trim().min(1).max(450),
    red: z.string().trim().min(1).max(450),
  }),
  xray: z
    .array(xrayItemSchema)
    .length(6)
    .refine((items) => new Set(items.map((item) => item.id)).size === 6, "Каждая сфера рентгена нужна один раз"),
  axes: z
    .array(coupleAxisSchema)
    .length(8)
    .refine((items) => new Set(items.map((item) => item.id)).size === 8, "Каждая ось нужна один раз"),
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
export type AxisId = (typeof AXIS_IDS)[number];
export type AxisPosition = (typeof AXIS_POSITIONS)[number];
export type CoupleAxis = z.infer<typeof coupleAxisSchema>;

export interface AnalysisChoice {
  topic: string;
  player1: string;
  player2: string;
  same: boolean;
}

export interface DomainFact {
  id: string;
  label: string;
  score: number;
  questionIds: string[];
}

export interface FlagFact {
  selfImage: string;
  seesInPartner: string;
  matched: boolean;
}

export interface CompatibilityAnalysisInput {
  players: { player1: string; player2: string };
  reading: { player1to2: string; player2to1: string; bestHit: string | null; worstMiss: string | null };
  perception: {
    green: { player1: FlagFact; player2: FlagFact };
    red: { player1: FlagFact; player2: FlagFact };
  };
  helm: {
    player1Points: number;
    player2Points: number;
    maxScenes: 8;
    disputes: number;
    headline: string;
    scenes: { title: string; label: string }[];
  };
  domains: DomainFact[];
  values: {
    overlap: 0 | 1 | 2 | 3;
    shared: string[];
    onlyPlayer1: string[];
    onlyPlayer2: string[];
    player1: string[];
    player2: string[];
  };
  money: { surprise: AnalysisChoice; earnings: AnalysisChoice };
  relocation: AnalysisChoice;
  family: AnalysisChoice;
  discussionTopic: "family" | "relocation" | "earnings" | "values" | "red-flag" | "household-fight";
  discussionHint: string;
}
