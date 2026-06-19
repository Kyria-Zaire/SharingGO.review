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
import {
  BoardingScanFlowOverlay,
  type BoardingScanFlowPhase,
} from "@/features/boarding/components/BoardingScanFlowOverlay";
import { BoardingScannerPanel } from "@/features/boarding/components/BoardingScannerPanel";
import { OfflineCapabilityCard } from "@/features/boarding/components/OfflineCapabilityCard";
import { ScanHistoryList } from "@/features/boarding/components/ScanHistoryList";
import { useCameraScanner } from "@/features/boarding/hooks/useCameraScanner";
import {
  boardingDevLog,
  maskBoardingToken,
  normalizeBoardingToken,
} from "@/features/boarding/utils/boarding-dev-log";
import { resolveBoardingErrorMessage } from "@/features/boarding/utils/boarding-error-messages";
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

function isFlowOverlayPhase(phase: ScanPhase): phase is BoardingScanFlowPhase {
  return (
    phase === "validating" ||
    phase === "confirm" ||
    phase === "rejected" ||
    phase === "consuming" ||
    phase === "network-error-validate" ||
    phase === "network-error-consume"
  );
}

function historyFromValidate(result: BoardingValidationResponse): Omit<BoardingScanHistoryEntry, "id" | "at"> {
  if (result.valid) {
    return { action: "validate", uiStatus: "success", title: "Contrôle valide", reservationId: result.reservation.id };
  }
  return {
    action: "validate",
    uiStatus: "error",
    title: resolveBoardingErrorMessage(result.reason).title,
    reason: result.reason,
  };
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

  const reason = "reason" in result ? result.reason : undefined;

  return {
    action: "consume",
    uiStatus: result.ui.status,
    title: reason ? resolveBoardingErrorMessage(reason).title : result.ui.title,
    reason,
    reservationId,
  };
}

export function BoardingPage() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [validateResult, setValidateResult] = useState<BoardingValidationResponse | null>(null);
  const [consumeResult, setConsumeResult] = useState<BoardingConsumeResponse | null>(null);
  const [consumeFeedbackVariant, setConsumeFeedbackVariant] = useState<
    "default" | "retry-already-used-success"
  >("default");
  const [scanHistory, setScanHistory] = useState<BoardingScanHistoryEntry[]>([]);
  const [tokenInput, setTokenInput] = useState("");

  const isConsumeRetryAfterNetworkErrorRef = useRef(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cameraRef = useRef<ReturnType<typeof useCameraScanner> | null>(null);

  const offlineQuery = useQuery({
    queryKey: queryKeys.boarding.offlineCapabilities,
    queryFn: getBoardingOfflineCapabilities,
    staleTime: OFFLINE_STALE_TIME_MS,
  });

  const validateMutation = useMutation({
    mutationFn: (token: string) => validateBoarding(token),
    onSuccess: (result) => {
      boardingDevLog("validate success", {
        valid: result.valid,
        reason: result.valid ? undefined : result.reason,
        reservationId: result.valid ? result.reservation.id : undefined,
      });
      setValidateResult(result);
      setScanHistory((prev) => appendScanHistory(prev, historyFromValidate(result)));
      const nextPhase = result.valid ? "confirm" : "rejected";
      boardingDevLog("ui transition", { from: "validating", to: nextPhase });
      setPhase(nextPhase);
    },
    onError: (error) => {
      boardingDevLog("validate error", {
        message: error instanceof Error ? error.message : "unknown",
      });
      boardingDevLog("ui transition", { from: "validating", to: "network-error-validate" });
      setPhase("network-error-validate");
    },
  });

  const consumeMutation = useMutation({
    mutationFn: (token: string) => consumeBoarding(token),
    onSuccess: (result) => {
      const isRetryAfterNetworkError = isConsumeRetryAfterNetworkErrorRef.current;
      isConsumeRetryAfterNetworkErrorRef.current = false;

      const isRetryAlreadyUsedSuccess =
        isRetryAfterNetworkError && isBoardingAlreadyUsed(result);

      boardingDevLog("consume success", {
        consumed: result.consumed,
        valid: result.valid,
        reason: "reason" in result ? result.reason : undefined,
        retryAlreadyUsedSuccess: isRetryAlreadyUsedSuccess,
      });

      setConsumeResult(result);
      setConsumeFeedbackVariant(isRetryAlreadyUsedSuccess ? "retry-already-used-success" : "default");
      setScanHistory((prev) =>
        appendScanHistory(prev, historyFromConsume(result, isRetryAlreadyUsedSuccess))
      );
      boardingDevLog("ui transition", { from: "consuming", to: "feedback" });
      setPhase("feedback");
    },
    onError: (error) => {
      boardingDevLog("consume error", {
        message: error instanceof Error ? error.message : "unknown",
      });
      boardingDevLog("ui transition", { from: "consuming", to: "network-error-consume" });
      setPhase("network-error-consume");
    },
  });

  const resetToIdle = useCallback(() => {
    boardingDevLog("ui transition", { from: phase, to: "idle" });
    setPhase("idle");
    setScannedToken(null);
    setValidateResult(null);
    setConsumeResult(null);
    setConsumeFeedbackVariant("default");
    isConsumeRetryAfterNetworkErrorRef.current = false;
    cameraRef.current?.resumeScan();
  }, [phase]);

  const triggerValidate = useCallback(
    (rawToken: string) => {
      const token = normalizeBoardingToken(rawToken);
      if (!token) return;

      boardingDevLog("scan detected", {
        token: maskBoardingToken(token),
        jwtParts: token.split(".").length,
      });

      cameraRef.current?.lockProcessing();
      setScannedToken(token);
      setValidateResult(null);
      setConsumeResult(null);
      boardingDevLog("validate request started");
      boardingDevLog("ui transition", { from: phase, to: "validating" });
      setPhase("validating");
      validateMutation.mutate(token);
    },
    [phase, validateMutation]
  );

  const camera = useCameraScanner(triggerValidate, phase !== "idle");
  cameraRef.current = camera;

  function handleManualSubmit() {
    const token = normalizeBoardingToken(tokenInput);
    if (!token) return;
    triggerValidate(token);
  }

  function handleConfirm() {
    if (!scannedToken) return;
    isConsumeRetryAfterNetworkErrorRef.current = false;
    boardingDevLog("ui transition", { from: phase, to: "consuming" });
    setPhase("consuming");
    consumeMutation.mutate(scannedToken);
  }

  function handleCancel() {
    resetToIdle();
  }

  function handleRetryValidate() {
    if (!scannedToken) return;
    boardingDevLog("validate retry");
    boardingDevLog("ui transition", { from: phase, to: "validating" });
    setPhase("validating");
    validateMutation.mutate(scannedToken);
  }

  function handleRetryConsume() {
    if (!scannedToken) return;
    isConsumeRetryAfterNetworkErrorRef.current = true;
    boardingDevLog("consume retry after network error");
    boardingDevLog("ui transition", { from: phase, to: "consuming" });
    setPhase("consuming");
    consumeMutation.mutate(scannedToken);
  }

  useEffect(() => {
    if (phase === "confirm") {
      confirmTimerRef.current = setTimeout(() => {
        boardingDevLog("confirm timeout — auto cancel");
        resetToIdle();
      }, CONFIRM_TIMEOUT_MS);
    }
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    };
  }, [phase, resetToIdle]);

  function handleTabChange() {
    if (phase !== "idle" && phase !== "feedback") {
      resetToIdle();
    }
    setTokenInput("");
  }

  const handleCameraRequestPermission = useCallback(async () => {
    await camera.requestPermission();
  }, [camera]);

  const handleFeedbackDone = useCallback(() => {
    resetToIdle();
  }, [resetToIdle]);

  const showFlowOverlay = isFlowOverlayPhase(phase);
  const scannerBusy = phase !== "idle";

  return (
    <>
      {phase === "feedback" && consumeResult ? (
        <BoardingScanFeedback
          result={consumeResult}
          variant={consumeFeedbackVariant}
          onDone={handleFeedbackDone}
        />
      ) : null}

      {showFlowOverlay ? (
        <BoardingScanFlowOverlay
          phase={phase}
          validateResult={validateResult}
          confirmTimeoutMs={CONFIRM_TIMEOUT_MS}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onRetryValidate={handleRetryValidate}
          onRetryConsume={handleRetryConsume}
        />
      ) : null}

      <PageHeader
        title="Boarding Operations"
        description="Validation et supervision des embarquements"
        className="mb-4 sm:mb-6"
      />

      <div className="grid min-w-0 max-w-full gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <BoardingScannerPanel
            tokenInput={tokenInput}
            onTokenChange={setTokenInput}
            onManualSubmit={handleManualSubmit}
            onClear={resetToIdle}
            isValidating={phase === "validating"}
            isConsuming={phase === "consuming"}
            disabled={scannerBusy}
            cameraPermission={camera.permission}
            cameraIsScanning={camera.isScanning}
            cameraPaused={scannerBusy}
            cameraEnabled={phase === "idle"}
            onCameraDetected={camera.handleDetected}
            onCameraRequestPermission={handleCameraRequestPermission}
            onTabChange={handleTabChange}
          />
        </div>

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

      {offlineQuery.isError ? (
        <ErrorState
          message="Impossible de charger les capacités offline"
          onRetry={() => offlineQuery.refetch()}
        />
      ) : null}
    </>
  );
}
