import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CONFIG } from './config.js';

const CFG = CONFIG;
const CAT_COLORS = CFG.categoryColors;

// ═══════════════════════════════════════════════
//  CLASS: Planet (represents any node: sun, nucleus, tool)
// ═══════════════════════════════════════════════
class Planet {
    constructor(mesh, node, category = null) {
        this.mesh = mesh;
        this.node = node;
        this.category = category;
        this.isActive = false;
        this._origEmissive = mesh.material ? mesh.material.emissiveIntensity : 0;
        this._origScale = mesh.scale.clone();
        this.type = node.type || 'tool';
    }

    get id() { return this.node.id; }
    get label() { return this.node.label || this.node.id; }

    activate() {
        this.isActive = true;
        if (this.mesh.material) {
            this.mesh.material.emissiveIntensity = CFG.selection.emissiveIntensity;
        }
        this.mesh.scale.copy(this._origScale).multiplyScalar(CFG.selection.scaleFactor);
    }

    deactivate() {
        this.isActive = false;
        if (this.mesh.material) {
            this.mesh.material.emissiveIntensity = this._origEmissive;
        }
        this.mesh.scale.copy(this._origScale);
    }

    hover() {
        if (!this.mesh.material) return;
        if (this.isActive) {
            this.mesh.material.emissiveIntensity = CFG.selection.hoverSelectedEmissive;
            this.mesh.scale.copy(this._origScale).multiplyScalar(CFG.selection.hoverSelectedScale);
        } else {
            this.mesh.material.emissiveIntensity = CFG.selection.hoverEmissive;
            this.mesh.scale.copy(this._origScale).multiplyScalar(CFG.selection.hoverScale);
        }
    }

    unhover() {
        if (!this.mesh.material) return;
        if (this.isActive) {
            this.mesh.material.emissiveIntensity = CFG.selection.emissiveIntensity;
            this.mesh.scale.copy(this._origScale).multiplyScalar(CFG.selection.scaleFactor);
        } else {
            this.mesh.material.emissiveIntensity = this._origEmissive;
            this.mesh.scale.copy(this._origScale);
        }
    }

    getWorldPosition() {
        const v = new THREE.Vector3();
        this.mesh.getWorldPosition(v);
        return v;
    }

    getConnectedIds() {
        const sec = this.node.connections?.secondary || [];
        const children = (this.node.connections?.children || []).map(c => c.id || c);
        return [...sec, ...children];
    }
}

// ═══════════════════════════════════════════════
//  CLASS: Connection
// ═══════════════════════════════════════════════
class Connection {
    constructor(line, fromPlanet, toPlanet, type = 'primary', color = null) {
        this.line = line;
        this.from = fromPlanet;
        this.to = toPlanet;
        this.type = type;
        this.color = color;
        this.glowLine = null;
        // Energy sphere tracing state
        this.tracing = false;
        this.traceProgress = 0;
        this.traceDuration = 0.6;
        this.traceSphere = null;
        this.traceFromPlanet = null;
        this._savedOpacity = 0;
    }

    updatePositions() {
        const sp = this.from.getWorldPosition();
        const tp = this.to.getWorldPosition();
        const p = this.line.geometry.attributes.position.array;
        p[0] = sp.x; p[1] = sp.y; p[2] = sp.z;
        p[3] = tp.x; p[4] = tp.y; p[5] = tp.z;
        this.line.geometry.attributes.position.needsUpdate = true;
        if (this.glowLine) {
            const gp = this.glowLine.geometry.attributes.position.array;
            gp[0] = sp.x; gp[1] = sp.y; gp[2] = sp.z;
            gp[3] = tp.x; gp[4] = tp.y; gp[5] = tp.z;
            this.glowLine.geometry.attributes.position.needsUpdate = true;
        }
    }

    setOpacity(opacity) { this.line.material.opacity = opacity; }
    show() { this.line.visible = true; }
    hide() {
        this.line.visible = false;
        if (this.glowLine) this.glowLine.visible = false;
        this.stopTrace();
    }

    showGlow(scene) {
        if (this.glowLine) { this.glowLine.visible = true; return; }
        const sp = this.from.getWorldPosition();
        const tp = this.to.getWorldPosition();
        const geo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
        const mat = new THREE.LineBasicMaterial({
            color: CFG.connections.activeGlowColor, transparent: true,
            opacity: CFG.connections.activeGlowOpacity,
            blending: THREE.AdditiveBlending, depthWrite: false,
            linewidth: CFG.connections.activeLineWidth,
        });
        this.glowLine = new THREE.Line(geo, mat);
        scene.add(this.glowLine);
    }

    hideGlow() { if (this.glowLine) this.glowLine.visible = false; }
    involvesId(id) { return this.from.id === id || this.to.id === id; }
    involvesPlanet(planet) { return this.from === planet || this.to === planet; }

    // Start energy sphere trace animation from activePlanet toward the other end
    startTrace(scene, activePlanet) {
        this.tracing = true;
        this.traceProgress = 0;
        this.traceFromPlanet = (this.from === activePlanet) ? this.from : this.to;
        const toPlanet = (this.traceFromPlanet === this.from) ? this.to : this.from;
        // Hide the line initially — it draws progressively
        this._savedOpacity = this.line.material.opacity;
        this.line.material.opacity = 0;
        if (this.glowLine) this.glowLine.visible = false;
        // Create energy sphere
        if (!this.traceSphere) {
            const sphereColor = this.color ? new THREE.Color(this.color) : new THREE.Color(CFG.connections.activeGlowColor);
            const sGeo = new THREE.SphereGeometry(4, 12, 12);
            const sMat = new THREE.MeshBasicMaterial({
                color: sphereColor, transparent: true, opacity: 0.9,
                blending: THREE.AdditiveBlending, depthWrite: false,
            });
            this.traceSphere = new THREE.Mesh(sGeo, sMat);
            // Add glow around sphere
            const glowGeo = new THREE.SphereGeometry(10, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({
                color: sphereColor, transparent: true, opacity: 0.25,
                blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
            });
            this.traceSphere.add(new THREE.Mesh(glowGeo, glowMat));
            scene.add(this.traceSphere);
        }
        this.traceSphere.visible = true;
        const startPos = this.traceFromPlanet.getWorldPosition();
        this.traceSphere.position.copy(startPos);
    }

    // Update trace animation each frame; returns true if still tracing
    updateTrace(dt) {
        if (!this.tracing) return false;
        this.traceProgress += dt / this.traceDuration;
        if (this.traceProgress >= 1) this.traceProgress = 1;
        const t = this.traceProgress;
        // Ease out
        const ease = 1 - Math.pow(1 - t, 3);
        const sp = this.traceFromPlanet.getWorldPosition();
        const toPlanet = (this.traceFromPlanet === this.from) ? this.to : this.from;
        const tp = toPlanet.getWorldPosition();
        // Move sphere along the line
        const currentPos = sp.clone().lerp(tp, ease);
        this.traceSphere.position.copy(currentPos);
        // Progressively reveal the line behind the sphere
        this.line.material.opacity = this._savedOpacity * ease;
        // Update line geometry to draw only the traced portion
        const p = this.line.geometry.attributes.position.array;
        p[0] = sp.x; p[1] = sp.y; p[2] = sp.z;
        p[3] = currentPos.x; p[4] = currentPos.y; p[5] = currentPos.z;
        this.line.geometry.attributes.position.needsUpdate = true;
        this.line.visible = true;
        if (t >= 1) {
            // Trace complete — restore full line and hide sphere
            this.tracing = false;
            this.line.material.opacity = this._savedOpacity;
            // Restore full line endpoints
            p[3] = tp.x; p[4] = tp.y; p[5] = tp.z;
            this.line.geometry.attributes.position.needsUpdate = true;
            if (this.glowLine) this.glowLine.visible = true;
            this.traceSphere.visible = false;
            return false;
        }
        return true;
    }

    stopTrace() {
        this.tracing = false;
        if (this.traceSphere) this.traceSphere.visible = false;
    }
}

// ═══════════════════════════════════════════════
//  CLASS: CameraController
// ═══════════════════════════════════════════════
class CameraController {
    constructor(camera, renderer, cfg) {
        this.camera = camera;
        this.cfg = cfg;
        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = cfg.camera.orbitDamping;
        this.controls.rotateSpeed = cfg.camera.orbitRotateSpeed;
        this.controls.minDistance = cfg.camera.orbitMinDistance;
        this.controls.maxDistance = cfg.camera.orbitMaxDistance;
        this.controls.enablePan = false;

        this.targetPos = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.isTransitioning = false;
        this.zoomLevel = 1;

        // Follow
        this.followYaw = 0;
        this.followPitch = 0.3;
        this.followDistance = cfg.follow.distance;
        this.followYawVel = 0;
        this.followPitchVel = 0;
        this.mouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Ship
        this.shipVelocity = new THREE.Vector3();
        this.shipThrottle = 0;
        this.shipYaw = 0;
        this.shipPitch = 0;
        this.pointerLocked = false;

        // Warp (ship mode teleport to planet)
        this.warping = false;
        this.warpTarget = null;
        this.warpStart = null;
        this.warpTime = 0;
        this.warpDuration = 1.2;       // seconds
        this.warpCallback = null;
    }

    goHome(instant = false) {
        const home = this.cfg.camera.homePosition;
        const dist = this.cfg.camera.navDistMultiplier * this.zoomLevel;
        this.targetPos.set(home.x, dist * 1.2, home.y);
        this.targetLookAt.set(home.x, 0, home.y);
        if (instant) {
            this.camera.position.copy(this.targetPos);
            this.controls.target.copy(this.targetLookAt);
            this.currentLookAt.copy(this.targetLookAt);
            this.controls.update();
        } else {
            this.currentLookAt.copy(this.controls.target);
            this.isTransitioning = true;
        }
    }

    navigateTo(position, instant = false) {
        const dist = this.cfg.camera.navDistMultiplier * this.zoomLevel;
        this.targetPos.set(position.x, dist * 1.2, position.z);
        this.targetLookAt.copy(position);
        if (instant) {
            this.camera.position.copy(this.targetPos);
            this.controls.target.copy(this.targetLookAt);
            this.currentLookAt.copy(this.targetLookAt);
            this.controls.update();
        } else {
            this.currentLookAt.copy(this.controls.target);
            this.isTransitioning = true;
        }
    }

    adjustZoom(delta) {
        const old = this.zoomLevel;
        this.zoomLevel = Math.max(this.cfg.camera.zoomMin, Math.min(this.cfg.camera.zoomMax, this.zoomLevel + delta));
        return this.zoomLevel !== old;
    }

    updateTransition(activePlanet) {
        if (!this.isTransitioning) return;
        this.camera.position.lerp(this.targetPos, this.cfg.camera.transitionSpeed);
        this.currentLookAt.lerp(this.targetLookAt, this.cfg.camera.transitionSpeed);
        this.controls.target.copy(this.currentLookAt);
        if (!activePlanet || activePlanet.mesh.userData.orbitRadius === undefined) {
            if (this.camera.position.distanceTo(this.targetPos) < 2) this.isTransitioning = false;
        }
    }

    initFollowFrom(targetWorldPos) {
        this.followYawVel = 0;
        this.followPitchVel = 0;
        this.mouseDown = false;
        const diff = new THREE.Vector3().subVectors(this.camera.position, targetWorldPos);
        this.followYaw = Math.atan2(diff.x, diff.z);
        this.followPitch = Math.atan2(diff.y, Math.sqrt(diff.x * diff.x + diff.z * diff.z));
        this.followDistance = diff.length();
    }

    updateFollow(dt, targetWorldPos, keys) {
        const F = this.cfg.follow;
        if (keys.a) this.followYawVel += F.yawSpeed * dt;
        if (keys.d) this.followYawVel -= F.yawSpeed * dt;
        if (keys.w) this.followPitchVel += F.pitchSpeed * dt;
        if (keys.s) this.followPitchVel -= F.pitchSpeed * dt;
        // Q/E zoom in orbital mode
        const zSpeed = F.zoomSpeed || 8;
        if (keys.e) this.followDistance = Math.max(F.zoomMin || 20, this.followDistance - zSpeed * dt * 10);
        if (keys.q) this.followDistance = Math.min(F.zoomMax || 400, this.followDistance + zSpeed * dt * 10);

        // Clamp rotation speed to maxRotationSpeed
        const maxRot = F.maxRotationSpeed || 2.5;
        this.followYawVel = Math.max(-maxRot, Math.min(maxRot, this.followYawVel));
        this.followPitchVel = Math.max(-maxRot, Math.min(maxRot, this.followPitchVel));

        this.followYaw += this.followYawVel;
        this.followPitch += this.followPitchVel;
        this.followPitch = Math.max(F.pitchMin, Math.min(F.pitchMax, this.followPitch));

        const decay = this.mouseDown ? 0.85 : 0.92;
        this.followYawVel *= decay;
        this.followPitchVel *= decay;
        if (Math.abs(this.followYawVel) < 0.0001) this.followYawVel = 0;
        if (Math.abs(this.followPitchVel) < 0.0001) this.followPitchVel = 0;

        const camOffset = new THREE.Vector3(
            Math.sin(this.followYaw) * Math.cos(this.followPitch) * this.followDistance,
            Math.sin(this.followPitch) * this.followDistance,
            Math.cos(this.followYaw) * Math.cos(this.followPitch) * this.followDistance
        );
        const desiredPos = targetWorldPos.clone().add(camOffset);
        this.camera.position.lerp(desiredPos, F.lerpSpeed);
        this.camera.lookAt(targetWorldPos);
    }

    initShip() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        this.shipYaw = Math.atan2(dir.x, dir.z);
        this.shipPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
        this.shipVelocity.set(0, 0, 0);
        this.shipThrottle = 0;
    }

    updateShip(dt, keys) {
        const S = this.cfg.ship;
        if (keys.w || keys.space) {
            this.shipThrottle = Math.min(1, this.shipThrottle + dt * S.throttleAccelRate);
        } else if (keys.s) {
            this.shipThrottle = Math.max(-0.3, this.shipThrottle - dt * S.throttleBrakeRate);
        } else {
            this.shipThrottle *= S.throttleDecay;
            if (Math.abs(this.shipThrottle) < 0.01) this.shipThrottle = 0;
        }
        // Mouse-controlled yaw when pointer locked; keyboard yaw only when not locked
        if (!this.pointerLocked) {
            // Without pointer lock, A/D still rotate
            if (keys.a) this.shipYaw += S.turnSpeed * dt;
            if (keys.d) this.shipYaw -= S.turnSpeed * dt;
        }
        const forward = new THREE.Vector3(
            Math.sin(this.shipYaw) * Math.cos(this.shipPitch),
            Math.sin(this.shipPitch),
            Math.cos(this.shipYaw) * Math.cos(this.shipPitch)
        );
        // Right vector for strafing (A/D move sideways)
        const right = new THREE.Vector3(
            Math.cos(this.shipYaw), 0, -Math.sin(this.shipYaw)
        ).normalize();
        // Forward thrust
        this.shipVelocity.add(forward.clone().multiplyScalar(this.shipThrottle * S.acceleration * dt));
        // Strafe: A = left, D = right
        if (keys.a) this.shipVelocity.add(right.clone().multiplyScalar(S.acceleration * 0.6 * dt));
        if (keys.d) this.shipVelocity.add(right.clone().multiplyScalar(-S.acceleration * 0.6 * dt));
        if (keys.shift) this.shipVelocity.add(forward.clone().multiplyScalar(S.acceleration * S.boostMultiplier * dt));
        if (keys.q) this.shipVelocity.y += S.acceleration * dt;
        if (keys.e) this.shipVelocity.y -= S.acceleration * dt;
        // dt-based drag so speed isn't frame-rate dependent and can actually reach maxSpeed
        const dragFactor = Math.pow(S.drag, dt * 60);
        this.shipVelocity.multiplyScalar(dragFactor);
        const speed = this.shipVelocity.length();
        if (speed > S.maxSpeed) this.shipVelocity.normalize().multiplyScalar(S.maxSpeed);
        this.camera.position.add(this.shipVelocity.clone().multiplyScalar(dt));
        this.camera.lookAt(this.camera.position.clone().add(forward));
        return { speed, throttle: this.shipThrottle };
    }

    startWarp(targetPos, stopDistance, callback) {
        this.warping = true;
        this.warpStart = this.camera.position.clone();
        // Stop at stopDistance from the planet along the approach direction
        const dir = new THREE.Vector3().subVectors(targetPos, this.warpStart).normalize();
        this.warpTarget = targetPos.clone().sub(dir.multiplyScalar(stopDistance));
        this.warpLookAt = targetPos.clone();
        this.warpTime = 0;
        this.warpCallback = callback || null;
        this.shipVelocity.set(0, 0, 0);
        this.shipThrottle = 0;
    }

    updateWarp(dt) {
        if (!this.warping) return false;
        this.warpTime += dt;
        const t = Math.min(this.warpTime / this.warpDuration, 1);
        // Ease-in-out with a sharp acceleration feel
        const ease = t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        this.camera.position.lerpVectors(this.warpStart, this.warpTarget, ease);
        // Always look at the planet itself (not the stop point)
        this.camera.lookAt(this.warpLookAt);
        // Update shipYaw/shipPitch to match facing direction toward planet
        const dir = new THREE.Vector3().subVectors(this.warpLookAt, this.camera.position).normalize();
        this.shipYaw = Math.atan2(dir.x, dir.z);
        this.shipPitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
        if (t >= 1) {
            this.warping = false;
            this.shipVelocity.set(0, 0, 0);
            if (this.warpCallback) this.warpCallback();
            return false;
        }
        return true;
    }

    onMouseMoveShip(e) {
        const S = this.cfg.ship;
        this.shipYaw -= e.movementX * S.mouseSensitivity;
        this.shipPitch -= e.movementY * S.mouseSensitivity;
        this.shipPitch = Math.max(S.pitchMin, Math.min(S.pitchMax, this.shipPitch));
    }

    onMouseMoveFollow(dx, dy) {
        this.followYawVel -= dx * this.cfg.follow.mouseSensitivity * 2;
        this.followPitchVel += dy * this.cfg.follow.mouseSensitivity * 2;
    }
}

// ═══════════════════════════════════════════════
//  CLASS: EnergyParticleSystem
// ═══════════════════════════════════════════════
class EnergyParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.points = null;
        this.data = [];
        this.count = 60;
    }

    spawn(planet) {
        this.clear();
        const wp = planet.getWorldPosition();
        let color = 0x00ffff;
        if (planet.category) color = CAT_COLORS[planet.category] || 0x00ffff;
        else if (planet.type === 'category') color = CAT_COLORS[planet.id] || 0x00ffff;

        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        const sizes = new Float32Array(this.count);
        this.data = [];

        for (let i = 0; i < this.count; i++) {
            const off = new THREE.Vector3((Math.random()-0.5)*10,(Math.random()-0.5)*10,(Math.random()-0.5)*10);
            positions[i*3] = wp.x+off.x; positions[i*3+1] = wp.y+off.y; positions[i*3+2] = wp.z+off.z;
            sizes[i] = 1.5 + Math.random()*3;
            this.data.push({ origin: wp.clone().add(off), speed: 40+Math.random()*80, delay: Math.random()*0.8, life: 0, maxLife: 1+Math.random()*0.5, alive: true });
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        const mat = new THREE.PointsMaterial({ color, size: 3, transparent: true, opacity: 0.8, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
        this.points = new THREE.Points(geo, mat);
        this.scene.add(this.points);
    }

    clear() {
        if (this.points) {
            this.scene.remove(this.points);
            this.points.geometry.dispose();
            this.points.material.dispose();
            this.points = null;
            this.data = [];
        }
    }

    update(dt, camPos) {
        if (!this.points || this.data.length === 0) return;
        const posA = this.points.geometry.getAttribute('position');
        const sizeA = this.points.geometry.getAttribute('size');
        let allDead = true;
        for (let i = 0; i < this.data.length; i++) {
            const p = this.data[i];
            if (!p.alive) continue;
            p.life += dt;
            if (p.life < p.delay) { allDead = false; continue; }
            const t = (p.life - p.delay) / p.maxLife;
            if (t >= 1) { p.alive = false; sizeA.array[i] = 0; continue; }
            allDead = false;
            const dir = new THREE.Vector3().subVectors(camPos, p.origin).normalize();
            const dist = p.speed * (p.life - p.delay);
            const pos = p.origin.clone().add(dir.multiplyScalar(dist));
            const spiral = (p.life - p.delay) * 4;
            pos.x += Math.sin(spiral+i)*3*(1-t);
            pos.y += Math.cos(spiral+i*1.3)*3*(1-t);
            posA.array[i*3] = pos.x; posA.array[i*3+1] = pos.y; posA.array[i*3+2] = pos.z;
            sizeA.array[i] = (1.5+Math.random()*2)*(1-t*t);
        }
        posA.needsUpdate = true;
        sizeA.needsUpdate = true;
        this.points.material.opacity = 0.8;
        if (allDead) this.clear();
    }
}

// ═══════════════════════════════════════════════
//  CLASS: Universe (main application)
// ═══════════════════════════════════════════════
class Universe {
    constructor() {
        this.scene = null; this.camera = null; this.renderer = null;
        this.cam = null; this.raycaster = null; this.mouse = null;
        this.clock = null; this.animTime = 0;
        this.DATA = null; this.categories = []; this.currentCatIndex = 0;
        this.planets = new Map(); this.meshToPlanet = new Map(); this.allMeshes = [];
        this.activePlanet = null;
        this.categoryGroups = {};
        this.connections = []; this.sunLines = [];
        this.allLabelSprites = []; this.labelsVisible = false;
        this.starPoints = null; this.starBaseSizes = null;
        this.starTwinklePhases = null; this.starTwinkleSpeeds = null;
        this.sunMesh = null; this.sunPlanet = null;
        this.particles = null;
        this.currentView = 'global';
        this.showAllConnections = false;
        this.shipAimedLines = []; this.shipHoveredMesh = null;
        this.keys = { w:false, s:false, a:false, d:false, q:false, e:false, shift:false, space:false };
        this.hoveredPlanet = null; this.tooltip = null;
    }

    async init() {
        this.clock = new THREE.Clock();
        const resp = await fetch(CFG.dataUrl);
        this.DATA = await resp.json();
        this.categories = this.DATA.categories;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(CFG.scene.fogColor, CFG.scene.fogDensity);

        this.camera = new THREE.PerspectiveCamera(CFG.camera.fov, innerWidth/innerHeight, CFG.camera.near, CFG.camera.far);
        const ip = CFG.camera.initialPosition;
        this.camera.position.set(ip.x, ip.y, ip.z);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = CFG.scene.toneExposure;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        this.cam = new CameraController(this.camera, this.renderer, CFG);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.scene.add(new THREE.AmbientLight(CFG.scene.ambientColor, CFG.scene.ambientIntensity));
        this.particles = new EnergyParticleSystem(this.scene);

        this.createStarfield();
        this.buildCentralSun();
        this.buildUniverses();
        this.buildConnections();
        this.buildSunConnections();
        this.buildCategoryDots();
        // Start at center (Arte Generativo) — not a category
        this.currentCatIndex = -1;
        document.getElementById('cat-label-text').textContent = 'Arte Generativo y Código con IA';
        document.getElementById('cat-label-text').style.color = '#' + new THREE.Color(CFG.sun.color).getHexString();
        document.getElementById('cat-count-text').textContent = `${this.categories.length} universos`;
        this.cam.goHome(true);

        this.bindEvents();
        this.showSplash();
        this.animate();
    }

    registerPlanet(p) { this.planets.set(p.id, p); this.meshToPlanet.set(p.mesh, p); this.allMeshes.push(p.mesh); }
    getPlanetByMesh(m) { return this.meshToPlanet.get(m) || null; }
    getPlanetById(id) { return this.planets.get(id) || null; }

    // ── Active Planet ──
    setActivePlanet(planet) {
        if (this.activePlanet) this.activePlanet.deactivate();
        this.activePlanet = planet;
        if (planet) {
            planet.activate();
            this.updateSelectionIndicator(planet);
            this.updateActiveConnections(true);
            this.particles.spawn(planet);
        } else {
            this.hideSelectionIndicator();
            this.updateActiveConnections();
        }
    }

    clearActivePlanet() {
        if (this.activePlanet) this.activePlanet.deactivate();
        this.activePlanet = null;
        this.hideSelectionIndicator();
        this.updateActiveConnections();
    }

    // ── Connection Visibility ──
    updateActiveConnections(triggerTrace = false) {
        const C = CFG.connections;
        const active = this.activePlanet;

        if (this.showAllConnections) {
            // CONEXIONES ON — render ALL connections
            this.connections.forEach(conn => {
                conn.show();
                conn.setOpacity(conn.type === 'primary' ? C.primaryActiveOpacity : C.secondaryActiveOpacity);
                if (active && conn.involvesPlanet(active)) {
                    if (triggerTrace && !conn.tracing) {
                        conn.setOpacity(conn.type === 'primary' ? C.primaryActiveOpacity : C.secondaryActiveOpacity);
                        conn.startTrace(this.scene, active);
                    }
                    conn.showGlow(this.scene);
                } else {
                    conn.hideGlow();
                }
            });
        } else if (active) {
            // CONEXIONES OFF + active planet — only render connections involving active planet
            this.connections.forEach(conn => {
                if (conn.involvesPlanet(active)) {
                    conn.show();
                    conn.setOpacity(conn.type === 'primary' ? C.primaryActiveOpacity : C.secondaryActiveOpacity);
                    if (triggerTrace && !conn.tracing) {
                        conn.startTrace(this.scene, active);
                    }
                    conn.showGlow(this.scene);
                } else {
                    conn.hide();
                }
            });
        } else {
            // CONEXIONES OFF + no active planet — hide all connections
            this.connections.forEach(conn => {
                conn.hide();
            });
        }
    }

    // ── Starfield ──
    createStarfield() {
        const S = CFG.stars; const count = S.count;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count*3);
        const colors = new Float32Array(count*3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = S.minDistance + Math.random()*(S.maxDistance-S.minDistance);
            const theta = Math.random()*Math.PI*2;
            const phi = Math.acos(2*Math.random()-1);
            positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
            positions[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
            positions[i*3+2] = r*Math.cos(phi);
            const b = 0.3+Math.random()*0.7; const t = Math.random();
            colors[i*3] = b*(0.8+t*0.2); colors[i*3+1] = b*(0.85+t*0.15); colors[i*3+2] = b;
            sizes[i] = S.sizeMin + Math.random()*S.sizeRandom;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        const mat = new THREE.PointsMaterial({ size: S.baseSize, vertexColors: true, transparent: true, opacity: S.opacity, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
        this.starPoints = new THREE.Points(geo, mat);
        this.scene.add(this.starPoints);
        this.starBaseSizes = new Float32Array(sizes);
        this.starTwinklePhases = new Float32Array(count);
        this.starTwinkleSpeeds = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            this.starTwinklePhases[i] = Math.random()*Math.PI*2;
            this.starTwinkleSpeeds[i] = S.twinkleSpeedMin + Math.random()*S.twinkleSpeedRandom;
        }
    }

    // ── Central Sun ──
    buildCentralSun() {
        const S = CFG.sun;
        const sunGroup = new THREE.Group();
        sunGroup.position.set(0, 0, 0);
        this.scene.add(sunGroup);
        const sunGeo = new THREE.SphereGeometry(S.radius, 64, 64);
        const sunMat = new THREE.MeshStandardMaterial({ color: S.color, emissive: S.emissiveColor, emissiveIntensity: S.emissiveIntensity, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.95 });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunGroup.add(this.sunMesh);
        sunGroup.add(new THREE.Mesh(new THREE.SphereGeometry(S.glowInnerRadius, 32, 32), new THREE.MeshBasicMaterial({ color: S.color, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
        sunGroup.add(new THREE.Mesh(new THREE.SphereGeometry(S.glowOuterRadius, 24, 24), new THREE.MeshBasicMaterial({ color: S.emissiveColor, transparent: true, opacity: 0.05, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
        sunGroup.add(new THREE.PointLight(S.color, S.lightIntensity, S.lightRange, 1));
        const rootNode = this.DATA.nodes['root'] || { id: 'root', label: 'Arte Generativo y Código con IA', type: 'root' };
        this.sunPlanet = new Planet(this.sunMesh, rootNode, null);
        this.registerPlanet(this.sunPlanet);
        const label = this.createTextSprite('Arte Generativo', S.color, S.labelFontSize);
        label.position.set(0, S.radius + 20, 0); label.visible = false;
        sunGroup.add(label);
        this.allLabelSprites.push(label);
    }

    buildSunConnections() {
        const sunColor = new THREE.Color(CFG.sun.color);
        this.categories.forEach(catId => {
            const catObj = this.categoryGroups[catId];
            if (!catObj) return;
            const catPos = catObj.group.position.clone();
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), catPos]);
            const lineMat = new THREE.LineBasicMaterial({ color: sunColor, transparent: true, opacity: CFG.connections.sunLineOpacity, blending: THREE.AdditiveBlending, depthWrite: false });
            const line = new THREE.Line(lineGeo, lineMat);
            this.scene.add(line);
            this.sunLines.push(line);
        });
    }

    createTextSprite(text, color, fontSize = 14) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const font = `${fontSize*4}px Outfit, sans-serif`;
        ctx.font = font;
        const tw = ctx.measureText(text).width;
        canvas.width = tw + 40; canvas.height = fontSize * 6;
        ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const c = new THREE.Color(color);
        ctx.shadowColor = `rgb(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)})`;
        ctx.shadowBlur = 20; ctx.fillStyle = '#ffffff';
        ctx.fillText(text, canvas.width/2, canvas.height/2);
        const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true;
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(canvas.width/8, canvas.height/8, 1);
        return sprite;
    }

    // ── Build Universes ──
    buildUniverses() {
        const catCount = this.categories.length;
        const N = CFG.nucleus; const P = CFG.planet; const O = CFG.orbit;
        const ringRadius = CFG.layout.ringRadius;

        this.categories.forEach((catId, i) => {
            const node = this.DATA.nodes[catId]; if (!node) return;
            const angle = (i/catCount)*Math.PI*2 - Math.PI/2;
            const cx = Math.cos(angle)*ringRadius; const cz = Math.sin(angle)*ringRadius;
            const group = new THREE.Group(); group.position.set(cx, 0, cz);
            this.scene.add(group);
            const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);

            const nucleusGeo = new THREE.SphereGeometry(N.radius, 48, 48);
            const nucleusMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: N.emissiveIntensity, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.92 });
            const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
            group.add(nucleus);
            group.add(new THREE.Mesh(new THREE.SphereGeometry(N.glowInnerRadius, 32, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
            group.add(new THREE.Mesh(new THREE.SphereGeometry(N.glowOuterRadius, 24, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.03, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));
            group.add(new THREE.PointLight(color, N.lightIntensity, N.lightRange, 1.5));

            const nucleusPlanet = new Planet(nucleus, node, null);
            this.registerPlanet(nucleusPlanet);

            const catLabel = this.createTextSprite(node.label || catId, CAT_COLORS[catId] || 0xffffff, N.labelFontSize);
            catLabel.position.set(0, N.labelOffsetY, 0); catLabel.visible = false;
            group.add(catLabel); this.allLabelSprites.push(catLabel);

            const planetMeshes = [];
            const children = this.DATA.categoryChildren[catId] || [];
            const childCount = children.length;

            children.forEach((childId, ci) => {
                const childNode = this.DATA.nodes[childId]; if (!childNode) return;
                const orbitRadius = O.baseRadius + (ci%3)*O.radiusStep + Math.random()*O.radiusRandom;
                const goldenRatio = (1+Math.sqrt(5))/2;
                const theta = (2*Math.PI*ci)/goldenRatio + (Math.random()-0.5)*0.8;
                const basePhi = Math.acos(1-(2*(ci+0.5))/childCount);
                const phi = basePhi + (Math.random()-0.5)*0.6;
                const orbitAngle = theta;
                const orbitTilt = phi - Math.PI/2;
                const px = Math.sin(phi)*Math.cos(theta)*orbitRadius;
                const py = Math.cos(phi)*orbitRadius;
                const pz = Math.sin(phi)*Math.sin(theta)*orbitRadius;

                const pGeo = new THREE.SphereGeometry(P.radius, 24, 24);
                const pColor = color.clone().lerp(new THREE.Color(0xffffff), P.colorLerpToWhite);
                const pMat = new THREE.MeshStandardMaterial({ color: pColor, emissive: pColor, emissiveIntensity: P.emissiveIntensity, roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.9 });
                const planetMesh = new THREE.Mesh(pGeo, pMat); planetMesh.position.set(px, py, pz);
                group.add(planetMesh);
                planetMesh.add(new THREE.Mesh(new THREE.SphereGeometry(P.glowRadius, 16, 16), new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.06, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })));

                // Invisible hitbox sphere (2x radius) for easier raycasting
                const hitGeo = new THREE.SphereGeometry(P.radius * 2, 8, 8);
                const hitMat = new THREE.MeshBasicMaterial({ visible: false });
                const hitMesh = new THREE.Mesh(hitGeo, hitMat);
                planetMesh.add(hitMesh);

                planetMesh.userData = { orbitRadius, orbitSpeed: O.speedMin+Math.random()*O.speedRandom, orbitOffset: orbitAngle, orbitTilt, parentGroup: group, categoryId: catId };

                const pLabel = this.createTextSprite(childNode.label || childId, CAT_COLORS[catId] || 0xffffff, P.labelFontSize);
                pLabel.position.set(0, P.labelOffsetY, 0); pLabel.visible = false;
                planetMesh.add(pLabel); this.allLabelSprites.push(pLabel);

                const childPlanet = new Planet(planetMesh, childNode, catId);
                this.registerPlanet(childPlanet);
                // Register hitbox mesh too so raycast hits resolve to this planet
                this.meshToPlanet.set(hitMesh, childPlanet);
                this.allMeshes.push(hitMesh);
                planetMeshes.push(planetMesh);
            });

            const ring = new THREE.Mesh(new THREE.RingGeometry(O.ringInner, O.ringOuter, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.06, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
            ring.rotation.x = -Math.PI/2; group.add(ring);
            this.categoryGroups[catId] = { group, nucleus, planets: planetMeshes, color };
        });
    }

    // ── Connections ──
    buildConnections() {
        const C = CFG.connections;
        this.categories.forEach(catId => {
            const catObj = this.categoryGroups[catId]; if (!catObj) return;
            const nucleusPlanet = this.getPlanetById(catId); if (!nucleusPlanet) return;
            catObj.planets.forEach(pMesh => {
                const childPlanet = this.getPlanetByMesh(pMesh); if (!childPlanet) return;
                const sp = nucleusPlanet.getWorldPosition(); const tp = childPlanet.getWorldPosition();
                const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
                const lineMat = new THREE.LineBasicMaterial({ color: catObj.color, transparent: true, opacity: C.primaryOpacity, blending: THREE.AdditiveBlending, depthWrite: false });
                const line = new THREE.Line(lineGeo, lineMat);
                this.scene.add(line);
                this.connections.push(new Connection(line, nucleusPlanet, childPlanet, 'primary', catObj.color));
            });
        });

        Object.values(this.DATA.nodes).forEach(node => {
            if (!node.connections || !node.connections.secondary) return;
            const secondaries = node.connections.secondary;
            if (!Array.isArray(secondaries) || secondaries.length === 0) return;
            const sourcePlanet = this.getPlanetById(node.id); if (!sourcePlanet) return;
            secondaries.forEach(targetId => {
                const targetPlanet = this.getPlanetById(targetId); if (!targetPlanet) return;
                const sp = sourcePlanet.getWorldPosition(); const tp = targetPlanet.getWorldPosition();
                const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tp]);
                const lineMat = new THREE.LineBasicMaterial({ color: C.secondaryColor, transparent: true, opacity: C.secondaryOpacity, blending: THREE.AdditiveBlending, depthWrite: false });
                const line = new THREE.Line(lineGeo, lineMat);
                this.scene.add(line);
                this.connections.push(new Connection(line, sourcePlanet, targetPlanet, 'secondary'));
            });
        });
    }

    // ── HUD ──
    buildCategoryDots() {
        const container = document.getElementById('cat-dots');
        this.categories.forEach((catId, i) => {
            const dot = document.createElement('div'); dot.className = 'cat-dot';
            const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);
            dot.style.background = '#'+color.getHexString(); dot.style.borderColor = '#'+color.getHexString();
            const label = document.createElement('span'); label.className = 'cat-dot-label';
            const node = this.DATA.nodes[catId]; label.textContent = node ? node.label : catId;
            dot.appendChild(label);
            dot.addEventListener('click', () => this.navigateToCategory(i));
            container.appendChild(dot);
        });
    }

    updateCategoryDots() {
        document.querySelectorAll('.cat-dot').forEach((d, i) => d.classList.toggle('active', i === this.currentCatIndex));
    }

    updateCategoryDotsMode(mode) {
        const c = document.getElementById('cat-dots');
        if (c) c.classList.toggle('expanded', mode === 'camera');
    }

    // ── Navigation ──
    navigateToCategory(index, instant = false) {
        if (this.currentView === 'camera') this.setViewMode('global');
        if (this.currentView !== 'global') return;
        if (this.cam.isTransitioning && !instant) return;
        // Wrap around; -1 means "go to last", length means "go to first"
        if (index < 0) index = this.categories.length - 1;
        if (index >= this.categories.length) index = 0;
        this.currentCatIndex = index;
        const catId = this.categories[index];
        const catObj = this.categoryGroups[catId]; if (!catObj) return;
        const node = this.DATA.nodes[catId];
        const childCount = (this.DATA.categoryChildren[catId] || []).length;
        const color = new THREE.Color(CAT_COLORS[catId] || 0xffffff);
        const labelEl = document.getElementById('cat-label-text');
        labelEl.textContent = node ? node.label : catId;
        labelEl.style.color = '#'+color.getHexString();
        document.getElementById('cat-count-text').textContent = `${childCount} herramienta${childCount !== 1 ? 's' : ''} · ${index+1}/${this.categories.length}`;
        this.updateCategoryDots();
        this.cam.navigateTo(catObj.group.position, instant);
        this.updateActiveConnections();
    }

    adjustZoom(delta) {
        if (this.currentView !== 'global') return;
        if (!this.cam.adjustZoom(delta)) return;
        const catId = this.categories[this.currentCatIndex];
        const catObj = this.categoryGroups[catId]; if (!catObj) return;
        this.cam.navigateTo(catObj.group.position);
    }

    // ── View Mode ──
    setViewMode(mode) {
        if (mode === 'camera' && !this.activePlanet) {
            const ind = document.getElementById('selection-indicator');
            ind.classList.add('visible');
            document.getElementById('sel-planet-text').textContent = 'Seleccioná un planeta primero';
            document.getElementById('sel-category-text').textContent = '';
            setTimeout(() => { if (!this.activePlanet) ind.classList.remove('visible'); }, 2000);
            return;
        }
        const prevView = this.currentView;
        this.currentView = mode;
        document.querySelectorAll('#view-mode-toggle .neon-btn').forEach(b => b.classList.remove('active'));
        if (mode === 'global') document.getElementById('btn-view-global').classList.add('active');
        else if (mode === 'camera') document.getElementById('btn-view-camera').classList.add('active');
        else if (mode === 'ship') document.getElementById('btn-view-ship').classList.add('active');

        const orbitHud = document.getElementById('hud');
        const shipHud = document.getElementById('ship-hud');
        const cameraHint = document.getElementById('camera-hint');
        this.updateCategoryDotsMode(mode);

        if (prevView === 'ship' && mode !== 'ship') {
            this.clearShipAimedLines();
            if (this.shipHoveredMesh) { const hp = this.getPlanetByMesh(this.shipHoveredMesh); if (hp) hp.unhover(); }
            this.shipHoveredMesh = null;
        }

        if (mode === 'global') {
            this.cam.controls.enabled = true;
            orbitHud.style.display = ''; shipHud.classList.remove('visible');
            if (cameraHint) cameraHint.classList.remove('visible');
            if (document.pointerLockElement) document.exitPointerLock();
            this.clearActivePlanet(); this.closeInfoPanel(); this.particles.clear();
            this.cam.isTransitioning = false;
            // Always return to center (Arte Generativo)
            this.currentCatIndex = -1;
            document.getElementById('cat-label-text').textContent = 'Arte Generativo y Código con IA';
            document.getElementById('cat-label-text').style.color = '#' + new THREE.Color(CFG.sun.color).getHexString();
            document.getElementById('cat-count-text').textContent = `${this.categories.length} universos`;
            this.updateCategoryDots();
            this.cam.goHome();
        } else if (mode === 'camera') {
            this.cam.controls.enabled = false;
            orbitHud.style.display = ''; shipHud.classList.remove('visible');
            if (cameraHint) cameraHint.classList.add('visible');
            if (document.pointerLockElement) document.exitPointerLock();
            if (this.activePlanet) this.cam.initFollowFrom(this.activePlanet.getWorldPosition());
        } else if (mode === 'ship') {
            this.cam.controls.enabled = false;
            orbitHud.style.display = 'none'; shipHud.classList.add('visible');
            if (cameraHint) cameraHint.classList.remove('visible');
            this.cam.initShip();
        }
    }

    // ── Info Panel ──
    showInfoPanel(node) {
        const panel = document.getElementById('info-panel');
        const content = document.getElementById('info-content');
        let html = '';
        if (node.infoHTML) html += node.infoHTML.replace(/\\n/g, '\n');
        else { html += `<h3>${node.label || node.id}</h3>`; if (node.info) html += `<p>${node.info}</p>`; }
        if (node.url) html += `<p style="margin-top:12px"><a href="${node.url}" target="_blank">🔗 ${node.url}</a></p>`;
        const sec = node.connections?.secondary || [];
        if (sec.length > 0) {
            html += '<p style="margin-top:10px;color:rgba(255,255,255,0.45);font-size:0.78rem">Conexiones:</p>';
            sec.forEach(s => { const sn = this.DATA.nodes[s]; html += `<span class="tag">${sn ? sn.label : s}</span>`; });
        }
        content.innerHTML = html; panel.classList.add('visible');
    }

    closeInfoPanel() { document.getElementById('info-panel').classList.remove('visible'); }

    updateSelectionIndicator(planet) {
        const indicator = document.getElementById('selection-indicator');
        document.getElementById('sel-planet-text').textContent = planet.label;
        let catName = '';
        if (planet.type === 'category') catName = 'Categoría';
        else if (planet.id === 'root') catName = 'Centro del Universo';
        else if (planet.category) { const cn = this.DATA.nodes[planet.category]; catName = cn ? cn.label : planet.category; }
        document.getElementById('sel-category-text').textContent = catName;
        let color = '#fff';
        if (planet.category) color = '#'+new THREE.Color(CAT_COLORS[planet.category] || 0xffffff).getHexString();
        else if (planet.type === 'category') color = '#'+new THREE.Color(CAT_COLORS[planet.id] || 0xffffff).getHexString();
        document.getElementById('sel-planet-text').style.color = color;
        // Set CSS custom property for the spacial UI accent color
        indicator.style.setProperty('--sel-color', color);
        indicator.classList.add('visible');
    }

    hideSelectionIndicator() { document.getElementById('selection-indicator').classList.remove('visible'); }

    // ── Ship Aimed Lines ──
    clearShipAimedLines() {
        this.shipAimedLines.forEach(l => { this.scene.remove(l); l.geometry.dispose(); l.material.dispose(); });
        this.shipAimedLines = [];
    }

    buildShipAimedLines(planet) {
        this.clearShipAimedLines();
        const sec = planet.node.connections?.secondary || []; if (sec.length === 0) return;
        const sp = planet.getWorldPosition();
        sec.forEach(targetId => {
            const tp = this.getPlanetById(targetId); if (!tp) return;
            const tpos = tp.getWorldPosition();
            const lineGeo = new THREE.BufferGeometry().setFromPoints([sp, tpos]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 2 });
            const line = new THREE.Line(lineGeo, lineMat);
            this.scene.add(line); this.shipAimedLines.push(line);
        });
    }

    updateShipRaycast() {
        if (this.currentView !== 'ship') return;
        if (!this.tooltip) this.tooltip = document.getElementById('hover-tooltip');
        this.raycaster.setFromCamera(new THREE.Vector2(0,0), this.camera);
        const hits = this.raycaster.intersectObjects(this.allMeshes);
        if (this.shipHoveredMesh) { const hp = this.getPlanetByMesh(this.shipHoveredMesh); if (hp && hp !== this.activePlanet) hp.unhover(); }

        if (hits.length > 0) {
            const mesh = hits[0].object;
            const planet = this.getPlanetByMesh(mesh);
            if (planet) {
                planet.hover();
                if (this.shipHoveredMesh !== mesh) this.buildShipAimedLines(planet);
                this.shipHoveredMesh = mesh;
                this.tooltip.textContent = planet.label;
                this.tooltip.style.left = (innerWidth/2+30)+'px'; this.tooltip.style.top = (innerHeight/2-12)+'px';
                this.tooltip.classList.add('visible');
                this.showInfoPanel(planet.node);
                const ch = document.getElementById('ship-crosshair'); if (ch) ch.classList.add('locked');
            }
        } else {
            if (this.shipHoveredMesh) this.clearShipAimedLines();
            this.shipHoveredMesh = null;
            if (this.tooltip) this.tooltip.classList.remove('visible');
            const ch = document.getElementById('ship-crosshair'); if (ch) ch.classList.remove('locked');
            this.closeInfoPanel();
        }

        if (this.shipHoveredMesh && this.shipAimedLines.length > 0) {
            const planet = this.getPlanetByMesh(this.shipHoveredMesh); if (!planet) return;
            const sec = planet.node.connections?.secondary || [];
            const sp = planet.getWorldPosition(); let li = 0;
            sec.forEach(targetId => {
                const tp = this.getPlanetById(targetId);
                if (!tp || li >= this.shipAimedLines.length) return;
                const tpos = tp.getWorldPosition();
                const p = this.shipAimedLines[li].geometry.attributes.position.array;
                p[0]=sp.x; p[1]=sp.y; p[2]=sp.z; p[3]=tpos.x; p[4]=tpos.y; p[5]=tpos.z;
                this.shipAimedLines[li].geometry.attributes.position.needsUpdate = true; li++;
            });
        }
    }

    // ── Events ──
    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('dblclick', (e) => this.onDoubleClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.renderer.domElement.addEventListener('mouseup', () => this.onMouseUp());

        document.getElementById('btn-prev').addEventListener('click', (e) => { e.stopPropagation(); this.navigateToCategory(this.currentCatIndex-1); });
        document.getElementById('btn-next').addEventListener('click', (e) => { e.stopPropagation(); this.navigateToCategory(this.currentCatIndex+1); });
        document.getElementById('btn-zin').addEventListener('click', (e) => { e.stopPropagation(); this.adjustZoom(-CFG.camera.zoomStep); });
        document.getElementById('btn-zout').addEventListener('click', (e) => { e.stopPropagation(); this.adjustZoom(CFG.camera.zoomStep); });
        document.getElementById('info-close').addEventListener('click', () => this.closeInfoPanel());

        document.getElementById('btn-view-global').addEventListener('click', () => this.setViewMode('global'));
        document.getElementById('btn-view-camera').addEventListener('click', () => this.setViewMode('camera'));
        document.getElementById('btn-view-ship').addEventListener('click', () => this.setViewMode('ship'));

        document.getElementById('btn-show-connections').addEventListener('click', () => {
            this.showAllConnections = !this.showAllConnections;
            const btn = document.getElementById('btn-show-connections');
            btn.classList.toggle('active', this.showAllConnections);
            btn.textContent = this.showAllConnections ? 'Conexiones ON' : 'Conexiones OFF';
            this.updateActiveConnections();
        });

        document.addEventListener('pointerlockchange', () => {
            this.cam.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });

        this.renderer.domElement.addEventListener('wheel', (e) => {
            if (this.currentView === 'global') { e.preventDefault(); this.adjustZoom(e.deltaY > 0 ? 0.1 : -0.1); }
            else if (this.currentView === 'camera') { e.preventDefault(); this.cam.followDistance = Math.max(20, Math.min(300, this.cam.followDistance + (e.deltaY > 0 ? 5 : -5))); }
        }, { passive: false });
    }

    onResize() {
        this.camera.aspect = innerWidth/innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
    }

    onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (k === 'w') this.keys.w = true; if (k === 's') this.keys.s = true;
        if (k === 'a') this.keys.a = true; if (k === 'd') this.keys.d = true;
        if (k === 'q') this.keys.q = true; if (k === 'e') this.keys.e = true;
        if (k === 'shift') this.keys.shift = true; if (k === ' ') this.keys.space = true;

        if (this.currentView === 'ship') {
            if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
            if (k === 'escape' && document.pointerLockElement) document.exitPointerLock();
            if (k === 'v') this.setViewMode('global');
            return;
        }
        if (this.currentView === 'camera') {
            if (k === 'escape' || k === 'v') { this.setViewMode('global'); return; }
            return;
        }
        switch (e.key) {
            case 'ArrowLeft': this.navigateToCategory(this.currentCatIndex-1); break;
            case 'ArrowRight': this.navigateToCategory(this.currentCatIndex+1); break;
            case 'ArrowUp': e.preventDefault(); this.adjustZoom(-CFG.camera.zoomStep); break;
            case 'ArrowDown': e.preventDefault(); this.adjustZoom(CFG.camera.zoomStep); break;
            case 'Escape': this.closeInfoPanel(); this.clearActivePlanet(); break;
            case 'n': case 'N': this.labelsVisible = !this.labelsVisible; this.allLabelSprites.forEach(s => s.visible = this.labelsVisible); break;
            case 'v': case 'V': if (this.activePlanet) this.setViewMode('camera'); break;
            case 'f': case 'F': this.setViewMode('ship'); break;
        }
    }

    onKeyUp(e) {
        const k = e.key.toLowerCase();
        if (k === 'w') this.keys.w = false; if (k === 's') this.keys.s = false;
        if (k === 'a') this.keys.a = false; if (k === 'd') this.keys.d = false;
        if (k === 'q') this.keys.q = false; if (k === 'e') this.keys.e = false;
        if (k === 'shift') this.keys.shift = false; if (k === ' ') this.keys.space = false;
    }

    onClick(e) {
        if (this.currentView === 'ship') { this.renderer.domElement.requestPointerLock(); return; }

        this.mouse.x = (e.clientX/innerWidth)*2-1;
        this.mouse.y = -(e.clientY/innerHeight)*2+1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.allMeshes);

        if (hits.length > 0) {
            const mesh = hits[0].object;
            const planet = this.getPlanetByMesh(mesh);
            if (!planet) return;
            if (this.activePlanet === planet) {
                this.clearActivePlanet(); this.closeInfoPanel();
                if (this.currentView === 'camera') this.setViewMode('global');
            } else {
                this.setActivePlanet(planet);
                this.showInfoPanel(planet.node);
                if (this.currentView === 'global') this.setViewMode('camera');
                else if (this.currentView === 'camera') this.cam.initFollowFrom(planet.getWorldPosition());
            }
        } else {
            if (this.currentView === 'camera') return;
            this.clearActivePlanet(); this.closeInfoPanel();
        }
    }

    onDoubleClick(e) {
        e.preventDefault();
        if (this.currentView === 'ship') {
            // Ship mode: warp to aimed planet
            this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
            const hits = this.raycaster.intersectObjects(this.allMeshes);
            if (hits.length > 0) {
                const planet = this.getPlanetByMesh(hits[0].object);
                if (!planet) return;
                const targetPos = planet.getWorldPosition();
                this.setActivePlanet(planet);
                this.showInfoPanel(planet.node);
                // Calculate stop distance: 5x the planet's radius so we don't crash
                const pRadius = planet.mesh.geometry?.parameters?.radius || CFG.planet.radius;
                const stopDist = Math.max(pRadius * 5, 60);
                // Show warp flash overlay
                this.showWarpFlash();
                this.cam.startWarp(targetPos, stopDist, () => {
                    // Warp complete — particles burst
                    this.particles.spawn(planet);
                });
            }
            return;
        }
        if (this.currentView !== 'global') return;
        this.mouse.x = (e.clientX/innerWidth)*2-1;
        this.mouse.y = -(e.clientY/innerHeight)*2+1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.allMeshes);
        if (hits.length > 0) {
            const planet = this.getPlanetByMesh(hits[0].object);
            if (!planet) return;
            this.setActivePlanet(planet);
            this.showInfoPanel(planet.node);
            this.setViewMode('camera');
        }
    }

    showWarpFlash() {
        let overlay = document.getElementById('warp-flash');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'warp-flash';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:150;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,255,255,0.6) 0%,rgba(108,180,255,0.3) 30%,transparent 70%);opacity:0;transition:opacity 0.15s ease;';
            document.body.appendChild(overlay);
        }
        // Flash in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            // Add stretch lines effect
            overlay.style.background = 'radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(0,255,255,0.4) 20%, rgba(108,180,255,0.2) 40%, transparent 70%)';
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.6s ease';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.transition = 'opacity 0.15s ease';
                    overlay.style.background = 'radial-gradient(ellipse at center,rgba(0,255,255,0.6) 0%,rgba(108,180,255,0.3) 30%,transparent 70%)';
                }, 600);
            }, 200);
        });
    }

    onMouseDown(e) {
        if (this.currentView === 'camera') {
            this.cam.mouseDown = true;
            this.cam.lastMouseX = e.clientX;
            this.cam.lastMouseY = e.clientY;
        }
    }

    onMouseUp() {
        if (this.currentView === 'camera') this.cam.mouseDown = false;
    }

    onMouseMove(e) {
        if (!this.tooltip) this.tooltip = document.getElementById('hover-tooltip');

        if (this.currentView === 'ship' && this.cam.pointerLocked) {
            this.cam.onMouseMoveShip(e); return;
        }
        if (this.currentView === 'camera' && this.cam.mouseDown) {
            const dx = e.clientX - this.cam.lastMouseX;
            const dy = e.clientY - this.cam.lastMouseY;
            this.cam.onMouseMoveFollow(dx, dy);
            this.cam.lastMouseX = e.clientX; this.cam.lastMouseY = e.clientY;
            return;
        }
        if (this.currentView !== 'global') return;

        this.mouse.x = (e.clientX/innerWidth)*2-1;
        this.mouse.y = -(e.clientY/innerHeight)*2+1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObjects(this.allMeshes);

        if (this.hoveredPlanet && this.hoveredPlanet !== this.activePlanet) {
            this.hoveredPlanet.unhover();
        }

        if (hits.length > 0) {
            const planet = this.getPlanetByMesh(hits[0].object);
            if (planet) {
                this.renderer.domElement.style.cursor = 'pointer';
                planet.hover();
                this.hoveredPlanet = planet;
                this.tooltip.textContent = planet.label;
                this.tooltip.style.left = (e.clientX+16)+'px';
                this.tooltip.style.top = (e.clientY-12)+'px';
                this.tooltip.classList.add('visible');
            }
        } else {
            this.renderer.domElement.style.cursor = 'default';
            this.hoveredPlanet = null;
            this.tooltip.classList.remove('visible');
        }
    }

    // ── Splash Screen ──
    showSplash() {
        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
            setTimeout(() => { const el = document.getElementById('loading'); if (el) el.remove(); }, 800);
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
    }

    // ── Animation Loop ──
    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = this.clock.getDelta();
        this.animTime += dt;

        // Animate planet orbits
        Object.values(this.categoryGroups).forEach(catObj => {
            catObj.planets.forEach(pm => {
                const u = pm.userData;
                const r = u.orbitRadius;
                const theta = u.orbitOffset + this.animTime * u.orbitSpeed;
                const phi = (u.orbitTilt + Math.PI/2) + Math.sin(this.animTime*0.3 + u.orbitOffset)*0.3;
                pm.position.x = Math.sin(phi)*Math.cos(theta)*r;
                pm.position.y = Math.cos(phi)*r;
                pm.position.z = Math.sin(phi)*Math.sin(theta)*r;
            });
            const pulse = 0.92 + Math.sin(this.animTime*1.5)*0.05;
            catObj.nucleus.material.opacity = pulse;
            const nucleusPlanet = this.getPlanetByMesh(catObj.nucleus);
            if (nucleusPlanet && !nucleusPlanet.isActive && nucleusPlanet !== this.hoveredPlanet) {
                catObj.nucleus.material.emissiveIntensity = CFG.nucleus.emissiveIntensity - 0.1 + Math.sin(this.animTime*2)*0.15;
            }
        });

        if (this.sunMesh) {
            const sunP = this.sunPlanet;
            if (sunP && !sunP.isActive && sunP !== this.hoveredPlanet) {
                this.sunMesh.material.emissiveIntensity = 0.8 + Math.sin(this.animTime*1.2)*0.3;
            }
            this.sunMesh.material.opacity = 0.9 + Math.sin(this.animTime*1.8)*0.05;
        }

        // Twinkling stars
        if (this.starPoints && this.starBaseSizes) {
            const sizeAttr = this.starPoints.geometry.getAttribute('size');
            for (let i = 0; i < this.starBaseSizes.length; i++) {
                const twinkle = Math.sin(this.animTime*this.starTwinkleSpeeds[i] + this.starTwinklePhases[i]);
                sizeAttr.array[i] = this.starBaseSizes[i]*(0.3+0.7*(twinkle*0.5+0.5));
            }
            sizeAttr.needsUpdate = true;
        }

        // Update connection positions
        this.connections.forEach(c => c.updatePositions());

        // Particles
        this.particles.update(dt, this.camera.position);

        // View-specific updates
        if (this.currentView === 'ship') {
            if (this.cam.warping) {
                // Warp animation in progress
                this.cam.updateWarp(dt);
                const speedEl = document.getElementById('ship-speed-value');
                if (speedEl) speedEl.textContent = 'WARP';
                const throttleFill = document.getElementById('ship-throttle-fill');
                if (throttleFill) throttleFill.style.width = '100%';
                const fireEl = document.getElementById('engine-fire');
                if (fireEl) { fireEl.style.height = '80px'; fireEl.style.opacity = '1'; }
            } else {
                const shipData = this.cam.updateShip(dt, this.keys);
                const speedEl = document.getElementById('ship-speed-value');
                if (speedEl) speedEl.textContent = Math.round(shipData.speed);
                const throttleFill = document.getElementById('ship-throttle-fill');
                if (throttleFill) throttleFill.style.width = (Math.abs(shipData.throttle)*100)+'%';
                const fireEl = document.getElementById('engine-fire');
                if (fireEl) { fireEl.style.height = (Math.max(0, shipData.throttle)*80)+'px'; fireEl.style.opacity = shipData.throttle > 0.05 ? '1' : '0'; }
                this.updateShipRaycast();
            }
        } else if (this.currentView === 'camera') {
            if (this.activePlanet) {
                this.cam.updateFollow(dt, this.activePlanet.getWorldPosition(), this.keys);
            }
        } else {
            // Global mode
            if (this.activePlanet && this.activePlanet.mesh.userData.orbitRadius !== undefined) {
                const wp = this.activePlanet.getWorldPosition();
                this.cam.targetLookAt.copy(wp);
                const radius = this.activePlanet.mesh.geometry?.parameters?.radius || 30;
                const dist = radius * 6;
                const dir = new THREE.Vector3().subVectors(this.camera.position, wp).normalize();
                this.cam.targetPos.copy(wp).add(dir.multiplyScalar(dist));
                this.cam.targetPos.y = Math.max(this.cam.targetPos.y, wp.y + dist*0.2);
                this.cam.isTransitioning = true;
            }
            this.cam.updateTransition(this.activePlanet);
            this.cam.controls.update();
        }

        // Update connection trace animations
        this.connections.forEach(conn => conn.updateTrace(dt));

        this.renderer.render(this.scene, this.camera);
    }
}

// ═══════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════
const universe = new Universe();
universe.init().catch(err => {
    console.error('Error loading:', err);
    const loadEl = document.getElementById('loading');
    if (loadEl) loadEl.innerHTML = '<p style="color:#ff6666">Error cargando datos. Verifica que mapa_herramientas_data.json esté en la misma carpeta.</p>';
});
