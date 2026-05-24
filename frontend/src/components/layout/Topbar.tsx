import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/api/auth.api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABELS } from "@/constants/roles";
import { OperationsSearch } from "@/features/search/components/OperationsSearch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { invalidateAuthQueries } from "@/lib/query";
import { displayName } from "@/lib/utils";

export function Topbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await invalidateAuthQueries(queryClient);
      navigate(ROUTES.login, { replace: true });
    },
  });

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-6">
      <p className="shrink-0 text-sm text-muted-foreground lg:hidden">SharingGO Admin</p>
      <div className="hidden min-w-0 flex-1 justify-center lg:flex">
        <OperationsSearch />
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">
              {displayName(user.firstName, user.lastName, user.email)}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant="success">{ROLE_LABELS[user.userType]}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            isLoading={logoutMutation.isPending}
            aria-label="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </header>
  );
}
