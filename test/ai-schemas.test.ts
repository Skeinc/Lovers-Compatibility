import { describe, expect, it } from "vitest";

import { evaluateCompatibility } from "@/entities/compatibility";
import { buildAnalysisInput, buildFallbackReport, friendlyVerdicts } from "@/entities/report";
import type { PlayerAnswer } from "@/entities/question";
import { aiNarrativeSchema, compatibilityReportSchema } from "@/shared/api";

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

const couple = {
  player1: { name: "Дима", age: 28 },
  player2: { name: "Настя", age: 27 },
  relationshipDuration: "1-2y" as const,
  howMet: "friends" as const,
  goals: ["travel" as const],
};

describe("aiNarrativeSchema", () => {
  it("rejects a payload without the required narrative", () => {
    const parsed = aiNarrativeSchema.safeParse({ insight: "коротко" });
    expect(parsed.success).toBe(false);
  });

  it("rejects a paradox written as a single string", () => {
    const parsed = aiNarrativeSchema.safeParse({
      verdict: "Одна команда",
      roleName: "Два двигателя",
      insight: "Два факта рядом.",
      paradox: "Просто строка",
      discussQuestion: "Кто зарабатывает больше через десять лет?",
      finalScene: "Обычный день.",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the new narrative and drops a smuggled score", () => {
    const parsed = aiNarrativeSchema.safeParse({
      agreementPercent: 99,
      score: 79,
      verdict: "Сговорились заранее",
      roleName: "Инициатор + Стабилизатор",
      insight: "Угадывание и штурвал смотрят в одну сторону, а переезд стоит отдельно.",
      paradox: {
        title: "Неожиданная комбинация",
        description: "Выходной про дом стоит рядом с тем, как разошлись внезапные деньги.",
      },
      discussQuestion: "Работа мечты в другом городе: вы едете вместе или каждый решает сам?",
      finalScene: "Обычный вечер.\nОдин уже смотрит в карту.\nРазговор уходит к деньгам.\nИдея отпуска возникает сама.",
      xray: [
        { id: "relationships", score: 0.62, reason: "Мириться они готовы по-разному, но инициативу делят." },
        {
          id: "money",
          score: 0.48,
          reason: "Трата и заработок смотрят в разные стороны, ценность денег при этом общая.",
        },
        { id: "household", score: 0.4, reason: "Бытовая ссора у каждого своя, это не весь быт." },
        { id: "spontaneity", score: 0.55, reason: "Выходной дома стоит рядом с тем, кто предлагает сорваться." },
        { id: "career", score: 0.44, reason: "Переезд — одна сцена решения, не вся карьера." },
        { id: "future", score: 0.58, reason: "Семья и путешествие — две картинки срока, не противоположные жизни." },
      ],
      valuesReading: "Общая семья держит пару, а проект и спокойствие каждый берёт сам.",
      decade: "Карьера и дом — две картинки одного срока, не противоположные жизни.",
      mirror: {
        green: "Доброту замечают оба, и она стыкуется с тем, как они держат темп.",
        red: "Забывчивость уже слышна в паре, это не приговор характеру.",
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("agreementPercent" in parsed.data).toBe(false);
      expect("score" in parsed.data).toBe(false);
      expect(parsed.data.verdict).toBe("Сговорились заранее");
    }
  });
});

describe("analysis context and fallback", () => {
  it("sends derived facts and leaves the raw answers out", () => {
    const evaluation = evaluateCompatibility({
      player1Name: "Дима",
      player2Name: "Настя",
      player1: aligned(1),
      player2: aligned(2),
    });
    const input = buildAnalysisInput({ couple, player1: aligned(1), player2: aligned(2), evaluation });
    const payload = JSON.stringify(input);
    expect(payload).not.toContain("agreementPercent");
    expect(payload).not.toContain("Спорим полчаса");
    expect(payload).not.toContain("player1Answers");
    expect(input.domains.find((domain) => domain.id === "money")?.questionIds).toEqual([
      "surprise-money",
      "earnings-future",
      "future-values",
    ]);
    expect(input.reading.player1to2).toContain("10/10");
    expect(input.helm.player1Points).toBe(8);
  });

  it("builds a fallback from two facts without restating the questionnaire", () => {
    const same = evaluateCompatibility({
      player1Name: "Дима",
      player2Name: "Настя",
      player1: aligned(1),
      player2: aligned(2),
    });
    const matched = buildFallbackReport({ couple, player1: aligned(1), player2: aligned(2), evaluation: same });
    expect(friendlyVerdicts()).toContain(matched.verdict);
    expect(matched.insight).toContain("10 из 10");
    expect(matched.insight).toContain(same.helm.headline);
    expect(matched.insight.toLowerCase()).not.toContain("вы оба выбрали");
    expect(matched.paradox.description.toLowerCase()).not.toContain("вы оба выбрали");
    expect(matched.paradox.description).toContain(same.helm.headline);
    expect(matched.finalScene.split("\n").length).toBeGreaterThanOrEqual(5);
    expect(compatibilityReportSchema.safeParse(matched).success).toBe(true);
    expect(matched.xray.find((item) => item.id === "future")?.score).toBeGreaterThan(0);
    expect(matched.xray.find((item) => item.id === "future")?.reason).toContain("ценности");
    expect(matched.decade.toLowerCase()).not.toContain("вы оба выбрали");
    expect(matched.valuesReading.length).toBeGreaterThan(20);

    const apart = evaluateCompatibility({
      player1Name: "Дима",
      player2Name: "Настя",
      player1: aligned(1),
      player2: aligned(1).map((item) => {
        if (item.questionId === "perfect-weekend") return choice("perfect-weekend", "city", "home");
        if (item.questionId === "surprise-money") return choice("surprise-money", "travel", "save");
        if (item.questionId === "after-conflict") return choice("after-conflict", "pause", "joke");
        if (item.questionId === "green-flag") return choice("green-flag", "humor", "kindness");
        if (item.questionId === "red-flag") return choice("red-flag", "stubborn", "work");
        if (item.questionId === "household-fight") return choice("household-fight", "cleaning", "money");
        if (item.questionId === "who-leads") return whoLeads("self");
        if (item.questionId === "relocation") return choice("relocation", "no", "together");
        if (item.questionId === "earnings-future") return choice("earnings-future", "self", "equal");
        if (item.questionId === "family-future") return choice("family-future", "travel", "home");
        if (item.questionId === "future-values") return { ...item, answer: ["money", "career", "travel"] };
        if (item.questionId === "never-forgive") return choice("never-forgive", "phone", "lie");
        if (item.questionId === "typical-scene") return { ...item, answer: "where" };
        return item;
      }),
    });
    const distant = buildFallbackReport({
      couple,
      player1: aligned(1),
      player2: aligned(1),
      evaluation: apart,
    });
    expect(friendlyVerdicts()).toContain(distant.verdict);
    expect(distant.verdict.toLowerCase()).not.toMatch(/плох|провал|несовмест/);
    expect(distant.insight.toLowerCase()).not.toContain("вы оба выбрали");
  });
});
