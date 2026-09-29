import type { CoupleProfile } from "@/entities/couple/@x/session";
import type { PlayerAnswer, Substep } from "@/entities/question/@x/session";

import { useSessionContext } from "./context";
import type { FallbackReason, Phase, QuizSession } from "./types";
import type { CompatibilityScore } from "@/entities/compatibility/@x/session";
import type { CompatibilityReport } from "@/entities/report/@x/session";

export interface PlayerQuizView {
  phase: Phase;
  player: "player1" | "player2";
  couple: CoupleProfile;
  selfName: string;
  partnerName: string;
  answers: PlayerAnswer[];
  questionIndex: number;
  substep: Substep;
}

export interface ComparisonView {
  couple: CoupleProfile;
  scoring: CompatibilityScore;
  report?: CompatibilityReport;
  reportSource?: "ai" | "fallback";
  fallbackReason?: FallbackReason;
  player1Answers: QuizSession["player1"]["answers"];
  player2Answers: QuizSession["player2"]["answers"];
}

export function useSessionActions() {
  const { dispatch, storageAvailable, resumePhase, acceptResume, declineResume } = useSessionContext();
  return { dispatch, storageAvailable, resumePhase, acceptResume, declineResume };
}

export function useCoupleDraft() {
  const { session, dispatch } = useSessionContext();
  return { draft: session.draft, setupStep: session.setupStep, phase: session.phase, dispatch };
}

export function usePlayerQuiz(): PlayerQuizView | null {
  const { session } = useSessionContext();
  if (!session.couple) return null;
  if (
    session.phase !== "player1" &&
    session.phase !== "player1-intro" &&
    session.phase !== "player2" &&
    session.phase !== "player2-intro"
  ) {
    return null;
  }
  const player = session.phase === "player2" || session.phase === "player2-intro" ? "player2" : "player1";
  const bundle = player === "player1" ? session.player1 : session.player2;
  const self = player === "player1" ? session.couple.player1 : session.couple.player2;
  const partner = player === "player1" ? session.couple.player2 : session.couple.player1;
  return {
    phase: session.phase,
    player,
    couple: session.couple,
    selfName: self.name,
    partnerName: partner.name,
    answers: bundle.answers,
    questionIndex: session.questionIndex,
    substep: session.substep,
  };
}

export function useHandoff(): { partnerName: string; locked: boolean } | null {
  const { session } = useSessionContext();
  if (session.phase !== "handoff" || !session.couple) return null;
  return { partnerName: session.couple.player2.name, locked: session.player1Locked };
}

export function useComparison(): ComparisonView | null {
  const { session } = useSessionContext();
  if ((session.phase !== "analyzing" && session.phase !== "results") || !session.couple || !session.scoring) {
    return null;
  }
  return {
    couple: session.couple,
    scoring: session.scoring,
    report: session.report,
    reportSource: session.reportSource,
    fallbackReason: session.fallbackReason,
    player1Answers: session.player1.answers,
    player2Answers: session.player2.answers,
  };
}

export function usePhase(): Phase {
  return useSessionContext().session.phase;
}

export function usePlayerLocked(): boolean {
  return useSessionContext().session.player1Locked;
}
