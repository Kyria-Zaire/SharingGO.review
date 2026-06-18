import { createContext } from "react";
import type { PassengerUser } from "@/types/auth";

export interface AuthContextValue {
  user: PassengerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<PassengerUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<PassengerUser | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
