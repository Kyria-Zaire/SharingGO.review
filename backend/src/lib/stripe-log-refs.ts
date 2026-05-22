/** Short Stripe IDs for operational logs (never log full pi_/cs_ in info/warn). */
export function stripeLogRef(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value.length <= 14) return value;
  return `${value.slice(0, 7)}...${value.slice(-4)}`;
}
