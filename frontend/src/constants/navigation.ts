import {
  Activity,
  AlertTriangle,
  Bus,
  CreditCard,
  LayoutDashboard,
  PlaneTakeoff,
  QrCode,
  Repeat,
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

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard, end: true },
  { label: "Trips", href: ROUTES.trips, icon: Bus },
  { label: "Reservations", href: ROUTES.reservations, icon: Ticket },
  { label: "Payments", href: ROUTES.payments, icon: CreditCard },
  { label: "Subscriptions", href: ROUTES.subscriptions, icon: Repeat },
  { label: "Boarding", href: ROUTES.boarding, icon: QrCode },
  { label: "Departures", href: ROUTES.departures, icon: PlaneTakeoff },
  { label: "Incidents", href: ROUTES.incidents, icon: AlertTriangle, showOpenIncidentBadge: true },
  { label: "Monitoring", href: ROUTES.monitoring, icon: Activity },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
];
