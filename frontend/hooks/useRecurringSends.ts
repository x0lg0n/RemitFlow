"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelRecurringSend,
  confirmRecurringRun,
  createRecurringSend,
  getRecurringSends,
  pauseRecurringSend,
  resumeRecurringSend,
  updateRecurringSend,
} from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type {
  CreateRecurringSendRequest,
  RecurringSendPlan,
  RecurringSendRun,
  UpdateRecurringSendRequest,
} from "@/types/recurring";

interface RecurringState {
  plans: RecurringSendPlan[];
  pendingRuns: RecurringSendRun[];
  isLoading: boolean;
  error: string | null;
}

export function useRecurringSends() {
  const { token, session } = useSession();
  const [state, setState] = useState<RecurringState>({
    plans: [],
    pendingRuns: [],
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!session) {
      setState({
        plans: [],
        pendingRuns: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const data = await getRecurringSends(token ?? undefined);
      setState({
        plans: data.plans,
        pendingRuns: data.pendingRuns,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load recurring sends",
      }));
    }
  }, [session, token]);

  const createPlan = useCallback(async (payload: CreateRecurringSendRequest): Promise<RecurringSendPlan> => {
    const plan = await createRecurringSend(payload, token ?? undefined);
    await refetch();
    return plan;
  }, [refetch, token]);

  const patchPlan = useCallback(async (id: string, payload: UpdateRecurringSendRequest): Promise<RecurringSendPlan> => {
    const plan = await updateRecurringSend(id, payload, token ?? undefined);
    await refetch();
    return plan;
  }, [refetch, token]);

  const pausePlan = useCallback(async (id: string): Promise<RecurringSendPlan> => {
    const plan = await pauseRecurringSend(id, token ?? undefined);
    await refetch();
    return plan;
  }, [refetch, token]);

  const resumePlan = useCallback(async (id: string): Promise<RecurringSendPlan> => {
    const plan = await resumeRecurringSend(id, token ?? undefined);
    await refetch();
    return plan;
  }, [refetch, token]);

  const cancelPlan = useCallback(async (id: string): Promise<RecurringSendPlan> => {
    const plan = await cancelRecurringSend(id, token ?? undefined);
    await refetch();
    return plan;
  }, [refetch, token]);

  const confirmRun = useCallback(async (runId: string): Promise<{ run: RecurringSendRun; transactionId: string }> => {
    const result = await confirmRecurringRun(runId, token ?? undefined);
    await refetch();
    return result;
  }, [refetch, token]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    ...state,
    refetch,
    createPlan,
    patchPlan,
    pausePlan,
    resumePlan,
    cancelPlan,
    confirmRun,
  };
}
