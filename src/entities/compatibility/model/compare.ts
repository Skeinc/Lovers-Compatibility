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
