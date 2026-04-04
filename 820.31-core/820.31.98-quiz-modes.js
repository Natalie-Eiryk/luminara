/**
 * 820.31.98-quiz-modes.js - Quiz Mode Manager
 * @codon 820.31.98
 * @version 2026-04-02
 * @description Manages Blitz, Lightning, Jeopardy, and Review modes
 *              Integrates with the existing LuminaraQuiz system
 *
 * Extracted from inline script for CSP compliance (no 'unsafe-inline' needed)
 */

const QuizModes = {
  questions: [],
  srsData: {},
  currentMode: 'study',
  mentorStyles: ['luminara', 'frizzle', 'feynman'],
  wrongHistory: {},

  // Blitz state
  blitz: { active: false, timer: 60, score: 0, index: 0, interval: null },

  // Lightning state
  lightning: { active: false, index: 0, strikes: 3, results: [], maxQuestions: 10 },

  // Jeopardy state
  jeopardy: { index: 0, score: 0 },

  // ==================== INIT ====================
  async init() {
    try {
      this.loadSrsData();
      await this.loadAllQuestions();
      this.setupModeNavigation();
      this.updateDueBadge();
      console.log('[QuizModes] Initialized with', this.questions.length, 'questions');
    } catch (e) {
      console.error('[QuizModes] Init failed:', e);
    }
  },

  loadSrsData() {
    try {
      const srs = localStorage.getItem('luminara_srs_data');
      const wrong = localStorage.getItem('luminara_wrong_history');
      if (srs) this.srsData = JSON.parse(srs);
      if (wrong) this.wrongHistory = JSON.parse(wrong);
    } catch (e) {
      console.warn('[QuizModes] Failed to load SRS data:', e);
      this.srsData = {};
      this.wrongHistory = {};
    }
  },

  saveSrsData() {
    localStorage.setItem('luminara_srs_data', JSON.stringify(this.srsData));
    localStorage.setItem('luminara_wrong_history', JSON.stringify(this.wrongHistory));
  },

  async loadAllQuestions() {
    try {
      const registry = await fetch('820.31-core/820.31-question-registry.json').then(r => r.json());
      for (const cat of registry.categories) {
        for (const bank of cat.banks) {
          try {
            const data = await fetch(`${cat.folder}/${bank.file}`).then(r => r.json());
            if (data.questions) {
              data.questions.forEach(q => {
                q._category = cat.name;
                q._bank = bank.title || bank.name;
                this.questions.push(q);
              });
            }
          } catch (e) {}
        }
      }
      this.shuffleArray(this.questions);
    } catch (e) {
      console.error('Failed to load questions:', e);
    }
  },

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  // ==================== MODE NAVIGATION ====================
  setupModeNavigation() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        this.switchMode(mode);
      });
    });
  },

  switchMode(mode) {
    this.currentMode = mode;

    // Update tabs
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

    // Update containers
    document.querySelectorAll('.module-container').forEach(c => c.classList.remove('active'));
    document.getElementById(`module-${mode}`)?.classList.add('active');

    // Special handling for Study mode - restore original landing/studyView visibility
    if (mode === 'study') {
      const landing = document.getElementById('landing');
      const studyView = document.getElementById('studyView');
      // If studyView is active (user was in a quiz), keep it visible
      // Otherwise show landing
      if (!studyView.classList.contains('active')) {
        landing.classList.remove('hidden');
      }
    }

    // Initialize mode
    if (mode === 'review') this.initReview();
    if (mode === 'jeopardy') this.initJeopardy();
    if (mode === 'stats') this.renderStats();
    if (mode === 'testprep') this.initTestPrep();
  },

  // ==================== TEST PREP MODE INIT ====================
  initTestPrep() {
    // Render D20 stats bar for Test Prep landing
    if (quiz && quiz.renderer) {
      quiz.renderer.renderStatsBar();
      const testprepStatsBar = document.getElementById('testprepStatsBar');
      const mainStatsBar = document.getElementById('statsBar');
      if (testprepStatsBar && mainStatsBar) {
        testprepStatsBar.innerHTML = mainStatsBar.innerHTML;
      }
    }
  },

  // ==================== DUE BADGE ====================
  updateDueBadge() {
    const due = this.getDueQuestions();
    const badge = document.getElementById('dueBadge');
    if (!badge) return; // Badge element may not exist in all views
    if (due.length > 0) {
      badge.style.display = 'inline';
      badge.textContent = due.length;
    } else {
      badge.style.display = 'none';
    }
  },

  getDueQuestions() {
    const now = Date.now();
    return this.questions.filter(q => {
      const srs = this.srsData[q.id];
      if (!srs) return true; // New
      return srs.nextReview <= now;
    });
  },

  // ==================== REVIEW MODE (SRS) ====================
  initReview() {
    // Render D20 stats bar for Review mode
    if (quiz && quiz.renderer) {
      quiz.renderer.renderStatsBar();
      const reviewStatsBar = document.getElementById('reviewStatsBar');
      const mainStatsBar = document.getElementById('statsBar');
      if (reviewStatsBar && mainStatsBar) {
        reviewStatsBar.innerHTML = mainStatsBar.innerHTML;
      }
    }

    const due = this.getDueQuestions();
    document.getElementById('reviewDueCount').textContent = due.length;

    // Badges
    const now = Date.now();
    let overdue = 0, dueNow = 0, newCards = 0;
    due.forEach(q => {
      const srs = this.srsData[q.id];
      if (!srs) { newCards++; }
      else if (srs.nextReview < now - 86400000) { overdue++; }
      else { dueNow++; }
    });

    const badges = document.getElementById('reviewBadges');
    badges.innerHTML = '';
    if (overdue) badges.innerHTML += `<span class="review-badge overdue">${overdue} overdue</span>`;
    if (dueNow) badges.innerHTML += `<span class="review-badge due">${dueNow} due</span>`;
    if (newCards) badges.innerHTML += `<span class="review-badge new">${newCards} new</span>`;

    // Render questions
    const area = document.getElementById('reviewArea');
    if (!due.length) {
      area.innerHTML = `
        <div class="review-empty">
          <div class="icon">✨</div>
          <h3>All caught up!</h3>
          <p>No reviews due right now. Come back later or study new topics.</p>
        </div>
      `;
      return;
    }

    area.innerHTML = due.slice(0, 5).map(q => this.renderReviewCard(q)).join('');
  },

  renderReviewCard(q) {
    const mentor = this.getMentorForQuestion(q.id);
    const srs = this.srsData[q.id] || { interval: 0, easeFactor: 2.5 };
    const isNew = !this.srsData[q.id];

    return `
      <div class="blitz-question-card" data-qid="${q.id}" data-mentor="${mentor}">
        <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.5rem;">
          ${q._category} ${isNew ? '<span style="color:var(--correct)">- NEW</span>' : ''}
        </div>
        <div class="blitz-question-text">${q.q}</div>
        <div class="blitz-options">
          ${q.options.map((opt, i) => `
            <button class="blitz-option" data-action="answer-review" data-qid="${q.id}" data-opt-index="${i}">${opt}</button>
          `).join('')}
        </div>
        <div class="srs-buttons" id="srs-${q.id}" style="display:none;">
          <button class="srs-btn again" data-action="rate-srs" data-qid="${q.id}" data-rating="0">
            Again<span class="interval">&lt;1m</span>
          </button>
          <button class="srs-btn hard" data-action="rate-srs" data-qid="${q.id}" data-rating="1">
            Hard<span class="interval">${this.formatInterval(Math.max(1, srs.interval * 1.2))}</span>
          </button>
          <button class="srs-btn good" data-action="rate-srs" data-qid="${q.id}" data-rating="2">
            Good<span class="interval">${this.formatInterval(srs.interval < 1 ? 10 : srs.interval * srs.easeFactor)}</span>
          </button>
          <button class="srs-btn easy" data-action="rate-srs" data-qid="${q.id}" data-rating="3">
            Easy<span class="interval">${this.formatInterval(srs.interval < 1 ? 4*24*60 : srs.interval * srs.easeFactor * 1.5)}</span>
          </button>
        </div>
      </div>
    `;
  },

  answerReview(qid, optIndex) {
    const q = this.questions.find(q => q.id === qid);
    if (!q) return;

    const card = document.querySelector(`[data-qid="${qid}"]`);
    const options = card.querySelectorAll('.blitz-option');
    const isCorrect = optIndex === q.answer;

    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      if (i === q.answer) opt.classList.add('correct');
      if (i === optIndex && !isCorrect) opt.classList.add('incorrect');
    });

    // Show SRS buttons
    document.getElementById(`srs-${qid}`).style.display = 'flex';

    // Award XP via gamification if available
    if (typeof gamification !== 'undefined' && gamification && typeof persistence !== 'undefined') {
      if (isCorrect) {
        const result = gamification.processCorrectAnswer(qid, { completedWarmups: false, exploredWrongFirst: false });
        if (quiz && quiz.renderer) {
          quiz.renderer.renderStatsBar();
          quiz.renderer.showXPPopup(result.xp, gamification.getStreakMessage(result.streak), false);
        }
      } else {
        gamification.processWrongAnswer(qid);
        if (!this.wrongHistory[qid]) this.wrongHistory[qid] = [];
        const mentor = card.dataset.mentor;
        if (!this.wrongHistory[qid].includes(mentor)) {
          this.wrongHistory[qid].push(mentor);
        }
      }
    }
  },

  rateSrs(qid, rating) {
    const now = Date.now();
    let srs = this.srsData[qid] || { interval: 1, easeFactor: 2.5, reviewCount: 0 };

    if (rating === 0) {
      srs.interval = 1;
      srs.easeFactor = Math.max(1.3, srs.easeFactor - 0.2);
    } else if (rating === 1) {
      srs.interval = Math.max(1, srs.interval * 1.2);
      srs.easeFactor = Math.max(1.3, srs.easeFactor - 0.15);
    } else if (rating === 2) {
      srs.interval = srs.interval < 1 ? 10 : srs.interval * srs.easeFactor;
    } else {
      srs.interval = srs.interval < 1 ? 4 * 24 * 60 : srs.interval * srs.easeFactor * 1.5;
      srs.easeFactor += 0.1;
    }

    srs.nextReview = now + (srs.interval * 60 * 1000);
    srs.reviewCount = (srs.reviewCount || 0) + 1;

    this.srsData[qid] = srs;
    this.saveSrsData();

    // Replace buttons with confirmation
    const btns = document.getElementById(`srs-${qid}`);
    btns.innerHTML = `<div style="text-align:center;color:var(--correct);padding:0.5rem;width:100%;">
      Scheduled for ${this.formatInterval(srs.interval)}
    </div>`;

    this.updateDueBadge();
  },

  formatInterval(minutes) {
    if (!minutes || minutes < 1) return '<1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    if (minutes < 24 * 60) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / (24 * 60))}d`;
  },

  getMentorForQuestion(qid) {
    const used = this.wrongHistory[qid] || [];
    if (used.length > 0) {
      const available = this.mentorStyles.filter(s => !used.includes(s));
      if (available.length > 0) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }
    return this.mentorStyles[Math.floor(Math.random() * this.mentorStyles.length)];
  },

  // ==================== JEOPARDY MODE ====================
  initJeopardy() {
    this.jeopardy.index = 0;
    this.shuffleArray(this.questions);
    this.renderJeopardyQuestion();
  },

  renderJeopardyQuestion() {
    const q = this.questions[this.jeopardy.index];
    if (!q) return;

    const clue = this.getJeopardyClue(q);
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
    const value = (this.jeopardy.index + 1) * 100;

    document.getElementById('jeopardyArea').innerHTML = `
      <div class="jeopardy-clue-card">
        <div class="jeopardy-category">${q._category || 'Anatomy'}</div>
        <div class="jeopardy-value">$${value}</div>
        <div class="jeopardy-clue-text">"${clue}"</div>
      </div>
      <div class="jeopardy-answer-grid">
        ${shuffledOpts.map(opt => `
          <button class="jeopardy-answer-btn" data-action="answer-jeopardy" data-qid="${q.id}" data-opt="${opt.replace(/"/g, '&quot;')}">${opt}</button>
        `).join('')}
      </div>
      <div class="jeopardy-nav">
        <span style="color:var(--text-muted);">Score: <strong style="color:var(--glow-warm);">$${this.jeopardy.score}</strong></span>
      </div>
    `;
  },

  getJeopardyClue(q) {
    let clue = null;

    // Priority 1: Use the mechanism metaphor (best for Jeopardy - descriptive)
    if (q.mechanism?.metaphor) {
      clue = q.mechanism.metaphor;
    }
    // Priority 2: Use mechanism content
    else if (q.mechanism?.content) {
      clue = q.mechanism.content;
    }
    // Priority 3: Use the correct answer's explanation
    else if (q.optionExplains && q.optionExplains[q.answer]) {
      const exp = q.optionExplains[q.answer];
      clue = exp.text || (typeof exp === 'string' ? exp : null);
    }
    // Priority 4: General explanation
    else {
      clue = q.explain;
    }

    // Fallback to question itself
    if (!clue) return q.q;

    // Clean up clue text - remove verdict prefixes that don't work as clues
    clue = clue
      .replace(/^Correct!\s*/i, '')
      .replace(/^Incorrect[.!]?\s*/i, '')
      .replace(/^Yes[.!]?\s*/i, '')
      .replace(/^No[.!]?\s*/i, '')
      .replace(/^That's right[.!]?\s*/i, '')
      .replace(/^Stay close\s*-?\s*/i, '')
      .replace(/^Come with me\s*-?\s*/i, '')
      .replace(/^Let me show you\s*-?\s*/i, '');

    // Truncate very long clues for readability
    if (clue.length > 300) {
      clue = clue.substring(0, 297) + '...';
    }

    return clue;
  },

  answerJeopardy(qid, selectedOpt) {
    const q = this.questions.find(q => q.id === qid);
    if (!q) return;

    const correct = q.options[q.answer];
    const isCorrect = selectedOpt === correct;
    const value = (this.jeopardy.index + 1) * 100;

    document.querySelectorAll('.jeopardy-answer-btn').forEach(btn => {
      btn.classList.add('disabled');
      if (btn.textContent === correct) btn.classList.add('correct');
      if (btn.textContent === selectedOpt && !isCorrect) btn.classList.add('incorrect');
    });

    if (isCorrect) {
      this.jeopardy.score += value;
    }

    // Award XP
    if (typeof gamification !== 'undefined' && gamification) {
      if (isCorrect) {
        gamification.processCorrectAnswer(qid, { completedWarmups: false, exploredWrongFirst: false });
      } else {
        gamification.processWrongAnswer(qid);
      }
      if (quiz && quiz.renderer) quiz.renderer.renderStatsBar();
    }

    setTimeout(() => {
      this.jeopardy.index++;
      if (this.jeopardy.index >= this.questions.length) {
        this.jeopardy.index = 0;
        this.shuffleArray(this.questions);
      }
      this.renderJeopardyQuestion();
    }, 1500);
  },

  // ==================== BLITZ MODE ====================
  startBlitz() {
    this.blitz = { active: true, timer: 60, score: 0, index: 0, interval: null };
    this.shuffleArray(this.questions);

    document.getElementById('blitzStartBtn').style.display = 'none';
    document.getElementById('blitzScore').textContent = '0';
    document.getElementById('blitzTimer').className = 'blitz-timer';

    this.renderBlitzQuestion();

    this.blitz.interval = setInterval(() => {
      this.blitz.timer--;
      const el = document.getElementById('blitzTimer');
      el.textContent = `0:${this.blitz.timer.toString().padStart(2, '0')}`;

      if (this.blitz.timer <= 10) el.className = 'blitz-timer danger';
      else if (this.blitz.timer <= 20) el.className = 'blitz-timer warning';

      if (this.blitz.timer <= 0) this.endBlitz();
    }, 1000);
  },

  renderBlitzQuestion() {
    if (!this.blitz.active) return;
    const q = this.questions[this.blitz.index % this.questions.length];

    document.getElementById('blitzQuestion').innerHTML = `
      <div class="blitz-question-card">
        <div class="blitz-question-text">${q.q}</div>
        <div class="blitz-options">
          ${q.options.map((opt, i) => `
            <button class="blitz-option" data-action="answer-blitz" data-qid="${q.id}" data-opt-index="${i}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;
  },

  answerBlitz(qid, optIndex) {
    if (!this.blitz.active) return;
    const q = this.questions.find(q => q.id === qid);
    if (!q) return;

    if (optIndex === q.answer) {
      this.blitz.score++;
      document.getElementById('blitzScore').textContent = this.blitz.score;
    }

    this.blitz.index++;
    this.renderBlitzQuestion();
  },

  endBlitz() {
    clearInterval(this.blitz.interval);
    this.blitz.active = false;

    const score = this.blitz.score;
    const xp = score * 15;

    // Award XP
    if (typeof persistence !== 'undefined') {
      persistence.addXP(xp);
      if (quiz && quiz.renderer) quiz.renderer.renderStatsBar();
    }

    document.getElementById('blitzQuestion').innerHTML = `
      <div class="blitz-result">
        <div class="result-label">Time's Up!</div>
        <div class="final-score">${score}</div>
        <div class="result-label">questions correct</div>
        <div class="xp-earned">+${xp} XP</div>
      </div>
    `;

    document.getElementById('blitzStartBtn').style.display = 'block';
    document.getElementById('blitzStartBtn').textContent = 'Play Again';
    document.getElementById('blitzTimer').textContent = '1:00';
    document.getElementById('blitzTimer').className = 'blitz-timer';
  },

  // ==================== LIGHTNING MODE ====================
  startLightning() {
    this.lightning = { active: true, index: 0, strikes: 3, results: [], maxQuestions: 10 };
    this.shuffleArray(this.questions);

    document.getElementById('lightningStartBtn').style.display = 'none';
    this.renderLightningProgress();
    this.renderLightningQuestion();
  },

  renderLightningProgress() {
    const prog = document.getElementById('lightningProgress');
    prog.innerHTML = Array(this.lightning.maxQuestions).fill(0).map((_, i) => {
      let cls = 'lightning-dot';
      if (i < this.lightning.results.length) {
        cls += this.lightning.results[i] ? ' correct' : ' wrong';
      } else if (i === this.lightning.index) {
        cls += ' current';
      }
      return `<div class="${cls}"></div>`;
    }).join('');

    const strikes = document.getElementById('lightningStrikes');
    strikes.innerHTML = [0, 1, 2].map(i =>
      `<span class="strike ${i < this.lightning.strikes ? 'active' : ''}">${i < this.lightning.strikes ? 'X' : 'dead'}</span>`
    ).join('');
  },

  renderLightningQuestion() {
    if (!this.lightning.active) return;

    if (this.lightning.strikes <= 0 || this.lightning.index >= this.lightning.maxQuestions) {
      this.endLightning();
      return;
    }

    const q = this.questions[this.lightning.index % this.questions.length];

    document.getElementById('lightningQuestion').innerHTML = `
      <div class="blitz-question-card">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;">
          Question ${this.lightning.index + 1} of ${this.lightning.maxQuestions}
        </div>
        <div class="blitz-question-text">${q.q}</div>
        <div class="blitz-options">
          ${q.options.map((opt, i) => `
            <button class="blitz-option" data-action="answer-lightning" data-qid="${q.id}" data-opt-index="${i}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;
  },

  answerLightning(qid, optIndex) {
    if (!this.lightning.active) return;
    const q = this.questions.find(q => q.id === qid);
    if (!q) return;

    const isCorrect = optIndex === q.answer;
    this.lightning.results.push(isCorrect);

    if (!isCorrect) {
      this.lightning.strikes--;
    }

    // Show feedback
    const options = document.querySelectorAll('#lightningQuestion .blitz-option');
    options.forEach((opt, i) => {
      opt.classList.add('disabled');
      if (i === q.answer) opt.classList.add('correct');
      if (i === optIndex && !isCorrect) opt.classList.add('incorrect');
    });

    this.renderLightningProgress();

    setTimeout(() => {
      this.lightning.index++;
      this.renderLightningQuestion();
    }, 800);
  },

  endLightning() {
    this.lightning.active = false;
    const correct = this.lightning.results.filter(r => r).length;
    const total = this.lightning.results.length;
    const xp = correct * 20;

    // Award XP
    if (typeof persistence !== 'undefined') {
      persistence.addXP(xp);
      if (quiz && quiz.renderer) quiz.renderer.renderStatsBar();
    }

    const won = this.lightning.strikes > 0 && correct === this.lightning.maxQuestions;

    document.getElementById('lightningQuestion').innerHTML = `
      <div class="blitz-result">
        <div class="result-label">${won ? 'Perfect Round!' : this.lightning.strikes <= 0 ? 'Struck Out!' : 'Round Complete'}</div>
        <div class="final-score">${correct}/${total}</div>
        <div class="result-label">questions correct</div>
        <div class="xp-earned">+${xp} XP</div>
      </div>
    `;

    document.getElementById('lightningStartBtn').style.display = 'block';
    document.getElementById('lightningStartBtn').textContent = 'Play Again';
  },

  // ==================== STATS ====================
  renderStats() {
    const stats = typeof gamification !== 'undefined' && gamification ?
      gamification.getStats() : { level: 1, totalXP: 0, currentStreak: 0, bestStreak: 0, totalAnswered: 0, accuracy: 0, dayStreak: 0, totalStudyDays: 0 };

    // Seasonal event banner
    if (quiz && quiz.renderer && stats.seasonalEvent) {
      quiz.renderer.renderSeasonalBanner(document.getElementById('statsSeasonalBanner'));
    }

    // Main stats grid with new gamification stats
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.level}</div>
        <div class="stat-label">Level</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalXP.toLocaleString()}</div>
        <div class="stat-label">Total XP</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.currentStreak}</div>
        <div class="stat-label">Answer Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.bestStreak}</div>
        <div class="stat-label">Best Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.dayStreak || 0}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalStudyDays || 0}</div>
        <div class="stat-label">Study Days</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalAnswered}</div>
        <div class="stat-label">Answered</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.accuracy}%</div>
        <div class="stat-label">Accuracy</div>
      </div>
    `;

    // Daily challenges panel
    if (quiz && quiz.renderer) {
      quiz.renderer.renderDailyChallenges(document.getElementById('statsDailyChallenges'));
    }

    // Study calendar
    if (quiz && quiz.renderer) {
      quiz.renderer.renderStudyCalendar(document.getElementById('statsStudyCalendar'));
    }

    // Milestones progress
    if (gamification) {
      const milestones = gamification.getMilestoneDefinitions();
      const unlocked = persistence?.data?.milestones || [];
      const milestonesHTML = milestones.slice(0, 8).map(m => {
        const isUnlocked = unlocked.includes(m.id);
        return `
          <div class="mastery-row" style="opacity: ${isUnlocked ? '1' : '0.5'}">
            <span class="mastery-label">${m.icon} ${m.name}</span>
            <span class="mastery-pct" style="color: ${isUnlocked ? 'var(--correct)' : 'var(--text-dim)'}">${isUnlocked ? 'Done' : `+${m.reward} XP`}</span>
          </div>
        `;
      }).join('');
      document.getElementById('milestonesProgress').innerHTML = milestonesHTML || '<p style="color:var(--text-dim)">No milestones yet</p>';
    }

    // Category mastery with tier badges
    const categories = {};
    this.questions.forEach(q => {
      if (!categories[q._category]) categories[q._category] = { total: 0, reviewed: 0 };
      categories[q._category].total++;
      if (this.srsData[q.id]) categories[q._category].reviewed++;
    });

    document.getElementById('masteryBars').innerHTML = Object.entries(categories).map(([cat, data]) => {
      const pct = data.total > 0 ? Math.round((data.reviewed / data.total) * 100) : 0;
      const tierBadge = quiz && quiz.renderer ? quiz.renderer.renderMasteryTierBadge(pct) : '';
      return `
        <div class="mastery-row">
          <span class="mastery-label">${cat} ${tierBadge}</span>
          <div class="mastery-bar"><div class="mastery-fill" style="width:${pct}%"></div></div>
          <span class="mastery-pct">${pct}%</span>
        </div>
      `;
    }).join('');
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizModes;
}
