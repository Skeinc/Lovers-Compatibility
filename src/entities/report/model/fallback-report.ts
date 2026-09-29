import type { CompatibilityReport } from "@/shared/api";

import type { ReportContext } from "./context";
import { DISCUSSION_QUESTION } from "./topics";

export function buildFallbackReport(context: ReportContext): CompatibilityReport {
  const { couple, evaluation } = context;
  const { player1, player2 } = couple;
  const { reading, helm, money } = evaluation;
  const miss = reading.worstMiss;
  const roleName = helm.player1 === helm.player2 ? "Два штурвала" : "Инициатор + Стабилизатор";
  const insight = `${reading.player1.guesser} угадывает ответы ${reading.player1.target}: ${reading.player1.hits}/${reading.player1.total}. ${reading.player2.guesser} угадывает ответы ${reading.player2.target}: ${reading.player2.hits}/${reading.player2.total}.`;
  const paradox = miss
    ? `${miss.guesser} ожидал «${miss.expected}», ${miss.chooser} выбрал «${miss.chosen}». Рядом по деньгам: ${player1.name} — «${money.surprise.player1}», ${player2.name} — «${money.surprise.player2}».`
    : `${player1.name} и ${player2.name} попали в угадываниях, которые попали в карточку. По деньгам ответы ${money.surprise.same ? "совпали" : "разошлись"}: «${money.surprise.player1}» и «${money.surprise.player2}».`;
  const left = evaluation.sentences.player1;
  const right = evaluation.sentences.player2;
  const finalScene =
    left !== "" || right !== ""
      ? `${player1.name}: «${left || "—"}»\n${player2.name}: «${right || "—"}»`
      : `${player1.name} и ${player2.name} дошли до конца. Свою сцену они не записали одним предложением.`;

  return {
    roleName,
    insight,
    paradox,
    discussQuestion: DISCUSSION_QUESTION[evaluation.discussionTopic],
    finalScene,
  };
}
