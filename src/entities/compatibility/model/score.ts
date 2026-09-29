import { QUESTIONS } from "@/entities/question/@x/compatibility";
import type { AnswerValue, PlayerAnswer } from "@/entities/question/@x/compatibility";

import { buildAchievements } from "./achievements";
import { exactMatch, jaccard, textMatch } from "./compare";
import { buildLikelyTo, countWhoAgreements } from "./likely-to";
import type { Evaluation, EvaluationInput, ScoreBreakdown } from "./types";

function answerOf(answers: PlayerAnswer[], questionId: string): PlayerAnswer | undefined {
  return answers.find((item) => item.questionId === questionId);
}

function actual(answers: PlayerAnswer[], questionId: string): AnswerValue | undefined {
  return answerOf(answers, questionId)?.answer;
}

export function scoreLabel(total: number): string {
  if (total >= 90) return "Почти один ритм";
  if (total >= 75) return "Очень близко смотрите на жизнь";
  if (total >= 60) return "В главном вы совпадаете";
  if (total >= 45) return "Вы разные, и в этом есть химия";
  return "Свой вкус у каждого";
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function evaluateCompatibility(input: EvaluationInput): Evaluation {
  const { player1, player2 } = input;
  const weekend = exactMatch(actual(player1, "perfect-weekend"), actual(player2, "perfect-weekend")) ? 10 : 0;
  const date = exactMatch(actual(player1, "ideal-date"), actual(player2, "ideal-date")) ? 10 : 0;
  const city = exactMatch(actual(player1, "lost-in-city"), actual(player2, "lost-in-city")) ? 8 : 0;
  const commonPreferences = weekend + date + city;

  const money = exactMatch(actual(player1, "surprise-money"), actual(player2, "surprise-money")) ? 16 : 0;
  const hours = exactMatch(actual(player1, "extra-hours"), actual(player2, "extra-hours")) ? 16 : 0;
  const values = money + hours;

  const conflict = exactMatch(actual(player1, "after-conflict"), actual(player2, "after-conflict")) ? 7 : 0;
  const irritation = jaccard(actual(player1, "future-irritation"), actual(player2, "future-irritation")) * 6;
  const whoAgreements = countWhoAgreements(
    actual(player1, "who-is-more-likely"),
    actual(player2, "who-is-more-likely"),
  );
  const whoScore = (whoAgreements / 6) * 8;
  const relationshipDynamics = round2(conflict + irritation + whoScore);

  const freeYear = textMatch(actual(player1, "free-year"), actual(player2, "free-year"));
  const threeWordsSimilarity = textMatch(actual(player1, "three-words"), actual(player2, "three-words"));
  const textSimilarityScore = round2(freeYear * 6 + threeWordsSimilarity * 13);

  const breakdown: ScoreBreakdown = {
    commonPreferences,
    values,
    relationshipDynamics,
    textSimilarity: textSimilarityScore,
  };
  const precise =
    commonPreferences + values + conflict + irritation + whoScore + freeYear * 6 + threeWordsSimilarity * 13;
  const total = Math.max(0, Math.min(100, Math.round(precise)));
  const preferenceMatches = Number(weekend > 0) + Number(date > 0) + Number(city > 0);
  const moneyMatches = Number(money > 0) + Number(hours > 0);
  const scoring = { total, label: scoreLabel(total), breakdown };
  const achievements = buildAchievements({
    preferenceMatches,
    moneyMatches,
    whoAgreements,
    threeWordsSimilarity,
    total,
  });

  return {
    scoring,
    achievements,
    likelyTo: buildLikelyTo(
      actual(player1, "who-is-more-likely"),
      actual(player2, "who-is-more-likely"),
      input.player1Name,
      input.player2Name,
    ),
    preferenceMatches,
    moneyMatches,
    whoAgreements,
    threeWordsSimilarity,
  };
}

export function questionCount(): number {
  return QUESTIONS.length;
}
