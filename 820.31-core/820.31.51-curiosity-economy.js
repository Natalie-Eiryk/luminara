/**
 * @file 820.31.51-curiosity-economy.js
 * @codon 820.31.51
 * @version 2026-03-29
 * @brief Curiosity Economy - Engagement Currency for Learning
 *
 * TAIDRGEF Signature: A.E.G.T.I
 * - A (Aggregate): Curiosity aggregates from engagement
 * - E (Emit): Spending emits learning resources
 * - G (Gravitate): Points gravitate to engaged behaviors
 * - T (Transform): Currency transforms into knowledge
 * - I (Intensify): Rewards intensify with mastery
 *
 * Cycle 1: Earning system - How curiosity points are generated
 * Cycle 2: Spending system - What curiosity points can buy
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: EARNING SYSTEM - CURIOSITY POINT GENERATION
    // =========================================================================

    /**
     * Earning Actions - How to generate curiosity points
     */
    const EARNING_ACTIONS = {
        // ENGAGE phase earnings (highest)
        ATTEMPT_NEW_TOPIC: {
            id: 'attempt_new_topic',
            name: 'Attempt New Topic',
            description: 'Start exploring a completely new area',
            basePoints: 50,
            phase: 'engage',
            cooldown: 0,
            multipliers: {
                firstTime: 2.0,
                streak: 1.0
            }
        },

        CURIOSITY_QUESTION: {
            id: 'curiosity_question',
            name: 'Ask a Curiosity Question',
            description: 'Submit a question about something you want to understand',
            basePoints: 30,
            phase: 'engage',
            cooldown: 300000, // 5 minutes
            multipliers: {
                quality: 1.5
            }
        },

        DAILY_RETURN: {
            id: 'daily_return',
            name: 'Daily Return',
            description: 'Come back to learn another day',
            basePoints: 25,
            phase: 'engage',
            cooldown: 86400000, // 24 hours
            multipliers: {
                streak: 1.1 // Per day in streak
            }
        },

        // EXPLORE phase earnings
        CORRECT_ANSWER: {
            id: 'correct_answer',
            name: 'Correct Answer',
            description: 'Answer a question correctly',
            basePoints: 10,
            phase: 'explore',
            cooldown: 0,
            multipliers: {
                firstTry: 1.5,
                difficulty: 1.2,
                streak: 1.05
            }
        },

        WRONG_ANSWER_EXPLORATION: {
            id: 'wrong_answer_exploration',
            name: 'Explore Wrong Answer',
            description: 'Read the explanation for a wrong answer',
            basePoints: 15,
            phase: 'explore',
            cooldown: 0,
            multipliers: {
                readTime: 1.2 // Bonus for actually reading
            }
        },

        PATH_CHOICE: {
            id: 'path_choice',
            name: 'Choose Your Path',
            description: 'Make a meaningful choice about what to learn next',
            basePoints: 20,
            phase: 'explore',
            cooldown: 60000, // 1 minute
            multipliers: {}
        },

        // EXPLAIN phase earnings
        COMPLETE_SCAFFOLD: {
            id: 'complete_scaffold',
            name: 'Complete Scaffold Chain',
            description: 'Work through a full scaffold sequence',
            basePoints: 75,
            phase: 'explain',
            cooldown: 0,
            multipliers: {
                depth: 1.3 // More steps = more points
            }
        },

        READ_EXPLANATION: {
            id: 'read_explanation',
            name: 'Read Explanation',
            description: 'Take time to read a detailed explanation',
            basePoints: 20,
            phase: 'explain',
            cooldown: 30000, // 30 seconds
            multipliers: {
                depth: 1.2
            }
        },

        // ELABORATE phase earnings
        CONNECT_CONCEPTS: {
            id: 'connect_concepts',
            name: 'Connect Concepts',
            description: 'Successfully link two related ideas',
            basePoints: 50,
            phase: 'elaborate',
            cooldown: 0,
            multipliers: {
                novelty: 1.5 // New connections worth more
            }
        },

        INTEGRATION_SUCCESS: {
            id: 'integration_success',
            name: 'Integration Success',
            description: 'Answer an integration question correctly',
            basePoints: 40,
            phase: 'elaborate',
            cooldown: 0,
            multipliers: {
                firstTry: 1.5,
                difficulty: 1.3
            }
        },

        CLINICAL_APPLICATION: {
            id: 'clinical_application',
            name: 'Clinical Application',
            description: 'Apply knowledge to a clinical scenario',
            basePoints: 35,
            phase: 'elaborate',
            cooldown: 0,
            multipliers: {
                correctness: 1.4
            }
        },

        // EVALUATE phase earnings
        ACHIEVE_MASTERY: {
            id: 'achieve_mastery',
            name: 'Achieve Mastery Tier',
            description: 'Reach a new mastery level for a concept',
            basePoints: 100,
            phase: 'evaluate',
            cooldown: 0,
            multipliers: {
                tier: 1.5 // Higher tiers worth more
            }
        },

        GROWTH_REFLECTION: {
            id: 'growth_reflection',
            name: 'Growth Reflection',
            description: 'Review and reflect on your progress',
            basePoints: 40,
            phase: 'evaluate',
            cooldown: 3600000, // 1 hour
            multipliers: {}
        },

        PERFECT_SESSION: {
            id: 'perfect_session',
            name: 'Perfect Session',
            description: 'Complete a session with no wrong answers',
            basePoints: 150,
            phase: 'evaluate',
            cooldown: 0,
            multipliers: {
                questionCount: 1.1 // Per question beyond 5
            }
        }
    };

    /**
     * Streak Types - Multiplier bonuses for consistent behavior
     */
    const STREAK_TYPES = {
        DAILY: {
            id: 'daily',
            name: 'Daily Streak',
            description: 'Consecutive days of learning',
            multiplierPerLevel: 0.1,
            maxMultiplier: 2.0,
            resetCondition: 'missed_day'
        },

        CORRECT: {
            id: 'correct',
            name: 'Correct Streak',
            description: 'Consecutive correct answers',
            multiplierPerLevel: 0.05,
            maxMultiplier: 1.5,
            resetCondition: 'wrong_answer'
        },

        EXPLORATION: {
            id: 'exploration',
            name: 'Exploration Streak',
            description: 'Consecutive new topics attempted',
            multiplierPerLevel: 0.15,
            maxMultiplier: 2.5,
            resetCondition: 'repeated_topic'
        }
    };

    /**
     * Curiosity Economy Engine
     */
    class CuriosityEconomyEngine {
        constructor() {
            this.state = this.loadState();
            this.checkDailyReset();
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('curiosityEconomy');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                balance: 0,
                lifetimeEarned: 0,
                lifetimeSpent: 0,
                streaks: {
                    daily: { count: 0, lastUpdate: null },
                    correct: { count: 0, lastUpdate: null },
                    exploration: { count: 0, lastUpdate: null }
                },
                cooldowns: {},          // actionId -> lastUsed timestamp
                transactions: [],       // Transaction history
                todayEarned: 0,
                todaySpent: 0,
                lastSessionDate: null,
                purchasedItems: [],     // Items bought
                activeBoosts: [],       // Temporary multipliers
                statistics: {
                    totalTransactions: 0,
                    biggestEarning: 0,
                    biggestPurchase: 0,
                    favoriteEarningAction: null,
                    favoriteSpendingCategory: null
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('curiosityEconomy', JSON.stringify(this.state));
        }

        /**
         * Check for daily reset
         */
        checkDailyReset() {
            const today = new Date().toDateString();
            const lastSession = this.state.lastSessionDate;

            if (lastSession !== today) {
                // New day
                this.state.todayEarned = 0;
                this.state.todaySpent = 0;
                this.state.lastSessionDate = today;

                // Check daily streak
                if (lastSession) {
                    const lastDate = new Date(lastSession);
                    const todayDate = new Date(today);
                    const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (daysDiff === 1) {
                        // Consecutive day - increase streak
                        this.state.streaks.daily.count++;
                    } else if (daysDiff > 1) {
                        // Missed days - reset streak
                        this.state.streaks.daily.count = 1;
                    }
                } else {
                    this.state.streaks.daily.count = 1;
                }

                this.state.streaks.daily.lastUpdate = Date.now();
                this.saveState();
            }
        }

        /**
         * Earn curiosity points
         */
        earn(actionId, context = {}) {
            const action = EARNING_ACTIONS[actionId.toUpperCase()];
            if (!action) {
                return { success: false, error: 'Unknown earning action' };
            }

            // Check cooldown
            if (action.cooldown > 0) {
                const lastUsed = this.state.cooldowns[action.id];
                if (lastUsed && Date.now() - lastUsed < action.cooldown) {
                    const remaining = Math.ceil((action.cooldown - (Date.now() - lastUsed)) / 1000);
                    return {
                        success: false,
                        error: `Action on cooldown. ${remaining}s remaining.`,
                        cooldownRemaining: remaining
                    };
                }
            }

            // Calculate base points
            let points = action.basePoints;

            // Apply multipliers
            if (action.multipliers.firstTry && context.firstTry) {
                points *= action.multipliers.firstTry;
            }
            if (action.multipliers.difficulty && context.difficulty) {
                points *= 1 + (context.difficulty - 0.5) * action.multipliers.difficulty;
            }
            if (action.multipliers.streak) {
                const streakMultiplier = this.getStreakMultiplier(action.phase);
                points *= streakMultiplier;
            }
            if (action.multipliers.firstTime && context.firstTime) {
                points *= action.multipliers.firstTime;
            }
            if (action.multipliers.depth && context.depth) {
                points *= 1 + (context.depth - 1) * 0.1 * action.multipliers.depth;
            }
            if (action.multipliers.tier && context.tier) {
                points *= 1 + (context.tier - 1) * action.multipliers.tier;
            }
            if (action.multipliers.questionCount && context.questionCount) {
                points *= 1 + Math.max(0, context.questionCount - 5) * 0.02;
            }

            // Apply active boosts
            points = this.applyBoosts(points, action.phase);

            // Round to integer
            points = Math.round(points);

            // Update state
            this.state.balance += points;
            this.state.lifetimeEarned += points;
            this.state.todayEarned += points;
            this.state.cooldowns[action.id] = Date.now();

            // Update streaks
            this.updateStreaks(action, context);

            // Record transaction
            const transaction = {
                id: `txn_${Date.now()}`,
                type: 'earn',
                actionId: action.id,
                actionName: action.name,
                points,
                phase: action.phase,
                context,
                timestamp: Date.now()
            };
            this.state.transactions.unshift(transaction);
            if (this.state.transactions.length > 100) {
                this.state.transactions.pop();
            }

            // Update statistics
            this.state.statistics.totalTransactions++;
            if (points > this.state.statistics.biggestEarning) {
                this.state.statistics.biggestEarning = points;
            }

            this.saveState();

            return {
                success: true,
                points,
                action: action.name,
                newBalance: this.state.balance,
                phase: action.phase,
                message: this.generateEarnMessage(action, points)
            };
        }

        /**
         * Get streak multiplier for a phase
         */
        getStreakMultiplier(phase) {
            let multiplier = 1.0;

            // Daily streak always applies
            const dailyStreak = this.state.streaks.daily.count;
            const dailyBonus = Math.min(
                STREAK_TYPES.DAILY.maxMultiplier - 1,
                dailyStreak * STREAK_TYPES.DAILY.multiplierPerLevel
            );
            multiplier += dailyBonus;

            // Correct streak for explore/elaborate
            if (['explore', 'elaborate', 'evaluate'].includes(phase)) {
                const correctStreak = this.state.streaks.correct.count;
                const correctBonus = Math.min(
                    STREAK_TYPES.CORRECT.maxMultiplier - 1,
                    correctStreak * STREAK_TYPES.CORRECT.multiplierPerLevel
                );
                multiplier += correctBonus;
            }

            // Exploration streak for engage
            if (phase === 'engage') {
                const exploreStreak = this.state.streaks.exploration.count;
                const exploreBonus = Math.min(
                    STREAK_TYPES.EXPLORATION.maxMultiplier - 1,
                    exploreStreak * STREAK_TYPES.EXPLORATION.multiplierPerLevel
                );
                multiplier += exploreBonus;
            }

            return multiplier;
        }

        /**
         * Update streaks based on action
         */
        updateStreaks(action, context) {
            // Correct streak
            if (action.id === 'correct_answer') {
                this.state.streaks.correct.count++;
                this.state.streaks.correct.lastUpdate = Date.now();
            } else if (context.wasWrong) {
                this.state.streaks.correct.count = 0;
            }

            // Exploration streak
            if (action.id === 'attempt_new_topic' && context.firstTime) {
                this.state.streaks.exploration.count++;
                this.state.streaks.exploration.lastUpdate = Date.now();
            }
        }

        /**
         * Apply active boosts to points
         */
        applyBoosts(points, phase) {
            const now = Date.now();

            // Filter active boosts
            this.state.activeBoosts = this.state.activeBoosts.filter(boost =>
                boost.expiresAt > now
            );

            // Apply each boost
            this.state.activeBoosts.forEach(boost => {
                if (!boost.phase || boost.phase === phase) {
                    points *= boost.multiplier;
                }
            });

            return points;
        }

        /**
         * Generate earn message
         */
        generateEarnMessage(action, points) {
            const messages = {
                engage: [
                    `Curiosity sparked! +${points} points`,
                    `Your engagement earns +${points} curiosity`,
                    `The journey begins! +${points} points`
                ],
                explore: [
                    `Discovery! +${points} points`,
                    `Exploration pays off! +${points} curiosity`,
                    `Each step teaches! +${points} points`
                ],
                explain: [
                    `Understanding deepens! +${points} points`,
                    `Clarity rewards you! +${points} curiosity`,
                    `Knowledge crystallizes! +${points} points`
                ],
                elaborate: [
                    `Application mastered! +${points} points`,
                    `Transfer successful! +${points} curiosity`,
                    `Connections form! +${points} points`
                ],
                evaluate: [
                    `Mastery confirmed! +${points} points`,
                    `Growth measured! +${points} curiosity`,
                    `Assessment rewards! +${points} points`
                ]
            };

            const phaseMessages = messages[action.phase] || messages.explore;
            return phaseMessages[Math.floor(Math.random() * phaseMessages.length)];
        }

        // =========================================================================
        // CYCLE 2: SPENDING SYSTEM - CURIOSITY POINT PURCHASES
        // =========================================================================

        /**
         * Spendable Items - What curiosity can buy
         */
        static SHOP_ITEMS = {
            // Hints and Help
            HINT_SINGLE: {
                id: 'hint_single',
                name: 'Single Hint',
                description: 'Eliminate one wrong answer option',
                cost: 20,
                category: 'hints',
                effect: { type: 'eliminate_wrong', count: 1 },
                consumable: true
            },

            HINT_DOUBLE: {
                id: 'hint_double',
                name: 'Double Hint',
                description: 'Eliminate two wrong answer options',
                cost: 45,
                category: 'hints',
                effect: { type: 'eliminate_wrong', count: 2 },
                consumable: true
            },

            // Explanations
            DEEP_EXPLANATION: {
                id: 'deep_explanation',
                name: 'Deep Explanation',
                description: 'Extended mechanism breakdown with examples',
                cost: 50,
                category: 'explanations',
                effect: { type: 'unlock_content', contentType: 'deep_explanation' },
                consumable: true
            },

            HISTORICAL_CONTEXT: {
                id: 'historical_context',
                name: 'Historical Context',
                description: '"How we discovered this" story',
                cost: 30,
                category: 'explanations',
                effect: { type: 'unlock_content', contentType: 'history' },
                consumable: true
            },

            CLINICAL_CASE: {
                id: 'clinical_case',
                name: 'Clinical Case',
                description: 'Real patient scenario illustrating the concept',
                cost: 75,
                category: 'explanations',
                effect: { type: 'unlock_content', contentType: 'clinical_case' },
                consumable: true
            },

            EXPERT_INTERVIEW: {
                id: 'expert_interview',
                name: 'Expert Interview',
                description: 'Simulated conversation with a specialist',
                cost: 100,
                category: 'explanations',
                effect: { type: 'unlock_content', contentType: 'expert' },
                consumable: true
            },

            // Boosts
            XP_BOOST_30: {
                id: 'xp_boost_30',
                name: '30-Minute XP Boost',
                description: '50% more curiosity points for 30 minutes',
                cost: 80,
                category: 'boosts',
                effect: { type: 'multiplier', value: 1.5, duration: 1800000 },
                consumable: true
            },

            XP_BOOST_60: {
                id: 'xp_boost_60',
                name: '60-Minute XP Boost',
                description: '50% more curiosity points for 1 hour',
                cost: 140,
                category: 'boosts',
                effect: { type: 'multiplier', value: 1.5, duration: 3600000 },
                consumable: true
            },

            PHASE_BOOST: {
                id: 'phase_boost',
                name: 'Phase Boost',
                description: 'Double points in your weakest phase for 1 hour',
                cost: 120,
                category: 'boosts',
                effect: { type: 'phase_multiplier', value: 2.0, duration: 3600000 },
                consumable: true
            },

            // Unlocks
            UNLOCK_ADVANCED_TOPIC: {
                id: 'unlock_advanced_topic',
                name: 'Early Access',
                description: 'Unlock an advanced topic before meeting prerequisites',
                cost: 200,
                category: 'unlocks',
                effect: { type: 'unlock_topic', bypass: 'prerequisites' },
                consumable: true
            },

            SKIP_COOLDOWN: {
                id: 'skip_cooldown',
                name: 'Skip Cooldown',
                description: 'Reset all earning cooldowns immediately',
                cost: 50,
                category: 'unlocks',
                effect: { type: 'reset_cooldowns' },
                consumable: true
            },

            // Cosmetics
            TITLE_CURIOUS: {
                id: 'title_curious',
                name: 'Title: The Curious',
                description: 'Display "The Curious" as your title',
                cost: 150,
                category: 'cosmetics',
                effect: { type: 'title', value: 'The Curious' },
                consumable: false
            },

            TITLE_SCHOLAR: {
                id: 'title_scholar',
                name: 'Title: The Scholar',
                description: 'Display "The Scholar" as your title',
                cost: 300,
                category: 'cosmetics',
                effect: { type: 'title', value: 'The Scholar' },
                consumable: false
            },

            TITLE_SAGE: {
                id: 'title_sage',
                name: 'Title: The Sage',
                description: 'Display "The Sage" as your title',
                cost: 500,
                category: 'cosmetics',
                effect: { type: 'title', value: 'The Sage' },
                consumable: false
            },

            // Special
            SECOND_CHANCE: {
                id: 'second_chance',
                name: 'Second Chance',
                description: 'Get another attempt at a wrong answer without penalty',
                cost: 35,
                category: 'special',
                effect: { type: 'retry_no_penalty' },
                consumable: true
            },

            STREAK_SAVER: {
                id: 'streak_saver',
                name: 'Streak Saver',
                description: 'Protect your correct streak from one wrong answer',
                cost: 60,
                category: 'special',
                effect: { type: 'protect_streak', count: 1 },
                consumable: true
            },

            CONCEPT_MAP: {
                id: 'concept_map',
                name: 'Concept Map',
                description: 'Visual overview of how concepts connect',
                cost: 90,
                category: 'special',
                effect: { type: 'unlock_content', contentType: 'concept_map' },
                consumable: true
            }
        };

        /**
         * Spend curiosity points
         */
        spend(itemId, context = {}) {
            const item = CuriosityEconomyEngine.SHOP_ITEMS[itemId.toUpperCase()];
            if (!item) {
                return { success: false, error: 'Unknown item' };
            }

            // Check if already owned (for non-consumables)
            if (!item.consumable && this.state.purchasedItems.includes(item.id)) {
                return { success: false, error: 'Already owned' };
            }

            // Check balance
            if (this.state.balance < item.cost) {
                return {
                    success: false,
                    error: 'Insufficient curiosity points',
                    balance: this.state.balance,
                    cost: item.cost,
                    deficit: item.cost - this.state.balance
                };
            }

            // Deduct points
            this.state.balance -= item.cost;
            this.state.lifetimeSpent += item.cost;
            this.state.todaySpent += item.cost;

            // Apply effect
            const effectResult = this.applyItemEffect(item, context);

            // Track purchase
            if (!item.consumable) {
                this.state.purchasedItems.push(item.id);
            }

            // Record transaction
            const transaction = {
                id: `txn_${Date.now()}`,
                type: 'spend',
                itemId: item.id,
                itemName: item.name,
                cost: item.cost,
                category: item.category,
                context,
                timestamp: Date.now()
            };
            this.state.transactions.unshift(transaction);

            // Update statistics
            this.state.statistics.totalTransactions++;
            if (item.cost > this.state.statistics.biggestPurchase) {
                this.state.statistics.biggestPurchase = item.cost;
            }

            this.saveState();

            return {
                success: true,
                item: item.name,
                cost: item.cost,
                newBalance: this.state.balance,
                effect: effectResult,
                message: this.generateSpendMessage(item)
            };
        }

        /**
         * Apply item effect
         */
        applyItemEffect(item, context) {
            const effect = item.effect;

            switch (effect.type) {
                case 'eliminate_wrong':
                    return {
                        applied: true,
                        type: 'hint',
                        count: effect.count,
                        instruction: `Eliminate ${effect.count} wrong answer(s)`
                    };

                case 'unlock_content':
                    return {
                        applied: true,
                        type: 'content_unlock',
                        contentType: effect.contentType,
                        instruction: `${effect.contentType} content unlocked`
                    };

                case 'multiplier':
                    this.state.activeBoosts.push({
                        id: `boost_${Date.now()}`,
                        type: 'multiplier',
                        multiplier: effect.value,
                        expiresAt: Date.now() + effect.duration
                    });
                    return {
                        applied: true,
                        type: 'boost',
                        multiplier: effect.value,
                        duration: effect.duration / 60000 + ' minutes'
                    };

                case 'phase_multiplier':
                    // Find weakest phase
                    const weakestPhase = this.findWeakestPhase();
                    this.state.activeBoosts.push({
                        id: `boost_${Date.now()}`,
                        type: 'phase_multiplier',
                        phase: weakestPhase,
                        multiplier: effect.value,
                        expiresAt: Date.now() + effect.duration
                    });
                    return {
                        applied: true,
                        type: 'phase_boost',
                        phase: weakestPhase,
                        multiplier: effect.value
                    };

                case 'reset_cooldowns':
                    this.state.cooldowns = {};
                    return {
                        applied: true,
                        type: 'cooldown_reset',
                        instruction: 'All cooldowns reset'
                    };

                case 'title':
                    return {
                        applied: true,
                        type: 'cosmetic',
                        title: effect.value
                    };

                case 'retry_no_penalty':
                    return {
                        applied: true,
                        type: 'second_chance',
                        instruction: 'Next wrong answer has no penalty'
                    };

                case 'protect_streak':
                    return {
                        applied: true,
                        type: 'streak_protection',
                        count: effect.count
                    };

                default:
                    return { applied: false };
            }
        }

        /**
         * Find weakest 5E phase
         */
        findWeakestPhase() {
            // This would integrate with phase tracking
            // For now, return a default
            return 'explain';
        }

        /**
         * Generate spend message
         */
        generateSpendMessage(item) {
            const messages = {
                hints: 'A clue reveals itself...',
                explanations: 'Knowledge unfolds before you...',
                boosts: 'Power surges through your curiosity!',
                unlocks: 'New paths open to you...',
                cosmetics: 'Your title has been updated!',
                special: 'A special ability activates!'
            };
            return messages[item.category] || 'Item acquired!';
        }

        /**
         * Get shop items by category
         */
        getShopByCategory() {
            const shop = {};

            Object.values(CuriosityEconomyEngine.SHOP_ITEMS).forEach(item => {
                if (!shop[item.category]) {
                    shop[item.category] = [];
                }

                const canAfford = this.state.balance >= item.cost;
                const owned = !item.consumable && this.state.purchasedItems.includes(item.id);

                shop[item.category].push({
                    ...item,
                    canAfford,
                    owned,
                    available: canAfford && !owned
                });
            });

            return shop;
        }

        /**
         * Get current balance and stats
         */
        getWallet() {
            return {
                balance: this.state.balance,
                todayEarned: this.state.todayEarned,
                todaySpent: this.state.todaySpent,
                lifetimeEarned: this.state.lifetimeEarned,
                lifetimeSpent: this.state.lifetimeSpent,
                streaks: {
                    daily: this.state.streaks.daily.count,
                    correct: this.state.streaks.correct.count,
                    exploration: this.state.streaks.exploration.count
                },
                activeBoosts: this.state.activeBoosts.filter(b => b.expiresAt > Date.now()),
                recentTransactions: this.state.transactions.slice(0, 10)
            };
        }

        /**
         * Get earning opportunities
         */
        getEarningOpportunities() {
            const now = Date.now();
            const opportunities = [];

            Object.values(EARNING_ACTIONS).forEach(action => {
                const lastUsed = this.state.cooldowns[action.id];
                const onCooldown = lastUsed && now - lastUsed < action.cooldown;
                const cooldownRemaining = onCooldown
                    ? Math.ceil((action.cooldown - (now - lastUsed)) / 1000)
                    : 0;

                opportunities.push({
                    ...action,
                    available: !onCooldown,
                    cooldownRemaining,
                    estimatedPoints: Math.round(action.basePoints * this.getStreakMultiplier(action.phase))
                });
            });

            return opportunities;
        }

        /**
         * Check if can afford item
         */
        canAfford(itemId) {
            const item = CuriosityEconomyEngine.SHOP_ITEMS[itemId.toUpperCase()];
            if (!item) return false;
            return this.state.balance >= item.cost;
        }

        /**
         * Get statistics
         */
        getStatistics() {
            return {
                ...this.state.statistics,
                balance: this.state.balance,
                netWorth: this.state.lifetimeEarned - this.state.lifetimeSpent,
                purchasedItemsCount: this.state.purchasedItems.length,
                averageTransaction: this.state.statistics.totalTransactions > 0
                    ? Math.round(this.state.lifetimeEarned / this.state.statistics.totalTransactions)
                    : 0,
                longestDailyStreak: this.state.streaks.daily.count,
                currentStreaks: {
                    daily: this.state.streaks.daily.count,
                    correct: this.state.streaks.correct.count,
                    exploration: this.state.streaks.exploration.count
                }
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Hook into various game events
     */
    function onCorrectAnswer(context) {
        const engine = window.curiosityEconomy;
        if (!engine) return null;
        return engine.earn('correct_answer', context);
    }

    function onWrongAnswerExplored() {
        const engine = window.curiosityEconomy;
        if (!engine) return null;
        return engine.earn('wrong_answer_exploration', { readTime: true });
    }

    function onNewTopicStarted(context) {
        const engine = window.curiosityEconomy;
        if (!engine) return null;
        return engine.earn('attempt_new_topic', context);
    }

    function onMasteryAchieved(tier) {
        const engine = window.curiosityEconomy;
        if (!engine) return null;
        return engine.earn('achieve_mastery', { tier });
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.curiosityEconomy = new CuriosityEconomyEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            CuriosityEconomyEngine,
            EARNING_ACTIONS,
            STREAK_TYPES,
            onCorrectAnswer,
            onWrongAnswerExplored,
            onNewTopicStarted,
            onMasteryAchieved
        };
    }

    console.log('[Curiosity Economy] Initialized - Currency system active');

})();
