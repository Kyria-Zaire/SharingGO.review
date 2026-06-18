import { ArrowLeftRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { ROUTE_FACTS } from "@/features/home/constants/landing-content";

export function RouteSection() {
  return (
    <section className="border-t border-border py-8" aria-labelledby="landing-route-title">
      <SectionHeading
        id="landing-route-title"
        title="La ligne"
        description="Un seul trajet, deux sens, tous les jours ouvrés."
      />

      <Card className="border-primary/25 bg-muted/30 p-0 overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <MapPin className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Châlons-en-Champagne</p>
          </div>

          <div
            className="flex w-12 shrink-0 flex-col items-center justify-center border-x border-border bg-background/50"
            aria-hidden
          >
            <ArrowLeftRight className="h-5 w-5 text-primary" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
            <MapPin className="h-5 w-5 text-primary" aria-hidden />
            <p className="text-sm font-semibold text-foreground">Aéroport Paris-Vatry</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border bg-background/40 px-4 py-3">
          {ROUTE_FACTS.map((fact) => (
            <Badge key={fact} variant="muted">
              {fact}
            </Badge>
          ))}
        </div>
      </Card>
    </section>
  );
}
