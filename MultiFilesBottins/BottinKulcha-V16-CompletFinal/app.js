// ===== CONFIGURATION STANDARD =====
const CONFIG = {
  appName: "Bottin Annuaire Web Libre 2025",
  version: "6.2",
  defaultTheme: "theme-dark",
  storageKey: "bottinData_v6"
};

// ===== ÉTAT GLOBAL =====
let state = {
  sites: [],
  activeCategories: [],
  activeThemes: [],
  searchTerm: "",
  currentTheme: CONFIG.defaultTheme,
  currentSort: "name-asc"
};

// ===== DONNÉES PAR DÉFAUT =====
const DEFAULT_ENTRIES = [
  {
    n: "Constitutions Kulchatila",
    c: "Constitution",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space",
    date: "2025",
    id: 1
  },
  {
    n: "Constitutions LMBMicro", 
    c: "Constitution",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space",
    date: "2025",
    id: 2
  }
];

// ===== INITIALISATION =====
function initializeApp() {
  console.log(`🚀 ${CONFIG.appName} v${CONFIG.version}`);
  
  loadData();
  setupTheme();
  setupEventListeners();
  applyFilters();
  updateStatistics();
  
  console.log("✅ Application initialisée");
}

// ===== CHARGEMENT DES DONNÉES =====
function loadData() {
  // 1. Vérifier localStorage
  const savedData = localStorage.getItem(CONFIG.storageKey);
  
  if (savedData) {
    try {
      state.sites = JSON.parse(savedData);
      console.log(`📂 ${state.sites.length} entrées depuis localStorage`);
    } catch (e) {
      console.error("Erreur localStorage:", e);
      loadExternalOrDefault();
    }
  } else {
    loadExternalOrDefault();
  }
}

function loadExternalOrDefault() {
  // 2. Vérifier datas.js
  if (typeof window.sites !== 'undefined' && Array.isArray(window.sites)) {
    console.log("✅ datas.js détecté");
    state.sites = [...window.sites];
  } 
  // 3. Sinon données par défaut
  else {
    console.log("⚠️ Utilisation des données par défaut");
    state.sites = [...DEFAULT_ENTRIES];
  }
  
  saveToLocalStorage();
}

function saveToLocalStorage() {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.sites));
}

// ===== GESTION DU THÈME =====
function setupTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || CONFIG.defaultTheme;
  state.currentTheme = savedTheme;
  
  // Appliquer le thème
  document.body.className = savedTheme;
  
  // Mettre à jour le sélecteur
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
  
  console.log(`🎨 Thème: ${savedTheme}`);
}

function changeTheme(themeName) {
  state.currentTheme = themeName;
  document.body.className = themeName;
  localStorage.setItem('selectedTheme', themeName);
  
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = themeName;
  }
  
  // Forcer un re-render pour appliquer toutes les variables CSS
  document.body.style.animation = 'none';
  setTimeout(() => {
    document.body.style.animation = '';
  }, 10);
  
  showMessage(`Thème: ${themeName.replace('theme-', '').replace('-', ' ')}`, "info");
}

function resetTheme() {
  changeTheme(CONFIG.defaultTheme);
  showMessage("Thème réinitialisé", "info");
}

// ===== TRI =====
function sortEntries(list) {
  const sorted = [...list];
  
  switch(state.currentSort) {
    case 'name-asc':
      return sorted.sort((a, b) => a.n.localeCompare(b.n));
    case 'name-desc':
      return sorted.sort((a, b) => b.n.localeCompare(a.n));
    case 'category-asc':
      return sorted.sort((a, b) => a.c.localeCompare(b.c) || a.n.localeCompare(b.n));
    case 'date-desc':
      return sorted.sort((a, b) => (b.date || '2025').localeCompare(a.date || '2025'));
    case 'date-asc':
      return sorted.sort((a, b) => (a.date || '2025').localeCompare(b.date || '2025'));
    default:
      return sorted;
  }
}

// ===== AFFICHAGE DES ENTREES =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  const total = list.length;
  
  // Mettre à jour le compteur
  document.getElementById('filteredCount').textContent = `${total} entrée${total !== 1 ? 's' : ''}`;
  
  if (total === 0) {
    container.innerHTML = `
      <div class="message info" style="grid-column: 1 / -1;">
        <p style="margin-bottom: 20px; font-size: 1.2rem;">
          Aucune organisation ne correspond aux filtres/recherche.
        </p>
        <button onclick="clearFilters()" class="btn">
          🔄 Réinitialiser les filtres
        </button>
      </div>`;
    return;
  }
  
  // Trier
  const sortedList = sortEntries(list);
  
  // Générer le HTML
  container.innerHTML = sortedList.map((site, index) => {
    const isDefault = DEFAULT_ENTRIES.some(de => de.n === site.n && de.u === site.u);
    
    return `
      <div class="entry-card" style="animation-delay: ${index * 0.05}s;">
        <div class="entry-header">
          <div class="entry-title">${escapeHTML(site.n)}</div>
          <div class="entry-category">${escapeHTML(site.c)}</div>
        </div>
        <div class="entry-description">${escapeHTML(site.d || "Pas de description disponible")}</div>
        <a href="${site.u}" target="_blank" rel="noopener noreferrer" class="entry-url">
          🔗 ${truncateURL(site.u, 45)}
        </a>
        <div class="entry-meta">
          <span>${getThemeForCategory(site.c)}</span>
          <span>${site.date || "2025"}</span>
        </div>
        ${isDefault ? '<div class="entry-star">⭐</div>' : ''}
      </div>
    `;
  }).join('');
}

// ===== TOP 10 THÉMATIQUES =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  
  // Compter les catégories
  const counts = {};
  list.forEach(site => {
    if (site.c && site.c.trim()) {
      counts[site.c] = (counts[site.c] || 0) + 1;
    }
  });
  
  // Top 10
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (top.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique disponible</div>`;
    return;
  }
  
  container.innerHTML = top.map(([category, count], index) => {
    const theme = getThemeForCategory(category);
    return `
      <div class="theme-card ${state.activeThemes.includes(theme) ? 'active' : ''}" 
           onclick="toggleThemeFilter('${escapeHTML(theme)}')">
        <div class="theme-header">
          <div class="theme-rank">${index + 1}</div>
          <h3>${escapeHTML(category)}</h3>
        </div>
        <p class="theme-count">${count} organisation${count !== 1 ? 's' : ''}</p>
        <p class="theme-desc">Thème: ${theme}</p>
        <button class="btn btn-secondary" onclick="event.stopPropagation();toggleCategory('${escapeHTML(category)}')">
          🔍 Filtrer
        </button>
      </div>
    `;
  }).join('');
}

// ===== CATÉGORIES =====
function displayCategories(list) {
  const container = document.getElementById('categoriesContainer');
  
  const counts = {};
  list.forEach(site => {
    if (site.c && site.c.trim()) {
      counts[site.c] = (counts[site.c] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  
  if (sorted.length === 0) {
    container.innerHTML = `<div class="message">Aucune catégorie disponible</div>`;
    return;
  }
  
  container.innerHTML = sorted.map(([category, count]) => `
    <button class="category-item ${state.activeCategories.includes(category) ? 'active' : ''}" 
            onclick="toggleCategory('${escapeHTML(category)}')">
      ${escapeHTML(category)} <span class="cat-count">(${count})</span>
    </button>
  `).join('');
}

// ===== FILTRES =====
function applyFilters() {
  let filtered = [...state.sites];
  
  // 1. Recherche
  if (state.searchTerm) {
    const search = state.searchTerm.toLowerCase();
    filtered = filtered.filter(site =>
      (site.n && site.n.toLowerCase().includes(search)) ||
      (site.d && site.d.toLowerCase().includes(search)) ||
      (site.c && site.c.toLowerCase().includes(search)) ||
      (site.u && site.u.toLowerCase().includes(search))
    );
  }
  
  // 2. Catégories
  if (state.activeCategories.length > 0) {
    filtered = filtered.filter(site => 
      state.activeCategories.includes(site.c)
    );
  }
  
  displayEntries(filtered);
  displayTopThemes(filtered);
  displayCategories(filtered);
  updateStatistics();
  
  console.log(`🔍 ${filtered.length} résultats`);
}

function toggleCategory(category) {
  if (state.activeCategories.includes(category)) {
    state.activeCategories = state.activeCategories.filter(c => c !== category);
  } else {
    state.activeCategories.push(category);
  }
  applyFilters();
}

function toggleThemeFilter(theme) {
  if (state.activeThemes.includes(theme)) {
    state.activeThemes = state.activeThemes.filter(t => t !== theme);
  } else {
    state.activeThemes.push(theme);
  }
  applyFilters();
}

function clearFilters() {
  state.activeCategories = [];
  state.activeThemes = [];
  state.searchTerm = "";
  state.currentSort = "name-asc";
  
  document.getElementById('searchInput').value = "";
  document.getElementById('sortSelect').value = "name-asc";
  document.getElementById('datasFormatSelect').value = "compact";
  
  applyFilters();
  showMessage("Filtres réinitialisés", "info");
}

// ===== STATISTIQUES =====
function updateStatistics() {
  const total = state.sites.length;
  const categories = new Set(state.sites.map(s => s.c).filter(Boolean)).size;
  const themes = new Set(state.sites.map(s => getThemeForCategory(s.c)).filter(Boolean)).size;
  
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statCategories').textContent = categories;
  document.getElementById('statThemes').textContent = themes;
}

// ===== IMPORT/EXPORT =====
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!Array.isArray(data)) {
        showMessage("Le fichier doit contenir un tableau JSON", "error");
        return;
      }
      
      let added = 0;
      
      data.forEach(item => {
        if (item && item.n && item.u) {
          const entry = {
            n: item.n.toString().trim(),
            c: (item.c || "Non catégorisé").toString().trim(),
            d: (item.d || "").toString().trim(),
            u: item.u.toString().trim(),
            date: item.date || "2025",
            id: Date.now() + Math.random()
          };
          
          const exists = state.sites.some(s => s.n === entry.n && s.u === entry.u);
          
          if (!exists) {
            state.sites.push(entry);
            added++;
          }
        }
      });
      
      if (added > 0) {
        saveToLocalStorage();
        applyFilters();
        showMessage(`${added} entrée(s) importée(s)`, "success");
      } else {
        showMessage("Aucune nouvelle entrée", "info");
      }
      
    } catch (error) {
      showMessage("Erreur d'import: " + error.message, "error");
    }
  };
  
  reader.readAsText(file);
  event.target.value = "";
}

function exportJSON() {
  const data = state.sites.map(s => ({
    n: s.n,
    u: s.u,
    c: s.c,
    d: s.d || "",
    date: s.date || "2025"
  }));
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `bottin-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showMessage("Export JSON terminé", "success");
}

function exportDatasJS() {
  const format = document.getElementById('datasFormatSelect').value;
  
  let content = '// datas.js - Bottin Annuaire Web Libre 2025\n';
  content += '// Généré automatiquement\n\n';
  content += 'window.sites = ';
  
  const data = state.sites.map(s => ({
    n: s.n,
    u: s.u,
    c: s.c,
    d: s.d || "",
    date: s.date || "2025"
  }));
  
  if (format === 'compact') {
    content += JSON.stringify(data);
  } else {
    content += JSON.stringify(data, null, 2);
  }
  
  content += ';\n';
  
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'datas.js';
  link.click();
  
  showMessage("Export datas.js terminé", "success");
}

function exportTopThemes() {
  const counts = {};
  state.sites.forEach(s => {
    if (s.c) counts[s.c] = (counts[s.c] || 0) + 1;
  });
  
  const themes = Object.entries(counts)
    .map(([theme, count]) => ({ theme, count, description: `${count} organisation(s)` }))
    .sort((a, b) => b.count - a.count);
  
  const content = `// toptheme.js - Thématiques principales\nwindow.TOP_THEMES = ${JSON.stringify(themes, null, 2)};`;
  
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'toptheme.js';
  link.click();
  
  showMessage("Export toptheme.js terminé", "success");
}

// ===== UTILITAIRES =====
function getThemeForCategory(category) {
  const themeMap = {
    "Constitution": ["Constitution", "Gouvernance", "Droit"],
    "Technologie": ["Technologie", "Informatique", "Développement"],
    "Gouvernance": ["Gouvernance", "Politique", "Administration"],
    "Éducation": ["Éducation", "Formation", "Université"],
    "Culture": ["Culture", "Arts", "Musique"],
    "Écologie": ["Écologie", "Environnement", "Climat"],
    "Santé": ["Santé", "Médecine", "Bien-être"],
    "Économie": ["Économie", "Finance", "Business"],
    "Social": ["Social", "Communauté", "Association"],
    "Science": ["Science", "Recherche", "Innovation"]
  };
  
  for (const [theme, categories] of Object.entries(themeMap)) {
    if (categories.includes(category)) {
      return theme;
    }
  }
  
  return "Autre";
}

function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncateURL(url, max = 45) {
  if (!url) return '';
  if (url.length <= max) return url;
  return url.substring(0, max) + '...';
}

function showMessage(text, type = "info") {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    animation: fadeInOut 3s ease-in-out;
  `;
  
  message.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
}

// ===== ÉVÉNEMENTS =====
function setupEventListeners() {
  // Recherche
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchTerm = e.target.value.toLowerCase().trim();
      applyFilters();
    }, 300);
  });
  
  // Thème
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    changeTheme(e.target.value);
  });
  
  // Tri
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    applyFilters();
  });
  
  // Format d'export
  document.getElementById('datasFormatSelect').addEventListener('change', (e) => {
    // Pas de changement d'état nécessaire
  });
  
  // Import
  document.getElementById('btnImportJSON').addEventListener('click', () => {
    document.getElementById('jsonFileInput').click();
  });
  document.getElementById('jsonFileInput').addEventListener('change', importJSON);
  
  // Export
  document.getElementById('btnExportJSON').addEventListener('click', exportJSON);
  document.getElementById('btnExportDatasJS').addEventListener('click', exportDatasJS);
  document.getElementById('btnExportTopThemes').addEventListener('click', exportTopThemes);
  
  // Boutons
  document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
  document.getElementById('btnResetTheme').addEventListener('click', resetTheme);
}

// ===== DÉMARRAGE =====
document.addEventListener('DOMContentLoaded', initializeApp);

// ===== GLOBAL =====
window.toggleCategory = toggleCategory;
window.toggleThemeFilter = toggleThemeFilter;
window.clearFilters = clearFilters;
window.changeTheme = changeTheme;