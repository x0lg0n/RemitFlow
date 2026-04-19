"use client";

import { useCallback, useEffect, useState } from "react";
import { createTransaction, getTransactions } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { CreateTransactionRequest, Transaction } from "@/types/transaction";

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

export function useTransactions(page = 1, limit = 20) {
  const { token } = useSession();
  const [state, setState] = useState<TransactionsState>({
    transactions: [],
    isLoading: false,
    error: null,
    total: 0,
  });

  const refetch = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const data = await getTransactions(page, limit, token ?? undefined);
      setState({
        transactions: data.transactions,
        total: data.pagination.total,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch transactions",
      }));
    }
  }, [limit, page, token]);

  const submit = useCallback(async (payload: CreateTransactionRequest) => {
    const transaction = await createTransaction(payload, token ?? undefined);
    await refetch();
    return transaction;
  }, [refetch, token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    ...state,
    refetch,
    submit,
  };
}
