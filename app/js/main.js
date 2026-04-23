import { getViewMode, setViewMode } from "./state.js";
import { startRouter } from "./router.js";

const mount = document.getElementById("app");

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

syncViewButtons();
bindViewToggle();

startRouter({
  mount,
  getViewMode,
});

