# Ms. Luminara Quiz Engine: Question Systems Comprehensive Audit

**Date**: 2026-03-30
**Purpose**: Complete landscape analysis before designing unified question orchestrator
**Status**: CRITICAL - Multiple overlapping systems with inconsistent loading patterns

---

## Executive Summary

The Quiz Engine has **7 distinct question-related subsystems** with **significant overlap** and **no central orchestrator**. This creates:

- **Race conditions** in async loading
- **Duplicate question loading logic** (5+ different implementations)
- **Inconsistent caching** across systems
- **No single source of truth** for question state
- **Competing statistics/ZPD calculations**

**Recommendation**: Build a **unified QuestionOrchestrator** to centralize all question operations.

---

## 1. QUESTION LOADING METHODS

### 1.1 Primary Question Loading (820.31.1-app.js)

**Location**: Lines 190-375

#### `loadRegistry()`
- **Purpose**: Load category/bank structure from registry JSON
- **Parameters**: None
- **Returns**: Sets `this.registry` with category structure
- **Callers**: Application initialization
- **Key behavior**:
  - Tries fetch first (HTTP server mode)
  - Falls back to embedded registry (file:// protocol)
  - No error handling if both fail

```javascript
// Lines 190-258
async loadRegistry() {
  try {
    const response = await fetch('820.31-core/820.31-question-registry.json');
    if (response.ok) {
      this.registry = await response.json();
      return;
    }
  } catch (e) {
    debugLog('Fetch failed, using embedded registry');
  }
  // Embedded fallback omitted for brevity
}
```

#### `loadQuestionBank(categoryId, bankId)`
- **Purpose**: Load a specific question bank JSON file
- **Parameters**:
  - `categoryId` - Category ID (e.g., "100", "200")
  - `bankId` - Bank ID (e.g., "100.1", "100.2")
- **Returns**: Promise<QuestionBankData>
- **Callers**: `loadCategory()`, user bank selection
- **Caching**: `this.questionBanks[cacheKey]` where `cacheKey = "${categoryId}-${bankId}"`
- **Key behavior**:
  - Checks cache first
  - Tries fetch (HTTP mode)
  - Falls back to `loadJsonViaScript()` (file:// mode)
  - Caches result

```javascript
// Lines 263-294
async loadQuestionBank(categoryId, bankId) {
  const cacheKey = `${categoryId}-${bankId}`;
  if (this.questionBanks[cacheKey]) {
    return this.questionBanks[cacheKey];
  }

  const category = this.registry.categories.find(c => c.id === categoryId);
  const bank = category.banks.find(b => b.id === bankId);
  const path = `${category.folder}/${bank.file}`;

  try {
    const response = await fetch(path);
    if (response.ok) {
      const data = await response.json();
      this.questionBanks[cacheKey] = data;
      return data;
    }
  } catch (e) {
    // Fall back to script loading
  }

  const data = await this.loadJsonViaScript(path, bankId.replace('.', '_'));
  this.questionBanks[cacheKey] = data;
  return data;
}
```

#### `loadScaffoldsForQuestion(question, categoryFolder)`
- **Purpose**: Lazy load prerequisite/scaffold questions for a main question
- **Parameters**:
  - `question` - Question object
  - `categoryFolder` - Path to category folder
- **Returns**: Promise<Array<ScaffoldQuestion>>
- **Callers**: Question rendering, warmup display
- **Key behavior**:
  - Returns cached `question.prereqs` if present
  - Fetches from `question.scaffoldFile` if specified
  - Caches result on question object
  - Returns empty array if unavailable

```javascript
// Lines 300-326
async loadScaffoldsForQuestion(question, categoryFolder) {
  if (question.prereqs && question.prereqs.length > 0) {
    return question.prereqs;
  }

  if (!question.scaffoldFile) {
    return [];
  }

  try {
    const scaffoldPath = `${categoryFolder}/${question.scaffoldFile}`;
    const response = await fetch(scaffoldPath);
    if (response.ok) {
      const scaffoldData = await response.json();
      question.prereqs = scaffoldData.scaffolds || [];
      return question.prereqs;
    }
  } catch (e) {
    debugLog(`[Scaffold] Failed to load ${question.scaffoldFile}:`, e.message);
  }

  return [];
}
```

#### `loadCategory(categoryId)`
- **Purpose**: Load ALL banks for a category
- **Parameters**: `categoryId`
- **Returns**: Promise<Array<Question>>
- **Callers**: Category selection, full category load
- **Key behavior**:
  - Loads each bank sequentially
  - Flattens all questions into single array
  - Tags questions with `_categoryFolder` for scaffold loading

```javascript
// Lines 359-375
async loadCategory(categoryId) {
  const category = this.registry.categories.find(c => c.id === categoryId);
  const questions = [];

  for (const bank of category.banks) {
    const data = await this.loadQuestionBank(categoryId, bank.id);
    data.questions.forEach(q => {
      q._categoryFolder = category.folder;
    });
    questions.push(...data.questions);
  }

  return questions;
}
```

**Issues**:
- ❌ No centralized cache management
- ❌ Mutates question objects (`q._categoryFolder`)
- ❌ Sequential loading (slow for categories with many banks)
- ❌ No loading state/progress tracking

---

### 1.2 Scaffold Remediation Loading (820.31.14-scaffold-remediation.js)

**Location**: Lines 243-266

#### `loadVocabularyBank(categoryPrefix)`
- **Purpose**: Load vocabulary bank for scaffolding after wrong answers
- **Parameters**: `categoryPrefix` - Category ID ("000", "100", etc.)
- **Returns**: Promise<VocabularyBank>
- **Callers**: `selectScaffoldQuestions()`
- **Caching**: `this.vocabBankCache[categoryPrefix]`
- **Key behavior**:
  - Checks cache first
  - Fetches from hardcoded VOCAB_BANK_MAP
  - Caches on success

```javascript
// Lines 243-266
async loadVocabularyBank(categoryPrefix) {
  if (this.vocabBankCache[categoryPrefix]) {
    return this.vocabBankCache[categoryPrefix];
  }

  const mapping = this.VOCAB_BANK_MAP[categoryPrefix];
  if (!mapping) {
    console.warn(`No vocabulary bank for category ${categoryPrefix}`);
    return null;
  }

  try {
    const response = await fetch(`${mapping.folder}/${mapping.file}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const bank = await response.json();
    this.vocabBankCache[categoryPrefix] = bank;
    return bank;
  } catch (e) {
    console.error(`Failed to load vocabulary bank for ${categoryPrefix}:`, e);
    return null;
  }
}
```

**Hardcoded Vocabulary Bank Map**:
```javascript
// Lines 50-59
this.VOCAB_BANK_MAP = {
  '000': { folder: '611-anatomy/611-foundations', file: '000.5-vocabulary.json' },
  '100': { folder: '612-physiology/612.82-brain', file: '100.5-vocabulary.json' },
  '200': { folder: '612-physiology/612.81-nerves', file: '200.6-vocabulary.json' },
  '400': { folder: '611-anatomy/611.018-tissues', file: '400.4-vocabulary.json' },
  '500': { folder: '612-physiology/612.89-ans', file: '500.3-vocabulary.json' },
  '600': { folder: '612-physiology/612.8-special-senses', file: '600.4-vocabulary.json' },
  '700': { folder: '612-physiology/612.4-endocrine', file: '700.4-vocabulary.json' },
  '900': { folder: '612-physiology/612.2-respiratory', file: '900.5-vocabulary.json' }
};
```

**Issues**:
- ❌ Hardcoded paths (not using registry)
- ❌ Separate cache from main question loading
- ❌ Vocabulary banks not in main registry
- ❌ Inconsistent with `loadQuestionBank()` approach

---

### 1.3 ScaffoldModule Question Loading (820.31.20-scaffold-module.js)

**Location**: Lines 150-175

#### `loadQuestions(jsonPath)`
- **Purpose**: Load questions for standalone scaffold module
- **Parameters**: `jsonPath` - Full path to question JSON
- **Returns**: Promise<QuestionData>
- **Callers**: External scaffold module users
- **Caching**: `this.questions` Map (by question ID)
- **Key behavior**:
  - Builds keyword index for questions
  - Stores in Map by question ID

```javascript
// Lines 150-175
async loadQuestions(jsonPath) {
  try {
    const response = await fetch(jsonPath);
    const data = await response.json();

    if (data.questions) {
      for (const q of data.questions) {
        this.questions.set(q.id, q);

        // Index by topic keywords
        const keywords = this.extractKeywords(q.q);
        for (const kw of keywords) {
          if (!this.topicIndex.has(kw)) {
            this.topicIndex.set(kw, []);
          }
          this.topicIndex.get(kw).push(q.id);
        }
      }
    }

    return data;
  } catch (e) {
    console.error(`Failed to load questions from ${jsonPath}:`, e);
    return null;
  }
}
```

**Issues**:
- ❌ Completely separate from main app loading
- ❌ Different cache structure (Map vs Object)
- ❌ No integration with app.questionBanks
- ❌ Builds keyword index not used elsewhere

---

### 1.4 Gauntlet Mode Loading (820.31.1.2-quiz-gauntlet.js)

**Location**: Line 104

#### Inline Question Loading
- **Purpose**: Load all banks for gauntlet mode
- **Parameters**: None (uses registry from parent)
- **Returns**: Array of questions
- **Callers**: Gauntlet mode initialization
- **Caching**: None (loads fresh every time)

```javascript
// Line 104
const data = await fetch(`${cat.folder}/${bank.file}`).then(r => r.json());
```

**Issues**:
- ❌ Inline fetch (not using app.loadQuestionBank)
- ❌ No caching
- ❌ Bypasses app cache
- ❌ Potential duplicate loads

---

### 1.5 Vocabulary Helper Loading (820.31.20-vocab-helper.js)

**Location**: Line 38

#### `loadVocabulary()`
- **Purpose**: Load vocabulary for vocab practice mode
- **Parameters**: None
- **Returns**: Promise<void>
- **Callers**: Vocab mode initialization

**Issues**:
- ⚠️ Minimal details in grep results
- ⚠️ Separate from main loading system

---

## 2. REGISTRY SYSTEM

### 2.1 Registry Structure (820.31-question-registry.json)

**Schema**:
```json
{
  "version": "1.6.0",
  "lastUpdated": "2026-03-29",
  "subjects": [
    {
      "id": "sciences",
      "name": "Sciences",
      "icon": "🔬",
      "description": "...",
      "disciplines": [
        {
          "id": "biology",
          "name": "Biology",
          "dewey": "570",
          "courses": [
            {
              "id": "anatomy-physiology",
              "name": "Anatomy & Physiology",
              "dewey": "611-612"
            }
          ]
        }
      ]
    }
  ],
  "categories": [
    {
      "id": "000",
      "dewey": "611",
      "name": "Body Organization & Chemistry",
      "folder": "611-anatomy/611-foundations",
      "subject": "sciences",
      "discipline": "biology",
      "course": "anatomy-physiology",
      "banks": [
        {
          "id": "000.1",
          "file": "000.1-organization.json",
          "title": "Body Organization & Homeostasis",
          "questionCount": 18
        }
      ]
    }
  ]
}
```

**Hierarchy**: `Subject → Discipline → Course → Category → Bank → Questions`

**Current Categories**: 10 categories (000, 100, 200, 400, 500, 600, 700, 800, 900, 510)

**Total Question Banks**: 37 banks

**Issues**:
- ✅ Well-structured hierarchy
- ❌ Vocabulary banks NOT in registry (separate hardcoded map)
- ❌ No scaffold file references in registry
- ❌ No question difficulty metadata
- ❌ No prerequisite graph

---

## 3. SCAFFOLDING SYSTEMS

### 3.1 Core Scaffolding (820.31.6-scaffolding.js)

**Purpose**: ZPD-based adaptive scaffolding (Vygotsky)

**Key Methods**:
- `recordAnswer(questionId, wasCorrectFirstTry, explorationCount)` - Update performance tracking
- `getTopicPerformance(topicPrefix)` - Get performance ratio for topic
- `updateScaffoldLevel()` - Adjust scaffold level (HEAVY/MODERATE/LIGHT/CHALLENGE)
- `getScaffoldingAdvice(topicPrefix)` - Get recommendations
- `getAdaptiveMessage(context)` - Ms. Luminara's voice
- `getMasteryMap()` - Overall mastery visualization

**Scaffold Levels**:
- **HEAVY** (< 40% correct): Extra hints, slower pace
- **MODERATE** (40-60%): Standard warmups
- **LIGHT** (60-80%): Can skip warmups
- **CHALLENGE** (> 80%): Harder questions

**Storage**: `localStorage['ms_luminara_scaffolding']`

**Data Structure**:
```javascript
{
  topicPerformance: {
    "100.1": {
      attempts: 10,
      correct: 6,
      explorations: 15,
      lastSeen: "2026-03-30T...",
      consecutiveCorrect: 2,
      consecutiveWrong: 0
    }
  },
  recentPerformance: [
    { questionId, correct, explorations, timestamp }
  ],
  scaffoldLevel: 'moderate',
  reviewQueue: ["100.1.05", "200.2.03"],
  sessionStruggleCount: 3,
  sessionSuccessCount: 12
}
```

**Issues**:
- ❌ No actual question loading (relies on external system)
- ❌ Tracks performance but doesn't select questions
- ❌ Review queue not integrated with question selection

---

### 3.2 Scaffold Remediation (820.31.14-scaffold-remediation.js)

**Purpose**: D20-based wrong answer remediation with iterative scaffolding

**Key Methods**:
- `calculateDamage()` - D20 roll for HP damage
- `applyDamage(damage)` - Update HP, handle knockouts
- `heal(amount)` - Heal on correct scaffold answers
- `startSession(wrongQuestion, damageResult, wrongOptionIndex)` - Start scaffold session
- `selectScaffoldQuestions(wrongQuestion, wrongOptionIndex, count)` - **CRITICAL: Question selection**
- `recordScaffoldResult(wasCorrectFirstTry, timeMs, selectedOption)` - Track scaffold results
- `shouldContinueScaffolding()` - Adaptive depth logic
- `completeSession(exitReason, finalEvaluation)` - End session

**HP System**:
- Max HP: 100
- Heal per scaffold: 5 HP
- Damage table: 0 (nat 20) → 25 (nat 1)
- Knockout: HP = 0 → 50% XP penalty

**Scaffold Selection Logic** (Lines 282-410):
1. **Statistics-based** (preferred): Uses `questionStatistics.selectScaffoldQuestions()` if available
2. **Heuristic fallback**: Keyword overlap, difficulty ranking

**Adaptive Depth** (Phase 1 enhancement):
- Min scaffolds: 2
- Max scaffolds: 7
- Continues until insight detected or maximum reached

**Storage**: `localStorage['ms_luminara_scaffold_hp']`

**Issues**:
- ✅ Well-integrated with insight detection
- ✅ Statistics-driven when available
- ❌ Vocabulary bank loading separate from main system
- ❌ No coordination with main app question cache

---

### 3.3 ScaffoldModule (820.31.20-scaffold-module.js)

**Purpose**: Standalone scaffolding + image pairing system

**Key Methods**:
- `init()` - Load image index
- `loadQuestions(jsonPath)` - Load question bank
- `loadScaffolds(questionId)` - Load scaffolds for question
- `findImagesForQuestion(question)` - Image matching
- `getQuestionWithImages(questionId)` - Paired question+images

**Image Matching**:
- SMART image library
- Keyword-based relevance scoring
- Topic-to-image mapping

**Issues**:
- ❌ Completely isolated from main app
- ❌ Duplicate question storage (Map vs app cache)
- ❌ No integration with statistics or ZPD
- ⚠️ Image system valuable but disconnected

---

## 4. ZPD SYSTEM (820.31.11-zpd-system.js)

**Purpose**: Zone of Proximal Development detection

**Key Methods**:
- `analyzeZPD(isotopes, answeredQuestions)` - Categorize questions into zones
- `getStatisticsBasedZone(questionId)` - Statistics-driven zone detection
- `getZPDQuestions(count)` - Get questions in proximal zone
- `estimateDifficulty(q)` - Difficulty estimation
- `generateScaffolding(q, wrongCount, selectedAnswer)` - Generate scaffolds
- `recordInteraction(qid, response)` - Update learner profile

**ZPD Zones**:
- **Mastered**: Consistently correct, objectively easy
- **Comfortable**: Usually correct, moderate difficulty
- **Proximal (ZPD)**: Achievable with guidance - **THE SWEET SPOT**
- **Beyond**: Too hard, prerequisites not mastered

**Zone Detection Logic** (Lines 414-443):
```javascript
if (userMastery > 0.8 && difficulty < 0.3) return 'mastered';
if (userMastery > 0.6 && difficulty < 0.5) return 'comfortable';
if (prereqMastery > 0.6 && difficulty < userMastery + 0.3) return 'proximal';
return 'beyond';
```

**Difficulty Estimation**:
1. **Statistics-based** (preferred): `questionStatistics.getDifficulty()`
2. **Heuristic fallback**: Isotope count, prerequisites, mechanism presence

**Issues**:
- ✅ Well-designed ZPD logic
- ✅ Statistics integration
- ❌ No actual question loading
- ❌ Not used by main app for question selection
- ❌ Operates on questions passed to it (passive)

---

## 5. MULTIMODAL QUESTIONS (820.31.12-multimodal-questions.js)

**Purpose**: Support multiple question formats

**Formats**:
- Multiple choice (standard)
- Type-in / Fill-in-the-blank
- Sequence ordering
- Match/Drag
- True/False with correction
- Clinical vignette chains

**Key Methods**:
- `selectFormat(q, studentProfile, usedFormats)` - Choose optimal format
- `getFormatCandidates(q)` - Which formats work for this question
- `convertToTypeIn(q)` - Convert to type-in format
- `render(q, format)` - Render question in format

**Issues**:
- ✅ Good abstraction
- ❌ Not integrated into main question flow
- ❌ Requires main app to call explicitly
- ❌ No automatic format rotation

---

## 6. QUESTION STATISTICS (820.31.32-question-statistics.js)

**Purpose**: Empirical difficulty tracking and scaffold selection

**Key Methods**:
- `recordAnswer(qid, selectedOption, correctOption, wasCorrect, timeMs, context)` - **CRITICAL: All answers flow here**
- `getDifficulty(questionId)` - Get empirical difficulty
- `getCommonConfusions(questionId)` - Most common wrong answers
- `selectScaffoldQuestions(wrongQuestion, wrongOptionIndex, questionPool, userProfile)` - **Statistics-driven scaffold selection**
- `determineZPDZone(questionId, userProfile)` - ZPD zone from statistics
- `getInferredPrerequisites(questionId)` - Prerequisite graph from session sequences

**Difficulty Computation** (Lines 185-201):
```javascript
// Item Response Theory-lite
const pCorrect = stats.correctFirstTry / stats.attempts;
const guessRate = 0.25;  // 4-option multiple choice
const adjustedDifficulty = 1 - ((pCorrect - guessRate) / (1 - guessRate));
```

**Scaffold Selection Strategies** (Lines 494-586):
1. **Prerequisite**: Unmastered prerequisites
2. **Confusion clearing**: Questions teaching the confused concept
3. **Easier same topic**: Build confidence

**Prerequisite Inference** (Lines 334-383):
- Watches session sequences
- If Q1 mastered before Q2, Q1 might be prerequisite for Q2
- Builds prerequisite graph from patterns

**Storage**: `localStorage['ms_luminara_question_stats']`

**Data Structure**:
```javascript
{
  questions: {
    "100.1.05": {
      attempts: 25,
      correctFirstTry: 18,
      optionSelections: [18, 3, 2, 2],  // Distribution
      totalTimeMs: 125000,
      timeSamples: 25,
      difficulty: 0.28,  // 0.0 (easy) to 1.0 (hard)
      discriminationIndex: 0.65,
      lastSeen: "2026-03-30T..."
    }
  },
  prerequisiteGraph: {
    "100.2.01": {
      "100.1.05": 8,  // Seen 8 times before this question
      "100.1.03": 5
    }
  },
  confusionPairs: {
    "100.1.05:1": { count: 3, correctOption: 0 }
  }
}
```

**Issues**:
- ✅ Excellent statistics tracking
- ✅ Used by ZPD and remediation systems
- ❌ Requires questions to be passed in (no loading)
- ❌ Prerequisite graph not visible in UI
- ❌ No bulk analytics/export beyond `getGlobalSummary()`

---

## 7. INSIGHT DETECTION (820.31.33-insight-detection.js)

**Purpose**: Detect when learner achieves genuine understanding

**Key Methods**:
- `evaluateInsight(scaffoldResults, wrongPatternHistory)` - **CRITICAL: Adaptive depth decision**
- `computeCorrectStreak(scaffoldResults)` - Consecutive correct at end
- `computeSpeedConfidence(scaffoldResults)` - Fast = confident
- `detectConceptualShift(wrongPatternHistory)` - Different wrong answer = progress
- `shouldContinue(evaluation)` - Whether to continue scaffolding
- `getExitMessage(exitReason)` - Ms. Luminara's voice

**Insight Signals**:
- Correct answer + fast response (< 5s) = likely insight
- Correct answer + slow response (> 15s) = possibly uncertain
- Pattern shift in wrong answers = partial insight (reconceptualizing)
- Streak of 2+ correct = solid understanding

**Confidence Calculation** (Lines 119-145):
```javascript
confidence =
  0.4 * (correctStreak / INSIGHT_STREAK) +
  0.3 * speedConfidence +
  0.3 * overallAccuracy +
  0.1 * (patternShift ? 1 : 0)
```

**Recommendations**:
- `complete_insight` - Confidence ≥ 0.7
- `complete_maximum` - Depth ≥ 7 scaffolds
- `offer_explicit_help` - Struggling (0% accuracy at depth 4+)
- `continue` - Keep scaffolding

**Issues**:
- ✅ Excellent adaptive logic
- ✅ Well-integrated with remediation
- ❌ Not used for main question selection (only scaffolds)
- ❌ Could inform difficulty calibration

---

## 8. CURRENT ISSUES SUMMARY

### 8.1 Duplicate Code

**Question Loading**: 5+ implementations
- `app.loadQuestionBank()`
- `scaffoldRemediation.loadVocabularyBank()`
- `ScaffoldModule.loadQuestions()`
- `gauntlet mode inline fetch`
- `vocab helper loadVocabulary()`

**Difficulty Estimation**: 2 implementations
- `ZPDSystem.estimateDifficulty()` - Heuristic
- `questionStatistics.getDifficulty()` - Empirical

**ZPD Zone Detection**: 2 implementations
- `ZPDSystem.analyzeZPD()` - Heuristic
- `questionStatistics.determineZPDZone()` - Statistics-based

### 8.2 Inconsistent Loading Patterns

**Caching**:
- App: `this.questionBanks[cacheKey]` (Object)
- ScaffoldModule: `this.questions` (Map)
- ScaffoldRemediation: `this.vocabBankCache` (Object)
- Statistics: No cache (operates on passed questions)

**Fallback Strategies**:
- App: fetch → loadJsonViaScript
- ScaffoldRemediation: fetch only
- ScaffoldModule: fetch only
- Gauntlet: fetch only

### 8.3 Race Conditions

**Scenario 1: Concurrent Bank Loads**
- User selects category → calls `loadCategory()`
- Scaffolding triggers → calls `loadVocabularyBank()`
- Both fetch same bank → duplicate network requests

**Scenario 2: Cache Invalidation**
- App caches question bank
- ScaffoldModule loads same bank separately
- Mutations in one don't reflect in other

**Scenario 3: Statistics Recording**
- User answers question → `questionStatistics.recordAnswer()`
- Session sequence updated
- But prerequisite graph update happens **during next session**
- Stale prerequisite inference

### 8.4 Missing Error Handling

**Network Failures**:
- `loadQuestionBank()` - Falls back silently, no user feedback
- `loadVocabularyBank()` - Returns null, caller might not check
- `loadScaffolds()` - Returns empty array, no indication of failure

**Invalid Data**:
- No schema validation for loaded JSON
- No handling of missing `questions` array
- No handling of malformed question objects

### 8.5 Missing Question Orchestration

**No Central State**:
- Questions loaded across multiple caches
- No single source of truth for "available questions"
- No global question index

**No Loading State**:
- User doesn't know what's loading
- No progress indication for category loads
- No indication when scaffolds unavailable

**No Prefetching**:
- Questions loaded on-demand only
- Could prefetch likely next questions
- Could prefetch vocabulary banks for current category

---

## 9. RECOMMENDED UNIFIED ORCHESTRATOR DESIGN

### 9.1 Core Responsibilities

```javascript
class QuestionOrchestrator {
  // 1. LOADING & CACHING
  async loadRegistry()
  async loadQuestionBank(categoryId, bankId, options)
  async loadVocabularyBank(categoryPrefix)
  async loadScaffolds(questionId)
  async prefetchQuestions(questionIds)

  // 2. QUESTION SELECTION
  getNextQuestion(context)  // ZPD-aware, difficulty-aware
  getScaffoldQuestions(wrongQuestion, context)  // Statistics-driven
  getReviewQuestions(count)  // Spaced repetition

  // 3. STATE MANAGEMENT
  recordAnswer(questionId, response)  // Updates ALL systems
  getQuestionState(questionId)  // Difficulty, attempts, mastery
  getUserProfile()  // ZPD zones, mastery map, performance

  // 4. STATISTICS INTEGRATION
  getDifficulty(questionId)
  getZPDZone(questionId)
  getPrerequisites(questionId)

  // 5. CACHE MANAGEMENT
  clearCache()
  pruneCache(strategy)
  getCacheStats()
}
```

### 9.2 Unified Cache Structure

```javascript
{
  // Registry (loaded once)
  registry: RegistryData,

  // Questions (Map for O(1) lookup)
  questions: Map<QuestionID, Question>,

  // Banks (for bulk operations)
  banks: Map<BankID, QuestionBank>,

  // Vocabulary banks (separate but managed)
  vocabularyBanks: Map<CategoryPrefix, VocabularyBank>,

  // Loading state
  loading: {
    inProgress: Set<ResourceID>,
    failed: Set<ResourceID>,
    retryCount: Map<ResourceID, number>
  },

  // Prefetch queue
  prefetchQueue: Array<ResourceID>
}
```

### 9.3 Integration Points

**With Existing Systems**:
- **ScaffoldingEngine**: Reads from orchestrator, writes performance
- **ScaffoldRemediation**: Calls orchestrator for scaffolds
- **QuestionStatistics**: Orchestrator records all answers here
- **ZPDSystem**: Orchestrator uses for zone detection
- **InsightDetection**: Used by remediation (no change needed)
- **MultimodalQuestions**: Orchestrator applies format selection

**Event Flow**:
```
User answers question
  ↓
Orchestrator.recordAnswer(questionId, response)
  ↓
├─→ questionStatistics.recordAnswer(...)
├─→ scaffolding.recordAnswer(...)
├─→ ZPDSystem.recordInteraction(...)
└─→ Update orchestrator state
  ↓
Orchestrator.getNextQuestion()
  ↓
├─→ Check ZPDSystem.getZPDQuestions()
├─→ Check scaffolding.reviewQueue
├─→ Check questionStatistics difficulty
└─→ Return best question
```

### 9.4 Phased Implementation

**Phase 1: Centralize Loading**
- Move all `fetch()` calls to orchestrator
- Unified cache management
- Remove duplicate loading code

**Phase 2: Integrate Statistics**
- All answers flow through orchestrator
- Orchestrator updates all tracking systems
- Single `recordAnswer()` method

**Phase 3: Smart Selection**
- Orchestrator uses ZPD + statistics for selection
- Prefetching for predicted questions
- Loading state management

**Phase 4: Advanced Features**
- Adaptive difficulty
- Spaced repetition integration
- Prerequisite-aware sequencing

---

## 10. FILES REQUIRING MODIFICATION

### High Priority
- ✅ `820.31.1-app.js` - Main app loading logic
- ✅ `820.31.14-scaffold-remediation.js` - Vocabulary loading
- ✅ `820.31.32-question-statistics.js` - Integration point
- ✅ `820.31.11-zpd-system.js` - Zone detection

### Medium Priority
- ⚠️ `820.31.6-scaffolding.js` - Performance tracking
- ⚠️ `820.31.20-scaffold-module.js` - Standalone module
- ⚠️ `820.31.1.2-quiz-gauntlet.js` - Inline loading

### Low Priority (Keep as-is)
- ✅ `820.31.33-insight-detection.js` - Works well independently
- ✅ `820.31.12-multimodal-questions.js` - Format layer only

---

## 11. NEXT STEPS

1. **Review this audit** with stakeholders
2. **Design QuestionOrchestrator API** (detailed spec)
3. **Implement Phase 1** (centralized loading)
4. **Test with existing quiz modes** (ensure no regressions)
5. **Implement Phase 2** (statistics integration)
6. **Implement Phase 3** (smart selection)
7. **Remove deprecated code** (cleanup)

---

## APPENDIX A: Question Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    QUESTION SOURCES                          │
├─────────────────────────────────────────────────────────────┤
│  820.31-question-registry.json                              │
│    ↓                                                         │
│  Category folders (611-anatomy/, 612-physiology/, etc.)     │
│    ↓                                                         │
│  Question bank JSON files (100.1-structure.json, etc.)      │
│    ↓                                                         │
│  Vocabulary bank JSON files (100.5-vocabulary.json, etc.)   │
│    ↓                                                         │
│  Scaffold JSON files (if question.scaffoldFile present)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LOADING SYSTEMS (CURRENT)                 │
├─────────────────────────────────────────────────────────────┤
│  app.loadQuestionBank()                                     │
│  app.loadScaffoldsForQuestion()                             │
│  scaffoldRemediation.loadVocabularyBank()                   │
│  ScaffoldModule.loadQuestions()                             │
│  gauntlet inline fetch()                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CACHES (FRAGMENTED)                       │
├─────────────────────────────────────────────────────────────┤
│  app.questionBanks = {}                                     │
│  scaffoldRemediation.vocabBankCache = {}                    │
│  ScaffoldModule.questions = Map()                           │
│  question.prereqs (cached on object)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PROCESSING SYSTEMS                         │
├─────────────────────────────────────────────────────────────┤
│  questionStatistics.recordAnswer()                          │
│  scaffolding.recordAnswer()                                 │
│  ZPDSystem.recordInteraction()                              │
│  insightDetection.evaluateInsight()                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENT STORAGE                        │
├─────────────────────────────────────────────────────────────┤
│  localStorage['ms_luminara_question_stats']                 │
│  localStorage['ms_luminara_scaffolding']                    │
│  localStorage['ms_luminara_scaffold_hp']                    │
│  localStorage['ms_luminara_persistence']                    │
└─────────────────────────────────────────────────────────────┘
```

---

## APPENDIX B: Question Object Schema

```javascript
{
  // Core identification
  "id": "100.1.05",
  "bank": "100.1",
  "category": "100",

  // Question content
  "q": "Which lobe of the cerebrum is responsible for processing visual information?",
  "options": ["Occipital", "Frontal", "Parietal", "Temporal"],
  "answer": 0,  // Index of correct option

  // Explanations
  "explain": "The occipital lobe, located at the back of the brain...",
  "optionExplains": [
    { "verdict": "correct", "text": "Correct! The occipital lobe..." },
    { "verdict": "incorrect", "text": "The frontal lobe handles..." },
    // ...
  ],

  // Metadata
  "isotopes": ["612.82.visual-cortex", "612.82.occipital-lobe"],
  "difficulty": 2,
  "operatorCoord": { "F": 0.8, "G": 0.6, "A": 0.3, ... },

  // Scaffolding
  "scaffoldFile": "scaffolds/100.1.05-scaffolds.json",  // Optional
  "prereqs": [...],  // Cached after loading scaffoldFile

  // Images
  "images": ["brain-lobes.svg", "visual-cortex.png"],

  // Runtime metadata (added by loaders)
  "_categoryFolder": "612-physiology/612.82-brain",
  "_loadedAt": 1234567890,
  "_source": "100.1-structure.json"
}
```

---

**END OF AUDIT**
