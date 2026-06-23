import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/types/routes";

export interface PassengerLogoProps {
  className?: string;
  centered?: boolean;
}

export function PassengerLogo({ className, centered }: PassengerLogoProps) {
  return (
    <Link
      to={ROUTES.home}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-90",
        centered && "justify-center",
        className
      )}
      aria-label="SharingGO — Accueil"
    >
      <BrandLogo size="sm" />
    </Link>
  );
}
