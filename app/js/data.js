import { parseISODate } from "./utils.js";

const EVENTS_URL = "/data/events.sample.json";

let _eventsCache = null;

function normalizeEvent(e) {
  const start = parseISODate(e.startDate);
  const end = parseISODate(e.endDate) || start;
  return {
    ...e,
    _start: start,
    _end: end,
    _searchText: `${e.title ?? ""} ${e.shortDescription ?? ""}`.toLowerCase(),
  };
}

export async function loadEvents() {
  if (_eventsCache) return _eventsCache;
  const res = await fetch(EVENTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events data (${res.status})`);
  const json = await res.json();
  _eventsCache = (Array.isArray(json) ? json : []).map(normalizeEvent);
  return _eventsCache;
}

export async function getEventById(id) {
  const events = await loadEvents();
  const needle = String(id);
  return events.find((e) => String(e.id) === needle) ?? null;
}

export function getUniqueValues(events, key) {
  const set = new Set();
  for (const e of events) {
    const v = e?.[key];
    if (typeof v === "string" && v.trim()) set.add(v.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
