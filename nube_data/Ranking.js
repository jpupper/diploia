import { CONFIG } from './config.js';

// ═══════════════════════════════════════════════
//  CLASS: Ranking — Leaderboard system
// ═══════════════════════════════════════════════

export class Ranking {
    constructor() {
        this.storageKey = 'nube_universos_ranking';
        this.playerName = '';
        this.finalScore = 0;
        this.dom = {};
    }

    bindUI() {
        this.dom.rankingScreen = document.getElementById('ranking-screen');
        this.dom.rankingNameInput = document.getElementById('ranking-name-input');
        this.dom.rankingSubmit = document.getElementById('ranking-submit');
        this.dom.rankingList = document.getElementById('ranking-list');
        this.dom.rankingClose = document.getElementById('ranking-close');

        if (this.dom.rankingSubmit) {
            this.dom.rankingSubmit.addEventListener('click', () => this.submitRanking());
        }
        if (this.dom.rankingClose) {
            this.dom.rankingClose.addEventListener('click', () => {
                if (this.onClose) this.onClose();
            });
        }
    }

    show(score) {
        this.finalScore = score;
        this.playerName = '';
        if (this.dom.rankingScreen) this.dom.rankingScreen.classList.add('visible');
        if (this.dom.rankingNameInput) {
            this.dom.rankingNameInput.value = '';
            this.dom.rankingNameInput.disabled = false;
        }
        if (this.dom.rankingSubmit) this.dom.rankingSubmit.disabled = false;
        this.renderList();
    }

    hide() {
        if (this.dom.rankingScreen) this.dom.rankingScreen.classList.remove('visible');
        if (this.dom.rankingNameInput) this.dom.rankingNameInput.disabled = false;
        if (this.dom.rankingSubmit) this.dom.rankingSubmit.disabled = false;
    }

    submitRanking() {
        const name = (this.dom.rankingNameInput?.value || '').trim();
        if (!name) return;
        this.playerName = name;
        this.saveToLeaderboard(name, this.finalScore);
        this.renderList();
        if (this.dom.rankingNameInput) this.dom.rankingNameInput.disabled = true;
        if (this.dom.rankingSubmit) this.dom.rankingSubmit.disabled = true;
    }

    saveToLeaderboard(name, score) {
        let rankings = [];
        try { rankings = JSON.parse(localStorage.getItem(this.storageKey)) || []; } catch(e) { rankings = []; }
        rankings.push({ name, score, date: new Date().toISOString().split('T')[0] });
        rankings.sort((a, b) => b.score - a.score);
        rankings = rankings.slice(0, 20);
        localStorage.setItem(this.storageKey, JSON.stringify(rankings));
    }

    getLeaderboard() {
        try { return JSON.parse(localStorage.getItem(this.storageKey)) || []; } catch(e) { return []; }
    }

    renderList() {
        if (!this.dom.rankingList) return;
        const rankings = this.getLeaderboard();
        if (rankings.length === 0) {
            this.dom.rankingList.innerHTML = '<div class="ranking-empty">No hay puntajes todav\u00eda</div>';
            return;
        }
        let html = '';
        rankings.forEach((entry, i) => {
            const isMe = entry.name === this.playerName && entry.score === this.finalScore;
            const medal = i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : `${i + 1}.`;
            html += `<div class="ranking-row${isMe ? ' ranking-highlight' : ''}">`;
            html += `<span class="ranking-pos">${medal}</span>`;
            html += `<span class="ranking-name">${entry.name}</span>`;
            html += `<span class="ranking-score">${entry.score}</span>`;
            html += `</div>`;
        });
        this.dom.rankingList.innerHTML = html;
    }
}
