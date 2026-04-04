# Quiz Engine Scaffold System (820.31)

**Codon:** 820.31.06
**Version:** 2026-04-01
**Source Sessions:** 55, 56, 57
**Isotopes:** `scaffold.system`, `teaching.zpd`, `remediation.adaptive`
**Operators:** A.R.F (Aggregate, React, Frame)

---

## The Core Insight

**Scaffolding is Vygotsky's ZPD made actionable. The system tracks where each learner struggles and provides targeted support exactly where needed.**

The scaffold system:
- Tracks performance per topic and concept
- Adjusts support level based on struggles
- Progressive challenge when mastering
- Spaced repetition for reinforcement

---

## Scaffold Architecture

```
                     ANSWER
                        │
                        ▼
    ┌──────────────────────────────────────┐
    │         ScaffoldingEngine            │
    │  ┌─────────────────────────────────┐ │
    │  │ recordAnswer(questionId, result)│ │
    │  └─────────────────────────────────┘ │
    │              │                       │
    │              ▼                       │
    │  ┌─────────────────────────────────┐ │
    │  │ Topic Performance Tracker       │ │
    │  │ - attempts, correct, explorations│ │
    │  │ - consecutiveCorrect/Wrong      │ │
    │  └─────────────────────────────────┘ │
    │              │                       │
    │              ▼                       │
    │  ┌─────────────────────────────────┐ │
    │  │ Scaffold Level Calculator       │ │
    │  │ HEAVY → MODERATE → LIGHT → CHAL │ │
    │  └─────────────────────────────────┘ │
    │              │                       │
    │              ▼                       │
    │  ┌─────────────────────────────────┐ │
    │  │ Remediation Selector            │ │
    │  │ - Hint chains                   │ │
    │  │ - Misconception targeting       │ │
    │  │ - Spaced repetition queue       │ │
    │  └─────────────────────────────────┘ │
    └──────────────────────────────────────┘
```

---

## Scaffold Modules

### Core Modules

| Module | File | Purpose |
|--------|------|---------|
| **ScaffoldingEngine** | `820.31.6-scaffolding.js` | Core ZPD tracking engine |
| **ScaffoldModule** | `820.31.20-scaffold-module.js` | Basic scaffold loading |
| **ScaffoldModuleAdvanced** | `820.31.21-scaffold-module-advanced.js` | Topic-aware content |
| **ScaffoldRemediation** | `820.31.14-scaffold-remediation.js` | Misconception targeting |
| **ScaffoldQualityAudit** | `820.31.35-scaffold-quality-audit.js` | Coverage verification |
| **ScaffoldDeckBuilder** | `820.31.52-scaffold-deck-builder.js` | Card game integration |

### Tools

| Tool | File | Purpose |
|------|------|---------|
| **Scaffold Studio** | `scaffold-studio.html` | Create/edit scaffolds |
| **Advanced Studio** | `scaffold-studio-advanced.html` | Topic-aware editing |

---

## Scaffold Levels

Four levels from most to least support:

```javascript
const LEVELS = {
  HEAVY: 'heavy',       // Struggling: extra hints, slower pace
  MODERATE: 'moderate', // Learning: standard warmups
  LIGHT: 'light',       // Progressing: can skip warmups
  CHALLENGE: 'challenge' // Mastering: harder question ordering
};
```

### Level Thresholds

| Performance | Level | Support |
|-------------|-------|---------|
| < 40% | HEAVY | Extra hints, simpler questions first |
| 40-60% | MODERATE | Standard warmups, regular hints |
| 60-80% | LIGHT | Skip warmups, minimal hints |
| > 80% | CHALLENGE | Harder questions, time pressure |

---

## ZPD Implementation

The Zone of Proximal Development formula:

```javascript
// ZPD = What learner CAN'T do alone but CAN do with support
function computeZPD(learner, topic) {
  const mastery = learner.topicPerformance[topic]?.accuracy || 0;
  const difficulty = topic.difficulty || 0.5;

  // Sweet spot: difficulty slightly above mastery
  const proximal = mastery + 0.15;  // 15% stretch

  return {
    zone: difficulty >= mastery && difficulty <= proximal ? 'PROXIMAL' :
          difficulty < mastery ? 'MASTERED' : 'BEYOND',
    support_needed: Math.max(0, difficulty - mastery)
  };
}
```

### Zone Classification

| Zone | Condition | Action |
|------|-----------|--------|
| **MASTERED** | difficulty < mastery | Challenge with harder variant |
| **PROXIMAL** | mastery ≤ difficulty ≤ mastery + 0.3 | Provide scaffold support |
| **BEYOND** | difficulty > mastery + 0.3 | Defer until prerequisites met |

---

## Remediation Flow

When a learner answers incorrectly:

```
WRONG ANSWER
     │
     ▼
┌────────────────────────────────┐
│ 1. Load misconception scaffold │
│    (target specific wrong idea)│
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ 2. Show rebuttal content       │
│    - What they probably thought│
│    - Why that's not quite right│
│    - The correct framing       │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ 3. Add to review queue         │
│    (spaced repetition)         │
└────────────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ 4. Update scaffold level       │
│    (may increase support)      │
└────────────────────────────────┘
```

---

## Scaffold Content Format

Each question can have scaffolds per answer option:

```json
{
  "id": "q-tissue-001",
  "question": "Which epithelium lines blood vessels?",
  "options": [
    { "id": "a", "text": "Simple squamous", "correct": true },
    { "id": "b", "text": "Stratified squamous" },
    { "id": "c", "text": "Simple cuboidal" },
    { "id": "d", "text": "Pseudostratified" }
  ],
  "scaffolds": {
    "hint": "Think about what allows rapid diffusion...",
    "misconception_b": {
      "common_error": "Confusing protection with transport",
      "rebuttal": "Stratified squamous is thick for protection (skin, esophagus). Blood vessels need THIN for exchange.",
      "redirect": "Simple = one layer = fast diffusion"
    },
    "misconception_c": {
      "common_error": "Associating cuboidal with tubes",
      "rebuttal": "Cuboidal is for secretion/absorption (kidney tubules, glands), not passive diffusion.",
      "redirect": "Blood vessels need passive gas exchange → thin flat cells"
    },
    "misconception_d": {
      "common_error": "Remembering pseudostratified from respiratory",
      "rebuttal": "Pseudostratified is in respiratory tract for mucus/cilia, not vessels.",
      "redirect": "Different tube, different job → simple squamous for vessels"
    }
  }
}
```

---

## Spaced Repetition Queue

Questions are queued for review based on performance:

```javascript
class ReviewQueue {
  constructor() {
    this.queue = [];
  }

  addForReview(questionId, failureType) {
    const interval = this.computeInterval(failureType);
    this.queue.push({
      questionId,
      reviewAt: Date.now() + interval,
      failureType,
      reviewCount: 0
    });
  }

  computeInterval(failureType) {
    // Shorter intervals for misconceptions
    switch (failureType) {
      case 'misconception': return 5 * 60 * 1000;   // 5 minutes
      case 'careless':      return 30 * 60 * 1000;  // 30 minutes
      case 'unknown':       return 60 * 60 * 1000;  // 1 hour
      default:              return 24 * 60 * 60 * 1000; // 1 day
    }
  }

  getNextDue() {
    const now = Date.now();
    return this.queue
      .filter(item => item.reviewAt <= now)
      .sort((a, b) => a.reviewAt - b.reviewAt)[0];
  }
}
```

---

## Quality Audit

The scaffold quality audit checks:

```javascript
function auditScaffoldCoverage(questions) {
  const issues = [];

  for (const q of questions) {
    // Check hint exists
    if (!q.scaffolds?.hint) {
      issues.push({ questionId: q.id, issue: 'missing_hint' });
    }

    // Check misconception scaffolds for wrong answers
    for (const opt of q.options) {
      if (!opt.correct && !q.scaffolds?.[`misconception_${opt.id}`]) {
        issues.push({
          questionId: q.id,
          issue: 'missing_misconception',
          option: opt.id
        });
      }
    }
  }

  return {
    coverage: 1 - (issues.length / (questions.length * 4)),
    issues
  };
}
```

---

## Integration with Card Battle

In Map mode, scaffolds appear as "rebuttal" cards:

```javascript
// When player loses to monster (wrong answer)
function showRebuttal(question, selectedOption) {
  const scaffold = question.scaffolds[`misconception_${selectedOption}`];

  if (scaffold) {
    showRebuttalCard({
      title: "Let me explain...",
      commonError: scaffold.common_error,
      explanation: scaffold.rebuttal,
      redirect: scaffold.redirect,
      character: "ms-luminara"
    });
  }
}
```

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [510.000-CANONICAL-TEACHING-PHILOSOPHY](../../../../500-Behavior/510-Ms_Luminara_Primer/510.000-CANONICAL-TEACHING-PHILOSOPHY.md) | ZPD theory |
| [REGISTRY_FORMAT](REGISTRY_FORMAT.md) | Question structure |
| [140.00-Parallel_Council](../../../../100-Cognition/140-Council/140.00-Parallel_Council.md) | Domain expert activation |

---

## Isotope Threading

**Pull this thread to find:**
- `scaffold.*` - Scaffold system concepts
- `teaching.zpd` - Zone of Proximal Development
- `remediation.*` - Wrong-answer handling
- `quiz.*` - Quiz engine concepts

**Co-occurs with:**
- `teaching.mcdermott` - Misconception targeting
- `council.23d` - Expert-specific scaffolds
- `quiz.registry` - Question structure

---

*"Scaffolding is not about making things easier. It's about making the hard things achievable."*
— Session 55
