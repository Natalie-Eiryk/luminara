/**
 * 820.31.82-metacognition-engine.js - Metacognitive Feedback Engine
 * @codon 820.31.82
 * @version 2026-03-29
 * @description Analyzes errors to provide targeted learning feedback
 *
 * Pedagogical Foundation:
 * - Bjork & Bjork (2011) - Desirable Difficulties
 * - Error analysis produces deeper learning than repeating correct answers
 *
 * Features:
 * - Error classification (MEMORY, CONFUSION, LOGIC, CARELESS, VOCABULARY)
 * - Reflection prompt generation
 * - Misconception tracking for Dungeon mode
 * - Related concept identification
 * - Learning strategy recommendations
 */

class MetacognitiveEngine {
    constructor(persistence) {
        this.persistence = persistence;
        this.errorHistory = [];
        this.loadMisconceptions();
    }

    // Error type definitions
    static ERROR_TYPES = {
        MEMORY: {
            name: 'Memory',
            description: 'You knew this but couldn\'t recall it',
            color: '#a855f7',
            icon: '💭',
            monster: 'Memory Phantom'
        },
        CONFUSION: {
            name: 'Confusion',
            description: 'You mixed up similar concepts',
            color: '#fbbf24',
            icon: '🔀',
            monster: 'Confusion Golem'
        },
        LOGIC: {
            name: 'Logic',
            description: 'You applied the wrong reasoning',
            color: '#ef4444',
            icon: '🔢',
            monster: 'Logic Demon'
        },
        CARELESS: {
            name: 'Careless',
            description: 'You made a hasty mistake',
            color: '#22c55e',
            icon: '⚡',
            monster: 'Careless Imp'
        },
        VOCABULARY: {
            name: 'Vocabulary',
            description: 'Term or definition confusion',
            color: '#3b82f6',
            icon: '📚',
            monster: 'Vocabulary Specter'
        },
        UNKNOWN: {
            name: 'Unknown',
            description: 'This is new territory',
            color: '#6b7280',
            icon: '❓',
            monster: 'Unknown Shade'
        }
    };

    // Analyze an error and return feedback
    analyzeError(question, selectedAnswer, correctAnswer) {
        const errorType = this.classifyError(question, selectedAnswer, correctAnswer);
        const relatedConcepts = this.findRelatedConcepts(question);
        const strategy = this.recommendStrategy(errorType, question);
        const reflection = this.generateReflectionPrompt(errorType, question, selectedAnswer, correctAnswer);

        // Record the misconception
        const misconception = {
            questionId: question.id || this.generateQuestionId(question),
            question: question.q,
            selectedAnswer,
            correctAnswer,
            errorType,
            timestamp: Date.now(),
            resolved: false,
            correctStreak: 0,
            category: question.category || this.extractCategory(question),
            concept: this.extractConcept(question)
        };

        this.recordMisconception(misconception);

        return {
            errorType,
            errorInfo: MetacognitiveEngine.ERROR_TYPES[errorType],
            relatedConcepts,
            strategy,
            reflection,
            misconception
        };
    }

    // Classify the type of error
    classifyError(question, selectedAnswer, correctAnswer) {
        const selectedText = this.getOptionText(question, selectedAnswer);
        const correctText = this.getOptionText(question, correctAnswer);

        // Calculate similarity between selected and correct answers
        const similarity = this.calculateSimilarity(selectedText, correctText);

        // Check if this was recently answered correctly (careless)
        if (this.wasRecentlyCorrect(question)) {
            return 'CARELESS';
        }

        // High similarity suggests confusion between similar terms
        if (similarity > 0.5) {
            return 'CONFUSION';
        }

        // Check for vocabulary/definition questions
        if (this.isTerminologyQuestion(question)) {
            return 'VOCABULARY';
        }

        // Check for reasoning/application questions
        if (this.requiresReasoning(question)) {
            return 'LOGIC';
        }

        // Check if this question has been seen before (memory failure)
        if (this.hasSeenBefore(question)) {
            return 'MEMORY';
        }

        // Default to unknown for new concepts
        if (this.isNewConcept(question)) {
            return 'UNKNOWN';
        }

        return 'MEMORY';
    }

    // Get option text from question
    getOptionText(question, answerIndex) {
        if (question.options && question.options[answerIndex]) {
            return question.options[answerIndex];
        }
        return '';
    }

    // Calculate text similarity (Jaccard-like)
    calculateSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;

        const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
        const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));

        if (words1.size === 0 || words2.size === 0) return 0;

        const intersection = new Set([...words1].filter(w => words2.has(w)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    // Check if question was recently answered correctly
    wasRecentlyCorrect(question) {
        const qId = question.id || this.generateQuestionId(question);
        const recentCorrect = this.getRecentCorrect();
        return recentCorrect.has(qId);
    }

    // Get set of recently correctly answered question IDs
    getRecentCorrect() {
        if (!this.persistence?.data?.recentCorrect) {
            return new Set();
        }
        // Consider "recent" as last 7 days
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return new Set(
            Object.entries(this.persistence.data.recentCorrect)
                .filter(([_, timestamp]) => timestamp > cutoff)
                .map(([id]) => id)
        );
    }

    // Check if this is a terminology/definition question
    isTerminologyQuestion(question) {
        const patterns = [
            /what is (the )?definition/i,
            /define/i,
            /what does .+ mean/i,
            /which term/i,
            /what is (a|an|the) .+\?$/i,
            /the term .+ refers to/i,
            /is (also )?(called|known as)/i
        ];

        return patterns.some(p => p.test(question.q));
    }

    // Check if question requires reasoning
    requiresReasoning(question) {
        const patterns = [
            /why does/i,
            /how does/i,
            /what happens when/i,
            /what would happen if/i,
            /which of the following would/i,
            /explain/i,
            /because/i,
            /results in/i,
            /causes/i,
            /leads to/i,
            /mechanism/i,
            /process/i,
            /pathway/i
        ];

        return patterns.some(p => p.test(question.q));
    }

    // Check if question has been seen before
    hasSeenBefore(question) {
        const qId = question.id || this.generateQuestionId(question);
        return this.errorHistory.some(e => e.questionId === qId);
    }

    // Check if this is a new concept
    isNewConcept(question) {
        const qId = question.id || this.generateQuestionId(question);
        const allSeen = this.persistence?.data?.questionsAnswered || {};
        return !allSeen[qId];
    }

    // Generate a unique ID for a question
    generateQuestionId(question) {
        const str = question.q + (question.options?.join('') || '');
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'q_' + Math.abs(hash).toString(16);
    }

    // Find related concepts
    findRelatedConcepts(question) {
        const concepts = [];

        // Extract key terms from question
        const keywords = this.extractKeywords(question.q);

        // Check persistence for related questions/concepts
        if (this.persistence?.data?.conceptMap) {
            keywords.forEach(keyword => {
                const related = this.persistence.data.conceptMap[keyword];
                if (related) {
                    concepts.push(...related.slice(0, 3));
                }
            });
        }

        // Add category-based relationships
        const category = question.category || this.extractCategory(question);
        if (category) {
            concepts.push(`Other ${category} concepts`);
        }

        return [...new Set(concepts)].slice(0, 5);
    }

    // Extract keywords from text
    extractKeywords(text) {
        const stopWords = new Set([
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'must', 'shall',
            'can', 'of', 'to', 'in', 'for', 'on', 'with', 'at', 'by',
            'from', 'as', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'why',
            'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some',
            'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
            'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
            'because', 'until', 'while', 'which', 'what', 'this', 'that'
        ]);

        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));
    }

    // Extract category from question
    extractCategory(question) {
        if (question.category) return question.category;
        if (question.tags && question.tags.length > 0) return question.tags[0];
        return 'General';
    }

    // Extract main concept from question
    extractConcept(question) {
        // Try to extract the main concept being tested
        const keywords = this.extractKeywords(question.q);
        return keywords.slice(0, 3).join(' ') || 'Unknown concept';
    }

    // Recommend a learning strategy
    recommendStrategy(errorType, question) {
        const strategies = {
            MEMORY: [
                'Create a mnemonic device',
                'Use spaced repetition',
                'Draw a diagram or visual',
                'Teach this concept to someone else',
                'Create flashcards for review'
            ],
            CONFUSION: [
                'Create a comparison chart',
                'List the key differences',
                'Use different colors for each concept',
                'Find a unique identifier for each term',
                'Create analogies for each concept'
            ],
            LOGIC: [
                'Walk through the steps slowly',
                'Draw a flowchart of the process',
                'Identify the underlying rule or principle',
                'Practice with similar problems',
                'Explain your reasoning out loud'
            ],
            CARELESS: [
                'Slow down and read carefully',
                'Highlight key words in the question',
                'Double-check before submitting',
                'Take a deep breath before answering',
                'Cover the options and predict first'
            ],
            VOCABULARY: [
                'Look up the etymology (word origin)',
                'Create a vocabulary card',
                'Use the term in a sentence',
                'Connect to related terms you know',
                'Create a mind map of related terms'
            ],
            UNKNOWN: [
                'This is new - focus on understanding basics first',
                'Read background material on this topic',
                'Ask questions about what confuses you',
                'Take notes as you learn',
                'Connect to concepts you already know'
            ]
        };

        const typeStrategies = strategies[errorType] || strategies.UNKNOWN;
        return typeStrategies[Math.floor(Math.random() * typeStrategies.length)];
    }

    // Generate a reflection prompt
    generateReflectionPrompt(errorType, question, selectedAnswer, correctAnswer) {
        const selectedText = this.getOptionText(question, selectedAnswer);
        const correctText = this.getOptionText(question, correctAnswer);

        const prompts = {
            MEMORY: [
                `What mnemonic could help you remember "${correctText}"?`,
                `How can you connect "${correctText}" to something you already know?`,
                `What visual image represents this concept?`,
                `Can you create a story that includes this fact?`
            ],
            CONFUSION: [
                `What's the KEY difference between "${selectedText}" and "${correctText}"?`,
                `How would you explain the distinction to a friend?`,
                `What's unique about each of these concepts?`,
                `Can you think of a way to never mix these up again?`
            ],
            LOGIC: [
                `What rule or principle applies here?`,
                `Walk through the reasoning step by step - where did it go wrong?`,
                `What assumption did you make that wasn't correct?`,
                `How does this connect to what you know about the topic?`
            ],
            CARELESS: [
                `You knew this! What made you rush?`,
                `What would have helped you catch this mistake?`,
                `Take a breath - what strategy can prevent this next time?`,
                `What keyword in the question should you have noticed?`
            ],
            VOCABULARY: [
                `What does "${correctText}" literally mean?`,
                `Can you break down the word into parts you recognize?`,
                `How does the definition connect to the term itself?`,
                `What other terms are related to this one?`
            ],
            UNKNOWN: [
                `This is new territory! What would help you learn this?`,
                `What do you already know that might be related?`,
                `What questions do you have about this concept?`,
                `How does this fit into the bigger picture?`
            ]
        };

        const typePrompts = prompts[errorType] || prompts.UNKNOWN;
        return typePrompts[Math.floor(Math.random() * typePrompts.length)];
    }

    // Record a misconception
    recordMisconception(misconception) {
        // Add to error history
        this.errorHistory.push(misconception);

        // Keep only last 100 errors
        if (this.errorHistory.length > 100) {
            this.errorHistory.shift();
        }

        // Save to persistence
        if (this.persistence) {
            if (!this.persistence.data.misconceptions) {
                this.persistence.data.misconceptions = [];
            }

            // Check if this question already has a misconception
            const existingIndex = this.persistence.data.misconceptions
                .findIndex(m => m.questionId === misconception.questionId);

            if (existingIndex >= 0) {
                // Update existing
                this.persistence.data.misconceptions[existingIndex] = misconception;
            } else {
                // Add new
                this.persistence.data.misconceptions.push(misconception);
            }

            // Limit stored misconceptions
            if (this.persistence.data.misconceptions.length > 200) {
                // Remove oldest resolved ones first
                const resolved = this.persistence.data.misconceptions
                    .filter(m => m.resolved)
                    .sort((a, b) => a.timestamp - b.timestamp);

                if (resolved.length > 0) {
                    const toRemove = resolved[0];
                    const removeIndex = this.persistence.data.misconceptions
                        .findIndex(m => m.questionId === toRemove.questionId);
                    this.persistence.data.misconceptions.splice(removeIndex, 1);
                }
            }

            this.persistence.save();
        }
    }

    // Load misconceptions from persistence
    loadMisconceptions() {
        if (this.persistence?.data?.misconceptions) {
            this.errorHistory = [...this.persistence.data.misconceptions];
        }
    }

    // Get unresolved misconceptions
    getUnresolvedMisconceptions() {
        return this.errorHistory.filter(m => !m.resolved);
    }

    // Get misconceptions by error type
    getMisconceptionsByType(errorType) {
        return this.errorHistory.filter(m => m.errorType === errorType && !m.resolved);
    }

    // Get misconception statistics
    getStatistics() {
        const stats = {
            total: this.errorHistory.length,
            unresolved: 0,
            resolved: 0,
            byType: {}
        };

        Object.keys(MetacognitiveEngine.ERROR_TYPES).forEach(type => {
            stats.byType[type] = { total: 0, unresolved: 0 };
        });

        this.errorHistory.forEach(m => {
            if (m.resolved) {
                stats.resolved++;
            } else {
                stats.unresolved++;
            }

            if (stats.byType[m.errorType]) {
                stats.byType[m.errorType].total++;
                if (!m.resolved) {
                    stats.byType[m.errorType].unresolved++;
                }
            }
        });

        return stats;
    }

    // Mark a misconception as resolved (used when answering correctly 3x)
    resolveMisconception(questionId) {
        const misconception = this.errorHistory.find(m => m.questionId === questionId);
        if (misconception) {
            misconception.resolved = true;
            misconception.resolvedAt = Date.now();

            // Update persistence
            if (this.persistence?.data?.misconceptions) {
                const stored = this.persistence.data.misconceptions
                    .find(m => m.questionId === questionId);
                if (stored) {
                    stored.resolved = true;
                    stored.resolvedAt = Date.now();
                    this.persistence.save();
                }
            }

            return true;
        }
        return false;
    }

    // Update correct streak for a misconception
    updateCorrectStreak(questionId, correct) {
        const misconception = this.errorHistory.find(m => m.questionId === questionId);
        if (misconception) {
            if (correct) {
                misconception.correctStreak = (misconception.correctStreak || 0) + 1;

                // Auto-resolve after 3 correct in a row
                if (misconception.correctStreak >= 3) {
                    this.resolveMisconception(questionId);
                    return { resolved: true, streak: misconception.correctStreak };
                }
            } else {
                misconception.correctStreak = 0;
            }

            // Update persistence
            if (this.persistence?.data?.misconceptions) {
                const stored = this.persistence.data.misconceptions
                    .find(m => m.questionId === questionId);
                if (stored) {
                    stored.correctStreak = misconception.correctStreak;
                    this.persistence.save();
                }
            }

            return { resolved: false, streak: misconception.correctStreak };
        }
        return null;
    }

    // Get questions that need review (for Misconception Dungeon)
    getQuestionsForReview() {
        return this.getUnresolvedMisconceptions()
            .sort((a, b) => {
                // Prioritize: more recent errors, lower correct streaks
                const scoreA = (Date.now() - a.timestamp) / 1000000 - (a.correctStreak || 0) * 10;
                const scoreB = (Date.now() - b.timestamp) / 1000000 - (b.correctStreak || 0) * 10;
                return scoreA - scoreB;
            });
    }

    // Render error feedback UI
    renderErrorFeedback(analysis) {
        const errorInfo = analysis.errorInfo;

        return `
            <div class="metacognitive-feedback error-type-${analysis.errorType.toLowerCase()}">
                <div class="error-header" style="border-left: 4px solid ${errorInfo.color}">
                    <span class="error-icon">${errorInfo.icon}</span>
                    <span class="error-type">${errorInfo.name} Error</span>
                </div>

                <div class="error-description">
                    ${errorInfo.description}
                </div>

                <div class="reflection-prompt">
                    <strong>Reflection:</strong>
                    <p>${analysis.reflection}</p>
                </div>

                <div class="strategy-suggestion">
                    <strong>Try this:</strong>
                    <p>${analysis.strategy}</p>
                </div>

                ${analysis.relatedConcepts.length > 0 ? `
                    <div class="related-concepts">
                        <strong>Related concepts to review:</strong>
                        <ul>
                            ${analysis.relatedConcepts.map(c => `<li>${c}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="dungeon-preview">
                    <span class="monster-preview">
                        A <strong>${errorInfo.monster}</strong> has been spawned in your Misconception Dungeon!
                    </span>
                </div>
            </div>
        `;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetacognitiveEngine;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MetacognitiveEngine = MetacognitiveEngine;
}
