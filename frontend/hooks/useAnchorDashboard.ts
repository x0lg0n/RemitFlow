"use client";

import { useCallback, useEffect, useState } from "react";
import { getAnchorDashboard } from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { AnchorDashboardData } from "@/types/anchor";

export function useAnchorDashboard() {
  const { token } = useSession();
  const [data, setData] = useState<AnchorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboard = await getAnchorDashboard(token ?? undefined);
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
