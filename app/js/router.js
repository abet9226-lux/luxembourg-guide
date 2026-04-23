import { renderEventsList } from "./views/eventsList.js";
import { renderEventDetails } from "./views/eventDetails.js";

function parseRoute() {
  const hash = window.location.hash || "#/events";
  const cleaned = hash.replace(/^#/, "");
  const parts = cleaned.split("/").filter(Boolean);
  const [root, id] = parts;
  if (root === "events" && id) return { name: "eventDetails", id };
  if (root === "events") return { name: "events" };
  return { name: "events" };
}

export function startRouter({ mount, getViewMode }) {
  async function render() {
    const route = parseRoute();
    if (route.name === "eventDetails") {
      await renderEventDetails(mount, route.id);
      return;
    }
    await renderEventsList(mount, { getViewMode });
  }

  window.addEventListener("hashchange", () => {
    render().catch((e) => {
      mount.innerHTML = `<div class="panel"><p class="muted">Something went wrong.</p><pre>${String(
        e?.message ?? e
      )}</pre></div>`;
    });
  });

  render().catch((e) => {
    mount.innerHTML = `<div class="panel"><p class="muted">Something went wrong.</p><pre>${String(
      e?.message ?? e
    )}</pre></div>`;
  });
}

