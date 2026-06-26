import { getUiDemoNotificationsPool } from "@/features/notifications/demo/demo-notifications";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";
import { isUiDemoTripsEnabled } from "@/lib/ui-demo-trips";

export function getNotificationsForUi(): NotificationItem[] {
  if (!isUiDemoTripsEnabled()) {
    return [];
  }
  return getUiDemoNotificationsPool();
}
