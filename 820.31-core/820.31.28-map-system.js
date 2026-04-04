/**
 * Ms. Luminara Quiz - Map System
 * Slay the Spire-style branching map generation
 *
 * @module MapSystem
 * @version 1.0.0
 */

const MapSystem = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  RUN_LENGTHS: {
    quick: { acts: 3, floorsPerAct: 6, name: 'Quick Run', icon: '🏃' },
    standard: { acts: 5, floorsPerAct: 8, name: 'Standard Run', icon: '🗡️' },
    epic: { acts: 7, floorsPerAct: 10, name: 'Epic Run', icon: '👑' }
  },

  NODE_TYPES: {
    combat: { id: 'combat', name: 'Combat', icon: '⚔️', weight: 50 },
    elite: { id: 'elite', name: 'Elite', icon: '💀', weight: 12 },
    rest: { id: 'rest', name: 'Rest Site', icon: '🏕️', weight: 12 },
    shop: { id: 'shop', name: 'Shop', icon: '🛒', weight: 10 },
    treasure: { id: 'treasure', name: 'Treasure', icon: '💎', weight: 8 },
    mystery: { id: 'mystery', name: 'Mystery', icon: '❓', weight: 8 },
    boss: { id: 'boss', name: 'Boss', icon: '👹', weight: 0 }
  },

  // Nodes per row (branching width) - keep it airy, not scrunched
  MIN_NODES_PER_FLOOR: 2,
  MAX_NODES_PER_FLOOR: 3,  // Reduced from 4 to prevent crowding

  // Current state
  currentMap: null,
  currentAct: 1,
  currentNode: null,
  completedNodes: new Set(),

  // ═══════════════════════════════════════════════════════════════
  // MAP GENERATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate a complete map for one act
   * @param {number} actNumber - Which act (1-indexed)
   * @param {string} categoryId - Category ID for this act's questions
   * @param {string} bossId - Boss ID for the end of the act
   * @param {string} runLength - 'quick', 'standard', or 'epic'
   * @returns {Object} Map data structure
   */
  generateActMap(actNumber, categoryId, bossId, runLength = 'standard') {
    // Check if this act has a LINEAR path defined in CardTemplates
    if (typeof CardTemplates !== 'undefined' && CardTemplates.getMapForAct) {
      const mapTheme = CardTemplates.getMapForAct(actNumber);
      if (mapTheme?.pathType === 'linear' && mapTheme.path) {
        return this.generateLinearMap(actNumber, categoryId, bossId, mapTheme.path);
      }
    }

    const config = this.RUN_LENGTHS[runLength] || this.RUN_LENGTHS.standard;
    const floors = config.floorsPerAct;

    const map = {
      actNumber,
      categoryId,
      bossId,
      floors: [],
      startNodes: [],
      bossNode: null
    };

    // Generate each floor
    for (let f = 0; f < floors; f++) {
      const floor = this.generateFloor(f, floors, actNumber, categoryId);
      map.floors.push(floor);
    }

    // Add boss floor at the end
    const bossFloor = {
      floorNumber: floors,
      nodes: [{
        id: `act${actNumber}_f${floors}_boss`,
        type: 'boss',
        floor: floors,
        categoryId,
        bossId,
        connections: [],
        completed: false,
        x: 0.5, // Center position
        y: floors
      }]
    };
    map.floors.push(bossFloor);
    map.bossNode = bossFloor.nodes[0];

    // Connect all nodes
    this.connectNodes(map);

    // Mark starting nodes
    map.startNodes = map.floors[0].nodes.map(n => n.id);

    return map;
  },

  /**
   * Generate a LINEAR map - single sequential path with no branching
   * Used when CardTemplates defines pathType: 'linear'
   * @param {number} actNumber - Which act
   * @param {string} categoryId - Category ID
   * @param {string} bossId - Boss ID
   * @param {Array} path - Array of {x, y} tile positions
   * @returns {Object} Map data structure
   */
  generateLinearMap(actNumber, categoryId, bossId, path) {
    const nodeCount = path.length;

    const map = {
      actNumber,
      categoryId,
      bossId,
      pathType: 'linear',
      floors: [],
      startNodes: [],
      bossNode: null
    };

    // Create one floor per node (for simplicity in linear maps)
    // Each floor has exactly 1 node
    for (let i = 0; i < nodeCount; i++) {
      const isStart = i === 0;
      const isBoss = i === nodeCount - 1;
      const type = isBoss ? 'boss' : this.selectNodeTypeForLinear(i, nodeCount);

      const node = {
        id: `act${actNumber}_f${i}_n0`,
        type: type,
        floor: i,
        pathIndex: i,  // Important for position lookup
        categoryId,
        connections: i < nodeCount - 1 ? [`act${actNumber}_f${i + 1}_n0`] : [],
        completed: false,
        x: 0.5,
        y: i
      };

      if (isBoss) {
        node.bossId = bossId;
        map.bossNode = node;
      }

      map.floors.push({
        floorNumber: i,
        nodes: [node]
      });
    }

    // Mark starting node
    map.startNodes = [map.floors[0].nodes[0].id];

    console.log(`[MapSystem] Generated LINEAR map for Act ${actNumber} with ${nodeCount} nodes`);
    return map;
  },

  /**
   * Select node type for linear maps (varied encounters along the path)
   */
  selectNodeTypeForLinear(index, totalNodes) {
    // First node is always combat (tutorial/intro)
    if (index === 0) return 'combat';

    // Last node before boss could be rest or shop
    if (index === totalNodes - 2) {
      return Math.random() < 0.5 ? 'rest' : 'shop';
    }

    // Distribute encounters along the path
    const progress = index / totalNodes;

    // Early path: more combat, some mystery
    if (progress < 0.3) {
      const roll = Math.random();
      if (roll < 0.6) return 'combat';
      if (roll < 0.8) return 'mystery';
      return 'treasure';
    }

    // Mid path: elites, shops, variety
    if (progress < 0.7) {
      const roll = Math.random();
      if (roll < 0.4) return 'combat';
      if (roll < 0.55) return 'elite';
      if (roll < 0.7) return 'shop';
      if (roll < 0.85) return 'rest';
      return 'mystery';
    }

    // Late path: harder encounters, rest before boss
    const roll = Math.random();
    if (roll < 0.35) return 'combat';
    if (roll < 0.55) return 'elite';
    if (roll < 0.75) return 'rest';
    return 'treasure';
  },

  /**
   * Generate nodes for a single floor
   */
  generateFloor(floorNumber, totalFloors, actNumber, categoryId) {
    // Vary node count for interesting paths
    const nodeCount = this.randomInt(this.MIN_NODES_PER_FLOOR, this.MAX_NODES_PER_FLOOR);
    const nodes = [];

    for (let n = 0; n < nodeCount; n++) {
      const type = this.selectNodeType(floorNumber, totalFloors);
      const node = {
        id: `act${actNumber}_f${floorNumber}_n${n}`,
        type: type,
        floor: floorNumber,
        categoryId,
        connections: [], // Will be filled by connectNodes
        completed: false,
        x: (n + 0.5) / nodeCount, // Normalized 0-1 position
        y: floorNumber
      };

      // Add type-specific data
      if (type === 'combat') {
        node.questionCount = this.randomInt(3, 5);
        node.monsterLevel = Math.ceil((floorNumber + 1) / 2);
      } else if (type === 'elite') {
        node.questionCount = this.randomInt(5, 7);
        node.monsterLevel = Math.ceil((floorNumber + 1) / 2) + 1;
        node.isElite = true;
      } else if (type === 'shop') {
        node.shopItems = this.generateShopItems();
      } else if (type === 'mystery') {
        node.eventId = this.selectMysteryEvent();
      }

      nodes.push(node);
    }

    return { floorNumber, nodes };
  },

  /**
   * Select node type based on floor position and constraints
   */
  selectNodeType(floorNumber, totalFloors) {
    // First floor: only combat or mystery (no elite/shop)
    if (floorNumber === 0) {
      return Math.random() < 0.85 ? 'combat' : 'mystery';
    }

    // Last floor before boss: often rest or shop
    if (floorNumber === totalFloors - 1) {
      const roll = Math.random();
      if (roll < 0.4) return 'rest';
      if (roll < 0.6) return 'shop';
      return 'combat';
    }

    // Elite not allowed in first 2 floors
    const weights = { ...this.NODE_TYPES };
    if (floorNumber < 2) {
      weights.elite = { ...weights.elite, weight: 0 };
    }

    // Weighted random selection
    const totalWeight = Object.values(weights)
      .filter(t => t.id !== 'boss')
      .reduce((sum, t) => sum + t.weight, 0);

    let roll = Math.random() * totalWeight;
    for (const type of Object.values(weights)) {
      if (type.id === 'boss') continue;
      roll -= type.weight;
      if (roll <= 0) return type.id;
    }

    return 'combat'; // Fallback
  },

  /**
   * Connect nodes between floors to form branching paths
   * Ms. Luminara style: paths may wander, sometimes the "obvious"
   * route isn't available and you must take an unexpected detour
   */
  connectNodes(map) {
    for (let f = 0; f < map.floors.length - 1; f++) {
      const currentFloor = map.floors[f];
      const nextFloor = map.floors[f + 1];

      for (const node of currentFloor.nodes) {
        // Connection count varies more - sometimes only 1, sometimes 3
        // Creates bottlenecks and choices
        const minConnections = f === 0 ? 1 : 1;  // Start floor always has paths
        const maxConnections = Math.min(2 + Math.floor(Math.random() * 2), nextFloor.nodes.length);
        const connectionCount = this.randomInt(minConnections, maxConnections);

        const possibleTargets = [...nextFloor.nodes];

        // Ms. Luminara twist: sometimes prefer DISTANT nodes (unexpected paths)
        // 30% chance to prioritize a longer route
        const preferDistant = Math.random() < 0.3;

        possibleTargets.sort((a, b) => {
          const distA = Math.abs(a.x - node.x);
          const distB = Math.abs(b.x - node.x);
          const baseDiff = preferDistant ? (distB - distA) : (distA - distB);
          // Add significant randomness for organic feel
          return baseDiff + (Math.random() - 0.5) * 0.6;
        });

        const targets = possibleTargets.slice(0, connectionCount);
        for (const target of targets) {
          if (!node.connections.includes(target.id)) {
            node.connections.push(target.id);
          }
        }
      }
    }

    // Ensure boss node is reachable from all penultimate floor nodes
    const penultimateFloor = map.floors[map.floors.length - 2];
    for (const node of penultimateFloor.nodes) {
      if (!node.connections.includes(map.bossNode.id)) {
        node.connections.push(map.bossNode.id);
      }
    }

    // Ensure all nodes are reachable (validate paths)
    this.validateConnections(map);
  },

  /**
   * Ensure every node is reachable from start
   */
  validateConnections(map) {
    // Build reverse connection map
    const incomingConnections = new Map();
    for (const floor of map.floors) {
      for (const node of floor.nodes) {
        incomingConnections.set(node.id, []);
      }
    }

    for (const floor of map.floors) {
      for (const node of floor.nodes) {
        for (const targetId of node.connections) {
          const incoming = incomingConnections.get(targetId);
          if (incoming && !incoming.includes(node.id)) {
            incoming.push(node.id);
          }
        }
      }
    }

    // Check each non-start node has at least one incoming connection
    for (let f = 1; f < map.floors.length; f++) {
      for (const node of map.floors[f].nodes) {
        const incoming = incomingConnections.get(node.id);
        if (!incoming || incoming.length === 0) {
          // Connect from nearest node in previous floor
          const prevFloor = map.floors[f - 1];
          const nearest = prevFloor.nodes.reduce((best, n) => {
            const dist = Math.abs(n.x - node.x);
            return dist < Math.abs(best.x - node.x) ? n : best;
          }, prevFloor.nodes[0]);

          if (!nearest.connections.includes(node.id)) {
            nearest.connections.push(node.id);
          }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // NODE ACCESS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get a node by ID
   */
  getNode(nodeId) {
    if (!this.currentMap) return null;

    for (const floor of this.currentMap.floors) {
      for (const node of floor.nodes) {
        if (node.id === nodeId) return node;
      }
    }
    return null;
  },

  /**
   * Get all nodes the player can currently move to
   */
  getAvailableNodes() {
    if (!this.currentMap) return [];

    // If no node selected yet, return start nodes
    if (!this.currentNode) {
      return this.currentMap.startNodes.map(id => this.getNode(id));
    }

    // Return connected nodes that haven't been completed
    const currentNodeData = this.getNode(this.currentNode);
    if (!currentNodeData) return [];

    return currentNodeData.connections
      .map(id => this.getNode(id))
      .filter(n => n && !n.completed);
  },

  /**
   * Check if a node is selectable
   */
  isNodeSelectable(nodeId) {
    const available = this.getAvailableNodes();
    return available.some(n => n.id === nodeId);
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Set the current map
   */
  setMap(map) {
    this.currentMap = map;
    this.currentNode = null;
    this.completedNodes.clear();
  },

  /**
   * Move to a node (mark as current)
   */
  moveToNode(nodeId) {
    if (!this.isNodeSelectable(nodeId)) {
      console.warn('[Map] Cannot move to node:', nodeId);
      return false;
    }

    this.currentNode = nodeId;
    return true;
  },

  /**
   * Mark current node as completed
   */
  completeCurrentNode() {
    if (!this.currentNode) return;

    const node = this.getNode(this.currentNode);
    if (node) {
      node.completed = true;
      this.completedNodes.add(this.currentNode);
    }
  },

  /**
   * Check if act is complete (boss defeated)
   */
  isActComplete() {
    if (!this.currentMap || !this.currentMap.bossNode) return false;
    return this.currentMap.bossNode.completed;
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOP GENERATION
  // ═══════════════════════════════════════════════════════════════

  generateShopItems() {
    return {
      cards: this.generateShopCards(),
      potions: this.generateShopPotions(),
      services: [
        { id: 'remove_card', name: 'Remove Card', cost: 75, icon: '🗑️' },
        { id: 'upgrade_card', name: 'Upgrade Card', cost: 50, icon: '⬆️' }
      ]
    };
  },

  generateShopCards() {
    const cards = [];
    const rarities = ['COMMON', 'COMMON', 'UNCOMMON', 'UNCOMMON', 'RARE'];

    for (const rarity of rarities) {
      if (typeof CardSystem !== 'undefined') {
        const card = CardSystem.generateCardByRarity(rarity);
        if (card) {
          cards.push({
            ...card,
            cost: this.getCardShopCost(rarity)
          });
        }
      }
    }

    return cards;
  },

  generateShopPotions() {
    const potions = [];
    if (typeof PotionSystem !== 'undefined') {
      const types = Object.keys(PotionSystem.POTIONS);
      // Offer 2-3 random potions
      const count = this.randomInt(2, 3);
      const shuffled = types.sort(() => Math.random() - 0.5);

      for (let i = 0; i < count; i++) {
        const potionType = shuffled[i];
        const potion = PotionSystem.POTIONS[potionType];
        if (potion) {
          potions.push({
            ...potion,
            cost: this.getPotionShopCost(potionType)
          });
        }
      }
    }
    return potions;
  },

  getCardShopCost(rarity) {
    const costs = {
      COMMON: this.randomInt(45, 55),
      UNCOMMON: this.randomInt(70, 90),
      RARE: this.randomInt(150, 180),
      LEGENDARY: this.randomInt(250, 300)
    };
    return costs[rarity] || 50;
  },

  getPotionShopCost(type) {
    const costs = {
      HEALTH: 50,
      BLOCK: 50,
      STRENGTH: 75,
      DRAW: 65,
      LUCKY: 100
    };
    return costs[type] || 50;
  },

  // ═══════════════════════════════════════════════════════════════
  // MYSTERY EVENTS
  // ═══════════════════════════════════════════════════════════════

  MYSTERY_EVENTS: [
    { id: 'wandering_merchant', name: 'Wandering Merchant', weight: 20 },
    { id: 'ancient_tome', name: 'Ancient Tome', weight: 15 },
    { id: 'mysterious_statue', name: 'Mysterious Statue', weight: 15 },
    { id: 'golden_shrine', name: 'Golden Shrine', weight: 10 },
    { id: 'knowledge_spirit', name: 'Spirit of Knowledge', weight: 15 },
    { id: 'challenge_room', name: 'Challenge Room', weight: 10 },
    { id: 'resting_scholar', name: 'Resting Scholar', weight: 15 }
  ],

  selectMysteryEvent() {
    const totalWeight = this.MYSTERY_EVENTS.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const event of this.MYSTERY_EVENTS) {
      roll -= event.weight;
      if (roll <= 0) return event.id;
    }

    return this.MYSTERY_EVENTS[0].id;
  },

  // ═══════════════════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════════════════

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Save map state
   */
  saveState() {
    return {
      currentMap: this.currentMap,
      currentAct: this.currentAct,
      currentNode: this.currentNode,
      completedNodes: Array.from(this.completedNodes)
    };
  },

  /**
   * Load map state
   */
  loadState(state) {
    if (!state) return;

    this.currentMap = state.currentMap;
    this.currentAct = state.currentAct;
    this.currentNode = state.currentNode;
    this.completedNodes = new Set(state.completedNodes || []);
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.MapSystem = MapSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapSystem;
}
