import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-[#16141a] p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-serif text-3xl text-foreground">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-base leading-relaxed text-muted">{description}</Dialog.Description>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={onConfirm}>{confirmLabel}</Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Вернуться к ответу
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <main className="flex flex-1 flex-col py-8">{children}</main>;
}
