export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function parseISODate(d) {
  if (!d) return null;
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function formatDateRange(startDateISO, endDateISO) {
  const start = parseISODate(startDateISO);
  const end = parseISODate(endDateISO) || start;
  if (!start) return "";

  const fmt = (x) =>
    x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  if (!end || start.toDateString() === end.toDateString()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
