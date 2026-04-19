import { z } from "zod";

export const challengeSchema = z.object({
  /** Stellar wallet address (G-address, 56 chars starting with G). */
  address: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar address"),
});

export const verifySchema = z.object({
  /** Stellar wallet address (G-address, 56 chars starting with G). */
  address: z.string().regex(/^G[A-Z0-9]{55}$/, "Invalid Stellar address"),
  /** Base64-encoded signed challenge transaction envelope XDR. */
  signedChallengeTx: z.string().min(1, "Signed challenge transaction is required"),
});
