import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function TripsPage() {
  return (
    <>
      <PageHeader title="Trajets" description="Horaires et places disponibles" />
      <Card>
        <p className="text-center text-base text-muted-foreground">
          Les trajets seront disponibles prochainement
        </p>
      </Card>
    </>
  );
}
