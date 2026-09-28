import type { AnswerValue } from "@/entities/question/@x/report";

export function exactList(left: AnswerValue | undefined, right: AnswerValue | undefined): boolean {
  const a = normalize(left);
  const b = normalize(right);
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function normalize(value: AnswerValue | undefined): string[] {
  if (value === undefined) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter((item) => item !== "").sort();
}
