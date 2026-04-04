/**
 * @file 820.31.53-emotional-weather.js
 * @codon 820.31.53
 * @version 2026-03-29
 * @brief Emotional Weather System - Adaptive Response to Learner State
 *
 * TAIDRGEF Signature: R.F.G.T.E
 * - R (React): System reacts to emotional signals
 * - F (Frame): Emotions frame the learning experience
 * - G (Gravitate): Content gravitates to emotional needs
 * - T (Transform): Pedagogy transforms based on state
 * - E (Emit): System emits appropriate interventions
 *
 * Cycle 1: Emotional detection from behavioral signals
 * Cycle 2: Response system and 5E phase adaptation
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: EMOTIONAL DETECTION FROM BEHAVIORAL SIGNALS
    // =========================================================================

    /**
     * Emotional States - Core emotions tracked
     */
    const EMOTIONAL_STATES = {
        CURIOUS: {
            id: 'curious',
            name: 'Curious',
            description: 'Open and interested, baseline state',
            weatherMetaphor: 'Clear skies',
            color: '#60A5FA',
            optimalFor: ['engage', 'explore'],
            pedagogicalNeeds: ['variety', 'challenge']
        },

        ENGAGED: {
            id: 'engaged',
            name: 'Engaged',
            description: 'Actively focused and flowing',
            weatherMetaphor: 'Sunny and warm',
            color: '#34D399',
            optimalFor: ['explore', 'elaborate'],
            pedagogicalNeeds: ['momentum', 'progression']
        },

        FRUSTRATED: {
            id: 'frustrated',
            name: 'Frustrated',
            description: 'Struggling, potentially giving up',
            weatherMetaphor: 'Storm clouds gathering',
            color: '#F87171',
            optimalFor: ['explain'],
            pedagogicalNeeds: ['scaffolding', 'simplification', 'encouragement']
        },

        BORED: {
            id: 'bored',
            name: 'Bored',
            description: 'Understimulated, not challenged enough',
            weatherMetaphor: 'Doldrums',
            color: '#A3A3A3',
            optimalFor: ['engage', 'elaborate'],
            pedagogicalNeeds: ['challenge', 'novelty', 'difficulty_increase']
        },

        ANXIOUS: {
            id: 'anxious',
            name: 'Anxious',
            description: 'Worried about performance, stressed',
            weatherMetaphor: 'Choppy seas',
            color: '#FBBF24',
            optimalFor: ['explore'],
            pedagogicalNeeds: ['safe_practice', 'reduced_stakes', 'encouragement']
        },

        CONFIDENT: {
            id: 'confident',
            name: 'Confident',
            description: 'Secure in knowledge, ready for challenge',
            weatherMetaphor: 'Fair winds',
            color: '#A78BFA',
            optimalFor: ['evaluate', 'elaborate'],
            pedagogicalNeeds: ['mastery_challenge', 'integration']
        },

        CONFUSED: {
            id: 'confused',
            name: 'Confused',
            description: 'Lost, needs guidance not more practice',
            weatherMetaphor: 'Fog rolling in',
            color: '#FB923C',
            optimalFor: ['explain'],
            pedagogicalNeeds: ['mechanism_walkthrough', 'scaffolding', 'prerequisites']
        },

        TRIUMPHANT: {
            id: 'triumphant',
            name: 'Triumphant',
            description: 'Just achieved something significant',
            weatherMetaphor: 'Rainbow after storm',
            color: '#EC4899',
            optimalFor: ['evaluate', 'engage'],
            pedagogicalNeeds: ['celebration', 'new_challenge']
        },

        FATIGUED: {
            id: 'fatigued',
            name: 'Fatigued',
            description: 'Tired, reduced cognitive capacity',
            weatherMetaphor: 'Evening settling in',
            color: '#6B7280',
            optimalFor: ['explain'],
            pedagogicalNeeds: ['rest', 'review', 'end_session']
        }
    };

    /**
     * Behavioral Signals - Observables that indicate emotional state
     */
    const BEHAVIORAL_SIGNALS = {
        // Answer timing
        FAST_WRONG: {
            id: 'fast_wrong',
            description: 'Quick wrong answers',
            threshold: { responseTime: '<3s', correct: false },
            weight: { frustrated: 0.4, anxious: 0.2, confused: 0.2 }
        },

        SLOW_CORRECT: {
            id: 'slow_correct',
            description: 'Slow but correct',
            threshold: { responseTime: '>30s', correct: true },
            weight: { confused: 0.2, anxious: 0.3, curious: 0.2 }
        },

        FAST_CORRECT: {
            id: 'fast_correct',
            description: 'Quick correct answers',
            threshold: { responseTime: '<10s', correct: true },
            weight: { confident: 0.4, engaged: 0.3, bored: 0.1 }
        },

        HESITATION: {
            id: 'hesitation',
            description: 'Long pause before answering',
            threshold: { responseTime: '>45s' },
            weight: { anxious: 0.3, confused: 0.3, fatigued: 0.2 }
        },

        // Answer patterns
        STREAK_CORRECT: {
            id: 'streak_correct',
            description: '5+ correct in a row',
            threshold: { correctStreak: '>5' },
            weight: { confident: 0.5, engaged: 0.3, bored: 0.1 }
        },

        STREAK_WRONG: {
            id: 'streak_wrong',
            description: '3+ wrong in a row',
            threshold: { wrongStreak: '>3' },
            weight: { frustrated: 0.5, confused: 0.3, anxious: 0.2 }
        },

        SAME_MISTAKE: {
            id: 'same_mistake',
            description: 'Same type of error repeated',
            threshold: { repeatedError: true },
            weight: { confused: 0.5, frustrated: 0.3 }
        },

        NEAR_MISS: {
            id: 'near_miss',
            description: 'Close but not quite right',
            threshold: { nearMiss: true },
            weight: { curious: 0.2, engaged: 0.3, frustrated: 0.2 }
        },

        // Session patterns
        LONG_SESSION: {
            id: 'long_session',
            description: 'Extended time in session',
            threshold: { sessionDuration: '>45min' },
            weight: { engaged: 0.3, fatigued: 0.4 }
        },

        QUICK_EXIT: {
            id: 'quick_exit',
            description: 'Leaving session early',
            threshold: { sessionDuration: '<5min', questionsAnswered: '<3' },
            weight: { bored: 0.3, frustrated: 0.3, anxious: 0.2 }
        },

        // Engagement patterns
        SKIPPING: {
            id: 'skipping',
            description: 'Skipping questions',
            threshold: { skippedQuestions: '>2' },
            weight: { frustrated: 0.3, bored: 0.2, anxious: 0.3 }
        },

        HINT_SEEKING: {
            id: 'hint_seeking',
            description: 'Frequently using hints',
            threshold: { hintsUsed: '>3' },
            weight: { anxious: 0.3, confused: 0.3 }
        },

        EXPLANATION_DWELLING: {
            id: 'explanation_dwelling',
            description: 'Spending time on explanations',
            threshold: { explanationReadTime: '>30s' },
            weight: { curious: 0.4, engaged: 0.3 }
        },

        // Breakthrough signals
        BREAKTHROUGH: {
            id: 'breakthrough',
            description: 'Correct after multiple attempts',
            threshold: { correctAfterStruggle: true },
            weight: { triumphant: 0.6, engaged: 0.2, curious: 0.2 }
        },

        MASTERY_ACHIEVED: {
            id: 'mastery_achieved',
            description: 'Reached mastery tier',
            threshold: { masteryAchieved: true },
            weight: { triumphant: 0.5, confident: 0.4 }
        }
    };

    /**
     * Emotional Weather Engine
     */
    class EmotionalWeatherEngine {
        constructor() {
            this.state = this.loadState();
            this.signalHistory = [];
            this.currentWeather = this.calculateCurrentWeather();
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('emotionalWeather');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                currentState: 'curious',
                emotionScores: {
                    curious: 0.5,
                    engaged: 0.2,
                    frustrated: 0,
                    bored: 0,
                    anxious: 0.1,
                    confident: 0.2,
                    confused: 0,
                    triumphant: 0,
                    fatigued: 0
                },
                sessionSignals: [],
                weatherHistory: [],
                interventionsTriggered: 0,
                lastUpdate: Date.now(),
                sessionStart: Date.now(),
                questionsThisSession: 0,
                correctThisSession: 0,
                streakCorrect: 0,
                streakWrong: 0,
                lastResponseTime: null,
                statistics: {
                    totalSessionTime: 0,
                    emotionShifts: 0,
                    mostCommonState: 'curious',
                    interventionsEffective: 0
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('emotionalWeather', JSON.stringify(this.state));
        }

        /**
         * Process a behavioral signal
         */
        processSignal(signalId, data = {}) {
            const signal = BEHAVIORAL_SIGNALS[signalId.toUpperCase()];
            if (!signal) return null;

            // Record signal
            this.signalHistory.push({
                signalId,
                data,
                timestamp: Date.now()
            });

            // Apply weights to emotion scores
            Object.entries(signal.weight).forEach(([emotion, weight]) => {
                const currentScore = this.state.emotionScores[emotion] || 0;
                // Blend with existing score (70% current, 30% new signal)
                this.state.emotionScores[emotion] = currentScore * 0.7 + weight * 0.3;
            });

            // Normalize scores
            this.normalizeScores();

            // Update current state
            const oldState = this.state.currentState;
            this.state.currentState = this.getDominantEmotion();
            this.state.lastUpdate = Date.now();

            // Track emotion shifts
            if (oldState !== this.state.currentState) {
                this.state.statistics.emotionShifts++;
                this.state.weatherHistory.push({
                    from: oldState,
                    to: this.state.currentState,
                    trigger: signalId,
                    timestamp: Date.now()
                });
            }

            this.saveState();

            return {
                signalProcessed: signalId,
                emotionScores: { ...this.state.emotionScores },
                currentState: this.state.currentState,
                stateChanged: oldState !== this.state.currentState,
                previousState: oldState
            };
        }

        /**
         * Process answer for signals
         */
        processAnswer(isCorrect, responseTimeMs, questionData = {}) {
            const signals = [];

            // Update session counters
            this.state.questionsThisSession++;
            if (isCorrect) {
                this.state.correctThisSession++;
                this.state.streakCorrect++;
                this.state.streakWrong = 0;
            } else {
                this.state.streakWrong++;
                this.state.streakCorrect = 0;
            }

            this.state.lastResponseTime = responseTimeMs;

            // Detect timing signals
            if (responseTimeMs < 3000 && !isCorrect) {
                signals.push(this.processSignal('FAST_WRONG', { responseTimeMs }));
            }
            if (responseTimeMs > 30000 && isCorrect) {
                signals.push(this.processSignal('SLOW_CORRECT', { responseTimeMs }));
            }
            if (responseTimeMs < 10000 && isCorrect) {
                signals.push(this.processSignal('FAST_CORRECT', { responseTimeMs }));
            }
            if (responseTimeMs > 45000) {
                signals.push(this.processSignal('HESITATION', { responseTimeMs }));
            }

            // Detect streak signals
            if (this.state.streakCorrect >= 5) {
                signals.push(this.processSignal('STREAK_CORRECT'));
            }
            if (this.state.streakWrong >= 3) {
                signals.push(this.processSignal('STREAK_WRONG'));
            }

            // Detect breakthrough
            if (isCorrect && questionData.previouslyMissed) {
                signals.push(this.processSignal('BREAKTHROUGH'));
            }

            // Detect same mistake
            if (!isCorrect && questionData.sameErrorBefore) {
                signals.push(this.processSignal('SAME_MISTAKE'));
            }

            // Detect near miss
            if (!isCorrect && questionData.nearMiss) {
                signals.push(this.processSignal('NEAR_MISS'));
            }

            return {
                signals: signals.filter(s => s !== null),
                currentWeather: this.getCurrentWeather(),
                recommendations: this.getRecommendations()
            };
        }

        /**
         * Process session event
         */
        processSessionEvent(eventType, data = {}) {
            switch (eventType) {
                case 'hint_used':
                    return this.processSignal('HINT_SEEKING');

                case 'question_skipped':
                    return this.processSignal('SKIPPING');

                case 'explanation_read':
                    if (data.readTimeMs > 30000) {
                        return this.processSignal('EXPLANATION_DWELLING', data);
                    }
                    break;

                case 'mastery_achieved':
                    return this.processSignal('MASTERY_ACHIEVED');

                case 'session_long':
                    return this.processSignal('LONG_SESSION');

                case 'session_exit_early':
                    return this.processSignal('QUICK_EXIT');
            }

            return null;
        }

        /**
         * Normalize emotion scores to sum to 1
         */
        normalizeScores() {
            const total = Object.values(this.state.emotionScores).reduce((sum, v) => sum + v, 0);
            if (total > 0) {
                Object.keys(this.state.emotionScores).forEach(emotion => {
                    this.state.emotionScores[emotion] /= total;
                });
            }
        }

        /**
         * Get dominant emotion
         */
        getDominantEmotion() {
            let maxScore = 0;
            let dominant = 'curious';

            Object.entries(this.state.emotionScores).forEach(([emotion, score]) => {
                if (score > maxScore) {
                    maxScore = score;
                    dominant = emotion;
                }
            });

            return dominant;
        }

        /**
         * Get current weather (full state)
         */
        getCurrentWeather() {
            const state = EMOTIONAL_STATES[this.state.currentState.toUpperCase()];
            const scores = { ...this.state.emotionScores };

            // Sort by score
            const rankedEmotions = Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([emotion, score]) => ({
                    emotion,
                    score,
                    info: EMOTIONAL_STATES[emotion.toUpperCase()]
                }));

            return {
                primary: this.state.currentState,
                primaryInfo: state,
                scores,
                ranked: rankedEmotions,
                weatherMetaphor: state.weatherMetaphor,
                color: state.color,
                optimalPhases: state.optimalFor,
                needs: state.pedagogicalNeeds
            };
        }

        /**
         * Calculate current weather (internal)
         */
        calculateCurrentWeather() {
            return this.getCurrentWeather();
        }

        // =========================================================================
        // CYCLE 2: RESPONSE SYSTEM AND 5E PHASE ADAPTATION
        // =========================================================================

        /**
         * 5E Phase Prescriptions by Emotion
         */
        static PHASE_PRESCRIPTIONS = {
            curious: {
                recommendedPhase: 'explore',
                alternativePhase: 'engage',
                avoid: null,
                reason: 'Curiosity is ideal for exploration'
            },
            engaged: {
                recommendedPhase: 'explore',
                alternativePhase: 'elaborate',
                avoid: 'explain',
                reason: 'Keep the momentum going with exploration or challenge'
            },
            frustrated: {
                recommendedPhase: 'explain',
                alternativePhase: null,
                avoid: 'elaborate',
                reason: 'Needs scaffolding and support, not more challenge'
            },
            bored: {
                recommendedPhase: 'elaborate',
                alternativePhase: 'engage',
                avoid: 'explain',
                reason: 'Needs challenge or novelty, not basic explanation'
            },
            anxious: {
                recommendedPhase: 'explore',
                alternativePhase: 'explain',
                avoid: 'evaluate',
                reason: 'Needs safe practice without high stakes'
            },
            confident: {
                recommendedPhase: 'evaluate',
                alternativePhase: 'elaborate',
                avoid: 'engage',
                reason: 'Ready for mastery assessment or deep application'
            },
            confused: {
                recommendedPhase: 'explain',
                alternativePhase: null,
                avoid: 'explore',
                reason: 'More practice won\'t help - needs mechanism walkthrough'
            },
            triumphant: {
                recommendedPhase: 'engage',
                alternativePhase: 'evaluate',
                avoid: null,
                reason: 'Celebrate then start fresh challenge or confirm mastery'
            },
            fatigued: {
                recommendedPhase: 'explain',
                alternativePhase: null,
                avoid: 'elaborate',
                reason: 'Light review or end session - reduced capacity'
            }
        };

        /**
         * Ms. Luminara Weather Messages
         */
        static WEATHER_MESSAGES = {
            curious: [
                'Clear skies ahead. Let\'s see what\'s out there.',
                'Your curiosity lights the way.',
                'Perfect conditions for discovery.'
            ],
            engaged: [
                'You\'re in the flow. Let\'s keep moving.',
                'Sunny skies - everything is clicking.',
                'This is what learning feels like.'
            ],
            frustrated: [
                'Storm clouds gathering. Let me light a fire.',
                'I see you struggling. That\'s okay - let\'s slow down.',
                'The clouds will pass. Let me help you through.'
            ],
            bored: [
                'Doldrums setting in. Time for uncharted waters.',
                'You need a stronger wind. Let\'s find a challenge.',
                'Too calm? Let\'s stir things up.'
            ],
            anxious: [
                'Choppy seas. Let\'s find calmer harbor.',
                'I sense some worry. This is a safe space to practice.',
                'No storms here - just gentle practice.'
            ],
            confident: [
                'Fair winds. Push further out.',
                'Your confidence is earned. Let\'s test your mastery.',
                'Strong winds at your back. Time to sail far.'
            ],
            confused: [
                'Fog rolling in. Stay close - I\'ll guide you.',
                'Lost in the mist? Let me show you the path.',
                'The fog clears with understanding. Let\'s find clarity.'
            ],
            triumphant: [
                'Rainbow after the storm! You\'ve earned this.',
                'Victory! Take a moment to feel this.',
                'The clouds part and sunlight floods in.'
            ],
            fatigued: [
                'Evening settling in. Perhaps time to rest.',
                'Your mind needs recovery. Consider stopping here.',
                'Even sailors need to dock. Good work today.'
            ]
        };

        /**
         * Get phase recommendation based on current weather
         */
        getPhaseRecommendation() {
            const currentState = this.state.currentState;
            const prescription = EmotionalWeatherEngine.PHASE_PRESCRIPTIONS[currentState];

            if (!prescription) {
                return {
                    phase: 'explore',
                    reason: 'Default exploration phase',
                    avoid: null
                };
            }

            return {
                phase: prescription.recommendedPhase,
                alternative: prescription.alternativePhase,
                avoid: prescription.avoid,
                reason: prescription.reason,
                emotionalState: currentState,
                message: this.getWeatherMessage()
            };
        }

        /**
         * Get appropriate weather message
         */
        getWeatherMessage() {
            const currentState = this.state.currentState;
            const messages = EmotionalWeatherEngine.WEATHER_MESSAGES[currentState];

            if (!messages || messages.length === 0) {
                return 'The weather changes...';
            }

            return messages[Math.floor(Math.random() * messages.length)];
        }

        /**
         * Get pedagogical recommendations
         */
        getRecommendations() {
            const weather = this.getCurrentWeather();
            const needs = weather.needs || [];
            const recommendations = [];

            needs.forEach(need => {
                switch (need) {
                    case 'scaffolding':
                        recommendations.push({
                            type: 'content',
                            action: 'trigger_scaffold',
                            description: 'Provide step-by-step support'
                        });
                        break;
                    case 'simplification':
                        recommendations.push({
                            type: 'difficulty',
                            action: 'decrease_difficulty',
                            description: 'Reduce question difficulty'
                        });
                        break;
                    case 'encouragement':
                        recommendations.push({
                            type: 'message',
                            action: 'send_encouragement',
                            description: 'Provide encouraging feedback'
                        });
                        break;
                    case 'challenge':
                        recommendations.push({
                            type: 'difficulty',
                            action: 'increase_difficulty',
                            description: 'Increase question difficulty'
                        });
                        break;
                    case 'novelty':
                        recommendations.push({
                            type: 'content',
                            action: 'introduce_new_topic',
                            description: 'Switch to a fresh topic'
                        });
                        break;
                    case 'safe_practice':
                        recommendations.push({
                            type: 'mode',
                            action: 'reduce_stakes',
                            description: 'Remove penalties temporarily'
                        });
                        break;
                    case 'mechanism_walkthrough':
                        recommendations.push({
                            type: 'content',
                            action: 'show_mechanism',
                            description: 'Explain the underlying mechanism'
                        });
                        break;
                    case 'celebration':
                        recommendations.push({
                            type: 'message',
                            action: 'celebrate_achievement',
                            description: 'Acknowledge the victory'
                        });
                        break;
                    case 'rest':
                        recommendations.push({
                            type: 'session',
                            action: 'suggest_break',
                            description: 'Suggest taking a break'
                        });
                        break;
                    case 'end_session':
                        recommendations.push({
                            type: 'session',
                            action: 'suggest_end',
                            description: 'Suggest ending the session'
                        });
                        break;
                    case 'mastery_challenge':
                        recommendations.push({
                            type: 'content',
                            action: 'boss_question',
                            description: 'Present a mastery challenge'
                        });
                        break;
                    case 'integration':
                        recommendations.push({
                            type: 'content',
                            action: 'integration_question',
                            description: 'Present synthesis question'
                        });
                        break;
                }
            });

            return recommendations;
        }

        /**
         * Get intervention for current state
         */
        getIntervention() {
            const recommendations = this.getRecommendations();
            const phaseRec = this.getPhaseRecommendation();

            this.state.interventionsTriggered++;
            this.saveState();

            return {
                weather: this.getCurrentWeather(),
                phaseRecommendation: phaseRec,
                recommendations,
                message: this.getWeatherMessage(),
                interventionCount: this.state.interventionsTriggered
            };
        }

        /**
         * Adjust difficulty based on weather
         */
        getDifficultyAdjustment() {
            const state = this.state.currentState;

            const adjustments = {
                frustrated: -0.2,
                confused: -0.15,
                anxious: -0.1,
                fatigued: -0.15,
                bored: 0.15,
                confident: 0.1,
                engaged: 0.05,
                curious: 0,
                triumphant: 0.1
            };

            return adjustments[state] || 0;
        }

        /**
         * Get timeout adjustment (slower for struggling students)
         */
        getTimeoutAdjustment() {
            const state = this.state.currentState;

            const adjustments = {
                anxious: 1.5,    // 50% more time
                confused: 1.3,
                frustrated: 1.2,
                fatigued: 1.3,
                confident: 0.9,  // Slightly less time
                bored: 0.85,
                curious: 1.0,
                engaged: 1.0,
                triumphant: 1.0
            };

            return adjustments[state] || 1.0;
        }

        /**
         * Check if should trigger intervention
         */
        shouldIntervene() {
            const thresholds = {
                frustrated: 0.35,
                confused: 0.35,
                anxious: 0.40,
                fatigued: 0.30,
                bored: 0.40
            };

            for (const [emotion, threshold] of Object.entries(thresholds)) {
                if (this.state.emotionScores[emotion] >= threshold) {
                    return {
                        shouldIntervene: true,
                        reason: emotion,
                        score: this.state.emotionScores[emotion]
                    };
                }
            }

            return { shouldIntervene: false };
        }

        /**
         * Report intervention effectiveness
         */
        reportInterventionResult(wasEffective) {
            if (wasEffective) {
                this.state.statistics.interventionsEffective++;
            }
            this.saveState();
        }

        /**
         * Get session summary
         */
        getSessionSummary() {
            const sessionDuration = Date.now() - this.state.sessionStart;
            const accuracy = this.state.questionsThisSession > 0
                ? this.state.correctThisSession / this.state.questionsThisSession
                : 0;

            // Find most common state
            const stateTime = {};
            this.state.weatherHistory.forEach((entry, index) => {
                const nextEntry = this.state.weatherHistory[index + 1];
                const duration = nextEntry
                    ? nextEntry.timestamp - entry.timestamp
                    : Date.now() - entry.timestamp;
                stateTime[entry.to] = (stateTime[entry.to] || 0) + duration;
            });

            const mostCommon = Object.entries(stateTime)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || this.state.currentState;

            return {
                duration: sessionDuration,
                durationMinutes: Math.round(sessionDuration / 60000),
                questionsAnswered: this.state.questionsThisSession,
                accuracy: Math.round(accuracy * 100),
                emotionShifts: this.state.weatherHistory.length,
                mostCommonState: mostCommon,
                finalState: this.state.currentState,
                interventionsTriggered: this.state.interventionsTriggered,
                weatherJourney: this.state.weatherHistory.slice(-10)
            };
        }

        /**
         * Reset session (for new session)
         */
        resetSession() {
            // Save session stats
            this.state.statistics.totalSessionTime += Date.now() - this.state.sessionStart;

            // Reset session-specific state
            this.state.sessionStart = Date.now();
            this.state.questionsThisSession = 0;
            this.state.correctThisSession = 0;
            this.state.streakCorrect = 0;
            this.state.streakWrong = 0;
            this.state.weatherHistory = [];
            this.state.interventionsTriggered = 0;

            // Reset to baseline emotional state
            this.state.emotionScores = {
                curious: 0.5,
                engaged: 0.2,
                frustrated: 0,
                bored: 0,
                anxious: 0.1,
                confident: 0.2,
                confused: 0,
                triumphant: 0,
                fatigued: 0
            };
            this.state.currentState = 'curious';

            this.saveState();
        }

        /**
         * Get full statistics
         */
        getStatistics() {
            return {
                ...this.state.statistics,
                currentState: this.state.currentState,
                sessionDuration: Date.now() - this.state.sessionStart,
                emotionScores: { ...this.state.emotionScores }
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Process answer and get weather update
     */
    function onAnswerProcessed(isCorrect, responseTimeMs, questionData) {
        const engine = window.emotionalWeather;
        if (!engine) return null;
        return engine.processAnswer(isCorrect, responseTimeMs, questionData);
    }

    /**
     * Get current weather state
     */
    function getWeather() {
        const engine = window.emotionalWeather;
        if (!engine) return null;
        return engine.getCurrentWeather();
    }

    /**
     * Check if intervention needed
     */
    function checkIntervention() {
        const engine = window.emotionalWeather;
        if (!engine) return { shouldIntervene: false };
        return engine.shouldIntervene();
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.emotionalWeather = new EmotionalWeatherEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            EmotionalWeatherEngine,
            EMOTIONAL_STATES,
            BEHAVIORAL_SIGNALS,
            onAnswerProcessed,
            getWeather,
            checkIntervention
        };
    }

    console.log('[Emotional Weather] Initialized - Weather tracking active');

})();
