# Ms. Luminara Quiz Engine - Architecture Audit

**Date**: 2026-03-26
**Version**: v54
**Total Files**: 30 JavaScript files (~25,700 LOC)
**Live Site**: https://luminara.natalie-eiryk.com/

---

## Executive Summary

The Quiz Engine is a **feature-rich, gamified learning system** with RPG mechanics, spaced repetition, and adaptive scaffolding. However, the two largest files (`820.31.1-app.js` at 3,866 lines and `820.31.2-renderer.js` at 3,154 lines) are candidates for server-handler refactoring.

---

## 1. Feature Implementation Tracker

### Core Quiz Features

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| Question loading | `820.31.1-app.js:loadQuestionBank()` | COMPLETE | Registry-based, Dewey-indexed |
| Multi-choice questions | `820.31.2-renderer.js:renderQuestion()` | COMPLETE | With exploration UI |
| Warmup prerequisite system | `820.31.1-app.js:handleWarmupFlow()` | COMPLETE | 2-stage warmup scaffolds |
| Mechanism tours | `820.31.2-renderer.js:showMechanismTour()` | COMPLETE | Deep explanations |
| Image/diagram support | `820.31.24-anatomy-diagrams.js` | COMPLETE | In questions + scaffolds |
| Session continuity | `820.31.23-session-continuity.js` | COMPLETE | Resume where left off |

### Gamification Features

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| XP & Leveling | `820.31.3-gamification.js:processCorrectAnswer()` | COMPLETE | Logarithmic progression |
| Answer Streaks | `820.31.3-gamification.js` | COMPLETE | Fire emoji, multipliers |
| Daily Challenges | `820.31.3-gamification.js:getDailyChallenges()` | COMPLETE | 10 challenge types |
| Achievements/Badges | `820.31.5-achievements.json` | COMPLETE | Milestone tracking |
| Combo System | `820.31.3-gamification.js:processCombo()` | COMPLETE | 8-second window |
| Lucky Strikes | `820.31.3-gamification.js` | COMPLETE | 10% random bonus |
| Study Calendar | `820.31.2-renderer.js:renderStudyCalendar()` | COMPLETE | Day streaks |
| Mastery Tiers | `820.31.3-gamification.js` | COMPLETE | Bronze -> Diamond |

### RPG Systems

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| D20 Rolling | `820.31.7-d20-system.js` | COMPLETE | Advantage/disadvantage |
| Character Stats | `820.31.7-d20-system.js` | COMPLETE | INT, WIS, CON, CHA |
| Equipment/Loot | `820.31.8-loot-system.js` | COMPLETE | 12 slots, rarity tiers |
| Roguelike Runs | `820.31.16-run-manager.js` | COMPLETE | Attempts, progression |
| Boss Battles | `820.31.15-boss-system.js` | COMPLETE | Category bosses |
| Card System | `820.31.25-card-system.js` | COMPLETE | Deck-based encounters |
| Card Battle UI | `820.31.26-card-battle-ui.js` | COMPLETE | Combat rendering |
| Powerups | `820.31.17-powerups.js` | COMPLETE | Temporary modifiers |

### Learning Science Features

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| Scaffolding | `820.31.6-scaffolding.js` | COMPLETE | Adaptive difficulty |
| ZPD System | `820.31.11-zpd-system.js` | COMPLETE | Challenge level tuning |
| Isotope Memory | `820.31.10-isotope-engine.js` | COMPLETE | TAIDRGEF tagging |
| Spaced Repetition | `index.html:QuizModes.srsData` | COMPLETE | Wrong answer priority |
| Confused Words | `820.31.22-confused-words.js` | COMPLETE | Disambiguation |
| Adaptive Sequencing | `820.31.21-adaptive-engine.js` | COMPLETE | Content selection |
| Multimodal Questions | `820.31.12-multimodal-questions.js` | COMPLETE | Text, image, audio |
| Scaffold Remediation | `820.31.14-scaffold-remediation.js` | COMPLETE | HP/damage system |

### UI/Rendering

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| Battle Scene (FF6) | `820.31.19-battle-scene.js` | COMPLETE | Animations, VFX |
| Inventory/Paperdoll | `820.31.2.2-renderer-inventory.js` | COMPLETE | Equipment display |
| D20 Character Sheet | `820.31.2.3-renderer-d20-ui.js` | COMPLETE | Stats, rolls |
| High Scores | `820.31.18-high-scores.js` | COMPLETE | Leaderboard |
| Anatomy Diagrams | `820.31.24-anatomy-diagrams.js` | COMPLETE | Interactive viz |
| Mobile Support | `820.31.0-mobile.css` | COMPLETE | Responsive |

### Game Modes (in index.html QuizModes)

| Mode | Status | Notes |
|------|--------|-------|
| Study Mode | COMPLETE | Exploration, no penalty |
| Review Mode (SRS) | COMPLETE | Spaced repetition |
| Test Prep Gauntlet | COMPLETE | 311 questions, 7 scaffolds |
| Blitz Mode | COMPLETE | 60-second timer |
| Lightning Mode | COMPLETE | 3 strikes |
| Jeopardy Mode | COMPLETE | Clue-based answers |
| Boss Arena | COMPLETE | Boss encounters |
| Stats View | COMPLETE | Progress tracking |

### Persistence & State

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| localStorage Save/Load | `820.31.4-persistence.js` | COMPLETE | Player data |
| Progress per question | `820.31.4-persistence.js` | COMPLETE | Individual tracking |
| Session tracking | `820.31.23-session-continuity.js` | COMPLETE | Stubs |
| Export/Import | `index.html` | COMPLETE | Backup functionality |
| Run state | `820.31.16-run-manager.js` | COMPLETE | Roguelike runs |

### Integration

| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| LUMI-OS Bridge | `820.31.13-lumi-bridge.js` | COMPLETE | WebSocket optional |
| Voice System | `820.31.2-renderer.js` | PARTIAL | TTS endpoints defined |
| PWA Support | `index.html`, `sw.js` | COMPLETE | Offline capable |

---

## 2. Current File Structure

```
820.31-Quiz_Engine/
+-- index.html                    (1,963 lines - includes QuizModes inline)
+-- 820.31-core/
    +-- 820.31.0-dev-tools.js     (135 lines)
    +-- 820.31.0-dev-panel.css    (3.5K)
    +-- 820.31.0-styles.css       (253K - 6000+ lines)
    +-- 820.31.0-mobile.css       (6.8K)
    +-- 820.31.1-app.js           (3,866 lines) **LARGEST**
    +-- 820.31.2-renderer.js      (3,154 lines) **LARGEST**
    +-- 820.31.2.2-renderer-inventory.js (396 lines)
    +-- 820.31.2.3-renderer-d20-ui.js    (376 lines)
    +-- 820.31.3-gamification.js  (1,170 lines)
    +-- 820.31.4-persistence.js   (869 lines)
    +-- 820.31.5-achievements.json (5K)
    +-- 820.31.6-scaffolding.js   (367 lines)
    +-- 820.31.7-d20-system.js    (662 lines)
    +-- 820.31.8-loot-system.js   (1,201 lines)
    +-- 820.31.10-isotope-engine.js (564 lines)
    +-- 820.31.11-zpd-system.js   (649 lines)
    +-- 820.31.12-multimodal-questions.js (789 lines)
    +-- 820.31.13-lumi-bridge.js  (803 lines)
    +-- 820.31.14-scaffold-remediation.js (571 lines)
    +-- 820.31.15-boss-system.js  (807 lines)
    +-- 820.31.16-run-manager.js  (750 lines)
    +-- 820.31.17-powerups.js     (810 lines)
    +-- 820.31.18-high-scores.js  (822 lines)
    +-- 820.31.19-battle-scene.js (1,112 lines)
    +-- 820.31.20-vocab-helper.js (325 lines)
    +-- 820.31.21-adaptive-engine.js (790 lines)
    +-- 820.31.22-confused-words.js (558 lines)
    +-- 820.31.23-session-continuity.js (612 lines)
    +-- 820.31.24-anatomy-diagrams.js (694 lines)
    +-- 820.31.25-card-system.js  (878 lines)
    +-- 820.31.26-card-battle-ui.js (776 lines)
    +-- 820.31-question-registry.json (13K)
```

---

## 3. Server-Handler Refactoring Plan

### Problem: Monolithic Files

The two largest files handle too many concerns:

**820.31.1-app.js (3,866 lines)** does:
- Quiz initialization and state
- Question bank loading
- Navigation (subject -> course -> topic -> question)
- Warmup/scaffold prerequisite flow
- Answer processing
- Mode management (gauntlet, arcade, study)
- Session continuity
- Lifelines (50/50, hints, extra lives)

**820.31.2-renderer.js (3,154 lines)** does:
- Question rendering
- Stats bar rendering
- Exploration panels
- Mechanism tours
- XP popups
- Calendar rendering
- Daily challenges
- High scores modal
- Battle mode rendering
- Voice lab UI

### Proposed Server-Handler Architecture

#### Phase 1: Split app.js (Server Pattern)

```
820.31.1-app.js (Server - orchestrator)
    |
    +-- 820.31.1.1-handler-navigation.js
    |       - Subject/course/topic selection
    |       - Breadcrumb management
    |       - Back navigation
    |
    +-- 820.31.1.2-handler-question-flow.js
    |       - Warmup prerequisite logic
    |       - Scaffold sequencing
    |       - Question progression
    |       - Answer validation
    |
    +-- 820.31.1.3-handler-gauntlet.js
    |       - Test prep mode
    |       - Lifelines
    |       - Game over logic
    |       - Ghost line progress
    |
    +-- 820.31.1.4-handler-modes.js
            - Mode selection (gauntlet/arcade)
            - Mode-specific settings
```

**Estimated reduction**: 3,866 -> ~1,500 lines in main server

#### Phase 2: Split renderer.js (Handler Pattern)

```
820.31.2-renderer.js (Core renderer)
    |
    +-- 820.31.2.1-renderer-panels.js
    |       - Exploration panels
    |       - Mechanism tours
    |       - Modal management
    |
    +-- 820.31.2.2-renderer-inventory.js (exists)
    |
    +-- 820.31.2.3-renderer-d20-ui.js (exists)
    |
    +-- 820.31.2.4-renderer-stats.js
    |       - Stats bar
    |       - XP popups
    |       - Calendar
    |       - Daily challenges
    |
    +-- 820.31.2.5-renderer-battle.js
            - Battle mode rendering
            - Boss display
            - Combat animations
```

**Estimated reduction**: 3,154 -> ~1,200 lines in core renderer

#### Phase 3: Consolidate Scaffolding

```
820.31.6-scaffold-engine.js (Decision logic)
    |
    +-- 820.31.6.1-scaffold-renderer.js
            - Merged from scaffold-module.js
            - Merged from scaffold-module-advanced.js
            - Unified rendering API
```

**Benefit**: 3 files -> 2 files, unified scaffold API

#### Phase 4: Consolidate Battle Systems

```
820.31.15-battle-orchestrator.js (Unified battle manager)
    |
    +-- 820.31.15.1-battle-renderer.js
    |       - FF6 scene rendering
    |       - Card battle rendering
    |
    +-- 820.31.15.2-battle-entities.js
            - Boss definitions
            - Mini-boss templates
            - Abilities
```

**Benefit**: Unified BattleManager interface

---

## 4. Implementation Priority

### Priority 1: High Impact, Low Risk
1. Split `820.31.1-app.js` into server + handlers
2. Split `820.31.2-renderer.js` into core + specialized renderers

### Priority 2: Medium Impact
3. Consolidate scaffolding files
4. Consolidate battle system files

### Priority 3: Lower Priority
5. Consolidate persistence/state management
6. Consolidate learning science modules

---

## 5. File Dependencies Graph

```
index.html
    |
    +-- 820.31.0-dev-tools.js
    +-- 820.31.4-persistence.js
    |       +-- localStorage
    |
    +-- 820.31.3-gamification.js
    |       +-- persistence
    |       +-- achievements.json
    |
    +-- 820.31.6-scaffolding.js
    |       +-- persistence
    |
    +-- 820.31.7-d20-system.js
    |       +-- persistence
    |
    +-- 820.31.8-loot-system.js
    |
    +-- 820.31.14-scaffold-remediation.js
    |       +-- persistence
    |       +-- d20System
    |
    +-- 820.31.15-boss-system.js
    +-- 820.31.16-run-manager.js
    +-- 820.31.17-powerups.js
    +-- 820.31.18-high-scores.js
    +-- 820.31.19-battle-scene.js
    +-- 820.31.20-vocab-helper.js
    +-- 820.31.25-card-system.js
    +-- 820.31.26-card-battle-ui.js
    +-- 820.31.21-adaptive-engine.js
    +-- 820.31.22-confused-words.js
    +-- 820.31.23-session-continuity.js
    +-- 820.31.24-anatomy-diagrams.js
    +-- 820.31.10-isotope-engine.js
    +-- 820.31.11-zpd-system.js
    +-- 820.31.13-lumi-bridge.js
    |
    +-- 820.31.2-renderer.js
    |       +-- All above systems
    |
    +-- 820.31.2.2-renderer-inventory.js (mixin)
    +-- 820.31.2.3-renderer-d20-ui.js (mixin)
    |
    +-- 820.31.1-app.js
            +-- All above systems
            +-- QuizRenderer instance
```

---

## 6. Global Singletons

The following globals are created at load time:

| Global | Created In | Used By |
|--------|------------|---------|
| `persistence` | 820.31.4-persistence.js | Almost everything |
| `gamification` | 820.31.3-gamification.js | app, renderer, modes |
| `scaffolding` | 820.31.6-scaffolding.js | app, renderer |
| `d20System` | 820.31.7-d20-system.js | app, renderer, battle |
| `lootSystem` | 820.31.8-loot-system.js | app, renderer, battle |
| `scaffoldRemediation` | 820.31.14-scaffold-remediation.js | app, battle |
| `quiz` | 820.31.1-app.js | Everything via window.quiz |
| `QuizModes` | index.html (inline) | Mode switching |

**Recommendation**: Consider a service locator or dependency injection pattern when refactoring.

---

## 7. CSS Architecture

The main stylesheet `820.31.0-styles.css` is 253KB (6000+ lines). Consider:

1. **CSS Custom Properties**: Already using `:root` variables - good
2. **Component splitting**: Could split into:
   - `820.31.0-styles-base.css` - Reset, typography, variables
   - `820.31.0-styles-quiz.css` - Question cards, options
   - `820.31.0-styles-battle.css` - Battle scenes, boss arena
   - `820.31.0-styles-stats.css` - Stats bars, calendars

---

## 8. Testing Recommendations

Currently no formal test suite. Recommended:

1. **Unit tests** for:
   - Gamification XP calculations
   - D20 rolling mechanics
   - SRS interval calculations
   - Scaffold decision logic

2. **Integration tests** for:
   - Question loading flow
   - Warmup prerequisite chains
   - Save/load cycle

3. **E2E tests** for:
   - Complete quiz session
   - Gauntlet run
   - Achievement unlocking

---

## 9. Performance Considerations

1. **Question loading**: Currently loads ALL questions at startup. Consider lazy loading by category.

2. **DOM operations**: Renderer does many innerHTML assignments. Consider virtual DOM or DocumentFragment.

3. **localStorage**: Multiple systems read/write independently. Consider batched writes.

---

## Conclusion

The Quiz Engine is feature-complete but architecturally could benefit from:

1. **Splitting the two largest files** using server-handler pattern
2. **Consolidating related subsystems** (scaffolding, battle, persistence)
3. **Adding a test suite** for core logic
4. **Lazy loading** questions by category

The refactoring can be done incrementally without breaking existing functionality.
