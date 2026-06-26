import { ROUTES } from "@/types/routes";
import type {
  NotificationAction,
  NotificationItem,
} from "@/features/notifications/types/notifications.types";

export function resolveNotificationHref(notification: NotificationItem): string | null {
  if (!notification.action) {
    return null;
  }
  return resolveNotificationActionHref(notification.action);
}

export function resolveNotificationActionHref(action: NotificationAction): string | null {
  switch (action.type) {
    case "trip":
      return ROUTES.tripDetail(action.targetId);
    case "booking":
      return ROUTES.bookingDetail(action.targetId);
    case "boarding-pass":
      return ROUTES.boardingPass(action.targetId);
    case "subscriptions":
      return ROUTES.subscriptions;
    default:
      return null;
  }
}
