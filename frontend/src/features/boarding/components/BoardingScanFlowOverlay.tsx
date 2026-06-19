import { Loader2 } from "lucide-react";
import { ScanConfirmPanel } from "./ScanConfirmPanel";
import { ScanNetworkError } from "./ScanNetworkError";
import type { BoardingValidationResponse } from "@/types/boarding.types";

export type BoardingScanFlowPhase =
  | "validating"
  | "confirm"
  | "rejected"
  | "consuming"
  | "network-error-validate"
  | "network-error-consume";

interface BoardingScanFlowOverlayProps {
  phase: BoardingScanFlowPhase;
  validateResult: BoardingValidationResponse | null;
  confirmTimeoutMs: number;
  onConfirm: () => void;
  onCancel: () => void;
  onRetryValidate: () => void;
  onRetryConsume: () => void;
}

export function BoardingScanFlowOverlay({
  phase,
  validateResult,
  confirmTimeoutMs,
  onConfirm,
  onCancel,
  onRetryValidate,
  onRetryConsume,
}: BoardingScanFlowOverlayProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boarding-scan-flow-title"
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-8">
        {phase === "validating" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <div>
              <p id="boarding-scan-flow-title" className="text-lg font-semibold text-foreground">
                Vérification du billet…
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Contrôle en cours — ne quittez pas cette page.
              </p>
            </div>
          </div>
        ) : null}

        {phase === "network-error-validate" ? (
          <div className="flex flex-1 flex-col justify-center">
            <h2 id="boarding-scan-flow-title" className="sr-only">
              Erreur réseau — vérification
            </h2>
            <ScanNetworkError context="validate" onRetry={onRetryValidate} onCancel={onCancel} />
          </div>
        ) : null}

        {phase === "network-error-consume" ? (
          <div className="flex flex-1 flex-col justify-center">
            <h2 id="boarding-scan-flow-title" className="sr-only">
              Erreur réseau — embarquement
            </h2>
            <ScanNetworkError context="consume" onRetry={onRetryConsume} onCancel={onCancel} />
          </div>
        ) : null}

        {(phase === "confirm" || phase === "rejected" || phase === "consuming") && validateResult ? (
          <div className="flex flex-1 flex-col justify-center">
            <h2 id="boarding-scan-flow-title" className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {phase === "rejected" ? "Billet refusé" : "Confirmer l'embarquement"}
            </h2>
            <ScanConfirmPanel
              result={validateResult}
              isConsuming={phase === "consuming"}
              confirmTimeoutMs={confirmTimeoutMs}
              onConfirm={onConfirm}
              onCancel={onCancel}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
