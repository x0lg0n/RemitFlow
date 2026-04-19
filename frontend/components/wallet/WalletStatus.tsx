"use client";

import { LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { formatAddress } from "@/lib/utils";

export function WalletStatus() {
  const { session, logout, isLoading } = useSession();

  if (!session) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-zinc-900 px-3 py-1.5">
        <Wallet className="h-3.5 w-3.5 text-emerald-400" />
        <span className="font-mono text-xs">{formatAddress(session.walletAddress)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => void logout()} disabled={isLoading} aria-label="Disconnect wallet">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
