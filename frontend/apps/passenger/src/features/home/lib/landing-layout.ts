import { passengerHeaderContainerClass } from "@/lib/passenger-layout";

export const landingContainerClass = passengerHeaderContainerClass;

export const landingSectionClass = "scroll-mt-20 py-12 lg:py-16";

/** Cartes landing — fond légèrement plus clair que le body (#1a1d23 / #161616). */
export const landingCardClass =
  "rounded-2xl border border-white/[0.06] bg-[#161616] shadow-[0_12px_40px_rgba(0,0,0,0.45)]";

export const landingDepartureCardClass =
  "rounded-xl border border-white/[0.08] bg-[#1a1d23] shadow-[0_4px_24px_rgba(0,0,0,0.35)]";

/** Bouton « Réserver » — fond sombre, bordure verte (maquette PO). */
export const landingReserveButtonClass =
  "inline-flex min-h-[2.125rem] items-center justify-center rounded-md border border-primary/70 bg-[#0a0a0a] px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-[#111] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export const landingOutlineButtonClass =
  "inline-flex min-h-touch items-center justify-center rounded-lg border border-primary/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export const landingPrimaryButtonClass =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const landingSecondaryButtonClass =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-5 text-sm font-medium text-foreground transition-colors hover:border-white/35 hover:bg-white/5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Grille « Prochains départs » — 2 à 4 trajets (1 trajet = layout dédié dans la section). */
export function landingDeparturesGridClass(count: number): string {
  const base = "grid grid-cols-1 gap-4";

  if (count === 2) {
    return `${base} sm:grid-cols-2 lg:grid-cols-2`;
  }
  if (count === 3) {
    return `${base} sm:grid-cols-2 lg:grid-cols-3`;
  }
  return `${base} sm:grid-cols-2 lg:grid-cols-4`;
}
