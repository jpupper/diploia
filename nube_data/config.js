// ═══════════════════════════════════════════════════════════════
//  CONFIG — All configurable variables for Nube de Universos
//  Edit this file to tweak the experience without touching logic.
// ═══════════════════════════════════════════════════════════════

export const CONFIG = {

    // ── Data ──────────────────────────────────────────────────
    dataUrl: 'mapa_herramientas_data.json',

    // ── Category Colors (hex) ────────────────────────────────
    categoryColors: {
        engines:              0xff6b35,
        frameworks:           0x00d4ff,
        ia:                   0xb44dff,
        shaders:              0x00ff88,
        db:                   0xffd700,
        ides:                 0xff4d8b,
        languages:            0x00c9a7,
        llm:                  0xe864ff,
        frontend:             0x4d94ff,
        os:                   0x8bff4d,
        soportes:             0xff9f43,
        protocolos:           0x54e0ff,
        'software-multimedia': 0xff6688,
        entornos:             0x88cc44,
        glosario:             0xccaa88,
    },

    // ── Sun (central node) ───────────────────────────────────
    sun: {
        radius:            50,
        color:             0xffcc44,
        emissiveColor:     0xffaa00,
        emissiveIntensity: 1.0,
        glowInnerRadius:   65,
        glowOuterRadius:   100,
        lightIntensity:    3,
        lightRange:        5000,
        labelFontSize:     18,
    },

    // ── Category Nucleus (category sphere) ───────────────────
    nucleus: {
        radius:            28,
        emissiveIntensity: 0.6,
        glowInnerRadius:   36,
        glowOuterRadius:   55,
        lightIntensity:    1.5,
        lightRange:        600,
        labelFontSize:     16,
        labelOffsetY:      45,
    },

    // ── Planets (tool nodes) ─────────────────────────────────
    planet: {
        radius:            8,
        emissiveIntensity: 0.35,
        glowRadius:        12,
        labelFontSize:     12,
        labelOffsetY:      14,
        colorLerpToWhite:  0.3,     // how much to lighten planet color
    },

    // ── Orbits ───────────────────────────────────────────────
    orbit: {
        baseRadius:        90,      // minimum orbit radius
        radiusStep:        50,      // extra radius per layer (ci % 3)
        radiusRandom:      20,      // random jitter added to radius
        speedMin:          0.15,    // minimum orbit angular speed
        speedRandom:       0.25,    // random extra speed
        tiltRange:         0.5,     // max tilt deviation (±half)
        verticalFactor:    0.25,    // vertical amplitude as fraction of radius
        ringInner:         88,
        ringOuter:         90,
    },

    // ── Universe Layout ──────────────────────────────────────
    layout: {
        ringRadius:        1800,    // distance of categories from sun
    },

    // ── Starfield ────────────────────────────────────────────
    stars: {
        count:             8000,
        minDistance:        5000,
        maxDistance:        25000,
        baseSize:          2,
        sizeMin:           0.5,
        sizeRandom:        2.5,
        twinkleSpeedMin:   0.5,
        twinkleSpeedRandom: 3.0,
        opacity:           0.7,
    },

    // ── Camera / Orbit View ──────────────────────────────────
    camera: {
        fov:               60,
        near:              1,
        far:               50000,
        initialPosition:   { x: 0, y: 200, z: 3000 },
        // Global home position — camera always returns here (0,0 = center)
        homePosition:      { x: 0, y: 0 },
        transitionSpeed:   0.04,
        zoomMin:           0.3,
        zoomMax:           4,
        zoomStep:          0.25,
        orbitDamping:      0.06,
        orbitRotateSpeed:  0.5,
        orbitMinDistance:   30,
        orbitMaxDistance:   8000,
        // Distance multiplier when navigating to a category
        navDistMultiplier: 350,
        navOffsetX:        0.6,
        navOffsetY:        0.35,
        navOffsetZ:        0.7,
    },

    // ── Camera Follow (CAMARA mode) ──────────────────────────
    follow: {
        distance:          60,      // distance from planet
        heightOffset:      20,      // height above planet
        yawSpeed:          1.5,     // yaw rotation speed (rad/s)
        pitchSpeed:        1.0,     // pitch rotation speed (rad/s)
        pitchMin:          -1.2,    // min pitch (radians, looking down)
        pitchMax:          1.2,     // max pitch (radians, looking up)
        lerpSpeed:         0.08,    // how fast camera catches up to planet
        mouseSensitivity:  0.003,   // mouse look sensitivity
    },

    // ── Spaceship (NAVE mode) ────────────────────────────────
    ship: {
        maxSpeed:          3000,
        acceleration:      1000,
        drag:              0.97,
        turnSpeed:         2.0,
        boostMultiplier:   2,
        throttleAccelRate: 2,       // how fast throttle ramps up
        throttleBrakeRate: 3,       // how fast throttle ramps down
        throttleDecay:     0.95,    // passive throttle decay
        mouseSensitivity:  0.002,
        pitchMin:          -Math.PI / 2 + 0.1,
        pitchMax:          Math.PI / 2 - 0.1,
    },

    // ── Selection Visual ─────────────────────────────────────
    selection: {
        emissiveIntensity: 1.5,
        scaleFactor:       1.3,
        hoverEmissive:     1.0,
        hoverScale:        1.15,
        hoverSelectedEmissive: 1.6,
        hoverSelectedScale: 1.35,
    },

    // ── Scene ────────────────────────────────────────────────
    scene: {
        fogColor:          0x06060e,
        fogDensity:        0.00015,
        ambientColor:      0x111122,
        ambientIntensity:  0.5,
        toneExposure:      1.2,
    },

    // ── Connection Lines ─────────────────────────────────────
    connections: {
        primaryOpacity:        0.18,
        primaryActiveOpacity:  0.35,
        primaryDimOpacity:     0.06,
        secondaryOpacity:      0.04,
        secondaryActiveOpacity: 0.12,
        secondaryDimOpacity:   0.02,
        secondaryColor:        0x4488cc,
        sunLineOpacity:        0.08,
        // Active planet connection glow
        activeGlowOpacity:     0.85,
        activeGlowColor:       0x00ffff,
        activeLineWidth:       3,
    },

    // ── Reverse Force ──────────────────────────────────────────
    // The "reverse force" is the drag coefficient (ship.drag).
    // Each frame: velocity *= drag (0.97 = 3% speed loss per frame).
    // At 60fps with drag=0.97: effective deceleration ~= 1 - 0.97^60 ≈ 84% per second.
    // Lower drag = stronger braking. Higher drag = more drift/inertia.
    // Combined with throttleDecay (0.95), the ship slows when not accelerating.
    // maxSpeed caps the absolute velocity magnitude.
    // acceleration determines how fast the ship gains speed per second.
    // So: net_force = (throttle * acceleration) - (velocity * (1 - drag))
    // The "reverse" feeling comes from drag eating velocity every frame.
};
