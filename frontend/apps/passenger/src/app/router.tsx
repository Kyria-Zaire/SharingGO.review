import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { PassengerLayout } from "@/components/layout/PassengerLayout";
import { BoardingPassPage } from "@/pages/BoardingPassPage";
import { BookingDetailPage } from "@/pages/BookingDetailPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PaymentCancelPage } from "@/pages/PaymentCancelPage";
import { PaymentSuccessPage } from "@/pages/PaymentSuccessPage";
import { PendingReservationPage } from "@/pages/PendingReservationPage";
import { BookingFormPage } from "@/pages/BookingFormPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TripDetailPage } from "@/pages/TripDetailPage";
import { TripsPage } from "@/pages/TripsPage";
import { SubscriptionsPage } from "@/pages/SubscriptionsPage";
export const router = createBrowserRouter([
  {
    element: <PassengerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "trips", element: <TripsPage /> },
      {
        path: "trips/:tripId/book",
        element: (
          <RequireAuth>
            <BookingFormPage />
          </RequireAuth>
        ),
      },
      { path: "trips/:tripId", element: <TripDetailPage /> },
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
        path: "bookings/:reservationId/boarding-pass",
        element: (
          <RequireAuth>
            <BoardingPassPage />
          </RequireAuth>
        ),
      },
      {
        path: "bookings/:reservationId",
        element: (
          <RequireAuth>
            <BookingDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: "profile",
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <RequireAuth>
            <SubscriptionsPage />
          </RequireAuth>
        ),
      },
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
