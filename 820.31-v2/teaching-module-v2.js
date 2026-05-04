/*
 * TeachingModuleV2
 * Parallel teaching module layer for Luminara.
 *
 * The v2 layer is intentionally framework-light: it normalizes mixed content
 * banks into one model, stores progress locally, emits private Lumi signals
 * when a bridge exists, and exposes public-safe diagnostics.
 */
(function(root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.TeachingModuleV2 = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function() {
  "use strict";

  const VERSION = "0.2.0";
  const ITEM_KINDS = [
    "question",
    "quick_roll",
    "true_false",
    "spelling",
    "station",
    "vocabulary",
    "atlas_part",
    "scaffold"
  ];

  const DEFAULT_MANIFEST = {
    id: "teaching-module",
    title: "Teaching Module",
    version: "0.1.0",
    route: "",
    deweyPath: "",
    audience: "learner",
    sourceRefs: [],
    itemCollections: [],
    diagnostics: { public: true },
    lumiSync: { enabled: true, private: true }
  };

  function clone(value) {
    if (value === undefined || value === null) return value;
    return JSON.parse(JSON.stringify(value));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function slug(value, fallback = "item") {
    const text = String(value || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return text || fallback;
  }

  function stableId(parts) {
    return parts.filter(Boolean).map(part => slug(part)).join(":");
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === "") return [];
    return [value];
  }

  function asText(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (typeof value.text === "string") return value.text;
    if (typeof value.label === "string") return value.label;
    return JSON.stringify(value);
  }

  function createManifest(input = {}) {
    const manifest = {
      ...clone(DEFAULT_MANIFEST),
      ...clone(input)
    };
    manifest.sourceRefs = asArray(manifest.sourceRefs);
    manifest.itemCollections = asArray(manifest.itemCollections);
    manifest.diagnostics = { ...DEFAULT_MANIFEST.diagnostics, ...(manifest.diagnostics || {}) };
    manifest.lumiSync = { ...DEFAULT_MANIFEST.lumiSync, ...(manifest.lumiSync || {}) };
    return manifest;
  }

  function normalizeChoice(option, index, answerIndex) {
    if (option && typeof option === "object") {
      const id = option.id || String.fromCharCode(97 + index);
      const correct = typeof option.correct === "boolean" ? option.correct : index === answerIndex;
      return {
        id,
        text: asText(option),
        correct
      };
    }
    return {
      id: String.fromCharCode(97 + index),
      text: asText(option),
      correct: index === answerIndex
    };
  }

  function resolveAnswerIndex(raw) {
    if (typeof raw.answer === "number") return raw.answer;
    if (typeof raw.correctIndex === "number") return raw.correctIndex;
    if (Array.isArray(raw.options)) {
      const idx = raw.options.findIndex(option => option && typeof option === "object" && option.correct === true);
      if (idx >= 0) return idx;
    }
    return null;
  }

  function normalizeFeedback(raw, choices) {
    const optionExplains = Array.isArray(raw.optionExplains) ? raw.optionExplains : [];
    if (!optionExplains.length) return [];
    return choices.map((choice, index) => {
      const source = optionExplains[index] || {};
      return {
        choiceId: choice.id,
        verdict: source.verdict || (choice.correct ? "correct" : "incorrect"),
        text: asText(source.text || source)
      };
    });
  }

  function normalizeQuestion(raw, context = {}) {
    const answerIndex = resolveAnswerIndex(raw);
    const options = Array.isArray(raw.options) ? raw.options : [];
    const choices = options.map((option, index) => normalizeChoice(option, index, answerIndex));
    const answerChoice = answerIndex !== null ? choices[answerIndex] : choices.find(choice => choice.correct);
    const prompt = raw.q || raw.question || raw.prompt || raw.text || "";
    const id = raw.id || stableId([context.moduleId, context.bankId, prompt]);

    return normalizeLearningItem({
      id,
      kind: context.kind || "question",
      moduleId: context.moduleId,
      deweyPath: raw.dewey || context.deweyPath || context.categoryId || "",
      system: raw.system || context.system || context.categoryName || "",
      topic: raw.topic || raw.chapter || context.topic || context.bankTitle || "",
      prompt,
      answer: raw.answerText || answerChoice?.text || asText(raw.answer),
      choices,
      feedback: normalizeFeedback(raw, choices),
      explanation: raw.explain || raw.explanation || raw.mechanism?.content || "",
      tags: [...asArray(raw.tags), ...asArray(context.tags)],
      mediaRefs: asArray(raw.images).map((src, index) => ({ id: `${id}:image:${index}`, src, type: "image" })),
      scaffoldRefs: asArray(raw.scaffoldFile),
      source: {
        type: "question_bank",
        id: raw.id || id,
        bankId: context.bankId || "",
        categoryId: context.categoryId || ""
      },
      raw
    });
  }

  function normalizeVocabularyTerm(raw, context = {}) {
    const term = raw.term || raw.word || raw.label || raw.id || "";
    const definition = raw.definition || raw.explain || raw.description || "";
    return normalizeLearningItem({
      id: raw.id || stableId([context.moduleId, context.bankId, "vocab", term]),
      kind: "vocabulary",
      moduleId: context.moduleId,
      deweyPath: raw.dewey || context.deweyPath || context.categoryId || "",
      system: raw.system || context.system || context.categoryName || "",
      topic: raw.topic || raw.category || context.topic || context.bankTitle || "",
      prompt: term,
      answer: term,
      explanation: definition,
      tags: [...asArray(raw.tags), "vocabulary"].filter(Boolean),
      source: {
        type: "vocabulary_bank",
        id: raw.id || term,
        bankId: context.bankId || ""
      },
      raw
    });
  }

  function normalizeScaffold(raw, context = {}) {
    const id = raw.id || stableId([context.moduleId, "scaffold", raw.prompt || raw.q || raw]);
    return normalizeLearningItem({
      id,
      kind: "scaffold",
      moduleId: context.moduleId,
      deweyPath: context.deweyPath || "",
      system: raw.system || context.system || "",
      topic: raw.topic || context.topic || "",
      prompt: raw.prompt || raw.q || asText(raw),
      answer: raw.answerText || raw.answer || "",
      explanation: raw.explain || raw.explanation || "",
      tags: [...asArray(raw.tags), "scaffold"].filter(Boolean),
      source: {
        type: "scaffold",
        id
      },
      raw
    });
  }

  function normalizeLearningItem(input) {
    const kind = ITEM_KINDS.includes(input.kind) ? input.kind : "question";
    return {
      id: String(input.id || stableId([input.moduleId, kind, input.prompt])),
      kind,
      moduleId: input.moduleId || "",
      deweyPath: input.deweyPath || "",
      system: input.system || "",
      topic: input.topic || "",
      prompt: asText(input.prompt),
      answer: asText(input.answer),
      choices: Array.isArray(input.choices) ? input.choices : [],
      feedback: Array.isArray(input.feedback) ? input.feedback : [],
      explanation: asText(input.explanation),
      tags: [...new Set(asArray(input.tags).filter(Boolean))],
      mediaRefs: Array.isArray(input.mediaRefs) ? input.mediaRefs : [],
      scaffoldRefs: Array.isArray(input.scaffoldRefs) ? input.scaffoldRefs : [],
      source: input.source || {},
      raw: input.raw || null
    };
  }

  function normalizeBank(data, context = {}) {
    const moduleId = context.moduleId || "registry";
    const baseContext = { ...context, moduleId };

    if (Array.isArray(data)) {
      return data.map(item => normalizeVocabularyTerm(item, baseContext));
    }

    const questions = Array.isArray(data?.questions) ? data.questions : [];
    const terms = [
      ...asArray(data?.vocabulary),
      ...asArray(data?.terms),
      ...asArray(data?.items)
    ];

    const items = [];
    for (const question of questions) {
      items.push(normalizeQuestion(question, {
        ...baseContext,
        bankId: data.id || context.bankId,
        bankTitle: data.title || context.bankTitle,
        topic: data.topic || context.topic,
        system: data.system || context.system
      }));
    }
    for (const term of terms) {
      items.push(normalizeVocabularyTerm(term, {
        ...baseContext,
        bankId: data.id || context.bankId,
        bankTitle: data.title || context.bankTitle
      }));
    }
    return items;
  }

  function normalizeLabExamStudyData(studyData, manifestInput = {}) {
    const manifest = createManifest({
      id: "lab-exam-ii",
      title: "Lab Exam II Quick Roll",
      version: "2.0.0",
      route: "/lab-exam-ii/",
      deweyPath: "611-612",
      audience: "anatomy-physiology-lab",
      sourceRefs: ["Lab Exam II Study Guide", "lab-exam-ii/STUDY_DATA"],
      ...manifestInput
    });

    const items = [];

    for (const question of asArray(studyData.questions)) {
      items.push(normalizeLearningItem({
        id: question.id,
        kind: "question",
        moduleId: manifest.id,
        deweyPath: manifest.deweyPath,
        system: question.system || "",
        topic: asArray(question.tags)[0] || question.system || "",
        prompt: question.prompt,
        answer: question.answer,
        tags: asArray(question.tags),
        source: { type: "lab_exam_question", id: question.id },
        raw: question
      }));
    }

    for (const item of asArray(studyData.quickRollItems)) {
      const common = {
        moduleId: manifest.id,
        deweyPath: manifest.deweyPath,
        system: item.system || "",
        topic: item.section || item.category || "",
        answer: item.term,
        choices: asArray(item.aliases).map((alias, index) => ({
          id: `alias-${index}`,
          text: alias,
          correct: true
        })),
        explanation: item.visual || "",
        tags: [item.category, item.section, "quick-roll"].filter(Boolean),
        mediaRefs: [],
        scaffoldRefs: [],
        raw: item
      };
      items.push(normalizeLearningItem({
        ...common,
        id: `${item.id}:quick`,
        kind: "quick_roll",
        prompt: item.visual || `Identify ${item.term}`,
        feedback: item.trap ? [{ choiceId: "watch", verdict: "watch", text: item.trap }] : [],
        source: { type: "lab_exam_quick_roll", id: item.id }
      }));
      items.push(normalizeLearningItem({
        ...common,
        id: `${item.id}:spelling`,
        kind: "spelling",
        prompt: `Spell the exact guide term for: ${item.visual || item.term}`,
        source: { type: "lab_exam_quick_roll_mode", mode: "spelling", id: item.id }
      }));
      items.push(normalizeLearningItem({
        ...common,
        id: `${item.id}:true-false`,
        kind: "true_false",
        prompt: `True or false drill for: ${item.visual || item.term}`,
        choices: [
          { id: "true", text: "True", correct: true },
          { id: "false", text: "False", correct: false }
        ],
        source: { type: "lab_exam_quick_roll_mode", mode: "true_false", id: item.id }
      }));
      items.push(normalizeLearningItem({
        ...common,
        id: `${item.id}:station`,
        kind: "station",
        prompt: `Station practical: name the exact structure and one look-alike trap for ${item.visual || item.term}`,
        source: { type: "lab_exam_quick_roll_mode", mode: "station", id: item.id }
      }));
    }

    for (const [system, terms] of Object.entries(studyData.glossary || {})) {
      for (const term of asArray(terms)) {
        items.push(normalizeVocabularyTerm({
          id: stableId([manifest.id, "glossary", system, term.id || term.term]),
          term: term.term || term.word || term.label,
          definition: term.definition || term.meaning || term.explain,
          system,
          tags: ["glossary"]
        }, {
          moduleId: manifest.id,
          deweyPath: manifest.deweyPath,
          bankId: `${slug(system)}-glossary`,
          categoryName: system
        }));
      }
    }

    for (const [system, atlas] of Object.entries(studyData.atlas || {})) {
      for (const part of asArray(atlas.parts)) {
        items.push(normalizeLearningItem({
          id: stableId([manifest.id, "atlas", system, part.id || part.label || part.name]),
          kind: "atlas_part",
          moduleId: manifest.id,
          deweyPath: manifest.deweyPath,
          system,
          topic: atlas.title || system,
          prompt: part.label || part.name || "",
          answer: part.label || part.name || "",
          explanation: part.detail || part.description || part.clue || "",
          tags: ["atlas", system].filter(Boolean),
          mediaRefs: asArray(atlas.figures).map((figure, index) => ({
            id: `${slug(system)}:figure:${index}`,
            src: figure.src || figure,
            type: "image",
            alt: figure.alt || ""
          })),
          source: { type: "lab_exam_atlas_part", system, id: part.id || "" },
          raw: part
        }));
      }
    }

    for (const prompt of asArray(studyData.scaffolds?.master)) {
      items.push(normalizeScaffold({ prompt, tags: ["master"] }, {
        moduleId: manifest.id,
        deweyPath: manifest.deweyPath,
        topic: "Universal checklist"
      }));
    }
    for (const [system, prompts] of Object.entries(studyData.scaffolds?.systems || {})) {
      for (const prompt of asArray(prompts)) {
        items.push(normalizeScaffold({ prompt, system, tags: ["system"] }, {
          moduleId: manifest.id,
          deweyPath: manifest.deweyPath,
          system,
          topic: "System cues"
        }));
      }
    }

    manifest.itemCollections = summarizeCollections(items);
    return { manifest, items };
  }

  function summarizeCollections(items) {
    const byKind = countBy(items, item => item.kind);
    return Object.entries(byKind).map(([kind, count]) => ({ kind, count }));
  }

  function countBy(items, keyFn) {
    return items.reduce((acc, item) => {
      const key = keyFn(item) || "unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function createCompatStudyData(moduleData, originalStudyData) {
    const compat = clone(originalStudyData);
    const items = moduleData.items || [];
    compat.questions = items
      .filter(item => item.kind === "question" && item.source?.type === "lab_exam_question")
      .map(item => ({
        ...(item.raw || {}),
        id: item.source?.id || item.id,
        system: item.system,
        prompt: item.prompt,
        answer: item.answer,
        tags: item.tags
      }));
    compat.quickRollItems = items
      .filter(item => item.kind === "quick_roll" && item.source?.type === "lab_exam_quick_roll")
      .map(item => ({ ...(item.raw || {}) }));
    compat.v2 = {
      enabled: true,
      version: VERSION,
      moduleId: moduleData.manifest.id,
      generatedAt: nowIso(),
      itemCount: items.length
    };
    return compat;
  }

  class ProgressStore {
    constructor(options = {}) {
      this.moduleId = options.moduleId || "teaching-module";
      this.storageKey = options.storageKey || `teaching_module_v2_progress:${this.moduleId}`;
      this.records = {};
      this.load();
    }

    load() {
      if (typeof localStorage === "undefined") return this.records;
      try {
        const raw = localStorage.getItem(this.storageKey);
        this.records = raw ? JSON.parse(raw) : {};
      } catch (error) {
        this.records = {};
      }
      return this.records;
    }

    save() {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(this.storageKey, JSON.stringify(this.records));
    }

    record(itemId, outcome, patch = {}) {
      const current = this.records[itemId] || {
        itemId,
        attempts: 0,
        lastOutcome: "",
        confidence: 0,
        lastSeenAt: null,
        nextReviewAt: null,
        favorite: false,
        notesLocalOnly: ""
      };
      const confidenceDelta = outcome === "easy" ? 18 : outcome === "shaky" ? 7 : outcome === "hard" ? -8 : 0;
      const confidence = Math.max(0, Math.min(100, Number(current.confidence || 0) + confidenceDelta));
      this.records[itemId] = {
        ...current,
        ...patch,
        attempts: Number(current.attempts || 0) + 1,
        lastOutcome: outcome || current.lastOutcome,
        confidence,
        lastSeenAt: nowIso()
      };
      this.save();
      return this.records[itemId];
    }

    setFavorite(itemId, favorite) {
      const current = this.records[itemId] || { itemId, attempts: 0, confidence: 0 };
      this.records[itemId] = { ...current, favorite: !!favorite, lastSeenAt: nowIso() };
      this.save();
      return this.records[itemId];
    }

    export() {
      return clone({ moduleId: this.moduleId, exportedAt: nowIso(), records: this.records });
    }

    reset() {
      this.records = {};
      this.save();
    }
  }

  class LumiSignalQueue {
    constructor(options = {}) {
      this.moduleId = options.moduleId || "teaching-module";
      this.storageKey = options.storageKey || `teaching_module_v2_lumi_queue:${this.moduleId}`;
      this.bridge = options.bridge || null;
      this.queue = [];
      this.load();
    }

    load() {
      if (typeof localStorage === "undefined") return;
      try {
        const raw = localStorage.getItem(this.storageKey);
        this.queue = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(this.queue)) this.queue = [];
      } catch (error) {
        this.queue = [];
      }
    }

    save() {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
    }

    createSignal(action, item, detail = {}) {
      return {
        type: "teaching_signal",
        payload: {
          moduleId: this.moduleId,
          itemId: item?.id || detail.itemId || "",
          sourceId: item?.source?.id || "",
          sourceType: item?.source?.type || "",
          kind: item?.kind || detail.kind || "",
          deweyPath: item?.deweyPath || "",
          system: item?.system || "",
          topic: item?.topic || "",
          tags: item?.tags || [],
          action,
          outcome: detail.outcome || "",
          score: detail.score || null,
          aggregateContext: detail.aggregateContext || {},
          timestamp: nowIso()
        }
      };
    }

    enqueue(signal) {
      this.queue.push(signal);
      this.save();
      this.flush();
      return signal;
    }

    send(signal) {
      const bridge = this.bridge || (typeof window !== "undefined" ? window.LumiBridge : null);
      if (!bridge) return false;
      if (typeof bridge.send === "function") {
        bridge.send(signal);
        return true;
      }
      if (typeof bridge.recordEvent === "function") {
        bridge.recordEvent("teaching_signal", signal.payload);
        return true;
      }
      return false;
    }

    flush() {
      if (!this.queue.length) return { flushed: 0, remaining: 0 };
      const remaining = [];
      let flushed = 0;
      for (const signal of this.queue) {
        if (this.send(signal)) flushed++;
        else remaining.push(signal);
      }
      this.queue = remaining;
      this.save();
      return { flushed, remaining: remaining.length };
    }
  }

  class TeachingRuntime {
    constructor(moduleData, options = {}) {
      this.manifest = moduleData.manifest;
      this.items = moduleData.items || [];
      this.progress = options.progress || new ProgressStore({ moduleId: this.manifest.id });
      this.signalQueue = options.signalQueue || new LumiSignalQueue({
        moduleId: this.manifest.id,
        bridge: options.bridge || null
      });
    }

    findItem(itemId) {
      return this.items.find(item => item.id === itemId || item.source?.id === itemId) || null;
    }

    filterItems(filters = {}) {
      return this.items.filter(item => {
        if (filters.kind && item.kind !== filters.kind) return false;
        if (filters.system && item.system !== filters.system) return false;
        if (filters.topic && item.topic !== filters.topic) return false;
        return true;
      });
    }

    recordAction(action, itemOrId, detail = {}) {
      const item = typeof itemOrId === "string" ? this.findItem(itemOrId) : itemOrId;
      const signal = this.signalQueue.createSignal(action, item, detail);
      this.signalQueue.enqueue(signal);
      return signal;
    }

    recordOutcome(itemOrId, outcome, detail = {}) {
      const item = typeof itemOrId === "string" ? this.findItem(itemOrId) : itemOrId;
      const record = this.progress.record(item?.id || itemOrId, outcome, detail.progressPatch || {});
      this.recordAction("score", item, { ...detail, outcome, score: outcome });
      return record;
    }

    diagnostics(options = {}) {
      return buildDiagnostics({ manifest: this.manifest, items: this.items }, options);
    }
  }

  function buildDiagnostics(moduleData, options = {}) {
    const items = moduleData.items || [];
    const duplicateIds = [];
    const seen = new Set();
    const missingCoreFields = [];
    const missingMedia = [];

    for (const item of items) {
      if (seen.has(item.id)) duplicateIds.push(item.id);
      seen.add(item.id);
      for (const field of ["id", "kind", "prompt", "answer"]) {
        if (!item[field] && item.kind !== "scaffold") {
          missingCoreFields.push({ itemId: item.id || "(missing id)", field });
        }
      }
      for (const media of item.mediaRefs || []) {
        if (!media.src) {
          missingMedia.push({ itemId: item.id, mediaId: media.id || "" });
        }
      }
    }

    const diagnostics = {
      moduleId: moduleData.manifest?.id || "",
      generatedAt: nowIso(),
      publicSafe: true,
      totals: {
        items: items.length,
        byKind: countBy(items, item => item.kind),
        bySystem: countBy(items, item => item.system || "unknown"),
        byTopic: countBy(items, item => item.topic || "unknown")
      },
      validity: {
        duplicateIds,
        missingCoreFields,
        missingMedia,
        errors: duplicateIds.length + missingCoreFields.length + missingMedia.length,
        warnings: 0
      },
      routeHealth: {
        route: moduleData.manifest?.route || "",
        previewParam: options.previewParam || "v2=1"
      },
      privacy: {
        containsLearnerRecords: false,
        containsNotes: false,
        containsPrivateLumiMemory: false
      }
    };
    return diagnostics;
  }

  function toLegacyQuizQuestion(item) {
    const answerIndex = item.choices.findIndex(choice => choice.correct);
    return {
      id: item.id,
      q: item.prompt,
      options: item.choices.map(choice => choice.text),
      answer: answerIndex >= 0 ? answerIndex : 0,
      chapter: item.topic,
      tags: item.tags,
      explain: item.explanation,
      optionExplains: item.feedback.map(entry => ({
        verdict: entry.verdict,
        text: entry.text
      })),
      _teachingModuleV2: {
        moduleId: item.moduleId,
        kind: item.kind,
        deweyPath: item.deweyPath,
        source: item.source
      }
    };
  }

  return {
    VERSION,
    ITEM_KINDS,
    createManifest,
    normalizeLearningItem,
    normalizeQuestion,
    normalizeVocabularyTerm,
    normalizeScaffold,
    normalizeBank,
    normalizeLabExamStudyData,
    createCompatStudyData,
    buildDiagnostics,
    toLegacyQuizQuestion,
    ProgressStore,
    LumiSignalQueue,
    TeachingRuntime
  };
});
