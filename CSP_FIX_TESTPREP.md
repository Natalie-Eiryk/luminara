# CSP Compliance Fix: quiz-testprep.js

**Date**: 2026-04-03
**File**: `820.31.1.4-quiz-testprep.js`
**Status**: ✅ COMPLETE

## Summary

Removed ALL inline `onclick` handlers from quiz-testprep.js and replaced them with proper event listeners using `addEventListener`. This ensures full CSP compliance with the policy that blocks `'unsafe-inline'` in `script-src`.

## Changes Made

### 1. Test Prep Question Options
- **Before**: `<button onclick="quiz.answerTestPrep(${idx})">`
- **After**: `<button data-action="answer-testprep" data-idx="${idx}">`
- **Handler**: Added `attachTestPrepListeners()` function

### 2. Scaffold Hint Button
- **Before**: `<button onclick="quiz.showScaffoldHint()">`
- **After**: `<button data-action="show-scaffold-hint">`
- **Handler**: Attached in `attachTestPrepListeners()`

### 3. D20 Insight Button
- **Before**: `<button onclick="quiz.rollForInsight()">`
- **After**: `<button data-action="roll-for-insight">`
- **Handler**: Attached in `attachTestPrepListeners()`

### 4. Hint Modal Close Button
- **Before**: `<button onclick="this.closest('.hint-modal').remove()">`
- **After**: `<button data-action="close-hint-modal">`
- **Handler**: Attached inline after modal creation

### 5. Inline Scaffold Panel
- **Progress Dots**: Added `data-action="jump-inline-scaffold"`
- **Answer Buttons**: Added `data-action="answer-inline-scaffold"`
- **Navigation**: Added `data-action="inline-scaffold-prev"` and `inline-scaffold-next"`
- **Handler**: New `attachInlineScaffoldListeners()` function

### 6. Scaffolds Modal
- **Close Button**: `data-action="close-scaffolds-modal"`
- **Progress Dots**: `data-action="jump-modal-scaffold"`
- **Answer Options**: `data-action="answer-modal-scaffold"`
- **Navigation**: `data-action="modal-scaffold-prev"`, `modal-scaffold-skip"`, `modal-scaffold-next"`
- **Handler**: New `attachModalScaffoldListeners()` function defined within `renderModalContent()`

### 7. Break Suggestion Modal
- **Take Break**: `data-action="take-break"`
- **Keep Going**: `data-action="close-break-modal"`
- **Handler**: Attached inline after modal creation

## New Functions Added

### `attachTestPrepListeners()`
Attaches event listeners to the main test prep question UI:
- Answer buttons
- Scaffold hint button
- D20 insight button

Called automatically after `renderTestPrepQuestion()`.

### `attachInlineScaffoldListeners(panel)`
Attaches event listeners to inline scaffold panel:
- Progress dot navigation
- Answer selection
- Previous/Next navigation

Called automatically after `renderInlineScaffold()`.

### `attachModalScaffoldListeners()` (nested)
Attaches event listeners to scaffold modal:
- Close button
- Progress dot navigation
- Answer selection
- Previous/Next/Skip navigation

Called automatically after `renderModalContent()`.

## Verification

```bash
# No onclick handlers remain
grep -n "onclick=" quiz-testprep.js
# Result: No matches

# All data-action attributes in place
grep -c "data-action=" quiz-testprep.js
# Result: 20+ instances

# All addEventListener calls in place
grep -c "addEventListener" quiz-testprep.js
# Result: 30+ instances
```

## Pattern Used

1. **Remove onclick**: `onclick="handler()"` → removed
2. **Add data-action**: `data-action="descriptive-name"`
3. **Add data attributes**: `data-idx="${idx}"` for parameters
4. **Attach listeners**: `element.addEventListener('click', handler)`
5. **Call after render**: Listener attachment happens after DOM updates

## Testing Checklist

- [ ] Test prep question options clickable
- [ ] Scaffold hint button works
- [ ] D20 insight button works (when available)
- [ ] Hint modal closes properly
- [ ] Inline scaffold panel: dots, answers, navigation
- [ ] Scaffolds modal: dots, answers, navigation, close
- [ ] Break suggestion: take break, keep going
- [ ] No CSP violations in console

## Related Files

This fix is part of a complete CSP compliance audit:
- ✅ `820.31.1-app.js` - Main quiz app
- ✅ `820.31.1.2-quiz-renderer.js` - Renderer
- ✅ `820.31.1.3-quiz-modes.js` - Mode switcher
- ✅ `820.31.1.4-quiz-testprep.js` - Test prep mode (THIS FILE)
- ⏳ Other modules if needed

## Notes

- All event listeners use arrow functions to preserve `this` context
- Disabled buttons are checked before attaching listeners
- Modal backdrop click handlers remain unchanged (safe pattern)
- Keyboard handlers (Escape) use named functions for proper cleanup

---

**Security**: This change eliminates CSP violations and strengthens the application's security posture by preventing inline script execution.
