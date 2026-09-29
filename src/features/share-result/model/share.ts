export function buildShareText(input: {
  player1: string;
  player2: string;
  total: number;
  label: string;
  archetype: string;
  verdict: string;
}): string {
  const lines = [`${input.player1} × ${input.player2}`];
  if (input.total >= 75) lines.push(`${input.total}% — ${input.label}`);
  lines.push(input.archetype, input.verdict, "", "Lovers Compatibility");
  return lines.join("\n");
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
