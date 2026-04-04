/**
 * Ms. Luminara Quiz - Question Statistics Engine
 *
 * Tracks empirical difficulty and performance data for statistics-driven ZPD scaffolding.
 *
 * Key metrics per question:
 * - Population difficulty (computed from correct ratio)
 * - Option selection distribution (confusion matrix)
 * - Time-to-answer statistics
 * - Prerequisite inference (which questions are typically mastered first)
 *
 * This data enables:
 * - Empirical difficulty calibration (not heuristic guesses)
 * - Smart scaffold selection based on actual confusion patterns
 * - ZPD zone detection using real performance data
 */

class QuestionStatisticsEngine {
  constructor(persistenceManager) {
    this.persistence = persistenceManager;
    this.STORAGE_KEY = 'ms_luminara_question_stats';
    this.data = this.loadData();

    // Minimum attempts before we trust difficulty calculations
    this.MIN_ATTEMPTS_FOR_DIFFICULTY = 5;

    // Session tracking for prerequisite inference
    this.sessionSequence = [];  // Questions answered this session in order
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
      console.warn('[QuestionStats] Failed to load data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      questions: {},           // Per-question statistics
      globalStats: {
        totalAnswers: 0,
        totalCorrectFirstTry: 0,
        avgDifficulty: 0.5,
        lastUpdated: null
      },
      prerequisiteGraph: {},   // { questionId: [prereqIds] } - inferred from session sequences
      confusionPairs: {}       // { "qId:wrongOption": count } - tracks common wrong answers
    };
  }

  save() {
    try {
      this.data.globalStats.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[QuestionStats] Failed to save data:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // QUESTION STATISTICS SCHEMA
  // ═══════════════════════════════════════════════════════════════

  getDefaultQuestionStats() {
    return {
      // Attempt counts
      attempts: 0,
      correctFirstTry: 0,

      // Option selection distribution (for 4-option questions)
      optionSelections: [0, 0, 0, 0],

      // Timing data
      totalTimeMs: 0,
      timeSamples: 0,

      // Computed metrics (updated after each answer)
      difficulty: null,        // 0.0 (easy) to 1.0 (hard)
      discriminationIndex: null, // How well this question separates strong/weak students

      // Last update
      lastSeen: null
    };
  }

  getOrCreateQuestionStats(questionId) {
    if (!this.data.questions[questionId]) {
      this.data.questions[questionId] = this.getDefaultQuestionStats();
    }
    return this.data.questions[questionId];
  }

  // ═══════════════════════════════════════════════════════════════
  // RECORDING ANSWERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record an answer and update all statistics
   *
   * @param {string} questionId - The question ID
   * @param {number} selectedOption - Index of selected option (0-3)
   * @param {number} correctOption - Index of correct option (0-3)
   * @param {boolean} wasCorrectFirstTry - Whether correct on first attempt
   * @param {number} timeToAnswerMs - Time taken to answer in milliseconds
   * @param {object} context - Additional context { categoryId, bankId, isotopes }
   */
  recordAnswer(questionId, selectedOption, correctOption, wasCorrectFirstTry, timeToAnswerMs, context = {}) {
    const stats = this.getOrCreateQuestionStats(questionId);

    // Update attempt counts
    stats.attempts++;
    if (wasCorrectFirstTry) {
      stats.correctFirstTry++;
    }

    // Update option selection distribution
    if (selectedOption >= 0 && selectedOption < stats.optionSelections.length) {
      stats.optionSelections[selectedOption]++;
    }

    // Update timing data
    if (timeToAnswerMs > 0 && timeToAnswerMs < 300000) { // Ignore outliers > 5 min
      stats.totalTimeMs += timeToAnswerMs;
      stats.timeSamples++;
    }

    stats.lastSeen = new Date().toISOString();

    // Recompute difficulty
    stats.difficulty = this.computeDifficulty(stats);

    // Update global stats
    this.data.globalStats.totalAnswers++;
    if (wasCorrectFirstTry) {
      this.data.globalStats.totalCorrectFirstTry++;
    }

    // Track confusion patterns (wrong answers)
    if (!wasCorrectFirstTry && selectedOption !== correctOption) {
      this.recordConfusion(questionId, selectedOption, correctOption);
    }

    // Track session sequence for prerequisite inference
    this.sessionSequence.push({
      questionId,
      wasCorrect: wasCorrectFirstTry,
      timestamp: Date.now()
    });

    // Update prerequisite graph periodically
    if (this.sessionSequence.length >= 5) {
      this.updatePrerequisiteGraph();
    }

    this.save();

    return {
      difficulty: stats.difficulty,
      attempts: stats.attempts,
      avgTimeMs: stats.timeSamples > 0 ? Math.round(stats.totalTimeMs / stats.timeSamples) : null
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // DIFFICULTY COMPUTATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Compute difficulty from actual response data
   * Uses Item Response Theory-lite approach
   *
   * @param {object} stats - Question statistics object
   * @returns {number|null} Difficulty 0.0 (easy) to 1.0 (hard), or null if insufficient data
   */
  computeDifficulty(stats) {
    if (stats.attempts < this.MIN_ATTEMPTS_FOR_DIFFICULTY) {
      return null;  // Not enough data
    }

    // Basic proportion correct
    const pCorrect = stats.correctFirstTry / stats.attempts;

    // Adjust for guessing (4 options = 25% chance baseline)
    // If pCorrect = 0.25, difficulty = 1.0 (all guessing)
    // If pCorrect = 1.0, difficulty = 0.0 (trivially easy)
    const guessRate = 0.25;
    const adjustedDifficulty = 1 - ((pCorrect - guessRate) / (1 - guessRate));

    // Clamp to valid range
    return Math.max(0, Math.min(1, adjustedDifficulty));
  }

  /**
   * Get difficulty with fallback for questions without enough data
   */
  getDifficulty(questionId) {
    const stats = this.data.questions[questionId];
    if (stats && stats.difficulty !== null) {
      return stats.difficulty;
    }

    // Fallback: use global average
    return this.data.globalStats.avgDifficulty || 0.5;
  }

  /**
   * Compute discrimination index (how well question separates strong/weak students)
   * High discrimination = strong students get it right, weak students get it wrong
   * Low discrimination = random (guessing) or everyone gets it right/wrong
   */
  computeDiscriminationIndex(questionId, userPerformanceMap) {
    // This would require cross-referencing with user profiles
    // For now, use option distribution as a proxy
    const stats = this.data.questions[questionId];
    if (!stats || stats.attempts < 10) return null;

    const total = stats.optionSelections.reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    // Check if wrong answers are spread or concentrated
    // Concentrated wrong answers = clear misconception = better discrimination
    const wrongSelections = stats.optionSelections.filter((_, i) => i !== this.getCorrectOption(questionId));
    const maxWrong = Math.max(...wrongSelections);
    const totalWrong = wrongSelections.reduce((a, b) => a + b, 0);

    if (totalWrong === 0) return 1.0; // Everyone gets it right

    // Discrimination = how concentrated are the wrong answers
    return maxWrong / totalWrong;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFUSION TRACKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record a confusion (wrong answer selection)
   */
  recordConfusion(questionId, selectedOption, correctOption) {
    const key = `${questionId}:${selectedOption}`;
    if (!this.data.confusionPairs[key]) {
      this.data.confusionPairs[key] = {
        count: 0,
        correctOption: correctOption
      };
    }
    this.data.confusionPairs[key].count++;
  }

  /**
   * Get common confusions for a question
   * Returns which wrong answers are most commonly selected
   */
  getCommonConfusions(questionId) {
    const stats = this.data.questions[questionId];
    if (!stats) return [];

    const confusions = [];
    const total = stats.optionSelections.reduce((a, b) => a + b, 0);

    stats.optionSelections.forEach((count, optionIndex) => {
      const key = `${questionId}:${optionIndex}`;
      const confusionData = this.data.confusionPairs[key];

      if (confusionData && confusionData.correctOption !== optionIndex && count > 0) {
        confusions.push({
          optionIndex,
          count,
          percentage: Math.round((count / total) * 100),
          isDistractor: true
        });
      }
    });

    return confusions.sort((a, b) => b.count - a.count);
  }

  /**
   * Find questions that test the concept behind a common wrong answer
   * (For scaffold selection when student picks wrong option)
   */
  findQuestionsForConfusion(questionId, wrongOptionIndex, allQuestions) {
    // Get the text of the wrong option they selected
    const question = allQuestions.find(q => q.id === questionId);
    if (!question || !question.options[wrongOptionIndex]) return [];

    const wrongOptionText = question.options[wrongOptionIndex].toLowerCase();
    const wrongWords = wrongOptionText.split(/\s+/).filter(w => w.length > 3);

    // Find questions where this concept IS the correct answer
    // (Teaching them what they confused it with)
    const matches = [];

    for (const q of allQuestions) {
      if (q.id === questionId) continue;

      const correctText = q.options[q.answer].toLowerCase();
      const matchScore = wrongWords.filter(word => correctText.includes(word)).length;

      if (matchScore > 0) {
        matches.push({
          question: q,
          matchScore,
          difficulty: this.getDifficulty(q.id)
        });
      }
    }

    // Return easier questions first (scaffold should be accessible)
    return matches
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, 5)
      .map(m => m.question);
  }

  // ═══════════════════════════════════════════════════════════════
  // PREREQUISITE INFERENCE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update prerequisite graph based on session sequences
   * Inference: If users typically master Q1 before Q2, Q1 is likely a prereq for Q2
   */
  updatePrerequisiteGraph() {
    const sequence = this.sessionSequence;
    if (sequence.length < 2) return;

    // Look for patterns: questions answered correctly before a wrong answer
    for (let i = 1; i < sequence.length; i++) {
      const current = sequence[i];

      if (!current.wasCorrect) {
        // This question was wrong - look at what was mastered before it
        for (let j = 0; j < i; j++) {
          const previous = sequence[j];
          if (previous.wasCorrect && previous.questionId !== current.questionId) {
            // previous was correct, current was wrong
            // This is WEAK evidence that previous is NOT a prereq
            // (If they mastered prereq, they should get this right)
          }
        }
      } else {
        // This question was correct - look at patterns
        for (let j = 0; j < i; j++) {
          const previous = sequence[j];
          if (previous.wasCorrect && previous.questionId !== current.questionId) {
            // Both correct in sequence - possible prereq relationship
            this.recordPrerequisiteEvidence(previous.questionId, current.questionId);
          }
        }
      }
    }

    // Clear old sequence entries (keep last 20)
    if (this.sessionSequence.length > 20) {
      this.sessionSequence = this.sessionSequence.slice(-20);
    }
  }

  /**
   * Record evidence that Q1 might be a prerequisite for Q2
   */
  recordPrerequisiteEvidence(prereqId, questionId) {
    if (!this.data.prerequisiteGraph[questionId]) {
      this.data.prerequisiteGraph[questionId] = {};
    }

    if (!this.data.prerequisiteGraph[questionId][prereqId]) {
      this.data.prerequisiteGraph[questionId][prereqId] = 0;
    }

    this.data.prerequisiteGraph[questionId][prereqId]++;
  }

  /**
   * Get inferred prerequisites for a question
   * Returns questions that are frequently mastered before this one
   */
  getInferredPrerequisites(questionId, minEvidence = 3) {
    const graph = this.data.prerequisiteGraph[questionId];
    if (!graph) return [];

    return Object.entries(graph)
      .filter(([_, count]) => count >= minEvidence)
      .sort((a, b) => b[1] - a[1])
      .map(([prereqId, count]) => ({
        questionId: prereqId,
        evidenceCount: count,
        difficulty: this.getDifficulty(prereqId)
      }));
  }

  // ═══════════════════════════════════════════════════════════════
  // ZPD ZONE DETECTION (Statistics-Based)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Determine ZPD zone for a question based on statistics
   *
   * @param {string} questionId - Question to evaluate
   * @param {object} userProfile - User's mastery profile from scaffolding engine
   * @returns {string} 'mastered' | 'comfortable' | 'proximal' | 'beyond'
   */
  determineZPDZone(questionId, userProfile) {
    const difficulty = this.getDifficulty(questionId);
    const userMastery = this.getUserMasteryEstimate(questionId, userProfile);

    // Check prerequisite mastery
    const prereqs = this.getInferredPrerequisites(questionId);
    const prereqMastery = this.computePrereqMastery(prereqs, userProfile);

    // ZPD Logic:
    // - Mastered: User consistently correct AND question is objectively easy
    // - Comfortable: User usually correct OR question is moderate difficulty
    // - Proximal (ZPD): Question is slightly harder than user's current level
    // - Beyond: Question is hard AND prerequisites not mastered

    if (userMastery > 0.8 && difficulty < 0.3) {
      return 'mastered';
    }

    if (userMastery > 0.6 && difficulty < 0.5) {
      return 'comfortable';
    }

    // The sweet spot: question is achievable with effort
    if (prereqMastery > 0.6 && difficulty < userMastery + 0.3) {
      return 'proximal';  // This is the ZPD!
    }

    // Too hard or missing prerequisites
    return 'beyond';
  }

  /**
   * Estimate user's mastery for a specific question based on related performance
   */
  getUserMasteryEstimate(questionId, userProfile) {
    // Check direct history
    const history = this.persistence?.data?.questionHistory?.[questionId];
    if (history && history.attempts >= 2) {
      return history.timesCorrect / history.attempts;
    }

    // Check topic-level mastery from scaffolding engine
    const topicPrefix = questionId.split('.').slice(0, 2).join('.');
    const topicPerf = userProfile?.topicPerformance?.[topicPrefix];
    if (topicPerf && topicPerf.attempts >= 3) {
      return topicPerf.correct / topicPerf.attempts;
    }

    // Default: assume moderate mastery
    return 0.5;
  }

  /**
   * Compute how well user has mastered prerequisites
   */
  computePrereqMastery(prereqs, userProfile) {
    if (prereqs.length === 0) return 1.0;  // No prereqs = no barrier

    let masteredCount = 0;
    for (const prereq of prereqs) {
      const mastery = this.getUserMasteryEstimate(prereq.questionId, userProfile);
      if (mastery >= 0.7) masteredCount++;
    }

    return masteredCount / prereqs.length;
  }

  // ═══════════════════════════════════════════════════════════════
  // SCAFFOLD SELECTION (Statistics-Based)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Select optimal scaffold questions based on statistics
   *
   * @param {object} wrongQuestion - The question that was answered incorrectly
   * @param {number} wrongOptionIndex - Which wrong option was selected
   * @param {array} questionPool - Available questions for scaffolding
   * @param {object} userProfile - User's performance profile
   * @returns {array} Ordered list of scaffold questions
   */
  selectScaffoldQuestions(wrongQuestion, wrongOptionIndex, questionPool, userProfile) {
    const candidates = [];
    const questionId = wrongQuestion.id;
    const categoryPrefix = questionId.split('.')[0];

    // Strategy 1: Inferred prerequisites that user hasn't mastered
    const prereqs = this.getInferredPrerequisites(questionId);
    for (const prereq of prereqs) {
      const mastery = this.getUserMasteryEstimate(prereq.questionId, userProfile);
      if (mastery < 0.7) {
        const question = questionPool.find(q => q.id === prereq.questionId);
        if (question) {
          candidates.push({
            question,
            strategy: 'prerequisite',
            score: prereq.evidenceCount * (1 - mastery),  // Higher score = more needed
            difficulty: prereq.difficulty
          });
        }
      }
    }

    // Strategy 2: Questions that clarify the confusion
    const confusionQuestions = this.findQuestionsForConfusion(questionId, wrongOptionIndex, questionPool);
    for (const q of confusionQuestions) {
      if (!candidates.find(c => c.question.id === q.id)) {
        candidates.push({
          question: q,
          strategy: 'confusion_clearing',
          score: 5,  // Fixed score for confusion clearing
          difficulty: this.getDifficulty(q.id)
        });
      }
    }

    // Strategy 3: Easier questions from same category
    const sameCategoryQuestions = questionPool.filter(q =>
      q.id !== questionId &&
      q.id.startsWith(categoryPrefix) &&
      !candidates.find(c => c.question.id === q.id)
    );

    for (const q of sameCategoryQuestions) {
      const diff = this.getDifficulty(q.id);
      if (diff < this.getDifficulty(questionId)) {
        candidates.push({
          question: q,
          strategy: 'easier_same_topic',
          score: (1 - diff) * 3,  // Easier = higher score
          difficulty: diff
        });
      }
    }

    // Sort by score (descending) then difficulty (ascending for scaffolds)
    candidates.sort((a, b) => {
      if (Math.abs(a.score - b.score) > 0.5) {
        return b.score - a.score;  // Higher score first
      }
      return a.difficulty - b.difficulty;  // Then easier first
    });

    // Select top 3, ensuring variety of strategies
    const selected = [];
    const usedStrategies = new Set();

    for (const candidate of candidates) {
      if (selected.length >= 3) break;

      // Prefer variety in first 2 selections
      if (selected.length < 2 && usedStrategies.has(candidate.strategy)) {
        continue;
      }

      selected.push(candidate.question);
      usedStrategies.add(candidate.strategy);
    }

    // Fill remaining slots if needed
    for (const candidate of candidates) {
      if (selected.length >= 3) break;
      if (!selected.find(s => s.id === candidate.question.id)) {
        selected.push(candidate.question);
      }
    }

    console.log('[QuestionStats] Selected scaffolds:', selected.map(s => ({
      id: s.id,
      difficulty: this.getDifficulty(s.id)
    })));

    return selected;
  }

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS REPORTING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get statistics summary for a question
   */
  getQuestionSummary(questionId) {
    const stats = this.data.questions[questionId];
    if (!stats) {
      return {
        questionId,
        hasData: false,
        difficulty: this.data.globalStats.avgDifficulty
      };
    }

    return {
      questionId,
      hasData: true,
      attempts: stats.attempts,
      correctRate: stats.attempts > 0 ? Math.round((stats.correctFirstTry / stats.attempts) * 100) : 0,
      difficulty: stats.difficulty,
      avgTimeSeconds: stats.timeSamples > 0 ? Math.round(stats.totalTimeMs / stats.timeSamples / 1000) : null,
      commonConfusions: this.getCommonConfusions(questionId),
      inferredPrereqs: this.getInferredPrerequisites(questionId, 2)
    };
  }

  /**
   * Get overall statistics
   */
  getGlobalSummary() {
    const questions = Object.keys(this.data.questions);
    const withDifficulty = questions.filter(qId =>
      this.data.questions[qId].difficulty !== null
    );

    const difficulties = withDifficulty.map(qId => this.data.questions[qId].difficulty);
    const avgDifficulty = difficulties.length > 0
      ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length
      : 0.5;

    // Update cached average
    this.data.globalStats.avgDifficulty = avgDifficulty;

    return {
      totalQuestions: questions.length,
      questionsWithDifficulty: withDifficulty.length,
      totalAnswers: this.data.globalStats.totalAnswers,
      overallCorrectRate: this.data.globalStats.totalAnswers > 0
        ? Math.round((this.data.globalStats.totalCorrectFirstTry / this.data.globalStats.totalAnswers) * 100)
        : 0,
      avgDifficulty: Math.round(avgDifficulty * 100) / 100,
      prerequisiteEdges: Object.keys(this.data.prerequisiteGraph).length,
      confusionPairs: Object.keys(this.data.confusionPairs).length
    };
  }

  /**
   * Get hardest/easiest questions
   */
  getDifficultyExtremes(count = 5) {
    const questions = Object.entries(this.data.questions)
      .filter(([_, stats]) => stats.difficulty !== null && stats.attempts >= this.MIN_ATTEMPTS_FOR_DIFFICULTY)
      .map(([qId, stats]) => ({ questionId: qId, difficulty: stats.difficulty, attempts: stats.attempts }));

    const sorted = [...questions].sort((a, b) => a.difficulty - b.difficulty);

    return {
      easiest: sorted.slice(0, count),
      hardest: sorted.slice(-count).reverse()
    };
  }

  /**
   * Reset session sequence (call at session start)
   */
  resetSession() {
    this.sessionSequence = [];
  }

  /**
   * Export data for debugging/analysis
   */
  exportData() {
    return {
      ...this.data,
      computed: {
        globalSummary: this.getGlobalSummary(),
        difficultyExtremes: this.getDifficultyExtremes()
      }
    };
  }
}

// Export singleton (will be initialized after persistence loads)
let questionStatistics = null;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionStatisticsEngine;
}
