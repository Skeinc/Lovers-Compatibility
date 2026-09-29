import type { Evaluation } from "@/entities/compatibility/@x/report";
import { getQuestion } from "@/entities/question/@x/report";
import type { CompatibilityReport } from "@/shared/api";

import type { ReportContext } from "./context";
import { DISCUSSION_QUESTION } from "./topics";

const FRIENDLY_VERDICTS = [
  "Одна команда",
  "Очень на одной волне",
  "Похожи больше, чем кажется",
  "Дополняете друг друга",
  "У каждого своя роль",
  "Два разных характера — одна команда",
  "Сговорились заранее",
  "Совпали там, где не ожидали",
] as const;

export type FriendlyVerdict = (typeof FRIENDLY_VERDICTS)[number];

export function friendlyVerdicts(): readonly FriendlyVerdict[] {
  return FRIENDLY_VERDICTS;
}

function soften(score: number): number {
  return Math.round((0.32 + score * 0.36) * 100) / 100;
}

function pair(evaluation: Evaluation, questionId: string): { player1: string; player2: string } | undefined {
  const title = getQuestion(questionId)?.title;
  return evaluation.choices.find((item) => item.title === title);
}

function voices(name1: string, name2: string, left: string, right: string): string {
  if (left === right) return `${name1} и ${name2} называют одно: «${left}».`;
  return `${name1} держит «${left}», ${name2} — «${right}».`;
}

export function buildXray(evaluation: Evaluation, name1: string, name2: string): CompatibilityReport["xray"] {
  const byId = new Map(evaluation.domains.map((domain) => [domain.id, domain.score]));
  const score = (id: Evaluation["domains"][number]["id"]) => soften(byId.get(id) ?? 0);
  const conflict = pair(evaluation, "after-conflict");
  const household = pair(evaluation, "household-fight");
  const weekend = pair(evaluation, "perfect-weekend");
  const { money, relocation, futureFamily, values, helm } = evaluation;
  const shared = values.shared.length > 0 ? values.shared.join(", ") : "общих ценностей нет";

  return [
    {
      id: "relationships",
      score: score("relationships"),
      reason: `${voices(name1, name2, conflict?.player1 ?? "свой ответ", conflict?.player2 ?? "свой ответ")} ${helm.headline} Ссора и инициатива вместе, не один пункт.`,
    },
    {
      id: "money",
      score: score("money"),
      reason: `${voices(name1, name2, money.surprise.player1, money.surprise.player2)} Заработок: ${money.earnings.player1} и ${money.earnings.player2}. Ползунок собран из денег и того, кто их держит, не из одной траты.`,
    },
    {
      id: "household",
      score: score("household"),
      reason: `${voices(name1, name2, household?.player1 ?? "свой ответ", household?.player2 ?? "свой ответ")} Это сюжет первой бытовой ссоры, не приговор всему быту.`,
    },
    {
      id: "spontaneity",
      score: score("spontaneity"),
      reason: `${voices(name1, name2, weekend?.player1 ?? "свой ответ", weekend?.player2 ?? "свой ответ")} Выходной читается рядом с тем, кто предлагает сорваться: ${helm.headline}`,
    },
    {
      id: "career",
      score: score("career"),
      reason: `${voices(name1, name2, relocation.player1, relocation.player2)} Переезд ради работы — одна сцена решения, не вся карьера этих людей.`,
    },
    {
      id: "future",
      score: score("future"),
      reason: `${voices(name1, name2, futureFamily.player1, futureFamily.player2)} Рядом ценности: ${shared}. Две картинки срока не значат, что взгляды на жизнь противоположны.`,
    },
  ];
}

function verdictFor(hits: number, helmTied: boolean): FriendlyVerdict {
  if (hits >= 16 && helmTied) return "Одна команда";
  if (hits >= 16) return "Сговорились заранее";
  if (hits >= 12 && helmTied) return "Очень на одной волне";
  if (hits >= 12) return "У каждого своя роль";
  if (hits >= 6 && helmTied) return "Похожи больше, чем кажется";
  if (hits >= 6) return "Два разных характера — одна команда";
  if (helmTied) return "Совпали там, где не ожидали";
  return "Дополняете друг друга";
}

export function buildValuesReading(evaluation: Evaluation, name1: string, name2: string): string {
  const { values, helm } = evaluation;
  const shared =
    values.shared.length > 0
      ? `Общее в тройке — «${values.shared.join(", ")}».`
      : "В тройке нет ценности, которую оставили оба.";
  const alone = (name: string, items: string[]) =>
    items.length > 0 ? `${name} отдельно берёт «${items.join(", ")}».` : `${name} отдельно ничего не добавляет.`;
  return `${shared} ${alone(name1, values.onlyPlayer1)} ${alone(name2, values.onlyPlayer2)} Полоски только показывают, у кого это есть. Смысл — рядом с темпом пары: ${helm.headline}`;
}

export function buildDecade(evaluation: Evaluation, name1: string, name2: string): string {
  const { futureFamily, values, money } = evaluation;
  const pictures =
    futureFamily.player1 === futureFamily.player2
      ? `${name1} и ${name2} рисуют один срок: «${futureFamily.player1}».`
      : `${name1} видит «${futureFamily.player1}», ${name2} — «${futureFamily.player2}».`;
  const shared =
    values.shared.length > 0
      ? ` В ценностях при этом остаётся «${values.shared.join(", ")}».`
      : " Общей ценности в тройке нет.";
  const earnings = money.earnings.same
    ? " Заработок смотрит в ту же сторону, что и эта картинка."
    : " Заработок смотрит иначе, чем картинка семьи.";
  return `${pictures}${shared}${earnings} Две картинки десяти лет не делают взгляды противоположными.`;
}

export function buildMirror(evaluation: Evaluation, name1: string, name2: string): CompatibilityReport["mirror"] {
  const { flags, helm } = evaluation;
  const greenHit =
    flags.green.player1.matched && flags.green.player2.matched
      ? "Светлое, которое каждый назвал, совпало с тем, кем человек себя считает."
      : "Светлое, которое видит партнёр, и собственный образ сходятся не целиком.";
  const redHit =
    flags.red.player1.matched && flags.red.player2.matched
      ? "Острое тоже узнали друг в друге."
      : "Острое, которое назвали, человек в себе видит иначе.";
  return {
    green: `${name1} замечает «${flags.green.player1.seesInPartner}», ${name2} — «${flags.green.player2.seesInPartner}». ${greenHit} Рядом с этим ${helm.headline}`,
    red: `${name1} называет «${flags.red.player1.seesInPartner}», ${name2} — «${flags.red.player2.seesInPartner}». ${redHit} Это не список промахов, а черта, которая уже слышна в паре.`,
  };
}

export function buildFallbackReport(context: ReportContext): CompatibilityReport {
  const { couple, evaluation } = context;
  const { player1, player2 } = couple;
  const { reading, helm, money } = evaluation;
  const miss = reading.worstMiss;
  const hits = reading.player1.hits + reading.player2.hits;
  const tied = helm.player1 === helm.player2;
  const roleName = tied ? "Два двигателя" : "Инициатор + Стабилизатор";
  const roleNotes = tied
    ? ["Инициативу в сценах держите вдвоём."]
    : ["Чаще предлагает следующий шаг.", "Держит ритм, когда шаг уже сделан."];
  const insight = `${reading.player1.guesser} угадывает ${reading.player1.target} в ${reading.player1.hits} из ${reading.player1.total}. ${reading.player2.guesser} угадывает ${reading.player2.target} в ${reading.player2.hits} из ${reading.player2.total}. Рядом с этим штурвал: ${helm.headline}.`;
  const paradoxDescription = miss
    ? `${miss.guesser} ждал другой ответ в теме «${miss.title}», чем дал ${miss.chooser}. Рядом штурвал: ${helm.headline}.`
    : `Попадания по вопросам стоят рядом с тем, как сложились сцены: ${helm.headline}. Картина заработка при этом ${money.earnings.same ? "одна на двоих" : "у каждого своя"}.`;

  const finalScene = [
    `${player1.name} и ${player2.name} в обычный день.`,
    `${helm.headline}.`,
    `${reading.player1.guesser} попадает в ${reading.player1.hits} из ${reading.player1.total}.`,
    `${reading.player2.guesser} попадает в ${reading.player2.hits} из ${reading.player2.total}.`,
    miss ? `В теме «${miss.title}» ожидание и ответ не совпали.` : "В приоритетных темах явного промаха нет.",
    money.earnings.same
      ? "Картина заработка смотрит в ту же сторону, что и этот ритм."
      : "Картина заработка смотрит в другую сторону, чем штурвал.",
  ].join("\n");

  return {
    verdict: verdictFor(hits, tied),
    roleName,
    roleNotes,
    insight,
    paradox: { title: "Неожиданная комбинация", description: paradoxDescription },
    discussQuestion: DISCUSSION_QUESTION[evaluation.discussionTopic],
    finalScene,
    xray: buildXray(evaluation, player1.name, player2.name),
    valuesReading: buildValuesReading(evaluation, player1.name, player2.name),
    decade: buildDecade(evaluation, player1.name, player2.name),
    mirror: buildMirror(evaluation, player1.name, player2.name),
  };
}
