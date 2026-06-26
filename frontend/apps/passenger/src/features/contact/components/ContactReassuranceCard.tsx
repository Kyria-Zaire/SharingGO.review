import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { landingCardClass } from "@/features/home/lib/landing-layout";
import { CONTACT_REASSURANCE } from "@/features/contact/constants/contact-content";

export function ContactReassuranceCard() {
  return (
    <aside
      className={cn(landingCardClass, "bg-[#121212] p-6")}
      aria-labelledby="contact-reassurance-title"
    >
      <h2 id="contact-reassurance-title" className="text-base font-semibold text-foreground">
        {CONTACT_REASSURANCE.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{CONTACT_REASSURANCE.intro}</p>

      <ul className="mt-4 space-y-2">
        {CONTACT_REASSURANCE.topics.map((topic) => (
          <li key={topic} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {topic}
          </li>
        ))}
      </ul>
    </aside>
  );
}
