/**
 * ScaffoldModuleAdvanced - Robust, Adaptive, Verified Scaffolding System
 *
 * Improvements over basic module:
 * 1. ACCURACY VERIFICATION
 *    - Confidence scoring for each pairing
 *    - Multiple matching strategies with weighted voting
 *    - Anatomical ontology for precise matching
 *    - Human-verified pairing database
 *
 * 2. ADAPTIVE LEARNING
 *    - Tracks which pairings users find helpful
 *    - Learns from manual corrections
 *    - Improves keyword weights over time
 *    - A/B testing for pairing strategies
 *
 * 3. ROBUSTNESS
 *    - Fallback chains for missing images
 *    - Cross-validation between sources
 *    - Broken image detection
 *    - Format preference handling (SVG > PNG > EMF)
 */

class ScaffoldModuleAdvanced {
  constructor(options = {}) {
    this.basePath = options.basePath || '.';
    this.imagePath = options.imagePath || '../assets/diagrams';

    // Core data stores
    this.questions = new Map();
    this.scaffolds = new Map();
    this.images = new Map();

    // Verified pairings (human-curated, highest trust)
    this.verifiedPairings = new Map(); // questionId -> [{imagePath, verifiedBy, date}]

    // Learning data
    this.pairingFeedback = new Map();  // imagePath -> {helpful: n, notHelpful: n}
    this.keywordWeights = new Map();   // keyword -> weight (learned)
    this.correctionHistory = [];       // [{questionId, oldImage, newImage, timestamp}]

    // Confidence thresholds
    this.CONFIDENCE = {
      VERIFIED: 1.0,      // Human-verified pairing
      HIGH: 0.8,          // Multiple strategies agree
      MEDIUM: 0.6,        // Single strong match
      LOW: 0.4,           // Weak/fallback match
      NONE: 0.0           // No match found
    };

    // Format preferences (higher = preferred)
    this.FORMAT_PRIORITY = {
      'svg': 10,
      'png': 7,
      'jpg': 5,
      'jpeg': 5,
      'emf': 3,  // EMF doesn't render in browsers without conversion
      'wmf': 2
    };

    // Anatomical ontology for precise matching
    this.ontology = this.buildOntology();

    // Matching strategies
    this.strategies = [
      { name: 'verified', weight: 10, fn: this.matchVerified.bind(this) },
      { name: 'ontology', weight: 8, fn: this.matchOntology.bind(this) },
      { name: 'keyword', weight: 5, fn: this.matchKeyword.bind(this) },
      { name: 'filename', weight: 3, fn: this.matchFilename.bind(this) },
      { name: 'category', weight: 2, fn: this.matchCategory.bind(this) }
    ];
  }

  /**
   * Build anatomical ontology with hierarchical relationships
   */
  buildOntology() {
    return {
      // Eye anatomy hierarchy
      'eye': {
        synonyms: ['ocular', 'ophthalmic', 'visual organ'],
        parent: 'special senses',
        children: ['cornea', 'iris', 'pupil', 'lens', 'retina', 'optic nerve', 'sclera', 'choroid'],
        relatedImages: ['ophthalmology', 'eye_structure', 'eye_muscles']
      },
      'retina': {
        synonyms: ['retinal'],
        parent: 'eye',
        children: ['photoreceptors', 'rods', 'cones', 'ganglion cells', 'bipolar cells', 'fovea', 'macula', 'optic disc'],
        relatedImages: ['ophthalmology', 'retina', 'Retina_']
      },
      'photoreceptors': {
        synonyms: ['light receptors'],
        parent: 'retina',
        children: ['rods', 'cones'],
        relatedImages: ['ophthalmology', 'photoreceptor', 'Cone_', 'Rod_']
      },
      'cones': {
        synonyms: ['cone cells', 'cone photoreceptors'],
        parent: 'photoreceptors',
        children: ['s-cones', 'm-cones', 'l-cones'],
        properties: ['color vision', 'photopic', 'foveal'],
        relatedImages: ['ophthalmology', 'Cone_', 'color', 'trichromatic']
      },
      'rods': {
        synonyms: ['rod cells', 'rod photoreceptors'],
        parent: 'photoreceptors',
        children: [],
        properties: ['night vision', 'scotopic', 'peripheral'],
        relatedImages: ['ophthalmology', 'rod', 'scotopic']
      },

      // Ear anatomy hierarchy
      'ear': {
        synonyms: ['auditory', 'otic', 'acoustic'],
        parent: 'special senses',
        children: ['outer ear', 'middle ear', 'inner ear'],
        relatedImages: ['ent', 'ear', 'auditory']
      },
      'inner ear': {
        synonyms: ['labyrinth'],
        parent: 'ear',
        children: ['cochlea', 'vestibular system', 'semicircular canals'],
        relatedImages: ['ent', 'cochlea', 'labyrinth', 'vestibular']
      },
      'cochlea': {
        synonyms: ['cochlear'],
        parent: 'inner ear',
        children: ['organ of corti', 'hair cells', 'basilar membrane', 'scala vestibuli', 'scala tympani'],
        properties: ['hearing', 'tonotopic'],
        relatedImages: ['ent', 'cochlea', 'Cochlea']
      },

      // Nervous system hierarchy
      'neuron': {
        synonyms: ['nerve cell', 'neural'],
        parent: 'nervous tissue',
        children: ['axon', 'dendrite', 'soma', 'synapse', 'myelin sheath'],
        relatedImages: ['neural-cells', 'Neuron', 'neuron']
      },
      'synapse': {
        synonyms: ['synaptic', 'junction'],
        parent: 'neuron',
        children: ['presynaptic', 'postsynaptic', 'synaptic cleft', 'neurotransmitter'],
        relatedImages: ['neural-cells', 'synapse', 'Synapse']
      },

      // Add more as needed...
    };
  }

  /**
   * Initialize with all data sources
   */
  async init() {
    await Promise.all([
      this.loadImageIndex(),
      this.loadVerifiedPairings(),
      this.loadLearningData()
    ]);

    console.log(`ScaffoldModuleAdvanced initialized:
      - ${this.images.size} image categories
      - ${this.verifiedPairings.size} verified pairings
      - ${this.keywordWeights.size} learned keyword weights`);

    return this;
  }

  /**
   * Load the SMART image index
   */
  async loadImageIndex() {
    try {
      const response = await fetch(`${this.imagePath}/smart-named/smart-named-index.json`);
      const index = await response.json();

      for (const [category, images] of Object.entries(index)) {
        // Filter out untitled/placeholder images
        const validImages = images.filter(img =>
          !img.title.toLowerCase().includes('untitled') &&
          img.size_kb > 1  // Skip tiny placeholder files
        );
        this.images.set(category, validImages);
      }
    } catch (e) {
      console.warn('Could not load SMART index:', e);
    }
  }

  /**
   * Load human-verified pairings
   */
  async loadVerifiedPairings() {
    try {
      const response = await fetch(`${this.basePath}/verified-pairings.json`);
      const data = await response.json();

      for (const [questionId, pairings] of Object.entries(data)) {
        this.verifiedPairings.set(questionId, pairings);
      }
    } catch (e) {
      // No verified pairings file yet - that's ok
      console.log('No verified pairings loaded (file may not exist yet)');
    }
  }

  /**
   * Load learning data (feedback, weights)
   */
  async loadLearningData() {
    try {
      const response = await fetch(`${this.basePath}/learning-data.json`);
      const data = await response.json();

      if (data.feedback) {
        for (const [path, stats] of Object.entries(data.feedback)) {
          this.pairingFeedback.set(path, stats);
        }
      }

      if (data.keywordWeights) {
        for (const [kw, weight] of Object.entries(data.keywordWeights)) {
          this.keywordWeights.set(kw, weight);
        }
      }

      if (data.corrections) {
        this.correctionHistory = data.corrections;
      }
    } catch (e) {
      console.log('No learning data loaded (file may not exist yet)');
    }
  }

  /**
   * STRATEGY 1: Match from verified pairings (highest confidence)
   */
  matchVerified(question) {
    const verified = this.verifiedPairings.get(question.id);
    if (!verified || verified.length === 0) return [];

    return verified.map(v => ({
      file: v.imagePath,
      title: v.title || this.getTitleFromPath(v.imagePath),
      confidence: this.CONFIDENCE.VERIFIED,
      strategy: 'verified',
      verifiedBy: v.verifiedBy,
      verifiedDate: v.date
    }));
  }

  /**
   * STRATEGY 2: Match using anatomical ontology
   */
  matchOntology(question) {
    const text = `${question.q} ${question.explain || ''}`.toLowerCase();
    const matches = [];

    for (const [term, data] of Object.entries(this.ontology)) {
      // Check if term or synonyms appear in question
      const allTerms = [term, ...(data.synonyms || [])];
      const found = allTerms.some(t => text.includes(t.toLowerCase()));

      if (found) {
        // Get related images
        for (const imageKeyword of (data.relatedImages || [])) {
          for (const [category, images] of this.images) {
            if (category.toLowerCase().includes(imageKeyword.toLowerCase())) {
              for (const img of images.slice(0, 3)) { // Limit per category
                matches.push({
                  file: `smart-named/${category}/${img.file}`,
                  title: img.title,
                  confidence: this.CONFIDENCE.HIGH,
                  strategy: 'ontology',
                  matchedTerm: term,
                  ontologyPath: this.getOntologyPath(term)
                });
              }
            }
          }
        }

        // Also check children for more specific matches
        for (const child of (data.children || [])) {
          if (text.includes(child.toLowerCase())) {
            const childData = this.ontology[child];
            if (childData?.relatedImages) {
              for (const imageKeyword of childData.relatedImages) {
                for (const [category, images] of this.images) {
                  if (category.toLowerCase().includes(imageKeyword.toLowerCase())) {
                    for (const img of images.slice(0, 2)) {
                      matches.push({
                        file: `smart-named/${category}/${img.file}`,
                        title: img.title,
                        confidence: this.CONFIDENCE.HIGH + 0.05, // Boost for specific match
                        strategy: 'ontology-child',
                        matchedTerm: child
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return matches;
  }

  /**
   * Get ontology hierarchy path
   */
  getOntologyPath(term) {
    const path = [term];
    let current = this.ontology[term];

    while (current?.parent && this.ontology[current.parent]) {
      path.unshift(current.parent);
      current = this.ontology[current.parent];
    }

    return path.join(' > ');
  }

  /**
   * STRATEGY 3: Keyword matching with learned weights
   */
  matchKeyword(question) {
    const text = `${question.q} ${question.explain || ''}`.toLowerCase();
    const keywords = this.extractKeywords(text);
    const matches = new Map();

    for (const keyword of keywords) {
      const weight = this.keywordWeights.get(keyword) || 1.0;

      for (const [category, images] of this.images) {
        for (const img of images) {
          const titleLower = img.title.toLowerCase();
          const fileLower = img.file.toLowerCase();

          if (titleLower.includes(keyword) || fileLower.includes(keyword)) {
            const path = `smart-named/${category}/${img.file}`;
            const existing = matches.get(path) || {
              file: path,
              title: img.title,
              format: img.format,
              score: 0,
              matchedKeywords: []
            };

            existing.score += weight;
            existing.matchedKeywords.push(keyword);
            matches.set(path, existing);
          }
        }
      }
    }

    // Convert to array and calculate confidence
    return [...matches.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(m => ({
        ...m,
        confidence: Math.min(this.CONFIDENCE.MEDIUM + (m.score * 0.05), this.CONFIDENCE.HIGH - 0.01),
        strategy: 'keyword'
      }));
  }

  /**
   * STRATEGY 4: Filename pattern matching
   */
  matchFilename(question) {
    const text = `${question.q}`.toLowerCase();
    const matches = [];

    // Extract potential anatomical terms (capitalized words, compound terms)
    const terms = text.match(/\b[a-z]{4,}\b/g) || [];

    for (const [category, images] of this.images) {
      for (const img of images) {
        const fileLower = img.file.toLowerCase().replace(/[_-]/g, ' ');

        for (const term of terms) {
          if (fileLower.includes(term) && term.length > 4) {
            matches.push({
              file: `smart-named/${category}/${img.file}`,
              title: img.title,
              format: img.format,
              confidence: this.CONFIDENCE.LOW + 0.1,
              strategy: 'filename',
              matchedTerm: term
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * STRATEGY 5: Category-based fallback
   */
  matchCategory(question) {
    const text = `${question.q} ${question.explain || ''}`.toLowerCase();
    const matches = [];

    // Map question content to likely categories
    const categoryHints = {
      'ophthalmology': ['eye', 'vision', 'retina', 'optic', 'visual', 'blind', 'color', 'cone', 'rod', 'lens', 'cornea'],
      'ent': ['ear', 'hearing', 'cochlea', 'vestibular', 'auditory', 'sound', 'balance', 'equilibrium'],
      'nervous-system': ['nerve', 'spinal', 'brain', 'neuron', 'reflex', 'autonomic'],
      'neural-cells': ['neuron', 'axon', 'dendrite', 'synapse', 'myelin', 'glial'],
      'muscles': ['muscle', 'contraction', 'fiber', 'sarcomere'],
      'digestive-system': ['stomach', 'intestine', 'pancreas', 'liver', 'digest'],
      'blood-immunology': ['blood', 'immune', 'cell', 'antibody', 'leukocyte'],
      'endocrinology': ['hormone', 'gland', 'thyroid', 'adrenal', 'pituitary']
    };

    for (const [category, hints] of Object.entries(categoryHints)) {
      const matchCount = hints.filter(h => text.includes(h)).length;

      if (matchCount > 0 && this.images.has(category)) {
        const images = this.images.get(category);
        // Add top images from matching category
        for (const img of images.slice(0, 3)) {
          matches.push({
            file: `smart-named/${category}/${img.file}`,
            title: img.title,
            format: img.format,
            confidence: this.CONFIDENCE.LOW + (matchCount * 0.05),
            strategy: 'category',
            matchedCategory: category,
            hintMatches: matchCount
          });
        }
      }
    }

    return matches;
  }

  /**
   * MAIN MATCHING FUNCTION: Combines all strategies with weighted voting
   */
  findImagesForQuestion(question, options = {}) {
    const { maxResults = 8, minConfidence = 0.3 } = options;

    // Run all strategies
    const allMatches = [];
    for (const strategy of this.strategies) {
      const results = strategy.fn(question);
      for (const result of results) {
        result.strategyWeight = strategy.weight;
        allMatches.push(result);
      }
    }

    // Aggregate by image path (combine scores from multiple strategies)
    const aggregated = new Map();

    for (const match of allMatches) {
      const existing = aggregated.get(match.file);

      if (existing) {
        // Combine confidences (weighted average)
        const totalWeight = existing.totalWeight + match.strategyWeight;
        existing.confidence = (
          (existing.confidence * existing.totalWeight) +
          (match.confidence * match.strategyWeight)
        ) / totalWeight;
        existing.totalWeight = totalWeight;
        existing.strategies.push(match.strategy);

        // Boost confidence if multiple strategies agree
        if (existing.strategies.length >= 2) {
          existing.confidence = Math.min(existing.confidence + 0.1, this.CONFIDENCE.VERIFIED - 0.01);
          existing.multiStrategyBoost = true;
        }
      } else {
        aggregated.set(match.file, {
          ...match,
          totalWeight: match.strategyWeight,
          strategies: [match.strategy]
        });
      }
    }

    // Apply format preference
    for (const [path, match] of aggregated) {
      const ext = path.split('.').pop().toLowerCase();
      const formatBoost = (this.FORMAT_PRIORITY[ext] || 1) * 0.01;
      match.confidence += formatBoost;
      match.formatPreference = this.FORMAT_PRIORITY[ext] || 1;
    }

    // Apply learning adjustments
    for (const [path, match] of aggregated) {
      const feedback = this.pairingFeedback.get(path);
      if (feedback) {
        const helpfulRatio = feedback.helpful / (feedback.helpful + feedback.notHelpful + 1);
        match.confidence *= (0.5 + helpfulRatio); // Scale 0.5x to 1.5x based on feedback
        match.feedbackAdjusted = true;
        match.helpfulRatio = helpfulRatio;
      }
    }

    // Sort by confidence and filter
    const results = [...aggregated.values()]
      .filter(m => m.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);

    // Add quality metadata
    return results.map(r => ({
      ...r,
      qualityScore: this.calculateQualityScore(r),
      confidenceLevel: this.getConfidenceLevel(r.confidence)
    }));
  }

  /**
   * Calculate overall quality score for a pairing
   */
  calculateQualityScore(match) {
    let score = 0;

    // Base confidence contribution (0-40 points)
    score += match.confidence * 40;

    // Multi-strategy agreement (0-20 points)
    score += Math.min(match.strategies.length * 5, 20);

    // Format preference (0-10 points)
    score += match.formatPreference || 0;

    // Feedback adjustment (0-15 points)
    if (match.helpfulRatio !== undefined) {
      score += match.helpfulRatio * 15;
    }

    // Verified bonus (15 points)
    if (match.strategies.includes('verified')) {
      score += 15;
    }

    return Math.round(score);
  }

  /**
   * Get human-readable confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= this.CONFIDENCE.VERIFIED) return 'VERIFIED';
    if (confidence >= this.CONFIDENCE.HIGH) return 'HIGH';
    if (confidence >= this.CONFIDENCE.MEDIUM) return 'MEDIUM';
    if (confidence >= this.CONFIDENCE.LOW) return 'LOW';
    return 'NONE';
  }

  /**
   * Record user feedback on a pairing
   */
  recordFeedback(imagePath, helpful) {
    if (!this.pairingFeedback.has(imagePath)) {
      this.pairingFeedback.set(imagePath, { helpful: 0, notHelpful: 0 });
    }

    const stats = this.pairingFeedback.get(imagePath);
    if (helpful) {
      stats.helpful++;
    } else {
      stats.notHelpful++;
    }

    // Persist feedback
    this.saveLearningData();
  }

  /**
   * Record a manual correction (user chose different image)
   */
  recordCorrection(questionId, oldImagePath, newImagePath) {
    this.correctionHistory.push({
      questionId,
      oldImagePath,
      newImagePath,
      timestamp: new Date().toISOString()
    });

    // Update keyword weights based on correction
    this.updateKeywordWeights(questionId, oldImagePath, newImagePath);

    // Persist
    this.saveLearningData();
  }

  /**
   * Update keyword weights based on corrections
   */
  updateKeywordWeights(questionId, oldPath, newPath) {
    const question = this.questions.get(questionId);
    if (!question) return;

    const keywords = this.extractKeywords(`${question.q} ${question.explain || ''}`);

    // Decrease weight for keywords that led to old (wrong) image
    const oldTitle = this.getTitleFromPath(oldPath).toLowerCase();
    for (const kw of keywords) {
      if (oldTitle.includes(kw)) {
        const current = this.keywordWeights.get(kw) || 1.0;
        this.keywordWeights.set(kw, Math.max(0.1, current * 0.9));
      }
    }

    // Increase weight for keywords that match new (correct) image
    const newTitle = this.getTitleFromPath(newPath).toLowerCase();
    for (const kw of keywords) {
      if (newTitle.includes(kw)) {
        const current = this.keywordWeights.get(kw) || 1.0;
        this.keywordWeights.set(kw, Math.min(3.0, current * 1.1));
      }
    }
  }

  /**
   * Add a verified pairing (human-curated)
   */
  addVerifiedPairing(questionId, imagePath, verifiedBy = 'curator') {
    if (!this.verifiedPairings.has(questionId)) {
      this.verifiedPairings.set(questionId, []);
    }

    const pairings = this.verifiedPairings.get(questionId);

    // Check if already exists
    if (!pairings.some(p => p.imagePath === imagePath)) {
      pairings.push({
        imagePath,
        title: this.getTitleFromPath(imagePath),
        verifiedBy,
        date: new Date().toISOString()
      });
    }

    // Persist
    this.saveVerifiedPairings();
  }

  /**
   * Remove a verified pairing
   */
  removeVerifiedPairing(questionId, imagePath) {
    const pairings = this.verifiedPairings.get(questionId);
    if (pairings) {
      const idx = pairings.findIndex(p => p.imagePath === imagePath);
      if (idx >= 0) {
        pairings.splice(idx, 1);
        this.saveVerifiedPairings();
      }
    }
  }

  /**
   * Save verified pairings to file (for persistence)
   */
  saveVerifiedPairings() {
    const data = {};
    for (const [id, pairings] of this.verifiedPairings) {
      data[id] = pairings;
    }

    // In browser, we'll store to localStorage and offer download
    localStorage.setItem('ms-luminara-verified-pairings', JSON.stringify(data));

    console.log('Verified pairings saved to localStorage');
  }

  /**
   * Save learning data
   */
  saveLearningData() {
    const data = {
      feedback: Object.fromEntries(this.pairingFeedback),
      keywordWeights: Object.fromEntries(this.keywordWeights),
      corrections: this.correctionHistory,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem('ms-luminara-learning-data', JSON.stringify(data));
  }

  /**
   * Export all data for backup/transfer
   */
  exportAllData() {
    return {
      verifiedPairings: Object.fromEntries(this.verifiedPairings),
      learningData: {
        feedback: Object.fromEntries(this.pairingFeedback),
        keywordWeights: Object.fromEntries(this.keywordWeights),
        corrections: this.correctionHistory
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import data from backup
   */
  importData(data) {
    if (data.verifiedPairings) {
      for (const [id, pairings] of Object.entries(data.verifiedPairings)) {
        this.verifiedPairings.set(id, pairings);
      }
    }

    if (data.learningData) {
      if (data.learningData.feedback) {
        for (const [path, stats] of Object.entries(data.learningData.feedback)) {
          this.pairingFeedback.set(path, stats);
        }
      }
      if (data.learningData.keywordWeights) {
        for (const [kw, weight] of Object.entries(data.learningData.keywordWeights)) {
          this.keywordWeights.set(kw, weight);
        }
      }
      if (data.learningData.corrections) {
        this.correctionHistory = data.learningData.corrections;
      }
    }

    // Persist imported data
    this.saveVerifiedPairings();
    this.saveLearningData();

    console.log('Data imported successfully');
  }

  /**
   * Generate accuracy report for all loaded questions
   */
  generateAccuracyReport() {
    const report = {
      totalQuestions: this.questions.size,
      questionsWithVerified: 0,
      questionsWithHighConfidence: 0,
      questionsWithMediumConfidence: 0,
      questionsWithLowConfidence: 0,
      questionsWithNoMatch: 0,
      averageConfidence: 0,
      averageImagesPerQuestion: 0,
      strategyUsage: {},
      lowConfidenceQuestions: [],
      totalConfidence: 0,
      totalImages: 0
    };

    for (const [id, question] of this.questions) {
      const images = this.findImagesForQuestion(question);

      if (images.length === 0) {
        report.questionsWithNoMatch++;
        report.lowConfidenceQuestions.push({ id, q: question.q, reason: 'No matches found' });
        continue;
      }

      const topConfidence = images[0].confidence;
      report.totalConfidence += topConfidence;
      report.totalImages += images.length;

      if (images[0].strategies.includes('verified')) {
        report.questionsWithVerified++;
      } else if (topConfidence >= this.CONFIDENCE.HIGH) {
        report.questionsWithHighConfidence++;
      } else if (topConfidence >= this.CONFIDENCE.MEDIUM) {
        report.questionsWithMediumConfidence++;
      } else {
        report.questionsWithLowConfidence++;
        report.lowConfidenceQuestions.push({
          id,
          q: question.q.substring(0, 80) + '...',
          confidence: topConfidence,
          topMatch: images[0].title
        });
      }

      // Track strategy usage
      for (const img of images) {
        for (const strategy of img.strategies) {
          report.strategyUsage[strategy] = (report.strategyUsage[strategy] || 0) + 1;
        }
      }
    }

    if (this.questions.size > 0) {
      report.averageConfidence = (report.totalConfidence / this.questions.size).toFixed(3);
      report.averageImagesPerQuestion = (report.totalImages / this.questions.size).toFixed(1);
    }

    return report;
  }

  /**
   * Validate image availability (check for broken images)
   */
  async validateImages() {
    const results = {
      total: 0,
      valid: 0,
      broken: [],
      formatDistribution: {}
    };

    for (const [category, images] of this.images) {
      for (const img of images) {
        results.total++;
        const path = `${this.imagePath}/smart-named/${category}/${img.file}`;

        // Track format distribution
        const ext = img.format || img.file.split('.').pop();
        results.formatDistribution[ext] = (results.formatDistribution[ext] || 0) + 1;

        // Check if image loads (in browser)
        try {
          const response = await fetch(path, { method: 'HEAD' });
          if (response.ok) {
            results.valid++;
          } else {
            results.broken.push({ path, status: response.status });
          }
        } catch (e) {
          results.broken.push({ path, error: e.message });
        }
      }
    }

    return results;
  }

  /**
   * Helper: Extract keywords from text
   */
  extractKeywords(text) {
    if (!text) return [];

    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'of', 'in', 'to',
      'for', 'with', 'on', 'at', 'by', 'from', 'as', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'under',
      'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
      'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also',
      'which', 'what', 'this', 'that', 'these', 'those', 'their', 'its',
      'true', 'false', 'following', 'would', 'most', 'each', 'every'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Helper: Get title from image path
   */
  getTitleFromPath(path) {
    const filename = path.split('/').pop();
    return filename
      .replace(/\.\w+$/, '')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Load questions from file
   */
  async loadQuestions(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      const data = await response.json();

      if (data.questions) {
        for (const q of data.questions) {
          this.questions.set(q.id, q);
        }
      }

      return data;
    } catch (e) {
      console.error(`Failed to load questions from ${jsonPath}:`, e);
      return null;
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScaffoldModuleAdvanced };
}
