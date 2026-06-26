import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { HelpCategoriesGrid } from "@/features/help/components/HelpCategoriesGrid";
import { HelpEmptyState } from "@/features/help/components/HelpEmptyState";
import { HelpFaqSection } from "@/features/help/components/HelpFaqSection";
import { HelpHeroSection } from "@/features/help/components/HelpHeroSection";
import { HelpSearchBar } from "@/features/help/components/HelpSearchBar";
import { HelpSupportCard } from "@/features/help/components/HelpSupportCard";
import { HelpTravelTips } from "@/features/help/components/HelpTravelTips";
import { HelpUsefulLinks } from "@/features/help/components/HelpUsefulLinks";
import { HELP_FAQ_ITEMS } from "@/features/help/constants/help-content";
import type { HelpCategoryFilter } from "@/features/help/lib/help-categories";
import {
  countFaqByCategory,
  filterHelpFaqItems,
} from "@/features/help/lib/help-search";

export function HelpView() {
  const { hash } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategoryFilter>("all");

  const categoryCounts = useMemo(
    () => countFaqByCategory(HELP_FAQ_ITEMS, searchQuery),
    [searchQuery]
  );

  const filteredItems = useMemo(
    () => filterHelpFaqItems(HELP_FAQ_ITEMS, searchQuery, selectedCategory),
    [searchQuery, selectedCategory]
  );

  const hasActiveFilter = searchQuery.trim().length > 0 || selectedCategory !== "all";

  useEffect(() => {
    if (!hash) return;

    const anchorId = hash.replace(/^#/, "");
    if (!anchorId) return;

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(anchorId);
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hash]);

  return (
    <div className="w-full">
      <HelpHeroSection />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-8 lg:-mt-10", "pb-8 pt-6 lg:pb-12")}>
          <div className="space-y-8">
            <HelpSearchBar value={searchQuery} onChange={setSearchQuery} />

            <HelpCategoriesGrid
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              counts={categoryCounts}
            />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
              <div className="min-w-0 space-y-8">
                {filteredItems.length > 0 ? (
                  <HelpFaqSection items={filteredItems} />
                ) : hasActiveFilter ? (
                  <HelpEmptyState />
                ) : (
                  <HelpFaqSection items={HELP_FAQ_ITEMS} />
                )}

                <div className="lg:hidden">
                  <HelpTravelTips />
                </div>
              </div>

              <aside className="space-y-6 lg:sticky lg:top-24">
                <HelpSupportCard />
                <HelpUsefulLinks />
                <div className="hidden lg:block">
                  <HelpTravelTips />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
