import { describe, expect, it } from "vitest";

import { aiNarrativeSchema } from "@/shared/api";

describe("aiNarrativeSchema", () => {
  it("rejects a payload without the required narrative", () => {
    const parsed = aiNarrativeSchema.safeParse({ insight: "коротко" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a narrative and ignores a smuggled score field", () => {
    const parsed = aiNarrativeSchema.safeParse({
      agreementPercent: 99,
      roleName: "Инициатор + Стабилизатор",
      insight: "Дима угадал 6 из 10, а в переезде оба выбрали «только вместе».",
      paradox: "Выходной у обоих про дом, а 100 000 ₽ один откладывает и второй тратит на поездку.",
      discussQuestion: "Работа мечты в другом городе: вы едете вместе или каждый решает сам?",
      finalScene: "Дима: «Давай».\nНастя: «Только вместе».\nОба остаются выбирать доставку.",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("agreementPercent" in parsed.data).toBe(false);
    }
  });
});
