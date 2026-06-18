import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

function displayName(
  firstName: string | null,
  lastName: string | null,
  email: string
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || email;
}

export function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center" aria-busy="true">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <PageHeader
          title="Profil"
          description="Connectez-vous pour gérer votre compte convoyeur."
        />
        <Card className="p-5 text-center">
          <p className="mb-4 text-sm text-muted-foreground">Vous n&apos;êtes pas connecté.</p>
          <Link to={ROUTES.login} state={{ from: ROUTES.profile }}>
            <Button className="w-full">Se connecter avec Google</Button>
          </Link>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Profil" description="Compte convoyeur SharingGO" />
      <Card className="mb-4 p-5">
        <p className="text-lg font-semibold text-foreground">
          {displayName(user.firstName, user.lastName, user.email)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </Card>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => void logout()}
      >
        Se déconnecter
      </Button>
    </>
  );
}
