"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Globe2, History, Send, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useRates } from "@/hooks/useRates";
import { useSession } from "@/hooks/useSession";
import { useTransactions } from "@/hooks/useTransactions";
import { amountToMinorUnits, formatCurrency } from "@/lib/currency";
import { compareRates } from "@/lib/rates";

export default function LandingPage() {
  const { session } = useSession();

  return session ? <AuthenticatedHome /> : <PublicLandingPage />;
}

function AuthenticatedHome() {
  const { rates } = useRates();
  const { session } = useSession();
  const { transactions } = useTransactions();

  const corridors = useMemo(() => {
    const corridorMap = new Map<
      string,
      { fromCurrency: string; toCurrency: string; destinationCountry: string }
    >();

    for (const rate of rates) {
      const key = `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`;
      if (!corridorMap.has(key)) {
        corridorMap.set(key, {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          destinationCountry: rate.destinationCountry,
        });
      }
    }

    return [...corridorMap.entries()].map(([value, data]) => ({
      value,
      label: `${data.fromCurrency} → ${data.toCurrency} (${data.destinationCountry})`,
      ...data,
    }));
  }, [rates]);

  const stats = useMemo(() => {
    const completedTxs = transactions.filter((tx) => tx.status === "completed");
    const totalSent = completedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSaved = completedTxs.length * 500;

    return {
      totalSent,
      totalSaved,
      txCount: transactions.length,
      activeCorridors: corridors.length,
    };
  }, [transactions, corridors.length]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-4xl border border-(--border) bg-linear-to-r from-(--surface) to-(--background-deep) p-8 shadow-(--shadow-lg)">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-(--primary)/10 blur-3xl" />
        <div className="relative space-y-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-(--foreground) md:text-4xl">
                Welcome back
              </h1>
              <p className="text-lg text-(--foreground-muted)">
                Ready to send money with the best routes?
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-3xl border border-(--border) bg-(--surface-elevated) p-4 shadow-(--shadow-sm)">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-(--primary) to-(--accent) shadow-(--shadow-glow)">
                <Wallet className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-(--foreground)">
                  {formatAddress(session?.walletAddress)}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-(--foreground-subtle)">
                  {session?.role} Account
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/send">
              <Button size="lg" className="h-12 rounded-2xl bg-(--primary) px-8 font-bold text-lg text-white hover:bg-(--primary-hover)" aria-label="Start a new transfer">
                <Send className="mr-2 h-5 w-5" />
                Send Money
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/corridors">
              <Button variant="secondary" size="lg" className="h-12 rounded-2xl px-8 font-bold text-lg" aria-label="View all remittance corridors">
                <Globe2 className="mr-2 h-5 w-5" />
                Corridors
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary" size="lg" className="h-12 rounded-2xl px-8 font-bold text-lg" aria-label="View transaction history">
                <History className="mr-2 h-5 w-5" />
                History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Corridors", value: stats.activeCorridors, icon: Globe2, color: "var(--primary)" },
          { label: "Total Sent", value: formatCurrency(stats.totalSent, "USD"), icon: BarChart3, color: "var(--accent)" },
          { label: "Transactions", value: stats.txCount, icon: History, color: "var(--primary)" },
          { label: "Total Saved", value: formatCurrency(stats.totalSaved, "USD"), icon: Send, color: "var(--success)" },
        ].map((item, index) => (
          <Card key={index} className="rounded-3xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm)">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={{ color: item.color }}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-(--foreground)">{item.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-(--foreground-subtle)">{item.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <PublicLandingPageContent />
    </div>
  );
}

function PublicLandingPage() {
  const benefits = [
    {
      title: "Smart Routing",
      description: "Find the cheapest Stellar anchor corridors automatically with a real-time scoring engine.",
      icon: "🚀",
    },
    {
      title: "Secure & Transparent",
      description: "Wallet-based authentication via SEP-10 keeps every transfer safe and verifiable.",
      icon: "🛡️",
    },
    {
      title: "Faster Settlement",
      description: "Leverage Stellar's fast finality for near-instant cross-border payments.",
      icon: "🤝",
    },
  ];

  const uniqueFeatures = [
    {
      title: "Route Scoring",
      description: "Ranks anchors by effective payout, fee quality, and corridor reliability.",
    },
    {
      title: "Fee Math",
      description: "Shows source amount, fee, FX conversion, and recipient amount before you send.",
    },
    {
      title: "Wallet-native",
      description: "Uses SEP-10 challenge signing so you authenticate without insecure passwords.",
    },
    {
      title: "Live Coverage",
      description: "Continuously tracks active remittance corridors across supported anchors.",
    },
  ];

  return (
    <div className="space-y-20 py-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-4xl border border-(--border) bg-linear-to-br from-(--surface) via-(--background) to-(--background-deep) p-8 shadow-(--shadow-xl) md:p-16">
        <div className="absolute right-0 top-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-(--primary)/5 blur-[100px]" />
        <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <Badge variant="secondary" className="rounded-full border-(--border) px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-(--primary)">
              Modern Remittance Engine
            </Badge>

            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-tight tracking-tight text-(--foreground) md:text-7xl lg:text-8xl">
                Global payments, <span className="bg-linear-to-r from-(--primary) to-(--accent) bg-clip-text text-transparent">smarter.</span>
              </h1>
              <p className="max-w-lg text-lg font-medium leading-relaxed text-(--foreground-muted)">
                Route cross-border payouts through the strongest Stellar corridors and save on fees with real-time routing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 rounded-2xl bg-(--primary) px-10 text-lg font-bold text-white shadow-(--shadow-glow) hover:bg-(--primary-hover)" aria-label="Get started with RemitFlow">
                  Start Sending
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/corridors">
                <Button variant="ghost" size="lg" className="h-14 rounded-2xl border border-(--border) px-10 text-lg font-bold hover:bg-(--surface-elevated)" aria-label="View live corridor rates">
                  View Rates
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-3xl font-black text-(--foreground)">80%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-(--foreground-subtle)">Cheaper Fees</div>
              </div>
              <div className="h-10 w-px bg-(--border)" />
              <div className="space-y-1">
                <div className="text-3xl font-black text-(--foreground)">24/7</div>
                <div className="text-xs font-bold uppercase tracking-widest text-(--foreground-subtle)">Live Routing</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-4xl border border-(--border) bg-(--surface-elevated) p-8 shadow-2xl">
              <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-transparent via-(--primary) to-transparent opacity-30" />
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--primary) to-(--accent) shadow-(--shadow-glow)">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-tight text-(--foreground)">Active Route</div>
                      <div className="flex items-center gap-1 font-mono text-[10px] text-(--primary)">
                        <span className="h-1.5 w-1.5 rounded-full bg-(--primary) animate-pulse" />
                        STLR-SES-942
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="border-(--primary)/30 bg-(--primary)/5 text-[10px] font-black uppercase text-(--primary)">
                    Optimizing
                  </Badge>
                </div>

                <div className="space-y-5 rounded-3xl border border-(--border) bg-(--surface) p-5 transition-all duration-500 group-hover:border-(--primary)/30">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-(--foreground-subtle)">
                    <span>Engine Path</span>
                    <span className="text-(--primary)">98% Efficient</span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 pb-1">
                    <div className="text-center">
                      <div className="text-xl font-black tracking-tight text-(--foreground)">USD</div>
                      <div className="text-[9px] font-bold uppercase text-(--foreground-muted)">Source</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center px-4">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-(--border)">
                        <div className="absolute inset-y-0 left-0 w-3/4 bg-linear-to-r from-(--primary) to-(--accent) transition-all duration-700" />
                      </div>
                      <Globe2 className="mt-2 h-4 w-4 animate-pulse text-(--primary)" />
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black tracking-tight text-(--foreground)">EUR</div>
                      <div className="text-[9px] font-bold uppercase text-(--foreground-muted)">Target</div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-(--border) pt-4">
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-muted)">Est. Final Payout</div>
                      <div className="text-3xl font-black tracking-tighter text-(--foreground)">€942.15</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex h-6 w-20 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold text-emerald-600">
                        +5.2% SAVED
                      </div>
                      <div className="text-[12px] font-mono text-(--foreground-subtle)">ID: 0x48...f2</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded-3xl border border-(--border) bg-(--surface) p-4 transition-colors hover:border-(--primary)/30">
                    <div className="text-[9px] font-black uppercase tracking-tight text-(--foreground-muted)">Network Fee</div>
                    <div className="text-[14px] font-black text-(--primary)">$0.45</div>
                  </div>
                  <div className="flex flex-col gap-1 rounded-3xl border border-(--border) bg-(--surface) p-4 transition-colors hover:border-(--primary)/30">
                    <div className="text-[9px] font-black uppercase tracking-tight text-(--foreground-muted)">Settlement</div>
                    <div className="text-[14px] font-black text-(--accent)">~3.5s</div>
                  </div>
                </div>

                <div className="flex h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-(--border) bg-(--surface) text-[10px] font-black uppercase tracking-widest text-(--foreground-muted)">
                  <div className="mr-3 h-2 w-2 rounded-full bg-(--primary) animate-ping" />
                  Syncing Stellar RPC Nodes
                </div>
              </div>
            </div>
            <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-(--primary)/5 blur-[80px] animate-pulse" />
            <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-(--accent)/5 blur-[100px]" />
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {benefits.map((benefit, index) => (
          <Card key={index} className="rounded-4xl border border-(--border) bg-(--surface) p-8 shadow-(--shadow-sm) transition-all hover:border-(--primary)/20 hover:shadow-(--shadow-md)">
            <CardContent className="space-y-5 p-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)/10 text-3xl">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-(--foreground)">{benefit.title}</h3>
                <p className="text-base font-medium leading-relaxed text-(--foreground-muted)">{benefit.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <PublicLandingPageContent />

      <section className="space-y-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-(--foreground) md:text-5xl">
              Built for <span className="text-(--primary)">performance.</span>
            </h2>
            <p className="text-lg font-medium text-(--foreground-muted)">
              Enterprise-grade routing features for the modern web.
            </p>
          </div>
          <Link href="/corridors">
            <Button variant="secondary" className="h-12 rounded-2xl border-(--border) px-8 font-bold hover:bg-(--surface-elevated)">
              Explore Network
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {uniqueFeatures.map((feature, index) => (
            <div key={index} className="rounded-4xl border border-(--border) bg-(--surface) p-6 shadow-(--shadow-sm) transition-all hover:border-(--primary)/20">
              <h4 className="mb-3 text-lg font-black text-(--foreground)">{feature.title}</h4>
              <p className="text-sm font-medium leading-relaxed text-(--foreground-muted)">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-4xl bg-(--foreground) p-12 text-center text-(--background) md:p-20">
        <div className="absolute inset-0 bg-(--primary)/5 opacity-10" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-10">
          <h2 className="text-5xl font-black leading-[0.9] tracking-tighter md:text-7xl">
            Ready to optimize your global payouts?
          </h2>
          <p className="text-xl font-medium opacity-70">
            Join the RemitFlow network today and start routing through the strongest corridors on Stellar.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/login">
              <Button size="lg" className="h-16 rounded-2xl bg-(--background) px-12 text-xl font-black text-(--foreground) shadow-2xl hover:opacity-90" aria-label="Create an account">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PublicLandingPageContent() {
  const { rates, isLoading } = useRates();
  const [amount, setAmount] = useState("1000");
  const [selectedCorridor, setSelectedCorridor] = useState("");

  const corridors = useMemo(() => {
    const corridorMap = new Map<
      string,
      { fromCurrency: string; toCurrency: string; destinationCountry: string }
    >();

    for (const rate of rates) {
      const key = `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`;
      if (!corridorMap.has(key)) {
        corridorMap.set(key, {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          destinationCountry: rate.destinationCountry,
        });
      }
    }

    return [...corridorMap.entries()].map(([value, data]) => ({
      value,
      label: `${data.fromCurrency} → ${data.toCurrency} (${data.destinationCountry})`,
      ...data,
    }));
  }, [rates]);

  const selectedCorridorData = useMemo(
    () => corridors.find((item) => item.value === selectedCorridor) ?? null,
    [corridors, selectedCorridor],
  );

  const amountMinor = selectedCorridorData
    ? amountToMinorUnits(amount, selectedCorridorData.fromCurrency)
    : 0;

  const bestRates = useMemo(() => {
    if (!selectedCorridor) return [];

    const [from, to, country] = selectedCorridor.split("|");
    const filtered = rates.filter(
      (rate) =>
        rate.fromCurrency === from &&
        rate.toCurrency === to &&
        rate.destinationCountry === country,
    );

    return compareRates(filtered, amountMinor);
  }, [rates, selectedCorridor, amountMinor]);

  const topRate = bestRates[0];
  const currencySymbol = selectedCorridorData?.fromCurrency ?? topRate?.fromCurrency ?? "$";
  const dynamicPadding = currencySymbol.length > 1 ? `${currencySymbol.length * 0.7 + 2.5}rem` : "3.5rem";

  return (
    <section className="py-12">
      <div className="relative overflow-hidden rounded-4xl border border-(--border) bg-(--surface) p-8 shadow-(--shadow-xl) md:p-16">
        <div className="absolute right-0 top-0 h-64 w-64 bg-(--primary)/5 blur-[80px] -z-10" />

        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-10">
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full border-(--border) px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-(--primary)">
                Live Network
              </Badge>
              <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-(--foreground) md:text-5xl">
                Check our live corridor rates
              </h2>
              <p className="text-lg font-medium text-(--foreground-muted)">
                Our smart routing engine analyzes fee quality and payout speed across all active anchors.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="px-1 text-xs font-black uppercase tracking-widest text-(--foreground-subtle)" htmlFor="corridor-select">
                  Target Corridor
                </label>
                <select
                  id="corridor-select"
                  value={selectedCorridor}
                  onChange={(e) => setSelectedCorridor(e.target.value)}
                  aria-label="Select a remittance corridor"
                  className="h-16 w-full cursor-pointer rounded-2xl border border-(--border) bg-(--surface-elevated) px-5 text-lg font-bold text-(--foreground) outline-none transition-all focus:ring-2 focus:ring-(--primary)">
                  <option value="">Choose a destination...</option>
                  {corridors.map((corridor) => (
                    <option key={corridor.value} value={corridor.value}>
                      {corridor.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="px-1 text-xs font-black uppercase tracking-widest text-(--foreground-subtle)" htmlFor="amount-input">
                  Amount to Send
                </label>
                <div className="relative">
                  <Input
                    id="amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    aria-label="Amount to send"
                    style={{ paddingLeft: dynamicPadding }}
                    className="h-16 rounded-2xl border border-(--border) bg-(--surface-elevated) pr-6 text-2xl font-black text-(--foreground) focus:ring-2 focus:ring-(--primary)"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black uppercase text-(--foreground-muted)">
                    {selectedCorridorData?.fromCurrency ?? topRate?.fromCurrency ?? "$"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-96">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <LoadingState variant="spinner" />
              </div>
            ) : !selectedCorridor ? (
              <div className="flex h-full flex-col items-center justify-center rounded-4xl border-2 border-dashed border-(--border) bg-(--surface-elevated)/50 p-12 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--primary)/10 text-3xl">
                  📊
                </div>
                <h3 className="text-2xl font-black tracking-tight text-(--foreground)">Selection Required</h3>
                <p className="mt-3 max-w-xs font-medium text-(--foreground-muted)">
                  Choose a destination corridor to see live rates and payout estimates.
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-(--primary) to-(--primary-hover) p-10 text-white shadow-(--shadow-glow)">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <Badge className="border-none bg-white/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
                        Strongest Route
                      </Badge>
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                        Recipient Receives
                      </div>
                      <div className="text-6xl font-black tracking-tighter">
                        {topRate ? formatCurrency(topRate.destinationAmountMinor, topRate.toCurrency) : "—"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                          Anchor Provider
                        </div>
                        <div className="text-xl font-black">{topRate?.anchorName ?? "Top route"}</div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                          Network Rate
                        </div>
                        <div className="text-xl font-black">
                          {topRate ? `1 ${topRate.fromCurrency} = ${topRate.fxRate} ${topRate.toCurrency}` : "Select a corridor"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="px-2 text-xs font-black uppercase tracking-widest text-(--foreground-subtle)">
                    Market Comparison
                  </div>
                  <div className="grid gap-3">
                    {bestRates.slice(1, 4).map((rate, index) => (
                      <div key={index} className="group flex items-center justify-between rounded-3xl border border-(--border) bg-(--surface-elevated) p-5 transition-all hover:border-(--primary)/30">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-sm font-black">
                            {rate.anchorName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-base font-black text-(--foreground)">{rate.anchorName}</div>
                            <div className="text-xs font-bold text-(--foreground-muted)">
                              Fee: {formatCurrency(rate.feeMinor, rate.fromCurrency)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black text-(--foreground)">
                            {formatCurrency(rate.destinationAmountMinor, rate.toCurrency)}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-(--success)">
                            +{topRate ? ((rate.fxRate / topRate.fxRate - 1) * 100).toFixed(2) : "0.00"}% Spread
                          </div>
                        </div>
                      </div>
                    ))}
                    {bestRates.length === 1 && (
                      <div className="rounded-3xl border border-dashed border-(--border) bg-(--surface-elevated) p-4 text-center text-sm font-medium text-(--foreground-muted)">
                        No other routes available for this corridor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
