/**
 * Règle d'éligibilité Mosolf V1 — alignée sur le backend (subscriptions.eligibility.ts).
 * Pas de validation de code côté API pour l'instant : le flux UI précède le checkout.
 */
export function isMosolfEmailEligible(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith("@mosolf.com") || normalized.endsWith("@sharinggo.demo");
}
