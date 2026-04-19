"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { RateComparisonTable } from "@/components/rates/RateComparisonTable";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRates } from "@/hooks/useRates";
import { useSession } from "@/hooks/useSession";
import { amountToMinorUnits, formatCurrency } from "@/lib/currency";
import { calculateSavingsVsAverage, compareRates } from "@/lib/rates";

export default function LandingPage() {
  const { rates, isLoading, error } = useRates();
  const { session } = useSession();

  const [amountInput, setAmountInput] = useState("500");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("");

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

  const corridorData = useMemo(() => {
    return corridors.find((corridor) => corridor.value === activeCorridorValue) ?? null;
  }, [activeCorridorValue, corridors]);

  const filteredRates = useMemo(() => {
    if (!corridorData) return [];
    return rates.filter(
      (rate) =>
        rate.fromCurrency === corridorData.fromCurrency &&
        rate.toCurrency === corridorData.toCurrency &&
        rate.destinationCountry === corridorData.destinationCountry
    );
  }, [corridorData, rates]);

  const amountMinor = corridorData
    ? amountToMinorUnits(amountInput, corridorData.fromCurrency)
    : 0;

  const comparedRates = useMemo(() => compareRates(filteredRates, amountMinor), [filteredRates, amountMinor]);
  const savingsPct = useMemo(
    () => calculateSavingsVsAverage(comparedRates.map((rate) => rate.totalCostMinor)),
    [comparedRates]
  );

  const cheapest = comparedRates[0];
  const averageTotal = comparedRates.length
    ? comparedRates.reduce((sum, rate) => sum + rate.totalCostMinor, 0) / comparedRates.length
    : 0;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <Badge className="border-blue-500/40 bg-blue-950/30 text-blue-200">Live Rates · No Login Required</Badge>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Send money cheaper.
              <br />
              Save 3-5% on every transfer.
            </h1>
            <p className="max-w-lg text-sm text-[var(--muted)] md:text-base">
              RemitFlow compares active Stellar anchor corridors in real-time and routes your transfer through the best total cost.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={session ? "/send" : "/login"}>
                <Button>
                  {session ? "Go to Send Flow" : "Connect Wallet to Send"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-zinc-900/40">
            <CardHeader>
              <CardTitle>Quick Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]" htmlFor="amount">
                    Amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]" htmlFor="corridor">
                    Corridor
                  </label>
                  <Select
                    id="corridor"
                    value={activeCorridorValue}
                    onChange={(event) => setSelectedCorridor(event.target.value)}
                    options={corridors.map((corridor) => ({
                      value: corridor.value,
                      label: corridor.label,
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Compare Anchor Rates</h2>
          {corridorData ? (
            <Badge>{corridorData.fromCurrency} → {corridorData.toCurrency} · {corridorData.destinationCountry}</Badge>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : null}

        {!isLoading && error ? <Alert variant="error">{error}</Alert> : null}

        {!isLoading && !error && comparedRates.length > 0 ? (
          <RateComparisonTable
            rates={comparedRates}
            fromCurrency={corridorData?.fromCurrency ?? "USD"}
            toCurrency={corridorData?.toCurrency ?? "USD"}
          />
        ) : null}

        {!isLoading && !error && comparedRates.length === 0 ? (
          <Alert>No rates currently available for this corridor.</Alert>
        ) : null}
      </section>

      {cheapest && corridorData ? (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <div className="flex flex-wrap items-center gap-3 text-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-lg font-semibold">
              You save {formatCurrency(Math.round(averageTotal - cheapest.totalCostMinor), corridorData.fromCurrency)} ({savingsPct}%) vs average
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-emerald-100 md:grid-cols-3">
            <p>Best route: {cheapest.anchorName}</p>
            <p>Total cost: {formatCurrency(cheapest.totalCostMinor, corridorData.fromCurrency)}</p>
            <p>Recipient gets: {formatCurrency(cheapest.destinationAmountMinor, corridorData.toCurrency)}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
