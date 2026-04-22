"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Wallet,
  User,
  Mail,
  Calendar,
  Activity,
  Settings,
} from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
      title="Copy to clipboard">
      {copied ?
        <Check className="h-4 w-4 text-emerald-400" />
      : <Copy className="h-4 w-4 text-[var(--foreground-muted)]" />}
    </button>
  );
}

export default function ProfilePage() {
  const { session } = useSession();

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return <Badge variant="error">Admin</Badge>;
      case "anchor":
        return <Badge variant="primary">Anchor</Badge>;
      default:
        return <Badge variant="success">User</Badge>;
    }
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <RequireSession>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              View your account information and activity
            </p>
          </div>
          {getRoleBadge(session?.role)}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Information */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <Wallet className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Wallet Information</CardTitle>
                    <CardDescription>
                      Your connected Stellar wallet details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                      Wallet Address
                    </span>
                    <CopyButton text={session?.walletAddress || ""} />
                  </div>
                  <div className="font-mono text-sm text-white break-all">
                    {session?.walletAddress || "Not connected"}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-[var(--foreground-muted)]" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                        Account Type
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {session?.role || "User"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-[var(--foreground-muted)]" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                        Member Since
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      Today
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Overview */}
            <Card className="hover-lift">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <Activity className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle>Activity Overview</CardTitle>
                    <CardDescription>
                      Your transaction statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4 text-center">
                    <div className="text-3xl font-bold text-white mb-1">0</div>
                    <div className="text-xs text-[var(--foreground-subtle)]">
                      Total Transactions
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      $0
                    </div>
                    <div className="text-xs text-[var(--foreground-subtle)]">
                      Total Sent
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      $0
                    </div>
                    <div className="text-xs text-[var(--foreground-subtle)]">
                      Total Saved
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Connected Wallet
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] mb-4 font-mono">
                  {formatAddress(session?.walletAddress)}
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Add Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/history">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    View Transaction History
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                </Link>
                <Link href="/corridors">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    View Corridors
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireSession>
  );
}
