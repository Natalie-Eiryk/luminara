/**
 * Analyze which images appear most frequently in pairings
 * and identify candidates for "universal" images
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'question-image-pairings.json'), 'utf-8'));

// Count how often each image appears in top matches
const imageCounts = {};
const imageHighConfidence = {};
const imageByModule = {};

for (const p of data.pairings) {
  const module = p.module;

  for (const img of p.images) {
    const imgPath = img.path;
    imageCounts[imgPath] = (imageCounts[imgPath] || 0) + 1;

    if (img.confidence === 'high') {
      imageHighConfidence[imgPath] = (imageHighConfidence[imgPath] || 0) + 1;
    }

    // Track which modules each image matches
    if (!imageByModule[imgPath]) {
      imageByModule[imgPath] = new Set();
    }
    imageByModule[imgPath].add(module);
  }
}

// Find images that match across MULTIPLE modules (universal)
console.log('Images Matching Across Multiple Modules (Universal Candidates):');
console.log('================================================================\n');

const crossModuleImages = Object.entries(imageByModule)
  .filter(([path, modules]) => modules.size >= 3)
  .map(([path, modules]) => ({
    path,
    moduleCount: modules.size,
    modules: Array.from(modules),
    totalMatches: imageCounts[path],
    highConfMatches: imageHighConfidence[path] || 0
  }))
  .sort((a, b) => b.moduleCount - a.moduleCount || b.totalMatches - a.totalMatches);

for (const img of crossModuleImages.slice(0, 30)) {
  console.log(`${img.moduleCount} modules, ${img.totalMatches} total (${img.highConfMatches} high): ${img.path}`);
  console.log(`   Modules: ${img.modules.join(', ')}`);
}

// Identify truly universal foundational images that SHOULD be included
console.log('\n\n=== RECOMMENDED UNIVERSAL IMAGES ===');
console.log('These should appear with every question as foundational context:\n');

const recommended = [
  { category: 'Nervous System Overview', images: [
    'general/Nervous_system_diagram-en.svg',
    '200-nerves/neuron.svg',
    '200-nerves/Neuron_complete_en.svg'
  ]},
  { category: 'Brain Overview', images: [
    '100-brain/meninges.svg',
    '100-brain/Brain_lateral_lobes.svg',
    '100-brain/Brain_medial_lobes_en.svg'
  ]},
  { category: 'Spinal Cord', images: [
    '200-nerves/Spinal_nerve.svg',
    '200-nerves/Gray770_spinal_cord.svg'
  ]},
  { category: 'Eye (Special Senses)', images: [
    '600-senses/eye-anatomy.svg',
    'smart-named/ophthalmology/eye_structure.svg'
  ]},
  { category: 'Ear (Special Senses)', images: [
    '600-senses/Cochlea_crosssection.svg',
    '600-senses/Osseous_labyrinth.svg'
  ]},
  { category: 'Endocrine', images: [
    '700-endocrine/Endocrine_English.svg',
    '100-brain/Hypothalamus_pituitary.svg'
  ]}
];

for (const cat of recommended) {
  console.log(`${cat.category}:`);
  for (const img of cat.images) {
    const count = imageCounts[img] || 0;
    const high = imageHighConfidence[img] || 0;
    console.log(`  - ${img} (${count} matches, ${high} high)`);
  }
  console.log();
}
