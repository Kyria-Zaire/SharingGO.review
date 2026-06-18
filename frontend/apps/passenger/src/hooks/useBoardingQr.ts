import { useQuery } from "@tanstack/react-query";
import { getBoardingQr } from "@/api/boarding.api";
import { ApiError } from "@/api/http";
import { queryKeys } from "@/constants/query-keys";

const BOARDING_QR_STALE_MS = 30_000;

function shouldRetryBoardingQr(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return true;
  }
  if (error.status === 401) return false;
  if (error.status === 404) return false;
  if (error.status === 409) return false;
  if (error.status === 410) return false;
  return true;
}

export function useBoardingQr(reservationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.boarding.qr(reservationId ?? "unknown"),
    queryFn: () => getBoardingQr(reservationId!),
    enabled: Boolean(reservationId),
    staleTime: BOARDING_QR_STALE_MS,
    retry: (failureCount, error) =>
      shouldRetryBoardingQr(error) && failureCount < 1,
  });
}
