# Voice Violations Quick Reference
## Enriched Question Voice Standardization

**Target Voice:** Ms. Luminara (warm, clinical, encouraging)
**Reference Example:** `612.2-fri-night-quiz-4.3.26.json`
**Voice Guide:** `.claude/docs/800-ms-luminara-voice-guide.md`

---

## Quick Detection Checklist

When reviewing enriched questions, flag these patterns:

### HIGH PRIORITY - Remove Immediately

- [ ] **Theatrical Openings**
  - "Chart this course:"
  - "Journey with me"
  - "Navigate with me:"
  - "Let me walk you through"
  - "Embark on this:"
  - "Venture here:"
  - "Traverse this territory:"

- [ ] **Em-Dash Fragments**
  - "Here —"
  - "Now —"
  - "Wait for it —"
  - "Observe carefully now:"
  - "The plot thickens beautifully here:"
  - "The crescendo approaches:"

- [ ] **Immersive Commands**
  - "Surrender to the logic"
  - "Breathe in this knowledge"
  - "Allow this to wash over you"
  - "Embrace this:"
  - "Permit yourself to feel this:"
  - "Grant yourself"
  - "Invite this in:"

### MEDIUM PRIORITY - Replace with Ms. Luminara Voice

- [ ] **Poetic Evaluations (Standalone)**
  - "Exquisite."
  - "Devastating."
  - "Stunning."
  - "Pure physiological poetry."
  - "Evolution's crowning achievement"
  - "The body's quiet genius"
  - "Sublimely intricate"
  - "Beautifully inevitable"

- [ ] **Dramatic Build-Ups**
  - "Wait for it..."
  - "What comes next will dazzle you:"
  - "The elegance reveals itself here:"
  - "Here's where the anatomy becomes exquisite:"
  - "Now for the piece de resistance:"

- [ ] **Second-Person Immersion**
  - "Let me show you"
  - "Let me take you"
  - "Join me in"
  - "Walk with me"
  - "Follow me deeper:"

### LOW PRIORITY - Easy Fixes

- [ ] **All-Caps Emphasis**
  - "PACKED"
  - "DESTROYED"
  - "ALL"
  - "BOTH"
  - Replace with italics or remove emphasis

- [ ] **Ellipsis for Drama**
  - "..." at end of sentences for suspense
  - Replace with period

---

## Replacement Patterns

### Opening Phrases

| **REMOVE (Enriched)** | **REPLACE (Ms. Luminara)** |
|----------------------|---------------------------|
| "Chart this course:" | "Correct!" (if answer correct) |
| "Journey with me" | "Precisely." (if answer correct) |
| "Navigate with me:" | "Not quite." (if answer incorrect) |
| "Let me walk you through" | "Exactly." (if answer correct) |
| "Embark on this:" | "Close, but..." (if answer incorrect) |

### Transition Phrases

| **REMOVE (Enriched)** | **REPLACE (Ms. Luminara)** |
|----------------------|---------------------------|
| "Here —" | "At this point," / "Now," |
| "Wait for it..." | (Remove - state fact directly) |
| "Observe carefully now:" | (Remove - state fact directly) |
| "Surrender to the logic here:" | "The key insight is:" |
| "Breathe in this knowledge:" | "Remember:" |

### Evaluative Phrases

| **REMOVE (Enriched)** | **REPLACE (Ms. Luminara)** |
|----------------------|---------------------------|
| "Exquisite." | (Remove - keep clinical) |
| "Devastating." | "This has serious clinical consequences." |
| "Pure physiological poetry." | (Remove - keep clinical) |
| "The body's quiet genius" | "This demonstrates efficient design." |
| "and it's devastating" | "This creates significant problems:" |

---

## Before/After Quick Examples

### Example 1: Theatrical Opening

**BEFORE:**
> "Chart this course: Into one of neurology's most exquisite puzzles."

**AFTER:**
> "Correct! This is one of neurology's classic clinical syndromes."

---

### Example 2: Em-Dash Fragment

**BEFORE:**
> "Wait for it... Here — the tissue transforms into something it was never meant to be."

**AFTER:**
> "The tissue transforms into a different cell type in response to chronic irritation."

---

### Example 3: Immersive Command

**BEFORE:**
> "Surrender to the logic here: Evolution's crowning achievement."

**AFTER:**
> "This design reflects evolutionary optimization for efficiency."

---

### Example 4: All-Caps + Poetic

**BEFORE:**
> "The cells are PACKED together. Exquisite."

**AFTER:**
> "The cells are densely packed together with minimal space between them."

---

## Ms. Luminara Voice Essentials

### DO Use:
- "Correct!" / "Precisely." / "Exactly." (for correct answers)
- "Not quite." / "Close, but..." (for incorrect answers)
- "Without [X], [consequence]..." structure
- Clear, direct clinical language
- Warm encouragement: "This is a common misconception."
- Natural conversational flow

### DON'T Use:
- Theatrical imperatives ("Chart this", "Journey with me")
- Em-dash sentence fragments
- Poetic standalone evaluations ("Exquisite.", "Devastating.")
- Immersive second-person commands ("Surrender to", "Breathe in")
- All-caps emphasis (use italics sparingly if needed)
- Dramatic pauses ("Wait for it...", "...")

---

## Workflow for Voice Polishing

1. **Open enriched file** in editor
2. **Search for violation patterns** (Ctrl+F):
   - "Chart this"
   - "Journey"
   - "—" (em-dash)
   - "Wait for it"
   - "Exquisite"
   - ALL-CAPS words
3. **For each violation:**
   - Identify pattern type (theatrical opening, em-dash, etc.)
   - Apply replacement from this guide
   - Verify clinical accuracy maintained
   - Check natural flow
4. **Final read:**
   - Does it sound like Ms. Luminara? (warm, clinical, encouraging)
   - No theatrical language remaining?
   - Maintains student engagement without drama?
5. **Save and mark file as polished**

---

## Severity Classification

**Severity 1 (Major - 15+ violations):**
- Files: 200.1, 200.2, 400.1, 400.2
- Estimated time: 30 minutes per file
- Heavy theatrical voice throughout

**Severity 2 (Medium - 5-10 violations):**
- Files: 100.1-100.5, 500.1-500.3, 600.1-600.4
- Estimated time: 15 minutes per file
- Moderate theatrical voice

**Severity 3 (Light - 1-3 violations):**
- Files: 000.1-000.5, achievement badges
- Estimated time: 5 minutes per file
- Minimal theatrical voice

---

**Last Updated:** 2026-04-03
**For:** Quiz Upgrade Phase 2 - Voice Standardization
**Reference:** AGENT5_VOICE_STANDARDIZATION_AUDIT.md
