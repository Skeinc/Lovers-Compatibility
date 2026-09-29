import {
  decodeWho,
  getQuestion,
  optionLabel,
  type AnswerValue,
  type PlayerAnswer,
  type WhoChoice,
} from "@/entities/question/@x/compatibility";

import { exactMatch } from "./compare";
import {
  PREDICTION_QUESTION_IDS,
  type DiscussionTopic,
  type DomainInsight,
  type Evaluation,
  type EvaluationInput,
  type FlagMirror,
  type GuessMoment,
  type NamedChoice,
  type RoleScene,
  type ValueOverlap,
} from "./types";

const SPOTLIGHT = [
  "red-flag",
  "relocation",
  "perfect-weekend",
  "surprise-money",
  "household-fight",
  "after-conflict",
  "earnings-future",
  "family-future",
  "green-flag",
  "never-forgive",
] as const;

const CLOSED_MATCH_IDS = [
  "perfect-weekend",
  "surprise-money",
  "after-conflict",
  "household-fight",
  "relocation",
  "family-future",
  "never-forgive",
  "typical-scene",
] as const;

function answerOf(answers: PlayerAnswer[], questionId: string): PlayerAnswer | undefined {
  return answers.find((item) => item.questionId === questionId);
}

function field(answers: PlayerAnswer[], questionId: string, key: "answer" | "prediction"): AnswerValue | undefined {
  return answerOf(answers, questionId)?.[key];
}

function textOf(value: AnswerValue | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function labelOf(questionId: string, value: AnswerValue | undefined): string {
  const question = getQuestion(questionId);
  if (!question || typeof value !== "string" || value === "") return "";
  return optionLabel(question, value);
}

function idsOf(value: AnswerValue | undefined): string[] {
  return Array.isArray(value) ? value.filter((item) => item !== "") : [];
}

function labelsOf(questionId: string, value: AnswerValue | undefined): string[] {
  const question = getQuestion(questionId);
  if (!question) return [];
  return idsOf(value).map((id) => optionLabel(question, id));
}

type Earner = "player1" | "player2" | "equal" | "unsure";

function earnerPicture(player: 1 | 2, value: AnswerValue | undefined): Earner | null {
  if (value === "equal") return "equal";
  if (value === "unsure") return "unsure";
  if (value === "self") return player === 1 ? "player1" : "player2";
  if (value === "partner") return player === 1 ? "player2" : "player1";
  return null;
}

function earnerLabel(playerName: string, partnerName: string, value: AnswerValue | undefined): string {
  if (value === "self") return playerName;
  if (value === "partner") return partnerName;
  if (value === "equal") return "Примерно одинаково";
  if (value === "unsure") return "Сложно сказать";
  return "";
}

function overlapOf(left: string[], right: string[]): ValueOverlap {
  const rightSet = new Set(right);
  let count = 0;
  for (const item of new Set(left)) {
    if (rightSet.has(item)) count += 1;
  }
  if (count >= 3) return 3;
  if (count === 2) return 2;
  if (count === 1) return 1;
  return 0;
}

function pointTarget(player: 1 | 2, choice: WhoChoice): "player1" | "player2" | "even" {
  if (choice === "even") return "even";
  if (choice === "self") return player === 1 ? "player1" : "player2";
  return player === 1 ? "player2" : "player1";
}

function helmHeadline(
  player1Name: string,
  player2Name: string,
  player1: number,
  player2: number,
  disputes: number,
): string {
  if (player1 === player2) return disputes > 0 ? "Демократия с элементами спора" : "Делите штурвал";
  const leader = player1 > player2 ? player1Name : player2Name;
  return `${leader} чаще берёт инициативу`;
}

export function evaluateCompatibility(input: EvaluationInput): Evaluation {
  const { player1, player2, player1Name, player2Name } = input;
  const total = PREDICTION_QUESTION_IDS.length;

  function hitsFrom(guesser: PlayerAnswer[], target: PlayerAnswer[]): number {
    return PREDICTION_QUESTION_IDS.filter((id) => {
      const predicted = textOf(field(guesser, id, "prediction"));
      const actual = textOf(field(target, id, "answer"));
      return predicted !== "" && predicted === actual;
    }).length;
  }

  function moment(questionId: string, direction: 1 | 2): GuessMoment | null {
    const question = getQuestion(questionId);
    const guesser = direction === 1 ? player1 : player2;
    const chooser = direction === 1 ? player2 : player1;
    const expected = labelOf(questionId, field(guesser, questionId, "prediction"));
    const chosen = labelOf(questionId, field(chooser, questionId, "answer"));
    if (!question || expected === "" || chosen === "") return null;
    return {
      questionId,
      title: question.title,
      guesser: direction === 1 ? player1Name : player2Name,
      expected,
      chooser: direction === 1 ? player2Name : player1Name,
      chosen,
    };
  }

  function guessed(questionId: string, direction: 1 | 2): boolean {
    const guesserAnswers = direction === 1 ? player1 : player2;
    const chooserAnswers = direction === 1 ? player2 : player1;
    const predicted = textOf(field(guesserAnswers, questionId, "prediction"));
    const actual = textOf(field(chooserAnswers, questionId, "answer"));
    return predicted !== "" && predicted === actual;
  }

  function spotlight(kind: "hit" | "miss"): GuessMoment | null {
    for (const id of SPOTLIGHT) {
      const first = guessed(id, 1);
      const second = guessed(id, 2);
      const directions: Array<1 | 2> = [1, 2];
      for (const direction of directions) {
        const matched = direction === 1 ? first : second;
        if (kind === "hit" ? matched : !matched) {
          const found = moment(id, direction);
          if (found) return found;
        }
      }
    }
    return null;
  }

  function calls(hit: boolean): GuessMoment[] {
    const found: GuessMoment[] = [];
    for (const id of PREDICTION_QUESTION_IDS) {
      const directions = [1, 2] as const;
      for (const direction of directions) {
        if (guessed(id, direction) !== hit) continue;
        const item = moment(id, direction);
        if (item) found.push(item);
      }
    }
    return found;
  }

  function flagMirror(id: "green-flag" | "red-flag", title: string): FlagMirror {
    const player1Self = textOf(field(player1, id, "prediction"));
    const player2Self = textOf(field(player2, id, "prediction"));
    const player1Sees = textOf(field(player1, id, "answer"));
    const player2Sees = textOf(field(player2, id, "answer"));
    return {
      id,
      title,
      player1: {
        selfImage: labelOf(id, player1Self),
        seesInPartner: labelOf(id, player1Sees),
        matched: player1Self !== "" && player1Self === player2Sees,
      },
      player2: {
        selfImage: labelOf(id, player2Self),
        seesInPartner: labelOf(id, player2Sees),
        matched: player2Self !== "" && player2Self === player1Sees,
      },
    };
  }

  const earningsSame =
    earnerPicture(1, field(player1, "earnings-future", "answer")) !== null &&
    earnerPicture(1, field(player1, "earnings-future", "answer")) ===
      earnerPicture(2, field(player2, "earnings-future", "answer"));

  const closedHits =
    CLOSED_MATCH_IDS.filter((id) => exactMatch(field(player1, id, "answer"), field(player2, id, "answer"))).length +
    Number(earningsSame);

  const valueIds1 = idsOf(field(player1, "future-values", "answer"));
  const valueIds2 = idsOf(field(player2, "future-values", "answer"));
  const overlap = overlapOf(valueIds1, valueIds2);
  const sharedIds = valueIds1.filter((id) => valueIds2.includes(id));

  const who = getQuestion("who-leads");
  const leftWho = decodeWho(field(player1, "who-leads", "answer"));
  const rightWho = decodeWho(field(player2, "who-leads", "answer"));
  let player1Points = 0;
  let player2Points = 0;
  const scenes: RoleScene[] = (who?.scenarios ?? []).map((scenario) => {
    const left = leftWho.get(scenario.id);
    const right = rightWho.get(scenario.id);
    let outcome: RoleScene["outcome"] = "split";
    if (left && right && left !== "even" && right !== "even") {
      const pointedLeft = pointTarget(1, left);
      const pointedRight = pointTarget(2, right);
      if (pointedLeft === pointedRight && pointedLeft !== "even") outcome = pointedLeft;
    } else if (left === "even" || right === "even") {
      outcome = "even";
    }
    if (outcome === "player1") player1Points += 1;
    if (outcome === "player2") player2Points += 1;
    const label =
      outcome === "player1"
        ? player1Name
        : outcome === "player2"
          ? player2Name
          : outcome === "even"
            ? "Поровну"
            : "По-разному";
    return { id: scenario.id, title: scenario.prompt, outcome, label };
  });

  const disputes = scenes.filter((scene) => scene.outcome === "split").length;
  const agreedScenes = player1Points + player2Points;
  const agreementPercent = Math.max(
    0,
    Math.min(100, Math.round((closedHits / 9) * 70 + (overlap / 3) * 15 + (agreedScenes / 8) * 15)),
  );

  function named(questionId: string, same: boolean, player1Text: string, player2Text: string): NamedChoice {
    return { title: getQuestion(questionId)?.title ?? questionId, player1: player1Text, player2: player2Text, same };
  }

  const surpriseSame = exactMatch(
    field(player1, "surprise-money", "answer"),
    field(player2, "surprise-money", "answer"),
  );
  const relocationSame = exactMatch(field(player1, "relocation", "answer"), field(player2, "relocation", "answer"));
  const familySame = exactMatch(field(player1, "family-future", "answer"), field(player2, "family-future", "answer"));
  const fightSame = exactMatch(field(player1, "after-conflict", "answer"), field(player2, "after-conflict", "answer"));
  const householdSame = exactMatch(
    field(player1, "household-fight", "answer"),
    field(player2, "household-fight", "answer"),
  );
  const weekendSame = exactMatch(
    field(player1, "perfect-weekend", "answer"),
    field(player2, "perfect-weekend", "answer"),
  );

  const moneyValueMatch = valueIds1.includes("money") === valueIds2.includes("money") ? 1 : 0;
  const onlyIds1 = valueIds1.filter((id) => !valueIds2.includes(id));
  const onlyIds2 = valueIds2.filter((id) => !valueIds1.includes(id));

  const domains: DomainInsight[] = [
    { id: "relationships", label: "Отношения", score: fightSame ? 1 : 0, questionIds: ["after-conflict"] },
    {
      id: "money",
      label: "Деньги",
      score: (Number(surpriseSame) + Number(earningsSame) + moneyValueMatch) / 3,
      questionIds: ["surprise-money", "earnings-future", "future-values"],
    },
    { id: "household", label: "Быт", score: householdSame ? 1 : 0, questionIds: ["household-fight"] },
    { id: "spontaneity", label: "Спонтанность", score: weekendSame ? 1 : 0, questionIds: ["perfect-weekend"] },
    { id: "career", label: "Карьера", score: relocationSame ? 1 : 0, questionIds: ["relocation"] },
    {
      id: "future",
      label: "Будущее",
      score: (Number(familySame) + overlap / 3) / 2,
      questionIds: ["family-future", "future-values"],
    },
  ];

  let discussionTopic: DiscussionTopic = "household-fight";
  if (!familySame) discussionTopic = "family";
  else if (!relocationSame) discussionTopic = "relocation";
  else if (!earningsSame) discussionTopic = "earnings";
  else if (overlap <= 1) discussionTopic = "values";
  else if (!guessed("red-flag", 1) || !guessed("red-flag", 2)) discussionTopic = "red-flag";
  else if (!householdSame) discussionTopic = "household-fight";

  return {
    scoring: { total: agreementPercent },
    reading: {
      player1: { guesser: player1Name, target: player2Name, hits: hitsFrom(player1, player2), total },
      player2: { guesser: player2Name, target: player1Name, hits: hitsFrom(player2, player1), total },
      hits: calls(true),
      misses: calls(false),
      bestHit: spotlight("hit"),
      worstMiss: spotlight("miss"),
    },
    flags: {
      green: flagMirror("green-flag", "Green flag"),
      red: flagMirror("red-flag", "Red flag"),
    },
    helm: {
      player1: player1Points,
      player2: player2Points,
      disputes,
      headline: helmHeadline(player1Name, player2Name, player1Points, player2Points, disputes),
      scenes,
    },
    domains,
    values: {
      overlap,
      shared: labelsOf("future-values", sharedIds),
      sharedIds,
      onlyPlayer1: labelsOf("future-values", onlyIds1),
      onlyPlayer2: labelsOf("future-values", onlyIds2),
      player1: labelsOf("future-values", valueIds1),
      player2: labelsOf("future-values", valueIds2),
      player1Ids: valueIds1,
      player2Ids: valueIds2,
    },
    discussionTopic,
    choices: [
      ...CLOSED_MATCH_IDS.map((id) =>
        named(
          id,
          exactMatch(field(player1, id, "answer"), field(player2, id, "answer")),
          labelOf(id, field(player1, id, "answer")),
          labelOf(id, field(player2, id, "answer")),
        ),
      ),
      named(
        "green-flag",
        labelOf("green-flag", field(player1, "green-flag", "answer")) !== "" &&
          labelOf("green-flag", field(player1, "green-flag", "answer")) ===
            labelOf("green-flag", field(player2, "green-flag", "answer")),
        labelOf("green-flag", field(player1, "green-flag", "answer")),
        labelOf("green-flag", field(player2, "green-flag", "answer")),
      ),
      named(
        "red-flag",
        labelOf("red-flag", field(player1, "red-flag", "answer")) ===
          labelOf("red-flag", field(player2, "red-flag", "answer")) &&
          labelOf("red-flag", field(player1, "red-flag", "answer")) !== "",
        labelOf("red-flag", field(player1, "red-flag", "answer")),
        labelOf("red-flag", field(player2, "red-flag", "answer")),
      ),
    ],
    money: {
      surprise: named(
        "surprise-money",
        surpriseSame,
        labelOf("surprise-money", field(player1, "surprise-money", "answer")),
        labelOf("surprise-money", field(player2, "surprise-money", "answer")),
      ),
      earnings: named(
        "earnings-future",
        earningsSame,
        earnerLabel(player1Name, player2Name, field(player1, "earnings-future", "answer")),
        earnerLabel(player2Name, player1Name, field(player2, "earnings-future", "answer")),
      ),
    },
    relocation: named(
      "relocation",
      relocationSame,
      labelOf("relocation", field(player1, "relocation", "answer")),
      labelOf("relocation", field(player2, "relocation", "answer")),
    ),
    futureFamily: named(
      "family-future",
      familySame,
      labelOf("family-future", field(player1, "family-future", "answer")),
      labelOf("family-future", field(player2, "family-future", "answer")),
    ),
    sentences: {
      player1: textOf(field(player1, "couple-sentence", "answer")),
      player2: textOf(field(player2, "couple-sentence", "answer")),
    },
  };
}
