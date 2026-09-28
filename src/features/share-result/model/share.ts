export function buildShareText(input: {
  player1: string;
  player2: string;
  total: number;
  label: string;
  archetype: string;
  verdict: string;
}): string {
  return [
    `${input.player1} × ${input.player2}`,
    `${input.total}% — ${input.label}`,
    input.archetype,
    input.verdict,
    "",
    "Lovers Compatibility",
  ].join("\n");
}

export async function shareResult(text: string): Promise<"shared" | "copied" | "cancelled" | "failed"> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "Lovers Compatibility", text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
