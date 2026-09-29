export function buildShareText(input: {
  player1: string;
  player2: string;
  total: number;
  roleName: string;
  insight: string;
}): string {
  return [
    `${input.player1} × ${input.player2}`,
    `${input.total}% — совпадение по вашим ответам`,
    input.roleName,
    input.insight,
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
