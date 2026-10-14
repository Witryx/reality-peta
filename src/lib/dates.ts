/** Publication dates follow the site's Czech business timezone. */
export function today() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("cs-CZ", {
      timeZone: "Europe/Prague",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(new Date())
      .map((part) => [part.type, part.value]),
  );
  return `${parts["year"]}-${parts["month"]}-${parts["day"]}`;
}
