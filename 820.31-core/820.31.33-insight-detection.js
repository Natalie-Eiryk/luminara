/**
 * Ms. Luminara Quiz - Insight Detection Engine
 *
 * Implements Phase 1 of the Implementation Roadmap (510.108):
 * Iterative Socratic Scaffolding with adaptive depth.
 *
 * Research Basis: Socrates - "forcing minds to freedom" through continued questioning
 *
 * The Socratic method emphasizes iterative dialogue until insight emerges.
 * This engine detects when the learner has achieved genuine understanding vs.
 * still operating from misconception.
 *
 * Insight Signals:
 * - Correct answer + fast response (< threshold) = likely insight
 * - Correct answer + slow response = possibly uncertain/guessing
 * - Pattern of same misconception across scaffolds = no insight yet
 * - Shift in wrong answer pattern = partial insight (reconceptualizing)
 *
 * Key Insight from Research (510.106):
 * "What the child can do today with assistance, she will be able to do by herself tomorrow."
 * - Vygotsky
 *
 * The goal is not to test, but to scaffold until the learner achieves insight.
 */

class InsightDetectionEngine {
  constructor() {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURABLE THRESHOLDS
    // ═══════════════════════════════════════════════════════════════

    // Confidence required to consider insight achieved
    this.CONFIDENCE_THRESHOLD = 0.7;

    // Minimum scaffolds before insight check (ensure some practice)
    this.MIN_SCAFFOLDS = 2;

    // Maximum scaffolds before offering explicit mechanism explanation
    this.MAX_SCAFFOLDS = 7;

    // Time threshold for "fast" response (milliseconds)
    // Fast + correct = strong evidence of insight
    this.FAST_RESPONSE_MS = 5000;

    // Time threshold for "slow" response
    // Slow + correct = possibly uncertain
    this.SLOW_RESPONSE_MS = 15000;

    // Streak of correct answers indicating solid understanding
    this.INSIGHT_STREAK = 2;

    // Ms. Luminara exit messages for different conditions
    this.EXIT_MESSAGES = {
      insight_achieved: [
        "There it is. You found it yourself.",
        "See? You knew more than you thought.",
        "That's the understanding I was leading you toward.",
        "Yes. That click you just felt? That's learning.",
        "Now you're seeing the mechanism. That's what I wanted."
      ],
      maximum_reached: [
        "Let me show you something. *pulls out mechanism explanation*",
        "Okay, let's look at this differently. Here's what's actually happening...",
        "I think you need to see the whole picture. Stay with me.",
        "Sometimes the scaffold needs to become a ladder. Let me walk you through this.",
        "Let's pause the questions and talk about the underlying mechanism."
      ],
      soft_exit_taken: [
        "Taking a break from this one? That's valid. It'll click later.",
        "Sometimes understanding needs to simmer. We'll come back.",
        "Stepping back is part of learning. This will resurface.",
        "Not forcing it. These questions will circle back when you're ready.",
        "Pausing here. The concept isn't going anywhere."
      ],
      partial_progress: [
        "You're thinking about this differently now. That's progress, even if the answer isn't there yet.",
        "I see you reconsidering. That shift in thinking? That's learning happening.",
        "Your wrong answers are changing. That means your mental model is updating.",
        "The way you're reasoning through this has shifted. We're getting somewhere."
      ]
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // CORE INSIGHT EVALUATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Evaluate whether insight has been achieved based on scaffold results
   *
   * @param {array} scaffoldResults - Array of { wasCorrectFirstTry, timeToAnswerMs, selectedOption }
   * @param {array} wrongPatternHistory - History of wrong options selected (for trajectory analysis)
   * @returns {object} { hasInsight, confidence, recommendation, reason }
   */
  evaluateInsight(scaffoldResults, wrongPatternHistory = []) {
    if (!scaffoldResults || scaffoldResults.length === 0) {
      return {
        hasInsight: false,
        confidence: 0,
        recommendation: 'continue',
        reason: 'no_data'
      };
    }

    const depth = scaffoldResults.length;

    // Check minimum depth
    if (depth < this.MIN_SCAFFOLDS) {
      return {
        hasInsight: false,
        confidence: 0,
        recommendation: 'continue',
        reason: 'minimum_not_reached',
        message: `Need at least ${this.MIN_SCAFFOLDS} scaffolds before checking for insight`
      };
    }

    // Compute confidence factors
    const correctStreak = this.computeCorrectStreak(scaffoldResults);
    const speedConfidence = this.computeSpeedConfidence(scaffoldResults);
    const patternShift = this.detectConceptualShift(wrongPatternHistory);
    const overallAccuracy = this.computeAccuracy(scaffoldResults);

    // Combined confidence calculation
    // Weights: streak (40%), speed (30%), accuracy (30%)
    let confidence = 0;

    // Streak factor: consecutive correct answers at the end
    if (correctStreak >= this.INSIGHT_STREAK) {
      confidence += 0.4 * Math.min(1, correctStreak / this.INSIGHT_STREAK);
    } else if (correctStreak === 1 && scaffoldResults[scaffoldResults.length - 1].wasCorrectFirstTry) {
      confidence += 0.2;  // Single correct at end is weak evidence
    }

    // Speed factor: fast correct answers indicate automaticity
    confidence += 0.3 * speedConfidence;

    // Accuracy factor
    confidence += 0.3 * overallAccuracy;

    // Bonus for pattern shift (reconceptualization is progress)
    if (patternShift.detected) {
      confidence += 0.1;  // Small bonus for evidence of mental model change
    }

    // Determine recommendation
    let hasInsight = confidence >= this.CONFIDENCE_THRESHOLD;
    let recommendation = 'continue';
    let reason = '';

    if (hasInsight) {
      recommendation = 'complete_insight';
      reason = 'confidence_threshold_reached';
    } else if (depth >= this.MAX_SCAFFOLDS) {
      recommendation = 'complete_maximum';
      reason = 'maximum_scaffolds_reached';
    } else if (overallAccuracy === 0 && depth >= 4) {
      // Struggling badly - might need explicit help
      recommendation = 'offer_explicit_help';
      reason = 'struggling_no_progress';
    }

    return {
      hasInsight,
      confidence: Math.round(confidence * 100) / 100,
      recommendation,
      reason,
      metrics: {
        depth,
        correctStreak,
        speedConfidence: Math.round(speedConfidence * 100) / 100,
        accuracy: Math.round(overallAccuracy * 100) / 100,
        patternShift: patternShift.detected
      }
    };
  }

  /**
   * Compute consecutive correct answers at the end of scaffold sequence
   */
  computeCorrectStreak(scaffoldResults) {
    let streak = 0;
    for (let i = scaffoldResults.length - 1; i >= 0; i--) {
      if (scaffoldResults[i].wasCorrectFirstTry) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  /**
   * Compute speed-based confidence
   * Fast correct answers = higher confidence
   */
  computeSpeedConfidence(scaffoldResults) {
    const correctWithTime = scaffoldResults.filter(r =>
      r.wasCorrectFirstTry && r.timeToAnswerMs > 0
    );

    if (correctWithTime.length === 0) return 0;

    let speedScore = 0;
    for (const result of correctWithTime) {
      if (result.timeToAnswerMs < this.FAST_RESPONSE_MS) {
        speedScore += 1.0;  // Fast = confident
      } else if (result.timeToAnswerMs < this.SLOW_RESPONSE_MS) {
        speedScore += 0.5;  // Medium = some confidence
      } else {
        speedScore += 0.2;  // Slow = minimal confidence
      }
    }

    return speedScore / correctWithTime.length;
  }

  /**
   * Compute overall accuracy across scaffold results
   */
  computeAccuracy(scaffoldResults) {
    const correct = scaffoldResults.filter(r => r.wasCorrectFirstTry).length;
    return correct / scaffoldResults.length;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONCEPTUAL SHIFT DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detect conceptual shift (different wrong answer = progress)
   *
   * Research basis (Piaget): When a learner's wrong answers change,
   * it indicates accommodation - their mental model is being restructured.
   * This is PROGRESS, not failure.
   *
   * @param {array} wrongPatternHistory - Array of wrong option indices
   * @returns {object} { detected, from, to, type }
   */
  detectConceptualShift(wrongPatternHistory) {
    if (!wrongPatternHistory || wrongPatternHistory.length < 3) {
      return { detected: false };
    }

    // Look at recent pattern vs earlier pattern
    const recent = wrongPatternHistory.slice(-3);
    const earlier = wrongPatternHistory.slice(-6, -3);

    if (earlier.length < 2) {
      return { detected: false };
    }

    const recentMode = this.mode(recent.filter(x => x !== null && x !== undefined));
    const earlierMode = this.mode(earlier.filter(x => x !== null && x !== undefined));

    if (recentMode !== null && earlierMode !== null && recentMode !== earlierMode) {
      return {
        detected: true,
        from: earlierMode,
        to: recentMode,
        type: 'misconception_shift'
      };
    }

    return { detected: false };
  }

  /**
   * Compute mode (most frequent value) of an array
   */
  mode(arr) {
    if (!arr || arr.length === 0) return null;

    const counts = {};
    let maxCount = 0;
    let modeVal = null;

    for (const val of arr) {
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        modeVal = val;
      }
    }

    return modeVal;
  }

  // ═══════════════════════════════════════════════════════════════
  // DECISION SUPPORT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Determine if scaffolding should continue
   *
   * @param {object} evaluation - Result from evaluateInsight()
   * @returns {boolean} true if should continue scaffolding
   */
  shouldContinue(evaluation) {
    return evaluation.recommendation === 'continue' ||
           evaluation.recommendation === 'offer_explicit_help';
  }

  /**
   * Get exit reason for logging/analytics
   */
  getExitReason(evaluation) {
    switch (evaluation.recommendation) {
      case 'complete_insight':
        return 'insight_achieved';
      case 'complete_maximum':
        return 'maximum_reached';
      case 'offer_explicit_help':
        return 'struggling_offered_help';
      default:
        return 'unknown';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // MS. LUMINARA VOICE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get Ms. Luminara's message for scaffold exit condition
   *
   * @param {string} exitReason - 'insight_achieved' | 'maximum_reached' | 'soft_exit_taken'
   * @param {object} context - Optional context for personalization
   * @returns {string} Ms. Luminara's message
   */
  getExitMessage(exitReason, context = {}) {
    const messages = this.EXIT_MESSAGES[exitReason] ||
                     this.EXIT_MESSAGES.insight_achieved;

    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get encouragement message during scaffolding
   *
   * @param {number} depth - Current scaffold depth
   * @param {object} evaluation - Current insight evaluation
   * @returns {string} Ms. Luminara's encouragement
   */
  getProgressMessage(depth, evaluation) {
    if (evaluation.metrics?.patternShift) {
      const msgs = this.EXIT_MESSAGES.partial_progress;
      return msgs[Math.floor(Math.random() * msgs.length)];
    }

    if (evaluation.confidence > 0.4 && evaluation.confidence < this.CONFIDENCE_THRESHOLD) {
      return "Getting closer. Let's keep going.";
    }

    if (depth > 4 && evaluation.metrics?.accuracy < 0.3) {
      return "This is tricky. Let me try a different angle.";
    }

    // Default: no message (let scaffold questions speak)
    return null;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANALYTICS INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate analytics record for scaffold session
   *
   * @param {string} triggerQuestionId - Question that started scaffolding
   * @param {array} scaffoldResults - Results from scaffold session
   * @param {object} finalEvaluation - Final insight evaluation
   * @returns {object} Analytics record for QuestionStatisticsEngine
   */
  generateAnalyticsRecord(triggerQuestionId, scaffoldResults, finalEvaluation) {
    return {
      triggerQuestionId,
      scaffoldDepth: scaffoldResults.length,
      insightAchieved: finalEvaluation.hasInsight,
      exitReason: this.getExitReason(finalEvaluation),
      confidence: finalEvaluation.confidence,
      metrics: finalEvaluation.metrics,
      timestamp: Date.now(),
      duration: scaffoldResults.length > 0
        ? scaffoldResults[scaffoldResults.length - 1].timestamp - scaffoldResults[0].timestamp
        : 0
    };
  }
}

// Export singleton
let insightDetection = null;

// Factory function for initialization
function initInsightDetection() {
  if (!insightDetection) {
    insightDetection = new InsightDetectionEngine();
    console.log('[InsightDetection] Engine initialized');
  }
  return insightDetection;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { InsightDetectionEngine, initInsightDetection };
}
