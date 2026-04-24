"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRates } from "@/hooks/useRates";
import { useSession } from "@/hooks/useSession";
import { amountToMinorUnits, formatCurrency } from "@/lib/currency";
import { compareRates } from "@/lib/rates";

export default function LandingPage() {
  const { session } = useSession();

  // Show dashboard for authenticated users
  if (session) {
    return <AuthenticatedHome />;
  }

  // Show landing page for non-authenticated users
  return <PublicLandingPage />;
}

// Authenticated Home - Dashboard View
function AuthenticatedHome() {
  const { rates } = useRates();
  const { session } = useSession();

  const corridors = useMemo(() => {
    const map = new Map<
      string,
      { fromCurrency: string; toCurrency: string; destinationCountry: string }
    >();

    for (const rate of rates) {
      const key = `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`;
      if (!map.has(key)) {
        map.set(key, {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          destinationCountry: rate.destinationCountry,
        });
      }
    }

    return [...map.entries()].map(([value, data]) => ({
      value,
      label: `${data.fromCurrency} → ${data.toCurrency} (${data.destinationCountry})`,
      ...data,
    }));
  }, [rates]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-blue-950/40 to-emerald-950/40 p-8">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-lg text-[var(--foreground-muted)]">
                Ready to send money with the best rates?
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
                <span className="text-white text-sm font-bold">
                  {session?.walletAddress?.slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {formatAddress(session?.walletAddress)}
                </div>
                <div className="text-xs text-[var(--foreground-subtle)] capitalize">
                  {session?.role}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/send">
              <Button size="lg" className="group">
                Send Money Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/corridors">
              <Button variant="secondary" size="lg">
                View All Corridors
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary" size="lg">
                Transaction History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-xl">📊</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {corridors.length}
          </div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Active Corridors
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1">0</div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Total Sent
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30">
              <span className="text-xl">🎯</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Transactions
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-xl">✨</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 mb-1">$0</div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Total Saved
          </div>
        </Card>
      </section>

      {/* Quick Rate Comparison */}
      <PublicLandingPageContent />
    </div>
  );
}

// Public Landing Page - Non-authenticated View
function PublicLandingPage() {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-blue-950/50 via-slate-900 to-emerald-950/50 p-8 md:p-12">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative grid gap-12 md:grid-cols-2">
          {/* Left Column - Hero Content */}
          <div className="space-y-6 animate-slide-in">
            <Badge variant="primary" className="text-sm px-4 py-1.5">
              ✨ Live Rates · Real-time Comparison
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Send Money Smarter
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Save More Every Time
              </span>
            </h1>

            <p className="text-lg text-[var(--foreground-muted)] max-w-xl leading-relaxed">
              RemitFlow compares Stellar anchor corridors in real-time and
              routes your transfer through the cheapest path. Save 3-5% on every
              transaction.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-white">6+</div>
                <div className="text-sm text-[var(--foreground-subtle)]">
                  Active Corridors
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">3-5%</div>
                <div className="text-sm text-[var(--foreground-subtle)]">
                  Average Savings
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  Real-time
                </div>
                <div className="text-sm text-[var(--foreground-subtle)]">
                  Rate Updates
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="group">
                  Connect Wallet
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/corridors">
                <Button variant="secondary" size="lg">
                  Explore Corridors
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Quick Comparison Card */}
          <div className="animate-fade-in-up">
            <Card className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Quick Rate Check</CardTitle>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">
                  Compare rates instantly, no login required
                </p>
              </CardHeader>
              <CardContent>
                <PublicLandingPageContent />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid gap-6 md:grid-cols-3 animate-fade-in-up">
        <Card className="text-center p-8 hover-lift">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <span className="text-3xl">💰</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Cheapest Routes</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Automatically finds the lowest-cost path across all active Stellar
            anchors
          </p>
        </Card>

        <Card className="text-center p-8 hover-lift">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Transparent Fees</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            See exactly what you pay. No hidden charges, no surprises
          </p>
        </Card>

        <Card className="text-center p-8 hover-lift">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
            <span className="text-3xl">⚡</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Fast Settlement</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Powered by Stellar blockchain for near-instant transactions
          </p>
        </Card>
      </section>
    </div>
  );
}

// Shared rate comparison content
function PublicLandingPageContent() {
  const { rates, isLoading } = useRates();

  const [amountInput, setAmountInput] = useState("500");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("");

  const corridors = useMemo(() => {
    const map = new Map<
      string,
      { fromCurrency: string; toCurrency: string; destinationCountry: string }
    >();

    for (const rate of rates) {
      const key = `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`;
      if (!map.has(key)) {
        map.set(key, {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          destinationCountry: rate.destinationCountry,
        });
      }
    }

    return [...map.entries()].map(([value, data]) => ({
      value,
      label: `${data.fromCurrency} → ${data.toCurrency} (${data.destinationCountry})`,
      ...data,
    }));
  }, [rates]);

  const activeCorridorValue = selectedCorridor || corridors[0]?.value || "";

  const corridorData = useMemo(() => {
    return (
      corridors.find((corridor) => corridor.value === activeCorridorValue) ??
      null
    );
  }, [activeCorridorValue, corridors]);

  const filteredRates = useMemo(() => {
    if (!corridorData) return [];
    return rates.filter(
      (rate) =>
        rate.fromCurrency === corridorData.fromCurrency &&
        rate.toCurrency === corridorData.toCurrency &&
        rate.destinationCountry === corridorData.destinationCountry,
    );
  }, [corridorData, rates]);

  const amountMinor =
    corridorData ?
      amountToMinorUnits(amountInput, corridorData.fromCurrency)
    : 0;

  const comparedRates = useMemo(
    () => compareRates(filteredRates, amountMinor),
    [filteredRates, amountMinor],
  );

  const cheapest = comparedRates[0];

  return (
    <div className="space-y-6">
      {/* Amount and Corridor Selection */}
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            Amount to Send
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            placeholder="Enter amount"
            className="text-lg h-14"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
            Corridor
          </label>
          <Select
            value={activeCorridorValue}
            onChange={(event) => setSelectedCorridor(event.target.value)}
            options={corridors.map((corridor) => ({
              value: corridor.value,
              label: corridor.label,
            }))}
            className="h-14"
          />
        </div>
      </div>

      {/* Rate Display */}
      {cheapest && corridorData && (
        <div className="pt-4 border-t border-[var(--border)] space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground-muted)]">
              Best Rate:
            </span>
            <span className="text-lg font-bold text-emerald-400">
              {cheapest.anchorName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground-muted)]">
              You Send:
            </span>
            <span className="text-lg font-semibold text-white">
              {formatCurrency(amountMinor, corridorData.fromCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground-muted)]">
              They Receive:
            </span>
            <span className="text-lg font-semibold text-emerald-300">
              {formatCurrency(
                cheapest.destinationAmountMinor,
                corridorData.toCurrency,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <span className="text-sm text-[var(--foreground-muted)]">Fee:</span>
            <span className="text-lg font-semibold text-blue-300">
              {cheapest.feePercent}%
            </span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 pt-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      )}
    </div>
  );
}
