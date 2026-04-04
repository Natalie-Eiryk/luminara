/**
 * Topic Selector Module
 * @file 820.31.91-topic-selector.js
 * @version 2026-03-31
 *
 * Multi-level topic selection for Map mode (LUMI 23D integration):
 * 1. Choose a subject (10 Dewey divisions: 000-900)
 * 2. Choose a discipline or "Study All" for macro lessons
 * 3. Select specific categories for micro lessons
 *
 * Design: Library card catalog aesthetic with Dewey decimal organization
 * Integrates LUMI's 23 Domain Experts for epistemic weight visualization
 */

const TopicSelector = (function() {
  'use strict';

  // State
  let container = null;
  let registry = null;
  let currentStep = 1; // 1 = subject, 2 = discipline, 3 = categories
  let selectedSubject = null;
  let selectedDiscipline = null;
  let selectedCategories = new Set();
  let selectedRunType = 'standard';
  let onStartCallback = null;

  // Color palette - library/parchment theme
  const COLORS = {
    parchment: {
      light: '#f4e4bc',
      medium: '#e8d4a8',
      dark: '#d4c4a0',
      border: '#8b5a2b'
    },
    ink: {
      black: '#2c1810',
      brown: '#4a3728',
      red: '#8b2500',
      gold: '#c9a227'
    },
    // Dewey division colors (10 main classes)
    dewey: {
      '000': '#6b5b95',  // Computer Science - purple
      '100': '#88b04b',  // Philosophy - green
      '200': '#955251',  // Religion - burgundy
      '300': '#009b77',  // Social Sciences - teal
      '400': '#dd4124',  // Language - red-orange
      '500': '#45b8ac',  // Sciences - cyan
      '600': '#5b5ea6',  // Technology - indigo
      '700': '#e15d44',  // Arts - coral
      '800': '#9b2335',  // Literature - crimson
      '900': '#bc243c',  // History - ruby
      default: '#4a3728'
    }
  };

  /**
   * Initialize the selector
   */
  async function init() {
    container = document.getElementById('topic-selector');
    if (!container) {
      container = document.createElement('div');
      container.id = 'topic-selector';
      document.body.appendChild(container);
    }

    if (!registry) {
      try {
        const response = await fetch('./820.31-core/820.31-question-registry.json');
        registry = await response.json();
        console.log('[TopicSelector] Loaded registry');
      } catch (err) {
        console.error('[TopicSelector] Failed to load registry:', err);
      }
    }

    return TopicSelector;
  }

  /**
   * Get domain expert info by ID
   */
  function getDomainExpert(domainId) {
    if (!registry || !registry.domains23D) return null;
    return registry.domains23D.experts.find(e => e.id === domainId);
  }

  /**
   * Get categories for a subject
   */
  function getCategoriesForSubject(subjectId) {
    if (!registry) return [];
    return registry.categories.filter(c => c.subject === subjectId);
  }

  /**
   * Get categories for a discipline
   */
  function getCategoriesForDiscipline(subjectId, disciplineId) {
    if (!registry) return [];
    return registry.categories.filter(c =>
      c.subject === subjectId && c.discipline === disciplineId
    );
  }

  /**
   * Count total questions for categories
   */
  function countQuestions(categories) {
    return categories.reduce((sum, cat) => {
      return sum + cat.banks.reduce((bsum, bank) => bsum + (bank.questionCount || 0), 0);
    }, 0);
  }

  /**
   * Get Dewey color for a code
   */
  function getDeweyColor(deweyCode) {
    const division = String(deweyCode).charAt(0) + '00';
    return COLORS.dewey[division] || COLORS.dewey.default;
  }

  /**
   * Get CSS styles
   */
  function getStyles() {
    return `
      .ts-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 15, 30, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        box-sizing: border-box;
        animation: ts-fade-in 0.3s ease;
      }

      @keyframes ts-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .ts-modal {
        position: relative;
        width: 100%;
        max-width: 900px;
        max-height: 90vh;
        background: linear-gradient(135deg, ${COLORS.parchment.light} 0%, ${COLORS.parchment.medium} 50%, ${COLORS.parchment.dark} 100%);
        border: 4px solid ${COLORS.parchment.border};
        border-radius: 12px;
        padding: 0;
        box-shadow:
          0 25px 80px rgba(0,0,0,0.6),
          inset 0 0 40px rgba(139,90,43,0.15);
        overflow: hidden;
        animation: ts-unfurl 0.4s ease-out;
      }

      @keyframes ts-unfurl {
        from { transform: scale(0.9) translateY(30px); opacity: 0; }
        to { transform: scale(1) translateY(0); opacity: 1; }
      }

      /* Header Bar */
      .ts-header {
        background: linear-gradient(135deg, ${COLORS.parchment.border} 0%, #6b4423 100%);
        padding: 20px 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 3px solid #5a3a1a;
      }

      .ts-header-left {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .ts-back-btn {
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.15);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 8px;
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .ts-back-btn:hover,
      .ts-back-btn:focus {
        background: rgba(255,255,255,0.25);
        transform: scale(1.05);
        outline: none;
      }

      .ts-back-btn:focus-visible {
        outline: 3px solid white;
        outline-offset: 2px;
      }

      .ts-back-btn.hidden {
        visibility: hidden;
      }

      .ts-title {
        color: white;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 24px;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      .ts-subtitle {
        color: rgba(255,255,255,0.7);
        font-size: 13px;
        margin: 4px 0 0 0;
      }

      .ts-close-btn {
        width: 36px;
        height: 36px;
        background: rgba(255,255,255,0.1);
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 50%;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .ts-close-btn:hover,
      .ts-close-btn:focus {
        background: rgba(255,100,100,0.3);
        border-color: rgba(255,100,100,0.5);
        outline: none;
      }

      .ts-close-btn:focus-visible {
        outline: 3px solid white;
        outline-offset: 2px;
      }

      /* Content Area */
      .ts-content {
        padding: 25px 30px;
        max-height: calc(90vh - 180px);
        overflow-y: auto;
      }

      /* Run Type Selector (compact) */
      .ts-run-selector {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 25px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(139,90,43,0.3);
      }

      .ts-run-btn {
        padding: 10px 20px;
        background: ${COLORS.parchment.light};
        border: 2px solid ${COLORS.parchment.border};
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: ${COLORS.ink.brown};
      }

      .ts-run-btn:hover,
      .ts-run-btn:focus {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(139,90,43,0.2);
        outline: none;
      }

      .ts-run-btn:focus-visible {
        outline: 3px solid ${COLORS.ink.gold};
        outline-offset: 2px;
      }

      .ts-run-btn.selected {
        background: linear-gradient(135deg, ${COLORS.ink.gold} 0%, #a67c00 100%);
        border-color: #8b6914;
        color: white;
        box-shadow: 0 4px 15px rgba(201,162,39,0.4);
      }

      .ts-run-btn .run-icon { font-size: 18px; }
      .ts-run-btn .run-acts {
        font-size: 11px;
        opacity: 0.7;
        margin-left: 4px;
      }

      /* Step 1: Subject/Course Cards */
      .ts-subjects {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }

      .ts-subject-card {
        background: white;
        border: 3px solid ${COLORS.parchment.border};
        border-radius: 12px;
        padding: 0;
        cursor: pointer;
        transition: all 0.25s ease;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .ts-subject-card:hover,
      .ts-subject-card:focus {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        border-color: ${COLORS.ink.gold};
        outline: none;
      }

      .ts-subject-card:focus-visible {
        outline: 3px solid ${COLORS.ink.gold};
        outline-offset: 2px;
      }

      .ts-subject-header {
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        border-bottom: 2px solid ${COLORS.parchment.medium};
      }

      .ts-subject-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        flex-shrink: 0;
      }

      .ts-subject-card[data-subject="sciences"] .ts-subject-icon {
        background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
      }
      .ts-subject-card[data-subject="logic"] .ts-subject-icon {
        background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
      }
      .ts-subject-card[data-subject="humanities"] .ts-subject-icon {
        background: linear-gradient(135deg, #ffccbc 0%, #ffab91 100%);
      }

      .ts-subject-info {
        flex: 1;
      }

      .ts-subject-name {
        font-size: 18px;
        font-weight: 700;
        color: ${COLORS.ink.black};
        margin: 0 0 4px 0;
      }

      .ts-subject-dewey {
        font-size: 12px;
        color: ${COLORS.ink.gold};
        font-weight: 600;
        letter-spacing: 1px;
      }

      .ts-subject-body {
        padding: 15px 20px;
        background: ${COLORS.parchment.light};
      }

      .ts-subject-desc {
        font-size: 13px;
        color: ${COLORS.ink.brown};
        line-height: 1.5;
        margin: 0 0 12px 0;
      }

      .ts-subject-stats {
        display: flex;
        gap: 15px;
        font-size: 12px;
        color: ${COLORS.ink.brown};
      }

      .ts-subject-stats span {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .ts-arrow {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 24px;
        color: ${COLORS.parchment.border};
        opacity: 0;
        transition: all 0.2s;
      }

      .ts-subject-card:hover .ts-arrow {
        opacity: 1;
        right: 15px;
      }

      /* Step 2: Category Selection */
      .ts-course-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid rgba(139,90,43,0.3);
      }

      .ts-course-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        background: linear-gradient(135deg, ${COLORS.parchment.light} 0%, ${COLORS.parchment.medium} 100%);
        border: 2px solid ${COLORS.parchment.border};
      }

      .ts-course-info h3 {
        margin: 0 0 4px 0;
        font-size: 20px;
        color: ${COLORS.ink.black};
      }

      .ts-course-info p {
        margin: 0;
        font-size: 13px;
        color: ${COLORS.ink.brown};
      }

      .ts-quick-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }

      .ts-quick-btn {
        padding: 8px 16px;
        background: rgba(139,90,43,0.1);
        border: 1px solid ${COLORS.parchment.border};
        border-radius: 20px;
        cursor: pointer;
        font-size: 13px;
        color: ${COLORS.ink.brown};
        transition: all 0.2s;
      }

      .ts-quick-btn:hover {
        background: rgba(139,90,43,0.2);
      }

      /* Category Cards in Step 2 */
      .ts-categories {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 15px;
      }

      .ts-category {
        background: white;
        border: 2px solid ${COLORS.parchment.border};
        border-radius: 10px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .ts-category:hover,
      .ts-category:focus {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(139,90,43,0.2);
        border-color: ${COLORS.ink.gold};
        outline: none;
      }

      .ts-category:focus-visible {
        outline: 3px solid ${COLORS.ink.gold};
        outline-offset: 2px;
      }

      .ts-category.selected {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        border-color: #4caf50;
        box-shadow: 0 4px 12px rgba(76,175,80,0.3);
      }

      .ts-cat-checkbox {
        width: 26px;
        height: 26px;
        border: 2px solid ${COLORS.parchment.border};
        border-radius: 6px;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
        color: transparent;
        transition: all 0.2s;
      }

      .ts-category.selected .ts-cat-checkbox {
        background: #4caf50;
        border-color: #4caf50;
        color: white;
      }

      .ts-cat-content {
        flex: 1;
        min-width: 0;
      }

      .ts-cat-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .ts-cat-dewey {
        font-size: 11px;
        font-weight: 700;
        color: ${COLORS.ink.gold};
        background: rgba(201,162,39,0.15);
        padding: 2px 8px;
        border-radius: 4px;
      }

      .ts-cat-name {
        font-weight: 600;
        font-size: 14px;
        color: ${COLORS.ink.black};
      }

      .ts-cat-desc {
        font-size: 12px;
        color: ${COLORS.ink.brown};
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .ts-cat-meta {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: ${COLORS.ink.brown};
        opacity: 0.8;
      }

      /* Footer */
      .ts-footer {
        background: ${COLORS.parchment.medium};
        padding: 20px 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 3px solid ${COLORS.parchment.border};
      }

      .ts-selection-info {
        font-size: 14px;
        color: ${COLORS.ink.brown};
      }

      .ts-selection-info strong {
        color: ${COLORS.ink.gold};
        font-size: 16px;
      }

      .ts-start-btn {
        padding: 14px 35px;
        background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
        border: 3px solid #6b0000;
        border-radius: 10px;
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(196,30,58,0.4);
      }

      .ts-start-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(196,30,58,0.5);
      }

      .ts-start-btn:disabled {
        background: linear-gradient(135deg, #999 0%, #777 100%);
        border-color: #666;
        cursor: not-allowed;
        box-shadow: none;
      }

      /* Empty State */
      .ts-empty {
        text-align: center;
        padding: 40px;
        color: ${COLORS.ink.brown};
      }

      .ts-empty-icon {
        font-size: 48px;
        margin-bottom: 15px;
        opacity: 0.5;
      }

      /* Domain Expert Badges */
      .ts-domain-experts {
        display: flex;
        gap: 6px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }

      .ts-domain-badge {
        font-size: 18px;
        padding: 4px 8px;
        background: rgba(255,255,255,0.7);
        border-radius: 6px;
        cursor: help;
        transition: transform 0.2s;
      }

      .ts-domain-badge:hover {
        transform: scale(1.2);
      }

      .ts-no-experts {
        font-size: 11px;
        color: ${COLORS.ink.brown};
        opacity: 0.6;
        font-style: italic;
      }

      /* Coming Soon State */
      .ts-coming-soon {
        opacity: 0.5;
        cursor: not-allowed !important;
      }

      .ts-coming-soon:hover {
        transform: none !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
      }

      .ts-coming {
        color: ${COLORS.ink.gold};
        font-weight: 600;
      }

      /* Step 2: Discipline Cards */
      .ts-disciplines {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 15px;
      }

      .ts-discipline-card {
        background: white;
        border: 2px solid ${COLORS.parchment.border};
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
      }

      .ts-discipline-card:hover:not(.ts-coming-soon),
      .ts-discipline-card:focus:not(.ts-coming-soon) {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        border-color: var(--dewey-color, ${COLORS.ink.gold});
        outline: none;
      }

      .ts-discipline-card:focus-visible:not(.ts-coming-soon) {
        outline: 3px solid var(--dewey-color, ${COLORS.ink.gold});
        outline-offset: 2px;
      }

      .ts-disc-icon {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }

      .ts-disc-info {
        flex: 1;
      }

      .ts-disc-name {
        margin: 0 0 4px 0;
        font-size: 16px;
        font-weight: 600;
        color: ${COLORS.ink.black};
      }

      .ts-disc-dewey {
        font-size: 12px;
        font-weight: 600;
      }

      .ts-disc-expert {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 20px;
      }

      .ts-disc-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: ${COLORS.ink.brown};
      }

      .ts-disc-arrow {
        position: absolute;
        bottom: 12px;
        right: 12px;
        font-size: 18px;
        color: ${COLORS.parchment.border};
        opacity: 0;
        transition: opacity 0.2s;
      }

      .ts-discipline-card:hover:not(.ts-coming-soon) .ts-disc-arrow {
        opacity: 1;
      }

      /* Macro Option (Study All) */
      .ts-macro-option {
        background: linear-gradient(135deg, ${COLORS.ink.gold}20 0%, ${COLORS.ink.gold}10 100%);
        border: 3px solid ${COLORS.ink.gold};
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
      }

      .ts-macro-option:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(201,162,39,0.3);
      }

      .ts-macro-icon {
        width: 60px;
        height: 60px;
        background: ${COLORS.ink.gold};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        flex-shrink: 0;
      }

      .ts-macro-info {
        flex: 1;
      }

      .ts-macro-info h3 {
        margin: 0 0 6px 0;
        font-size: 18px;
        color: ${COLORS.ink.black};
      }

      .ts-macro-info p {
        margin: 0;
        font-size: 13px;
        color: ${COLORS.ink.brown};
      }

      .ts-macro-stats {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: ${COLORS.ink.brown};
        text-align: right;
      }

      .ts-macro-arrow {
        font-size: 24px;
        color: ${COLORS.ink.gold};
      }

      /* Divider */
      .ts-divider {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 25px 0;
        color: ${COLORS.ink.brown};
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .ts-divider::before,
      .ts-divider::after {
        content: '';
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${COLORS.parchment.border}, transparent);
      }

      /* Mobile */
      @media (max-width: 600px) {
        .ts-modal { border-radius: 0; max-height: 100vh; }
        .ts-header { padding: 15px 20px; }
        .ts-title { font-size: 18px; }
        .ts-content { padding: 15px 20px; }
        .ts-subjects { grid-template-columns: 1fr; }
        .ts-disciplines { grid-template-columns: 1fr; }
        .ts-categories { grid-template-columns: 1fr; }
        .ts-footer { flex-direction: column; gap: 15px; padding: 15px 20px; }
        .ts-start-btn { width: 100%; }
        .ts-run-selector { flex-wrap: wrap; }
        .ts-macro-option { flex-direction: column; text-align: center; }
        .ts-macro-stats { text-align: center; flex-direction: row; justify-content: center; gap: 15px; }
      }
    `;
  }

  /**
   * Handle browser back button (popstate)
   */
  function handlePopState(e) {
    if (!e.state || !e.state.topicSelector) {
      // User went back past the modal - show confirmation
      showExitConfirmation();
      return;
    }

    const step = e.state.step || 1;

    if (step < currentStep) {
      // Going back
      if (currentStep === 3) {
        selectedDiscipline = null;
        selectedCategories.clear();
        currentStep = 2;
      } else if (currentStep === 2) {
        selectedSubject = null;
        selectedDiscipline = null;
        selectedCategories.clear();
        currentStep = 1;
      }
      render();
    }
  }

  /**
   * Show exit confirmation dialog
   */
  function showExitConfirmation() {
    // Push state back so we stay on the page
    pushHistoryState();

    // Create confirmation overlay
    const confirmOverlay = document.createElement('div');
    confirmOverlay.id = 'ts-exit-confirm';
    confirmOverlay.innerHTML = `
      <div class="ts-confirm-backdrop">
        <div class="ts-confirm-dialog">
          <div class="ts-confirm-icon">🚪</div>
          <h3>Leave Topic Selection?</h3>
          <p>Are you sure you want to go back? Your selections will be lost.</p>
          <div class="ts-confirm-buttons">
            <button class="ts-confirm-stay">Stay Here</button>
            <button class="ts-confirm-leave">Leave</button>
          </div>
        </div>
      </div>
    `;

    // Attach event listeners for confirmation buttons (CSP-compliant)
    setTimeout(() => {
      const stayBtn = confirmOverlay.querySelector('.ts-confirm-stay');
      const leaveBtn = confirmOverlay.querySelector('.ts-confirm-leave');
      if (stayBtn) stayBtn.addEventListener('click', cancelExit);
      if (leaveBtn) leaveBtn.addEventListener('click', confirmExit);
    }, 0);

    // Add styles if not present
    if (!document.getElementById('ts-confirm-styles')) {
      const style = document.createElement('style');
      style.id = 'ts-confirm-styles';
      style.textContent = `
        .ts-confirm-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          animation: ts-fade-in 0.2s ease;
        }
        .ts-confirm-dialog {
          background: linear-gradient(135deg, #f4e4bc 0%, #e8d4a8 100%);
          border: 4px solid #8b5a2b;
          border-radius: 16px;
          padding: 30px 40px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: ts-unfurl 0.3s ease-out;
        }
        .ts-confirm-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .ts-confirm-dialog h3 {
          margin: 0 0 10px 0;
          color: #2c1810;
          font-family: Georgia, serif;
          font-size: 22px;
        }
        .ts-confirm-dialog p {
          margin: 0 0 25px 0;
          color: #4a3728;
          font-size: 14px;
          line-height: 1.5;
        }
        .ts-confirm-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .ts-confirm-stay {
          padding: 12px 28px;
          background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
          border: 2px solid #2e7d32;
          border-radius: 8px;
          color: white;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ts-confirm-stay:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(76,175,80,0.4);
        }
        .ts-confirm-leave {
          padding: 12px 28px;
          background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
          border: 2px solid #616161;
          border-radius: 8px;
          color: white;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ts-confirm-leave:hover {
          background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%);
          border-color: #6b0000;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(confirmOverlay);
  }

  /**
   * Cancel exit - stay in topic selector
   */
  function cancelExit() {
    const confirm = document.getElementById('ts-exit-confirm');
    if (confirm) confirm.remove();
  }

  /**
   * Confirm exit - close topic selector and navigate away
   */
  function confirmExit() {
    const confirm = document.getElementById('ts-exit-confirm');
    if (confirm) confirm.remove();
    hideWithoutHistoryPop();
    // Go back to actually leave the page
    history.back();
  }

  /**
   * Push history state for current step
   */
  function pushHistoryState() {
    const state = {
      topicSelector: true,
      step: currentStep,
      subject: selectedSubject,
      discipline: selectedDiscipline
    };
    history.pushState(state, '', window.location.href);
  }

  /**
   * Show the topic selector
   */
  async function show(runType = 'standard', onStart) {
    if (!registry) await init();

    selectedRunType = runType;
    selectedCategories.clear();
    selectedSubject = null;
    selectedDiscipline = null;
    currentStep = 1;
    onStartCallback = onStart;

    // Inject styles
    let styleEl = document.getElementById('ts-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'ts-styles';
      styleEl.textContent = getStyles();
      document.head.appendChild(styleEl);
    }

    // Push initial history state for the modal
    pushHistoryState();

    // Listen for browser back button
    window.addEventListener('popstate', handlePopState);

    render();
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Render the current step
   */
  function render() {
    if (currentStep === 1) {
      renderSubjectSelection();
    } else if (currentStep === 2) {
      renderDisciplineSelection();
    } else {
      renderCategorySelection();
    }

    // Attach event listeners after rendering (CSP-compliant)
    attachEventListeners();
  }

  /**
   * Attach event listeners to dynamically created elements (CSP-compliant)
   */
  function attachEventListeners() {
    // Close and back buttons
    const closeBtn = container.querySelector('.ts-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', hide);

    const backBtn = container.querySelector('.ts-back-btn:not(.hidden)');
    if (backBtn) backBtn.addEventListener('click', goBack);

    // Overlay click
    const overlay = container.querySelector('.ts-overlay');
    if (overlay) overlay.addEventListener('click', handleOverlayClick);

    // Modal click to stop propagation
    const modal = container.querySelector('.ts-modal');
    if (modal) modal.addEventListener('click', (e) => e.stopPropagation());

    // Run type buttons
    container.querySelectorAll('.ts-run-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const type = this.textContent.toLowerCase().includes('quick') ? 'quick' :
                     this.textContent.toLowerCase().includes('epic') ? 'epic' : 'standard';
        selectRunType(type);
      });
    });

    // Subject cards
    container.querySelectorAll('.ts-subject-card').forEach(card => {
      const subjectId = card.dataset.subject;
      card.addEventListener('click', () => selectSubject(subjectId));
    });

    // Discipline cards
    container.querySelectorAll('.ts-discipline-card').forEach(card => {
      const disciplineId = card.dataset.discipline;
      card.addEventListener('click', () => selectDiscipline(disciplineId));
    });

    // Macro option (Study All)
    const macroOption = container.querySelector('.ts-macro-option');
    if (macroOption) macroOption.addEventListener('click', studyAllInSubject);

    // Category cards
    container.querySelectorAll('.ts-category').forEach(card => {
      const categoryId = card.dataset.category;
      card.addEventListener('click', () => toggleCategory(categoryId));
    });

    // Quick action buttons
    const selectAllBtn = container.querySelector('.ts-quick-btn:first-child');
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAll);

    const selectNoneBtn = container.querySelector('.ts-quick-btn:last-child');
    if (selectNoneBtn) selectNoneBtn.addEventListener('click', selectNone);

    // Start button
    const startBtn = container.querySelector('.ts-start-btn');
    if (startBtn) startBtn.addEventListener('click', startRun);
  }

  /**
   * Render Step 1: Subject Selection (only subjects with content)
   */
  function renderSubjectSelection() {
    // Build subject cards from registry - only show subjects with questions
    const subjectCards = registry.subjects
      .filter(subject => {
        const subjectCategories = getCategoriesForSubject(subject.id);
        return subjectCategories.length > 0;
      })
      .map(subject => {
        // Count categories and questions for this subject
        const subjectCategories = getCategoriesForSubject(subject.id);
        const totalQuestions = countQuestions(subjectCategories);

        // Get domain expert badges
        const domainBadges = (subject.domains || []).map(domainId => {
          const expert = getDomainExpert(domainId);
          if (!expert) return '';
          return `<span class="ts-domain-badge" title="${expert.name}">${expert.icon}</span>`;
        }).join('');

        // Get color for this Dewey division
        const deweyColor = getDeweyColor(subject.dewey);

        return `
          <div class="ts-subject-card"
               data-subject="${subject.id}"
               style="--dewey-color: ${deweyColor}"
               role="button"
               tabindex="0"
               aria-label="${subject.name} - ${totalQuestions} questions available">
            <div class="ts-subject-header">
              <div class="ts-subject-icon" style="background: linear-gradient(135deg, ${deweyColor}40 0%, ${deweyColor}20 100%); border: 2px solid ${deweyColor}60;">${subject.icon}</div>
              <div class="ts-subject-info">
                <h3 class="ts-subject-name">${subject.name}</h3>
                <div class="ts-subject-dewey" style="color: ${deweyColor};">Dewey ${subject.dewey}</div>
              </div>
            </div>
            <div class="ts-subject-body">
              <p class="ts-subject-desc">${subject.description}</p>
              <div class="ts-domain-experts">
                ${domainBadges || '<span class="ts-no-experts">No experts assigned</span>'}
              </div>
              <div class="ts-subject-stats">
                <span>📚 ${subjectCategories.length} topics</span><span>❓ ${totalQuestions} questions</span>
              </div>
            </div>
            <div class="ts-arrow">→</div>
          </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="ts-overlay">
        <div class="ts-modal">
          <div class="ts-header">
            <div class="ts-header-left">
              <button class="ts-back-btn hidden">←</button>
              <div>
                <h2 class="ts-title">📚 Choose Your Subject</h2>
                <p class="ts-subtitle">Select a field of study to explore</p>
              </div>
            </div>
            <button class="ts-close-btn">×</button>
          </div>

          <div class="ts-content">
            <div class="ts-run-selector">
              <button class="ts-run-btn ${selectedRunType === 'quick' ? 'selected' : ''}">
                <span class="run-icon">🏃</span> Quick <span class="run-acts">(3 Acts)</span>
              </button>
              <button class="ts-run-btn ${selectedRunType === 'standard' ? 'selected' : ''}">
                <span class="run-icon">🗡️</span> Standard <span class="run-acts">(5 Acts)</span>
              </button>
              <button class="ts-run-btn ${selectedRunType === 'epic' ? 'selected' : ''}">
                <span class="run-icon">👑</span> Epic <span class="run-acts">(7 Acts)</span>
              </button>
            </div>

            <div class="ts-subjects">
              ${subjectCards || '<div class="ts-empty"><div class="ts-empty-icon">📭</div><p>No subjects available</p></div>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 2: Discipline Selection (only disciplines with content)
   */
  function renderDisciplineSelection() {
    const subject = registry.subjects.find(s => s.id === selectedSubject);
    const disciplines = subject.disciplines || [];
    const subjectCategories = getCategoriesForSubject(subject.id);
    const totalQuestions = countQuestions(subjectCategories);
    const deweyColor = getDeweyColor(subject.dewey);

    // Build discipline cards - only show disciplines with content
    const disciplineCards = disciplines
      .filter(disc => {
        const discCategories = getCategoriesForDiscipline(subject.id, disc.id);
        return discCategories.length > 0;
      })
      .map(disc => {
        const discCategories = getCategoriesForDiscipline(subject.id, disc.id);
        const discQuestions = countQuestions(discCategories);
        const expert = getDomainExpert(disc.domain);

        return `
          <div class="ts-discipline-card"
               data-discipline="${disc.id}"
               role="button"
               tabindex="0"
               aria-label="${disc.name} - ${discQuestions} questions available">
            <div class="ts-disc-icon" style="background: linear-gradient(135deg, ${deweyColor}30 0%, ${deweyColor}15 100%);">
              ${disc.icon}
            </div>
            <div class="ts-disc-info">
              <h4 class="ts-disc-name">${disc.name}</h4>
              <span class="ts-disc-dewey" style="color: ${deweyColor};">${disc.dewey}</span>
            </div>
            ${expert ? `<span class="ts-disc-expert" title="${expert.name}">${expert.icon}</span>` : ''}
            <div class="ts-disc-stats">
              <span>📚 ${discCategories.length}</span><span>❓ ${discQuestions}</span>
            </div>
            <span class="ts-disc-arrow">→</span>
          </div>
        `;
      }).join('');

    container.innerHTML = `
      <div class="ts-overlay">
        <div class="ts-modal">
          <div class="ts-header" style="background: linear-gradient(135deg, ${deweyColor} 0%, ${deweyColor}cc 100%);">
            <div class="ts-header-left">
              <button class="ts-back-btn">←</button>
              <div>
                <h2 class="ts-title">${subject.icon} ${subject.name}</h2>
                <p class="ts-subtitle">Choose a discipline or study everything</p>
              </div>
            </div>
            <button class="ts-close-btn">×</button>
          </div>

          <div class="ts-content">
            <!-- Macro option: Study All -->
            <div class="ts-macro-option">
              <div class="ts-macro-icon">🎯</div>
              <div class="ts-macro-info">
                <h3>Study All ${subject.name}</h3>
                <p>Comprehensive review across all disciplines</p>
              </div>
              <div class="ts-macro-stats">
                <span>📚 ${subjectCategories.length} topics</span>
                <span>❓ ${totalQuestions} questions</span>
              </div>
              <span class="ts-macro-arrow">→</span>
            </div>

            <div class="ts-divider">
              <span>or choose a discipline</span>
            </div>

            <!-- Discipline cards -->
            <div class="ts-disciplines">
              ${disciplineCards || '<div class="ts-empty"><div class="ts-empty-icon">📭</div><p>No disciplines defined</p></div>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Step 3: Category Selection within chosen discipline
   */
  function renderCategorySelection() {
    const subject = registry.subjects.find(s => s.id === selectedSubject);
    const discipline = selectedDiscipline
      ? subject.disciplines.find(d => d.id === selectedDiscipline)
      : null;

    // Get categories - either for discipline or whole subject
    const categories = selectedDiscipline
      ? getCategoriesForDiscipline(subject.id, selectedDiscipline)
      : getCategoriesForSubject(subject.id);

    const deweyColor = getDeweyColor(subject.dewey);

    // Build category cards
    const categoryCards = categories.map(cat => {
      const totalQuestions = cat.banks.reduce((sum, bank) => sum + (bank.questionCount || 0), 0);
      const bankCount = cat.banks.length;
      const isSelected = selectedCategories.has(cat.id);

      return `
        <div class="ts-category ${isSelected ? 'selected' : ''}"
             role="checkbox"
             tabindex="0"
             aria-checked="${isSelected}"
             aria-label="${cat.name} - ${totalQuestions} questions"
             data-category="${cat.id}">
          <div class="ts-cat-checkbox">✓</div>
          <div class="ts-cat-content">
            <div class="ts-cat-header">
              <span class="ts-cat-dewey" style="background: ${deweyColor}20; color: ${deweyColor};">${cat.dewey}</span>
              <span class="ts-cat-name">${cat.name}</span>
            </div>
            <div class="ts-cat-desc">${cat.description}</div>
            <div class="ts-cat-meta">
              <span>📖 ${bankCount} banks</span>
              <span>❓ ${totalQuestions} questions</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Calculate totals
    let totalSelected = selectedCategories.size;
    let totalSelectedQuestions = 0;
    categories.forEach(cat => {
      if (selectedCategories.has(cat.id)) {
        totalSelectedQuestions += cat.banks.reduce((sum, bank) => sum + (bank.questionCount || 0), 0);
      }
    });

    const headerTitle = discipline
      ? `${discipline.icon} ${discipline.name}`
      : `${subject.icon} All ${subject.name}`;
    const headerSubtitle = discipline
      ? `Select topics within ${discipline.name}`
      : `Select topics from any discipline`;

    container.innerHTML = `
      <div class="ts-overlay">
        <div class="ts-modal">
          <div class="ts-header" style="background: linear-gradient(135deg, ${deweyColor} 0%, ${deweyColor}cc 100%);">
            <div class="ts-header-left">
              <button class="ts-back-btn">←</button>
              <div>
                <h2 class="ts-title">${headerTitle}</h2>
                <p class="ts-subtitle">${headerSubtitle}</p>
              </div>
            </div>
            <button class="ts-close-btn">×</button>
          </div>

          <div class="ts-content">
            <div class="ts-quick-actions">
              <button class="ts-quick-btn">✓ Select All</button>
              <button class="ts-quick-btn">✗ Clear All</button>
            </div>

            <div class="ts-categories">
              ${categoryCards || '<div class="ts-empty"><div class="ts-empty-icon">📭</div><p>No categories available</p></div>'}
            </div>
          </div>

          <div class="ts-footer">
            <div class="ts-selection-info">
              <strong>${totalSelected}</strong> topics selected · <strong>${totalSelectedQuestions}</strong> questions
            </div>
            <button class="ts-start-btn" ${totalSelected === 0 ? 'disabled' : ''}>
              ⚔️ Begin Adventure!
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle keydown (Fix #7: Enhanced keyboard navigation)
   */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (currentStep > 1) {
        goBack();
      } else {
        hide();
      }
      return;
    }

    // Arrow key navigation for focusable items
    const focusableSelector = '.ts-subject-card, .ts-discipline-card, .ts-category, .ts-run-btn, .ts-close-btn, .ts-back-btn, button';
    const focusableItems = Array.from(container.querySelectorAll(focusableSelector)).filter(el => !el.classList.contains('hidden'));

    if (focusableItems.length === 0) return;

    const currentIndex = focusableItems.indexOf(document.activeElement);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
      focusableItems[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
      focusableItems[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Activate focused card if it's a selectable item
      const focused = document.activeElement;
      if (focused && (focused.classList.contains('ts-subject-card') ||
                      focused.classList.contains('ts-discipline-card') ||
                      focused.classList.contains('ts-category'))) {
        e.preventDefault();
        focused.click();
      }
    }
  }

  /**
   * Handle overlay click
   */
  function handleOverlayClick(e) {
    if (e.target.classList.contains('ts-overlay')) {
      hide();
    }
  }

  /**
   * Hide selector (with history cleanup)
   */
  function hide() {
    // Go back in history to before the modal was opened
    if (history.state && history.state.topicSelector) {
      history.back();
    }
    hideWithoutHistoryPop();
  }

  /**
   * Hide selector without manipulating history (called from popstate)
   */
  function hideWithoutHistoryPop() {
    if (container) container.innerHTML = '';
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('popstate', handlePopState);
  }

  /**
   * Select run type
   */
  function selectRunType(type) {
    selectedRunType = type;
    render();
  }

  /**
   * Select a subject (Step 1 -> Step 2)
   */
  function selectSubject(subjectId) {
    selectedSubject = subjectId;
    selectedDiscipline = null;
    selectedCategories.clear();
    currentStep = 2;
    pushHistoryState(); // Add to browser history
    render();
  }

  /**
   * Select a discipline (Step 2 -> Step 3)
   */
  function selectDiscipline(disciplineId) {
    selectedDiscipline = disciplineId;
    selectedCategories.clear();
    currentStep = 3;
    pushHistoryState(); // Add to browser history
    render();
  }

  /**
   * Study all categories in current subject (macro mode)
   */
  function studyAllInSubject() {
    selectedDiscipline = null; // null = all disciplines
    selectedCategories.clear();
    currentStep = 3;
    pushHistoryState(); // Add to browser history
    render();
  }

  /**
   * Go back one step (uses browser history)
   */
  function goBack() {
    // Use history.back() - the popstate handler will update state
    history.back();
  }

  /**
   * Toggle category selection
   */
  function toggleCategory(categoryId) {
    if (selectedCategories.has(categoryId)) {
      selectedCategories.delete(categoryId);
    } else {
      selectedCategories.add(categoryId);
    }
    render();
  }

  /**
   * Select all categories in current view
   */
  function selectAll() {
    const categories = selectedDiscipline
      ? getCategoriesForDiscipline(selectedSubject, selectedDiscipline)
      : getCategoriesForSubject(selectedSubject);
    categories.forEach(cat => selectedCategories.add(cat.id));
    render();
  }

  /**
   * Clear all selections
   */
  function selectNone() {
    selectedCategories.clear();
    render();
  }

  /**
   * Start the run
   */
  function startRun() {
    if (selectedCategories.size === 0) return;

    const selection = {
      runType: selectedRunType,
      categoryIds: Array.from(selectedCategories),
      subject: selectedSubject
    };

    console.log('[TopicSelector] Starting run:', selection);
    hide();

    if (onStartCallback) {
      onStartCallback(selection);
    }
  }

  // Public API
  return {
    init,
    show,
    hide,
    selectRunType,
    selectSubject,
    selectDiscipline,
    studyAllInSubject,
    goBack,
    toggleCategory,
    selectAll,
    selectNone,
    startRun,
    handleOverlayClick,
    cancelExit,
    confirmExit
  };
})();

window.TopicSelector = TopicSelector;
