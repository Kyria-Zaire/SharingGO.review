import type { OperationSearchResultType } from "@/types/search.types";

/**
 * Future operator-pinned shortcuts (V2+).
 * Use cases: favorite trips, favorite lines, frequent support IDs.
 *
 * Not persisted in V1 — merge layer will prepend pinned matches before API results.
 */
export interface PinnedSearchEntity {
  type: OperationSearchResultType;
  id: string;
  label: string;
  /** Optional deep-link override; defaults to standard entity href builder */
  href?: string;
  pinnedAt: string;
}

/** Future localStorage key — inactive in V1 */
export const PINNED_SEARCH_STORAGE_KEY = "sharinggo.admin.search.pinned";

/** Future hook surface: `usePinnedSearchEntities()` reading/writing PINNED_SEARCH_STORAGE_KEY */
export const PINNED_SEARCH_MAX = 10;
