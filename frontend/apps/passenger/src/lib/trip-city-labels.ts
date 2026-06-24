/** Libellés ville alignés produit — jamais « Paris-Vatry » seul à l'écran. */

function normalizeCityKey(city: string): string {
  return city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function isChalonsCity(city: string): boolean {
  const key = normalizeCityKey(city);
  return key.includes("chalons");
}

export function isVatryCity(city: string): boolean {
  const key = normalizeCityKey(city);
  return key.includes("vatry") || key.includes("paris-vatry");
}

/** Cartes trajets, filtres sens — forme courte (« Vatry »). */
export function formatTripCityShort(city: string): string {
  if (isChalonsCity(city)) {
    return "Châlons-en-Champagne";
  }
  if (isVatryCity(city)) {
    return "Vatry";
  }
  return city;
}

/** Résumés ligne, hero, copy marketing — forme officielle complète. */
export function formatTripCityFull(city: string): string {
  if (isChalonsCity(city)) {
    return "Châlons-en-Champagne";
  }
  if (isVatryCity(city)) {
    return "Aéroport Paris-Vatry";
  }
  return city;
}

export function formatTripRouteShort(startCity: string, endCity: string): string {
  return `${formatTripCityShort(startCity)} → ${formatTripCityShort(endCity)}`;
}

export function formatTripRouteFull(startCity: string, endCity: string): string {
  return `${formatTripCityFull(startCity)} ↔ ${formatTripCityFull(endCity)}`;
}
