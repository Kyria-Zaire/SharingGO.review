import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { queryKeys } from "@/constants/query-keys";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_LOADING_MIN_MS,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/features/search/constants/search-config";
import {
  SEARCH_CATEGORY_HEADERS,
  SEARCH_RESULT_GROUPS,
} from "@/features/search/constants/search-entity-config";
import { useDebouncedValue } from "@/features/search/hooks/useDebouncedValue";
import { useStabilizedLoading } from "@/features/search/hooks/useStabilizedLoading";
import { searchOperations } from "@/features/search/services/search-operations";
import { cn } from "@/lib/cn";
import type { OperationSearchResult, OperationSearchResultType } from "@/types/search.types";

interface SearchResultGroup {
  type: OperationSearchResultType;
  label: string;
  results: OperationSearchResult[];
}

function buildResultGroups(data: {
  reservations: OperationSearchResult[];
  payments: OperationSearchResult[];
  trips: OperationSearchResult[];
}): SearchResultGroup[] {
  const byType: Record<OperationSearchResultType, OperationSearchResult[]> = {
    reservation: data.reservations,
    payment: data.payments,
    trip: data.trips,
  };

  return SEARCH_RESULT_GROUPS.flatMap((type) => {
    const results = byType[type];
    if (results.length === 0) return [];
    return [{ type, label: SEARCH_CATEGORY_HEADERS[type], results }];
  });
}

/**
 * Future enhancements (not V1):
 * - Ctrl+K global shortcut
 * - ArrowUp/ArrowDown selection + Enter
 * - Focus trap in dropdown
 * - Recent search memory
 * - Pinned entities (favorite trips/lines, frequent support IDs) via search-pinned.config
 * - Query text highlight in labels
 * - Entity icons via SEARCH_ENTITY_ICONS
 */
export function OperationsSearch() {
  const navigate = useNavigate();
  const inputId = useId();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  /** Future keyboard nav: track highlighted index across flat result list */
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const trimmedQuery = debouncedQuery.trim();
  const trimmedInput = query.trim();
  const isQueryTooShort = trimmedInput.length > 0 && trimmedInput.length < SEARCH_MIN_QUERY_LENGTH;
  const canSearch = trimmedQuery.length >= SEARCH_MIN_QUERY_LENGTH;

  const searchQuery = useQuery({
    queryKey: queryKeys.search.operations(trimmedQuery),
    queryFn: () => searchOperations(trimmedQuery),
    enabled: canSearch && isOpen,
    staleTime: 15_000,
  });

  const showLoading = useStabilizedLoading(searchQuery.isFetching, SEARCH_LOADING_MIN_MS);

  const resultGroups = useMemo(
    () =>
      searchQuery.data
        ? buildResultGroups(searchQuery.data)
        : [],
    [searchQuery.data]
  );

  const totalResults = useMemo(
    () => resultGroups.reduce((count, group) => count + group.results.length, 0),
    [resultGroups]
  );

  const resetSearch = useCallback(() => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (result: OperationSearchResult) => {
      navigate(result.href);
      resetSearch();
    },
    [navigate, resetSearch]
  );

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmedQuery]);

  const showDropdown = isOpen;
  const showTooShortHint = showDropdown && isQueryTooShort;
  const showResultsPanel = showDropdown && trimmedInput.length >= SEARCH_MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label htmlFor={inputId} className="sr-only">
        Recherche opérationnelle
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          placeholder="Rechercher réservation, paiement, trajet…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "flex h-9 w-full rounded-md border border-border bg-background py-2 pl-9 text-sm text-foreground",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            query ? "pr-9" : "pr-3"
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={resetSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showTooShortHint ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background p-3 text-sm text-muted-foreground shadow-lg"
        >
          Entrez au moins 2 caractères
        </div>
      ) : null}

      {showResultsPanel ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg"
        >
          {showLoading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
              Recherche en cours…
            </div>
          ) : null}

          {!showLoading && searchQuery.isError ? (
            <div className="px-3 py-3 text-sm text-destructive">
              Impossible de charger les résultats opérationnels
            </div>
          ) : null}

          {!showLoading && !searchQuery.isError && totalResults === 0 ? (
            <div className="px-3 py-3 text-sm">
              <p className="font-medium text-foreground">Aucun résultat opérationnel</p>
              <p className="mt-1 text-muted-foreground">
                Essayez un ID court, une réservation, un paiement ou un trajet.
              </p>
            </div>
          ) : null}

          {!showLoading && !searchQuery.isError && totalResults > 0 ? (
            <ul className="py-1">
              {(() => {
                let optionIndex = 0;
                return resultGroups.map((group) => (
                  <li key={group.type} role="presentation" className="border-b border-border last:border-b-0">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {group.label}
                    </p>
                    <ul className="divide-y divide-border">
                      {group.results.map((result) => {
                        const index = optionIndex;
                        optionIndex += 1;
                        return (
                          <li key={`${result.type}-${result.id}`} role="presentation">
                            <button
                              id={`${listboxId}-option-${index}`}
                              type="button"
                              role="option"
                              aria-selected={activeIndex === index}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => handleSelect(result)}
                              className={cn(
                                "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                                activeIndex === index ? "bg-primary/10" : "hover:bg-muted/30"
                              )}
                            >
                              <Badge variant="success" className="mt-0.5 shrink-0">
                                {result.badge}
                              </Badge>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {result.title}
                                </p>
                                {result.subtitle ? (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {result.subtitle}
                                  </p>
                                ) : null}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ));
              })()}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
