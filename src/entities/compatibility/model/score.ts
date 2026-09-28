import { QUESTIONS } from "@/entities/question/@x/compatibility";
import type { AnswerValue, PlayerAnswer } from "@/entities/question/@x/compatibility";

import { buildAchievements } from "./achievements";
import { exactMatch, jaccard, textMatch } from "./compare";
import { buildLikelyTo, countWhoAgreements } from "./likely-to";
import type { Evaluation, EvaluationInput, ScoreBreakdown } from "./types";

const PREDICTION_IDS = [
  "perfect-weekend",
  "surprise-money",
  "after-conflict",
  "ideal-date",
  "future-irritation",
  "extra-hours",
  "lost-in-city",
] as const;

function answerOf(answers: PlayerAnswer[], questionId: string): PlayerAnswer | undefined {
  return answers.find((item) => item.questionId === questionId);
}

function actual(answers: PlayerAnswer[], questionId: string): AnswerValue | undefined {
  return answerOf(answers, questionId)?.answer;
}

function predicted(answers: PlayerAnswer[], questionId: string): AnswerValue | undefined {
  return answerOf(answers, questionId)?.prediction;
}

export function scoreLabel(total: number): string {
  if (total >= 90) return "Почти читаете мысли друг друга";
  if (total >= 75) return "Очень хорошо считываете друг друга";
  if (total >= 60) return "Хорошо понимаете друг друга";
  if (total >= 45) return "Вы разные, и в этом есть химия";
  return "Загадка друг для друга";
}

function predictionRaw(guesser: PlayerAnswer[], subject: PlayerAnswer[]): number {
  let hits = 0;
  for (const questionId of PREDICTION_IDS) {
    if (exactMatch(predicted(guesser, questionId), actual(subject, questionId))) hits += 1;
  }
  return hits + textMatch(predicted(guesser, "three-words"), actual(subject, "three-words"));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function evaluateCompatibility(input: EvaluationInput): Evaluation {
  const { player1, player2 } = input;
  const weekend = exactMatch(actual(player1, "perfect-weekend"), actual(player2, "perfect-weekend"));
  const date = exactMatch(actual(player1, "ideal-date"), actual(player2, "ideal-date"));
  const city = exactMatch(actual(player1, "lost-in-city"), actual(player2, "lost-in-city"));
  const commonPreferences = (weekend ? 7 : 0) + (date ? 7 : 0) + (city ? 6 : 0);

  const money = exactMatch(actual(player1, "surprise-money"), actual(player2, "surprise-money"));
  const hours = exactMatch(actual(player1, "extra-hours"), actual(player2, "extra-hours"));
  const values = (money ? 12 : 0) + (hours ? 13 : 0);

  const player1Raw = predictionRaw(player1, player2);
  const player2Raw = predictionRaw(player2, player1);
  const predictionAccuracy = round2(((player1Raw + player2Raw) / 2 / 8) * 30);

  const conflict = exactMatch(actual(player1, "after-conflict"), actual(player2, "after-conflict")) ? 5 : 0;
  const irritation = jaccard(actual(player1, "future-irritation"), actual(player2, "future-irritation")) * 4;
  const whoAgreements = countWhoAgreements(
    actual(player1, "who-is-more-likely"),
    actual(player2, "who-is-more-likely"),
  );
  const relationshipDynamics = round2(conflict + irritation + (whoAgreements / 6) * 6);

  const threeWordsSimilarity = textMatch(actual(player1, "three-words"), actual(player2, "three-words"));
  const textSimilarityScore = round2(
    textMatch(actual(player1, "free-year"), actual(player2, "free-year")) * 4 + threeWordsSimilarity * 6,
  );

  const breakdown: ScoreBreakdown = {
    commonPreferences,
    values,
    predictionAccuracy,
    relationshipDynamics,
    textSimilarity: textSimilarityScore,
  };
  const precise =
    breakdown.commonPreferences +
    breakdown.values +
    ((player1Raw + player2Raw) / 2 / 8) * 30 +
    conflict +
    irritation +
    (whoAgreements / 6) * 6 +
    textMatch(actual(player1, "free-year"), actual(player2, "free-year")) * 4 +
    threeWordsSimilarity * 6;
  const total = Math.max(0, Math.min(100, Math.round(precise)));
  const predictions = {
    player1Raw,
    player2Raw,
    total: 8 as const,
    player1Percent: Math.round((player1Raw / 8) * 100),
    player2Percent: Math.round((player2Raw / 8) * 100),
  };
  const preferenceMatches = Number(weekend) + Number(date) + Number(city);
  const moneyMatches = Number(money) + Number(hours);
  const scoring = { total, label: scoreLabel(total), breakdown };
  const achievements = buildAchievements({
    player1Percent: predictions.player1Percent,
    player2Percent: predictions.player2Percent,
    preferenceMatches,
    moneyMatches,
    whoAgreements,
    threeWordsSimilarity,
    total,
  });

  return {
    scoring,
    predictions,
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
