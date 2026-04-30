"use client";

import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/hooks/useMetrics";
import { formatCurrency } from "@/lib/currency";

export default function AdminMetricsPage() {
  const {
    overview,
    trend,
    cohorts,
    indexingSummary,
    indexingRows,
    isLoading,
    error,
    refetch,
    runReconciliationNow,
  } = useMetrics();

  return (
    <RequireSession allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Metrics</h1>
            <p className="text-sm text-[var(--muted)]">
              Live DAU, volume, recurring activity, and retention cohorts.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">DAU</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{overview?.dau ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">MAU (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{overview?.mau ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tx Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{overview?.txToday ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tx 30d</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{overview?.tx30d ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Volume Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Today: {formatCurrency(overview?.volumeTodayMinor ?? 0, "USDC")}
              </p>
              <p>
                Last 30 days: {formatCurrency(overview?.volume30dMinor ?? 0, "USDC")}
              </p>
              <p>
                Active recurring plans: {overview?.recurringActivePlans ?? 0}
              </p>
              <p>
                Pending recurring confirmations: {overview?.pendingRecurringRuns ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction Trend (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-[var(--muted)]">Loading trend...</p>
              ) : trend.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No transaction trend data yet.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {trend.slice(-8).map((point) => (
                    <div
                      key={point.day}
                      className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2"
                    >
                      <span>{point.day}</span>
                      <span>{point.txCount} tx</span>
                      <span>{formatCurrency(point.volumeMinor, "USDC")}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Retention Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-[var(--muted)]">Loading retention data...</p>
            ) : cohorts.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No retention cohorts yet.</p>
            ) : (
              <div className="space-y-2">
                {cohorts.map((cohort) => (
                  <div
                    key={cohort.cohortWeek}
                    className="grid gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs md:grid-cols-6"
                  >
                    <span>Cohort: {cohort.cohortWeek}</span>
                    <span>Users: {cohort.cohortSize}</span>
                    <span>W1: {cohort.retainedWeek1}</span>
                    <span>W1%: {cohort.retentionWeek1Pct}%</span>
                    <span>W4: {cohort.retainedWeek4}</span>
                    <span>W4%: {cohort.retentionWeek4Pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blockchain Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => void runReconciliationNow()}>
                Run Reconciliation Now
              </Button>
              <span className="text-xs text-[var(--muted)]">
                Last checked: {indexingSummary?.lastCheckedAt ?? "Never"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-md border border-[var(--border)] px-3 py-2">
                Matched: {indexingSummary?.matched ?? 0}
              </div>
              <div className="rounded-md border border-[var(--border)] px-3 py-2">
                Missing: {indexingSummary?.missing ?? 0}
              </div>
              <div className="rounded-md border border-[var(--border)] px-3 py-2">
                Errors: {indexingSummary?.errored ?? 0}
              </div>
            </div>

            {indexingRows.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No reconciliation rows yet.</p>
            ) : (
              <div className="space-y-2">
                {indexingRows.map((row) => (
                  <div
                    key={row.transactionId}
                    className="grid gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs md:grid-cols-5"
                  >
                    <span>{row.transactionId.slice(0, 8)}</span>
                    <span className="capitalize">{row.horizonStatus}</span>
                    <span>{row.horizonLedger ?? "-"}</span>
                    <span>{row.horizonSuccessful === null ? "-" : row.horizonSuccessful ? "true" : "false"}</span>
                    <span className="truncate">{row.errorMessage ?? "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireSession>
  );
}
