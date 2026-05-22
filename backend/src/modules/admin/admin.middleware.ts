import { UserType } from "@prisma/client";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

export const adminMiddleware = [
  asyncHandler(requireAuth),
  requireRole(UserType.ADMIN, UserType.SUPER_ADMIN),
] as const;
