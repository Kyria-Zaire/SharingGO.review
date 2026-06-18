import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PassengerLayout } from "@/components/layout/PassengerLayout";
import { BoardingPassPage } from "@/pages/BoardingPassPage";
import { BookingDetailPlaceholderPage } from "@/pages/BookingDetailPlaceholderPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentCancelPage } from "@/pages/PaymentCancelPage";
import { PaymentSuccessPage } from "@/pages/PaymentSuccessPage";
import { PendingReservationPage } from "@/pages/PendingReservationPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TripDetailPage } from "@/pages/TripDetailPage";
import { TripsPage } from "@/pages/TripsPage";
export const router = createBrowserRouter([
  {
    element: <PassengerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "trips/:tripId", element: <TripDetailPage /> },
      { path: "trips", element: <TripsPage /> },
      { path: "bookings", element: <RequireAuth><BookingsPage /></RequireAuth> },
      {
        path: "bookings/payment/success",
        element: (
          <RequireAuth>
            <PaymentSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: "bookings/payment/cancel",
        element: (
          <RequireAuth>
            <PaymentCancelPage />
          </RequireAuth>
        ),
      },
      {
        path: "bookings/pending/:pendingReservationId",
        element: (
          <RequireAuth>
            <PendingReservationPage />
          </RequireAuth>
        ),
      },
      {
        path: "bookings/:reservationId",
        element: (
          <RequireAuth>
            <BookingDetailPlaceholderPage />
          </RequireAuth>
        ),
      },
      { path: "boarding-pass", element: <BoardingPassPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
