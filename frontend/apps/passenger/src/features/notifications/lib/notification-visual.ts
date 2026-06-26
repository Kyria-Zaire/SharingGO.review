import {
  Bell,
  Bus,
  Clock3,
  CreditCard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { NotificationVisualKind } from "@/features/notifications/types/notifications.types";

export interface NotificationVisualStyle {
  icon: LucideIcon;
  iconClass: string;
  containerClass: string;
}

export const NOTIFICATION_VISUAL_STYLES: Record<NotificationVisualKind, NotificationVisualStyle> = {
  trip: {
    icon: Bus,
    iconClass: "text-primary",
    containerClass: "border-primary/35 bg-primary/10",
  },
  reminder: {
    icon: Clock3,
    iconClass: "text-sky-400",
    containerClass: "border-sky-500/35 bg-sky-500/10",
  },
  payment: {
    icon: CreditCard,
    iconClass: "text-amber-400",
    containerClass: "border-amber-500/35 bg-amber-500/10",
  },
  account: {
    icon: Sparkles,
    iconClass: "text-violet-400",
    containerClass: "border-violet-500/35 bg-violet-500/10",
  },
  system: {
    icon: Bell,
    iconClass: "text-muted-foreground",
    containerClass: "border-white/15 bg-white/5",
  },
};
