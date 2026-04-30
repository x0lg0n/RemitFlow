import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl shadow-sm",
        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out hover:border-[var(--border-hover)] motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:border before:border-[var(--border)]/30 before:content-['']",
        "relative overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 pt-6 pb-4 border-b border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl font-semibold tracking-tight text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[var(--foreground-muted)] mt-1", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-6 space-y-4", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50",
        className,
      )}
      {...props}
    />
  );
}
