/**
 * Ms. Luminara Quiz - Boss Battle System
 * "The Luminara Gauntlet"
 *
 * Roguelike boss encounters with D20 combat mechanics
 */

// ═══════════════════════════════════════════════════════════════
// BOSS DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const BOSSES = {
  THE_FORGETFUL_ONE: {
    id: 'forgetful_one',
    name: 'The Forgetful One',
    subtitle: 'Destroyer of Short-Term Memory',
    emoji: '🧠💨',
    maxHP: 120,
    armor: 8,
    baseDamage: 12,
    weakTo: 'wisdom',
    resistsTo: 'charisma',
    phase2Threshold: 0.5,
    abilities: [
      { name: 'Memory Wipe', damage: 10, effect: 'blur_options', description: 'Options become harder to read' },
      { name: 'Confusion Cloud', damage: 8, effect: 'shuffle_options', description: 'Shuffles the answer options' },
      { name: 'Recall Block', damage: 15, effect: 'none', description: 'A direct assault on your neurons' }
    ],
    phase2Abilities: [
      { name: 'Mass Amnesia', damage: 20, effect: 'reset_streak', description: 'Your streak fades from memory...' }
    ],
    tauntMessages: [
      "What was the question again?",
      "You'll forget me soon enough...",
      "Your neurons are... slipping...",
      "Memory is such a fragile thing..."
    ],
    defeatQuote: "I... I remember now... it was all so clear...",
    lootTable: ['RING_OF_RECALL', 'TOME_OF_MEMORY'],
    unlocked: true
  },

  THE_PROCRASTINATOR: {
    id: 'procrastinator',
    name: 'The Procrastinator',
    subtitle: 'Lord of Tomorrow',
    emoji: '⏰😴',
    maxHP: 100,
    armor: 6,
    baseDamage: 10,
    weakTo: 'constitution',
    resistsTo: 'wisdom',
    phase2Threshold: 0.4,
    abilities: [
      { name: 'Time Drain', damage: 8, effect: 'reduce_timer', description: 'Steals your precious seconds' },
      { name: 'Delay Tactics', damage: 5, effect: 'skip_turn', description: '"We can do this later..."' },
      { name: 'Motivation Sap', damage: 12, effect: 'reduce_xp', description: 'Why even try?' }
    ],
    phase2Abilities: [
      { name: 'Eternal Tomorrow', damage: 18, effect: 'double_next_damage', description: 'The future is now... painful' }
    ],
    tauntMessages: [
      "We can finish this later...",
      "Five more minutes...",
      "Is this really due today?",
      "*yawns dramatically*"
    ],
    defeatQuote: "Fine... I'll do it... tomorrow... no wait—",
    lootTable: ['BOOTS_OF_HASTE', 'CLOCK_PENDANT'],
    unlocked: true
  },

  THE_ANXIETY_SPIRAL: {
    id: 'anxiety_spiral',
    name: 'The Anxiety Spiral',
    subtitle: 'Whispers of Doubt',
    emoji: '🌀😰',
    maxHP: 90,
    armor: 5,
    baseDamage: 15,
    weakTo: 'charisma',
    resistsTo: 'intelligence',
    phase2Threshold: 0.6,
    abilities: [
      { name: 'Overthink', damage: 10, effect: 'add_fake_option', description: 'Adds a convincing wrong answer' },
      { name: 'Self-Doubt', damage: 12, effect: 'hide_confidence', description: 'Are you SURE that\'s right?' },
      { name: 'Catastrophize', damage: 18, effect: 'none', description: 'Everything is falling apart!' }
    ],
    phase2Abilities: [
      { name: 'Spiral of Doom', damage: 25, effect: 'damage_over_time', description: 'The thoughts won\'t stop...' }
    ],
    tauntMessages: [
      "But what if you're WRONG?",
      "Everyone is watching you fail...",
      "You're not good enough for this...",
      "Remember that embarrassing thing from 10 years ago?"
    ],
    defeatQuote: "Maybe... maybe it wasn't so bad after all...",
    lootTable: ['CALM_CRYSTAL', 'RING_OF_SERENITY'],
    unlocked: true
  },

  THE_DISTRACTION_DEMON: {
    id: 'distraction_demon',
    name: 'The Distraction Demon',
    subtitle: 'Keeper of Open Tabs',
    emoji: '📱👹',
    maxHP: 110,
    armor: 7,
    baseDamage: 11,
    weakTo: 'intelligence',
    resistsTo: 'constitution',
    phase2Threshold: 0.5,
    abilities: [
      { name: 'Social Media Ping', damage: 8, effect: 'notification_flash', description: '*ding* Someone liked your post!' },
      { name: 'YouTube Rabbit Hole', damage: 10, effect: 'show_video_thumbnail', description: 'Just one more video...' },
      { name: 'Wikipedia Wormhole', damage: 14, effect: 'none', description: 'How did you end up here?' }
    ],
    phase2Abilities: [
      { name: 'Total Tab Overload', damage: 22, effect: 'screen_chaos', description: '47 tabs and counting...' }
    ],
    tauntMessages: [
      "Ooh, what's trending?",
      "Did you check your phone?",
      "This can wait, right?",
      "Just a quick scroll..."
    ],
    defeatQuote: "Fine... *closes 47 tabs* ...focus achieved.",
    lootTable: ['FOCUS_HEADBAND', 'NOTIFICATION_BLOCKER'],
    unlocked: true
  },

  THE_IMPOSTER: {
    id: 'imposter',
    name: 'The Imposter',
    subtitle: 'You Don\'t Belong Here',
    emoji: '👻🎭',
    maxHP: 130,
    armor: 9,
    baseDamage: 14,
    weakTo: 'charisma',
    resistsTo: 'wisdom',
    phase2Threshold: 0.45,
    abilities: [
      { name: 'You\'re Faking It', damage: 12, effect: 'reduce_stats_display', description: 'Your achievements mean nothing' },
      { name: 'They\'ll Find Out', damage: 10, effect: 'paranoia_vision', description: 'Any moment now...' },
      { name: 'Lucky Guess', damage: 16, effect: 'no_xp_next', description: 'You didn\'t REALLY know that' }
    ],
    phase2Abilities: [
      { name: 'Complete Fraud', damage: 28, effect: 'invert_confidence', description: 'You were never qualified' }
    ],
    tauntMessages: [
      "You don't deserve to be here.",
      "Everyone else is smarter than you.",
      "You just got lucky so far...",
      "Real scholars don't struggle like this."
    ],
    defeatQuote: "Wait... you actually DO know things? Impossible!",
    lootTable: ['CROWN_OF_CONFIDENCE', 'AUTHENTIC_AMULET'],
    unlocked: false,
    unlockCondition: { type: 'defeat_bosses', count: 3 }
  },

  MS_LUMINARA_SHADOW: {
    id: 'shadow_luminara',
    name: "Ms. Luminara's Shadow",
    subtitle: 'The Teacher You Fear',
    emoji: '👤✨',
    maxHP: 200,
    armor: 12,
    baseDamage: 18,
    weakTo: null, // No weakness
    resistsTo: null,
    phase2Threshold: 0.5,
    phase3Threshold: 0.25,
    abilities: [
      { name: 'Pop Quiz', damage: 15, effect: 'harder_question', description: 'You weren\'t prepared for this' },
      { name: 'Disappointed Sigh', damage: 12, effect: 'guilt_damage', description: '"I expected more from you..."' },
      { name: 'Office Hours Summon', damage: 10, effect: 'extra_question', description: 'We need to talk about your performance' }
    ],
    phase2Abilities: [
      { name: 'Final Exam', damage: 25, effect: 'multi_question', description: 'Everything you\'ve learned will be tested' }
    ],
    phase3Abilities: [
      { name: 'True Teaching', damage: 0, effect: 'heal_player', description: '"You\'ve grown so much..."', isPositive: true }
    ],
    tauntMessages: [
      "Come closer... if you dare.",
      "Show me what you've learned.",
      "This is the real test.",
      "I've been waiting for this moment."
    ],
    defeatQuote: "You've surpassed even my expectations. I'm... proud of you.",
    lootTable: ['MS_LUMINARAS_FAVOR', 'TOME_OF_ENDLESS_KNOWLEDGE', 'CROWN_OF_THE_ARCHMAGE'],
    unlocked: false,
    unlockCondition: { type: 'defeat_all_bosses' },
    isSecret: true
  },

  // NEW: Special Senses Boss (612.8)
  THE_OVERWHELMER: {
    id: 'overwhelmer',
    name: 'The Overwhelmer',
    subtitle: 'Cacophony of the Senses',
    emoji: '👁️🔊',
    maxHP: 140,
    armor: 8,
    baseDamage: 13,
    weakTo: 'wisdom',
    resistsTo: 'intelligence',
    phase2Threshold: 0.45,
    abilities: [
      { name: 'Sensory Flood', damage: 12, effect: 'screen_flash', description: 'Too much input!' },
      { name: 'Signal Noise', damage: 10, effect: 'scramble_text', description: 'The words swim before your eyes' },
      { name: 'Receptor Overload', damage: 15, effect: 'none', description: 'Your neurons can\'t keep up!' }
    ],
    phase2Abilities: [
      { name: 'Synesthesia Storm', damage: 24, effect: 'color_chaos', description: 'You can taste the colors and hear the shapes!' }
    ],
    tauntMessages: [
      "Can you even process all this?",
      "Every sense! All at once!",
      "LOOK! LISTEN! FEEL! TASTE! SMELL!",
      "Your brain wasn't built for this..."
    ],
    defeatQuote: "Silence... blessed silence... I can finally rest.",
    lootTable: ['LENS_OF_CLARITY', 'EARPIECE_OF_FOCUS'],
    unlocked: true
  },

  // NEW: Endocrine Boss (612.4)
  THE_HORMONAL_HAVOC: {
    id: 'hormonal_havoc',
    name: 'The Hormonal Havoc',
    subtitle: 'Master of Chemical Chaos',
    emoji: '⚗️😵',
    maxHP: 150,
    armor: 9,
    baseDamage: 14,
    weakTo: 'constitution',
    resistsTo: 'charisma',
    phase2Threshold: 0.5,
    abilities: [
      { name: 'Mood Swing', damage: 11, effect: 'random_emotion', description: 'Your feelings betray you!' },
      { name: 'Adrenaline Spike', damage: 8, effect: 'speed_up_timer', description: 'Everything speeds up!' },
      { name: 'Cortisol Crash', damage: 16, effect: 'fatigue_vision', description: 'The stress is overwhelming...' }
    ],
    phase2Abilities: [
      { name: 'Endocrine Cascade', damage: 26, effect: 'all_effects', description: 'Every hormone at once!' }
    ],
    tauntMessages: [
      "Your chemicals are MINE to control!",
      "Feeling a bit... off?",
      "Homeostasis? Never heard of it.",
      "Let me adjust your levels..."
    ],
    defeatQuote: "Balance... restored... the axis... stabilizes...",
    lootTable: ['GLAND_OF_BALANCE', 'RECEPTOR_RING'],
    unlocked: true
  }
};

// ═══════════════════════════════════════════════════════════════
// MINI-BOSSES (Bank gatekeepers - appear between question banks)
// These are smaller encounters that drop card rewards
// ═══════════════════════════════════════════════════════════════

const MINI_BOSSES = {
  // Brain-themed mini-bosses
  WANDERING_THOUGHT: {
    id: 'wandering_thought',
    name: 'Wandering Thought',
    emoji: '💭',
    maxHP: 40,
    baseDamage: 6,
    abilities: [
      { name: 'Tangent', damage: 6, description: 'Your focus drifts...' },
      { name: 'Mind Wander', damage: 4, description: 'Where were we?' }
    ],
    tauntMessages: ["Oh, that reminds me of...", "Speaking of which..."],
    defeatQuote: "Wait, what was I saying?",
    cardPool: ['quick_recall', 'flash_cards', 'study']
  },

  BRAIN_FOG: {
    id: 'brain_fog',
    name: 'Brain Fog',
    emoji: '🌫️',
    maxHP: 45,
    baseDamage: 7,
    abilities: [
      { name: 'Obscure', damage: 7, description: 'Everything becomes hazy' },
      { name: 'Confusion', damage: 5, description: 'Was it A or B?' }
    ],
    tauntMessages: ["Can't quite remember...", "It's on the tip of my tongue..."],
    defeatQuote: "The clouds lift... clarity returns.",
    cardPool: ['review_notes', 'deep_breath', 'preparation']
  },

  INFORMATION_OVERLOAD: {
    id: 'information_overload',
    name: 'Information Overload',
    emoji: '📚💥',
    maxHP: 50,
    baseDamage: 8,
    abilities: [
      { name: 'Data Dump', damage: 8, description: 'Too much to process!' },
      { name: 'TMI', damage: 6, description: 'More facts incoming!' }
    ],
    tauntMessages: ["Here's 500 more facts!", "Don't forget THIS too!"],
    defeatQuote: "Quality over quantity... I understand now.",
    cardPool: ['confidence', 'office_hours', 'cram_session']
  },

  // Nerve-themed mini-bosses
  STATIC_DISCHARGE: {
    id: 'static_discharge',
    name: 'Static Discharge',
    emoji: '⚡',
    maxHP: 35,
    baseDamage: 9,
    abilities: [
      { name: 'Shock', damage: 9, description: 'Zap!' },
      { name: 'Residual Charge', damage: 5, description: 'Lingers...' }
    ],
    tauntMessages: ["Feeling twitchy?", "*crackle*"],
    defeatQuote: "*fizzle* ...grounded.",
    cardPool: ['rapid_fire', 'pop_quiz', 'eureka']
  },

  NERVE_CLUSTER: {
    id: 'nerve_cluster',
    name: 'Nerve Cluster',
    emoji: '🔀',
    maxHP: 55,
    baseDamage: 7,
    abilities: [
      { name: 'Mixed Signals', damage: 7, description: 'Wrong pathway!' },
      { name: 'Crosstalk', damage: 8, description: 'Signals interfere' }
    ],
    tauntMessages: ["Which nerve was that?", "Sensory or motor?"],
    defeatQuote: "The pathways are clear.",
    cardPool: ['tutor', 'mnemonic_device', 'combo_breaker']
  },

  // Anatomy-themed mini-bosses
  TISSUE_TERROR: {
    id: 'tissue_terror',
    name: 'Tissue Terror',
    emoji: '🔬',
    maxHP: 42,
    baseDamage: 6,
    abilities: [
      { name: 'Cell Division', damage: 6, description: 'It multiplies!' },
      { name: 'Matrix Attack', damage: 7, description: 'Extracellular assault!' }
    ],
    tauntMessages: ["Epithelial or connective?", "What layer is this?"],
    defeatQuote: "Classified and catalogued.",
    cardPool: ['study_group', 'mental_fortress', 'second_wind']
  },

  SKELETON_KEY: {
    id: 'skeleton_key',
    name: 'Skeleton Key',
    emoji: '🦴🔑',
    maxHP: 48,
    baseDamage: 7,
    abilities: [
      { name: 'Bone Lock', damage: 7, description: 'Joints seize up!' },
      { name: 'Marrow Drain', damage: 8, description: 'Deep exhaustion' }
    ],
    tauntMessages: ["206 bones and you know none!", "Which bone articulates here?"],
    defeatQuote: "The skeleton unlocks its secrets.",
    cardPool: ['knowledge_bomb', 'thesis_defense', 'focused_study']
  },

  // Senses-themed mini-bosses
  PHANTOM_SENSATION: {
    id: 'phantom_sensation',
    name: 'Phantom Sensation',
    emoji: '👻✋',
    maxHP: 38,
    baseDamage: 8,
    abilities: [
      { name: 'False Signal', damage: 8, description: 'Is it real?' },
      { name: 'Referred Pain', damage: 6, description: 'Wrong location!' }
    ],
    tauntMessages: ["Trust your senses... or don't.", "What did you really feel?"],
    defeatQuote: "The illusion fades.",
    cardPool: ['impervious', 'enlightenment', 'growth_mindset']
  },

  SENSORY_ECHO: {
    id: 'sensory_echo',
    name: 'Sensory Echo',
    emoji: '📢',
    maxHP: 44,
    baseDamage: 7,
    abilities: [
      { name: 'Afterimage', damage: 7, description: 'Persist...' },
      { name: 'Reverb', damage: 6, description: 'Hear that again?' }
    ],
    tauntMessages: ["Echo... echo... echo...", "Still seeing it?"],
    defeatQuote: "Silence at last.",
    cardPool: ['retention', 'limit_break', 'chain_reaction']
  },

  // Endocrine-themed mini-bosses
  HORMONE_SPIKE: {
    id: 'hormone_spike',
    name: 'Hormone Spike',
    emoji: '📈',
    maxHP: 46,
    baseDamage: 8,
    abilities: [
      { name: 'Surge', damage: 10, description: 'Levels spike!' },
      { name: 'Feedback Loop', damage: 5, description: 'Self-amplifying!' }
    ],
    tauntMessages: ["Your TSH is off!", "Cortisol rising!"],
    defeatQuote: "Homeostasis restored.",
    cardPool: ['adrenaline', 'perfect_score', 'mastery']
  },

  RECEPTOR_BLOCK: {
    id: 'receptor_block',
    name: 'Receptor Block',
    emoji: '🚫',
    maxHP: 52,
    baseDamage: 6,
    abilities: [
      { name: 'Antagonize', damage: 6, description: 'Signals blocked!' },
      { name: 'Desensitize', damage: 7, description: 'No response!' }
    ],
    tauntMessages: ["Your receptors won't listen!", "Signal? What signal?"],
    defeatQuote: "The pathways open.",
    cardPool: ['perfectionist', 'omniscience', 'growth_mindset']
  }
};

// Bank to mini-boss mapping (bankId -> mini-boss that guards it)
const BANK_MINI_BOSSES = {
  // Brain banks
  '612.82.1': 'WANDERING_THOUGHT',
  '612.82.2': 'BRAIN_FOG',
  '612.82.3': 'INFORMATION_OVERLOAD',
  // Nerves banks
  '612.81.1': 'STATIC_DISCHARGE',
  '612.81.2': 'NERVE_CLUSTER',
  // Tissues banks
  '611.018.1': 'TISSUE_TERROR',
  '611.018.2': 'SKELETON_KEY',
  // Senses banks
  '612.8.1': 'PHANTOM_SENSATION',
  '612.8.2': 'SENSORY_ECHO',
  // Endocrine banks
  '612.4.1': 'HORMONE_SPIKE',
  '612.4.2': 'RECEPTOR_BLOCK'
};

/**
 * Get mini-boss for a bank
 */
function getBankMiniBoss(bankId) {
  const bossKey = BANK_MINI_BOSSES[bankId];
  return bossKey ? MINI_BOSSES[bossKey] : getRandomMiniBoss();
}

/**
 * Get a random mini-boss (for banks without specific assignment)
 */
function getRandomMiniBoss() {
  const bosses = Object.values(MINI_BOSSES);
  return bosses[Math.floor(Math.random() * bosses.length)];
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY-BOSS MAPPING
// Maps each Dewey category to its guardian boss
// ═══════════════════════════════════════════════════════════════

const CATEGORY_BOSSES = {
  "000": "THE_FORGETFUL_ONE",      // 611 Foundations - Memory
  "400": "THE_PROCRASTINATOR",     // 611.018 Tissues - Patience
  "100": "THE_DISTRACTION_DEMON",  // 612.82 Brain - Focus
  "200": "THE_ANXIETY_SPIRAL",     // 612.81 Nerves - Calm
  "500": "THE_IMPOSTER",           // 612.89 ANS - Confidence
  "600": "THE_OVERWHELMER",        // 612.8 Senses - Clarity (NEW)
  "700": "THE_HORMONAL_HAVOC",     // 612.4 Endocrine - Balance (NEW)
  "800": "MS_LUMINARA_SHADOW"      // 612.8L Lab Prep - Final Boss
};

/**
 * Get the boss for a category
 */
function getCategoryBoss(categoryId) {
  const bossKey = CATEGORY_BOSSES[categoryId];
  return bossKey ? BOSSES[bossKey] : null;
}

/**
 * Get boss name for a category (for UI display)
 */
function getCategoryBossName(categoryId) {
  const boss = getCategoryBoss(categoryId);
  return boss ? boss.name : null;
}

// ═══════════════════════════════════════════════════════════════
// BOSS ENCOUNTER CLASS
// ═══════════════════════════════════════════════════════════════

class BossEncounter {
  constructor(bossId) {
    this.boss = BOSSES[bossId];
    if (!this.boss) throw new Error(`Unknown boss: ${bossId}`);

    this.bossHP = this.boss.maxHP;
    this.maxHP = this.boss.maxHP;
    this.phase = 1;
    this.turnCount = 0;
    this.playerDamageDealt = 0;
    this.bossDamageDealt = 0;
    this.actionHistory = [];
    this.activeEffects = [];
    this.startTime = Date.now();
  }

  // Get current HP percentage
  getHPPercent() {
    return this.bossHP / this.maxHP;
  }

  // Check and update phase
  checkPhaseTransition() {
    const hpPercent = this.getHPPercent();
    const oldPhase = this.phase;

    if (this.boss.phase3Threshold && hpPercent <= this.boss.phase3Threshold) {
      this.phase = 3;
    } else if (hpPercent <= this.boss.phase2Threshold) {
      this.phase = 2;
    }

    return this.phase !== oldPhase ? this.phase : null;
  }

  // Calculate player damage to boss
  calculatePlayerDamage(answerResult, gearStats) {
    let baseDamage = 15;

    // Correct answer bonus
    if (answerResult.wasCorrect) {
      baseDamage += 20;
      if (answerResult.wasFirstTry) baseDamage += 15;
    } else {
      baseDamage = 5; // Minimal damage on wrong answer
    }

    // Gear bonuses (INT adds damage)
    const intBonus = Math.floor((gearStats.intelligence || 0) / 2);
    baseDamage += intBonus;

    // D20 attack roll
    const attackRoll = d20System.rollD20();
    let multiplier = 1;

    if (attackRoll.isCriticalSuccess) {
      multiplier = 2; // Critical hit!
    } else if (attackRoll.isCriticalFailure) {
      multiplier = 0.5; // Fumble
    }

    // Weakness/resistance
    const playerStat = this.getStrongestStat(gearStats);
    if (this.boss.weakTo === playerStat) {
      baseDamage = Math.floor(baseDamage * 1.5);
    } else if (this.boss.resistsTo === playerStat) {
      baseDamage = Math.floor(baseDamage * 0.6);
    }

    // Apply armor reduction
    const finalDamage = Math.max(1, Math.floor(baseDamage * multiplier) - this.boss.armor);

    return {
      baseDamage,
      roll: attackRoll,
      multiplier,
      armorReduction: this.boss.armor,
      finalDamage,
      isCritical: attackRoll.isCriticalSuccess,
      isFumble: attackRoll.isCriticalFailure
    };
  }

  // Get player's strongest stat for weakness check
  getStrongestStat(gearStats) {
    const stats = {
      intelligence: gearStats.intelligence || 0,
      wisdom: gearStats.wisdom || 0,
      constitution: gearStats.constitution || 0,
      charisma: gearStats.charisma || 0
    };
    return Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Apply damage to boss
  dealDamage(amount) {
    this.bossHP = Math.max(0, this.bossHP - amount);
    this.playerDamageDealt += amount;
    return {
      newHP: this.bossHP,
      defeated: this.bossHP <= 0,
      phaseChange: this.checkPhaseTransition()
    };
  }

  // Boss selects and executes ability
  bossAttack(playerStats) {
    // Select ability based on phase
    let abilityPool = this.boss.abilities;
    if (this.phase === 2 && this.boss.phase2Abilities) {
      abilityPool = [...abilityPool, ...this.boss.phase2Abilities];
    }
    if (this.phase === 3 && this.boss.phase3Abilities) {
      abilityPool = this.boss.phase3Abilities;
    }

    const ability = abilityPool[Math.floor(Math.random() * abilityPool.length)];

    // Roll for boss attack
    const attackRoll = d20System.rollD20();

    // Player CON reduces damage
    const conMod = Math.floor((playerStats.constitution || 10) - 10) / 2;
    const damage = Math.max(1, ability.damage - Math.max(0, conMod));

    // Critical boss hit on nat 20, miss on nat 1
    let finalDamage = damage;
    if (attackRoll.isCriticalSuccess) {
      finalDamage = damage * 2;
    } else if (attackRoll.isCriticalFailure) {
      finalDamage = 0; // Boss fumbles!
    }

    this.bossDamageDealt += finalDamage;
    this.turnCount++;

    return {
      ability,
      roll: attackRoll,
      damage: finalDamage,
      effect: ability.effect,
      isCritical: attackRoll.isCriticalSuccess,
      isMiss: attackRoll.isCriticalFailure,
      isPositive: ability.isPositive || false
    };
  }

  // Get random taunt
  getTaunt() {
    return this.boss.tauntMessages[Math.floor(Math.random() * this.boss.tauntMessages.length)];
  }

  // Get victory data
  getVictoryData() {
    const battleTime = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      bossId: this.boss.id,
      bossName: this.boss.name,
      defeatQuote: this.boss.defeatQuote,
      battleTime,
      turnCount: this.turnCount,
      playerDamageDealt: this.playerDamageDealt,
      bossDamageDealt: this.bossDamageDealt,
      lootTable: this.boss.lootTable
    };
  }

  // Check if boss is defeated
  isDefeated() {
    return this.bossHP <= 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// BOSS MANAGER
// ═══════════════════════════════════════════════════════════════

class BossManager {
  constructor() {
    this.STORAGE_KEY = 'ms_luminara_boss_progress';
    this.data = this.loadData();
    this.currentEncounter = null;
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load boss data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      bossesDefeated: {}, // { bossId: { count, bestTime, lowestTurns } }
      totalBossKills: 0,
      unlockedBosses: ['forgetful_one', 'procrastinator', 'anxiety_spiral', 'distraction_demon'],
      secretBossUnlocked: false
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save boss data:', e);
    }
  }

  // Get list of available bosses for a run
  getAvailableBosses() {
    return Object.values(BOSSES).filter(boss => {
      if (boss.isSecret && !this.data.secretBossUnlocked) return false;
      return this.data.unlockedBosses.includes(boss.id);
    });
  }

  // Select random boss for encounter
  selectRandomBoss(excludeIds = []) {
    const available = this.getAvailableBosses().filter(b => !excludeIds.includes(b.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  // Start boss encounter
  startEncounter(bossId) {
    this.currentEncounter = new BossEncounter(bossId);
    return this.currentEncounter;
  }

  // Record boss defeat
  recordVictory(victoryData) {
    const bossId = victoryData.bossId;

    if (!this.data.bossesDefeated[bossId]) {
      this.data.bossesDefeated[bossId] = {
        count: 0,
        bestTime: Infinity,
        lowestTurns: Infinity
      };
    }

    const record = this.data.bossesDefeated[bossId];
    record.count++;
    record.bestTime = Math.min(record.bestTime, victoryData.battleTime);
    record.lowestTurns = Math.min(record.lowestTurns, victoryData.turnCount);

    this.data.totalBossKills++;

    // Check unlocks
    this.checkUnlocks();
    this.save();

    return {
      isFirstKill: record.count === 1,
      isNewRecord: victoryData.battleTime === record.bestTime || victoryData.turnCount === record.lowestTurns,
      totalKills: this.data.totalBossKills
    };
  }

  // Check for boss unlocks
  checkUnlocks() {
    // Unlock Imposter after defeating 3 different bosses
    const uniqueDefeats = Object.keys(this.data.bossesDefeated).length;
    if (uniqueDefeats >= 3 && !this.data.unlockedBosses.includes('imposter')) {
      this.data.unlockedBosses.push('imposter');
    }

    // Unlock secret boss after defeating all regular bosses
    const regularBosses = Object.values(BOSSES).filter(b => !b.isSecret);
    const allDefeated = regularBosses.every(b => this.data.bossesDefeated[b.id]);
    if (allDefeated && !this.data.secretBossUnlocked) {
      this.data.secretBossUnlocked = true;
      this.data.unlockedBosses.push('shadow_luminara');
    }
  }

  // Get boss stats
  getBossStats(bossId) {
    return this.data.bossesDefeated[bossId] || null;
  }

  // Get all stats
  getAllStats() {
    return {
      ...this.data,
      totalUniqueBosses: Object.keys(this.data.bossesDefeated).length,
      availableBossCount: this.getAvailableBosses().length
    };
  }
}

// Export
let bossManager = null;
