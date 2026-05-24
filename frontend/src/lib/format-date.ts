const defaultDateOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

export function formatDate(
  value: string | Date,
  locale = "fr-FR",
  options: Intl.DateTimeFormatOptions = defaultDateOptions
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatRelativeDay(value: string | Date, locale = "fr-FR"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
}
