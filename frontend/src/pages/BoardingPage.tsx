import { QrCode } from "lucide-react";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";

export function BoardingPage() {
  return (
    <PlaceholderPage
      title="Boarding"
      description="Supervision QR, validation et consommation embarquement."
      icon={QrCode}
    />
  );
}
