import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "success";
}

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  const variantClass =
    variant === "error"
      ? "border-red-500/40 bg-red-950/30 text-red-200"
      : variant === "success"
      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
      : "border-[var(--border)] bg-zinc-900/40 text-[var(--foreground)]";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variantClass,
        className
      )}
      role="alert"
      {...props}
    />
  );
}
