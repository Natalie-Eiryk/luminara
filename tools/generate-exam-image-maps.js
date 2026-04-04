/**
 * Generate questionImages mappings for exam files based on pairing data
 *
 * This reads the question-image-pairings.json and generates JavaScript code
 * that can be inserted into exam HTML files to display images with questions.
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const pairings = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data', 'question-image-pairings.json'), 'utf-8'));

// Group pairings by module and section
const moduleImages = {};

for (const p of pairings.pairings) {
  const module = p.module;

  if (!moduleImages[module]) {
    moduleImages[module] = {
      questions: [],
      sectionImages: {}
    };
  }

  // Get top 3 high-confidence images, preferring SVG format
  const topImages = p.images
    .filter(img => img.confidence === 'high' || img.confidence === 'medium')
    .sort((a, b) => {
      // Prefer high confidence
      if (a.confidence !== b.confidence) {
        return a.confidence === 'high' ? -1 : 1;
      }
      // Then prefer SVG
      if (a.format !== b.format) {
        if (a.format === 'svg') return -1;
        if (b.format === 'svg') return 1;
      }
      // Then by score
      return b.score - a.score;
    })
    .slice(0, 3);

  if (topImages.length > 0) {
    moduleImages[module].questions.push({
      id: p.questionId,
      question: p.question,
      images: topImages.map(img => ({
        file: img.path,
        title: formatTitle(img.name),
        confidence: img.confidence
      }))
    });
  }
}

function formatTitle(filename) {
  return filename
    .replace(/\.(svg|png|jpg|jpeg|emf)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\d+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Generate JavaScript code for each module
for (const [module, data] of Object.entries(moduleImages)) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`MODULE: ${module}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Questions with images: ${data.questions.length}`);

  // Group by extracting section from question context
  // For lab exam, we'll group all questions together

  console.log('\n// Add this to the exam HTML file:\n');
  console.log('const questionImages = {');

  // Group images by their categories/folders for section-based display
  const byFolder = {};
  for (const q of data.questions) {
    for (const img of q.images) {
      const folder = img.file.split('/')[0];
      if (!byFolder[folder]) {
        byFolder[folder] = new Set();
      }
      byFolder[folder].add(JSON.stringify(img));
    }
  }

  // Output section-based images (grouped by topic)
  const sections = {
    '100-brain': 'brain',
    '200-nerves': 'nerves',
    '400-tissues': 'tissues',
    'smart-named/ophthalmology': 'eye',
    'smart-named/ent': 'ear',
    'smart-named/neural-cells': 'neural',
    'smart-named/nervous-system': 'nervous-system',
    '600-senses': 'senses',
    '700-endocrine': 'endocrine',
    'general': 'general'
  };

  // Collect unique images per topic
  const topicImages = {};
  for (const q of data.questions) {
    // Detect topic from question content
    const qLower = q.question.toLowerCase();
    let topic = 'general';

    if (qLower.includes('neuron') || qLower.includes('axon') || qLower.includes('myelin') || qLower.includes('nerve')) {
      topic = 'nervous-tissue';
    } else if (qLower.includes('brain') || qLower.includes('cortex') || qLower.includes('lobe') || qLower.includes('ventricle') || qLower.includes('meninges')) {
      topic = 'brain';
    } else if (qLower.includes('spinal') || qLower.includes('dorsal') || qLower.includes('ventral')) {
      topic = 'spinal-cord';
    } else if (qLower.includes('eye') || qLower.includes('retina') || qLower.includes('cornea') || qLower.includes('lens') || qLower.includes('optic')) {
      topic = 'eye';
    } else if (qLower.includes('ear') || qLower.includes('cochlea') || qLower.includes('vestib') || qLower.includes('auditory') || qLower.includes('tympanic')) {
      topic = 'ear';
    } else if (qLower.includes('endocrine') || qLower.includes('hormone') || qLower.includes('pituitary') || qLower.includes('thyroid') || qLower.includes('adrenal')) {
      topic = 'endocrine';
    } else if (qLower.includes('tissue') || qLower.includes('epithelium') || qLower.includes('gland')) {
      topic = 'tissues';
    }

    if (!topicImages[topic]) {
      topicImages[topic] = new Map();
    }

    for (const img of q.images) {
      if (!topicImages[topic].has(img.file)) {
        topicImages[topic].set(img.file, img);
      }
    }
  }

  // Output
  for (const [topic, images] of Object.entries(topicImages)) {
    const imgArray = Array.from(images.values()).slice(0, 5);
    console.log(`  '${topic}': [`);
    for (const img of imgArray) {
      console.log(`    {file: '${img.file}', title: '${img.title}'},`);
    }
    console.log(`  ],`);
  }

  console.log('};');
}

// Also output a summary
console.log('\n\n=== SUMMARY ===');
for (const [module, data] of Object.entries(moduleImages)) {
  console.log(`${module}: ${data.questions.length} questions with image matches`);
}
