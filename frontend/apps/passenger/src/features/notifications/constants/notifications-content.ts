import type { NotificationTab } from "@/features/notifications/lib/notification-tabs";

export const NOTIFICATIONS_HERO_CONTENT = {
  titleBefore: "",
  titleHighlight: "Notifications",
  subtitle: "Restez informé de l'actualité de vos trajets et de votre compte.",
  markAllRead: "Tout marquer comme lu",
  markAllReadSoonTitle: "Marquage lu — disponible lorsque des notifications seront présentes",
} as const;

export const NOTIFICATIONS_TAB_LABELS: Record<NotificationTab, string> = {
  all: "Toutes",
  trip: "Trajets",
  booking: "Réservations",
  payment: "Paiements",
  system: "Système",
};

export const NOTIFICATIONS_TOOLBAR = {
  filter: "Filtrer",
  filterTitle: "Filtrer les notifications",
  filterClose: "Fermer",
  filterHint: "Filtre local — aucune API notifications pour le moment.",
} as const;

export const NOTIFICATIONS_READ_FILTER_LABELS = {
  all: "Toutes",
  unread: "Non lues",
  read: "Lues",
} as const;

export const NOTIFICATIONS_GROUP_LABELS = {
  today: "Aujourd'hui",
  this_week: "Cette semaine",
  older: "Plus anciennes",
} as const;

export const NOTIFICATIONS_EMPTY = {
  title: "Aucune notification",
  description:
    "Vous êtes à jour. Les confirmations de réservation, les rappels de départ et les informations importantes apparaîtront ici.",
  cta: "Voir les trajets",
} as const;

export const NOTIFICATIONS_TAB_EMPTY = {
  title: "Aucune notification dans cette catégorie",
  description: "Essayez un autre onglet ou revenez plus tard.",
} as const;

export const NOTIFICATIONS_ERROR = {
  title: "Impossible de charger vos notifications",
  retry: "Réessayer",
} as const;

export const NOTIFICATIONS_LOAD_MORE = "Charger plus";

export const NOTIFICATIONS_UNREAD_BADGE = "Non lu";
