import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass, landingContainerClass, landingSectionClass } from "@/features/home/lib/landing-layout";

export interface LandingInfoItem {
  id: string;
  title: string;
  description: string;
}

export interface LandingInfoGridSectionProps {
  id?: string;
  anchorIds?: string[];
  title: string;
  items: readonly LandingInfoItem[];
  icons: Record<string, LucideIcon>;
  iconVariant?: "primary" | "muted";
  titleCentered?: boolean;
}

export function LandingInfoGridSection({
  id,
  anchorIds,
  title,
  items,
  icons,
  iconVariant = "primary",
  titleCentered = true,
}: LandingInfoGridSectionProps) {
  const titleId = `${id ?? title.replace(/\s+/g, "-").toLowerCase()}-title`;

  return (
    <section
      className={cn(landingSectionClass, "border-t border-white/[0.06]")}
      aria-labelledby={titleId}
    >
      {anchorIds?.map((anchorId) => (
        <div key={anchorId} id={anchorId} className="scroll-mt-24" />
      ))}
      {id ? <div id={id} className="scroll-mt-24" /> : null}

      <div className={landingContainerClass}>
        <h2
          id={titleId}
          className={cn(
            "mb-8 text-xl font-bold text-foreground sm:text-2xl",
            titleCentered && "text-center"
          )}
        >
          {title}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = icons[item.id];
            return (
              <article
                key={item.id}
                className={cn(
                  landingCardClass,
                  "flex gap-4 p-5 transition-colors hover:border-white/10",
                  "bg-[#161616]"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                    iconVariant === "primary"
                      ? "border border-primary/30 bg-primary/10 text-primary"
                      : "border border-white/10 bg-[#141414] text-foreground"
                  )}
                >
                  {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
