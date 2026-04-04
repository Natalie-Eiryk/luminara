/**
 * Ms. Luminara Quiz - Scaffold Remediation System
 *
 * Implements Phase 1 of Implementation Roadmap (510.108):
 * Iterative Socratic Scaffolding with adaptive depth.
 *
 * When a user answers incorrectly:
 * 1. Roll D20 for damage (CON reduces damage)
 * 2. Apply damage to HP (100 max)
 * 3. Present scaffold questions from vocabulary bank
 * 4. Continue until INSIGHT is detected (not fixed count!)
 * 5. Heal 5 HP per correct scaffold answer
 *
 * Research Basis (510.106):
 * - Socrates: "forcing minds to freedom" through continued questioning
 * - Scaffolds continue until insight emerges, with graceful exit paths
 * - Pattern shifts in wrong answers indicate progress, not failure
 */

class ScaffoldRemediationEngine {
  constructor(persistenceManager, d20System) {
    this.persistence = persistenceManager;
    this.d20System = d20System;
    this.STORAGE_KEY = 'ms_luminara_scaffold_hp';
    this.data = this.loadData();

    // HP Configuration
    this.MAX_HP = 100;
    this.HEAL_PER_SCAFFOLD = 5;

    // Damage table based on D20 roll
    this.DAMAGE_TABLE = {
      fumble: 0,      // Natural 1: no damage (lucky!)
      low: 5,         // 2-7: minor damage
      medium: 10,     // 8-14: standard damage
      high: 15,       // 15-19: heavy damage
      critical: 25    // Natural 20: critical hit
    };

    // Active scaffold session
    this.activeSession = null;

    // Insight Detection Engine (initialized separately)
    this.insightEngine = null;

    // Vocabulary bank cache
    this.vocabBankCache = {};

    // Vocabulary bank mapping by category
    this.VOCAB_BANK_MAP = {
      '000': { folder: '611-anatomy/611-foundations', file: '000.5-vocabulary.json' },
      '100': { folder: '612-physiology/612.82-brain', file: '100.5-vocabulary.json' },
      '200': { folder: '612-physiology/612.81-nerves', file: '200.6-vocabulary.json' },
      '400': { folder: '611-anatomy/611.018-tissues', file: '400.4-vocabulary.json' },
      '500': { folder: '612-physiology/612.89-ans', file: '500.3-vocabulary.json' },
      '600': { folder: '612-physiology/612.8-special-senses', file: '600.4-vocabulary.json' },
      '700': { folder: '612-physiology/612.4-endocrine', file: '700.4-vocabulary.json' },
      '900': { folder: '612-physiology/612.2-respiratory', file: '900.5-vocabulary.json' }
    };
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('Failed to load scaffold HP data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      currentHP: this.MAX_HP || 100,
      maxHP: this.MAX_HP || 100,
      totalDamageTaken: 0,
      totalHealed: 0,
      knockouts: 0,
      scaffoldsCompleted: 0,
      scaffoldsCorrectFirstTry: 0,
      xpPenaltyActive: false
    };
  }

  mergeWithDefaults(saved) {
    const defaults = this.getDefaultData();
    return { ...defaults, ...saved };
  }

  /**
   * Set the insight detection engine (called during initialization)
   */
  setInsightEngine(engine) {
    this.insightEngine = engine;
    console.log('[ScaffoldRemediation] Insight detection engine attached');
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save scaffold HP data:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HP MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  getHP() {
    return {
      current: this.data.currentHP,
      max: this.data.maxHP,
      percent: Math.round((this.data.currentHP / this.data.maxHP) * 100),
      knockouts: this.data.knockouts,
      xpPenaltyActive: this.data.xpPenaltyActive
    };
  }

  /**
   * Calculate damage based on D20 roll (REVERSED: high roll = less damage)
   * Natural 20 = no damage (lucky!), Natural 1 = critical hit (ouch!)
   * CON modifier reduces damage (min 1)
   */
  calculateDamage() {
    const roll = this.d20System.rollD20();
    let baseDamage;
    let damageType;

    // REVERSED: Higher rolls = better outcome (less damage)
    if (roll.isCriticalSuccess) {
      // Natural 20 = lucky, no damage!
      baseDamage = this.DAMAGE_TABLE.fumble;
      damageType = 'fumble';
    } else if (roll.roll >= 15) {
      // 15-19: minimal damage
      baseDamage = this.DAMAGE_TABLE.low;
      damageType = 'low';
    } else if (roll.roll >= 8) {
      // 8-14: standard damage
      baseDamage = this.DAMAGE_TABLE.medium;
      damageType = 'medium';
    } else if (roll.roll >= 2) {
      // 2-7: heavy damage
      baseDamage = this.DAMAGE_TABLE.high;
      damageType = 'high';
    } else {
      // Natural 1 = critical hit, max damage!
      baseDamage = this.DAMAGE_TABLE.critical;
      damageType = 'critical';
    }

    // CON modifier reduces damage
    const conMod = this.d20System.getStatModifier('constitution');
    const finalDamage = baseDamage === 0 ? 0 : Math.max(1, baseDamage - conMod);

    return {
      roll,
      baseDamage,
      conMod,
      finalDamage,
      damageType,
      isFumble: roll.isCriticalSuccess,  // Nat 20 = fumble (no damage)
      isCritical: roll.isCriticalFailure  // Nat 1 = critical hit (max damage)
    };
  }

  /**
   * Apply damage to HP
   */
  applyDamage(damage) {
    const previousHP = this.data.currentHP;
    this.data.currentHP = Math.max(0, this.data.currentHP - damage);
    this.data.totalDamageTaken += damage;

    const isKnockout = this.data.currentHP === 0;

    if (isKnockout) {
      this.handleKnockout();
    }

    this.save();

    return {
      previousHP,
      currentHP: this.data.currentHP,
      damageTaken: damage,
      isKnockout
    };
  }

  /**
   * Handle knockout (HP reaches 0)
   */
  handleKnockout() {
    this.data.knockouts++;
    this.data.currentHP = this.data.maxHP; // Restore to full
    this.data.xpPenaltyActive = true; // 50% XP penalty for session
    this.save();
  }

  /**
   * Heal HP (from correct scaffold answers)
   */
  heal(amount) {
    const previousHP = this.data.currentHP;
    this.data.currentHP = Math.min(this.data.maxHP, this.data.currentHP + amount);
    this.data.totalHealed += (this.data.currentHP - previousHP);
    this.save();

    return {
      previousHP,
      currentHP: this.data.currentHP,
      healed: this.data.currentHP - previousHP
    };
  }

  /**
   * Clear XP penalty (call at session end or after time)
   */
  clearXPPenalty() {
    this.data.xpPenaltyActive = false;
    this.save();
  }

  /**
   * Get XP multiplier (0.5 if penalty active, 1.0 otherwise)
   */
  getXPMultiplier() {
    return this.data.xpPenaltyActive ? 0.5 : 1.0;
  }

  // ═══════════════════════════════════════════════════════════════
  // VOCABULARY BANK LOADING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Load vocabulary bank for a category
   */
  async loadVocabularyBank(categoryPrefix) {
    // Check cache first
    if (this.vocabBankCache[categoryPrefix]) {
      return this.vocabBankCache[categoryPrefix];
    }

    const mapping = this.VOCAB_BANK_MAP[categoryPrefix];
    if (!mapping) {
      console.warn(`No vocabulary bank for category ${categoryPrefix}`);
      return null;
    }

    try {
      const response = await fetch(`${mapping.folder}/${mapping.file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const bank = await response.json();
      this.vocabBankCache[categoryPrefix] = bank;
      return bank;
    } catch (e) {
      console.error(`Failed to load vocabulary bank for ${categoryPrefix}:`, e);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SCAFFOLD QUESTION SELECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Select scaffold questions for a wrong answer
   * Uses QuestionOrchestrator as Single Source of Truth when available
   *
   * Phase 1 Enhancement: Selects more questions to support adaptive depth.
   *
   * @param {object} wrongQuestion - The question that was answered incorrectly
   * @param {number} wrongOptionIndex - Which wrong option was selected (optional, for confusion-based selection)
   * @param {number} count - Number of scaffold questions to select (default: 7 for adaptive depth)
   */
  async selectScaffoldQuestions(wrongQuestion, wrongOptionIndex = null, count = 7) {
    console.log('[ScaffoldRemediation] Selecting scaffolds for:', wrongQuestion.id);

    // Ensure orchestrator is initialized
    if (typeof questionOrchestrator === 'undefined') {
      throw new Error('[ScaffoldRemediation] QuestionOrchestrator not loaded - check script order in index.html');
    }

    if (!questionOrchestrator.initialized) {
      console.log('[ScaffoldRemediation] Waiting for orchestrator to initialize...');
      await questionOrchestrator.init();
    }

    const scaffolds = await questionOrchestrator.selectScaffolds(
      wrongQuestion,
      wrongOptionIndex,
      count
    );

    console.log(`[ScaffoldRemediation] Orchestrator returned ${scaffolds.length} scaffolds`);

    if (scaffolds.length < 2) {
      throw new Error(`[ScaffoldRemediation] Insufficient scaffolds (${scaffolds.length}) for question ${wrongQuestion.id}`);
    }

    return scaffolds;
  }

  // ═══════════════════════════════════════════════════════════════
  // SCAFFOLD SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start a scaffold session after wrong answer
   *
   * Phase 1 Enhancement: Adaptive scaffold depth based on insight detection.
   * Scaffolds continue until insight is achieved, not a fixed count.
   *
   * @param {object} wrongQuestion - The question that was answered incorrectly
   * @param {object} damageResult - Result of damage calculation
   * @param {number} wrongOptionIndex - Index of the wrong option selected (for statistics-based selection)
   */
  async startSession(wrongQuestion, damageResult, wrongOptionIndex = null) {
    // Load more scaffold questions than we might need (for adaptive depth)
    const maxPossibleScaffolds = this.insightEngine?.MAX_SCAFFOLDS || 7;
    const scaffoldQuestions = await this.selectScaffoldQuestions(wrongQuestion, wrongOptionIndex, maxPossibleScaffolds);

    if (!scaffoldQuestions || scaffoldQuestions.length < 2) {
      console.warn('Could not select enough scaffold questions');
      return null;
    }

    this.activeSession = {
      triggerQuestion: wrongQuestion,
      triggerQuestionId: wrongQuestion.id,
      scaffoldQuestions,
      currentIndex: 0,
      damageResult,
      startTime: Date.now(),
      results: [],                     // Track each scaffold result with timing
      wrongPatternHistory: [wrongOptionIndex],  // Track wrong answer patterns for shift detection
      completed: false,

      // Adaptive scaffolding thresholds (from insight engine or defaults)
      minScaffolds: this.insightEngine?.MIN_SCAFFOLDS || 2,
      maxScaffolds: this.insightEngine?.MAX_SCAFFOLDS || 7,
      insightAchieved: false,
      exitReason: null
    };

    console.log(`[ScaffoldRemediation] Session started with ${scaffoldQuestions.length} available scaffolds (min: ${this.activeSession.minScaffolds}, max: ${this.activeSession.maxScaffolds})`);

    return this.activeSession;
  }

  /**
   * Get current scaffold question
   */
  getCurrentScaffold() {
    if (!this.activeSession) return null;
    return this.activeSession.scaffoldQuestions[this.activeSession.currentIndex];
  }

  /**
   * Get scaffold session state
   *
   * Phase 1 Enhancement: Includes adaptive scaffolding information.
   */
  getSessionState() {
    if (!this.activeSession) return null;

    const depth = this.activeSession.results.length;

    return {
      currentIndex: this.activeSession.currentIndex,
      total: this.activeSession.scaffoldQuestions.length,
      currentQuestion: this.getCurrentScaffold(),
      damageResult: this.activeSession.damageResult,
      results: this.activeSession.results,
      completed: this.activeSession.completed,

      // Phase 1 enhancements
      depth,
      minScaffolds: this.activeSession.minScaffolds,
      maxScaffolds: this.activeSession.maxScaffolds,
      canSoftExit: depth >= this.activeSession.minScaffolds,
      insightAchieved: this.activeSession.insightAchieved,

      // Progress display helper (e.g., "Scaffold 3 of 2-7")
      progressDisplay: `${depth + 1} of ${this.activeSession.minScaffolds}-${this.activeSession.maxScaffolds}`
    };
  }

  /**
   * Record scaffold answer result
   *
   * Phase 1 Enhancement: Includes timing and triggers insight evaluation.
   *
   * @param {boolean} wasCorrectFirstTry - Whether answer was correct on first try
   * @param {number} timeToAnswerMs - Time taken to answer (optional, for insight detection)
   * @param {number} selectedOption - Which option was selected (optional, for pattern tracking)
   */
  recordScaffoldResult(wasCorrectFirstTry, timeToAnswerMs = 0, selectedOption = null) {
    if (!this.activeSession) return null;

    const currentQuestion = this.getCurrentScaffold();

    this.activeSession.results.push({
      questionId: currentQuestion.id,
      wasCorrectFirstTry,
      timeToAnswerMs,
      selectedOption,
      timestamp: Date.now()
    });

    // Track wrong answer patterns for conceptual shift detection
    if (!wasCorrectFirstTry && selectedOption !== null) {
      this.activeSession.wrongPatternHistory.push(selectedOption);
    }

    // Heal on correct
    let healResult = null;
    if (wasCorrectFirstTry) {
      healResult = this.heal(this.HEAL_PER_SCAFFOLD);
      this.data.scaffoldsCorrectFirstTry++;
    }

    this.data.scaffoldsCompleted++;
    this.save();

    // Evaluate insight if engine is available
    let insightEvaluation = null;
    if (this.insightEngine) {
      insightEvaluation = this.insightEngine.evaluateInsight(
        this.activeSession.results,
        this.activeSession.wrongPatternHistory
      );
    }

    // Calculate scaffolds remaining based on adaptive logic
    const depth = this.activeSession.results.length;
    const minRemaining = Math.max(0, this.activeSession.minScaffolds - depth);
    const maxRemaining = Math.max(0, this.activeSession.maxScaffolds - depth);

    return {
      wasCorrectFirstTry,
      healResult,
      depth,
      minRemaining,
      maxRemaining,
      insightEvaluation,
      // For backwards compatibility
      scaffoldsRemaining: maxRemaining
    };
  }

  /**
   * Determine if scaffolding should continue based on insight detection
   *
   * Phase 1 Enhancement: Uses adaptive logic instead of fixed count.
   *
   * @returns {object} { shouldContinue, reason, evaluation }
   */
  shouldContinueScaffolding() {
    if (!this.activeSession) return { shouldContinue: false, reason: 'no_session' };

    const depth = this.activeSession.results.length;
    const { minScaffolds, maxScaffolds, scaffoldQuestions } = this.activeSession;

    // Always do minimum scaffolds
    if (depth < minScaffolds) {
      return {
        shouldContinue: true,
        reason: 'minimum_not_reached',
        depth
      };
    }

    // Check for insight if engine is available
    if (this.insightEngine) {
      const evaluation = this.insightEngine.evaluateInsight(
        this.activeSession.results,
        this.activeSession.wrongPatternHistory
      );

      if (evaluation.hasInsight && evaluation.confidence >= this.insightEngine.CONFIDENCE_THRESHOLD) {
        this.activeSession.insightAchieved = true;
        this.activeSession.exitReason = 'insight_achieved';
        return {
          shouldContinue: false,
          reason: 'insight_achieved',
          evaluation,
          depth
        };
      }

      // Maximum reached
      if (depth >= maxScaffolds) {
        this.activeSession.exitReason = 'maximum_reached';
        return {
          shouldContinue: false,
          reason: 'maximum_reached',
          evaluation,
          depth
        };
      }

      // Check if we have more scaffold questions available
      if (this.activeSession.currentIndex >= scaffoldQuestions.length - 1) {
        this.activeSession.exitReason = 'questions_exhausted';
        return {
          shouldContinue: false,
          reason: 'questions_exhausted',
          evaluation,
          depth
        };
      }

      // Continue scaffolding
      return {
        shouldContinue: true,
        reason: 'seeking_insight',
        evaluation,
        depth
      };
    }

    // Fallback: fixed 3-question behavior if no insight engine
    if (depth >= 3) {
      return {
        shouldContinue: false,
        reason: 'fixed_limit_reached',
        depth
      };
    }

    return {
      shouldContinue: true,
      reason: 'fixed_limit_not_reached',
      depth
    };
  }

  /**
   * Advance to next scaffold question
   *
   * Phase 1 Enhancement: Uses insight-based continuation.
   */
  nextScaffold() {
    if (!this.activeSession) return null;

    // Check if we should continue before advancing
    const continueCheck = this.shouldContinueScaffolding();

    if (!continueCheck.shouldContinue) {
      return this.completeSession(continueCheck.reason, continueCheck.evaluation);
    }

    this.activeSession.currentIndex++;

    // Safety check: don't go past available questions
    if (this.activeSession.currentIndex >= this.activeSession.scaffoldQuestions.length) {
      return this.completeSession('questions_exhausted');
    }

    // Get progress message if available
    let progressMessage = null;
    if (this.insightEngine && continueCheck.evaluation) {
      progressMessage = this.insightEngine.getProgressMessage(
        this.activeSession.currentIndex,
        continueCheck.evaluation
      );
    }

    return {
      currentIndex: this.activeSession.currentIndex,
      currentQuestion: this.getCurrentScaffold(),
      completed: false,
      continueReason: continueCheck.reason,
      progressMessage
    };
  }

  /**
   * Complete scaffold session
   *
   * Phase 1 Enhancement: Includes exit reason, insight status, and analytics.
   *
   * @param {string} exitReason - Why scaffolding ended (optional, uses session value if not provided)
   * @param {object} finalEvaluation - Final insight evaluation (optional)
   */
  completeSession(exitReason = null, finalEvaluation = null) {
    if (!this.activeSession) return null;

    this.activeSession.completed = true;
    const duration = Date.now() - this.activeSession.startTime;
    const correctCount = this.activeSession.results.filter(r => r.wasCorrectFirstTry).length;
    const scaffoldDepth = this.activeSession.results.length;

    // Use provided exit reason or session's stored reason
    const reason = exitReason || this.activeSession.exitReason || 'completed';
    const insightAchieved = this.activeSession.insightAchieved ||
                            (finalEvaluation?.hasInsight && finalEvaluation?.confidence >= 0.7);

    // Get exit message from insight engine
    let exitMessage = null;
    if (this.insightEngine) {
      exitMessage = this.insightEngine.getExitMessage(reason);

      // Record analytics to statistics engine if available
      if (typeof questionStatistics !== 'undefined' && questionStatistics) {
        const analyticsRecord = this.insightEngine.generateAnalyticsRecord(
          this.activeSession.triggerQuestionId,
          this.activeSession.results,
          finalEvaluation || { hasInsight: insightAchieved, confidence: 0, recommendation: reason }
        );
        this.recordScaffoldSessionAnalytics(analyticsRecord);
      }
    }

    const summary = {
      completed: true,
      triggerQuestionId: this.activeSession.triggerQuestionId,
      duration,
      scaffoldDepth,  // How many scaffolds were used
      correctCount,
      totalHealed: correctCount * this.HEAL_PER_SCAFFOLD,
      currentHP: this.data.currentHP,

      // Phase 1 enhancements
      insightAchieved,
      exitReason: reason,
      exitMessage,
      finalEvaluation,

      // Metrics for debugging/display
      metrics: {
        accuracy: scaffoldDepth > 0 ? Math.round((correctCount / scaffoldDepth) * 100) : 0,
        avgTimeMs: this.activeSession.results.length > 0
          ? Math.round(this.activeSession.results.reduce((sum, r) => sum + (r.timeToAnswerMs || 0), 0) / this.activeSession.results.length)
          : 0
      }
    };

    console.log(`[ScaffoldRemediation] Session completed: ${reason}, depth=${scaffoldDepth}, insight=${insightAchieved}`);

    // Clear active session
    this.activeSession = null;

    return summary;
  }

  /**
   * Record scaffold session analytics to QuestionStatisticsEngine
   *
   * @param {object} analyticsRecord - Record from InsightDetectionEngine
   */
  recordScaffoldSessionAnalytics(analyticsRecord) {
    // This integrates with the statistics engine to improve future scaffold selection
    // The statistics engine can use scaffold depth to refine difficulty estimates
    if (typeof questionStatistics !== 'undefined' && questionStatistics) {
      const stats = questionStatistics.getOrCreateQuestionStats(analyticsRecord.triggerQuestionId);

      if (!stats.scaffoldHistory) {
        stats.scaffoldHistory = [];
      }

      stats.scaffoldHistory.push({
        depth: analyticsRecord.scaffoldDepth,
        insightAchieved: analyticsRecord.insightAchieved,
        exitReason: analyticsRecord.exitReason,
        confidence: analyticsRecord.confidence,
        timestamp: analyticsRecord.timestamp
      });

      // Questions requiring deep scaffolding may be harder than raw stats suggest
      // This could be used to adjust difficulty estimates
      questionStatistics.save();

      console.log(`[ScaffoldRemediation] Analytics recorded for ${analyticsRecord.triggerQuestionId}`);
    }
  }

  /**
   * Check if scaffold session is active
   */
  isSessionActive() {
    return this.activeSession !== null && !this.activeSession.completed;
  }

  /**
   * Cancel/abort scaffold session (emergency only)
   */
  abortSession() {
    this.activeSession = null;
  }

  /**
   * Soft exit from scaffold session (user chooses to pause)
   *
   * Phase 1 Enhancement: Graceful exit with tracking.
   * Questions will resurface in spaced repetition.
   *
   * @returns {object} Session summary with soft_exit_taken reason
   */
  softExit() {
    if (!this.activeSession) return null;

    // Only allow soft exit after minimum scaffolds
    const depth = this.activeSession.results.length;
    if (depth < this.activeSession.minScaffolds) {
      return {
        allowed: false,
        reason: `Must complete at least ${this.activeSession.minScaffolds} scaffolds`,
        remaining: this.activeSession.minScaffolds - depth
      };
    }

    this.activeSession.exitReason = 'soft_exit_taken';
    return this.completeSession('soft_exit_taken');
  }

  /**
   * Check if soft exit is currently allowed
   */
  canSoftExit() {
    if (!this.activeSession) return false;
    return this.activeSession.results.length >= this.activeSession.minScaffolds;
  }

  // ═══════════════════════════════════════════════════════════════
  // MS. LUMINARA MESSAGES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get introduction message for a scaffold question
   * Uses narrative from dedicated scaffold files when available
   */
  getScaffoldIntroMessage(scaffoldIndex, currentScaffold = null) {
    // If this is a dedicated scaffold with narrative, use it
    if (currentScaffold?._isDedicatedScaffold && currentScaffold?.narrative) {
      return currentScaffold.narrative;
    }

    // Check if we have session-level narrative context
    if (this.activeSession?.scaffoldQuestions?.[0]?._narrativeContext) {
      const ctx = this.activeSession.scaffoldQuestions[0]._narrativeContext;
      // First scaffold gets the full setting narrative
      if (scaffoldIndex === 0 && ctx.setting) {
        return ctx.setting;
      }
    }

    // Fallback to GM-style messages
    const intros = [
      // First scaffold - GM setting up the trap
      [
        "Oh, you missed that? *flips through rulebook* Let me make this EASIER for you. (That's sarcasm.)",
        "Struggling already? How delightful! Here's a hint wrapped in another question.",
        "Don't worry, I'll walk you through it. Very. Slowly. *taps clipboard*"
      ],
      // Second scaffold - GM enjoying the struggle
      [
        "Still here? Your persistence is... almost admirable. Almost. Try this one.",
        "Round two of remedial education! I'm having a great time. Are you?",
        "*scribbles notes* 'Student requires additional scaffolding.' This is going in my records."
      ],
      // Third scaffold - GM preparing the finale
      [
        "Final scaffold! After this, I SUPPOSE you might understand. No promises though.",
        "Last chance to not embarrass yourself on the main question. Make it count!",
        "One more... then we see if any of this stuck. I have my doubts. 📋"
      ]
    ];

    const messages = intros[Math.min(scaffoldIndex, 2)];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get the arc title for the current scaffold (for UI display)
   */
  getScaffoldArcInfo(currentScaffold = null) {
    if (!currentScaffold) {
      currentScaffold = this.getCurrentScaffold();
    }

    if (currentScaffold?._isDedicatedScaffold) {
      return {
        arc: currentScaffold.arc || 1,
        arcTitle: currentScaffold.arcTitle || 'Understanding',
        isDedicated: true
      };
    }

    // Fallback for vocabulary-based scaffolds
    const index = this.activeSession?.currentIndex || 0;
    const arcTitles = ['Foundation', 'Connection', 'Application'];
    return {
      arc: Math.floor(index / 3) + 1,
      arcTitle: arcTitles[Math.min(Math.floor(index / 3), 2)],
      isDedicated: false
    };
  }

  /**
   * Check if current session uses dedicated narrative scaffolds
   */
  isUsingDedicatedScaffolds() {
    return this.activeSession?.scaffoldQuestions?.[0]?._isDedicatedScaffold === true;
  }

  /**
   * Get narrative context for the current session
   */
  getNarrativeContext() {
    if (!this.activeSession) return null;

    const firstScaffold = this.activeSession.scaffoldQuestions?.[0];
    if (firstScaffold?._narrativeContext) {
      return {
        setting: firstScaffold._narrativeContext.setting,
        character: firstScaffold._narrativeContext.character,
        tension: firstScaffold._narrativeContext.tension,
        parentQuestion: this.activeSession.triggerQuestion?.q
      };
    }

    return null;
  }

  getDamageMessage(damageResult) {
    if (damageResult.isFumble) {
      // Natural 20 - lucky!
      return "Natural 20?! *flips table* Fine. No damage. THIS TIME.";
    }
    if (damageResult.isCritical) {
      // Natural 1 - ouch!
      return "NATURAL 1! *evil cackle* Critical hit! Knowledge is pain, apparently.";
    }
    if (damageResult.damageType === 'low') {
      return "High roll... barely a scratch. *mutters* Lucky punk...";
    }
    if (damageResult.damageType === 'medium') {
      return "A solid hit! Not enough to knock you out, but I'm patient.";
    }
    return "LOW ROLL! *chef's kiss* That's gonna leave a mark. Scaffolds incoming!";
  }

  getHealMessage(healResult) {
    if (healResult.healed > 0) {
      return `+${healResult.healed} HP restored. *sighs* Back to full strength, I see.`;
    }
    return "Already at max HP? How boring. Let me fix that...";
  }

  getKnockoutMessage() {
    const messages = [
      "KNOCKOUT! *rings bell* Don't worry, I'll let you try again. I'm merciful like that.",
      "Down goes the student! Your HP is restored, but your dignity? Not so much.",
      "KO'd! *pours one out* Even legends fall. Rise up — XP halved as a learning tax."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS
  // ═══════════════════════════════════════════════════════════════

  getStats() {
    return {
      hp: this.getHP(),
      totalDamageTaken: this.data.totalDamageTaken,
      totalHealed: this.data.totalHealed,
      scaffoldsCompleted: this.data.scaffoldsCompleted,
      scaffoldsCorrectFirstTry: this.data.scaffoldsCorrectFirstTry,
      scaffoldAccuracy: this.data.scaffoldsCompleted > 0
        ? Math.round((this.data.scaffoldsCorrectFirstTry / this.data.scaffoldsCompleted) * 100)
        : 0,
      knockouts: this.data.knockouts
    };
  }

  /**
   * Reset HP to full (for new session or testing)
   */
  resetHP() {
    this.data.currentHP = this.data.maxHP;
    this.data.xpPenaltyActive = false;
    this.save();
  }
}

// Export singleton (will be initialized after persistence and d20System)
let scaffoldRemediation = null;
