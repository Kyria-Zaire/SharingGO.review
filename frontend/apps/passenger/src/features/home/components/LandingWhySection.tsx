import { BadgePercent, Bus, MessagesSquare, Route } from "lucide-react";
import {
  LANDING_SECTION_IDS,
  WHY_CHOOSE_ITEMS,
} from "@/features/home/constants/landing-content";
import { LandingInfoGridSection } from "./LandingInfoGridSection";

const WHY_ICONS = {
  reliable: Route,
  comfort: Bus,
  pricing: BadgePercent,
  support: MessagesSquare,
} as const;

export function LandingWhySection() {
  return (
    <LandingInfoGridSection
      id={LANDING_SECTION_IDS.why}
      title="Pourquoi choisir SharingGO ?"
      items={WHY_CHOOSE_ITEMS}
      icons={WHY_ICONS}
      iconVariant="primary"
    />
  );
}
