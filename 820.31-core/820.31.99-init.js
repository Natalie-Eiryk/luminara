/**
 * 820.31.99-init.js - Application Initialization
 * @codon 820.31.99
 * @version 2026-04-02
 * @description Initializes QuizModes and LUMI-OS integration modules
 *              Extracted from inline script for CSP compliance (no 'unsafe-inline' needed)
 */

(function() {
  'use strict';

  /**
   * Initialize QuizModes after main quiz loads
   * Uses 'load' event to ensure all deferred scripts have executed
   */
  function initQuizModes() {
    if (typeof quiz !== 'undefined' && quiz) {
      if (typeof QuizModes !== 'undefined') {
        QuizModes.init();
      }
    } else {
      // Retry after short delay if quiz not ready
      setTimeout(initQuizModes, 100);
    }
  }

  /**
   * Initialize LUMI-OS integration modules after quiz is ready
   */
  function initLumiModules() {
    if (typeof quiz === 'undefined' || !quiz) {
      setTimeout(initLumiModules, 100);
      return;
    }

    // Gather all questions from loaded banks
    const allQuestions = [];
    if (window.quiz?.questionBanks) {
      for (const bank of Object.values(window.quiz.questionBanks)) {
        if (Array.isArray(bank)) allQuestions.push(...bank);
      }
    }

    // Initialize Isotope Engine
    if (window.IsotopeEngine && allQuestions.length > 0) {
      IsotopeEngine.init(allQuestions);
      console.log('[LUMI] IsotopeEngine initialized with', allQuestions.length, 'questions');

      // Compute operator coordinates for all questions
      for (const q of allQuestions) {
        IsotopeEngine.computeOperatorCoordinate(q);
      }
      console.log('[LUMI] Operator coordinates computed');
    }

    // Initialize ZPD System
    if (window.ZPDSystem && allQuestions.length > 0) {
      try {
        const savedZPD = localStorage.getItem('lumi_zpd_state');
        ZPDSystem.init(allQuestions, savedZPD ? JSON.parse(savedZPD) : null);
        console.log('[LUMI] ZPDSystem initialized');
      } catch (e) {
        console.warn('[LUMI] ZPD state load failed:', e);
        ZPDSystem.init(allQuestions, null);
      }

      // Save ZPD state periodically
      setInterval(() => {
        try {
          localStorage.setItem('lumi_zpd_state', JSON.stringify(ZPDSystem.saveState()));
        } catch (e) { /* ignore */ }
      }, 30000);
    }

    // Initialize LUMI Bridge (optional WebSocket connection)
    if (window.LumiBridge) {
      LumiBridge.init();
      console.log('[LUMI] LumiBridge initialized');

      // Try to connect to LUMI-OS (won't error if not available)
      LumiBridge.connect().then(() => {
        console.log('[LUMI] Connected to LUMI-OS');
      }).catch(() => {
        console.log('[LUMI] LUMI-OS not available (offline mode)');
      });
    }

    console.log('[LUMI] Integration modules ready');
  }

  /**
   * Register Service Worker for PWA functionality
   */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    }
  }

  // Wait for window load to ensure all deferred scripts have executed
  window.addEventListener('load', () => {
    initQuizModes();
    initLumiModules();
    registerServiceWorker();
  });
})();
