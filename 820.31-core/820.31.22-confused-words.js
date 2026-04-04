/**
 * Ms. Luminara Quiz - Confused Words System v1.0
 * Allows users to right-click words they don't understand to:
 * 1. Flag them for later review
 * 2. See definitions (if available in VocabHelper)
 * 3. Review all flagged words in a dedicated panel
 *
 * @module ConfusedWords
 * @version 1.0.0
 */

const ConfusedWords = {
  // Storage key for confused words
  STORAGE_KEY: 'ms_luminara_confused_words',

  // Loaded words: { word: { word, definition, context, questionId, flaggedAt, reviewed } }
  words: {},

  // Context menu element
  contextMenu: null,

  // Currently selected word
  selectedWord: '',
  selectedRange: null,

  /**
   * Initialize the confused words system
   */
  init() {
    this.loadWords();
    this.createContextMenu();
    this.setupEventListeners();
    console.log(`[ConfusedWords] Initialized with ${Object.keys(this.words).length} flagged words`);
  },

  /**
   * Load words from localStorage
   */
  loadWords() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.words = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[ConfusedWords] Failed to load:', e);
      this.words = {};
    }
  },

  /**
   * Save words to localStorage
   */
  saveWords() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.words));
    } catch (e) {
      console.error('[ConfusedWords] Failed to save:', e);
    }
  },

  /**
   * Create the context menu element
   */
  createContextMenu() {
    // Remove existing if present
    const existing = document.getElementById('confused-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = 'confused-context-menu';
    menu.className = 'confused-context-menu';
    menu.innerHTML = `
      <div class="confused-menu-item" data-action="flag">
        <span class="menu-icon">&#x1F6A9;</span>
        <span class="menu-text">Flag this word</span>
      </div>
      <div class="confused-menu-item" data-action="lookup">
        <span class="menu-icon">&#x1F50D;</span>
        <span class="menu-text">Look up definition</span>
      </div>
      <div class="confused-menu-divider"></div>
      <div class="confused-menu-item" data-action="review">
        <span class="menu-icon">&#x1F4DA;</span>
        <span class="menu-text">Review flagged words</span>
        <span class="menu-badge" id="confused-count-badge">0</span>
      </div>
    `;

    document.body.appendChild(menu);
    this.contextMenu = menu;

    // Update badge count
    this.updateBadgeCount();

    // Menu item clicks
    menu.querySelectorAll('.confused-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = item.dataset.action;
        this.handleMenuAction(action);
        this.hideContextMenu();
      });
    });
  },

  /**
   * Setup event listeners for right-click
   */
  setupEventListeners() {
    // Right-click handler
    document.addEventListener('contextmenu', (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      // Only show menu if text is selected and it's a reasonable word
      if (selectedText && selectedText.length >= 2 && selectedText.length <= 50 && !selectedText.includes(' ')) {
        e.preventDefault();
        this.selectedWord = selectedText;
        this.selectedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
        this.showContextMenu(e.clientX, e.clientY);
      } else if (selectedText && selectedText.includes(' ') && selectedText.split(' ').length <= 4) {
        // Allow short phrases (up to 4 words)
        e.preventDefault();
        this.selectedWord = selectedText;
        this.selectedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
        this.showContextMenu(e.clientX, e.clientY);
      }
    });

    // Hide menu on click outside
    document.addEventListener('click', (e) => {
      if (!this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
      }
    });

    // Hide menu on scroll
    document.addEventListener('scroll', () => {
      this.hideContextMenu();
    }, true);

    // Hide menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideContextMenu();
      }
    });
  },

  /**
   * Show context menu at position
   */
  showContextMenu(x, y) {
    const menu = this.contextMenu;

    // Update badge
    this.updateBadgeCount();

    // Position menu
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add('visible');

    // Adjust if off-screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  },

  /**
   * Hide context menu
   */
  hideContextMenu() {
    this.contextMenu.classList.remove('visible');
  },

  /**
   * Handle menu action
   */
  handleMenuAction(action) {
    switch (action) {
      case 'flag':
        this.flagWord(this.selectedWord);
        break;
      case 'lookup':
        this.lookupAndFlag(this.selectedWord);
        break;
      case 'review':
        this.showReviewPanel();
        break;
    }
  },

  /**
   * Flag a word (save + show definition if available)
   */
  flagWord(word) {
    if (!word) return;

    const wordLower = word.toLowerCase();

    // Get definition from VocabHelper if available
    let definition = '';
    if (typeof VocabHelper !== 'undefined' && VocabHelper.loaded) {
      const vocabData = VocabHelper.getDefinition(word);
      if (vocabData) {
        definition = vocabData.definition;
      }
    }

    // Get context (surrounding text)
    let context = '';
    if (this.selectedRange) {
      try {
        const container = this.selectedRange.commonAncestorContainer;
        const textContent = container.textContent || container.innerText || '';
        const wordIndex = textContent.toLowerCase().indexOf(wordLower);
        if (wordIndex !== -1) {
          const start = Math.max(0, wordIndex - 30);
          const end = Math.min(textContent.length, wordIndex + word.length + 30);
          context = (start > 0 ? '...' : '') +
                    textContent.substring(start, end).trim() +
                    (end < textContent.length ? '...' : '');
        }
      } catch (e) {}
    }

    // Get current question ID if available
    let questionId = '';
    if (typeof quiz !== 'undefined' && quiz.currentQuestion) {
      questionId = quiz.currentQuestion.id || '';
    }

    // Save word
    this.words[wordLower] = {
      word: word,
      definition: definition,
      context: context,
      questionId: questionId,
      flaggedAt: new Date().toISOString(),
      reviewed: false
    };

    this.saveWords();
    this.updateBadgeCount();

    // Show confirmation popup
    this.showFlaggedPopup(word, definition);
  },

  /**
   * Look up word and flag it
   */
  lookupAndFlag(word) {
    this.flagWord(word);
  },

  /**
   * Show popup when word is flagged
   */
  showFlaggedPopup(word, definition) {
    // Remove existing popup
    const existing = document.querySelector('.confused-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'confused-popup';

    if (definition) {
      popup.innerHTML = `
        <div class="popup-header">
          <span class="popup-icon">&#x1F6A9;</span>
          <span class="popup-title">Flagged: ${this.escapeHtml(word)}</span>
        </div>
        <div class="popup-definition">${this.escapeHtml(definition)}</div>
        <div class="popup-footer">Saved to your review list</div>
      `;
    } else {
      popup.innerHTML = `
        <div class="popup-header">
          <span class="popup-icon">&#x1F6A9;</span>
          <span class="popup-title">Flagged: ${this.escapeHtml(word)}</span>
        </div>
        <div class="popup-no-def">No definition found in vocabulary database</div>
        <div class="popup-footer">Saved to your review list for manual lookup</div>
      `;
    }

    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
      popup.classList.add('visible');
    });

    // Auto-remove after 4 seconds
    setTimeout(() => {
      popup.classList.remove('visible');
      setTimeout(() => popup.remove(), 300);
    }, 4000);
  },

  /**
   * Show the review panel with all flagged words
   */
  showReviewPanel() {
    // Remove existing panel
    const existing = document.querySelector('.confused-review-panel');
    if (existing) existing.remove();

    const wordList = Object.values(this.words).sort((a, b) =>
      new Date(b.flaggedAt) - new Date(a.flaggedAt)
    );

    const panel = document.createElement('div');
    panel.className = 'confused-review-panel';

    if (wordList.length === 0) {
      panel.innerHTML = `
        <div class="review-panel-header">
          <h2>Confused Words</h2>
          <button class="review-close-btn" data-action="close">&times;</button>
        </div>
        <div class="review-empty">
          <div class="empty-icon">&#x1F4AD;</div>
          <p>No words flagged yet</p>
          <p class="empty-hint">Right-click any word you don't understand to flag it</p>
        </div>
      `;
    } else {
      panel.innerHTML = `
        <div class="review-panel-header">
          <h2>Confused Words <span class="word-count">(${wordList.length})</span></h2>
          <button class="review-close-btn" data-action="close">&times;</button>
        </div>
        <div class="review-actions">
          <button class="review-action-btn" data-action="export">
            <span>&#x1F4E4;</span> Export
          </button>
          <button class="review-action-btn danger" data-action="clear-all">
            <span>&#x1F5D1;</span> Clear All
          </button>
        </div>
        <div class="review-word-list">
          ${wordList.map(w => this.renderWordCard(w)).join('')}
        </div>
      `;
    }

    document.body.appendChild(panel);

    // Attach event listeners
    const closeBtn = panel.querySelector('.review-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeReviewPanel());
    }

    const exportBtn = panel.querySelector('[data-action="export"]');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportWords());
    }

    const clearBtn = panel.querySelector('[data-action="clear-all"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllWords());
    }

    // Attach listeners to word cards
    panel.querySelectorAll('.review-word-card').forEach(card => {
      const wordLower = card.dataset.word;

      const reviewBtn = card.querySelector('[data-action="mark-reviewed"]');
      if (reviewBtn) {
        reviewBtn.addEventListener('click', () => this.markReviewed(wordLower));
      }

      const deleteBtn = card.querySelector('[data-action="delete"]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.removeWord(wordLower));
      }
    });

    // Animate in
    requestAnimationFrame(() => {
      panel.classList.add('visible');
    });
  },

  /**
   * Render a single word card
   */
  renderWordCard(wordData) {
    const hasDefinition = wordData.definition && wordData.definition.length > 0;
    const flaggedDate = new Date(wordData.flaggedAt).toLocaleDateString();

    return `
      <div class="review-word-card ${wordData.reviewed ? 'reviewed' : ''}" data-word="${this.escapeHtml(wordData.word.toLowerCase())}">
        <div class="word-card-header">
          <span class="word-term">${this.escapeHtml(wordData.word)}</span>
          <div class="word-actions">
            ${!wordData.reviewed ? `
              <button class="word-action-btn" data-action="mark-reviewed" title="Mark as reviewed">
                &#x2714;
              </button>
            ` : `
              <span class="reviewed-badge">&#x2714; Reviewed</span>
            `}
            <button class="word-action-btn delete" data-action="delete" title="Remove">
              &#x1F5D1;
            </button>
          </div>
        </div>
        ${hasDefinition ? `
          <div class="word-definition">${this.escapeHtml(wordData.definition)}</div>
        ` : `
          <div class="word-no-definition">
            <a href="https://www.google.com/search?q=define+${encodeURIComponent(wordData.word)}" target="_blank" rel="noopener">
              Search definition &#x2197;
            </a>
          </div>
        `}
        ${wordData.context ? `
          <div class="word-context">"${this.escapeHtml(wordData.context)}"</div>
        ` : ''}
        <div class="word-meta">Flagged ${flaggedDate}</div>
      </div>
    `;
  },

  /**
   * Close the review panel
   */
  closeReviewPanel() {
    const panel = document.querySelector('.confused-review-panel');
    if (panel) {
      panel.classList.remove('visible');
      setTimeout(() => panel.remove(), 300);
    }
  },

  /**
   * Mark a word as reviewed
   */
  markReviewed(wordLower) {
    if (this.words[wordLower]) {
      this.words[wordLower].reviewed = true;
      this.saveWords();

      // Update the card in the panel
      const card = document.querySelector(`.review-word-card[data-word="${wordLower}"]`);
      if (card) {
        card.classList.add('reviewed');
        const header = card.querySelector('.word-actions');
        if (header) {
          header.innerHTML = `
            <span class="reviewed-badge">&#x2714; Reviewed</span>
            <button class="word-action-btn delete" data-action="delete" title="Remove">
              &#x1F5D1;
            </button>
          `;

          // Re-attach delete button listener
          const deleteBtn = header.querySelector('[data-action="delete"]');
          if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.removeWord(wordLower));
          }
        }
      }
    }
  },

  /**
   * Remove a word from the list
   */
  removeWord(wordLower) {
    if (this.words[wordLower]) {
      delete this.words[wordLower];
      this.saveWords();
      this.updateBadgeCount();

      // Remove the card from the panel
      const card = document.querySelector(`.review-word-card[data-word="${wordLower}"]`);
      if (card) {
        card.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
          card.remove();

          // Check if list is now empty
          const list = document.querySelector('.review-word-list');
          if (list && list.children.length === 0) {
            this.showReviewPanel(); // Re-render with empty state
          }

          // Update count in header
          const countEl = document.querySelector('.review-panel-header .word-count');
          if (countEl) {
            countEl.textContent = `(${Object.keys(this.words).length})`;
          }
        }, 300);
      }
    }
  },

  /**
   * Clear all words
   */
  clearAllWords() {
    if (confirm('Are you sure you want to clear all flagged words? This cannot be undone.')) {
      this.words = {};
      this.saveWords();
      this.updateBadgeCount();
      this.showReviewPanel(); // Re-render with empty state
    }
  },

  /**
   * Export words to JSON file
   */
  exportWords() {
    const data = {
      exportedAt: new Date().toISOString(),
      wordCount: Object.keys(this.words).length,
      words: Object.values(this.words)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `confused-words-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Update the badge count in context menu
   */
  updateBadgeCount() {
    const badge = document.getElementById('confused-count-badge');
    if (badge) {
      const count = Object.keys(this.words).length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
  },

  /**
   * Get count of flagged words
   */
  getCount() {
    return Object.keys(this.words).length;
  },

  /**
   * Get count of unreviewed words
   */
  getUnreviewedCount() {
    return Object.values(this.words).filter(w => !w.reviewed).length;
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
};

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure other modules load first
    setTimeout(() => {
      ConfusedWords.init();
    }, 600);
  });
}

// Global access
if (typeof window !== 'undefined') {
  window.ConfusedWords = ConfusedWords;
}
