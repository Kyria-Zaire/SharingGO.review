export { cn } from "./cn";

export function getInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }
  return email?.charAt(0).toUpperCase() ?? "?";
}

export function displayName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  return full || email || "Utilisateur";
}
