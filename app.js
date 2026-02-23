const STORAGE_KEY = "myList";
const SETTINGS_KEY = "mySettings";

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : { theme: "blue", lang: "es" };
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}


let items = loadItems();
let settings = loadSettings();


const cardsEl = document.getElementById("cards");
const counterEl = document.getElementById("counter");

const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");
const typeSelect = document.getElementById("typeSelect");
const statusSelect = document.getElementById("statusSelect");
const seenFields = document.getElementById("seenFields");
const ratingInput = document.getElementById("ratingInput");
const reviewInput = document.getElementById("reviewInput");

const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const clearFilters = document.getElementById("clearFilters");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const modalOverlay = document.getElementById("modalOverlay");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");
let pendingDeleteId = null;

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

const views = {
  home: document.getElementById("view-home"),
  add: document.getElementById("view-add"),
  list: document.getElementById("view-list"),
  settings: document.getElementById("view-settings"),
};

const themeSelect = document.getElementById("themeSelect");
const langSelect = document.getElementById("langSelect");

const nodes = {
  appTitle: document.getElementById("appTitle"),
  homeTitle: document.getElementById("homeTitle"),
  homeSubtitle: document.getElementById("homeSubtitle"),
  btnAdd: document.getElementById("btnAdd"),
  btnList: document.getElementById("btnList"),
  btnSettings: document.getElementById("btnSettings"),

  addTitle: document.getElementById("addTitle"),
  listTitle: document.getElementById("listTitle"),
  settingsTitle: document.getElementById("settingsTitle"),
  filtersTitle: document.getElementById("filtersTitle"),

  lblTitle: document.getElementById("lblTitle"),
  lblType: document.getElementById("lblType"),
  lblStatus: document.getElementById("lblStatus"),
  lblRating: document.getElementById("lblRating"),
  lblReview: document.getElementById("lblReview"),
  btnSubmit: document.getElementById("btnSubmit"),

  lblTheme: document.getElementById("lblTheme"),
  lblLang: document.getElementById("lblLang"),
  settingsHint: document.getElementById("settingsHint"),

  modalTitle: document.getElementById("modalTitle"),
};

const i18n = {
  es: {
    appTitle: "Mi Videoteca",
    homeTitle: "Mi Videoteca",
    homeSubtitle: "Elige una opción 👇",
    btnAdd: "➕ Añadir",
    btnList: "📚 Mi lista",
    btnSettings: "⚙️ Ajustes",

    addTitle: "Añadir",
    listTitle: "Mi lista",
    settingsTitle: "Ajustes",
    filtersTitle: "Buscar y filtrar",

    lblTitle: "Título",
    lblType: "Tipo",
    lblStatus: "Estado",
    lblRating: "Puntuación (0-10)",
    lblReview: "Reseña (opcional)",
    btnSubmit: "Añadir",

    lblTheme: "Tema",
    lblLang: "Idioma",
    settingsHint: "Los cambios se guardan automáticamente.",

    confirm: "Confirmar",
    cancel: "Cancelar",
    delete: "Eliminar",

    empty0: "No hay elementos aún. Añade el primero 👇",
    emptyF: "No hay resultados con esos filtros 😅",

    toggleToSeen: "Marcar Visto",
    toggleToPending: "Marcar Pendiente",

    promptRating: (t) => `Puntúa "${t}" (0-10):`,
    promptReview: (t) => `¿Qué te ha parecido "${t}"? (opcional)`,
  },
  en: {
    appTitle: "My Library",
    homeTitle: "My Library",
    homeSubtitle: "Choose an option 👇",
    btnAdd: "➕ Add",
    btnList: "📚 My list",
    btnSettings: "⚙️ Settings",

    addTitle: "Add",
    listTitle: "My list",
    settingsTitle: "Settings",
    filtersTitle: "Search & filter",

    lblTitle: "Title",
    lblType: "Type",
    lblStatus: "Status",
    lblRating: "Rating (0-10)",
    lblReview: "Review (optional)",
    btnSubmit: "Add",

    lblTheme: "Theme",
    lblLang: "Language",
    settingsHint: "Changes are saved automatically.",

    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",

    empty0: "No items yet. Add your first one 👇",
    emptyF: "No results with those filters 😅",

    toggleToSeen: "Mark Seen",
    toggleToPending: "Mark Pending",

    promptRating: (t) => `Rate "${t}" (0-10):`,
    promptReview: (t) => `What did you think about "${t}"? (optional)`,
  },
};


function t(key, ...args) {
  const lang = settings.lang || "es";
  const value = i18n[lang][key];
  return typeof value === "function" ? value(...args) : value;
}

function setLanguage(lang) {
  settings.lang = lang;
  saveSettings(settings);
  applyI18n();
  applyFilters();
}

function setTheme(theme) {
  settings.theme = theme;
  saveSettings(settings);
  document.documentElement.setAttribute("data-theme", theme);
}

function applyI18n() {
  const lang = settings.lang || "es";
  const dict = i18n[lang];

  nodes.appTitle.textContent = dict.appTitle;
  nodes.homeTitle.textContent = dict.homeTitle;
  nodes.homeSubtitle.textContent = dict.homeSubtitle;
  nodes.btnAdd.textContent = dict.btnAdd;
  nodes.btnList.textContent = dict.btnList;
  nodes.btnSettings.textContent = dict.btnSettings;

  nodes.addTitle.textContent = dict.addTitle;
  nodes.listTitle.textContent = dict.listTitle;
  nodes.settingsTitle.textContent = dict.settingsTitle;
  nodes.filtersTitle.textContent = dict.filtersTitle;

  nodes.lblTitle.textContent = dict.lblTitle;
  nodes.lblType.textContent = dict.lblType;
  nodes.lblStatus.textContent = dict.lblStatus;
  nodes.lblRating.textContent = dict.lblRating;
  nodes.lblReview.textContent = dict.lblReview;
  nodes.btnSubmit.textContent = dict.btnSubmit;

  nodes.lblTheme.textContent = dict.lblTheme;
  nodes.lblLang.textContent = dict.lblLang;
  nodes.settingsHint.textContent = dict.settingsHint;

  nodes.modalTitle.textContent = dict.confirm;

}

function showView(name) {
  Object.values(views).forEach((v) => v.classList.add("hidden"));
  views[name].classList.remove("hidden");

  nav.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clampRating(n) {
  let r = Number(n);
  if (Number.isNaN(r)) r = 0;
  r = Math.max(0, Math.min(10, r));
  return r;
}

function render(list) {
  counterEl.textContent = `Mostrando ${list.length} de ${items.length}`;
  cardsEl.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = items.length === 0 ? t("empty0") : t("emptyF");
    empty.style.color = "rgba(229,231,235,.7)";
    cardsEl.appendChild(empty);
    return;
  }

  list.forEach((it) => {
    const card = document.createElement("div");
    card.className = "item";
    card.dataset.id = it.id;

    const ratingBadge =
      it.rating !== null && it.rating !== undefined
        ? `<span class="badge">⭐ ${it.rating}/10</span>`
        : "";

    const reviewBlock =
      it.review && it.review.trim()
        ? `<div class="review">${escapeHtml(it.review)}</div>`
        : "";

    card.innerHTML = `
      <h3 class="item__title">${escapeHtml(it.title)}</h3>

      <div class="badges">
        <span class="badge">${escapeHtml(it.type)}</span>
        <span class="badge">${escapeHtml(it.status)}</span>
        ${ratingBadge}
      </div>

      ${reviewBlock}

      <div class="actions">
        <button class="btn btn--ghost" data-action="toggle">
          ${it.status === "Visto" ? t("toggleToPending") : t("toggleToSeen")}
        </button>
        <button class="btn btn--danger" data-action="delete">${t("delete")}</button>
      </div>
    `;

    cardsEl.appendChild(card);
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const type = filterType.value;
  const status = filterStatus.value;

  let filtered = items;

  if (q) filtered = filtered.filter((it) => it.title.toLowerCase().includes(q));
  if (type !== "ALL") filtered = filtered.filter((it) => it.type === type);
  if (status !== "ALL") filtered = filtered.filter((it) => it.status === status);

  render(filtered);
}


function openModal(id, title) {
  pendingDeleteId = id;
  modalText.textContent = `¿Seguro que quieres eliminar "${title}"?`;
  modal.classList.remove("hidden");
}
function closeModal() {
  pendingDeleteId = null;
  modal.classList.add("hidden");
}


menuBtn.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-go]");
  if (!btn) return;
  const view = btn.dataset.go;
  showView(view);
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-go]");
  if (!btn) return;
  const view = btn.dataset.go;
  showView(view);
});

searchInput.addEventListener("input", applyFilters);
filterType.addEventListener("change", applyFilters);
filterStatus.addEventListener("change", applyFilters);

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  filterType.value = "ALL";
  filterStatus.value = "ALL";
  applyFilters();
});

function syncSeenFields() {
  const isSeen = statusSelect.value === "Visto";
  seenFields.style.display = isSeen ? "grid" : "none";
}
statusSelect.addEventListener("change", syncSeenFields);

addForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    alert(settings.lang === "en" ? "Please enter a title 🙂" : "Pon un título 🙂");
    return;
  }

  const status = statusSelect.value;

  const newItem = {
    id: String(Date.now()),
    title,
    type: typeSelect.value,
    status,
    rating: status === "Visto" ? clampRating(ratingInput.value) : null,
    review: status === "Visto" ? (reviewInput.value.trim() || null) : null,
    createdAt: Date.now(),
  };

  items.push(newItem);
  saveItems(items);

  addForm.reset();
  ratingInput.value = 7;
  reviewInput.value = "";
  statusSelect.value = "Pendiente";
  syncSeenFields();

  showView("list");
  applyFilters();
});

cardsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.action;
  if (!action) return;

  const card = e.target.closest(".item");
  if (!card) return;
  const id = card.dataset.id;

  if (action === "toggle") {
    const current = items.find((it) => it.id === id);
    if (!current) return;

    if (current.status === "Pendiente") {
      const inputRating = prompt(t("promptRating", current.title), String(current.rating ?? 7));
      if (inputRating === null) return;

      const rating = clampRating(inputRating);

      const inputReview = prompt(t("promptReview", current.title), current.review ?? "");
      if (inputReview === null) return;

      const review = inputReview.trim() ? inputReview.trim() : null;

      items = items.map((it) =>
        it.id !== id ? it : { ...it, status: "Visto", rating, review }
      );

      saveItems(items);
      applyFilters();
      return;
    }

    items = items.map((it) =>
      it.id !== id ? it : { ...it, status: "Pendiente", rating: null, review: null }
    );

    saveItems(items);
    applyFilters();
    return;
  }

  if (action === "delete") {
    const item = items.find((it) => it.id === id);
    openModal(id, item ? item.title : "este elemento");
  }
});

cancelDelete.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

confirmDelete.addEventListener("click", () => {
  if (!pendingDeleteId) return;

  items = items.filter((it) => it.id !== pendingDeleteId);
  saveItems(items);
  applyFilters();
  closeModal();
});

themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
});
langSelect.addEventListener("change", () => {
  setLanguage(langSelect.value);
});


if (items.length === 0) {
  items = [
    {
      id: String(Date.now()),
      title: "Ej: The Witcher 3",
      type: "Juego",
      status: "Pendiente",
      rating: null,
      review: null,
      createdAt: Date.now(),
    },
  ];
  saveItems(items);
}

document.documentElement.setAttribute("data-theme", settings.theme || "blue");
themeSelect.value = settings.theme || "blue";
langSelect.value = settings.lang || "es";

applyI18n();
syncSeenFields();
showView("home");
applyFilters();

console.log("JS listo ✅");