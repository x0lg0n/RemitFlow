"use client";

import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useSession } from "@/hooks/useSession";

export function WalletConnect() {
  const { loginWithWallet, isLoading, error } = useSession();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button size="sm" onClick={() => void loginWithWallet()} disabled={isLoading}>
        <ArrowRightLeft className="h-4 w-4" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
      {error ? <Alert variant="error" className="max-w-xs">{error}</Alert> : null}
    </div>
  );
}
