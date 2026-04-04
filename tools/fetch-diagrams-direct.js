#!/usr/bin/env node
/**
 * Direct Diagram Downloader for Ms. Luminara Quiz
 * Downloads SVG diagrams directly from Wikimedia Commons using known URLs
 *
 * Usage: node tools/fetch-diagrams-direct.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Direct URLs for known good SVG diagrams
const DIAGRAMS = {
  'brain-sagittal': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Brain_human_sagittal_section.svg',
    dest: '100-brain/brain-sagittal.svg'
  },
  'neuron': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Blausen_0657_MultipolarNeuron.png',
    dest: '200-nerves/neuron.png'
  },
  'neuron-svg': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Neuron.svg',
    dest: '200-nerves/neuron.svg'
  },
  'eye-anatomy': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Schematic_diagram_of_the_human_eye_en.svg',
    dest: '600-senses/eye-anatomy.svg'
  },
  'ear-anatomy': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Anatomy_of_the_Human_Ear_en.svg',
    dest: '600-senses/ear-anatomy.svg'
  },
  'meninges': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Meninges-en.svg',
    dest: '100-brain/meninges.svg'
  },
  'brain-lobes': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Cerebrum_lobes.svg',
    dest: '100-brain/brain-lobes.svg'
  },
  'spinal-cord': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Spinal_cord_segment.svg',
    dest: '200-nerves/spinal-cord-cross.svg'
  },
  'endocrine': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Endocrine_English.svg',
    dest: '700-endocrine/endocrine-system.svg'
  }
};

const DIAGRAMS_DIR = path.join(__dirname, '..', 'assets', 'diagrams');

/**
 * Download a file from URL with redirect following
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);

    const request = (urlStr) => {
      https.get(urlStr, {
        headers: {
          'User-Agent': 'MsLuminaraQuiz/1.0 (educational anatomy quiz)'
        }
      }, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          request(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };

    request(url);
  });
}

/**
 * Main
 */
async function main() {
  console.log('=== Ms. Luminara Direct Diagram Downloader ===\n');

  let success = 0, failed = 0, skipped = 0;

  for (const [name, info] of Object.entries(DIAGRAMS)) {
    const destPath = path.join(DIAGRAMS_DIR, info.dest);

    // Skip if exists
    if (fs.existsSync(destPath)) {
      console.log(`[SKIP] ${name} - already exists`);
      skipped++;
      continue;
    }

    console.log(`[FETCH] ${name}...`);
    console.log(`  URL: ${info.url}`);

    try {
      await downloadFile(info.url, destPath);
      console.log(`  Saved: ${info.dest}`);
      success++;
    } catch (e) {
      console.log(`  [ERROR] ${e.message}`);
      failed++;
    }

    // Longer delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n=== Summary ===');
  console.log(`Downloaded: ${success}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
