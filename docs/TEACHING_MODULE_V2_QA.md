# TeachingModuleV2 QA Notes

## Scope

TeachingModuleV2 is a parallel module layer. It does not replace
`LuminaraQuiz`, `QuizModes`, `QuestionOrchestrator`, or the default Lab Exam II
runtime.

## Promotion Switch

Lab Exam II v2 preview is enabled with:

```text
lab-exam-ii/?v2=1
```

The default route remains:

```text
lab-exam-ii/
```

## Public Diagnostics

Public-safe diagnostics are available at:

```text
lab-exam-ii/diagnostics.html
```

Diagnostics may include content counts, schema health, route status, and
coverage by kind/system. Diagnostics must not include learner progress, local
notes, highlighted text, or private Lumi memory.

## Required Checks

```powershell
node --check 820.31-v2/teaching-module-v2.js
node --check lab-exam-ii/v2-bridge.js
node --check lab-exam-ii/diagnostics.js
node --check lab-exam-ii/app.js
node tools/verify-teaching-v2.js
node tools/validate-questions.js --output teaching-module-v2-audit.html
```

Browser QA:

- `lab-exam-ii/` still hides answers until reveal/choice.
- `lab-exam-ii/?v2=1` renders the same visible study content.
- `lab-exam-ii/diagnostics.html` renders counts and privacy flags.
- Mobile width has no horizontal overflow in Quick Roll.

## 2026-05-04 Verification

- `node tools/verify-teaching-v2.js` passed: 1,300 Lab Exam II canonical
  items, zero diagnostics errors, no learner/private memory in public
  diagnostics.
- `node tools/validate-questions.js --output teaching-module-v2-audit.html`
  passed and wrote to `artifacts/quiz-engine/reports`; strict blockers are
  reserved for schema/load failures, while distractor relevance remains a
  medium-priority teaching-quality review signal.
- `node tools/validate-questions.js --strict --output
  teaching-module-v2-audit-strict.html` passed with
  `CRITICAL=0 HIGH=0 MEDIUM=0 LOW=225`. Low-priority findings are authoring
  backlog only: missing structured mechanism depth and heuristic distractor
  review prompts.
- Chrome headless smoke passed for default desktop, v2 desktop, diagnostics
  desktop, and v2 mobile: no runtime errors, no initial answer text, score
  buttons disabled before reveal, and no horizontal overflow.

## Gateway Note

The work-order record `wrk-20260504-teaching-module-v2` has been submitted and
closed with `decision=accepted`. Its `submission.json` lists the Quiz Engine V2
paths and the accepted check evidence. The route metadata still carries the
older `820.010` codon projection, so future Quiz Engine work should prefer the
source-path dock or a corrected `820.31` registry route rather than relying on
exact-codon intake for this lane.
