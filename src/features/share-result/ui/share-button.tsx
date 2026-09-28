import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

import { buildShareText, shareResult } from "../model/share";

export function ShareButton(input: {
  player1: string;
  player2: string;
  total: number;
  label: string;
  archetype: string;
  verdict: string;
}) {
  const [pending, setPending] = useState(false);

  async function onShare() {
    setPending(true);
    const result = await shareResult(buildShareText(input));
    setPending(false);
    if (result === "copied") toast.success("Текст результата скопирован");
    if (result === "failed") toast.error("Не получилось поделиться. Сделайте скриншот карточки.");
  }

  return (
    <Button variant="outline" disabled={pending} onClick={() => void onShare()}>
      Поделиться результатом
    </Button>
  );
}
