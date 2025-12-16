// ===== Variables globales =====
let activeCategories = [];
let activeThemes = [];
let searchTerm = "";

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', () => {
  // Stats globales
  document.getElementById('totalCount').textContent = sites.length;
  document.getElementById('categoryCount').textContent = [...new Set(sites.map(s => s.c))].length;
  updateSideStats();

  // Affichage initial
  applyFilters();

  // Recherche
  document.getElementById('searchInput').addEventListener('input', e => {
    searchTerm = e.target.value.toLowerCase();
    applyFilters();
  });

  // Sélecteur de thème CSS
  const themeSel = document.getElementById('themeSelector');
  if (themeSel) {
    themeSel.addEventListener('change', e => {
      document.body.className = e.target.value;
    });
  }

  // Exports
  document.getElementById('btnExportJSON').addEventListener('click', exportJSONAll);
  document.getElementById('btnExportDatasJS').addEventListener('click', () => {
    const format = document.getElementById('datasFormatSelect').value;
    exportDatasJS(format);
  });

  // Bouton Statistiques
  const statsBtn = document.getElementById('btnStats');
  if (statsBtn) {
    statsBtn.addEventListener('click', showStats);
  }
});

// ===== Affichage des entrées =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  container.innerHTML = '';
  list.forEach((site, index) => {
    container.innerHTML += `
      <div class="entry-card fade-in">
        <div class="entry-header">
          <div class="entry-title">${site.n}</div>
          <div class="entry-category">${site.c || "Divers"}</div>
        </div>
        <div class="entry-description">${site.d || ""}</div>
        <a href="${site.u}" target="_blank" class="entry-url">Visiter</a>
      </div>
    `;
    if ((index + 1) % 10 === 0) {
      container.innerHTML += `<div class="back-to-top"><a href="#top">⬆ Retour en haut</a></div>`;
    }
  });
}

// ===== Affichage des catégories =====
function displayCategories(list) {
  const container = document.getElementById('categoriesContainer');
  const counts = {};
  list.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  container.innerHTML = sorted.map(([cat, count]) => `
    <div class="category-item ${activeCategories.includes(cat) ? 'active' : ''}" 
         onclick="toggleCategory('${cat}')">${cat} (${count})</div>
  `).join('');
}

// ===== Affichage du Top 10 thématiques =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  const counts = {};
  list.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  container.innerHTML = sorted.map(([theme, count], i) => `
    <div class="theme-card ${activeThemes.includes(theme) ? 'active' : ''}" 
         onclick="toggleTheme('${theme}')">
      <div class="theme-rank">${i+1}</div>
      <h3>${theme}</h3>
      <p>${count} organisations</p>
    </div>
  `).join('');
}

// ===== Filtres multi-sélection =====
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

// ===== Application des filtres =====
function applyFilters() {
  let filtered = sites;

  // Filtre recherche
  if (searchTerm) {
    filtered = filtered.filter(s =>
      (s.n && s.n.toLowerCase().includes(searchTerm)) ||
      (s.d && s.d.toLowerCase().includes(searchTerm)) ||
      (s.c && s.c.toLowerCase().includes(searchTerm))
    );
  }

  // Filtre catégories
  if (activeCategories.length > 0) {
    filtered = filtered.filter(s => activeCategories.includes(s.c));
  }

  // Filtre thématiques
  if (activeThemes.length > 0) {
    filtered = filtered.filter(s => activeThemes.includes(s.c));
  }

  displayEntries(filtered);
  displayCategories(filtered);
  displayTopThemes(filtered);
}

// ===== Stats =====
function updateSideStats() {
  const total = sites.length;
  const categories = new Set(sites.map(s => s.c).filter(Boolean)).size;
  document.getElementById('sideTotalCount').textContent = total;
  document.getElementById('sideCategoryCount').textContent = categories;
}

function showStats() {
  const total = sites.length;
  const categories = new Set(sites.map(s => s.c).filter(Boolean)).size;
  alert(`📊 Statistiques globales:\n\nOrganisations: ${total}\nCatégories: ${categories}`);
}

// ===== Exports =====
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
    sitesStr = 'window.sites = [\n' + sites.map(s => JSON.stringify(s)).join('\n') + '\n];\n';
  } else {
    sitesStr = 'window.sites = ' + JSON.stringify(sites, null, 2) + ';\n';
  }

  const fullStr = header + sitesStr;
  const blob = new Blob([fullStr], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, `datas-${format}.js`);
}

function downloadURL(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
