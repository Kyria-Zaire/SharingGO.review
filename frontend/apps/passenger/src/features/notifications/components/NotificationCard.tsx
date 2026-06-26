import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import {
  NOTIFICATIONS_DEMO_BADGE,
  NOTIFICATIONS_UNREAD_BADGE,
} from "@/features/notifications/constants/notifications-content";
import { formatNotificationDateTime } from "@/features/notifications/lib/notification-format";
import { resolveNotificationHref } from "@/features/notifications/lib/notification-routing";
import { NOTIFICATION_VISUAL_STYLES } from "@/features/notifications/lib/notification-visual";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";
import { isDemoNotificationId } from "@/lib/ui-demo-trips";

const CARD_CLASS = cn(
  landingCardClass,
  "border-white/[0.08] bg-[#121212] transition-colors hover:border-white/[0.12]"
);

function NotificationCardInner({ notification }: { notification: NotificationItem }) {
  const visual = NOTIFICATION_VISUAL_STYLES[notification.visualKind];
  const Icon = visual.icon;
  const isDemo = isDemoNotificationId(notification.id);
  const timeLabel = formatNotificationDateTime(notification.createdAt);

  return (
    <>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
          visual.containerClass
        )}
      >
        <Icon className={cn("h-5 w-5", visual.iconClass)} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{notification.title}</h3>
              {!notification.read ? (
                <span className="inline-flex items-center rounded-md border border-primary/35 bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
                  {NOTIFICATIONS_UNREAD_BADGE}
                </span>
              ) : null}
              {isDemo ? (
                <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-amber-200/90">
                  {NOTIFICATIONS_DEMO_BADGE}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {notification.description}
            </p>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <time
              className="text-xs font-medium text-muted-foreground"
              dateTime={notification.createdAt}
            >
              {timeLabel}
            </time>
          </div>
        </div>

        <time
          className="mt-2 block text-xs font-medium text-muted-foreground sm:hidden"
          dateTime={notification.createdAt}
        >
          {timeLabel}
        </time>
      </div>

      {!notification.read ? (
        <span
          className="absolute left-3 top-3 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"
          aria-label="Non lue"
        />
      ) : null}
    </>
  );
}

export function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const href = resolveNotificationHref(notification);
  const handleMarkRead = () => onMarkRead(notification.id);

  const content = (
    <article
      className={cn(CARD_CLASS, "relative flex gap-4 p-4 sm:p-5", !notification.read && "pl-5")}
    >
      <NotificationCardInner notification={notification} />
      {href ? (
        <ChevronRight
          className="mt-2 hidden h-5 w-5 shrink-0 text-muted-foreground lg:block"
          aria-hidden
        />
      ) : null}
    </article>
  );

  if (href) {
    return (
      <Link
        to={href}
        onClick={handleMarkRead}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {content}
      </Link>
    );
  }

  return content;
}
