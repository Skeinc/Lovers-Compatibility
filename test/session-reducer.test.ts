import { describe, expect, it } from "vitest";

import type { CoupleProfile } from "@/entities/couple";
import { createSession, sessionReducer, type QuizSession } from "@/entities/session";

const couple: CoupleProfile = {
  player1: { name: "Дима", age: 28 },
  player2: { name: "Настя", age: 27 },
  relationshipDuration: "1-2y",
  howMet: "friends",
  goals: ["travel"],
};

function session(patch: Partial<QuizSession>): QuizSession {
  return { ...createSession("2026-09-28T12:00:00.000Z"), ...patch };
}

describe("sessionReducer", () => {
  it("locks player 1 on handoff and does not reopen those answers", () => {
    const handed = sessionReducer(
      session({
        phase: "handoff",
        couple,
        player1: { answers: [{ questionId: "perfect-weekend", answer: "home" }] },
      }),
      { type: "confirm-handoff" },
    );
    expect(handed.player1Locked).toBe(true);
    expect(handed.phase).toBe("player2-intro");

    const attacked = { ...handed, phase: "player1" as const };
    expect(sessionReducer(attacked, { type: "begin-quiz" })).toBe(attacked);

    const fromIntro = { ...handed, phase: "player1-intro" as const };
    expect(sessionReducer(fromIntro, { type: "begin-quiz" })).toBe(fromIntro);
  });

  it("sends a locked player-1 phase back to player 2 on hydrate", () => {
    const locked = session({ phase: "player1", player1Locked: true, couple });
    const hydrated = sessionReducer(createSession(), { type: "hydrate", session: locked });
    expect(hydrated.phase).toBe("player2-intro");
    expect(hydrated.player1Locked).toBe(true);
  });

  it("moves player 2 back only inside their own phase", () => {
    const playing = session({
      phase: "player2",
      player1Locked: true,
      couple,
      questionIndex: 0,
      substep: "predict",
    });
    const intro = sessionReducer(playing, { type: "back" });
    expect(intro.phase).toBe("player2-intro");
  });

  it("refuses to finish setup after the phone was handed over", () => {
    const locked = session({ phase: "setup", player1Locked: true });
    expect(sessionReducer(locked, { type: "finish-setup", couple })).toBe(locked);
  });
});
