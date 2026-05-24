import { http } from "./http";
import type { AuthResponse, LoginInput, User } from "@/types/auth.types";

export async function getMe(): Promise<User> {
  return http<User>("/api/auth/me");
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  return http<AuthResponse>("/api/auth/login", { method: "POST", body: input });
}

export async function logout(): Promise<void> {
  return http<void>("/api/auth/logout", { method: "POST" });
}
