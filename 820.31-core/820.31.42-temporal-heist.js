/**
 * Temporal Heist Engine
 * @file 820.31.42-temporal-heist.js
 * @codon 820.31.42
 * @version 2026-03-29
 *
 * Game Path 3: Time-travel heist missions where you must "steal" knowledge
 * from different eras of medical history. Each era has period-accurate
 * misconceptions you must navigate.
 *
 * Research Basis:
 * - History of Science: Understanding WHY wrong answers were attractive
 * - Conceptual Change: Misconceptions often mirror historical errors
 * - Transfer: Context variation improves learning
 *
 * TAIDRGEF Signature: T.F.R.A
 * - T (Transform): Player transforms through historical understanding
 * - F (Frame): Each era provides a different frame/perspective
 * - R (React): Navigate historical misconceptions
 * - A (Aggregate): Collect insights across timeline
 */

class TemporalHeistEngine {
  constructor(questionStatistics, learningAnalytics, persistence) {
    this.questionStatistics = questionStatistics;
    this.learningAnalytics = learningAnalytics;
    this.persistence = persistence;

    this.STORAGE_KEY = 'ms_luminara_temporal_heist';
    this.data = this.loadData();

    // ============================================================
    // CYCLE 1: ERA SYSTEM
    // ============================================================

    // Historical eras with their medical paradigms
    this.ERAS = {
      ANCIENT_GREECE: {
        id: 'ancient_greece',
        name: 'Ancient Greece',
        period: '400 BCE',
        icon: '🏛️',
        color: '#C9B037',
        paradigm: 'Humoral Theory',
        keyFigures: ['Hippocrates', 'Galen', 'Aristotle'],
        worldview: 'The body is governed by four humors: blood, phlegm, yellow bile, and black bile. Health is balance; disease is imbalance.',
        misconceptions: {
          circulation: 'Blood is produced in the liver and consumed by the body',
          respiration: 'We breathe to cool the heart\'s innate heat',
          digestion: 'Food is "cooked" in the stomach by body heat',
          brain: 'The brain is a cooling organ for the blood'
        },
        disguiseRequirements: ['Use "humor" terminology', 'Reference the four elements', 'Cite Hippocrates'],
        unlockRequirements: null // Starting era
      },

      MEDIEVAL_EUROPE: {
        id: 'medieval_europe',
        name: 'Medieval Europe',
        period: '1200 CE',
        icon: '⚔️',
        color: '#4A4A4A',
        paradigm: 'Miasma Theory',
        keyFigures: ['Avicenna', 'Hildegard of Bingen', 'Guy de Chauliac'],
        worldview: 'Disease comes from "bad air" (miasma). The body mirrors the cosmos. Treatment involves balancing humors and seeking divine intervention.',
        misconceptions: {
          infection: 'Disease spreads through foul odors and corrupted air',
          circulation: 'Blood ebbs and flows like tides, not circulates',
          anatomy: 'Human anatomy is identical to pig anatomy (dissection banned)',
          treatment: 'Bloodletting removes corrupted humors'
        },
        disguiseRequirements: ['Reference miasma', 'Invoke spiritual causes', 'Use astrological timing'],
        unlockRequirements: { completedHeists: 1 }
      },

      RENAISSANCE: {
        id: 'renaissance',
        name: 'Renaissance',
        period: '1600 CE',
        icon: '🎨',
        color: '#8B4513',
        paradigm: 'Emerging Anatomy',
        keyFigures: ['Vesalius', 'Harvey', 'Paracelsus'],
        worldview: 'Direct observation challenges ancient texts. Harvey proves circulation. Anatomy becomes empirical science.',
        misconceptions: {
          circulation: 'Blood passes through invisible pores in the septum (Galen)',
          respiration: 'Air directly mixes with blood in the heart',
          nerves: 'Nerves are hollow tubes carrying "animal spirits"',
          infection: 'Spontaneous generation creates life from non-life'
        },
        disguiseRequirements: ['Cite empirical observation', 'Reference Vesalius', 'Use Latin terminology'],
        unlockRequirements: { completedHeists: 2 }
      },

      VICTORIAN: {
        id: 'victorian',
        name: 'Victorian Era',
        period: '1850 CE',
        icon: '🎩',
        color: '#2F4F4F',
        paradigm: 'Germ Theory Emerging',
        keyFigures: ['Pasteur', 'Koch', 'Semmelweis', 'Lister'],
        worldview: 'Microorganisms cause disease. Antiseptic surgery saves lives. But miasma theory persists among many.',
        misconceptions: {
          infection: 'Gentlemen\'s hands cannot carry disease (handwashing debate)',
          anesthesia: 'Pain is necessary for healing (resistance to ether)',
          genetics: 'Acquired characteristics are inherited (Lamarckism)',
          psychology: 'Mental illness is moral failing or demonic possession'
        },
        disguiseRequirements: ['Debate germ vs miasma', 'Reference microscopy', 'Use clinical terminology'],
        unlockRequirements: { completedHeists: 3 }
      },

      MODERN_ERA: {
        id: 'modern_era',
        name: 'Modern Era',
        period: '1950 CE',
        icon: '💊',
        color: '#4169E1',
        paradigm: 'Molecular Medicine',
        keyFigures: ['Watson & Crick', 'Fleming', 'Salk'],
        worldview: 'DNA is the blueprint. Antibiotics cure infection. Vaccines prevent disease. The body is a biochemical machine.',
        misconceptions: {
          genetics: 'One gene = one trait (before epigenetics)',
          brain: 'We only use 10% of our brain',
          antibiotics: 'Antibiotics work on viruses',
          ulcers: 'Stress causes ulcers (before H. pylori discovery)'
        },
        disguiseRequirements: ['Reference DNA', 'Use biochemical language', 'Cite clinical trials'],
        unlockRequirements: { completedHeists: 5 }
      },

      FUTURE_ERA: {
        id: 'future_era',
        name: 'Future Era',
        period: '2100 CE',
        icon: '🚀',
        color: '#9370DB',
        paradigm: 'Precision Medicine',
        keyFigures: ['AI Diagnosticians', 'Gene Editors', 'Nanobots'],
        worldview: 'Medicine is personalized to your genome. Nanobots repair cells. Aging is treatable. Consciousness is uploadable.',
        misconceptions: {
          current: 'Today\'s "facts" may be tomorrow\'s misconceptions',
          ethics: 'Technology solves all problems',
          limits: 'There are no fundamental limits to medicine',
          consciousness: 'Mind is just computation'
        },
        disguiseRequirements: ['Project current knowledge forward', 'Identify limitations', 'Consider ethics'],
        unlockRequirements: { completedHeists: 8, perfectHeists: 2 }
      }
    };

    // Vault contents (concepts to steal)
    this.VAULTS = {
      CIRCULATION: {
        id: 'circulation',
        name: 'The Secret of Circulation',
        icon: '❤️',
        concept: 'Blood flows in a continuous loop through the body',
        modernUnderstanding: 'Harvey\'s closed circulation with pulmonary and systemic circuits',
        eraGuards: {
          ancient_greece: 'Galen\'s open-ended consumption model',
          medieval_europe: 'Tidal ebb and flow model',
          renaissance: 'Septal pore controversy',
          victorian: 'Resistance to complete abandonment of humors',
          modern_era: 'N/A - fully understood',
          future_era: 'Artificial circulation systems'
        }
      },

      RESPIRATION: {
        id: 'respiration',
        name: 'The Breath of Life',
        icon: '🌬️',
        concept: 'Gas exchange at cellular level for energy production',
        modernUnderstanding: 'Oxygen-carbon dioxide exchange in alveoli, cellular respiration in mitochondria',
        eraGuards: {
          ancient_greece: 'Cooling the heart\'s fire',
          medieval_europe: 'Pneuma/spirit entering the body',
          renaissance: 'Air directly mixing with blood',
          victorian: 'Vitalism - life force in breath',
          modern_era: 'N/A - well understood',
          future_era: 'Artificial oxygen carriers'
        }
      },

      INFECTION: {
        id: 'infection',
        name: 'The Invisible Enemy',
        icon: '🦠',
        concept: 'Microorganisms cause infectious disease',
        modernUnderstanding: 'Bacteria, viruses, fungi, and parasites cause specific diseases via specific mechanisms',
        eraGuards: {
          ancient_greece: 'Miasma - bad air carries disease',
          medieval_europe: 'Divine punishment or demonic possession',
          renaissance: 'Spontaneous generation of disease',
          victorian: 'Resistance to germ theory by establishment',
          modern_era: 'Antibiotic resistance emergence',
          future_era: 'Synthetic biology threats'
        }
      },

      NEURAL_TRANSMISSION: {
        id: 'neural_transmission',
        name: 'The Lightning Within',
        icon: '⚡',
        concept: 'Electrochemical signals transmit information through neurons',
        modernUnderstanding: 'Action potentials, synaptic transmission, neurotransmitters',
        eraGuards: {
          ancient_greece: 'Animal spirits flowing through hollow nerves',
          medieval_europe: 'Soul controls body through heart',
          renaissance: 'Mechanical puppet model (Descartes)',
          victorian: 'Electrical but mysterious "nerve force"',
          modern_era: 'Complete picture emerging',
          future_era: 'Neural-digital interfaces'
        }
      },

      GENETICS: {
        id: 'genetics',
        name: 'The Code of Life',
        icon: '🧬',
        concept: 'DNA encodes hereditary information',
        modernUnderstanding: 'DNA -> RNA -> Protein, epigenetics, gene regulation',
        eraGuards: {
          ancient_greece: 'Preformationism - tiny humans in seeds',
          medieval_europe: 'Divine creation of each soul',
          renaissance: 'Blending inheritance',
          victorian: 'Lamarckism - acquired characteristics',
          modern_era: 'One gene one trait oversimplification',
          future_era: 'Gene editing ethics'
        }
      }
    };

    // Heist mission structure
    this.MISSION_STRUCTURE = {
      infiltration: { name: 'Infiltration', description: 'Enter the era undetected' },
      navigation: { name: 'Navigation', description: 'Navigate past misconception guards' },
      vault_breach: { name: 'Vault Breach', description: 'Answer the vault question' },
      extraction: { name: 'Extraction', description: 'Escape with the knowledge' }
    };
  }

  /**
   * Get all available eras
   */
  getAvailableEras() {
    const eras = [];

    for (const [eraId, era] of Object.entries(this.ERAS)) {
      const unlocked = this.isEraUnlocked(eraId);
      const completed = this.data.completedEras.includes(eraId);
      const heistsInEra = this.data.completedHeists.filter(h => h.era === eraId);

      eras.push({
        id: eraId,
        name: era.name,
        period: era.period,
        icon: era.icon,
        color: era.color,
        paradigm: era.paradigm,
        unlocked: unlocked,
        completed: completed,
        heistsCompleted: heistsInEra.length,
        unlockRequirements: era.unlockRequirements
      });
    }

    return eras;
  }

  /**
   * Check if an era is unlocked
   */
  isEraUnlocked(eraId) {
    const era = this.ERAS[eraId];
    if (!era) return false;

    const requirements = era.unlockRequirements;
    if (!requirements) return true; // No requirements = unlocked

    if (requirements.completedHeists) {
      if (this.data.completedHeists.length < requirements.completedHeists) {
        return false;
      }
    }

    if (requirements.perfectHeists) {
      const perfectCount = this.data.completedHeists.filter(h => h.perfect).length;
      if (perfectCount < requirements.perfectHeists) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get era details
   */
  getEraDetails(eraId) {
    const era = this.ERAS[eraId];
    if (!era) return null;

    return {
      ...era,
      unlocked: this.isEraUnlocked(eraId),
      availableVaults: this.getAvailableVaults(eraId),
      completedVaults: this.data.completedVaults[eraId] || []
    };
  }

  /**
   * Get available vaults for an era
   */
  getAvailableVaults(eraId) {
    const completedInEra = this.data.completedVaults[eraId] || [];

    return Object.entries(this.VAULTS)
      .filter(([vaultId, vault]) => !completedInEra.includes(vaultId))
      .map(([vaultId, vault]) => ({
        id: vaultId,
        name: vault.name,
        icon: vault.icon,
        guard: vault.eraGuards[eraId],
        completed: false
      }));
  }

  /**
   * Start a heist mission
   */
  startHeist(eraId, vaultId) {
    if (!this.isEraUnlocked(eraId)) {
      return { success: false, error: 'era_locked' };
    }

    const era = this.ERAS[eraId];
    const vault = this.VAULTS[vaultId];

    if (!era || !vault) {
      return { success: false, error: 'invalid_parameters' };
    }

    const mission = {
      id: `heist_${Date.now()}`,
      era: eraId,
      vault: vaultId,
      startedAt: Date.now(),
      phase: 'infiltration',
      phases: {
        infiltration: { completed: false, score: 0 },
        navigation: { completed: false, score: 0, guardsDefeated: 0 },
        vault_breach: { completed: false, score: 0 },
        extraction: { completed: false, score: 0 }
      },
      disguise: {
        equipped: false,
        items: []
      },
      insightsCollected: [],
      totalScore: 0,
      completed: false,
      perfect: false
    };

    this.data.activeMission = mission;
    this.save();

    return {
      success: true,
      mission: mission,
      era: {
        name: era.name,
        period: era.period,
        paradigm: era.paradigm,
        worldview: era.worldview,
        disguiseRequirements: era.disguiseRequirements
      },
      vault: {
        name: vault.name,
        guard: vault.eraGuards[eraId]
      },
      briefing: this.generateBriefing(era, vault)
    };
  }

  /**
   * Generate mission briefing
   */
  generateBriefing(era, vault) {
    return {
      title: `Operation: ${vault.name}`,
      setting: `${era.name} (${era.period})`,
      objective: `Infiltrate ${era.period} and extract the secret of ${vault.name}`,
      worldContext: era.worldview,
      guard: vault.eraGuards[era.id],
      warning: `The scholars of this era believe: "${vault.eraGuards[era.id]}". You must navigate this misconception to reach the truth.`,
      disguiseTips: era.disguiseRequirements
    };
  }

  /**
   * Get the misconception that guards a vault in an era
   */
  getVaultGuard(eraId, vaultId) {
    const vault = this.VAULTS[vaultId];
    if (!vault) return null;

    return vault.eraGuards[eraId] || 'Unknown misconception';
  }

  /**
   * Get timeline visualization data
   */
  getTimelineData() {
    const timeline = [];

    for (const [eraId, era] of Object.entries(this.ERAS)) {
      const unlocked = this.isEraUnlocked(eraId);
      const completedVaults = this.data.completedVaults[eraId] || [];

      timeline.push({
        id: eraId,
        name: era.name,
        period: era.period,
        icon: era.icon,
        color: era.color,
        unlocked: unlocked,
        vaultsCompleted: completedVaults.length,
        totalVaults: Object.keys(this.VAULTS).length,
        keyInsights: completedVaults.map(v => this.VAULTS[v]?.concept || v)
      });
    }

    return timeline;
  }

  // ============================================================
  // CYCLE 2: HEIST MECHANICS
  // ============================================================

  /**
   * Process infiltration phase
   * @param {Object} disguiseChoices - Player's disguise selections
   */
  processInfiltration(disguiseChoices) {
    const mission = this.data.activeMission;
    if (!mission || mission.phase !== 'infiltration') {
      return { success: false, error: 'invalid_phase' };
    }

    const era = this.ERAS[mission.era];
    const requirements = era.disguiseRequirements;

    // Check disguise quality
    let disguiseScore = 0;
    const feedback = [];

    for (const req of requirements) {
      const matched = disguiseChoices.some(choice =>
        choice.toLowerCase().includes(req.toLowerCase().split(' ')[0])
      );

      if (matched) {
        disguiseScore += 33;
        feedback.push({ requirement: req, met: true, message: `Perfect! You understand the ${era.name} mindset.` });
      } else {
        feedback.push({ requirement: req, met: false, message: `You need to ${req.toLowerCase()} to blend in.` });
      }
    }

    mission.phases.infiltration.completed = true;
    mission.phases.infiltration.score = Math.min(100, disguiseScore);
    mission.disguise.equipped = disguiseScore >= 66;
    mission.disguise.items = disguiseChoices;

    // Advance to navigation phase
    mission.phase = 'navigation';

    this.save();

    return {
      success: true,
      phase: 'infiltration',
      score: mission.phases.infiltration.score,
      disguiseEquipped: mission.disguise.equipped,
      feedback: feedback,
      nextPhase: 'navigation',
      message: mission.disguise.equipped
        ? `Excellent disguise! You blend in with the scholars of ${era.period}.`
        : `Your disguise is incomplete, but you proceed cautiously...`
    };
  }

  /**
   * Get navigation guards (misconceptions to defeat)
   */
  getNavigationGuards() {
    const mission = this.data.activeMission;
    if (!mission) return [];

    const era = this.ERAS[mission.era];
    const vault = this.VAULTS[mission.vault];

    // Generate 2-4 guards based on era misconceptions
    const guards = [];
    const misconceptions = Object.entries(era.misconceptions);

    // Always include the vault-specific guard
    guards.push({
      id: 'vault_guard',
      type: 'primary',
      misconception: vault.eraGuards[mission.era],
      topic: mission.vault,
      defeated: false,
      difficulty: 'hard'
    });

    // Add 1-2 general era misconceptions
    const shuffled = misconceptions.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(2, shuffled.length); i++) {
      const [topic, misconception] = shuffled[i];
      if (topic !== mission.vault) {
        guards.push({
          id: `guard_${i}`,
          type: 'secondary',
          misconception: misconception,
          topic: topic,
          defeated: false,
          difficulty: 'medium'
        });
      }
    }

    return guards;
  }

  /**
   * Process navigation phase - defeat a guard
   * @param {string} guardId - Guard to challenge
   * @param {boolean} correct - Whether answer was correct
   * @param {Object} questionData - Question details
   */
  processNavigation(guardId, correct, questionData = {}) {
    const mission = this.data.activeMission;
    if (!mission || mission.phase !== 'navigation') {
      return { success: false, error: 'invalid_phase' };
    }

    const guards = this.getNavigationGuards();
    const guard = guards.find(g => g.id === guardId);

    if (!guard) {
      return { success: false, error: 'guard_not_found' };
    }

    const result = {
      guardId: guardId,
      guardType: guard.type,
      misconception: guard.misconception,
      correct: correct,
      xpEarned: 0,
      insightEarned: null,
      messages: []
    };

    if (correct) {
      guard.defeated = true;
      mission.phases.navigation.guardsDefeated++;

      // Score based on guard difficulty
      const scoreMap = { hard: 40, medium: 30, easy: 20 };
      const score = scoreMap[guard.difficulty] || 25;
      mission.phases.navigation.score += score;

      // Bonus for having proper disguise
      if (mission.disguise.equipped) {
        mission.phases.navigation.score += 10;
        result.messages.push('Your disguise grants you advantage!');
      }

      result.xpEarned = score * 5;

      // Generate historical insight
      result.insightEarned = this.generateHistoricalInsight(mission.era, guard);
      mission.insightsCollected.push(result.insightEarned);

      result.messages.push(this.getGuardDefeatMessage(guard, mission.era));

      // Check if all guards defeated
      const allDefeated = guards.every(g => g.defeated);
      if (allDefeated) {
        mission.phases.navigation.completed = true;
        mission.phase = 'vault_breach';
        result.phaseComplete = true;
        result.nextPhase = 'vault_breach';
        result.messages.push('All guards defeated! The vault lies ahead...');
      }
    } else {
      // Penalty for wrong answer
      mission.phases.navigation.score = Math.max(0, mission.phases.navigation.score - 15);

      result.messages.push(this.getGuardAlertMessage(guard, mission.era));

      // Provide the historical context as feedback
      result.historicalContext = {
        era: mission.era,
        misconception: guard.misconception,
        whyBelieved: this.explainHistoricalMisconception(mission.era, guard.topic)
      };
    }

    this.save();

    return { success: true, result: result };
  }

  /**
   * Generate historical insight from defeating a guard
   */
  generateHistoricalInsight(eraId, guard) {
    const era = this.ERAS[eraId];

    return {
      id: `insight_${Date.now()}`,
      era: era.name,
      period: era.period,
      topic: guard.topic,
      misconception: guard.misconception,
      lesson: `In ${era.period}, scholars believed: "${guard.misconception}". This was overturned when...`,
      collectedAt: Date.now()
    };
  }

  /**
   * Explain why a historical misconception was believed
   */
  explainHistoricalMisconception(eraId, topic) {
    const explanations = {
      ancient_greece: {
        circulation: 'Without microscopes or experimental method, observation of blood loss leading to death suggested blood was consumed.',
        respiration: 'The warmth of breath and body heat correlation led to the "cooling" theory.',
        digestion: 'The warmth of the stomach after eating suggested heat-based "cooking".',
        brain: 'Aristotle noted the brain felt cool compared to the heart, leading to its role as a radiator.'
      },
      medieval_europe: {
        infection: 'The correlation between bad smells and disease (sewage, corpses) reinforced miasma theory.',
        circulation: 'Without challenging Galen, the tidal model persisted through authority.',
        anatomy: 'Religious prohibition on dissection meant animal models were extrapolated.',
        treatment: 'Bloodletting sometimes produced placebo effects or reduced inflammation.'
      },
      renaissance: {
        circulation: 'Even Harvey initially believed in septal pores because Galen\'s authority was immense.',
        respiration: 'The warmth of arterial blood vs venous blood suggested direct air-blood mixing.',
        nerves: 'The speed of nerve signals seemed instantaneous, suggesting fluid flow.',
        infection: 'Maggots appearing on meat seemed to prove spontaneous generation.'
      },
      victorian: {
        infection: 'Social class bias - gentlemen couldn\'t carry disease, only the "unclean".',
        anesthesia: 'Religious opposition saw pain as divine intention in childbirth.',
        genetics: 'Lamarck\'s theory matched intuition about training and adaptation.',
        psychology: 'Lack of brain science led to moral explanations for mental illness.'
      },
      modern_era: {
        genetics: 'Early Mendelian genetics was simpler - complexity came later.',
        brain: 'Misinterpreted brain scans showing inactive regions.',
        antibiotics: 'Public confusion between bacteria and viruses persists.',
        ulcers: 'Stress does affect the gut; the H. pylori connection was unexpected.'
      },
      future_era: {
        current: 'Each era believes its knowledge is complete. Humility is wisdom.',
        ethics: 'Technology creates as many problems as it solves.',
        limits: 'Physics and biology have fundamental constraints.',
        consciousness: 'The hard problem remains unsolved.'
      }
    };

    return explanations[eraId]?.[topic] ||
      `The knowledge and tools of ${this.ERAS[eraId]?.period || 'this era'} led to reasonable but incorrect conclusions.`;
  }

  /**
   * Process vault breach phase
   * @param {boolean} correct - Whether vault question was answered correctly
   * @param {boolean} firstTry - First attempt
   * @param {Object} questionData - Question details
   */
  processVaultBreach(correct, firstTry, questionData = {}) {
    const mission = this.data.activeMission;
    if (!mission || mission.phase !== 'vault_breach') {
      return { success: false, error: 'invalid_phase' };
    }

    const vault = this.VAULTS[mission.vault];
    const era = this.ERAS[mission.era];

    const result = {
      correct: correct,
      firstTry: firstTry,
      vaultName: vault.name,
      concept: vault.concept,
      modernUnderstanding: vault.modernUnderstanding,
      xpEarned: 0,
      messages: []
    };

    if (correct) {
      mission.phases.vault_breach.completed = true;
      mission.phases.vault_breach.score = firstTry ? 100 : 70;
      mission.phase = 'extraction';

      result.xpEarned = firstTry ? 200 : 100;

      // The vault reveals the modern understanding
      result.revelation = {
        historical: vault.eraGuards[mission.era],
        modern: vault.modernUnderstanding,
        journey: `From "${vault.eraGuards[mission.era]}" to "${vault.concept}"`
      };

      result.messages.push(`VAULT BREACHED! You've extracted the secret of ${vault.name}!`);
      result.messages.push(`The truth: ${vault.concept}`);

    } else {
      mission.phases.vault_breach.score = Math.max(0, mission.phases.vault_breach.score - 20);

      result.messages.push('The vault resists! The misconception still guards the truth.');
      result.hint = `Remember: the ${era.period} scholars believed "${vault.eraGuards[mission.era]}". What did they miss?`;
    }

    this.save();

    return { success: true, result: result };
  }

  /**
   * Process extraction phase (escape with knowledge)
   * @param {Object} summaryData - Player's summary of what they learned
   */
  processExtraction(summaryData = {}) {
    const mission = this.data.activeMission;
    if (!mission || mission.phase !== 'extraction') {
      return { success: false, error: 'invalid_phase' };
    }

    const vault = this.VAULTS[mission.vault];
    const era = this.ERAS[mission.era];

    // Calculate total mission score
    const phaseScores = mission.phases;
    const totalScore =
      phaseScores.infiltration.score * 0.2 +
      phaseScores.navigation.score * 0.3 +
      phaseScores.vault_breach.score * 0.4 +
      100 * 0.1; // Extraction always succeeds

    mission.phases.extraction.completed = true;
    mission.phases.extraction.score = 100;
    mission.totalScore = Math.round(totalScore);
    mission.completed = true;
    mission.completedAt = Date.now();
    mission.perfect = totalScore >= 90;

    // Update global tracking
    this.data.completedHeists.push({
      id: mission.id,
      era: mission.era,
      vault: mission.vault,
      score: mission.totalScore,
      perfect: mission.perfect,
      completedAt: mission.completedAt,
      insightsCount: mission.insightsCollected.length
    });

    // Track completed vaults per era
    if (!this.data.completedVaults[mission.era]) {
      this.data.completedVaults[mission.era] = [];
    }
    if (!this.data.completedVaults[mission.era].includes(mission.vault)) {
      this.data.completedVaults[mission.era].push(mission.vault);
    }

    // Add insights to global collection
    this.data.collectedInsights.push(...mission.insightsCollected);

    // Check if era is fully completed
    const eraVaults = Object.keys(this.VAULTS);
    const completedInEra = this.data.completedVaults[mission.era];
    if (eraVaults.every(v => completedInEra.includes(v))) {
      if (!this.data.completedEras.includes(mission.era)) {
        this.data.completedEras.push(mission.era);
      }
    }

    // Award costume for completing era
    const costume = this.checkCostumeUnlock(mission);

    // Calculate total XP
    const xpEarned = mission.totalScore * 10 + (mission.perfect ? 500 : 0);
    this.data.totalScore += mission.totalScore;

    // Clear active mission
    this.data.activeMission = null;

    this.save();

    return {
      success: true,
      missionComplete: true,
      score: mission.totalScore,
      perfect: mission.perfect,
      xpEarned: xpEarned,
      insightsCollected: mission.insightsCollected,
      costumeUnlocked: costume,
      eraComplete: this.data.completedEras.includes(mission.era),
      timelineProgress: this.getTimelineProgress(),
      message: this.getMissionCompleteMessage(mission, totalScore)
    };
  }

  /**
   * Check if a costume is unlocked
   */
  checkCostumeUnlock(mission) {
    const era = this.ERAS[mission.era];
    const costumeId = `costume_${mission.era}`;

    // First heist in an era unlocks the costume
    const heistsInEra = this.data.completedHeists.filter(h => h.era === mission.era);
    if (heistsInEra.length === 1) { // This is the first
      const costume = {
        id: costumeId,
        era: mission.era,
        name: `${era.name} Scholar Robes`,
        icon: era.icon,
        description: `Authentic attire from ${era.period}`,
        unlockedAt: Date.now()
      };

      this.data.costumes.push(costume);
      return costume;
    }

    return null;
  }

  /**
   * Get timeline progress summary
   */
  getTimelineProgress() {
    const totalVaults = Object.keys(this.VAULTS).length;
    const totalEras = Object.keys(this.ERAS).length;

    let completedVaultCount = 0;
    for (const vaults of Object.values(this.data.completedVaults)) {
      completedVaultCount += vaults.length;
    }

    return {
      erasUnlocked: Object.keys(this.ERAS).filter(e => this.isEraUnlocked(e)).length,
      totalEras: totalEras,
      erasCompleted: this.data.completedEras.length,
      vaultsCompleted: completedVaultCount,
      totalVaultSlots: totalVaults * totalEras,
      heistsCompleted: this.data.completedHeists.length,
      perfectHeists: this.data.completedHeists.filter(h => h.perfect).length,
      insightsCollected: this.data.collectedInsights.length,
      costumesUnlocked: this.data.costumes.length
    };
  }

  /**
   * Get all collected insights
   */
  getCollectedInsights() {
    return this.data.collectedInsights.map(insight => ({
      ...insight,
      eraIcon: this.ERAS[this.findEraByName(insight.era)]?.icon || '?'
    }));
  }

  /**
   * Find era ID by name
   */
  findEraByName(eraName) {
    for (const [id, era] of Object.entries(this.ERAS)) {
      if (era.name === eraName) return id;
    }
    return null;
  }

  /**
   * Abandon current mission
   */
  abandonMission() {
    if (!this.data.activeMission) {
      return { success: false, error: 'no_active_mission' };
    }

    const mission = this.data.activeMission;
    this.data.activeMission = null;
    this.save();

    return {
      success: true,
      message: `You retreat from ${this.ERAS[mission.era]?.period || 'the past'}. The secrets remain hidden... for now.`,
      phase: mission.phase,
      progress: mission.phases
    };
  }

  // ============================================================
  // MS. LUMINARA VOICE
  // ============================================================

  getGuardDefeatMessage(guard, eraId) {
    const era = this.ERAS[eraId];
    const messages = [
      `The misconception dissolves! You see past ${era.period}'s limitations.`,
      `Truth pierces through centuries of confusion.`,
      `What ${era.keyFigures[0]} couldn't know, you now understand.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getGuardAlertMessage(guard, eraId) {
    const era = this.ERAS[eraId];
    const messages = [
      `The misconception strengthens! Remember: you're thinking like ${era.period}.`,
      `Wrong! The scholars of ${era.period} believed "${guard.misconception}". Can you see past it?`,
      `Careful! You've fallen into the same trap as ${era.keyFigures[0]}.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getMissionCompleteMessage(mission, score) {
    const era = this.ERAS[mission.era];
    const vault = this.VAULTS[mission.vault];

    if (score >= 90) {
      return `PERFECT HEIST! You've mastered the transition from "${vault.eraGuards[mission.era]}" to "${vault.concept}". ${era.keyFigures[0]} would be impressed.`;
    } else if (score >= 70) {
      return `Successful extraction! The secret of ${vault.name} is yours. The journey from ${era.period} to now makes sense.`;
    } else {
      return `You escaped with the knowledge, though some details remain fuzzy. Perhaps another heist will clarify.`;
    }
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
      console.warn('TemporalHeist: Could not load data', e);
    }

    return {
      activeMission: null,
      completedHeists: [],
      completedEras: [],
      completedVaults: {},
      collectedInsights: [],
      costumes: [],
      totalScore: 0
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('TemporalHeist: Could not save data', e);
    }
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemporalHeistEngine };
}
