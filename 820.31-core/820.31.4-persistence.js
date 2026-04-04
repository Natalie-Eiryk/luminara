/**
 * Ms. Luminara Quiz - Persistence Layer
 * Manages localStorage for player progress, achievements, and question history
 */

class PersistenceManager {
  constructor() {
    this.STORAGE_KEY = 'ms_luminara_quiz_data';
    this.data = this.load();
  }

  getDefaultData() {
    return {
      player: {
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        bestStreak: 0,
        totalAnswered: 0,
        totalCorrectFirstTry: 0,
        achievements: [],
        lastSession: null,
        sessionsCompleted: 0,
        // HP System
        hp: 100,
        maxHP: 100,
        knockouts: 0
      },
      categories: {},
      questionHistory: {},
      session: {
        startTime: null,
        xpEarned: 0,
        questionsAnswered: 0,
        correctFirstTry: 0,
        achievementsUnlocked: [],
        streakAtStart: 0
      },
      // GAMIFICATION PASS 1: Daily Challenges
      dailyChallenges: {
        date: null,
        challenges: [],
        completed: [],
        bonusClaimed: false
      },
      // GAMIFICATION PASS 3: Milestones
      milestones: [],
      // GAMIFICATION PASS 4: Study Calendar
      studyCalendar: {
        days: [],
        currentDayStreak: 0,
        longestDayStreak: 0,
        totalStudyDays: 0
      },
      // GAMIFICATION PASS 6: Sound preferences
      soundPreferences: {
        enabled: true,
        volume: 0.7,
        hapticEnabled: true
      },
      // SPACED REPETITION: Wrong Answer Priority Queue
      wrongAnswerQueue: {
        questions: [],  // Array of questionIds ordered by priority
        stats: {}       // { [questionId]: { wrongCount, lastWrong, correctAfterWrong } }
      },
      // CATEGORY PROGRESSION: All main categories unlocked
      // Subsections (banks) within categories unlock progressively
      // Uber boss awaits at the final category
      categoryProgression: {
        // Dewey-ordered categories (all unlocked - progression is within banks)
        // Anatomy/Physiology chain
        chain: ["000", "400", "100", "200", "500", "600", "700", "800", "900"],
        //      611   611.018 612.82 612.81 612.89 612.8  612.4  612.8L 612.2
        // Mathematics chain (separate subject)
        mathChain: ["510"],
        // All categories are unlocked - banks within them have progression
        categories: {
          "000": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "400": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "100": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "200": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "500": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "600": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "700": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "800": { status: "unlocked", bossDefeated: false, bossAttempts: 0 },
          "900": { status: "unlocked", bossDefeated: false, bossAttempts: 0, hasUberBoss: true },
          // Mathematics
          "510": { status: "unlocked", bossDefeated: false, bossAttempts: 0 }
        }
      },
      // ROGUELIKE: Inventory (equipped survives death, unequipped lost)
      inventory: {
        equipped: {},      // { slot: item } - survives boss death
        unequipped: [],    // [item, item, ...] - lost on boss death
        gold: 100          // Starting gold
      }
    };
  }

  load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle schema updates
        return this.mergeWithDefaults(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved data, starting fresh:', e);
    }
    return this.getDefaultData();
  }

  mergeWithDefaults(saved) {
    const defaults = this.getDefaultData();
    return {
      player: { ...defaults.player, ...saved.player },
      categories: { ...defaults.categories, ...saved.categories },
      questionHistory: { ...defaults.questionHistory, ...saved.questionHistory },
      session: { ...defaults.session },
      // GAMIFICATION PASS 1: Daily Challenges
      dailyChallenges: saved.dailyChallenges || defaults.dailyChallenges,
      // GAMIFICATION PASS 3: Milestones
      milestones: saved.milestones || defaults.milestones,
      // GAMIFICATION PASS 4: Study Calendar
      studyCalendar: saved.studyCalendar ?
        { ...defaults.studyCalendar, ...saved.studyCalendar } :
        defaults.studyCalendar,
      // GAMIFICATION PASS 6: Sound preferences
      soundPreferences: saved.soundPreferences ?
        { ...defaults.soundPreferences, ...saved.soundPreferences } :
        defaults.soundPreferences,
      // SPACED REPETITION: Wrong Answer Priority Queue
      wrongAnswerQueue: saved.wrongAnswerQueue ?
        { ...defaults.wrongAnswerQueue, ...saved.wrongAnswerQueue } :
        defaults.wrongAnswerQueue,
      // ROGUELIKE PROGRESSION: Category Unlock Chain
      categoryProgression: saved.categoryProgression ?
        this.mergeCategoryProgression(defaults.categoryProgression, saved.categoryProgression) :
        defaults.categoryProgression,
      // ROGUELIKE: Inventory
      inventory: saved.inventory ?
        { ...defaults.inventory, ...saved.inventory } :
        defaults.inventory
    };
  }

  /**
   * Merge category progression, preserving unlocks while adding new categories
   */
  mergeCategoryProgression(defaults, saved) {
    const merged = {
      chain: defaults.chain,
      categories: { ...defaults.categories }
    };

    // Preserve saved status for existing categories
    for (const [catId, catData] of Object.entries(saved.categories || {})) {
      if (merged.categories[catId]) {
        merged.categories[catId] = { ...merged.categories[catId], ...catData };
      }
    }

    return merged;
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  // Session Management
  startSession() {
    this.data.session = {
      startTime: new Date().toISOString(),
      xpEarned: 0,
      questionsAnswered: 0,
      correctFirstTry: 0,
      achievementsUnlocked: [],
      streakAtStart: this.data.player.currentStreak
    };
    this.save();
  }

  endSession() {
    this.data.player.lastSession = new Date().toISOString();
    this.data.player.sessionsCompleted++;
    this.save();
    return this.getSessionSummary();
  }

  getSessionSummary() {
    const session = this.data.session;
    const player = this.data.player;
    return {
      duration: session.startTime ?
        Math.round((Date.now() - new Date(session.startTime).getTime()) / 60000) : 0,
      xpEarned: session.xpEarned,
      questionsAnswered: session.questionsAnswered,
      correctFirstTry: session.correctFirstTry,
      accuracy: session.questionsAnswered > 0 ?
        Math.round((session.correctFirstTry / session.questionsAnswered) * 100) : 0,
      achievementsUnlocked: session.achievementsUnlocked,
      streakChange: player.currentStreak - session.streakAtStart,
      bestStreak: player.bestStreak,
      totalXP: player.totalXP,
      level: player.level
    };
  }

  // Player Stats
  addXP(amount) {
    this.data.player.totalXP += amount;
    this.data.session.xpEarned += amount;
    this.updateLevel();
    this.save();
    return this.data.player.totalXP;
  }

  updateLevel() {
    // Exponential level curve: 500, 1200, 2500, 4500, 7500, etc.
    const xp = this.data.player.totalXP;
    let level = 1;
    let threshold = 500;
    let increment = 700;

    while (xp >= threshold) {
      level++;
      threshold += increment;
      increment += 500;
    }

    const oldLevel = this.data.player.level;
    this.data.player.level = level;
    return level > oldLevel ? level : null; // Returns new level if leveled up
  }

  getLevelProgress() {
    const xp = this.data.player.totalXP;
    let currentThreshold = 0;
    let nextThreshold = 500;
    let increment = 700;

    while (xp >= nextThreshold) {
      currentThreshold = nextThreshold;
      nextThreshold += increment;
      increment += 500;
    }

    return {
      current: xp - currentThreshold,
      needed: nextThreshold - currentThreshold,
      percentage: Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
    };
  }

  // Streak Management
  incrementStreak() {
    this.data.player.currentStreak++;
    if (this.data.player.currentStreak > this.data.player.bestStreak) {
      this.data.player.bestStreak = this.data.player.currentStreak;
    }
    this.save();
    return this.data.player.currentStreak;
  }

  breakStreak() {
    const broken = this.data.player.currentStreak;
    this.data.player.currentStreak = 0;
    this.save();
    return broken;
  }

  getStreak() {
    return this.data.player.currentStreak;
  }

  // Question History
  recordQuestion(questionId, wasCorrectFirstTry) {
    const history = this.data.questionHistory[questionId] || {
      attempts: 0,
      correctFirstTry: false,
      timesCorrect: 0,
      lastSeen: null
    };

    history.attempts++;
    history.lastSeen = new Date().toISOString();

    if (wasCorrectFirstTry && history.attempts === 1) {
      history.correctFirstTry = true;
    }
    if (wasCorrectFirstTry) {
      history.timesCorrect++;
    }

    this.data.questionHistory[questionId] = history;
    this.data.player.totalAnswered++;
    this.data.session.questionsAnswered++;

    // SHOCKWAVE ARCADE JUICE: Milestone callouts
    if (typeof ScreenEffects !== 'undefined') {
      ScreenEffects.checkMilestone(this.data.player.totalAnswered);
    }

    if (wasCorrectFirstTry) {
      this.data.player.totalCorrectFirstTry++;
      this.data.session.correctFirstTry++;
    }

    this.save();
    return history;
  }

  getQuestionHistory(questionId) {
    return this.data.questionHistory[questionId] || null;
  }

  wasQuestionPreviouslyWrong(questionId) {
    const history = this.data.questionHistory[questionId];
    return history && !history.correctFirstTry && history.attempts > 0;
  }

  // ============================================
  // SPACED REPETITION: Wrong Answer Priority Queue
  // ============================================

  /**
   * Add a question to the wrong answer priority queue
   * Called when user answers incorrectly
   */
  addToWrongQueue(questionId) {
    const queue = this.data.wrongAnswerQueue;

    // Update stats for this question
    if (!queue.stats[questionId]) {
      queue.stats[questionId] = {
        wrongCount: 0,
        lastWrong: null,
        correctAfterWrong: 0
      };
    }

    queue.stats[questionId].wrongCount++;
    queue.stats[questionId].lastWrong = new Date().toISOString();

    // Add to queue if not already present
    if (!queue.questions.includes(questionId)) {
      queue.questions.push(questionId);
    }

    // Re-sort queue by priority (most wrong, most recent first)
    this.sortWrongQueue();
    this.save();
  }

  /**
   * Mark a question as answered correctly after being wrong
   * Reduces its priority but keeps it in queue until mastered
   */
  markCorrectAfterWrong(questionId) {
    const queue = this.data.wrongAnswerQueue;

    if (queue.stats[questionId]) {
      queue.stats[questionId].correctAfterWrong++;

      // Remove from queue if answered correctly twice after being wrong
      if (queue.stats[questionId].correctAfterWrong >= 2) {
        queue.questions = queue.questions.filter(id => id !== questionId);
        delete queue.stats[questionId];
      } else {
        // Re-sort to lower priority
        this.sortWrongQueue();
      }

      this.save();
    }
  }

  /**
   * Sort wrong queue by priority score (higher = show sooner)
   */
  sortWrongQueue() {
    const queue = this.data.wrongAnswerQueue;

    queue.questions.sort((a, b) => {
      const scoreA = this.getWrongQueuePriority(a);
      const scoreB = this.getWrongQueuePriority(b);
      return scoreB - scoreA; // Higher priority first
    });
  }

  /**
   * Calculate priority score for a question
   * Higher score = should be shown sooner
   */
  getWrongQueuePriority(questionId) {
    const stats = this.data.wrongAnswerQueue.stats[questionId];
    if (!stats) return 0;

    // Base score from wrong count (more wrong = higher priority)
    let score = stats.wrongCount * 10;

    // Reduce score for correct answers after wrong
    score -= stats.correctAfterWrong * 5;

    // Boost recent wrongs (within last hour)
    if (stats.lastWrong) {
      const hoursSince = (Date.now() - new Date(stats.lastWrong).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 1) score += 5;
      else if (hoursSince < 24) score += 2;
    }

    return Math.max(0, score);
  }

  /**
   * Get prioritized questions for a category prefix
   * @param {string} categoryPrefix - e.g., "100" for brain questions
   * @returns {string[]} Array of questionIds sorted by priority
   */
  getWrongQueueForCategory(categoryPrefix) {
    const queue = this.data.wrongAnswerQueue;
    return queue.questions.filter(id => id.startsWith(categoryPrefix));
  }

  /**
   * Get all questions in wrong queue
   */
  getWrongQueue() {
    return this.data.wrongAnswerQueue.questions;
  }

  /**
   * Get stats for a question in wrong queue
   */
  getWrongQueueStats(questionId) {
    return this.data.wrongAnswerQueue.stats[questionId] || null;
  }

  /**
   * Check if question is in wrong queue
   */
  isInWrongQueue(questionId) {
    return this.data.wrongAnswerQueue.questions.includes(questionId);
  }

  // Category Progress
  updateCategoryProgress(categoryKey, totalQuestions) {
    const history = this.data.questionHistory;
    let answered = 0;
    let correct = 0;

    // Count questions in this category
    // Convert category key (e.g., "100-1") to question prefix (e.g., "100.1")
    const questionPrefix = categoryKey.replace(/-/g, '.');
    for (const [qId, qData] of Object.entries(history)) {
      if (qId.startsWith(questionPrefix)) {
        answered++;
        if (qData.correctFirstTry) correct++;
      }
    }

    this.data.categories[categoryKey] = {
      answered,
      correct,
      total: totalQuestions,
      mastery: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0
    };

    this.save();
    return this.data.categories[categoryKey];
  }

  getCategoryProgress(categoryKey) {
    return this.data.categories[categoryKey] || { answered: 0, correct: 0, total: 0, mastery: 0 };
  }

  getAllCategoryProgress() {
    return this.data.categories;
  }

  // ============================================
  // ROGUELIKE PROGRESSION: Category Unlock System
  // ============================================

  /**
   * Get the status of a category (locked, unlocked, boss-ready, completed)
   */
  getCategoryStatus(categoryId) {
    const progression = this.data.categoryProgression;
    const catData = progression.categories[categoryId];
    if (!catData) return 'locked';

    // Check for mastery override (90%+ auto-unlocks)
    if (catData.status === 'locked') {
      const mastery = this.getCategoryMastery(categoryId);
      if (mastery >= 90) {
        this.setCategoryStatus(categoryId, 'unlocked');
        return 'unlocked';
      }
    }

    return catData.status;
  }

  /**
   * Set category status
   */
  setCategoryStatus(categoryId, status) {
    if (this.data.categoryProgression.categories[categoryId]) {
      this.data.categoryProgression.categories[categoryId].status = status;
      this.save();
    }
  }

  /**
   * Get mastery percentage for a category (based on question history)
   */
  getCategoryMastery(categoryId) {
    const progress = this.getCategoryProgress(categoryId);
    return progress.mastery || 0;
  }

  /**
   * Check if boss fight is available (70% mastery required)
   */
  isBossReady(categoryId) {
    const status = this.getCategoryStatus(categoryId);
    if (status !== 'unlocked') return false;

    const mastery = this.getCategoryMastery(categoryId);
    return mastery >= 70;
  }

  /**
   * Mark boss as defeated and unlock next category
   */
  defeatBoss(categoryId) {
    const progression = this.data.categoryProgression;
    const catData = progression.categories[categoryId];

    if (catData) {
      catData.bossDefeated = true;
      catData.status = 'completed';

      // Find and unlock next category in chain
      const chainIndex = progression.chain.indexOf(categoryId);
      if (chainIndex >= 0 && chainIndex < progression.chain.length - 1) {
        const nextCategoryId = progression.chain[chainIndex + 1];
        if (progression.categories[nextCategoryId]) {
          progression.categories[nextCategoryId].status = 'unlocked';
        }
      }

      this.save();
      return true;
    }
    return false;
  }

  /**
   * Record a boss attempt
   */
  recordBossAttempt(categoryId) {
    const catData = this.data.categoryProgression.categories[categoryId];
    if (catData) {
      catData.bossAttempts++;
      this.save();
    }
  }

  /**
   * Get boss info for a category
   */
  getBossInfo(categoryId) {
    return this.data.categoryProgression.categories[categoryId] || null;
  }

  /**
   * Get the chain of categories in order
   */
  getCategoryChain() {
    return this.data.categoryProgression.chain;
  }

  /**
   * Get the previous category in chain (for lock message)
   */
  getPreviousCategory(categoryId) {
    const chain = this.data.categoryProgression.chain;
    const index = chain.indexOf(categoryId);
    if (index > 0) {
      return chain[index - 1];
    }
    return null;
  }

  // ============================================
  // BANK (Sub-Category) Lock Management
  // ============================================

  /**
   * Get bank status (locked/unlocked)
   * Banks unlock: first bank always unlocked, others need 70% on previous OR manual skip
   */
  getBankStatus(bankKey) {
    // Initialize bank tracking if not exists
    if (!this.data.bankProgression) {
      this.data.bankProgression = {};
    }

    // Check if explicitly unlocked
    if (this.data.bankProgression[bankKey] === 'unlocked') {
      return 'unlocked';
    }

    // Check mastery-based auto-unlock (70%+ on this bank = unlocked)
    const progress = this.getCategoryProgress(bankKey);
    if (progress.mastery >= 70) {
      this.setBankStatus(bankKey, 'unlocked');
      return 'unlocked';
    }

    // Default: locked unless it's the first bank (handled in UI)
    return this.data.bankProgression[bankKey] || 'locked';
  }

  /**
   * Set bank status
   */
  setBankStatus(bankKey, status) {
    if (!this.data.bankProgression) {
      this.data.bankProgression = {};
    }
    this.data.bankProgression[bankKey] = status;
    this.save();
  }

  /**
   * Unlock a bank directly (skip)
   */
  unlockBank(bankKey) {
    this.setBankStatus(bankKey, 'unlocked');
  }

  // ============================================
  // ROGUELIKE: Inventory Management
  // ============================================

  /**
   * Get inventory
   */
  getInventory() {
    return this.data.inventory;
  }

  /**
   * Add item to unequipped inventory
   */
  addToInventory(item) {
    this.data.inventory.unequipped.push(item);
    this.save();
  }

  /**
   * Equip an item (move from unequipped to equipped slot)
   */
  equipItem(item, slot) {
    // If something already equipped in slot, unequip it first
    if (this.data.inventory.equipped[slot]) {
      this.data.inventory.unequipped.push(this.data.inventory.equipped[slot]);
    }

    // Remove from unequipped
    const idx = this.data.inventory.unequipped.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      this.data.inventory.unequipped.splice(idx, 1);
    }

    // Equip
    this.data.inventory.equipped[slot] = item;
    this.save();
  }

  /**
   * Unequip an item (move from equipped to unequipped)
   */
  unequipItem(slot) {
    if (this.data.inventory.equipped[slot]) {
      this.data.inventory.unequipped.push(this.data.inventory.equipped[slot]);
      delete this.data.inventory.equipped[slot];
      this.save();
    }
  }

  /**
   * Roguelike reset - lose all unequipped items and half gold on boss death
   * @returns {Array} List of items lost
   */
  roguelikeReset() {
    const lost = [...this.data.inventory.unequipped];
    const goldLost = Math.floor(this.data.inventory.gold * 0.5);

    this.data.inventory.unequipped = [];
    this.data.inventory.gold -= goldLost;

    this.save();

    return {
      items: lost,
      goldLost: goldLost
    };
  }

  /**
   * Add gold
   */
  addGold(amount) {
    this.data.inventory.gold += amount;
    this.save();
    return this.data.inventory.gold;
  }

  /**
   * Spend gold
   */
  spendGold(amount) {
    if (this.data.inventory.gold >= amount) {
      this.data.inventory.gold -= amount;
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Get gear score (sum of equipped item levels)
   */
  getGearScore() {
    let score = 0;
    for (const item of Object.values(this.data.inventory.equipped)) {
      score += item.level || 1;
    }
    return score;
  }

  // Achievement Management
  unlockAchievement(achievementId) {
    if (!this.data.player.achievements.includes(achievementId)) {
      this.data.player.achievements.push(achievementId);
      this.data.session.achievementsUnlocked.push(achievementId);
      this.save();
      return true;
    }
    return false;
  }

  hasAchievement(achievementId) {
    return this.data.player.achievements.includes(achievementId);
  }

  getAchievements() {
    return this.data.player.achievements;
  }

  // Utility
  getPlayer() {
    return this.data.player;
  }

  getSession() {
    return this.data.session;
  }

  getCurrentHour() {
    return new Date().getHours();
  }

  resetProgress() {
    this.data = this.getDefaultData();
    this.save();
  }

  /**
   * Export progress data for backup
   */
  exportData() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: this.data
    };
  }

  /**
   * Import progress data from backup
   */
  importData(importedData) {
    if (!importedData || !importedData.data) {
      throw new Error('Invalid backup file format');
    }
    this.data = this.mergeWithDefaults(importedData.data);
    this.save();
    return true;
  }
}

// Export singleton
const persistence = new PersistenceManager();

// Global progress control functions
function exportProgress() {
  const exportData = persistence.exportData();
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `luminara-progress-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show feedback
  alert('Progress exported! Check your downloads folder.');
}

function importProgress(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      persistence.importData(importedData);

      alert('Progress imported successfully! Refreshing...');
      location.reload();
    } catch (err) {
      alert('Failed to import: ' + err.message);
    }
  };
  reader.readAsText(file);

  // Reset the input so the same file can be selected again
  input.value = '';
}

function confirmResetProgress() {
  const confirmed = confirm(
    'Are you sure you want to reset ALL progress?\n\n' +
    'This will delete:\n' +
    '• Your XP and level\n' +
    '• All achievements\n' +
    '• Question history\n' +
    '• Category mastery\n\n' +
    'This cannot be undone!'
  );

  if (confirmed) {
    const doubleConfirm = confirm('Really? This is permanent. Last chance to cancel.');
    if (doubleConfirm) {
      persistence.resetProgress();
      alert('Progress reset. Refreshing...');
      location.reload();
    }
  }
}
