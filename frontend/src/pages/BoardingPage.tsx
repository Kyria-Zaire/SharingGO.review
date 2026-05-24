import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  consumeBoarding,
  getBoardingOfflineCapabilities,
  validateBoarding,
} from "@/api/admin-boarding.api";
import { ApiError } from "@/api/http";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { queryKeys } from "@/constants/query-keys";
import { BoardingConsumeResult } from "@/features/boarding/components/BoardingConsumeResult";
import { BoardingScannerPanel } from "@/features/boarding/components/BoardingScannerPanel";
import { BoardingValidateResult } from "@/features/boarding/components/BoardingValidateResult";
import { OfflineCapabilityCard } from "@/features/boarding/components/OfflineCapabilityCard";
import { ScanHistoryList } from "@/features/boarding/components/ScanHistoryList";
import { appendScanHistory } from "@/features/boarding/utils/scan-history";
import type {
  BoardingConsumeResponse,
  BoardingScanHistoryEntry,
  BoardingValidationResponse,
} from "@/types/boarding.types";

const OFFLINE_STALE_TIME_MS = 60_000;

function historyFromValidate(result: BoardingValidationResponse): Omit<BoardingScanHistoryEntry, "id" | "at"> {
  if (result.valid) {
    return {
      action: "validate",
      uiStatus: "success",
      title: "Contrôle valide",
      reservationId: result.reservation.id,
    };
  }
  return {
    action: "validate",
    uiStatus: "error",
    title: "Contrôle refusé",
    reason: result.reason,
  };
}

function historyFromConsume(result: BoardingConsumeResponse): Omit<BoardingScanHistoryEntry, "id" | "at"> {
  const reservationId =
    "reservation" in result && result.reservation ? result.reservation.id : undefined;

  return {
    action: "consume",
    uiStatus: result.ui.status,
    title: result.ui.title,
    reason: "reason" in result ? result.reason : undefined,
    reservationId,
  };
}

export function BoardingPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [validateResult, setValidateResult] = useState<BoardingValidationResponse | null>(null);
  const [consumeResult, setConsumeResult] = useState<BoardingConsumeResponse | null>(null);
  const [scanHistory, setScanHistory] = useState<BoardingScanHistoryEntry[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);

  const offlineQuery = useQuery({
    queryKey: queryKeys.boarding.offlineCapabilities,
    queryFn: getBoardingOfflineCapabilities,
    staleTime: OFFLINE_STALE_TIME_MS,
  });

  const validateMutation = useMutation({
    mutationFn: (token: string) => validateBoarding(token.trim()),
    onMutate: () => setRequestError(null),
    onSuccess: (result) => {
      setValidateResult(result);
      setConsumeResult(null);
      setScanHistory((prev) => appendScanHistory(prev, historyFromValidate(result)));
    },
    onError: (error) => {
      setRequestError(
        error instanceof ApiError ? error.message : "Échec de la validation"
      );
    },
  });

  const consumeMutation = useMutation({
    mutationFn: (token: string) => consumeBoarding(token.trim()),
    onMutate: () => setRequestError(null),
    onSuccess: (result) => {
      setConsumeResult(result);
      setValidateResult(null);
      setScanHistory((prev) => appendScanHistory(prev, historyFromConsume(result)));
    },
    onError: (error) => {
      setRequestError(
        error instanceof ApiError ? error.message : "Échec de la consommation"
      );
    },
  });

  function handleClearScan() {
    setTokenInput("");
    setValidateResult(null);
    setConsumeResult(null);
    setRequestError(null);
  }

  function handleValidate() {
    const token = tokenInput.trim();
    if (!token) return;
    validateMutation.mutate(token);
  }

  function handleConsume() {
    const token = tokenInput.trim();
    if (!token) return;
    consumeMutation.mutate(token);
  }

  return (
    <>
      <PageHeader
        title="Boarding Operations"
        description="Validation et supervision des embarquements"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <BoardingScannerPanel
            tokenInput={tokenInput}
            onTokenChange={setTokenInput}
            onValidate={handleValidate}
            onConsume={handleConsume}
            onClear={handleClearScan}
            isValidating={validateMutation.isPending}
            isConsuming={consumeMutation.isPending}
          />

          {requestError ? (
            <ErrorState message={requestError} onRetry={() => setRequestError(null)} />
          ) : null}

          {validateResult ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Résultat — contrôle
              </h3>
              <BoardingValidateResult result={validateResult} />
            </section>
          ) : null}

          {consumeResult ? (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Résultat — consommation
              </h3>
              <BoardingConsumeResult result={consumeResult} />
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
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
                20 derniers scans — mémoire session uniquement (pas de stockage local).
              </p>
            </div>
            <ScanHistoryList entries={scanHistory} />
          </section>
        </div>
      </div>
    </>
  );
}
