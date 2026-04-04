/**
 * Ms. Luminara Quiz - Vocabulary Helper v2.0
 * Provides hover definitions for vocabulary terms in questions
 *
 * LINGUISTICS-SOUND APPROACH:
 * 1. Sort terms by length DESC (longest match first)
 * 2. Find all matches with positions
 * 3. Skip overlapping matches (longer term wins)
 * 4. Replace from END to START (preserves positions)
 * 5. Never match inside HTML tags or attributes
 *
 * @module VocabHelper
 * @version 2.0.0
 */

const VocabHelper = {
  // Term index: { termLower: { term, definition, category, chapter } }
  index: {},

  // Loading state
  loaded: false,
  loading: false,

  // Vocabulary file mappings
  VOCAB_FILES: [
    { path: '611-anatomy/611-foundations/000.5-vocabulary.json', category: '000', name: 'Foundations' },
    { path: '612-physiology/612.82-brain/100.5-vocabulary.json', category: '100', name: 'Brain' },
    { path: '612-physiology/612.81-nerves/200.6-vocabulary.json', category: '200', name: 'Peripheral NS' },
    { path: '611-anatomy/611.018-tissues/400.4-vocabulary.json', category: '400', name: 'Tissues' },
    { path: '612-physiology/612.89-ans/500.3-vocabulary.json', category: '500', name: 'ANS' },
    { path: '612-physiology/612.8-special-senses/600.4-vocabulary.json', category: '600', name: 'Special Senses' },
    { path: '612-physiology/612.4-endocrine/700.4-vocabulary.json', category: '700', name: 'Endocrine' }
  ],

  /**
   * Load all vocabulary files and build index
   */
  async loadVocabulary() {
    if (this.loaded || this.loading) return;
    this.loading = true;

    console.log('[VocabHelper] Loading vocabulary files...');

    for (const vocabFile of this.VOCAB_FILES) {
      try {
        const resp = await fetch(vocabFile.path);
        if (!resp.ok) {
          console.warn(`[VocabHelper] Could not load ${vocabFile.path}`);
          continue;
        }
        const data = await resp.json();
        this.extractTermsFromBank(data, vocabFile.category, vocabFile.name);
      } catch (e) {
        console.warn(`[VocabHelper] Failed to load ${vocabFile.path}:`, e.message);
      }
    }

    this.loaded = true;
    this.loading = false;
    console.log(`[VocabHelper] Loaded ${Object.keys(this.index).length} vocabulary terms`);
  },

  /**
   * Extract terms and definitions from a vocabulary bank
   */
  extractTermsFromBank(bankData, category, categoryName) {
    if (!bankData.questions) return;

    for (const q of bankData.questions) {
      // Extract each option as a term with its optionExplain as definition
      if (q.options && q.optionExplains) {
        for (let i = 0; i < q.options.length; i++) {
          const term = q.options[i];
          const termLower = term.toLowerCase().trim();

          // Skip very short terms (< 4 chars to avoid "the", "and", etc)
          if (termLower.length < 4) continue;

          // Get definition from optionExplains
          let definition = '';
          if (q.optionExplains[i] && q.optionExplains[i].text) {
            definition = q.optionExplains[i].text;
          }

          // Fallback to main explain for correct answer
          if (!definition && i === q.answer && q.explain) {
            definition = q.explain;
          }

          definition = this.cleanDefinition(definition);

          // Only add if we have a definition and it's better than existing
          if (definition && (!this.index[termLower] || this.index[termLower].definition.length < definition.length)) {
            this.index[termLower] = {
              term: term,
              definition: definition,
              category: category,
              categoryName: categoryName,
              chapter: q.chapter || ''
            };
          }
        }
      }
    }
  },

  /**
   * Clean and truncate definition text
   * IMPORTANT: Strip ALL HTML to prevent nested tag issues
   */
  cleanDefinition(text) {
    if (!text) return '';

    // Remove ALL HTML tags
    let clean = text.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    clean = clean.replace(/&amp;/g, '&')
                 .replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'")
                 .replace(/&nbsp;/g, ' ');

    // Remove newlines and normalize whitespace
    clean = clean.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ');

    // Truncate to reasonable length
    if (clean.length > 250) {
      // Cut at sentence boundary if possible
      const truncated = clean.substring(0, 250);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > 150) {
        clean = truncated.substring(0, lastPeriod + 1);
      } else {
        clean = truncated + '...';
      }
    }

    return clean.trim();
  },

  /**
   * Escape special characters for use in HTML attributes
   */
  escapeForAttribute(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Escape regex special characters
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * LINGUISTICS-SOUND TEXT HIGHLIGHTING
   *
   * Algorithm:
   * 1. Get all terms sorted by length (longest first)
   * 2. Find all matches with their positions
   * 3. Filter out overlapping matches (keep longest)
   * 4. Replace from end to start (preserves positions)
   */
  highlightTermsInText(text) {
    if (!this.loaded || !text) return text;

    // Don't process if already contains vocab spans
    if (text.includes('class="vocab-term"')) return text;

    // Don't process very short text
    if (text.length < 20) return text;

    // Get terms sorted by length DESC (longest first - linguistic priority)
    const terms = Object.keys(this.index).sort((a, b) => b.length - a.length);
    if (terms.length === 0) return text;

    // Find "safe zones" - text outside of HTML tags
    // We only want to match in actual text content, not inside <tags> or attributes
    const safeZones = this.findSafeZones(text);
    if (safeZones.length === 0) return text;

    // Find all matches with positions
    const matches = [];

    for (const termLower of terms) {
      const data = this.index[termLower];

      // Build word-boundary regex
      const regex = new RegExp(`\\b(${this.escapeRegex(termLower)})\\b`, 'gi');

      let match;
      while ((match = regex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;

        // Check if match is in a safe zone (actual text, not HTML)
        const inSafeZone = safeZones.some(zone =>
          matchStart >= zone.start && matchEnd <= zone.end
        );
        if (!inSafeZone) continue;

        // Check if this overlaps with an existing match
        // Since we process longest first, existing matches take priority
        const overlaps = matches.some(m =>
          (matchStart >= m.start && matchStart < m.end) ||
          (matchEnd > m.start && matchEnd <= m.end) ||
          (matchStart <= m.start && matchEnd >= m.end)
        );
        if (overlaps) continue;

        matches.push({
          start: matchStart,
          end: matchEnd,
          original: match[0],
          term: termLower,
          definition: data.definition
        });
      }
    }

    // Limit to 5 matches per text to avoid overwhelming
    if (matches.length > 5) {
      matches.length = 5;
    }

    // Sort by position DESCENDING (replace from end first)
    matches.sort((a, b) => b.start - a.start);

    // Apply replacements from end to start
    let result = text;
    for (const m of matches) {
      const escapedDef = this.escapeForAttribute(m.definition);
      const replacement = `<span class="vocab-term" data-definition="${escapedDef}" tabindex="0">${m.original}</span>`;
      result = result.slice(0, m.start) + replacement + result.slice(m.end);
    }

    return result;
  },

  /**
   * Find "safe zones" in text - regions that are actual text content,
   * not inside HTML tags or attributes
   */
  findSafeZones(text) {
    const zones = [];
    const tagRegex = /<[^>]*>/g;

    let lastEnd = 0;
    let match;

    while ((match = tagRegex.exec(text)) !== null) {
      // Text before this tag is a safe zone
      if (match.index > lastEnd) {
        zones.push({ start: lastEnd, end: match.index });
      }
      lastEnd = match.index + match[0].length;
    }

    // Text after last tag
    if (lastEnd < text.length) {
      zones.push({ start: lastEnd, end: text.length });
    }

    return zones;
  },

  /**
   * Get definition for a term
   */
  getDefinition(term) {
    const termLower = term.toLowerCase().trim();
    return this.index[termLower] || null;
  },

  /**
   * Check if a term exists in the index
   */
  hasTerm(term) {
    return !!this.index[term.toLowerCase().trim()];
  },

  /**
   * Get statistics about loaded vocabulary
   */
  getStats() {
    const categories = {};
    for (const data of Object.values(this.index)) {
      categories[data.category] = (categories[data.category] || 0) + 1;
    }

    return {
      totalTerms: Object.keys(this.index).length,
      loaded: this.loaded,
      byCategory: categories
    };
  }
};

// Auto-load vocabulary on script load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Delay loading to not block initial render
    setTimeout(() => {
      VocabHelper.loadVocabulary();
    }, 500);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VocabHelper;
}

// Global access
if (typeof window !== 'undefined') {
  window.VocabHelper = VocabHelper;
}
