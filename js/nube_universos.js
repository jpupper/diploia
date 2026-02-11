import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// ═══════════════════════════════════════════════
//  DATA – embedded from mapa_herramientas_data.json
// ═══════════════════════════════════════════════
const DATA_URL = 'mapa_herramientas_data.json';

// ═══════════════════════════════════════════════
//  COLOR PALETTE per category
// ═══════════════════════════════════════════════
const CAT_COLORS = {
    engines: 0xff6b35,
    frameworks: 0x00d4ff,
    ia: 0xb44dff,
    shaders: 0x00ff88,
    db: 0xffd700,
    ides: 0xff4d8b,
    languages: 0x00c9a7,
    llm: 0xe864ff,
    frontend: 0x4d94ff,
    os: 0x8bff4d,
    soportes: 0xff9f43,
    protocolos: 0x54e0ff,
    'software-multimedia': 0xff6688,
    entornos: 0x88cc44,
    glosario: 0xccaa88,
};

// ═══════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════
let scene, camera, renderer, controls;
let raycaster, mouse;
let DATA;
let categoryObjects = {};   // { catId: { group, nucleus, planets:[], label } }
let allMeshes = [];         // for raycasting
let meshToNode = new Map(); // mesh → node data
let connectionLines = [];
let secondaryLines = [];
let sunLines = [];           // sun → category lines
let sunMesh = null;          // central sun mesh
let allLabelSprites = [];    // for toggle visibility
let labelsVisible = false;   // toggled by N key
let starPoints = null;       // starfield Points mesh
let starTwinklePhases = null; // per-star twinkle offset
let starTwinkleSpeeds = null; // per-star twinkle speed
let starBaseSizes = null;    // original star sizes

let currentCatIndex = 0;
let categories = [];
let isTransitioning = false;
let targetCamPos = null;
let targetCamLookAt = null;
let currentLookAt = null;
let zoomLevel = 1;
const ZOOM_MIN = 0.4, ZOOM_MAX = 3;
const TRANSITION_SPEED = 0.035;

let clock = null;
let animTime = 0;

// ── Selection state ──
let selectedMesh = null;
let selectedOrigScale = null;

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
async function init() {
    // Init THREE objects
    targetCamPos = new THREE.Vector3();
    targetCamLookAt = new THREE.Vector3();
    currentLookAt = new THREE.Vector3();
    clock = new THREE.Clock();

    // Load data
    const resp = await fetch(DATA_URL);
    DATA = await resp.json();
    categories = DATA.categories;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060e, 0.00015);

    // Camera
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 50000);
    camera.position.set(0, 200, 600);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 80;
    controls.maxDistance = 5000;
    controls.enablePan = false;

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Lights
    const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
    scene.add(ambientLight);

    // Stars background
    createStarfield();

    // Build central sun
    buildCentralSun();

    // Build universes
    buildUniverses();

    // Build connections
    buildConnections();

    // Build sun connection lines
    buildSunConnections();

    // Build HUD dots
    buildCategoryDots();

    // Navigate to first
    navigateToCategory(0, true);

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    document.getElementById('btn-prev').addEventListener('click', () => navigateToCategory(currentCatIndex - 1));
    document.getElementById('btn-next').addEventListener('click', () => navigateToCategory(currentCatIndex + 1));
    document.getElementById('btn-zin').addEventListener('click', () => adjustZoom(-0.15));
    document.getElementById('btn-zout').addEventListener('click', () => adjustZoom(0.15));
    document.getElementById('info-close').addEventListener('click', closeInfoPanel);

    // Hide loader
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        setTimeout(() => document.getElementById('loading').remove(), 800);
    }, 600);

    // Animate
    animate();
}

// ═══════════════════════════════════════════════
//  STARFIELD
// ═══════════════════════════════════════════════
function createStarfield() {
    const count = 8000;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = 5000 + Math.random() * 20000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const brightness = 0.3 + Math.random() * 0.7;
        const tint = Math.random();
        colors[i * 3] = brightness * (0.8 + tint * 0.2);
        colors[i * 3 + 1] = brightness * (0.85 + tint * 0.15);
        colors[i * 3 + 2] = brightness;

        sizes[i] = 0.5 + Math.random() * 2.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    scene.add(new THREE.Points(geo, mat));

    // Store reference for twinkling
    starPoints = scene.children[scene.children.length - 1];
    starBaseSizes = new Float32Array(sizes);
    starTwinklePhases = new Float32Array(count);
    starTwinkleSpeeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        starTwinklePhases[i] = Math.random() * Math.PI * 2;
        starTwinkleSpeeds[i] = 0.5 + Math.random() * 3.0;
    }
}

// ═══════════════════════════════════════════════
//  CENTRAL SUN
// ═══════════════════════════════════════════════
function buildCentralSun() {
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 0, 0);
    scene.add(sunGroup);

    // Core sphere
    const sunGeo = new THREE.SphereGeometry(50, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        color: 0xffcc44,
        emissive: 0xffaa00,
        emissiveIntensity: 1.0,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
    });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    // Inner glow
    const glow1 = new THREE.Mesh(
        new THREE.SphereGeometry(65, 32, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffcc44,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    sunGroup.add(glow1);

    // Outer glow
    const glow2 = new THREE.Mesh(
        new THREE.SphereGeometry(100, 24, 24),
        new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        })
    );
    sunGroup.add(glow2);

    // Sun point light
    const sunLight = new THREE.PointLight(0xffcc44, 3, 5000, 1);
    sunGroup.add(sunLight);

    // Register for raycasting
    const rootNode = DATA.nodes['root'] || { id: 'root', label: 'Arte Generativo y Código con IA', type: 'root' };
    allMeshes.push(sunMesh);
    meshToNode.set(sunMesh, rootNode);

    // Sun label sprite
    const label = createTextSprite('Arte Generativo', 0xffcc44, 18);
    label.position.set(0, 70, 0);
    label.visible = false;
    sunGroup.add(label);
    allLabelSprites.push(label);
}

function buildSunConnections() {
    const sunPos = new THREE.Vector3(0, 0, 0);
    const sunColor = new THREE.Color(0xffcc44);

    categories.forEach(catId => {
        const catObj = categoryObjects[catId];
        if (!catObj) return;

        const catPos = catObj.group.position.clone();
        const lineGeo = new THREE.BufferGeometry().setFromPoints([sunPos, catPos]);
        const lineMat = new THREE.LineBasicMaterial({
            color: sunColor,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        sunLines.push(line);
    });
}

// ═══════════════════════════════════════════════
//  TEXT SPRITE (for labels)
// ═══════════════════════════════════════════════
function createTextSprite(text, color, fontSize = 14) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = `${fontSize * 4}px Outfit, sans-serif`;
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    canvas.width = textWidth + 40;
    canvas.height = fontSize * 6;

    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow glow
    const c = new THREE.Color(color);
    ctx.shadowColor = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(canvas.width / 8, canvas.height / 8, 1);
    return sprite;
}

// ═══════════════════════════════════════════════
//  BUILD UNIVERSES
// ═══════════════════════════════════════════════
function buildUniverses() {
    const catCount = categories.length;
    const ringRadius = 1800;

    categories.forEach((catId, i) => {
        const node = DATA.nodes[catId];
        if (!node) return;

        const angle = (i / catCount) * Math.PI * 2 - Math.PI / 2;
        const cx = Math.cos(angle) * ringRadius;
        const cz = Math.sin(angle) * ringRadius;

        const group = new THREE.Group();
        group.position.set(cx, 0, cz);
        scene.add(group);

        const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);

        // ── Nucleus (glowing sphere) ──
        const nucleusGeo = new THREE.SphereGeometry(28, 48, 48);
        const nucleusMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            roughness: 0.3,
            metalness: 0.2,
            transparent: true,
            opacity: 0.92,
        });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
        group.add(nucleus);

        // Glow shell
        const glowGeo = new THREE.SphereGeometry(36, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        group.add(glow);

        // Outer glow
        const outerGlowGeo = new THREE.SphereGeometry(55, 24, 24);
        const outerGlowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.03,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        group.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));

        // Point light
        const light = new THREE.PointLight(color, 1.5, 600, 1.5);
        group.add(light);

        // Register for raycasting
        allMeshes.push(nucleus);
        meshToNode.set(nucleus, node);

        // ── Category label sprite ──
        const catLabel = createTextSprite(node.label || catId, CAT_COLORS[catId] || 0xffffff, 16);
        catLabel.position.set(0, 45, 0);
        catLabel.visible = false;
        group.add(catLabel);
        allLabelSprites.push(catLabel);

        // ── Orbiting planets (children tools) ──
        const planets = [];
        const children = DATA.categoryChildren[catId] || [];
        const childCount = children.length;

        children.forEach((childId, ci) => {
            const childNode = DATA.nodes[childId];
            if (!childNode) return;

            const orbitRadius = 90 + (ci % 3) * 50 + Math.random() * 20;
            const orbitAngle = (ci / childCount) * Math.PI * 2;
            const orbitTilt = (Math.random() - 0.5) * 0.5;

            const px = Math.cos(orbitAngle) * orbitRadius;
            const py = Math.sin(orbitTilt) * orbitRadius * 0.3;
            const pz = Math.sin(orbitAngle) * orbitRadius;

            // Planet sphere
            const pGeo = new THREE.SphereGeometry(8, 24, 24);
            const pColor = color.clone().lerp(new THREE.Color(0xffffff), 0.3);
            const pMat = new THREE.MeshStandardMaterial({
                color: pColor,
                emissive: pColor,
                emissiveIntensity: 0.35,
                roughness: 0.5,
                metalness: 0.3,
                transparent: true,
                opacity: 0.9,
            });
            const planet = new THREE.Mesh(pGeo, pMat);
            planet.position.set(px, py, pz);
            group.add(planet);

            // Planet glow
            const pgGeo = new THREE.SphereGeometry(12, 16, 16);
            const pgMat = new THREE.MeshBasicMaterial({
                color: pColor,
                transparent: true,
                opacity: 0.06,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const pglow = new THREE.Mesh(pgGeo, pgMat);
            planet.add(pglow);

            // Store orbit params for animation
            planet.userData = {
                orbitRadius,
                orbitSpeed: 0.15 + Math.random() * 0.25,
                orbitOffset: orbitAngle,
                orbitTilt,
                parentGroup: group,
            };

            // Planet label sprite
            const pLabel = createTextSprite(childNode.label || childId, CAT_COLORS[catId] || 0xffffff, 12);
            pLabel.position.set(0, 14, 0);
            pLabel.visible = false;
            planet.add(pLabel);
            allLabelSprites.push(pLabel);

            allMeshes.push(planet);
            meshToNode.set(planet, childNode);
            planets.push(planet);
        });

        // ── Orbit ring ──
        const ringGeo = new THREE.RingGeometry(88, 90, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.06,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);

        // Store
        categoryObjects[catId] = { group, nucleus, glow, planets, color };
    });
}

// ═══════════════════════════════════════════════
//  BUILD CONNECTIONS (Constellation Lines)
// ═══════════════════════════════════════════════
function buildConnections() {
    // Primary connections: category nucleus → planet tools
    categories.forEach(catId => {
        const catObj = categoryObjects[catId];
        if (!catObj) return;

        const catPos = catObj.group.position;
        const color = catObj.color;

        catObj.planets.forEach(planet => {
            const worldPos = new THREE.Vector3();
            planet.getWorldPosition(worldPos);

            const lineGeo = new THREE.BufferGeometry().setFromPoints([catPos, worldPos]);
            const lineMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.18,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            connectionLines.push({ line, from: catObj.nucleus, to: planet, color, type: 'primary' });
        });
    });

    // Secondary connections: tool → tool (cross-category)
    Object.values(DATA.nodes).forEach(node => {
        if (!node.connections || !node.connections.secondary) return;
        const secondaries = node.connections.secondary;
        if (!Array.isArray(secondaries) || secondaries.length === 0) return;

        // Find source mesh
        let sourceMesh = null;
        for (const [mesh, n] of meshToNode) {
            if (n.id === node.id) { sourceMesh = mesh; break; }
        }
        if (!sourceMesh) return;

        secondaries.forEach(targetId => {
            // Find target mesh
            let targetMesh = null;
            for (const [mesh, n] of meshToNode) {
                if (n.id === targetId) { targetMesh = mesh; break; }
            }
            if (!targetMesh) return;

            const sp = new THREE.Vector3();
            const tp = new THREE.Vector3();
            sourceMesh.getWorldPosition(sp);
            targetMesh.getWorldPosition(tp);

            const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
            const lineMat = new THREE.LineBasicMaterial({
                color: 0x4488cc,
                transparent: true,
                opacity: 0.04,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            secondaryLines.push({ line, from: sourceMesh, to: targetMesh });
        });
    });
}

// ═══════════════════════════════════════════════
//  UPDATE CONNECTIONS
// ═══════════════════════════════════════════════
function updateConnections() {
    const sp = new THREE.Vector3();
    const tp = new THREE.Vector3();

    connectionLines.forEach(c => {
        c.from.getWorldPosition(sp);
        c.to.getWorldPosition(tp);
        const positions = c.line.geometry.attributes.position.array;
        positions[0] = sp.x; positions[1] = sp.y; positions[2] = sp.z;
        positions[3] = tp.x; positions[4] = tp.y; positions[5] = tp.z;
        c.line.geometry.attributes.position.needsUpdate = true;
    });

    secondaryLines.forEach(c => {
        c.from.getWorldPosition(sp);
        c.to.getWorldPosition(tp);
        const positions = c.line.geometry.attributes.position.array;
        positions[0] = sp.x; positions[1] = sp.y; positions[2] = sp.z;
        positions[3] = tp.x; positions[4] = tp.y; positions[5] = tp.z;
        c.line.geometry.attributes.position.needsUpdate = true;
    });
}

// ═══════════════════════════════════════════════
//  HUD – Category Dots
// ═══════════════════════════════════════════════
function buildCategoryDots() {
    const container = document.getElementById('cat-dots');
    categories.forEach((catId, i) => {
        const dot = document.createElement('div');
        dot.className = 'cat-dot';
        const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);
        dot.style.background = '#' + color.getHexString();
        dot.style.borderColor = '#' + color.getHexString();

        const label = document.createElement('span');
        label.className = 'cat-dot-label';
        const node = DATA.nodes[catId];
        label.textContent = node ? node.label : catId;
        dot.appendChild(label);

        dot.addEventListener('click', () => navigateToCategory(i));
        container.appendChild(dot);
    });
}

function updateCategoryDots() {
    const dots = document.querySelectorAll('.cat-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentCatIndex));
}

// ═══════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════
function navigateToCategory(index, instant = false) {
    if (isTransitioning && !instant) return;

    // Wrap
    if (index < 0) index = categories.length - 1;
    if (index >= categories.length) index = 0;

    currentCatIndex = index;
    const catId = categories[index];
    const catObj = categoryObjects[catId];
    if (!catObj) return;

    const node = DATA.nodes[catId];
    const childCount = (DATA.categoryChildren[catId] || []).length;
    const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);

    // Update HUD
    const labelEl = document.getElementById('cat-label-text');
    labelEl.textContent = node ? node.label : catId;
    labelEl.style.color = '#' + color.getHexString();
    document.getElementById('cat-count-text').textContent =
        `${childCount} herramienta${childCount !== 1 ? 's' : ''} · ${index + 1}/${categories.length}`;

    updateCategoryDots();

    // Camera target
    const pos = catObj.group.position;
    const dist = 350 * zoomLevel;
    targetCamPos.set(pos.x + dist * 0.6, pos.y + dist * 0.35, pos.z + dist * 0.7);
    targetCamLookAt.copy(pos);

    if (instant) {
        camera.position.copy(targetCamPos);
        controls.target.copy(targetCamLookAt);
        currentLookAt.copy(targetCamLookAt);
        controls.update();
    } else {
        isTransitioning = true;
    }

    closeInfoPanel();
}

function adjustZoom(delta) {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));
    navigateToCategory(currentCatIndex);
}

// ═══════════════════════════════════════════════
//  INFO PANEL
// ═══════════════════════════════════════════════
function showInfoPanel(node) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');

    let html = '';
    if (node.infoHTML) {
        html += node.infoHTML.replace(/\\n/g, '\n');
    } else {
        html += `<h3>${node.label || node.id}</h3>`;
        if (node.info) html += `<p>${node.info}</p>`;
    }

    if (node.url) {
        html += `<p style="margin-top:12px"><a href="${node.url}" target="_blank">🔗 ${node.url}</a></p>`;
    }

    // Secondary connections as tags
    const secondaries = node.connections?.secondary || [];
    if (secondaries.length > 0) {
        html += '<p style="margin-top:10px;color:rgba(255,255,255,0.45);font-size:0.78rem">Conexiones:</p>';
        secondaries.forEach(s => {
            const sNode = DATA.nodes[s];
            const label = sNode ? sNode.label : s;
            html += `<span class="tag">${label}</span>`;
        });
    }

    content.innerHTML = html;
    panel.classList.add('visible');
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('visible');
}

// ═══════════════════════════════════════════════
//  SELECTION HELPERS
// ═══════════════════════════════════════════════
function selectMesh(mesh) {
    // Deselect previous
    deselectMesh();

    if (!mesh || !mesh.material) return;

    selectedMesh = mesh;

    // Store original values
    if (mesh.userData._origEmissive === undefined) {
        mesh.userData._origEmissive = mesh.material.emissiveIntensity;
    }
    if (mesh.userData._origScale === undefined) {
        mesh.userData._origScale = mesh.scale.clone();
    }

    // Apply selected visual: brighter emissive + slight scale up
    mesh.material.emissiveIntensity = 1.5;
    mesh.scale.copy(mesh.userData._origScale).multiplyScalar(1.3);
}

function deselectMesh() {
    if (!selectedMesh || !selectedMesh.material) return;

    selectedMesh.material.emissiveIntensity = selectedMesh.userData._origEmissive || 0.35;
    if (selectedMesh.userData._origScale) {
        selectedMesh.scale.copy(selectedMesh.userData._origScale);
    }
    selectedMesh = null;
}

// ═══════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════
function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
}

function onKeyDown(e) {
    switch (e.key) {
        case 'ArrowLeft': navigateToCategory(currentCatIndex - 1); break;
        case 'ArrowRight': navigateToCategory(currentCatIndex + 1); break;
        case 'ArrowUp': adjustZoom(-0.15); break;
        case 'ArrowDown': adjustZoom(0.15); break;
        case 'Escape':
            closeInfoPanel();
            deselectMesh();
            break;
        case 'n': case 'N':
            labelsVisible = !labelsVisible;
            allLabelSprites.forEach(s => s.visible = labelsVisible);
            break;
    }
}

function onClick(e) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
        const mesh = hits[0].object;
        const node = meshToNode.get(mesh);

        // Select the clicked mesh (toggle if same)
        if (selectedMesh === mesh) {
            deselectMesh();
            closeInfoPanel();
        } else {
            selectMesh(mesh);
            if (node) showInfoPanel(node);
        }
    } else {
        // Clicked empty space: deselect
        deselectMesh();
        closeInfoPanel();
    }
}

function onDoubleClick(e) {
    e.preventDefault();
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
        const mesh = hits[0].object;
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);

        // Determine zoom distance based on mesh size
        const sphereGeo = mesh.geometry;
        let radius = 30;
        if (sphereGeo && sphereGeo.parameters) {
            radius = sphereGeo.parameters.radius || 30;
        }
        const dist = radius * 5;

        // Camera offset: slightly above and in front
        const dir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
        targetCamPos.copy(worldPos).add(dir.multiplyScalar(dist));
        targetCamPos.y += dist * 0.3;
        targetCamLookAt.copy(worldPos);
        currentLookAt.copy(controls.target);
        isTransitioning = true;

        // Select and show info panel
        selectMesh(mesh);
        const node = meshToNode.get(mesh);
        if (node) showInfoPanel(node);
    }
}

let hoveredMesh = null;
const tooltip = document.getElementById('hover-tooltip');

function onMouseMove(e) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);

    // Reset previous hover (but not if it's the selected mesh)
    if (hoveredMesh && hoveredMesh !== selectedMesh && hoveredMesh.material) {
        hoveredMesh.material.emissiveIntensity = hoveredMesh.userData._origEmissive || 0.35;
        if (hoveredMesh.userData._origScale) {
            hoveredMesh.scale.copy(hoveredMesh.userData._origScale);
        }
    }

    if (hits.length > 0) {
        const mesh = hits[0].object;
        renderer.domElement.style.cursor = 'pointer';

        if (mesh.material) {
            // Store original emissive if not yet stored
            if (mesh.userData._origEmissive === undefined) {
                mesh.userData._origEmissive = mesh.material.emissiveIntensity;
            }
            // Store original scale if not yet stored
            if (mesh.userData._origScale === undefined) {
                mesh.userData._origScale = mesh.scale.clone();
            }

            // Apply hover effect (different from selected)
            if (mesh === selectedMesh) {
                // Selected mesh: keep selected intensity + scale
                mesh.material.emissiveIntensity = 1.6;
                mesh.scale.copy(mesh.userData._origScale).multiplyScalar(1.35);
            } else {
                // Normal hover: moderate glow + slight scale
                mesh.material.emissiveIntensity = 1.0;
                mesh.scale.copy(mesh.userData._origScale).multiplyScalar(1.15);
            }
        }
        hoveredMesh = mesh;

        // Show tooltip
        const node = meshToNode.get(mesh);
        if (node) {
            tooltip.textContent = node.label || node.id;
            tooltip.style.left = (e.clientX + 16) + 'px';
            tooltip.style.top = (e.clientY - 12) + 'px';
            tooltip.classList.add('visible');
        }
    } else {
        renderer.domElement.style.cursor = 'default';
        hoveredMesh = null;
        tooltip.classList.remove('visible');
    }
}

// ═══════════════════════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════════════════════
function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();
    animTime += dt;

    // ── Animate planet orbits ──
    Object.values(categoryObjects).forEach(catObj => {
        catObj.planets.forEach(planet => {
            const u = planet.userData;
            const a = u.orbitOffset + animTime * u.orbitSpeed;
            const r = u.orbitRadius;
            planet.position.x = Math.cos(a) * r;
            planet.position.y = Math.sin(u.orbitTilt + animTime * 0.2) * r * 0.25;
            planet.position.z = Math.sin(a) * r;
        });

        // Nucleus pulse
        const pulse = 0.92 + Math.sin(animTime * 1.5) * 0.05;
        catObj.nucleus.material.opacity = pulse;
        // Only pulse emissive if nucleus is not selected/hovered
        if (catObj.nucleus !== selectedMesh && catObj.nucleus !== hoveredMesh) {
            catObj.nucleus.material.emissiveIntensity = 0.5 + Math.sin(animTime * 2) * 0.15;
        }
    });

    // Sun pulse
    if (sunMesh) {
        if (sunMesh !== selectedMesh && sunMesh !== hoveredMesh) {
            sunMesh.material.emissiveIntensity = 0.8 + Math.sin(animTime * 1.2) * 0.3;
        }
        sunMesh.material.opacity = 0.9 + Math.sin(animTime * 1.8) * 0.05;
    }

    // ── Twinkling stars ──
    if (starPoints && starBaseSizes) {
        const sizeAttr = starPoints.geometry.getAttribute('size');
        for (let i = 0; i < starBaseSizes.length; i++) {
            const twinkle = Math.sin(animTime * starTwinkleSpeeds[i] + starTwinklePhases[i]);
            sizeAttr.array[i] = starBaseSizes[i] * (0.3 + 0.7 * (twinkle * 0.5 + 0.5));
        }
        sizeAttr.needsUpdate = true;
    }

    // ── Update connection lines ──
    updateConnections();

    // ── Smooth camera transition ──
    if (isTransitioning) {
        camera.position.lerp(targetCamPos, TRANSITION_SPEED);
        currentLookAt.lerp(targetCamLookAt, TRANSITION_SPEED);
        controls.target.copy(currentLookAt);

        if (camera.position.distanceTo(targetCamPos) < 2) {
            isTransitioning = false;
        }
    }

    // ── Highlight current universe connections ──
    const currentCat = categories[currentCatIndex];
    connectionLines.forEach(c => {
        const nodeFrom = meshToNode.get(c.from);
        const nodeTo = meshToNode.get(c.to);
        const isActive = (nodeFrom && nodeFrom.id === currentCat) || (nodeTo && nodeTo.id === currentCat);
        c.line.material.opacity = isActive ? 0.35 : 0.06;
    });

    secondaryLines.forEach(c => {
        const nodeFrom = meshToNode.get(c.from);
        const nodeTo = meshToNode.get(c.to);
        // Check if either end belongs to current category's children
        const currentChildren = DATA.categoryChildren[currentCat] || [];
        const isActive = currentChildren.includes(nodeFrom?.id) || currentChildren.includes(nodeTo?.id) ||
            nodeFrom?.id === currentCat || nodeTo?.id === currentCat;
        c.line.material.opacity = isActive ? 0.12 : 0.02;
    });

    controls.update();
    renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════
init().catch(err => {
    console.error('Error loading:', err);
    document.getElementById('loading').innerHTML =
        '<p style="color:#ff6666">Error cargando datos. Verifica que mapa_herramientas_data.json esté en la misma carpeta.</p>';
});
