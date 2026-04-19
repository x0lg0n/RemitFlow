"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRates } from "@/hooks/useRates";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const { rates, isLoading: ratesLoading, error: ratesError } = useRates();
  const { transactions, isLoading: txLoading, error: txError } = useTransactions(1, 5);

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount + tx.fee, 0);
  const pendingCount = transactions.filter((tx) => tx.status === "pending" || tx.status === "processing").length;

  return (
    <RequireSession>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Link href="/send">
            <Button>
              Quick Send
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(totalVolume, "USDC")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{rates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        {(ratesError || txError) && <Alert variant="error">{ratesError ?? txError}</Alert>}

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? <p className="text-sm text-[var(--muted)]">Loading transactions...</p> : null}
            {!txLoading && transactions.length === 0 ? <p className="text-sm text-[var(--muted)]">No transactions yet.</p> : null}
            {!txLoading && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-zinc-900/40 px-4 py-3">
                    <div>
                      <p className="font-medium">{tx.fromCurrency} → {tx.toCurrency}</p>
                      <p className="text-xs text-[var(--muted)]">{tx.status.toUpperCase()}</p>
                    </div>
                    <p className="font-mono text-sm">{formatCurrency(tx.amount + tx.fee, tx.fromCurrency)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {ratesLoading ? <p className="text-xs text-[var(--muted)]">Refreshing live rates...</p> : null}
      </div>
    </RequireSession>
  );
}
