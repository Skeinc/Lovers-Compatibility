import type { AnswerValue, Question, QuestionKind, Substep } from "./types";

export function substepsFor(kind: QuestionKind): Substep[] {
  if (kind === "choice-predict" || kind === "multi-predict") return ["predict", "actual"];
  if (kind === "text-predict") return ["actual", "predict"];
  return ["actual"];
}

export function initialSubstep(kind: QuestionKind): Substep {
  return substepsFor(kind)[0] ?? "actual";
}

export function decodeWho(value: AnswerValue | undefined): Map<string, "self" | "partner"> {
  const decoded = new Map<string, "self" | "partner">();
  if (value === undefined) return decoded;
  const parts = Array.isArray(value) ? value : [value];
  for (const part of parts) {
    const splitAt = part.lastIndexOf(":");
    if (splitAt <= 0) continue;
    const choice = part.slice(splitAt + 1);
    if (choice === "self" || choice === "partner") {
      decoded.set(part.slice(0, splitAt), choice);
    }
  }
  return decoded;
}

export function encodeWho(choices: Map<string, "self" | "partner">): string[] {
  return [...choices.entries()].map(([id, choice]) => `${id}:${choice}`);
}

export function isValueFilled(question: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (question.kind === "text" || question.kind === "text-predict") {
    return typeof value === "string" && value.trim().length >= 2;
  }
  if (question.kind === "who-likely") {
    const decoded = decodeWho(value);
    return (question.scenarios ?? []).every((scenario) => decoded.has(scenario.id));
  }
  if (question.kind === "multi" || question.kind === "multi-predict") {
    return Array.isArray(value) && value.length > 0;
  }
  return typeof value === "string" && value.length > 0;
}

export function toggleMulti(current: string[], optionId: string, exclusive: boolean): string[] {
  if (exclusive) return current.length === 1 && current[0] === optionId ? [] : [optionId];
  const withoutExclusive = current.filter((id) => id !== "nothing");
  if (withoutExclusive.includes(optionId)) return withoutExclusive.filter((id) => id !== optionId);
  return [...withoutExclusive, optionId];
}
