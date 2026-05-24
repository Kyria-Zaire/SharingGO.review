export interface OpsRunbook {
  id: string;
  title: string;
  path: string;
  description: string;
  criticalBilling?: boolean;
}

export const OPS_RUNBOOKS: OpsRunbook[] = [
  {
    id: "stripe",
    title: "Stripe webhook failures",
    path: "docs/runbooks/stripe-webhook-failures.md",
    description:
      "Paiements, abonnements, accès et réservations — priorité critique si webhooks en échec.",
    criticalBilling: true,
  },
  {
    id: "ops-health",
    title: "Health & readiness monitoring",
    path: "docs/runbooks/ops-health-monitoring.md",
    description: "Sondes /health et /ready, checks DB, configuration et Stripe.",
  },
  {
    id: "boarding-offline",
    title: "Boarding offline mode",
    path: "docs/runbooks/boarding-offline-mode.md",
    description: "ONLINE_FIRST, HS256 actuel, migration RS256/EdDSA future.",
  },
];

export const OPS_RUNBOOKS_REPO_BLOB_BASE =
  "https://github.com/Kyria-Zaire/SharingGO.review/blob/main";
