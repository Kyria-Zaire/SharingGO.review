export type NotificationCategory = "trip" | "booking" | "payment" | "system";

export type NotificationVisualKind = "trip" | "reminder" | "payment" | "account" | "system";

export type NotificationActionType = "trip" | "booking" | "boarding-pass" | "subscriptions";

export interface NotificationAction {
  type: NotificationActionType;
  targetId: string;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  visualKind: NotificationVisualKind;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  action?: NotificationAction;
}

export type NotificationTimeGroup = "today" | "this_week" | "older";
