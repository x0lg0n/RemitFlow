"use client";

import { RequireSession } from "@/components/shared/RequireSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";

export default function ProfilePage() {
  const { session } = useSession();

  return (
    <RequireSession>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-[var(--muted)]">Wallet:</span> {session?.walletAddress}</p>
            <p><span className="text-[var(--muted)]">Role:</span> {session?.role}</p>
            <p><span className="text-[var(--muted)]">Anchor ID:</span> {session?.anchorId ?? "N/A"}</p>
          </CardContent>
        </Card>
      </div>
    </RequireSession>
  );
}
