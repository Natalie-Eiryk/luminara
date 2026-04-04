/**
 * Ms. Luminara Quiz - Card Battle UI
 * Slay the Spire style card combat interface for boss encounters
 *
 * @module CardBattleUI
 * @version 1.0.0
 */

const CardBattleUI = {
  // State
  active: false,
  currentBoss: null,
  playerHP: 80,
  maxPlayerHP: 80,
  bossHP: 0,
  maxBossHP: 0,
  turn: 0,
  isMiniBoss: false,
  bankId: null,
  bossPhase: 1,  // Phase 1 (>50%), 2 (25-50%), 3 (<25%)

  // DOM Elements
  container: null,

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Start a card battle against a boss
   */
  startBattle(bossId, categoryId) {
    this.active = true;
    this.categoryId = categoryId;
    this.isMiniBoss = false;
    this.bankId = null;

    // Get boss data
    if (typeof BOSSES !== 'undefined') {
      this.currentBoss = BOSSES[bossId] || BOSSES.THE_FORGETFUL_ONE;
    } else {
      // Fallback boss data
      this.currentBoss = {
        name: 'The Forgetful One',
        subtitle: 'Destroyer of Short-Term Memory',
        emoji: '🧠💨',
        maxHP: 120,
        baseDamage: 12,
        abilities: [
          { name: 'Memory Wipe', damage: 10, description: 'Deals 10 damage' },
          { name: 'Confusion', damage: 8, description: 'Deals 8 damage' }
        ],
        tauntMessages: ["Your neurons are slipping..."]
      };
    }

    this.bossHP = this.currentBoss.maxHP;
    this.maxBossHP = this.currentBoss.maxHP;
    this.playerHP = this.maxPlayerHP;
    this.turn = 0;
    this.bossPhase = 1;

    // Initialize card system combat
    if (typeof CardSystem !== 'undefined') {
      CardSystem.initCombat();
    }

    // Play dramatic entrance animation
    this.playBossEntrance().then(() => {
      this.render();
      this.startPlayerTurn();
    });

    console.log('[CardBattle] Battle started against', this.currentBoss.name);
  },

  /**
   * Start a mini-boss encounter (bank gatekeeper)
   * @param {string} bankId - The bank that was completed
   * @param {function} onComplete - Callback when battle ends
   */
  startMiniBossBattle(bankId, onComplete) {
    this.active = true;
    this.isMiniBoss = true;
    this.bankId = bankId;
    this.onMiniBossComplete = onComplete;

    // Get mini-boss for this bank
    if (typeof getBankMiniBoss === 'function') {
      this.currentBoss = getBankMiniBoss(bankId);
    } else if (typeof MINI_BOSSES !== 'undefined') {
      const bosses = Object.values(MINI_BOSSES);
      this.currentBoss = bosses[Math.floor(Math.random() * bosses.length)];
    } else {
      // Fallback mini-boss
      this.currentBoss = {
        name: 'Knowledge Sprite',
        emoji: '✨',
        maxHP: 30,
        baseDamage: 5,
        abilities: [{ name: 'Quiz', damage: 5, description: 'A quick question!' }],
        tauntMessages: ["Test your knowledge!"],
        defeatQuote: "Well studied!",
        cardPool: ['quick_recall', 'flash_cards']
      };
    }

    this.bossHP = this.currentBoss.maxHP;
    this.maxBossHP = this.currentBoss.maxHP;
    this.playerHP = this.maxPlayerHP;
    this.turn = 0;

    // Initialize card system combat
    if (typeof CardSystem !== 'undefined') {
      CardSystem.initCombat();
    }

    this.render();
    this.startPlayerTurn();

    console.log('[CardBattle] Mini-boss battle started:', this.currentBoss.name);
  },

  /**
   * End the current battle
   */
  endBattle(victory) {
    this.active = false;

    if (victory) {
      this.showVictoryScreen();
    } else {
      this.showDefeatScreen();
    }
  },

  // ============================================
  // TURN MANAGEMENT
  // ============================================

  startPlayerTurn() {
    this.turn++;

    if (typeof CardSystem !== 'undefined') {
      CardSystem.startTurn();
    }

    this.updateUI();
    this.showBossIntent();

    console.log('[CardBattle] Player turn', this.turn);
  },

  endPlayerTurn() {
    // End turn effects from cards
    let endTurnDamage = 0;
    if (typeof CardSystem !== 'undefined') {
      const result = CardSystem.endTurn();
      endTurnDamage = result.endTurnDamage || 0;
    }

    // Apply end-turn damage to boss (from powers)
    if (endTurnDamage > 0) {
      this.dealDamageToBoss(endTurnDamage, 'Power');
    }

    // Check if boss is dead
    if (this.bossHP <= 0) {
      this.endBattle(true);
      return;
    }

    // Boss turn
    setTimeout(() => this.executeBossTurn(), 500);
  },

  executeBossTurn() {
    // Select random ability
    const abilities = this.currentBoss.abilities || [];
    const ability = abilities[Math.floor(Math.random() * abilities.length)];

    if (!ability) {
      this.startPlayerTurn();
      return;
    }

    // Calculate damage (reduced by player block)
    let damage = ability.damage || this.currentBoss.baseDamage || 10;
    let blocked = 0;

    if (typeof CardSystem !== 'undefined' && CardSystem.combatState) {
      const block = CardSystem.combatState.block || 0;
      blocked = Math.min(block, damage);
      damage -= blocked;
      CardSystem.combatState.block -= blocked;
    }

    // Show boss attack animation
    this.showBossAttack(ability, damage, blocked);

    // Apply damage to player
    if (damage > 0) {
      this.playerHP = Math.max(0, this.playerHP - damage);
    }

    // Check if player is dead
    if (this.playerHP <= 0) {
      setTimeout(() => this.endBattle(false), 1000);
      return;
    }

    // Start next player turn
    setTimeout(() => this.startPlayerTurn(), 1500);
  },

  // ============================================
  // CARD PLAY
  // ============================================

  playCard(cardId) {
    if (!this.active) return;

    if (typeof CardSystem === 'undefined') {
      console.warn('[CardBattle] CardSystem not available');
      return;
    }

    const result = CardSystem.playCard(cardId);

    if (!result.success) {
      this.showMessage(result.error, 'error');
      return;
    }

    // Apply damage to boss
    if (result.damage > 0) {
      this.dealDamageToBoss(result.damage, cardId);
    }

    // Show effects
    if (result.effects && result.effects.length > 0) {
      result.effects.forEach(eff => this.showMessage(eff, 'buff'));
    }

    // Heal player
    if (result.heal > 0) {
      this.playerHP = Math.min(this.maxPlayerHP, this.playerHP + result.heal);
      this.showMessage(`+${result.heal} HP`, 'heal');
    }

    this.updateUI();

    // Check if boss is dead
    if (this.bossHP <= 0) {
      setTimeout(() => this.endBattle(true), 500);
    }
  },

  dealDamageToBoss(amount, source) {
    this.bossHP = Math.max(0, this.bossHP - amount);

    // Animate damage
    const bossEl = document.getElementById('cardBattleBoss');
    if (bossEl) {
      bossEl.classList.add('hit');
      setTimeout(() => bossEl.classList.remove('hit'), 300);
    }

    // Show damage number
    this.showDamageNumber(amount, 'boss');

    // Check for phase transitions
    this.checkBossPhase();

    this.updateUI();
  },

  // ============================================
  // BOSS ENTRANCE & PHASE TRANSITIONS
  // ============================================

  /**
   * Play dramatic boss entrance animation
   */
  playBossEntrance() {
    return new Promise(resolve => {
      // Create entrance overlay
      let overlay = document.getElementById('boss-entrance-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'boss-entrance-overlay';
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div class="boss-entrance-content">
          <div class="boss-entrance-warning">⚠️ BOSS ENCOUNTER ⚠️</div>
          <div class="boss-entrance-emoji">${this.currentBoss.emoji}</div>
          <div class="boss-entrance-name">${this.currentBoss.name}</div>
          <div class="boss-entrance-subtitle">${this.currentBoss.subtitle || ''}</div>
        </div>
      `;

      overlay.className = 'boss-entrance-overlay active';

      // Play sound if available
      if (typeof SoundSystem !== 'undefined' && SoundSystem.playBossIntro) {
        SoundSystem.playBossIntro();
      }

      // Screen effect
      if (typeof ScreenEffects !== 'undefined') {
        ScreenEffects.screenShake(0.5);
      }

      // Fade out after animation
      setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
          overlay.style.display = 'none';
          overlay.classList.remove('active', 'fade-out');
          resolve();
        }, 500);
      }, 2500);
    });
  },

  /**
   * Check for boss phase transitions
   */
  checkBossPhase() {
    const hpPercent = (this.bossHP / this.maxBossHP) * 100;
    let newPhase = 1;

    if (hpPercent <= 25) {
      newPhase = 3;
    } else if (hpPercent <= 50) {
      newPhase = 2;
    }

    if (newPhase !== this.bossPhase) {
      this.bossPhase = newPhase;
      this.playPhaseTransition(newPhase);
    }
  },

  /**
   * Play phase transition effect
   */
  playPhaseTransition(phase) {
    const bossEl = document.getElementById('cardBattleBoss');
    if (!bossEl) return;

    // Screen shake
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.screenShake(0.3);
    }

    // Flash effect
    const arena = document.querySelector('.card-battle-arena');
    if (arena) {
      arena.classList.add('phase-transition');
      setTimeout(() => arena.classList.remove('phase-transition'), 500);
    }

    // Update boss appearance based on phase
    bossEl.classList.remove('phase-1', 'phase-2', 'phase-3');
    bossEl.classList.add(`phase-${phase}`);

    // Show phase message
    const phaseMessages = {
      2: `${this.currentBoss.name} is getting serious!`,
      3: `${this.currentBoss.name} enters RAGE MODE!`
    };

    if (phaseMessages[phase]) {
      this.showMessage(phaseMessages[phase], 'phase');
    }

    // Increase boss damage in later phases
    if (phase >= 2 && this.currentBoss.abilities) {
      // Boss deals more damage in later phases (already handled by abilities, but visual feedback)
      console.log(`[CardBattle] Boss entered phase ${phase}`);
    }
  },

  // ============================================
  // EVENT LISTENERS
  // ============================================

  /**
   * Attach event listeners using delegation and data attributes
   * CSP-compliant - no inline onclick handlers
   */
  attachEventListeners() {
    if (!this.container) return;

    // Remove old listeners to prevent duplicates
    const oldHandler = this.container._battleClickHandler;
    if (oldHandler) {
      this.container.removeEventListener('click', oldHandler);
    }

    // Event delegation handler
    const clickHandler = (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const cardId = target.dataset.cardId;

      switch (action) {
        case 'end-turn':
          this.endPlayerTurn();
          break;

        case 'play-card':
          if (cardId) this.playCard(cardId);
          break;

        case 'select-reward':
          if (cardId) this.selectReward(cardId);
          break;

        case 'skip-reward':
          this.skipReward();
          break;

        case 'close-battle':
          this.closeBattle();
          break;
      }
    };

    // Store reference for cleanup
    this.container._battleClickHandler = clickHandler;
    this.container.addEventListener('click', clickHandler);
  },

  // ============================================
  // RENDERING
  // ============================================

  render() {
    // Get or create container
    let container = document.getElementById('cardBattleContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cardBattleContainer';
      container.className = 'card-battle-container';
      document.body.appendChild(container);
    }
    this.container = container;

    container.innerHTML = `
      <div class="card-battle-backdrop"></div>
      <div class="card-battle-arena">
        <!-- Boss Section -->
        <div class="card-battle-boss-section">
          <div class="boss-display" id="cardBattleBoss">
            <div class="boss-emoji">${this.currentBoss.emoji}</div>
            <div class="boss-hp-bar">
              <div class="boss-hp-fill" id="cardBattleBossHP" style="width: 100%"></div>
              <span class="boss-hp-text" id="cardBattleBossHPText">${this.bossHP}/${this.maxBossHP}</span>
            </div>
            <div class="boss-name">${this.currentBoss.name}</div>
            <div class="boss-subtitle">${this.currentBoss.subtitle || ''}</div>
            <div class="boss-intent" id="bossIntent"></div>
          </div>
        </div>

        <!-- Player Status -->
        <div class="card-battle-player-section">
          <div class="player-status-bar">
            <div class="player-hp-display">
              <span class="hp-icon">❤️</span>
              <span class="hp-text" id="cardBattlePlayerHP">${this.playerHP}/${this.maxPlayerHP}</span>
              <div class="hp-bar">
                <div class="hp-fill" id="cardBattlePlayerHPFill" style="width: 100%"></div>
              </div>
            </div>
            <div class="player-block" id="playerBlock" style="display: none;">
              <span class="block-icon">🛡️</span>
              <span class="block-amount" id="playerBlockAmount">0</span>
            </div>
            <div class="player-buffs" id="playerBuffs"></div>
          </div>
        </div>

        <!-- Card Play Area -->
        <div class="card-battle-play-area">
          <div class="energy-display" id="energyDisplay">
            <div class="energy-orb" id="energyOrb">3</div>
            <span class="energy-text">Energy</span>
          </div>

          <!-- Draw Pile -->
          <div class="pile draw-pile" id="drawPile" title="Draw Pile">
            <span class="pile-count" id="drawPileCount">0</span>
            <span class="pile-label">Draw</span>
          </div>

          <!-- Discard Pile -->
          <div class="pile discard-pile" id="discardPile" title="Discard Pile">
            <span class="pile-count" id="discardPileCount">0</span>
            <span class="pile-label">Discard</span>
          </div>
        </div>

        <!-- Card Hand -->
        <div class="card-battle-hand" id="cardHand">
          ${this.renderHand()}
        </div>

        <!-- End Turn Button -->
        <button class="end-turn-btn" id="endTurnBtn" data-action="end-turn">
          End Turn
        </button>

        <!-- Messages -->
        <div class="battle-messages" id="battleMessages"></div>
      </div>
    `;

    container.style.display = 'flex';

    // Attach event listeners
    this.attachEventListeners();

    this.updateUI();
  },

  renderHand() {
    if (typeof CardSystem === 'undefined' || !CardSystem.combatState) {
      return '<div class="empty-hand">No cards available</div>';
    }

    return CardSystem.combatState.hand.map(cardId => {
      const card = CardSystem.getCard(cardId);
      if (!card) return '';

      const rarity = CardSystem.CARD_RARITIES[card.rarity];
      const state = CardSystem.combatState;
      const cost = state.buffs?.allCostOne ? 1 : card.cost;
      const canPlay = state.energy >= cost;

      return `
        <div class="battle-card card-${card.type} card-${card.rarity.toLowerCase()} ${canPlay ? 'playable' : 'unplayable'}"
             data-card-id="${cardId}"
             data-action="play-card"
             style="--rarity-color: ${rarity.color}">
          <div class="card-cost">${cost}</div>
          <div class="card-emoji">${card.emoji}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-type">${card.type}</div>
          <div class="card-description">${card.description}</div>
          <div class="card-rarity">${rarity.name}</div>
        </div>
      `;
    }).join('');
  },

  updateUI() {
    // Update boss HP
    const bossHPFill = document.getElementById('cardBattleBossHP');
    const bossHPText = document.getElementById('cardBattleBossHPText');
    if (bossHPFill) {
      const pct = Math.max(0, (this.bossHP / this.maxBossHP) * 100);
      bossHPFill.style.width = pct + '%';

      // Color based on HP
      if (pct > 50) {
        bossHPFill.style.background = 'linear-gradient(90deg, var(--correct), #4ade80)';
      } else if (pct > 25) {
        bossHPFill.style.background = 'linear-gradient(90deg, var(--gold), #fbbf24)';
      } else {
        bossHPFill.style.background = 'linear-gradient(90deg, var(--incorrect), #ef4444)';
      }
    }
    if (bossHPText) {
      bossHPText.textContent = `${Math.max(0, this.bossHP)}/${this.maxBossHP}`;
    }

    // Update player HP
    const playerHPText = document.getElementById('cardBattlePlayerHP');
    const playerHPFill = document.getElementById('cardBattlePlayerHPFill');
    if (playerHPText) {
      playerHPText.textContent = `${this.playerHP}/${this.maxPlayerHP}`;
    }
    if (playerHPFill) {
      const pct = Math.max(0, (this.playerHP / this.maxPlayerHP) * 100);
      playerHPFill.style.width = pct + '%';
    }

    // Update block
    if (typeof CardSystem !== 'undefined' && CardSystem.combatState) {
      const block = CardSystem.combatState.block || 0;
      const blockEl = document.getElementById('playerBlock');
      const blockAmount = document.getElementById('playerBlockAmount');

      if (blockEl) {
        blockEl.style.display = block > 0 ? 'flex' : 'none';
      }
      if (blockAmount) {
        blockAmount.textContent = block;
      }

      // Update energy
      const energyOrb = document.getElementById('energyOrb');
      if (energyOrb) {
        energyOrb.textContent = CardSystem.combatState.energy;
      }

      // Update piles
      const drawCount = document.getElementById('drawPileCount');
      const discardCount = document.getElementById('discardPileCount');
      if (drawCount) {
        drawCount.textContent = CardSystem.combatState.drawPile.length;
      }
      if (discardCount) {
        discardCount.textContent = CardSystem.combatState.discardPile.length;
      }

      // Update buffs
      this.renderBuffs();
    }

    // Update hand
    const handEl = document.getElementById('cardHand');
    if (handEl) {
      handEl.innerHTML = this.renderHand();
    }
  },

  renderBuffs() {
    const buffsEl = document.getElementById('playerBuffs');
    if (!buffsEl) return;

    if (typeof CardSystem === 'undefined' || !CardSystem.combatState) {
      buffsEl.innerHTML = '';
      return;
    }

    const state = CardSystem.combatState;
    const buffs = [];

    // Strength
    if (state.strength > 0) {
      buffs.push({ icon: '💪', count: state.strength, name: 'Strength' });
    }

    // Powers
    if (state.powers.strengthPerTurn) {
      buffs.push({ icon: '🌱', count: state.powers.strengthPerTurn, name: 'Growth' });
    }
    if (state.powers.bonusEnergy) {
      buffs.push({ icon: '⚡', count: state.powers.bonusEnergy, name: 'Energy' });
    }
    if (state.powers.drawPerTurn) {
      buffs.push({ icon: '📖', count: state.powers.drawPerTurn, name: 'Draw' });
    }
    if (state.powers.retainBlock) {
      buffs.push({ icon: '🧲', count: state.powers.retainBlock, name: 'Retain' });
    }

    buffsEl.innerHTML = buffs.map(b => `
      <div class="buff-icon" title="${b.name}">
        ${b.icon}
        <span class="buff-count">${b.count}</span>
      </div>
    `).join('');
  },

  showBossIntent() {
    const intentEl = document.getElementById('bossIntent');
    if (!intentEl) return;

    // Pick a random ability to show as intent
    const abilities = this.currentBoss.abilities || [];
    const ability = abilities[Math.floor(Math.random() * abilities.length)];

    if (ability) {
      intentEl.innerHTML = `
        <div class="intent-icon">⚔️</div>
        <span class="intent-text">${ability.name}: ${ability.damage || '?'} damage</span>
      `;
      intentEl.style.display = 'flex';
    }
  },

  showBossAttack(ability, damage, blocked) {
    // Dramatic screen shake based on damage
    if (typeof ScreenEffects !== 'undefined') {
      const intensity = damage > 15 ? 0.6 : (damage > 10 ? 0.4 : 0.2);
      ScreenEffects.screenShake(intensity);
    }

    // Flash the screen with phase-dependent color
    const arena = document.querySelector('.card-battle-arena');
    if (arena) {
      const flashClass = this.bossPhase === 3 ? 'boss-attacking-rage' :
                         this.bossPhase === 2 ? 'boss-attacking-enraged' :
                         'boss-attacking';
      arena.classList.add(flashClass);
      setTimeout(() => arena.classList.remove(flashClass), 500);
    }

    // Animate boss "lunging"
    const bossEl = document.getElementById('cardBattleBoss');
    if (bossEl) {
      bossEl.classList.add('attacking');
      setTimeout(() => bossEl.classList.remove('attacking'), 600);
    }

    // Show ability name popup
    this.showAbilityPopup(ability);

    // Show message
    let msg = `${this.currentBoss.name} uses ${ability.name}!`;
    if (blocked > 0) {
      msg += ` Blocked ${blocked}.`;
    }
    if (damage > 0) {
      msg += ` Took ${damage} damage!`;
    }
    this.showMessage(msg, damage > 0 ? 'damage' : 'blocked');

    // Show damage number on player
    if (damage > 0) {
      this.showDamageNumber(damage, 'player');
    }
  },

  /**
   * Show ability name popup over the boss
   */
  showAbilityPopup(ability) {
    const bossSection = document.querySelector('.card-battle-boss-section');
    if (!bossSection) return;

    const popup = document.createElement('div');
    popup.className = 'ability-popup';
    popup.innerHTML = `<span class="ability-icon">⚔️</span> ${ability.name}`;
    bossSection.appendChild(popup);

    setTimeout(() => popup.remove(), 1500);
  },

  showDamageNumber(amount, target) {
    const num = document.createElement('div');
    num.className = `damage-number ${target}`;
    num.textContent = `-${amount}`;

    const targetEl = target === 'boss'
      ? document.getElementById('cardBattleBoss')
      : document.querySelector('.player-hp-display');

    if (targetEl) {
      targetEl.appendChild(num);
      setTimeout(() => num.remove(), 1000);
    }
  },

  showMessage(text, type = 'info') {
    const container = document.getElementById('battleMessages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = `battle-message ${type}`;
    msg.textContent = text;
    container.appendChild(msg);

    setTimeout(() => {
      msg.classList.add('fade-out');
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  },

  // ============================================
  // VICTORY / DEFEAT SCREENS
  // ============================================

  showVictoryScreen() {
    if (!this.container) return;

    // Play victory effects
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.victoryFlash();
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playVictory) {
      SoundSystem.playVictory();
    }

    // Generate card rewards
    let cardChoices = [];
    if (typeof CardSystem !== 'undefined') {
      if (this.isMiniBoss && this.currentBoss.cardPool) {
        // Mini-boss: use the boss's specific card pool
        const pool = this.currentBoss.cardPool;
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        cardChoices = shuffled.slice(0, 3);
      } else {
        // Regular boss: use category-based generation
        cardChoices = CardSystem.generateCardReward(this.categoryId, !this.isMiniBoss);
      }
    }

    const title = this.isMiniBoss ? 'MINI-BOSS DEFEATED!' : 'BOSS VANQUISHED!';
    const perfectVictory = this.playerHP >= this.maxPlayerHP;
    const ratingStars = this.calculateVictoryRating();

    this.container.innerHTML = `
      <div class="card-battle-backdrop victory-backdrop"></div>
      <div class="victory-particles"></div>
      <div class="card-battle-result victory ${this.isMiniBoss ? 'mini-boss' : ''} ${perfectVictory ? 'perfect' : ''}">
        <div class="victory-crown">👑</div>
        <div class="result-icon victory-trophy">${this.isMiniBoss ? '⚔️' : '🏆'}</div>
        <h2 class="result-title">${title}</h2>
        <p class="defeated-boss">${this.currentBoss.name} ${this.currentBoss.emoji}</p>
        <p class="result-subtitle">${this.currentBoss.defeatQuote || 'You have proven your knowledge!'}</p>

        ${perfectVictory ? '<div class="perfect-banner">✨ PERFECT VICTORY ✨</div>' : ''}

        <div class="victory-rating">
          ${ratingStars.map((filled, i) =>
            `<span class="rating-star ${filled ? 'filled' : ''}">${filled ? '★' : '☆'}</span>`
          ).join('')}
        </div>

        <div class="result-stats">
          <div class="stat">
            <span class="stat-icon">⚔️</span>
            <span class="stat-value">${this.turn}</span>
            <span class="stat-label">Turns</span>
          </div>
          <div class="stat">
            <span class="stat-icon">💔</span>
            <span class="stat-value">${this.maxPlayerHP - this.playerHP}</span>
            <span class="stat-label">Damage Taken</span>
          </div>
          <div class="stat">
            <span class="stat-icon">❤️</span>
            <span class="stat-value">${this.playerHP}</span>
            <span class="stat-label">HP Remaining</span>
          </div>
        </div>

        ${cardChoices.length > 0 ? `
          <div class="card-reward-container">
            <h3 class="card-reward-title">🎁 Choose Your Reward 🎁</h3>
            <div class="card-reward-choices">
              ${cardChoices.map(cardId => {
                const card = CardSystem.getCard(cardId);
                if (!card) return '';
                const rarity = CardSystem.CARD_RARITIES[card.rarity];
                return `
                  <div class="battle-card card-${card.type} card-${card.rarity.toLowerCase()} reward-card"
                       data-card-id="${cardId}"
                       data-action="select-reward"
                       style="--rarity-color: ${rarity.color}">
                    <div class="card-cost">${card.cost}</div>
                    <div class="card-emoji">${card.emoji}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-type">${card.type}</div>
                    <div class="card-description">${card.description}</div>
                    <div class="card-rarity">${rarity.name}</div>
                  </div>
                `;
              }).join('')}
            </div>
            <button class="skip-reward-btn" data-action="skip-reward">Skip Reward</button>
          </div>
        ` : ''}

        <button class="result-btn victory-btn" data-action="close-battle" ${cardChoices.length > 0 ? 'style="display:none"' : ''}>
          Continue Your Journey
        </button>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();

    // Spawn victory particles
    this.spawnVictoryParticles();
  },

  /**
   * Calculate victory rating (1-5 stars)
   */
  calculateVictoryRating() {
    const hpPercent = (this.playerHP / this.maxPlayerHP) * 100;
    const turnBonus = Math.max(0, 10 - this.turn); // Faster = better

    let stars = 1; // Base star for winning
    if (hpPercent >= 25) stars++;
    if (hpPercent >= 50) stars++;
    if (hpPercent >= 75) stars++;
    if (hpPercent >= 100 || turnBonus >= 5) stars++;

    return Array(5).fill(false).map((_, i) => i < stars);
  },

  /**
   * Spawn celebratory particles
   */
  spawnVictoryParticles() {
    const container = this.container.querySelector('.victory-particles');
    if (!container) return;

    const colors = ['#ffd700', '#ffc107', '#ff9800', '#ffeb3b', '#fff'];
    const shapes = ['★', '✨', '🎉', '🏆', '⭐'];

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'victory-particle';
      particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
        font-size: ${12 + Math.random() * 20}px;
        color: ${colors[Math.floor(Math.random() * colors.length)]};
      `;
      container.appendChild(particle);
    }
  },

  showDefeatScreen() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="card-battle-backdrop"></div>
      <div class="card-battle-result defeat">
        <div class="result-icon">💀</div>
        <h2 class="result-title">DEFEATED</h2>
        <p class="result-subtitle">${this.currentBoss.tauntMessages?.[0] || 'You have been defeated...'}</p>

        <div class="result-stats">
          <div class="stat">
            <span class="stat-value">${this.turn}</span>
            <span class="stat-label">Turns Survived</span>
          </div>
          <div class="stat">
            <span class="stat-value">${this.maxBossHP - this.bossHP}</span>
            <span class="stat-label">Boss Damage</span>
          </div>
        </div>

        <button class="result-btn" data-action="close-battle">
          Return
        </button>
      </div>
    `;

    // Attach event listeners
    this.attachEventListeners();

    // Roguelike reset - lose unequipped items
    if (typeof persistence !== 'undefined' && typeof persistence.roguelikeReset === 'function') {
      const lost = persistence.roguelikeReset();
      if (lost && lost.length > 0) {
        console.log('[CardBattle] Lost items on defeat:', lost);
      }
    }
  },

  selectReward(cardId) {
    if (typeof CardSystem !== 'undefined') {
      CardSystem.addCardToDeck(cardId);

      const card = CardSystem.getCard(cardId);
      if (card) {
        this.showMessage(`Added ${card.name} to your deck!`, 'buff');
      }
    }

    // Show continue button
    const resultBtn = this.container.querySelector('.result-btn');
    if (resultBtn) {
      resultBtn.style.display = 'block';
    }

    // Hide reward choices
    const rewardContainer = this.container.querySelector('.card-reward-container');
    if (rewardContainer) {
      rewardContainer.style.display = 'none';
    }
  },

  skipReward() {
    // Show continue button
    const resultBtn = this.container.querySelector('.result-btn');
    if (resultBtn) {
      resultBtn.style.display = 'block';
    }

    // Hide reward choices
    const rewardContainer = this.container.querySelector('.card-reward-container');
    if (rewardContainer) {
      rewardContainer.style.display = 'none';
    }
  },

  closeBattle(victory = true) {
    if (this.container) {
      this.container.style.display = 'none';
      this.container.innerHTML = '';
    }

    this.active = false;

    // Mini-boss callback
    if (this.isMiniBoss && typeof this.onMiniBossComplete === 'function') {
      this.onMiniBossComplete(victory);
      this.onMiniBossComplete = null;
      this.isMiniBoss = false;
      this.bankId = null;
      return;
    }

    // Return to category select for regular bosses
    if (typeof quiz !== 'undefined' && quiz.showCategories) {
      quiz.showCategories();
    } else {
      // Fallback - go to landing
      const landing = document.getElementById('landing');
      const studyView = document.getElementById('studyView');
      if (landing) landing.classList.remove('hidden');
      if (studyView) studyView.classList.remove('active');
    }
  },

  /**
   * Check if a mini-boss encounter should trigger
   * Call this when completing a bank of questions
   */
  shouldTriggerMiniBoss(bankId, questionsAnswered, questionsInBank) {
    // Trigger mini-boss when completing 70%+ of a bank for the first time
    const completionRate = questionsAnswered / questionsInBank;
    if (completionRate < 0.7) return false;

    // Check if this bank's mini-boss has been defeated
    const key = `miniboss_${bankId}`;
    const defeated = localStorage.getItem(key);
    if (defeated) return false;

    return true;
  },

  /**
   * Mark a mini-boss as defeated
   */
  markMiniBossDefeated(bankId) {
    const key = `miniboss_${bankId}`;
    localStorage.setItem(key, Date.now().toString());
  }
};

// Export to window
if (typeof window !== 'undefined') {
  window.CardBattleUI = CardBattleUI;
}
