/**
 * ScaffoldModule - Independent Scaffolding System
 *
 * A modular system that manages:
 * - Questions and their scaffolds
 * - Medical images (SMART, Wikimedia, etc.)
 * - Intelligent pairing of questions to relevant images
 *
 * Can be used standalone or integrated with the main quiz system.
 *
 * Usage:
 *   const scaffold = new ScaffoldModule();
 *   await scaffold.init();
 *   const paired = scaffold.getQuestionWithImages('600.1.01');
 */

class ScaffoldModule {
  constructor(options = {}) {
    this.basePath = options.basePath || '.';
    this.imagePath = options.imagePath || '../assets/diagrams';

    // Loaded data stores
    this.questions = new Map();      // id -> question object
    this.scaffolds = new Map();      // questionId -> scaffolds array
    this.images = new Map();         // category -> images array
    this.topicIndex = new Map();     // topic keyword -> question ids
    this.imageIndex = new Map();     // topic keyword -> image files

    // Image sources with priorities
    this.imageSources = [
      { name: 'smart-named', path: 'smart-named', priority: 1 },
      { name: 'wikimedia-svg', path: '600-senses', priority: 2 },
      { name: 'wikimedia-svg', path: '612-physiology/612.81-nerves', priority: 2 },
      { name: 'wikimedia-svg', path: '612-physiology/612.82-brain', priority: 2 },
      { name: 'wikimedia-svg', path: '611-anatomy/611.018-tissues', priority: 2 },
      { name: 'wikimedia-svg', path: '612-physiology/612.4-endocrine', priority: 2 }
    ];

    // Topic-to-image keyword mapping for intelligent pairing
    this.topicImageMap = {
      // Eye/Vision
      'eye': ['ophthalmology', 'eye_structure', 'eye_muscles', 'retina', 'Eye_'],
      'retina': ['ophthalmology', 'retina', 'photoreceptor', 'Retina_'],
      'cone': ['ophthalmology', 'Cone_', 'photoreceptor', 'color'],
      'rod': ['ophthalmology', 'photoreceptor', 'retina'],
      'optic': ['ophthalmology', 'optic', 'eye_structure', 'Brain_'],
      'blind spot': ['ophthalmology', 'optic', 'eye_structure'],
      'lens': ['ophthalmology', 'eye_structure', 'accommodation'],
      'cornea': ['ophthalmology', 'eye_structure'],
      'pupil': ['ophthalmology', 'eye_structure', 'eye_muscles'],
      'iris': ['ophthalmology', 'eye_structure'],
      'vision': ['ophthalmology', 'eye_structure', 'Brain_', 'visual'],

      // Ear/Hearing
      'ear': ['ent', 'cochlea', 'vestibular', 'Cochlea', 'labyrinth'],
      'cochlea': ['ent', 'cochlea', 'Cochlea'],
      'vestibular': ['ent', 'vestibular', 'labyrinth', 'Vestibular'],
      'hearing': ['ent', 'cochlea', 'Cochlea'],
      'equilibrium': ['ent', 'vestibular', 'labyrinth'],
      'semicircular': ['ent', 'vestibular', 'labyrinth'],
      'hair cell': ['ent', 'cochlea', 'vestibular'],

      // Nervous System
      'neuron': ['neural-cells', 'nervous', 'Neuron', 'synapse'],
      'nerve': ['nervous-system', 'neural-cells', 'Spinal', 'nerve'],
      'synapse': ['neural-cells', 'synapse', 'Neuron'],
      'axon': ['neural-cells', 'Neuron', 'myelin'],
      'dendrite': ['neural-cells', 'Neuron'],
      'myelin': ['neural-cells', 'myelin', 'Myelin'],
      'spinal': ['nervous-system', 'Spinal', 'spinal'],
      'reflex': ['nervous-system', 'Reflex', 'spinal'],
      'autonomic': ['nervous-system', 'sympathetic', 'Autonomic'],
      'sympathetic': ['nervous-system', 'sympathetic'],
      'parasympathetic': ['nervous-system', 'sympathetic'],

      // Brain
      'brain': ['nervous-system', 'Brain_', 'cerebr', 'cortex'],
      'cortex': ['nervous-system', 'Brain_', 'cortex'],
      'thalamus': ['nervous-system', 'Thalamic', 'Brain_'],
      'hypothalamus': ['nervous-system', 'Hypothalamus', 'pituitary'],
      'brainstem': ['nervous-system', 'Brainstem', 'Pons', 'Medulla'],
      'cerebellum': ['nervous-system', 'Brain_', 'cerebellum'],

      // Endocrine
      'hormone': ['endocrinology', 'digestive-system', 'pancreas', 'Endocrine'],
      'pituitary': ['endocrinology', 'Hypothalamus', 'pituitary'],
      'thyroid': ['endocrinology', 'Thyroid'],
      'adrenal': ['endocrinology', 'Adrenal'],
      'pancreas': ['digestive-system', 'pancreas', 'Pancreas'],
      'insulin': ['digestive-system', 'pancreas', 'diabetes'],

      // Receptors
      'receptor': ['receptors-channels', 'receptor', 'Receptor'],
      'channel': ['receptors-channels', 'channel', 'ions'],
      'ion': ['receptors-channels', 'ions', 'channel'],

      // Muscles
      'muscle': ['muscles', 'muscular', 'contraction'],
      'contraction': ['muscles', 'muscular_contraction'],

      // Blood/Immune
      'blood': ['blood-immunology', 'hematopoiesis', 'blood'],
      'immune': ['blood-immunology', 'hematopoiesis']
    };
  }

  /**
   * Initialize the module by loading the image index
   */
  async init() {
    await this.loadImageIndex();
    console.log(`ScaffoldModule initialized with ${this.images.size} image categories`);
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
        this.images.set(category, images);

        // Build reverse index: keywords -> images
        for (const img of images) {
          const keywords = this.extractKeywords(img.title);
          for (const kw of keywords) {
            if (!this.imageIndex.has(kw)) {
              this.imageIndex.set(kw, []);
            }
            this.imageIndex.get(kw).push({
              category,
              ...img,
              fullPath: `smart-named/${category}/${img.file}`
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not load SMART index:', e);
    }
  }

  /**
   * Load questions from a JSON file
   */
  async loadQuestions(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      const data = await response.json();

      if (data.questions) {
        for (const q of data.questions) {
          this.questions.set(q.id, q);

          // Index by topic keywords
          const keywords = this.extractKeywords(q.q);
          for (const kw of keywords) {
            if (!this.topicIndex.has(kw)) {
              this.topicIndex.set(kw, []);
            }
            this.topicIndex.get(kw).push(q.id);
          }
        }
      }

      return data;
    } catch (e) {
      console.error(`Failed to load questions from ${jsonPath}:`, e);
      return null;
    }
  }

  /**
   * Load scaffolds for a specific question
   */
  async loadScaffolds(questionId) {
    const question = this.questions.get(questionId);
    if (!question || !question.scaffoldFile) return null;

    if (this.scaffolds.has(questionId)) {
      return this.scaffolds.get(questionId);
    }

    try {
      const response = await fetch(`${this.basePath}/${question.scaffoldFile}`);
      const data = await response.json();
      this.scaffolds.set(questionId, data.scaffolds || []);
      return data.scaffolds;
    } catch (e) {
      console.warn(`Could not load scaffolds for ${questionId}:`, e);
      return null;
    }
  }

  /**
   * Extract keywords from text for indexing/matching
   */
  extractKeywords(text) {
    if (!text) return [];

    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can',
      'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from',
      'as', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'again', 'further', 'then', 'once',
      'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either',
      'neither', 'not', 'only', 'own', 'same', 'than', 'too', 'very',
      'just', 'also', 'now', 'here', 'there', 'when', 'where', 'why',
      'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'any', 'true', 'false', 'which',
      'what', 'this', 'that', 'these', 'those', 'their', 'its', 'your'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 20); // Limit keywords
  }

  /**
   * Find relevant images for a question based on content analysis
   */
  findImagesForQuestion(question) {
    const text = typeof question === 'string'
      ? question
      : `${question.q || ''} ${question.explain || ''}`;

    const keywords = this.extractKeywords(text);
    const matches = new Map(); // imagePath -> score

    // Score images based on keyword matches
    for (const keyword of keywords) {
      // Check topic-image map for high-value matches
      for (const [topic, imageKeywords] of Object.entries(this.topicImageMap)) {
        if (keyword.includes(topic) || topic.includes(keyword)) {
          for (const imgKw of imageKeywords) {
            // Find images matching this keyword
            for (const [category, images] of this.images) {
              if (category.includes(imgKw.toLowerCase())) {
                for (const img of images) {
                  const path = `smart-named/${category}/${img.file}`;
                  matches.set(path, (matches.get(path) || 0) + 3);
                }
              }
              // Also check image titles
              for (const img of images) {
                if (img.title.toLowerCase().includes(imgKw.toLowerCase())) {
                  const path = `smart-named/${category}/${img.file}`;
                  matches.set(path, (matches.get(path) || 0) + 2);
                }
              }
            }
          }
        }
      }

      // Direct keyword matches in image index
      if (this.imageIndex.has(keyword)) {
        for (const img of this.imageIndex.get(keyword)) {
          matches.set(img.fullPath, (matches.get(img.fullPath) || 0) + 1);
        }
      }
    }

    // Sort by score and return top matches
    const sorted = [...matches.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return sorted.map(([path, score]) => {
      const parts = path.split('/');
      const category = parts[1];
      const file = parts[2];
      const images = this.images.get(category) || [];
      const imgData = images.find(i => i.file === file) || {};

      return {
        file: path,
        title: imgData.title || file.replace(/[_-]/g, ' ').replace(/\.\w+$/, ''),
        format: imgData.format || path.split('.').pop(),
        score,
        category
      };
    });
  }

  /**
   * Get a question with its matched images
   */
  getQuestionWithImages(questionId) {
    const question = this.questions.get(questionId);
    if (!question) return null;

    // Check for explicit images first
    let images = question.images || [];

    // If no explicit images, find matches
    if (images.length === 0) {
      images = this.findImagesForQuestion(question);
    }

    return {
      ...question,
      matchedImages: images
    };
  }

  /**
   * Get scaffolds with matched images
   */
  async getScaffoldsWithImages(questionId) {
    const scaffolds = await this.loadScaffolds(questionId);
    if (!scaffolds) return null;

    return scaffolds.map(scaffold => ({
      ...scaffold,
      matchedImages: this.findImagesForQuestion(scaffold)
    }));
  }

  /**
   * Get all images for a topic/category
   */
  getImagesByCategory(category) {
    return this.images.get(category) || [];
  }

  /**
   * Search images by keyword
   */
  searchImages(query) {
    const keywords = this.extractKeywords(query);
    const results = new Map();

    for (const kw of keywords) {
      if (this.imageIndex.has(kw)) {
        for (const img of this.imageIndex.get(kw)) {
          if (!results.has(img.fullPath)) {
            results.set(img.fullPath, { ...img, matchCount: 0 });
          }
          results.get(img.fullPath).matchCount++;
        }
      }
    }

    return [...results.values()]
      .sort((a, b) => b.matchCount - a.matchCount);
  }

  /**
   * Get statistics about loaded content
   */
  getStats() {
    return {
      questionsLoaded: this.questions.size,
      scaffoldsLoaded: this.scaffolds.size,
      imageCategories: this.images.size,
      totalImages: [...this.images.values()].reduce((sum, arr) => sum + arr.length, 0),
      indexedKeywords: this.imageIndex.size
    };
  }

  /**
   * Export question-image pairings for review/editing
   */
  exportPairings() {
    const pairings = [];

    for (const [id, question] of this.questions) {
      const images = this.findImagesForQuestion(question);
      pairings.push({
        questionId: id,
        questionText: question.q,
        suggestedImages: images.map(img => ({
          path: img.file,
          title: img.title,
          score: img.score
        }))
      });
    }

    return pairings;
  }
}

/**
 * ScaffoldImageManager - Handles image loading and display
 */
class ScaffoldImageManager {
  constructor(scaffoldModule, options = {}) {
    this.module = scaffoldModule;
    this.basePath = options.basePath || '../assets/diagrams';
    this.cache = new Map();
    this.preloadQueue = [];
  }

  /**
   * Build an image gallery HTML for a question
   */
  buildImageGallery(images, options = {}) {
    const { maxImages = 6, showScores = false } = options;

    if (!images || images.length === 0) {
      return '<div class="no-images">No reference images available</div>';
    }

    const displayImages = images.slice(0, maxImages);

    return `
      <div class="scaffold-image-gallery">
        ${displayImages.map(img => `
          <div class="scaffold-image-card" data-path="${img.file}">
            <div class="scaffold-image-preview">
              <img src="${this.basePath}/${img.file}"
                   alt="${img.title}"
                   loading="lazy"
                   onerror="this.parentElement.innerHTML='<span class=\\'img-error\\'>Unable to load</span>'">
            </div>
            <div class="scaffold-image-info">
              <span class="scaffold-image-title">${img.title}</span>
              <span class="scaffold-image-format">${img.format?.toUpperCase() || ''}</span>
              ${showScores ? `<span class="scaffold-image-score">Score: ${img.score}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Preload images for smoother experience
   */
  preloadImages(images) {
    for (const img of images) {
      if (!this.cache.has(img.file)) {
        const image = new Image();
        image.src = `${this.basePath}/${img.file}`;
        this.cache.set(img.file, image);
      }
    }
  }

  /**
   * Get CSS styles for the image gallery
   */
  static getStyles() {
    return `
      .scaffold-image-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
        padding: 12px;
      }

      .scaffold-image-card {
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(56,189,248,0.15);
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s;
      }

      .scaffold-image-card:hover {
        border-color: rgba(56,189,248,0.4);
        transform: translateY(-2px);
      }

      .scaffold-image-preview {
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.3);
        padding: 8px;
      }

      .scaffold-image-preview img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .scaffold-image-info {
        padding: 8px;
        font-size: 11px;
      }

      .scaffold-image-title {
        display: block;
        color: #e2ecf8;
        line-height: 1.3;
        margin-bottom: 4px;
      }

      .scaffold-image-format {
        color: #3d5169;
        font-family: monospace;
        font-size: 9px;
      }

      .scaffold-image-score {
        float: right;
        color: #f59e0b;
        font-size: 9px;
      }

      .img-error {
        color: #f87171;
        font-size: 10px;
      }

      .no-images {
        color: #3d5169;
        text-align: center;
        padding: 20px;
        font-style: italic;
      }
    `;
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScaffoldModule, ScaffoldImageManager };
}
