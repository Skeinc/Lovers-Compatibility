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
  if (match >= 70) {
    return {
      name: "Один ритм",
      description: "В быту, деньгах и выходных вы часто выбираете одну и ту же сторону.",
    };
  }
  if (match >= 40) {
    return {
      name: "Рядом, но не копия",
      description: "Часть жизни у вас общая, а часть каждый видит по-своему. В этом и есть сюжет.",
    };
  }
  return {
    name: "Два вкуса, одна пара",
    description: "Вы часто выбираете по-разному, и в этом как раз есть характер. Одинаковый бланк тут ни к чему.",
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
            title: "У каждого свой вкус",
            description:
              "В готовых вариантах вы чаще выбираете разное. Это не оценка отношений, а просто разные ответы.",
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
    summary:
      evaluation.scoring.total >= 75
        ? `${player1.name} и ${player2.name} часто выбирают одну сторону: ${evaluation.scoring.total}% совпадения в ответах.`
        : `${player1.name} и ${player2.name} ответили про одну и ту же жизнь. Где вкусы совпали — это тепло, где разошлись — это характер, а не минус.`,
    strengths: safeStrengths,
    differences: safeDifferences,
    surprisingAnswers: surprising,
    likelyTo: evaluation.likelyTo,
    roast:
      firstDifference?.description ??
      "Подколоть почти нечем: в вариантах ответа вы стояли на одной стороне. Осторожнее, а то гости решат, что вы сговорились.",
    positiveObservation: traitText
      ? `${player1.name} отдельно отмечает: «${traitText}». Такие детали обычно точнее любого общего вывода.`
      : "Вы оба дошли до конца и ответили про одну и ту же жизнь, а не про абстрактную пару из интернета.",
    finalVerdict:
      evaluation.scoring.total >= 75
        ? "Вы не обязаны быть одинаковыми. По этим ответам вам и так довольно ясно друг с другом."
        : "Вы не одинаковые — и это, судя по вашим ответам, вам совершенно не мешает быть парой.",
    achievements: evaluation.achievements,
  };
}
