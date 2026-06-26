import {
  HELP_CATEGORY_LABELS,
  type HelpFaqItem,
} from "@/features/help/constants/help-content";
import type { HelpCategory, HelpCategoryFilter } from "@/features/help/lib/help-categories";

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(item: HelpFaqItem, query: string): boolean {
  if (!query) return true;
  const haystack = [
    item.question,
    item.answer,
    HELP_CATEGORY_LABELS[item.category],
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function filterHelpFaqItems(
  items: readonly HelpFaqItem[],
  query: string,
  category: HelpCategoryFilter
): HelpFaqItem[] {
  const normalized = normalizeQuery(query);
  return items.filter((item) => {
    const categoryMatch = category === "all" || item.category === category;
    return categoryMatch && matchesQuery(item, normalized);
  });
}

export function countFaqByCategory(
  items: readonly HelpFaqItem[],
  query: string
): Record<HelpCategory, number> {
  const normalized = normalizeQuery(query);
  const counts = Object.fromEntries(
    (Object.keys(HELP_CATEGORY_LABELS) as HelpCategory[]).map((key) => [key, 0])
  ) as Record<HelpCategory, number>;

  for (const item of items) {
    if (matchesQuery(item, normalized)) {
      counts[item.category] += 1;
    }
  }
  return counts;
}
