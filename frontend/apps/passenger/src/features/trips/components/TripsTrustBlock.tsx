import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TRUST_ITEMS = [
  "Réservation obligatoire",
  "Places limitées",
  "QR personnel après paiement",
  "Paiement sécurisé",
] as const;

export function TripsTrustBlock() {
  return (
    <Card className="mb-5 border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-sm font-medium text-foreground">Bon à savoir</p>
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {TRUST_ITEMS.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-primary" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
