import { LandingDeparturesSection } from "@/features/home/components/LandingDeparturesSection";
import { LandingGoodToKnowSection } from "@/features/home/components/LandingGoodToKnowSection";
import { LandingHeroSection } from "@/features/home/components/LandingHeroSection";
import { LandingSubscriptionsSection } from "@/features/home/components/LandingSubscriptionsSection";
import { LandingWhySection } from "@/features/home/components/LandingWhySection";

export function LandingPage() {
  return (
    <article className="overflow-x-hidden">
      <LandingHeroSection />
      <LandingDeparturesSection />
      <LandingSubscriptionsSection />
      <LandingWhySection />
      <LandingGoodToKnowSection />
    </article>
  );
}
