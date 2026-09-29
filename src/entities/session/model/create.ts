import { emptyDraft } from "@/entities/couple/@x/session";

import type { QuizSession } from "./types";

export function createSession(now = new Date().toISOString()): QuizSession {
  return {
    id: crypto.randomUUID(),
    version: 2,
    createdAt: now,
    updatedAt: now,
    phase: "landing",
    setupStep: 0,
    questionIndex: 0,
    substep: "predict",
    couple: null,
    draft: emptyDraft(),
    player1: { answers: [] },
    player2: { answers: [] },
    player1Locked: false,
  };
}
