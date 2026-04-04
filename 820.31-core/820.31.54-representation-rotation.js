/**
 * @file 820.31.54-representation-rotation.js
 * @codon 820.31.54
 * @version 2026-03-29
 * @brief Representation Rotation - Multi-Modal Mastery Enforcement
 *
 * TAIDRGEF Signature: F.A.G.T.E
 * - F (Frame): Multiple frames of the same concept
 * - A (Aggregate): Representations aggregate to mastery
 * - G (Gravitate): Questions gravitate to missing reps
 * - T (Transform): Understanding transforms across modes
 * - E (Emit): Mastery emits only when all reps achieved
 *
 * Cycle 1: Representation tracking - Monitor rep exposure and success
 * Cycle 2: Mastery lock - Enforce multi-rep requirement for mastery
 *
 * Based on McDermott P1: "Different representations should be presented
 * together so that students can form productive links between them."
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: REPRESENTATION TRACKING
    // =========================================================================

    /**
     * Representation Types - Different ways to present the same concept
     */
    const REPRESENTATION_TYPES = {
        VERBAL: {
            id: 'verbal',
            name: 'Verbal',
            description: 'Text-based definition, explanation, or description',
            icon: 'text',
            questionTypes: ['definition', 'explanation', 'fill_blank', 'terminology'],
            examples: [
                'Define the term...',
                'Explain the mechanism of...',
                'Complete the sentence:...'
            ],
            fiveEPhase: 'explain'
        },

        GRAPHICAL: {
            id: 'graphical',
            name: 'Graphical',
            description: 'Diagram interpretation, labeling, or visual matching',
            icon: 'image',
            questionTypes: ['diagram', 'labeling', 'visual_matching', 'chart'],
            examples: [
                'Identify the structure in this diagram...',
                'Label the components of...',
                'What does this graph show?'
            ],
            fiveEPhase: 'explore'
        },

        MATHEMATICAL: {
            id: 'mathematical',
            name: 'Mathematical',
            description: 'Calculations, formulas, quantitative relationships',
            icon: 'calculator',
            questionTypes: ['calculation', 'formula', 'quantitative', 'proportion'],
            examples: [
                'Calculate the value of...',
                'Using the formula, determine...',
                'What is the ratio of...'
            ],
            fiveEPhase: 'elaborate'
        },

        CLINICAL: {
            id: 'clinical',
            name: 'Clinical',
            description: 'Patient scenarios, applied reasoning, case studies',
            icon: 'stethoscope',
            questionTypes: ['case_study', 'patient_scenario', 'clinical_application', 'diagnosis'],
            examples: [
                'A patient presents with... What is...',
                'In this clinical scenario...',
                'Based on these findings, what would you...'
            ],
            fiveEPhase: 'elaborate'
        },

        PROCEDURAL: {
            id: 'procedural',
            name: 'Procedural',
            description: 'Step ordering, process sequencing, protocol',
            icon: 'list-ordered',
            questionTypes: ['sequence', 'ordering', 'steps', 'protocol'],
            examples: [
                'Arrange these steps in order...',
                'What comes next in this process?',
                'The correct sequence is...'
            ],
            fiveEPhase: 'evaluate'
        },

        COMPARATIVE: {
            id: 'comparative',
            name: 'Comparative',
            description: 'Comparing and contrasting related concepts',
            icon: 'compare',
            questionTypes: ['comparison', 'contrast', 'differentiate', 'similarity'],
            examples: [
                'How does X differ from Y?',
                'Compare and contrast...',
                'Which statement best distinguishes...'
            ],
            fiveEPhase: 'elaborate'
        },

        ANALOGICAL: {
            id: 'analogical',
            name: 'Analogical',
            description: 'Understanding through analogies and metaphors',
            icon: 'lightbulb',
            questionTypes: ['analogy', 'metaphor', 'like_what', 'similar_to'],
            examples: [
                'This is like a...',
                'What everyday object works similarly?',
                'The analogy that best describes...'
            ],
            fiveEPhase: 'explain'
        }
    };

    /**
     * Mastery Requirements - Which reps are required
     */
    const MASTERY_REQUIREMENTS = {
        MINIMUM: {
            id: 'minimum',
            name: 'Minimum Mastery',
            required: ['verbal', 'graphical', 'clinical'],
            description: 'Basic mastery requires at least 3 representations'
        },

        STANDARD: {
            id: 'standard',
            name: 'Standard Mastery',
            required: ['verbal', 'graphical', 'clinical', 'procedural'],
            description: 'Standard mastery requires 4 representations'
        },

        ADVANCED: {
            id: 'advanced',
            name: 'Advanced Mastery',
            required: ['verbal', 'graphical', 'mathematical', 'clinical', 'procedural'],
            description: 'Advanced mastery requires 5 representations'
        },

        COMPLETE: {
            id: 'complete',
            name: 'Complete Mastery',
            required: ['verbal', 'graphical', 'mathematical', 'clinical', 'procedural', 'comparative', 'analogical'],
            description: 'Complete mastery requires all representations'
        }
    };

    /**
     * Representation Rotation Engine
     */
    class RepresentationRotationEngine {
        constructor() {
            this.state = this.loadState();
            this.masteryLevel = 'minimum'; // Can be configured
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('representationRotation');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                concepts: {},          // conceptId -> representation tracking
                globalStats: {
                    representationsSeen: {},
                    representationsCorrect: {},
                    conceptsMastered: 0,
                    rotationCompleted: 0
                },
                masteryLevel: 'minimum',
                representationPreferences: {},  // User's strongest/weakest
                rotationHistory: [],
                achievements: [],
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('representationRotation', JSON.stringify(this.state));
        }

        /**
         * Track a question answer by representation
         */
        trackRepresentation(conceptId, questionData, isCorrect) {
            // Determine representation type
            const repType = this.determineRepresentationType(questionData);

            // Initialize concept if needed
            if (!this.state.concepts[conceptId]) {
                this.state.concepts[conceptId] = {
                    conceptId,
                    name: questionData.conceptName || conceptId,
                    representations: {},
                    mastery: 0,
                    rotationLocked: false,
                    achievedMastery: false,
                    firstSeen: Date.now(),
                    lastSeen: null
                };
            }

            const concept = this.state.concepts[conceptId];

            // Initialize representation if needed
            if (!concept.representations[repType]) {
                concept.representations[repType] = {
                    type: repType,
                    seen: 0,
                    correct: 0,
                    accuracy: 0,
                    lastSeen: null,
                    firstCorrect: null,
                    mastered: false
                };
            }

            const rep = concept.representations[repType];

            // Update tracking
            rep.seen++;
            rep.lastSeen = Date.now();
            concept.lastSeen = Date.now();

            if (isCorrect) {
                rep.correct++;
                if (!rep.firstCorrect) {
                    rep.firstCorrect = Date.now();
                }
            }

            rep.accuracy = rep.seen > 0 ? rep.correct / rep.seen : 0;

            // Check if representation is mastered (2+ correct)
            if (rep.correct >= 2 && !rep.mastered) {
                rep.mastered = true;
            }

            // Update global stats
            this.updateGlobalStats(repType, isCorrect);

            // Check mastery status
            const masteryCheck = this.checkConceptMastery(conceptId);

            // Record in rotation history
            this.state.rotationHistory.unshift({
                conceptId,
                representation: repType,
                isCorrect,
                timestamp: Date.now()
            });
            if (this.state.rotationHistory.length > 500) {
                this.state.rotationHistory.pop();
            }

            this.saveState();

            return {
                concept,
                representation: rep,
                representationType: repType,
                masteryCheck,
                message: this.generateTrackingMessage(repType, isCorrect, masteryCheck)
            };
        }

        /**
         * Determine representation type from question data
         */
        determineRepresentationType(questionData) {
            const questionType = (questionData.type || '').toLowerCase();
            const questionText = (questionData.question || '').toLowerCase();
            const tags = (questionData.tags || []).map(t => t.toLowerCase());

            // Check explicit type mapping
            for (const [repId, rep] of Object.entries(REPRESENTATION_TYPES)) {
                if (rep.questionTypes.some(qt => questionType.includes(qt))) {
                    return repId.toLowerCase();
                }
                if (tags.some(tag => rep.questionTypes.includes(tag))) {
                    return repId.toLowerCase();
                }
            }

            // Infer from question text
            if (questionText.includes('diagram') || questionText.includes('figure') ||
                questionText.includes('label') || questionText.includes('identify in')) {
                return 'graphical';
            }
            if (questionText.includes('calculate') || questionText.includes('formula') ||
                questionText.includes('what is the value')) {
                return 'mathematical';
            }
            if (questionText.includes('patient') || questionText.includes('clinical') ||
                questionText.includes('presents with') || questionText.includes('diagnosis')) {
                return 'clinical';
            }
            if (questionText.includes('order') || questionText.includes('sequence') ||
                questionText.includes('steps') || questionText.includes('first')) {
                return 'procedural';
            }
            if (questionText.includes('compare') || questionText.includes('contrast') ||
                questionText.includes('differ') || questionText.includes('similar')) {
                return 'comparative';
            }
            if (questionText.includes('like a') || questionText.includes('analogy') ||
                questionText.includes('similar to') || questionText.includes('think of it as')) {
                return 'analogical';
            }

            // Default to verbal
            return 'verbal';
        }

        /**
         * Update global representation statistics
         */
        updateGlobalStats(repType, isCorrect) {
            this.state.globalStats.representationsSeen[repType] =
                (this.state.globalStats.representationsSeen[repType] || 0) + 1;

            if (isCorrect) {
                this.state.globalStats.representationsCorrect[repType] =
                    (this.state.globalStats.representationsCorrect[repType] || 0) + 1;
            }
        }

        /**
         * Generate tracking message
         */
        generateTrackingMessage(repType, isCorrect, masteryCheck) {
            const rep = REPRESENTATION_TYPES[repType.toUpperCase()];
            const repName = rep ? rep.name : repType;

            if (masteryCheck.justAchievedMastery) {
                return `Mastery achieved! All required representations conquered.`;
            }

            if (isCorrect) {
                return `${repName} representation strengthened.`;
            }

            return `${repName} representation needs more practice.`;
        }

        // =========================================================================
        // CYCLE 2: MASTERY LOCK - ENFORCE MULTI-REP REQUIREMENT
        // =========================================================================

        /**
         * Check if concept has achieved mastery
         */
        checkConceptMastery(conceptId) {
            const concept = this.state.concepts[conceptId];
            if (!concept) {
                return {
                    achievedMastery: false,
                    reason: 'Concept not tracked'
                };
            }

            const requirement = MASTERY_REQUIREMENTS[this.state.masteryLevel.toUpperCase()];
            if (!requirement) {
                return {
                    achievedMastery: false,
                    reason: 'Invalid mastery level'
                };
            }

            const requiredReps = requirement.required;
            const missingReps = [];
            const achievedReps = [];
            const progressReps = [];

            requiredReps.forEach(repType => {
                const rep = concept.representations[repType];
                if (!rep || rep.seen === 0) {
                    missingReps.push(repType);
                } else if (rep.mastered) {
                    achievedReps.push(repType);
                } else {
                    progressReps.push({
                        type: repType,
                        correct: rep.correct,
                        needed: 2
                    });
                }
            });

            const wasAchieved = concept.achievedMastery;
            const nowAchieved = missingReps.length === 0 && progressReps.length === 0;

            if (nowAchieved && !wasAchieved) {
                concept.achievedMastery = true;
                concept.masteryAchievedAt = Date.now();
                this.state.globalStats.conceptsMastered++;
            }

            return {
                achievedMastery: nowAchieved,
                justAchievedMastery: nowAchieved && !wasAchieved,
                achievedReps,
                missingReps,
                progressReps,
                totalRequired: requiredReps.length,
                progressPercent: achievedReps.length / requiredReps.length,
                masteryLevel: this.state.masteryLevel
            };
        }

        /**
         * Can this concept achieve mastery? (Is it locked out?)
         */
        canAchieveMastery(conceptId) {
            const check = this.checkConceptMastery(conceptId);
            return {
                canAchieve: check.missingReps.length === 0 || check.progressReps.length > 0,
                blockedBy: check.missingReps,
                inProgress: check.progressReps
            };
        }

        /**
         * Get next required representation for a concept
         */
        getNextRequiredRepresentation(conceptId) {
            const check = this.checkConceptMastery(conceptId);

            // First priority: reps that have been seen but not mastered
            if (check.progressReps.length > 0) {
                // Sort by closest to mastery
                check.progressReps.sort((a, b) =>
                    (b.needed - b.correct) - (a.needed - a.correct)
                );
                return {
                    type: check.progressReps[0].type,
                    reason: 'close_to_mastery',
                    correctNeeded: 2 - check.progressReps[0].correct
                };
            }

            // Second priority: unseen required reps
            if (check.missingReps.length > 0) {
                return {
                    type: check.missingReps[0],
                    reason: 'not_yet_seen',
                    correctNeeded: 2
                };
            }

            // Already mastered
            return {
                type: null,
                reason: 'all_mastered',
                correctNeeded: 0
            };
        }

        /**
         * Get representation gems (visual progress indicators)
         */
        getRepresentationGems(conceptId) {
            const concept = this.state.concepts[conceptId];
            if (!concept) return [];

            const requirement = MASTERY_REQUIREMENTS[this.state.masteryLevel.toUpperCase()];
            const requiredReps = requirement ? requirement.required : ['verbal', 'graphical', 'clinical'];

            return requiredReps.map(repType => {
                const rep = concept.representations[repType];
                const repInfo = REPRESENTATION_TYPES[repType.toUpperCase()];

                return {
                    type: repType,
                    name: repInfo ? repInfo.name : repType,
                    icon: repInfo ? repInfo.icon : 'circle',
                    status: !rep ? 'unseen' :
                            rep.mastered ? 'mastered' :
                            rep.correct >= 1 ? 'progress' : 'seen',
                    seen: rep ? rep.seen : 0,
                    correct: rep ? rep.correct : 0,
                    accuracy: rep ? Math.round(rep.accuracy * 100) : 0
                };
            });
        }

        /**
         * Should rotate representation? (Avoid staying in same rep too long)
         */
        shouldRotate(conceptId, currentRepType) {
            const history = this.state.rotationHistory
                .filter(h => h.conceptId === conceptId)
                .slice(0, 5);

            // Count consecutive same-type
            let consecutive = 0;
            for (const entry of history) {
                if (entry.representation === currentRepType) {
                    consecutive++;
                } else {
                    break;
                }
            }

            return {
                shouldRotate: consecutive >= 3,
                consecutiveCount: consecutive,
                suggestedRep: this.getNextRequiredRepresentation(conceptId).type
            };
        }

        /**
         * Get representation roulette (random rep selection)
         */
        getRepresentationRoulette(conceptId) {
            const check = this.checkConceptMastery(conceptId);
            const allReps = [...check.missingReps, ...check.progressReps.map(p => p.type)];

            if (allReps.length === 0) {
                // All mastered, can do any
                return Object.keys(REPRESENTATION_TYPES)[
                    Math.floor(Math.random() * Object.keys(REPRESENTATION_TYPES).length)
                ].toLowerCase();
            }

            // Random from needed reps
            return allReps[Math.floor(Math.random() * allReps.length)];
        }

        /**
         * Get representation analytics
         */
        getAnalytics() {
            const stats = this.state.globalStats;

            // Calculate per-representation accuracy
            const repAccuracy = {};
            Object.entries(stats.representationsSeen).forEach(([rep, seen]) => {
                const correct = stats.representationsCorrect[rep] || 0;
                repAccuracy[rep] = {
                    seen,
                    correct,
                    accuracy: seen > 0 ? Math.round((correct / seen) * 100) : 0
                };
            });

            // Find strongest and weakest
            const sorted = Object.entries(repAccuracy)
                .filter(([rep, data]) => data.seen >= 5)
                .sort((a, b) => b[1].accuracy - a[1].accuracy);

            const strongest = sorted[0]?.[0];
            const weakest = sorted[sorted.length - 1]?.[0];

            // Calculate concepts by mastery stage
            const conceptStages = {
                notStarted: 0,
                inProgress: 0,
                mastered: 0
            };

            Object.values(this.state.concepts).forEach(concept => {
                const check = this.checkConceptMastery(concept.conceptId);
                if (check.achievedMastery) {
                    conceptStages.mastered++;
                } else if (Object.keys(concept.representations).length > 0) {
                    conceptStages.inProgress++;
                } else {
                    conceptStages.notStarted++;
                }
            });

            return {
                representationAccuracy: repAccuracy,
                strongestRepresentation: strongest,
                weakestRepresentation: weakest,
                conceptStages,
                totalConcepts: Object.keys(this.state.concepts).length,
                masteredConcepts: stats.conceptsMastered,
                masteryLevel: this.state.masteryLevel,
                masteryRequirement: MASTERY_REQUIREMENTS[this.state.masteryLevel.toUpperCase()]
            };
        }

        /**
         * Set mastery level requirement
         */
        setMasteryLevel(level) {
            if (MASTERY_REQUIREMENTS[level.toUpperCase()]) {
                this.state.masteryLevel = level.toLowerCase();
                this.saveState();
                return true;
            }
            return false;
        }

        /**
         * Get concept progress report
         */
        getConceptReport(conceptId) {
            const concept = this.state.concepts[conceptId];
            if (!concept) return null;

            const masteryCheck = this.checkConceptMastery(conceptId);
            const gems = this.getRepresentationGems(conceptId);
            const nextRep = this.getNextRequiredRepresentation(conceptId);

            return {
                concept,
                masteryStatus: masteryCheck,
                gems,
                nextRequired: nextRep,
                rotationSuggestion: this.shouldRotate(conceptId,
                    this.state.rotationHistory[0]?.representation),
                totalTimeInConcept: concept.lastSeen - concept.firstSeen,
                questionsAnswered: Object.values(concept.representations)
                    .reduce((sum, r) => sum + r.seen, 0)
            };
        }

        /**
         * Get global statistics
         */
        getStatistics() {
            const analytics = this.getAnalytics();
            return {
                ...analytics,
                rotationHistoryLength: this.state.rotationHistory.length,
                achievementsCount: this.state.achievements.length
            };
        }

        /**
         * Get recommendations for balanced practice
         */
        getBalanceRecommendations() {
            const analytics = this.getAnalytics();
            const recommendations = [];

            // Check for neglected representations
            Object.entries(REPRESENTATION_TYPES).forEach(([repId, rep]) => {
                const repLower = repId.toLowerCase();
                const data = analytics.representationAccuracy[repLower];

                if (!data || data.seen < 10) {
                    recommendations.push({
                        type: 'practice_more',
                        representation: repLower,
                        name: rep.name,
                        message: `Practice more ${rep.name} questions`,
                        priority: 'medium'
                    });
                } else if (data.accuracy < 50) {
                    recommendations.push({
                        type: 'improve_accuracy',
                        representation: repLower,
                        name: rep.name,
                        accuracy: data.accuracy,
                        message: `Improve ${rep.name} accuracy (currently ${data.accuracy}%)`,
                        priority: 'high'
                    });
                }
            });

            // Check for concepts stuck in progress
            Object.values(this.state.concepts).forEach(concept => {
                const check = this.checkConceptMastery(concept.conceptId);
                if (!check.achievedMastery && check.progressPercent > 0.5) {
                    const missing = check.missingReps.concat(
                        check.progressReps.map(p => p.type)
                    );
                    recommendations.push({
                        type: 'complete_mastery',
                        conceptId: concept.conceptId,
                        conceptName: concept.name,
                        missingReps: missing,
                        message: `Complete mastery of ${concept.name}: need ${missing.join(', ')}`,
                        priority: 'high'
                    });
                }
            });

            return recommendations.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Track a question's representation
     */
    function onQuestionAnswered(conceptId, questionData, isCorrect) {
        const engine = window.representationRotation;
        if (!engine) return null;
        return engine.trackRepresentation(conceptId, questionData, isCorrect);
    }

    /**
     * Check mastery for a concept
     */
    function checkMastery(conceptId) {
        const engine = window.representationRotation;
        if (!engine) return null;
        return engine.checkConceptMastery(conceptId);
    }

    /**
     * Get next representation to practice
     */
    function getNextRepresentation(conceptId) {
        const engine = window.representationRotation;
        if (!engine) return null;
        return engine.getNextRequiredRepresentation(conceptId);
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.representationRotation = new RepresentationRotationEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            RepresentationRotationEngine,
            REPRESENTATION_TYPES,
            MASTERY_REQUIREMENTS,
            onQuestionAnswered,
            checkMastery,
            getNextRepresentation
        };
    }

    console.log('[Representation Rotation] Initialized - Multi-modal tracking active');

})();
