// ===== CONFIGURATION =====
const CONFIG = {
  appName: "Bottin Annuaire Web Libre 2025",
  version: "2.1",
  defaultTheme: "theme-dark"
};

// ===== ÉTAT GLOBAL =====
let state = {
  sites: [],
  activeCategories: [],
  activeThemes: [],
  searchTerm: "",
  currentTheme: CONFIG.defaultTheme
};

// ===== SEULEMENT 2 ENTREES PAR DÉFAUT =====
const DEFAULT_ENTRIES = [
  {
    n: "Constitutions Kulchatila",
    c: "Constitution",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space",
    date: "2025"
  },
  {
    n: "Constitutions LMBMicro", 
    c: "Constitution",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space",
    date: "2025"
  }
];

// ===== MAPPING THÉMATIQUE =====
const THEME_MAP = {
  "Constitution": ["Constitution", "Gouvernance", "Droit"],
  "Technologie": ["Technologie", "Informatique", "Développement", "Programmation"],
  "Gouvernance": ["Gouvernance", "Politique", "Administration", "Démocratie"],
  "Éducation": ["Éducation", "Formation", "Université", "École"],
  "Culture": ["Culture", "Arts", "Musique", "Cinéma", "Littérature"],
  "Écologie": ["Écologie", "Environnement", "Développement durable", "Climat"],
  "Santé": ["Santé", "Médecine", "Bien-être", "Hôpital"],
  "Économie": ["Économie", "Finance", "Business", "Commerce"],
  "Social": ["Social", "Communauté", "Association", "Bénévolat"],
  "Science": ["Science", "Recherche", "Innovation", "Technologie"]
};

// ===== INITIALISATION =====
function initializeApp() {
  console.log(`🚀 ${CONFIG.appName} v${CONFIG.version}`);
  
  // 1. Charger les données (priorité: datas.js, sinon données par défaut)
  loadData();
  
  // 2. Configurer le thème
  setupTheme();
  
  // 3. Configurer les écouteurs d'événements
  setupEventListeners();
  
  // 4. Afficher les données initiales
  applyFilters();
  
  console.log("✅ Application initialisée avec succès");
  console.log(`📊 ${state.sites.length} entrées chargées`);
}

// ===== CHARGEMENT DES DONNÉES =====
function loadData() {
  // Vérifier si window.sites existe (chargé depuis datas.js)
  if (typeof window.sites !== 'undefined' && Array.isArray(window.sites)) {
    console.log("✅ datas.js trouvé, utilisation des données externes");
    state.sites = [...window.sites];
    
    // Vérifier si les entrées par défaut sont déjà présentes
    DEFAULT_ENTRIES.forEach(defaultEntry => {
      const exists = state.sites.some(site => 
        site.n === defaultEntry.n && 
        site.u === defaultEntry.u
      );
      
      if (!exists) {
        state.sites.unshift(defaultEntry);
        console.log(`➕ Ajout de l'entrée par défaut: ${defaultEntry.n}`);
      }
    });
  } else {
    console.log("⚠️ datas.js non trouvé, utilisation des 2 entrées par défaut seulement");
    state.sites = [...DEFAULT_ENTRIES];
  }
}

// ===== GESTION DU THÈME =====
function setupTheme() {
  // Récupérer le thème sauvegardé
  const savedTheme = localStorage.getItem('selectedTheme') || CONFIG.defaultTheme;
  state.currentTheme = savedTheme;
  
  // Appliquer le thème
  document.body.className = savedTheme;
  
  // Mettre à jour le sélecteur
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
  }
}

function changeTheme(themeName) {
  const themeLoading = document.getElementById('themeLoading');
  
  // Afficher l'animation de chargement
  if (themeLoading) {
    themeLoading.classList.add('active');
  }
  
  setTimeout(() => {
    // Changer le thème
    document.body.className = themeName;
    state.currentTheme = themeName;
    
    // Sauvegarder
    localStorage.setItem('selectedTheme', themeName);
    
    // Mettre à jour les couleurs CSS variables pour les animations
    updateThemeVariables();
    
    // Cacher l'animation
    setTimeout(() => {
      if (themeLoading) {
        themeLoading.classList.remove('active');
      }
    }, 300);
    
    console.log(`🎨 Thème changé: ${themeName}`);
  }, 200);
}

function resetTheme() {
  changeTheme(CONFIG.defaultTheme);
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = CONFIG.defaultTheme;
  }
  console.log("🔄 Thème réinitialisé");
}

function updateThemeVariables() {
  // Extraire les couleurs principales pour les animations
  const style = getComputedStyle(document.body);
  const primary = style.getPropertyValue('--primary');
  const info = style.getPropertyValue('--info');
  const danger = style.getPropertyValue('--danger');
  
  // Convertir en RGB pour les opacités
  document.documentElement.style.setProperty('--primary-rgb', hexToRgb(primary));
  document.documentElement.style.setProperty('--info-rgb', hexToRgb(info));
  document.documentElement.style.setProperty('--danger-rgb', hexToRgb(danger));
}

function hexToRgb(hex) {
  // Convertir hex en RGB
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : "0, 255, 170";
}

// ===== AFFICHAGE DES ENTREES =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  const total = list.length;
  
  // Mettre à jour le compteur
  const filteredCount = document.getElementById('filteredCount');
  if (filteredCount) {
    filteredCount.textContent = `${total} entrée${total !== 1 ? 's' : ''}`;
  }
  
  if (total === 0) {
    container.innerHTML = `
      <div class="message info">
        <p style="margin-bottom: 15px;">Aucune organisation ne correspond aux filtres/recherche.</p>
        <button onclick="clearFilters()" class="btn">
          🔄 Réinitialiser les filtres
        </button>
      </div>`;
    return;
  }
  
  // Trier par nom (A-Z)
  list.sort((a, b) => a.n.localeCompare(b.n));
  
  // Générer le HTML
  container.innerHTML = list.map(site => {
    const isDefault = DEFAULT_ENTRIES.some(de => 
      de.n === site.n && de.u === site.u
    );
    
    return `
      <div class="entry-card">
        <div class="entry-header">
          <div class="entry-title">${escapeHTML(site.n)}</div>
          <div class="entry-category">${escapeHTML(site.c)}</div>
        </div>
        <div class="entry-description">${escapeHTML(site.d || "Pas de description disponible")}</div>
        <a href="${site.u}" target="_blank" rel="noopener noreferrer" class="entry-url">
          🔗 ${truncateURL(site.u, 40)}
        </a>
        <div class="entry-meta">
          <span>Thème: ${getThemeForCategory(site.c)}</span>
          <span>${site.date || "2025"}</span>
        </div>
        ${isDefault ? '<div style="position: absolute; top: 10px; right: 10px; font-size: 0.7rem; color: var(--accent); background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 4px;">⭐</div>' : ''}
      </div>
    `;
  }).join('');
}

// ===== TOP 10 THÉMATIQUES =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  
  // Compter les occurrences par catégorie
  const counts = {};
  list.forEach(site => {
    if (site.c && site.c.trim() !== "") {
      counts[site.c] = (counts[site.c] || 0) + 1;
    }
  });
  
  // Trier et prendre le top 10
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
  
  // Compter les occurrences
  const counts = {};
  list.forEach(site => {
    if (site.c && site.c.trim() !== "") {
      counts[site.c] = (counts[site.c] || 0) + 1;
    }
  });
  
  // Trier par nom
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

// ===== THÉMATIQUES REGROUPÉES =====
function displayThemes() {
  const container = document.getElementById('themesContainer');
  
  // Calculer le nombre d'entrées par thème
  const themeCounts = {};
  Object.keys(THEME_MAP).forEach(theme => {
    const categories = THEME_MAP[theme];
    let count = 0;
    
    state.sites.forEach(site => {
      if (categories.includes(site.c)) {
        count++;
      }
    });
    
    if (count > 0) {
      themeCounts[theme] = count;
    }
  });
  
  const sortedThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedThemes.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique regroupée</div>`;
    return;
  }
  
  container.innerHTML = sortedThemes.map(([theme, count]) => `
    <button class="category-item ${state.activeThemes.includes(theme) ? 'active' : ''}" 
            onclick="toggleThemeFilter('${escapeHTML(theme)}')">
      ${escapeHTML(theme)} <span class="cat-count">(${count})</span>
    </button>
  `).join('');
}

// ===== FILTRES =====
function applyFilters() {
  let filtered = [...state.sites];
  
  // 1. Filtre de recherche
  if (state.searchTerm) {
    const search = state.searchTerm.toLowerCase();
    filtered = filtered.filter(site =>
      (site.n && site.n.toLowerCase().includes(search)) ||
      (site.d && site.d.toLowerCase().includes(search)) ||
      (site.c && site.c.toLowerCase().includes(search)) ||
      (site.u && site.u.toLowerCase().includes(search))
    );
  }
  
  // 2. Filtre par catégorie
  if (state.activeCategories.length > 0) {
    filtered = filtered.filter(site => 
      state.activeCategories.includes(site.c)
    );
  }
  
  // 3. Filtre par thème
  if (state.activeThemes.length > 0) {
    filtered = filtered.filter(site => {
      // Vérifier si la catégorie correspond à un thème actif
      return state.activeThemes.some(theme => {
        const themeCategories = THEME_MAP[theme];
        if (themeCategories && Array.isArray(themeCategories)) {
          return themeCategories.includes(site.c);
        }
        return theme === site.c;
      });
    });
  }
  
  // Afficher les résultats
  displayEntries(filtered);
  displayTopThemes(filtered);
  displayCategories(filtered);
  displayThemes();
  
  console.log(`🔍 ${filtered.length} résultats après filtrage`);
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
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = "";
  
  applyFilters();
  console.log("🧹 Tous les filtres réinitialisés");
}

// ===== IMPORT/EXPORT =====
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        alert("❌ Erreur: Le fichier doit contenir un tableau JSON");
        return;
      }
      
      let addedCount = 0;
      let errorCount = 0;
      
      importedData.forEach(item => {
        if (item && item.n && item.u) {
          const entry = {
            n: item.n.toString().trim(),
            c: (item.c || "Non catégorisé").toString().trim(),
            d: (item.d || "").toString().trim(),
            u: item.u.toString().trim(),
            date: item.date || "2025"
          };
          
          // Vérifier si l'entrée existe déjà
          const exists = state.sites.some(site => 
            site.n === entry.n && site.u === entry.u
          );
          
          if (!exists) {
            state.sites.push(entry);
            addedCount++;
          }
        } else {
          errorCount++;
        }
      });
      
      if (addedCount > 0) {
        applyFilters();
        alert(`✅ ${addedCount} entrée(s) importée(s) avec succès !${errorCount > 0 ? ` (${errorCount} entrée(s) ignorée(s))` : ''}`);
      } else {
        alert("ℹ️ Aucune nouvelle entrée à ajouter (doublons ou données invalides)");
      }
      
    } catch (error) {
      alert("❌ Erreur d'import: " + error.message);
    }
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

function exportJSON() {
  const data = state.sites.map(site => ({
    n: site.n,
    u: site.u,
    c: site.c,
    d: site.d || "",
    date: site.date || "2025"
  }));
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `bottin-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log("📤 Export JSON terminé");
}

function exportDatasJS() {
  const formatSelect = document.getElementById('datasFormatSelect');
  const format = formatSelect ? formatSelect.value : 'compact';
  
  let content = '// datas.js - Bottin Annuaire Web Libre 2025\n';
  content += '// Généré automatiquement le ' + new Date().toLocaleString() + '\n\n';
  content += 'window.sites = ';
  
  if (format === 'compact') {
    content += JSON.stringify(state.sites);
  } else {
    content += JSON.stringify(state.sites, null, 2);
  }
  
  content += ';\n';
  
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'datas.js';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log("📤 Export datas.js terminé");
}

function exportTopThemes() {
  // Utiliser window.TOP_THEMES si disponible, sinon générer automatiquement
  let topThemes;
  
  if (typeof window.TOP_THEMES !== 'undefined' && Array.isArray(window.TOP_THEMES)) {
    topThemes = window.TOP_THEMES;
  } else {
    // Générer automatiquement à partir des catégories
    const counts = {};
    state.sites.forEach(site => {
      if (site.c) counts[site.c] = (counts[site.c] || 0) + 1;
    });
    
    topThemes = Object.entries(counts)
      .map(([theme, count]) => ({
        theme,
        count,
        description: `Regroupe ${count} organisation(s) dans la catégorie ${theme}`
      }))
      .sort((a, b) => b.count - a.count);
  }
  
  let content = '// toptheme.js - Thématiques principales\n';
  content += '// Généré automatiquement le ' + new Date().toLocaleString() + '\n\n';
  content += 'window.TOP_THEMES = ';
  content += JSON.stringify(topThemes, null, 2);
  content += ';\n';
  
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'toptheme.js';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log("📤 Export toptheme.js terminé");
}

// ===== FONCTIONS UTILITAIRES =====
function getThemeForCategory(category) {
  for (const [theme, categories] of Object.entries(THEME_MAP)) {
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

function truncateURL(url, maxLength = 40) {
  if (!url) return '';
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

// ===== CONFIGURATION DES ÉVÉNEMENTS =====
function setupEventListeners() {
  // Recherche
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        state.searchTerm = e.target.value.toLowerCase().trim();
        applyFilters();
      }, 300);
    });
    
    // Permettre la recherche avec Entrée
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        state.searchTerm = e.target.value.toLowerCase().trim();
        applyFilters();
      }
    });
  }
  
  // Bouton effacer filtres
  const btnClearFilters = document.getElementById('btnClearFilters');
  if (btnClearFilters) {
    btnClearFilters.addEventListener('click', clearFilters);
  }
  
  // Sélecteur de thème
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
  }
  
  // Import JSON
  const jsonFileInput = document.getElementById('jsonFileInput');
  const btnImportJSON = document.getElementById('btnImportJSON');
  if (jsonFileInput && btnImportJSON) {
    btnImportJSON.addEventListener('click', () => {
      jsonFileInput.click();
    });
    jsonFileInput.addEventListener('change', importJSON);
  }
  
  // Export JSON
  const btnExportJSON = document.getElementById('btnExportJSON');
  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', exportJSON);
  }
  
  // Export datas.js
  const btnExportDatasJS = document.getElementById('btnExportDatasJS');
  if (btnExportDatasJS) {
    btnExportDatasJS.addEventListener('click', exportDatasJS);
  }
  
  // Export toptheme.js
  const btnExportTopThemes = document.getElementById('btnExportTopThemes');
  if (btnExportTopThemes) {
    btnExportTopThemes.addEventListener('click', exportTopThemes);
  }
  
  // Réinitialiser thème
  const btnResetTheme = document.getElementById('btnResetTheme');
  if (btnResetTheme) {
    btnResetTheme.addEventListener('click', resetTheme);
  }
  
  // Ajouter une entrée (bouton placeholder)
  const btnAddEntry = document.getElementById('btnAddEntry');
  if (btnAddEntry) {
    btnAddEntry.addEventListener('click', () => {
      alert("🚧 Fonctionnalité en cours de développement\n\nPour ajouter une entrée, utilisez l'import JSON ou éditez directement le fichier datas.js");
    });
  }
}

// ===== DÉMARRAGE DE L'APPLICATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialiser les variables RGB pour les animations
  updateThemeVariables();
  
  // Démarrer l'application
  initializeApp();
});

// Exposer les fonctions globales
window.toggleCategory = toggleCategory;
window.toggleThemeFilter = toggleThemeFilter;
window.clearFilters = clearFilters;
window.changeTheme = changeTheme;