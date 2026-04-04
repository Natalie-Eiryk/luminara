/**
 * 820.31.96-lesson-modal.js - Ms. Luminara's Teaching Lesson Modal
 * @codon 820.31.96
 * @version 2026-04-03
 * @description Comprehensive teaching explanations with Ms. Luminara's personality
 *
 * Shows:
 * - Mechanism explanations with metaphors
 * - Option-by-option breakdowns (why each is right/wrong)
 * - Scaffolding lessons triggered by wrong answers or ? button
 *
 * CSP Compliance:
 * - All inline onclick handlers replaced with data attributes
 * - Event listeners attached via addEventListener
 * - No 'unsafe-inline' required for script-src
 */

const LessonModal = {
  container: null,
  currentQuestion: null,
  onClose: null,

  /**
   * Initialize the lesson modal system
   */
  init() {
    // Create container if not exists
    if (!document.getElementById('lesson-modal-container')) {
      const container = document.createElement('div');
      container.id = 'lesson-modal-container';
      document.body.appendChild(container);
    }
    this.container = document.getElementById('lesson-modal-container');
    this.injectStyles();
    console.log('[LessonModal] Initialized');
  },

  /**
   * Show a comprehensive lesson for a question
   * @param {Object} question - The question object with explain, mechanism, optionExplains
   * @param {Object} options - Display options
   * @param {number} options.selectedAnswer - Index of user's selected answer (if wrong)
   * @param {number} options.correctAnswer - Index of correct answer
   * @param {string} options.trigger - 'wrong_answer', 'help_button', 'scaffold_complete'
   * @param {Function} options.onClose - Callback when modal closes
   */
  show(question, options = {}) {
    if (!this.container) this.init();

    this.currentQuestion = question;
    this.onClose = options.onClose || null;

    const {
      selectedAnswer = null,
      correctAnswer = question.correct !== undefined ? question.correct : question.answer,
      trigger = 'help_button'
    } = options;

    // Build the lesson content
    const content = this.buildLessonContent(question, selectedAnswer, correctAnswer, trigger);

    this.container.innerHTML = `
      <div class="lesson-modal-backdrop" data-action="close"></div>
      <div class="lesson-modal">
        <button class="lesson-close-btn" data-action="close" title="Close (Esc)">×</button>

        <div class="lesson-header">
          <div class="lesson-luminara-avatar">👩‍🏫</div>
          <div class="lesson-title">
            <span class="lesson-label">Ms. Luminara Explains</span>
            <span class="lesson-topic">${this.getTopicFromQuestion(question)}</span>
          </div>
        </div>

        <div class="lesson-content">
          ${content}
        </div>

        <div class="lesson-footer">
          <button class="lesson-got-it-btn" data-action="close">
            Got it! Let's continue
          </button>
        </div>
      </div>
    `;

    this.container.classList.add('active');

    // Add event listeners for close actions
    this.container.querySelectorAll('[data-action="close"]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    // Add keyboard listener
    this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this._keyHandler);

    // Play teaching sound if available
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playLesson) {
      SoundSystem.playLesson();
    }
  },

  /**
   * Build the lesson content HTML
   */
  buildLessonContent(question, selectedAnswer, correctAnswer, trigger) {
    let html = '';

    // 1. The Question Recap (if triggered by wrong answer)
    if (trigger === 'wrong_answer' && selectedAnswer !== null) {
      html += this.buildWrongAnswerSection(question, selectedAnswer, correctAnswer);
    }

    // 2. Main Explanation
    if (question.explain) {
      html += `
        <div class="lesson-section explanation-section">
          <div class="lesson-section-header">
            <span class="section-icon">💡</span>
            <span class="section-title">The Key Insight</span>
          </div>
          <div class="lesson-text luminara-voice">
            ${this.formatText(question.explain)}
          </div>
        </div>
      `;
    }

    // 3. Mechanism Deep Dive (if available)
    if (question.mechanism) {
      html += this.buildMechanismSection(question.mechanism);
    }

    // 4. Option Breakdown (why each option is right/wrong)
    if (question.optionExplains && question.optionExplains.length > 0) {
      html += this.buildOptionBreakdown(question, correctAnswer);
    }

    // 5. Metaphor/Memory Aid (if available)
    if (question.mechanism?.metaphor) {
      html += `
        <div class="lesson-section metaphor-section">
          <div class="lesson-section-header">
            <span class="section-icon">🧠</span>
            <span class="section-title">Memory Aid</span>
          </div>
          <div class="lesson-metaphor">
            <div class="metaphor-content luminara-voice">
              ${this.formatText(question.mechanism.metaphor)}
            </div>
          </div>
        </div>
      `;
    }

    // 6. If no detailed content, provide generic encouragement
    if (!html) {
      html = `
        <div class="lesson-section">
          <div class="lesson-text luminara-voice">
            This is a foundational concept. Take a moment to review the question and consider
            why the correct answer makes sense. Sometimes the best learning comes from sitting
            with the material.
          </div>
        </div>
      `;
    }

    return html;
  },

  /**
   * Build the "you got it wrong" section
   */
  buildWrongAnswerSection(question, selectedAnswer, correctAnswer) {
    const options = question.options || [];
    const selectedText = options[selectedAnswer] || 'Unknown';
    const correctText = options[correctAnswer] || 'Unknown';

    return `
      <div class="lesson-section wrong-answer-section">
        <div class="lesson-section-header">
          <span class="section-icon">🎯</span>
          <span class="section-title">Let's Review What Happened</span>
        </div>

        <div class="answer-comparison">
          <div class="answer-box wrong">
            <div class="answer-label">You Selected</div>
            <div class="answer-letter">${['A', 'B', 'C', 'D'][selectedAnswer]}</div>
            <div class="answer-text">${this.formatText(selectedText)}</div>
          </div>

          <div class="answer-arrow">→</div>

          <div class="answer-box correct">
            <div class="answer-label">Correct Answer</div>
            <div class="answer-letter">${['A', 'B', 'C', 'D'][correctAnswer]}</div>
            <div class="answer-text">${this.formatText(correctText)}</div>
          </div>
        </div>

        ${question.optionExplains && question.optionExplains[selectedAnswer] ? `
          <div class="why-wrong luminara-voice">
            <strong>Why your answer was incorrect:</strong><br>
            ${this.formatText(question.optionExplains[selectedAnswer].text || '')}
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Build the mechanism deep dive section
   */
  buildMechanismSection(mechanism) {
    return `
      <div class="lesson-section mechanism-section">
        <div class="lesson-section-header">
          <span class="section-icon">⚙️</span>
          <span class="section-title">${mechanism.title || 'How It Works'}</span>
        </div>
        <div class="mechanism-content luminara-voice">
          ${this.formatText(mechanism.content || '')}
        </div>
      </div>
    `;
  },

  /**
   * Build option-by-option breakdown
   */
  buildOptionBreakdown(question, correctAnswer) {
    const options = question.options || [];
    const explains = question.optionExplains || [];

    let optionsHtml = options.map((opt, i) => {
      const explain = explains[i];
      const isCorrect = i === correctAnswer;
      const verdict = explain?.verdict || (isCorrect ? 'correct' : 'incorrect');
      const text = explain?.text || '';

      return `
        <div class="option-breakdown-item ${verdict}">
          <div class="option-header">
            <span class="option-letter">${['A', 'B', 'C', 'D'][i]}</span>
            <span class="option-text">${this.formatText(opt)}</span>
            <span class="option-verdict ${verdict}">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
          </div>
          ${text ? `<div class="option-explanation luminara-voice">${this.formatText(text)}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="lesson-section options-section">
        <div class="lesson-section-header">
          <span class="section-icon">📋</span>
          <span class="section-title">Option Breakdown</span>
        </div>
        <div class="options-breakdown">
          ${optionsHtml}
        </div>
      </div>
    `;
  },

  /**
   * Show lesson after scaffold session completes
   */
  showScaffoldSummary(triggerQuestion, scaffoldResults, insightEvaluation) {
    if (!this.container) this.init();

    const { insightAchieved, confidence, exitReason } = insightEvaluation || {};
    const correctCount = scaffoldResults?.filter(r => r.correct).length || 0;
    const totalCount = scaffoldResults?.length || 0;

    // Get exit message from InsightDetectionEngine if available
    let exitMessage = '';
    if (typeof insightEngine !== 'undefined' && insightEngine.getExitMessage) {
      exitMessage = insightEngine.getExitMessage(exitReason);
    } else {
      exitMessage = insightAchieved
        ? "There it is. You found it yourself. See? You knew more than you thought."
        : "Let me show you the whole picture now.";
    }

    // Build mechanism content if available
    let mechanismHtml = '';
    if (triggerQuestion.mechanism) {
      mechanismHtml = this.buildMechanismSection(triggerQuestion.mechanism);
      if (triggerQuestion.mechanism.metaphor) {
        mechanismHtml += `
          <div class="lesson-section metaphor-section">
            <div class="lesson-section-header">
              <span class="section-icon">🧠</span>
              <span class="section-title">Remember It Like This</span>
            </div>
            <div class="lesson-metaphor">
              <div class="metaphor-content luminara-voice">
                ${this.formatText(triggerQuestion.mechanism.metaphor)}
              </div>
            </div>
          </div>
        `;
      }
    }

    this.container.innerHTML = `
      <div class="lesson-modal-backdrop" data-action="close"></div>
      <div class="lesson-modal scaffold-summary">
        <button class="lesson-close-btn" data-action="close" title="Close (Esc)">×</button>

        <div class="lesson-header">
          <div class="lesson-luminara-avatar">${insightAchieved ? '😊' : '🤔'}</div>
          <div class="lesson-title">
            <span class="lesson-label">${insightAchieved ? 'Insight Achieved!' : 'Learning Summary'}</span>
            <span class="lesson-topic">${this.getTopicFromQuestion(triggerQuestion)}</span>
          </div>
        </div>

        <div class="lesson-content">
          <!-- Ms. Luminara's message -->
          <div class="lesson-section luminara-message-section">
            <div class="luminara-quote">
              "${exitMessage}"
            </div>
            <div class="scaffold-stats">
              <div class="stat">
                <span class="stat-value">${correctCount}/${totalCount}</span>
                <span class="stat-label">Scaffolds Correct</span>
              </div>
              ${confidence !== undefined ? `
                <div class="stat">
                  <span class="stat-value">${Math.round(confidence * 100)}%</span>
                  <span class="stat-label">Confidence</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Original question explanation -->
          ${triggerQuestion.explain ? `
            <div class="lesson-section explanation-section">
              <div class="lesson-section-header">
                <span class="section-icon">💡</span>
                <span class="section-title">The Core Concept</span>
              </div>
              <div class="lesson-text luminara-voice">
                ${this.formatText(triggerQuestion.explain)}
              </div>
            </div>
          ` : ''}

          <!-- Mechanism tour -->
          ${mechanismHtml}
        </div>

        <div class="lesson-footer">
          <button class="lesson-got-it-btn" data-action="close">
            ${insightAchieved ? "I've got it now!" : "Continue Learning"}
          </button>
        </div>
      </div>
    `;

    this.container.classList.add('active');

    // Add event listeners for close actions
    this.container.querySelectorAll('[data-action="close"]').forEach(el => {
      el.addEventListener('click', () => this.close());
    });

    this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', this._keyHandler);
  },

  /**
   * Quick explanation popup (for ? button)
   */
  showQuickHelp(question) {
    this.show(question, {
      trigger: 'help_button',
      correctAnswer: question.correct !== undefined ? question.correct : question.answer
    });
  },

  /**
   * Close the modal
   */
  close() {
    if (this.container) {
      this.container.classList.remove('active');
      this.container.innerHTML = '';
    }

    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }

    if (this.onClose) {
      this.onClose();
      this.onClose = null;
    }
  },

  /**
   * Extract topic name from question
   */
  getTopicFromQuestion(question) {
    return question._category || question.chapter || question.topic || 'This Concept';
  },

  /**
   * Format text with basic markdown-like styling
   */
  formatText(text) {
    if (!text) return '';

    // Handle **bold**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Handle *italic*
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
  },

  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('lesson-modal-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'lesson-modal-styles';
    styles.textContent = `
      #lesson-modal-container {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10001;
      }

      #lesson-modal-container.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lesson-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .lesson-modal {
        position: relative;
        width: 90%;
        max-width: 700px;
        max-height: 85vh;
        background: linear-gradient(135deg, #2d2a1f 0%, #1a1810 100%);
        border: 3px solid var(--gold, #daa520);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalSlideIn 0.4s ease;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(218,165,32,0.2);
      }

      @keyframes modalSlideIn {
        from {
          transform: translateY(-30px) scale(0.95);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      .lesson-close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 36px;
        height: 36px;
        background: rgba(0,0,0,0.5);
        border: 1px solid var(--border, #444);
        border-radius: 50%;
        color: var(--text-secondary, #aaa);
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .lesson-close-btn:hover {
        background: rgba(220,38,38,0.3);
        border-color: #dc2626;
        color: #fff;
      }

      .lesson-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 24px 24px 16px;
        border-bottom: 1px solid rgba(218,165,32,0.3);
        background: linear-gradient(180deg, rgba(218,165,32,0.15) 0%, transparent 100%);
      }

      .lesson-luminara-avatar {
        font-size: 48px;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(218,165,32,0.2);
        border-radius: 50%;
        border: 2px solid var(--gold, #daa520);
      }

      .lesson-title {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .lesson-label {
        font-size: 0.85rem;
        color: var(--gold, #daa520);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .lesson-topic {
        font-size: 1.4rem;
        font-weight: 600;
        color: var(--text-primary, #f5f5f5);
      }

      .lesson-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
      }

      .lesson-section {
        margin-bottom: 24px;
        padding: 16px;
        background: rgba(0,0,0,0.3);
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .lesson-section:last-child {
        margin-bottom: 0;
      }

      .lesson-section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      .section-icon {
        font-size: 1.3rem;
      }

      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--gold, #daa520);
      }

      .lesson-text,
      .luminara-voice {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text-primary, #e5e5e5);
      }

      .luminara-voice {
        font-style: italic;
        color: #d4c4a8;
      }

      .luminara-voice strong {
        color: var(--gold, #daa520);
        font-style: normal;
      }

      /* Wrong Answer Section */
      .answer-comparison {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        margin: 16px 0;
        flex-wrap: wrap;
      }

      .answer-box {
        flex: 1;
        min-width: 200px;
        max-width: 250px;
        padding: 16px;
        border-radius: 12px;
        text-align: center;
      }

      .answer-box.wrong {
        background: rgba(220,38,38,0.15);
        border: 2px solid rgba(220,38,38,0.5);
      }

      .answer-box.correct {
        background: rgba(34,197,94,0.15);
        border: 2px solid rgba(34,197,94,0.5);
      }

      .answer-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-dim, #888);
        margin-bottom: 8px;
      }

      .answer-letter {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 8px;
      }

      .answer-box.wrong .answer-letter {
        color: #ef4444;
      }

      .answer-box.correct .answer-letter {
        color: #22c55e;
      }

      .answer-text {
        font-size: 0.9rem;
        color: var(--text-primary, #e5e5e5);
      }

      .answer-arrow {
        font-size: 2rem;
        color: var(--text-dim, #666);
      }

      .why-wrong {
        margin-top: 16px;
        padding: 12px;
        background: rgba(220,38,38,0.1);
        border-left: 3px solid #ef4444;
        border-radius: 0 8px 8px 0;
      }

      /* Mechanism Section */
      .mechanism-content {
        background: rgba(218,165,32,0.1);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid var(--gold, #daa520);
      }

      /* Metaphor Section */
      .metaphor-section {
        background: linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(79,70,229,0.15) 100%);
        border-color: rgba(147,51,234,0.3);
      }

      .lesson-metaphor {
        background: rgba(147,51,234,0.1);
        padding: 16px;
        border-radius: 8px;
        border-left: 3px solid #9333ea;
      }

      /* Options Breakdown */
      .options-breakdown {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .option-breakdown-item {
        padding: 12px;
        border-radius: 8px;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
      }

      .option-breakdown-item.correct {
        border-color: rgba(34,197,94,0.4);
        background: rgba(34,197,94,0.1);
      }

      .option-breakdown-item.incorrect {
        border-color: rgba(220,38,38,0.2);
      }

      .option-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .option-letter {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.1);
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .option-breakdown-item.correct .option-letter {
        background: rgba(34,197,94,0.3);
        color: #22c55e;
      }

      .option-text {
        flex: 1;
        font-size: 0.95rem;
        color: var(--text-primary, #e5e5e5);
      }

      .option-verdict {
        font-size: 0.8rem;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
      }

      .option-verdict.correct {
        background: rgba(34,197,94,0.2);
        color: #22c55e;
      }

      .option-verdict.incorrect {
        background: rgba(220,38,38,0.2);
        color: #ef4444;
      }

      .option-explanation {
        font-size: 0.9rem;
        padding-left: 40px;
        color: #b8a88a;
      }

      /* Scaffold Summary Specific */
      .scaffold-summary .luminara-quote {
        font-size: 1.2rem;
        font-style: italic;
        color: var(--gold, #daa520);
        text-align: center;
        padding: 16px;
        background: rgba(218,165,32,0.1);
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .scaffold-stats {
        display: flex;
        justify-content: center;
        gap: 32px;
      }

      .scaffold-stats .stat {
        text-align: center;
      }

      .scaffold-stats .stat-value {
        display: block;
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--gold, #daa520);
      }

      .scaffold-stats .stat-label {
        font-size: 0.8rem;
        color: var(--text-dim, #888);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Footer */
      .lesson-footer {
        padding: 16px 24px 24px;
        text-align: center;
        border-top: 1px solid rgba(255,255,255,0.1);
      }

      .lesson-got-it-btn {
        padding: 14px 32px;
        background: linear-gradient(135deg, var(--gold, #daa520) 0%, #b8860b 100%);
        border: none;
        border-radius: 8px;
        color: #1a1a1a;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(218,165,32,0.3);
      }

      .lesson-got-it-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(218,165,32,0.4);
      }

      /* Mobile */
      @media (max-width: 600px) {
        .lesson-modal {
          width: 95%;
          max-height: 90vh;
          border-radius: 12px;
        }

        .lesson-header {
          padding: 16px;
        }

        .lesson-luminara-avatar {
          font-size: 36px;
          width: 48px;
          height: 48px;
        }

        .lesson-topic {
          font-size: 1.1rem;
        }

        .lesson-content {
          padding: 16px;
        }

        .answer-comparison {
          flex-direction: column;
        }

        .answer-arrow {
          transform: rotate(90deg);
        }

        .answer-box {
          max-width: 100%;
        }
      }
    `;

    document.head.appendChild(styles);
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LessonModal.init());
  } else {
    LessonModal.init();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessonModal;
}

window.LessonModal = LessonModal;
