/**
 * Ms. Luminara Quiz - Path Follower Module
 * 820.31.30-path-follower.js
 *
 * Animates a character following the dotted paths between map nodes.
 * Uses SVG path getTotalLength() and getPointAtLength() for smooth
 * bezier curve traversal.
 *
 * @module PathFollower
 * @version 1.0.0
 */

const PathFollower = {
  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  config: {
    // Default travel duration in milliseconds
    defaultDuration: 1200,

    // Easing function: 'linear', 'easeIn', 'easeOut', 'easeInOut'
    defaultEasing: 'easeInOut',

    // Character scale during travel
    travelScale: 0.9,

    // Character scale at rest (orbiting node)
    restScale: 0.8,

    // Orbit radius around nodes when at rest
    orbitRadius: 20,

    // Orbit speed (radians per frame)
    orbitSpeed: 0.02,

    // Trail effect settings
    showTrail: true,
    trailLength: 5,
    trailFadeRate: 0.15
  },

  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  // Current movement state
  state: {
    isMoving: false,
    currentNodeId: null,
    targetNodeId: null,
    progress: 0,
    startTime: null
  },

  // Animation frame IDs
  _travelAnimationId: null,
  _orbitAnimationId: null,

  // Reference to SVG and character elements
  svg: null,
  characterGroup: null,
  trailGroup: null,

  // Reference to MapRenderer for position lookups
  mapRenderer: null,

  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize the path follower
   * @param {Object} mapRenderer - Reference to MapRenderer instance
   */
  init(mapRenderer) {
    this.mapRenderer = mapRenderer;
    this.svg = mapRenderer.svg;

    // Create character group in SVG
    this.createCharacterElements();

    console.log('[PathFollower] Initialized');
    return this;
  },

  /**
   * Create the character and trail SVG elements
   */
  createCharacterElements() {
    // Remove existing if present
    const existing = this.svg.querySelector('.path-follower-group');
    if (existing) existing.remove();

    // Create main group
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'path-follower-group');

    // Trail group (rendered behind character)
    this.trailGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.trailGroup.setAttribute('class', 'character-trail');
    group.appendChild(this.trailGroup);

    // Character group
    this.characterGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.characterGroup.setAttribute('class', 'character-model');
    group.appendChild(this.characterGroup);

    // Render the character model
    this.renderCharacter();

    // Add to SVG (after nodes so it renders on top)
    this.svg.appendChild(group);
  },

  /**
   * Render the character model (Ms. Luminara avatar or ship)
   * Can be customized for different character types
   */
  renderCharacter() {
    this.characterGroup.innerHTML = '';

    // Glow effect
    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow.setAttribute('r', '18');
    glow.setAttribute('fill', 'url(#character-glow)');
    glow.setAttribute('class', 'character-glow');
    this.characterGroup.appendChild(glow);

    // Main character body (stylized owl/star shape for Ms. Luminara)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    body.setAttribute('class', 'character-body');

    // Outer aura ring
    const aura = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    aura.setAttribute('r', '14');
    aura.setAttribute('fill', 'none');
    aura.setAttribute('stroke', '#ffd700');
    aura.setAttribute('stroke-width', '2');
    aura.setAttribute('opacity', '0.6');
    aura.setAttribute('class', 'character-aura');
    body.appendChild(aura);

    // Body circle (owl body)
    const bodyCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bodyCircle.setAttribute('r', '10');
    bodyCircle.setAttribute('fill', '#2a1a4a');
    bodyCircle.setAttribute('stroke', '#8b5cf6');
    bodyCircle.setAttribute('stroke-width', '2');
    body.appendChild(bodyCircle);

    // Eyes (two small circles)
    const leftEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    leftEye.setAttribute('cx', '-3');
    leftEye.setAttribute('cy', '-2');
    leftEye.setAttribute('r', '3');
    leftEye.setAttribute('fill', '#ffd700');
    leftEye.setAttribute('class', 'character-eye');
    body.appendChild(leftEye);

    const rightEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rightEye.setAttribute('cx', '3');
    rightEye.setAttribute('cy', '-2');
    rightEye.setAttribute('r', '3');
    rightEye.setAttribute('fill', '#ffd700');
    rightEye.setAttribute('class', 'character-eye');
    body.appendChild(rightEye);

    // Pupils
    const leftPupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    leftPupil.setAttribute('cx', '-2.5');
    leftPupil.setAttribute('cy', '-2');
    leftPupil.setAttribute('r', '1.5');
    leftPupil.setAttribute('fill', '#1a1a2e');
    leftPupil.setAttribute('class', 'character-pupil');
    body.appendChild(leftPupil);

    const rightPupil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    rightPupil.setAttribute('cx', '3.5');
    rightPupil.setAttribute('cy', '-2');
    rightPupil.setAttribute('r', '1.5');
    rightPupil.setAttribute('fill', '#1a1a2e');
    rightPupil.setAttribute('class', 'character-pupil');
    body.appendChild(rightPupil);

    // Beak (small triangle)
    const beak = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    beak.setAttribute('points', '0,1 -2,4 2,4');
    beak.setAttribute('fill', '#f59e0b');
    body.appendChild(beak);

    // Ear tufts (owl ears)
    const leftEar = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    leftEar.setAttribute('points', '-6,-6 -8,-12 -3,-8');
    leftEar.setAttribute('fill', '#4c1d95');
    body.appendChild(leftEar);

    const rightEar = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    rightEar.setAttribute('points', '6,-6 8,-12 3,-8');
    rightEar.setAttribute('fill', '#4c1d95');
    body.appendChild(rightEar);

    // Wings (small curves on sides)
    const leftWing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    leftWing.setAttribute('cx', '-10');
    leftWing.setAttribute('cy', '2');
    leftWing.setAttribute('rx', '4');
    leftWing.setAttribute('ry', '6');
    leftWing.setAttribute('fill', '#3730a3');
    leftWing.setAttribute('class', 'character-wing left-wing');
    body.appendChild(leftWing);

    const rightWing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rightWing.setAttribute('cx', '10');
    rightWing.setAttribute('cy', '2');
    rightWing.setAttribute('rx', '4');
    rightWing.setAttribute('ry', '6');
    rightWing.setAttribute('fill', '#3730a3');
    rightWing.setAttribute('class', 'character-wing right-wing');
    body.appendChild(rightWing);

    this.characterGroup.appendChild(body);

    // Ensure gradient exists
    this.ensureGradients();
  },

  /**
   * Ensure required SVG gradients exist
   */
  ensureGradients() {
    const defs = this.svg.querySelector('defs');
    if (!defs) return;

    if (!defs.querySelector('#character-glow')) {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradient.setAttribute('id', 'character-glow');
      gradient.innerHTML = `
        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:0.6"/>
        <stop offset="40%" style="stop-color:#8b5cf6;stop-opacity:0.3"/>
        <stop offset="100%" style="stop-color:#4c1d95;stop-opacity:0"/>
      `;
      defs.appendChild(gradient);
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // PATH FOLLOWING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Travel from one node to another along the path
   * @param {string} fromNodeId - Starting node ID
   * @param {string} toNodeId - Target node ID
   * @param {Object} options - Animation options
   * @returns {Promise} Resolves when travel is complete
   */
  travelTo(fromNodeId, toNodeId, options = {}) {
    return new Promise((resolve, reject) => {
      const duration = options.duration || this.config.defaultDuration;
      const easing = options.easing || this.config.defaultEasing;

      // Find the path element
      const pathGroup = this.svg.querySelector(
        `.path-group[data-from="${fromNodeId}"][data-to="${toNodeId}"]`
      );

      if (!pathGroup) {
        console.warn('[PathFollower] No path found from', fromNodeId, 'to', toNodeId);
        // Fall back to direct movement
        this.teleportTo(toNodeId);
        resolve();
        return;
      }

      const pathElement = pathGroup.querySelector('path');
      if (!pathElement) {
        this.teleportTo(toNodeId);
        resolve();
        return;
      }

      // Stop any current animations
      this.stopAnimations();

      // Set state
      this.state.isMoving = true;
      this.state.currentNodeId = fromNodeId;
      this.state.targetNodeId = toNodeId;
      this.state.progress = 0;

      const totalLength = pathElement.getTotalLength();
      const startTime = performance.now();

      // Clear trail
      this.trailGroup.innerHTML = '';
      const trailPositions = [];

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);

        // Apply easing
        const easedProgress = this.applyEasing(progress, easing);

        // Get position on path
        const point = pathElement.getPointAtLength(easedProgress * totalLength);

        // Get rotation (tangent direction)
        const rotation = this.getPathRotation(pathElement, easedProgress, totalLength);

        // Update character position
        const scale = this.config.travelScale;
        this.characterGroup.setAttribute('transform',
          `translate(${point.x}, ${point.y}) rotate(${rotation}) scale(${scale})`
        );

        // Update trail
        if (this.config.showTrail) {
          trailPositions.push({ x: point.x, y: point.y, opacity: 1 });
          this.renderTrail(trailPositions);
        }

        // Wing flap animation
        this.animateWings(currentTime);

        if (progress >= 1) {
          // Travel complete
          this.state.isMoving = false;
          this.state.currentNodeId = toNodeId;
          this.state.targetNodeId = null;
          this.state.progress = 1;

          // Snap to final position (no rotation at rest)
          this.characterGroup.setAttribute('transform',
            `translate(${point.x}, ${point.y}) scale(${this.config.restScale})`
          );

          // Start idle animation at destination
          this.startOrbitAnimation(toNodeId);

          // Fade out trail
          this.fadeTrail(trailPositions);

          resolve();
          return;
        }

        this.state.progress = progress;
        this._travelAnimationId = requestAnimationFrame(animate);
      };

      this._travelAnimationId = requestAnimationFrame(animate);
    });
  },

  /**
   * Get rotation angle for character along path (facing direction of travel)
   */
  getPathRotation(pathElement, progress, totalLength) {
    const delta = 0.01;
    const t1 = Math.max(0, progress - delta);
    const t2 = Math.min(1, progress + delta);

    const p1 = pathElement.getPointAtLength(t1 * totalLength);
    const p2 = pathElement.getPointAtLength(t2 * totalLength);

    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return angle * (180 / Math.PI);
  },

  /**
   * Apply easing function to progress
   */
  applyEasing(t, type) {
    switch (type) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  },

  /**
   * Animate wing flapping during travel
   */
  animateWings(time) {
    const wings = this.characterGroup.querySelectorAll('.character-wing');
    const flapSpeed = 0.015;
    const flapAmount = 15;
    const flapOffset = Math.sin(time * flapSpeed) * flapAmount;

    wings.forEach((wing, i) => {
      const isLeft = wing.classList.contains('left-wing');
      const baseX = isLeft ? -10 : 10;
      const rotation = isLeft ? -flapOffset : flapOffset;
      wing.setAttribute('transform', `rotate(${rotation}, ${baseX}, 2)`);
    });
  },

  /**
   * Render trail behind character
   */
  renderTrail(positions) {
    // Keep only recent positions
    while (positions.length > this.config.trailLength * 3) {
      positions.shift();
    }

    this.trailGroup.innerHTML = '';

    positions.forEach((pos, i) => {
      const opacity = (i / positions.length) * 0.5;
      const size = 3 + (i / positions.length) * 2;

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', pos.x);
      dot.setAttribute('cy', pos.y);
      dot.setAttribute('r', size);
      dot.setAttribute('fill', '#ffd700');
      dot.setAttribute('opacity', opacity);
      this.trailGroup.appendChild(dot);
    });
  },

  /**
   * Fade out trail after arrival
   */
  fadeTrail(positions) {
    let opacity = 1;
    const fadeStep = () => {
      opacity -= this.config.trailFadeRate;
      if (opacity <= 0) {
        this.trailGroup.innerHTML = '';
        return;
      }

      this.trailGroup.querySelectorAll('circle').forEach(dot => {
        const currentOpacity = parseFloat(dot.getAttribute('opacity'));
        dot.setAttribute('opacity', currentOpacity * opacity);
      });

      requestAnimationFrame(fadeStep);
    };
    requestAnimationFrame(fadeStep);
  },

  // ═══════════════════════════════════════════════════════════════
  // IDLE ANIMATION (ORBIT)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Start idle orbit animation at a node
   */
  startOrbitAnimation(nodeId) {
    this.stopOrbitAnimation();

    const node = MapSystem?.getNode(nodeId);
    if (!node || !this.mapRenderer?.currentMap) return;

    const pos = this.mapRenderer.getNodePosition(node, this.mapRenderer.currentMap);
    const radius = this.config.orbitRadius;
    let angle = 0;

    const animate = () => {
      if (this.state.isMoving) return; // Stop if traveling

      angle += this.config.orbitSpeed;
      if (angle > Math.PI * 2) angle -= Math.PI * 2;

      // Elliptical orbit for perspective
      const x = pos.x + Math.cos(angle) * radius;
      const y = pos.y + Math.sin(angle) * radius * 0.4;

      // Scale based on position (pseudo-3D)
      const scale = this.config.restScale + Math.sin(angle) * 0.1;

      this.characterGroup.setAttribute('transform',
        `translate(${x}, ${y}) scale(${scale})`
      );

      // Gentle wing movement at rest
      this.animateWingsIdle(angle);

      this._orbitAnimationId = requestAnimationFrame(animate);
    };

    this._orbitAnimationId = requestAnimationFrame(animate);
  },

  /**
   * Gentle wing movement while idle
   */
  animateWingsIdle(angle) {
    const wings = this.characterGroup.querySelectorAll('.character-wing');
    const flapAmount = 5;
    const flapOffset = Math.sin(angle * 2) * flapAmount;

    wings.forEach((wing, i) => {
      const isLeft = wing.classList.contains('left-wing');
      const baseX = isLeft ? -10 : 10;
      const rotation = isLeft ? -flapOffset : flapOffset;
      wing.setAttribute('transform', `rotate(${rotation}, ${baseX}, 2)`);
    });
  },

  /**
   * Stop orbit animation
   */
  stopOrbitAnimation() {
    if (this._orbitAnimationId) {
      cancelAnimationFrame(this._orbitAnimationId);
      this._orbitAnimationId = null;
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Instantly teleport to a node (no animation)
   */
  teleportTo(nodeId) {
    this.stopAnimations();

    const node = MapSystem?.getNode(nodeId);
    if (!node || !this.mapRenderer?.currentMap) return;

    const pos = this.mapRenderer.getNodePosition(node, this.mapRenderer.currentMap);

    this.characterGroup.setAttribute('transform',
      `translate(${pos.x}, ${pos.y}) scale(${this.config.restScale})`
    );

    this.state.currentNodeId = nodeId;
    this.state.isMoving = false;

    this.startOrbitAnimation(nodeId);
  },

  /**
   * Position character at start zone (before first move)
   */
  positionAtStart(map) {
    this.stopAnimations();

    if (!map || !map.floors || map.floors.length === 0) return;

    // Calculate position: center of map, below first floor
    const mapWidth = this.mapRenderer.calculateMapWidth(map);
    const totalFloors = map.floors.length;
    const centerX = mapWidth / 2;
    const startY = this.mapRenderer.config.padding.top +
                   (totalFloors - 1) * this.mapRenderer.config.nodeSpacing.y + 60;

    // Position character
    this.characterGroup.setAttribute('transform',
      `translate(${centerX}, ${startY}) scale(${this.config.restScale})`
    );

    this.state.currentNodeId = null;
    this.state.isMoving = false;

    // Start gentle hover animation
    this.startHoverAnimation(centerX, startY);
  },

  /**
   * Hover animation at start (before selecting first node)
   */
  startHoverAnimation(centerX, centerY) {
    let time = 0;
    const hoverSpeed = 0.03;
    const hoverAmount = 5;

    const animate = () => {
      if (this.state.isMoving || this.state.currentNodeId) return;

      time += hoverSpeed;
      const y = centerY + Math.sin(time) * hoverAmount;

      this.characterGroup.setAttribute('transform',
        `translate(${centerX}, ${y}) scale(${this.config.restScale})`
      );

      this.animateWingsIdle(time);

      this._orbitAnimationId = requestAnimationFrame(animate);
    };

    this._orbitAnimationId = requestAnimationFrame(animate);
  },

  /**
   * Stop all animations
   */
  stopAnimations() {
    if (this._travelAnimationId) {
      cancelAnimationFrame(this._travelAnimationId);
      this._travelAnimationId = null;
    }
    this.stopOrbitAnimation();
  },

  /**
   * Show the character
   */
  show() {
    if (this.characterGroup) {
      this.characterGroup.style.display = '';
    }
    if (this.trailGroup) {
      this.trailGroup.style.display = '';
    }
  },

  /**
   * Hide the character
   */
  hide() {
    if (this.characterGroup) {
      this.characterGroup.style.display = 'none';
    }
    if (this.trailGroup) {
      this.trailGroup.style.display = 'none';
    }
  },

  /**
   * Check if currently traveling
   */
  isMoving() {
    return this.state.isMoving;
  },

  /**
   * Get current node ID
   */
  getCurrentNode() {
    return this.state.currentNodeId;
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.PathFollower = PathFollower;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PathFollower;
}
