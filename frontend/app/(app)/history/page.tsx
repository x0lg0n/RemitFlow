"use client";

import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";

export default function HistoryPage() {
  const { transactions, isLoading, error } = useTransactions(1, 50);

  return (
    <RequireSession>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Transaction History</h1>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-[var(--muted)]">Loading...</p> : null}

            {!isLoading && transactions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No transaction history yet.</p>
            ) : null}

            {!isLoading && transactions.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <Table>
                  <thead>
                    <TableRow className="bg-zinc-900/60 hover:bg-zinc-900/60">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Route</TableHead>
                    </TableRow>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                        <TableCell>{formatCurrency(tx.amount, tx.fromCurrency)}</TableCell>
                        <TableCell>{formatCurrency(tx.fee, tx.fromCurrency)}</TableCell>
                        <TableCell>{tx.status.toUpperCase()}</TableCell>
                        <TableCell>{tx.fromCurrency} → {tx.toCurrency}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </RequireSession>
  );
}
