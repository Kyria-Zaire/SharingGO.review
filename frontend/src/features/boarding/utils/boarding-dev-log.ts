/** Dev-only boarding scan diagnostics — never logs full JWT in production. */
export function boardingDevLog(
  event: string,
  meta?: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  console.info(`[boarding-scan] ${event}`, meta ?? {});
}

export function maskBoardingToken(token: string): string {
  const trimmed = token.trim();
  if (trimmed.length <= 16) return `len=${trimmed.length}`;
  return `${trimmed.slice(0, 10)}…${trimmed.slice(-6)} (len=${trimmed.length})`;
}

export function normalizeBoardingToken(raw: string): string {
  return raw.trim().replace(/^Bearer\s+/i, "");
}
