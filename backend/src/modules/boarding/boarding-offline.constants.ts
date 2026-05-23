/** Current boarding JWT signing algorithm (S2-T1). Not exposed to clients as a secret. */
export const BOARDING_JWT_ALGORITHM_CURRENT = "HS256" as const;

/** Target algorithms for future offline-capable asymmetric signing (future ticket). */
export const BOARDING_JWT_ALGORITHMS_TARGET = ["RS256", "EdDSA"] as const;

/** Why full offline cryptographic validation is not available in V1. */
export const BOARDING_OFFLINE_UNSUPPORTED_REASON = "ASYMMETRIC_SIGNATURE_NOT_ENABLED" as const;

/** Recommended driver scan mode until asymmetric JWT + offline sync exist. */
export const BOARDING_RECOMMENDED_VALIDATION_MODE = "ONLINE_FIRST" as const;

export const BOARDING_SERVER_VALIDATE_PATH = "/api/boarding/validate" as const;
export const BOARDING_SERVER_CONSUME_PATH = "/api/boarding/consume" as const;
