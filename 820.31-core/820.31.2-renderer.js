/**
 * Ms. Luminara Quiz Renderer
 * Handles rendering of questions, warmups, exploration panels, and gamification UI
 */

class QuizRenderer {
  constructor(quiz) {
    this.quiz = quiz;
    this.notificationQueue = [];
    this.isShowingNotification = false;

    // Attach event listeners for CSP-compliant event handling
    this.attachEventListeners();
  }

  /**
   * Render the stats bar (XP, Level, Streak, Character)
   */
  renderStatsBar() {
    const container = document.getElementById('statsBar');
    if (!container || !gamification) return;

    const stats = gamification.getStats();
    const levelProgress = stats.levelProgress;
    const charMini = this.renderCharacterMini();
    const hpBar = this.renderHPBar();

    container.innerHTML = `
      <div class="stat-item">
        <span class="level-badge">LV ${stats.level}</span>
      </div>
      ${hpBar}
      <div class="xp-container">
        <div class="xp-bar">
          <div class="xp-fill" style="width: ${levelProgress.percentage}%"></div>
        </div>
        <div class="xp-text">${levelProgress.current} / ${levelProgress.needed} XP</div>
      </div>
      <div class="streak-counter ${stats.currentStreak > 0 ? 'active' : ''}">
        <span class="fire">${stats.currentStreak > 0 ? '🔥' : '💨'}</span>
        <span class="count">${stats.currentStreak}</span>
      </div>
      ${charMini}
    `;
  }

  /**
   * Render HP bar for scaffold remediation system
   */
  renderHPBar() {
    if (!scaffoldRemediation) return '';

    const hp = scaffoldRemediation.getHP();
    const hpPercent = hp.percent;
    const hpColor = hpPercent > 50 ? 'var(--correct)' :
                    hpPercent > 25 ? 'var(--glow-warm)' :
                    'var(--incorrect)';

    return `
      <div class="hp-container" title="Hit Points - Take damage on wrong answers, heal with scaffold questions">
        <div class="hp-bar">
          <div class="hp-fill" style="width: ${hpPercent}%; background: ${hpColor}"></div>
        </div>
        <div class="hp-text">${hp.current}/${hp.max} HP</div>
      </div>
    `;
  }

  /**
   * Show XP popup after correct answer
   */
  showXPPopup(xpResult, streakMessage, isRevenge) {
    const existing = document.querySelector('.xp-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'xp-popup';

    let breakdownHTML = xpResult.breakdown.map(item => `
      <div class="breakdown-item">
        <span>${item.label}</span>
        <span class="value">+${item.value}</span>
      </div>
    `).join('');

    let luckyHTML = '';
    if (xpResult.isLuckyStrike) {
      luckyHTML = `<div class="lucky-strike">${gamification.getLuckyStrikeMessage()}</div>`;
    }

    let revengeHTML = '';
    if (isRevenge) {
      revengeHTML = `<div class="message" style="color: var(--explore);">${gamification.getRevengeMessage()}</div>`;
    }

    let streakHTML = '';
    if (streakMessage) {
      streakHTML = `<div class="message">"${streakMessage}"</div>`;
    }

    popup.innerHTML = `
      <div class="total">+${xpResult.total} XP</div>
      <div class="breakdown">${breakdownHTML}</div>
      ${luckyHTML}
      ${revengeHTML}
      ${streakHTML}
    `;

    document.body.appendChild(popup);

    // Auto-dismiss after delay
    setTimeout(() => {
      popup.classList.add('hiding');
      setTimeout(() => popup.remove(), 300);
    }, xpResult.isLuckyStrike ? 3000 : 2000);
  }

  /**
   * Show minor reward notification (for curiosity points, etc.)
   */
  showMinorReward(message) {
    const existing = document.querySelector('.minor-reward-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.className = 'minor-reward-popup';
    popup.innerHTML = `<span class="reward-text">${message}</span>`;
    popup.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, rgba(201, 165, 92, 0.9), rgba(180, 140, 70, 0.9));
      color: #1a1612;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 1000;
      animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 1.7s forwards;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 2000);
  }

  /**
   * Show achievement notification
   */
  showAchievement(achievement) {
    this.notificationQueue.push(achievement);
    this.processNotificationQueue();
  }

  processNotificationQueue() {
    if (this.isShowingNotification || this.notificationQueue.length === 0) return;

    this.isShowingNotification = true;
    const achievement = this.notificationQueue.shift();

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    const iconMap = {
      'footprints': '👣', 'zap': '⚡', 'brain': '🧠', 'crown': '👑',
      'flame': '🔥', 'fire': '🔥', 'meteor': '☄️', 'star': '⭐',
      'trophy': '🏆', 'moon': '🌙', 'sunrise': '🌅', 'graduation': '🎓',
      'book': '📚', 'gem': '💎', 'diamond': '💠', 'target': '🎯',
      'sparkles': '✨', 'calendar': '📅', 'heart': '❤️'
    };

    notification.innerHTML = `
      <div class="badge-icon">${iconMap[achievement.icon] || '🏅'}</div>
      <div class="content">
        <div class="title">Achievement Unlocked</div>
        <div class="name">${achievement.name}</div>
        <div class="message">"${achievement.luminara}"</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => {
        notification.remove();
        this.isShowingNotification = false;
        this.processNotificationQueue();
      }, 400);
    }, 4000);
  }

  /**
   * Show streak broken message
   */
  showStreakBroken(previousStreak) {
    if (previousStreak < 2) return; // Only show if streak was notable

    const message = document.createElement('div');
    message.className = 'streak-broken';

    message.innerHTML = `
      <div class="icon">💔</div>
      <div class="text">Streak of ${previousStreak} broken</div>
      <div class="message">"${gamification.getEncouragementMessage()}"</div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 2500);
  }

  /**
   * Show level up celebration
   */
  showLevelUp(newLevel) {
    // SHOCKWAVE ARCADE JUICE: Level up sound
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.playLevelUp();
    }

    const overlay = document.createElement('div');
    overlay.className = 'level-up-overlay';

    const messages = [
      "Your dedication is... intoxicating.",
      "Higher and higher you climb...",
      "I knew you had it in you.",
      "The ascent continues. Beautiful.",
      "Another peak conquered together."
    ];

    overlay.innerHTML = `
      <div class="level-up-card">
        <div class="stars">✨ 🌟 ✨</div>
        <div class="title">Level Up!</div>
        <div class="level">${newLevel}</div>
        <div class="message">"${messages[Math.floor(Math.random() * messages.length)]}"</div>
        <button class="dismiss" data-action="dismiss-overlay" data-target=".level-up-overlay">Continue</button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  // ═══════════════════════════════════════════════════════════════
  // GAMIFICATION ENHANCEMENT RENDERS (7 PASSES)
  // ═══════════════════════════════════════════════════════════════

  /**
   * PASS 2: Show combo indicator
   */
  showComboIndicator(comboCount, timeRemaining) {
    let indicator = document.querySelector('.combo-indicator');

    if (comboCount < 2) {
      if (indicator) indicator.classList.remove('active');
      return;
    }

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'combo-indicator';
      indicator.innerHTML = `
        <span class="combo-count">x${comboCount}</span>
        <div class="combo-timer"><div class="combo-timer-fill"></div></div>
      `;
      document.body.appendChild(indicator);
    }

    indicator.classList.add('active');
    indicator.querySelector('.combo-count').textContent = `x${comboCount}`;

    // Update timer bar
    const fillPercent = (timeRemaining / 8000) * 100;
    indicator.querySelector('.combo-timer-fill').style.width = `${fillPercent}%`;
  }

  /**
   * PASS 2: Show combo popup for milestones
   */
  showComboPopup(comboCount, message) {
    if (comboCount < 3) return;

    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.innerHTML = `<div>COMBO x${comboCount}!</div><div style="font-size:1.5rem">${message || ''}</div>`;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
  }

  /**
   * PASS 1: Render daily challenges panel
   */
  renderDailyChallenges(container) {
    if (!gamification) return;

    const daily = gamification.getDailyChallenges();
    if (!daily || !daily.challenges || !daily.completed) return;

    const html = `
      <div class="daily-challenges">
        <div class="daily-challenges-header">
          <span class="daily-challenges-title">🎯 Daily Challenges</span>
          <span class="daily-challenges-timer">Resets at midnight</span>
        </div>
        ${daily.challenges.map(c => {
          const isComplete = daily.completed.includes(c.id);
          return `
            <div class="daily-challenge ${isComplete ? 'completed' : ''}">
              <span class="daily-challenge-icon">${c.icon}</span>
              <div class="daily-challenge-info">
                <div class="daily-challenge-name">${c.name}</div>
                <div class="daily-challenge-desc">${c.desc}</div>
              </div>
              <span class="daily-challenge-reward">${isComplete ? '✓' : `+${c.xp} XP`}</span>
            </div>
          `;
        }).join('')}
        ${daily.completed.length >= 3 ? `
          <div class="daily-bonus-banner ${daily.bonusClaimed ? 'claimed' : ''}">
            🏆 ${daily.bonusClaimed ? 'Daily Champion Bonus Claimed!' : 'All Complete! +500 XP Bonus!'}
          </div>
        ` : ''}
      </div>
    `;

    if (container) {
      container.innerHTML = html;
    }
    return html;
  }

  /**
   * PASS 1: Show daily challenge complete notification
   */
  showDailyChallengeComplete(challenge) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification daily-challenge-complete';

    notification.innerHTML = `
      <div class="badge-icon">${challenge.icon}</div>
      <div class="content">
        <div class="title">Daily Challenge Complete!</div>
        <div class="name">${challenge.name}</div>
        <div class="reward">+${challenge.xp} XP</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }

  /**
   * PASS 3: Show milestone celebration
   */
  showMilestone(milestone) {
    const popup = document.createElement('div');
    popup.className = 'milestone-popup';

    popup.innerHTML = `
      <div class="milestone-icon">${milestone.icon}</div>
      <div class="milestone-name">${milestone.name}</div>
      <div class="milestone-reward">+${milestone.reward} XP</div>
      <button class="milestone-dismiss" data-action="dismiss-overlay" data-target=".milestone-popup">
        Claim Reward
      </button>
    `;

    document.body.appendChild(popup);

    // Trigger celebration effect
    if (milestone.celebration === 'confetti') {
      this.showConfetti();
    } else if (milestone.celebration === 'fireworks') {
      this.showConfetti({ count: 100, duration: 4000 });
    } else if (milestone.celebration === 'epic') {
      this.showConfetti({ count: 200, duration: 6000 });
    }
  }

  /**
   * PASS 3: Show confetti celebration
   */
  showConfetti(options = {}) {
    const { count = 50, duration = 3000 } = options;

    const container = document.createElement('div');
    container.className = 'confetti-container';

    const colors = ['#f5c542', '#34d399', '#f87171', '#60a5fa', '#a78bfa', '#fbbf24'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 1}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(confetti);
    }

    document.body.appendChild(container);

    setTimeout(() => container.remove(), duration);
  }

  /**
   * PASS 4: Render study calendar
   */
  renderStudyCalendar(container) {
    if (!gamification) return;

    const stats = gamification.getCalendarStats();

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().toISOString().split('T')[0];

    const calendarHTML = stats.last30Days.map(day => {
      const date = new Date(day.date);
      const dayNum = date.getDate();
      const isToday = day.date === today;
      const classes = ['calendar-day'];
      if (day.studied) classes.push('studied');
      if (isToday) classes.push('today');

      return `<div class="${classes.join(' ')}" title="${day.date}">${dayNum}</div>`;
    }).join('');

    const html = `
      <div class="study-calendar">
        <div class="calendar-header">
          <span class="calendar-title">Study Calendar</span>
          ${stats.currentStreak > 0 ? `
            <span class="day-streak-badge">🔥 ${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''}</span>
          ` : ''}
        </div>
        <div class="calendar-grid">
          ${calendarHTML}
        </div>
        <div class="calendar-stats">
          <div class="calendar-stat">
            <div class="calendar-stat-value">${stats.totalDays}</div>
            <div class="calendar-stat-label">Total Days</div>
          </div>
          <div class="calendar-stat">
            <div class="calendar-stat-value">${stats.longestStreak}</div>
            <div class="calendar-stat-label">Best Streak</div>
          </div>
        </div>
      </div>
    `;

    if (container) {
      container.innerHTML = html;
    }
    return html;
  }

  /**
   * PASS 5: Render mastery tier badge
   */
  renderMasteryTierBadge(mastery) {
    if (!gamification) return '';

    const tier = gamification.getMasteryTier(mastery);
    return `<span class="mastery-tier-badge ${tier.tier}">${tier.icon} ${tier.name}</span>`;
  }

  /**
   * PASS 5: Show tier-up notification
   */
  showTierUp(oldTier, newTier, categoryName) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification tier-up';

    notification.innerHTML = `
      <div class="badge-icon">${newTier.icon}</div>
      <div class="content">
        <div class="title">${categoryName}</div>
        <div class="name">${oldTier.icon} → ${newTier.icon} ${newTier.name}!</div>
        <div class="message">Mastery tier increased!</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 400);
    }, 3500);
  }

  /**
   * PASS 7: Render seasonal event banner
   */
  renderSeasonalBanner(container) {
    if (!gamification) return;

    const event = gamification.getActiveSeasonalEvent();
    if (!event) return '';

    const bonusPercent = Math.round((event.xpBonus - 1) * 100);

    const html = `
      <div class="seasonal-banner ${event.theme || ''}">
        <div class="event-info">
          <span class="event-icon">${event.icon}</span>
          <div>
            <div class="event-name">${event.name}</div>
            <div class="event-desc">${event.desc}</div>
          </div>
        </div>
        <span class="event-bonus">+${bonusPercent}% XP</span>
      </div>
    `;

    if (container) {
      container.innerHTML = html;
    }
    return html;
  }

  /**
   * PASS 6: Enhanced XP popup with full breakdown
   */
  showEnhancedXPPopup(result) {
    // Remove existing
    document.querySelectorAll('.xp-breakdown').forEach(e => e.remove());

    const popup = document.createElement('div');
    popup.className = 'xp-breakdown';

    const breakdownRows = result.xp.breakdown.map(item => {
      const isSpecial = item.label.includes('Lucky') || item.label.includes('Combo');
      return `
        <div class="xp-breakdown-row ${isSpecial ? 'lucky' : ''}">
          <span class="label">${item.label}</span>
          <span class="value">+${item.value}</span>
        </div>
      `;
    }).join('');

    popup.innerHTML = `
      <div class="xp-breakdown-title">XP Earned</div>
      ${breakdownRows}
      <div class="xp-breakdown-total">
        <span class="label">Total</span>
        <span class="value">+${result.xp.total}</span>
      </div>
    `;

    document.body.appendChild(popup);

    // Auto-dismiss
    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transform = 'translateY(-50%) translateX(50px)';
      setTimeout(() => popup.remove(), 300);
    }, result.xp.isLuckyStrike ? 4000 : 2500);
  }

  /**
   * Show day streak milestone
   */
  showDayStreakMilestone(dayStreak, message) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification day-streak';

    notification.innerHTML = `
      <div class="badge-icon">🔥</div>
      <div class="content">
        <div class="title">${dayStreak}-Day Streak!</div>
        <div class="message">"${message}"</div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('hiding');
      setTimeout(() => notification.remove(), 400);
    }, 4000);
  }

  /**
   * Show session summary
   */
  showSessionSummary(summary, achievements) {
    const overlay = document.createElement('div');
    overlay.className = 'session-summary';

    const closingMessages = [
      "Until next time... I'll be waiting.",
      "You've done well. Come back soon.",
      "The knowledge you've gained is yours forever.",
      "Rest now. The neurons need time to strengthen.",
      "What we've built together is beautiful."
    ];

    let achievementsHTML = '';
    if (summary.achievementsUnlocked.length > 0) {
      const badgesList = achievements
        .filter(a => summary.achievementsUnlocked.includes(a.id))
        .map(a => {
          const iconMap = {
            'footprints': '👣', 'zap': '⚡', 'brain': '🧠', 'crown': '👑',
            'flame': '🔥', 'fire': '🔥', 'meteor': '☄️', 'star': '⭐',
            'trophy': '🏆', 'moon': '🌙', 'sunrise': '🌅', 'graduation': '🎓',
            'book': '📚', 'gem': '💎', 'diamond': '💠', 'target': '🎯',
            'sparkles': '✨', 'calendar': '📅', 'heart': '❤️'
          };
          return `<div class="summary-badge"><span class="icon">${iconMap[a.icon] || '🏅'}</span><span class="name">${a.name}</span></div>`;
        }).join('');

      achievementsHTML = `
        <div class="summary-achievements">
          <h3>Achievements Unlocked</h3>
          ${badgesList}
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="summary-card">
        <h2>Session Complete</h2>
        <div class="summary-stats">
          <div class="summary-stat">
            <div class="value">+${summary.xpEarned}</div>
            <div class="label">XP Earned</div>
          </div>
          <div class="summary-stat">
            <div class="value">${summary.questionsAnswered}</div>
            <div class="label">Questions</div>
          </div>
          <div class="summary-stat">
            <div class="value">${summary.accuracy}%</div>
            <div class="label">Accuracy</div>
          </div>
          <div class="summary-stat">
            <div class="value">${summary.bestStreak}</div>
            <div class="label">Best Streak</div>
          </div>
        </div>
        ${achievementsHTML}
        <div class="summary-message">
          "${closingMessages[Math.floor(Math.random() * closingMessages.length)]}"<br>
          <span style="font-size: 0.85rem; color: var(--glow-warm);">— Ms. Luminara</span>
        </div>
        <div class="summary-actions">
          <button class="home" data-action="close-summary-home">Back to Topics</button>
          <button class="continue" data-action="close-summary-continue">Continue Studying</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Render landing page stats preview
   */
  renderLandingStats() {
    const container = document.getElementById('landingStats');
    if (!container || !gamification) return;

    const stats = gamification.getStats();

    container.innerHTML = `
      <div class="landing-stat">
        <div class="value">LV ${stats.level}</div>
        <div class="label">Level</div>
      </div>
      <div class="landing-stat">
        <div class="value">${stats.totalXP.toLocaleString()}</div>
        <div class="label">Total XP</div>
      </div>
      <div class="landing-stat">
        <div class="value">${stats.bestStreak}</div>
        <div class="label">Best Streak</div>
      </div>
      <div class="landing-stat">
        <div class="value">${stats.achievements}</div>
        <div class="label">Badges</div>
      </div>
    `;
  }

  /**
   * Render a question
   */
  render(question, currentIdx, totalQuestions, exploredOptions, phase = 'main', mainQuestionText = null) {
    const area = document.getElementById('questionArea');
    if (!area) return;

    // Update progress
    this.updateProgress(currentIdx, totalQuestions, phase);

    // Build the question card
    area.innerHTML = this.buildQuestionCard(question, currentIdx, exploredOptions, phase, mainQuestionText);
  }

  /**
   * Update progress indicators
   */
  updateProgress(currentIdx, totalQuestions, phase) {
    const progressInfo = document.getElementById('progressInfo');
    const progressFill = document.getElementById('progressFill');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Show phase indicator in progress
    let phaseLabel = '';
    if (phase === 'warmup1') phaseLabel = ' (Warmup 1 of 2)';
    else if (phase === 'warmup2') phaseLabel = ' (Warmup 2 of 2)';
    else if (phase === 'main') phaseLabel = '';

    if (progressInfo) {
      progressInfo.textContent = `Question ${currentIdx + 1} of ${totalQuestions}${phaseLabel}`;
    }

    if (progressFill) {
      progressFill.style.width = ((currentIdx + 1) / totalQuestions * 100) + '%';
    }

    if (prevBtn) {
      prevBtn.disabled = currentIdx === 0 && phase === 'warmup1';
    }

    if (nextBtn) {
      nextBtn.textContent = (currentIdx === totalQuestions - 1 && phase === 'main') ? 'Finish' : 'Next →';
    }
  }

  /**
   * Build the complete question card HTML
   */
  buildQuestionCard(question, currentIdx, exploredOptions, phase, mainQuestionText) {
    const optionsHTML = this.buildOptions(question, exploredOptions);
    const introHTML = this.buildIntro(exploredOptions, phase, question.q);
    const explorationHTML = this.buildExplorationPanel(question, exploredOptions);
    const mechanismHTML = this.buildMechanismTour(question, exploredOptions);
    const warmupContextHTML = this.buildWarmupContext(phase, mainQuestionText);
    const skipButtonHTML = this.buildSkipButton(phase);

    // Determine the phase badge
    let phaseBadge = '';
    if (phase === 'warmup1') {
      phaseBadge = '<span class="phase-badge warmup">Warmup 1</span>';
    } else if (phase === 'warmup2') {
      phaseBadge = '<span class="phase-badge warmup">Warmup 2</span>';
    } else {
      phaseBadge = '<span class="phase-badge main">Main Question</span>';
    }

    // Build diagram button if AnatomyDiagrams is available
    const diagramButtonHTML = this.buildDiagramButton(question);

    // Build scaffold button if scaffolds are available
    const scaffoldButtonHTML = this.buildScaffoldButton(question);

    return `
      <div class="question-card ${phase !== 'main' ? 'warmup-card' : ''}">
        <div class="q-header">
          <div class="q-chapter">
            ${this.escapeHtml(question.chapter || '')}
            ${this.buildRevengeIndicator(question.id)}
          </div>
          ${phaseBadge}
        </div>
        ${warmupContextHTML}
        <div class="q-text">${this.renderText(question.q)}</div>
        ${diagramButtonHTML}
        ${scaffoldButtonHTML}
        ${introHTML}
        <div class="options">${optionsHTML}</div>
        ${skipButtonHTML}
        ${explorationHTML}
        ${mechanismHTML}
      </div>
    `;
  }

  /**
   * Build warmup context showing what main question we're building toward
   */
  buildWarmupContext(phase, mainQuestionText) {
    if (phase === 'main' || !mainQuestionText) return '';

    return `
      <div class="warmup-context">
        <div class="context-label">Building toward:</div>
        <div class="context-question">"${this.escapeHtml(mainQuestionText)}"</div>
      </div>
    `;
  }

  /**
   * Build skip button for warmups
   */
  buildSkipButton(phase) {
    if (phase === 'main') return '';

    return `
      <div class="skip-warmup">
        <button class="skip-btn" data-action="skip-to-main">
          Skip warmups → Go to main question
        </button>
      </div>
    `;
  }

  /**
   * Build revenge indicator for previously-wrong questions
   */
  buildRevengeIndicator(questionId) {
    if (!persistence || !questionId) return '';
    if (persistence.wasQuestionPreviouslyWrong(questionId)) {
      return '<span class="revenge-indicator">⚔️ Revenge</span>';
    }
    return '';
  }

  /**
   * Build inline diagram display for anatomy visualization
   * Automatically shows relevant diagram with each question
   * Supports multiple images via question.images array
   */
  buildDiagramButton(question) {
    // Check if AnatomyDiagrams is available
    if (typeof AnatomyDiagrams === 'undefined') return '';

    // If question has explicit images array with multiple images, show grid
    if (question.images && Array.isArray(question.images) && question.images.length > 1) {
      return this.buildMultiImageDisplay(question);
    }

    // Get diagram for this question (checks manifest mappings, term mappings, ZIM index)
    const diagramInfo = AnatomyDiagrams.getDiagramForQuestion(question);

    if (!diagramInfo || !diagramInfo.file) {
      // No diagram found - return empty (no button needed)
      return '';
    }

    // Build inline diagram display
    const imagePath = `${AnatomyDiagrams.ASSETS_PATH}/${diagramInfo.file}`;
    const title = diagramInfo.title || 'Anatomy Diagram';
    const containerId = `diagram-${question.id || Math.random().toString(36).substr(2, 9)}`;

    // Source attribution
    const sourceUrl = diagramInfo.source && diagramInfo.source.startsWith('http')
      ? diagramInfo.source
      : 'https://commons.wikimedia.org';
    const sourceLabel = diagramInfo.isZimExtracted
      ? 'Wikipedia'
      : (diagramInfo.license || 'CC-BY-SA');

    return `
      <div class="question-diagram-container" id="${containerId}">
        <div class="question-diagram-wrapper">
          <img src="${imagePath}"
               alt="${this.escapeHtml(title)}"
               class="question-diagram-img"
               data-action="show-diagram"
               data-diagram-file="${diagramInfo.file}"
               data-diagram-title="${this.escapeHtml(title)}"
               data-diagram-source="${sourceUrl}"
               onerror="this.parentElement.parentElement.style.display='none'"
               loading="lazy">
          <div class="question-diagram-caption">
            <span class="diagram-label">${this.escapeHtml(title)}</span>
            <a href="${sourceUrl}" target="_blank" rel="noopener" class="diagram-attribution">${sourceLabel}</a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Build multi-image display for questions with explicit images array
   * Shows a clickable grid of images that expand to modal on click
   */
  buildMultiImageDisplay(question) {
    const images = question.images;
    const containerId = `multi-img-${question.id || Math.random().toString(36).substr(2, 9)}`;
    const basePath = typeof AnatomyDiagrams !== 'undefined' ? AnatomyDiagrams.ASSETS_PATH : 'assets/diagrams';

    return `
      <div class="question-multi-images" id="${containerId}">
        <div class="multi-images-grid">
          ${images.map((img, idx) => `
            <div class="multi-image-item">
              <img src="${basePath}/${img.file}"
                   alt="${this.escapeHtml(img.title || 'Reference Image')}"
                   class="multi-image-thumb"
                   data-action="show-diagram"
                   data-diagram-file="${img.file}"
                   data-diagram-title="${this.escapeHtml(img.title || 'Reference Image')}"
                   data-diagram-source="${img.source || 'Wikipedia'}"
                   onerror="this.parentElement.style.display='none'"
                   loading="lazy">
              <div class="multi-image-label">${this.escapeHtml(img.title || '')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Build scaffold button for viewing etymology/foundation scaffolds
   * Always checks the main question (not warmup) for scaffoldFile
   */
  buildScaffoldButton(question) {
    // Get the main question from quiz (not the warmup prereq)
    // During warmup phases, question is a prereq, but we want scaffolds from main
    let mainQuestion = question;

    // Use this.quiz (the renderer's reference to LuminaraQuiz)
    if (this.quiz && this.quiz.currentQuiz && typeof this.quiz.currentIdx === 'number') {
      const quizMain = this.quiz.currentQuiz[this.quiz.currentIdx];
      if (quizMain) {
        mainQuestion = quizMain;
      }
    }

    // Show button if scaffoldFile exists OR prereqs are loaded
    const hasScaffoldFile = !!mainQuestion.scaffoldFile;
    const hasPrereqs = mainQuestion.prereqs && mainQuestion.prereqs.length > 0;

    if (!hasScaffoldFile && !hasPrereqs) {
      return '';
    }

    const scaffoldCount = hasPrereqs ? mainQuestion.prereqs.length : 7;

    return `
      <div class="scaffold-inline-container">
        <button class="scaffold-toggle-btn" data-action="toggle-inline-scaffolds">
          <span class="scaffold-icon">🪜</span>
          <span class="scaffold-label">Foundation Questions (${scaffoldCount})</span>
          <span class="scaffold-chevron">▼</span>
        </button>
        <div class="scaffold-inline-panel" style="display: none;">
          <!-- Populated dynamically when opened -->
        </div>
      </div>
    `;
  }

  /**
   * Handle diagram button click (static method for onclick)
   */
  static async handleDiagramClick(searchTerm, btn) {
    if (!btn || btn.disabled) return;

    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="btn-icon">&#x23F3;</span> Loading...';

    try {
      const images = await AnatomyDiagrams.findDiagram(searchTerm);

      if (images && images.length > 0) {
        AnatomyDiagrams.showDiagramModal(images, searchTerm);
      } else {
        AnatomyDiagrams.showNoDiagramMessage(searchTerm);
      }
    } catch (e) {
      console.error('[Renderer] Diagram fetch failed:', e);
      AnatomyDiagrams.showNoDiagramMessage(searchTerm);
    }

    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }

  /**
   * Build scaffolding hint panel (shown when struggling)
   */
  buildScaffoldingHint(question, scaffoldAdvice) {
    if (!scaffoldAdvice || !scaffoldAdvice.shouldShowExtraHint) return '';

    const hint = scaffolding.getExtraHint(question);
    const adaptiveMsg = scaffolding.getAdaptiveMessage(scaffoldAdvice);

    return `
      <div class="scaffold-hint">
        <div class="scaffold-header">
          <span class="scaffold-icon">💡</span>
          <span class="scaffold-label">Study Tip</span>
        </div>
        <div class="scaffold-message">${adaptiveMsg.message || hint}</div>
      </div>
    `;
  }

  /**
   * Build scaffold level indicator
   */
  buildScaffoldIndicator(scaffoldAdvice) {
    if (!scaffoldAdvice) return '';

    const levelIcons = {
      'heavy': '🛟',
      'moderate': '📚',
      'light': '🚀',
      'challenge': '⚡'
    };

    const levelLabels = {
      'heavy': 'Extra Support',
      'moderate': 'Learning',
      'light': 'Progressing',
      'challenge': 'Challenge Mode'
    };

    const icon = levelIcons[scaffoldAdvice.level] || '📚';
    const label = levelLabels[scaffoldAdvice.level] || 'Learning';

    return `
      <div class="scaffold-indicator scaffold-${scaffoldAdvice.level}">
        <span class="icon">${icon}</span>
        <span class="label">${label}</span>
      </div>
    `;
  }

  /**
   * Show adaptive encouragement based on performance
   */
  showAdaptiveMessage(scaffoldAdvice) {
    if (!scaffoldAdvice) return;

    const adaptive = scaffolding.getAdaptiveMessage(scaffoldAdvice);
    if (!adaptive.message) return;

    // Don't show too frequently
    const lastShown = this._lastAdaptiveMessage || 0;
    if (Date.now() - lastShown < 30000) return;
    this._lastAdaptiveMessage = Date.now();

    const message = document.createElement('div');
    message.className = `adaptive-message adaptive-${adaptive.type}`;
    message.innerHTML = `
      <div class="adaptive-content">
        <span class="adaptive-text">"${adaptive.message}"</span>
        <span class="adaptive-speaker">— Ms. Luminara</span>
      </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add('hiding');
      setTimeout(() => message.remove(), 500);
    }, 4000);
  }

  // ═══════════════════════════════════════════════════════════════
  // D20 RPG UI COMPONENTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show animated dice roll
   */
  showDiceRoll(rollResult, context = '') {
    const existing = document.querySelector('.dice-roll-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'dice-roll-overlay';

    const isCrit = rollResult.isCriticalSuccess || rollResult.isCriticalFailure;
    const critClass = rollResult.isCriticalSuccess ? 'crit-success' :
                      rollResult.isCriticalFailure ? 'crit-fail' : '';

    let advantageHTML = '';
    if (rollResult.type === 'advantage') {
      advantageHTML = `<div class="roll-type advantage">Advantage (${rollResult.roll1}, ${rollResult.roll2})</div>`;
    } else if (rollResult.type === 'disadvantage') {
      advantageHTML = `<div class="roll-type disadvantage">Disadvantage (${rollResult.roll1}, ${rollResult.roll2})</div>`;
    }

    let modifierHTML = '';
    if (rollResult.modifier !== undefined) {
      const sign = rollResult.modifier >= 0 ? '+' : '';
      modifierHTML = `
        <div class="roll-modifier">
          ${sign}${rollResult.modifier} ${rollResult.stat?.toUpperCase() || ''}
        </div>
        <div class="roll-total">= ${rollResult.total}</div>
      `;
    }

    overlay.innerHTML = `
      <div class="dice-container ${critClass}">
        <div class="dice-spinning">
          <div class="d20-face">🎲</div>
        </div>
        <div class="dice-result" style="display: none;">
          <div class="roll-context">${context}</div>
          <div class="roll-value ${critClass}">${rollResult.roll}</div>
          ${advantageHTML}
          ${modifierHTML}
          ${isCrit ? `<div class="crit-message">${rollResult.isCriticalSuccess ? 'NATURAL 20!' : 'NATURAL 1!'}</div>` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate: spin → reveal
    setTimeout(() => {
      overlay.querySelector('.dice-spinning').style.display = 'none';
      overlay.querySelector('.dice-result').style.display = 'block';
    }, 1000);

    // Auto-dismiss
    setTimeout(() => {
      overlay.classList.add('hiding');
      setTimeout(() => overlay.remove(), 500);
    }, isCrit ? 3500 : 2500);

    return overlay;
  }

  /**
   * Show character sheet modal
   */
  showCharacterSheet(characterData) {
    const existing = document.querySelector('.character-sheet-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'character-sheet-overlay';

    const stats = characterData.stats;
    const formatMod = (mod) => mod >= 0 ? `+${mod}` : `${mod}`;

    overlay.innerHTML = `
      <div class="character-sheet">
        <button class="close-btn" data-action="dismiss-overlay" data-target=".character-sheet-overlay">✕</button>

        <div class="cs-header">
          <div class="cs-title">${characterData.title}</div>
          <div class="cs-level">Level ${characterData.level}</div>
        </div>

        <div class="cs-stats">
          <div class="stat-block">
            <div class="stat-name">INT</div>
            <div class="stat-value">${stats.intelligence.value}</div>
            <div class="stat-mod">${formatMod(stats.intelligence.modifier)}</div>
            <div class="stat-xp-bar">
              <div class="stat-xp-fill" style="width: ${100 - stats.intelligence.xpToNext}%"></div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-name">WIS</div>
            <div class="stat-value">${stats.wisdom.value}</div>
            <div class="stat-mod">${formatMod(stats.wisdom.modifier)}</div>
            <div class="stat-xp-bar">
              <div class="stat-xp-fill" style="width: ${100 - stats.wisdom.xpToNext}%"></div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-name">CON</div>
            <div class="stat-value">${stats.constitution.value}</div>
            <div class="stat-mod">${formatMod(stats.constitution.modifier)}</div>
            <div class="stat-xp-bar">
              <div class="stat-xp-fill" style="width: ${100 - stats.constitution.xpToNext}%"></div>
            </div>
          </div>
          <div class="stat-block">
            <div class="stat-name">CHA</div>
            <div class="stat-value">${stats.charisma.value}</div>
            <div class="stat-mod">${formatMod(stats.charisma.modifier)}</div>
            <div class="stat-xp-bar">
              <div class="stat-xp-fill" style="width: ${100 - stats.charisma.xpToNext}%"></div>
            </div>
          </div>
        </div>

        <div class="cs-resources">
          <div class="resource">
            <span class="resource-icon">💡</span>
            <span class="resource-value">${characterData.insightPoints}</span>
            <span class="resource-label">Insight Points</span>
          </div>
          <div class="resource">
            <span class="resource-icon">🛡️</span>
            <span class="resource-value">${characterData.savedStreaks}</span>
            <span class="resource-label">Streaks Saved</span>
          </div>
          <div class="resource">
            <span class="resource-icon">⚔️</span>
            <span class="resource-value">${characterData.encountersCompleted}</span>
            <span class="resource-label">Encounters</span>
          </div>
        </div>

        <div class="cs-criticals">
          <div class="crit-stat nat20">
            <span class="crit-icon">✨</span>
            <span class="crit-count">${characterData.criticals.nat20s}</span>
            <span class="crit-label">Natural 20s</span>
          </div>
          <div class="crit-stat nat1">
            <span class="crit-icon">💀</span>
            <span class="crit-count">${characterData.criticals.nat1s}</span>
            <span class="crit-label">Natural 1s</span>
          </div>
        </div>

        <div class="cs-footer">
          <p class="cs-flavor">"Your journey through anatomy continues..."</p>
          <p class="cs-signature">— Ms. Luminara</p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Show skill check prompt
   */
  showSkillCheckPrompt(checkType, cost, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'skill-check-prompt';

    const currentPoints = d20System.getInsightPoints();
    const canAfford = currentPoints >= cost;

    overlay.innerHTML = `
      <div class="skill-check-card">
        <div class="check-header">
          <span class="check-icon">🎲</span>
          <span class="check-title">${checkType}</span>
        </div>
        <div class="check-cost">
          Cost: <span class="cost-value">${cost}</span> Insight Points
          <span class="current-points">(You have: ${currentPoints})</span>
        </div>
        <div class="check-description">
          Roll a Wisdom check to receive a hint. Higher rolls = better hints!
        </div>
        <div class="check-actions">
          <button class="check-btn cancel" data-action="dismiss-overlay" data-target=".skill-check-prompt">
            Cancel
          </button>
          <button class="check-btn roll ${canAfford ? '' : 'disabled'}"
                  ${canAfford ? '' : 'disabled'}
                  data-action="skill-check-roll">
            🎲 Roll for Insight
          </button>
        </div>
      </div>
    `;

    window._skillCheckCallback = callback;
    document.body.appendChild(overlay);
  }

  /**
   * Show insight check result
   */
  showInsightCheckResult(result, hint) {
    const overlay = document.createElement('div');
    overlay.className = 'insight-result-overlay';

    const qualityColors = {
      'perfect': 'var(--glow-warm)',
      'excellent': 'var(--correct)',
      'good': '#60a5fa',
      'vague': 'var(--text-dim)',
      'misleading': 'var(--incorrect)'
    };

    const qualityMessages = {
      'perfect': 'Perfect Insight!',
      'excellent': 'Excellent Insight!',
      'good': 'Helpful Insight',
      'vague': 'Murky Vision...',
      'misleading': 'The spirits mislead you...'
    };

    overlay.innerHTML = `
      <div class="insight-result-card">
        <div class="insight-roll">
          <span class="roll-label">Wisdom Check</span>
          <span class="roll-value">${result.roll.roll}</span>
          <span class="roll-modifier">${result.roll.modifier >= 0 ? '+' : ''}${result.roll.modifier}</span>
          <span class="roll-total">= ${result.roll.total}</span>
          <span class="roll-dc">vs DC ${result.dc}</span>
        </div>
        <div class="insight-quality" style="color: ${qualityColors[result.hintQuality]}">
          ${qualityMessages[result.hintQuality]}
        </div>
        <div class="insight-hint">
          "${hint}"
        </div>
        <div class="insight-points-remaining">
          💡 ${result.insightPoints} Insight Points remaining
        </div>
        <button class="insight-dismiss" data-action="dismiss-overlay" data-target=".insight-result-overlay">
          Continue
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Show saving throw prompt for streak protection
   */
  showStreakSavePrompt(currentStreak, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'streak-save-prompt';

    const cost = 2;
    const currentPoints = d20System.getInsightPoints();
    const canAfford = currentPoints >= cost;

    overlay.innerHTML = `
      <div class="streak-save-card">
        <div class="save-header">
          <span class="save-icon">🛡️</span>
          <span class="save-title">Streak in Danger!</span>
        </div>
        <div class="save-streak">
          Your streak of <span class="streak-value">${currentStreak}</span> is about to break!
        </div>
        <div class="save-cost">
          Spend <span class="cost-value">${cost}</span> Insight Points to attempt a Charisma save?
        </div>
        <div class="save-actions">
          <button class="save-btn decline" data-action="streak-save-decline">
            Let it break 💔
          </button>
          <button class="save-btn attempt ${canAfford ? '' : 'disabled'}"
                  ${canAfford ? '' : 'disabled'}
                  data-action="streak-save-attempt">
            🎲 Roll to Save!
          </button>
        </div>
      </div>
    `;

    window._streakSaveCallback = callback;
    document.body.appendChild(overlay);
  }

  /**
   * Show encounter banner
   */
  showEncounterBanner(encounter) {
    const banner = document.createElement('div');
    banner.className = `encounter-banner encounter-${encounter.encounterType}`;

    const typeEmojis = { boss: '👹', elite: '⚔️', standard: '📖' };

    let modifierHTML = '';
    if (encounter.advantage) {
      modifierHTML = `<span class="encounter-modifier advantage">Advantage: ${encounter.advantageReason}</span>`;
    } else if (encounter.disadvantage) {
      modifierHTML = `<span class="encounter-modifier disadvantage">Disadvantage: ${encounter.disadvantageReason}</span>`;
    }

    banner.innerHTML = `
      <span class="encounter-icon">${typeEmojis[encounter.encounterType]}</span>
      <span class="encounter-title">${encounter.rewards.title}</span>
      ${modifierHTML}
      ${encounter.encounterType !== 'standard' ? `<span class="encounter-reward">XP ×${encounter.rewards.xpMultiplier}</span>` : ''}
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
      banner.classList.add('hiding');
      setTimeout(() => banner.remove(), 500);
    }, 2500);
  }

  // ═══════════════════════════════════════════════════════════════
  // SCAFFOLD REMEDIATION UI
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show damage roll animation when wrong answer triggers scaffolds
   */
  showDamageRoll(damageResult, callback) {
    const existing = document.querySelector('.damage-roll-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'damage-roll-overlay';

    const isFumble = damageResult.isFumble;
    const isCrit = damageResult.isCritical;
    const overlayClass = isFumble ? 'fumble' : isCrit ? 'crit-hit' : '';

    const damageMessage = scaffoldRemediation.getDamageMessage(damageResult);

    overlay.innerHTML = `
      <div class="damage-container ${overlayClass}">
        <div class="damage-header">Wrong Answer!</div>
        <div class="dice-spinning">
          <div class="damage-dice">🎲</div>
          <div class="damage-rolling">Rolling damage...</div>
        </div>
        <div class="damage-result" style="display: none;">
          <div class="roll-value ${overlayClass}">${damageResult.roll.roll}</div>
          ${isFumble ?
            '<div class="fumble-text">FUMBLE! No damage!</div>' :
            `<div class="damage-amount">-${damageResult.finalDamage} HP</div>`
          }
          ${isCrit ? '<div class="crit-text">CRITICAL HIT!</div>' : ''}
          ${damageResult.conMod > 0 ? `<div class="con-reduction">CON reduced damage by ${damageResult.conMod}</div>` : ''}
          <div class="damage-message">"${damageMessage}"</div>
        </div>
        <div class="scaffold-notice" style="display: none;">
          <span class="scaffold-icon">📚</span>
          <span class="scaffold-text">3 scaffold questions incoming...</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animation sequence
    setTimeout(() => {
      overlay.querySelector('.dice-spinning').style.display = 'none';
      overlay.querySelector('.damage-result').style.display = 'block';
    }, 1200);

    setTimeout(() => {
      overlay.querySelector('.scaffold-notice').style.display = 'flex';
    }, 2200);

    setTimeout(() => {
      overlay.classList.add('hiding');
      setTimeout(() => {
        overlay.remove();
        if (callback) callback();
      }, 400);
    }, 3500);

    return overlay;
  }

  /**
   * Render a scaffold question card
   */
  renderScaffoldQuestion(question, scaffoldIndex, exploredOptions) {
    const area = document.getElementById('questionArea');
    if (!area) return;

    area.innerHTML = this.buildScaffoldCard(question, scaffoldIndex, exploredOptions);
  }

  /**
   * Build scaffold question card HTML
   *
   * Phase 1 Enhancement: Supports adaptive scaffold depth with soft exit.
   * Phase 2 Enhancement: Uses dedicated narrative scaffolds when available.
   */
  buildScaffoldCard(question, scaffoldIndex, exploredOptions) {
    const optionsHTML = this.buildScaffoldOptions(question, exploredOptions);
    const explorationHTML = this.buildExplorationPanel(question, exploredOptions);

    // Get intro message - pass current scaffold for narrative support
    const introMessage = scaffoldRemediation.getScaffoldIntroMessage(scaffoldIndex, question);

    // Get arc info for dedicated scaffolds
    const arcInfo = scaffoldRemediation.getScaffoldArcInfo(question);
    const isDedicated = question._isDedicatedScaffold === true;

    // Check if correct answer has been found
    const correctFound = exploredOptions.includes(question.answer);

    // Build scaffold images panel (click to load)
    const scaffoldImagesHTML = this.buildScaffoldImagesPanel(question);

    // Get adaptive session state
    const session = scaffoldRemediation.getSessionState();
    const minScaffolds = session?.minScaffolds || 2;
    const maxScaffolds = session?.maxScaffolds || 7;
    const canSoftExit = session?.canSoftExit || false;
    const depth = session?.depth || scaffoldIndex;

    // Build adaptive progress indicator
    const progressHTML = this.buildAdaptiveProgressIndicator(scaffoldIndex, minScaffolds, maxScaffolds);

    // Soft exit button (only shown after minimum scaffolds)
    const softExitHTML = canSoftExit && correctFound ? `
      <button class="scaffold-soft-exit-btn" data-action="soft-exit-scaffold" title="Take a break - this question will resurface later">
        Pause for now
      </button>
    ` : '';

    // Build arc badge for dedicated scaffolds
    const arcBadgeHTML = isDedicated ? `
      <span class="scaffold-arc-badge arc-${arcInfo.arc}" title="${arcInfo.arcTitle}">
        Arc ${arcInfo.arc}: ${arcInfo.arcTitle}
      </span>
    ` : '';

    // Speaker name changes for dedicated scaffolds with narrative
    const speakerName = isDedicated ? 'Ms. Luminara (Magic School Bus)' : 'Ms. Luminara';

    return `
      <div class="question-card scaffold-card ${isDedicated ? 'narrative-scaffold' : ''}">
        <div class="scaffold-header">
          <span class="scaffold-badge">Scaffold ${scaffoldIndex + 1} of ${minScaffolds}-${maxScaffolds}</span>
          ${arcBadgeHTML}
          <span class="scaffold-purpose">${isDedicated ? arcInfo.arcTitle : 'Building understanding...'}</span>
        </div>

        <div class="luminara-scaffold-intro ${isDedicated ? 'narrative-mode' : ''}">
          <div class="speaker">${speakerName}</div>
          <p>"${introMessage}"</p>
        </div>

        <div class="q-text">${this.renderText(question.q)}</div>

        ${scaffoldImagesHTML}

        <div class="options">${optionsHTML}</div>

        ${explorationHTML}

        ${progressHTML}

        ${correctFound ? `
          <div class="scaffold-next-container">
            <button class="scaffold-next-btn" data-action="next-scaffold">
              Continue Scaffolding →
            </button>
            ${softExitHTML}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Build adaptive progress indicator for scaffolding
   *
   * Shows: completed dots, active dot, remaining range
   * Example: [1][2][3]•[4-7]
   */
  buildAdaptiveProgressIndicator(currentIndex, minScaffolds, maxScaffolds) {
    const dots = [];

    // Completed scaffolds
    for (let i = 0; i < currentIndex; i++) {
      dots.push(`<span class="dot completed" title="Scaffold ${i + 1} completed">${i + 1}</span>`);
    }

    // Current scaffold
    dots.push(`<span class="dot active" title="Current scaffold">${currentIndex + 1}</span>`);

    // Minimum remaining (guaranteed)
    const minRemaining = Math.max(0, minScaffolds - currentIndex - 1);
    for (let i = 0; i < minRemaining; i++) {
      const num = currentIndex + 2 + i;
      dots.push(`<span class="dot upcoming" title="Scaffold ${num}">${num}</span>`);
    }

    // Adaptive range indicator (if more possible)
    const adaptiveStart = Math.max(minScaffolds, currentIndex + 2);
    if (adaptiveStart <= maxScaffolds) {
      dots.push(`<span class="dot-range" title="Additional scaffolds if needed">${adaptiveStart}-${maxScaffolds}</span>`);
    }

    return `
      <div class="scaffold-progress adaptive">
        <div class="progress-dots">
          ${dots.join('')}
        </div>
        <div class="progress-hint">
          ${currentIndex < minScaffolds - 1
            ? `${minScaffolds - currentIndex - 1} more required`
            : 'Continue until insight achieved'}
        </div>
      </div>
    `;
  }

  /**
   * Build click-to-load images panel for scaffolds
   * Shows collapsible image gallery that loads on click
   */
  buildScaffoldImagesPanel(question) {
    if (typeof AnatomyDiagrams === 'undefined') return '';

    // Get images for this scaffold question
    const images = this.getScaffoldImages(question);
    if (!images || images.length === 0) return '';

    const containerId = `scaffold-images-${question.q?.substring(0, 10).replace(/\W/g, '') || Math.random().toString(36).substr(2, 9)}`;

    return `
      <div class="scaffold-images-panel" id="${containerId}">
        <button class="scaffold-images-toggle" data-action="toggle-scaffold-images" data-container="${containerId}">
          <span class="toggle-icon">📷</span>
          <span class="toggle-text">Show Reference Images (${images.length})</span>
          <span class="toggle-arrow">▼</span>
        </button>
        <div class="scaffold-images-content" style="display: none;" data-images='${JSON.stringify(images)}'>
          <div class="scaffold-images-loading">Click to load images...</div>
        </div>
      </div>
    `;
  }

  /**
   * Get relevant images for a scaffold question
   */
  getScaffoldImages(question) {
    if (typeof AnatomyDiagrams === 'undefined' || !AnatomyDiagrams.manifestLoaded) return [];

    const images = [];
    const qText = (question.q || '').toLowerCase();

    // Check if question has explicit images array
    if (question.images && Array.isArray(question.images)) {
      return question.images;
    }

    // Search for relevant diagrams based on question content
    const diagramInfo = AnatomyDiagrams.getDiagramForQuestion(question);
    if (diagramInfo && diagramInfo.file) {
      images.push({
        file: diagramInfo.file,
        title: diagramInfo.title || 'Reference Diagram',
        source: diagramInfo.source || 'Wikipedia'
      });
    }

    // For comprehensive exam questions (800.x), add multiple related images
    if (question.id && question.id.startsWith('800.')) {
      const additionalImages = this.getComprehensiveExamImages(question);
      images.push(...additionalImages);
    }

    return images;
  }

  /**
   * Get additional images for comprehensive exam questions
   */
  getComprehensiveExamImages(question) {
    const images = [];
    const qText = (question.q || '').toLowerCase();

    // Map keywords to multiple relevant images for lab exam prep
    const imageMap = {
      'spinal cord smear': [
        { file: '611-anatomy/611.018-tissues/Blausen_0657_MultipolarNeuron.png', title: 'Multipolar Neuron' },
        { file: '611-anatomy/611.018-tissues/Neuroglia.png', title: 'Neuroglia' },
        { file: '611-anatomy/611.018-tissues/Blausen_0672_NeuralTissue.png', title: 'Neural Tissue' }
      ],
      'multipolar': [
        { file: '611-anatomy/611.018-tissues/Blausen_0657_MultipolarNeuron.png', title: 'Multipolar Neuron' },
        { file: '612-physiology/612.81-nerves/Structural_classification_of_neurons_by_polarity_hariadhi.svg.png', title: 'Neuron Types by Polarity' }
      ],
      'neuroglia': [
        { file: '611-anatomy/611.018-tissues/Glial_Cell_Types.png', title: 'Glial Cell Types' },
        { file: '611-anatomy/611.018-tissues/Blausen_0870_TypesofNeuroglia.png', title: 'Types of Neuroglia' }
      ],
      'myelin': [
        { file: '611-anatomy/611.018-tissues/Myelin_sheath_(1).svg.png', title: 'Myelin Sheath' },
        { file: '611-anatomy/611.018-tissues/Myelinated_neuron.jpg', title: 'Myelinated Neuron' },
        { file: '611-anatomy/611.018-tissues/Neuron_with_oligodendrocyte_and_myelin_sheath.svg.png', title: 'Oligodendrocyte & Myelin' }
      ],
      'nerve fiber': [
        { file: '611-anatomy/611.018-tissues/Myelinated_neuron.jpg', title: 'Myelinated Nerve Fiber' },
        { file: '611-anatomy/611.018-tissues/1210_Glial_Cells_of_the_PNS.jpg', title: 'PNS Glial Cells' }
      ],
      'spinal cord cross': [
        { file: '611-anatomy/611.018-tissues/Spinal_Cord_Sectional_Anatomy.png', title: 'Spinal Cord Section' },
        { file: '612-physiology/612.81-nerves/Medulla_spinalis_-_Section_-_English.svg.png', title: 'Spinal Cord Anatomy' },
        { file: '611-anatomy/611.018-tissues/Rabbitspinalcord100x1.jpg', title: 'Spinal Cord Histology' }
      ],
      'gray matter': [
        { file: '611-anatomy/611.018-tissues/Spinal_Cord_Sectional_Anatomy.png', title: 'Gray & White Matter' },
        { file: '612-physiology/612.81-nerves/Medulla_spinalis_-_Section_-_English.svg.png', title: 'Spinal Cord Section' }
      ],
      'white matter': [
        { file: '611-anatomy/611.018-tissues/Spinal_Cord_Sectional_Anatomy.png', title: 'Gray & White Matter' },
        { file: '612-physiology/612.81-nerves/Spinal_cord_tracts_-_English.svg.png', title: 'Spinal Cord Tracts' }
      ],
      'dorsal': [
        { file: '611-anatomy/611.018-tissues/Spinal_Cord_Sectional_Anatomy.png', title: 'Spinal Cord Horns' },
        { file: '612-physiology/612.81-nerves/Diagram_of_the_spinal_cord_CRUK_046.svg.png', title: 'Spinal Cord Diagram' }
      ],
      'ventral': [
        { file: '611-anatomy/611.018-tissues/Spinal_Cord_Sectional_Anatomy.png', title: 'Spinal Cord Horns' },
        { file: '612-physiology/612.81-nerves/Diagram_of_the_spinal_cord_CRUK_046.svg.png', title: 'Spinal Cord Diagram' }
      ]
    };

    // Find matching images based on question text
    for (const [keyword, imgs] of Object.entries(imageMap)) {
      if (qText.includes(keyword)) {
        for (const img of imgs) {
          // Avoid duplicates
          if (!images.find(i => i.file === img.file)) {
            images.push({ ...img, source: 'Wikipedia' });
          }
        }
      }
    }

    return images;
  }

  /**
   * Toggle scaffold images panel and load images on first open
   */
  toggleScaffoldImages(containerId) {
    const panel = document.getElementById(containerId);
    if (!panel) return;

    const content = panel.querySelector('.scaffold-images-content');
    const toggle = panel.querySelector('.scaffold-images-toggle');
    const arrow = panel.querySelector('.toggle-arrow');

    if (!content) return;

    const isHidden = content.style.display === 'none';

    if (isHidden) {
      // Show content
      content.style.display = 'block';
      arrow.textContent = '▲';
      toggle.querySelector('.toggle-text').textContent = 'Hide Reference Images';

      // Load images if not already loaded
      if (content.querySelector('.scaffold-images-loading')) {
        this.loadScaffoldImages(content);
      }
    } else {
      // Hide content
      content.style.display = 'none';
      arrow.textContent = '▼';
      const imageData = content.getAttribute('data-images');
      const images = imageData ? JSON.parse(imageData) : [];
      toggle.querySelector('.toggle-text').textContent = `Show Reference Images (${images.length})`;
    }
  }

  /**
   * Load scaffold images into the content area
   */
  loadScaffoldImages(content) {
    const imageData = content.getAttribute('data-images');
    if (!imageData) return;

    const images = JSON.parse(imageData);
    if (!images || images.length === 0) {
      content.innerHTML = '<div class="scaffold-images-empty">No images available</div>';
      return;
    }

    const basePath = typeof AnatomyDiagrams !== 'undefined' ? AnatomyDiagrams.ASSETS_PATH : 'assets/diagrams';

    content.innerHTML = `
      <div class="scaffold-images-grid">
        ${images.map((img, idx) => `
          <div class="scaffold-image-item">
            <img src="${basePath}/${img.file}"
                 alt="${this.escapeHtml(img.title)}"
                 class="scaffold-image"
                 data-action="show-diagram"
                 data-diagram-file="${img.file}"
                 data-diagram-title="${this.escapeHtml(img.title)}"
                 data-diagram-source="${img.source || 'Wikipedia'}"
                 onerror="this.parentElement.style.display='none'"
                 loading="lazy">
            <div class="scaffold-image-caption">${this.escapeHtml(img.title)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Show heal animation when scaffold answer is correct
   */
  showScaffoldHeal(healResult) {
    if (!healResult || healResult.healed <= 0) return;

    const popup = document.createElement('div');
    popup.className = 'scaffold-heal-popup';
    popup.innerHTML = `
      <div class="heal-icon">💚</div>
      <div class="heal-amount">+${healResult.healed} HP</div>
      <div class="heal-message">${scaffoldRemediation.getHealMessage(healResult)}</div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add('hiding');
      setTimeout(() => popup.remove(), 400);
    }, 1500);
  }

  /**
   * Show scaffold completion summary
   *
   * Phase 1 Enhancement: Displays adaptive completion with Ms. Luminara exit message.
   */
  showScaffoldComplete(summary) {
    const popup = document.createElement('div');
    popup.className = 'scaffold-complete-popup';

    const scaffoldDepth = summary.scaffoldDepth || 3;
    const successRate = Math.round((summary.correctCount / scaffoldDepth) * 100);

    // Determine completion icon and title based on exit reason
    let icon = '✅';
    let title = 'Scaffolds Complete';
    let cardClass = '';

    if (summary.insightAchieved) {
      icon = '💡';
      title = 'Insight Achieved!';
      cardClass = 'insight-achieved';
    } else if (summary.exitReason === 'maximum_reached') {
      icon = '📚';
      title = 'Let Me Explain';
      cardClass = 'maximum-reached';
    } else if (summary.exitReason === 'soft_exit_taken') {
      icon = '⏸️';
      title = 'Paused for Now';
      cardClass = 'soft-exit';
    }

    // Get Ms. Luminara's exit message
    const exitMessage = summary.exitMessage ||
      (successRate >= 67 ? 'The foundation is stronger now.' : 'Every step forward matters.');

    // Build metrics display
    const metricsHTML = summary.metrics ? `
      <div class="complete-metrics">
        <span class="metric" title="Accuracy">${summary.metrics.accuracy}% accurate</span>
        ${summary.metrics.avgTimeMs > 0 ? `<span class="metric" title="Average response time">${Math.round(summary.metrics.avgTimeMs / 1000)}s avg</span>` : ''}
      </div>
    ` : '';

    // Build confidence indicator for insight
    const confidenceHTML = summary.insightAchieved && summary.finalEvaluation?.confidence ? `
      <div class="insight-confidence">
        <div class="confidence-bar" style="width: ${Math.round(summary.finalEvaluation.confidence * 100)}%"></div>
        <span class="confidence-label">Understanding: ${Math.round(summary.finalEvaluation.confidence * 100)}%</span>
      </div>
    ` : '';

    popup.innerHTML = `
      <div class="scaffold-complete-card ${cardClass}">
        <div class="complete-header">
          <span class="complete-icon">${icon}</span>
          <span class="complete-title">${title}</span>
        </div>

        <div class="complete-stats">
          <div class="stat">
            <span class="value">${summary.correctCount}/${scaffoldDepth}</span>
            <span class="label">Correct</span>
          </div>
          <div class="stat">
            <span class="value">+${summary.totalHealed}</span>
            <span class="label">HP Healed</span>
          </div>
          <div class="stat">
            <span class="value">${scaffoldDepth}</span>
            <span class="label">Scaffolds</span>
          </div>
        </div>

        ${confidenceHTML}
        ${metricsHTML}

        <div class="complete-message luminara-voice">
          <span class="speaker">Ms. Luminara:</span>
          "${this.escapeHtml(exitMessage)}"
        </div>

        <button class="complete-continue" data-action="dismiss-overlay" data-target=".scaffold-complete-popup">
          Continue →
        </button>
      </div>
    `;

    document.body.appendChild(popup);
  }

  /**
   * Show knockout message when HP reaches 0
   */
  showKnockout() {
    const overlay = document.createElement('div');
    overlay.className = 'knockout-overlay';

    const message = scaffoldRemediation.getKnockoutMessage();

    overlay.innerHTML = `
      <div class="knockout-card">
        <div class="knockout-icon">💫</div>
        <div class="knockout-title">Knocked Down!</div>
        <div class="knockout-message">"${message}"</div>
        <div class="knockout-effect">
          <div class="effect-item">HP restored to full</div>
          <div class="effect-item penalty">XP gains halved this session</div>
        </div>
        <button class="knockout-continue" data-action="dismiss-overlay" data-target=".knockout-overlay">
          Rise Again →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Render mini character stats in stats bar
   */
  renderCharacterMini() {
    if (typeof d20System === 'undefined' || !d20System) return '';

    try {
      const sheet = d20System.getCharacterSheet();
      if (!sheet || !sheet.stats) return '';

      const formatMod = (mod) => mod >= 0 ? `+${mod}` : `${mod}`;

      return `
        <div class="char-mini" data-action="open-character-sheet">
          <span class="char-title">${sheet.title}</span>
          <div class="char-stats-mini">
            <span title="Intelligence">🧠${formatMod(sheet.stats.intelligence.modifier)}</span>
            <span title="Wisdom">👁️${formatMod(sheet.stats.wisdom.modifier)}</span>
            <span title="Charisma">✨${formatMod(sheet.stats.charisma.modifier)}</span>
          </div>
          <span class="insight-points">💡${sheet.insightPoints}</span>
        </div>
        <button class="inventory-btn" data-action="open-inventory" title="Inventory & Equipment">
          🎒
        </button>
      `;
    } catch (e) {
      console.warn('[D20] renderCharacterMini error:', e);
      return '';
    }
  }

  // Voice system removed - see voice-work folder for archived code


  // ═══════════════════════════════════════════════════════════════
  // PAPERDOLL & INVENTORY UI
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show full inventory and paperdoll screen
   */
  showInventory() {
    // Guard: check lootSystem exists
    if (typeof lootSystem === 'undefined' || !lootSystem) {
      console.warn('[D20] lootSystem not initialized');
      return;
    }

    const existing = document.querySelector('.inventory-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'inventory-overlay';

    try {
      var equipped = lootSystem.getEquipped() || {};
      var inventory = lootSystem.getInventory() || [];
      var gems = lootSystem.getGems() || [];
      var gold = lootSystem.getGold() || 0;
      var equipStats = lootSystem.calculateEquipmentStats() || {};
      var setBonuses = lootSystem.getActiveSetBonuses() || [];
    } catch (e) {
      console.warn('[D20] Error getting loot data:', e);
      var equipped = {};
      var inventory = [];
      var gems = [];
      var gold = 0;
      var equipStats = {};
      var setBonuses = [];
    }

    overlay.innerHTML = `
      <div class="inventory-panel">
        <button class="close-btn" data-action="dismiss-overlay" data-target=".inventory-overlay">✕</button>

        <div class="inv-header">
          <h2>Equipment & Inventory</h2>
          <div class="gold-display">💰 ${gold.toLocaleString()} Gold</div>
        </div>

        <div class="inv-content">
          <!-- Paperdoll -->
          <div class="paperdoll-section">
            <h3>Equipped</h3>
            <div class="paperdoll">
              ${this.renderPaperdoll(equipped)}
            </div>

            <!-- Equipment Stats Summary -->
            <div class="equip-stats">
              <h4>Equipment Bonuses</h4>
              <div class="stat-row"><span>INT</span><span class="stat-val">+${equipStats.intelligence || 0}</span></div>
              <div class="stat-row"><span>WIS</span><span class="stat-val">+${equipStats.wisdom || 0}</span></div>
              <div class="stat-row"><span>CON</span><span class="stat-val">+${equipStats.constitution || 0}</span></div>
              <div class="stat-row"><span>CHA</span><span class="stat-val">+${equipStats.charisma || 0}</span></div>
              ${equipStats.xpBonus ? `<div class="stat-row bonus"><span>XP Bonus</span><span class="stat-val">+${equipStats.xpBonus}%</span></div>` : ''}
              ${equipStats.streakBonus ? `<div class="stat-row bonus"><span>Streak Bonus</span><span class="stat-val">+${equipStats.streakBonus}%</span></div>` : ''}
              ${equipStats.luckyChance ? `<div class="stat-row bonus"><span>Lucky Chance</span><span class="stat-val">+${equipStats.luckyChance}%</span></div>` : ''}
            </div>

            <!-- Set Bonuses -->
            ${setBonuses.length > 0 ? `
              <div class="set-bonuses">
                <h4>Set Bonuses</h4>
                ${setBonuses.map(set => `
                  <div class="set-info">
                    <div class="set-name">${set.name} (${set.equipped}/${set.total})</div>
                    ${set.bonuses.map(b => `<div class="set-bonus active">${b}</div>`).join('')}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- Inventory Grid -->
          <div class="inventory-section">
            <h3>Inventory (${inventory.length})</h3>
            <div class="inventory-grid">
              ${inventory.map(item => this.renderInventoryItem(item)).join('')}
              ${inventory.length === 0 ? '<div class="empty-inv">No items yet. Answer questions to find loot!</div>' : ''}
            </div>

            <!-- Gems Section -->
            <h3>Gems (${gems.length})</h3>
            <div class="gems-grid">
              ${gems.map(gem => this.renderGem(gem)).join('')}
              ${gems.length === 0 ? '<div class="empty-inv">No gems yet.</div>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Render the paperdoll equipment slots
   */
  renderPaperdoll(equipped) {
    const slots = [
      ['HEAD'],
      ['SHOULDERS', 'NECK', 'MAINHAND'],
      ['CHEST', 'HANDS', 'OFFHAND'],
      ['WAIST'],
      ['LEGS'],
      ['RING_L', 'FEET', 'RING_R']
    ];

    const slotInfo = {
      HEAD: { icon: '🎓', name: 'Head' },
      NECK: { icon: '📿', name: 'Amulet' },
      SHOULDERS: { icon: '🦺', name: 'Shoulders' },
      CHEST: { icon: '🥼', name: 'Chest' },
      HANDS: { icon: '🧤', name: 'Hands' },
      WAIST: { icon: '🎗️', name: 'Belt' },
      LEGS: { icon: '👖', name: 'Legs' },
      FEET: { icon: '👢', name: 'Feet' },
      RING_L: { icon: '💍', name: 'Left Ring' },
      RING_R: { icon: '💍', name: 'Right Ring' },
      MAINHAND: { icon: '📚', name: 'Main Hand' },
      OFFHAND: { icon: '📖', name: 'Off Hand' }
    };

    return slots.map(row => `
      <div class="paperdoll-row">
        ${row.map(slot => {
          const item = equipped[slot];
          const info = slotInfo[slot];
          const rarityColor = item ? this.getRarityColor(item.rarity) : 'var(--border)';

          return `
            <div class="equip-slot ${item ? 'filled' : 'empty'}"
                 style="border-color: ${rarityColor}"
                 ${item ? `data-action="show-item-detail" data-item-id="${item.id}" data-is-equipped="true"` : ''}
                 title="${item ? item.name : info.name}">
              <span class="slot-icon">${item ? (item.icon || info.icon) : info.icon}</span>
              ${item ? `<span class="item-level">${item.level}</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  }

  /**
   * Render an inventory item
   */
  renderInventoryItem(item) {
    const rarityColor = this.getRarityColor(item.rarity);

    return `
      <div class="inv-item" style="border-color: ${rarityColor}"
           data-action="show-item-detail" data-item-id="${item.id}" data-is-equipped="false">
        <span class="item-icon">${item.icon || '📦'}</span>
        <span class="item-level">${item.level}</span>
        ${item.sockets > 0 ? `<span class="socket-indicator">${'◇'.repeat(item.sockets - (item.gems?.length || 0))}${'◆'.repeat(item.gems?.length || 0)}</span>` : ''}
      </div>
    `;
  }

  /**
   * Render a gem
   */
  renderGem(gem) {
    return `
      <div class="inv-gem" style="border-color: ${gem.color}"
           data-action="show-gem-detail" data-gem-id="${gem.id}"
           title="${gem.tierName} ${gem.name}">
        <span class="gem-icon">${gem.icon}</span>
        <span class="gem-tier">${gem.tierName.charAt(0)}</span>
      </div>
    `;
  }

  /**
   * Show detailed item view
   */
  showItemDetail(itemId, isEquipped) {
    const item = isEquipped ?
      Object.values(lootSystem.getEquipped()).find(i => i && i.id === itemId) :
      lootSystem.getInventory().find(i => i.id === itemId);

    if (!item) return;

    const existing = document.querySelector('.item-detail-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'item-detail-overlay';

    const rarityInfo = this.getRarityInfo(item.rarity);

    overlay.innerHTML = `
      <div class="item-detail" style="border-color: ${rarityInfo.color}">
        <div class="item-header" style="background: linear-gradient(135deg, ${rarityInfo.color}22, transparent)">
          <span class="item-icon-large">${item.icon || '📦'}</span>
          <div class="item-title">
            <div class="item-name" style="color: ${rarityInfo.color}">${item.name}</div>
            <div class="item-type">${rarityInfo.name} ${item.typeKey?.replace(/_/g, ' ') || 'Item'}</div>
          </div>
        </div>

        <div class="item-level-req">Item Level ${item.level}</div>

        ${item.lore ? `<div class="item-lore">"${item.lore}"</div>` : ''}

        <div class="item-stats">
          ${Object.entries(item.stats).map(([stat, val]) => {
            if (val === 0) return '';
            const isPercent = ['xpBonus', 'streakBonus', 'luckyChance', 'revengeBonus'].includes(stat);
            return `<div class="item-stat">+${val}${isPercent ? '%' : ''} ${this.formatStatName(stat)}</div>`;
          }).join('')}
        </div>

        ${item.special ? `<div class="item-special">${item.special}</div>` : ''}

        ${item.sockets > 0 ? `
          <div class="item-sockets">
            <div class="socket-label">Sockets:</div>
            <div class="socket-row">
              ${Array(item.sockets).fill(0).map((_, i) => {
                const gem = item.gems?.[i];
                return `<span class="socket ${gem ? 'filled' : 'empty'}" style="${gem ? `color: ${gem.color}` : ''}">${gem ? gem.icon : '◇'}</span>`;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${item.setId ? `
          <div class="item-set-info">
            <div class="set-name-label">${item.setName}</div>
          </div>
        ` : ''}

        <div class="item-actions">
          ${isEquipped ?
            `<button class="item-btn unequip" data-action="unequip-item" data-item-type="${item.type}">Unequip</button>` :
            `<button class="item-btn equip" data-action="equip-item" data-item-id="${item.id}">Equip</button>
             <button class="item-btn sell" data-action="sell-item" data-item-id="${item.id}" data-sell-price="${this.getItemSellPrice(item)}">Sell (${this.getItemSellPrice(item)}g)</button>`
          }
          <button class="item-btn close" data-action="dismiss-overlay" data-target=".item-detail-overlay">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  getRarityColor(rarity) {
    const colors = {
      COMMON: '#9ca3af',
      UNCOMMON: '#22c55e',
      RARE: '#3b82f6',
      EPIC: '#a855f7',
      LEGENDARY: '#f59e0b',
      UNIQUE: '#06b6d4'
    };
    return colors[rarity] || colors.COMMON;
  }

  getRarityInfo(rarity) {
    const info = {
      COMMON: { name: 'Common', color: '#9ca3af' },
      UNCOMMON: { name: 'Uncommon', color: '#22c55e' },
      RARE: { name: 'Rare', color: '#3b82f6' },
      EPIC: { name: 'Epic', color: '#a855f7' },
      LEGENDARY: { name: 'Legendary', color: '#f59e0b' },
      UNIQUE: { name: 'Unique', color: '#06b6d4' }
    };
    return info[rarity] || info.COMMON;
  }

  formatStatName(stat) {
    const names = {
      intelligence: 'Intelligence',
      wisdom: 'Wisdom',
      constitution: 'Constitution',
      charisma: 'Charisma',
      xpBonus: 'XP Bonus',
      streakBonus: 'Streak Bonus',
      luckyChance: 'Lucky Strike Chance',
      insightBonus: 'Insight Points',
      revengeBonus: 'Revenge Bonus',
      allStats: 'All Stats'
    };
    return names[stat] || stat;
  }

  getItemSellPrice(item) {
    const rarityMultiplier = { COMMON: 5, UNCOMMON: 15, RARE: 50, EPIC: 150, LEGENDARY: 500, UNIQUE: 1000 };
    return Math.floor((item.level * 10) * (rarityMultiplier[item.rarity] || 5) / 10);
  }

  /**
   * Show loot drop notification
   */
  showLootDrop(drops) {
    if (!drops || drops.length === 0) return;

    const container = document.createElement('div');
    container.className = 'loot-drop-container';

    drops.forEach((drop, index) => {
      const notification = document.createElement('div');
      notification.className = 'loot-drop';
      notification.style.animationDelay = `${index * 0.15}s`;

      if (drop.type === 'gold') {
        notification.innerHTML = `
          <span class="loot-icon">💰</span>
          <span class="loot-text">+${drop.amount} Gold</span>
        `;
        notification.classList.add('gold-drop');
      } else if (drop.type === 'gem') {
        notification.innerHTML = `
          <span class="loot-icon">${drop.icon}</span>
          <span class="loot-text" style="color: ${drop.color}">${drop.tierName} ${drop.name}</span>
        `;
        notification.classList.add('gem-drop');
      } else {
        const rarityColor = this.getRarityColor(drop.rarity);
        notification.innerHTML = `
          <span class="loot-icon">${drop.icon || '📦'}</span>
          <span class="loot-text" style="color: ${rarityColor}">${drop.name}</span>
        `;
        notification.classList.add(`rarity-${drop.rarity.toLowerCase()}`);
      }

      container.appendChild(notification);
    });

    document.body.appendChild(container);

    // Remove after animation
    setTimeout(() => container.remove(), 4000);
  }

  /**
   * Show gem detail
   */
  showGemDetail(gemId) {
    const gem = lootSystem.getGems().find(g => g.id === gemId);
    if (!gem) return;

    const overlay = document.createElement('div');
    overlay.className = 'item-detail-overlay';

    overlay.innerHTML = `
      <div class="item-detail gem-detail" style="border-color: ${gem.color}">
        <div class="item-header" style="background: linear-gradient(135deg, ${gem.color}22, transparent)">
          <span class="item-icon-large">${gem.icon}</span>
          <div class="item-title">
            <div class="item-name" style="color: ${gem.color}">${gem.tierName} ${gem.name}</div>
            <div class="item-type">Gem</div>
          </div>
        </div>

        <div class="item-stats">
          <div class="item-stat">+${gem.statBonus}${gem.isPercent ? '%' : ''} ${this.formatStatName(gem.stat)}</div>
        </div>

        <div class="gem-socket-info">
          Socket into equipment to gain bonus stats
        </div>

        <div class="item-actions">
          <button class="item-btn close" data-action="dismiss-overlay" data-target=".item-detail-overlay">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Build options buttons - uses scroll templates if available and enabled
   */
  buildOptions(question, exploredOptions) {
    // Check if card templates should be used
    const useScrolls = typeof CardTemplates !== 'undefined' &&
                       localStorage.getItem('quiz_use_scroll_templates') !== 'false';

    if (useScrolls) {
      return this.buildScrollOptions(question, exploredOptions);
    }

    return this.buildClassicOptions(question, exploredOptions);
  }

  /**
   * Build classic button-style options
   */
  buildClassicOptions(question, exploredOptions) {
    return question.options.map((opt, i) => {
      const explored = exploredOptions.includes(i);
      const isCorrect = i === question.answer;
      let classes = 'option-btn';

      if (explored) {
        classes += isCorrect ? ' correct-answer' : ' wrong-answer';
      }

      return `
        <button class="${classes}" data-action="explore-option" data-option-index="${i}">
          <span>${this.renderText(opt)}</span>
          <span class="explore-icon">explore →</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Build scroll-style options using CardTemplates
   */
  buildScrollOptions(question, exploredOptions) {
    return `<div class="answer-scrolls-container">
      ${question.options.map((opt, i) => {
        const explored = exploredOptions.includes(i);
        const isCorrect = i === question.answer;
        const letter = String.fromCharCode(65 + i);

        let stateClass = '';
        if (explored) {
          stateClass = isCorrect ? 'correct' : 'incorrect';
        }

        return `
          <div class="answer-scroll ${stateClass}" data-index="${i}" data-action="explore-option" data-option-index="${i}">
            <div class="answer-letter">${letter}</div>
            <div class="answer-text">${this.renderText(opt)}</div>
          </div>
        `;
      }).join('')}
    </div>`;
  }

  /**
   * Build scaffold option buttons (use exploreScaffoldOption handler)
   */
  buildScaffoldOptions(question, exploredOptions) {
    return question.options.map((opt, i) => {
      const explored = exploredOptions.includes(i);
      const isCorrect = i === question.answer;
      let classes = 'option-btn scaffold-option';

      if (explored) {
        classes += isCorrect ? ' correct-answer' : ' wrong-answer';
      }

      return `
        <button class="${classes}" data-action="explore-scaffold-option" data-option-index="${i}">
          <span>${this.renderText(opt)}</span>
          <span class="explore-icon">explore →</span>
        </button>
      `;
    }).join('');
  }

  /**
   * Ms. Luminara intro messages - GM antagonist style
   * She's rooting for your failure (lovingly) and narrating like a dungeon master
   */
  warmup1Intros = [
    "Oh good, you're still here. Let's see if you survive this warmup. *rolls dice behind screen* The odds are... not in your favor.",
    "A warmup question approaches! Don't worry, I made this one EXTRA tricky. You're welcome. 🎲",
    "Before I unleash the main question, let me soften you up with this. Think of it as... tenderizing the meat.",
    "Ah, my favorite part — watching confidence slowly drain from a student's eyes. Let's begin with something simple... ish.",
    "*shuffles papers ominously* This warmup has claimed many victims. Will you be next? Only one way to find out."
  ];

  warmup2Intros = [
    "Still standing? Impressive. But this second warmup was specifically designed to destroy overconfident students. Proceed.",
    "One warmup down, one to go. I'm contractually obligated to tell you this gets harder. *grins*",
    "The plot thickens! Your warmup streak means nothing if you fumble here. No pressure. 😈",
    "Ooh, you're doing well. I HATE when students do well. Quick, let me check my notes for something harder...",
    "Second warmup! Fun fact: 73% of students who reach this point still fail the main question. I made that stat up, but it FEELS true."
  ];

  mainIntros = [
    "AND NOW... the main event! Everything you've done was merely a prelude to your inevitable— I mean, to this moment.",
    "*dramatic music plays* The main question arrives. I've been saving this one. It's my favorite because it's MEAN.",
    "The warmups are over. Now face the REAL question. I believe in you! (That's a lie. I believe in your failure.)",
    "This is it. The big one. The question that separates the scholars from the... well, everyone else. Choose wisely. Or don't. I'm entertained either way.",
    "Main question time! I hand-picked this one because I knew it would cause maximum confusion. You're welcome for the learning opportunity. 📚"
  ];

  /**
   * Build Ms. Luminara intro
   * @param {Array} exploredOptions - Options already explored
   * @param {string} phase - Current phase (warmup1, warmup2, main)
   * @param {string} questionText - The question text to read after intro
   */
  buildIntro(exploredOptions, phase, questionText = '') {
    if (exploredOptions.length > 0) return '';

    let messages;
    if (phase === 'warmup1') {
      messages = this.warmup1Intros;
    } else if (phase === 'warmup2') {
      messages = this.warmup2Intros;
    } else {
      messages = this.mainIntros;
    }

    // Pick a random intro for variety
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Add insight button for main phase
    const insightBtn = phase === 'main' && typeof d20System !== 'undefined' ?
      `<button class="insight-btn" data-action="roll-for-insight" ${d20System.canAfford(1) ? '' : 'disabled'}>
        🎲 Roll for Insight (1💡)
      </button>` : '';

    return `
      <div class="luminara-intro">
        <div class="speaker">Ms. Luminara</div>
        <p>"${message}"</p>
        ${insightBtn}
      </div>
    `;
  }

  /**
   * Build exploration panel for the last explored option
   */
  buildExplorationPanel(question, exploredOptions) {
    if (exploredOptions.length === 0) return '';

    const lastExplored = exploredOptions[exploredOptions.length - 1];
    const isCorrect = lastExplored === question.answer;

    if (!question.optionExplains || !question.optionExplains[lastExplored]) {
      // Fallback for warmup questions without detailed explains
      return `
        <div class="exploration-panel visible">
          <h3>${isCorrect ? '✓ Correct!' : '✗ Not quite...'}</h3>
          <div class="content">
            <p>${this.renderText(question.explain || '')}</p>
          </div>
          <div class="verdict ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect
              ? 'This is the right answer.'
              : 'The correct answer is: ' + this.renderText(question.options[question.answer])}
          </div>
        </div>
      `;
    }

    const exp = question.optionExplains[lastExplored];

    return `
      <div class="exploration-panel visible">
        <h3>${isCorrect ? '✓ Correct!' : '✗ Not quite...'}</h3>
        <div class="content">
          <p>${this.renderText(exp.text)}</p>
        </div>
        <div class="verdict ${exp.verdict}">
          ${isCorrect
            ? 'This is the right answer.'
            : 'The correct answer is: ' + this.renderText(question.options[question.answer])}
        </div>
      </div>
    `;
  }

  /**
   * Build mechanism tour (shown after correct answer is explored)
   */
  buildMechanismTour(question, exploredOptions) {
    // Only show if the correct answer has been explored
    if (!exploredOptions.includes(question.answer)) return '';
    if (!question.mechanism) return '';

    const m = question.mechanism;

    return `
      <div class="mechanism-tour visible">
        <h3>🔬 Mechanism Tour: ${this.escapeHtml(m.title)}</h3>
        <div class="content">
          <p>${this.escapeHtml(m.content)}</p>
          ${m.metaphor ? `
            <div class="metaphor">
              <div class="label">Ms. Luminara's Metaphor</div>
              ${this.escapeHtml(m.metaphor)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Render text with math support
   * Escapes HTML but renders LaTeX math expressions using KaTeX
   * @param {string} text - Text potentially containing math ($...$, $$...$$)
   * @returns {string} Safe HTML with rendered math
   */
  renderText(text) {
    if (!text) return '';

    // Check if MathRenderer is available and text contains math
    if (typeof MathRenderer !== 'undefined' && MathRenderer.state?.katexLoaded) {
      // MathRenderer.render handles escaping and math rendering
      return MathRenderer.render(text);
    }

    // Fallback to plain escape
    return this.escapeHtml(text);
  }

  // ═══════════════════════════════════════════════════════════════
  // BOSS BATTLE UI - "The Luminara Gauntlet"
  // ═══════════════════════════════════════════════════════════════

  /**
   * Render the boss encounter screen
   */
  renderBossEncounter(encounter, runSummary) {
    const area = document.getElementById('questionArea');
    if (!area) return;

    const boss = encounter.boss;
    const hpPercent = (encounter.currentHP / boss.maxHP) * 100;
    const phaseInfo = encounter.getCurrentPhase();

    // HP bar color based on remaining HP
    const hpColor = hpPercent > 60 ? 'var(--correct)' :
                    hpPercent > 30 ? 'var(--glow-warm)' :
                    'var(--incorrect)';

    area.innerHTML = `
      <div class="boss-arena">
        <div class="boss-header">
          <span class="boss-wave">Wave ${runSummary.wave} Boss</span>
          <span class="boss-difficulty">${runSummary.difficulty.toUpperCase()}</span>
        </div>

        <div class="boss-portrait">
          <div class="boss-icon">${boss.icon}</div>
          <div class="boss-phase-indicator ${phaseInfo.name.toLowerCase()}">${phaseInfo.name}</div>
        </div>

        <div class="boss-info">
          <div class="boss-name">${boss.name}</div>
          <div class="boss-title">${boss.title}</div>
        </div>

        <div class="boss-hp-section">
          <div class="boss-hp-bar">
            <div class="boss-hp-fill" style="width: ${hpPercent}%; background: ${hpColor}"></div>
          </div>
          <div class="boss-hp-text">${encounter.currentHP} / ${boss.maxHP} HP</div>
          <div class="boss-armor">🛡️ Armor: ${boss.armor}</div>
        </div>

        <div class="boss-taunt">
          <div class="taunt-text">"${this.getBossTaunt(boss, phaseInfo.name)}"</div>
        </div>

        <div class="boss-weakness">
          <span class="weakness-label">Weakness:</span>
          <span class="weakness-stat">${boss.weakTo.toUpperCase()}</span>
        </div>

        <div class="boss-abilities">
          ${boss.abilities.map(a => `
            <div class="boss-ability ${a.passive ? 'passive' : ''}" title="${a.description}">
              <span class="ability-icon">${a.icon}</span>
              <span class="ability-name">${a.name}</span>
            </div>
          `).join('')}
        </div>

        <div class="battle-actions">
          <button class="battle-btn attack" data-action="boss-attack">
            ⚔️ Attack (INT)
          </button>
          <button class="battle-btn special" data-action="boss-special">
            ✨ Special (WIS)
          </button>
          <button class="battle-btn defend" data-action="boss-defend">
            🛡️ Defend (CON)
          </button>
        </div>

        <div class="player-status">
          <div class="player-hp">❤️ ${runSummary.playerHP} HP</div>
          <div class="player-streak">🔥 Streak: ${runSummary.currentStreak}</div>
          <div class="battle-score">📊 Score: ${runSummary.score}</div>
        </div>
      </div>
    `;
  }

  /**
   * Get a taunt from the boss based on phase
   */
  getBossTaunt(boss, phase) {
    const defaultTaunts = {
      Phase1: [
        "You dare challenge me?",
        "This will be over quickly.",
        "How amusing..."
      ],
      Phase2: [
        "You're more persistent than I expected.",
        "Interesting. But futile.",
        "Feel my true power!"
      ],
      Enraged: [
        "ENOUGH!",
        "You will REGRET this!",
        "NO MORE HOLDING BACK!"
      ]
    };

    const taunts = boss.taunts?.[phase] || defaultTaunts[phase] || defaultTaunts.Phase1;
    return taunts[Math.floor(Math.random() * taunts.length)];
  }

  /**
   * Show boss damage animation (player attacking boss)
   */
  showBossDamage(attackResult) {
    const existing = document.querySelector('.boss-attack-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'boss-attack-overlay';

    const isCrit = attackResult.roll.isCriticalSuccess;
    const isHit = attackResult.hit;

    overlay.innerHTML = `
      <div class="attack-animation ${isCrit ? 'critical' : ''} ${isHit ? 'hit' : 'miss'}">
        <div class="attack-roll">
          <div class="roll-label">Attack Roll</div>
          <div class="roll-value">${attackResult.roll.roll}</div>
          <div class="roll-modifier">+${attackResult.roll.modifier} INT = ${attackResult.roll.total}</div>
          <div class="roll-vs">vs ${attackResult.armor} Armor</div>
        </div>

        ${isHit ? `
          <div class="damage-dealt ${isCrit ? 'critical' : ''}">
            <div class="damage-value">-${attackResult.damage}</div>
            <div class="damage-type">${isCrit ? 'CRITICAL HIT!' : 'HIT!'}</div>
          </div>
        ` : `
          <div class="attack-miss">
            <div class="miss-text">MISS!</div>
            <div class="miss-flavor">Your attack glances off their defenses...</div>
          </div>
        `}
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('hiding');
      setTimeout(() => overlay.remove(), 400);
    }, 2000);
  }

  /**
   * Show boss attacking player animation
   */
  showBossAttack(defenseResult, bossName) {
    const existing = document.querySelector('.boss-attack-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'boss-attack-overlay boss-attacking';

    const blocked = defenseResult.blocked;

    overlay.innerHTML = `
      <div class="defense-animation ${blocked ? 'blocked' : 'hit'}">
        <div class="boss-attack-header">
          <span class="boss-attack-icon">👹</span>
          <span class="boss-attack-text">${bossName} attacks!</span>
        </div>

        <div class="defense-roll">
          <div class="roll-label">Defense Roll (CON)</div>
          <div class="roll-value">${defenseResult.roll.roll}</div>
          <div class="roll-modifier">+${defenseResult.roll.modifier} CON = ${defenseResult.roll.total}</div>
          <div class="roll-vs">vs ${defenseResult.attackPower} Power</div>
        </div>

        ${blocked ? `
          <div class="defense-success">
            <div class="block-text">BLOCKED!</div>
            <div class="block-flavor">You withstand the assault!</div>
          </div>
        ` : `
          <div class="defense-fail">
            <div class="damage-taken">-${defenseResult.damageTaken} HP</div>
            <div class="damage-flavor">The attack breaks through!</div>
            ${defenseResult.damageReduction > 0 ?
              `<div class="reduction">(Reduced by ${defenseResult.damageReduction} from CON)</div>` : ''}
          </div>
        `}
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('hiding');
      setTimeout(() => overlay.remove(), 400);
    }, 2500);
  }

  /**
   * Show boss defeat celebration
   */
  showBossDefeat(boss, loot, runSummary) {
    const overlay = document.createElement('div');
    overlay.className = 'boss-defeat-overlay';

    const lootHTML = loot.map(item => {
      if (item.type === 'gold') {
        return `<div class="loot-item gold">💰 +${item.amount} Gold</div>`;
      } else if (item.type === 'gem') {
        return `<div class="loot-item gem" style="color: ${item.color}">${item.icon} ${item.tierName} ${item.name}</div>`;
      } else if (item.type === 'consumable' || item.type === 'permanent') {
        return `<div class="loot-item special">⭐ ${item.name}</div>`;
      } else {
        return `<div class="loot-item equipment" style="color: ${this.getRarityColor(item.rarity)}">${item.icon || '📦'} ${item.name}</div>`;
      }
    }).join('');

    overlay.innerHTML = `
      <div class="boss-defeat-card">
        <div class="defeat-header">
          <span class="defeat-icon">⚔️</span>
          <span class="defeat-title">Victory!</span>
        </div>

        <div class="boss-defeated">
          <div class="boss-icon fading">${boss.icon}</div>
          <div class="boss-name">${boss.name}</div>
          <div class="boss-quote">"${this.getBossDefeatQuote(boss)}"</div>
        </div>

        <div class="defeat-stats">
          <div class="stat">
            <span class="value">+1000</span>
            <span class="label">Boss Bonus</span>
          </div>
          <div class="stat">
            <span class="value">${runSummary.bossesDefeated}</span>
            <span class="label">Bosses Slain</span>
          </div>
        </div>

        <div class="loot-section">
          <div class="loot-header">Loot Acquired</div>
          <div class="loot-grid">
            ${lootHTML}
          </div>
        </div>

        <button class="defeat-continue" data-action="boss-continue">
          Continue Run →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Get boss defeat quote
   */
  getBossDefeatQuote(boss) {
    const quotes = {
      forgetful_one: "I... I can't remember... how to exist...",
      procrastinator: "I'll... get revenge... eventually...",
      anxiety_spiral: "The calm... it's... peaceful...",
      distraction_demon: "Ooh, is that a— *poof*",
      imposter: "Maybe you DO belong here after all...",
      luminara_shadow: "You've surpassed even... me."
    };
    return quotes[boss.id] || "Defeated... but not forgotten...";
  }

  /**
   * Render run progress UI
   */
  renderRunUI(runSummary, activePowerUps) {
    const container = document.getElementById('runProgressBar');
    if (!container) return;

    const powerUpsHTML = activePowerUps.length > 0 ?
      `<div class="active-powerups">
        ${activePowerUps.map(p => `
          <span class="active-powerup" title="${p.name}: ${p.description}">
            ${p.icon}
            ${typeof p.remainingDuration === 'number' ? `<span class="duration">${p.remainingDuration}</span>` : ''}
          </span>
        `).join('')}
      </div>` : '';

    container.innerHTML = `
      <div class="run-info">
        <div class="run-difficulty ${runSummary.difficulty}">${runSummary.difficulty.toUpperCase()}</div>
        <div class="run-wave">Wave ${runSummary.wave}</div>
        <div class="run-progress">
          <div class="progress-fill" style="width: ${(runSummary.waveProgress / runSummary.questionsPerWave) * 100}%"></div>
          <span class="progress-text">${runSummary.waveProgress}/${runSummary.questionsPerWave}</span>
        </div>
      </div>
      <div class="run-stats">
        <span class="run-score">📊 ${runSummary.score.toLocaleString()}</span>
        <span class="run-streak">🔥 ${runSummary.currentStreak}</span>
        <span class="run-accuracy">${runSummary.accuracy}%</span>
      </div>
      ${powerUpsHTML}
    `;
  }

  /**
   * Show power-up activation
   */
  showPowerUpActivation(powerUp) {
    const popup = document.createElement('div');
    popup.className = 'powerup-activation';

    popup.innerHTML = `
      <div class="powerup-card">
        <div class="powerup-icon">${powerUp.icon}</div>
        <div class="powerup-name">${powerUp.name}</div>
        <div class="powerup-effect">${powerUp.description}</div>
      </div>
    `;

    document.body.appendChild(popup);

    setTimeout(() => {
      popup.classList.add('hiding');
      setTimeout(() => popup.remove(), 400);
    }, 2000);
  }

  /**
   * Show run complete summary (victory or defeat)
   */
  showRunComplete(result) {
    const overlay = document.createElement('div');
    overlay.className = `run-complete-overlay ${result.victory ? 'victory' : 'defeat'}`;

    const breakdown = highScoreManager.getScoreBreakdown(result);

    let achievementsHTML = '';
    if (result.newAchievements && result.newAchievements.length > 0) {
      achievementsHTML = `
        <div class="run-achievements">
          <div class="achievements-header">Achievements Unlocked!</div>
          ${result.newAchievements.map(a => `
            <div class="run-achievement">
              <span class="achieve-icon">${a.icon}</span>
              <span class="achieve-name">${a.name}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="run-complete-card">
        <div class="run-header ${result.victory ? 'victory' : 'defeat'}">
          <span class="run-icon">${result.victory ? '🏆' : '💀'}</span>
          <span class="run-title">${result.victory ? 'Run Complete!' : 'Run Over'}</span>
        </div>

        <div class="run-title-earned">
          <span class="title-icon">${result.title.icon}</span>
          <span class="title-name" style="color: ${result.title.color}">${result.title.title}</span>
        </div>

        ${result.isHighScore ? `
          <div class="high-score-banner">
            🎉 NEW HIGH SCORE! Rank #${result.rank} 🎉
          </div>
          <div class="global-submit-section" id="globalSubmitSection">
            <div class="global-question">Challenge the ${result.mode === 'gauntlet' ? '⚔️ Gauntlet' : '🎮 Arcade'} leaderboard?</div>
            <button class="global-submit-btn" data-action="prompt-global-submit" data-score="${result.score}" data-wave="${result.wave}" data-accuracy="${result.correctFirstTry && result.questionsAnswered ? Math.round(result.correctFirstTry / result.questionsAnswered * 100) : 0}" data-difficulty="${result.difficulty}" data-mode="${result.mode || 'arcade'}">
              🌐 Enter Initials
            </button>
          </div>
        ` : ''}

        <div class="score-breakdown">
          <div class="breakdown-row">
            <span>Questions</span>
            <span>+${breakdown.baseScore}</span>
          </div>
          <div class="breakdown-row">
            <span>Streak Bonus</span>
            <span>+${breakdown.streakBonus}</span>
          </div>
          <div class="breakdown-row">
            <span>Boss Bonus</span>
            <span>+${breakdown.bossBonus}</span>
          </div>
          <div class="breakdown-row">
            <span>Time Bonus</span>
            <span>+${breakdown.timeBonus}</span>
          </div>
          <div class="breakdown-row">
            <span>HP Bonus</span>
            <span>+${breakdown.hpBonus}</span>
          </div>
          <div class="breakdown-row multiplier">
            <span>Difficulty (×${breakdown.difficultyMultiplier})</span>
            <span></span>
          </div>
          <div class="breakdown-total">
            <span>TOTAL</span>
            <span>${breakdown.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="tokens-earned">
          <span class="tokens-icon">🎮</span>
          <span class="tokens-amount">+${result.tokensEarned} Arcade Tokens</span>
        </div>

        ${achievementsHTML}

        <div class="fun-fact">
          <div class="fact-header">Did you know?</div>
          <div class="fact-text">${result.funFact}</div>
        </div>

        <div class="run-actions">
          <button class="run-btn home" data-action="end-gauntlet-run">
            Back to Menu
          </button>
          <button class="run-btn retry" data-action="retry-gauntlet-run" data-difficulty="${result.difficulty}">
            Try Again
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Show high scores leaderboard with mode (Gauntlet/Arcade) and difficulty tabs
   */
  showHighScores() {
    // Ensure highScoreManager is initialized
    if (!highScoreManager) highScoreManager = new HighScoreManager();

    const existing = document.querySelector('.highscores-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'highscores-overlay';

    const personalBests = highScoreManager.getPersonalBests();
    const stats = highScoreManager.getTotalStats();
    const currentTitle = highScoreManager.getCurrentTitle();
    const nextRank = highScoreManager.getNextRank();

    // Render scores list (works for both local and global)
    const renderScores = (scoresData, isGlobal = false) => {
      if (!scoresData || scoresData.length === 0) {
        return '<div class="no-scores">No scores yet. Be the first to conquer!</div>';
      }
      return scoresData.map((entry, i) => `
        <div class="score-row ${isGlobal ? 'global' : ''} ${i === 0 ? 'first' : ''} ${i === 1 ? 'second' : ''} ${i === 2 ? 'third' : ''}">
          <span class="rank">#${entry.rank || (i + 1)}</span>
          ${isGlobal ? `<span class="initials">${entry.initials || '???'}</span>` : ''}
          <span class="score">${(entry.score || 0).toLocaleString()}</span>
          ${!isGlobal && entry.title ? `<span class="title" style="color: ${entry.title.color}">${entry.title.icon}</span>` : ''}
          <span class="details">${entry.waves || '?'} waves | ${entry.accuracy || '?'}%${!isGlobal && entry.duration ? ' | ' + highScoreManager.formatDuration(entry.duration) : ''}</span>
        </div>
      `).join('');
    };

    overlay.innerHTML = `
      <div class="highscores-panel">
        <button class="close-btn" data-action="dismiss-overlay" data-target=".highscores-overlay">✕</button>

        <div class="hs-header">
          <h2>🏆 The Luminara Leaderboard</h2>
          <div class="current-rank">
            <span class="rank-icon">${currentTitle.icon}</span>
            <span class="rank-title" style="color: ${currentTitle.color}">${currentTitle.title}</span>
          </div>
          ${nextRank ? `
            <div class="next-rank">
              Next: ${nextRank.title.title} (${nextRank.pointsNeeded.toLocaleString()} pts away)
            </div>
          ` : '<div class="next-rank max-rank">Maximum Rank Achieved!</div>'}
        </div>

        <div class="hs-section">
          <!-- Mode Tabs (Gauntlet vs Arcade) -->
          <div class="leaderboard-mode-tabs">
            <button class="mode-tab-btn active" data-mode="gauntlet">
              <span class="mode-icon">⚔️</span> Gauntlet
            </button>
            <button class="mode-tab-btn" data-mode="arcade">
              <span class="mode-icon">🎮</span> Arcade
            </button>
          </div>

          <!-- Difficulty Sub-Tabs -->
          <div class="difficulty-tabs">
            <button class="diff-tab-btn" data-diff="easy">Easy</button>
            <button class="diff-tab-btn active" data-diff="normal">Normal</button>
            <button class="diff-tab-btn" data-diff="hard">Hard</button>
            <button class="diff-tab-btn" data-diff="nightmare">Nightmare</button>
          </div>

          <!-- Global/Local Toggle -->
          <div class="leaderboard-toggle">
            <button class="toggle-btn active" data-board="global">🌐 Global</button>
            <button class="toggle-btn" data-board="local">💾 Local</button>
          </div>

          <div class="scores-list" id="scoresListContainer">
            <div class="loading-scores">Loading scores...</div>
          </div>
        </div>

        <div class="hs-section personal-bests">
          <h3>Personal Bests</h3>
          <div class="bests-grid">
            <div class="best-item">
              <span class="best-value">${personalBests.highestScore.toLocaleString()}</span>
              <span class="best-label">Highest Score</span>
            </div>
            <div class="best-item">
              <span class="best-value">${personalBests.longestStreak}</span>
              <span class="best-label">Longest Streak</span>
            </div>
            <div class="best-item">
              <span class="best-value">${personalBests.fastestRun ? highScoreManager.formatDuration(personalBests.fastestRun) : '--:--'}</span>
              <span class="best-label">Fastest Run</span>
            </div>
            <div class="best-item">
              <span class="best-value">${personalBests.mostBosses}</span>
              <span class="best-label">Most Bosses</span>
            </div>
          </div>
        </div>

        <div class="hs-section total-stats">
          <h3>Career Stats</h3>
          <div class="stats-grid">
            <div class="stat-item"><span class="val">${stats.totalScore.toLocaleString()}</span><span class="lbl">Total Score</span></div>
            <div class="stat-item"><span class="val">${stats.totalVictories}/${stats.totalRuns}</span><span class="lbl">Victories</span></div>
            <div class="stat-item"><span class="val">${stats.totalBossesDefeated}</span><span class="lbl">Bosses Slain</span></div>
            <div class="stat-item"><span class="val">${stats.totalQuestionsAnswered}</span><span class="lbl">Questions</span></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // State for current selections
    let currentMode = 'gauntlet';
    let currentDifficulty = 'normal';
    let currentBoard = 'global';
    let globalScoresCache = {}; // Cache by mode+difficulty

    const container = document.getElementById('scoresListContainer');

    // Refresh the scores display
    const refreshScores = async () => {
      const cacheKey = `${currentMode}_${currentDifficulty}_${currentBoard}`;

      if (currentBoard === 'local') {
        // Get local scores for mode+difficulty
        const localScores = highScoreManager.getScoresForMode(currentMode, currentDifficulty);
        container.innerHTML = renderScores(localScores, false);
      } else {
        // Global scores
        if (globalScoresCache[cacheKey]) {
          container.innerHTML = renderScores(globalScoresCache[cacheKey], true);
        } else {
          container.innerHTML = '<div class="loading-scores">Summoning the worthy...</div>';
          try {
            const globalData = await highScoreManager.fetchGlobalScores();
            // Extract scores for current mode+difficulty
            const modeData = globalData[currentMode] || {};
            const diffScores = modeData[currentDifficulty] || [];
            globalScoresCache[cacheKey] = diffScores;
            container.innerHTML = renderScores(diffScores, true);
          } catch (err) {
            console.error('Failed to fetch global scores:', err);
            container.innerHTML = '<div class="no-scores">Could not reach the global leaderboard. The void is silent...</div>';
          }
        }
      }
    };

    // Mode tab handlers
    overlay.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        overlay.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshScores();
      });
    });

    // Difficulty tab handlers
    overlay.querySelectorAll('.diff-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.diff;
        overlay.querySelectorAll('.diff-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshScores();
      });
    });

    // Global/Local toggle handlers
    overlay.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentBoard = btn.dataset.board;
        overlay.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
        refreshScores();
      });
    });

    // Initial load
    refreshScores();
  }

  /**
   * Prompt player to submit their score to the global leaderboard
   * @param {number} score - The score to submit
   * @param {number} waves - Number of waves completed
   * @param {number} accuracy - Accuracy percentage
   * @param {string} difficulty - Difficulty level (easy/normal/hard/nightmare)
   * @param {string} mode - Game mode (gauntlet/arcade)
   */
  async promptGlobalSubmit(score, waves, accuracy, difficulty, mode = 'arcade') {
    // Ensure highScoreManager is initialized
    if (!highScoreManager) highScoreManager = new HighScoreManager();

    try {
      // Get initials from player
      const initials = await highScoreManager.promptForInitials();

      if (!initials) {
        // Player cancelled
        return;
      }

      // Update the button to show submitting state
      const submitSection = document.getElementById('globalSubmitSection');
      if (submitSection) {
        submitSection.innerHTML = `
          <div class="global-submitting">
            <span class="submit-spinner">⏳</span>
            Submitting to ${mode === 'gauntlet' ? '⚔️ Gauntlet' : '🎮 Arcade'} leaderboard...
          </div>
        `;
      }

      // Submit to global leaderboard with mode
      const result = await highScoreManager.submitToGlobal(initials, score, {
        waves,
        accuracy,
        difficulty,
        mode
      });

      // Update UI with result
      if (submitSection) {
        if (result.success) {
          submitSection.innerHTML = `
            <div class="global-submitted success">
              <span class="submit-icon">✅</span>
              <span class="submit-text">Score submitted! Check #${result.issueNumber || '?'}</span>
            </div>
          `;
        } else {
          submitSection.innerHTML = `
            <div class="global-submitted error">
              <span class="submit-icon">❌</span>
              <span class="submit-text">${result.error || 'Failed to submit'}</span>
              <button class="retry-submit-btn" data-action="prompt-global-submit" data-score="${score}" data-wave="${waves}" data-accuracy="${accuracy}" data-difficulty="${difficulty}" data-mode="${mode}">
                Retry
              </button>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('Global submit error:', err);
      const submitSection = document.getElementById('globalSubmitSection');
      if (submitSection) {
        submitSection.innerHTML = `
          <div class="global-submitted error">
            <span class="submit-icon">❌</span>
            <span class="submit-text">Network error. The leaderboard eludes you...</span>
            <button class="retry-submit-btn" data-action="prompt-global-submit" data-score="${score}" data-wave="${waves}" data-accuracy="${accuracy}" data-difficulty="${difficulty}" data-mode="${mode}">
              Retry
            </button>
          </div>
        `;
      }
    }
  }

  /**
   * Show power-up shop
   */
  showPowerUpShop(tokenCount) {
    const existing = document.querySelector('.powerup-shop-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'powerup-shop-overlay';

    const unlocked = powerUpManager.getUnlockedPowerUps();
    const locked = powerUpManager.getLockedPowerUps();

    const unlockedHTML = unlocked.map(p => `
      <div class="shop-item ${tokenCount < p.cost ? 'cant-afford' : ''}">
        <div class="shop-item-header">
          <span class="item-icon">${p.icon}</span>
          <span class="item-name">${p.name}</span>
          <span class="item-rarity ${p.rarity}">${p.rarity}</span>
        </div>
        <div class="item-desc">${p.description}</div>
        <div class="item-footer">
          <span class="item-owned">Owned: ${p.count}</span>
          <button class="buy-btn" ${tokenCount < p.cost ? 'disabled' : ''}
                  data-action="buy-powerup" data-powerup-id="${p.id}">
            🎮 ${p.cost}
          </button>
        </div>
      </div>
    `).join('');

    const lockedHTML = locked.map(p => `
      <div class="shop-item locked">
        <div class="shop-item-header">
          <span class="item-icon">🔒</span>
          <span class="item-name">???</span>
          <span class="item-rarity ${p.rarity}">${p.rarity}</span>
        </div>
        <div class="item-desc">
          Unlock: ${p.type.replace(/_/g, ' ')} (${p.progress}%)
        </div>
        <div class="unlock-progress">
          <div class="progress-fill" style="width: ${p.progress}%"></div>
        </div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="powerup-shop-panel">
        <button class="close-btn" data-action="dismiss-overlay" data-target=".powerup-shop-overlay">✕</button>

        <div class="shop-header">
          <h2>⚡ Power-Up Shop</h2>
          <div class="token-balance">🎮 ${tokenCount.toLocaleString()} Tokens</div>
        </div>

        <div class="shop-section">
          <h3>Available Power-Ups</h3>
          <div class="shop-grid">
            ${unlockedHTML}
          </div>
        </div>

        ${locked.length > 0 ? `
          <div class="shop-section locked-section">
            <h3>Locked Power-Ups</h3>
            <div class="shop-grid">
              ${lockedHTML}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(overlay);
  }

  // ═══════════════════════════════════════════════════════════════
  // LEARNING ANALYTICS DASHBOARD (Opportunity 7 of 510.108)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show the Learning Analytics Dashboard
   * Displays conceptual change, forgetting curves, mastery, and difficulty data
   */
  showAnalyticsDashboard() {
    // Check if LearningAnalyticsEngine is available
    if (typeof learningAnalytics === 'undefined' || !learningAnalytics) {
      console.warn('[Analytics] LearningAnalyticsEngine not available');
      return;
    }

    const existing = document.querySelector('.analytics-dashboard-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'analytics-dashboard-overlay';

    // Get analytics data
    const summary = learningAnalytics.getAnalyticsSummary();
    const reviewQueue = learningAnalytics.getReviewQueue(10);
    const difficultyDist = learningAnalytics.getDifficultyDistribution();

    // Build conceptual shifts display
    const shiftsHTML = summary.conceptualShifts.length > 0
      ? summary.conceptualShifts.slice(0, 5).map(shift => `
          <div class="shift-item ${shift.isPositive ? 'positive' : 'neutral'}">
            <span class="shift-icon">${shift.isPositive ? '📈' : '🔄'}</span>
            <span class="shift-type">${shift.shiftType.replace(/_/g, ' ')}</span>
            <span class="shift-question">Q${shift.questionId}</span>
          </div>
        `).join('')
      : '<div class="no-data">No conceptual shifts detected yet. Keep studying!</div>';

    // Build review queue display
    const reviewHTML = reviewQueue.length > 0
      ? reviewQueue.map(item => `
          <div class="review-item ${item.priority}">
            <span class="review-priority-badge ${item.priority}">${item.priority}</span>
            <span class="review-question">Q${item.questionId}</span>
            <span class="review-due">${item.isDue ? 'Due now' : item.isOverdue ? 'Overdue!' : 'Scheduled'}</span>
            <span class="review-streak">Streak: ${item.streak}</span>
          </div>
        `).join('')
      : '<div class="no-data">No reviews scheduled yet.</div>';

    // Build difficulty histogram
    const maxCount = Math.max(...Object.values(difficultyDist), 1);
    const histogramHTML = Object.entries(difficultyDist).map(([band, count]) => `
      <div class="histogram-bar">
        <div class="bar-fill" style="height: ${(count / maxCount) * 100}%"></div>
        <div class="bar-label">${band.replace('_', '-')}</div>
        <div class="bar-count">${count}</div>
      </div>
    `).join('');

    // Build mastered concepts display
    const masteredHTML = summary.masteredConcepts.length > 0
      ? summary.masteredConcepts.slice(0, 10).map(qid => `
          <span class="mastered-badge">🏆 Q${qid}</span>
        `).join('')
      : '<div class="no-data">No mastered concepts yet. Get 5+ correct in a row!</div>';

    overlay.innerHTML = `
      <div class="analytics-dashboard-panel">
        <button class="close-btn" data-action="dismiss-overlay" data-target=".analytics-dashboard-overlay">✕</button>

        <div class="analytics-header">
          <h2>📊 Learning Analytics Dashboard</h2>
          <div class="analytics-subtitle">Research-Based Learning Insights</div>
        </div>

        <!-- Summary Stats Row -->
        <div class="analytics-summary-grid">
          <div class="analytics-stat-card">
            <div class="stat-value">${summary.totalQuestionsTracked}</div>
            <div class="stat-label">Questions Tracked</div>
          </div>
          <div class="analytics-stat-card">
            <div class="stat-value">${summary.questionsNeedingReview}</div>
            <div class="stat-label">Need Review</div>
          </div>
          <div class="analytics-stat-card">
            <div class="stat-value">${summary.masteredConcepts.length}</div>
            <div class="stat-label">Mastered</div>
          </div>
          <div class="analytics-stat-card">
            <div class="stat-value">${summary.conceptualShifts.length}</div>
            <div class="stat-label">Insights Gained</div>
          </div>
        </div>

        <!-- Conceptual Change Section -->
        <div class="analytics-section">
          <div class="section-header">
            <h3>💡 Conceptual Change Detection</h3>
            <span class="section-badge research">Piaget</span>
          </div>
          <div class="section-description">
            Tracks when your misconceptions shift - that's learning happening!
          </div>
          <div class="conceptual-shifts-list">
            ${shiftsHTML}
          </div>
        </div>

        <!-- Forgetting Curve Section -->
        <div class="analytics-section">
          <div class="section-header">
            <h3>📈 Forgetting Curve Review Queue</h3>
            <span class="section-badge research">Ebbinghaus</span>
          </div>
          <div class="section-description">
            Spaced repetition intervals: 1, 3, 7, 14, 30, 60, 120 days
          </div>
          <div class="review-queue-list">
            ${reviewHTML}
          </div>
        </div>

        <!-- Difficulty Distribution -->
        <div class="analytics-section">
          <div class="section-header">
            <h3>📊 Difficulty Distribution</h3>
            <span class="section-badge">Bootstrapped</span>
          </div>
          <div class="section-description">
            Estimated difficulty of questions you've encountered
          </div>
          <div class="difficulty-histogram">
            ${histogramHTML}
          </div>
        </div>

        <!-- Mastered Concepts -->
        <div class="analytics-section">
          <div class="section-header">
            <h3>🏆 Mastered Concepts</h3>
            <span class="section-badge">5+ Streak</span>
          </div>
          <div class="section-description">
            Questions you've answered correctly 5+ times in a row
          </div>
          <div class="mastered-concepts-list">
            ${masteredHTML}
          </div>
        </div>

        <!-- Export Section -->
        <div class="analytics-export-section">
          <button class="export-btn" data-action="export-analytics">
            📥 Export Analytics Data
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  /**
   * Export analytics data as JSON download
   */
  exportAnalyticsData() {
    if (typeof learningAnalytics === 'undefined' || !learningAnalytics) {
      alert('Analytics engine not available');
      return;
    }

    const data = learningAnalytics.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `luminara_analytics_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Attach event listeners to dynamically created elements
   * CSP-compliant: uses data attributes instead of inline onclick handlers
   */
  attachEventListeners() {
    // Use event delegation for dynamically created content
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const quiz = this.quiz;

      // Generic dismiss overlay handler
      if (action === 'dismiss-overlay') {
        const overlaySelector = target.dataset.target;
        const overlay = target.closest(overlaySelector);
        if (overlay) overlay.remove();
        return;
      }

      // Summary actions
      if (action === 'close-summary-home') {
        if (typeof closeSummaryAndGoHome === 'function') closeSummaryAndGoHome();
        return;
      }
      if (action === 'close-summary-continue') {
        if (typeof closeSummaryAndContinue === 'function') closeSummaryAndContinue();
        return;
      }

      // Skip to main
      if (action === 'skip-to-main') {
        if (typeof skipToMain === 'function') skipToMain();
        return;
      }

      // Diagram modal
      if (action === 'show-diagram') {
        const diagramData = {
          file: target.dataset.diagramFile,
          title: target.dataset.diagramTitle,
          source: target.dataset.diagramSource
        };
        if (typeof AnatomyDiagrams !== 'undefined') {
          AnatomyDiagrams.showDiagramModal(diagramData, diagramData.title);
        }
        return;
      }

      // Scaffold controls
      if (action === 'toggle-inline-scaffolds') {
        quiz.toggleInlineScaffolds(target);
        return;
      }
      if (action === 'soft-exit-scaffold') {
        quiz.softExitScaffold();
        return;
      }
      if (action === 'next-scaffold') {
        quiz.nextScaffold();
        return;
      }
      if (action === 'toggle-scaffold-images') {
        const containerId = target.dataset.container;
        this.toggleScaffoldImages(containerId);
        return;
      }

      // Character sheet
      if (action === 'open-character-sheet') {
        quiz.openCharacterSheet();
        return;
      }

      // Inventory
      if (action === 'open-inventory') {
        quiz.openInventory();
        return;
      }

      // Item/Gem details
      if (action === 'show-item-detail') {
        const itemId = target.dataset.itemId;
        const isEquipped = target.dataset.isEquipped === 'true';
        this.showItemDetail(itemId, isEquipped);
        return;
      }
      if (action === 'show-gem-detail') {
        const gemId = target.dataset.gemId;
        this.showGemDetail(gemId);
        return;
      }

      // Item actions
      if (action === 'equip-item') {
        const itemId = target.dataset.itemId;
        quiz.equipItem(itemId);
        target.closest('.item-detail-overlay')?.remove();
        this.showInventory();
        return;
      }
      if (action === 'unequip-item') {
        const itemType = target.dataset.itemType;
        quiz.unequipItem(itemType);
        target.closest('.item-detail-overlay')?.remove();
        this.showInventory();
        return;
      }
      if (action === 'sell-item') {
        const itemId = target.dataset.itemId;
        quiz.sellItem(itemId);
        target.closest('.item-detail-overlay')?.remove();
        this.showInventory();
        return;
      }

      // Exploration options
      if (action === 'explore-option') {
        const index = parseInt(target.dataset.optionIndex);
        if (typeof exploreOption === 'function') exploreOption(index);
        return;
      }
      if (action === 'explore-scaffold-option') {
        const index = parseInt(target.dataset.optionIndex);
        if (typeof exploreScaffoldOption === 'function') exploreScaffoldOption(index);
        return;
      }

      // D20 System
      if (action === 'roll-for-insight') {
        quiz.rollForInsight();
        return;
      }
      if (action === 'skill-check-roll') {
        if (window._skillCheckCallback) {
          window._skillCheckCallback();
        }
        target.closest('.skill-check-prompt')?.remove();
        return;
      }

      // Streak save
      if (action === 'streak-save-decline') {
        if (window._streakSaveCallback) {
          window._streakSaveCallback(false);
        }
        target.closest('.streak-save-prompt')?.remove();
        return;
      }
      if (action === 'streak-save-attempt') {
        if (window._streakSaveCallback) {
          window._streakSaveCallback(true);
        }
        target.closest('.streak-save-prompt')?.remove();
        return;
      }

      // Boss battle
      if (action === 'boss-attack') {
        quiz.bossBattle?.playerAttack();
        return;
      }
      if (action === 'boss-special') {
        quiz.bossBattle?.playerSpecial();
        return;
      }
      if (action === 'boss-defend') {
        quiz.bossBattle?.playerDefend();
        return;
      }
      if (action === 'boss-continue') {
        quiz.bossBattle?.continueAfterBoss();
        target.closest('.boss-defeat-overlay')?.remove();
        return;
      }

      // Gauntlet
      if (action === 'end-gauntlet-run') {
        quiz.endGauntletRun();
        target.closest('.run-complete-overlay')?.remove();
        return;
      }
      if (action === 'retry-gauntlet-run') {
        const difficulty = target.dataset.difficulty;
        quiz.startGauntletRun(difficulty);
        target.closest('.run-complete-overlay')?.remove();
        return;
      }

      // Global submit
      if (action === 'prompt-global-submit') {
        const score = parseInt(target.dataset.score);
        const wave = parseInt(target.dataset.wave);
        const accuracy = parseInt(target.dataset.accuracy);
        const difficulty = target.dataset.difficulty;
        const mode = target.dataset.mode;
        this.promptGlobalSubmit(score, wave, accuracy, difficulty, mode);
        return;
      }

      // Powerups
      if (action === 'buy-powerup') {
        const powerupId = target.dataset.powerupId;
        quiz.buyPowerUp(powerupId);
        return;
      }

      // Analytics
      if (action === 'export-analytics') {
        this.exportAnalyticsData();
        return;
      }
    });
  }
}

// Apply extension mixins if they were loaded before the class
// (supports both load orders)
if (window._InventoryMixin) {
  Object.assign(QuizRenderer.prototype, window._InventoryMixin);
}
if (window._D20UIMixin) {
  Object.assign(QuizRenderer.prototype, window._D20UIMixin);
}
