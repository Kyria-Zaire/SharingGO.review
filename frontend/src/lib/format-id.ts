/**
 * Short display for long IDs (e.g. CUID) — single UI convention for admin tables.
 * Example: "cmph36e3900059hqwbe71fj1g" → "cm...fj1g"
 */
export function formatShortId(id: string): string {
  if (id.length <= 10) {
    return id;
  }
  return `${id.slice(0, 2)}...${id.slice(-4)}`;
}
