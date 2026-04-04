# Question Registry Format (820.31)

**Codon:** 820.31
**Version:** 2026-04-01
**Source Sessions:** 54, 56
**Isotopes:** `quiz.registry`, `dewey.structure`, `teaching.content`
**Operators:** A.F.G (Aggregate, Frame, Gravitate)

---

## The Core Insight

**The Question Registry is the single source of truth for all quiz content organization, mapping Dewey classifications to question sets.**

The registry provides:
- Dewey-indexed subject/discipline/course hierarchy
- 23D domain mappings (LUMI's parallel council)
- Progressive difficulty scaffolding
- Content discovery for both humans and code

---

## Registry Structure

### Top-Level Schema

```json
{
  "version": "2.0.0",
  "lastUpdated": "2026-03-31",
  "description": "LUMI 23D Knowledge Domains organized by Dewey Decimal Classification",
  "subjects": [...]
}
```

### Subject Structure

```json
{
  "id": "natural-sciences",
  "name": "Natural Sciences",
  "icon": "🔬",
  "dewey": "500",
  "description": "Physical and life sciences",
  "domains": ["physicist", "chemist", "biologist"],
  "disciplines": [...]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | URL-safe identifier |
| `name` | string | Display name |
| `icon` | emoji | Visual identifier |
| `dewey` | string | Dewey main class (3 digits) |
| `description` | string | Brief explanation |
| `domains` | string[] | LUMI 23D council domains |
| `disciplines` | array | Nested discipline objects |

### Discipline Structure

```json
{
  "id": "human-anatomy",
  "name": "Human Anatomy",
  "icon": "🦴",
  "dewey": "611",
  "domain": "anatomist",
  "courses": [...]
}
```

### Course Structure

```json
{
  "id": "tissue-types",
  "name": "Tissue Types",
  "icon": "🧬",
  "dewey": "611.018",
  "folder": "611-anatomy/611.018-tissue-types",
  "prerequisites": [],
  "difficulty": "intermediate",
  "questionCount": 45,
  "topics": [
    "epithelial",
    "connective",
    "muscle",
    "nervous"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `folder` | string | Path relative to 820.50-Dewey_Content |
| `prerequisites` | string[] | Course IDs that should be completed first |
| `difficulty` | enum | "beginner" / "intermediate" / "advanced" |
| `questionCount` | number | Total questions in course |
| `topics` | string[] | Subtopics covered |

---

## Dewey Mapping

### Subject Classes (100s)

| Dewey | Subject | Domain Experts |
|-------|---------|----------------|
| 000 | Computer Science | cataloger |
| 100 | Philosophy & Psychology | philosopher, psychologist |
| 200 | Religion & Mythology | theologian, mythkeeper |
| 300 | Social Sciences | sociologist, economist |
| 400 | Language | linguist, etymologist |
| 500 | Natural Sciences | physicist, chemist, biologist |
| 600 | Technology & Medicine | engineer, physician |
| 700 | Arts & Recreation | artist, musician |
| 800 | Literature | critic, novelist |
| 900 | History & Geography | historian, geographer |

### Example: Life Sciences (570-590)

```
570 - Life Sciences (general)
├── 571 - Physiology & Related
│   ├── 571.1 - Cell Physiology
│   └── 571.6 - Cell Biology
├── 572 - Biochemistry
│   ├── 572.4 - Proteins
│   └── 572.5 - Nucleic Acids
├── 573-575 - Specific Physiological Systems
├── 576 - Genetics & Evolution
├── 577 - Ecology
├── 578 - Natural History
└── 579 - Microorganisms
```

---

## Question File Format

Questions live in `820.50-Dewey_Content/{dewey-path}/`:

```
820.50-Dewey_Content/
├── 611-anatomy/
│   ├── 611.018-tissue-types/
│   │   ├── q-epithelial-001.json
│   │   ├── q-epithelial-002.json
│   │   └── ...
│   └── 611.1-skeletal/
└── 612-physiology/
    ├── 612.1-cardiovascular/
    └── 612.3-digestive/
```

### Question JSON Schema

```json
{
  "id": "q-epithelial-001",
  "version": "1.0.0",
  "dewey": "611.018",
  "topic": "epithelial",
  "difficulty": "beginner",
  "type": "multiple-choice",
  "question": "Which epithelium lines blood vessels?",
  "options": [
    { "id": "a", "text": "Simple squamous", "correct": true },
    { "id": "b", "text": "Stratified squamous", "correct": false },
    { "id": "c", "text": "Simple cuboidal", "correct": false },
    { "id": "d", "text": "Pseudostratified", "correct": false }
  ],
  "explanation": "Simple squamous epithelium (endothelium) lines blood vessels...",
  "scaffolds": {
    "hint": "Think about what allows rapid diffusion...",
    "misconception_a": null,
    "misconception_b": "Stratified is for protection, not diffusion",
    "misconception_c": "Cuboidal is for secretion/absorption",
    "misconception_d": "Pseudostratified is in respiratory tract"
  },
  "metadata": {
    "created": "2026-03-15",
    "author": "ms-luminara",
    "sources": ["Gray's Anatomy", "Histology: A Text and Atlas"],
    "isotopes": ["epithelium.simple", "tissue.lining", "anatomy.histology"]
  }
}
```

---

## Discovery Patterns

### Find All Questions by Dewey

```javascript
// In quiz engine
function findQuestionsByDewey(deweyPrefix) {
  return registry.subjects
    .flatMap(s => s.disciplines)
    .flatMap(d => d.courses)
    .filter(c => c.dewey.startsWith(deweyPrefix))
    .map(c => loadQuestions(c.folder));
}

// Example: all anatomy questions
const anatomyQuestions = findQuestionsByDewey('611');
```

### Find by Domain Expert

```javascript
function findByDomain(domain) {
  return registry.subjects
    .filter(s => s.domains.includes(domain))
    .flatMap(s => s.disciplines)
    .filter(d => d.domain === domain);
}

// Example: all questions for the "anatomist" expert
const anatomistContent = findByDomain('anatomist');
```

### Find Prerequisites

```javascript
function getPrerequisiteChain(courseId) {
  const course = findCourse(courseId);
  if (!course || !course.prerequisites.length) return [];

  return course.prerequisites.flatMap(prereqId => [
    ...getPrerequisiteChain(prereqId),
    prereqId
  ]);
}
```

---

## 23D Council Integration

The registry's domain mappings connect to LUMI's 23 parallel council experts:

| Council Expert | Registry Domain | Subject Areas |
|----------------|-----------------|---------------|
| `philosopher` | philosopher | 100-Philosophy |
| `psychologist` | psychologist | 150-Psychology |
| `physicist` | physicist | 530-Physics |
| `chemist` | chemist | 540-Chemistry |
| `biologist` | biologist | 570-Life Sciences |
| `anatomist` | anatomist | 611-Anatomy |
| `physiologist` | physiologist | 612-Physiology |
| ... | ... | ... |

When a user studies, the corresponding council expert is activated:
- Scaffolding uses domain-specific knowledge
- Explanations reflect expert perspective
- Misconceptions are addressed from expert's experience

---

## Validation Rules

### Registry Integrity

1. **Dewey uniqueness**: No duplicate Dewey codes at same level
2. **Folder existence**: All `folder` paths must exist in 820.50-Dewey_Content
3. **Prerequisite validity**: All prerequisites must reference existing course IDs
4. **Domain consistency**: Discipline domain must be in parent subject's domains

### Question Integrity

1. **ID format**: `q-{topic}-{number}`
2. **Dewey match**: Question dewey must match containing folder
3. **One correct answer**: Exactly one option with `correct: true`
4. **Scaffold coverage**: Each incorrect option should have misconception scaffold

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [820.50-Dewey_Content](../820.50-Dewey_Content/) | Question content location |
| [510.000-CANONICAL-TEACHING-PHILOSOPHY](../../../../500-Behavior/510-Ms_Luminara_Primer/510.000-CANONICAL-TEACHING-PHILOSOPHY.md) | Scaffolding principles |
| [140.00-Parallel_Council](../../../../100-Cognition/140-Council/140.00-Parallel_Council.md) | 23D domain experts |

---

## Isotope Threading

**Pull this thread to find:**
- `quiz.*` - Quiz system concepts
- `dewey.*` - Dewey organization
- `teaching.*` - Teaching methodology
- `scaffold.*` - Remediation patterns

**Co-occurs with:**
- `council.23d` - Domain expert activation
- `teaching.zpd` - Zone of proximal development
- `teaching.mcdermott` - Misconception targeting

---

*"The registry is the bridge between Dewey's universe of knowledge and LUMI's council of experts."*
— Session 54
