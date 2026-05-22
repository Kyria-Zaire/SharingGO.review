/** Process start time for liveness uptime (set once at bootstrap). */
export const processStartedAtMs = Date.now();

export function getUptimeSeconds(): number {
  return Math.floor((Date.now() - processStartedAtMs) / 1000);
}
