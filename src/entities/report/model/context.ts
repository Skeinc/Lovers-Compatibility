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
  return `${moment.guesser} ожидал «${moment.expected}», ${moment.chooser} выбрал «${moment.chosen}» (${moment.title})`;
}

export function buildAnalysisInput(context: ReportContext): CompatibilityAnalysisInput {
  const { couple, evaluation } = context;
  const { reading, helm, values, money } = evaluation;
  return {
    players: { player1: couple.player1.name, player2: couple.player2.name },
    agreementPercent: evaluation.scoring.total,
    reading: {
      player1to2: `${reading.player1.guesser} → ${reading.player1.target}: ${reading.player1.hits}/${reading.player1.total}`,
      player2to1: `${reading.player2.guesser} → ${reading.player2.target}: ${reading.player2.hits}/${reading.player2.total}`,
    },
    bestHit: momentText(reading.bestHit),
    worstMiss: momentText(reading.worstMiss),
    green: evaluation.traffic.green,
    interesting: evaluation.traffic.interesting,
    spicy: momentText(evaluation.traffic.spicy),
    choices: evaluation.choices.map((choice) => ({
      topic: choice.title,
      player1: choice.player1,
      player2: choice.player2,
      same: choice.same,
    })),
    valuesOverlap: values.overlap,
    sharedValues: values.shared,
    valuesByPlayer: { player1: values.player1, player2: values.player2 },
    earnings: {
      topic: money.earnings.title,
      player1: money.earnings.player1,
      player2: money.earnings.player2,
      same: money.earnings.same,
    },
    helm: { player1Points: helm.player1, player2Points: helm.player2, line: helm.line },
    discussionTopic: evaluation.discussionTopic,
    discussionTopicLabel: DISCUSSION_TOPIC_LABEL[evaluation.discussionTopic],
    sentences: evaluation.sentences,
  };
}
