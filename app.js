const DATA_URL = "data/catalog.json";

const elements = {
  total: document.getElementById("total-count"),
  active: document.getElementById("active-count"),
  categories: document.getElementById("category-count"),
  search: document.getElementById("search-input"),
  category: document.getElementById("category-filter"),
  status: document.getElementById("status-filter"),
  cards: document.getElementById("cards"),
  empty: document.getElementById("empty-state"),
  template: document.getElementById("card-template"),
};

const state = {
  entries: [],
  filtered: [],
};

const statusLabels = {
  active: "Активный",
  paused: "Приостановлен",
  planned: "Запланирован",
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const renderStats = () => {
  const total = state.entries.length;
  const active = state.entries.filter((entry) => entry.status === "active").length;
  const categories = new Set(state.entries.map((entry) => entry.category)).size;

  elements.total.textContent = total.toString();
  elements.active.textContent = active.toString();
  elements.categories.textContent = categories.toString();
};

const populateCategories = () => {
  const categories = Array.from(new Set(state.entries.map((entry) => entry.category)));
  categories.sort();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.category.appendChild(option);
  });
};

const buildCard = (entry) => {
  const clone = elements.template.content.cloneNode(true);
  const card = clone.querySelector(".card");
  const category = clone.querySelector(".card-category");
  const title = clone.querySelector(".card-title");
  const badge = clone.querySelector(".badge");
  const summary = clone.querySelector(".card-summary");
  const owner = clone.querySelector(".card-owner");
  const updated = clone.querySelector(".card-updated");
  const tags = clone.querySelector(".card-tags");

  category.textContent = entry.category;
  title.textContent = entry.name;
  badge.textContent = statusLabels[entry.status] ?? entry.status;
  badge.dataset.status = entry.status;
  summary.textContent = entry.summary;
  owner.textContent = entry.owner;
  updated.textContent = formatDate(entry.lastUpdate);

  tags.innerHTML = "";
  entry.tags.forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = tag;
    tags.appendChild(item);
  });

  card.setAttribute("data-status", entry.status);
  return clone;
};

const renderCards = () => {
  elements.cards.innerHTML = "";
  state.filtered.forEach((entry) => {
    elements.cards.appendChild(buildCard(entry));
  });

  const hasResults = state.filtered.length > 0;
  elements.empty.hidden = hasResults;
};

const applyFilters = () => {
  const query = elements.search.value.toLowerCase().trim();
  const category = elements.category.value;
  const status = elements.status.value;

  state.filtered = state.entries.filter((entry) => {
    const matchesQuery =
      entry.name.toLowerCase().includes(query) ||
      entry.owner.toLowerCase().includes(query);
    const matchesCategory = category === "all" || entry.category === category;
    const matchesStatus = status === "all" || entry.status === status;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  renderCards();
};

const attachListeners = () => {
  [elements.search, elements.category, elements.status].forEach((input) => {
    input.addEventListener("input", applyFilters);
    input.addEventListener("change", applyFilters);
  });
};

const loadData = async () => {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error("Не удалось загрузить данные");
    }
    const payload = await response.json();
    state.entries = payload.entries;
    state.filtered = payload.entries;
    renderStats();
    populateCategories();
    renderCards();
  } catch (error) {
    elements.cards.innerHTML = "";
    elements.empty.hidden = false;
    elements.empty.querySelector("h2").textContent = "Ошибка загрузки";
    elements.empty.querySelector("p").textContent =
      "Проверьте доступность файла данных и попробуйте снова.";
    console.error(error);
  }
};

attachListeners();
loadData();
