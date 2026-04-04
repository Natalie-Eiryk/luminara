#!/usr/bin/env node
/**
 * build-mobile.js - Sync mobile.html from index.html
 *
 * Run: node build-mobile.js
 *
 * This script:
 * 1. Reads index.html as the source of truth
 * 2. Applies mobile-specific transformations
 * 3. Injects mobile QOL features (FAB, swipe, haptics, etc.)
 * 4. Outputs mobile.html
 *
 * Develop on index.html only, then run this to sync mobile.
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, 'index.html');
const MOBILE_FILE = path.join(__dirname, 'mobile.html');
const VERSION = new Date().toISOString().split('T')[0].replace(/-/g, '.');

console.log('🔄 Building mobile.html from index.html...\n');

// Read source
let html = fs.readFileSync(INDEX_FILE, 'utf8');

// ============================================================
// TRANSFORMATION 1: Update meta tags for mobile
// ============================================================
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">'
);

// Add mobile-specific meta tags after viewport if not present
if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace(
    /(<meta name="viewport"[^>]*>)/,
    `$1
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Luminara Quiz">`
  );
}

// ============================================================
// TRANSFORMATION 2: Update title and OG tags
// ============================================================
html = html.replace(
  /<title>[^<]*<\/title>/,
  "<title>Ms. Luminara's Quiz Lab - Mobile</title>"
);

html = html.replace(
  /og:title" content="[^"]*"/,
  'og:title" content="Ms. Luminara\'s Quiz Lab - Mobile"'
);

html = html.replace(
  /og:url" content="[^"]*"/,
  'og:url" content="https://luminara.natalie-eiryk.com/mobile.html"'
);

// ============================================================
// TRANSFORMATION 3: Inject mobile QOL CSS before </head>
// ============================================================
const mobileCSS = `
  <!-- Mobile QOL Features CSS (auto-generated) -->
  <style id="mobile-qol-css">
    /* ==================== QOL FEATURE 1: OFFLINE INDICATOR ==================== */
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      z-index: 9999;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .offline-banner.visible { transform: translateY(0); }
    .offline-banner .pulse { animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

    /* ==================== QOL FEATURE 2: FLOATING ACTION BUTTON ==================== */
    .fab-container {
      position: fixed;
      bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
      right: 1rem;
      z-index: 500;
    }
    .fab-main {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--glow-warm) 0%, #d4976a 100%);
      border: none;
      color: #1a1612;
      font-size: 1.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .fab-main:active { transform: scale(0.92); }
    .fab-main.open { transform: rotate(45deg); }
    .fab-actions {
      position: absolute;
      bottom: 64px;
      right: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px);
      transition: opacity 0.2s, transform 0.2s;
    }
    .fab-actions.visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
    .fab-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      color: var(--text-primary);
      font-size: 0.8rem;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .fab-action:active { background: var(--bg-deep); }
    .fab-action-icon { font-size: 1.1rem; }

    /* ==================== QOL FEATURE 3: BOTTOM SHEET ==================== */
    .bottom-sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    .bottom-sheet-overlay.visible { opacity: 1; pointer-events: auto; }
    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border-radius: 16px 16px 0 0;
      padding: 1rem;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
      z-index: 1000;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      max-height: 70vh;
      overflow-y: auto;
    }
    .bottom-sheet.visible { transform: translateY(0); }
    .bottom-sheet-handle {
      width: 40px;
      height: 4px;
      background: var(--border);
      border-radius: 2px;
      margin: 0 auto 1rem;
    }
    .bottom-sheet-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      text-align: center;
    }
    .bottom-sheet-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s;
    }
    .bottom-sheet-option:active { background: var(--bg-deep); }
    .bottom-sheet-option-icon { font-size: 1.3rem; }
    .bottom-sheet-option-text { flex: 1; }
    .bottom-sheet-option-label { font-weight: 500; color: var(--text-primary); }
    .bottom-sheet-option-desc { font-size: 0.75rem; color: var(--text-dim); margin-top: 0.1rem; }

    /* ==================== QOL FEATURE 4: SWIPE INDICATORS ==================== */
    .swipe-hint {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      font-size: 2rem;
      color: var(--glow-warm);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 200;
    }
    .swipe-hint.left { left: 1rem; }
    .swipe-hint.right { right: 1rem; }
    .swipe-hint.visible { opacity: 0.6; }

    /* ==================== QOL FEATURE 5: PULL TO REFRESH ==================== */
    .pull-indicator {
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 0 0 12px 12px;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 150;
      transition: transform 0.2s;
    }
    .pull-indicator.pulling { transform: translateX(-50%) translateY(0); }
    .pull-indicator .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--glow-warm);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ==================== QOL FEATURE 6: TOAST NOTIFICATIONS ==================== */
    .toast-container {
      position: fixed;
      bottom: calc(5rem + env(safe-area-inset-bottom, 0px));
      left: 50%;
      transform: translateX(-50%);
      z-index: 800;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      animation: toastIn 0.3s ease, toastOut 0.3s ease 2.7s forwards;
      pointer-events: auto;
    }
    @keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateY(-10px); } }
    .toast-icon { font-size: 1.2rem; }
    .toast-text { font-size: 0.85rem; color: var(--text-primary); }
    .toast.success { border-color: var(--correct); }
    .toast.error { border-color: var(--incorrect); }

    /* ==================== QOL FEATURE 7: QUICK STUDY TIMER ==================== */
    .study-timer {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 0.5rem);
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 0.4rem 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      z-index: 95;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .study-timer.visible { opacity: 1; }
    .study-timer-icon { font-size: 0.9rem; }
    .study-timer-time { font-variant-numeric: tabular-nums; font-weight: 600; color: var(--glow-warm); }
  </style>
`;

html = html.replace('</head>', mobileCSS + '\n</head>');

// ============================================================
// TRANSFORMATION 4: Inject mobile QOL HTML before </body>
// ============================================================
const mobileHTML = `
  <!-- ==================== MOBILE QOL FEATURES (auto-generated) ==================== -->

  <!-- QOL 1: OFFLINE INDICATOR -->
  <div class="offline-banner" id="offlineBanner">
    <span class="pulse">⚠️</span>
    <span>You're offline - Progress saved locally</span>
  </div>

  <!-- QOL 2: FLOATING ACTION BUTTON -->
  <div class="fab-container" id="fabContainer">
    <div class="fab-actions" id="fabActions">
      <button class="fab-action" onclick="MobileQOL.quickAction('random')">
        <span class="fab-action-icon">🎲</span> Random Question
      </button>
      <button class="fab-action" onclick="MobileQOL.quickAction('bookmark')">
        <span class="fab-action-icon">🔖</span> Bookmarks
      </button>
      <button class="fab-action" onclick="MobileQOL.quickAction('timer')">
        <span class="fab-action-icon">⏱️</span> Study Timer
      </button>
      <button class="fab-action" onclick="MobileQOL.quickAction('settings')">
        <span class="fab-action-icon">⚙️</span> Settings
      </button>
    </div>
    <button class="fab-main" id="fabMain" onclick="MobileQOL.toggleFab()">✚</button>
  </div>

  <!-- QOL 3: BOTTOM SHEET -->
  <div class="bottom-sheet-overlay" id="bottomSheetOverlay" onclick="MobileQOL.closeBottomSheet()"></div>
  <div class="bottom-sheet" id="bottomSheet">
    <div class="bottom-sheet-handle"></div>
    <div class="bottom-sheet-title" id="bottomSheetTitle">Options</div>
    <div class="bottom-sheet-content" id="bottomSheetContent"></div>
  </div>

  <!-- QOL 4: SWIPE INDICATORS -->
  <div class="swipe-hint left" id="swipeLeft">‹</div>
  <div class="swipe-hint right" id="swipeRight">›</div>

  <!-- QOL 5: PULL TO REFRESH -->
  <div class="pull-indicator" id="pullIndicator">
    <div class="spinner-small"></div>
    <span>Refreshing...</span>
  </div>

  <!-- QOL 6: TOAST CONTAINER -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- QOL 7: STUDY TIMER -->
  <div class="study-timer" id="studyTimer">
    <span class="study-timer-icon">⏱️</span>
    <span class="study-timer-time" id="studyTimerTime">00:00</span>
  </div>

  <!-- Mobile QOL Controller Script -->
  <script id="mobile-qol-script">
    const MobileQOL = {
      fabOpen: false,
      bottomSheetOpen: false,
      studyTimerActive: false,
      studyTimerSeconds: 0,
      studyTimerInterval: null,
      touchStartX: 0,
      touchStartY: 0,
      pullStartY: 0,
      isPulling: false,

      init() {
        this.setupOfflineDetection();
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupHaptics();
        this.loadBookmarks();
        console.log('[MobileQOL] 7 quality-of-life features initialized');
      },

      setupOfflineDetection() {
        const banner = document.getElementById('offlineBanner');
        const updateStatus = () => {
          if (!navigator.onLine) {
            banner.classList.add('visible');
            this.showToast('📴 You are offline', 'warning');
          } else {
            banner.classList.remove('visible');
          }
        };
        window.addEventListener('online', () => {
          updateStatus();
          this.showToast('✅ Back online!', 'success');
        });
        window.addEventListener('offline', updateStatus);
        updateStatus();
      },

      toggleFab() {
        this.fabOpen = !this.fabOpen;
        document.getElementById('fabMain').classList.toggle('open', this.fabOpen);
        document.getElementById('fabActions').classList.toggle('visible', this.fabOpen);
        this.haptic('light');
      },

      quickAction(action) {
        this.toggleFab();
        this.haptic('medium');
        switch(action) {
          case 'random':
            if (typeof quiz !== 'undefined' && quiz.questions?.length) {
              const idx = Math.floor(Math.random() * quiz.questions.length);
              quiz.goToQuestion(idx);
              this.showToast('🎲 Random question loaded!', 'success');
            } else {
              this.showToast('📚 Start a study session first', 'info');
            }
            break;
          case 'bookmark': this.showBookmarksSheet(); break;
          case 'timer': this.toggleStudyTimer(); break;
          case 'settings': this.showSettingsSheet(); break;
        }
      },

      showBottomSheet(title, content) {
        document.getElementById('bottomSheetTitle').textContent = title;
        document.getElementById('bottomSheetContent').innerHTML = content;
        document.getElementById('bottomSheetOverlay').classList.add('visible');
        document.getElementById('bottomSheet').classList.add('visible');
        this.bottomSheetOpen = true;
        this.haptic('light');
      },

      closeBottomSheet() {
        document.getElementById('bottomSheetOverlay').classList.remove('visible');
        document.getElementById('bottomSheet').classList.remove('visible');
        this.bottomSheetOpen = false;
      },

      showBookmarksSheet() {
        const bookmarks = JSON.parse(localStorage.getItem('luminara_bookmarks') || '[]');
        let content = bookmarks.length === 0
          ? '<div style="text-align:center;padding:2rem;color:var(--text-dim);">No bookmarks yet.<br>Long-press a question to bookmark it!</div>'
          : bookmarks.map((b, i) => \`
              <div class="bottom-sheet-option" onclick="MobileQOL.goToBookmark(\${i})">
                <span class="bottom-sheet-option-icon">🔖</span>
                <div class="bottom-sheet-option-text">
                  <div class="bottom-sheet-option-label">\${b.q.substring(0, 50)}...</div>
                  <div class="bottom-sheet-option-desc">\${b.category || 'Question'}</div>
                </div>
              </div>
            \`).join('');
        this.showBottomSheet('📚 Bookmarks', content);
      },

      showSettingsSheet() {
        const hapticEnabled = localStorage.getItem('luminara_haptics') !== 'false';
        const soundEnabled = localStorage.getItem('luminara_sounds') !== 'false';
        const timerVisible = localStorage.getItem('luminara_timer_visible') === 'true';
        const content = \`
          <div class="bottom-sheet-option" onclick="MobileQOL.toggleSetting('haptics')">
            <span class="bottom-sheet-option-icon">📳</span>
            <div class="bottom-sheet-option-text">
              <div class="bottom-sheet-option-label">Haptic Feedback</div>
              <div class="bottom-sheet-option-desc">Vibration on interactions</div>
            </div>
            <span style="color:\${hapticEnabled ? 'var(--correct)' : 'var(--text-dim)'}">\${hapticEnabled ? '✓ On' : 'Off'}</span>
          </div>
          <div class="bottom-sheet-option" onclick="MobileQOL.toggleSetting('sounds')">
            <span class="bottom-sheet-option-icon">🔊</span>
            <div class="bottom-sheet-option-text">
              <div class="bottom-sheet-option-label">Sound Effects</div>
              <div class="bottom-sheet-option-desc">Audio feedback</div>
            </div>
            <span style="color:\${soundEnabled ? 'var(--correct)' : 'var(--text-dim)'}">\${soundEnabled ? '✓ On' : 'Off'}</span>
          </div>
          <div class="bottom-sheet-option" onclick="MobileQOL.toggleSetting('timer')">
            <span class="bottom-sheet-option-icon">⏱️</span>
            <div class="bottom-sheet-option-text">
              <div class="bottom-sheet-option-label">Always Show Timer</div>
              <div class="bottom-sheet-option-desc">Display study timer</div>
            </div>
            <span style="color:\${timerVisible ? 'var(--correct)' : 'var(--text-dim)'}">\${timerVisible ? '✓ On' : 'Off'}</span>
          </div>
          <div class="bottom-sheet-option" onclick="MobileQOL.clearCache()">
            <span class="bottom-sheet-option-icon">🗑️</span>
            <div class="bottom-sheet-option-text">
              <div class="bottom-sheet-option-label">Clear Cache</div>
              <div class="bottom-sheet-option-desc">Force refresh all data</div>
            </div>
          </div>
        \`;
        this.showBottomSheet('⚙️ Settings', content);
      },

      toggleSetting(setting) {
        const key = \`luminara_\${setting === 'timer' ? 'timer_visible' : setting}\`;
        const current = localStorage.getItem(key);
        localStorage.setItem(key, current === 'false' || current === null ? 'true' : 'false');
        this.haptic('light');
        this.showSettingsSheet();
        if (setting === 'timer' && localStorage.getItem(key) === 'true') {
          document.getElementById('studyTimer').classList.add('visible');
        }
      },

      clearCache() {
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage('clearCache');
        }
        this.showToast('🗑️ Cache cleared - reloading...', 'success');
        setTimeout(() => location.reload(true), 1000);
      },

      goToBookmark(index) {
        const bookmarks = JSON.parse(localStorage.getItem('luminara_bookmarks') || '[]');
        if (bookmarks[index] && typeof quiz !== 'undefined' && quiz.questions) {
          const idx = quiz.questions.findIndex(q => q.id === bookmarks[index].id);
          if (idx >= 0) {
            quiz.goToQuestion(idx);
            this.closeBottomSheet();
            this.showToast('🔖 Jumped to bookmark', 'success');
            return;
          }
        }
        this.showToast('❌ Bookmark not found in current set', 'error');
      },

      loadBookmarks() {
        document.addEventListener('contextmenu', (e) => {
          if (e.target.closest('.question-card') || e.target.closest('#questionArea')) {
            e.preventDefault();
            this.bookmarkCurrentQuestion();
          }
        });
      },

      bookmarkCurrentQuestion() {
        if (typeof quiz === 'undefined' || !quiz.questions?.[quiz.currentQuestionIndex]) {
          this.showToast('📚 No question to bookmark', 'info');
          return;
        }
        const q = quiz.questions[quiz.currentQuestionIndex];
        const bookmarks = JSON.parse(localStorage.getItem('luminara_bookmarks') || '[]');
        const exists = bookmarks.findIndex(b => b.id === q.id);
        if (exists >= 0) {
          bookmarks.splice(exists, 1);
          this.showToast('🔖 Bookmark removed', 'info');
        } else {
          bookmarks.push({ id: q.id, q: q.q, category: q._category || '' });
          this.showToast('🔖 Question bookmarked!', 'success');
        }
        localStorage.setItem('luminara_bookmarks', JSON.stringify(bookmarks));
        this.haptic('medium');
      },

      setupSwipeGestures() {
        document.body.addEventListener('touchstart', (e) => {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.body.addEventListener('touchmove', (e) => {
          if (!this.touchStartX) return;
          const diffX = e.touches[0].clientX - this.touchStartX;
          const diffY = Math.abs(e.touches[0].clientY - this.touchStartY);
          if (Math.abs(diffX) > 30 && diffY < 50) {
            document.getElementById('swipeLeft').classList.toggle('visible', diffX > 0);
            document.getElementById('swipeRight').classList.toggle('visible', diffX < 0);
          }
        }, { passive: true });

        document.body.addEventListener('touchend', (e) => {
          const diffX = e.changedTouches[0].clientX - this.touchStartX;
          const diffY = Math.abs(e.changedTouches[0].clientY - this.touchStartY);
          document.getElementById('swipeLeft').classList.remove('visible');
          document.getElementById('swipeRight').classList.remove('visible');
          if (Math.abs(diffX) > 80 && diffY < 80 && typeof quiz !== 'undefined') {
            if (diffX > 0 && typeof prevQuestion === 'function') { prevQuestion(); this.haptic('light'); }
            else if (diffX < 0 && typeof nextQuestion === 'function') { nextQuestion(); this.haptic('light'); }
          }
          this.touchStartX = 0;
          this.touchStartY = 0;
        }, { passive: true });
      },

      setupPullToRefresh() {
        const reviewArea = document.getElementById('reviewArea');
        if (!reviewArea) return;
        reviewArea.addEventListener('touchstart', (e) => {
          if (reviewArea.scrollTop === 0) { this.pullStartY = e.touches[0].clientY; this.isPulling = true; }
        }, { passive: true });
        reviewArea.addEventListener('touchmove', (e) => {
          if (!this.isPulling) return;
          if (e.touches[0].clientY - this.pullStartY > 60) {
            document.getElementById('pullIndicator').classList.add('pulling');
          }
        }, { passive: true });
        reviewArea.addEventListener('touchend', (e) => {
          if (!this.isPulling) return;
          document.getElementById('pullIndicator').classList.remove('pulling');
          if (e.changedTouches[0].clientY - this.pullStartY > 80) {
            this.haptic('medium');
            if (typeof QuizModes !== 'undefined') { QuizModes.initReview(); this.showToast('🔄 Reviews refreshed!', 'success'); }
          }
          this.isPulling = false;
        }, { passive: true });
      },

      showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = \`toast \${type}\`;
        const icons = { success: '✓', error: '✕', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = \`<span class="toast-icon">\${icons[type] || icons.info}</span><span class="toast-text">\${message}</span>\`;
        container.appendChild(toast);
        this.haptic('light');
        setTimeout(() => toast.remove(), 3000);
      },

      toggleStudyTimer() {
        if (this.studyTimerActive) { this.stopStudyTimer(); } else { this.startStudyTimer(); }
      },

      startStudyTimer() {
        this.studyTimerActive = true;
        this.studyTimerSeconds = 0;
        document.getElementById('studyTimer').classList.add('visible');
        this.updateTimerDisplay();
        this.studyTimerInterval = setInterval(() => { this.studyTimerSeconds++; this.updateTimerDisplay(); }, 1000);
        this.showToast('⏱️ Study timer started!', 'success');
      },

      stopStudyTimer() {
        this.studyTimerActive = false;
        clearInterval(this.studyTimerInterval);
        const mins = Math.floor(this.studyTimerSeconds / 60);
        const secs = this.studyTimerSeconds % 60;
        this.showToast(\`⏱️ Studied for \${mins}m \${secs}s\`, 'success');
        if (localStorage.getItem('luminara_timer_visible') !== 'true') {
          document.getElementById('studyTimer').classList.remove('visible');
        }
      },

      updateTimerDisplay() {
        const mins = Math.floor(this.studyTimerSeconds / 60);
        const secs = this.studyTimerSeconds % 60;
        document.getElementById('studyTimerTime').textContent = \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
      },

      setupHaptics() {
        document.addEventListener('click', (e) => {
          if (e.target.closest('.option-btn') || e.target.closest('.blitz-option')) { this.haptic('medium'); }
        });
      },

      haptic(style = 'light') {
        if (localStorage.getItem('luminara_haptics') === 'false') return;
        if ('vibrate' in navigator) {
          const patterns = { light: [10], medium: [20], heavy: [30], success: [10, 50, 10], error: [50, 30, 50] };
          navigator.vibrate(patterns[style] || patterns.light);
        }
      }
    };

    document.addEventListener('DOMContentLoaded', () => setTimeout(() => MobileQOL.init(), 800));
  </script>

  <!-- Build Timestamp (auto-generated) -->
  <div id="buildTimestamp" style="position: fixed; bottom: 5px; right: 10px; font-size: 10px; color: rgba(255,255,255,0.3); pointer-events: none; z-index: 9999;">
    Mobile ${VERSION} | Auto-synced from index.html
  </div>
`;

// Find the closing body tag and insert before it
html = html.replace('</body>', mobileHTML + '\n</body>');

// ============================================================
// TRANSFORMATION 5: Update any existing build timestamp
// ============================================================
html = html.replace(
  /id="buildTimestamp"[^>]*>[^<]*<\/div>/g,
  `id="buildTimestamp" style="position: fixed; bottom: 5px; right: 10px; font-size: 10px; color: rgba(255,255,255,0.3); pointer-events: none; z-index: 9999;">Mobile ${VERSION} | Auto-synced from index.html</div>`
);

// ============================================================
// Write output
// ============================================================
fs.writeFileSync(MOBILE_FILE, html, 'utf8');

console.log('✅ mobile.html generated successfully!');
console.log(`   Source: ${INDEX_FILE}`);
console.log(`   Output: ${MOBILE_FILE}`);
console.log(`   Version: ${VERSION}`);
console.log('\n📱 Mobile QOL features injected:');
console.log('   1. Offline indicator banner');
console.log('   2. Floating action button (FAB)');
console.log('   3. Bottom sheet menus');
console.log('   4. Swipe gesture navigation');
console.log('   5. Pull-to-refresh');
console.log('   6. Toast notifications');
console.log('   7. Study timer');
console.log('\n💡 Tip: Run this after editing index.html to keep mobile in sync.');
