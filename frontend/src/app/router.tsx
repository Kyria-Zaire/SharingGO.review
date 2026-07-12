import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { AdminRoute } from "@/guards/AdminRoute";
import { BoardingPage } from "@/pages/BoardingPage";
import { DeparturesPage } from "@/pages/DeparturesPage";
import { ActivityPage } from "@/pages/ActivityPage";
import { DispatchPage } from "@/pages/DispatchPage";
import { ExploitationHistoryDetailPage } from "@/pages/ExploitationHistoryDetailPage";
import { ExploitationHistoryListPage } from "@/pages/ExploitationHistoryListPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { MonitoringPage } from "@/pages/MonitoringPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentsPage } from "@/pages/PaymentsPage";
import { RefundQueuePage } from "@/pages/RefundQueuePage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReservationsPage } from "@/pages/ReservationsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
import { TripsPage } from "@/pages/TripsPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    element: <AdminRoute />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "trips", element: <TripsPage /> },
      { path: "reservations", element: <ReservationsPage /> },
      { path: "refunds", element: <RefundQueuePage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "boarding", element: <BoardingPage /> },
      { path: "departures", element: <DeparturesPage /> },
      { path: "incidents", element: <IncidentsPage /> },
      { path: "history", element: <ExploitationHistoryListPage /> },
      { path: "history/:tripId", element: <ExploitationHistoryDetailPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "activity", element: <ActivityPage /> },
      { path: "dispatch", element: <DispatchPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
