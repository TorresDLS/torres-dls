const kits = [
  {id:"barcelona-2015-2016", team:"Barcelona", season:"2015-2016", country:"España", league:"LaLiga", region:"Europa", code:"BAR", url:"https://example.com/barcelona-2015-2016"},
  {id:"real-madrid-2015-2016", team:"Real Madrid", season:"2015-2016", country:"España", league:"LaLiga", region:"Europa", code:"RMA", url:"https://example.com/real-madrid-2015-2016"},
  {id:"cruz-azul-2026", team:"Cruz Azul", season:"2026", country:"México", league:"Liga MX", region:"América", code:"CAZ", url:"https://example.com/cruz-azul-2026"},
  {id:"mexico-2026", team:"México", season:"2026", country:"México", league:"Selecciones", region:"Selecciones", code:"MEX", url:"https://example.com/mexico-2026"},
  {id:"liverpool-2025-2026", team:"Liverpool", season:"2025-2026", country:"Inglaterra", league:"Premier League", region:"Europa", code:"LIV", url:"https://example.com/liverpool-2025-2026"},
  {id:"bayern-2025-2026", team:"Bayern München", season:"2025-2026", country:"Alemania", league:"Bundesliga", region:"Europa", code:"FCB", url:"https://example.com/bayern-2025-2026"}
];

const grid = document.getElementById("kitGrid");
const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const emptyState = document.getElementById("emptyState");
const sectionTitle = document.getElementById("sectionTitle");
const favCount = document.getElementById("favCount");
const dialog = document.getElementById("kitDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogLeague = document.getElementById("dialogLeague");
const dialogTitle = document.getElementById("dialogTitle");
const dialogMeta = document.getElementById("dialogMeta");
const dialogMessage = document.getElementById("dialogMessage");
let currentKit = null;
let currentFilter = "Todos";

function getFavorites(){
  return JSON.parse(localStorage.getItem("torresDLSFavorites") || "[]");
}
function setFavorites(list){
  localStorage.setItem("torresDLSFavorites", JSON.stringify(list));
  favCount.textContent = list.length;
}
function isFavorite(id){ return getFavorites().includes(id); }

function render(){
  const q = searchInput.value.trim().toLowerCase();
  const favoritesOnly = document.body.dataset.favorites === "true";
  const filtered = kits.filter(k=>{
    const matchesFilter = currentFilter === "Todos" || k.region === currentFilter;
    const haystack = `${k.team} ${k.season} ${k.country} ${k.league}`.toLowerCase();
    const matchesSearch = !q || haystack.includes(q);
    const matchesFav = !favoritesOnly || isFavorite(k.id);
    return matchesFilter && matchesSearch && matchesFav;
  });

  grid.innerHTML = filtered.map(k=>`
    <article class="kit-card">
      <div class="kit-image">${k.code}</div>
      <div class="kit-body">
        <div class="kit-league">${k.league}</div>
        <h3 class="kit-title">${k.team}</h3>
        <p class="kit-meta">${k.season} · ${k.country}</p>
        <div class="card-actions">
          <button class="primary-btn" onclick="openKit('${k.id}')">Ver kit</button>
          <button class="secondary-btn" onclick="toggleFavorite('${k.id}')" aria-label="Favorito">${isFavorite(k.id) ? "♥" : "♡"}</button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
  clearSearch.classList.toggle("hidden", !q && !favoritesOnly);
  sectionTitle.textContent = favoritesOnly ? "Mis favoritos" : q ? "Resultados" : currentFilter === "Todos" ? "Últimos kits" : currentFilter;
}

function openKit(id){
  currentKit = kits.find(k=>k.id===id);
  if(!currentKit) return;
  dialogImage.textContent = currentKit.code;
  dialogLeague.textContent = currentKit.league;
  dialogTitle.textContent = `${currentKit.team} · ${currentKit.season}`;
  dialogMeta.textContent = `${currentKit.country} · ${currentKit.league}`;
  dialogMessage.textContent = "";
  document.getElementById("favBtn").textContent = isFavorite(id) ? "♥ Quitar favorito" : "♥ Favorito";
  dialog.showModal();
}

function toggleFavorite(id){
  const list = getFavorites();
  const next = list.includes(id) ? list.filter(x=>x!==id) : [...list,id];
  setFavorites(next);
  render();
  if(currentKit?.id===id) document.getElementById("favBtn").textContent = isFavorite(id) ? "♥ Quitar favorito" : "♥ Favorito";
}

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    document.body.dataset.favorites = "false";
    render();
  });
});

searchInput.addEventListener("input", render);

clearSearch.addEventListener("click",()=>{
  searchInput.value = "";
  document.body.dataset.favorites = "false";
  render();
});

document.getElementById("favoritesBtn").addEventListener("click",()=>{
  document.body.dataset.favorites = document.body.dataset.favorites === "true" ? "false" : "true";
  render();
});

document.getElementById("themeBtn").addEventListener("click",()=>{
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  localStorage.setItem("torresDLSTheme", dark ? "light" : "dark");
});

document.getElementById("closeDialog").addEventListener("click",()=>dialog.close());

document.getElementById("copyBtn").addEventListener("click", async()=>{
  if(!currentKit) return;
  try{
    await navigator.clipboard.writeText(currentKit.url);
    dialogMessage.textContent = "✓ URL copiada";
  }catch{
    dialogMessage.textContent = "No se pudo copiar automáticamente.";
  }
});

document.getElementById("shareBtn").addEventListener("click", async()=>{
  if(!currentKit) return;
  const data = {title:`${currentKit.team} ${currentKit.season}`, text:"Kit de Torres DLS", url:currentKit.url};
  try{
    if(navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(currentKit.url); dialogMessage.textContent = "✓ URL copiada para compartir"; }
  }catch{}
});

document.getElementById("favBtn").addEventListener("click",()=>{ if(currentKit) toggleFavorite(currentKit.id); });

document.getElementById("year").textContent = new Date().getFullYear();
const savedTheme = localStorage.getItem("torresDLSTheme");
if(savedTheme) document.documentElement.dataset.theme = savedTheme;
setFavorites(getFavorites());
render();

window.openKit = openKit;
window.toggleFavorite = toggleFavorite;
