const STORAGE_KEY = "lux-guide:saved:v1";

const state = {
  tab: "events", // events | guide | saved
  query: "",
  seed: null,
  selected: null, // { type: "event"|"place", id: string }
  guideCategoryId: null
};

function $(id) {
  return document.getElementById(id);
}

function formatMeta(parts) {
  return parts.filter(Boolean).join(" • ");
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: {}, places: {} };
    const parsed = JSON.parse(raw);
    return {
      events: parsed.events ?? {},
      places: parsed.places ?? {}
    };
  } catch {
    return { events: {}, places: {} };
  }
}

function saveSaved(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function isSaved(type, id) {
  const saved = loadSaved();
  return Boolean((type === "event" ? saved.events : saved.places)[id]);
}

function toggleSave(type, id) {
  const saved = loadSaved();
  const bucket = type === "event" ? saved.events : saved.places;

  if (bucket[id]) {
    delete bucket[id];
  } else {
    bucket[id] = { savedAt: new Date().toISOString() };
  }

  saveSaved(saved);
}

function setOnlinePill() {
  const el = $("netStatus");
  if (!el) return;
  const online = navigator.onLine;
  el.textContent = online ? "Online" : "Offline";
  el.className = online ? "pill pill--ok" : "pill pill--warn";
}

async function loadSeed() {
  const resp = await fetch("./data/seed.json", { cache: "no-store" });
  if (!resp.ok) throw new Error("Failed to load seed data");
  return await resp.json();
}

function setTab(tab) {
  state.tab = tab;
  state.selected = null;
  state.guideCategoryId = null;
  state.query = "";

  // update UI
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tab);
  });

  const title = tab === "events" ? "Events" : tab === "guide" ? "Guide" : "Saved";
  $("panelTitle").textContent = title;
  $("searchInput").value = "";

  render();
}

function setQuery(q) {
  state.query = (q ?? "").trim().toLowerCase();
  renderList();
}

function showDetail(type, id) {
  state.selected = { type, id };
  renderDetail();
}

function hideDetail() {
  state.selected = null;
  render();
}

function render() {
  const listView = $("listView");
  const detailView = $("detailView");
  listView.classList.remove("is-hidden");
  detailView.classList.add("is-hidden");
  $("detailBody").innerHTML = "";
  renderList();
}

function renderList() {
  const list = $("listView");
  list.innerHTML = "";

  if (!state.seed) return;

  if (state.tab === "events") {
    const events = state.seed.events
      .filter((e) => matchesQuery(e.title, e.location, e.date))
      .map((e) => eventCard(e));

    if (events.length === 0) {
      list.append(emptyCard("No events found."));
      return;
    }
    events.forEach((el) => list.append(el));
    return;
  }

  if (state.tab === "guide") {
    if (!state.guideCategoryId) {
      const cats = state.seed.categories
        .filter((c) => matchesQuery(c.name))
        .map((c) => categoryCard(c));
      if (cats.length === 0) {
        list.append(emptyCard("No categories found."));
        return;
      }
      cats.forEach((el) => list.append(el));
      return;
    }

    const cat = state.seed.categories.find((c) => c.id === state.guideCategoryId);
    const places = state.seed.places
      .filter((p) => p.categoryId === state.guideCategoryId)
      .filter((p) => matchesQuery(p.name, p.area, p.address))
      .map((p) => placeCard(p));

    const header = document.createElement("div");
    header.className = "card";
    header.style.cursor = "default";
    header.innerHTML = `
      <div class="card__title">${escapeHtml(cat?.name ?? "Places")}</div>
      <div class="card__meta"><span class="dot">Tap a place to view details</span></div>
      <div style="margin-top:10px;">
        <button class="btn btn--ghost" type="button" id="backToCats">← Back to categories</button>
      </div>
    `;
    list.append(header);
    header.querySelector("#backToCats").addEventListener("click", () => {
      state.guideCategoryId = null;
      $("searchInput").value = "";
      state.query = "";
      renderList();
    });

    if (places.length === 0) {
      list.append(emptyCard("No places found."));
      return;
    }
    places.forEach((el) => list.append(el));
    return;
  }

  // saved
  const saved = loadSaved();
  const savedEventIds = Object.keys(saved.events);
  const savedPlaceIds = Object.keys(saved.places);

  const items = [];

  for (const id of savedEventIds) {
    const e = state.seed.events.find((x) => x.id === id);
    if (e) items.push({ type: "event", item: e });
  }
  for (const id of savedPlaceIds) {
    const p = state.seed.places.find((x) => x.id === id);
    if (p) items.push({ type: "place", item: p });
  }

  const filtered = items.filter(({ type, item }) => {
    if (type === "event") return matchesQuery(item.title, item.location, item.date);
    return matchesQuery(item.name, item.area, item.address);
  });

  if (filtered.length === 0) {
    list.append(emptyCard("No saved items yet. Save events or places to see them here offline."));
    return;
  }

  filtered.forEach(({ type, item }) => {
    const el = type === "event" ? eventCard(item, { showSavedTag: true }) : placeCard(item, { showSavedTag: true });
    list.append(el);
  });
}

function renderDetail() {
  const listView = $("listView");
  const detailView = $("detailView");
  const body = $("detailBody");

  if (!state.seed || !state.selected) return;

  listView.classList.add("is-hidden");
  detailView.classList.remove("is-hidden");

  const { type, id } = state.selected;
  const isEvent = type === "event";
  const item = isEvent
    ? state.seed.events.find((e) => e.id === id)
    : state.seed.places.find((p) => p.id === id);

  if (!item) {
    body.innerHTML = `<div class="detail__title">Not found</div>`;
    return;
  }

  const savedNow = isSaved(type, id);

  body.innerHTML = isEvent ? eventDetail(item, savedNow) : placeDetail(item, savedNow);

  body.querySelector("#saveBtn").addEventListener("click", () => {
    toggleSave(type, id);
    renderDetail();
  });

  const mapBtn = body.querySelector("#mapBtn");
  if (mapBtn) {
    mapBtn.addEventListener("click", () => {
      const q = isEvent
        ? encodeURIComponent(`${item.title} ${item.location}`)
        : encodeURIComponent(`${item.name} ${item.address ?? ""} Luxembourg City`);
      const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
}

function matchesQuery(...fields) {
  if (!state.query) return true;
  const hay = fields
    .filter(Boolean)
    .map((x) => String(x).toLowerCase())
    .join(" ");
  return hay.includes(state.query);
}

function emptyCard(text) {
  const el = document.createElement("div");
  el.className = "card";
  el.style.cursor = "default";
  el.innerHTML = `<div class="card__title">${escapeHtml(text)}</div>`;
  return el;
}

function eventCard(e, opts = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", "listitem");
  el.innerHTML = `
    <div class="card__title">${escapeHtml(e.title)}</div>
    <div class="card__meta">
      <span>${escapeHtml(e.date)}</span>
      <span class="dot">${escapeHtml(e.location)}</span>
      ${opts.showSavedTag ? `<span class="dot">Saved</span>` : ""}
    </div>
  `;
  el.addEventListener("click", () => showDetail("event", e.id));
  return el;
}

function categoryCard(c) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", "listitem");
  el.innerHTML = `
    <div class="card__title">${escapeHtml(c.name)}</div>
    <div class="card__meta"><span>Browse places</span></div>
  `;
  el.addEventListener("click", () => {
    state.guideCategoryId = c.id;
    renderList();
  });
  return el;
}

function placeCard(p, opts = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", "listitem");
  el.innerHTML = `
    <div class="card__title">${escapeHtml(p.name)}</div>
    <div class="card__meta">
      <span>${escapeHtml(p.area || "Luxembourg City")}</span>
      ${p.address ? `<span class="dot">${escapeHtml(p.address)}</span>` : ""}
      ${opts.showSavedTag ? `<span class="dot">Saved</span>` : ""}
    </div>
  `;
  el.addEventListener("click", () => showDetail("place", p.id));
  return el;
}

function eventDetail(e, savedNow) {
  const actions = `
    <div class="detail__actions">
      <button id="saveBtn" class="btn ${savedNow ? "btn--danger" : "btn--primary"}" type="button">
        ${savedNow ? "Unsave" : "Save for offline"}
      </button>
      <button id="mapBtn" class="btn" type="button">Open map</button>
    </div>
  `;

  const source = e.sourceUrl
    ? `<a href="${escapeAttr(e.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : `<span style="color: rgba(255,255,255,.55)">Source: (not set)</span>`;

  return `
    <div class="detail__title">${escapeHtml(e.title)}</div>
    <div class="kv">
      <div class="kv__row"><div class="kv__key">Date</div><div>${escapeHtml(e.date)}</div></div>
      <div class="kv__row"><div class="kv__key">Location</div><div>${escapeHtml(e.location)}</div></div>
      <div class="kv__row"><div class="kv__key">Area</div><div>Luxembourg City</div></div>
      <div class="kv__row"><div class="kv__key">Link</div><div>${source}</div></div>
    </div>
    <div class="detail__desc">${escapeHtml(e.description || "")}</div>
    ${actions}
  `;
}

function placeDetail(p, savedNow) {
  const actions = `
    <div class="detail__actions">
      <button id="saveBtn" class="btn ${savedNow ? "btn--danger" : "btn--primary"}" type="button">
        ${savedNow ? "Unsave" : "Save for offline"}
      </button>
      <button id="mapBtn" class="btn" type="button">Open map</button>
    </div>
  `;

  return `
    <div class="detail__title">${escapeHtml(p.name)}</div>
    <div class="kv">
      <div class="kv__row"><div class="kv__key">Area</div><div>${escapeHtml(p.area || "Luxembourg City")}</div></div>
      ${p.address ? `<div class="kv__row"><div class="kv__key">Address</div><div>${escapeHtml(p.address)}</div></div>` : ""}
      ${p.hours ? `<div class="kv__row"><div class="kv__key">Hours</div><div>${escapeHtml(p.hours)}</div></div>` : ""}
    </div>
    <div class="detail__desc">${escapeHtml(p.description || "")}</div>
    ${actions}
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "&#096;");
}

async function main() {
  setOnlinePill();
  window.addEventListener("online", setOnlinePill);
  window.addEventListener("offline", setOnlinePill);

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  $("searchInput").addEventListener("input", (e) => setQuery(e.target.value));
  $("backBtn").addEventListener("click", hideDetail);

  // PWA/offline shell
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch {
      // ignore
    }
  }

  state.seed = await loadSeed();
  render();
}

main().catch((err) => {
  console.error(err);
  $("listView").innerHTML = "";
  $("listView").append(emptyCard("Failed to load app data."));
});

