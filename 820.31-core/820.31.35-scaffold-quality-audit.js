/**
 * Ms. Luminara Quiz - Scaffold Quality Audit Tool
 *
 * Opportunity 5: Analyze vocabulary banks to ensure every common confusion
 * has a clarifying question.
 *
 * This tool:
 * 1. Analyzes confusion matrix from QuestionStatisticsEngine
 * 2. For each high-confusion distractor, checks if there's a question
 *    where that concept IS the correct answer
 * 3. Generates gap report for content creation priorities
 *
 * Research Basis (McDermott P4):
 * "Certain common difficulties must be explicitly addressed"
 *
 * Usage:
 *   const audit = new ScaffoldQualityAudit(questionStatistics);
 *   const report = await audit.runAudit(vocabBank);
 *   console.log(audit.formatReport(report));
 */

class ScaffoldQualityAudit {
  constructor(questionStatistics, learningAnalytics = null) {
    this.questionStatistics = questionStatistics;
    this.learningAnalytics = learningAnalytics;

    // Threshold for "high confusion" - if wrong option selected > X% of time
    this.HIGH_CONFUSION_THRESHOLD = 0.25; // 25%

    // Minimum attempts before considering confusion data reliable
    this.MIN_ATTEMPTS_FOR_RELIABILITY = 5;
  }

  // ═══════════════════════════════════════════════════════════════
  // MAIN AUDIT FUNCTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run a complete scaffold quality audit on a vocabulary bank
   *
   * @param {object} vocabBank - Vocabulary bank with questions array
   * @param {string} categoryName - Human-readable category name for report
   * @returns {object} Audit report with gaps and recommendations
   */
  async runAudit(vocabBank, categoryName = 'Unknown') {
    if (!vocabBank || !vocabBank.questions) {
      return { error: 'Invalid vocabulary bank' };
    }

    const questions = vocabBank.questions;
    const report = {
      categoryName,
      timestamp: new Date().toISOString(),
      summary: {
        totalQuestions: questions.length,
        questionsWithStats: 0,
        highConfusionDistractors: 0,
        gapsFound: 0,
        coverageScore: 0
      },
      confusionAnalysis: [],
      gaps: [],
      recommendations: []
    };

    // Build index of correct answers in this bank
    const correctAnswerIndex = this.buildCorrectAnswerIndex(questions);

    // Analyze each question's confusion patterns
    for (const question of questions) {
      const analysis = this.analyzeQuestionConfusion(question, correctAnswerIndex, questions);

      if (analysis.hasStats) {
        report.summary.questionsWithStats++;
      }

      if (analysis.highConfusionDistractors.length > 0) {
        report.confusionAnalysis.push(analysis);
        report.summary.highConfusionDistractors += analysis.highConfusionDistractors.length;

        // Check for gaps (distractors without clarifying questions)
        for (const distractor of analysis.highConfusionDistractors) {
          if (!distractor.hasClarifyingQuestion) {
            report.gaps.push({
              questionId: question.id,
              questionText: question.q,
              distractorIndex: distractor.optionIndex,
              distractorText: distractor.optionText,
              confusionRate: distractor.selectionRate,
              suggestedAction: this.generateSuggestedAction(distractor)
            });
            report.summary.gapsFound++;
          }
        }
      }
    }

    // Calculate coverage score
    const totalHighConfusion = report.summary.highConfusionDistractors;
    const coveredConfusion = totalHighConfusion - report.summary.gapsFound;
    report.summary.coverageScore = totalHighConfusion > 0
      ? Math.round((coveredConfusion / totalHighConfusion) * 100)
      : 100;

    // Generate recommendations
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  // ═══════════════════════════════════════════════════════════════
  // ANALYSIS HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Build index mapping option text -> questions where it's the correct answer
   */
  buildCorrectAnswerIndex(questions) {
    const index = {};

    for (const q of questions) {
      if (!q.options || q.answer === undefined) continue;

      const correctText = q.options[q.answer];
      if (!correctText) continue;

      const normalizedText = this.normalizeText(correctText);

      if (!index[normalizedText]) {
        index[normalizedText] = [];
      }
      index[normalizedText].push({
        questionId: q.id,
        questionText: q.q,
        fullCorrectText: correctText
      });
    }

    return index;
  }

  /**
   * Analyze confusion patterns for a single question
   */
  analyzeQuestionConfusion(question, correctAnswerIndex, allQuestions) {
    const questionId = question.id;
    const stats = this.questionStatistics?.data?.questions?.[questionId];

    const analysis = {
      questionId,
      questionText: question.q,
      hasStats: false,
      totalAttempts: 0,
      highConfusionDistractors: []
    };

    if (!stats || stats.attempts < this.MIN_ATTEMPTS_FOR_RELIABILITY) {
      return analysis;
    }

    analysis.hasStats = true;
    analysis.totalAttempts = stats.attempts;

    const totalSelections = stats.optionSelections.reduce((a, b) => a + b, 0);
    if (totalSelections === 0) return analysis;

    // Check each wrong option
    for (let i = 0; i < stats.optionSelections.length; i++) {
      if (i === question.answer) continue; // Skip correct answer

      const selectionCount = stats.optionSelections[i];
      const selectionRate = selectionCount / totalSelections;

      if (selectionRate >= this.HIGH_CONFUSION_THRESHOLD) {
        const optionText = question.options?.[i] || `Option ${i + 1}`;
        const normalizedText = this.normalizeText(optionText);

        // Check if there's a clarifying question
        const clarifyingQuestions = correctAnswerIndex[normalizedText] || [];
        const hasClarifying = clarifyingQuestions.length > 0;

        // Also do fuzzy search for related questions
        const relatedQuestions = this.findRelatedQuestions(optionText, allQuestions, questionId);

        analysis.highConfusionDistractors.push({
          optionIndex: i,
          optionText,
          selectionCount,
          selectionRate: Math.round(selectionRate * 100),
          hasClarifyingQuestion: hasClarifying || relatedQuestions.length > 0,
          clarifyingQuestions: clarifyingQuestions.slice(0, 3),
          relatedQuestions: relatedQuestions.slice(0, 3)
        });
      }
    }

    return analysis;
  }

  /**
   * Find questions related to a distractor concept (fuzzy search)
   */
  findRelatedQuestions(optionText, allQuestions, excludeId) {
    const words = this.extractKeywords(optionText);
    if (words.length === 0) return [];

    const matches = [];

    for (const q of allQuestions) {
      if (q.id === excludeId) continue;

      // Check if question text or correct answer contains keywords
      const correctText = q.options?.[q.answer] || '';
      const combinedText = `${q.q} ${correctText}`.toLowerCase();

      const matchCount = words.filter(word => combinedText.includes(word)).length;
      const matchRatio = matchCount / words.length;

      if (matchRatio >= 0.5) { // At least half the keywords match
        matches.push({
          questionId: q.id,
          questionText: q.q,
          matchRatio
        });
      }
    }

    return matches.sort((a, b) => b.matchRatio - a.matchRatio);
  }

  /**
   * Extract meaningful keywords from text
   */
  extractKeywords(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
      'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'again', 'further', 'then', 'once',
      'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
      'not', 'only', 'same', 'than', 'too', 'very', 'just', 'also'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
  }

  /**
   * Normalize text for comparison
   */
  normalizeText(text) {
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ═══════════════════════════════════════════════════════════════
  // RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate suggested action for a gap
   */
  generateSuggestedAction(distractor) {
    return {
      priority: distractor.selectionRate > 40 ? 'HIGH' : distractor.selectionRate > 30 ? 'MEDIUM' : 'LOW',
      action: `Create question where "${distractor.optionText}" is the CORRECT answer`,
      rationale: `This distractor is selected ${distractor.selectionRate}% of the time, indicating students confuse it with the correct concept. A clarifying question would help them understand the distinction.`
    };
  }

  /**
   * Generate overall recommendations based on audit results
   */
  generateRecommendations(report) {
    const recommendations = [];

    // Coverage recommendation
    if (report.summary.coverageScore < 70) {
      recommendations.push({
        type: 'CRITICAL',
        title: 'Low Scaffold Coverage',
        description: `Only ${report.summary.coverageScore}% of high-confusion distractors have clarifying questions. Create questions for the ${report.summary.gapsFound} gaps identified.`
      });
    } else if (report.summary.coverageScore < 90) {
      recommendations.push({
        type: 'IMPROVEMENT',
        title: 'Scaffold Coverage Could Be Better',
        description: `${report.summary.coverageScore}% coverage. Consider adding questions for the remaining ${report.summary.gapsFound} gaps.`
      });
    }

    // Prioritize by confusion rate
    const highPriorityGaps = report.gaps.filter(g => g.confusionRate > 40);
    if (highPriorityGaps.length > 0) {
      recommendations.push({
        type: 'HIGH_PRIORITY',
        title: `${highPriorityGaps.length} Critical Confusion Points`,
        description: `These distractors are selected >40% of the time. Address these first.`,
        items: highPriorityGaps.slice(0, 5).map(g =>
          `"${g.distractorText}" in Q${g.questionId} (${g.confusionRate}%)`
        )
      });
    }

    // Check for questions without statistics
    const unstudiedQuestions = report.summary.totalQuestions - report.summary.questionsWithStats;
    if (unstudiedQuestions > 0) {
      recommendations.push({
        type: 'DATA_NEEDED',
        title: 'Insufficient Statistics Data',
        description: `${unstudiedQuestions} questions don't have enough attempts for reliable confusion analysis. Encourage more study sessions.`
      });
    }

    return recommendations;
  }

  // ═══════════════════════════════════════════════════════════════
  // REPORT FORMATTING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Format audit report as readable text
   */
  formatReport(report) {
    if (report.error) {
      return `Audit Error: ${report.error}`;
    }

    let output = [];

    output.push('═══════════════════════════════════════════════════════════════');
    output.push(`SCAFFOLD QUALITY AUDIT: ${report.categoryName}`);
    output.push(`Generated: ${report.timestamp}`);
    output.push('═══════════════════════════════════════════════════════════════');
    output.push('');

    // Summary
    output.push('SUMMARY');
    output.push('───────');
    output.push(`Total Questions: ${report.summary.totalQuestions}`);
    output.push(`Questions with Stats: ${report.summary.questionsWithStats}`);
    output.push(`High-Confusion Distractors: ${report.summary.highConfusionDistractors}`);
    output.push(`Gaps Found: ${report.summary.gapsFound}`);
    output.push(`Coverage Score: ${report.summary.coverageScore}%`);
    output.push('');

    // Recommendations
    if (report.recommendations.length > 0) {
      output.push('RECOMMENDATIONS');
      output.push('───────────────');
      for (const rec of report.recommendations) {
        output.push(`[${rec.type}] ${rec.title}`);
        output.push(`  ${rec.description}`);
        if (rec.items) {
          for (const item of rec.items) {
            output.push(`    - ${item}`);
          }
        }
        output.push('');
      }
    }

    // Gaps
    if (report.gaps.length > 0) {
      output.push('GAPS REQUIRING CONTENT CREATION');
      output.push('───────────────────────────────');
      for (const gap of report.gaps.slice(0, 20)) { // Limit to 20
        output.push(`[${gap.suggestedAction.priority}] Q${gap.questionId}`);
        output.push(`  Distractor: "${gap.distractorText}"`);
        output.push(`  Confusion Rate: ${gap.confusionRate}%`);
        output.push(`  Action: ${gap.suggestedAction.action}`);
        output.push('');
      }

      if (report.gaps.length > 20) {
        output.push(`... and ${report.gaps.length - 20} more gaps`);
      }
    }

    return output.join('\n');
  }

  /**
   * Export audit report as JSON
   */
  exportReportJSON(report) {
    return JSON.stringify(report, null, 2);
  }

  // ═══════════════════════════════════════════════════════════════
  // BATCH AUDIT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run audit on all vocabulary banks
   */
  async runFullAudit(vocabBankMap) {
    const results = {
      timestamp: new Date().toISOString(),
      categories: [],
      overallSummary: {
        totalCategories: 0,
        totalQuestions: 0,
        totalGaps: 0,
        avgCoverage: 0
      }
    };

    for (const [categoryId, bankInfo] of Object.entries(vocabBankMap)) {
      try {
        const response = await fetch(`${bankInfo.folder}/${bankInfo.file}`);
        if (!response.ok) continue;

        const bank = await response.json();
        const report = await this.runAudit(bank, `Category ${categoryId}`);

        results.categories.push({
          categoryId,
          ...report.summary,
          gaps: report.gaps,
          recommendations: report.recommendations
        });

        results.overallSummary.totalCategories++;
        results.overallSummary.totalQuestions += report.summary.totalQuestions;
        results.overallSummary.totalGaps += report.summary.gapsFound;
      } catch (e) {
        console.warn(`Failed to audit category ${categoryId}:`, e);
      }
    }

    // Calculate average coverage
    if (results.categories.length > 0) {
      const totalCoverage = results.categories.reduce((sum, c) => sum + c.coverageScore, 0);
      results.overallSummary.avgCoverage = Math.round(totalCoverage / results.categories.length);
    }

    return results;
  }
}

// Export singleton
let scaffoldQualityAudit = null;

// Factory function
function initScaffoldQualityAudit(questionStatistics, learningAnalytics) {
  if (!scaffoldQualityAudit) {
    scaffoldQualityAudit = new ScaffoldQualityAudit(questionStatistics, learningAnalytics);
    console.log('[ScaffoldQualityAudit] Audit tool initialized');
  }
  return scaffoldQualityAudit;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScaffoldQualityAudit, initScaffoldQualityAudit };
}
