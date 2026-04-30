"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveAdminAnchorSubmission,
  getAdminAnchorSubmissions,
  getAnchorCatalog,
  patchAdminCatalogEntry,
  rejectAdminAnchorSubmission,
} from "@/lib/api";
import { useSession } from "@/hooks/useSession";
import type { AnchorCatalogItem, AnchorSubmission } from "@/types/marketplace";

interface AdminAnchorsState {
  submissions: AnchorSubmission[];
  catalog: AnchorCatalogItem[];
  isLoading: boolean;
  error: string | null;
}

export function useAdminAnchors() {
  const { token, session } = useSession();
  const [state, setState] = useState<AdminAnchorsState>({
    submissions: [],
    catalog: [],
    isLoading: false,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!session || session.role !== "admin") {
      setState({
        submissions: [],
        catalog: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    try {
      const [submissions, catalog] = await Promise.all([
        getAdminAnchorSubmissions(token ?? undefined),
        getAnchorCatalog(token ?? undefined),
      ]);
      setState({
        submissions,
        catalog,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to load admin anchors",
      }));
    }
  }, [session, token]);

  const approve = useCallback(async (submissionId: string, reviewNotes?: string) => {
    await approveAdminAnchorSubmission(submissionId, reviewNotes, token ?? undefined);
    await refetch();
  }, [refetch, token]);

  const reject = useCallback(async (submissionId: string, reviewNotes?: string) => {
    await rejectAdminAnchorSubmission(submissionId, reviewNotes, token ?? undefined);
    await refetch();
  }, [refetch, token]);

  const patchCatalog = useCallback(async (
    id: string,
    payload: {
      isPublished?: boolean;
      availabilityStatus?: "available" | "pending" | "disabled";
      rating?: number | null;
      notes?: string | null;
      feeEstimate?: string | null;
      displayName?: string;
    },
  ) => {
    await patchAdminCatalogEntry(id, payload, token ?? undefined);
    await refetch();
  }, [refetch, token]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    ...state,
    refetch,
    approve,
    reject,
    patchCatalog,
  };
}
