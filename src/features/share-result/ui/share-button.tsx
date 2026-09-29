import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";

import { shareResultPdf } from "../model/share";

export function ShareButton(input: { player1: string; player2: string; getSheet: () => HTMLElement | null }) {
  const [pending, setPending] = useState(false);

  async function onShare() {
    const sheet = input.getSheet();
    if (!sheet) {
      toast.error("Не получилось собрать PDF результата.");
      return;
    }
    setPending(true);
    const result = await shareResultPdf(sheet, input);
    setPending(false);
    if (result === "downloaded") toast.success("PDF с результатом сохранён");
    if (result === "failed") toast.error("Не получилось собрать PDF результата.");
  }

  return (
    <Button variant="outline" disabled={pending} onClick={() => void onShare()}>
      {pending ? "Собираем PDF…" : "Поделиться результатом"}
    </Button>
  );
}
