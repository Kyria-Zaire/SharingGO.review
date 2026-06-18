import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil" />
      <Card>
        <p className="text-center text-base text-foreground">Mon compte</p>
      </Card>
    </>
  );
}
