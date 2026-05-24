import { CreditCard } from "lucide-react";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";

export function PaymentsPage() {
  return (
    <PlaceholderPage
      title="Payments"
      description="Historique des paiements tickets, abonnements et accès subscription."
      icon={CreditCard}
    />
  );
}
