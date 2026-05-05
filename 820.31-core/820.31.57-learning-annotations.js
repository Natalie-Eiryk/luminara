/**
 * 820.31.57 - Learning Annotations
 *
 * Captures learner-selected text as bridge diagnostics:
 * obstacle signals, bridge/helped signals, and refresh notes.
 *
 * This quiz-engine copy mirrors the reusable 820.29 learning technique
 * so the GitHub Pages deploy can run as a standalone static app.
 *
 * @module LearningAnnotations
 * @version 1.0.0
 * @codon 820.31.57
 */

(function(root) {
  'use strict';

  const STORAGE_KEY = 'ms_luminara_learning_annotations';
  const QUEUE_KEY = 'ms_luminara_learning_annotation_queue';
  const REVIEW_KEY = 'ms_luminara_annotation_review_queue';
  const LEGACY_KEYS = ['ms_luminara_confused_words', 'learning_confused_words'];

  const MODE_DEFINITIONS = {
    vocabulary_trouble: {
      label: 'Vocabulary trouble',
      kind: 'obstacle',
      reviewable: true
    },
    concept_trouble: {
      label: 'Concept trouble',
      kind: 'obstacle',
      reviewable: true
    },
    unsure: {
      label: 'Unsure',
      kind: 'obstacle',
      reviewable: true
    },
    visual_needed: {
      label: 'Visual needed',
      kind: 'obstacle',
      reviewable: true,
      representation: 'visual'
    },
    play_manipulation_needed: {
      label: 'Play/manipulation needed',
      kind: 'obstacle',
      reviewable: true,
      representation: 'interactive'
    },
    example_or_analogy_needed: {
      label: 'Example or analogy needed',
      kind: 'obstacle',
      reviewable: true
    },
    prerequisite_gap: {
      label: 'Prerequisite gap',
      kind: 'obstacle',
      reviewable: true
    },
    refresh_later: {
      label: 'Refresh later',
      kind: 'refresh',
      reviewable: true
    },
    bridge_phrase_helped: {
      label: 'Phrase helped',
      kind: 'bridge',
      reviewable: false
    },
    bridge_visual_helped: {
      label: 'Visual helped',
      kind: 'bridge',
      reviewable: false,
      representation: 'visual'
    },
    bridge_example_helped: {
      label: 'Example helped',
      kind: 'bridge',
      reviewable: false
    }
  };

  const TROUBLE_MODES = new Set([
    'vocabulary_trouble',
    'concept_trouble',
    'unsure',
    'visual_needed',
    'play_manipulation_needed',
    'example_or_analogy_needed',
    'prerequisite_gap'
  ]);

  const BRIDGE_MODES = new Set([
    'bridge_phrase_helped',
    'bridge_visual_helped',
    'bridge_example_helped'
  ]);

  const SEMANTIC_SCHEMA_VERSION = 'learning-annotation.semantic.v1';

  const MODE_GAUGES = {
    vocabulary_trouble: 'language.vocabulary',
    concept_trouble: 'concept.scaffold',
    unsure: 'concept.uncertainty',
    visual_needed: 'representation.visual',
    play_manipulation_needed: 'representation.manipulative',
    example_or_analogy_needed: 'story.example_or_analogy',
    prerequisite_gap: 'knowledge.prerequisite',
    refresh_later: 'memory.refresh',
    bridge_phrase_helped: 'language.bridge_phrase',
    bridge_visual_helped: 'representation.visual_bridge',
    bridge_example_helped: 'story.example_bridge'
  };

  const MODE_OPERATORS = {
    vocabulary_trouble: ['F.form', 'R.recall'],
    concept_trouble: ['I.identity', 'D.differentiation'],
    unsure: ['I.identity'],
    visual_needed: ['G.gauge', 'E.evidence'],
    play_manipulation_needed: ['G.gauge', 'A.action'],
    example_or_analogy_needed: ['A.analogy', 'E.evidence'],
    prerequisite_gap: ['D.differentiation', 'T.trace'],
    refresh_later: ['R.recall', 'T.trace'],
    bridge_phrase_helped: ['F.form', 'E.evidence'],
    bridge_visual_helped: ['G.gauge', 'E.evidence'],
    bridge_example_helped: ['A.analogy', 'E.evidence']
  };

  const LearningAnnotations = {
    VERSION: '1.0.0',
    TECHNIQUE: 'Learning Bridge Annotation',
    STORAGE_KEY,
    QUEUE_KEY,
    REVIEW_KEY,
    MODES: MODE_DEFINITIONS,

    initialized: false,
    config: {
      sourceApp: 'luminara',
      enableUi: true,
      maxSelectionLength: 500,
      maxNoteLength: 1200,
      contextChars: 180,
      syncAdapter: null
    },

    state: null,
    syncQueue: [],
    reviewQueue: {},
    currentSelection: null,
    popover: null,
    panel: null,
    logButton: null,

    init(options = {}) {
      this.config = { ...this.config, ...options };
      this.loadState();
      this.loadQueue();
      this.loadReviewQueue();
      this.migrateLegacyConfusedWords();
      this.ensureSemanticRecords();

      if (this.config.enableUi && typeof document !== 'undefined') {
        this.createUi();
        this.setupSelectionListeners();
        this.setupSyncResponseListener();
      }

      this.initialized = true;
      this.flushQueue();
      this.updateLogButton();
      return this;
    },

    setSyncAdapter(adapter) {
      this.config.syncAdapter = adapter;
      this.flushQueue();
    },

    getDefaultState() {
      return {
        version: 1,
        annotations: {},
        order: [],
        migratedLegacyKeys: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },

    loadState() {
      this.state = this.getDefaultState();
      if (typeof localStorage === 'undefined') return;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.state = {
            ...this.state,
            ...parsed,
            annotations: parsed.annotations || {},
            order: Array.isArray(parsed.order) ? parsed.order : [],
            migratedLegacyKeys: parsed.migratedLegacyKeys || {}
          };
        }
      } catch (error) {
        console.warn('[LearningAnnotations] Failed to load local state:', error);
      }
    },

    saveState() {
      if (typeof localStorage === 'undefined') return;
      try {
        this.state.updatedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (error) {
        console.error('[LearningAnnotations] Failed to save local state:', error);
      }
    },

    loadQueue() {
      this.syncQueue = [];
      if (typeof localStorage === 'undefined') return;
      try {
        const stored = localStorage.getItem(QUEUE_KEY);
        this.syncQueue = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(this.syncQueue)) this.syncQueue = [];
      } catch (error) {
        console.warn('[LearningAnnotations] Failed to load sync queue:', error);
        this.syncQueue = [];
      }
    },

    saveQueue() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(this.syncQueue));
      } catch (error) {
        console.error('[LearningAnnotations] Failed to save sync queue:', error);
      }
    },

    loadReviewQueue() {
      this.reviewQueue = {};
      if (typeof localStorage === 'undefined') return;
      try {
        const stored = localStorage.getItem(REVIEW_KEY);
        this.reviewQueue = stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.warn('[LearningAnnotations] Failed to load review queue:', error);
        this.reviewQueue = {};
      }
    },

    saveReviewQueue() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(REVIEW_KEY, JSON.stringify(this.reviewQueue));
      } catch (error) {
        console.error('[LearningAnnotations] Failed to save review queue:', error);
      }
    },

    migrateLegacyConfusedWords() {
      if (typeof localStorage === 'undefined') return;

      for (const key of LEGACY_KEYS) {
        if (this.state.migratedLegacyKeys[key]) continue;

        let legacy = null;
        try {
          const raw = localStorage.getItem(key);
          if (!raw) {
            this.state.migratedLegacyKeys[key] = true;
            continue;
          }
          legacy = JSON.parse(raw);
        } catch (error) {
          this.state.migratedLegacyKeys[key] = true;
          continue;
        }

        const entries = Array.isArray(legacy?.words)
          ? legacy.words
          : Object.values(legacy || {});

        for (const entry of entries) {
          if (!entry || !entry.word) continue;

          const id = this.legacyId(key, entry.word, entry.flaggedAt);
          if (this.state.annotations[id]) continue;

          const annotation = this.normalizeAnnotation({
            id,
            sourceApp: 'luminara',
            sourceType: entry.questionId ? 'question' : 'page',
            sourceId: entry.questionId || 'legacy-confused-word',
            selectedText: entry.word,
            contextBefore: '',
            contextAfter: entry.context || '',
            note: entry.definition ? `Definition: ${entry.definition}` : '',
            modes: ['vocabulary_trouble'],
            createdAt: entry.flaggedAt || new Date().toISOString(),
            reviewState: entry.reviewed ? 'reviewed' : 'queued',
            legacySource: key
          });

          this.persistAnnotation(annotation, { queueSync: false, notify: false });
        }

        this.state.migratedLegacyKeys[key] = true;
      }

      this.saveState();
    },

    legacyId(key, word, flaggedAt) {
      const cleanWord = this.slugify(word || 'word');
      const cleanTime = this.slugify(flaggedAt || 'unknown');
      return `legacy-${this.slugify(key)}-${cleanWord}-${cleanTime}`;
    },

    ensureSemanticRecords() {
      this.ensureState();
      let changed = false;

      for (const annotation of Object.values(this.state.annotations)) {
        if (!annotation || annotation.semanticRecords?.schemaVersion === SEMANTIC_SCHEMA_VERSION) continue;
        annotation.semanticRecords = this.buildSemanticRecords(annotation);
        changed = true;
      }

      if (changed) this.saveState();
    },

    captureAnnotation(input) {
      this.ensureState();
      const annotation = this.normalizeAnnotation(input);
      if (!annotation) return null;

      this.persistAnnotation(annotation, { queueSync: true, notify: true });
      this.showSavedStatus(annotation);
      return annotation;
    },

    captureFromLegacyWord(wordData = {}) {
      if (!wordData.word) return null;
      return this.captureAnnotation({
        sourceApp: 'luminara',
        sourceType: wordData.questionId ? 'question' : 'page',
        sourceId: wordData.questionId || this.getPageSourceId(),
        selectedText: wordData.word,
        contextBefore: '',
        contextAfter: wordData.context || '',
        note: wordData.definition ? `Definition: ${wordData.definition}` : '',
        modes: ['vocabulary_trouble'],
        createdAt: wordData.flaggedAt || new Date().toISOString()
      });
    },

    normalizeAnnotation(input = {}) {
      const selectedText = this.compactText(input.selectedText || '').slice(0, this.config.maxSelectionLength);
      if (selectedText.length < 2) return null;

      const modes = this.sanitizeModes(input.modes || []);
      if (modes.length === 0) return null;

      const source = this.getCurrentSource(input);
      const createdAt = input.createdAt || new Date().toISOString();
      const signalKind = input.signalKind || this.computeSignalKind(modes);
      const reviewable = this.isReviewable(modes, signalKind);
      const note = this.compactText(input.note || '').slice(0, this.config.maxNoteLength);

      const annotation = {
        id: input.id || this.createId(),
        sourceApp: input.sourceApp || source.sourceApp || this.config.sourceApp,
        sourceType: input.sourceType || source.sourceType,
        sourceId: input.sourceId || source.sourceId,
        deweyPath: input.deweyPath || source.deweyPath || '',
        selectedText,
        contextBefore: this.compactText(input.contextBefore || '').slice(-this.config.contextChars),
        contextAfter: this.compactText(input.contextAfter || '').slice(0, this.config.contextChars),
        note,
        signalKind,
        modes,
        createdAt,
        reviewState: input.reviewState || (reviewable ? 'queued' : 'none'),
        contentVersion: input.contentVersion || source.contentVersion || '',
        syncState: input.syncState || 'local',
        syncMeta: input.syncMeta || {},
        legacySource: input.legacySource || null
      };

      annotation.semanticRecords = input.semanticRecords || this.buildSemanticRecords(annotation);
      return annotation;
    },

    buildSemanticRecords(annotation) {
      const sourceRef = {
        sourceApp: annotation.sourceApp,
        sourceType: annotation.sourceType,
        sourceId: annotation.sourceId,
        deweyPath: annotation.deweyPath || '',
        contentVersion: annotation.contentVersion || ''
      };
      const normalizedText = this.compactText(annotation.selectedText || '').toLowerCase();
      const requestedGauges = this.deriveRequestedGauges(annotation);
      const operatorHints = this.deriveOperatorHints(annotation);
      const anchorId = [
        'piline',
        annotation.sourceApp || 'luminara',
        annotation.sourceType || 'page',
        this.slugify(annotation.sourceId || 'current'),
        annotation.id
      ].join(':');

      return {
        schemaVersion: SEMANTIC_SCHEMA_VERSION,
        recordKinds: ['lexemeRecord', 'runtimeSignalRecord', 'isotopeBridgeCandidate', 'piLineAnchor'],
        lexemeRecord: {
          kind: 'lexemeRecord',
          targetCodon: '420.010',
          candidateId: `lexeme:${annotation.id}`,
          rawText: annotation.selectedText,
          normalizedText,
          contextBefore: annotation.contextBefore,
          contextAfter: annotation.contextAfter,
          sourceRef,
          privacy: 'private'
        },
        runtimeSignalRecord: {
          kind: 'runtimeSignalRecord',
          targetCodon: '420.015',
          signalId: `signal:${annotation.id}`,
          signalKind: annotation.signalKind,
          modes: annotation.modes,
          operatorHints,
          requestedGauges,
          notePresent: !!annotation.note,
          sourceRef,
          createdAt: annotation.createdAt,
          privacy: 'private'
        },
        isotopeBridgeCandidate: {
          kind: 'isotopeBridgeCandidate',
          targetCodon: '430.010',
          candidateId: `isotope:${annotation.id}`,
          relation: annotation.signalKind === 'bridge' ? 'gauge_transform_confirmed' : 'gauge_transform_requested',
          sourceGauge: 'learner.selection',
          requestedGauges,
          operatorHints,
          evidenceModes: annotation.modes.filter(mode => BRIDGE_MODES.has(mode)),
          sourceRef,
          privacy: 'private'
        },
        piLineAnchor: {
          kind: 'piLineAnchor',
          anchorId,
          annotationId: annotation.id,
          sourceRef,
          createdAt: annotation.createdAt,
          reviewState: annotation.reviewState,
          privacy: 'private'
        }
      };
    },

    deriveRequestedGauges(annotation) {
      const gauges = annotation.modes
        .map(mode => MODE_GAUGES[mode])
        .filter(Boolean);
      return [...new Set(gauges)];
    },

    deriveOperatorHints(annotation) {
      const hints = new Set();
      for (const mode of annotation.modes) {
        for (const hint of MODE_OPERATORS[mode] || []) {
          hints.add(hint);
        }
      }
      if (annotation.signalKind === 'bridge') hints.add('E.evidence');
      if (annotation.signalKind === 'obstacle') hints.add('D.differentiation');
      if (annotation.signalKind === 'refresh') hints.add('R.recall');
      return [...hints];
    },

    persistAnnotation(annotation, options = {}) {
      this.ensureState();
      const existing = this.state.annotations[annotation.id];
      this.state.annotations[annotation.id] = {
        ...(existing || {}),
        ...annotation
      };

      if (!this.state.order.includes(annotation.id)) {
        this.state.order.unshift(annotation.id);
      }

      this.saveState();

      if (this.isReviewable(annotation.modes, annotation.signalKind)) {
        this.createReviewCard(annotation);
      }

      if (options.notify !== false) {
        this.notifyLocalSystems(annotation);
      }

      if (options.queueSync !== false) {
        this.queueOrSend(annotation);
      }

      this.updateLogButton();
      if (this.panel?.classList.contains('visible')) {
        this.renderBridgeLog();
      }
    },

    sanitizeModes(modes) {
      const list = Array.isArray(modes) ? modes : [modes];
      return [...new Set(list.filter(mode => MODE_DEFINITIONS[mode]))];
    },

    computeSignalKind(modes) {
      if (modes.includes('refresh_later')) return 'refresh';
      if (modes.some(mode => TROUBLE_MODES.has(mode))) return 'obstacle';
      if (modes.some(mode => BRIDGE_MODES.has(mode))) return 'bridge';
      return 'obstacle';
    },

    isReviewable(modes, signalKind) {
      if (signalKind === 'refresh') return true;
      return modes.some(mode => MODE_DEFINITIONS[mode]?.reviewable);
    },

    createReviewCard(annotation) {
      const now = Date.now();
      const existing = this.reviewQueue[annotation.id] || {};
      this.reviewQueue[annotation.id] = {
        annotationId: annotation.id,
        sourceId: annotation.sourceId,
        selectedText: annotation.selectedText,
        modes: annotation.modes,
        signalKind: annotation.signalKind,
        dueAt: existing.dueAt || now,
        createdAt: existing.createdAt || annotation.createdAt,
        lastReviewedAt: existing.lastReviewedAt || null,
        reviewCount: existing.reviewCount || 0,
        status: annotation.reviewState === 'reviewed' ? 'reviewed' : (existing.status || 'queued')
      };
      this.saveReviewQueue();

      if (root.SRSEngine && typeof root.SRSEngine.addItem === 'function') {
        try {
          root.SRSEngine.addItem(annotation.id, {
            type: 'learning_annotation',
            sourceId: annotation.sourceId,
            modes: annotation.modes,
            signalKind: annotation.signalKind
          });
        } catch (error) {
          // The local annotation queue remains authoritative for this feature.
        }
      }
    },

    markReviewed(annotationId) {
      const annotation = this.state.annotations[annotationId];
      if (!annotation) return false;

      annotation.reviewState = 'reviewed';
      annotation.reviewedAt = new Date().toISOString();

      if (this.reviewQueue[annotationId]) {
        this.reviewQueue[annotationId].status = 'reviewed';
        this.reviewQueue[annotationId].lastReviewedAt = Date.now();
        this.reviewQueue[annotationId].reviewCount = (this.reviewQueue[annotationId].reviewCount || 0) + 1;
        this.saveReviewQueue();
      }

      this.saveState();
      this.updateLogButton();
      this.renderBridgeLog();
      return true;
    },

    deleteAnnotation(annotationId) {
      if (!this.state.annotations[annotationId]) return false;

      delete this.state.annotations[annotationId];
      this.state.order = this.state.order.filter(id => id !== annotationId);
      delete this.reviewQueue[annotationId];
      this.syncQueue = this.syncQueue.filter(item => item.annotationId !== annotationId);

      this.saveState();
      this.saveReviewQueue();
      this.saveQueue();
      this.updateLogButton();
      this.renderBridgeLog();
      return true;
    },

    getAnnotations() {
      this.ensureState();
      return this.state.order
        .map(id => this.state.annotations[id])
        .filter(Boolean);
    },

    getSummary() {
      const annotations = this.getAnnotations();
      return annotations.reduce((summary, annotation) => {
        summary.total++;
        summary[annotation.signalKind] = (summary[annotation.signalKind] || 0) + 1;
        if (annotation.reviewState && annotation.reviewState !== 'reviewed' && annotation.reviewState !== 'none') {
          summary.unresolved++;
        }
        for (const mode of annotation.modes) {
          summary.modes[mode] = (summary.modes[mode] || 0) + 1;
        }
        return summary;
      }, { total: 0, obstacle: 0, bridge: 0, refresh: 0, unresolved: 0, modes: {} });
    },

    queueOrSend(annotation) {
      const sent = this.sendToBridge(annotation);
      if (sent) return;

      if (!this.syncQueue.some(item => item.annotationId === annotation.id)) {
        this.syncQueue.push({
          annotationId: annotation.id,
          queuedAt: new Date().toISOString(),
          attempts: 0
        });
        annotation.syncState = 'queued';
        this.saveState();
        this.saveQueue();
      }
    },

    sendToBridge(annotation) {
      const bridge = this.config.syncAdapter || root.LumiBridge;
      if (!bridge || typeof bridge.captureLearningAnnotation !== 'function' || !bridge.connected) {
        return false;
      }

      const result = bridge.captureLearningAnnotation(annotation);
      if (!result || result.sent === false) return false;

      annotation.syncState = result.pendingAck ? 'sent' : 'synced';
      annotation.syncMeta = {
        ...(annotation.syncMeta || {}),
        sentAt: new Date().toISOString()
      };
      this.saveState();
      return true;
    },

    flushQueue() {
      if (!this.syncQueue.length) return { flushed: 0, remaining: 0 };

      let flushed = 0;
      const remaining = [];

      for (const item of this.syncQueue) {
        const annotation = this.state.annotations[item.annotationId];
        if (!annotation) continue;

        item.attempts = (item.attempts || 0) + 1;
        item.lastAttemptAt = new Date().toISOString();

        if (this.sendToBridge(annotation)) {
          flushed++;
        } else {
          remaining.push(item);
        }
      }

      this.syncQueue = remaining;
      this.saveQueue();
      this.updateLogButton();
      return { flushed, remaining: remaining.length };
    },

    setupSyncResponseListener() {
      if (this._responseListenerAttached || typeof window === 'undefined') return;
      this._responseListenerAttached = true;

      window.addEventListener('lumi-learning-annotation-response', event => {
        const detail = event.detail || {};
        const id = detail.annotationId || detail.submissionId;
        if (!id || !this.state.annotations[id]) return;

        const annotation = this.state.annotations[id];
        annotation.syncState = detail.accepted === false ? 'failed' : 'synced';
        annotation.syncMeta = {
          ...(annotation.syncMeta || {}),
          accepted: detail.accepted !== false,
          memoryId: detail.memoryId || annotation.syncMeta?.memoryId || null,
          reviewCardId: detail.reviewCardId || annotation.syncMeta?.reviewCardId || null,
          repairSignalId: detail.repairSignalId || annotation.syncMeta?.repairSignalId || null,
          respondedAt: new Date().toISOString()
        };

        this.saveState();
        this.renderBridgeLog();
      });

      window.addEventListener('lumi-bridge-connected', () => {
        this.flushQueue();
      });
    },

    notifyLocalSystems(annotation) {
      this.syncVocabularyTrouble(annotation);
      this.syncAnalytics(annotation);
      this.syncGrowthSignals(annotation);
      this.syncMetacognition(annotation);
      this.syncRepresentation(annotation);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lumi-learning-annotation', {
          detail: {
            annotation,
            summary: this.annotationSummary(annotation)
          }
        }));
      }
    },

    annotationSummary(annotation) {
      return {
        id: annotation.id,
        sourceApp: annotation.sourceApp,
        sourceType: annotation.sourceType,
        sourceId: annotation.sourceId,
        deweyPath: annotation.deweyPath,
        signalKind: annotation.signalKind,
        modes: annotation.modes,
        selectedLength: annotation.selectedText.length,
        notePresent: !!annotation.note,
        createdAt: annotation.createdAt,
        reviewState: annotation.reviewState,
        semanticSchemaVersion: annotation.semanticRecords?.schemaVersion || '',
        semanticRecordKinds: annotation.semanticRecords?.recordKinds || [],
        piLineAnchor: annotation.semanticRecords?.piLineAnchor?.anchorId || ''
      };
    },

    syncVocabularyTrouble(annotation) {
      if (!annotation.modes.includes('vocabulary_trouble')) return;
      const term = annotation.selectedText;
      if (!term || term.split(/\s+/).length > 4) return;

      if (root.ConfusedWords?.words) {
        const key = term.toLowerCase().trim();
        root.ConfusedWords.words[key] = {
          word: term,
          definition: '',
          context: this.buildContext(annotation),
          questionId: annotation.sourceId || '',
          flaggedAt: annotation.createdAt,
          reviewed: annotation.reviewState === 'reviewed',
          annotationId: annotation.id
        };
        if (typeof root.ConfusedWords.saveWords === 'function') root.ConfusedWords.saveWords();
        if (typeof root.ConfusedWords.updateBadgeCount === 'function') root.ConfusedWords.updateBadgeCount();
      }
    },

    syncAnalytics(annotation) {
      const summary = this.annotationSummary(annotation);
      if (root.learningAnalytics && typeof root.learningAnalytics.recordLearningAnnotation === 'function') {
        root.learningAnalytics.recordLearningAnnotation(summary);
      }

      if (root.LumiBridge && typeof root.LumiBridge.recordEvent === 'function') {
        root.LumiBridge.recordEvent('learning_annotation_summary', summary);
      }
    },

    syncGrowthSignals(annotation) {
      const summary = this.annotationSummary(annotation);
      if (root.growthSignalFeedback && typeof root.growthSignalFeedback.recordAnnotationSignal === 'function') {
        root.growthSignalFeedback.recordAnnotationSignal(summary);
      }
    },

    syncMetacognition(annotation) {
      if (!root.MetacognitiveEngine) return;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lumi-metacognitive-annotation', {
          detail: this.annotationSummary(annotation)
        }));
      }
    },

    syncRepresentation(annotation) {
      const needsVisual = annotation.modes.includes('visual_needed');
      const needsInteractive = annotation.modes.includes('play_manipulation_needed');
      if (!needsVisual && !needsInteractive) return;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lumi-representation-needed', {
          detail: {
            annotationId: annotation.id,
            sourceId: annotation.sourceId,
            deweyPath: annotation.deweyPath,
            representation: needsInteractive ? 'interactive' : 'visual',
            modes: annotation.modes
          }
        }));
      }
    },

    getCurrentSource(input = {}) {
      if (input.sourceId && input.sourceType) {
        return {
          sourceApp: input.sourceApp || this.config.sourceApp,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          deweyPath: input.deweyPath || '',
          contentVersion: input.contentVersion || ''
        };
      }

      const quiz = root.quiz;
      let currentQuestion = null;
      let mainQuestion = null;

      try {
        currentQuestion = quiz?.getCurrentQuestion?.() || null;
        mainQuestion = quiz?.currentQuiz?.[quiz.currentIdx] || currentQuestion;
      } catch (error) {
        currentQuestion = null;
        mainQuestion = null;
      }

      const sourceId = currentQuestion?.id || mainQuestion?.id || this.getPageSourceId();
      const deweyPath = [
        mainQuestion?._category || currentQuestion?._category || '',
        mainQuestion?._bank || currentQuestion?._bank || '',
        currentQuestion?.chapter || mainQuestion?.chapter || ''
      ].filter(Boolean).join(' / ');

      return {
        sourceApp: this.config.sourceApp,
        sourceType: currentQuestion?.id || mainQuestion?.id ? 'question' : this.detectPageSourceType(),
        sourceId,
        deweyPath,
        contentVersion: this.getContentVersion()
      };
    },

    detectPageSourceType() {
      if (document.querySelector('.lesson-modal, .lesson-overlay')) return 'lesson';
      if (document.getElementById('questionArea')?.textContent?.trim()) return 'question';
      return 'page';
    },

    getPageSourceId() {
      if (typeof location !== 'undefined') {
        return location.pathname.split('/').filter(Boolean).pop() || 'luminara-page';
      }
      return 'luminara-page';
    },

    getContentVersion() {
      const meta = document.querySelector('meta[name="build-version"], meta[name="app-version"]');
      if (meta?.content) return meta.content;
      const timestamp = document.getElementById('buildTimestamp')?.textContent || '';
      return timestamp.trim();
    },

    createId() {
      return `la-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    },

    compactText(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    },

    slugify(value) {
      return this.compactText(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 64) || 'item';
    },

    buildContext(annotation) {
      return `${annotation.contextBefore} ${annotation.selectedText} ${annotation.contextAfter}`.trim();
    },

    createUi() {
      if (document.getElementById('learning-annotation-popover')) {
        this.popover = document.getElementById('learning-annotation-popover');
        this.panel = document.getElementById('learning-annotation-panel');
        this.logButton = document.getElementById('learning-annotation-log-button');
        return;
      }

      this.logButton = document.createElement('button');
      this.logButton.id = 'learning-annotation-log-button';
      this.logButton.className = 'learning-annotation-log-button learning-annotation-ui';
      this.logButton.type = 'button';
      this.logButton.textContent = 'Bridge Log';
      this.logButton.addEventListener('click', () => this.openBridgeLog());
      document.body.appendChild(this.logButton);

      this.popover = document.createElement('div');
      this.popover.id = 'learning-annotation-popover';
      this.popover.className = 'learning-annotation-popover learning-annotation-ui';
      this.popover.setAttribute('role', 'dialog');
      this.popover.setAttribute('aria-label', 'Save learning annotation');
      this.popover.innerHTML = this.renderPopoverTemplate();
      document.body.appendChild(this.popover);

      this.panel = document.createElement('aside');
      this.panel.id = 'learning-annotation-panel';
      this.panel.className = 'learning-annotation-panel learning-annotation-ui';
      this.panel.setAttribute('aria-label', 'Bridge Log');
      document.body.appendChild(this.panel);

      this.popover.querySelector('[data-action="save-annotation"]').addEventListener('click', () => this.saveCurrentSelection());
      this.popover.querySelector('[data-action="cancel-annotation"]').addEventListener('click', () => this.hidePopover());
      this.popover.querySelector('[data-action="open-bridge-log"]').addEventListener('click', () => this.openBridgeLog());
    },

    renderPopoverTemplate() {
      const modes = Object.entries(MODE_DEFINITIONS).map(([id, mode]) => `
        <label class="learning-annotation-mode">
          <input type="checkbox" value="${id}">
          <span>${mode.label}</span>
        </label>
      `).join('');

      return `
        <div class="learning-annotation-header">
          <div>
            <div class="learning-annotation-kicker">Bridge diagnostic</div>
            <div class="learning-annotation-title">What happened here?</div>
          </div>
          <button type="button" class="learning-annotation-icon-btn" data-action="cancel-annotation" aria-label="Close">x</button>
        </div>
        <div class="learning-annotation-snippet" data-role="selection-preview"></div>
        <details class="learning-annotation-mode-details" open>
          <summary>Tag the bridge</summary>
          <div class="learning-annotation-mode-grid">${modes}</div>
        </details>
        <label class="learning-annotation-note-label">
          Note for refresh
          <textarea data-role="annotation-note" maxlength="${this.config.maxNoteLength}" rows="3" placeholder="What should Lumi remember about this?"></textarea>
        </label>
        <div class="learning-annotation-status" data-role="annotation-status" aria-live="polite"></div>
        <div class="learning-annotation-actions">
          <button type="button" class="learning-annotation-secondary" data-action="open-bridge-log">Bridge Log</button>
          <button type="button" class="learning-annotation-primary" data-action="save-annotation">Save</button>
        </div>
      `;
    },

    setupSelectionListeners() {
      if (this._selectionListenersAttached) return;
      this._selectionListenersAttached = true;

      const schedule = event => {
        if (this.shouldIgnoreSelectionEvent(event)) return;
        setTimeout(() => this.handleSelection(event), 0);
      };

      document.addEventListener('mouseup', schedule);
      document.addEventListener('touchend', schedule, { passive: true });
      document.addEventListener('keyup', event => {
        if (event.key === 'Shift' || event.key.startsWith('Arrow')) schedule(event);
      });
      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection?.();
        if (!selection || selection.isCollapsed) return;
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') this.hidePopover();
      });
      document.addEventListener('mousedown', event => {
        if (this.popover?.classList.contains('visible') && !event.target.closest('.learning-annotation-ui')) {
          this.hidePopover();
        }
      });
    },

    shouldIgnoreSelectionEvent(event) {
      const target = event.target;
      if (!target || !target.closest) return false;
      if (target.closest('.learning-annotation-ui')) return true;
      if (target.closest('button, input, textarea, select, [contenteditable="true"], a')) return true;
      return false;
    },

    handleSelection(event) {
      const selection = window.getSelection?.();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      const selectedText = this.compactText(selection.toString());
      if (selectedText.length < 2 || selectedText.length > this.config.maxSelectionLength) {
        return;
      }

      const range = selection.getRangeAt(0).cloneRange();
      const rect = this.getRangeRect(range);
      if (!rect) return;

      this.currentSelection = this.buildSelectionPayload(range, selectedText);
      this.showPopover(rect, event);
    },

    buildSelectionPayload(range, selectedText) {
      const scope = this.getSelectionScope(range);
      const scopeText = this.compactText(scope?.textContent || '');
      const needle = this.compactText(selectedText);
      const index = scopeText.toLowerCase().indexOf(needle.toLowerCase());
      const before = index >= 0 ? scopeText.slice(Math.max(0, index - this.config.contextChars), index) : '';
      const after = index >= 0 ? scopeText.slice(index + needle.length, index + needle.length + this.config.contextChars) : '';

      return {
        ...this.getCurrentSource({}),
        selectedText: needle,
        contextBefore: before,
        contextAfter: after
      };
    },

    getSelectionScope(range) {
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      return node?.closest?.(
        '.question-card, .battle-scene, .battle-layout, .lesson-modal, .module-container, #questionArea, main, article'
      ) || document.body;
    },

    getRangeRect(range) {
      const rect = range.getBoundingClientRect();
      if (rect && (rect.width || rect.height)) return rect;
      const rects = range.getClientRects();
      return rects.length ? rects[0] : null;
    },

    showPopover(rect) {
      if (!this.popover || !this.currentSelection) return;

      const preview = this.popover.querySelector('[data-role="selection-preview"]');
      const note = this.popover.querySelector('[data-role="annotation-note"]');
      const status = this.popover.querySelector('[data-role="annotation-status"]');

      preview.textContent = this.currentSelection.selectedText;
      note.value = '';
      status.textContent = '';
      this.popover.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.checked = input.value === 'unsure';
      });

      this.popover.classList.add('visible');
      this.positionPopover(rect);
    },

    positionPopover(rect) {
      const pad = 12;
      const pop = this.popover;
      pop.style.left = '0px';
      pop.style.top = '0px';
      const width = Math.min(420, window.innerWidth - pad * 2);
      pop.style.width = `${width}px`;

      const popRect = pop.getBoundingClientRect();
      let left = rect.left + rect.width / 2 - width / 2;
      let top = rect.bottom + 10;

      left = Math.max(pad, Math.min(left, window.innerWidth - width - pad));
      if (top + popRect.height > window.innerHeight - pad) {
        top = Math.max(pad, rect.top - popRect.height - 10);
      }

      pop.style.left = `${left}px`;
      pop.style.top = `${top}px`;
    },

    hidePopover() {
      this.popover?.classList.remove('visible');
    },

    saveCurrentSelection() {
      if (!this.currentSelection) return;

      const modes = Array.from(this.popover.querySelectorAll('input[type="checkbox"]:checked'))
        .map(input => input.value);
      const status = this.popover.querySelector('[data-role="annotation-status"]');

      if (modes.length === 0) {
        status.textContent = 'Choose at least one bridge tag.';
        return;
      }

      const note = this.popover.querySelector('[data-role="annotation-note"]').value;
      const annotation = this.captureAnnotation({
        ...this.currentSelection,
        modes,
        note
      });

      if (annotation) {
        status.textContent = 'Saved to Bridge Log.';
        setTimeout(() => this.hidePopover(), 450);
      }
    },

    showSavedStatus(annotation) {
      if (!this.logButton) return;
      this.logButton.classList.add('learning-annotation-pulse');
      setTimeout(() => this.logButton.classList.remove('learning-annotation-pulse'), 900);
    },

    openBridgeLog() {
      if (!this.panel) return;
      this.renderBridgeLog();
      this.panel.classList.add('visible');
    },

    closeBridgeLog() {
      this.panel?.classList.remove('visible');
    },

    renderBridgeLog() {
      if (!this.panel) return;

      this.panel.textContent = '';

      const header = this.el('div', 'learning-annotation-panel-header');
      const titleWrap = this.el('div');
      titleWrap.appendChild(this.el('div', 'learning-annotation-kicker', 'Private learning memory'));
      titleWrap.appendChild(this.el('h2', '', 'Bridge Log'));
      const close = this.el('button', 'learning-annotation-icon-btn', 'x');
      close.type = 'button';
      close.setAttribute('aria-label', 'Close Bridge Log');
      close.addEventListener('click', () => this.closeBridgeLog());
      header.append(titleWrap, close);
      this.panel.appendChild(header);

      const summary = this.getSummary();
      const stats = this.el('div', 'learning-annotation-stats');
      stats.append(
        this.statCard('Total', summary.total),
        this.statCard('Needs bridge', summary.obstacle || 0),
        this.statCard('Refresh', summary.refresh || 0),
        this.statCard('Helped', summary.bridge || 0)
      );
      this.panel.appendChild(stats);

      const actions = this.el('div', 'learning-annotation-panel-actions');
      const flush = this.el('button', 'learning-annotation-secondary', `Sync queued (${this.syncQueue.length})`);
      flush.type = 'button';
      flush.addEventListener('click', () => {
        const result = this.flushQueue();
        flush.textContent = `Sync queued (${result.remaining})`;
      });

      const exportBtn = this.el('button', 'learning-annotation-secondary', 'Export');
      exportBtn.type = 'button';
      exportBtn.addEventListener('click', () => this.exportAnnotations());
      actions.append(flush, exportBtn);
      this.panel.appendChild(actions);

      const annotations = this.getAnnotations();
      if (!annotations.length) {
        const empty = this.el('div', 'learning-annotation-empty');
        empty.appendChild(this.el('div', 'learning-annotation-empty-title', 'No bridge notes yet'));
        empty.appendChild(this.el('p', '', 'Highlight text while studying to save obstacles, refresh notes, and helpful bridge phrases.'));
        this.panel.appendChild(empty);
        return;
      }

      const groups = [
        ['Needs Bridge', annotations.filter(a => a.signalKind === 'obstacle')],
        ['Refresh Later', annotations.filter(a => a.signalKind === 'refresh')],
        ['Helped It Click', annotations.filter(a => a.signalKind === 'bridge')],
        ['All Notes', annotations]
      ];

      for (const [label, items] of groups) {
        if (!items.length) continue;
        const section = this.el('section', 'learning-annotation-section');
        section.appendChild(this.el('h3', '', `${label} (${items.length})`));
        const list = this.el('div', 'learning-annotation-list');
        items.slice(0, label === 'All Notes' ? 80 : 20).forEach(annotation => {
          list.appendChild(this.renderAnnotationCard(annotation));
        });
        section.appendChild(list);
        this.panel.appendChild(section);
      }
    },

    renderAnnotationCard(annotation) {
      const card = this.el('article', `learning-annotation-card ${annotation.signalKind}`);
      const meta = this.el('div', 'learning-annotation-card-meta');
      meta.appendChild(this.el('span', '', annotation.signalKind));
      if (annotation.deweyPath) meta.appendChild(this.el('span', '', annotation.deweyPath));
      meta.appendChild(this.el('span', '', new Date(annotation.createdAt).toLocaleString()));

      const quote = this.el('blockquote', '', annotation.selectedText);
      const modes = this.el('div', 'learning-annotation-chip-row');
      annotation.modes.forEach(mode => {
        modes.appendChild(this.el('span', 'learning-annotation-chip', MODE_DEFINITIONS[mode]?.label || mode));
      });

      card.append(meta, quote, modes);

      if (annotation.note) {
        card.appendChild(this.el('p', 'learning-annotation-note', annotation.note));
      }

      const footer = this.el('div', 'learning-annotation-card-footer');
      footer.appendChild(this.el('span', 'learning-annotation-sync-state', annotation.syncState || 'local'));

      const review = this.el('button', 'learning-annotation-secondary', 'Reviewed');
      review.type = 'button';
      review.disabled = annotation.reviewState === 'reviewed';
      review.addEventListener('click', () => this.markReviewed(annotation.id));

      const del = this.el('button', 'learning-annotation-danger', 'Delete');
      del.type = 'button';
      del.addEventListener('click', () => this.deleteAnnotation(annotation.id));

      footer.append(review, del);
      card.appendChild(footer);
      return card;
    },

    statCard(label, value) {
      const card = this.el('div', 'learning-annotation-stat');
      card.appendChild(this.el('strong', '', String(value)));
      card.appendChild(this.el('span', '', label));
      return card;
    },

    updateLogButton() {
      if (!this.logButton) return;
      const summary = this.getSummary();
      this.logButton.textContent = summary.total ? `Bridge Log (${summary.unresolved}/${summary.total})` : 'Bridge Log';
      this.logButton.dataset.count = String(summary.total);
    },

    exportAnnotations() {
      const payload = {
        exportedAt: new Date().toISOString(),
        sourceApp: this.config.sourceApp,
        annotations: this.getAnnotations(),
        reviewQueue: this.reviewQueue
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `luminara-bridge-log-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },

    recoverAnchor(annotation, rootElement = document.body) {
      const haystack = this.compactText(rootElement?.textContent || '');
      const selected = this.compactText(annotation?.selectedText || '');
      if (!haystack || !selected) return { found: false, strategy: 'none' };

      const direct = haystack.toLowerCase().indexOf(selected.toLowerCase());
      if (direct >= 0) {
        return { found: true, strategy: 'selectedText', index: direct };
      }

      const before = this.compactText(annotation.contextBefore || '').slice(-80).toLowerCase();
      const after = this.compactText(annotation.contextAfter || '').slice(0, 80).toLowerCase();
      const lower = haystack.toLowerCase();
      const beforeIndex = before ? lower.indexOf(before) : -1;
      const afterIndex = after ? lower.indexOf(after) : -1;

      if (beforeIndex >= 0 && afterIndex >= 0 && afterIndex > beforeIndex) {
        return {
          found: true,
          strategy: 'contextBeforeAfter',
          index: beforeIndex + before.length,
          endIndex: afterIndex
        };
      }

      if (beforeIndex >= 0) return { found: true, strategy: 'contextBefore', index: beforeIndex + before.length };
      if (afterIndex >= 0) return { found: true, strategy: 'contextAfter', index: Math.max(0, afterIndex - selected.length) };
      return { found: false, strategy: 'none' };
    },

    el(tag, className = '', text = '') {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== '') node.textContent = text;
      return node;
    },

    ensureState() {
      if (!this.state) this.loadState();
      if (!Array.isArray(this.syncQueue)) this.loadQueue();
      if (!this.reviewQueue) this.loadReviewQueue();
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LearningAnnotations;
  }

  root.LearningAnnotations = LearningAnnotations;
})(typeof globalThis !== 'undefined' ? globalThis : window);
