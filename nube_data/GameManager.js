import * as THREE from 'three';
import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════
//  CLASS: GameManager — Carrera Estelar game logic
// ═══════════════════════════════════════════════

export class GameManager {
    constructor(universe) {
        this.universe = universe;
        this.state = 'idle';           // idle | exploration | evaluation | results | ranking
        this.visitedPlanets = [];       // array of node objects visited during exploration
        this.visitedIds = new Set();    // quick lookup
        this.timeLimit = 120;           // 2 minutes in seconds
        this.timeRemaining = 0;
        this.timerInterval = null;

        // Route vs random tracking
        this.routeVisits = [];          // planets reached via official waypoint
        this.randomVisits = [];         // planets reached by random collision
        this.routeIds = new Set();      // IDs of planets that were waypoints when reached

        // Evaluation state
        this.evalQuestions = [];         // shuffled array of visited planets for quiz
        this.evalCurrentIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.evalTimerInterval = null;
        this.evalTimeLeft = 0;

        // Route: next planet waypoint
        this.nextWaypoint = null;
        this.waypointLine = null;
        this.waypointGlow = null;
        this.waypointBeacon = null;

        // Ranking
        this.playerName = '';
        this.finalScore = 0;

        // Running score during exploration
        this.runningScore = 0;

        // Combo tracking
        this.comboCount = 0;
        this._comboTimer = null;

        // Visited planet ring markers (3D)
        this._visitedRings = [];

        // Dimmed planet tracking
        this._dimmedPlanets = [];

        // DOM references (set in bindUI)
        this.dom = {};
    }

    bindUI() {
        this.dom.gameHud = document.getElementById('game-hud');
        this.dom.gameTimer = document.getElementById('game-timer');
        this.dom.gameVisited = document.getElementById('game-visited');
        this.dom.gameWaypointHint = document.getElementById('game-waypoint-hint');
        this.dom.gameCamToggle = document.getElementById('game-cam-toggle');

        this.dom.evalScreen = document.getElementById('eval-screen');
        this.dom.evalDescription = document.getElementById('eval-description');
        this.dom.evalOptions = document.getElementById('eval-options');
        this.dom.evalProgress = document.getElementById('eval-progress');
        this.dom.evalFeedback = document.getElementById('eval-feedback');

        this.dom.resultsScreen = document.getElementById('results-screen');
        this.dom.resultsCorrect = document.getElementById('results-correct');
        this.dom.resultsWrong = document.getElementById('results-wrong');
        this.dom.resultsVisited = document.getElementById('results-visited');
        this.dom.resultsScore = document.getElementById('results-score');
        this.dom.resultsReplay = document.getElementById('results-replay');
        this.dom.resultsExplore = document.getElementById('results-explore');
        this.dom.resultsRouteCount = document.getElementById('results-route-count');
        this.dom.resultsRandomCount = document.getElementById('results-random-count');

        this.dom.rankingScreen = document.getElementById('ranking-screen');
        this.dom.rankingNameInput = document.getElementById('ranking-name-input');
        this.dom.rankingSubmit = document.getElementById('ranking-submit');
        this.dom.rankingList = document.getElementById('ranking-list');
        this.dom.rankingClose = document.getElementById('ranking-close');

        this.dom.timeUpOverlay = document.getElementById('time-up-overlay');
        this.dom.congratsOverlay = document.getElementById('congrats-overlay');
        this.dom.congratsPlanetCount = document.getElementById('congrats-planet-count');

        this.dom.scoreDisplay = document.getElementById('game-score-display');
        this.dom.comboDisplay = document.getElementById('game-combo');
        this.dom.waypointArrow = document.getElementById('game-waypoint-arrow');
        this.dom.pointsPopup = document.getElementById('game-points-popup');
        this.dom.discoveryFlash = document.getElementById('game-discovery-flash');
        this.dom.evalTimer = document.getElementById('eval-timer');

        if (this.dom.resultsReplay) {
            this.dom.resultsReplay.addEventListener('click', () => this.startGame());
        }
        if (this.dom.resultsExplore) {
            this.dom.resultsExplore.addEventListener('click', () => this.showRankingScreen());
        }
        if (this.dom.gameCamToggle) {
            this.dom.gameCamToggle.addEventListener('click', () => this.toggleCamera());
        }
        if (this.dom.rankingSubmit) {
            this.dom.rankingSubmit.addEventListener('click', () => this.submitRanking());
        }
        if (this.dom.rankingClose) {
            this.dom.rankingClose.addEventListener('click', () => this.closeRanking());
        }
    }

    toggleCamera() {
        if (this.state !== 'exploration') return;
        const u = this.universe;
        u.toggleShipCabin();
        if (u.currentView === 'ship') {
            if (this.dom.gameCamToggle) this.dom.gameCamToggle.textContent = 'Cabina';
        } else {
            if (this.dom.gameCamToggle) this.dom.gameCamToggle.textContent = 'Nave';
        }
        if (this.dom.gameHud) this.dom.gameHud.classList.add('visible');
    }

    startGame() {
        this.state = 'exploration';
        this.visitedPlanets = [];
        this.visitedIds = new Set();
        this.routeVisits = [];
        this.randomVisits = [];
        this.routeIds = new Set();
        this.timeRemaining = this.timeLimit;
        this.evalQuestions = [];
        this.evalCurrentIndex = 0;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.finalScore = 0;
        this.runningScore = 0;
        this.comboCount = 0;

        // Clean up visited rings from previous game
        this._visitedRings.forEach(r => {
            if (r.parent) r.parent.remove(r);
            r.geometry.dispose();
            r.material.dispose();
        });
        this._visitedRings = [];

        // Hide waypoint arrow
        if (this.dom.waypointArrow) this.dom.waypointArrow.classList.remove('visible');

        // Hide results/eval/ranking if visible
        if (this.dom.resultsScreen) this.dom.resultsScreen.classList.remove('visible');
        if (this.dom.evalScreen) this.dom.evalScreen.classList.remove('visible');
        if (this.dom.rankingScreen) this.dom.rankingScreen.classList.remove('visible');

        // Show game HUD
        if (this.dom.gameHud) this.dom.gameHud.classList.add('visible');

        // Dim all non-route planets
        this.dimNonRoutePlanets();

        // Hide exploration-only UI
        document.getElementById('view-mode-toggle').style.display = 'none';
        document.getElementById('connections-toggle').style.display = 'none';

        // Switch to ship mode for flying
        this.universe.setViewMode('ship');

        // Pick a random starting planet and warp to it
        this.pickRandomStartAndWarp();

        // Start countdown timer
        this.startTimer();
        this.updateHUD();
    }

    pickRandomStartAndWarp() {
        const allToolNodes = this.getAllToolNodes();
        const startNode = allToolNodes[Math.floor(Math.random() * allToolNodes.length)];
        const planet = this.universe.getPlanetById(startNode.id);
        if (planet) {
            const targetPos = planet.getWorldPosition();
            this.universe.setActivePlanet(planet);
            this.universe.showInfoPanel(planet.node);
            this.universe.cam.startWarp(targetPos, 60, () => {
                this.registerVisit(planet);
                this.pickNextWaypoint();
            });
        }
    }

    getAllToolNodes() {
        const nodes = this.universe.DATA.nodes;
        return Object.values(nodes).filter(n => n.type === 'tool');
    }

    registerVisit(planet, isRoute = false) {
        if (!planet || !planet.node) return;
        if (this.visitedIds.has(planet.node.id)) return;
        this.visitedIds.add(planet.node.id);
        this.visitedPlanets.push(planet.node);

        const G = CONFIG.game || {};
        let pts = 0;
        if (isRoute) {
            this.routeVisits.push(planet.node);
            this.routeIds.add(planet.node.id);
            pts = G.pointsRouteVisit || 150;
            this.comboCount++;
        } else {
            this.randomVisits.push(planet.node);
            pts = G.pointsRandomVisit || 50;
            this.comboCount = 0;
        }

        // Apply combo multiplier
        const comboMult = this.comboCount >= 3 ? Math.min(this.comboCount, 5) : 1;
        pts *= comboMult;
        this.runningScore += pts;

        // Visual effects
        this.showDiscoveryFlash(planet);
        this.showPointsPopup(pts, isRoute, comboMult);
        this.addVisitedRing(planet);
        this.updateComboDisplay(comboMult);
        this.animateScore();

        // Activate planet in universe
        this.universe.setActivePlanet(planet);

        this.updateHUD();
    }

    dimNonRoutePlanets() {
        this.restoreAllPlanets();
        const allPlanets = this.universe.planets;
        allPlanets.forEach((planet) => {
            if (planet.type !== 'tool') return;
            const isVisited = this.visitedIds.has(planet.id);
            const isWaypoint = this.nextWaypoint && planet.id === this.nextWaypoint.id;
            if (!isVisited && !isWaypoint && planet.mesh.material) {
                planet.mesh.material._origOpacityGame = planet.mesh.material.opacity;
                planet.mesh.material._origEmissiveGame = planet.mesh.material.emissiveIntensity;
                planet.mesh.material.opacity = 0.15;
                planet.mesh.material.emissiveIntensity = 0.05;
                this._dimmedPlanets.push(planet);
            } else if (isWaypoint && planet.mesh.material) {
                planet.mesh.material.emissiveIntensity = 1.2;
                planet.mesh.material.opacity = 1.0;
            }
        });
    }

    restoreAllPlanets() {
        this._dimmedPlanets.forEach(planet => {
            if (planet.mesh.material) {
                if (planet.mesh.material._origOpacityGame !== undefined) {
                    planet.mesh.material.opacity = planet.mesh.material._origOpacityGame;
                    delete planet.mesh.material._origOpacityGame;
                }
                if (planet.mesh.material._origEmissiveGame !== undefined) {
                    planet.mesh.material.emissiveIntensity = planet.mesh.material._origEmissiveGame;
                    delete planet.mesh.material._origEmissiveGame;
                }
            }
        });
        this._dimmedPlanets = [];
    }

    pickNextWaypoint() {
        if (this.state !== 'exploration') return;
        const currentNode = this.visitedPlanets[this.visitedPlanets.length - 1];
        if (!currentNode) return;

        // Gather all connected planets (children + secondary)
        const candidates = [];
        const conns = currentNode.connections || {};
        const addCandidates = (arr) => {
            if (!arr) return;
            arr.forEach(c => {
                const id = typeof c === 'string' ? c : c.id;
                const node = this.universe.DATA.nodes[id];
                if (node && node.type === 'tool' && !this.visitedIds.has(id)) {
                    candidates.push(node);
                }
            });
        };
        addCandidates(conns.children);
        addCandidates(conns.secondary);
        // Also check parent connections for tools
        if (conns.parent) {
            conns.parent.forEach(p => {
                const parentNode = this.universe.DATA.nodes[p.id || p];
                if (parentNode && parentNode.connections) {
                    addCandidates(parentNode.connections.children);
                }
            });
        }

        if (candidates.length === 0) {
            // No unvisited connections — pick a random unvisited tool
            const allTools = this.getAllToolNodes();
            const unvisited = allTools.filter(n => !this.visitedIds.has(n.id));
            if (unvisited.length > 0) {
                this.nextWaypoint = unvisited[Math.floor(Math.random() * unvisited.length)];
            } else {
                this.nextWaypoint = null;
            }
        } else {
            this.nextWaypoint = candidates[Math.floor(Math.random() * candidates.length)];
        }

        this.updateWaypointHint();
        this.updateWaypointLine();
        // Re-dim planets with updated waypoint
        this.dimNonRoutePlanets();
    }

    updateWaypointHint() {
        if (!this.dom.gameWaypointHint) return;
        if (this.nextWaypoint) {
            this.dom.gameWaypointHint.textContent = 'Siguiente: ' + (this.nextWaypoint.label || this.nextWaypoint.id);
            this.dom.gameWaypointHint.classList.add('visible');
        } else {
            this.dom.gameWaypointHint.classList.remove('visible');
        }
    }

    updateWaypointLine() {
        // Remove old line + glow + beacon
        this.clearWaypointVisuals();
        if (!this.nextWaypoint) return;
        const targetPlanet = this.universe.getPlanetById(this.nextWaypoint.id);
        if (!targetPlanet) return;

        const CONFIG_W = this.universe.cam?.cfg?.waypoint || { color: 0x00ffcc, opacity: 0.6, dashSize: 40, gapSize: 20, glowColor: 0x00ffcc, glowOpacity: 0.25 };

        const targetPos = targetPlanet.getWorldPosition();
        const camPos = this.universe.camera.position.clone();

        // Dashed main line
        const geometry = new THREE.BufferGeometry().setFromPoints([camPos, targetPos]);
        const material = new THREE.LineDashedMaterial({
            color: CONFIG_W.color || 0x00ffcc,
            transparent: true,
            opacity: CONFIG_W.opacity || 0.6,
            dashSize: CONFIG_W.dashSize || 40,
            gapSize: CONFIG_W.gapSize || 20,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.waypointLine = new THREE.Line(geometry, material);
        this.waypointLine.computeLineDistances();
        this.universe.scene.add(this.waypointLine);

        // Glow line (thicker, softer)
        const glowGeo = new THREE.BufferGeometry().setFromPoints([camPos, targetPos]);
        const glowMat = new THREE.LineBasicMaterial({
            color: CONFIG_W.glowColor || 0x00ffcc,
            transparent: true,
            opacity: CONFIG_W.glowOpacity || 0.25,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.waypointGlow = new THREE.Line(glowGeo, glowMat);
        this.universe.scene.add(this.waypointGlow);

        // Beacon sphere at target planet
        const beaconGeo = new THREE.SphereGeometry(45, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: CONFIG_W.color || 0x00ffcc,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.BackSide,
        });
        this.waypointBeacon = new THREE.Mesh(beaconGeo, beaconMat);
        this.waypointBeacon.position.copy(targetPos);
        this.universe.scene.add(this.waypointBeacon);
    }

    clearWaypointVisuals() {
        if (this.waypointLine) {
            this.universe.scene.remove(this.waypointLine);
            this.waypointLine.geometry.dispose();
            this.waypointLine.material.dispose();
            this.waypointLine = null;
        }
        if (this.waypointGlow) {
            this.universe.scene.remove(this.waypointGlow);
            this.waypointGlow.geometry.dispose();
            this.waypointGlow.material.dispose();
            this.waypointGlow = null;
        }
        if (this.waypointBeacon) {
            this.universe.scene.remove(this.waypointBeacon);
            this.waypointBeacon.geometry.dispose();
            this.waypointBeacon.material.dispose();
            this.waypointBeacon = null;
        }
    }

    onPlanetReached(planet) {
        if (this.state !== 'exploration') return;
        if (!planet || !planet.node || planet.node.type !== 'tool') return;

        const isRoute = this.nextWaypoint && planet.node.id === this.nextWaypoint.id;
        this.registerVisit(planet, isRoute);
        this.universe.showInfoPanel(planet.node);
        this.pickNextWaypoint();
    }

    // ── Visual Effects ──

    showDiscoveryFlash(planet) {
        const flash = this.dom.discoveryFlash;
        if (!flash) return;
        const catColors = CONFIG.categoryColors || {};
        const catId = planet.category || planet.id;
        const colorHex = catColors[catId];
        if (colorHex !== undefined) {
            const c = new THREE.Color(colorHex);
            flash.style.setProperty('--flash-color', `rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},0.5)`);
        }
        flash.classList.remove('show');
        void flash.offsetWidth;
        flash.classList.add('show');
        setTimeout(() => flash.classList.remove('show'), 900);
    }

    showPointsPopup(pts, isRoute, comboMult) {
        const popup = this.dom.pointsPopup;
        if (!popup) return;
        let text = `+${pts} PTS`;
        if (isRoute && comboMult > 1) text += ` x${comboMult} COMBO`;
        else if (isRoute) text += ' RUTA';
        popup.textContent = text;
        popup.classList.remove('show');
        void popup.offsetWidth;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 1600);
    }

    addVisitedRing(planet) {
        const pRadius = planet.mesh.geometry?.parameters?.radius || 30;
        const ringGeo = new THREE.RingGeometry(pRadius * 1.4, pRadius * 1.55, 32);
        const catColors = CONFIG.categoryColors || {};
        const catId = planet.category || planet.id;
        const color = new THREE.Color(catColors[catId] || 0x00ffcc);
        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        planet.mesh.add(ring);
        this._visitedRings.push(ring);
    }

    updateComboDisplay(comboMult) {
        const el = this.dom.comboDisplay;
        if (!el) return;
        if (this.comboCount >= 2) {
            el.textContent = `x${comboMult} COMBO`;
            el.classList.add('visible');
            if (this._comboTimer) clearTimeout(this._comboTimer);
            this._comboTimer = setTimeout(() => el.classList.remove('visible'), 3000);
        } else {
            el.classList.remove('visible');
        }
    }

    animateScore() {
        const el = this.dom.scoreDisplay;
        if (!el) return;
        el.textContent = `${this.runningScore} PTS`;
        el.classList.add('bounce');
        setTimeout(() => el.classList.remove('bounce'), 300);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeRemaining -= 1;
            this.updateHUD();
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                this.endExploration();
            }
        }, 1000);
    }

    endExploration() {
        if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }

        // Exit pointer lock
        if (document.pointerLockElement) document.exitPointerLock();

        // Restore dimmed planets
        this.restoreAllPlanets();

        // Remove waypoint visuals
        this.clearWaypointVisuals();
        if (this.dom.waypointArrow) this.dom.waypointArrow.classList.remove('visible');

        // Show time-up animation overlay
        this.showTimeUpAnimation(() => {
            this.state = 'evaluation';
            // Hide game HUD and ship HUD
            if (this.dom.gameHud) this.dom.gameHud.classList.remove('visible');
            document.getElementById('ship-hud').classList.remove('visible');

            // Prepare evaluation questions (shuffle visited planets)
            this.evalQuestions = [...this.visitedPlanets];
            this.shuffleArray(this.evalQuestions);
            this.evalCurrentIndex = 0;
            this.correctCount = 0;
            this.wrongCount = 0;

            if (this.evalQuestions.length === 0) {
                this.showResults();
                return;
            }

            this.showEvalScreen();
        });
    }

    showTimeUpAnimation(callback) {
        // Hide any background UI that could bleed through
        this._hideBackgroundUI();

        const overlay = this.dom.timeUpOverlay;
        if (!overlay) { callback(); return; }
        // Reset animation by forcing reflow
        overlay.classList.remove('visible');
        void overlay.offsetWidth;
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            this.showCongratsAnimation(callback);
        }, 3500);
    }

    showCongratsAnimation(callback) {
        // Ensure background UI stays hidden
        this._hideBackgroundUI();

        const overlay = this.dom.congratsOverlay;
        if (!overlay) { callback(); return; }
        if (this.dom.congratsPlanetCount) {
            this.dom.congratsPlanetCount.textContent = this.visitedPlanets.length;
        }
        // Reset animation by forcing reflow
        overlay.classList.remove('visible');
        void overlay.offsetWidth;
        overlay.classList.add('visible');
        setTimeout(() => {
            overlay.classList.remove('visible');
            callback();
        }, 5000);
    }

    _hideBackgroundUI() {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) infoPanel.classList.remove('visible');
        const selIndicator = document.getElementById('selection-indicator');
        if (selIndicator) selIndicator.classList.remove('visible');
        const shipHud = document.getElementById('ship-hud');
        if (shipHud) shipHud.classList.remove('visible');
        const hoverTooltip = document.getElementById('hover-tooltip');
        if (hoverTooltip) hoverTooltip.classList.remove('visible');
    }

    showEvalScreen() {
        if (this.dom.evalScreen) this.dom.evalScreen.classList.add('visible');
        if (this.dom.evalFeedback) {
            this.dom.evalFeedback.textContent = '';
            this.dom.evalFeedback.className = 'eval-feedback';
        }
        this.showNextQuestion();
    }

    startEvalTimer() {
        this.stopEvalTimer();
        const G = CONFIG.game || {};
        this.evalTimeLeft = G.evalTimePerQuestion || 30;
        this.updateEvalTimerDisplay();
        this.evalTimerInterval = setInterval(() => {
            this.evalTimeLeft -= 1;
            this.updateEvalTimerDisplay();
            if (this.evalTimeLeft <= 0) {
                this.stopEvalTimer();
                this.handleEvalTimeout();
            }
        }, 1000);
    }

    stopEvalTimer() {
        if (this.evalTimerInterval) {
            clearInterval(this.evalTimerInterval);
            this.evalTimerInterval = null;
        }
    }

    updateEvalTimerDisplay() {
        if (!this.dom.evalTimer) return;
        this.dom.evalTimer.textContent = this.evalTimeLeft;
        if (this.evalTimeLeft <= 10) {
            this.dom.evalTimer.classList.add('warning');
        } else {
            this.dom.evalTimer.classList.remove('warning');
        }
    }

    handleEvalTimeout() {
        // Time ran out — count as wrong, disable buttons, show correct answer
        this.wrongCount++;
        const allBtns = this.dom.evalOptions ? this.dom.evalOptions.querySelectorAll('.eval-option-btn') : [];
        const node = this.evalQuestions[this.evalCurrentIndex];
        const correctLabel = node ? (node.label || node.id) : '';
        allBtns.forEach(b => {
            b.disabled = true;
            if (b.textContent === correctLabel) b.classList.add('correct');
        });
        if (this.dom.evalFeedback) {
            this.dom.evalFeedback.textContent = 'TIEMPO! — Era: ' + correctLabel;
            this.dom.evalFeedback.className = 'eval-feedback wrong';
        }
        setTimeout(() => {
            this.evalCurrentIndex++;
            this.showNextQuestion();
        }, 1500);
    }

    showNextQuestion() {
        this.stopEvalTimer();
        if (this.evalCurrentIndex >= this.evalQuestions.length) {
            this.dom.evalScreen.classList.remove('visible');
            this.showResults();
            return;
        }

        const node = this.evalQuestions[this.evalCurrentIndex];
        // Show description (strip HTML tags for clean text)
        const descText = this.extractDescription(node);
        if (this.dom.evalDescription) this.dom.evalDescription.textContent = descText;

        // Progress indicator
        if (this.dom.evalProgress) {
            this.dom.evalProgress.textContent = `Pregunta ${this.evalCurrentIndex + 1} de ${this.evalQuestions.length}`;
        }

        // Generate 5 options: 1 correct + 4 random wrong
        const correctLabel = node.label || node.id;
        const allTools = this.getAllToolNodes();
        const wrongOptions = allTools
            .filter(n => n.id !== node.id)
            .map(n => n.label || n.id);
        this.shuffleArray(wrongOptions);
        const options = [correctLabel, ...wrongOptions.slice(0, 4)];
        this.shuffleArray(options);

        // Render options
        if (this.dom.evalOptions) {
            this.dom.evalOptions.innerHTML = '';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'eval-option-btn';
                btn.textContent = opt;
                btn.addEventListener('click', () => this.handleAnswer(opt, correctLabel, btn));
                this.dom.evalOptions.appendChild(btn);
            });
        }

        // Clear feedback
        if (this.dom.evalFeedback) {
            this.dom.evalFeedback.textContent = '';
            this.dom.evalFeedback.className = 'eval-feedback';
        }

        // Start per-question timer
        this.startEvalTimer();
    }

    extractDescription(node) {
        // Use info field, strip the title from the beginning
        let text = node.info || '';
        const label = node.label || '';
        if (text.startsWith(label)) {
            text = text.substring(label.length).trim();
        }
        return text;
    }

    handleAnswer(selected, correct, btnEl) {
        // Stop the per-question timer
        this.stopEvalTimer();
        // Disable all buttons
        const allBtns = this.dom.evalOptions.querySelectorAll('.eval-option-btn');
        allBtns.forEach(b => { b.disabled = true; });

        if (selected === correct) {
            this.correctCount++;
            btnEl.classList.add('correct');
            if (this.dom.evalFeedback) {
                this.dom.evalFeedback.textContent = 'CORRECTO!';
                this.dom.evalFeedback.className = 'eval-feedback correct';
            }
        } else {
            this.wrongCount++;
            btnEl.classList.add('wrong');
            // Highlight the correct one
            allBtns.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
            if (this.dom.evalFeedback) {
                this.dom.evalFeedback.textContent = 'INCORRECTO — Era: ' + correct;
                this.dom.evalFeedback.className = 'eval-feedback wrong';
            }
        }

        // Advance after a short delay
        setTimeout(() => {
            this.evalCurrentIndex++;
            this.showNextQuestion();
        }, 1500);
    }

    showResults() {
        this.state = 'results';
        const G = CONFIG.game || {};
        const quizPts = (this.correctCount * (G.pointsPerCorrect || 200)) + (this.wrongCount * (G.pointsPerWrong || -50));
        this.finalScore = Math.max(0, this.runningScore + quizPts);

        if (this.dom.resultsCorrect) this.dom.resultsCorrect.textContent = this.correctCount;
        if (this.dom.resultsWrong) this.dom.resultsWrong.textContent = this.wrongCount;
        if (this.dom.resultsVisited) this.dom.resultsVisited.textContent = this.visitedPlanets.length;
        if (this.dom.resultsRouteCount) this.dom.resultsRouteCount.textContent = this.routeVisits.length;
        if (this.dom.resultsRandomCount) this.dom.resultsRandomCount.textContent = this.randomVisits.length;
        if (this.dom.resultsScore) this.dom.resultsScore.textContent = this.finalScore;
        if (this.dom.resultsScreen) this.dom.resultsScreen.classList.add('visible');
    }

    // ── Ranking System ──
    showRankingScreen() {
        this.state = 'ranking';
        if (this.dom.resultsScreen) this.dom.resultsScreen.classList.remove('visible');
        if (this.dom.rankingScreen) this.dom.rankingScreen.classList.add('visible');
        if (this.dom.rankingNameInput) this.dom.rankingNameInput.value = '';
        this.renderRankingList();
    }

    submitRanking() {
        const name = (this.dom.rankingNameInput?.value || '').trim();
        if (!name) return;
        this.playerName = name;
        this.saveToLeaderboard(name, this.finalScore);
        this.renderRankingList();
        if (this.dom.rankingNameInput) this.dom.rankingNameInput.disabled = true;
        if (this.dom.rankingSubmit) this.dom.rankingSubmit.disabled = true;
    }

    saveToLeaderboard(name, score) {
        const key = 'nube_universos_ranking';
        let rankings = [];
        try { rankings = JSON.parse(localStorage.getItem(key)) || []; } catch(e) { rankings = []; }
        rankings.push({ name, score, date: new Date().toISOString().split('T')[0] });
        rankings.sort((a, b) => b.score - a.score);
        rankings = rankings.slice(0, 20);
        localStorage.setItem(key, JSON.stringify(rankings));
    }

    getLeaderboard() {
        const key = 'nube_universos_ranking';
        try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e) { return []; }
    }

    renderRankingList() {
        if (!this.dom.rankingList) return;
        const rankings = this.getLeaderboard();
        if (rankings.length === 0) {
            this.dom.rankingList.innerHTML = '<div class="ranking-empty">No hay puntajes todavía</div>';
            return;
        }
        let html = '';
        rankings.forEach((entry, i) => {
            const isMe = entry.name === this.playerName && entry.score === this.finalScore;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            html += `<div class="ranking-row${isMe ? ' ranking-highlight' : ''}">`;
            html += `<span class="ranking-pos">${medal}</span>`;
            html += `<span class="ranking-name">${entry.name}</span>`;
            html += `<span class="ranking-score">${entry.score}</span>`;
            html += `</div>`;
        });
        this.dom.rankingList.innerHTML = html;
    }

    closeRanking() {
        if (this.dom.rankingScreen) this.dom.rankingScreen.classList.remove('visible');
        if (this.dom.rankingNameInput) this.dom.rankingNameInput.disabled = false;
        if (this.dom.rankingSubmit) this.dom.rankingSubmit.disabled = false;
        this.exitToExploration();
    }

    exitToExploration() {
        this.state = 'idle';
        if (this.dom.resultsScreen) this.dom.resultsScreen.classList.remove('visible');
        if (this.dom.evalScreen) this.dom.evalScreen.classList.remove('visible');
        if (this.dom.gameHud) this.dom.gameHud.classList.remove('visible');

        // Restore all dimmed planets
        this.restoreAllPlanets();

        // Restore exploration UI
        document.getElementById('view-mode-toggle').style.display = '';
        document.getElementById('connections-toggle').style.display = '';

        this.universe.setViewMode('global');
    }

    updateHUD() {
        if (this.dom.gameTimer) {
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = this.timeRemaining % 60;
            this.dom.gameTimer.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            if (this.timeRemaining <= 15) {
                this.dom.gameTimer.classList.add('warning');
            } else {
                this.dom.gameTimer.classList.remove('warning');
            }
        }
        if (this.dom.gameVisited) {
            this.dom.gameVisited.textContent = `Planetas: ${this.visitedPlanets.length}  ·  Ruta: ${this.routeVisits.length}`;
        }
        if (this.dom.scoreDisplay) {
            this.dom.scoreDisplay.textContent = `${this.runningScore} PTS`;
        }
    }

    updateWaypointLinePosition() {
        if (!this.waypointLine || !this.nextWaypoint) return;
        const targetPlanet = this.universe.getPlanetById(this.nextWaypoint.id);
        if (!targetPlanet) return;
        const camPos = this.universe.camera.position;
        const tp = targetPlanet.getWorldPosition();

        // Update main dashed line
        const positions = this.waypointLine.geometry.attributes.position;
        positions.setXYZ(0, camPos.x, camPos.y, camPos.z);
        positions.setXYZ(1, tp.x, tp.y, tp.z);
        positions.needsUpdate = true;
        this.waypointLine.computeLineDistances();

        // Pulse opacity on the main line
        const time = performance.now() * 0.001;
        const pulse = 0.4 + Math.sin(time * 3.0) * 0.2;
        this.waypointLine.material.opacity = pulse;

        // Update glow line
        if (this.waypointGlow) {
            const gp = this.waypointGlow.geometry.attributes.position;
            gp.setXYZ(0, camPos.x, camPos.y, camPos.z);
            gp.setXYZ(1, tp.x, tp.y, tp.z);
            gp.needsUpdate = true;
            this.waypointGlow.material.opacity = 0.12 + Math.sin(time * 3.0 + 1.0) * 0.08;
        }

        // Update beacon position + pulse scale
        if (this.waypointBeacon) {
            this.waypointBeacon.position.copy(tp);
            const beaconScale = 1.0 + Math.sin(time * 2.5) * 0.3;
            this.waypointBeacon.scale.setScalar(beaconScale);
            this.waypointBeacon.material.opacity = 0.1 + Math.sin(time * 2.5) * 0.08;
        }

        // Update 2D waypoint direction arrow
        this.updateWaypointArrow(tp);
    }

    updateWaypointArrow(targetWorldPos) {
        const arrow = this.dom.waypointArrow;
        if (!arrow) return;
        const camera = this.universe.camera;

        // Project target to screen space
        const projected = targetWorldPos.clone().project(camera);
        const sx = (projected.x * 0.5 + 0.5) * innerWidth;
        const sy = (-projected.y * 0.5 + 0.5) * innerHeight;

        // Check if target is behind camera
        const behind = projected.z > 1;
        const margin = 60;
        const onScreen = !behind && sx > margin && sx < innerWidth - margin && sy > margin && sy < innerHeight - margin;

        if (onScreen) {
            arrow.classList.remove('visible');
            return;
        }

        arrow.classList.add('visible');

        // Compute angle from screen center to target
        const cx = innerWidth / 2;
        const cy = innerHeight / 2;
        let dx = sx - cx;
        let dy = sy - cy;
        if (behind) { dx = -dx; dy = -dy; }
        const angle = Math.atan2(dy, dx);

        // Place arrow on screen edge
        const edgeMargin = 50;
        const maxX = innerWidth / 2 - edgeMargin;
        const maxY = innerHeight / 2 - edgeMargin;
        const scale = Math.min(maxX / Math.abs(Math.cos(angle) || 0.001), maxY / Math.abs(Math.sin(angle) || 0.001));
        const ax = cx + Math.cos(angle) * scale;
        const ay = cy + Math.sin(angle) * scale;

        arrow.style.left = ax + 'px';
        arrow.style.top = ay + 'px';
        arrow.style.transform = `translate(-50%, -50%) rotate(${angle - Math.PI / 2}rad)`;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}
