/**
 * Ms. Luminara Quiz - High Scores System
 * Arcade-style leaderboard for "The Luminara Gauntlet"
 */

// ============================================================================
// RANK TITLES (GM-style descriptions)
// ============================================================================

const RANK_TITLES = [
  { minScore: 0,      title: 'Fresh Meat',           icon: '🥩', color: '#9ca3af' },
  { minScore: 1000,   title: 'Slightly Less Fresh Meat', icon: '🎯', color: '#22c55e' },
  { minScore: 2500,   title: 'Persistent Victim',    icon: '🔍', color: '#3b82f6' },
  { minScore: 5000,   title: 'Acceptable Student',   icon: '🧠', color: '#8b5cf6' },
  { minScore: 7500,   title: 'Minor Nuisance',       icon: '⚕️', color: '#ec4899' },
  { minScore: 10000,  title: 'Worthy Opponent',      icon: '🎓', color: '#f59e0b' },
  { minScore: 15000,  title: 'Certified Nemesis',    icon: '📚', color: '#ef4444' },
  { minScore: 20000,  title: 'Grand Irritant',       icon: '🏛️', color: '#14b8a6' },
  { minScore: 30000,  title: 'Arch-Scholar',         icon: '👨‍🏫', color: '#f97316' },
  { minScore: 50000,  title: 'Quiz Overlord',        icon: '👑', color: '#eab308' },
  { minScore: 75000,  title: "Luminara's Rival",     icon: '🌟', color: '#06b6d4' },
  { minScore: 100000, title: 'UNKILLABLE LEGEND',    icon: '⭐', color: '#a855f7' }
];

// ============================================================================
// GM COMMENTARY (replaces fun facts - snarky end-of-run remarks)
// ============================================================================

const FUN_FACTS_POOL = [
  "The human body has 206 bones, and you still managed to confuse the fibula with the tibia. Impressive.",
  "Your brain uses 20% of your body's energy. Based on your performance, yours might be running at... 10%?",
  "Fun fact: The average heart beats 100,000 times per day. Mine skips a beat every time you get one right. From SHOCK.",
  "Neurons transmit at 268 mph. Yours seem to have traffic delays.",
  "The stapes is the smallest bone. I bet you forgot where it was already.",
  "You have more bacteria in your gut than brain cells. Some days, it shows.",
  "The liver can regenerate from 25% of its tissue. Unlike your dignity after that performance.",
  "Your body makes 25 million new cells per second. Maybe a few brain cells next time? Fingers crossed.",
  "The human nose detects 1 trillion scents. Too bad 'correct answer' isn't one of them.",
  "The cornea has no blood supply. Neither does my patience. Yet here we are.",
  "Your eyes distinguish 10 million colors, but you can't distinguish A from C on a multiple choice. Fascinating.",
  "Lung surface area equals a tennis court. Room enough for all the sighs I heaved during your run.",
  "Bone is stronger than granite. Your resolve? Somewhat less so.",
  "Stomach acid dissolves zinc. My questions dissolve confidence. We have that in common.",
  "37.2 trillion cells, and not ONE of them helped you with that cranial nerve question.",
  "The brain holds 2.5 petabytes of data. Yours appears to be running a free trial.",
  "You produce a liter of saliva daily. Probably drooling over answers you should've studied.",
  "Skin is your largest organ. Knowledge? Clearly your smallest.",
  "The gluteus maximus is your biggest muscle. You'll need it to sit here and study MORE.",
  "Blood circuits your body in 60 seconds. That last question circled your brain for considerably longer.",
  "The tongue is only attached at one end. Much like your grasp on the ANS chapter.",
  "The femur is stronger than concrete. So is my determination to trip you up next time.",
  "You blink 15-20 times per minute. You blinked through half those questions too.",
  "*Checks notes* You did... adequately. Don't let it go to your head.",
  "Every failure is a learning opportunity! (I wrote that on a motivational poster. Ironically.)"
];

// ============================================================================
// ACHIEVEMENTS FOR RUNS
// ============================================================================

const RUN_ACHIEVEMENTS = {
  // Score-based
  FIRST_VICTORY:     { id: 'first_victory', name: 'First Steps', desc: 'Complete your first run', icon: '🎯' },
  SCORE_5K:          { id: 'score_5k', name: 'Getting Serious', desc: 'Score 5,000+ points in a run', icon: '🔥' },
  SCORE_10K:         { id: 'score_10k', name: 'On Fire', desc: 'Score 10,000+ points in a run', icon: '💥' },
  SCORE_25K:         { id: 'score_25k', name: 'Unstoppable', desc: 'Score 25,000+ points in a run', icon: '⚡' },
  SCORE_50K:         { id: 'score_50k', name: 'Legendary Run', desc: 'Score 50,000+ points in a run', icon: '🌟' },

  // Streak-based
  STREAK_5:          { id: 'streak_5', name: 'Warming Up', desc: 'Get a 5-answer streak', icon: '🔗' },
  STREAK_10:         { id: 'streak_10', name: 'On a Roll', desc: 'Get a 10-answer streak', icon: '🎢' },
  STREAK_20:         { id: 'streak_20', name: 'Untouchable', desc: 'Get a 20-answer streak', icon: '👊' },

  // Boss-based
  BOSS_SLAYER:       { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeat your first boss', icon: '⚔️' },
  BOSS_HUNTER:       { id: 'boss_hunter', name: 'Boss Hunter', desc: 'Defeat 3 bosses in one run', icon: '🎯' },
  BOSS_MASTER:       { id: 'boss_master', name: 'Boss Master', desc: 'Defeat all regular bosses', icon: '🏆' },
  SECRET_FOUND:      { id: 'secret_found', name: 'Hidden Challenge', desc: 'Discover the secret boss', icon: '🔮' },
  SECRET_SLAIN:      { id: 'secret_slain', name: 'True Champion', desc: 'Defeat the secret boss', icon: '👑' },

  // Performance-based
  PERFECT_WAVE:      { id: 'perfect_wave', name: 'Perfect Wave', desc: 'Complete a wave with all first-try answers', icon: '🌊' },
  FLAWLESS_RUN:      { id: 'flawless_run', name: 'Flawless Victory', desc: 'Complete a run with no wrong answers', icon: '💎' },
  SPEEDRUNNER:       { id: 'speedrunner', name: 'Speedrunner', desc: 'Complete a run in under 5 minutes', icon: '⏱️' },
  SURVIVOR:          { id: 'survivor', name: 'Survivor', desc: 'Win a run with less than 10 HP', icon: '💀' },
  COMEBACK:          { id: 'comeback', name: 'The Comeback', desc: 'Win after dropping below 25 HP', icon: '🔄' },

  // Cumulative
  RUNS_10:           { id: 'runs_10', name: 'Dedicated', desc: 'Complete 10 runs', icon: '📅' },
  RUNS_50:           { id: 'runs_50', name: 'Committed', desc: 'Complete 50 runs', icon: '📆' },
  RUNS_100:          { id: 'runs_100', name: 'Obsessed', desc: 'Complete 100 runs', icon: '🗓️' },
  TOTAL_SCORE_100K:  { id: 'total_100k', name: 'Point Collector', desc: 'Earn 100,000 total points', icon: '💰' },
  TOTAL_SCORE_1M:    { id: 'total_1m', name: 'Point Hoarder', desc: 'Earn 1,000,000 total points', icon: '🏦' }
};

// ============================================================================
// HIGH SCORES MANAGER CLASS
// ============================================================================

class HighScoreManager {
  constructor() {
    this.STORAGE_KEY = 'ms_luminara_highscores';
    this.data = this.loadData();
    this.migrateIfNeeded();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load high score data:', e);
    }
    return this.getDefaultData();
  }

  getDefaultData() {
    return {
      // Legacy scores array (migrated to mode-specific on first load)
      scores: [],
      // Mode-specific leaderboards: gauntlet (no power-ups) vs arcade (with power-ups)
      gauntlet: {
        easy: [],
        normal: [],
        hard: [],
        nightmare: []
      },
      arcade: {
        easy: [],
        normal: [],
        hard: [],
        nightmare: []
      },
      personalBests: {
        highestScore: 0,
        longestStreak: 0,
        fastestRun: null,      // seconds
        mostBosses: 0,
        perfectWaves: 0
      },
      achievements: [],        // Unlocked achievement IDs
      totalStats: {
        totalScore: 0,
        totalRuns: 0,
        totalVictories: 0,
        totalBossesDefeated: 0,
        totalQuestionsAnswered: 0,
        totalFirstTryCorrect: 0,
        totalTimePlayed: 0     // seconds
      },
      funFactsShown: []        // Track which facts have been shown
    };
  }

  /**
   * Migrate legacy scores to new mode-specific structure
   */
  migrateIfNeeded() {
    // If we have legacy scores but no mode-specific scores, migrate them to arcade
    if (this.data.scores && this.data.scores.length > 0 && !this.data.arcade) {
      this.data.arcade = {
        easy: [],
        normal: [],
        hard: [],
        nightmare: []
      };
      this.data.gauntlet = {
        easy: [],
        normal: [],
        hard: [],
        nightmare: []
      };

      // Migrate legacy scores to arcade mode by difficulty
      for (const entry of this.data.scores) {
        const diff = entry.difficulty || 'normal';
        if (this.data.arcade[diff]) {
          this.data.arcade[diff].push(entry);
        }
      }

      // Sort and trim each difficulty
      for (const diff of ['easy', 'normal', 'hard', 'nightmare']) {
        this.data.arcade[diff].sort((a, b) => b.score - a.score);
        this.data.arcade[diff] = this.data.arcade[diff].slice(0, 10);
      }

      console.log('[HighScores] Migrated legacy scores to arcade mode');
      this.save();
    }

    // Ensure mode structures exist
    if (!this.data.gauntlet) {
      this.data.gauntlet = { easy: [], normal: [], hard: [], nightmare: [] };
    }
    if (!this.data.arcade) {
      this.data.arcade = { easy: [], normal: [], hard: [], nightmare: [] };
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save high score data:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORE SUBMISSION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Submit a completed run for high score consideration
   * @param {Object} runData - Run data including mode ('gauntlet' | 'arcade')
   */
  submitRun(runData) {
    const {
      score,
      difficulty,
      wave,
      questionsAnswered,
      correctFirstTry,
      bestStreak,
      bossesDefeated,
      duration,      // seconds
      playerHP,
      victory,
      wrongAnswers,
      mode = 'arcade'  // Default to arcade for backwards compatibility
    } = runData;

    // Update total stats
    this.data.totalStats.totalScore += score;
    this.data.totalStats.totalRuns++;
    if (victory) this.data.totalStats.totalVictories++;
    this.data.totalStats.totalBossesDefeated += bossesDefeated;
    this.data.totalStats.totalQuestionsAnswered += questionsAnswered;
    this.data.totalStats.totalFirstTryCorrect += correctFirstTry;
    this.data.totalStats.totalTimePlayed += duration;

    // Update personal bests
    if (score > this.data.personalBests.highestScore) {
      this.data.personalBests.highestScore = score;
    }
    if (bestStreak > this.data.personalBests.longestStreak) {
      this.data.personalBests.longestStreak = bestStreak;
    }
    if (victory && (!this.data.personalBests.fastestRun || duration < this.data.personalBests.fastestRun)) {
      this.data.personalBests.fastestRun = duration;
    }
    if (bossesDefeated > this.data.personalBests.mostBosses) {
      this.data.personalBests.mostBosses = bossesDefeated;
    }

    // Check for high score placement in mode-specific board
    const modeBoard = this.data[mode] || this.data.arcade;
    const diffBoard = modeBoard[difficulty] || modeBoard.normal;
    const rank = this.getRankForScoreInBoard(score, diffBoard);
    const isHighScore = rank !== null;

    if (isHighScore) {
      const entry = {
        score,
        difficulty,
        mode,
        waves: wave,
        questionsAnswered,
        accuracy: questionsAnswered > 0 ? Math.round((correctFirstTry / questionsAnswered) * 100) : 0,
        bestStreak,
        bossesDefeated,
        duration,
        victory,
        date: new Date().toISOString(),
        title: this.getTitleForScore(score)
      };

      diffBoard.splice(rank, 0, entry);
      // Keep only top 10 for this mode/difficulty
      modeBoard[difficulty] = diffBoard.slice(0, 10);
    }

    // Also maintain legacy scores array for backwards compat
    const legacyRank = this.getRankForScore(score);
    if (legacyRank !== null) {
      const entry = {
        score,
        difficulty,
        mode,
        waves: wave,
        questionsAnswered,
        accuracy: questionsAnswered > 0 ? Math.round((correctFirstTry / questionsAnswered) * 100) : 0,
        bestStreak,
        bossesDefeated,
        duration,
        victory,
        date: new Date().toISOString(),
        title: this.getTitleForScore(score)
      };
      this.data.scores.splice(legacyRank, 0, entry);
      this.data.scores = this.data.scores.slice(0, 10);
    }

    // Check achievements
    const newAchievements = this.checkAchievements(runData);

    // Get a fun fact
    const funFact = this.getRandomFunFact();

    this.save();

    return {
      isHighScore,
      rank: isHighScore ? rank + 1 : null,
      mode,
      difficulty,
      newAchievements,
      funFact,
      title: this.getTitleForScore(score),
      previousBest: this.data.personalBests.highestScore === score ?
        (this.getBestScoreForMode(mode, difficulty) || 0) : this.data.personalBests.highestScore
    };
  }

  /**
   * Get rank position for a score in a specific board (0-indexed)
   */
  getRankForScoreInBoard(score, board) {
    for (let i = 0; i < board.length; i++) {
      if (score > board[i].score) {
        return i;
      }
    }

    // Check if there's room in top 10
    if (board.length < 10) {
      return board.length;
    }

    return null;
  }

  /**
   * Get best score for a mode/difficulty
   */
  getBestScoreForMode(mode, difficulty) {
    const modeBoard = this.data[mode];
    if (!modeBoard) return 0;
    const diffBoard = modeBoard[difficulty];
    if (!diffBoard || diffBoard.length === 0) return 0;
    return diffBoard[0].score;
  }

  /**
   * Get rank position for a score (0-indexed)
   */
  getRankForScore(score) {
    for (let i = 0; i < this.data.scores.length; i++) {
      if (score > this.data.scores[i].score) {
        return i;
      }
    }

    // Check if there's room in top 10
    if (this.data.scores.length < 10) {
      return this.data.scores.length;
    }

    return null;
  }

  /**
   * Get title for a score
   */
  getTitleForScore(score) {
    let title = RANK_TITLES[0];

    for (const rank of RANK_TITLES) {
      if (score >= rank.minScore) {
        title = rank;
      }
    }

    return title;
  }

  // ═══════════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check for new achievements after a run
   */
  checkAchievements(runData) {
    const newAchievements = [];
    const unlocked = this.data.achievements;

    const check = (id, condition) => {
      if (!unlocked.includes(id) && condition) {
        unlocked.push(id);
        newAchievements.push(RUN_ACHIEVEMENTS[id]);
      }
    };

    // Score-based
    check('FIRST_VICTORY', runData.victory);
    check('SCORE_5K', runData.score >= 5000);
    check('SCORE_10K', runData.score >= 10000);
    check('SCORE_25K', runData.score >= 25000);
    check('SCORE_50K', runData.score >= 50000);

    // Streak-based
    check('STREAK_5', runData.bestStreak >= 5);
    check('STREAK_10', runData.bestStreak >= 10);
    check('STREAK_20', runData.bestStreak >= 20);

    // Boss-based
    check('BOSS_SLAYER', runData.bossesDefeated >= 1);
    check('BOSS_HUNTER', runData.bossesDefeated >= 3);
    check('BOSS_MASTER', runData.allBossesDefeated);
    check('SECRET_FOUND', runData.secretBossEncountered);
    check('SECRET_SLAIN', runData.secretBossDefeated);

    // Performance-based
    check('PERFECT_WAVE', runData.hadPerfectWave);
    check('FLAWLESS_RUN', runData.victory && runData.wrongAnswers === 0);
    check('SPEEDRUNNER', runData.victory && runData.duration < 300);
    check('SURVIVOR', runData.victory && runData.playerHP < 10);
    check('COMEBACK', runData.victory && runData.wentBelowCriticalHP);

    // Cumulative
    const stats = this.data.totalStats;
    check('RUNS_10', stats.totalVictories >= 10);
    check('RUNS_50', stats.totalVictories >= 50);
    check('RUNS_100', stats.totalVictories >= 100);
    check('TOTAL_SCORE_100K', stats.totalScore >= 100000);
    check('TOTAL_SCORE_1M', stats.totalScore >= 1000000);

    return newAchievements;
  }

  /**
   * Get all achievements with unlock status
   */
  getAllAchievements() {
    return Object.values(RUN_ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.data.achievements.includes(achievement.id)
    }));
  }

  /**
   * Get unlocked achievement count
   */
  getAchievementProgress() {
    return {
      unlocked: this.data.achievements.length,
      total: Object.keys(RUN_ACHIEVEMENTS).length
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // FUN FACTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get a random fun fact (avoid repeats)
   */
  getRandomFunFact() {
    // Reset if we've shown all facts
    if (this.data.funFactsShown.length >= FUN_FACTS_POOL.length) {
      this.data.funFactsShown = [];
    }

    // Find a fact we haven't shown
    const available = FUN_FACTS_POOL.filter((_, i) => !this.data.funFactsShown.includes(i));
    const index = Math.floor(Math.random() * available.length);
    const factIndex = FUN_FACTS_POOL.indexOf(available[index]);

    this.data.funFactsShown.push(factIndex);
    this.save();

    return available[index];
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get top 10 scores (legacy - all modes combined)
   */
  getHighScores() {
    return this.data.scores.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * Get scores for a specific mode and difficulty
   * @param {string} mode - 'gauntlet' or 'arcade'
   * @param {string} difficulty - 'easy', 'normal', 'hard', 'nightmare'
   */
  getScoresForMode(mode, difficulty) {
    const modeBoard = this.data[mode];
    if (!modeBoard) return [];
    const diffBoard = modeBoard[difficulty] || [];
    return diffBoard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * Get all scores for a mode (all difficulties combined, sorted)
   */
  getAllScoresForMode(mode) {
    const modeBoard = this.data[mode];
    if (!modeBoard) return [];

    const allScores = [];
    for (const diff of ['easy', 'normal', 'hard', 'nightmare']) {
      if (modeBoard[diff]) {
        allScores.push(...modeBoard[diff]);
      }
    }

    // Sort by score descending and add ranks
    allScores.sort((a, b) => b.score - a.score);
    return allScores.slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }

  /**
   * Get personal bests
   */
  getPersonalBests() {
    return this.data.personalBests;
  }

  /**
   * Get total stats
   */
  getTotalStats() {
    return this.data.totalStats;
  }

  /**
   * Get all rank titles
   */
  getRankTitles() {
    return RANK_TITLES;
  }

  /**
   * Get current player rank title based on highest score
   */
  getCurrentTitle() {
    return this.getTitleForScore(this.data.personalBests.highestScore);
  }

  /**
   * Get next rank title and points needed
   */
  getNextRank() {
    const current = this.data.personalBests.highestScore;
    const currentTitle = this.getTitleForScore(current);

    for (const rank of RANK_TITLES) {
      if (rank.minScore > current) {
        return {
          title: rank,
          pointsNeeded: rank.minScore - current
        };
      }
    }

    return null; // Already at max rank
  }

  /**
   * Format duration as MM:SS
   */
  formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format score with commas
   */
  formatScore(score) {
    return score.toLocaleString();
  }

  /**
   * Get score breakdown for display
   */
  getScoreBreakdown(runData) {
    const {
      questionsAnswered,
      correctFirstTry,
      bestStreak,
      bossesDefeated,
      duration,
      playerHP,
      difficulty
    } = runData;

    const baseScore = questionsAnswered * 100 + correctFirstTry * 200;
    const streakBonus = bestStreak * 150;
    const bossBonus = bossesDefeated * 1000;
    const timeBonus = Math.max(0, Math.floor((600 - duration) * 2));
    const hpBonus = playerHP * 5;

    const diffMult = {
      easy: 0.5,
      normal: 1.0,
      hard: 1.5,
      nightmare: 2.5
    }[difficulty] || 1;

    const subtotal = baseScore + streakBonus + bossBonus + timeBonus + hpBonus;
    const total = Math.floor(subtotal * diffMult);

    return {
      baseScore,
      streakBonus,
      bossBonus,
      timeBonus,
      hpBonus,
      difficultyMultiplier: diffMult,
      subtotal,
      total
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // GLOBAL LEADERBOARD (GitHub-backed)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Fetch global leaderboard from GitHub Pages
   * Returns full structure: { gauntlet: { easy: [], ... }, arcade: { easy: [], ... } }
   */
  async fetchGlobalScores() {
    try {
      const response = await fetch('https://luminara.natalie-eiryk.com/scores.json?' + Date.now());
      if (response.ok) {
        const data = await response.json();
        this.globalData = data;
        this.globalLastUpdated = data.lastUpdated;

        // Handle both v1 (flat leaderboard) and v2 (mode/difficulty) formats
        if (data.version === 2) {
          console.log('[HighScores] Fetched global leaderboard v2 (mode/difficulty)');
        } else {
          // Legacy format - put in arcade.normal
          this.globalData = {
            version: 2,
            gauntlet: { easy: [], normal: [], hard: [], nightmare: [] },
            arcade: { easy: [], normal: data.leaderboard || [], hard: [], nightmare: [] }
          };
          console.log('[HighScores] Fetched global leaderboard v1 (legacy)');
        }

        return this.globalData;
      }
    } catch (e) {
      console.warn('[HighScores] Could not fetch global scores:', e.message);
    }
    return { gauntlet: { easy: [], normal: [], hard: [], nightmare: [] }, arcade: { easy: [], normal: [], hard: [], nightmare: [] } };
  }

  /**
   * Get global scores for a specific mode and difficulty
   */
  getGlobalScoresForMode(mode, difficulty) {
    if (!this.globalData) return [];
    const modeBoard = this.globalData[mode];
    if (!modeBoard) return [];
    return modeBoard[difficulty] || [];
  }

  /**
   * Get cached global scores (legacy - returns arcade.normal for backwards compat)
   */
  getGlobalScores() {
    return this.getGlobalScoresForMode('arcade', 'normal');
  }

  /**
   * Check if a score qualifies for global leaderboard
   */
  async checkGlobalQualification(score, mode = 'arcade', difficulty = 'normal') {
    await this.fetchGlobalScores();
    const board = this.getGlobalScoresForMode(mode, difficulty);
    if (board.length < 10) return true;
    const lowestGlobal = board[board.length - 1]?.score || 0;
    return score > lowestGlobal;
  }

  /**
   * Submit score to global leaderboard via GitHub Issue
   * Format: "SCORE: AAA 15000 gauntlet normal"
   */
  async submitToGlobal(initials, score, extraData = {}) {
    // Validate initials (3 chars, alphanumeric)
    const cleanInitials = (initials || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'X');
    const mode = extraData.mode || 'arcade';
    const difficulty = extraData.difficulty || 'normal';

    // New format includes mode and difficulty in title
    const issueTitle = `SCORE: ${cleanInitials} ${score} ${mode} ${difficulty}`;
    const issueBody = JSON.stringify({
      waves: extraData.waves || 0,
      accuracy: extraData.accuracy || 0,
      timestamp: new Date().toISOString()
    });

    // GitHub API endpoint for creating issues (no auth needed for public repos)
    const apiUrl = 'https://api.github.com/repos/Natalie-Eiryk/luminara/issues';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['score-submission']
        })
      });

      if (response.status === 201) {
        const result = await response.json();
        console.log('[HighScores] Score submitted to global leaderboard!');
        return { success: true, message: 'Score submitted!', issueNumber: result.number };
      } else if (response.status === 403) {
        // Rate limited or auth required
        console.warn('[HighScores] GitHub API rate limited or requires auth');
        return { success: false, error: 'Global submission unavailable. Score saved locally.' };
      } else {
        const error = await response.json();
        console.warn('[HighScores] GitHub API error:', error);
        return { success: false, error: 'Could not submit to global leaderboard.' };
      }
    } catch (e) {
      console.warn('[HighScores] Network error submitting score:', e.message);
      return { success: false, error: 'Network error. Score saved locally.' };
    }
  }

  /**
   * Prompt for initials (arcade style)
   */
  promptForInitials() {
    return new Promise((resolve) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'initials-modal-overlay';
      overlay.innerHTML = `
        <div class="initials-modal">
          <h2>🏆 NEW HIGH SCORE!</h2>
          <p class="initials-subtitle">Enter your initials for the global leaderboard:</p>
          <div class="initials-input-container">
            <input type="text" id="initialsInput" maxlength="3" placeholder="AAA" autocomplete="off" />
          </div>
          <p class="initials-hint">3 characters (A-Z, 0-9)</p>
          <div class="initials-buttons">
            <button class="initials-btn submit" id="submitInitials">SUBMIT</button>
            <button class="initials-btn skip" id="skipInitials">Skip</button>
          </div>
          <p class="initials-privacy">*Ms. Luminara says: "Your initials will be visible to ALL challengers. Choose wisely... or don't. I'll mock you either way."*</p>
        </div>
      `;

      document.body.appendChild(overlay);

      const input = document.getElementById('initialsInput');
      const submitBtn = document.getElementById('submitInitials');
      const skipBtn = document.getElementById('skipInitials');

      // Auto-uppercase and filter
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      });

      // Submit on Enter
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.length > 0) {
          submitBtn.click();
        }
      });

      submitBtn.addEventListener('click', () => {
        const initials = input.value || 'AAA';
        overlay.remove();
        resolve(initials.padEnd(3, 'X').slice(0, 3));
      });

      skipBtn.addEventListener('click', () => {
        overlay.remove();
        resolve(null); // User skipped
      });

      // Focus the input
      setTimeout(() => input.focus(), 100);
    });
  }
}

// Export singleton
let highScoreManager = null;
