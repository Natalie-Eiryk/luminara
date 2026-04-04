/**
 * 820.31.98.1-pedagogical-modes.js - Pedagogical Mode Manager
 * @codon 820.31.98.1
 * @version 2026-04-03
 * @description Manages Study Mode vs Adventure Mode pedagogical switching
 * @lifecycle PROMOTED
 * @session-created 68
 *
 * Extends QuizModes with pedagogical mode functionality:
 * - Study Mode: Deep learning, serif fonts, calm colors, auto-expanded content
 * - Adventure Mode: Gamified, compact, vibrant colors, on-demand explanations
 */

const PedagogicalModes = {
  // State
  currentPedagogicalMode: 'adventure', // 'study' or 'adventure'

  // ==================== INIT ====================
  init() {
    this.loadPedagogicalMode();
    this.applyBodyClass();
    console.log('[PedagogicalModes] Initialized in', this.currentPedagogicalMode, 'mode');
  },

  // ==================== STATE MANAGEMENT ====================
  loadPedagogicalMode() {
    try {
      const saved = localStorage.getItem('luminara_pedagogical_mode');
      if (saved && (saved === 'study' || saved === 'adventure')) {
        this.currentPedagogicalMode = saved;
      }
    } catch (e) {
      console.warn('[PedagogicalModes] Failed to load mode:', e);
      this.currentPedagogicalMode = 'adventure';
    }
  },

  savePedagogicalMode() {
    try {
      localStorage.setItem('luminara_pedagogical_mode', this.currentPedagogicalMode);
      console.log('[PedagogicalModes] Saved mode:', this.currentPedagogicalMode);
    } catch (e) {
      console.error('[PedagogicalModes] Failed to save mode:', e);
    }
  },

  getPedagogicalMode() {
    return this.currentPedagogicalMode;
  },

  setPedagogicalMode(mode) {
    if (mode !== 'study' && mode !== 'adventure') {
      console.error('[PedagogicalModes] Invalid mode:', mode);
      return;
    }

    this.currentPedagogicalMode = mode;
    this.savePedagogicalMode();
    this.applyBodyClass();

    console.log('[PedagogicalModes] Switched to', mode, 'mode');
  },

  // ==================== MODE SWITCHER ====================
  togglePedagogicalMode() {
    const newMode = this.currentPedagogicalMode === 'study' ? 'adventure' : 'study';
    this.setPedagogicalMode(newMode);
    this.reloadQuestions();
  },

  applyBodyClass() {
    document.body.classList.remove('study-mode-active', 'adventure-mode-active');
    document.body.classList.add(`${this.currentPedagogicalMode}-mode-active`);
  },

  // ==================== MODE SELECTOR UI ====================
  showModeSelector() {
    const overlay = document.getElementById('pedagogical-mode-selector');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  },

  hideModeSelector() {
    const overlay = document.getElementById('pedagogical-mode-selector');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  },

  selectMode(mode) {
    this.setPedagogicalMode(mode);
    this.hideModeSelector();

    // Trigger quiz start if needed
    if (typeof quiz !== 'undefined' && quiz && quiz.renderer) {
      quiz.renderer.renderQuestions();
    }
  },

  // ==================== RENDER HELPERS ====================
  getCardModeClass() {
    return this.currentPedagogicalMode === 'study' ? 'study-mode' : 'adventure-mode';
  },

  shouldAutoExpandExplanations() {
    return this.currentPedagogicalMode === 'study';
  },

  shouldShowTimers() {
    return this.currentPedagogicalMode !== 'study';
  },

  shouldShowGameElements() {
    return this.currentPedagogicalMode === 'adventure';
  },

  // ==================== IN-SESSION TOGGLE ====================
  renderModeToggleButton() {
    const currentMode = this.currentPedagogicalMode;
    const targetMode = currentMode === 'study' ? 'adventure' : 'study';
    const icon = currentMode === 'study' ? '🎮' : '📖';
    const label = `Switch to ${targetMode.charAt(0).toUpperCase() + targetMode.slice(1)} Mode`;

    return `
      <button class="mode-toggle-btn" id="pedagogicalModeToggle">
        <span class="mode-toggle-icon">${icon}</span>
        <span>${label}</span>
      </button>
    `;
  },

  attachToggleButtonHandler() {
    const btn = document.getElementById('pedagogicalModeToggle');
    if (btn) {
      btn.addEventListener('click', () => this.togglePedagogicalMode());
    }
  },

  // ==================== "EXPLAIN DEEPER" BUTTON ====================
  renderExplainDeeperButton(qid) {
    if (this.currentPedagogicalMode === 'study') {
      return ''; // Not needed in Study Mode (auto-expanded)
    }

    return `
      <button class="explain-deeper-btn" data-action="explain-deeper" data-qid="${qid}">
        <span class="explain-deeper-icon">🔬</span>
        <span>Explain Deeper</span>
      </button>
    `;
  },

  toggleExplainDeeper(qid) {
    const btn = document.querySelector(`[data-action="explain-deeper"][data-qid="${qid}"]`);
    const optionBreakdown = document.querySelector(`#option-breakdown-${qid}`);
    const mechanism = document.querySelector(`#mechanism-${qid}`);

    if (!btn) return;

    const isExpanded = btn.classList.contains('expanded');

    if (isExpanded) {
      // Collapse
      btn.classList.remove('expanded');
      btn.innerHTML = `
        <span class="explain-deeper-icon">🔬</span>
        <span>Explain Deeper</span>
      `;

      if (optionBreakdown) optionBreakdown.classList.remove('show');
      if (mechanism) mechanism.classList.remove('show');
    } else {
      // Expand
      btn.classList.add('expanded');
      btn.innerHTML = `
        <span class="explain-deeper-icon">🔬</span>
        <span>Collapse</span>
      `;

      if (optionBreakdown) optionBreakdown.classList.add('show');
      if (mechanism) mechanism.classList.add('show');
    }
  },

  attachExplainDeeperHandlers() {
    document.querySelectorAll('[data-action="explain-deeper"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qid = e.currentTarget.dataset.qid;
        this.toggleExplainDeeper(qid);
      });
    });
  },

  // ==================== QUESTION CARD ENHANCEMENT ====================
  enhanceQuestionCard(cardHTML, qid) {
    // Add mode class to question card
    const modeClass = this.getCardModeClass();
    cardHTML = cardHTML.replace('class="question-card"', `class="question-card ${modeClass}"`);

    // In Study Mode: auto-expand all content
    if (this.currentPedagogicalMode === 'study') {
      cardHTML = cardHTML.replace(/class="layer-explain"/g, 'class="layer-explain show"');
      cardHTML = cardHTML.replace(/class="option-breakdown"/g, 'class="option-breakdown show"');
      cardHTML = cardHTML.replace(/class="mechanism"/g, 'class="mechanism show"');
    }

    // In Adventure Mode: add "Explain Deeper" button
    if (this.currentPedagogicalMode === 'adventure') {
      const explainDeeperBtn = this.renderExplainDeeperButton(qid);
      // Insert before closing </div> of question card
      const insertPos = cardHTML.lastIndexOf('</div>');
      cardHTML = cardHTML.slice(0, insertPos) + explainDeeperBtn + cardHTML.slice(insertPos);
    }

    return cardHTML;
  },

  // ==================== RELOAD QUESTIONS ====================
  reloadQuestions() {
    // Trigger re-render if quiz system is available
    if (typeof quiz !== 'undefined' && quiz && quiz.renderer) {
      console.log('[PedagogicalModes] Reloading questions in', this.currentPedagogicalMode, 'mode');
      quiz.renderer.renderQuestions();
    }
  }
};

// ==================== MODE SELECTOR HTML TEMPLATE ====================
const pedagogicalModeSelectorHTML = `
  <div class="mode-selector-overlay hidden" id="pedagogical-mode-selector">
    <div class="mode-selector-title">How do you want to learn today?</div>
    <div class="mode-selector-subtitle">Choose your study style</div>

    <div class="mode-selector-grid">
      <!-- Study Mode Card -->
      <div class="mode-selector-card study-mode-card" data-action="select-pedagogical-mode" data-mode="study">
        <div class="mode-selector-icon">📖</div>
        <div class="mode-selector-name">Study Mode</div>
        <div class="mode-selector-description">
          Deep learning with rich explanations. Every detail is shown by default,
          perfect for understanding complex mechanisms.
        </div>
        <div class="mode-selector-features">
          <span class="mode-selector-feature">Auto-expanded content</span>
          <span class="mode-selector-feature">Serif fonts</span>
          <span class="mode-selector-feature">Calm colors</span>
          <span class="mode-selector-feature">Focus mode</span>
        </div>
      </div>

      <!-- Adventure Mode Card -->
      <div class="mode-selector-card adventure-mode-card" data-action="select-pedagogical-mode" data-mode="adventure">
        <div class="mode-selector-icon">🎮</div>
        <div class="mode-selector-name">Adventure Mode</div>
        <div class="mode-selector-description">
          Gamified learning with on-demand explanations. Fast-paced,
          compact interface with XP, streaks, and achievements.
        </div>
        <div class="mode-selector-features">
          <span class="mode-selector-feature">XP & streaks</span>
          <span class="mode-selector-feature">Compact UI</span>
          <span class="mode-selector-feature">On-demand details</span>
          <span class="mode-selector-feature">Badges & rewards</span>
        </div>
      </div>
    </div>
  </div>
`;

// ==================== AUTO-INIT ====================
// Initialize pedagogical modes when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PedagogicalModes.init();

    // Inject mode selector overlay into body
    document.body.insertAdjacentHTML('beforeend', pedagogicalModeSelectorHTML);

    // Attach event handlers
    document.querySelectorAll('[data-action="select-pedagogical-mode"]').forEach(card => {
      card.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        PedagogicalModes.selectMode(mode);
      });
    });
  });
} else {
  PedagogicalModes.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PedagogicalModes;
}
