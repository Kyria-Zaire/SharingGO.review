import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/types/routes";

export function FinalCtaSection() {
  return (
    <section className="border-t border-border py-8 pb-2" aria-labelledby="landing-final-cta-title">
      <Card className="border-primary/30 bg-primary/5 p-5 text-center">
        <h2 id="landing-final-cta-title" className="text-lg font-semibold text-foreground">
          Prêt à voyager ?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Consultez les prochains départs Châlons ↔ Vatry.
        </p>
        <Link
          to={ROUTES.trips}
          className="mt-5 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:bg-primary/80 sm:w-auto"
        >
          Voir les trajets
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Card>
    </section>
  );
}
