"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  TrendingUp, 
  Activity, 
  Globe, 
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { RequireSession } from "@/components/shared/RequireSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAnchorMarketplace } from "@/hooks/useAnchorMarketplace";
import { useRates } from "@/hooks/useRates";
import { useRecurringSends } from "@/hooks/useRecurringSends";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const { rates, isLoading: ratesLoading } = useRates();
  const { transactions, isLoading: txLoading } = useTransactions(1, 100);
  const { catalog } = useAnchorMarketplace();
  const { pendingRuns } = useRecurringSends();

  // Process data for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayTotal = (transactions || [])
      .filter(tx => tx.createdAt.startsWith(date) && tx.status === "completed")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    return {
      name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      volume: dayTotal
    };
  });

  const totalVolume = (transactions || []).reduce((sum, tx) => sum + (tx.status === "completed" ? Number(tx.amount) : 0), 0);
  const pendingCount = (transactions || []).filter((tx) => tx.status === "pending" || tx.status === "processing").length;
  const activeAnchorCount = catalog.filter((item) => item.isActiveForUser).length;
  const feesSaved = totalVolume * 0.035; // 3.5% saving estimate

  return (
    <RequireSession>
      <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 animate-fade-in">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[10px] uppercase px-4 py-1.5 tracking-widest">
                Mainnet Live
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-(--foreground-subtle) tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Network Synchronized
              </div>
            </div>
            <h1 className="text-5xl font-black text-(--foreground) tracking-tight leading-[0.9] uppercase italic">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/send">
              <Button className="bg-(--foreground) text-(--background) hover:bg-(--foreground)/90 rounded-2xl font-black uppercase text-[10px] tracking-widest h-14 px-8 shadow-(--shadow-glow) shadow-black/10 border-none transition-all hover:scale-105 active:scale-95">
                Quick Send
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden group hover:shadow-(--shadow-lg) transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-(--shadow-glow) shadow-blue-500/20 mb-6 transform group-hover:rotate-6 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-1">Total Sent</div>
              <div className="text-4xl font-black text-(--foreground) tracking-tighter mb-2">
                {txLoading ? "..." : `$${totalVolume.toLocaleString()}`}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase italic">
                <ArrowUpRight className="h-3 w-3" />
                Live Settlement
              </div>
            </CardContent>
          </Card>

          <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden group hover:shadow-(--shadow-lg) transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-(--shadow-glow) shadow-emerald-500/20 mb-6 transform group-hover:-rotate-6 transition-transform">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-1">Fees Saved</div>
              <div className="text-4xl font-black text-emerald-500 tracking-tighter mb-2">
                {txLoading ? "..." : `$${feesSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </div>
              <div className="text-[10px] font-black text-emerald-500/60 uppercase italic">
                vs. Traditional Rails
              </div>
            </CardContent>
          </Card>

          <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden group hover:shadow-(--shadow-lg) transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-(--shadow-glow) shadow-indigo-500/20 mb-6 transform group-hover:rotate-12 transition-transform">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-1">Active Routes</div>
              <div className="text-4xl font-black text-(--foreground) tracking-tighter mb-2">
                {ratesLoading ? "..." : (rates?.length || 0)}
              </div>
              <div className="text-[10px] font-black text-(--foreground-subtle) uppercase italic">
                {activeAnchorCount} Anchors Active
              </div>
            </CardContent>
          </Card>

          <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden group hover:shadow-(--shadow-lg) transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-(--shadow-glow) shadow-amber-500/20 mb-6 transform group-hover:-rotate-12 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-1">In Progress</div>
              <div className="text-4xl font-black text-amber-500 tracking-tighter mb-2">
                {txLoading ? "..." : pendingCount}
              </div>
              <div className="text-[10px] font-black text-amber-500/60 uppercase italic">
                Settling Now
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart Area */}
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden">
            <CardHeader className="p-10 pb-0">
               <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase">Volume Engine</CardTitle>
                  <CardDescription className="font-bold text-(--foreground-subtle) uppercase text-[10px] tracking-widest mt-1">
                    7-Day network velocity
                  </CardDescription>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-(--surface-elevated) border border-(--border)">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
               </div>
            </CardHeader>
            <CardContent className="p-10 pt-10">
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--foreground-subtle)' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: 'var(--foreground-subtle)' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: '1px solid var(--border)', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorVolume)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <div className="space-y-8">
            <Card className="border-(--border) bg-gray-50/50 rounded-4xl overflow-hidden shadow-sm">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black tracking-tight uppercase">Control Center</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-3">
                <Link href="/history" className="block">
                  <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl px-6 font-bold hover:bg-white border-2 border-transparent hover:border-(--border) group transition-all">
                    <span>Transaction History</span>
                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-blue-500" />
                  </Button>
                </Link>
                <Link href="/corridors" className="block">
                  <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl px-6 font-bold hover:bg-white border-2 border-transparent hover:border-(--border) group transition-all">
                    <div className="flex items-center gap-2">
                       <Globe className="h-4 w-4 text-emerald-500" />
                       <span>Network Corridors</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-blue-500" />
                  </Button>
                </Link>
                <Link href="/recurring" className="block">
                  <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl px-6 font-bold hover:bg-white border-2 border-transparent hover:border-(--border) group transition-all">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 text-blue-500" />
                       <span>Recurring Sends</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-blue-500" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="p-8 rounded-4xl bg-linear-to-br from-indigo-600 to-blue-600 text-white shadow-(--shadow-glow) shadow-indigo-500/20 group hover:scale-[1.02] transition-transform duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-6 transform group-hover:rotate-12 transition-transform">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-black tracking-tight mb-3 leading-tight uppercase">Network Secure</h4>
              <p className="text-sm font-bold text-white/80 leading-relaxed mb-6 italic">
                All settlements verified on the Stellar ledger via SEP-31 protocols. High velocity cross-border engine.
              </p>
              <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-full bg-white animate-shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ledger Activity */}
        <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden">
          <CardHeader className="p-10 border-b border-(--border)/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase">Recent Ledger Activity</CardTitle>
                <CardDescription className="font-bold text-(--foreground-subtle) uppercase text-[10px] tracking-widest mt-1">
                  Live account settlement stream
                </CardDescription>
              </div>
              <Link href="/history">
                <Button variant="secondary" className="rounded-xl font-bold uppercase text-[10px] tracking-widest px-6 hover:bg-(--surface-elevated) transition-all">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            {txLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-(--surface-elevated)" />
                ))}
              </div>
            ) : (transactions || []).length === 0 ? (
              <div className="text-center py-20 bg-(--surface-elevated) rounded-3xl border-2 border-dashed border-(--border)">
                 <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                    <Activity className="h-8 w-8 text-(--foreground-subtle)" />
                 </div>
                 <p className="text-[10px] font-black text-(--foreground-subtle) uppercase tracking-[0.2em]">No transactions recorded yet</p>
                 <Link href="/send" className="block mt-4">
                   <Button variant="ghost" className="text-blue-500 font-bold uppercase text-[10px] tracking-widest">
                     Start Sending <ArrowRight className="ml-2 h-3 w-3" />
                   </Button>
                 </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(transactions || []).slice(0, 5).map((tx) => (
                  <div key={tx.id} className="group relative flex items-center justify-between p-6 rounded-2xl bg-(--surface-elevated) border border-(--border) transition-all hover:bg-white hover:border-blue-500/30 hover:shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-black text-xs ${
                        tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : 
                        tx.status === "failed" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600 animate-pulse"
                      }`}>
                        {tx.fromCurrency}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-(--foreground) tracking-tight">
                            {tx.fromCurrency} → {tx.toCurrency}
                          </span>
                          <Badge className={`border-none font-black text-[8px] uppercase tracking-tighter px-2 h-4 ${
                            tx.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : 
                            tx.status === "failed" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="text-[10px] font-bold text-(--foreground-subtle) uppercase mt-0.5 font-mono">
                          ID: {tx.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-(--foreground) tracking-tight">
                        {tx.status === "completed" ? "+" : ""}{formatCurrency(Number(tx.amount) + Number(tx.fee), tx.fromCurrency)}
                      </div>
                      <div className="text-[10px] font-black text-(--foreground-subtle) uppercase mt-0.5 italic">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
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
