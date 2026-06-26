import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SUBSCRIPTIONS_ERROR } from "@/features/subscriptions/constants/subscriptions-content";

export function SubscriptionsErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center border-destructive/20 bg-[#121212] px-6 py-10 text-center"
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <p className="mt-4 text-base font-semibold text-foreground">{SUBSCRIPTIONS_ERROR.title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button variant="secondary" className="mt-6" onClick={onRetry}>
        {SUBSCRIPTIONS_ERROR.retry}
      </Button>
    </div>
  );
}
