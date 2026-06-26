import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getCurrentPassenger,
  googleLoginPassenger,
  loginPassengerEmailPassword,
  logoutPassenger,
  registerPassengerEmailPassword,
} from "@/api/auth.api";
import {
  clearGoogleProfilePicture,
  persistGooglePictureFromCredential,
} from "@/features/profile/lib/google-profile-picture";
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
    persistGooglePictureFromCredential(credential);
    const loggedIn = await googleLoginPassenger(credential);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const loginWithEmailPassword = useCallback(async (email: string, password: string) => {
    const loggedIn = await loginPassengerEmailPassword({ email, password });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const registerWithEmailPassword = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const loggedIn = await registerPassengerEmailPassword(input);
      setUser(loggedIn);
      return loggedIn;
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutPassenger();
    clearGoogleProfilePicture();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      isLoading,
      loginWithGoogleCredential,
      loginWithEmailPassword,
      registerWithEmailPassword,
      logout,
      refreshUser,
    }),
    [
      user,
      isLoading,
      loginWithGoogleCredential,
      loginWithEmailPassword,
      registerWithEmailPassword,
      logout,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
