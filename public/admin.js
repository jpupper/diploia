// ═══════════════════════════════════════════════════════════════
//  DIPLOIA ADMIN - JavaScript Client
// ═══════════════════════════════════════════════════════════════

// Centralized API Configuration
const API_BASE_URL = 'https://vps-4455523-x.dattaweb.com/diploia';

// Detect base URL (prioritize VPS URL if not on localhost)
const BASE_PATH = (() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        return (parts.length > 0) ? '/' + parts[0] : '/diploia';
    }
    return API_BASE_URL;
})();

const API = BASE_PATH + '/api';

// ═══════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════
let nodesData = { nodes: {}, categories: [], categoryChildren: {}, config: {} };
let rankingData = { rankings: [] };
let spaceConfigData = {};
let editingNodeId = null;
let currentSecondaryTags = []; // Store IDs for the tag picker

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    initButtons();
    initTagPicker(); // New
    initConnSearch(); // New
    loadAllData();
});

// ═══════════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════════
function initNavigation() {
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }
}

function switchSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (navItem) navItem.classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById('section-' + sectionId);
    if (section) section.classList.add('active');

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'categories': 'Categorías',
        'nodes': 'Nodos',
        'connections': 'Conexiones',
        'ranking': 'Ranking',
        'config': 'Configuración Mapa',
        'space-config': 'Configuración Espacio',
        'import-export': 'Importar / Exportar'
    };
    document.getElementById('topbar-title').textContent = titles[sectionId] || sectionId;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════════════
function initModals() {
    // Close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.close);
        });
    });

    // Click outside modal
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ═══════════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ═══════════════════════════════════════════════════════════════
//  DATA LOADING
// ═══════════════════════════════════════════════════════════════
async function loadAllData() {
    try {
        const [nodesRes, rankingRes, configRes] = await Promise.all([
            fetch(API + '/nodes'),
            fetch(API + '/ranking'),
            fetch(API + '/config')
        ]);

        const nodesResp = await nodesRes.json();
        nodesData = nodesResp;
        rankingData = await rankingRes.json();
        const configResp = await configRes.json();

        // Ensure nodesData has config for compatibility
        nodesData.config = configResp.config || {};

        try {
            const spaceRes = await fetch(API + '/space-config');
            if (spaceRes.ok) {
                spaceConfigData = await spaceRes.json();
            }
        } catch (e) {
            console.warn('Space config not available, using defaults');
        }

        renderDashboard();
        renderCategories();
        renderNodes();
        renderConnections();
        renderRanking();
        renderConfig();
        renderSpaceConfig();
        populateSelects();

        showToast('Datos cargados correctamente', 'success');
    } catch (err) {
        console.error('Error loading data:', err);
        showToast('Error al cargar datos', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
//  RENDERS
// ═══════════════════════════════════════════════════════════════

// Dashboard
function renderDashboard() {
    const nodes = nodesData.nodes || {};
    const nodeCount = Object.keys(nodes).length;
    const catCount = (nodesData.categories || []).length;

    // Count connections
    let connCount = 0;
    for (const nid in nodes) {
        const n = nodes[nid];
        if (n.connections) {
            connCount += (n.connections.children || []).length;
            connCount += (n.connections.secondary || []).length;
        }
    }

    document.getElementById('stat-total-nodes').textContent = nodeCount;
    document.getElementById('stat-categories').textContent = catCount;
    document.getElementById('stat-connections').textContent = connCount;
    document.getElementById('stat-rankings').textContent = (rankingData.rankings || []).length;

    // Recent nodes (last 10 tool nodes)
    const recentList = document.getElementById('recent-nodes-list');
    const toolNodes = Object.values(nodes).filter(n => n.type !== 'category').slice(0, 10);
    recentList.innerHTML = toolNodes.map(n => `
    <div class="list-item">
      <div class="list-item-icon">🔵</div>
      <div class="list-item-content">
        <div class="list-item-title">${n.label || n.id}</div>
        <div class="list-item-sub">${n.id} ${n.url ? '• ' + n.url : ''}</div>
      </div>
    </div>
  `).join('') || '<p style="color:var(--text-muted);padding:16px;">No hay nodos cargados. Usa Importar para cargar datos.</p>';
}

// Categories
function renderCategories() {
    const list = document.getElementById('categories-list');
    const categories = nodesData.categories || [];
    const nodes = nodesData.nodes || {};
    const children = nodesData.categoryChildren || {};

    list.innerHTML = categories.map(catId => {
        const node = nodes[catId] || {};
        const childCount = (children[catId] || []).length;
        return `
      <div class="grid-card">
        <div class="grid-card-title">${node.label || catId}</div>
        <div class="grid-card-sub">ID: ${catId}</div>
        <div class="grid-card-count">${childCount} <span>nodos</span></div>
        <div class="grid-card-actions">
          <button class="btn-icon" onclick="editNode('${catId}')" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="deleteCategory('${catId}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
    }).join('');
}

// Nodes
function renderNodes(filter = '', catFilter = '') {
    const list = document.getElementById('nodes-list');
    const nodes = nodesData.nodes || {};
    const search = filter.toLowerCase();

    let entries = Object.values(nodes).filter(n => n.id !== 'root');

    // Filter by category
    if (catFilter) {
        const catChildren = (nodesData.categoryChildren || {})[catFilter] || [];
        entries = entries.filter(n => catChildren.includes(n.id) || n.id === catFilter);
    }

    // Search filter
    if (search) {
        entries = entries.filter(n =>
            (n.label || '').toLowerCase().includes(search) ||
            (n.id || '').toLowerCase().includes(search)
        );
    }

    // Sort: categories first, then alphabetical
    entries.sort((a, b) => {
        if (a.type === 'category' && b.type !== 'category') return -1;
        if (a.type !== 'category' && b.type === 'category') return 1;
        return (a.label || a.id).localeCompare(b.label || b.id);
    });

    list.innerHTML = entries.map(n => {
        const isCategory = n.type === 'category';
        const parentCat = findParentCategory(n.id);
        return `
      <div class="list-item">
        <div class="list-item-icon">${isCategory ? '📁' : '🔵'}</div>
        <div class="list-item-content">
          <div class="list-item-title">${n.label || n.id}</div>
          <div class="list-item-sub">${n.id}${n.url ? ' • <a href="' + n.url + '" target="_blank" style="color:var(--accent-secondary)">' + n.url + '</a>' : ''}${parentCat ? ' • Cat: ' + parentCat : ''}</div>
        </div>
        ${isCategory ? '<span class="list-item-badge cat">categoría</span>' : ''}
        <div class="list-item-actions">
          <button class="btn-icon" onclick="editNode('${n.id}')" title="Editar">✏️</button>
          <button class="btn-icon danger" onclick="deleteNode('${n.id}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
    }).join('') || '<p style="color:var(--text-muted);padding:16px;">No se encontraron nodos.</p>';
}

// Connections
function renderConnections() {
    const list = document.getElementById('connections-list');
    const nodes = nodesData.nodes || {};
    let conns = [];

    for (const nid in nodes) {
        const n = nodes[nid];
        if (n.connections && n.connections.secondary) {
            for (const targetId of n.connections.secondary) {
                conns.push({ source: nid, target: targetId, type: 'secondary' });
            }
        }
    }

    conns.sort((a, b) => a.source.localeCompare(b.source));

    list.innerHTML = conns.map(c => {
        const srcNode = nodes[c.source];
        const tgtNode = nodes[c.target];
        return `
      <div class="list-item">
        <div class="list-item-icon">🔗</div>
        <div class="list-item-content">
          <div class="list-item-title">${srcNode?.label || c.source} ↔ ${tgtNode?.label || c.target}</div>
          <div class="list-item-sub">${c.source} — ${c.target}</div>
        </div>
        <span class="list-item-badge">${c.type}</span>
        <div class="list-item-actions">
          <button class="btn-icon danger" onclick="deleteConnection('${c.source}','${c.target}','${c.type}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
    }).join('') || '<p style="color:var(--text-muted);padding:16px;">No hay conexiones secundarias.</p>';
}

// Ranking
function renderRanking() {
    const list = document.getElementById('ranking-list');
    const rankings = rankingData.rankings || [];

    list.innerHTML = rankings.map((r, i) => {
        let posClass = '';
        if (i === 0) posClass = 'gold';
        else if (i === 1) posClass = 'silver';
        else if (i === 2) posClass = 'bronze';

        return `
      <div class="list-item ranking-item">
        <div class="ranking-pos ${posClass}">#${i + 1}</div>
        <div class="list-item-content">
          <div class="list-item-title">${r.playerName}</div>
          <div class="list-item-sub">${new Date(r.date).toLocaleDateString('es-AR')}</div>
        </div>
        <div class="ranking-score">${r.score}</div>
        <div class="ranking-stats">✓${r.correctAnswers || 0} ✗${r.wrongAnswers || 0}</div>
        <div class="list-item-actions">
           <button class="btn-icon danger" onclick="deleteRanking('${r.id}')" title="Eliminar">🗑️</button>
        </div>
      </div>
    `;
    }).join('') || '<p style="color:var(--text-muted);padding:16px;">No hay rankings todavía.</p>';
}

// ═══════════════════════════════════════════════════════════════
//  POPULATE SELECTS
// ═══════════════════════════════════════════════════════════════
function populateSelects() {
    const nodes = nodesData.nodes || {};
    const categories = nodesData.categories || [];

    // Category filter for nodes section
    const filterCat = document.getElementById('filter-category');
    filterCat.innerHTML = '<option value="">Todas las categorías</option>' +
        categories.map(c => `<option value="${c}">${nodes[c]?.label || c}</option>`).join('');

    // Parent category select in node modal
    const nodeParent = document.getElementById('node-parent');
    nodeParent.innerHTML = '<option value="">Sin categoría padre</option>' +
        categories.map(c => `<option value="${c}">${nodes[c]?.label || c}</option>`).join('');

    // Connection source/target selects
    const allNodeIds = Object.keys(nodes).sort();
    const nodeOptions = allNodeIds.map(id => `<option value="${id}">${nodes[id]?.label || id} (${id})</option>`).join('');

    document.getElementById('conn-source').innerHTML = nodeOptions;
    document.getElementById('conn-target').innerHTML = nodeOptions;
}

// ═══════════════════════════════════════════════════════════════
//  TAG PICKER LOGIC
// ═══════════════════════════════════════════════════════════════
function initTagPicker() {
    const input = document.getElementById('conn-search-input');
    const results = document.getElementById('conn-search-results');

    if (!input || !results) return;

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            results.classList.remove('active');
            return;
        }

        const nodes = nodesData.nodes || {};
        const matches = Object.values(nodes).filter(n =>
            (n.label || '').toLowerCase().includes(query) ||
            n.id.toLowerCase().includes(query)
        ).slice(0, 10);

        if (matches.length > 0) {
            results.innerHTML = matches.map(n => `
                <div class="conn-search-item" onclick="addTag('${n.id}')">
                    <span class="item-label">${n.label || n.id}</span>
                    <span class="item-id">${n.id}</span>
                    <span class="item-type">${n.type === 'category' ? '📁' : '🔵'}</span>
                </div>
            `).join('');
            results.classList.add('active');
        } else {
            results.classList.remove('active');
        }
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.conn-search-wrap')) {
            results.classList.remove('active');
        }
    });
}

function addTag(nodeId) {
    if (currentSecondaryTags.includes(nodeId)) {
        showToast('El nodo ya está en la lista', 'info');
    } else {
        currentSecondaryTags.push(nodeId);
        renderTags();
    }

    // Clear search
    document.getElementById('conn-search-input').value = '';
    document.getElementById('conn-search-results').classList.remove('active');
}

function removeTag(nodeId) {
    currentSecondaryTags = currentSecondaryTags.filter(id => id !== nodeId);
    renderTags();
}

function renderTags() {
    const container = document.getElementById('conn-tags');
    const nodes = nodesData.nodes || {};

    container.innerHTML = currentSecondaryTags.map(id => {
        const label = nodes[id]?.label || id;
        return `
            <div class="conn-tag">
                <span>${label}</span>
                <button class="conn-tag-remove" onclick="removeTag('${id}')">✕</button>
            </div>
        `;
    }).join('');

    // Update hidden field for saveNode function compatibility
    document.getElementById('node-secondary').value = currentSecondaryTags.join(', ');
}

// ═══════════════════════════════════════════════════════════════
//  CONNECTION SEARCH (Modal)
// ═══════════════════════════════════════════════════════════════
function initConnSearch() {
    const sourceSearch = document.getElementById('conn-source-search');
    const targetSearch = document.getElementById('conn-target-search');

    if (sourceSearch) {
        sourceSearch.addEventListener('input', (e) => filterSelect('conn-source', e.target.value));
    }

    if (targetSearch) {
        targetSearch.addEventListener('input', (e) => filterSelect('conn-target', e.target.value));
    }
}

function filterSelect(selectId, query) {
    const select = document.getElementById(selectId);
    const nodes = nodesData.nodes || {};
    const q = query.toLowerCase().trim();

    const allNodeIds = Object.keys(nodes).sort();
    const filtered = q
        ? allNodeIds.filter(id => id.toLowerCase().includes(q) || (nodes[id]?.label || '').toLowerCase().includes(q))
        : allNodeIds;

    select.innerHTML = filtered.map(id =>
        `<option value="${id}">${nodes[id]?.label || id} (${id})</option>`
    ).join('');
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: find parent category of a node
// ═══════════════════════════════════════════════════════════════
function findParentCategory(nodeId) {
    const children = nodesData.categoryChildren || {};
    for (const catId in children) {
        if (children[catId].includes(nodeId)) {
            return catId;
        }
    }
    return null;
}

// ═══════════════════════════════════════════════════════════════
//  BUTTONS INIT
// ═══════════════════════════════════════════════════════════════
function initButtons() {
    // Add Category
    document.getElementById('btn-add-category').addEventListener('click', () => {
        document.getElementById('cat-id').value = '';
        document.getElementById('cat-label').value = '';
        document.getElementById('cat-info').value = '';
        openModal('modal-add-category');
    });

    document.getElementById('btn-save-category').addEventListener('click', saveCategory);

    // Add Node
    document.getElementById('btn-add-node').addEventListener('click', () => {
        editingNodeId = null;
        document.getElementById('modal-node-title').textContent = 'Nuevo Nodo';
        document.getElementById('node-id').value = '';
        document.getElementById('node-id').disabled = false;
        document.getElementById('node-label').value = '';
        document.getElementById('node-type').value = 'tool';
        document.getElementById('node-parent').value = '';
        document.getElementById('node-url').value = '';
        document.getElementById('node-info').value = '';
        document.getElementById('node-infohtml').value = '';
        currentSecondaryTags = [];
        renderTags();
        openModal('modal-node');
    });

    document.getElementById('btn-save-node').addEventListener('click', saveNode);

    // Add Connection
    document.getElementById('btn-add-connection').addEventListener('click', () => {
        openModal('modal-connection');
    });

    document.getElementById('btn-save-connection').addEventListener('click', saveConnection);

    // Search/Filter for nodes
    document.getElementById('search-nodes').addEventListener('input', (e) => {
        renderNodes(e.target.value, document.getElementById('filter-category').value);
    });

    document.getElementById('filter-category').addEventListener('change', (e) => {
        renderNodes(document.getElementById('search-nodes').value, e.target.value);
    });

    // Import file
    document.getElementById('btn-import').addEventListener('click', importFile);

    // Import legacy
    document.getElementById('btn-import-legacy').addEventListener('click', importLegacy);

    // Export
    document.getElementById('btn-export').addEventListener('click', exportData);

    // Save Config
    document.getElementById('btn-save-config').addEventListener('click', saveConfig);

    // Save Space Config
    document.getElementById('btn-save-space-config').addEventListener('click', saveSpaceConfig);

    // Sync HTML from text
    document.getElementById('btn-sync-html').addEventListener('click', () => {
        const label = document.getElementById('node-label').value.trim();
        const info = document.getElementById('node-info').value.trim();

        if (!info) {
            showToast('Escribe algo en la descripción primero', 'info');
            return;
        }

        // Convert plain text to simple HTML (line breaks to <p>)
        const paragraphs = info.split('\n').filter(p => p.trim() !== '');
        const htmlContent = `<h3>${label}</h3>\n` + paragraphs.map(p => `<p>${p}</p>`).join('\n');

        document.getElementById('node-infohtml').value = htmlContent;
        showToast('HTML actualizado', 'success');
    });
}

// ═══════════════════════════════════════════════════════════════
//  CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

// Save Category
async function saveCategory() {
    const id = document.getElementById('cat-id').value.trim();
    const label = document.getElementById('cat-label').value.trim();
    const info = document.getElementById('cat-info').value.trim();

    if (!id || !label) {
        showToast('ID y Nombre son requeridos', 'error');
        return;
    }

    try {
        const res = await fetch(API + '/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                label,
                info,
                infoHTML: `<h3>${label}</h3><p>${info}</p>`
            })
        });

        const data = await res.json();
        if (data.success) {
            showToast(`Categoría "${label}" creada`, 'success');
            closeModal('modal-add-category');
            loadAllData();
        } else {
            showToast(data.error || 'Error al crear', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Edit Node - populate modal
function editNode(nodeId) {
    console.log('📝 Intentando editar nodo:', nodeId);
    const node = nodesData.nodes[nodeId];

    if (!node) {
        console.error('❌ No se encontró el nodo con ID:', nodeId, 'en nodesData.nodes');
        showToast('Error: No se encontró la información del nodo', 'error');
        return;
    }

    console.log('✅ Nodo encontrado:', node);

    editingNodeId = nodeId;
    document.getElementById('modal-node-title').textContent = 'Editar: ' + (node.label || nodeId);
    document.getElementById('node-id').value = nodeId;
    document.getElementById('node-id').disabled = true;
    document.getElementById('node-label').value = node.label || '';
    document.getElementById('node-type').value = node.type || 'tool';
    document.getElementById('node-parent').value = findParentCategory(nodeId) || '';
    document.getElementById('node-url').value = node.url || '';
    document.getElementById('node-info').value = node.info || '';
    document.getElementById('node-infohtml').value = node.infoHTML || '';

    // Secondary connections
    currentSecondaryTags = (node.connections && node.connections.secondary) || [];
    renderTags();

    openModal('modal-node');
}

// Save Node
async function saveNode() {
    const id = document.getElementById('node-id').value.trim();
    const label = document.getElementById('node-label').value.trim();
    const type = document.getElementById('node-type').value;
    const parentCategory = document.getElementById('node-parent').value;
    const url = document.getElementById('node-url').value.trim();
    const info = document.getElementById('node-info').value.trim();
    const infoHTML = document.getElementById('node-infohtml').value.trim();
    const secondaryStr = document.getElementById('node-secondary').value.trim();
    const secondary = secondaryStr ? secondaryStr.split(',').map(s => s.trim()).filter(Boolean) : [];

    if (!id || !label) {
        showToast('ID y Nombre son requeridos', 'error');
        return;
    }

    const nodeData = {
        id,
        label,
        type,
        url: url || null,
        info: info || label,
        infoHTML: infoHTML || `<h3>${label}</h3><p>${info || ''}</p>`,
        parentCategory: parentCategory || null,
        connections: {
            parent: parentCategory ? [{ id: parentCategory, type: 'primary' }] : [],
            children: [],
            secondary
        }
    };

    try {
        const isEditing = editingNodeId !== null;
        const method = isEditing ? 'PUT' : 'POST';
        const endpoint = isEditing ? API + '/nodes/' + editingNodeId : API + '/nodes';

        const res = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nodeData)
        });

        const data = await res.json();
        if (data.success) {
            showToast(`Nodo "${label}" ${isEditing ? 'actualizado' : 'creado'}`, 'success');
            closeModal('modal-node');
            editingNodeId = null;
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Delete Node
async function deleteNode(nodeId) {
    if (!confirm(`¿Eliminar el nodo "${nodesData.nodes[nodeId]?.label || nodeId}"?`)) return;

    try {
        const res = await fetch(API + '/nodes/' + nodeId, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Nodo eliminado', 'success');
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Delete Category
async function deleteCategory(catId) {
    const childCount = (nodesData.categoryChildren[catId] || []).length;
    if (!confirm(`¿Eliminar la categoría "${nodesData.nodes[catId]?.label || catId}" y sus ${childCount} nodos hijos?`)) return;

    try {
        const res = await fetch(API + '/categories/' + catId, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Categoría eliminada', 'success');
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Save Connection
async function saveConnection() {
    const source = document.getElementById('conn-source').value;
    const target = document.getElementById('conn-target').value;
    const type = document.getElementById('conn-type').value;

    if (source === target) {
        showToast('Origen y destino no pueden ser iguales', 'error');
        return;
    }

    try {
        const res = await fetch(API + '/connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source, target, type })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Conexión agregada', 'success');
            closeModal('modal-connection');
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Delete Connection
async function deleteConnection(source, target, type) {
    if (!confirm(`¿Eliminar conexión ${source} ↔ ${target}?`)) return;

    try {
        const res = await fetch(API + '/connections', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source, target, type })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Conexión eliminada', 'success');
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// Delete Ranking
async function deleteRanking(id) {
    if (!confirm('¿Eliminar esta entrada del ranking?')) return;

    try {
        const res = await fetch(API + '/ranking/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Ranking eliminado', 'success');
            loadAllData();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Default CONFIG as fallback
const DEFAULT_CONFIG = {
    rootNodeSize: 200,
    primaryNodeSize: 100,
    secondaryNodeSize: 90,
    nodeFontSize: 14,
    categoryFontSize: 18,
    rootFontSize: 20,
    popupTitleFontSize: 35,
    popupSubtitleFontSize: 30,
    popupTextFontSize: 28,
    secondaryNodeDist: 120,
    primaryDistance: 250,
    categoryDistancesMain: {
        'engines': 1300, 'frameworks': 1500, 'ia': 700, 'shaders': 1200, 'db': 800,
        'ides': 2000, 'languages': 1600, 'llm': 1200, 'frontend': 700, 'os': 1100,
        'soportes': 1800, 'protocolos': 1400, 'software-multimedia': 1000,
        'entornos': 1500, 'glosario': 1700
    },
    categoryDistances: {
        'engines': 250, 'frameworks': 250, 'ia': 180, 'shaders': 220, 'db': 220,
        'ides': 220, 'languages': 350, 'llm': 220, 'frontend': 220, 'os': 220,
        'soportes': 280, 'protocolos': 220, 'software-multimedia': 220,
        'entornos': 220, 'glosario': 380
    },
    animCategoryDelay: 3000,
    animNodeDelay: 2500,
    animTransitionSpeed: 800,
    animNodeExpansionSpeed: 400
};

function renderConfig() {
    const config = { ...DEFAULT_CONFIG, ...(nodesData.config || {}) };

    // Global fields
    const fields = [
        'rootNodeSize', 'primaryNodeSize', 'secondaryNodeSize',
        'nodeFontSize', 'categoryFontSize', 'rootFontSize',
        'primaryDistance', 'secondaryNodeDist',
        'animCategoryDelay', 'animNodeDelay', 'animTransitionSpeed', 'animNodeExpansionSpeed',
        'popupTitleFontSize', 'popupTextFontSize'
    ];

    fields.forEach(f => {
        const el = document.getElementById('cfg-' + f);
        if (el) el.value = config[f];
    });

    // Category Specific distances
    const distList = document.getElementById('category-distances-list');
    const categories = nodesData.categories || [];
    const nodes = nodesData.nodes || {};

    if (categories.length === 0) {
        distList.innerHTML = '<p class="hint-text" style="padding:10px;">No hay categorías creadas todavía.</p>';
        return;
    }

    distList.innerHTML = `
        <div class="config-cat-row config-cat-header">
            <div>Categoría</div>
            <div style="text-align:center;">Dist. Raíz</div>
            <div style="text-align:center;">Dist. Nodos</div>
        </div>
    ` + categories.map(catId => {
        const label = nodes[catId]?.label || catId;
        const mainDist = config.categoryDistancesMain?.[catId] || 1000;
        const subDist = config.categoryDistances?.[catId] || 250;

        return `
        <div class="config-cat-row">
            <div class="config-cat-info">
                <span class="config-cat-label">${label}</span>
                <span class="config-cat-id">${catId}</span>
            </div>
            <div>
                <input type="number" class="config-cat-main config-input-small" data-cat="${catId}" value="${mainDist}">
            </div>
            <div>
                <input type="number" class="config-cat-sub config-input-small" data-cat="${catId}" value="${subDist}">
            </div>
        </div>
        `;
    }).join('');
}

async function saveConfig() {
    const config = { ...DEFAULT_CONFIG, ...(nodesData.config || {}) };

    // Get global fields
    const fields = [
        'rootNodeSize', 'primaryNodeSize', 'secondaryNodeSize',
        'nodeFontSize', 'categoryFontSize', 'rootFontSize',
        'primaryDistance', 'secondaryNodeDist',
        'animCategoryDelay', 'animNodeDelay', 'animTransitionSpeed', 'animNodeExpansionSpeed',
        'popupTitleFontSize', 'popupTextFontSize'
    ];

    fields.forEach(f => {
        const el = document.getElementById('cfg-' + f);
        if (el) config[f] = Number(el.value);
    });

    // Get category distances
    config.categoryDistancesMain = {};
    config.categoryDistances = {};

    document.querySelectorAll('.config-cat-main').forEach(input => {
        config.categoryDistancesMain[input.dataset.cat] = Number(input.value);
    });

    document.querySelectorAll('.config-cat-sub').forEach(input => {
        config.categoryDistances[input.dataset.cat] = Number(input.value);
    });

    try {
        const res = await fetch(API + '/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const data = await res.json();
        if (data.success) {
            showToast('Configuración guardada correctamente', 'success');
            nodesData.config = config;
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        showToast('Error de conexión', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
//  SPACE CONFIGURATION (nube_data/config.js overrides)
// ═══════════════════════════════════════════════════════════════

const SC_DEFAULTS = {
    game: {
        gameTime: 60, evalTimePerQuestion: 30, collectTime: 1.2,
        pointsRouteCorrect: 300, pointsRandomCorrect: 50, pointsWrong: -100,
        pvTotalPlanets: 10, pvPointsPerVisit: 100, pvPointsCorrect: 200, pvPointsWrong: -50
    },
    ship: {
        maxSpeed: 3000, acceleration: 1000, drag: 0.97,
        turnSpeed: 2.0, boostMultiplier: 2, mouseSensitivity: 0.002
    },
    scene: { fogColor: 0x06060e, fogDensity: 0.00015, ambientColor: 0x111122, ambientIntensity: 0.5 },
    stars: { count: 25000, minDistance: 3000, maxDistance: 30000, baseSize: 4 },
    connections: { traceDuration: 5.5, traceSphereRadius: 10, traceSphereGlowMult: 2.5 }
};

const SC_FIELD_MAP = [
    { id: 'sc-game-gameTime',            path: ['game', 'gameTime'] },
    { id: 'sc-game-evalTimePerQuestion',  path: ['game', 'evalTimePerQuestion'] },
    { id: 'sc-game-collectTime',          path: ['game', 'collectTime'] },
    { id: 'sc-game-pointsRouteCorrect',   path: ['game', 'pointsRouteCorrect'] },
    { id: 'sc-game-pointsRandomCorrect',  path: ['game', 'pointsRandomCorrect'] },
    { id: 'sc-game-pointsWrong',          path: ['game', 'pointsWrong'] },
    { id: 'sc-game-pvTotalPlanets',       path: ['game', 'pvTotalPlanets'] },
    { id: 'sc-game-pvPointsPerVisit',     path: ['game', 'pvPointsPerVisit'] },
    { id: 'sc-game-pvPointsCorrect',      path: ['game', 'pvPointsCorrect'] },
    { id: 'sc-game-pvPointsWrong',        path: ['game', 'pvPointsWrong'] },
    { id: 'sc-ship-maxSpeed',             path: ['ship', 'maxSpeed'] },
    { id: 'sc-ship-acceleration',         path: ['ship', 'acceleration'] },
    { id: 'sc-ship-drag',                 path: ['ship', 'drag'] },
    { id: 'sc-ship-turnSpeed',            path: ['ship', 'turnSpeed'] },
    { id: 'sc-ship-boostMultiplier',      path: ['ship', 'boostMultiplier'] },
    { id: 'sc-ship-mouseSensitivity',     path: ['ship', 'mouseSensitivity'] },
    { id: 'sc-scene-fogColor',            path: ['scene', 'fogColor'], hex: true },
    { id: 'sc-scene-fogDensity',          path: ['scene', 'fogDensity'] },
    { id: 'sc-scene-ambientColor',        path: ['scene', 'ambientColor'], hex: true },
    { id: 'sc-scene-ambientIntensity',    path: ['scene', 'ambientIntensity'] },
    { id: 'sc-stars-count',               path: ['stars', 'count'] },
    { id: 'sc-stars-minDistance',          path: ['stars', 'minDistance'] },
    { id: 'sc-stars-maxDistance',          path: ['stars', 'maxDistance'] },
    { id: 'sc-stars-baseSize',            path: ['stars', 'baseSize'] },
    { id: 'sc-connections-traceDuration',      path: ['connections', 'traceDuration'] },
    { id: 'sc-connections-traceSphereRadius',  path: ['connections', 'traceSphereRadius'] },
    { id: 'sc-connections-traceSphereGlowMult', path: ['connections', 'traceSphereGlowMult'] },
];

const SC_CAT_COLOR_DEFAULTS = {
    engines: 0xff6b35, frameworks: 0x00d4ff, ia: 0xb44dff, shaders: 0x00ff88,
    db: 0xffd700, ides: 0xff4d8b, languages: 0x00c9a7, llm: 0xe864ff,
    frontend: 0x4d94ff, os: 0x8bff4d, soportes: 0xff9f43, protocolos: 0x54e0ff,
    'software-multimedia': 0xff6688, entornos: 0x88cc44, glosario: 0xccaa88
};

function _scHexStr(val) {
    if (val === undefined || val === null) return '';
    if (typeof val === 'string') return val;
    return '#' + val.toString(16).padStart(6, '0');
}

function _scParseHex(str) {
    if (!str) return 0;
    str = str.trim();
    if (str.startsWith('0x') || str.startsWith('0X')) return parseInt(str.substring(2), 16);
    if (str.startsWith('#')) return parseInt(str.substring(1), 16);
    return parseInt(str, 16);
}

function _scGet(saved, path) {
    let cur = saved;
    for (const k of path) {
        if (cur === undefined || cur === null) return undefined;
        cur = cur[k];
    }
    return cur;
}

function _scGetDefault(path) {
    return _scGet(SC_DEFAULTS, path);
}

function renderSpaceConfig() {
    const saved = spaceConfigData || {};

    SC_FIELD_MAP.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const val = _scGet(saved, f.path);
        const def = _scGetDefault(f.path);
        const v = (val !== undefined) ? val : def;
        if (f.hex) {
            el.value = _scHexStr(v);
        } else {
            el.value = (v !== undefined && v !== null) ? v : '';
        }
    });

    _renderScCategoryList(saved);
}

function _renderScCategoryList(saved) {
    const container = document.getElementById('sc-category-list');
    const categories = nodesData.categories || [];
    const nodes = nodesData.nodes || {};
    const rawConfig = nodesData.config || {};
    const mapConfig = {
        categoryDistancesMain: { ...DEFAULT_CONFIG.categoryDistancesMain, ...(rawConfig.categoryDistancesMain || {}) },
        categoryDistances: { ...DEFAULT_CONFIG.categoryDistances, ...(rawConfig.categoryDistances || {}) }
    };
    const savedColors = (saved.categoryColors) || {};

    if (categories.length === 0) {
        container.innerHTML = '<p class="hint-text" style="padding:10px;">No hay categorías creadas.</p>';
        return;
    }

    container.innerHTML = `
        <div class="config-cat-row config-cat-header">
            <div>Categoría</div>
            <div style="text-align:center;">Dist. al Centro</div>
            <div style="text-align:center;">Dist. Planetas</div>
            <div style="text-align:center;">Color</div>
        </div>
    ` + categories.map(catId => {
        const label = nodes[catId]?.label || catId;
        const mainDist = mapConfig.categoryDistancesMain?.[catId] || 1000;
        const subDist = mapConfig.categoryDistances?.[catId] || 250;
        const colorVal = (savedColors[catId] !== undefined) ? savedColors[catId] : (SC_CAT_COLOR_DEFAULTS[catId] || 0x888888);
        const colorHex = '#' + colorVal.toString(16).padStart(6, '0');

        return `
        <div class="config-cat-row">
            <div class="config-cat-info">
                <span class="config-cat-label">${label}</span>
                <span class="config-cat-id">${catId}</span>
            </div>
            <div>
                <input type="number" class="sc-cat-main config-input-small" data-cat="${catId}" value="${mainDist}">
            </div>
            <div>
                <input type="number" class="sc-cat-sub config-input-small" data-cat="${catId}" value="${subDist}">
            </div>
            <div>
                <input type="color" class="sc-cat-color" data-cat="${catId}" value="${colorHex}" style="width:50px;height:32px;border:none;cursor:pointer;background:transparent;">
            </div>
        </div>
        `;
    }).join('');
}

async function saveSpaceConfig() {
    const config = {};

    SC_FIELD_MAP.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const path = f.path;
        if (!config[path[0]]) config[path[0]] = {};
        if (f.hex) {
            config[path[0]][path[1]] = _scParseHex(el.value);
        } else {
            config[path[0]][path[1]] = Number(el.value);
        }
    });

    config.categoryColors = {};
    document.querySelectorAll('.sc-cat-color').forEach(input => {
        config.categoryColors[input.dataset.cat] = _scParseHex(input.value);
    });

    const catDistMain = {};
    const catDistSub = {};
    document.querySelectorAll('.sc-cat-main').forEach(input => {
        catDistMain[input.dataset.cat] = Number(input.value);
    });
    document.querySelectorAll('.sc-cat-sub').forEach(input => {
        catDistSub[input.dataset.cat] = Number(input.value);
    });

    const mapConfig = { ...DEFAULT_CONFIG, ...(nodesData.config || {}) };
    mapConfig.categoryDistancesMain = { ...DEFAULT_CONFIG.categoryDistancesMain, ...catDistMain };
    mapConfig.categoryDistances = { ...DEFAULT_CONFIG.categoryDistances, ...catDistSub };

    let mapOk = false;
    let scOk = false;

    try {
        const cfgRes = await fetch(API + '/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapConfig)
        });
        const cfgData = await cfgRes.json();
        if (cfgData.success) {
            mapOk = true;
            nodesData.config = mapConfig;
        }
    } catch (e) {
        console.error('Error saving map config:', e);
    }

    try {
        const scRes = await fetch(API + '/space-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (scRes.ok) {
            const scData = await scRes.json();
            if (scData.success) {
                scOk = true;
                spaceConfigData = config;
            }
        }
    } catch (e) {
        console.warn('Space config API not available');
    }

    if (mapOk) {
        showToast(scOk ? 'Configuración de espacio guardada' : 'Distancias guardadas (space-config no disponible)', 'success');
    } else {
        showToast('Error al guardar configuración', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════
//  IMPORT / EXPORT
// ═══════════════════════════════════════════════════════════════

// Import from file
async function importFile() {
    const fileInput = document.getElementById('import-file');
    const statusEl = document.getElementById('import-status');

    if (!fileInput.files.length) {
        showToast('Selecciona un archivo JSON', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (e) {
        try {
            const jsonData = JSON.parse(e.target.result);

            const res = await fetch(API + '/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jsonData)
            });

            const data = await res.json();
            if (data.success) {
                statusEl.textContent = `✅ Importados ${data.totalNodes} nodos y ${data.categories} categorías`;
                statusEl.className = 'status-message show success';
                showToast('Datos importados correctamente', 'success');
                loadAllData();
            } else {
                statusEl.textContent = '❌ ' + (data.error || 'Error');
                statusEl.className = 'status-message show error';
            }
        } catch (err) {
            statusEl.textContent = '❌ Error parseando JSON: ' + err.message;
            statusEl.className = 'status-message show error';
        }
    };

    reader.readAsText(file);
}

// Import legacy data (from existing mapa_herramientas_data.json served in nube_data)
async function importLegacy() {
    const statusEl = document.getElementById('import-legacy-status');
    statusEl.textContent = '⏳ Cargando datos legacy...';
    statusEl.className = 'status-message show info';

    try {
        // Try to fetch the existing JSON file from the nube_data folder
        // It could be served from different paths depending on setup
        let jsonData = null;
        const paths = [
            BASE_PATH + '/nube_data/mapa_herramientas_data.json',
            '/nube_data/mapa_herramientas_data.json',
            'nube_data/mapa_herramientas_data.json'
        ];

        for (const p of paths) {
            try {
                const res = await fetch(p);
                if (res.ok) {
                    jsonData = await res.json();
                    break;
                }
            } catch (e) { /* try next */ }
        }

        if (!jsonData) {
            statusEl.textContent = '❌ No se encontró el archivo legacy. Usa "Importar desde JSON" con el archivo manualmente.';
            statusEl.className = 'status-message show error';
            return;
        }

        const res = await fetch(API + '/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        const data = await res.json();
        if (data.success) {
            statusEl.textContent = `✅ Importados ${data.totalNodes} nodos y ${data.categories} categorías desde datos legacy`;
            statusEl.className = 'status-message show success';
            showToast('Datos legacy importados', 'success');
            loadAllData();
        } else {
            statusEl.textContent = '❌ ' + (data.error || 'Error');
            statusEl.className = 'status-message show error';
        }
    } catch (err) {
        statusEl.textContent = '❌ Error: ' + err.message;
        statusEl.className = 'status-message show error';
    }
}

// Export data
async function exportData() {
    try {
        const res = await fetch(API + '/export');
        const data = await res.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diploia_nodes_data_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);

        showToast('Datos exportados', 'success');
    } catch (err) {
        showToast('Error al exportar', 'error');
    }
}
