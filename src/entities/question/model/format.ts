import { optionLabel } from "../config/questions";
import { decodeWho } from "./flow";
import type { AnswerValue, Question } from "./types";

export function formatAnswer(question: Question, value: AnswerValue, selfName: string, partnerName: string): string {
  if (question.kind === "text" || question.kind === "text-predict") {
    return typeof value === "string" ? value.trim() : value.join(" ").trim();
  }
  if (question.kind === "who-likely") {
    const decoded = decodeWho(value);
    return (question.scenarios ?? [])
      .map((scenario) => {
        const choice = decoded.get(scenario.id);
        const person = choice === "self" ? selfName : choice === "partner" ? partnerName : "не выбрано";
        return `${scenario.prompt} ${person}`;
      })
      .join("; ");
  }
  const ids = Array.isArray(value) ? value : [value];
  const labels = ids.filter((id) => id !== "").map((id) => optionLabel(question, id));
  return labels.join(", ");
}
