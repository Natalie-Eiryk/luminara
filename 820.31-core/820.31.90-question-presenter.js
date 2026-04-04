/**
 * Question Presenter Module
 * @file 820.31.90-question-presenter.js
 * @version 2026-04-03
 *
 * A dedicated module for presenting questions with visual polish.
 * Renders questions as illuminated manuscript scrolls with:
 * - Parchment texture backgrounds
 * - Wax seal answer buttons
 * - Ink flourishes and decorative borders
 * - Smooth animations
 *
 * Design Philosophy:
 * - Self-contained: All styles inline, no external CSS dependencies
 * - Reliable: Simple DOM structure that won't conflict with other systems
 * - Beautiful: Brings back the manuscript aesthetic from the map
 * - CSP Compliant: NO inline onclick handlers - uses addEventListener pattern
 */

const QuestionPresenter = (function() {
  'use strict';

  // Color palette - medieval manuscript theme
  const COLORS = {
    parchment: {
      light: '#f4e4bc',
      medium: '#e8d4a8',
      dark: '#d4c4a0',
      border: '#8b5a2b'
    },
    ink: {
      black: '#2c1810',
      brown: '#4a3728',
      red: '#8b2500',
      gold: '#c9a227'
    },
    wax: {
      red: '#c41e3a',
      blue: '#1e4d8c',
      green: '#2d5a27',
      gold: '#b8860b'
    },
    answer: {
      A: '#c41e3a', // Red wax
      B: '#1e4d8c', // Blue wax
      C: '#2d5a27', // Green wax
      D: '#b8860b'  // Gold wax
    }
  };

  // Container element
  let container = null;
  let currentQuestion = null;
  let onAnswerCallback = null;
  let onBackCallback = null;
  let onFleeCallback = null;

  /**
   * Sanitize text for safe HTML insertion (Fix #5)
   * Uses QuizSanitize if available, otherwise inline implementation
   */
  function sanitizeText(text) {
    if (!text || typeof text !== 'string') return text || '';
    if (typeof QuizSanitize !== 'undefined' && QuizSanitize.questionText) {
      return QuizSanitize.questionText(text);
    }
    // Fallback: basic HTML entity escape
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Initialize the presenter
   */
  function init() {
    // Create or get container
    container = document.getElementById('question-presenter');
    if (!container) {
      container = document.createElement('div');
      container.id = 'question-presenter';
      document.body.appendChild(container);
    }
    return QuestionPresenter;
  }

  /**
   * Generate CSS for the scroll
   */
  function getScrollStyles() {
    return `
      .qp-scroll-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
      }

      /* The main scroll/parchment */
      .qp-scroll {
        position: relative;
        width: 100%;
        max-width: 700px;
        background: linear-gradient(135deg, ${COLORS.parchment.light} 0%, ${COLORS.parchment.medium} 50%, ${COLORS.parchment.dark} 100%);
        border: 4px solid ${COLORS.parchment.border};
        border-radius: 4px;
        padding: 40px 50px;
        box-shadow:
          0 10px 40px rgba(0,0,0,0.5),
          inset 0 0 30px rgba(139,90,43,0.2),
          inset 0 0 60px rgba(139,90,43,0.1);
        animation: qp-unfurl 0.4s ease-out;
      }

      @keyframes qp-unfurl {
        from {
          transform: scaleY(0.1) rotateX(60deg);
          opacity: 0;
        }
        to {
          transform: scaleY(1) rotateX(0);
          opacity: 1;
        }
      }

      /* Scroll roll ends (top and bottom) */
      .qp-scroll::before,
      .qp-scroll::after {
        content: '';
        position: absolute;
        left: -8px;
        right: -8px;
        height: 20px;
        background: linear-gradient(90deg,
          ${COLORS.parchment.border} 0%,
          #a67c52 20%,
          #c4956a 50%,
          #a67c52 80%,
          ${COLORS.parchment.border} 100%
        );
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }

      .qp-scroll::before {
        top: -12px;
      }

      .qp-scroll::after {
        bottom: -12px;
      }

      /* Round badge/seal at top */
      .qp-round-badge {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 60px;
        background: radial-gradient(circle at 30% 30%, #c41e3a 0%, #8b0000 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${COLORS.ink.gold};
        font-size: 24px;
        font-weight: bold;
        box-shadow:
          0 4px 12px rgba(0,0,0,0.4),
          inset 0 2px 4px rgba(255,255,255,0.2);
        z-index: 10;
        border: 3px solid ${COLORS.ink.gold};
      }

      /* Question header */
      .qp-header {
        text-align: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid ${COLORS.parchment.border};
      }

      .qp-category {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: ${COLORS.ink.brown};
        margin-bottom: 5px;
      }

      .qp-round {
        font-size: 14px;
        color: ${COLORS.ink.red};
        font-weight: bold;
      }

      /* Question text */
      .qp-question-text {
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 20px;
        line-height: 1.6;
        color: ${COLORS.ink.black};
        text-align: center;
        margin-bottom: 30px;
        padding: 0 10px;
      }

      /* Decorative divider */
      .qp-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 20px 0;
        color: ${COLORS.ink.brown};
        font-size: 20px;
        opacity: 0.6;
      }

      .qp-divider::before,
      .qp-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, ${COLORS.parchment.border}, transparent);
        margin: 0 15px;
      }

      /* Answer options container */
      .qp-answers {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Individual answer button */
      .qp-answer {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 16px 20px;
        background: linear-gradient(135deg, ${COLORS.parchment.light} 0%, #fff8e7 50%, ${COLORS.parchment.light} 100%);
        border: 2px solid ${COLORS.parchment.border};
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 16px;
        color: ${COLORS.ink.black};
        text-align: left;
        position: relative;
        overflow: hidden;
      }

      .qp-answer:hover {
        transform: translateX(8px);
        box-shadow: 0 4px 12px rgba(139,90,43,0.3);
        border-color: ${COLORS.ink.gold};
      }

      .qp-answer:active {
        transform: translateX(4px) scale(0.98);
      }

      /* Wax seal letter badge */
      .qp-seal {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        color: white;
        flex-shrink: 0;
        box-shadow:
          0 2px 6px rgba(0,0,0,0.3),
          inset 0 1px 2px rgba(255,255,255,0.3);
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }

      .qp-seal-A { background: radial-gradient(circle at 30% 30%, #ef5350 0%, ${COLORS.answer.A} 100%); }
      .qp-seal-B { background: radial-gradient(circle at 30% 30%, #5c8dd6 0%, ${COLORS.answer.B} 100%); }
      .qp-seal-C { background: radial-gradient(circle at 30% 30%, #5cb85c 0%, ${COLORS.answer.C} 100%); }
      .qp-seal-D { background: radial-gradient(circle at 30% 30%, #d4a84b 0%, ${COLORS.answer.D} 100%); }

      /* Answer text */
      .qp-answer-text {
        flex: 1;
      }

      /* Keyboard hint */
      .qp-key-hint {
        font-size: 11px;
        color: ${COLORS.ink.brown};
        opacity: 0.6;
        margin-left: auto;
        padding: 2px 8px;
        background: rgba(139,90,43,0.1);
        border-radius: 4px;
      }

      /* Feedback states */
      .qp-answer.correct {
        background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
        border-color: #4caf50;
        animation: qp-correct-pulse 0.5s ease;
      }

      .qp-answer.wrong {
        background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
        border-color: #f44336;
        animation: qp-wrong-shake 0.4s ease;
      }

      @keyframes qp-correct-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }

      @keyframes qp-wrong-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }

      /* Status bar at bottom */
      .qp-status-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
        padding: 15px 25px;
        background: rgba(0,0,0,0.4);
        border-radius: 10px;
        color: white;
        font-size: 14px;
      }

      .qp-stat {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .qp-stat-icon {
        font-size: 20px;
      }

      .qp-hp-bar {
        width: 120px;
        height: 14px;
        background: #333;
        border-radius: 7px;
        overflow: hidden;
      }

      .qp-hp-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #16a34a);
        transition: width 0.3s ease;
      }

      .qp-hp-fill.low {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .qp-hp-fill.critical {
        background: linear-gradient(90deg, #ef4444, #dc2626);
        animation: qp-hp-pulse 0.5s ease infinite;
      }

      @keyframes qp-hp-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      /* Navigation buttons */
      .qp-nav-bar {
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 100;
      }

      .qp-nav-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: rgba(0,0,0,0.6);
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 25px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(4px);
      }

      .qp-nav-btn:hover {
        background: rgba(0,0,0,0.8);
        border-color: rgba(255,255,255,0.4);
        transform: scale(1.05);
      }

      .qp-nav-btn:active {
        transform: scale(0.98);
      }

      .qp-nav-btn.back {
        background: rgba(139,90,43,0.8);
        border-color: ${COLORS.parchment.border};
      }

      .qp-nav-btn.back:hover {
        background: rgba(139,90,43,1);
      }

      .qp-nav-btn.help {
        background: rgba(218,165,32,0.7);
        border-color: rgba(255,215,0,0.3);
      }

      .qp-nav-btn.help:hover {
        background: rgba(218,165,32,0.9);
        border-color: rgba(255,215,0,0.5);
      }

      .qp-nav-btn.flee {
        background: rgba(180,50,50,0.7);
        border-color: rgba(255,100,100,0.3);
      }

      .qp-nav-btn.flee:hover {
        background: rgba(200,50,50,0.9);
        border-color: rgba(255,100,100,0.5);
      }

      .qp-nav-icon {
        font-size: 18px;
      }

      /* Mobile responsive */
      @media (max-width: 600px) {
        .qp-scroll {
          padding: 30px 25px;
          margin: 10px;
        }

        .qp-question-text {
          font-size: 17px;
        }

        .qp-answer {
          padding: 14px 16px;
          font-size: 15px;
        }

        .qp-seal {
          width: 36px;
          height: 36px;
          font-size: 16px;
        }

        .qp-status-bar {
          flex-wrap: wrap;
          gap: 15px;
        }

        .qp-nav-btn {
          padding: 8px 14px;
          font-size: 13px;
        }

        .qp-nav-btn span:not(.qp-nav-icon) {
          display: none;
        }
      }
    `;
  }

  /**
   * Present a question with full styling
   * @param {Object} options
   * @param {Object} options.question - Question object with q, options, answer
   * @param {string} options.category - Category name to display
   * @param {number} options.round - Round number
   * @param {Object} options.playerStats - {hp, maxHp, damage}
   * @param {Object} options.monsterStats - {name, hp, maxHp, icon}
   * @param {Function} options.onAnswer - Callback when answer selected
   * @param {Function} options.onBack - Callback when back/map button clicked
   * @param {Function} options.onFlee - Callback when flee button clicked
   */
  function present(options) {
    const {
      question,
      category = '',
      round = 1,
      playerStats = { hp: 100, maxHp: 100, damage: '1d20' },
      monsterStats = null,
      onAnswer,
      onBack = null,
      onFlee = null
    } = options;

    if (!container) init();

    currentQuestion = question;
    onAnswerCallback = onAnswer;
    onBackCallback = onBack;
    onFleeCallback = onFlee;

    const letters = ['A', 'B', 'C', 'D'];
    const hpPercent = Math.round((playerStats.hp / playerStats.maxHp) * 100);
    const hpClass = hpPercent <= 25 ? 'critical' : hpPercent <= 50 ? 'low' : '';

    // Inject styles
    let styleEl = document.getElementById('qp-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'qp-styles';
      styleEl.textContent = getScrollStyles();
      document.head.appendChild(styleEl);
    }

    // Make sure container is visible
    container.style.display = 'block';

    // Build HTML (NO inline onclick handlers - CSP compliant)
    container.innerHTML = `
      <div class="qp-scroll-container">
        <!-- Navigation Bar -->
        <div class="qp-nav-bar">
          <button class="qp-nav-btn back" data-action="back" title="Return to Map (Esc)">
            <span class="qp-nav-icon">←</span>
            <span>Map</span>
          </button>
          <button class="qp-nav-btn help" data-action="help" title="Get Help from Ms. Luminara (?)">
            <span class="qp-nav-icon">❓</span>
            <span>Help</span>
          </button>
          <button class="qp-nav-btn flee" data-action="flee" title="Flee Combat (lose HP)">
            <span class="qp-nav-icon">🏃</span>
            <span>Flee</span>
          </button>
        </div>

        ${monsterStats ? `
          <div style="text-align: center; margin-bottom: 20px; margin-top: 50px; color: white;">
            <div style="font-size: 36px;">${monsterStats.icon || '⚔️'}</div>
            <div style="font-size: 18px; font-weight: bold;">${monsterStats.name}</div>
            <div class="qp-hp-bar" style="width: 180px; margin: 8px auto;">
              <div class="qp-hp-fill" style="width: ${Math.round((monsterStats.hp / monsterStats.maxHp) * 100)}%;"></div>
            </div>
            <div style="font-size: 13px; opacity: 0.8;">${monsterStats.hp} / ${monsterStats.maxHp}</div>
          </div>
        ` : '<div style="height: 60px;"></div>'}

        <div class="qp-scroll">
          <div class="qp-round-badge">Q</div>

          <div class="qp-header">
            ${category ? `<div class="qp-category">${category}</div>` : ''}
            <div class="qp-round">Round ${round}</div>
          </div>

          <div class="qp-question-text">${sanitizeText(question.q)}</div>

          <div class="qp-divider">✦</div>

          <div class="qp-answers">
            ${question.options.map((opt, i) => `
              <button class="qp-answer" data-index="${i}">
                <div class="qp-seal qp-seal-${letters[i]}">${letters[i]}</div>
                <div class="qp-answer-text">${sanitizeText(opt)}</div>
                <div class="qp-key-hint">${i + 1}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="qp-status-bar">
          <div class="qp-stat">
            <span class="qp-stat-icon">❤️</span>
            <div class="qp-hp-bar">
              <div class="qp-hp-fill ${hpClass}" style="width: ${hpPercent}%;"></div>
            </div>
            <span>${playerStats.hp}/${playerStats.maxHp}</span>
          </div>
          <div class="qp-stat">
            <span class="qp-stat-icon">⚔️</span>
            <span>${playerStats.damage}</span>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners using addEventListener (CSP compliant)
    setupEventListeners();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
  }

  /**
   * Setup event listeners for buttons (CSP compliant - no inline onclick)
   */
  function setupEventListeners() {
    if (!container) return;

    // Navigation buttons
    const backBtn = container.querySelector('[data-action="back"]');
    const helpBtn = container.querySelector('[data-action="help"]');
    const fleeBtn = container.querySelector('[data-action="flee"]');

    if (backBtn) {
      backBtn.addEventListener('click', goBack);
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', showHelp);
    }

    if (fleeBtn) {
      fleeBtn.addEventListener('click', flee);
    }

    // Answer buttons
    const answerButtons = container.querySelectorAll('.qp-answer');
    answerButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.getAttribute('data-index'));
        selectAnswer(index);
      });
    });
  }

  /**
   * Handle answer selection
   */
  function selectAnswer(index) {
    if (!currentQuestion || !onAnswerCallback) return;

    const correctIndex = currentQuestion.correct !== undefined ? currentQuestion.correct : currentQuestion.answer;
    const isCorrect = index === correctIndex;

    // Visual feedback
    const buttons = container.querySelectorAll('.qp-answer');
    buttons.forEach((btn, i) => {
      btn.style.pointerEvents = 'none'; // Disable further clicks
      if (i === index) {
        btn.classList.add(isCorrect ? 'correct' : 'wrong');
      }
      if (i === correctIndex && !isCorrect) {
        // Show correct answer after wrong selection
        setTimeout(() => btn.classList.add('correct'), 300);
      }
    });

    // Callback after brief delay for animation
    setTimeout(() => {
      onAnswerCallback(index, isCorrect);
    }, isCorrect ? 400 : 800);
  }

  /**
   * Setup keyboard shortcuts (1-4 for answers, Esc for back)
   */
  function setupKeyboardShortcuts() {
    // Remove any existing handler
    if (window._qpKeyHandler) {
      document.removeEventListener('keydown', window._qpKeyHandler);
    }

    const handler = (e) => {
      const key = e.key;

      // Number keys 1-4 for answer selection
      if (key >= '1' && key <= '4') {
        const index = parseInt(key) - 1;
        if (currentQuestion && currentQuestion.options[index]) {
          selectAnswer(index);
          document.removeEventListener('keydown', handler);
          window._qpKeyHandler = null;
        }
      }

      // Escape key to go back to map
      if (key === 'Escape') {
        goBack();
        document.removeEventListener('keydown', handler);
        window._qpKeyHandler = null;
      }
    };

    window._qpKeyHandler = handler;
    document.addEventListener('keydown', handler);
  }

  /**
   * Go back to the map (triggered by back button or Escape key)
   */
  function goBack() {
    if (onBackCallback) {
      onBackCallback();
    }
    hide();
  }

  /**
   * Flee from combat (triggered by flee button)
   */
  function flee() {
    if (onFleeCallback) {
      onFleeCallback();
    }
    hide();
  }

  /**
   * Show help from Ms. Luminara (triggered by ? button)
   */
  function showHelp() {
    if (currentQuestion && typeof LessonModal !== 'undefined') {
      LessonModal.showQuickHelp(currentQuestion);
    } else {
      console.warn('[QuestionPresenter] LessonModal not available or no current question');
    }
  }

  /**
   * Hide the presenter
   */
  function hide() {
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
  }

  /**
   * Update stats without re-rendering question
   */
  function updateStats(playerStats, monsterStats) {
    // Update HP bars if they exist
    const playerHpFill = container?.querySelector('.qp-status-bar .qp-hp-fill');
    if (playerHpFill && playerStats) {
      const hpPercent = Math.round((playerStats.hp / playerStats.maxHp) * 100);
      playerHpFill.style.width = hpPercent + '%';
      playerHpFill.className = 'qp-hp-fill ' + (hpPercent <= 25 ? 'critical' : hpPercent <= 50 ? 'low' : '');
    }
  }

  // Public API
  return {
    init,
    present,
    selectAnswer,
    hide,
    updateStats,
    goBack,
    flee,
    showHelp,
    COLORS
  };
})();

// Make globally available
window.QuestionPresenter = QuestionPresenter;
