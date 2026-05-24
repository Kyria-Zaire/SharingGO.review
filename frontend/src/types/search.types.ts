export type OperationSearchResultType = "reservation" | "payment" | "trip";

/**
 * Unified operational search result.
 * Optional fields reserved for future enhancements (icons, highlights, recents).
 */
export interface OperationSearchResult {
  type: OperationSearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  badge?: string;
  /** Future: Lucide icon component key */
  iconKey?: OperationSearchResultType;
  /** Future: React node with query highlight spans */
  highlightedLabel?: string;
  /** Future: surfaced from recent search memory */
  recent?: boolean;
  /** Future: operator-pinned shortcuts — see search-pinned.config.ts */
  pinned?: boolean;
}

export interface OperationSearchResults {
  reservations: OperationSearchResult[];
  payments: OperationSearchResult[];
  trips: OperationSearchResult[];
  totalCount: number;
}
