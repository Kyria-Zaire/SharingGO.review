import {
  addParisDays,
  buildParisIsoDateTime,
  todayParisDateKey,
} from "@/lib/format-date";
import { DEMO_BOOKING_ID_PREFIX, DEMO_NOTIFICATION_ID_PREFIX, DEMO_TRIP_ID_PREFIX } from "@/lib/ui-demo-trips";
import type { NotificationItem } from "@/features/notifications/types/notifications.types";

function hoursAgoToday(hours: number): string {
  const now = new Date();
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number, hour = 10, minute = 0): string {
  const dateKey = addParisDays(todayParisDateKey(), -days);
  return buildParisIsoDateTime(dateKey, hour, minute);
}

/** Pool fixe — IDs `demo-notification-*`. */
export function getUiDemoNotificationsPool(): NotificationItem[] {
  return [
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}reminder-departure-01`,
      category: "trip",
      visualKind: "reminder",
      title: "Départ dans 2 heures",
      description:
        "Votre navette Châlons ↔ Vatry part à 07h00. Pensez à présenter votre QR à l'embarquement.",
      createdAt: hoursAgoToday(2),
      read: false,
      action: {
        type: "boarding-pass",
        targetId: `${DEMO_BOOKING_ID_PREFIX}upcoming-confirmed-01`,
      },
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}booking-confirmed-01`,
      category: "booking",
      visualKind: "trip",
      title: "Réservation confirmée",
      description: "Votre place est réservée pour le trajet du lendemain à 07h00.",
      createdAt: hoursAgoToday(5),
      read: false,
      action: {
        type: "booking",
        targetId: `${DEMO_BOOKING_ID_PREFIX}upcoming-confirmed-01`,
      },
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}payment-success-01`,
      category: "payment",
      visualKind: "payment",
      title: "Paiement reçu",
      description: "Votre billet à 8,00 € a été payé avec succès via Stripe.",
      createdAt: hoursAgoToday(6),
      read: true,
      action: {
        type: "booking",
        targetId: `${DEMO_BOOKING_ID_PREFIX}upcoming-confirmed-01`,
      },
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}trip-update-01`,
      category: "trip",
      visualKind: "trip",
      title: "Nouveau créneau disponible",
      description: "Un départ supplémentaire est ouvert sur la ligne Châlons ↔ Vatry.",
      createdAt: daysAgo(2, 9, 15),
      read: false,
      action: {
        type: "trip",
        targetId: `${DEMO_TRIP_ID_PREFIX}05`,
      },
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}welcome-01`,
      category: "system",
      visualKind: "account",
      title: "Bienvenue sur SharingGO",
      description: "Votre compte convoyeur est prêt. Réservez votre premier trajet en quelques clics.",
      createdAt: daysAgo(4, 14, 0),
      read: true,
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}subscription-hint-01`,
      category: "payment",
      visualKind: "payment",
      title: "Découvrez nos abonnements",
      description: "Voyagez régulièrement ? Les formules mensuelles vous font gagner du temps.",
      createdAt: daysAgo(5, 11, 30),
      read: true,
      action: {
        type: "subscriptions",
        targetId: "subscriptions",
      },
    },
    {
      id: `${DEMO_NOTIFICATION_ID_PREFIX}system-maintenance-01`,
      category: "system",
      visualKind: "system",
      title: "Maintenance planifiée",
      description:
        "Une courte maintenance est prévue cette nuit. Les réservations restent disponibles.",
      createdAt: daysAgo(12, 8, 0),
      read: true,
    },
  ];
}
