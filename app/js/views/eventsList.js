import { getUniqueValues, loadEvents } from "../data.js";
import { addDays, endOfDay, formatDateRange, rangesOverlap, startOfDay } from "../utils.js";
import { escapeHtml } from "../utils.js";

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

    // Date overlap: event range overlaps the selected range.
    if (rangeStart && rangeEnd) {
      const evStart = startOfDay(e._start);
      const evEnd = endOfDay(e._end || e._start);
      if (!rangesOverlap(evStart, evEnd, rangeStart, rangeEnd)) return false;
    }

    // City
    if (city && city !== "All") {
      const normalized = String(e.city || "").toLowerCase();
      if (normalized !== String(city).toLowerCase()) return false;
    }

    // Category
    if (category && category !== "All") {
      if (String(e.category || "") !== category) return false;
    }

    // Search
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
                <td><a class="rowlink" href="#/events/${encodeURIComponent(String(e.id))}">${escapeHtml(e.title)}</a></td>
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

export async function renderEventsList(mount, { getViewMode }) {
  const events = await loadEvents();

  // Default filters: show all dates so the demo always has results.
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

  // initial UI state
  setDateFilter(state.dateFilter);
  rerenderResults();
}

