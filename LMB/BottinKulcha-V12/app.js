// État des filtres
let activeCategories = [];
let activeThemes = [];
let searchTerm = "";

// ENTREES PAR DEFAUT GARANTIES
const DEFAULT_ENTRIES = [
  {
    n: "Constitutions",
    c: "Kulchatila",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space"
  },
  {
    n: "Constitutions", 
    c: "LMBMicro",
    d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
    u: "https://libresol2-5jaz4b32.manus.space"
  }
];

// ===== GARANTIR LES ENTREES PAR DEFAUT =====
function ensureDefaultEntries() {
  // Vérifier si les entrées par défaut existent dans sites
  DEFAULT_ENTRIES.forEach(defaultEntry => {
    const exists = sites.some(site => 
      site.n === defaultEntry.n && 
      site.c === defaultEntry.c && 
      site.u === defaultEntry.u
    );
    
    if (!exists) {
      sites.unshift(defaultEntry);
      console.log(`➕ Entrée par défaut ajoutée: ${defaultEntry.n}`);
    }
  });
}

// ===== IMPORT JSON (SEULE FONCTION AJOUTÉE) =====
function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (!Array.isArray(importedData)) {
        alert("Erreur: Le fichier doit contenir un tableau JSON");
        return;
      }
      
      let addedCount = 0;
      
      importedData.forEach(item => {
        if (item && item.n && item.u) {
          const entry = {
            n: item.n.toString().trim(),
            c: (item.c || "Non catégorisé").toString().trim(),
            d: (item.d || "").toString().trim(),
            u: item.u.toString().trim()
          };
          
          const exists = sites.some(site => 
            site.n === entry.n && 
            site.c === entry.c && 
            site.u === entry.u
          );
          
          if (!exists) {
            sites.push(entry);
            addedCount++;
          }
        }
      });
      
      if (addedCount > 0) {
        applyFilters();
        alert(`${addedCount} entrée(s) importée(s) avec succès !`);
      } else {
        alert("Aucune nouvelle entrée à ajouter");
      }
      
    } catch (error) {
      alert("Erreur d'import: " + error.message);
    }
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

// ===== Affichage des entrées =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  const total = list.length;
  document.getElementById('filteredCount').textContent = `${total} entrée${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    container.innerHTML = `<div class="message error">Aucune organisation ne correspond aux filtres/recherche.</div>`;
    return;
  }

  container.innerHTML = list.map(site => `
    <div class="entry-card">
      <div class="entry-header">
        <div class="entry-title">${site.n}</div>
        <div class="entry-category">${site.c}</div>
      </div>
      <div class="entry-description">${site.d || ""}</div>
      <a href="${site.u}" target="_blank" rel="noopener" class="entry-url">Visiter ↗</a>
      <div class="entry-meta">
        <span title="${site.u}">${site.u.replace(/^https?:\/\//,'')}</span>
      </div>
    </div>
  `).join('');
}

// ===== Top 10 thématiques (calculées sur les catégories réelles) =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  const counts = {};
  list.forEach(s => {
    if (s.c && s.c.trim() !== "") {
      counts[s.c] = (counts[s.c] || 0) + 1;
    }
  });

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (top.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique calculable.</div>`;
    return;
  }

  container.innerHTML = top.map(([theme, count], i) => `
    <div class="theme-card ${activeThemes.includes(theme) ? 'active' : ''}" onclick="toggleTheme('${theme}')">
      <div class="theme-header">
        <div class="theme-rank">${i + 1}</div>
        <h3>${theme}</h3>
      </div>
      <p class="theme-count">${count} organisations</p>
      <button class="btn btn-secondary">Filtrer par "${theme}"</button>
    </div>
  `).join('');
}

// ===== Catégories (uniques triées alpha) =====
function displayCategories(list) {
  const container = document.getElementById('categoriesContainer');
  const counts = {};
  list.forEach(s => {
    if (s.c && s.c.trim() !== "") {
      counts[s.c] = (counts[s.c] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  if (sorted.length === 0) {
    container.innerHTML = `<div class="message">Aucune catégorie.</div>`;
    return;
  }

  container.innerHTML = sorted.map(([cat, count]) => `
    <button class="category-item ${activeCategories.includes(cat) ? 'active' : ''}" onclick="toggleCategory('${cat}')">
      ${cat} <span class="cat-count">(${count})</span>
    </button>
  `).join('');
}

// ===== Thématiques (définies manuellement) =====
function displayAllThemes() {
  const container = document.getElementById('allThemesContainer');
  const topThemes = window.topThemes || window.TOP_THEMES || [];
  
  if (!Array.isArray(topThemes) || topThemes.length === 0) {
    container.innerHTML = `<div class="message">Aucune thématique définie.</div>`;
    return;
  }

  container.innerHTML = topThemes.map(t => `
    <div class="theme-card ${activeThemes.includes(t.theme) ? 'active' : ''}" onclick="toggleTheme('${t.theme}')">
      <h3>${t.theme}</h3>
      <p class="theme-count">${t.count} organisations</p>
      <p class="theme-desc">${t.description || t.desc || ''}</p>
      <button class="btn btn-secondary">Filtrer par "${t.theme}"</button>
    </div>
  `).join('');
}

// ===== Logique de filtrage =====
function applyFilters() {
  let filtered = sites.slice();

  // Recherche
  if (searchTerm) {
    const q = searchTerm;
    filtered = filtered.filter(s =>
      (s.n && s.n.toLowerCase().includes(q)) ||
      (s.d && s.d.toLowerCase().includes(q)) ||
      (s.c && s.c.toLowerCase().includes(q)) ||
      (s.u && s.u.toLowerCase().includes(q))
    );
  }

  // Catégories (multi-sélection)
  if (activeCategories.length > 0) {
    filtered = filtered.filter(s => activeCategories.includes(s.c));
  }

  // Thématiques (multi-sélection)
  if (activeThemes.length > 0) {
    filtered = filtered.filter(s => {
      // Cas 1: thématique == catégorie
      if (activeThemes.includes(s.c)) return true;

      // Cas 2: thématique = regroupement (THEME_MAP)
      return activeThemes.some(themeName => {
        const key = themeName.toLowerCase().split('&')[0].trim();
        return (s.c && s.c.toLowerCase().includes(key)) ||
               (s.n && s.n.toLowerCase().includes(key)) ||
               (s.d && s.d.toLowerCase().includes(key));
      });
    });
  }

  displayEntries(filtered);
  displayTopThemes(filtered);
  displayCategories(filtered);
  displayAllThemes();
}

// ===== Actions filtres =====
function toggleCategory(cat) {
  if (activeCategories.includes(cat)) {
    activeCategories = activeCategories.filter(c => c !== cat);
  } else {
    activeCategories.push(cat);
  }
  applyFilters();
}

function toggleTheme(theme) {
  if (activeThemes.includes(theme)) {
    activeThemes = activeThemes.filter(t => t !== theme);
  } else {
    activeThemes.push(theme);
  }
  applyFilters();
}

function clearFilters() {
  activeCategories = [];
  activeThemes = [];
  searchTerm = "";
  const input = document.getElementById('searchInput');
  if (input) input.value = "";
  applyFilters();
}

// ===== Exports =====
function downloadURL(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportJSONAll() {
  const dataStr = JSON.stringify(sites, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, 'bottin-annuaire-2025.json');
}

function exportDatasJS(format = 'compact') {
  const header = '// datas.js généré\n';
  let sitesStr = '';
  if (format === 'compact') {
    sitesStr = 'const sites = [\n' + sites.map(s => JSON.stringify(s)).join(',\n') + '\n];\n';
  } else {
    sitesStr = 'const sites = ' + JSON.stringify(sites, null, 2) + ';\n';
  }
  const fullStr = header + sitesStr;
  const blob = new Blob([fullStr], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, `datas-${format}.js`);
}

function exportTopThemesAuto() {
  const counts = {};
  sites.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const genTopThemes = sorted.map(([cat, count]) => ({
    theme: cat,
    count: count,
    description: `Thématique regroupant ${count} organisations dans la catégorie ${cat}.`
  }));
  const header = '// toptheme.js généré automatiquement depuis datas.js\n';
  const content = header + 'window.TOP_THEMES = ' + JSON.stringify(genTopThemes, null, 2) + ';';
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, 'toptheme.js');
}

// ===== Changement de thème CSS =====
function changeTheme(themeName) {
  document.body.className = themeName;
  localStorage.setItem('selectedTheme', themeName);
}

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Initialisation de l'application...");
  
  // 1. Restaurer le thème sauvegardé
  const savedTheme = localStorage.getItem('selectedTheme') || 'theme-dark';
  document.body.className = savedTheme;
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
  }

  // 2. Garantir les entrées par défaut
  ensureDefaultEntries();
  
  // 3. Recherche
  const input = document.getElementById('searchInput');
  if (input) {
    let t;
    input.addEventListener('input', (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        searchTerm = e.target.value.toLowerCase().trim();
        applyFilters();
      }, 250);
    });
  }

  // 4. Boutons
  const btnClear = document.getElementById('btnClearFilters');
  if (btnClear) btnClear.addEventListener('click', clearFilters);

  const btnExportJSON = document.getElementById('btnExportJSON');
  if (btnExportJSON) btnExportJSON.addEventListener('click', exportJSONAll);

  const btnExportDatasJS = document.getElementById('btnExportDatasJS');
  if (btnExportDatasJS) {
    btnExportDatasJS.addEventListener('click', () => {
      const formatSel = document.getElementById('datasFormatSelect');
      const format = formatSel ? formatSel.value : 'compact';
      exportDatasJS(format);
    });
  }

  const btnExportTopThemes = document.getElementById('btnExportTopThemes');
  if (btnExportTopThemes) btnExportTopThemes.addEventListener('click', exportTopThemesAuto);

  // 5. Import JSON (NOUVEAU)
  const jsonFileInput = document.getElementById('jsonFileInput');
  if (jsonFileInput) {
    jsonFileInput.addEventListener('change', importJSON);
  }

  const btnImportJSON = document.getElementById('btnImportJSON');
  if (btnImportJSON) {
    btnImportJSON.addEventListener('click', () => {
      jsonFileInput.click();
    });
  }

  // 6. Affichage initial
  applyFilters();
  
  console.log("✅ Application initialisée!");
});

// Exposer les fonctions globales
window.toggleCategory = toggleCategory;
window.toggleTheme = toggleTheme;