import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

const control =
  "w-full rounded-2xl border border-border bg-white/5 px-4 text-base text-foreground outline-none placeholder:text-muted/70 focus-visible:border-accent";

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-14", className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-32 resize-none py-4", className)} {...props} />;
}

export function FieldLabel({ children, htmlFor }: { children: string; htmlFor: string }) {
  return (
    <label className="mb-2 block text-sm text-muted" htmlFor={htmlFor}>
      {children}
    </label>
  );
}
