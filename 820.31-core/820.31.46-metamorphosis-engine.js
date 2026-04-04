/**
 * @file 820.31.46-metamorphosis-engine.js
 * @codon 820.31.46
 * @version 2026-03-29
 * @brief Metamorphosis Engine - Body Transformation as Knowledge Visualization
 *
 * TAIDRGEF Signature: T.G.E.A.D
 * - T (Transform): Player transforms through learning
 * - G (Gravitate): Body parts gravitate toward mastery forms
 * - E (Emit): Mastery emits visual radiance
 * - A (Aggregate): Knowledge aggregates in body systems
 * - D (Diminish): Atrophy diminishes neglected areas
 *
 * Cycle 1: Body mapping - Knowledge domains to body regions
 * Cycle 2: Transformation system - Mutation, atrophy, evolution
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: BODY MAPPING - KNOWLEDGE DOMAINS TO BODY REGIONS
    // =========================================================================

    /**
     * Body Regions - Each region maps to a knowledge domain
     */
    const BODY_REGIONS = {
        HEAD: {
            id: 'head',
            name: 'Head',
            description: 'Seat of neuroanatomy and cognition',
            domains: ['neuroanatomy', 'neurology', 'psychiatry', 'cognition'],
            position: { x: 0.5, y: 0.1 },
            baseForm: 'humanoid_head',
            transformationPath: ['awakening_mind', 'illuminated_cortex', 'transcendent_consciousness']
        },

        EYES: {
            id: 'eyes',
            name: 'Eyes',
            description: 'Windows to sensory systems',
            domains: ['ophthalmology', 'sensory', 'perception', 'vision'],
            position: { x: 0.5, y: 0.12 },
            baseForm: 'humanoid_eyes',
            transformationPath: ['keen_sight', 'prismatic_gaze', 'all_seeing']
        },

        HEART: {
            id: 'heart',
            name: 'Heart',
            description: 'Core of cardiovascular mastery',
            domains: ['cardiovascular', 'cardiology', 'circulation', 'hemodynamics'],
            position: { x: 0.45, y: 0.35 },
            baseForm: 'humanoid_heart',
            transformationPath: ['strong_beat', 'radiant_pulse', 'eternal_circulation']
        },

        LUNGS: {
            id: 'lungs',
            name: 'Lungs',
            description: 'Breath of respiratory understanding',
            domains: ['respiratory', 'pulmonology', 'gas_exchange', 'ventilation'],
            position: { x: 0.5, y: 0.32 },
            baseForm: 'humanoid_lungs',
            transformationPath: ['deep_breath', 'wind_carrier', 'essence_of_air']
        },

        CORE: {
            id: 'core',
            name: 'Core',
            description: 'Center of endocrine and metabolic wisdom',
            domains: ['endocrine', 'metabolism', 'hormones', 'homeostasis'],
            position: { x: 0.5, y: 0.45 },
            baseForm: 'humanoid_core',
            transformationPath: ['balanced_center', 'harmonic_core', 'metabolic_mastery']
        },

        VISCERA: {
            id: 'viscera',
            name: 'Viscera',
            description: 'Realm of gastrointestinal knowledge',
            domains: ['gastrointestinal', 'hepatology', 'digestion', 'nutrition'],
            position: { x: 0.5, y: 0.52 },
            baseForm: 'humanoid_viscera',
            transformationPath: ['efficient_digestion', 'alchemist_gut', 'transmutation_core']
        },

        KIDNEYS: {
            id: 'kidneys',
            name: 'Kidneys',
            description: 'Filters of renal understanding',
            domains: ['renal', 'nephrology', 'fluid_balance', 'filtration'],
            position: { x: 0.5, y: 0.48 },
            baseForm: 'humanoid_kidneys',
            transformationPath: ['clean_flow', 'crystal_filters', 'perfect_balance']
        },

        LIMBS: {
            id: 'limbs',
            name: 'Limbs',
            description: 'Extensions of musculoskeletal mastery',
            domains: ['musculoskeletal', 'orthopedics', 'movement', 'biomechanics'],
            position: { x: 0.5, y: 0.65 },
            baseForm: 'humanoid_limbs',
            transformationPath: ['strong_form', 'dynamic_motion', 'perfect_mechanics']
        },

        SKIN: {
            id: 'skin',
            name: 'Skin',
            description: 'Boundary of integumentary knowledge',
            domains: ['integumentary', 'dermatology', 'barrier', 'sensation'],
            position: { x: 0.5, y: 0.5 },
            baseForm: 'humanoid_skin',
            transformationPath: ['resilient_barrier', 'adaptive_surface', 'living_interface']
        },

        BLOOD: {
            id: 'blood',
            name: 'Blood',
            description: 'Flow of hematologic understanding',
            domains: ['hematology', 'immunology', 'coagulation', 'blood_cells'],
            position: { x: 0.5, y: 0.4 },
            baseForm: 'humanoid_blood',
            transformationPath: ['vital_flow', 'crimson_tide', 'life_essence']
        },

        SPINE: {
            id: 'spine',
            name: 'Spine',
            description: 'Axis of anatomical structure',
            domains: ['anatomy', 'structure', 'organization', 'foundation'],
            position: { x: 0.5, y: 0.4 },
            baseForm: 'humanoid_spine',
            transformationPath: ['solid_foundation', 'flexible_axis', 'perfect_structure']
        }
    };

    /**
     * Transformation Stages - Global evolution states
     */
    const TRANSFORMATION_STAGES = {
        NOVICE: {
            id: 'novice',
            name: 'Novice Form',
            description: 'Basic humanoid, all parts undeveloped',
            requiredMastery: 0,
            visualStyle: 'outline',
            glowIntensity: 0,
            particleEffect: null
        },

        AWAKENING: {
            id: 'awakening',
            name: 'Awakening Form',
            description: 'Beginning to develop in some areas',
            requiredMastery: 0.2,
            visualStyle: 'defined',
            glowIntensity: 0.2,
            particleEffect: 'subtle_shimmer'
        },

        DEVELOPING: {
            id: 'developing',
            name: 'Developing Form',
            description: 'Clear growth in multiple regions',
            requiredMastery: 0.4,
            visualStyle: 'detailed',
            glowIntensity: 0.4,
            particleEffect: 'soft_glow'
        },

        SPECIALIZED: {
            id: 'specialized',
            name: 'Specialized Form',
            description: 'Excel in one area, others developing',
            requiredMastery: 0.6,
            visualStyle: 'anatomical',
            glowIntensity: 0.6,
            particleEffect: 'domain_aura'
        },

        BALANCED: {
            id: 'balanced',
            name: 'Balanced Form',
            description: 'All systems developing together',
            requiredMastery: 0.75,
            visualStyle: 'harmonious',
            glowIntensity: 0.8,
            particleEffect: 'harmonic_resonance'
        },

        TRANSCENDENT: {
            id: 'transcendent',
            name: 'Transcendent Form',
            description: 'Full mastery - glowing, ethereal appearance',
            requiredMastery: 0.9,
            visualStyle: 'ethereal',
            glowIntensity: 1.0,
            particleEffect: 'radiant_transcendence'
        }
    };

    /**
     * Body Part States - Individual region conditions
     */
    const PART_STATES = {
        DORMANT: {
            id: 'dormant',
            name: 'Dormant',
            description: 'Not yet activated',
            visualModifier: 'dim',
            healthModifier: 0
        },

        HEALTHY: {
            id: 'healthy',
            name: 'Healthy',
            description: 'Normal functioning state',
            visualModifier: 'normal',
            healthModifier: 1.0
        },

        ATROPHIED: {
            id: 'atrophied',
            name: 'Atrophied',
            description: 'Weakened from neglect',
            visualModifier: 'withered',
            healthModifier: 0.5
        },

        MUTATED: {
            id: 'mutated',
            name: 'Mutated',
            description: 'Distorted by misconceptions',
            visualModifier: 'twisted',
            healthModifier: 0.3
        },

        ENHANCED: {
            id: 'enhanced',
            name: 'Enhanced',
            description: 'Strengthened beyond normal',
            visualModifier: 'glowing',
            healthModifier: 1.5
        },

        PERFECTED: {
            id: 'perfected',
            name: 'Perfected',
            description: 'Achieved ideal form',
            visualModifier: 'radiant',
            healthModifier: 2.0
        }
    };

    /**
     * Metamorphosis Engine
     */
    class MetamorphosisEngine {
        constructor() {
            this.state = this.loadState();
            this.initializeBody();
        }

        /**
         * Load or initialize state
         */
        loadState() {
            const saved = localStorage.getItem('metamorphosisEngine');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                body: {},                   // regionId -> region state
                overallStage: 'novice',
                mutations: [],              // Active mutations
                healedMutations: [],        // History of healed mutations
                atrophyTimers: {},          // regionId -> last active timestamp
                transformationHistory: [],  // Transformation events
                symbiosis: {
                    linkedPlayers: [],
                    sharedStrengths: []
                },
                achievements: [],
                statistics: {
                    totalTransformations: 0,
                    mutationsHealed: 0,
                    atrophyRecovered: 0,
                    peakMastery: 0
                },
                createdAt: Date.now(),
                lastMirrorCheck: null
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('metamorphosisEngine', JSON.stringify(this.state));
        }

        /**
         * Initialize body regions
         */
        initializeBody() {
            Object.values(BODY_REGIONS).forEach(region => {
                if (!this.state.body[region.id]) {
                    this.state.body[region.id] = {
                        regionId: region.id,
                        mastery: 0,
                        state: 'dormant',
                        transformationLevel: 0,      // 0-3 (path index)
                        currentForm: region.baseForm,
                        mutations: [],
                        lastActive: null,
                        questionsAnswered: 0,
                        correctAnswers: 0
                    };
                }
            });
            this.saveState();
        }

        /**
         * Map a question/category to body region
         */
        mapToBodyRegion(questionData) {
            const category = questionData.category || questionData.domain || '';
            const categoryLower = category.toLowerCase();

            // Find matching region
            for (const region of Object.values(BODY_REGIONS)) {
                for (const domain of region.domains) {
                    if (categoryLower.includes(domain) || domain.includes(categoryLower)) {
                        return region;
                    }
                }
            }

            // Default mapping based on keywords in question
            const questionText = (questionData.question || '').toLowerCase();

            if (questionText.includes('brain') || questionText.includes('neuro') || questionText.includes('nerve')) {
                return BODY_REGIONS.HEAD;
            }
            if (questionText.includes('heart') || questionText.includes('cardiac') || questionText.includes('blood pressure')) {
                return BODY_REGIONS.HEART;
            }
            if (questionText.includes('lung') || questionText.includes('breath') || questionText.includes('oxygen')) {
                return BODY_REGIONS.LUNGS;
            }
            if (questionText.includes('muscle') || questionText.includes('bone') || questionText.includes('joint')) {
                return BODY_REGIONS.LIMBS;
            }
            if (questionText.includes('kidney') || questionText.includes('urine') || questionText.includes('filtration')) {
                return BODY_REGIONS.KIDNEYS;
            }
            if (questionText.includes('stomach') || questionText.includes('intestin') || questionText.includes('digest')) {
                return BODY_REGIONS.VISCERA;
            }
            if (questionText.includes('hormone') || questionText.includes('endocrin') || questionText.includes('thyroid')) {
                return BODY_REGIONS.CORE;
            }
            if (questionText.includes('skin') || questionText.includes('derma')) {
                return BODY_REGIONS.SKIN;
            }
            if (questionText.includes('blood') || questionText.includes('hemoglobin') || questionText.includes('platelet')) {
                return BODY_REGIONS.BLOOD;
            }

            // Default to spine (foundation/general anatomy)
            return BODY_REGIONS.SPINE;
        }

        /**
         * Process question answer - update body
         */
        processAnswer(questionData, isCorrect, firstTry, masteryChange) {
            const region = this.mapToBodyRegion(questionData);
            const regionState = this.state.body[region.id];

            regionState.questionsAnswered++;
            regionState.lastActive = Date.now();
            this.state.atrophyTimers[region.id] = Date.now();

            if (isCorrect) {
                regionState.correctAnswers++;

                // Calculate mastery change
                const masteryGain = firstTry ? 0.05 : 0.025;
                regionState.mastery = Math.min(1, regionState.mastery + masteryGain + (masteryChange || 0));

                // Update state based on mastery
                this.updateRegionState(region.id);

                // Check for transformation
                const transformation = this.checkTransformation(region.id);

                this.saveState();

                return {
                    region,
                    regionState,
                    transformation,
                    message: this.generateProgressMessage(region, regionState, transformation)
                };
            } else {
                // Wrong answer - potential mutation
                const mutation = this.checkForMutation(region.id, questionData);

                this.saveState();

                return {
                    region,
                    regionState,
                    mutation,
                    message: mutation
                        ? this.generateMutationMessage(region, mutation)
                        : `Your ${region.name} remains stable despite the stumble.`
                };
            }
        }

        /**
         * Update region state based on mastery
         */
        updateRegionState(regionId) {
            const regionState = this.state.body[regionId];

            // Check for mutations first
            if (regionState.mutations.length > 0) {
                regionState.state = 'mutated';
                return;
            }

            // Update based on mastery
            if (regionState.mastery >= 0.9) {
                regionState.state = 'perfected';
            } else if (regionState.mastery >= 0.7) {
                regionState.state = 'enhanced';
            } else if (regionState.mastery >= 0.2) {
                regionState.state = 'healthy';
            } else if (regionState.mastery > 0) {
                regionState.state = 'dormant';
            }
        }

        /**
         * Check for transformation (level up within region)
         */
        checkTransformation(regionId) {
            const regionState = this.state.body[regionId];
            const region = BODY_REGIONS[regionId.toUpperCase()];
            const path = region.transformationPath;

            // Calculate required level based on mastery
            let targetLevel = 0;
            if (regionState.mastery >= 0.9) targetLevel = 3;
            else if (regionState.mastery >= 0.7) targetLevel = 2;
            else if (regionState.mastery >= 0.4) targetLevel = 1;

            if (targetLevel > regionState.transformationLevel) {
                const oldLevel = regionState.transformationLevel;
                regionState.transformationLevel = targetLevel;
                regionState.currentForm = path[targetLevel - 1] || region.baseForm;

                this.state.transformationHistory.push({
                    regionId,
                    fromLevel: oldLevel,
                    toLevel: targetLevel,
                    newForm: regionState.currentForm,
                    timestamp: Date.now()
                });

                this.state.statistics.totalTransformations++;

                // Update overall stage
                this.updateOverallStage();

                return {
                    occurred: true,
                    region,
                    fromLevel: oldLevel,
                    toLevel: targetLevel,
                    newForm: regionState.currentForm
                };
            }

            return { occurred: false };
        }

        /**
         * Update overall body stage
         */
        updateOverallStage() {
            const regions = Object.values(this.state.body);
            const avgMastery = regions.reduce((sum, r) => sum + r.mastery, 0) / regions.length;
            const minMastery = Math.min(...regions.map(r => r.mastery));
            const maxMastery = Math.max(...regions.map(r => r.mastery));

            // Check for specialization (high variance)
            const isSpecialized = maxMastery > 0.7 && minMastery < 0.4;

            // Check for balance (low variance)
            const isBalanced = maxMastery - minMastery < 0.2 && avgMastery > 0.6;

            // Determine stage
            let newStage = 'novice';

            if (avgMastery >= 0.9 && minMastery >= 0.8) {
                newStage = 'transcendent';
            } else if (isBalanced && avgMastery >= 0.7) {
                newStage = 'balanced';
            } else if (isSpecialized) {
                newStage = 'specialized';
            } else if (avgMastery >= 0.4) {
                newStage = 'developing';
            } else if (avgMastery >= 0.15) {
                newStage = 'awakening';
            }

            if (newStage !== this.state.overallStage) {
                this.state.overallStage = newStage;
            }

            // Track peak
            if (avgMastery > this.state.statistics.peakMastery) {
                this.state.statistics.peakMastery = avgMastery;
            }
        }

        /**
         * Generate progress message
         */
        generateProgressMessage(region, regionState, transformation) {
            if (transformation && transformation.occurred) {
                const messages = {
                    1: `Your ${region.name} awakens! The form shifts to ${transformation.newForm}.`,
                    2: `Your ${region.name} evolves! You achieve ${transformation.newForm}.`,
                    3: `Your ${region.name} transcends! The final form: ${transformation.newForm}.`
                };
                return messages[transformation.toLevel] || `Your ${region.name} transforms!`;
            }

            const stateMessages = {
                'healthy': `Your ${region.name} grows stronger.`,
                'enhanced': `Your ${region.name} radiates with knowledge.`,
                'perfected': `Your ${region.name} achieves perfection.`
            };

            return stateMessages[regionState.state] || `Your ${region.name} develops.`;
        }

        // =========================================================================
        // CYCLE 2: TRANSFORMATION SYSTEM - MUTATION, ATROPHY, EVOLUTION
        // =========================================================================

        /**
         * Mutation Types - Misconception manifestations
         */
        static MUTATION_TYPES = {
            CONFUSION_GROWTH: {
                id: 'confusion_growth',
                name: 'Confusion Growth',
                description: 'A distorted understanding takes root',
                severity: 1,
                visualEffect: 'bulge',
                healingRequired: 1
            },

            INVERTED_FUNCTION: {
                id: 'inverted_function',
                name: 'Inverted Function',
                description: 'The mechanism works backwards in your mind',
                severity: 2,
                visualEffect: 'twist',
                healingRequired: 2
            },

            PHANTOM_PATHWAY: {
                id: 'phantom_pathway',
                name: 'Phantom Pathway',
                description: 'A false connection that doesn\'t exist',
                severity: 2,
                visualEffect: 'extra_growth',
                healingRequired: 2
            },

            MEMORY_DECAY: {
                id: 'memory_decay',
                name: 'Memory Decay',
                description: 'The form crumbles where knowledge fades',
                severity: 1,
                visualEffect: 'erosion',
                healingRequired: 1
            },

            CONCEPTUAL_CHIMERA: {
                id: 'conceptual_chimera',
                name: 'Conceptual Chimera',
                description: 'Two distinct concepts fused incorrectly',
                severity: 3,
                visualEffect: 'fusion_mass',
                healingRequired: 3
            }
        };

        /**
         * Check for mutation from wrong answer
         */
        checkForMutation(regionId, questionData) {
            const regionState = this.state.body[regionId];

            // Higher chance of mutation with more severe misconceptions
            const baseMutationChance = 0.3;
            const recentWrongAnswers = this.countRecentWrongAnswers(regionId);

            let mutationChance = baseMutationChance;
            mutationChance += recentWrongAnswers * 0.1;

            if (Math.random() > mutationChance) {
                return null; // No mutation
            }

            // Determine mutation type
            const mutationType = this.determineMutationType(questionData, recentWrongAnswers);
            const mutationSpec = MetamorphosisEngine.MUTATION_TYPES[mutationType];

            const mutation = {
                id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: mutationType,
                name: mutationSpec.name,
                severity: mutationSpec.severity,
                regionId,
                sourceQuestionId: questionData.id,
                misconception: questionData.selectedDistractor || 'Unknown confusion',
                healingProgress: 0,
                healingRequired: mutationSpec.healingRequired,
                createdAt: Date.now()
            };

            regionState.mutations.push(mutation);
            regionState.state = 'mutated';
            this.state.mutations.push(mutation);

            this.saveState();

            return mutation;
        }

        /**
         * Count recent wrong answers for a region
         */
        countRecentWrongAnswers(regionId) {
            // In production, would check question statistics
            const regionState = this.state.body[regionId];
            const errorRate = regionState.questionsAnswered > 0
                ? 1 - (regionState.correctAnswers / regionState.questionsAnswered)
                : 0;
            return Math.floor(errorRate * 5);
        }

        /**
         * Determine mutation type based on context
         */
        determineMutationType(questionData, recentWrongAnswers) {
            if (recentWrongAnswers >= 3) {
                return 'CONCEPTUAL_CHIMERA';
            }
            if (questionData.type === 'mechanism' || questionData.type === 'process') {
                return 'INVERTED_FUNCTION';
            }
            if (questionData.type === 'connection' || questionData.type === 'relationship') {
                return 'PHANTOM_PATHWAY';
            }
            return 'CONFUSION_GROWTH';
        }

        /**
         * Generate mutation message
         */
        generateMutationMessage(region, mutation) {
            const messages = {
                'CONFUSION_GROWTH': `A confusion growth emerges on your ${region.name}. The form distorts slightly.`,
                'INVERTED_FUNCTION': `Your ${region.name} twists as understanding inverts. The mechanism runs backwards.`,
                'PHANTOM_PATHWAY': `A phantom pathway grows from your ${region.name}. A false connection forms.`,
                'MEMORY_DECAY': `Your ${region.name} shows signs of memory decay. The form erodes.`,
                'CONCEPTUAL_CHIMERA': `A conceptual chimera forms in your ${region.name}. Two ideas fuse incorrectly.`
            };
            return messages[mutation.type] || `Your ${region.name} mutates.`;
        }

        /**
         * Heal mutation through correct answers
         */
        healMutation(mutationId, questionData, isCorrect) {
            const mutation = this.state.mutations.find(m => m.id === mutationId);
            if (!mutation || isCorrect === false) {
                return { success: false };
            }

            mutation.healingProgress++;

            if (mutation.healingProgress >= mutation.healingRequired) {
                // Mutation healed
                mutation.healed = true;
                mutation.healedAt = Date.now();

                // Remove from region
                const regionState = this.state.body[mutation.regionId];
                regionState.mutations = regionState.mutations.filter(m => m.id !== mutationId);

                // Update region state
                this.updateRegionState(mutation.regionId);

                // Move to healed history
                this.state.healedMutations.push(mutation);
                this.state.mutations = this.state.mutations.filter(m => m.id !== mutationId);

                this.state.statistics.mutationsHealed++;

                this.saveState();

                return {
                    success: true,
                    healed: true,
                    mutation,
                    message: this.generateHealingMessage(mutation, true)
                };
            }

            this.saveState();

            return {
                success: true,
                healed: false,
                progress: mutation.healingProgress,
                remaining: mutation.healingRequired - mutation.healingProgress,
                message: this.generateHealingMessage(mutation, false)
            };
        }

        /**
         * Generate healing message
         */
        generateHealingMessage(mutation, fullyHealed) {
            const region = BODY_REGIONS[mutation.regionId.toUpperCase()];
            if (fullyHealed) {
                return `The ${mutation.name} in your ${region.name} dissolves! Understanding is restored.`;
            }
            return `The ${mutation.name} weakens. ${mutation.healingRequired - mutation.healingProgress} more correct answers to heal completely.`;
        }

        /**
         * Process atrophy from neglect
         */
        processAtrophy() {
            const now = Date.now();
            const atrophyThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
            const atrophiedRegions = [];

            Object.entries(this.state.body).forEach(([regionId, regionState]) => {
                if (regionState.state === 'dormant') return;
                if (regionState.mutations.length > 0) return; // Already mutated

                const lastActive = this.state.atrophyTimers[regionId] || regionState.lastActive;
                if (!lastActive) return;

                const timeSinceActive = now - lastActive;

                if (timeSinceActive > atrophyThreshold) {
                    // Apply atrophy
                    const atrophySeverity = Math.min(3, Math.floor(timeSinceActive / atrophyThreshold));
                    const masteryLoss = 0.05 * atrophySeverity;

                    regionState.mastery = Math.max(0, regionState.mastery - masteryLoss);

                    if (regionState.mastery < 0.2) {
                        regionState.state = 'atrophied';

                        // Spawn memory decay mutation
                        const decayMutation = {
                            id: `mut_decay_${Date.now()}`,
                            type: 'MEMORY_DECAY',
                            name: 'Memory Decay',
                            severity: 1,
                            regionId,
                            healingProgress: 0,
                            healingRequired: 1,
                            createdAt: now
                        };

                        regionState.mutations.push(decayMutation);
                        this.state.mutations.push(decayMutation);
                    }

                    atrophiedRegions.push({
                        region: BODY_REGIONS[regionId.toUpperCase()],
                        masteryLoss,
                        newMastery: regionState.mastery,
                        newState: regionState.state
                    });
                }
            });

            if (atrophiedRegions.length > 0) {
                this.state.statistics.atrophyRecovered += atrophiedRegions.length;
                this.saveState();
            }

            return atrophiedRegions;
        }

        /**
         * Recover from atrophy
         */
        recoverFromAtrophy(regionId, questionData, isCorrect, firstTry) {
            const regionState = this.state.body[regionId];

            if (regionState.state !== 'atrophied') {
                return { alreadyRecovered: true };
            }

            if (!isCorrect) {
                return { success: false };
            }

            // Each correct answer restores some mastery
            const recovery = firstTry ? 0.08 : 0.04;
            regionState.mastery = Math.min(1, regionState.mastery + recovery);

            // Check if recovered
            if (regionState.mastery >= 0.2) {
                regionState.state = 'healthy';
                this.state.atrophyTimers[regionId] = Date.now();

                this.saveState();

                return {
                    success: true,
                    fullyRecovered: true,
                    newMastery: regionState.mastery,
                    message: `Your ${BODY_REGIONS[regionId.toUpperCase()].name} recovers from atrophy!`
                };
            }

            this.saveState();

            return {
                success: true,
                fullyRecovered: false,
                newMastery: regionState.mastery,
                message: `Your ${BODY_REGIONS[regionId.toUpperCase()].name} strengthens. Recovery: ${Math.floor(regionState.mastery * 100)}%`
            };
        }

        /**
         * Get mirror view - current body state visualization
         */
        getMirrorView() {
            const stage = TRANSFORMATION_STAGES[this.state.overallStage.toUpperCase()];
            const regions = Object.entries(this.state.body).map(([regionId, regionState]) => {
                const region = BODY_REGIONS[regionId.toUpperCase()];
                const partState = PART_STATES[regionState.state.toUpperCase()];

                return {
                    id: regionId,
                    name: region.name,
                    position: region.position,
                    mastery: regionState.mastery,
                    state: regionState.state,
                    stateInfo: partState,
                    transformationLevel: regionState.transformationLevel,
                    currentForm: regionState.currentForm,
                    mutations: regionState.mutations.map(m => ({
                        id: m.id,
                        name: m.name,
                        severity: m.severity,
                        healingProgress: m.healingProgress,
                        healingRequired: m.healingRequired
                    })),
                    glowIntensity: this.calculateGlowIntensity(regionState),
                    isAtrophied: regionState.state === 'atrophied',
                    isMutated: regionState.mutations.length > 0
                };
            });

            this.state.lastMirrorCheck = Date.now();
            this.saveState();

            return {
                stage: this.state.overallStage,
                stageInfo: stage,
                regions,
                overallMastery: this.calculateOverallMastery(),
                activeMutations: this.state.mutations.filter(m => !m.healed).length,
                visualEffects: this.getActiveVisualEffects()
            };
        }

        /**
         * Calculate glow intensity for a region
         */
        calculateGlowIntensity(regionState) {
            if (regionState.state === 'mutated') return 0;
            if (regionState.state === 'atrophied') return 0.1;

            return regionState.mastery * (regionState.state === 'perfected' ? 1.2 : 1.0);
        }

        /**
         * Calculate overall mastery
         */
        calculateOverallMastery() {
            const regions = Object.values(this.state.body);
            return regions.reduce((sum, r) => sum + r.mastery, 0) / regions.length;
        }

        /**
         * Get active visual effects
         */
        getActiveVisualEffects() {
            const effects = [];
            const stage = TRANSFORMATION_STAGES[this.state.overallStage.toUpperCase()];

            if (stage.particleEffect) {
                effects.push({
                    type: 'particle',
                    effect: stage.particleEffect,
                    intensity: stage.glowIntensity
                });
            }

            // Add mutation effects
            this.state.mutations.filter(m => !m.healed).forEach(m => {
                const spec = MetamorphosisEngine.MUTATION_TYPES[m.type];
                effects.push({
                    type: 'mutation',
                    effect: spec.visualEffect,
                    regionId: m.regionId,
                    severity: m.severity
                });
            });

            return effects;
        }

        /**
         * Symbiosis - Link with another player
         */
        initiateSymbiosis(otherPlayerData) {
            // Share strengths
            const myStrengths = Object.entries(this.state.body)
                .filter(([id, state]) => state.mastery >= 0.7)
                .map(([id, state]) => ({
                    regionId: id,
                    mastery: state.mastery
                }));

            this.state.symbiosis.linkedPlayers.push({
                playerId: otherPlayerData.id,
                linkedAt: Date.now(),
                sharedStrengths: myStrengths
            });

            this.saveState();

            return {
                success: true,
                sharedStrengths: myStrengths,
                message: 'Symbiosis established. Your strengths flow between minds.'
            };
        }

        /**
         * Receive symbiosis bonus
         */
        receiveSymbiosisBonus(regionId, bonusAmount) {
            const regionState = this.state.body[regionId];
            if (!regionState) return { success: false };

            const actualBonus = Math.min(0.1, bonusAmount * 0.5); // 50% transfer efficiency
            regionState.mastery = Math.min(1, regionState.mastery + actualBonus);

            this.updateRegionState(regionId);
            this.saveState();

            return {
                success: true,
                bonusApplied: actualBonus,
                newMastery: regionState.mastery,
                message: `Your ${BODY_REGIONS[regionId.toUpperCase()].name} absorbs knowledge from symbiosis!`
            };
        }

        /**
         * Get ideal form comparison
         */
        getIdealFormComparison() {
            const regions = Object.entries(this.state.body).map(([regionId, regionState]) => {
                const region = BODY_REGIONS[regionId.toUpperCase()];
                return {
                    regionId,
                    name: region.name,
                    currentMastery: regionState.mastery,
                    idealMastery: 1.0,
                    deficit: 1.0 - regionState.mastery,
                    currentForm: regionState.currentForm,
                    idealForm: region.transformationPath[region.transformationPath.length - 1],
                    stepsToIdeal: 3 - regionState.transformationLevel
                };
            });

            return {
                regions: regions.sort((a, b) => b.deficit - a.deficit),
                overallProgress: this.calculateOverallMastery(),
                stageToTranscendence: this.stepsToTranscendence(),
                message: this.generateIdealComparisonMessage(regions)
            };
        }

        /**
         * Calculate steps to transcendence
         */
        stepsToTranscendence() {
            const regions = Object.values(this.state.body);
            const belowThreshold = regions.filter(r => r.mastery < 0.9);
            return belowThreshold.length;
        }

        /**
         * Generate ideal comparison message
         */
        generateIdealComparisonMessage(regions) {
            const worstRegion = regions[0];
            const bestRegion = regions[regions.length - 1];

            if (worstRegion.deficit < 0.1) {
                return 'Your form approaches transcendence. Every region glows with mastery.';
            }

            return `Your ${worstRegion.name} needs the most attention (${Math.floor(worstRegion.currentMastery * 100)}% mastery). Your ${bestRegion.name} leads the way (${Math.floor(bestRegion.currentMastery * 100)}% mastery).`;
        }

        /**
         * Get statistics
         */
        getStatistics() {
            return {
                ...this.state.statistics,
                overallStage: this.state.overallStage,
                overallMastery: this.calculateOverallMastery(),
                activeMutations: this.state.mutations.filter(m => !m.healed).length,
                healedMutations: this.state.healedMutations.length,
                transformationHistory: this.state.transformationHistory.slice(-10),
                regionSummary: Object.entries(this.state.body).map(([id, state]) => ({
                    region: BODY_REGIONS[id.toUpperCase()].name,
                    mastery: Math.floor(state.mastery * 100),
                    state: state.state,
                    level: state.transformationLevel
                }))
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Hook into question answering for body updates
     */
    function onQuestionAnswered(questionData, isCorrect, firstTry, masteryChange) {
        const engine = window.metamorphosisEngine;
        if (!engine) return null;

        return engine.processAnswer(questionData, isCorrect, firstTry, masteryChange);
    }

    /**
     * Check for atrophy on session start
     */
    function checkAtrophyOnSessionStart() {
        const engine = window.metamorphosisEngine;
        if (!engine) return null;

        return engine.processAtrophy();
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.metamorphosisEngine = new MetamorphosisEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            MetamorphosisEngine,
            BODY_REGIONS,
            TRANSFORMATION_STAGES,
            PART_STATES,
            onQuestionAnswered,
            checkAtrophyOnSessionStart
        };
    }

    console.log('[Metamorphosis Engine] Initialized - Body awaits transformation');

})();
