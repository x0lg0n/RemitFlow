"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RequireSession } from "@/components/shared/RequireSession";
import { TransactionStatusCard } from "@/components/transactions/TransactionStatusCard";
import { Alert } from "@/components/ui/alert";
import { getTransactionById } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { Transaction } from "@/types/transaction";

export default function SendConfirmPage() {
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
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Transaction Confirmation</h1>

        {!txId ? <Alert variant="error">Missing transaction ID.</Alert> : null}
        {error ? <Alert variant="error">{error}</Alert> : null}
        {!error && txId && !transaction ? <Alert>Loading transaction...</Alert> : null}
        {transaction ? <TransactionStatusCard transaction={transaction} /> : null}
      </div>
    </RequireSession>
  );
}
