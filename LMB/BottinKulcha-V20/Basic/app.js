// ===== CONFIGURATION STANDARD =====
const CONFIG = {
  appName: "Bottin Annuaire Web Libre 2025",
  version: "7.0",
  defaultTheme: "theme-original",
  storageKey: "bottinData_v7"
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

// ===== GESTION DES MESSAGES SIMPLIFIÉE =====
function showMessage(text, type = "info") {
  const messageId = 'msg-' + Date.now();
  const containerId = 'messageContainer';
  
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = `
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      max-height: calc(100vh - 30px);
      overflow-y: hidden;
      pointer-events: none;
      padding: 10px;
      box-sizing: border-box;
    `;
    document.body.appendChild(container);
  }
  
  const messageElement = document.createElement('div');
  messageElement.id = messageId;
  messageElement.className = `message ${type}`;
  messageElement.style.cssText = `
    transform: translateX(100%);
    opacity: 0;
    pointer-events: auto;
    max-width: 320px;
    width: 100%;
    margin: 0;
    transition: all 0.3s ease;
    background-color: var(--card-background);
    color: var(--text-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 15px;
  `;
  messageElement.innerHTML = `<p>${escapeHTML(text)}</p>`;
  
  container.appendChild(messageElement);
  
  // Animation d'entrée
  setTimeout(() => {
    messageElement.style.transform = 'translateX(0)';
    messageElement.style.opacity = '1';
  }, 10);
  
  // Auto-suppression après 3 secondes
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 300);
  }, 3000);
  
  return messageId;
}

// ===== GESTION DU THÈME =====
function setupTheme() {
  const savedTheme = localStorage.getItem('selectedTheme') || CONFIG.defaultTheme;
  state.currentTheme = savedTheme;
  document.body.className = savedTheme;
  
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = savedTheme;
}

function changeTheme(themeName) {
  state.currentTheme = themeName;
  document.body.className = themeName;
  localStorage.setItem('selectedTheme', themeName);
  
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = themeName;
  
  const themeDisplayName = themeName.replace('theme-', '').replace(/-/g, ' ');
  showMessage(`Thème: ${themeDisplayName}`, "info");
}

function resetTheme() {
  changeTheme(CONFIG.defaultTheme);
}

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
      const parsedData = JSON.parse(savedData);
      state.sites = Array.isArray(parsedData) ? parsedData : [];
      console.log(`📂 ${state.sites.length} entrées depuis localStorage`);
    } catch (e) {
      console.error("Erreur localStorage:", e);
      state.sites = [];
    }
  }
  
  // 2. Si pas de données, charger datas.js ou données par défaut
  if (state.sites.length === 0) {
    loadExternalOrDefault();
  } else {
    // S'assurer que les entrées par défaut sont présentes
    ensureDefaultEntries();
    applyFilters();
  }
}

function loadExternalOrDefault() {
  // Vérifier si datas.js existe (chargé avant app.js)
  if (typeof window.sites !== 'undefined' && Array.isArray(window.sites)) {
    console.log("✅ datas.js détecté");
    
    // Normaliser les données (support V0 et V1)
    state.sites = window.sites.map(site => {
      const entry = {
        n: site.n || site.name || "",
        u: site.u || site.url || "",
        c: site.c || site.category || "Non catégorisé",
        d: site.d || site.description || "",
        id: Date.now() + Math.random()
      };
      
      // Date optionnelle - "2025" par défaut
      entry.date = site.date || "2025";
      
      return entry;
    });
  } else {
    console.log("⚠️ datas.js non détecté, données par défaut");
    state.sites = [...DEFAULT_ENTRIES];
  }
  
  // S'assurer que les entrées par défaut sont présentes
  ensureDefaultEntries();
  
  // Sauvegarder et afficher
  saveToLocalStorage();
  applyFilters();
}

function ensureDefaultEntries() {
  DEFAULT_ENTRIES.forEach(defaultEntry => {
    const exists = state.sites.some(s => s.n === defaultEntry.n && s.u === defaultEntry.u);
    if (!exists) {
      state.sites.push({
        n: defaultEntry.n,
        u: defaultEntry.u,
        c: defaultEntry.c,
        d: defaultEntry.d,
        date: defaultEntry.date,
        id: Date.now() + Math.random()
      });
    }
  });
}

function saveToLocalStorage() {
  localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.sites));
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
    case 'category-desc':
      return sorted.sort((a, b) => b.c.localeCompare(a.c) || a.n.localeCompare(b.n));
    case 'date-desc':
      return sorted.sort((a, b) => {
        const dateA = a.date || "2025";
        const dateB = b.date || "2025";
        return dateB.localeCompare(dateA);
      });
    case 'date-asc':
      return sorted.sort((a, b) => {
        const dateA = a.date || "2025";
        const dateB = b.date || "2025";
        return dateA.localeCompare(dateB);
      });
    default:
      return sorted;
  }
}

// ===== AFFICHAGE DES ENTREES =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  const total = list.length;
  
  document.getElementById('filteredCount').textContent = `${total}`;
  
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
  
  // Séparer les entrées par défaut et les autres
  const defaultEntries = [];
  const otherEntries = [];
  
  list.forEach(site => {
    const isDefault = DEFAULT_ENTRIES.some(de => de.n === site.n && de.u === site.u);
    if (isDefault) {
      defaultEntries.push(site);
    } else {
      otherEntries.push(site);
    }
  });
  
  // Trier les autres entrées
  const sortedOther = sortEntries(otherEntries);
  
  // Combiner: d'abord les entrées par défaut, puis les autres triées
  const combinedEntries = [...defaultEntries, ...sortedOther];
  
  // Générer HTML
  container.innerHTML = combinedEntries.map((site, index) => {
    const isDefault = DEFAULT_ENTRIES.some(de => de.n === site.n && de.u === site.u);
    const displayDate = site.date || "2025";
    const theme = getThemeForCategory(site.c);
    
    return `
      <div class="entry-card">
        <div class="entry-header">
          <div class="entry-title">${escapeHTML(site.n)}</div>
          <div class="entry-category">${escapeHTML(site.c)}</div>
        </div>
        <div class="entry-description">${escapeHTML(site.d || "Pas de description disponible")}</div>
        <a href="${encodeURI(site.u)}" target="_blank" rel="noopener noreferrer" class="entry-url">
          🔗 ${escapeHTML(truncateURL(site.u, 45))}
        </a>
        <div class="entry-meta">
          <span>${escapeHTML(theme)}</span>
          <span>${escapeHTML(displayDate)}</span>
        </div>
        <div class="entry-actions">
          <button class="btn-small" onclick="editEntry('${site.id}')">✏️</button>
          <button class="btn-small btn-danger" onclick="deleteEntry('${site.id}')">🗑️</button>
        </div>
        ${isDefault ? '<div class="entry-star">⭐</div>' : ''}
      </div>
    `;
  }).join('');
}

// ===== TOP 10 THÉMATIQUES =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  const counts = {};
  
  list.forEach(site => {
    if (site.c && site.c.trim()) {
      counts[site.c] = (counts[site.c] || 0) + 1;
    }
  });
  
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (top.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique disponible</div>`;
    return;
  }
  
  container.innerHTML = top.map(([category, count], index) => {
    const theme = getThemeForCategory(category);
    const escapedCategory = escapeHTML(category);
    const escapedTheme = escapeHTML(theme);
    
    return `
      <div class="theme-card" onclick="toggleThemeFilter('${escapedTheme}')">
        <div class="theme-header">
          <div class="theme-rank">${index + 1}</div>
          <h3>${escapedCategory}</h3>
        </div>
        <p class="theme-count">${count} organisation${count !== 1 ? 's' : ''}</p>
        <p class="theme-desc">Thème: ${escapedTheme}</p>
        <button class="btn btn-secondary" onclick="event.stopPropagation();toggleCategory('${escapedCategory}')">
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
  
  container.innerHTML = sorted.map(([category, count]) => {
    const escapedCategory = escapeHTML(category);
    return `
      <button class="category-item ${state.activeCategories.includes(category) ? 'active' : ''}" 
              onclick="toggleCategory('${escapedCategory}')">
        ${escapedCategory} <span class="cat-count">(${count})</span>
      </button>
    `;
  }).join('');
}

// ===== TOUTES LES THÉMATIQUES =====
function displayAllThemes(list) {
  const container = document.getElementById('allThemesContainer');
  const themeCounts = {};
  
  list.forEach(site => {
    const theme = getThemeForCategory(site.c);
    themeCounts[theme] = (themeCounts[theme] || 0) + 1;
  });
  
  const sorted = Object.entries(themeCounts).sort((a, b) => a[0].localeCompare(b[0]));
  
  if (sorted.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique disponible</div>`;
    return;
  }
  
  container.innerHTML = sorted.map(([theme, count]) => {
    const escapedTheme = escapeHTML(theme);
    return `
      <button class="category-item ${state.activeThemes.includes(theme) ? 'active' : ''}" 
              onclick="toggleThemeFilter('${escapedTheme}')">
        ${escapedTheme} <span class="cat-count">(${count})</span>
      </button>
    `;
  }).join('');
}

// ===== FILTRES =====
function applyFilters() {
  let filtered = [...state.sites];
  
  if (state.searchTerm) {
    const search = state.searchTerm.toLowerCase();
    filtered = filtered.filter(site =>
      (site.n && site.n.toLowerCase().includes(search)) ||
      (site.d && site.d.toLowerCase().includes(search)) ||
      (site.c && site.c.toLowerCase().includes(search)) ||
      (site.u && site.u.toLowerCase().includes(search))
    );
  }
  
  if (state.activeCategories.length > 0) {
    filtered = filtered.filter(site => 
      state.activeCategories.includes(site.c)
    );
  }
  
  if (state.activeThemes.length > 0) {
    filtered = filtered.filter(site => 
      state.activeThemes.includes(getThemeForCategory(site.c))
    );
  }
  
  displayEntries(filtered);
  displayTopThemes(filtered);
  displayCategories(filtered);
  displayAllThemes(filtered);
  updateStatistics();
}

function toggleCategory(category) {
  const index = state.activeCategories.indexOf(category);
  if (index > -1) {
    state.activeCategories.splice(index, 1);
  } else {
    state.activeCategories.push(category);
  }
  applyFilters();
}

function toggleThemeFilter(theme) {
  const index = state.activeThemes.indexOf(theme);
  if (index > -1) {
    state.activeThemes.splice(index, 1);
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
          // Validation URL
          if (!item.u.startsWith('http://') && !item.u.startsWith('https://')) {
            console.warn("URL invalide pour l'entrée:", item.n);
            return;
          }
          
          const entry = {
            n: item.n.toString().trim(),
            u: item.u.toString().trim(),
            c: (item.c || "Non catégorisé").toString().trim(),
            d: (item.d || "").toString().trim(),
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
      
      // S'assurer que les entrées par défaut sont présentes
      ensureDefaultEntries();
      
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
  let content = '// datas.js V1 - Bottin Annuaire Web Libre 2025\n';
  content += '// Format V1 (avec date optionnelle)\n\n';
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
  
  showMessage("Export datas.js V1 terminé", "success");
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

// ===== GESTION DES ENTREES (AJOUT/ÉDITION/SUPPRESSION) =====
function showAddEntryModal() {
  document.getElementById('addEntryModal').classList.add('show');
  document.getElementById('entryForm').reset();
  document.getElementById('modalTitle').textContent = 'Ajouter une nouvelle entrée';
  document.getElementById('saveEntry').textContent = 'Ajouter';
  document.getElementById('saveEntry').onclick = saveNewEntry;
}

function showEditEntryModal(id) {
  const entry = state.sites.find(s => s.id === id);
  if (!entry) return;
  
  document.getElementById('entryName').value = entry.n;
  document.getElementById('entryCategory').value = entry.c;
  document.getElementById('entryDescription').value = entry.d;
  document.getElementById('entryUrl').value = entry.u;
  document.getElementById('entryDate').value = entry.date;
  
  // Stocker l'ID de l'entrée en cours d'édition
  document.getElementById('entryForm').dataset.editingId = id;
  
  document.getElementById('modalTitle').textContent = 'Modifier l\'entrée';
  document.getElementById('saveEntry').textContent = 'Modifier';
  document.getElementById('saveEntry').onclick = saveEditedEntry;
  
  document.getElementById('addEntryModal').classList.add('show');
}

function hideAddEntryModal() {
  document.getElementById('addEntryModal').classList.remove('show');
  document.getElementById('entryForm').reset();
  delete document.getElementById('entryForm').dataset.editingId;
}

function saveNewEntry() {
  const name = document.getElementById('entryName').value.trim();
  const category = document.getElementById('entryCategory').value.trim() || "Non catégorisé";
  const description = document.getElementById('entryDescription').value.trim();
  const url = document.getElementById('entryUrl').value.trim();
  const dateInput = document.getElementById('entryDate').value.trim();
  
  // Validation URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showMessage("L'URL doit commencer par http:// ou https://", "error");
    return;
  }
  
  // Date optionnelle - si vide, on utilise "2025"
  const date = dateInput || "2025";
  
  if (!name) {
    showMessage("Le nom est requis", "error");
    return;
  }
  
  if (!url) {
    showMessage("L'URL est requise", "error");
    return;
  }
  
  const exists = state.sites.some(s => s.n === name && s.u === url);
  if (exists) {
    showMessage("Cette entrée existe déjà", "warning");
    return;
  }
  
  const newEntry = {
    n: name,
    c: category,
    d: description,
    u: url,
    date: date,
    id: Date.now() + Math.random()
  };
  
  state.sites.push(newEntry);
  saveToLocalStorage();
  applyFilters();
  hideAddEntryModal();
  
  showMessage("Entrée ajoutée avec succès", "success");
}

function saveEditedEntry() {
  const id = document.getElementById('entryForm').dataset.editingId;
  const entryIndex = state.sites.findIndex(s => s.id === id);
  
  if (entryIndex === -1) return;
  
  const name = document.getElementById('entryName').value.trim();
  const category = document.getElementById('entryCategory').value.trim() || "Non catégorisé";
  const description = document.getElementById('entryDescription').value.trim();
  const url = document.getElementById('entryUrl').value.trim();
  const dateInput = document.getElementById('entryDate').value.trim();
  
  // Validation URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showMessage("L'URL doit commencer par http:// ou https://", "error");
    return;
  }
  
  const date = dateInput || "2025";
  
  if (!name) {
    showMessage("Le nom est requis", "error");
    return;
  }
  
  if (!url) {
    showMessage("L'URL est requise", "error");
    return;
  }
  
  // Vérifier si une autre entrée a le même nom et URL
  const duplicate = state.sites.some((s, index) => 
    index !== entryIndex && s.n === name && s.u === url
  );
  
  if (duplicate) {
    showMessage("Une autre entrée avec le même nom et URL existe déjà", "warning");
    return;
  }
  
  // Mettre à jour l'entrée
  state.sites[entryIndex] = {
    ...state.sites[entryIndex],
    n: name,
    c: category,
    d: description,
    u: url,
    date: date
  };
  
  saveToLocalStorage();
  applyFilters();
  hideAddEntryModal();
  
  showMessage("Entrée modifiée avec succès", "success");
}

function deleteEntry(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette entrée ?")) {
    // Empêcher la suppression des entrées par défaut
    const entry = state.sites.find(s => s.id === id);
    if (entry && DEFAULT_ENTRIES.some(de => de.n === entry.n && de.u === entry.u)) {
      showMessage("Les entrées par défaut ne peuvent pas être supprimées", "warning");
      return;
    }
    
    state.sites = state.sites.filter(s => s.id !== id);
    saveToLocalStorage();
    applyFilters();
    showMessage("Entrée supprimée", "info");
  }
}

function editEntry(id) {
  showEditEntryModal(id);
}

// ===== UTILITAIRES =====
function getThemeForCategory(category) {
  if (!category) return "Autre";
  
  const themeMap = {
    "Constitution": ["Constitution", "Gouvernance", "Droit"],
    "Technologie": ["Technologie", "Informatique", "Développement", "Programmation"],
    "Gouvernance": ["Gouvernance", "Politique", "Administration", "Gestion"],
    "Éducation": ["Éducation", "Formation", "Université", "École"],
    "Culture": ["Culture", "Arts", "Musique", "Littérature"],
    "Écologie": ["Écologie", "Environnement", "Climat", "Développement durable"],
    "Santé": ["Santé", "Médecine", "Bien-être", "Soins"],
    "Économie": ["Économie", "Finance", "Business", "Commerce"],
    "Social": ["Social", "Communauté", "Association", "Solidarité"],
    "Science": ["Science", "Recherche", "Innovation", "Technologie"],
    "Sport": ["Sport", "Loisir", "Activité physique"],
    "Média": ["Média", "Presse", "Communication", "Journalisme"]
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
  let escaped = div.innerHTML;
  // Échapper les guillemets simples et doubles
  escaped = escaped.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  return escaped;
}

function truncateURL(url, max = 45) {
  if (!url) return '';
  if (url.length <= max) return url;
  return url.substring(0, max) + '...';
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
  
  // Ajout d'entrée
  document.getElementById('btnAddEntry').addEventListener('click', showAddEntryModal);
  document.getElementById('modalClose').addEventListener('click', hideAddEntryModal);
  document.getElementById('cancelEntry').addEventListener('click', hideAddEntryModal);
  document.getElementById('saveEntry').addEventListener('click', saveNewEntry);
  
  // Fermer la modale
  document.getElementById('addEntryModal').addEventListener('click', (e) => {
    if (e.target.id === 'addEntryModal') hideAddEntryModal();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAddEntryModal();
  });
  
  // Bouton retour en haut
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
      backToTopBtn.style.display = window.scrollY > 200 ? 'flex' : 'none';
    });
  }
  
  // Recherche avancée
  document.getElementById('btnAdvancedSearch').addEventListener('click', () => {
    const advancedSearch = document.getElementById('advancedSearch');
    advancedSearch.classList.toggle('show');
  });
}

// ===== DÉMARRAGE =====
document.addEventListener('DOMContentLoaded', initializeApp);

// ===== FONCTIONS GLOBALES =====
window.toggleCategory = toggleCategory;
window.toggleThemeFilter = toggleThemeFilter;
window.clearFilters = clearFilters;
window.changeTheme = changeTheme;
window.showAddEntryModal = showAddEntryModal;
window.saveNewEntry = saveNewEntry;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;

// ===== FONCTIONS AVANCÉES =====
// Recherche par date
function filterByDate(year) {
  state.searchTerm = year;
  document.getElementById('searchInput').value = year;
  applyFilters();
}

// Télécharger toutes les données
function downloadAllData() {
  const allData = {
    metadata: {
      app: CONFIG.appName,
      version: CONFIG.version,
      exportDate: new Date().toISOString(),
      count: state.sites.length
    },
    sites: state.sites,
    themes: Object.entries(getThemeCounts()).map(([theme, count]) => ({ theme, count }))
  };
  
  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bottin-complet-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

function getThemeCounts() {
  const counts = {};
  state.sites.forEach(site => {
    const theme = getThemeForCategory(site.c);
    counts[theme] = (counts[theme] || 0) + 1;
  });
  return counts;
}

// Réinitialiser toutes les données (sauf celles par défaut)
function resetAllData() {
  if (confirm("Êtes-vous sûr de vouloir supprimer toutes les données ajoutées ?\nSeules les entrées par défaut seront conservées.")) {
    state.sites = [...DEFAULT_ENTRIES];
    saveToLocalStorage();
    applyFilters();
    showMessage("Données réinitialisées", "success");
  }
}

// Exposer les fonctions avancées
window.filterByDate = filterByDate;
window.downloadAllData = downloadAllData;
window.resetAllData = resetAllData;