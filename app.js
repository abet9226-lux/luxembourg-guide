const STORAGE_KEY = "lux-guide:saved:v1";
const CUSTOM_KEY = "lux-guide:custom:v1";
const OFFICIAL_FILE = "./data/official.json";

const state = {
  tab: "events", // events | guide | saved
  query: "",
  month: "all",
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

function setTab(tab) {
  state.tab = tab;
  state.selected = null;
  state.guideCategoryId = null;
  state.query = "";
  state.month = "all";
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
  const yearBtn = $("yearViewBtn");
  if (!wrap || !yearBtn) return;
  const show = state.tab === "events";
  wrap.classList.toggle("is-hidden", !show);
  yearBtn.classList.toggle("is-hidden", !show);
  yearBtn.textContent = state.yearView ? "List view" : "Year view";
  if (show) {
    $("monthFilter").value = state.month;
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
    const filtered = filterByMonth(events, state.month);

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
  const img = e.imageUrl
    ? `<img class="thumb" src="${escapeAttr(e.imageUrl)}" alt="" loading="lazy" />`
    : `<div class="thumb" aria-hidden="true"></div>`;
  el.innerHTML = `
    <div class="media">
      ${img}
      <div>
        <div class="card__title">${escapeHtml(e.title)}</div>
        <div class="card__meta">
          <span>${escapeHtml(e.date)}</span>
          <span class="dot">${escapeHtml(e.location)}</span>
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
    renderList();
  });
  return el;
}

function placeCard(p, opts = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", "listitem");
  const img = p.imageUrl
    ? `<img class="thumb" src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy" />`
    : `<div class="thumb" aria-hidden="true"></div>`;
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

  return `
    <div class="detail__title">${escapeHtml(e.title)}</div>
    ${e.imageUrl ? `<img class="hero" src="${escapeAttr(e.imageUrl)}" alt="" loading="lazy" />` : ""}
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

  return `
    <div class="detail__title">${escapeHtml(p.name)}</div>
    ${p.imageUrl ? `<img class="hero" src="${escapeAttr(p.imageUrl)}" alt="" loading="lazy" />` : ""}
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

  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  $("searchInput").addEventListener("input", (e) => setQuery(e.target.value));
  $("backBtn").addEventListener("click", hideDetail);
  $("addBtn").addEventListener("click", openAddModal);
  $("importBtn").addEventListener("click", showImportHelp);
  $("monthFilter").addEventListener("change", (e) => setMonth(e.target.value));
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

