/**
 * @file 820.31.44-dream-laboratory.js
 * @codon 820.31.44
 * @version 2026-03-29
 * @brief Dream Laboratory - Memory Palace as Surrealist Dreamscape
 *
 * TAIDRGEF Signature: A.G.E.T.F
 * - A (Aggregate): Dream elements aggregate into Memory Palace
 * - G (Gravitate): Concepts gravitate to spatial locations
 * - E (Emit): Correct answers emit architectural elements
 * - T (Transform): Nightmares transform into understanding
 * - F (Frame): Dreams frame knowledge as spatial experience
 *
 * Cycle 1: Dreamscape builder - Memory Palace architecture
 * Cycle 2: Nightmare system - Misconceptions as nightmares
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: DREAMSCAPE BUILDER - MEMORY PALACE ARCHITECTURE
    // =========================================================================

    /**
     * Dream Element Types - Building blocks of the Memory Palace
     * Each type corresponds to a depth of understanding
     */
    const DREAM_ELEMENT_TYPES = {
        // Foundations - Basic definitions (floor, walls)
        FOUNDATION: {
            id: 'foundation',
            name: 'Foundation',
            description: 'Basic definitions and core facts',
            visualCategory: 'structure',
            requiredMastery: 0.2,
            elements: ['floor', 'walls', 'cornerstone', 'threshold', 'archway']
        },

        // Structures - Mechanisms (furniture, fixtures)
        STRUCTURE: {
            id: 'structure',
            name: 'Structure',
            description: 'Mechanisms and processes',
            visualCategory: 'furniture',
            requiredMastery: 0.4,
            elements: ['pillar', 'staircase', 'bridge', 'corridor', 'chamber']
        },

        // Decorations - Details (art, ornaments)
        DECORATION: {
            id: 'decoration',
            name: 'Decoration',
            description: 'Details and nuances',
            visualCategory: 'ornament',
            requiredMastery: 0.6,
            elements: ['painting', 'sculpture', 'tapestry', 'mirror', 'crystal']
        },

        // Inhabitants - Clinical applications (dream characters)
        INHABITANT: {
            id: 'inhabitant',
            name: 'Inhabitant',
            description: 'Clinical applications and real-world connections',
            visualCategory: 'character',
            requiredMastery: 0.75,
            elements: ['guardian', 'sage', 'wanderer', 'keeper', 'oracle']
        },

        // Atmosphere - Integration (lighting, weather, mood)
        ATMOSPHERE: {
            id: 'atmosphere',
            name: 'Atmosphere',
            description: 'Integration and synthesis understanding',
            visualCategory: 'ambient',
            requiredMastery: 0.9,
            elements: ['sunlight', 'starfield', 'aurora', 'mist', 'resonance']
        }
    };

    /**
     * Dream Powers - Metacognitive abilities unlocked through mastery
     */
    const DREAM_POWERS = {
        LUCID_AWARENESS: {
            id: 'lucid_awareness',
            name: 'Lucid Awareness',
            description: 'See the "true form" of a question before answering',
            unlockCondition: { totalElements: 10 },
            effect: 'Reveals question difficulty and category before answering',
            usesPerSession: 3
        },

        DREAM_WALKING: {
            id: 'dream_walking',
            name: 'Dream Walking',
            description: 'Visit the Collective Unconscious to see population patterns',
            unlockCondition: { totalElements: 25 },
            effect: 'Shows anonymized aggregate dream data',
            usesPerSession: 2
        },

        INCEPTION: {
            id: 'inception',
            name: 'Inception',
            description: 'Plant a "seed idea" that grows into understanding',
            unlockCondition: { totalElements: 50 },
            effect: 'Creates a learning bookmark that triggers spaced repetition',
            usesPerSession: 1
        },

        LUCID_COMBAT: {
            id: 'lucid_combat',
            name: 'Lucid Combat',
            description: 'Fight nightmares with enhanced clarity',
            unlockCondition: { nightmaresDefeated: 10 },
            effect: 'Gain hint during nightmare combat',
            usesPerSession: 2
        },

        DREAM_ARCHITECT: {
            id: 'dream_architect',
            name: 'Dream Architect',
            description: 'Rearrange your Memory Palace layout',
            unlockCondition: { completePalaces: 1 },
            effect: 'Reorganize concept connections in your dream',
            usesPerSession: 1
        }
    };

    /**
     * Dream Room Templates - Spatial organization of knowledge
     */
    const ROOM_TEMPLATES = {
        ENTRY_HALL: {
            id: 'entry_hall',
            name: 'Entry Hall',
            description: 'The first room - where a topic begins',
            maxElements: 5,
            elementSlots: ['foundation', 'foundation', 'structure', 'decoration', 'atmosphere']
        },

        GALLERY: {
            id: 'gallery',
            name: 'Gallery',
            description: 'A display space for related concepts',
            maxElements: 8,
            elementSlots: ['structure', 'decoration', 'decoration', 'decoration', 'inhabitant', 'atmosphere', 'atmosphere', 'foundation']
        },

        SANCTUARY: {
            id: 'sanctuary',
            name: 'Sanctuary',
            description: 'A protected space for deep understanding',
            maxElements: 6,
            elementSlots: ['foundation', 'structure', 'inhabitant', 'inhabitant', 'atmosphere', 'atmosphere']
        },

        LABORATORY: {
            id: 'laboratory',
            name: 'Laboratory',
            description: 'Where mechanisms are explored',
            maxElements: 10,
            elementSlots: ['structure', 'structure', 'structure', 'structure', 'decoration', 'decoration', 'inhabitant', 'foundation', 'foundation', 'atmosphere']
        },

        TOWER: {
            id: 'tower',
            name: 'Tower',
            description: 'Ascending understanding - integration concepts',
            maxElements: 7,
            elementSlots: ['foundation', 'structure', 'structure', 'decoration', 'inhabitant', 'atmosphere', 'atmosphere']
        }
    };

    /**
     * Dream Laboratory Engine - Core system
     */
    class DreamLaboratoryEngine {
        constructor() {
            this.state = this.loadState();
            this.initializeDreamscape();
        }

        /**
         * Load or initialize dreamscape state
         */
        loadState() {
            const saved = localStorage.getItem('dreamLaboratory');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                dreamscapes: {},           // categoryId -> dreamscape data
                nightmares: {},            // Active nightmares by category
                defeatedNightmares: [],    // History of defeated nightmares
                powers: {},                // Unlocked powers and usage
                totalElementsPlaced: 0,
                completePalaces: 0,
                lucidDreamSessions: 0,
                collectiveContributions: 0,
                createdAt: Date.now(),
                lastDreamAt: null
            };
        }

        /**
         * Save state to persistence
         */
        saveState() {
            localStorage.setItem('dreamLaboratory', JSON.stringify(this.state));
        }

        /**
         * Initialize dreamscape from learning analytics
         */
        initializeDreamscape() {
            // Access learning analytics if available
            if (typeof window.learningAnalytics !== 'undefined') {
                const categories = this.getAvailableCategories();
                categories.forEach(category => {
                    if (!this.state.dreamscapes[category.id]) {
                        this.createDreamscapeForCategory(category);
                    }
                });
            }
        }

        /**
         * Get available categories from question registry
         */
        getAvailableCategories() {
            if (typeof window.questionRegistry !== 'undefined') {
                return Object.keys(window.questionRegistry.categories || {}).map(id => ({
                    id,
                    name: window.questionRegistry.categories[id]?.name || id
                }));
            }
            // Fallback categories
            return [
                { id: 'respiratory', name: 'Respiratory System' },
                { id: 'cardiovascular', name: 'Cardiovascular System' },
                { id: 'nervous', name: 'Nervous System' }
            ];
        }

        /**
         * Create a new dreamscape for a category
         */
        createDreamscapeForCategory(category) {
            const dreamscape = {
                id: category.id,
                name: `${category.name} Dream`,
                rooms: [],
                elements: [],
                connections: [],
                completionLevel: 0,
                lastVisited: null,
                atmosphericState: 'void'   // void -> forming -> stable -> luminous
            };

            // Create initial entry hall
            const entryHall = this.createRoom('entry_hall', category.id, 'Entry Hall');
            dreamscape.rooms.push(entryHall);

            this.state.dreamscapes[category.id] = dreamscape;
            this.saveState();
            return dreamscape;
        }

        /**
         * Create a room within a dreamscape
         */
        createRoom(templateId, categoryId, customName = null) {
            const template = ROOM_TEMPLATES[templateId.toUpperCase()] || ROOM_TEMPLATES.ENTRY_HALL;
            return {
                id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                templateId: template.id,
                name: customName || template.name,
                categoryId: categoryId,
                elements: [],
                maxElements: template.maxElements,
                elementSlots: [...template.elementSlots],
                filledSlots: 0,
                connectedRooms: [],
                nightmareLevel: 0,         // 0 = peaceful, 1-3 = nightmare corruption
                createdAt: Date.now()
            };
        }

        /**
         * Add a dream element after correct answer
         * This is the core "building" mechanic
         */
        addDreamElement(categoryId, questionData, masteryLevel) {
            let dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) {
                dreamscape = this.createDreamscapeForCategory({ id: categoryId, name: categoryId });
            }

            // Determine element type based on mastery level
            const elementType = this.getElementTypeForMastery(masteryLevel);
            const elementSpec = DREAM_ELEMENT_TYPES[elementType.toUpperCase()];

            // Find a room with available slot for this element type
            let targetRoom = this.findRoomWithSlot(dreamscape, elementType);
            if (!targetRoom) {
                // Need to create a new room
                targetRoom = this.expandDreamscape(dreamscape);
            }

            // Create the dream element
            const element = {
                id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: elementType,
                visualElement: this.selectVisualElement(elementSpec),
                questionId: questionData.id,
                conceptName: questionData.concept || questionData.question?.substring(0, 50),
                masteryAtCreation: masteryLevel,
                roomId: targetRoom.id,
                position: this.calculateElementPosition(targetRoom),
                glowIntensity: Math.min(1, masteryLevel + 0.2),
                createdAt: Date.now()
            };

            // Add to room and dreamscape
            targetRoom.elements.push(element);
            targetRoom.filledSlots++;
            dreamscape.elements.push(element);
            this.state.totalElementsPlaced++;

            // Update atmospheric state
            this.updateAtmosphere(dreamscape);

            // Check for room connections
            this.checkAndCreateConnections(dreamscape, targetRoom, element);

            // Check for power unlocks
            this.checkPowerUnlocks();

            this.saveState();

            return {
                element,
                room: targetRoom,
                dreamscape,
                message: this.generateElementPlacementMessage(element, targetRoom)
            };
        }

        /**
         * Determine element type based on mastery level
         */
        getElementTypeForMastery(masteryLevel) {
            if (masteryLevel >= 0.9) return 'atmosphere';
            if (masteryLevel >= 0.75) return 'inhabitant';
            if (masteryLevel >= 0.6) return 'decoration';
            if (masteryLevel >= 0.4) return 'structure';
            return 'foundation';
        }

        /**
         * Find a room with an available slot for element type
         */
        findRoomWithSlot(dreamscape, elementType) {
            for (const room of dreamscape.rooms) {
                const availableSlots = room.elementSlots.filter((slot, idx) => {
                    // Check if slot is for this type and not yet filled
                    const matchesType = slot === elementType;
                    const notFilled = !room.elements.some(e =>
                        e.position && e.position.slotIndex === idx
                    );
                    return matchesType && notFilled;
                });
                if (availableSlots.length > 0) {
                    return room;
                }
            }
            return null;
        }

        /**
         * Expand dreamscape by adding a new room
         */
        expandDreamscape(dreamscape) {
            // Choose room template based on current composition
            const existingTypes = dreamscape.rooms.map(r => r.templateId);
            let templateId = 'gallery';

            if (!existingTypes.includes('laboratory')) {
                templateId = 'laboratory';
            } else if (!existingTypes.includes('sanctuary')) {
                templateId = 'sanctuary';
            } else if (!existingTypes.includes('tower')) {
                templateId = 'tower';
            }

            const newRoom = this.createRoom(templateId, dreamscape.id);
            dreamscape.rooms.push(newRoom);

            // Connect to last room
            const lastRoom = dreamscape.rooms[dreamscape.rooms.length - 2];
            if (lastRoom) {
                lastRoom.connectedRooms.push(newRoom.id);
                newRoom.connectedRooms.push(lastRoom.id);
                dreamscape.connections.push({
                    from: lastRoom.id,
                    to: newRoom.id,
                    type: 'corridor'
                });
            }

            return newRoom;
        }

        /**
         * Select a visual element from the type's options
         */
        selectVisualElement(elementSpec) {
            const elements = elementSpec.elements;
            return elements[Math.floor(Math.random() * elements.length)];
        }

        /**
         * Calculate position for element within room
         */
        calculateElementPosition(room) {
            const filledCount = room.elements.length;
            // Find first unfilled slot
            for (let i = 0; i < room.elementSlots.length; i++) {
                const slotFilled = room.elements.some(e => e.position?.slotIndex === i);
                if (!slotFilled) {
                    return {
                        slotIndex: i,
                        x: (i % 3) * 0.33 + 0.17,
                        y: Math.floor(i / 3) * 0.33 + 0.17
                    };
                }
            }
            return { slotIndex: filledCount, x: 0.5, y: 0.5 };
        }

        /**
         * Update atmospheric state based on completion
         */
        updateAtmosphere(dreamscape) {
            const totalSlots = dreamscape.rooms.reduce((sum, r) => sum + r.maxElements, 0);
            const filledSlots = dreamscape.elements.length;
            const fillRatio = filledSlots / Math.max(1, totalSlots);

            if (fillRatio >= 0.9) {
                dreamscape.atmosphericState = 'luminous';
            } else if (fillRatio >= 0.6) {
                dreamscape.atmosphericState = 'stable';
            } else if (fillRatio >= 0.2) {
                dreamscape.atmosphericState = 'forming';
            } else {
                dreamscape.atmosphericState = 'void';
            }

            dreamscape.completionLevel = fillRatio;
        }

        /**
         * Check and create connections between related concepts
         */
        checkAndCreateConnections(dreamscape, room, newElement) {
            // Look for conceptually related elements in other rooms
            dreamscape.elements.forEach(existingElement => {
                if (existingElement.id === newElement.id) return;
                if (existingElement.roomId === newElement.roomId) return;

                // Simple relatedness check - same question type or adjacent mastery
                const masteryDiff = Math.abs(
                    existingElement.masteryAtCreation - newElement.masteryAtCreation
                );

                if (masteryDiff < 0.3) {
                    // Create a dream thread connection
                    const connectionExists = dreamscape.connections.some(c =>
                        (c.from === existingElement.id && c.to === newElement.id) ||
                        (c.from === newElement.id && c.to === existingElement.id)
                    );

                    if (!connectionExists) {
                        dreamscape.connections.push({
                            from: existingElement.id,
                            to: newElement.id,
                            type: 'thread',
                            strength: 1 - masteryDiff
                        });
                    }
                }
            });
        }

        /**
         * Check and unlock dream powers
         */
        checkPowerUnlocks() {
            Object.entries(DREAM_POWERS).forEach(([powerId, power]) => {
                if (this.state.powers[powerId]?.unlocked) return;

                const condition = power.unlockCondition;
                let unlocked = true;

                if (condition.totalElements && this.state.totalElementsPlaced < condition.totalElements) {
                    unlocked = false;
                }
                if (condition.nightmaresDefeated && this.state.defeatedNightmares.length < condition.nightmaresDefeated) {
                    unlocked = false;
                }
                if (condition.completePalaces && this.state.completePalaces < condition.completePalaces) {
                    unlocked = false;
                }

                if (unlocked) {
                    this.state.powers[powerId] = {
                        unlocked: true,
                        unlockedAt: Date.now(),
                        usesToday: 0,
                        lastUsed: null
                    };
                }
            });
        }

        /**
         * Generate placement message for Ms. Luminara voice
         */
        generateElementPlacementMessage(element, room) {
            const messages = {
                foundation: [
                    `A cornerstone of understanding forms in ${room.name}.`,
                    `The foundation strengthens beneath your feet.`,
                    `Basic truths crystallize into solid ground.`
                ],
                structure: [
                    `A new structure rises in your ${room.name}.`,
                    `The architecture of understanding takes shape.`,
                    `Mechanisms interlock like gears in your dream.`
                ],
                decoration: [
                    `Details emerge like paintings on the walls.`,
                    `Nuance adorns your growing palace.`,
                    `The finer points shimmer into being.`
                ],
                inhabitant: [
                    `A guardian of knowledge joins your dream.`,
                    `Clinical wisdom takes form as a dream figure.`,
                    `Application becomes incarnate in ${room.name}.`
                ],
                atmosphere: [
                    `Light suffuses ${room.name} with integration.`,
                    `The very air glows with synthesized understanding.`,
                    `Everything connects in luminous harmony.`
                ]
            };

            const typeMessages = messages[element.type] || messages.foundation;
            return typeMessages[Math.floor(Math.random() * typeMessages.length)];
        }

        /**
         * Get dreamscape visualization data
         */
        getDreamscapeVisualization(categoryId) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return null;

            return {
                id: dreamscape.id,
                name: dreamscape.name,
                atmosphere: dreamscape.atmosphericState,
                completion: dreamscape.completionLevel,
                rooms: dreamscape.rooms.map(room => ({
                    id: room.id,
                    name: room.name,
                    template: room.templateId,
                    elements: room.elements.map(e => ({
                        id: e.id,
                        type: e.type,
                        visual: e.visualElement,
                        concept: e.conceptName,
                        glow: e.glowIntensity,
                        position: e.position
                    })),
                    nightmareLevel: room.nightmareLevel,
                    connections: room.connectedRooms
                })),
                threads: dreamscape.connections.filter(c => c.type === 'thread'),
                corridors: dreamscape.connections.filter(c => c.type === 'corridor')
            };
        }

        /**
         * Enter a dreamscape (start session)
         */
        enterDream(categoryId) {
            let dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) {
                const category = this.getAvailableCategories().find(c => c.id === categoryId)
                    || { id: categoryId, name: categoryId };
                dreamscape = this.createDreamscapeForCategory(category);
            }

            dreamscape.lastVisited = Date.now();
            this.state.lastDreamAt = Date.now();
            this.state.lucidDreamSessions++;

            this.saveState();

            return {
                dreamscape: this.getDreamscapeVisualization(categoryId),
                powers: this.getAvailablePowers(),
                nightmares: this.getActiveNightmares(categoryId),
                message: this.generateDreamEntryMessage(dreamscape)
            };
        }

        /**
         * Get available powers for current session
         */
        getAvailablePowers() {
            const today = new Date().toDateString();
            return Object.entries(DREAM_POWERS)
                .filter(([id, power]) => this.state.powers[id]?.unlocked)
                .map(([id, power]) => {
                    const powerState = this.state.powers[id];
                    const lastUsedDate = powerState.lastUsed
                        ? new Date(powerState.lastUsed).toDateString()
                        : null;
                    const usesToday = lastUsedDate === today ? powerState.usesToday : 0;

                    return {
                        id,
                        name: power.name,
                        description: power.description,
                        effect: power.effect,
                        usesRemaining: power.usesPerSession - usesToday,
                        available: usesToday < power.usesPerSession
                    };
                });
        }

        /**
         * Use a dream power
         */
        usePower(powerId, context = {}) {
            const power = DREAM_POWERS[powerId];
            if (!power) return { success: false, error: 'Unknown power' };

            const powerState = this.state.powers[powerId];
            if (!powerState?.unlocked) {
                return { success: false, error: 'Power not unlocked' };
            }

            const today = new Date().toDateString();
            const lastUsedDate = powerState.lastUsed
                ? new Date(powerState.lastUsed).toDateString()
                : null;

            if (lastUsedDate !== today) {
                powerState.usesToday = 0;
            }

            if (powerState.usesToday >= power.usesPerSession) {
                return { success: false, error: 'No uses remaining today' };
            }

            powerState.usesToday++;
            powerState.lastUsed = Date.now();
            this.saveState();

            // Execute power effect
            const result = this.executePowerEffect(powerId, context);

            return {
                success: true,
                power: power.name,
                effect: result,
                usesRemaining: power.usesPerSession - powerState.usesToday
            };
        }

        /**
         * Execute power effect based on type
         */
        executePowerEffect(powerId, context) {
            switch (powerId) {
                case 'lucid_awareness':
                    return {
                        type: 'reveal',
                        message: 'The dream shimmers... question nature becomes clear.',
                        data: context.questionData ? {
                            difficulty: context.questionData.difficulty || 'unknown',
                            category: context.questionData.category || 'unknown',
                            type: context.questionData.type || 'unknown'
                        } : null
                    };

                case 'dream_walking':
                    return {
                        type: 'collective',
                        message: 'You step into the Collective Unconscious...',
                        data: this.getCollectiveUnconsciousData(context.categoryId)
                    };

                case 'inception':
                    return {
                        type: 'bookmark',
                        message: 'A seed idea is planted. It will grow with time.',
                        data: {
                            conceptId: context.conceptId,
                            scheduledReview: Date.now() + (24 * 60 * 60 * 1000) // Tomorrow
                        }
                    };

                case 'lucid_combat':
                    return {
                        type: 'combat_hint',
                        message: 'Clarity pierces the nightmare. A hint reveals itself.',
                        data: { hintAvailable: true }
                    };

                case 'dream_architect':
                    return {
                        type: 'reorganize',
                        message: 'The palace walls shift. You may rearrange.',
                        data: { reorganizeEnabled: true }
                    };

                default:
                    return { type: 'unknown', message: 'Power manifests mysteriously.' };
            }
        }

        /**
         * Get collective unconscious data (anonymized aggregate)
         */
        getCollectiveUnconsciousData(categoryId) {
            // In production, this would aggregate from server data
            // For now, generate representative mock data
            return {
                stormZones: [
                    { concept: 'V/Q Mismatch', confusionLevel: 0.67 },
                    { concept: 'Compliance vs Elastance', confusionLevel: 0.54 }
                ],
                clearSkies: [
                    { concept: 'Tidal Volume', masteryLevel: 0.89 },
                    { concept: 'Respiratory Rate', masteryLevel: 0.92 }
                ],
                populationProgress: 0.62,
                mostBuiltElements: ['foundation', 'structure'],
                leastBuiltElements: ['atmosphere', 'inhabitant']
            };
        }

        /**
         * Generate dream entry message
         */
        generateDreamEntryMessage(dreamscape) {
            const atmosphereMessages = {
                void: 'You enter the Void. Darkness surrounds you, but not for long...',
                forming: 'The dream takes shape around you. Walls emerge from the mist.',
                stable: 'Your Memory Palace welcomes you. Familiar corridors await.',
                luminous: 'You step into radiance. Your palace gleams with understanding.'
            };
            return atmosphereMessages[dreamscape.atmosphericState] || atmosphereMessages.void;
        }

        // =========================================================================
        // CYCLE 2: NIGHTMARE SYSTEM - MISCONCEPTIONS AS NIGHTMARES
        // =========================================================================

        /**
         * Nightmare Types - Corruption manifestations
         */
        static NIGHTMARE_TYPES = {
            SHADOW_DOUBLE: {
                id: 'shadow_double',
                name: 'Shadow Double',
                description: 'A distorted mirror of correct understanding',
                dangerLevel: 1,
                corruptionRadius: 1,
                source: 'wrong_answer'
            },

            MEMORY_EATER: {
                id: 'memory_eater',
                name: 'Memory Eater',
                description: 'Devours dream elements if not defeated',
                dangerLevel: 2,
                corruptionRadius: 2,
                source: 'repeated_mistakes'
            },

            CONCEPT_CHIMERA: {
                id: 'concept_chimera',
                name: 'Concept Chimera',
                description: 'A fusion of confused concepts',
                dangerLevel: 3,
                corruptionRadius: 3,
                source: 'confusion_cluster'
            },

            THE_FORGETTING: {
                id: 'the_forgetting',
                name: 'The Forgetting',
                description: 'Creeping decay from neglected knowledge',
                dangerLevel: 2,
                corruptionRadius: 4,
                source: 'decay'
            },

            FALSE_GUARDIAN: {
                id: 'false_guardian',
                name: 'False Guardian',
                description: 'An imposter wearing the face of understanding',
                dangerLevel: 3,
                corruptionRadius: 2,
                source: 'confident_wrong'
            }
        };

        /**
         * Spawn a nightmare from wrong answer
         */
        spawnNightmare(categoryId, questionData, wrongAnswerData) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return null;

            // Determine nightmare type based on context
            const nightmareType = this.determineNightmareType(categoryId, questionData, wrongAnswerData);
            const nightmareSpec = DreamLaboratoryEngine.NIGHTMARE_TYPES[nightmareType];

            const nightmare = {
                id: `nightmare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: nightmareType,
                name: nightmareSpec.name,
                dangerLevel: nightmareSpec.dangerLevel,
                categoryId: categoryId,
                sourceQuestionId: questionData.id,
                wrongAnswer: wrongAnswerData.selected,
                correctAnswer: wrongAnswerData.correct,
                misconception: wrongAnswerData.misconception || 'Unknown confusion',
                health: nightmareSpec.dangerLevel * 2,
                maxHealth: nightmareSpec.dangerLevel * 2,
                corruptedElements: [],
                roomId: this.findRoomForNightmare(dreamscape),
                spawnedAt: Date.now(),
                defeated: false
            };

            // Apply initial corruption
            this.applyNightmareCorruption(dreamscape, nightmare, nightmareSpec.corruptionRadius);

            // Add to state
            if (!this.state.nightmares[categoryId]) {
                this.state.nightmares[categoryId] = [];
            }
            this.state.nightmares[categoryId].push(nightmare);

            this.saveState();

            return {
                nightmare,
                message: this.generateNightmareSpawnMessage(nightmare),
                corruption: nightmare.corruptedElements.length
            };
        }

        /**
         * Determine nightmare type based on error pattern
         */
        determineNightmareType(categoryId, questionData, wrongAnswerData) {
            // Check for patterns
            const recentErrors = this.getRecentErrors(categoryId);
            const sameQuestionErrors = recentErrors.filter(e => e.questionId === questionData.id);
            const confusionCluster = this.detectConfusionCluster(categoryId, questionData);

            if (wrongAnswerData.confidence && wrongAnswerData.confidence > 0.7) {
                return 'FALSE_GUARDIAN';
            }
            if (sameQuestionErrors.length >= 3) {
                return 'MEMORY_EATER';
            }
            if (confusionCluster) {
                return 'CONCEPT_CHIMERA';
            }
            return 'SHADOW_DOUBLE';
        }

        /**
         * Get recent errors for a category
         */
        getRecentErrors(categoryId) {
            // Would integrate with learningAnalytics in production
            return [];
        }

        /**
         * Detect confusion cluster (multiple related misconceptions)
         */
        detectConfusionCluster(categoryId, questionData) {
            // Would analyze confusion matrix in production
            return false;
        }

        /**
         * Find appropriate room for nightmare
         */
        findRoomForNightmare(dreamscape) {
            // Prefer rooms with elements (more to corrupt)
            const roomsWithElements = dreamscape.rooms
                .filter(r => r.elements.length > 0)
                .sort((a, b) => b.elements.length - a.elements.length);

            if (roomsWithElements.length > 0) {
                return roomsWithElements[0].id;
            }
            return dreamscape.rooms[0]?.id;
        }

        /**
         * Apply corruption to nearby elements
         */
        applyNightmareCorruption(dreamscape, nightmare, radius) {
            const room = dreamscape.rooms.find(r => r.id === nightmare.roomId);
            if (!room) return;

            // Corrupt elements in this room
            room.elements.slice(0, radius).forEach(element => {
                element.corrupted = true;
                element.corruptionLevel = 0.5;
                element.corruptedBy = nightmare.id;
                nightmare.corruptedElements.push(element.id);
            });

            // Increase room nightmare level
            room.nightmareLevel = Math.min(3, room.nightmareLevel + 1);
        }

        /**
         * Get active nightmares for a category
         */
        getActiveNightmares(categoryId) {
            const nightmares = this.state.nightmares[categoryId] || [];
            return nightmares.filter(n => !n.defeated);
        }

        /**
         * Combat a nightmare (lucid dreaming)
         */
        combatNightmare(nightmareId, answerData) {
            // Find the nightmare
            let nightmare = null;
            let categoryId = null;
            for (const [catId, nightmares] of Object.entries(this.state.nightmares)) {
                const found = nightmares.find(n => n.id === nightmareId);
                if (found) {
                    nightmare = found;
                    categoryId = catId;
                    break;
                }
            }

            if (!nightmare || nightmare.defeated) {
                return { success: false, error: 'Nightmare not found or already defeated' };
            }

            const isCorrect = answerData.correct;
            const damage = isCorrect ? (answerData.firstTry ? 2 : 1) : 0;

            if (isCorrect) {
                nightmare.health -= damage;

                if (nightmare.health <= 0) {
                    // Nightmare defeated
                    nightmare.defeated = true;
                    nightmare.defeatedAt = Date.now();
                    this.state.defeatedNightmares.push(nightmare);

                    // Remove corruption
                    this.removeNightmareCorruption(categoryId, nightmare);

                    // Check power unlocks
                    this.checkPowerUnlocks();

                    this.saveState();

                    return {
                        success: true,
                        defeated: true,
                        nightmare,
                        message: this.generateNightmareDefeatMessage(nightmare),
                        cleansedElements: nightmare.corruptedElements.length
                    };
                }

                this.saveState();

                return {
                    success: true,
                    defeated: false,
                    damage,
                    remainingHealth: nightmare.health,
                    message: `The ${nightmare.name} recoils! ${nightmare.health} nightmare essence remains.`
                };
            }

            // Wrong answer - nightmare grows stronger
            nightmare.health = Math.min(nightmare.maxHealth + 1, nightmare.health + 1);
            nightmare.maxHealth = Math.max(nightmare.maxHealth, nightmare.health);

            this.saveState();

            return {
                success: false,
                defeated: false,
                nightmareStrengthened: true,
                health: nightmare.health,
                message: `The ${nightmare.name} feeds on your confusion and grows stronger!`
            };
        }

        /**
         * Remove corruption when nightmare is defeated
         */
        removeNightmareCorruption(categoryId, nightmare) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return;

            // Find and cleanse corrupted elements
            dreamscape.elements.forEach(element => {
                if (nightmare.corruptedElements.includes(element.id)) {
                    element.corrupted = false;
                    element.corruptionLevel = 0;
                    delete element.corruptedBy;
                    // Boost glow as reward for cleansing
                    element.glowIntensity = Math.min(1, element.glowIntensity + 0.1);
                }
            });

            // Reduce room nightmare level
            const room = dreamscape.rooms.find(r => r.id === nightmare.roomId);
            if (room) {
                room.nightmareLevel = Math.max(0, room.nightmareLevel - 1);
            }
        }

        /**
         * Spawn "The Forgetting" nightmares from decay
         */
        processDecay(categoryId) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return [];

            const spawnedNightmares = [];
            const decayThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
            const now = Date.now();

            // Find elements that haven't been reinforced
            dreamscape.elements.forEach(element => {
                if (element.corrupted) return; // Already corrupted

                const timeSinceCreation = now - element.createdAt;
                const timeSinceReinforced = element.lastReinforced
                    ? now - element.lastReinforced
                    : timeSinceCreation;

                if (timeSinceReinforced > decayThreshold) {
                    // Element is decaying - spawn "The Forgetting"
                    const nightmare = {
                        id: `nightmare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        type: 'THE_FORGETTING',
                        name: 'The Forgetting',
                        dangerLevel: 2,
                        categoryId: categoryId,
                        sourceElementId: element.id,
                        health: 3,
                        maxHealth: 3,
                        corruptedElements: [element.id],
                        roomId: element.roomId,
                        spawnedAt: now,
                        defeated: false
                    };

                    element.corrupted = true;
                    element.corruptionLevel = 0.3;
                    element.corruptedBy = nightmare.id;
                    element.decaying = true;

                    if (!this.state.nightmares[categoryId]) {
                        this.state.nightmares[categoryId] = [];
                    }
                    this.state.nightmares[categoryId].push(nightmare);
                    spawnedNightmares.push(nightmare);
                }
            });

            if (spawnedNightmares.length > 0) {
                this.saveState();
            }

            return spawnedNightmares;
        }

        /**
         * Reinforce an element (prevent decay)
         */
        reinforceElement(elementId, categoryId) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return false;

            const element = dreamscape.elements.find(e => e.id === elementId);
            if (!element) return false;

            element.lastReinforced = Date.now();
            element.decaying = false;
            element.glowIntensity = Math.min(1, element.glowIntensity + 0.05);

            this.saveState();
            return true;
        }

        /**
         * Generate nightmare spawn message
         */
        generateNightmareSpawnMessage(nightmare) {
            const messages = {
                SHADOW_DOUBLE: 'A shadow stirs in the corner of your dream. Your confusion takes form...',
                MEMORY_EATER: 'Something hungry emerges. The Memory Eater smells forgotten knowledge...',
                CONCEPT_CHIMERA: 'Twisted concepts merge into a terrible chimera. Multiple confusions unite!',
                THE_FORGETTING: 'A cold fog seeps into your palace. The Forgetting has come for what you neglected...',
                FALSE_GUARDIAN: 'A false understanding wears a convincing mask. The False Guardian blocks your path...'
            };
            return messages[nightmare.type] || 'A nightmare manifests in your dream...';
        }

        /**
         * Generate nightmare defeat message
         */
        generateNightmareDefeatMessage(nightmare) {
            const messages = {
                SHADOW_DOUBLE: 'The shadow dissolves into light. Understanding replaces confusion!',
                MEMORY_EATER: 'The Memory Eater withers as you reclaim your knowledge.',
                CONCEPT_CHIMERA: 'The chimera separates into clear, distinct concepts.',
                THE_FORGETTING: 'Warmth returns. The Forgetting retreats before your renewed attention.',
                FALSE_GUARDIAN: 'The mask shatters. True understanding takes its place.'
            };
            return messages[nightmare.type] || 'The nightmare fades. Your dream is cleansed.';
        }

        /**
         * Get overall dream statistics
         */
        getStatistics() {
            return {
                totalElementsPlaced: this.state.totalElementsPlaced,
                completePalaces: this.state.completePalaces,
                lucidDreamSessions: this.state.lucidDreamSessions,
                totalNightmaresDefeated: this.state.defeatedNightmares.length,
                activeNightmares: Object.values(this.state.nightmares)
                    .flat()
                    .filter(n => !n.defeated).length,
                unlockedPowers: Object.values(this.state.powers)
                    .filter(p => p.unlocked).length,
                dreamscapeCount: Object.keys(this.state.dreamscapes).length,
                collectiveContributions: this.state.collectiveContributions
            };
        }

        /**
         * Wake up from dream (end session)
         */
        wakeUp(categoryId) {
            const dreamscape = this.state.dreamscapes[categoryId];
            if (!dreamscape) return null;

            // Check if any palaces are complete
            if (dreamscape.completionLevel >= 0.95) {
                this.state.completePalaces++;
            }

            this.saveState();

            return {
                sessionSummary: {
                    dreamscape: dreamscape.name,
                    elementsAdded: dreamscape.elements.filter(e =>
                        e.createdAt > (dreamscape.lastVisited || 0)
                    ).length,
                    nightmaresDefeated: this.state.defeatedNightmares.filter(n =>
                        n.categoryId === categoryId &&
                        n.defeatedAt > (dreamscape.lastVisited || 0)
                    ).length,
                    completion: dreamscape.completionLevel,
                    atmosphere: dreamscape.atmosphericState
                },
                message: this.generateWakeUpMessage(dreamscape)
            };
        }

        /**
         * Generate wake up message
         */
        generateWakeUpMessage(dreamscape) {
            const atmosphereMessages = {
                void: 'You wake from darkness. The palace awaits your return...',
                forming: 'You wake as the dream stabilizes. More building to do.',
                stable: 'You wake with satisfaction. Your palace stands strong.',
                luminous: 'You wake enlightened. Your Memory Palace shines eternal.'
            };
            return atmosphereMessages[dreamscape.atmosphericState] || 'You wake...';
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Hook into question answering for element/nightmare spawning
     */
    function onQuestionAnswered(categoryId, questionData, isCorrect, firstTry) {
        const engine = window.dreamLaboratory;
        if (!engine) return;

        if (isCorrect) {
            // Calculate mastery level (simplified)
            const mastery = firstTry ? 0.8 : 0.5;
            const result = engine.addDreamElement(categoryId, questionData, mastery);
            return {
                type: 'dream_element',
                data: result
            };
        } else {
            // Spawn nightmare
            const result = engine.spawnNightmare(categoryId, questionData, {
                selected: questionData.selectedAnswer,
                correct: questionData.correctAnswer,
                misconception: questionData.distractorReason
            });
            return {
                type: 'nightmare',
                data: result
            };
        }
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.dreamLaboratory = new DreamLaboratoryEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            DreamLaboratoryEngine,
            DREAM_ELEMENT_TYPES,
            DREAM_POWERS,
            ROOM_TEMPLATES,
            onQuestionAnswered
        };
    }

    console.log('[Dream Laboratory] Initialized - Memory Palace awaits');

})();
