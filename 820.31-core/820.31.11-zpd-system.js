/**
 * 000.11-zpd-system.js
 * TOCK 2: ZPD Detection & Collaborative Learning System
 *
 * Zone of Proximal Development (Vygotsky)
 * - What learner can do alone vs. with guidance
 * - 7 ZPD moment types from LUMI-OS architecture
 * - Operator coordinate-based proximity detection
 *
 * 5E Inquiry Model Integration:
 * - Engage: Activate prior knowledge, spark curiosity (F, A operators)
 * - Explore: Hands-on investigation, discover patterns (G, A operators)
 * - Explain: Articulate understanding, mentor guidance (T, R operators)
 * - Elaborate: Apply to new contexts, extend learning (I, D, E operators)
 * - Evaluate: Assess understanding, identify gaps (all operators)
 *
 * NEW: Operator-based scaffolding uses conjugate pairs (I↔D, G↔E)
 * for targeted remediation.
 */

const ZPDSystem = {
  // ZPD moment types with operator mappings
  momentTypes: {
    gauge_shift: {
      description: 'Adjusting scope of understanding',
      operators: ['F', 'T'],
      mentor_action: 'Come closer — let me zoom in/out on this concept',
      zpd_boost: 1.2
    },
    correction: {
      description: 'Fixing misconceptions',
      operators: ['T', 'R'],
      mentor_action: 'Wait — that\'s not quite right. Let me redirect you',
      zpd_boost: 1.5
    },
    elaboration: {
      description: 'Adding depth and detail',
      operators: ['A', 'I'],
      mentor_action: 'Stay with me — there\'s more to this story',
      zpd_boost: 1.3
    },
    counter_example: {
      description: 'Showing exceptions to rules',
      operators: ['D', 'R'],
      mentor_action: 'Here\'s where it gets delicious — the exception',
      zpd_boost: 1.4
    },
    terminology: {
      description: 'Precise language introduction',
      operators: ['F', 'G'],
      mentor_action: 'Let me give you the precise term for this',
      zpd_boost: 1.1
    },
    pattern_guidance: {
      description: 'Revealing underlying patterns',
      operators: ['G', 'A'],
      mentor_action: 'Watch — do you see the pattern emerging?',
      zpd_boost: 1.6
    },
    conceptual_bridge: {
      description: 'Connecting to prior knowledge',
      operators: ['A', 'T'],
      mentor_action: 'Remember when we learned X? This is the same principle',
      zpd_boost: 1.7
    }
  },

  // 5E Inquiry phases with operator mappings
  inquiryPhases: {
    engage: {
      question_types: ['spark', 'relevance', 'prior_knowledge'],
      mentor_style: 'curiosity_hook',
      zpd_zone: 'known',
      operators: ['F'],  // Frame - establish definitions
      operator_threshold: { F: 0.7 }
    },
    explore: {
      question_types: ['observation', 'comparison', 'pattern'],
      mentor_style: 'guided_discovery',
      zpd_zone: 'proximal',
      operators: ['F', 'A', 'G'],  // Frame, Aggregate, Gravitate
      operator_threshold: { A: 0.5, G: 0.5 }
    },
    explain: {
      question_types: ['mechanism', 'definition', 'process'],
      mentor_style: 'direct_instruction',
      zpd_zone: 'proximal',
      operators: ['T', 'R'],  // Transform, React
      operator_threshold: { T: 0.6, R: 0.5 }
    },
    elaborate: {
      question_types: ['application', 'transfer', 'clinical'],
      mentor_style: 'challenge_extension',
      zpd_zone: 'beyond',
      operators: ['I', 'D', 'E'],  // Intensify, Diminish, Emit
      operator_threshold: { I: 0.5, D: 0.5, E: 0.5 }
    },
    evaluate: {
      question_types: ['synthesis', 'judgment', 'self_assess'],
      mentor_style: 'metacognitive',
      zpd_zone: 'varies',
      operators: ['T', 'A', 'R', 'E'],  // Full cognitive loop
      operator_threshold: {}  // Any combination
    }
  },

  // Student mastery tracking
  studentProfile: {
    masteredConcepts: new Set(),
    struggleConcepts: new Map(), // concept -> wrong count
    currentZPD: 'proximal',
    learningVelocity: 1.0,
    preferredMentorStyle: 'luminara'
  },

  // Initialize with questions and optional saved state
  init(questions, savedState = null) {
    this.questions = questions;
    if (savedState) {
      this.loadState(savedState);
    }
    console.log('[ZPD] System initialized');
  },

  // Analyze current ZPD for a topic/isotope cluster
  // Uses statistics-based zone detection when available
  analyzeZPD(isotopes, answeredQuestions) {
    const analysis = {
      zone: 'unknown',
      mastered: [],
      comfortable: [],
      proximal: [],
      beyond: [],
      recommendedNext: null,
      useStatistics: false
    };

    // ═══════════════════════════════════════════════════════════════
    // STATISTICS-BASED ANALYSIS (Preferred)
    // Uses empirical data from QuestionStatisticsEngine when available
    // ═══════════════════════════════════════════════════════════════
    const hasStatistics = typeof questionStatistics !== 'undefined' && questionStatistics;

    // Categorize questions by isotope overlap
    for (const q of this.questions) {
      const qIsotopes = q.isotopes || [];
      const overlap = isotopes.filter(iso => qIsotopes.includes(iso));

      if (overlap.length === 0) continue;

      // Use statistics-based zone if available
      if (hasStatistics) {
        const zone = this.getStatisticsBasedZone(q.id);
        switch (zone) {
          case 'mastered':
            analysis.mastered.push(q.id);
            break;
          case 'comfortable':
            analysis.comfortable.push(q.id);
            break;
          case 'proximal':
            analysis.proximal.push(q.id);
            break;
          case 'beyond':
            analysis.beyond.push(q.id);
            break;
        }
        analysis.useStatistics = true;
      } else {
        // Fallback to heuristic-based categorization
        const answered = answeredQuestions.get(q.id);

        if (answered?.correct) {
          analysis.mastered.push(q.id);
        } else if (answered && !answered.correct) {
          // Wrong answer - this is in proximal zone (needs help)
          analysis.proximal.push(q.id);
        } else {
          // Not attempted
          const prereqsMastered = this.checkPrerequisites(q, answeredQuestions);
          if (prereqsMastered) {
            analysis.proximal.push(q.id); // Ready to attempt with guidance
          } else {
            analysis.beyond.push(q.id); // Needs prereqs first
          }
        }
      }
    }

    // Determine overall zone
    const total = analysis.mastered.length + analysis.comfortable.length +
                  analysis.proximal.length + analysis.beyond.length;
    if (total === 0) {
      analysis.zone = 'new_territory';
    } else {
      const masteredRatio = (analysis.mastered.length + analysis.comfortable.length) / total;
      if (masteredRatio > 0.7) {
        analysis.zone = 'mastered';
      } else if (analysis.proximal.length > 0) {
        analysis.zone = 'proximal';
      } else {
        analysis.zone = 'beyond';
      }
    }

    // Recommend next question (prefer proximal zone)
    if (analysis.proximal.length > 0) {
      // Sort proximal questions by difficulty (easier first)
      const proximalWithDiff = analysis.proximal.map(qid => ({
        qid,
        difficulty: this.estimateDifficulty(this.questions.find(q => q.id === qid))
      }));
      proximalWithDiff.sort((a, b) => a.difficulty - b.difficulty);
      analysis.recommendedNext = proximalWithDiff[0].qid;
    } else if (analysis.comfortable.length > 0) {
      // If no proximal, try comfortable zone
      analysis.recommendedNext = analysis.comfortable[0];
    } else if (analysis.beyond.length > 0) {
      // Find the "closest" beyond question (fewest unmastered prereqs)
      analysis.recommendedNext = this.findClosestBeyond(analysis.beyond, answeredQuestions);
    }

    return analysis;
  },

  // Check if prerequisites are mastered
  checkPrerequisites(q, answeredQuestions) {
    const prereqIds = q._inferredPrereqs || [];
    if (prereqIds.length === 0) return true;

    let masteredCount = 0;
    for (const prereqId of prereqIds) {
      const answered = answeredQuestions.get(prereqId);
      if (answered?.correct) masteredCount++;
    }

    return masteredCount >= prereqIds.length * 0.6; // 60% prereqs mastered
  },

  // Find the closest "beyond" question
  findClosestBeyond(beyondIds, answeredQuestions) {
    let closest = null;
    let minUnmastered = Infinity;

    for (const qid of beyondIds) {
      const q = this.questions.find(x => x.id === qid);
      if (!q) continue;

      const prereqIds = q._inferredPrereqs || [];
      let unmasteredCount = 0;
      for (const prereqId of prereqIds) {
        const answered = answeredQuestions.get(prereqId);
        if (!answered?.correct) unmasteredCount++;
      }

      if (unmasteredCount < minUnmastered) {
        minUnmastered = unmasteredCount;
        closest = qid;
      }
    }

    return closest;
  },

  // Detect ZPD moment type from interaction
  detectMomentType(q, response, previousAttempts) {
    if (!response.correct && previousAttempts === 0) {
      // First wrong answer - likely correction needed
      return 'correction';
    }

    if (!response.correct && previousAttempts > 0) {
      // Multiple wrong answers - needs pattern guidance
      return 'pattern_guidance';
    }

    if (response.correct && previousAttempts > 0) {
      // Got it after retries - elaboration helped
      return 'elaboration';
    }

    if (response.correct && response.timeToAnswer < 5000) {
      // Quick correct - already mastered, might be terminology
      return 'terminology';
    }

    if (q.prereqs && q.prereqs.length > 0) {
      // Has prerequisites - conceptual bridge moment
      return 'conceptual_bridge';
    }

    // Default to gauge shift
    return 'gauge_shift';
  },

  // Generate ZPD-aware feedback
  generateFeedback(q, response, momentType) {
    const moment = this.momentTypes[momentType];
    const mentorAction = moment?.mentor_action || 'Let me help you understand this';

    const feedback = {
      type: momentType,
      mentorAction,
      operators: moment?.operators || ['F'],
      zpdBoost: moment?.zpd_boost || 1.0,
      suggestions: []
    };

    // Add specific suggestions based on moment type
    switch (momentType) {
      case 'correction':
        feedback.suggestions.push('Review the correct option explanation carefully');
        feedback.suggestions.push('Compare your choice with the correct answer');
        break;

      case 'pattern_guidance':
        feedback.suggestions.push('Look for the underlying principle');
        if (q.mechanism?.metaphor) {
          feedback.suggestions.push('Consider the metaphor: ' + q.mechanism.metaphor.substring(0, 100));
        }
        break;

      case 'conceptual_bridge':
        if (q.prereqs && q.prereqs.length > 0 && q.prereqs[0]?.q) {
          feedback.suggestions.push('This builds on: ' + q.prereqs[0].q.substring(0, 50) + '...');
        }
        break;

      case 'elaboration':
        feedback.suggestions.push('You\'re ready to go deeper');
        if (q.mechanism?.content) {
          feedback.suggestions.push('Explore the mechanism for full understanding');
        }
        break;
    }

    return feedback;
  },

  // Map question to 5E inquiry phase using operator coordinates
  mapToInquiryPhase(q) {
    // First try operator-based mapping
    const coord = q.operatorCoord || (window.IsotopeEngine?.computeOperatorCoordinate?.(q));

    if (coord) {
      // Check each phase's operator thresholds
      for (const [phase, config] of Object.entries(this.inquiryPhases)) {
        const threshold = config.operator_threshold || {};
        let matches = true;
        let matchCount = 0;

        for (const [op, minVal] of Object.entries(threshold)) {
          if (coord[op] >= minVal) {
            matchCount++;
          } else {
            matches = false;
          }
        }

        // Phase matches if any threshold is met
        if (Object.keys(threshold).length > 0 && matchCount > 0) {
          // Prioritize by match quality
          if (matchCount >= Object.keys(threshold).length) {
            return phase;
          }
        }
      }
    }

    // Fallback to text-based heuristics
    const text = `${q.q} ${q.explain || ''}`.toLowerCase();

    // Detection heuristics
    if (text.includes('why') || text.includes('how does')) {
      return 'explain';
    }

    if (text.includes('apply') || text.includes('clinical') || text.includes('patient')) {
      return 'elaborate';
    }

    if (text.includes('compare') || text.includes('contrast') || text.includes('difference')) {
      return 'explore';
    }

    if (text.includes('what is') || text.includes('define') || text.includes('name')) {
      return 'engage';
    }

    if (text.includes('evaluate') || text.includes('assess') || text.includes('best')) {
      return 'evaluate';
    }

    // Default based on question type
    if (q.type === 'true-false') return 'engage';
    if (q.prereqs && q.prereqs.length > 0) return 'elaborate';

    return 'explain';
  },

  // Operator-based scaffold hints
  operatorScaffolds: {
    F: { hint: 'What IS this thing? Focus on the definition.', icon: '📐' },
    T: { hint: 'What changes or transforms here? Follow the process.', icon: '🔄' },
    A: { hint: 'What pieces need to come together? Gather the components.', icon: '🧩' },
    I: { hint: 'What\'s being amplified or increased?', icon: '📈' },
    D: { hint: 'What\'s being reduced or inhibited?', icon: '📉' },
    R: { hint: 'What triggers this? Follow the cause and effect.', icon: '⚡' },
    G: { hint: 'Where does this converge? Find the target location.', icon: '🎯' },
    E: { hint: 'What gets released or sent out?', icon: '💫' }
  },

  // Conjugate scaffolds - use opposite operator for remediation
  conjugateScaffolds: {
    I: { conjugate: 'D', hint: 'If something increases, what might decrease in response?' },
    D: { conjugate: 'I', hint: 'If something is inhibited, what normally activates it?' },
    G: { conjugate: 'E', hint: 'Where things gather is often where things are released from.' },
    E: { conjugate: 'G', hint: 'What\'s released must come from somewhere specific.' }
  },

  // Generate scaffolding for struggling students using operator coordinates
  generateScaffolding(q, wrongCount, selectedAnswer = null) {
    const scaffolds = [];
    const coord = q.operatorCoord || (window.IsotopeEngine?.computeOperatorCoordinate?.(q));

    if (wrongCount >= 1) {
      // Level 1: Operator-based hint
      const dominantOp = this.getDominantOperator(coord);
      const opScaffold = this.operatorScaffolds[dominantOp];
      scaffolds.push({
        level: 1,
        type: 'operator_hint',
        operator: dominantOp,
        content: opScaffold?.hint || this.generateHint(q),
        icon: opScaffold?.icon || '💡'
      });
    }

    if (wrongCount >= 2) {
      // Level 2: Prerequisite or conjugate hint
      if (q.prereqs && q.prereqs.length > 0 && q.prereqs[0]?.q) {
        scaffolds.push({
          level: 2,
          type: 'prerequisite',
          content: `Remember the warmup: ${q.prereqs[0].q.substring(0, 80)}...`
        });
      } else {
        // Use conjugate scaffold
        const dominantOp = this.getDominantOperator(coord);
        const conjugate = this.conjugateScaffolds[dominantOp];
        if (conjugate) {
          scaffolds.push({
            level: 2,
            type: 'conjugate',
            content: conjugate.hint
          });
        }
      }
    }

    if (wrongCount >= 3) {
      // Level 3: Process elimination with option analysis
      scaffolds.push({
        level: 3,
        type: 'elimination',
        content: this.generateEliminationHint(q, selectedAnswer)
      });
    }

    if (wrongCount >= 4) {
      // Level 4: Direct mechanism reveal
      if (q.mechanism?.content) {
        scaffolds.push({
          level: 4,
          type: 'mechanism',
          content: q.mechanism.content.substring(0, 200) + '...'
        });
      }
    }

    return scaffolds;
  },

  // Get dominant operator from coordinate
  getDominantOperator(coord) {
    if (!coord) return 'F';
    const ops = Object.entries(coord);
    ops.sort((a, b) => b[1] - a[1]);
    return ops[0][0];
  },

  // Generate elimination hint
  generateEliminationHint(q, selectedAnswer) {
    if (selectedAnswer !== null && q.optionExplains && q.optionExplains[selectedAnswer]) {
      const explain = q.optionExplains[selectedAnswer];
      if (explain.verdict === 'incorrect' && explain.text) {
        // Extract key insight from wrong answer explanation
        const firstSentence = explain.text.split(/[.!]/)[0];
        return `Your choice: ${firstSentence}. What does this tell you about the correct answer?`;
      }
    }
    return 'One of these options is clearly different from the others. Which one doesn\'t fit the mechanism?';
  },

  // Generate a hint without giving away the answer
  generateHint(q) {
    // Use the mechanism metaphor if available
    if (q.mechanism?.metaphor) {
      const metaphor = q.mechanism.metaphor;
      // Take first sentence as hint
      const firstSentence = metaphor.split(/[.!?]/)[0];
      return `Think of it like: ${firstSentence}`;
    }

    // Use isotopes to generate hint
    if (q.isotopes && q.isotopes.length > 0) {
      const keyIsotope = q.isotopes[0];
      const concept = keyIsotope.split('.').pop().replace(/-/g, ' ');
      return `Focus on the concept of "${concept}"`;
    }

    // Generic hint based on question structure
    return 'Read each option carefully and eliminate the ones that don\'t fit';
  },

  // Track learning progression
  recordInteraction(qid, response) {
    const q = this.questions.find(x => x.id === qid);
    if (!q) return;

    const isotopes = q.isotopes || [];

    if (response.correct) {
      // Add to mastered concepts
      for (const iso of isotopes) {
        this.studentProfile.masteredConcepts.add(iso);
        // Remove from struggle if present
        if (this.studentProfile.struggleConcepts.has(iso)) {
          this.studentProfile.struggleConcepts.delete(iso);
        }
      }
      // Increase learning velocity
      this.studentProfile.learningVelocity = Math.min(2.0, this.studentProfile.learningVelocity * 1.1);
    } else {
      // Track struggle
      for (const iso of isotopes) {
        const count = this.studentProfile.struggleConcepts.get(iso) || 0;
        this.studentProfile.struggleConcepts.set(iso, count + 1);
      }
      // Decrease learning velocity
      this.studentProfile.learningVelocity = Math.max(0.5, this.studentProfile.learningVelocity * 0.9);
    }

    // Update current ZPD
    this.updateCurrentZPD();
  },

  // Update current ZPD based on performance
  updateCurrentZPD() {
    const masteredCount = this.studentProfile.masteredConcepts.size;
    const struggleCount = this.studentProfile.struggleConcepts.size;

    if (struggleCount > masteredCount) {
      this.studentProfile.currentZPD = 'foundational';
    } else if (this.studentProfile.learningVelocity > 1.5) {
      this.studentProfile.currentZPD = 'ready_for_challenge';
    } else {
      this.studentProfile.currentZPD = 'proximal';
    }
  },

  // Get personalized learning path
  getLearningPath(targetIsotopes, maxQuestions = 10) {
    const path = [];
    const toVisit = [...targetIsotopes];
    const visited = new Set();

    while (path.length < maxQuestions && toVisit.length > 0) {
      const iso = toVisit.shift();
      if (visited.has(iso)) continue;
      visited.add(iso);

      // Find questions with this isotope
      const questions = this.questions.filter(q =>
        (q.isotopes || []).includes(iso) &&
        !this.studentProfile.masteredConcepts.has(iso)
      );

      // Sort by difficulty (simpler first) - questions without isotopes go last
      questions.sort((a, b) => {
        const aLen = a.isotopes?.length || Infinity;
        const bLen = b.isotopes?.length || Infinity;
        return aLen - bLen;
      });

      for (const q of questions.slice(0, 2)) {
        path.push({
          question: q,
          targetIsotope: iso,
          inquiryPhase: this.mapToInquiryPhase(q),
          estimatedDifficulty: this.estimateDifficulty(q)
        });

        // Add related isotopes to explore
        for (const relatedIso of (q.isotopes || [])) {
          if (!visited.has(relatedIso)) {
            toVisit.push(relatedIso);
          }
        }
      }
    }

    return path;
  },

  // Estimate question difficulty
  // Uses statistics-based difficulty when available, falls back to heuristics
  estimateDifficulty(q) {
    // ═══════════════════════════════════════════════════════════════
    // STATISTICS-BASED DIFFICULTY (Preferred)
    // Uses empirical data from QuestionStatisticsEngine when available
    // ═══════════════════════════════════════════════════════════════
    if (typeof questionStatistics !== 'undefined' && questionStatistics) {
      const statsDifficulty = questionStatistics.getDifficulty(q.id);
      if (statsDifficulty !== null && statsDifficulty !== undefined) {
        // Convert from 0-1 scale to 1-5 scale for display
        const scaledDifficulty = 1 + (statsDifficulty * 4);
        return Math.round(scaledDifficulty * 10) / 10;
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // HEURISTIC FALLBACK (Original algorithm)
    // Used when statistics are not available
    // ═══════════════════════════════════════════════════════════════
    let score = 1;

    // More isotopes = more complex
    score += (q.isotopes?.length || 0) * 0.2;

    // Has prerequisites = harder
    if (q.prereqs && q.prereqs.length > 0) score += 0.5;

    // Has mechanism = deeper understanding needed
    if (q.mechanism?.content) score += 0.3;

    // Check if struggling with related concepts
    for (const iso of (q.isotopes || [])) {
      if (this.studentProfile.struggleConcepts.has(iso)) {
        score += 0.3;
      }
    }

    return Math.min(5, Math.round(score * 10) / 10);
  },

  // ═══════════════════════════════════════════════════════════════
  // STATISTICS-BASED ZPD ZONE DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Determine ZPD zone for a question using statistics when available
   * @param {string} questionId - Question ID to evaluate
   * @returns {string} 'mastered' | 'comfortable' | 'proximal' | 'beyond'
   */
  getStatisticsBasedZone(questionId) {
    // Use QuestionStatisticsEngine if available
    if (typeof questionStatistics !== 'undefined' && questionStatistics) {
      const userProfile = {
        topicPerformance: typeof scaffolding !== 'undefined' && scaffolding
          ? scaffolding.data?.topicPerformance || {}
          : {},
        recentPerformance: typeof scaffolding !== 'undefined' && scaffolding
          ? scaffolding.data?.recentPerformance || []
          : []
      };

      return questionStatistics.determineZPDZone(questionId, userProfile);
    }

    // Fallback to basic zone detection
    return 'proximal';  // Default to ZPD if no statistics
  },

  /**
   * Get questions in the proximal (ZPD) zone
   * These are the ideal questions for learning - challenging but achievable
   * @param {number} count - Number of questions to return
   * @returns {array} Questions in the ZPD zone, sorted by predicted success probability
   */
  getZPDQuestions(count = 5) {
    const zpdQuestions = [];

    for (const q of this.questions) {
      const zone = this.getStatisticsBasedZone(q.id);
      if (zone === 'proximal') {
        zpdQuestions.push({
          question: q,
          zone,
          difficulty: this.estimateDifficulty(q),
          inquiryPhase: this.mapToInquiryPhase(q)
        });
      }
    }

    // Sort by difficulty (easier ZPD questions first for momentum)
    zpdQuestions.sort((a, b) => a.difficulty - b.difficulty);

    return zpdQuestions.slice(0, count);
  },

  /**
   * Get a summary of question distributions across ZPD zones
   * @returns {object} Zone distribution summary
   */
  getZPDDistribution() {
    const distribution = {
      mastered: 0,
      comfortable: 0,
      proximal: 0,
      beyond: 0,
      total: this.questions.length
    };

    for (const q of this.questions) {
      const zone = this.getStatisticsBasedZone(q.id);
      distribution[zone] = (distribution[zone] || 0) + 1;
    }

    return distribution;
  },

  // Save state for persistence
  saveState() {
    return {
      masteredConcepts: Array.from(this.studentProfile.masteredConcepts),
      struggleConcepts: Array.from(this.studentProfile.struggleConcepts.entries()),
      currentZPD: this.studentProfile.currentZPD,
      learningVelocity: this.studentProfile.learningVelocity,
      preferredMentorStyle: this.studentProfile.preferredMentorStyle
    };
  },

  // Load state from persistence
  loadState(state) {
    if (state.masteredConcepts) {
      this.studentProfile.masteredConcepts = new Set(state.masteredConcepts);
    }
    if (state.struggleConcepts) {
      this.studentProfile.struggleConcepts = new Map(state.struggleConcepts);
    }
    if (state.currentZPD) {
      this.studentProfile.currentZPD = state.currentZPD;
    }
    if (state.learningVelocity) {
      this.studentProfile.learningVelocity = state.learningVelocity;
    }
    if (state.preferredMentorStyle) {
      this.studentProfile.preferredMentorStyle = state.preferredMentorStyle;
    }
  },

  // Export for LUMI-OS
  exportZPDAnalysis(qid) {
    const q = this.questions.find(x => x.id === qid);
    if (!q) return null;

    return {
      question_id: qid,
      inquiry_phase: this.mapToInquiryPhase(q),
      estimated_difficulty: this.estimateDifficulty(q),
      zpd_moments: Object.keys(this.momentTypes),
      student_zpd: this.studentProfile.currentZPD,
      learning_velocity: this.studentProfile.learningVelocity,
      scaffolding_available: this.generateScaffolding(q, 0).length
    };
  }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZPDSystem;
}
