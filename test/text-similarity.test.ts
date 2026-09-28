import { describe, expect, it } from "vitest";

import { textSimilarity } from "@/shared/lib/text-similarity";

describe("textSimilarity", () => {
  it("returns 1 for the same phrase", () => {
    expect(textSimilarity("тепло смех дом", "тепло смех дом")).toBe(1);
  });

  it("treats ё and е as the same letter", () => {
    expect(textSimilarity("ёлка у дома", "елка у дома")).toBeGreaterThan(0.9);
  });

  it("returns 0 for empty and too short text", () => {
    expect(textSimilarity("", "дом кино поезд")).toBe(0);
    expect(textSimilarity("а", "дом кино поезд")).toBe(0);
  });

  it("is lower for unrelated phrases than for a paraphrase", () => {
    const close = textSimilarity("год у моря без планов", "год у моря и без планов");
    const far = textSimilarity("год у моря без планов", "ремонт кухни и отчёты");
    expect(close).toBeGreaterThan(far);
  });
});
