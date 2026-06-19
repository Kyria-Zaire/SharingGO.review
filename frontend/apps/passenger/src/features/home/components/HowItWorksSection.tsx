import { SectionHeading } from "@/features/home/components/SectionHeading";
import {
  HOW_IT_WORKS_STEPS,
  LANDING_SECTION_IDS,
} from "@/features/home/constants/landing-content";

export function HowItWorksSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      className="scroll-mt-20 border-t border-border py-8"
      aria-labelledby="landing-how-title"
    >
      <SectionHeading
        id="landing-how-title"
        title="Comment ça fonctionne"
        description="Trois étapes pour voyager sereinement."
      />

      <ol className="grid gap-4 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((item) => (
          <li
            key={item.step}
            className="flex gap-4 rounded-xl border border-border bg-muted/20 p-4 md:flex-col md:gap-3"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
              aria-hidden
            >
              {item.step}
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
