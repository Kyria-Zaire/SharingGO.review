import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { landingContainerClass, landingSecondaryButtonClass } from "@/features/home/lib/landing-layout";
import { NotificationsEmptyState } from "@/features/notifications/components/NotificationsEmptyState";
import { NotificationsErrorCard } from "@/features/notifications/components/NotificationsErrorCard";
import { NotificationsFilterTabs } from "@/features/notifications/components/NotificationsFilterTabs";
import { NotificationsGroup } from "@/features/notifications/components/NotificationsGroup";
import { NotificationsHeroSection } from "@/features/notifications/components/NotificationsHeroSection";
import { NotificationsSkeleton } from "@/features/notifications/components/NotificationsSkeleton";
import {
  NotificationsFilterPopover,
  NotificationsFilterSheet,
  NotificationsToolbar,
} from "@/features/notifications/components/NotificationsToolbar";
import { NOTIFICATIONS_HERO_CONTENT, NOTIFICATIONS_LOAD_MORE } from "@/features/notifications/constants/notifications-content";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { groupNotificationsByTime } from "@/features/notifications/lib/notification-grouping";
import type { NotificationTimeGroup } from "@/features/notifications/types/notifications.types";

const GROUP_ORDER: NotificationTimeGroup[] = ["today", "this_week", "older"];

export function NotificationsView() {
  const {
    visible,
    tab,
    setTab,
    readFilter,
    setReadFilter,
    tabCounts,
    unreadCount,
    hasMore,
    hasError,
    isEmpty,
    isTabEmpty,
    markAllRead,
    markAsRead,
    loadMore,
    retry,
    resetVisibleOnFilterChange,
    isPending,
  } = useNotifications();

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const grouped = useMemo(() => groupNotificationsByTime(visible), [visible]);

  const handleTabChange = (next: typeof tab) => {
    setTab(next);
    resetVisibleOnFilterChange();
  };

  const handleReadFilterChange = (next: typeof readFilter) => {
    setReadFilter(next);
    resetVisibleOnFilterChange();
  };

  const canMarkAllRead = unreadCount > 0;

  return (
    <div className="w-full">
      <NotificationsHeroSection
        onMarkAllRead={markAllRead}
        canMarkAllRead={canMarkAllRead}
        unreadCount={unreadCount}
      />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-8 lg:-mt-10", "pb-8 pt-0 lg:pb-12")}>
          {canMarkAllRead ? (
            <button
              type="button"
              onClick={markAllRead}
              className={cn(landingSecondaryButtonClass, "mb-4 w-full lg:hidden")}
            >
              {NOTIFICATIONS_HERO_CONTENT.markAllRead}
              <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
                {unreadCount}
              </span>
            </button>
          ) : null}

          <NotificationsFilterTabs
            value={tab}
            onChange={handleTabChange}
            counts={tabCounts}
          />

          {!isEmpty ? (
            <div className="relative">
              <NotificationsToolbar
                readFilter={readFilter}
                onOpenFilter={() => {
                  if (window.matchMedia("(min-width: 1024px)").matches) {
                    setFilterPopoverOpen((open) => !open);
                  } else {
                    setFilterOpen(true);
                  }
                }}
              />
              <NotificationsFilterPopover
                open={filterPopoverOpen}
                readFilter={readFilter}
                onClose={() => setFilterPopoverOpen(false)}
                onReadFilterChange={handleReadFilterChange}
              />
            </div>
          ) : null}

          {isPending ? <NotificationsSkeleton /> : null}

          {hasError && !isPending ? (
            <div className="pt-6">
              <NotificationsErrorCard onRetry={retry} />
            </div>
          ) : null}

          {!isPending && !hasError && isEmpty ? (
            <div className="pt-6">
              <NotificationsEmptyState />
            </div>
          ) : null}

          {!isPending && !hasError && isTabEmpty ? (
            <div className="pt-6">
              <NotificationsEmptyState variant="tab" />
            </div>
          ) : null}

          {!isPending && !hasError && !isEmpty && !isTabEmpty ? (
            <div className="space-y-8 pt-6">
              {GROUP_ORDER.map((group) => {
                const items = grouped[group];
                if (!items?.length) return null;
                return (
                  <NotificationsGroup
                    key={group}
                    group={group}
                    items={items}
                    onMarkRead={markAsRead}
                  />
                );
              })}

              {hasMore ? (
                <Button variant="secondary" className="w-full" onClick={loadMore}>
                  {NOTIFICATIONS_LOAD_MORE}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <NotificationsFilterSheet
        open={filterOpen}
        readFilter={readFilter}
        onClose={() => setFilterOpen(false)}
        onReadFilterChange={handleReadFilterChange}
      />
    </div>
  );
}
