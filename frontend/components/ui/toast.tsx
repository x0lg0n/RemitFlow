"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { Button } from "./button";

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

const ICON_MAP = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const COLOR_MAP = {
  success: "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]",
  error: "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]",
  warning: "bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning-text)]",
  info: "bg-[var(--info-bg)] border-[var(--info-border)] text-[var(--info-text)]",
};

const ICON_COLOR_MAP = {
  success: "text-[var(--success)]",
  error: "text-[var(--error)]",
  warning: "text-[var(--warning)]",
  info: "text-[var(--info)]",
};

/**
 * Individual Toast Component
 * Displays a single notification with icon, content, and optional action/close button
 */
export function Toast({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast.duration) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 200);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      role="alert"
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={`
        flex items-start gap-4 rounded-lg border px-4 py-3
        transition-all duration-200 ease-out
        ${COLOR_MAP[toast.type]}
        ${isExiting ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${ICON_COLOR_MAP[toast.type]}`}>
        {ICON_MAP[toast.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h3 className="font-semibold text-sm mb-0.5">{toast.title}</h3>
        )}
        <p className="text-sm opacity-90 break-words">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium underline hover:opacity-80 transition-opacity"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {toast.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={toast.action.onClick}
            className="text-xs"
          >
            {toast.action.label}
          </Button>
        )}
        {toast.dismissible !== false && (
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => onClose(toast.id), 200);
            }}
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 * Renders all active toasts in a stacked layout
 */
export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-3 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
