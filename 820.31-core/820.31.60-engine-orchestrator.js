/**
 * 820.31.60-engine-orchestrator.js
 * @codon 820.31.60
 * @version 2026-03-29
 * @description Central orchestrator that wires all game paths and teaching integrations together
 *
 * TAIDRGEF Signature: A.G.F.R (Aggregate all engines, Gravitate to learner state,
 *                              Frame unified experience, React to events)
 *
 * This orchestrator connects:
 * - 7 Game Paths (820.31.40-46): Misconception Dungeon, Knowledge Ecology, Temporal Heist,
 *   Reputation Engine, Dream Laboratory, Crafting System, Metamorphosis Engine
 * - 7 Teaching Integrations (820.31.50-56): Phase-Locked Encounters, Curiosity Economy,
 *   Scaffold Deck Builder, Emotional Weather, Representation Rotation, Prerequisite Web,
 *   Growth Signal Feedback
 */

(function() {
  'use strict';

  // =============================================================================
  // ENGINE ORCHESTRATOR
  // =============================================================================

  const EngineOrchestrator = {
    // Engine references (populated on init)
    engines: {
      // Game Paths
      misconceptionDungeon: null,
      knowledgeEcology: null,
      temporalHeist: null,
      reputationEngine: null,
      dreamLaboratory: null,
      craftingSystem: null,
      metamorphosisEngine: null,

      // Teaching Integrations
      phaseLockedEncounters: null,
      curiosityEconomy: null,
      scaffoldDeckBuilder: null,
      emotionalWeather: null,
      representationRotation: null,
      prerequisiteWeb: null,
      growthSignalFeedback: null
    },

    // Orchestrator state
    state: {
      initialized: false,
      activeGamePath: null,
      currentPhase: 'engage',
      sessionStartTime: null,
      eventLog: []
    },

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    init() {
      if (this.state.initialized) return;

      console.log('[EngineOrchestrator] Initializing...');
      this.state.sessionStartTime = Date.now();

      // Bind to window-level engine instances
      this.bindEngines();

      // Set up cross-engine event routing
      this.setupEventRouting();

      // Initialize prerequisite web from question data
      this.initializePrerequisiteWeb();

      this.state.initialized = true;
      console.log('[EngineOrchestrator] Initialization complete');

      return this;
    },

    bindEngines() {
      // Game Paths
      this.engines.misconceptionDungeon = window.misconceptionDungeon;
      this.engines.knowledgeEcology = window.knowledgeEcology;
      this.engines.temporalHeist = window.temporalHeist;
      this.engines.reputationEngine = window.reputationEngine;
      this.engines.dreamLaboratory = window.dreamLaboratory;
      this.engines.craftingSystem = window.craftingSystem;
      this.engines.metamorphosisEngine = window.metamorphosisEngine;

      // Teaching Integrations
      this.engines.phaseLockedEncounters = window.phaseLockedEncounters;
      this.engines.curiosityEconomy = window.curiosityEconomy;
      this.engines.scaffoldDeckBuilder = window.scaffoldDeckBuilder;
      this.engines.emotionalWeather = window.emotionalWeather;
      this.engines.representationRotation = window.representationRotation;
      this.engines.prerequisiteWeb = window.prerequisiteWeb;
      this.engines.growthSignalFeedback = window.growthSignalFeedback;

      // Log bound status
      const boundCount = Object.values(this.engines).filter(e => e !== null && e !== undefined).length;
      console.log(`[EngineOrchestrator] Bound ${boundCount}/14 engines`);
    },

    setupEventRouting() {
      // This sets up cross-engine communication patterns
      // Engines can emit events that other engines respond to
    },

    initializePrerequisiteWeb() {
      const web = this.engines.prerequisiteWeb;
      if (!web) return;

      // Build prerequisite graph from question categories
      // This would typically come from the question registry
      const categories = [
        { id: 'cells', name: 'Cell Biology', tier: 1, prereqs: [] },
        { id: 'tissues', name: 'Tissues', tier: 2, prereqs: ['cells'] },
        { id: 'organs', name: 'Organ Systems', tier: 3, prereqs: ['tissues'] },
        { id: 'nervous-basic', name: 'Nervous System Basics', tier: 2, prereqs: ['cells'] },
        { id: 'neurons', name: 'Neuron Structure', tier: 2, prereqs: ['cells', 'nervous-basic'] },
        { id: 'action-potential', name: 'Action Potentials', tier: 3, prereqs: ['neurons'] },
        { id: 'synapses', name: 'Synaptic Transmission', tier: 3, prereqs: ['action-potential'] },
        { id: 'brain', name: 'Brain Anatomy', tier: 3, prereqs: ['nervous-basic'] },
        { id: 'ans', name: 'Autonomic Nervous System', tier: 4, prereqs: ['brain', 'synapses'] },
        { id: 'senses', name: 'Special Senses', tier: 4, prereqs: ['neurons', 'brain'] },
        { id: 'endocrine', name: 'Endocrine System', tier: 3, prereqs: ['tissues'] }
      ];

      categories.forEach(cat => {
        web.addNode(cat.id, cat.name, cat.tier, cat.prereqs);
      });

      // Add edges
      categories.forEach(cat => {
        cat.prereqs.forEach(prereqId => {
          web.addEdge(prereqId, cat.id, 'prerequisite', 1.0);
        });
      });

      console.log('[EngineOrchestrator] Prerequisite web initialized with', categories.length, 'nodes');
    },

    // ==========================================================================
    // ANSWER PROCESSING - Main hook into quiz flow
    // ==========================================================================

    /**
     * Process a question answer through all relevant engines
     * This is the main integration point called from app.js
     */
    processAnswer(questionData, answerData) {
      const {
        questionId,
        conceptId,
        categoryId,
        isCorrect,
        firstTry,
        responseTimeMs,
        selectedAnswer,
        correctAnswer,
        representationType,
        masteryChange
      } = answerData;

      const results = {
        gamePath: null,
        teaching: null,
        rewards: [],
        feedback: [],
        stateChanges: []
      };

      // ========================================================================
      // TEACHING INTEGRATIONS (Process first - they influence game paths)
      // ========================================================================

      // 1. Emotional Weather - Track affect state
      if (this.engines.emotionalWeather) {
        this.engines.emotionalWeather.processAnswer(isCorrect, responseTimeMs, questionData);
        const weather = this.engines.emotionalWeather.getCurrentWeather();
        results.teaching = { ...results.teaching, emotionalWeather: weather };
      }

      // 2. Representation Rotation - Track multi-modal mastery
      if (this.engines.representationRotation && conceptId && representationType) {
        this.engines.representationRotation.trackRepresentation(conceptId, questionData, isCorrect);
        const mastery = this.engines.representationRotation.checkConceptMastery(conceptId);
        if (mastery.isMastered) {
          results.feedback.push({
            type: 'mastery_achieved',
            message: `Multi-representational mastery achieved for ${conceptId}!`
          });
        }
      }

      // 3. Prerequisite Web - Update concept progress
      if (this.engines.prerequisiteWeb && conceptId) {
        this.engines.prerequisiteWeb.updateProgress(conceptId, isCorrect, masteryChange || 0);
      }

      // 4. Growth Signal Feedback - Record attempt and check for signals
      if (this.engines.growthSignalFeedback) {
        this.engines.growthSignalFeedback.recordAttempt(questionId, conceptId, {
          isCorrect,
          firstTry,
          responseTimeMs,
          selectedAnswer,
          representationType
        });
      }

      // 5. Curiosity Economy - Award curiosity points
      if (this.engines.curiosityEconomy) {
        const curiosityResult = this.engines.curiosityEconomy.earn('answer_question', {
          isCorrect,
          firstTry,
          difficulty: questionData.difficulty || 'medium'
        });
        if (curiosityResult.earned > 0) {
          results.rewards.push({
            type: 'curiosity',
            amount: curiosityResult.earned,
            message: curiosityResult.message
          });
        }
      }

      // 6. Scaffold Deck Builder - Check for card grants
      if (this.engines.scaffoldDeckBuilder) {
        // Cards are granted based on activity
        const currentPhase = this.getCurrentPhase();
        const cards = this.engines.scaffoldDeckBuilder.getSuggestedCards(currentPhase);
        if (cards.length > 0) {
          results.teaching = { ...results.teaching, suggestedCards: cards };
        }
      }

      // ========================================================================
      // GAME PATH PROCESSING
      // ========================================================================

      // Process based on active game path
      const activePath = this.state.activeGamePath || this.detectActiveGamePath();

      if (activePath === 'misconception_dungeon' && this.engines.misconceptionDungeon) {
        results.gamePath = this.processMisconceptionDungeon(questionData, answerData);
      }
      else if (activePath === 'knowledge_ecology' && this.engines.knowledgeEcology) {
        results.gamePath = this.processKnowledgeEcology(questionData, answerData);
      }
      else if (activePath === 'temporal_heist' && this.engines.temporalHeist) {
        results.gamePath = this.processTemporalHeist(questionData, answerData);
      }
      else if (activePath === 'reputation' && this.engines.reputationEngine) {
        results.gamePath = this.processReputation(questionData, answerData);
      }
      else if (activePath === 'dream_laboratory' && this.engines.dreamLaboratory) {
        results.gamePath = this.processDreamLaboratory(questionData, answerData);
      }
      else if (activePath === 'crafting' && this.engines.craftingSystem) {
        results.gamePath = this.processCrafting(questionData, answerData);
      }
      else if (activePath === 'metamorphosis' && this.engines.metamorphosisEngine) {
        results.gamePath = this.processMetamorphosis(questionData, answerData);
      }

      // Log event
      this.logEvent('answer_processed', {
        questionId,
        isCorrect,
        gamePath: activePath,
        results
      });

      return results;
    },

    // ==========================================================================
    // GAME PATH PROCESSORS
    // ==========================================================================

    processMisconceptionDungeon(questionData, answerData) {
      const dungeon = this.engines.misconceptionDungeon;
      const { isCorrect, selectedAnswer, correctAnswer, categoryId } = answerData;

      if (isCorrect) {
        // Correct answer deals damage to boss
        return dungeon.dealDamage(
          questionData.difficulty === 'hard' ? 25 :
          questionData.difficulty === 'medium' ? 15 : 10
        );
      } else {
        // Wrong answer strengthens the misconception
        const wrongOption = questionData.options[selectedAnswer];
        dungeon.addMisconception(categoryId, {
          id: `misc_${questionData.id}_${selectedAnswer}`,
          text: wrongOption,
          correctAnswer: questionData.options[correctAnswer],
          explanation: questionData.explain
        });
        return { type: 'misconception_added', room: categoryId };
      }
    },

    processKnowledgeEcology(questionData, answerData) {
      const ecology = this.engines.knowledgeEcology;
      const { isCorrect, firstTry, conceptId, masteryChange } = answerData;

      // Feed the creature for this concept
      return ecology.feedCreature(conceptId, {
        correct: isCorrect,
        firstTry,
        masteryChange: masteryChange || 0
      });
    },

    processTemporalHeist(questionData, answerData) {
      const heist = this.engines.temporalHeist;
      const { isCorrect, firstTry, responseTimeMs } = answerData;

      if (isCorrect) {
        // Correct answer advances the heist
        return heist.advanceHeist(firstTry, responseTimeMs);
      } else {
        // Wrong answer triggers paradox
        return heist.triggerParadox();
      }
    },

    processReputation(questionData, answerData) {
      const rep = this.engines.reputationEngine;
      const { isCorrect, categoryId, conceptId } = answerData;

      // Map categories to factions
      const factionMap = {
        'nervous': 'neural_network',
        'endocrine': 'hormonal_council',
        'cardiovascular': 'circulatory_guild',
        'respiratory': 'respiratory_order',
        'digestive': 'metabolic_union'
      };

      const factionId = factionMap[categoryId] || 'seekers_of_balance';

      return rep.processInteraction(factionId, {
        correct: isCorrect,
        difficulty: questionData.difficulty || 'medium',
        conceptId
      });
    },

    processDreamLaboratory(questionData, answerData) {
      const dreams = this.engines.dreamLaboratory;
      const { isCorrect, categoryId, masteryChange, selectedAnswer, correctAnswer } = answerData;

      if (isCorrect) {
        // Correct answer adds dream element
        return dreams.addDreamElement(categoryId, questionData, masteryChange || 0.1);
      } else {
        // Wrong answer spawns nightmare
        return dreams.spawnNightmare(categoryId, questionData, {
          selectedIndex: selectedAnswer,
          selectedText: questionData.options[selectedAnswer],
          correctIndex: correctAnswer,
          correctText: questionData.options[correctAnswer]
        });
      }
    },

    processCrafting(questionData, answerData) {
      const crafting = this.engines.craftingSystem;
      const { isCorrect, firstTry, masteryChange } = answerData;

      // Gather materials from answering
      return crafting.gatherMaterials(questionData, isCorrect, firstTry, masteryChange || 0);
    },

    processMetamorphosis(questionData, answerData) {
      const meta = this.engines.metamorphosisEngine;
      const { isCorrect, firstTry, masteryChange } = answerData;

      // Process through metamorphosis engine
      return meta.processAnswer(questionData, isCorrect, firstTry, masteryChange || 0);
    },

    // ==========================================================================
    // PHASE MANAGEMENT (5E Model Integration)
    // ==========================================================================

    getCurrentPhase() {
      if (this.engines.phaseLockedEncounters) {
        return this.engines.phaseLockedEncounters.state.currentPhase;
      }
      return this.state.currentPhase;
    },

    setPhase(phase) {
      this.state.currentPhase = phase;
      if (this.engines.phaseLockedEncounters) {
        this.engines.phaseLockedEncounters.state.currentPhase = phase;
      }
    },

    /**
     * Get questions filtered by current 5E phase
     */
    getPhaseAppropriateQuestions(questionPool, count = 5) {
      const phaseEngine = this.engines.phaseLockedEncounters;
      if (!phaseEngine) return questionPool.slice(0, count);

      const learnerState = this.getLearnerState();
      const encounterType = this.detectEncounterType();

      return phaseEngine.selectQuestionsForPhase(encounterType, questionPool, learnerState, count);
    },

    detectEncounterType() {
      // Determine encounter type based on game context
      if (this.state.activeGamePath === 'misconception_dungeon') {
        return 'boss_battle';
      }
      if (this.state.activeGamePath === 'knowledge_ecology') {
        return 'exploration';
      }
      // Default based on progression
      return 'standard';
    },

    detectActiveGamePath() {
      // Detect which game path is currently active based on UI state
      // This could check for open modals, active map nodes, etc.
      return this.state.activeGamePath || 'standard';
    },

    // ==========================================================================
    // LEARNER STATE AGGREGATION
    // ==========================================================================

    getLearnerState() {
      const state = {
        overallMastery: 0,
        recentAccuracy: 0,
        emotionalState: 'neutral',
        activeStreaks: [],
        representationCoverage: {},
        frontierConcepts: []
      };

      // Aggregate from emotional weather
      if (this.engines.emotionalWeather) {
        const weather = this.engines.emotionalWeather.getCurrentWeather();
        state.emotionalState = weather.primary;
        state.emotionalIntensity = weather.confidence;
      }

      // Get frontier concepts from prerequisite web
      if (this.engines.prerequisiteWeb) {
        state.frontierConcepts = this.engines.prerequisiteWeb.getFrontierNodes();
      }

      // Get mastery from persistence if available
      if (window.persistence) {
        const masteryData = window.persistence.data?.categoryMastery || {};
        const values = Object.values(masteryData);
        if (values.length > 0) {
          state.overallMastery = values.reduce((a, b) => a + b, 0) / values.length;
        }
      }

      return state;
    },

    // ==========================================================================
    // DIFFICULTY ADJUSTMENT
    // ==========================================================================

    getDifficultyAdjustment() {
      let adjustment = 0;

      // Emotional weather adjustment
      if (this.engines.emotionalWeather) {
        adjustment += this.engines.emotionalWeather.getDifficultyAdjustment();
      }

      // Cap adjustment
      return Math.max(-0.3, Math.min(0.3, adjustment));
    },

    // ==========================================================================
    // UI RENDERING HELPERS
    // ==========================================================================

    /**
     * Get all UI panels that should be rendered
     */
    getActivePanels() {
      const panels = [];

      // Prerequisite web visualization
      if (this.engines.prerequisiteWeb) {
        panels.push({
          id: 'prerequisite-web',
          title: 'Knowledge Map',
          render: () => this.engines.prerequisiteWeb.getWebVisualization()
        });
      }

      // Growth signals
      if (this.engines.growthSignalFeedback) {
        const counter = this.engines.growthSignalFeedback.getContributionCounter();
        if (counter.totalContributions > 0) {
          panels.push({
            id: 'growth-signals',
            title: 'Your Contributions',
            render: () => counter
          });
        }
      }

      // Curiosity wallet
      if (this.engines.curiosityEconomy) {
        panels.push({
          id: 'curiosity-wallet',
          title: 'Curiosity Points',
          render: () => this.engines.curiosityEconomy.getWallet()
        });
      }

      // Active deck
      if (this.engines.scaffoldDeckBuilder) {
        panels.push({
          id: 'strategy-deck',
          title: 'Strategy Cards',
          render: () => this.engines.scaffoldDeckBuilder.state.activeDeck
        });
      }

      return panels;
    },

    /**
     * Render the metamorphosis mirror view
     */
    getMirrorView() {
      if (this.engines.metamorphosisEngine) {
        return this.engines.metamorphosisEngine.getMirrorView();
      }
      return null;
    },

    // ==========================================================================
    // GAME PATH SELECTION
    // ==========================================================================

    setActiveGamePath(pathId) {
      this.state.activeGamePath = pathId;
      this.logEvent('game_path_changed', { pathId });
    },

    getAvailableGamePaths() {
      return [
        {
          id: 'misconception_dungeon',
          name: 'Misconception Dungeon',
          icon: '🏰',
          description: 'Battle your misconceptions in a roguelike dungeon',
          available: !!this.engines.misconceptionDungeon
        },
        {
          id: 'knowledge_ecology',
          name: 'Knowledge Ecology',
          icon: '🌿',
          description: 'Nurture creatures that embody your knowledge',
          available: !!this.engines.knowledgeEcology
        },
        {
          id: 'temporal_heist',
          name: 'Temporal Heist',
          icon: '⏰',
          description: 'Steal knowledge across time periods',
          available: !!this.engines.temporalHeist
        },
        {
          id: 'reputation',
          name: 'Reputation Engine',
          icon: '🏛️',
          description: 'Build standing with anatomical factions',
          available: !!this.engines.reputationEngine
        },
        {
          id: 'dream_laboratory',
          name: 'Dream Laboratory',
          icon: '💭',
          description: 'Build surrealist memory palaces',
          available: !!this.engines.dreamLaboratory
        },
        {
          id: 'crafting',
          name: 'Crafting System',
          icon: '🔨',
          description: 'Forge knowledge into powerful artifacts',
          available: !!this.engines.craftingSystem
        },
        {
          id: 'metamorphosis',
          name: 'Metamorphosis Engine',
          icon: '🦋',
          description: 'Your body transforms to reflect your knowledge',
          available: !!this.engines.metamorphosisEngine
        }
      ];
    },

    // ==========================================================================
    // EVENT LOGGING
    // ==========================================================================

    logEvent(type, data) {
      this.state.eventLog.push({
        timestamp: Date.now(),
        type,
        data
      });

      // Keep log manageable
      if (this.state.eventLog.length > 1000) {
        this.state.eventLog = this.state.eventLog.slice(-500);
      }
    },

    // ==========================================================================
    // PERSISTENCE
    // ==========================================================================

    saveState() {
      const state = {
        activeGamePath: this.state.activeGamePath,
        currentPhase: this.state.currentPhase,
        sessionStartTime: this.state.sessionStartTime
      };

      try {
        localStorage.setItem('lumi_engine_orchestrator', JSON.stringify(state));
      } catch (e) {
        console.warn('[EngineOrchestrator] Failed to save state:', e);
      }
    },

    loadState() {
      try {
        const saved = localStorage.getItem('lumi_engine_orchestrator');
        if (saved) {
          const state = JSON.parse(saved);
          this.state.activeGamePath = state.activeGamePath;
          this.state.currentPhase = state.currentPhase;
        }
      } catch (e) {
        console.warn('[EngineOrchestrator] Failed to load state:', e);
      }
    }
  };

  // =============================================================================
  // EXPORT
  // =============================================================================

  // Export to window
  window.EngineOrchestrator = EngineOrchestrator;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => EngineOrchestrator.init(), 1500);
    });
  } else {
    setTimeout(() => EngineOrchestrator.init(), 1500);
  }

  // Module export for CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EngineOrchestrator;
  }

})();
