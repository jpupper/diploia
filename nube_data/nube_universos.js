import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════
//  SHORTCUTS
// ═══════════════════════════════════════════════
const CFG = CONFIG;
const CAT_COLORS = CFG.categoryColors;

// ═══════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════
let scene, camera, renderer, controls;
let raycaster, mouse;
let DATA;
let categoryObjects = {};
let allMeshes = [];
let meshToNode = new Map();
let connectionLines = [];
let secondaryLines = [];
let sunLines = [];
let sunMesh = null;
let allLabelSprites = [];
let labelsVisible = false;
let starPoints = null;
let starTwinklePhases = null;
let starTwinkleSpeeds = null;
let starBaseSizes = null;

let currentCatIndex = 0;
let categories = [];
let isTransitioning = false;
let targetCamPos = null;
let targetCamLookAt = null;
let currentLookAt = null;
let zoomLevel = 1;

let clock = null;
let animTime = 0;

// ── Selection state ──
let selectedMesh = null;

// ── View modes ──
const VIEW_GLOBAL = 'global';
const VIEW_CAMERA = 'camera';
const VIEW_SHIP   = 'ship';
let currentView = VIEW_GLOBAL;

// ── Camera Follow state (CAMARA mode) ──
let followYaw = 0;
let followPitch = 0.3;
let followDistance = CFG.follow.distance;
let followYawVelocity = 0;
let followPitchVelocity = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let cameraMouseDown = false;

// ── Show All Connections toggle ──
let showAllConnections = false;

// ── Ship aimed mesh (for neon connection highlight) ──
let shipAimedMesh = null;
let shipAimedLines = [];

// ── Spaceship state (NAVE mode) ──
let shipVelocity = new THREE.Vector3();
let shipThrottle = 0;
let shipYaw = 0;
let shipPitch = 0;
let shipKeys = { w: false, s: false, a: false, d: false, q: false, e: false, shift: false, space: false };
let pointerLocked = false;

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
async function init() {
    targetCamPos = new THREE.Vector3();
    targetCamLookAt = new THREE.Vector3();
    currentLookAt = new THREE.Vector3();
    clock = new THREE.Clock();

    const resp = await fetch(CFG.dataUrl);
    DATA = await resp.json();
    categories = DATA.categories;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(CFG.scene.fogColor, CFG.scene.fogDensity);

    camera = new THREE.PerspectiveCamera(CFG.camera.fov, innerWidth / innerHeight, CFG.camera.near, CFG.camera.far);
    const ip = CFG.camera.initialPosition;
    camera.position.set(ip.x, ip.y, ip.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CFG.scene.toneExposure;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = CFG.camera.orbitDamping;
    controls.rotateSpeed = CFG.camera.orbitRotateSpeed;
    controls.minDistance = CFG.camera.orbitMinDistance;
    controls.maxDistance = CFG.camera.orbitMaxDistance;
    controls.enablePan = false;

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    scene.add(new THREE.AmbientLight(CFG.scene.ambientColor, CFG.scene.ambientIntensity));

    createStarfield();
    buildCentralSun();
    buildUniverses();
    buildConnections();
    buildSunConnections();
    buildCategoryDots();
    navigateToCategory(0, true);

    // Events
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    document.getElementById('btn-prev').addEventListener('click', (e) => { e.stopPropagation(); navigateToCategory(currentCatIndex - 1); });
    document.getElementById('btn-next').addEventListener('click', (e) => { e.stopPropagation(); navigateToCategory(currentCatIndex + 1); });
    document.getElementById('btn-zin').addEventListener('click', (e) => { e.stopPropagation(); adjustZoom(-CFG.camera.zoomStep); });
    document.getElementById('btn-zout').addEventListener('click', (e) => { e.stopPropagation(); adjustZoom(CFG.camera.zoomStep); });
    document.getElementById('info-close').addEventListener('click', closeInfoPanel);

    // View mode buttons
    document.getElementById('btn-view-global').addEventListener('click', () => setViewMode(VIEW_GLOBAL));
    document.getElementById('btn-view-camera').addEventListener('click', () => setViewMode(VIEW_CAMERA));
    document.getElementById('btn-view-ship').addEventListener('click', () => setViewMode(VIEW_SHIP));

    // Show All Connections toggle
    document.getElementById('btn-show-connections').addEventListener('click', () => {
        showAllConnections = !showAllConnections;
        document.getElementById('btn-show-connections').classList.toggle('active', showAllConnections);
    });

    // Pointer lock for ship mode only
    document.addEventListener('pointerlockchange', () => {
        pointerLocked = document.pointerLockElement === renderer.domElement;
    });

    // Mouse wheel zoom (global mode) / distance (camera mode)
    renderer.domElement.addEventListener('wheel', (e) => {
        if (currentView === VIEW_GLOBAL) {
            e.preventDefault();
            adjustZoom(e.deltaY > 0 ? 0.1 : -0.1);
        } else if (currentView === VIEW_CAMERA) {
            e.preventDefault();
            followDistance = Math.max(20, Math.min(300, followDistance + (e.deltaY > 0 ? 5 : -5)));
        }
    }, { passive: false });

    // Hide loader, show splash
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        setTimeout(() => { const el = document.getElementById('loading'); if (el) el.remove(); }, 800);
        // Show splash screen
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('visible');
            const startBtn = document.getElementById('splash-start');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    splash.classList.remove('visible');
                    setTimeout(() => splash.remove(), 800);
                });
            }
        }
    }, 600);

    animate();
}

// ═══════════════════════════════════════════════
//  VIEW MODE
// ═══════════════════════════════════════════════
function setViewMode(mode) {
    // If switching to CAMERA mode without a selected planet, don't allow
    if (mode === VIEW_CAMERA && !selectedMesh) {
        // Flash the selection indicator to hint user needs to select something
        const ind = document.getElementById('selection-indicator');
        ind.classList.add('visible');
        document.getElementById('sel-planet-text').textContent = 'Seleccioná un planeta primero';
        document.getElementById('sel-category-text').textContent = '';
        setTimeout(() => { if (!selectedMesh) ind.classList.remove('visible'); }, 2000);
        return;
    }

    const prevView = currentView;
    currentView = mode;

    // Update buttons
    document.querySelectorAll('#view-mode-toggle .neon-btn').forEach(b => b.classList.remove('active'));
    if (mode === VIEW_GLOBAL) document.getElementById('btn-view-global').classList.add('active');
    else if (mode === VIEW_CAMERA) document.getElementById('btn-view-camera').classList.add('active');
    else if (mode === VIEW_SHIP) document.getElementById('btn-view-ship').classList.add('active');

    const orbitHud = document.getElementById('hud');
    const shipHud = document.getElementById('ship-hud');
    const cameraHint = document.getElementById('camera-hint');

    // Update category dots visibility — always-visible labels in camera mode
    updateCategoryDotsMode(mode);

    // Clean up ship aimed lines when leaving ship mode
    if (prevView === VIEW_SHIP && mode !== VIEW_SHIP) {
        clearShipAimedLines();
        if (shipHoveredMesh && shipHoveredMesh.material) {
            shipHoveredMesh.material.emissiveIntensity = shipHoveredMesh.userData._origEmissive || CFG.planet.emissiveIntensity;
            if (shipHoveredMesh.userData._origScale) shipHoveredMesh.scale.copy(shipHoveredMesh.userData._origScale);
        }
        shipHoveredMesh = null;
    }

    if (mode === VIEW_GLOBAL) {
        controls.enabled = true;
        orbitHud.style.display = '';
        shipHud.classList.remove('visible');
        if (cameraHint) cameraHint.classList.remove('visible');
        if (document.pointerLockElement) document.exitPointerLock();
        // Deselect and return to top-down
        deselectMesh();
        closeInfoPanel();
        clearEnergyParticles();
        isTransitioning = false;
        navigateToCategory(currentCatIndex);
    } else if (mode === VIEW_CAMERA) {
        controls.enabled = false;
        orbitHud.style.display = '';
        shipHud.classList.remove('visible');
        if (cameraHint) cameraHint.classList.add('visible');
        if (document.pointerLockElement) document.exitPointerLock();
        // Initialize follow angles from current camera direction relative to planet
        followYawVelocity = 0;
        followPitchVelocity = 0;
        cameraMouseDown = false;
        if (selectedMesh) {
            const wp = new THREE.Vector3();
            selectedMesh.getWorldPosition(wp);
            const diff = new THREE.Vector3().subVectors(camera.position, wp);
            followYaw = Math.atan2(diff.x, diff.z);
            followPitch = Math.atan2(diff.y, Math.sqrt(diff.x * diff.x + diff.z * diff.z));
            followDistance = diff.length();
        }
    } else if (mode === VIEW_SHIP) {
        controls.enabled = false;
        orbitHud.style.display = 'none';
        shipHud.classList.add('visible');
        if (cameraHint) cameraHint.classList.remove('visible');
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        shipYaw = Math.atan2(dir.x, dir.z);
        shipPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
        shipVelocity.set(0, 0, 0);
        shipThrottle = 0;
    }
}

// ═══════════════════════════════════════════════
//  STARFIELD
// ═══════════════════════════════════════════════
function createStarfield() {
    const S = CFG.stars;
    const count = S.count;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const r = S.minDistance + Math.random() * (S.maxDistance - S.minDistance);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const brightness = 0.3 + Math.random() * 0.7;
        const tint = Math.random();
        colors[i * 3]     = brightness * (0.8 + tint * 0.2);
        colors[i * 3 + 1] = brightness * (0.85 + tint * 0.15);
        colors[i * 3 + 2] = brightness;

        sizes[i] = S.sizeMin + Math.random() * S.sizeRandom;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        size: S.baseSize, vertexColors: true, transparent: true, opacity: S.opacity,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    scene.add(new THREE.Points(geo, mat));
    starPoints = scene.children[scene.children.length - 1];
    starBaseSizes = new Float32Array(sizes);
    starTwinklePhases = new Float32Array(count);
    starTwinkleSpeeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
        starTwinklePhases[i] = Math.random() * Math.PI * 2;
        starTwinkleSpeeds[i] = S.twinkleSpeedMin + Math.random() * S.twinkleSpeedRandom;
    }
}

// ═══════════════════════════════════════════════
//  CENTRAL SUN
// ═══════════════════════════════════════════════
function buildCentralSun() {
    const S = CFG.sun;
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 0, 0);
    scene.add(sunGroup);

    const sunGeo = new THREE.SphereGeometry(S.radius, 64, 64);
    const sunMat = new THREE.MeshStandardMaterial({
        color: S.color, emissive: S.emissiveColor, emissiveIntensity: S.emissiveIntensity,
        roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.95,
    });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunGroup.add(sunMesh);

    sunGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(S.glowInnerRadius, 32, 32),
        new THREE.MeshBasicMaterial({ color: S.color, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    sunGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(S.glowOuterRadius, 24, 24),
        new THREE.MeshBasicMaterial({ color: S.emissiveColor, transparent: true, opacity: 0.05, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
    sunGroup.add(new THREE.PointLight(S.color, S.lightIntensity, S.lightRange, 1));

    const rootNode = DATA.nodes['root'] || { id: 'root', label: 'Arte Generativo y Código con IA', type: 'root' };
    allMeshes.push(sunMesh);
    meshToNode.set(sunMesh, rootNode);

    const label = createTextSprite('Arte Generativo', S.color, S.labelFontSize);
    label.position.set(0, S.radius + 20, 0);
    label.visible = false;
    sunGroup.add(label);
    allLabelSprites.push(label);
}

function buildSunConnections() {
    const sunPos = new THREE.Vector3(0, 0, 0);
    const sunColor = new THREE.Color(CFG.sun.color);
    categories.forEach(catId => {
        const catObj = categoryObjects[catId];
        if (!catObj) return;
        const catPos = catObj.group.position.clone();
        const lineGeo = new THREE.BufferGeometry().setFromPoints([sunPos, catPos]);
        const lineMat = new THREE.LineBasicMaterial({
            color: sunColor, transparent: true, opacity: CFG.connections.sunLineOpacity,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        sunLines.push(line);
    });
}

// ═══════════════════════════════════════════════
//  TEXT SPRITE
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
    const c = new THREE.Color(color);
    ctx.shadowColor = `rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)})`;
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(canvas.width / 8, canvas.height / 8, 1);
    return sprite;
}

// ═══════════════════════════════════════════════
//  BUILD UNIVERSES
// ═══════════════════════════════════════════════
function buildUniverses() {
    const catCount = categories.length;
    const N = CFG.nucleus;
    const P = CFG.planet;
    const O = CFG.orbit;
    const ringRadius = CFG.layout.ringRadius;

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

        // Nucleus
        const nucleusGeo = new THREE.SphereGeometry(N.radius, 48, 48);
        const nucleusMat = new THREE.MeshStandardMaterial({
            color, emissive: color, emissiveIntensity: N.emissiveIntensity,
            roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.92,
        });
        const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
        group.add(nucleus);

        group.add(new THREE.Mesh(
            new THREE.SphereGeometry(N.glowInnerRadius, 32, 32),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
        ));
        group.add(new THREE.Mesh(
            new THREE.SphereGeometry(N.glowOuterRadius, 24, 24),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.03, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
        ));
        group.add(new THREE.PointLight(color, N.lightIntensity, N.lightRange, 1.5));

        allMeshes.push(nucleus);
        meshToNode.set(nucleus, node);

        const catLabel = createTextSprite(node.label || catId, CAT_COLORS[catId] || 0xffffff, N.labelFontSize);
        catLabel.position.set(0, N.labelOffsetY, 0);
        catLabel.visible = false;
        group.add(catLabel);
        allLabelSprites.push(catLabel);

        // Planets
        const planets = [];
        const children = DATA.categoryChildren[catId] || [];
        const childCount = children.length;

        children.forEach((childId, ci) => {
            const childNode = DATA.nodes[childId];
            if (!childNode) return;

            const orbitRadius = O.baseRadius + (ci % 3) * O.radiusStep + Math.random() * O.radiusRandom;
            // Spherical distribution with random offsets for unique positions
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            const theta = (2 * Math.PI * ci) / goldenRatio + (Math.random() - 0.5) * 0.8;
            const basePhi = Math.acos(1 - (2 * (ci + 0.5)) / childCount);
            const phi = basePhi + (Math.random() - 0.5) * 0.6; // random vertical spread
            const orbitAngle = theta;
            const orbitTilt = phi - Math.PI / 2;

            const px = Math.sin(phi) * Math.cos(theta) * orbitRadius;
            const py = Math.cos(phi) * orbitRadius;
            const pz = Math.sin(phi) * Math.sin(theta) * orbitRadius;

            const pGeo = new THREE.SphereGeometry(P.radius, 24, 24);
            const pColor = color.clone().lerp(new THREE.Color(0xffffff), P.colorLerpToWhite);
            const pMat = new THREE.MeshStandardMaterial({
                color: pColor, emissive: pColor, emissiveIntensity: P.emissiveIntensity,
                roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.9,
            });
            const planet = new THREE.Mesh(pGeo, pMat);
            planet.position.set(px, py, pz);
            group.add(planet);

            planet.add(new THREE.Mesh(
                new THREE.SphereGeometry(P.glowRadius, 16, 16),
                new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.06, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
            ));

            planet.userData = {
                orbitRadius,
                orbitSpeed: O.speedMin + Math.random() * O.speedRandom,
                orbitOffset: orbitAngle,
                orbitTilt,
                parentGroup: group,
                categoryId: catId,
            };

            const pLabel = createTextSprite(childNode.label || childId, CAT_COLORS[catId] || 0xffffff, P.labelFontSize);
            pLabel.position.set(0, P.labelOffsetY, 0);
            pLabel.visible = false;
            planet.add(pLabel);
            allLabelSprites.push(pLabel);

            allMeshes.push(planet);
            meshToNode.set(planet, childNode);
            planets.push(planet);
        });

        // Orbit ring
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(O.ringInner, O.ringOuter, 64),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);

        categoryObjects[catId] = { group, nucleus, planets, color };
    });
}

// ═══════════════════════════════════════════════
//  CONNECTIONS
// ═══════════════════════════════════════════════
function buildConnections() {
    const C = CFG.connections;
    categories.forEach(catId => {
        const catObj = categoryObjects[catId];
        if (!catObj) return;
        const catPos = catObj.group.position;
        const color = catObj.color;
        catObj.planets.forEach(planet => {
            const worldPos = new THREE.Vector3();
            planet.getWorldPosition(worldPos);
            const lineGeo = new THREE.BufferGeometry().setFromPoints([catPos, worldPos]);
            const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: C.primaryOpacity, blending: THREE.AdditiveBlending, depthWrite: false });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            connectionLines.push({ line, from: catObj.nucleus, to: planet, color, type: 'primary' });
        });
    });

    Object.values(DATA.nodes).forEach(node => {
        if (!node.connections || !node.connections.secondary) return;
        const secondaries = node.connections.secondary;
        if (!Array.isArray(secondaries) || secondaries.length === 0) return;
        let sourceMesh = null;
        for (const [mesh, n] of meshToNode) { if (n.id === node.id) { sourceMesh = mesh; break; } }
        if (!sourceMesh) return;
        secondaries.forEach(targetId => {
            let targetMesh = null;
            for (const [mesh, n] of meshToNode) { if (n.id === targetId) { targetMesh = mesh; break; } }
            if (!targetMesh) return;
            const sp = new THREE.Vector3(), tp = new THREE.Vector3();
            sourceMesh.getWorldPosition(sp); targetMesh.getWorldPosition(tp);
            const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
            const lineMat = new THREE.LineBasicMaterial({ color: C.secondaryColor, transparent: true, opacity: C.secondaryOpacity, blending: THREE.AdditiveBlending, depthWrite: false });
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            secondaryLines.push({ line, from: sourceMesh, to: targetMesh });
        });
    });
}

function updateConnections() {
    const sp = new THREE.Vector3(), tp = new THREE.Vector3();
    connectionLines.forEach(c => {
        c.from.getWorldPosition(sp); c.to.getWorldPosition(tp);
        const p = c.line.geometry.attributes.position.array;
        p[0] = sp.x; p[1] = sp.y; p[2] = sp.z; p[3] = tp.x; p[4] = tp.y; p[5] = tp.z;
        c.line.geometry.attributes.position.needsUpdate = true;
    });
    secondaryLines.forEach(c => {
        c.from.getWorldPosition(sp); c.to.getWorldPosition(tp);
        const p = c.line.geometry.attributes.position.array;
        p[0] = sp.x; p[1] = sp.y; p[2] = sp.z; p[3] = tp.x; p[4] = tp.y; p[5] = tp.z;
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

function updateCategoryDotsMode(mode) {
    const container = document.getElementById('cat-dots');
    if (!container) return;
    if (mode === VIEW_CAMERA) {
        container.classList.add('expanded');
    } else {
        container.classList.remove('expanded');
    }
}

// ═══════════════════════════════════════════════
//  NAVIGATION (GLOBAL mode)
// ═══════════════════════════════════════════════
function navigateToCategory(index, instant = false) {
    // Allow navigation from camera mode — switch to global first
    if (currentView === VIEW_CAMERA) {
        setViewMode(VIEW_GLOBAL);
    }
    if (currentView !== VIEW_GLOBAL) return;
    if (isTransitioning && !instant) return;

    if (index < 0) index = categories.length - 1;
    if (index >= categories.length) index = 0;

    currentCatIndex = index;
    const catId = categories[index];
    const catObj = categoryObjects[catId];
    if (!catObj) return;

    const node = DATA.nodes[catId];
    const childCount = (DATA.categoryChildren[catId] || []).length;
    const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);

    const labelEl = document.getElementById('cat-label-text');
    labelEl.textContent = node ? node.label : catId;
    labelEl.style.color = '#' + color.getHexString();
    document.getElementById('cat-count-text').textContent =
        `${childCount} herramienta${childCount !== 1 ? 's' : ''} · ${index + 1}/${categories.length}`;
    updateCategoryDots();

    const pos = catObj.group.position;
    const dist = CFG.camera.navDistMultiplier * zoomLevel;
    // Top-down view: camera directly above looking down
    targetCamPos.set(pos.x, dist * 1.2, pos.z);
    targetCamLookAt.copy(pos);

    if (instant) {
        camera.position.copy(targetCamPos);
        controls.target.copy(targetCamLookAt);
        currentLookAt.copy(targetCamLookAt);
        controls.update();
    } else {
        currentLookAt.copy(controls.target);
        isTransitioning = true;
    }
}

function adjustZoom(delta) {
    if (currentView !== VIEW_GLOBAL) return;
    const oldZoom = zoomLevel;
    zoomLevel = Math.max(CFG.camera.zoomMin, Math.min(CFG.camera.zoomMax, zoomLevel + delta));
    if (zoomLevel === oldZoom) return;

    const catId = categories[currentCatIndex];
    const catObj = categoryObjects[catId];
    if (!catObj) return;

    const pos = catObj.group.position;
    const dist = CFG.camera.navDistMultiplier * zoomLevel;
    // Top-down view
    targetCamPos.set(pos.x, dist * 1.2, pos.z);
    targetCamLookAt.copy(pos);
    currentLookAt.copy(controls.target);
    isTransitioning = true;
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
    const secondaries = node.connections?.secondary || [];
    if (secondaries.length > 0) {
        html += '<p style="margin-top:10px;color:rgba(255,255,255,0.45);font-size:0.78rem">Conexiones:</p>';
        secondaries.forEach(s => {
            const sNode = DATA.nodes[s];
            html += `<span class="tag">${sNode ? sNode.label : s}</span>`;
        });
    }
    content.innerHTML = html;
    panel.classList.add('visible');
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('visible');
}

// ═══════════════════════════════════════════════
//  SELECTION
// ═══════════════════════════════════════════════
function selectMesh(mesh) {
    deselectMesh();
    if (!mesh || !mesh.material) return;
    selectedMesh = mesh;
    if (mesh.userData._origEmissive === undefined) mesh.userData._origEmissive = mesh.material.emissiveIntensity;
    if (mesh.userData._origScale === undefined) mesh.userData._origScale = mesh.scale.clone();
    mesh.material.emissiveIntensity = CFG.selection.emissiveIntensity;
    mesh.scale.copy(mesh.userData._origScale).multiplyScalar(CFG.selection.scaleFactor);
    updateSelectionIndicator(mesh);
}

function deselectMesh() {
    if (selectedMesh && selectedMesh.material) {
        selectedMesh.material.emissiveIntensity = selectedMesh.userData._origEmissive || CFG.planet.emissiveIntensity;
        if (selectedMesh.userData._origScale) selectedMesh.scale.copy(selectedMesh.userData._origScale);
    }
    selectedMesh = null;
    hideSelectionIndicator();
}

function updateSelectionIndicator(mesh) {
    const indicator = document.getElementById('selection-indicator');
    const node = meshToNode.get(mesh);
    if (!node) return;

    document.getElementById('sel-planet-text').textContent = node.label || node.id;

    let catName = '';
    if (node.type === 'category') catName = 'Categoría';
    else if (node.type === 'root' || node.id === 'root') catName = 'Centro del Universo';
    else {
        for (const catId of categories) {
            if ((DATA.categoryChildren[catId] || []).includes(node.id)) {
                const catNode = DATA.nodes[catId];
                catName = catNode ? catNode.label : catId;
                break;
            }
        }
    }
    document.getElementById('sel-category-text').textContent = catName;

    let color = '#fff';
    if (mesh.userData.categoryId) color = '#' + new THREE.Color(CAT_COLORS[mesh.userData.categoryId] || 0xffffff).getHexString();
    else if (node.type === 'category') color = '#' + new THREE.Color(CAT_COLORS[node.id] || 0xffffff).getHexString();
    document.getElementById('sel-planet-text').style.color = color;

    indicator.classList.add('visible');
}

function hideSelectionIndicator() {
    document.getElementById('selection-indicator').classList.remove('visible');
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
    const k = e.key.toLowerCase();
    if (k === 'w') shipKeys.w = true;
    if (k === 's') shipKeys.s = true;
    if (k === 'a') shipKeys.a = true;
    if (k === 'd') shipKeys.d = true;
    if (k === 'q') shipKeys.q = true;
    if (k === 'e') shipKeys.e = true;
    if (k === 'shift') shipKeys.shift = true;
    if (k === ' ') shipKeys.space = true;

    if (currentView === VIEW_SHIP) {
        if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
        if (k === 'escape') { if (document.pointerLockElement) document.exitPointerLock(); }
        if (k === 'v') setViewMode(VIEW_GLOBAL);
        return;
    }

    if (currentView === VIEW_CAMERA) {
        if (k === 'escape' || k === 'v') { setViewMode(VIEW_GLOBAL); return; }
        return;
    }

    // Global mode keys
    switch (e.key) {
        case 'ArrowLeft': navigateToCategory(currentCatIndex - 1); break;
        case 'ArrowRight': navigateToCategory(currentCatIndex + 1); break;
        case 'ArrowUp': e.preventDefault(); adjustZoom(-CFG.camera.zoomStep); break;
        case 'ArrowDown': e.preventDefault(); adjustZoom(CFG.camera.zoomStep); break;
        case 'Escape': closeInfoPanel(); deselectMesh(); break;
        case 'n': case 'N':
            labelsVisible = !labelsVisible;
            allLabelSprites.forEach(s => s.visible = labelsVisible);
            break;
        case 'v': case 'V':
            if (selectedMesh) setViewMode(VIEW_CAMERA);
            break;
        case 'f': case 'F':
            setViewMode(VIEW_SHIP);
            break;
    }
}

function onKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === 'w') shipKeys.w = false;
    if (k === 's') shipKeys.s = false;
    if (k === 'a') shipKeys.a = false;
    if (k === 'd') shipKeys.d = false;
    if (k === 'q') shipKeys.q = false;
    if (k === 'e') shipKeys.e = false;
    if (k === 'shift') shipKeys.shift = false;
    if (k === ' ') shipKeys.space = false;
}

function onClick(e) {
    if (currentView === VIEW_SHIP) {
        renderer.domElement.requestPointerLock();
        return;
    }
    if (currentView === VIEW_CAMERA) {
        // Camera mode uses free mouse, no pointer lock needed
        return;
    }

    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);

    if (hits.length > 0) {
        const mesh = hits[0].object;
        const node = meshToNode.get(mesh);
        if (selectedMesh === mesh) {
            deselectMesh();
            closeInfoPanel();
        } else {
            selectMesh(mesh);
            if (node) showInfoPanel(node);
            // Spawn energy particles toward camera
            spawnEnergyParticles(mesh);
            // Auto-switch to Orbital mode
            setViewMode(VIEW_CAMERA);
        }
    } else {
        deselectMesh();
        closeInfoPanel();
    }
}

function onDoubleClick(e) {
    if (currentView !== VIEW_GLOBAL) return;
    e.preventDefault();
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);
    if (hits.length > 0) {
        const mesh = hits[0].object;
        selectMesh(mesh);
        const node = meshToNode.get(mesh);
        if (node) showInfoPanel(node);
        spawnEnergyParticles(mesh);
        setViewMode(VIEW_CAMERA);
    }
}

let hoveredMesh = null;
let tooltip = null;

function onMouseDown(e) {
    if (currentView === VIEW_CAMERA) {
        cameraMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }
}

function onMouseUp(e) {
    if (currentView === VIEW_CAMERA) {
        cameraMouseDown = false;
    }
}

function onMouseMove(e) {
    if (!tooltip) tooltip = document.getElementById('hover-tooltip');

    // Ship mode mouse look
    if (currentView === VIEW_SHIP && pointerLocked) {
        shipYaw -= e.movementX * CFG.ship.mouseSensitivity;
        shipPitch -= e.movementY * CFG.ship.mouseSensitivity;
        shipPitch = Math.max(CFG.ship.pitchMin, Math.min(CFG.ship.pitchMax, shipPitch));
        return;
    }

    // Camera follow mode — free mouse with velocity
    if (currentView === VIEW_CAMERA && cameraMouseDown) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;
        followYawVelocity -= dx * CFG.follow.mouseSensitivity * 2;
        followPitchVelocity += dy * CFG.follow.mouseSensitivity * 2;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        return;
    }

    if (currentView !== VIEW_GLOBAL) return;

    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes);

    if (hoveredMesh && hoveredMesh !== selectedMesh && hoveredMesh.material) {
        hoveredMesh.material.emissiveIntensity = hoveredMesh.userData._origEmissive || CFG.planet.emissiveIntensity;
        if (hoveredMesh.userData._origScale) hoveredMesh.scale.copy(hoveredMesh.userData._origScale);
    }

    if (hits.length > 0) {
        const mesh = hits[0].object;
        renderer.domElement.style.cursor = 'pointer';
        if (mesh.material) {
            if (mesh.userData._origEmissive === undefined) mesh.userData._origEmissive = mesh.material.emissiveIntensity;
            if (mesh.userData._origScale === undefined) mesh.userData._origScale = mesh.scale.clone();
            if (mesh === selectedMesh) {
                mesh.material.emissiveIntensity = CFG.selection.hoverSelectedEmissive;
                mesh.scale.copy(mesh.userData._origScale).multiplyScalar(CFG.selection.hoverSelectedScale);
            } else {
                mesh.material.emissiveIntensity = CFG.selection.hoverEmissive;
                mesh.scale.copy(mesh.userData._origScale).multiplyScalar(CFG.selection.hoverScale);
            }
        }
        hoveredMesh = mesh;
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
//  CAMERA FOLLOW UPDATE (CAMARA mode)
// ═══════════════════════════════════════════════
function updateCameraFollow(dt) {
    if (currentView !== VIEW_CAMERA || !selectedMesh) return;

    // Keyboard adds velocity
    if (shipKeys.a) followYawVelocity += CFG.follow.yawSpeed * dt;
    if (shipKeys.d) followYawVelocity -= CFG.follow.yawSpeed * dt;
    if (shipKeys.w) followPitchVelocity += CFG.follow.pitchSpeed * dt;
    if (shipKeys.s) followPitchVelocity -= CFG.follow.pitchSpeed * dt;

    // Apply velocity to yaw/pitch
    followYaw += followYawVelocity;
    followPitch += followPitchVelocity;
    followPitch = Math.max(CFG.follow.pitchMin, Math.min(CFG.follow.pitchMax, followPitch));

    // Decay velocity (momentum effect)
    const decay = cameraMouseDown ? 0.85 : 0.92;
    followYawVelocity *= decay;
    followPitchVelocity *= decay;
    // Stop tiny residual movement
    if (Math.abs(followYawVelocity) < 0.0001) followYawVelocity = 0;
    if (Math.abs(followPitchVelocity) < 0.0001) followPitchVelocity = 0;

    // Get current world position of the selected planet (it moves!)
    const targetPos = new THREE.Vector3();
    selectedMesh.getWorldPosition(targetPos);

    // Compute camera position orbiting around the planet
    const camOffset = new THREE.Vector3(
        Math.sin(followYaw) * Math.cos(followPitch) * followDistance,
        Math.sin(followPitch) * followDistance,
        Math.cos(followYaw) * Math.cos(followPitch) * followDistance
    );

    const desiredPos = targetPos.clone().add(camOffset);

    // Smoothly lerp camera to desired position
    camera.position.lerp(desiredPos, CFG.follow.lerpSpeed);

    // Always look at the planet
    camera.lookAt(targetPos);
}

// ═══════════════════════════════════════════════
//  SPACESHIP UPDATE (NAVE mode)
// ═══════════════════════════════════════════════
function updateShip(dt) {
    if (currentView !== VIEW_SHIP) return;
    const S = CFG.ship;

    if (shipKeys.w || shipKeys.space) {
        shipThrottle = Math.min(1, shipThrottle + dt * S.throttleAccelRate);
    } else if (shipKeys.s) {
        shipThrottle = Math.max(-0.3, shipThrottle - dt * S.throttleBrakeRate);
    } else {
        shipThrottle *= S.throttleDecay;
        if (Math.abs(shipThrottle) < 0.01) shipThrottle = 0;
    }

    if (!pointerLocked) {
        if (shipKeys.a) shipYaw += S.turnSpeed * dt;
        if (shipKeys.d) shipYaw -= S.turnSpeed * dt;
    }

    const forward = new THREE.Vector3(
        Math.sin(shipYaw) * Math.cos(shipPitch),
        Math.sin(shipPitch),
        Math.cos(shipYaw) * Math.cos(shipPitch)
    );

    shipVelocity.add(forward.clone().multiplyScalar(shipThrottle * S.acceleration * dt));
    if (shipKeys.shift) shipVelocity.add(forward.clone().multiplyScalar(S.acceleration * S.boostMultiplier * dt));

    // Vertical movement Q (up) / E (down)
    if (shipKeys.q) shipVelocity.y += S.acceleration * dt;
    if (shipKeys.e) shipVelocity.y -= S.acceleration * dt;

    shipVelocity.multiplyScalar(S.drag);

    const speed = shipVelocity.length();
    if (speed > S.maxSpeed) shipVelocity.normalize().multiplyScalar(S.maxSpeed);

    camera.position.add(shipVelocity.clone().multiplyScalar(dt));
    camera.lookAt(camera.position.clone().add(forward));

    // Update HUD
    const speedEl = document.getElementById('ship-speed-value');
    if (speedEl) speedEl.textContent = Math.round(speed);
    const throttleFill = document.getElementById('ship-throttle-fill');
    if (throttleFill) throttleFill.style.width = (Math.abs(shipThrottle) * 100) + '%';
    const fireEl = document.getElementById('engine-fire');
    if (fireEl) {
        fireEl.style.height = (Math.max(0, shipThrottle) * 80) + 'px';
        fireEl.style.opacity = shipThrottle > 0.05 ? '1' : '0';
    }
}

// ═══════════════════════════════════════════════
//  SHIP RAYCAST (crosshair detection in NAVE mode)
// ═══════════════════════════════════════════════
let shipHoveredMesh = null;
let shipHoverTooltip = null;

function clearShipAimedLines() {
    shipAimedLines.forEach(l => { scene.remove(l); l.geometry.dispose(); l.material.dispose(); });
    shipAimedLines = [];
}

function buildShipAimedLines(mesh) {
    clearShipAimedLines();
    const node = meshToNode.get(mesh);
    if (!node) return;

    const secondaries = node.connections?.secondary || [];
    if (secondaries.length === 0) return;

    const sp = new THREE.Vector3();
    mesh.getWorldPosition(sp);

    secondaries.forEach(targetId => {
        let targetMesh = null;
        for (const [m, n] of meshToNode) { if (n.id === targetId) { targetMesh = m; break; } }
        if (!targetMesh) return;
        const tp = new THREE.Vector3();
        targetMesh.getWorldPosition(tp);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x00ffff, transparent: true, opacity: 0.9,
            blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 2,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        scene.add(line);
        shipAimedLines.push(line);
    });
}

function updateShipRaycast() {
    if (currentView !== VIEW_SHIP) return;
    if (!shipHoverTooltip) shipHoverTooltip = document.getElementById('hover-tooltip');

    // Cast ray from screen center (crosshair)
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const hits = raycaster.intersectObjects(allMeshes);

    // Restore previous hovered mesh
    if (shipHoveredMesh && shipHoveredMesh !== selectedMesh && shipHoveredMesh.material) {
        shipHoveredMesh.material.emissiveIntensity = shipHoveredMesh.userData._origEmissive || CFG.planet.emissiveIntensity;
        if (shipHoveredMesh.userData._origScale) shipHoveredMesh.scale.copy(shipHoveredMesh.userData._origScale);
    }

    if (hits.length > 0) {
        const mesh = hits[0].object;
        const node = meshToNode.get(mesh);

        if (mesh.material) {
            if (mesh.userData._origEmissive === undefined) mesh.userData._origEmissive = mesh.material.emissiveIntensity;
            if (mesh.userData._origScale === undefined) mesh.userData._origScale = mesh.scale.clone();
            mesh.material.emissiveIntensity = CFG.selection.hoverEmissive;
            mesh.scale.copy(mesh.userData._origScale).multiplyScalar(CFG.selection.hoverScale);
        }

        // Build neon connection lines if aimed mesh changed
        if (shipHoveredMesh !== mesh) {
            buildShipAimedLines(mesh);
        }
        shipHoveredMesh = mesh;

        if (node) {
            // Show tooltip at crosshair position (center of screen, slightly offset)
            shipHoverTooltip.textContent = node.label || node.id;
            shipHoverTooltip.style.left = (innerWidth / 2 + 30) + 'px';
            shipHoverTooltip.style.top = (innerHeight / 2 - 12) + 'px';
            shipHoverTooltip.classList.add('visible');

            // Show info panel when aiming at a planet
            showInfoPanel(node);

            // Highlight crosshair
            const crosshair = document.getElementById('ship-crosshair');
            if (crosshair) crosshair.classList.add('locked');
        }
    } else {
        if (shipHoveredMesh) {
            clearShipAimedLines();
        }
        shipHoveredMesh = null;
        if (shipHoverTooltip) shipHoverTooltip.classList.remove('visible');

        // Remove crosshair highlight
        const crosshair = document.getElementById('ship-crosshair');
        if (crosshair) crosshair.classList.remove('locked');

        closeInfoPanel();
    }

    // Update aimed line positions (planets move)
    if (shipHoveredMesh && shipAimedLines.length > 0) {
        const node = meshToNode.get(shipHoveredMesh);
        const secondaries = node?.connections?.secondary || [];
        const sp = new THREE.Vector3();
        shipHoveredMesh.getWorldPosition(sp);
        let li = 0;
        secondaries.forEach(targetId => {
            let targetMesh = null;
            for (const [m, n] of meshToNode) { if (n.id === targetId) { targetMesh = m; break; } }
            if (!targetMesh || li >= shipAimedLines.length) return;
            const tp = new THREE.Vector3();
            targetMesh.getWorldPosition(tp);
            const p = shipAimedLines[li].geometry.attributes.position.array;
            p[0] = sp.x; p[1] = sp.y; p[2] = sp.z;
            p[3] = tp.x; p[4] = tp.y; p[5] = tp.z;
            shipAimedLines[li].geometry.attributes.position.needsUpdate = true;
            li++;
        });
    }
}

// ═══════════════════════════════════════════════
//  ENERGY PARTICLES (fly from planet toward camera)
// ═══════════════════════════════════════════════
let energyParticles = null;
let energyParticleData = [];
const ENERGY_PARTICLE_COUNT = 60;

function spawnEnergyParticles(mesh) {
    clearEnergyParticles();
    const wp = new THREE.Vector3();
    mesh.getWorldPosition(wp);

    // Get color from mesh
    let color = 0x00ffff;
    if (mesh.userData.categoryId) {
        color = CAT_COLORS[mesh.userData.categoryId] || 0x00ffff;
    } else {
        const node = meshToNode.get(mesh);
        if (node && node.type === 'category') color = CAT_COLORS[node.id] || 0x00ffff;
    }

    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(ENERGY_PARTICLE_COUNT * 3);
    const sizes = new Float32Array(ENERGY_PARTICLE_COUNT);
    energyParticleData = [];

    for (let i = 0; i < ENERGY_PARTICLE_COUNT; i++) {
        // Start at planet position with random offset
        const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        positions[i * 3] = wp.x + offset.x;
        positions[i * 3 + 1] = wp.y + offset.y;
        positions[i * 3 + 2] = wp.z + offset.z;
        sizes[i] = 1.5 + Math.random() * 3;

        energyParticleData.push({
            origin: wp.clone().add(offset),
            speed: 40 + Math.random() * 80,
            delay: Math.random() * 0.8,
            life: 0,
            maxLife: 1.0 + Math.random() * 0.5,
            alive: true,
        });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
        color, size: 3, transparent: true, opacity: 0.8,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });

    energyParticles = new THREE.Points(geo, mat);
    scene.add(energyParticles);
}

function clearEnergyParticles() {
    if (energyParticles) {
        scene.remove(energyParticles);
        energyParticles.geometry.dispose();
        energyParticles.material.dispose();
        energyParticles = null;
        energyParticleData = [];
    }
}

function updateEnergyParticles(dt) {
    if (!energyParticles || energyParticleData.length === 0) return;

    const posAttr = energyParticles.geometry.getAttribute('position');
    const sizeAttr = energyParticles.geometry.getAttribute('size');
    let allDead = true;

    for (let i = 0; i < energyParticleData.length; i++) {
        const p = energyParticleData[i];
        if (!p.alive) continue;

        p.life += dt;
        if (p.life < p.delay) { allDead = false; continue; }

        const t = (p.life - p.delay) / p.maxLife;
        if (t >= 1) {
            p.alive = false;
            sizeAttr.array[i] = 0;
            continue;
        }
        allDead = false;

        // Fly toward camera
        const dir = new THREE.Vector3().subVectors(camera.position, p.origin).normalize();
        const dist = p.speed * (p.life - p.delay);
        const pos = p.origin.clone().add(dir.multiplyScalar(dist));

        // Add some spiral motion
        const spiral = (p.life - p.delay) * 4;
        pos.x += Math.sin(spiral + i) * 3 * (1 - t);
        pos.y += Math.cos(spiral + i * 1.3) * 3 * (1 - t);

        posAttr.array[i * 3] = pos.x;
        posAttr.array[i * 3 + 1] = pos.y;
        posAttr.array[i * 3 + 2] = pos.z;

        // Fade out
        sizeAttr.array[i] = (1.5 + Math.random() * 2) * (1 - t * t);
    }

    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    energyParticles.material.opacity = 0.8;

    if (allDead) clearEnergyParticles();
}

// ═══════════════════════════════════════════════
//  ANIMATION LOOP
// ═══════════════════════════════════════════════
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    animTime += dt;

    // Animate planet orbits (3D spherical)
    Object.values(categoryObjects).forEach(catObj => {
        catObj.planets.forEach(planet => {
            const u = planet.userData;
            const r = u.orbitRadius;
            // Theta rotates over time (horizontal orbit)
            const theta = u.orbitOffset + animTime * u.orbitSpeed;
            // Phi oscillates slowly around its initial tilt (vertical movement)
            const phi = (u.orbitTilt + Math.PI / 2) + Math.sin(animTime * 0.3 + u.orbitOffset) * 0.3;
            planet.position.x = Math.sin(phi) * Math.cos(theta) * r;
            planet.position.y = Math.cos(phi) * r;
            planet.position.z = Math.sin(phi) * Math.sin(theta) * r;
        });
        const pulse = 0.92 + Math.sin(animTime * 1.5) * 0.05;
        catObj.nucleus.material.opacity = pulse;
        if (catObj.nucleus !== selectedMesh && catObj.nucleus !== hoveredMesh) {
            catObj.nucleus.material.emissiveIntensity = CFG.nucleus.emissiveIntensity - 0.1 + Math.sin(animTime * 2) * 0.15;
        }
    });

    if (sunMesh) {
        if (sunMesh !== selectedMesh && sunMesh !== hoveredMesh) {
            sunMesh.material.emissiveIntensity = 0.8 + Math.sin(animTime * 1.2) * 0.3;
        }
        sunMesh.material.opacity = 0.9 + Math.sin(animTime * 1.8) * 0.05;
    }

    // Twinkling stars
    if (starPoints && starBaseSizes) {
        const sizeAttr = starPoints.geometry.getAttribute('size');
        for (let i = 0; i < starBaseSizes.length; i++) {
            const twinkle = Math.sin(animTime * starTwinkleSpeeds[i] + starTwinklePhases[i]);
            sizeAttr.array[i] = starBaseSizes[i] * (0.3 + 0.7 * (twinkle * 0.5 + 0.5));
        }
        sizeAttr.needsUpdate = true;
    }

    updateConnections();
    updateEnergyParticles(dt);

    // View-specific updates
    if (currentView === VIEW_SHIP) {
        updateShip(dt);
        updateShipRaycast();
    } else if (currentView === VIEW_CAMERA) {
        updateCameraFollow(dt);
    } else {
        // VIEW_GLOBAL
        // If a planet is selected, continuously update the lookAt target to follow it
        if (selectedMesh && selectedMesh.userData.orbitRadius !== undefined) {
            const wp = new THREE.Vector3();
            selectedMesh.getWorldPosition(wp);
            targetCamLookAt.copy(wp);
            // Also update camera position to maintain relative offset
            const sphereGeo = selectedMesh.geometry;
            let radius = 30;
            if (sphereGeo && sphereGeo.parameters) radius = sphereGeo.parameters.radius || 30;
            const dist = radius * 6;
            const dir = new THREE.Vector3().subVectors(camera.position, wp).normalize();
            targetCamPos.copy(wp).add(dir.multiplyScalar(dist));
            targetCamPos.y = Math.max(targetCamPos.y, wp.y + dist * 0.2);
            isTransitioning = true;
        }

        if (isTransitioning) {
            camera.position.lerp(targetCamPos, CFG.camera.transitionSpeed);
            currentLookAt.lerp(targetCamLookAt, CFG.camera.transitionSpeed);
            controls.target.copy(currentLookAt);
            if (!selectedMesh || selectedMesh.userData.orbitRadius === undefined) {
                if (camera.position.distanceTo(targetCamPos) < 2) isTransitioning = false;
            }
        }

        controls.update();
    }

    // Connection visibility (applies in all modes)
    const C = CFG.connections;
    const currentCat = categories[currentCatIndex];
    if (showAllConnections) {
        connectionLines.forEach(c => { c.line.material.opacity = C.primaryActiveOpacity; });
        secondaryLines.forEach(c => { c.line.material.opacity = C.secondaryActiveOpacity; });
    } else {
        connectionLines.forEach(c => {
            const nodeFrom = meshToNode.get(c.from);
            const nodeTo = meshToNode.get(c.to);
            const isActive = (nodeFrom && nodeFrom.id === currentCat) || (nodeTo && nodeTo.id === currentCat);
            c.line.material.opacity = isActive ? C.primaryActiveOpacity : C.primaryDimOpacity;
        });
        secondaryLines.forEach(c => {
            const nodeFrom = meshToNode.get(c.from);
            const nodeTo = meshToNode.get(c.to);
            const currentChildren = DATA.categoryChildren[currentCat] || [];
            const isActive = currentChildren.includes(nodeFrom?.id) || currentChildren.includes(nodeTo?.id) ||
                nodeFrom?.id === currentCat || nodeTo?.id === currentCat;
            c.line.material.opacity = isActive ? C.secondaryActiveOpacity : C.secondaryDimOpacity;
        });
    }

    renderer.render(scene, camera);
}

// ═══════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════
init().catch(err => {
    console.error('Error loading:', err);
    const loadEl = document.getElementById('loading');
    if (loadEl) loadEl.innerHTML = '<p style="color:#ff6666">Error cargando datos. Verifica que mapa_herramientas_data.json esté en la misma carpeta.</p>';
});
