import { Ticket } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TICKET_PRICE_LABEL, TICKET_PRICE_NOTE } from "@/constants/pricing";

export function TripPriceCard() {
  return (
    <Card className="mb-4 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Ticket className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-medium text-foreground">Tarif</h3>
      </div>
      <p className="text-2xl font-semibold text-primary">{TICKET_PRICE_LABEL}</p>
      <p className="mt-1 text-sm text-muted-foreground">{TICKET_PRICE_NOTE} par trajet</p>
    </Card>
  );
}
