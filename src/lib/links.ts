export const BOOKING_HREF = "/booking";

export function bookingHref(params: { service?: string; doctor?: string }) {
  const search = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();
  return search ? `${BOOKING_HREF}?${search}` : BOOKING_HREF;
}
