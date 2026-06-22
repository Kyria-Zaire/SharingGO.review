import {
  Activity,
  AlertTriangle,
  Bus,
  Clock,
  CreditCard,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  PlaneTakeoff,
  QrCode,
  Repeat,
  ScrollText,
  Settings,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
  /** Future: dynamic badge via useOpenIncidentCount for incidents */
  showOpenIncidentBadge?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard, end: true },
      { label: "Trips", href: ROUTES.trips, icon: Bus },
      { label: "Reservations", href: ROUTES.reservations, icon: Ticket },
      { label: "Payments", href: ROUTES.payments, icon: CreditCard },
      { label: "Subscriptions", href: ROUTES.subscriptions, icon: Repeat },
      { label: "Boarding", href: ROUTES.boarding, icon: QrCode },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Departures", href: ROUTES.departures, icon: PlaneTakeoff },
      {
        label: "Incidents",
        href: ROUTES.incidents,
        icon: AlertTriangle,
        showOpenIncidentBadge: true,
      },
      { label: "Historique", href: ROUTES.exploitationHistory, icon: ScrollText },
      { label: "Reports", href: ROUTES.reports, icon: FileSpreadsheet },
      { label: "Dispatch", href: ROUTES.dispatch, icon: Clock },
      { label: "Activité", href: ROUTES.activity, icon: History },
    ],
  },
  {
    items: [
      { label: "Monitoring", href: ROUTES.monitoring, icon: Activity },
      { label: "Settings", href: ROUTES.settings, icon: Settings },
    ],
  },
];

/** @deprecated use ADMIN_NAV_SECTIONS */
export const ADMIN_NAV_ITEMS: NavItem[] = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);
