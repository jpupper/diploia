import * as THREE from 'three';
import { CONFIG } from '../nube_data/config.js';

// Global State
const state = {
    nodes: [],
    categories: [],
    currentIndex: 0,
    currentCategory: 'ALL',
    filteredNodes: [],
    isAnimating: false,
    autoPlay: false
};

// DOM Elements
const els = {
    container: document.getElementById('presentation-container'),
    content: document.getElementById('slide-content'),
    title: document.getElementById('slide-title'),
    desc: document.getElementById('slide-desc'),
    catBadge: document.getElementById('slide-category'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    progress: document.getElementById('progress-fill'),
    filters: document.getElementById('category-filter'),
    loading: document.getElementById('loading-overlay'),
    visual: document.querySelector('.visual-circle')
};

// ── Initialization ───────────────────────────────────────────────────────────

async function init() {
    initBackgroundShader();
    await loadData();
    setupFilters();
    bindEvents();
    renderSlide(0);
    els.loading.classList.add('hidden');
}

// ── Data Loading ─────────────────────────────────────────────────────────────

async function loadData() {
    try {
        const url = CONFIG.dataUrl;
        const res = await fetch(url);
        const data = await res.json();

        // Build category mapping: id -> categoryName
        const idToCategory = {};
        if (data.categoryChildren) {
            for (const [catName, children] of Object.entries(data.categoryChildren)) {
                children.forEach(childId => {
                    idToCategory[childId] = catName;
                });
                // Also map the category itself? Usually categories are nodes too.
                idToCategory[catName] = catName;
            }
        }

        let nodesList = [];

        if (data.nodes) {
            nodesList = Object.values(data.nodes);
        } else if (Array.isArray(data)) {
            nodesList = data;
        }

        // Filter out structural nodes if any (like 'root')
        // And Assign Categories
        state.nodes = nodesList
            .filter(n => n.type !== 'root' && n.label)
            .map(n => {
                // If category is already set, keep it. If not, use our map.
                if (!n.category) {
                    n.category = idToCategory[n.id] || 'GENERAL';
                }
                return n;
            });

        // Filter out nodes that are actually categories (if they are in the children map keys)
        // Wait, "engines" is a node too. But in presentation mode, maybe we want to show them?
        // Let's keep them for now.

        // Sort by category then name
        state.nodes.sort((a, b) => {
            if (a.category === b.category) return a.label.localeCompare(b.label);
            return (a.category || '').localeCompare(b.category || '');
        });

        state.filteredNodes = [...state.nodes];
        state.categories = [...new Set(state.nodes.map(n => n.category).filter(Boolean))];

        // Ensure we only have valid categories in the list (remove 'GENERAL' if undesired, but it handles uncategorized)

    } catch (e) {
        console.error("Failed to load data", e);
        els.title.textContent = "Error loading data";
    }
}

// ── Rendering ────────────────────────────────────────────────────────────────

function renderSlide(index, direction = 1) {
    if (state.filteredNodes.length === 0) return;

    if (index < 0) index = state.filteredNodes.length - 1;
    if (index >= state.filteredNodes.length) index = 0;

    state.currentIndex = index;
    const node = state.filteredNodes[index];

    // Animate Out
    els.content.classList.remove('visible');

    setTimeout(() => {
        // Update Content
        els.title.textContent = node.label;
        els.desc.innerHTML = '';

        // Resolve Description
        // Priority: node.description > node.info (cleaned) > node.infoHTML (cleaned)
        let descText = node.description;

        if (!descText && node.info) {
            // Clean up "Title Description..." pattern if present
            // Example: "Cursor Editor de código..." -> "Editor de código..."
            const label = node.label || '';
            // Simple check if info starts with label
            if (node.info.trim().startsWith(label)) {
                descText = node.info.trim().substring(label.length).trim();
            } else {
                descText = node.info;
            }
        }

        if (!descText && node.infoHTML) {
            // Primitive strip tags using browser DOM
            const tmp = document.createElement('div');
            tmp.innerHTML = node.infoHTML;
            // Remove h3 which usually repeats title
            const h3 = tmp.querySelector('h3');
            if (h3) h3.remove();
            descText = tmp.textContent.trim();
        }

        if (!descText) descText = "Sin descripción disponible.";

        // Split description into sentences for animation
        // Simple heuristic: split by period followed by space
        // We also want to keep the periods.
        // Regex split keeping delimiter is complex in split, so we just split and re-add.
        const sentences = descText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [descText];

        sentences.forEach((s, i) => {
            if (!s.trim()) return;
            const span = document.createElement('span');
            span.className = 'slide-line';
            span.style.animationDelay = `${i * 0.1}s`;
            span.textContent = s.trim() + ' ';
            els.desc.appendChild(span);
        });

        // Category & Color
        const catColorHex = CONFIG.categoryColors[node.category] || 0xffffff;
        const color = '#' + new THREE.Color(catColorHex).getHexString();

        els.catBadge.textContent = node.category || 'GENERAL';
        els.catBadge.style.color = color;
        els.catBadge.style.boxShadow = `0 0 15px ${color}40`;
        els.catBadge.style.borderColor = `${color}60`;

        document.documentElement.style.setProperty('--accent-color', color);

        // Update Progress
        const pct = ((index + 1) / state.filteredNodes.length) * 100;
        els.progress.style.width = `${pct}%`;

        // Animate In
        els.content.classList.add('visible');
    }, 300);
}

// ── Filters ──────────────────────────────────────────────────────────────────

function setupFilters() {
    els.filters.innerHTML = '';

    // All
    createFilterDot('ALL', 0xffffff);

    state.categories.forEach(cat => {
        if (cat === 'GENERAL') return; // Skip GENERAL in filter list if you want, or keep it
        createFilterDot(cat, CONFIG.categoryColors[cat] || 0xffffff);
    });
}

function createFilterDot(cat, colorHex) {
    const dot = document.createElement('div');
    dot.className = 'cat-filter-dot';
    const color = '#' + new THREE.Color(colorHex).getHexString();
    dot.style.setProperty('--cat-color', color);

    const tooltip = document.createElement('div');
    tooltip.className = 'cat-tooltip';
    tooltip.textContent = cat;
    dot.appendChild(tooltip);

    dot.addEventListener('click', () => filterCategory(cat));

    if (cat === 'ALL') dot.classList.add('active');

    els.filters.appendChild(dot);
}

function filterCategory(cat) {
    state.currentCategory = cat;

    // Update active dot
    document.querySelectorAll('.cat-filter-dot').forEach(d => {
        d.classList.remove('active');
        if (d.querySelector('.cat-tooltip').textContent === cat) d.classList.add('active');
    });

    // Filter nodes
    if (cat === 'ALL') {
        state.filteredNodes = [...state.nodes];
    } else {
        state.filteredNodes = state.nodes.filter(n => n.category === cat);
    }

    // Reset index
    renderSlide(0);
}

// ── Interaction ──────────────────────────────────────────────────────────────

function bindEvents() {
    els.prevBtn.addEventListener('click', () => renderSlide(state.currentIndex - 1, -1));
    els.nextBtn.addEventListener('click', () => renderSlide(state.currentIndex + 1, 1));

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') renderSlide(state.currentIndex + 1, 1);
        if (e.key === 'ArrowLeft') renderSlide(state.currentIndex - 1, -1);
    });
}

// ── Background Shader ────────────────────────────────────────────────────────

function initBackgroundShader() {
    const container = document.getElementById('shader-bg');
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);

    // Futuristic Grid / Nebula Shader matching the "Nube" aesthetic
    const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uColor: { value: new THREE.Color(0x000000) } // We will blend this
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform vec2 uResolution;
            varying vec2 vUv;

            // Simplex noise function
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
                
                float noise = snoise(uv * 3.0 + uTime * 0.1);
                float noise2 = snoise(uv * 1.5 - uTime * 0.05);
                
                // Deep space background
                vec3 bg = vec3(0.02, 0.02, 0.05); // Dark blue/black
                
                // Nebula effect
                vec3 color1 = vec3(0.0, 1.0, 1.0); // Cyan
                vec3 color2 = vec3(0.6, 0.0, 1.0); // Purple
                
                float n = smoothstep(0.2, 0.8, noise);
                
                vec3 finalColor = bg + n * color1 * 0.15 + noise2 * color2 * 0.1;
                
                // Scanline vibe
                float scan = sin(gl_FragCoord.y * 0.2 - uTime * 2.0) * 0.02;
                finalColor += scan;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function animate() {
        requestAnimationFrame(animate);
        uniforms.uTime.value += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });
}

// start
init();
