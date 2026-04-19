"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useAnchorDashboard } from "@/hooks/useAnchorDashboard";
import { formatCurrency } from "@/lib/currency";

export default function AnchorDashboardPage() {
  const { data, isLoading, error } = useAnchorDashboard();

  return (
    <RequireSession allowedRoles={["anchor", "admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Anchor Dashboard</h1>

        {error ? <Alert variant="error">{error}</Alert> : null}
        {isLoading ? <Alert>Loading anchor metrics...</Alert> : null}

        {data ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatCurrency(data.kpis.totalVolume, "USDC")}</p>
                  <p className="text-sm text-[var(--muted)]">{data.kpis.weeklyVolumeChangePct}% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{data.kpis.totalTransactions}</p>
                  <p className="text-sm text-[var(--muted)]">{data.kpis.weeklyTransactionsChangePct}% this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{formatCurrency(data.kpis.revenue, "USDC")}</p>
                  <p className="text-sm text-[var(--muted)]">{data.kpis.weeklyRevenueChangePct}% this week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>14-Day Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                      <XAxis dataKey="date" stroke="#71717A" />
                      <YAxis stroke="#71717A" />
                      <Tooltip contentStyle={{ background: "#18181B", border: "1px solid #27272A" }} />
                      <Line type="monotone" dataKey="volume" stroke="#2563EB" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="transactions" stroke="#10B981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
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
                      {data.recentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.createdAt).toLocaleDateString("en-US")}</TableCell>
                          <TableCell>{formatCurrency(tx.amount, tx.fromCurrency)}</TableCell>
                          <TableCell>{formatCurrency(tx.fee, tx.fromCurrency)}</TableCell>
                          <TableCell>{tx.status.toUpperCase()}</TableCell>
                          <TableCell>{tx.fromCurrency} → {tx.toCurrency}</TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RequireSession>
  );
}
