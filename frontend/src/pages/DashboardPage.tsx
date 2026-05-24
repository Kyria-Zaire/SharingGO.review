import { LayoutDashboard } from "lucide-react";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";

export function DashboardPage() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Vue d’ensemble opérationnelle : occupation, revenus et alertes."
      icon={LayoutDashboard}
    />
  );
}
