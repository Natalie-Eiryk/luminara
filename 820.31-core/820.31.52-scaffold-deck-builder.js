/**
 * @file 820.31.52-scaffold-deck-builder.js
 * @codon 820.31.52
 * @version 2026-03-29
 * @brief Scaffold Deck Builder - Metacognitive Strategy Cards
 *
 * TAIDRGEF Signature: F.A.T.G.E
 * - F (Frame): Cards frame learning strategies
 * - A (Aggregate): Deck aggregates metacognitive tools
 * - T (Transform): Cards transform through use
 * - G (Gravitate): Strategies gravitate to learning style
 * - E (Emit): Mastered cards emit power bonuses
 *
 * Cycle 1: Card system - Learning strategy cards by 5E phase
 * Cycle 2: Deck management - Building and using strategy decks
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: CARD SYSTEM - LEARNING STRATEGY CARDS BY 5E PHASE
    // =========================================================================

    /**
     * Card Rarities
     */
    const CARD_RARITIES = {
        COMMON: {
            id: 'common',
            name: 'Common',
            color: '#9CA3AF',
            powerMultiplier: 1.0,
            upgradeXPRequired: 100
        },
        UNCOMMON: {
            id: 'uncommon',
            name: 'Uncommon',
            color: '#10B981',
            powerMultiplier: 1.25,
            upgradeXPRequired: 250
        },
        RARE: {
            id: 'rare',
            name: 'Rare',
            color: '#3B82F6',
            powerMultiplier: 1.5,
            upgradeXPRequired: 500
        },
        EPIC: {
            id: 'epic',
            name: 'Epic',
            color: '#8B5CF6',
            powerMultiplier: 2.0,
            upgradeXPRequired: 1000
        },
        LEGENDARY: {
            id: 'legendary',
            name: 'Legendary',
            color: '#F59E0B',
            powerMultiplier: 3.0,
            upgradeXPRequired: null // Cannot upgrade further
        }
    };

    /**
     * Strategy Cards by 5E Phase
     */
    const STRATEGY_CARDS = {
        // ========== ENGAGE CARDS (Hook Strategies) ==========
        PRIOR_KNOWLEDGE_PROBE: {
            id: 'prior_knowledge_probe',
            name: 'Prior Knowledge Probe',
            phase: 'engage',
            description: 'Before diving in, recall what you already know about this topic',
            instruction: 'Take 10 seconds to write or think: "What do I already know about [topic]?"',
            effect: {
                type: 'mastery_boost',
                condition: 'first_question_of_topic',
                value: 0.1
            },
            rarity: 'common',
            unlockCondition: null // Starter card
        },

        REAL_WORLD_CONNECTION: {
            id: 'real_world_connection',
            name: 'Real-World Connection',
            phase: 'engage',
            description: 'Link new learning to lived experience',
            instruction: 'Ask: "When have I seen this in my life or heard about it?"',
            effect: {
                type: 'retention_boost',
                condition: 'new_topic',
                value: 0.15
            },
            rarity: 'common',
            unlockCondition: null
        },

        CURIOSITY_SPARK: {
            id: 'curiosity_spark',
            name: 'Curiosity Spark',
            phase: 'engage',
            description: 'Generate a question you want answered',
            instruction: 'Before starting, write down one thing you want to understand by the end',
            effect: {
                type: 'curiosity_points_boost',
                condition: 'start_of_session',
                value: 1.25
            },
            rarity: 'uncommon',
            unlockCondition: { completedTopics: 3 }
        },

        HOOK_FINDER: {
            id: 'hook_finder',
            name: 'Hook Finder',
            phase: 'engage',
            description: 'Find the interesting angle in any topic',
            instruction: 'Ask: "What\'s the most surprising or counterintuitive thing about this?"',
            effect: {
                type: 'engagement_boost',
                condition: 'any',
                value: 0.2
            },
            rarity: 'rare',
            unlockCondition: { engagePhaseQuestions: 50 }
        },

        // ========== EXPLORE CARDS (Investigation Strategies) ==========
        SYSTEMATIC_ELIMINATION: {
            id: 'systematic_elimination',
            name: 'Systematic Elimination',
            phase: 'explore',
            description: 'Cross off wrong answers methodically',
            instruction: 'Before choosing, eliminate options you\'re sure are wrong. Explain why each is wrong.',
            effect: {
                type: 'accuracy_boost',
                condition: 'multiple_choice',
                value: 0.1
            },
            rarity: 'common',
            unlockCondition: null
        },

        PATTERN_RECOGNITION: {
            id: 'pattern_recognition',
            name: 'Pattern Recognition',
            phase: 'explore',
            description: 'Compare to similar questions you\'ve seen',
            instruction: 'Ask: "Is this like a question I\'ve answered before? What worked then?"',
            effect: {
                type: 'streak_protection',
                condition: 'similar_question',
                value: 1
            },
            rarity: 'common',
            unlockCondition: null
        },

        ACTIVE_RECALL: {
            id: 'active_recall',
            name: 'Active Recall',
            phase: 'explore',
            description: 'Attempt answer before seeing options',
            instruction: 'Cover the options. What answer comes to mind? Then check.',
            effect: {
                type: 'memory_strength',
                condition: 'any',
                value: 0.2
            },
            rarity: 'uncommon',
            unlockCondition: { correctAnswers: 25 }
        },

        HYPOTHESIS_TESTING: {
            id: 'hypothesis_testing',
            name: 'Hypothesis Testing',
            phase: 'explore',
            description: 'Treat each question as an experiment',
            instruction: 'Predict: "I think it\'s X because Y." Then test your prediction.',
            effect: {
                type: 'learning_rate_boost',
                condition: 'wrong_answer',
                value: 0.25
            },
            rarity: 'rare',
            unlockCondition: { hypothesesTested: 20 }
        },

        CHUNKING_MASTER: {
            id: 'chunking_master',
            name: 'Chunking Master',
            phase: 'explore',
            description: 'Break complex questions into smaller parts',
            instruction: 'Identify the components: What is being asked? What facts are needed? What connections?',
            effect: {
                type: 'difficulty_reduction',
                condition: 'hard_question',
                value: 0.2
            },
            rarity: 'epic',
            unlockCondition: { hardQuestionsCorrect: 30 }
        },

        // ========== EXPLAIN CARDS (Understanding Strategies) ==========
        MECHANISM_TRACE: {
            id: 'mechanism_trace',
            name: 'Mechanism Trace',
            phase: 'explain',
            description: 'Walk through step-by-step',
            instruction: 'Trace the mechanism: First A happens, then B, then C. Follow the chain.',
            effect: {
                type: 'scaffold_bonus',
                condition: 'mechanism_question',
                value: 0.15
            },
            rarity: 'common',
            unlockCondition: null
        },

        ANALOGY_BRIDGE: {
            id: 'analogy_bridge',
            name: 'Analogy Bridge',
            phase: 'explain',
            description: 'Connect to a familiar concept',
            instruction: 'Ask: "What is this like? What familiar thing works the same way?"',
            effect: {
                type: 'understanding_boost',
                condition: 'new_concept',
                value: 0.2
            },
            rarity: 'common',
            unlockCondition: null
        },

        VISUAL_MAPPING: {
            id: 'visual_mapping',
            name: 'Visual Mapping',
            phase: 'explain',
            description: 'Create a mental diagram',
            instruction: 'Picture it: Draw or imagine the concept. Where are the parts? How do they connect?',
            effect: {
                type: 'representation_bonus',
                condition: 'graphical_possible',
                value: 0.15
            },
            rarity: 'uncommon',
            unlockCondition: { scaffoldsCompleted: 10 }
        },

        FEYNMAN_TECHNIQUE: {
            id: 'feynman_technique',
            name: 'Feynman Technique',
            phase: 'explain',
            description: 'Explain it like you\'re teaching someone else',
            instruction: 'Imagine explaining this to a friend who knows nothing. Use simple words.',
            effect: {
                type: 'mastery_boost',
                condition: 'any',
                value: 0.25
            },
            rarity: 'rare',
            unlockCondition: { teachBackAttempts: 15 }
        },

        SOCRATIC_QUESTIONING: {
            id: 'socratic_questioning',
            name: 'Socratic Questioning',
            phase: 'explain',
            description: 'Question your own understanding',
            instruction: 'Ask: Why? How? What if? Keep questioning until you reach bedrock.',
            effect: {
                type: 'depth_bonus',
                condition: 'complex_topic',
                value: 0.3
            },
            rarity: 'epic',
            unlockCondition: { explainPhaseDepth: 50 }
        },

        // ========== ELABORATE CARDS (Application Strategies) ==========
        CONTEXT_SHIFT: {
            id: 'context_shift',
            name: 'Context Shift',
            phase: 'elaborate',
            description: 'Apply to a new situation',
            instruction: 'Ask: "Where else does this apply? What if the context changed?"',
            effect: {
                type: 'transfer_boost',
                condition: 'application_question',
                value: 0.15
            },
            rarity: 'common',
            unlockCondition: null
        },

        WHAT_IF_EXPLORER: {
            id: 'what_if_explorer',
            name: 'What If? Explorer',
            phase: 'elaborate',
            description: 'Explore variations',
            instruction: 'Ask: "What if this changed? What would happen? What would stay the same?"',
            effect: {
                type: 'flexibility_boost',
                condition: 'variation_question',
                value: 0.2
            },
            rarity: 'common',
            unlockCondition: null
        },

        TEACH_BACK: {
            id: 'teach_back',
            name: 'Teach Back',
            phase: 'elaborate',
            description: 'Explain to an imaginary student',
            instruction: 'Pretend you\'re teaching this. What questions might they ask? How would you answer?',
            effect: {
                type: 'consolidation_boost',
                condition: 'mastery_check',
                value: 0.25
            },
            rarity: 'uncommon',
            unlockCondition: { teachBackAttempts: 5 }
        },

        CLINICAL_THINKER: {
            id: 'clinical_thinker',
            name: 'Clinical Thinker',
            phase: 'elaborate',
            description: 'Apply to patient scenarios',
            instruction: 'Ask: "How would this present in a patient? What would I do?"',
            effect: {
                type: 'clinical_bonus',
                condition: 'clinical_question',
                value: 0.2
            },
            rarity: 'rare',
            unlockCondition: { clinicalQuestionsCorrect: 20 }
        },

        SYNTHESIS_WEAVER: {
            id: 'synthesis_weaver',
            name: 'Synthesis Weaver',
            phase: 'elaborate',
            description: 'Weave multiple concepts together',
            instruction: 'Find the thread that connects multiple ideas. How do they work together?',
            effect: {
                type: 'integration_boost',
                condition: 'integration_question',
                value: 0.35
            },
            rarity: 'epic',
            unlockCondition: { connectionsFound: 25 }
        },

        // ========== EVALUATE CARDS (Assessment Strategies) ==========
        CONFIDENCE_CHECK: {
            id: 'confidence_check',
            name: 'Confidence Check',
            phase: 'evaluate',
            description: 'Rate your certainty before and after',
            instruction: 'Before answering: How sure are you (1-10)? After: Were you calibrated?',
            effect: {
                type: 'calibration_tracking',
                condition: 'any',
                value: 0.1
            },
            rarity: 'common',
            unlockCondition: null
        },

        KNOWLEDGE_AUDIT: {
            id: 'knowledge_audit',
            name: 'Knowledge Audit',
            phase: 'evaluate',
            description: 'Map what you know vs. don\'t know',
            instruction: 'Divide the topic: What am I confident about? What am I uncertain about?',
            effect: {
                type: 'targeted_review',
                condition: 'end_of_topic',
                value: 0.2
            },
            rarity: 'common',
            unlockCondition: null
        },

        GROWTH_REFLECTION: {
            id: 'growth_reflection',
            name: 'Growth Reflection',
            phase: 'evaluate',
            description: 'Compare current to past self',
            instruction: 'Ask: "What can I do now that I couldn\'t before? How has my understanding changed?"',
            effect: {
                type: 'motivation_boost',
                condition: 'end_of_session',
                value: 0.15
            },
            rarity: 'uncommon',
            unlockCondition: { sessionsCompleted: 10 }
        },

        ERROR_ANALYST: {
            id: 'error_analyst',
            name: 'Error Analyst',
            phase: 'evaluate',
            description: 'Study your mistakes for patterns',
            instruction: 'Review wrong answers: What type of mistake? Is there a pattern? What tricked me?',
            effect: {
                type: 'error_reduction',
                condition: 'review_mode',
                value: 0.25
            },
            rarity: 'rare',
            unlockCondition: { errorsAnalyzed: 30 }
        },

        META_MASTER: {
            id: 'meta_master',
            name: 'Meta-Master',
            phase: 'evaluate',
            description: 'Reflect on your learning process',
            instruction: 'Ask: "How am I learning? What strategies work? What should I change?"',
            effect: {
                type: 'global_learning_boost',
                condition: 'any',
                value: 0.4
            },
            rarity: 'legendary',
            unlockCondition: { allPhasesBalanced: true }
        }
    };

    /**
     * Scaffold Deck Builder Engine
     */
    class ScaffoldDeckBuilderEngine {
        constructor() {
            this.state = this.loadState();
            this.initializeStarterDeck();
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('scaffoldDeckBuilder');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                collection: {},          // cardId -> card instance data
                deck: [],                // Active deck card IDs
                maxDeckSize: 10,
                cardXP: {},              // cardId -> XP accumulated
                activeCard: null,        // Currently played card
                cardUsageHistory: [],    // Usage tracking
                unlockedCards: [],       // Unlocked but not yet collected
                statistics: {
                    totalCardsPlayed: 0,
                    cardsUpgraded: 0,
                    favoriteCard: null,
                    favoritePhase: null,
                    effectsTriggered: 0
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('scaffoldDeckBuilder', JSON.stringify(this.state));
        }

        /**
         * Initialize starter deck
         */
        initializeStarterDeck() {
            const starterCards = [
                'PRIOR_KNOWLEDGE_PROBE',
                'REAL_WORLD_CONNECTION',
                'SYSTEMATIC_ELIMINATION',
                'PATTERN_RECOGNITION',
                'MECHANISM_TRACE',
                'ANALOGY_BRIDGE',
                'CONTEXT_SHIFT',
                'WHAT_IF_EXPLORER',
                'CONFIDENCE_CHECK',
                'KNOWLEDGE_AUDIT'
            ];

            starterCards.forEach(cardId => {
                if (!this.state.collection[cardId]) {
                    this.addCardToCollection(cardId);
                }
            });

            // Set initial deck
            if (this.state.deck.length === 0) {
                this.state.deck = starterCards.slice(0, this.state.maxDeckSize);
            }

            this.saveState();
        }

        /**
         * Add card to collection
         */
        addCardToCollection(cardId) {
            const cardTemplate = STRATEGY_CARDS[cardId];
            if (!cardTemplate) return null;

            const cardInstance = {
                id: cardId,
                templateId: cardId,
                name: cardTemplate.name,
                phase: cardTemplate.phase,
                rarity: cardTemplate.rarity,
                level: 1,
                xp: 0,
                timesPlayed: 0,
                timesEffectTriggered: 0,
                acquiredAt: Date.now()
            };

            this.state.collection[cardId] = cardInstance;
            this.state.cardXP[cardId] = 0;

            return cardInstance;
        }

        /**
         * Get card with full details
         */
        getCard(cardId) {
            const instance = this.state.collection[cardId];
            if (!instance) return null;

            const template = STRATEGY_CARDS[cardId];
            const rarity = CARD_RARITIES[instance.rarity.toUpperCase()];

            return {
                ...instance,
                ...template,
                rarityInfo: rarity,
                effectPower: template.effect.value * rarity.powerMultiplier * instance.level,
                nextLevelXP: this.getXPForNextLevel(instance),
                canUpgrade: this.canUpgrade(cardId)
            };
        }

        /**
         * Get XP required for next level
         */
        getXPForNextLevel(cardInstance) {
            const baseXP = CARD_RARITIES[cardInstance.rarity.toUpperCase()].upgradeXPRequired;
            if (!baseXP) return null; // Legendary max level
            return baseXP * cardInstance.level;
        }

        /**
         * Check if card can be upgraded
         */
        canUpgrade(cardId) {
            const instance = this.state.collection[cardId];
            if (!instance) return false;

            const rarity = CARD_RARITIES[instance.rarity.toUpperCase()];
            if (!rarity.upgradeXPRequired) return false; // Legendary

            const requiredXP = rarity.upgradeXPRequired * instance.level;
            return instance.xp >= requiredXP;
        }

        /**
         * Get all cards in collection grouped by phase
         */
        getCollectionByPhase() {
            const collection = {};
            const phases = ['engage', 'explore', 'explain', 'elaborate', 'evaluate'];

            phases.forEach(phase => {
                collection[phase] = [];
            });

            Object.keys(this.state.collection).forEach(cardId => {
                const card = this.getCard(cardId);
                if (card) {
                    collection[card.phase].push(card);
                }
            });

            return collection;
        }

        /**
         * Get current deck
         */
        getDeck() {
            return this.state.deck.map(cardId => this.getCard(cardId)).filter(c => c !== null);
        }

        /**
         * Check for card unlocks
         */
        checkUnlocks(playerStats) {
            const newUnlocks = [];

            Object.entries(STRATEGY_CARDS).forEach(([cardId, card]) => {
                // Skip if already collected
                if (this.state.collection[cardId]) return;

                // Skip if already in unlocked list
                if (this.state.unlockedCards.includes(cardId)) return;

                // Check unlock condition
                const condition = card.unlockCondition;
                if (!condition) return; // Starter card, should be collected

                let unlocked = true;

                if (condition.completedTopics && playerStats.completedTopics < condition.completedTopics) {
                    unlocked = false;
                }
                if (condition.correctAnswers && playerStats.correctAnswers < condition.correctAnswers) {
                    unlocked = false;
                }
                if (condition.engagePhaseQuestions && playerStats.engagePhaseQuestions < condition.engagePhaseQuestions) {
                    unlocked = false;
                }
                if (condition.scaffoldsCompleted && playerStats.scaffoldsCompleted < condition.scaffoldsCompleted) {
                    unlocked = false;
                }
                if (condition.hypothesesTested && playerStats.hypothesesTested < condition.hypothesesTested) {
                    unlocked = false;
                }
                if (condition.hardQuestionsCorrect && playerStats.hardQuestionsCorrect < condition.hardQuestionsCorrect) {
                    unlocked = false;
                }
                if (condition.teachBackAttempts && playerStats.teachBackAttempts < condition.teachBackAttempts) {
                    unlocked = false;
                }
                if (condition.clinicalQuestionsCorrect && playerStats.clinicalQuestionsCorrect < condition.clinicalQuestionsCorrect) {
                    unlocked = false;
                }
                if (condition.connectionsFound && playerStats.connectionsFound < condition.connectionsFound) {
                    unlocked = false;
                }
                if (condition.errorsAnalyzed && playerStats.errorsAnalyzed < condition.errorsAnalyzed) {
                    unlocked = false;
                }
                if (condition.explainPhaseDepth && playerStats.explainPhaseDepth < condition.explainPhaseDepth) {
                    unlocked = false;
                }
                if (condition.sessionsCompleted && playerStats.sessionsCompleted < condition.sessionsCompleted) {
                    unlocked = false;
                }
                if (condition.allPhasesBalanced && !playerStats.allPhasesBalanced) {
                    unlocked = false;
                }

                if (unlocked) {
                    this.state.unlockedCards.push(cardId);
                    newUnlocks.push({
                        cardId,
                        card
                    });
                }
            });

            if (newUnlocks.length > 0) {
                this.saveState();
            }

            return newUnlocks;
        }

        /**
         * Collect an unlocked card
         */
        collectCard(cardId) {
            if (!this.state.unlockedCards.includes(cardId)) {
                return { success: false, error: 'Card not unlocked' };
            }

            const card = this.addCardToCollection(cardId);
            this.state.unlockedCards = this.state.unlockedCards.filter(id => id !== cardId);

            this.saveState();

            return {
                success: true,
                card: this.getCard(cardId),
                message: `Collected ${card.name}!`
            };
        }

        // =========================================================================
        // CYCLE 2: DECK MANAGEMENT - BUILDING AND USING STRATEGY DECKS
        // =========================================================================

        /**
         * Add card to deck
         */
        addToDeck(cardId) {
            if (!this.state.collection[cardId]) {
                return { success: false, error: 'Card not in collection' };
            }

            if (this.state.deck.includes(cardId)) {
                return { success: false, error: 'Card already in deck' };
            }

            if (this.state.deck.length >= this.state.maxDeckSize) {
                return { success: false, error: 'Deck is full' };
            }

            this.state.deck.push(cardId);
            this.saveState();

            return {
                success: true,
                card: this.getCard(cardId),
                deckSize: this.state.deck.length
            };
        }

        /**
         * Remove card from deck
         */
        removeFromDeck(cardId) {
            if (!this.state.deck.includes(cardId)) {
                return { success: false, error: 'Card not in deck' };
            }

            this.state.deck = this.state.deck.filter(id => id !== cardId);
            this.saveState();

            return {
                success: true,
                deckSize: this.state.deck.length
            };
        }

        /**
         * Play a card (activate strategy)
         */
        playCard(cardId, context = {}) {
            if (!this.state.deck.includes(cardId)) {
                return { success: false, error: 'Card not in active deck' };
            }

            const card = this.getCard(cardId);
            if (!card) {
                return { success: false, error: 'Card not found' };
            }

            // Check if phase matches
            const currentPhase = context.currentPhase || 'explore';
            const phaseMatch = card.phase === currentPhase;

            // Set as active card
            this.state.activeCard = {
                cardId,
                playedAt: Date.now(),
                phase: currentPhase,
                phaseMatch
            };

            // Update usage
            this.state.collection[cardId].timesPlayed++;
            this.state.statistics.totalCardsPlayed++;

            // Record usage
            this.state.cardUsageHistory.unshift({
                cardId,
                phase: currentPhase,
                phaseMatch,
                timestamp: Date.now()
            });
            if (this.state.cardUsageHistory.length > 100) {
                this.state.cardUsageHistory.pop();
            }

            this.saveState();

            return {
                success: true,
                card,
                instruction: card.instruction,
                phaseMatch,
                bonusMultiplier: phaseMatch ? 1.5 : 1.0,
                message: phaseMatch
                    ? `${card.name} activated! Phase match bonus!`
                    : `${card.name} activated.`
            };
        }

        /**
         * Trigger card effect (when condition is met)
         */
        triggerEffect(context = {}) {
            if (!this.state.activeCard) {
                return { triggered: false, reason: 'No active card' };
            }

            const cardId = this.state.activeCard.cardId;
            const card = this.getCard(cardId);

            if (!card) {
                return { triggered: false, reason: 'Card not found' };
            }

            // Check if condition is met
            const effect = card.effect;
            let conditionMet = false;

            switch (effect.condition) {
                case 'any':
                    conditionMet = true;
                    break;
                case 'first_question_of_topic':
                    conditionMet = context.isFirstQuestion;
                    break;
                case 'new_topic':
                    conditionMet = context.isNewTopic;
                    break;
                case 'start_of_session':
                    conditionMet = context.isSessionStart;
                    break;
                case 'multiple_choice':
                    conditionMet = context.questionType === 'multiple_choice';
                    break;
                case 'similar_question':
                    conditionMet = context.isSimilarQuestion;
                    break;
                case 'wrong_answer':
                    conditionMet = context.wasWrong;
                    break;
                case 'hard_question':
                    conditionMet = context.difficulty >= 0.7;
                    break;
                case 'mechanism_question':
                    conditionMet = context.questionType === 'mechanism';
                    break;
                case 'new_concept':
                    conditionMet = context.isNewConcept;
                    break;
                case 'graphical_possible':
                    conditionMet = context.hasGraphical;
                    break;
                case 'complex_topic':
                    conditionMet = context.topicComplexity >= 0.6;
                    break;
                case 'application_question':
                    conditionMet = context.questionType === 'application';
                    break;
                case 'variation_question':
                    conditionMet = context.isVariation;
                    break;
                case 'mastery_check':
                    conditionMet = context.isMasteryCheck;
                    break;
                case 'clinical_question':
                    conditionMet = context.questionType === 'clinical';
                    break;
                case 'integration_question':
                    conditionMet = context.questionType === 'integration';
                    break;
                case 'end_of_topic':
                    conditionMet = context.isTopicEnd;
                    break;
                case 'end_of_session':
                    conditionMet = context.isSessionEnd;
                    break;
                case 'review_mode':
                    conditionMet = context.isReviewMode;
                    break;
                default:
                    conditionMet = false;
            }

            if (!conditionMet) {
                return { triggered: false, reason: 'Condition not met' };
            }

            // Calculate effect value with phase match bonus
            const phaseBonus = this.state.activeCard.phaseMatch ? 1.5 : 1.0;
            const effectValue = card.effectPower * phaseBonus;

            // Grant XP to card
            const xpGained = 10 * (card.rarityInfo.powerMultiplier || 1);
            this.state.collection[cardId].xp += xpGained;
            this.state.collection[cardId].timesEffectTriggered++;
            this.state.statistics.effectsTriggered++;

            // Clear active card
            this.state.activeCard = null;

            this.saveState();

            return {
                triggered: true,
                card,
                effectType: effect.type,
                effectValue,
                xpGained,
                canUpgrade: this.canUpgrade(cardId),
                message: `${card.name} effect triggered! +${xpGained} card XP`
            };
        }

        /**
         * Upgrade a card
         */
        upgradeCard(cardId) {
            if (!this.canUpgrade(cardId)) {
                return { success: false, error: 'Cannot upgrade this card' };
            }

            const instance = this.state.collection[cardId];
            const rarity = CARD_RARITIES[instance.rarity.toUpperCase()];
            const requiredXP = rarity.upgradeXPRequired * instance.level;

            // Deduct XP and level up
            instance.xp -= requiredXP;
            instance.level++;
            this.state.statistics.cardsUpgraded++;

            // Check for rarity upgrade at level 5
            if (instance.level >= 5) {
                const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
                const currentIndex = rarityOrder.indexOf(instance.rarity);
                if (currentIndex < rarityOrder.length - 1) {
                    instance.rarity = rarityOrder[currentIndex + 1];
                    instance.level = 1;
                }
            }

            this.saveState();

            return {
                success: true,
                card: this.getCard(cardId),
                newLevel: instance.level,
                newRarity: instance.rarity,
                message: `${instance.name} upgraded to Level ${instance.level}!`
            };
        }

        /**
         * Get suggested cards for current phase
         */
        getSuggestedCards(currentPhase) {
            const deckCards = this.getDeck();

            // Cards that match the current phase
            const matchingCards = deckCards.filter(card => card.phase === currentPhase);

            // Sort by effect power
            matchingCards.sort((a, b) => b.effectPower - a.effectPower);

            return {
                phase: currentPhase,
                suggested: matchingCards.slice(0, 3),
                allPhaseCards: matchingCards
            };
        }

        /**
         * Get deck building recommendations
         */
        getDeckRecommendations() {
            const deck = this.getDeck();
            const phaseCounts = {
                engage: 0,
                explore: 0,
                explain: 0,
                elaborate: 0,
                evaluate: 0
            };

            deck.forEach(card => {
                phaseCounts[card.phase]++;
            });

            const recommendations = [];

            // Check phase balance
            const phases = Object.keys(phaseCounts);
            phases.forEach(phase => {
                if (phaseCounts[phase] === 0) {
                    recommendations.push({
                        type: 'missing_phase',
                        phase,
                        message: `No ${phase} cards in deck. Consider adding one.`
                    });
                }
            });

            // Check for variety
            if (deck.length < 5) {
                recommendations.push({
                    type: 'too_small',
                    message: 'Deck is small. Add more cards for variety.'
                });
            }

            // Suggest upgradeable cards
            Object.keys(this.state.collection).forEach(cardId => {
                if (this.canUpgrade(cardId)) {
                    const card = this.getCard(cardId);
                    recommendations.push({
                        type: 'upgrade_available',
                        cardId,
                        cardName: card.name,
                        message: `${card.name} is ready to upgrade!`
                    });
                }
            });

            return recommendations;
        }

        /**
         * Get statistics
         */
        getStatistics() {
            const collection = Object.keys(this.state.collection).length;
            const totalPossible = Object.keys(STRATEGY_CARDS).length;

            // Find most used card
            let favoriteCard = null;
            let maxPlays = 0;
            Object.entries(this.state.collection).forEach(([cardId, instance]) => {
                if (instance.timesPlayed > maxPlays) {
                    maxPlays = instance.timesPlayed;
                    favoriteCard = cardId;
                }
            });

            // Find most used phase
            const phasePlays = {};
            this.state.cardUsageHistory.forEach(usage => {
                phasePlays[usage.phase] = (phasePlays[usage.phase] || 0) + 1;
            });
            const favoritePhase = Object.entries(phasePlays)
                .sort((a, b) => b[1] - a[1])[0]?.[0];

            return {
                collectionSize: collection,
                totalCards: totalPossible,
                collectionProgress: collection / totalPossible,
                deckSize: this.state.deck.length,
                maxDeckSize: this.state.maxDeckSize,
                unlockedPending: this.state.unlockedCards.length,
                totalCardsPlayed: this.state.statistics.totalCardsPlayed,
                cardsUpgraded: this.state.statistics.cardsUpgraded,
                effectsTriggered: this.state.statistics.effectsTriggered,
                favoriteCard: favoriteCard ? this.getCard(favoriteCard)?.name : null,
                favoritePhase
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Get suggested card for current context
     */
    function getSuggestedCard(currentPhase) {
        const engine = window.scaffoldDeckBuilder;
        if (!engine) return null;
        return engine.getSuggestedCards(currentPhase);
    }

    /**
     * Check for card unlocks
     */
    function checkCardUnlocks(playerStats) {
        const engine = window.scaffoldDeckBuilder;
        if (!engine) return [];
        return engine.checkUnlocks(playerStats);
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.scaffoldDeckBuilder = new ScaffoldDeckBuilderEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            ScaffoldDeckBuilderEngine,
            STRATEGY_CARDS,
            CARD_RARITIES,
            getSuggestedCard,
            checkCardUnlocks
        };
    }

    console.log('[Scaffold Deck Builder] Initialized - Strategy cards ready');

})();
