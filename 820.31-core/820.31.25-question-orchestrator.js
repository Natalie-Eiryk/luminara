/**
 * 820.31.25-question-orchestrator.js
 * SINGLE SOURCE OF TRUTH for all question operations
 *
 * Consolidates:
 * - Question loading (from registry, banks, vocabulary)
 * - Caching (unified LRU cache)
 * - Difficulty estimation (statistics-first, then heuristics)
 * - ZPD zone detection (unified algorithm)
 * - Scaffold selection (adaptive, ZPD-aware)
 * - Error handling (retry, fallback, reporting)
 *
 * All game modes (Map, Gauntlet, TestPrep, Blitz, SRS) use this
 * orchestrator instead of implementing their own loading logic.
 *
 * Research Foundation:
 * - Vygotsky's Zone of Proximal Development
 * - Ericsson's Deliberate Practice
 * - Bjork's Desirable Difficulties
 * - 5E Inquiry Model (Engage, Explore, Explain, Elaborate, Evaluate)
 * - LUMI-OS Operator Algebra (TAIDRGEF)
 *
 * @version 2026-03-30
 */

class QuestionOrchestrator {
  constructor() {
    // ═══════════════════════════════════════════════════════════════
    // CACHING INFRASTRUCTURE
    // ═══════════════════════════════════════════════════════════════

    // Unified question cache (all banks go here)
    // Format: { data: questions[], timestamp: number, categoryId: string }
    // Fix #2: Cache entries now include categoryId and timestamp for TTL
    this.questionCache = new Map();

    // Bank metadata cache (registry info)
    this.bankMetadataCache = new Map();

    // Cache configuration
    this.CACHE_CONFIG = {
      maxBanks: 50,           // Max banks to keep in memory
      maxQuestionsPerBank: 500,
      ttlMs: 30 * 60 * 1000,  // 30 min TTL
      fetchTimeoutMs: 10000,  // 10 second fetch timeout (Fix #3)
      persistToStorage: true   // LocalStorage backup
    };

    // LRU tracking
    this.cacheAccessOrder = [];

    // ═══════════════════════════════════════════════════════════════
    // SYSTEM REFERENCES (set during init)
    // ═══════════════════════════════════════════════════════════════

    this.registry = null;           // Question registry JSON
    this.isotopeEngine = null;      // For operator coordinates
    this.zpdSystem = null;          // For ZPD analysis
    this.scaffolding = null;        // For scaffold levels
    this.statistics = null;         // For empirical difficulty
    this.persistence = null;        // For wrong queue

    // ═══════════════════════════════════════════════════════════════
    // STATE TRACKING
    // ═══════════════════════════════════════════════════════════════

    this.loadingPromises = new Map();  // Prevent duplicate fetches
    this.errorLog = [];                // Recent errors for debugging
    this.initialized = false;
    this.abortController = null;       // For fetch cancellation (Fix #12)

    // ═══════════════════════════════════════════════════════════════
    // DIFFICULTY ESTIMATION CONFIG
    // ═══════════════════════════════════════════════════════════════

    this.DIFFICULTY_WEIGHTS = {
      statisticsWeight: 0.6,    // Empirical data (when available)
      isotopeWeight: 0.2,       // Operator coordinate complexity
      heuristicWeight: 0.2      // Text-based heuristics
    };

    // ═══════════════════════════════════════════════════════════════
    // ZPD ZONE THRESHOLDS
    // ═══════════════════════════════════════════════════════════════

    this.ZPD_THRESHOLDS = {
      mastered: 0.85,      // >85% correct = mastered
      comfortable: 0.70,   // 70-85% = comfortable
      proximal: 0.40,      // 40-70% = ZPD (ideal learning zone)
      // <40% = beyond current ability
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize the orchestrator with all required system references
   * Call this once during app startup
   */
  async init() {
    const log = typeof QuizLogger !== 'undefined' ? QuizLogger : console;
    log.info?.('Orchestrator', 'Initializing...') || console.log('[QuestionOrchestrator] Initializing...');

    // Setup AbortController for fetch cancellation (Fix #12)
    this.abortController = new AbortController();

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.abortController) {
          this.abortController.abort();
        }
      });
    }

    // Get references to existing global systems
    this.isotopeEngine = typeof IsotopeEngine !== 'undefined' ? IsotopeEngine : null;
    this.zpdSystem = typeof ZPDSystem !== 'undefined' ? ZPDSystem : null;
    this.scaffolding = typeof scaffolding !== 'undefined' ? scaffolding : null;
    this.statistics = typeof questionStatistics !== 'undefined' ? questionStatistics : null;
    this.persistence = typeof persistence !== 'undefined' ? persistence : null;

    // Load registry with timeout (Fix #3, #8)
    try {
      const response = await this.fetchWithTimeout(
        './820.31-core/820.31-question-registry.json',
        this.CACHE_CONFIG.fetchTimeoutMs
      );
      if (response.ok) {
        this.registry = await response.json();
        log.info?.('Orchestrator', `Registry loaded: ${this.registry.categories?.length || 0} categories`) ||
          console.log(`[QuestionOrchestrator] Registry loaded: ${this.registry.categories?.length || 0} categories`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (e) {
      log.error?.('Orchestrator', 'Failed to load registry:', e) ||
        console.error('[QuestionOrchestrator] Failed to load registry:', e);
      this.logError('init', 'registry_load_failed', e);
      // Fix #8: Don't set initialized if registry failed - this is critical
      this.registryLoadFailed = true;
    }

    // Restore cache from localStorage if enabled
    if (this.CACHE_CONFIG.persistToStorage) {
      this.restoreCacheFromStorage();
    }

    this.initialized = true;

    log.info?.('Orchestrator', 'Initialized with systems:', {
      registry: !!this.registry,
      registryFailed: this.registryLoadFailed,
      isotopeEngine: !!this.isotopeEngine,
      zpdSystem: !!this.zpdSystem,
      scaffolding: !!this.scaffolding,
      statistics: !!this.statistics,
      persistence: !!this.persistence
    }) || console.log('[QuestionOrchestrator] Initialized');

    return this;
  }

  /**
   * Fetch with timeout (Fix #3)
   * @param {string} url - URL to fetch
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        throw new Error(`Fetch timeout after ${timeoutMs}ms: ${url}`);
      }
      throw e;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // QUESTION LOADING - THE SINGLE ENTRY POINT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Load questions for any game mode
   * THIS IS THE ONLY METHOD GAME MODES SHOULD CALL
   *
   * @param {object} options - Loading configuration
   * @param {string} options.categoryId - Category ID from registry (e.g., 'respiratory-vocab')
   * @param {string} options.bankPath - Direct path to bank (fallback if no registry)
   * @param {number} options.count - Number of questions to return (0 = all)
   * @param {string} options.mode - Game mode for filtering ('map', 'gauntlet', 'testprep', 'vocabulary')
   * @param {string} options.difficulty - Target difficulty ('easy', 'medium', 'hard', 'adaptive')
   * @param {boolean} options.includeReview - Include questions from wrong queue
   * @param {boolean} options.shuffle - Shuffle results (default: true)
   * @param {string} options.zpdZone - Filter to specific ZPD zone ('mastered', 'comfortable', 'proximal', 'beyond')
   *
   * @returns {Promise<array>} Array of question objects
   */
  async loadQuestions(options = {}) {
    const {
      categoryId = null,
      bankPath = null,
      count = 0,
      mode = 'default',
      difficulty = 'adaptive',
      includeReview = false,
      shuffle = true,
      zpdZone = null
    } = options;

    console.log('[QuestionOrchestrator] loadQuestions called:', { categoryId, bankPath, count, mode, difficulty });
    console.log('[QuestionOrchestrator] Registry state:', {
      hasRegistry: !!this.registry,
      categoryCount: this.registry?.categories?.length || 0,
      categoryIds: this.registry?.categories?.map(c => c.id) || []
    });

    let questions = [];

    try {
      // Step 1: Determine which banks to load
      const banksToLoad = this.resolveBanks(categoryId, bankPath);

      console.log('[QuestionOrchestrator] Resolved banks:', banksToLoad);

      if (banksToLoad.length === 0) {
        console.warn('[QuestionOrchestrator] No banks resolved for:', { categoryId, bankPath });
        return [];
      }

      // Step 2: Load questions from all banks (parallel with dedup)
      const bankPromises = banksToLoad.map(bank => this.loadBank(bank));
      const bankResults = await Promise.all(bankPromises);

      // Flatten and deduplicate by question ID
      const seen = new Set();
      for (const bankQuestions of bankResults) {
        for (const q of bankQuestions) {
          if (!seen.has(q.id)) {
            seen.add(q.id);
            questions.push(q);
          }
        }
      }

      console.log(`[QuestionOrchestrator] Loaded ${questions.length} questions from ${banksToLoad.length} banks`);

      // Step 3: Enrich questions with computed properties
      questions = this.enrichQuestions(questions);

      // Step 4: Include review queue if requested
      if (includeReview && this.persistence) {
        const reviewQuestions = await this.getReviewQuestions(categoryId);
        // Prepend review questions (they take priority)
        const reviewIds = new Set(reviewQuestions.map(q => q.id));
        questions = [
          ...reviewQuestions,
          ...questions.filter(q => !reviewIds.has(q.id))
        ];
      }

      // Step 5: Filter by ZPD zone if specified
      if (zpdZone) {
        questions = this.filterByZPDZone(questions, zpdZone);
      }

      // Step 6: Filter/sort by difficulty
      questions = this.applyDifficultyFilter(questions, difficulty);

      // Step 7: Shuffle if requested
      if (shuffle) {
        questions = this.shuffleArray(questions);
      }

      // Step 8: Limit count if specified
      if (count > 0 && questions.length > count) {
        questions = questions.slice(0, count);
      }

      console.log(`[QuestionOrchestrator] Returning ${questions.length} questions for mode: ${mode}`);
      return questions;

    } catch (error) {
      console.error('[QuestionOrchestrator] loadQuestions failed:', error);
      this.logError('loadQuestions', 'load_failed', error);
      return [];
    }
  }

  /**
   * Load a single bank of questions
   * Uses caching with LRU eviction
   * Fix #2: Cache key includes category to prevent race condition
   * Fix #10: Cache TTL is enforced on access
   */
  async loadBank(bankInfo, categoryId = null) {
    const { path, id } = bankInfo;
    // Fix #2: Include category in cache key to prevent cross-category pollution
    const cacheKey = categoryId ? `${categoryId}:${id || path}` : (id || path);

    // Check cache first with TTL enforcement (Fix #10)
    if (this.questionCache.has(cacheKey)) {
      const cached = this.questionCache.get(cacheKey);
      // Fix #10: Check if entry has expired
      if (cached.timestamp && (Date.now() - cached.timestamp > this.CACHE_CONFIG.ttlMs)) {
        console.log(`[QuestionOrchestrator] Cache expired for: ${cacheKey}`);
        this.questionCache.delete(cacheKey);
      } else {
        this.touchCache(cacheKey);
        // Return data from cache entry structure
        return cached.data || cached;
      }
    }

    // Prevent duplicate parallel fetches
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Create loading promise
    const loadPromise = this.fetchBank(path).then(questions => {
      // Fix #10: Cache entry includes timestamp for TTL enforcement
      // Fix #11: Validate questions before caching
      const validatedQuestions = this.validateAndFilterQuestions(questions);
      this.questionCache.set(cacheKey, {
        data: validatedQuestions,
        timestamp: Date.now(),
        categoryId: categoryId
      });
      this.touchCache(cacheKey);
      this.evictIfNeeded();

      // Save to localStorage if enabled
      if (this.CACHE_CONFIG.persistToStorage) {
        this.saveCacheToStorage();
      }

      // Clear loading promise
      this.loadingPromises.delete(cacheKey);

      return validatedQuestions;
    }).catch(error => {
      this.loadingPromises.delete(cacheKey);
      throw error;
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Actually fetch a bank from the server
   * Includes retry logic and multiple path resolution for local vs deployed
   */
  async fetchBank(path, retries = 2) {
    // Try multiple path patterns to support both local dev and deployed site
    // Deployed: 611-anatomy/... (content at root)
    // Local: ../820.50-Dewey_Content/611-anatomy/... (content in sibling folder)
    const pathsToTry = [
      path,                                          // Deployed path (content at root)
      `../820.50-Dewey_Content/${path}`,             // Local dev (sibling folder)
      `./${path}`,                                   // Explicit relative
    ];

    for (const tryPath of pathsToTry) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          console.log(`[QuestionOrchestrator] Trying fetch: ${tryPath} (attempt ${attempt + 1})`);
          const response = await fetch(tryPath);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          // Handle both formats: { questions: [...] } and direct [...]
          const questions = Array.isArray(data) ? data : (data.questions || []);

          console.log(`[QuestionOrchestrator] Fetched ${questions.length} questions from ${tryPath}`);
          return questions;

        } catch (error) {
          if (attempt < retries) {
            // Only retry network errors, not 404s
            if (!error.message.includes('404')) {
              console.warn(`[QuestionOrchestrator] Fetch failed, retrying (${attempt + 1}/${retries}):`, tryPath);
              await this.sleep(500 * (attempt + 1));
            } else {
              break; // Don't retry 404s, try next path pattern
            }
          }
        }
      }
    }

    // Fix #13: Return error object instead of empty array for better error handling
    console.error(`[QuestionOrchestrator] All paths failed for:`, path);
    this.logError('fetchBank', 'fetch_failed', { path, pathsTried: pathsToTry });
    return { error: true, path, message: 'All fetch attempts failed', questions: [] };
  }

  /**
   * Validate and filter questions based on schema (Fix #11)
   * Ensures all required fields are present
   * @param {array} questions - Raw questions from fetch
   * @returns {array} Valid questions only
   */
  validateAndFilterQuestions(questions) {
    if (!Array.isArray(questions)) {
      // Handle error objects from fetchBank
      if (questions?.error) {
        console.warn('[QuestionOrchestrator] Received error object:', questions.message);
        return [];
      }
      return [];
    }

    const REQUIRED_FIELDS = ['id', 'q', 'options', 'answer'];
    const validated = [];
    let invalidCount = 0;

    for (const q of questions) {
      // Check required fields
      const missing = REQUIRED_FIELDS.filter(f => q[f] === undefined || q[f] === null);

      if (missing.length > 0) {
        invalidCount++;
        console.warn(`[QuestionOrchestrator] Invalid question (missing: ${missing.join(', ')}):`, q.id || 'unknown');
        continue;
      }

      // Validate answer index is within options bounds
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
        invalidCount++;
        console.warn(`[QuestionOrchestrator] Invalid answer index for question:`, q.id);
        continue;
      }

      validated.push(q);
    }

    if (invalidCount > 0) {
      console.log(`[QuestionOrchestrator] Schema validation: ${validated.length} valid, ${invalidCount} invalid`);
    }

    return validated;
  }

  /**
   * Resolve category/bank to list of bank paths
   */
  resolveBanks(categoryId, bankPath) {
    const banks = [];

    console.log('[QuestionOrchestrator] resolveBanks called with:', { categoryId, bankPath });

    // Direct bank path takes priority
    if (bankPath) {
      banks.push({ path: bankPath, id: bankPath });
      console.log('[QuestionOrchestrator] Added direct bank path:', bankPath);
    }

    // Look up category in registry
    if (categoryId && this.registry?.categories) {
      const category = this.registry.categories.find(c => c.id === categoryId);

      console.log('[QuestionOrchestrator] Category lookup result:', category ? {
        id: category.id,
        name: category.name,
        folder: category.folder,
        bankCount: category.banks?.length
      } : 'NOT FOUND');

      if (category?.banks && category.folder) {
        for (const bank of category.banks) {
          // Registry format: bank has { id, file, title, questionCount }
          // Need to construct full path: category.folder + bank.file
          const file = typeof bank === 'string' ? bank : bank.file;
          const id = typeof bank === 'string' ? bank : bank.id;
          const path = `${category.folder}/${file}`;
          banks.push({ path, id });
          console.log('[QuestionOrchestrator] Added bank:', { path, id });
        }
      }
    } else {
      console.log('[QuestionOrchestrator] Skipping category lookup:', {
        categoryId: !!categoryId,
        hasRegistry: !!this.registry,
        hasCategories: !!this.registry?.categories
      });
    }

    return banks;
  }

  // ═══════════════════════════════════════════════════════════════
  // QUESTION ENRICHMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Enrich questions with computed properties
   * - Unified difficulty score
   * - ZPD zone
   * - Operator coordinates
   * - Isotopes (if not present)
   */
  enrichQuestions(questions) {
    return questions.map(q => {
      // Skip if already enriched
      if (q._enriched) return q;

      const enriched = { ...q };

      // Compute unified difficulty
      enriched.difficulty = this.computeDifficulty(q);

      // Compute ZPD zone
      enriched.zpdZone = this.computeZPDZone(q);

      // Compute operator coordinates (if isotope engine available)
      if (this.isotopeEngine && !q.operatorCoord) {
        enriched.operatorCoord = this.isotopeEngine.computeOperatorCoordinate(q);
      }

      // Infer isotopes if not present
      if (!q.isotopes && this.isotopeEngine) {
        enriched.isotopes = this.isotopeEngine.inferIsotopes(q);
      }

      enriched._enriched = true;
      return enriched;
    });
  }

  /**
   * Compute unified difficulty score (0-1 scale)
   * Combines statistics, operator complexity, and heuristics
   */
  computeDifficulty(question) {
    let totalWeight = 0;
    let weightedSum = 0;

    // 1. Statistics-based difficulty (most reliable)
    if (this.statistics) {
      const statsDifficulty = this.statistics.getDifficulty(question.id);
      if (statsDifficulty !== null && statsDifficulty !== undefined) {
        weightedSum += statsDifficulty * this.DIFFICULTY_WEIGHTS.statisticsWeight;
        totalWeight += this.DIFFICULTY_WEIGHTS.statisticsWeight;
      }
    }

    // 2. Operator coordinate complexity
    if (question.operatorCoord || this.isotopeEngine) {
      const coord = question.operatorCoord ||
                    (this.isotopeEngine ? this.isotopeEngine.computeOperatorCoordinate(question) : null);
      if (coord) {
        // High-value operators indicate complexity
        const highOps = Object.values(coord).filter(v => v >= 0.7).length;
        const avgActivation = Object.values(coord).reduce((a, b) => a + b, 0) / 8;
        const isotopeDifficulty = Math.min(1, (highOps * 0.15) + (avgActivation * 0.3));

        weightedSum += isotopeDifficulty * this.DIFFICULTY_WEIGHTS.isotopeWeight;
        totalWeight += this.DIFFICULTY_WEIGHTS.isotopeWeight;
      }
    }

    // 3. Heuristic-based difficulty (fallback)
    const heuristicDifficulty = this.computeHeuristicDifficulty(question);
    weightedSum += heuristicDifficulty * this.DIFFICULTY_WEIGHTS.heuristicWeight;
    totalWeight += this.DIFFICULTY_WEIGHTS.heuristicWeight;

    // Normalize
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Heuristic difficulty based on question structure
   */
  computeHeuristicDifficulty(question) {
    let score = 0.3;  // Base difficulty

    // More isotopes = more complex
    score += (question.isotopes?.length || 0) * 0.08;

    // Has prerequisites = harder
    if (question.prereqs?.length > 0 || question._inferredPrereqs?.length > 0) {
      score += 0.15;
    }

    // Has mechanism = deeper understanding needed
    if (question.mechanism?.content) score += 0.1;
    if (question.mechanism?.metaphor) score += 0.05;

    // Question text length (longer = often more complex)
    const textLength = (question.q || '').length;
    if (textLength > 200) score += 0.1;
    else if (textLength > 100) score += 0.05;

    // Option complexity
    const avgOptionLength = question.options?.reduce((sum, opt) => sum + opt.length, 0) / (question.options?.length || 1);
    if (avgOptionLength > 50) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Compute ZPD zone for a question based on user performance
   */
  computeZPDZone(question) {
    // Use statistics if available
    if (this.statistics) {
      const userProfile = this.scaffolding?.data ? {
        topicPerformance: this.scaffolding.data.topicPerformance || {},
        recentPerformance: this.scaffolding.data.recentPerformance || []
      } : {};

      const zone = this.statistics.determineZPDZone?.(question.id, userProfile);
      if (zone) return zone;
    }

    // Fallback: use difficulty to estimate zone
    const difficulty = question.difficulty ?? this.computeDifficulty(question);
    const userLevel = this.getUserLevel();

    // Compare difficulty to user level
    const gap = difficulty - userLevel;

    if (gap < -0.3) return 'mastered';
    if (gap < -0.1) return 'comfortable';
    if (gap < 0.2) return 'proximal';  // ZPD - ideal learning zone
    return 'beyond';
  }

  /**
   * Get user's current performance level (0-1)
   */
  getUserLevel() {
    if (this.scaffolding?.data?.recentPerformance?.length > 0) {
      const recent = this.scaffolding.data.recentPerformance;
      const correct = recent.filter(r => r.correct).length;
      return correct / recent.length;
    }
    return 0.5;  // Default to middle
  }

  // ═══════════════════════════════════════════════════════════════
  // FILTERING AND SORTING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Filter questions by ZPD zone
   */
  filterByZPDZone(questions, targetZone) {
    if (!targetZone) return questions;

    return questions.filter(q => {
      const zone = q.zpdZone || this.computeZPDZone(q);
      return zone === targetZone;
    });
  }

  /**
   * Apply difficulty filter/sort
   */
  applyDifficultyFilter(questions, difficulty) {
    if (!difficulty || difficulty === 'all') return questions;

    if (difficulty === 'adaptive') {
      // Sort by proximity to user's ZPD (proximal zone questions first)
      return questions.sort((a, b) => {
        const zoneOrder = { proximal: 0, comfortable: 1, mastered: 2, beyond: 3 };
        const aOrder = zoneOrder[a.zpdZone] ?? 2;
        const bOrder = zoneOrder[b.zpdZone] ?? 2;
        return aOrder - bOrder;
      });
    }

    // Filter by difficulty level
    const ranges = {
      easy: { min: 0, max: 0.4 },
      medium: { min: 0.3, max: 0.7 },
      hard: { min: 0.6, max: 1.0 }
    };

    const range = ranges[difficulty];
    if (!range) return questions;

    return questions.filter(q => {
      const diff = q.difficulty ?? 0.5;
      return diff >= range.min && diff <= range.max;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SCAFFOLD QUESTION SELECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Select scaffold questions for remediation after wrong answer
   *
   * PRIORITY ORDER:
   * 1. Dedicated scaffold file (e.g., 900.5.01-scaffolds.json) - Magic School Bus narratives
   * 2. Fallback to vocabulary bank selection if no dedicated file exists
   *
   * @param {object} wrongQuestion - The question answered incorrectly
   * @param {number} wrongOptionIndex - Which wrong option was selected
   * @param {number} count - Number of scaffolds to select
   * @returns {Promise<array>} Selected scaffold questions
   */
  async selectScaffolds(wrongQuestion, wrongOptionIndex = null, count = 5) {
    console.log('[QuestionOrchestrator] Selecting scaffolds for:', wrongQuestion.id);

    // PRIORITY 1: Try to load dedicated scaffold file
    const dedicatedScaffolds = await this.loadDedicatedScaffolds(wrongQuestion.id);

    if (dedicatedScaffolds && dedicatedScaffolds.length > 0) {
      console.log(`[QuestionOrchestrator] Using ${dedicatedScaffolds.length} dedicated scaffolds for ${wrongQuestion.id}`);
      // Return scaffolds in order (arc progression), limited to count
      return dedicatedScaffolds.slice(0, count);
    }

    // PRIORITY 2: Fallback to vocabulary bank selection
    console.log('[QuestionOrchestrator] No dedicated scaffolds, falling back to vocabulary selection');

    // Determine vocabulary bank path
    const categoryPrefix = wrongQuestion.id?.split('.')[0] || '000';
    const vocabBankPath = this.getVocabularyBankPath(categoryPrefix);

    if (!vocabBankPath) {
      console.warn('[QuestionOrchestrator] No vocabulary bank for category:', categoryPrefix);
      return [];
    }

    // Load vocabulary bank
    const vocabQuestions = await this.loadQuestions({
      bankPath: vocabBankPath,
      count: 0,  // Load all
      shuffle: false
    });

    if (vocabQuestions.length < 2) {
      console.warn('[QuestionOrchestrator] Not enough vocabulary questions');
      return [];
    }

    // Score scaffolds by relevance to wrong question
    const scoredScaffolds = this.scoreScaffolds(wrongQuestion, vocabQuestions, wrongOptionIndex);

    // Select top scorers with some variety
    const selected = this.selectDiverseTopScorers(scoredScaffolds, count);

    console.log(`[QuestionOrchestrator] Selected ${selected.length} scaffolds from vocabulary bank`);
    return selected;
  }

  /**
   * Load dedicated scaffold file for a specific question
   * Scaffold files follow the pattern: {category}-vocabulary-scaffolds/{questionId}-scaffolds.json
   *
   * @param {string} questionId - The parent question ID (e.g., "900.5.01")
   * @returns {Promise<array|null>} Array of scaffold questions or null if not found
   */
  async loadDedicatedScaffolds(questionId) {
    if (!questionId) return null;

    // Build scaffold file path
    // Question ID format: "900.5.01" -> category "900", file "900.5.01-scaffolds.json"
    const scaffoldPath = this.getScaffoldFilePath(questionId);

    if (!scaffoldPath) {
      console.log('[QuestionOrchestrator] No scaffold path mapping for:', questionId);
      return null;
    }

    // Check cache first
    const cacheKey = `scaffold:${questionId}`;
    if (this.questionCache.has(cacheKey)) {
      this.touchCache(cacheKey);
      return this.questionCache.get(cacheKey);
    }

    // Try to fetch the scaffold file
    try {
      const scaffoldData = await this.fetchScaffoldFile(scaffoldPath);

      if (scaffoldData && scaffoldData.scaffolds && scaffoldData.scaffolds.length > 0) {
        // Transform scaffold format to question format for compatibility
        const scaffoldQuestions = scaffoldData.scaffolds.map(s => ({
          id: s.id,
          q: s.q,
          options: s.options,
          answer: s.answer,
          explain: s.explain,
          wrongExplains: s.wrongExplains,
          arc: s.arc,
          arcTitle: s.arcTitle,
          narrative: s.narrative,
          // Mark as dedicated scaffold for special handling
          _isDedicatedScaffold: true,
          _parentId: questionId,
          _narrativeContext: scaffoldData.narrative
        }));

        // Cache the scaffolds
        this.questionCache.set(cacheKey, scaffoldQuestions);
        this.touchCache(cacheKey);

        console.log(`[QuestionOrchestrator] Loaded ${scaffoldQuestions.length} dedicated scaffolds from ${scaffoldPath}`);
        return scaffoldQuestions;
      }
    } catch (e) {
      // Not an error - dedicated scaffolds are optional
      console.log(`[QuestionOrchestrator] No dedicated scaffold file for ${questionId}:`, e.message);
    }

    return null;
  }

  /**
   * Fetch a scaffold file with path resolution for local/deployed environments
   */
  async fetchScaffoldFile(path) {
    const pathsToTry = [
      path,
      `../820.50-Dewey_Content/${path}`,
      `./${path}`
    ];

    for (const tryPath of pathsToTry) {
      try {
        const response = await fetch(tryPath);
        if (response.ok) {
          const data = await response.json();
          console.log(`[QuestionOrchestrator] Fetched scaffold file from: ${tryPath}`);
          return data;
        }
      } catch (e) {
        // Try next path
      }
    }

    throw new Error(`Scaffold file not found: ${path}`);
  }

  /**
   * Get the scaffold file path for a question ID
   * Maps question IDs to their scaffold file locations
   */
  getScaffoldFilePath(questionId) {
    if (!questionId) return null;

    // Parse question ID: "900.5.01" -> parts = ["900", "5", "01"]
    const parts = questionId.split('.');
    if (parts.length < 2) return null;

    const categoryPrefix = parts[0];

    // Map category to folder structure
    const SCAFFOLD_FOLDER_MAP = {
      '000': '611-anatomy/611-foundations/000.5-vocabulary-scaffolds',
      '100': '612-physiology/612.82-brain/100.5-vocabulary-scaffolds',
      '200': '612-physiology/612.81-nerves/200.6-vocabulary-scaffolds',
      '400': '611-anatomy/611.018-tissues/400.4-vocabulary-scaffolds',
      '500': '612-physiology/612.89-ans/500.3-vocabulary-scaffolds',
      '600': '612-physiology/612.8-special-senses/600.4-vocabulary-scaffolds',
      '700': '612-physiology/612.4-endocrine/700.4-vocabulary-scaffolds',
      '900': '612-physiology/612.2-respiratory/900.5-vocabulary-scaffolds'
    };

    const folder = SCAFFOLD_FOLDER_MAP[categoryPrefix];
    if (!folder) return null;

    // Build file path: folder/questionId-scaffolds.json
    return `${folder}/${questionId}-scaffolds.json`;
  }

  /**
   * Score scaffold questions by relevance
   * Fix #9: Pre-compute word sets for O(n) instead of O(n²)
   */
  scoreScaffolds(wrongQuestion, scaffolds, wrongOptionIndex) {
    const correctAnswerText = (wrongQuestion.options?.[wrongQuestion.answer] || '').toLowerCase();
    const questionText = (wrongQuestion.q || '').toLowerCase();
    const wrongIsotopes = wrongQuestion.isotopes || [];

    // Fix #9: Pre-compute word sets for O(1) lookup instead of O(n) search
    const correctWordSet = new Set(
      correctAnswerText.split(/\s+/).filter(w => w.length > 3)
    );
    const questionWordSet = new Set(
      questionText.split(/\s+/).filter(w => w.length > 4)
    );
    const wrongIsotopeSet = new Set(wrongIsotopes);

    // Pre-compute struggle concepts set
    const struggleConcepts = this.zpdSystem?.studentProfile?.struggleConcepts || new Set();

    return scaffolds
      .filter(s => s.id !== wrongQuestion.id)
      .map(scaffold => {
        let score = Math.random() * 5;  // Base randomness for variety

        // Isotope overlap (strongest signal) - O(n) instead of O(n²)
        const scaffoldIsotopes = scaffold.isotopes || [];
        let isotopeOverlap = 0;
        for (const sIso of scaffoldIsotopes) {
          if (wrongIsotopeSet.has(sIso)) {
            isotopeOverlap++;
          } else {
            // Check for partial matches
            for (const wIso of wrongIsotopes) {
              if (sIso.includes(wIso) || wIso.includes(sIso)) {
                isotopeOverlap++;
                break;
              }
            }
          }
        }
        score += isotopeOverlap * 10;

        // Keyword overlap - extract scaffold words once
        const scaffoldWords = `${scaffold.q} ${(scaffold.options || []).join(' ')}`
          .toLowerCase()
          .split(/\s+/);

        // O(m) where m = scaffold words, checking against O(1) sets
        for (const word of scaffoldWords) {
          if (word.length > 3 && correctWordSet.has(word)) score += 3;
          if (word.length > 4 && questionWordSet.has(word)) score += 2;
        }

        // Prefer easier scaffolds (build up to harder concept)
        const difficulty = scaffold.difficulty ?? 0.5;
        score += (1 - difficulty) * 5;

        // Boost scaffolds targeting concepts user struggles with
        for (const iso of scaffoldIsotopes) {
          if (struggleConcepts.has(iso)) {
            score += 5;
          }
        }

        return { scaffold, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Select diverse top scorers (avoid all scaffolds being too similar)
   */
  selectDiverseTopScorers(scoredScaffolds, count) {
    const selected = [];
    const usedIsotopes = new Set();

    for (const { scaffold } of scoredScaffolds) {
      if (selected.length >= count) break;

      // Check for isotope diversity
      const scaffoldIsotopes = scaffold.isotopes || [];
      const newIsotopes = scaffoldIsotopes.filter(iso => !usedIsotopes.has(iso));

      // Accept if it adds at least one new isotope or we don't have enough yet
      if (newIsotopes.length > 0 || selected.length < Math.ceil(count / 2)) {
        selected.push(scaffold);
        scaffoldIsotopes.forEach(iso => usedIsotopes.add(iso));
      }
    }

    // Fill remaining slots if needed
    for (const { scaffold } of scoredScaffolds) {
      if (selected.length >= count) break;
      if (!selected.includes(scaffold)) {
        selected.push(scaffold);
      }
    }

    return selected;
  }

  /**
   * Get vocabulary bank path for a category
   */
  getVocabularyBankPath(categoryPrefix) {
    const VOCAB_BANK_MAP = {
      '000': '611-anatomy/611-foundations/000.5-vocabulary.json',
      '100': '612-physiology/612.82-brain/100.5-vocabulary.json',
      '200': '612-physiology/612.81-nerves/200.6-vocabulary.json',
      '400': '611-anatomy/611.018-tissues/400.4-vocabulary.json',
      '500': '612-physiology/612.89-ans/500.3-vocabulary.json',
      '600': '612-physiology/612.8-special-senses/600.4-vocabulary.json',
      '700': '612-physiology/612.4-endocrine/700.4-vocabulary.json',
      '900': '612-physiology/612.2-respiratory/900.5-vocabulary.json'
    };

    return VOCAB_BANK_MAP[categoryPrefix] || null;
  }

  // ═══════════════════════════════════════════════════════════════
  // REVIEW QUEUE (SPACED REPETITION)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get questions from the review queue
   */
  async getReviewQuestions(categoryId = null) {
    if (!this.persistence) return [];

    const wrongQueue = this.persistence.getWrongQueueForCategory?.(categoryId) || [];

    if (wrongQueue.length === 0) return [];

    // Load the actual question objects
    const questions = [];
    for (const item of wrongQueue) {
      // Try to find in cache first
      for (const [, bankQuestions] of this.questionCache) {
        const found = bankQuestions.find(q => q.id === item.questionId);
        if (found) {
          questions.push(found);
          break;
        }
      }
    }

    return questions;
  }

  // ═══════════════════════════════════════════════════════════════
  // CACHE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update LRU access order
   */
  touchCache(key) {
    const index = this.cacheAccessOrder.indexOf(key);
    if (index > -1) {
      this.cacheAccessOrder.splice(index, 1);
    }
    this.cacheAccessOrder.push(key);
  }

  /**
   * Evict oldest entries if cache is full
   */
  evictIfNeeded() {
    while (this.questionCache.size > this.CACHE_CONFIG.maxBanks) {
      const oldest = this.cacheAccessOrder.shift();
      if (oldest) {
        this.questionCache.delete(oldest);
        console.log('[QuestionOrchestrator] Evicted from cache:', oldest);
      }
    }
  }

  /**
   * Save cache to localStorage
   * Fix #4: Comprehensive try-catch for quota errors
   */
  saveCacheToStorage() {
    try {
      const cacheData = {};
      for (const [key, entry] of this.questionCache) {
        // Handle new cache entry format with data/timestamp
        const questions = entry.data || entry;
        if (!Array.isArray(questions)) continue;

        // Only save minimal data to reduce storage
        cacheData[key] = {
          data: questions.slice(0, 100).map(q => ({  // Limit to 100 questions per bank
            id: q.id,
            q: q.q,
            options: q.options,
            answer: q.answer,
            explain: q.explain,
            isotopes: q.isotopes,
            difficulty: q.difficulty
          })),
          timestamp: entry.timestamp || Date.now()
        };
      }

      const payload = JSON.stringify({
        version: 2,  // Cache format version
        data: cacheData,
        accessOrder: this.cacheAccessOrder,
        timestamp: Date.now()
      });

      localStorage.setItem('quiz_question_cache', payload);
    } catch (e) {
      // Fix #4: Handle quota exceeded and other storage errors
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        console.warn('[QuestionOrchestrator] localStorage quota exceeded, clearing old cache');
        try {
          localStorage.removeItem('quiz_question_cache');
          // Also clear other quiz-related storage to free space
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('quiz_') && key !== 'quiz_player_data') {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch (clearError) {
          console.error('[QuestionOrchestrator] Failed to clear storage:', clearError);
        }
      } else {
        console.warn('[QuestionOrchestrator] Cache save failed:', e.message);
      }
    }
  }

  /**
   * Restore cache from localStorage
   * Fix #4: Comprehensive try-catch with format version handling
   */
  restoreCacheFromStorage() {
    try {
      const stored = localStorage.getItem('quiz_question_cache');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      const { version, data, accessOrder, timestamp } = parsed;

      // Check TTL on entire cache
      if (Date.now() - timestamp > this.CACHE_CONFIG.ttlMs) {
        console.log('[QuestionOrchestrator] Cache expired, discarding');
        try {
          localStorage.removeItem('quiz_question_cache');
        } catch (e) { /* ignore */ }
        return;
      }

      // Restore with format handling
      for (const [key, entry] of Object.entries(data)) {
        // Handle v2 format (with nested data/timestamp) and v1 (direct array)
        if (version === 2 && entry.data) {
          // Check individual entry TTL
          if (entry.timestamp && (Date.now() - entry.timestamp > this.CACHE_CONFIG.ttlMs)) {
            continue;  // Skip expired entries
          }
          this.questionCache.set(key, entry);
        } else {
          // Legacy v1 format - wrap in new structure
          this.questionCache.set(key, {
            data: Array.isArray(entry) ? entry : [],
            timestamp: timestamp
          });
        }
      }
      this.cacheAccessOrder = accessOrder || [];

      console.log(`[QuestionOrchestrator] Restored ${this.questionCache.size} banks from cache`);
    } catch (e) {
      console.warn('[QuestionOrchestrator] Failed to restore cache:', e.message);
      // Fix #4: Clean up corrupted cache
      try {
        localStorage.removeItem('quiz_question_cache');
      } catch (clearError) { /* ignore */ }
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.questionCache.clear();
    this.bankMetadataCache.clear();
    this.cacheAccessOrder = [];
    this.loadingPromises.clear();
    localStorage.removeItem('quiz_question_cache');
    console.log('[QuestionOrchestrator] Cache cleared');
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log error for debugging
   */
  logError(method, type, details) {
    this.errorLog.push({
      method,
      type,
      details,
      timestamp: Date.now()
    });

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog.shift();
    }
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return this.errorLog;
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API SUMMARY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Quick reference for game mode integration:
   *
   * // Load questions for Map mode
   * const questions = await questionOrchestrator.loadQuestions({
   *   categoryId: 'respiratory-vocab',
   *   count: 10,
   *   mode: 'map',
   *   difficulty: 'adaptive'
   * });
   *
   * // Load scaffolds after wrong answer
   * const scaffolds = await questionOrchestrator.selectScaffolds(
   *   wrongQuestion,
   *   wrongOptionIndex,
   *   5
   * );
   *
   * // Get review questions
   * const review = await questionOrchestrator.getReviewQuestions('respiratory');
   *
   * // Clear cache (for testing)
   * questionOrchestrator.clearCache();
   */
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════

const questionOrchestrator = new QuestionOrchestrator();

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => questionOrchestrator.init());
  } else {
    setTimeout(() => questionOrchestrator.init(), 100);
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuestionOrchestrator, questionOrchestrator };
}
