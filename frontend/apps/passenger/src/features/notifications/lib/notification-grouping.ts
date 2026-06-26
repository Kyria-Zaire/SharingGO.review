import { addParisDays, todayParisDateKey, toParisDateKey } from "@/lib/format-date";
import type {
  NotificationItem,
  NotificationTimeGroup,
} from "@/features/notifications/types/notifications.types";

const GROUP_ORDER: NotificationTimeGroup[] = ["today", "this_week", "older"];

/** Tri décroissant garanti — plus récente en premier, indépendant de l'ordre source. */
function compareNotificationsNewestFirst(
  a: NotificationItem,
  b: NotificationItem
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function sortNotificationsDescending(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort(compareNotificationsNewestFirst);
}

export function groupNotificationsByTime(
  notifications: NotificationItem[]
): Partial<Record<NotificationTimeGroup, NotificationItem[]>> {
  const sortedInput = sortNotificationsDescending(notifications);
  const today = todayParisDateKey();
  const weekStart = addParisDays(today, -6);

  const groups: Record<NotificationTimeGroup, NotificationItem[]> = {
    today: [],
    this_week: [],
    older: [],
  };

  for (const item of sortedInput) {
    const dateKey = toParisDateKey(new Date(item.createdAt));
    if (dateKey === today) {
      groups.today.push(item);
    } else if (dateKey >= weekStart && dateKey < today) {
      groups.this_week.push(item);
    } else {
      groups.older.push(item);
    }
  }

  const result: Partial<Record<NotificationTimeGroup, NotificationItem[]>> = {};
  for (const key of GROUP_ORDER) {
    if (groups[key].length > 0) {
      result[key] = sortNotificationsDescending(groups[key]);
    }
  }
  return result;
}
