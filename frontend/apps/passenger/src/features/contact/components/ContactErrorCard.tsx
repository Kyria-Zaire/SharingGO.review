import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import { CONTACT_ERROR } from "@/features/contact/constants/contact-content";

export function ContactErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className={cn(landingCardClass, "flex flex-col items-center bg-[#121212] px-6 py-12 text-center")}
      role="alert"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{CONTACT_ERROR.title}</h2>
      <button type="button" onClick={onRetry} className={cn(landingPrimaryButtonClass, "mt-6")}>
        {CONTACT_ERROR.retry}
      </button>
    </div>
  );
}
