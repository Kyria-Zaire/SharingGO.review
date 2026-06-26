import { useCallback, useMemo, useState } from "react";
import { getNotificationsForUi } from "@/features/notifications/demo/merge-demo-notifications";
import type { NotificationReadFilter, NotificationTab } from "@/features/notifications/lib/notification-tabs";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";

const PAGE_SIZE = 8;

function filterByTab(items: NotificationItem[], tab: NotificationTab): NotificationItem[] {
  if (tab === "all") return items;
  return items.filter((item) => item.category === tab);
}

function filterByRead(items: NotificationItem[], readFilter: NotificationReadFilter): NotificationItem[] {
  if (readFilter === "all") return items;
  if (readFilter === "unread") return items.filter((item) => !item.read);
  return items.filter((item) => item.read);
}

export function useNotifications() {
  const initialItems = useMemo(() => getNotificationsForUi(), []);
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [tab, setTab] = useState<NotificationTab>("all");
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>("all");
  const [hasError] = useState(false);

  const filtered = useMemo(() => {
    const byTab = filterByTab(items, tab);
    return filterByRead(byTab, readFilter).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [items, tab, readFilter]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const tabCounts = useMemo(() => {
    const byRead = filterByRead(items, readFilter);
    return {
      all: byRead.length,
      trip: byRead.filter((item) => item.category === "trip").length,
      booking: byRead.filter((item) => item.category === "booking").length,
      payment: byRead.filter((item) => item.category === "payment").length,
      system: byRead.filter((item) => item.category === "system").length,
    } satisfies Record<NotificationTab, number>;
  }, [items, readFilter]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const markAllRead = useCallback(() => {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  const retry = useCallback(() => {
    setItems(getNotificationsForUi());
    setVisibleCount(PAGE_SIZE);
  }, []);

  const resetVisibleOnFilterChange = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
  }, []);

  return {
    items,
    visible,
    filtered,
    tab,
    setTab,
    readFilter,
    setReadFilter,
    tabCounts,
    unreadCount,
    hasMore: visible.length < filtered.length,
    hasError,
    isEmpty: items.length === 0,
    isTabEmpty: filtered.length === 0 && items.length > 0,
    markAllRead,
    markAsRead,
    loadMore,
    retry,
    resetVisibleOnFilterChange,
    isPending: false,
  };
}
