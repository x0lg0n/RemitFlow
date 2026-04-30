"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getIndexingRecent,
  getIndexingSummary,
  getMetricsOverview,
  getMetricsRetention,
  getMetricsTransactions,
  runIndexingNow,
} from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type {
  IndexingRow,
  IndexingSummary,
  MetricsOverview,
  MetricsTrendPoint,
  RetentionCohort,
} from "@/types/metrics";

interface MetricsState {
  overview: MetricsOverview | null;
  trend: MetricsTrendPoint[];
  cohorts: RetentionCohort[];
  indexingSummary: IndexingSummary | null;
  indexingRows: IndexingRow[];
  isLoading: boolean;
  error: string | null;
}

export function useMetrics() {
  const { token, session } = useSession();
  const [state, setState] = useState<MetricsState>({
    overview: null,
    trend: [],
    cohorts: [],
    indexingSummary: null,
    indexingRows: [],
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!session || session.role !== "admin") {
      setState({
        overview: null,
        trend: [],
        cohorts: [],
        indexingSummary: null,
        indexingRows: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const [overview, trend, cohorts, indexingSummary, indexingRows] = await Promise.all([
        getMetricsOverview(token ?? undefined),
        getMetricsTransactions(30, token ?? undefined),
        getMetricsRetention(8, token ?? undefined),
        getIndexingSummary(token ?? undefined),
        getIndexingRecent(12, token ?? undefined),
      ]);

      setState({
        overview,
        trend,
        cohorts,
        indexingSummary,
        indexingRows,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load metrics",
      }));
    }
  }, [session, token]);

  const runReconciliationNow = useCallback(async () => {
    if (!session || session.role !== "admin") {
      return null;
    }

    const result = await runIndexingNow(token ?? undefined);
    await refetch();
    return result;
  }, [refetch, session, token]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    ...state,
    refetch,
    runReconciliationNow,
  };
}
