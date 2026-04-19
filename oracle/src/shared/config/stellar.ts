import { Keypair, rpc } from "@stellar/stellar-sdk";

export const sorobanRpcUrl =
  process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const networkPassphrase =
  process.env.SOROBAN_NETWORK_PASSPHRASE ??
  "Test SDF Network ; September 2015";

export const contractAddress = process.env.SOROBAN_CONTRACT_ADDRESS ?? "";

export const rpcServer = new rpc.Server(sorobanRpcUrl, {
  allowHttp: process.env.NODE_ENV !== "production",
});

/** Initialize the oracle keypair from the secret seed. */
export function getOracleKeypair(): Keypair {
  const secret = process.env.ORACLE_SECRET_KEY;
  if (!secret) {
    throw new Error("ORACLE_SECRET_KEY environment variable not set");
  }
  return Keypair.fromSecret(secret);
}
