import { Clock3, IdCard, Luggage } from "lucide-react";
import {
  BOARDING_PASS_INFO_ARRIVAL,
  BOARDING_PASS_INFO_ID,
  BOARDING_PASS_INFO_LUGGAGE,
  BOARDING_PASS_INFO_SECTION_TITLE,
} from "@/features/boarding-pass/constants/boarding-pass-content";

const CARD_CLASS =
  "rounded-2xl border border-white/[0.08] bg-[#121212] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

const INFO_ITEMS = [
  { icon: Clock3, ...BOARDING_PASS_INFO_ARRIVAL },
  { icon: IdCard, ...BOARDING_PASS_INFO_ID },
  { icon: Luggage, ...BOARDING_PASS_INFO_LUGGAGE },
] as const;

export function BoardingPassInfoSection() {
  return (
    <section className={CARD_CLASS} aria-labelledby="boarding-pass-info-title">
      <h2 id="boarding-pass-info-title" className="text-base font-semibold text-foreground">
        {BOARDING_PASS_INFO_SECTION_TITLE}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {INFO_ITEMS.map((item) => (
          <article key={item.title} className="space-y-2">
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-primary" aria-hidden />
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
