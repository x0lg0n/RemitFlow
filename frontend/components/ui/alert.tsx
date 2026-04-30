import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "error" | "success" | "info";
}

export function Alert({
  className,
  variant = "default",
  ...props
}: AlertProps) {
  const variantClass =
    variant === "error" ? "border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error)]"
    : variant === "success" ?
      "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
    : variant === "info" ? "border-[var(--info-border)] bg-[var(--info-bg)] text-[var(--info)]"
    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variantClass,
        className,
      )}
      role="alert"
      {...props}
    />
  );
}
