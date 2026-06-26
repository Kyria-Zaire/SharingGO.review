import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { SETTINGS_ERROR } from "@/features/settings/constants/settings-content";

export function SettingsErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={cn(
        landingCardClass,
        "flex flex-col items-center border-destructive/20 bg-[#121212] px-6 py-10 text-center"
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <p className="mt-4 text-base font-semibold text-foreground">{SETTINGS_ERROR.title}</p>
      <Button variant="secondary" className="mt-6" onClick={onRetry}>
        {SETTINGS_ERROR.retry}
      </Button>
    </div>
  );
}
