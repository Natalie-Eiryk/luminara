#!/usr/bin/env node
/*
 * TeachingModuleV2 verification.
 *
 * This check is intentionally read-only. It validates that the canonical v2
 * normalizer can ingest the current registry banks and the Lab Exam II study
 * page without losing the content shapes that blocked earlier loaders.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const quizRoot = path.resolve(__dirname, '..');
const v2 = require(path.join(quizRoot, '820.31-v2/teaching-module-v2.js'));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadLabStudyData() {
  const files = [
    'study_data_core.js',
    'study_questions.js',
    'study_glossary_1.js',
    'study_glossary_2.js',
    'study_exam_guide_roll.js',
    'study_atlas_respiratory.js',
    'study_atlas_digestive.js',
    'study_atlas_urinary.js',
    'study_atlas_endocrine.js',
    'study_atlas_reproductive.js',
    'study_atlas_fetal_pig.js',
    'study_atlas_histology.js',
    'study_support.js',
    'study_generated_questions.js'
  ];
  const context = { window: {}, console };
  context.window.window = context.window;
  vm.createContext(context);
  for (const file of files) {
    vm.runInContext(
      fs.readFileSync(path.join(quizRoot, 'lab-exam-ii', file), 'utf8'),
      context,
      { filename: file }
    );
  }
  return context.window.STUDY_DATA;
}

function verifyRegistry() {
  const registry = readJson(path.join(quizRoot, '820.31-core/820.31-question-registry.json'));
  const items = [];
  const missing = [];
  const textPromptIds = [];
  const vocabularyArrays = [];

  for (const category of registry.categories || []) {
    for (const bank of category.banks || []) {
      const bankPath = path.join(quizRoot, category.folder, bank.file);
      if (!fs.existsSync(bankPath)) {
        missing.push(`${category.id}/${bank.id}`);
        continue;
      }
      const data = readJson(bankPath);
      const normalized = v2.normalizeBank(data, {
        moduleId: 'registry-preview',
        categoryId: category.id,
        categoryName: category.name,
        bankId: bank.id,
        bankTitle: bank.title,
        deweyPath: category.dewey || bank.id
      });
      items.push(...normalized);
      if (Array.isArray(data)) vocabularyArrays.push(`${category.id}/${bank.id}`);
      for (const item of normalized) {
        if (item.raw && item.raw.text && !item.raw.q) textPromptIds.push(item.id);
      }
    }
  }

  return {
    categories: (registry.categories || []).length,
    banks: (registry.categories || []).reduce((sum, category) => sum + (category.banks || []).length, 0),
    normalizedItems: items.length,
    byKind: countBy(items, item => item.kind),
    missing,
    textPromptIds,
    vocabularyArrays
  };
}

function verifyLabExam() {
  const studyData = loadLabStudyData();
  const moduleData = v2.normalizeLabExamStudyData(studyData, readJson(path.join(quizRoot, 'lab-exam-ii/module.v2.json')));
  const diagnostics = v2.buildDiagnostics(moduleData);
  const compat = v2.createCompatStudyData(moduleData, studyData);
  return {
    original: {
      systems: studyData.systems.length,
      questions: studyData.questions.length,
      quickRollItems: studyData.quickRollItems.length,
      glossaryTerms: Object.values(studyData.glossary).reduce((sum, terms) => sum + terms.length, 0),
      atlasSystems: Object.keys(studyData.atlas).length
    },
    normalized: {
      items: moduleData.items.length,
      byKind: diagnostics.totals.byKind,
      errors: diagnostics.validity.errors
    },
    compat: {
      questions: compat.questions.length,
      quickRollItems: compat.quickRollItems.length,
      v2Enabled: compat.v2.enabled
    },
    privacy: diagnostics.privacy
  };
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function main() {
  const registry = verifyRegistry();
  const labExam = verifyLabExam();

  assert(registry.missing.length === 0, `Missing registry banks: ${registry.missing.join(', ')}`);
  assert(registry.textPromptIds.length >= 28, 'Expected GI text-prompt questions to normalize');
  assert(registry.vocabularyArrays.length >= 7, 'Expected direct vocabulary arrays to normalize');
  assert((registry.byKind.vocabulary || 0) >= 80, 'Expected vocabulary LearningItems from direct arrays');

  assert(labExam.original.questions === labExam.compat.questions, 'Lab Exam compat question count mismatch');
  assert(labExam.original.quickRollItems === labExam.compat.quickRollItems, 'Lab Exam compat quick-roll count mismatch');
  assert(labExam.normalized.byKind.question === labExam.original.questions, 'Lab Exam question item count mismatch');
  assert(labExam.normalized.byKind.quick_roll === labExam.original.quickRollItems, 'Lab Exam quick-roll item count mismatch');
  assert(labExam.normalized.errors === 0, 'Lab Exam v2 diagnostics contain validation errors');
  assert(labExam.privacy.containsLearnerRecords === false, 'Diagnostics must not contain learner records');
  assert(labExam.privacy.containsNotes === false, 'Diagnostics must not contain notes');
  assert(labExam.privacy.containsPrivateLumiMemory === false, 'Diagnostics must not contain Lumi memory');

  console.log(JSON.stringify({ ok: true, registry, labExam }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
