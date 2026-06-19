/**
 * Shared responsive width for passenger shell (header, main, bottom nav).
 * Mobile: max-w-lg (512px) — unchanged from MVP.
 * Tablet/desktop: progressive widening.
 */
export const passengerShellWidthClass =
  "mx-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl";

/** Narrow content blocks (profile, login form) within the wider shell. */
export const passengerContentNarrowClass = "mx-auto w-full max-w-md lg:max-w-xl";

/** Two-column app pages (detail, boarding pass). */
export const passengerTwoColumnClass =
  "grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6";
