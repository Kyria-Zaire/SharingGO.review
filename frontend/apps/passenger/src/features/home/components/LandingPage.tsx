import { BenefitsSection } from "@/features/home/components/BenefitsSection";
import { FaqSection } from "@/features/home/components/FaqSection";
import { FinalCtaSection } from "@/features/home/components/FinalCtaSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { HowItWorksSection } from "@/features/home/components/HowItWorksSection";
import { PricingSection } from "@/features/home/components/PricingSection";
import { RouteSection } from "@/features/home/components/RouteSection";

export function LandingPage() {
  return (
    <article className="-mx-1">
      <HeroSection />
      <RouteSection />
      <HowItWorksSection />
      <PricingSection />
      <BenefitsSection />
      <FaqSection />
      <FinalCtaSection />
    </article>
  );
}
