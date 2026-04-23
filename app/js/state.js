const KEY_VIEW = "luxguide.view";
const KEY_LANG = "luxguide.lang";

export function getViewMode() {
  const v = localStorage.getItem(KEY_VIEW);
  return v === "list" ? "list" : "cards";
}

export function setViewMode(mode) {
  localStorage.setItem(KEY_VIEW, mode === "list" ? "list" : "cards");
}

export function getLang() {
  const v = localStorage.getItem(KEY_LANG);
  return v || "en";
}

export function setLang(lang) {
  localStorage.setItem(KEY_LANG, lang || "en");
}
