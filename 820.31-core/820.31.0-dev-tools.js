/**
 * Ms. Luminara Quiz - Dev Tools
 * Toggle dev panel with Ctrl+D
 *
 * Includes centralized QuizLogger for dev/prod mode filtering
 */

// Dev panel state
let devPanelVisible = false;

// ═══════════════════════════════════════════════════════════════
// CENTRALIZED LOGGER (Fix #1)
// Use QuizLogger.debug/info/warn/error instead of console.log
// ═══════════════════════════════════════════════════════════════

const QuizLogger = (function() {
  // Detect dev mode
  const isDevMode = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:' ||
    window.location.hostname.includes('preview')
  );

  // Log level: 0=none, 1=error, 2=warn, 3=info, 4=debug
  let logLevel = isDevMode ? 4 : 1;

  const PREFIX_STYLES = {
    debug: 'color: #888',
    info: 'color: #4a9eff',
    warn: 'color: #f59e0b',
    error: 'color: #ef4444; font-weight: bold'
  };

  function formatMessage(level, module, message) {
    const timestamp = new Date().toLocaleTimeString();
    return [`%c[${timestamp}] [${module}]`, PREFIX_STYLES[level], message];
  }

  return {
    setLevel(level) { logLevel = level; },
    getLevel() { return logLevel; },
    isDevMode() { return isDevMode; },

    debug(module, ...args) {
      if (logLevel >= 4) {
        const [fmt, style, msg] = formatMessage('debug', module, args[0]);
        console.log(fmt, style, ...args);
      }
    },

    info(module, ...args) {
      if (logLevel >= 3) {
        const [fmt, style, msg] = formatMessage('info', module, args[0]);
        console.info(fmt, style, ...args);
      }
    },

    warn(module, ...args) {
      if (logLevel >= 2) {
        const [fmt, style, msg] = formatMessage('warn', module, args[0]);
        console.warn(fmt, style, ...args);
      }
    },

    error(module, ...args) {
      if (logLevel >= 1) {
        const [fmt, style, msg] = formatMessage('error', module, args[0]);
        console.error(fmt, style, ...args);
      }
    },

    // Legacy compatibility - use for gradual migration
    log(message, ...args) {
      if (logLevel >= 4) {
        console.log(message, ...args);
      }
    }
  };
})();

// Make globally available
window.QuizLogger = QuizLogger;

// ═══════════════════════════════════════════════════════════════
// HTML SANITIZATION (Fix #5)
// Use QuizSanitize.html() before inserting user-provided content
// ═══════════════════════════════════════════════════════════════

const QuizSanitize = {
  /**
   * Escape HTML entities to prevent XSS
   * @param {string} text - Raw text to escape
   * @returns {string} Escaped text safe for innerHTML
   */
  html(text) {
    if (!text || typeof text !== 'string') return text || '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Sanitize question text (preserves basic formatting)
   * Allows: <b>, <i>, <u>, <sub>, <sup>, <br>
   * @param {string} text - Question text
   * @returns {string} Sanitized HTML
   */
  questionText(text) {
    if (!text || typeof text !== 'string') return text || '';
    // First escape everything
    let safe = this.html(text);
    // Then restore allowed tags (already escaped to &lt; etc.)
    safe = safe.replace(/&lt;(\/?(b|i|u|sub|sup|br)\s*\/?)&gt;/gi, '<$1>');
    return safe;
  },

  /**
   * Sanitize attribute value (for data attributes, etc.)
   * @param {string} value - Attribute value
   * @returns {string} Safe attribute value
   */
  attr(value) {
    if (!value || typeof value !== 'string') return '';
    return value.replace(/['"<>&]/g, char => {
      const entities = { "'": '&#39;', '"': '&quot;', '<': '&lt;', '>': '&gt;', '&': '&amp;' };
      return entities[char];
    });
  }
};

// Make globally available
window.QuizSanitize = QuizSanitize;

// ═══════════════════════════════════════════════════════════════
// FISHER-YATES SHUFFLE (Fix #6)
// Use QuizUtils.shuffle() instead of .sort(() => Math.random() - 0.5)
// The sort-based shuffle is biased - Fisher-Yates is uniform
// ═══════════════════════════════════════════════════════════════

const QuizUtils = {
  /**
   * Fisher-Yates shuffle - unbiased random permutation
   * @param {array} array - Array to shuffle
   * @returns {array} New shuffled array (does not mutate original)
   */
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Fisher-Yates in-place shuffle - modifies original array
   * @param {array} array - Array to shuffle in place
   * @returns {array} The same array, now shuffled
   */
  shuffleInPlace(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};

// Make globally available
window.QuizUtils = QuizUtils;

// ═══════════════════════════════════════════════════════════════
// SECURITY UTILITIES (Security Audit Fixes)
// Prevent prototype pollution and validate localStorage data
// ═══════════════════════════════════════════════════════════════

const QuizSecurity = {
  /**
   * Dangerous keys that can cause prototype pollution
   */
  DANGEROUS_KEYS: ['__proto__', 'constructor', 'prototype'],

  /**
   * Safe JSON parse that filters prototype pollution keys
   * @param {string} jsonString - JSON string to parse
   * @param {object} defaultValue - Default value if parse fails
   * @returns {object} Parsed object with dangerous keys removed
   */
  safeJsonParse(jsonString, defaultValue = null) {
    if (!jsonString || typeof jsonString !== 'string') {
      return defaultValue;
    }
    try {
      return JSON.parse(jsonString, (key, value) => {
        if (this.DANGEROUS_KEYS.includes(key)) {
          QuizLogger.warn('Security', `Blocked dangerous key in JSON: ${key}`);
          return undefined;
        }
        return value;
      });
    } catch (e) {
      QuizLogger.error('Security', 'JSON parse failed:', e.message);
      return defaultValue;
    }
  },

  /**
   * Safe Object.assign that filters prototype pollution keys
   * @param {object} target - Target object
   * @param {object} source - Source object (potentially untrusted)
   * @returns {object} Target with safe properties assigned
   */
  safeAssign(target, source) {
    if (!source || typeof source !== 'object') {
      return target;
    }
    for (const key of Object.keys(source)) {
      if (!this.DANGEROUS_KEYS.includes(key)) {
        target[key] = source[key];
      } else {
        QuizLogger.warn('Security', `Blocked dangerous key in assign: ${key}`);
      }
    }
    return target;
  },

  /**
   * Load and validate localStorage data with schema
   * @param {string} key - localStorage key
   * @param {object} schema - Schema with required fields and types
   * @param {object} defaultValue - Default if validation fails
   * @returns {object} Validated data or default
   */
  loadValidatedStorage(key, schema, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const parsed = this.safeJsonParse(stored, null);
      if (!parsed) return defaultValue;

      // Validate against schema if provided
      if (schema && schema.required) {
        for (const field of schema.required) {
          if (!(field in parsed)) {
            QuizLogger.warn('Security', `Missing required field in ${key}: ${field}`);
            return defaultValue;
          }
        }
      }

      if (schema && schema.types) {
        for (const [field, expectedType] of Object.entries(schema.types)) {
          if (field in parsed && typeof parsed[field] !== expectedType) {
            QuizLogger.warn('Security', `Type mismatch in ${key}.${field}: expected ${expectedType}`);
            return defaultValue;
          }
        }
      }

      return parsed;
    } catch (e) {
      QuizLogger.error('Security', `Failed to load ${key}:`, e.message);
      return defaultValue;
    }
  },

  /**
   * Sanitize a URL to prevent javascript: and data: injection
   * @param {string} url - URL to sanitize
   * @returns {string|null} Safe URL or null if dangerous
   */
  sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')) {
      QuizLogger.warn('Security', `Blocked dangerous URL: ${url.substring(0, 50)}`);
      return null;
    }
    return url;
  }
};

// Make globally available
window.QuizSecurity = QuizSecurity;

// Initialize dev tools
document.addEventListener('DOMContentLoaded', () => {
  // Check if running on localhost (dev mode)
  const isDevMode = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';

  if (isDevMode) {
    createDevModeIndicator();
    updateDevInfo();
  }
});

// Keyboard shortcut: Ctrl+D to toggle dev panel
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault();
    toggleDevPanel();
  }
  // Ctrl+R to reload (already native, but let's make sure CSS reloads too)
  if (e.ctrlKey && e.key === 'r') {
    // Let native reload happen
  }
});

// Toggle dev panel visibility
function toggleDevPanel() {
  const panel = document.getElementById('devPanel');
  if (panel) {
    devPanelVisible = !devPanelVisible;
    panel.classList.toggle('hidden', !devPanelVisible);
    if (devPanelVisible) {
      updateDevInfo();
    }
  }
}

// Create dev mode indicator badge
function createDevModeIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'dev-mode-indicator';
  indicator.innerHTML = 'DEV MODE (Ctrl+D)';
  indicator.onclick = toggleDevPanel;
  document.body.appendChild(indicator);
}

// Show toast notification
function showDevToast(message) {
  const toast = document.createElement('div');
  toast.className = 'dev-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// Reload CSS without full page refresh
function reloadStyles() {
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    const href = link.href.split('?')[0];
    link.href = href + '?v=' + Date.now();
  });
  showDevToast('CSS reloaded!');
}

// Reload questions (if quiz object exists)
function reloadQuestions() {
  if (typeof quiz !== 'undefined' && quiz.loadRegistry) {
    quiz.loadRegistry().then(() => {
      showDevToast('Questions reloaded!');
    });
  } else {
    location.reload();
  }
}

// Update CSS custom property
function updateCSSVar(varName, value) {
  document.documentElement.style.setProperty(varName, value);
  showDevToast(`Updated ${varName}`);
}

// Update dev info panel
function updateDevInfo() {
  const infoDiv = document.getElementById('devInfo');
  if (!infoDiv) return;

  // Count questions if quiz is loaded
  let questionCount = '...';
  let categoryCount = '...';

  if (typeof quiz !== 'undefined' && quiz.registry) {
    categoryCount = quiz.registry.categories?.length || 0;
    questionCount = quiz.registry.categories?.reduce((sum, cat) => {
      return sum + (cat.banks?.reduce((s, b) => s + (b.questionCount || 0), 0) || 0);
    }, 0) || '...';
  }

  infoDiv.innerHTML = `
    <strong>Server:</strong> ${window.location.host}<br>
    <strong>Categories:</strong> ${categoryCount}<br>
    <strong>Questions:</strong> ${questionCount}<br>
    <strong>Last refresh:</strong> ${new Date().toLocaleTimeString()}<br>
    <br>
    <strong>Keyboard:</strong><br>
    Ctrl+D: Toggle this panel<br>
    Ctrl+R: Reload page<br>
    F5: Refresh
  `;
}

// Auto-refresh dev info every 5 seconds when panel is open
setInterval(() => {
  if (devPanelVisible) {
    updateDevInfo();
  }
}, 5000);

// Expose functions globally
window.toggleDevPanel = toggleDevPanel;
window.reloadStyles = reloadStyles;
window.reloadQuestions = reloadQuestions;
window.updateCSSVar = updateCSSVar;
window.showDevToast = showDevToast;

console.log('%c Ms. Luminara Dev Tools Loaded ', 'background: #8b5cf6; color: white; padding: 4px 8px; border-radius: 4px;');
console.log('Press Ctrl+D to open dev panel');
