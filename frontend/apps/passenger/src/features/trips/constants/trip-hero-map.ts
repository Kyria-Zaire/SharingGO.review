import { isChalonsCity } from "@/lib/trip-city-labels";
import type { PercentPoint } from "@/features/trips/lib/trip-hero-map-overlay";
import tripHeroMapChalonsVatryUrl from "@/assets/images/trips/hero-map-chalons-vatry.png";

/** Fond carte trajet — capture PO Châlons → Vatry (tracé + labels intégrés). */
export const TRIP_HERO_MAP_ASSET = tripHeroMapChalonsVatryUrl;

/** Ratio natif de la capture maquette (622×247). */
export const HERO_MAP_REFERENCE_ASPECT = 622 / 247;

/** Timeline — cadre légèrement plus haut pour dégager le nord de la carte. */
export const HERO_MAP_TIMELINE_ASPECT = HERO_MAP_REFERENCE_ASPECT / 1.14;

/**
 * Tracé calibré sur la maquette (Châlons haut-gauche → Vatry bas-droite).
 * Coordonnées en % du conteneur (ratio maquette).
 */
export const HERO_MAP_ROUTE_CHALONS_TO_VATRY: PercentPoint[] = [
  { x: 13.5, y: 19 },
  { x: 21, y: 26 },
  { x: 30, y: 33 },
  { x: 40, y: 41 },
  { x: 51, y: 49 },
  { x: 62, y: 57 },
  { x: 72, y: 66 },
  { x: 81, y: 74 },
  { x: 87.5, y: 81 },
];

export function resolveHeroMapRoutePoints(startCity: string): PercentPoint[] {
  if (isChalonsCity(startCity)) {
    return HERO_MAP_ROUTE_CHALONS_TO_VATRY;
  }
  return [...HERO_MAP_ROUTE_CHALONS_TO_VATRY].reverse();
}

/** La capture intègre tracé + labels — pas de calque SVG dynamique. */
export function shouldShowHeroMapDynamicOverlay(): boolean {
  return false;
}
