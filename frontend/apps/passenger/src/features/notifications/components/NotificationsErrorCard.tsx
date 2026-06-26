import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { NOTIFICATIONS_ERROR } from "@/features/notifications/constants/notifications-content";

export function NotificationsErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center border-destructive/20 bg-[#121212] px-6 py-10 text-center"
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <p className="mt-4 text-base font-semibold text-foreground">{NOTIFICATIONS_ERROR.title}</p>
      <Button variant="secondary" className="mt-6" onClick={onRetry}>
        {NOTIFICATIONS_ERROR.retry}
      </Button>
    </div>
  );
}
