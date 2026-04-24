const STORAGE_KEY = "lux-guide:saved:v1";
const CUSTOM_KEY = "lux-guide:custom:v1";
const OFFICIAL_FILE = "./data/official.json";

const IMAGE_FALLBACK =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#101a2f"/>
          <stop offset="1" stop-color="#0b1220"/>
        </linearGradient>
      </defs>
      <rect width="480" height="320" fill="url(#g)"/>
      <circle cx="170" cy="150" r="44" fill="#16213e"/>
      <rect x="230" y="120" width="110" height="14" rx="7" fill="#16213e"/>
      <rect x="230" y="148" width="150" height="14" rx="7" fill="#16213e"/>
      <rect x="230" y="176" width="90" height="14" rx="7" fill="#16213e"/>
      <text x="240" y="260" text-anchor="middle" font-family="system-ui,Segoe UI,Arial" font-size="14" fill="rgba(255,255,255,.55)">
        Image unavailable offline
      </text>
    </svg>`
  );

const state = {
  tab: "events", // events | guide | saved
  query: "",
  month: "all",
  area: "all",
  placeArea: "all",
  savedArea: "all",
  yearView: false,
  seed: null,
  official: null,
  custom: { events: [], categories: [], places: [] },
  selected: null, // { type: "event"|"place", id: string }
  guideCategoryId: null
};

function $(id) {
  return document.getElementById(id);
}

function imageHtml(url, className) {
  if (!url) return "";
  return `<img class="${className}" src="${escapeAttr(url)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}';this.classList.add('is-fallback');" />`;
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

function loadCustom() {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return { events: [], categories: [], places: [] };
    const parsed = JSON.parse(raw);
    return {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      places: Array.isArray(parsed.places) ? parsed.places : []
    };
  } catch {
    return { events: [], categories: [], places: [] };
  }
}

function saveCustom(next) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  state.custom = next;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openJsonFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.remove();
      if (!file) return resolve(null);
      try {
        const txt = await file.text();
        resolve(txt);
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}

function makeBackupPayload() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    saved: loadSaved(),
    custom: loadCustom()
  };
}

function exportBackup() {
  const payload = makeBackupPayload();
  const stamp = new Date().toISOString().slice(0, 10);
  downloadTextFile(`lux-city-backup-${stamp}.json`, JSON.stringify(payload, null, 2));
}

async function restoreBackup() {
  const txt = await openJsonFilePicker();
  if (!txt) return;
  let parsed;
  try {
    parsed = JSON.parse(txt);
  } catch {
    window.alert("Invalid backup file (not JSON).");
    return;
  }

  const saved = parsed?.saved;
  const custom = parsed?.custom;

  const validSaved = saved && typeof saved === "object" && typeof saved.events === "object" && typeof saved.places === "object";
  const validCustom = custom && typeof custom === "object" && Array.isArray(custom.events) && Array.isArray(custom.places) && Array.isArray(custom.categories);

  if (!validSaved || !validCustom) {
    window.alert("Invalid backup file (missing required fields).");
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
  state.custom = custom;
  state.selected = null;
  window.alert("Backup restored. Your Saved and custom items are back.");
  setEventsControlsVisibility();
  render();
}

function mergedData() {
  if (!state.seed) return null;
  const seed = state.seed;
  const official = state.official;
  const custom = state.custom ?? { events: [], categories: [], places: [] };

  const categories = [...seed.categories];
  if (official?.categories) {
    for (const c of official.categories) {
      if (!categories.some((x) => x.id === c.id)) categories.push(c);
    }
  }
  for (const c of custom.categories) {
    if (!categories.some((x) => x.id === c.id)) categories.push(c);
  }

  const officialEvents = Array.isArray(official?.events) ? official.events : [];
  const officialPlaces = Array.isArray(official?.places) ? official.places : [];

  return {
    ...seed,
    events: [...seed.events, ...officialEvents, ...custom.events],
    categories,
    places: [...seed.places, ...officialPlaces, ...custom.places]
  };
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

function isCustomId(id) {
  return typeof id === "string" && (id.startsWith("evt_custom_") || id.startsWith("pl_custom_"));
}

function deleteCustomItem(type, id) {
  const next = loadCustom();
  if (type === "event") {
    next.events = next.events.filter((e) => e.id !== id);
  } else {
    next.places = next.places.filter((p) => p.id !== id);
  }
  saveCustom(next);

  // Also remove from saved if it was saved.
  const saved = loadSaved();
  if (type === "event") delete saved.events[id];
  else delete saved.places[id];
  saveSaved(saved);
}

function updateCustomItem(type, id, patch) {
  const next = loadCustom();
  if (type === "event") {
    next.events = next.events.map((e) => (e.id === id ? { ...e, ...patch, id } : e));
  } else {
    next.places = next.places.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
  }
  saveCustom(next);
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

async function loadOfficialOptional() {
  try {
    const resp = await fetch(OFFICIAL_FILE, { cache: "no-store" });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

async function reloadData() {
  try {
    state.seed = await loadSeed();
    state.official = await loadOfficialOptional();
    state.custom = loadCustom();
    state.selected = null;
    hydrateAreaFilter();
    setEventsControlsVisibility();
    render();
  } catch {
    window.alert("Reload failed. Please refresh the page.");
  }
}

function setTab(tab) {
  state.tab = tab;
  state.selected = null;
  state.guideCategoryId = null;
  state.query = "";
  state.month = "all";
  state.area = "all";
  state.placeArea = "all";
  state.savedArea = "all";
  state.yearView = false;

  // update UI
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.tab === tab);
  });

  const title = tab === "events" ? "Events" : tab === "guide" ? "Guide" : "Saved";
  $("panelTitle").textContent = title;
  $("searchInput").value = "";

  setEventsControlsVisibility();
  setAddButtonVisibility();
  render();
}

function setAddButtonVisibility() {
  const btn = $("addBtn");
  if (!btn) return;
  btn.style.display = state.tab === "saved" ? "none" : "inline-flex";
  btn.textContent = state.tab === "events" ? "+ Add event" : "+ Add place";
}

function setEventsControlsVisibility() {
  const wrap = $("monthFilterWrap");
  const areaWrap = $("areaFilterWrap");
  const placeAreaWrap = $("placeAreaFilterWrap");
  const savedAreaWrap = $("savedAreaFilterWrap");
  const yearBtn = $("yearViewBtn");
  const backupBtn = $("backupBtn");
  const restoreBtn = $("restoreBtn");
  if (!wrap || !areaWrap || !placeAreaWrap || !savedAreaWrap || !yearBtn) return;

  const showEvents = state.tab === "events";
  wrap.classList.toggle("is-hidden", !showEvents);
  areaWrap.classList.toggle("is-hidden", !showEvents);
  yearBtn.classList.toggle("is-hidden", !showEvents);
  yearBtn.textContent = state.yearView ? "List view" : "Year view";
  if (showEvents) {
    $("monthFilter").value = state.month;
    $("areaFilter").value = state.area;
  }

  const showPlaceAreas = state.tab === "guide" && Boolean(state.guideCategoryId);
  placeAreaWrap.classList.toggle("is-hidden", !showPlaceAreas);
  if (showPlaceAreas) {
    $("placeAreaFilter").value = state.placeArea;
  }

  const showBackup = state.tab === "saved";
  if (backupBtn) backupBtn.classList.toggle("is-hidden", !showBackup);
  if (restoreBtn) restoreBtn.classList.toggle("is-hidden", !showBackup);

  savedAreaWrap.classList.toggle("is-hidden", !showBackup);
  if (showBackup) {
    $("savedAreaFilter").value = state.savedArea;
  }
}

function setQuery(q) {
  state.query = (q ?? "").trim().toLowerCase();
  renderList();
}

function setMonth(m) {
  state.month = m;
  renderList();
}

function setArea(a) {
  state.area = a;
  renderList();
}

function setPlaceArea(a) {
  state.placeArea = a;
  renderList();
}

function setSavedArea(a) {
  state.savedArea = a;
  renderList();
}

function toggleYearView() {
  state.yearView = !state.yearView;
  setEventsControlsVisibility();
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
  const data = mergedData();
  if (!data) return;

  if (state.tab === "events") {
    const events = data.events.filter((e) => matchesQuery(e.title, e.location, e.date));
    const filtered = filterByArea(filterByMonth(events, state.month), state.area);

    if (filtered.length === 0) {
      list.append(emptyCard("No events found."));
      return;
    }
    if (state.yearView) {
      renderEventsYearView(list, filtered);
    } else {
      filtered.map((e) => eventCard(e)).forEach((el) => list.append(el));
    }
    return;
  }

  if (state.tab === "guide") {
    if (!state.guideCategoryId) {
      state.placeArea = "all";
      setEventsControlsVisibility();
      const cats = data.categories
        .filter((c) => matchesQuery(c.name))
        .map((c) => categoryCard(c));
      if (cats.length === 0) {
        list.append(emptyCard("No categories found."));
        return;
      }
      cats.forEach((el) => list.append(el));
      return;
    }

    const cat = data.categories.find((c) => c.id === state.guideCategoryId);
    const basePlaces = data.places
      .filter((p) => p.categoryId === state.guideCategoryId)
      .filter((p) => matchesQuery(p.name, p.area, p.address));

    hydratePlaceAreaFilter(basePlaces);
    setEventsControlsVisibility();

    const places = filterPlacesByArea(basePlaces, state.placeArea).map((p) => placeCard(p));

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
      state.placeArea = "all";
      setEventsControlsVisibility();
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
    const e = data.events.find((x) => x.id === id);
    if (e) items.push({ type: "event", item: e });
  }
  for (const id of savedPlaceIds) {
    const p = data.places.find((x) => x.id === id);
    if (p) items.push({ type: "place", item: p });
  }

  const filtered = items.filter(({ type, item }) => {
    if (type === "event") return matchesQuery(item.title, item.location, item.date);
    return matchesQuery(item.name, item.area, item.address);
  });

  hydrateSavedAreaFilter(filtered);
  const areaFiltered = filterSavedByArea(filtered, state.savedArea);

  if (areaFiltered.length === 0) {
    list.append(emptyCard("No saved items yet. Save events or places to see them here offline."));
    return;
  }

  areaFiltered.forEach(({ type, item }) => {
    const el = type === "event" ? eventCard(item, { showSavedTag: true }) : placeCard(item, { showSavedTag: true });
    list.append(el);
  });
}

function renderDetail() {
  const listView = $("listView");
  const detailView = $("detailView");
  const body = $("detailBody");

  if (!state.seed || !state.selected) return;
  const data = mergedData();
  if (!data) return;

  listView.classList.add("is-hidden");
  detailView.classList.remove("is-hidden");

  const { type, id } = state.selected;
  const isEvent = type === "event";
  const item = isEvent
    ? data.events.find((e) => e.id === id)
    : data.places.find((p) => p.id === id);

  if (!item) {
    body.innerHTML = `<div class="detail__title">Not found</div>`;
    return;
  }

  const savedNow = isSaved(type, id);
  const canEdit = isCustomId(id);

  body.innerHTML = isEvent
    ? eventDetail(item, savedNow, { canEdit })
    : placeDetail(item, savedNow, { canEdit });

  body.querySelector("#saveBtn").addEventListener("click", () => {
    toggleSave(type, id);
    renderDetail();
  });

  const editBtn = body.querySelector("#editBtn");
  if (editBtn) {
    editBtn.addEventListener("click", () => openEditModal(type, item));
  }

  const delBtn = body.querySelector("#deleteBtn");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      const ok = window.confirm("Delete this item? This cannot be undone.");
      if (!ok) return;
      deleteCustomItem(type, id);
      hideDetail();
    });
  }

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
  const img = e.imageUrl ? imageHtml(e.imageUrl, "thumb") : `<div class="thumb" aria-hidden="true"></div>`;
  el.innerHTML = `
    <div class="media">
      ${img}
      <div>
        <div class="card__title">${escapeHtml(e.title)}</div>
        <div class="card__meta">
          <span>${escapeHtml(e.date)}</span>
          <span class="dot">${escapeHtml(e.location)}</span>
          ${e.area ? `<span class="dot">${escapeHtml(e.area)}</span>` : ""}
          ${opts.showSavedTag ? `<span class="dot">Saved</span>` : ""}
        </div>
      </div>
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
    state.placeArea = "all";
    setEventsControlsVisibility();
    renderList();
  });
  return el;
}

function placeCard(p, opts = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", "listitem");
  const img = p.imageUrl ? imageHtml(p.imageUrl, "thumb") : `<div class="thumb" aria-hidden="true"></div>`;
  el.innerHTML = `
    <div class="media">
      ${img}
      <div>
        <div class="card__title">${escapeHtml(p.name)}</div>
        <div class="card__meta">
          <span>${escapeHtml(p.area || "Luxembourg City")}</span>
          ${p.address ? `<span class="dot">${escapeHtml(p.address)}</span>` : ""}
          ${opts.showSavedTag ? `<span class="dot">Saved</span>` : ""}
        </div>
      </div>
    </div>
  `;
  el.addEventListener("click", () => showDetail("place", p.id));
  return el;
}

function eventDetail(e, savedNow, opts = {}) {
  const actions = `
    <div class="detail__actions">
      <button id="saveBtn" class="btn ${savedNow ? "btn--danger" : "btn--primary"}" type="button">
        ${savedNow ? "Unsave" : "Save for offline"}
      </button>
      <button id="mapBtn" class="btn" type="button">Open map</button>
      ${opts.canEdit ? `<button id="editBtn" class="btn" type="button">Edit</button>` : ""}
      ${opts.canEdit ? `<button id="deleteBtn" class="btn btn--danger" type="button">Delete</button>` : ""}
    </div>
  `;

  const source = e.sourceUrl
    ? `<a href="${escapeAttr(e.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : `<span style="color: rgba(255,255,255,.55)">Source: (not set)</span>`;

  const area = e.area ? escapeHtml(e.area) : "Luxembourg City";
  const areaNote = e.areaNote ? escapeHtml(e.areaNote) : "";
  const gettingThere = e.gettingThere ? escapeHtml(e.gettingThere) : "";
  const goodToKnow = e.goodToKnow ? escapeHtml(e.goodToKnow) : "";
  const avatar = e.imageUrl ? imageHtml(e.imageUrl, "detail__avatar") : "";
  const mapQuery = `${e.title ?? ""} ${e.location ?? ""} Luxembourg City`.trim();

  return `
    <div class="detail__heading">
      ${avatar}
      <div class="detail__title">${escapeHtml(e.title)}</div>
    </div>
    ${e.imageUrl ? imageHtml(e.imageUrl, "hero") : ""}
    ${mapPreviewHtml(mapQuery)}
    <div class="kv">
      <div class="kv__row"><div class="kv__key">Date</div><div>${escapeHtml(e.date)}</div></div>
      <div class="kv__row"><div class="kv__key">Location</div><div>${escapeHtml(e.location)}</div></div>
      <div class="kv__row"><div class="kv__key">Area</div><div>${area}</div></div>
      ${areaNote ? `<div class="kv__row"><div class="kv__key">About this area</div><div>${areaNote}</div></div>` : ""}
      ${gettingThere ? `<div class="kv__row"><div class="kv__key">Getting there</div><div>${gettingThere}</div></div>` : ""}
      ${goodToKnow ? `<div class="kv__row"><div class="kv__key">Good to know</div><div>${goodToKnow}</div></div>` : ""}
      <div class="kv__row"><div class="kv__key">Link</div><div>${source}</div></div>
    </div>
    <div class="detail__desc">${escapeHtml(e.description || "")}</div>
    ${actions}
  `;
}

function placeDetail(p, savedNow, opts = {}) {
  const actions = `
    <div class="detail__actions">
      <button id="saveBtn" class="btn ${savedNow ? "btn--danger" : "btn--primary"}" type="button">
        ${savedNow ? "Unsave" : "Save for offline"}
      </button>
      <button id="mapBtn" class="btn" type="button">Open map</button>
      ${opts.canEdit ? `<button id="editBtn" class="btn" type="button">Edit</button>` : ""}
      ${opts.canEdit ? `<button id="deleteBtn" class="btn btn--danger" type="button">Delete</button>` : ""}
    </div>
  `;

  const source = p.sourceUrl
    ? `<a href="${escapeAttr(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : `<span style="color: rgba(255,255,255,.55)">Source: (not set)</span>`;

  const areaNote = p.areaNote ? escapeHtml(p.areaNote) : "";
  const gettingThere = p.gettingThere ? escapeHtml(p.gettingThere) : "";
  const goodToKnow = p.goodToKnow ? escapeHtml(p.goodToKnow) : "";
  const avatar = p.imageUrl ? imageHtml(p.imageUrl, "detail__avatar") : "";
  const mapQuery = `${p.name ?? ""} ${p.address ?? ""} Luxembourg City`.trim();

  return `
    <div class="detail__heading">
      ${avatar}
      <div class="detail__title">${escapeHtml(p.name)}</div>
    </div>
    ${p.imageUrl ? imageHtml(p.imageUrl, "hero") : ""}
    ${mapPreviewHtml(mapQuery)}
    <div class="kv">
      <div class="kv__row"><div class="kv__key">Area</div><div>${escapeHtml(p.area || "Luxembourg City")}</div></div>
      ${areaNote ? `<div class="kv__row"><div class="kv__key">About this area</div><div>${areaNote}</div></div>` : ""}
      ${gettingThere ? `<div class="kv__row"><div class="kv__key">Getting there</div><div>${gettingThere}</div></div>` : ""}
      ${goodToKnow ? `<div class="kv__row"><div class="kv__key">Good to know</div><div>${goodToKnow}</div></div>` : ""}
      ${p.address ? `<div class="kv__row"><div class="kv__key">Address</div><div>${escapeHtml(p.address)}</div></div>` : ""}
      ${p.hours ? `<div class="kv__row"><div class="kv__key">Hours</div><div>${escapeHtml(p.hours)}</div></div>` : ""}
      <div class="kv__row"><div class="kv__key">Link</div><div>${source}</div></div>
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

function mapEmbedUrl(query) {
  const q = encodeURIComponent(query);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function mapLinkUrl(query) {
  const q = encodeURIComponent(query);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function mapPreviewHtml(query) {
  if (!query) return "";
  const src = mapEmbedUrl(query);
  const link = mapLinkUrl(query);
  return `
    <div class="mapPreview">
      <iframe title="Map preview" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${escapeAttr(src)}"></iframe>
      <div class="mapPreview__meta">
        Map preview uses Google Maps. <a href="${escapeAttr(link)}" target="_blank" rel="noopener noreferrer">Open in Maps</a>
      </div>
    </div>
  `;
}

function openAddModal() {
  const modal = $("modal");
  const title = $("modalTitle");
  const body = $("modalBody");

  if (!modal || !title || !body) return;

  const data = mergedData();
  if (!data) return;

  const isEvents = state.tab === "events";
  title.textContent = isEvents ? "Add event" : "Add place";

  body.innerHTML = isEvents ? addEventForm() : addPlaceForm(data.categories);

  const err = body.querySelector("#formError");
  const form = $("modalForm");

  // Remove any previous listener by replacing handler reference.
  form.onsubmit = (ev) => {
    const submitter = ev.submitter;
    const isCancel = submitter && submitter.value === "cancel";
    if (isCancel) return;

    ev.preventDefault();

    try {
      if (isEvents) {
        const payload = { id: makeId("evt_custom"), ...readEventForm() };
        const next = loadCustom();
        next.events.push(payload);
        saveCustom(next);
      } else {
        const payload = { id: makeId("pl_custom"), ...readPlaceForm() };
        const next = loadCustom();
        // Ensure category exists in custom set if user chose it.
        if (!data.categories.some((c) => c.id === payload.categoryId)) {
          // shouldn't happen because select is built from categories
        }
        next.places.push(payload);
        saveCustom(next);
      }

      modal.close();
      render();
    } catch (e) {
      if (err) err.textContent = e instanceof Error ? e.message : "Invalid input.";
    }
  };

  modal.showModal();
}

function openEditModal(type, item) {
  const modal = $("modal");
  const title = $("modalTitle");
  const body = $("modalBody");
  const saveBtn = $("modalSaveBtn");

  if (!modal || !title || !body || !saveBtn) return;

  const isEvent = type === "event";
  title.textContent = isEvent ? "Edit event" : "Edit place";
  saveBtn.style.display = "";

  const data = mergedData();
  if (!data) return;

  body.innerHTML = isEvent ? editEventForm(item) : editPlaceForm(data.categories, item);

  const err = body.querySelector("#formError");
  const form = $("modalForm");
  form.onsubmit = (ev) => {
    const submitter = ev.submitter;
    const isCancel = submitter && submitter.value === "cancel";
    if (isCancel) return;

    ev.preventDefault();
    try {
      if (isEvent) {
        const patch = readEventForm({ prefix: "evE_" });
        updateCustomItem("event", item.id, patch);
      } else {
        const patch = readPlaceForm({ prefix: "plE_" });
        updateCustomItem("place", item.id, patch);
      }
      modal.close();
      renderDetail();
    } catch (e) {
      if (err) err.textContent = e instanceof Error ? e.message : "Invalid input.";
    }
  };

  modal.showModal();
}

function addEventForm() {
  return `
    <div class="error" id="formError"></div>
    <div class="field">
      <label for="evTitle">Title *</label>
      <input id="evTitle" name="title" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evDate">Date *</label>
      <input id="evDate" name="date" placeholder="e.g., 23 June 2026" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evLocation">Location *</label>
      <input id="evLocation" name="location" value="Luxembourg City" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evDesc">Description</label>
      <textarea id="evDesc" name="description" placeholder="Short, clear public info"></textarea>
    </div>
    <div class="field">
      <label for="evSource">Source URL (optional)</label>
      <input id="evSource" name="sourceUrl" placeholder="https://…" autocomplete="off" />
    </div>
    <div class="field">
      <label for="evImage">Image URL (optional)</label>
      <input id="evImage" name="imageUrl" placeholder="https://…" autocomplete="off" />
    </div>
  `;
}

function editEventForm(e) {
  return `
    <div class="error" id="formError"></div>
    <div class="field">
      <label for="evE_title">Title *</label>
      <input id="evE_title" value="${escapeAttr(e.title ?? "")}" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evE_date">Date *</label>
      <input id="evE_date" value="${escapeAttr(e.date ?? "")}" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evE_location">Location *</label>
      <input id="evE_location" value="${escapeAttr(e.location ?? "")}" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="evE_description">Description</label>
      <textarea id="evE_description" placeholder="Short, clear public info">${escapeHtml(e.description ?? "")}</textarea>
    </div>
    <div class="field">
      <label for="evE_sourceUrl">Source URL (optional)</label>
      <input id="evE_sourceUrl" value="${escapeAttr(e.sourceUrl ?? "")}" placeholder="https://…" autocomplete="off" />
    </div>
    <div class="field">
      <label for="evE_imageUrl">Image URL (optional)</label>
      <input id="evE_imageUrl" value="${escapeAttr(e.imageUrl ?? "")}" placeholder="https://…" autocomplete="off" />
    </div>
  `;
}

function addPlaceForm(categories) {
  const opts = categories
    .map((c) => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`)
    .join("");

  return `
    <div class="error" id="formError"></div>
    <div class="field">
      <label for="plName">Place name *</label>
      <input id="plName" name="name" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="plCategory">Category *</label>
      <select id="plCategory" name="categoryId" required>${opts}</select>
    </div>
    <div class="field">
      <label for="plArea">Area</label>
      <input id="plArea" name="area" value="Luxembourg City" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plAddress">Address</label>
      <input id="plAddress" name="address" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plHours">Opening hours</label>
      <input id="plHours" name="hours" placeholder="e.g., 10:00–18:00" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plDesc">Description</label>
      <textarea id="plDesc" name="description" placeholder="Short, clear public info"></textarea>
    </div>
    <div class="field">
      <label for="plSource">Source URL (optional)</label>
      <input id="plSource" name="sourceUrl" placeholder="https://…" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plImage">Image URL (optional)</label>
      <input id="plImage" name="imageUrl" placeholder="https://…" autocomplete="off" />
    </div>
  `;
}

function editPlaceForm(categories, p) {
  const opts = categories
    .map((c) => {
      const selected = c.id === p.categoryId ? "selected" : "";
      return `<option value="${escapeAttr(c.id)}" ${selected}>${escapeHtml(c.name)}</option>`;
    })
    .join("");

  return `
    <div class="error" id="formError"></div>
    <div class="field">
      <label for="plE_name">Place name *</label>
      <input id="plE_name" value="${escapeAttr(p.name ?? "")}" autocomplete="off" required />
    </div>
    <div class="field">
      <label for="plE_categoryId">Category *</label>
      <select id="plE_categoryId" required>${opts}</select>
    </div>
    <div class="field">
      <label for="plE_area">Area</label>
      <input id="plE_area" value="${escapeAttr(p.area ?? "")}" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plE_address">Address</label>
      <input id="plE_address" value="${escapeAttr(p.address ?? "")}" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plE_hours">Opening hours</label>
      <input id="plE_hours" value="${escapeAttr(p.hours ?? "")}" placeholder="e.g., 10:00–18:00" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plE_description">Description</label>
      <textarea id="plE_description" placeholder="Short, clear public info">${escapeHtml(p.description ?? "")}</textarea>
    </div>
    <div class="field">
      <label for="plE_sourceUrl">Source URL (optional)</label>
      <input id="plE_sourceUrl" value="${escapeAttr(p.sourceUrl ?? "")}" placeholder="https://…" autocomplete="off" />
    </div>
    <div class="field">
      <label for="plE_imageUrl">Image URL (optional)</label>
      <input id="plE_imageUrl" value="${escapeAttr(p.imageUrl ?? "")}" placeholder="https://…" autocomplete="off" />
    </div>
  `;
}

function makeId(prefix) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

function readEventForm(opts = {}) {
  const prefix = opts.prefix ?? "";
  const title = $(prefix ? `${prefix}title` : "evTitle")?.value?.trim();
  const date = $(prefix ? `${prefix}date` : "evDate")?.value?.trim();
  const location = $(prefix ? `${prefix}location` : "evLocation")?.value?.trim();
  const description = $(prefix ? `${prefix}description` : "evDesc")?.value?.trim() ?? "";
  const sourceUrl = $(prefix ? `${prefix}sourceUrl` : "evSource")?.value?.trim() ?? "";
  const imageUrl = $(prefix ? `${prefix}imageUrl` : "evImage")?.value?.trim() ?? "";

  if (!title) throw new Error("Title is required.");
  if (!date) throw new Error("Date is required.");
  if (!location) throw new Error("Location is required.");
  if (sourceUrl && !looksLikeUrl(sourceUrl)) throw new Error("Source URL must start with http:// or https://");
  if (imageUrl && !looksLikeUrl(imageUrl)) throw new Error("Image URL must start with http:// or https://");

  return {
    title,
    date,
    location,
    description,
    sourceUrl,
    imageUrl
  };
}

function readPlaceForm(opts = {}) {
  const prefix = opts.prefix ?? "";
  const name = $(prefix ? `${prefix}name` : "plName")?.value?.trim();
  const categoryId = $(prefix ? `${prefix}categoryId` : "plCategory")?.value?.trim();
  const area = $(prefix ? `${prefix}area` : "plArea")?.value?.trim() ?? "";
  const address = $(prefix ? `${prefix}address` : "plAddress")?.value?.trim() ?? "";
  const hours = $(prefix ? `${prefix}hours` : "plHours")?.value?.trim() ?? "";
  const description = $(prefix ? `${prefix}description` : "plDesc")?.value?.trim() ?? "";
  const sourceUrl = $(prefix ? `${prefix}sourceUrl` : "plSource")?.value?.trim() ?? "";
  const imageUrl = $(prefix ? `${prefix}imageUrl` : "plImage")?.value?.trim() ?? "";

  if (!name) throw new Error("Place name is required.");
  if (!categoryId) throw new Error("Category is required.");
  if (sourceUrl && !looksLikeUrl(sourceUrl)) throw new Error("Source URL must start with http:// or https://");
  if (imageUrl && !looksLikeUrl(imageUrl)) throw new Error("Image URL must start with http:// or https://");

  return {
    categoryId,
    name,
    area,
    address,
    hours,
    description,
    mapUrl: "",
    sourceUrl,
    imageUrl
  };
}

function monthName(m) {
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return names[m - 1] ?? "Unknown";
}

function monthFromEvent(e) {
  if (typeof e.month === "number" && e.month >= 1 && e.month <= 12) return e.month;
  const txt = `${e.date ?? ""} ${e.title ?? ""}`.toLowerCase();
  const map = [
    ["jan", 1], ["feb", 2], ["mar", 3], ["apr", 4], ["may", 5], ["jun", 6],
    ["jul", 7], ["aug", 8], ["sep", 9], ["oct", 10], ["nov", 11], ["dec", 12]
  ];
  for (const [k, v] of map) if (txt.includes(k)) return v;
  return null;
}

function filterByMonth(events, month) {
  if (month === "all") return events;
  const m = Number(month);
  return events.filter((e) => monthFromEvent(e) === m);
}

function filterByArea(events, area) {
  if (area === "all") return events;
  return events.filter((e) => (e.area ?? "").trim() === area);
}

function filterPlacesByArea(places, area) {
  if (area === "all") return places;
  return places.filter((p) => (p.area ?? "").trim() === area);
}

function getEventAreas(data) {
  const seen = new Set();
  for (const e of data.events ?? []) {
    const a = (e.area ?? "").trim();
    if (a) seen.add(a);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

function hydrateAreaFilter() {
  const select = $("areaFilter");
  if (!select) return;
  const data = mergedData();
  if (!data) return;

  const areas = getEventAreas(data);
  const cur = state.area;

  select.innerHTML = `<option value="all">All areas</option>` + areas.map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");
  select.value = areas.includes(cur) ? cur : "all";
  state.area = select.value;
}

function getPlaceAreas(places) {
  const seen = new Set();
  for (const p of places ?? []) {
    const a = (p.area ?? "").trim();
    if (a) seen.add(a);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

function hydratePlaceAreaFilter(places) {
  const select = $("placeAreaFilter");
  if (!select) return;

  const areas = getPlaceAreas(places);
  const cur = state.placeArea;

  select.innerHTML =
    `<option value="all">All place areas</option>` +
    areas.map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");

  select.value = areas.includes(cur) ? cur : "all";
  state.placeArea = select.value;
}

function getSavedAreas(items) {
  const seen = new Set();
  for (const { item } of items) {
    const a = (item?.area ?? "").trim();
    if (a) seen.add(a);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}

function hydrateSavedAreaFilter(items) {
  const select = $("savedAreaFilter");
  if (!select) return;

  const areas = getSavedAreas(items);
  const cur = state.savedArea;

  select.innerHTML =
    `<option value="all">All saved areas</option>` +
    areas.map((a) => `<option value="${escapeAttr(a)}">${escapeHtml(a)}</option>`).join("");

  select.value = areas.includes(cur) ? cur : "all";
  state.savedArea = select.value;
  setEventsControlsVisibility();
}

function filterSavedByArea(items, area) {
  if (area === "all") return items;
  return items.filter(({ item }) => (item?.area ?? "").trim() === area);
}

function renderEventsYearView(list, events) {
  const buckets = new Map();
  for (const e of events) {
    const m = monthFromEvent(e) ?? 0;
    if (!buckets.has(m)) buckets.set(m, []);
    buckets.get(m).push(e);
  }

  const order = [1,2,3,4,5,6,7,8,9,10,11,12,0];
  for (const m of order) {
    const items = buckets.get(m);
    if (!items || items.length === 0) continue;

    const header = document.createElement("div");
    header.className = "card";
    header.style.cursor = "default";
    header.innerHTML = `
      <div class="card__title">${m === 0 ? "Unknown month" : monthName(m)}</div>
      <div class="card__meta"><span class="dot">${items.length} event(s)</span></div>
    `;
    list.append(header);

    items.map((e) => eventCard(e)).forEach((el) => list.append(el));
  }
}

function looksLikeUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

async function main() {
  setOnlinePill();
  window.addEventListener("online", setOnlinePill);
  window.addEventListener("offline", setOnlinePill);

  // PWA install prompt
  let deferredInstall = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e;
    const btn = $("installBtn");
    if (btn) btn.classList.remove("is-hidden");
  });
  window.addEventListener("appinstalled", () => {
    const btn = $("installBtn");
    if (btn) btn.classList.add("is-hidden");
    deferredInstall = null;
  });

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  $("searchInput").addEventListener("input", (e) => setQuery(e.target.value));
  $("backBtn").addEventListener("click", hideDetail);
  $("addBtn").addEventListener("click", openAddModal);
  $("importBtn").addEventListener("click", showImportHelp);
  $("reloadBtn").addEventListener("click", reloadData);
  $("installBtn").addEventListener("click", async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      try {
        await deferredInstall.userChoice;
      } catch {
        // ignore
      }
      deferredInstall = null;
      $("installBtn").classList.add("is-hidden");
      return;
    }
    // iOS/Firefox fallback
    window.alert("To install: use your browser menu and choose 'Install' or 'Add to Home Screen'.");
  });
  $("backupBtn").addEventListener("click", exportBackup);
  $("restoreBtn").addEventListener("click", async () => {
    const ok = window.confirm(
      "Restore backup? First we'll download a safety backup of your current data, then you'll pick a JSON file to restore. This will replace your current Saved and custom items on this device."
    );
    if (!ok) return;
    exportBackup();
    await restoreBackup();
  });
  $("monthFilter").addEventListener("change", (e) => setMonth(e.target.value));
  $("areaFilter").addEventListener("change", (e) => setArea(e.target.value));
  $("placeAreaFilter").addEventListener("change", (e) => setPlaceArea(e.target.value));
  $("savedAreaFilter").addEventListener("change", (e) => setSavedArea(e.target.value));
  $("yearViewBtn").addEventListener("click", toggleYearView);

  // PWA/offline shell
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch {
      // ignore
    }
  }

  state.seed = await loadSeed();
  state.official = await loadOfficialOptional();
  state.custom = loadCustom();
  setAddButtonVisibility();
  setEventsControlsVisibility();
  hydrateAreaFilter();
  render();
}

function showImportHelp() {
  const modal = $("modal");
  const title = $("modalTitle");
  const body = $("modalBody");
  const saveBtn = $("modalSaveBtn");

  if (!modal || !title || !body || !saveBtn) return;

  title.textContent = "Update from official sources";
  saveBtn.style.display = "none";

  const hasOfficial = Boolean(state.official);
  const status = hasOfficial
    ? `<div class="pill pill--ok">official.json loaded</div>`
    : `<div class="pill pill--warn">official.json not found yet</div>`;

  body.innerHTML = `
    ${status}
    <div style="color: rgba(255,255,255,.70); line-height: 1.45;">
      This website is static, so it cannot directly download data from official sites (they block cross-site requests).
      To update the list, run the importer script on your PC — it will create <code>data/official.json</code>.
    </div>
    <div class="field">
      <label>Run this in PowerShell (project folder):</label>
      <input readonly value="python tools/import_official.py" />
    </div>
    <div style="color: rgba(255,255,255,.70); line-height: 1.45;">
      Then refresh the page. Your Saved items still work offline.
    </div>
  `;

  const form = $("modalForm");
  form.onsubmit = (ev) => {
    const submitter = ev.submitter;
    const isCancel = submitter && submitter.value === "cancel";
    if (isCancel) {
      saveBtn.style.display = "";
      return;
    }
    ev.preventDefault();
    modal.close();
    saveBtn.style.display = "";
  };

  modal.showModal();
}

main().catch((err) => {
  console.error(err);
  $("listView").innerHTML = "";
  $("listView").append(emptyCard("Failed to load app data."));
});

