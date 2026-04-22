// scripts/generate-keypair.js
const StellarSdk = require("@stellar/stellar-sdk");
const kp = StellarSdk.Keypair.random();

console.log(
  "ORACLE_SECRET_KEY=" + Buffer.from(kp.rawSecretKey()).toString("hex"),
);
console.log("Oracle public key (save this!):", kp.publicKey());
