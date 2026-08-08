/*
  TORRES DLS
  Estructura:
  Región/categoría → Equipo → Kits

  Para agregar una categoría:
  1. Añade un objeto en "categories".
  2. Usa ese mismo id en "teams.region".
  3. ¡Listo! La categoría aparecerá automáticamente.

  Para agregar un equipo:
  Añade un objeto en "teams".

  Para agregar un kit:
  Añade un objeto en "kits" usando el id del equipo.
*/

const categories = [
  { id: "Europa", name: "Europa", icon: "🌍" },
  { id: "América", name: "América", icon: "🌎" },
  { id: "Asia", name: "Asia", icon: "🌏" },
  { id: "Selecciones", name: "Selecciones", icon: "🏆" }
];

const teams = [
  { id: "barcelona", name: "Barcelona", country: "España", league: "LaLiga", region: "Europa", code: "BAR", description: "Club de fútbol español." },
  { id: "real-madrid", name: "Real Madrid", country: "España", league: "LaLiga", region: "Europa", code: "RMA", description: "Club de fútbol español." },
  { id: "liverpool", name: "Liverpool", country: "Inglaterra", league: "Premier League", region: "Europa", code: "LIV", description: "Club de fútbol inglés." },
  { id: "bayern", name: "Bayern München", country: "Alemania", league: "Bundesliga", region: "Europa", code: "FCB", description: "Club de fútbol alemán." },

  { id: "cruz-azul", name: "Cruz Azul", country: "México", league: "Liga MX", region: "América", code: "CAZ", description: "Club de fútbol mexicano." },

  { id: "mexico", name: "México", country: "México", league: "Selecciones", region: "Selecciones", code: "MEX", description: "Selección nacional." }
];

const kits = [
  { id:"barcelona-2015-2016", teamId:"barcelona", name:"Kit 2015-2016", season:"2015-2016", type:"Local", code:"BAR", url:"https://example.com/barcelona-2015-2016" },
  { id:"real-madrid-2015-2016", teamId:"real-madrid", name:"Kit 2015-2016", season:"2015-2016", type:"Local", code:"RMA", url:"https://example.com/real-madrid-2015-2016" },
  { id:"liverpool-2025-2026", teamId:"liverpool", name:"Kit 2025-2026", season:"2025-2026", type:"Local", code:"LIV", url:"https://example.com/liverpool-2025-2026" },
  { id:"bayern-2025-2026", teamId:"bayern", name:"Kit 2025-2026", season:"2025-2026", type:"Local", code:"FCB", url:"https://example.com/bayern-2025-2026" },

  { id:"cruz-azul-2026-local", teamId:"cruz-azul", name:"Kit Local 2026", season:"2026", type:"Local", code:"CAZ", url:"https://example.com/cruz-azul-2026-local" },
  { id:"cruz-azul-2026-visitante", teamId:"cruz-azul", name:"Kit Visitante 2026", season:"2026", type:"Visitante", code:"CAZ", url:"https://example.com/cruz-azul-2026-visitante" },
  { id:"cruz-azul-2026-portero", teamId:"cruz-azul", name:"Kit Portero 2026", season:"2026", type:"Portero", code:"CAZ", url:"https://example.com/cruz-azul-2026-portero" },

  { id:"mexico-2026", teamId:"mexico", name:"Kit 2026", season:"2026", type:"Local", code:"MEX", url:"https://example.com/mexico-2026" }
];

const grid = document.getElementById("teamView");
const kitView = document.getElementById("kitView");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const emptyState = document.getElementById("emptyState");
const sectionTitle = document.getElementById("sectionTitle");
const breadcrumb = document.getElementById("breadcrumb");
const filters = document.getElementById("filters");
const favCount = document.getElementById("favCount");
const dialog = document.getElementById("kitDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogLeague = document.getElementById("dialogLeague");
const dialogTitle = document.getElementById("dialogTitle");
const dialogMeta = document.getElementById("dialogMeta");
const dialogMessage = document.getElementById("dialogMessage");

let currentKit = null;
let currentFilter = "Todos";
let currentTeamId = null;

function getFavorites(){
  return JSON.parse(localStorage.getItem("torresDLSFavorites") || "[]");
}

function setFavorites(list){
  localStorage.setItem("torresDLSFavorites", JSON.stringify(list));
  favCount.textContent = list.length;
}

function isFavorite(id){
  return getFavorites().includes(id);
}

function getTeam(id){
  return teams.find(team => team.id === id);
}

function getCategory(id){
  return categories.find(category => category.id === id);
}

function slugToTeam(){
  const match = location.hash.match(/^#equipo\/(.+)$/);
  return match ? match[1] : null;
}

function buildFilters(){
  filters.innerHTML = `
    <button class="filter active" data-filter="Todos">Todos</button>
    ${categories.map(category => `
      <button class="filter" data-filter="${category.id}">
        ${category.icon} ${category.name}
      </button>
    `).join("")}
  `;

  filters.addEventListener("click", event => {
    const button = event.target.closest(".filter");
    if(!button) return;

    currentFilter = button.dataset.filter;
    currentTeamId = null;
    location.hash = "";
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    render();
  });
}

function render(){
  currentTeamId = slugToTeam();
  const q = searchInput.value.trim().toLowerCase();

  if(currentTeamId){
    renderTeamPage(currentTeamId);
    clearSearch.classList.toggle("hidden", !q);
    return;
  }

  renderTeamCatalog(q);
}

function renderTeamCatalog(q){
  grid.classList.remove("hidden");
  kitView.classList.add("hidden");

  const teamsInCategory = teams.filter(team =>
    currentFilter === "Todos" || team.region === currentFilter
  );

  const filteredTeams = teamsInCategory.filter(team => {
    const teamKits = kits.filter(kit => kit.teamId === team.id);
    const haystack = [
      team.name, team.country, team.league, team.region,
      ...teamKits.flatMap(kit => [kit.name, kit.season, kit.type])
    ].join(" ").toLowerCase();

    return !q || haystack.includes(q);
  });

  sectionTitle.textContent = q
    ? "Resultados"
    : currentFilter === "Todos"
      ? "Equipos"
      : currentFilter;

  breadcrumb.innerHTML = "Inicio";

  grid.innerHTML = filteredTeams.map(team => {
    const count = kits.filter(kit => kit.teamId === team.id).length;
    const category = getCategory(team.region);

    return `
      <article class="team-card">
        <div class="team-logo">${team.code}</div>
        <div class="team-body">
          <div class="kit-league">${category?.icon || "⚽"} ${team.league}</div>
          <h3 class="kit-title">${team.name}</h3>
          <p class="kit-meta">${team.country} · ${count} ${count === 1 ? "kit" : "kits"}</p>
          <button class="primary-btn full-btn" data-action="open-team" data-team="${team.id}">
            Ver equipo →
          </button>
        </div>
      </article>
    `;
  }).join("");

  emptyState.classList.toggle("hidden", filteredTeams.length !== 0);
  clearSearch.classList.toggle("hidden", !q);

  if(q && filteredTeams.length === 0){
    const directKits = kits.filter(kit => {
      const team = getTeam(kit.teamId);
      return [kit.name, kit.season, kit.type, team?.name, team?.country, team?.league]
        .join(" ").toLowerCase().includes(q);
    });

    if(directKits.length){
      sectionTitle.textContent = "Kits encontrados";
      grid.innerHTML = directKits.map(renderKitCard).join("");
      emptyState.classList.add("hidden");
    }
  }
}

function renderTeamPage(teamId){
  const team = getTeam(teamId);
  if(!team){
    location.hash = "";
    return;
  }

  grid.classList.add("hidden");
  kitView.classList.remove("hidden");

  const category = getCategory(team.region);
  const teamKits = kits.filter(kit => kit.teamId === team.id);

  sectionTitle.textContent = team.name;
  breadcrumb.innerHTML = `
    <button class="breadcrumb-link" data-action="back-category">
      ${category?.icon || "←"} ${category?.name || "Catálogo"}
    </button>
    <span>›</span>
    <strong>${team.name}</strong>
  `;

  kitView.innerHTML = `
    <div class="team-header">
      <div class="team-header-logo">${team.code}</div>
      <div>
        <p class="eyebrow">${category?.name || "Equipo"} · ${team.league}</p>
        <h3>${team.name}</h3>
        <p>${team.description} ${team.country}.</p>
      </div>
    </div>

    <div class="subsection-head">
      <div>
        <p class="eyebrow">CATÁLOGO DEL EQUIPO</p>
        <h3>Kits de ${team.name}</h3>
      </div>
      <span class="kit-count">${teamKits.length} ${teamKits.length === 1 ? "kit" : "kits"}</span>
    </div>

    <div class="kit-grid">
      ${teamKits.length ? teamKits.map(renderKitCard).join("") : `
        <div class="empty team-empty">Todavía no hay kits publicados para este equipo.</div>
      `}
    </div>
  `;

  emptyState.classList.add("hidden");
}

function renderKitCard(kit){
  const team = getTeam(kit.teamId);

  return `
    <article class="kit-card">
      <div class="kit-image">${kit.code}</div>
      <div class="kit-body">
        <div class="kit-league">${team?.league || "DLS"} · ${kit.type}</div>
        <h3 class="kit-title">${kit.name}</h3>
        <p class="kit-meta">${kit.season} · ${team?.country || ""}</p>
        <div class="card-actions">
          <button class="primary-btn" data-action="open-kit" data-kit="${kit.id}">Ver kit</button>
          <button class="secondary-btn" data-action="favorite" data-kit="${kit.id}" aria-label="Favorito">
            ${isFavorite(kit.id) ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </article>
  `;
}

function openTeam(id){
  location.hash = `equipo/${id}`;
  window.scrollTo({top: 0, behavior: "smooth"});
}

function openKit(id){
  currentKit = kits.find(k => k.id === id);
  if(!currentKit) return;

  const team = getTeam(currentKit.teamId);
  dialogImage.textContent = currentKit.code;
  dialogLeague.textContent = `${team?.name || "Equipo"} · ${currentKit.type}`;
  dialogTitle.textContent = `${currentKit.name}`;
  dialogMeta.textContent = `${currentKit.season} · ${team?.country || ""} · ${team?.league || ""}`;
  dialogMessage.textContent = "";
  document.getElementById("favBtn").textContent =
    isFavorite(id) ? "♥ Quitar favorito" : "♥ Favorito";

  dialog.showModal();
}

function toggleFavorite(id){
  const list = getFavorites();
  const next = list.includes(id)
    ? list.filter(x => x !== id)
    : [...list, id];

  setFavorites(next);
  render();

  if(currentKit?.id === id){
    document.getElementById("favBtn").textContent =
      isFavorite(id) ? "♥ Quitar favorito" : "♥ Favorito";
  }
}

function showFavorites(){
  const favoriteKits = kits.filter(kit => isFavorite(kit.id));

  currentTeamId = null;
  location.hash = "";
  currentFilter = "Todos";

  document.querySelectorAll(".filter").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === "Todos");
  });

  grid.classList.remove("hidden");
  kitView.classList.add("hidden");
  sectionTitle.textContent = "Mis favoritos";
  breadcrumb.innerHTML = "Favoritos";

  grid.innerHTML = favoriteKits.length
    ? favoriteKits.map(renderKitCard).join("")
    : `<p class="empty">Todavía no tienes kits favoritos.</p>`;

  emptyState.classList.add("hidden");
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if(!button) return;

  const action = button.dataset.action;

  if(action === "open-team") openTeam(button.dataset.team);
  if(action === "open-kit") openKit(button.dataset.kit);
  if(action === "favorite") toggleFavorite(button.dataset.kit);

  if(action === "back-category"){
    location.hash = "";
    const team = getTeam(currentTeamId);
    currentFilter = team?.region || "Todos";
    document.querySelectorAll(".filter").forEach(b => {
      b.classList.toggle("active", b.dataset.filter === currentFilter);
    });
    render();
  }
});

searchInput.addEventListener("input", render);

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  render();
});

document.getElementById("favoritesBtn").addEventListener("click", showFavorites);

document.getElementById("themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  localStorage.setItem("torresDLSTheme", dark ? "light" : "dark");
});

document.getElementById("closeDialog").addEventListener("click", () => dialog.close());

document.getElementById("copyBtn").addEventListener("click", async () => {
  if(!currentKit) return;

  try{
    await navigator.clipboard.writeText(currentKit.url);
    dialogMessage.textContent = "✓ URL copiada";
  }catch{
    dialogMessage.textContent = "No se pudo copiar automáticamente.";
  }
});

document.getElementById("shareBtn").addEventListener("click", async () => {
  if(!currentKit) return;

  const team = getTeam(currentKit.teamId);
  const data = {
    title: `${team?.name || "Kit"} ${currentKit.season}`,
    text: "Kit de Torres DLS",
    url: currentKit.url
  };

  try{
    if(navigator.share){
      await navigator.share(data);
    }else{
      await navigator.clipboard.writeText(currentKit.url);
      dialogMessage.textContent = "✓ URL copiada para compartir";
    }
  }catch{}
});

document.getElementById("favBtn").addEventListener("click", () => {
  if(currentKit) toggleFavorite(currentKit.id);
});

document.querySelector(".brand").addEventListener("click", event => {
  event.preventDefault();
  location.hash = "";
  currentFilter = "Todos";
  searchInput.value = "";
  document.querySelectorAll(".filter").forEach(b => {
    b.classList.toggle("active", b.dataset.filter === "Todos");
  });
  render();
});

window.addEventListener("hashchange", render);

document.getElementById("year").textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem("torresDLSTheme");
if(savedTheme) document.documentElement.dataset.theme = savedTheme;

buildFilters();
setFavorites(getFavorites());
render();
