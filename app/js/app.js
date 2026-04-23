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
const KEY_LANG = "luxguide.lang";
const KEY_TOUR_EVENTS = "luxguide.tour.events.v1";
const KEY_TOUR_DESTINATIONS = "luxguide.tour.destinations.v1";
function getViewMode() {
  const v = localStorage.getItem(KEY_VIEW);
  return v === "list" ? "list" : "cards";
}
function setViewMode(mode) {
  localStorage.setItem(KEY_VIEW, mode === "list" ? "list" : "cards");
}

function getLang() {
  const v = localStorage.getItem(KEY_LANG);
  return v === "fr" || v === "de" ? v : "en";
}

function setLang(lang) {
  localStorage.setItem(KEY_LANG, lang === "fr" || lang === "de" ? lang : "en");
}

const I18N = {
  en: {
    nav_events: "Events",
    nav_destinations: "Destinations",
    lang_label: "Lang",
    view_cards: "Cards",
    view_list: "List",
    sample_footer_prefix: "Sample data • Tickets redirect to ",

    events_title: "Events",
    events_subtitle: "Sorted by soonest upcoming first",
    events_supports_view: "Cards & List view supported",
    search_events_aria: "Search events",
    search_events_ph: "Search events…",
    date_filter_aria: "Date filter",
    city_filter_aria: "City filter",
    category_filter_aria: "Category filter",
    empty_events: "No events match your filters.",
    view_details: "View details",
    back_events: "← Back to events",
    event_not_found: "Event not found.",
    actions: "Actions",
    tickets_book: "Tickets / Book",
    no_ticket_link: "No ticket link provided.",
    open_google_maps: "Open in Google Maps",
    open_osm: "Open in OpenStreetMap",
    no_map_location_event: "No map location for this event.",
    ticket_note: "Ticket links open on the official provider website.",
    kv_date: "Date",
    kv_city: "City",
    kv_venue: "Venue",
    kv_tags: "Tags",

    destinations_title: "Destinations",
    destinations_subtitle: "Seasonal places to visit in Luxembourg",
    search_destinations_aria: "Search destinations",
    search_destinations_ph: "Search destinations…",
    dst_city_filter_aria: "Destination city filter",
    dst_type_filter_aria: "Destination type filter",
    dst_season_filter_aria: "Destination season filter",
    empty_destinations: "No destinations match your filters.",
    back_destinations: "← Back to destinations",
    destination_not_found: "Destination not found.",
    official_website: "Official website",
    no_official_website: "No official website provided.",
    open_map: "Open map",
    no_map_location_destination: "No map location for this destination.",
    kv_type: "Type",
    kv_season: "Season",
    about: "More information",

    tour_replay: "Tour",
    tour_welcome_title: "Welcome to Luxembourg Guide",
    tour_welcome_body:
      "This quick tour shows how to browse what’s on (events) and where to go (destinations). Skip anytime — your choice is remembered on this device.",
    tour_nav_title: "Events and destinations",
    tour_nav_body:
      "Open Events for concerts, festivals, and seasonal happenings. Destinations highlights visiting points and tour-style places around Luxembourg.",
    tour_lang_title: "Language",
    tour_lang_body:
      "Pick English, French, or German for buttons and labels. Descriptions in the list come from the sample data language.",
    tour_view_title: "Cards or list",
    tour_view_body: "Switch between card tiles and a compact table — the same filters apply.",
    tour_filters_title: "Search and filters",
    tour_filters_body:
      "Search by keyword, narrow dates (today / this week / this month), city, and category. Results update as you change filters.",
    tour_results_title: "Pick an event",
    tour_results_body:
      "Open an event for full details, map links to get there, and a button that sends you to the official ticket site.",
    tour_footer_title: "Official tickets",
    tour_footer_body:
      "Purchases happen on the provider website (for example Luxembourg Ticket). This app only links you out safely.",
    tour_next: "Next",
    tour_skip: "Skip tour",
    tour_done: "Done",

    tour_dst_welcome_title: "Destinations tour",
    tour_dst_welcome_body:
      "Destinations are visiting points and seasonal places around Luxembourg. This quick tour shows how to find the right place for your trip.",
    tour_dst_filters_title: "Destination filters",
    tour_dst_filters_body:
      "Search by keyword, then narrow by city, type (museum, park, …), and season (spring/summer/autumn/winter).",
    tour_dst_results_title: "Open a place",
    tour_dst_results_body:
      "Open a destination for details, map links, and an official website when available.",
  },
  fr: {
    nav_events: "Événements",
    nav_destinations: "Destinations",
    lang_label: "Langue",
    view_cards: "Cartes",
    view_list: "Liste",
    sample_footer_prefix: "Données d’exemple • Billets via ",

    events_title: "Événements",
    events_subtitle: "Triés du plus proche au plus lointain",
    events_supports_view: "Cartes & liste disponibles",
    search_events_aria: "Rechercher des événements",
    search_events_ph: "Rechercher…",
    date_filter_aria: "Filtre de date",
    city_filter_aria: "Filtre de ville",
    category_filter_aria: "Filtre de catégorie",
    empty_events: "Aucun événement ne correspond aux filtres.",
    view_details: "Voir détails",
    back_events: "← Retour aux événements",
    event_not_found: "Événement introuvable.",
    actions: "Actions",
    tickets_book: "Billets / Réserver",
    no_ticket_link: "Aucun lien de billetterie.",
    open_google_maps: "Ouvrir dans Google Maps",
    open_osm: "Ouvrir dans OpenStreetMap",
    no_map_location_event: "Pas de lieu de carte pour cet événement.",
    ticket_note: "Les liens de billetterie s’ouvrent sur le site officiel.",
    kv_date: "Date",
    kv_city: "Ville",
    kv_venue: "Lieu",
    kv_tags: "Tags",

    destinations_title: "Destinations",
    destinations_subtitle: "Lieux saisonniers à visiter au Luxembourg",
    search_destinations_aria: "Rechercher des destinations",
    search_destinations_ph: "Rechercher…",
    dst_city_filter_aria: "Filtre ville (destination)",
    dst_type_filter_aria: "Filtre type (destination)",
    dst_season_filter_aria: "Filtre saison (destination)",
    empty_destinations: "Aucune destination ne correspond aux filtres.",
    back_destinations: "← Retour aux destinations",
    destination_not_found: "Destination introuvable.",
    official_website: "Site officiel",
    no_official_website: "Aucun site officiel.",
    open_map: "Ouvrir la carte",
    no_map_location_destination: "Pas de lieu de carte pour cette destination.",
    kv_type: "Type",
    kv_season: "Saison",
    about: "Plus d’informations",

    tour_replay: "Visite",
    tour_welcome_title: "Bienvenue dans Luxembourg Guide",
    tour_welcome_body:
      "Cette visite rapide explique comment parcourir les événements et les destinations. Vous pouvez l’interrompre — votre choix est mémorisé sur cet appareil.",
    tour_nav_title: "Événements et destinations",
    tour_nav_body:
      "Événements : concerts, festivals et dates à venir. Destinations : lieux à visiter et idées de parcours saisonniers au Luxembourg.",
    tour_lang_title: "Langue",
    tour_lang_body:
      "Choisissez EN / FR / DE pour l’interface. Les textes des fiches suivent la langue des données d’exemple.",
    tour_view_title: "Cartes ou liste",
    tour_view_body: "Basculez entre une vue en cartes et un tableau compact — les mêmes filtres s’appliquent.",
    tour_filters_title: "Recherche et filtres",
    tour_filters_body:
      "Mot-clé, plage de dates (aujourd’hui / cette semaine / ce mois), ville et catégorie. La liste se met à jour tout de suite.",
    tour_results_title: "Choisir un événement",
    tour_results_body:
      "Ouvrez une fiche pour les détails, les liens carte, et un bouton vers le site officiel de billetterie.",
    tour_footer_title: "Billets officiels",
    tour_footer_body:
      "L’achat se fait sur le site du fournisseur (par ex. Luxembourg Ticket). Cette application se contente de vous rediriger.",
    tour_next: "Suivant",
    tour_skip: "Passer la visite",
    tour_done: "Terminé",

    tour_dst_welcome_title: "Visite des destinations",
    tour_dst_welcome_body:
      "Les destinations sont des lieux à visiter et des idées saisonnières au Luxembourg. Cette courte visite montre comment trouver un endroit adapté à votre voyage.",
    tour_dst_filters_title: "Filtres (destination)",
    tour_dst_filters_body:
      "Recherchez par mot-clé, puis filtrez par ville, type (musée, parc, …) et saison (printemps/été/automne/hiver).",
    tour_dst_results_title: "Ouvrir un lieu",
    tour_dst_results_body:
      "Ouvrez une destination pour les détails, les liens carte et un site officiel si disponible.",
  },
  de: {
    nav_events: "Events",
    nav_destinations: "Reiseziele",
    lang_label: "Sprache",
    view_cards: "Karten",
    view_list: "Liste",
    sample_footer_prefix: "Beispieldaten • Tickets weiter zu ",

    events_title: "Events",
    events_subtitle: "Nach dem nächsten Termin sortiert",
    events_supports_view: "Karten- & Listenansicht verfügbar",
    search_events_aria: "Events suchen",
    search_events_ph: "Suchen…",
    date_filter_aria: "Datumsfilter",
    city_filter_aria: "Stadtfilter",
    category_filter_aria: "Kategoriefilter",
    empty_events: "Keine Events passen zu den Filtern.",
    view_details: "Details ansehen",
    back_events: "← Zurück zu Events",
    event_not_found: "Event nicht gefunden.",
    actions: "Aktionen",
    tickets_book: "Tickets / Buchen",
    no_ticket_link: "Kein Ticket-Link vorhanden.",
    open_google_maps: "In Google Maps öffnen",
    open_osm: "In OpenStreetMap öffnen",
    no_map_location_event: "Kein Kartenort für dieses Event.",
    ticket_note: "Ticket-Links öffnen auf der offiziellen Anbieter-Seite.",
    kv_date: "Datum",
    kv_city: "Stadt",
    kv_venue: "Ort",
    kv_tags: "Tags",

    destinations_title: "Reiseziele",
    destinations_subtitle: "Saisonale Orte in Luxemburg",
    search_destinations_aria: "Reiseziele suchen",
    search_destinations_ph: "Suchen…",
    dst_city_filter_aria: "Stadtfilter (Reiseziel)",
    dst_type_filter_aria: "Typfilter (Reiseziel)",
    dst_season_filter_aria: "Saisonfilter (Reiseziel)",
    empty_destinations: "Keine Reiseziele passen zu den Filtern.",
    back_destinations: "← Zurück zu Reisezielen",
    destination_not_found: "Reiseziel nicht gefunden.",
    official_website: "Offizielle Webseite",
    no_official_website: "Keine offizielle Webseite vorhanden.",
    open_map: "Karte öffnen",
    no_map_location_destination: "Kein Kartenort für dieses Reiseziel.",
    kv_type: "Typ",
    kv_season: "Saison",
    about: "Mehr Informationen",

    tour_replay: "Tour",
    tour_welcome_title: "Willkommen beim Luxembourg Guide",
    tour_welcome_body:
      "Diese kurze Tour zeigt, wie Sie Veranstaltungen und Reiseziele erkunden. Sie können jederzeit abbrechen — Ihre Auswahl wird auf diesem Gerät gespeichert.",
    tour_nav_title: "Events und Reiseziele",
    tour_nav_body:
      "Unter Events finden Sie Konzerte, Festivals und Termine. Reiseziele zeigt sehenswerte Orte und saisonale Ideen in Luxemburg.",
    tour_lang_title: "Sprache",
    tour_lang_body:
      "Wählen Sie EN, FR oder DE für die Oberfläche. Beschreibungen in den Karten folgen der Sprache der Beispieldaten.",
    tour_view_title: "Karten oder Liste",
    tour_view_body: "Wechseln Sie zwischen Kartenkacheln und einer kompakten Tabelle — dieselben Filter gelten.",
    tour_filters_title: "Suche und Filter",
    tour_filters_body:
      "Stichwort, Zeitraum (heute / diese Woche / dieser Monat), Stadt und Kategorie. Die Trefferliste aktualisiert sich sofort.",
    tour_results_title: "Event auswählen",
    tour_results_body:
      "Öffnen Sie ein Event für Details, Kartenlinks und einen Button zur offiziellen Ticket-Website.",
    tour_footer_title: "Offizielle Tickets",
    tour_footer_body:
      "Der Kauf erfolgt beim Anbieter (z. B. Luxembourg Ticket). Diese App verlinkt Sie nur nach außen.",
    tour_next: "Weiter",
    tour_skip: "Tour überspringen",
    tour_done: "Fertig",

    tour_dst_welcome_title: "Tour: Reiseziele",
    tour_dst_welcome_body:
      "Reiseziele sind sehenswerte Orte und saisonale Ideen in Luxemburg. Diese kurze Tour zeigt, wie Sie den passenden Ort finden.",
    tour_dst_filters_title: "Filter (Reiseziele)",
    tour_dst_filters_body:
      "Suche per Stichwort, danach nach Stadt, Typ (Museum, Park, …) und Saison (Frühling/Sommer/Herbst/Winter) filtern.",
    tour_dst_results_title: "Ort öffnen",
    tour_dst_results_body:
      "Öffnen Sie ein Reiseziel für Details, Kartenlinks und – falls vorhanden – die offizielle Webseite.",
  },
};

function t(key) {
  const lang = getLang();
  return I18N?.[lang]?.[key] ?? I18N.en[key] ?? key;
}

function renderLongText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!lines.length) return "";
  return lines
    .map((line) => `<p style="margin:10px 0 0; line-height:1.5; color:rgba(230,233,242,.92)">${escapeHtml(line)}</p>`)
    .join("");
}

// -----------------------------
// Data
// -----------------------------
// Use URLs relative to the current page (works locally and on GitHub Pages under a repo sub-path).
const EVENTS_URL = new URL("../data/events.sample.json", window.location.href).toString();
const DESTINATIONS_URL = new URL("../data/destinations.sample.json", window.location.href).toString();
let _eventsCache = null;
let _destinationsCache = null;

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

function normalizeDestination(d) {
  return {
    ...d,
    _searchText: `${d.name ?? ""} ${d.shortDescription ?? ""}`.toLowerCase(),
  };
}

async function loadDestinations() {
  if (_destinationsCache) return _destinationsCache;
  const res = await fetch(DESTINATIONS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load destinations data (${res.status})`);
  const json = await res.json();
  _destinationsCache = (Array.isArray(json) ? json : []).map(normalizeDestination);
  return _destinationsCache;
}

async function getDestinationById(id) {
  const items = await loadDestinations();
  const needle = String(id);
  return items.find((d) => String(d.id) === needle) ?? null;
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
          <h1 class="panel__title">${escapeHtml(t("events_title"))}</h1>
          <div class="muted">${escapeHtml(t("events_subtitle"))}</div>
        </div>
        <div class="muted">${escapeHtml(t("events_supports_view"))}</div>
      </div>

      <div class="filters" role="search" data-tour="events-filters">
        <input class="input" id="searchInput" type="search" aria-label="${escapeHtml(
          t("search_events_aria")
        )}" placeholder="${escapeHtml(t("search_events_ph"))}" value="${escapeHtml(
          state.q
        )}" />

        <div class="chips" aria-label="${escapeHtml(t("date_filter_aria"))}">${chips}</div>

        <select class="select" id="citySelect" aria-label="${escapeHtml(t("city_filter_aria"))}">
          ${citySelectOptions.join("")}
        </select>

        <select class="select" id="categorySelect" aria-label="${escapeHtml(
          t("category_filter_aria")
        )}">
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
      resultsEl.innerHTML = `<div class="empty">${escapeHtml(t("empty_events"))}</div>`;
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
  requestAnimationFrame(() => requestAnimationFrame(() => maybeOfferEventsTour()));
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
        <a class="backlink" href="#/events">${escapeHtml(t("back_events"))}</a>
        <div class="empty">${escapeHtml(t("event_not_found"))}</div>
      </div>
    `;
    return;
  }

  const when = formatDateRange(e.startDate, e.endDate);
  const providersRaw = Array.isArray(e.ticketProviders)
    ? e.ticketProviders
    : e.ticketProvider
      ? [e.ticketProvider]
      : [];
  const providers = providersRaw
    .map((p) => ({
      name: String(p?.name || "").trim() || "Tickets",
      url: safeExternalUrl(p?.url) || null,
    }))
    .filter((p) => p.url);
  const maps = buildMapLinks({ venue: e.venue, city: e.city });

  mount.innerHTML = `
    <div class="panel">
      <a class="backlink" href="#/events">${escapeHtml(t("back_events"))}</a>

      <div class="detail">
        <section class="detail__section">
          <h1 class="h1">${escapeHtml(e.title)}</h1>
          <div class="card__meta" style="margin-top:6px">
            <span class="badge">${escapeHtml(when)}</span>
            <span class="badge">${escapeHtml(e.category ?? "—")}</span>
            <span class="badge">${escapeHtml(e.city ?? "—")}</span>
          </div>

          <div class="kv" aria-label="Event details">
            <b>${escapeHtml(t("kv_date"))}</b><span>${escapeHtml(when)}</span>
            <b>${escapeHtml(t("kv_city"))}</b><span>${escapeHtml(e.city ?? "—")}</span>
            <b>${escapeHtml(t("kv_venue"))}</b><span>${escapeHtml(e.venue ?? "—")}</span>
            <b>${escapeHtml(t("kv_tags"))}</b><span>${Array.isArray(e.tags) ? e.tags.map(escapeHtml).join(", ") : "—"}</span>
          </div>

          <p style="margin-top:12px; line-height:1.5; color:rgba(230,233,242,.92)">${escapeHtml(
            e.shortDescription ?? ""
          )}</p>

          ${
            e.longDescription
              ? `<h2 style="margin:14px 0 6px; font-size:16px">${escapeHtml(t("about"))}</h2>
                 ${renderLongText(e.longDescription)}`
              : ""
          }
        </section>

        <aside class="detail__section">
          <h2 style="margin:0 0 10px; font-size:16px">${escapeHtml(t("actions"))}</h2>

          <div class="${providers.length > 1 ? "stack" : "btn-row"}">
            ${
              providers.length
                ? providers
                    .map(
                      (p) => `<a class="btn btn--primary" href="${escapeHtml(
                        p.url
                      )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                        t("tickets_book")
                      )} (${escapeHtml(p.name)})</a>`
                    )
                    .join("")
                : `<span class="muted">${escapeHtml(t("no_ticket_link"))}</span>`
            }
          </div>

          <div style="margin-top:12px" class="btn-row">
            ${
              maps
                ? `<a class="btn" href="${maps.google}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                    t("open_google_maps")
                  )}</a>
                   <a class="btn" href="${maps.osm}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                     t("open_osm")
                   )}</a>`
                : `<span class="muted">${escapeHtml(t("no_map_location_event"))}</span>`
            }
          </div>

          <div style="margin-top:14px" class="muted">
            ${escapeHtml(t("ticket_note"))}
          </div>
        </aside>
      </div>
    </div>
  `;
}

function destinationCardsHtml(items) {
  return `
    <div class="grid">
      ${items
        .map((d) => {
          return `
            <article class="card">
              <h3 class="card__title">${escapeHtml(d.name)}</h3>
              <div class="card__meta">
                <span class="badge">${escapeHtml(d.type ?? "—")}</span>
                <span class="badge">${escapeHtml(d.city ?? "—")}</span>
                <span class="badge">${escapeHtml(d.season ?? "—")}</span>
              </div>
              <p class="card__desc">${escapeHtml(d.shortDescription ?? "")}</p>
              <div class="btn-row">
                <a class="btn btn--primary" href="#/destinations/${encodeURIComponent(
                  String(d.id)
                )}">View details</a>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function destinationListHtml(items) {
  return `
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>City</th>
          <th>Type</th>
          <th>Season</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((d) => {
            return `
              <tr>
                <td><a class="rowlink" href="#/destinations/${encodeURIComponent(
                  String(d.id)
                )}">${escapeHtml(d.name)}</a></td>
                <td>${escapeHtml(d.city ?? "—")}</td>
                <td>${escapeHtml(d.type ?? "—")}</td>
                <td>${escapeHtml(d.season ?? "—")}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

function renderDestinationsFilters({ container, state, cityOptions, typeOptions, seasonOptions }) {
  container.innerHTML = `
    <div class="panel">
      <div class="panel__header">
        <div>
          <h1 class="panel__title">${escapeHtml(t("destinations_title"))}</h1>
          <div class="muted">${escapeHtml(t("destinations_subtitle"))}</div>
        </div>
        <div class="muted">${escapeHtml(t("events_supports_view"))}</div>
      </div>

      <div class="filters" role="search" data-tour="destinations-filters">
        <input class="input" id="dstSearchInput" type="search" aria-label="${escapeHtml(
          t("search_destinations_aria")
        )}" placeholder="${escapeHtml(t("search_destinations_ph"))}" value="${escapeHtml(
          state.q
        )}" />

        <select class="select" id="dstCitySelect" aria-label="${escapeHtml(
          t("dst_city_filter_aria")
        )}">
          ${["All", ...cityOptions]
            .map(
              (c) =>
                `<option value="${escapeHtml(c)}" ${state.city === c ? "selected" : ""}>${escapeHtml(
                  c
                )}</option>`
            )
            .join("")}
        </select>

        <select class="select" id="dstTypeSelect" aria-label="${escapeHtml(
          t("dst_type_filter_aria")
        )}">
          ${["All", ...typeOptions]
            .map(
              (t) =>
                `<option value="${escapeHtml(t)}" ${state.type === t ? "selected" : ""}>${escapeHtml(
                  t
                )}</option>`
            )
            .join("")}
        </select>

        <select class="select" id="dstSeasonSelect" aria-label="${escapeHtml(
          t("dst_season_filter_aria")
        )}">
          ${["All", ...seasonOptions]
            .map(
              (s) =>
                `<option value="${escapeHtml(s)}" ${state.season === s ? "selected" : ""}>${escapeHtml(
                  s
                )}</option>`
            )
            .join("")}
        </select>
      </div>

      <div id="dstResults"></div>
    </div>
  `;
}

function applyDestinationFilters(items, { city, type, season, q }) {
  const query = (q || "").trim().toLowerCase();
  return items.filter((d) => {
    if (city && city !== "All") {
      if (String(d.city || "").toLowerCase() !== String(city).toLowerCase()) return false;
    }
    if (type && type !== "All") {
      if (String(d.type || "") !== type) return false;
    }
    if (season && season !== "All") {
      if (String(d.season || "") !== season) return false;
    }
    if (query) {
      if (!String(d._searchText || "").includes(query)) return false;
    }
    return true;
  });
}

async function renderDestinationsList(mount) {
  const items = await loadDestinations();
  const state = { city: "All", type: "All", season: "All", q: "" };

  const cityOptions = getUniqueValues(items, "city");
  const typeOptions = getUniqueValues(items, "type");
  const seasonOptions = getUniqueValues(items, "season");

  renderDestinationsFilters({ container: mount, state, cityOptions, typeOptions, seasonOptions });

  const resultsEl = mount.querySelector("#dstResults");
  function rerender() {
    const filtered = applyDestinationFilters(items, state);
    if (!filtered.length) {
      resultsEl.innerHTML = `<div class="empty">${escapeHtml(t("empty_destinations"))}</div>`;
      return;
    }
    const mode = getViewMode();
    resultsEl.innerHTML = mode === "list" ? destinationListHtml(filtered) : destinationCardsHtml(filtered);
  }

  mount.querySelector("#dstSearchInput").addEventListener("input", (e) => {
    state.q = e.target.value ?? "";
    rerender();
  });
  mount.querySelector("#dstCitySelect").addEventListener("change", (e) => {
    state.city = e.target.value;
    rerender();
  });
  mount.querySelector("#dstTypeSelect").addEventListener("change", (e) => {
    state.type = e.target.value;
    rerender();
  });
  mount.querySelector("#dstSeasonSelect").addEventListener("change", (e) => {
    state.season = e.target.value;
    rerender();
  });

  rerender();
  requestAnimationFrame(() => requestAnimationFrame(() => maybeOfferDestinationsTour()));
}

async function renderDestinationDetails(mount, destinationId) {
  const d = await getDestinationById(destinationId);
  if (!d) {
    mount.innerHTML = `
      <div class="panel">
        <a class="backlink" href="#/destinations">${escapeHtml(t("back_destinations"))}</a>
        <div class="empty">${escapeHtml(t("destination_not_found"))}</div>
      </div>
    `;
    return;
  }

  const officialUrl = safeExternalUrl(d.officialUrl) || null;
  const mapUrl = safeExternalUrl(d.mapUrl) || null;
  const mapsFallback = buildMapLinks({ venue: d.name, city: d.city });

  mount.innerHTML = `
    <div class="panel">
      <a class="backlink" href="#/destinations">${escapeHtml(t("back_destinations"))}</a>

      <div class="detail">
        <section class="detail__section">
          <h1 class="h1">${escapeHtml(d.name)}</h1>
          <div class="card__meta" style="margin-top:6px">
            <span class="badge">${escapeHtml(d.type ?? "—")}</span>
            <span class="badge">${escapeHtml(d.city ?? "—")}</span>
            <span class="badge">${escapeHtml(d.season ?? "—")}</span>
          </div>

          <div class="kv" aria-label="Destination details">
            <b>${escapeHtml(t("kv_city"))}</b><span>${escapeHtml(d.city ?? "—")}</span>
            <b>${escapeHtml(t("kv_type"))}</b><span>${escapeHtml(d.type ?? "—")}</span>
            <b>${escapeHtml(t("kv_season"))}</b><span>${escapeHtml(d.season ?? "—")}</span>
            <b>${escapeHtml(t("kv_tags"))}</b><span>${Array.isArray(d.tags) ? d.tags.map(escapeHtml).join(", ") : "—"}</span>
          </div>

          <p style="margin-top:12px; line-height:1.5; color:rgba(230,233,242,.92)">${escapeHtml(
            d.shortDescription ?? ""
          )}</p>

          ${
            d.longDescription
              ? `<h2 style="margin:14px 0 6px; font-size:16px">${escapeHtml(t("about"))}</h2>
                 ${renderLongText(d.longDescription)}`
              : ""
          }
        </section>

        <aside class="detail__section">
          <h2 style="margin:0 0 10px; font-size:16px">${escapeHtml(t("actions"))}</h2>

          <div class="btn-row">
            ${
              officialUrl
                ? `<a class="btn btn--primary" href="${escapeHtml(
                    officialUrl
                  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("official_website"))}</a>`
                : `<span class="muted">${escapeHtml(t("no_official_website"))}</span>`
            }
          </div>

          <div style="margin-top:12px" class="btn-row">
            ${
              mapUrl
                ? `<a class="btn" href="${escapeHtml(
                    mapUrl
                  )}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("open_map"))}</a>`
                : mapsFallback
                  ? `<a class="btn" href="${mapsFallback.google}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                      t("open_google_maps")
                    )}</a>
                     <a class="btn" href="${mapsFallback.osm}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                       t("open_osm")
                     )}</a>`
                  : `<span class="muted">${escapeHtml(t("no_map_location_destination"))}</span>`
            }
          </div>
        </aside>
      </div>
    </div>
  `;
}

// -----------------------------
// First-run information tour (events home)
// -----------------------------
let _tourCleanup = null;

function tourEventsPreferenceSet() {
  const v = localStorage.getItem(KEY_TOUR_EVENTS);
  return v === "done" || v === "skipped";
}

function tourDestinationsPreferenceSet() {
  const v = localStorage.getItem(KEY_TOUR_DESTINATIONS);
  return v === "done" || v === "skipped";
}

function destroyEventsTour() {
  if (typeof _tourCleanup === "function") {
    _tourCleanup();
    _tourCleanup = null;
  }
}

function maybeOfferEventsTour() {
  if (tourEventsPreferenceSet()) return;
  if (parseRoute().name !== "events") return;
  const root = document.getElementById("app");
  if (!root?.querySelector("#results")) return;
  requestAnimationFrame(() => requestAnimationFrame(() => startEventsInformationTour()));
}

function maybeOfferDestinationsTour() {
  if (tourDestinationsPreferenceSet()) return;
  if (parseRoute().name !== "destinations") return;
  const root = document.getElementById("app");
  if (!root?.querySelector("#dstResults")) return;
  requestAnimationFrame(() => requestAnimationFrame(() => startDestinationsInformationTour()));
}

const EVENTS_TOUR_STEPS = [
  { target: null, titleKey: "tour_welcome_title", bodyKey: "tour_welcome_body" },
  { target: '[data-tour="main-nav"]', titleKey: "tour_nav_title", bodyKey: "tour_nav_body" },
  { target: '[data-tour="lang"]', titleKey: "tour_lang_title", bodyKey: "tour_lang_body" },
  { target: '[data-tour="view-toggle"]', titleKey: "tour_view_title", bodyKey: "tour_view_body" },
  { target: '[data-tour="events-filters"]', titleKey: "tour_filters_title", bodyKey: "tour_filters_body" },
  { target: "#results", titleKey: "tour_results_title", bodyKey: "tour_results_body" },
  { target: '[data-tour="ticket-info"]', titleKey: "tour_footer_title", bodyKey: "tour_footer_body" },
];

const DESTINATIONS_TOUR_STEPS = [
  { target: null, titleKey: "tour_dst_welcome_title", bodyKey: "tour_dst_welcome_body" },
  { target: '[data-tour="main-nav"]', titleKey: "tour_nav_title", bodyKey: "tour_nav_body" },
  { target: '[data-tour="lang"]', titleKey: "tour_lang_title", bodyKey: "tour_lang_body" },
  { target: '[data-tour="view-toggle"]', titleKey: "tour_view_title", bodyKey: "tour_view_body" },
  {
    target: '[data-tour="destinations-filters"]',
    titleKey: "tour_dst_filters_title",
    bodyKey: "tour_dst_filters_body",
  },
  { target: "#dstResults", titleKey: "tour_dst_results_title", bodyKey: "tour_dst_results_body" },
];

function startEventsInformationTour() {
  destroyEventsTour();
  let idx = 0;

  const layer = document.createElement("div");
  layer.className = "tour-layer";
  const spotlight = document.createElement("div");
  spotlight.className = "tour-spotlight";
  spotlight.setAttribute("aria-hidden", "true");
  const wrap = document.createElement("div");
  wrap.className = "tour-dialog-wrap";
  const dialog = document.createElement("div");
  dialog.className = "tour-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  const titleId = "tourDialogTitle";
  const liveId = "tourDialogLive";
  dialog.setAttribute("aria-labelledby", titleId);
  dialog.setAttribute("aria-describedby", liveId);

  layer.append(spotlight, wrap);
  wrap.appendChild(dialog);
  document.body.appendChild(layer);
  document.body.classList.add("tour-open");

  function queryTarget(sel) {
    if (!sel) return null;
    return document.querySelector(sel);
  }

  function layoutStep() {
    const step = EVENTS_TOUR_STEPS[idx];
    const el = queryTarget(step.target);
    const isWelcome = !step.target;
    const useCenterDialog = isWelcome || !el;

    layer.classList.toggle("tour-layer--welcome", isWelcome || !el);

    if (useCenterDialog) {
      spotlight.classList.add("tour-spotlight--hidden");
      wrap.classList.add("tour-dialog-wrap--center");
      wrap.style.top = "";
      wrap.style.left = "";
      wrap.style.bottom = "";
      wrap.style.transform = "";
    } else {
      spotlight.classList.remove("tour-spotlight--hidden");
      wrap.classList.remove("tour-dialog-wrap--center");
      const pad = 10;
      const r = el.getBoundingClientRect();
      const top = Math.max(8, r.top - pad);
      const left = Math.max(8, r.left - pad);
      const w = Math.min(window.innerWidth - 16, r.width + pad * 2);
      const h = Math.min(window.innerHeight - 16, r.height + pad * 2);
      spotlight.style.top = `${top}px`;
      spotlight.style.left = `${left}px`;
      spotlight.style.width = `${w}px`;
      spotlight.style.height = `${h}px`;

      wrap.style.top = "auto";
      wrap.style.bottom = "12px";
      wrap.style.left = "50%";
      wrap.style.transform = "translateX(-50%)";

      el.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
    }

    const last = idx >= EVENTS_TOUR_STEPS.length - 1;
    dialog.innerHTML = `
      <h2 class="tour-dialog__title" id="${titleId}">${escapeHtml(t(step.titleKey))}</h2>
      <p class="tour-dialog__body" id="${liveId}">${escapeHtml(t(step.bodyKey))}</p>
      <div class="tour-dialog__actions">
        <button type="button" class="btn btn--primary" data-tour-next>${escapeHtml(t(last ? "tour_done" : "tour_next"))}</button>
        <button type="button" class="btn" data-tour-skip>${escapeHtml(t("tour_skip"))}</button>
      </div>
      <p class="tour-dialog__hint" aria-hidden="true">Esc — close tour</p>
    `;

    dialog.querySelector("[data-tour-next]")?.addEventListener("click", () => {
      if (last) {
        localStorage.setItem(KEY_TOUR_EVENTS, "done");
        destroyEventsTour();
        return;
      }
      idx += 1;
      layoutStep();
    });
    dialog.querySelector("[data-tour-skip]")?.addEventListener("click", () => {
      localStorage.setItem(KEY_TOUR_EVENTS, "skipped");
      destroyEventsTour();
    });

    dialog.querySelector("[data-tour-next]")?.focus();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      destroyEventsTour();
    }
  }

  function onHashChange() {
    if (parseRoute().name !== "events") destroyEventsTour();
  }

  function onResize() {
    layoutStep();
  }

  _tourCleanup = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("resize", onResize);
    layer.remove();
    document.body.classList.remove("tour-open");
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("resize", onResize);

  layoutStep();
}

function startDestinationsInformationTour() {
  destroyEventsTour();
  let idx = 0;

  const layer = document.createElement("div");
  layer.className = "tour-layer";
  const spotlight = document.createElement("div");
  spotlight.className = "tour-spotlight";
  spotlight.setAttribute("aria-hidden", "true");
  const wrap = document.createElement("div");
  wrap.className = "tour-dialog-wrap";
  const dialog = document.createElement("div");
  dialog.className = "tour-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  const titleId = "tourDialogTitle";
  const liveId = "tourDialogLive";
  dialog.setAttribute("aria-labelledby", titleId);
  dialog.setAttribute("aria-describedby", liveId);

  layer.append(spotlight, wrap);
  wrap.appendChild(dialog);
  document.body.appendChild(layer);
  document.body.classList.add("tour-open");

  function queryTarget(sel) {
    if (!sel) return null;
    return document.querySelector(sel);
  }

  function layoutStep() {
    const step = DESTINATIONS_TOUR_STEPS[idx];
    const el = queryTarget(step.target);
    const isWelcome = !step.target;
    const useCenterDialog = isWelcome || !el;

    layer.classList.toggle("tour-layer--welcome", isWelcome || !el);

    if (useCenterDialog) {
      spotlight.classList.add("tour-spotlight--hidden");
      wrap.classList.add("tour-dialog-wrap--center");
      wrap.style.top = "";
      wrap.style.left = "";
      wrap.style.bottom = "";
      wrap.style.transform = "";
    } else {
      spotlight.classList.remove("tour-spotlight--hidden");
      wrap.classList.remove("tour-dialog-wrap--center");
      const pad = 10;
      const r = el.getBoundingClientRect();
      const top = Math.max(8, r.top - pad);
      const left = Math.max(8, r.left - pad);
      const w = Math.min(window.innerWidth - 16, r.width + pad * 2);
      const h = Math.min(window.innerHeight - 16, r.height + pad * 2);
      spotlight.style.top = `${top}px`;
      spotlight.style.left = `${left}px`;
      spotlight.style.width = `${w}px`;
      spotlight.style.height = `${h}px`;

      wrap.style.top = "auto";
      wrap.style.bottom = "12px";
      wrap.style.left = "50%";
      wrap.style.transform = "translateX(-50%)";

      el.scrollIntoView({ block: "nearest", behavior: "smooth", inline: "nearest" });
    }

    const last = idx >= DESTINATIONS_TOUR_STEPS.length - 1;
    dialog.innerHTML = `
      <h2 class="tour-dialog__title" id="${titleId}">${escapeHtml(t(step.titleKey))}</h2>
      <p class="tour-dialog__body" id="${liveId}">${escapeHtml(t(step.bodyKey))}</p>
      <div class="tour-dialog__actions">
        <button type="button" class="btn btn--primary" data-tour-next>${escapeHtml(t(last ? "tour_done" : "tour_next"))}</button>
        <button type="button" class="btn" data-tour-skip>${escapeHtml(t("tour_skip"))}</button>
      </div>
      <p class="tour-dialog__hint" aria-hidden="true">Esc — close tour</p>
    `;

    dialog.querySelector("[data-tour-next]")?.addEventListener("click", () => {
      if (last) {
        localStorage.setItem(KEY_TOUR_DESTINATIONS, "done");
        destroyEventsTour();
        return;
      }
      idx += 1;
      layoutStep();
    });
    dialog.querySelector("[data-tour-skip]")?.addEventListener("click", () => {
      localStorage.setItem(KEY_TOUR_DESTINATIONS, "skipped");
      destroyEventsTour();
    });

    dialog.querySelector("[data-tour-next]")?.focus();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      destroyEventsTour();
    }
  }

  function onHashChange() {
    if (parseRoute().name !== "destinations") destroyEventsTour();
  }

  function onResize() {
    layoutStep();
  }

  _tourCleanup = () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("hashchange", onHashChange);
    window.removeEventListener("resize", onResize);
    layer.remove();
    document.body.classList.remove("tour-open");
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("hashchange", onHashChange);
  window.addEventListener("resize", onResize);

  layoutStep();
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
  if (root === "destinations" && id)
    return { name: "destinationDetails", id: decodeURIComponent(id) };
  if (root === "destinations") return { name: "destinations" };
  return { name: "events" };
}

function syncNav(routeName) {
  const links = document.querySelectorAll("[data-nav]");
  for (const a of links) {
    const isActive =
      (routeName === "events" || routeName === "eventDetails")
        ? a.getAttribute("data-nav") === "events"
        : (routeName === "destinations" || routeName === "destinationDetails")
          ? a.getAttribute("data-nav") === "destinations"
          : false;
    a.classList.toggle("nav__link--active", isActive);
  }
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
    syncNav(route.name);
    if (route.name === "eventDetails") {
      await renderEventDetails(mount, route.id);
      return;
    }
    if (route.name === "destinationDetails") {
      await renderDestinationDetails(mount, route.id);
      return;
    }
    if (route.name === "destinations") {
      await renderDestinationsList(mount);
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

function applyStaticI18n() {
  const langSelect = document.getElementById("langSelect");
  const navEvents = document.querySelector('[data-nav="events"]');
  const navDestinations = document.querySelector('[data-nav="destinations"]');
  const langLabel = document.querySelector('label[for="langSelect"]');
  const cardsBtn = document.getElementById("viewCardsBtn");
  const listBtn = document.getElementById("viewListBtn");
  const footerPrefix = document.querySelector(".footer span");

  if (langSelect) langSelect.value = getLang();
  if (langLabel) langLabel.textContent = t("lang_label");
  if (navEvents) navEvents.textContent = t("nav_events");
  if (navDestinations) navDestinations.textContent = t("nav_destinations");
  if (cardsBtn) cardsBtn.textContent = t("view_cards");
  if (listBtn) listBtn.textContent = t("view_list");
  if (footerPrefix) footerPrefix.textContent = t("sample_footer_prefix");
  const tourReplay = document.getElementById("tourReplayBtn");
  if (tourReplay) tourReplay.textContent = t("tour_replay");
}

function bindLangSelect({ rerender }) {
  const langSelect = document.getElementById("langSelect");
  if (!langSelect) return;
  langSelect.addEventListener("change", () => {
    setLang(langSelect.value);
    applyStaticI18n();
    rerender();
  });
}

const mount = document.getElementById("app");
applyStaticI18n();
syncViewButtons();
bindViewToggle();
const rerender = () => window.dispatchEvent(new HashChangeEvent("hashchange"));
bindLangSelect({ rerender });

document.getElementById("tourReplayBtn")?.addEventListener("click", () => {
  const route = parseRoute();
  if (route.name === "destinations") {
    localStorage.removeItem(KEY_TOUR_DESTINATIONS);
    destroyEventsTour();
    requestAnimationFrame(() => requestAnimationFrame(() => startDestinationsInformationTour()));
    return;
  }

  localStorage.removeItem(KEY_TOUR_EVENTS);
  destroyEventsTour();
  if (route.name !== "events") {
    window.location.hash = "#/events";
    return;
  }
  requestAnimationFrame(() => requestAnimationFrame(() => startEventsInformationTour()));
});

startRouter({ mount });

