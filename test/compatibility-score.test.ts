import { describe, expect, it } from "vitest";

import { evaluateCompatibility, PREDICTION_QUESTION_IDS } from "@/entities/compatibility";
import type { PlayerAnswer } from "@/entities/question";

const WHO = [
  "writes-first",
  "order-food",
  "suggest-trip",
  "decides",
  "changes-mind",
  "watches-money",
  "forgets-date",
  "needs-talk",
];

function choice(id: string, value: string, prediction = value): PlayerAnswer {
  return { questionId: id, answer: value, prediction };
}

function whoLeads(mark: "self" | "partner" | "even"): PlayerAnswer {
  return { questionId: "who-leads", answer: WHO.map((id) => `${id}:${mark}`) };
}

function aligned(player: 1 | 2): PlayerAnswer[] {
  const lead = player === 1 ? "self" : "partner";
  return [
    choice("perfect-weekend", "home"),
    choice("surprise-money", "save"),
    choice("after-conflict", "joke"),
    choice("green-flag", "kindness"),
    choice("red-flag", "work"),
    choice("household-fight", "money"),
    whoLeads(lead),
    choice("relocation", "together"),
    choice("earnings-future", "equal"),
    choice("family-future", "home"),
    { questionId: "future-values", answer: ["family", "freedom", "calm"] },
    choice("never-forgive", "lie"),
    { questionId: "typical-scene", answer: "stay-home" },
    { questionId: "couple-sentence", answer: "Спорим полчаса и заказываем еду" },
  ];
}

describe("evaluateCompatibility", () => {
  const names = { player1Name: "Дима", player2Name: "Настя" };

  it("locks prediction questions to the ten ids", () => {
    expect([...PREDICTION_QUESTION_IDS]).toEqual([
      "perfect-weekend",
      "surprise-money",
      "after-conflict",
      "green-flag",
      "red-flag",
      "household-fight",
      "relocation",
      "earnings-future",
      "family-future",
      "never-forgive",
    ]);
  });

  it("separates a full answer match from prediction hits", () => {
    const matched = evaluateCompatibility({ ...names, player1: aligned(1), player2: aligned(2) });
    expect(matched.scoring.total).toBe(100);
    expect(matched.reading.player1.hits).toBe(10);
    expect(matched.reading.player2.hits).toBe(10);
    expect(matched.reading.player1.total).toBe(10);
    expect(matched.helm.player1).toBe(8);
    expect(matched.helm.player2).toBe(0);
    expect(matched.values.overlap).toBe(3);
    expect(matched.helm.headline).toContain("Дима");
    expect(matched.helm.headline).toContain("чаще берёт инициативу");
    expect(matched.domains.every((domain) => domain.score === 1)).toBe(true);

    const missed = aligned(1).map((item) => (item.prediction !== undefined ? { ...item, prediction: "nope" } : item));
    const blind = evaluateCompatibility({ ...names, player1: missed, player2: aligned(2) });
    expect(blind.scoring.total).toBe(100);
    expect(blind.reading.player1.hits).toBe(0);
    expect(blind.reading.player2.hits).toBe(10);
  });

  it("gives a helm point only when both people point at the same person", () => {
    const player1 = aligned(1).map((item) => (item.questionId === "who-leads" ? whoLeads("self") : item));
    const split = evaluateCompatibility({
      ...names,
      player1,
      player2: aligned(2).map((item) => (item.questionId === "who-leads" ? whoLeads("self") : item)),
    });
    expect(split.helm.player1).toBe(0);
    expect(split.helm.player2).toBe(0);
    expect(split.helm.disputes).toBe(8);
    expect(split.helm.scenes.every((scene) => scene.outcome === "split")).toBe(true);
    expect(split.helm.headline).toBe("Демократия с элементами спора");

    const even = evaluateCompatibility({
      ...names,
      player1: aligned(1).map((item) => (item.questionId === "who-leads" ? whoLeads("even") : item)),
      player2: aligned(2),
    });
    expect(even.helm.player1).toBe(0);
    expect(even.helm.player2).toBe(0);
    expect(even.helm.disputes).toBe(0);
    expect(even.helm.headline).toBe("Делите штурвал");
    expect(even.helm.scenes.every((scene) => scene.outcome === "even")).toBe(true);
  });

  it("treats earnings as the same picture only when both point at one person", () => {
    const base1 = aligned(1).map((item) =>
      item.questionId === "earnings-future" ? choice("earnings-future", "partner", "self") : item,
    );
    const base2 = aligned(2).map((item) =>
      item.questionId === "earnings-future" ? choice("earnings-future", "self", "partner") : item,
    );
    const agreed = evaluateCompatibility({ ...names, player1: base1, player2: base2 });
    expect(agreed.money.earnings.same).toBe(true);
    expect(agreed.money.earnings.player1).toBe("Настя");
    expect(agreed.money.earnings.player2).toBe("Настя");

    const clash = evaluateCompatibility({
      ...names,
      player1: aligned(1).map((item) =>
        item.questionId === "earnings-future" ? choice("earnings-future", "self") : item,
      ),
      player2: aligned(2).map((item) =>
        item.questionId === "earnings-future" ? choice("earnings-future", "self") : item,
      ),
    });
    expect(clash.money.earnings.same).toBe(false);
  });

  it("picks the discussion topic by the first real divergence", () => {
    const familyClash = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "family-future" ? choice("family-future", "travel", "home") : item,
      ),
    });
    expect(familyClash.discussionTopic).toBe("family");

    const valuesClash = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "future-values" ? { ...item, answer: ["money", "career", "travel"] } : item,
      ),
    });
    expect(valuesClash.values.overlap).toBe(0);
    expect(valuesClash.discussionTopic).toBe("values");

    const oneShared = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "future-values" ? { ...item, answer: ["family", "career", "travel"] } : item,
      ),
    });
    expect(oneShared.values.overlap).toBe(1);
    expect(oneShared.discussionTopic).toBe("values");

    const twoShared = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "future-values" ? { ...item, answer: ["family", "freedom", "travel"] } : item,
      ),
    });
    expect(twoShared.values.overlap).toBe(2);
    expect(twoShared.discussionTopic).toBe("household-fight");
  });

  it("ranks a red-flag miss above a later miss and a later hit", () => {
    const player1 = aligned(1).map((item) => {
      if (item.questionId === "red-flag") return choice("red-flag", "work", "lazy");
      if (item.questionId === "never-forgive") return choice("never-forgive", "lie", "phone");
      return item;
    });
    const player2 = aligned(2).map((item) => {
      if (item.questionId === "red-flag") return choice("red-flag", "stubborn", "grudge");
      if (item.questionId === "never-forgive") return choice("never-forgive", "phone", "ignore");
      return item;
    });
    const ranked = evaluateCompatibility({ ...names, player1, player2 });
    expect(ranked.reading.worstMiss?.questionId).toBe("red-flag");
    expect(ranked.reading.bestHit?.questionId).toBe("relocation");
    expect(ranked.reading.misses.some((item) => item.questionId === "never-forgive")).toBe(true);
  });

  it("compares self-image with what the partner actually names", () => {
    const seen = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "green-flag" ? choice("green-flag", "humor", "kindness") : item,
      ),
    });
    expect(seen.flags.green.player1.matched).toBe(false);
    expect(seen.flags.green.player1.selfImage).toBe("Доброта");
    expect(seen.flags.green.player2.seesInPartner).toBe("Чувство юмора");
    expect(seen.flags.green.player2.matched).toBe(true);
    expect(seen.flags.red.player1.matched).toBe(true);
  });

  it("locks domain formulas and their source questions", () => {
    const matched = evaluateCompatibility({ ...names, player1: aligned(1), player2: aligned(2) });
    const byId = Object.fromEntries(matched.domains.map((domain) => [domain.id, domain]));
    expect(byId.relationships?.questionIds).toEqual(["after-conflict"]);
    expect(byId.household?.questionIds).toEqual(["household-fight"]);
    expect(byId.spontaneity?.questionIds).toEqual(["perfect-weekend"]);
    expect(byId.career?.questionIds).toEqual(["relocation"]);
    expect(byId.money?.questionIds).toEqual(["surprise-money", "earnings-future", "future-values"]);
    expect(byId.future?.questionIds).toEqual(["family-future", "future-values"]);

    const moneyBit = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "future-values" ? { ...item, answer: ["money", "career", "travel"] } : item,
      ),
    });
    expect(moneyBit.domains.find((domain) => domain.id === "money")?.score).toBeCloseTo(2 / 3);
    expect(moneyBit.domains.find((domain) => domain.id === "future")?.score).toBeCloseTo(0.5);

    const futureMix = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) => {
        if (item.questionId === "family-future") return choice("family-future", "travel", "home");
        if (item.questionId === "future-values") return { ...item, answer: ["family", "career", "travel"] };
        return item;
      }),
    });
    expect(futureMix.domains.find((domain) => domain.id === "future")?.score).toBeCloseTo((0 + 1 / 3) / 2);
    expect(futureMix.domains.find((domain) => domain.id === "relationships")?.score).toBe(1);

    const fight = evaluateCompatibility({
      ...names,
      player1: aligned(1),
      player2: aligned(2).map((item) =>
        item.questionId === "after-conflict" ? choice("after-conflict", "pause", "joke") : item,
      ),
    });
    expect(fight.domains.find((domain) => domain.id === "relationships")?.score).toBe(0);
  });
});
