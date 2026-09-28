import { describe, expect, it } from "vitest";

import { aiNarrativeSchema } from "@/shared/api";

describe("aiNarrativeSchema", () => {
  it("rejects a payload without the required narrative", () => {
    const parsed = aiNarrativeSchema.safeParse({ summary: "коротко" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a narrative and ignores a smuggled score field", () => {
    const parsed = aiNarrativeSchema.safeParse({
      compatibilityScore: 99,
      archetype: { name: "Два сапога", description: "Похожие будни и разный вечер." },
      summary: "Вы часто выбираете один ритм, но вечер представляете по-разному.",
      strengths: [{ title: "Деньги", description: "Оба отложили бы внезапную сумму." }],
      differences: [{ title: "Выходной", description: "Один остаётся дома, второй уже смотрит билеты." }],
      surprisingAnswers: [],
      partnerKnowledge: {
        explanation: "Оба угадывают чуть лучше случайности.",
        player1Score: 1000,
      },
      roast: "Билеты и плед пока живут в разных головах. Хорошо, что ссора у вас короткая.",
      positiveObservation: "В тексте про черту партнёра есть конкретная нежность.",
      finalVerdict: "Вы не одинаковые — и по ответам вам это не мешает.",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect("compatibilityScore" in parsed.data).toBe(false);
    }
  });
});
