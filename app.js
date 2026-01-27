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
        <span class="badge">⭐ ${it.rating}/10</span>
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
menuBtn.addEventListener("click", () => nav.classList.toggle("open"));

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

  const newItem = {
    id: String(Date.now()),
    title,
    type: typeSelect.value,
    status: statusSelect.value,
    rating: Number(ratingInput.value) || 0,
    createdAt: Date.now(),
  };

  items.push(newItem);
  saveItems(items);
  applyFilters();

  addForm.reset();
  ratingInput.value = 0;
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
    items = items.map((it) => {
      if (it.id !== id) return it;
      return { ...it, status: it.status === "Visto" ? "Pendiente" : "Visto" };
    });

    saveItems(items);
    applyFilters();
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
      rating: 10,
      createdAt: Date.now(),
    },
  ];
  saveItems(items);
}

applyFilters();
console.log("JS listo ✅");