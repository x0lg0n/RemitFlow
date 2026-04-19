import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

interface TransactionStatusCardProps {
  transaction: Transaction;
}

export function TransactionStatusCard({ transaction }: TransactionStatusCardProps) {
  const statusColor =
    transaction.status === "completed"
      ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
      : transaction.status === "failed"
      ? "border-red-500/40 bg-red-950/30 text-red-200"
      : "border-amber-500/40 bg-amber-950/30 text-amber-200";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Status</span>
          <Badge className={statusColor}>{transaction.status.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Amount</span>
          <span>{formatCurrency(transaction.amount + transaction.fee, transaction.fromCurrency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Route</span>
          <span>{transaction.fromCurrency} → {transaction.toCurrency}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Fee</span>
          <span>{formatCurrency(transaction.fee, transaction.fromCurrency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--muted)]">Created</span>
          <span>{formatDateTime(transaction.createdAt)}</span>
        </div>
        {transaction.stellarTxHash ? (
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">TX Hash</span>
            <code className="font-mono text-xs">{transaction.stellarTxHash.slice(0, 8)}...{transaction.stellarTxHash.slice(-4)}</code>
          </div>
        ) : null}
        <div className="rounded-lg border border-[var(--border)] bg-zinc-900/40 p-3 text-xs text-[var(--muted)]">
          Savings and recipient estimates depend on live anchor rates and can change until settlement.
        </div>
      </CardContent>
    </Card>
  );
}
