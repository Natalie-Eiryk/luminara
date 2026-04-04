/**
 * Ms. Luminara Quiz - Map Mode (Slay the Spire-style Roguelike)
 * Extracted from 820.31.1-app.js for better maintainability
 * @version 2026-03-31
 */

// ═══════════════════════════════════════════════════════════════════════════
// MAP MODE - Slay the Spire-style Roguelike
// ═══════════════════════════════════════════════════════════════════════════

// Wait for LuminaraQuiz to be defined
(function() {
  if (typeof LuminaraQuiz === 'undefined') {
    console.error('[MapMode] LuminaraQuiz not defined - ensure app.js loads first');
    return;
  }

/**
 * Initialize the map mode system
 */
LuminaraQuiz.prototype.initMapMode = function() {
  // Initialize the map renderer
  if (!MapRenderer.init('map-container')) {
    console.error('[MapMode] Failed to initialize renderer');
    return;
  }

  // Set up callbacks
  MapRenderer.onNodeSelect = (node) => this.handleMapNodeSelect(node);
  MapRenderer.onMenuSelect = () => this.exitMapMode();

  // Initialize map mode state
  this.mapModeState = {
    active: false,
    runState: {
      hp: 80,
      maxHp: 100,
      gold: 0,
      potions: PotionSystem.getInventory(),
      deckSize: 10,
      consecutiveWrong: 0,
      criticalState: false
    }
  };

  debugLog('[MapMode] Initialized');
};

/**
 * Start a new map-based roguelike run
 * Shows topic selector first, then starts the actual run
 * @param {string} runLength - 'quick', 'standard', or 'epic'
 * @param {string} startCategory - Optional starting category ID (bypasses selector if provided)
 */
LuminaraQuiz.prototype.startMapRun = function(runLength = 'standard', startCategory = null) {
  // If a specific category is provided, skip the selector
  if (startCategory) {
    this._startMapRunInternal(runLength, [startCategory]);
    return;
  }

  // Show topic selector
  if (typeof TopicSelector !== 'undefined') {
    const self = this;
    TopicSelector.show(runLength, function(selection) {
      // selection = { runType: 'standard', categoryIds: ['100', '200', ...] }
      self._startMapRunInternal(selection.runType, selection.categoryIds);
    });
  } else {
    // Fallback if TopicSelector not loaded - use all categories
    console.warn('[MapMode] TopicSelector not loaded, starting with all categories');
    this._startMapRunInternal(runLength, null);
  }
};

/**
 * Internal function to actually start the map run
 * @param {string} runLength - 'quick', 'standard', or 'epic'
 * @param {Array<string>} categoryIds - Array of selected category IDs
 */
LuminaraQuiz.prototype._startMapRunInternal = function(runLength = 'standard', categoryIds = null) {
  // Initialize if needed
  if (!this.mapModeState) {
    this.initMapMode();
  }

  // Store selected categories for question loading
  this.mapModeState.selectedCategories = categoryIds;
  debugLog('[MapMode] Selected categories:', categoryIds);

  // Start the act system
  const run = ActSystem.startRun(runLength, categoryIds ? categoryIds[0] : null);

  // RUNMANAGER INTEGRATION: Start a tracked run
  if (typeof runManager !== 'undefined' && runManager) {
    // Map run lengths to difficulty for RunManager
    const difficultyMap = {
      'quick': 'easy',
      'standard': 'normal',
      'epic': 'hard'
    };
    const difficulty = difficultyMap[runLength] || 'normal';
    runManager.startRun(difficulty, categoryIds ? categoryIds[0] : null, 'arcade');
    debugLog('[MapMode] RunManager tracking started');
  }

  // Reset player state
  this.mapModeState.runState = {
    hp: 100,
    maxHp: 100,
    gold: 0,
    potions: [],
    deckSize: 10,
    consecutiveWrong: 0,
    criticalState: false,
    questionsAnswered: 0,
    correctAnswers: 0,
    firstTryCorrect: 0
  };

  // Reset map node progression for new run
  if (typeof MapRenderer !== 'undefined' && MapRenderer.resetNodeProgress) {
    MapRenderer.resetNodeProgress();
  }

  // Reset potions
  PotionSystem.reset();

  // GAMIFICATION: Reset combo and start fresh session
  if (typeof gamification !== 'undefined') {
    gamification.resetCombo();
  }

  // Generate the first act's map
  const map = ActSystem.generateCurrentActMap();

  // Show the map
  this.enterMapMode();
  MapRenderer.render(map, this.mapModeState.runState);

  // STORY ENGINE: Check if this map has an associated story
  if (typeof StoryEngine !== 'undefined') {
    const actNumber = ActSystem.getCurrentAct()?.actNumber || 1;
    const mapIds = { 1: 'verdant-wilds', 2: 'infernal-peaks', 3: 'frozen-fortress', 4: 'desert-sands', 5: 'swamp-jungle', 6: 'floating-islands', 7: 'crystal-caverns' };
    const mapId = mapIds[actNumber];

    if (mapId && StoryEngine.hasStory(mapId)) {
      StoryEngine.startStory(mapId);
      StoryEngine.showMetersHUD();
      debugLog('[MapMode] Story started for map:', mapId);
    }
  }

  debugLog('[MapMode] Started', runLength, 'run');
};

/**
 * Enter map mode (show map UI)
 */
LuminaraQuiz.prototype.enterMapMode = function() {
  this.mapModeState.active = true;
  MapRenderer.show();

  // Hide other UI
  document.querySelectorAll('.module-container').forEach(m => {
    m.classList.remove('active');
    m.style.display = 'none';
  });
};

/**
 * Exit map mode (return to menu)
 */
LuminaraQuiz.prototype.exitMapMode = function() {
  this.mapModeState.active = false;
  MapRenderer.hide();

  // Hide any overlays
  const combatContainer = document.getElementById('parchment-combat') || document.getElementById('map-combat-container');
  if (combatContainer) combatContainer.style.display = 'none';
  if (typeof QuestionPresenter !== 'undefined') QuestionPresenter.hide();

  const transitionContainer = document.getElementById('act-transition-container');
  if (transitionContainer) transitionContainer.style.display = 'none';

  // STORY ENGINE: End active story and hide meters
  if (typeof StoryEngine !== 'undefined' && StoryEngine.getState().active) {
    StoryEngine.endStory();
    StoryEngine.hideMetersHUD();
    debugLog('[MapMode] Story ended');
  }

  // RUNMANAGER INTEGRATION: Abandon any active run
  if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
    runManager.abandonRun();
    debugLog('[MapMode] Run abandoned');
  }

  // Reset ActSystem
  ActSystem.reset();

  // Show study module
  const studyModule = document.getElementById('module-study');
  if (studyModule) {
    studyModule.classList.add('active');
    studyModule.style.display = 'block';
  }
};

/**
 * Handle node selection on the map
 * @param {Object} node - The selected node
 */
LuminaraQuiz.prototype.handleMapNodeSelect = function(node) {
  console.log('[MapMode] === handleMapNodeSelect CALLED ===');
  console.log('[MapMode] node:', node);
  debugLog('[MapMode] Node selected:', node.type, node.id);

  const self = this;

  // STORY ENGINE: Show story dialogue for this node before proceeding
  if (typeof StoryEngine !== 'undefined' && StoryEngine.getState().active) {
    const nodeStory = StoryEngine.getNodeStory(node.id || 0);
    if (nodeStory && nodeStory.type !== 'encounter') {
      // Narration nodes show dialogue then proceed
      StoryEngine.showDialogue(nodeStory.title, nodeStory.text, function() {
        self._proceedWithNodeAction(node);
      });
      return;
    } else if (nodeStory && nodeStory.type === 'boss_intro') {
      // Boss intro shows special dialogue then starts boss
      const bossIntro = StoryEngine.getBossIntro();
      StoryEngine.showDialogue('Ms. Luminara', bossIntro.text, function() {
        self._proceedWithNodeAction(node);
      });
      return;
    }
    // Encounter nodes proceed directly - story shown after question
  }

  this._proceedWithNodeAction(node);
};

/**
 * Execute the actual node action (after story dialogue if any)
 */
LuminaraQuiz.prototype._proceedWithNodeAction = function(node) {
  switch (node.type) {
    case 'combat':
      this.startMapCombat(node);
      break;
    case 'elite':
      this.startMapCombat(node, true);
      break;
    case 'rest':
      this.showRestSite(node);
      break;
    case 'shop':
      this.showShop(node);
      break;
    case 'treasure':
      this.showTreasure(node);
      break;
    case 'mystery':
      this.triggerMysteryEvent(node);
      break;
    case 'boss':
      this.startMapBossBattle(node);
      break;
    default:
      console.warn('[MapMode] Unknown node type:', node.type);
  }
};

/**
 * Play page turn transition animation
 * @param {string} direction - 'in' (entering combat) or 'out' (returning to map)
 * @param {Object} encounterInfo - Info to display on page (icon, type, name)
 * @returns {Promise} Resolves when animation completes
 */
LuminaraQuiz.prototype.playPageTurnTransition = function(direction, encounterInfo = {}) {
  return new Promise(resolve => {
    // Create overlay if not exists
    let overlay = document.getElementById('page-turn-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'page-turn-overlay';
      overlay.className = 'page-turn-overlay';
      document.body.appendChild(overlay);
    }

    // Build page content
    overlay.innerHTML = `
      <div class="page-turn-page">
        <div class="page-turn-title">
          <span class="encounter-icon">${encounterInfo.icon || '⚔️'}</span>
          <div class="encounter-type">${encounterInfo.type || 'Combat'}</div>
          <div class="encounter-name">${encounterInfo.name || 'Unknown Enemy'}</div>
        </div>
      </div>
    `;

    // Reset and play animation
    overlay.style.display = 'block';
    overlay.classList.remove('turning-in', 'turning-out');

    // Force reflow
    void overlay.offsetWidth;

    overlay.classList.add(`turning-${direction}`);

    // Clean up after animation
    setTimeout(() => {
      // Hide overlay for BOTH directions (in = entering combat, out = returning to map)
      overlay.style.display = 'none';
      overlay.classList.remove('turning-in', 'turning-out');
      resolve();
    }, 650);
  });
};

/**
 * Start combat at a map node
 * @param {Object} node - Combat node data
 * @param {boolean} isElite - Whether this is an elite encounter
 */
LuminaraQuiz.prototype.startMapCombat = function(node, isElite = false) {
  console.log('[MapCombat] === startMapCombat CALLED ===');
  console.log('[MapCombat] node:', node);
  console.log('[MapCombat] node.categoryId:', node.categoryId);
  debugLog('[MapMode] startMapCombat - node:', node);
  debugLog('[MapMode] startMapCombat - node.categoryId:', node.categoryId);

  // Get monster info first for the transition
  const monster = this.getMonsterForCategory(node.categoryId, isElite);

  // Play page turn transition
  this.playPageTurnTransition('in', {
    icon: isElite ? '💀' : '⚔️',
    type: isElite ? 'Elite Encounter' : 'Combat',
    name: monster.name
  }).then(() => {
    MapRenderer.hide();
  });

  // Initialize battle scene state
  const questionCount = node.questionCount || (isElite ? 6 : 4);
  const monsterLevel = node.monsterLevel || 1;

  // monster already declared above for transition

  // Load questions for this category
  console.log('[MapCombat] About to call loadMapCombatQuestions...');
  this.loadMapCombatQuestions(node.categoryId, questionCount).then(questions => {
    console.log('[MapCombat] === QUESTIONS LOADED ===');
    console.log('[MapCombat] questions array:', questions);
    console.log('[MapCombat] questions.length:', questions?.length);

    // CRITICAL: If no questions loaded, show error and return to map
    if (!questions || questions.length === 0) {
      console.error('[MapCombat] NO QUESTIONS LOADED for category:', node.categoryId);
      alert(`No questions found for category "${node.categoryId}". Check the question registry and bank files.`);
      this.exitMapMode();
      return;
    }

    // Calculate HP based on monster template + level scaling
    const baseHp = monster.baseHP || (isElite ? 60 : 40);
    const scaledHp = baseHp + (monsterLevel * (isElite ? 15 : 10));

    // Store combat state
    this.mapCombatState = {
      node: node,
      isElite: isElite,
      monster: monster,
      questions: questions,
      currentIndex: 0,
      totalRounds: 0, // Track total rounds for display (questions reshuffle when depleted)
      wrongQuestionIds: new Set(), // Track IDs of questions answered wrong for priority reshuffling
      monsterHp: scaledHp,
      monsterMaxHp: scaledHp,
      damagePerCorrect: 10 + PotionSystem.getStrengthBonus(),
      // Damage is now rolled with d20 on each wrong answer, not a flat value
      damagePerWrong: 'd20' // Marker to indicate d20 roll system
    };

    // Start combat
    PotionSystem.startCombat();
    this.renderMapCombat();
  }).catch(err => {
    console.error('[MapCombat] FATAL ERROR:', err);
    alert('Combat failed to load: ' + err.message);
  });
};

/**
 * Get a themed monster for the category from BattleScene
 */
LuminaraQuiz.prototype.getMonsterForCategory = function(categoryId, isElite) {
  // Try to get from BattleScene
  if (typeof BattleScene !== 'undefined' && BattleScene.monsters) {
    const monster = BattleScene.monsters[categoryId];
    if (monster) {
      return {
        ...monster,
        isElite: isElite,
        name: isElite ? `Elite ${monster.name}` : monster.name
      };
    }
  }

  // Fallback monsters by category with expanded taunts
  const fallbackMonsters = {
    '000': {
      name: 'Cell Slime',
      color: '#4ade80',
      baseHP: 40,
      baseDamage: 5,
      taunts: [
        'My membrane is impervious!',
        'You cannot penetrate my phospholipid bilayer!',
        'Organelles, assemble!',
        'I shall divide and conquer!'
      ],
      desperateTaunts: [
        'My cytoplasm... leaking...',
        'The mitochondria... failing...',
        'Lysosomes... activated...'
      ],
      confidentTaunts: [
        'Your ATP reserves are depleted!',
        'Soon you will undergo apoptosis!',
        'My ribosomes synthesize your defeat!'
      ],
      frustratedTaunts: [
        'How do you keep penetrating my membrane?!',
        'Stop disrupting my homeostasis!',
        'Impossible! My defenses were perfect!'
      ]
    },
    '100': {
      name: 'Mind Flayer',
      color: '#a855f7',
      baseHP: 60,
      baseDamage: 8,
      taunts: [
        'Your neurons are mine!',
        'I sense your synaptic weakness!',
        'The brain stem bows to me!',
        'Your action potentials betray you!'
      ],
      desperateTaunts: [
        'My neural network... fragmenting...',
        'The connections... severing...',
        'Cannot... maintain... consciousness...'
      ],
      confidentTaunts: [
        'Your gray matter fades!',
        'I feast on your memories!',
        'Your cerebrum submits!'
      ],
      frustratedTaunts: [
        'Your knowledge shields you well!',
        'Impossible neuroplasticity!',
        'Stop thinking so clearly!'
      ]
    },
    '200': {
      name: 'Synapse Serpent',
      color: '#3b82f6',
      baseHP: 50,
      baseDamage: 7,
      taunts: [
        'Feel my neurotoxic bite!',
        'Your reflexes are too slow!',
        'I slither through your neural pathways!',
        'Acetylcholine cannot save you!'
      ],
      desperateTaunts: [
        'My venom glands... empty...',
        'The signal... not transmitting...',
        'Refractory period... too long...'
      ],
      confidentTaunts: [
        'Your motor neurons fail you!',
        'Paralysis approaches!',
        'No signal can escape me!'
      ],
      frustratedTaunts: [
        'Your synapses fire too fast!',
        'How is your transmission so efficient?!',
        'Stop depolarizing!'
      ]
    },
    '400': {
      name: 'Tissue Titan',
      color: '#f97316',
      baseHP: 80,
      baseDamage: 10,
      taunts: [
        'I am the connective force!',
        'Collagen flows through my veins!',
        'Your epithelium is fragile!',
        'I bind all things together!'
      ],
      desperateTaunts: [
        'My fibers... tearing...',
        'The matrix... dissolving...',
        'Structural integrity... compromised...'
      ],
      confidentTaunts: [
        'Your tissues will be mine!',
        'I shall absorb your cells!',
        'Resistance is futile, flesh-thing!'
      ],
      frustratedTaunts: [
        'Your cellular cohesion is impressive!',
        'How do you regenerate so quickly?!',
        'My collagen cannot contain you!'
      ]
    },
    '500': {
      name: 'Autonomic Horror',
      color: '#ef4444',
      baseHP: 70,
      baseDamage: 9,
      taunts: [
        'Fight or flight? Neither!',
        'Your heart rate is mine to control!',
        'The vagus nerve obeys ME!',
        'Breathe your last!'
      ],
      desperateTaunts: [
        'My parasympathetic... failing...',
        'Cannot... regulate...',
        'Homeostasis... lost...'
      ],
      confidentTaunts: [
        'Your blood pressure plummets!',
        'Sympathetic overdrive engaged!',
        'Your organs betray you!'
      ],
      frustratedTaunts: [
        'How do you stay so calm?!',
        'Your autonomic control is inhuman!',
        'Stop regulating yourself!'
      ]
    },
    '600': {
      name: 'Sensory Specter',
      color: '#06b6d4',
      baseHP: 55,
      baseDamage: 6,
      taunts: [
        'Can you see me coming?',
        'Your senses deceive you!',
        'I am in your blind spot!',
        'Proprioception fails you here!'
      ],
      desperateTaunts: [
        'My photoreceptors... dimming...',
        'The signals... scrambling...',
        'Cannot... perceive...'
      ],
      confidentTaunts: [
        'Darkness claims your vision!',
        'Your cochlea crumbles!',
        'No sense can save you now!'
      ],
      frustratedTaunts: [
        'Your perception is too acute!',
        'How do you sense my attacks?!',
        'Your receptors adapt too quickly!'
      ]
    },
    '700': {
      name: 'Hormone Demon',
      color: '#8b5cf6',
      baseHP: 65,
      baseDamage: 8,
      taunts: [
        'Your glands betray you!',
        'Cortisol floods your system!',
        'The pituitary bends to my will!',
        'Endocrine chaos awaits!'
      ],
      desperateTaunts: [
        'My receptors... desensitizing...',
        'Hormone levels... crashing...',
        'The feedback loop... broken...'
      ],
      confidentTaunts: [
        'Adrenaline surge incoming!',
        'Your thyroid is mine!',
        'Insulin resistance achieved!'
      ],
      frustratedTaunts: [
        'Your homeostasis is infuriating!',
        'How are your hormones so balanced?!',
        'Stop self-regulating!'
      ]
    },
    '900': {
      name: 'Breath Stealer',
      color: '#22d3ee',
      baseHP: 60,
      baseDamage: 7,
      taunts: [
        'Your bronchioles constrict!',
        'The alveoli collapse!',
        'No gas exchange for you!',
        'Breathe your last breath!'
      ],
      desperateTaunts: [
        'My respiratory drive... failing...',
        'The diaphragm... weakening...',
        'Cannot... ventilate...'
      ],
      confidentTaunts: [
        'Your tidal volume drops!',
        'Hypoxia approaches!',
        'The pleura tears!'
      ],
      frustratedTaunts: [
        'Your lungs are too efficient!',
        'How is your oxygenation so stable?!',
        'Stop breathing so effectively!'
      ]
    },
    '510': {
      name: 'Number Nightmare',
      color: '#fbbf24',
      baseHP: 55,
      baseDamage: 6,
      taunts: [
        'Your calculations are flawed!',
        'Division by zero awaits!',
        'The equation defeats you!',
        'Numbers dance beyond your grasp!'
      ],
      desperateTaunts: [
        'My variables... undefined...',
        'The solution... diverging...',
        'Cannot... compute...'
      ],
      confidentTaunts: [
        'Your fractions shall reduce to nothing!',
        'Algebraic doom approaches!',
        'Your logic is unsound!'
      ],
      frustratedTaunts: [
        'Your arithmetic is impeccable!',
        'How do you solve so quickly?!',
        'Stop being so rational!'
      ]
    }
  };

  const fallback = fallbackMonsters[categoryId] || {
    name: 'Anatomy Phantom',
    color: '#6b7280',
    baseHP: 50,
    baseDamage: 7,
    taunts: [
      'Test your knowledge!',
      'Anatomy is my domain!',
      'Can you name my parts?',
      'The body holds many secrets!'
    ],
    desperateTaunts: [
      'My form... fading...',
      'You know too much...',
      'Impossible...'
    ],
    confidentTaunts: [
      'Your knowledge fails you!',
      'Anatomy eludes your grasp!',
      'Study harder, mortal!'
    ],
    frustratedTaunts: [
      'You studied well!',
      'How do you know so much?!',
      'Textbooks were your ally!'
    ]
  };

  return {
    ...fallback,
    isElite: isElite,
    name: isElite ? `Elite ${fallback.name}` : fallback.name
  };
};

/**
 * Load questions for map combat
 * Uses QuestionOrchestrator exclusively (Single Source of Truth)
 * If user selected specific categories, loads from those; otherwise uses the node's category
 */
LuminaraQuiz.prototype.loadMapCombatQuestions = async function(categoryId, count) {
  console.log('[MapCombat] loadMapCombatQuestions called with categoryId:', categoryId, 'count:', count);

  // Ensure orchestrator is initialized
  if (typeof questionOrchestrator === 'undefined') {
    throw new Error('[MapCombat] QuestionOrchestrator not loaded - check script order in index.html');
  }

  if (!questionOrchestrator.initialized) {
    console.log('[MapCombat] Waiting for orchestrator to initialize...');
    await questionOrchestrator.init();
  }

  // Check if user selected specific categories
  const selectedCategories = this.mapModeState?.selectedCategories;
  let allQuestions = [];

  if (selectedCategories && selectedCategories.length > 0) {
    // Load from user-selected categories
    console.log('[MapCombat] Loading from user-selected categories:', selectedCategories);

    // Load proportionally from each selected category
    const questionsPerCategory = Math.ceil(count / selectedCategories.length);

    for (const catId of selectedCategories) {
      try {
        const questions = await questionOrchestrator.loadQuestions({
          categoryId: catId,
          count: questionsPerCategory,
          mode: 'map',
          difficulty: 'adaptive',
          includeReview: true,
          shuffle: true
        });

        // Tag questions with category info
        questions.forEach(q => {
          q._category = catId;
        });

        allQuestions = allQuestions.concat(questions);
      } catch (err) {
        console.warn('[MapCombat] Failed to load questions from category', catId, err);
      }
    }

    // Shuffle the combined pool
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    // Trim to requested count
    allQuestions = allQuestions.slice(0, count);

  } else {
    // Fallback to node's category (original behavior)
    const questions = await questionOrchestrator.loadQuestions({
      categoryId: categoryId,
      count: count,
      mode: 'map',
      difficulty: 'adaptive',
      includeReview: true,
      shuffle: true
    });

    // Tag questions with category info
    questions.forEach(q => {
      q._category = categoryId;
    });

    allQuestions = questions;
  }

  console.log('[MapCombat] Orchestrator returned', allQuestions.length, 'questions');

  if (allQuestions.length === 0) {
    throw new Error(`[MapCombat] No questions loaded - check registry and bank files`);
  }

  return allQuestions;
};

/**
 * Render the current map combat state (Slay the Spire style)
 * Features: Battle arena, monster display, answer cards as attack options
 */
LuminaraQuiz.prototype.renderMapCombat = function() {
  const state = this.mapCombatState;

  // If we've gone through all questions, reshuffle and continue
  // Battle continues until monster HP reaches 0
  if (state.currentIndex >= state.questions.length) {
    // Prioritize questions the player got wrong - put them first
    const wrongQs = state.questions.filter(q => state.wrongQuestionIds?.has(q.id));
    const correctQs = state.questions.filter(q => !state.wrongQuestionIds?.has(q.id));

    // Shuffle each group separately (Fisher-Yates)
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Wrong questions first, then correct ones
    state.questions = [...shuffle(wrongQs), ...shuffle(correctQs)];
    state.currentIndex = 0;
    debugLog('[MapCombat] Questions reshuffled - wrong questions prioritized:', wrongQs.length, 'wrong,', correctQs.length, 'correct');
  }

  const q = state.questions[state.currentIndex];

  if (!q) {
    console.error('[MapCombat] No question at index', state.currentIndex);
    this.onMapCombatVictory();
    return;
  }

  if (!q.options || !Array.isArray(q.options)) {
    console.error('[MapCombat] Question missing options array:', q);
    throw new Error('[MapCombat] Question missing options array - check question format');
  }

  // Create combat container if not exists - use fresh ID to avoid CSS conflicts
  let combatContainer = document.getElementById('parchment-combat');
  if (!combatContainer) {
    combatContainer = document.createElement('div');
    combatContainer.id = 'parchment-combat';
    document.body.appendChild(combatContainer);
  }
  // NUKE any old combat containers
  const oldContainer = document.getElementById('map-combat-container');
  if (oldContainer) oldContainer.remove();

  // Reset all styles - no classes, pure inline
  combatContainer.style.cssText = 'display:block;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;';

  const hpPercent = Math.round((state.monsterHp / state.monsterMaxHp) * 100);
  const playerHpPercent = Math.round((this.mapModeState.runState.hp / this.mapModeState.runState.maxHp) * 100);

  // Get monster info
  const monster = state.monster || { name: 'Enemy', color: '#6b7280', taunts: [] };
  const monsterIcon = state.isElite ? '💀' : '⚔️';

  // Show a random taunt occasionally
  const showTaunt = state.currentIndex === 0 && monster.taunts && monster.taunts.length > 0;
  const randomTaunt = showTaunt ? monster.taunts[Math.floor(Math.random() * monster.taunts.length)] : null;

  // Combo display - player damage is also d20 based
  const combo = typeof gamification !== 'undefined' ? gamification.comboState.count : 0;
  const comboBonus = combo >= 2 ? `+${combo}` : '';
  const strengthBonus = PotionSystem.getStrengthBonus();
  const strDisplay = strengthBonus > 0 ? `+${strengthBonus}` : '';
  const playerDamageDisplay = `1d20${strDisplay}${comboBonus}`;

  // Enemy intent - shows what they'll do if you answer wrong (d20 roll system)
  const enemyDamageDisplay = '1d20';
  const criticalBonus = this.mapModeState.runState.criticalState ? '+10' : '';

  // Card letters, colors, and keyboard shortcuts
  const cardColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
  const cardLetters = ['A', 'B', 'C', 'D'];
  const cardKeys = ['1', '2', '3', '4'];

  // Card types based on question difficulty or random assignment
  const cardTypes = ['ATTACK', 'ATTACK', 'ATTACK', 'ATTACK'];
  const cardTypeIcons = { 'ATTACK': '⚔️', 'DEFEND': '🛡️', 'SKILL': '✨', 'POWER': '💫' };

  // Card rarity based on question stats (spaced repetition data)
  const getCardRarity = (index) => {
    const qId = q.id || `q_${state.currentIndex}`;
    const stats = this.getQuestionStats(qId);
    if (!stats) return 'common';
    const accuracy = stats.correct / Math.max(1, stats.attempts);
    if (accuracy < 0.3) return 'epic';    // Hard questions = epic
    if (accuracy < 0.5) return 'rare';    // Medium-hard = rare
    if (accuracy < 0.7) return 'uncommon'; // Medium = uncommon
    return 'common';
  };

  // Combo class for visual escalation
  const comboClass = combo >= 10 ? 'combo-10' : combo >= 5 ? 'combo-5' : combo >= 3 ? 'combo-3' : combo >= 2 ? 'combo-2' : '';

  // Progress calculation - estimate questions needed to defeat monster
  const avgDamagePerQuestion = 10 + strengthBonus + Math.floor(combo / 2);
  const questionsRemaining = Math.ceil(state.monsterHp / avgDamagePerQuestion);
  const progressPercent = Math.round((1 - (state.monsterHp / state.monsterMaxHp)) * 100);

  // Monster desperate state (low HP)
  const monsterDesperate = hpPercent < 25;

  // Extended monster taunts based on state
  const getTaunt = () => {
    if (!monster.taunts || monster.taunts.length === 0) return null;
    // First round - intro taunt
    if (state.currentIndex === 0) {
      return monster.taunts[Math.floor(Math.random() * monster.taunts.length)];
    }
    // Desperate state - special taunt
    if (monsterDesperate && monster.desperateTaunts) {
      return monster.desperateTaunts[Math.floor(Math.random() * monster.desperateTaunts.length)];
    }
    // Player low HP - confident taunt
    if (playerHpPercent < 30 && monster.confidentTaunts) {
      return monster.confidentTaunts[Math.floor(Math.random() * monster.confidentTaunts.length)];
    }
    // High combo - frustrated taunt
    if (combo >= 5 && monster.frustratedTaunts) {
      return monster.frustratedTaunts[Math.floor(Math.random() * monster.frustratedTaunts.length)];
    }
    // 20% chance of random taunt
    if (Math.random() < 0.2) {
      return monster.taunts[Math.floor(Math.random() * monster.taunts.length)];
    }
    return null;
  };

  const activeTaunt = getTaunt();

  // Hide the old combat container - QuestionPresenter handles its own display
  combatContainer.style.display = 'none';

  // Use QuestionPresenter for beautiful scroll-based questions
  if (typeof QuestionPresenter !== 'undefined') {
    const self = this;
    QuestionPresenter.present({
      question: q,
      category: q._category || q.chapter || '',
      round: (state.totalRounds || 0) + 1,
      playerStats: {
        hp: this.mapModeState.runState.hp,
        maxHp: this.mapModeState.runState.maxHp,
        damage: playerDamageDisplay
      },
      monsterStats: {
        name: monster.name,
        hp: state.monsterHp,
        maxHp: state.monsterMaxHp,
        icon: monsterIcon
      },
      onAnswer: function(index, isCorrect) {
        // Process answer - DON'T hide presenter yet, let renderMapCombat handle transitions
        // This prevents flicker between questions
        self.handleMapCombatAnswer(index);
      },
      onBack: function() {
        // Return to map without penalty - just exit combat view
        QuestionPresenter.hide();
        self.returnToMap();
      },
      onFlee: function() {
        // Flee from combat - take damage penalty and return to map
        QuestionPresenter.hide();
        const fleeDamage = Math.ceil(self.mapModeState.runState.maxHp * 0.15); // 15% max HP penalty
        self.mapModeState.runState.hp = Math.max(1, self.mapModeState.runState.hp - fleeDamage);
        console.log('[MapCombat] Fled combat, took', fleeDamage, 'damage. HP now:', self.mapModeState.runState.hp);
        self.returnToMap();
      }
    });
  } else {
    // Fallback to simple inline UI if QuestionPresenter not loaded
    console.warn('[MapCombat] QuestionPresenter not loaded, using fallback');
    combatContainer.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#1a1a2e;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">
        <div style="background:#d4a574;border:4px solid #8b5a2b;border-radius:8px;padding:30px;max-width:600px;width:90%;">
          <div style="color:#2c1810;font-size:18px;text-align:center;margin-bottom:20px;">${this.renderer.renderText(q.q)}</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${q.options.map((opt, i) => `
              <button class="combat-fallback-option" data-answer-index="${i}" style="padding:12px;background:#f4e4bc;border:2px solid #8b5a2b;border-radius:6px;cursor:pointer;font-size:16px;text-align:left;">
                ${cardLetters[i]}: ${this.renderer.renderText(opt)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    // Attach event listeners after DOM update
    this.attachMapEventListeners();
  }
};

/**
 * Handle answer in map combat (STS-style)
 */
LuminaraQuiz.prototype.handleMapCombatAnswer = function(answerIndex) {
  const state = this.mapCombatState;
  const q = state.questions[state.currentIndex];

  // Find the answer element - support both legacy and STS cards
  let answerEl = document.querySelector(`.sts-answer-card[data-card-index="${answerIndex}"]`)
               || document.querySelectorAll('.combat-question-card .option-btn')[answerIndex];

  // Get correct answer index - handle both 'correct' and 'answer' field names
  const correctIndex = q.correct !== undefined ? q.correct : q.answer;

  // Check for auto-correct potion
  if (PotionSystem.consumeAutoCorrect()) {
    answerIndex = correctIndex;
    this.showMapCombatFeedback('🍀 Lucky Elixir activated!', true);
  }

  const isCorrect = answerIndex === correctIndex;
  const wasFirstTry = !state.answeredCurrentQuestion;
  state.answeredCurrentQuestion = true;

  ActSystem.recordQuestion(isCorrect);

  // STORY ENGINE: Record answer for narrative tracking
  if (typeof StoryEngine !== 'undefined' && StoryEngine.getState().active) {
    if (isCorrect) {
      StoryEngine.recordCorrectAnswer();
    } else {
      StoryEngine.recordWrongAnswer();
    }
    StoryEngine.showMetersHUD(); // Update meters display
  }

  // RUNMANAGER INTEGRATION: Track answer
  this.mapModeState.runState.questionsAnswered++;
  if (isCorrect) {
    this.mapModeState.runState.correctAnswers++;
    if (wasFirstTry) {
      this.mapModeState.runState.firstTryCorrect++;
    }
  }

  if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
    runManager.recordAnswer(isCorrect, wasFirstTry);
  }

  // GAMIFICATION: Update combo and track XP
  if (typeof gamification !== 'undefined') {
    gamification.updateCombo(isCorrect);
  }

  if (isCorrect) {
    // STS Card Animation: Add played class
    if (answerEl && answerEl.classList.contains('sts-answer-card')) {
      answerEl.classList.add('card-played');
    }

    // SCREEN EFFECTS: Visual feedback for correct answer
    if (typeof ScreenEffects !== 'undefined' && answerEl) {
      ScreenEffects.flashCorrect(answerEl);
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playCorrect) {
      SoundSystem.playCorrect();
    }

    // Monster hit animation
    const monsterEl = document.getElementById('stsMonster');
    if (monsterEl) {
      monsterEl.classList.add('hit');
      setTimeout(() => monsterEl.classList.remove('hit'), 300);
    }

    // Calculate damage with d20 roll
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    let damage = d20Roll;
    let isCrit = d20Roll === 20;
    const isFumble = d20Roll === 1;

    // Add strength bonus from potions
    const strengthBonus = PotionSystem.getStrengthBonus();
    damage += strengthBonus;

    // Natural 20 = double damage, Natural 1 = minimum damage
    if (isCrit) {
      damage = d20Roll * 2 + strengthBonus;
    } else if (isFumble) {
      damage = 1 + strengthBonus; // Fumble still does minimum damage
    }

    // GAMIFICATION: Combo adds flat bonus damage
    const combo = typeof gamification !== 'undefined' ? gamification.comboState.count : 0;
    if (combo >= 2) {
      damage += combo;
    }

    // Apply damage
    state.monsterHp -= damage;
    this.mapModeState.runState.consecutiveWrong = 0;
    this.mapModeState.runState.criticalState = false;

    // Record question attempt for spaced repetition
    const qId = q.id || `q_${state.currentIndex}`;
    this.recordQuestionAttempt(qId, true);

    // SCREEN EFFECTS: Damage number and shake
    // Try STS monster first, fallback to legacy
    const stsMonsterEl = document.getElementById('stsMonster');
    const legacyMonsterEl = document.querySelector('.combat-monster');
    const monsterDisplayEl = stsMonsterEl || legacyMonsterEl;

    // Build damage breakdown string
    let breakdownParts = [`d20: ${d20Roll}`];
    if (strengthBonus > 0) breakdownParts.push(`STR: +${strengthBonus}`);
    if (combo >= 2) breakdownParts.push(`Combo: +${combo}`);
    if (isCrit) breakdownParts.push('CRIT: x2');
    const breakdown = breakdownParts.join(' | ');

    // Show floating damage number
    this.showDamageNumber(monsterDisplayEl, damage, false, isCrit, breakdown);

    if (typeof ScreenEffects !== 'undefined' && monsterDisplayEl) {
      if (isCrit) {
        ScreenEffects.showCrit(monsterDisplayEl, damage);
      } else {
        ScreenEffects.showDamage(monsterDisplayEl, damage);
        if (damage > 15) ScreenEffects.shake('normal');
      }
    }

    // Play card play sound
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playCardPlay) {
      SoundSystem.playCardPlay();
    }

    // GAMIFICATION: Award XP for correct answer
    if (typeof gamification !== 'undefined') {
      const baseXP = 10;
      const xp = Math.round(baseXP * gamification.getComboMultiplier());
      persistence.addXP(xp);

      // Check daily challenges
      const sessionStats = this.getMapSessionStats();
      gamification.checkDailyChallenges(sessionStats);
    }

    if (state.monsterHp <= 0) {
      // Cleanup keyboard shortcuts on victory
      this.cleanupCombatKeyboardShortcuts();
      this.onMapCombatVictory();
    } else {
      let rollMsg = `🎲 ${d20Roll}`;
      if (isCrit) rollMsg = `🎲 NAT 20! CRITICAL!`;
      else if (isFumble) rollMsg = `🎲 NAT 1... but still hit!`;
      this.showMapCombatFeedback(`${rollMsg} - Dealt ${damage} damage!`, true);
      state.currentIndex++;
      state.totalRounds = (state.totalRounds || 0) + 1;
      state.answeredCurrentQuestion = false; // Reset for next question
      setTimeout(() => this.renderMapCombat(), 1200);
    }
  } else {
    // STS Card Animation: Wrong card shatters
    if (answerEl && answerEl.classList.contains('sts-answer-card')) {
      answerEl.classList.add('card-shattered');
    }

    // SCREEN EFFECTS: Visual feedback for wrong answer
    if (typeof ScreenEffects !== 'undefined' && answerEl) {
      ScreenEffects.flashWrong(answerEl);
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playWrong) {
      SoundSystem.playWrong();
    }

    // Record question attempt for spaced repetition
    const qId = q.id || `q_${state.currentIndex}`;
    this.recordQuestionAttempt(qId, false);

    // Track this question as wrong for priority reshuffling
    if (q.id && state.wrongQuestionIds) {
      state.wrongQuestionIds.add(q.id);
    }

    // Monster attack animation + player damage effects
    this.triggerMonsterAttack();
    setTimeout(() => this.triggerPlayerDamageEffects(), 300);

    // Wrong answer - trigger REBUTTAL with the selected answer index
    this.triggerRebuttal(q, answerIndex);
  }
};

/**
 * Get session stats for gamification tracking
 */
LuminaraQuiz.prototype.getMapSessionStats = function() {
  const stats = ActSystem.getStats() || {};
  return {
    questionsToday: stats.questionsAnswered || 0,
    accuracyToday: stats.accuracy || 0,
    firstTryStreak: stats.correctAnswers || 0,
    revengeCount: stats.rebuttalsWon || 0,
    categoriesAnswered: ActSystem.currentRun?.actsCompleted?.length || 1
  };
};

/**
 * Build HTML display for loot drops
 * @param {Array} drops - Array of loot items
 * @returns {string} HTML string
 */
LuminaraQuiz.prototype.buildLootDisplay = function(drops) {
  if (!drops || drops.length === 0) return '';

  const items = drops.filter(d => d && d.type !== 'gold' && d.type !== 'gem');
  const gems = drops.filter(d => d && d.type === 'gem');

  let html = '';

  // Display equipment items with card-cascade animation
  if (items.length > 0) {
    html += '<div class="loot-drops">';
    for (const item of items) {
      const rarityColor = typeof RARITY !== 'undefined' && RARITY[item.rarity]
        ? RARITY[item.rarity].color
        : '#9ca3af';
      const slotIcon = typeof EQUIPMENT_SLOTS !== 'undefined' && EQUIPMENT_SLOTS[item.type]
        ? EQUIPMENT_SLOTS[item.type].icon
        : '📦';
      const rarityClass = `rarity-${item.rarity || 'COMMON'}`;
      const flipClass = item.isUnique || item.rarity === 'EPIC' || item.rarity === 'UNIQUE' ? 'reveal-flip' : '';

      html += `
        <div class="loot-item ${rarityClass} ${flipClass}" style="border-color: ${rarityColor}">
          <span class="loot-icon">${item.icon || slotIcon}</span>
          <span class="loot-name" style="color: ${rarityColor}">${item.name}</span>
          ${item.isUnique ? '<span class="loot-unique-tag">UNIQUE</span>' : ''}
        </div>
      `;
    }
    html += '</div>';
  }

  // Display gems with their own cascade
  if (gems.length > 0) {
    html += '<div class="loot-drops gem-drops">';
    for (const gem of gems) {
      html += `<div class="loot-item rarity-${gem.tier || 'UNCOMMON'}" style="border-color: var(--explore)">
        <span class="loot-icon">${gem.icon}</span>
        <span class="loot-name" style="color: var(--explore)">${gem.tierName} ${gem.name}</span>
      </div>`;
    }
    html += '</div>';
  }

  return html;
};

/**
 * Trigger REBUTTAL system for wrong answer
 * Shows lesson explanation first, then rebuttal question
 */
LuminaraQuiz.prototype.triggerRebuttal = function(originalQuestion, selectedAnswer = null) {
  const self = this;
  const correctAnswer = originalQuestion.correct !== undefined ? originalQuestion.correct : originalQuestion.answer;

  // Hide QuestionPresenter before showing lesson/rebuttal
  if (typeof QuestionPresenter !== 'undefined') {
    QuestionPresenter.hide();
  }

  // Show lesson modal with explanation FIRST
  if (typeof LessonModal !== 'undefined') {
    LessonModal.show(originalQuestion, {
      selectedAnswer: selectedAnswer,
      correctAnswer: correctAnswer,
      trigger: 'wrong_answer',
      onClose: function() {
        // After lesson closes, show REBUTTAL indicator then question
        self._showRebuttalIndicatorAndQuestion(originalQuestion);
      }
    });
  } else {
    // Fallback if LessonModal not loaded
    this._showRebuttalIndicatorAndQuestion(originalQuestion);
  }
};

/**
 * Show the REBUTTAL indicator animation then the question
 */
LuminaraQuiz.prototype._showRebuttalIndicatorAndQuestion = function(originalQuestion) {
  const indicator = document.createElement('div');
  indicator.className = 'rebuttal-indicator';
  indicator.textContent = 'REBUTTAL!';
  document.body.appendChild(indicator);

  const self = this;
  setTimeout(async () => {
    indicator.remove();
    await self.showRebuttalQuestion(originalQuestion);
  }, 1000);
};

/**
 * Show the REBUTTAL scaffold question
 * Now uses dedicated scaffold files via QuestionOrchestrator when available
 */
LuminaraQuiz.prototype.showRebuttalQuestion = async function(originalQuestion) {
  // Try to load dedicated scaffolds first via the orchestrator
  let scaffoldQ = null;
  let isDedicatedScaffold = false;
  let narrativeText = null;
  let arcInfo = null;

  if (typeof questionOrchestrator !== 'undefined' && questionOrchestrator.initialized) {
    try {
      const dedicatedScaffolds = await questionOrchestrator.loadDedicatedScaffolds(originalQuestion.id);
      if (dedicatedScaffolds && dedicatedScaffolds.length > 0) {
        // Use the first scaffold from the dedicated file
        const scaffold = dedicatedScaffolds[0];
        scaffoldQ = {
          q: scaffold.q,
          options: scaffold.options,
          correct: scaffold.answer,
          original: originalQuestion,
          explain: scaffold.explain,
          wrongExplains: scaffold.wrongExplains
        };
        isDedicatedScaffold = true;
        narrativeText = scaffold.narrative;
        arcInfo = {
          arc: scaffold.arc || 1,
          arcTitle: scaffold.arcTitle || 'Understanding the Words'
        };
        console.log('[Rebuttal] Using dedicated scaffold for:', originalQuestion.id);
      }
    } catch (e) {
      console.log('[Rebuttal] No dedicated scaffolds, using fallback:', e.message);
    }
  }

  // Fallback to old scaffold generation if no dedicated scaffolds
  if (!scaffoldQ) {
    scaffoldQ = this.generateScaffoldQuestion(originalQuestion);
  }

  // Store for answer handling
  this._currentRebuttalScaffold = scaffoldQ;
  this._rebuttalIsDedicated = isDedicatedScaffold;

  // Hide QuestionPresenter if active
  if (typeof QuestionPresenter !== 'undefined') {
    QuestionPresenter.hide();
  }

  // Get or create combat container
  let combatContainer = document.getElementById('parchment-combat') || document.getElementById('map-combat-container');
  if (!combatContainer) {
    combatContainer = document.createElement('div');
    combatContainer.id = 'parchment-combat';
    document.body.appendChild(combatContainer);
  }
  combatContainer.style.cssText = 'display:block;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;';

  const playerHpPercent = Math.round((this.mapModeState.runState.hp / this.mapModeState.runState.maxHp) * 100);

  // Build narrative intro if using dedicated scaffolds
  const narrativeHTML = isDedicatedScaffold && narrativeText ? `
    <div class="rebuttal-narrative">
      <div class="narrative-speaker">Ms. Luminara</div>
      <p class="narrative-text">"${narrativeText}"</p>
    </div>
  ` : '';

  // Build arc badge if dedicated
  const arcBadgeHTML = isDedicatedScaffold && arcInfo ? `
    <span class="rebuttal-arc-badge arc-${arcInfo.arc}">Arc ${arcInfo.arc}: ${arcInfo.arcTitle}</span>
  ` : '';

  combatContainer.innerHTML = `
    <div class="map-combat-wrapper rebuttal-mode ${isDedicatedScaffold ? 'narrative-rebuttal' : ''}">
      <div class="rebuttal-header">
        <span class="rebuttal-badge">REBUTTAL</span>
        ${arcBadgeHTML}
        <span class="rebuttal-hint">Get it right to earn a potion!</span>
      </div>

      <div class="combat-header">
        <div class="combat-player" style="margin-left: auto;">
          <div class="player-hp-bar">
            <div class="player-hp-fill" style="width: ${playerHpPercent}%"></div>
            <span class="player-hp-text">${this.mapModeState.runState.hp}/${this.mapModeState.runState.maxHp}</span>
          </div>
        </div>
      </div>

      <div class="consecutive-wrong-indicator">
        ${[0, 1, 2].map(i => `
          <div class="consecutive-wrong-dot ${i < this.mapModeState.runState.consecutiveWrong ? 'active' : ''}"></div>
        `).join('')}
      </div>

      ${narrativeHTML}

      <div class="combat-question-card scaffold-card ${isDedicatedScaffold ? 'narrative-scaffold' : ''}">
        <div class="scaffold-label">${isDedicatedScaffold ? 'Foundation Question' : 'Targeted Review'}</div>
        <div class="q-text">${this.renderer.renderText(scaffoldQ.q)}</div>
        <div class="options">
          ${scaffoldQ.options.map((opt, i) => `
            <button class="option-btn scaffold-option" data-rebuttal-index="${i}" data-rebuttal-correct="${scaffoldQ.correct}">
              <span class="opt-letter">${['A','B','C','D'][i]}</span>
              <span class="opt-text">${this.renderer.renderText(opt)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  // Attach event listeners after DOM update
  this.attachMapEventListeners();
};

/**
 * Generate a scaffold question from the original
 * Handles both 'correct' and 'answer' fields for compatibility
 */
LuminaraQuiz.prototype.generateScaffoldQuestion = function(original) {
  // Get the correct answer index - handle both 'correct' and 'answer' field names
  const correctIndex = original.correct !== undefined ? original.correct : original.answer;

  // Validate we have usable question data
  if (!original.options || original.options.length < 4 || correctIndex === undefined) {
    console.warn('[Rebuttal] Invalid question data:', original);
    // Return a fallback question
    return {
      q: 'Review the previous question carefully. What was the correct answer?',
      options: [
        'The first option was correct',
        'The second option was correct',
        'The third option was correct',
        'The fourth option was correct'
      ],
      correct: 0,
      original: original
    };
  }

  // If original has scaffold questions, use one
  if (original.prerequisites && original.prerequisites.length > 0) {
    const prereq = original.prerequisites[0];
    const prereqCorrect = prereq.correct !== undefined ? prereq.correct : prereq.answer;
    return {
      q: prereq.q || prereq.question || original.q,
      options: prereq.options || original.options,
      correct: prereqCorrect !== undefined ? prereqCorrect : correctIndex,
      original: original
    };
  }

  // Otherwise, re-ask the original question (they need to think again)
  // Don't give away the answer - make them genuinely reconsider
  const shuffledOptions = [...original.options];
  const correctAnswer = shuffledOptions[correctIndex];

  // Fisher-Yates shuffle to randomize option order
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  // Find where the correct answer ended up after shuffle
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

  return {
    q: original.q || original.question,
    options: shuffledOptions,
    correct: newCorrectIndex,
    original: original,
    isReshuffled: true
  };
};

/**
 * Handle REBUTTAL answer
 */
LuminaraQuiz.prototype.handleRebuttalAnswer = function(answerIndex, correctIndex) {
  const isCorrect = answerIndex === correctIndex;
  const answerBtn = document.querySelectorAll('.scaffold-option')[answerIndex];

  ActSystem.recordRebuttal(isCorrect);

  if (isCorrect) {
    // SCREEN EFFECTS: Visual feedback
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.flashCorrect(answerBtn);
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playCorrect) {
      SoundSystem.playCorrect();
    }

    // Rebuttal won - earn potion!
    this.mapModeState.runState.consecutiveWrong = 0;
    this.mapModeState.runState.criticalState = false;

    // Remove critical HP effect if HP recovers
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.setCriticalHP(false);
    }

    const potionResult = PotionSystem.earnPotion();
    ActSystem.recordPotionEarned();

    // GAMIFICATION: Bonus XP for rebuttal success
    if (typeof gamification !== 'undefined') {
      persistence.addXP(25); // Bonus XP for redemption
    }

    if (potionResult.earned) {
      this.showPotionEarnedPopup(potionResult.potion);
    } else {
      // Inventory full - heal instead
      const healAmount = potionResult.alternateReward.amount;
      this.mapModeState.runState.hp = Math.min(
        this.mapModeState.runState.maxHp,
        this.mapModeState.runState.hp + healAmount
      );

      // SCREEN EFFECTS: Show heal number
      const playerEl = document.querySelector('.combat-player');
      if (typeof ScreenEffects !== 'undefined' && playerEl) {
        ScreenEffects.showHeal(playerEl, healAmount);
      }
      if (typeof SoundSystem !== 'undefined' && SoundSystem.playHeal) {
        SoundSystem.playHeal();
      }

      this.showMapCombatFeedback(`Potions full! Healed ${healAmount} HP instead.`, true);
    }

    // Continue combat - hide rebuttal container first
    const rebuttalContainer = document.getElementById('parchment-combat');
    if (rebuttalContainer) {
      rebuttalContainer.style.display = 'none';
      rebuttalContainer.innerHTML = '';
    }

    this.mapCombatState.currentIndex++;
    setTimeout(() => this.renderMapCombat(), 1500);
  } else {
    // SCREEN EFFECTS: Visual feedback for wrong
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.flashWrong(answerBtn);
      ScreenEffects.shake('normal');
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playWrong) {
      SoundSystem.playWrong();
    }
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playDamage) {
      SoundSystem.playDamage();
    }

    // Rebuttal lost - roll d20 for damage and increment consecutive
    this.mapModeState.runState.consecutiveWrong++;
    const d20Roll = Math.floor(Math.random() * 20) + 1;
    const isCriticalHit = d20Roll === 20;
    const isFumble = d20Roll === 1;

    // D20 damage: roll result is base damage, critical doubles it
    let damage = d20Roll;
    if (isCriticalHit) {
      damage = d20Roll * 2; // Crit: 40 damage
    } else if (isFumble) {
      damage = 0; // Natural 1: lucky dodge!
    }

    // Critical state adds +10 to damage
    if (this.mapModeState.runState.criticalState && !isFumble) {
      damage += 10;
    }

    // SCREEN EFFECTS: Show damage number with roll info
    const playerEl = document.querySelector('.combat-player');
    if (typeof ScreenEffects !== 'undefined' && playerEl) {
      ScreenEffects.showPlayerDamage(playerEl, damage, isCriticalHit);
    }

    // Build feedback message with d20 roll result
    let rollMsg = `🎲 ${d20Roll}`;
    if (isCriticalHit) {
      rollMsg = `🎲 NAT 20! CRITICAL HIT!`;
      if (typeof ScreenEffects !== 'undefined') {
        ScreenEffects.shake('big');
      }
    } else if (isFumble) {
      rollMsg = `🎲 NAT 1! Lucky dodge!`;
    }

    if (this.mapModeState.runState.consecutiveWrong >= 3) {
      this.mapModeState.runState.criticalState = true;
      if (typeof ScreenEffects !== 'undefined') {
        ScreenEffects.shake('big');
      }
      this.showMapCombatFeedback(`Wrong! ${rollMsg} - CRITICAL STATE! Took ${damage} damage!`, false);
    } else if (isFumble) {
      this.showMapCombatFeedback(`Wrong! ${rollMsg} - No damage!`, false);
    } else {
      this.showMapCombatFeedback(`Wrong! ${rollMsg} - Took ${damage} damage!`, false);
    }

    this.mapModeState.runState.hp -= damage;

    // SCREEN EFFECTS: Check for critical HP warning
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.checkCriticalHP(this.mapModeState.runState.hp, this.mapModeState.runState.maxHp);
    }

    if (this.mapModeState.runState.hp <= 0) {
      this.onMapCombatDefeat();
    } else {
      this.mapCombatState.currentIndex++;
      this.mapCombatState.totalRounds = (this.mapCombatState.totalRounds || 0) + 1;

      // Hide the rebuttal container before showing next question
      const rebuttalContainer = document.getElementById('parchment-combat');
      if (rebuttalContainer) {
        rebuttalContainer.style.display = 'none';
        rebuttalContainer.innerHTML = '';
      }

      setTimeout(() => this.renderMapCombat(), 1000);
    }
  }
};

/**
 * Show potion earned popup
 */
LuminaraQuiz.prototype.showPotionEarnedPopup = function(potion) {
  const popup = document.createElement('div');
  popup.className = 'potion-earned-popup';
  popup.innerHTML = `
    <div class="potion-earned-icon">${potion.emoji}</div>
    <div class="potion-earned-title">Potion Earned!</div>
    <div class="potion-earned-name">${potion.name}</div>
    <div class="potion-earned-desc">${potion.description}</div>
  `;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
};

/**
 * Use a potion during map combat
 */
LuminaraQuiz.prototype.useMapPotion = function(slotIndex) {
  const result = PotionSystem.usePotion(slotIndex, {
    maxHp: this.mapModeState.runState.maxHp
  });

  if (!result) return;

  ActSystem.recordPotionUsed();

  // Apply effect
  switch (result.effect.type) {
    case 'heal':
      this.mapModeState.runState.hp = Math.min(
        this.mapModeState.runState.maxHp,
        this.mapModeState.runState.hp + result.effect.amount
      );
      break;
    case 'draw':
      // For card battles, would draw cards
      break;
  }

  this.showMapCombatFeedback(result.effect.description, true);
  this.renderMapCombat();
};

/**
 * Show combat feedback (STS-style)
 */
LuminaraQuiz.prototype.showMapCombatFeedback = function(message, positive) {
  // Try STS-style feedback container first
  const stsFeedback = document.getElementById('stsFeedback');
  if (stsFeedback) {
    stsFeedback.innerHTML = `
      <div class="sts-feedback-message ${positive ? 'correct' : 'wrong'}">
        ${message}
      </div>
    `;
    setTimeout(() => { stsFeedback.innerHTML = ''; }, 1000);
    return;
  }

  // Fallback to legacy style
  const feedback = document.createElement('div');
  feedback.className = `map-combat-feedback ${positive ? 'positive' : 'negative'}`;
  feedback.textContent = message;
  feedback.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    background: ${positive ? 'var(--correct)' : 'var(--incorrect)'};
    color: var(--parchment);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 400;
    animation: fadeInOut 1s forwards;
  `;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 1000);
};

/**
 * Setup keyboard shortcuts for combat (1-4 or A-D keys)
 */
LuminaraQuiz.prototype.setupCombatKeyboardShortcuts = function() {
  // Remove existing listener if any
  if (this._combatKeyHandler) {
    document.removeEventListener('keydown', this._combatKeyHandler);
  }

  this._combatKeyHandler = (e) => {
    // Don't handle if combat is not active
    const combatActive = document.getElementById('parchment-combat') || document.getElementById('map-combat-container') || document.getElementById('question-presenter');
    if (!this.mapCombatState || !combatActive) {
      return;
    }

    // Map keys to answer indices
    const keyMap = {
      '1': 0, '2': 1, '3': 2, '4': 3,
      'a': 0, 'b': 1, 'c': 2, 'd': 3,
      'A': 0, 'B': 1, 'C': 2, 'D': 3
    };

    const answerIndex = keyMap[e.key];
    if (answerIndex !== undefined) {
      // Check if there's a card at this index
      const card = document.querySelector(`.sts-answer-card[data-card-index="${answerIndex}"]`);
      if (card && !card.classList.contains('card-played') && !card.classList.contains('card-shattered')) {
        e.preventDefault();
        this.handleMapCombatAnswer(answerIndex);
      }
    }
  };

  document.addEventListener('keydown', this._combatKeyHandler);
};

/**
 * Clean up keyboard shortcuts
 */
LuminaraQuiz.prototype.cleanupCombatKeyboardShortcuts = function() {
  if (this._combatKeyHandler) {
    document.removeEventListener('keydown', this._combatKeyHandler);
    this._combatKeyHandler = null;
  }
};

/**
 * Play card hover sound effect
 */
LuminaraQuiz.prototype.playCardHoverSound = function() {
  if (typeof SoundSystem !== 'undefined' && SoundSystem.playHover) {
    SoundSystem.playHover();
  }
};

/**
 * Show floating damage number
 * @param {HTMLElement} targetEl - Element to position damage near
 * @param {number} damage - Damage amount
 * @param {boolean} isPlayer - Whether damage is to player (red) or monster (green)
 * @param {boolean} isCrit - Whether this was a critical hit
 * @param {string} breakdown - Optional damage breakdown string
 */
LuminaraQuiz.prototype.showDamageNumber = function(targetEl, damage, isPlayer, isCrit, breakdown) {
  if (!targetEl) return;

  const rect = targetEl.getBoundingClientRect();
  const damageEl = document.createElement('div');
  damageEl.className = `damage-number ${isPlayer ? 'damage-taken' : 'damage-dealt'} ${isCrit ? 'critical' : ''}`;
  damageEl.textContent = `${isPlayer ? '-' : '+'}${damage}`;

  // Position near the target
  damageEl.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 40}px`;
  damageEl.style.top = `${rect.top + rect.height / 3}px`;

  document.body.appendChild(damageEl);

  // Show breakdown if provided
  if (breakdown) {
    const breakdownEl = document.createElement('div');
    breakdownEl.className = 'damage-breakdown';
    breakdownEl.textContent = breakdown;
    breakdownEl.style.left = `${rect.left + rect.width / 2}px`;
    breakdownEl.style.top = `${rect.top + rect.height / 3 + 40}px`;
    document.body.appendChild(breakdownEl);
    setTimeout(() => breakdownEl.remove(), 1500);
  }

  setTimeout(() => damageEl.remove(), 1200);
};

/**
 * Trigger screen shake and vignette for player damage
 */
LuminaraQuiz.prototype.triggerPlayerDamageEffects = function() {
  const arena = document.querySelector('.sts-battle-arena');
  if (arena) {
    arena.classList.add('screen-shake', 'damage-vignette');
    setTimeout(() => {
      arena.classList.remove('screen-shake');
    }, 400);
    setTimeout(() => {
      arena.classList.remove('damage-vignette');
    }, 500);
  }
};

/**
 * Trigger monster attack animation
 */
LuminaraQuiz.prototype.triggerMonsterAttack = function() {
  const monsterEl = document.getElementById('stsMonster');
  if (monsterEl) {
    monsterEl.classList.add('attacking');
    setTimeout(() => monsterEl.classList.remove('attacking'), 600);
  }
};

/**
 * Get spaced repetition stats for a question
 * @param {string} questionId - Unique question identifier
 * @returns {Object|null} Stats object with attempts, correct, lastSeen
 */
LuminaraQuiz.prototype.getQuestionStats = function(questionId) {
  if (!questionId) return null;

  // Try to get from localStorage
  try {
    const statsKey = 'luminara_question_stats';
    const allStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
    return allStats[questionId] || null;
  } catch (e) {
    return null;
  }
};

/**
 * Record question attempt for spaced repetition
 * @param {string} questionId - Unique question identifier
 * @param {boolean} correct - Whether the answer was correct
 */
LuminaraQuiz.prototype.recordQuestionAttempt = function(questionId, correct) {
  if (!questionId) return;

  try {
    const statsKey = 'luminara_question_stats';
    const allStats = JSON.parse(localStorage.getItem(statsKey) || '{}');

    if (!allStats[questionId]) {
      allStats[questionId] = { attempts: 0, correct: 0, lastSeen: 0, wrongStreak: 0 };
    }

    allStats[questionId].attempts++;
    if (correct) {
      allStats[questionId].correct++;
      allStats[questionId].wrongStreak = 0;
    } else {
      allStats[questionId].wrongStreak = (allStats[questionId].wrongStreak || 0) + 1;
    }
    allStats[questionId].lastSeen = Date.now();

    localStorage.setItem(statsKey, JSON.stringify(allStats));
  } catch (e) {
    console.warn('Failed to record question stats:', e);
  }
};

/**
 * Get questions prioritized by spaced repetition algorithm
 * @param {Array} questions - Array of question objects
 * @returns {Array} Sorted questions with hardest/most-needed first
 */
LuminaraQuiz.prototype.prioritizeQuestionsBySpacedRepetition = function(questions) {
  if (!questions || questions.length === 0) return questions;

  try {
    const statsKey = 'luminara_question_stats';
    const allStats = JSON.parse(localStorage.getItem(statsKey) || '{}');
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // Score each question (higher = should see sooner)
    const scored = questions.map(q => {
      const qId = q.id || `q_${questions.indexOf(q)}`;
      const stats = allStats[qId];

      let priority = 50; // Base priority

      if (!stats) {
        // Never seen - moderate priority
        priority = 60;
      } else {
        const accuracy = stats.correct / Math.max(1, stats.attempts);
        const daysSinceLastSeen = (now - stats.lastSeen) / dayMs;

        // Low accuracy = high priority
        priority += (1 - accuracy) * 40;

        // Recent wrong streak = very high priority
        priority += (stats.wrongStreak || 0) * 15;

        // Long time since seen = higher priority (but capped)
        priority += Math.min(daysSinceLastSeen * 2, 20);

        // Many attempts but still low accuracy = extra priority
        if (stats.attempts >= 3 && accuracy < 0.5) {
          priority += 20;
        }
      }

      return { question: q, priority };
    });

    // Sort by priority (highest first) with some randomization
    scored.sort((a, b) => {
      // Add small random factor to prevent exact same order
      const aScore = a.priority + (Math.random() - 0.5) * 10;
      const bScore = b.priority + (Math.random() - 0.5) * 10;
      return bScore - aScore;
    });

    return scored.map(s => s.question);
  } catch (e) {
    console.warn('Spaced repetition sort failed:', e);
    return questions;
  }
};

/**
 * Handle combat victory
 */
LuminaraQuiz.prototype.onMapCombatVictory = function() {
  const state = this.mapCombatState;
  PotionSystem.endCombat();

  // SCREEN EFFECTS: Victory fanfare
  if (typeof ScreenEffects !== 'undefined') {
    ScreenEffects.setCriticalHP(false); // Clear critical state
  }
  if (typeof SoundSystem !== 'undefined') {
    if (state.isElite && SoundSystem.playBossDeath) {
      SoundSystem.playBossDeath();
    } else if (SoundSystem.playWaveClear) {
      SoundSystem.playWaveClear();
    }
  }

  // Mark node complete
  MapSystem.completeCurrentNode();

  if (state.isElite) {
    ActSystem.recordEliteDefeated();
  }

  // RUNMANAGER INTEGRATION: Complete wave and record damage
  if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
    // Record damage dealt in this combat
    runManager.recordBossDamage(state.monsterMaxHp, true);

    // Complete the wave (combat node = wave)
    const waveResult = runManager.completeWave();
    debugLog('[MapMode] Wave completed:', waveResult);
  }

  // Award gold (with combo bonus)
  let goldReward = state.isElite ? 25 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 15);

  // GAMIFICATION: Combo multiplier for gold
  if (typeof gamification !== 'undefined') {
    const comboMult = gamification.getComboMultiplier();
    goldReward = Math.round(goldReward * comboMult);
  }

  this.mapModeState.runState.gold += goldReward;
  ActSystem.recordGold(goldReward);

  // GAMIFICATION: Award victory XP
  const xpReward = state.isElite ? 100 : 50;
  if (typeof persistence !== 'undefined') {
    persistence.addXP(xpReward);
  }

  // Check for milestone
  if (typeof ScreenEffects !== 'undefined') {
    const stats = ActSystem.getStats();
    ScreenEffects.checkMilestone(stats?.questionsAnswered || 0);
  }

  // LOOTSYSTEM INTEGRATION: Roll for loot drops
  let lootDrops = [];
  if (typeof lootSystem !== 'undefined' && lootSystem) {
    const runSummary = runManager && runManager.isRunActive() ? runManager.getRunSummary() : null;
    const performance = {
      wasCorrect: true,
      wasFirstTry: this.mapModeState.runState.firstTryCorrect > 0,
      streakLength: runSummary?.currentStreak || 0,
      isCritical: state.isElite,  // Elite combat has better drops
      isRevengeSuccess: false,
      playerLevel: Math.floor((this.mapModeState.runState.questionsAnswered || 0) / 10) + 1
    };

    lootDrops = lootSystem.rollLoot(performance);

    // Elite combat gets bonus loot roll
    if (state.isElite && Math.random() < 0.5) {
      const bonusLoot = lootSystem.rollLoot({ ...performance, isCritical: true });
      lootDrops = lootDrops.concat(bonusLoot);
    }

    debugLog('[MapMode] Loot drops:', lootDrops);
  }

  // Build loot display HTML
  const lootDisplay = this.buildLootDisplay(lootDrops);

  // Build reward display with run stats
  const runSummary = runManager && runManager.isRunActive() ? runManager.getRunSummary() : null;
  const streakDisplay = runSummary ? `<div class="reward-item">🔥 Streak: ${runSummary.currentStreak}</div>` : '';

  // CARD REWARDS: Generate card choices for monster defeat
  let cardChoices = [];
  if (typeof CardSystem !== 'undefined') {
    // Elite monsters give better cards (includeRare = true)
    cardChoices = CardSystem.generateCardReward(state.node.categoryId, state.isElite);
    debugLog('[MapMode] Card reward choices:', cardChoices);
  }

  // Build card reward HTML
  let cardRewardHTML = '';
  if (cardChoices.length > 0) {
    const cardChoicesHTML = cardChoices.map(cardId => {
      const card = CardSystem.getCard(cardId);
      if (!card) return '';
      const rarity = CardSystem.CARD_RARITIES[card.rarity];
      return `
        <div class="battle-card card-${card.type} card-${card.rarity.toLowerCase()}"
             data-card-reward="${cardId}"
             style="--rarity-color: ${rarity.color}; cursor: pointer;">
          <div class="card-cost">${card.cost}</div>
          <div class="card-emoji">${card.emoji}</div>
          <div class="card-name">${card.name}</div>
          <div class="card-type">${card.type}</div>
          <div class="card-description">${card.description}</div>
          <div class="card-rarity">${rarity.name}</div>
        </div>
      `;
    }).join('');

    cardRewardHTML = `
      <div class="card-reward-container" id="map-card-reward">
        <h3 class="card-reward-title">Choose a Card Reward</h3>
        <div class="card-reward-choices">
          ${cardChoicesHTML}
        </div>
        <button class="skip-reward-btn" data-action="skip-card-reward">Skip Reward</button>
      </div>
    `;
  }

  // Hide QuestionPresenter and show reward
  if (typeof QuestionPresenter !== 'undefined') QuestionPresenter.hide();

  let combatContainer = document.getElementById('parchment-combat') || document.getElementById('map-combat-container');
  if (!combatContainer) {
    combatContainer = document.createElement('div');
    combatContainer.id = 'parchment-combat';
    document.body.appendChild(combatContainer);
  }
  combatContainer.style.cssText = 'display:block;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;';

  combatContainer.innerHTML = `
    <div class="map-combat-wrapper">
      <div class="victory-screen">
        <h2>Victory!</h2>
        <div class="reward-display">
          <div class="reward-item">💰 +${goldReward} Gold</div>
          <div class="reward-item">✨ +${xpReward} XP</div>
          ${streakDisplay}
          ${lootDisplay}
        </div>
        ${cardRewardHTML}
        <button class="victory-continue-btn" data-action="return-to-map" ${cardChoices.length > 0 ? 'style="display:none"' : ''}>
          Continue
        </button>
      </div>
    </div>
  `;
  // Attach event listeners after DOM update
  this.attachMapEventListeners();
};

/**
 * Handle combat defeat
 */
LuminaraQuiz.prototype.onMapCombatDefeat = function() {
  PotionSystem.endCombat();

  // SCREEN EFFECTS: Game over effects
  if (typeof ScreenEffects !== 'undefined') {
    ScreenEffects.setCriticalHP(false);
  }
  if (typeof SoundSystem !== 'undefined' && SoundSystem.playGameOver) {
    SoundSystem.playGameOver();
  }

  const combatContainer = document.getElementById('parchment-combat') || document.getElementById('map-combat-container');
  if (combatContainer) {
    const summary = ActSystem.generateRunSummary(false);

    // RUNMANAGER INTEGRATION: Complete the run (defeat)
    let runResult = null;
    if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
      // Record damage taken
      runManager.recordBossDamage(this.mapModeState.runState.maxHp - this.mapModeState.runState.hp, false);
      runResult = runManager.completeRun(false);
      debugLog('[MapMode] Run completed (defeat):', runResult);
    }

    // Merge RunManager results with ActSystem summary
    const finalScore = runResult ? runResult.completedRun.score : summary.score;
    const isHighScore = runResult ? runResult.isHighScore : false;
    const tokensEarned = runResult ? runResult.tokensEarned : 0;

    // Save high score if applicable
    if (typeof HighScores !== 'undefined' && finalScore > 0) {
      HighScores.submitScore('map_run', finalScore, {
        actsCompleted: summary.actsCompleted,
        accuracy: summary.stats.accuracy,
        runLength: summary.runLength
      });
    }

    combatContainer.innerHTML = `
      <div class="map-combat-wrapper">
        <div class="defeat-screen">
          <h2>Defeated</h2>
          <p>Your run has ended.</p>
          ${isHighScore ? '<div class="new-high-score">NEW HIGH SCORE!</div>' : ''}
          <div class="run-summary">
            <div class="summary-stat">Acts Completed: ${summary.actsCompleted}/${summary.totalActs}</div>
            <div class="summary-stat">Accuracy: ${summary.stats.accuracy}</div>
            <div class="summary-stat">Questions: ${summary.stats.questionsAnswered}</div>
            <div class="summary-stat">Score: ${finalScore}</div>
            ${tokensEarned > 0 ? `<div class="summary-stat">🎫 Tokens Earned: ${tokensEarned}</div>` : ''}
          </div>
          <button class="defeat-btn" data-action="exit-map-mode">
            Return to Menu
          </button>
        </div>
      </div>
    `;
    // Attach event listeners after DOM update
    this.attachMapEventListeners();
  }
};

/**
 * Return to map after combat
 */
LuminaraQuiz.prototype.returnToMap = function() {
  // Hide combat container first
  if (typeof QuestionPresenter !== 'undefined') QuestionPresenter.hide();
  const combatContainer = document.getElementById('parchment-combat') || document.getElementById('map-combat-container');
  if (combatContainer) {
    combatContainer.style.display = 'none';
  }

  // Hide other containers
  const restContainer = document.getElementById('map-rest-container');
  if (restContainer) restContainer.style.display = 'none';

  // Update run state
  this.mapModeState.runState.potions = PotionSystem.getInventory();

  // Advance to next node after completing this encounter
  if (typeof MapRenderer !== 'undefined' && MapRenderer.advanceToNextNode) {
    MapRenderer.advanceToNextNode();
  }

  // Play reverse page turn and show map
  this.playPageTurnTransition('out', {
    icon: '🗺️',
    type: 'Returning to',
    name: 'The Map'
  }).then(() => {
    MapRenderer.render(MapSystem.currentMap, this.mapModeState.runState);
    MapRenderer.show();
  });
};

/**
 * Select a card reward from map combat victory
 */
LuminaraQuiz.prototype.selectMapCardReward = function(cardId) {
  if (typeof CardSystem !== 'undefined') {
    CardSystem.addCardToDeck(cardId);

    const card = CardSystem.getCard(cardId);
    if (card) {
      this.showMapCombatFeedback(`Added ${card.name} to your deck!`, true);
    }
  }

  // Hide reward choices and show continue button
  const rewardContainer = document.getElementById('map-card-reward');
  if (rewardContainer) {
    rewardContainer.style.display = 'none';
  }

  const continueBtn = document.querySelector('.victory-continue-btn');
  if (continueBtn) {
    continueBtn.style.display = 'block';
  }
};

/**
 * Skip the card reward from map combat victory
 */
LuminaraQuiz.prototype.skipMapCardReward = function() {
  // Hide reward choices and show continue button
  const rewardContainer = document.getElementById('map-card-reward');
  if (rewardContainer) {
    rewardContainer.style.display = 'none';
  }

  const continueBtn = document.querySelector('.victory-continue-btn');
  if (continueBtn) {
    continueBtn.style.display = 'block';
  }
};

/**
 * Show rest site options
 */
LuminaraQuiz.prototype.showRestSite = function(node) {
  MapRenderer.hide();

  let restContainer = document.getElementById('map-rest-container');
  if (!restContainer) {
    restContainer = document.createElement('div');
    restContainer.id = 'map-rest-container';
    document.body.appendChild(restContainer);
  }
  restContainer.style.display = 'block';

  restContainer.innerHTML = `
    <div class="rest-site-wrapper">
      <div class="rest-site-header">
        <span class="rest-icon">🏕️</span>
        <h2>Rest Site</h2>
      </div>
      <div class="rest-options">
        <button class="rest-option-btn" data-action="rest-heal">
          <span class="option-icon">❤️</span>
          <span class="option-name">Rest</span>
          <span class="option-desc">Heal 30% of max HP</span>
        </button>
        <button class="rest-option-btn" data-action="rest-upgrade">
          <span class="option-icon">⬆️</span>
          <span class="option-name">Train</span>
          <span class="option-desc">+5 Max HP permanently</span>
        </button>
      </div>
    </div>
  `;
  // Attach event listeners after DOM update
  this.attachMapEventListeners();
};

LuminaraQuiz.prototype.restSiteHeal = function() {
  const healAmount = Math.floor(this.mapModeState.runState.maxHp * 0.3);
  this.mapModeState.runState.hp = Math.min(
    this.mapModeState.runState.maxHp,
    this.mapModeState.runState.hp + healAmount
  );

  MapSystem.completeCurrentNode();
  this.showMapCombatFeedback(`Healed ${healAmount} HP!`, true);

  document.getElementById('map-rest-container').style.display = 'none';
  this.returnToMap();
};

LuminaraQuiz.prototype.restSiteUpgrade = function() {
  this.mapModeState.runState.maxHp += 5;
  this.mapModeState.runState.hp += 5;

  MapSystem.completeCurrentNode();
  this.showMapCombatFeedback('Max HP increased by 5!', true);

  document.getElementById('map-rest-container').style.display = 'none';
  this.returnToMap();
};

/**
 * Show treasure node reward
 */
LuminaraQuiz.prototype.showTreasure = function(node) {
  MapRenderer.hide();
  MapSystem.completeCurrentNode();

  const goldAmount = 20 + Math.floor(Math.random() * 30);
  this.mapModeState.runState.gold += goldAmount;
  ActSystem.recordGold(goldAmount);

  this.showMapCombatFeedback(`Found ${goldAmount} gold!`, true);
  setTimeout(() => this.returnToMap(), 1000);
};

/**
 * Show shop node
 */
LuminaraQuiz.prototype.showShop = function(node) {
  MapRenderer.hide();

  // For now, just complete and return - full shop implementation later
  MapSystem.completeCurrentNode();
  this.showMapCombatFeedback('Shop coming soon!', true);
  setTimeout(() => this.returnToMap(), 1000);
};

/**
 * Trigger mystery event
 */
LuminaraQuiz.prototype.triggerMysteryEvent = function(node) {
  MapRenderer.hide();
  MapSystem.completeCurrentNode();

  // Simple random outcome for now
  const roll = Math.random();
  if (roll < 0.5) {
    const gold = 15 + Math.floor(Math.random() * 20);
    this.mapModeState.runState.gold += gold;
    ActSystem.recordGold(gold);
    this.showMapCombatFeedback(`Found a hidden stash! +${gold} gold`, true);
  } else if (roll < 0.8) {
    const heal = 15;
    this.mapModeState.runState.hp = Math.min(
      this.mapModeState.runState.maxHp,
      this.mapModeState.runState.hp + heal
    );
    this.showMapCombatFeedback(`Found healing herbs! +${heal} HP`, true);
  } else {
    this.showMapCombatFeedback('Nothing of interest here...', false);
  }

  setTimeout(() => this.returnToMap(), 1200);
};

/**
 * Start boss battle at end of act
 */
LuminaraQuiz.prototype.startMapBossBattle = function(node) {
  MapRenderer.hide();

  // Use the CardBattleUI for boss fights
  if (typeof CardBattleUI !== 'undefined') {
    CardBattleUI.startBattle(node.bossId, node.categoryId);
    // Hook victory to act completion
    CardBattleUI.onVictory = () => {
      this.onMapBossVictory(node);
    };
    CardBattleUI.onDefeat = () => {
      this.onMapCombatDefeat();
    };
  } else {
    // Fallback to regular combat
    this.startMapCombat(node, true);
  }
};

/**
 * Handle boss victory
 */
LuminaraQuiz.prototype.onMapBossVictory = function(node) {
  MapSystem.completeCurrentNode();

  // RUNMANAGER INTEGRATION: Record boss defeat
  if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
    const battleData = {
      battleTime: Date.now() - (this.mapCombatState?.startTime || Date.now()),
      playerDamageDealt: this.mapCombatState?.monsterMaxHp || 100
    };
    runManager.recordBossDefeat(node.bossId, battleData);
    debugLog('[MapMode] Boss defeated:', node.bossId);
  }

  // LOOTSYSTEM INTEGRATION: Generate boss loot
  let bossLoot = [];
  if (typeof lootSystem !== 'undefined' && lootSystem) {
    const playerLevel = Math.floor((this.mapModeState.runState.questionsAnswered || 0) / 10) + 1;
    const battlePerformance = {
      damageDealt: this.mapCombatState?.monsterMaxHp || 100,
      damageTaken: (this.mapModeState.runState.maxHp || 100) - (this.mapModeState.runState.hp || 0),
      turnsTaken: this.mapCombatState?.currentIndex || 5,
      perfectVictory: this.mapModeState.runState.hp >= this.mapModeState.runState.maxHp
    };

    // Convert boss ID to loot table key format
    const bossKey = (node.bossId || 'default').toLowerCase().replace(/_/g, '_');
    bossLoot = lootSystem.generateBossLoot(bossKey, playerLevel, battlePerformance);
    debugLog('[MapMode] Boss loot:', bossLoot);

    // Store for display in act transition
    this.lastBossLoot = bossLoot;
  }

  const transition = ActSystem.completeAct();

  if (transition.type === 'run_complete') {
    this.showRunComplete(transition);
  } else {
    this.showActTransition(transition);
  }
};

/**
 * Play cinematic act transition
 * @param {Object} completedAct - Info about completed act
 * @param {Object} nextAct - Info about next act
 * @returns {Promise} Resolves when animation completes
 */
LuminaraQuiz.prototype.playActCinematic = function(completedAct, nextAct) {
  return new Promise(resolve => {
    // Create cinematic overlay
    let cinematic = document.getElementById('act-cinematic');
    if (!cinematic) {
      cinematic = document.createElement('div');
      cinematic.id = 'act-cinematic';
      cinematic.className = 'act-cinematic';
      document.body.appendChild(cinematic);
    }
    cinematic.style.display = 'flex';

    // Build cinematic content
    cinematic.innerHTML = `
      <div class="cinematic-grain"></div>
      <div class="cinematic-vignette"></div>

      <div class="cinematic-completed">
        <div class="cinematic-icon completed-icon">${completedAct.category?.icon || '✓'}</div>
        <div class="cinematic-text completed-text">${completedAct.category?.name || 'Act'}</div>
        <div class="cinematic-subtext">COMPLETE</div>
      </div>

      <div class="cinematic-next">
        <div class="cinematic-act-num">ACT ${nextAct?.actNumber || '?'}</div>
        <div class="cinematic-icon next-icon">${nextAct?.category?.icon || '?'}</div>
        <div class="cinematic-text next-text">${nextAct?.category?.name || 'Unknown'}</div>
      </div>
    `;

    // Play transition sound
    if (typeof SoundSystem !== 'undefined' && SoundSystem.playActTransition) {
      SoundSystem.playActTransition();
    }

    // Remove after animation
    setTimeout(() => {
      cinematic.classList.add('fade-out');
      setTimeout(() => {
        cinematic.style.display = 'none';
        cinematic.classList.remove('fade-out');
        resolve();
      }, 500);
    }, 3500); // Show for 3.5 seconds
  });
};

/**
 * Show act transition screen
 */
LuminaraQuiz.prototype.showActTransition = function(transition) {
  // Play cinematic first, then show choices
  this.playActCinematic(transition.completedAct, transition.nextAct).then(() => {
    this.showActTransitionChoices(transition);
  });
};

/**
 * Show act transition choices after cinematic
 */
LuminaraQuiz.prototype.showActTransitionChoices = function(transition) {
  let transitionContainer = document.getElementById('act-transition-container');
  if (!transitionContainer) {
    transitionContainer = document.createElement('div');
    transitionContainer.id = 'act-transition-container';
    transitionContainer.className = 'act-transition-overlay';
    document.body.appendChild(transitionContainer);
  }
  transitionContainer.style.display = 'flex';

  const stats = ActSystem.getStats();

  // Build boss loot display
  const bossLootDisplay = this.lastBossLoot ? this.buildLootDisplay(this.lastBossLoot) : '';
  this.lastBossLoot = null; // Clear after use

  transitionContainer.innerHTML = `
    <div class="act-transition-content">
      <div class="act-complete-banner">Act ${transition.completedAct.actNumber} Complete!</div>
      <div class="act-complete-subtitle">${transition.completedAct.category.name} Mastered</div>

      <div class="act-stats-grid">
        <div class="act-stat">
          <div class="act-stat-value">${stats.accuracy}%</div>
          <div class="act-stat-label">Accuracy</div>
        </div>
        <div class="act-stat">
          <div class="act-stat-value">${stats.rebuttalsWon}</div>
          <div class="act-stat-label">Rebuttals Won</div>
        </div>
      </div>

      ${bossLootDisplay ? `
        <div class="boss-loot-section">
          <h3 style="color: var(--gold);">Boss Loot</h3>
          ${bossLootDisplay}
        </div>
      ` : ''}

      <h3 style="margin-bottom: 1rem; color: var(--text-secondary);">Choose Your Reward</h3>
      <div class="act-transition-choices">
        ${transition.choices.map(choice => `
          <button class="transition-choice-btn" data-transition-choice="${choice.id}">
            <span class="transition-choice-icon">${choice.icon}</span>
            <div class="transition-choice-info">
              <div class="transition-choice-name">${choice.name}</div>
              <div class="transition-choice-desc">${choice.description}</div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  // Attach event listeners after DOM update
  this.attachMapEventListeners();
};

/**
 * Select act transition reward
 */
LuminaraQuiz.prototype.selectActTransitionChoice = function(choiceId) {
  const result = ActSystem.applyTransitionChoice(choiceId, {
    maxHp: this.mapModeState.runState.maxHp
  });

  if (result?.type === 'heal') {
    this.mapModeState.runState.hp = Math.min(
      this.mapModeState.runState.maxHp,
      this.mapModeState.runState.hp + result.amount
    );
  }

  // Generate next act map
  const map = ActSystem.generateCurrentActMap();

  // Hide transition, show map
  document.getElementById('act-transition-container').style.display = 'none';
  this.mapModeState.runState.potions = PotionSystem.getInventory();
  MapRenderer.render(map, this.mapModeState.runState);
  MapRenderer.show();
};

/**
 * Show run complete screen
 */
LuminaraQuiz.prototype.showRunComplete = function(result) {
  const summary = ActSystem.generateRunSummary(true);

  // RUNMANAGER INTEGRATION: Complete the run (victory!)
  let runResult = null;
  if (typeof runManager !== 'undefined' && runManager && runManager.isRunActive()) {
    runResult = runManager.completeRun(true);
    debugLog('[MapMode] Run completed (victory!):', runResult);
  }

  // Use RunManager score if available (includes bonuses)
  const finalScore = runResult ? runResult.completedRun.score : summary.score;
  const isHighScore = runResult ? runResult.isHighScore : false;
  const tokensEarned = runResult ? runResult.tokensEarned : 0;
  const bestStreak = runResult ? runResult.bestStreak : summary.stats.bestStreak || 0;

  // Save high score
  if (typeof HighScores !== 'undefined' && finalScore > 0) {
    HighScores.submitScore('map_run', finalScore, {
      actsCompleted: summary.actsCompleted,
      accuracy: summary.stats.accuracy,
      runLength: summary.runLength,
      victory: true
    });
  }

  // Sound effect
  if (typeof SoundSystem !== 'undefined' && SoundSystem.playVictoryFanfare) {
    SoundSystem.playVictoryFanfare();
  }

  let completeContainer = document.getElementById('run-complete-container');
  if (!completeContainer) {
    completeContainer = document.createElement('div');
    completeContainer.id = 'run-complete-container';
    completeContainer.className = 'act-transition-overlay';
    document.body.appendChild(completeContainer);
  }
  completeContainer.style.display = 'flex';

  completeContainer.innerHTML = `
    <div class="act-transition-content">
      <div class="act-complete-banner" style="font-size: 3rem;">VICTORY!</div>
      <div class="act-complete-subtitle">Run Complete - ${summary.runLength.toUpperCase()}</div>
      ${isHighScore ? '<div class="new-high-score" style="margin: 1rem 0;">NEW HIGH SCORE!</div>' : ''}

      <div class="act-stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="act-stat">
          <div class="act-stat-value">${summary.stats.accuracy}</div>
          <div class="act-stat-label">Accuracy</div>
        </div>
        <div class="act-stat">
          <div class="act-stat-value">${finalScore}</div>
          <div class="act-stat-label">Score</div>
        </div>
        <div class="act-stat">
          <div class="act-stat-value">${summary.duration}</div>
          <div class="act-stat-label">Time</div>
        </div>
      </div>

      <div class="act-stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 1rem;">
        <div class="act-stat">
          <div class="act-stat-value">${summary.stats.bossesDefeated}</div>
          <div class="act-stat-label">Bosses</div>
        </div>
        <div class="act-stat">
          <div class="act-stat-value">${bestStreak}</div>
          <div class="act-stat-label">Best Streak</div>
        </div>
        <div class="act-stat">
          <div class="act-stat-value">${tokensEarned}</div>
          <div class="act-stat-label">Tokens</div>
        </div>
      </div>

      <div style="margin: 1.5rem 0; text-align: left;">
        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Categories Mastered:</p>
        <p style="color: var(--gold);">${summary.categories.join(' > ')}</p>
      </div>

      <button class="victory-continue-btn" data-action="exit-map-mode-victory">
        Return to Menu
      </button>
    </div>
  `;
  // Attach event listeners after DOM update
  this.attachMapEventListeners();
};

/**
 * Attach event listeners to map mode elements
 * Called after DOM updates to bind CSP-compliant event handlers
 */
LuminaraQuiz.prototype.attachMapEventListeners = function() {
  // Combat fallback option buttons
  document.querySelectorAll('.combat-fallback-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const answerIndex = parseInt(btn.dataset.answerIndex, 10);
      this.handleMapCombatAnswer(answerIndex);
    });
  });

  // Rebuttal/scaffold option buttons
  document.querySelectorAll('.scaffold-option[data-rebuttal-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      const answerIndex = parseInt(btn.dataset.rebuttalIndex, 10);
      const correctIndex = parseInt(btn.dataset.rebuttalCorrect, 10);
      this.handleRebuttalAnswer(answerIndex, correctIndex);
    });
  });

  // Card reward selection
  document.querySelectorAll('[data-card-reward]').forEach(card => {
    card.addEventListener('click', () => {
      const cardId = card.dataset.cardReward;
      this.selectMapCardReward(cardId);
    });
  });

  // Action buttons (skip, continue, exit, etc.)
  document.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener('click', () => {
      switch(action) {
        case 'skip-card-reward':
          this.skipMapCardReward();
          break;
        case 'return-to-map':
          this.returnToMap();
          break;
        case 'exit-map-mode':
          this.exitMapMode();
          break;
        case 'exit-map-mode-victory':
          this.exitMapMode();
          const container = document.getElementById('run-complete-container');
          if (container) container.style.display = 'none';
          break;
        case 'rest-heal':
          this.restSiteHeal();
          break;
        case 'rest-upgrade':
          this.restSiteUpgrade();
          break;
      }
    });
  });

  // Transition choice buttons
  document.querySelectorAll('[data-transition-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      const choiceId = btn.dataset.transitionChoice;
      this.selectActTransitionChoice(choiceId);
    });
  });
};

})(); // End IIFE wrapper
