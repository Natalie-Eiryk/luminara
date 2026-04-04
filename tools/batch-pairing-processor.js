/**
 * Batch Pairing Processor
 * Extracts questions from all exam files and generates image pairings
 *
 * Run with: node tools/batch-pairing-processor.js
 */

const fs = require('fs');
const path = require('path');

// Base directory
const BASE_DIR = path.join(__dirname, '..');
const DIAGRAMS_DIR = path.join(BASE_DIR, 'assets', 'diagrams');
const OUTPUT_FILE = path.join(BASE_DIR, 'data', 'question-image-pairings.json');

// Ensure data directory exists
const dataDir = path.join(BASE_DIR, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ===== Ontology & Matching Logic (from 000.21-scaffold-module-advanced.js) =====

const ONTOLOGY = {
  // Eye anatomy
  'eye': {
    synonyms: ['ocular', 'ophthalmic', 'visual organ', 'eyeball'],
    parent: 'special senses',
    children: ['cornea', 'iris', 'pupil', 'lens', 'retina', 'optic nerve', 'sclera', 'choroid', 'vitreous', 'aqueous'],
    relatedImages: ['ophthalmology', 'eye_structure', 'eye_muscles', 'Eye_', 'eye-anatomy']
  },
  'retina': {
    synonyms: ['retinal'],
    parent: 'eye',
    children: ['photoreceptors', 'rods', 'cones', 'ganglion cells', 'bipolar cells', 'fovea', 'macula', 'optic disc'],
    relatedImages: ['ophthalmology', 'retina', 'Retina_', 'Retina-']
  },
  'photoreceptors': {
    synonyms: ['light receptors', 'photoreceptor'],
    parent: 'retina',
    children: ['rods', 'cones'],
    relatedImages: ['ophthalmology', 'photoreceptor', 'Cone_', 'Rod_', 'Color_Sensitivity']
  },
  'cones': {
    synonyms: ['cone cells', 'cone photoreceptors', 'cone'],
    parent: 'photoreceptors',
    children: ['s-cones', 'm-cones', 'l-cones'],
    properties: ['color vision', 'photopic', 'foveal', 'trichromatic'],
    relatedImages: ['ophthalmology', 'Cone_', 'color', 'trichromatic', 'Color_Sensitivity']
  },
  'rods': {
    synonyms: ['rod cells', 'rod photoreceptors', 'rod'],
    parent: 'photoreceptors',
    properties: ['night vision', 'scotopic', 'peripheral'],
    relatedImages: ['ophthalmology', 'rod', 'scotopic']
  },
  'cornea': {
    synonyms: ['corneal'],
    parent: 'eye',
    relatedImages: ['ophthalmology', 'eye_structure', 'cornea']
  },
  'lens': {
    synonyms: ['crystalline lens'],
    parent: 'eye',
    properties: ['accommodation', 'refraction'],
    relatedImages: ['ophthalmology', 'eye_structure', 'lens']
  },
  'optic nerve': {
    synonyms: ['cranial nerve II', 'CN II'],
    parent: 'eye',
    relatedImages: ['ophthalmology', 'optic', 'nerve']
  },

  // Ear anatomy
  'ear': {
    synonyms: ['auditory', 'otic', 'acoustic', 'hearing'],
    parent: 'special senses',
    children: ['outer ear', 'middle ear', 'inner ear'],
    relatedImages: ['ent', 'ear', 'auditory']
  },
  'inner ear': {
    synonyms: ['labyrinth', 'internal ear'],
    parent: 'ear',
    children: ['cochlea', 'vestibular system', 'semicircular canals'],
    relatedImages: ['ent', 'cochlea', 'labyrinth', 'vestibular', 'osseous_labyrinth']
  },
  'cochlea': {
    synonyms: ['cochlear'],
    parent: 'inner ear',
    children: ['organ of corti', 'hair cells', 'basilar membrane'],
    properties: ['hearing', 'tonotopic'],
    relatedImages: ['ent', 'cochlea', 'Cochlea']
  },
  'vestibular': {
    synonyms: ['vestibule', 'balance', 'equilibrium'],
    parent: 'inner ear',
    children: ['semicircular canals', 'utricle', 'saccule'],
    relatedImages: ['ent', 'vestibular', 'Vestibular', 'labyrinth']
  },
  'semicircular canals': {
    synonyms: ['semicircular ducts'],
    parent: 'vestibular',
    properties: ['angular acceleration', 'rotation'],
    relatedImages: ['ent', 'semicircular', 'labyrinth', 'vestibular']
  },

  // Nervous system
  'neuron': {
    synonyms: ['nerve cell', 'neural', 'neurone'],
    parent: 'nervous tissue',
    children: ['axon', 'dendrite', 'soma', 'synapse', 'myelin sheath'],
    relatedImages: ['neural-cells', 'nervous-system', 'Neuron', 'neuron', 'Complete_neuron']
  },
  'synapse': {
    synonyms: ['synaptic', 'junction', 'synaptic cleft'],
    parent: 'neuron',
    children: ['presynaptic', 'postsynaptic', 'neurotransmitter'],
    relatedImages: ['neural-cells', 'synapse', 'Synapse', 'Neuron_synapse']
  },
  'axon': {
    synonyms: ['nerve fiber'],
    parent: 'neuron',
    properties: ['action potential', 'conduction'],
    relatedImages: ['neural-cells', 'neuron', 'axon']
  },
  'myelin': {
    synonyms: ['myelin sheath', 'myelinated'],
    parent: 'neuron',
    properties: ['insulation', 'saltatory conduction'],
    relatedImages: ['neural-cells', 'neuron', 'myelin']
  },

  // Brain
  'brain': {
    synonyms: ['cerebrum', 'encephalon', 'cerebral'],
    parent: 'central nervous system',
    children: ['cerebral cortex', 'brainstem', 'cerebellum', 'diencephalon', 'limbic system'],
    relatedImages: ['100-brain', 'brain', 'Brain_', 'cerebral']
  },
  'brainstem': {
    synonyms: ['brain stem'],
    parent: 'brain',
    children: ['medulla', 'pons', 'midbrain'],
    relatedImages: ['100-brain', 'Brain_stem', 'brainstem', 'Midbrain']
  },
  'meninges': {
    synonyms: ['meningeal', 'dura', 'arachnoid', 'pia'],
    parent: 'brain',
    relatedImages: ['100-brain', 'Meninges', 'meninges']
  },
  'basal ganglia': {
    synonyms: ['basal nuclei'],
    parent: 'brain',
    children: ['striatum', 'globus pallidus', 'substantia nigra'],
    relatedImages: ['100-brain', 'Basal_ganglia', 'basal']
  },

  // Spinal cord
  'spinal cord': {
    synonyms: ['spinal', 'medulla spinalis'],
    parent: 'central nervous system',
    children: ['gray matter', 'white matter', 'dorsal horn', 'ventral horn'],
    relatedImages: ['200-nerves', 'spinal', 'Spinal_cord', 'spinal_cord']
  },
  'reflex': {
    synonyms: ['reflex arc', 'reflexive'],
    parent: 'spinal cord',
    relatedImages: ['200-nerves', 'reflex', 'Reflex', 'arc']
  },
  'brachial plexus': {
    synonyms: ['brachial'],
    parent: 'peripheral nervous system',
    relatedImages: ['200-nerves', 'Brachial', 'brachial', 'plexus']
  },

  // Endocrine
  'endocrine': {
    synonyms: ['hormone', 'hormonal', 'gland'],
    parent: 'systems',
    children: ['pituitary', 'thyroid', 'adrenal', 'pancreas', 'hypothalamus'],
    relatedImages: ['700-endocrine', 'endocrinology', 'Endocrine']
  },
  'pituitary': {
    synonyms: ['hypophysis', 'pituitary gland', 'master gland'],
    parent: 'endocrine',
    children: ['anterior pituitary', 'posterior pituitary'],
    relatedImages: ['700-endocrine', 'endocrinology', 'pituitary', 'Pituitary', 'Hypothalamus_Pituitary']
  },
  'thyroid': {
    synonyms: ['thyroid gland'],
    parent: 'endocrine',
    properties: ['T3', 'T4', 'metabolism'],
    relatedImages: ['700-endocrine', 'endocrinology', 'thyroid', 'Thyroid']
  },
  'adrenal': {
    synonyms: ['adrenal gland', 'suprarenal'],
    parent: 'endocrine',
    children: ['adrenal cortex', 'adrenal medulla'],
    relatedImages: ['700-endocrine', 'endocrinology', 'adrenal', 'Adrenal']
  },

  // ANS
  'autonomic': {
    synonyms: ['autonomic nervous system', 'ANS', 'visceral'],
    parent: 'nervous system',
    children: ['sympathetic', 'parasympathetic'],
    relatedImages: ['500-ans', 'nervous-system', 'autonomic', 'Autonomo']
  },
  'sympathetic': {
    synonyms: ['sympathetic nervous system', 'fight or flight'],
    parent: 'autonomic',
    relatedImages: ['500-ans', 'nervous-system', 'sympathetic']
  },
  'parasympathetic': {
    synonyms: ['parasympathetic nervous system', 'rest and digest'],
    parent: 'autonomic',
    relatedImages: ['500-ans', 'nervous-system', 'parasympathetic']
  },

  // Tissues
  'epithelium': {
    synonyms: ['epithelial', 'epithelial tissue'],
    parent: 'tissues',
    children: ['squamous', 'cuboidal', 'columnar', 'transitional'],
    relatedImages: ['400-tissues', 'epithelium', 'Epithelium', 'epithelial']
  },
  'gland': {
    synonyms: ['glandular', 'secretion'],
    parent: 'epithelium',
    children: ['exocrine', 'endocrine'],
    relatedImages: ['400-tissues', 'gland', 'Modes_of_Secretion']
  }
};

// Topic to folder/image mapping
const TOPIC_FOLDER_MAP = {
  'eye': ['ophthalmology', '600-senses'],
  'retina': ['ophthalmology', '600-senses'],
  'vision': ['ophthalmology', '600-senses'],
  'photoreceptor': ['ophthalmology', '600-senses'],
  'cone': ['ophthalmology', '600-senses'],
  'rod': ['ophthalmology', '600-senses'],
  'cornea': ['ophthalmology', '600-senses'],
  'lens': ['ophthalmology', '600-senses'],
  'ear': ['ent', '600-senses'],
  'cochlea': ['ent', '600-senses'],
  'vestibular': ['ent', '600-senses'],
  'hearing': ['ent', '600-senses'],
  'neuron': ['neural-cells', '200-nerves'],
  'synapse': ['neural-cells', '200-nerves'],
  'axon': ['neural-cells', '200-nerves'],
  'brain': ['100-brain'],
  'meninges': ['100-brain'],
  'brainstem': ['100-brain'],
  'spinal': ['200-nerves'],
  'reflex': ['200-nerves'],
  'plexus': ['200-nerves'],
  'endocrine': ['700-endocrine', 'endocrinology'],
  'pituitary': ['700-endocrine', 'endocrinology'],
  'thyroid': ['700-endocrine', 'endocrinology'],
  'adrenal': ['700-endocrine', 'endocrinology'],
  'autonomic': ['500-ans', 'nervous-system'],
  'sympathetic': ['500-ans', 'nervous-system'],
  'parasympathetic': ['500-ans', 'nervous-system'],
  'epithelium': ['400-tissues'],
  'tissue': ['400-tissues'],
  'gland': ['400-tissues']
};

// Format priority
const FORMAT_PRIORITY = { 'svg': 10, 'png': 7, 'jpg': 5, 'jpeg': 5, 'emf': 3, 'wmf': 2 };

// ===== Image Discovery =====

function discoverImages() {
  const images = [];

  function walkDir(dir, relPath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relFilePath = path.join(relPath, entry.name);

        if (entry.isDirectory()) {
          walkDir(fullPath, relFilePath);
        } else if (/\.(svg|png|jpg|jpeg|emf|wmf)$/i.test(entry.name)) {
          const ext = path.extname(entry.name).slice(1).toLowerCase();
          images.push({
            path: relFilePath.replace(/\\/g, '/'),
            name: entry.name,
            folder: relPath.replace(/\\/g, '/'),
            format: ext,
            formatScore: FORMAT_PRIORITY[ext] || 1
          });
        }
      }
    } catch (e) {
      console.error(`Error reading ${dir}:`, e.message);
    }
  }

  walkDir(DIAGRAMS_DIR);
  return images;
}

// ===== Question Extraction =====

function extractQuestionsFromHTML(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = [];
  const fileName = path.basename(filePath);
  const examModule = path.dirname(filePath).split(path.sep).pop();

  let qIndex = 0;
  const seenQuestions = new Set();

  // Pattern 1: q:'...' or q:"..." (unquoted key with quoted value)
  // This matches: {id:'1t1', type:'tf', pts:1, q:'The visual cortex...', ans:true}
  const pattern1 = /\bq\s*:\s*['"`]([^'"`]+(?:[^'"`\\]|\\.)*)['"`]/g;

  let match;
  while ((match = pattern1.exec(content)) !== null) {
    let questionText = match[1]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (questionText.length > 15 && !seenQuestions.has(questionText)) {
      seenQuestions.add(questionText);
      questions.push({
        id: `${examModule}_q${++qIndex}`,
        question: questionText,
        source: fileName,
        module: examModule
      });
    }
  }

  // Pattern 2: "q": "..." (JSON-style quoted key and value)
  const pattern2 = /["']q["']\s*:\s*["']([^"']+(?:[^"'\\]|\\.)*)["']/g;

  while ((match = pattern2.exec(content)) !== null) {
    let questionText = match[1]
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (questionText.length > 15 && !seenQuestions.has(questionText)) {
      seenQuestions.add(questionText);
      questions.push({
        id: `${examModule}_q${++qIndex}`,
        question: questionText,
        source: fileName,
        module: examModule
      });
    }
  }

  // Pattern 3: Long form content strings that might be questions
  // Match question-like text in opts arrays
  const pattern3 = /opts\s*:\s*\[\s*['"`]([^'"`]{20,})['"`]/g;

  while ((match = pattern3.exec(content)) !== null) {
    // Only include if it looks like a question (ends with ?)
    let text = match[1].replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.endsWith('?') && !seenQuestions.has(text)) {
      seenQuestions.add(text);
      questions.push({
        id: `${examModule}_q${++qIndex}`,
        question: text,
        source: fileName,
        module: examModule
      });
    }
  }

  return questions;
}

// ===== Matching Logic =====

function extractKeywords(text) {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  // Extract important medical/anatomical terms
  const keywords = new Set();
  const importantTerms = [
    'eye', 'retina', 'cornea', 'lens', 'iris', 'pupil', 'fovea', 'macula', 'optic',
    'cone', 'rod', 'photoreceptor', 'ganglion', 'bipolar', 'visual',
    'ear', 'cochlea', 'vestibular', 'semicircular', 'labyrinth', 'hair cell', 'auditory',
    'neuron', 'axon', 'dendrite', 'synapse', 'myelin', 'action potential',
    'brain', 'cortex', 'brainstem', 'cerebellum', 'meninges', 'thalamus', 'hypothalamus',
    'spinal', 'reflex', 'plexus', 'dorsal', 'ventral',
    'sympathetic', 'parasympathetic', 'autonomic',
    'pituitary', 'thyroid', 'adrenal', 'hormone', 'endocrine',
    'epithelium', 'tissue', 'gland', 'secretion'
  ];

  for (const term of importantTerms) {
    if (text.toLowerCase().includes(term)) {
      keywords.add(term);
    }
  }

  // Add any ontology terms found
  for (const [term, data] of Object.entries(ONTOLOGY)) {
    if (text.toLowerCase().includes(term)) {
      keywords.add(term);
      // Add children as well
      if (data.children) {
        for (const child of data.children) {
          if (text.toLowerCase().includes(child)) {
            keywords.add(child);
          }
        }
      }
    }
  }

  return Array.from(keywords);
}

function matchOntology(question, images) {
  const matches = [];
  const text = question.question.toLowerCase();

  for (const [term, data] of Object.entries(ONTOLOGY)) {
    if (text.includes(term) || (data.synonyms && data.synonyms.some(s => text.includes(s)))) {
      // Found ontology match - look for related images
      for (const image of images) {
        const imagePath = image.path.toLowerCase();
        const imageName = image.name.toLowerCase();

        // Check if image matches any relatedImages patterns
        if (data.relatedImages) {
          for (const pattern of data.relatedImages) {
            if (imagePath.includes(pattern.toLowerCase()) || imageName.includes(pattern.toLowerCase())) {
              matches.push({
                image,
                term,
                strategy: 'ontology',
                score: 0.8
              });
              break;
            }
          }
        }
      }
    }
  }

  return matches;
}

function matchKeyword(question, images) {
  const keywords = extractKeywords(question.question);
  const matches = [];

  for (const image of images) {
    const imagePath = image.path.toLowerCase();
    const imageName = image.name.toLowerCase();
    let matchCount = 0;
    const matchedKeywords = [];

    for (const keyword of keywords) {
      if (imagePath.includes(keyword) || imageName.includes(keyword)) {
        matchCount++;
        matchedKeywords.push(keyword);
      }

      // Check folder mapping
      const folders = TOPIC_FOLDER_MAP[keyword];
      if (folders) {
        for (const folder of folders) {
          if (imagePath.includes(folder.toLowerCase())) {
            matchCount += 0.5;
            matchedKeywords.push(`folder:${folder}`);
          }
        }
      }
    }

    if (matchCount > 0) {
      matches.push({
        image,
        keywords: matchedKeywords,
        strategy: 'keyword',
        score: Math.min(0.6, 0.2 + (matchCount * 0.15))
      });
    }
  }

  return matches;
}

function matchCategory(question, images) {
  const matches = [];
  const module = question.module;

  // Map module to image categories
  const moduleToCategory = {
    '100-brain': ['100-brain'],
    '200-nerves': ['200-nerves', 'neural-cells'],
    '400-tissues': ['400-tissues'],
    '500-ans': ['500-ans', 'nervous-system'],
    '600-special-senses': ['600-senses', 'ophthalmology', 'ent'],
    '700-endocrine': ['700-endocrine', 'endocrinology'],
    '800-lab-exam-prep-1': ['general']
  };

  const categories = moduleToCategory[module] || [];

  for (const image of images) {
    for (const cat of categories) {
      if (image.folder.toLowerCase().includes(cat.toLowerCase())) {
        matches.push({
          image,
          category: cat,
          strategy: 'category',
          score: 0.3
        });
        break;
      }
    }
  }

  return matches;
}

function findImagesForQuestion(question, images) {
  // Collect matches from all strategies
  const allMatches = [];

  // Ontology matching (highest weight after verified)
  allMatches.push(...matchOntology(question, images));

  // Keyword matching
  allMatches.push(...matchKeyword(question, images));

  // Category matching
  allMatches.push(...matchCategory(question, images));

  // Dedupe and aggregate scores by image
  const imageScores = new Map();

  for (const match of allMatches) {
    const key = match.image.path;
    if (!imageScores.has(key)) {
      imageScores.set(key, {
        image: match.image,
        totalScore: 0,
        strategies: [],
        details: []
      });
    }

    const entry = imageScores.get(key);
    entry.totalScore += match.score;
    if (!entry.strategies.includes(match.strategy)) {
      entry.strategies.push(match.strategy);
    }
    entry.details.push({
      strategy: match.strategy,
      score: match.score,
      ...(match.term && { term: match.term }),
      ...(match.keywords && { keywords: match.keywords }),
      ...(match.category && { category: match.category })
    });
  }

  // Sort by total score and format preference
  const results = Array.from(imageScores.values())
    .map(entry => ({
      path: entry.image.path,
      name: entry.image.name,
      folder: entry.image.folder,
      format: entry.image.format,
      score: Math.round(entry.totalScore * 100) / 100,
      confidence: entry.totalScore >= 0.7 ? 'high' : entry.totalScore >= 0.4 ? 'medium' : 'low',
      strategies: entry.strategies,
      strategyCount: entry.strategies.length,
      formatScore: entry.image.formatScore
    }))
    .sort((a, b) => {
      // Sort by score first, then by strategy count, then by format
      if (b.score !== a.score) return b.score - a.score;
      if (b.strategyCount !== a.strategyCount) return b.strategyCount - a.strategyCount;
      return b.formatScore - a.formatScore;
    })
    .slice(0, 10); // Top 10 matches

  return results;
}

// ===== Main Processing =====

function main() {
  console.log('=== Batch Question-Image Pairing Processor ===\n');

  // 1. Discover all images
  console.log('1. Discovering images...');
  const images = discoverImages();
  console.log(`   Found ${images.length} images\n`);

  // 2. Find all exam files
  console.log('2. Finding exam files...');
  const examDirs = ['100-brain', '200-nerves', '400-tissues', '500-ans', '600-special-senses', '700-endocrine', '800-lab-exam-prep-1'];
  const examFiles = [];

  for (const dir of examDirs) {
    const dirPath = path.join(BASE_DIR, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('_exam.html'));
      for (const file of files) {
        examFiles.push(path.join(dirPath, file));
      }
    }
  }
  console.log(`   Found ${examFiles.length} exam files\n`);

  // 3. Extract questions from each file
  console.log('3. Extracting questions...');
  const allQuestions = [];

  for (const file of examFiles) {
    console.log(`   Processing: ${path.basename(file)}`);
    const questions = extractQuestionsFromHTML(file);
    console.log(`     -> Found ${questions.length} questions`);
    allQuestions.push(...questions);
  }
  console.log(`   Total questions: ${allQuestions.length}\n`);

  // 4. Generate pairings for each question
  console.log('4. Generating pairings...');
  const pairings = [];
  let highConfidence = 0, mediumConfidence = 0, lowConfidence = 0, noMatch = 0;

  for (const question of allQuestions) {
    const matches = findImagesForQuestion(question, images);

    if (matches.length > 0) {
      if (matches[0].confidence === 'high') highConfidence++;
      else if (matches[0].confidence === 'medium') mediumConfidence++;
      else lowConfidence++;
    } else {
      noMatch++;
    }

    pairings.push({
      questionId: question.id,
      question: question.question.substring(0, 200) + (question.question.length > 200 ? '...' : ''),
      source: question.source,
      module: question.module,
      images: matches,
      matchCount: matches.length,
      topMatch: matches.length > 0 ? matches[0] : null
    });
  }

  console.log(`   High confidence: ${highConfidence}`);
  console.log(`   Medium confidence: ${mediumConfidence}`);
  console.log(`   Low confidence: ${lowConfidence}`);
  console.log(`   No matches: ${noMatch}\n`);

  // 5. Generate summary by module
  console.log('5. Summary by module:');
  const moduleStats = {};
  for (const p of pairings) {
    if (!moduleStats[p.module]) {
      moduleStats[p.module] = { total: 0, withImages: 0, avgMatches: 0 };
    }
    moduleStats[p.module].total++;
    if (p.matchCount > 0) {
      moduleStats[p.module].withImages++;
      moduleStats[p.module].avgMatches += p.matchCount;
    }
  }

  for (const [mod, stats] of Object.entries(moduleStats)) {
    stats.avgMatches = stats.withImages > 0 ? Math.round(stats.avgMatches / stats.withImages * 10) / 10 : 0;
    console.log(`   ${mod}: ${stats.total} questions, ${stats.withImages} with images (avg ${stats.avgMatches} matches)`);
  }

  // 6. Save results
  console.log('\n6. Saving results...');
  const output = {
    generated: new Date().toISOString(),
    totalQuestions: allQuestions.length,
    totalImages: images.length,
    stats: {
      highConfidence,
      mediumConfidence,
      lowConfidence,
      noMatch
    },
    moduleStats,
    pairings
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`   Saved to: ${OUTPUT_FILE}\n`);

  // 7. Also create a simplified version for the web app
  const simplifiedOutput = {
    generated: output.generated,
    pairings: {}
  };

  for (const p of pairings) {
    if (p.topMatch) {
      simplifiedOutput.pairings[p.questionId] = {
        images: p.images.slice(0, 5).map(img => ({
          path: img.path,
          score: img.score,
          confidence: img.confidence
        }))
      };
    }
  }

  const simplifiedFile = path.join(BASE_DIR, 'data', 'question-image-map.json');
  fs.writeFileSync(simplifiedFile, JSON.stringify(simplifiedOutput, null, 2));
  console.log(`   Simplified map saved to: ${simplifiedFile}`);

  console.log('\n=== Done! ===');
}

main();
