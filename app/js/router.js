import { renderEventsList } from "./views/eventsList.js";
import { renderEventDetails } from "./views/eventDetails.js";

function parseRoute() {
  const hash = window.location.hash || "#/events";
  const cleaned = hash.replace(/^#/, "");
  const parts = cleaned.split("/").filter(Boolean);
  const [root, id] = parts;
  if (root === "events" && id) return { name: "eventDetails", id: decodeURIComponent(id) };
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
      const box = document.createElement("div");
      box.className = "panel";
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Something went wrong.";
      const pre = document.createElement("pre");
      pre.textContent = String(e?.message ?? e);
      box.append(p, pre);
      mount.replaceChildren(box);
    });
  });

  render().catch((e) => {
    const box = document.createElement("div");
    box.className = "panel";
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Something went wrong.";
    const pre = document.createElement("pre");
    pre.textContent = String(e?.message ?? e);
    box.append(p, pre);
    mount.replaceChildren(box);
  });
}

