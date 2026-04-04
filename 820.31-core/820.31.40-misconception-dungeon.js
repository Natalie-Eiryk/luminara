/**
 * Misconception Dungeon Engine
 * @file 820.31.40-misconception-dungeon.js
 * @codon 820.31.40
 * @version 2026-03-29
 *
 * Game Path 1: Procedurally generated dungeons where each room is a misconception.
 * The dungeon layout IS the learner's confusion matrix.
 *
 * Research Basis:
 * - McDermott P4: "Certain common difficulties must be explicitly addressed"
 * - Piaget: Misconceptions are data about mental models
 * - Vygotsky: ZPD as dungeon frontier
 *
 * TAIDRGEF Signature: T.G.D.R
 * - T (Transform): Dungeon transforms as misconceptions clear
 * - G (Gravitate): Rooms gravitate toward highest confusion
 * - D (Diminish): Dungeon diminishes with mastery
 * - R (React): System reacts to player combat choices
 */

class MisconceptionDungeonEngine {
  constructor(questionStatistics, learningAnalytics, persistence) {
    this.questionStatistics = questionStatistics;
    this.learningAnalytics = learningAnalytics;
    this.persistence = persistence;

    this.STORAGE_KEY = 'ms_luminara_misconception_dungeon';
    this.data = this.loadData();

    // Dungeon configuration
    this.config = {
      minRoomsForDungeon: 3,        // Need at least 3 misconceptions to generate
      maxRoomsPerFloor: 5,          // Max rooms on each floor
      floorsPerDungeon: 3,          // Default dungeon depth
      bossThreshold: 0.35,          // Confusion rate to become boss
      roomDifficultyScale: 1.5,     // Difficulty multiplier per floor
      clarityShardChance: 0.7,      // Chance to drop clarity shard
      insightCrystalChance: 0.3,    // Chance for boss to drop insight crystal
    };

    // Room types based on misconception severity
    this.ROOM_TYPES = {
      MINOR: { name: 'Shadow Alcove', hp: 30, damage: 5, icon: '🌑' },
      MODERATE: { name: 'Confusion Chamber', hp: 50, damage: 8, icon: '🌀' },
      SEVERE: { name: 'Distortion Hall', hp: 75, damage: 12, icon: '💫' },
      CRITICAL: { name: 'Void Sanctum', hp: 100, damage: 15, icon: '🕳️' },
      BOSS: { name: 'Core of Misunderstanding', hp: 150, damage: 20, icon: '👁️' }
    };

    // Dungeon themes based on category
    this.THEMES = {
      '611': { name: 'Anatomical Labyrinth', color: '#8B4513', ambient: 'bone echoes' },
      '612': { name: 'Physiological Depths', color: '#4169E1', ambient: 'heartbeat' },
      '612.2': { name: 'Respiratory Caverns', color: '#87CEEB', ambient: 'breathing' },
      '612.8': { name: 'Neural Catacombs', color: '#9370DB', ambient: 'synaptic crackle' },
      'default': { name: 'Knowledge Abyss', color: '#2F4F4F', ambient: 'whispers' }
    };
  }

  // ============================================================
  // CYCLE 1: CORE DUNGEON GENERATION ENGINE
  // ============================================================

  /**
   * Generate a dungeon from the player's confusion matrix
   * @param {string} categoryFilter - Optional category to focus on
   * @returns {Object} Generated dungeon structure
   */
  generateDungeon(categoryFilter = null) {
    // Gather all misconceptions from confusion matrix
    const misconceptions = this.gatherMisconceptions(categoryFilter);

    if (misconceptions.length < this.config.minRoomsForDungeon) {
      return {
        success: false,
        reason: 'insufficient_misconceptions',
        message: `You need at least ${this.config.minRoomsForDungeon} misconceptions to generate a dungeon. Keep exploring!`,
        currentCount: misconceptions.length
      };
    }

    // Sort by confusion severity (selection frequency)
    misconceptions.sort((a, b) => b.selectionCount - a.selectionCount);

    // Identify the boss (highest confusion rate misconception)
    const bossMisconception = this.identifyBoss(misconceptions);
    const regularMisconceptions = misconceptions.filter(m => m.id !== bossMisconception.id);

    // Build dungeon structure
    const dungeon = this.buildDungeonStructure(regularMisconceptions, bossMisconception, categoryFilter);

    // Store dungeon state
    this.data.activeDungeon = dungeon;
    this.data.dungeonHistory.push({
      id: dungeon.id,
      generated: Date.now(),
      category: categoryFilter,
      roomCount: dungeon.totalRooms,
      bossId: bossMisconception.id
    });
    this.save();

    return {
      success: true,
      dungeon: dungeon
    };
  }

  /**
   * Gather misconceptions from the confusion matrix
   */
  gatherMisconceptions(categoryFilter) {
    const misconceptions = [];
    const confusionData = this.questionStatistics?.data?.confusionMatrix || {};

    for (const [questionId, matrix] of Object.entries(confusionData)) {
      // Filter by category if specified
      if (categoryFilter && !questionId.startsWith(categoryFilter)) {
        continue;
      }

      // Get the correct answer for this question
      const questionStats = this.questionStatistics.data.questionStats[questionId];
      if (!questionStats) continue;

      // Find wrong answers that have been selected
      for (const [optionIndex, count] of Object.entries(matrix)) {
        const idx = parseInt(optionIndex);
        if (idx !== questionStats.correctAnswer && count > 0) {
          misconceptions.push({
            id: `${questionId}_opt${idx}`,
            questionId: questionId,
            wrongOptionIndex: idx,
            selectionCount: count,
            lastSelected: questionStats.lastAttempt || Date.now(),
            category: this.extractCategory(questionId),
            severity: this.calculateSeverity(count, questionStats.attempts || 1)
          });
        }
      }
    }

    return misconceptions;
  }

  /**
   * Calculate misconception severity based on selection frequency
   */
  calculateSeverity(selectionCount, totalAttempts) {
    const rate = selectionCount / Math.max(totalAttempts, 1);

    if (rate >= 0.5) return 'CRITICAL';
    if (rate >= 0.35) return 'SEVERE';
    if (rate >= 0.2) return 'MODERATE';
    return 'MINOR';
  }

  /**
   * Identify the boss misconception
   */
  identifyBoss(misconceptions) {
    // Boss is the misconception with highest confusion rate that's above threshold
    const bossCandidate = misconceptions.find(m =>
      m.severity === 'CRITICAL' || m.severity === 'SEVERE'
    );

    return bossCandidate || misconceptions[0];
  }

  /**
   * Build the dungeon structure with floors and rooms
   */
  buildDungeonStructure(misconceptions, boss, categoryFilter) {
    const dungeonId = `dungeon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const theme = this.getTheme(categoryFilter || boss.category);

    // Distribute misconceptions across floors
    const floors = [];
    const floorsNeeded = Math.min(
      this.config.floorsPerDungeon,
      Math.ceil(misconceptions.length / this.config.maxRoomsPerFloor) + 1
    );

    let misconceptionIndex = 0;

    for (let floorNum = 0; floorNum < floorsNeeded; floorNum++) {
      const isLastFloor = floorNum === floorsNeeded - 1;
      const floor = {
        level: floorNum + 1,
        rooms: [],
        connections: [],
        cleared: false
      };

      if (isLastFloor) {
        // Last floor has only the boss
        floor.rooms.push(this.createBossRoom(boss, floorNum + 1));
      } else {
        // Regular floors have misconception rooms
        const roomsOnFloor = Math.min(
          this.config.maxRoomsPerFloor,
          misconceptions.length - misconceptionIndex
        );

        for (let roomNum = 0; roomNum < roomsOnFloor && misconceptionIndex < misconceptions.length; roomNum++) {
          const misconception = misconceptions[misconceptionIndex++];
          floor.rooms.push(this.createRoom(misconception, floorNum + 1, roomNum));
        }
      }

      // Generate connections between rooms
      floor.connections = this.generateConnections(floor.rooms, floorNum);
      floors.push(floor);
    }

    // Generate connections between floors
    const floorConnections = this.generateFloorConnections(floors);

    return {
      id: dungeonId,
      name: `${theme.name}: ${boss.questionId}`,
      theme: theme,
      floors: floors,
      floorConnections: floorConnections,
      boss: boss,
      totalRooms: misconceptions.length + 1, // +1 for boss
      clearedRooms: 0,
      currentFloor: 0,
      currentRoom: null,
      state: 'READY', // READY, IN_PROGRESS, BOSS_AVAILABLE, CLEARED
      startedAt: null,
      completedAt: null,
      rewards: {
        clarityShards: [],
        insightCrystals: [],
        xpEarned: 0
      }
    };
  }

  /**
   * Create a regular room from a misconception
   */
  createRoom(misconception, floorLevel, roomIndex) {
    const roomType = this.ROOM_TYPES[misconception.severity];
    const difficultyMultiplier = Math.pow(this.config.roomDifficultyScale, floorLevel - 1);

    return {
      id: `room_${floorLevel}_${roomIndex}`,
      misconceptionId: misconception.id,
      questionId: misconception.questionId,
      wrongOptionIndex: misconception.wrongOptionIndex,
      type: misconception.severity,
      name: `${roomType.name} of ${this.getMisconceptionLabel(misconception)}`,
      icon: roomType.icon,
      hp: Math.round(roomType.hp * difficultyMultiplier),
      maxHp: Math.round(roomType.hp * difficultyMultiplier),
      damage: Math.round(roomType.damage * difficultyMultiplier),
      cleared: false,
      attempts: 0,
      position: { x: roomIndex * 2, y: floorLevel },
      drops: this.generateRoomDrops(misconception.severity),
      prerequisites: [] // Filled by connection generation
    };
  }

  /**
   * Create the boss room
   */
  createBossRoom(boss, floorLevel) {
    const roomType = this.ROOM_TYPES.BOSS;

    return {
      id: `boss_room`,
      misconceptionId: boss.id,
      questionId: boss.questionId,
      wrongOptionIndex: boss.wrongOptionIndex,
      type: 'BOSS',
      name: `${roomType.name}: ${this.getMisconceptionLabel(boss)}`,
      icon: roomType.icon,
      hp: roomType.hp,
      maxHp: roomType.hp,
      damage: roomType.damage,
      cleared: false,
      attempts: 0,
      position: { x: 2, y: floorLevel },
      drops: this.generateBossDrops(),
      prerequisites: [], // All rooms on previous floor
      phases: this.generateBossPhases(boss),
      currentPhase: 0
    };
  }

  /**
   * Generate boss phases based on misconception complexity
   */
  generateBossPhases(boss) {
    return [
      {
        name: 'Surface Understanding',
        hpThreshold: 1.0,
        questionType: 'definition',
        ability: 'Confusion Cloud',
        abilityDamage: 10
      },
      {
        name: 'Mechanism Reveal',
        hpThreshold: 0.5,
        questionType: 'mechanism',
        ability: 'Distortion Wave',
        abilityDamage: 15
      },
      {
        name: 'True Form',
        hpThreshold: 0.25,
        questionType: 'application',
        ability: 'Reality Shatter',
        abilityDamage: 20
      }
    ];
  }

  /**
   * Generate room drops
   */
  generateRoomDrops(severity) {
    const drops = [];

    // Clarity shard chance based on severity
    const shardChance = this.config.clarityShardChance *
      (severity === 'CRITICAL' ? 1.0 : severity === 'SEVERE' ? 0.8 : 0.6);

    if (Math.random() < shardChance) {
      drops.push({
        type: 'clarity_shard',
        quality: severity,
        description: 'Reveals why this misconception was attractive'
      });
    }

    // XP based on room difficulty
    const xpMap = { MINOR: 50, MODERATE: 100, SEVERE: 150, CRITICAL: 200 };
    drops.push({
      type: 'xp',
      amount: xpMap[severity] || 50
    });

    return drops;
  }

  /**
   * Generate boss drops
   */
  generateBossDrops() {
    const drops = [
      {
        type: 'insight_crystal',
        description: 'Provides the correct mental model for this concept'
      },
      {
        type: 'xp',
        amount: 500
      }
    ];

    // Chance for additional rewards
    if (Math.random() < 0.3) {
      drops.push({
        type: 'loot',
        rarity: 'RARE',
        slot: this.getRandomSlot()
      });
    }

    return drops;
  }

  /**
   * Generate connections between rooms on a floor
   */
  generateConnections(rooms, floorLevel) {
    const connections = [];

    if (rooms.length <= 1) return connections;

    // Create a web of connections (not strictly linear)
    for (let i = 0; i < rooms.length; i++) {
      // Connect to next room
      if (i < rooms.length - 1) {
        connections.push({
          from: rooms[i].id,
          to: rooms[i + 1].id,
          type: 'forward'
        });
      }

      // 30% chance for skip connection (Ms. Luminara's twist)
      if (i < rooms.length - 2 && Math.random() < 0.3) {
        connections.push({
          from: rooms[i].id,
          to: rooms[i + 2].id,
          type: 'skip'
        });
      }
    }

    return connections;
  }

  /**
   * Generate connections between floors
   */
  generateFloorConnections(floors) {
    const connections = [];

    for (let i = 0; i < floors.length - 1; i++) {
      const currentFloor = floors[i];
      const nextFloor = floors[i + 1];

      // Last room(s) of current floor connect to first room(s) of next
      const exitRooms = currentFloor.rooms.slice(-2);
      const entryRooms = nextFloor.rooms.slice(0, 2);

      for (const exit of exitRooms) {
        for (const entry of entryRooms) {
          connections.push({
            from: exit.id,
            to: entry.id,
            fromFloor: i,
            toFloor: i + 1
          });
          entry.prerequisites.push(exit.id);
        }
      }
    }

    return connections;
  }

  /**
   * Get theme for dungeon based on category
   */
  getTheme(category) {
    // Find most specific matching theme
    const sortedKeys = Object.keys(this.THEMES)
      .filter(k => k !== 'default')
      .sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
      if (category && category.startsWith(key)) {
        return this.THEMES[key];
      }
    }

    return this.THEMES.default;
  }

  /**
   * Extract category from question ID
   */
  extractCategory(questionId) {
    const match = questionId.match(/^(\d+(?:\.\d+)?)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Get a human-readable label for a misconception
   */
  getMisconceptionLabel(misconception) {
    // Try to get the actual option text if available
    const questionId = misconception.questionId;
    const optionIndex = misconception.wrongOptionIndex;

    // This would integrate with the question bank
    // For now, return a generic label
    return `Confusion ${optionIndex + 1}`;
  }

  /**
   * Get random equipment slot
   */
  getRandomSlot() {
    const slots = ['head', 'neck', 'chest', 'hands', 'ring'];
    return slots[Math.floor(Math.random() * slots.length)];
  }

  // ============================================================
  // PERSISTENCE
  // ============================================================

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('MisconceptionDungeon: Could not load data', e);
    }

    return {
      activeDungeon: null,
      dungeonHistory: [],
      clearedDungeons: [],
      totalRoomsCleared: 0,
      totalBossesDefeated: 0,
      clarityShards: [],
      insightCrystals: []
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('MisconceptionDungeon: Could not save data', e);
    }
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Get the active dungeon
   */
  getActiveDungeon() {
    return this.data.activeDungeon;
  }

  /**
   * Check if a dungeon can be generated
   */
  canGenerateDungeon(categoryFilter = null) {
    const misconceptions = this.gatherMisconceptions(categoryFilter);
    return misconceptions.length >= this.config.minRoomsForDungeon;
  }

  /**
   * Get dungeon statistics
   */
  getDungeonStats() {
    return {
      totalDungeonsGenerated: this.data.dungeonHistory.length,
      totalDungeonsCleared: this.data.clearedDungeons.length,
      totalRoomsCleared: this.data.totalRoomsCleared,
      totalBossesDefeated: this.data.totalBossesDefeated,
      clarityShardCount: this.data.clarityShards.length,
      insightCrystalCount: this.data.insightCrystals.length,
      hasActiveDungeon: this.data.activeDungeon !== null
    };
  }

  /**
   * Visualize dungeon as ASCII art (for debugging/display)
   */
  visualizeDungeon(dungeon) {
    if (!dungeon) return 'No dungeon active';

    let output = `\n=== ${dungeon.name} ===\n`;
    output += `Theme: ${dungeon.theme.name}\n`;
    output += `Total Rooms: ${dungeon.totalRooms} | Cleared: ${dungeon.clearedRooms}\n\n`;

    for (const floor of dungeon.floors) {
      output += `--- Floor ${floor.level} ---\n`;
      for (const room of floor.rooms) {
        const status = room.cleared ? '✓' : '○';
        output += `  ${status} ${room.icon} ${room.name} (HP: ${room.hp}/${room.maxHp})\n`;
      }
      output += '\n';
    }

    return output;
  }

  // ============================================================
  // CYCLE 2: COMBAT AND REWARDS SYSTEM
  // ============================================================

  /**
   * Enter a room and begin combat
   * @param {string} roomId - The room to enter
   * @returns {Object} Combat state
   */
  enterRoom(roomId) {
    const dungeon = this.data.activeDungeon;
    if (!dungeon) {
      return { success: false, error: 'No active dungeon' };
    }

    // Find the room
    const room = this.findRoom(dungeon, roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Check prerequisites
    if (!this.arePrerequisitesMet(dungeon, room)) {
      return {
        success: false,
        error: 'prerequisites_not_met',
        message: 'You must clear connecting rooms first',
        requiredRooms: room.prerequisites
      };
    }

    // Check if already cleared
    if (room.cleared) {
      return {
        success: false,
        error: 'room_cleared',
        message: 'This misconception has already been vanquished'
      };
    }

    // Initialize combat state
    dungeon.currentRoom = roomId;
    dungeon.state = room.type === 'BOSS' ? 'BOSS_FIGHT' : 'IN_PROGRESS';

    if (!dungeon.startedAt) {
      dungeon.startedAt = Date.now();
    }

    const combatState = {
      roomId: room.id,
      roomName: room.name,
      roomIcon: room.icon,
      roomType: room.type,
      roomHp: room.hp,
      roomMaxHp: room.maxHp,
      roomDamage: room.damage,
      questionId: room.questionId,
      wrongOptionIndex: room.wrongOptionIndex,
      isBoss: room.type === 'BOSS',
      bossPhase: room.type === 'BOSS' ? room.phases[room.currentPhase] : null,
      attempts: room.attempts,
      potentialDrops: room.drops
    };

    this.save();

    return {
      success: true,
      combat: combatState,
      message: this.getEntranceMessage(room)
    };
  }

  /**
   * Process an answer during room combat
   * @param {string} roomId - Current room
   * @param {boolean} correct - Whether answer was correct
   * @param {boolean} firstTry - Whether it was first attempt at this question
   * @param {Object} questionData - The question that was answered
   * @returns {Object} Combat result
   */
  processAnswer(roomId, correct, firstTry, questionData = {}) {
    const dungeon = this.data.activeDungeon;
    if (!dungeon) {
      return { success: false, error: 'No active dungeon' };
    }

    const room = this.findRoom(dungeon, roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    room.attempts++;

    const result = {
      roomId: roomId,
      correct: correct,
      firstTry: firstTry,
      damage: 0,
      roomDamage: 0,
      roomHpRemaining: room.hp,
      roomCleared: false,
      drops: [],
      messages: [],
      dungeonProgress: null
    };

    if (correct) {
      // Calculate damage to the misconception
      result.damage = this.calculatePlayerDamage(room, firstTry, questionData);
      room.hp -= result.damage;
      result.roomHpRemaining = Math.max(0, room.hp);

      result.messages.push(this.getCombatMessage('hit', result.damage, room));

      // Check if room is cleared
      if (room.hp <= 0) {
        result.roomCleared = true;
        room.cleared = true;
        dungeon.clearedRooms++;
        this.data.totalRoomsCleared++;

        // Process drops
        result.drops = this.processDrops(room);
        result.messages.push(this.getCombatMessage('victory', 0, room));

        // Check for boss phase transition
        if (room.type === 'BOSS' && room.currentPhase < room.phases.length - 1) {
          const hpPercent = room.hp / room.maxHp;
          const nextPhase = room.phases[room.currentPhase + 1];
          if (hpPercent <= nextPhase.hpThreshold) {
            room.currentPhase++;
            result.bossPhaseTransition = {
              newPhase: nextPhase,
              message: this.getBossPhaseMessage(nextPhase)
            };
          }
        }

        // Check for dungeon completion
        result.dungeonProgress = this.checkDungeonProgress(dungeon);

        if (room.type === 'BOSS') {
          this.data.totalBossesDefeated++;
          result.messages.push(this.getDungeonClearedMessage(dungeon));
        }
      }
    } else {
      // Player takes damage from the misconception
      result.roomDamage = room.damage;
      result.messages.push(this.getCombatMessage('miss', room.damage, room));

      // Record this as reinforcing the misconception (for analytics)
      if (this.learningAnalytics) {
        this.learningAnalytics.recordMisconception(
          room.questionId,
          room.wrongOptionIndex,
          questionData
        );
      }
    }

    this.save();
    return { success: true, result: result };
  }

  /**
   * Calculate player damage to room based on answer quality
   */
  calculatePlayerDamage(room, firstTry, questionData) {
    let baseDamage = 20;

    // First try bonus
    if (firstTry) {
      baseDamage += 15;
    }

    // Answer speed bonus (if tracked)
    if (questionData.answerTime && questionData.answerTime < 10000) {
      baseDamage += Math.floor((10000 - questionData.answerTime) / 1000);
    }

    // Critical hit chance (5%)
    if (Math.random() < 0.05) {
      baseDamage *= 2;
    }

    // Room type affects damage taken
    const resistanceMap = {
      MINOR: 0.9,
      MODERATE: 0.8,
      SEVERE: 0.7,
      CRITICAL: 0.6,
      BOSS: 0.5
    };

    return Math.round(baseDamage * (resistanceMap[room.type] || 1.0));
  }

  /**
   * Process drops from a cleared room
   */
  processDrops(room) {
    const collectedDrops = [];

    for (const drop of room.drops) {
      switch (drop.type) {
        case 'clarity_shard':
          const shard = {
            id: `shard_${Date.now()}`,
            questionId: room.questionId,
            wrongOptionIndex: room.wrongOptionIndex,
            quality: drop.quality,
            description: drop.description,
            collectedAt: Date.now(),
            viewed: false
          };
          this.data.clarityShards.push(shard);
          collectedDrops.push({
            type: 'clarity_shard',
            item: shard,
            message: `Clarity Shard obtained! (${drop.quality})`
          });
          break;

        case 'insight_crystal':
          const crystal = {
            id: `crystal_${Date.now()}`,
            questionId: room.questionId,
            description: drop.description,
            collectedAt: Date.now(),
            applied: false
          };
          this.data.insightCrystals.push(crystal);
          collectedDrops.push({
            type: 'insight_crystal',
            item: crystal,
            message: 'Insight Crystal obtained! The correct mental model is now yours.'
          });
          break;

        case 'xp':
          const dungeon = this.data.activeDungeon;
          dungeon.rewards.xpEarned += drop.amount;
          collectedDrops.push({
            type: 'xp',
            amount: drop.amount,
            message: `+${drop.amount} XP`
          });
          break;

        case 'loot':
          collectedDrops.push({
            type: 'loot',
            rarity: drop.rarity,
            slot: drop.slot,
            message: `${drop.rarity} loot obtained! (${drop.slot})`
          });
          break;
      }
    }

    return collectedDrops;
  }

  /**
   * Check dungeon progress and state
   */
  checkDungeonProgress(dungeon) {
    const totalRooms = dungeon.totalRooms;
    const clearedRooms = dungeon.clearedRooms;
    const progressPercent = Math.round((clearedRooms / totalRooms) * 100);

    // Check if all regular rooms are cleared (boss available)
    const allFloorsCleared = dungeon.floors.slice(0, -1).every(floor =>
      floor.rooms.every(room => room.cleared)
    );

    if (allFloorsCleared && dungeon.state !== 'BOSS_FIGHT') {
      dungeon.state = 'BOSS_AVAILABLE';
    }

    // Check if dungeon is fully cleared
    const bossRoom = this.findRoom(dungeon, 'boss_room');
    if (bossRoom && bossRoom.cleared) {
      dungeon.state = 'CLEARED';
      dungeon.completedAt = Date.now();

      // Add to cleared dungeons
      this.data.clearedDungeons.push({
        id: dungeon.id,
        name: dungeon.name,
        completedAt: dungeon.completedAt,
        totalXp: dungeon.rewards.xpEarned,
        timeSpent: dungeon.completedAt - dungeon.startedAt
      });
    }

    return {
      progress: progressPercent,
      cleared: clearedRooms,
      total: totalRooms,
      state: dungeon.state,
      bossAvailable: dungeon.state === 'BOSS_AVAILABLE',
      dungeonCleared: dungeon.state === 'CLEARED'
    };
  }

  /**
   * Find a room by ID in the dungeon
   */
  findRoom(dungeon, roomId) {
    for (const floor of dungeon.floors) {
      const room = floor.rooms.find(r => r.id === roomId);
      if (room) return room;
    }
    return null;
  }

  /**
   * Check if room prerequisites are met
   */
  arePrerequisitesMet(dungeon, room) {
    if (!room.prerequisites || room.prerequisites.length === 0) {
      return true;
    }

    return room.prerequisites.every(prereqId => {
      const prereqRoom = this.findRoom(dungeon, prereqId);
      return prereqRoom && prereqRoom.cleared;
    });
  }

  /**
   * Get available rooms (not cleared, prerequisites met)
   */
  getAvailableRooms() {
    const dungeon = this.data.activeDungeon;
    if (!dungeon) return [];

    const available = [];
    for (const floor of dungeon.floors) {
      for (const room of floor.rooms) {
        if (!room.cleared && this.arePrerequisitesMet(dungeon, room)) {
          available.push({
            id: room.id,
            name: room.name,
            icon: room.icon,
            type: room.type,
            hp: room.hp,
            maxHp: room.maxHp,
            floor: floor.level
          });
        }
      }
    }

    return available;
  }

  /**
   * Use a clarity shard to reveal misconception explanation
   */
  useClarityShard(shardId) {
    const shard = this.data.clarityShards.find(s => s.id === shardId);
    if (!shard) {
      return { success: false, error: 'Shard not found' };
    }

    shard.viewed = true;
    this.save();

    // Generate explanation for why this wrong answer was attractive
    const explanation = this.generateMisconceptionExplanation(shard);

    return {
      success: true,
      explanation: explanation,
      shard: shard
    };
  }

  /**
   * Apply an insight crystal to lock in correct understanding
   */
  useInsightCrystal(crystalId) {
    const crystal = this.data.insightCrystals.find(c => c.id === crystalId);
    if (!crystal) {
      return { success: false, error: 'Crystal not found' };
    }

    crystal.applied = true;
    this.save();

    // Mark this concept as having achieved insight
    if (this.learningAnalytics) {
      this.learningAnalytics.recordMastery(crystal.questionId);
    }

    return {
      success: true,
      message: 'The correct mental model has been integrated.',
      crystal: crystal
    };
  }

  /**
   * Generate explanation for misconception
   */
  generateMisconceptionExplanation(shard) {
    // This would ideally pull from question bank
    return {
      questionId: shard.questionId,
      wrongOption: shard.wrongOptionIndex,
      whyAttractive: `This answer is commonly chosen because it seems to follow a familiar pattern. The misconception reflects a ${shard.quality.toLowerCase()} gap in the underlying mental model.`,
      whatToNotice: 'Pay attention to the specific mechanism involved, not just the surface similarity.',
      correctionPath: 'The scaffold questions for this topic will help build the correct understanding.'
    };
  }

  // ============================================================
  // MS. LUMINARA VOICE
  // ============================================================

  getEntranceMessage(room) {
    const messages = {
      MINOR: [
        "A shadow flickers. Small confusion, easily dispelled.",
        "You sense uncertainty here. Let's illuminate it."
      ],
      MODERATE: [
        "The air grows thick with misconception. Stay focused.",
        "This confusion has some weight to it. Proceed carefully."
      ],
      SEVERE: [
        "Reality warps here. Your understanding is being tested.",
        "A significant distortion. This misconception runs deep."
      ],
      CRITICAL: [
        "The void speaks lies that feel like truth. Be vigilant.",
        "This is where knowledge goes to die. Fight well."
      ],
      BOSS: [
        "Here it is. The core of your confusion. Face it.",
        "The source of so many wrong turns. End this."
      ]
    };

    const typeMessages = messages[room.type] || messages.MINOR;
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  getCombatMessage(type, value, room) {
    const messages = {
      hit: [
        `Direct hit! The misconception weakens. (-${value} HP)`,
        `Your understanding strikes true! (-${value} HP)`,
        `The confusion recoils from your clarity. (-${value} HP)`
      ],
      miss: [
        `The misconception feeds on your error. (+${value} damage to you)`,
        `Wrong path. The confusion grows stronger. (+${value} damage)`,
        `That's exactly what it wanted you to think. (+${value} damage)`
      ],
      victory: [
        `${room.icon} The ${room.type.toLowerCase()} misconception dissolves!`,
        `${room.icon} Clarity floods in where confusion once dwelt.`,
        `${room.icon} One less shadow in your understanding.`
      ]
    };

    const typeMessages = messages[type] || ['...'];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  getBossPhaseMessage(phase) {
    return {
      name: phase.name,
      message: `The misconception transforms! Phase: ${phase.name}`,
      warning: `It now uses: ${phase.ability} (${phase.abilityDamage} damage)`
    };
  }

  getDungeonClearedMessage(dungeon) {
    const duration = dungeon.completedAt - dungeon.startedAt;
    const minutes = Math.floor(duration / 60000);

    return {
      title: 'DUNGEON CLEARED',
      message: `The ${dungeon.name} has been purified!`,
      stats: {
        roomsCleared: dungeon.totalRooms,
        timeSpent: `${minutes} minutes`,
        xpEarned: dungeon.rewards.xpEarned,
        clarityShards: dungeon.rewards.clarityShards.length,
        insightCrystals: dungeon.rewards.insightCrystals.length
      },
      celebration: 'Your confusion matrix has been reduced. The dungeon collapses.'
    };
  }

  /**
   * Abandon the current dungeon
   */
  abandonDungeon() {
    if (!this.data.activeDungeon) {
      return { success: false, error: 'No active dungeon' };
    }

    const dungeon = this.data.activeDungeon;
    this.data.activeDungeon = null;
    this.save();

    return {
      success: true,
      message: 'You retreat from the dungeon. The misconceptions remain... for now.',
      progress: dungeon.clearedRooms,
      total: dungeon.totalRooms
    };
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MisconceptionDungeonEngine };
}
