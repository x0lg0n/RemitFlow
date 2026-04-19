import jwt from "jsonwebtoken";
import {
  Horizon,
  Keypair,
  Networks,
  StrKey,
  WebAuth,
} from "@stellar/stellar-sdk";
import { redis } from "../../shared/config/redis";
import { pool } from "../../shared/config/database";

const CHALLENGE_TTL_SECONDS = 300; // 5 minutes
const JWT_EXPIRY_HOURS = parseInt(process.env.JWT_EXPIRY_HOURS ?? "24", 10);

const STELLAR_NETWORK = process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
const NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ??
  (STELLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org");
const HOME_DOMAIN = process.env.SEP10_HOME_DOMAIN ?? "localhost";
const WEB_AUTH_DOMAIN = process.env.SEP10_WEB_AUTH_DOMAIN ?? HOME_DOMAIN;

export interface ChallengeResponse {
  challengeTx: string;
  networkPassphrase: string;
  homeDomain: string;
  webAuthDomain: string;
  serverAccountId: string;
  expiresAt: string;
}

/**
 * Generate a SEP-10 challenge transaction.
 * The transaction hash is stored in Redis so it can only be used once.
 */
export async function generateChallenge(address: string): Promise<ChallengeResponse> {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new ApiError(400, "INVALID_ADDRESS", "Invalid Stellar address");
  }

  const serverKeypair = getServerKeypair();
  const challengeTx = WebAuth.buildChallengeTx(
    serverKeypair,
    address,
    HOME_DOMAIN,
    CHALLENGE_TTL_SECONDS,
    NETWORK_PASSPHRASE,
    WEB_AUTH_DOMAIN
  );

  const challengeHash = txHashHex(challengeTx, NETWORK_PASSPHRASE);
  await redis.setex(`sep10:challenge:${challengeHash}`, CHALLENGE_TTL_SECONDS, address);

  return {
    challengeTx,
    networkPassphrase: NETWORK_PASSPHRASE,
    homeDomain: HOME_DOMAIN,
    webAuthDomain: WEB_AUTH_DOMAIN,
    serverAccountId: serverKeypair.publicKey(),
    expiresAt: new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString(),
  };
}

/**
 * Verify a signed SEP-10 challenge transaction and return a JWT.
 */
export async function verifyChallenge(
  address: string,
  signedChallengeTx: string
): Promise<{ token: string; role: "user" | "admin" | "oracle" | "anchor"; anchorId: string | null }> {
  if (!StrKey.isValidEd25519PublicKey(address)) {
    throw new ApiError(400, "INVALID_ADDRESS", "Invalid Stellar address");
  }

  const serverKeypair = getServerKeypair();

  let challengeHash: string;
  try {
    challengeHash = txHashHex(signedChallengeTx, NETWORK_PASSPHRASE);
  } catch {
    throw new ApiError(401, "INVALID_CHALLENGE", "Invalid signed challenge transaction");
  }

  const expectedAddress = await redis.get(`sep10:challenge:${challengeHash}`);

  if (!expectedAddress) {
    throw new ApiError(401, "CHALLENGE_EXPIRED", "Challenge expired or already used");
  }

  if (expectedAddress !== address) {
    throw new ApiError(401, "CHALLENGE_MISMATCH", "Challenge does not match wallet address");
  }

  let challenge: ReturnType<typeof WebAuth.readChallengeTx>;
  try {
    challenge = WebAuth.readChallengeTx(
      signedChallengeTx,
      serverKeypair.publicKey(),
      NETWORK_PASSPHRASE,
      HOME_DOMAIN,
      WEB_AUTH_DOMAIN
    );
  } catch {
    throw new ApiError(401, "INVALID_CHALLENGE", "Challenge verification failed");
  }

  if (challenge.clientAccountID !== address) {
    throw new ApiError(401, "ADDRESS_MISMATCH", "Signed challenge account does not match address");
  }

  const signerKeys = await getSignerKeys(address);
  try {
    WebAuth.verifyChallengeTxSigners(
      signedChallengeTx,
      serverKeypair.publicKey(),
      NETWORK_PASSPHRASE,
      signerKeys,
      HOME_DOMAIN,
      WEB_AUTH_DOMAIN
    );
  } catch {
    throw new ApiError(401, "INVALID_SIGNATURE", "Challenge signature validation failed");
  }

  await redis.del(`sep10:challenge:${challengeHash}`);

  const { role, anchorId } = await getRoleForAddress(address);
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");

  const token = jwt.sign(
    { sub: address, role, anchorId },
    secret,
    { expiresIn: `${JWT_EXPIRY_HOURS}h` }
  );

  return { token, role, anchorId };
}

function getServerKeypair(): Keypair {
  const serverSecret = process.env.SEP10_SERVER_SECRET;
  if (!serverSecret) {
    throw new Error("SEP10_SERVER_SECRET not configured");
  }

  try {
    return Keypair.fromSecret(serverSecret);
  } catch {
    throw new Error("SEP10_SERVER_SECRET is invalid");
  }
}

function txHashHex(challengeTx: string, networkPassphrase: string): string {
  const tx = WebAuth.readChallengeTx(
    challengeTx,
    getServerKeypair().publicKey(),
    networkPassphrase,
    HOME_DOMAIN,
    WEB_AUTH_DOMAIN
  ).tx;

  return tx.hash().toString("hex");
}

async function getSignerKeys(address: string): Promise<string[]> {
  const server = new Horizon.Server(HORIZON_URL);
  try {
    const account = await server.loadAccount(address);
    return account.signers.map((signer) => signer.key);
  } catch {
    // Fallback to the account's public key in local development.
    return [address];
  }
}

async function getRoleForAddress(
  address: string
): Promise<{ role: "user" | "admin" | "oracle" | "anchor"; anchorId: string | null }> {
  const { rows } = await pool.query<{ id: string }>(
    "SELECT id FROM anchors WHERE stellar_address = $1 LIMIT 1",
    [address]
  );

  if (rows.length > 0) {
    return { role: "anchor", anchorId: rows[0].id };
  }

  return { role: "user", anchorId: null };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
