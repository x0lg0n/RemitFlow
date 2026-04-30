"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <WalletProvider>
        <SessionProvider>{children}</SessionProvider>
      </WalletProvider>
    </NotificationProvider>
  );
}
