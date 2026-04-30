"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AppError } from "@/lib/errors";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number; // ms, 0 = never auto-close
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  fromError: (error: AppError | Error | string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

/**
 * NotificationProvider - Manages app-wide notifications
 * Wraps entire app tree in providers.tsx
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullNotification: Notification = {
        ...notification,
        id,
        dismissible: notification.dismissible !== false,
        duration: notification.duration ?? (notification.type === "error" ? 0 : 5000),
      };

      setNotifications((prev) => [...prev, fullNotification]);

      // Auto-remove if duration is set
      if (fullNotification.duration != null && fullNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, fullNotification.duration);
      }

      return id;
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, title?: string) => {
      return addNotification({
        type: "success",
        message,
        title,
        duration: 5000,
      });
    },
    [addNotification],
  );

  const error = useCallback(
    (message: string, title?: string) => {
      return addNotification({
        type: "error",
        message,
        title,
        duration: 0, // Stay until dismissed
      });
    },
    [addNotification],
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      return addNotification({
        type: "warning",
        message,
        title,
        duration: 5000,
      });
    },
    [addNotification],
  );

  const info = useCallback(
    (message: string, title?: string) => {
      return addNotification({
        type: "info",
        message,
        title,
        duration: 5000,
      });
    },
    [addNotification],
  );

  const fromError = useCallback(
    (error: AppError | Error | string) => {
      let message = "An unexpected error occurred";
      let title = "Error";

      if (typeof error === "string") {
        message = error;
      } else if ("userMessage" in error) {
        // AppError interface
        message = error.userMessage || error.message;
        title = error.severity === "critical" ? "Critical Error" : "Error";
      } else if ("message" in error) {
        // Standard Error
        message = error.message;
      }

      return addNotification({
        type: "error",
        message,
        title,
        duration: 0,
      });
    },
    [addNotification],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        success,
        error,
        warning,
        info,
        fromError,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 * Must be used within NotificationProvider
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within NotificationProvider",
    );
  }
  return context;
}
