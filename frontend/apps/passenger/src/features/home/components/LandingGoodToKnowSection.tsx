import { Clock, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import {
  GOOD_TO_KNOW_ITEMS,
  LANDING_SECTION_IDS,
} from "@/features/home/constants/landing-content";
import { LandingInfoGridSection } from "./LandingInfoGridSection";

const GOOD_TO_KNOW_ICONS = {
  schedule: Clock,
  booking: Smartphone,
  cancel: ShieldCheck,
  qr: QrCode,
} as const;

export function LandingGoodToKnowSection() {
  return (
    <LandingInfoGridSection
      anchorIds={[LANDING_SECTION_IDS.howItWorks, LANDING_SECTION_IDS.goodToKnow]}
      title="Bon à savoir"
      items={GOOD_TO_KNOW_ITEMS}
      icons={GOOD_TO_KNOW_ICONS}
      iconVariant="muted"
    />
  );
}
