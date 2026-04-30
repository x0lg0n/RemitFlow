import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--foreground-muted)]",
        success:
          "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success)]",
        warning:
          "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]",
        error:
          "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error)]",
        info: "bg-[var(--info-bg)] border-[var(--info-border)] text-[var(--info)]",
        primary:
          "bg-[var(--primary)]/10 border-[var(--primary)]/35 text-[var(--primary)]",
        secondary:
          "bg-[var(--accent)]/10 border-[var(--accent)]/35 text-[var(--accent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
