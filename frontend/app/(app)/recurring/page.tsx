"use client";

import { useMemo, useState } from "react";
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Coins, 
  User, 
  Pause, 
  Play, 
  XSquare,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Globe
} from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAnchorMarketplace } from "@/hooks/useAnchorMarketplace";
import { useRecurringSends } from "@/hooks/useRecurringSends";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import type { RecurringCadence } from "@/types/recurring";

function nextDayIso(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

export default function RecurringPage() {
  const { catalog } = useAnchorMarketplace();
  const {
    plans,
    pendingRuns,
    isLoading,
    error,
    createPlan,
    pausePlan,
    resumePlan,
    cancelPlan,
    confirmRun,
  } = useRecurringSends();

  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [amount, setAmount] = useState("500");
  const [fromCurrency, setFromCurrency] = useState("USDC");
  const [toCurrency, setToCurrency] = useState("COP");
  const [destinationCountry, setDestinationCountry] = useState("CO");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [cadence, setCadence] = useState<RecurringCadence>("weekly");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [nextRunAt, setNextRunAt] = useState(nextDayIso());
  const [anchorId, setAnchorId] = useState("");

  const activeAnchorOptions = useMemo(
    () =>
      catalog
        .filter(
          (item) =>
            item.isActiveForUser &&
            item.anchorId &&
            item.availabilityStatus === "available",
        )
        .map((item) => ({
          value: item.anchorId as string,
          label: `${item.displayName} (${item.countryCode})`,
        })),
    [catalog],
  );

  async function handleCreateRecurring() {
    try {
      setCreateError(null);
      setIsCreating(true);

      await createPlan({
        amount: Number(amount),
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        destinationCountry: destinationCountry.toUpperCase(),
        recipientAddress,
        cadence,
        timezone,
        nextRunAt,
        anchorId: anchorId || undefined,
      });

      setAmount("500");
      setRecipientAddress("");
      setAnchorId("");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create recurring send",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in sm:px-0">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-48 -top-48 h-125 w-125 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-48 -bottom-48 h-125 w-125 rounded-full bg-emerald-500/5 blur-3xl" />
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black uppercase tracking-[0.2em] text-(--primary) italic shadow-sm">
              <Zap className="h-3 w-3" />
              Automation Engine
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-6">
                <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
                  Recurring<br/>Sends
                </h1>
                <p className="max-w-xl text-lg font-medium text-(--foreground-muted) leading-relaxed">
                  Schedule automated cross-border transfers. Review and confirm each cycle via your wallet.
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center h-24 w-24 rounded-3xl bg-(--surface-elevated) border-2 border-(--border) shadow-lg">
                  <span className="text-3xl font-black text-blue-400 leading-none">{plans.length}</span>
                  <span className="text-[9px] font-black text-(--foreground-subtle) uppercase tracking-widest mt-2">Active</span>
                </div>
                <div className="flex flex-col items-center justify-center h-24 w-24 rounded-3xl bg-(--surface-elevated) border-2 border-(--border) shadow-lg">
                  <span className="text-3xl font-black text-emerald-400 leading-none">{pendingRuns.length}</span>
                  <span className="text-[9px] font-black text-(--foreground-subtle) uppercase tracking-widest mt-2">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <Alert variant="error" className="rounded-4xl border-2 border-red-500/30 bg-red-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="font-bold text-red-400">{error}</span>
            </div>
          </Alert>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-12">
            {/* Create Plan Section */}
            <Card className="border-2 border-(--border) bg-(--surface) rounded-4xl overflow-hidden shadow-lg">
              <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <Plus className="h-6 w-6 text-white font-black" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter italic">Setup New Plan</CardTitle>
                    <CardDescription className="font-black text-(--foreground-subtle) uppercase text-[10px] tracking-[0.2em] mt-1">Configure automated schedule</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Send Amount</label>
                    <div className="relative group">
                      <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--foreground-subtle) group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        type="number"
                        min="1"
                        value={amount}
                        className="pl-12 h-14 text-lg font-black rounded-2xl border-2 focus:border-blue-500 transition-all bg-(--surface-elevated)"
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="100.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Recipient Address</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--foreground-subtle) group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        value={recipientAddress}
                        className="pl-12 h-14 font-bold rounded-2xl border-2 focus:border-blue-500 transition-all bg-(--surface-elevated)"
                        onChange={(event) => setRecipientAddress(event.target.value)}
                        placeholder="G..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 text-center md:text-left">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Source Asset</label>
                    <Input value={fromCurrency} className="h-12 font-black text-center uppercase rounded-xl border-2 bg-(--surface-elevated)" onChange={(e) => setFromCurrency(e.target.value)} />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Target Asset</label>
                    <Input value={toCurrency} className="h-12 font-black text-center uppercase rounded-xl border-2 bg-(--surface-elevated)" onChange={(e) => setToCurrency(e.target.value)} />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Country Code</label>
                    <Input value={destinationCountry} className="h-12 font-black text-center uppercase rounded-xl border-2 bg-(--surface-elevated)" onChange={(e) => setDestinationCountry(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Cadence</label>
                    <Select
                      value={cadence}
                      onValueChange={(value) => setCadence(value as RecurringCadence)}
                    >
                      <SelectTrigger className="h-14 font-black rounded-2xl border-2 bg-(--surface-elevated)">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Timezone</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--foreground-subtle)" />
                      <Input value={timezone} className="pl-12 h-14 font-bold rounded-2xl border-2 bg-(--surface-elevated)" onChange={(e) => setTimezone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">First Run</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--foreground-subtle)" />
                      <Input 
                        type="datetime-local" 
                        value={nextRunAt.slice(0, 16)} 
                        className="pl-12 h-14 font-bold rounded-2xl border-2 bg-(--surface-elevated) transition-all cursor-pointer" 
                        onChange={(e) => setNextRunAt(new Date(e.target.value).toISOString())} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Anchor Preference</label>
                  <Select
                    value={anchorId}
                    onValueChange={(value) => setAnchorId(value)}
                  >
                    <SelectTrigger className="h-14 font-black rounded-2xl border-2 bg-(--surface-elevated)">
                      <SelectValue placeholder="Neural Routing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Neural Routing (Fastest & Cheapest)</SelectItem>
                      {activeAnchorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {createError ? (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 animate-in fade-in zoom-in">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-red-600">{createError}</p>
                  </div>
                ) : null}

                <Button 
                  disabled={isCreating} 
                  onClick={() => void handleCreateRecurring()}
                  className="w-full h-16 rounded-2xl bg-blue-500 text-white font-black uppercase italic tracking-widest shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <div className="flex items-center justify-center gap-3">
                    {isCreating ? 
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : 
                      <Zap className="h-5 w-5" />
                    }
                    {isCreating ? "Activating..." : "Activate Plan"}
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* My Plans Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Play className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-black text-(--foreground) tracking-tighter italic uppercase">Active Plans</h3>
                </div>
                <Badge className="font-black text-[10px] px-4 py-1 uppercase tracking-widest border-(--border) bg-(--surface-elevated)">
                  Live Engines
                </Badge>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-4xl border-2 border-dashed border-(--border) bg-(--surface-elevated)/30">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-4" />
                  <p className="font-black text-blue-400/60 uppercase text-xs tracking-widest">Hydrating state...</p>
                </div>
              ) : null}

              {!isLoading && plans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-4xl border-2 border-dashed border-(--border) bg-(--surface-elevated)/30">
                  <div className="h-16 w-16 bg-(--surface-elevated) rounded-full flex items-center justify-center mb-6">
                    <Clock className="h-8 w-8 text-(--foreground-subtle)" />
                  </div>
                  <p className="text-xl font-black text-(--foreground-muted) tracking-tight">No active plans detected.</p>
                  <p className="text-sm font-bold text-(--foreground-muted) mt-1 uppercase tracking-widest px-8 text-center">Your liquidity automation will appear here.</p>
                </div>
              ) : null}

              <div className="grid gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="group relative overflow-hidden rounded-4xl border-2 border-(--border) bg-(--surface-elevated)/50 p-8 transition-all hover:border-(--primary)/30 hover:shadow-lg"
                  >
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className={`flex h-16 w-16 items-center justify-center rounded-3xl shadow-lg transform transition-transform group-hover:scale-110 ${
                          plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          <Zap className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-black text-(--foreground) tracking-tighter uppercase italic line-clamp-1">
                              {plan.fromCurrency} <span className="text-(--foreground-muted) mx-1">→</span> {plan.toCurrency}
                            </h4>
                            <Badge className={`font-black text-[9px] uppercase px-3 py-0.5 border-none shadow-sm ${
                              plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {plan.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-(--foreground-muted)">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs font-black uppercase tracking-widest opacity-70">{plan.destinationCountry} Protocol</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:flex items-center gap-8 md:gap-12 pl-2 md:pl-0">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-[0.15em]">Amount</p>
                          <p className="text-xl font-black text-blue-400 tracking-tight">{formatCurrency(plan.amount, plan.fromCurrency)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-[0.15em]">Next Run</p>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <p className="text-sm font-black text-(--foreground)">{formatDateTime(plan.nextRunAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-(--border)/50">
                        {plan.status === "active" ? (
                          <Button 
                            className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 font-black" 
                            size="sm" 
                            onClick={() => void pausePlan(plan.id)}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        ) : null}
                        {plan.status === "paused" ? (
                          <Button 
                            className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-black" 
                            size="sm" 
                            onClick={() => void resumePlan(plan.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </Button>
                        ) : null}
                        {plan.status !== "cancelled" ? (
                          <Button 
                            className="flex-1 md:flex-none h-12 px-6 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-black" 
                            size="sm" 
                            onClick={() => void cancelPlan(plan.id)}
                          >
                            <XSquare className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            {/* Pending Confirmations Section */}
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black text-(--foreground) tracking-tighter italic uppercase">Pending Confirm</h3>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-24 rounded-3xl bg-(--surface-elevated) border-2 border-(--border)" />
                    ))}
                  </div>
                ) : null}

                {!isLoading && pendingRuns.length === 0 ? (
                  <div className="rounded-4xl border-2 border-dashed border-(--border) p-8 text-center bg-(--surface-elevated)/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-black text-(--foreground-muted) uppercase tracking-widest">All Clear</p>
                    <p className="text-[10px] font-bold text-(--foreground-subtle) mt-1">No pending runs require your signature.</p>
                  </div>
                ) : null}

                {pendingRuns.map((run) => (
                  <div
                    key={run.id}
                    className="relative overflow-hidden group rounded-3xl border-2 border-blue-500/30 bg-(--surface-elevated)/50 p-5 shadow-md transition-all hover:shadow-lg hover:border-blue-500/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Draft Run</p>
                          <p className="text-sm font-black text-(--foreground) tracking-tight">ID: {run.id.slice(0, 8)}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <ChevronRight className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-(--surface)/50 border border-(--border)">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-(--foreground-muted) capitalize">Scheduled</span>
                          <span className="text-(--foreground)">{formatDateTime(run.scheduledFor)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-red-400 capitalize">Expires In</span>
                          <span className="text-red-400 font-black">2h 45m</span>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        onClick={() => void confirmRun(run.id)}
                        className="w-full h-11 rounded-2xl bg-blue-500 text-white font-black shadow-[0_0_15px_rgba(59,130,246,0.3)] transform active:scale-95 transition-all hover:bg-blue-400"
                      >
                        Sign & Execute
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips Section */}
              <div className="p-6 rounded-3xl bg-(--surface-elevated) border-2 border-(--border) shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 mb-4">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <h4 className="text-lg font-black text-(--foreground) tracking-tight mb-2 leading-tight italic uppercase">Neural Sync</h4>
                <p className="text-xs font-bold text-(--foreground-muted) leading-relaxed uppercase tracking-[0.15em]">
                  RemitFlow automatically selects the most capital-efficient anchor at execution time.
                </p>
                <div className="mt-6 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Global Engine Ready</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </RequireSession>
  );
}
