# Ms. Luminara Quiz System — Architecture

## Overview

The quiz system is built on a modular, event-driven architecture designed for:
- Token efficiency (small, focused files)
- Extensibility (mixin-based extensions)
- Maintainability (clear separation of concerns)

---

## System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION                            │
│  index.html │ 000.0-styles.css │ 000.2-renderer.js          │
├─────────────────────────────────────────────────────────────┤
│                      APPLICATION                             │
│  000.1-app.js (Quiz Controller)                              │
├─────────────────────────────────────────────────────────────┤
│                      GAME SYSTEMS                            │
│  000.3-gamification │ 000.7-d20-system │ 000.8-loot-system  │
├─────────────────────────────────────────────────────────────┤
│                      LEARNING SYSTEMS                        │
│  000.6-scaffolding │ 000.11-zpd-system │ 000.10-isotope     │
├─────────────────────────────────────────────────────────────┤
│                      PERSISTENCE                             │
│  000.4-persistence.js (LocalStorage)                         │
├─────────────────────────────────────────────────────────────┤
│                      VOICE                                   │
│  000.9-voice-system.js │ tts-server/                         │
├─────────────────────────────────────────────────────────────┤
│                      CONTENT                                 │
│  100-brain/ │ 200-nerves/ │ 300-foundations/ │ etc.         │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Files

### 000.1-app.js — Quiz Controller

The central coordinator that manages:

```javascript
class Quiz {
  constructor() {
    this.questions = [];      // Loaded question pool
    this.currentIdx = 0;      // Current question index
    this.phase = 'main';      // warmup1 | warmup2 | main
    this.exploredOptions = []; // Options user has explored
    this.renderer = null;     // QuizRenderer instance
  }

  // Lifecycle
  async init()              // Load questions, init systems
  loadTopicQuestions(id)    // Load specific topic
  startStudySession()       // Begin quiz session

  // Navigation
  nextQuestion()            // Advance to next
  prevQuestion()            // Go back
  skipToMain()              // Skip warmups

  // Interaction
  exploreOption(idx)        // User explores an answer
  handleCorrectAnswer()     // Process correct selection
  handleWrongAnswer()       // Process incorrect selection

  // Scoring
  calculateXP(question)     // Compute XP with bonuses
  checkAchievements()       // Check for unlocks
}
```

**Global instance:** `window.quiz`

---

### 000.2-renderer.js — Rendering Engine

Handles all UI rendering with mixin extensions:

```javascript
class QuizRenderer {
  constructor(quiz) {
    this.quiz = quiz;
    this.notificationQueue = [];
  }

  // Core Rendering
  render(question, idx, total, explored, phase)
  renderStatsBar()
  renderLandingStats()

  // Question Building
  buildQuestionCard(question, idx, explored, phase)
  buildOptions(question, explored)
  buildIntro(explored, phase, questionText)
  buildExplorationPanel(question, explored)
  buildMechanismTour(question, explored)

  // Notifications
  showXPPopup(xpResult, streakMsg, isRevenge)
  showAchievement(achievement)
  showLevelUp(newLevel)
  showStreakBroken(prevStreak)
  showSessionSummary(summary, achievements)

  // Utility
  escapeHtml(text)
}
```

**Extension Mixins:**

| Mixin | File | Methods Added |
|-------|------|---------------|
| VoiceLabMixin | 000.2.1-renderer-voice-lab.js | Voice blending UI, XTTS controls |
| InventoryMixin | 000.2.2-renderer-inventory.js | Paperdoll, item details, gems |
| D20UIMixin | 000.2.3-renderer-d20-ui.js | Dice rolls, character sheet |

---

### 000.3-gamification.js — XP & Progression

```javascript
class Gamification {
  constructor() {
    this.xp = 0;
    this.level = 1;
    this.currentStreak = 0;
    this.bestStreak = 0;
  }

  // XP
  calculateXP(options)      // Base + bonuses
  addXP(amount)             // Add and check level up
  getLevelForXP(xp)         // Calculate level from XP

  // Streaks
  incrementStreak()         // Add to streak
  breakStreak()             // Reset streak
  getStreakBonus()          // Calculate streak multiplier

  // Messages
  getStreakMessage(streak)       // "On fire!" etc.
  getLuckyStrikeMessage()        // Random lucky message
  getEncouragementMessage()      // After streak break
  getRevengeMessage()            // After revenge success
}
```

**XP Formula:**
```
Base XP = 10
+ Streak Bonus (streak × 2, max 20)
+ First Try Bonus (+5 if correct on first explore)
+ Revenge Bonus (+15 if previously wrong)
+ Lucky Strike (random 5% chance, 2× multiplier)
```

**Level Formula:**
```
XP needed = 100 × (level ^ 1.5)
```

---

### 000.4-persistence.js — Save System

```javascript
class Persistence {
  // Save/Load
  save()                          // Save all state
  load()                          // Load all state

  // Question Progress
  markQuestionAttempted(id, correct)
  getQuestionProgress(id)
  wasQuestionPreviouslyWrong(id)

  // Wrong Queue
  addToWrongQueue(questionId)
  getWrongQueue()
  removeFromWrongQueue(questionId)

  // Statistics
  getSessionStats()
  incrementStat(key)
}
```

**LocalStorage Keys:**
| Key | Contents |
|-----|----------|
| `ms_luminara_progress` | Question attempt history |
| `ms_luminara_gamification` | XP, level, streaks |
| `ms_luminara_achievements` | Unlocked achievements |
| `ms_luminara_d20` | Character stats, insight points |
| `ms_luminara_loot` | Inventory, equipped items |
| `ms_luminara_voice` | Voice settings |
| `ms_luminara_cocktails` | Saved voice blends |

---

### 000.6-scaffolding.js — Adaptive Learning

```javascript
class Scaffolding {
  // Performance Tracking
  recordAttempt(correct)
  getRecentPerformance()

  // Difficulty Assessment
  getScaffoldLevel()        // heavy | moderate | light | challenge
  shouldShowExtraHint()

  // Hints
  getExtraHint(question)
  getAdaptiveMessage(scaffoldAdvice)
}
```

**Scaffold Levels:**
| Level | Trigger | Effect |
|-------|---------|--------|
| heavy | <40% recent accuracy | Extra hints, encouraging messages |
| moderate | 40-60% accuracy | Standard experience |
| light | 60-80% accuracy | Reduced scaffolding |
| challenge | >80% accuracy | Minimal hints, harder mode |

---

### 000.10-isotope-engine.js — LUMI-OS Integration

Semantic tagging and 8D operator coordinate system for questions.

```javascript
const IsotopeEngine = {
  // Initialization
  init(questions)                     // Build registry, compute coordinates

  // Isotope Management
  buildRegistry()                     // Index questions by isotope
  inferIsotopes(q)                    // Auto-generate isotopes from content

  // 8D Operator Coordinates (TAIDRGEF)
  computeOperatorCoordinate(q)        // Position question in 8D space
  getDominantOperators(q)             // Top 2-3 operators for question
  zpdDistance(q1, q2)                 // Learning proximity distance
  findInZPD(targetQ, radius)          // Find questions within ZPD radius

  // Relations
  getRelatedQuestions(qid)            // Find isotope-linked questions
  getSharedIsotopes(qid1, qid2)       // Common isotopes

  // Export
  exportForLumiOS(qid)                // Full question data for LUMI-OS
  estimateDifficulty(q)               // 0.0-1.0 difficulty score
}
```

**8D Operators:**
| Op | Name | Cognitive Function |
|----|------|-------------------|
| T | Transform | Process/change |
| A | Aggregate | Gathering/listing |
| I | Intensify | Amplification |
| D | Diminish | Inhibition |
| R | React | Cause/effect |
| G | Gravitate | Location/focus |
| E | Emit | Output/release |
| F | Frame | Definitions |

**Conjugate Pairs:** I↔D (intensity), G↔E (flow direction)

---

### 000.11-zpd-system.js — Zone of Proximal Development

Tracks student mastery and generates operator-based scaffolding.

```javascript
const ZPDSystem = {
  // ZPD Analysis
  analyzeZPD(isotopes, answeredQuestions)
  checkPrerequisites(q, answeredQuestions)

  // Scaffolding (operator-aware)
  generateScaffolding(q, wrongCount, selectedAnswer)
  getDominantOperator(coord)

  // 5E Inquiry Phases
  mapToInquiryPhase(q)                // engage|explore|explain|elaborate|evaluate

  // Moment Detection
  detectMomentType(q, response, attempts)
  generateFeedback(q, response, momentType)

  // Student Profile
  recordInteraction(qid, response)
  getLearningPath(targetIsotopes, maxQuestions)
  saveState() / loadState(state)
}
```

**Operator Scaffolds:**
| Operator | Hint |
|----------|------|
| F | "What IS this thing? Focus on the definition." |
| T | "What changes or transforms here?" |
| R | "What triggers this? Follow cause and effect." |
| I | "What's being amplified or increased?" |
| D | "What's being reduced or inhibited?" |
| G | "Where does this converge? Find the target." |
| E | "What gets released or sent out?" |

**5E Phase → Operator Mapping:**
| Phase | Primary Operators |
|-------|-------------------|
| Engage | F |
| Explore | F, A, G |
| Explain | T, R |
| Elaborate | I, D, E |
| Evaluate | All |

---

### 000.13-lumi-bridge.js — LUMI-OS WebSocket Bridge

Real-time connection to LUMI-OS teaching platform.

```javascript
const LumiBridge = {
  // Connection
  connect()                           // WebSocket to localhost:8765
  disconnect()
  send(data)

  // Interaction Recording
  recordInteraction(data)             // Log answer with operator coord
  recordEvent(eventType, eventData)

  // LUMI-OS Requests
  requestScaffold(qid, wrongCount, selectedAnswer)
  requestLearningPath(isotopes, maxQuestions)
  requestStats()

  // Export
  exportAsJSONL(options)              // Training data export
  exportSummary()                     // Session statistics
  downloadExport(format)              // jsonl|json|csv

  // Session
  startSession()
  endSession()
  saveSessionToStorage()
}
```

**WebSocket Message Types:**
| Type | Direction | Purpose |
|------|-----------|---------|
| handshake | → | Declare capabilities |
| session_confirmed | ← | Session ID assigned |
| submit_answer | → | Send answer with coords |
| answer_response | ← | Persona feedback, streak |
| get_scaffold | → | Request hint |
| scaffold_response | ← | Operator-based hint |
| crystallization | ← | Mastery achieved |

**Training Export Formats:**
- `instruction-response` — Q&A pairs for fine-tuning
- `conversation` — Multi-turn dialogue with persona
- `claim-units` — Agent→Verb→Target relationships

---

### 000.7-d20-system.js — RPG Mechanics

```javascript
class D20System {
  constructor() {
    this.stats = {
      intelligence: { value: 10, xp: 0 },
      wisdom: { value: 10, xp: 0 },
      constitution: { value: 10, xp: 0 },
      charisma: { value: 10, xp: 0 }
    };
    this.insightPoints = 3;
  }

  // Rolling
  roll(options)               // Roll d20 with modifiers
  rollWithAdvantage(stat)     // Roll 2d20, take higher
  rollWithDisadvantage(stat)  // Roll 2d20, take lower

  // Stats
  getModifier(stat)           // (value - 10) / 2, floor
  addStatXP(stat, amount)     // Progress toward stat increase

  // Resources
  getInsightPoints()
  spendInsightPoints(cost)
  gainInsightPoints(amount)
  canAfford(cost)

  // Character Sheet
  getCharacterSheet()         // Full character data
  getTitle()                  // "Novice Scholar" etc.
}
```

**Stat Modifiers:**
| Stat Value | Modifier |
|------------|----------|
| 8-9 | -1 |
| 10-11 | 0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18-19 | +4 |
| 20 | +5 |

---

### 000.8-loot-system.js — Equipment

```javascript
class LootSystem {
  constructor() {
    this.inventory = [];
    this.equipped = {};
    this.gems = [];
    this.gold = 0;
  }

  // Generation
  generateLoot(level, context)    // Create random item
  rollRarity()                    // Determine rarity
  generateItem(type, rarity, level)

  // Inventory
  addItem(item)
  removeItem(itemId)
  getInventory()

  // Equipment
  equipItem(itemId)
  unequipItem(slot)
  getEquipped()
  calculateEquipmentStats()

  // Gems
  addGem(gem)
  socketGem(gemId, itemId)
  getGems()

  // Sets
  getActiveSetBonuses()
}
```

**Rarity Distribution:**
| Rarity | Chance | Color |
|--------|--------|-------|
| COMMON | 50% | Gray |
| UNCOMMON | 30% | Green |
| RARE | 15% | Blue |
| EPIC | 4% | Purple |
| LEGENDARY | 0.9% | Orange |
| UNIQUE | 0.1% | Cyan |

**Equipment Slots:**
HEAD, NECK, SHOULDERS, CHEST, HANDS, WAIST, LEGS, FEET, RING_L, RING_R, MAINHAND, OFFHAND

---

### 000.9-voice-system.js — TTS Integration

```javascript
class VoiceSystem {
  constructor() {
    this.settings = {
      enabled: true,
      backend: 'piper',
      volume: 0.85,
      rate: 1.0,
      piperModel: 'en_US-amy-medium'
    };
    this.queue = [];
    this.isPlaying = false;
  }

  // Speaking
  speak(text, options)            // Add to queue and play
  speakIntroThenQuestion(intro, question)
  speakExplanation(text, isCorrect)
  speakAchievement(text)
  speakLootDrop(itemName, rarity)

  // Queue
  processQueue()
  clearQueue()
  stopCurrent()

  // Voice Management
  setEnabled(enabled)
  previewVoice(voice, length)
  saveSettings()
  loadSettings()
}
```

**TTS Server API:**
```
POST /speak
{
  "text": "Hello darling",
  "model": "en_US-amy-medium",
  "speaker_id": 0
}
→ audio/wav
```

---

## Data Flow

### Question Answer Flow

```
User clicks option
       │
       ▼
Quiz.exploreOption(idx)
       │
       ├── Add to exploredOptions
       │
       ▼
QuizRenderer.render()
       │
       ├── buildExplorationPanel()
       │        │
       │        ▼
       │   VoiceSystem.speakExplanation()
       │
       ▼
If correct answer explored:
       │
       ├── Gamification.calculateXP()
       ├── D20System.addStatXP()
       ├── LootSystem.generateLoot()
       ├── Persistence.save()
       │
       ▼
QuizRenderer.showXPPopup()
```

### Warmup → Main Flow

```
Start Topic
    │
    ▼
Load Questions
    │
    ├── For each main question:
    │       │
    │       ├── Generate warmup1 from prereqs
    │       ├── Generate warmup2 from prereqs
    │       │
    │       ▼
    │   Present warmup1 (phase: 'warmup1')
    │       │
    │       ▼
    │   Present warmup2 (phase: 'warmup2')
    │       │
    │       ▼
    │   Present main (phase: 'main')
    │
    ▼
Next main question...
```

---

## CSS Architecture

The stylesheet (000.0-styles.css) is organized into sections:

```
Lines 1-54      : Root variables, reset, body
Lines 55-144    : Landing page
Lines 145-196   : Question cards
Lines 197-260   : Exploration panels
Lines 261-319   : Options buttons
Lines 320-380   : Progress indicators
Lines 381-429   : Navigation
Lines 430-508   : Warmup cards
Lines 509-555   : Loading states
Lines 556-821   : Landing content, topic grid
Lines 822-908   : Study view layout
Lines 909-1503  : Gamification UI (XP, streaks, achievements)
Lines 1504-1722 : Scaffolding UI
Lines 1723-2506 : D20 RPG UI (dice, character sheet)
Lines 2507-3107 : Inventory/Paperdoll
Lines 3108-4386 : Voice settings
Lines 4387-6003 : Miscellaneous, animations, responsive
```

**CSS Variables:**
```css
:root {
  --bg-deep: #0a0e1a;           /* Deep background */
  --bg-card: #111827;           /* Card background */
  --glow-warm: #f59e0b;         /* Amber accent */
  --correct: #10b981;           /* Green for correct */
  --incorrect: #ef4444;         /* Red for incorrect */
  --explore: #8b5cf6;           /* Purple for explore */
  --text-primary: #f1f5f9;      /* Main text */
  --text-secondary: #94a3b8;    /* Secondary text */
  --text-dim: #64748b;          /* Dimmed text */
  --border: rgba(148, 163, 184, 0.1);
}
```

---

## Extension Points

### Adding a New Game System

1. Create `000.X-system-name.js`
2. Define class with init/save/load methods
3. Instantiate in 000.1-app.js init()
4. Add persistence keys to 000.4-persistence.js

### Adding Renderer Features

1. Create `000.2.X-renderer-feature.js`
2. Define mixin object
3. Apply to QuizRenderer.prototype
4. Add script tag to index.html

### Adding Question Types

1. Define type in question JSON (`"type": "matching"`)
2. Add rendering logic in buildOptions()
3. Add scoring logic in Quiz.exploreOption()
4. Add explanation rendering in buildExplorationPanel()

---

## Performance Considerations

### Token Efficiency
- Body files kept under 30KB
- Function modules 15-20KB each
- Question banks 15-25 questions max

### Runtime Performance
- LocalStorage batched writes
- Voice queue prevents overlap
- CSS animations hardware-accelerated
- Lazy loading for mechanism tours

### Memory
- Audio blobs URL.revokeObjectURL after use
- DOM elements removed after animations
- Queue cleanup on session end
