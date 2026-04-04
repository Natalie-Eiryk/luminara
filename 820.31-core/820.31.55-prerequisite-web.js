/**
 * @file 820.31.55-prerequisite-web.js
 * @codon 820.31.55
 * @version 2026-03-29
 * @brief Prerequisite Web - Visible Knowledge Graph Navigation
 *
 * TAIDRGEF Signature: G.F.A.T.E
 * - G (Gravitate): Content gravitates through prerequisite chains
 * - F (Frame): Web frames knowledge structure
 * - A (Aggregate): Connections aggregate into graph
 * - T (Transform): Paths transform with mastery
 * - E (Emit): Mastered nodes emit to dependents
 *
 * Cycle 1: Prerequisite data structure and inference
 * Cycle 2: Visualization and navigation interface
 */

(function() {
    'use strict';

    // =========================================================================
    // CYCLE 1: PREREQUISITE DATA STRUCTURE AND INFERENCE
    // =========================================================================

    /**
     * Node States - Status of each concept node
     */
    const NODE_STATES = {
        DARK: {
            id: 'dark',
            name: 'Unexplored',
            description: 'Not yet attempted',
            color: '#374151',
            accessible: true,
            emitsLight: false
        },
        DIM: {
            id: 'dim',
            name: 'In Progress',
            description: 'Some exposure, not yet mastered',
            color: '#6B7280',
            accessible: true,
            emitsLight: false
        },
        LIT: {
            id: 'lit',
            name: 'Mastered',
            description: 'Concept is mastered',
            color: '#60A5FA',
            accessible: true,
            emitsLight: true
        },
        LOCKED: {
            id: 'locked',
            name: 'Locked',
            description: 'Prerequisites not met',
            color: '#991B1B',
            accessible: false,
            emitsLight: false
        },
        GLOWING: {
            id: 'glowing',
            name: 'Frontier',
            description: 'Just beyond current mastery (ZPD)',
            color: '#FBBF24',
            accessible: true,
            emitsLight: false
        }
    };

    /**
     * Edge Types - Types of prerequisite relationships
     */
    const EDGE_TYPES = {
        REQUIRED: {
            id: 'required',
            name: 'Required',
            description: 'Must master before proceeding',
            strength: 1.0,
            lineStyle: 'solid',
            color: '#EF4444'
        },
        RECOMMENDED: {
            id: 'recommended',
            name: 'Recommended',
            description: 'Helpful but not required',
            strength: 0.6,
            lineStyle: 'dashed',
            color: '#F59E0B'
        },
        ENHANCES: {
            id: 'enhances',
            name: 'Enhances',
            description: 'Makes the target easier to understand',
            strength: 0.3,
            lineStyle: 'dotted',
            color: '#10B981'
        },
        RELATES: {
            id: 'relates',
            name: 'Related',
            description: 'Conceptually connected',
            strength: 0.2,
            lineStyle: 'dotted',
            color: '#8B5CF6'
        }
    };

    /**
     * Prerequisite Web Engine
     */
    class PrerequisiteWebEngine {
        constructor() {
            this.state = this.loadState();
            this.initializeWeb();
        }

        /**
         * Load state
         */
        loadState() {
            const saved = localStorage.getItem('prerequisiteWeb');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                version: 1,
                nodes: {},              // conceptId -> node data
                edges: [],              // {from, to, type, strength}
                userProgress: {},       // conceptId -> progress data
                paths: [],              // Saved learning paths
                activeGoal: null,       // Current goal node
                inferredConnections: [], // AI-inferred connections
                statistics: {
                    nodesExplored: 0,
                    nodesMastered: 0,
                    edgesTraversed: 0,
                    pathsCompleted: 0
                },
                createdAt: Date.now()
            };
        }

        /**
         * Save state
         */
        saveState() {
            localStorage.setItem('prerequisiteWeb', JSON.stringify(this.state));
        }

        /**
         * Initialize web structure (can be populated from question registry)
         */
        initializeWeb() {
            // Default hierarchical structure for anatomy/physiology
            if (Object.keys(this.state.nodes).length === 0) {
                this.buildDefaultWeb();
            }
        }

        /**
         * Build a default web structure
         */
        buildDefaultWeb() {
            // Foundation nodes
            this.addNode('cell_basics', 'Cell Structure Basics', 0, []);
            this.addNode('membrane_structure', 'Cell Membrane Structure', 1, ['cell_basics']);
            this.addNode('diffusion', 'Diffusion & Osmosis', 1, ['membrane_structure']);
            this.addNode('active_transport', 'Active Transport', 1, ['membrane_structure', 'diffusion']);

            // Resting potential chain
            this.addNode('ion_channels', 'Ion Channels', 2, ['membrane_structure', 'active_transport']);
            this.addNode('resting_potential', 'Resting Membrane Potential', 2, ['ion_channels', 'diffusion']);
            this.addNode('action_potential', 'Action Potential', 3, ['resting_potential', 'ion_channels']);
            this.addNode('signal_propagation', 'Signal Propagation', 3, ['action_potential']);

            // Cardiovascular chain
            this.addNode('cardiac_muscle', 'Cardiac Muscle', 2, ['cell_basics', 'action_potential']);
            this.addNode('cardiac_cycle', 'Cardiac Cycle', 3, ['cardiac_muscle']);
            this.addNode('blood_pressure', 'Blood Pressure Regulation', 3, ['cardiac_cycle']);

            // Respiratory chain
            this.addNode('lung_anatomy', 'Lung Anatomy', 1, ['cell_basics']);
            this.addNode('gas_exchange', 'Gas Exchange', 2, ['diffusion', 'lung_anatomy']);
            this.addNode('oxygen_transport', 'Oxygen Transport', 2, ['gas_exchange']);
            this.addNode('vq_matching', 'V/Q Matching', 3, ['gas_exchange', 'blood_pressure']);

            // Integration
            this.addNode('cardio_respiratory', 'Cardiorespiratory Integration', 4, ['blood_pressure', 'vq_matching']);
        }

        /**
         * Add a node to the web
         */
        addNode(id, name, tier = 0, prerequisites = []) {
            this.state.nodes[id] = {
                id,
                name,
                tier,                    // Depth in the graph
                state: 'dark',
                mastery: 0,
                questionsAttempted: 0,
                questionsCorrect: 0,
                lastAttempt: null,
                firstMastered: null,
                dependents: [],          // Nodes that depend on this one
                position: null           // For visualization
            };

            // Add edges for prerequisites
            prerequisites.forEach(prereqId => {
                this.addEdge(prereqId, id, 'required');
                // Mark as dependent
                if (this.state.nodes[prereqId]) {
                    this.state.nodes[prereqId].dependents.push(id);
                }
            });

            return this.state.nodes[id];
        }

        /**
         * Add an edge between nodes
         */
        addEdge(fromId, toId, type = 'required', strength = null) {
            const edgeType = EDGE_TYPES[type.toUpperCase()] || EDGE_TYPES.REQUIRED;

            const edge = {
                from: fromId,
                to: toId,
                type: edgeType.id,
                strength: strength !== null ? strength : edgeType.strength,
                createdAt: Date.now()
            };

            // Check if edge already exists
            const existingIndex = this.state.edges.findIndex(e =>
                e.from === fromId && e.to === toId
            );

            if (existingIndex >= 0) {
                this.state.edges[existingIndex] = edge;
            } else {
                this.state.edges.push(edge);
            }

            this.saveState();
            return edge;
        }

        /**
         * Update node progress from question answer
         */
        updateProgress(conceptId, isCorrect, masteryChange = 0) {
            const node = this.state.nodes[conceptId];
            if (!node) return null;

            // Update question stats
            node.questionsAttempted++;
            if (isCorrect) {
                node.questionsCorrect++;
            }
            node.lastAttempt = Date.now();

            // Update mastery
            const oldMastery = node.mastery;
            node.mastery = Math.min(1, Math.max(0, node.mastery + masteryChange));

            // Update state based on mastery
            const oldState = node.state;
            node.state = this.calculateNodeState(node);

            // Track first mastery
            if (node.mastery >= 0.8 && !node.firstMastered) {
                node.firstMastered = Date.now();
                this.state.statistics.nodesMastered++;
            }

            // Track exploration
            if (oldState === 'dark' && node.state !== 'dark') {
                this.state.statistics.nodesExplored++;
            }

            // Update dependent nodes' accessibility
            this.updateDependentNodes(conceptId);

            this.saveState();

            return {
                node,
                oldState,
                newState: node.state,
                masteryChanged: oldMastery !== node.mastery,
                stateChanged: oldState !== node.state
            };
        }

        /**
         * Calculate node state based on mastery and prerequisites
         */
        calculateNodeState(node) {
            // Check if prerequisites are met
            const prereqs = this.getPrerequisites(node.id);
            const prereqsMet = prereqs.every(prereqId => {
                const prereqNode = this.state.nodes[prereqId];
                return prereqNode && prereqNode.mastery >= 0.6;
            });

            if (!prereqsMet && node.questionsAttempted === 0) {
                return 'locked';
            }

            if (node.mastery >= 0.8) {
                return 'lit';
            }

            if (node.mastery >= 0.3 || node.questionsAttempted > 0) {
                return 'dim';
            }

            // Check if this is at the frontier (ZPD)
            const isAtFrontier = prereqsMet && prereqs.some(prereqId => {
                const prereqNode = this.state.nodes[prereqId];
                return prereqNode && prereqNode.mastery >= 0.8;
            });

            if (isAtFrontier) {
                return 'glowing';
            }

            return 'dark';
        }

        /**
         * Update dependent nodes after prerequisite changes
         */
        updateDependentNodes(prereqId) {
            const node = this.state.nodes[prereqId];
            if (!node) return;

            node.dependents.forEach(depId => {
                const depNode = this.state.nodes[depId];
                if (depNode) {
                    const oldState = depNode.state;
                    depNode.state = this.calculateNodeState(depNode);

                    // Recursively update if state changed
                    if (oldState !== depNode.state) {
                        this.updateDependentNodes(depId);
                    }
                }
            });
        }

        /**
         * Get prerequisites for a node
         */
        getPrerequisites(nodeId) {
            return this.state.edges
                .filter(e => e.to === nodeId && e.type === 'required')
                .map(e => e.from);
        }

        /**
         * Get dependents (nodes that require this one)
         */
        getDependents(nodeId) {
            return this.state.edges
                .filter(e => e.from === nodeId && e.type === 'required')
                .map(e => e.to);
        }

        /**
         * Infer connections from learning patterns
         */
        inferConnections(learningHistory) {
            const inferred = [];

            // Look for concepts that are often learned together
            const coOccurrences = {};

            learningHistory.forEach((entry, index) => {
                const next = learningHistory[index + 1];
                if (next) {
                    const key = `${entry.conceptId}-${next.conceptId}`;
                    coOccurrences[key] = (coOccurrences[key] || 0) + 1;
                }
            });

            // Find strong co-occurrences
            Object.entries(coOccurrences).forEach(([key, count]) => {
                if (count >= 3) {
                    const [from, to] = key.split('-');
                    // Check if edge doesn't exist
                    const exists = this.state.edges.some(e =>
                        e.from === from && e.to === to
                    );
                    if (!exists) {
                        inferred.push({
                            from,
                            to,
                            type: 'enhances',
                            confidence: Math.min(1, count / 10),
                            reason: 'co-occurrence'
                        });
                    }
                }
            });

            this.state.inferredConnections = inferred;
            this.saveState();

            return inferred;
        }

        /**
         * Check if node is accessible (prerequisites met)
         */
        isAccessible(nodeId) {
            const node = this.state.nodes[nodeId];
            if (!node) return false;

            return node.state !== 'locked';
        }

        /**
         * Get suggested path to a goal node
         */
        getPathToGoal(goalId) {
            const goal = this.state.nodes[goalId];
            if (!goal) return null;

            const path = [];
            const visited = new Set();

            // BFS backwards from goal to find prerequisites needed
            const queue = [goalId];

            while (queue.length > 0) {
                const current = queue.shift();
                if (visited.has(current)) continue;
                visited.add(current);

                const node = this.state.nodes[current];
                if (!node) continue;

                // Add to path if not mastered
                if (node.mastery < 0.8) {
                    path.unshift(current);
                }

                // Add unmastered prerequisites to queue
                const prereqs = this.getPrerequisites(current);
                prereqs.forEach(prereqId => {
                    const prereqNode = this.state.nodes[prereqId];
                    if (prereqNode && prereqNode.mastery < 0.8 && !visited.has(prereqId)) {
                        queue.push(prereqId);
                    }
                });
            }

            return {
                goalId,
                goalName: goal.name,
                path: path.map(id => ({
                    id,
                    name: this.state.nodes[id]?.name,
                    mastery: this.state.nodes[id]?.mastery || 0,
                    state: this.state.nodes[id]?.state || 'dark'
                })),
                estimatedSteps: path.length,
                isAccessible: this.isAccessible(goalId)
            };
        }

        /**
         * Set active goal
         */
        setGoal(goalId) {
            this.state.activeGoal = goalId;
            this.saveState();

            return this.getPathToGoal(goalId);
        }

        // =========================================================================
        // CYCLE 2: VISUALIZATION AND NAVIGATION INTERFACE
        // =========================================================================

        /**
         * Get full web for visualization
         */
        getWebVisualization() {
            // Calculate positions if not set
            this.calculatePositions();

            const nodes = Object.values(this.state.nodes).map(node => {
                const stateInfo = NODE_STATES[node.state.toUpperCase()] || NODE_STATES.DARK;
                const prereqs = this.getPrerequisites(node.id);
                const dependents = this.getDependents(node.id);

                return {
                    id: node.id,
                    name: node.name,
                    tier: node.tier,
                    state: node.state,
                    stateInfo,
                    mastery: Math.round(node.mastery * 100),
                    position: node.position,
                    prerequisiteCount: prereqs.length,
                    dependentCount: dependents.length,
                    isAccessible: this.isAccessible(node.id),
                    isGoal: node.id === this.state.activeGoal
                };
            });

            const edges = this.state.edges.map(edge => {
                const edgeType = EDGE_TYPES[edge.type.toUpperCase()] || EDGE_TYPES.REQUIRED;
                const fromNode = this.state.nodes[edge.from];
                const toNode = this.state.nodes[edge.to];

                return {
                    from: edge.from,
                    to: edge.to,
                    type: edge.type,
                    typeInfo: edgeType,
                    strength: edge.strength,
                    isLit: fromNode && fromNode.mastery >= 0.8
                };
            });

            return {
                nodes,
                edges,
                activeGoal: this.state.activeGoal,
                activePath: this.state.activeGoal
                    ? this.getPathToGoal(this.state.activeGoal)
                    : null,
                frontierNodes: nodes.filter(n => n.state === 'glowing'),
                masteredNodes: nodes.filter(n => n.state === 'lit')
            };
        }

        /**
         * Calculate node positions for visualization
         */
        calculatePositions() {
            // Group by tier
            const tiers = {};
            Object.values(this.state.nodes).forEach(node => {
                if (!tiers[node.tier]) {
                    tiers[node.tier] = [];
                }
                tiers[node.tier].push(node);
            });

            // Position nodes in a hierarchical layout
            const tierCount = Object.keys(tiers).length;
            Object.entries(tiers).forEach(([tier, nodes]) => {
                const tierNum = parseInt(tier);
                const yBase = (tierNum + 1) / (tierCount + 1);

                nodes.forEach((node, index) => {
                    const xBase = (index + 1) / (nodes.length + 1);
                    node.position = {
                        x: xBase,
                        y: yBase
                    };
                });
            });
        }

        /**
         * Get node details for click/hover
         */
        getNodeDetails(nodeId) {
            const node = this.state.nodes[nodeId];
            if (!node) return null;

            const prereqs = this.getPrerequisites(nodeId).map(id => ({
                id,
                name: this.state.nodes[id]?.name,
                mastery: this.state.nodes[id]?.mastery || 0,
                state: this.state.nodes[id]?.state
            }));

            const dependents = this.getDependents(nodeId).map(id => ({
                id,
                name: this.state.nodes[id]?.name,
                mastery: this.state.nodes[id]?.mastery || 0,
                state: this.state.nodes[id]?.state
            }));

            const stateInfo = NODE_STATES[node.state.toUpperCase()];

            return {
                node: {
                    ...node,
                    masteryPercent: Math.round(node.mastery * 100),
                    stateInfo
                },
                prerequisites: prereqs,
                dependents,
                isAccessible: this.isAccessible(nodeId),
                canSetAsGoal: !this.isAccessible(nodeId) || node.mastery < 0.8,
                pathIfGoal: this.getPathToGoal(nodeId),
                relatedTopics: this.getRelatedTopics(nodeId)
            };
        }

        /**
         * Get related topics (via non-required edges)
         */
        getRelatedTopics(nodeId) {
            const related = [];

            this.state.edges.forEach(edge => {
                if (edge.type !== 'required') {
                    if (edge.from === nodeId) {
                        related.push({
                            id: edge.to,
                            name: this.state.nodes[edge.to]?.name,
                            relationshipType: edge.type
                        });
                    } else if (edge.to === nodeId) {
                        related.push({
                            id: edge.from,
                            name: this.state.nodes[edge.from]?.name,
                            relationshipType: edge.type
                        });
                    }
                }
            });

            return related;
        }

        /**
         * Get frontier nodes (next to learn in ZPD)
         */
        getFrontierNodes() {
            return Object.values(this.state.nodes)
                .filter(node => node.state === 'glowing')
                .map(node => ({
                    id: node.id,
                    name: node.name,
                    tier: node.tier,
                    prereqsComplete: this.getPrerequisites(node.id)
                        .filter(id => this.state.nodes[id]?.mastery >= 0.8).length,
                    totalPrereqs: this.getPrerequisites(node.id).length
                }))
                .sort((a, b) => b.prereqsComplete - a.prereqsComplete);
        }

        /**
         * Get progress summary
         */
        getProgressSummary() {
            const nodes = Object.values(this.state.nodes);
            const total = nodes.length;

            const byState = {
                dark: 0,
                dim: 0,
                lit: 0,
                locked: 0,
                glowing: 0
            };

            nodes.forEach(node => {
                byState[node.state] = (byState[node.state] || 0) + 1;
            });

            const masterySum = nodes.reduce((sum, n) => sum + n.mastery, 0);
            const avgMastery = total > 0 ? masterySum / total : 0;

            return {
                totalNodes: total,
                byState,
                averageMastery: Math.round(avgMastery * 100),
                frontierSize: byState.glowing,
                lockedNodes: byState.locked,
                completionPercent: Math.round((byState.lit / total) * 100),
                currentGoal: this.state.activeGoal
                    ? this.state.nodes[this.state.activeGoal]?.name
                    : null
            };
        }

        /**
         * Compare to common paths (population data)
         */
        compareToCommonPaths() {
            // In production, this would use aggregate data
            // For now, return mock comparison
            const myPath = Object.values(this.state.nodes)
                .filter(n => n.firstMastered)
                .sort((a, b) => a.firstMastered - b.firstMastered)
                .map(n => n.id);

            return {
                myPath,
                pathLength: myPath.length,
                commonPathSimilarity: 0.7,  // Mock: 70% similar to common path
                uniqueChoices: ['vq_matching'],  // Mock: nodes I learned in unusual order
                suggestedNext: this.getFrontierNodes().slice(0, 3)
            };
        }

        /**
         * Get analytics
         */
        getAnalytics() {
            return {
                ...this.state.statistics,
                progressSummary: this.getProgressSummary(),
                frontierNodes: this.getFrontierNodes(),
                inferredConnections: this.state.inferredConnections.length
            };
        }

        /**
         * Export web structure (for backup or sharing)
         */
        exportWeb() {
            return {
                nodes: this.state.nodes,
                edges: this.state.edges,
                exportedAt: Date.now()
            };
        }

        /**
         * Import web structure
         */
        importWeb(data) {
            if (data.nodes && data.edges) {
                this.state.nodes = data.nodes;
                this.state.edges = data.edges;
                this.saveState();
                return true;
            }
            return false;
        }
    }

    // =========================================================================
    // INTEGRATION HOOKS
    // =========================================================================

    /**
     * Update progress from question answer
     */
    function onQuestionAnswered(conceptId, isCorrect, masteryChange) {
        const engine = window.prerequisiteWeb;
        if (!engine) return null;
        return engine.updateProgress(conceptId, isCorrect, masteryChange);
    }

    /**
     * Get suggested next topic
     */
    function getSuggestedNext() {
        const engine = window.prerequisiteWeb;
        if (!engine) return null;
        return engine.getFrontierNodes();
    }

    /**
     * Check if topic is accessible
     */
    function checkAccessible(conceptId) {
        const engine = window.prerequisiteWeb;
        if (!engine) return true;
        return engine.isAccessible(conceptId);
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Create singleton instance
    window.prerequisiteWeb = new PrerequisiteWebEngine();

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            PrerequisiteWebEngine,
            NODE_STATES,
            EDGE_TYPES,
            onQuestionAnswered,
            getSuggestedNext,
            checkAccessible
        };
    }

    console.log('[Prerequisite Web] Initialized - Knowledge graph active');

})();
