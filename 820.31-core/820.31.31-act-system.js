/**
 * Ms. Luminara Quiz - Act System
 * Manages act progression, category assignment, and transitions
 *
 * @module ActSystem
 * @version 1.0.0
 */

const ActSystem = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  // Available categories with their associated bosses
  CATEGORIES: [
    {
      id: '000',
      name: 'Body Organization',
      description: 'Anatomical organization & terminology',
      boss: 'THE_FORGETFUL_ONE',
      icon: '🫀'
    },
    {
      id: '100',
      name: 'Brain & CNS',
      description: 'Central nervous system structures',
      boss: 'THE_DISTRACTION_DEMON',
      icon: '🧠'
    },
    {
      id: '200',
      name: 'Nerves & Reflexes',
      description: 'Peripheral nervous system, reflexes',
      boss: 'THE_ANXIETY_SPIRAL',
      icon: '⚡'
    },
    {
      id: '400',
      name: 'Tissues & Membranes',
      description: 'Histology, tissue types, membranes',
      boss: 'THE_PROCRASTINATOR',
      icon: '🔬'
    },
    {
      id: '500',
      name: 'Autonomic NS',
      description: 'Sympathetic & parasympathetic systems',
      boss: 'THE_IMPOSTER',
      icon: '💓'
    },
    {
      id: '600',
      name: 'Special Senses',
      description: 'Vision, hearing, taste, smell',
      boss: 'THE_OVERWHELMER',
      icon: '👁️'
    },
    {
      id: '700',
      name: 'Endocrine System',
      description: 'Hormones & glands',
      boss: 'HORMONAL_HAVOC',
      icon: '⚗️'
    },
    {
      id: '900',
      name: 'Respiratory System',
      description: 'Airways, lungs, gas exchange',
      boss: 'THE_BREATH_STEALER',
      icon: '🫁'
    },
    {
      id: '510',
      name: 'Math Foundations',
      description: 'Number sense, fractions, equations, logic',
      boss: 'THE_NUMBER_NIGHTMARE',
      icon: '🔢'
    }
  ],

  // Final boss for epic runs
  FINAL_BOSS: {
    id: 'MS_LUMINARA_SHADOW',
    name: "Ms. Luminara's Shadow",
    description: 'The ultimate test of all knowledge',
    category: 'mixed'
  },

  // Current state
  currentRun: null,

  // ═══════════════════════════════════════════════════════════════
  // RUN INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start a new roguelike run
   * @param {string} runLength - 'quick', 'standard', or 'epic'
   * @param {string} startCategory - Optional starting category ID
   * @returns {Object} Run configuration
   */
  startRun(runLength = 'standard', startCategory = null) {
    const config = MapSystem.RUN_LENGTHS[runLength] || MapSystem.RUN_LENGTHS.standard;

    // Assign categories to acts
    const actCategories = this.assignCategories(config.acts, startCategory);

    this.currentRun = {
      runLength: runLength,
      totalActs: config.acts,
      floorsPerAct: config.floorsPerAct,
      currentAct: 1,
      actCategories: actCategories,
      actsCompleted: [],
      stats: {
        questionsAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        rebuttalsWon: 0,
        rebuttalsLost: 0,
        potionsEarned: 0,
        potionsUsed: 0,
        cardsCollected: 0,
        goldEarned: 0,
        elitesDefeated: 0,
        bossesDefeated: 0
      },
      startTime: Date.now()
    };

    console.log('[ActSystem] Started run:', runLength, 'with', config.acts, 'acts');
    console.log('[ActSystem] Categories:', actCategories.map(a => a.name));

    return this.currentRun;
  },

  /**
   * Assign categories to each act
   * @param {number} actCount - Number of acts
   * @param {string} startCategory - Optional starting category ID
   * @returns {Array} Array of category objects for each act
   */
  assignCategories(actCount, startCategory = null) {
    console.log('[ActSystem] assignCategories called with:', { actCount, startCategory });

    // Build available categories - prefer registry categories if available
    let available = this.getAvailableCategories();
    console.log('[ActSystem] Available categories:', available.map(c => c.id));
    const assigned = [];

    // If a specific category is requested, check if it exists
    if (startCategory) {
      console.log('[ActSystem] Looking for startCategory:', startCategory);
      let startCat = available.find(c => c.id === startCategory);
      console.log('[ActSystem] Found in available:', startCat ? startCat.name : 'NOT FOUND');

      // If not found in our list, try to build it from registry
      if (!startCat && typeof quiz !== 'undefined' && quiz.registry?.categories) {
        console.log('[ActSystem] Checking quiz.registry.categories...');
        const registryCat = quiz.registry.categories.find(c => c.id === startCategory);
        console.log('[ActSystem] Found in registry:', registryCat ? registryCat.name : 'NOT FOUND');
        if (registryCat) {
          startCat = {
            id: registryCat.id,
            name: registryCat.name,
            description: registryCat.description,
            icon: this.getCategoryIcon(registryCat.id),
            boss: this.getDefaultBoss(registryCat.id)
          };
          // Add to available pool
          available.push(startCat);
        }
      } else if (!startCat) {
        console.log('[ActSystem] quiz undefined or no registry:', typeof quiz, quiz?.registry?.categories?.length);
      }

      // FOCUSED RUN MODE: If user selected a specific category,
      // ALL acts should use that category (not random others)
      if (startCat) {
        console.log('[ActSystem] FOCUSED RUN on category:', startCat.name, startCat.id);
        for (let i = 0; i < actCount; i++) {
          assigned.push(startCat);
        }
        return assigned;
      } else {
        console.warn('[ActSystem] WARNING: startCategory not found, falling back to mixed mode!');
      }
    }

    // MIXED RUN MODE: Shuffle and assign different categories
    // Shuffle available categories
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    // Assign categories to acts
    for (let i = 0; i < actCount; i++) {
      if (i < available.length) {
        assigned.push(available[i]);
      } else {
        // For epic runs, loop back through categories
        assigned.push(available[i % available.length]);
      }
    }

    return assigned;
  },

  /**
   * Get all available categories from registry + hardcoded
   * @returns {Array} Combined category list
   */
  getAvailableCategories() {
    const categories = [...this.CATEGORIES];
    const seenIds = new Set(categories.map(c => c.id));

    // Add any additional categories from registry
    if (typeof quiz !== 'undefined' && quiz.registry?.categories) {
      for (const regCat of quiz.registry.categories) {
        if (!seenIds.has(regCat.id)) {
          categories.push({
            id: regCat.id,
            name: regCat.name,
            description: regCat.description,
            icon: this.getCategoryIcon(regCat.id),
            boss: this.getDefaultBoss(regCat.id)
          });
          seenIds.add(regCat.id);
        }
      }
    }

    return categories;
  },

  /**
   * Get icon for a category ID
   * @param {string} categoryId
   * @returns {string} Emoji icon
   */
  getCategoryIcon(categoryId) {
    const iconMap = {
      '000': '🫀', '100': '🧠', '200': '⚡', '400': '🔬',
      '500': '💓', '600': '👁️', '700': '⚗️', '800': '📋',
      '900': '🫁', '510': '🔢'
    };
    return iconMap[categoryId] || '📚';
  },

  /**
   * Get default boss for a category ID
   * @param {string} categoryId
   * @returns {string} Boss ID
   */
  getDefaultBoss(categoryId) {
    const bossMap = {
      '000': 'THE_FORGETFUL_ONE',
      '100': 'THE_DISTRACTION_DEMON',
      '200': 'THE_ANXIETY_SPIRAL',
      '400': 'THE_PROCRASTINATOR',
      '500': 'THE_IMPOSTER',
      '600': 'THE_OVERWHELMER',
      '700': 'HORMONAL_HAVOC',
      '800': 'THE_PERFECTIONIST',
      '900': 'THE_BREATH_STEALER',
      '510': 'THE_NUMBER_NIGHTMARE'
    };
    return bossMap[categoryId] || 'THE_FORGETFUL_ONE';
  },

  // ═══════════════════════════════════════════════════════════════
  // ACT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get current act information
   * @returns {Object}
   */
  getCurrentAct() {
    if (!this.currentRun) return null;

    const actIndex = this.currentRun.currentAct - 1;
    const category = this.currentRun.actCategories[actIndex];

    return {
      actNumber: this.currentRun.currentAct,
      totalActs: this.currentRun.totalActs,
      category: category,
      isLastAct: this.currentRun.currentAct >= this.currentRun.totalActs
    };
  },

  /**
   * Generate map for current act
   * @returns {Object} Map data
   */
  generateCurrentActMap() {
    const act = this.getCurrentAct();
    if (!act) return null;

    const map = MapSystem.generateActMap(
      act.actNumber,
      act.category.id,
      act.category.boss,
      this.currentRun.runLength
    );

    MapSystem.setMap(map);
    return map;
  },

  /**
   * Complete current act and transition to next
   * @returns {Object} Transition info
   */
  completeAct() {
    if (!this.currentRun) return null;

    const completedAct = this.getCurrentAct();

    // Record completion
    this.currentRun.actsCompleted.push({
      actNumber: completedAct.actNumber,
      category: completedAct.category,
      completedAt: Date.now()
    });

    this.currentRun.stats.bossesDefeated++;

    // Check if run complete
    if (this.currentRun.currentAct >= this.currentRun.totalActs) {
      return {
        type: 'run_complete',
        actsCompleted: this.currentRun.actsCompleted,
        stats: this.currentRun.stats
      };
    }

    // Advance to next act
    this.currentRun.currentAct++;
    const nextAct = this.getCurrentAct();

    return {
      type: 'act_transition',
      completedAct: completedAct,
      nextAct: nextAct,
      choices: this.getActTransitionChoices()
    };
  },

  /**
   * Get choices available at act transition
   * @returns {Array} Choice objects
   */
  getActTransitionChoices() {
    return [
      {
        id: 'heal',
        name: 'Rest & Recover',
        description: 'Heal 50% of max HP',
        icon: '❤️',
        effect: { type: 'heal_percent', amount: 50 }
      },
      {
        id: 'remove_card',
        name: 'Purify Deck',
        description: 'Remove 1 card from your deck',
        icon: '🗑️',
        effect: { type: 'remove_card', count: 1 }
      },
      {
        id: 'upgrade_card',
        name: 'Enhance Knowledge',
        description: 'Upgrade 1 card in your deck',
        icon: '⬆️',
        effect: { type: 'upgrade_card', count: 1 }
      }
    ];
  },

  /**
   * Apply transition choice effect
   * @param {string} choiceId
   * @param {Object} context - Player state
   * @returns {Object} Effect result
   */
  applyTransitionChoice(choiceId, context = {}) {
    const choices = this.getActTransitionChoices();
    const choice = choices.find(c => c.id === choiceId);
    if (!choice) return null;

    switch (choice.effect.type) {
      case 'heal_percent':
        const healAmount = Math.floor((context.maxHp || 100) * (choice.effect.amount / 100));
        return {
          type: 'heal',
          amount: healAmount,
          description: `Healed ${healAmount} HP`
        };

      case 'remove_card':
        return {
          type: 'remove_card',
          count: choice.effect.count,
          description: 'Select a card to remove'
        };

      case 'upgrade_card':
        return {
          type: 'upgrade_card',
          count: choice.effect.count,
          description: 'Select a card to upgrade'
        };

      default:
        return null;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record a question result
   * @param {boolean} correct
   */
  recordQuestion(correct) {
    if (!this.currentRun) return;

    this.currentRun.stats.questionsAnswered++;
    if (correct) {
      this.currentRun.stats.correctAnswers++;
    } else {
      this.currentRun.stats.wrongAnswers++;
    }
  },

  /**
   * Record a rebuttal result
   * @param {boolean} won
   */
  recordRebuttal(won) {
    if (!this.currentRun) return;

    if (won) {
      this.currentRun.stats.rebuttalsWon++;
    } else {
      this.currentRun.stats.rebuttalsLost++;
    }
  },

  /**
   * Record potion earned
   */
  recordPotionEarned() {
    if (this.currentRun) {
      this.currentRun.stats.potionsEarned++;
    }
  },

  /**
   * Record potion used
   */
  recordPotionUsed() {
    if (this.currentRun) {
      this.currentRun.stats.potionsUsed++;
    }
  },

  /**
   * Record elite defeated
   */
  recordEliteDefeated() {
    if (this.currentRun) {
      this.currentRun.stats.elitesDefeated++;
    }
  },

  /**
   * Record gold earned
   * @param {number} amount
   */
  recordGold(amount) {
    if (this.currentRun) {
      this.currentRun.stats.goldEarned += amount;
    }
  },

  /**
   * Record card collected
   */
  recordCardCollected() {
    if (this.currentRun) {
      this.currentRun.stats.cardsCollected++;
    }
  },

  /**
   * Get run statistics
   * @returns {Object}
   */
  getStats() {
    if (!this.currentRun) return null;

    const stats = { ...this.currentRun.stats };
    stats.accuracy = stats.questionsAnswered > 0
      ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
      : 0;
    stats.rebuttalAccuracy = (stats.rebuttalsWon + stats.rebuttalsLost) > 0
      ? Math.round((stats.rebuttalsWon / (stats.rebuttalsWon + stats.rebuttalsLost)) * 100)
      : 0;
    stats.runDuration = Date.now() - this.currentRun.startTime;

    return stats;
  },

  // ═══════════════════════════════════════════════════════════════
  // RUN SUMMARY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate run summary for display
   * @param {boolean} victory
   * @returns {Object}
   */
  generateRunSummary(victory) {
    if (!this.currentRun) return null;

    const stats = this.getStats();
    const duration = stats.runDuration;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    // Calculate score
    const score = this.calculateScore(victory);

    return {
      victory: victory,
      runLength: this.currentRun.runLength,
      actsCompleted: this.currentRun.actsCompleted.length,
      totalActs: this.currentRun.totalActs,
      duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      score: score,
      stats: {
        accuracy: `${stats.accuracy}%`,
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        rebuttalsWon: stats.rebuttalsWon,
        potionsUsed: stats.potionsUsed,
        cardsCollected: stats.cardsCollected,
        elitesDefeated: stats.elitesDefeated,
        bossesDefeated: stats.bossesDefeated
      },
      categories: this.currentRun.actsCompleted.map(a => a.category.name)
    };
  },

  /**
   * Calculate final score
   * @param {boolean} victory
   * @returns {number}
   */
  calculateScore(victory) {
    const stats = this.getStats();
    let score = 0;

    // Base points
    score += stats.correctAnswers * 10;
    score += stats.rebuttalsWon * 25;  // Bonus for rebuttal success
    score += stats.elitesDefeated * 100;
    score += stats.bossesDefeated * 250;

    // Victory bonus
    if (victory) {
      const lengthMultiplier = {
        quick: 1.0,
        standard: 1.5,
        epic: 2.0
      };
      score *= lengthMultiplier[this.currentRun.runLength] || 1.0;
    }

    // Accuracy bonus
    if (stats.accuracy >= 90) score *= 1.3;
    else if (stats.accuracy >= 80) score *= 1.2;
    else if (stats.accuracy >= 70) score *= 1.1;

    return Math.floor(score);
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Save run state
   * @returns {Object}
   */
  saveState() {
    return this.currentRun ? { ...this.currentRun } : null;
  },

  /**
   * Load run state
   * @param {Object} state
   */
  loadState(state) {
    this.currentRun = state;
  },

  /**
   * Reset to clean state
   */
  reset() {
    this.currentRun = null;
  },

  /**
   * Check if a run is active
   * @returns {boolean}
   */
  isRunActive() {
    return this.currentRun !== null;
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.ActSystem = ActSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActSystem;
}
