/**
 * Ms. Luminara Quiz - Combat Encounter System
 * Full RPG battle mechanics with D20 integration
 *
 * LIMIT BREAK FLOW:
 * 1. Monster spawns with HP based on question difficulty
 * 2. Scaffold questions = combat rounds (weaken the monster)
 *    - Correct = player attacks, deals damage
 *    - Wrong = monster counter-attacks player
 * 3. After all scaffolds → MAIN QUESTION unlocks
 * 4. Main question correct = LIMIT BREAK = instant kill + victory
 * 5. Main question wrong = monster's devastating counter-attack
 * 6. Player HP persists across encounters
 *
 * Equipment Integration:
 * - INT: Increases attack damage
 * - WIS: Increases crit chance
 * - CON: Increases max HP and damage reduction
 * - CHA: Increases dodge chance
 *
 * @module BattleScene
 * @version 4.0.0 - LIMIT BREAK EDITION
 */

const BattleScene = {
  // ============================================
  // MONSTER DEFINITIONS BY CATEGORY & LEVEL
  // ============================================

  monsters: {
    '000': {
      name: 'Cell Slime',
      sprite: 'cell-slime',
      color: '#4ade80',
      baseHP: 40,
      baseArmor: 2,
      baseDamage: 5,
      baseXP: 25,
      level: 1,
      weakness: 'intelligence',
      taunts: [
        "I'm just a blob of cytoplasm... you can't hurt me!",
        "My membrane is impervious to your attacks!",
        "Organelles... assemble!"
      ],
      hitReactions: ["Ow, my mitochondria!", "Not the nucleus!", "You disrupted my homeostasis!"],
      defeats: ["I'm... lysing...", "Tell my ribosomes... I loved them..."]
    },
    '100': {
      name: 'Mind Flayer',
      sprite: 'mind-flayer',
      color: '#a855f7',
      baseHP: 60,
      baseArmor: 4,
      baseDamage: 8,
      baseXP: 40,
      level: 3,
      weakness: 'wisdom',
      taunts: [
        "Your neurons are mine to control!",
        "I sense... confusion in your cerebrum!",
        "Let me feast upon your knowledge gaps!"
      ],
      hitReactions: ["My tentacles!", "You're disrupting my synapses!", "Impossible!"],
      defeats: ["My... brain... melting...", "The cortex... crumbles..."]
    },
    '200': {
      name: 'Synapse Serpent',
      sprite: 'synapse-serpent',
      color: '#3b82f6',
      baseHP: 50,
      baseArmor: 3,
      baseDamage: 7,
      baseXP: 35,
      level: 2,
      weakness: 'charisma',
      taunts: [
        "I ssslither through your nerve pathwaysss...",
        "Your reflexesss are too ssslow!",
        "Feel my neurotoxic bite!"
      ],
      hitReactions: ["Sss-stop that!", "My axons!", "You're blocking my channels!"],
      defeats: ["I'm... depolarizing...", "The signal... fading..."]
    },
    '400': {
      name: 'Tissue Titan',
      sprite: 'tissue-titan',
      color: '#f97316',
      baseHP: 80,
      baseArmor: 6,
      baseDamage: 10,
      baseXP: 50,
      level: 4,
      weakness: 'constitution',
      taunts: [
        "I am layers upon layers of defense!",
        "My collagen fibers will crush you!",
        "Epithelium, connective, muscle, nerve - all serve ME!"
      ],
      hitReactions: ["My basement membrane!", "You tore my fibers!", "Inflammation!"],
      defeats: ["I'm... necrosing...", "The matrix... dissolving..."]
    },
    '500': {
      name: 'Autonomic Specter',
      sprite: 'autonomic-specter',
      color: '#6366f1',
      baseHP: 45,
      baseArmor: 2,
      baseDamage: 9,
      baseXP: 35,
      level: 2,
      weakness: 'wisdom',
      taunts: [
        "I control what you cannot see...",
        "Fight or flight? Neither will save you!",
        "Your heart rate... is MINE to command!"
      ],
      hitReactions: ["My sympathetic side!", "Parasympathetic damage!", "You've upset my balance!"],
      defeats: ["My... ganglia... failing...", "Rest... and digest... forever..."]
    },
    '600': {
      name: 'Eye Tyrant',
      sprite: 'eye-tyrant',
      color: '#ec4899',
      baseHP: 55,
      baseArmor: 3,
      baseDamage: 8,
      baseXP: 40,
      level: 3,
      weakness: 'charisma',
      taunts: [
        "I SEE your every weakness!",
        "My rods and cones perceive all!",
        "You cannot hide from my gaze!"
      ],
      hitReactions: ["My cornea!", "You've scratched my lens!", "I'm seeing spots!"],
      defeats: ["The light... fading...", "My retina... detaching..."]
    },
    '700': {
      name: 'Hormone Horror',
      sprite: 'hormone-horror',
      color: '#14b8a6',
      baseHP: 50,
      baseArmor: 3,
      baseDamage: 7,
      baseXP: 35,
      level: 2,
      weakness: 'intelligence',
      taunts: [
        "I secrete your doom!",
        "My chemical messengers will overwhelm you!",
        "Feedback loops? I control them ALL!"
      ],
      hitReactions: ["My receptor sites!", "You've inhibited my release!", "Negative feedback!"],
      defeats: ["My glands... atrophying...", "The cascade... stopping..."]
    }
  },

  // ============================================
  // COMBAT STATE
  // ============================================

  STORAGE_KEY: 'ms_luminara_combat_state',

  // Monster state
  currentMonster: null,
  monsterHP: 0,
  monsterMaxHP: 0,
  monsterLevel: 1,
  monsterDefeated: false,
  monsterWeakened: false, // True when HP hit 0, floored at 1, waiting for limit break

  // Player state
  playerHP: 100,
  playerMaxHP: 100,
  playerLevel: 1,

  // Combat stats
  comboCount: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  monstersDefeated: 0,
  roundsWon: 0,
  roundsLost: 0,

  // Session state
  battleActive: false,
  currentCategory: null,
  encounterStartTime: null,

  // ============================================
  // PERSISTENCE
  // ============================================

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);

        // Always restore player HP (persists across encounters)
        this.playerHP = state.playerHP ?? 100;
        this.playerMaxHP = state.playerMaxHP ?? 100;
        this.playerLevel = state.playerLevel ?? 1;
        this.monstersDefeated = state.monstersDefeated ?? 0;
        this.totalDamageDealt = state.totalDamageDealt ?? 0;
        this.totalDamageTaken = state.totalDamageTaken ?? 0;

        // Restore monster state if battle was active
        console.log(`[Combat] loadState: battleActive=${state.battleActive}, currentCategory=${state.currentCategory}, monsterDefeated=${state.monsterDefeated}, monsterWeakened=${state.monsterWeakened}`);

        if (state.battleActive && state.currentCategory) {
          this.currentCategory = state.currentCategory;
          this.monsterHP = state.monsterHP;
          this.monsterMaxHP = state.monsterMaxHP;
          this.monsterLevel = state.monsterLevel;
          this.monsterDefeated = state.monsterDefeated;
          this.monsterWeakened = state.monsterWeakened ?? false;
          this.comboCount = state.comboCount;
          this.currentMonster = this.monsters[state.currentCategory] || this.monsters['000'];
          this.battleActive = true;
          console.log(`[Combat] Restored monster: ${this.currentMonster.name} ${this.monsterHP}/${this.monsterMaxHP} HP, weakened=${this.monsterWeakened}`);
          return true;
        } else {
          // No active battle - clear monster state
          console.log('[Combat] loadState: No active battle, clearing monster');
          this.currentMonster = null;
          this.currentCategory = null;
          this.monsterHP = 0;
          this.monsterMaxHP = 0;
          this.monsterDefeated = false;
          this.monsterWeakened = false;
          this.battleActive = false;
        }
      }
    } catch (e) {
      console.warn('[Combat] Failed to load state:', e);
    }
    return false;
  },

  saveState() {
    try {
      const state = {
        // Player state (always save)
        playerHP: this.playerHP,
        playerMaxHP: this.playerMaxHP,
        playerLevel: this.playerLevel,
        monstersDefeated: this.monstersDefeated,
        totalDamageDealt: this.totalDamageDealt,
        totalDamageTaken: this.totalDamageTaken,

        // Monster state
        battleActive: this.battleActive,
        currentCategory: this.currentCategory,
        monsterHP: this.monsterHP,
        monsterMaxHP: this.monsterMaxHP,
        monsterLevel: this.monsterLevel,
        monsterDefeated: this.monsterDefeated,
        monsterWeakened: this.monsterWeakened,
        comboCount: this.comboCount,

        timestamp: Date.now()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[Combat] Failed to save state:', e);
    }
  },

  clearMonsterState() {
    this.currentMonster = null;  // Clear monster so new one spawns
    this.currentCategory = null;
    this.monsterHP = 0;
    this.monsterMaxHP = 0;
    this.monsterLevel = 1;
    this.monsterDefeated = false;
    this.monsterWeakened = false;
    this.comboCount = 0;
    this.battleActive = false;
    this.saveState();
    console.log('[Combat] Monster state cleared for next encounter');
  },

  // ============================================
  // PLAYER STATS FROM EQUIPMENT
  // ============================================

  getPlayerStats() {
    // Base stats from D20 system
    let stats = {
      intelligence: 10,
      wisdom: 10,
      constitution: 10,
      charisma: 10
    };

    // Add D20 character stats
    if (typeof d20System !== 'undefined') {
      const d20Stats = d20System.data?.stats || {};
      stats.intelligence = d20Stats.intelligence || 10;
      stats.wisdom = d20Stats.wisdom || 10;
      stats.constitution = d20Stats.constitution || 10;
      stats.charisma = d20Stats.charisma || 10;
    }

    // Add equipment stats
    if (typeof lootSystem !== 'undefined') {
      const equipStats = lootSystem.calculateEquipmentStats();
      stats.intelligence += equipStats.intelligence || 0;
      stats.wisdom += equipStats.wisdom || 0;
      stats.constitution += equipStats.constitution || 0;
      stats.charisma += equipStats.charisma || 0;
      stats.xpBonus = equipStats.xpBonus || 0;
      stats.luckyChance = equipStats.luckyChance || 0;
    }

    return stats;
  },

  /**
   * Calculate player max HP based on CON
   * Base 100 + (CON - 10) * 5
   */
  calculateMaxHP() {
    const stats = this.getPlayerStats();
    const conBonus = Math.floor((stats.constitution - 10) / 2);
    return 100 + (conBonus * 10);
  },

  /**
   * Update player level based on equipment and D20 progression
   */
  updatePlayerLevel() {
    const stats = this.getPlayerStats();
    const avgStat = (stats.intelligence + stats.wisdom + stats.constitution + stats.charisma) / 4;
    this.playerLevel = Math.max(1, Math.floor((avgStat - 10) / 2) + 1);
    this.playerMaxHP = this.calculateMaxHP();

    // Don't exceed max HP
    if (this.playerHP > this.playerMaxHP) {
      this.playerHP = this.playerMaxHP;
    }
  },

  // ============================================
  // ENCOUNTER INITIALIZATION
  // ============================================

  /**
   * Start a new combat encounter for a question
   * @param {string} categoryPrefix - Question category (e.g., "100")
   * @param {number} questionDifficulty - 1-5 difficulty rating
   * @param {boolean} forceNew - Force a new encounter even if one exists
   */
  startEncounter(categoryPrefix, questionDifficulty = 2, forceNew = false) {
    const catKey = categoryPrefix.substring(0, 3);

    // Load player state first
    const hadActiveState = this.loadState();
    this.updatePlayerLevel();

    // If player is dead, they need to rest/heal first
    if (this.playerHP <= 0) {
      console.log('[Combat] Player is defeated! Must rest before continuing.');
      return false;
    }

    // If monster is weakened and waiting for limit break, ALWAYS keep it
    // (even if the main question has a different category than scaffolds)
    if (hadActiveState && this.battleActive && this.monsterWeakened &&
        !this.monsterDefeated && this.monsterHP > 0) {
      console.log(`[Combat] Monster weakened, waiting for limit break: ${this.currentMonster.name} ${this.monsterHP}/${this.monsterMaxHP} HP`);
      return true;
    }

    // If we have an active battle with this monster and it's not defeated, resume it
    if (hadActiveState && this.battleActive && this.currentCategory === catKey &&
        !this.monsterDefeated && this.monsterHP > 0 && !forceNew) {
      console.log(`[Combat] Resuming battle: ${this.currentMonster.name} ${this.monsterHP}/${this.monsterMaxHP} HP`);
      return true;
    }

    // Get monster template
    this.currentMonster = this.monsters[catKey] || this.monsters['000'];
    this.currentCategory = catKey;

    // Scale monster level based on difficulty
    this.monsterLevel = Math.max(1, this.currentMonster.level + questionDifficulty - 2);

    // MONSTER-BASED HP - uses the monster's baseHP scaled by level
    // This determines how many scaffolds it takes to weaken (adaptive!)
    const levelScale = 1 + (this.monsterLevel - 1) * 0.2;
    const playerScale = 1 + (this.playerLevel - 1) * 0.1;

    this.monsterMaxHP = Math.round(this.currentMonster.baseHP * levelScale / playerScale);
    this.monsterHP = this.monsterMaxHP;
    this.monsterDefeated = false;
    this.monsterWeakened = false; // NEW: tracks when HP hit 0 and floored to 1

    this.comboCount = 0;
    this.battleActive = true;
    this.encounterStartTime = Date.now();

    this.saveState();
    console.log(`[Combat] Encounter started: Lv.${this.monsterLevel} ${this.currentMonster.name} (${this.monsterHP} HP) vs Player Lv.${this.playerLevel} (${this.playerHP}/${this.playerMaxHP} HP)`);

    return true;
  },

  /**
   * Check if monster is defeated
   */
  isMonsterDefeated() {
    this.loadState();
    return this.monsterDefeated || this.monsterHP <= 0;
  },

  /**
   * Check if main question is unlocked (scaffolds complete)
   * Main Q is always unlocked after scaffolds - it's the LIMIT BREAK
   */
  isMainQuestionReady() {
    return this.battleActive && !this.monsterDefeated;
  },

  // ============================================
  // COMBAT ACTIONS
  // ============================================

  /**
   * Player attacks monster (correct scaffold answer)
   * When HP would hit 0, floor at 1 and mark as weakened → triggers main question
   * @returns {Object} Attack result with triggerMainQuestion flag
   */
  playerAttack() {
    if (!this.battleActive || this.monsterDefeated) return { damage: 0, triggerMainQuestion: false };

    const stats = this.getPlayerStats();

    // Base damage from INT
    const intBonus = Math.floor((stats.intelligence - 10) / 2);
    let baseDamage = 10 + intBonus * 2;

    // Combo multiplier (consecutive correct answers)
    this.comboCount++;
    const comboMult = Math.min(1 + (this.comboCount - 1) * 0.2, 2.5);

    // D20 attack roll
    let attackRoll = { roll: 10, isCriticalSuccess: false, isCriticalFailure: false };
    if (typeof d20System !== 'undefined') {
      attackRoll = d20System.rollD20();
    }

    // Crit chance from WIS
    const wisBonus = Math.floor((stats.wisdom - 10) / 2);
    const critThreshold = 20 - Math.floor(wisBonus / 2); // Lower threshold = easier crits
    const isCrit = attackRoll.roll >= critThreshold || attackRoll.isCriticalSuccess;

    // Fumble on nat 1
    const isFumble = attackRoll.isCriticalFailure;

    // Calculate damage
    let damage = Math.round(baseDamage * comboMult);
    if (isCrit) damage = Math.round(damage * 2);
    if (isFumble) damage = Math.round(damage * 0.5);

    // Apply damage
    damage = Math.max(1, damage);
    const newHP = this.monsterHP - damage;
    this.totalDamageDealt += damage;
    this.roundsWon++;

    // Check if this blow would kill - if so, floor at 1 and trigger main question
    let triggerMainQuestion = false;
    if (newHP <= 0 && !this.monsterWeakened) {
      this.monsterHP = 1;
      this.monsterWeakened = true;
      triggerMainQuestion = true;
      console.log('[Combat] Monster weakened! Main question triggered.');

      // Show dramatic weakened state
      const taunt = document.getElementById('monsterTaunt');
      if (taunt) {
        taunt.textContent = "NO! I'm... finished... deliver the final blow!";
        taunt.classList.add('monster-weak');
      }
    } else if (this.monsterWeakened) {
      // Already weakened, keep at 1 HP
      this.monsterHP = 1;
    } else {
      this.monsterHP = newHP;
    }

    // Visual effects
    this.showDamageNumber(damage, 'player', isCrit);
    this.shakeMonster();

    // SHOCKWAVE ARCADE JUICE: Sound effects for attacks
    if (typeof SoundSystem !== 'undefined') {
      if (isCrit) {
        SoundSystem.playCombo(10); // Big combo sound for crit
      }
      SoundSystem.playCorrect();
    }

    this.updateUI();
    this.saveState();

    console.log(`[Combat] Attack: ${damage} damage (roll: ${attackRoll.roll}, crit: ${isCrit}), HP: ${this.monsterHP}/${this.monsterMaxHP}, triggerMain: ${triggerMainQuestion}`);

    return {
      damage,
      roll: attackRoll.roll,
      isCrit,
      isFumble,
      comboCount: this.comboCount,
      monsterWeakened: this.monsterWeakened,
      triggerMainQuestion
    };
  },

  /**
   * Monster attacks player (wrong scaffold answer)
   * @returns {Object} Attack result
   */
  monsterAttack() {
    if (!this.battleActive || this.monsterDefeated) return { damage: 0 };

    const stats = this.getPlayerStats();

    // Reset combo on getting hit
    this.comboCount = 0;

    // Monster base damage scaled by level
    const levelScale = 1 + (this.monsterLevel - 1) * 0.15;
    let baseDamage = Math.round(this.currentMonster.baseDamage * levelScale);

    // D20 defense roll
    let defenseRoll = { roll: 10, isCriticalSuccess: false, isCriticalFailure: false };
    if (typeof d20System !== 'undefined') {
      defenseRoll = d20System.rollD20();
    }

    // Dodge chance from CHA
    const chaBonus = Math.floor((stats.charisma - 10) / 2);
    const dodgeChance = 5 + chaBonus * 2; // 5% base + 2% per CHA mod
    const dodged = Math.random() * 100 < dodgeChance;

    // Damage reduction from CON
    const conBonus = Math.floor((stats.constitution - 10) / 2);
    const damageReduction = Math.max(0, conBonus);

    // Critical hit on nat 20 defense roll = blocked
    const blocked = defenseRoll.isCriticalSuccess;

    // Calculate final damage
    let damage = baseDamage;
    if (blocked) {
      damage = 0;
    } else if (dodged) {
      damage = 0;
    } else {
      damage = Math.max(1, damage - damageReduction);
      // Critical fail = double damage
      if (defenseRoll.isCriticalFailure) {
        damage = damage * 2;
      }
    }

    // Apply damage to player
    this.playerHP = Math.max(0, this.playerHP - damage);
    this.totalDamageTaken += damage;
    this.roundsLost++;

    // Visual effects
    this.showDamageNumber(damage, 'monster', defenseRoll.isCriticalFailure);
    if (!blocked && !dodged) {
      this.flashScreen('incorrect');

      // SHOCKWAVE ARCADE JUICE: Global screen shake + sound on damage
      if (typeof ScreenEffects !== 'undefined') {
        ScreenEffects.shake(defenseRoll.isCriticalFailure ? 'big' : 'normal');
      }
      if (typeof SoundSystem !== 'undefined') {
        SoundSystem.playDamage();
      }
    }
    this.updateUI();

    // SHOCKWAVE ARCADE JUICE: Near-death tension effect
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.checkCriticalHP(this.playerHP, this.playerMaxHP);
    }

    // Check player death
    if (this.playerHP <= 0) {
      this.onPlayerDefeated();
    }

    this.saveState();

    return {
      damage,
      roll: defenseRoll.roll,
      blocked,
      dodged,
      playerHP: this.playerHP,
      playerDefeated: this.playerHP <= 0
    };
  },

  /**
   * LIMIT BREAK - Main question answered correctly
   * Instant kill regardless of remaining HP + victory fanfare
   * @returns {Object} Attack result with bonus rewards
   */
  limitBreak() {
    console.log(`[Combat] LIMIT BREAK called!`);
    console.log(`[Combat]   battleActive=${this.battleActive}`);
    console.log(`[Combat]   monsterDefeated=${this.monsterDefeated}`);
    console.log(`[Combat]   monsterHP=${this.monsterHP}/${this.monsterMaxHP}`);
    console.log(`[Combat]   currentMonster=${this.currentMonster?.name || 'NONE'}`);

    if (!this.battleActive || this.monsterDefeated) {
      console.log('[Combat] LIMIT BREAK aborted - battle not active or monster already defeated');
      return { damage: 0, success: false };
    }

    console.log('[Combat] LIMIT BREAK proceeding...');

    const stats = this.getPlayerStats();
    const remainingHP = this.monsterHP;

    // Calculate overkill bonus based on how much HP was left
    const overkillPercent = (remainingHP / this.monsterMaxHP) * 100;
    let overkillBonus = 1.0;
    if (overkillPercent > 75) overkillBonus = 2.0;      // Monster nearly full = huge bonus
    else if (overkillPercent > 50) overkillBonus = 1.5;
    else if (overkillPercent > 25) overkillBonus = 1.25;

    // LIMIT BREAK damage = remaining HP + overkill
    const damage = remainingHP + Math.round(remainingHP * 0.5);

    // Apply the killing blow
    this.monsterHP = 0;
    this.totalDamageDealt += damage;

    // Visual effects - LIMIT BREAK style
    this.showLimitBreakEffect();
    this.showDamageNumber(damage, 'player', true); // Always crit

    // Trigger defeat
    this.onMonsterDefeated(overkillBonus);

    this.saveState();

    console.log(`[Combat] LIMIT BREAK! ${damage} damage! Overkill bonus: ${overkillBonus}x`);

    return {
      damage,
      overkillBonus,
      success: true,
      monsterDefeated: true
    };
  },

  /**
   * Monster's devastating counter-attack (main question wrong)
   * Deals massive damage to player
   * @returns {Object} Attack result
   */
  devastatingCounter() {
    if (!this.battleActive || this.monsterDefeated) {
      return { damage: 0 };
    }

    // Reset combo
    this.comboCount = 0;

    // Devastating counter = 2x normal damage
    const levelScale = 1 + (this.monsterLevel - 1) * 0.15;
    const baseDamage = Math.round(this.currentMonster.baseDamage * levelScale * 2);

    // Reduced by CON but still hurts
    const stats = this.getPlayerStats();
    const conBonus = Math.floor((stats.constitution - 10) / 2);
    const damageReduction = Math.max(0, Math.floor(conBonus / 2)); // Half normal reduction

    const damage = Math.max(5, baseDamage - damageReduction);

    // Apply damage
    this.playerHP = Math.max(0, this.playerHP - damage);
    this.totalDamageTaken += damage;
    this.roundsLost++;

    // Visual effects - screen shake, flash red
    this.showDamageNumber(damage, 'monster', true);
    this.flashScreen('devastating');
    this.shakeScreen();

    // Update taunt to show monster's triumph
    const taunt = document.getElementById('monsterTaunt');
    if (taunt) {
      taunt.textContent = "Your limit break failed! Feel my wrath!";
      taunt.classList.add('monster-triumph');
    }

    // Check player death
    if (this.playerHP <= 0) {
      this.onPlayerDefeated();
    }

    this.saveState();
    this.updateUI();

    console.log(`[Combat] DEVASTATING COUNTER! ${damage} damage to player!`);

    return {
      damage,
      playerHP: this.playerHP,
      playerDefeated: this.playerHP <= 0
    };
  },

  /**
   * Handle monster defeat
   * @param {number} overkillBonus - Bonus multiplier from limit break
   */
  onMonsterDefeated(overkillBonus = 1.0) {
    console.log(`[Combat] onMonsterDefeated called! overkillBonus=${overkillBonus}`);
    this.monsterDefeated = true;
    this.monstersDefeated++;
    this.battleActive = false;
    console.log(`[Combat] Monster marked as defeated, battleActive set to false`);

    const monster = document.getElementById('battleMonster');
    const tauntEl = document.getElementById('monsterTaunt');

    if (monster) monster.classList.add('defeated');
    if (tauntEl) {
      tauntEl.textContent = this.getDefeatMessage();
      tauntEl.classList.add('defeated');
    }

    // Award XP with overkill bonus
    const baseXP = Math.round(this.currentMonster.baseXP * (1 + (this.monsterLevel - 1) * 0.3));
    const xpReward = Math.round(baseXP * overkillBonus);

    if (typeof gamification !== 'undefined' && typeof gamification.addXP === 'function') {
      gamification.addXP(xpReward, 'monster_defeat');
    }

    // Award insight points (bonus for overkill)
    const insightPoints = overkillBonus >= 1.5 ? 2 : 1;
    if (typeof d20System !== 'undefined' && typeof d20System.awardInsightPoints === 'function') {
      d20System.awardInsightPoints(insightPoints);
    }

    console.log(`[Combat] ${this.currentMonster.name} defeated! +${xpReward} XP (${overkillBonus}x overkill)`);

    // SHOCKWAVE ARCADE JUICE: Boss death sound + clear critical HP
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.playBossDeath();
    }
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.setCriticalHP(false); // Clear near-death effect
    }

    // Show victory message
    this.showVictoryMessage(overkillBonus);

    this.saveState();
  },

  /**
   * Handle player defeat
   * Auto-heal to 50% and continue (roguelike mercy)
   */
  onPlayerDefeated() {
    console.log('[Combat] Player defeated! Auto-reviving...');

    // Flash game over
    this.flashScreen('gameover');

    // SHOCKWAVE ARCADE JUICE: Game over sound + clear critical HP
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.playGameOver();
    }
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.setCriticalHP(false);
    }

    // Auto-revive with 50% HP (roguelike mercy mechanic)
    setTimeout(() => {
      this.playerHP = Math.round(this.playerMaxHP * 0.5);
      this.saveState();
      this.updateUI();
      console.log(`[Combat] Revived with ${this.playerHP}/${this.playerMaxHP} HP`);

      // Show revival message
      const taunt = document.getElementById('monsterTaunt');
      if (taunt) {
        taunt.textContent = "You barely survive... but the fight continues!";
      }
    }, 500);
  },

  /**
   * Rest to recover HP (between quiz sessions)
   */
  rest(amount = null) {
    const healAmount = amount || Math.round(this.playerMaxHP * 0.5);
    this.playerHP = Math.min(this.playerMaxHP, this.playerHP + healAmount);
    this.saveState();
    console.log(`[Combat] Rested. HP: ${this.playerHP}/${this.playerMaxHP}`);
    return healAmount;
  },

  /**
   * Full heal (new session or special item)
   */
  fullHeal() {
    this.updatePlayerLevel();
    this.playerHP = this.playerMaxHP;
    this.saveState();
    console.log(`[Combat] Full heal. HP: ${this.playerHP}/${this.playerMaxHP}`);
  },

  // ============================================
  // RENDERING
  // ============================================

  /**
   * Render the battle frame
   * @param {HTMLElement} container - Container element
   * @param {Object} questionData - Question data
   * @param {string} questionHTML - Pre-rendered question HTML
   * @param {boolean} isScaffold - True if this is a scaffold question, false for main Q
   */
  renderBattleFrame(container, questionData, questionHTML, isScaffold = true) {
    // Always load state first to ensure we have current HP values
    const hadState = this.loadState();

    console.log(`[Combat] renderBattleFrame: isScaffold=${isScaffold}, hadState=${hadState}`);
    console.log(`[Combat]   currentMonster=${this.currentMonster?.name}, monsterDefeated=${this.monsterDefeated}, monsterWeakened=${this.monsterWeakened}`);
    console.log(`[Combat]   battleActive=${this.battleActive}, monsterHP=${this.monsterHP}`);

    // Only start NEW encounter if:
    // 1. No monster exists at all, OR
    // 2. Monster was defeated (previous question set finished)
    const needsNewMonster = !this.currentMonster || this.monsterDefeated;

    if (needsNewMonster) {
      console.log('[Combat] Starting new encounter (no monster or defeated)');
      this.startEncounter(questionData.id || '000', 2);
    } else if (!this.battleActive && this.currentMonster && !this.monsterDefeated) {
      // Monster exists but battle not active - reactivate it
      this.battleActive = true;
      console.log('[Combat] Reactivated battle for existing monster');
    } else {
      console.log('[Combat] Keeping existing monster');
    }

    // Track phase for UI
    this.isScaffoldPhase = isScaffold;

    const monster = this.currentMonster;
    const monsterHPPercent = (this.monsterHP / this.monsterMaxHP) * 100;
    const playerHPPercent = (this.playerHP / this.playerMaxHP) * 100;

    const monsterHPClass = monsterHPPercent <= 25 ? 'critical' : monsterHPPercent <= 50 ? 'warning' : '';
    const playerHPClass = playerHPPercent <= 25 ? 'critical' : playerHPPercent <= 50 ? 'warning' : '';

    const showMainQuestion = this.monsterDefeated;

    container.innerHTML = `
      <div class="battle-scene ${this.monsterDefeated ? 'monster-defeated' : ''}">
        <!-- Player Stats Bar -->
        <div class="player-stats-bar">
          <div class="player-portrait">
            <span class="player-icon">🧙</span>
            <span class="player-level">Lv.${this.playerLevel}</span>
          </div>
          <div class="player-hp-container">
            <div class="player-hp-label">HP</div>
            <div class="player-hp-bar">
              <div class="player-hp-fill ${playerHPClass}" style="width: ${playerHPPercent}%"></div>
              <div class="player-hp-text">${Math.ceil(this.playerHP)}/${this.playerMaxHP}</div>
            </div>
          </div>
          <div class="combat-stats">
            <span class="combo-counter" id="comboCounter">
              ${this.comboCount > 1 ? `${this.comboCount}x COMBO!` : ''}
            </span>
            <span class="kill-count">${this.monstersDefeated} slain</span>
          </div>
        </div>

        <!-- Monster Zone -->
        <div class="battle-monster-zone">
          <div class="monster-hp-container">
            <div class="monster-info">
              <span class="monster-level">Lv.${this.monsterLevel}</span>
              <span class="monster-name">${monster.name}</span>
            </div>
            <div class="monster-hp-bar">
              <div class="monster-hp-fill ${monsterHPClass}" style="width: ${monsterHPPercent}%"></div>
              <div class="monster-hp-text">${Math.ceil(this.monsterHP)}/${this.monsterMaxHP}</div>
            </div>
          </div>

          <div class="monster-sprite-container">
            <div class="pixel-sprite monster-${monster.sprite} ${this.monsterDefeated ? 'defeated' : ''}" id="battleMonster"></div>
          </div>

          <div class="monster-taunt" id="monsterTaunt">
            ${this.monsterDefeated ? this.getDefeatMessage() : this.getRandomTaunt()}
          </div>
        </div>

        <!-- Battle Status -->
        <div class="battle-divider">
          <div class="battle-phase" id="battlePhase">
            ${this.monsterDefeated
              ? '<span class="phase-victory">🏆 VICTORY!</span>'
              : (this.isScaffoldPhase
                  ? '<span class="phase-combat">⚔️ Weaken the monster!</span>'
                  : '<span class="phase-limit-break">💥 LIMIT BREAK READY!</span>')}
          </div>
        </div>

        <!-- Action Menu -->
        <div class="battle-action-menu">
          <div class="action-header">
            <span class="action-label" id="actionLabel">
              ${this.monsterDefeated
                ? '🎉 Monster Vanquished!'
                : (this.isScaffoldPhase
                    ? '⚔️ Combat Round - Answer to Attack!'
                    : '💥 LIMIT BREAK - Answer to finish the monster!')}
            </span>
          </div>
          ${questionHTML}
        </div>

        <!-- Damage Numbers -->
        <div id="damageContainer"></div>
      </div>
    `;

    return container;
  },

  updateUI() {
    // Update monster HP
    const monsterFill = document.querySelector('.monster-hp-fill');
    const monsterText = document.querySelector('.monster-hp-text');
    if (monsterFill && monsterText) {
      const percent = (this.monsterHP / this.monsterMaxHP) * 100;
      monsterFill.style.width = `${percent}%`;
      monsterFill.classList.remove('warning', 'critical');
      if (percent <= 25) monsterFill.classList.add('critical');
      else if (percent <= 50) monsterFill.classList.add('warning');
      monsterText.textContent = `${Math.ceil(this.monsterHP)}/${this.monsterMaxHP}`;
    }

    // Update player HP
    const playerFill = document.querySelector('.player-hp-fill');
    const playerText = document.querySelector('.player-hp-text');
    if (playerFill && playerText) {
      const percent = (this.playerHP / this.playerMaxHP) * 100;
      playerFill.style.width = `${percent}%`;
      playerFill.classList.remove('warning', 'critical');
      if (percent <= 25) playerFill.classList.add('critical');
      else if (percent <= 50) playerFill.classList.add('warning');
      playerText.textContent = `${Math.ceil(this.playerHP)}/${this.playerMaxHP}`;
    }

    // Update combo
    const combo = document.getElementById('comboCounter');
    if (combo) {
      combo.textContent = this.comboCount > 1 ? `${this.comboCount}x COMBO!` : '';
      combo.classList.toggle('active', this.comboCount > 1);
    }
  },

  showDamageNumber(amount, source, isCrit = false) {
    const container = document.getElementById('damageContainer');
    if (!container) return;

    const num = document.createElement('div');
    num.className = `damage-number ${source === 'player' ? 'player-damage' : 'monster-damage'}`;
    if (isCrit) num.classList.add('critical');
    if (amount === 0) num.classList.add('blocked');

    num.textContent = amount === 0 ? 'MISS!' : (source === 'player' ? `-${amount}` : `-${amount}`);

    if (source === 'player') {
      num.style.left = `${45 + Math.random() * 10}%`;
      num.style.top = '20%';
    } else {
      num.style.left = `${45 + Math.random() * 10}%`;
      num.style.bottom = '40%';
    }

    container.appendChild(num);
    setTimeout(() => num.remove(), 1200);
  },

  showVictoryMessage(overkillBonus = 1.0) {
    const taunt = document.getElementById('monsterTaunt');
    if (taunt) {
      const bonusText = overkillBonus >= 2.0 ? '💥 OVERKILL!' :
                        overkillBonus >= 1.5 ? '⚡ DEVASTATING!' :
                        overkillBonus >= 1.25 ? '✨ EXCELLENT!' : '🎯 VICTORY!';
      taunt.innerHTML = `<span class="victory-text">${bonusText} ${this.currentMonster.name} has been vanquished!</span>`;
    }

    const phase = document.querySelector('.battle-phase');
    if (phase) {
      phase.innerHTML = '<span class="phase-victory">🏆 LIMIT BREAK SUCCESS!</span>';
    }

    // Add victory class to scene
    const scene = document.querySelector('.battle-scene');
    if (scene) {
      scene.classList.add('victory');
    }
  },

  /**
   * Show LIMIT BREAK visual effect
   */
  showLimitBreakEffect() {
    const scene = document.querySelector('.battle-scene');
    if (!scene) return;

    // Flash white then to normal
    scene.classList.add('limit-break-flash');

    // Create limit break text overlay
    const overlay = document.createElement('div');
    overlay.className = 'limit-break-overlay';
    overlay.innerHTML = '<span class="limit-break-text">LIMIT BREAK!</span>';
    scene.appendChild(overlay);

    // Screen shake
    this.shakeScreen();

    // Remove after animation
    setTimeout(() => {
      overlay.remove();
      scene.classList.remove('limit-break-flash');
    }, 1500);
  },

  shakeScreen() {
    const scene = document.querySelector('.battle-scene');
    if (scene) {
      scene.classList.add('screen-shake');
      setTimeout(() => scene.classList.remove('screen-shake'), 500);
    }
  },

  shakeMonster() {
    const monster = document.getElementById('battleMonster');
    if (monster) {
      monster.classList.add('shake');
      setTimeout(() => monster.classList.remove('shake'), 300);
    }
  },

  flashScreen(type) {
    const scene = document.querySelector('.battle-scene');
    if (scene) {
      scene.classList.add(`flash-${type}`);
      setTimeout(() => scene.classList.remove(`flash-${type}`), 200);
    }
  },

  getRandomTaunt() {
    const taunts = this.currentMonster?.taunts || ["..."];
    return taunts[Math.floor(Math.random() * taunts.length)];
  },

  getRandomHitReaction() {
    const reactions = this.currentMonster?.hitReactions || ["Ugh!"];
    return reactions[Math.floor(Math.random() * reactions.length)];
  },

  getDefeatMessage() {
    const defeats = this.currentMonster?.defeats || ["Defeated..."];
    return defeats[Math.floor(Math.random() * defeats.length)];
  },

  // ============================================
  // LEGACY COMPATIBILITY
  // ============================================

  // For backwards compatibility with existing calls
  init(categoryPrefix, forceNew = false) {
    return this.startEncounter(categoryPrefix, 2, forceNew);
  },

  animatePlayerAttack(baseDamage = 15, isFirstTry = false, isScaffold = false) {
    return this.playerAttack();
  },

  animateMonsterAttack(baseDamage = null) {
    return this.monsterAttack();
  },

  isEnabled() {
    return this.battleActive;
  },

  getStats() {
    return {
      monster: this.currentMonster?.name,
      monsterHP: this.monsterHP,
      monsterMaxHP: this.monsterMaxHP,
      monsterLevel: this.monsterLevel,
      monsterDefeated: this.monsterDefeated,
      playerHP: this.playerHP,
      playerMaxHP: this.playerMaxHP,
      playerLevel: this.playerLevel,
      comboCount: this.comboCount,
      monstersDefeated: this.monstersDefeated,
      totalDamageDealt: this.totalDamageDealt,
      totalDamageTaken: this.totalDamageTaken,
      active: this.battleActive
    };
  },

  endBattle() {
    this.battleActive = false;
    this.clearMonsterState();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleScene;
}

if (typeof window !== 'undefined') {
  window.BattleScene = BattleScene;
}
