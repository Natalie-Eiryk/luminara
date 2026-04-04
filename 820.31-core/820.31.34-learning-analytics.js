/**
 * Ms. Luminara Quiz - Learning Analytics Engine
 *
 * Implements multiple opportunities from the Implementation Roadmap (510.108):
 *
 * Opportunity 1: Conceptual Change Detection
 *   - Track misconception trajectories over time
 *   - Detect and celebrate when wrong answer patterns shift
 *   - Piaget's accommodation: shifts indicate mental model restructuring
 *
 * Opportunity 2: Forgetting Curve Integration
 *   - Ebbinghaus-style spaced repetition intervals
 *   - Time-weighted review priority queue
 *   - "Spaced Review" study mode
 *
 * Opportunity 4: Bootstrap Statistics
 *   - Synthetic difficulty estimates for cold-start
 *   - Complexity heuristics based on question structure
 *
 * Opportunity 7: Analytics Dashboard Data
 *   - Teaching effectiveness metrics
 *   - Exportable statistics for research
 *
 * Research Basis:
 * - Piaget: Accommodation through cognitive conflict
 * - Ebbinghaus: Forgetting curves and optimal review timing
 * - Redish: "What are students learning?" not "What are we teaching?"
 */

class LearningAnalyticsEngine {
  constructor(persistenceManager, questionStatistics) {
    this.persistence = persistenceManager;
    this.questionStatistics = questionStatistics;
    this.STORAGE_KEY = 'ms_luminara_learning_analytics';
    this.data = this.loadData();

    // ═══════════════════════════════════════════════════════════════
    // FORGETTING CURVE CONFIGURATION (Ebbinghaus)
    // ═══════════════════════════════════════════════════════════════

    // Review intervals in days (exponential backoff)
    this.REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

    // Priority threshold for "due" reviews
    this.REVIEW_DUE_THRESHOLD = 0.8;

    // ═══════════════════════════════════════════════════════════════
    // CONCEPTUAL CHANGE CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    // Minimum trajectory entries before detecting shift
    this.MIN_TRAJECTORY_LENGTH = 4;

    // How many recent answers to compare vs earlier
    this.TRAJECTORY_WINDOW = 3;

    // ═══════════════════════════════════════════════════════════════
    // MS. LUMINARA MESSAGES FOR CONCEPTUAL PROGRESS
    // ═══════════════════════════════════════════════════════════════

    this.CONCEPTUAL_SHIFT_MESSAGES = [
      "Interesting - you used to think \"{from}\" but now you're drawn to \"{to}\". Your model is evolving.",
      "I notice you're thinking differently about this. That shift in reasoning? That's learning happening.",
      "You've moved from one way of seeing this to another. Let's examine both.",
      "Your wrong answers are changing. That means your mental model is updating.",
      "The way you're reasoning through this has shifted. We're getting somewhere.",
      "See how your thinking changed? From \"{from}\" to \"{to}\". That's not failure - that's progress.",
      "You're reconceptualizing. The old answer made sense to you once. Now something else does. That's growth."
    ];

    this.MASTERY_CELEBRATION_MESSAGES = [
      "You've conquered this one. It used to trip you up - now it's automatic.",
      "Remember when this was hard? Look at you now.",
      "From confusion to clarity. This is what learning looks like.",
      "Mastered. This concept is yours now."
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // DATA PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[LearningAnalytics] Failed to load data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      // Misconception trajectories per question
      // { questionId: [{ option, timestamp, sessionId }] }
      misconceptionTrajectories: {},

      // Detected conceptual shifts
      // { odId: [{ from, to, detectedAt, celebrated }] }
      conceptualShifts: {},

      // Review scheduling (forgetting curve)
      // { questionId: { lastReview, reviewCount, nextReviewAt, streak } }
      reviewSchedule: {},

      // Learning milestones
      // { questionId: { firstSeen, firstCorrect, mastered, masteredAt } }
      milestones: {},

      // Session-level analytics
      sessions: [],
      currentSessionId: null,

      // Global metrics
      metrics: {
        totalConceptualShifts: 0,
        totalMasteries: 0,
        avgScaffoldDepthToInsight: null,
        reviewsCompleted: 0,
        reviewsOnTime: 0
      }
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[LearningAnalytics] Failed to save data:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // OPPORTUNITY 1: CONCEPTUAL CHANGE DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record a misconception (wrong answer) to the trajectory
   *
   * @param {string} questionId - Question that was answered incorrectly
   * @param {number} selectedOption - Which wrong option was selected
   * @param {object} questionData - Full question object (for option text)
   * @returns {object|null} Conceptual shift if detected
   */
  recordMisconception(questionId, selectedOption, questionData = null) {
    if (!this.data.misconceptionTrajectories[questionId]) {
      this.data.misconceptionTrajectories[questionId] = [];
    }

    const trajectory = this.data.misconceptionTrajectories[questionId];

    trajectory.push({
      option: selectedOption,
      optionText: questionData?.options?.[selectedOption] || null,
      timestamp: Date.now(),
      sessionId: this.data.currentSessionId
    });

    // Keep trajectory manageable (last 20 entries)
    if (trajectory.length > 20) {
      this.data.misconceptionTrajectories[questionId] = trajectory.slice(-20);
    }

    // Check for conceptual shift
    const shift = this.detectConceptualShift(questionId, questionData);

    this.save();

    return shift;
  }

  /**
   * Detect if the learner's misconception pattern has shifted
   *
   * Research Basis (Piaget): When wrong answers change, it indicates
   * accommodation - the mental model is being restructured.
   * This is PROGRESS, not continued failure.
   *
   * @param {string} questionId - Question to analyze
   * @param {object} questionData - Full question object (for option text)
   * @returns {object|null} Shift details if detected
   */
  detectConceptualShift(questionId, questionData = null) {
    const trajectory = this.data.misconceptionTrajectories[questionId];

    if (!trajectory || trajectory.length < this.MIN_TRAJECTORY_LENGTH) {
      return null;
    }

    // Compare recent window to earlier window
    const recent = trajectory.slice(-this.TRAJECTORY_WINDOW);
    const earlier = trajectory.slice(
      -(this.TRAJECTORY_WINDOW * 2),
      -this.TRAJECTORY_WINDOW
    );

    if (earlier.length < 2) return null;

    const recentMode = this.mode(recent.map(t => t.option));
    const earlierMode = this.mode(earlier.map(t => t.option));

    // No shift if same dominant misconception
    if (recentMode === earlierMode || recentMode === null || earlierMode === null) {
      return null;
    }

    // Check if this shift was already recorded
    const existingShifts = this.data.conceptualShifts[questionId] || [];
    const alreadyRecorded = existingShifts.some(s =>
      s.from === earlierMode && s.to === recentMode
    );

    if (alreadyRecorded) return null;

    // Record the shift
    const shift = {
      from: earlierMode,
      to: recentMode,
      fromText: questionData?.options?.[earlierMode] || `Option ${earlierMode + 1}`,
      toText: questionData?.options?.[recentMode] || `Option ${recentMode + 1}`,
      detectedAt: Date.now(),
      celebrated: false
    };

    if (!this.data.conceptualShifts[questionId]) {
      this.data.conceptualShifts[questionId] = [];
    }
    this.data.conceptualShifts[questionId].push(shift);
    this.data.metrics.totalConceptualShifts++;

    this.save();

    console.log(`[LearningAnalytics] Conceptual shift detected for ${questionId}: ${shift.fromText} -> ${shift.toText}`);

    return shift;
  }

  /**
   * Get Ms. Luminara's message for a conceptual shift
   *
   * @param {object} shift - Shift object with from/to text
   * @returns {string} Personalized message
   */
  getConceptualShiftMessage(shift) {
    const template = this.CONCEPTUAL_SHIFT_MESSAGES[
      Math.floor(Math.random() * this.CONCEPTUAL_SHIFT_MESSAGES.length)
    ];

    return template
      .replace('{from}', shift.fromText)
      .replace('{to}', shift.toText);
  }

  /**
   * Mark a shift as celebrated (shown to user)
   */
  markShiftCelebrated(questionId, shiftIndex = -1) {
    const shifts = this.data.conceptualShifts[questionId];
    if (!shifts || shifts.length === 0) return;

    const idx = shiftIndex === -1 ? shifts.length - 1 : shiftIndex;
    if (shifts[idx]) {
      shifts[idx].celebrated = true;
      this.save();
    }
  }

  /**
   * Get uncelebrated shifts for a question
   */
  getUncelebratedShifts(questionId) {
    const shifts = this.data.conceptualShifts[questionId] || [];
    return shifts.filter(s => !s.celebrated);
  }

  // ═══════════════════════════════════════════════════════════════
  // OPPORTUNITY 2: FORGETTING CURVE INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Schedule a question for review (add to spaced repetition queue)
   *
   * @param {string} questionId - Question to schedule
   * @param {boolean} wasCorrect - Whether the answer was correct
   */
  scheduleReview(questionId, wasCorrect) {
    if (!this.data.reviewSchedule[questionId]) {
      this.data.reviewSchedule[questionId] = {
        lastReview: null,
        reviewCount: 0,
        nextReviewAt: null,
        streak: 0,
        addedAt: Date.now()
      };
    }

    const schedule = this.data.reviewSchedule[questionId];
    schedule.lastReview = Date.now();

    if (wasCorrect) {
      schedule.streak++;
      schedule.reviewCount++;

      // Calculate next review based on streak (Ebbinghaus intervals)
      const intervalIndex = Math.min(schedule.streak - 1, this.REVIEW_INTERVALS.length - 1);
      const intervalDays = this.REVIEW_INTERVALS[intervalIndex];
      schedule.nextReviewAt = Date.now() + (intervalDays * 24 * 60 * 60 * 1000);

      // Check for mastery (5+ streak)
      if (schedule.streak >= 5) {
        this.recordMastery(questionId);
      }
    } else {
      // Wrong answer resets streak but not completely
      schedule.streak = Math.max(0, schedule.streak - 2);

      // Schedule sooner review (1 day)
      schedule.nextReviewAt = Date.now() + (1 * 24 * 60 * 60 * 1000);
    }

    this.save();

    return {
      nextReviewAt: schedule.nextReviewAt,
      nextReviewIn: this.formatTimeUntil(schedule.nextReviewAt),
      streak: schedule.streak
    };
  }

  /**
   * Get review priority for a question (0.0 to 1.0+)
   * Higher = more urgent to review
   *
   * @param {string} questionId - Question to check
   * @returns {number} Priority score
   */
  getReviewPriority(questionId) {
    const schedule = this.data.reviewSchedule[questionId];

    if (!schedule) return 0;
    if (!schedule.nextReviewAt) return 1.0; // Never reviewed

    const now = Date.now();
    const timeSincedue = now - schedule.nextReviewAt;

    if (timeSincedue < 0) {
      // Not yet due - priority based on how close
      const timeUntilDue = -timeSincedue;
      const msPerDay = 24 * 60 * 60 * 1000;
      return Math.max(0, 1 - (timeUntilDue / msPerDay));
    }

    // Overdue - priority increases with time
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysOverdue = timeSincedue / msPerDay;
    return Math.min(2.0, 1.0 + (daysOverdue * 0.2)); // Cap at 2.0
  }

  /**
   * Get optimal review queue (questions due or overdue)
   *
   * @param {number} limit - Maximum questions to return
   * @returns {array} Ordered list of { questionId, priority, schedule }
   */
  getReviewQueue(limit = 20) {
    const queue = [];

    for (const [questionId, schedule] of Object.entries(this.data.reviewSchedule)) {
      const priority = this.getReviewPriority(questionId);

      if (priority >= this.REVIEW_DUE_THRESHOLD) {
        queue.push({
          questionId,
          priority,
          schedule: { ...schedule },
          isOverdue: priority > 1.0,
          daysUntilDue: this.getDaysUntil(schedule.nextReviewAt)
        });
      }
    }

    return queue
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  /**
   * Get all questions in review schedule with their status
   */
  getFullReviewSchedule() {
    const schedule = [];

    for (const [questionId, data] of Object.entries(this.data.reviewSchedule)) {
      schedule.push({
        questionId,
        ...data,
        priority: this.getReviewPriority(questionId),
        status: this.getReviewStatus(questionId)
      });
    }

    return schedule.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get review status for a question
   */
  getReviewStatus(questionId) {
    const schedule = this.data.reviewSchedule[questionId];
    if (!schedule) return 'not_scheduled';

    const priority = this.getReviewPriority(questionId);

    if (priority > 1.0) return 'overdue';
    if (priority >= this.REVIEW_DUE_THRESHOLD) return 'due';
    if (schedule.streak >= 5) return 'mastered';
    return 'scheduled';
  }

  /**
   * Record completion of a review
   */
  recordReviewCompleted(questionId, wasCorrect, wasOnTime = true) {
    this.data.metrics.reviewsCompleted++;
    if (wasOnTime) {
      this.data.metrics.reviewsOnTime++;
    }

    this.scheduleReview(questionId, wasCorrect);
  }

  // ═══════════════════════════════════════════════════════════════
  // MASTERY TRACKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record that a question has been mastered
   */
  recordMastery(questionId) {
    if (!this.data.milestones[questionId]) {
      this.data.milestones[questionId] = {
        firstSeen: Date.now(),
        firstCorrect: null,
        mastered: false,
        masteredAt: null
      };
    }

    const milestone = this.data.milestones[questionId];

    if (!milestone.mastered) {
      milestone.mastered = true;
      milestone.masteredAt = Date.now();
      this.data.metrics.totalMasteries++;

      console.log(`[LearningAnalytics] Mastery achieved for ${questionId}`);
      this.save();

      return true;
    }

    return false;
  }

  /**
   * Record first correct answer for a question
   */
  recordFirstCorrect(questionId) {
    if (!this.data.milestones[questionId]) {
      this.data.milestones[questionId] = {
        firstSeen: Date.now(),
        firstCorrect: Date.now(),
        mastered: false,
        masteredAt: null
      };
    } else if (!this.data.milestones[questionId].firstCorrect) {
      this.data.milestones[questionId].firstCorrect = Date.now();
    }

    this.save();
  }

  /**
   * Get mastery celebration message
   */
  getMasteryCelebrationMessage() {
    return this.MASTERY_CELEBRATION_MESSAGES[
      Math.floor(Math.random() * this.MASTERY_CELEBRATION_MESSAGES.length)
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // OPPORTUNITY 4: BOOTSTRAP STATISTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Estimate difficulty for a question with no statistics
   * Uses heuristics based on question structure
   *
   * @param {object} question - Question object
   * @returns {number} Estimated difficulty 0.0-1.0
   */
  bootstrapDifficulty(question) {
    let difficulty = 0.5; // Start at medium

    // Factor 1: Question length (longer = harder)
    const qLength = question.q?.length || 0;
    if (qLength > 150) difficulty += 0.1;
    if (qLength > 250) difficulty += 0.1;
    if (qLength < 50) difficulty -= 0.1;

    // Factor 2: Option similarity (similar options = harder)
    if (question.options) {
      const optionSimilarity = this.computeOptionSimilarity(question.options);
      difficulty += optionSimilarity * 0.2;
    }

    // Factor 3: Has mechanism explanation (indicates complexity)
    if (question.mechanism) {
      difficulty += 0.05;
    }

    // Factor 4: Has prerequisites (indicates advanced topic)
    if (question.prereqs && question.prereqs.length > 0) {
      difficulty += question.prereqs.length * 0.05;
    }

    // Factor 5: Specific keywords indicating complexity
    const complexityKeywords = [
      'differentiate', 'distinguish', 'contrast', 'compare',
      'mechanism', 'pathway', 'regulation', 'inhibit', 'activate',
      'exception', 'however', 'unlike', 'whereas'
    ];

    const qLower = (question.q || '').toLowerCase();
    const keywordCount = complexityKeywords.filter(kw => qLower.includes(kw)).length;
    difficulty += keywordCount * 0.03;

    // Clamp to valid range
    return Math.max(0.1, Math.min(0.9, difficulty));
  }

  /**
   * Compute how similar the options are (similar = harder to distinguish)
   */
  computeOptionSimilarity(options) {
    if (!options || options.length < 2) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < options.length; i++) {
      for (let j = i + 1; j < options.length; j++) {
        totalSimilarity += this.stringSimilarity(options[i], options[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Simple string similarity (Jaccard on words)
   */
  stringSimilarity(a, b) {
    const wordsA = new Set((a || '').toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const wordsB = new Set((b || '').toLowerCase().split(/\s+/).filter(w => w.length > 2));

    if (wordsA.size === 0 || wordsB.size === 0) return 0;

    const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
    const union = new Set([...wordsA, ...wordsB]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Bootstrap difficulty estimates for a question bank
   *
   * @param {array} questions - Array of question objects
   * @returns {object} Map of questionId -> estimated difficulty
   */
  bootstrapQuestionBank(questions) {
    const estimates = {};

    for (const q of questions) {
      if (!q.id) continue;

      // Skip if we already have real statistics
      if (this.questionStatistics) {
        const stats = this.questionStatistics.data.questions[q.id];
        if (stats && stats.difficulty !== null) {
          estimates[q.id] = { difficulty: stats.difficulty, source: 'statistics' };
          continue;
        }
      }

      estimates[q.id] = {
        difficulty: this.bootstrapDifficulty(q),
        source: 'bootstrap'
      };
    }

    return estimates;
  }

  // ═══════════════════════════════════════════════════════════════
  // OPPORTUNITY 7: ANALYTICS DASHBOARD DATA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get comprehensive analytics summary for dashboard
   */
  getAnalyticsSummary() {
    const reviewQueue = this.getReviewQueue(100);
    const reviewSchedule = this.getFullReviewSchedule();

    // Calculate review adherence
    const reviewAdherence = this.data.metrics.reviewsCompleted > 0
      ? Math.round((this.data.metrics.reviewsOnTime / this.data.metrics.reviewsCompleted) * 100)
      : null;

    // Get misconception trajectory stats
    const trajectoryCounts = Object.values(this.data.misconceptionTrajectories)
      .map(t => t.length);
    const avgTrajectoryLength = trajectoryCounts.length > 0
      ? Math.round(trajectoryCounts.reduce((a, b) => a + b, 0) / trajectoryCounts.length * 10) / 10
      : 0;

    // Get questions with detected shifts
    const questionsWithShifts = Object.keys(this.data.conceptualShifts).length;

    // Get mastery progress
    const masteredQuestions = Object.values(this.data.milestones)
      .filter(m => m.mastered).length;
    const totalTracked = Object.keys(this.data.milestones).length;

    return {
      // Conceptual Change Metrics
      conceptualChange: {
        totalShifts: this.data.metrics.totalConceptualShifts,
        questionsWithShifts,
        avgTrajectoryLength,
        recentShifts: this.getRecentShifts(5)
      },

      // Forgetting Curve Metrics
      spacedRepetition: {
        questionsInQueue: reviewSchedule.length,
        dueNow: reviewQueue.filter(r => r.priority >= 1.0).length,
        overdue: reviewQueue.filter(r => r.isOverdue).length,
        reviewsCompleted: this.data.metrics.reviewsCompleted,
        reviewAdherence
      },

      // Mastery Metrics
      mastery: {
        total: this.data.metrics.totalMasteries,
        masteredQuestions,
        totalTracked,
        masteryRate: totalTracked > 0
          ? Math.round((masteredQuestions / totalTracked) * 100)
          : 0
      },

      // Combined with QuestionStatistics if available
      questionStats: this.questionStatistics
        ? this.questionStatistics.getGlobalSummary()
        : null
    };
  }

  /**
   * Get recent conceptual shifts for display
   */
  getRecentShifts(limit = 5) {
    const allShifts = [];

    for (const [questionId, shifts] of Object.entries(this.data.conceptualShifts)) {
      for (const shift of shifts) {
        allShifts.push({
          questionId,
          ...shift
        });
      }
    }

    return allShifts
      .sort((a, b) => b.detectedAt - a.detectedAt)
      .slice(0, limit);
  }

  /**
   * Get difficulty distribution for histogram
   */
  getDifficultyDistribution() {
    if (!this.questionStatistics) return null;

    const buckets = {
      'very_easy': 0,    // 0.0-0.2
      'easy': 0,         // 0.2-0.4
      'medium': 0,       // 0.4-0.6
      'hard': 0,         // 0.6-0.8
      'very_hard': 0     // 0.8-1.0
    };

    for (const [qId, stats] of Object.entries(this.questionStatistics.data.questions)) {
      if (stats.difficulty === null) continue;

      const d = stats.difficulty;
      if (d < 0.2) buckets.very_easy++;
      else if (d < 0.4) buckets.easy++;
      else if (d < 0.6) buckets.medium++;
      else if (d < 0.8) buckets.hard++;
      else buckets.very_hard++;
    }

    return buckets;
  }

  /**
   * Export all analytics data for research
   */
  exportData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),

      // Core analytics data
      ...this.data,

      // Computed summaries
      summary: this.getAnalyticsSummary(),
      difficultyDistribution: this.getDifficultyDistribution(),

      // Question statistics if available
      questionStatistics: this.questionStatistics
        ? this.questionStatistics.exportData()
        : null
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start a new analytics session
   */
  startSession() {
    const sessionId = `session_${Date.now()}`;
    this.data.currentSessionId = sessionId;

    this.data.sessions.push({
      id: sessionId,
      startedAt: Date.now(),
      endedAt: null,
      questionsAnswered: 0,
      conceptualShiftsDetected: 0,
      reviewsCompleted: 0
    });

    // Keep only last 50 sessions
    if (this.data.sessions.length > 50) {
      this.data.sessions = this.data.sessions.slice(-50);
    }

    this.save();
    return sessionId;
  }

  /**
   * End current session
   */
  endSession() {
    const session = this.data.sessions.find(s => s.id === this.data.currentSessionId);
    if (session) {
      session.endedAt = Date.now();
    }
    this.data.currentSessionId = null;
    this.save();
  }

  /**
   * Update current session stats
   */
  updateSessionStats(updates) {
    const session = this.data.sessions.find(s => s.id === this.data.currentSessionId);
    if (session) {
      Object.assign(session, updates);
      this.save();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Compute mode (most frequent value) of an array
   */
  mode(arr) {
    if (!arr || arr.length === 0) return null;

    const counts = {};
    let maxCount = 0;
    let modeVal = null;

    for (const val of arr) {
      if (val === null || val === undefined) continue;
      counts[val] = (counts[val] || 0) + 1;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        modeVal = val;
      }
    }

    return modeVal;
  }

  /**
   * Format time until a date as human-readable string
   */
  formatTimeUntil(timestamp) {
    if (!timestamp) return 'not scheduled';

    const now = Date.now();
    const diff = timestamp - now;

    if (diff < 0) {
      const overdue = Math.abs(diff);
      const days = Math.floor(overdue / (24 * 60 * 60 * 1000));
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} overdue`;
      const hours = Math.floor(overdue / (60 * 60 * 1000));
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} overdue`;
      return 'overdue';
    }

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;

    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;

    const minutes = Math.floor(diff / (60 * 1000));
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  /**
   * Get days until a timestamp (negative if past)
   */
  getDaysUntil(timestamp) {
    if (!timestamp) return null;
    return Math.round((timestamp - Date.now()) / (24 * 60 * 60 * 1000) * 10) / 10;
  }

  /**
   * Reset all analytics data (for testing)
   */
  reset() {
    this.data = this.getDefaultData();
    this.save();
    console.log('[LearningAnalytics] Data reset');
  }

  // ═══════════════════════════════════════════════════════════════
  // GROWTH SIGNAL DETECTION (340.60 GSP)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detect growth signals based on current analytics state.
   * Returns array of signals that should be sent to the nucleus.
   *
   * Signal Types:
   * - NEED_MORE_CONTENT: High confusion persists despite scaffolds
   * - NEED_DIFFERENTIATION: Some representations work, others don't
   * - NEED_SCAFFOLD_DEPTH: Students need more steps to reach insight
   * - CONCEPT_MASTERED: Content no longer needed (advance)
   */
  detectGrowthSignals() {
    const signals = [];

    if (!this.questionStatistics) return signals;

    // Analyze each question for potential growth signals
    for (const [questionId, stats] of Object.entries(this.questionStatistics.data.questions)) {
      if (stats.attempts < 10) continue; // Need enough data

      const qSignals = this.analyzeQuestionForGrowth(questionId, stats);
      signals.push(...qSignals);
    }

    // Analyze representation effectiveness (if available)
    if (typeof representationEngine !== 'undefined' && representationEngine) {
      const reprSignals = this.analyzeRepresentationGrowth();
      signals.push(...reprSignals);
    }

    return signals;
  }

  /**
   * Analyze a single question for growth signals
   */
  analyzeQuestionForGrowth(questionId, stats) {
    const signals = [];

    // Calculate confusion rate (wrong answers / total)
    const total = stats.optionSelections.reduce((a, b) => a + b, 0);
    if (total === 0) return signals;

    const correctCount = stats.optionSelections[stats.correctAnswer || 0] || 0;
    const confusionRate = 1 - (correctCount / total);

    // Get question codon from registry or metadata
    const codon = this.getQuestionCodon(questionId);

    // Signal: NEED_MORE_CONTENT
    // High confusion (>40%) with enough attempts
    if (confusionRate > 0.40 && stats.attempts >= 20) {
      // Check if we already have scaffolds
      const scaffoldCount = this.countScaffoldsForQuestion(questionId);

      signals.push({
        signalType: 'NEED_MORE_CONTENT',
        codon: codon,
        questionId: questionId,
        evidence: {
          confusionRate: Math.round(confusionRate * 100) / 100,
          attempts: stats.attempts,
          existingScaffolds: scaffoldCount,
          optionDistribution: stats.optionSelections
        },
        prescription: {
          targetConfusion: 0.20,
          suggestedApproach: 'multi-representational',
          minNewContent: Math.ceil((confusionRate - 0.20) * 10)
        },
        priority: confusionRate > 0.60 ? 'high' : 'medium',
        detectedAt: Date.now()
      });
    }

    // Signal: CONCEPT_MASTERED
    // Very high accuracy (>90%) with good sample size
    if (confusionRate < 0.10 && stats.attempts >= 30) {
      const avgAttempts = stats.streakMax > 0 ? stats.attempts / stats.streakMax : stats.attempts;

      signals.push({
        signalType: 'CONCEPT_MASTERED',
        codon: codon,
        questionId: questionId,
        evidence: {
          masteryRate: Math.round((1 - confusionRate) * 100) / 100,
          attempts: stats.attempts,
          avgTimeMs: stats.avgTimeMs,
          streakMax: stats.streakMax
        },
        prescription: {
          action: 'archive_or_advance',
          suggestAdvancedContent: true
        },
        priority: 'low',
        detectedAt: Date.now()
      });
    }

    // Signal: NEED_SCAFFOLD_DEPTH (based on insight detection)
    const insightData = this.data.insightTracking?.[questionId];
    if (insightData && insightData.avgScaffoldsToInsight > 5) {
      signals.push({
        signalType: 'NEED_SCAFFOLD_DEPTH',
        codon: codon,
        questionId: questionId,
        evidence: {
          avgScaffoldsToInsight: insightData.avgScaffoldsToInsight,
          insightRate: insightData.insightRate || 0,
          maxScaffoldsUsed: insightData.maxScaffoldsUsed || 7
        },
        prescription: {
          suggestedDepth: Math.min(insightData.avgScaffoldsToInsight + 3, 12),
          intermediateSteps: ['analogy', 'worked_example', 'partial_scaffold']
        },
        priority: 'medium',
        detectedAt: Date.now()
      });
    }

    return signals;
  }

  /**
   * Analyze representation effectiveness for growth signals
   */
  analyzeRepresentationGrowth() {
    const signals = [];

    if (typeof representationEngine === 'undefined' || !representationEngine) {
      return signals;
    }

    // Check effectiveness by type
    const effectiveness = {};
    for (const [key, data] of Object.entries(representationEngine.representationEffectiveness || {})) {
      // Key format: "learnerId_type"
      const parts = key.split('_');
      const type = parts[parts.length - 1];

      if (!effectiveness[type]) {
        effectiveness[type] = { attempts: 0, correct: 0 };
      }

      effectiveness[type].attempts += data.attempts || 0;
      effectiveness[type].correct += data.correct || 0;
    }

    // Calculate rates
    const rates = {};
    let hasData = false;
    for (const [type, data] of Object.entries(effectiveness)) {
      if (data.attempts >= 10) {
        rates[type] = data.correct / data.attempts;
        hasData = true;
      }
    }

    if (!hasData) return signals;

    // Find best and worst
    const rateEntries = Object.entries(rates);
    const best = rateEntries.reduce((a, b) => a[1] > b[1] ? a : b);
    const worst = rateEntries.reduce((a, b) => a[1] < b[1] ? a : b);

    // Signal: NEED_DIFFERENTIATION
    // Big gap between best and worst representation
    if (best[1] - worst[1] > 0.30) {
      signals.push({
        signalType: 'NEED_DIFFERENTIATION',
        codon: '612.00', // General physiology
        evidence: {
          representationEffectiveness: rates,
          bestType: best[0],
          bestRate: Math.round(best[1] * 100) / 100,
          worstType: worst[0],
          worstRate: Math.round(worst[1] * 100) / 100,
          gap: Math.round((best[1] - worst[1]) * 100) / 100
        },
        prescription: {
          weakRepresentations: rateEntries
            .filter(([_, rate]) => rate < 0.50)
            .map(([type, _]) => type),
          modelAfter: best[0],
          targetEffectiveness: 0.70
        },
        priority: worst[1] < 0.30 ? 'high' : 'medium',
        detectedAt: Date.now()
      });
    }

    return signals;
  }

  /**
   * Get codon for a question (from registry or generate)
   */
  getQuestionCodon(questionId) {
    // Try to get from question registry
    if (typeof questionRegistry !== 'undefined' && questionRegistry) {
      const entry = questionRegistry.findQuestionById?.(questionId);
      if (entry?.dewey) return entry.dewey;
    }

    // Default to general physiology
    return '612.00';
  }

  /**
   * Count existing scaffolds for a question
   */
  countScaffoldsForQuestion(questionId) {
    // This would check the vocab bank for scaffold questions
    // For now, return estimate based on what we know
    return 3; // Default assumption
  }

  /**
   * Package growth signals as vesicle cargo
   */
  packageGrowthSignalsForVesicle() {
    const signals = this.detectGrowthSignals();

    if (signals.length === 0) return null;

    return {
      type: 'growth-signals',
      schema: '340.60.signals.v1',
      data: {
        detectedAt: new Date().toISOString(),
        signalCount: signals.length,
        signals: signals,
        summary: {
          needMoreContent: signals.filter(s => s.signalType === 'NEED_MORE_CONTENT').length,
          needDifferentiation: signals.filter(s => s.signalType === 'NEED_DIFFERENTIATION').length,
          needScaffoldDepth: signals.filter(s => s.signalType === 'NEED_SCAFFOLD_DEPTH').length,
          conceptMastered: signals.filter(s => s.signalType === 'CONCEPT_MASTERED').length
        }
      }
    };
  }
}

// Export singleton
let learningAnalytics = null;

// Factory function for initialization
function initLearningAnalytics(persistence, questionStatistics) {
  if (!learningAnalytics) {
    learningAnalytics = new LearningAnalyticsEngine(persistence, questionStatistics);
    console.log('[LearningAnalytics] Engine initialized');
  }
  return learningAnalytics;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LearningAnalyticsEngine, initLearningAnalytics };
}
