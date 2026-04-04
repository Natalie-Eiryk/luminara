/**
 * @file 820.31.50-phase-locked-encounters.js
 * @codon 820.31.50
 * @version 2026-03-29
 * @brief Phase-Locked Encounters - 5E Model Driving Game Encounters
 *
 * TAIDRGEF Signature: F.R.T.G.A
 * - F (Frame): 5E phases frame all interactions
 * - R (React): System reacts to learner state
 * - T (Transform): Questions transform per phase
 * - G (Gravitate): Difficulty gravitates to ZPD
 * - A (Aggregate): Phase data aggregates for analytics
 *
 * Cycle 1: 5E Phase mapping to encounter types
 * Cycle 2: Phase-aware question selection
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: 5E PHASE MAPPING TO ENCOUNTER TYPES
    // =========================================================================

    /**
     * The 5E Inquiry Model phases
     */
    const FIVE_E_PHASES = {
        ENGAGE: {
            id: 'engage',
            name: 'Engage',
            description: 'Hook the learner, activate prior knowledge',
            purpose: 'Surface existing mental models and spark curiosity',
            learnerState: 'curious',
            questionCharacteristics: {
                difficulty: 'accessible',
                penalty: 'minimal',
                focus: 'activation'
            },
            msLuminaraVoice: [
                'What do you already know about this?',
                'Let\'s see where you\'re starting from...',
                'Here\'s something to spark your curiosity...'
            ]
        },

        EXPLORE: {
            id: 'explore',
            name: 'Explore',
            description: 'Investigate through direct experience',
            purpose: 'Active engagement, trial and error, building intuitions',
            learnerState: 'active',
            questionCharacteristics: {
                difficulty: 'varied',
                penalty: 'moderate',
                focus: 'discovery'
            },
            msLuminaraVoice: [
                'Try this one. Learn from what happens.',
                'Each attempt teaches something.',
                'Explore freely - there\'s value in every path.'
            ]
        },

        EXPLAIN: {
            id: 'explain',
            name: 'Explain',
            description: 'Construct understanding through explanation',
            purpose: 'Make sense of experiences, build mental models',
            learnerState: 'constructing',
            questionCharacteristics: {
                difficulty: 'scaffolded',
                penalty: 'none',
                focus: 'understanding'
            },
            msLuminaraVoice: [
                'Let me help you understand why...',
                'Here\'s what\'s really happening...',
                'The mechanism works like this...'
            ]
        },

        ELABORATE: {
            id: 'elaborate',
            name: 'Elaborate',
            description: 'Apply and extend understanding',
            purpose: 'Transfer to new contexts, deepen mastery',
            learnerState: 'applying',
            questionCharacteristics: {
                difficulty: 'challenging',
                penalty: 'full',
                focus: 'transfer'
            },
            msLuminaraVoice: [
                'Now apply what you\'ve learned...',
                'Here\'s a new context. Same principles.',
                'Can you extend this understanding?'
            ]
        },

        EVALUATE: {
            id: 'evaluate',
            name: 'Evaluate',
            description: 'Assess understanding and growth',
            purpose: 'Reflect on learning, measure mastery',
            learnerState: 'reflective',
            questionCharacteristics: {
                difficulty: 'mastery_check',
                penalty: 'diagnostic',
                focus: 'assessment'
            },
            msLuminaraVoice: [
                'Let\'s see how far you\'ve come...',
                'Time to measure your understanding.',
                'Show me what you\'ve mastered.'
            ]
        }
    };

    /**
     * Encounter Types mapped to 5E phases
     */
    const ENCOUNTER_PHASE_MAP = {
        // ENGAGE encounters
        'mystery': {
            phase: 'engage',
            description: 'Mystery nodes present hook questions',
            questionPolicy: 'accessible_hook',
            penaltyMultiplier: 0.25
        },
        'curiosity_spark': {
            phase: 'engage',
            description: 'Initial topic introduction',
            questionPolicy: 'prior_knowledge_probe',
            penaltyMultiplier: 0
        },
        'topic_start': {
            phase: 'engage',
            description: 'Beginning of new content area',
            questionPolicy: 'accessible_hook',
            penaltyMultiplier: 0
        },

        // EXPLORE encounters
        'combat': {
            phase: 'explore',
            description: 'Standard question answering',
            questionPolicy: 'zpd_matched',
            penaltyMultiplier: 1.0
        },
        'branching_path': {
            phase: 'explore',
            description: 'Multiple valid learning paths',
            questionPolicy: 'variety_within_topic',
            penaltyMultiplier: 0.75
        },
        'discovery': {
            phase: 'explore',
            description: 'Open exploration node',
            questionPolicy: 'broad_sampling',
            penaltyMultiplier: 0.5
        },

        // EXPLAIN encounters
        'rest': {
            phase: 'explain',
            description: 'Scaffold and explanation sessions',
            questionPolicy: 'scaffolded_sequence',
            penaltyMultiplier: 0
        },
        'scaffold': {
            phase: 'explain',
            description: 'Step-by-step understanding',
            questionPolicy: 'prerequisite_chain',
            penaltyMultiplier: 0
        },
        'deep_dive': {
            phase: 'explain',
            description: 'Extended mechanism breakdown',
            questionPolicy: 'mechanism_trace',
            penaltyMultiplier: 0
        },

        // ELABORATE encounters
        'elite': {
            phase: 'elaborate',
            description: 'Challenging application',
            questionPolicy: 'transfer_context',
            penaltyMultiplier: 1.25
        },
        'boss': {
            phase: 'elaborate',
            description: 'Integration across concepts',
            questionPolicy: 'integration_synthesis',
            penaltyMultiplier: 1.5
        },
        'clinical_case': {
            phase: 'elaborate',
            description: 'Real-world application',
            questionPolicy: 'clinical_transfer',
            penaltyMultiplier: 1.25
        },

        // EVALUATE encounters
        'treasure': {
            phase: 'evaluate',
            description: 'Mastery reveal',
            questionPolicy: 'mastery_check',
            penaltyMultiplier: 0
        },
        'shop': {
            phase: 'evaluate',
            description: 'Show available content (prerequisites met)',
            questionPolicy: 'prerequisite_gate',
            penaltyMultiplier: 0
        },
        'milestone': {
            phase: 'evaluate',
            description: 'Progress checkpoint',
            questionPolicy: 'comprehensive_assessment',
            penaltyMultiplier: 1.0
        },
        'reflection': {
            phase: 'evaluate',
            description: 'Growth reflection point',
            questionPolicy: 'growth_comparison',
            penaltyMultiplier: 0
        }
    };

    /**
     * Phase-Locked Encounters Engine
     */
    class PhaseLockedEncountersEngine {
        constructor() {
            this.state = this.loadState();
            this.currentPhase = 'engage';
            this.phaseHistory = [];
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('phaseLockedEncounters');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                phaseStats: {
                    engage: { encounters: 0, questionsAsked: 0, correctAnswers: 0 },
                    explore: { encounters: 0, questionsAsked: 0, correctAnswers: 0 },
                    explain: { encounters: 0, questionsAsked: 0, correctAnswers: 0 },
                    elaborate: { encounters: 0, questionsAsked: 0, correctAnswers: 0 },
                    evaluate: { encounters: 0, questionsAsked: 0, correctAnswers: 0 }
                },
                phaseCycles: 0,           // Complete 5E cycles
                currentCycleProgress: [],  // Phases completed in current cycle
                sessionPhases: [],         // Phase sequence this session
                lastPhase: null,
                preferredTransitions: {},  // Learning pattern data
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('phaseLockedEncounters', JSON.stringify(this.state));
        }

        /**
         * Get 5E phase for an encounter type
         */
        getPhaseForEncounter(encounterType) {
            const mapping = ENCOUNTER_PHASE_MAP[encounterType];
            if (!mapping) {
                return 'explore'; // Default to explore
            }
            return mapping.phase;
        }

        /**
         * Get encounter configuration
         */
        getEncounterConfig(encounterType) {
            const mapping = ENCOUNTER_PHASE_MAP[encounterType] || {
                phase: 'explore',
                questionPolicy: 'zpd_matched',
                penaltyMultiplier: 1.0
            };

            const phase = FIVE_E_PHASES[mapping.phase.toUpperCase()];

            return {
                encounterType,
                phase: mapping.phase,
                phaseInfo: phase,
                questionPolicy: mapping.questionPolicy,
                penaltyMultiplier: mapping.penaltyMultiplier,
                questionCharacteristics: phase.questionCharacteristics,
                msLuminaraIntro: this.selectVoiceMessage(phase.msLuminaraVoice)
            };
        }

        /**
         * Select a voice message from options
         */
        selectVoiceMessage(messages) {
            return messages[Math.floor(Math.random() * messages.length)];
        }

        /**
         * Start an encounter
         */
        startEncounter(encounterType) {
            const config = this.getEncounterConfig(encounterType);
            const phase = config.phase;

            // Update tracking
            this.currentPhase = phase;
            this.state.phaseStats[phase].encounters++;
            this.state.sessionPhases.push({
                phase,
                encounterType,
                timestamp: Date.now()
            });
            this.state.lastPhase = phase;

            // Track cycle progress
            if (!this.state.currentCycleProgress.includes(phase)) {
                this.state.currentCycleProgress.push(phase);
            }

            // Check for complete cycle
            if (this.state.currentCycleProgress.length === 5) {
                this.state.phaseCycles++;
                this.state.currentCycleProgress = [];
            }

            this.saveState();

            return config;
        }

        /**
         * Record question answered in current phase
         */
        recordQuestionAnswer(correct) {
            const phase = this.currentPhase;
            this.state.phaseStats[phase].questionsAsked++;
            if (correct) {
                this.state.phaseStats[phase].correctAnswers++;
            }
            this.saveState();
        }

        /**
         * Get recommended next phase based on learner state
         */
        getRecommendedNextPhase(learnerState) {
            // Analyze current state
            const {
                recentAccuracy,
                currentMastery,
                frustrationLevel,
                timeInPhase,
                questionsThisPhase
            } = learnerState;

            const current = this.currentPhase;

            // Phase transition rules
            if (current === 'engage') {
                // Always move to explore after engage
                return 'explore';
            }

            if (current === 'explore') {
                if (recentAccuracy < 0.5 && questionsThisPhase >= 3) {
                    // Struggling - move to explain
                    return 'explain';
                }
                if (recentAccuracy >= 0.8 && questionsThisPhase >= 5) {
                    // Ready to elaborate
                    return 'elaborate';
                }
                // Stay in explore
                return 'explore';
            }

            if (current === 'explain') {
                // After explanation, return to explore or elaborate
                if (currentMastery >= 0.6) {
                    return 'elaborate';
                }
                return 'explore';
            }

            if (current === 'elaborate') {
                if (recentAccuracy < 0.4) {
                    // Struggling with transfer - back to explain
                    return 'explain';
                }
                if (recentAccuracy >= 0.75 && questionsThisPhase >= 3) {
                    // Ready for evaluation
                    return 'evaluate';
                }
                return 'elaborate';
            }

            if (current === 'evaluate') {
                if (currentMastery >= 0.9) {
                    // Mastered - new topic (engage)
                    return 'engage';
                }
                if (currentMastery < 0.6) {
                    // Not ready - back to explore
                    return 'explore';
                }
                // Continue elaboration
                return 'elaborate';
            }

            return 'explore';
        }

        /**
         * Get encounter types for a phase
         */
        getEncounterTypesForPhase(phase) {
            return Object.entries(ENCOUNTER_PHASE_MAP)
                .filter(([type, config]) => config.phase === phase)
                .map(([type, config]) => ({
                    type,
                    ...config
                }));
        }

        /**
         * Get phase statistics
         */
        getPhaseStats() {
            const stats = {};

            Object.entries(this.state.phaseStats).forEach(([phase, data]) => {
                stats[phase] = {
                    ...data,
                    accuracy: data.questionsAsked > 0
                        ? data.correctAnswers / data.questionsAsked
                        : 0,
                    phaseInfo: FIVE_E_PHASES[phase.toUpperCase()]
                };
            });

            return {
                phases: stats,
                completedCycles: this.state.phaseCycles,
                currentCycleProgress: this.state.currentCycleProgress,
                currentPhase: this.currentPhase,
                sessionPhaseCount: this.state.sessionPhases.length
            };
        }

        // =========================================================================
        // CYCLE 2: PHASE-AWARE QUESTION SELECTION
        // =========================================================================

        /**
         * Question Selection Policies
         */
        static QUESTION_POLICIES = {
            // ENGAGE policies
            accessible_hook: {
                id: 'accessible_hook',
                description: 'Easy entry point to activate interest',
                difficultyRange: [0.3, 0.5],
                preferredTypes: ['hook', 'curiosity', 'real_world'],
                avoidTypes: ['integration', 'clinical_complex'],
                penaltyOverride: 0
            },

            prior_knowledge_probe: {
                id: 'prior_knowledge_probe',
                description: 'Check existing understanding',
                difficultyRange: [0.2, 0.6],
                preferredTypes: ['basic', 'definition', 'recall'],
                avoidTypes: ['application', 'synthesis'],
                penaltyOverride: 0
            },

            // EXPLORE policies
            zpd_matched: {
                id: 'zpd_matched',
                description: 'Match Zone of Proximal Development',
                difficultyRange: 'dynamic', // Based on learner state
                preferredTypes: ['mechanism', 'concept', 'comparison'],
                avoidTypes: [],
                penaltyOverride: null
            },

            variety_within_topic: {
                id: 'variety_within_topic',
                description: 'Sample different aspects of topic',
                difficultyRange: [0.4, 0.7],
                preferredTypes: ['varied'],
                avoidTypes: ['repetitive'],
                penaltyOverride: null
            },

            broad_sampling: {
                id: 'broad_sampling',
                description: 'Wide exploration across subtopics',
                difficultyRange: [0.3, 0.6],
                preferredTypes: ['survey', 'breadth'],
                avoidTypes: ['deep', 'integration'],
                penaltyOverride: 0.5
            },

            // EXPLAIN policies
            scaffolded_sequence: {
                id: 'scaffolded_sequence',
                description: 'Step-by-step building understanding',
                difficultyRange: [0.2, 0.5],
                preferredTypes: ['scaffold', 'sequence', 'prerequisite'],
                avoidTypes: ['integration', 'transfer'],
                penaltyOverride: 0
            },

            prerequisite_chain: {
                id: 'prerequisite_chain',
                description: 'Follow prerequisite dependencies',
                difficultyRange: [0.3, 0.6],
                preferredTypes: ['foundational', 'building_block'],
                avoidTypes: ['advanced', 'synthesis'],
                penaltyOverride: 0
            },

            mechanism_trace: {
                id: 'mechanism_trace',
                description: 'Detailed walkthrough of how something works',
                difficultyRange: [0.4, 0.6],
                preferredTypes: ['mechanism', 'process', 'step_by_step'],
                avoidTypes: ['memorization', 'trivia'],
                penaltyOverride: 0
            },

            // ELABORATE policies
            transfer_context: {
                id: 'transfer_context',
                description: 'Apply knowledge to new situations',
                difficultyRange: [0.6, 0.9],
                preferredTypes: ['application', 'transfer', 'novel_context'],
                avoidTypes: ['recall', 'definition'],
                penaltyOverride: 1.25
            },

            integration_synthesis: {
                id: 'integration_synthesis',
                description: 'Combine multiple concepts',
                difficultyRange: [0.7, 0.95],
                preferredTypes: ['integration', 'synthesis', 'comparison'],
                avoidTypes: ['isolated', 'single_concept'],
                penaltyOverride: 1.5
            },

            clinical_transfer: {
                id: 'clinical_transfer',
                description: 'Real-world clinical application',
                difficultyRange: [0.6, 0.85],
                preferredTypes: ['clinical', 'case_study', 'patient'],
                avoidTypes: ['abstract', 'theoretical'],
                penaltyOverride: 1.25
            },

            // EVALUATE policies
            mastery_check: {
                id: 'mastery_check',
                description: 'Verify deep understanding',
                difficultyRange: [0.5, 0.8],
                preferredTypes: ['assessment', 'comprehensive'],
                avoidTypes: ['trick', 'edge_case'],
                penaltyOverride: 0
            },

            prerequisite_gate: {
                id: 'prerequisite_gate',
                description: 'Check readiness for next content',
                difficultyRange: [0.4, 0.7],
                preferredTypes: ['gateway', 'prerequisite_check'],
                avoidTypes: ['tangential'],
                penaltyOverride: 0
            },

            comprehensive_assessment: {
                id: 'comprehensive_assessment',
                description: 'Full topic coverage check',
                difficultyRange: [0.5, 0.85],
                preferredTypes: ['comprehensive', 'sampling'],
                avoidTypes: ['narrow'],
                penaltyOverride: 1.0
            },

            growth_comparison: {
                id: 'growth_comparison',
                description: 'Questions to show progress',
                difficultyRange: 'historical', // Based on past attempts
                preferredTypes: ['previously_missed', 'growth_marker'],
                avoidTypes: ['new'],
                penaltyOverride: 0
            }
        };

        /**
         * Select questions based on phase and policy
         */
        selectQuestionsForPhase(encounterType, questionPool, learnerState, count = 1) {
            const config = this.getEncounterConfig(encounterType);
            const policy = PhaseLockedEncountersEngine.QUESTION_POLICIES[config.questionPolicy];

            if (!policy) {
                return this.defaultSelection(questionPool, count);
            }

            // Filter by difficulty range
            let candidates = this.filterByDifficulty(
                questionPool,
                policy.difficultyRange,
                learnerState
            );

            // Filter by preferred types
            if (policy.preferredTypes.length > 0 && !policy.preferredTypes.includes('varied')) {
                const typeFiltered = candidates.filter(q =>
                    policy.preferredTypes.some(t =>
                        (q.type || '').toLowerCase().includes(t) ||
                        (q.tags || []).some(tag => tag.toLowerCase().includes(t))
                    )
                );
                if (typeFiltered.length >= count) {
                    candidates = typeFiltered;
                }
            }

            // Avoid certain types
            if (policy.avoidTypes.length > 0) {
                candidates = candidates.filter(q =>
                    !policy.avoidTypes.some(t =>
                        (q.type || '').toLowerCase().includes(t) ||
                        (q.tags || []).some(tag => tag.toLowerCase().includes(t))
                    )
                );
            }

            // Score and rank candidates
            const scored = this.scoreQuestions(candidates, policy, learnerState);

            // Select top candidates
            const selected = scored
                .sort((a, b) => b.score - a.score)
                .slice(0, count)
                .map(s => ({
                    ...s.question,
                    selectionScore: s.score,
                    selectionReason: s.reason,
                    phaseContext: {
                        phase: config.phase,
                        policy: policy.id,
                        penaltyMultiplier: policy.penaltyOverride !== null
                            ? policy.penaltyOverride
                            : config.penaltyMultiplier
                    }
                }));

            return selected;
        }

        /**
         * Filter questions by difficulty range
         */
        filterByDifficulty(questionPool, difficultyRange, learnerState) {
            if (difficultyRange === 'dynamic') {
                // ZPD-based: slightly above current mastery
                const targetMin = Math.max(0.2, learnerState.currentMastery - 0.1);
                const targetMax = Math.min(0.9, learnerState.currentMastery + 0.2);
                return questionPool.filter(q => {
                    const diff = q.difficulty || 0.5;
                    return diff >= targetMin && diff <= targetMax;
                });
            }

            if (difficultyRange === 'historical') {
                // Select from previously attempted questions
                return questionPool.filter(q =>
                    learnerState.previouslyAttempted?.includes(q.id)
                );
            }

            const [minDiff, maxDiff] = difficultyRange;
            return questionPool.filter(q => {
                const diff = q.difficulty || 0.5;
                return diff >= minDiff && diff <= maxDiff;
            });
        }

        /**
         * Score questions for selection
         */
        scoreQuestions(questions, policy, learnerState) {
            return questions.map(question => {
                let score = 50; // Base score
                let reasons = [];

                // ZPD bonus
                const diff = question.difficulty || 0.5;
                const zpdDistance = Math.abs(diff - (learnerState.currentMastery + 0.1));
                const zpdBonus = Math.max(0, 20 - zpdDistance * 40);
                score += zpdBonus;
                if (zpdBonus > 10) reasons.push('ZPD match');

                // Freshness bonus (not recently seen)
                const lastSeen = learnerState.lastSeen?.[question.id];
                if (!lastSeen) {
                    score += 15;
                    reasons.push('Fresh question');
                } else {
                    const hoursSinceSeen = (Date.now() - lastSeen) / (1000 * 60 * 60);
                    if (hoursSinceSeen > 24) {
                        score += 10;
                        reasons.push('Spaced review');
                    }
                }

                // Concept coverage bonus
                if (learnerState.weakConcepts?.includes(question.concept)) {
                    score += 15;
                    reasons.push('Targets weakness');
                }

                // Policy preference bonus
                if (policy.preferredTypes.some(t =>
                    (question.type || '').includes(t) ||
                    (question.tags || []).includes(t)
                )) {
                    score += 10;
                    reasons.push('Policy preferred');
                }

                // Randomness for variety
                score += Math.random() * 10;

                return {
                    question,
                    score,
                    reason: reasons.join(', ') || 'Standard selection'
                };
            });
        }

        /**
         * Default selection when no policy applies
         */
        defaultSelection(questionPool, count) {
            const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count).map(q => ({
                ...q,
                phaseContext: {
                    phase: this.currentPhase,
                    policy: 'default',
                    penaltyMultiplier: 1.0
                }
            }));
        }

        /**
         * Get phase-appropriate intro message
         */
        getPhaseIntroMessage(encounterType) {
            const config = this.getEncounterConfig(encounterType);
            return config.msLuminaraIntro;
        }

        /**
         * Get phase-appropriate feedback message
         */
        getPhaseFeedbackMessage(encounterType, correct, firstTry) {
            const config = this.getEncounterConfig(encounterType);
            const phase = config.phase;

            const feedbackTemplates = {
                engage: {
                    correct: [
                        'Good starting point! Let\'s build on that.',
                        'Your intuition serves you well.',
                        'Excellent foundation to work from.'
                    ],
                    incorrect: [
                        'Interesting! Let\'s explore why that\'s not quite right.',
                        'No worries - this is just to see where we\'re starting.',
                        'That\'s a common first thought. Let me show you another way.'
                    ]
                },
                explore: {
                    correct: [
                        'Discovery! You\'re finding your way.',
                        'Each correct step maps the territory.',
                        'Your exploration is paying off.'
                    ],
                    incorrect: [
                        'Part of the journey. What does this teach us?',
                        'Every wrong path illuminates the right one.',
                        'Exploration means finding what doesn\'t work too.'
                    ]
                },
                explain: {
                    correct: [
                        'The understanding is forming.',
                        'You\'re building a clear picture.',
                        'The mechanism clicks into place.'
                    ],
                    incorrect: [
                        'Let\'s look at this another way...',
                        'Here\'s what\'s really happening...',
                        'The explanation reveals itself step by step.'
                    ]
                },
                elaborate: {
                    correct: [
                        'Excellent transfer! Your knowledge is flexible.',
                        'You can apply this in new contexts.',
                        'Deep understanding shows in application.'
                    ],
                    incorrect: [
                        'Application is where true understanding is tested.',
                        'This context requires adaptation. Let\'s see how.',
                        'Transfer takes practice. The core knowledge is there.'
                    ]
                },
                evaluate: {
                    correct: [
                        'Your mastery is confirmed.',
                        'You truly understand this.',
                        'Assessment reveals your growth.'
                    ],
                    incorrect: [
                        'This shows where to focus next.',
                        'Evaluation is diagnostic, not punitive.',
                        'Every assessment reveals the path forward.'
                    ]
                }
            };

            const templates = feedbackTemplates[phase] || feedbackTemplates.explore;
            const category = correct ? 'correct' : 'incorrect';

            return templates[category][Math.floor(Math.random() * templates[category].length)];
        }

        /**
         * Get penalty modifier for current phase
         */
        getPenaltyModifier(encounterType) {
            const config = this.getEncounterConfig(encounterType);
            return config.penaltyMultiplier;
        }

        /**
         * Recommend phase transition
         */
        recommendTransition(learnerState) {
            const recommended = this.getRecommendedNextPhase(learnerState);
            const encounterTypes = this.getEncounterTypesForPhase(recommended);

            return {
                recommendedPhase: recommended,
                phaseInfo: FIVE_E_PHASES[recommended.toUpperCase()],
                suggestedEncounters: encounterTypes,
                reason: this.getTransitionReason(this.currentPhase, recommended, learnerState)
            };
        }

        /**
         * Get reason for phase transition
         */
        getTransitionReason(from, to, learnerState) {
            const transitions = {
                'engage-explore': 'Curiosity activated. Time to explore.',
                'explore-explain': 'Patterns emerging that need explanation.',
                'explore-elaborate': 'Strong foundation. Ready to apply.',
                'explain-explore': 'Understanding forming. Practice more.',
                'explain-elaborate': 'Clarity achieved. Time to transfer.',
                'elaborate-explain': 'Transfer struggling. Revisit foundations.',
                'elaborate-evaluate': 'Application successful. Check mastery.',
                'evaluate-engage': 'Mastery achieved. New topic awaits.',
                'evaluate-explore': 'Gaps identified. More practice needed.',
                'evaluate-elaborate': 'Close to mastery. Continue application.'
            };

            return transitions[`${from}-${to}`] || 'Natural progression through learning.';
        }

        /**
         * Get session summary
         */
        getSessionSummary() {
            const phaseSequence = this.state.sessionPhases.map(p => p.phase);
            const phaseCounts = {};
            phaseSequence.forEach(p => {
                phaseCounts[p] = (phaseCounts[p] || 0) + 1;
            });

            return {
                totalEncounters: this.state.sessionPhases.length,
                phaseCounts,
                phaseSequence,
                cyclesCompleted: this.state.phaseCycles,
                dominantPhase: Object.entries(phaseCounts)
                    .sort((a, b) => b[1] - a[1])[0]?.[0],
                balance: this.calculatePhaseBalance(phaseCounts)
            };
        }

        /**
         * Calculate how balanced the session was across phases
         */
        calculatePhaseBalance(phaseCounts) {
            const total = Object.values(phaseCounts).reduce((sum, c) => sum + c, 0);
            if (total === 0) return 0;

            const expected = total / 5;
            const variance = Object.values(phaseCounts).reduce((sum, count) => {
                return sum + Math.pow(count - expected, 2);
            }, 0) / 5;

            // Lower variance = more balanced = higher score
            return Math.max(0, 1 - Math.sqrt(variance) / expected);
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Hook into encounter system
     */
    function onEncounterStart(encounterType) {
        const engine = window.phaseLockedEncounters;
        if (!engine) return null;
        return engine.startEncounter(encounterType);
    }

    /**
     * Get questions for an encounter
     */
    function selectQuestionsForEncounter(encounterType, questionPool, learnerState, count) {
        const engine = window.phaseLockedEncounters;
        if (!engine) return questionPool.slice(0, count);
        return engine.selectQuestionsForPhase(encounterType, questionPool, learnerState, count);
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.phaseLockedEncounters = new PhaseLockedEncountersEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            PhaseLockedEncountersEngine,
            FIVE_E_PHASES,
            ENCOUNTER_PHASE_MAP,
            onEncounterStart,
            selectQuestionsForEncounter
        };
    }

    console.log('[Phase-Locked Encounters] Initialized - 5E model active');

})();
