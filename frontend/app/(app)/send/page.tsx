"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RequireSession } from "@/components/shared/RequireSession";
import { useRates } from "@/hooks/useRates";
import { useTransactions } from "@/hooks/useTransactions";
import { amountToMinorUnits, formatCurrency, formatNumber } from "@/lib/currency";
import { compareRates } from "@/lib/rates";

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

  return (
    <RequireSession>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">Send Money</h1>

        {txError ? <Alert variant="error">{txError}</Alert> : null}
        {formError ? <Alert variant="error">{formError}</Alert> : null}

        <Card>
          <CardHeader>
            <CardTitle>Step {step} of 3</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">You send</label>
                    <Input type="number" min="0" step="0.01" value={amountInput} onChange={(event) => setAmountInput(event.target.value)} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Corridor</label>
                    <Select
                      value={activeCorridorValue}
                      onChange={(event) => setSelectedCorridor(event.target.value)}
                      options={corridors.map((corridor) => ({ value: corridor.value, label: corridor.label }))}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-[var(--border)] bg-zinc-900/40 p-4">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Recipient</label>
                  <Input
                    placeholder="Stellar Address (G...)"
                    value={recipientAddress}
                    onChange={(event) => setRecipientAddress(event.target.value)}
                  />
                  <Input
                    placeholder="Name (optional)"
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button disabled={!canContinueStep1} onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted)]">Choose the best route for this transfer.</p>

                {ratesLoading ? <Alert>Loading route options...</Alert> : null}
                {!ratesLoading && compared.length === 0 ? <Alert>No routes available for this corridor.</Alert> : null}

                <div className="space-y-3">
                  {compared.map((route, index) => (
                    <div
                      key={route.anchorId}
                      className="rounded-lg border border-[var(--border)] bg-zinc-900/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{route.anchorName}</p>
                          {index === 0 ? <Badge className="border-emerald-500/40 bg-emerald-950/30 text-emerald-200">Best</Badge> : null}
                        </div>
                          <Button
                          variant={activeAnchorId === route.anchorId ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => setSelectedAnchorId(route.anchorId)}
                        >
                          {activeAnchorId === route.anchorId ? "Selected" : "Select"}
                        </Button>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        <p>Fee: {route.feePercent.toFixed(2)}% ({formatCurrency(route.feeMinor, selectedCorridorData?.fromCurrency ?? "USD")})</p>
                        <p>Total cost: {formatCurrency(route.totalCostMinor, selectedCorridorData?.fromCurrency ?? "USD")}</p>
                        <p>FX Rate: 1 {selectedCorridorData?.fromCurrency} = {formatNumber(route.fxRate)} {selectedCorridorData?.toCurrency}</p>
                        <p>Recipient gets: {formatCurrency(route.destinationAmountMinor, selectedCorridorData?.toCurrency ?? "USD")}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <Button disabled={!selectedRoute} onClick={() => setStep(3)}>Continue</Button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Confirm Transfer</h2>

                {selectedRoute && selectedCorridorData ? (
                  <div className="space-y-2 rounded-lg border border-[var(--border)] bg-zinc-900/40 p-4 text-sm">
                    <p>Route: <span className="font-semibold">{selectedRoute.anchorName}</span></p>
                    <p>You send: {formatCurrency(selectedRoute.totalCostMinor, selectedCorridorData.fromCurrency)}</p>
                    <p>Fee: {formatCurrency(selectedRoute.feeMinor, selectedCorridorData.fromCurrency)}</p>
                    <p>Recipient gets: {formatCurrency(selectedRoute.destinationAmountMinor, selectedCorridorData.toCurrency)}</p>
                    <p>Recipient address: <span className="font-mono text-xs">{recipientAddress}</span></p>
                  </div>
                ) : (
                  <Alert variant="error">No route selected.</Alert>
                )}

                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                  <Button disabled={!selectedRoute} onClick={() => void handleConfirmSend()}>
                    Confirm & Send
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
