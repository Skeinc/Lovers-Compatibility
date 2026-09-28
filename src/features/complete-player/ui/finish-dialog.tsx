import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

export function FinishDialog({
  open,
  player,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  player: "player1" | "player2";
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const playerOne = player === "player1";
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={playerOne ? "Передать телефон?" : "Смотрим результат?"}
      confirmLabel={playerOne ? "Да, я закончил(а)" : "Да, показать результат"}
      description={
        playerOne
          ? "Это последний вопрос. После подтверждения ответы закроются, и партнёр их не увидит."
          : "Это последний вопрос. Дальше соберём общий разбор — без промежуточных спойлеров."
      }
    />
  );
}
