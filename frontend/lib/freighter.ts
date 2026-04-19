import {
  getAddress,
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

export async function ensureFreighterConnection(): Promise<string> {
  const connection = await isConnected();
  if (connection.error) {
    throw new Error(connection.error.message);
  }

  if (!connection.isConnected) {
    const accessResult = await requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error.message);
    }
    return accessResult.address;
  }

  const allowed = await isAllowed();
  if (allowed.error) {
    throw new Error(allowed.error.message);
  }

  if (!allowed.isAllowed) {
    const accessResult = await requestAccess();
    if (accessResult.error) {
      throw new Error(accessResult.error.message);
    }
    return accessResult.address;
  }

  const addressResult = await getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error.message);
  }

  return addressResult.address;
}

export async function signChallengeTx(
  challengeTx: string,
  networkPassphrase: string
): Promise<string> {
  const result = await signTransaction(challengeTx, { networkPassphrase });
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.signedTxXdr;
}
