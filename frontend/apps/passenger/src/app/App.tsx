import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import { env } from "@/lib/env";
import { queryClient } from "./query-client";
import { router } from "./router";

function MissingGoogleClientId() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-foreground">Connexion temporairement indisponible</p>
        <p className="mt-2 text-sm text-muted-foreground">
          La connexion Google n&apos;est pas disponible pour le moment. Réessayez plus tard ou
          contactez le support SharingGO.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  if (!env.googleClientId) {
    return <MissingGoogleClientId />;
  }

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
