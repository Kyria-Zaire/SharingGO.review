import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingOutlineButtonClass } from "@/features/home/lib/landing-layout";
import {
  NOTIFICATIONS_READ_FILTER_LABELS,
  NOTIFICATIONS_TOOLBAR,
} from "@/features/notifications/constants/notifications-content";
import {
  NOTIFICATION_READ_FILTERS,
  type NotificationReadFilter,
} from "@/features/notifications/lib/notification-tabs";

export function NotificationsToolbar({
  readFilter,
  onOpenFilter,
}: {
  readFilter: NotificationReadFilter;
  onOpenFilter: () => void;
}) {
  const activeLabel = NOTIFICATIONS_READ_FILTER_LABELS[readFilter];

  return (
    <div className="flex items-center justify-between gap-3 pt-5">
      <p className="text-sm text-muted-foreground">
        Filtre : <span className="font-medium text-foreground">{activeLabel}</span>
      </p>
      <button
        type="button"
        onClick={onOpenFilter}
        className={cn(landingOutlineButtonClass, "gap-2 px-4 py-2 text-sm")}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        {NOTIFICATIONS_TOOLBAR.filter}
      </button>
    </div>
  );
}

export function NotificationsFilterSheet({
  open,
  readFilter,
  onClose,
  onReadFilterChange,
}: {
  open: boolean;
  readFilter: NotificationReadFilter;
  onClose: () => void;
  onReadFilterChange: (filter: NotificationReadFilter) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Fermer le filtre"
        onClick={onClose}
      />
      <div
        className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-white/[0.08] bg-[#161616] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-filter-title"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 id="notifications-filter-title" className="text-base font-semibold text-foreground">
            {NOTIFICATIONS_TOOLBAR.filterTitle}
          </h2>
          <button type="button" onClick={onClose} className="text-sm font-medium text-primary">
            {NOTIFICATIONS_TOOLBAR.filterClose}
          </button>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">{NOTIFICATIONS_TOOLBAR.filterHint}</p>
        <ul className="space-y-2">
          {NOTIFICATION_READ_FILTERS.map((filter) => {
            const isActive = filter === readFilter;
            return (
              <li key={filter}>
                <button
                  type="button"
                  onClick={() => {
                    onReadFilterChange(filter);
                    onClose();
                  }}
                  className={cn(
                    "flex min-h-touch w-full items-center rounded-lg px-4 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  {NOTIFICATIONS_READ_FILTER_LABELS[filter]}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function NotificationsFilterPopover({
  open,
  readFilter,
  onClose,
  onReadFilterChange,
}: {
  open: boolean;
  readFilter: NotificationReadFilter;
  onClose: () => void;
  onReadFilterChange: (filter: NotificationReadFilter) => void;
}) {
  if (!open) return null;

  return (
    <div className="relative hidden lg:block">
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        aria-label="Fermer le filtre"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#161616] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        role="menu"
      >
        <p className="px-3 py-2 text-xs text-muted-foreground">{NOTIFICATIONS_TOOLBAR.filterHint}</p>
        {NOTIFICATION_READ_FILTERS.map((filter) => {
          const isActive = filter === readFilter;
          return (
            <button
              key={filter}
              type="button"
              role="menuitem"
              onClick={() => {
                onReadFilterChange(filter);
                onClose();
              }}
              className={cn(
                "flex min-h-touch w-full items-center rounded-lg px-3 text-left text-sm font-medium transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-foreground hover:bg-white/[0.04]"
              )}
            >
              {NOTIFICATIONS_READ_FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
