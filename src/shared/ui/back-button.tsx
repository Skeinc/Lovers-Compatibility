import { ChevronLeft } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

import { Button } from "./button";

export function BackButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="outline" className={cn("w-auto shrink-0 px-4", className)} {...props}>
      <ChevronLeft aria-hidden="true" className="size-5 text-accent" />
      Назад
    </Button>
  );
}
