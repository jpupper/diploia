import * as THREE from 'three';
import { CONFIG } from './config.js';

const CFG = CONFIG;

// ═══════════════════════════════════════════════
//  CLASS: Planet (represents any node: sun, nucleus, tool)
// ═══════════════════════════════════════════════
export class Planet {
    constructor(mesh, node, category = null) {
        this.mesh = mesh;
        this.node = node;
        this.category = category;
        this.isActive = false;
        this._origEmissive = mesh.material ? mesh.material.emissiveIntensity : 0;
        this._origScale = mesh.scale.clone();
        this.type = node.type || 'tool';
        // Energy field meshes (created on activate)
        this._energyFieldInner = null;
        this._energyFieldOuter = null;
    }

    get id() { return this.node.id; }
    get label() { return this.node.label || this.node.id; }

    _getColor() {
        const CAT_COLORS = CFG.categoryColors;
        if (this.category) return new THREE.Color(CAT_COLORS[this.category] || 0x00ffff);
        if (this.type === 'category') return new THREE.Color(CAT_COLORS[this.id] || 0x00ffff);
        if (this.id === 'root') return new THREE.Color(CFG.sun.color);
        return new THREE.Color(0x00ffff);
    }

    _createEnergyField() {
        this._removeEnergyField();
        const E = CFG.energyField;
        const pRadius = this.mesh.geometry?.parameters?.radius || 30;
        const color = E.color ? new THREE.Color(E.color) : this._getColor();

        // Inner rotating shell
        const innerGeo = new THREE.IcosahedronGeometry(pRadius * E.innerRadius, 1);
        const innerMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: E.innerOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            wireframe: true,
        });
        this._energyFieldInner = new THREE.Mesh(innerGeo, innerMat);
        this.mesh.add(this._energyFieldInner);

        // Outer pulsing shell
        const outerGeo = new THREE.IcosahedronGeometry(pRadius * E.outerRadius, 0);
        const outerMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: E.outerOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.BackSide,
        });
        this._energyFieldOuter = new THREE.Mesh(outerGeo, outerMat);
        this.mesh.add(this._energyFieldOuter);
    }

    _removeEnergyField() {
        if (this._energyFieldInner) {
            this.mesh.remove(this._energyFieldInner);
            this._energyFieldInner.geometry.dispose();
            this._energyFieldInner.material.dispose();
            this._energyFieldInner = null;
        }
        if (this._energyFieldOuter) {
            this.mesh.remove(this._energyFieldOuter);
            this._energyFieldOuter.geometry.dispose();
            this._energyFieldOuter.material.dispose();
            this._energyFieldOuter = null;
        }
    }

    updateEnergyField(time) {
        if (!this._energyFieldInner || !this._energyFieldOuter) return;
        const E = CFG.energyField;
        // Rotate inner wireframe shell
        this._energyFieldInner.rotation.y = time * E.rotationSpeed;
        this._energyFieldInner.rotation.x = time * E.rotationSpeed * 0.7;
        // Pulse inner opacity
        const pulse = Math.sin(time * E.pulseSpeed) * E.pulseAmplitude;
        this._energyFieldInner.material.opacity = E.innerOpacity + pulse * 0.5;
        // Pulse outer scale and opacity
        const outerPulse = Math.sin(time * E.pulseSpeed * 0.8 + 1.0);
        const scaleF = 1.0 + outerPulse * 0.08;
        this._energyFieldOuter.scale.setScalar(scaleF);
        this._energyFieldOuter.material.opacity = E.outerOpacity + outerPulse * E.pulseAmplitude * 0.3;
        // Rotate outer shell in opposite direction
        this._energyFieldOuter.rotation.y = -time * E.rotationSpeed * 0.5;
        this._energyFieldOuter.rotation.z = time * E.rotationSpeed * 0.3;
    }

    activate() {
        this.isActive = true;
        if (this.mesh.material) {
            this.mesh.material.emissiveIntensity = CFG.selection.emissiveIntensity;
        }
        this.mesh.scale.copy(this._origScale).multiplyScalar(CFG.selection.scaleFactor);
        this._createEnergyField();
    }

    deactivate() {
        this.isActive = false;
        if (this.mesh.material) {
            this.mesh.material.emissiveIntensity = this._origEmissive;
        }
        this.mesh.scale.copy(this._origScale);
        this._removeEnergyField();
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
