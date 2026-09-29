import type { Evaluation } from "@/entities/compatibility/@x/report";
import type { CoupleProfile } from "@/entities/couple/@x/report";
import type { PlayerAnswer } from "@/entities/question/@x/report";
import type { CompatibilityAnalysisInput } from "@/shared/api";

import { DISCUSSION_TOPIC_LABEL } from "./topics";

export interface ReportContext {
  couple: CoupleProfile;
  player1: PlayerAnswer[];
  player2: PlayerAnswer[];
  evaluation: Evaluation;
}

function momentText(moment: Evaluation["reading"]["bestHit"]): string | null {
  if (!moment) return null;
  return `${moment.guesser} ожидал «${moment.expected}», ${moment.chooser} ответил «${moment.chosen}» (${moment.title})`;
}

function choiceOf(choice: {
  title: string;
  player1: string;
  player2: string;
  same: boolean;
}): CompatibilityAnalysisInput["money"]["surprise"] {
  return { topic: choice.title, player1: choice.player1, player2: choice.player2, same: choice.same };
}

function flagOf(
  side: Evaluation["flags"]["green"]["player1"],
): CompatibilityAnalysisInput["perception"]["green"]["player1"] {
  return { selfImage: side.selfImage, seesInPartner: side.seesInPartner, matched: side.matched };
}

export function buildAnalysisInput(context: ReportContext): CompatibilityAnalysisInput {
  const { couple, evaluation } = context;
  const { reading, helm, values, money, flags } = evaluation;
  return {
    players: { player1: couple.player1.name, player2: couple.player2.name },
    reading: {
      player1to2: `${reading.player1.guesser} → ${reading.player1.target}: ${reading.player1.hits}/${reading.player1.total}`,
      player2to1: `${reading.player2.guesser} → ${reading.player2.target}: ${reading.player2.hits}/${reading.player2.total}`,
      bestHit: momentText(reading.bestHit),
      worstMiss: momentText(reading.worstMiss),
    },
    perception: {
      green: { player1: flagOf(flags.green.player1), player2: flagOf(flags.green.player2) },
      red: { player1: flagOf(flags.red.player1), player2: flagOf(flags.red.player2) },
    },
    helm: {
      player1Points: helm.player1,
      player2Points: helm.player2,
      maxScenes: 8,
      disputes: helm.disputes,
      headline: helm.headline,
      scenes: helm.scenes.map((scene) => ({ title: scene.title, label: scene.label })),
    },
    domains: evaluation.domains.map((domain) => ({
      id: domain.id,
      label: domain.label,
      score: domain.score,
      questionIds: domain.questionIds,
    })),
    values: {
      overlap: values.overlap,
      shared: values.shared,
      onlyPlayer1: values.onlyPlayer1,
      onlyPlayer2: values.onlyPlayer2,
      player1: values.player1,
      player2: values.player2,
    },
    money: { surprise: choiceOf(money.surprise), earnings: choiceOf(money.earnings) },
    relocation: choiceOf(evaluation.relocation),
    family: choiceOf(evaluation.futureFamily),
    discussionTopic: evaluation.discussionTopic,
    discussionHint: DISCUSSION_TOPIC_LABEL[evaluation.discussionTopic],
  };
}
