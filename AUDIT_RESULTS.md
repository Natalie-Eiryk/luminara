# Quiz Engine 15-Issue Audit Report (820.31)

**Codon:** 820.31.99
**Version:** 2026-04-01
**Source Sessions:** 56, 57
**Isotopes:** `quiz.audit`, `code.quality`, `accessibility.aria`
**Operators:** R.G.D (React, Gravitate, Diminish)

---

## The Core Insight

**A comprehensive code audit identified 15 issues across 4 priority levels. Each issue has a clear fix path and affects specific files.**

This audit covers:
- Security vulnerabilities (XSS, global pollution)
- Accessibility gaps (ARIA, focus indicators)
- Performance issues (blocking scripts, monolithic code)
- Maintenance concerns (console logs, inline CSS)

---

## Issue Summary

| Priority | Count | Impact |
|----------|-------|--------|
| **Critical (P0)** | 3 | Breaks core functionality |
| **High (P1)** | 4 | Degrades UX significantly |
| **Medium (P2)** | 4 | Affects quality/discoverability |
| **Low (P3)** | 4 | Technical debt |

---

## Critical Issues (P0)

### 1. Service Worker Broken Paths

**File:** `sw.js`
**Problem:** References `./000-core/` but actual folder is `./820.31-core/`
**Impact:** Offline mode completely broken

```javascript
// WRONG in sw.js
const PRECACHE_URLS = [
  './000-core/app.js',  // Path doesn't exist!
  // ...
];

// CORRECT
const PRECACHE_URLS = [
  './820.31-core/820.31.1-app.js',
  // ...
];
```

**Fix:** Update all paths in sw.js to match actual folder structure.

---

### 2. Global Variable Pollution

**File:** `820.31.1-app.js`, lines 150-154
**Problem:** Variables declared without `let`/`const`
**Impact:** Pollutes global scope, potential collisions, security risk

```javascript
// WRONG (implicit globals)
questionIndex = 0;
score = 0;
isAnswered = false;

// CORRECT
let questionIndex = 0;
let score = 0;
let isAnswered = false;
```

**Fix:** Add `let` or `const` to all variable declarations. Run ESLint with `no-implicit-globals` rule.

---

### 3. Missing ARIA Labels

**File:** `index.html`
**Problem:** Interactive elements lack accessibility labels
**Impact:** Screen readers cannot describe functionality

| Element | Missing Label |
|---------|---------------|
| Leaderboard button | `aria-label="View leaderboard"` |
| Export button | `aria-label="Export data"` |
| Import button | `aria-label="Import data"` |
| Reset button | `aria-label="Reset progress"` |
| Dev panel close | `aria-label="Close developer panel"` |
| Navigation element | `role="navigation"` + `aria-label` |

**Fix:** Add appropriate ARIA attributes to all interactive elements.

---

## High Priority Issues (P1)

### 4. Transition Lock Never Released on Error

**File:** `820.31.1-app.js`, line 1378
**Problem:** If `renderBossQuestion()` throws, `isTransitioning` stays `true` forever
**Impact:** Quiz becomes permanently frozen

```javascript
// WRONG - no try/catch
this.isTransitioning = true;
await this.renderBossQuestion();
this.isTransitioning = false;  // Never reached if error!

// CORRECT
this.isTransitioning = true;
try {
  await this.renderBossQuestion();
} finally {
  this.isTransitioning = false;  // Always releases lock
}
```

**Fix:** Wrap all transition operations in try/finally blocks.

---

### 5. Missing defer on 47 Script Tags

**File:** `index.html`, lines 1184-1277
**Problem:** Script tags block HTML parsing
**Impact:** Slow initial page load, visible FOUC

```html
<!-- WRONG - blocks parsing -->
<script src="820.31-core/820.31.1-app.js"></script>

<!-- CORRECT - defers execution -->
<script defer src="820.31-core/820.31.1-app.js"></script>
```

**Fix:** Add `defer` attribute to all non-inline script tags.

---

### 6. Relative Paths Break in Subdirectory Deployment

**File:** Multiple exam link references
**Problem:** Links use relative paths without leading `/`
**Impact:** Links break when deployed to subdirectory (e.g., `/quiz/`)

```javascript
// WRONG
window.location.href = 'exam-611.html';

// CORRECT
window.location.href = '/exam-611.html';
// OR use base URL
window.location.href = `${window.APP_BASE_URL}/exam-611.html`;
```

**Fix:** Use absolute paths or configure base URL.

---

### 7. Question Count Discrepancies in Registry

**File:** `820.31-question-registry.json` vs actual question files
**Problem:** Registry says `000.1` has 12 questions but file has 18
**Impact:** Progress tracking incorrect, potential undefined behavior

**Fix:**
1. Run sync audit: `node scripts/sync-registry.js`
2. Update registry counts to match actual files
3. Add CI check to prevent future drift

---

## Medium Priority Issues (P2)

### 8. No Isotope System for Anatomy/Physiology

**Files:** `611-anatomy/`, `612-physiology/`
**Problem:** Math (510.XX) has isotope/prerequisite system, anatomy lacks it
**Impact:** No prerequisite tracking, no concept threading

**Fix:** Create isotope tags for anatomy/physiology topics:
```json
{
  "isotopes": ["tissue.epithelial", "anatomy.histology"],
  "prerequisites": ["611.001-basic-tissues"]
}
```

---

### 9. 63 Console.log Statements in Production

**File:** `820.31.1-app.js`
**Problem:** Debug statements pollute console
**Impact:** Console spam, potential data leakage

**Fix:**
1. Remove or wrap in `DEBUG` flag
2. Add build step to strip console.log
3. Use proper logging framework

---

### 10. Missing Open Graph / Twitter Card Meta Tags

**File:** `index.html`
**Problem:** No social media preview metadata
**Impact:** Poor appearance when shared on social media

```html
<!-- Add to <head> -->
<meta property="og:title" content="Ms. Luminara Quiz">
<meta property="og:description" content="Learn anatomy and physiology with adaptive scaffolding">
<meta property="og:image" content="assets/preview.png">
<meta property="og:url" content="https://luminara.natalie-eiryk.com/">
<meta name="twitter:card" content="summary_large_image">
```

---

### 11. README.md Link Broken

**File:** `index.html`, line 814
**Problem:** References GitHub Pages raw `.md` file
**Impact:** Link doesn't render properly

**Fix:** Link to GitHub repository instead of raw file, or render README separately.

---

## Low Priority Issues (P3)

### 12. Monolithic JavaScript File (7014 lines)

**File:** `820.31.1-app.js`
**Problem:** Single file contains all logic
**Impact:** Difficult to maintain, debug, test

**Recommended Split:**
| Module | Lines | Purpose |
|--------|-------|---------|
| `quiz-core.js` | ~1500 | Question loading, scoring |
| `quiz-ui.js` | ~2000 | DOM manipulation, rendering |
| `quiz-data.js` | ~1000 | Storage, persistence |
| `quiz-scaffold.js` | ~1000 | Scaffolding system |
| `quiz-battle.js` | ~1500 | Card battle mode |

---

### 13. Inline Event Handlers (XSS Risk)

**File:** `index.html`
**Problem:** Many `onclick="quiz.method()"` handlers
**Impact:** Potential XSS if quiz object is compromised

```html
<!-- WRONG - inline handler -->
<button onclick="quiz.submitAnswer()">Submit</button>

<!-- CORRECT - event listener -->
<button id="submit-btn">Submit</button>
<script>
  document.getElementById('submit-btn')
    .addEventListener('click', () => quiz.submitAnswer());
</script>
```

**Fix:** Replace inline handlers with `addEventListener` calls.

---

### 14. 673 Lines of Inline CSS

**File:** `index.html`, lines 33-674
**Problem:** CSS cannot be cached separately, increases HTML size
**Impact:** Slower page loads, difficult to maintain

**Fix:** Extract to `820.31-core/quiz.css` and link:
```html
<link rel="stylesheet" href="820.31-core/quiz.css">
```

---

### 15. Missing Focus Indicators

**File:** `index.html` CSS
**Problem:** No visible focus outline for keyboard navigation
**Impact:** Keyboard users cannot see which element is focused

```css
/* Add to CSS */
:focus-visible {
  outline: 3px solid var(--accent-color);
  outline-offset: 2px;
}

/* Don't hide focus for keyboard users */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## Fix Priority Order

### Phase 1: Critical (Immediate)
1. ✅ Fix service worker paths
2. ✅ Add let/const to globals
3. ✅ Add ARIA labels

### Phase 2: High (This Sprint)
4. Add try/finally to transitions
5. Add defer to scripts
6. Fix relative paths
7. Sync question registry

### Phase 3: Medium (Next Sprint)
8. Add anatomy/physiology isotopes
9. Remove console.logs
10. Add Open Graph tags
11. Fix README link

### Phase 4: Low (Backlog)
12. Split monolithic JS
13. Replace inline handlers
14. Extract inline CSS
15. Add focus indicators

---

## Verification Checklist

- [ ] Service worker loads questions offline
- [ ] No implicit global errors in strict mode
- [ ] Screen reader announces all buttons
- [ ] Error during transition doesn't freeze quiz
- [ ] Page loads without FOUC
- [ ] Links work from subdirectory deployment
- [ ] Registry question counts match files
- [ ] Anatomy questions have isotope tags
- [ ] Console is clean in production
- [ ] Social media preview looks correct
- [ ] README link opens properly
- [ ] Build produces separate JS modules
- [ ] No inline onclick handlers
- [ ] CSS in separate cacheable file
- [ ] Focus outline visible on keyboard nav

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [ARCHITECTURE_AUDIT](ARCHITECTURE_AUDIT.md) | Full architecture review |
| [SCAFFOLD_SYSTEM](SCAFFOLD_SYSTEM.md) | Scaffolding implementation |
| [REGISTRY_FORMAT](REGISTRY_FORMAT.md) | Question registry format |

---

## Isotope Threading

**Pull this thread to find:**
- `quiz.audit` - Audit results
- `code.quality` - Code quality issues
- `accessibility.*` - Accessibility concerns
- `security.*` - Security issues

**Co-occurs with:**
- `quiz.registry` - Registry sync issues
- `scaffold.system` - Scaffolding gaps
- `teaching.zpd` - Learning system

---

*"Every bug fixed is a learner who won't be frustrated. Prioritize by impact on learning."*
— Session 57
