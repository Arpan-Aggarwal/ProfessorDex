import crypto from "crypto";

const CODE_HASH_SECRET = process.env.CODE_HASH_SECRET;

if (!CODE_HASH_SECRET) {
  throw new Error("CODE_HASH_SECRET is missing from .env");
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomPart(length: number) {
  let result = "";

  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, ALPHABET.length);
    result += ALPHABET[index];
  }

  return result;
}

export function generatePrivateCode(length = 5) {
  return randomPart(length);
}

export function hashPrivateCode(code: string) {
  return crypto
    .createHmac("sha256", CODE_HASH_SECRET!)
    .update(code.replace(/\s+/g, "").toUpperCase())
    .digest("hex");
}