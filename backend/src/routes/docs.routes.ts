import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "../docs/openapi.js";

export const docsRouter = Router();

docsRouter.get("/docs.json", (_req, res) => {
  res.json(openApiDocument);
});

docsRouter.use("/docs", swaggerUi.serve);
docsRouter.get(
  "/docs",
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: "Sharing Go API",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);
