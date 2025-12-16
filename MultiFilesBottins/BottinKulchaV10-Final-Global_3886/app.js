// État des filtres
let activeCategories = [];
let activeThemes = [];
let searchTerm = "";

// Mapping thématique -> catégories
const THEME_MAP = {
  "Wi-Fi Gratuit": ["Wi-Fi Gratuit", "Public Wi-Fi"],
  "FAI Hotspot": ["FAI Hotspot", "FAI", "Provider"],
  "Hotspots Mondiaux": ["Hotspots Mondiaux", "Global Wi-Fi"],
  "Coworking": ["Coworking", "Espace de travail", "Bureau"],
  "Mobile": ["Mobile", "Cellulaire", "Opérateur mobile"],
  "Tech Innovation": ["Technologie", "Innovation", "Tech", "Startup"],
  "Éducation & Formation": ["Éducation", "Formation", "Université", "Campus", "Lycée"],
  "Commerce & Entreprises": ["Commerce", "Entreprises", "Business", "Économie"],
  "Culture & Arts": ["Culture", "Arts", "Musée", "Cinéma", "Théâtre", "Festival", "Savante"],
  "Technologie & Innovation": ["Technologie", "Innovation", "Informatique", "Startups", "French Tech"],
  "Diplomatie & Relations Internationales": ["Diplomatie", "Gouvernement", "International", "Coopération"],
  "Médias & Communication": ["Médias", "Presse", "Communication", "Radio", "Télévision"],
  "Santé & Médecine": ["Santé", "Médecine", "Pharmaceutique"],
  "Tourisme & Hôtellerie": ["Tourisme", "Hôtellerie", "Hébergement"],
  "Finance & Économie": ["Finance", "Assurance", "Banque", "Économie"],
  "Recherche & Développement": ["Recherche", "Développement"],
  "Transport & Logistique": ["Transport", "Logistique", "Aéronautique", "Spatial"],
  "Mode & Luxe": ["Mode", "Luxe", "Beauté", "Parfum", "Horlogerie", "Bijoux", "Lingerie"],
  "Agriculture & Agroalimentaire": ["Agriculture", "Agroalimentaire", "Vin", "Spiritueux"],
  "Écologie & Développement Durable": ["Écologie", "Environnement", "Développement", "Énergie"],
  "Industrie & Ingénierie": ["Industrie", "Ingénierie", "Construction", "BTP", "Architecture", "Design"],
  "Humanitaire & Solidarité": ["Humanitaire", "Association"],
  "Arts Culinaires & Gastronomie": ["Gastronomie"],
  "Sport & Loisirs": ["Sport", "Loisirs"],
  "Édition & Librairie": ["Édition", "Librairie", "Littérature"],
  "Droit & Conseil": ["Droit", "Conseil"],
  "Artisanat & Métiers d'Art": ["Artisanat", "Art de la table"],
  "Jeux & Divertissement": ["Jeux Vidéo", "Jouets"],
  "Nautisme & Marine": ["Nautisme"],
  "Spatial & Aéronautique": ["Spatial", "Aéronautique"]
};

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
        const cats = THEME_MAP[themeName];
        if (Array.isArray(cats)) {
          return cats.includes(s.c);
        }
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
  // Restaurer le thème sauvegardé
  const savedTheme = localStorage.getItem('selectedTheme') || 'theme-dark';
  document.body.className = savedTheme;
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.value = savedTheme;
    themeSelect.addEventListener('change', (e) => {
      changeTheme(e.target.value);
    });
  }

  // Recherche
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

  // Boutons
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

  // Affichage initial
  applyFilters();
});

// Expose pour onclick inline
window.toggleCategory = toggleCategory;
window.toggleTheme = toggleTheme;