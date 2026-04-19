import { Networks } from "@stellar/stellar-sdk";

export const networkPassphrase =
  process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;

export const sorobanRpcUrl =
  process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";

export const contractAddress = process.env.SOROBAN_CONTRACT_ADDRESS || "";
