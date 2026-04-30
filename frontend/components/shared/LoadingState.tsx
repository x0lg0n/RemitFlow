"use client";

/**
 * Loading State Components
 * Multiple variants for different loading scenarios
 */

export interface LoadingStateProps {
  variant?: "shimmer" | "spinner" | "dots" | "pulse";
  count?: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

const CONTAINER_SIZES = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
};

/**
 * LoadingState - Multiple animation variants
 */
export function LoadingState({
  variant = "shimmer",
  count = 3,
  size = "md",
}: LoadingStateProps) {
  switch (variant) {
    case "spinner":
      return <Spinner size={size} />;
    case "dots":
      return <DottedLoader />;
    case "pulse":
      return <PulseLoader size={size} />;
    case "shimmer":
    default:
      return <ShimmerLoader count={count} size={size} />;
  }
}

/**
 * Shimmer Effect - Best for skeleton loading
 */
function ShimmerLoader({
  count = 3,
  size = "md",
}: {
  count: number;
  size: "sm" | "md" | "lg";
}) {
  const baseClasses =
    size === "sm"
      ? "mb-2"
      : size === "lg"
        ? "mb-4"
        : "mb-3";

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => {
        const widthClass =
          i === count - 1
            ? "w-2/3"
            : i % 2 === 0
              ? "w-full"
              : "w-5/6";

        return (
          <div
            key={i}
            className={`h-4 ${widthClass} rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer ${baseClasses}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Spinner - Classic rotating loader
 */
function Spinner({ size = "md" }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${SIZES[size]} border-2 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin`}
      />
    </div>
  );
}

/**
 * Dotted Loader - Three bouncing dots
 */
function DottedLoader() {
  return (
    <div className="flex items-center justify-center gap-1 h-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 rounded-full bg-[var(--primary)] animate-bounce"
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulse Loader - Pulsing circle
 */
function PulseLoader({ size = "md" }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${SIZES[size]} bg-[var(--primary)]/30 rounded-full animate-pulse`}
      />
    </div>
  );
}

// ─────────────────────────────────────
// SPECIALIZED LOADERS
// ─────────────────────────────────────

/**
 * Loaders - Factory for specialized skeleton components
 */
export const Loaders = {
  /**
   * Single animated line skeleton
   */
  ShimmerSkeleton: ({
    className = "h-4 w-full",
  }: { className?: string } = {}) => (
    <div
      className={`rounded ${className} bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer`}
    />
  ),

  /**
   * Multiple skeleton lines with variable widths
   */
  SkeletonLines: ({
    count = 3,
    size = "md",
  }: { count?: number; size?: "sm" | "md" | "lg" } = {}) => {
    const heights = {
      sm: "h-3",
      md: "h-4",
      lg: "h-5",
    };

    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => {
          const widthClass =
            i === count - 1
              ? "w-2/3"
              : i % 2 === 0
                ? "w-full"
                : "w-5/6";

          return (
            <div
              key={i}
              className={`${heights[size]} ${widthClass} rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer`}
            />
          );
        })}
      </div>
    );
  },

  /**
   * Grid of skeleton cards
   */
  SkeletonGrid: ({
    count = 6,
    cols = 3,
  }: { count?: number; cols?: number } = {}) => (
    <div className={`grid gap-4 grid-cols-${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-lg bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer"
        />
      ))}
    </div>
  ),

  /**
   * Table skeleton with rows and columns
   */
  SkeletonTable: ({
    rows = 5,
    cols = 4,
  }: { rows?: number; cols?: number } = {}) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowI) => (
        <div key={rowI} className="flex gap-3">
          {Array.from({ length: cols }).map((_, colI) => (
            <div
              key={colI}
              className={`h-10 flex-1 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer`}
            />
          ))}
        </div>
      ))}
    </div>
  ),

  /**
   * Card skeleton with header, content, and footer
   */
  SkeletonCard: () => (
    <div className="space-y-4 rounded-lg border border-[var(--border)] p-4">
      <div className="h-6 w-2/3 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer ${
              i === 2 ? "w-2/3" : "w-full"
            }`}
          />
        ))}
      </div>
      <div className="h-10 w-full rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
    </div>
  ),

  /**
   * Transaction list skeleton
   */
  SkeletonTransactionList: ({
    count = 5,
  }: { count?: number } = {}) => (
    <div className="space-y-2 border-t border-[var(--border)]">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 px-2 border-b border-[var(--border)] last:border-b-0"
        >
          <div className="flex-1 space-y-1">
            <div className="h-4 w-32 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
            <div className="h-3 w-24 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
          </div>
          <div className="h-6 w-16 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
        </div>
      ))}
    </div>
  ),

  /**
   * Chart/Graph skeleton
   */
  SkeletonChart: () => (
    <div className="space-y-4">
      <div className="h-6 w-40 rounded bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer" />
      <div className="flex items-end justify-between h-40 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gradient-to-r from-[var(--background)] via-[var(--surface)] to-[var(--background)] bg-[length:200%_100%] animate-shimmer"
            style={{
              height: `${Math.random() * 100 + 50}px`,
            }}
          />
        ))}
      </div>
    </div>
  ),
};
