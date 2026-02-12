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
