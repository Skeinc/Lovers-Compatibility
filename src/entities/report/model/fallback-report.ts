import type { Evaluation } from "@/entities/compatibility/@x/report";
import type { AxisPosition, CompatibilityReport, CoupleAxis } from "@/shared/api";

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

export function buildXray(evaluation: Evaluation): CompatibilityReport["xray"] {
  const byId = new Map(evaluation.domains.map((domain) => [domain.id, domain.score]));
  const score = (id: Evaluation["domains"][number]["id"]) => soften(byId.get(id) ?? 0);

  return [
    {
      id: "relationships",
      score: score("relationships"),
      reason: "Ссора и штурвал читаются вместе, не как один ответ.",
    },
    {
      id: "money",
      score: score("money"),
      reason: "Куш и заработок собраны в одну шкалу, не в край из-за одной траты.",
    },
    {
      id: "household",
      score: score("household"),
      reason: "Это сюжет первой бытовой ссоры, не весь быт.",
    },
    {
      id: "spontaneity",
      score: score("spontaneity"),
      reason: "Выходной стоит рядом с тем, кто предлагает сорваться.",
    },
    {
      id: "career",
      score: score("career"),
      reason: "Переезд — одна сцена решения, не вся карьера.",
    },
    {
      id: "future",
      score: score("future"),
      reason: "Две картинки срока не делают взгляды противоположными.",
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

export function buildMoneyReading(evaluation: Evaluation): string {
  const { money } = evaluation;
  if (!money.surprise.same && money.earnings.same) {
    return "Куш тратите по-разному, но будущего заработка оба ждёте от одного человека.";
  }
  if (money.surprise.same && !money.earnings.same) {
    return "Внезапные деньги видите похоже, а кто будет зарабатывать больше — уже нет.";
  }
  if (money.surprise.same && money.earnings.same) {
    return "И куш, и картина заработка смотрят в одну сторону.";
  }
  return "И куш, и заработок с разным акцентом — два ритма, не разрыв.";
}

export function buildDecade(evaluation: Evaluation): string {
  const { futureFamily, values } = evaluation;
  const shared = values.shared[0];
  if (futureFamily.same && shared) return `Картинка срока одна, и её держит общий центр — «${shared}».`;
  if (futureFamily.same) return "Картинка срока одна, даже если тройка ценностей не совпала целиком.";
  if (shared) return `Будущее рисуете по-разному, но ценностный центр совпадает: «${shared}».`;
  return "Картинки срока разные, и общего центра в тройке нет — это два акцента, не противоположные жизни.";
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

function sideByDiff(left: number, right: number, strong = 2): AxisPosition {
  const delta = left - right;
  if (delta === 0) return "even";
  if (delta >= strong) return "player1";
  if (delta <= -strong) return "player2";
  return delta > 0 ? "lean-player1" : "lean-player2";
}

function named(position: AxisPosition, name1: string, name2: string): string {
  if (position === "player1") return name1;
  if (position === "player2") return name2;
  if (position === "lean-player1") return `Чуть ближе к ${name1}`;
  if (position === "lean-player2") return `Чуть ближе к ${name2}`;
  return "Поровну";
}

function flagLean(leftMatched: boolean, rightMatched: boolean): AxisPosition {
  if (leftMatched === rightMatched) return "even";
  return leftMatched ? "lean-player1" : "lean-player2";
}

function hasAny(text: string, parts: string[]): boolean {
  const lower = text.toLocaleLowerCase("ru");
  return parts.some((part) => lower.includes(part));
}

function valueTilt(ids: string[]): number {
  const adventure = ids.filter((id) => id === "travel" || id === "freedom").length;
  const stability = ids.filter((id) => id === "calm" || id === "stability").length;
  return adventure - stability;
}

export function buildAxes(evaluation: Evaluation, name1: string, name2: string): CoupleAxis[] {
  const { reading, helm, flags, money, values, relocation, futureFamily } = evaluation;
  const evenScenes = helm.scenes.filter((scene) => scene.outcome === "even").length;
  const leader = helm.disputes >= 4 || evenScenes >= 5 ? "even" : sideByDiff(helm.player1, helm.player2, 3);
  const reader = sideByDiff(reading.player1.hits, reading.player2.hits, 2);
  const moveIds = new Set(["writes-first", "order-food", "suggest-trip", "decides", "needs-talk"]);
  const move = helm.scenes.filter((scene) => moveIds.has(scene.id));
  const initiator = sideByDiff(
    move.filter((scene) => scene.outcome === "player1").length,
    move.filter((scene) => scene.outcome === "player2").length,
    2,
  );
  const green = flagLean(flags.green.player1.matched, flags.green.player2.matched);
  const red = flagLean(flags.red.player1.matched, flags.red.player2.matched);

  const tilt = (family: string, moveText: string, ids: string[]) => {
    let score = valueTilt(ids);
    if (hasAny(family, ["путешеств", "активн", "стран"])) score += 1;
    if (hasAny(family, ["дома", "дети"])) score -= 1;
    if (hasAny(moveText, ["сразу", "скорее"])) score += 1;
    if (hasAny(moveText, ["откаж", "думать"])) score -= 1;
    return score;
  };
  const tilt1 = tilt(futureFamily.player1, relocation.player1, values.player1Ids);
  const tilt2 = tilt(futureFamily.player2, relocation.player2, values.player2Ids);
  const adventure = tilt1 === tilt2 ? "even" : sideByDiff(tilt1, tilt2, 2);
  const adventureLabel =
    adventure === "even" ? "Поровну" : Math.max(tilt1, tilt2) <= 0 ? "Больше стабильности" : "Больше приключений";

  let moneyScore1 = 0;
  let moneyScore2 = 0;
  const watch = helm.scenes.find((scene) => scene.id === "watches-money");
  if (watch?.outcome === "player1") moneyScore1 += 1;
  if (watch?.outcome === "player2") moneyScore2 += 1;
  if (money.earnings.player1 === name1) moneyScore1 += 1;
  if (money.earnings.player1 === name2) moneyScore2 += 1;
  if (money.earnings.player2 === name1) moneyScore1 += 1;
  if (money.earnings.player2 === name2) moneyScore2 += 1;
  if (values.player1Ids.includes("money")) moneyScore1 += 1;
  if (values.player2Ids.includes("money")) moneyScore2 += 1;
  const moneySide = sideByDiff(moneyScore1, moneyScore2, 3);
  const moneyLabel =
    moneySide === "even"
      ? "Баланс и свобода"
      : moneySide.endsWith("player1")
        ? `Финансовый двигатель: ${name1}`
        : `Финансовый двигатель: ${name2}`;

  const future = futureFamily.same && relocation.same ? "even" : leader === "even" ? "even" : leader;

  const axis = (id: CoupleAxis["id"], position: AxisPosition, label: string, explanation: string): CoupleAxis => ({
    id,
    position,
    label,
    explanation,
  });

  return [
    axis(
      "green-flag",
      green,
      green === "even" ? "Приз делите" : named(green, name1, name2),
      green === "even"
        ? "Светлое, которое видит партнёр, не даёт явного перевеса."
        : "Светлую черту партнёр узнаёт в одном человеке яснее, чем в другом.",
    ),
    axis(
      "red-flag",
      red,
      red === "even" ? "Без явного приза" : named(red, name1, name2),
      red === "even"
        ? "Игровой red flag здесь не закреплён за одним человеком."
        : "Этот игровой приз сегодня чуть ярче на одной стороне.",
    ),
    axis(
      "leader",
      leader,
      leader === "even" ? "Штурвал делите" : named(leader, name1, name2),
      leader === "even"
        ? "В сценах нет устойчивого перевеса, кому чаще отдаёте инициативу."
        : "Штурвал в сценах чаще остаётся на одной стороне.",
    ),
    axis(
      "mind-reader",
      reader,
      reader === "even" ? "Читаете почти одинаково" : named(reader, name1, name2),
      reader === "even"
        ? "Точность чтения друг друга почти не расходится."
        : "Попадания и промахи дают лёгкий перевес в чтении другого.",
    ),
    axis(
      "initiator",
      initiator,
      initiator === "even" ? "Движение общее" : named(initiator, name1, name2),
      initiator === "even"
        ? "Сцены движения не закрепляют одного инициатора."
        : "В сценах движения шаг чаще исходит с одной стороны.",
    ),
    axis(
      "stability-adventure",
      adventure,
      adventureLabel,
      adventure === "even"
        ? "Стабильность и движение в ответах держатся рядом."
        : "Картинка выходного, переезда и ценностей чуть смещает пару к одной стороне.",
    ),
    axis(
      "money",
      moneySide,
      moneyLabel,
      moneySide === "even"
        ? "Куш, заработок и ценность денег не складываются в одного человека."
        : "Заработок, сцены про деньги и ценность денег смотрят в одну сторону.",
    ),
    axis(
      "future",
      future,
      future === "even" ? "Образ общий" : named(future, name1, name2),
      future === "even"
        ? "В этих ответах явного автора будущей картинки нет."
        : "Штурвал и картинка срока слегка сходятся на одной стороне.",
    ),
  ];
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
  const insight = `${helm.headline} ${reading.player1.guesser} читает ${reading.player1.target} в ${reading.player1.hits} из ${reading.player1.total}, обратно — ${reading.player2.hits} из ${reading.player2.total}.`;
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
    xray: buildXray(evaluation),
    decade: buildDecade(evaluation),
    moneyReading: buildMoneyReading(evaluation),
    mirror: buildMirror(evaluation, player1.name, player2.name),
    axes: buildAxes(evaluation, player1.name, player2.name),
  };
}
