import { UserType } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  rbacCheckHandler,
  registerHandler,
} from "./auth.controller.js";
import { requireAuth, requireRole } from "./auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerHandler));
authRouter.post("/login", asyncHandler(loginHandler));
authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(meHandler));
authRouter.post("/logout", asyncHandler(logoutHandler));

/** Technical S0-T4 route — verifies requireRole (not product flow). */
authRouter.get(
  "/foundation/rbac-admin",
  asyncHandler(requireAuth),
  requireRole(UserType.ADMIN, UserType.SUPER_ADMIN),
  asyncHandler(rbacCheckHandler)
);
