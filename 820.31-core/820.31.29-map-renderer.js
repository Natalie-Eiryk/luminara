/**
 * Ms. Luminara Quiz - Map Renderer
 * SVG-based visual display for Slay the Spire-style branching map
 *
 * @module MapRenderer
 * @version 1.0.0
 */

const MapRenderer = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  config: {
    nodeRadius: 28,
    nodeSpacing: { x: 160, y: 110 },  // More breathing room between nodes
    padding: { top: 120, bottom: 140, left: 80, right: 80 },
    lineWidth: 3,
    animationDuration: 300,
    // Organic wobble - nodes aren't perfectly aligned
    wobbleAmount: { x: 25, y: 15 }
  },

  // DOM elements
  container: null,
  svg: null,
  statusBar: null,

  // State
  currentMap: null,
  selectedNode: null,
  playerPosition: null,  // Node ID where player currently is

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize the map renderer
   * @param {string} containerId - ID of the container element
   */
  init(containerId = 'map-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('[MapRenderer] Container not found:', containerId);
      return false;
    }

    this.createStructure();
    return true;
  },

  /**
   * Create the basic DOM structure
   * SIMPLIFIED: Just an image with percentage-positioned dots overlay
   */
  createStructure() {
    this.container.innerHTML = `
      <div class="map-wrapper map-starfield">
        <!-- Tooltip for node hover preview -->
        <div class="map-tooltip" id="map-tooltip">
          <div class="tooltip-header">
            <span class="tooltip-icon"></span>
            <span class="tooltip-title"></span>
          </div>
          <div class="tooltip-description"></div>
          <div class="tooltip-rewards"></div>
        </div>

        <div class="map-header">
          <div class="act-title">
            <span class="act-number">ACT 1</span>
            <span class="act-name">Brain & CNS</span>
          </div>
          <div class="map-controls">
            <button class="map-btn map-btn-menu" title="Return to Menu">
              <span class="icon">☰</span>
            </button>
          </div>
        </div>

        <!-- SIMPLIFIED: Image with positioned dot overlay -->
        <div class="map-image-container" style="position: relative; width: 100%; height: calc(100% - 60px); display: flex; justify-content: center; align-items: center; background: #000000;">
          <div class="map-image-wrapper" style="position: relative; display: inline-block; max-width: 95%; max-height: 95%;">
            <img class="map-background-img" style="width: auto; height: calc(100vh - 120px); max-width: 100%; display: block;" />
            <div class="map-dots-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></div>
          </div>
        </div>

        <!-- QUARANTINED: Old SVG system kept for fallback -->
        <div class="map-scroll-container" style="display: none;">
          <svg class="map-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Starfield gradient background -->
              <linearGradient id="starfield-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#0a0a1a"/>
                <stop offset="30%" style="stop-color:#0d0d24"/>
                <stop offset="70%" style="stop-color:#101035"/>
                <stop offset="100%" style="stop-color:#0a0a1a"/>
              </linearGradient>

              <!-- Nebula glow overlay -->
              <radialGradient id="nebula-glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" style="stop-color:#2a1a4a;stop-opacity:0.3"/>
                <stop offset="50%" style="stop-color:#1a1a3a;stop-opacity:0.2"/>
                <stop offset="100%" style="stop-color:#0a0a1a;stop-opacity:0"/>
              </radialGradient>

              <!-- Star glow filter -->
              <filter id="star-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="1" result="blur"/>
                <feFlood flood-color="#ffffff" flood-opacity="0.8"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <!-- Glow filter for available nodes (cosmic gold) -->
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feFlood flood-color="#ffd700" flood-opacity="0.7"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <!-- Pulse animation for current node -->
              <filter id="node-pulse" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur"/>
                <feFlood flood-color="#00ffff" flood-opacity="0.8"/>
                <feComposite in2="blur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <!-- Cosmic shadow for nodes -->
              <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.6"/>
              </filter>

              <!-- Path gradient (constellation lines) -->
              <linearGradient id="path-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#4a6fa5;stop-opacity:0.6"/>
                <stop offset="100%" style="stop-color:#2a3f5f;stop-opacity:0.4"/>
              </linearGradient>

              <!-- Completed path (glowing blue) -->
              <linearGradient id="path-completed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.8"/>
                <stop offset="100%" style="stop-color:#00aaff;stop-opacity:0.6"/>
              </linearGradient>

              <!-- Locked path (dim starlight) -->
              <linearGradient id="path-locked" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3a3a5a;stop-opacity:0.25"/>
                <stop offset="100%" style="stop-color:#2a2a4a;stop-opacity:0.15"/>
              </linearGradient>

              <!-- Node fill patterns (cosmic orbs) -->
              <radialGradient id="node-fill-available" cx="30%" cy="30%" r="70%">
                <stop offset="0%" style="stop-color:#4a4a8a"/>
                <stop offset="50%" style="stop-color:#2a2a5a"/>
                <stop offset="100%" style="stop-color:#1a1a3a"/>
              </radialGradient>

              <radialGradient id="node-fill-completed" cx="30%" cy="30%" r="70%">
                <stop offset="0%" style="stop-color:#2a8a6a"/>
                <stop offset="50%" style="stop-color:#1a5a4a"/>
                <stop offset="100%" style="stop-color:#0a3a2a"/>
              </radialGradient>

              <radialGradient id="node-fill-locked" cx="30%" cy="30%" r="70%">
                <stop offset="0%" style="stop-color:#3a3a4a"/>
                <stop offset="100%" style="stop-color:#1a1a2a"/>
              </radialGradient>
            </defs>

            <!-- Starfield background -->
            <rect class="map-starfield-bg" width="100%" height="100%" fill="url(#starfield-gradient)"/>
            <rect class="map-nebula-overlay" width="100%" height="100%" fill="url(#nebula-glow)"/>

            <!-- Stars layer (rendered dynamically) -->
            <g class="map-stars"></g>

            <!-- Decorative border corners -->
            <g class="map-border-decorations"></g>

            <g class="map-paths"></g>
            <g class="map-nodes"></g>
            <g class="map-player"></g>
          </svg>
        </div>

        <div class="map-status-bar">
          <div class="status-hp">
            <span class="status-icon">❤️</span>
            <span class="status-value hp-current">80</span>
            <span class="status-divider">/</span>
            <span class="status-value hp-max">100</span>
          </div>

          <div class="status-potions">
            <div class="potion-slot filled" data-slot="0">🧪</div>
            <div class="potion-slot filled" data-slot="1">🧪</div>
            <div class="potion-slot empty" data-slot="2"></div>
          </div>

          <div class="status-gold">
            <span class="status-icon">💰</span>
            <span class="status-value gold-amount">45</span>
          </div>

          <div class="status-deck">
            <span class="status-icon">🃏</span>
            <span class="status-value deck-count">12</span>
          </div>
        </div>
      </div>
    `;

    this.svg = this.container.querySelector('.map-svg');
    this.statusBar = this.container.querySelector('.map-status-bar');

    // Event listeners
    this.container.querySelector('.map-btn-menu').addEventListener('click', () => {
      this.onMenuClick();
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Render a map
   * @param {Object} map - Map data from MapSystem.generateActMap()
   * @param {Object} runState - Current run state (HP, gold, potions, etc.)
   */
  // Fog of war state
  fogEnabled: true,
  revealedNodes: new Set(),

  render(map, runState = {}) {
    if (!this.svg) {
      console.warn('[MapRenderer] Not initialized');
      return;
    }

    this.currentMap = map;
    this.updateHeader(map, runState);

    // Check if we have an image-based map with coordinates
    const mapTheme = this.getMapTheme(map.actNumber);
    const useSimpleMode = mapTheme && mapTheme.image && (mapTheme.pathType === 'linear' || mapTheme.nodes);

    if (useSimpleMode) {
      // SIMPLE MODE: Just image + CSS positioned dots
      this.renderSimpleMap(map, mapTheme);
      this.updateStatusBar(runState);
      console.log('[MapRenderer] Simple mode: image + dots');
      return;
    }

    // FALLBACK: Old SVG system for starfield mode
    const svgContainer = this.container.querySelector('.map-scroll-container');
    const imgContainer = this.container.querySelector('.map-image-container');
    if (svgContainer) svgContainer.style.display = 'block';
    if (imgContainer) imgContainer.style.display = 'none';

    this.renderStarfield(map);
    this.renderPaths(map);
    this.renderNodes(map);
    this.updateStatusBar(runState);
    this.updateAvailableNodes();

    // Initialize PathFollower if available (replaces old ship system)
    if (typeof PathFollower !== 'undefined') {
      PathFollower.init(this);

      // Position character at start or current node
      if (this.playerPosition) {
        PathFollower.teleportTo(this.playerPosition);
      } else {
        PathFollower.positionAtStart(map);
      }

      // Hide the old ship system
      const playerGroup = this.svg.querySelector('.map-player');
      if (playerGroup) playerGroup.style.display = 'none';
    } else {
      // Fall back to old ship system
      if (!this.playerPosition) {
        this.renderShipAtStartZone(map);
      }
    }
  },

  /**
   * SIMPLE MODE: Render map as image with CSS-positioned dots
   * No SVG complexity - just percentages on an image
   */
  renderSimpleMap(map, mapTheme) {
    const imgContainer = this.container.querySelector('.map-image-container');
    const svgContainer = this.container.querySelector('.map-scroll-container');
    const img = this.container.querySelector('.map-background-img');
    const dotsOverlay = this.container.querySelector('.map-dots-overlay');

    // Show image container, hide SVG
    if (imgContainer) imgContainer.style.display = 'block';
    if (svgContainer) svgContainer.style.display = 'none';

    // Set the background image
    if (img && mapTheme.image) {
      img.src = mapTheme.image;
      img.alt = mapTheme.name;
    }

    // Clear and render dots
    if (dotsOverlay) {
      dotsOverlay.innerHTML = '';

      // Get coordinates
      let coordinates = [];
      if (mapTheme.pathType === 'linear' && mapTheme.path) {
        coordinates = mapTheme.path;
      } else if (mapTheme.nodes) {
        // Flatten branching nodes
        mapTheme.nodes.forEach((floor, fi) => {
          floor.forEach((node, ni) => {
            coordinates.push({ ...node, label: `${fi}-${ni}` });
          });
        });
      }

      // Track current player position (which node they're on)
      const currentNodeIndex = this.currentNodeIndex || 0;

      // Create dots at percentage positions with proper states
      coordinates.forEach((coord, index) => {
        const dot = document.createElement('div');
        dot.className = 'map-node-dot';
        dot.dataset.nodeIndex = index;

        // Determine node state for linear progression
        const isCompleted = index < currentNodeIndex;
        const isCurrent = index === currentNodeIndex;
        const isAvailable = index === currentNodeIndex; // Only current node is clickable
        const isLocked = index > currentNodeIndex;
        const isBoss = index === coordinates.length - 1;

        // Get node type for icon
        const node = this.getNodeByLinearIndex(index);
        const nodeType = node?.type || 'combat';

        // Node icons by type
        const nodeIcons = {
          'combat': '⚔️',
          'elite': '👹',
          'rest': '🏕️',
          'shop': '🛒',
          'treasure': '💎',
          'mystery': '❓',
          'boss': '👑',
          'start': '🚩'
        };
        const icon = index === 0 ? '🚩' : (isBoss ? '👑' : nodeIcons[nodeType] || '⚔️');

        // State-based styling
        let bgColor, borderColor, glowColor, opacity, cursor;
        if (isCompleted) {
          bgColor = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
          borderColor = '#4ade80';
          glowColor = 'rgba(34, 197, 94, 0.5)';
          opacity = '0.8';
          cursor = 'default';
        } else if (isCurrent) {
          bgColor = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
          borderColor = '#fcd34d';
          glowColor = 'rgba(251, 191, 36, 0.7)';
          opacity = '1';
          cursor = 'pointer';
        } else if (isLocked) {
          bgColor = 'linear-gradient(135deg, #374151 0%, #1f2937 100%)';
          borderColor = '#4b5563';
          glowColor = 'none';
          opacity = '0.5';
          cursor = 'not-allowed';
        }

        // Boss node special styling
        if (isBoss && !isCompleted) {
          if (isCurrent) {
            bgColor = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
            borderColor = '#f87171';
            glowColor = 'rgba(220, 38, 38, 0.7)';
          } else {
            bgColor = 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)';
            borderColor = '#991b1b';
          }
        }

        dot.style.cssText = `
          position: absolute;
          left: ${coord.x}%;
          top: ${coord.y}%;
          transform: translate(-50%, -50%);
          width: ${isBoss ? '48px' : '40px'};
          height: ${isBoss ? '48px' : '40px'};
          background: ${bgColor};
          border: 3px solid ${borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isBoss ? '22px' : '18px'};
          color: white;
          text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
          box-shadow: ${glowColor !== 'none' ? `0 0 15px ${glowColor}, 0 4px 8px rgba(0,0,0,0.3)` : '0 2px 4px rgba(0,0,0,0.3)'};
          opacity: ${opacity};
          cursor: ${cursor};
          pointer-events: ${isAvailable ? 'auto' : 'none'};
          transition: all 0.3s ease;
          z-index: ${isCurrent ? 10 : (isBoss ? 5 : 1)};
        `;
        dot.innerHTML = isCompleted ? '✓' : icon;
        dot.title = isLocked ? `Node ${index + 1} (Locked)` :
                    isCompleted ? `Node ${index + 1} (Completed)` :
                    `Node ${index + 1}: ${nodeType}`;

        // Add pulsing animation for current node
        if (isCurrent) {
          dot.style.animation = 'nodePulse 2s ease-in-out infinite';
        }

        // Add click handler only for available nodes
        if (isAvailable) {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`[MapRenderer] Clicked node #${index}`);

            const nodeObj = this.getNodeByLinearIndex(index);
            if (nodeObj && this.onNodeSelect) {
              console.log(`[MapRenderer] Selecting node:`, nodeObj.id, nodeObj.type);
              this.onNodeSelect(nodeObj);
            }
          });

          // Hover effect
          dot.addEventListener('mouseenter', () => {
            dot.style.transform = 'translate(-50%, -50%) scale(1.15)';
            dot.style.boxShadow = `0 0 25px ${glowColor}, 0 6px 12px rgba(0,0,0,0.4)`;
          });
          dot.addEventListener('mouseleave', () => {
            dot.style.transform = 'translate(-50%, -50%)';
            dot.style.boxShadow = `0 0 15px ${glowColor}, 0 4px 8px rgba(0,0,0,0.3)`;
          });
        }

        dotsOverlay.appendChild(dot);
      });

      // Add CSS animation if not already present
      if (!document.getElementById('map-node-animations')) {
        const style = document.createElement('style');
        style.id = 'map-node-animations';
        style.textContent = `
          @keyframes nodePulse {
            0%, 100% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.7), 0 4px 8px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.9), 0 6px 12px rgba(0,0,0,0.4); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  },

  /**
   * Look up a node object by its linear index (for simple dots mode)
   * Uses this.currentMap (set in render()) to find the actual node with id, type, etc.
   * @param {number} index - Linear index (0, 1, 2, ...)
   * @returns {Object|null} Node object or null if not found
   */
  getNodeByLinearIndex(index) {
    // Use the map that was passed to render() and stored locally
    // This avoids race conditions with MapSystem.currentMap
    const map = this.currentMap;
    console.log('[MapRenderer] getNodeByLinearIndex called, index:', index, 'map:', map ? 'exists' : 'NULL');

    if (!map) {
      console.warn('[MapRenderer] No current map available');
      return null;
    }

    console.log('[MapRenderer] map.pathType:', map.pathType, 'floors:', map.floors?.length);

    // For linear maps, each floor has exactly 1 node
    if (map.pathType === 'linear') {
      if (index >= 0 && index < map.floors.length) {
        const node = map.floors[index].nodes[0];
        console.log('[MapRenderer] Found linear node:', node);
        return node;
      }
      console.warn('[MapRenderer] Index out of bounds:', index, 'floors:', map.floors.length);
      return null;
    }

    // For branching maps, flatten and find by index
    let currentIndex = 0;
    for (const floor of map.floors) {
      for (const node of floor.nodes) {
        if (currentIndex === index) {
          return node;
        }
        currentIndex++;
      }
    }

    return null;
  },

  /**
   * Render starfield background with twinkling stars
   */
  renderStarfield(map) {
    const starsGroup = this.svg.querySelector('.map-stars');
    if (!starsGroup) return;
    starsGroup.innerHTML = '';

    // Get dimensions - prefer image dimensions if available
    const mapTheme = this.getMapTheme(map.actNumber);
    let width, height;
    if (mapTheme && mapTheme.imageDimensions) {
      width = mapTheme.imageDimensions.width;
      height = mapTheme.imageDimensions.height;
    } else {
      const dims = this.calculateMapDimensions(map);
      width = dims.width;
      height = dims.height;
    }

    // Generate stars based on map dimensions
    const starCount = Math.floor((width * height) / 2000); // Density
    const seed = this.hashString(map.categoryId || 'default');

    for (let i = 0; i < starCount; i++) {
      // Deterministic pseudo-random positions
      const starSeed = seed + i * 7919;
      const x = ((starSeed * 13) % 10000) / 10000 * width;
      const y = ((starSeed * 17) % 10000) / 10000 * height;
      const size = 0.5 + ((starSeed * 23) % 100) / 100 * 1.5;
      const brightness = 0.3 + ((starSeed * 31) % 100) / 100 * 0.7;

      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', x);
      star.setAttribute('cy', y);
      star.setAttribute('r', size);
      star.setAttribute('fill', '#ffffff');
      star.setAttribute('opacity', brightness);

      // Add twinkle animation to some stars
      if (i % 7 === 0) {
        star.setAttribute('class', 'star-twinkle');
      }

      starsGroup.appendChild(star);
    }

    // Add a few colored accent stars (blue/gold)
    for (let i = 0; i < Math.floor(starCount / 15); i++) {
      const starSeed = seed + i * 3571 + 1000;
      const x = ((starSeed * 13) % 10000) / 10000 * width;
      const y = ((starSeed * 17) % 10000) / 10000 * height;
      const isGold = i % 3 === 0;

      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', x);
      star.setAttribute('cy', y);
      star.setAttribute('r', 1.5);
      star.setAttribute('fill', isGold ? '#ffd700' : '#87ceeb');
      star.setAttribute('opacity', '0.6');
      star.setAttribute('class', 'star-twinkle');
      star.setAttribute('filter', 'url(#star-glow)');

      starsGroup.appendChild(star);
    }
  },

  /**
   * Reveal a node (kept for compatibility but not used in starfield mode)
   */
  revealNode(nodeId) {
    this.revealedNodes.add(nodeId);
  },

  /**
   * Reset revealed nodes for new run
   */
  resetFog() {
    this.revealedNodes.clear();
  },

  /**
   * Toggle fog (kept for compatibility)
   */
  toggleFog(enabled) {
    this.fogEnabled = enabled;
  },

  /**
   * Update the act header
   */
  updateHeader(map, runState) {
    const actTitle = this.container.querySelector('.act-title');
    if (actTitle) {
      actTitle.querySelector('.act-number').textContent = `ACT ${map.actNumber}`;

      // Get category name from registry if available
      let categoryName = map.categoryId;
      if (typeof QuestionRegistry !== 'undefined') {
        const category = QuestionRegistry.categories.find(c => c.id === map.categoryId);
        if (category) categoryName = category.name;
      }
      actTitle.querySelector('.act-name').textContent = categoryName;
    }

    // Update map background theme based on act
    this.updateMapTheme(map.actNumber);
  },

  /**
   * Update map background theme based on act number
   * Uses CardTemplates.maps registry for centralized asset management
   */
  updateMapTheme(actNumber) {
    const wrapper = this.container.querySelector('.map-wrapper');
    if (!wrapper) return;

    // Get theme from centralized registry
    let theme = null;
    if (typeof CardTemplates !== 'undefined' && CardTemplates.getMapForAct) {
      theme = CardTemplates.getMapForAct(actNumber);
    }

    // Check if we're using simple mode (image + dots)
    const useSimpleMode = theme && theme.image && (theme.pathType === 'linear' || theme.nodes);

    if (useSimpleMode) {
      // SIMPLE MODE: No background on wrapper - the <img> element handles it
      wrapper.style.backgroundImage = 'none';
      wrapper.style.backgroundColor = '#000000';
      wrapper.classList.remove('map-starfield', 'map-parchment', 'map-image-bg');

      // Also set the container background to black
      const imgContainer = wrapper.querySelector('.map-image-container');
      if (imgContainer) {
        imgContainer.style.backgroundColor = '#000000';
      }
      return;
    }

    // Get the SVG background elements that need to be hidden for image mode
    const starfieldBg = this.svg?.querySelector('.map-starfield-bg');
    const nebulaOverlay = this.svg?.querySelector('.map-nebula-overlay');
    const starsGroup = this.svg?.querySelector('.map-stars');

    if (theme && theme.image) {
      // Use image background
      wrapper.classList.remove('map-starfield', 'map-parchment');
      wrapper.classList.add('map-image-bg');
      wrapper.style.backgroundImage = `url('${theme.image}')`;
      wrapper.style.backgroundSize = 'cover';
      wrapper.style.backgroundPosition = 'center';
      wrapper.style.backgroundRepeat = 'no-repeat';

      // CRITICAL: Hide the SVG starfield elements so the image shows through
      if (starfieldBg) starfieldBg.style.display = 'none';
      if (nebulaOverlay) nebulaOverlay.style.display = 'none';
      if (starsGroup) starsGroup.style.display = 'none';

      // Update act title styling for image maps
      const actTitle = this.container.querySelector('.act-title');
      if (actTitle && theme.colors) {
        actTitle.style.setProperty('--map-text-color', theme.colors.text);
        actTitle.style.setProperty('--map-accent-color', theme.colors.accent);
      }

      console.log(`[MapRenderer] Applied image theme: ${theme.name} for Act ${actNumber}`);
    } else if (theme && theme.cssClass) {
      // Use CSS class fallback (starfield, parchment)
      wrapper.classList.remove('map-image-bg');
      wrapper.style.backgroundImage = '';
      wrapper.classList.add(theme.cssClass);

      // Show the SVG starfield elements for CSS mode
      if (starfieldBg) starfieldBg.style.display = '';
      if (nebulaOverlay) nebulaOverlay.style.display = '';
      if (starsGroup) starsGroup.style.display = '';

      console.log(`[MapRenderer] Applied CSS theme: ${theme.cssClass} for Act ${actNumber}`);
    }
  },

  /**
   * Render connection paths between nodes
   * Uses actual image dimensions from CardTemplates for proper coordinate alignment
   */
  renderPaths(map) {
    const pathsGroup = this.svg.querySelector('.map-paths');
    pathsGroup.innerHTML = '';

    // Get map dimensions - prefer actual image dimensions for image-based maps
    const mapTheme = this.getMapTheme(map.actNumber);
    let width, height;

    if (mapTheme && mapTheme.imageDimensions) {
      // Use actual image dimensions for accurate coordinate mapping
      width = mapTheme.imageDimensions.width;
      height = mapTheme.imageDimensions.height;
      console.log(`[MapRenderer] Using image dimensions: ${width}x${height}`);
    } else {
      // Fall back to calculated grid dimensions
      const dims = this.calculateMapDimensions(map);
      width = dims.width;
      height = dims.height;
      console.log(`[MapRenderer] Using calculated dimensions: ${width}x${height}`);
    }

    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // QUARANTINED: Hide paths in debug mode (image-based maps with coordinates)
    const debugMode = mapTheme && (mapTheme.pathType === 'linear' || mapTheme.nodes);

    if (debugMode) {
      // Don't draw paths in debug mode - just show the pink dots
      console.log('[MapRenderer] Debug mode: paths hidden');
      return;
    }

    // Draw paths for each connection (only for fallback starfield mode)
    for (const floor of map.floors) {
      for (const node of floor.nodes) {
        const startPos = this.getNodePosition(node, map);

        for (const targetId of node.connections) {
          const targetNode = MapSystem.getNode(targetId);
          if (!targetNode) continue;

          const endPos = this.getNodePosition(targetNode, map);
          const pathElement = this.createPath(startPos, endPos, node, targetNode);
          pathsGroup.appendChild(pathElement);
        }
      }
    }
  },

  /**
   * Create a curved path between two nodes (constellation lines)
   * Cosmic theme: subtle glowing connections between star-nodes
   */
  createPath(start, end, fromNode, toNode) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'path-group');
    group.setAttribute('data-from', fromNode.id);
    group.setAttribute('data-to', toNode.id);

    // Use deterministic randomness based on node IDs for consistent paths
    const seed = this.hashString(fromNode.id + toNode.id);

    // Calculate horizontal distance
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Gentle curves for constellation feel
    const curveFactor = Math.abs(dx) / (distance || 1);
    const curveStrength = 10 + curveFactor * 20;

    const wobbleDir = ((seed % 2) === 0) ? 1 : -1;
    const wobbleAmount = ((seed % 50) / 50) * curveStrength * wobbleDir;

    const ctrl1X = start.x + dx * 0.3 + wobbleAmount;
    const ctrl1Y = start.y + dy * 0.3;
    const ctrl2X = start.x + dx * 0.7 - wobbleAmount * 0.5;
    const ctrl2Y = start.y + dy * 0.7;

    const d = `M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`;

    // Main path (constellation line)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');

    // Style based on completion status
    if (fromNode.completed && toNode.completed) {
      // Completed: glowing cyan
      path.setAttribute('stroke', '#00ffff');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('opacity', '0.7');
      path.classList.add('path-completed');
    } else if (fromNode.completed || this.isStartNode(fromNode.id)) {
      // Available: golden glow
      path.setAttribute('stroke', '#ffd700');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('opacity', '0.5');
      path.classList.add('path-available');
    } else {
      // Locked: dim starlight
      path.setAttribute('stroke', '#4a4a6a');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('opacity', '0.3');
      path.setAttribute('stroke-dasharray', '4 6');
      path.classList.add('path-locked');
    }

    group.appendChild(path);

    // Add pulsing dots for available paths (traveling light effect)
    if ((fromNode.completed || this.isStartNode(fromNode.id)) && !toNode.completed) {
      const dots = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dots.setAttribute('d', d);
      dots.setAttribute('fill', 'none');
      dots.setAttribute('stroke', '#ffd700');
      dots.setAttribute('stroke-width', '3');
      dots.setAttribute('stroke-linecap', 'round');
      dots.setAttribute('stroke-dasharray', '2 16');
      dots.setAttribute('opacity', '0.8');
      dots.setAttribute('class', 'path-dots constellation-pulse');
      group.appendChild(dots);
    }

    return group;
  },

  /**
   * Render all nodes
   * QUARANTINED: Old node system disabled - using debug dots instead
   */
  renderNodes(map) {
    const nodesGroup = this.svg.querySelector('.map-nodes');
    nodesGroup.innerHTML = '';

    // Check if we should use debug mode (pink dots) for coordinate verification
    const mapTheme = this.getMapTheme(map.actNumber);
    const useDebugDots = mapTheme && (mapTheme.pathType === 'linear' || mapTheme.nodes);

    if (useDebugDots) {
      // RENDER DEBUG DOTS - bright pink with position numbers
      this.renderDebugDots(map, nodesGroup);
    } else {
      // QUARANTINED: Original node rendering (only for fallback starfield mode)
      // for (const floor of map.floors) {
      //   for (const node of floor.nodes) {
      //     const nodeElement = this.createNode(node, map);
      //     nodesGroup.appendChild(nodeElement);
      //   }
      // }
    }
  },

  /**
   * Render bright pink debug dots at coordinate positions
   * Shows position number for easy verification against coordinate picker
   */
  renderDebugDots(map, nodesGroup) {
    const mapTheme = this.getMapTheme(map.actNumber);
    if (!mapTheme) return;

    // Get the path coordinates
    let coordinates = [];
    if (mapTheme.pathType === 'linear' && mapTheme.path) {
      coordinates = mapTheme.path;
    } else if (mapTheme.nodes) {
      // Flatten branching nodes for debug view
      mapTheme.nodes.forEach((floor, floorIdx) => {
        floor.forEach((node, nodeIdx) => {
          coordinates.push({ ...node, label: `F${floorIdx}N${nodeIdx}` });
        });
      });
    }

    coordinates.forEach((coord, index) => {
      const pos = this.convertPercentToSVG(coord, map);

      // Create debug dot group
      const dotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      dotGroup.setAttribute('class', 'debug-dot');
      dotGroup.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

      // Bright pink outer glow
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('r', '25');
      glow.setAttribute('fill', 'rgba(255, 20, 147, 0.3)');
      dotGroup.appendChild(glow);

      // Bright pink dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '18');
      dot.setAttribute('fill', '#FF1493');  // Deep pink
      dot.setAttribute('stroke', '#FF69B4'); // Hot pink border
      dot.setAttribute('stroke-width', '3');
      dotGroup.appendChild(dot);

      // Position number (white text)
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'central');
      label.setAttribute('font-size', '14');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('fill', '#FFFFFF');
      label.setAttribute('stroke', '#000000');
      label.setAttribute('stroke-width', '0.5');
      label.textContent = coord.label || index.toString();
      dotGroup.appendChild(label);

      // Add coordinate tooltip on hover
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `#${index}: (${coord.x}%, ${coord.y}%) → (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})px`;
      dotGroup.appendChild(title);

      nodesGroup.appendChild(dotGroup);

      console.log(`[Debug] Dot #${index}: (${coord.x}%, ${coord.y}%) → SVG (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`);
    });
  },

  /**
   * Create a node element (cosmic/constellation style)
   */
  createNode(node, map) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const pos = this.getNodePosition(node, map);
    const nodeType = MapSystem.NODE_TYPES[node.type];
    const isAvailable = this.isNodeAvailable(node.id);
    const isCurrent = this.playerPosition === node.id;

    group.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    group.setAttribute('class', `map-node node-${node.type}`);
    group.setAttribute('data-node-id', node.id);

    // Outer glow ring for cosmic effect
    const outerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outerGlow.setAttribute('r', this.config.nodeRadius + 8);
    outerGlow.setAttribute('class', 'node-outer-glow');
    outerGlow.setAttribute('fill', 'none');
    outerGlow.setAttribute('stroke', isCurrent ? '#00ffff' : isAvailable ? '#ffd700' : '#4a4a6a');
    outerGlow.setAttribute('stroke-width', '1');
    outerGlow.setAttribute('opacity', isCurrent ? '0.8' : isAvailable ? '0.5' : '0.2');
    group.appendChild(outerGlow);

    // Background circle (cosmic orb)
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bg.setAttribute('r', this.config.nodeRadius);
    bg.setAttribute('class', 'node-bg');
    bg.setAttribute('filter', 'url(#node-shadow)');

    // Set state classes and fills
    if (node.completed) {
      group.classList.add('node-completed');
      bg.setAttribute('fill', 'url(#node-fill-completed)');
      bg.setAttribute('stroke', '#00ffaa');
      bg.setAttribute('stroke-width', '2');
    } else if (isCurrent) {
      group.classList.add('node-current');
      bg.setAttribute('fill', 'url(#node-fill-available)');
      bg.setAttribute('filter', 'url(#node-pulse)');
      bg.setAttribute('stroke', '#00ffff');
      bg.setAttribute('stroke-width', '3');
    } else if (isAvailable) {
      group.classList.add('node-available');
      bg.setAttribute('fill', 'url(#node-fill-available)');
      bg.setAttribute('filter', 'url(#node-glow)');
      bg.setAttribute('stroke', '#ffd700');
      bg.setAttribute('stroke-width', '2');
    } else {
      group.classList.add('node-locked');
      bg.setAttribute('fill', 'url(#node-fill-locked)');
      bg.setAttribute('stroke', '#3a3a5a');
      bg.setAttribute('stroke-width', '1');
    }

    group.appendChild(bg);

    // Inner light effect
    const innerLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerLight.setAttribute('r', this.config.nodeRadius - 8);
    innerLight.setAttribute('class', 'node-inner-light');
    innerLight.setAttribute('fill', node.completed ? '#00ffaa' : isCurrent ? '#00ffff' : isAvailable ? '#ffd700' : '#5a5a7a');
    innerLight.setAttribute('opacity', node.completed ? '0.2' : isCurrent ? '0.3' : isAvailable ? '0.2' : '0.1');
    group.appendChild(innerLight);

    // Icon
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    icon.setAttribute('class', 'node-icon');
    icon.setAttribute('text-anchor', 'middle');
    icon.setAttribute('dominant-baseline', 'central');
    icon.setAttribute('font-size', node.type === 'boss' ? '28' : '22');
    // Icons are visible on dark background
    icon.setAttribute('fill', '#ffffff');
    icon.setAttribute('opacity', node.completed ? '0.7' : isCurrent ? '1' : isAvailable ? '0.9' : '0.4');
    icon.textContent = nodeType ? nodeType.icon : '?';
    group.appendChild(icon);

    // Completed star burst effect
    if (node.completed) {
      const completedBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      completedBadge.setAttribute('class', 'node-completed-badge');
      completedBadge.setAttribute('transform', 'translate(16, -16)');

      const badgeBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      badgeBg.setAttribute('r', '10');
      badgeBg.setAttribute('fill', '#00aa88');
      badgeBg.setAttribute('stroke', '#00ffaa');
      badgeBg.setAttribute('stroke-width', '1');
      completedBadge.appendChild(badgeBg);

      const check = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      check.setAttribute('text-anchor', 'middle');
      check.setAttribute('dominant-baseline', 'central');
      check.setAttribute('font-size', '12');
      check.setAttribute('fill', '#ffffff');
      check.setAttribute('font-weight', 'bold');
      check.textContent = '✓';
      completedBadge.appendChild(check);

      group.appendChild(completedBadge);
    }

    // Elite/boss special ring (cosmic style)
    if (node.type === 'elite' || node.type === 'boss') {
      const specialRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      specialRing.setAttribute('r', this.config.nodeRadius + 4);
      specialRing.setAttribute('class', `node-ring node-ring-${node.type}`);
      specialRing.setAttribute('fill', 'none');
      specialRing.setAttribute('stroke', node.type === 'boss' ? '#ff4444' : '#ffa500');
      specialRing.setAttribute('stroke-width', node.type === 'boss' ? '2' : '1.5');
      specialRing.setAttribute('stroke-dasharray', node.type === 'boss' ? '6 3' : '4 2');
      specialRing.setAttribute('opacity', '0.8');
      group.insertBefore(specialRing, outerGlow);
    }

    // Click handler
    group.addEventListener('click', () => this.onNodeClick(node));

    // Hover effects
    group.addEventListener('mouseenter', () => this.onNodeHover(node, true));
    group.addEventListener('mouseleave', () => this.onNodeHover(node, false));

    return group;
  },

  /**
   * Calculate node position in SVG coordinates
   * PRIORITY: Use map-specific tile positions from CardTemplates if available
   * FALLBACK: Generated centered grid with organic wobble
   */
  getNodePosition(node, map) {
    // Try to get map-specific positions from CardTemplates
    const mapTheme = this.getMapTheme(map.actNumber);

    if (mapTheme) {
      // LINEAR PATH - single sequential path through the map
      if (mapTheme.pathType === 'linear' && mapTheme.path) {
        // For linear maps, use the node's pathIndex (sequential position)
        const pathIndex = node.pathIndex ?? this.getLinearPathIndex(node, map);
        const tilePos = mapTheme.path[pathIndex];

        if (tilePos) {
          console.log(`[MapRenderer] Linear path node ${node.id} -> pathIndex ${pathIndex} -> (${tilePos.x}, ${tilePos.y})`);
          return this.convertPercentToSVG(tilePos, map);
        } else {
          console.warn(`[MapRenderer] Linear path: no tile at index ${pathIndex}, path length: ${mapTheme.path.length}`);
        }
      }

      // BRANCHING (Slay the Spire style) - floors with multiple nodes
      if (mapTheme.nodes) {
        const floorNodes = mapTheme.nodes[node.floor];
        if (floorNodes) {
          const nodeIndex = map.floors[node.floor]?.nodes.findIndex(n => n.id === node.id) || 0;
          const tilePos = floorNodes[nodeIndex] || floorNodes[0];

          if (tilePos) {
            return this.convertPercentToSVG(tilePos, map);
          }
        }
      }
    } else {
      console.warn(`[MapRenderer] No mapTheme found for act ${map.actNumber}`);
    }

    // Fallback to generated positions
    console.log(`[MapRenderer] Using fallback position for node ${node.id}`);
    return this.getGeneratedNodePosition(node, map);
  },

  /**
   * Convert percentage position to SVG coordinates
   * Percentages are relative to the full map image (0-100%)
   * Uses actual image dimensions from CardTemplates for accurate placement
   */
  convertPercentToSVG(tilePos, map) {
    // Get map theme to check for actual image dimensions
    const mapTheme = this.getMapTheme(map.actNumber);

    // Use actual image dimensions if available, otherwise fall back to calculated
    let mapDims;
    if (mapTheme && mapTheme.imageDimensions) {
      mapDims = mapTheme.imageDimensions;
    } else {
      // Fallback to calculated grid dimensions (for starfield/CSS modes)
      mapDims = this.calculateMapDimensions(map);
    }

    // Direct percentage to pixel conversion - no offsets needed
    // The coordinate picker gives raw percentages of the full image
    const x = (tilePos.x / 100) * mapDims.width;
    const y = (tilePos.y / 100) * mapDims.height;

    return { x, y };
  },

  /**
   * Get the linear path index for a node (for linear maps)
   */
  getLinearPathIndex(node, map) {
    // Count all nodes before this one in the map
    let index = 0;
    for (const floor of map.floors) {
      for (const n of floor.nodes) {
        if (n.id === node.id) return index;
        index++;
      }
    }
    return 0;
  },

  /**
   * Get map theme from CardTemplates
   */
  getMapTheme(actNumber) {
    if (typeof CardTemplates !== 'undefined' && CardTemplates.getMapForAct) {
      return CardTemplates.getMapForAct(actNumber);
    }
    return null;
  },

  /**
   * Generated node position (fallback when no map-specific positions)
   * CENTER-JUSTIFIED: Nodes are centered horizontally in the map
   * Ms. Luminara style: organic, slightly wandering paths
   */
  getGeneratedNodePosition(node, map) {
    const totalFloors = map.floors.length;
    const nodesInFloor = map.floors[node.floor]?.nodes.length || 1;

    // Get the total map width
    const mapWidth = this.calculateMapWidth(map);

    // Calculate the width needed for this floor's nodes
    const floorWidth = (nodesInFloor - 1) * this.config.nodeSpacing.x;

    // Center the floor horizontally - start from center minus half the floor width
    const centerX = mapWidth / 2;
    const startX = centerX - floorWidth / 2;

    // X position based on node's relative position (centered)
    const nodeIndex = map.floors[node.floor]?.nodes.findIndex(n => n.id === node.id) || 0;
    let x = startX + nodeIndex * this.config.nodeSpacing.x;

    // Y position (inverted - floor 0 at bottom for start, boss at top)
    let y = this.config.padding.top + (totalFloors - 1 - node.floor) * this.config.nodeSpacing.y;

    // Add organic wobble based on node ID (deterministic randomness)
    // This creates winding paths that aren't perfectly grid-aligned
    if (node.type !== 'boss') {
      const seed = this.hashString(node.id);
      const wobbleX = ((seed % 100) / 100 - 0.5) * 2 * this.config.wobbleAmount.x;
      const wobbleY = (((seed * 7) % 100) / 100 - 0.5) * 2 * this.config.wobbleAmount.y;
      x += wobbleX;
      y += wobbleY;
    }

    return { x, y };
  },

  /**
   * Simple string hash for deterministic wobble
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  /**
   * Calculate total map dimensions
   */
  calculateMapDimensions(map) {
    return {
      width: this.calculateMapWidth(map),
      height: this.config.padding.top + this.config.padding.bottom +
              (map.floors.length - 1) * this.config.nodeSpacing.y
    };
  },

  /**
   * Calculate map width based on widest floor
   */
  calculateMapWidth(map) {
    let maxNodes = 1;
    for (const floor of map.floors) {
      maxNodes = Math.max(maxNodes, floor.nodes.length);
    }
    return this.config.padding.left + this.config.padding.right +
           maxNodes * this.config.nodeSpacing.x;
  },

  /**
   * Render minimal starfield border (subtle frame)
   */
  renderBorderDecorations(map) {
    // Starfield theme: minimal to no decorations - let the stars shine
    const decorGroup = this.svg.querySelector('.map-border-decorations');
    decorGroup.innerHTML = '';
    // Cosmic theme doesn't need ornate borders
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE UPDATES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Update which nodes are available (glowing)
   */
  updateAvailableNodes() {
    if (!this.currentMap) return;

    const availableIds = MapSystem.getAvailableNodes().map(n => n.id);

    this.svg.querySelectorAll('.map-node').forEach(nodeEl => {
      const nodeId = nodeEl.getAttribute('data-node-id');
      const isAvailable = availableIds.includes(nodeId);
      const isCurrent = this.playerPosition === nodeId;

      nodeEl.classList.toggle('node-available', isAvailable && !isCurrent);
      nodeEl.classList.toggle('node-current', isCurrent);
    });
  },

  /**
   * Update the status bar
   */
  updateStatusBar(runState) {
    if (!this.statusBar) return;

    // HP
    if (runState.hp !== undefined) {
      this.statusBar.querySelector('.hp-current').textContent = runState.hp;
    }
    if (runState.maxHp !== undefined) {
      this.statusBar.querySelector('.hp-max').textContent = runState.maxHp;
    }

    // Gold
    if (runState.gold !== undefined) {
      this.statusBar.querySelector('.gold-amount').textContent = runState.gold;
    }

    // Deck
    if (runState.deckSize !== undefined) {
      this.statusBar.querySelector('.deck-count').textContent = runState.deckSize;
    }

    // Potions
    if (runState.potions !== undefined) {
      const potionSlots = this.statusBar.querySelectorAll('.potion-slot');
      potionSlots.forEach((slot, index) => {
        const potion = runState.potions[index];
        if (potion) {
          slot.classList.remove('empty');
          slot.classList.add('filled');
          slot.textContent = potion.emoji || '🧪';
          slot.setAttribute('title', potion.name || 'Potion');
          slot.setAttribute('data-potion-type', potion.id);
        } else {
          slot.classList.add('empty');
          slot.classList.remove('filled');
          slot.textContent = '';
          slot.removeAttribute('title');
          slot.removeAttribute('data-potion-type');
        }
      });
    }
  },

  /**
   * Set player position on the map
   */
  setPlayerPosition(nodeId) {
    this.playerPosition = nodeId;
    MapSystem.currentNode = nodeId;
    this.updateAvailableNodes();
    this.highlightPath();
    this.renderPlayerToken(nodeId);
  },

  /**
   * Advance to the next node in linear progression
   * Called after completing a node encounter
   */
  advanceToNextNode() {
    if (this.currentNodeIndex === undefined) {
      this.currentNodeIndex = 0;
    }

    // Get total nodes from current map theme
    const mapTheme = this.getMapTheme(this.currentMap?.actNumber || 1);
    let totalNodes = 0;
    if (mapTheme?.pathType === 'linear' && mapTheme?.path) {
      totalNodes = mapTheme.path.length;
    } else if (mapTheme?.nodes) {
      totalNodes = mapTheme.nodes.flat().length;
    }

    // Advance if not at the end
    if (this.currentNodeIndex < totalNodes - 1) {
      this.currentNodeIndex++;
      console.log(`[MapRenderer] Advanced to node ${this.currentNodeIndex}`);

      // Re-render the simple map to update node states
      if (mapTheme) {
        this.renderSimpleMap(this.currentMap, mapTheme);
      }
    }

    return this.currentNodeIndex;
  },

  /**
   * Reset to first node (for new run)
   */
  resetNodeProgress() {
    this.currentNodeIndex = 0;
    console.log('[MapRenderer] Reset to node 0');
  },

  /**
   * Get current node index
   */
  getCurrentNodeIndex() {
    return this.currentNodeIndex || 0;
  },

  /**
   * Render the player's ship token orbiting the current node (Enterprise-style)
   */
  renderPlayerToken(nodeId) {
    const playerGroup = this.svg.querySelector('.map-player');
    playerGroup.innerHTML = '';

    if (!nodeId || !this.currentMap) return;

    const node = MapSystem.getNode(nodeId);
    if (!node) return;

    const pos = this.getNodePosition(node, this.currentMap);
    const orbitRadius = this.config.nodeRadius + 20;

    // Create orbit path (elliptical for perspective)
    const orbitPath = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    orbitPath.setAttribute('cx', pos.x);
    orbitPath.setAttribute('cy', pos.y);
    orbitPath.setAttribute('rx', orbitRadius);
    orbitPath.setAttribute('ry', orbitRadius * 0.4);
    orbitPath.setAttribute('fill', 'none');
    orbitPath.setAttribute('stroke', 'rgba(0, 255, 255, 0.2)');
    orbitPath.setAttribute('stroke-width', '1');
    orbitPath.setAttribute('stroke-dasharray', '4 4');
    orbitPath.setAttribute('class', 'orbit-path');
    playerGroup.appendChild(orbitPath);

    // Create ship container that will be animated
    const shipContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shipContainer.setAttribute('class', 'ship-orbit-container');

    // Ship glow effect
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', '12');
    glow.setAttribute('fill', 'url(#ship-glow)');
    glow.setAttribute('class', 'ship-glow');
    shipContainer.appendChild(glow);

    // Enterprise-style ship SVG (simplified silhouette)
    const ship = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ship.setAttribute('class', 'enterprise-ship');
    ship.setAttribute('transform', 'scale(0.8)');

    // Saucer section
    const saucer = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    saucer.setAttribute('cx', '0');
    saucer.setAttribute('cy', '-2');
    saucer.setAttribute('rx', '10');
    saucer.setAttribute('ry', '4');
    saucer.setAttribute('fill', '#c0d0e0');
    saucer.setAttribute('stroke', '#88aacc');
    saucer.setAttribute('stroke-width', '0.5');
    ship.appendChild(saucer);

    // Bridge dome
    const bridge = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    bridge.setAttribute('cx', '0');
    bridge.setAttribute('cy', '-2');
    bridge.setAttribute('rx', '3');
    bridge.setAttribute('ry', '1.5');
    bridge.setAttribute('fill', '#aaccff');
    ship.appendChild(bridge);

    // Engineering hull (neck + body)
    const neck = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    neck.setAttribute('x', '-1.5');
    neck.setAttribute('y', '1');
    neck.setAttribute('width', '3');
    neck.setAttribute('height', '6');
    neck.setAttribute('fill', '#a0b0c0');
    ship.appendChild(neck);

    const hull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hull.setAttribute('cx', '0');
    hull.setAttribute('cy', '10');
    hull.setAttribute('rx', '3');
    hull.setAttribute('ry', '5');
    hull.setAttribute('fill', '#b0c0d0');
    hull.setAttribute('stroke', '#88aacc');
    hull.setAttribute('stroke-width', '0.5');
    ship.appendChild(hull);

    // Nacelle pylons
    const leftPylon = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftPylon.setAttribute('x1', '-2');
    leftPylon.setAttribute('y1', '6');
    leftPylon.setAttribute('x2', '-12');
    leftPylon.setAttribute('y2', '3');
    leftPylon.setAttribute('stroke', '#90a0b0');
    leftPylon.setAttribute('stroke-width', '1.5');
    ship.appendChild(leftPylon);

    const rightPylon = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightPylon.setAttribute('x1', '2');
    rightPylon.setAttribute('y1', '6');
    rightPylon.setAttribute('x2', '12');
    rightPylon.setAttribute('y2', '3');
    rightPylon.setAttribute('stroke', '#90a0b0');
    rightPylon.setAttribute('stroke-width', '1.5');
    ship.appendChild(rightPylon);

    // Warp nacelles
    const leftNacelle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftNacelle.setAttribute('cx', '-14');
    leftNacelle.setAttribute('cy', '3');
    leftNacelle.setAttribute('rx', '5');
    leftNacelle.setAttribute('ry', '1.5');
    leftNacelle.setAttribute('fill', '#d0e0f0');
    leftNacelle.setAttribute('stroke', '#00aaff');
    leftNacelle.setAttribute('stroke-width', '0.5');
    ship.appendChild(leftNacelle);

    const rightNacelle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightNacelle.setAttribute('cx', '14');
    rightNacelle.setAttribute('cy', '3');
    rightNacelle.setAttribute('rx', '5');
    rightNacelle.setAttribute('ry', '1.5');
    rightNacelle.setAttribute('fill', '#d0e0f0');
    rightNacelle.setAttribute('stroke', '#00aaff');
    rightNacelle.setAttribute('stroke-width', '0.5');
    ship.appendChild(rightNacelle);

    // Nacelle glows (warp engines)
    const leftGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftGlow.setAttribute('cx', '-14');
    leftGlow.setAttribute('cy', '3');
    leftGlow.setAttribute('rx', '4');
    leftGlow.setAttribute('ry', '1');
    leftGlow.setAttribute('fill', '#00ffff');
    leftGlow.setAttribute('opacity', '0.6');
    leftGlow.setAttribute('class', 'nacelle-glow');
    ship.appendChild(leftGlow);

    const rightGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightGlow.setAttribute('cx', '14');
    rightGlow.setAttribute('cy', '3');
    rightGlow.setAttribute('rx', '4');
    rightGlow.setAttribute('ry', '1');
    rightGlow.setAttribute('fill', '#00ffff');
    rightGlow.setAttribute('opacity', '0.6');
    rightGlow.setAttribute('class', 'nacelle-glow');
    ship.appendChild(rightGlow);

    shipContainer.appendChild(ship);
    playerGroup.appendChild(shipContainer);

    // Start orbit animation
    this.animateShipOrbit(shipContainer, pos, orbitRadius);

    // Ensure gradients exist
    this.ensureShipGradient();
  },

  /**
   * Animate ship orbiting around the node
   */
  animateShipOrbit(shipContainer, center, radius) {
    let angle = 0;
    const orbitSpeed = 0.02; // radians per frame
    const verticalScale = 0.4; // elliptical orbit

    const animate = () => {
      angle += orbitSpeed;
      if (angle > Math.PI * 2) angle -= Math.PI * 2;

      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius * verticalScale;

      // Scale ship based on position in orbit (perspective)
      const scale = 0.7 + Math.sin(angle) * 0.2;
      const zIndex = Math.sin(angle) > 0 ? 1 : -1;

      shipContainer.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);

      // Store animation frame ID for cleanup
      this._orbitAnimationId = requestAnimationFrame(animate);
    };

    // Cancel previous animation if exists
    if (this._orbitAnimationId) {
      cancelAnimationFrame(this._orbitAnimationId);
    }

    animate();
  },

  /**
   * Ensure ship glow gradient exists in defs
   */
  ensureShipGradient() {
    const defs = this.svg.querySelector('defs');
    if (!defs.querySelector('#ship-glow')) {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradient.setAttribute('id', 'ship-glow');
      gradient.innerHTML = `
        <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.5"/>
        <stop offset="50%" style="stop-color:#0088ff;stop-opacity:0.2"/>
        <stop offset="100%" style="stop-color:#0044aa;stop-opacity:0"/>
      `;
      defs.appendChild(gradient);
    }
  },

  /**
   * Render ship at the starting zone (below floor 0) when no node is selected
   * The ship hovers at the "launch position" waiting for the player to select a starting node
   */
  renderShipAtStartZone(map) {
    const playerGroup = this.svg.querySelector('.map-player');
    playerGroup.innerHTML = '';

    if (!map || !map.floors || map.floors.length === 0) return;

    // Get dimensions - prefer image dimensions if available
    const mapTheme = this.getMapTheme(map.actNumber);
    let mapWidth, mapHeight;
    if (mapTheme && mapTheme.imageDimensions) {
      mapWidth = mapTheme.imageDimensions.width;
      mapHeight = mapTheme.imageDimensions.height;
    } else {
      mapWidth = this.calculateMapWidth(map);
      mapHeight = this.config.padding.top + (map.floors.length - 1) * this.config.nodeSpacing.y + this.config.padding.bottom;
    }

    // Calculate position: center of map, near the bottom
    const centerX = mapWidth / 2;
    // Position near bottom of map (at 85% height for image maps, or below floor 0 for grid maps)
    const startY = mapTheme?.imageDimensions ? mapHeight * 0.85 :
                   this.config.padding.top + (map.floors.length - 1) * this.config.nodeSpacing.y + 60;

    const pos = { x: centerX, y: startY };

    // Create a simple floating animation instead of orbit (no node to orbit around)
    const shipContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shipContainer.setAttribute('class', 'ship-start-container');

    // Ship glow effect
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', '15');
    glow.setAttribute('fill', 'url(#ship-glow)');
    glow.setAttribute('class', 'ship-glow');
    shipContainer.appendChild(glow);

    // Enterprise-style ship (same as renderPlayerToken)
    const ship = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ship.setAttribute('class', 'enterprise-ship');
    ship.setAttribute('transform', 'scale(1)');

    // Saucer section
    const saucer = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    saucer.setAttribute('cx', '0');
    saucer.setAttribute('cy', '-2');
    saucer.setAttribute('rx', '10');
    saucer.setAttribute('ry', '4');
    saucer.setAttribute('fill', '#c0d0e0');
    saucer.setAttribute('stroke', '#88aacc');
    saucer.setAttribute('stroke-width', '0.5');
    ship.appendChild(saucer);

    // Bridge dome
    const bridge = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    bridge.setAttribute('cx', '0');
    bridge.setAttribute('cy', '-2');
    bridge.setAttribute('rx', '3');
    bridge.setAttribute('ry', '1.5');
    bridge.setAttribute('fill', '#aaccff');
    ship.appendChild(bridge);

    // Engineering hull (neck + body)
    const neck = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    neck.setAttribute('x', '-1.5');
    neck.setAttribute('y', '1');
    neck.setAttribute('width', '3');
    neck.setAttribute('height', '6');
    neck.setAttribute('fill', '#a0b0c0');
    ship.appendChild(neck);

    const hull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hull.setAttribute('cx', '0');
    hull.setAttribute('cy', '10');
    hull.setAttribute('rx', '3');
    hull.setAttribute('ry', '5');
    hull.setAttribute('fill', '#b0c0d0');
    hull.setAttribute('stroke', '#88aacc');
    hull.setAttribute('stroke-width', '0.5');
    ship.appendChild(hull);

    // Nacelle pylons
    const leftPylon = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftPylon.setAttribute('x1', '-2');
    leftPylon.setAttribute('y1', '6');
    leftPylon.setAttribute('x2', '-12');
    leftPylon.setAttribute('y2', '3');
    leftPylon.setAttribute('stroke', '#90a0b0');
    leftPylon.setAttribute('stroke-width', '1.5');
    ship.appendChild(leftPylon);

    const rightPylon = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightPylon.setAttribute('x1', '2');
    rightPylon.setAttribute('y1', '6');
    rightPylon.setAttribute('x2', '12');
    rightPylon.setAttribute('y2', '3');
    rightPylon.setAttribute('stroke', '#90a0b0');
    rightPylon.setAttribute('stroke-width', '1.5');
    ship.appendChild(rightPylon);

    // Warp nacelles
    const leftNacelle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftNacelle.setAttribute('cx', '-14');
    leftNacelle.setAttribute('cy', '3');
    leftNacelle.setAttribute('rx', '5');
    leftNacelle.setAttribute('ry', '1.5');
    leftNacelle.setAttribute('fill', '#d0e0f0');
    leftNacelle.setAttribute('stroke', '#00aaff');
    leftNacelle.setAttribute('stroke-width', '0.5');
    ship.appendChild(leftNacelle);

    const rightNacelle = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightNacelle.setAttribute('cx', '14');
    rightNacelle.setAttribute('cy', '3');
    rightNacelle.setAttribute('rx', '5');
    rightNacelle.setAttribute('ry', '1.5');
    rightNacelle.setAttribute('fill', '#d0e0f0');
    rightNacelle.setAttribute('stroke', '#00aaff');
    rightNacelle.setAttribute('stroke-width', '0.5');
    ship.appendChild(rightNacelle);

    // Nacelle glows (warp engines)
    const leftGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftGlow.setAttribute('cx', '-14');
    leftGlow.setAttribute('cy', '3');
    leftGlow.setAttribute('rx', '4');
    leftGlow.setAttribute('ry', '1');
    leftGlow.setAttribute('fill', '#00ffff');
    leftGlow.setAttribute('opacity', '0.6');
    leftGlow.setAttribute('class', 'nacelle-glow');
    ship.appendChild(leftGlow);

    const rightGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightGlow.setAttribute('cx', '14');
    rightGlow.setAttribute('cy', '3');
    rightGlow.setAttribute('rx', '4');
    rightGlow.setAttribute('ry', '1');
    rightGlow.setAttribute('fill', '#00ffff');
    rightGlow.setAttribute('opacity', '0.6');
    rightGlow.setAttribute('class', 'nacelle-glow');
    ship.appendChild(rightGlow);

    shipContainer.appendChild(ship);
    playerGroup.appendChild(shipContainer);

    // Floating idle animation (gentle hover)
    this.animateShipIdle(shipContainer, pos);

    // Ensure gradients exist
    this.ensureShipGradient();
  },

  /**
   * Animate ship in idle hover (for start zone)
   */
  animateShipIdle(shipContainer, center) {
    let time = 0;
    const hoverSpeed = 0.03;
    const hoverAmount = 5;

    const animate = () => {
      time += hoverSpeed;

      // Gentle bobbing motion
      const y = center.y + Math.sin(time) * hoverAmount;

      shipContainer.setAttribute('transform', `translate(${center.x}, ${y})`);

      this._idleAnimationId = requestAnimationFrame(animate);
    };

    // Cancel previous animation if exists
    if (this._idleAnimationId) {
      cancelAnimationFrame(this._idleAnimationId);
    }

    animate();
  },

  /**
   * Highlight the path the player has taken
   */
  highlightPath() {
    // Update path styles based on completed nodes
    this.svg.querySelectorAll('.map-paths path').forEach(path => {
      const fromId = path.getAttribute('data-from');
      const toId = path.getAttribute('data-to');
      const fromNode = MapSystem.getNode(fromId);
      const toNode = MapSystem.getNode(toId);

      if (fromNode?.completed && toNode?.completed) {
        path.setAttribute('stroke', 'url(#path-completed)');
        path.classList.add('path-completed');
        path.classList.remove('path-available', 'path-locked');
      } else if (fromNode?.completed || this.isStartNode(fromId)) {
        path.setAttribute('stroke', 'url(#path-gradient)');
        path.classList.add('path-available');
        path.classList.remove('path-completed', 'path-locked');
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if a node is a starting node
   */
  isStartNode(nodeId) {
    return this.currentMap?.startNodes?.includes(nodeId);
  },

  /**
   * Check if a node is currently available for selection
   */
  isNodeAvailable(nodeId) {
    return MapSystem.isNodeSelectable(nodeId);
  },

  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Handle node click - now with animated path following
   */
  async onNodeClick(node) {
    if (!this.isNodeAvailable(node.id)) {
      // Visual feedback for locked node
      const nodeEl = this.svg.querySelector(`[data-node-id="${node.id}"]`);
      if (nodeEl) {
        nodeEl.classList.add('node-shake');
        setTimeout(() => nodeEl.classList.remove('node-shake'), 300);
      }
      return;
    }

    // Prevent clicking during travel
    if (typeof PathFollower !== 'undefined' && PathFollower.isMoving()) {
      return;
    }

    console.log('[MapRenderer] Node selected:', node.id, node.type);

    const previousNodeId = this.playerPosition;

    // Animate travel if PathFollower is available and we have a previous position
    if (typeof PathFollower !== 'undefined' && previousNodeId) {
      // Hide the old ship/player token during travel
      const playerGroup = this.svg.querySelector('.map-player');
      if (playerGroup) playerGroup.style.display = 'none';

      // Animate the character along the path
      await PathFollower.travelTo(previousNodeId, node.id);
    }

    // Update game state after travel completes
    MapSystem.moveToNode(node.id);
    this.setPlayerPosition(node.id);

    // Trigger appropriate encounter
    if (this.onNodeSelect) {
      this.onNodeSelect(node);
    }
  },

  /**
   * Handle node hover
   */
  onNodeHover(node, entering) {
    if (!this.isNodeAvailable(node.id) && !node.completed) return;

    const nodeEl = this.svg.querySelector(`[data-node-id="${node.id}"]`);
    if (nodeEl) {
      nodeEl.classList.toggle('node-hover', entering);
    }

    // Show built-in tooltip
    if (entering) {
      this.showTooltip(node, nodeEl);
    } else {
      this.hideTooltip();
    }

    // Also call external callback if set
    if (entering && this.onNodeTooltip) {
      this.onNodeTooltip(node, true);
    } else if (!entering && this.onNodeTooltip) {
      this.onNodeTooltip(node, false);
    }
  },

  /**
   * Show tooltip for a node
   */
  showTooltip(node, nodeEl) {
    const tooltip = this.container.querySelector('#map-tooltip');
    if (!tooltip) return;

    const nodeType = MapSystem.NODE_TYPES[node.type];
    if (!nodeType) return;

    // Populate tooltip content
    tooltip.querySelector('.tooltip-icon').textContent = nodeType.icon;
    tooltip.querySelector('.tooltip-title').textContent = nodeType.name;
    tooltip.querySelector('.tooltip-description').textContent = nodeType.description || this.getNodeDescription(node.type);

    // Show rewards preview
    const rewardsEl = tooltip.querySelector('.tooltip-rewards');
    rewardsEl.innerHTML = this.getRewardsPreview(node);

    // Position tooltip near the node
    const nodeRect = nodeEl.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const tooltipWidth = 200;

    let left = nodeRect.left - containerRect.left + nodeRect.width / 2 - tooltipWidth / 2;
    let top = nodeRect.top - containerRect.top - 10;

    // Keep tooltip within bounds
    left = Math.max(10, Math.min(left, containerRect.width - tooltipWidth - 10));

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
  },

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = this.container.querySelector('#map-tooltip');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  },

  /**
   * Get description for node type
   */
  getNodeDescription(type) {
    const descriptions = {
      combat: 'Answer questions to defeat the enemy',
      elite: 'A challenging foe with greater rewards',
      rest: 'Heal your wounds or upgrade a card',
      shop: 'Spend gold to buy cards and potions',
      treasure: 'Claim a free card reward',
      mystery: 'Unknown encounter - risk and reward',
      boss: 'The guardian of this realm'
    };
    return descriptions[type] || 'Unknown encounter';
  },

  /**
   * Get rewards preview HTML
   */
  getRewardsPreview(node) {
    const rewards = {
      combat: '<span class="reward-item">🃏 Card</span><span class="reward-item">💰 Gold</span>',
      elite: '<span class="reward-item">🃏🃏 Cards</span><span class="reward-item">💎 Relic</span>',
      rest: '<span class="reward-item">❤️ Heal</span> or <span class="reward-item">⬆️ Upgrade</span>',
      shop: '<span class="reward-item">🛒 Buy/Sell</span>',
      treasure: '<span class="reward-item">🃏 Free Card</span>',
      mystery: '<span class="reward-item">❓ Variable</span>',
      boss: '<span class="reward-item">👑 Act Complete</span>'
    };

    if (node.completed) {
      return '<span class="reward-completed">✓ Completed</span>';
    }

    return rewards[node.type] || '';
  },

  /**
   * Handle menu button click
   */
  onMenuClick() {
    if (this.onMenuSelect) {
      this.onMenuSelect();
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CALLBACKS (to be set by app)
  // ═══════════════════════════════════════════════════════════════

  onNodeSelect: null,  // Called when player selects a node
  onMenuSelect: null,  // Called when menu button clicked
  onNodeTooltip: null, // Called for tooltip display

  // ═══════════════════════════════════════════════════════════════
  // VISIBILITY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Show the map
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.container.classList.add('active');
    }
  },

  /**
   * Hide the map
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.container.classList.remove('active');
    }
  },

  /**
   * Check if map is visible
   */
  isVisible() {
    return this.container?.classList.contains('active');
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.MapRenderer = MapRenderer;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapRenderer;
}
