const STORAGE_KEY = "myList";

function loadItems() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let items = loadItems();

const cardsEl = document.getElementById("cards");
const counterEl = document.getElementById("counter");

const addForm = document.getElementById("addForm");
const titleInput = document.getElementById("titleInput");
const typeSelect = document.getElementById("typeSelect");
const statusSelect = document.getElementById("statusSelect");
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

function render(list) {
  counterEl.textContent = `Mostrando ${list.length} de ${items.length}`;
  cardsEl.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.textContent =
      items.length === 0
        ? "No hay elementos aún. Añade el primero 👇"
        : "No hay resultados con esos filtros 😅";
    empty.style.color = "rgba(229,231,235,.7)";
    cardsEl.appendChild(empty);
    return;
  }

  list.forEach((it) => {
    const card = document.createElement("div");
    card.className = "item";
    card.dataset.id = it.id;

    card.innerHTML = `
      <h3 class="item__title">${it.title}</h3>

      <div class="badges">
        <span class="badge">${it.type}</span>
        <span class="badge">${it.status}</span>
        ${it.rating !== null ? `<span class="badge">⭐ ${it.rating}/10</span>` : ""}
      </div>

      <div class="actions">
        <button class="btn btn--ghost" data-action="toggle">
          ${it.status === "Visto" ? "Marcar Pendiente" : "Marcar Visto"}
        </button>
        <button class="btn btn--danger" data-action="delete">Eliminar</button>
      </div>
    `;

    cardsEl.appendChild(card);
  });
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const type = filterType.value;
  const status = filterStatus.value;

  let filtered = items;

  if (q) {
    filtered = filtered.filter((it) =>
      it.title.toLowerCase().includes(q)
    );
  }

  if (type !== "ALL") {
    filtered = filtered.filter((it) => it.type === type);
  }

  if (status !== "ALL") {
    filtered = filtered.filter((it) => it.status === status);
  }

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

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  console.log("CLICK MENU ✅");
  nav.classList.toggle("open");
  console.log("nav classes:", nav.className);
});
console.log("menuBtn:", menuBtn);
console.log("nav:", nav);
searchInput.addEventListener("input", applyFilters);
filterType.addEventListener("change", applyFilters);
filterStatus.addEventListener("change", applyFilters);

clearFilters.addEventListener("click", () => {
  searchInput.value = "";
  filterType.value = "ALL";
  filterStatus.value = "ALL";
  applyFilters();
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    alert("Pon un título 🙂");
    return;
  }

  const status = statusSelect.value;

const newItem = {
  id: String(Date.now()),
  title,
  type: typeSelect.value,
  status,
  rating: status === "Visto" ? (Number(ratingInput.value) || 0) : null,
  review: status === "Visto" && reviewInput.value.trim() ? reviewInput.value.trim() : null,

  createdAt: Date.now(),
};

  items.push(newItem);
  saveItems(items);
  applyFilters();

  addForm.reset();
  ratingInput.value = 0;
  reviewInput.value = "";

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
    const inputRating = prompt(`Puntúa "${current.title}" (0-10):`, "7");
    if (inputRating === null) return;

    let rating = Number(inputRating);
    if (Number.isNaN(rating)) rating = 0;
    rating = Math.max(0, Math.min(10, rating));

    const inputReview = prompt(`¿Qué te ha parecido "${current.title}"? (opcional)`, current.review ?? "");
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

if (items.length === 0) {
  items = [
    {
      id: String(Date.now()),
      title: "Ej: The Witcher 3",
      type: "Juego",
      status: "Pendiente",
      rating: null,
      createdAt: Date.now(),
    },
  ];
  saveItems(items);
}

applyFilters();
console.log("JS listo ✅");