// =============================================================================
// BOTTIN ANNUAIRE WEB LIBRE 2025 - APP.JS VERSION FINALE 20.1
// Version : 20.1 - Édition complète avec 21 thèmes
// =============================================================================

// ===== CONFIGURATION =====
const CONFIG = {
    appName: "Bottin Annuaire Web Libre 2025",
    version: "20.1",
    defaultTheme: "theme-original",
    storageKey: "bottinData_v20_final",
    defaultEntries: [
        {
            n: "Constitutions Kulchatila",
            c: "Constitution",
            d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
            u: "https://libresol2-5jaz4b32.manus.space",
            date: "2025",
            id: "default-1",
            isDefault: true
        },
        {
            n: "Constitutions LMBMicro", 
            c: "Constitution",
            d: "Constitution des Communes Libres et Solidaires : Découvrez les différentes versions de notre projet constitutionnel innovant",
            u: "https://libresol2-5jaz4b32.manus.space",
            date: "2025",
            id: "default-2",
            isDefault: true
        }
    ]
};

// ===== ÉTAT GLOBAL =====
let state = {
    sites: [],
    activeCategories: [],
    activeThemes: [],
    searchTerm: "",
    currentTheme: CONFIG.defaultTheme,
    currentSort: "name-asc",
    editingId: null
};

// ===== INITIALISATION =====
function initializeApp() {
    console.log(`🚀 ${CONFIG.appName} v${CONFIG.version}`);
    loadData();
    setupTheme();
    setupEventListeners();
    applyFilters();
    updateStatistics();
    console.log("✅ Application initialisée avec succès");
}

// ===== GESTION DES DONNÉES =====
function loadData() {
    try {
        const savedData = localStorage.getItem(CONFIG.storageKey);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            state.sites = Array.isArray(parsedData) ? parsedData : [];
            console.log(`📂 ${state.sites.length} entrées depuis localStorage`);
            
            state.sites.forEach((site, index) => {
                if (!site.id) site.id = `entry-${Date.now()}-${index}`;
                if (!site.date) site.date = "2025";
            });
        }
        
        if (state.sites.length === 0) {
            loadExternalOrDefault();
        } else {
            ensureDefaultEntries();
        }
        
        applyFilters();
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
        state.sites = [...CONFIG.defaultEntries];
        applyFilters();
    }
}

function loadExternalOrDefault() {
    try {
        if (typeof window.sites !== 'undefined' && Array.isArray(window.sites)) {
            console.log("✅ datas.js détecté");
            
            state.sites = window.sites.map((site, index) => ({
                n: site.n || site.name || `Entrée ${index + 1}`,
                u: site.u || site.url || "#",
                c: site.c || site.category || "Non catégorisé",
                d: site.d || site.description || "",
                date: site.date || "2025",
                id: `imported-${Date.now()}-${index}`,
                isDefault: false
            }));
        } else {
            console.log("⚠️ datas.js non détecté, données par défaut");
            state.sites = [...CONFIG.defaultEntries];
        }
        
        ensureDefaultEntries();
        saveToLocalStorage();
        
    } catch (error) {
        console.error("❌ Erreur lors du chargement externe:", error);
        state.sites = [...CONFIG.defaultEntries];
    }
}

function ensureDefaultEntries() {
    CONFIG.defaultEntries.forEach(defaultEntry => {
        const exists = state.sites.some(s => 
            s.n === defaultEntry.n && s.u === defaultEntry.u
        );
        
        if (!exists) {
            state.sites.push({
                ...defaultEntry,
                id: `default-${Date.now()}-${state.sites.length}`
            });
        } else {
            const existingIndex = state.sites.findIndex(s => 
                s.n === defaultEntry.n && s.u === defaultEntry.u
            );
            if (existingIndex !== -1) {
                state.sites[existingIndex].isDefault = true;
            }
        }
    });
}

function saveToLocalStorage() {
    try {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.sites));
        console.log("💾 Données sauvegardées dans localStorage");
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde:", error);
        showMessage("Erreur lors de la sauvegarde des données", "error");
    }
}

// ===== GESTION DU THÈME =====
function setupTheme() {
    try {
        const savedTheme = localStorage.getItem('selectedTheme') || CONFIG.defaultTheme;
        state.currentTheme = savedTheme;
        document.body.className = savedTheme;
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = savedTheme;
        
        console.log(`🎨 Thème appliqué: ${savedTheme}`);
    } catch (error) {
        console.error("❌ Erreur lors du chargement du thème:", error);
        document.body.className = CONFIG.defaultTheme;
    }
}

function changeTheme(themeName) {
    try {
        state.currentTheme = themeName;
        document.body.className = themeName;
        localStorage.setItem('selectedTheme', themeName);
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) themeSelect.value = themeName;
        
        const themeDisplayName = themeName.replace('theme-', '').replace(/-/g, ' ');
        showMessage(`Thème activé: ${themeDisplayName}`, "success");
        console.log(`🎨 Thème changé: ${themeName}`);
        
    } catch (error) {
        console.error("❌ Erreur lors du changement de thème:", error);
        showMessage("Erreur lors du changement de thème", "error");
    }
}

function resetTheme() {
    changeTheme(CONFIG.defaultTheme);
}

// ===== AFFICHAGE DES ENTREES =====
function displayEntries(list) {
    const container = document.getElementById('entriesContainer');
    const total = list.length;
    
    document.getElementById('filteredCount').textContent = total;
    const filteredCountBadge = document.getElementById('filteredCountBadge');
    if (filteredCountBadge) {
        filteredCountBadge.textContent = `${total} entrée${total !== 1 ? 's' : ''}`;
    }
    
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
    
    const defaultEntries = list.filter(s => s.isDefault === true);
    const otherEntries = list.filter(s => !s.isDefault);
    
    const sortedOther = sortEntries(otherEntries);
    const combinedEntries = [...defaultEntries, ...sortedOther];
    
    container.innerHTML = combinedEntries.map((site, index) => {
        const displayDate = site.date || "2025";
        const theme = getThemeForCategory(site.c);
        
        return `
            <div class="entry-card" data-id="${site.id}">
                <div class="entry-header">
                    <div class="entry-title">${escapeHTML(site.n)}</div>
                    <div class="entry-category">${escapeHTML(site.c)}</div>
                </div>
                <div class="entry-description">${escapeHTML(site.d || "Pas de description disponible")}</div>
                <a href="${validateURL(site.u)}" target="_blank" rel="noopener noreferrer" class="entry-url">
                    <i class="fas fa-link"></i> ${escapeHTML(truncateURL(site.u, 45))}
                </a>
                <div class="entry-meta">
                    <span>${escapeHTML(theme)}</span>
                    <span>${escapeHTML(displayDate)}</span>
                </div>
                <div class="entry-actions">
                    <button class="btn-small" onclick="editEntry('${site.id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteEntry('${site.id}')">
                        <i class="fas fa-trash-alt"></i> Supprimer
                    </button>
                </div>
                ${site.isDefault ? '<div class="entry-star">⭐</div>' : ''}
            </div>
        `;
    }).join('');
    
    updateActiveFilters();
}

// ===== TRI DES ENTREES =====
function sortEntries(list) {
    const sorted = [...list];
    
    switch(state.currentSort) {
        case 'name-asc':
            return sorted.sort((a, b) => a.n.localeCompare(b.n, 'fr', { sensitivity: 'base' }));
        case 'name-desc':
            return sorted.sort((a, b) => b.n.localeCompare(a.n, 'fr', { sensitivity: 'base' }));
        case 'category-asc':
            return sorted.sort((a, b) => a.c.localeCompare(b.c, 'fr', { sensitivity: 'base' }) || a.n.localeCompare(b.n, 'fr', { sensitivity: 'base' }));
        case 'category-desc':
            return sorted.sort((a, b) => b.c.localeCompare(a.c, 'fr', { sensitivity: 'base' }) || b.n.localeCompare(a.n, 'fr', { sensitivity: 'base' }));
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

// ===== TOP 10 DES THÉMATIQUES =====
function displayTopThemes(list) {
    const container = document.getElementById('themesTop10');
    
    const counts = {};
    list.forEach(site => {
        if (site.c && site.c.trim()) {
            const category = site.c.trim();
            counts[category] = (counts[category] || 0) + 1;
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
        return `
            <div class="theme-card" onclick="toggleThemeFilter('${escapeHTML(theme)}')">
                <div class="theme-header">
                    <div class="theme-rank">${index + 1}</div>
                    <h3>${escapeHTML(category)}</h3>
                </div>
                <p class="theme-count">${count} organisation${count !== 1 ? 's' : ''}</p>
                <p class="theme-desc">Thème: ${theme}</p>
                <button class="btn btn-secondary" onclick="event.stopPropagation();toggleCategory('${escapeHTML(category)}')">
                    <i class="fas fa-filter"></i> Filtrer
                </button>
            </div>
        `;
    }).join('');
}

// ===== AFFICHAGE DES CATÉGORIES =====
function displayCategories(list) {
    const container = document.getElementById('categoriesContainer');
    
    const counts = {};
    list.forEach(site => {
        if (site.c && site.c.trim()) {
            const category = site.c.trim();
            counts[category] = (counts[category] || 0) + 1;
        }
    });
    
    const sorted = Object.entries(counts).sort((a, b) => 
        a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' })
    );
    
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

// ===== AFFICHAGE DES THÉMATIQUES =====
function displayAllThemes(list) {
    const container = document.getElementById('allThemesContainer');
    
    const themeCounts = {};
    list.forEach(site => {
        const theme = getThemeForCategory(site.c);
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });
    
    const sorted = Object.entries(themeCounts).sort((a, b) => 
        a[0].localeCompare(b[0], 'fr', { sensitivity: 'base' })
    );
    
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

// ===== FILTRES ET RECHERCHE =====
function applyFilters() {
    try {
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
        
        console.log(`🔍 ${filtered.length} entrées après filtrage`);
        
    } catch (error) {
        console.error("❌ Erreur lors de l'application des filtres:", error);
        showMessage("Erreur lors du filtrage des données", "error");
    }
}

function toggleCategory(category) {
    try {
        const index = state.activeCategories.indexOf(category);
        if (index > -1) {
            state.activeCategories.splice(index, 1);
            showMessage(`Filtre "${category}" désactivé`, "info");
        } else {
            state.activeCategories.push(category);
            showMessage(`Filtre "${category}" activé`, "success");
        }
        applyFilters();
    } catch (error) {
        console.error("❌ Erreur lors du toggle de catégorie:", error);
    }
}

function toggleThemeFilter(theme) {
    try {
        const index = state.activeThemes.indexOf(theme);
        if (index > -1) {
            state.activeThemes.splice(index, 1);
            showMessage(`Thème "${theme}" désactivé`, "info");
        } else {
            state.activeThemes.push(theme);
            showMessage(`Thème "${theme}" activé`, "success");
        }
        applyFilters();
    } catch (error) {
        console.error("❌ Erreur lors du toggle de thème:", error);
    }
}

function clearFilters() {
    try {
        state.activeCategories = [];
        state.activeThemes = [];
        state.searchTerm = "";
        state.currentSort = "name-asc";
        
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        const advancedSearch = document.getElementById('advancedSearch');
        
        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "name-asc";
        if (advancedSearch) advancedSearch.classList.remove('show');
        
        applyFilters();
        showMessage("Tous les filtres ont été réinitialisés", "success");
        console.log("🔄 Filtres réinitialisés");
        
    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation des filtres:", error);
        showMessage("Erreur lors de la réinitialisation", "error");
    }
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    if (!container) return;
    
    const filters = [];
    
    if (state.searchTerm) {
        filters.push({
            text: `Recherche: "${state.searchTerm}"`,
            remove: () => {
                state.searchTerm = '';
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                applyFilters();
            }
        });
    }
    
    state.activeCategories.forEach(cat => {
        filters.push({
            text: `Catégorie: ${cat}`,
            remove: () => {
                const index = state.activeCategories.indexOf(cat);
                if (index > -1) state.activeCategories.splice(index, 1);
                applyFilters();
            }
        });
    });
    
    state.activeThemes.forEach(theme => {
        filters.push({
            text: `Thème: ${theme}`,
            remove: () => {
                const index = state.activeThemes.indexOf(theme);
                if (index > -1) state.activeThemes.splice(index, 1);
                applyFilters();
            }
        });
    });
    
    container.innerHTML = filters.map(filter => `
        <div class="filter-tag">
            <span>${escapeHTML(filter.text)}</span>
            <span class="remove" onclick="(${filter.remove})()">×</span>
        </div>
    `).join('');
}

// ===== STATISTIQUES =====
function updateStatistics() {
    try {
        const total = state.sites.length;
        const categories = new Set(state.sites.map(s => s.c).filter(Boolean)).size;
        const themes = new Set(state.sites.map(s => getThemeForCategory(s.c)).filter(Boolean)).size;
        
        const statTotal = document.getElementById('statTotal');
        const statCategories = document.getElementById('statCategories');
        const statThemes = document.getElementById('statThemes');
        
        if (statTotal) statTotal.textContent = total;
        if (statCategories) statCategories.textContent = categories;
        if (statThemes) statThemes.textContent = themes;
        
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour des statistiques:", error);
    }
}

// ===== GESTION DES ENTREES (CRUD) =====
function showAddEntryModal() {
    try {
        state.editingId = null;
        
        const form = document.getElementById('entryForm');
        if (form) form.reset();
        
        const modalTitle = document.getElementById('modalTitle');
        const saveButton = document.getElementById('saveEntry');
        
        if (modalTitle) modalTitle.textContent = '➕ Ajouter une nouvelle entrée';
        if (saveButton) {
            saveButton.textContent = 'Ajouter';
            saveButton.onclick = saveEntry;
        }
        
        const modal = document.getElementById('addEntryModal');
        if (modal) modal.classList.add('show');
        
        setTimeout(() => {
            const nameInput = document.getElementById('entryName');
            if (nameInput) nameInput.focus();
        }, 100);
        
    } catch (error) {
        console.error("❌ Erreur lors de l'ouverture de la modale:", error);
        showMessage("Erreur lors de l'ouverture du formulaire", "error");
    }
}

function editEntry(id) {
    try {
        const entry = state.sites.find(s => s.id === id);
        if (!entry) {
            showMessage("Entrée non trouvée", "error");
            return;
        }
        
        state.editingId = id;
        
        document.getElementById('entryName').value = entry.n || '';
        document.getElementById('entryCategory').value = entry.c || '';
        document.getElementById('entryDescription').value = entry.d || '';
        document.getElementById('entryUrl').value = entry.u || '';
        document.getElementById('entryDate').value = entry.date || '2025';
        
        const modalTitle = document.getElementById('modalTitle');
        const saveButton = document.getElementById('saveEntry');
        
        if (modalTitle) modalTitle.textContent = '✏️ Modifier l\'entrée';
        if (saveButton) {
            saveButton.textContent = 'Modifier';
            saveButton.onclick = saveEntry;
        }
        
        const modal = document.getElementById('addEntryModal');
        if (modal) modal.classList.add('show');
        
        setTimeout(() => {
            const nameInput = document.getElementById('entryName');
            if (nameInput) nameInput.focus();
        }, 100);
        
        showMessage(`Édition de "${entry.n}"`, "info");
        
    } catch (error) {
        console.error("❌ Erreur lors de l'édition de l'entrée:", error);
        showMessage("Erreur lors de l'édition", "error");
    }
}

function saveEntry() {
    try {
        const name = document.getElementById('entryName').value.trim();
        const category = document.getElementById('entryCategory').value.trim() || "Non catégorisé";
        const description = document.getElementById('entryDescription').value.trim();
        const url = document.getElementById('entryUrl').value.trim();
        const dateInput = document.getElementById('entryDate').value.trim();
        
        if (!name) {
            showMessage("Le nom de l'organisation est requis", "error");
            return;
        }
        
        if (!url) {
            showMessage("L'URL est requise", "error");
            return;
        }
        
        if (!validateURLFormat(url)) {
            showMessage("L'URL doit commencer par http:// ou https://", "error");
            return;
        }
        
        const date = dateInput || "2025";
        
        if (state.editingId) {
            const entryIndex = state.sites.findIndex(s => s.id === state.editingId);
            if (entryIndex === -1) {
                showMessage("Entrée non trouvée", "error");
                return;
            }
            
            const duplicate = state.sites.some((s, index) => 
                index !== entryIndex && 
                s.n.toLowerCase() === name.toLowerCase() && 
                s.u.toLowerCase() === url.toLowerCase()
            );
            
            if (duplicate) {
                showMessage("Une entrée avec le même nom et URL existe déjà", "warning");
                return;
            }
            
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
            
            showMessage(`"${name}" a été modifié avec succès`, "success");
            console.log(`✏️ Entrée modifiée: ${name}`);
            
        } else {
            const duplicate = state.sites.some(s => 
                s.n.toLowerCase() === name.toLowerCase() && 
                s.u.toLowerCase() === url.toLowerCase()
            );
            
            if (duplicate) {
                showMessage("Cette entrée existe déjà", "warning");
                return;
            }
            
            const newEntry = {
                n: name,
                c: category,
                d: description,
                u: url,
                date: date,
                id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                isDefault: false
            };
            
            state.sites.push(newEntry);
            saveToLocalStorage();
            applyFilters();
            hideAddEntryModal();
            
            showMessage(`"${name}" a été ajouté avec succès`, "success");
            console.log(`➕ Nouvelle entrée ajoutée: ${name}`);
        }
        
    } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde de l'entrée:", error);
        showMessage("Erreur lors de la sauvegarde", "error");
    }
}

function deleteEntry(id) {
    try {
        const entry = state.sites.find(s => s.id === id);
        if (!entry) {
            showMessage("Entrée non trouvée", "error");
            return;
        }
        
        if (entry.isDefault) {
            showMessage("Les entrées par défaut ne peuvent pas être supprimées", "warning");
            return;
        }
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${entry.n}" ?`)) {
            state.sites = state.sites.filter(s => s.id !== id);
            saveToLocalStorage();
            applyFilters();
            
            showMessage(`"${entry.n}" a été supprimé`, "info");
            console.log(`🗑️ Entrée supprimée: ${entry.n}`);
        }
        
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'entrée:", error);
        showMessage("Erreur lors de la suppression", "error");
    }
}

function hideAddEntryModal() {
    try {
        const modal = document.getElementById('addEntryModal');
        if (modal) modal.classList.remove('show');
        
        state.editingId = null;
        
        const form = document.getElementById('entryForm');
        if (form) form.reset();
        
    } catch (error) {
        console.error("❌ Erreur lors de la fermeture de la modale:", error);
    }
}

// ===== IMPORT/EXPORT =====
function importJSON(event) {
    try {
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
                let skipped = 0;
                
                data.forEach(item => {
                    if (item && (item.n || item.name) && (item.u || item.url)) {
                        const name = item.n || item.name || "";
                        const url = item.u || item.url || "";
                        
                        if (!validateURLFormat(url)) {
                            console.warn(`URL invalide pour "${name}": ${url}`);
                            skipped++;
                            return;
                        }
                        
                        const newEntry = {
                            n: name.toString().trim(),
                            u: url.toString().trim(),
                            c: (item.c || item.category || "Non catégorisé").toString().trim(),
                            d: (item.d || item.description || "").toString().trim(),
                            date: item.date || "2025",
                            id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            isDefault: false
                        };
                        
                        const exists = state.sites.some(s => 
                            s.n.toLowerCase() === newEntry.n.toLowerCase() && 
                            s.u.toLowerCase() === newEntry.u.toLowerCase()
                        );
                        
                        if (!exists) {
                            state.sites.push(newEntry);
                            added++;
                        } else {
                            skipped++;
                        }
                    } else {
                        skipped++;
                    }
                });
                
                ensureDefaultEntries();
                
                if (added > 0) {
                    saveToLocalStorage();
                    applyFilters();
                    showMessage(`${added} entrée(s) importée(s) (${skipped} ignorée(s))`, "success");
                    console.log(`📥 Import: ${added} ajoutées, ${skipped} ignorées`);
                } else {
                    showMessage("Aucune nouvelle entrée à importer", "info");
                }
                
            } catch (error) {
                console.error("❌ Erreur lors du parsing JSON:", error);
                showMessage("Erreur lors de la lecture du fichier JSON", "error");
            }
        };
        
        reader.onerror = function() {
            showMessage("Erreur lors de la lecture du fichier", "error");
        };
        
        reader.readAsText(file);
        
        event.target.value = "";
        
    } catch (error) {
        console.error("❌ Erreur lors de l'import:", error);
        showMessage("Erreur lors de l'import", "error");
    }
}

function exportJSON() {
    try {
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage("Export JSON terminé avec succès", "success");
        console.log("📤 Export JSON réalisé");
        
    } catch (error) {
        console.error("❌ Erreur lors de l'export JSON:", error);
        showMessage("Erreur lors de l'export", "error");
    }
}

function exportDatasJS() {
    try {
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
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage("Export datas.js terminé avec succès", "success");
        console.log("📤 Export datas.js réalisé");
        
    } catch (error) {
        console.error("❌ Erreur lors de l'export datas.js:", error);
        showMessage("Erreur lors de l'export", "error");
    }
}

function exportTopThemes() {
    try {
        const counts = {};
        state.sites.forEach(s => {
            if (s.c) counts[s.c] = (counts[s.c] || 0) + 1;
        });
        
        const themes = Object.entries(counts)
            .map(([theme, count]) => ({ 
                theme, 
                count, 
                description: `${count} organisation${count !== 1 ? 's' : ''}` 
            }))
            .sort((a, b) => b.count - a.count);
        
        const content = `// toptheme.js - Thématiques principales\nwindow.TOP_THEMES = ${JSON.stringify(themes, null, 2)};`;
        
        const blob = new Blob([content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'toptheme.js';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage("Export toptheme.js terminé avec succès", "success");
        console.log("📤 Export toptheme.js réalisé");
        
    } catch (error) {
        console.error("❌ Erreur lors de l'export toptheme.js:", error);
        showMessage("Erreur lors de l'export", "error");
    }
}

function exportFullInfoJSON() {
    try {
        const allData = {
            metadata: {
                app: CONFIG.appName,
                version: CONFIG.version,
                exportDate: new Date().toISOString(),
                totalEntries: state.sites.length,
                categories: [...new Set(state.sites.map(s => s.c).filter(Boolean))].length,
                themes: [...new Set(state.sites.map(s => getThemeForCategory(s.c)).filter(Boolean))].length
            },
            entries: state.sites.map(s => ({
                name: s.n,
                url: s.u,
                category: s.c,
                description: s.d || "",
                date: s.date || "2025",
                theme: getThemeForCategory(s.c),
                isDefault: s.isDefault || false,
                metadata: {
                    id: s.id,
                    added: new Date().toISOString()
                }
            })),
            statistics: {
                byCategory: getCountsByCategory(),
                byTheme: getCountsByTheme(),
                byYear: getCountsByYear()
            }
        };
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bottin-complet-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage("Export complet JSON terminé avec succès", "success");
        console.log("📤 Export complet JSON réalisé");
        
    } catch (error) {
        console.error("❌ Erreur lors de l'export complet:", error);
        showMessage("Erreur lors de l'export", "error");
    }
}

function downloadAllData() {
    exportFullInfoJSON();
}

function resetAllData() {
    try {
        if (confirm("Êtes-vous sûr de vouloir supprimer toutes les données ajoutées ?\n\n⚠️ Seules les entrées par défaut seront conservées.\nCette action est irréversible.")) {
            state.sites = [...CONFIG.defaultEntries];
            saveToLocalStorage();
            applyFilters();
            
            showMessage("Toutes les données ont été réinitialisées", "success");
            console.log("🔄 Données réinitialisées");
        }
    } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation des données:", error);
        showMessage("Erreur lors de la réinitialisation", "error");
    }
}

// ===== FONCTIONS UTILITAIRES =====
function getThemeForCategory(category) {
    if (!category || category === "Non catégorisé") return "Autre";
    
    const categoryLower = category.toLowerCase();
    
    const themeMap = {
        "constitution": "Constitution",
        "gouvernance": "Gouvernance",
        "droit": "Constitution",
        "loi": "Constitution",
        "technologie": "Technologie",
        "informatique": "Technologie",
        "développement": "Technologie",
        "programmation": "Technologie",
        "éducation": "Éducation",
        "formation": "Éducation",
        "université": "Éducation",
        "école": "Éducation",
        "culture": "Culture",
        "arts": "Culture",
        "musique": "Culture",
        "littérature": "Culture",
        "écologie": "Écologie",
        "environnement": "Écologie",
        "climat": "Écologie",
        "développement durable": "Écologie",
        "santé": "Santé",
        "médecine": "Santé",
        "bien-être": "Santé",
        "soins": "Santé",
        "économie": "Économie",
        "finance": "Économie",
        "business": "Économie",
        "commerce": "Économie",
        "social": "Social",
        "communauté": "Social",
        "association": "Social",
        "solidarité": "Social",
        "science": "Science",
        "recherche": "Science",
        "innovation": "Science",
        "sport": "Sport",
        "loisir": "Sport",
        "activité physique": "Sport",
        "média": "Média",
        "presse": "Média",
        "communication": "Média",
        "journalisme": "Média"
    };
    
    return themeMap[categoryLower] || "Autre";
}

function getCountsByCategory() {
    const counts = {};
    state.sites.forEach(site => {
        const category = site.c || "Non catégorisé";
        counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
}

function getCountsByTheme() {
    const counts = {};
    state.sites.forEach(site => {
        const theme = getThemeForCategory(site.c);
        counts[theme] = (counts[theme] || 0) + 1;
    });
    return counts;
}

function getCountsByYear() {
    const counts = {};
    state.sites.forEach(site => {
        const year = site.date || "2025";
        counts[year] = (counts[year] || 0) + 1;
    });
    return counts;
}

function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function truncateURL(url, maxLength = 45) {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    
    const start = url.substring(0, maxLength / 2);
    const end = url.substring(url.length - maxLength / 3);
    return start + '...' + end;
}

function validateURL(url) {
    if (!url) return '#';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

function validateURLFormat(url) {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
}

function filterByDate(year) {
    try {
        state.searchTerm = year;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = year;
        applyFilters();
        showMessage(`Filtre par année: ${year}`, "info");
    } catch (error) {
        console.error("❌ Erreur lors du filtrage par date:", error);
    }
}

// ===== GESTION DES MESSAGES =====
function showMessage(text, type = "info") {
    try {
        const containerId = 'messageContainer';
        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        
        const messageId = 'msg-' + Date.now();
        const messageElement = document.createElement('div');
        messageElement.id = messageId;
        messageElement.className = `message ${type}`;
        messageElement.style.cssText = `
            transform: translateX(100%);
            opacity: 0;
            pointer-events: auto;
            max-width: 350px;
            min-width: 250px;
            margin: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        
        messageElement.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 10px;">
                <div style="font-size: 1.2rem;">
                    ${icons[type] || '💬'}
                </div>
                <div style="flex: 1;">
                    <p style="margin: 0; line-height: 1.4;">${escapeHTML(text)}</p>
                </div>
                <button onclick="document.getElementById('${messageId}').remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.5rem; padding: 0; margin: -5px 0 0 5px;">
                    ×
                </button>
            </div>
        `;
        
        container.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.style.transform = 'translateX(0)';
            messageElement.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 400);
        }, 5000);
        
        return messageId;
        
    } catch (error) {
        console.error("❌ Erreur lors de l'affichage du message:", error);
    }
}

// ===== GESTION DES ÉVÉNEMENTS =====
function setupEventListeners() {
    try {
        // Recherche
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    state.searchTerm = e.target.value.toLowerCase().trim();
                    applyFilters();
                }, 300);
            });
        }
        
        // Recherche avancée
        const btnAdvancedSearch = document.getElementById('btnAdvancedSearch');
        if (btnAdvancedSearch) {
            btnAdvancedSearch.addEventListener('click', () => {
                const advancedSearch = document.getElementById('advancedSearch');
                if (advancedSearch) {
                    advancedSearch.classList.toggle('show');
                }
            });
        }
        
        // Thème
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                changeTheme(e.target.value);
            });
        }
        
        // Tri
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.currentSort = e.target.value;
                applyFilters();
            });
        }
        
        // Import
        const btnImportJSON = document.getElementById('btnImportJSON');
        const jsonFileInput = document.getElementById('jsonFileInput');
        if (btnImportJSON && jsonFileInput) {
            btnImportJSON.addEventListener('click', () => {
                jsonFileInput.click();
            });
            jsonFileInput.addEventListener('change', importJSON);
        }
        
        // Export
        const btnExportJSON = document.getElementById('btnExportJSON');
        if (btnExportJSON) {
            btnExportJSON.addEventListener('click', exportJSON);
        }
        
        const btnExportDatasJS = document.getElementById('btnExportDatasJS');
        if (btnExportDatasJS) {
            btnExportDatasJS.addEventListener('click', exportDatasJS);
        }
        
        const btnExportTopThemes = document.getElementById('btnExportTopThemes');
        if (btnExportTopThemes) {
            btnExportTopThemes.addEventListener('click', exportTopThemes);
        }
        
        const btnExportFullJSON = document.getElementById('btnExportFullJSON');
        if (btnExportFullJSON) {
            btnExportFullJSON.addEventListener('click', exportFullInfoJSON);
        }
        
        // Boutons
        const btnClearFilters = document.getElementById('btnClearFilters');
        if (btnClearFilters) {
            btnClearFilters.addEventListener('click', clearFilters);
        }
        
        const btnResetTheme = document.getElementById('btnResetTheme');
        if (btnResetTheme) {
            btnResetTheme.addEventListener('click', resetTheme);
        }
        
        const btnAddEntry = document.getElementById('btnAddEntry');
        if (btnAddEntry) {
            btnAddEntry.addEventListener('click', showAddEntryModal);
        }
        
        const btnDownloadAll = document.getElementById('btnDownloadAll');
        if (btnDownloadAll) {
            btnDownloadAll.addEventListener('click', downloadAllData);
        }
        
        const btnResetData = document.getElementById('btnResetData');
        if (btnResetData) {
            btnResetData.addEventListener('click', resetAllData);
        }
        
        // Modale
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', hideAddEntryModal);
        }
        
        const cancelEntry = document.getElementById('cancelEntry');
        if (cancelEntry) {
            cancelEntry.addEventListener('click', hideAddEntryModal);
        }
        
        const saveEntryBtn = document.getElementById('saveEntry');
        if (saveEntryBtn) {
            saveEntryBtn.addEventListener('click', saveEntry);
        }
        
        // Fermer la modale en cliquant à l'extérieur
        const addEntryModal = document.getElementById('addEntryModal');
        if (addEntryModal) {
            addEntryModal.addEventListener('click', (e) => {
                if (e.target.id === 'addEntryModal') {
                    hideAddEntryModal();
                }
            });
        }
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideAddEntryModal();
            }
        });
        
        // Bouton retour en haut
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            window.addEventListener('scroll', () => {
                backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
            });
        }
        
        // Validation en temps réel du formulaire
        const entryUrl = document.getElementById('entryUrl');
        if (entryUrl) {
            entryUrl.addEventListener('blur', function() {
                const url = this.value.trim();
                if (url && !validateURLFormat(url)) {
                    this.style.borderColor = 'var(--color-danger)';
                    this.style.boxShadow = '0 0 0 3px rgba(var(--color-danger-rgb), 0.25)';
                } else {
                    this.style.borderColor = '';
                    this.style.boxShadow = '';
                }
            });
        }
        
        console.log("✅ Événements configurés avec succès");
        
    } catch (error) {
        console.error("❌ Erreur lors de la configuration des événements:", error);
    }
}

// ===== DÉMARRAGE =====
document.addEventListener('DOMContentLoaded', initializeApp);

// ===== FONCTIONS GLOBALES =====
window.toggleCategory = toggleCategory;
window.toggleThemeFilter = toggleThemeFilter;
window.clearFilters = clearFilters;
window.changeTheme = changeTheme;
window.showAddEntryModal = showAddEntryModal;
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.filterByDate = filterByDate;
window.downloadAllData = downloadAllData;
window.resetAllData = resetAllData;
window.exportFullInfoJSON = exportFullInfoJSON;

// =============================================================================
// FIN DU FICHIER APP.JS
// =============================================================================