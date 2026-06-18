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
        <p className="text-sm font-medium text-foreground">Configuration Google OAuth manquante</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Définissez <code className="text-foreground">VITE_GOOGLE_CLIENT_ID</code> dans{" "}
          <code className="text-foreground">frontend/apps/passenger/.env</code> (voir{" "}
          <code className="text-foreground">.env.example</code>). Utilisez le même client ID que{" "}
          <code className="text-foreground">GOOGLE_CLIENT_ID</code> côté backend.
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
