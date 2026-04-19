"use client";

import { ShieldCheck } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";

export default function LoginPage() {
  const { loginWithWallet, isLoading, error } = useSession();

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            RemitFlow uses SEP-10 challenge signing through Freighter to authenticate securely. No private keys leave your wallet.
          </p>
          <Button onClick={() => void loginWithWallet()} disabled={isLoading} className="w-full">
            <ShieldCheck className="h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect Freighter"}
          </Button>
          {error ? <Alert variant="error">{error}</Alert> : null}
        </CardContent>
      </Card>
    </div>
  );
}
