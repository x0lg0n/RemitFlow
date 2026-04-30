"use client";

import Link from "next/link";
import { RequireSession } from "@/components/shared/RequireSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <RequireSession allowedRoles={["admin"]}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage marketplace approvals, catalog health, product metrics, and reconciliation.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/admin/anchors">
            <Card className="h-full transition hover:border-[var(--ring)]">
              <CardHeader>
                <CardTitle>Anchor Operations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted)]">
                Review submissions, publish/unpublish catalog entries, and control availability.
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/metrics">
            <Card className="h-full transition hover:border-[var(--ring)]">
              <CardHeader>
                <CardTitle>Metrics and Indexing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--muted)]">
                Monitor DAU, volume, retention, and on-chain reconciliation status in one place.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </RequireSession>
  );
}
