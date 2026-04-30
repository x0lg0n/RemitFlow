"use client";

import { useCallback, useEffect, useState } from "react";
import {
  activateAnchorPreference,
  deactivateAnchorPreference,
  getAnchorCatalog,
  getMyAnchorPreferences,
  submitAnchorSubmission,
} from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { AnchorCatalogItem, AnchorSubmission, UserAnchorPreference } from "@/types/marketplace";

interface MarketplaceState {
  catalog: AnchorCatalogItem[];
  preferences: UserAnchorPreference[];
  isLoading: boolean;
  error: string | null;
}

export function useAnchorMarketplace() {
  const { token, session } = useSession();
  const [state, setState] = useState<MarketplaceState>({
    catalog: [],
    preferences: [],
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const [catalog, preferences] = await Promise.all([
        getAnchorCatalog(token ?? undefined),
        session ? getMyAnchorPreferences(token ?? undefined) : Promise.resolve([]),
      ]);

      setState({
        catalog,
        preferences,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load marketplace",
      }));
    }
  }, [session, token]);

  const activate = useCallback(async (catalogId: string) => {
    await activateAnchorPreference(catalogId, token ?? undefined);
    await refetch();
  }, [refetch, token]);

  const deactivate = useCallback(async (catalogId: string) => {
    await deactivateAnchorPreference(catalogId, token ?? undefined);
    await refetch();
  }, [refetch, token]);

  const submit = useCallback(async (payload: {
    anchorName: string;
    baseUrl?: string;
    countryCode?: string;
    supportedCurrencies?: string[];
    notes?: string;
  }): Promise<AnchorSubmission> => {
    const submission = await submitAnchorSubmission(payload, token ?? undefined);
    await refetch();
    return submission;
  }, [refetch, token]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    ...state,
    refetch,
    activate,
    deactivate,
    submit,
  };
}
