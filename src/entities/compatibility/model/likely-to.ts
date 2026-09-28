import { QUESTIONS, decodeWho } from "@/entities/question/@x/compatibility";

import type { AnswerValue } from "@/entities/question/@x/compatibility";
import type { LikelyItem } from "./types";

function absolutePerson(player: 1 | 2, choice: "self" | "partner"): 1 | 2 {
  if (player === 1) return choice === "self" ? 1 : 2;
  return choice === "self" ? 2 : 1;
}

export function countWhoAgreements(left: AnswerValue | undefined, right: AnswerValue | undefined): number {
  const question = QUESTIONS.find((item) => item.id === "who-is-more-likely");
  const scenarios = question?.scenarios ?? [];
  const first = decodeWho(left);
  const second = decodeWho(right);
  let agreements = 0;
  for (const scenario of scenarios) {
    const a = first.get(scenario.id);
    const b = second.get(scenario.id);
    if (!a || !b) continue;
    if (absolutePerson(1, a) === absolutePerson(2, b)) agreements += 1;
  }
  return agreements;
}

export function buildLikelyTo(
  left: AnswerValue | undefined,
  right: AnswerValue | undefined,
  player1Name: string,
  player2Name: string,
): LikelyItem[] {
  const question = QUESTIONS.find((item) => item.id === "who-is-more-likely");
  const scenarios = question?.scenarios ?? [];
  const first = decodeWho(left);
  const second = decodeWho(right);
  const items: LikelyItem[] = [];
  for (const scenario of scenarios) {
    const a = first.get(scenario.id);
    const b = second.get(scenario.id);
    if (!a || !b) continue;
    const person = absolutePerson(1, a);
    if (person !== absolutePerson(2, b)) continue;
    const name = person === 1 ? player1Name : player2Name;
    items.push({
      title: scenario.prompt,
      person: name,
      explanation: `${player1Name} и ${player2Name} указали на одного человека: ${name}.`,
    });
  }
  return items;
}
