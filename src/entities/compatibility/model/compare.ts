import { textSimilarity } from "@/shared/lib/text-similarity";

import type { AnswerValue } from "@/entities/question/@x/compatibility";

export function asList(value: AnswerValue | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value.filter((item) => item !== "");
  if (value === "") return [];
  return [value];
}

export function exactMatch(left: AnswerValue | undefined, right: AnswerValue | undefined): boolean {
  const a = [...asList(left)].sort();
  const b = [...asList(right)].sort();
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

export function jaccard(left: AnswerValue | undefined, right: AnswerValue | undefined): number {
  const a = new Set(asList(left));
  const b = new Set(asList(right));
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function textMatch(left: AnswerValue | undefined, right: AnswerValue | undefined): number {
  const a = typeof left === "string" ? left : "";
  const b = typeof right === "string" ? right : "";
  return textSimilarity(a, b);
}
