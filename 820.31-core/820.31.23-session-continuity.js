/**
 * Ms. Luminara Quiz - Session Continuity System v1.0
 * Prompts user to save progress with notes when:
 * - Switching topics
 * - Leaving the page
 * - Navigating back to landing
 *
 * Captures: timestamp, progress stats, topics covered, optional personal note
 *
 * @module SessionContinuity
 * @version 1.0.0
 */

const SessionContinuity = {
  // Storage key for session history
  STORAGE_KEY: 'ms_luminara_session_history',

  // Current session data
  currentSession: {
    startTime: null,
    topics: [],
    questionsAnswered: 0,
    correctAnswers: 0,
    confusedWords: 0,
    lastQuestionId: null
  },

  // Session history array
  history: [],

  // Flag to prevent double prompts
  promptShown: false,

  /**
   * Initialize the session continuity system
   */
  init() {
    this.loadHistory();
    this.startSession();
    this.setupEventListeners();
    this.showWelcomeBack();
    console.log('[SessionContinuity] Initialized');
  },

  /**
   * Load session history from localStorage
   */
  loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[SessionContinuity] Failed to load history:', e);
      this.history = [];
    }
  },

  /**
   * Save session history to localStorage
   */
  saveHistory() {
    try {
      // Keep only last 20 sessions
      if (this.history.length > 20) {
        this.history = this.history.slice(-20);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error('[SessionContinuity] Failed to save history:', e);
    }
  },

  /**
   * Start a new session
   */
  startSession() {
    this.currentSession = {
      startTime: new Date().toISOString(),
      topics: [],
      questionsAnswered: 0,
      correctAnswers: 0,
      confusedWords: 0,
      lastQuestionId: null
    };
    this.promptShown = false;
  },

  /**
   * Setup event listeners for navigation changes
   */
  setupEventListeners() {
    // Before unload - browser close/refresh
    window.addEventListener('beforeunload', (e) => {
      if (this.shouldPromptSave()) {
        // Can't show custom dialog on beforeunload, just save auto-checkpoint
        this.autoSaveCheckpoint('Page closed/refreshed');
      }
    });

    // Intercept back button clicks - CSP compliant
    const backBtn = document.querySelector('.back-btn, [data-action="go-home"]');
    if (backBtn) {
      // Store reference to any existing click handler
      backBtn.addEventListener('click', (e) => {
        if (this.shouldPromptSave()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.showSavePrompt(() => {
            if (typeof goHome === 'function') goHome();
          });
        }
      }, true); // Use capture phase to intercept before other handlers
    }

    // Hook into quiz topic changes
    this.hookTopicChanges();
  },

  /**
   * Hook into topic/quiz changes
   */
  hookTopicChanges() {
    // Override goHome if it exists
    if (typeof window.goHome === 'function') {
      const originalGoHome = window.goHome;
      window.goHome = () => {
        if (this.shouldPromptSave()) {
          this.showSavePrompt(() => {
            originalGoHome();
            this.startSession(); // Start fresh session after returning home
          });
        } else {
          originalGoHome();
        }
      };
    }
  },

  /**
   * Check if we should prompt to save
   */
  shouldPromptSave() {
    // Only prompt if meaningful progress was made
    return !this.promptShown &&
           (this.currentSession.questionsAnswered >= 3 ||
            this.currentSession.confusedWords > 0);
  },

  /**
   * Track when a topic is started
   */
  trackTopic(topicName, topicId) {
    if (!this.currentSession.topics.find(t => t.id === topicId)) {
      this.currentSession.topics.push({
        id: topicId,
        name: topicName,
        startedAt: new Date().toISOString()
      });
    }
  },

  /**
   * Track when a question is answered
   */
  trackQuestion(questionId, wasCorrect) {
    this.currentSession.questionsAnswered++;
    if (wasCorrect) {
      this.currentSession.correctAnswers++;
    }
    this.currentSession.lastQuestionId = questionId;
  },

  /**
   * Track confused words count
   */
  trackConfusedWord() {
    this.currentSession.confusedWords++;
  },

  /**
   * Show the save prompt dialog
   */
  showSavePrompt(onContinue) {
    this.promptShown = true;

    // Remove existing prompt
    const existing = document.querySelector('.session-save-prompt');
    if (existing) existing.remove();

    const stats = this.getSessionStats();
    const topicsList = this.currentSession.topics.map(t => t.name).join(', ') || 'None recorded';

    const prompt = document.createElement('div');
    prompt.className = 'session-save-prompt';
    prompt.innerHTML = `
      <div class="save-prompt-overlay"></div>
      <div class="save-prompt-dialog">
        <div class="save-prompt-header">
          <span class="save-icon">&#x1F4BE;</span>
          <h2>Save Your Progress?</h2>
        </div>

        <div class="save-prompt-stats">
          <div class="stat-row">
            <span class="stat-label">Session Duration</span>
            <span class="stat-value">${stats.duration}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Questions Answered</span>
            <span class="stat-value">${stats.questionsAnswered}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Accuracy</span>
            <span class="stat-value">${stats.accuracy}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Topics Covered</span>
            <span class="stat-value topics">${topicsList}</span>
          </div>
          ${stats.confusedWords > 0 ? `
          <div class="stat-row">
            <span class="stat-label">Words Flagged</span>
            <span class="stat-value">${stats.confusedWords}</span>
          </div>
          ` : ''}
        </div>

        <div class="save-prompt-note">
          <label for="session-note">Add a note (optional):</label>
          <textarea id="session-note" placeholder="Where did you leave off? What to review next time?"></textarea>
        </div>

        <div class="save-prompt-actions">
          <button class="save-btn primary" id="saveAndContinueBtn">
            <span>&#x2714;</span> Save & Continue
          </button>
          <button class="save-btn secondary" id="skipSaveBtn">
            Skip
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(prompt);

    // Animate in
    requestAnimationFrame(() => {
      prompt.classList.add('visible');
    });

    // Button handlers - CSP compliant
    document.getElementById('saveAndContinueBtn').addEventListener('click', () => {
      const note = document.getElementById('session-note').value.trim();
      this.saveCheckpoint(note);
      this.closePrompt(prompt, onContinue);
    });

    document.getElementById('skipSaveBtn').addEventListener('click', () => {
      this.closePrompt(prompt, onContinue);
    });

    // Close on overlay click
    prompt.querySelector('.save-prompt-overlay').addEventListener('click', () => {
      this.closePrompt(prompt, onContinue);
    });
  },

  /**
   * Close the save prompt
   */
  closePrompt(prompt, callback) {
    prompt.classList.remove('visible');
    setTimeout(() => {
      prompt.remove();
      if (callback) callback();
    }, 300);
  },

  /**
   * Save a checkpoint to history
   */
  saveCheckpoint(note = '') {
    const stats = this.getSessionStats();

    const checkpoint = {
      timestamp: new Date().toISOString(),
      duration: stats.duration,
      durationMinutes: stats.durationMinutes,
      questionsAnswered: stats.questionsAnswered,
      correctAnswers: this.currentSession.correctAnswers,
      accuracy: stats.accuracy,
      topics: this.currentSession.topics,
      confusedWords: stats.confusedWords,
      lastQuestionId: this.currentSession.lastQuestionId,
      note: note
    };

    this.history.push(checkpoint);
    this.saveHistory();

    // Show confirmation
    this.showSaveConfirmation();

    console.log('[SessionContinuity] Checkpoint saved:', checkpoint);
  },

  /**
   * Auto-save checkpoint (for page close)
   */
  autoSaveCheckpoint(reason) {
    if (!this.shouldPromptSave()) return;

    const stats = this.getSessionStats();

    const checkpoint = {
      timestamp: new Date().toISOString(),
      duration: stats.duration,
      durationMinutes: stats.durationMinutes,
      questionsAnswered: stats.questionsAnswered,
      correctAnswers: this.currentSession.correctAnswers,
      accuracy: stats.accuracy,
      topics: this.currentSession.topics,
      confusedWords: stats.confusedWords,
      lastQuestionId: this.currentSession.lastQuestionId,
      note: `[Auto-saved: ${reason}]`,
      autoSaved: true
    };

    this.history.push(checkpoint);
    this.saveHistory();
  },

  /**
   * Show save confirmation toast
   */
  showSaveConfirmation() {
    const toast = document.createElement('div');
    toast.className = 'session-save-toast';
    toast.innerHTML = `<span>&#x2714;</span> Progress saved!`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  },

  /**
   * Get current session statistics
   */
  getSessionStats() {
    const start = new Date(this.currentSession.startTime);
    const now = new Date();
    const durationMs = now - start;
    const durationMinutes = Math.floor(durationMs / 60000);

    let durationStr;
    if (durationMinutes < 1) {
      durationStr = 'Less than 1 minute';
    } else if (durationMinutes < 60) {
      durationStr = `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      durationStr = `${hours}h ${mins}m`;
    }

    const accuracy = this.currentSession.questionsAnswered > 0
      ? Math.round((this.currentSession.correctAnswers / this.currentSession.questionsAnswered) * 100)
      : 0;

    return {
      duration: durationStr,
      durationMinutes: durationMinutes,
      questionsAnswered: this.currentSession.questionsAnswered,
      accuracy: accuracy,
      confusedWords: this.currentSession.confusedWords
    };
  },

  /**
   * Show welcome back message if recent session exists
   */
  showWelcomeBack() {
    if (this.history.length === 0) return;

    const lastSession = this.history[this.history.length - 1];
    const lastTime = new Date(lastSession.timestamp);
    const now = new Date();
    const hoursSince = (now - lastTime) / (1000 * 60 * 60);

    // Only show if within last 7 days
    if (hoursSince > 168) return;

    // Delay to not interfere with page load
    setTimeout(() => {
      this.showWelcomeBackBanner(lastSession, hoursSince);
    }, 1500);
  },

  /**
   * Show welcome back banner
   */
  showWelcomeBackBanner(session, hoursSince) {
    // Don't show if already in a quiz
    const studyView = document.getElementById('studyView');
    if (studyView && studyView.classList.contains('active')) return;

    const timeAgo = this.formatTimeAgo(hoursSince);
    const topicsList = session.topics.map(t => t.name).join(', ') || 'your studies';

    const banner = document.createElement('div');
    banner.className = 'welcome-back-banner';
    banner.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-header">
          <span class="welcome-icon">&#x1F44B;</span>
          <span class="welcome-text">Welcome back!</span>
        </div>
        <div class="welcome-details">
          <p>Last session: <strong>${timeAgo}</strong></p>
          <p>You covered: <strong>${topicsList}</strong></p>
          <p>Accuracy: <strong>${session.accuracy}%</strong> (${session.questionsAnswered} questions)</p>
          ${session.note && !session.autoSaved ? `
            <p class="session-note-display"><em>"${session.note}"</em></p>
          ` : ''}
        </div>
        <div class="welcome-actions">
          <button class="welcome-btn" data-action="view-history">
            View History
          </button>
          <button class="welcome-btn dismiss" data-action="dismiss-banner">
            Dismiss
          </button>
        </div>
      </div>
    `;

    // Insert at top of landing page
    const landing = document.getElementById('landing');
    if (landing) {
      landing.insertBefore(banner, landing.firstChild);
      requestAnimationFrame(() => banner.classList.add('visible'));

      // Attach event listeners - CSP compliant
      const viewHistoryBtn = banner.querySelector('[data-action="view-history"]');
      const dismissBtn = banner.querySelector('[data-action="dismiss-banner"]');

      if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
          this.showSessionHistory();
        });
      }

      if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
          banner.remove();
        });
      }

      // Auto-dismiss after 15 seconds
      setTimeout(() => {
        if (banner.parentNode) {
          banner.classList.remove('visible');
          setTimeout(() => banner.remove(), 300);
        }
      }, 15000);
    }
  },

  /**
   * Format time ago string
   */
  formatTimeAgo(hours) {
    if (hours < 1) {
      return 'just now';
    } else if (hours < 24) {
      const h = Math.floor(hours);
      return `${h} hour${h !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  },

  /**
   * Show full session history panel
   */
  showSessionHistory() {
    // Remove existing
    const existing = document.querySelector('.session-history-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'session-history-panel';

    if (this.history.length === 0) {
      panel.innerHTML = `
        <div class="history-header">
          <h2>Session History</h2>
          <button class="history-close" data-action="close-history">&times;</button>
        </div>
        <div class="history-empty">
          <p>No sessions recorded yet.</p>
          <p>Your study history will appear here.</p>
        </div>
      `;
    } else {
      const sessionsHtml = this.history
        .slice()
        .reverse()
        .map((s, i) => this.renderSessionCard(s, i))
        .join('');

      panel.innerHTML = `
        <div class="history-header">
          <h2>Session History <span class="history-count">(${this.history.length})</span></h2>
          <button class="history-close" data-action="close-history">&times;</button>
        </div>
        <div class="history-list">
          ${sessionsHtml}
        </div>
      `;
    }

    document.body.appendChild(panel);
    requestAnimationFrame(() => panel.classList.add('visible'));

    // Attach event listener for close button - CSP compliant
    const closeBtn = panel.querySelector('[data-action="close-history"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        panel.remove();
      });
    }
  },

  /**
   * Render a single session card
   */
  renderSessionCard(session, index) {
    const date = new Date(session.timestamp);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    const topics = session.topics.map(t => t.name).join(', ') || 'Not recorded';

    return `
      <div class="session-card ${session.autoSaved ? 'auto-saved' : ''}">
        <div class="session-card-header">
          <span class="session-date">${dateStr}</span>
          <span class="session-duration">${session.duration}</span>
        </div>
        <div class="session-card-stats">
          <span class="session-stat">
            <strong>${session.questionsAnswered}</strong> questions
          </span>
          <span class="session-stat">
            <strong>${session.accuracy}%</strong> accuracy
          </span>
          ${session.confusedWords > 0 ? `
          <span class="session-stat">
            <strong>${session.confusedWords}</strong> words flagged
          </span>
          ` : ''}
        </div>
        <div class="session-topics">Topics: ${topics}</div>
        ${session.note ? `
          <div class="session-note">${session.note}</div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Clear session history
   */
  clearHistory() {
    if (confirm('Clear all session history? This cannot be undone.')) {
      this.history = [];
      this.saveHistory();
      this.showSessionHistory(); // Refresh panel
    }
  }
};

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      SessionContinuity.init();

      // Hook into quiz events if available
      if (typeof quiz !== 'undefined') {
        // Hook into quiz start to track topics
        const originalLoadBank = quiz.loadBank;
        if (originalLoadBank) {
          quiz.loadBank = function(...args) {
            const result = originalLoadBank.apply(this, args);
            // Track the topic
            if (this.currentBankName) {
              SessionContinuity.trackTopic(this.currentBankName, args[0] || 'unknown');
            }
            return result;
          };
        }
      }

      // Hook into ConfusedWords if available
      if (typeof ConfusedWords !== 'undefined') {
        const originalFlagWord = ConfusedWords.flagWord;
        ConfusedWords.flagWord = function(...args) {
          const result = originalFlagWord.apply(this, args);
          SessionContinuity.trackConfusedWord();
          return result;
        };
      }
    }, 800);
  });
}

// Global access
if (typeof window !== 'undefined') {
  window.SessionContinuity = SessionContinuity;
}
