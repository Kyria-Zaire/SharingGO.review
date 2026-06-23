import { cn } from "@/lib/cn";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/constants/brand-assets";

export type BrandLogoSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<BrandLogoSize, string> = {
  sm: "h-14",
  md: "h-[4.5rem]",
  lg: "h-[5.5rem]",
};

export interface BrandLogoProps {
  className?: string;
  size?: BrandLogoSize;
}

export function BrandLogo({ className, size = "sm" }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt={BRAND_LOGO_ALT}
      className={cn("w-auto shrink-0", SIZE_CLASS[size], className)}
      decoding="async"
    />
  );
}
