import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCurrentPassenger,
  googleLoginPassenger,
  logoutPassenger,
} from "@/api/auth.api";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const current = await getCurrentPassenger();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    void refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    const loggedIn = await googleLoginPassenger(credential);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    await logoutPassenger();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      isLoading,
      loginWithGoogleCredential,
      logout,
      refreshUser,
    }),
    [user, isLoading, loginWithGoogleCredential, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
