/**
 * Reputation Engine
 * @file 820.31.43-reputation-engine.js
 * @codon 820.31.43
 * @version 2026-03-29
 *
 * Game Path 4: A social simulation where you build reputation with different
 * "factions" representing different ways of knowing. Each faction values
 * different question types.
 *
 * Research Basis:
 * - Multiple Intelligences: Different valid ways of knowing
 * - McDermott P1: Multiple representations required for mastery
 * - Transfer: Different contexts strengthen understanding
 *
 * TAIDRGEF Signature: A.G.F.R
 * - A (Aggregate): Reputation aggregates from answers
 * - G (Gravitate): Player gravitates toward preferred factions
 * - F (Frame): Each faction frames knowledge differently
 * - R (React): Factions react to player performance
 */

class ReputationEngine {
  constructor(questionStatistics, learningAnalytics, persistence) {
    this.questionStatistics = questionStatistics;
    this.learningAnalytics = learningAnalytics;
    this.persistence = persistence;

    this.STORAGE_KEY = 'ms_luminara_reputation';
    this.data = this.loadData();

    // ============================================================
    // CYCLE 1: FACTION SYSTEM
    // ============================================================

    this.FACTIONS = {
      NOMENCLATORS: {
        id: 'nomenclators',
        name: 'The Nomenclators',
        icon: '📚',
        color: '#8B4513',
        motto: 'To name is to know',
        description: 'Scholars who believe precise terminology is the foundation of understanding',
        questionTypes: ['definition', 'terminology', 'etymology'],
        values: ['precision', 'vocabulary', 'classification'],
        headquarters: 'The Grand Library',
        leader: 'Archterminologist Lexica',
        rivalFaction: 'mechanists',
        rivalReason: 'Naming without understanding mechanism is hollow knowledge',
        ranks: [
          { level: 0, name: 'Initiate', repRequired: 0 },
          { level: 1, name: 'Scribe', repRequired: 100 },
          { level: 2, name: 'Lexicographer', repRequired: 300 },
          { level: 3, name: 'Terminologist', repRequired: 600 },
          { level: 4, name: 'Archterminologist', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Etymology Reveal', effect: 'Shows word origins' },
          300: { type: 'item', name: 'Mnemonic Codex', effect: '+10% retention on terminology' },
          600: { type: 'ability', name: 'Perfect Recall', effect: 'Hint on definition questions' },
          1000: { type: 'title', name: 'Keeper of Names' }
        }
      },

      MECHANISTS: {
        id: 'mechanists',
        name: 'The Mechanists',
        icon: '⚙️',
        color: '#4682B4',
        motto: 'How it works is what it is',
        description: 'Engineers of understanding who seek to know the process behind every phenomenon',
        questionTypes: ['mechanism', 'process', 'sequence'],
        values: ['causation', 'pathways', 'dynamics'],
        headquarters: 'The Clockwork Sanctum',
        leader: 'Chief Engineer Processus',
        rivalFaction: 'nomenclators',
        rivalReason: 'Names are labels; mechanisms are truth',
        ranks: [
          { level: 0, name: 'Apprentice', repRequired: 0 },
          { level: 1, name: 'Technician', repRequired: 100 },
          { level: 2, name: 'Engineer', repRequired: 300 },
          { level: 3, name: 'Architect', repRequired: 600 },
          { level: 4, name: 'Grand Engineer', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Process Map', effect: 'Visualize mechanism steps' },
          300: { type: 'item', name: 'Causal Chain', effect: '+10% on mechanism questions' },
          600: { type: 'ability', name: 'Trace Back', effect: 'See prerequisite chain' },
          1000: { type: 'title', name: 'Master of Mechanisms' }
        }
      },

      CLINICIANS: {
        id: 'clinicians',
        name: 'The Clinicians',
        icon: '🏥',
        color: '#DC143C',
        motto: 'Knowledge serves the patient',
        description: 'Practitioners who value applied understanding and real-world manifestation',
        questionTypes: ['clinical', 'application', 'case_study'],
        values: ['application', 'diagnosis', 'treatment'],
        headquarters: 'The Healing Hall',
        leader: 'Chief Practitioner Praxis',
        rivalFaction: 'historians',
        rivalReason: 'History is interesting; application saves lives',
        ranks: [
          { level: 0, name: 'Student', repRequired: 0 },
          { level: 1, name: 'Intern', repRequired: 100 },
          { level: 2, name: 'Resident', repRequired: 300 },
          { level: 3, name: 'Attending', repRequired: 600 },
          { level: 4, name: 'Chief of Service', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Patient Case', effect: 'See clinical manifestation' },
          300: { type: 'item', name: 'Diagnostic Key', effect: '+10% on clinical questions' },
          600: { type: 'ability', name: 'Clinical Reasoning', effect: 'Logical path through cases' },
          1000: { type: 'title', name: 'Master Clinician' }
        }
      },

      INTEGRATORS: {
        id: 'integrators',
        name: 'The Integrators',
        icon: '🌐',
        color: '#9370DB',
        motto: 'Everything connects',
        description: 'Systems thinkers who find patterns across domains and synthesize understanding',
        questionTypes: ['integration', 'comparison', 'synthesis'],
        values: ['connections', 'patterns', 'holism'],
        headquarters: 'The Nexus',
        leader: 'Weaver Prime Synthesis',
        rivalFaction: null,
        rivalReason: null,
        ranks: [
          { level: 0, name: 'Observer', repRequired: 0 },
          { level: 1, name: 'Connector', repRequired: 100 },
          { level: 2, name: 'Synthesizer', repRequired: 300 },
          { level: 3, name: 'Weaver', repRequired: 600 },
          { level: 4, name: 'Weaver Prime', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Connection Map', effect: 'See concept relationships' },
          300: { type: 'item', name: 'Pattern Lens', effect: '+10% on integration questions' },
          600: { type: 'ability', name: 'Cross-Reference', effect: 'Link distant concepts' },
          1000: { type: 'title', name: 'Master of Connections' }
        }
      },

      HISTORIANS: {
        id: 'historians',
        name: 'The Historians',
        icon: '📜',
        color: '#DAA520',
        motto: 'To know where we are, know where we came from',
        description: 'Chroniclers who understand present knowledge through its evolution',
        questionTypes: ['history', 'discovery', 'evolution'],
        values: ['context', 'progress', 'perspective'],
        headquarters: 'The Archive',
        leader: 'Archivist Prime Memoria',
        rivalFaction: 'clinicians',
        rivalReason: 'Without history, we repeat mistakes',
        ranks: [
          { level: 0, name: 'Reader', repRequired: 0 },
          { level: 1, name: 'Researcher', repRequired: 100 },
          { level: 2, name: 'Scholar', repRequired: 300 },
          { level: 3, name: 'Archivist', repRequired: 600 },
          { level: 4, name: 'Archivist Prime', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Historical Context', effect: 'See discovery story' },
          300: { type: 'item', name: 'Timeline Scroll', effect: '+10% on history questions' },
          600: { type: 'ability', name: 'Hindsight', effect: 'See how misconceptions evolved' },
          1000: { type: 'title', name: 'Keeper of History' }
        }
      },

      FUTURISTS: {
        id: 'futurists',
        name: 'The Futurists',
        icon: '🔮',
        color: '#00CED1',
        motto: 'What we know shapes what we become',
        description: 'Visionaries who extrapolate current knowledge to future implications',
        questionTypes: ['prediction', 'implication', 'speculation'],
        values: ['innovation', 'possibility', 'ethics'],
        headquarters: 'The Observatory',
        leader: 'Seer Prime Horizon',
        rivalFaction: null,
        rivalReason: null,
        ranks: [
          { level: 0, name: 'Dreamer', repRequired: 0 },
          { level: 1, name: 'Forecaster', repRequired: 100 },
          { level: 2, name: 'Visionary', repRequired: 300 },
          { level: 3, name: 'Oracle', repRequired: 600 },
          { level: 4, name: 'Seer Prime', repRequired: 1000 }
        ],
        rewards: {
          100: { type: 'card', name: 'Future Glimpse', effect: 'See emerging applications' },
          300: { type: 'item', name: 'Possibility Engine', effect: '+10% on prediction questions' },
          600: { type: 'ability', name: 'Extrapolate', effect: 'Project current trends forward' },
          1000: { type: 'title', name: 'Master of Possibility' }
        }
      }
    };

    // Question type to faction mapping
    this.QUESTION_TYPE_FACTIONS = {
      definition: ['nomenclators'],
      terminology: ['nomenclators'],
      etymology: ['nomenclators', 'historians'],
      mechanism: ['mechanists'],
      process: ['mechanists'],
      sequence: ['mechanists'],
      clinical: ['clinicians'],
      application: ['clinicians'],
      case_study: ['clinicians'],
      integration: ['integrators'],
      comparison: ['integrators'],
      synthesis: ['integrators'],
      history: ['historians'],
      discovery: ['historians'],
      evolution: ['historians', 'futurists'],
      prediction: ['futurists'],
      implication: ['futurists', 'clinicians'],
      speculation: ['futurists']
    };
  }

  /**
   * Get all factions with current reputation
   */
  getAllFactions() {
    return Object.entries(this.FACTIONS).map(([id, faction]) => {
      const rep = this.data.reputation[id] || 0;
      const rank = this.getRank(id, rep);

      return {
        id: id,
        name: faction.name,
        icon: faction.icon,
        color: faction.color,
        motto: faction.motto,
        description: faction.description,
        reputation: rep,
        rank: rank,
        nextRank: this.getNextRank(id, rep),
        progressToNextRank: this.getProgressToNextRank(id, rep),
        rewards: this.getAvailableRewards(id, rep),
        unclaimedRewards: this.getUnclaimedRewards(id, rep)
      };
    });
  }

  /**
   * Get current rank for a faction
   */
  getRank(factionId, reputation) {
    const faction = this.FACTIONS[factionId];
    if (!faction) return null;

    let currentRank = faction.ranks[0];
    for (const rank of faction.ranks) {
      if (reputation >= rank.repRequired) {
        currentRank = rank;
      }
    }
    return currentRank;
  }

  /**
   * Get next rank
   */
  getNextRank(factionId, reputation) {
    const faction = this.FACTIONS[factionId];
    if (!faction) return null;

    for (const rank of faction.ranks) {
      if (reputation < rank.repRequired) {
        return rank;
      }
    }
    return null; // Max rank reached
  }

  /**
   * Get progress to next rank (0-100%)
   */
  getProgressToNextRank(factionId, reputation) {
    const faction = this.FACTIONS[factionId];
    if (!faction) return 100;

    const currentRank = this.getRank(factionId, reputation);
    const nextRank = this.getNextRank(factionId, reputation);

    if (!nextRank) return 100;

    const progress = (reputation - currentRank.repRequired) /
                     (nextRank.repRequired - currentRank.repRequired) * 100;
    return Math.round(progress);
  }

  /**
   * Get available rewards at current reputation
   */
  getAvailableRewards(factionId, reputation) {
    const faction = this.FACTIONS[factionId];
    if (!faction) return [];

    return Object.entries(faction.rewards)
      .filter(([repRequired]) => reputation >= parseInt(repRequired))
      .map(([repRequired, reward]) => ({
        repRequired: parseInt(repRequired),
        ...reward
      }));
  }

  /**
   * Get unclaimed rewards
   */
  getUnclaimedRewards(factionId, reputation) {
    const available = this.getAvailableRewards(factionId, reputation);
    const claimed = this.data.claimedRewards[factionId] || [];

    return available.filter(r => !claimed.includes(r.repRequired));
  }

  // ============================================================
  // CYCLE 2: REWARDS & CONFLICTS
  // ============================================================

  /**
   * Record an answer and distribute reputation
   * @param {string} questionId - The question answered
   * @param {boolean} correct - Whether answer was correct
   * @param {boolean} firstTry - First attempt
   * @param {Object} questionData - Question metadata including type
   */
  recordAnswer(questionId, correct, firstTry, questionData = {}) {
    if (!correct) {
      return { success: true, reputationChanges: [] };
    }

    const questionType = questionData.questionType || this.inferQuestionType(questionData);
    const affectedFactions = this.QUESTION_TYPE_FACTIONS[questionType] || [];

    if (affectedFactions.length === 0) {
      // Default: small rep to all factions
      return this.distributeGeneralRep(firstTry);
    }

    const changes = [];
    const baseRep = firstTry ? 15 : 10;

    for (const factionId of affectedFactions) {
      const previousRep = this.data.reputation[factionId] || 0;
      const repGain = Math.round(baseRep / affectedFactions.length);

      this.data.reputation[factionId] = previousRep + repGain;

      // Check for rank up
      const previousRank = this.getRank(factionId, previousRep);
      const newRank = this.getRank(factionId, this.data.reputation[factionId]);
      const rankedUp = newRank.level > previousRank.level;

      // Check for rival faction penalty
      const faction = this.FACTIONS[factionId];
      let rivalPenalty = null;
      if (faction.rivalFaction) {
        const rivalRep = this.data.reputation[faction.rivalFaction] || 0;
        const penaltyAmount = Math.round(repGain * 0.3);
        this.data.reputation[faction.rivalFaction] = Math.max(0, rivalRep - penaltyAmount);

        if (penaltyAmount > 0) {
          rivalPenalty = {
            faction: faction.rivalFaction,
            amount: penaltyAmount
          };
        }
      }

      changes.push({
        factionId: factionId,
        factionName: this.FACTIONS[factionId].name,
        factionIcon: this.FACTIONS[factionId].icon,
        repGain: repGain,
        newTotal: this.data.reputation[factionId],
        rankedUp: rankedUp,
        newRank: rankedUp ? newRank : null,
        rivalPenalty: rivalPenalty
      });
    }

    // Record in history
    this.data.reputationHistory.push({
      questionId,
      questionType,
      changes,
      timestamp: Date.now()
    });

    this.save();

    return {
      success: true,
      reputationChanges: changes,
      messages: this.generateRepMessages(changes)
    };
  }

  /**
   * Distribute general reputation (when question type unknown)
   */
  distributeGeneralRep(firstTry) {
    const repPerFaction = firstTry ? 3 : 2;
    const changes = [];

    for (const factionId of Object.keys(this.FACTIONS)) {
      const previousRep = this.data.reputation[factionId] || 0;
      this.data.reputation[factionId] = previousRep + repPerFaction;

      changes.push({
        factionId,
        factionName: this.FACTIONS[factionId].name,
        factionIcon: this.FACTIONS[factionId].icon,
        repGain: repPerFaction,
        newTotal: this.data.reputation[factionId]
      });
    }

    this.save();
    return { success: true, reputationChanges: changes };
  }

  /**
   * Infer question type from question data
   */
  inferQuestionType(questionData) {
    const text = (questionData.question || '').toLowerCase();

    if (text.includes('what is') || text.includes('define') || text.includes('term')) {
      return 'definition';
    }
    if (text.includes('how does') || text.includes('mechanism') || text.includes('process')) {
      return 'mechanism';
    }
    if (text.includes('patient') || text.includes('clinical') || text.includes('symptom')) {
      return 'clinical';
    }
    if (text.includes('compare') || text.includes('relationship') || text.includes('connect')) {
      return 'integration';
    }
    if (text.includes('discover') || text.includes('history') || text.includes('first')) {
      return 'history';
    }
    if (text.includes('future') || text.includes('predict') || text.includes('might')) {
      return 'prediction';
    }

    return 'general';
  }

  /**
   * Claim a reward
   */
  claimReward(factionId, repRequired) {
    const faction = this.FACTIONS[factionId];
    if (!faction) {
      return { success: false, error: 'faction_not_found' };
    }

    const reward = faction.rewards[repRequired];
    if (!reward) {
      return { success: false, error: 'reward_not_found' };
    }

    const currentRep = this.data.reputation[factionId] || 0;
    if (currentRep < repRequired) {
      return { success: false, error: 'insufficient_reputation' };
    }

    if (!this.data.claimedRewards[factionId]) {
      this.data.claimedRewards[factionId] = [];
    }

    if (this.data.claimedRewards[factionId].includes(repRequired)) {
      return { success: false, error: 'already_claimed' };
    }

    this.data.claimedRewards[factionId].push(repRequired);
    this.data.unlockedAbilities.push({
      factionId,
      reward,
      unlockedAt: Date.now()
    });

    this.save();

    return {
      success: true,
      reward: reward,
      message: `${faction.name} grants you: ${reward.name}!`
    };
  }

  /**
   * Start a synthesis quest (requires multiple faction standing)
   */
  getSynthesisQuests() {
    const quests = [];

    // Check for balanced reputation
    const reps = Object.values(this.data.reputation);
    const minRep = Math.min(...reps);
    const maxRep = Math.max(...reps);

    if (minRep >= 200 && maxRep - minRep < 100) {
      quests.push({
        id: 'balanced_scholar',
        name: 'The Balanced Scholar',
        description: 'Answer questions that satisfy multiple factions simultaneously',
        requirement: 'At least 200 rep with all factions, variance < 100',
        reward: { type: 'title', name: 'Renaissance Scholar' },
        available: true
      });
    }

    // Check for max rank in any faction
    for (const [factionId, rep] of Object.entries(this.data.reputation)) {
      const rank = this.getRank(factionId, rep);
      if (rank && rank.level >= 4) {
        quests.push({
          id: `master_${factionId}`,
          name: `${this.FACTIONS[factionId].name} Mastery Quest`,
          description: `Complete advanced challenges for the ${this.FACTIONS[factionId].name}`,
          requirement: `Max rank with ${this.FACTIONS[factionId].name}`,
          reward: { type: 'legendary_item', name: `${this.FACTIONS[factionId].leader}'s Artifact` },
          available: !this.data.completedQuests.includes(`master_${factionId}`)
        });
      }
    }

    // The Council quest (all factions at 500+)
    const allHigh = Object.values(this.data.reputation).every(r => r >= 500);
    if (allHigh) {
      quests.push({
        id: 'the_council',
        name: 'The Council Convenes',
        description: 'All factions recognize your balanced mastery. Face the ultimate integration challenge.',
        requirement: '500+ reputation with all factions',
        reward: { type: 'ultimate_title', name: 'Council Member' },
        available: !this.data.completedQuests.includes('the_council')
      });
    }

    return quests;
  }

  /**
   * Get faction conflicts (where rivalry is active)
   */
  getActiveConflicts() {
    const conflicts = [];

    for (const [factionId, faction] of Object.entries(this.FACTIONS)) {
      if (!faction.rivalFaction) continue;

      const myRep = this.data.reputation[factionId] || 0;
      const rivalRep = this.data.reputation[faction.rivalFaction] || 0;

      if (myRep > 200 || rivalRep > 200) {
        conflicts.push({
          faction1: {
            id: factionId,
            name: faction.name,
            icon: faction.icon,
            reputation: myRep
          },
          faction2: {
            id: faction.rivalFaction,
            name: this.FACTIONS[faction.rivalFaction].name,
            icon: this.FACTIONS[faction.rivalFaction].icon,
            reputation: rivalRep
          },
          reason: faction.rivalReason,
          imbalance: Math.abs(myRep - rivalRep),
          resolution: this.getConflictResolution(factionId, faction.rivalFaction)
        });
      }
    }

    return conflicts;
  }

  /**
   * Get conflict resolution suggestion
   */
  getConflictResolution(faction1, faction2) {
    const rep1 = this.data.reputation[faction1] || 0;
    const rep2 = this.data.reputation[faction2] || 0;

    if (Math.abs(rep1 - rep2) < 50) {
      return {
        status: 'balanced',
        message: 'These factions are in balance. Both perspectives are valued.'
      };
    }

    const lower = rep1 < rep2 ? faction1 : faction2;
    return {
      status: 'imbalanced',
      lowerFaction: lower,
      message: `Focus on ${this.FACTIONS[lower].questionTypes.join(', ')} questions to restore balance.`
    };
  }

  /**
   * Generate reputation change messages
   */
  generateRepMessages(changes) {
    const messages = [];

    for (const change of changes) {
      const faction = this.FACTIONS[change.factionId];

      messages.push({
        type: 'rep_gain',
        text: `${faction.icon} +${change.repGain} reputation with ${faction.name}`
      });

      if (change.rankedUp) {
        messages.push({
          type: 'rank_up',
          text: `RANK UP! You are now a ${change.newRank.name} of the ${faction.name}!`
        });
      }

      if (change.rivalPenalty) {
        const rival = this.FACTIONS[change.rivalPenalty.faction];
        messages.push({
          type: 'rival_penalty',
          text: `${rival.icon} -${change.rivalPenalty.amount} with ${rival.name} (rivalry)`
        });
      }
    }

    return messages;
  }

  /**
   * Get statistics summary
   */
  getStatistics() {
    const reps = Object.entries(this.data.reputation);
    const totalRep = reps.reduce((sum, [, rep]) => sum + rep, 0);

    const sorted = [...reps].sort((a, b) => b[1] - a[1]);

    return {
      totalReputation: totalRep,
      highestFaction: sorted[0] ? {
        id: sorted[0][0],
        name: this.FACTIONS[sorted[0][0]]?.name,
        rep: sorted[0][1]
      } : null,
      lowestFaction: sorted[sorted.length - 1] ? {
        id: sorted[sorted.length - 1][0],
        name: this.FACTIONS[sorted[sorted.length - 1][0]]?.name,
        rep: sorted[sorted.length - 1][1]
      } : null,
      balance: this.calculateBalance(),
      totalRewardsUnlocked: this.data.unlockedAbilities.length,
      questsCompleted: this.data.completedQuests.length
    };
  }

  /**
   * Calculate faction balance score (0-100, 100 = perfect balance)
   */
  calculateBalance() {
    const reps = Object.values(this.data.reputation);
    if (reps.length === 0) return 100;

    const avg = reps.reduce((a, b) => a + b, 0) / reps.length;
    if (avg === 0) return 100;

    const variance = reps.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / reps.length;
    const stdDev = Math.sqrt(variance);

    // Lower stdDev = more balanced
    const balanceScore = Math.max(0, 100 - (stdDev / avg * 100));
    return Math.round(balanceScore);
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
      console.warn('ReputationEngine: Could not load data', e);
    }

    return {
      reputation: {},
      claimedRewards: {},
      unlockedAbilities: [],
      reputationHistory: [],
      completedQuests: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('ReputationEngine: Could not save data', e);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReputationEngine };
}
