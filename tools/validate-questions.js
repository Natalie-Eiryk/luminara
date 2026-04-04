#!/usr/bin/env node

/**
 * Question Quality Validator
 *
 * Validates quiz questions against JSON schemas and quality standards.
 * Generates HTML reports with severity-coded issues.
 *
 * Usage:
 *   node validate-questions.js                     # Generate HTML report
 *   node validate-questions.js --strict           # Exit with error if CRITICAL issues
 *   node validate-questions.js --output report.html
 *
 * @codon 820.31
 * @version 2026-04-03
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  contentRoot: path.resolve(__dirname, '../../../820.50-Dewey_Content'),
  questionSchema: require('./question-schema.json'),
  scaffoldSchema: require('./scaffold-schema.json'),
  outputDir: path.join(__dirname, 'reports'),
  severityThresholds: {
    CRITICAL: 0, // Any CRITICAL issue fails --strict
    HIGH: 10,
    MEDIUM: 20
  }
};

// Issue severity levels
const SEVERITY = {
  CRITICAL: { level: 'CRITICAL', color: '#dc3545', weight: 100 },
  HIGH: { level: 'HIGH', color: '#fd7e14', weight: 10 },
  MEDIUM: { level: 'MEDIUM', color: '#ffc107', weight: 5 },
  LOW: { level: 'LOW', color: '#17a2b8', weight: 1 }
};

// Issue catalog
class Issue {
  constructor(severity, category, message, questionId, recommendation) {
    this.severity = severity;
    this.category = category;
    this.message = message;
    this.questionId = questionId;
    this.recommendation = recommendation || '';
    this.timestamp = new Date().toISOString();
  }
}

class ValidationReport {
  constructor() {
    this.issues = [];
    this.stats = {
      questionsScanned: 0,
      questionBanks: 0,
      scaffoldsScanned: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
  }

  addIssue(issue) {
    this.issues.push(issue);
    this.stats[issue.severity.level.toLowerCase()]++;
  }

  toHTML() {
    const timestamp = new Date().toLocaleString();
    const hasBlockers = this.stats.critical > 0;
    const overallStatus = hasBlockers ? 'FAILING' : (this.stats.high > 0 ? 'WARNING' : 'PASSING');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Question Quality Report - ${timestamp}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8f9fa;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { font-size: 28px; color: #212529; margin-bottom: 10px; }
    .timestamp { color: #6c757d; font-size: 14px; }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 15px;
      font-size: 16px;
    }
    .status.FAILING { background: #dc3545; color: white; }
    .status.WARNING { background: #ffc107; color: #212529; }
    .status.PASSING { background: #28a745; color: white; }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-number { font-size: 32px; font-weight: bold; color: #212529; }
    .stat-label { color: #6c757d; font-size: 14px; text-transform: uppercase; }
    .stat-card.critical .stat-number { color: #dc3545; }
    .stat-card.high .stat-number { color: #fd7e14; }
    .stat-card.medium .stat-number { color: #ffc107; }
    .stat-card.low .stat-number { color: #17a2b8; }

    .issues {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .issues h2 {
      padding: 20px;
      background: #343a40;
      color: white;
      font-size: 20px;
    }
    .issue {
      padding: 20px;
      border-bottom: 1px solid #dee2e6;
    }
    .issue:last-child { border-bottom: none; }
    .issue-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .severity-badge {
      padding: 4px 12px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      font-size: 12px;
      margin-right: 10px;
    }
    .issue-id {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      margin-right: 10px;
    }
    .issue-category {
      color: #6c757d;
      font-size: 14px;
    }
    .issue-message {
      color: #212529;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .issue-recommendation {
      background: #f8f9fa;
      padding: 12px;
      border-left: 3px solid #17a2b8;
      border-radius: 4px;
      font-size: 14px;
      color: #495057;
    }
    .recommendation-label {
      font-weight: bold;
      color: #17a2b8;
      margin-bottom: 5px;
    }
    .no-issues {
      padding: 40px;
      text-align: center;
      color: #28a745;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Ms. Luminara Quiz Question Quality Report</h1>
      <div class="timestamp">Generated: ${timestamp}</div>
      <div class="status ${overallStatus}">${overallStatus}</div>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${this.stats.questionBanks}</div>
        <div class="stat-label">Question Banks</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${this.stats.questionsScanned}</div>
        <div class="stat-label">Questions Scanned</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-number">${this.stats.critical}</div>
        <div class="stat-label">Critical Issues</div>
      </div>
      <div class="stat-card high">
        <div class="stat-number">${this.stats.high}</div>
        <div class="stat-label">High Priority</div>
      </div>
      <div class="stat-card medium">
        <div class="stat-number">${this.stats.medium}</div>
        <div class="stat-label">Medium Priority</div>
      </div>
      <div class="stat-card low">
        <div class="stat-number">${this.stats.low}</div>
        <div class="stat-label">Low Priority</div>
      </div>
    </div>

    <div class="issues">
      <h2>Issues Detected (${this.issues.length})</h2>
      ${this.issues.length === 0 ?
        '<div class="no-issues">✓ No issues detected. All questions meet quality standards!</div>' :
        this.issues.map(issue => `
          <div class="issue">
            <div class="issue-header">
              <span class="severity-badge" style="background: ${issue.severity.color}">${issue.severity.level}</span>
              <span class="issue-id">${issue.questionId}</span>
              <span class="issue-category">${issue.category}</span>
            </div>
            <div class="issue-message">${issue.message}</div>
            ${issue.recommendation ? `
              <div class="issue-recommendation">
                <div class="recommendation-label">Recommendation:</div>
                ${issue.recommendation}
              </div>
            ` : ''}
          </div>
        `).join('')
      }
    </div>
  </div>
</body>
</html>`;
  }
}

// Quality validators
class QualityValidator {
  constructor(report) {
    this.report = report;
  }

  validateQuestion(question, bankId) {
    const qId = question.id || `${bankId}.unknown`;

    // 1. Schema validation (answer index bounds)
    if (question.answer >= question.options.length) {
      this.report.addIssue(new Issue(
        SEVERITY.CRITICAL,
        'Schema Violation',
        `Answer index ${question.answer} exceeds options array length (${question.options.length})`,
        qId,
        'Fix answer index to point to valid option (0-based indexing)'
      ));
    }

    // 2. optionExplains length match
    if (question.optionExplains && question.optionExplains.length !== question.options.length) {
      this.report.addIssue(new Issue(
        SEVERITY.CRITICAL,
        'Schema Violation',
        `optionExplains length (${question.optionExplains.length}) does not match options length (${question.options.length})`,
        qId,
        'Add or remove optionExplains entries to match options array'
      ));
    }

    // 3. Placeholder detection - Mechanism
    if (question.mechanism && question.mechanism.metaphor) {
      if (question.mechanism.metaphor.includes('Think of this as the key landmark')) {
        this.report.addIssue(new Issue(
          SEVERITY.HIGH,
          'Generic Mechanism',
          'Mechanism uses generic placeholder template instead of real metaphor',
          qId,
          'Replace with concrete metaphor creating structural isomorphism (e.g., "like a factory assembly line", "like a water balloon expanding")'
        ));
      }
    }

    // 4. Template boilerplate - optionExplains
    if (question.optionExplains) {
      question.optionExplains.forEach((opt, idx) => {
        if (opt.text && opt.text.includes('This would be') && opt.text.includes('but the question asks for')) {
          this.report.addIssue(new Issue(
            SEVERITY.HIGH,
            'Templated Feedback',
            `Option ${idx} uses generic template feedback instead of teaching explanation`,
            qId,
            'Rewrite to diagnose the specific misconception and provide path to understanding'
          ));
        }
      });
    }

    // 5. Answer format consistency
    const correctAnswer = question.options[question.answer];
    const wrongAnswers = question.options.filter((_, idx) => idx !== question.answer);

    const correctIsLong = correctAnswer && correctAnswer.length > 60;
    const wrongAreShort = wrongAnswers.every(opt => opt.length < 30);

    if (correctIsLong && wrongAreShort) {
      this.report.addIssue(new Issue(
        SEVERITY.HIGH,
        'Format Mismatch',
        `Correct answer is ${correctAnswer.length} chars but wrong answers average ${Math.round(wrongAnswers.reduce((sum, opt) => sum + opt.length, 0) / wrongAnswers.length)} chars`,
        qId,
        'Make all options comparable format (all single terms OR all sentences)'
      ));
    }

    // 6. Shallow explanation (just restates answer)
    if (question.explain && correctAnswer && question.explain === correctAnswer + '.') {
      this.report.addIssue(new Issue(
        SEVERITY.MEDIUM,
        'Shallow Explanation',
        'Explanation just restates the answer without additional teaching',
        qId,
        'Expand explanation to address WHY, clinical significance, or common confusions'
      ));
    }

    // 7. Distractor relevance check (simple heuristic)
    if (question.tags && question.tags.length > 0) {
      const mainTag = question.tags[0].toLowerCase();
      const unrelatedOptions = wrongAnswers.filter(opt => {
        const optLower = opt.toLowerCase();
        // Check if distractor contains any keywords from the question topic
        return !optLower.includes(mainTag.substring(0, 5)) &&
               !question.q.toLowerCase().includes(optLower.substring(0, Math.min(8, optLower.length)));
      });

      if (unrelatedOptions.length === wrongAnswers.length) {
        this.report.addIssue(new Issue(
          SEVERITY.CRITICAL,
          'Irrelevant Distractors',
          `All ${wrongAnswers.length} wrong answers appear unrelated to question topic (${mainTag})`,
          qId,
          'Replace distractors with plausible misconceptions from the same domain'
        ));
      }
    }

    // 8. Missing mechanism
    if (!question.mechanism || !question.mechanism.content) {
      this.report.addIssue(new Issue(
        SEVERITY.MEDIUM,
        'Missing Content',
        'Question lacks mechanism explanation',
        qId,
        'Add mechanism section explaining the underlying concepts'
      ));
    }

    // 9. Short mechanism (likely not teaching)
    if (question.mechanism && question.mechanism.content && question.mechanism.content.length < 50) {
      this.report.addIssue(new Issue(
        SEVERITY.LOW,
        'Shallow Mechanism',
        `Mechanism is only ${question.mechanism.content.length} characters - likely insufficient depth`,
        qId,
        'Expand mechanism to 3-5 sentences explaining WHY, functional context, clinical significance'
      ));
    }
  }

  validateScaffold(scaffold, questionId) {
    // Check answer indices
    scaffold.scaffolds.forEach((sq, idx) => {
      if (sq.answer >= sq.options.length) {
        this.report.addIssue(new Issue(
          SEVERITY.CRITICAL,
          'Scaffold Error',
          `Scaffold ${idx} has answer index ${sq.answer} exceeding options length ${sq.options.length}`,
          questionId,
          'Fix answer index in scaffold question'
        ));
      }
    });
  }
}

// Main scanner
async function scanQuestionBanks() {
  const report = new ValidationReport();
  const validator = new QualityValidator(report);

  // Scan all content directories
  const contentDirs = ['611-anatomy', '612-physiology', '510-mathematics'];

  for (const dir of contentDirs) {
    const dirPath = path.join(CONFIG.contentRoot, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`Skipping ${dir} (not found)`);
      continue;
    }

    // Find all subdirectories
    const subdirs = fs.readdirSync(dirPath).filter(item => {
      const fullPath = path.join(dirPath, item);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const subdir of subdirs) {
      const subdirPath = path.join(dirPath, subdir);
      const jsonFiles = fs.readdirSync(subdirPath).filter(f => f.endsWith('.json') && !f.includes('vocabulary'));

      for (const jsonFile of jsonFiles) {
        const filePath = path.join(subdirPath, jsonFile);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          report.stats.questionBanks++;

          if (content.questions && Array.isArray(content.questions)) {
            content.questions.forEach(q => {
              report.stats.questionsScanned++;
              validator.validateQuestion(q, content.id || 'unknown');

              // Check for scaffold file
              if (q.scaffoldFile) {
                const scaffoldPath = path.join(subdirPath, q.scaffoldFile);
                if (fs.existsSync(scaffoldPath)) {
                  try {
                    const scaffold = JSON.parse(fs.readFileSync(scaffoldPath, 'utf8'));
                    report.stats.scaffoldsScanned++;
                    validator.validateScaffold(scaffold, q.id);
                  } catch (err) {
                    report.addIssue(new Issue(
                      SEVERITY.MEDIUM,
                      'Scaffold Load Error',
                      `Failed to load scaffold file: ${err.message}`,
                      q.id,
                      'Check scaffold JSON syntax'
                    ));
                  }
                }
              }
            });
          }
        } catch (err) {
          console.error(`Error processing ${filePath}: ${err.message}`);
        }
      }
    }
  }

  return report;
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex >= 0 && args[outputIndex + 1] ?
    args[outputIndex + 1] :
    `report-${new Date().toISOString().split('T')[0]}.html`;

  console.log('Ms. Luminara Question Quality Validator');
  console.log('========================================\n');
  console.log('Scanning question banks...\n');

  const report = await scanQuestionBanks();

  console.log(`Scanned: ${report.stats.questionsScanned} questions in ${report.stats.questionBanks} banks`);
  console.log(`Issues:  CRITICAL=${report.stats.critical} HIGH=${report.stats.high} MEDIUM=${report.stats.medium} LOW=${report.stats.low}\n`);

  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  const outputPath = path.join(CONFIG.outputDir, outputFile);
  fs.writeFileSync(outputPath, report.toHTML(), 'utf8');
  console.log(`Report saved: ${outputPath}\n`);

  // Strict mode: exit with error if CRITICAL issues
  if (strict && report.stats.critical > 0) {
    console.error(`FAILED: ${report.stats.critical} CRITICAL issues detected`);
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { ValidationReport, QualityValidator, scanQuestionBanks };
