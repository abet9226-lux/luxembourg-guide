const STORAGE_KEY = "lux-guide:saved:v1";
const CUSTOM_KEY = "lux-guide:custom:v1";
const OFFICIAL_FILE = "./data/official.json";

const state = {
  tab: "events", // events | guide | saved
  query: "",
  seed: null,
  official: null,
  custom: { events: [], categories: [], places: [] },
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

  setAddButtonVisibility();
  render();
}

function setAddButtonVisibility() {
  const btn = $("addBtn");
  if (!btn) return;
  btn.style.display = state.tab === "saved" ? "none" : "inline-flex";
  btn.textContent = state.tab === "events" ? "+ Add event" : "+ Add place";
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
  const data = mergedData();
  if (!data) return;

  if (state.tab === "events") {
    const events = data.events
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
    const places = data.places
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

  const source = p.sourceUrl
    ? `<a href="${escapeAttr(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a>`
    : `<span style="color: rgba(255,255,255,.55)">Source: (not set)</span>`;

  return `
    <div class="detail__title">${escapeHtml(p.name)}</div>
    <div class="kv">
      <div class="kv__row"><div class="kv__key">Area</div><div>${escapeHtml(p.area || "Luxembourg City")}</div></div>
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
        const payload = readEventForm();
        const next = loadCustom();
        next.events.push(payload);
        saveCustom(next);
      } else {
        const payload = readPlaceForm();
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
  `;
}

function makeId(prefix) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

function readEventForm() {
  const title = $("evTitle")?.value?.trim();
  const date = $("evDate")?.value?.trim();
  const location = $("evLocation")?.value?.trim();
  const description = $("evDesc")?.value?.trim() ?? "";
  const sourceUrl = $("evSource")?.value?.trim() ?? "";

  if (!title) throw new Error("Title is required.");
  if (!date) throw new Error("Date is required.");
  if (!location) throw new Error("Location is required.");
  if (sourceUrl && !looksLikeUrl(sourceUrl)) throw new Error("Source URL must start with http:// or https://");

  return {
    id: makeId("evt_custom"),
    title,
    date,
    location,
    description,
    sourceUrl
  };
}

function readPlaceForm() {
  const name = $("plName")?.value?.trim();
  const categoryId = $("plCategory")?.value?.trim();
  const area = $("plArea")?.value?.trim() ?? "";
  const address = $("plAddress")?.value?.trim() ?? "";
  const hours = $("plHours")?.value?.trim() ?? "";
  const description = $("plDesc")?.value?.trim() ?? "";
  const sourceUrl = $("plSource")?.value?.trim() ?? "";

  if (!name) throw new Error("Place name is required.");
  if (!categoryId) throw new Error("Category is required.");
  if (sourceUrl && !looksLikeUrl(sourceUrl)) throw new Error("Source URL must start with http:// or https://");

  return {
    id: makeId("pl_custom"),
    categoryId,
    name,
    area,
    address,
    hours,
    description,
    mapUrl: "",
    sourceUrl
  };
}

function looksLikeUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
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
  $("addBtn").addEventListener("click", openAddModal);
  $("importBtn").addEventListener("click", showImportHelp);

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

