import type { Request, Response } from "express";

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
      requestId: req.requestId,
    },
  });
}
