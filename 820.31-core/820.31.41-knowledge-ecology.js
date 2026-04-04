/**
 * Knowledge Ecology Engine
 * @file 820.31.41-knowledge-ecology.js
 * @codon 820.31.41
 * @version 2026-03-29
 *
 * Game Path 2: A living ecosystem where concepts are creatures that evolve,
 * compete, and form symbiotic relationships. The player is the ecosystem manager.
 *
 * Research Basis:
 * - Ebbinghaus: Forgetting curve as creature starvation
 * - Vygotsky: ZPD as ecosystem frontier
 * - Systems thinking: Knowledge as interconnected web
 *
 * TAIDRGEF Signature: A.G.T.D
 * - A (Aggregate): Creatures aggregate into ecosystems
 * - G (Gravitate): Creatures gravitate toward health
 * - T (Transform): Creatures transform through evolution
 * - D (Diminish): Neglected creatures diminish (atrophy)
 */

class KnowledgeEcologyEngine {
  constructor(questionStatistics, learningAnalytics, persistence) {
    this.questionStatistics = questionStatistics;
    this.learningAnalytics = learningAnalytics;
    this.persistence = persistence;

    this.STORAGE_KEY = 'ms_luminara_knowledge_ecology';
    this.data = this.loadData();

    // Ecosystem configuration
    this.config = {
      healthDecayPerDay: 5,           // HP lost per day without practice
      minHealthForAlive: 10,          // Below this, creature is "starving"
      maxHealth: 100,                 // Maximum creature health
      feedingBonus: 15,               // HP gained from correct answer
      feedingBonusFirstTry: 25,       // HP gained from first-try correct
      breedingThreshold: 60,          // Health needed to breed
      evolutionThreshold: 80,         // Health needed to evolve
      invasiveSpawnRate: 0.1,         // Chance per session for invasive spawn
      legendarySpawnThreshold: 0.85,  // Ecosystem health for legendary spawn
    };

    // Creature tiers (food chain)
    this.TIERS = {
      PRODUCER: {
        name: 'Producer',
        description: 'Foundational concepts that feed higher tiers',
        icon: '🌱',
        color: '#228B22',
        healthMultiplier: 1.0
      },
      PRIMARY_CONSUMER: {
        name: 'Primary Consumer',
        description: 'Applied concepts that depend on producers',
        icon: '🐛',
        color: '#DAA520',
        healthMultiplier: 1.2
      },
      SECONDARY_CONSUMER: {
        name: 'Secondary Consumer',
        description: 'Complex concepts that integrate multiple primaries',
        icon: '🦎',
        color: '#4682B4',
        healthMultiplier: 1.4
      },
      APEX_PREDATOR: {
        name: 'Apex Predator',
        description: 'Integration concepts that synthesize across domains',
        icon: '🦅',
        color: '#8B008B',
        healthMultiplier: 1.6
      }
    };

    // Evolution stages
    this.EVOLUTION_STAGES = {
      EGG: { name: 'Egg', icon: '🥒', minMastery: 0 },
      JUVENILE: { name: 'Juvenile', icon: '🌿', minMastery: 0.25 },
      ADULT: { name: 'Adult', icon: '🌳', minMastery: 0.50 },
      ELDER: { name: 'Elder', icon: '🌲', minMastery: 0.75 },
      LEGENDARY: { name: 'Legendary', icon: '✨', minMastery: 0.95 }
    };

    // Creature species by category
    this.SPECIES = {
      '611': { name: 'Anatomicon', habitat: 'Structural Plains' },
      '612': { name: 'Physiologos', habitat: 'Functional Depths' },
      '612.2': { name: 'Respiratus', habitat: 'Breath Gardens' },
      '612.8': { name: 'Neuronyx', habitat: 'Synaptic Forest' },
      'default': { name: 'Cognitas', habitat: 'Knowledge Wilds' }
    };

    // Invasive species (misconceptions)
    this.INVASIVES = [
      { name: 'Confusium', icon: '🦠', effect: 'Drains nearby creature health' },
      { name: 'Misleadia', icon: '🕷️', effect: 'Creates false connections' },
      { name: 'Forgetix', icon: '💨', effect: 'Accelerates decay rate' },
      { name: 'Overconfidus', icon: '🦚', effect: 'Masks actual health levels' }
    ];
  }

  // ============================================================
  // CYCLE 1: ECOSYSTEM MODEL
  // ============================================================

  /**
   * Initialize or update the ecosystem from current learning state
   */
  initializeEcosystem() {
    // Get all question statistics
    const questionStats = this.questionStatistics?.data?.questionStats || {};

    // Group questions by concept cluster (using isotopes/categories)
    const conceptClusters = this.clusterQuestionsByConcept(questionStats);

    // Create or update creatures for each cluster
    for (const [clusterId, questions] of Object.entries(conceptClusters)) {
      this.ensureCreatureExists(clusterId, questions);
    }

    // Update all creature health based on last practice
    this.updateAllCreatureHealth();

    // Calculate ecosystem health
    this.calculateEcosystemHealth();

    // Check for invasive species
    this.checkForInvasives();

    // Check for legendary spawns
    this.checkForLegendarySpawns();

    this.save();

    return this.getEcosystemOverview();
  }

  /**
   * Cluster questions by concept (using category as proxy)
   */
  clusterQuestionsByConcept(questionStats) {
    const clusters = {};

    for (const [questionId, stats] of Object.entries(questionStats)) {
      // Extract concept cluster from question ID
      const clusterId = this.extractClusterId(questionId);

      if (!clusters[clusterId]) {
        clusters[clusterId] = [];
      }

      clusters[clusterId].push({
        questionId,
        stats,
        mastery: this.calculateQuestionMastery(stats)
      });
    }

    return clusters;
  }

  /**
   * Extract cluster ID from question ID
   */
  extractClusterId(questionId) {
    // Use first two segments of Dewey code (e.g., "612.2" from "612.2.15")
    const match = questionId.match(/^(\d+(?:\.\d+)?)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Calculate mastery for a single question
   */
  calculateQuestionMastery(stats) {
    if (!stats.attempts || stats.attempts === 0) return 0;

    const correctRate = (stats.correctFirstTry || 0) / stats.attempts;
    const totalCorrect = (stats.correct || 0) / stats.attempts;

    // Weight first-try correct more heavily
    return (correctRate * 0.7) + (totalCorrect * 0.3);
  }

  /**
   * Ensure a creature exists for a concept cluster
   */
  ensureCreatureExists(clusterId, questions) {
    if (!this.data.creatures[clusterId]) {
      const creature = this.createCreature(clusterId, questions);
      this.data.creatures[clusterId] = creature;
    } else {
      // Update existing creature with current question data
      this.updateCreature(clusterId, questions);
    }
  }

  /**
   * Create a new creature from a concept cluster
   */
  createCreature(clusterId, questions) {
    const species = this.getSpecies(clusterId);
    const tier = this.determineTier(clusterId, questions);
    const mastery = this.calculateClusterMastery(questions);
    const evolutionStage = this.determineEvolutionStage(mastery);

    return {
      id: clusterId,
      name: `${species.name} (${clusterId})`,
      species: species,
      tier: tier,
      tierData: this.TIERS[tier],
      evolutionStage: evolutionStage,
      stageData: this.EVOLUTION_STAGES[evolutionStage],

      // Health system
      health: Math.round(mastery * this.config.maxHealth),
      maxHealth: this.config.maxHealth,
      lastFed: Date.now(),

      // Mastery tracking
      mastery: mastery,
      questionCount: questions.length,
      questionsCorrect: questions.filter(q => q.mastery > 0.5).length,

      // Relationships
      dependencies: [],  // Creatures this one depends on (food sources)
      dependents: [],    // Creatures that depend on this one

      // State
      state: 'HEALTHY',  // HEALTHY, HUNGRY, STARVING, THRIVING, EVOLVING
      createdAt: Date.now(),
      feedCount: 0,
      timesEvolved: 0
    };
  }

  /**
   * Update an existing creature
   */
  updateCreature(clusterId, questions) {
    const creature = this.data.creatures[clusterId];
    const mastery = this.calculateClusterMastery(questions);
    const evolutionStage = this.determineEvolutionStage(mastery);

    creature.mastery = mastery;
    creature.questionCount = questions.length;
    creature.questionsCorrect = questions.filter(q => q.mastery > 0.5).length;

    // Check for evolution
    if (this.EVOLUTION_STAGES[evolutionStage].minMastery >
        this.EVOLUTION_STAGES[creature.evolutionStage].minMastery) {
      creature.evolutionStage = evolutionStage;
      creature.stageData = this.EVOLUTION_STAGES[evolutionStage];
      creature.timesEvolved++;
      creature.state = 'EVOLVING';
    }
  }

  /**
   * Calculate aggregate mastery for a cluster
   */
  calculateClusterMastery(questions) {
    if (questions.length === 0) return 0;

    const totalMastery = questions.reduce((sum, q) => sum + q.mastery, 0);
    return totalMastery / questions.length;
  }

  /**
   * Determine creature tier based on concept complexity
   */
  determineTier(clusterId, questions) {
    // Use average question difficulty as proxy for tier
    const avgDifficulty = this.calculateAverageDifficulty(questions);

    if (avgDifficulty < 0.3) return 'PRODUCER';
    if (avgDifficulty < 0.5) return 'PRIMARY_CONSUMER';
    if (avgDifficulty < 0.7) return 'SECONDARY_CONSUMER';
    return 'APEX_PREDATOR';
  }

  /**
   * Calculate average difficulty of questions
   */
  calculateAverageDifficulty(questions) {
    if (questions.length === 0) return 0.5;

    const totalDifficulty = questions.reduce((sum, q) => {
      const stats = q.stats;
      if (!stats.attempts) return sum + 0.5;
      const correctRate = (stats.correct || 0) / stats.attempts;
      return sum + (1 - correctRate);
    }, 0);

    return totalDifficulty / questions.length;
  }

  /**
   * Determine evolution stage based on mastery
   */
  determineEvolutionStage(mastery) {
    if (mastery >= 0.95) return 'LEGENDARY';
    if (mastery >= 0.75) return 'ELDER';
    if (mastery >= 0.50) return 'ADULT';
    if (mastery >= 0.25) return 'JUVENILE';
    return 'EGG';
  }

  /**
   * Get species for a cluster
   */
  getSpecies(clusterId) {
    for (const [prefix, species] of Object.entries(this.SPECIES)) {
      if (prefix !== 'default' && clusterId.startsWith(prefix)) {
        return species;
      }
    }
    return this.SPECIES.default;
  }

  /**
   * Update health for all creatures based on time decay
   */
  updateAllCreatureHealth() {
    const now = Date.now();

    for (const creature of Object.values(this.data.creatures)) {
      const daysSinceFeeding = (now - creature.lastFed) / (1000 * 60 * 60 * 24);
      const healthLoss = Math.round(daysSinceFeeding * this.config.healthDecayPerDay);

      creature.health = Math.max(0, creature.health - healthLoss);

      // Update state based on health
      if (creature.health <= 0) {
        creature.state = 'DEAD';
      } else if (creature.health < this.config.minHealthForAlive) {
        creature.state = 'STARVING';
      } else if (creature.health < this.config.maxHealth * 0.3) {
        creature.state = 'HUNGRY';
      } else if (creature.health >= this.config.evolutionThreshold) {
        creature.state = 'THRIVING';
      } else {
        creature.state = 'HEALTHY';
      }
    }
  }

  /**
   * Calculate overall ecosystem health
   */
  calculateEcosystemHealth() {
    const creatures = Object.values(this.data.creatures);
    if (creatures.length === 0) {
      this.data.ecosystemHealth = 0;
      return;
    }

    const totalHealth = creatures.reduce((sum, c) => sum + c.health, 0);
    const maxPossible = creatures.length * this.config.maxHealth;

    this.data.ecosystemHealth = totalHealth / maxPossible;

    // Calculate tier balance
    const tierCounts = { PRODUCER: 0, PRIMARY_CONSUMER: 0, SECONDARY_CONSUMER: 0, APEX_PREDATOR: 0 };
    for (const creature of creatures) {
      tierCounts[creature.tier]++;
    }

    this.data.tierBalance = tierCounts;

    // Check for imbalance
    const totalCreatures = creatures.length;
    const idealDistribution = {
      PRODUCER: 0.4,
      PRIMARY_CONSUMER: 0.3,
      SECONDARY_CONSUMER: 0.2,
      APEX_PREDATOR: 0.1
    };

    let imbalanceScore = 0;
    for (const [tier, ideal] of Object.entries(idealDistribution)) {
      const actual = tierCounts[tier] / totalCreatures;
      imbalanceScore += Math.abs(actual - ideal);
    }

    this.data.ecosystemImbalance = imbalanceScore;
  }

  /**
   * Check for invasive species spawning
   */
  checkForInvasives() {
    // Invasives spawn when ecosystem is imbalanced or has dead creatures
    const deadCreatures = Object.values(this.data.creatures).filter(c => c.state === 'DEAD');
    const starvingCreatures = Object.values(this.data.creatures).filter(c => c.state === 'STARVING');

    if (deadCreatures.length > 0 || this.data.ecosystemImbalance > 0.3) {
      if (Math.random() < this.config.invasiveSpawnRate) {
        this.spawnInvasive();
      }
    }
  }

  /**
   * Spawn an invasive species
   */
  spawnInvasive() {
    const invasiveType = this.INVASIVES[Math.floor(Math.random() * this.INVASIVES.length)];

    const invasive = {
      id: `invasive_${Date.now()}`,
      ...invasiveType,
      spawnedAt: Date.now(),
      targetCluster: this.selectInvasiveTarget(),
      defeated: false
    };

    this.data.invasives.push(invasive);

    return invasive;
  }

  /**
   * Select target for invasive (weakest cluster)
   */
  selectInvasiveTarget() {
    const creatures = Object.values(this.data.creatures);
    if (creatures.length === 0) return null;

    // Target the weakest creature
    creatures.sort((a, b) => a.health - b.health);
    return creatures[0].id;
  }

  /**
   * Check for legendary creature spawns
   */
  checkForLegendarySpawns() {
    if (this.data.ecosystemHealth >= this.config.legendarySpawnThreshold) {
      // Check if we haven't spawned a legendary recently
      const lastLegendary = this.data.legendarySpawns[this.data.legendarySpawns.length - 1];
      const daysSinceLast = lastLegendary
        ? (Date.now() - lastLegendary.spawnedAt) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysSinceLast > 7) {
        this.spawnLegendaryCreature();
      }
    }
  }

  /**
   * Spawn a legendary creature
   */
  spawnLegendaryCreature() {
    const legendaries = [
      { name: 'Phoenix of Knowledge', icon: '🔥', bonus: 'Double XP for 24 hours' },
      { name: 'Leviathan of Wisdom', icon: '🐋', bonus: 'All creatures gain 20 health' },
      { name: 'Dragon of Insight', icon: '🐲', bonus: 'Reveals all prerequisite connections' },
      { name: 'Unicorn of Clarity', icon: '🦄', bonus: 'Clears one invasive species' }
    ];

    const legendary = legendaries[Math.floor(Math.random() * legendaries.length)];

    const spawn = {
      id: `legendary_${Date.now()}`,
      ...legendary,
      spawnedAt: Date.now(),
      claimed: false
    };

    this.data.legendarySpawns.push(spawn);

    return spawn;
  }

  /**
   * Get ecosystem overview
   */
  getEcosystemOverview() {
    const creatures = Object.values(this.data.creatures);

    return {
      totalCreatures: creatures.length,
      ecosystemHealth: Math.round(this.data.ecosystemHealth * 100),
      tierBalance: this.data.tierBalance,
      imbalance: Math.round(this.data.ecosystemImbalance * 100),

      stateBreakdown: {
        thriving: creatures.filter(c => c.state === 'THRIVING').length,
        healthy: creatures.filter(c => c.state === 'HEALTHY').length,
        hungry: creatures.filter(c => c.state === 'HUNGRY').length,
        starving: creatures.filter(c => c.state === 'STARVING').length,
        dead: creatures.filter(c => c.state === 'DEAD').length
      },

      invasiveCount: this.data.invasives.filter(i => !i.defeated).length,
      legendaryAvailable: this.data.legendarySpawns.filter(l => !l.claimed).length,

      creatures: creatures.map(c => ({
        id: c.id,
        name: c.name,
        tier: c.tier,
        icon: c.tierData.icon,
        evolutionIcon: c.stageData.icon,
        health: c.health,
        maxHealth: c.maxHealth,
        state: c.state,
        mastery: Math.round(c.mastery * 100)
      }))
    };
  }

  // ============================================================
  // CYCLE 2: CREATURE DYNAMICS
  // ============================================================

  /**
   * Feed a creature (called when answering a question correctly)
   * @param {string} questionId - The question that was answered
   * @param {boolean} firstTry - Whether it was first attempt
   * @param {Object} questionData - Additional question data
   * @returns {Object} Feeding result
   */
  feedCreature(questionId, firstTry, questionData = {}) {
    const clusterId = this.extractClusterId(questionId);
    const creature = this.data.creatures[clusterId];

    if (!creature) {
      return {
        success: false,
        error: 'creature_not_found',
        message: 'No creature found for this concept cluster'
      };
    }

    // Calculate health gain
    const healthGain = firstTry
      ? this.config.feedingBonusFirstTry
      : this.config.feedingBonus;

    const previousHealth = creature.health;
    const previousState = creature.state;

    // Apply health
    creature.health = Math.min(creature.maxHealth, creature.health + healthGain);
    creature.lastFed = Date.now();
    creature.feedCount++;

    // Update state
    this.updateCreatureState(creature);

    // Check for evolution trigger
    const evolutionResult = this.checkEvolution(creature);

    // Check for cascade feeding (dependent creatures get small bonus)
    const cascadeResults = this.cascadeFeeding(creature);

    // Record feeding
    this.data.feedingHistory.push({
      creatureId: creature.id,
      questionId: questionId,
      healthGain: healthGain,
      timestamp: Date.now(),
      firstTry: firstTry
    });

    this.save();

    return {
      success: true,
      creature: {
        id: creature.id,
        name: creature.name,
        icon: creature.tierData.icon,
        evolutionIcon: creature.stageData.icon
      },
      healthGain: healthGain,
      previousHealth: previousHealth,
      newHealth: creature.health,
      previousState: previousState,
      newState: creature.state,
      evolved: evolutionResult.evolved,
      evolutionResult: evolutionResult,
      cascadeResults: cascadeResults,
      message: this.getFeedingMessage(creature, healthGain, evolutionResult)
    };
  }

  /**
   * Update creature state based on health
   */
  updateCreatureState(creature) {
    if (creature.health <= 0) {
      creature.state = 'DEAD';
    } else if (creature.health < this.config.minHealthForAlive) {
      creature.state = 'STARVING';
    } else if (creature.health < this.config.maxHealth * 0.3) {
      creature.state = 'HUNGRY';
    } else if (creature.health >= this.config.evolutionThreshold) {
      creature.state = 'THRIVING';
    } else {
      creature.state = 'HEALTHY';
    }
  }

  /**
   * Check if creature can evolve
   */
  checkEvolution(creature) {
    const currentStageIndex = Object.keys(this.EVOLUTION_STAGES).indexOf(creature.evolutionStage);
    const stages = Object.entries(this.EVOLUTION_STAGES);

    // Find next stage
    for (let i = currentStageIndex + 1; i < stages.length; i++) {
      const [stageName, stageData] = stages[i];

      if (creature.mastery >= stageData.minMastery &&
          creature.health >= this.config.evolutionThreshold) {

        const previousStage = creature.evolutionStage;
        creature.evolutionStage = stageName;
        creature.stageData = stageData;
        creature.timesEvolved++;
        creature.state = 'EVOLVING';

        // Record evolution
        this.data.evolutionHistory.push({
          creatureId: creature.id,
          fromStage: previousStage,
          toStage: stageName,
          timestamp: Date.now(),
          mastery: creature.mastery
        });

        return {
          evolved: true,
          previousStage: previousStage,
          newStage: stageName,
          stageData: stageData,
          message: this.getEvolutionMessage(creature, previousStage, stageName)
        };
      }
    }

    return { evolved: false };
  }

  /**
   * Cascade feeding to dependent creatures
   */
  cascadeFeeding(sourceCreature) {
    const cascadeBonus = 5; // Small bonus for connected creatures
    const results = [];

    for (const dependentId of sourceCreature.dependents) {
      const dependent = this.data.creatures[dependentId];
      if (dependent && dependent.state !== 'DEAD') {
        const previousHealth = dependent.health;
        dependent.health = Math.min(dependent.maxHealth, dependent.health + cascadeBonus);

        results.push({
          creatureId: dependent.id,
          creatureName: dependent.name,
          healthGain: cascadeBonus,
          newHealth: dependent.health
        });
      }
    }

    return results;
  }

  /**
   * Breed two creatures to create a connection
   * @param {string} creature1Id - First creature
   * @param {string} creature2Id - Second creature
   * @returns {Object} Breeding result
   */
  breedCreatures(creature1Id, creature2Id) {
    const creature1 = this.data.creatures[creature1Id];
    const creature2 = this.data.creatures[creature2Id];

    if (!creature1 || !creature2) {
      return { success: false, error: 'creatures_not_found' };
    }

    // Check health requirements
    if (creature1.health < this.config.breedingThreshold ||
        creature2.health < this.config.breedingThreshold) {
      return {
        success: false,
        error: 'insufficient_health',
        message: `Both creatures need at least ${this.config.breedingThreshold} health to breed`,
        creature1Health: creature1.health,
        creature2Health: creature2.health
      };
    }

    // Check if connection already exists
    if (creature1.dependencies.includes(creature2Id) ||
        creature2.dependencies.includes(creature1Id)) {
      return {
        success: false,
        error: 'already_connected',
        message: 'These creatures are already connected'
      };
    }

    // Determine relationship based on tier
    const tier1Index = Object.keys(this.TIERS).indexOf(creature1.tier);
    const tier2Index = Object.keys(this.TIERS).indexOf(creature2.tier);

    let consumer, producer;
    if (tier1Index > tier2Index) {
      consumer = creature1;
      producer = creature2;
    } else if (tier2Index > tier1Index) {
      consumer = creature2;
      producer = creature1;
    } else {
      // Same tier - create symbiotic relationship
      creature1.dependencies.push(creature2Id);
      creature2.dependencies.push(creature1Id);
      creature1.dependents.push(creature2Id);
      creature2.dependents.push(creature1Id);

      this.data.breedingHistory.push({
        creature1Id,
        creature2Id,
        type: 'symbiotic',
        timestamp: Date.now()
      });

      this.save();

      return {
        success: true,
        type: 'symbiotic',
        message: `${creature1.name} and ${creature2.name} form a symbiotic bond!`,
        creature1: this.getCreatureSummary(creature1),
        creature2: this.getCreatureSummary(creature2)
      };
    }

    // Create producer-consumer relationship
    consumer.dependencies.push(producer.id);
    producer.dependents.push(consumer.id);

    this.data.breedingHistory.push({
      consumerId: consumer.id,
      producerId: producer.id,
      type: 'food_chain',
      timestamp: Date.now()
    });

    this.save();

    return {
      success: true,
      type: 'food_chain',
      message: `${consumer.name} now feeds on ${producer.name}!`,
      consumer: this.getCreatureSummary(consumer),
      producer: this.getCreatureSummary(producer)
    };
  }

  /**
   * Evolve a creature manually (requires multi-representational mastery)
   * @param {string} creatureId - Creature to evolve
   * @param {Object} representations - Representation mastery data
   */
  evolveCreature(creatureId, representations = {}) {
    const creature = this.data.creatures[creatureId];

    if (!creature) {
      return { success: false, error: 'creature_not_found' };
    }

    // Check representation requirements
    const requiredReps = ['verbal', 'graphical', 'clinical'];
    const hasAllReps = requiredReps.every(rep =>
      representations[rep] && representations[rep].mastery >= 0.6
    );

    if (!hasAllReps) {
      return {
        success: false,
        error: 'insufficient_representations',
        message: 'Evolution requires mastery in verbal, graphical, and clinical representations',
        currentReps: representations
      };
    }

    // Force evolution to next stage
    const result = this.forceEvolution(creature);

    if (result.evolved) {
      // Bonus: increase max health
      creature.maxHealth += 20;

      this.save();
    }

    return result;
  }

  /**
   * Force evolution to next stage
   */
  forceEvolution(creature) {
    const stages = Object.keys(this.EVOLUTION_STAGES);
    const currentIndex = stages.indexOf(creature.evolutionStage);

    if (currentIndex >= stages.length - 1) {
      return {
        evolved: false,
        error: 'max_evolution',
        message: `${creature.name} has reached maximum evolution!`
      };
    }

    const previousStage = creature.evolutionStage;
    const newStage = stages[currentIndex + 1];

    creature.evolutionStage = newStage;
    creature.stageData = this.EVOLUTION_STAGES[newStage];
    creature.timesEvolved++;

    this.data.evolutionHistory.push({
      creatureId: creature.id,
      fromStage: previousStage,
      toStage: newStage,
      timestamp: Date.now(),
      forced: true
    });

    return {
      evolved: true,
      previousStage: previousStage,
      newStage: newStage,
      stageData: this.EVOLUTION_STAGES[newStage],
      message: this.getEvolutionMessage(creature, previousStage, newStage)
    };
  }

  /**
   * Combat an invasive species
   * @param {string} invasiveId - Invasive to combat
   * @param {boolean} correctAnswer - Whether combat question was answered correctly
   */
  combatInvasive(invasiveId, correctAnswer) {
    const invasive = this.data.invasives.find(i => i.id === invasiveId);

    if (!invasive) {
      return { success: false, error: 'invasive_not_found' };
    }

    if (invasive.defeated) {
      return { success: false, error: 'already_defeated' };
    }

    if (correctAnswer) {
      invasive.defeated = true;
      invasive.defeatedAt = Date.now();

      // Heal the target cluster
      const targetCreature = this.data.creatures[invasive.targetCluster];
      if (targetCreature) {
        targetCreature.health = Math.min(
          targetCreature.maxHealth,
          targetCreature.health + 30
        );
        this.updateCreatureState(targetCreature);
      }

      this.save();

      return {
        success: true,
        defeated: true,
        invasive: invasive,
        message: `${invasive.name} has been defeated! The ecosystem breathes easier.`,
        healing: targetCreature ? {
          creatureId: targetCreature.id,
          healthRestored: 30
        } : null
      };
    } else {
      // Invasive damages the target
      const targetCreature = this.data.creatures[invasive.targetCluster];
      if (targetCreature) {
        targetCreature.health = Math.max(0, targetCreature.health - 15);
        this.updateCreatureState(targetCreature);
      }

      return {
        success: true,
        defeated: false,
        invasive: invasive,
        message: `${invasive.name} resists! It drains more life from the ecosystem.`,
        damage: targetCreature ? {
          creatureId: targetCreature.id,
          healthLost: 15
        } : null
      };
    }
  }

  /**
   * Claim a legendary creature bonus
   * @param {string} legendaryId - Legendary to claim
   */
  claimLegendary(legendaryId) {
    const legendary = this.data.legendarySpawns.find(l => l.id === legendaryId);

    if (!legendary) {
      return { success: false, error: 'legendary_not_found' };
    }

    if (legendary.claimed) {
      return { success: false, error: 'already_claimed' };
    }

    legendary.claimed = true;
    legendary.claimedAt = Date.now();

    // Apply legendary bonus
    const bonusResult = this.applyLegendaryBonus(legendary);

    this.save();

    return {
      success: true,
      legendary: legendary,
      bonusApplied: bonusResult,
      message: `${legendary.name} bestows its blessing upon your ecosystem!`
    };
  }

  /**
   * Apply legendary creature bonus
   */
  applyLegendaryBonus(legendary) {
    switch (legendary.name) {
      case 'Phoenix of Knowledge':
        return {
          type: 'xp_multiplier',
          value: 2,
          duration: 24 * 60 * 60 * 1000, // 24 hours
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        };

      case 'Leviathan of Wisdom':
        // Heal all creatures
        let totalHealed = 0;
        for (const creature of Object.values(this.data.creatures)) {
          if (creature.state !== 'DEAD') {
            creature.health = Math.min(creature.maxHealth, creature.health + 20);
            totalHealed += 20;
            this.updateCreatureState(creature);
          }
        }
        return { type: 'mass_heal', totalHealed };

      case 'Dragon of Insight':
        // Reveal all prerequisites
        return { type: 'reveal_prerequisites', revealed: true };

      case 'Unicorn of Clarity':
        // Clear one invasive
        const activeInvasive = this.data.invasives.find(i => !i.defeated);
        if (activeInvasive) {
          activeInvasive.defeated = true;
          activeInvasive.defeatedAt = Date.now();
          return { type: 'clear_invasive', invasive: activeInvasive };
        }
        return { type: 'clear_invasive', noInvasives: true };

      default:
        return { type: 'unknown' };
    }
  }

  /**
   * Get starving creatures that need attention
   */
  getStarvingCreatures() {
    return Object.values(this.data.creatures)
      .filter(c => c.state === 'STARVING' || c.state === 'HUNGRY')
      .sort((a, b) => a.health - b.health)
      .map(c => this.getCreatureSummary(c));
  }

  /**
   * Get thriving creatures ready for evolution
   */
  getEvolutionCandidates() {
    return Object.values(this.data.creatures)
      .filter(c => c.state === 'THRIVING' && c.evolutionStage !== 'LEGENDARY')
      .map(c => ({
        ...this.getCreatureSummary(c),
        nextStage: this.getNextStage(c),
        requirementsMetPercent: Math.round((c.mastery / this.getNextStageThreshold(c)) * 100)
      }));
  }

  /**
   * Get next evolution stage for creature
   */
  getNextStage(creature) {
    const stages = Object.keys(this.EVOLUTION_STAGES);
    const currentIndex = stages.indexOf(creature.evolutionStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  /**
   * Get threshold for next evolution stage
   */
  getNextStageThreshold(creature) {
    const nextStage = this.getNextStage(creature);
    return nextStage ? this.EVOLUTION_STAGES[nextStage].minMastery : 1.0;
  }

  /**
   * Get creature summary
   */
  getCreatureSummary(creature) {
    return {
      id: creature.id,
      name: creature.name,
      tier: creature.tier,
      tierIcon: creature.tierData.icon,
      evolutionStage: creature.evolutionStage,
      stageIcon: creature.stageData.icon,
      health: creature.health,
      maxHealth: creature.maxHealth,
      healthPercent: Math.round((creature.health / creature.maxHealth) * 100),
      state: creature.state,
      mastery: Math.round(creature.mastery * 100),
      feedCount: creature.feedCount,
      timesEvolved: creature.timesEvolved,
      dependencies: creature.dependencies.length,
      dependents: creature.dependents.length
    };
  }

  // ============================================================
  // MS. LUMINARA VOICE
  // ============================================================

  getFeedingMessage(creature, healthGain, evolutionResult) {
    if (evolutionResult.evolved) {
      return evolutionResult.message;
    }

    const messages = {
      THRIVING: [
        `${creature.name} purrs with contentment. (+${healthGain} HP)`,
        `Your ${creature.stageData.icon} thrives on this knowledge!`
      ],
      HEALTHY: [
        `${creature.name} gratefully accepts your offering. (+${healthGain} HP)`,
        `The ${creature.tierData.icon} grows stronger.`
      ],
      HUNGRY: [
        `${creature.name} devours the knowledge eagerly! (+${healthGain} HP)`,
        `Your hungry ${creature.stageData.icon} is relieved.`
      ],
      STARVING: [
        `${creature.name} gasps back to life! (+${healthGain} HP)`,
        `Just in time! The ${creature.tierData.icon} was fading.`
      ]
    };

    const stateMessages = messages[creature.state] || messages.HEALTHY;
    return stateMessages[Math.floor(Math.random() * stateMessages.length)];
  }

  getEvolutionMessage(creature, fromStage, toStage) {
    const fromData = this.EVOLUTION_STAGES[fromStage];
    const toData = this.EVOLUTION_STAGES[toStage];

    return `${creature.name} EVOLVES! ${fromData.icon} -> ${toData.icon}\n` +
           `From ${fromStage} to ${toStage}!\n` +
           `Your understanding has deepened.`;
  }

  // ============================================================
  // PERSISTENCE
  // ============================================================

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('KnowledgeEcology: Could not load data', e);
    }

    return {
      creatures: {},
      ecosystemHealth: 0,
      tierBalance: {},
      ecosystemImbalance: 0,
      invasives: [],
      legendarySpawns: [],
      feedingHistory: [],
      breedingHistory: [],
      evolutionHistory: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('KnowledgeEcology: Could not save data', e);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KnowledgeEcologyEngine };
}
