const STORAGE_KEY = "sharinggo_last_checkout";

export interface LastCheckoutContext {
  pendingReservationId: string;
  stripeCheckoutSessionId: string;
  tripId: string;
  startedAt: string;
}

function isLastCheckoutContext(value: unknown): value is LastCheckoutContext {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.pendingReservationId === "string" &&
    typeof record.stripeCheckoutSessionId === "string" &&
    typeof record.tripId === "string" &&
    typeof record.startedAt === "string"
  );
}

export function saveLastCheckout(context: LastCheckoutContext): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(context));
}

export function readLastCheckout(): LastCheckoutContext | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isLastCheckoutContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLastCheckout(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Merge sessionStorage context with Stripe `session_id` query param when present. */
export function resolveCheckoutContext(
  urlSessionId: string | null
): LastCheckoutContext | null {
  const stored = readLastCheckout();
  if (!urlSessionId) {
    return stored;
  }
  if (stored) {
    return { ...stored, stripeCheckoutSessionId: urlSessionId };
  }
  return {
    pendingReservationId: "",
    stripeCheckoutSessionId: urlSessionId,
    tripId: "",
    startedAt: new Date().toISOString(),
  };
}
