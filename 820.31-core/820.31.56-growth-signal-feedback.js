/**
 * @file 820.31.56-growth-signal-feedback.js
 * @codon 820.31.56
 * @version 2026-03-29
 * @brief Growth Signal Feedback - Visible Learning Contribution System
 *
 * TAIDRGEF Signature: E.A.G.T.R
 * - E (Emit): Struggles emit growth signals
 * - A (Aggregate): Population data aggregates
 * - G (Gravitate): Content gravitates to confusion zones
 * - T (Transform): Feedback transforms into improvements
 * - R (React): System reacts to learning patterns
 *
 * Cycle 1: Signal tracking - Monitor and categorize growth signals
 * Cycle 2: Feedback UI - Show learners how their struggles help others
 *
 * Based on Growth Signal Protocol (340.60):
 * "Every struggle is a signal. Every confusion is a coordinate."
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: SIGNAL TRACKING - MONITOR AND CATEGORIZE GROWTH SIGNALS
    // =========================================================================

    /**
     * Signal Types - Categories of growth signals
     */
    const SIGNAL_TYPES = {
        NEED_MORE_CONTENT: {
            id: 'need_more_content',
            name: 'Need More Content',
            description: 'High confusion rate indicates need for more practice material',
            threshold: { confusionRate: 0.4, minAttempts: 10 },
            icon: 'plus-circle',
            color: '#3B82F6',
            learnerMessage: 'Many struggled here. We\'re creating more practice questions.'
        },

        NEED_DIFFERENTIATION: {
            id: 'need_differentiation',
            name: 'Need Differentiation',
            description: 'Some explanation styles work, others don\'t',
            threshold: { varianceInSuccess: 0.3, minAttempts: 20 },
            icon: 'git-branch',
            color: '#8B5CF6',
            learnerMessage: 'Different learners need different approaches. We\'re diversifying.'
        },

        NEED_SCAFFOLD_DEPTH: {
            id: 'need_scaffold_depth',
            name: 'Need Scaffold Depth',
            description: 'Scaffolding isn\'t detailed enough',
            threshold: { scaffoldFailRate: 0.3, minScaffolds: 5 },
            icon: 'layers',
            color: '#F59E0B',
            learnerMessage: 'This needs more stepping stones. We\'re building them.'
        },

        CONCEPT_MASTERED: {
            id: 'concept_mastered',
            name: 'Concept Mastered',
            description: 'Population has generally mastered this concept',
            threshold: { masteryRate: 0.8, minAttempts: 50 },
            icon: 'check-circle',
            color: '#10B981',
            learnerMessage: 'This is well-understood now. We\'re moving the frontier forward.'
        },

        MISCONCEPTION_CLUSTER: {
            id: 'misconception_cluster',
            name: 'Misconception Cluster',
            description: 'Same wrong answer is attracting many learners',
            threshold: { distractorRate: 0.3, minAttempts: 15 },
            icon: 'alert-triangle',
            color: '#EF4444',
            learnerMessage: 'A common misconception emerged. We\'re creating targeted content.'
        },

        PREREQUISITE_GAP: {
            id: 'prerequisite_gap',
            name: 'Prerequisite Gap',
            description: 'Many failing due to missing prerequisite knowledge',
            threshold: { prereqCorrelation: 0.5, minAttempts: 20 },
            icon: 'link',
            color: '#EC4899',
            learnerMessage: 'A gap in the learning path was found. We\'re bridging it.'
        },

        REPRESENTATION_WEAKNESS: {
            id: 'representation_weakness',
            name: 'Representation Weakness',
            description: 'One representation type is consistently harder',
            threshold: { repVariance: 0.25, minPerRep: 10 },
            icon: 'bar-chart',
            color: '#6366F1',
            learnerMessage: 'Some question formats are harder. We\'re improving support.'
        },

        ENGAGEMENT_DROP: {
            id: 'engagement_drop',
            name: 'Engagement Drop',
            description: 'Learners are abandoning at this point',
            threshold: { abandonRate: 0.2, minStarts: 10 },
            icon: 'trending-down',
            color: '#DC2626',
            learnerMessage: 'This is where many pause. We\'re making it more engaging.'
        }
    };

    /**
     * Contribution Types - How learners contribute to the system
     */
    const CONTRIBUTION_TYPES = {
        CONFUSION_DATA: {
            id: 'confusion_data',
            name: 'Confusion Data',
            description: 'Your struggles identify problem areas',
            value: 5,
            icon: 'help-circle'
        },
        MASTERY_DATA: {
            id: 'mastery_data',
            name: 'Mastery Data',
            description: 'Your success helps calibrate difficulty',
            value: 3,
            icon: 'award'
        },
        DISTRACTOR_DATA: {
            id: 'distractor_data',
            name: 'Distractor Data',
            description: 'Your choices reveal attractive misconceptions',
            value: 4,
            icon: 'target'
        },
        TIMING_DATA: {
            id: 'timing_data',
            name: 'Timing Data',
            description: 'Your pace helps optimize question flow',
            value: 2,
            icon: 'clock'
        },
        PATH_DATA: {
            id: 'path_data',
            name: 'Path Data',
            description: 'Your learning path informs prerequisites',
            value: 6,
            icon: 'map'
        }
    };

    /**
     * Growth Signal Feedback Engine
     */
    class GrowthSignalFeedbackEngine {
        constructor() {
            this.state = this.loadState();
            this.activeSignals = [];
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('growthSignalFeedback');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                // Per-question tracking
                questionData: {},        // questionId -> { attempts, correct, distractorCounts, etc. }
                // Per-concept tracking
                conceptData: {},         // conceptId -> aggregated data
                // User contribution tracking
                userContributions: {
                    totalContributions: 0,
                    byType: {},           // contributionType -> count
                    signalsGenerated: 0,
                    questionsImproved: 0
                },
                // Signal history
                signalHistory: [],       // Active and historical signals
                // Population data (mock in local, real from server)
                populationData: {
                    totalLearners: 1,    // Start with self
                    confusionHotspots: [],
                    masteryZones: [],
                    lastUpdated: null
                },
                // Badges earned
                badges: [],
                statistics: {
                    dataPointsContributed: 0,
                    signalsTriggered: 0,
                    improvementsSuggested: 0
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('growthSignalFeedback', JSON.stringify(this.state));
        }

        /**
         * Record a question attempt
         */
        recordAttempt(questionId, conceptId, data) {
            // Initialize question data if needed
            if (!this.state.questionData[questionId]) {
                this.state.questionData[questionId] = {
                    questionId,
                    conceptId,
                    attempts: 0,
                    correct: 0,
                    distractorCounts: {},
                    responseTimes: [],
                    scaffoldsTriggered: 0,
                    scaffoldsCompleted: 0,
                    firstSeen: Date.now(),
                    lastSeen: null
                };
            }

            const qData = this.state.questionData[questionId];
            qData.attempts++;
            qData.lastSeen = Date.now();

            if (data.correct) {
                qData.correct++;
                this.recordContribution('mastery_data');
            } else {
                // Track distractor choice
                if (data.selectedDistractor) {
                    qData.distractorCounts[data.selectedDistractor] =
                        (qData.distractorCounts[data.selectedDistractor] || 0) + 1;
                    this.recordContribution('distractor_data');
                }
                this.recordContribution('confusion_data');
            }

            // Track response time
            if (data.responseTime) {
                qData.responseTimes.push(data.responseTime);
                this.recordContribution('timing_data');
            }

            // Track scaffold usage
            if (data.scaffoldTriggered) {
                qData.scaffoldsTriggered++;
            }
            if (data.scaffoldCompleted) {
                qData.scaffoldsCompleted++;
            }

            // Update concept data
            this.updateConceptData(conceptId, data);

            // Check for signals
            const signals = this.checkSignals(questionId, conceptId);

            this.saveState();

            return {
                recorded: true,
                contributions: this.getRecentContributions(),
                newSignals: signals,
                totalContributions: this.state.userContributions.totalContributions
            };
        }

        /**
         * Record a contribution
         */
        recordContribution(contributionType) {
            const contrib = CONTRIBUTION_TYPES[contributionType.toUpperCase()];
            if (!contrib) return;

            this.state.userContributions.totalContributions += contrib.value;
            this.state.userContributions.byType[contrib.id] =
                (this.state.userContributions.byType[contrib.id] || 0) + 1;
            this.state.statistics.dataPointsContributed++;
        }

        /**
         * Update aggregated concept data
         */
        updateConceptData(conceptId, attemptData) {
            if (!this.state.conceptData[conceptId]) {
                this.state.conceptData[conceptId] = {
                    conceptId,
                    totalAttempts: 0,
                    totalCorrect: 0,
                    byRepresentation: {},
                    scaffoldUsage: 0,
                    abandonCount: 0,
                    avgResponseTime: 0,
                    responseTimes: []
                };
            }

            const cData = this.state.conceptData[conceptId];
            cData.totalAttempts++;

            if (attemptData.correct) {
                cData.totalCorrect++;
            }

            // Track by representation
            if (attemptData.representation) {
                if (!cData.byRepresentation[attemptData.representation]) {
                    cData.byRepresentation[attemptData.representation] = {
                        attempts: 0,
                        correct: 0
                    };
                }
                cData.byRepresentation[attemptData.representation].attempts++;
                if (attemptData.correct) {
                    cData.byRepresentation[attemptData.representation].correct++;
                }
            }

            // Track scaffold usage
            if (attemptData.scaffoldTriggered) {
                cData.scaffoldUsage++;
            }

            // Track response times
            if (attemptData.responseTime) {
                cData.responseTimes.push(attemptData.responseTime);
                cData.avgResponseTime = cData.responseTimes.reduce((a, b) => a + b, 0)
                    / cData.responseTimes.length;
            }

            // Record path data
            this.recordContribution('path_data');
        }

        /**
         * Check if any signals should be triggered
         */
        checkSignals(questionId, conceptId) {
            const triggeredSignals = [];
            const qData = this.state.questionData[questionId];
            const cData = this.state.conceptData[conceptId];

            // Check each signal type
            Object.entries(SIGNAL_TYPES).forEach(([signalId, signal]) => {
                if (this.shouldTriggerSignal(signal, qData, cData)) {
                    const signalEvent = this.triggerSignal(signalId, questionId, conceptId);
                    if (signalEvent) {
                        triggeredSignals.push(signalEvent);
                    }
                }
            });

            return triggeredSignals;
        }

        /**
         * Check if a signal should be triggered
         */
        shouldTriggerSignal(signal, qData, cData) {
            const threshold = signal.threshold;

            // Already triggered recently?
            const recentSignal = this.state.signalHistory.find(s =>
                s.type === signal.id &&
                s.questionId === qData.questionId &&
                Date.now() - s.timestamp < 3600000 // Within last hour
            );
            if (recentSignal) return false;

            // Check thresholds
            if (threshold.confusionRate !== undefined) {
                if (qData.attempts < (threshold.minAttempts || 10)) return false;
                const confusionRate = 1 - (qData.correct / qData.attempts);
                if (confusionRate < threshold.confusionRate) return false;
            }

            if (threshold.masteryRate !== undefined) {
                if (qData.attempts < (threshold.minAttempts || 50)) return false;
                const masteryRate = qData.correct / qData.attempts;
                if (masteryRate < threshold.masteryRate) return false;
            }

            if (threshold.distractorRate !== undefined) {
                if (qData.attempts < (threshold.minAttempts || 15)) return false;
                const maxDistractor = Math.max(...Object.values(qData.distractorCounts), 0);
                const distractorRate = maxDistractor / qData.attempts;
                if (distractorRate < threshold.distractorRate) return false;
            }

            if (threshold.scaffoldFailRate !== undefined) {
                if (qData.scaffoldsTriggered < (threshold.minScaffolds || 5)) return false;
                const failRate = 1 - (qData.scaffoldsCompleted / qData.scaffoldsTriggered);
                if (failRate < threshold.scaffoldFailRate) return false;
            }

            if (threshold.repVariance !== undefined && cData) {
                const reps = Object.values(cData.byRepresentation);
                if (reps.length < 2) return false;
                const accuracies = reps.map(r => r.correct / Math.max(1, r.attempts));
                const variance = this.calculateVariance(accuracies);
                if (variance < threshold.repVariance) return false;
            }

            return true;
        }

        /**
         * Calculate variance of an array
         */
        calculateVariance(arr) {
            if (arr.length < 2) return 0;
            const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
            const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
            return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
        }

        /**
         * Trigger a signal
         */
        triggerSignal(signalId, questionId, conceptId) {
            const signal = SIGNAL_TYPES[signalId.toUpperCase()];
            if (!signal) return null;

            const signalEvent = {
                id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: signal.id,
                name: signal.name,
                questionId,
                conceptId,
                timestamp: Date.now(),
                status: 'active',
                learnerMessage: signal.learnerMessage,
                contributorCount: 1  // Would be from population data
            };

            this.state.signalHistory.unshift(signalEvent);
            if (this.state.signalHistory.length > 100) {
                this.state.signalHistory.pop();
            }

            this.state.userContributions.signalsGenerated++;
            this.state.statistics.signalsTriggered++;
            this.activeSignals.push(signalEvent);

            this.saveState();

            return signalEvent;
        }

        /**
         * Get recent contributions summary
         */
        getRecentContributions() {
            const byType = this.state.userContributions.byType;
            return Object.entries(byType).map(([typeId, count]) => {
                const type = CONTRIBUTION_TYPES[typeId.toUpperCase()];
                return {
                    type: typeId,
                    name: type?.name || typeId,
                    count,
                    icon: type?.icon || 'circle'
                };
            });
        }

        // =========================================================================
        // CYCLE 2: FEEDBACK UI - SHOW LEARNERS HOW STRUGGLES HELP OTHERS
        // =========================================================================

        /**
         * Get visible signal for display
         */
        getVisibleSignal(questionId) {
            // Find most recent relevant signal
            const signal = this.state.signalHistory.find(s =>
                s.questionId === questionId && s.status === 'active'
            );

            if (!signal) return null;

            const signalType = SIGNAL_TYPES[signal.type.toUpperCase()];

            return {
                ...signal,
                icon: signalType?.icon,
                color: signalType?.color,
                displayMessage: this.formatSignalMessage(signal)
            };
        }

        /**
         * Format signal message for display
         */
        formatSignalMessage(signal) {
            const type = SIGNAL_TYPES[signal.type.toUpperCase()];
            if (!type) return signal.learnerMessage;

            // Add contribution context
            const contributorText = signal.contributorCount > 1
                ? `You and ${signal.contributorCount - 1} others`
                : 'Your contribution';

            return {
                header: 'YOUR STRUGGLE IS HELPING OTHERS',
                body: type.learnerMessage,
                contributorText,
                signalType: type.name,
                status: signal.status
            };
        }

        /**
         * Get contribution counter display
         */
        getContributionCounter() {
            const contributions = this.state.userContributions;

            return {
                total: contributions.totalContributions,
                signalsGenerated: contributions.signalsGenerated,
                questionsImproved: contributions.questionsImproved,
                breakdown: this.getRecentContributions(),
                message: this.generateContributionMessage()
            };
        }

        /**
         * Generate contribution message
         */
        generateContributionMessage() {
            const total = this.state.userContributions.totalContributions;

            if (total >= 1000) {
                return 'You are a pillar of the learning community. Thousands of data points contributed!';
            }
            if (total >= 500) {
                return 'Your contributions have helped shape content for many learners.';
            }
            if (total >= 100) {
                return 'Your struggles have improved ' + Math.floor(total / 20) + ' questions.';
            }
            if (total >= 20) {
                return 'Your learning data is helping improve the system.';
            }
            return 'Every question you answer contributes to better learning for everyone.';
        }

        /**
         * Get active signals summary
         */
        getActiveSignals() {
            return this.state.signalHistory
                .filter(s => s.status === 'active')
                .slice(0, 5)
                .map(signal => {
                    const type = SIGNAL_TYPES[signal.type.toUpperCase()];
                    return {
                        ...signal,
                        icon: type?.icon,
                        color: type?.color,
                        typeName: type?.name
                    };
                });
        }

        /**
         * Get population statistics display
         */
        getPopulationStats() {
            // In production, this would come from server
            // For now, generate representative mock data
            return {
                totalLearners: this.state.populationData.totalLearners,
                confusionHotspots: this.getConfusionHotspots(),
                masteryZones: this.getMasteryZones(),
                yourContributionRank: this.calculateContributionRank(),
                collectiveProgress: this.calculateCollectiveProgress()
            };
        }

        /**
         * Get confusion hotspots (areas where many struggle)
         */
        getConfusionHotspots() {
            const hotspots = [];

            Object.entries(this.state.questionData).forEach(([qId, qData]) => {
                if (qData.attempts >= 5) {
                    const confusionRate = 1 - (qData.correct / qData.attempts);
                    if (confusionRate >= 0.4) {
                        hotspots.push({
                            questionId: qId,
                            conceptId: qData.conceptId,
                            confusionRate: Math.round(confusionRate * 100),
                            attempts: qData.attempts
                        });
                    }
                }
            });

            return hotspots.sort((a, b) => b.confusionRate - a.confusionRate).slice(0, 5);
        }

        /**
         * Get mastery zones (areas where learning is successful)
         */
        getMasteryZones() {
            const zones = [];

            Object.entries(this.state.conceptData).forEach(([cId, cData]) => {
                if (cData.totalAttempts >= 10) {
                    const masteryRate = cData.totalCorrect / cData.totalAttempts;
                    if (masteryRate >= 0.75) {
                        zones.push({
                            conceptId: cId,
                            masteryRate: Math.round(masteryRate * 100),
                            attempts: cData.totalAttempts
                        });
                    }
                }
            });

            return zones.sort((a, b) => b.masteryRate - a.masteryRate).slice(0, 5);
        }

        /**
         * Calculate contribution rank
         */
        calculateContributionRank() {
            // Mock ranking - in production would compare to population
            const total = this.state.userContributions.totalContributions;

            if (total >= 500) return 'Top Contributor';
            if (total >= 200) return 'Active Contributor';
            if (total >= 50) return 'Regular Contributor';
            if (total >= 10) return 'New Contributor';
            return 'Observer';
        }

        /**
         * Calculate collective progress
         */
        calculateCollectiveProgress() {
            const concepts = Object.values(this.state.conceptData);
            if (concepts.length === 0) return 0;

            const totalMastery = concepts.reduce((sum, c) => {
                return sum + (c.totalCorrect / Math.max(1, c.totalAttempts));
            }, 0);

            return Math.round((totalMastery / concepts.length) * 100);
        }

        /**
         * Get living system visualization data
         */
        getLivingSystemView() {
            return {
                you: {
                    role: 'Cell in the learning organism',
                    contributions: this.state.userContributions.totalContributions,
                    signalsEmitted: this.state.userContributions.signalsGenerated
                },
                system: {
                    totalCells: this.state.populationData.totalLearners,
                    activeSignals: this.getActiveSignals().length,
                    hotspots: this.getConfusionHotspots().length,
                    masteryZones: this.getMasteryZones().length
                },
                metaphor: {
                    struggles: 'signals for growth',
                    mastery: 'feeds the collective knowledge',
                    evolution: 'the system evolves because of your participation'
                }
            };
        }

        /**
         * Check for badges
         */
        checkBadges() {
            const newBadges = [];
            const contributions = this.state.userContributions;

            const potentialBadges = [
                {
                    id: 'first_contribution',
                    name: 'First Contribution',
                    condition: contributions.totalContributions >= 1,
                    description: 'Made your first contribution to the learning system'
                },
                {
                    id: 'signal_generator',
                    name: 'Signal Generator',
                    condition: contributions.signalsGenerated >= 1,
                    description: 'Your struggle generated a growth signal'
                },
                {
                    id: 'data_donor_50',
                    name: 'Data Donor',
                    condition: contributions.totalContributions >= 50,
                    description: 'Contributed 50+ data points'
                },
                {
                    id: 'data_donor_200',
                    name: 'Data Champion',
                    condition: contributions.totalContributions >= 200,
                    description: 'Contributed 200+ data points'
                },
                {
                    id: 'signal_master',
                    name: 'Signal Master',
                    condition: contributions.signalsGenerated >= 5,
                    description: 'Generated 5 growth signals'
                },
                {
                    id: 'all_contribution_types',
                    name: 'Diverse Contributor',
                    condition: Object.keys(contributions.byType).length >= 4,
                    description: 'Contributed data in multiple categories'
                }
            ];

            potentialBadges.forEach(badge => {
                if (badge.condition && !this.state.badges.includes(badge.id)) {
                    this.state.badges.push(badge.id);
                    newBadges.push(badge);
                }
            });

            if (newBadges.length > 0) {
                this.saveState();
            }

            return newBadges;
        }

        /**
         * Get statistics
         */
        getStatistics() {
            return {
                ...this.state.statistics,
                contributions: this.state.userContributions,
                activeSignals: this.getActiveSignals().length,
                badges: this.state.badges,
                rank: this.calculateContributionRank()
            };
        }

        /**
         * Get summary for session end
         */
        getSessionSummary() {
            return {
                dataPointsThisSession: this.state.statistics.dataPointsContributed,
                signalsTriggered: this.state.statistics.signalsTriggered,
                contributionRank: this.calculateContributionRank(),
                message: this.generateContributionMessage(),
                topContributionType: Object.entries(this.state.userContributions.byType)
                    .sort((a, b) => b[1] - a[1])[0]?.[0],
                newBadges: this.checkBadges()
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Record a question attempt
     */
    function onQuestionAnswered(questionId, conceptId, data) {
        const engine = window.growthSignalFeedback;
        if (!engine) return null;
        return engine.recordAttempt(questionId, conceptId, data);
    }

    /**
     * Get visible signal for display
     */
    function getSignalForQuestion(questionId) {
        const engine = window.growthSignalFeedback;
        if (!engine) return null;
        return engine.getVisibleSignal(questionId);
    }

    /**
     * Get contribution counter
     */
    function getContributions() {
        const engine = window.growthSignalFeedback;
        if (!engine) return null;
        return engine.getContributionCounter();
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.growthSignalFeedback = new GrowthSignalFeedbackEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            GrowthSignalFeedbackEngine,
            SIGNAL_TYPES,
            CONTRIBUTION_TYPES,
            onQuestionAnswered,
            getSignalForQuestion,
            getContributions
        };
    }

    console.log('[Growth Signal Feedback] Initialized - Contribution tracking active');

})();
