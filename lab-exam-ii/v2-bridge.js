(function(root) {
  "use strict";

  const params = new URLSearchParams(root.location ? root.location.search : "");
  const previewEnabled = params.get("v2") === "1" || params.get("engine") === "v2";
  const diagnosticsEnabled = params.get("diagnostics") === "1";

  function buildBridge() {
    if (!root.TeachingModuleV2 || !root.STUDY_DATA) return null;

    const manifest = root.LAB_EXAM_II_V2_MANIFEST || {};
    const moduleData = root.TeachingModuleV2.normalizeLabExamStudyData(root.STUDY_DATA, manifest);
    const runtime = new root.TeachingModuleV2.TeachingRuntime(moduleData, {
      bridge: root.LumiBridge || null
    });
    const diagnostics = runtime.diagnostics();

    const bridge = {
      enabled: previewEnabled,
      diagnosticsEnabled,
      moduleData,
      runtime,
      diagnostics,
      findBySource(sourceId, kind) {
        const canonicalKind = normalizeKind(kind);
        return moduleData.items.find(item =>
          item.source?.id === sourceId && (!canonicalKind || item.kind === canonicalKind)
        ) || null;
      },
      record(action, sourceId, detail) {
        const item = this.findBySource(sourceId, detail?.kind) || this.runtime.findItem(sourceId);
        if (!item) return null;
        return this.runtime.recordAction(action, item, detail || {});
      },
      score(sourceId, outcome, detail) {
        const item = this.findBySource(sourceId, detail?.kind) || this.runtime.findItem(sourceId);
        if (!item) return null;
        return this.runtime.recordOutcome(item, outcome, detail || {});
      }
    };

    if (previewEnabled) {
      root.STUDY_DATA = root.TeachingModuleV2.createCompatStudyData(moduleData, root.STUDY_DATA);
      root.document?.documentElement?.setAttribute("data-teaching-module-v2", "preview");
    }

    root.LabExamTeachingV2 = bridge;
    return bridge;
  }

  root.initLabExamTeachingV2 = buildBridge;
  buildBridge();

  function normalizeKind(kind) {
    if (!kind) return "";
    if (kind === "true-false") return "true_false";
    if (kind === "multiple-choice" || kind === "identify" || kind === "visual" || kind === "histology") return "quick_roll";
    return kind;
  }
})(typeof window !== "undefined" ? window : globalThis);
