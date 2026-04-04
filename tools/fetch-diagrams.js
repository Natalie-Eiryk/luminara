#!/usr/bin/env node
/**
 * Diagram Fetcher for Ms. Luminara Quiz
 * Downloads SVG diagrams from Wikimedia Commons and saves them locally
 *
 * Usage: node tools/fetch-diagrams.js
 *
 * This script:
 * 1. Reads the diagram manifest
 * 2. Fetches each diagram from Wikimedia Commons
 * 3. Saves SVGs locally (or converts to WebP for raster images)
 * 4. Updates the manifest with local file status
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Wikimedia Commons API
const WIKI_API = 'https://commons.wikimedia.org/w/api.php';

// Paths
const MANIFEST_PATH = path.join(__dirname, '..', 'assets', 'diagrams', 'diagram-manifest.json');
const DIAGRAMS_DIR = path.join(__dirname, '..', 'assets', 'diagrams');

// Known good Wikimedia Commons files for anatomy
const WIKIMEDIA_FILES = {
  'brain-sagittal': 'File:Brain_human_sagittal_section.svg',
  'brain-lobes': 'File:LobesCaptsLateral.png', // Will convert to webp
  'neuron': 'File:Neuron.svg',
  'eye-anatomy': 'File:Schematic_diagram_of_the_human_eye_en.svg',
  'ear-anatomy': 'File:Anatomy_of_the_Human_Ear_en.svg',
  'spinal-cord-cross': 'File:Spinal_cord_segment.svg',
  'meninges': 'File:Meninges-en.svg',
  'endocrine-system': 'File:Endocrine_English.svg',
  'ans-diagram': 'File:The_Autonomic_Nervous_System.jpg' // Will convert to webp
};

// Alternative high-quality SVGs
const ALT_SVGS = {
  'brain-lobes': 'File:Brain_diagram_fr.svg',
  'brain-lateral': 'File:Gray728.svg',
  'brain-midsagittal': 'File:Gray720.png',
  'cranial-nerves': 'File:Brain_human_normal_inferior_view_with_labels_en.svg',
  'eye-muscles': 'File:Eyemuscles.png',
  'cochlea': 'File:Cochlea-crosssection.svg',
  'synapse': 'File:SynapseSchematic_en.svg',
  'action-potential': 'File:Action_potential.svg'
};

/**
 * Fetch image info from Wikimedia Commons API
 */
async function getImageInfo(filename) {
  const params = new URLSearchParams({
    action: 'query',
    titles: filename,
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    format: 'json',
    origin: '*'
  });

  return new Promise((resolve, reject) => {
    const url = `${WIKI_API}?${params}`;

    const options = {
      headers: {
        'User-Agent': 'MsLuminaraQuiz/1.0 (educational anatomy quiz; contact@example.com)',
        'Accept': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Handle API returning non-JSON (error pages)
          if (!data.startsWith('{')) {
            reject(new Error('API returned non-JSON response'));
            return;
          }

          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (!pages) {
            reject(new Error('No pages in response'));
            return;
          }

          const page = Object.values(pages)[0];
          if (page.imageinfo && page.imageinfo[0]) {
            resolve(page.imageinfo[0]);
          } else {
            reject(new Error(`No image info for ${filename}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download a file from URL
 */
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    const request = (urlStr) => {
      https.get(urlStr, (res) => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          request(res.headers.location);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(destPath);
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {}); // Delete partial file
        reject(err);
      });
    };

    request(url);
  });
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Main fetch function
 */
async function fetchDiagrams() {
  console.log('=== Ms. Luminara Diagram Fetcher ===\n');

  // Load manifest
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    console.log(`Loaded manifest with ${Object.keys(manifest.diagrams).length} diagrams\n`);
  } catch (e) {
    console.error('Failed to load manifest:', e.message);
    process.exit(1);
  }

  const results = { success: [], failed: [], skipped: [] };

  for (const [diagramId, wikiFile] of Object.entries(WIKIMEDIA_FILES)) {
    const diagramInfo = manifest.diagrams[diagramId];
    if (!diagramInfo) {
      console.log(`[SKIP] ${diagramId} - not in manifest`);
      results.skipped.push(diagramId);
      continue;
    }

    const destDir = path.join(DIAGRAMS_DIR, path.dirname(diagramInfo.file));
    const destFile = path.join(DIAGRAMS_DIR, diagramInfo.file);

    // Check if already exists
    if (fs.existsSync(destFile)) {
      console.log(`[EXISTS] ${diagramId} - ${diagramInfo.file}`);
      results.skipped.push(diagramId);
      continue;
    }

    console.log(`[FETCH] ${diagramId} from ${wikiFile}...`);

    try {
      // Get image info from Wikimedia
      const info = await getImageInfo(wikiFile);
      const imageUrl = info.url;
      const mime = info.mime;

      console.log(`  URL: ${imageUrl}`);
      console.log(`  Type: ${mime}`);

      // Ensure destination directory
      ensureDir(destDir);

      // Determine output filename based on type
      let outputFile = destFile;
      if (mime === 'image/svg+xml') {
        // Keep as SVG
        if (!outputFile.endsWith('.svg')) {
          outputFile = outputFile.replace(/\.[^.]+$/, '.svg');
        }
      } else if (mime === 'image/png' || mime === 'image/jpeg') {
        // For raster images, we'll save as-is for now
        // (WebP conversion would need additional tooling)
        const ext = mime === 'image/png' ? '.png' : '.jpg';
        outputFile = outputFile.replace(/\.[^.]+$/, ext);
      }

      // Download the file
      await downloadFile(imageUrl, outputFile);
      console.log(`  Saved: ${path.relative(DIAGRAMS_DIR, outputFile)}`);

      // Update manifest with actual file path
      manifest.diagrams[diagramId].file = path.relative(DIAGRAMS_DIR, outputFile).replace(/\\/g, '/');
      manifest.diagrams[diagramId].downloaded = new Date().toISOString();

      results.success.push(diagramId);

    } catch (e) {
      console.log(`  [ERROR] ${e.message}`);
      results.failed.push({ id: diagramId, error: e.message });
    }

    // Rate limiting - be nice to Wikimedia
    await new Promise(r => setTimeout(r, 500));
  }

  // Save updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('\nManifest updated.');

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed downloads:');
    results.failed.forEach(f => console.log(`  - ${f.id}: ${f.error}`));
  }
}

// Run
fetchDiagrams().catch(console.error);
