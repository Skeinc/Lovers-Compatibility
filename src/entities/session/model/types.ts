import type { CompatibilityScore } from "@/entities/compatibility/@x/session";
import type { CoupleDraft, CoupleProfile } from "@/entities/couple/@x/session";
import type { AnswerValue, PlayerAnswer, Substep } from "@/entities/question/@x/session";
import type { CompatibilityReport } from "@/entities/report/@x/session";

export type Phase =
  "landing" | "setup" | "player1-intro" | "player1" | "handoff" | "player2-intro" | "player2" | "analyzing" | "results";

export type FallbackReason = "missing-config" | "error";

export interface PlayerAnswers {
  answers: PlayerAnswer[];
  completedAt?: string;
}

export interface QuizSession {
  id: string;
  version: 1;
  createdAt: string;
  updatedAt: string;
  phase: Phase;
  setupStep: number;
  questionIndex: number;
  substep: Substep;
  couple: CoupleProfile | null;
  draft: CoupleDraft;
  player1: PlayerAnswers;
  player2: PlayerAnswers;
  player1Locked: boolean;
  scoring?: CompatibilityScore;
  report?: CompatibilityReport;
  reportSource?: "ai" | "fallback";
  fallbackReason?: FallbackReason;
}

export type SessionAction =
  | { type: "hydrate"; session: QuizSession }
  | { type: "start" }
  | { type: "set-draft"; draft: CoupleDraft; setupStep: number }
  | { type: "finish-setup"; couple: CoupleProfile }
  | { type: "begin-quiz" }
  | { type: "save-value"; value: AnswerValue }
  | { type: "advance" }
  | { type: "back" }
  | { type: "finish-player" }
  | { type: "confirm-handoff" }
  | { type: "retry-analysis" }
  | {
      type: "set-report";
      report: CompatibilityReport;
      source: "ai" | "fallback";
      fallbackReason?: FallbackReason;
    }
  | { type: "reset" };
