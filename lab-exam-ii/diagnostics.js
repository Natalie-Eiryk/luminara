(function() {
  "use strict";

  const bridge = window.LabExamTeachingV2 || window.initLabExamTeachingV2();
  const report = bridge.diagnostics;
  const cards = document.getElementById("diagnosticCards");
  const tables = document.getElementById("diagnosticTables");
  const json = document.getElementById("diagnosticsJson");

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(label, value, detail) {
    return `<article class="diagnostic-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p class="mini-copy">${escapeHtml(detail || "")}</p></article>`;
  }

  function table(title, data) {
    const rows = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td></tr>`)
      .join("");
    return `<h3>${escapeHtml(title)}</h3><table class="diagnostic-table"><thead><tr><th>Name</th><th>Count</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  cards.innerHTML = [
    card("Total items", report.totals.items, "Canonical v2 learning items"),
    card("Validation errors", report.validity.errors, report.validity.errors ? "Review required" : "No public diagnostic errors"),
    card("Route", report.routeHealth.route || "/lab-exam-ii/", "Preview uses ?v2=1"),
    card("Privacy", report.privacy.containsLearnerRecords ? "Check" : "Clean", "No learner records in report")
  ].join("");
  tables.innerHTML = table("Item kinds", report.totals.byKind) + table("Systems", report.totals.bySystem);
  json.textContent = JSON.stringify(report, null, 2);
})();
