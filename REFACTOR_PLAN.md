# Quiz Engine Refactor Plan: Three-Layer Library Architecture

**Date**: 2026-03-26
**Status**: Phase 2 Complete - All Library Modules Extracted

---

## Final Architecture

```
Library/800-User_Applications/820-Teaching/
|
+-- 820.20-Learning_Techniques/     << LIBRARY (standalone, reusable)
|   +-- 820.21-srs-engine.js
|   +-- 820.22-zpd-system.js        [CREATED]
|   +-- 820.23-adaptive-scaffolding.js [CREATED]
|   +-- 820.24-isotope-engine.js    [CREATED]
|   +-- 820.25-confused-words.js
|   +-- 820.26-multimodal-questions.js
|   +-- 820.27-vocabulary-helper.js
|   +-- 820.28-diagram-renderer.js
|   +-- _index.md                   [CREATED]
|
+-- 820.40-Battle_Systems/          << LIBRARY (standalone, reusable)
|   +-- 820.41-d20-system.js        [CREATED]
|   +-- 820.42-loot-system.js
|   +-- 820.43-boss-system.js
|   +-- 820.44-card-system.js
|   +-- 820.45-hp-damage-system.js
|   +-- 820.46-run-manager.js
|   +-- 820.47-powerups.js
|   +-- 820.48-battle-renderer.js
|   +-- _index.md                   [CREATED]
|
+-- 820.30-Tools/
    +-- 820.31-Quiz_Engine/         << APPLICATION (imports libraries)
        +-- index.html
        +-- shell/                  << Quiz infrastructure (future)
        +-- 820.31-core/            << Current implementation
```

---

## Conceptual Model

```
+------------------------------------------------------------------+
|                    LIBRARY: 820.20 Learning Techniques            |
|                    (standalone, no Quiz dependencies)             |
+------------------------------------------------------------------+
|  ZPD System | Adaptive Scaffolding | Isotope Engine | SRS | ...  |
+------------------------------------------------------------------+
                              ^
                              | imports
+------------------------------------------------------------------+
|                    LIBRARY: 820.40 Battle Systems                 |
|                    (standalone, no Quiz dependencies)             |
+------------------------------------------------------------------+
|  D20 System | Loot | Bosses | Cards | HP/Damage | Powerups | ... |
+------------------------------------------------------------------+
                              ^
                              | imports
+------------------------------------------------------------------+
|                    820.31 QUIZ ENGINE (Application)               |
|                    Composes libraries into product                |
+------------------------------------------------------------------+
|  Quiz Shell: Navigation, Rendering, Persistence, Gamification    |
+------------------------------------------------------------------+
```

---

## Created Files

### 820.20-Learning_Techniques/ (8 files)

| File | Lines | Status |
|------|-------|--------|
| `_index.md` | ~200 | CREATED |
| `820.21-srs-engine.js` | ~500 | CREATED (new SM-2 implementation) |
| `820.22-zpd-system.js` | ~450 | CREATED |
| `820.23-adaptive-scaffolding.js` | ~300 | CREATED |
| `820.24-isotope-engine.js` | ~400 | CREATED |
| `820.25-confused-words.js` | ~240 | CREATED |
| `820.26-multimodal-questions.js` | ~380 | CREATED |
| `820.27-vocabulary-helper.js` | ~320 | CREATED |
| `820.28-diagram-renderer.js` | N/A | SKIPPED (use 720XX C++/CUDA) |

### 820.40-Battle_Systems/ (8 files)

| File | Lines | Status |
|------|-------|--------|
| `_index.md` | ~250 | CREATED |
| `820.41-d20-system.js` | ~450 | CREATED |
| `820.42-loot-system.js` | ~650 | CREATED |
| `820.43-boss-system.js` | ~500 | CREATED |
| `820.44-card-system.js` | ~650 | CREATED (Slay the Spire deck-building) |
| `820.45-hp-damage-system.js` | ~450 | CREATED (D20-based HP/damage) |
| `820.46-run-manager.js` | ~450 | CREATED |
| `820.47-powerups.js` | ~550 | CREATED (unlock progression) |
| `820.48-battle-renderer.js` | N/A | SKIPPED (app-specific UI) |

---

## Migration Path

### Phase 1: Create Library Modules [COMPLETE]
- [x] Create `820.20-Learning_Techniques/` directory
- [x] Create `820.40-Battle_Systems/` directory
- [x] Extract ZPD System to library
- [x] Extract Adaptive Scaffolding to library
- [x] Extract Isotope Engine to library
- [x] Extract D20 System to library
- [x] Write _index.md documentation

### Phase 2: Complete Library Extraction [COMPLETE]
- [x] Extract remaining learning techniques:
  - [x] 820.21-srs-engine.js (NEW - SM-2 algorithm, no prior implementation existed)
  - [x] 820.25-confused-words.js
  - [x] 820.26-multimodal-questions.js
  - [x] 820.27-vocabulary-helper.js
  - [x] 820.28-diagram-renderer.js (SKIPPED - use 720XX C++/CUDA canonical implementation)
- [x] Extract remaining battle modules:
  - [x] 820.42-loot-system.js
  - [x] 820.43-boss-system.js
  - [x] 820.44-card-system.js (Slay the Spire deck-building)
  - [x] 820.45-hp-damage-system.js (D20-based HP/damage)
  - [x] 820.46-run-manager.js
  - [x] 820.47-powerups.js (unlock progression, inventory)
  - [x] 820.48-battle-renderer.js (SKIPPED - application-specific UI code)

### Phase 3: Update Quiz Engine Imports [PENDING]
- [ ] Update index.html script tags to load from libraries
- [ ] Create shim files in 820.31-core/ that re-export library modules
- [ ] Test that all functionality still works
- [ ] Remove duplicate code from 820.31-core/

### Phase 4: Refactor Quiz Shell [PENDING]
- [ ] Create `shell/` directory
- [ ] Move core quiz files to shell/
- [ ] Reduce 820.31.1-app.js from 3,866 lines
- [ ] Reduce 820.31.2-renderer.js from 3,154 lines

---

## Import Patterns

### Current (Quiz Engine owns everything)
```javascript
// In 820.31-core/820.31.1-app.js
// All code is local, tightly coupled
```

### Future (Quiz Engine imports from Libraries)
```javascript
// In 820.31-Quiz_Engine/shell/quiz-app.js
import { ZPDSystem } from '../../820.20-Learning_Techniques/820.22-zpd-system.js';
import { IsotopeEngine } from '../../820.20-Learning_Techniques/820.24-isotope-engine.js';
import { AdaptiveScaffolding } from '../../820.20-Learning_Techniques/820.23-adaptive-scaffolding.js';

import { D20System } from '../../820.40-Battle_Systems/820.41-d20-system.js';
import { LootSystem } from '../../820.40-Battle_Systems/820.42-loot-system.js';
import { BossSystem } from '../../820.40-Battle_Systems/820.43-boss-system.js';

class QuizApp {
  constructor() {
    // Learning techniques
    this.zpd = ZPDSystem;
    this.isotope = IsotopeEngine;
    this.scaffolding = AdaptiveScaffolding;

    // Battle systems
    this.d20 = new D20System();
    this.loot = new LootSystem();
    this.boss = new BossSystem(this.d20);
  }
}
```

### Browser Compatibility (Script Tags)
```html
<!-- Load libraries first -->
<script src="../../820.20-Learning_Techniques/820.22-zpd-system.js"></script>
<script src="../../820.20-Learning_Techniques/820.24-isotope-engine.js"></script>
<script src="../../820.40-Battle_Systems/820.41-d20-system.js"></script>

<!-- Then load Quiz Engine (uses window.ZPDSystem, etc.) -->
<script src="820.31-core/820.31.1-app.js"></script>
```

---

## Benefits Achieved

### 1. Reusability
```javascript
// Future flashcard app can use same techniques:
import { SRSEngine } from '../820.20-Learning_Techniques/820.21-srs-engine.js';
import { ZPDSystem } from '../820.20-Learning_Techniques/820.22-zpd-system.js';

// Future study game can use battle systems:
import { D20System } from '../820.40-Battle_Systems/820.41-d20-system.js';
import { LootSystem } from '../820.40-Battle_Systems/820.42-loot-system.js';
```

### 2. Independent Updates
- Fix a bug in ZPD? All apps get the fix automatically
- Add a new learning technique? All apps can opt-in
- Improve D20 rolling? Battle games benefit immediately

### 3. Clear Ownership
| Layer | Owner | Updates When |
|-------|-------|--------------|
| Learning Techniques | Library maintainer | Research advances, bug fixes |
| Battle Systems | Library maintainer | New mechanics, balance changes |
| Quiz Engine | App developer | UI/UX, app-specific features |

### 4. Testability
```bash
# Test learning techniques in isolation
npm test -- 820.20-Learning_Techniques/

# Test battle systems in isolation
npm test -- 820.40-Battle_Systems/

# Test quiz app integration
npm test -- 820.31-Quiz_Engine/
```

---

## File Inventory

### 820.20-Learning_Techniques (7 modules extracted, 1 skipped)

| Module | Source | Status | Lines |
|--------|--------|--------|-------|
| 820.21 SRS Engine | NEW (no prior implementation) | DONE | ~500 |
| 820.22 ZPD System | 820.31.11-zpd-system.js | DONE | ~450 |
| 820.23 Adaptive Scaffolding | 820.31.6-scaffolding.js + 820.31.21-adaptive-engine.js | DONE | ~300 |
| 820.24 Isotope Engine | 820.31.10-isotope-engine.js | DONE | ~400 |
| 820.25 Confused Words | 820.31.22-confused-words.js | DONE | ~240 |
| 820.26 Multimodal Questions | 820.31.12-multimodal-questions.js | DONE | ~380 |
| 820.27 Vocabulary Helper | 820.31.20-vocab-helper.js | DONE | ~320 |
| 820.28 Diagram Renderer | 720XX C++/CUDA | SKIPPED | N/A |

### 820.40-Battle_Systems (7 modules extracted, 1 skipped)

| Module | Source | Status | Lines |
|--------|--------|--------|-------|
| 820.41 D20 System | 820.31.7-d20-system.js | DONE | ~450 |
| 820.42 Loot System | 820.31.8-loot-system.js | DONE | ~650 |
| 820.43 Boss System | 820.31.15-boss-system.js | DONE | ~500 |
| 820.44 Card System | 820.31.25-card-system.js | DONE | ~650 |
| 820.45 HP/Damage System | 820.31.14-scaffold-remediation.js | DONE | ~450 |
| 820.46 Run Manager | 820.31.16-run-manager.js | DONE | ~450 |
| 820.47 Powerups | 820.31.17-powerups.js | DONE | ~550 |
| 820.48 Battle Renderer | App-specific UI | SKIPPED | N/A |

---

## Next Steps

1. ~~**Complete Phase 2**: Extract remaining modules to libraries~~ DONE
2. **Test imports**: Verify browser and Node.js compatibility
3. **Update Quiz Engine**: Switch to library imports (Phase 3)
4. **Refactor quiz shell**: Split large files (Phase 4)
5. **Update deployment**: Ensure GitHub Pages workflow copies library files

## Decisions Made (Session 52)

### Modules Skipped (Not Extracted)

| Module | Reason |
|--------|--------|
| 820.28 Diagram Renderer | Use canonical 720XX C++/CUDA implementation instead |
| 820.48 Battle Renderer | Application-specific UI code, varies by app |

### Modules Created (No Prior Implementation)

| Module | Note |
|--------|------|
| 820.21 SRS Engine | No SM-2 implementation existed anywhere in LUMI-OS. Created new. |
