import { Keypair, Address, Contract, rpc, xdr, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  contractAddress,
  getOracleKeypair,
  networkPassphrase,
  rpcServer,
} from "../../shared/config/stellar";
import { ValidatedRate } from "../../shared/types/oracle.types";

/**
 * Publish validated rates to the Soroban smart contract on-chain.
 * Builds, signs, and submits a transaction for each rate.
 */
export async function publishToContract(
  rate: ValidatedRate
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!contractAddress) {
    return { success: false, error: "SOROBAN_CONTRACT_ADDRESS not configured" };
  }

  try {
    const oracleKeypair = getOracleKeypair();

    // Build contract call.
    const contract = new Contract(contractAddress);
    const callOp = contract.call(
      "update_anchor_rate",
      xdr.ScVal.scvString(rate.anchorId),
      xdr.ScVal.scvU64(new xdr.Uint64(BigInt(rate.feePercent))),
      xdr.ScVal.scvI128(lo128(rate.fxRate)),
      xdr.ScVal.scvU64(new xdr.Uint64(BigInt(Math.floor(rate.fetchedAt.getTime() / 1000))))
    );

    // Fetch the oracle account from the network.
    const source = await rpcServer.getAccount(oracleKeypair.publicKey());

    // Build the transaction.
    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
    })
      .addOperation(callOp)
      .setTimeout(30)
      .build();

    // Sign the transaction.
    tx.sign(oracleKeypair);

    // Prepare and submit via rpc module.
    const preparedTx = await rpcServer.prepareTransaction(tx);
    const sendResponse = await rpcServer.sendTransaction(preparedTx);

    if (sendResponse.status === "PENDING") {
      console.log(
        `Oracle Contract [${rate.anchorId}]: Transaction submitted (${sendResponse.hash})`
      );
      return { success: true, txHash: sendResponse.hash };
    }

    return {
      success: false,
      error: `Contract submit status: ${sendResponse.status}`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown contract publish error";
    console.error(
      `Oracle Contract [${rate.anchorId}]: Publish failed — ${message}`
    );
    return { success: false, error: message };
  }
}

/** Convert an i128 number to ScVal (lo/hi parts). */
function lo128(n: number): xdr.Int128Parts {
  const big = BigInt(n);
  const lo = big & BigInt("0xFFFFFFFFFFFFFFFF");
  const hi = big >> BigInt(64);
  return new xdr.Int128Parts({
    lo: new xdr.Uint64(lo),
    hi: new xdr.Int64(hi),
  });
}
