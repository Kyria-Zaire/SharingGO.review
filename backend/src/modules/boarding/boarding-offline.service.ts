import {
  BOARDING_JWT_ALGORITHM_CURRENT,
  BOARDING_JWT_ALGORITHMS_TARGET,
  BOARDING_OFFLINE_UNSUPPORTED_REASON,
  BOARDING_RECOMMENDED_VALIDATION_MODE,
  BOARDING_SERVER_CONSUME_PATH,
  BOARDING_SERVER_VALIDATE_PATH,
} from "./boarding-offline.constants.js";
import type { BoardingOfflineCapabilitiesResponse } from "./boarding-offline.types.js";

/**
 * Static capability manifest for future mobile offline mode (S2-T6).
 * No secrets, keys, or reservation data — safe for unauthenticated access.
 */
export function getBoardingOfflineCapabilities(): BoardingOfflineCapabilitiesResponse {
  return {
    offlineValidation: {
      supported: false,
      reason: BOARDING_OFFLINE_UNSUPPORTED_REASON,
      currentAlgorithm: BOARDING_JWT_ALGORITHM_CURRENT,
      targetAlgorithms: BOARDING_JWT_ALGORITHMS_TARGET,
      canDecodePayloadOffline: true,
      canVerifySignatureOffline: false,
      canCheckRevocationOffline: false,
      canPreventDoubleScanOffline: false,
    },
    serverValidation: {
      validateEndpoint: BOARDING_SERVER_VALIDATE_PATH,
      consumeEndpoint: BOARDING_SERVER_CONSUME_PATH,
      recommendedMode: BOARDING_RECOMMENDED_VALIDATION_MODE,
    },
  };
}
