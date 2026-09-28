import { durationLabel, goalLabels, howMetLabel, type CoupleProfile } from "@/entities/couple/@x/report";
import type { Evaluation } from "@/entities/compatibility/@x/report";
import { formatAnswer, QUESTIONS, type PlayerAnswer } from "@/entities/question/@x/report";
import type { CompatibilityAnalysisInput, CompatibilityReport } from "@/shared/api";

export interface ReportContext {
  couple: CoupleProfile;
  player1: PlayerAnswer[];
  player2: PlayerAnswer[];
  evaluation: Evaluation;
}

function answerLine(
  answers: PlayerAnswer[],
  selfName: string,
  partnerName: string,
): CompatibilityAnalysisInput["player1"] {
  return QUESTIONS.map((question) => {
    const saved = answers.find((item) => item.questionId === question.id);
    const answer = saved ? formatAnswer(question, saved.answer, selfName, partnerName) : "";
    const prediction =
      saved?.prediction !== undefined ? formatAnswer(question, saved.prediction, selfName, partnerName) : undefined;
    return {
      question: question.title,
      answer,
      ...(prediction !== undefined && prediction !== "" ? { prediction } : {}),
    };
  });
}

export function buildAnalysisInput(context: ReportContext): CompatibilityAnalysisInput {
  const { couple, evaluation } = context;
  return {
    couple: {
      player1: couple.player1,
      player2: couple.player2,
      relationshipDuration: durationLabel(couple),
      howMet: howMetLabel(couple),
      ...(couple.howMetDetails ? { howMetDetails: couple.howMetDetails } : {}),
      goals: goalLabels(couple),
    },
    player1: answerLine(context.player1, couple.player1.name, couple.player2.name),
    player2: answerLine(context.player2, couple.player2.name, couple.player1.name),
    scoring: {
      total: evaluation.scoring.total,
      label: evaluation.scoring.label,
    },
    predictions: {
      player1Percent: evaluation.predictions.player1Percent,
      player2Percent: evaluation.predictions.player2Percent,
    },
    likelyTo: evaluation.likelyTo,
    achievements: evaluation.achievements,
  };
}

export function attachLocalFacts(report: CompatibilityReport, context: ReportContext): CompatibilityReport {
  return {
    ...report,
    partnerKnowledge: {
      ...report.partnerKnowledge,
      player1Score: context.evaluation.predictions.player1Percent,
      player2Score: context.evaluation.predictions.player2Percent,
    },
    likelyTo: context.evaluation.likelyTo,
    achievements: context.evaluation.achievements,
  };
}
