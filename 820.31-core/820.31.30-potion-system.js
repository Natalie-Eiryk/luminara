/**
 * Ms. Luminara Quiz - Potion System
 * Consumable items earned from successful REBUTTALS
 *
 * @module PotionSystem
 * @version 1.0.0
 */

const PotionSystem = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  MAX_SLOTS: 3,

  POTIONS: {
    HEALTH: {
      id: 'HEALTH',
      name: 'Health Potion',
      emoji: '🧪',
      color: '#8b4049',
      description: 'Restore 25% of max HP',
      effect: 'heal_25_percent',
      weight: 40,
      rarity: 'common'
    },
    BLOCK: {
      id: 'BLOCK',
      name: 'Block Potion',
      emoji: '🛡️',
      color: '#5a7c65',
      description: 'Gain 15 Block for this combat',
      effect: 'block_15',
      weight: 25,
      rarity: 'common'
    },
    STRENGTH: {
      id: 'STRENGTH',
      name: 'Strength Potion',
      emoji: '💪',
      color: '#c9a55c',
      description: '+3 Strength for this combat',
      effect: 'strength_3',
      weight: 20,
      rarity: 'uncommon'
    },
    DRAW: {
      id: 'DRAW',
      name: 'Draw Potion',
      emoji: '🃏',
      color: '#7d6b8a',
      description: 'Draw 3 additional cards',
      effect: 'draw_3',
      weight: 10,
      rarity: 'uncommon'
    },
    LUCKY: {
      id: 'LUCKY',
      name: 'Lucky Elixir',
      emoji: '🍀',
      color: '#4ade80',
      description: 'Next answer is automatically correct',
      effect: 'auto_correct',
      weight: 5,
      rarity: 'rare'
    }
  },

  // Current inventory
  inventory: [],

  // Active effects (cleared after combat)
  activeEffects: {
    strengthBonus: 0,
    blockBonus: 0,
    autoCorrectNext: false
  },

  // ═══════════════════════════════════════════════════════════════
  // INVENTORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if inventory has space
   * @returns {boolean}
   */
  hasSpace() {
    return this.inventory.length < this.MAX_SLOTS;
  },

  /**
   * Get current inventory
   * @returns {Array}
   */
  getInventory() {
    return [...this.inventory];
  },

  /**
   * Get inventory for display (padded to MAX_SLOTS)
   * @returns {Array}
   */
  getInventorySlots() {
    const slots = [...this.inventory];
    while (slots.length < this.MAX_SLOTS) {
      slots.push(null);
    }
    return slots;
  },

  /**
   * Roll for a random potion (weighted)
   * @returns {Object} Potion data
   */
  rollRandomPotion() {
    const potionTypes = Object.values(this.POTIONS);
    const totalWeight = potionTypes.reduce((sum, p) => sum + p.weight, 0);

    let roll = Math.random() * totalWeight;
    for (const potion of potionTypes) {
      roll -= potion.weight;
      if (roll <= 0) {
        return { ...potion };
      }
    }

    // Fallback to health potion
    return { ...this.POTIONS.HEALTH };
  },

  /**
   * Attempt to earn a potion (from successful REBUTTAL)
   * @returns {Object} Result with earned status
   */
  earnPotion() {
    if (!this.hasSpace()) {
      return {
        earned: false,
        reason: 'full',
        alternateReward: { type: 'heal', amount: 5 }
      };
    }

    const potion = this.rollRandomPotion();
    this.inventory.push(potion);

    console.log('[PotionSystem] Earned:', potion.name);

    return {
      earned: true,
      potion: potion
    };
  },

  /**
   * Add a specific potion to inventory
   * @param {string} potionId - ID of potion type
   * @returns {boolean} Success
   */
  addPotion(potionId) {
    if (!this.hasSpace()) return false;

    const potionType = this.POTIONS[potionId];
    if (!potionType) {
      console.warn('[PotionSystem] Unknown potion:', potionId);
      return false;
    }

    this.inventory.push({ ...potionType });
    return true;
  },

  /**
   * Remove potion at index
   * @param {number} index
   * @returns {Object|null} Removed potion
   */
  removePotion(index) {
    if (index < 0 || index >= this.inventory.length) return null;
    return this.inventory.splice(index, 1)[0];
  },

  // ═══════════════════════════════════════════════════════════════
  // POTION USE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Use a potion from inventory
   * @param {number} slotIndex - Inventory slot index
   * @param {Object} context - Combat context (player HP, max HP, etc.)
   * @returns {Object|null} Effect result
   */
  usePotion(slotIndex, context = {}) {
    if (slotIndex < 0 || slotIndex >= this.inventory.length) {
      console.warn('[PotionSystem] Invalid slot:', slotIndex);
      return null;
    }

    const potion = this.inventory.splice(slotIndex, 1)[0];
    if (!potion) return null;

    const result = this.applyEffect(potion, context);

    console.log('[PotionSystem] Used:', potion.name, '- Effect:', result);

    return {
      potion: potion,
      effect: result
    };
  },

  /**
   * Apply a potion's effect
   * @param {Object} potion
   * @param {Object} context
   * @returns {Object} Effect result
   */
  applyEffect(potion, context) {
    switch (potion.effect) {
      case 'heal_25_percent': {
        const maxHp = context.maxHp || 100;
        const healAmount = Math.floor(maxHp * 0.25);
        return {
          type: 'heal',
          amount: healAmount,
          description: `Healed ${healAmount} HP`
        };
      }

      case 'block_15': {
        this.activeEffects.blockBonus += 15;
        return {
          type: 'block',
          amount: 15,
          description: 'Gained 15 Block'
        };
      }

      case 'strength_3': {
        this.activeEffects.strengthBonus += 3;
        return {
          type: 'strength',
          amount: 3,
          description: '+3 Strength this combat'
        };
      }

      case 'draw_3': {
        return {
          type: 'draw',
          amount: 3,
          description: 'Draw 3 cards'
        };
      }

      case 'auto_correct': {
        this.activeEffects.autoCorrectNext = true;
        return {
          type: 'auto_correct',
          description: 'Next answer auto-correct!'
        };
      }

      default:
        console.warn('[PotionSystem] Unknown effect:', potion.effect);
        return { type: 'unknown' };
    }
  },

  /**
   * Check and consume auto-correct if active
   * @returns {boolean} Whether auto-correct was active
   */
  consumeAutoCorrect() {
    if (this.activeEffects.autoCorrectNext) {
      this.activeEffects.autoCorrectNext = false;
      return true;
    }
    return false;
  },

  /**
   * Get current strength bonus
   * @returns {number}
   */
  getStrengthBonus() {
    return this.activeEffects.strengthBonus;
  },

  /**
   * Get and consume block bonus
   * @returns {number}
   */
  getBlockBonus() {
    const bonus = this.activeEffects.blockBonus;
    this.activeEffects.blockBonus = 0;
    return bonus;
  },

  // ═══════════════════════════════════════════════════════════════
  // COMBAT LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Reset effects at start of combat
   */
  startCombat() {
    this.activeEffects = {
      strengthBonus: 0,
      blockBonus: 0,
      autoCorrectNext: false
    };
  },

  /**
   * Clear combat effects at end
   */
  endCombat() {
    this.activeEffects = {
      strengthBonus: 0,
      blockBonus: 0,
      autoCorrectNext: false
    };
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Save inventory state
   * @returns {Object}
   */
  saveState() {
    return {
      inventory: this.inventory.map(p => p.id),
      activeEffects: { ...this.activeEffects }
    };
  },

  /**
   * Load inventory state
   * @param {Object} state
   */
  loadState(state) {
    if (!state) return;

    this.inventory = [];
    if (state.inventory) {
      for (const potionId of state.inventory) {
        const potionType = this.POTIONS[potionId];
        if (potionType) {
          this.inventory.push({ ...potionType });
        }
      }
    }

    if (state.activeEffects) {
      this.activeEffects = { ...state.activeEffects };
    }
  },

  /**
   * Reset to empty state
   */
  reset() {
    this.inventory = [];
    this.activeEffects = {
      strengthBonus: 0,
      blockBonus: 0,
      autoCorrectNext: false
    };
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.PotionSystem = PotionSystem;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PotionSystem;
}
