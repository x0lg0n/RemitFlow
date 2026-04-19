import type { AnchorDashboardData, AnchorSummary } from "@/types/anchor";
import type { ChallengeData, SessionData } from "@/types/auth";
import type { AnchorRate, BestRouteResponse, RateRequest } from "@/types/rate";
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

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}

export async function getRates(): Promise<AnchorRate[]> {
  const data = await api<{ rates: AnchorRate[] }>("/rates");
  return data.rates;
}

export function getBestRoute(request: RateRequest): Promise<BestRouteResponse> {
  return api<BestRouteResponse>("/rates/best", {
    method: "POST",
    body: JSON.stringify(request),
  });
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
