"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, TrendingUp, Wallet } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireSession } from "@/components/shared/RequireSession";
import { useRates } from "@/hooks/useRates";
import { useTransactions } from "@/hooks/useTransactions";
import { amountToMinorUnits, formatCurrency, formatNumber } from "@/lib/currency";
import { compareRates } from "@/lib/rates";
import { cn } from "@/lib/utils";

export default function SendPage() {
  const router = useRouter();
  const { rates, isLoading: ratesLoading } = useRates();
  const { submit, error: txError } = useTransactions();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountInput, setAmountInput] = useState("500");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedCorridor, setSelectedCorridor] = useState("");
  const [selectedAnchorId, setSelectedAnchorId] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const corridors = useMemo(() => {
    const map = new Map<string, { fromCurrency: string; toCurrency: string; destinationCountry: string }>();

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

  const selectedCorridorData = useMemo(
    () => corridors.find((item) => item.value === activeCorridorValue) ?? null,
    [activeCorridorValue, corridors]
  );

  const amountMinor = selectedCorridorData
    ? amountToMinorUnits(amountInput, selectedCorridorData.fromCurrency)
    : 0;

  const corridorRates = useMemo(() => {
    if (!selectedCorridorData) return [];

    return rates.filter(
      (rate) =>
        rate.fromCurrency === selectedCorridorData.fromCurrency &&
        rate.toCurrency === selectedCorridorData.toCurrency &&
        rate.destinationCountry === selectedCorridorData.destinationCountry
    );
  }, [rates, selectedCorridorData]);

  const compared = useMemo(() => compareRates(corridorRates, amountMinor), [corridorRates, amountMinor]);
  const activeAnchorId = selectedAnchorId || compared[0]?.anchorId || "";
  const selectedRoute = useMemo(
    () => compared.find((route) => route.anchorId === activeAnchorId) ?? compared[0] ?? null,
    [activeAnchorId, compared]
  );

  const canContinueStep1 = amountMinor > 0 && recipientAddress.length > 0 && Boolean(selectedCorridorData);

  async function handleConfirmSend() {
    if (!selectedRoute || !selectedCorridorData) {
      setFormError("Please select a valid route before confirming.");
      return;
    }

    try {
      setFormError(null);
      const transaction = await submit({
        anchorId: selectedRoute.anchorId,
        amount: amountMinor,
        fromCurrency: selectedCorridorData.fromCurrency,
        toCurrency: selectedCorridorData.toCurrency,
        destinationCountry: selectedCorridorData.destinationCountry,
        recipientAddress,
        recipientInfo: recipientName ? { name: recipientName } : undefined,
      });

      router.push(`/send/confirm?txId=${transaction.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit transaction");
    }
  }

  const StepIndicator = ({ number, label, completed, active }: { number: number; label: string; completed: boolean; active: boolean }) => (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg transition-all",
        active 
          ? "bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.8)]" 
          : completed 
          ? "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400"
          : "bg-(--surface-elevated) border-2 border-(--border) text-(--foreground-muted)"
      )}>
        {completed ? <Check className="h-5 w-5" /> : number}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">{label}</span>
    </div>
  );

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in sm:px-0">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-48 -top-48 h-125 w-125 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-48 -bottom-48 h-125 w-125 rounded-full bg-emerald-500/5 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black uppercase tracking-[0.2em] text-(--primary) italic shadow-sm">
              <Wallet className="h-3 w-3" />
              Cross-Border Transfer
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
              Send<br/>Money
            </h1>
            <p className="max-w-xl text-lg font-medium text-(--foreground-muted) mt-6 leading-relaxed">
              Route your remittance through the cheapest anchor pair and save 3–5% on fees.
            </p>
          </div>
        </div>

        {txError ? <Alert variant="error">{txError}</Alert> : null}
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        {/* Step Indicator */}
        <div className="flex justify-between px-6 md:px-0">
          <StepIndicator number={1} label="Details" completed={step > 1} active={step === 1} />
          <div className={cn(
            "my-6 h-0.5 flex-1 mx-4",
            step >= 2 ? "bg-emerald-500" : "bg-(--border)"
          )} />
          <StepIndicator number={2} label="Route" completed={step > 2} active={step === 2} />
          <div className={cn(
            "my-6 h-0.5 flex-1 mx-4",
            step >= 3 ? "bg-emerald-500" : "bg-(--border)"
          )} />
          <StepIndicator number={3} label="Confirm" completed={false} active={step === 3} />
        </div>

        {/* Card */}
        <Card className="border-(--border) bg-(--surface) rounded-[2.5rem] overflow-hidden transition-all duration-500">
          <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase italic">
                  {step === 1 ? "Recipient Details" : step === 2 ? "Choose Route" : "Confirm Transfer"}
                </CardTitle>
                <CardDescription className="font-medium text-(--foreground-muted) uppercase text-[10px] tracking-[0.2em] mt-2">
                  {step === 1
                    ? "Enter amount, corridor, and recipient information"
                    : step === 2
                    ? "Select the best rate for your transfer"
                    : "Review and finalize your transaction"}
                </CardDescription>
              </div>
              <Badge className="border-(--border) bg-(--surface-elevated) text-(--foreground-subtle) font-black text-xs uppercase tracking-widest">
                Step {step}/3
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            {step === 1 ? (
              <div className="space-y-6">
                {/* Amount & Corridor */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle) px-1">Amount</label>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      value={amountInput}
                      onChange={(event) => setAmountInput(event.target.value)}
                      className="h-12 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) text-base font-bold text-(--foreground) placeholder:text-(--foreground-muted)"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle) px-1">Corridor</label>
                    <Select value={activeCorridorValue} onValueChange={(value) => setSelectedCorridor(value)}>
                      <SelectTrigger className="h-12 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) text-base font-bold text-(--foreground)">
                        <SelectValue placeholder="Choose a corridor" />
                      </SelectTrigger>
                      <SelectContent>
                        {corridors.map((corridor) => (
                          <SelectItem key={corridor.value} value={corridor.value}>
                            {corridor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recipient */}
                <div className="space-y-4 p-8 rounded-4xl border-2 border-(--border) bg-(--surface-elevated)/50 group transition-all duration-300 hover:border-(--primary)/30">
                  <label className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle)">Recipient Information</label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Stellar Address (G...)"
                      value={recipientAddress}
                      onChange={(event) => setRecipientAddress(event.target.value)}
                      className="h-11 rounded-xl border-2 border-(--border) bg-(--surface) text-sm font-medium text-(--foreground) placeholder:text-(--foreground-muted)"
                    />
                    <Input
                      placeholder="Name (optional)"
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      className="h-11 rounded-xl border-2 border-(--border) bg-(--surface) text-sm font-medium text-(--foreground) placeholder:text-(--foreground-muted)"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4">
                  <Button 
                    disabled={!canContinueStep1}
                    className="h-12 px-8 rounded-2xl bg-blue-500 text-white font-black uppercase italic tracking-widest shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                {ratesLoading ? (
                  <Alert className="border-2 border-(--border) bg-(--surface-elevated)/50">
                    Loading available routes...
                  </Alert>
                ) : null}
                {!ratesLoading && compared.length === 0 ? (
                  <Alert className="border-2 border-(--border) bg-(--surface-elevated)/50">
                    No routes available for this corridor.
                  </Alert>
                ) : null}

                <div className="space-y-4">
                  {compared.map((route, index) => (
                    <div
                      key={route.anchorId}
                      onClick={() => setSelectedAnchorId(route.anchorId)}
                      className={cn(
                        "p-8 rounded-4xl border-2 transition-all duration-300 cursor-pointer group",
                        activeAnchorId === route.anchorId
                          ? "border-blue-500/50 bg-(--surface-elevated)/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]"
                          : "border-(--border) bg-(--surface-elevated)/30 hover:border-blue-500/30 hover:bg-(--surface-elevated)/50"
                      )}
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">{route.anchorName}</div>
                            <div className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-widest">Anchor Provider</div>
                          </div>
                          {index === 0 && (
                            <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase tracking-widest ml-auto">
                              Best Rate
                            </Badge>
                          )}
                        </div>
                        <div className={cn(
                          "h-6 w-6 rounded-full border-2 transition-all",
                          activeAnchorId === route.anchorId
                            ? "border-blue-500 bg-blue-500"
                            : "border-(--border) group-hover:border-blue-500/50"
                        )}>
                          {activeAnchorId === route.anchorId && (
                            <Check className="h-full w-full text-white p-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="p-4 rounded-xl border border-(--border) bg-(--surface-elevated)/30">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">Fee</div>
                          <div className="text-xl font-black text-emerald-400 italic">
                            {route.feePercent.toFixed(2)}%
                          </div>
                          <div className="text-xs font-bold text-(--foreground-muted) mt-1">
                            {formatCurrency(route.feeMinor, selectedCorridorData?.fromCurrency ?? "USD")}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-(--border) bg-(--surface-elevated)/30">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">You Send</div>
                          <div className="text-xl font-black text-(--foreground) italic">
                            {formatCurrency(route.totalCostMinor, selectedCorridorData?.fromCurrency ?? "USD")}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-(--border) bg-(--surface-elevated)/30">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">FX Rate</div>
                          <div className="text-xl font-black text-blue-400 italic">
                            {formatNumber(route.fxRate)}
                          </div>
                          <div className="text-xs font-bold text-(--foreground-muted) mt-1">
                            1 {selectedCorridorData?.fromCurrency}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border border-(--border) bg-(--surface-elevated)/30">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">Recipient Gets</div>
                          <div className="text-xl font-black text-purple-400 italic">
                            {formatCurrency(route.destinationAmountMinor, selectedCorridorData?.toCurrency ?? "USD")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between gap-4 pt-4">
                  <Button 
                    variant="secondary"
                    className="h-12 px-8 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) font-black uppercase italic tracking-widest hover:bg-(--surface-elevated) transition-all"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    disabled={!selectedRoute}
                    className="h-12 px-8 rounded-2xl bg-blue-500 text-white font-black uppercase italic tracking-widest shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                {selectedRoute && selectedCorridorData ? (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="p-8 rounded-4xl border-2 border-(--border) bg-(--surface-elevated)/50">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Transfer Route</div>
                          <div className="text-3xl font-black text-(--foreground) tracking-tighter uppercase italic mt-2">
                            {selectedCorridorData.fromCurrency} <span className="text-(--foreground-muted)">→</span> {selectedCorridorData.toCurrency}
                          </div>
                        </div>
                        <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400 font-black text-xs uppercase tracking-widest">
                          {selectedRoute.anchorName}
                        </Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">You Send</div>
                          <div className="text-2xl font-black text-blue-400 italic">
                            {formatCurrency(selectedRoute.totalCostMinor, selectedCorridorData.fromCurrency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">Fee</div>
                          <div className="text-2xl font-black text-emerald-400 italic">
                            {selectedRoute.feePercent.toFixed(2)}%
                          </div>
                          <div className="text-xs font-bold text-(--foreground-muted) mt-1">
                            {formatCurrency(selectedRoute.feeMinor, selectedCorridorData.fromCurrency)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">FX Rate</div>
                          <div className="text-2xl font-black text-blue-300 italic">
                            {formatNumber(selectedRoute.fxRate)}
                          </div>
                          <div className="text-xs font-bold text-(--foreground-muted) mt-1">
                            1 {selectedCorridorData.fromCurrency}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl border-2 border-purple-500/30 bg-purple-500/10">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300 mb-2">Recipient Gets</div>
                          <div className="text-2xl font-black text-purple-400 italic">
                            {formatCurrency(selectedRoute.destinationAmountMinor, selectedCorridorData.toCurrency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recipient Info */}
                    <div className="p-8 rounded-4xl border-2 border-(--border) bg-(--surface-elevated)/50">
                      <div className="mb-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Recipient Information</div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-(--foreground-muted) mb-2 uppercase tracking-wide">Address</div>
                          <div className="font-mono text-sm font-bold text-(--foreground) break-all">{recipientAddress}</div>
                        </div>
                        {recipientName && (
                          <div>
                            <div className="text-xs font-bold text-(--foreground-muted) mb-2 uppercase tracking-wide">Name</div>
                            <div className="font-semibold text-(--foreground)">{recipientName}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-6 rounded-xl border border-(--border) bg-(--surface-elevated)/30">
                      <div className="text-xs font-bold text-(--foreground-muted) leading-relaxed">
                        <span className="font-black">Note:</span> Savings and recipient estimates depend on live anchor rates and can change until settlement.
                      </div>
                    </div>
                  </div>
                ) : (
                  <Alert variant="error">No route selected.</Alert>
                )}

                {/* Actions */}
                <div className="flex justify-between gap-4 pt-4">
                  <Button 
                    variant="secondary"
                    className="h-12 px-8 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) font-black uppercase italic tracking-widest hover:bg-(--surface-elevated) transition-all"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button 
                    disabled={!selectedRoute}
                    className="h-12 px-8 rounded-2xl bg-emerald-500 text-white font-black uppercase italic tracking-widest shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
                    onClick={() => void handleConfirmSend()}
                  >
                    Confirm & Send
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </RequireSession>
  );
}