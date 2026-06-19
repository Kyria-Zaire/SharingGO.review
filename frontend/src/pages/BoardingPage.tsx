import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  consumeBoarding,
  getBoardingOfflineCapabilities,
  validateBoarding,
} from "@/api/admin-boarding.api";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { queryKeys } from "@/constants/query-keys";
import { BoardingScanFeedback } from "@/features/boarding/components/BoardingScanFeedback";
import { BoardingScannerPanel } from "@/features/boarding/components/BoardingScannerPanel";
import { OfflineCapabilityCard } from "@/features/boarding/components/OfflineCapabilityCard";
import { ScanConfirmPanel } from "@/features/boarding/components/ScanConfirmPanel";
import { ScanNetworkError } from "@/features/boarding/components/ScanNetworkError";
import { ScanHistoryList } from "@/features/boarding/components/ScanHistoryList";
import { useCameraScanner } from "@/features/boarding/hooks/useCameraScanner";
import { appendScanHistory } from "@/features/boarding/utils/scan-history";
import type {
  BoardingConsumeResponse,
  BoardingScanHistoryEntry,
  BoardingValidationResponse,
} from "@/types/boarding.types";

const OFFLINE_STALE_TIME_MS = 60_000;
// CTO spec: auto-cancel confirm after 18 s of inactivity
const CONFIRM_TIMEOUT_MS = 18_000;

/**
 * Unified scan state machine (camera AND manual share the same phases).
 *
 *  idle ──────────────────────────────────────────────────────────────┐
 *    │ QR detected / manual submit                                    │
 *    ▼                                                                │
 *  validating                                                         │
 *    │ success (valid)     │ success (invalid)   │ network error      │
 *    ▼                     ▼                     ▼                   │
 *  confirm (18 s)       rejected             network-error-validate  │
 *    │ user taps          │ cancel/retry        │ retry / cancel      │
 *    │ timeout ───────────┘                    └────────────────────►│
 *    ▼                                                                │
 *  consuming                                                          │
 *    │ success             │ network error                           │
 *    ▼                     ▼                                          │
 *  feedback          network-error-consume ──► retry ──► consuming   │
 *    │ 1.5 s                                                          │
 *    └──────────────────────────────────────────────────────────────►┘
 */
type ScanPhase =
  | "idle"
  | "validating"
  | "confirm"
  | "rejected"
  | "network-error-validate"
  | "consuming"
  | "network-error-consume"
  | "feedback";

function historyFromValidate(result: BoardingValidationResponse): Omit<BoardingScanHistoryEntry, "id" | "at"> {
  if (result.valid) {
    return { action: "validate", uiStatus: "success", title: "Contrôle valide", reservationId: result.reservation.id };
  }
  return { action: "validate", uiStatus: "error", title: "Contrôle refusé", reason: result.reason };
}

function isBoardingAlreadyUsed(result: BoardingConsumeResponse): boolean {
  return (
    result.valid &&
    !result.consumed &&
    "reason" in result &&
    result.reason === "BOARDING_ALREADY_USED"
  );
}

function historyFromConsume(
  result: BoardingConsumeResponse,
  isRetryAlreadyUsedSuccess = false
): Omit<BoardingScanHistoryEntry, "id" | "at"> {
  const reservationId =
    "reservation" in result && result.reservation ? result.reservation.id : undefined;

  if (isRetryAlreadyUsedSuccess) {
    return {
      action: "consume",
      uiStatus: "success",
      title: "Embarquement déjà enregistré",
      reason: "BOARDING_ALREADY_USED",
      reservationId,
    };
  }

  return {
    action: "consume",
    uiStatus: result.ui.status,
    title: result.ui.title,
    reason: "reason" in result ? result.reason : undefined,
    reservationId,
  };
}

export function BoardingPage() {
  // ── Shared scan state machine ──────────────────────────────────────────────
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [validateResult, setValidateResult] = useState<BoardingValidationResponse | null>(null);
  const [consumeResult, setConsumeResult] = useState<BoardingConsumeResponse | null>(null);
  const [consumeFeedbackVariant, setConsumeFeedbackVariant] = useState<
    "default" | "retry-already-used-success"
  >("default");
  const [scanHistory, setScanHistory] = useState<BoardingScanHistoryEntry[]>([]);
  const isConsumeRetryAfterNetworkErrorRef = useRef(false);

  // ── Manual textarea state (separate from the shared scan machine) ──────────
  const [tokenInput, setTokenInput] = useState("");

  // ── Offline capabilities query ─────────────────────────────────────────────
  const offlineQuery = useQuery({
    queryKey: queryKeys.boarding.offlineCapabilities,
    queryFn: getBoardingOfflineCapabilities,
    staleTime: OFFLINE_STALE_TIME_MS,
  });

  // ── Shared: reset all scan state and resume scanner ───────────────────────
  const camera = useCameraScanner(
    useCallback((token: string) => triggerValidate(token), []), // eslint-disable-line react-hooks/exhaustive-deps
    phase !== "idle"
  );

  function resetToIdle() {
    setPhase("idle");
    setScannedToken(null);
    setValidateResult(null);
    setConsumeResult(null);
    setConsumeFeedbackVariant("default");
    isConsumeRetryAfterNetworkErrorRef.current = false;
    camera.resumeScan();
  }

  // ── Shared validate mutation ───────────────────────────────────────────────
  const validateMutation = useMutation({
    mutationFn: (token: string) => validateBoarding(token),
    onSuccess: (result) => {
      setValidateResult(result);
      setScanHistory((prev) => appendScanHistory(prev, historyFromValidate(result)));
      setPhase(result.valid ? "confirm" : "rejected");
    },
    onError: () => {
      setPhase("network-error-validate");
    },
  });

  // ── Shared consume mutation ────────────────────────────────────────────────
  const consumeMutation = useMutation({
    mutationFn: (token: string) => consumeBoarding(token),
    onSuccess: (result) => {
      const isRetryAfterNetworkError = isConsumeRetryAfterNetworkErrorRef.current;
      isConsumeRetryAfterNetworkErrorRef.current = false;

      const isRetryAlreadyUsedSuccess =
        isRetryAfterNetworkError && isBoardingAlreadyUsed(result);

      setConsumeResult(result);
      setConsumeFeedbackVariant(isRetryAlreadyUsedSuccess ? "retry-already-used-success" : "default");
      setScanHistory((prev) =>
        appendScanHistory(prev, historyFromConsume(result, isRetryAlreadyUsedSuccess))
      );
      setPhase("feedback");
    },
    onError: () => {
      setPhase("network-error-consume");
    },
  });

  // ── Trigger validate (camera or manual) ───────────────────────────────────
  function triggerValidate(token: string) {
    setScannedToken(token);
    setValidateResult(null);
    setConsumeResult(null);
    setPhase("validating");
    validateMutation.mutate(token);
  }

  // ── Manual submit → same validate flow ────────────────────────────────────
  function handleManualSubmit() {
    const token = tokenInput.trim();
    if (!token) return;
    triggerValidate(token);
  }

  // ── Confirm: user taps "Confirmer embarquement" ───────────────────────────
  function handleConfirm() {
    if (!scannedToken) return;
    isConsumeRetryAfterNetworkErrorRef.current = false;
    setPhase("consuming");
    consumeMutation.mutate(scannedToken);
  }

  // ── Cancel / rescanner ────────────────────────────────────────────────────
  function handleCancel() {
    resetToIdle();
  }

  // ── Retry after network error ─────────────────────────────────────────────
  function handleRetryValidate() {
    if (!scannedToken) return;
    setPhase("validating");
    validateMutation.mutate(scannedToken);
  }

  function handleRetryConsume() {
    if (!scannedToken) return;
    isConsumeRetryAfterNetworkErrorRef.current = true;
    setPhase("consuming");
    consumeMutation.mutate(scannedToken);
  }

  // ── Timeout: auto-cancel confirm after 18 s ───────────────────────────────
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase === "confirm") {
      confirmTimerRef.current = setTimeout(() => {
        resetToIdle();
      }, CONFIRM_TIMEOUT_MS);
    }
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab switch: reset all scan state ─────────────────────────────────────
  function handleTabChange() {
    if (phase !== "idle" && phase !== "feedback") {
      resetToIdle();
    }
    // Clear manual textarea results too
    setTokenInput("");
  }

  // ── Camera permission ─────────────────────────────────────────────────────
  const handleCameraRequestPermission = useCallback(async () => {
    await camera.requestPermission();
  }, [camera]);

  // ── Feedback done (1.5 s) → resume ───────────────────────────────────────
  const handleFeedbackDone = useCallback(() => {
    resetToIdle();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ─────────────────────────────────────────────────────────────────
  const showConfirmPanel =
    phase === "confirm" || phase === "consuming" || phase === "rejected";

  return (
    <>
      {/* Full-screen consume feedback overlay (1.5 s) */}
      {phase === "feedback" && consumeResult ? (
        <BoardingScanFeedback
          result={consumeResult}
          variant={consumeFeedbackVariant}
          onDone={handleFeedbackDone}
        />
      ) : null}

      <PageHeader
        title="Boarding Operations"
        description="Validation et supervision des embarquements"
        className="mb-4 sm:mb-6"
      />

      <div className="grid min-w-0 max-w-full gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <BoardingScannerPanel
            /* manual */
            tokenInput={tokenInput}
            onTokenChange={setTokenInput}
            onManualSubmit={handleManualSubmit}
            onClear={resetToIdle}
            isValidating={phase === "validating"}
            isConsuming={phase === "consuming"}
            /* camera */
            cameraPermission={camera.permission}
            cameraIsScanning={camera.isScanning}
            cameraPaused={phase !== "idle"}
            onCameraDetected={camera.handleDetected}
            onCameraRequestPermission={handleCameraRequestPermission}
            /* tab switch */
            onTabChange={handleTabChange}
          />

          {/* Validating spinner */}
          {phase === "validating" ? (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Vérification du billet…
            </p>
          ) : null}

          {/* Network error — validate */}
          {phase === "network-error-validate" ? (
            <ScanNetworkError
              context="validate"
              onRetry={handleRetryValidate}
              onCancel={handleCancel}
            />
          ) : null}

          {/* Network error — consume */}
          {phase === "network-error-consume" ? (
            <ScanNetworkError
              context="consume"
              onRetry={handleRetryConsume}
              onCancel={handleCancel}
            />
          ) : null}

          {/* Confirm / rejected panel */}
          {showConfirmPanel && validateResult ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Résultat scan
              </h3>
              <ScanConfirmPanel
                result={validateResult}
                isConsuming={phase === "consuming"}
                confirmTimeoutMs={CONFIRM_TIMEOUT_MS}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </section>
          ) : null}
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <OfflineCapabilityCard
            data={offlineQuery.data}
            isLoading={offlineQuery.isLoading}
            isError={offlineQuery.isError}
            onRetry={() => offlineQuery.refetch()}
          />

          <section className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Historique session</h3>
              <p className="text-sm text-muted-foreground">
                20 derniers scans — mémoire session uniquement.
              </p>
            </div>
            <ScanHistoryList entries={scanHistory} />
          </section>
        </div>
      </div>

      {/* Standalone error display for offline capabilities */}
      {offlineQuery.isError ? (
        <ErrorState
          message="Impossible de charger les capacités offline"
          onRetry={() => offlineQuery.refetch()}
        />
      ) : null}
    </>
  );
}
