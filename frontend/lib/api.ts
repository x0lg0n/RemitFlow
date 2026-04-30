import type { AnchorDashboardData, AnchorSummary } from "@/types/anchor";
import type { ChallengeData, SessionData } from "@/types/auth";
import type {
  AnchorCatalogItem,
  AnchorSubmission,
  UserAnchorPreference,
} from "@/types/marketplace";
import type { AnchorRate, BestRouteResponse, RateRequest } from "@/types/rate";
import type {
  CreateRecurringSendRequest,
  RecurringSendPlan,
  RecurringSendRun,
  UpdateRecurringSendRequest,
} from "@/types/recurring";
import type {
  IndexingRow,
  IndexingSummary,
  MetricsOverview,
  MetricsTrendPoint,
  RetentionCohort,
} from "@/types/metrics";
import type { CreateTransactionRequest, Transaction } from "@/types/transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function api<T>(path: string, options: RequestInit = {}, authToken?: string): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
  const normalizedBody = rawBody.trim();

  if (!contentType.includes("application/json")) {
    const looksLikeHtml = normalizedBody.startsWith("<!DOCTYPE") || normalizedBody.startsWith("<html");
    const deploymentHint =
      looksLikeHtml
        ? ` The API responded with HTML. Check NEXT_PUBLIC_API_URL (current: ${API_URL}) and ensure backend routes exist for ${path}.`
        : "";
    throw new Error(
      `Invalid response format from ${path}: expected JSON but got ${contentType || "unknown content type"}. ` +
        `Status: ${response.status} ${response.statusText}.${deploymentHint}`
    );
  }

  let payload: ApiResponse<T>;
  try {
    payload = JSON.parse(normalizedBody) as ApiResponse<T>;
  } catch {
    throw new Error(
      `Failed to parse JSON response from ${path}. ` +
        `Status: ${response.status}. ` +
        `Body starts with: ${normalizedBody.slice(0, 40)}`
    );
  }

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? `Request to ${path} failed with status ${response.status}`);
  }

  return payload.data;
}

export async function getRates(authToken?: string): Promise<AnchorRate[]> {
  const data = await api<{ rates: AnchorRate[] }>("/rates", {}, authToken);
  return data.rates;
}

export function getBestRoute(request: RateRequest, authToken?: string): Promise<BestRouteResponse> {
  return api<BestRouteResponse>("/rates/best", {
    method: "POST",
    body: JSON.stringify(request),
  }, authToken);
}

export function createChallenge(address: string): Promise<ChallengeData> {
  return api<ChallengeData>("/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export function verifyChallenge(address: string, signedChallengeTx: string): Promise<{ token: string; role: SessionData["role"]; anchorId: string | null }> {
  return api<{ token: string; role: SessionData["role"]; anchorId: string | null }>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ address, signedChallengeTx }),
  });
}

export function getSession(authToken?: string): Promise<SessionData> {
  return api<SessionData>("/auth/session", {}, authToken);
}

export function logoutSession(): Promise<{ loggedOut: true }> {
  return api<{ loggedOut: true }>("/auth/logout", {
    method: "POST",
  });
}

export async function createTransaction(payload: CreateTransactionRequest, authToken?: string): Promise<Transaction> {
  const data = await api<{ transaction: Transaction }>("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  }, authToken);

  return data.transaction;
}

export async function getTransactions(page = 1, limit = 20, authToken?: string): Promise<{ transactions: Transaction[]; pagination: { page: number; limit: number; total: number } }> {
  return api<{ transactions: Transaction[]; pagination: { page: number; limit: number; total: number } }>(`/transactions?page=${page}&limit=${limit}`, {}, authToken);
}

export async function getTransactionById(id: string, authToken?: string): Promise<Transaction> {
  const data = await api<{ transaction: Transaction }>(`/transactions/${id}`, {}, authToken);
  return data.transaction;
}

export async function getAnchors(): Promise<AnchorSummary[]> {
  const data = await api<{ anchors: AnchorSummary[] }>("/anchors");
  return data.anchors;
}

export function getAnchorDashboard(authToken?: string): Promise<AnchorDashboardData> {
  return api<AnchorDashboardData>("/anchors/me/dashboard", {}, authToken);
}

export async function getAnchorCatalog(authToken?: string): Promise<AnchorCatalogItem[]> {
  const data = await api<{ catalog: AnchorCatalogItem[] }>("/anchors/catalog", {}, authToken);
  return data.catalog;
}

export async function getMyAnchorPreferences(authToken?: string): Promise<UserAnchorPreference[]> {
  const data = await api<{ preferences: UserAnchorPreference[] }>("/anchors/preferences/me", {}, authToken);
  return data.preferences;
}

export async function activateAnchorPreference(catalogId: string, authToken?: string): Promise<UserAnchorPreference> {
  const data = await api<{ preference: UserAnchorPreference }>(
    `/anchors/preferences/${catalogId}/activate`,
    { method: "POST" },
    authToken,
  );
  return data.preference;
}

export async function deactivateAnchorPreference(catalogId: string, authToken?: string): Promise<{ deactivated: true }> {
  return api<{ deactivated: true }>(`/anchors/preferences/${catalogId}`, { method: "DELETE" }, authToken);
}

export async function submitAnchorSubmission(
  payload: {
    anchorName: string;
    baseUrl?: string;
    countryCode?: string;
    supportedCurrencies?: string[];
    notes?: string;
  },
  authToken?: string,
): Promise<AnchorSubmission> {
  const data = await api<{ submission: AnchorSubmission }>(
    "/anchors/submissions",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    authToken,
  );
  return data.submission;
}

export async function getAdminAnchorSubmissions(
  authToken?: string,
  status?: "pending" | "approved" | "rejected",
): Promise<AnchorSubmission[]> {
  const suffix = status ? `?status=${status}` : "";
  const data = await api<{ submissions: AnchorSubmission[] }>(
    `/admin/anchors/submissions${suffix}`,
    {},
    authToken,
  );
  return data.submissions;
}

export async function approveAdminAnchorSubmission(
  id: string,
  reviewNotes: string | undefined,
  authToken?: string,
): Promise<AnchorSubmission> {
  const data = await api<{ submission: AnchorSubmission }>(
    `/admin/anchors/submissions/${id}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ reviewNotes }),
    },
    authToken,
  );
  return data.submission;
}

export async function rejectAdminAnchorSubmission(
  id: string,
  reviewNotes: string | undefined,
  authToken?: string,
): Promise<AnchorSubmission> {
  const data = await api<{ submission: AnchorSubmission }>(
    `/admin/anchors/submissions/${id}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reviewNotes }),
    },
    authToken,
  );
  return data.submission;
}

export async function patchAdminCatalogEntry(
  id: string,
  payload: {
    isPublished?: boolean;
    availabilityStatus?: "available" | "pending" | "disabled";
    rating?: number | null;
    notes?: string | null;
    feeEstimate?: string | null;
    displayName?: string;
  },
  authToken?: string,
): Promise<AnchorCatalogItem> {
  const data = await api<{ catalogEntry: AnchorCatalogItem }>(
    `/admin/anchors/catalog/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    authToken,
  );
  return data.catalogEntry;
}

export async function createRecurringSend(
  payload: CreateRecurringSendRequest,
  authToken?: string,
): Promise<RecurringSendPlan> {
  const data = await api<{ plan: RecurringSendPlan }>(
    "/recurring-sends",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    authToken,
  );
  return data.plan;
}

export async function getRecurringSends(authToken?: string): Promise<{ plans: RecurringSendPlan[]; pendingRuns: RecurringSendRun[] }> {
  return api<{ plans: RecurringSendPlan[]; pendingRuns: RecurringSendRun[] }>(
    "/recurring-sends",
    {},
    authToken,
  );
}

export async function updateRecurringSend(
  id: string,
  payload: UpdateRecurringSendRequest,
  authToken?: string,
): Promise<RecurringSendPlan> {
  const data = await api<{ plan: RecurringSendPlan }>(
    `/recurring-sends/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    authToken,
  );
  return data.plan;
}

export async function pauseRecurringSend(id: string, authToken?: string): Promise<RecurringSendPlan> {
  const data = await api<{ plan: RecurringSendPlan }>(
    `/recurring-sends/${id}/pause`,
    { method: "POST" },
    authToken,
  );
  return data.plan;
}

export async function resumeRecurringSend(id: string, authToken?: string): Promise<RecurringSendPlan> {
  const data = await api<{ plan: RecurringSendPlan }>(
    `/recurring-sends/${id}/resume`,
    { method: "POST" },
    authToken,
  );
  return data.plan;
}

export async function cancelRecurringSend(id: string, authToken?: string): Promise<RecurringSendPlan> {
  const data = await api<{ plan: RecurringSendPlan }>(
    `/recurring-sends/${id}/cancel`,
    { method: "POST" },
    authToken,
  );
  return data.plan;
}

export async function confirmRecurringRun(runId: string, authToken?: string): Promise<{ run: RecurringSendRun; transactionId: string }> {
  return api<{ run: RecurringSendRun; transactionId: string }>(
    `/recurring-sends/runs/${runId}/confirm`,
    {
      method: "POST",
      body: JSON.stringify({ acknowledged: true }),
    },
    authToken,
  );
}

export async function getMetricsOverview(authToken?: string): Promise<MetricsOverview> {
  const data = await api<{ overview: MetricsOverview }>("/metrics/overview", {}, authToken);
  return data.overview;
}

export async function getMetricsTransactions(
  days = 30,
  authToken?: string,
): Promise<MetricsTrendPoint[]> {
  const data = await api<{ trend: MetricsTrendPoint[] }>(
    `/metrics/transactions?days=${days}`,
    {},
    authToken,
  );
  return data.trend;
}

export async function getMetricsRetention(
  weeks = 8,
  authToken?: string,
): Promise<RetentionCohort[]> {
  const data = await api<{ cohorts: RetentionCohort[] }>(
    `/metrics/retention?weeks=${weeks}`,
    {},
    authToken,
  );
  return data.cohorts;
}

export async function getIndexingSummary(authToken?: string): Promise<IndexingSummary> {
  const data = await api<{ summary: IndexingSummary }>("/indexing/summary", {}, authToken);
  return data.summary;
}

export async function getIndexingRecent(
  limit = 25,
  authToken?: string,
): Promise<IndexingRow[]> {
  const data = await api<{ rows: IndexingRow[] }>(`/indexing/recent?limit=${limit}`, {}, authToken);
  return data.rows;
}

export async function runIndexingNow(
  authToken?: string,
): Promise<{ checked: number; matched: number; missing: number; errored: number }> {
  const data = await api<{
    result: { checked: number; matched: number; missing: number; errored: number };
  }>(
    "/indexing/reconcile-now",
    { method: "POST" },
    authToken,
  );
  return data.result;
}
