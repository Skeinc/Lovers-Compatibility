import { evaluateCompatibility } from "@/entities/compatibility/@x/session";
import type { CoupleProfile } from "@/entities/couple/@x/session";
import { QUESTIONS, initialSubstep, isValueFilled, substepsFor } from "@/entities/question/@x/session";
import type { AnswerValue, PlayerAnswer, Substep } from "@/entities/question/@x/session";

import { createSession } from "./create";
import type { Phase, QuizSession, SessionAction } from "./types";

function touch(state: QuizSession, patch: Partial<QuizSession>): QuizSession {
  return { ...state, ...patch, updatedAt: new Date().toISOString() };
}

function upsert(answers: PlayerAnswer[], next: PlayerAnswer): PlayerAnswer[] {
  const index = answers.findIndex((item) => item.questionId === next.questionId);
  if (index === -1) return [...answers, next];
  const copy = [...answers];
  copy[index] = next;
  return copy;
}

function currentBundle(state: QuizSession): "player1" | "player2" | null {
  if (state.phase === "player1") return "player1";
  if (state.phase === "player2") return "player2";
  return null;
}

function writeValue(state: QuizSession, value: AnswerValue): QuizSession {
  const key = currentBundle(state);
  const question = QUESTIONS[state.questionIndex];
  if (!key || !question) return state;
  const bundle = state[key];
  const existing = bundle.answers.find((item) => item.questionId === question.id);
  const next: PlayerAnswer =
    state.substep === "predict"
      ? { questionId: question.id, answer: existing?.answer ?? "", prediction: value }
      : { questionId: question.id, answer: value, prediction: existing?.prediction };
  return touch(state, { [key]: { ...bundle, answers: upsert(bundle.answers, next) } });
}

function savedValue(state: QuizSession): AnswerValue | undefined {
  const key = currentBundle(state);
  const question = QUESTIONS[state.questionIndex];
  if (!key || !question) return undefined;
  const saved = state[key].answers.find((item) => item.questionId === question.id);
  return state.substep === "predict" ? saved?.prediction : saved?.answer;
}

function advance(state: QuizSession): QuizSession {
  const key = currentBundle(state);
  const question = QUESTIONS[state.questionIndex];
  if (!key || !question) return state;
  if (!isValueFilled(question, savedValue(state))) return state;
  const steps = substepsFor(question.kind);
  const stepIndex = steps.indexOf(state.substep);
  const nextStep = steps[stepIndex + 1];
  if (nextStep) return touch(state, { substep: nextStep });
  const following = QUESTIONS[state.questionIndex + 1];
  if (!following) return state;
  return touch(state, {
    questionIndex: state.questionIndex + 1,
    substep: initialSubstep(following.kind),
  });
}

function back(state: QuizSession): QuizSession {
  if (state.phase !== "player1" && state.phase !== "player2") return state;
  const question = QUESTIONS[state.questionIndex];
  if (!question) return state;
  const steps = substepsFor(question.kind);
  const stepIndex = steps.indexOf(state.substep);
  const previous = steps[stepIndex - 1];
  if (previous) return touch(state, { substep: previous });
  if (state.questionIndex > 0) {
    const prevQuestion = QUESTIONS[state.questionIndex - 1];
    if (!prevQuestion) return state;
    const prevSteps = substepsFor(prevQuestion.kind);
    const last = prevSteps[prevSteps.length - 1] ?? "actual";
    return touch(state, { questionIndex: state.questionIndex - 1, substep: last });
  }
  const intro: Phase = state.phase === "player1" ? "player1-intro" : "player2-intro";
  return touch(state, { phase: intro });
}

function finishPlayer(state: QuizSession): QuizSession {
  const now = new Date().toISOString();
  if (state.phase === "player1") {
    return touch(state, { phase: "handoff", player1: { ...state.player1, completedAt: now } });
  }
  if (state.phase !== "player2" || !state.player1Locked || !state.couple) return state;
  const evaluation = evaluateCompatibility({
    player1Name: state.couple.player1.name,
    player2Name: state.couple.player2.name,
    player1: state.player1.answers,
    player2: state.player2.answers,
  });
  return touch(state, {
    phase: "analyzing",
    player2: { ...state.player2, completedAt: now },
    scoring: evaluation.scoring,
    predictions: evaluation.predictions,
  });
}

function firstSubstep(): Substep {
  return initialSubstep(QUESTIONS[0]?.kind ?? "choice-predict");
}

export function sessionReducer(state: QuizSession, action: SessionAction): QuizSession {
  switch (action.type) {
    case "hydrate": {
      if (action.session.version !== 1) return state;
      const next = action.session;
      const hidden: Phase[] = ["setup", "player1-intro", "player1", "handoff"];
      if (next.player1Locked && hidden.includes(next.phase)) {
        return { ...next, phase: "player2-intro", questionIndex: 0, substep: firstSubstep() };
      }
      return next;
    }
    case "reset":
      return createSession();
    case "start":
      return state.phase === "landing" ? touch(state, { phase: "setup", setupStep: 0 }) : state;
    case "set-draft":
      if (state.phase !== "setup") return state;
      return touch(state, {
        draft: action.draft,
        setupStep: Math.min(4, Math.max(0, action.setupStep)),
      });
    case "finish-setup":
      return finishSetup(state, action.couple);
    case "begin-quiz":
      if (state.phase === "player1-intro" && !state.player1Locked) return touch(state, { phase: "player1" });
      if (state.phase === "player2-intro" && state.player1Locked) return touch(state, { phase: "player2" });
      return state;
    case "save-value":
      return writeValue(state, action.value);
    case "advance":
      return advance(state);
    case "back":
      return back(state);
    case "finish-player":
      return finishPlayer(state);
    case "confirm-handoff":
      if (state.phase !== "handoff" || state.player1Locked) return state;
      return touch(state, {
        player1Locked: true,
        phase: "player2-intro",
        questionIndex: 0,
        substep: firstSubstep(),
      });
    case "retry-analysis":
      if (state.phase !== "results" && state.phase !== "analyzing") return state;
      if (!state.scoring) return state;
      return touch(state, {
        phase: "analyzing",
        report: undefined,
        reportSource: undefined,
        fallbackReason: undefined,
      });
    case "set-report":
      if (state.phase !== "analyzing") return state;
      return touch(state, {
        phase: "results",
        report: action.report,
        reportSource: action.source,
        fallbackReason: action.fallbackReason,
      });
    default:
      return state;
  }
}

function finishSetup(state: QuizSession, couple: CoupleProfile): QuizSession {
  if (state.phase !== "setup" || state.player1Locked) return state;
  return touch(state, {
    couple,
    phase: "player1-intro",
    questionIndex: 0,
    substep: firstSubstep(),
  });
}

export function phaseToPath(phase: Phase): string {
  switch (phase) {
    case "landing":
      return "/";
    case "setup":
      return "/setup";
    case "player1-intro":
    case "player1":
      return "/player/1";
    case "handoff":
      return "/handoff";
    case "player2-intro":
    case "player2":
      return "/player/2";
    case "analyzing":
      return "/analyzing";
    case "results":
      return "/results";
  }
}

export function canOpenPlayerOne(state: QuizSession): boolean {
  return !state.player1Locked && (state.phase === "player1-intro" || state.phase === "player1");
}
