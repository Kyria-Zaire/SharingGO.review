import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function BookingsPage() {
  return (
    <>
      <PageHeader title="Réservations" description="Vos trajets réservés" />
      <Card>
        <p className="text-center text-base text-muted-foreground">Aucune réservation</p>
      </Card>
    </>
  );
}
