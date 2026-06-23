import { Info } from "lucide-react";
import { Card } from "@/components/ui/Card";

const KNOW_ITEMS = [
  "Réservation obligatoire avant le départ",
  "Places limitées — 8 par navette",
  "Présentez-vous à l'heure au point de départ",
  "QR personnel délivré après paiement",
] as const;

export function TripKnowBeforeYouGo() {
  return (
    <Card className="mb-4 border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Info className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-medium text-foreground">Ce qu'il faut savoir</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {KNOW_ITEMS.map((item) => (
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
