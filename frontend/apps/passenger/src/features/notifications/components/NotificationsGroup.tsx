import { NOTIFICATIONS_GROUP_LABELS } from "@/features/notifications/constants/notifications-content";
import { NotificationCard } from "@/features/notifications/components/NotificationCard";
import type { NotificationTimeGroup } from "@/features/notifications/types/notifications.types";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";

export function NotificationsGroup({
  group,
  items,
  onMarkRead,
}: {
  group: NotificationTimeGroup;
  items: NotificationItem[];
  onMarkRead: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`notifications-group-${group}`}>
      <h2
        id={`notifications-group-${group}`}
        className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {NOTIFICATIONS_GROUP_LABELS[group]}
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <NotificationCard notification={item} onMarkRead={onMarkRead} />
          </li>
        ))}
      </ul>
    </section>
  );
}
