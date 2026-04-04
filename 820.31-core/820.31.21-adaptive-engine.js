/**
 * Ms. Luminara Quiz - Adaptive Scaffold Engine
 *
 * A unified decision engine that coordinates all existing adaptive systems
 * to provide personalized scaffolding for each learner.
 *
 * Integrates:
 * - ScaffoldingEngine (scaffold levels)
 * - ZPDSystem (learning velocity, ZPD moments)
 * - IsotopeEngine (concept relationships, difficulty)
 * - D20System (character stats for hint quality)
 * - Persistence (wrong-answer queue, history)
 * - ScaffoldRemediationEngine (HP-based recovery)
 *
 * Works 100% offline in the browser.
 */

class AdaptiveScaffoldEngine {
  constructor() {
    // Reference to other systems (set during init)
    this.scaffolding = null;
    this.zpdSystem = null;
    this.isotopeEngine = null;
    this.d20System = null;
    this.persistence = null;
    this.remediation = null;

    // Adaptive state
    this.currentProfile = null;
    this.lastDecision = null;

    // Configuration
    this.config = {
      // Scaffold counts by level
      scaffoldCounts: {
        heavy: 7,
        moderate: 5,
        light: 3,
        challenge: 1
      },
      // Learning velocity thresholds
      velocityThresholds: {
        struggling: 0.7,    // Below this = slow down
        neutral: 1.0,       // Around this = maintain
        accelerating: 1.4   // Above this = speed up
      },
      // Hint quality based on WIS modifier (-5 to +5)
      hintQuality: {
        vague: -2,      // WIS mod <= -2: very vague hints
        basic: 0,       // WIS mod -1 to 0: basic hints
        good: 2,        // WIS mod 1-2: good hints
        excellent: 5    // WIS mod 3+: excellent hints
      },
      // Consecutive wrong threshold for intervention
      interventionThreshold: 2,
      // Mastery threshold for skipping scaffolds
      masteryThreshold: 0.8
    };

    // Performance tracking for this session
    this.sessionMetrics = {
      questionsAnswered: 0,
      scaffoldsProvided: 0,
      scaffoldsSkipped: 0,
      adaptiveAdjustments: 0,
      velocityChanges: []
    };
  }

  /**
   * Initialize with references to other systems
   */
  init() {
    // Get references to existing global systems
    this.scaffolding = typeof scaffolding !== 'undefined' ? scaffolding : null;
    this.zpdSystem = typeof ZPDSystem !== 'undefined' ? ZPDSystem : null;
    this.isotopeEngine = typeof IsotopeEngine !== 'undefined' ? IsotopeEngine : null;
    this.d20System = typeof d20System !== 'undefined' ? d20System : null;
    this.persistence = typeof persistence !== 'undefined' ? persistence : null;
    this.remediation = typeof scaffoldRemediation !== 'undefined' ? scaffoldRemediation : null;

    console.log('[AdaptiveEngine] Initialized with systems:', {
      scaffolding: !!this.scaffolding,
      zpdSystem: !!this.zpdSystem,
      isotopeEngine: !!this.isotopeEngine,
      d20System: !!this.d20System,
      persistence: !!this.persistence,
      remediation: !!this.remediation
    });

    return this;
  }

  /**
   * Build a comprehensive learner profile from all systems
   */
  buildLearnerProfile(topicPrefix = null) {
    const profile = {
      // Scaffold level (heavy/moderate/light/challenge)
      scaffoldLevel: 'moderate',
      scaffoldAdvice: null,

      // Learning velocity (0.5 - 2.0)
      learningVelocity: 1.0,
      velocityTrend: 'stable', // accelerating, stable, decelerating

      // ZPD state
      zpdState: 'proximal', // foundational, proximal, ready_for_challenge
      zpdMomentType: null,

      // D20 stats
      wisdomModifier: 0,
      intelligenceModifier: 0,
      constitutionModifier: 0,

      // Performance metrics
      recentAccuracy: 0.5,
      topicMastery: 0,
      consecutiveWrong: 0,
      consecutiveCorrect: 0,

      // HP state (if remediation active)
      currentHP: 100,
      maxHP: 100,
      hpPercent: 100,

      // Priority review items
      reviewQueueSize: 0,
      hasHighPriorityReview: false,

      // Computed recommendations
      recommendedScaffoldCount: 5,
      hintQuality: 'good',
      shouldSkipWarmups: false,
      needsIntervention: false,
      interventionType: null
    };

    // Get scaffold level and advice
    if (this.scaffolding) {
      profile.scaffoldAdvice = this.scaffolding.getScaffoldingAdvice(topicPrefix);
      profile.scaffoldLevel = profile.scaffoldAdvice?.level || 'moderate';
      profile.recentAccuracy = this.calculateRecentAccuracy();

      const topicPerf = this.scaffolding.getTopicPerformance(topicPrefix);
      if (topicPerf) {
        profile.topicMastery = topicPerf.attempts > 0 ? topicPerf.correct / topicPerf.attempts : 0;
        profile.consecutiveWrong = topicPerf.consecutiveWrong || 0;
        profile.consecutiveCorrect = topicPerf.consecutiveCorrect || 0;
      }
    }

    // Get ZPD state and learning velocity
    if (this.zpdSystem) {
      const zpdAnalysis = this.zpdSystem.studentProfile || {};
      profile.learningVelocity = zpdAnalysis.learningVelocity || 1.0;
      profile.zpdState = zpdAnalysis.currentZPD || 'proximal';

      // Calculate velocity trend
      if (this.sessionMetrics.velocityChanges.length >= 3) {
        const recent = this.sessionMetrics.velocityChanges.slice(-3);
        const trend = recent[2] - recent[0];
        if (trend > 0.1) profile.velocityTrend = 'accelerating';
        else if (trend < -0.1) profile.velocityTrend = 'decelerating';
        else profile.velocityTrend = 'stable';
      }
    }

    // Get D20 stats
    if (this.d20System) {
      const stats = this.d20System.getStats();
      profile.wisdomModifier = this.d20System.getModifier('wisdom');
      profile.intelligenceModifier = this.d20System.getModifier('intelligence');
      profile.constitutionModifier = this.d20System.getModifier('constitution');
    }

    // Get HP state
    if (this.remediation) {
      const hp = this.remediation.getHP();
      profile.currentHP = hp.current;
      profile.maxHP = hp.max;
      profile.hpPercent = hp.percent;
    }

    // Get review queue
    if (this.persistence) {
      const wrongQueue = this.persistence.getWrongQueueForCategory(topicPrefix) || [];
      profile.reviewQueueSize = wrongQueue.length;
      profile.hasHighPriorityReview = wrongQueue.length > 0;
    }

    // Compute adaptive recommendations
    this.computeRecommendations(profile);

    this.currentProfile = profile;
    return profile;
  }

  /**
   * Calculate recent accuracy from scaffolding data
   */
  calculateRecentAccuracy() {
    if (!this.scaffolding || !this.scaffolding.data) return 0.5;

    const recent = this.scaffolding.data.recentPerformance || [];
    if (recent.length === 0) return 0.5;

    const correct = recent.filter(r => r.correct).length;
    return correct / recent.length;
  }

  /**
   * Compute adaptive recommendations based on profile
   */
  computeRecommendations(profile) {
    // 1. Determine scaffold count based on level and velocity
    let baseCount = this.config.scaffoldCounts[profile.scaffoldLevel] || 5;

    // Adjust based on learning velocity
    if (profile.learningVelocity < this.config.velocityThresholds.struggling) {
      // Struggling - add more scaffolds
      baseCount = Math.min(7, baseCount + 2);
    } else if (profile.learningVelocity > this.config.velocityThresholds.accelerating) {
      // Accelerating - reduce scaffolds
      baseCount = Math.max(1, baseCount - 2);
    }

    // Adjust based on consecutive wrong answers
    if (profile.consecutiveWrong >= 3) {
      baseCount = Math.min(7, baseCount + 1);
    }

    // Adjust based on HP (if low, provide more support)
    if (profile.hpPercent < 30) {
      baseCount = Math.min(7, baseCount + 1);
    }

    profile.recommendedScaffoldCount = baseCount;

    // 2. Determine hint quality based on WIS modifier
    const wis = profile.wisdomModifier;
    if (wis <= this.config.hintQuality.vague) {
      profile.hintQuality = 'explicit'; // Low WIS = needs explicit hints
    } else if (wis <= this.config.hintQuality.basic) {
      profile.hintQuality = 'good';
    } else if (wis <= this.config.hintQuality.good) {
      profile.hintQuality = 'moderate';
    } else {
      profile.hintQuality = 'vague'; // High WIS = can handle vague hints
    }

    // 3. Determine if warmups should be skipped
    profile.shouldSkipWarmups = (
      profile.scaffoldLevel === 'challenge' ||
      (profile.scaffoldLevel === 'light' && profile.topicMastery > this.config.masteryThreshold) ||
      (profile.learningVelocity > 1.6 && profile.consecutiveCorrect >= 5)
    );

    // 4. Determine if intervention needed
    profile.needsIntervention = (
      profile.consecutiveWrong >= this.config.interventionThreshold ||
      profile.hpPercent < 20 ||
      profile.velocityTrend === 'decelerating' && profile.learningVelocity < 0.8
    );

    // 5. Determine intervention type (using ZPD moment types)
    if (profile.needsIntervention) {
      if (profile.consecutiveWrong === 2) {
        profile.interventionType = 'correction';
      } else if (profile.consecutiveWrong >= 3) {
        profile.interventionType = 'pattern_guidance';
      } else if (profile.hpPercent < 20) {
        profile.interventionType = 'encouragement';
      } else if (profile.velocityTrend === 'decelerating') {
        profile.interventionType = 'conceptual_bridge';
      }
    }
  }

  /**
   * Get adaptive scaffold decision for a specific question
   */
  getScaffoldDecision(question, allScaffolds = []) {
    const topicPrefix = question.id ? question.id.substring(0, 3) : null;
    const profile = this.buildLearnerProfile(topicPrefix);

    const decision = {
      // How many scaffolds to show
      scaffoldCount: profile.recommendedScaffoldCount,

      // Which scaffolds to select (by relevance)
      selectedScaffolds: [],

      // Should we skip to main question?
      skipToMain: profile.shouldSkipWarmups,

      // Hint quality for this question
      hintQuality: profile.hintQuality,

      // Ms. Luminara's adaptive message
      mentorMessage: null,

      // Intervention needed?
      intervention: profile.needsIntervention ? {
        type: profile.interventionType,
        message: this.getInterventionMessage(profile)
      } : null,

      // XP multiplier based on scaffold level
      xpMultiplier: this.getXPMultiplier(profile),

      // Debug info
      profile: profile,
      timestamp: Date.now()
    };

    // Select scaffolds by relevance if isotope engine available
    if (allScaffolds.length > 0) {
      decision.selectedScaffolds = this.selectRelevantScaffolds(
        question,
        allScaffolds,
        decision.scaffoldCount
      );
    }

    // Generate mentor message
    decision.mentorMessage = this.generateMentorMessage(profile, question);

    this.lastDecision = decision;
    this.sessionMetrics.adaptiveAdjustments++;

    console.log('[AdaptiveEngine] Decision:', {
      scaffoldCount: decision.scaffoldCount,
      skipToMain: decision.skipToMain,
      hintQuality: decision.hintQuality,
      intervention: decision.intervention?.type,
      level: profile.scaffoldLevel,
      velocity: profile.learningVelocity.toFixed(2)
    });

    return decision;
  }

  /**
   * Select the most relevant scaffolds using isotope matching
   */
  selectRelevantScaffolds(mainQuestion, allScaffolds, count) {
    if (!this.isotopeEngine || allScaffolds.length <= count) {
      // No isotope engine or fewer scaffolds than needed - return first N
      return allScaffolds.slice(0, count);
    }

    // Score each scaffold by relevance to main question
    const mainIsotopes = mainQuestion.isotopes || [];
    const mainKeywords = this.extractKeywords(mainQuestion.q || '');

    const scored = allScaffolds.map((scaffold, idx) => {
      let score = 0;

      // Isotope overlap
      const scaffoldIsotopes = scaffold.isotopes || [];
      const isotopeOverlap = mainIsotopes.filter(iso =>
        scaffoldIsotopes.some(sIso => sIso.includes(iso) || iso.includes(sIso))
      ).length;
      score += isotopeOverlap * 10;

      // Keyword overlap
      const scaffoldKeywords = this.extractKeywords(scaffold.q || '');
      const keywordOverlap = mainKeywords.filter(kw => scaffoldKeywords.includes(kw)).length;
      score += keywordOverlap * 5;

      // Prefer earlier scaffolds (foundational)
      score += (allScaffolds.length - idx) * 0.5;

      // Boost scaffolds targeting struggle concepts
      if (this.zpdSystem && this.zpdSystem.studentProfile) {
        const struggles = this.zpdSystem.studentProfile.struggleConcepts || new Map();
        for (const iso of scaffoldIsotopes) {
          if (struggles.has(iso)) {
            score += struggles.get(iso) * 3;
          }
        }
      }

      return { scaffold, score, idx };
    });

    // Sort by score (descending) and take top N
    scored.sort((a, b) => b.score - a.score);

    // But maintain original order among selected
    const selected = scored.slice(0, count);
    selected.sort((a, b) => a.idx - b.idx);

    return selected.map(s => s.scaffold);
  }

  /**
   * Extract keywords from question text
   */
  extractKeywords(text) {
    if (!text) return [];

    // Remove common words and extract meaningful terms
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'of', 'in', 'to',
      'for', 'with', 'on', 'at', 'by', 'from', 'as', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
      'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until',
      'while', 'this', 'that', 'these', 'those', 'what', 'which', 'who'
    ]);

    return text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Get XP multiplier based on profile
   */
  getXPMultiplier(profile) {
    let multiplier = 1.0;

    // Bonus for challenge level
    if (profile.scaffoldLevel === 'challenge') {
      multiplier += 0.25;
    }

    // Bonus for high velocity
    if (profile.learningVelocity > 1.3) {
      multiplier += 0.15;
    }

    // Bonus for low HP perseverance
    if (profile.hpPercent < 30 && profile.consecutiveCorrect >= 2) {
      multiplier += 0.2; // Grit bonus
    }

    // Slight reduction for heavy scaffolding (more support = slightly less XP)
    if (profile.scaffoldLevel === 'heavy') {
      multiplier -= 0.1;
    }

    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  /**
   * Generate Ms. Luminara's teaching moment for scaffolding
   * Provides context about what we're building toward and why this scaffold matters
   */
  generateMentorMessage(profile, question, scaffoldContext = null) {
    // Get the teaching moment based on context
    return this.generateTeachingMoment(profile, question, scaffoldContext);
  }

  /**
   * Generate a teaching moment that explains the learning journey
   * @param profile - learner profile
   * @param question - the MAIN question we're building toward
   * @param scaffoldContext - optional context about current scaffold
   */
  generateTeachingMoment(profile, question, scaffoldContext) {
    const parts = [];

    // 1. Add contextual intro based on where we are in the learning journey
    parts.push(this.getJourneyIntro(profile));

    // 2. Add content-specific guidance based on the main question's topic
    const topicGuidance = this.getTopicGuidance(question);
    if (topicGuidance) {
      parts.push(topicGuidance);
    }

    // 3. Add mechanism hint if available (but not the full metaphor - save that for after)
    const mechanismHint = this.getMechanismHint(question);
    if (mechanismHint) {
      parts.push(mechanismHint);
    }

    return parts.join('\n\n');
  }

  /**
   * Get intro based on learner's journey/state
   */
  getJourneyIntro(profile) {
    // Heavy scaffolding - building from ground up
    if (profile.scaffoldLevel === 'heavy') {
      const heavyIntros = [
        "Let's start with the fundamentals and build up to the main concept.",
        "We'll take this step by step. Each piece connects to the next.",
        "I want to make sure the foundation is solid before we tackle the main question.",
        "Let's walk through the building blocks together."
      ];
      return heavyIntros[Math.floor(Math.random() * heavyIntros.length)];
    }

    // Moderate scaffolding - connecting pieces
    if (profile.scaffoldLevel === 'moderate') {
      const modIntros = [
        "Let's connect a few key concepts before the main question.",
        "These scaffolds will help you see how the pieces fit together.",
        "A quick warmup to activate the relevant knowledge.",
        "Let's review what connects to this topic."
      ];
      return modIntros[Math.floor(Math.random() * modIntros.length)];
    }

    // Light scaffolding - quick refresh
    if (profile.scaffoldLevel === 'light') {
      const lightIntros = [
        "Just a quick check on the key concepts.",
        "A brief refresher before we continue.",
        "Let's touch on the essentials.",
        "Quick review — you likely know this already."
      ];
      return lightIntros[Math.floor(Math.random() * lightIntros.length)];
    }

    // Challenge - skip scaffolds
    const challengeIntros = [
      "You're ready for the main question. Let's see what you know!",
      "No scaffolding needed — straight to it.",
      "Challenge mode: show me your understanding."
    ];
    return challengeIntros[Math.floor(Math.random() * challengeIntros.length)];
  }

  /**
   * Get topic-specific guidance based on question category
   */
  getTopicGuidance(question) {
    if (!question || !question.id) return null;

    const prefix = question.id.substring(0, 3);

    const topicGuidance = {
      '100': [
        "🧠 We're exploring brain anatomy. Think about structure → function relationships.",
        "🧠 Brain regions have specialized roles. Which area handles what?",
        "🧠 Consider how different brain structures communicate and coordinate."
      ],
      '200': [
        "⚡ This involves neural pathways. Trace the signal from start to finish.",
        "⚡ Think about sensory vs motor pathways and where they travel.",
        "⚡ Consider: Which nerves carry which information, and where?"
      ],
      '400': [
        "🔬 Tissue structure determines function. What does this tissue need to do?",
        "🔬 The 4 tissue types each have distinct characteristics. Which applies here?",
        "🔬 Think about how cells are arranged and why that matters."
      ],
      '500': [
        "🌿 Sympathetic vs parasympathetic — fight-or-flight vs rest-and-digest.",
        "🌿 Consider the neurotransmitters and receptors involved.",
        "🌿 The ANS controls automatic functions. Which division handles this?"
      ],
      '600': [
        "👁️ Special senses convert stimuli into neural signals. How does the pathway work?",
        "👁️ Think about the receptor → pathway → perception chain.",
        "👁️ Each sense has specialized structures. What's unique about this one?"
      ],
      '700': [
        "🧪 Hormones work through feedback loops. What triggers what?",
        "🧪 Consider: Which gland, which hormone, which target, what effect?",
        "🧪 Endocrine signaling is slower but longer-lasting than neural. Why does that matter here?"
      ]
    };

    const guidance = topicGuidance[prefix];
    if (guidance) {
      return guidance[Math.floor(Math.random() * guidance.length)];
    }
    return null;
  }

  /**
   * Get a hint from the question's mechanism (title only, not the full metaphor)
   */
  getMechanismHint(question) {
    if (!question) return null;

    // If there's a mechanism with a title, use it as a conceptual anchor
    if (question.mechanism && question.mechanism.title) {
      return `📚 **Building toward:** ${question.mechanism.title}`;
    }

    return null;
  }

  /**
   * Get intervention message from Ms. Luminara based on profile
   */
  getInterventionMessage(profile, question = null) {
    let message;

    switch (profile.interventionType) {
      case 'correction':
        const corrections = [
          "Let me clarify something that will help with this concept.",
          "I notice a pattern — let's address the underlying principle.",
          "There's a key distinction here worth understanding."
        ];
        message = corrections[Math.floor(Math.random() * corrections.length)];
        break;
      case 'pattern_guidance':
        const patterns = [
          "I see a pattern forming. Let me illuminate the connection.",
          "These concepts share an underlying structure. Here's how they relate.",
          "There's a way to think about this that ties everything together."
        ];
        message = patterns[Math.floor(Math.random() * patterns.length)];
        break;
      case 'encouragement':
        const encouragements = [
          "You're making progress, even when it doesn't feel like it. Let's continue.",
          "Every expert started exactly where you are. Keep building.",
          "Understanding takes time. You're doing the work — that's what matters."
        ];
        message = encouragements[Math.floor(Math.random() * encouragements.length)];
        break;
      case 'conceptual_bridge':
        const bridges = [
          "Let me connect this to something you already understand.",
          "This builds on concepts we've seen before. Here's the link.",
          "Remember the foundation we built? This extends from there."
        ];
        message = bridges[Math.floor(Math.random() * bridges.length)];
        break;
      default:
        message = "Let's work through this together.";
    }

    // Add topic guidance if question provided
    if (question) {
      const topicGuidance = this.getTopicGuidance(question);
      if (topicGuidance) {
        return `${message}\n\n${topicGuidance}`;
      }
    }

    return message;
  }

  /**
   * Record answer and update adaptive state
   */
  recordAnswer(questionId, wasCorrect, explorationCount = 1) {
    this.sessionMetrics.questionsAnswered++;

    // Track velocity changes
    if (this.zpdSystem && this.zpdSystem.studentProfile) {
      this.sessionMetrics.velocityChanges.push(
        this.zpdSystem.studentProfile.learningVelocity || 1.0
      );

      // Keep only last 10 velocity readings
      if (this.sessionMetrics.velocityChanges.length > 10) {
        this.sessionMetrics.velocityChanges.shift();
      }
    }

    // Update ZPD system if available
    if (this.zpdSystem && typeof this.zpdSystem.recordInteraction === 'function') {
      this.zpdSystem.recordInteraction(questionId, wasCorrect);
    }

    // Track scaffolds provided/skipped
    if (this.lastDecision) {
      if (this.lastDecision.skipToMain) {
        this.sessionMetrics.scaffoldsSkipped += 7; // Max scaffolds
      } else {
        this.sessionMetrics.scaffoldsProvided += this.lastDecision.scaffoldCount;
        this.sessionMetrics.scaffoldsSkipped += (7 - this.lastDecision.scaffoldCount);
      }
    }
  }

  /**
   * Get session metrics summary
   */
  getSessionSummary() {
    return {
      questionsAnswered: this.sessionMetrics.questionsAnswered,
      scaffoldsProvided: this.sessionMetrics.scaffoldsProvided,
      scaffoldsSkipped: this.sessionMetrics.scaffoldsSkipped,
      adaptiveAdjustments: this.sessionMetrics.adaptiveAdjustments,
      averageVelocity: this.sessionMetrics.velocityChanges.length > 0
        ? this.sessionMetrics.velocityChanges.reduce((a, b) => a + b, 0) /
          this.sessionMetrics.velocityChanges.length
        : 1.0,
      currentProfile: this.currentProfile
    };
  }

  /**
   * Reset session metrics
   */
  resetSession() {
    this.sessionMetrics = {
      questionsAnswered: 0,
      scaffoldsProvided: 0,
      scaffoldsSkipped: 0,
      adaptiveAdjustments: 0,
      velocityChanges: []
    };
    this.currentProfile = null;
    this.lastDecision = null;
  }

  /**
   * Get difficulty recommendation for next question
   */
  getNextQuestionDifficulty() {
    if (!this.currentProfile) return 'medium';

    const velocity = this.currentProfile.learningVelocity;
    const level = this.currentProfile.scaffoldLevel;

    // Map to difficulty levels
    if (level === 'challenge' && velocity > 1.3) {
      return 'hard';
    } else if (level === 'heavy' || velocity < 0.8) {
      return 'easy';
    } else if (level === 'light' && velocity > 1.1) {
      return 'medium-hard';
    } else {
      return 'medium';
    }
  }

  /**
   * Check if learner should take a break (cognitive load management)
   */
  shouldSuggestBreak() {
    if (!this.currentProfile) return false;

    // Suggest break if:
    // - HP is critically low
    // - Velocity has dropped significantly
    // - Many consecutive wrong answers
    // - Long session without breaks

    if (this.currentProfile.hpPercent < 15) return true;
    if (this.currentProfile.consecutiveWrong >= 5) return true;
    if (this.currentProfile.learningVelocity < 0.5) return true;
    if (this.sessionMetrics.questionsAnswered > 50 &&
        this.currentProfile.velocityTrend === 'decelerating') return true;

    return false;
  }

  /**
   * Get break suggestion message
   */
  getBreakMessage() {
    const messages = [
      "Your brain is working hard! A 5-minute break might help consolidate what you've learned.",
      "Studies show that short breaks improve retention. Want to pause for a moment?",
      "Even Ms. Luminara takes breaks! Step away for a few minutes - the knowledge will sink in.",
      "You've been at this for a while. A quick break can actually speed up learning.",
      "Let's pause here. When you come back, you might find these concepts click more easily."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

// Create global instance
const adaptiveEngine = new AdaptiveScaffoldEngine();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => adaptiveEngine.init());
  } else {
    // DOM already loaded
    setTimeout(() => adaptiveEngine.init(), 100);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdaptiveScaffoldEngine, adaptiveEngine };
}
