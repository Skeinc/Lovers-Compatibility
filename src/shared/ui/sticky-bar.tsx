import type { ReactNode } from "react";

import { useKeyboardInset } from "@/shared/lib/use-keyboard-inset";

export function StickyBar({ children }: { children: ReactNode }) {
  const inset = useKeyboardInset();
  return (
    <div
      className="sticky bottom-0 -mx-5 mt-auto border-t border-border bg-[#0c0b0f]/85 px-5 pt-4 backdrop-blur-md"
      style={{ paddingBottom: `calc(1rem + ${inset}px + env(safe-area-inset-bottom))` }}
    >
      {children}
    </div>
  );
}
