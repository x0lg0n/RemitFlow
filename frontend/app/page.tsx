"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Globe2, History, Send, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRates } from "@/hooks/useRates";
import { useSession } from "@/hooks/useSession";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";
import { compareRates } from "@/lib/rates";
import { LoadingState } from "@/components/shared/LoadingState";

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
  const { transactions, isLoading: txLoading } = useTransactions();

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

  const stats = useMemo(() => {
    const completedTxs = transactions.filter((tx) => tx.status === "completed");
    const totalSent = completedTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSaved = completedTxs.length * 500; // Mock saving $5 per transaction (in minor units)

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
      {/* Welcome Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface)] to-[var(--background-deep)] p-8 shadow-[var(--shadow-lg)]">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-[var(--primary)]/10 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--foreground)]">
                Welcome back
              </h1>
              <p className="text-lg text-[var(--foreground-muted)]">
                Ready to send money with the best rates?
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-[var(--shadow-glow)]">
                <Wallet className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--foreground)]">
                  {formatAddress(session?.walletAddress)}
                </div>
                <div className="text-xs text-[var(--foreground-subtle)] uppercase tracking-wider font-semibold">
                  {session?.role} Account
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/send">
              <Button size="lg" className="group h-12 px-8 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl" aria-label="Start a new transfer">
                <Send className="mr-2 h-5 w-5" />
                Send Money
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/corridors">
              <Button variant="secondary" size="lg" className="h-12 px-8 rounded-xl" aria-label="View all remittance corridors">
                <Globe2 className="mr-2 h-5 w-5" />
                Corridors
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="secondary" size="lg" className="h-12 px-8 rounded-xl" aria-label="View transaction history">
                <History className="mr-2 h-5 w-5" />
                History
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Corridors", value: stats.activeCorridors, icon: Globe2, color: "var(--primary)" },
          { label: "Total Sent", value: formatCurrency(stats.totalSent, "USD"), icon: BarChart3, color: "var(--accent)" },
          { label: "Transactions", value: stats.txCount, icon: History, color: "var(--primary)" },
          { label: "Total Saved", value: formatCurrency(stats.totalSaved, "USD"), icon: Send, color: "var(--success)" },
        ].map((item, i) => (
          <Card key={i} className="p-6 border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10" style={{ color: item.color }}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-[var(--foreground)]">{item.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--foreground-subtle)]">{item.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Quick Rate Comparison */}
      <PublicLandingPageContent />
    </div>
  );
}

// Public Landing Page - Non-authenticated View
function PublicLandingPage() {
  const benefits = [
    {
      title: "Smart Routing",
      description: "Find the cheapest Stellar anchor corridors automatically with our real-time score engine.",
      icon: "🚀"
    },
    {
      title: "Secure & Transparent",
      description: "Wallet-based authentication via SEP-10 ensures every transfer is safe and verifiable.",
      icon: "🛡️"
    },
    {
      title: "Faster Settlement",
      description: "Leverage Stellar's sub-second finality for near-instant cross-border payments.",
      icon: "🤝"
    },
  ];

  const uniqueFeatures = [
    {
      title: "Score Scoring",
      description: "Ranks anchors by effective payout, fee quality, and corridor reliability."
    },
    {
      title: "Fee Math",
      description: "Shows source amount, fee, FX conversion, and recipient amount before you send."
    },
    {
      title: "Wallet-native",
      description: "Uses SEP-10 challenge signing so you authenticate without insecure passwords."
    },
    {
      title: "Live Coverage",
      description: "Continuously tracks active remittance corridors across supported anchors."
    },
  ];

  return (
    <div className="space-y-20 animate-fade-in py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--background)] to-[var(--background-deep)] p-8 md:p-16 shadow-[var(--shadow-xl)]">
        <div className="absolute top-0 right-0 -mt-24 -mr-24 h-96 w-96 rounded-full bg-[var(--primary)]/5 blur-[100px]" />
        
        <div className="relative grid items-center gap-12 lg:grid-cols-2">

          <div className="space-y-8">
            <Badge variant="secondary" className="rounded-full border-[var(--border)] px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold text-[var(--primary)]">
              Modern Remittance Engine
            </Badge>

            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-tight text-[var(--foreground)] md:text-7xl lg:text-8xl tracking-tight">
                Global payments, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">smarter.</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-[var(--foreground-muted)] font-medium">
                Route your cross-border payouts through the strongest Stellar corridors. 
                Save up to 5% on fees with real-time smart routing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-10 rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-[var(--shadow-glow)] font-bold text-lg" aria-label="Get started with RemitFlow">
                  Start Sending
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/corridors">
                <Button variant="ghost" size="lg" className="h-14 px-10 rounded-2xl border border-[var(--border)] font-bold text-lg hover:bg-[var(--surface-elevated)]" aria-label="View live corridor rates">
                  View Rates
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="space-y-1">
                <div className="text-3xl font-black text-[var(--foreground)]">80%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-subtle)]">Cheaper Fees</div>
              </div>
              <div className="h-10 w-px bg-[var(--border)]" />
              <div className="space-y-1">
                <div className="text-3xl font-black text-[var(--foreground)]">24/7</div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-subtle)]">Live Routing</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
             <div className="relative z-10 rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-8 shadow-2xl overflow-hidden group">
               {/* Animated background highlights */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30" />
               
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-[var(--shadow-glow)] flex items-center justify-center">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Active Route</div>
                        <div className="text-[10px] text-[var(--primary)] font-mono flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                          STLR-SES-942
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--primary)]/5 text-[10px] font-black uppercase">
                      Optimizing
                    </Badge>
                 </div>

                 <div className="space-y-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5 group-hover:border-[var(--primary)]/30 transition-all duration-500 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[var(--foreground-subtle)]">
                      <span>Engine Path</span>
                      <span className="text-[var(--primary)]">98% Efficient</span>
                    </div>

                    <div className="relative pt-2 pb-1">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                          <div className="text-xl font-black text-[var(--foreground)] tracking-tight">USD</div>
                          <div className="text-[9px] text-[var(--foreground-muted)] font-bold uppercase">Source</div>
                        </div>
                        <div className="flex-1 px-4 flex flex-col items-center">
                           <div className="w-full h-1.5 bg-[var(--border)] rounded-full relative overflow-hidden">
                              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] w-3/4 transition-all duration-700" />
                           </div>
                           <Globe2 className="h-4 w-4 mt-2 text-[var(--primary)] animate-pulse" />
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-[var(--foreground)] tracking-tight">EUR</div>
                          <div className="text-[9px] text-[var(--foreground-muted)] font-bold uppercase">Target</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-(--border) flex justify-between items-end">
                       <div className="space-y-1">
                         <div className="text-[9px] font-bold text-(--foreground-muted) uppercase tracking-wider">Est. Final Payout</div>
                         <div className="text-3xl font-black text-(--foreground) tracking-tighter">€942.15</div>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                         <div className="h-6 w-20 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                           +5.2% SAVED
                         </div>
                         <div className="text-[12px] text-(--foreground-subtle) font-mono">ID: 0x48...f2</div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-(--surface) border border-(--border) flex flex-col gap-1 hover:border-(--primary)/30 transition-colors shadow-sm">
                      <div className="text-[9px] font-black text-(--foreground-muted) uppercase tracking-tight">Network Fee</div>
                      <div className="text-[14px] font-black text-(--primary)">$0.45</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[--(--surface)] border border-(--border) flex flex-col gap-1 hover:border-var(--primary)/30 transition-colors shadow-sm">
                      <div className="text-[9px] font-black text-(--foreground-muted) uppercase tracking-tight">Settlement</div>
                      <div className="text-[14px] font-black text-(--accent)">~3.5s</div>
                    </div>
                 </div>

                 <div className="pt-2">
                    <div className="w-full h-12 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--foreground-muted)] text-[10px] font-black tracking-widest uppercase">
                       <div className="h-2 w-2 rounded-full bg-[var(--primary)] mr-3 animate-ping" />
                       Syncing Stellar RPC Nodes
                    </div>
                 </div>
               </div>
             </div>
             
             {/* Dynamic Floating Elements */}
             <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-[var(--primary)]/5 blur-[80px] animate-pulse" />
             <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-[var(--accent)]/5 blur-[100px]" />
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="grid gap-8 md:grid-cols-3">
        {benefits.map((benefit, i) => (
          <Card key={i} className="p-8 border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/20 transition-all shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] rounded-3xl">
            <div className="space-y-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-3xl">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                  {benefit.title}
                </h3>
                <p className="text-base leading-relaxed text-[var(--foreground-muted)] font-medium">
                  {benefit.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Rate Preview */}
      <PublicLandingPageContent />

      {/* Why Us */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-[var(--foreground)] md:text-5xl tracking-tight">
              Built for <span className="text-[var(--primary)]">performance.</span>
            </h2>
            <p className="text-lg text-[var(--foreground-muted)] font-medium">
              Enterprise-grade routing features for the modern web.
            </p>
          </div>
          <Link href="/corridors">
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold border-[var(--border)] hover:bg-[var(--surface-elevated)]">
              Explore Network
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {uniqueFeatures.map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/20 transition-all shadow-[var(--shadow-sm)]">
              <h4 className="text-lg font-black text-[var(--foreground)] mb-3">{feature.title}</h4>
              <p className="text-sm leading-relaxed text-[var(--foreground-muted)] font-medium">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-[3rem] bg-[var(--foreground)] p-12 md:p-20 text-center text-[var(--background)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[var(--primary)]/5 opacity-10" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-10">
          <h2 className="text-5xl font-black md:text-7xl tracking-tighter leading-[0.9]">
            Ready to optimize your global payouts?
          </h2>
          <p className="text-xl font-medium opacity-70">
            Join the RemitFlow network today and start routing through the strongest corridors on Stellar.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/login">
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-[var(--background)] text-[var(--foreground)] hover:opacity-90 font-black text-xl shadow-2xl" aria-label="Create an account">
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

  const bestRates = useMemo(() => {
    if (!selectedCorridor) return [];
    const [from, to, country] = selectedCorridor.split("|");
    const filtered = rates.filter(
      (r) =>
        r.fromCurrency === from &&
        r.toCurrency === to &&
        r.destinationCountry === country,
    );
    return [...filtered].sort(compareRates);
  }, [rates, selectedCorridor]);

  const topRate = bestRates[0];
  const currencySymbol = topRate?.fromCurrency || "$";
  const dynamicPadding = currencySymbol.length > 1 ? `${currencySymbol.length * 0.7 + 2.5}rem` : "3.5rem";

  return (
    <section className="py-12">
      <div className="rounded-[3rem] border border-[var(--border)] bg-[var(--surface)] p-8 md:p-16 shadow-[var(--shadow-xl)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[80px] -z-10" />
        
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-10">
            <div className="space-y-4">
              <Badge variant="outline" className="border-[var(--primary)]/30 text-[var(--primary)] font-bold">Live Network</Badge>
              <h2 className="text-4xl font-black text-[var(--foreground)] md:text-5xl tracking-tight leading-[1.1]">
                Check our live corridor rates
              </h2>
              <p className="text-lg text-[var(--foreground-muted)] font-medium">
                Our smart routing engine analyzes fee quality and payout speed across all active anchors.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-[var(--foreground-subtle)] uppercase tracking-widest px-1" htmlFor="corridor-select">
                  Target Corridor
                </label>
                <select
                  id="corridor-select"
                  className="w-full h-16 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 text-lg font-bold text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all cursor-pointer"
                  value={selectedCorridor}
                  onChange={(e) => setSelectedCorridor(e.target.value)}
                  aria-label="Select a remittance corridor">
                  <option value="">Choose a destination...</option>
                  {corridors.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[var(--foreground-subtle)] uppercase tracking-widest px-1" htmlFor="amount-input">
                  Amount to Send
                </label>
                <div className="relative">
                  <Input
                    id="amount-input"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-16 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] pr-6 text-2xl font-black text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                    style={{ paddingLeft: dynamicPadding }}
                    placeholder="1000"
                    aria-label="Amount to send"
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-[var(--foreground-muted)] uppercase">
                    {topRate?.fromCurrency || "$"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-100">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                 <LoadingState variant="spinner" />
              </div>
            ) : !selectedCorridor ? (
              <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)] p-12 text-center bg-white/5">
                <div className="mb-6 h-16 w-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-3xl">📊</div>
                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight">
                  Selection Required
                </h3>
                <p className="mt-3 text-[var(--foreground-muted)] font-medium max-w-xs">
                  Choose a destination corridor to see live rates and payout estimates.
                </p>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] p-10 text-white shadow-[var(--shadow-glow)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">
                        Strongest Route
                      </Badge>
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-[0.2em] font-bold text-white/60">
                        Recipient Receives
                      </div>
                      <div className="text-6xl font-black tracking-tighter">
                        {formatCurrency(
                          (parseFloat(amount) - topRate.feeFixed) *
                            topRate.exchangeRate,
                          topRate.toCurrency,
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-1">
                          Anchor Provider
                        </div>
                        <div className="text-xl font-black">{topRate.anchorName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-white/50 mb-1">
                          Network Rate
                        </div>
                        <div className="text-xl font-black">
                          1 {topRate.fromCurrency} = {topRate.exchangeRate}{" "}
                          {topRate.toCurrency}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-widest text-[var(--foreground-subtle)] px-2">
                    Market Comparison
                  </div>
                  <div className="grid gap-3">
                    {bestRates.slice(1, 4).map((rate, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 hover:border-[var(--primary)]/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-[var(--surface)] flex items-center justify-center text-sm font-black border border-[var(--border)]">
                            {rate.anchorName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-base font-black text-[var(--foreground)]">
                              {rate.anchorName}
                            </div>
                            <div className="text-xs font-bold text-[var(--foreground-muted)]">
                              Fee: {formatCurrency(rate.feeFixed, rate.fromCurrency)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black text-[var(--foreground)]">
                            {formatCurrency(
                              (parseFloat(amount) - rate.feeFixed) *
                                rate.exchangeRate,
                              rate.toCurrency,
                            )}
                          </div>
                          <div className="text-[10px] text-[var(--success)] font-black uppercase tracking-widest">
                            +{((rate.exchangeRate / topRate.exchangeRate - 1) * 100).toFixed(2)}% Spread
                          </div>
                        </div>
                      </div>
                    ))}
                    {bestRates.length === 1 && (
                      <div className="p-4 text-center text-sm font-medium text-[var(--foreground-muted)] bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] border-dashed">
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
