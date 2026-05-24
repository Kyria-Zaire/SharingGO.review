import { ArrowRight, CreditCard, Repeat, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ROUTES } from "@/constants/routes";

const PLANS = [
  {
    id: "mosolf",
    name: "Mosolf Monthly",
    description: "Abonnement mensuel Mosolf — éligibilité email @mosolf.com ou demo.",
    price: "40,00 € / mois",
    backendType: "MOSOLF_MONTHLY",
  },
  {
    id: "convoyeur",
    name: "Convoyeur Monthly",
    description: "Abonnement mensuel convoyeur — checkout Stripe mode subscription.",
    price: "30,00 € / mois",
    backendType: "CONVOYEUR_MONTHLY",
  },
] as const;

const STRIPE_LIFECYCLE = [
  "checkout.session.completed (mode subscription)",
  "customer.subscription.created / updated / deleted",
  "invoice.paid / payment_failed",
  "Webhooks idempotents côté backend",
];

const ADMIN_LIMITATIONS = [
  "Pas de liste admin abonnements (GET /api/admin/subscriptions à venir)",
  "Pas de détail client abonnement dans le cockpit",
  "Pas de remboursement ni portail Stripe depuis l’admin",
  "Supervision financière via la page Paiements (types SUBSCRIPTION / SUBSCRIPTION_ACCESS)",
];

export function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Abonnements"
        description="Cockpit abonnements — V1 informative, backend-ready"
      />

      <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <Repeat className="mt-0.5 h-5 w-5 text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Support admin volontairement limité en V1</p>
            <p className="text-sm text-muted-foreground">
              Le cycle de vie Stripe est implémenté côté backend. L’API admin de liste
              abonnements n’existe pas encore — cette page prépare le futur cockpit détaillé.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <Card key={plan.id} className="border-border">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <Badge variant="success">Backend actif</Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">{plan.description}</p>
            <p className="mb-3 text-sm font-medium text-foreground">{plan.price}</p>
            <p className="font-mono text-xs text-muted-foreground">Type : {plan.backendType}</p>
          </Card>
        ))}
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Lifecycle Stripe (backend)</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {STRIPE_LIFECYCLE.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">État actuel admin</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {ADMIN_LIMITATIONS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="border-primary/30">
        <h3 className="mb-2 text-lg font-semibold text-foreground">Paiements liés aux abonnements</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          En attendant le cockpit abonnement, filtrez les paiements de type Abonnement ou Accès
          abonnement (réservations à 0,00 € via SUBSCRIPTION_ACCESS).
        </p>
        <Link
          to={ROUTES.payments}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Voir les paiements abonnement
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Backend follow-up : GET /api/admin/subscriptions — abonnements actifs, expirés, canceled,
        past_due, filtrage status/type, détail client.
      </p>
    </>
  );
}
