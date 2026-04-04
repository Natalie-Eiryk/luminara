/**
 * 820.31.70-math-renderer.js
 * @codon 820.31.70
 * @version 2026-03-29
 * @description KaTeX-powered math rendering for quiz questions and options
 *
 * TAIDRGEF Signature: T.F.E (Transform LaTeX, Frame as rendered, Emit to DOM)
 *
 * Supports:
 * - Inline math: $x^2$ or \(x^2\)
 * - Display math: $$x^2$$ or \[x^2\]
 * - Auto-detection and rendering in questions, options, explanations
 * - Graceful fallback if KaTeX not loaded
 */

(function() {
  'use strict';

  // =============================================================================
  // MATH RENDERER MODULE
  // =============================================================================

  const MathRenderer = {
    // Configuration
    config: {
      // Delimiters for math detection
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],

      // KaTeX rendering options
      katexOptions: {
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false,
        trust: true,
        macros: {
          // Common math macros
          '\\R': '\\mathbb{R}',
          '\\N': '\\mathbb{N}',
          '\\Z': '\\mathbb{Z}',
          '\\Q': '\\mathbb{Q}',
          '\\C': '\\mathbb{C}',
          '\\vec': '\\mathbf',
          '\\deg': '^\\circ'
        }
      }
    },

    // State
    state: {
      initialized: false,
      katexLoaded: false
    },

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    /**
     * Initialize the math renderer
     * Called automatically when KaTeX is ready
     */
    init() {
      if (this.state.initialized) return;

      // Check if KaTeX is available
      if (typeof katex !== 'undefined') {
        this.state.katexLoaded = true;
        console.log('[MathRenderer] KaTeX loaded successfully');
      } else {
        console.warn('[MathRenderer] KaTeX not available - math will display as plain text');
      }

      this.state.initialized = true;
    },

    /**
     * Wait for KaTeX to load, then initialize
     */
    waitForKaTeX(callback, maxWait = 5000) {
      const startTime = Date.now();

      const check = () => {
        if (typeof katex !== 'undefined') {
          this.init();
          if (callback) callback();
        } else if (Date.now() - startTime < maxWait) {
          setTimeout(check, 100);
        } else {
          console.warn('[MathRenderer] KaTeX did not load within timeout');
          this.state.initialized = true;
        }
      };

      check();
    },

    // ==========================================================================
    // DETECTION
    // ==========================================================================

    /**
     * Check if text contains math expressions
     * @param {string} text - Text to check
     * @returns {boolean}
     */
    containsMath(text) {
      if (!text || typeof text !== 'string') return false;

      // Check for any delimiter patterns
      return this.config.delimiters.some(d => {
        const escapedLeft = this.escapeRegex(d.left);
        const escapedRight = this.escapeRegex(d.right);
        const pattern = new RegExp(escapedLeft + '.+?' + escapedRight, 's');
        return pattern.test(text);
      });
    },

    /**
     * Escape special regex characters
     */
    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    // ==========================================================================
    // RENDERING
    // ==========================================================================

    /**
     * Render math in a string, returning HTML
     * @param {string} text - Text potentially containing math
     * @returns {string} HTML with rendered math
     */
    render(text) {
      if (!text || typeof text !== 'string') return text || '';

      // If KaTeX not loaded, return escaped text
      if (!this.state.katexLoaded) {
        return this.escapeHtml(text);
      }

      // Process each delimiter type
      let result = text;

      for (const delim of this.config.delimiters) {
        result = this.processDelimiter(result, delim);
      }

      return result;
    },

    /**
     * Process a specific delimiter type
     */
    processDelimiter(text, delim) {
      const escapedLeft = this.escapeRegex(delim.left);
      const escapedRight = this.escapeRegex(delim.right);
      const pattern = new RegExp(escapedLeft + '([\\s\\S]+?)' + escapedRight, 'g');

      return text.replace(pattern, (match, mathContent) => {
        try {
          const html = katex.renderToString(mathContent.trim(), {
            ...this.config.katexOptions,
            displayMode: delim.display
          });
          return html;
        } catch (e) {
          console.warn('[MathRenderer] Failed to render:', mathContent, e);
          // Return original on error
          return `<span class="math-error" title="Math render error">${this.escapeHtml(match)}</span>`;
        }
      });
    },

    /**
     * Render math in a DOM element (in-place)
     * @param {HTMLElement} element - Element to process
     */
    renderElement(element) {
      if (!element || !this.state.katexLoaded) return;

      // Use KaTeX auto-render if available
      if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(element, {
          delimiters: this.config.delimiters,
          ...this.config.katexOptions
        });
      } else {
        // Manual fallback
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const textNodes = [];
        while (walker.nextNode()) {
          if (this.containsMath(walker.currentNode.textContent)) {
            textNodes.push(walker.currentNode);
          }
        }

        textNodes.forEach(node => {
          const span = document.createElement('span');
          span.innerHTML = this.render(node.textContent);
          node.parentNode.replaceChild(span, node);
        });
      }
    },

    /**
     * Render all math in the document
     */
    renderDocument() {
      if (!this.state.katexLoaded) return;

      // Target specific quiz elements
      const selectors = [
        '.question-text',
        '.option-btn',
        '.option-text',
        '.scaffold-question',
        '.scaffold-option',
        '.explanation',
        '.boss-question',
        '.map-combat-question',
        '.answer-card'
      ];

      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          this.renderElement(el);
        });
      });
    },

    // ==========================================================================
    // UTILITY FUNCTIONS
    // ==========================================================================

    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    /**
     * Create a math expression preview (for editors)
     * @param {string} latex - LaTeX string
     * @returns {string} Rendered HTML or error message
     */
    preview(latex) {
      if (!this.state.katexLoaded) {
        return `<code>${this.escapeHtml(latex)}</code>`;
      }

      try {
        return katex.renderToString(latex, {
          ...this.config.katexOptions,
          displayMode: false
        });
      } catch (e) {
        return `<span class="math-error">${this.escapeHtml(latex)}</span>`;
      }
    },

    /**
     * Render a standalone math block
     * @param {string} latex - LaTeX string
     * @param {boolean} display - Display mode (centered, larger)
     * @returns {string} Rendered HTML
     */
    renderMath(latex, display = false) {
      if (!this.state.katexLoaded) {
        return `<code>${this.escapeHtml(latex)}</code>`;
      }

      try {
        return katex.renderToString(latex, {
          ...this.config.katexOptions,
          displayMode: display
        });
      } catch (e) {
        console.warn('[MathRenderer] Error rendering:', latex, e);
        return `<span class="math-error">${this.escapeHtml(latex)}</span>`;
      }
    },

    // ==========================================================================
    // COMMON MATH PATTERNS
    // ==========================================================================

    /**
     * Format a fraction
     */
    fraction(num, den) {
      return this.renderMath(`\\frac{${num}}{${den}}`);
    },

    /**
     * Format an exponent
     */
    power(base, exp) {
      return this.renderMath(`${base}^{${exp}}`);
    },

    /**
     * Format a square root
     */
    sqrt(content, n = null) {
      if (n) {
        return this.renderMath(`\\sqrt[${n}]{${content}}`);
      }
      return this.renderMath(`\\sqrt{${content}}`);
    },

    /**
     * Format a sum
     */
    sum(lower, upper, expr) {
      return this.renderMath(`\\sum_{${lower}}^{${upper}} ${expr}`, true);
    },

    /**
     * Format an integral
     */
    integral(lower, upper, expr) {
      return this.renderMath(`\\int_{${lower}}^{${upper}} ${expr}\\, dx`, true);
    }
  };

  // =============================================================================
  // CSS STYLES
  // =============================================================================

  const styles = document.createElement('style');
  styles.textContent = `
    /* Math rendering styles */
    .math-error {
      color: var(--wrong, #ef4444);
      background: rgba(239, 68, 68, 0.1);
      padding: 0.1em 0.3em;
      border-radius: 3px;
      font-family: monospace;
    }

    /* KaTeX display math centering */
    .katex-display {
      margin: 1em 0;
      text-align: center;
    }

    /* Ensure KaTeX inherits quiz colors */
    .katex {
      color: inherit;
      font-size: 1.1em;
    }

    /* Math in options - slightly smaller */
    .option-btn .katex,
    .answer-card .katex {
      font-size: 1em;
    }

    /* Math in questions - normal size */
    .question-text .katex {
      font-size: 1.15em;
    }

    /* Display math in questions */
    .question-text .katex-display {
      margin: 0.75em 0;
    }
  `;
  document.head.appendChild(styles);

  // =============================================================================
  // EXPORT & INITIALIZATION
  // =============================================================================

  // Export to window
  window.MathRenderer = MathRenderer;

  // Initialize when KaTeX is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      MathRenderer.waitForKaTeX();
    });
  } else {
    MathRenderer.waitForKaTeX();
  }

  // Module export for CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathRenderer;
  }

})();
