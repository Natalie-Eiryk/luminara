/**
 * Ms. Luminara Quiz - Gauntlet Mode
 * Roguelike boss battles with permadeath mechanics
 * @version 2026-03-30
 */

// ═══════════════════════════════════════════════════════════════
// GAUNTLET MODE - ROGUELIKE BOSS BATTLES
// ═══════════════════════════════════════════════════════════════

// Wait for LuminaraQuiz to be defined
(function() {
  if (typeof LuminaraQuiz === 'undefined') {
    console.error('[Gauntlet] LuminaraQuiz not defined - ensure app.js loads first');
    return;
  }

/**
 * Initialize Gauntlet mode systems
 */
LuminaraQuiz.prototype.initGauntlet = function() {
  // Initialize singletons if not already done
  if (!runManager) runManager = new RunManager();
  if (!bossManager) bossManager = new BossManager();
  if (!powerUpManager) powerUpManager = new PowerUpManager();
  if (!highScoreManager) highScoreManager = new HighScoreManager();

  // Update Gauntlet landing page stats
  this.updateGauntletStats();
  this.updateDifficultyButtons();
};

/**
 * Update Gauntlet landing page stats
 */
LuminaraQuiz.prototype.updateGauntletStats = function() {
  const stats = runManager?.getAllStats() || { totalRuns: 0, arcadeTokens: 0, totalBossesDefeatedInRuns: 0 };
  const highScores = highScoreManager?.getHighScores() || [];

  document.getElementById('gTotalRuns').textContent = stats.totalRuns;
  document.getElementById('gBestScore').textContent = highScores[0]?.score?.toLocaleString() || '0';
  document.getElementById('gBossesSlain').textContent = stats.totalBossesDefeatedInRuns;
  document.getElementById('gTokens').textContent = stats.arcadeTokens;
};

/**
 * Update difficulty button states
 */
LuminaraQuiz.prototype.updateDifficultyButtons = function() {
  const hardBtn = document.getElementById('hardBtn');
  const nightmareBtn = document.getElementById('nightmareBtn');

  if (runManager?.isDifficultyUnlocked('hard')) {
    hardBtn?.classList.remove('locked');
  }

  if (runManager?.isDifficultyUnlocked('nightmare')) {
    nightmareBtn?.classList.remove('locked');
  }
};

/**
 * Start a Gauntlet run
 */
LuminaraQuiz.prototype.startGauntletRun = function(difficulty) {
  // Ensure managers are initialized
  if (!runManager) this.initGauntlet();

  // Check if difficulty is unlocked
  if (!runManager.isDifficultyUnlocked(difficulty)) {
    alert('This difficulty is locked. Complete more runs to unlock it!');
    return;
  }

  // Initialize run
  const run = runManager.startRun(difficulty);

  // Hide landing, show arena
  document.getElementById('gauntletLanding').style.display = 'none';
  document.getElementById('runProgressBar').style.display = 'flex';
  document.getElementById('gauntletArena').style.display = 'block';

  // Load questions for the run
  this.loadGauntletQuestions(difficulty);

  // Start first wave
  this.startGauntletWave();
};

/**
 * Load questions for Gauntlet mode
 * Uses QuestionOrchestrator exclusively (Single Source of Truth)
 */
LuminaraQuiz.prototype.loadGauntletQuestions = async function(difficulty) {
  console.log('[Gauntlet] Loading questions, difficulty:', difficulty);

  // Ensure orchestrator is initialized
  if (typeof questionOrchestrator === 'undefined') {
    throw new Error('[Gauntlet] QuestionOrchestrator not loaded - check script order in index.html');
  }

  if (!questionOrchestrator.initialized) {
    console.log('[Gauntlet] Waiting for orchestrator to initialize...');
    await questionOrchestrator.init();
  }

  // Load from all categories for gauntlet (roguelike variety)
  const allCategories = questionOrchestrator.registry?.categories || [];
  const categoryIds = allCategories.map(c => c.id);

  if (categoryIds.length === 0) {
    throw new Error('[Gauntlet] No categories in registry - check 820.31-question-registry.json');
  }

  // Load questions from multiple categories for variety
  const questionPromises = categoryIds.slice(0, 5).map(catId =>
    questionOrchestrator.loadQuestions({
      categoryId: catId,
      count: 50,  // Get good sample from each
      mode: 'gauntlet',
      difficulty: difficulty || 'adaptive',
      shuffle: true
    })
  );

  const results = await Promise.all(questionPromises);
  this.gauntletQuestions = results.flat();

  // Shuffle the combined pool
  this.shuffleArray(this.gauntletQuestions);

  console.log('[Gauntlet] Loaded', this.gauntletQuestions.length, 'questions from', categoryIds.slice(0, 5).length, 'categories');

  if (this.gauntletQuestions.length === 0) {
    throw new Error('[Gauntlet] No questions loaded - check registry and bank files');
  }

  this.gauntletQIndex = 0;
};

/**
 * Shuffle array utility
 */
LuminaraQuiz.prototype.shuffleArray = function(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

/**
 * Start a wave of questions
 */
LuminaraQuiz.prototype.startGauntletWave = function() {
  runManager.setPhase('questions');
  this.gauntletExplored = [];
  this.renderGauntletQuestion();
};

/**
 * Render current Gauntlet question
 */
LuminaraQuiz.prototype.renderGauntletQuestion = function() {
  const q = this.gauntletQuestions[this.gauntletQIndex % this.gauntletQuestions.length];
  const run = runManager.getRunSummary();

  // Update progress bar
  this.renderer.renderRunUI(run, powerUpManager?.getActivePowerUps() || []);

  const arena = document.getElementById('gauntletArena');
  arena.innerHTML = `
    <div class="question-card gauntlet-question">
      <div class="q-header">
        <span class="q-chapter">${q._category || q.chapter || ''}</span>
        <span class="phase-badge main">Wave ${run.wave}</span>
      </div>
      <div class="q-text">${this.renderer.renderText(q.q)}</div>
      <div class="options">
        ${q.options.map((opt, i) => {
          const explored = this.gauntletExplored.includes(i);
          const isCorrect = i === q.answer;
          let classes = 'option-btn';
          if (explored) {
            classes += isCorrect ? ' correct-answer' : ' wrong-answer';
          }
          return `<button class="${classes}" data-action="answer-gauntlet" data-option="${i}">${this.renderer.renderText(opt)}</button>`;
        }).join('')}
      </div>
    </div>
  `;

  // Attach event listeners to option buttons
  this.attachGauntletQuestionListeners();
};

/**
 * Attach event listeners to Gauntlet question buttons
 */
LuminaraQuiz.prototype.attachGauntletQuestionListeners = function() {
  const optionButtons = document.querySelectorAll('[data-action="answer-gauntlet"]');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const optIdx = parseInt(btn.dataset.option, 10);
      this.answerGauntlet(optIdx);
    });
  });
};

/**
 * Answer a Gauntlet question
 */
LuminaraQuiz.prototype.answerGauntlet = function(optIdx) {
  const q = this.gauntletQuestions[this.gauntletQIndex % this.gauntletQuestions.length];
  const isCorrect = optIdx === q.answer;
  const wasFirstTry = !this.gauntletExplored.includes(optIdx) && this.gauntletExplored.length === 0;

  this.gauntletExplored.push(optIdx);

  // Record the answer
  const result = runManager.recordAnswer(isCorrect, wasFirstTry);

  // Update UI
  this.renderGauntletQuestion();

  if (isCorrect) {
    // Correct answer - check damage multiplier from power-ups
    const damageMultiplier = powerUpManager?.getDamageMultiplier(runManager.activeRun.playerHP) || 1;

    // Award XP
    if (typeof gamification !== 'undefined') {
      gamification.processCorrectAnswer(q.id, { completedWarmups: false, exploredWrongFirst: !wasFirstTry });
    }

    // Tick power-ups
    powerUpManager?.tickPowerUps('question');

    // Move to next question after delay
    setTimeout(() => {
      if (result.waveComplete) {
        this.completeGauntletWave();
      } else {
        this.gauntletQIndex++;
        this.gauntletExplored = [];
        this.renderGauntletQuestion();
      }
    }, 800);
  } else {
    // Wrong answer in Gauntlet - just show feedback, no scaffold remediation
    // (Test Prep mode handles scaffolding separately)
  }
};

/**
 * Complete a wave
 */
LuminaraQuiz.prototype.completeGauntletWave = function() {
  const waveResult = runManager.completeWave();

  if (waveResult.triggersBoss) {
    // Boss fight!
    this.startBossFight();
  } else {
    // Continue to next wave
    this.gauntletQIndex++;
    this.gauntletExplored = [];
    this.startGauntletWave();
  }
};

/**
 * Start a boss fight
 */
LuminaraQuiz.prototype.startBossFight = function() {
  runManager.setPhase('boss');

  // Get a boss for this wave
  const run = runManager.getActiveRun();
  const bossId = bossManager.getAvailableBoss(run.bossesDefeated.map(b => b.bossId));

  if (!bossId) {
    // All bosses defeated - victory!
    this.endGauntletRun(true);
    return;
  }

  // Create boss encounter
  this.currentBossEncounter = bossManager.createEncounter(bossId, persistence?.getPlayer()?.level || 1);

  // Render boss arena
  this.renderer.renderBossEncounter(this.currentBossEncounter, runManager.getRunSummary());

  // Create battle controller
  this.bossBattle = {
    encounter: this.currentBossEncounter,

    playerAttack: () => {
      const result = this.currentBossEncounter.processPlayerAttack(d20System.attackBoss(
        this.currentBossEncounter.boss.armor,
        'intelligence'
      ));

      this.renderer.showBossDamage(result);

      setTimeout(() => {
        if (this.currentBossEncounter.isDefeated()) {
          this.defeatBoss();
        } else {
          this.bossCounterAttack();
        }
      }, 2200);
    },

    playerSpecial: () => {
      // Special ability - WIS based, can trigger weakness
      const roll = d20System.specialAbilityCheck('wisdom');
      const result = this.currentBossEncounter.processSpecialAbility(roll);

      // Show special result
      this.renderer.showDiceRoll(roll, 'Special Ability');

      setTimeout(() => {
        if (this.currentBossEncounter.isDefeated()) {
          this.defeatBoss();
        } else {
          this.bossCounterAttack();
        }
      }, 2500);
    },

    playerDefend: () => {
      // Defend - prepare for reduced damage
      this.currentBossEncounter.playerDefending = true;
      this.bossCounterAttack();
    },

    continueAfterBoss: () => {
      // Continue the run after boss defeat
      this.gauntletQIndex++;
      this.gauntletExplored = [];
      this.startGauntletWave();
    }
  };
};

/**
 * Boss counter attack
 */
LuminaraQuiz.prototype.bossCounterAttack = function() {
  const boss = this.currentBossEncounter.boss;
  const bossAttackPower = this.currentBossEncounter.getBossAttackPower();

  // Player defends
  const defenseResult = d20System.defendAgainstBoss(bossAttackPower);

  // Calculate damage
  let damageTaken = 0;
  if (!defenseResult.blocked) {
    damageTaken = Math.max(1, bossAttackPower - defenseResult.damageReduction);

    // Halve damage if defending
    if (this.currentBossEncounter.playerDefending) {
      damageTaken = Math.floor(damageTaken / 2);
      this.currentBossEncounter.playerDefending = false;
    }

    // Check for shield blocks
    if (powerUpManager?.getShieldBlocks() > 0) {
      powerUpManager.useShieldBlock();
      damageTaken = 0;
    }

    // Apply damage to run
    runManager.recordBossDamage(damageTaken, false);
  }

  defenseResult.damageTaken = damageTaken;
  defenseResult.attackPower = bossAttackPower;

  this.renderer.showBossAttack(defenseResult, boss.name);

  setTimeout(() => {
    // Check if player is defeated
    if (runManager.activeRun.playerHP <= 0) {
      this.endGauntletRun(false);
    } else {
      // Update boss arena
      this.renderer.renderBossEncounter(this.currentBossEncounter, runManager.getRunSummary());
    }
  }, 2700);
};

/**
 * Defeat a boss
 */
LuminaraQuiz.prototype.defeatBoss = function() {
  const boss = this.currentBossEncounter.boss;

  // Record defeat
  runManager.recordBossDefeat(boss.id, {
    battleTime: Date.now() - this.currentBossEncounter.battleStartTime,
    playerDamageDealt: this.currentBossEncounter.damageDealt
  });

  bossManager.recordDefeat(boss.id);

  // Generate loot
  const loot = lootSystem.generateBossLoot(boss.id, persistence?.getPlayer()?.level || 1, {
    damageDealt: this.currentBossEncounter.damageDealt,
    damageTaken: runManager.activeRun.totalDamageTaken,
    perfectVictory: runManager.activeRun.totalDamageTaken === 0
  });

  // Show defeat celebration
  this.renderer.showBossDefeat(boss, loot, runManager.getRunSummary());
};

/**
 * End a Gauntlet run
 */
LuminaraQuiz.prototype.endGauntletRun = function(victory = false) {
  // Complete the run
  const result = runManager.completeRun(victory);

  // Submit to high scores
  const runData = {
    score: result.completedRun.score,
    difficulty: result.completedRun.difficulty,
    wave: result.completedRun.wave,
    questionsAnswered: result.completedRun.questionsAnswered,
    correctFirstTry: result.completedRun.correctFirstTry,
    bestStreak: result.completedRun.bestStreakThisRun,
    bossesDefeated: result.completedRun.bossesDefeated.length,
    duration: Math.floor((result.completedRun.endTime - result.completedRun.startTime) / 1000),
    playerHP: result.completedRun.playerHP,
    victory,
    wrongAnswers: result.completedRun.wrongAnswers
  };

  const hsResult = highScoreManager.submitRun(runData);

  // Check power-up unlocks
  powerUpManager?.checkUnlocks({
    totalQuestions: persistence?.getPlayer()?.totalAnswered || 0,
    bossesDefeated: bossManager?.data?.totalDefeats || 0,
    completedRuns: runManager.data.completedRuns,
    correctFirstTry: result.completedRun.correctFirstTry,
    bestStreak: result.completedRun.bestStreakThisRun
  });

  // Clear run power-ups
  powerUpManager?.clearRunPowerUps();

  // Show run complete screen
  this.renderer.showRunComplete({
    ...runData,
    ...hsResult,
    tokensEarned: result.tokensEarned,
    difficulty: result.completedRun.difficulty
  });
};

/**
 * Return to Gauntlet landing
 */
LuminaraQuiz.prototype.returnToGauntletLanding = function() {
  document.getElementById('gauntletLanding').style.display = 'block';
  document.getElementById('runProgressBar').style.display = 'none';
  document.getElementById('gauntletArena').style.display = 'none';

  this.updateGauntletStats();
  this.updateDifficultyButtons();
};

/**
 * Buy a power-up
 */
LuminaraQuiz.prototype.buyPowerUp = function(powerUpId) {
  const result = powerUpManager.purchasePowerUp(powerUpId, runManager);

  if (result.success) {
    // Refresh shop display
    this.renderer.showPowerUpShop(runManager.data.arcadeTokens);
  } else {
    alert(result.reason);
  }
};

})(); // End IIFE wrapper
