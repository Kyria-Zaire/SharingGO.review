import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { BOARDING_JWT_TYP } from "./boarding.constants.js";
import type { BoardingJwtClaims, VerifiedBoardingPayload } from "./boarding.types.js";
import { BoardingTokenVerificationError } from "./boarding.types.js";

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64url");
}

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

function signHs256(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

function parseClaims(payload: unknown): BoardingJwtClaims {
  if (typeof payload !== "object" || payload === null) {
    throw new BoardingTokenVerificationError("Invalid payload", "invalid_payload");
  }

  const record = payload as Record<string, unknown>;
  const required = ["sub", "typ", "uid", "tid", "bt", "iat", "exp"] as const;

  for (const key of required) {
    if (typeof record[key] !== "string" && typeof record[key] !== "number") {
      throw new BoardingTokenVerificationError("Invalid payload", "invalid_payload");
    }
  }

  if (record.typ !== BOARDING_JWT_TYP) {
    throw new BoardingTokenVerificationError("Invalid token type", "invalid_type");
  }

  if (
    typeof record.sub !== "string" ||
    typeof record.uid !== "string" ||
    typeof record.tid !== "string" ||
    typeof record.bt !== "string" ||
    typeof record.iat !== "number" ||
    typeof record.exp !== "number"
  ) {
    throw new BoardingTokenVerificationError("Invalid payload", "invalid_payload");
  }

  if (
    record.sub.trim() === "" ||
    record.uid.trim() === "" ||
    record.tid.trim() === "" ||
    record.bt.trim() === ""
  ) {
    throw new BoardingTokenVerificationError("Invalid payload", "invalid_payload");
  }

  return {
    sub: record.sub,
    typ: BOARDING_JWT_TYP,
    uid: record.uid,
    tid: record.tid,
    bt: record.bt,
    iat: record.iat,
    exp: record.exp,
  };
}

export function signBoardingJwt(claims: BoardingJwtClaims, secret = env.boardingJwtSecret): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(JSON.stringify(claims));
  const signature = signHs256(`${header}.${payload}`, secret);
  return `${header}.${payload}.${signature}`;
}

export function verifyBoardingToken(
  token: string,
  secret = env.boardingJwtSecret
): VerifiedBoardingPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new BoardingTokenVerificationError("Malformed token", "invalid_payload");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new BoardingTokenVerificationError("Malformed token", "invalid_payload");
  }

  const expectedSignature = signHs256(`${headerB64}.${payloadB64}`, secret);
  const actualBuf = Buffer.from(signatureB64, "base64url");
  const expectedBuf = Buffer.from(expectedSignature, "base64url");

  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    throw new BoardingTokenVerificationError("Invalid signature", "invalid_signature");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(base64UrlDecode(payloadB64).toString("utf8"));
  } catch {
    throw new BoardingTokenVerificationError("Invalid payload", "invalid_payload");
  }

  const claims = parseClaims(parsed);

  if (claims.exp * 1000 <= Date.now()) {
    throw new BoardingTokenVerificationError("Token expired", "expired");
  }

  return {
    reservationId: claims.sub,
    userId: claims.uid,
    tripId: claims.tid,
    opaqueBoardingToken: claims.bt,
    issuedAt: claims.iat,
    expiresAt: claims.exp,
  };
}

export { BoardingTokenVerificationError } from "./boarding.types.js";
