import type { AnswerValue, Question, QuestionKind, Substep, WhoChoice } from "./types";

const WHO_CHOICES = new Set<WhoChoice>(["self", "partner", "even"]);

export function substepsFor(kind: QuestionKind): Substep[] {
  if (kind === "choice-predict" || kind === "multi-predict") return ["predict", "actual"];
  if (kind === "text-predict") return ["actual", "predict"];
  return ["actual"];
}

export function initialSubstep(kind: QuestionKind): Substep {
  return substepsFor(kind)[0] ?? "actual";
}

export function decodeWho(value: AnswerValue | undefined): Map<string, WhoChoice> {
  const decoded = new Map<string, WhoChoice>();
  if (value === undefined) return decoded;
  const parts = Array.isArray(value) ? value : [value];
  for (const part of parts) {
    const splitAt = part.lastIndexOf(":");
    if (splitAt <= 0) continue;
    const choice = part.slice(splitAt + 1);
    if (WHO_CHOICES.has(choice as WhoChoice)) {
      decoded.set(part.slice(0, splitAt), choice as WhoChoice);
    }
  }
  return decoded;
}

export function encodeWho(choices: Map<string, WhoChoice>): string[] {
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
    if (!Array.isArray(value)) return false;
    if (question.maxSelections !== undefined) return value.length === question.maxSelections;
    return value.length > 0;
  }
  return typeof value === "string" && value.length > 0;
}

export function toggleMulti(current: string[], optionId: string, exclusive: boolean, max?: number): string[] {
  if (exclusive) return current.length === 1 && current[0] === optionId ? [] : [optionId];
  const withoutExclusive = current.filter((id) => id !== "nothing");
  if (withoutExclusive.includes(optionId)) return withoutExclusive.filter((id) => id !== optionId);
  if (max !== undefined && withoutExclusive.length >= max) return withoutExclusive;
  return [...withoutExclusive, optionId];
}
