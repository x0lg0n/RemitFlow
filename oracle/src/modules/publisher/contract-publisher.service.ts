import { Contract, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
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

    const latestLedger = await rpcServer.getLatestLedger();
    const feeBps = Math.max(0, Math.round(rate.feePercent * 100));
    const scaledFxRate = Math.round(rate.fxRate * 100);

    const rateStruct = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("anchor_id"),
        val: xdr.ScVal.scvString(rate.anchorId),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("fee_bps"),
        val: xdr.ScVal.scvU32(feeBps),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("fx_rate"),
        val: xdr.ScVal.scvI128(lo128(scaledFxRate)),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("last_updated"),
        val: xdr.ScVal.scvU32(latestLedger.sequence),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("min_amount"),
        val: xdr.ScVal.scvI128(lo128(rate.minAmount)),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("max_amount"),
        val: xdr.ScVal.scvI128(lo128(rate.maxAmount)),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("from_currency"),
        val: xdr.ScVal.scvString(rate.fromCurrency),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("to_currency"),
        val: xdr.ScVal.scvString(rate.toCurrency),
      }),
    ]);

    // Build contract call.
    const contract = new Contract(contractAddress);
    const callOp = contract.call("update_anchor_rate", rateStruct);

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
