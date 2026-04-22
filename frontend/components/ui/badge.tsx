import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-white/5 border-[var(--border)] text-[var(--foreground-muted)]",
        success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        warning: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        error: "bg-rose-500/10 border-rose-500/30 text-rose-300",
        info: "bg-sky-500/10 border-sky-500/30 text-sky-300",
        primary: "bg-blue-500/10 border-blue-500/30 text-blue-300",
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
