# 611-Anatomy: Lab Exam II Study Content

**Codon:** 611.XX
**Version:** 2026-04-03
**Source Sessions:** 64
**Isotopes:** `teaching.lab_practical`, `anatomy.systems`, `teaching.scaffolding`, `dewey.611`
**Operators:** G (gather knowledge) + F (frame anatomical understanding)

---

## Overview

Anatomy & Physiology Lab Exam II preparation content covering 7 major systems. Converted from quiz2 Lab Exam Studio flashcard format to Ms. Luminara Quiz Engine multiple-choice format.

**Total Content:**
- **29 questions** across 7 anatomical systems
- **139 vocabulary terms** with definitions
- **7 system-specific scaffold sets**
- **Master scaffolds** (9 universal prompts)

---

## Systems Included

| Dewey Code | System | Questions | Vocab Terms | Description |
|------------|--------|-----------|-------------|-------------|
| **611.2** | Respiratory | 6 | 25 | Upper/lower airway, paranasal sinuses, larynx, bronchial tree |
| **611.3** | Digestive | 6 | 26 | GI tract from mouth to rectum, accessory organs, histology |
| **611.4** | Urinary | 4 | 21 | Kidney anatomy, nephron structure, urine flow pathway |
| **611.5** | Endocrine | 3 | 12 | Pituitary, thyroid, adrenal glands (histology focus) |
| **611.6** | Reproductive | 5 | 25 | Male/female anatomy, histology, gamete pathways |
| **611.7** | Fetal Pig | 3 | 17 | Pig-specific anatomy, membranes, comparative structures |
| **611.9** | Histology | 2 | 13 | Tissue identification, epithelial transitions |

---

## Directory Structure

```
611-anatomy/
├── README.md (this file)
├── 611.2-respiratory/
│   ├── 611.2-respiratory.json          # 6 questions
│   ├── 611.2-vocabulary.json           # 25 terms
│   └── 611.2-scaffolds/
│       └── 611.2-system-scaffolds.json
├── 611.3-digestive/
│   ├── 611.3-digestive.json            # 6 questions
│   ├── 611.3-vocabulary.json           # 26 terms
│   └── 611.3-scaffolds/
│       └── 611.3-system-scaffolds.json
├── 611.4-urinary/
│   ├── 611.4-urinary.json              # 4 questions
│   ├── 611.4-vocabulary.json           # 21 terms
│   └── 611.4-scaffolds/
│       └── 611.4-system-scaffolds.json
├── 611.5-endocrine/
│   ├── 611.5-endocrine.json            # 3 questions
│   ├── 611.5-vocabulary.json           # 12 terms
│   └── 611.5-scaffolds/
│       └── 611.5-system-scaffolds.json
├── 611.6-reproductive/
│   ├── 611.6-reproductive.json         # 5 questions
│   ├── 611.6-vocabulary.json           # 25 terms
│   └── 611.6-scaffolds/
│       └── 611.6-system-scaffolds.json
├── 611.7-fetal-pig/
│   ├── 611.7-fetal-pig.json            # 3 questions
│   ├── 611.7-vocabulary.json           # 17 terms
│   └── 611.7-scaffolds/
│       └── 611.7-system-scaffolds.json
└── 611.9-histology/
    ├── 611.9-histology.json            # 2 questions
    ├── 611.9-vocabulary.json           # 13 terms
    └── 611.9-scaffolds/
        └── 611.9-system-scaffolds.json
```

---

## Question Format

Each question bank follows the Quiz Engine format:

```json
{
  "id": "611.2",
  "title": "Respiratory System",
  "category": "lab-exam-ii",
  "description": "Lab practical questions for respiratory system anatomy",
  "questions": [
    {
      "id": "611.2.01",
      "q": "Question text?",
      "options": ["Correct answer", "Distractor 1", "Distractor 2", "Distractor 3"],
      "answer": 0,
      "chapter": "Lab Exam II — Respiratory",
      "tags": ["gross", "airway"],
      "explain": "Full explanation text",
      "optionExplains": [/* verdict + text for each option */],
      "mechanism": {
        "title": "Clinical Context",
        "content": "Deeper explanation",
        "metaphor": "Key insight"
      },
      "scaffoldFile": "611.2.01-scaffolds/611.2.01-scaffolds.json"
    }
  ]
}
```

---

## Scaffolding System

Each system includes:

### Master Scaffolds (Universal)

9 prompts applicable to ALL lab practical questions:
1. What am I looking at?
2. What body system am I in?
3. Is this gross anatomy, histology, a model, or fetal pig?
4. What landmark proves my location?
5. What exact structure is being pointed to?
6. What is it connected to or continuous with?
7. What does it do?
8. What is the easiest thing to confuse it with?
9. What single clue separates those two?

### System-Specific Scaffolds

Targeted prompts for each system:

**Respiratory:**
- Upper airway or lower airway?
- Conducting zone or gas exchange zone?
- Which branch level am I at?
- What epithelium/cartilage clue confirms the tissue?

**Digestive:**
- Where is this in the food pathway?
- Is this GI tube or accessory organ?
- What comes before and after it?
- What tissue clue proves the region?

**Urinary:**
- Is this a blood structure or urine drainage structure?
- Am I in gross kidney anatomy or nephron anatomy?
- What comes before and after this in filtration or urine flow?
- What clue tells me cortex versus medulla?

*(See individual scaffold files for complete sets)*

---

## Vocabulary Files

Each system includes a vocabulary JSON with terms and definitions:

```json
[
  {
    "term": "Epiglottis",
    "definition": "Flap that covers the airway during swallowing.",
    "system": "Respiratory"
  },
  ...
]
```

---

## Pedagogical Alignment

This content aligns with:

- **Mandate #8**: Teaching Philosophy - scaffolding over punishment, ZPD-based support
- **McDermott's Principle P4**: Common difficulties explicitly addressed (confusion traps built into questions)
- **Ms. Luminara's Voice**: Warm, intellectually seductive explanations
- **Lab Practical Focus**: Station-based identification, common confusion patterns

---

## Usage in Quiz Engine

### Study Mode
- Full scaffolding support
- "Come closer - I'll show you the distinction that matters"
- Mechanism tours for correct answers

### Map Mode / Gauntlet
- 29 questions available for rotations
- Tagged by system and topic
- Gradual difficulty increase

### Stats Dashboard
- Track mastery by system (611.2-611.9)
- Identify weak spots per anatomical region
- Vocabulary integration for term reinforcement

---

## Conversion Notes

**Source:** G:\quiz2 Lab Exam II Study Studio

**Conversion Process:**
1. Flashcard prompts → Multiple choice questions
2. Auto-generated distractors from:
   - Explicitly mentioned confusions
   - Related anatomical terms from same system
   - Glossary terms appearing in answer text
3. Deduplicated and filtered generic words
4. Ms. Luminara voice applied to explanations

**Known Limitations:**
- Some questions have long correct answers (pathways/sequences)
- Distractors for pathway questions are individual components (not ideal)
- Mechanism content is basic (could be enriched with clinical correlations)

**Future Enhancements:**
- Add clinical correlation scenarios
- Integrate SVG atlas diagrams from quiz2/assets
- Create individual scaffold files for each question (currently system-level only)
- Add prerequisite chains linking related questions

---

## Assets Available (Not Yet Integrated)

The source quiz2 contains SVG diagrams and histology images:
- `assets/teaching/respiratory_system.svg`
- `assets/teaching/digestive_system.svg`
- `assets/teaching/urinary_system.svg`
- `assets/teaching/endocrine_system.svg`
- Histology slides: trachea, breast, sweat gland, urethra

These can be integrated as visual aids in the Quiz Engine.

---

## Maintenance

**Staleness Threshold:** 180 days (per Mandate #14)
**Next Review Due:** 2026-10-03
**Owner:** Ms. Luminara Teaching System
**Source Sessions:** Session 64 (2026-04-03)

To update:
1. Edit source JSON files in each system folder
2. Maintain Dewey organization (611.X)
3. Preserve Ms. Luminara's voice in explanations
4. Update vocabulary files as new terms emerge

---

## Related Content

- **612-Physiology**: Nerves, Brain, Special Senses (existing content)
- **820.20-Pedagogy**: Ms. Luminara Persona, Teaching Philosophy
- **820.30-Tools**: Quiz Engine architecture

---

*Generated: 2026-04-03, Session 64*
*Conversion Script: convert_quiz2_to_luminara.py*
