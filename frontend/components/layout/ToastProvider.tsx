"use client";

import { useMemo } from "react";
import { useMaybeNotification } from "@/contexts/NotificationContext";
import { ToastContainer, type Toast } from "@/components/ui/toast";

export function ToastProvider() {
  const maybe = useMaybeNotification();

  // Convert Notification to Toast format
  const toasts: Toast[] = useMemo(() => {
    const notifs = maybe?.notifications ?? [];
    return notifs.map((n) => ({
      id: n.id,
      type: n.type as "success" | "error" | "warning" | "info",
      title: n.title,
      message: n.message,
      duration: n.duration,
      action: n.action,
      dismissible: n.dismissible,
    }));
  }, [maybe?.notifications]);

  if (!maybe) return null;

  return <ToastContainer toasts={toasts} onClose={removeNotification} />;
}
