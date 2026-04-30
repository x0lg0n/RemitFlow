"use client";

import { useMemo } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { ToastContainer, type Toast } from "@/components/ui/toast";

export function ToastProvider() {
  try {
    const { notifications, removeNotification } = useNotification();

    // Convert Notification to Toast format
    const toasts: Toast[] = useMemo(
      () =>
        (notifications ?? []).map((n) => ({
          id: n.id,
          type: n.type as "success" | "error" | "warning" | "info",
          title: n.title,
          message: n.message,
          duration: n.duration,
          action: n.action,
          dismissible: n.dismissible,
        })),
      [notifications],
    );

    return <ToastContainer toasts={toasts} onClose={removeNotification} />;
  } catch (error) {
    // NotificationProvider not ready yet
    return null;
  }
}
