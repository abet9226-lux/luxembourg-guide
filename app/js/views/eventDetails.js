import { getEventById } from "../data.js";
import { escapeHtml, formatDateRange } from "../utils.js";

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

function buildMapLinks({ venue, city }) {
  const q = [venue, city].filter(Boolean).join(", ");
  if (!q) return null;
  const encoded = encodeURIComponent(q);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    osm: `https://www.openstreetmap.org/search?query=${encoded}`,
  };
}

export async function renderEventDetails(mount, eventId) {
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

