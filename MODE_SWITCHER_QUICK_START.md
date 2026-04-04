# Mode Switcher Quick Start Guide

**Version:** 1.0.0
**Date:** 2026-04-03
**Status:** Production Ready

---

## What Is This?

The pedagogical mode switcher allows users to toggle between two learning styles:

- **Study Mode:** Deep learning with auto-expanded explanations, serif fonts, calm colors
- **Adventure Mode:** Gamified learning with on-demand details, sans-serif, vibrant UI

Same question data, different presentation styles.

---

## Installation (3 Steps)

### Step 1: Include CSS
```html
<head>
  <link rel="stylesheet" href="820.31-core/820.31.0-styles.css">
  <link rel="stylesheet" href="820.31-core/820.31.99-mode-switcher.css">
</head>
```

### Step 2: Include JavaScript
```html
<body>
  <!-- Your quiz HTML -->

  <script src="820.31-core/820.31.98-quiz-modes.js"></script>
  <script src="820.31-core/820.31.98.1-pedagogical-modes.js"></script>
</body>
```

### Step 3: Enhance Your Question Rendering
```javascript
function renderQuestion(q) {
  // Your existing rendering logic
  let html = `
    <div class="question-card">
      <div class="q-text">${q.q}</div>
      <!-- options, explanations, etc. -->
    </div>
  `;

  // ADD THIS LINE:
  html = PedagogicalModes.enhanceQuestionCard(html, q.id);

  return html;
}

// After rendering all questions:
PedagogicalModes.attachExplainDeeperHandlers();
```

Done! The mode switcher is now active.

---

## Usage

### Get Current Mode
```javascript
const mode = PedagogicalModes.getPedagogicalMode();
// Returns: 'study' or 'adventure'
```

### Set Mode Programmatically
```javascript
PedagogicalModes.setPedagogicalMode('study');
// Switches to Study Mode, saves to localStorage, re-renders
```

### Toggle Between Modes
```javascript
PedagogicalModes.togglePedagogicalMode();
// Switches from current mode to the other
```

### Show Mode Selector Overlay
```javascript
PedagogicalModes.showModeSelector();
// Displays full-screen landing page with mode cards
```

### Add Toggle Button to Header
```javascript
const toggleHTML = PedagogicalModes.renderModeToggleButton();
document.getElementById('myHeader').innerHTML += toggleHTML;
PedagogicalModes.attachToggleButtonHandler();
```

---

## Conditional Rendering

### Check Current Mode
```javascript
if (PedagogicalModes.getPedagogicalMode() === 'study') {
  // Show extra content in Study Mode
  showDetailedExplanation();
}
```

### Helper Functions
```javascript
// Should explanations auto-expand?
if (PedagogicalModes.shouldAutoExpandExplanations()) {
  // true in Study Mode, false in Adventure Mode
}

// Should timers be shown?
if (PedagogicalModes.shouldShowTimers()) {
  // false in Study Mode, true in Adventure Mode
}

// Should game elements (XP, badges) be shown?
if (PedagogicalModes.shouldShowGameElements()) {
  // false in Study Mode, true in Adventure Mode
}
```

---

## Question HTML Requirements

For the mode switcher to work properly, your question HTML should include:

### Required Elements
```html
<div class="question-card">
  <!-- Question text -->
  <div class="q-text">What is the powerhouse of the cell?</div>

  <!-- Options -->
  <div class="options-grid"><!-- options here --></div>

  <!-- Explanation layer (will auto-expand in Study Mode) -->
  <div class="layer-explain" id="explain-{{qid}}">
    <div class="explain-text">The mitochondria...</div>

    <!-- Option explanations (shown in Study, hidden in Adventure) -->
    <div class="option-breakdown" id="option-breakdown-{{qid}}">
      <div class="option-explain">A: Correct because...</div>
      <div class="option-explain">B: Incorrect because...</div>
    </div>

    <!-- Mechanism (shown in Study, hidden in Adventure) -->
    <div class="mechanism" id="mechanism-{{qid}}">
      <div class="mechanism-title">How It Works</div>
      <div class="mechanism-content">ATP synthesis via...</div>
    </div>
  </div>
</div>
```

### Auto-Generated Elements
The mode switcher will automatically add:
- Mode class: `.study-mode` or `.adventure-mode`
- "Explain Deeper" button (Adventure Mode only)
- `.show` classes (Study Mode auto-expands)

---

## Styling Customization

### Override Mode Colors
```css
/* Study Mode - use cooler blues */
.question-card.study-mode {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05));
  border-color: rgba(59, 130, 246, 0.2);
}

/* Adventure Mode - use warmer oranges */
.question-card.adventure-mode {
  border-left: 3px solid #f97316;
}
```

### Adjust Spacing
```css
.question-card.study-mode {
  padding: 3rem; /* More spacious */
}

.question-card.adventure-mode {
  padding: 0.75rem; /* More compact */
}
```

---

## Events & Hooks

### Listen for Mode Changes
```javascript
// Override setPedagogicalMode to add custom behavior
const originalSetMode = PedagogicalModes.setPedagogicalMode;
PedagogicalModes.setPedagogicalMode = function(mode) {
  originalSetMode.call(this, mode);

  // Your custom logic here
  console.log('Mode changed to:', mode);
  updateMyCustomUI();
  trackAnalyticsEvent('mode_switch', { newMode: mode });
};
```

### On Mode Selector Close
```javascript
// Override hideModeSelector
const originalHide = PedagogicalModes.hideModeSelector;
PedagogicalModes.hideModeSelector = function() {
  originalHide.call(this);

  // Start the quiz after mode selection
  startQuiz();
};
```

---

## Testing

### Manual Test Checklist
- [ ] Mode selector shows on first load
- [ ] Clicking Study card switches to Study Mode
- [ ] Clicking Adventure card switches to Adventure Mode
- [ ] Mode persists after page reload
- [ ] Toggle button switches modes correctly
- [ ] Study Mode: All content auto-expanded
- [ ] Adventure Mode: "Explain Deeper" button works
- [ ] Study Mode: No XP popups or timers
- [ ] Adventure Mode: Game elements visible

### Browser Console Testing
```javascript
// Check current mode
PedagogicalModes.getPedagogicalMode();

// Switch mode
PedagogicalModes.setPedagogicalMode('study');

// Check localStorage
localStorage.getItem('luminara_pedagogical_mode');

// Clear saved mode (reset to default)
localStorage.removeItem('luminara_pedagogical_mode');
```

---

## Troubleshooting

### Mode Not Persisting
**Problem:** Mode resets to Adventure after page reload

**Solution:**
- Check localStorage is enabled
- Check browser isn't in private/incognito mode
- Verify `luminara_pedagogical_mode` key exists in localStorage

### Content Not Expanding in Study Mode
**Problem:** Explanations still collapsed in Study Mode

**Solution:**
- Ensure elements have correct IDs: `explain-{{qid}}`, `option-breakdown-{{qid}}`, `mechanism-{{qid}}`
- Verify `.show` class is being added (check Chrome DevTools)
- Ensure CSS file `820.31.99-mode-switcher.css` is loaded

### "Explain Deeper" Button Not Working
**Problem:** Clicking button does nothing in Adventure Mode

**Solution:**
- Verify `attachExplainDeeperHandlers()` is called after rendering
- Check button has `data-action="explain-deeper"` and `data-qid` attributes
- Ensure elements have `option-breakdown-{{qid}}` and `mechanism-{{qid}}` IDs

### Toggle Button Missing
**Problem:** Header toggle button doesn't appear

**Solution:**
- Call `PedagogicalModes.renderModeToggleButton()` to get HTML
- Call `PedagogicalModes.attachToggleButtonHandler()` after inserting HTML
- Verify button has ID `pedagogicalModeToggle`

---

## Examples

### Full Integration Example
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="820.31-core/820.31.0-styles.css">
  <link rel="stylesheet" href="820.31-core/820.31.99-mode-switcher.css">
</head>
<body>
  <div class="header">
    <h1>My Quiz</h1>
    <div id="headerControls"></div>
  </div>

  <div id="questionContainer"></div>

  <script src="820.31-core/820.31.98-quiz-modes.js"></script>
  <script src="820.31-core/820.31.98.1-pedagogical-modes.js"></script>
  <script>
    // Add toggle button to header
    document.getElementById('headerControls').innerHTML =
      PedagogicalModes.renderModeToggleButton();
    PedagogicalModes.attachToggleButtonHandler();

    // Render questions
    function renderQuestions() {
      const container = document.getElementById('questionContainer');
      container.innerHTML = myQuestions.map(q => {
        let html = `
          <div class="question-card">
            <div class="q-text">${q.q}</div>
            <div class="layer-explain" id="explain-${q.id}">
              <div class="explain-text">${q.explain}</div>
              <div class="option-breakdown" id="option-breakdown-${q.id}">
                ${q.optionExplains.map((exp, i) => `
                  <div class="option-explain">${String.fromCharCode(65 + i)}: ${exp}</div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
        return PedagogicalModes.enhanceQuestionCard(html, q.id);
      }).join('');

      PedagogicalModes.attachExplainDeeperHandlers();
    }

    renderQuestions();
  </script>
</body>
</html>
```

### Custom Mode Switcher Button
```javascript
// Create your own styled button
const btn = document.createElement('button');
btn.className = 'my-custom-mode-btn';
btn.textContent = 'Toggle Learning Style';
btn.addEventListener('click', () => {
  PedagogicalModes.togglePedagogicalMode();
  renderQuestions(); // Re-render with new mode
});
document.body.appendChild(btn);
```

---

## Files Reference

| File | Purpose | Size |
|------|---------|------|
| `820.31.99-mode-switcher.css` | Mode-specific styling | ~300 lines |
| `820.31.98.1-pedagogical-modes.js` | Mode switching logic | ~280 lines |
| `quick-quiz-with-mode-switcher.html` | Working demo | ~180 lines |

---

## Support

For issues or questions:
1. Check the full implementation report: `G:/Lumi-OS/Library/900-Records/930-Roadmap/AGENT1_MODE_SWITCHER_IMPLEMENTATION.md`
2. Review the demo file: `quick-quiz-with-mode-switcher.html`
3. Inspect browser console for error messages
4. Verify all required files are loaded (check Network tab in DevTools)

---

**Last Updated:** 2026-04-03
**Author:** Agent 1 (Mode Switcher Infrastructure)
**Status:** Production Ready ✅
