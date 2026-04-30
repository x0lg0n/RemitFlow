"use client";

import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAnchorDashboard } from "@/hooks/useAnchorDashboard";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function AnchorDashboardPage() {
  const { data, isLoading, error } = useAnchorDashboard();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
      case "pending":
        return "text-amber-500 border-amber-500/20 bg-amber-500/5";
      case "failed":
        return "text-rose-500 border-rose-500/20 bg-rose-500/5";
      default:
        return "text-slate-500 border-slate-500/20 bg-slate-500/5";
    }
  };

  return (
    <RequireSession allowedRoles={["anchor", "admin"]}>
      <div className="space-y-8 animate-fade-in pb-12 sm:px-0 px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent italic uppercase">
              Core Analytics
            </h1>
            <p className="text-lg text-(--foreground-muted) font-medium tracking-tight">
              Real-time performance metrics & settlement oversight.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 rounded-3xl px-6 border-(--border) hover:bg-(--surface-elevated) hover:text-(--foreground) transition-all duration-300 font-bold tracking-tight">
              <Download className="mr-2 h-4 w-4" />
              Dataset Export
            </Button>
            <Button
              size="lg"
              className="h-12 rounded-3xl px-6 bg-(--foreground) text-(--background) hover:scale-105 transition-all duration-300 font-black tracking-tighter uppercase italic group">
              <Filter className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              Filters
            </Button>
          </div>
        </div>

        {error ?
          <Alert variant="error">{error}</Alert>
        : null}
        {isLoading ?
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-[2.5rem] animate-pulse bg-(--surface-elevated) border border-(--border)"
              />
            ))}
          </div>
        : null}

        {data ?
          <>
            {/* KPI Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: "Gross Settlement",
                  value: formatCurrency(data.kpis.totalVolume, "USDC"),
                  change: data.kpis.weeklyVolumeChangePct,
                  icon: BarChart3,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  glow: "shadow-[0_0_40px_-10px_rgba(96,165,250,0.3)]",
                },
                {
                  label: "Total Transactions",
                  value: data.kpis.totalTransactions.toLocaleString(),
                  change: data.kpis.weeklyTransactionsChangePct,
                  icon: Activity,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                  glow: "shadow-[0_0_40px_-10px_rgba(52,211,153,0.3)]",
                },
                {
                  label: "Operator Yield",
                  value: formatCurrency(data.kpis.revenue, "USDC"),
                  change: data.kpis.weeklyRevenueChangePct,
                  icon: DollarSign,
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  glow: "shadow-[0_0_40px_-10px_rgba(192,132,252,0.3)]",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-8 transition-all duration-500 hover:border-(--primary)/30 hover:-translate-y-1 group",
                    item.glow,
                  )}>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={cn(
                        "p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                        item.bg,
                        item.color,
                      )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black italic tracking-tighter uppercase",
                        item.change >= 0 ?
                          "bg-emerald-400/10 text-emerald-400"
                        : "bg-rose-400/10 text-rose-400",
                      )}>
                      {item.change >= 0 ?
                        <TrendingUp className="h-3 w-3" />
                      : <Activity className="h-3 w-3 rotate-180" />}
                      {item.change >= 0 ? "+" : ""}
                      {item.change}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-(--foreground-subtle) uppercase tracking-[0.2em]">
                      {item.label}
                    </p>
                    <p className="text-4xl font-black text-(--foreground) tracking-tighter italic">
                      {item.value}
                    </p>
                  </div>
                  <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-linear-to-br from-transparent to-(--foreground) opacity-[0.03] blur-3xl" />
                </div>
              ))}
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
              {/* Trends Chart */}
              <Card className="lg:col-span-2 rounded-[2.5rem] border border-(--border) bg-(--surface) overflow-hidden shadow-2xl">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 p-8">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">
                      Institutional Growth
                    </CardTitle>
                    <CardDescription className="text-(--foreground-muted) font-medium">
                      14-day aggregate market movement
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border)">
                      <div className="h-2 w-2 rounded-full bg-(--primary) shadow-[0_0_8px_var(--primary)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-(--foreground)">
                        Volume
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-2 sm:px-8 pb-8">
                  <div className="h-87.5 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trends}>
                        <defs>
                          <linearGradient
                            id="colorVolume"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1">
                            <stop
                              offset="5%"
                              stopColor="var(--primary)"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--primary)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.03)"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="var(--foreground-muted)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontWeight: 800, letterSpacing: "0.05em" }}
                          tickFormatter={(value) =>
                            new Date(value)
                              .toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                              .toUpperCase()
                          }
                          dy={10}
                        />
                        <YAxis
                          stroke="var(--foreground-muted)"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontWeight: 800 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                          cursor={{
                            stroke: "var(--primary)",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                          }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-(--surface-elevated) border border-(--border) p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-(--foreground-muted) mb-2">
                                    {new Date(
                                      payload[0].payload.date,
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                  <p className="text-xl font-black italic tracking-tighter text-(--foreground)">
                                    ${payload[0].value?.toLocaleString()}
                                  </p>
                                  <p className="text-[10px] font-bold text-(--primary) uppercase mt-1">
                                    Settlement Volume
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="var(--primary)"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorVolume)"
                          animationDuration={2000}
                          animationEasing="ease-in-out"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions / Recent Activity Sidecard */}
              <Card className="rounded-[2.5rem] border border-(--border) bg-(--surface) shadow-xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">
                    Network Health
                  </CardTitle>
                  <CardDescription className="text-(--foreground-muted) font-medium">
                    Real-time status diagnostics
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        label: "API Availability",
                        value: "99.9%",
                        status: "success",
                      },
                      {
                        label: "Settlement Speed",
                        value: "2.4s",
                        status: "success",
                      },
                      {
                        label: "Trustline Status",
                        value: "Active",
                        status: "success",
                      },
                      {
                        label: "Liquidity Score",
                        value: "High",
                        status: "info",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-2xl bg-(--surface-elevated)/50 border border-(--border) group transition-all duration-300 hover:border-(--primary)/20">
                        <span className="text-xs font-black uppercase tracking-widest text-(--foreground-subtle)">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-(--foreground) italic tracking-tight">
                            {item.value}
                          </span>
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              item.status === "success" ?
                                "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                              : "bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.6)]",
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full h-14 rounded-2xl border-(--border) hover:bg-(--surface-elevated) hover:text-(--foreground) transition-all duration-300 font-black tracking-tighter uppercase italic">
                      Performance Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions Table */}
            <Card className="rounded-[2.5rem] border border-(--border) bg-(--surface) overflow-hidden shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">
                    Settlement Ledger
                  </CardTitle>
                  <CardDescription className="text-(--foreground-muted) font-medium">
                    Comprehensive audit log of recent network activity
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  className="text-(--primary) hover:bg-(--primary)/10 font-black tracking-tighter uppercase italic">
                  View Data Lake
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <thead className="bg-(--surface-elevated)/50">
                      <tr className="border-b border-(--border) hover:bg-transparent">
                        <TableHead className="w-56 font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] pl-8 py-5">
                          Event Timestamp
                        </TableHead>
                        <TableHead className="font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] py-5">
                          Reference Hash
                        </TableHead>
                        <TableHead className="font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] py-5">
                          Volume
                        </TableHead>
                        <TableHead className="font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] py-5">
                          Protocol Fee
                        </TableHead>
                        <TableHead className="font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] py-5">
                          Currency Pair
                        </TableHead>
                        <TableHead className="font-black text-(--foreground-subtle) uppercase tracking-[0.2em] text-[10px] pr-8 text-right py-5">
                          System Status
                        </TableHead>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border)">
                      {data.recentTransactions.map((tx) => (
                        <TableRow
                          key={tx.id}
                          className="border-none hover:bg-(--surface-elevated)/40 transition-all duration-300">
                          <TableCell className="pl-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-(--foreground) italic tracking-tighter text-base">
                                {new Date(tx.createdAt)
                                  .toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                  .toUpperCase()}
                              </span>
                              <span className="text-[10px] font-bold text-(--foreground-subtle) uppercase tracking-widest mt-0.5">
                                {new Date(tx.createdAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <code className="px-3 py-1.5 rounded-lg bg-(--surface-elevated) border border-(--border) text-[11px] font-black text-(--foreground-subtle) tracking-widest">
                              {tx.id.slice(0, 12).toUpperCase()}
                            </code>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="text-lg font-black text-(--foreground) italic tracking-tighter">
                              {formatCurrency(tx.amount, tx.fromCurrency)}
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            <span className="text-sm text-(--foreground-muted) font-bold tabular-nums">
                              {formatCurrency(tx.fee, tx.fromCurrency)}
                            </span>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-3">
                              <div className="px-3 py-1 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black text-(--foreground) italic tracking-tighter uppercase">
                                {tx.fromCurrency}
                              </div>
                              <ArrowUpRight className="h-4 w-4 text-(--primary) opacity-50" />
                              <div className="px-3 py-1 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black text-(--foreground) italic tracking-tighter uppercase">
                                {tx.toCurrency}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="pr-8 text-right py-6">
                            <span
                              className={cn(
                                "inline-flex items-center px-4 py-1.5 rounded-full border text-[10px] font-black uppercase italic tracking-tighter shadow-sm",
                                getStatusColor(tx.status),
                              )}>
                              <div
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full mr-2",
                                  tx.status === "completed" ? "bg-emerald-400"
                                  : tx.status === "pending" ? "bg-amber-400"
                                  : "bg-rose-400",
                                )}
                              />
                              {tx.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        : null}
      </div>
    </RequireSession>
  );
}
