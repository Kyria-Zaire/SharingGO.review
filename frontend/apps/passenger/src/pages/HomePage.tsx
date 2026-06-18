import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function HomePage() {
  return (
    <>
      <PageHeader title="Accueil" description="Navette SharingGO — Châlons-en-Champagne ↔ Paris-Vatry" />
      <Card>
        <p className="text-center text-lg font-medium text-foreground">Bienvenue sur SharingGO</p>
      </Card>
    </>
  );
}
