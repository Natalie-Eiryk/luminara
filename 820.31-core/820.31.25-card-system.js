/**
 * Ms. Luminara Quiz - Card Battle System
 * Slay the Spire inspired deck-building for boss encounters
 *
 * @module CardSystem
 * @version 1.0.0
 */

const CardSystem = {
  // ============================================
  // CARD DEFINITIONS
  // ============================================

  CARD_TYPES: {
    ATTACK: 'attack',
    DEFENSE: 'defense',
    SKILL: 'skill',
    POWER: 'power'
  },

  CARD_RARITIES: {
    STARTER: { name: 'Starter', color: '#6b6259', dropWeight: 0 },
    COMMON: { name: 'Common', color: '#a89f91', dropWeight: 60 },
    UNCOMMON: { name: 'Uncommon', color: '#5a9c6f', dropWeight: 25 },
    RARE: { name: 'Rare', color: '#5a7fc6', dropWeight: 12 },
    LEGENDARY: { name: 'Legendary', color: '#c9a55c', dropWeight: 3 }
  },

  // All available cards in the game
  CARDS: {
    // ═══════════════════════════════════════════
    // STARTER CARDS (Everyone starts with these)
    // ═══════════════════════════════════════════
    STRIKE: {
      id: 'strike',
      name: 'Strike',
      type: 'attack',
      rarity: 'STARTER',
      cost: 1,
      emoji: '⚔️',
      description: 'Deal 6 damage.',
      effect: { damage: 6 }
    },
    DEFEND: {
      id: 'defend',
      name: 'Defend',
      type: 'defense',
      rarity: 'STARTER',
      cost: 1,
      emoji: '🛡️',
      description: 'Gain 5 Block.',
      effect: { block: 5 }
    },
    STUDY: {
      id: 'study',
      name: 'Study',
      type: 'skill',
      rarity: 'STARTER',
      cost: 0,
      emoji: '📖',
      description: 'Draw 1 card.',
      effect: { draw: 1 }
    },

    // ═══════════════════════════════════════════
    // COMMON ATTACK CARDS
    // ═══════════════════════════════════════════
    QUICK_RECALL: {
      id: 'quick_recall',
      name: 'Quick Recall',
      type: 'attack',
      rarity: 'COMMON',
      cost: 1,
      emoji: '💭',
      description: 'Deal 4 damage. Draw 1 card.',
      effect: { damage: 4, draw: 1 }
    },
    FLASH_CARDS: {
      id: 'flash_cards',
      name: 'Flash Cards',
      type: 'attack',
      rarity: 'COMMON',
      cost: 1,
      emoji: '🃏',
      description: 'Deal 3 damage twice.',
      effect: { damage: 3, hits: 2 }
    },
    MEMORIZE: {
      id: 'memorize',
      name: 'Memorize',
      type: 'attack',
      rarity: 'COMMON',
      cost: 2,
      emoji: '🧠',
      description: 'Deal 10 damage.',
      effect: { damage: 10 }
    },
    POP_QUIZ: {
      id: 'pop_quiz',
      name: 'Pop Quiz',
      type: 'attack',
      rarity: 'COMMON',
      cost: 0,
      emoji: '❓',
      description: 'Deal 4 damage.',
      effect: { damage: 4 }
    },

    // ═══════════════════════════════════════════
    // COMMON DEFENSE CARDS
    // ═══════════════════════════════════════════
    REVIEW_NOTES: {
      id: 'review_notes',
      name: 'Review Notes',
      type: 'defense',
      rarity: 'COMMON',
      cost: 1,
      emoji: '📝',
      description: 'Gain 7 Block.',
      effect: { block: 7 }
    },
    DEEP_BREATH: {
      id: 'deep_breath',
      name: 'Deep Breath',
      type: 'defense',
      rarity: 'COMMON',
      cost: 1,
      emoji: '😤',
      description: 'Gain 4 Block. Draw 1 card.',
      effect: { block: 4, draw: 1 }
    },
    CONFIDENCE: {
      id: 'confidence',
      name: 'Confidence',
      type: 'defense',
      rarity: 'COMMON',
      cost: 2,
      emoji: '💪',
      description: 'Gain 12 Block.',
      effect: { block: 12 }
    },

    // ═══════════════════════════════════════════
    // COMMON SKILL CARDS
    // ═══════════════════════════════════════════
    PREPARATION: {
      id: 'preparation',
      name: 'Preparation',
      type: 'skill',
      rarity: 'COMMON',
      cost: 0,
      emoji: '📋',
      description: 'Draw 2 cards. Discard 1 card.',
      effect: { draw: 2, discard: 1 }
    },
    OFFICE_HOURS: {
      id: 'office_hours',
      name: 'Office Hours',
      type: 'skill',
      rarity: 'COMMON',
      cost: 1,
      emoji: '🏫',
      description: 'Draw 2 cards.',
      effect: { draw: 2 }
    },

    // ═══════════════════════════════════════════
    // UNCOMMON ATTACK CARDS
    // ═══════════════════════════════════════════
    CRAM_SESSION: {
      id: 'cram_session',
      name: 'Cram Session',
      type: 'attack',
      rarity: 'UNCOMMON',
      cost: 2,
      emoji: '📚',
      description: 'Deal 8 damage. Draw 2 cards.',
      effect: { damage: 8, draw: 2 }
    },
    EUREKA: {
      id: 'eureka',
      name: 'Eureka!',
      type: 'attack',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '💡',
      description: 'Deal 5 damage. If this kills, gain 1 Energy.',
      effect: { damage: 5, onKill: { energy: 1 } }
    },
    KNOWLEDGE_BOMB: {
      id: 'knowledge_bomb',
      name: 'Knowledge Bomb',
      type: 'attack',
      rarity: 'UNCOMMON',
      cost: 2,
      emoji: '💣',
      description: 'Deal 14 damage.',
      effect: { damage: 14 }
    },
    RAPID_FIRE: {
      id: 'rapid_fire',
      name: 'Rapid Fire',
      type: 'attack',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '🔥',
      description: 'Deal 2 damage 4 times.',
      effect: { damage: 2, hits: 4 }
    },
    COMBO_BREAKER: {
      id: 'combo_breaker',
      name: 'Combo Breaker',
      type: 'attack',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '⚡',
      description: 'Deal 6 damage. +3 per card played this turn.',
      effect: { damage: 6, perCardPlayed: 3 }
    },

    // ═══════════════════════════════════════════
    // UNCOMMON DEFENSE CARDS
    // ═══════════════════════════════════════════
    STUDY_GROUP: {
      id: 'study_group',
      name: 'Study Group',
      type: 'defense',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '👥',
      description: 'Gain 8 Block. Gain 1 Strength.',
      effect: { block: 8, strength: 1 }
    },
    MENTAL_FORTRESS: {
      id: 'mental_fortress',
      name: 'Mental Fortress',
      type: 'defense',
      rarity: 'UNCOMMON',
      cost: 2,
      emoji: '🏰',
      description: 'Gain 15 Block.',
      effect: { block: 15 }
    },
    SECOND_WIND: {
      id: 'second_wind',
      name: 'Second Wind',
      type: 'defense',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '🌬️',
      description: 'Gain 5 Block. Heal 3 HP.',
      effect: { block: 5, heal: 3 }
    },

    // ═══════════════════════════════════════════
    // UNCOMMON SKILL CARDS
    // ═══════════════════════════════════════════
    TUTOR: {
      id: 'tutor',
      name: 'Tutor',
      type: 'skill',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '👨‍🏫',
      description: 'Draw 3 cards. Discard 1.',
      effect: { draw: 3, discard: 1 }
    },
    MNEMONIC_DEVICE: {
      id: 'mnemonic_device',
      name: 'Mnemonic Device',
      type: 'skill',
      rarity: 'UNCOMMON',
      cost: 0,
      emoji: '🔗',
      description: 'Next Attack deals double damage.',
      effect: { buff: { doubleDamage: 1 } }
    },
    FOCUSED_STUDY: {
      id: 'focused_study',
      name: 'Focused Study',
      type: 'skill',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '🎯',
      description: 'Gain 2 Energy. Exhaust.',
      effect: { energy: 2, exhaust: true }
    },

    // ═══════════════════════════════════════════
    // UNCOMMON POWER CARDS
    // ═══════════════════════════════════════════
    GROWTH_MINDSET: {
      id: 'growth_mindset',
      name: 'Growth Mindset',
      type: 'power',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '🌱',
      description: 'Gain 1 Strength at the start of each turn.',
      effect: { power: { strengthPerTurn: 1 } }
    },
    RETENTION: {
      id: 'retention',
      name: 'Retention',
      type: 'power',
      rarity: 'UNCOMMON',
      cost: 1,
      emoji: '🧲',
      description: 'Keep 3 Block at end of turn.',
      effect: { power: { retainBlock: 3 } }
    },

    // ═══════════════════════════════════════════
    // RARE ATTACK CARDS
    // ═══════════════════════════════════════════
    LIMIT_BREAK: {
      id: 'limit_break',
      name: 'Limit Break',
      type: 'attack',
      rarity: 'RARE',
      cost: 2,
      emoji: '💥',
      description: 'Double your Strength.',
      effect: { doubleStrength: true }
    },
    PERFECT_SCORE: {
      id: 'perfect_score',
      name: 'Perfect Score',
      type: 'attack',
      rarity: 'RARE',
      cost: 3,
      emoji: '💯',
      description: 'Deal 25 damage.',
      effect: { damage: 25 }
    },
    CHAIN_REACTION: {
      id: 'chain_reaction',
      name: 'Chain Reaction',
      type: 'attack',
      rarity: 'RARE',
      cost: 1,
      emoji: '⛓️',
      description: 'Deal 7 damage. If enemy has <50% HP, deal 7 again.',
      effect: { damage: 7, conditional: { threshold: 50, bonus: 7 } }
    },
    THESIS_DEFENSE: {
      id: 'thesis_defense',
      name: 'Thesis Defense',
      type: 'attack',
      rarity: 'RARE',
      cost: 2,
      emoji: '📜',
      description: 'Deal 12 damage. Gain 12 Block.',
      effect: { damage: 12, block: 12 }
    },

    // ═══════════════════════════════════════════
    // RARE DEFENSE CARDS
    // ═══════════════════════════════════════════
    IMPERVIOUS: {
      id: 'impervious',
      name: 'Impervious',
      type: 'defense',
      rarity: 'RARE',
      cost: 2,
      emoji: '🔰',
      description: 'Gain 30 Block. Exhaust.',
      effect: { block: 30, exhaust: true }
    },
    ENLIGHTENMENT: {
      id: 'enlightenment',
      name: 'Enlightenment',
      type: 'defense',
      rarity: 'RARE',
      cost: 0,
      emoji: '✨',
      description: 'All cards cost 1 this turn.',
      effect: { allCostOne: true }
    },

    // ═══════════════════════════════════════════
    // RARE SKILL CARDS
    // ═══════════════════════════════════════════
    OMNISCIENCE: {
      id: 'omniscience',
      name: 'Omniscience',
      type: 'skill',
      rarity: 'RARE',
      cost: 2,
      emoji: '👁️',
      description: 'Choose a card in your draw pile. Play it twice. Exhaust.',
      effect: { chooseAndDouble: true, exhaust: true }
    },
    ADRENALINE: {
      id: 'adrenaline',
      name: 'Adrenaline',
      type: 'skill',
      rarity: 'RARE',
      cost: 0,
      emoji: '💉',
      description: 'Gain 2 Energy. Draw 2 cards. Exhaust.',
      effect: { energy: 2, draw: 2, exhaust: true }
    },

    // ═══════════════════════════════════════════
    // RARE POWER CARDS
    // ═══════════════════════════════════════════
    MASTERY: {
      id: 'mastery',
      name: 'Mastery',
      type: 'power',
      rarity: 'RARE',
      cost: 3,
      emoji: '👑',
      description: 'At end of turn, deal 6 damage to ALL enemies.',
      effect: { power: { endTurnDamage: 6 } }
    },
    PERFECTIONIST: {
      id: 'perfectionist',
      name: 'Perfectionist',
      type: 'power',
      rarity: 'RARE',
      cost: 1,
      emoji: '🎖️',
      description: 'Whenever you play 3 cards in a turn, draw 1 card.',
      effect: { power: { drawOnCombo: 3 } }
    },

    // ═══════════════════════════════════════════
    // LEGENDARY CARDS (Boss drops only)
    // ═══════════════════════════════════════════
    LUMINARAS_BLESSING: {
      id: 'luminaras_blessing',
      name: "Luminara's Blessing",
      type: 'power',
      rarity: 'LEGENDARY',
      cost: 2,
      emoji: '🌟',
      description: 'Gain 2 Strength. Draw 1 extra card each turn.',
      effect: { strength: 2, power: { drawPerTurn: 1 } }
    },
    TOTAL_RECALL: {
      id: 'total_recall',
      name: 'Total Recall',
      type: 'attack',
      rarity: 'LEGENDARY',
      cost: 3,
      emoji: '🧬',
      description: 'Deal 8 damage for each unique card type played this combat.',
      effect: { damagePerUniqueCard: 8 }
    },
    INFINITE_KNOWLEDGE: {
      id: 'infinite_knowledge',
      name: 'Infinite Knowledge',
      type: 'skill',
      rarity: 'LEGENDARY',
      cost: 1,
      emoji: '♾️',
      description: 'Draw cards until you have 10. Exhaust.',
      effect: { drawTo: 10, exhaust: true }
    },
    ASCENSION: {
      id: 'ascension',
      name: 'Ascension',
      type: 'power',
      rarity: 'LEGENDARY',
      cost: 3,
      emoji: '🚀',
      description: 'Start each turn with 1 extra Energy.',
      effect: { power: { bonusEnergy: 1 } }
    }
  },

  // ============================================
  // STARTER DECK
  // ============================================

  getStarterDeck() {
    return [
      'strike', 'strike', 'strike', 'strike', 'strike',
      'defend', 'defend', 'defend', 'defend',
      'study'
    ];
  },

  // ============================================
  // CARD POOL BY CATEGORY (Mini-boss drops)
  // ============================================

  CATEGORY_CARD_POOLS: {
    // 611 Foundations - Basic cards
    '000': ['quick_recall', 'flash_cards', 'review_notes', 'deep_breath', 'preparation'],
    // 611.018 Tissues - Defense focused
    '400': ['confidence', 'study_group', 'mental_fortress', 'second_wind', 'retention'],
    // 612.82 Brain - Draw/combo cards
    '100': ['cram_session', 'tutor', 'mnemonic_device', 'perfectionist', 'combo_breaker'],
    // 612.81 Nerves - Fast attacks
    '200': ['rapid_fire', 'pop_quiz', 'eureka', 'adrenaline', 'chain_reaction'],
    // 612.89 ANS - Power cards
    '500': ['growth_mindset', 'focused_study', 'mastery', 'office_hours'],
    // 612.8 Senses - Balanced
    '600': ['knowledge_bomb', 'thesis_defense', 'impervious', 'enlightenment'],
    // 612.4 Endocrine - Strength scaling
    '700': ['limit_break', 'memorize', 'perfect_score', 'luminaras_blessing'],
    // 612.8L Lab Prep - Legendary pool
    '800': ['total_recall', 'infinite_knowledge', 'ascension', 'omniscience']
  },

  // ============================================
  // DECK MANAGEMENT
  // ============================================

  initDeck() {
    // Get player's deck from persistence or create starter
    const saved = this.loadDeck();
    if (saved && saved.length > 0) {
      this.masterDeck = saved;
    } else {
      this.masterDeck = this.getStarterDeck();
      this.saveDeck();
    }
  },

  loadDeck() {
    try {
      const data = localStorage.getItem('ms_luminara_card_deck');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('[Cards] Failed to load deck:', e);
      return null;
    }
  },

  saveDeck() {
    try {
      localStorage.setItem('ms_luminara_card_deck', JSON.stringify(this.masterDeck));
    } catch (e) {
      console.warn('[Cards] Failed to save deck:', e);
    }
  },

  addCardToDeck(cardId) {
    if (!this.masterDeck) this.initDeck();
    this.masterDeck.push(cardId);
    this.saveDeck();
    console.log(`[Cards] Added ${cardId} to deck. Deck size: ${this.masterDeck.length}`);
  },

  removeCardFromDeck(cardId) {
    if (!this.masterDeck) return false;
    const idx = this.masterDeck.indexOf(cardId);
    if (idx >= 0) {
      this.masterDeck.splice(idx, 1);
      this.saveDeck();
      return true;
    }
    return false;
  },

  getDeck() {
    if (!this.masterDeck) this.initDeck();
    return [...this.masterDeck];
  },

  getCard(cardId) {
    return this.CARDS[cardId.toUpperCase()] || null;
  },

  // ============================================
  // CARD REWARDS (Mini-boss drops)
  // ============================================

  generateCardReward(categoryId, isFinalBoss = false) {
    const numChoices = isFinalBoss ? 4 : 3;
    const pool = this.getCardPoolForCategory(categoryId, isFinalBoss);
    const choices = [];

    // Pick random cards from pool (no duplicates)
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numChoices, shuffled.length); i++) {
      choices.push(shuffled[i]);
    }

    return choices;
  },

  getCardPoolForCategory(categoryId, includeLegendary = false) {
    const pool = [];

    // Add category-specific cards
    const categoryCards = this.CATEGORY_CARD_POOLS[categoryId] || [];
    pool.push(...categoryCards);

    // Add some random commons/uncommons
    for (const [id, card] of Object.entries(this.CARDS)) {
      if (card.rarity === 'COMMON' || card.rarity === 'UNCOMMON') {
        if (!pool.includes(id.toLowerCase()) && Math.random() < 0.3) {
          pool.push(id.toLowerCase());
        }
      }
    }

    // Final bosses can drop legendaries
    if (includeLegendary) {
      for (const [id, card] of Object.entries(this.CARDS)) {
        if (card.rarity === 'LEGENDARY') {
          pool.push(id.toLowerCase());
        }
      }
    }

    return pool;
  },

  // Generate a random card of a specific rarity (for shops)
  generateCardByRarity(rarity) {
    const cards = [];
    for (const [id, card] of Object.entries(this.CARDS)) {
      if (card.rarity === rarity) {
        cards.push(id.toLowerCase());
      }
    }
    if (cards.length === 0) return null;
    const cardId = cards[Math.floor(Math.random() * cards.length)];
    return cardId;
  },

  // ============================================
  // COMBAT STATE
  // ============================================

  initCombat() {
    if (!this.masterDeck) this.initDeck();

    this.combatState = {
      drawPile: this.shuffleDeck([...this.masterDeck]),
      hand: [],
      discardPile: [],
      exhaustPile: [],
      energy: 3,
      maxEnergy: 3,
      block: 0,
      strength: 0,
      cardsPlayedThisTurn: 0,
      uniqueCardsPlayed: new Set(),
      powers: {},
      buffs: {}
    };

    // Draw starting hand
    this.drawCards(5);

    return this.combatState;
  },

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  },

  drawCards(count) {
    const state = this.combatState;
    for (let i = 0; i < count; i++) {
      if (state.hand.length >= 10) break; // Max hand size

      if (state.drawPile.length === 0) {
        // Shuffle discard into draw
        state.drawPile = this.shuffleDeck([...state.discardPile]);
        state.discardPile = [];
      }

      if (state.drawPile.length > 0) {
        state.hand.push(state.drawPile.pop());
      }
    }
  },

  startTurn() {
    const state = this.combatState;

    // Reset energy
    state.energy = state.maxEnergy + (state.powers.bonusEnergy || 0);

    // Apply powers
    if (state.powers.strengthPerTurn) {
      state.strength += state.powers.strengthPerTurn;
    }

    // Draw cards
    const drawCount = 5 + (state.powers.drawPerTurn || 0);
    this.drawCards(drawCount);

    // Reset turn counters
    state.cardsPlayedThisTurn = 0;
    state.block = Math.min(state.block, state.powers.retainBlock || 0);

    return state;
  },

  playCard(cardId, target = null) {
    const state = this.combatState;
    const card = this.getCard(cardId);

    if (!card) return { success: false, error: 'Card not found' };

    // Check cost
    const cost = state.buffs.allCostOne ? 1 : card.cost;
    if (state.energy < cost) {
      return { success: false, error: 'Not enough energy' };
    }

    // Remove from hand
    const handIdx = state.hand.indexOf(cardId.toLowerCase());
    if (handIdx < 0) {
      return { success: false, error: 'Card not in hand' };
    }
    state.hand.splice(handIdx, 1);

    // Pay cost
    state.energy -= cost;

    // Track cards played
    state.cardsPlayedThisTurn++;
    state.uniqueCardsPlayed.add(cardId);

    // Apply effects
    const result = this.applyCardEffects(card, target);

    // Discard or exhaust
    if (card.effect.exhaust) {
      state.exhaustPile.push(cardId.toLowerCase());
    } else {
      state.discardPile.push(cardId.toLowerCase());
    }

    // Check power triggers
    if (state.powers.drawOnCombo && state.cardsPlayedThisTurn >= state.powers.drawOnCombo) {
      this.drawCards(1);
    }

    return { success: true, ...result };
  },

  applyCardEffects(card, target) {
    const state = this.combatState;
    const result = {
      damage: 0,
      block: 0,
      draw: 0,
      heal: 0,
      effects: []
    };

    const eff = card.effect;

    // Damage
    if (eff.damage) {
      let dmg = eff.damage + state.strength;

      // Double damage buff
      if (state.buffs.doubleDamage > 0) {
        dmg *= 2;
        state.buffs.doubleDamage--;
      }

      // Per card played bonus
      if (eff.perCardPlayed) {
        dmg += eff.perCardPlayed * (state.cardsPlayedThisTurn - 1);
      }

      // Multiple hits
      const hits = eff.hits || 1;
      result.damage = dmg * hits;
    }

    // Block
    if (eff.block) {
      state.block += eff.block;
      result.block = eff.block;
    }

    // Draw
    if (eff.draw) {
      this.drawCards(eff.draw);
      result.draw = eff.draw;
    }

    // Heal
    if (eff.heal) {
      result.heal = eff.heal;
    }

    // Energy
    if (eff.energy) {
      state.energy += eff.energy;
      result.effects.push(`+${eff.energy} Energy`);
    }

    // Strength
    if (eff.strength) {
      state.strength += eff.strength;
      result.effects.push(`+${eff.strength} Strength`);
    }

    // Double strength
    if (eff.doubleStrength) {
      state.strength *= 2;
      result.effects.push('Strength doubled!');
    }

    // Powers
    if (eff.power) {
      for (const [key, value] of Object.entries(eff.power)) {
        state.powers[key] = (state.powers[key] || 0) + value;
        result.effects.push(`Power: ${key}`);
      }
    }

    // Buffs
    if (eff.buff) {
      for (const [key, value] of Object.entries(eff.buff)) {
        state.buffs[key] = (state.buffs[key] || 0) + value;
      }
    }

    // All cost one
    if (eff.allCostOne) {
      state.buffs.allCostOne = true;
      result.effects.push('All cards cost 1!');
    }

    return result;
  },

  endTurn() {
    const state = this.combatState;

    // Discard hand
    state.discardPile.push(...state.hand);
    state.hand = [];

    // Reset turn buffs
    state.buffs.allCostOne = false;

    // End turn powers
    const endTurnDamage = state.powers.endTurnDamage || 0;

    return {
      endTurnDamage
    };
  },

  // ============================================
  // UI HELPERS
  // ============================================

  getCardHTML(cardId, inHand = true) {
    const card = this.getCard(cardId);
    if (!card) return '';

    const rarity = this.CARD_RARITIES[card.rarity];
    const canPlay = inHand && this.combatState &&
      this.combatState.energy >= (this.combatState.buffs?.allCostOne ? 1 : card.cost);

    return `
      <div class="card card-${card.type} card-${card.rarity.toLowerCase()} ${canPlay ? 'playable' : 'unplayable'}"
           data-card-id="${cardId}"
           style="--rarity-color: ${rarity.color}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-emoji">${card.emoji}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-type">${card.type}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-rarity">${rarity.name}</div>
      </div>
    `;
  },

  getHandHTML() {
    if (!this.combatState) return '';
    return this.combatState.hand.map(id => this.getCardHTML(id, true)).join('');
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  window.CardSystem = CardSystem;
}
