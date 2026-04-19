"use client";

import { useCallback, useEffect, useState } from "react";
import { getBestRoute, getRates } from "@/lib/api";
import type { AnchorRate, BestRouteResponse, RateRequest } from "@/types/rate";

interface RatesState {
  rates: AnchorRate[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useRates() {
  const [state, setState] = useState<RatesState>({
    rates: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const refetch = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const rates = await getRates();
      setState({
        rates,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch rates",
      }));
    }
  }, []);

  const findBestRoute = useCallback(async (request: RateRequest): Promise<BestRouteResponse> => {
    return getBestRoute(request);
  }, []);

  useEffect(() => {
    refetch();
    const timer = setInterval(refetch, 60_000);
    return () => clearInterval(timer);
  }, [refetch]);

  return {
    ...state,
    refetch,
    findBestRoute,
  };
}
