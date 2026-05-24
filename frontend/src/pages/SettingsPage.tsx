import { Settings } from "lucide-react";
import { PlaceholderPage } from "@/components/pages/PlaceholderPage";

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Préférences cockpit, équipe et configuration opérationnelle."
      icon={Settings}
    />
  );
}
