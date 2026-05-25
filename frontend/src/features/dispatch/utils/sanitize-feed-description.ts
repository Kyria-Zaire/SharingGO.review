const SENSITIVE_PATTERN =
  /jwt|boardingtoken|stripe|secret|password|whsec_|sk_|pk_|payment_intent/i;

/** Masque metadata JSON brute et contenus sensibles issus de l'audit. */
export function sanitizeFeedDescription(description?: string): string | undefined {
  if (!description) return undefined;

  const trimmed = description.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return undefined;
  }

  if (SENSITIVE_PATTERN.test(trimmed)) {
    return undefined;
  }

  if (trimmed.length > 200) {
    return `${trimmed.slice(0, 200)}…`;
  }

  return trimmed;
}
