import type {
  BoardingConsumeResponse,
  BoardingValidationResponse,
  OfflineCapabilitiesResponse,
} from "@/types/boarding.types";
import { http } from "./http";

export async function validateBoarding(boardingToken: string): Promise<BoardingValidationResponse> {
  return http<BoardingValidationResponse>("/api/boarding/validate", {
    method: "POST",
    body: { boardingToken },
  });
}

export async function consumeBoarding(boardingToken: string): Promise<BoardingConsumeResponse> {
  return http<BoardingConsumeResponse>("/api/boarding/consume", {
    method: "POST",
    body: { boardingToken },
  });
}

export async function getBoardingOfflineCapabilities(): Promise<OfflineCapabilitiesResponse> {
  return http<OfflineCapabilitiesResponse>("/api/boarding/offline-capabilities");
}
