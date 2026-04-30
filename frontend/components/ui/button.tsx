import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--gradient-primary)] text-[var(--primary-foreground)] shadow-lg hover:-translate-y-0.5 hover:brightness-105",
        secondary:
          "bg-[var(--surface-elevated)] text-[var(--foreground)] border border-[var(--border)] hover:brightness-105 hover:border-[var(--border-hover)] backdrop-blur-sm",
        ghost:
          "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]",
        destructive:
          "bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error-border)] hover:brightness-110",
        success:
          "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success-border)] hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export { buttonVariants };

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
