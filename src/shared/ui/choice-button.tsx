import { cn } from "@/shared/lib/cn";

export function ChoiceButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-14 w-full rounded-2xl border px-4 py-3 text-left text-base transition active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "border-accent bg-accent/15 text-foreground shadow-[0_0_24px_rgba(214,180,138,0.12)]"
          : "border-border bg-card text-foreground hover:border-white/20",
      )}
    >
      {children}
    </button>
  );
}
