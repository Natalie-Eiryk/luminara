/**
 * Ms. Luminara Quiz Application
 * Main application logic for the modular quiz system
 * Supports prerequisite "warmup" questions for scaffolded learning
 * Now with gamification: XP, streaks, achievements, and persistence
 * @version 2026-03-29
 */

// Debug logging - enable with localStorage.setItem('quiz_debug', 'true')
const QUIZ_DEBUG = localStorage.getItem('quiz_debug') === 'true';
const debugLog = QUIZ_DEBUG ? console.log.bind(console, '[Quiz]') : () => {};

class LuminaraQuiz {
  constructor() {
    this.registry = null;
    this.questionBanks = {};
    this.currentQuiz = [];
    this.currentIdx = 0;
    this.exploredOptions = {};
    this.renderer = null;
    this.achievements = [];

    // Navigation state
    this.currentSubject = null;
    this.currentDiscipline = null;
    this.currentCourse = null;

    // Prerequisite/warmup state
    this.currentPhase = 'main'; // 'warmup1', 'warmup2', or 'main'
    this.mainQuestion = null;   // The main question we're building toward
    this.warmupAnswered = { warmup1: false, warmup2: false };

    // Track if we've processed the correct answer for gamification
    this.correctAnswerProcessed = {};
    this.firstExplorationPerPhase = {};
    this.previousLevel = 1;

    // FF6-style battle mode (toggle with quiz.toggleBattleMode())
    this.battleModeEnabled = true;

    // Statistics tracking - timing
    this.questionDisplayedAt = null;  // Timestamp when current question was shown
    this.scaffoldDisplayedAt = null;  // Timestamp when current scaffold question was shown

    // ═══════════════════════════════════════════════════════════════════════════
    // STUDY MODE ROUTER (Exemplar Pattern)
    // Single source of truth for what "study" means across the entire app.
    // Change this ONE place to change all study behavior.
    // ═══════════════════════════════════════════════════════════════════════════
    const self = this;
    this.StudyModeRouter = {
      // Current study mode: 'map' (dungeon crawl) or 'classic' (traditional Q&A)
      mode: 'map',

      /**
       * Route to the appropriate study experience
       * @param {LuminaraQuiz} quiz - The quiz instance
       * @param {string} categoryId - Category to study
       * @param {string|null} bankId - Optional specific bank ID (used for filtering in map mode)
       */
      start: function(quiz, categoryId, bankId = null) {
        debugLog('[StudyModeRouter] Starting study:', { mode: this.mode, categoryId, bankId });
        if (this.mode === 'map') {
          // Map dungeon crawl - full roguelike experience
          // bankId is passed for potential filtering but map uses category-level questions
          quiz.startMapRun('standard', categoryId);
        } else {
          // Classic mode - traditional study flow
          if (bankId) {
            quiz._startClassicStudyBank(categoryId, bankId);
          } else {
            quiz._startClassicStudy(categoryId);
          }
        }
      },

      /**
       * Toggle between map and classic modes
       */
      toggleMode: function() {
        this.mode = this.mode === 'map' ? 'classic' : 'map';
        debugLog('[StudyModeRouter] Mode switched to:', this.mode);
        return this.mode;
      },

      /**
       * Get current mode
       */
      getMode: function() { return this.mode; }
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      await this.loadRegistry();
      await this.loadAchievements();
      this.initializeGamification();
      this.renderer = new QuizRenderer(this);
      this.setupSubjectSelection();
      this.renderer.renderLandingStats();
      this.renderLandingGamification();
      debugLog('Ms. Luminara Quiz initialized successfully');
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      this.showError('Failed to load quiz data. Please refresh the page.');
    }
  }

  /**
   * Load achievement definitions
   */
  async loadAchievements() {
    // Try fetch first
    try {
      const response = await fetch('820.31-core/820.31.5-achievements.json');
      if (response.ok) {
        this.achievements = await response.json();
        return;
      }
    } catch (e) {
      debugLog('Fetch failed for achievements, using script fallback');
    }

    // Check if already loaded via script tag
    if (window.achievementsData) {
      this.achievements = window.achievementsData;
      return;
    }

    // Load via script tag for file:// protocol
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '820.31-core/820.31.5-achievements.js';
      script.onload = () => {
        this.achievements = window.achievementsData || [];
        resolve();
      };
      script.onerror = () => {
        console.warn('Could not load achievements');
        this.achievements = [];
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize gamification system
   */
  initializeGamification() {
    // persistence is already instantiated as a singleton
    gamification = new GamificationEngine(persistence, this.achievements);
    scaffolding = new ScaffoldingEngine(persistence);
    d20System = new D20System(persistence);
    lootSystem = new LootSystem();
    scaffoldRemediation = new ScaffoldRemediationEngine(persistence, d20System);
    this.previousLevel = persistence.getPlayer().level;
    this.currentEncounter = null;

    // Initialize statistics-driven ZPD system
    if (typeof QuestionStatisticsEngine !== 'undefined') {
      questionStatistics = new QuestionStatisticsEngine(persistence);
      debugLog('[Quiz] QuestionStatisticsEngine initialized');
    }

    // Initialize insight detection engine for adaptive scaffolding (Phase 1 of 510.108)
    if (typeof InsightDetectionEngine !== 'undefined') {
      insightDetection = new InsightDetectionEngine();
      // Attach to scaffold remediation for adaptive scaffold depth
      if (scaffoldRemediation) {
        scaffoldRemediation.setInsightEngine(insightDetection);
      }
      debugLog('[Quiz] InsightDetectionEngine initialized - adaptive scaffolding enabled');
    }

    // Initialize learning analytics engine (Opportunities 1, 2, 4, 7 of 510.108)
    if (typeof LearningAnalyticsEngine !== 'undefined') {
      learningAnalytics = new LearningAnalyticsEngine(persistence, questionStatistics);
      learningAnalytics.startSession();
      debugLog('[Quiz] LearningAnalyticsEngine initialized - conceptual change + forgetting curves enabled');
    }
  }

  /**
   * Load the question registry
   */
  async loadRegistry() {
    // Try fetch first (works with http server)
    // Fall back to embedded registry for file:// protocol
    try {
      const response = await fetch('820.31-core/820.31-question-registry.json');
      if (response.ok) {
        this.registry = await response.json();
        return;
      }
    } catch (e) {
      debugLog('Fetch failed, using embedded registry (file:// mode)');
    }

    // Embedded registry for file:// protocol
    this.registry = {
      "version": "1.0.0",
      "categories": [
        {
          "id": "100",
          "name": "Central Nervous System: Brain",
          "description": "Chapter 12 — Brain Structure, Meninges, Cortex, Brainstem",
          "folder": "612-physiology/612.82-brain",
          "banks": [
            { "id": "100.1", "file": "100.1-structure.json", "title": "Brain Structure & Regions", "questionCount": 10 },
            { "id": "100.2", "file": "100.2-meninges-csf.json", "title": "Meninges & CSF", "questionCount": 6 },
            { "id": "100.3", "file": "100.3-cortex.json", "title": "Cerebral Cortex & Functions", "questionCount": 7 },
            { "id": "100.4", "file": "100.4-brainstem.json", "title": "Brainstem & Pathology", "questionCount": 5 }
          ]
        },
        {
          "id": "200",
          "name": "Peripheral Nervous System",
          "description": "Chapter 13 — Spinal Cord, Plexuses, Cranial Nerves, Reflexes",
          "folder": "612-physiology/612.81-nerves",
          "banks": [
            { "id": "200.1", "file": "200.1-spinal.json", "title": "Spinal Cord & Roots", "questionCount": 5 },
            { "id": "200.2", "file": "200.2-receptors.json", "title": "Sensory Receptors", "questionCount": 6 },
            { "id": "200.3", "file": "200.3-plexuses.json", "title": "Nerve Plexuses", "questionCount": 5 },
            { "id": "200.4", "file": "200.4-reflexes.json", "title": "Reflexes & Pathways", "questionCount": 4 },
            { "id": "200.5", "file": "200.5-cranial-nerves.json", "title": "Cranial Nerves", "questionCount": 16 },
            { "id": "200.6", "file": "200.6-autonomic-nervous-system.json", "title": "Autonomic Nervous System", "questionCount": 16 }
          ]
        },
        {
          "id": "300",
          "name": "Body Organization & Chemistry",
          "description": "Chapters 1-4 — Organization, Chemistry, Cells, Membranes",
          "folder": "300-foundations",
          "banks": [
            { "id": "300.1", "file": "300.1-organization.json", "title": "Body Organization & Homeostasis", "questionCount": 12 },
            { "id": "300.2", "file": "300.2-chemistry.json", "title": "Basic Chemistry", "questionCount": 10 },
            { "id": "300.3", "file": "300.3-cells.json", "title": "Cell Structure & Function", "questionCount": 8 },
            { "id": "300.4", "file": "300.4-membranes.json", "title": "Membranes & Cavities", "questionCount": 5 }
          ]
        },
        {
          "id": "400",
          "name": "Histology: Body Tissues",
          "description": "Chapter 4 — Epithelial, Connective, Muscle, Nervous Tissues",
          "folder": "611-anatomy/611.018-tissues",
          "banks": [
            { "id": "400.1", "file": "400.1-epithelial.json", "title": "Epithelial Tissues", "questionCount": 8 },
            { "id": "400.2", "file": "400.2-connective.json", "title": "Connective Tissues", "questionCount": 6 },
            { "id": "400.3", "file": "400.3-glands.json", "title": "Glands & Repair", "questionCount": 4 }
          ]
        }
      ]
    };
  }

  /**
   * Load a specific question bank
   */
  async loadQuestionBank(categoryId, bankId) {
    const cacheKey = `${categoryId}-${bankId}`;

    if (this.questionBanks[cacheKey]) {
      return this.questionBanks[cacheKey];
    }

    const category = this.registry.categories.find(c => c.id === categoryId);
    if (!category) throw new Error(`Category ${categoryId} not found`);

    const bank = category.banks.find(b => b.id === bankId);
    if (!bank) throw new Error(`Bank ${bankId} not found`);

    const path = `${category.folder}/${bank.file}`;

    // Try fetch first (works with http server)
    try {
      const response = await fetch(path);
      if (response.ok) {
        const data = await response.json();
        this.questionBanks[cacheKey] = data;
        return data;
      }
    } catch (e) {
      // Fall back to script loading for file:// protocol
    }

    // Load via dynamic script tag for file:// protocol
    const data = await this.loadJsonViaScript(path, bankId.replace('.', '_'));
    this.questionBanks[cacheKey] = data;
    return data;
  }

  /**
   * Load scaffolds for a question (lazy loading from subfolder)
   * Questions now have scaffoldFile instead of embedded prereqs
   */
  async loadScaffoldsForQuestion(question, categoryFolder) {
    // If already has prereqs loaded, return them
    if (question.prereqs && question.prereqs.length > 0) {
      return question.prereqs;
    }

    // If no scaffoldFile reference, no scaffolds available
    if (!question.scaffoldFile) {
      return [];
    }

    // Try to load from scaffold file
    try {
      const scaffoldPath = `${categoryFolder}/${question.scaffoldFile}`;
      const response = await fetch(scaffoldPath);
      if (response.ok) {
        const scaffoldData = await response.json();
        // Cache on the question object
        question.prereqs = scaffoldData.scaffolds || [];
        return question.prereqs;
      }
    } catch (e) {
      debugLog(`[Scaffold] Failed to load ${question.scaffoldFile}:`, e.message);
    }

    return [];
  }

  /**
   * Load JSON via script tag (for file:// protocol)
   */
  loadJsonViaScript(path, varName) {
    return new Promise((resolve, reject) => {
      // Check if already loaded as a global
      const globalKey = `questionBank_${varName}`;
      if (window[globalKey]) {
        resolve(window[globalKey]);
        return;
      }

      // Create script to load the .js version of the file
      const jsPath = path.replace('.json', '.js');
      const script = document.createElement('script');
      script.src = jsPath;
      script.onload = () => {
        if (window[globalKey]) {
          resolve(window[globalKey]);
        } else {
          reject(new Error(`Failed to load ${jsPath}`));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${jsPath}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load all question banks for a category
   */
  async loadCategory(categoryId) {
    const category = this.registry.categories.find(c => c.id === categoryId);
    if (!category) throw new Error(`Category ${categoryId} not found`);

    const questions = [];

    for (const bank of category.banks) {
      const data = await this.loadQuestionBank(categoryId, bank.id);
      // Tag each question with its category folder for scaffold loading
      data.questions.forEach(q => {
        q._categoryFolder = category.folder;
      });
      questions.push(...data.questions);
    }

    return questions;
  }

  /**
   * Render gamification UI elements on landing page
   */
  renderLandingGamification() {
    // Render daily challenges
    const dailyPanel = document.getElementById('dailyChallengesPanel');
    if (dailyPanel && this.renderer) {
      this.renderer.renderDailyChallenges(dailyPanel);
    }

    // Render study calendar
    const calendarPanel = document.getElementById('studyCalendarPanel');
    if (calendarPanel && this.renderer) {
      this.renderer.renderStudyCalendar(calendarPanel);
    }

    // Show seasonal event banner if active
    if (gamification) {
      const event = gamification.getActiveSeasonalEvent();
      if (event) {
        const welcome = gamification.getSeasonalWelcome(event);
        if (welcome) {
          debugLog('[Seasonal]', welcome);
        }
      }
    }
  }

  /**
   * Set up category selection buttons with Dewey Decimal hierarchy
   */
  /**
   * Setup subject selection (top-level navigation)
   */
  setupSubjectSelection() {
    const container = document.getElementById('subjectGrid');
    if (!container) return;

    container.innerHTML = '';

    // Get subjects from registry
    const subjects = this.registry.subjects || [];

    for (const subject of subjects) {
      const card = document.createElement('div');
      card.className = 'subject-card';

      // Count courses with content
      const coursesWithContent = subject.disciplines?.reduce((acc, d) =>
        acc + (d.courses?.filter(c => this.getCourseCategories(subject.id, d.id, c.id).length > 0).length || 0), 0) || 0;

      if (coursesWithContent === 0) {
        card.classList.add('disabled');
      }

      card.innerHTML = `
        <div class="subject-icon">${subject.icon || '📚'}</div>
        <div class="subject-name">${subject.name}</div>
        <div class="subject-description">${subject.description || ''}</div>
        ${coursesWithContent > 0
          ? `<span class="subject-count">${coursesWithContent} course${coursesWithContent > 1 ? 's' : ''}</span>`
          : '<span class="subject-coming-soon">Coming Soon</span>'}
      `;

      if (coursesWithContent > 0) {
        card.addEventListener('click', () => this.selectSubject(subject));
      }

      container.appendChild(card);
    }
  }

  /**
   * Get categories for a specific course
   */
  getCourseCategories(subjectId, disciplineId, courseId) {
    return this.registry.categories.filter(c =>
      c.subject === subjectId && c.discipline === disciplineId && c.course === courseId
    );
  }

  /**
   * Compare two Dewey decimal codes for sorting
   * Handles formats like "611", "611.018", "612.8", "612.81", "612.8L"
   */
  compareDeweyDecimal(a, b) {
    // Parse Dewey code into numeric parts and optional suffix
    const parseDewey = (code) => {
      const str = String(code);
      // Extract numeric portion and any letter suffix (e.g., "L" in "612.8L")
      const match = str.match(/^(\d+(?:\.\d+)?)([A-Za-z]*)$/);
      if (!match) return { num: 0, suffix: str };

      const numPart = match[1];
      const suffix = match[2].toUpperCase();

      // Split into major.minor parts
      const parts = numPart.split('.');
      const major = parseInt(parts[0], 10) || 0;
      // Keep minor as string to preserve leading zeros and full precision
      const minor = parts[1] || '';

      return { major, minor, suffix };
    };

    const pA = parseDewey(a);
    const pB = parseDewey(b);

    // Compare major numbers first (611 vs 612)
    if (pA.major !== pB.major) {
      return pA.major - pB.major;
    }

    // Compare minor numbers numerically
    // "018" < "4" < "8" < "81" < "82" < "89"
    const minorA = pA.minor ? parseFloat('0.' + pA.minor) : 0;
    const minorB = pB.minor ? parseFloat('0.' + pB.minor) : 0;

    if (minorA !== minorB) {
      return minorA - minorB;
    }

    // If numeric parts are equal, sort by suffix (L comes after no suffix)
    return pA.suffix.localeCompare(pB.suffix);
  }

  /**
   * Handle subject selection
   */
  selectSubject(subject) {
    this.currentSubject = subject;

    // Hide subject select, show course select
    document.getElementById('subjectSelect').classList.add('hidden');
    document.getElementById('courseSelect').classList.remove('hidden');
    document.getElementById('topicSelect').classList.add('hidden');

    // Update breadcrumb
    document.getElementById('currentSubject').textContent = subject.name;
    document.getElementById('courseTitle').textContent = `${subject.name}`;

    // Render disciplines and courses
    this.renderCourseSelection(subject);
  }

  /**
   * Render course selection for a subject
   */
  renderCourseSelection(subject) {
    const container = document.getElementById('courseGrid');
    container.innerHTML = '';

    // Collect all courses with their discipline info, then sort by Dewey
    const allCourses = [];
    for (const discipline of (subject.disciplines || [])) {
      for (const course of (discipline.courses || [])) {
        const categories = this.getCourseCategories(subject.id, discipline.id, course.id);
        if (categories.length === 0) continue;
        allCourses.push({ discipline, course, categories });
      }
    }

    // Sort by Dewey decimal order
    allCourses.sort((a, b) => this.compareDeweyDecimal(a.course.dewey, b.course.dewey));

    for (const { discipline, course, categories } of allCourses) {
      const totalQuestions = categories.reduce((sum, cat) =>
        sum + cat.banks.reduce((s, b) => s + b.questionCount, 0), 0);

      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-icon">${course.icon || discipline.icon || '📖'}</div>
        <div class="course-name">${course.name}</div>
        <div class="course-dewey">${course.dewey}</div>
        <div class="course-description">${course.description || ''} (${totalQuestions} questions)</div>
      `;

      card.addEventListener('click', () => this.selectCourse(subject, discipline, course));
      container.appendChild(card);
    }
  }

  /**
   * Handle course selection
   */
  selectCourse(subject, discipline, course) {
    this.currentSubject = subject;
    this.currentDiscipline = discipline;
    this.currentCourse = course;

    // Hide course select, show topic select
    document.getElementById('subjectSelect').classList.add('hidden');
    document.getElementById('courseSelect').classList.add('hidden');
    document.getElementById('topicSelect').classList.remove('hidden');

    // Update breadcrumb
    document.getElementById('topicSubject').textContent = subject.name;
    document.getElementById('currentCourse').textContent = course.name;

    // Setup category buttons for this course
    this.setupCategoryButtons();
  }

  /**
   * Show subjects view (go back to top)
   */
  showSubjects() {
    this.currentSubject = null;
    this.currentDiscipline = null;
    this.currentCourse = null;

    document.getElementById('subjectSelect').classList.remove('hidden');
    document.getElementById('courseSelect').classList.add('hidden');
    document.getElementById('topicSelect').classList.add('hidden');
  }

  /**
   * Show courses view (go back one level)
   */
  showCourses() {
    if (this.currentSubject) {
      document.getElementById('subjectSelect').classList.add('hidden');
      document.getElementById('courseSelect').classList.remove('hidden');
      document.getElementById('topicSelect').classList.add('hidden');
    }
  }

  setupCategoryButtons() {
    const container = document.getElementById('quizSelect');
    if (!container) return;

    container.innerHTML = '';

    // Filter categories by current course if selected
    const categories = this.currentCourse
      ? this.getCourseCategories(this.currentSubject.id, this.currentDiscipline.id, this.currentCourse.id)
      : this.registry.categories;

    // Sort categories by Dewey decimal order
    const sortedCategories = [...categories].sort((a, b) => {
      const deweyA = a.dewey || a.id;
      const deweyB = b.dewey || b.id;
      return this.compareDeweyDecimal(deweyA, deweyB);
    });

    for (const category of sortedCategories) {
      const totalQuestions = category.banks.reduce((sum, b) => sum + b.questionCount, 0);

      // Get category progression status
      const status = persistence.getCategoryStatus(category.id);
      const mastery = persistence.getCategoryMastery(category.id);
      const bossReady = persistence.isBossReady(category.id);
      const bossName = typeof getCategoryBossName === 'function' ? getCategoryBossName(category.id) : 'Boss';
      const prevCategory = persistence.getPreviousCategory(category.id);
      const prevBossName = prevCategory && typeof getCategoryBossName === 'function'
        ? getCategoryBossName(prevCategory) : 'the previous boss';

      // Create Dewey group with status class
      const group = document.createElement('div');
      group.className = `dewey-group ${status}`;
      if (bossReady) group.classList.add('boss-ready');

      // Header (clickable to expand/collapse or start all)
      const header = document.createElement('div');
      header.className = 'dewey-header';
      const deweyCode = category.dewey || category.id;

      // Build status indicator
      let statusIndicator = '';
      if (status === 'completed') {
        statusIndicator = `<span class="status-badge completed" title="Boss Defeated">🏆</span>`;
      } else if (status === 'locked') {
        statusIndicator = `<span class="status-badge locked" title="Locked">🔒</span>`;
      } else if (bossReady) {
        statusIndicator = `<span class="status-badge boss-ready" title="Boss Ready!">👹</span>`;
      }

      header.innerHTML = `
        ${statusIndicator}
        <span class="dewey-code">${deweyCode}</span>
        <span class="dewey-title">${category.name}</span>
        <span class="dewey-count">${totalQuestions}q</span>
        <span class="mastery-badge">${mastery}%</span>
        <span class="dewey-expand">▼</span>
      `;

      // Main categories are always expandable (locks are on sub-categories)
      header.addEventListener('click', () => {
        group.classList.toggle('expanded');
      });
      group.appendChild(header);

      // Boss ready banner
      if (bossReady && status === 'unlocked') {
        const bossBanner = document.createElement('div');
        bossBanner.className = 'boss-ready-banner';
        bossBanner.innerHTML = `
          <div class="boss-pulse"></div>
          <span class="boss-icon">👹</span>
          <div class="boss-info">
            <span class="boss-ready-text">BOSS READY</span>
            <span class="boss-name">${bossName}</span>
          </div>
          <div class="boss-challenge-buttons">
            <button class="boss-challenge-btn" data-action="challenge-boss" data-category="${category.id}" data-mode="quiz" title="Question-based battle">
              📝 Quiz Battle
            </button>
            <button class="boss-challenge-btn card-battle" data-action="challenge-boss" data-category="${category.id}" data-mode="cards" title="Slay the Spire style card combat">
              🃏 Card Battle
            </button>
          </div>
        `;

        // Attach event listeners to boss challenge buttons
        const quizBtn = bossBanner.querySelector('[data-mode="quiz"]');
        const cardsBtn = bossBanner.querySelector('[data-mode="cards"]');
        if (quizBtn) {
          quizBtn.addEventListener('click', () => this.challengeBoss(category.id, 'quiz'));
        }
        if (cardsBtn) {
          cardsBtn.addEventListener('click', () => this.challengeBoss(category.id, 'cards'));
        }

        group.appendChild(bossBanner);
      }

      // Banks container
      const banksContainer = document.createElement('div');
      banksContainer.className = 'dewey-banks';

      // Mode action row with Study (Map), Review, Test Prep buttons
      const modeRow = document.createElement('div');
      modeRow.className = 'dewey-mode-row';
      modeRow.innerHTML = `
        <button class="dewey-mode-btn study" data-mode="study" data-category="${category.id}">
          <span class="mode-icon">🗺️</span>
          <span class="mode-label">Study</span>
          <span class="mode-count">${totalQuestions}q</span>
        </button>
        <button class="dewey-mode-btn review" data-mode="review" data-category="${category.id}">
          <span class="mode-icon">🔄</span>
          <span class="mode-label">Review</span>
          <span class="mode-count due-count" data-category="${category.id}">0 due</span>
        </button>
        <button class="dewey-mode-btn testprep" data-mode="testprep" data-category="${category.id}">
          <span class="mode-icon">🎯</span>
          <span class="mode-label">Test Prep</span>
          <span class="mode-count">${totalQuestions}q</span>
        </button>
      `;

      // Add event listeners for mode buttons
      modeRow.querySelectorAll('.dewey-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = btn.dataset.mode;
          const catId = btn.dataset.category;
          this.startCategoryMode(catId, mode);
        });
      });

      banksContainer.appendChild(modeRow);

      // Individual banks (sorted by Dewey order)
      const sortedBanks = [...category.banks].sort((a, b) => this.compareDeweyDecimal(a.id, b.id));
      for (let bankIdx = 0; bankIdx < sortedBanks.length; bankIdx++) {
        const bank = sortedBanks[bankIdx];
        const bankBtn = document.createElement('div');

        // Get mastery for this bank
        const bankKey = `${bank.id.replace('.', '-')}`;
        const bankProgress = persistence.getCategoryProgress(bankKey);
        const masteryPct = bankProgress.mastery || 0;

        // Check if bank is locked (first bank in first category always unlocked)
        // Banks unlock sequentially: need 70% on previous bank OR skip
        const isFirstBank = bankIdx === 0;
        const isFirstCategory = category.id === '000';
        const prevBank = bankIdx > 0 ? sortedBanks[bankIdx - 1] : null;
        const prevBankKey = prevBank ? `${prevBank.id.replace('.', '-')}` : null;
        const prevBankMastery = prevBankKey ? (persistence.getCategoryProgress(prevBankKey).mastery || 0) : 100;

        // All banks are now unlocked (no lock buttons)
        bankBtn.className = 'dewey-bank';

        bankBtn.innerHTML = `
          <span class="dewey-bank-code">${bank.id}</span>
          <span class="dewey-bank-title">${bank.title}</span>
          <span class="dewey-bank-count">${bank.questionCount}q</span>
          <div class="dewey-bank-mastery">
            <div class="dewey-bank-mastery-fill" style="width: ${masteryPct}%"></div>
          </div>
        `;
        bankBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.startStudyBank(category.id, bank.id);
        });

        banksContainer.appendChild(bankBtn);
      }

      group.appendChild(banksContainer);
      container.appendChild(group);
    }

    // Update due counts for review buttons
    this.updateCategoryDueCounts();
  }

  /**
   * Update due counts for each category's review button
   */
  updateCategoryDueCounts() {
    const dueCounts = document.querySelectorAll('.due-count[data-category]');
    dueCounts.forEach(el => {
      const categoryId = el.dataset.category;
      const dueCount = this.getDueCategoryCount(categoryId);
      el.textContent = dueCount > 0 ? `${dueCount} due` : '0 due';
      if (dueCount > 0) {
        el.style.color = 'var(--correct)';
        el.style.fontWeight = '600';
      }
    });
  }

  /**
   * Get count of due questions for a category
   */
  getDueCategoryCount(categoryId) {
    const now = Date.now();
    const category = this.registry.categories.find(c => c.id === categoryId);
    if (!category) return 0;

    // Check SRS data from reviewModule (stored in index.html)
    const srsData = (window.reviewModule && window.reviewModule.srsData) || {};

    let dueCount = 0;
    for (const bank of category.banks) {
      // Question IDs are typically like "100.1.1", "100.1.2" for bank "100.1"
      const bankPrefix = bank.id;
      for (const qId of Object.keys(srsData)) {
        if (qId.startsWith(bankPrefix)) {
          const srs = srsData[qId];
          if (srs && srs.nextReview <= now) {
            dueCount++;
          }
        }
      }
    }

    return dueCount;
  }

  /**
   * Start study session for a specific bank (routes through StudyModeRouter)
   */
  async startStudyBank(categoryId, bankId) {
    this.StudyModeRouter.start(this, categoryId, bankId);
  }

  /**
   * Classic study session for a specific bank (traditional Q&A flow)
   * @private
   */
  async _startClassicStudyBank(categoryId, bankId) {
    try {
      this.showLoading(true);

      const category = this.registry.categories.find(c => c.id === categoryId);
      const bank = category.banks.find(b => b.id === bankId);

      const data = await this.loadQuestionBank(categoryId, bank.id);
      const questions = data.questions;
      
      // Tag questions with category folder and preload scaffolds
      for (const q of questions) {
        q._categoryFolder = category.folder;
        await this.loadScaffoldsForQuestion(q, category.folder);
      }

      // SPACED REPETITION: Prioritize wrong answers at front of queue
      const categoryPrefix = categoryId.replace(/-/g, '.');
      const priorityIds = persistence.getWrongQueueForCategory(categoryPrefix);
      const priorityQuestions = priorityIds
        .map(id => questions.find(q => q.id === id))
        .filter(Boolean);
      const remainingQuestions = questions.filter(q => !priorityIds.includes(q.id));
      const reorderedQuestions = [...priorityQuestions, ...remainingQuestions];

      // Initialize state
      this.currentQuiz = reorderedQuestions.map(q => ({...q}));
      this.currentIdx = 0;
      this.exploredOptions = {};
      this.correctAnswerProcessed = {};
      this.firstExplorationPerPhase = {};

      // Reset warmup state
      this.currentPhase = 'warmup1';
      this.mainQuestion = this.currentQuiz[0];
      this.warmupAnswered = { warmup1: false, warmup2: false };

      // Start gamification session
      persistence.startSession();
      scaffolding.resetSessionCounters();
      this.previousLevel = persistence.getPlayer().level;

      // ARTISTRY ENGINE: Apply biome theme based on category/bank
      if (typeof ArtistryEngine !== 'undefined') {
        ArtistryEngine.applyBiomeTheme(categoryId);
        ArtistryEngine.showTransition('category-start', `${categoryId} - ${bank.name}`);
      }

      // Switch views
      document.getElementById('landing').classList.add('hidden');
      document.getElementById('studyView').classList.add('active');

      // Render stats bar and first question
      this.renderer.renderStatsBar();
      this.startEncounter();
      this.renderQuestion();

    } catch (error) {
      console.error('Failed to start bank study session:', error);
      this.showError('Failed to load questions. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Start a study session for a category (routes through StudyModeRouter)
   */
  async startStudy(categoryId) {
    this.StudyModeRouter.start(this, categoryId);
  }

  /**
   * Classic study session for a category (traditional Q&A flow)
   * @private
   */
  async _startClassicStudy(categoryId) {
    try {
      this.showLoading(true);

      const questions = await this.loadCategory(categoryId);

      // Preload scaffolds for all questions
      for (const q of questions) {
        await this.loadScaffoldsForQuestion(q, q._categoryFolder);
      }

      // SPACED REPETITION: Prioritize wrong answers at front of queue
      const categoryPrefix = categoryId.replace(/-/g, '.');
      const priorityIds = persistence.getWrongQueueForCategory(categoryPrefix);
      const priorityQuestions = priorityIds
        .map(id => questions.find(q => q.id === id))
        .filter(Boolean);
      const remainingQuestions = questions.filter(q => !priorityIds.includes(q.id));
      const reorderedQuestions = [...priorityQuestions, ...remainingQuestions];

      // Initialize state
      this.currentQuiz = reorderedQuestions.map(q => ({...q}));
      this.currentIdx = 0;
      this.exploredOptions = {};
      this.correctAnswerProcessed = {};
      this.firstExplorationPerPhase = {};

      // Reset warmup state
      this.currentPhase = 'warmup1';
      this.mainQuestion = this.currentQuiz[0];
      this.warmupAnswered = { warmup1: false, warmup2: false };

      // Start gamification session
      persistence.startSession();
      scaffolding.resetSessionCounters();
      this.previousLevel = persistence.getPlayer().level;

      // ARTISTRY ENGINE: Apply biome theme based on category
      if (typeof ArtistryEngine !== 'undefined') {
        ArtistryEngine.applyBiomeTheme(categoryId);
        ArtistryEngine.showTransition('category-start', categoryId);
      }

      // Switch views
      document.getElementById('landing').classList.add('hidden');
      document.getElementById('studyView').classList.add('active');

      // Render stats bar and first question
      this.renderer.renderStatsBar();
      this.startEncounter();
      this.renderQuestion();

    } catch (error) {
      console.error('Failed to start study session:', error);
      this.showError('Failed to load questions. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Start a category in a specific mode (study, review, testprep)
   */
  async startCategoryMode(categoryId, mode) {
    // Store category context for the mode
    this.selectedCategoryId = categoryId;

    switch (mode) {
      case 'study':
        // Routes through StudyModeRouter (currently: map dungeon crawl)
        this.StudyModeRouter.start(this, categoryId);
        break;
      case 'review':
        // Switch to review mode and filter by category
        this.startReviewForCategory(categoryId);
        break;
      case 'testprep':
        // Test Prep = Quick and dirty, just questions on the page answered inline
        this.startTestPrepForCategory(categoryId);
        break;
    }
  }

  /**
   * Start Review mode for a specific category
   */
  async startReviewForCategory(categoryId) {
    try {
      // Load questions for this category
      const questions = await this.loadCategory(categoryId);

      // Switch to review module
      document.querySelectorAll('.module-container').forEach(m => m.classList.remove('active'));
      document.getElementById('module-review').classList.add('active');
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));

      // Initialize review with filtered questions
      if (window.reviewModule) {
        window.reviewModule.questions = questions;
        window.reviewModule.categoryFilter = categoryId;
        window.reviewModule.initReview();
      }
    } catch (error) {
      console.error('Failed to start review for category:', error);
      this.showError('Failed to load review questions.');
    }
  }

  /**
   * Start Simple Test Prep mode for a specific category
   * Shows all questions on page with inline answer feedback
   */
  async startTestPrepForCategory(categoryId) {
    try {
      this.showLoading(true);

      // Load all questions for this category
      const questions = await this.loadCategory(categoryId);
      const category = this.registry.categories.find(c => c.id === categoryId);

      // Create or get the simple test prep container
      let container = document.getElementById('simple-testprep-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'simple-testprep-container';
        container.className = 'simple-testprep-container';
        document.body.appendChild(container);
      }

      // Hide other modules
      document.querySelectorAll('.module-container').forEach(m => {
        m.classList.remove('active');
        m.style.display = 'none';
      });
      document.getElementById('landing').classList.add('hidden');

      // Build the simple test prep UI
      container.style.display = 'block';
      container.innerHTML = `
        <div class="simple-testprep-header">
          <button class="simple-testprep-back" data-action="exit-simple-testprep">← Back</button>
          <h1>📝 ${category ? category.name : 'Test Prep'}</h1>
          <div class="simple-testprep-score">
            <span id="simple-tp-correct">0</span> / <span id="simple-tp-total">${questions.length}</span> correct
          </div>
        </div>
        <div class="simple-testprep-questions" id="simple-tp-questions">
          ${questions.map((q, idx) => this.renderSimpleTestPrepQuestion(q, idx)).join('')}
        </div>
      `;

      // Attach event listeners after DOM insertion
      this.attachSimpleTestPrepEventListeners(container);

      // Track state
      this.simpleTestPrepState = {
        questions: questions,
        answered: new Set(),
        correct: 0
      };

    } catch (error) {
      console.error('Failed to start simple test prep:', error);
      this.showError('Failed to load test prep questions.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Render a single question for simple test prep
   */
  renderSimpleTestPrepQuestion(question, index) {
    const optionsHTML = question.options.map((opt, optIdx) => `
      <button class="simple-tp-option"
              data-action="answer-simple-testprep"
              data-question="${index}"
              data-option="${optIdx}">
        ${opt}
      </button>
    `).join('');

    // Support both 'q' (new format) and 'question' (old format) for question text
    const questionText = question.q || question.question || 'No question text';

    return `
      <div class="simple-tp-question" id="simple-tp-q-${index}">
        <div class="simple-tp-q-number">${index + 1}</div>
        <div class="simple-tp-q-content">
          <div class="simple-tp-q-text">${questionText}</div>
          <div class="simple-tp-options">${optionsHTML}</div>
          <div class="simple-tp-feedback" id="simple-tp-feedback-${index}" style="display:none;"></div>
        </div>
      </div>
    `;
  }

  /**
   * Handle answer in simple test prep
   */
  answerSimpleTestPrep(questionIdx, optionIdx) {
    if (!this.simpleTestPrepState || this.simpleTestPrepState.answered.has(questionIdx)) {
      return; // Already answered
    }

    const question = this.simpleTestPrepState.questions[questionIdx];
    const isCorrect = optionIdx === question.answer;

    // Mark as answered
    this.simpleTestPrepState.answered.add(questionIdx);

    // Update UI
    const questionEl = document.getElementById(`simple-tp-q-${questionIdx}`);
    const feedbackEl = document.getElementById(`simple-tp-feedback-${questionIdx}`);
    const options = questionEl.querySelectorAll('.simple-tp-option');

    // Disable all options and highlight correct/wrong
    options.forEach((opt, idx) => {
      opt.disabled = true;
      if (idx === question.answer) {
        opt.classList.add('correct');
      } else if (idx === optionIdx && !isCorrect) {
        opt.classList.add('wrong');
      }
    });

    // Show feedback
    if (isCorrect) {
      this.simpleTestPrepState.correct++;
      feedbackEl.innerHTML = `<span class="feedback-correct">✓ Correct!</span>`;
      feedbackEl.className = 'simple-tp-feedback correct';
    } else {
      feedbackEl.innerHTML = `<span class="feedback-wrong">✗ Wrong</span> — ${question.options[question.answer]}`;
      feedbackEl.className = 'simple-tp-feedback wrong';
    }
    feedbackEl.style.display = 'block';

    // Update score
    document.getElementById('simple-tp-correct').textContent = this.simpleTestPrepState.correct;

    // Track in persistence
    if (typeof persistence !== 'undefined') {
      persistence.recordAnswer(question.id, isCorrect);
    }
  }

  /**
   * Exit simple test prep
   */
  exitSimpleTestPrep() {
    const container = document.getElementById('simple-testprep-container');
    if (container) {
      container.style.display = 'none';
    }

    // Show landing
    document.getElementById('landing').classList.remove('hidden');
    this.simpleTestPrepState = null;
  }

  /**
   * Attach event listeners for simple test prep UI
   * Called after innerHTML insertion to comply with CSP (no inline onclick)
   */
  attachSimpleTestPrepEventListeners(container) {
    // Back button
    const backBtn = container.querySelector('[data-action="exit-simple-testprep"]');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.exitSimpleTestPrep());
    }

    // Answer buttons
    const answerBtns = container.querySelectorAll('[data-action="answer-simple-testprep"]');
    answerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const questionIdx = parseInt(btn.dataset.question, 10);
        const optionIdx = parseInt(btn.dataset.option, 10);
        this.answerSimpleTestPrep(questionIdx, optionIdx);
      });
    });
  }

  // ============================================
  // BOSS BATTLE SYSTEM
  // ============================================

  /**
   * Challenge a category boss
   * @param {string} categoryId - The category ID
   * @param {string} battleMode - 'quiz' (default) or 'cards' (Slay the Spire style)
   */
  async challengeBoss(categoryId, battleMode = 'quiz') {
    try {
      this.showLoading(true);

      // Verify boss is ready
      if (!persistence.isBossReady(categoryId)) {
        this.showError('You need 70% mastery before challenging the boss!');
        return;
      }

      // Get boss info
      const bossKey = typeof CATEGORY_BOSSES !== 'undefined' ? CATEGORY_BOSSES[categoryId] : null;
      const boss = typeof getCategoryBoss === 'function' ? getCategoryBoss(categoryId) : null;
      if (!boss) {
        this.showError('Boss not found for this category.');
        return;
      }

      // Record boss attempt
      persistence.recordBossAttempt(categoryId);

      // Card Battle Mode - use Slay the Spire style combat
      if (battleMode === 'cards' && typeof CardBattleUI !== 'undefined') {
        this.showLoading(false);

        // Initialize card deck if needed
        if (typeof CardSystem !== 'undefined') {
          CardSystem.initDeck();
        }

        // Start card battle
        CardBattleUI.startBattle(bossKey, categoryId);
        return;
      }

      // Quiz Battle Mode - traditional question-based combat
      // Load questions and select hardest 10
      const allQuestions = await this.loadCategory(categoryId);
      const bossQuestions = this.selectBossQuestions(allQuestions, 10);

      // Initialize boss state
      this.bossState = {
        categoryId: categoryId,
        boss: boss,
        questions: bossQuestions,
        currentQuestion: 0,
        playerLives: 3,
        bossHP: boss.maxHP,
        maxHP: boss.maxHP,
        phase: 1,
        lootEarned: [],
        damageDealt: 0,
        correctAnswers: 0
      };

      // Switch to boss arena
      document.getElementById('landing').classList.add('hidden');
      document.getElementById('studyView').classList.remove('active');
      document.getElementById('bossArena').classList.add('active');

      // Render boss arena
      this.renderBossArena();

    } catch (error) {
      console.error('Failed to start boss fight:', error);
      this.showError('Failed to load boss fight.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Select the hardest questions for boss fight
   */
  selectBossQuestions(questions, count = 10) {
    const history = persistence.data.questionHistory;

    // Score each question by difficulty
    const scored = questions.map(q => {
      const h = history[q.id];
      let score = 50; // Default middle difficulty

      if (!h) {
        score = 100; // Never seen = hardest
      } else if (h.attempts > 0) {
        const successRate = h.timesCorrect / h.attempts;
        score = 100 - (successRate * 100);
        // Boost recently wrong questions
        if (!h.correctFirstTry) score += 20;
      }

      return { question: q, score };
    });

    // Sort by difficulty (hardest first)
    scored.sort((a, b) => b.score - a.score);

    // Take top questions
    return scored.slice(0, count).map(s => s.question);
  }

  /**
   * Render boss arena
   */
  renderBossArena() {
    const state = this.bossState;
    const boss = state.boss;

    // Update boss display
    document.getElementById('bossSprite').innerHTML = `<span class="boss-emoji">${boss.emoji}</span>`;
    document.getElementById('bossName').textContent = boss.name;
    document.getElementById('bossSubtitle').textContent = boss.subtitle;

    // Update HP bar
    const hpPercent = (state.bossHP / state.maxHP) * 100;
    document.getElementById('bossHPFill').style.width = `${hpPercent}%`;
    document.getElementById('bossHPText').textContent = `${state.bossHP}/${state.maxHP}`;

    // Update player lives
    document.getElementById('playerLives').innerHTML = '❤️'.repeat(state.playerLives) + '🖤'.repeat(3 - state.playerLives);

    // Update progress
    document.getElementById('bossQNum').textContent = state.currentQuestion + 1;
    document.getElementById('bossQTotal').textContent = state.questions.length;

    // Render current question
    this.renderBossQuestion();
  }

  /**
   * Render current boss question
   */
  renderBossQuestion() {
    const state = this.bossState;
    const question = state.questions[state.currentQuestion];

    if (!question) {
      // No more questions - boss defeated!
      this.handleBossVictory();
      return;
    }

    const questionArea = document.getElementById('bossQuestionArea');
    const questionText = question.q || question.question || 'No question text';
    questionArea.innerHTML = `
      <div class="boss-question">
        <div class="question-text">${questionText}</div>
        <div class="boss-options">
          ${question.options.map((opt, i) => `
            <button class="boss-option" data-action="answer-boss-question" data-option="${i}">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Attach event listeners after DOM insertion
    this.attachBossQuestionEventListeners(questionArea);
  }

  /**
   * Handle answer to boss question
   */
  answerBossQuestion(optionIndex) {
    const state = this.bossState;
    const question = state.questions[state.currentQuestion];
    const isCorrect = optionIndex === question.correctIndex;

    // Get all option buttons
    const buttons = document.querySelectorAll('.boss-option');
    buttons.forEach(btn => btn.disabled = true);

    // Show correct/incorrect
    buttons[optionIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
      buttons[question.correctIndex].classList.add('correct');
    }

    // Prevent double-processing if already transitioning
    if (state.isTransitioning) {
      debugLog('[Boss] Ignoring input - transition in progress');
      return;
    }

    if (isCorrect) {
      state.correctAnswers++;

      // Calculate damage
      const baseDamage = 15;
      const statBonus = typeof d20System !== 'undefined' ? Math.floor(d20System.getStatModifier('intelligence') / 2) : 0;
      const damage = baseDamage + statBonus + Math.floor(Math.random() * 10);

      state.bossHP -= damage;
      state.damageDealt += damage;

      // Show damage feedback
      this.showBossDamage(damage);

      // Check for boss defeat
      if (state.bossHP <= 0) {
        state.bossHP = 0;
        state.isTransitioning = true; // Lock to prevent race conditions
        setTimeout(() => this.handleBossVictory(), 1500);
        return;
      }
    } else {
      // Wrong answer - lose a life
      state.playerLives--;

      // Boss attacks!
      this.showBossAttack();

      // Check for game over
      if (state.playerLives <= 0) {
        state.isTransitioning = true; // Lock to prevent race conditions
        setTimeout(() => this.handleBossDefeat(), 1500);
        return;
      }
    }

    // Update UI
    this.renderBossArena();

    // Lock during question transition to prevent double-clicks
    state.isTransitioning = true;

    // Next question after delay (with try-finally to ensure lock is released)
    setTimeout(() => {
      try {
        state.currentQuestion++;
        this.renderBossQuestion();
      } finally {
        state.isTransitioning = false; // Always unlock, even on error
      }
    }, 1500);
  }

  /**
   * Attach event listeners for boss question options
   * Called after innerHTML insertion to comply with CSP (no inline onclick)
   */
  attachBossQuestionEventListeners(questionArea) {
    const optionBtns = questionArea.querySelectorAll('[data-action="answer-boss-question"]');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const optionIdx = parseInt(btn.dataset.option, 10);
        this.answerBossQuestion(optionIdx);
      });
    });
  }

  /**
   * Show boss damage animation
   */
  showBossDamage(damage) {
    const sprite = document.getElementById('bossSprite');
    sprite.classList.add('boss-hit');
    setTimeout(() => sprite.classList.remove('boss-hit'), 300);

    // Floating damage number
    const dmgNum = document.createElement('div');
    dmgNum.className = 'damage-number';
    dmgNum.textContent = `-${damage}`;
    sprite.appendChild(dmgNum);
    setTimeout(() => dmgNum.remove(), 1000);
  }

  /**
   * Show boss attack animation
   */
  showBossAttack() {
    const arena = document.getElementById('bossArena');
    arena.classList.add('boss-attacking');
    setTimeout(() => arena.classList.remove('boss-attacking'), 500);
  }

  /**
   * Handle boss victory
   */
  handleBossVictory() {
    const state = this.bossState;

    // Mark boss as defeated
    persistence.defeatBoss(state.categoryId);

    // Generate loot
    let loot = [];
    if (typeof lootSystem !== 'undefined') {
      // Guaranteed rare+ drop
      const drop = lootSystem.generateDrop({ isCorrect: true, wasFirstTry: true, streak: 10 });
      if (drop) loot.push(drop);

      // Boss-specific unique chance
      const boss = state.boss;
      if (boss.lootTable && boss.lootTable.length > 0 && Math.random() < 0.3) {
        const uniqueKey = boss.lootTable[Math.floor(Math.random() * boss.lootTable.length)];
        // Add unique to inventory
        loot.push({ name: uniqueKey, rarity: 'UNIQUE' });
      }
    }

    // ARTISTRY ENGINE: Epic boss defeat celebration
    if (typeof ArtistryEngine !== 'undefined') {
      ArtistryEngine.bossDefeatCelebration(state.boss.name);
    }

    // Show victory screen
    const arena = document.getElementById('bossArena');
    arena.innerHTML = `
      <div class="boss-victory">
        <div class="victory-title">🏆 VICTORY! 🏆</div>
        <div class="boss-defeated">${state.boss.name} has been defeated!</div>
        <div class="boss-quote">"${state.boss.defeatQuote}"</div>
        <div class="victory-stats">
          <div>Damage Dealt: ${state.damageDealt}</div>
          <div>Questions Correct: ${state.correctAnswers}/${state.questions.length}</div>
          <div>Lives Remaining: ${'❤️'.repeat(state.playerLives)}</div>
        </div>
        ${loot.length > 0 ? `
          <div class="loot-earned">
            <div class="loot-title">Loot Earned:</div>
            ${loot.map(l => `<div class="loot-item">${l.name}</div>`).join('')}
          </div>
        ` : ''}
        <div class="unlock-message">
          <span class="unlock-icon">🔓</span>
          Next category unlocked!
        </div>
        <button class="victory-btn" data-action="exit-boss-arena">
          Continue
        </button>
      </div>
    `;

    // Attach event listener after DOM insertion
    const victoryBtn = arena.querySelector('[data-action="exit-boss-arena"]');
    if (victoryBtn) {
      victoryBtn.addEventListener('click', () => this.exitBossArena());
    }
  }

  /**
   * Handle boss defeat (player loses)
   */
  handleBossDefeat() {
    const state = this.bossState;

    // Roguelike reset - lose unequipped items
    const lost = persistence.roguelikeReset();

    // Show defeat screen
    const arena = document.getElementById('bossArena');
    arena.innerHTML = `
      <div class="boss-defeat">
        <div class="defeat-title">💀 DEFEATED 💀</div>
        <div class="boss-won">${state.boss.name} was victorious...</div>
        <div class="defeat-stats">
          <div>Damage Dealt: ${state.damageDealt}</div>
          <div>Questions Correct: ${state.correctAnswers}/${state.questions.length}</div>
        </div>
        ${lost.items.length > 0 || lost.goldLost > 0 ? `
          <div class="items-lost">
            <div class="lost-title">Items Lost:</div>
            ${lost.items.map(item => `<div class="lost-item">${item.name || 'Unknown Item'}</div>`).join('')}
            ${lost.goldLost > 0 ? `<div class="gold-lost">-${lost.goldLost} Gold</div>` : ''}
          </div>
        ` : '<div class="no-loss">Your equipped gear protected you from total loss.</div>'}
        <div class="retry-message">
          Study more to strengthen yourself, then try again!
        </div>
        <button class="defeat-btn" data-action="exit-boss-arena">
          Return to Study
        </button>
      </div>
    `;

    // Attach event listener after DOM insertion
    const defeatBtn = arena.querySelector('[data-action="exit-boss-arena"]');
    if (defeatBtn) {
      defeatBtn.addEventListener('click', () => this.exitBossArena());
    }
  }

  /**
   * Exit boss arena and return to category select
   */
  exitBossArena() {
    this.bossState = null;
    document.getElementById('bossArena').classList.remove('active');
    document.getElementById('bossArena').innerHTML = ''; // Clear arena
    document.getElementById('landing').classList.remove('hidden');

    // Refresh category buttons to show new unlock status
    this.setupCategoryButtons();
  }

  /**
   * Skip boss and unlock a category directly
   * Allows users to access topics they need without grinding
   */
  skipUnlockCategory(categoryId) {
    // Confirm skip
    const categoryName = this.getCategoryName(categoryId);

    // Unlock the category directly
    persistence.setCategoryStatus(categoryId, 'unlocked');

    // Show notification
    this.renderer.showNotification({
      icon: '🔓',
      title: 'Topic Unlocked!',
      message: `${categoryName} is now available to study.`,
      type: 'success'
    });

    // Refresh the category buttons
    this.setupCategoryButtons();
  }

  /**
   * Skip and unlock a specific bank (sub-category)
   */
  skipUnlockBank(categoryId, bankId) {
    const bankKey = bankId.replace('.', '-');
    persistence.unlockBank(bankKey);

    // Show notification
    this.renderer.showNotification({
      icon: '🔓',
      title: 'Topic Unlocked!',
      message: `${bankId} is now available to study.`,
      type: 'success'
    });

    // Refresh the category buttons
    this.setupCategoryButtons();
  }

  /**
   * Get human-readable category name
   */
  getCategoryName(categoryId) {
    const names = {
      '000': '611 Foundations',
      '100': '612.82 Brain',
      '200': '612.81 Nerves',
      '400': '611.018 Tissues',
      '500': '612.89 ANS',
      '600': '612.8 Senses',
      '700': '612.4 Endocrine',
      '800': '612.8L Lab Prep'
    };
    return names[categoryId] || `Category ${categoryId}`;
  }

  /**
   * Get the current question based on phase
   */
  getCurrentQuestion() {
    const main = this.currentQuiz[this.currentIdx];

    if (this.currentPhase === 'warmup1' && main.prereqs && main.prereqs[0]) {
      return main.prereqs[0];
    } else if (this.currentPhase === 'warmup2' && main.prereqs && main.prereqs[1]) {
      return main.prereqs[1];
    }

    return main;
  }

  /**
   * Check if current main question has warmups
   */
  hasWarmups() {
    const main = this.currentQuiz[this.currentIdx];
    // Must have at least 2 prereqs with actual question content
    return main.prereqs &&
           main.prereqs.length >= 2 &&
           main.prereqs[0]?.q &&
           main.prereqs[1]?.q;
  }

  /**
   * Render the current question
   */
  renderQuestion() {
    if (!this.renderer) return;

    const currentQ = this.getCurrentQuestion();
    const main = this.currentQuiz[this.currentIdx];
    const hasWarmups = this.hasWarmups();

    // Calculate display index based on phase
    // Count all questions: main questions count as 3 if they have warmups, 1 otherwise
    let displayIdx = 0;
    let totalDisplay = 0;

    // Calculate total questions including all warmups
    for (let i = 0; i < this.currentQuiz.length; i++) {
      const q = this.currentQuiz[i];
      const qHasWarmups = q.prereqs && q.prereqs.length >= 2 && q.prereqs[0]?.q && q.prereqs[1]?.q;
      totalDisplay += qHasWarmups ? 3 : 1;
    }

    // Calculate current position
    for (let i = 0; i < this.currentIdx; i++) {
      const q = this.currentQuiz[i];
      const qHasWarmups = q.prereqs && q.prereqs.length >= 2 && q.prereqs[0]?.q && q.prereqs[1]?.q;
      displayIdx += qHasWarmups ? 3 : 1;
    }

    // Add position within current question based on phase
    if (hasWarmups) {
      if (this.currentPhase === 'warmup1') displayIdx += 0;
      else if (this.currentPhase === 'warmup2') displayIdx += 1;
      else displayIdx += 2;
    }

    // Get explored options for current phase
    const phaseKey = `${this.currentIdx}-${this.currentPhase}`;
    const explored = this.exploredOptions[phaseKey] || [];

    // Track when question was displayed (for timing statistics)
    this.questionDisplayedAt = Date.now();

    // Check if battle mode should be used
    const useBattleMode = this.battleModeEnabled && typeof BattleScene !== 'undefined';

    if (useBattleMode) {
      // Use battle scene rendering with monster
      const container = document.getElementById('questionArea');
      if (!container) return;

      // Update progress bar
      this.renderer.updateProgress(displayIdx, totalDisplay, this.currentPhase);

      // Get category prefix for monster selection
      const categoryPrefix = main.id ? main.id.substring(0, 3) : '000';

      // Build question HTML using renderer's methods
      const optionsHTML = this.renderer.buildOptions(currentQ, explored);
      const introHTML = this.renderer.buildIntro(explored, this.currentPhase, currentQ.q);
      const warmupContextHTML = this.renderer.buildWarmupContext(this.currentPhase, hasWarmups ? main.q : null);
      const skipButtonHTML = this.renderer.buildSkipButton(this.currentPhase);
      const scaffoldButtonHTML = this.renderer.buildScaffoldButton(currentQ);

      // Phase badge
      let phaseBadge = '';
      if (this.currentPhase === 'warmup1') {
        phaseBadge = '<span class="phase-badge warmup">Warmup 1</span>';
      } else if (this.currentPhase === 'warmup2') {
        phaseBadge = '<span class="phase-badge warmup">Warmup 2</span>';
      } else {
        phaseBadge = '<span class="phase-badge main">Main Question</span>';
      }

      const questionHTML = `
        <div class="q-header">
          <div class="q-chapter">${this.renderer.escapeHtml(currentQ.chapter || '')}</div>
          ${phaseBadge}
        </div>
        ${warmupContextHTML}
        <div class="q-text">${this.renderer.renderText(currentQ.q)}</div>
        ${scaffoldButtonHTML}
        ${introHTML}
        <div class="options">${optionsHTML}</div>
        ${skipButtonHTML}
      `;

      // Warmups are scaffold phase, main question is limit break
      const isScaffold = this.currentPhase !== 'main';

      // Render battle frame with monster
      BattleScene.renderBattleFrame(container, main, questionHTML, isScaffold);
    } else {
      // Standard rendering without battle scene
      this.renderer.render(
        currentQ,
        displayIdx,
        totalDisplay,
        explored,
        this.currentPhase,
        hasWarmups ? main.q : null  // Pass main question text for context
      );
    }
  }

  /**
   * Explore an answer option
   */
  exploreOption(idx) {
    const phaseKey = `${this.currentIdx}-${this.currentPhase}`;
    const currentQ = this.getCurrentQuestion();
    const main = this.currentQuiz[this.currentIdx];
    const questionId = main.id || `q${this.currentIdx}`;

    // Track if this is the first exploration for this phase
    if (!this.firstExplorationPerPhase[phaseKey]) {
      this.firstExplorationPerPhase[phaseKey] = true;
    }

    if (!this.exploredOptions[phaseKey]) {
      this.exploredOptions[phaseKey] = [];
    }

    const isFirstExploration = this.exploredOptions[phaseKey].length === 0;
    const alreadyExplored = this.exploredOptions[phaseKey].includes(idx);

    if (!alreadyExplored) {
      this.exploredOptions[phaseKey].push(idx);
    }

    // Mark warmup as answered if correct answer was explored
    if (idx === currentQ.answer) {
      if (this.currentPhase === 'warmup1') this.warmupAnswered.warmup1 = true;
      if (this.currentPhase === 'warmup2') this.warmupAnswered.warmup2 = true;
    }

    // Gamification: Process correct/wrong answers (only for main phase, only once per question)
    if (this.currentPhase === 'main' && !this.correctAnswerProcessed[questionId]) {
      const isCorrect = idx === currentQ.answer;
      const exploredWrongFirst = this.exploredOptions[phaseKey].length > 1 ||
        (this.exploredOptions[phaseKey].length === 1 && !isCorrect);

      if (isCorrect) {
        // Process correct answer
        this.correctAnswerProcessed[questionId] = true;

        const completedWarmups = this.warmupAnswered.warmup1 && this.warmupAnswered.warmup2;
        const explorationCount = this.exploredOptions[phaseKey].length;

        // Extract category key from question ID (e.g., "100.1.01" -> "100")
        const categoryKey = main._category || (questionId.split('.')[0]) || null;

        const result = gamification.processCorrectAnswer(questionId, {
          completedWarmups,
          exploredWrongFirst,
          categoryKey
        });

        // Record to question statistics engine (for ZPD calibration)
        if (typeof questionStatistics !== 'undefined' && questionStatistics) {
          const timeToAnswerMs = this.questionDisplayedAt ? Date.now() - this.questionDisplayedAt : 0;
          questionStatistics.recordAnswer(
            questionId,
            idx,                    // selectedOption
            currentQ.answer,        // correctOption
            !exploredWrongFirst,    // wasCorrectFirstTry
            timeToAnswerMs,
            { categoryId: categoryKey, bankId: main._bank }
          );
        }

        // Learning Analytics: Record correct answer for mastery and review scheduling (Opportunities 1 & 2)
        if (typeof learningAnalytics !== 'undefined' && learningAnalytics) {
          // Record first correct if applicable
          if (!exploredWrongFirst) {
            learningAnalytics.recordFirstCorrect(questionId);
          }

          // Schedule for spaced repetition (correct answers extend interval)
          const reviewResult = learningAnalytics.scheduleReview(questionId, true);

          // Check for mastery achievement
          if (reviewResult.streak >= 5) {
            const isNewMastery = learningAnalytics.recordMastery(questionId);
            if (isNewMastery) {
              this.showMasteryToast(questionId);
            }
          }
        }

        // Engine Orchestrator: Process through game paths and teaching integrations
        if (typeof EngineOrchestrator !== 'undefined' && EngineOrchestrator.state?.initialized) {
          const timeToAnswerMs = this.questionDisplayedAt ? Date.now() - this.questionDisplayedAt : 0;
          const orchestratorResult = EngineOrchestrator.processAnswer(currentQ, {
            questionId,
            conceptId: currentQ.conceptId || categoryKey,
            categoryId: categoryKey,
            isCorrect: true,
            firstTry: !exploredWrongFirst,
            responseTimeMs: timeToAnswerMs,
            selectedAnswer: idx,
            correctAnswer: currentQ.answer,
            representationType: currentQ.representationType || 'text',
            masteryChange: 0.1
          });

          // Display any rewards earned
          if (orchestratorResult.rewards?.length > 0) {
            orchestratorResult.rewards.forEach(reward => {
              if (reward.type === 'curiosity' && reward.amount > 0) {
                this.renderer.showMinorReward(reward.message || `+${reward.amount} Curiosity`);
              }
            });
          }
        }

        // SHOCKWAVE ARCADE JUICE: Visual + Audio feedback
        if (typeof ScreenEffects !== 'undefined') {
          const questionCard = document.querySelector('.question-card');
          ScreenEffects.flashCorrect(questionCard);
        }
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.playCorrect();
        }

        // ARTISTRY ENGINE: Enhanced visual feedback
        if (typeof ArtistryEngine !== 'undefined') {
          // Show correct button juice
          const selectedBtn = document.querySelector(`.option-btn[data-index="${idx}"], .answer-btn[data-index="${idx}"]`);
          if (selectedBtn) {
            ArtistryEngine.showCorrectFeedback(selectedBtn);
            ArtistryEngine.disableOtherButtons(selectedBtn);
          }
          // Update streak visualization
          ArtistryEngine.updateStreakVisuals(result.streak || 0);
        }

        // Update scaffolding with answer
        const scaffoldAdvice = scaffolding.recordAnswer(questionId, !exploredWrongFirst, explorationCount);
        this.currentScaffoldAdvice = scaffoldAdvice;

        // Update D20 character stats
        const streakLength = persistence.getStreak();
        d20System.updateStats({
          wasCorrect: true,
          wasFirstTry: !exploredWrongFirst,
          explorationCount,
          streakLength
        });

        // Battle Scene: Player attacks monster on correct answer
        if (this.battleModeEnabled && typeof BattleScene !== 'undefined' && BattleScene.battleActive) {
          const attackResult = BattleScene.playerAttack();
          // Monster defeated triggers victory
          if (attackResult.monsterDefeated) {
            setTimeout(() => {
              BattleScene.showVictorySequence();
            }, 1000);
          }
        }

        // Complete encounter
        if (this.currentEncounter) {
          const encounterResult = d20System.completeEncounter(this.currentEncounter, true);
          // Apply encounter XP multiplier (already factored into gamification)
        }

        // Roll for loot drops
        const lootDrops = lootSystem.rollLoot({
          wasCorrect: true,
          wasFirstTry: !exploredWrongFirst,
          streakLength,
          isCritical: false, // Could check d20 roll
          isRevengeSuccess: result.isRevenge,
          playerLevel: persistence.getPlayer().level
        });

        if (lootDrops.length > 0) {
          setTimeout(() => {
            this.renderer.showLootDrop(lootDrops);
          }, result.xp.isLuckyStrike ? 3500 : 2500);
        }

        // Update stats bar
        this.renderer.renderStatsBar();

        // Show XP popup
        const streakMessage = gamification.getStreakMessage(result.streak);
        this.renderer.showXPPopup(result.xp, streakMessage, result.isRevenge);

        // Show achievements
        for (const achievement of result.newAchievements) {
          this.renderer.showAchievement(achievement);
        }

        // Check for level up
        const newLevel = persistence.getPlayer().level;
        if (newLevel > this.previousLevel) {
          setTimeout(() => {
            this.renderer.showLevelUp(newLevel);
          }, 2500);
          this.previousLevel = newLevel;
        }

      } else if (isFirstExploration && !alreadyExplored) {
        // First exploration was wrong - process wrong answer, break streak, trigger scaffolds
        debugLog('[Quiz] First wrong answer detected - triggering scaffolds');

        // Record for scaffolding system
        const explorationCount = this.exploredOptions[phaseKey].length;
        const scaffoldAdvice = scaffolding.recordAnswer(questionId, false, explorationCount);
        this.currentScaffoldAdvice = scaffoldAdvice;

        // Process wrong answer in gamification (breaks streak)
        const result = gamification.processWrongAnswer(questionId);

        // Record to question statistics engine (for ZPD calibration)
        if (typeof questionStatistics !== 'undefined' && questionStatistics) {
          const timeToAnswerMs = this.questionDisplayedAt ? Date.now() - this.questionDisplayedAt : 0;
          const categoryKey = main._category || (questionId.split('.')[0]) || null;
          questionStatistics.recordAnswer(
            questionId,
            idx,                    // selectedOption (wrong)
            currentQ.answer,        // correctOption
            false,                  // wasCorrectFirstTry = false
            timeToAnswerMs,
            { categoryId: categoryKey, bankId: main._bank, wrongOptionIndex: idx }
          );
        }

        // Add to wrong queue for spaced repetition
        if (typeof persistence !== 'undefined' && persistence.addToWrongQueue) {
          persistence.addToWrongQueue(questionId);
        }

        // Learning Analytics: Record misconception and schedule review (Opportunities 1 & 2)
        if (typeof learningAnalytics !== 'undefined' && learningAnalytics) {
          // Record misconception for trajectory tracking (Opportunity 1)
          const shift = learningAnalytics.recordMisconception(questionId, idx, currentQ);

          // If conceptual shift detected, show celebration toast
          if (shift) {
            this.showConceptualShiftToast(shift);
          }

          // Schedule for spaced repetition review (Opportunity 2)
          learningAnalytics.scheduleReview(questionId, false);
        }

        // Engine Orchestrator: Process wrong answer through game paths and teaching integrations
        if (typeof EngineOrchestrator !== 'undefined' && EngineOrchestrator.state?.initialized) {
          const timeToAnswerMs = this.questionDisplayedAt ? Date.now() - this.questionDisplayedAt : 0;
          const categoryKey = main._category || (questionId.split('.')[0]) || null;
          EngineOrchestrator.processAnswer(currentQ, {
            questionId,
            conceptId: currentQ.conceptId || categoryKey,
            categoryId: categoryKey,
            isCorrect: false,
            firstTry: true,  // First try was wrong
            responseTimeMs: timeToAnswerMs,
            selectedAnswer: idx,
            correctAnswer: currentQ.answer,
            representationType: currentQ.representationType || 'text',
            masteryChange: -0.05
          });
        }

        // SHOCKWAVE ARCADE JUICE: Visual + Audio feedback for wrong answer
        if (typeof ScreenEffects !== 'undefined') {
          const questionCard = document.querySelector('.question-card');
          ScreenEffects.flashWrong(questionCard);
          ScreenEffects.shake('normal');
        }
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.playWrong();
        }

        // ARTISTRY ENGINE: Enhanced wrong answer feedback
        if (typeof ArtistryEngine !== 'undefined') {
          const selectedBtn = document.querySelector(`.option-btn[data-index="${idx}"], .answer-btn[data-index="${idx}"]`);
          if (selectedBtn) {
            ArtistryEngine.showWrongFeedback(selectedBtn);
          }
          // Reset streak visualization
          ArtistryEngine.updateStreakVisuals(0);
        }

        if (result.streakBroken) {
          this.renderer.showStreakBroken(result.previousStreak);
          this.renderer.renderStatsBar();
        }

        // Battle Scene: Monster attacks player on wrong answer
        if (this.battleModeEnabled && typeof BattleScene !== 'undefined' && BattleScene.battleActive) {
          BattleScene.animateMonsterAttack();
        }

        // Trigger scaffold remediation (pass wrong option index for statistics-based selection)
        this.triggerScaffoldRemediation(currentQ, idx);
        return; // Don't render normal question - scaffold flow takes over
      }
    }

    this.renderQuestion();
  }

  /**
   * Trigger scaffold remediation after wrong answer
   * @param {object} wrongQuestion - The question that was answered incorrectly
   * @param {number} wrongOptionIndex - Index of the wrong option selected (for statistics-based scaffold selection)
   */
  async triggerScaffoldRemediation(wrongQuestion, wrongOptionIndex = null) {
    debugLog('[Scaffold] Triggering remediation for:', wrongQuestion.id, 'wrong option:', wrongOptionIndex);

    // Store wrong option index for scaffold selection
    this.lastWrongOptionIndex = wrongOptionIndex;

    if (!scaffoldRemediation) {
      console.error('[Scaffold] scaffoldRemediation not initialized!');
      this.renderQuestion();
      return;
    }

    // Calculate damage
    let damageResult;
    try {
      damageResult = scaffoldRemediation.calculateDamage();
      debugLog('[Scaffold] Damage calculated:', damageResult);
    } catch (e) {
      console.error('[Scaffold] Damage calculation failed:', e);
      this.renderQuestion();
      return;
    }

    // Show damage roll animation (use arrow function to preserve 'this')
    this.renderer.showDamageRoll(damageResult, async () => {
      debugLog('[Scaffold] Damage animation complete, starting scaffold session');

      try {
        // Apply damage
        const hpResult = scaffoldRemediation.applyDamage(damageResult.finalDamage);
        debugLog('[Scaffold] HP result:', hpResult);

        // Check for knockout
        if (hpResult.isKnockout) {
          this.renderer.showKnockout();
        }

        // Update HP bar
        this.renderer.renderStatsBar();

        // Start scaffold session (pass wrong option index for statistics-based selection)
        const session = await scaffoldRemediation.startSession(wrongQuestion, damageResult, this.lastWrongOptionIndex);
        debugLog('[Scaffold] Session started:', session);

        if (session) {
          // Enter scaffold phase
          this.currentPhase = 'scaffold';
          this.scaffoldExploredOptions = [];
          this.renderScaffoldQuestion();
        } else {
          console.warn('[Scaffold] No session created, falling back');
          // Fallback if no scaffold questions available
          this.renderQuestion();
        }
      } catch (e) {
        console.error('[Scaffold] Error in scaffold flow:', e);
        this.renderQuestion();
      }
    });
  }

  /**
   * Render current scaffold question
   */
  renderScaffoldQuestion() {
    const session = scaffoldRemediation.getSessionState();
    if (!session) return;

    const scaffoldKey = `scaffold-${session.currentIndex}`;
    if (!this.scaffoldExploredOptions) {
      this.scaffoldExploredOptions = [];
    }

    // Track when scaffold question was displayed (for insight detection timing)
    this.scaffoldDisplayedAt = Date.now();

    this.renderer.renderScaffoldQuestion(
      session.currentQuestion,
      session.currentIndex,
      this.scaffoldExploredOptions
    );
  }

  /**
   * Explore a scaffold question option
   *
   * Phase 1 Enhancement: Passes timing and option info for insight detection.
   */
  exploreScaffoldOption(idx) {
    const session = scaffoldRemediation.getSessionState();
    if (!session) return;

    const currentQ = session.currentQuestion;
    const alreadyExplored = this.scaffoldExploredOptions.includes(idx);

    if (!alreadyExplored) {
      this.scaffoldExploredOptions.push(idx);
    }

    // Check if correct answer found (first try)
    const isCorrect = idx === currentQ.answer;
    const isFirstTry = this.scaffoldExploredOptions.length === 1 && isCorrect;

    if (isCorrect && !alreadyExplored) {
      // Calculate time to answer for insight detection
      const timeToAnswerMs = this.scaffoldDisplayedAt ? Date.now() - this.scaffoldDisplayedAt : 0;

      // Record result with timing and selected option (Phase 1 enhancement)
      const result = scaffoldRemediation.recordScaffoldResult(isFirstTry, timeToAnswerMs, idx);

      if (result.healResult && result.healResult.healed > 0) {
        this.renderer.showScaffoldHeal(result.healResult);
        this.renderer.renderStatsBar();
      }

      // Log insight evaluation for debugging
      if (result.insightEvaluation) {
        debugLog('[Quiz] Scaffold insight evaluation:', result.insightEvaluation);
      }
    }

    // Re-render scaffold to show feedback
    this.renderScaffoldQuestion();
  }

  /**
   * Move to next scaffold question
   *
   * Phase 1 Enhancement: Uses insight-based completion with Ms. Luminara exit messages.
   */
  nextScaffold() {
    const result = scaffoldRemediation.nextScaffold();

    if (result.completed) {
      // Scaffolding complete - show completion with exit message
      this.renderer.showScaffoldComplete(result);
      this.currentPhase = 'main';
      this.scaffoldExploredOptions = [];
      this.scaffoldDisplayedAt = null;

      // Log the completion reason for analytics
      debugLog(`[Quiz] Scaffold session completed: ${result.exitReason}, depth=${result.scaffoldDepth}, insight=${result.insightAchieved}`);

      // Show mechanism tour if available (especially when insight wasn't achieved)
      const triggerQuestion = scaffoldRemediation.activeSession?.triggerQuestion;
      const shouldShowMechanismTour = !result.insightAchieved && triggerQuestion?.mechanism;

      if (shouldShowMechanismTour && typeof LessonModal !== 'undefined') {
        // Show mechanism tour after scaffold summary closes
        const self = this;
        setTimeout(() => {
          LessonModal.showScaffoldSummary(triggerQuestion, result, function() {
            self.nextQuestion();
          });
        }, result.insightAchieved ? 2500 : 2000);
      } else {
        // Move to next question (longer delay if insight achieved for impact)
        const delay = result.insightAchieved ? 2500 : 2000;
        setTimeout(() => {
          this.nextQuestion();
        }, delay);
      }
    } else {
      // More scaffolds to go
      this.scaffoldExploredOptions = [];

      // Show progress message if available (from insight detection)
      if (result.progressMessage) {
        debugLog('[Quiz] Progress message:', result.progressMessage);
        // The renderer could show this if we want intermediate feedback
      }

      this.renderScaffoldQuestion();
    }
  }

  /**
   * Allow user to soft-exit from scaffolding (after minimum is reached)
   *
   * Phase 1 Enhancement: Graceful exit path.
   */
  softExitScaffold() {
    if (!scaffoldRemediation.canSoftExit()) {
      debugLog('[Quiz] Cannot soft exit yet - minimum scaffolds not reached');
      return false;
    }

    const triggerQuestion = scaffoldRemediation.activeSession?.triggerQuestion;
    const result = scaffoldRemediation.softExit();
    if (result && result.completed) {
      this.renderer.showScaffoldComplete(result);
      this.currentPhase = 'main';
      this.scaffoldExploredOptions = [];
      this.scaffoldDisplayedAt = null;

      // Show mechanism tour on soft exit (learner chose to stop early, might need the explanation)
      if (triggerQuestion?.mechanism && typeof LessonModal !== 'undefined') {
        const self = this;
        setTimeout(() => {
          LessonModal.showScaffoldSummary(triggerQuestion, result, function() {
            self.nextQuestion();
          });
        }, 2000);
      } else {
        setTimeout(() => {
          this.nextQuestion();
        }, 2000);
      }
      return true;
    }
    return false;
  }

  /**
   * Show conceptual shift celebration toast (Opportunity 1)
   *
   * When the learner's misconception pattern changes, this indicates
   * their mental model is being restructured - that's progress!
   */
  showConceptualShiftToast(shift) {
    if (!shift || typeof learningAnalytics === 'undefined') return;

    const message = learningAnalytics.getConceptualShiftMessage(shift);

    const toast = document.createElement('div');
    toast.className = 'conceptual-shift-toast';
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">🔄</span>
        <span class="toast-title">Thinking Evolved</span>
      </div>
      <div class="toast-message">${this.renderer.escapeHtml(message)}</div>
    `;

    document.body.appendChild(toast);

    // Mark as celebrated
    learningAnalytics.markShiftCelebrated(shift.questionId || this.getCurrentQuestionId());

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'toast-slide-up 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Show mastery achievement toast (Opportunity 2 - spaced repetition)
   *
   * When a question reaches 5+ correct streak, it's mastered.
   */
  showMasteryToast(questionId) {
    if (typeof learningAnalytics === 'undefined') return;

    const message = learningAnalytics.getMasteryCelebrationMessage();

    const toast = document.createElement('div');
    toast.className = 'conceptual-shift-toast'; // Reuse same styling
    toast.style.borderColor = 'var(--gold)';
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-icon">⭐</span>
        <span class="toast-title" style="color: var(--gold)">Mastered!</span>
      </div>
      <div class="toast-message">${this.renderer.escapeHtml(message)}</div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'toast-slide-up 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Get current question ID helper
   */
  getCurrentQuestionId() {
    const current = this.currentQuiz[this.currentIdx];
    return current?.id || null;
  }

  /**
   * Navigate to the next question/phase
   */
  nextQuestion() {
    const hasWarmups = this.hasWarmups();

    if (hasWarmups) {
      // Progress through phases: warmup1 -> warmup2 -> main -> next question
      if (this.currentPhase === 'warmup1') {
        this.currentPhase = 'warmup2';
        this.renderQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else if (this.currentPhase === 'warmup2') {
        this.currentPhase = 'main';
        this.renderQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Move to next main question
    if (this.currentIdx < this.currentQuiz.length - 1) {
      this.currentIdx++;
      this.currentPhase = this.hasWarmups() ? 'warmup1' : 'main';
      this.warmupAnswered = { warmup1: false, warmup2: false };
      this.startEncounter(); // Start new encounter for next question
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.finishSession();
    }
  }

  /**
   * Finish the study session and show summary
   */
  finishSession() {
    const summary = persistence.endSession();

    // ARTISTRY ENGINE: Show victory celebration based on performance
    if (typeof ArtistryEngine !== 'undefined') {
      const accuracy = summary.correct / Math.max(1, summary.answered);
      if (accuracy >= 0.95) {
        ArtistryEngine.perfectWinCelebration();
      } else if (accuracy >= 0.8) {
        ArtistryEngine.goodWinCelebration();
      } else {
        ArtistryEngine.basicWinCelebration();
      }
      ArtistryEngine.showTransition('session-end');
    }

    this.renderer.showSessionSummary(summary, this.achievements);
  }

  /**
   * Start a new encounter for current question
   */
  startEncounter() {
    const main = this.currentQuiz[this.currentIdx];
    const topicPrefix = main.id ? main.id.split('.').slice(0, 2).join('.') : 'unknown';

    this.currentEncounter = d20System.createEncounter(main, topicPrefix);

    // Show encounter banner
    this.renderer.showEncounterBanner(this.currentEncounter);
  }

  /**
   * Roll for insight (skill check for hint)
   */
  rollForInsight() {
    const currentQ = this.getCurrentQuestion();

    this.renderer.showSkillCheckPrompt('Roll for Insight', 1, () => {
      const result = d20System.insightCheck('medium');

      // Show the dice roll
      this.renderer.showDiceRoll(result.roll, 'Wisdom Check');

      // After dice animation, show result
      setTimeout(() => {
        const hint = this.getHintByQuality(currentQ, result.hintQuality);
        this.renderer.showInsightCheckResult(result, hint);
        this.renderer.renderStatsBar();
      }, 1500);
    });
  }

  /**
   * Get hint based on quality from insight check
   */
  getHintByQuality(question, quality) {
    switch (quality) {
      case 'perfect':
        // Reveal the mechanism if available
        if (question.mechanism) {
          return `The key lies in ${question.mechanism.title}. ${question.mechanism.content.slice(0, 150)}...`;
        }
        return `Look carefully at ${question.options[question.answer]}. This is the path.`;

      case 'excellent':
        // Strong directional hint
        const wrongOptions = question.options.filter((_, i) => i !== question.answer);
        return `I can tell you that "${wrongOptions[0]}" is definitely not the answer. Focus elsewhere.`;

      case 'good':
        // Basic helpful hint
        if (question.optionExplains) {
          const correctExplain = question.optionExplains[question.answer];
          if (correctExplain) {
            return `Think about this: ${correctExplain.text.slice(0, 100)}...`;
          }
        }
        return 'Consider the underlying mechanism. What must physically happen?';

      case 'vague':
        return 'The answer is there... somewhere. Trust your instincts.';

      case 'misleading':
      default:
        return 'The spirits are unclear. Perhaps another approach?';
    }
  }

  /**
   * Attempt to save streak with charisma save
   */
  attemptStreakSave(currentStreak, onResult) {
    this.renderer.showStreakSavePrompt(currentStreak, (attemptSave) => {
      if (!attemptSave) {
        onResult(false);
        return;
      }

      // Safety check for d20System module
      if (typeof d20System === 'undefined' || !d20System.streakSavingThrow) {
        console.warn('[Quiz] d20System not available for streak save');
        onResult(false);
        return;
      }

      const result = d20System.streakSavingThrow(currentStreak);

      if (!result.canAttempt) {
        onResult(false);
        return;
      }

      // Show the dice roll
      this.renderer.showDiceRoll(result.roll, 'Charisma Save');

      setTimeout(() => {
        this.renderer.renderStatsBar();
        onResult(result.success);
      }, 2000);
    });
  }

  /**
   * Navigate to the previous question/phase
   */
  prevQuestion() {
    const hasWarmups = this.hasWarmups();

    if (hasWarmups) {
      // Go back through phases: main -> warmup2 -> warmup1 -> previous question
      if (this.currentPhase === 'main') {
        this.currentPhase = 'warmup2';
        this.renderQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else if (this.currentPhase === 'warmup2') {
        this.currentPhase = 'warmup1';
        this.renderQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Move to previous main question
    if (this.currentIdx > 0) {
      this.currentIdx--;
      // Go to the main phase of previous question
      this.currentPhase = 'main';
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Skip warmups and go directly to main question
   */
  skipToMain() {
    this.currentPhase = 'main';
    this.renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Return to the home screen
   */
  goHome() {
    document.getElementById('studyView').classList.remove('active');
    document.getElementById('landing').classList.remove('hidden');
    this.exploredOptions = {};
    this.currentPhase = 'main';
    this.renderer.renderLandingStats();

    // Show appropriate navigation level based on current state
    if (this.currentCourse) {
      // If a course is selected, show topic selection
      document.getElementById('subjectSelect').classList.add('hidden');
      document.getElementById('courseSelect').classList.add('hidden');
      document.getElementById('topicSelect').classList.remove('hidden');
    } else if (this.currentSubject) {
      // If only subject selected, show course selection
      document.getElementById('subjectSelect').classList.add('hidden');
      document.getElementById('courseSelect').classList.remove('hidden');
      document.getElementById('topicSelect').classList.add('hidden');
    } else {
      // Show subject selection
      document.getElementById('subjectSelect').classList.remove('hidden');
      document.getElementById('courseSelect').classList.add('hidden');
      document.getElementById('topicSelect').classList.add('hidden');
    }
  }

  /**
   * Show/hide loading state
   */
  showLoading(show) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.toggle('hidden', !show);
    }
  }

  /**
   * Show an error message
   */
  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    } else {
      alert(message);
    }
  }
}

// Global instance
let quiz;
// Note: Module globals (gamification, scaffolding, d20System, lootSystem, etc.)
// are declared in their respective module files (820.31.3, 820.31.6, 820.31.7, etc.)

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  quiz = new LuminaraQuiz();
  quiz.init();
});

// Global navigation functions for button onclick handlers
function exploreOption(idx) { quiz.exploreOption(idx); }
function exploreScaffoldOption(idx) { quiz.exploreScaffoldOption(idx); }
function nextScaffold() { quiz.nextScaffold(); }
function nextQuestion() { quiz.nextQuestion(); }
function prevQuestion() { quiz.prevQuestion(); }
function skipToMain() { quiz.skipToMain(); }
function goHome() { quiz.goHome(); }

// Session summary handlers
function closeSummaryAndGoHome() {
  document.querySelector('.session-summary')?.remove();
  quiz.goHome();
}

function closeSummaryAndContinue() {
  document.querySelector('.session-summary')?.remove();
  // Reset state for a new session but keep the same category
  if (quiz.currentQuiz.length > 0) {
    quiz.currentIdx = 0;
    quiz.currentPhase = quiz.hasWarmups() ? 'warmup1' : 'main';
    quiz.exploredOptions = {};
    quiz.correctAnswerProcessed = {};
    quiz.firstExplorationPerPhase = {};
    quiz.warmupAnswered = { warmup1: false, warmup2: false };
    persistence.startSession();
    scaffolding.resetSessionCounters();
    quiz.previousLevel = persistence.getPlayer().level;
    quiz.startEncounter();
    quiz.renderQuestion();
    quiz.renderer.renderStatsBar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    quiz.goHome();
  }
}

// Extend LuminaraQuiz with equipment methods
LuminaraQuiz.prototype.equipItem = function(itemId) {
  const item = lootSystem.getInventory().find(i => i.id === itemId);
  if (item) {
    lootSystem.equipItem(item);
  }
};

LuminaraQuiz.prototype.unequipItem = function(slot) {
  lootSystem.unequipItem(slot);
};

LuminaraQuiz.prototype.sellItem = function(itemId) {
  const item = lootSystem.getInventory().find(i => i.id === itemId);
  if (item) {
    // Use loot system's method if available, otherwise calculate locally
    const price = typeof lootSystem.getItemSellPrice === 'function'
      ? lootSystem.getItemSellPrice(item)
      : lootSystem.calculateSellPrice(item);
    lootSystem.data.gold += price;
    lootSystem.removeFromInventory(itemId);
    lootSystem.save();
  }
};

// Safe wrapper for opening character sheet (called from onclick handlers)
LuminaraQuiz.prototype.openCharacterSheet = function() {
  try {
    if (typeof d20System !== 'undefined' && d20System && this.renderer) {
      const sheet = d20System.getCharacterSheet();
      if (sheet) {
        this.renderer.showCharacterSheet(sheet);
      }
    }
  } catch (e) {
    console.warn('[D20] Error opening character sheet:', e);
  }
};

// Safe wrapper for opening inventory (called from onclick handlers)
LuminaraQuiz.prototype.openInventory = function() {
  try {
    if (this.renderer && typeof this.renderer.showInventory === 'function') {
      this.renderer.showInventory();
    }
  } catch (e) {
    console.warn('[D20] Error opening inventory:', e);
  }
};

// ═══════════════════════════════════════════════════════════════
// GAUNTLET MODE - Extracted to 820.31.1.2-quiz-gauntlet.js
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// TEST PREP MODE - Extracted to 820.31.1.4-quiz-testprep.js
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════════
// MAP MODE - Extracted to 820.31.1.3-quiz-map.js
// ═══════════════════════════════════════════════════════════════════════════

