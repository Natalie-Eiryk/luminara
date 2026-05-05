# Luminara Quick-Roll Study Page Template

This folder is a self-contained static page template for `luminara.natalie-eiryk.com`.

## Route

- Local source: `Library/800-Applications/820-Teaching/820.30-Tools/820.31-Quiz_Engine/lab-exam-ii/`
- Public route after deploy: `https://luminara.natalie-eiryk.com/lab-exam-ii/`

## Template Shape

- `index.html` defines the study shell, navigation, quick-roll view, glossary, atlas, and scaffold panels.
- `shared.css` owns the page-level visual system.
- `app.js` owns filtering, reveal/next/back behavior, glossary rendering, and atlas rendering.
- `study_exam_guide_roll.js` owns the exam-specific quick-roll card bank.
- `study_data_core.js`, `study_questions.js`, `study_glossary_*.js`, `study_atlas_*.js`, and `study_support.js` provide reusable study data modules.

## Reuse Pattern

1. Copy this directory to a new route folder.
2. Replace `study_exam_guide_roll.js` with the new study-guide card bank.
3. Update the title, description, canonical URL, and Open Graph metadata in `index.html`.
4. Add the new route and files to `sw.js` optional assets if offline caching is desired.
5. Link the new route from the main Luminara landing page when it should be public.

The page is intentionally non-gamified: it supports fast recall, exact spelling, visual ID, and source-section review without scoring pressure.
