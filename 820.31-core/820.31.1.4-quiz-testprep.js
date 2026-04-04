/**
 * Ms. Luminara Quiz - Test Prep Mode
 * Scaffolded question progression with lifelines
 * Extracted from 820.31.1-app.js for better maintainability
 * @version 2026-03-30
 */

// ═══════════════════════════════════════════════════════════════
// TEST PREP GAUNTLET
// ═══════════════════════════════════════════════════════════════

// Wait for LuminaraQuiz to be defined
(function() {
  if (typeof LuminaraQuiz === 'undefined') {
    console.error('[TestPrep] LuminaraQuiz not defined - ensure app.js loads first');
    return;
  }

/**
 * Test prep gauntlet state
 */
LuminaraQuiz.prototype.testPrepState = {
  questionRefs: [],     // Shuffled array of { folder, file, questionId, scaffoldFile }
  currentQuestion: null, // Currently loaded { mainQuestion, scaffolds }
  nextQuestion: null,   // Pre-fetched next question
  currentQIdx: 0,       // Current main question index
  currentSIdx: 0,       // Current scaffold index (0-6, 7 = main)
  totalScaffolds: 7,    // Scaffolds per main question
  totalQuestions: 0,    // Total count
  isLoading: false,
  // Lifelines
  lifelines: {
    fiftyFifty: 2,      // Eliminate 2 wrong answers
    hint: 2,            // Show hint before answering
    extraLife: 5        // 5 lives - free passes on wrong answers
  },
  extraLifeUsed: false, // Track if extra life was used this question
  streak: 0             // Correct answer streak (earn lifelines)
};

/**
 * Selected game mode: 'gauntlet' (pure skill, no power-ups) or 'arcade' (full RPG features)
 * Default to 'arcade' for backwards compatibility
 */
LuminaraQuiz.prototype.selectedMode = 'arcade';

/**
 * Select game mode (gauntlet or arcade)
 * Updates UI and stores selection for the next run
 */
LuminaraQuiz.prototype.selectMode = function(mode) {
  this.selectedMode = mode;

  // Update UI cards
  const gauntletCard = document.getElementById('modeCardGauntlet');
  const arcadeCard = document.getElementById('modeCardArcade');
  const indicator = document.getElementById('modeIndicator');

  if (gauntletCard) gauntletCard.classList.toggle('selected', mode === 'gauntlet');
  if (arcadeCard) arcadeCard.classList.toggle('selected', mode === 'arcade');

  if (indicator) {
    if (mode === 'gauntlet') {
      indicator.innerHTML = '<span class="mode-icon-small">⚔️</span> GAUNTLET MODE';
      indicator.style.color = 'var(--incorrect)';
      indicator.style.background = 'rgba(239, 68, 68, 0.1)';
    } else {
      indicator.innerHTML = '<span class="mode-icon-small">🎮</span> ARCADE MODE';
      indicator.style.color = 'var(--correct)';
      indicator.style.background = 'rgba(52, 211, 153, 0.1)';
    }
  }

  // Update lifelines bar visibility hint
  const lifelinesBar = document.getElementById('lifelinesBar');
  if (lifelinesBar) {
    lifelinesBar.dataset.mode = mode;
  }

  debugLog(`[Mode] Selected: ${mode}`);
};

/**
 * Initialize test prep module on mode switch
 */
LuminaraQuiz.prototype.initTestPrep = function() {
  // Ensure runManager is initialized
  if (!runManager) runManager = new RunManager();

  const bests = runManager.getTestPrepBests();

  // Calculate total available questions from registry
  let totalAvailable = 0;
  if (this.questionRegistry && this.questionRegistry.categories) {
    for (const cat of this.questionRegistry.categories) {
      for (const bank of cat.banks) {
        totalAvailable += bank.questionCount || 0;
      }
    }
  }
  if (totalAvailable === 0) totalAvailable = 311; // Fallback

  document.getElementById('tpBestPosition').textContent = `${bests.bestPosition}/${totalAvailable}`;
  document.getElementById('tpAttempts').textContent = bests.attempts;
  document.getElementById('tpCompletions').textContent = bests.completions;
};

/**
 * Start test prep gauntlet
 */
LuminaraQuiz.prototype.startTestPrepGauntlet = async function(topicFilter = null) {
  if (this.testPrepState.isLoading) return;
  this.testPrepState.isLoading = true;

  // Store topic filter and mode for this run
  this.testPrepState.topicFilter = topicFilter;
  this.testPrepState.mode = this.selectedMode; // 'gauntlet' or 'arcade'

  // Ensure runManager is initialized
  if (!runManager) runManager = new RunManager();

  // Show loading state
  const startBtn = document.querySelector('.testprep-start-btn');
  if (startBtn) startBtn.textContent = 'Building question list...';

  try {
    // Build shuffled list of question references (fast - no content loading)
    await this.buildQuestionRefList(topicFilter);

    // Initialize run manager with mode
    // For Test Prep, we use 'normal' difficulty by default
    runManager.startRun('normal', null, this.selectedMode);

    // Reset state
    this.testPrepState.currentQIdx = 0;
    this.testPrepState.currentSIdx = 0;
    this.testPrepState.currentQuestion = null;
    this.testPrepState.nextQuestion = null;

    // Reset lifelines (only used in arcade mode, but track anyway)
    this.testPrepState.lifelines = { fiftyFifty: 2, hint: 2, extraLife: 5 };
    this.testPrepState.extraLifeUsed = false;
    this.testPrepState.streak = 0;

    // Load first question
    if (startBtn) startBtn.textContent = 'Loading first question...';
    await this.loadTestPrepQuestion(0);

    // Hide landing, show active UI
    document.getElementById('testprepLanding').style.display = 'none';
    document.getElementById('testprepActive').style.display = 'block';
    document.getElementById('testprepGameOver').style.display = 'none';

    // Show/hide lifelines bar based on mode
    const lifelinesBar = document.getElementById('lifelinesBar');
    if (lifelinesBar) {
      lifelinesBar.style.display = this.selectedMode === 'gauntlet' ? 'none' : 'flex';
    }

    // Render D20 stats bar for Test Prep
    this.renderer.renderStatsBar();
    const testprepStatsBar = document.getElementById('testprepStatsBar');
    const mainStatsBar = document.getElementById('statsBar');
    if (testprepStatsBar && mainStatsBar) {
      testprepStatsBar.innerHTML = mainStatsBar.innerHTML;
    }

    // Render first question (scaffold 1)
    this.renderTestPrepQuestion();
    this.updateLifelineUI();

    // Pre-fetch next question in background
    this.prefetchNextQuestion();

  } catch (e) {
    console.error('Failed to start test prep:', e);
    alert('Failed to load questions. Please try again.');
  } finally {
    this.testPrepState.isLoading = false;
    if (startBtn) {
      const totalQ = this.testPrepState.totalQuestions || 311;
      startBtn.innerHTML = `<span class="btn-icon">🚀</span>Start Test Prep Gauntlet<span class="btn-subtitle">${totalQ} questions • 7 scaffolds each</span>`;
    }
  }
};

/**
 * Build shuffled list of question references
 * Uses QuestionOrchestrator exclusively (Single Source of Truth)
 * @param {string|null} topicFilter - Filter by topic prefix (e.g., '100' for brain)
 */
LuminaraQuiz.prototype.buildQuestionRefList = async function(topicFilter = null) {
  console.log('[TestPrep] Building question refs, filter:', topicFilter);

  // Ensure orchestrator is initialized
  if (typeof questionOrchestrator === 'undefined') {
    throw new Error('[TestPrep] QuestionOrchestrator not loaded - check script order in index.html');
  }

  if (!questionOrchestrator.initialized) {
    console.log('[TestPrep] Waiting for orchestrator to initialize...');
    await questionOrchestrator.init();
  }

  // Determine which categories to load based on filter
  // Registry uses category IDs like '000', '100', '200', etc.
  let categoryIds = [];
  if (topicFilter === 'exam') {
    // Exam topics: Brain, Nerves, ANS, Senses, Endocrine
    categoryIds = ['100', '200', '500', '600', '700'];
  } else if (topicFilter) {
    categoryIds = [topicFilter];
  } else {
    // All categories from registry
    categoryIds = (questionOrchestrator.registry?.categories || []).map(c => c.id);
  }

  if (categoryIds.length === 0) {
    throw new Error('[TestPrep] No categories found in registry');
  }

  // Load all questions from relevant categories
  const allQuestions = [];
  for (const catId of categoryIds) {
    const questions = await questionOrchestrator.loadQuestions({
      categoryId: catId,
      count: 0,  // All
      mode: 'testprep',
      shuffle: false  // We'll shuffle refs ourselves
    });
    allQuestions.push(...questions);
  }

  if (allQuestions.length === 0) {
    throw new Error(`[TestPrep] No questions loaded for categories: ${categoryIds.join(', ')}`);
  }

  // Build refs from loaded questions
  const refs = allQuestions.map(q => ({
    folder: q._categoryFolder || '',
    file: '',
    questionId: q.id,
    scaffoldFile: q.scaffoldFile || null,
    _cachedQuestion: q  // Cache the question to avoid re-fetching
  }));

  this.shuffleArray(refs);
  this.testPrepState.questionRefs = refs;
  this.testPrepState.totalQuestions = refs.length;
  console.log(`[TestPrep] Built ${refs.length} question refs from ${categoryIds.length} categories`);
};

/**
 * Load a specific question by index (lazy loading)
 * Uses cached question from orchestrator when available
 */
LuminaraQuiz.prototype.loadTestPrepQuestion = async function(idx) {
  const state = this.testPrepState;
  if (idx >= state.questionRefs.length) return null;

  const ref = state.questionRefs[idx];

  // Question must be cached from buildQuestionRefList
  if (!ref._cachedQuestion) {
    throw new Error(`[TestPrep] Question ${ref.questionId} not cached - buildQuestionRefList must run first`);
  }

  const mainQuestion = ref._cachedQuestion;
  console.log('[TestPrep] Loading question:', mainQuestion.id);

  // Load scaffolds
  let scaffolds = [];
  let allScaffolds = [];
  if (ref.scaffoldFile) {
    try {
      const scaffoldResp = await fetch(`${ref.folder}/${ref.scaffoldFile}`);
      if (scaffoldResp.ok) {
        const scaffoldData = await scaffoldResp.json();
        allScaffolds = scaffoldData.scaffolds || [];
      }
    } catch (e) {
      debugLog(`No scaffolds for ${ref.questionId}`);
    }
  }

  // Use adaptive engine to select scaffolds if available
  if (typeof adaptiveEngine !== 'undefined' && allScaffolds.length > 0) {
    const decision = adaptiveEngine.getScaffoldDecision(mainQuestion, allScaffolds);
    state.adaptiveDecision = decision;

    if (decision.skipToMain) {
      // Skip scaffolds entirely
      scaffolds = [];
      state.totalScaffolds = 0;
    } else {
      // Use adaptively selected scaffolds
      scaffolds = decision.selectedScaffolds.length > 0
        ? decision.selectedScaffolds
        : allScaffolds.slice(0, decision.scaffoldCount);
      state.totalScaffolds = scaffolds.length;
    }

    // Store mentor message for display
    state.currentMentorMessage = decision.mentorMessage;
    state.currentIntervention = decision.intervention;
  } else {
    // Fallback: use first 7 scaffolds
    scaffolds = allScaffolds.slice(0, 7);
    state.totalScaffolds = Math.min(7, scaffolds.length);
  }

  const questionData = { mainQuestion, scaffolds };

  // Store as current question
  state.currentQuestion = questionData;

  return questionData;
};

/**
 * Pre-fetch the next question in background
 */
LuminaraQuiz.prototype.prefetchNextQuestion = async function() {
  const state = this.testPrepState;
  const nextIdx = state.currentQIdx + 1;

  if (nextIdx >= state.questionRefs.length) {
    state.nextQuestion = null;
    return;
  }

  const ref = state.questionRefs[nextIdx];

  try {
    const response = await fetch(`${ref.folder}/${ref.file}`);
    const data = await response.json();
    const mainQuestion = data.questions.find(q => q.id === ref.questionId);

    let scaffolds = [];
    let allScaffolds = [];
    if (ref.scaffoldFile) {
      const scaffoldResp = await fetch(`${ref.folder}/${ref.scaffoldFile}`);
      if (scaffoldResp.ok) {
        const scaffoldData = await scaffoldResp.json();
        allScaffolds = scaffoldData.scaffolds || [];
      }
    }

    // For prefetch, use adaptive engine to pre-select scaffolds
    if (typeof adaptiveEngine !== 'undefined' && allScaffolds.length > 0) {
      const decision = adaptiveEngine.getScaffoldDecision(mainQuestion, allScaffolds);
      scaffolds = decision.skipToMain ? [] :
        (decision.selectedScaffolds.length > 0 ? decision.selectedScaffolds : allScaffolds.slice(0, decision.scaffoldCount));
    } else {
      scaffolds = allScaffolds.slice(0, 7);
    }

    state.nextQuestion = { mainQuestion, scaffolds };
  } catch (e) {
    state.nextQuestion = null;
  }
};

/**
 * Shuffle array in place (Fisher-Yates)
 */
LuminaraQuiz.prototype.shuffleArray = function(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Render current test prep question
 */
LuminaraQuiz.prototype.renderTestPrepQuestion = function() {
  const state = this.testPrepState;
  const bests = runManager.getTestPrepBests();

  // Use lazy-loaded current question
  const qData = state.currentQuestion;
  if (!qData) {
    console.error('No question loaded at index', state.currentQIdx);
    return;
  }

  const isMainQuestion = state.currentSIdx >= state.totalScaffolds || qData.scaffolds.length === 0;
  const currentQ = isMainQuestion ? qData.mainQuestion : qData.scaffolds[state.currentSIdx];

  if (!currentQ) {
    // No more scaffolds, move to main
    state.currentSIdx = state.totalScaffolds;
    this.renderTestPrepQuestion();
    return;
  }

  // Update progress bar
  const totalQuestions = state.totalQuestions;
  const progress = (state.currentQIdx / totalQuestions) * 100;
  const ghostProgress = (bests.bestPosition / totalQuestions) * 100;

  document.getElementById('testprepFill').style.width = `${progress}%`;
  document.getElementById('testprepGhost').style.width = `${ghostProgress}%`;
  document.getElementById('testprepProgressText').textContent = `Question ${state.currentQIdx + 1}/${totalQuestions}`;

  // Update scaffold indicator
  const typeEl = document.getElementById('testprepQuestionType');
  if (isMainQuestion) {
    document.getElementById('testprepScaffoldText').textContent = 'MAIN QUESTION';
    typeEl.innerHTML = '<span class="type-badge main">⚠️ MAIN QUESTION</span>';
  } else {
    const scaffoldNum = state.currentSIdx + 1;
    const totalScaff = Math.min(qData.scaffolds.length, state.totalScaffolds);
    document.getElementById('testprepScaffoldText').textContent = `Scaffold ${scaffoldNum}/${totalScaff}`;
    typeEl.innerHTML = `<span class="type-badge scaffold">Scaffold ${scaffoldNum}/${totalScaff}</span>`;
  }

  // Shuffle options for this question
  const optionsWithIndex = currentQ.options.map((opt, idx) => ({ text: opt, originalIdx: idx }));
  this.shuffleArray(optionsWithIndex);

  // Store the shuffled mapping so we can check answers correctly
  state.currentShuffledOptions = optionsWithIndex;
  state.currentShuffledAnswerIdx = optionsWithIndex.findIndex(o => o.originalIdx === currentQ.answer);

  // Get container and build content
  const container = document.getElementById('testprepQuestion');

  // Apply vocabulary highlighting if VocabHelper is loaded (v2.0 - linguistics-sound)
  const questionText = typeof VocabHelper !== 'undefined' && VocabHelper.loaded
    ? VocabHelper.highlightTermsInText(currentQ.q)
    : currentQ.q;

  // Build options HTML
  const optionsHTML = optionsWithIndex.map((opt, idx) => {
    return `<button class="option-btn" data-action="answer-testprep" data-idx="${idx}">${opt.text}</button>`;
  }).join('');

  // Build scaffold context hint button (only for scaffold questions)
  const scaffoldHintBtn = !isMainQuestion ? `
    <button class="scaffold-hint-btn" data-action="show-scaffold-hint">
      💡 Need Help?
    </button>
  ` : '';

  // Build D20 insight button (for main questions when d20System available)
  const d20InsightBtn = isMainQuestion && typeof d20System !== 'undefined' && d20System ? `
    <button class="insight-btn" data-action="roll-for-insight" ${d20System.canAfford(1) ? '' : 'disabled'}>
      🎲 Roll for Insight (1💡)
    </button>
  ` : '';

  // Build adaptive mentor message (show on first scaffold of each question)
  let mentorMessageHTML = '';
  if (state.currentSIdx === 0 && state.currentMentorMessage) {
    mentorMessageHTML = `
      <div class="adaptive-mentor-message luminara">
        <div class="mentor-speaker">Ms. Luminara</div>
        <p>${state.currentMentorMessage}</p>
      </div>
    `;
  }

  // Show intervention message if needed
  let interventionHTML = '';
  if (state.currentIntervention && state.currentSIdx === 0) {
    interventionHTML = `
      <div class="adaptive-intervention ${state.currentIntervention.type}">
        <span class="intervention-icon">💡</span>
        <p>${state.currentIntervention.message}</p>
      </div>
    `;
  }

  // Check if battle mode is enabled
  const useBattleMode = this.battleModeEnabled && typeof BattleScene !== 'undefined';

  if (useBattleMode) {
    // Initialize battle scene for this question's category
    // Only force new encounter when starting a new main question (scaffold 0)
    // Monster persists through all scaffolds until defeated
    const categoryPrefix = currentQ.id ? currentQ.id.substring(0, 3) : '000';
    const isNewMainQuestion = state.currentSIdx === 0;
    const forceNew = isNewMainQuestion && BattleScene.isMonsterDefeated();
    BattleScene.init(categoryPrefix, forceNew);

    // Build question HTML for battle scene
    const questionHTML = `
      ${mentorMessageHTML}
      ${interventionHTML}
      <div class="question-text">${questionText}</div>
      <div class="options-list">${optionsHTML}</div>
      ${scaffoldHintBtn}
      ${d20InsightBtn}
      <div id="testprepFeedback"></div>
    `;

    // Render battle scene with question
    // isScaffold = true if we're still on scaffolds, false if on main question
    const isScaffold = state.currentSIdx < state.totalScaffolds && !BattleScene.monsterWeakened;
    BattleScene.renderBattleFrame(container, currentQ, questionHTML, isScaffold);
  } else {
    // Standard rendering
    container.innerHTML = `
      ${mentorMessageHTML}
      ${interventionHTML}
      <div class="question-text">${questionText}</div>
      <div class="options-list">${optionsHTML}</div>
      ${scaffoldHintBtn}
      ${d20InsightBtn}
      <div id="testprepFeedback"></div>
    `;
  }

  // Attach event listeners after rendering
  this.attachTestPrepListeners();
};

/**
 * Attach event listeners after rendering test prep question
 */
LuminaraQuiz.prototype.attachTestPrepListeners = function() {
  const container = document.getElementById('testprepQuestion');
  if (!container) return;

  // Answer buttons
  container.querySelectorAll('[data-action="answer-testprep"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      this.answerTestPrep(idx);
    });
  });

  // Scaffold hint button
  const scaffoldHintBtn = container.querySelector('[data-action="show-scaffold-hint"]');
  if (scaffoldHintBtn) {
    scaffoldHintBtn.addEventListener('click', () => this.showScaffoldHint());
  }

  // D20 insight button
  const insightBtn = container.querySelector('[data-action="roll-for-insight"]');
  if (insightBtn && !insightBtn.disabled) {
    insightBtn.addEventListener('click', () => this.rollForInsight());
  }
};

/**
 * Toggle battle mode on/off
 */
LuminaraQuiz.prototype.toggleBattleMode = function() {
  this.battleModeEnabled = !this.battleModeEnabled;
  debugLog(`[Quiz] Battle mode ${this.battleModeEnabled ? 'enabled' : 'disabled'}`);

  // Re-render current question if in test prep
  if (this.testPrepState && this.testPrepState.currentQuestion) {
    this.renderTestPrepQuestion();
  }

  return this.battleModeEnabled;
};

/**
 * Handle test prep answer
 */
LuminaraQuiz.prototype.answerTestPrep = function(optIdx) {
  const state = this.testPrepState;
  const qData = state.currentQuestion;
  const isMainQuestion = state.currentSIdx >= state.totalScaffolds || qData.scaffolds.length === 0;
  const currentQ = isMainQuestion ? qData.mainQuestion : qData.scaffolds[state.currentSIdx];

  // Use shuffled answer position
  const correctShuffledIdx = state.currentShuffledAnswerIdx;
  const isCorrect = optIdx === correctShuffledIdx;

  // Record answer in adaptive engine for learning velocity tracking
  if (typeof adaptiveEngine !== 'undefined') {
    adaptiveEngine.recordAnswer(currentQ.id || `q${state.currentQIdx}`, isCorrect, 1);

    // Check if break should be suggested
    if (adaptiveEngine.shouldSuggestBreak() && !state.breakSuggested) {
      state.breakSuggested = true;
      this.showBreakSuggestion();
    }
  }

  // Get original indices for explanations
  const chosenOriginalIdx = state.currentShuffledOptions[optIdx].originalIdx;
  const correctOriginalIdx = currentQ.answer;

  // Disable all buttons
  const buttons = document.querySelectorAll('#testprepQuestion .option-btn');
  buttons.forEach((btn, idx) => {
    btn.classList.add('disabled');
    if (idx === correctShuffledIdx) {
      btn.classList.add('correct');
    } else if (idx === optIdx && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });

  // Show feedback
  const feedbackEl = document.getElementById('testprepFeedback');

  if (isMainQuestion) {
    // Main question logic
    const result = runManager.recordMainAnswer(isCorrect);

    if (isCorrect) {
      // Update streak
      state.streak++;
      this.checkStreakRewards();

      // SPACED REPETITION: Mark correct if was in wrong queue
      if (persistence.isInWrongQueue(currentQ.id)) {
        persistence.markCorrectAfterWrong(currentQ.id);
      }

      // BATTLE MODE: Main question correct = defeat the monster
      if (this.battleModeEnabled && typeof BattleScene !== 'undefined') {
        debugLog('[Battle] Main Q correct - defeating monster...');
        debugLog(`[Battle] currentMonster=${!!BattleScene.currentMonster}, monsterDefeated=${BattleScene.monsterDefeated}, battleActive=${BattleScene.battleActive}`);

        const hasMonster = BattleScene.currentMonster && !BattleScene.monsterDefeated;
        if (hasMonster) {
          // Ensure battle is active
          BattleScene.battleActive = true;

          const actualScaffolds = qData.scaffolds?.length || 0;
          debugLog(`[Battle] Defeating monster (${actualScaffolds} scaffolds)`);

          // Always use limitBreak to kill - it handles overkill bonus
          // For no scaffolds, full HP remaining = max overkill bonus
          BattleScene.limitBreak();
        } else {
          debugLog('[Battle] No monster to defeat or already defeated');
        }
      }

      feedbackEl.innerHTML = `<div class="feedback correct-feedback">
        <strong>Correct!</strong> ${currentQ.explain || ''}
        <div class="feedback-tap-hint">Tap anywhere to continue...</div>
      </div>`;

      // Wait for tap - user controls advancement
      let advanced = false;
      const advance = async () => {
        if (advanced) return;
        advanced = true;
        document.removeEventListener('click', advance);

        state.currentQIdx++;
        state.currentSIdx = 0;
        state.extraLifeUsed = false; // Reset for next question

        // Remove extra life indicator
        const extraLifeIndicator = document.querySelector('.extra-life-active');
        if (extraLifeIndicator) extraLifeIndicator.remove();

        if (state.currentQIdx >= state.totalQuestions) {
          // VICTORY!
          this.showTestPrepGameOver(result);
        } else {
          // Clear monster state for next question (force new spawn)
          if (typeof BattleScene !== 'undefined') {
            BattleScene.clearMonsterState();
          }

          // Use pre-fetched question or load it
          if (state.nextQuestion) {
            state.currentQuestion = state.nextQuestion;
            state.nextQuestion = null;
          } else {
            await this.loadTestPrepQuestion(state.currentQIdx);
          }
          this.renderTestPrepQuestion();
          this.updateLifelineUI();
          // Pre-fetch next
          this.prefetchNextQuestion();
        }
      };

      // Delay adding click listener to prevent bubbling from answer click
      // User controls when to advance - no auto-advance timer
      setTimeout(() => document.addEventListener('click', advance, { once: true }), 800);

    } else {
      // Check for extra life - auto-use if available
      if (state.extraLifeUsed || state.lifelines.extraLife > 0) {
        // Extra life saves you!
        if (!state.extraLifeUsed) {
          // Auto-consume extra life
          state.lifelines.extraLife--;
        }
        state.extraLifeUsed = false;
        state.streak = 0; // Reset streak

        // Remove indicator
        const extraLifeIndicator = document.querySelector('.extra-life-active');
        if (extraLifeIndicator) extraLifeIndicator.remove();

        const correctOption = currentQ.options[correctOriginalIdx];

        feedbackEl.innerHTML = `<div class="feedback incorrect-feedback">
          <strong>❤️ Extra Life Saved You!</strong><br><br>
          <strong>The correct answer was:</strong> ${correctOption}<br>
          ${currentQ.explain || ''}
          <div class="feedback-tap-hint">Tap anywhere to continue...</div>
        </div>`;

        // Continue to next question
        const advance = async () => {
          document.removeEventListener('click', advance);
          state.currentQIdx++;
          state.currentSIdx = 0;

          if (state.currentQIdx >= state.totalQuestions) {
            this.showTestPrepGameOver(result);
          } else {
            if (state.nextQuestion) {
              state.currentQuestion = state.nextQuestion;
              state.nextQuestion = null;
            } else {
              await this.loadTestPrepQuestion(state.currentQIdx);
            }
            this.renderTestPrepQuestion();
            this.updateLifelineUI();
            this.prefetchNextQuestion();
          }
        };

        // User controls when to advance - no auto-advance timer
        setTimeout(() => document.addEventListener('click', advance, { once: true }), 500);

      } else {
        // GAME OVER - Main question wrong
        state.streak = 0;

        // BATTLE MODE: DEVASTATING COUNTER - main question wrong = massive damage
        if (this.battleModeEnabled && typeof BattleScene !== 'undefined' && BattleScene.battleActive) {
          BattleScene.devastatingCounter();
        }

        // SPACED REPETITION: Add to wrong answer priority queue
        persistence.addToWrongQueue(currentQ.id);

        const correctOption = currentQ.options[correctOriginalIdx];
        const chosenOption = currentQ.options[chosenOriginalIdx];

        let explanation = '';

        // Try to get specific wrong explanation for chosen answer (use original index)
        if (currentQ.wrongExplains && currentQ.wrongExplains[chosenOriginalIdx]) {
          explanation += currentQ.wrongExplains[chosenOriginalIdx];
        } else if (currentQ.optionExplains) {
          const wrongExplain = currentQ.optionExplains.find(e => e.index === chosenOriginalIdx);
          if (wrongExplain) explanation += wrongExplain.text;
        }

        // Add correct answer explanation
        if (currentQ.explain) {
          if (explanation) explanation += '<br><br>';
          explanation += `<strong>The correct answer is:</strong> ${correctOption}<br>${currentQ.explain}`;
        } else {
          if (explanation) explanation += '<br><br>';
          explanation += `<strong>The correct answer is:</strong> ${correctOption}`;
        }

        feedbackEl.innerHTML = `<div class="feedback incorrect-feedback gameover-feedback">
          <strong>Incorrect!</strong><br><br>
          <strong>You chose:</strong> ${chosenOption}<br><br>
          ${explanation}
          <div class="feedback-tap-hint">Tap anywhere when ready...</div>
        </div>`;

        // Wait for tap before showing game over
        let advanced = false;
        const showGameOver = () => {
          if (advanced) return;
          advanced = true;
          document.removeEventListener('click', showGameOver);
          this.showTestPrepGameOver(result);
        };

        setTimeout(() => document.addEventListener('click', showGameOver, { once: true }), 800);
      }
    }

  } else {
    // Scaffold question logic
    const result = runManager.recordScaffoldAnswer(isCorrect);

    if (isCorrect) {
      // Update streak for scaffolds too
      state.streak++;
      this.checkStreakRewards();

      // BATTLE MODE: Player attacks monster
      let triggerMainQuestion = false;
      if (this.battleModeEnabled && typeof BattleScene !== 'undefined' && BattleScene.battleActive) {
        const attackResult = BattleScene.playerAttack();
        triggerMainQuestion = attackResult.triggerMainQuestion;
      }

      const explain = currentQ.explain || '';

      // Different feedback if this attack triggered the main question
      if (triggerMainQuestion) {
        feedbackEl.innerHTML = `<div class="feedback correct-feedback limit-break-ready">
          <strong>💥 LIMIT BREAK READY!</strong><br>
          ${explain}<br>
          <div class="feedback-tap-hint">Tap to deliver the final blow!</div>
        </div>`;
      } else {
        feedbackEl.innerHTML = `<div class="feedback correct-feedback">
          <strong>Correct!</strong> ${explain}
          <div class="feedback-tap-hint">Tap anywhere to continue...</div>
        </div>`;
      }

      // Wait for tap - user controls when to advance
      let advanced = false;
      const advance = () => {
        if (advanced) return;
        advanced = true;
        document.removeEventListener('click', advance);

        // If monster was weakened, skip to main question
        if (triggerMainQuestion) {
          state.currentSIdx = state.totalScaffolds; // Jump to main question
        } else {
          state.currentSIdx++;
        }
        this.renderTestPrepQuestion();
        this.updateLifelineUI();
      };

      setTimeout(() => document.addEventListener('click', advance, { once: true }), 800);

    } else {
      // Check for extra life on scaffold too - auto-use if available
      if (state.extraLifeUsed || state.lifelines.extraLife > 0) {
        if (!state.extraLifeUsed) {
          // Auto-consume extra life
          state.lifelines.extraLife--;
        }
        state.extraLifeUsed = false;
        state.streak = 0;

        const extraLifeIndicator = document.querySelector('.extra-life-active');
        if (extraLifeIndicator) extraLifeIndicator.remove();

        const correctOption = currentQ.options[correctOriginalIdx];

        feedbackEl.innerHTML = `<div class="feedback incorrect-feedback">
          <strong>❤️ Extra Life Saved You!</strong><br><br>
          <strong>The correct answer was:</strong> ${correctOption}<br>
          ${currentQ.explain || ''}
          <div class="feedback-tap-hint">Tap anywhere to continue...</div>
        </div>`;

        const advance = () => {
          document.removeEventListener('click', advance);
          state.currentSIdx++;
          this.renderTestPrepQuestion();
          this.updateLifelineUI();
        };

        // User controls when to advance - no auto-advance timer
        setTimeout(() => document.addEventListener('click', advance, { once: true }), 500);

      } else {
        // Wrong scaffold - GAME OVER
        state.streak = 0;

        // BATTLE MODE: Monster attacks with bonus damage for scaffold failure
        if (this.battleModeEnabled && typeof BattleScene !== 'undefined' && BattleScene.battleActive) {
          const bonusDamage = (BattleScene.currentMonster?.baseDamage || 10) * 1.5;
          BattleScene.animateMonsterAttack(Math.round(bonusDamage));
        }

        // SPACED REPETITION: Add main question to wrong queue (scaffold failure = main question needs review)
        const mainQ = state.currentQuestion.mainQuestion;
        if (mainQ && mainQ.id) {
          persistence.addToWrongQueue(mainQ.id);
        }

        const correctOption = currentQ.options[correctOriginalIdx];
        const chosenOption = currentQ.options[chosenOriginalIdx];

        let explanation = '';

        // Try to get specific wrong explanation for chosen answer (use original index)
        if (currentQ.wrongExplains && currentQ.wrongExplains[chosenOriginalIdx]) {
          explanation += currentQ.wrongExplains[chosenOriginalIdx];
        } else if (currentQ.optionExplains) {
          const wrongExplain = currentQ.optionExplains.find(e => e.index === chosenOriginalIdx);
          if (wrongExplain) explanation += wrongExplain.text;
        }

        // Add correct answer explanation
        if (currentQ.explain) {
          if (explanation) explanation += '<br><br>';
          explanation += `<strong>The correct answer is:</strong> ${correctOption}<br>${currentQ.explain}`;
        } else {
          if (explanation) explanation += '<br><br>';
          explanation += `<strong>The correct answer is:</strong> ${correctOption}`;
        }

        feedbackEl.innerHTML = `<div class="feedback incorrect-feedback gameover-feedback">
          <strong>Incorrect!</strong><br><br>
          <strong>You chose:</strong> ${chosenOption}<br><br>
          ${explanation}
          <div class="feedback-tap-hint">Tap anywhere when ready...</div>
        </div>`;

        // Mark as game over - wait for tap to show game over screen
        const gameOverResult = runManager.recordMainAnswer(false);

        let advanced = false;
        const showGameOver = () => {
          if (advanced) return;
          advanced = true;
          document.removeEventListener('click', showGameOver);
          this.showTestPrepGameOver(gameOverResult);
        };

        setTimeout(() => document.addEventListener('click', showGameOver, { once: true }), 800);
      }
    }
  }
};

/**
 * Show scaffold hint modal with context connecting scaffold to main question
 */
LuminaraQuiz.prototype.showScaffoldHint = function() {
  const state = this.testPrepState;
  const qData = state.currentQuestion;

  if (!qData || state.currentSIdx >= state.totalScaffolds) return;

  const scaffold = qData.scaffolds[state.currentSIdx];
  const mainQ = qData.mainQuestion;

  if (!scaffold || !mainQ) return;

  // Build hint from scaffold's mechanism or optionExplains
  let hint = '';
  if (scaffold.mechanism?.content) {
    hint = scaffold.mechanism.content.substring(0, 200) + '...';
  } else if (scaffold.optionExplains && scaffold.optionExplains[scaffold.answer]) {
    const correctExplain = scaffold.optionExplains[scaffold.answer];
    hint = (correctExplain.text || '').substring(0, 200) + '...';
  } else if (scaffold.explain) {
    hint = scaffold.explain.substring(0, 200) + '...';
  } else {
    hint = 'Think about the key terms in the question and what they relate to.';
  }

  // Show context connection to main question
  const mainQPreview = mainQ.q.substring(0, 100) + (mainQ.q.length > 100 ? '...' : '');

  // Create modal
  const modal = document.createElement('div');
  modal.className = 'hint-modal';
  modal.innerHTML = `
    <div class="hint-content">
      <h3>💡 Hint</h3>
      <p class="hint-text">${hint}</p>
      <div class="hint-context">
        <strong>This helps you understand:</strong><br>
        <em>"${mainQPreview}"</em>
      </div>
      <button class="hint-close-btn" data-action="close-hint-modal">Got it!</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Attach close button handler
  modal.querySelector('[data-action="close-hint-modal"]').addEventListener('click', () => modal.remove());

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};

/**
 * Toggle inline scaffold panel - opens/closes foundation questions below the main question
 * @param {HTMLElement} btn - The toggle button that was clicked
 */
LuminaraQuiz.prototype.toggleInlineScaffolds = async function(btn) {
  const container = btn.closest('.scaffold-inline-container');
  const panel = container.querySelector('.scaffold-inline-panel');
  const chevron = btn.querySelector('.scaffold-chevron');

  // Toggle visibility
  const isOpen = panel.style.display !== 'none';

  if (isOpen) {
    // Close panel
    panel.style.display = 'none';
    chevron.textContent = '▼';
    btn.classList.remove('open');
    return;
  }

  // Open panel
  panel.style.display = 'block';
  chevron.textContent = '▲';
  btn.classList.add('open');

  // Get the main question
  const question = this.currentQuiz[this.currentIdx];
  if (!question) return;

  // Load scaffolds if not already loaded
  if (!question.prereqs || question.prereqs.length === 0) {
    if (question.scaffoldFile && question._categoryFolder) {
      panel.innerHTML = '<div class="scaffold-loading">Loading foundation questions...</div>';
      await this.loadScaffoldsForQuestion(question, question._categoryFolder);
    }
  }

  const scaffolds = question.prereqs || [];
  if (scaffolds.length === 0) {
    panel.innerHTML = '<div class="scaffold-empty">No foundation questions available for this topic yet.</div>';
    return;
  }

  // Initialize inline scaffold state
  const state = {
    currentIdx: 0,
    answered: new Array(scaffolds.length).fill(null),
    scaffolds: scaffolds
  };

  // Store state on panel for reference
  panel._state = state;
  panel._quiz = this;

  // Render the inline scaffold content
  this.renderInlineScaffold(panel);
};

/**
 * Attach event listeners for inline scaffold panel
 * @param {HTMLElement} panel - The scaffold panel element
 */
LuminaraQuiz.prototype.attachInlineScaffoldListeners = function(panel) {
  const state = panel._state;
  const s = state.scaffolds[state.currentIdx];

  // Jump to scaffold via dots
  panel.querySelectorAll('[data-action="jump-inline-scaffold"]').forEach(dot => {
    dot.addEventListener('click', () => {
      state.currentIdx = parseInt(dot.dataset.idx);
      this.renderInlineScaffold(panel);
    });
  });

  // Answer scaffold question
  panel.querySelectorAll('[data-action="answer-inline-scaffold"]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedIdx = parseInt(btn.dataset.idx);
      const isCorrect = selectedIdx === s.answer;
      state.answered[state.currentIdx] = isCorrect;
      if (!isCorrect) panel._selectedWrong = selectedIdx;
      this.renderInlineScaffold(panel);
    });
  });

  // Navigation buttons
  const prevBtn = panel.querySelector('[data-action="inline-scaffold-prev"]');
  if (prevBtn && !prevBtn.disabled) {
    prevBtn.addEventListener('click', () => {
      if (state.currentIdx > 0) {
        state.currentIdx--;
        this.renderInlineScaffold(panel);
      }
    });
  }

  const nextBtn = panel.querySelector('[data-action="inline-scaffold-next"]');
  if (nextBtn && !nextBtn.disabled) {
    nextBtn.addEventListener('click', () => {
      if (state.currentIdx < state.scaffolds.length - 1) {
        state.currentIdx++;
        this.renderInlineScaffold(panel);
      }
    });
  }
};

/**
 * Render inline scaffold content
 * @param {HTMLElement} panel - The scaffold panel element
 */
LuminaraQuiz.prototype.renderInlineScaffold = function(panel) {
  const state = panel._state;
  const s = state.scaffolds[state.currentIdx];
  const totalCount = state.scaffolds.length;
  const correctCount = state.answered.filter(a => a === true).length;
  const currentAnswered = state.answered[state.currentIdx];

  // Build progress dots
  const progressDots = state.scaffolds.map((_, idx) => {
    let dotClass = 'scaffold-dot';
    if (idx === state.currentIdx) dotClass += ' current';
    if (state.answered[idx] === true) dotClass += ' correct';
    else if (state.answered[idx] === false) dotClass += ' wrong';
    return `<button class="${dotClass}" data-action="jump-inline-scaffold" data-idx="${idx}" aria-label="Question ${idx + 1}"></button>`;
  }).join('');

  // Build options
  const optionsHTML = s.options.map((opt, optIdx) => {
    let optClass = 'scaffold-answer-btn';
    if (currentAnswered !== null) {
      if (optIdx === s.answer) optClass += ' correct';
      else if (state.answered[state.currentIdx] === false && optIdx === panel._selectedWrong) optClass += ' wrong';
      optClass += ' answered';
    }
    return `<button class="${optClass}" data-action="answer-inline-scaffold" data-idx="${optIdx}" ${currentAnswered !== null ? 'disabled' : ''}>${this.renderText(opt)}</button>`;
  }).join('');


  // Explanation (only after answering)
  const explainHTML = currentAnswered !== null
    ? `<div class="scaffold-explanation">${this.renderText(s.explain || 'Correct!')}</div>`
    : '';

  panel.innerHTML = `
    <div class="scaffold-inline-content">
      <div class="scaffold-progress-bar">
        <div class="scaffold-dots">${progressDots}</div>
        <span class="scaffold-score">${correctCount}/${totalCount}</span>
      </div>
      <div class="scaffold-question-area">
        <div class="scaffold-q-number">${state.currentIdx + 1}.</div>
        <div class="scaffold-q-text">${this.renderText(s.q)}</div>
      </div>
      <div class="scaffold-answers">${optionsHTML}</div>
      ${explainHTML}
      <div class="scaffold-nav">
        <button class="scaffold-nav-prev" data-action="inline-scaffold-prev" ${state.currentIdx === 0 ? 'disabled' : ''}>← Prev</button>
        <button class="scaffold-nav-next" data-action="inline-scaffold-next" ${state.currentIdx >= totalCount - 1 ? 'disabled' : ''}>Next →</button>
      </div>
    </div>
  `;

  // Attach event listeners via delegation
  this.attachInlineScaffoldListeners(panel);
};

/**
 * Show scaffolds modal - displays all foundation/etymology questions for current question
 * Always uses the main question (not warmup prereqs)
 * @deprecated Use toggleInlineScaffolds instead
 */
LuminaraQuiz.prototype.showScaffoldsModal = async function() {
  // Always get the main question, not the current warmup prereq
  const question = this.currentQuiz[this.currentIdx];
  if (!question) return;

  debugLog('[Scaffold Modal] Opening for question:', question.id, 'scaffoldFile:', question.scaffoldFile);

  // Load scaffolds if not already loaded
  if (!question.prereqs || question.prereqs.length === 0) {
    if (question.scaffoldFile && question._categoryFolder) {
      await this.loadScaffoldsForQuestion(question, question._categoryFolder);
    }
  }

  const scaffolds = question.prereqs || [];
  if (scaffolds.length === 0) {
    // Show no scaffolds message
    const modal = document.createElement('div');
    modal.className = 'scaffolds-modal';
    modal.innerHTML = `
      <div class="scaffolds-modal-content">
        <div class="scaffolds-modal-header">
          <h2>📚 Foundation Questions</h2>
          <button class="scaffolds-close-btn" data-action="close-scaffolds-modal">×</button>
        </div>
        <div class="scaffolds-modal-body">
          <p class="no-scaffolds">No foundation questions available for this topic yet.</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('[data-action="close-scaffolds-modal"]').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    return;
  }

  // Create interactive scaffold modal - user answers questions one at a time
  const modal = document.createElement('div');
  modal.className = 'scaffolds-modal';

  // Track state for this modal session
  const modalState = {
    currentIdx: 0,
    answered: new Array(scaffolds.length).fill(null), // null = unanswered, true = correct, false = wrong
    scaffolds: scaffolds
  };

  // Store on modal for access
  modal._state = modalState;
  modal._question = question;
  modal._quiz = this;

  const renderModalContent = () => {
    const s = modalState.scaffolds[modalState.currentIdx];
    const totalCount = modalState.scaffolds.length;
    const answeredCount = modalState.answered.filter(a => a !== null).length;
    const correctCount = modalState.answered.filter(a => a === true).length;
    const currentAnswered = modalState.answered[modalState.currentIdx];

    // Build progress dots
    const progressDots = modalState.scaffolds.map((_, idx) => {
      const state = modalState.answered[idx];
      let dotClass = 'scaffold-progress-dot';
      if (idx === modalState.currentIdx) dotClass += ' current';
      if (state === true) dotClass += ' correct';
      else if (state === false) dotClass += ' wrong';
      return `<div class="${dotClass}" data-action="jump-modal-scaffold" data-idx="${idx}"></div>`;
    }).join('');

    // Build options - clickable if not yet answered
    const optionsHTML = s.options.map((opt, optIdx) => {
      let optClass = 'scaffold-option-btn';
      if (currentAnswered !== null) {
        // Already answered - show result
        if (optIdx === s.answer) optClass += ' correct';
        else if (modalState.answered[modalState.currentIdx] === false && optIdx === modal._selectedWrong) optClass += ' wrong';
        optClass += ' disabled';
      }
      return `<button class="${optClass}" data-action="answer-modal-scaffold" data-idx="${optIdx}" ${currentAnswered !== null ? 'disabled' : ''}>${this.renderText(opt)}</button>`;
    }).join('');

    // Show explanation only after answering
    const explainHTML = currentAnswered !== null ?
      `<div class="scaffold-explain-box">${this.renderText(s.explain || 'Correct!')}</div>` : '';

    modal.innerHTML = `
      <div class="scaffolds-modal-content">
        <div class="scaffolds-modal-header">
          <h2>📚 Foundation Questions</h2>
          <button class="scaffolds-close-btn" data-action="close-scaffolds-modal">×</button>
        </div>
        <div class="scaffolds-modal-target">
          <strong>Building toward:</strong> "${this.renderText(modal._question.q)}"
        </div>
        <div class="scaffolds-progress">
          ${progressDots}
          <span class="scaffolds-progress-text">${correctCount}/${totalCount} correct</span>
        </div>
        <div class="scaffolds-modal-body">
          <div class="scaffold-item active">
            <div class="scaffold-number">${modalState.currentIdx + 1}</div>
            <div class="scaffold-content">
              <div class="scaffold-question">${this.renderText(s.q)}</div>
              <div class="scaffold-options-interactive">${optionsHTML}</div>
              ${explainHTML}
            </div>
          </div>
        </div>
        <div class="scaffolds-modal-footer">
          <button class="scaffold-nav-btn prev" data-action="modal-scaffold-prev" ${modalState.currentIdx === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="scaffold-nav-btn skip" data-action="modal-scaffold-skip">Skip</button>
          <button class="scaffold-nav-btn next" data-action="modal-scaffold-next" ${modalState.currentIdx >= totalCount - 1 ? 'disabled' : ''}>${modalState.currentIdx >= totalCount - 1 ? 'Done' : 'Next →'}</button>
        </div>
      </div>
    `;

    // Attach event listeners via delegation
    attachModalScaffoldListeners();
  };

  // Helper to attach all modal event listeners after render
  const attachModalScaffoldListeners = () => {
    const s = modalState.scaffolds[modalState.currentIdx];

    // Close button
    const closeBtn = modal.querySelector('[data-action="close-scaffolds-modal"]');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());

    // Progress dots
    modal.querySelectorAll('[data-action="jump-modal-scaffold"]').forEach(dot => {
      dot.addEventListener('click', () => modal._jumpTo(parseInt(dot.dataset.idx)));
    });

    // Answer options
    modal.querySelectorAll('[data-action="answer-modal-scaffold"]:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.dataset.idx);
        const isCorrect = selectedIdx === s.answer;
        modalState.answered[modalState.currentIdx] = isCorrect;
        if (!isCorrect) modal._selectedWrong = selectedIdx;
        renderModalContent();
      });
    });

    // Navigation buttons
    const prevBtn = modal.querySelector('[data-action="modal-scaffold-prev"]');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', () => modal._prev());
    }

    const skipBtn = modal.querySelector('[data-action="modal-scaffold-skip"]');
    if (skipBtn) skipBtn.addEventListener('click', () => modal._skip());

    const nextBtn = modal.querySelector('[data-action="modal-scaffold-next"]');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', () => modal._next());
    }
  };

  // Navigation methods
  modal._prev = () => {
    if (modalState.currentIdx > 0) {
      modalState.currentIdx--;
      renderModalContent();
    }
  };

  modal._next = () => {
    if (modalState.currentIdx < modalState.scaffolds.length - 1) {
      modalState.currentIdx++;
      renderModalContent();
    } else {
      // Done - close modal
      modal.remove();
    }
  };

  modal._skip = () => {
    // Skip marks as unanswered but moves forward
    if (modalState.currentIdx < modalState.scaffolds.length - 1) {
      modalState.currentIdx++;
      renderModalContent();
    } else {
      modal.remove();
    }
  };

  modal._jumpTo = (idx) => {
    modalState.currentIdx = idx;
    renderModalContent();
  };

  // Initial render
  renderModalContent();
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
};

// Helper for escaping HTML in modal
LuminaraQuiz.prototype.escapeHtml = function(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper for rendering text with math support
LuminaraQuiz.prototype.renderText = function(text) {
  if (!text) return '';
  // Use MathRenderer if available, otherwise escape
  if (typeof MathRenderer !== 'undefined' && MathRenderer.state?.katexLoaded) {
    return MathRenderer.render(text);
  }
  return this.escapeHtml(text);
};

/**
 * Show test prep game over screen
 */
LuminaraQuiz.prototype.showTestPrepGameOver = function(summary) {
  document.getElementById('testprepActive').style.display = 'none';

  const goEl = document.getElementById('testprepGameOver');
  goEl.style.display = 'flex';

  // Title
  const titleEl = document.getElementById('testprepGameOverTitle');
  if (summary.isVictory) {
    titleEl.textContent = '🎉 VICTORY! 🎉';
    titleEl.classList.add('victory');
  } else {
    titleEl.textContent = 'GAME OVER';
    titleEl.classList.remove('victory');
  }

  // Stats
  document.getElementById('goReached').textContent = `${summary.position}/${summary.totalQuestions}`;
  document.getElementById('goPercent').textContent = `(${summary.percent}%)`;
  document.getElementById('goBest').textContent = `${summary.bestPosition}/${summary.totalQuestions}`;
  document.getElementById('goBestPercent').textContent = `(${summary.bestPercent}%)`;

  // Progress bars
  document.getElementById('goFill').style.width = `${summary.percent}%`;
  document.getElementById('goGhost').style.width = `${summary.bestPercent}%`;

  if (summary.isVictory) {
    document.getElementById('goFill').classList.add('victory');
  } else {
    document.getElementById('goFill').classList.remove('victory');
  }

  // Details
  document.getElementById('goScaffolds').textContent = summary.scaffoldsCompleted;
  document.getElementById('goTime').textContent = summary.durationFormatted;
  document.getElementById('goRetries').textContent = summary.scaffoldRetries;
};

/**
 * Exit test prep back to landing
 */
LuminaraQuiz.prototype.exitTestPrep = function() {
  document.getElementById('testprepGameOver').style.display = 'none';
  document.getElementById('testprepActive').style.display = 'none';
  document.getElementById('testprepLanding').style.display = 'block';

  // Remove extra life indicator if present
  const extraLifeIndicator = document.querySelector('.extra-life-active');
  if (extraLifeIndicator) extraLifeIndicator.remove();

  // Reset adaptive engine session
  if (typeof adaptiveEngine !== 'undefined') {
    adaptiveEngine.resetSession();
  }

  // Refresh stats
  this.initTestPrep();
};

/**
 * Show break suggestion modal
 */
LuminaraQuiz.prototype.showBreakSuggestion = function() {
  const message = typeof adaptiveEngine !== 'undefined'
    ? adaptiveEngine.getBreakMessage()
    : "You've been working hard! Consider taking a short break.";

  const modal = document.createElement('div');
  modal.className = 'break-suggestion';
  modal.innerHTML = `
    <div class="break-suggestion-content">
      <h3>🧘 Time for a Break?</h3>
      <p>${message}</p>
      <div class="break-suggestion-actions">
        <button class="break-btn take-break" data-action="take-break">Take 5 Minutes</button>
        <button class="break-btn continue" data-action="close-break-modal">Keep Going</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Attach event listeners
  modal.querySelector('[data-action="take-break"]').addEventListener('click', () => this.takeBreak());
  modal.querySelector('[data-action="close-break-modal"]').addEventListener('click', () => modal.remove());
};

/**
 * Handle taking a break
 */
LuminaraQuiz.prototype.takeBreak = function() {
  // Remove modal
  const modal = document.querySelector('.break-suggestion');
  if (modal) modal.remove();

  // Could implement a timer here, for now just acknowledge
  alert('Take your time! Your progress is saved. Come back when you\'re ready.');
};

/**
 * Update lifeline UI
 */
LuminaraQuiz.prototype.updateLifelineUI = function() {
  const state = this.testPrepState;

  // Update counts
  document.getElementById('count5050').textContent = state.lifelines.fiftyFifty;
  document.getElementById('countHint').textContent = state.lifelines.hint;
  document.getElementById('countExtraLife').textContent = state.lifelines.extraLife;

  // Update button states
  document.getElementById('lifeline5050').classList.toggle('disabled', state.lifelines.fiftyFifty <= 0);
  document.getElementById('lifelineHint').classList.toggle('disabled', state.lifelines.hint <= 0);
  document.getElementById('lifelineExtraLife').classList.toggle('disabled', state.lifelines.extraLife <= 0 || state.extraLifeUsed);

  // Show streak if > 0
  const streakDisplay = document.getElementById('streakDisplay');
  if (state.streak >= 3) {
    streakDisplay.style.display = 'flex';
    document.getElementById('streakCount').textContent = state.streak;
  } else {
    streakDisplay.style.display = 'none';
  }
};

/**
 * Use 50/50 lifeline - eliminate 2 wrong answers
 * Blocked in gauntlet mode
 */
LuminaraQuiz.prototype.useFiftyFifty = function() {
  const state = this.testPrepState;

  // Block in gauntlet mode
  if (state.mode === 'gauntlet') {
    if (this.renderer) {
      this.renderer.showNotification({
        icon: '⚔️',
        title: 'Gauntlet Mode',
        message: 'Power-ups disabled in pure skill mode!',
        type: 'warning'
      });
    }
    return;
  }

  if (state.lifelines.fiftyFifty <= 0) return;

  const buttons = document.querySelectorAll('#testprepQuestion .option-btn:not(.eliminated)');
  const correctIdx = state.currentShuffledAnswerIdx;

  // Find wrong answer buttons
  const wrongButtons = [];
  buttons.forEach((btn, idx) => {
    if (idx !== correctIdx && !btn.classList.contains('eliminated')) {
      wrongButtons.push(btn);
    }
  });

  // Eliminate 2 random wrong answers
  this.shuffleArray(wrongButtons);
  const toEliminate = wrongButtons.slice(0, 2);
  toEliminate.forEach(btn => btn.classList.add('eliminated'));

  state.lifelines.fiftyFifty--;
  this.updateLifelineUI();
};

/**
 * Use Hint lifeline - show explanation before answering
 * Blocked in gauntlet mode
 */
LuminaraQuiz.prototype.useHint = function() {
  const state = this.testPrepState;

  // Block in gauntlet mode
  if (state.mode === 'gauntlet') {
    if (this.renderer) {
      this.renderer.showNotification({
        icon: '⚔️',
        title: 'Gauntlet Mode',
        message: 'Power-ups disabled in pure skill mode!',
        type: 'warning'
      });
    }
    return;
  }

  if (state.lifelines.hint <= 0) return;

  const qData = state.currentQuestion;
  const isMainQuestion = state.currentSIdx >= state.totalScaffolds || qData.scaffolds.length === 0;
  const currentQ = isMainQuestion ? qData.mainQuestion : qData.scaffolds[state.currentSIdx];

  // Show hint above question
  const questionContainer = document.getElementById('testprepQuestion');
  const existingHint = questionContainer.querySelector('.hint-display');
  if (existingHint) return; // Already showing hint

  const hintText = currentQ.explain || currentQ.mechanism?.content || 'Think carefully about this one!';

  const hintDiv = document.createElement('div');
  hintDiv.className = 'hint-display';
  hintDiv.innerHTML = `<div class="hint-label">💡 Hint:</div>${hintText}`;
  questionContainer.insertBefore(hintDiv, questionContainer.firstChild);

  state.lifelines.hint--;
  this.updateLifelineUI();
};

/**
 * Use Extra Life - protect from one wrong answer
 * Blocked in gauntlet mode
 */
LuminaraQuiz.prototype.useExtraLife = function() {
  const state = this.testPrepState;

  // Block in gauntlet mode
  if (state.mode === 'gauntlet') {
    if (this.renderer) {
      this.renderer.showNotification({
        icon: '⚔️',
        title: 'Gauntlet Mode',
        message: 'Power-ups disabled in pure skill mode!',
        type: 'warning'
      });
    }
    return;
  }

  if (state.lifelines.extraLife <= 0 || state.extraLifeUsed) return;

  state.extraLifeUsed = true;
  state.lifelines.extraLife--;

  // Show indicator
  const indicator = document.createElement('div');
  indicator.className = 'extra-life-active';
  indicator.innerHTML = '❤️ Extra Life Active';
  document.body.appendChild(indicator);

  this.updateLifelineUI();
};

/**
 * Award lifelines based on streak
 */
LuminaraQuiz.prototype.checkStreakRewards = function() {
  const state = this.testPrepState;

  // Award lifelines at certain streaks
  if (state.streak === 5) {
    state.lifelines.hint++;
    this.showStreakReward('💡 +1 Hint!');
  } else if (state.streak === 10) {
    state.lifelines.fiftyFifty++;
    this.showStreakReward('🎯 +1 50/50!');
  } else if (state.streak === 20) {
    state.lifelines.extraLife++;
    this.showStreakReward('❤️ +1 Extra Life!');
  }

  this.updateLifelineUI();
};

/**
 * Show streak reward notification
 */
LuminaraQuiz.prototype.showStreakReward = function(text) {
  const notification = document.createElement('div');
  notification.className = 'streak-reward-notification';
  notification.innerHTML = `🔥 ${this.testPrepState.streak} streak! ${text}`;
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #1a1a2e;
    padding: 1rem 2rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1.2rem;
    z-index: 1000;
    animation: fadeInOut 2s forwards;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
};

// Hook into mode switching for Gauntlet and Test Prep
if (typeof QuizModes !== 'undefined') {
  const originalSwitchMode = QuizModes.switchMode.bind(QuizModes);
  QuizModes.switchMode = function(mode) {
    originalSwitchMode(mode);

    if (mode === 'gauntlet' && quiz) {
      quiz.initGauntlet();
    }
    if (mode === 'testprep' && quiz) {
      quiz.initTestPrep();
    }
  };
}

})(); // End IIFE wrapper
