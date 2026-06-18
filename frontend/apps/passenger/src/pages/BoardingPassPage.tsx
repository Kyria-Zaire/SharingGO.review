import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function BoardingPassPage() {
  return (
    <>
      <PageHeader title="Boarding pass" description="Votre billet numérique" />
      <Card className="border-primary/30 bg-primary/5">
        <p className="text-center text-base text-foreground">Votre QR sera affiché ici</p>
      </Card>
    </>
  );
}
