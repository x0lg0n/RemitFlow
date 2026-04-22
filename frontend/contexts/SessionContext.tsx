"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createChallenge,
  getSession,
  logoutSession,
  verifyChallenge,
} from "@/lib/api";
import type { SessionData } from "@/types/auth";
import { useWallet } from "@/contexts/WalletContext";

interface SessionContextValue {
  session: SessionData | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  loginWithWallet: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { connect, signChallenge, disconnect } = useWallet();

  const [session, setSession] = useState<SessionData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setError(null);

    try {
      const nextSession = await getSession(token ?? undefined);
      setSession(nextSession);
    } catch {
      setSession(null);
    }
  }, [token]);

  const loginWithWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const address = await connect();
      const challenge = await createChallenge(address);
      const signedChallengeTx = await signChallenge(
        challenge.challengeTx,
        challenge.networkPassphrase,
      );

      const verifyResult = await verifyChallenge(address, signedChallengeTx);
      setToken(verifyResult.token);

      const nextSession = await getSession(verifyResult.token);
      setSession(nextSession);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";

      // Don't set error state for user rejection - it's expected behavior
      const isUserRejection =
        message.toLowerCase().includes("rejected") ||
        message.toLowerCase().includes("user denied") ||
        message.toLowerCase().includes("cancelled");

      if (!isUserRejection) {
        setError(message);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connect, signChallenge]);

  const logout = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      await logoutSession();
    } finally {
      setSession(null);
      setToken(null);
      disconnect();
      setIsLoading(false);
    }
  }, [disconnect]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextSession = await getSession();
        if (!cancelled) {
          setSession(nextSession);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      token,
      isLoading,
      error,
      loginWithWallet,
      refreshSession,
      logout,
    }),
    [session, token, isLoading, error, loginWithWallet, refreshSession, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
