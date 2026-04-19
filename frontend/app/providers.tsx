"use client";

import type { ReactNode } from "react";
import { WalletProvider } from "@/contexts/WalletContext";
import { SessionProvider } from "@/contexts/SessionContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <SessionProvider>{children}</SessionProvider>
    </WalletProvider>
  );
}
