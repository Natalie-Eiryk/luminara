/**
 * 820.31.97-event-handlers.js - Centralized Event Handler System
 * @codon 820.31.97
 * @version 2026-04-02
 * @description CSP-compliant event delegation system replacing inline onclick handlers
 *
 * This module uses event delegation to handle all click events from a single
 * document-level listener, eliminating the need for 'unsafe-inline' in CSP.
 *
 * Usage: Add data-action="actionName" and optional data-* attributes to elements
 */

const EventHandlers = {
  /**
   * Action registry - maps action names to handler functions
   * Handler receives (element, event) and can access data-* attributes via element.dataset
   */
  actions: {
    // ═══════════════════════════════════════════════════════════════
    // NAVIGATION & MODE SWITCHING
    // ═══════════════════════════════════════════════════════════════

    'show-high-scores': () => {
      if (quiz?.renderer?.showHighScores) {
        quiz.renderer.showHighScores();
      }
    },

    'show-analytics': () => {
      if (quiz?.renderer?.showAnalyticsDashboard) {
        quiz.renderer.showAnalyticsDashboard();
      } else {
        console.warn('Quiz not loaded');
      }
    },

    'go-home': () => {
      if (typeof goHome === 'function') goHome();
    },

    'prev-question': () => {
      if (typeof prevQuestion === 'function') prevQuestion();
    },

    'next-question': () => {
      if (typeof nextQuestion === 'function') nextQuestion();
    },

    // ═══════════════════════════════════════════════════════════════
    // MAP MODE ACTIONS
    // ═══════════════════════════════════════════════════════════════

    'start-map-run': (el) => {
      const runType = el.dataset.runType || 'standard';
      if (quiz?.startMapRun) {
        quiz.startMapRun(runType);
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // PROGRESS MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    'export-progress': () => {
      if (typeof exportProgress === 'function') exportProgress();
    },

    'import-progress-click': () => {
      const fileInput = document.getElementById('importFile');
      if (fileInput) fileInput.click();
    },

    'reset-progress': () => {
      if (typeof confirmResetProgress === 'function') confirmResetProgress();
    },

    // ═══════════════════════════════════════════════════════════════
    // TEST PREP / GAUNTLET MODE
    // ═══════════════════════════════════════════════════════════════

    'select-mode': (el) => {
      const mode = el.dataset.mode;
      if (quiz?.selectMode && mode) {
        quiz.selectMode(mode);
      }
    },

    'start-gauntlet': (el) => {
      const topic = el.dataset.topic || null;
      if (quiz?.startTestPrepGauntlet) {
        quiz.startTestPrepGauntlet(topic);
      }
    },

    'exit-testprep': () => {
      if (quiz?.exitTestPrep) quiz.exitTestPrep();
    },

    // ═══════════════════════════════════════════════════════════════
    // LIFELINES / POWERUPS
    // ═══════════════════════════════════════════════════════════════

    'use-fifty-fifty': () => {
      if (quiz?.useFiftyFifty) quiz.useFiftyFifty();
    },

    'use-hint': () => {
      if (quiz?.useHint) quiz.useHint();
    },

    'use-extra-life': () => {
      if (quiz?.useExtraLife) quiz.useExtraLife();
    },

    // ═══════════════════════════════════════════════════════════════
    // DEV PANEL
    // ═══════════════════════════════════════════════════════════════

    'toggle-dev-panel': () => {
      if (typeof toggleDevPanel === 'function') toggleDevPanel();
    },

    'reload-page': () => {
      location.reload();
    },

    'reload-styles': () => {
      if (typeof reloadStyles === 'function') reloadStyles();
    },

    'reload-questions': () => {
      if (typeof reloadQuestions === 'function') reloadQuestions();
    },

    // ═══════════════════════════════════════════════════════════════
    // QUIZ MODES (Review, Blitz, Lightning, Jeopardy)
    // ═══════════════════════════════════════════════════════════════

    'answer-review': (el) => {
      const qid = el.dataset.qid;
      const optIndex = parseInt(el.dataset.optIndex, 10);
      if (typeof QuizModes !== 'undefined' && qid !== undefined) {
        QuizModes.answerReview(qid, optIndex);
      }
    },

    'rate-srs': (el) => {
      const qid = el.dataset.qid;
      const rating = parseInt(el.dataset.rating, 10);
      if (typeof QuizModes !== 'undefined' && qid !== undefined) {
        QuizModes.rateSrs(qid, rating);
      }
    },

    'answer-jeopardy': (el) => {
      const qid = el.dataset.qid;
      const opt = el.dataset.opt;
      if (typeof QuizModes !== 'undefined' && qid && opt !== undefined) {
        QuizModes.answerJeopardy(qid, opt);
      }
    },

    'answer-blitz': (el) => {
      const qid = el.dataset.qid;
      const optIndex = parseInt(el.dataset.optIndex, 10);
      if (typeof QuizModes !== 'undefined' && qid !== undefined) {
        QuizModes.answerBlitz(qid, optIndex);
      }
    },

    'answer-lightning': (el) => {
      const qid = el.dataset.qid;
      const optIndex = parseInt(el.dataset.optIndex, 10);
      if (typeof QuizModes !== 'undefined' && qid !== undefined) {
        QuizModes.answerLightning(qid, optIndex);
      }
    }
  },

  /**
   * Initialize the event delegation system
   * Call this once on DOMContentLoaded or window.load
   */
  init() {
    // Delegate all clicks to document
    document.addEventListener('click', (event) => {
      // Find the closest element with data-action attribute
      const actionEl = event.target.closest('[data-action]');
      if (!actionEl) return;

      const actionName = actionEl.dataset.action;
      const handler = this.actions[actionName];

      if (handler) {
        event.preventDefault();
        try {
          handler(actionEl, event);
        } catch (err) {
          console.error(`[EventHandlers] Action "${actionName}" failed:`, err);
        }
      } else {
        console.warn(`[EventHandlers] Unknown action: ${actionName}`);
      }
    });

    // Handle file input change (special case - not click)
    const importFile = document.getElementById('importFile');
    if (importFile) {
      importFile.addEventListener('change', function() {
        if (typeof importProgress === 'function') {
          importProgress(this);
        }
      });
    }

    // Handle color picker changes for dev panel
    const devBgColor = document.getElementById('devBgColor');
    const devGlowColor = document.getElementById('devGlowColor');

    if (devBgColor) {
      devBgColor.addEventListener('change', function() {
        if (typeof updateCSSVar === 'function') {
          updateCSSVar('--bg-deep', this.value);
        }
      });
    }

    if (devGlowColor) {
      devGlowColor.addEventListener('change', function() {
        if (typeof updateCSSVar === 'function') {
          updateCSSVar('--glow-warm', this.value);
        }
      });
    }

    console.log('[EventHandlers] Initialized with', Object.keys(this.actions).length, 'actions');
  },

  /**
   * Register a new action handler
   * @param {string} name - Action name (used in data-action attribute)
   * @param {Function} handler - Function receiving (element, event)
   */
  register(name, handler) {
    if (this.actions[name]) {
      console.warn(`[EventHandlers] Overwriting existing action: ${name}`);
    }
    this.actions[name] = handler;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => EventHandlers.init());
} else {
  EventHandlers.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventHandlers;
}
