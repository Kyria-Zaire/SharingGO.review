import type { BoardingQrResponse } from "@/types/boarding";
import { http } from "./http";

export async function getBoardingQr(reservationId: string): Promise<BoardingQrResponse> {
  return http<BoardingQrResponse>(
    `/api/boarding/${encodeURIComponent(reservationId)}/qr`
  );
}
