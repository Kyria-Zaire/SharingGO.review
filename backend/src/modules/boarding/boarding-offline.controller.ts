import type { Request, Response } from "express";
import { getBoardingOfflineCapabilities } from "./boarding-offline.service.js";

/** Public capability manifest — no auth, no PII, no cryptographic material (S2-T6). */
export async function getBoardingOfflineCapabilitiesHandler(
  _req: Request,
  res: Response
): Promise<void> {
  res.status(200).json(getBoardingOfflineCapabilities());
}
