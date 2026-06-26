import { Bus, CalendarCheck, CreditCard, LayoutGrid, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { NOTIFICATIONS_TAB_LABELS } from "@/features/notifications/constants/notifications-content";
import {
  NOTIFICATION_TABS,
  type NotificationTab,
} from "@/features/notifications/lib/notification-tabs";

const TAB_ICONS = {
  all: LayoutGrid,
  trip: Bus,
  booking: CalendarCheck,
  payment: CreditCard,
  system: Settings2,
} as const;

export function NotificationsFilterTabs({
  value,
  onChange,
  counts,
}: {
  value: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  counts: Record<NotificationTab, number>;
}) {
  return (
    <div
      className="flex gap-6 overflow-x-auto border-b border-white/[0.08] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Catégories de notifications"
    >
      {NOTIFICATION_TABS.map((tab) => {
        const isActive = value === tab;
        const Icon = TAB_ICONS[tab];
        const count = counts[tab];

        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
              "relative flex min-h-touch shrink-0 items-center gap-2 pb-3 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onChange(tab)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {NOTIFICATIONS_TAB_LABELS[tab]}
            {count > 0 ? (
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
                  isActive ? "bg-primary/20 text-primary" : "bg-white/[0.08] text-muted-foreground"
                )}
              >
                {count}
              </span>
            ) : null}
            {isActive ? (
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
