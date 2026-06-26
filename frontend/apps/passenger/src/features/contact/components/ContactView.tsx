import { cn } from "@/lib/cn";
import { landingContainerClass } from "@/features/home/lib/landing-layout";
import { ContactFaqCard } from "@/features/contact/components/ContactFaqCard";
import { ContactFormCard } from "@/features/contact/components/ContactFormCard";
import { ContactHeroSection } from "@/features/contact/components/ContactHeroSection";
import { ContactMethodsGrid } from "@/features/contact/components/ContactMethodsGrid";
import { ContactReassuranceCard } from "@/features/contact/components/ContactReassuranceCard";
import { ContactUsefulLinks } from "@/features/contact/components/ContactUsefulLinks";

export function ContactView() {
  return (
    <div className="w-full">
      <ContactHeroSection />

      <div className={landingContainerClass}>
        <div className={cn("relative z-20 -mt-4 sm:-mt-8 lg:-mt-10", "pb-8 pt-6 lg:pb-12")}>
          <div className="space-y-8">
            <ContactMethodsGrid />

            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <ContactFormCard />

              <aside className="space-y-6">
                <ContactFaqCard />
                <ContactReassuranceCard />
                <ContactUsefulLinks />
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
