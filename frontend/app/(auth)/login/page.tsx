"use client";

import {
  ShieldCheck,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRates } from "@/hooks/useRates";
import { useSession } from "@/hooks/useSession";

export default function LoginPage() {
  const { loginWithWallet, isLoading, error, session } = useSession();
  const { rates, isLoading: isRatesLoading } = useRates();
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
    } catch {
      // Error is already handled in SessionContext
      // User rejection or other errors will show in the error state
    }
  };

  const anchorCount = useMemo(
    () => new Set(rates.map((rate) => rate.anchorName)).size,
    [rates],
  );

  const corridorCount = useMemo(() => {
    const uniqueCorridors = new Set(
      rates.map(
        (rate) =>
          `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`,
      ),
    );
    return uniqueCorridors.size;
  }, [rates]);

  return (
    <div className="min-h-[calc(100vh-200px)] py-10 px-6 md:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 animate-fade-in">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-(--foreground-muted) hover:text-(--foreground) transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Main Content */}
        <section className="relative overflow-hidden rounded-4xl border border-(--border) bg-linear-to-br from-white to-(--background-deep) p-6 shadow-(--shadow-lg) md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-(--accent)/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-(--primary)/8 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left Column - Info */}
            <div className="space-y-7 animate-slide-in">
              <div>
                <Badge variant="secondary" className="rounded-full px-4 py-1.5">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Secure Wallet Sign-in
                </Badge>
                <h1 className="mt-4 max-w-xl text-5xl leading-[0.96] text-(--foreground) md:text-6xl">
                  Connect once. Route smarter every time.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-(--foreground-muted)">
                  Sign in with SEP-10 and unlock live cross-border corridor
                  comparisons, transparent fee math, and better payout routes.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-(--border) bg-white/85 p-4 shadow-(--shadow-sm)">
                  <div className="text-xs font-semibold uppercase tracking-widest text-(--foreground-subtle)">
                    Partnered Anchors
                  </div>
                  {isRatesLoading ?
                    <Skeleton className="mt-2 h-8 w-20 rounded-md" />
                  : <div className="mt-2 text-3xl font-extrabold text-(--foreground)">
                      {anchorCount}
                    </div>
                  }
                </div>
                <div className="rounded-xl border border-(--border) bg-white/85 p-4 shadow-(--shadow-sm)">
                  <div className="text-xs font-semibold uppercase tracking-widest text-(--foreground-subtle)">
                    Active Corridors
                  </div>
                  {isRatesLoading ?
                    <Skeleton className="mt-2 h-8 w-20 rounded-md" />
                  : <div className="mt-2 text-3xl font-extrabold text-(--foreground)">
                      {corridorCount}
                    </div>
                  }
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-(--foreground)">
                      Non-custodial
                    </h3>
                    <p className="text-xs text-(--foreground-subtle)">
                      Private keys stay in your wallet. We only verify signed
                      challenge transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-(--foreground)">
                      SEP-10 verified
                    </h3>
                    <p className="text-xs text-(--foreground-subtle)">
                      Protocol-standard Stellar authentication for safer sign-in
                      and session management.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-(--foreground)">
                      Instant access
                    </h3>
                    <p className="text-xs text-(--foreground-subtle)">
                      No passwords. Connect once and start comparing live
                      corridors in seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-(--border) bg-white/90 p-4 shadow-(--shadow-sm)">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-(--foreground-subtle)" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-(--foreground-subtle)">
                    Trusted by cross-border teams
                  </p>
                </div>
                <p className="mt-2 text-sm text-(--foreground-muted)">
                  “The quote preview and route transparency make every transfer
                  decision easier and faster.”
                </p>
              </div>
            </div>

            {/* Right Column - Connect Card */}
            <div className="animate-fade-in-up">
              <Card className="border-(--border) bg-white/80 backdrop-blur-xl shadow-(--shadow-2xl) rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-500 via-(--primary) to-emerald-500" />

                <CardHeader className="pt-10 pb-6 px-8 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-blue-500 to-emerald-500 shadow-(--shadow-glow) shadow-blue-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Wallet className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black text-(--foreground) tracking-tight">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="mt-2 text-base font-medium text-(--foreground-muted)">
                    Securely access your RemitFlow account through Stellar
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-10">
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-3xl border-2 border-(--border) bg-white p-6 text-left transition-all hover:border-(--primary) hover:shadow-(--shadow-md) disabled:cursor-not-allowed disabled:opacity-60">
                    <div className="flex items-center gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-(--border) bg-(--surface-elevated) group-hover:bg-(--primary)/5 transition-colors">
                        <ShieldCheck className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl font-black text-(--foreground) tracking-tight">
                            Freighter
                          </span>
                          <ArrowRight className="h-5 w-5 text-(--primary) transition-transform group-hover:translate-x-1" />
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-(--foreground-subtle)">
                          Recommended Authentication
                        </div>
                      </div>
                    </div>

                    {isLoading && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-(--primary)/10">
                        <div className="h-full bg-(--primary) animate-progress-glow w-1/3" />
                      </div>
                    )}
                  </button>

                  <div className="space-y-4 rounded-3xl border border-(--border) bg-(--surface-elevated)/50 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1 w-4 rounded-full bg-(--primary)" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">
                        Authentication Flow
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 group/item">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-(--border) text-xs font-black text-(--foreground) group-hover/item:border-(--primary) transition-colors">
                          1
                        </div>
                        <div className="text-sm font-bold text-(--foreground-muted)">
                          Connect and sign challenge
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group/item">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-(--border) text-xs font-black text-(--foreground) group-hover/item:border-(--primary) transition-colors">
                          2
                        </div>
                        <div className="text-sm font-bold text-(--foreground-muted)">
                          Compare live corridor rates
                        </div>
                      </div>
                      <div className="flex items-center gap-4 group/item">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-(--border) text-xs font-black text-(--foreground) group-hover/item:border-(--primary) transition-colors">
                          3
                        </div>
                        <div className="text-sm font-bold text-(--foreground-muted)">
                          Execute faster settlements
                        </div>
                      </div>
                    </div>
                  </div>

                  {error ?
                    <Alert className="rounded-2xl border-red-500/20 bg-red-500/5 text-red-600 font-bold text-sm animate-fade-in shadow-sm">
                      {error}
                    </Alert>
                  : null}

                  <div className="flex flex-col gap-4">
                    <div className="text-center text-xs font-bold text-(--foreground-subtle)">
                      Don&apos;t have Freighter?{" "}
                      <a
                        href="https://www.freighter.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600! hover:text-blue-700! hover:underline decoration-2 underline-offset-4 transition-colors">
                        Get it here
                      </a>
                    </div>

                    <Link href="/" className="block">
                      <Button
                        variant="ghost"
                        className="h-12 w-full rounded-xl border border-(--border) bg-(--surface) text-sm font-bold text-(--foreground) hover:bg-(--surface-elevated) transition-all">
                        Explore first
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
