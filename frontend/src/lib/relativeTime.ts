export function relativeTime(date: Date | string): string {
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffSeconds < 60) {
    return `il y a ${diffSeconds} seconde${diffSeconds > 1 ? "s" : ""}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
}
