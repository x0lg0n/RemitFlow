"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { TransactionStatusCard } from "@/components/transactions/TransactionStatusCard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getTransactionById } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { Transaction } from "@/types/transaction";

export default function SendConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txId = searchParams.get("txId");
  const { token } = useSession();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txId) return;

    (async () => {
      try {
        const tx = await getTransactionById(txId, token ?? undefined);
        setTransaction(tx);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transaction");
      }
    })();
  }, [token, txId]);

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in sm:px-0">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-48 -top-48 h-125 w-125 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-48 -bottom-48 h-125 w-125 rounded-full bg-blue-500/5 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black uppercase tracking-[0.2em] text-(--primary) italic shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
              Transaction Complete
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
              Sent<br/>Successfully
            </h1>
            <p className="max-w-xl text-lg font-medium text-(--foreground-muted) mt-6 leading-relaxed">
              Your transfer is being processed. Track your transaction details below.
            </p>
          </div>
        </div>

        {!txId ? (
          <Alert variant="error" className="border-2 border-red-500/30 bg-red-500/10">
            Missing transaction ID.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="error" className="border-2 border-red-500/30 bg-red-500/10">
            {error}
          </Alert>
        ) : null}
        {!error && txId && !transaction ? (
          <Alert className="border-2 border-(--border) bg-(--surface-elevated)/50">
            Loading transaction details...
          </Alert>
        ) : null}
        {transaction ? <TransactionStatusCard transaction={transaction} /> : null}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
          <Button
            className="h-12 px-8 rounded-2xl bg-blue-500 text-white font-black uppercase italic tracking-widest shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all flex items-center justify-center gap-3"
            onClick={() => router.push("/send")}
          >
            Send Another
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            className="h-12 px-8 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) font-black uppercase italic tracking-widest hover:bg-(--surface-elevated) transition-all"
            onClick={() => router.push("/transactions")}
          >
            View History
          </Button>
        </div>
      </div>
    </RequireSession>
  );
}
