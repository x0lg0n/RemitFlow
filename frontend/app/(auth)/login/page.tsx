"use client";

import {
  ShieldCheck,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/useSession";

export default function LoginPage() {
  const { loginWithWallet, isLoading, error, session } = useSession();
  const router = useRouter();

  // Redirect to home if already logged in
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleLogin = async () => {
    try {
      await loginWithWallet();
      // If successful, session will be set and useEffect will redirect
    } catch (err) {
      // Error is already handled in SessionContext
      // User rejection or other errors will show in the error state
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-white transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6 animate-slide-in">
            <div>
              <Badge variant="primary" className="mb-4">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Secure Authentication
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Connect Your
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  {" "}
                  Wallet
                </span>
              </h1>
              <p className="text-[var(--foreground-muted)] leading-relaxed">
                Sign in securely using Stellar's SEP-10 protocol. Your private
                keys never leave your wallet.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30 flex-shrink-0">
                  <Lock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Non-Custodial
                  </h3>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Your keys, your crypto. We never access your private keys.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    SEP-10 Verified
                  </h3>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    Industry-standard authentication protocol for Stellar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30 flex-shrink-0">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Instant Access
                  </h3>
                  <p className="text-xs text-[var(--foreground-subtle)]">
                    One-click wallet connection, no passwords needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Connect Card */}
          <div className="lg:col-span-3 animate-fade-in-up">
            <Card className="border-white/10 backdrop-blur-xl bg-white/5">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Connect Wallet</CardTitle>
                    <CardDescription className="mt-1">
                      Choose your wallet to get started
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Freighter Wallet Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden rounded-xl border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 p-6 hover:border-blue-500/60 hover:from-blue-500/20 hover:to-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                        <ShieldCheck className="h-7 w-7 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-lg font-semibold text-white mb-1">
                          Freighter Wallet
                        </div>
                        <div className="text-sm text-[var(--foreground-muted)]">
                          Recommended for Stellar
                        </div>
                      </div>
                    </div>
                    {isLoading ?
                      <div className="flex items-center gap-2 text-blue-400">
                        <div className="h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">
                          Connecting...
                        </span>
                      </div>
                    : <div className="text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                        Connect →
                      </div>
                    }
                  </div>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border)]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--surface)] px-2 text-[var(--foreground-subtle)]">
                      Why connect a wallet?
                    </span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 rounded-xl bg-white/5 border border-[var(--border)] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[var(--foreground-muted)]">
                      Access real-time anchor rates and comparisons
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[var(--foreground-muted)]">
                      Send money across borders with lowest fees
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[var(--foreground-muted)]">
                      Track transaction history and savings
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="error" className="animate-fade-in">
                    {error}
                  </Alert>
                )}

                {/* Help Text */}
                <div className="text-center text-xs text-[var(--foreground-subtle)] pt-2">
                  Don't have Freighter?{" "}
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    Download here
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
