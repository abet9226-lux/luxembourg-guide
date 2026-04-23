// Single-file app (merged to reduce file count)

// -----------------------------
// Utilities
// -----------------------------
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseISODate(d) {
  if (!d) return null;
  const dt = new Date(`${d}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDateRange(startDateISO, endDateISO) {
  const start = parseISODate(startDateISO);
  const end = parseISODate(endDateISO) || start;
  if (!start) return "";

  const fmt = (x) =>
    x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  if (!end || start.toDateString() === end.toDateString()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function safeExternalUrl(urlString) {
  if (!urlString) return null;
  try {
    const u = new URL(urlString, window.location.origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

// -----------------------------
// Small persistence (view mode)
// -----------------------------
const KEY_VIEW = "luxguide.view";
function getViewMode() {
  const v = localStorage.getItem(KEY_VIEW);
  return v === "list" ? "list" : "cards";
}
function setViewMode(mode) {
  localStorage.setItem(KEY_VIEW, mode === "list" ? "list" : "cards");
}

// -----------------------------
// Data
// -----------------------------
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

async function loadEvents() {
  if (_eventsCache) return _eventsCache;
  const res = await fetch(EVENTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load events data (${res.status})`);
  const json = await res.json();
  _eventsCache = (Array.isArray(json) ? json : []).map(normalizeEvent);
  return _eventsCache;
}

async function getEventById(id) {
  const events = await loadEvents();
  const needle = String(id);
  return events.find((e) => String(e.id) === needle) ?? null;
}

function getUniqueValues(events, key) {
  const set = new Set();
  for (const e of events) {
    const v = e?.[key];
    if (typeof v === "string" && v.trim()) set.add(v.trim());
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// -----------------------------
// Views
// -----------------------------
const CATEGORY_OPTIONS = ["All", "Music", "Cultural festival", "Seasonal event"];
const DATE_OPTIONS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

function applyFilters(events, { dateFilter, city, category, q }) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  let rangeStart = null;
  let rangeEnd = null;

  if (dateFilter === "today") {
    rangeStart = todayStart;
    rangeEnd = todayEnd;
  } else if (dateFilter === "week") {
    rangeStart = todayStart;
    rangeEnd = endOfDay(addDays(todayStart, 6)); // next 7 days rolling (inclusive of today)
  } else if (dateFilter === "month") {
    const start = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    const end = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0);
    rangeStart = startOfDay(start);
    rangeEnd = endOfDay(end);
  }

  const query = (q || "").trim().toLowerCase();

  return events.filter((e) => {
    if (!e._start) return false;

    if (rangeStart && rangeEnd) {
      const evStart = startOfDay(e._start);
      const evEnd = endOfDay(e._end || e._start);
      if (!rangesOverlap(evStart, evEnd, rangeStart, rangeEnd)) return false;
    }

    if (city && city !== "All") {
      const normalized = String(e.city || "").toLowerCase();
      if (normalized !== String(city).toLowerCase()) return false;
    }

    if (category && category !== "All") {
      if (String(e.category || "") !== category) return false;
    }

    if (query) {
      if (!e._searchText.includes(query)) return false;
    }

    return true;
  });
}

function sortSoonestFirst(events) {
  return [...events].sort((a, b) => {
    const at = a?._start?.getTime?.() ?? Number.MAX_SAFE_INTEGER;
    const bt = b?._start?.getTime?.() ?? Number.MAX_SAFE_INTEGER;
    return at - bt;
  });
}

function cardsHtml(events) {
  return `
    <div class="grid">
      ${events
        .map((e) => {
          const when = escapeHtml(formatDateRange(e.startDate, e.endDate));
          const where = escapeHtml(`${e.city ?? ""}${e.venue ? ` • ${e.venue}` : ""}`);
          return `
            <article class="card">
              <h3 class="card__title">${escapeHtml(e.title)}</h3>
              <div class="card__meta">
                <span class="badge">${when}</span>
                <span class="badge">${escapeHtml(e.category ?? "—")}</span>
                <span class="badge">${escapeHtml(e.city ?? "—")}</span>
              </div>
              <p class="card__desc">${escapeHtml(e.shortDescription ?? "")}</p>
              <div class="btn-row">
                <a class="btn btn--primary" href="#/events/${encodeURIComponent(String(e.id))}">View details</a>
                <span class="muted" aria-hidden="true">${where}</span>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function listHtml(events) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>City</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        ${events
          .map((e) => {
            const when = escapeHtml(formatDateRange(e.startDate, e.endDate));
            return `
              <tr>
                <td>${when}</td>
                <td><a class="rowlink" href="#/events/${encodeURIComponent(String(e.id))}">${escapeHtml(
                  e.title
                )}</a></td>
                <td>${escapeHtml(e.city ?? "—")}</td>
                <td>${escapeHtml(e.category ?? "—")}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderFilters({ container, state, cityOptions }) {
  const chips = DATE_OPTIONS.map(
    (x) => `
      <button class="chip" type="button" data-date="${x.id}" aria-pressed="${
        state.dateFilter === x.id ? "true" : "false"
      }">${escapeHtml(x.label)}</button>
    `
  ).join("");

  const citySelectOptions = ["All", ...cityOptions].map(
    (c) =>
      `<option value="${escapeHtml(c)}" ${state.city === c ? "selected" : ""}>${escapeHtml(c)}</option>`
  );

  const categoryOptions = CATEGORY_OPTIONS.map(
    (c) =>
      `<option value="${escapeHtml(c)}" ${state.category === c ? "selected" : ""}>${escapeHtml(c)}</option>`
  );

  container.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <div>
          <h1 class="panel__title">Events</h1>
          <div class="muted">Sorted by soonest upcoming first</div>
        </div>
        <div class="muted">Cards & List view supported</div>
      </div>

      <div class="filters" role="search">
        <input class="input" id="searchInput" type="search" aria-label="Search events" placeholder="Search events…" value="${escapeHtml(
          state.q
        )}" />

        <div class="chips" aria-label="Date filter">${chips}</div>

        <select class="select" id="citySelect" aria-label="City filter">
          ${citySelectOptions.join("")}
        </select>

        <select class="select" id="categorySelect" aria-label="Category filter">
          ${categoryOptions.join("")}
        </select>
      </div>

      <div id="results"></div>
    </div>
  `;
}

async function renderEventsList(mount) {
  const events = await loadEvents();

  const state = {
    dateFilter: "all",
    city: "All",
    category: "All",
    q: "",
  };

  const cityOptions = getUniqueValues(events, "city");
  renderFilters({ container: mount, state, cityOptions });

  const resultsEl = mount.querySelector("#results");

  function rerenderResults() {
    const filtered = sortSoonestFirst(applyFilters(events, state));
    if (!filtered.length) {
      resultsEl.innerHTML = `<div class="empty">No events match your filters.</div>`;
      return;
    }
    const mode = getViewMode();
    resultsEl.innerHTML = mode === "list" ? listHtml(filtered) : cardsHtml(filtered);
  }

  function setDateFilter(id) {
    state.dateFilter = id;
    for (const btn of mount.querySelectorAll("[data-date]")) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-date") === id ? "true" : "false");
    }
    rerenderResults();
  }

  mount.querySelector("#searchInput").addEventListener("input", (e) => {
    state.q = e.target.value ?? "";
    rerenderResults();
  });

  mount.querySelector("#citySelect").addEventListener("change", (e) => {
    state.city = e.target.value;
    rerenderResults();
  });

  mount.querySelector("#categorySelect").addEventListener("change", (e) => {
    state.category = e.target.value;
    rerenderResults();
  });

  for (const btn of mount.querySelectorAll("[data-date]")) {
    btn.addEventListener("click", () => setDateFilter(btn.getAttribute("data-date")));
  }

  setDateFilter(state.dateFilter);
  rerenderResults();
}

function buildMapLinks({ venue, city }) {
  const q = [venue, city].filter(Boolean).join(", ");
  if (!q) return null;
  const encoded = encodeURIComponent(q);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    osm: `https://www.openstreetmap.org/search?query=${encoded}`,
  };
}

async function renderEventDetails(mount, eventId) {
  const e = await getEventById(eventId);
  if (!e) {
    mount.innerHTML = `
      <div class="panel">
        <a class="backlink" href="#/events">← Back to events</a>
        <div class="empty">Event not found.</div>
      </div>
    `;
    return;
  }

  const when = formatDateRange(e.startDate, e.endDate);
  const providerUrl = safeExternalUrl(e.ticketProvider?.url) || null;
  const providerName = e.ticketProvider?.name || "Tickets";
  const maps = buildMapLinks({ venue: e.venue, city: e.city });

  mount.innerHTML = `
    <div class="panel">
      <a class="backlink" href="#/events">← Back to events</a>

      <div class="detail">
        <section class="detail__section">
          <h1 class="h1">${escapeHtml(e.title)}</h1>
          <div class="card__meta" style="margin-top:6px">
            <span class="badge">${escapeHtml(when)}</span>
            <span class="badge">${escapeHtml(e.category ?? "—")}</span>
            <span class="badge">${escapeHtml(e.city ?? "—")}</span>
          </div>

          <div class="kv" aria-label="Event details">
            <b>Date</b><span>${escapeHtml(when)}</span>
            <b>City</b><span>${escapeHtml(e.city ?? "—")}</span>
            <b>Venue</b><span>${escapeHtml(e.venue ?? "—")}</span>
            <b>Tags</b><span>${Array.isArray(e.tags) ? e.tags.map(escapeHtml).join(", ") : "—"}</span>
          </div>

          <p style="margin-top:12px; line-height:1.5; color:rgba(230,233,242,.92)">${escapeHtml(
            e.shortDescription ?? ""
          )}</p>
        </section>

        <aside class="detail__section">
          <h2 style="margin:0 0 10px; font-size:16px">Actions</h2>

          <div class="btn-row">
            ${
              providerUrl
                ? `<a class="btn btn--primary" href="${escapeHtml(
                    providerUrl
                  )}" target="_blank" rel="noopener noreferrer">Tickets / Book (${escapeHtml(providerName)})</a>`
                : `<span class="muted">No ticket link provided.</span>`
            }
          </div>

          <div style="margin-top:12px" class="btn-row">
            ${
              maps
                ? `<a class="btn" href="${maps.google}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                   <a class="btn" href="${maps.osm}" target="_blank" rel="noopener noreferrer">Open in OpenStreetMap</a>`
                : `<span class="muted">No map location for this event.</span>`
            }
          </div>

          <div style="margin-top:14px" class="muted">
            Ticket links open on the official provider website.
          </div>
        </aside>
      </div>
    </div>
  `;
}

// -----------------------------
// Router + boot
// -----------------------------
function parseRoute() {
  const hash = window.location.hash || "#/events";
  const cleaned = hash.replace(/^#/, "");
  const parts = cleaned.split("/").filter(Boolean);
  const [root, id] = parts;
  if (root === "events" && id) return { name: "eventDetails", id: decodeURIComponent(id) };
  return { name: "events" };
}

function renderError(mount, e) {
  const box = document.createElement("div");
  box.className = "panel";
  const p = document.createElement("p");
  p.className = "muted";
  p.textContent = "Something went wrong.";
  const pre = document.createElement("pre");
  pre.textContent = String(e?.message ?? e);
  box.append(p, pre);
  mount.replaceChildren(box);
}

function startRouter({ mount }) {
  async function render() {
    const route = parseRoute();
    if (route.name === "eventDetails") {
      await renderEventDetails(mount, route.id);
      return;
    }
    await renderEventsList(mount);
  }

  window.addEventListener("hashchange", () => render().catch((e) => renderError(mount, e)));
  render().catch((e) => renderError(mount, e));
}

function setPressed(btn, pressed) {
  btn.setAttribute("aria-pressed", pressed ? "true" : "false");
}

function syncViewButtons() {
  const mode = getViewMode();
  const cardsBtn = document.getElementById("viewCardsBtn");
  const listBtn = document.getElementById("viewListBtn");
  setPressed(cardsBtn, mode === "cards");
  setPressed(listBtn, mode === "list");
}

function bindViewToggle() {
  const cardsBtn = document.getElementById("viewCardsBtn");
  const listBtn = document.getElementById("viewListBtn");

  cardsBtn.addEventListener("click", () => {
    setViewMode("cards");
    syncViewButtons();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

  listBtn.addEventListener("click", () => {
    setViewMode("list");
    syncViewButtons();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}

const mount = document.getElementById("app");
syncViewButtons();
bindViewToggle();
startRouter({ mount });

