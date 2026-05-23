import type {
  BOARDING_JWT_ALGORITHM_CURRENT,
  BOARDING_JWT_ALGORITHMS_TARGET,
  BOARDING_OFFLINE_UNSUPPORTED_REASON,
  BOARDING_RECOMMENDED_VALIDATION_MODE,
} from "./boarding-offline.constants.js";

export type BoardingJwtAlgorithmCurrent = typeof BOARDING_JWT_ALGORITHM_CURRENT;

export type BoardingJwtAlgorithmTarget = (typeof BOARDING_JWT_ALGORITHMS_TARGET)[number];

export type BoardingOfflineUnsupportedReason = typeof BOARDING_OFFLINE_UNSUPPORTED_REASON;

export type BoardingRecommendedValidationMode = typeof BOARDING_RECOMMENDED_VALIDATION_MODE;

export interface BoardingOfflineValidationCapabilities {
  supported: false;
  reason: BoardingOfflineUnsupportedReason;
  currentAlgorithm: BoardingJwtAlgorithmCurrent;
  targetAlgorithms: readonly BoardingJwtAlgorithmTarget[];
  canDecodePayloadOffline: true;
  canVerifySignatureOffline: false;
  canCheckRevocationOffline: false;
  canPreventDoubleScanOffline: false;
}

export interface BoardingServerValidationCapabilities {
  validateEndpoint: string;
  consumeEndpoint: string;
  recommendedMode: BoardingRecommendedValidationMode;
}

export interface BoardingOfflineCapabilitiesResponse {
  offlineValidation: BoardingOfflineValidationCapabilities;
  serverValidation: BoardingServerValidationCapabilities;
}
