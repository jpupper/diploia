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
    loading: document.getElementById('loading-overlay')
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
        const url = '/diploia/api/nodes';
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

    updateShaderParams(node, state.currentIndex);

    // Animate Out
    els.content.classList.remove('visible');

    setTimeout(() => {
        // Update Content
        els.title.textContent = node.label;
        els.desc.innerHTML = '';

        if (node.customHtml) {
            els.desc.innerHTML = node.customHtml;
            if (node.customCss) {
                const styleId = `custom-style-${node.id}`;
                let style = document.getElementById(styleId);
                if (!style) {
                    style = document.createElement('style');
                    style.id = styleId;
                    document.head.appendChild(style);
                }
                style.textContent = node.customCss;
            }
        } else if (node.infoHTML) {
            // Check for image and inject if missing
            let html = node.infoHTML;
            if (!html.includes('<img')) {
                const term = encodeURIComponent(node.label.toLowerCase());
                const imgUrl = `https://loremflickr.com/800/600/${term}`;
                const imgTag = `<div class="node-image-container" style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <img src="${imgUrl}" alt="${node.label}" style="width: 100%; height: auto; display: block; object-fit: cover; max-height: 350px;">
                </div>`;

                if (html.includes('</h3>')) {
                    html = html.replace('</h3>', `</h3>${imgTag}`);
                } else {
                    html = imgTag + html;
                }
            }
            els.desc.innerHTML = html;
        } else if (node.description || node.info) {
            const text = node.description || node.info;
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

            // Client-side image injection for text nodes
            const term = encodeURIComponent(node.label.toLowerCase());
            const imgUrl = `https://loremflickr.com/800/600/${term}`;
            const imgTag = `<div class="node-image-container" style="margin: 20px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <img src="${imgUrl}" alt="${node.label}" style="width: 100%; height: auto; display: block; object-fit: cover; max-height: 350px;">
            </div>`;
            els.desc.innerHTML = imgTag;

            sentences.forEach((s, i) => {
                if (!s.trim()) return;
                const span = document.createElement('span');
                span.className = 'slide-line';
                span.style.animationDelay = `${i * 0.1}s`;
                span.textContent = s.trim() + ' ';
                els.desc.appendChild(span);
            });
        } else {
            els.desc.textContent = "Sin descripción disponible.";
        }

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

        // Update Sidebar
        updateSidebar(node);
    }, 300);
}

// ── Filters ──────────────────────────────────────────────────────────────────

function setupFilters() {
    els.filters.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'sidebar-header';

    const label = document.createElement('div');
    label.className = 'cat-label-small';
    label.textContent = 'SELECCIONAR CATEGORÍA';
    header.appendChild(label);

    // Category Nav Dots
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'cat-nav-dots';
    dotsContainer.id = 'cat-nav-dots';
    header.appendChild(dotsContainer);

    // All option
    createCatDot('ALL', 0xffffff, dotsContainer);

    state.categories.forEach(cat => {
        if (cat === 'GENERAL') return;
        createCatDot(cat, CONFIG.categoryColors[cat] || 0xffffff, dotsContainer);
    });

    const title = document.createElement('div');
    title.className = 'cat-title';
    title.id = 'sidebar-cat-title';
    header.appendChild(title);

    els.filters.appendChild(header);

    // Node List Container
    const listContainer = document.createElement('div');
    listContainer.className = 'node-list-container';
    listContainer.id = 'sidebar-node-list';
    els.filters.appendChild(listContainer);
}

function createCatDot(cat, colorHex, container) {
    const dot = document.createElement('div');
    dot.className = 'cat-dot';
    const color = '#' + new THREE.Color(colorHex).getHexString();
    dot.style.setProperty('--dot-color', color);

    // Tooltip / Meta
    dot.title = cat;
    dot.dataset.cat = cat;

    dot.addEventListener('click', () => filterCategory(cat));

    container.appendChild(dot);
}

function updateSidebar(node) {
    const titleEl = document.getElementById('sidebar-cat-title');
    const listEl = document.getElementById('sidebar-node-list');
    const dots = document.querySelectorAll('.cat-dot');

    if (!titleEl || !listEl) return;

    // Update Category Title & List if changed
    const currentCat = node.category || 'GENERAL';
    if (titleEl.textContent !== currentCat) {
        titleEl.textContent = currentCat;
        renderNodeList(node.category, listEl);
    }

    // Highlight Category Dot
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.dataset.cat === state.currentCategory) dot.classList.add('active');
    });

    // Highlight Active Node
    const items = listEl.querySelectorAll('.node-item');
    items.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.nodeId === node.id) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

function renderNodeList(category, container) {
    container.innerHTML = '';
    // Find all nodes for this category from the full list
    const nodesInCat = state.nodes.filter(n => (n.category || 'GENERAL') === (category || 'GENERAL'));

    nodesInCat.forEach(n => {
        const item = document.createElement('div');
        item.className = 'node-item';
        item.textContent = n.label;
        item.dataset.nodeId = n.id;

        // Add click handler to jump to this node
        item.addEventListener('click', () => {
            // We need to find the index in the CURRENT filtered list.
            // If the current filtered list doesn't include this node (unlikely if we are viewing the category),
            // we might need to reset filter, but usually it should be there.
            const idx = state.filteredNodes.findIndex(fn => fn.id === n.id);
            if (idx !== -1) {
                renderSlide(idx);
            } else {
                // If not in filtered list (e.g. we are in a different filter mode but somehow seeing this?), 
                // Force switch? For now assume valid.
                console.warn('Node not in current filtered list');
            }
        });

        container.appendChild(item);
    });
}


function filterCategory(cat) {
    state.currentCategory = cat;

    // Update active dot in sidebar
    document.querySelectorAll('.cat-dot').forEach(d => {
        d.classList.remove('active');
        if (d.dataset.cat === cat) d.classList.add('active');
    });

    // Filter nodes
    if (cat === 'ALL') {
        state.filteredNodes = [...state.nodes];
    } else {
        state.filteredNodes = state.nodes.filter(n => n.category === cat);
    }

    // Reset index to start of filtered set
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
        uColor1: { value: new THREE.Color(0.0, 1.0, 1.0) },
        uColor2: { value: new THREE.Color(0.6, 0.0, 1.0) },
        uSpeed: { value: 0.1 },
        uScale: { value: 3.0 },
        uDistortion: { value: 0.1 }
    };

    // Store in state for access
    state.shaderUniforms = uniforms;
    state.shaderTargets = {
        color1: new THREE.Color(0.0, 1.0, 1.0),
        color2: new THREE.Color(0.6, 0.0, 1.0),
        speed: 0.1,
        scale: 3.0,
        distortion: 0.1
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
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform float uSpeed;
            uniform float uScale;
            uniform float uDistortion;
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
                
                // Use uniforms
                float noise = snoise(uv * uScale + uTime * uSpeed);
                float noise2 = snoise(uv * (uScale * 0.5) - uTime * (uSpeed * 0.5));
                
                // Distortion
                vec2 distUV = uv + vec2(noise * 0.1, noise2 * 0.1) * uDistortion;
                float noise3 = snoise(distUV * 1.5 + uTime * 0.05);

                vec3 bg = vec3(0.02, 0.02, 0.05); 
                
                float n = smoothstep(0.2, 0.8, noise + noise3 * 0.5);
                
                vec3 finalColor = bg + n * uColor1 * 0.15 + noise2 * uColor2 * 0.1;
                
                // Scanline
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

        // Smoothly interpolate towards targets
        if (state.shaderTargets) {
            const lerpFactor = 0.02;
            uniforms.uColor1.value.lerp(state.shaderTargets.color1, lerpFactor);
            uniforms.uColor2.value.lerp(state.shaderTargets.color2, lerpFactor);
            uniforms.uSpeed.value += (state.shaderTargets.speed - uniforms.uSpeed.value) * lerpFactor;
            uniforms.uScale.value += (state.shaderTargets.scale - uniforms.uScale.value) * lerpFactor;
            uniforms.uDistortion.value += (state.shaderTargets.distortion - uniforms.uDistortion.value) * lerpFactor;
        }

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

// ── Shader Utilities ─────────────────────────────────────────────────────────

function updateShaderParams(node, index) {
    if (!state.shaderTargets) return;

    // Create a seed based on unique ID or index if ID is missing.
    // Use index + ID hash to ensure it's stable for this specific item.
    // Use a string hash for the seed
    const str = (node.id || 'node') + index;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    let seed = Math.abs(hash);

    function rand() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Generate procedural values

    // Color 1: Primary
    const r1 = rand();
    const g1 = rand();
    const b1 = rand();

    // Color 2: Secondary
    const r2 = rand();
    const g2 = rand();
    const b2 = rand();

    // Params
    // Speed: 0.05 - 0.5
    const speed = 0.05 + rand() * 0.45;

    // Scale: 1.0 - 6.0
    const scale = 1.0 + rand() * 5.0;

    // Distortion: 0.0 - 2.0
    const distortion = rand() * 2.0;

    // Apply to targets
    state.shaderTargets.color1.setRGB(r1, g1, b1);
    state.shaderTargets.color2.setRGB(r2, g2, b2);
    state.shaderTargets.speed = speed;
    state.shaderTargets.scale = scale;
    state.shaderTargets.distortion = distortion;
}



