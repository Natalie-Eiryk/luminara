/**
 * Service Worker for Ms. Luminara's Quiz Lab
 * Network-first strategy - always fetch fresh on refresh, cache for offline only
 * Truly roguelike: every run starts fresh!
 */

const CACHE_NAME = 'luminara-quiz-v128';

// Core assets that MUST exist - installation fails if any are missing
const CRITICAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './820.31-core/820.31.0-styles.css',
  './820.31-core/820.31.97-event-handlers.js',
  './820.31-core/820.31.98-quiz-modes.js',
  './820.31-core/820.31.99-init.js',
  './820.31-core/820.31.1-app.js',
  './820.31-core/820.31.2-renderer.js',
  './820.31-core/820.31.3-gamification.js',
  './820.31-core/820.31.4-persistence.js',
  './820.31-core/820.31-question-registry.json'
];

// Optional assets - cache if available, don't fail if missing
const OPTIONAL_ASSETS = [
  './mobile.html',
  './quick-quiz.html',
  './820.31-core/820.31.0-mobile.css',
  './820.31-core/820.31.0-dev-panel.css',
  './820.31-core/820.31.1-game-modes.css',
  './820.31-core/820.31.2-utilities.css',
  './820.31-core/820.31.1.2-quiz-gauntlet.js',
  './820.31-core/820.31.1.3-quiz-map.js',
  './820.31-core/820.31.1.4-quiz-testprep.js',
  './820.31-core/820.31.2.2-renderer-inventory.js',
  './820.31-core/820.31.2.3-renderer-d20-ui.js',
  './820.31-core/820.31.5-achievements.js',
  './820.31-core/820.31.6-scaffolding.js',
  './820.31-core/820.31.7-d20-system.js',
  './820.31-core/820.31.8-loot-system.js',
  './820.31-core/820.31.10-isotope-engine.js',
  './820.31-core/820.31.11-zpd-system.js',
  './820.31-core/820.31.12-multimodal-questions.js',
  './820.31-core/820.31.13-lumi-bridge.js',
  './820.31-core/820.31.14-scaffold-remediation.js',
  './820.31-core/820.31.15-boss-system.js',
  './820.31-core/820.31.16-run-manager.js',
  './820.31-core/820.31.17-powerups.js',
  './820.31-core/820.31.18-high-scores.js',
  './820.31-core/820.31.19-battle-scene.js',
  './820.31-core/820.31.20-vocab-helper.js',
  './820.31-core/820.31.21-adaptive-engine.js',
  './820.31-core/820.31.25-question-orchestrator.js',
  './820.31-core/820.31.80-aaa-screen-effects.js',
  './820.31-core/820.31.81-aaa-sound-system.js',
  './820.31-core/820.31.82-metacognition-engine.js',
  './820.31-core/820.31.83-dynamic-backgrounds.js',
  './820.31-core/820.31.84-artistry-engine.js',
  './820.31-core/820.31.85-card-templates.js',
  './820.31-core/820.31.90-question-presenter.js',
  './820.31-core/820.31.91-topic-selector.js',
  './820.31-core/820.31.95-story-engine.js',
  './820.31-core/820.31.96-lesson-modal.js',
  './820.31-core/820.31.29-map-renderer.js',
  './820.31-core/820.31.38-path-follower.js'
];

// Combined list for backward compatibility
const STATIC_ASSETS = [...CRITICAL_ASSETS, ...OPTIONAL_ASSETS];

// Install event - cache static assets for offline use
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // Cache critical assets first - installation fails if any missing
        console.log('[SW] Caching critical assets...');
        await cache.addAll(CRITICAL_ASSETS);
        console.log('[SW] Critical assets cached');

        // Cache optional assets individually - don't fail on missing
        console.log('[SW] Caching optional assets...');
        const optionalResults = await Promise.allSettled(
          OPTIONAL_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn('[SW] Optional asset not cached:', url);
              return null;
            })
          )
        );
        const cached = optionalResults.filter(r => r.status === 'fulfilled').length;
        console.log(`[SW] Cached ${cached}/${OPTIONAL_ASSETS.length} optional assets`);
      })
      .then(() => {
        console.log('[SW] Install complete - taking over immediately');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Critical cache failed:', err);
      })
  );
});

// Activate event - clean up ALL old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Purging old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Activated - claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - NETWORK FIRST, cache only as fallback for offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Skip TTS server requests
  if (url.port === '5500') return;

  event.respondWith(
    // Always try network first - fresh files every time!
    fetch(event.request)
      .then((networkResponse) => {
        // Got fresh response from network
        if (networkResponse && networkResponse.status === 200) {
          // Update the cache with the fresh version
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed - we're offline, use cached version
        console.log('[SW] Offline - serving from cache:', event.request.url);
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // No cache either - return offline message for documents
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Offline - no cached version available', { status: 503 });
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache nuked from orbit');
    });
  }
});
