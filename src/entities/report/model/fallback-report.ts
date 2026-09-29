import { getQuestion, optionLabel } from "@/entities/question/@x/report";
import type { AnswerValue, PlayerAnswer } from "@/entities/question/@x/report";
import type { CompatibilityReport } from "@/shared/api";

import { exactList } from "./answer-sets";
import type { ReportContext } from "./context";

const COMPARED = [
  "perfect-weekend",
  "surprise-money",
  "after-conflict",
  "ideal-date",
  "future-irritation",
  "extra-hours",
  "lost-in-city",
] as const;

function actual(answers: PlayerAnswer[], id: string): AnswerValue | undefined {
  return answers.find((item) => item.questionId === id)?.answer;
}

function labels(questionId: string, value: AnswerValue | undefined): string {
  const question = getQuestion(questionId);
  if (!question || value === undefined) return "свой вариант";
  const ids = Array.isArray(value) ? value : [value];
  const text = ids
    .filter((id) => id !== "")
    .map((id) => optionLabel(question, id))
    .join(", ");
  return text || "свой вариант";
}

function archetypeOf(context: ReportContext): CompatibilityReport["archetype"] {
  const { breakdown } = context.evaluation.scoring;
  const match = breakdown.commonPreferences + breakdown.values + breakdown.relationshipDynamics;
  const reading = breakdown.predictionAccuracy;
  if (match >= 42 && reading >= 21) {
    return {
      name: "Один мозг на двоих",
      description: "Вы часто выбираете одно и то же и ещё успеваете угадать выбор друг друга.",
    };
  }
  if (match >= 42 && reading < 15) {
    return {
      name: "Синхрон без телепатии",
      description: "Живёте похоже, а вот мысли друг друга пока читаете с переменным успехом.",
    };
  }
  if (match < 24 && reading >= 21) {
    return {
      name: "Разные, но внимательные",
      description: "Маршруты у вас разные, но вы неплохо замечаете, куда свернёт партнёр.",
    };
  }
  return {
    name: "Мы просто любим по-разному",
    description: "В ответах нет одного общего шаблона — и тест это честно показывает.",
  };
}

function cardsFor(context: ReportContext, matched: boolean): CompatibilityReport["strengths"] {
  const { couple, player1, player2 } = context;
  const cards: CompatibilityReport["strengths"] = [];
  for (const questionId of COMPARED) {
    const left = actual(player1, questionId);
    const right = actual(player2, questionId);
    const same = exactList(left, right);
    if (same !== matched) continue;
    const question = getQuestion(questionId);
    if (!question) continue;
    if (matched) {
      cards.push({
        title: question.title,
        description: `Тут вы совпали: «${labels(questionId, left)}».`,
      });
    } else {
      cards.push({
        title: question.title,
        description: `${couple.player1.name} выбирает «${labels(questionId, left)}». ${couple.player2.name} — «${labels(questionId, right)}».`,
      });
    }
    if (cards.length === 4) break;
  }
  return cards;
}

export function buildFallbackReport(context: ReportContext): CompatibilityReport {
  const { couple, evaluation } = context;
  const { player1, player2 } = couple;
  const strengths = cardsFor(context, true);
  const differences = cardsFor(context, false);
  const firstDifference = differences[0];
  const trait = actual(context.player1, "favorite-trait");
  const traitText = typeof trait === "string" ? trait.trim() : "";
  const surprising = firstDifference
    ? [
        {
          title: "Самое заметное расхождение",
          description: firstDifference.description,
        },
      ]
    : [
        {
          title: "Почти без сюрпризов в выборах",
          description:
            "В сравнимых вопросах ваши варианты совпали. Неожиданность здесь в том, как мало вам пришлось спорить с бланком.",
        },
      ];

  const safeStrengths =
    strengths.length > 0
      ? strengths
      : [
          {
            title: "Пока без общего выбора",
            description:
              "По этим ответам нельзя уверенно определить одну общую привычку: в сравнимых вопросах вы разошлись.",
          },
        ];
  const safeDifferences =
    differences.length > 0
      ? differences
      : [
          {
            title: "Выборы совпали",
            description:
              "В вопросах с вариантами ответов вы не разошлись. Это не приговор «быть одинаковыми», просто сегодня бланк у вас один.",
          },
        ];

  return {
    archetype: archetypeOf(context),
    summary: `${player1.name} и ${player2.name} набрали ${evaluation.scoring.total}% — ${evaluation.scoring.label.charAt(0).toLowerCase()}${evaluation.scoring.label.slice(1)}. Это собрано только из ваших ответов на одни и те же 12 вопросов.`,
    strengths: safeStrengths,
    differences: safeDifferences,
    surprisingAnswers: surprising,
    partnerKnowledge: {
      player1Score: evaluation.predictions.player1Percent,
      player2Score: evaluation.predictions.player2Percent,
      explanation: `${player1.name} → ${player2.name}: ${evaluation.predictions.player1Percent}%. ${player2.name} → ${player1.name}: ${evaluation.predictions.player2Percent}%. Это не соревнование, а то, насколько ваши ожидания попали в реальные ответы.`,
    },
    likelyTo: evaluation.likelyTo,
    roast:
      firstDifference?.description ??
      "Подколоть почти нечем: в вариантах ответа вы стояли на одной стороне. Осторожнее, а то гости решат, что вы сговорились.",
    positiveObservation: traitText
      ? `${player1.name} отдельно отмечает: «${traitText}». Такие детали в тесте обычно точнее любых процентов.`
      : "Вы оба дошли до конца и ответили про одну и ту же жизнь, а не про абстрактную пару из интернета.",
    finalVerdict:
      evaluation.scoring.total >= 75
        ? "Вы не обязаны быть одинаковыми. По этим ответам вам и так довольно ясно друг с другом."
        : "Вы не одинаковые — и это, судя по вашим ответам, вам совершенно не мешает быть парой.",
    achievements: evaluation.achievements,
  };
}
