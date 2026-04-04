/**
 * @file 820.31.45-crafting-system.js
 * @codon 820.31.45
 * @version 2026-03-29
 * @brief Crafting System - Knowledge as Craftable Artifacts
 *
 * TAIDRGEF Signature: A.T.G.E.I
 * - A (Aggregate): Components aggregate into artifacts
 * - T (Transform): Raw facts transform into understanding
 * - G (Gravitate): Materials gravitate to recipes
 * - E (Emit): Crafted artifacts emit power
 * - I (Intensify): Quality intensifies with mastery
 *
 * Cycle 1: Resource gathering and recipe discovery
 * Cycle 2: Crafting mechanics and artifact system
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: RESOURCE GATHERING AND RECIPE DISCOVERY
    // =========================================================================

    /**
     * Material Types - Raw components for crafting
     */
    const MATERIAL_TYPES = {
        // Raw Materials - Individual facts and definitions
        RAW: {
            FACT_SHARD: {
                id: 'fact_shard',
                name: 'Fact Shard',
                description: 'A crystallized piece of raw knowledge',
                rarity: 'common',
                dropRate: 0.8,
                sources: ['definition', 'terminology', 'identification']
            },
            CONCEPT_ORE: {
                id: 'concept_ore',
                name: 'Concept Ore',
                description: 'Dense material containing core understanding',
                rarity: 'common',
                dropRate: 0.6,
                sources: ['concept', 'principle', 'rule']
            },
            MEMORY_DUST: {
                id: 'memory_dust',
                name: 'Memory Dust',
                description: 'Fine particles of recalled knowledge',
                rarity: 'common',
                dropRate: 0.9,
                sources: ['recall', 'review', 'spaced_repetition']
            },
            INSIGHT_GEM: {
                id: 'insight_gem',
                name: 'Insight Gem',
                description: 'A rare moment of sudden understanding',
                rarity: 'uncommon',
                dropRate: 0.3,
                sources: ['aha_moment', 'first_try_hard', 'breakthrough']
            }
        },

        // Blueprints - Mechanisms and processes
        BLUEPRINT: {
            MECHANISM_SCHEMA: {
                id: 'mechanism_schema',
                name: 'Mechanism Schema',
                description: 'The pattern of how something works',
                rarity: 'uncommon',
                dropRate: 0.4,
                sources: ['mechanism', 'process', 'how_it_works']
            },
            PROCESS_DIAGRAM: {
                id: 'process_diagram',
                name: 'Process Diagram',
                description: 'Sequential steps of a procedure',
                rarity: 'uncommon',
                dropRate: 0.4,
                sources: ['sequence', 'steps', 'procedure']
            },
            PATTERN_TEMPLATE: {
                id: 'pattern_template',
                name: 'Pattern Template',
                description: 'A reusable structure of understanding',
                rarity: 'rare',
                dropRate: 0.2,
                sources: ['pattern_recognition', 'analogy', 'template']
            }
        },

        // Catalysts - Clinical applications and triggers
        CATALYST: {
            CLINICAL_ESSENCE: {
                id: 'clinical_essence',
                name: 'Clinical Essence',
                description: 'Distilled real-world application',
                rarity: 'rare',
                dropRate: 0.25,
                sources: ['clinical', 'application', 'case_study']
            },
            TRIGGER_CRYSTAL: {
                id: 'trigger_crystal',
                name: 'Trigger Crystal',
                description: 'A context that activates understanding',
                rarity: 'uncommon',
                dropRate: 0.35,
                sources: ['context', 'trigger', 'cue']
            },
            SYNTHESIS_CATALYST: {
                id: 'synthesis_catalyst',
                name: 'Synthesis Catalyst',
                description: 'Enables the fusion of multiple concepts',
                rarity: 'rare',
                dropRate: 0.15,
                sources: ['integration', 'synthesis', 'connection']
            }
        },

        // Special Materials - Rare and powerful
        SPECIAL: {
            MASTERY_ESSENCE: {
                id: 'mastery_essence',
                name: 'Mastery Essence',
                description: 'Pure crystallized mastery',
                rarity: 'legendary',
                dropRate: 0.05,
                sources: ['mastery_achieved', 'perfect_streak', 'boss_defeated']
            },
            CONFUSION_REMNANT: {
                id: 'confusion_remnant',
                name: 'Confusion Remnant',
                description: 'The residue of defeated misconceptions',
                rarity: 'uncommon',
                dropRate: 0.5,
                sources: ['misconception_cleared', 'error_corrected']
            },
            TIME_FRAGMENT: {
                id: 'time_fragment',
                name: 'Time Fragment',
                description: 'A piece of learning history',
                rarity: 'rare',
                dropRate: 0.1,
                sources: ['long_streak', 'daily_commitment', 'milestone']
            }
        }
    };

    /**
     * Recipe Categories - Types of craftable items
     */
    const RECIPE_CATEGORIES = {
        TOOLS: {
            id: 'tools',
            name: 'Tools',
            description: 'Items that aid in learning',
            icon: 'hammer'
        },
        EQUIPMENT: {
            id: 'equipment',
            name: 'Equipment',
            description: 'Wearable items that grant bonuses',
            icon: 'shield'
        },
        CONSUMABLES: {
            id: 'consumables',
            name: 'Consumables',
            description: 'One-time use items',
            icon: 'potion'
        },
        ARTIFACTS: {
            id: 'artifacts',
            name: 'Artifacts',
            description: 'Powerful permanent items',
            icon: 'gem'
        },
        DECORATIONS: {
            id: 'decorations',
            name: 'Decorations',
            description: 'Workshop display items',
            icon: 'trophy'
        }
    };

    /**
     * Recipes - Combinations that create items
     */
    const RECIPES = {
        // Tools
        CLARITY_LENS: {
            id: 'clarity_lens',
            name: 'Clarity Lens',
            category: 'tools',
            description: 'Reveals one wrong answer as incorrect',
            materials: {
                fact_shard: 5,
                insight_gem: 1
            },
            craftingQuestion: {
                type: 'synthesis',
                prompt: 'To create clarity, you must combine observation with insight. Explain how knowing individual facts enables broader understanding.',
                minWords: 20
            },
            effect: {
                type: 'eliminate_wrong',
                power: 1,
                uses: 3
            },
            difficulty: 'basic'
        },

        MECHANISM_COMPASS: {
            id: 'mechanism_compass',
            name: 'Mechanism Compass',
            category: 'tools',
            description: 'Points toward the correct sequence in process questions',
            materials: {
                mechanism_schema: 2,
                process_diagram: 1,
                concept_ore: 3
            },
            craftingQuestion: {
                type: 'sequence',
                prompt: 'Mechanisms follow patterns. Arrange these steps in logical order:',
                requiresSequence: true
            },
            effect: {
                type: 'sequence_hint',
                power: 2,
                uses: 2
            },
            difficulty: 'intermediate'
        },

        // Equipment
        RECALL_RING: {
            id: 'recall_ring',
            name: 'Ring of Recall',
            category: 'equipment',
            description: 'Permanently increases XP from review questions',
            materials: {
                memory_dust: 10,
                time_fragment: 1,
                concept_ore: 5
            },
            craftingQuestion: {
                type: 'application',
                prompt: 'Memory strengthens through use. Describe how spaced repetition exploits the forgetting curve.',
                minWords: 30
            },
            effect: {
                type: 'xp_multiplier',
                power: 1.15,
                condition: 'review_questions'
            },
            difficulty: 'intermediate'
        },

        PATTERN_CLOAK: {
            id: 'pattern_cloak',
            name: 'Cloak of Patterns',
            category: 'equipment',
            description: 'Highlights similarities between current and past questions',
            materials: {
                pattern_template: 2,
                insight_gem: 2,
                mechanism_schema: 3
            },
            craftingQuestion: {
                type: 'comparison',
                prompt: 'Patterns repeat across domains. Identify the shared structure between two seemingly different concepts.',
                requiresComparison: true
            },
            effect: {
                type: 'pattern_highlight',
                power: 3
            },
            difficulty: 'advanced'
        },

        // Consumables
        INSIGHT_POTION: {
            id: 'insight_potion',
            name: 'Potion of Insight',
            category: 'consumables',
            description: 'Guarantees one scaffold explanation after wrong answer',
            materials: {
                insight_gem: 2,
                clinical_essence: 1
            },
            craftingQuestion: {
                type: 'explanation',
                prompt: 'Insight emerges from reflection. What makes an explanation effective?',
                minWords: 15
            },
            effect: {
                type: 'guaranteed_scaffold',
                power: 1
            },
            difficulty: 'basic'
        },

        SYNTHESIS_ELIXIR: {
            id: 'synthesis_elixir',
            name: 'Elixir of Synthesis',
            category: 'consumables',
            description: 'Doubles points for next integration question',
            materials: {
                synthesis_catalyst: 1,
                clinical_essence: 2,
                pattern_template: 1
            },
            craftingQuestion: {
                type: 'integration',
                prompt: 'Synthesis requires connecting the unconnected. How does understanding one system help understand another?',
                minWords: 40
            },
            effect: {
                type: 'point_multiplier',
                power: 2,
                condition: 'integration_questions',
                duration: 1
            },
            difficulty: 'advanced'
        },

        // Artifacts (Major items)
        ACTION_POTENTIAL_WAND: {
            id: 'action_potential_wand',
            name: 'Action Potential Wand',
            category: 'artifacts',
            description: 'Powerful artifact representing mastery of neural signaling',
            materials: {
                fact_shard: 10,
                mechanism_schema: 3,
                clinical_essence: 2,
                mastery_essence: 1
            },
            craftingQuestion: {
                type: 'clinical_integration',
                prompt: 'A local anesthetic blocks sodium channels. Explain which component of the action potential this disrupts and predict the clinical effect.',
                minWords: 50,
                requiresClinicalReasoning: true
            },
            effect: {
                type: 'domain_mastery_bonus',
                domain: 'neurophysiology',
                power: 1.2
            },
            difficulty: 'master',
            prerequisites: ['mechanism_compass', 'clarity_lens']
        },

        HEMOGLOBIN_HEART: {
            id: 'hemoglobin_heart',
            name: 'Heart of Hemoglobin',
            category: 'artifacts',
            description: 'Artifact of respiratory mastery - the oxygen affinity curves become intuitive',
            materials: {
                concept_ore: 15,
                clinical_essence: 3,
                synthesis_catalyst: 2,
                mastery_essence: 1
            },
            craftingQuestion: {
                type: 'clinical_integration',
                prompt: 'A patient arrives with carbon monoxide poisoning. Using your understanding of hemoglobin-oxygen binding, explain why oxygen saturation readings are misleading and what treatment is needed.',
                minWords: 60,
                requiresClinicalReasoning: true
            },
            effect: {
                type: 'domain_mastery_bonus',
                domain: 'respiratory',
                power: 1.25
            },
            difficulty: 'master',
            prerequisites: ['insight_potion']
        },

        // Decorations (Achievement display)
        FIRST_CRAFT_TROPHY: {
            id: 'first_craft_trophy',
            name: 'Trophy of First Creation',
            category: 'decorations',
            description: 'Commemorates your first successful craft',
            materials: {
                fact_shard: 3,
                memory_dust: 3
            },
            craftingQuestion: {
                type: 'reflection',
                prompt: 'What does it mean to create understanding rather than receive it?',
                minWords: 10
            },
            effect: {
                type: 'decoration',
                displayText: 'First Craftsman'
            },
            difficulty: 'basic',
            oneTimeCraft: true
        },

        CONFUSION_SLAYER_MEDAL: {
            id: 'confusion_slayer_medal',
            name: 'Medal of Confusion Slayer',
            category: 'decorations',
            description: 'Awarded for crafting with confusion remnants',
            materials: {
                confusion_remnant: 10,
                insight_gem: 3
            },
            craftingQuestion: {
                type: 'metacognition',
                prompt: 'Describe a misconception you once held and how you overcame it.',
                minWords: 30
            },
            effect: {
                type: 'decoration',
                displayText: 'Slayer of Confusion'
            },
            difficulty: 'intermediate',
            oneTimeCraft: true
        }
    };

    /**
     * Crafting System Engine
     */
    class CraftingSystemEngine {
        constructor() {
            this.state = this.loadState();
            this.initializeMaterials();
        }

        /**
         * Load or initialize state
         */
        loadState() {
            const saved = localStorage.getItem('craftingSystem');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                inventory: {},              // materialId -> count
                discoveredRecipes: [],      // Recipe IDs the player knows
                craftedItems: [],           // Crafted item instances
                equippedItems: {},          // slot -> item
                workshop: {
                    displayedItems: [],
                    craftingBench: null,
                    lastCraft: null
                },
                statistics: {
                    totalCrafts: 0,
                    perfectCrafts: 0,
                    failedCrafts: 0,
                    materialsGathered: 0,
                    recipesDiscovered: 0
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('craftingSystem', JSON.stringify(this.state));
        }

        /**
         * Initialize material tracking
         */
        initializeMaterials() {
            const allMaterials = [
                ...Object.values(MATERIAL_TYPES.RAW),
                ...Object.values(MATERIAL_TYPES.BLUEPRINT),
                ...Object.values(MATERIAL_TYPES.CATALYST),
                ...Object.values(MATERIAL_TYPES.SPECIAL)
            ];

            allMaterials.forEach(mat => {
                if (this.state.inventory[mat.id] === undefined) {
                    this.state.inventory[mat.id] = 0;
                }
            });
        }

        /**
         * Gather materials from question answer
         */
        gatherMaterials(questionData, isCorrect, firstTry, masteryChange) {
            if (!isCorrect) {
                // Wrong answers can still drop confusion remnants
                return this.tryDropMaterial('confusion_remnant', 0.3);
            }

            const gathered = [];
            const questionType = questionData.type || 'recall';
            const difficulty = questionData.difficulty || 'medium';

            // Determine which materials can drop
            const allMaterials = [
                ...Object.values(MATERIAL_TYPES.RAW),
                ...Object.values(MATERIAL_TYPES.BLUEPRINT),
                ...Object.values(MATERIAL_TYPES.CATALYST),
                ...Object.values(MATERIAL_TYPES.SPECIAL)
            ];

            allMaterials.forEach(material => {
                if (material.sources.includes(questionType) ||
                    this.questionTypeMatchesMaterial(questionType, material)) {

                    let dropChance = material.dropRate;

                    // Modifiers
                    if (firstTry) dropChance *= 1.5;
                    if (difficulty === 'hard') dropChance *= 1.3;
                    if (masteryChange > 0.1) dropChance *= 1.2;

                    const drop = this.tryDropMaterial(material.id, dropChance);
                    if (drop) {
                        gathered.push(drop);
                    }
                }
            });

            // Special drops
            if (firstTry && difficulty === 'hard') {
                const insightDrop = this.tryDropMaterial('insight_gem', 0.4);
                if (insightDrop) gathered.push(insightDrop);
            }

            if (masteryChange >= 0.2) {
                const masteryDrop = this.tryDropMaterial('mastery_essence', 0.1);
                if (masteryDrop) gathered.push(masteryDrop);
            }

            this.saveState();

            return {
                gathered,
                totalMaterials: gathered.reduce((sum, g) => sum + g.quantity, 0),
                message: this.generateGatherMessage(gathered)
            };
        }

        /**
         * Check if question type matches material sources
         */
        questionTypeMatchesMaterial(questionType, material) {
            const typeMap = {
                'definition': ['fact_shard', 'concept_ore'],
                'mechanism': ['mechanism_schema', 'process_diagram'],
                'clinical': ['clinical_essence', 'trigger_crystal'],
                'integration': ['synthesis_catalyst', 'pattern_template'],
                'recall': ['memory_dust', 'fact_shard'],
                'application': ['clinical_essence', 'trigger_crystal']
            };

            const materialTypes = typeMap[questionType] || [];
            return materialTypes.includes(material.id);
        }

        /**
         * Try to drop a material based on chance
         */
        tryDropMaterial(materialId, dropChance) {
            if (Math.random() > dropChance) return null;

            // Determine quantity (usually 1, sometimes more)
            let quantity = 1;
            if (Math.random() < 0.1) quantity = 2;
            if (Math.random() < 0.02) quantity = 3;

            this.state.inventory[materialId] = (this.state.inventory[materialId] || 0) + quantity;
            this.state.statistics.materialsGathered += quantity;

            return {
                materialId,
                quantity,
                material: this.getMaterialSpec(materialId)
            };
        }

        /**
         * Get material specification by ID
         */
        getMaterialSpec(materialId) {
            const allMaterials = {
                ...MATERIAL_TYPES.RAW,
                ...MATERIAL_TYPES.BLUEPRINT,
                ...MATERIAL_TYPES.CATALYST,
                ...MATERIAL_TYPES.SPECIAL
            };

            return Object.values(allMaterials).find(m => m.id === materialId);
        }

        /**
         * Get current inventory
         */
        getInventory() {
            const inventory = [];
            Object.entries(this.state.inventory).forEach(([materialId, count]) => {
                if (count > 0) {
                    inventory.push({
                        materialId,
                        count,
                        material: this.getMaterialSpec(materialId)
                    });
                }
            });
            return inventory.sort((a, b) => b.count - a.count);
        }

        /**
         * Discover a recipe
         */
        discoverRecipe(recipeId, discoverySource = 'exploration') {
            if (this.state.discoveredRecipes.includes(recipeId)) {
                return { success: false, alreadyKnown: true };
            }

            const recipe = RECIPES[recipeId.toUpperCase()];
            if (!recipe) {
                return { success: false, error: 'Unknown recipe' };
            }

            this.state.discoveredRecipes.push(recipeId);
            this.state.statistics.recipesDiscovered++;
            this.saveState();

            return {
                success: true,
                recipe,
                message: `Recipe discovered: ${recipe.name}!`
            };
        }

        /**
         * Auto-discover recipes based on materials
         */
        checkForRecipeDiscovery() {
            const discovered = [];

            Object.entries(RECIPES).forEach(([id, recipe]) => {
                if (this.state.discoveredRecipes.includes(recipe.id)) return;

                // Check if player has seen all required materials
                const hasSeenAllMaterials = Object.keys(recipe.materials).every(matId =>
                    this.state.inventory[matId] !== undefined &&
                    this.state.statistics.materialsGathered > 0
                );

                // Random discovery chance when materials are available
                if (hasSeenAllMaterials && Math.random() < 0.1) {
                    const result = this.discoverRecipe(recipe.id, 'material_insight');
                    if (result.success) discovered.push(result);
                }
            });

            return discovered;
        }

        /**
         * Get available recipes (discovered and craftable)
         */
        getAvailableRecipes() {
            return this.state.discoveredRecipes.map(recipeId => {
                const recipe = RECIPES[recipeId.toUpperCase()] ||
                    Object.values(RECIPES).find(r => r.id === recipeId);
                if (!recipe) return null;

                const canCraft = this.canCraftRecipe(recipe);
                const missingMaterials = this.getMissingMaterials(recipe);

                return {
                    ...recipe,
                    canCraft,
                    missingMaterials
                };
            }).filter(r => r !== null);
        }

        /**
         * Check if recipe can be crafted
         */
        canCraftRecipe(recipe) {
            // Check materials
            for (const [matId, needed] of Object.entries(recipe.materials)) {
                if ((this.state.inventory[matId] || 0) < needed) {
                    return false;
                }
            }

            // Check prerequisites
            if (recipe.prerequisites) {
                for (const prereq of recipe.prerequisites) {
                    const hasCrafted = this.state.craftedItems.some(item =>
                        item.recipeId === prereq
                    );
                    if (!hasCrafted) return false;
                }
            }

            // Check one-time craft
            if (recipe.oneTimeCraft) {
                const alreadyCrafted = this.state.craftedItems.some(item =>
                    item.recipeId === recipe.id
                );
                if (alreadyCrafted) return false;
            }

            return true;
        }

        /**
         * Get missing materials for a recipe
         */
        getMissingMaterials(recipe) {
            const missing = [];
            for (const [matId, needed] of Object.entries(recipe.materials)) {
                const have = this.state.inventory[matId] || 0;
                if (have < needed) {
                    missing.push({
                        materialId: matId,
                        material: this.getMaterialSpec(matId),
                        needed,
                        have,
                        deficit: needed - have
                    });
                }
            }
            return missing;
        }

        /**
         * Generate gather message
         */
        generateGatherMessage(gathered) {
            if (gathered.length === 0) {
                return 'No materials gathered this time.';
            }

            const items = gathered.map(g =>
                `${g.quantity}x ${g.material?.name || g.materialId}`
            ).join(', ');

            return `Materials gathered: ${items}`;
        }

        // =========================================================================
        // CYCLE 2: CRAFTING MECHANICS AND ARTIFACT SYSTEM
        // =========================================================================

        /**
         * Start crafting process
         */
        startCraft(recipeId) {
            const recipe = RECIPES[recipeId.toUpperCase()] ||
                Object.values(RECIPES).find(r => r.id === recipeId);

            if (!recipe) {
                return { success: false, error: 'Unknown recipe' };
            }

            if (!this.canCraftRecipe(recipe)) {
                return {
                    success: false,
                    error: 'Cannot craft - missing materials or prerequisites',
                    missingMaterials: this.getMissingMaterials(recipe)
                };
            }

            // Set up crafting bench
            this.state.workshop.craftingBench = {
                recipeId: recipe.id,
                recipe,
                startedAt: Date.now(),
                materialsLocked: { ...recipe.materials },
                phase: 'questioning'
            };

            this.saveState();

            return {
                success: true,
                recipe,
                craftingQuestion: recipe.craftingQuestion,
                message: `Crafting ${recipe.name}. Answer the crafting question to complete.`
            };
        }

        /**
         * Submit crafting question answer
         */
        submitCraftAnswer(answer) {
            const bench = this.state.workshop.craftingBench;
            if (!bench || bench.phase !== 'questioning') {
                return { success: false, error: 'No active crafting session' };
            }

            const recipe = bench.recipe;
            const questionSpec = recipe.craftingQuestion;

            // Evaluate answer quality
            const evaluation = this.evaluateCraftAnswer(answer, questionSpec);

            if (!evaluation.passed) {
                // Failed craft - lose some materials
                this.consumeMaterials(recipe.materials, 0.5); // Lose half
                this.state.statistics.failedCrafts++;
                this.state.workshop.craftingBench = null;
                this.saveState();

                return {
                    success: false,
                    craftFailed: true,
                    evaluation,
                    materialsLost: this.calculateLostMaterials(recipe.materials, 0.5),
                    message: `Crafting failed: ${evaluation.feedback}. Some materials were lost.`
                };
            }

            // Successful craft
            this.consumeMaterials(recipe.materials, 1.0);

            const craftedItem = this.createCraftedItem(recipe, evaluation.quality);

            this.state.craftedItems.push(craftedItem);
            this.state.statistics.totalCrafts++;
            if (evaluation.quality >= 0.9) {
                this.state.statistics.perfectCrafts++;
            }
            this.state.workshop.lastCraft = craftedItem;
            this.state.workshop.craftingBench = null;

            this.saveState();

            return {
                success: true,
                craftedItem,
                quality: evaluation.quality,
                evaluation,
                message: this.generateCraftSuccessMessage(craftedItem, evaluation)
            };
        }

        /**
         * Evaluate craft answer quality
         */
        evaluateCraftAnswer(answer, questionSpec) {
            // Basic evaluation logic
            const wordCount = answer.trim().split(/\s+/).length;

            // Check minimum words if required
            if (questionSpec.minWords && wordCount < questionSpec.minWords) {
                return {
                    passed: false,
                    quality: 0,
                    feedback: `Answer too brief. Need at least ${questionSpec.minWords} words, got ${wordCount}.`
                };
            }

            // Calculate quality based on various factors
            let quality = 0.5; // Base quality

            // Word count bonus (up to 0.2)
            const wordBonus = Math.min(0.2, (wordCount - (questionSpec.minWords || 10)) / 50);
            quality += wordBonus;

            // Check for key elements based on question type
            const answerLower = answer.toLowerCase();

            if (questionSpec.type === 'clinical_integration') {
                // Look for clinical reasoning indicators
                const clinicalTerms = ['patient', 'treatment', 'symptom', 'diagnosis', 'because', 'therefore', 'results in'];
                const termCount = clinicalTerms.filter(t => answerLower.includes(t)).length;
                quality += Math.min(0.2, termCount * 0.03);
            }

            if (questionSpec.type === 'synthesis' || questionSpec.type === 'integration') {
                // Look for connection words
                const connectionTerms = ['connects', 'relates', 'because', 'therefore', 'leads to', 'enables', 'combined'];
                const termCount = connectionTerms.filter(t => answerLower.includes(t)).length;
                quality += Math.min(0.15, termCount * 0.03);
            }

            if (questionSpec.type === 'explanation') {
                // Look for explanatory structure
                const explanationTerms = ['first', 'then', 'because', 'this means', 'for example', 'specifically'];
                const termCount = explanationTerms.filter(t => answerLower.includes(t)).length;
                quality += Math.min(0.15, termCount * 0.03);
            }

            // Bonus for depth (multiple sentences)
            const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
            quality += Math.min(0.1, sentences * 0.02);

            // Cap quality at 1.0
            quality = Math.min(1.0, quality);

            // Determine pass/fail
            const passed = quality >= 0.4;

            return {
                passed,
                quality,
                feedback: passed
                    ? this.getQualityFeedback(quality)
                    : 'Answer lacks sufficient depth or understanding. Try to be more thorough.'
            };
        }

        /**
         * Get quality feedback message
         */
        getQualityFeedback(quality) {
            if (quality >= 0.9) return 'Masterwork! Your understanding shines through.';
            if (quality >= 0.75) return 'Excellent craftsmanship. Deep understanding evident.';
            if (quality >= 0.6) return 'Good work. Solid understanding demonstrated.';
            return 'Acceptable. The basics are there.';
        }

        /**
         * Consume materials for crafting
         */
        consumeMaterials(materials, proportion = 1.0) {
            Object.entries(materials).forEach(([matId, amount]) => {
                const toConsume = Math.ceil(amount * proportion);
                this.state.inventory[matId] = Math.max(0,
                    (this.state.inventory[matId] || 0) - toConsume
                );
            });
        }

        /**
         * Calculate lost materials
         */
        calculateLostMaterials(materials, proportion) {
            const lost = [];
            Object.entries(materials).forEach(([matId, amount]) => {
                const lostAmount = Math.ceil(amount * proportion);
                lost.push({
                    materialId: matId,
                    amount: lostAmount,
                    material: this.getMaterialSpec(matId)
                });
            });
            return lost;
        }

        /**
         * Create crafted item instance
         */
        createCraftedItem(recipe, quality) {
            const qualityTier = this.getQualityTier(quality);

            return {
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                recipeId: recipe.id,
                name: recipe.name,
                qualityName: qualityTier.name,
                quality,
                category: recipe.category,
                effect: this.scaleEffect(recipe.effect, quality),
                craftedAt: Date.now(),
                uses: recipe.effect.uses || null,
                maxUses: recipe.effect.uses || null,
                equipped: false
            };
        }

        /**
         * Get quality tier
         */
        getQualityTier(quality) {
            if (quality >= 0.95) return { name: 'Legendary', multiplier: 1.5 };
            if (quality >= 0.85) return { name: 'Epic', multiplier: 1.3 };
            if (quality >= 0.70) return { name: 'Rare', multiplier: 1.15 };
            if (quality >= 0.50) return { name: 'Uncommon', multiplier: 1.0 };
            return { name: 'Common', multiplier: 0.85 };
        }

        /**
         * Scale effect based on quality
         */
        scaleEffect(baseEffect, quality) {
            const tier = this.getQualityTier(quality);
            const scaledEffect = { ...baseEffect };

            if (scaledEffect.power) {
                scaledEffect.power = baseEffect.power * tier.multiplier;
            }
            if (scaledEffect.uses) {
                scaledEffect.uses = Math.ceil(baseEffect.uses * tier.multiplier);
            }

            return scaledEffect;
        }

        /**
         * Generate craft success message
         */
        generateCraftSuccessMessage(item, evaluation) {
            const tier = this.getQualityTier(evaluation.quality);
            return `Crafted ${tier.name} ${item.name}! ${evaluation.feedback}`;
        }

        /**
         * Equip an item
         */
        equipItem(itemId) {
            const item = this.state.craftedItems.find(i => i.id === itemId);
            if (!item) {
                return { success: false, error: 'Item not found' };
            }

            if (item.category === 'consumables' || item.category === 'decorations') {
                return { success: false, error: 'This item cannot be equipped' };
            }

            // Unequip current item in same slot
            const slot = item.category;
            if (this.state.equippedItems[slot]) {
                const currentEquipped = this.state.craftedItems.find(i =>
                    i.id === this.state.equippedItems[slot]
                );
                if (currentEquipped) {
                    currentEquipped.equipped = false;
                }
            }

            // Equip new item
            item.equipped = true;
            this.state.equippedItems[slot] = itemId;

            this.saveState();

            return {
                success: true,
                item,
                message: `Equipped ${item.name}`
            };
        }

        /**
         * Use a consumable item
         */
        useConsumable(itemId) {
            const item = this.state.craftedItems.find(i => i.id === itemId);
            if (!item) {
                return { success: false, error: 'Item not found' };
            }

            if (item.category !== 'consumables') {
                return { success: false, error: 'This item is not consumable' };
            }

            if (item.uses !== null && item.uses <= 0) {
                return { success: false, error: 'Item has no uses remaining' };
            }

            // Apply effect
            const effect = this.applyItemEffect(item);

            // Consume use
            if (item.uses !== null) {
                item.uses--;
                if (item.uses <= 0) {
                    // Remove item
                    this.state.craftedItems = this.state.craftedItems.filter(i =>
                        i.id !== itemId
                    );
                }
            }

            this.saveState();

            return {
                success: true,
                effect,
                usesRemaining: item.uses,
                consumed: item.uses === null || item.uses <= 0,
                message: `Used ${item.name}`
            };
        }

        /**
         * Apply item effect
         */
        applyItemEffect(item) {
            // Return effect data for external systems to apply
            return {
                type: item.effect.type,
                power: item.effect.power,
                condition: item.effect.condition,
                duration: item.effect.duration,
                itemName: item.name,
                quality: item.qualityName
            };
        }

        /**
         * Display item in workshop
         */
        displayInWorkshop(itemId) {
            const item = this.state.craftedItems.find(i => i.id === itemId);
            if (!item || item.category !== 'decorations') {
                return { success: false, error: 'Only decorations can be displayed' };
            }

            if (!this.state.workshop.displayedItems.includes(itemId)) {
                this.state.workshop.displayedItems.push(itemId);
            }

            this.saveState();

            return {
                success: true,
                item,
                message: `${item.name} is now displayed in your workshop`
            };
        }

        /**
         * Get active effects from equipped items
         */
        getActiveEffects() {
            const effects = [];

            Object.values(this.state.equippedItems).forEach(itemId => {
                const item = this.state.craftedItems.find(i => i.id === itemId);
                if (item && item.equipped) {
                    effects.push({
                        source: item.name,
                        quality: item.qualityName,
                        ...item.effect
                    });
                }
            });

            return effects;
        }

        /**
         * Get workshop display data
         */
        getWorkshopDisplay() {
            return {
                displayedItems: this.state.workshop.displayedItems.map(id => {
                    const item = this.state.craftedItems.find(i => i.id === id);
                    return item || null;
                }).filter(i => i !== null),
                lastCraft: this.state.workshop.lastCraft,
                craftingBench: this.state.workshop.craftingBench,
                totalCrafts: this.state.statistics.totalCrafts,
                perfectCrafts: this.state.statistics.perfectCrafts
            };
        }

        /**
         * Get full statistics
         */
        getStatistics() {
            return {
                ...this.state.statistics,
                inventory: this.getInventory(),
                discoveredRecipes: this.state.discoveredRecipes.length,
                totalRecipes: Object.keys(RECIPES).length,
                craftedItems: this.state.craftedItems.length,
                equippedItems: Object.keys(this.state.equippedItems).length
            };
        }

        /**
         * Cancel active crafting
         */
        cancelCraft() {
            if (!this.state.workshop.craftingBench) {
                return { success: false, error: 'No active crafting' };
            }

            this.state.workshop.craftingBench = null;
            this.saveState();

            return {
                success: true,
                message: 'Crafting cancelled. Materials preserved.'
            };
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Hook into question answering for material gathering
     */
    function onQuestionAnswered(questionData, isCorrect, firstTry, masteryChange) {
        const engine = window.craftingSystem;
        if (!engine) return null;

        const result = engine.gatherMaterials(questionData, isCorrect, firstTry, masteryChange);

        // Check for recipe discovery
        const discoveries = engine.checkForRecipeDiscovery();

        return {
            materials: result,
            discoveries
        };
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.craftingSystem = new CraftingSystemEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            CraftingSystemEngine,
            MATERIAL_TYPES,
            RECIPE_CATEGORIES,
            RECIPES,
            onQuestionAnswered
        };
    }

    console.log('[Crafting System] Initialized - Workshop ready');

})();
