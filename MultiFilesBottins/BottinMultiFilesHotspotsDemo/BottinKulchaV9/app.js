let activeCategories = [];
let activeThemes = [];
let searchTerm = "";

// ===== Entrées =====
function displayEntries(list) {
  const container = document.getElementById('entriesContainer');
  container.innerHTML = list.map(site => `
    <div class="entry-card">
      <div class="entry-header">
        <div class="entry-title">${site.n}</div>
        <div class="entry-category">${site.c}</div>
      </div>
      <div class="entry-description">${site.d || ""}</div>
      <a href="${site.u}" target="_blank" class="entry-url">Visiter</a>
    </div>
  `).join('');
}

// ===== Top 10 Thématiques =====
function displayTopThemes(list) {
  const container = document.getElementById('themesTop10');
  const counts = {};
  list.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // toujours 10 max
  container.innerHTML = sorted.map(([theme, count], i) => `
    <div class="theme-card">
      <div class="theme-rank">${i+1}</div>
      <h3>${theme}</h3>
      <p>${count} organisations</p>
    </div>
  `).join('');
}

// ===== Catégories =====
function displayCategories(list) {
  const container = document.getElementById('categoriesContainer');
  const counts = {};
  list.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  container.innerHTML = sorted.map(([cat, count]) => `
    <div class="category-item">${cat} (${count})</div>
  `).join('');
}

// ===== Toutes les Thématiques =====
function displayAllThemes() {
  const container = document.getElementById('allThemesContainer');
  container.innerHTML = topThemes.map(t => `
    <div class="theme-card">
      <h3>${t.theme}</h3>
      <p>${t.count} organisations</p>
      <p>${t.description}</p>
    </div>
  `).join('');
}

// ===== Application des filtres =====
function applyFilters() {
  let filtered = sites;
  displayEntries(filtered);
  displayTopThemes(filtered);
  displayCategories(filtered);
  displayAllThemes();
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
    sitesStr = 'const sites = [\n' + sites.map(s => JSON.stringify(s)).join('\n') + '\n];\n';
  } else {
    sitesStr = 'const sites = ' + JSON.stringify(sites, null, 2) + ';\n';
  }

  const fullStr = header + sitesStr;
  const blob = new Blob([fullStr], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, `datas-${format}.js`);
}

function exportTopThemes() {
  const counts = {};
  sites.forEach(s => { if (s.c) counts[s.c] = (counts[s.c] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topThemes = sorted.map(([cat, count]) => ({
    theme: cat,
    count: count,
    description: `Thématique regroupant ${count} organisations dans la catégorie ${cat}.`
  }));
  const header = '// topThemes.js généré\n';
  const content = header + 'const topThemes = ' + JSON.stringify(topThemes, null, 2) + ';';
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  downloadURL(url, 'toptheme.js');
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

document.addEventListener('DOMContentLoaded', () => {
  applyFilters();
  document.getElementById('btnExportJSON').addEventListener('click', exportJSONAll);
  document.getElementById('btnExportDatasJS').addEventListener('click', () => {
    const format = document.getElementById('datasFormatSelect').value;
    exportDatasJS(format);
  });
  document.getElementById('btnExportTopThemes').addEventListener('click', exportTopThemes);
});
