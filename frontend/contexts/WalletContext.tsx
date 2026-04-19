"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ensureFreighterConnection, signChallengeTx } from "@/lib/freighter";

interface WalletContextValue {
  isConnected: boolean;
  address: string | null;
  error: string | null;
  connect: () => Promise<string>;
  disconnect: () => void;
  signChallenge: (challengeTx: string, networkPassphrase: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const publicAddress = await ensureFreighterConnection();
      setAddress(publicAddress);
      return publicAddress;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  const signChallenge = useCallback(async (challengeTx: string, networkPassphrase: string) => {
    setError(null);
    try {
      return await signChallengeTx(challengeTx, networkPassphrase);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign transaction";
      setError(message);
      throw err;
    }
  }, []);

  const value = useMemo<WalletContextValue>(() => ({
    isConnected: Boolean(address),
    address,
    error,
    connect,
    disconnect,
    signChallenge,
  }), [address, error, connect, disconnect, signChallenge]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  return context;
}
