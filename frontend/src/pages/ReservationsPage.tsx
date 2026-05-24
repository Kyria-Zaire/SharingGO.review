import { Ticket } from "lucide-react";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";

export function ReservationsPage() {
  return (
    <PlaceholderPage
      title="Reservations"
      description="Supervision des réservations confirmées, pending et consommations."
      icon={Ticket}
    />
  );
}
