import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SUBSCRIPTIONS_MOSOLF_CODE_FLOW } from "@/features/subscriptions/constants/subscriptions-content";
import { isMosolfEmailEligible } from "@/features/subscriptions/lib/mosolf-eligibility";

export function SubscriptionsMosolfCodeDialog({
  open,
  userEmail,
  onClose,
  onContinueCheckout,
}: {
  open: boolean;
  userEmail: string | undefined;
  onClose: () => void;
  onContinueCheckout: () => void;
}) {
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "result">("input");
  const emailEligible = isMosolfEmailEligible(userEmail);
  const codeProvided = code.trim().length >= 4;

  if (!open) return null;

  const handleVerify = () => {
    if (!codeProvided) return;
    setStep("result");
  };

  const handleClose = () => {
    setCode("");
    setStep("input");
    onClose();
  };

  const handleContinue = () => {
    if (!emailEligible) return;
    handleClose();
    onContinueCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        aria-label="Fermer"
        onClick={handleClose}
      />
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#161616]",
          "p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:p-6"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mosolf-code-title"
      >
        <h2 id="mosolf-code-title" className="text-lg font-semibold text-foreground">
          {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.description}
        </p>

        {step === "input" ? (
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.codeLabel}
              </span>
              <input
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={SUBSCRIPTIONS_MOSOLF_CODE_FLOW.codePlaceholder}
                className="mt-2 min-h-touch w-full rounded-lg border border-white/15 bg-[#121212] px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                autoComplete="off"
              />
            </label>
            <Button className="w-full" size="lg" disabled={!codeProvided} onClick={handleVerify}>
              {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.submitLabel}
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="rounded-xl border border-white/[0.08] bg-[#121212] px-4 py-3 text-sm text-muted-foreground">
              {emailEligible
                ? SUBSCRIPTIONS_MOSOLF_CODE_FLOW.eligibleHint
                : SUBSCRIPTIONS_MOSOLF_CODE_FLOW.ineligibleHint}
            </p>
            {emailEligible ? (
              <Button className="w-full" size="lg" onClick={handleContinue}>
                {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.continueCheckout}
              </Button>
            ) : (
              <a
                href={`mailto:${SUBSCRIPTIONS_MOSOLF_CODE_FLOW.supportEmail}`}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-md bg-primary px-6 text-base font-bold text-primary-foreground hover:bg-primary/90"
              >
                {SUBSCRIPTIONS_MOSOLF_CODE_FLOW.contactSupport}
              </a>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
