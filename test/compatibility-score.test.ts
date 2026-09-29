import { describe, expect, it } from "vitest";

import { evaluateCompatibility } from "@/entities/compatibility";
import type { PlayerAnswer } from "@/entities/question";

function choice(id: string, value: string, prediction = value): PlayerAnswer {
  return { questionId: id, answer: value, prediction };
}

function agree(player: 1 | 2): string[] {
  return ["delivery", "impulse", "trip", "lost", "makeup", "room"].map((id) =>
    player === 1 ? `${id}:self` : `${id}:partner`,
  );
}

function aligned(player: 1 | 2): PlayerAnswer[] {
  return [
    choice("perfect-weekend", "home"),
    choice("surprise-money", "save"),
    choice("after-conflict", "joke"),
    choice("ideal-date", "dinner"),
    { questionId: "future-irritation", answer: ["mess", "phone"], prediction: ["phone", "mess"] },
    choice("extra-hours", "rather-no"),
    choice("lost-in-city", "cafe"),
    { questionId: "free-year", answer: "год у моря без планов" },
    { questionId: "favorite-trait", answer: "смеётся первым" },
    { questionId: "annoying-habit", answer: "напевает в ванной" },
    { questionId: "who-is-more-likely", answer: agree(player) },
    { questionId: "three-words", answer: "тепло смех дом", prediction: "тепло смех дом" },
  ];
}

describe("evaluateCompatibility", () => {
  const names = { player1Name: "Дима", player2Name: "Настя" };

  it("is deterministic and reaches 100 when the answers match", () => {
    const input = { ...names, player1: aligned(1), player2: aligned(2) };
    const first = evaluateCompatibility(input);
    const second = evaluateCompatibility(input);
    expect(first.scoring).toEqual(second.scoring);
    expect(first.scoring.total).toBe(100);
    expect(first.scoring.label).toBe("Почти один ритм");
    expect(first.likelyTo).toHaveLength(6);
    expect(first.likelyTo.every((item) => item.person === "Дима")).toBe(true);
  });

  it("does not assign a person when players point at different people", () => {
    const player1 = aligned(1).map((item) =>
      item.questionId === "who-is-more-likely" ? { ...item, answer: ["delivery:self"] } : item,
    );
    const player2 = aligned(2).map((item) =>
      item.questionId === "who-is-more-likely" ? { ...item, answer: ["delivery:self"] } : item,
    );
    const result = evaluateCompatibility({ ...names, player1, player2 });
    expect(result.likelyTo.find((item) => item.title.includes("доставку"))).toBeUndefined();
  });

  it("scores a full mismatch below a full match", () => {
    const sheet = (side: "left" | "right"): PlayerAnswer[] => [
      choice("perfect-weekend", side === "left" ? "home" : "trip", "city"),
      choice("surprise-money", side === "left" ? "save" : "spent", "travel"),
      choice("after-conflict", side === "left" ? "joke" : "space", "talk"),
      choice("ideal-date", side === "left" ? "dinner" : "active", "walk"),
      {
        questionId: "future-irritation",
        answer: side === "left" ? ["mess"] : ["music"],
        prediction: ["late"],
      },
      choice("extra-hours", side === "left" ? "rather-no" : "definitely-yes", "depends"),
      choice("lost-in-city", side === "left" ? "cafe" : "blame", "argue"),
      { questionId: "free-year", answer: side === "left" ? "год у моря" : "ремонт кухни отчёты" },
      { questionId: "favorite-trait", answer: "смех" },
      { questionId: "annoying-habit", answer: "носок на люстре" },
      {
        questionId: "who-is-more-likely",
        answer: side === "left" ? ["delivery:self"] : ["delivery:self"],
      },
      {
        questionId: "three-words",
        answer: side === "left" ? "тепло смех дом" : "хаос споры бег",
        prediction: "совсем другие слова",
      },
    ];
    const low = evaluateCompatibility({
      ...names,
      player1: sheet("left"),
      player2: sheet("right"),
    });
    expect(low.scoring.total).toBeLessThan(40);
    expect(low.scoring.total).toBeGreaterThanOrEqual(0);
  });
});
