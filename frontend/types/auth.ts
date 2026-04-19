export type SessionRole = "user" | "admin" | "oracle" | "anchor";

export interface SessionData {
  walletAddress: string;
  role: SessionRole;
  anchorId: string | null;
}

export interface ChallengeData {
  challengeTx: string;
  networkPassphrase: string;
  homeDomain: string;
  webAuthDomain: string;
  serverAccountId: string;
  expiresAt: string;
}
