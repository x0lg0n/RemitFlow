"use client";

import Link from "next/link";
import { AlertCircle, ShoppingCart, Inbox, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionVariant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "py-8 px-4",
  md: "py-12 px-6",
  lg: "py-16 px-8",
};

const ICON_SIZES = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
};

const TITLE_SIZES = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const DESC_SIZES = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

/**
 * EmptyState Component
 * Displays when there's no data to show
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  actionVariant = "secondary",
  size = "md",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${SIZES[size]}`}>
      {icon && (
        <div className={`mb-4 text-[var(--foreground-subtle)] ${ICON_SIZES[size]}`}>
          {icon}
        </div>
      )}

      <h2 className={`font-semibold text-[var(--foreground)] mb-2 ${TITLE_SIZES[size]}`}>
        {title}
      </h2>

      {description && (
        <p className={`text-[var(--foreground-muted)] mb-6 max-w-md ${DESC_SIZES[size]}`}>
          {description}
        </p>
      )}

      {(actionLabel || actionHref || onAction) && (
        <div className="mt-4">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant={actionVariant} size={size === "sm" ? "sm" : "md"}>
                {actionLabel}
              </Button>
            </Link>
          ) : onAction ? (
            <Button
              variant={actionVariant}
              onClick={onAction}
              size={size === "sm" ? "sm" : "md"}
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

/**
 * Predefined EmptyState Scenarios
 */
export const EmptyStates = {
  NoTransactions: ({
    actionHref = "/send",
    size = "md",
  }: { actionHref?: string; size?: "sm" | "md" | "lg" } = {}) => (
    <EmptyState
      icon={<Inbox className="h-full w-full" />}
      title="No Transactions Yet"
      description="Your transaction history will appear here once you send your first transfer."
      actionLabel="Send Money"
      actionHref={actionHref}
      size={size}
    />
  ),

  NoRates: ({
    actionHref = "/corridors",
    size = "md",
  }: { actionHref?: string; size?: "sm" | "md" | "lg" } = {}) => (
    <EmptyState
      icon={<AlertCircle className="h-full w-full" />}
      title="No Rates Available"
      description="Try selecting a different corridor or check back later."
      actionLabel="Browse Corridors"
      actionHref={actionHref}
      size={size}
    />
  ),

  NoAnchors: ({
    actionLabel = "Browse Anchors",
    actionHref = "/anchors/marketplace",
    size = "md",
  }: {
    actionLabel?: string;
    actionHref?: string;
    size?: "sm" | "md" | "lg";
  } = {}) => (
    <EmptyState
      icon={<ShoppingCart className="h-full w-full" />}
      title="No Anchors Available"
      description="This corridor is not currently supported by any anchors."
      actionLabel={actionLabel}
      actionHref={actionHref}
      size={size}
    />
  ),

  NoSearchResults: ({
    query,
    size = "md",
  }: { query: string; size?: "sm" | "md" | "lg" } = { query: "" }) => (
    <EmptyState
      icon={<AlertCircle className="h-full w-full" />}
      title="No Results Found"
      description={`No results for "${query}". Try different keywords.`}
      size={size}
    />
  ),

  NotConnected: ({
    size = "md",
  }: { size?: "sm" | "md" | "lg" } = {}) => (
    <EmptyState
      icon={<Lock className="h-full w-full" />}
      title="Connect Your Wallet"
      description="You need to connect your wallet to view this content."
      actionLabel="Connect Wallet"
      actionHref="/login"
      size={size}
    />
  ),

  Error: ({
    message,
    actionLabel = "Try Again",
    onAction,
    size = "md",
  }: {
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    size?: "sm" | "md" | "lg";
  } = {}) => (
    <EmptyState
      icon={<AlertCircle className="h-full w-full" />}
      title="Something Went Wrong"
      description={
        message || "An unexpected error occurred. Please try again later."
      }
      actionLabel={onAction ? actionLabel : undefined}
      onAction={onAction}
      size={size}
    />
  ),

  MaintenanceMode: ({
    size = "md",
  }: { size?: "sm" | "md" | "lg" } = {}) => (
    <EmptyState
      icon={<AlertCircle className="h-full w-full" />}
      title="Maintenance Mode"
      description="We're making improvements. Please check back soon."
      size={size}
    />
  ),

  Loading: ({
    size = "md",
  }: { size?: "sm" | "md" | "lg" } = {}) => (
    <EmptyState
      title="Loading..."
      description="Please wait while we fetch your data."
      size={size}
    />
  ),
};
