import crypto from "crypto";

const VOTE_HASH_SECRET = process.env.VOTE_HASH_SECRET;

if (!VOTE_HASH_SECRET) {
  throw new Error(
    "VOTE_HASH_SECRET is missing from .env"
  );
}

export function createVoteHash(
  studentId: string,
  teacherId: string
) {
  return crypto
    .createHmac("sha256", VOTE_HASH_SECRET)
    .update(`rating:v1:${studentId}:${teacherId}`)
    .digest("hex");
}