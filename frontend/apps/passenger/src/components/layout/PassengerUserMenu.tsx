import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/types/routes";

function displayName(
  firstName: string | null,
  lastName: string | null,
  email: string
): string {
  const full = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (full) {
    const parts = full.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]!.charAt(0)}.`;
    }
    return full;
  }
  return email.split("@")[0] ?? "Compte";
}

function initials(firstName: string | null, lastName: string | null, email: string): string {
  const f = firstName?.charAt(0) ?? "";
  const l = lastName?.charAt(0) ?? "";
  if (f || l) return `${f}${l}`.toUpperCase();
  return (email.charAt(0) ?? "U").toUpperCase();
}

export interface PassengerUserMenuProps {
  compact?: boolean;
  className?: string;
}

export function PassengerUserMenu({ compact = false, className }: PassengerUserMenuProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  if (isLoading) {
    return (
      <div
        className={cn("h-9 w-9 animate-pulse rounded-full bg-muted", className)}
        aria-hidden
      />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link
        to={ROUTES.login}
        className={cn(
          "inline-flex min-h-touch items-center justify-center rounded-md px-3 text-sm font-medium",
          "text-primary transition-colors hover:text-primary/90",
          className
        )}
      >
        Se connecter
      </Link>
    );
  }

  const name = displayName(user.firstName, user.lastName, user.email);
  const avatarInitials = initials(user.firstName, user.lastName, user.email);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex min-h-touch items-center gap-2 rounded-full py-1 pl-1 pr-2",
          "transition-colors hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground"
          aria-hidden
        >
          {avatarInitials}
        </span>
        {!compact ? (
          <>
            <span className="max-w-[8rem] truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-muted py-1 shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-background/60"
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.profile);
            }}
          >
            <User className="h-4 w-4 text-muted-foreground" aria-hidden />
            Mon profil
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-background/60"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden />
            Se déconnecter
          </button>
        </div>
      ) : null}
    </div>
  );
}
