/**
 * Ms. Luminara Quiz - Screen Effects (Shockwave Arcade Juice)
 *
 * Early 2000s Flash game feel: instant feedback, visceral impact.
 * Every action has a reaction - shake, flash, numbers, sounds.
 *
 * @module ScreenEffects
 * @version 1.0.0
 */

const ScreenEffects = {
  // ═══════════════════════════════════════════════════════════════
  // SCREEN SHAKE
  // ═══════════════════════════════════════════════════════════════

  shake(intensity = 'normal') {
    const body = document.body;
    body.classList.remove('shake', 'big-shake');

    // Force reflow to restart animation
    void body.offsetWidth;

    if (intensity === 'big') {
      body.classList.add('big-shake');
      setTimeout(() => body.classList.remove('big-shake'), 500);
    } else {
      body.classList.add('shake');
      setTimeout(() => body.classList.remove('shake'), 400);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ANSWER FLASH EFFECTS
  // ═══════════════════════════════════════════════════════════════

  flashCorrect(element) {
    if (!element) return;
    element.classList.remove('correct-flash', 'wrong-flash');
    void element.offsetWidth;
    element.classList.add('correct-flash');
    setTimeout(() => element.classList.remove('correct-flash'), 400);

    // Also show quick indicator
    this.showAnswerIndicator('correct');
  },

  flashWrong(element) {
    if (!element) return;
    element.classList.remove('correct-flash', 'wrong-flash');
    void element.offsetWidth;
    element.classList.add('wrong-flash');
    setTimeout(() => element.classList.remove('wrong-flash'), 400);

    // Shake screen
    this.shake('normal');

    // Show quick indicator
    this.showAnswerIndicator('wrong');
  },

  showAnswerIndicator(type) {
    const indicator = document.createElement('div');
    indicator.className = `answer-indicator ${type}`;
    indicator.textContent = type === 'correct' ? '✓' : '✗';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 600);
  },

  // ═══════════════════════════════════════════════════════════════
  // FLOATING DAMAGE NUMBERS
  // ═══════════════════════════════════════════════════════════════

  showDamageNumber(container, amount, type = 'positive') {
    if (!container) container = document.body;

    const popup = document.createElement('div');
    popup.className = `damage-number ${type}`;

    // Format the number
    if (type === 'positive' || type === 'heal') {
      popup.textContent = `+${amount}`;
    } else if (type === 'negative') {
      popup.textContent = `-${amount}`;
    } else if (type === 'xp') {
      popup.textContent = `+${amount} XP`;
    } else if (type === 'crit') {
      popup.textContent = `${amount}!`;
      popup.classList.add('crit');
    } else {
      popup.textContent = amount;
    }

    // Random horizontal offset for variety
    const offset = (Math.random() * 40 - 20);
    popup.style.left = `calc(50% + ${offset}px)`;

    container.style.position = 'relative';
    container.appendChild(popup);

    setTimeout(() => popup.remove(), 1200);
  },

  // Convenience methods
  showDamage(container, amount) {
    this.showDamageNumber(container, amount, 'positive');
  },

  showHeal(container, amount) {
    this.showDamageNumber(container, amount, 'heal');
  },

  showPlayerDamage(container, amount) {
    this.showDamageNumber(container, amount, 'negative');
  },

  showXP(container, amount) {
    this.showDamageNumber(container, amount, 'xp');
  },

  /**
   * Show gold pickup with spiraling coins effect
   * @param {number} amount - Gold amount
   * @param {HTMLElement} targetElement - Element to spiral toward (gold counter)
   */
  showGoldPickup(amount, targetElement) {
    const coinCount = Math.min(Math.ceil(amount / 5), 10); // 1 coin per 5 gold, max 10

    // Get target position (gold counter)
    const targetRect = targetElement?.getBoundingClientRect() || {
      left: window.innerWidth - 100,
      top: 50
    };
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    // Spawn coins from center, spiral to counter
    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'pickup-coin';
        coin.textContent = '💰';

        // Random start position (center of screen with spread)
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 100;
        const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 100;

        coin.style.cssText = `
          position: fixed;
          left: ${startX}px;
          top: ${startY}px;
          font-size: 1.5rem;
          z-index: 1000;
          pointer-events: none;
          filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
        `;

        document.body.appendChild(coin);

        // Animate to target with spiral
        const duration = 600 + i * 50;
        const keyframes = [
          { transform: 'scale(1) rotate(0deg)', offset: 0 },
          { transform: `scale(1.3) rotate(${180 + Math.random() * 180}deg) translateX(${(Math.random() - 0.5) * 50}px)`, offset: 0.3 },
          { transform: 'scale(0.5) rotate(720deg)', left: `${targetX}px`, top: `${targetY}px`, offset: 1 }
        ];

        const animation = coin.animate(keyframes, {
          duration: duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        });

        animation.onfinish = () => {
          coin.remove();
          // Play clink sound on last coin
          if (i === coinCount - 1) {
            SoundSystem.playCoinClink();
          }
        };
      }, i * 80); // Stagger spawns
    }

    // Flash the counter
    if (targetElement) {
      targetElement.classList.add('counter-flash');
      setTimeout(() => targetElement.classList.remove('counter-flash'), 400);
    }
  },

  /**
   * Show XP pickup with sparkle spiral
   * @param {number} amount - XP amount
   * @param {HTMLElement} targetElement - XP bar/counter element
   */
  showXPPickup(amount, targetElement) {
    const sparkleCount = Math.min(Math.ceil(amount / 10), 8);

    const targetRect = targetElement?.getBoundingClientRect() || {
      left: window.innerWidth / 2,
      top: 30
    };
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'pickup-xp';
        sparkle.textContent = '✨';

        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 150;
        const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 150;

        sparkle.style.cssText = `
          position: fixed;
          left: ${startX}px;
          top: ${startY}px;
          font-size: 1.2rem;
          z-index: 1000;
          pointer-events: none;
          filter: drop-shadow(0 0 6px rgba(201, 165, 92, 0.9));
        `;

        document.body.appendChild(sparkle);

        const duration = 500 + i * 40;
        sparkle.animate([
          { transform: 'scale(1)', opacity: 1, offset: 0 },
          { transform: 'scale(1.5) translateY(-30px)', opacity: 1, offset: 0.3 },
          { transform: 'scale(0.3)', opacity: 0.8, left: `${targetX}px`, top: `${targetY}px`, offset: 1 }
        ], {
          duration: duration,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'forwards'
        }).onfinish = () => sparkle.remove();
      }, i * 60);
    }

    // Pulse the XP counter
    if (targetElement) {
      targetElement.classList.add('xp-flash');
      setTimeout(() => targetElement.classList.remove('xp-flash'), 300);
    }
  },

  showCrit(container, amount) {
    this.showDamageNumber(container, amount, 'crit');
    this.shake('big');
    this.showCriticalBanner();
    this.flashScreen('crit');
  },

  /**
   * Show CRITICAL banner across the screen
   */
  showCriticalBanner() {
    // Remove existing banner
    const existing = document.querySelector('.critical-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = 'critical-banner';
    banner.innerHTML = `
      <div class="critical-banner-text">
        <span class="critical-word">C</span>
        <span class="critical-word">R</span>
        <span class="critical-word">I</span>
        <span class="critical-word">T</span>
        <span class="critical-word">I</span>
        <span class="critical-word">C</span>
        <span class="critical-word">A</span>
        <span class="critical-word">L</span>
        <span class="critical-exclaim">!</span>
      </div>
      <div class="critical-sub">Double Damage!</div>
    `;
    document.body.appendChild(banner);

    // Play critical sound
    SoundSystem.playCritical();

    // Remove after animation
    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 300);
    }, 1200);
  },

  /**
   * Flash the screen with a color effect
   * @param {string} type - 'crit', 'hit', 'heal', 'danger'
   */
  flashScreen(type = 'crit') {
    const flash = document.createElement('div');
    flash.className = `screen-flash screen-flash-${type}`;
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.classList.add('fade-out');
      setTimeout(() => flash.remove(), 200);
    }, 100);
  },

  // ═══════════════════════════════════════════════════════════════
  // COMBO VISUAL ESCALATION
  // ═══════════════════════════════════════════════════════════════

  updateComboVisual(comboElement, count) {
    if (!comboElement) return;

    // Update data attribute for CSS styling
    comboElement.setAttribute('data-combo', Math.min(count, 10));

    // Add special class for 10+
    if (count >= 10) {
      comboElement.classList.add('combo-10');
    } else {
      comboElement.classList.remove('combo-10');
    }

    // Pulse animation on increment
    comboElement.style.animation = 'none';
    void comboElement.offsetWidth;
    comboElement.style.animation = '';
  },

  showComboMilestone(count) {
    const milestones = {
      5: 'COMBO x5!',
      10: 'COMBO x10!!',
      15: 'UNSTOPPABLE!!!',
      20: 'LEGENDARY!!!!',
      25: 'GODLIKE!!!!!'
    };

    const text = milestones[count];
    if (!text) return;

    const popup = document.createElement('div');
    popup.className = 'combo-milestone';
    popup.textContent = text;
    document.body.appendChild(popup);

    // Play sound
    SoundSystem.playCombo(count);

    setTimeout(() => popup.remove(), 1000);
  },

  // ═══════════════════════════════════════════════════════════════
  // WAVE COMPLETION BANNER
  // ═══════════════════════════════════════════════════════════════

  showWaveBanner(waveNumber, bonus = 0) {
    const banner = document.createElement('div');
    banner.className = 'wave-banner';
    banner.innerHTML = `
      <div class="wave-text">WAVE ${waveNumber}</div>
      <div class="wave-subtext">CLEAR!</div>
      ${bonus > 0 ? `<div class="wave-bonus">+${bonus} XP</div>` : ''}
    `;
    document.body.appendChild(banner);

    // Play victory sound
    SoundSystem.playWaveClear();

    setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => banner.remove(), 500);
    }, 2000);
  },

  // ═══════════════════════════════════════════════════════════════
  // MILESTONE CALLOUTS
  // ═══════════════════════════════════════════════════════════════

  showMilestone(count) {
    const popup = document.createElement('div');
    popup.className = 'milestone-popup';
    popup.innerHTML = `<span class="milestone-number">${count}</span><span class="milestone-text"> QUESTIONS!</span>`;
    document.body.appendChild(popup);

    SoundSystem.playMilestone();

    setTimeout(() => popup.remove(), 1500);
  },

  checkMilestone(questionCount) {
    const milestones = [10, 25, 50, 75, 100, 150, 200, 250, 300];
    if (milestones.includes(questionCount)) {
      this.showMilestone(questionCount);
      return true;
    }
    return false;
  },

  // ═══════════════════════════════════════════════════════════════
  // NEAR-DEATH TENSION
  // ═══════════════════════════════════════════════════════════════

  setCriticalHP(isCritical) {
    if (isCritical) {
      document.body.classList.add('critical-hp');
    } else {
      document.body.classList.remove('critical-hp');
    }
  },

  checkCriticalHP(currentHP, maxHP) {
    const percent = (currentHP / maxHP) * 100;
    const wasCritical = document.body.classList.contains('critical-hp');
    const isCritical = percent <= 25;

    this.setCriticalHP(isCritical);

    // Play warning sound when entering critical
    if (isCritical && !wasCritical) {
      SoundSystem.playDanger();
    }

    return isCritical;
  },

  // ═══════════════════════════════════════════════════════════════
  // BOSS PHASE TRANSITION
  // ═══════════════════════════════════════════════════════════════

  triggerPhaseTransition(bossElement) {
    // Flash screen
    const flash = document.createElement('div');
    flash.className = 'phase-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);

    // Big shake
    this.shake('big');

    // Add enraged visual
    if (bossElement) {
      bossElement.classList.add('enraged');
    }

    // Play phase sound
    SoundSystem.playPhaseChange();
  },

  // ═══════════════════════════════════════════════════════════════
  // GAME OVER SCREEN
  // ═══════════════════════════════════════════════════════════════

  showGameOver(stats, onRetry, onMenu) {
    // Remove critical HP effect
    this.setCriticalHP(false);

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
      <div class="game-over-content">
        <div class="game-over-title">GAME OVER</div>
        <div class="game-over-score">
          <div>Questions Answered: <strong>${stats.questionsAnswered || 0}</strong></div>
          <div>Best Streak: <strong>${stats.bestStreak || 0}</strong></div>
          <div>Final Score: <strong>${stats.score || 0}</strong></div>
          ${stats.wave ? `<div>Wave Reached: <strong>${stats.wave}</strong></div>` : ''}
        </div>
        <div class="game-over-buttons">
          <button class="retry-btn" id="gameOverRetry">
            RETRY
            <span class="hotkey">[SPACE]</span>
          </button>
          <button class="menu-btn" id="gameOverMenu">
            MENU
            <span class="hotkey">[ESC]</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Play game over sound
    SoundSystem.playGameOver();

    // Button handlers
    const retryBtn = overlay.querySelector('#gameOverRetry');
    const menuBtn = overlay.querySelector('#gameOverMenu');

    const cleanup = () => {
      overlay.remove();
      document.removeEventListener('keydown', keyHandler);
    };

    retryBtn.addEventListener('click', () => {
      cleanup();
      if (onRetry) onRetry();
    });

    menuBtn.addEventListener('click', () => {
      cleanup();
      if (onMenu) onMenu();
    });

    // Keyboard shortcuts
    const keyHandler = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        cleanup();
        if (onRetry) onRetry();
      } else if (e.code === 'Escape') {
        cleanup();
        if (onMenu) onMenu();
      }
    };

    document.addEventListener('keydown', keyHandler);

    return cleanup;
  },

  // ═══════════════════════════════════════════════════════════════
  // HP BAR EFFECTS
  // ═══════════════════════════════════════════════════════════════

  flashHPBar(hpBarElement) {
    if (!hpBarElement) return;
    hpBarElement.classList.add('damage-flash');
    setTimeout(() => hpBarElement.classList.remove('damage-flash'), 300);
  },

  // ═══════════════════════════════════════════════════════════════
  // STREAK FIRE EFFECT
  // ═══════════════════════════════════════════════════════════════

  setStreakFire(streakElement, isOnFire) {
    if (!streakElement) return;
    if (isOnFire) {
      streakElement.classList.add('on-fire');
    } else {
      streakElement.classList.remove('on-fire');
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // MONSTER DEATH - INK DISSOLVE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Play ink dissolve death animation for monster
   * @param {HTMLElement} monsterElement - The monster sprite element
   * @returns {Promise} Resolves when animation complete
   */
  playMonsterDeath(monsterElement) {
    return new Promise(resolve => {
      if (!monsterElement) {
        resolve();
        return;
      }

      // Add dying class
      monsterElement.classList.add('monster-dying');

      // Create ink splatters
      const rect = monsterElement.getBoundingClientRect();
      const container = monsterElement.parentElement || document.body;

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          const splatter = document.createElement('div');
          splatter.className = 'ink-splatter';
          splatter.style.left = `${rect.left + rect.width/2 + (Math.random() - 0.5) * 60}px`;
          splatter.style.top = `${rect.top + rect.height/2 + (Math.random() - 0.5) * 40}px`;
          splatter.style.width = `${15 + Math.random() * 15}px`;
          splatter.style.height = `${15 + Math.random() * 15}px`;
          splatter.style.animationDelay = `${Math.random() * 0.2}s`;
          document.body.appendChild(splatter);

          setTimeout(() => splatter.remove(), 1500);
        }, i * 50);
      }

      // Create ink pool
      const pool = document.createElement('div');
      pool.className = 'ink-pool';
      pool.style.left = `${rect.left + rect.width/2}px`;
      pool.style.top = `${rect.top + rect.height}px`;
      document.body.appendChild(pool);

      setTimeout(() => pool.remove(), 1300);

      // Play death sound
      SoundSystem.playMonsterDeath();

      // Resolve after animation
      setTimeout(() => {
        monsterElement.classList.remove('monster-dying');
        resolve();
      }, 1200);
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // POTION USE - DRINK & GLOW
  // ═══════════════════════════════════════════════════════════════

  /**
   * Play potion drinking animation
   * @param {string} potionType - 'health', 'block', 'strength', 'draw', 'lucky'
   * @param {string} effectText - Text to show (e.g., "+25 HP")
   * @returns {Promise} Resolves when animation complete
   */
  playPotionUse(potionType, effectText = '') {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = `potion-use-overlay potion-${potionType}`;
      overlay.innerHTML = `
        <div class="potion-use-animation potion-${potionType}">
          <div class="potion-silhouette"></div>
          <div class="silhouette-glow"></div>
          <div class="potion-bottle">${this.getPotionEmoji(potionType)}</div>
          <div class="potion-effect-text">${effectText}</div>
        </div>
      `;
      document.body.appendChild(overlay);

      // Play potion sound
      SoundSystem.playPotionDrink(potionType);

      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 300);
      }, 1800);
    });
  },

  getPotionEmoji(type) {
    const emojis = {
      health: '🧪',
      block: '🛡️',
      strength: '💪',
      draw: '🃏',
      lucky: '🍀'
    };
    return emojis[type] || '🧪';
  },

  // ═══════════════════════════════════════════════════════════════
  // REBUTTAL MODE - CRACKED GLASS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show cracked glass overlay for rebuttal mode
   * @returns {Object} Control object with heal() and shatter() methods
   */
  showRebuttalCrack() {
    const overlay = document.createElement('div');
    overlay.className = 'rebuttal-crack-overlay';
    overlay.innerHTML = `
      <div class="crack-pattern"></div>
      <div class="crack-impact"></div>
    `;
    document.body.appendChild(overlay);

    // Add stamp
    const stamp = document.createElement('div');
    stamp.className = 'rebuttal-stamp';
    stamp.textContent = 'REBUTTAL';
    document.body.appendChild(stamp);

    SoundSystem.playGlassCrack();

    return {
      heal: () => {
        overlay.classList.add('healing');
        stamp.classList.add('fade-out');
        SoundSystem.playGlassHeal();
        setTimeout(() => {
          overlay.remove();
          stamp.remove();
        }, 800);
      },
      shatter: () => {
        overlay.classList.add('shattering');
        stamp.classList.add('fade-out');
        SoundSystem.playGlassShatter();
        this.shake('big');
        setTimeout(() => {
          overlay.remove();
          stamp.remove();
        }, 600);
      },
      remove: () => {
        overlay.remove();
        stamp.remove();
      }
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // BOSS ENTRANCE - PORTRAIT UNVEIL
  // ═══════════════════════════════════════════════════════════════

  /**
   * Play boss portrait entrance animation
   * @param {Object} boss - Boss data with name, sprite, title
   * @returns {Promise} Resolves when animation complete
   */
  playBossEntrance(boss) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'boss-entrance-overlay';
      overlay.innerHTML = `
        <div class="portrait-frame">
          <div class="frame-border"></div>
          <div class="frame-corner top-left"></div>
          <div class="frame-corner top-right"></div>
          <div class="frame-corner bottom-left"></div>
          <div class="frame-corner bottom-right"></div>
          <div class="portrait-canvas">
            <div class="portrait-curtain"></div>
            <div class="boss-portrait-content">
              <div class="boss-portrait-sprite">${boss.sprite || '👹'}</div>
              <div class="boss-portrait-name">${boss.name || 'Unknown Boss'}</div>
              <div class="boss-portrait-title">${boss.title || 'Guardian of Knowledge'}</div>
            </div>
          </div>
          <div class="boss-name-plate">
            <div style="font-family: 'EB Garamond', Georgia, serif; font-size: 1.1rem; color: #c9a55c; text-transform: uppercase; letter-spacing: 2px;">${boss.name || 'Unknown Boss'}</div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      SoundSystem.playBossEntrance();

      // Click to dismiss after reveal
      setTimeout(() => {
        overlay.style.cursor = 'pointer';
        const dismiss = () => {
          overlay.classList.add('fade-out');
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 300);
        };
        overlay.addEventListener('click', dismiss);

        // Auto-dismiss after 4 seconds
        setTimeout(dismiss, 4000);
      }, 2000);
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // MYSTERY EVENT - FOG PARTING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show mystery event with fog parting reveal
   * @param {string} icon - Icon to show in fog
   * @returns {Object} Control object with reveal() method
   */
  showMysteryFog(icon = '❓') {
    const overlay = document.createElement('div');
    overlay.className = 'mystery-fog-overlay';
    overlay.innerHTML = `
      <div class="fog-layer"></div>
      <div class="fog-layer"></div>
      <div class="fog-layer"></div>
      <div class="mystery-icon-container">
        <div class="mystery-icon">${icon}</div>
      </div>
      <div class="mystery-content"></div>
    `;
    document.body.appendChild(overlay);

    SoundSystem.playMysteryAmbience();

    return {
      reveal: (content) => {
        return new Promise(resolve => {
          const contentEl = overlay.querySelector('.mystery-content');
          contentEl.innerHTML = content;

          overlay.classList.add('revealing');
          SoundSystem.playMysteryReveal();

          setTimeout(() => {
            resolve();
          }, 1500);
        });
      },
      remove: () => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 300);
      }
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // VICTORY FANFARE - BOOK CLOSING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show victory book closing sequence
   * @param {Object} stats - Run statistics
   * @param {Function} onContinue - Callback when continue clicked
   */
  showVictoryBook(stats, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'victory-book-overlay';

    const storyText = this.generateVictoryStory(stats);

    overlay.innerHTML = `
      <div class="victory-book">
        <div class="book-cover-back"></div>
        <div class="book-pages">
          <div class="victory-story">
            <div class="chapter-title">Journey's End</div>
            ${storyText}
            <div class="victory-stats">
              <div class="victory-stat">
                <span class="victory-stat-label">Questions Answered</span>
                <span class="victory-stat-value">${stats.questionsAnswered || 0}</span>
              </div>
              <div class="victory-stat">
                <span class="victory-stat-label">Accuracy</span>
                <span class="victory-stat-value">${stats.accuracy || 0}%</span>
              </div>
              <div class="victory-stat">
                <span class="victory-stat-label">Best Streak</span>
                <span class="victory-stat-value">${stats.bestStreak || 0}</span>
              </div>
              <div class="victory-stat">
                <span class="victory-stat-label">Bosses Defeated</span>
                <span class="victory-stat-value">${stats.bossesDefeated || 0}</span>
              </div>
              <div class="victory-stat">
                <span class="victory-stat-label">Final Score</span>
                <span class="victory-stat-value">${stats.score || 0}</span>
              </div>
              <div class="victory-stat">
                <span class="victory-stat-label">Time</span>
                <span class="victory-stat-value">${stats.duration || '0:00'}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="book-cover-front">
          <div class="cover-emblem">📚</div>
          <div class="cover-title">Victory</div>
          <div class="cover-subtitle">A Tale of Knowledge</div>
        </div>
      </div>
      <div class="victory-continue">
        <button class="victory-continue-btn">Continue</button>
      </div>
    `;
    document.body.appendChild(overlay);

    SoundSystem.playVictoryFanfare();

    // Close book after story displays
    setTimeout(() => {
      const book = overlay.querySelector('.victory-book');
      book.classList.add('closing');

      setTimeout(() => {
        book.classList.add('closed');
        SoundSystem.playBookClose();
      }, 1000);
    }, 3500);

    // Continue button
    const continueBtn = overlay.querySelector('.victory-continue-btn');
    continueBtn.addEventListener('click', () => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        if (onContinue) onContinue();
      }, 300);
    });
  },

  generateVictoryStory(stats) {
    const actsWord = stats.actsCompleted === 1 ? 'chapter' : 'chapters';
    const accuracy = stats.accuracy || 0;

    let qualityPhrase = 'with determination';
    if (accuracy >= 90) qualityPhrase = 'with masterful precision';
    else if (accuracy >= 80) qualityPhrase = 'with scholarly expertise';
    else if (accuracy >= 70) qualityPhrase = 'with growing confidence';

    return `
      <p class="story-text">And so the journey through ${stats.actsCompleted || 1} ${actsWord} of knowledge came to its conclusion.</p>
      <p class="story-text">The student faced ${stats.questionsAnswered || 0} challenges ${qualityPhrase}.</p>
      <p class="story-text">${stats.bossesDefeated || 0} great guardians fell before their resolve.</p>
      <p class="story-text">The shadows of ignorance retreated, replaced by the warm glow of understanding.</p>
      <p class="story-text">Ms. Luminara smiled. Another mind illuminated.</p>
    `;
  },

  // ═══════════════════════════════════════════════════════════════
  // BURNING TALLY COMBO COUNTER
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update burning tally combo display
   * @param {HTMLElement} container - Container element
   * @param {number} streak - Current streak count
   */
  updateBurningTally(container, streak) {
    if (!container) return;

    // Convert to Roman numeral
    const numeral = this.toRomanNumeral(streak);

    // Update display
    container.setAttribute('data-streak', Math.min(streak, 10));

    const numeralEl = container.querySelector('.tally-numeral');
    if (numeralEl) {
      numeralEl.textContent = numeral;
    }

    // Add/remove fire state
    if (streak >= 8) {
      container.classList.add('on-fire');
    } else {
      container.classList.remove('on-fire');
    }
  },

  toRomanNumeral(num) {
    if (num <= 0) return '-';
    if (num > 20) return num.toString();

    const romanNumerals = [
      '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
    ];
    return romanNumerals[num] || num.toString();
  },

  // ═══════════════════════════════════════════════════════════════
  // MOONLIT GARDEN REST SITE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create moonlit garden background for rest site
   * @param {HTMLElement} container - Container to add garden to
   */
  createMoonlitGarden(container) {
    const garden = document.createElement('div');
    garden.className = 'moonlit-garden';
    garden.innerHTML = `
      <div class="moon"></div>
      <div class="garden-foliage"></div>
      <div class="garden-leaves"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
    `;
    container.insertBefore(garden, container.firstChild);

    SoundSystem.playNightAmbience();

    return garden;
  }
};

// ═══════════════════════════════════════════════════════════════
// SOUND SYSTEM (Web Audio API - No external files needed)
// ═══════════════════════════════════════════════════════════════

const SoundSystem = {
  audioCtx: null,
  enabled: true,
  volume: 0.3,

  init() {
    // Create audio context on first user interaction
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this;
  },

  ensureContext() {
    if (!this.audioCtx) {
      this.init();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  playTone(freq, duration, type = 'sine', volume = null) {
    if (!this.enabled) return;
    this.ensureContext();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.frequency.value = freq;
    osc.type = type;

    const vol = volume !== null ? volume : this.volume;
    gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  },

  playChord(frequencies, duration, type = 'sine') {
    frequencies.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, duration, type, this.volume * 0.5), i * 30);
    });
  },

  // Sound effects
  playCorrect() {
    this.playTone(880, 0.1, 'sine');
    setTimeout(() => this.playTone(1100, 0.15, 'sine'), 50);
  },

  playWrong() {
    this.playTone(200, 0.2, 'sawtooth', this.volume * 0.4);
    setTimeout(() => this.playTone(150, 0.3, 'sawtooth', this.volume * 0.3), 100);
  },

  playCombo(count) {
    const baseFreq = 660 + (count * 50);
    this.playTone(baseFreq, 0.1, 'sine');
    setTimeout(() => this.playTone(baseFreq * 1.25, 0.1, 'sine'), 60);
    setTimeout(() => this.playTone(baseFreq * 1.5, 0.15, 'sine'), 120);
  },

  playMilestone() {
    this.playChord([523, 659, 784], 0.2, 'sine'); // C major
    setTimeout(() => this.playChord([587, 740, 880], 0.3, 'sine'), 150); // D major
  },

  playWaveClear() {
    // Victory fanfare
    const notes = [523, 659, 784, 1047]; // C E G C
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100);
    });
    setTimeout(() => this.playChord([1047, 1319, 1568], 0.4, 'sine'), 450);
  },

  playPhaseChange() {
    // Dramatic chord
    this.playTone(150, 0.5, 'sawtooth', this.volume * 0.5);
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth', this.volume * 0.4), 100);
    setTimeout(() => this.playTone(100, 0.6, 'sawtooth', this.volume * 0.6), 200);
  },

  playDanger() {
    // Low warning pulse
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playTone(150, 0.15, 'square', this.volume * 0.3), i * 200);
    }
  },

  playGameOver() {
    // Descending sad tones
    const notes = [400, 350, 300, 250, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sine', this.volume * 0.4), i * 150);
    });
  },

  playLevelUp() {
    // Triumphant ascending
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine'), i * 80);
    });
    setTimeout(() => this.playChord([1047, 1319, 1568], 0.5, 'sine'), 450);
  },

  playDamage() {
    this.playTone(150, 0.1, 'sawtooth', this.volume * 0.4);
  },

  playCritical() {
    // Epic critical hit sound - high impact then ascending triumphant notes
    this.playTone(100, 0.15, 'sawtooth', this.volume * 0.6);
    setTimeout(() => {
      this.playTone(880, 0.1, 'sine');
      this.playTone(1100, 0.1, 'sine', this.volume * 0.8);
    }, 50);
    setTimeout(() => {
      this.playChord([1047, 1319, 1568], 0.25, 'sine');
    }, 120);
  },

  playHeal() {
    this.playTone(600, 0.1, 'sine');
    setTimeout(() => this.playTone(800, 0.15, 'sine'), 80);
  },

  playCoinClink() {
    // Metallic clink sound
    this.playTone(2000, 0.05, 'triangle', this.volume * 0.4);
    setTimeout(() => this.playTone(2400, 0.08, 'triangle', this.volume * 0.3), 30);
    setTimeout(() => this.playTone(1800, 0.1, 'triangle', this.volume * 0.2), 60);
  },

  playBossDeath() {
    // Epic death sound
    this.playTone(200, 0.3, 'sawtooth', this.volume * 0.5);
    setTimeout(() => {
      this.playTone(150, 0.4, 'sawtooth', this.volume * 0.4);
      this.playWaveClear();
    }, 200);
  },

  playActTransition() {
    // Dramatic whoosh + ascending ethereal tones
    this.playTone(80, 0.5, 'sine', this.volume * 0.3);
    setTimeout(() => {
      this.playChord([392, 494, 587], 0.4, 'sine'); // G major
    }, 200);
    setTimeout(() => {
      this.playChord([440, 554, 659], 0.5, 'sine'); // A major
    }, 600);
    setTimeout(() => {
      this.playChord([523, 659, 784], 0.6, 'sine'); // C major
    }, 1000);
    setTimeout(() => {
      this.playChord([587, 740, 880], 0.8, 'sine'); // D major - triumphant
    }, 1500);
  },

  // ═══════════════════════════════════════════════════════════════
  // CHIPTUNE HYBRID SOUNDS - Retro + Orchestral blend
  // ═══════════════════════════════════════════════════════════════

  playMonsterDeath() {
    // Chiptune descend + orchestral decay
    const notes = [600, 500, 400, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'square', this.volume * 0.25);
        this.playTone(freq * 0.5, 0.2, 'sine', this.volume * 0.15);
      }, i * 60);
    });
    // Final thud
    setTimeout(() => this.playTone(80, 0.3, 'sine', this.volume * 0.3), 350);
  },

  playPotionDrink(type) {
    // Cork pop (chiptune)
    this.playTone(1200, 0.05, 'square', this.volume * 0.3);
    setTimeout(() => this.playTone(800, 0.05, 'square', this.volume * 0.2), 30);

    // Pouring/drinking (sine waves)
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone(400 + Math.random() * 200, 0.1, 'sine', this.volume * 0.15);
        }, i * 80);
      }
    }, 100);

    // Effect sound based on type
    setTimeout(() => {
      const effectSounds = {
        health: [523, 659, 784],     // C major - healing
        block: [349, 440, 523],      // F major - defensive
        strength: [392, 494, 587],   // G major - power
        draw: [440, 554, 659],       // A major - magical
        lucky: [523, 659, 784, 1047] // C major extended - lucky
      };
      const chord = effectSounds[type] || effectSounds.health;
      this.playChord(chord, 0.3, 'sine');
    }, 500);
  },

  playGlassCrack() {
    // Sharp crack sound (chiptune noise simulation)
    this.playTone(2000, 0.03, 'sawtooth', this.volume * 0.4);
    this.playTone(1500, 0.05, 'square', this.volume * 0.3);
    setTimeout(() => {
      this.playTone(300, 0.1, 'sawtooth', this.volume * 0.2);
    }, 30);
  },

  playGlassHeal() {
    // Reverse crack - chime-like healing
    const notes = [400, 600, 800, 1000, 1200];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'sine', this.volume * 0.2);
      }, i * 50);
    });
    // Sparkling finish
    setTimeout(() => {
      this.playChord([1047, 1319, 1568], 0.3, 'sine');
    }, 300);
  },

  playGlassShatter() {
    // Multiple crack sounds + low thud
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(1500 + Math.random() * 1000, 0.04, 'sawtooth', this.volume * 0.25);
      }, i * 20);
    }
    setTimeout(() => {
      this.playTone(100, 0.2, 'sine', this.volume * 0.3);
    }, 100);
  },

  playBossEntrance() {
    // Dramatic orchestral + chiptune hybrid
    // Low rumble
    this.playTone(60, 0.8, 'sine', this.volume * 0.3);

    // Chiptune fanfare
    setTimeout(() => {
      const fanfare = [392, 0, 392, 494, 587];
      fanfare.forEach((freq, i) => {
        if (freq > 0) {
          setTimeout(() => this.playTone(freq, 0.15, 'square', this.volume * 0.25), i * 150);
        }
      });
    }, 200);

    // Orchestral swell
    setTimeout(() => {
      this.playChord([196, 247, 294], 0.5, 'sine'); // Low G major
    }, 800);

    // Boss reveal chord
    setTimeout(() => {
      this.playChord([392, 494, 587, 784], 0.6, 'sine'); // G major spread
      this.playTone(98, 0.4, 'sine', this.volume * 0.4); // Sub bass
    }, 1200);
  },

  playMysteryAmbience() {
    // Eerie pad + chiptune arpeggios
    this.playTone(220, 1, 'sine', this.volume * 0.1);
    this.playTone(330, 1, 'sine', this.volume * 0.08);

    // Mysterious arpeggios
    const arp = [330, 392, 440, 392];
    arp.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'triangle', this.volume * 0.15);
      }, i * 300);
    });
  },

  playMysteryReveal() {
    // Whoosh + sparkle
    this.playTone(200, 0.3, 'sine', this.volume * 0.2);
    setTimeout(() => this.playTone(400, 0.2, 'sine', this.volume * 0.2), 100);
    setTimeout(() => this.playTone(800, 0.15, 'sine', this.volume * 0.2), 200);

    // Chiptune sparkles
    setTimeout(() => {
      const sparkles = [1200, 1400, 1600, 1800, 2000];
      sparkles.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.05, 'square', this.volume * 0.15), i * 40);
      });
    }, 300);

    // Resolution chord
    setTimeout(() => {
      this.playChord([523, 659, 784], 0.4, 'sine');
    }, 500);
  },

  playVictoryFanfare() {
    // Epic chiptune + orchestral victory theme
    // Intro trumpets (square waves)
    const intro = [523, 523, 523, 659];
    intro.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'square', this.volume * 0.25), i * 200);
    });

    // Main theme
    setTimeout(() => {
      const melody = [784, 880, 988, 1047, 988, 880, 784];
      melody.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.25, 'square', this.volume * 0.2);
          this.playTone(freq / 2, 0.25, 'sine', this.volume * 0.15);
        }, i * 180);
      });
    }, 800);

    // Orchestral swell
    setTimeout(() => {
      this.playChord([523, 659, 784], 0.5, 'sine');
    }, 2000);

    // Final triumphant chord
    setTimeout(() => {
      this.playChord([523, 659, 784, 1047], 0.8, 'sine');
      this.playTone(131, 0.6, 'sine', this.volume * 0.4); // Bass C
    }, 2500);
  },

  playBookClose() {
    // Heavy book thud
    this.playTone(80, 0.15, 'sine', this.volume * 0.5);
    this.playTone(60, 0.2, 'sine', this.volume * 0.4);
    // Page flutter
    setTimeout(() => {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.playTone(2000 + Math.random() * 500, 0.02, 'sawtooth', this.volume * 0.1);
        }, i * 20);
      }
    }, 50);
  },

  playNightAmbience() {
    // Soft pad for rest site
    this.playTone(220, 2, 'sine', this.volume * 0.05);
    this.playTone(277, 2, 'sine', this.volume * 0.04);
    this.playTone(330, 2, 'sine', this.volume * 0.03);

    // Occasional cricket chirps
    setTimeout(() => {
      this.playTone(4000, 0.02, 'square', this.volume * 0.08);
      setTimeout(() => this.playTone(3800, 0.02, 'square', this.volume * 0.06), 50);
    }, 500);
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }
};

// Initialize sound on first click (required by browsers)
document.addEventListener('click', () => SoundSystem.init(), { once: true });
document.addEventListener('keydown', () => SoundSystem.init(), { once: true });

// Export for use
if (typeof window !== 'undefined') {
  window.ScreenEffects = ScreenEffects;
  window.SoundSystem = SoundSystem;
}
