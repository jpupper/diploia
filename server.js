const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const hostname = '0.0.0.0';
const port = 4500;
const APP_PATH = 'diploia';

// ═══════════════════════════════════════════════════════════════
//  CORS configuration - Allow requests from any origin
// ═══════════════════════════════════════════════════════════════
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ═══════════════════════════════════════════════════════════════
//  DATA DIRECTORY & JSON FILES
// ═══════════════════════════════════════════════════════════════
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// JSON file paths
const NODES_FILE = path.join(DATA_DIR, 'nodes_data.json');
const RANKING_FILE = path.join(DATA_DIR, 'ranking.json');

// ═══════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS - Read/Write JSON
// ═══════════════════════════════════════════════════════════════
function readJSON(filePath, defaultValue = null) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return defaultValue;
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return defaultValue;
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
        return false;
    }
}

// Initialize files if they don't exist
if (!fs.existsSync(RANKING_FILE)) {
    writeJSON(RANKING_FILE, { rankings: [] });
    console.log('✅ ranking.json created');
}

if (!fs.existsSync(NODES_FILE)) {
    // Will be populated by import or admin
    writeJSON(NODES_FILE, {
        exportDate: new Date().toISOString(),
        totalNodes: 0,
        categories: [],
        categoryChildren: {},
        config: {},
        nodes: {},
        connections: []
    });
    console.log('✅ nodes_data.json created');
}

// ═══════════════════════════════════════════════════════════════
//  SERVE STATIC FILES under /diploia path
// ═══════════════════════════════════════════════════════════════
app.use(`/${APP_PATH}`, express.static(path.join(__dirname, 'public')));

// Main route
app.get(`/${APP_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin route
app.get(`/${APP_PATH}/admin`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Root route
app.get('/', (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('DiploIA Server running on port ' + port);
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - NODES
// ═══════════════════════════════════════════════════════════════

// GET all nodes data
app.get(`/${APP_PATH}/api/nodes`, (req, res) => {
    const data = readJSON(NODES_FILE, { nodes: {}, categories: [], connections: [] });
    res.json(data);
});

// GET single node
app.get(`/${APP_PATH}/api/nodes/:id`, (req, res) => {
    const data = readJSON(NODES_FILE, { nodes: {} });
    const node = data.nodes[req.params.id];
    if (!node) {
        return res.status(404).json({ error: 'Nodo no encontrado' });
    }
    res.json({ node });
});

// POST create node
app.post(`/${APP_PATH}/api/nodes`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const node = req.body;

        if (!node.id) {
            return res.status(400).json({ error: 'El nodo requiere un ID' });
        }

        if (data.nodes[node.id]) {
            return res.status(400).json({ error: 'Ya existe un nodo con ese ID' });
        }

        // Add node
        data.nodes[node.id] = node;
        data.totalNodes = Object.keys(data.nodes).length;

        // If it's a category, add to categories list
        if (node.type === 'category' && !data.categories.includes(node.id) && node.id !== 'root') {
            data.categories.push(node.id);
            if (!data.categoryChildren[node.id]) {
                data.categoryChildren[node.id] = [];
            }
        }

        // If node has a parent category, add to categoryChildren
        if (node.parentCategory && data.categoryChildren[node.parentCategory]) {
            if (!data.categoryChildren[node.parentCategory].includes(node.id)) {
                data.categoryChildren[node.parentCategory].push(node.id);
            }
        }

        writeJSON(NODES_FILE, data);
        res.json({ success: true, node });
    } catch (error) {
        console.error('Error creating node:', error);
        res.status(500).json({ error: 'Error al crear el nodo' });
    }
});

// PUT update node
app.put(`/${APP_PATH}/api/nodes/:id`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const nodeId = req.params.id;
        const updates = req.body;

        if (!data.nodes[nodeId]) {
            return res.status(404).json({ error: 'Nodo no encontrado' });
        }

        // Update node properties
        data.nodes[nodeId] = { ...data.nodes[nodeId], ...updates, id: nodeId };

        writeJSON(NODES_FILE, data);
        res.json({ success: true, node: data.nodes[nodeId] });
    } catch (error) {
        console.error('Error updating node:', error);
        res.status(500).json({ error: 'Error al actualizar el nodo' });
    }
});

// DELETE node
app.delete(`/${APP_PATH}/api/nodes/:id`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const nodeId = req.params.id;

        if (!data.nodes[nodeId]) {
            return res.status(404).json({ error: 'Nodo no encontrado' });
        }

        // Remove from categories if it's a category
        const idx = data.categories.indexOf(nodeId);
        if (idx !== -1) {
            data.categories.splice(idx, 1);
        }

        // Remove from categoryChildren
        if (data.categoryChildren[nodeId]) {
            delete data.categoryChildren[nodeId];
        }

        // Remove from all other categoryChildren arrays
        for (const cat in data.categoryChildren) {
            const childIdx = data.categoryChildren[cat].indexOf(nodeId);
            if (childIdx !== -1) {
                data.categoryChildren[cat].splice(childIdx, 1);
            }
        }

        // Remove all connections involving this node
        if (data.connections) {
            data.connections = data.connections.filter(
                c => c.source !== nodeId && c.target !== nodeId
            );
        }

        // Remove from other nodes' connections
        for (const nid in data.nodes) {
            const n = data.nodes[nid];
            if (n.connections) {
                if (n.connections.children) {
                    n.connections.children = n.connections.children.filter(c => c.id !== nodeId);
                }
                if (n.connections.parent) {
                    n.connections.parent = n.connections.parent.filter(c => c.id !== nodeId);
                }
                if (n.connections.secondary) {
                    n.connections.secondary = n.connections.secondary.filter(c => c !== nodeId);
                }
            }
        }

        // Delete node
        delete data.nodes[nodeId];
        data.totalNodes = Object.keys(data.nodes).length;

        writeJSON(NODES_FILE, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting node:', error);
        res.status(500).json({ error: 'Error al eliminar el nodo' });
    }
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - CATEGORIES
// ═══════════════════════════════════════════════════════════════

// GET all categories
app.get(`/${APP_PATH}/api/categories`, (req, res) => {
    const data = readJSON(NODES_FILE, { categories: [], nodes: {} });
    const categories = data.categories.map(catId => ({
        id: catId,
        label: data.nodes[catId]?.label || catId,
        childCount: data.categoryChildren[catId]?.length || 0
    }));
    res.json({ categories });
});

// POST create category
app.post(`/${APP_PATH}/api/categories`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const { id, label, info, infoHTML } = req.body;

        if (!id || !label) {
            return res.status(400).json({ error: 'Se requiere ID y label' });
        }

        if (data.categories.includes(id)) {
            return res.status(400).json({ error: 'La categoría ya existe' });
        }

        // Add category node
        data.categories.push(id);
        data.categoryChildren[id] = [];
        data.nodes[id] = {
            id,
            label,
            type: 'category',
            url: null,
            info: info || label,
            connections: {
                parent: [{ id: 'root', type: 'primary' }],
                children: [],
                secondary: []
            },
            infoHTML: infoHTML || `<h3>${label}</h3>`
        };

        // Add connection from root to new category
        if (data.nodes['root']) {
            if (!data.nodes['root'].connections) {
                data.nodes['root'].connections = { parent: [], children: [], secondary: [] };
            }
            data.nodes['root'].connections.children.push({ id, type: 'primary' });
        }

        data.totalNodes = Object.keys(data.nodes).length;
        writeJSON(NODES_FILE, data);

        res.json({ success: true, category: data.nodes[id] });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
});

// DELETE category
app.delete(`/${APP_PATH}/api/categories/:id`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const catId = req.params.id;

        // Remove all children nodes first
        if (data.categoryChildren[catId]) {
            for (const childId of data.categoryChildren[catId]) {
                delete data.nodes[childId];
            }
        }

        // Remove category from list
        const idx = data.categories.indexOf(catId);
        if (idx !== -1) data.categories.splice(idx, 1);

        // Remove from categoryChildren
        delete data.categoryChildren[catId];

        // Remove from root connections
        if (data.nodes['root'] && data.nodes['root'].connections) {
            data.nodes['root'].connections.children = data.nodes['root'].connections.children.filter(
                c => c.id !== catId
            );
        }

        // Remove category node
        delete data.nodes[catId];
        data.totalNodes = Object.keys(data.nodes).length;

        writeJSON(NODES_FILE, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - CONNECTIONS
// ═══════════════════════════════════════════════════════════════

// POST add connection between nodes
app.post(`/${APP_PATH}/api/connections`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const { source, target, type } = req.body;

        if (!source || !target) {
            return res.status(400).json({ error: 'Se requiere source y target' });
        }

        if (!data.nodes[source] || !data.nodes[target]) {
            return res.status(404).json({ error: 'Uno o ambos nodos no existen' });
        }

        const connType = type || 'secondary';

        // Add to source node connections
        if (data.nodes[source].connections) {
            if (connType === 'secondary') {
                if (!data.nodes[source].connections.secondary) {
                    data.nodes[source].connections.secondary = [];
                }
                if (!data.nodes[source].connections.secondary.includes(target)) {
                    data.nodes[source].connections.secondary.push(target);
                }
            } else {
                if (!data.nodes[source].connections.children) {
                    data.nodes[source].connections.children = [];
                }
                const exists = data.nodes[source].connections.children.some(c => c.id === target);
                if (!exists) {
                    data.nodes[source].connections.children.push({ id: target, type: connType });
                }
            }
        }

        writeJSON(NODES_FILE, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding connection:', error);
        res.status(500).json({ error: 'Error al agregar conexión' });
    }
});

// DELETE connection
app.delete(`/${APP_PATH}/api/connections`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        const { source, target, type } = req.body;

        if (!source || !target) {
            return res.status(400).json({ error: 'Se requiere source y target' });
        }

        const connType = type || 'secondary';

        if (data.nodes[source] && data.nodes[source].connections) {
            if (connType === 'secondary') {
                if (data.nodes[source].connections.secondary) {
                    data.nodes[source].connections.secondary = data.nodes[source].connections.secondary.filter(
                        id => id !== target
                    );
                }
            } else {
                if (data.nodes[source].connections.children) {
                    data.nodes[source].connections.children = data.nodes[source].connections.children.filter(
                        c => c.id !== target
                    );
                }
            }
        }

        writeJSON(NODES_FILE, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing connection:', error);
        res.status(500).json({ error: 'Error al eliminar conexión' });
    }
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - RANKING
// ═══════════════════════════════════════════════════════════════

// GET all rankings
app.get(`/${APP_PATH}/api/ranking`, (req, res) => {
    const data = readJSON(RANKING_FILE, { rankings: [] });
    // Sort by score descending
    data.rankings.sort((a, b) => b.score - a.score);
    res.json(data);
});

// POST new ranking entry
app.post(`/${APP_PATH}/api/ranking`, (req, res) => {
    try {
        const data = readJSON(RANKING_FILE, { rankings: [] });
        const { playerName, score, correctAnswers, wrongAnswers, totalQuestions, gameTime, date } = req.body;

        if (!playerName || score === undefined) {
            return res.status(400).json({ error: 'Se requiere nombre y puntaje' });
        }

        const entry = {
            id: Date.now().toString(),
            playerName,
            score: Number(score),
            correctAnswers: correctAnswers || 0,
            wrongAnswers: wrongAnswers || 0,
            totalQuestions: totalQuestions || 0,
            gameTime: gameTime || 0,
            date: date || new Date().toISOString()
        };

        data.rankings.push(entry);

        // Keep top 100
        data.rankings.sort((a, b) => b.score - a.score);
        if (data.rankings.length > 100) {
            data.rankings = data.rankings.slice(0, 100);
        }

        writeJSON(RANKING_FILE, data);
        res.json({ success: true, entry, position: data.rankings.indexOf(entry) + 1 });
    } catch (error) {
        console.error('Error saving ranking:', error);
        res.status(500).json({ error: 'Error al guardar el ranking' });
    }
});

// DELETE ranking entry
app.delete(`/${APP_PATH}/api/ranking/:id`, (req, res) => {
    try {
        const data = readJSON(RANKING_FILE, { rankings: [] });
        data.rankings = data.rankings.filter(r => r.id !== req.params.id);
        writeJSON(RANKING_FILE, data);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting ranking:', error);
        res.status(500).json({ error: 'Error al eliminar el ranking' });
    }
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - IMPORT / EXPORT
// ═══════════════════════════════════════════════════════════════

// POST import data (from mapa_herramientas_data.json format)
app.post(`/${APP_PATH}/api/import`, (req, res) => {
    try {
        const importData = req.body;

        if (!importData.nodes) {
            return res.status(400).json({ error: 'Formato de datos inválido: falta nodes' });
        }

        // Write directly since the format matches
        writeJSON(NODES_FILE, importData);
        console.log(`✅ Imported ${Object.keys(importData.nodes).length} nodes`);

        res.json({
            success: true,
            totalNodes: Object.keys(importData.nodes).length,
            categories: importData.categories?.length || 0
        });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Error al importar datos' });
    }
});

// GET export data
app.get(`/${APP_PATH}/api/export`, (req, res) => {
    const data = readJSON(NODES_FILE);
    data.exportDate = new Date().toISOString();
    res.json(data);
});

// ═══════════════════════════════════════════════════════════════
//  API ROUTES - CONFIG (Map configuration)
// ═══════════════════════════════════════════════════════════════

// GET config
app.get(`/${APP_PATH}/api/config`, (req, res) => {
    const data = readJSON(NODES_FILE, {});
    res.json({ config: data.config || {} });
});

// PUT update config
app.put(`/${APP_PATH}/api/config`, (req, res) => {
    try {
        const data = readJSON(NODES_FILE);
        data.config = { ...data.config, ...req.body };
        writeJSON(NODES_FILE, data);
        res.json({ success: true, config: data.config });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

// ═══════════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════════
const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`  DiploIA Server running at http://${hostname}:${port}/`);
    console.log(`  App path: /${APP_PATH}`);
    console.log(`  Frontend: http://localhost:${port}/${APP_PATH}`);
    console.log(`  Admin: http://localhost:${port}/${APP_PATH}/admin`);
    console.log(`  API: http://localhost:${port}/${APP_PATH}/api/`);
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Static files: ${path.join(__dirname, 'public')}`);
    console.log(`  Data files: ${DATA_DIR}`);
    console.log('═══════════════════════════════════════════════════');
});
