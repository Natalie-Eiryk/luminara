/**
 * Ms. Luminara Quiz - Card Template System
 * 820.31.85-card-templates.js
 *
 * Provides rich card rendering using background template images
 * for equipment, loot, and collectible cards.
 *
 * Card Types:
 * - Player Card: Golden vine frame (for equipment/player items)
 * - Monster Card: Dark demon frame (for boss loot/special items)
 */

const CardTemplates = {
  // Template image paths (relative to quiz root)
  templates: {
    player: './820.31-assets/card-player.png',
    monster: './820.31-assets/card-monster.png',
    question: './820.31-assets/scroll-question.png',
    answer: './820.31-assets/scroll-answer.png'
  },

  // ═══════════════════════════════════════════════════════════════
  // MAP BACKGROUNDS - Centralized registry for act/biome maps
  // 7 Acts + 1 Boss map = 8 total themed backgrounds
  // Node positions are percentages (x, y) within the map content area
  // imageDimensions MUST match the actual PNG dimensions for coordinate conversion
  // Organized by floors (rows) from BOTTOM to TOP for path progression
  // ═══════════════════════════════════════════════════════════════
  maps: {
    // Act 1: Forest/Verdant theme - LINEAR PATH up to waterfall, jump off, face the teacher!
    'verdant-wilds': {
      image: './820.31-assets/map-verdant-wilds_no_bg.png',
      name: 'The Verdant Wilds',
      act: 1,
      // CRITICAL: These must match the actual image dimensions!
      // Used for converting percentage coordinates to SVG pixels
      imageDimensions: { width: 1340, height: 784 },
      colors: {
        primary: '#2d5016',
        secondary: '#4a7c23',
        accent: '#8fbc8f',
        text: '#f0fff0'
      },
      // LINEAR PATH - character walks tile to tile in sequence
      // Coordinates adjusted for cropped image (border removed)
      pathType: 'linear',
      path: [
        { x: 37.2, y: 76.9 },  // 0: Start
        { x: 49.3, y: 78.9 },  // 1: Path begins
        { x: 67.0, y: 73.6 },  // 2: Winding right
        { x: 54.9, y: 65.3 },  // 3: Up the hill
        { x: 33.6, y: 58.4 },  // 4: Cut left
        { x: 45.5, y: 57.4 },  // 5: Back center
        { x: 57.2, y: 48.4 },  // 6: Approaching waterfall
        { x: 69.3, y: 41.6 },  // 7: Near the falls
        { x: 56.3, y: 32.6 },  // 8: Waterfall edge
        { x: 49.4, y: 21.1 },  // 9: Top of waterfall
        { x: 39.5, y: 21.3 },  // 10: Jump point!
        { x: 39.1, y: 44.9 },  // 11: SPLASH - landed in pool
        { x: 27.5, y: 42.8 }   // 12: Home - face Ms. Luminara's wrath!
      ],
      bossPosition: { x: 27.5, y: 42.8 }
    },
    // Act 2: Volcanic/Infernal theme - stepping stones across lava
    'infernal-peaks': {
      image: './820.31-assets/map-infernal-peaks.png',
      name: 'The Infernal Peaks',
      act: 2,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#4a1a0a',
        secondary: '#8b2500',
        accent: '#ff4500',
        text: '#ffd700'
      },
      nodes: [
        // Floor 0 (start)
        [{ x: 30, y: 88 }, { x: 55, y: 86 }],
        // Floor 1
        [{ x: 25, y: 75 }, { x: 50, y: 72 }, { x: 75, y: 74 }],
        // Floor 2
        [{ x: 35, y: 60 }, { x: 62, y: 58 }],
        // Floor 3
        [{ x: 28, y: 48 }, { x: 52, y: 45 }, { x: 78, y: 47 }],
        // Floor 4
        [{ x: 40, y: 32 }, { x: 68, y: 35 }],
        // Floor 5 (boss) - dark castle
        [{ x: 75, y: 18 }]
      ],
      bossPosition: { x: 75, y: 18 }
    },
    // Act 3: Ice/Frozen theme - snowy clearings to ice fortress
    'frozen-fortress': {
      image: './820.31-assets/map-frozen-fortress.png',
      name: 'The Frozen Fortress',
      act: 3,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#1a3a5c',
        secondary: '#4682b4',
        accent: '#87ceeb',
        text: '#e0ffff'
      },
      nodes: [
        // Floor 0 (start)
        [{ x: 22, y: 85 }, { x: 48, y: 88 }],
        // Floor 1
        [{ x: 30, y: 72 }, { x: 55, y: 70 }, { x: 78, y: 73 }],
        // Floor 2
        [{ x: 25, y: 58 }, { x: 52, y: 55 }],
        // Floor 3
        [{ x: 35, y: 45 }, { x: 60, y: 42 }, { x: 80, y: 46 }],
        // Floor 4
        [{ x: 42, y: 30 }, { x: 68, y: 32 }],
        // Floor 5 (boss) - ice fortress
        [{ x: 50, y: 15 }]
      ],
      bossPosition: { x: 50, y: 15 }
    },
    // Act 4: Desert/Sand theme - path to pyramids
    'desert-sands': {
      image: './820.31-assets/map-desert-sands.png',
      name: 'The Desert Sands',
      act: 4,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#8b7355',
        secondary: '#d2b48c',
        accent: '#ffd700',
        text: '#fffaf0'
      },
      nodes: [
        // Floor 0 (start)
        [{ x: 45, y: 88 }, { x: 70, y: 85 }],
        // Floor 1
        [{ x: 28, y: 75 }, { x: 52, y: 72 }, { x: 75, y: 74 }],
        // Floor 2
        [{ x: 35, y: 60 }, { x: 62, y: 58 }],
        // Floor 3
        [{ x: 25, y: 48 }, { x: 50, y: 45 }, { x: 72, y: 47 }],
        // Floor 4
        [{ x: 38, y: 32 }, { x: 65, y: 34 }],
        // Floor 5 (boss) - pyramid/oasis
        [{ x: 32, y: 18 }]
      ],
      bossPosition: { x: 32, y: 18 }
    },
    // Act 5: Swamp/Jungle theme - lily pads to temple
    'swamp-jungle': {
      image: './820.31-assets/map-swamp-jungle.png',
      name: 'The Swamp Jungle',
      act: 5,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#2f4f2f',
        secondary: '#556b2f',
        accent: '#9acd32',
        text: '#f5fffa'
      },
      nodes: [
        // Floor 0 (start)
        [{ x: 25, y: 88 }, { x: 55, y: 85 }, { x: 78, y: 87 }],
        // Floor 1
        [{ x: 20, y: 72 }, { x: 48, y: 70 }, { x: 72, y: 73 }],
        // Floor 2
        [{ x: 32, y: 58 }, { x: 58, y: 55 }, { x: 80, y: 57 }],
        // Floor 3
        [{ x: 25, y: 45 }, { x: 52, y: 42 }],
        // Floor 4
        [{ x: 38, y: 30 }, { x: 65, y: 32 }],
        // Floor 5 (boss) - jungle temple
        [{ x: 50, y: 15 }]
      ],
      bossPosition: { x: 50, y: 15 }
    },
    // Act 6: Floating Islands/Sky theme - islands with bridges
    'floating-islands': {
      image: './820.31-assets/map-floating-islands.png',
      name: 'The Floating Islands',
      act: 6,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#4169e1',
        secondary: '#87ceeb',
        accent: '#ffd700',
        text: '#f0f8ff'
      },
      nodes: [
        // Floor 0 (start) - lower islands
        [{ x: 22, y: 82 }, { x: 55, y: 85 }],
        // Floor 1
        [{ x: 35, y: 70 }, { x: 65, y: 68 }],
        // Floor 2
        [{ x: 20, y: 55 }, { x: 48, y: 52 }, { x: 75, y: 55 }],
        // Floor 3
        [{ x: 32, y: 40 }, { x: 62, y: 38 }],
        // Floor 4
        [{ x: 45, y: 28 }, { x: 72, y: 30 }],
        // Floor 5 (boss) - golden city
        [{ x: 50, y: 12 }]
      ],
      bossPosition: { x: 50, y: 12 }
    },
    // Act 7: Crystal Caverns/Underground theme - glowing path
    'crystal-caverns': {
      image: './820.31-assets/map-crystal-caverns.png',
      name: 'The Crystal Caverns',
      act: 7,
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#4b0082',
        secondary: '#9370db',
        accent: '#e6e6fa',
        text: '#f8f8ff'
      },
      nodes: [
        // Floor 0 (start) - cave entrance
        [{ x: 30, y: 88 }, { x: 55, y: 85 }, { x: 75, y: 87 }],
        // Floor 1
        [{ x: 25, y: 72 }, { x: 50, y: 70 }, { x: 72, y: 73 }],
        // Floor 2
        [{ x: 35, y: 58 }, { x: 62, y: 55 }],
        // Floor 3
        [{ x: 28, y: 45 }, { x: 52, y: 42 }, { x: 75, y: 45 }],
        // Floor 4
        [{ x: 40, y: 30 }, { x: 65, y: 32 }],
        // Floor 5 (boss) - crystal chamber/exit
        [{ x: 50, y: 15 }]
      ],
      bossPosition: { x: 50, y: 15 }
    },
    // Boss: Cosmic Journey - final confrontation (clearest tile layout)
    'cosmic-journey': {
      image: './820.31-assets/map-cosmic-journey.png',
      name: 'Cosmic Journey',
      act: 'boss',
      imageDimensions: { width: 1536, height: 1024 },
      colors: {
        primary: '#0a0a2a',
        secondary: '#1a1a4a',
        accent: '#ffd700',
        text: '#ffffff'
      },
      nodes: [
        // Floor 0 (start) - bottom platforms
        [{ x: 28, y: 88 }, { x: 50, y: 90 }, { x: 72, y: 88 }],
        // Floor 1
        [{ x: 22, y: 75 }, { x: 42, y: 73 }, { x: 62, y: 74 }, { x: 80, y: 76 }],
        // Floor 2
        [{ x: 30, y: 60 }, { x: 52, y: 58 }, { x: 72, y: 61 }],
        // Floor 3
        [{ x: 25, y: 48 }, { x: 48, y: 45 }, { x: 70, y: 47 }],
        // Floor 4
        [{ x: 35, y: 35 }, { x: 55, y: 32 }, { x: 75, y: 34 }],
        // Floor 5
        [{ x: 42, y: 22 }, { x: 62, y: 24 }],
        // Floor 6 (final boss) - cosmic temple
        [{ x: 50, y: 10 }]
      ],
      bossPosition: { x: 50, y: 10 }
    },
    // Fallback: Use starfield CSS (no image) - generated positions
    'starfield': {
      image: null,
      name: 'The Starfield',
      cssClass: 'map-starfield',
      colors: {
        primary: '#0a0a1a',
        secondary: '#101035',
        accent: '#00ffff',
        text: '#ffffff'
      },
      nodes: null // Use generated positions
    }
  },

  // Map act-to-theme lookup
  getMapForAct(actNumber) {
    const actMaps = {
      1: 'verdant-wilds',
      2: 'infernal-peaks',
      3: 'frozen-fortress',
      4: 'desert-sands',
      5: 'swamp-jungle',
      6: 'floating-islands',
      7: 'crystal-caverns',
      'boss': 'cosmic-journey'
    };
    return this.maps[actMaps[actNumber]] || this.maps['starfield'];
  },

  // Get all map image paths for service worker caching
  getMapImagePaths() {
    return Object.values(this.maps)
      .filter(m => m.image)
      .map(m => m.image);
  },

  // Card dimensions (based on template aspect ratio ~0.7)
  dimensions: {
    width: 300,
    height: 430
  },

  // Zone positions (percentage-based for responsive scaling)
  zones: {
    player: {
      // Art area (top large section)
      art: { top: 8, left: 10, width: 80, height: 45 },
      // Title bar (middle strip)
      title: { top: 55, left: 8, width: 84, height: 7 },
      // Description area (lower section)
      description: { top: 64, left: 8, width: 84, height: 28 },
      // Orb (top right - for element/type)
      orb: { top: 5, right: 5, size: 12 },
      // Badge (bottom right - for level/cost)
      badge: { bottom: 5, right: 8, width: 15, height: 8 }
    },
    monster: {
      // Art area (top large section)
      art: { top: 10, left: 12, width: 76, height: 42 },
      // Title bar (middle strip with demon head above)
      title: { top: 54, left: 10, width: 80, height: 7 },
      // Description area (lower section)
      description: { top: 63, left: 10, width: 80, height: 28 },
      // Orb (top right - for element/type)
      orb: { top: 4, right: 6, size: 12 },
      // Badge (bottom right - for level/cost)
      badge: { bottom: 4, right: 10, width: 14, height: 7 }
    },
    question: {
      // Title plate at top center
      title: { top: 2, left: 25, width: 50, height: 8 },
      // Main content area (the parchment)
      content: { top: 14, left: 8, width: 84, height: 72 },
      // Question number badge (optional, corner)
      badge: { top: 3, left: 5, width: 8, height: 6 }
    },
    answer: {
      // Letter badge on left
      letter: { left: 3, top: 25, width: 10, height: 50 },
      // Main text content area
      content: { left: 14, top: 15, width: 82, height: 70 }
    }
  },

  // Question scroll dimensions (horizontal scroll - wider than tall)
  questionDimensions: {
    width: 600,
    height: 420
  },

  // Answer scroll dimensions (wide banner)
  answerDimensions: {
    width: 500,
    height: 80
  },

  // Rarity glow effects
  rarityEffects: {
    COMMON: {
      glow: 'none',
      titleBg: 'rgba(156, 163, 175, 0.3)',
      borderGlow: 'none'
    },
    UNCOMMON: {
      glow: '0 0 10px rgba(34, 197, 94, 0.5)',
      titleBg: 'rgba(34, 197, 94, 0.3)',
      borderGlow: '0 0 15px rgba(34, 197, 94, 0.4)'
    },
    RARE: {
      glow: '0 0 15px rgba(59, 130, 246, 0.6)',
      titleBg: 'rgba(59, 130, 246, 0.3)',
      borderGlow: '0 0 20px rgba(59, 130, 246, 0.5)'
    },
    EPIC: {
      glow: '0 0 20px rgba(168, 85, 247, 0.7)',
      titleBg: 'rgba(168, 85, 247, 0.3)',
      borderGlow: '0 0 25px rgba(168, 85, 247, 0.6)'
    },
    LEGENDARY: {
      glow: '0 0 25px rgba(245, 158, 11, 0.8)',
      titleBg: 'rgba(245, 158, 11, 0.4)',
      borderGlow: '0 0 30px rgba(245, 158, 11, 0.7)',
      animation: 'legendary-pulse 2s ease-in-out infinite'
    },
    UNIQUE: {
      glow: '0 0 30px rgba(6, 182, 212, 0.9)',
      titleBg: 'rgba(6, 182, 212, 0.4)',
      borderGlow: '0 0 35px rgba(6, 182, 212, 0.8)',
      animation: 'unique-shimmer 3s ease-in-out infinite'
    }
  },

  // Element/type colors for the orb
  elementColors: {
    HEAD: { color: '#a78bfa', icon: '🎓' },
    NECK: { color: '#f472b6', icon: '📿' },
    SHOULDERS: { color: '#60a5fa', icon: '🦺' },
    CHEST: { color: '#34d399', icon: '🥼' },
    HANDS: { color: '#fbbf24', icon: '🧤' },
    WAIST: { color: '#fb923c', icon: '🎗️' },
    LEGS: { color: '#a3e635', icon: '👖' },
    FEET: { color: '#2dd4bf', icon: '👢' },
    RING_L: { color: '#c084fc', icon: '💍' },
    RING_R: { color: '#c084fc', icon: '💍' },
    MAINHAND: { color: '#f87171', icon: '📚' },
    OFFHAND: { color: '#38bdf8', icon: '📖' },
    // Special types
    consumable: { color: '#22d3ee', icon: '🧪' },
    gem: { color: '#e879f9', icon: '💎' },
    gold: { color: '#fcd34d', icon: '💰' },
    special: { color: '#f472b6', icon: '✨' }
  },

  /**
   * Initialize the card template system
   */
  init() {
    this.injectStyles();
    this.preloadImages();
    console.log('[CardTemplates] Initialized');
  },

  /**
   * Preload template images
   */
  preloadImages() {
    Object.values(this.templates).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  },

  /**
   * Inject required CSS styles
   */
  injectStyles() {
    if (document.getElementById('card-template-styles')) return;

    const style = document.createElement('style');
    style.id = 'card-template-styles';
    style.textContent = `
      /* Card Template Base */
      .card-template {
        position: relative;
        width: ${this.dimensions.width}px;
        height: ${this.dimensions.height}px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        font-family: 'Cinzel', 'Times New Roman', serif;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        border-radius: 12px;
        overflow: hidden;
      }

      .card-template:hover {
        transform: scale(1.05) translateY(-5px);
      }

      .card-template.player-card {
        background-image: url('${this.templates.player}');
      }

      .card-template.monster-card {
        background-image: url('${this.templates.monster}');
      }

      /* Question Scroll Template */
      .question-scroll {
        position: relative;
        width: ${this.questionDimensions.width}px;
        height: ${this.questionDimensions.height}px;
        background-image: url('${this.templates.question}');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        font-family: 'EB Garamond', 'Times New Roman', serif;
      }

      .question-scroll .scroll-title {
        position: absolute;
        top: 2%;
        left: 25%;
        width: 50%;
        height: 8%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 600;
        color: #4a3728;
        text-shadow: 0 1px 1px rgba(255,255,255,0.3);
      }

      .question-scroll .scroll-content {
        position: absolute;
        top: 14%;
        left: 8%;
        width: 84%;
        height: 72%;
        padding: 15px 20px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        font-size: 1.1rem;
        color: #2c1810;
        line-height: 1.5;
      }

      .question-scroll .scroll-content::-webkit-scrollbar {
        width: 6px;
      }

      .question-scroll .scroll-content::-webkit-scrollbar-thumb {
        background: rgba(74, 55, 40, 0.4);
        border-radius: 3px;
      }

      .question-scroll .question-text {
        font-size: 1.15rem;
        margin-bottom: 15px;
        color: #1a1a1a;
      }

      .question-scroll .answer-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .question-scroll .answer-option {
        padding: 10px 15px;
        background: rgba(255, 248, 240, 0.7);
        border: 2px solid rgba(139, 90, 43, 0.3);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 1rem;
      }

      .question-scroll .answer-option:hover {
        background: rgba(255, 248, 240, 0.95);
        border-color: rgba(139, 90, 43, 0.6);
        transform: translateX(5px);
      }

      .question-scroll .answer-option.selected {
        background: rgba(212, 175, 55, 0.3);
        border-color: #b8860b;
      }

      .question-scroll .answer-option.correct {
        background: rgba(34, 197, 94, 0.3);
        border-color: #22c55e;
      }

      .question-scroll .answer-option.incorrect {
        background: rgba(239, 68, 68, 0.3);
        border-color: #ef4444;
      }

      .question-scroll .scroll-badge {
        position: absolute;
        top: 3%;
        left: 5%;
        width: 8%;
        height: 6%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        color: #5d4037;
      }

      /* Answer Scroll Template */
      .answer-scroll {
        position: relative;
        width: ${this.answerDimensions.width}px;
        height: ${this.answerDimensions.height}px;
        background-image: url('${this.templates.answer}');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        font-family: 'EB Garamond', 'Times New Roman', serif;
        cursor: pointer;
        transition: all 0.25s ease;
        margin: 8px 0;
      }

      .answer-scroll:hover {
        transform: scale(1.02) translateY(-3px);
        filter: brightness(1.05);
      }

      .answer-scroll .answer-letter {
        position: absolute;
        left: 3%;
        top: 20%;
        width: 12%;
        height: 60%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: bold;
        color: #8b5a2b;
        text-shadow: 0 1px 2px rgba(255,255,255,0.4);
      }

      .answer-scroll .answer-text {
        position: absolute;
        left: 16%;
        top: 15%;
        width: 78%;
        height: 70%;
        display: flex;
        align-items: center;
        padding: 0 15px;
        font-size: 1.05rem;
        color: #2c1810;
        line-height: 1.3;
        overflow: hidden;
      }

      /* Answer states */
      .answer-scroll.selected {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
        transform: scale(1.03);
      }

      .answer-scroll.correct {
        box-shadow: 0 0 25px rgba(34, 197, 94, 0.7);
        animation: correctPulse 0.5s ease;
      }

      .answer-scroll.correct .answer-letter {
        color: #16a34a;
      }

      .answer-scroll.incorrect {
        box-shadow: 0 0 25px rgba(239, 68, 68, 0.7);
        animation: incorrectShake 0.4s ease;
      }

      .answer-scroll.incorrect .answer-letter {
        color: #dc2626;
      }

      .answer-scroll.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      .answer-scroll.disabled:hover {
        transform: none;
        filter: none;
      }

      @keyframes correctPulse {
        0%, 100% { transform: scale(1.03); }
        50% { transform: scale(1.06); }
      }

      @keyframes incorrectShake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
      }

      /* Answer scroll container layout */
      .answer-scrolls-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        padding: 10px 0;
      }

      /* Question + Answers combined layout */
      .quiz-card-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        padding: 20px;
      }

      /* Card Zones */
      .card-zone {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      /* Art Zone */
      .card-art-zone {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      .card-art-zone img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .card-art-zone .art-icon {
        font-size: 4rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }

      /* Title Zone */
      .card-title-zone {
        font-weight: bold;
        font-size: 0.85rem;
        text-align: center;
        color: #2c1810;
        text-shadow: 0 1px 2px rgba(255,255,255,0.3);
        padding: 2px 4px;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Description Zone */
      .card-desc-zone {
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 8px;
        font-size: 0.7rem;
        color: #3d2914;
        text-align: left;
        line-height: 1.3;
        overflow-y: auto;
      }

      .card-desc-zone::-webkit-scrollbar {
        width: 4px;
      }

      .card-desc-zone::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.3);
        border-radius: 2px;
      }

      .card-stat {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 1px 0;
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }

      .card-stat:last-child {
        border-bottom: none;
      }

      .card-stat-name {
        color: #5d4037;
      }

      .card-stat-value {
        color: #1a472a;
        font-weight: bold;
      }

      .card-special {
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px dashed rgba(0,0,0,0.2);
        color: #7c3aed;
        font-style: italic;
        font-size: 0.65rem;
      }

      .card-lore {
        margin-top: 4px;
        color: #78716c;
        font-style: italic;
        font-size: 0.6rem;
      }

      /* Orb Zone (element/type indicator) */
      .card-orb-zone {
        border-radius: 50%;
        font-size: 1.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }

      /* Badge Zone (level/cost) */
      .card-badge-zone {
        font-weight: bold;
        font-size: 1rem;
        color: #2c1810;
        text-shadow: 0 1px 1px rgba(255,255,255,0.3);
      }

      /* Rarity Animations */
      @keyframes legendary-pulse {
        0%, 100% {
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.6),
                      inset 0 0 20px rgba(245, 158, 11, 0.1);
        }
        50% {
          box-shadow: 0 0 35px rgba(245, 158, 11, 0.9),
                      inset 0 0 30px rgba(245, 158, 11, 0.2);
        }
      }

      @keyframes unique-shimmer {
        0%, 100% {
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.7),
                      inset 0 0 15px rgba(6, 182, 212, 0.1);
          filter: hue-rotate(0deg);
        }
        50% {
          box-shadow: 0 0 40px rgba(6, 182, 212, 1),
                      inset 0 0 25px rgba(6, 182, 212, 0.2);
          filter: hue-rotate(15deg);
        }
      }

      /* Card flip animation */
      .card-flip-container {
        perspective: 1000px;
      }

      .card-flip {
        transition: transform 0.6s;
        transform-style: preserve-3d;
      }

      .card-flip.flipped {
        transform: rotateY(180deg);
      }

      /* Card grid layouts */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${this.dimensions.width}px, 1fr));
        gap: 20px;
        padding: 20px;
        justify-items: center;
      }

      /* Loot drop card animation */
      .loot-card-drop {
        animation: cardDrop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        opacity: 0;
        transform: translateY(-100px) rotateZ(-15deg) scale(0.5);
      }

      @keyframes cardDrop {
        0% {
          opacity: 0;
          transform: translateY(-100px) rotateZ(-15deg) scale(0.5);
        }
        60% {
          opacity: 1;
          transform: translateY(10px) rotateZ(3deg) scale(1.05);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotateZ(0deg) scale(1);
        }
      }

      /* Card size variants */
      .card-template.card-small {
        width: ${this.dimensions.width * 0.6}px;
        height: ${this.dimensions.height * 0.6}px;
      }

      .card-template.card-small .card-title-zone {
        font-size: 0.65rem;
      }

      .card-template.card-small .card-desc-zone {
        font-size: 0.55rem;
        padding: 4px;
      }

      .card-template.card-small .card-art-zone .art-icon {
        font-size: 2.5rem;
      }

      .card-template.card-large {
        width: ${this.dimensions.width * 1.3}px;
        height: ${this.dimensions.height * 1.3}px;
      }

      .card-template.card-large .card-title-zone {
        font-size: 1.1rem;
      }

      .card-template.card-large .card-desc-zone {
        font-size: 0.85rem;
        padding: 12px;
      }

      /* Card detail modal */
      .card-detail-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }

      .card-detail-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .card-detail-actions {
        display: flex;
        gap: 10px;
      }

      .card-detail-actions button {
        padding: 10px 24px;
        font-size: 1rem;
        border: 2px solid;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: 'Cinzel', serif;
      }

      .card-detail-actions .btn-equip {
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border-color: #15803d;
        color: white;
      }

      .card-detail-actions .btn-equip:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
      }

      .card-detail-actions .btn-sell {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        border-color: #b45309;
        color: white;
      }

      .card-detail-actions .btn-sell:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
      }

      .card-detail-actions .btn-close {
        background: linear-gradient(135deg, #6b7280, #4b5563);
        border-color: #374151;
        color: white;
      }

      .card-detail-actions .btn-close:hover {
        transform: scale(1.05);
      }

      /* ═══════════════════════════════════════════════════════════════
         STS MAP COMBAT - Apply scroll templates to answer cards
         IMPORTANT: These use high specificity to override 820.31.0-styles.css
         ═══════════════════════════════════════════════════════════════ */

      /* Override card hand to vertical stack instead of fan */
      .sts-combat-screen .sts-card-hand,
      .sts-card-hand {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        flex-wrap: nowrap !important;
        gap: 6px !important;
        padding: 10px !important;
        perspective: none !important;
        min-height: auto !important;
      }

      /* Base scroll card styling - override ALL the old card styles */
      .sts-combat-screen .sts-answer-card,
      .sts-card-hand .sts-answer-card,
      .sts-answer-card {
        position: relative !important;
        width: 340px !important;
        height: 65px !important;
        min-height: 65px !important;
        max-height: 65px !important;
        background: url('${this.templates.answer}') center/100% 100% no-repeat !important;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        font-family: 'EB Garamond', 'Georgia', serif !important;
        cursor: pointer !important;
        padding: 0 !important;
        margin: 0 !important;
        /* CRITICAL: Reset all transforms from fan layout */
        transform: none !important;
        animation: none !important;
      }

      /* Override the nth-child rotation transforms */
      .sts-card-hand .sts-answer-card:nth-child(1),
      .sts-card-hand .sts-answer-card:nth-child(2),
      .sts-card-hand .sts-answer-card:nth-child(3),
      .sts-card-hand .sts-answer-card:nth-child(4) {
        transform: none !important;
        z-index: auto !important;
      }

      /* Hide pseudo-elements */
      .sts-answer-card::before,
      .sts-answer-card::after {
        display: none !important;
        content: none !important;
      }

      /* Hover - simple lift, no rotation */
      .sts-card-hand .sts-answer-card:hover,
      .sts-answer-card:hover {
        transform: scale(1.02) translateY(-2px) !important;
        filter: brightness(1.05) !important;
        box-shadow: 0 4px 12px rgba(139, 90, 43, 0.4) !important;
        border: none !important;
        margin: 0 !important;
        z-index: 10 !important;
      }

      /* Override neighbor spread on hover */
      .sts-card-hand:has(.sts-answer-card:hover) .sts-answer-card:not(:hover) {
        transform: none !important;
      }

      /* HIDE the "ATTACK" type label completely */
      .sts-answer-card .card-type,
      .sts-answer-card .card-type.type-attack,
      .sts-answer-card .card-type.type-skill,
      .sts-answer-card .card-type.type-power {
        display: none !important;
        visibility: hidden !important;
      }

      /* Letter badge (A, B, C, D) */
      .sts-answer-card .card-energy {
        position: absolute !important;
        left: 10px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 30px !important;
        height: 30px !important;
        min-width: 30px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.95rem !important;
        font-weight: bold !important;
        color: white !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
        z-index: 10 !important;
      }

      /* Hide the keyboard shortcut hint */
      .sts-answer-card .card-energy::after {
        display: none !important;
      }

      /* Answer text - PROPERLY centered on scroll */
      .sts-answer-card .card-content {
        position: absolute !important;
        left: 55px !important;
        right: 15px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: auto !important;
        height: auto !important;
        max-height: 55px !important;
        font-family: 'EB Garamond', 'Georgia', serif !important;
        font-size: 1rem !important;
        font-weight: 500 !important;
        color: #1a0f08 !important;
        line-height: 1.3 !important;
        text-align: center !important;
        padding: 4px 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
        background: none !important;
        text-shadow: 0 1px 0 rgba(255,255,255,0.3) !important;
        letter-spacing: 0.01em !important;
      }

      /* Damage indicator - hide or minimal */
      .sts-answer-card .card-effect {
        position: absolute !important;
        bottom: 3px !important;
        right: 12px !important;
        font-size: 0.6rem !important;
        color: #8b7355 !important;
        display: flex !important;
        align-items: center !important;
        gap: 2px !important;
        opacity: 0.8 !important;
      }

      /* Hide the glow div completely */
      .sts-answer-card .card-glow {
        display: none !important;
        opacity: 0 !important;
      }

      /* STS Card States - correct answer */
      .sts-answer-card.card-played,
      .sts-answer-card.correct {
        box-shadow: 0 0 20px rgba(34, 197, 94, 0.7) !important;
        animation: correctPulse 0.5s ease !important;
        transform: none !important;
      }

      /* Wrong answer */
      .sts-answer-card.wrong,
      .sts-answer-card.incorrect,
      .sts-answer-card.card-shattered {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.7) !important;
        animation: incorrectShake 0.4s ease !important;
        opacity: 0.7 !important;
        transform: none !important;
      }

      .sts-answer-card.disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
      }

      /* Kill ALL rarity styling - no borders, no backgrounds */
      .sts-answer-card.rarity-common,
      .sts-answer-card.rarity-uncommon,
      .sts-answer-card.rarity-rare,
      .sts-answer-card.rarity-epic,
      .sts-answer-card.rarity-legendary,
      .sts-answer-card.card-drawing {
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        animation: none !important;
        transform: none !important;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .sts-card-hand .sts-answer-card,
        .sts-answer-card {
          width: 300px !important;
          height: 60px !important;
          min-height: 60px !important;
        }
        .sts-answer-card .card-content {
          font-size: 0.75rem !important;
        }
      }

      /* ═══════════════════════════════════════════════════════════════
         STS QUESTION DISPLAY - Apply scroll template
         ═══════════════════════════════════════════════════════════════ */

      .sts-question-prompt {
        background-image: url('${this.templates.question}');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-color: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        position: relative;
        min-height: 180px;
        max-width: 550px;
        margin: 0 auto;
      }

      .sts-question-prompt .sts-turn-indicator {
        position: absolute;
        top: 5%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.75rem;
        color: #5d4037;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .sts-question-prompt .sts-question-text {
        position: absolute;
        top: 18%;
        left: 10%;
        width: 80%;
        height: 70%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 1.05rem;
        color: #2c1810;
        line-height: 1.5;
        font-family: 'EB Garamond', 'Georgia', serif;
        padding: 10px;
        overflow-y: auto;
      }

      /* ═══════════════════════════════════════════════════════════════
         MAP IMAGE BACKGROUNDS - For act-themed scroll maps
         ═══════════════════════════════════════════════════════════════ */

      .map-wrapper.map-image-bg {
        background-color: #1a1612 !important;
        position: relative;
      }

      .map-wrapper.map-image-bg::before {
        content: none !important;
      }

      .map-wrapper.map-image-bg::after {
        content: none !important;
      }

      /* Ensure map header is readable on image backgrounds */
      .map-wrapper.map-image-bg .map-header {
        background: linear-gradient(to bottom,
          rgba(20, 15, 10, 0.95),
          rgba(30, 25, 18, 0.85)) !important;
        border-bottom: 2px solid rgba(201, 165, 92, 0.4) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      }

      .map-wrapper.map-image-bg .act-title .act-number {
        color: var(--map-accent-color, #c9a55c) !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) !important;
      }

      .map-wrapper.map-image-bg .act-title .act-name {
        color: var(--map-text-color, #ffffff) !important;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7) !important;
      }

      /* Map buttons on image backgrounds */
      .map-wrapper.map-image-bg .map-btn {
        background: linear-gradient(to bottom,
          rgba(40, 32, 24, 0.9),
          rgba(30, 24, 18, 0.9)) !important;
        border: 1px solid rgba(201, 165, 92, 0.5) !important;
        color: #c9a55c !important;
      }

      .map-wrapper.map-image-bg .map-btn:hover {
        background: linear-gradient(to bottom,
          rgba(60, 48, 36, 0.95),
          rgba(45, 36, 27, 0.95)) !important;
        border-color: #d4af37 !important;
        box-shadow: 0 0 10px rgba(212, 175, 55, 0.3) !important;
      }

      /* Status bar on image backgrounds */
      .map-wrapper.map-image-bg .map-status-bar {
        background: linear-gradient(to top,
          rgba(20, 15, 10, 0.95),
          rgba(30, 25, 18, 0.85)) !important;
        border-top: 2px solid rgba(201, 165, 92, 0.4) !important;
      }

      /* Nodes need to pop on image backgrounds */
      .map-wrapper.map-image-bg .map-node circle {
        stroke-width: 3px !important;
      }

      .map-wrapper.map-image-bg .map-node.node-available circle {
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)) !important;
      }

      /* ═══════════════════════════════════════════════════════════════
         BATTLE CARDS - Equipment/Ability cards use card templates
         ═══════════════════════════════════════════════════════════════ */

      .battle-card {
        position: relative;
        width: 140px;
        height: 200px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        border: none !important;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'EB Garamond', 'Georgia', serif;
      }

      .battle-card.card-attack,
      .battle-card.card-skill {
        background-image: url('${this.templates.player}');
      }

      .battle-card.card-power,
      .battle-card.card-curse {
        background-image: url('${this.templates.monster}');
      }

      .battle-card:hover {
        transform: translateY(-15px) scale(1.08);
        z-index: 100;
      }

      .battle-card .card-cost {
        position: absolute;
        top: 3%;
        left: 5%;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #d4af37, #b8860b);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: bold;
        color: #1a1612;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      }

      .battle-card .card-emoji {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2.5rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
      }

      .battle-card .card-name {
        position: absolute;
        top: 50%;
        left: 5%;
        width: 90%;
        text-align: center;
        font-size: 0.8rem;
        font-weight: bold;
        color: #2c1810;
        text-shadow: 0 1px 1px rgba(255,255,255,0.3);
      }

      .battle-card .card-type {
        position: absolute;
        top: 58%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #8b5a2b;
      }

      .battle-card .card-description {
        position: absolute;
        top: 65%;
        left: 8%;
        width: 84%;
        height: 25%;
        font-size: 0.65rem;
        color: #3d2914;
        text-align: center;
        line-height: 1.3;
        overflow: hidden;
      }

      .battle-card .card-rarity {
        position: absolute;
        bottom: 3%;
        left: 50%;
        transform: translateX(-50%);
        font-size: 0.55rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6b5344;
      }

      .battle-card.unplayable {
        filter: grayscale(0.5) brightness(0.7);
      }

      .battle-card.playable:hover {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
      }

      /* Card rarity glows */
      .battle-card.card-rare {
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
      }

      .battle-card.card-legendary,
      .battle-card.card-unique {
        box-shadow: 0 0 20px rgba(212, 175, 55, 0.6);
        animation: legendaryPulse 2s ease-in-out infinite;
      }

      @keyframes legendaryPulse {
        0%, 100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.5); }
        50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.8); }
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * Render a card from an item object
   * @param {Object} item - The item to render
   * @param {Object} options - Rendering options
   * @returns {HTMLElement} The card element
   */
  renderCard(item, options = {}) {
    const {
      type = 'player', // 'player' or 'monster'
      size = 'normal', // 'small', 'normal', 'large'
      animated = true,
      onClick = null,
      showActions = false
    } = options;

    const card = document.createElement('div');
    const cardType = item.isUnique || item.rarity === 'LEGENDARY' || item.rarity === 'UNIQUE' ? 'monster' : type;

    card.className = `card-template ${cardType}-card`;
    if (size !== 'normal') card.classList.add(`card-${size}`);

    // Apply rarity effects
    const rarityEffect = this.rarityEffects[item.rarity] || this.rarityEffects.COMMON;
    if (rarityEffect.borderGlow && rarityEffect.borderGlow !== 'none') {
      card.style.boxShadow = rarityEffect.borderGlow;
    }
    if (rarityEffect.animation) {
      card.style.animation = rarityEffect.animation;
    }

    // Get zone positions
    const zones = this.zones[cardType];
    const element = this.elementColors[item.type] || this.elementColors.special;

    // Build card content
    card.innerHTML = `
      <!-- Art Zone -->
      <div class="card-zone card-art-zone" style="
        top: ${zones.art.top}%;
        left: ${zones.art.left}%;
        width: ${zones.art.width}%;
        height: ${zones.art.height}%;
      ">
        ${item.imageUrl ?
          `<img src="${item.imageUrl}" alt="${item.name}">` :
          `<span class="art-icon">${item.icon || element.icon}</span>`
        }
      </div>

      <!-- Title Zone -->
      <div class="card-zone card-title-zone" style="
        top: ${zones.title.top}%;
        left: ${zones.title.left}%;
        width: ${zones.title.width}%;
        height: ${zones.title.height}%;
        background: ${rarityEffect.titleBg};
      ">
        ${item.name || 'Unknown Item'}
      </div>

      <!-- Description Zone -->
      <div class="card-zone card-desc-zone" style="
        top: ${zones.description.top}%;
        left: ${zones.description.left}%;
        width: ${zones.description.width}%;
        height: ${zones.description.height}%;
      ">
        ${this.renderStats(item)}
        ${item.special ? `<div class="card-special">${item.special}</div>` : ''}
        ${item.lore ? `<div class="card-lore">"${item.lore}"</div>` : ''}
      </div>

      <!-- Orb Zone (element/type) -->
      <div class="card-zone card-orb-zone" style="
        top: ${zones.orb.top}%;
        right: ${zones.orb.right}%;
        width: ${zones.orb.size}%;
        height: ${zones.orb.size * (this.dimensions.width / this.dimensions.height)}%;
      ">
        ${element.icon}
      </div>

      <!-- Badge Zone (level) -->
      <div class="card-zone card-badge-zone" style="
        bottom: ${zones.badge.bottom}%;
        right: ${zones.badge.right}%;
        width: ${zones.badge.width}%;
        height: ${zones.badge.height}%;
      ">
        ${item.level || 1}
      </div>
    `;

    // Add click handler
    if (onClick) {
      card.onclick = () => onClick(item);
    } else if (showActions) {
      card.onclick = () => this.showCardDetail(item);
    }

    return card;
  },

  /**
   * Render item stats as HTML
   */
  renderStats(item) {
    if (!item.stats) return '';

    const statNames = {
      intelligence: 'INT',
      wisdom: 'WIS',
      constitution: 'CON',
      charisma: 'CHA',
      xpBonus: 'XP',
      streakBonus: 'Streak',
      luckyChance: 'Lucky',
      insightBonus: 'Insight',
      revengeBonus: 'Revenge',
      allStats: 'All'
    };

    const percentStats = ['xpBonus', 'streakBonus', 'luckyChance', 'revengeBonus'];

    return Object.entries(item.stats)
      .filter(([_, value]) => value !== 0)
      .map(([stat, value]) => {
        const name = statNames[stat] || stat;
        const isPercent = percentStats.includes(stat);
        const sign = value > 0 ? '+' : '';
        return `
          <div class="card-stat">
            <span class="card-stat-name">${name}</span>
            <span class="card-stat-value">${sign}${value}${isPercent ? '%' : ''}</span>
          </div>
        `;
      }).join('');
  },

  /**
   * Show card in a detail modal
   */
  showCardDetail(item, isEquipped = false) {
    // Remove existing modal
    const existing = document.querySelector('.card-detail-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'card-detail-modal';

    const card = this.renderCard(item, { size: 'large', showActions: false });

    modal.innerHTML = `
      <div class="card-detail-content">
        <div class="card-container"></div>
        <div class="card-detail-actions">
          ${isEquipped ?
            `<button class="btn-equip" data-action="unequip" data-item-type="${item.type}">Unequip</button>` :
            `<button class="btn-equip" data-action="equip" data-item-id="${item.id}">Equip</button>
             <button class="btn-sell" data-action="sell" data-item-id="${item.id}">Sell</button>`
          }
          <button class="btn-close" data-action="close">Close</button>
        </div>
      </div>
    `;

    modal.querySelector('.card-container').appendChild(card);

    // Add event listeners for action buttons
    modal.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.dataset.action;

        if (action === 'equip') {
          const itemId = e.target.dataset.itemId;
          if (typeof quiz !== 'undefined' && quiz.equipItem) {
            quiz.equipItem(itemId);
          }
          this.closeModal();
        } else if (action === 'unequip') {
          const itemType = e.target.dataset.itemType;
          if (typeof quiz !== 'undefined' && quiz.unequipItem) {
            quiz.unequipItem(itemType);
          }
          this.closeModal();
        } else if (action === 'sell') {
          const itemId = e.target.dataset.itemId;
          if (typeof quiz !== 'undefined' && quiz.sellItem) {
            quiz.sellItem(itemId);
          }
          this.closeModal();
        } else if (action === 'close') {
          this.closeModal();
        }
      });
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    document.body.appendChild(modal);
  },

  /**
   * Close the detail modal
   */
  closeModal() {
    const modal = document.querySelector('.card-detail-modal');
    if (modal) modal.remove();
  },

  /**
   * Show loot drop with card animation
   */
  showLootCards(drops, onComplete = null) {
    if (!drops || drops.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-detail-modal';
    overlay.style.cursor = 'pointer';

    const container = document.createElement('div');
    container.className = 'card-grid';
    container.style.maxWidth = '90vw';
    container.style.maxHeight = '80vh';
    container.style.overflowY = 'auto';

    // Render each drop as a card
    drops.forEach((drop, index) => {
      let card;

      if (drop.type === 'gold') {
        // Gold drop - use special rendering
        card = this.renderGoldCard(drop.amount);
      } else if (drop.type === 'gem') {
        // Gem drop
        card = this.renderGemCard(drop);
      } else {
        // Equipment drop
        card = this.renderCard(drop, {
          animated: true,
          type: drop.isUnique || drop.rarity === 'UNIQUE' || drop.rarity === 'LEGENDARY' ? 'monster' : 'player'
        });
      }

      card.classList.add('loot-card-drop');
      card.style.animationDelay = `${index * 0.2}s`;

      container.appendChild(card);
    });

    // Add continue hint
    const hint = document.createElement('div');
    hint.style.cssText = 'color: #9ca3af; text-align: center; padding: 20px; font-size: 0.9rem;';
    hint.textContent = 'Click anywhere to continue...';

    overlay.appendChild(container);
    overlay.appendChild(hint);

    // Click to dismiss
    overlay.onclick = () => {
      overlay.remove();
      if (onComplete) onComplete();
    };

    document.body.appendChild(overlay);
  },

  /**
   * Render a gold drop card
   */
  renderGoldCard(amount) {
    const card = document.createElement('div');
    card.className = 'card-template player-card';
    card.style.boxShadow = '0 0 20px rgba(252, 211, 77, 0.6)';

    const zones = this.zones.player;

    card.innerHTML = `
      <div class="card-zone card-art-zone" style="
        top: ${zones.art.top}%;
        left: ${zones.art.left}%;
        width: ${zones.art.width}%;
        height: ${zones.art.height}%;
      ">
        <span class="art-icon">💰</span>
      </div>

      <div class="card-zone card-title-zone" style="
        top: ${zones.title.top}%;
        left: ${zones.title.left}%;
        width: ${zones.title.width}%;
        height: ${zones.title.height}%;
        background: rgba(252, 211, 77, 0.3);
      ">
        Gold Coins
      </div>

      <div class="card-zone card-desc-zone" style="
        top: ${zones.description.top}%;
        left: ${zones.description.left}%;
        width: ${zones.description.width}%;
        height: ${zones.description.height}%;
        justify-content: center;
        align-items: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: #b45309;
      ">
        +${amount.toLocaleString()}
      </div>

      <div class="card-zone card-orb-zone" style="
        top: ${zones.orb.top}%;
        right: ${zones.orb.right}%;
        width: ${zones.orb.size}%;
        height: ${zones.orb.size * (this.dimensions.width / this.dimensions.height)}%;
      ">
        💎
      </div>
    `;

    return card;
  },

  /**
   * Render a gem card
   */
  renderGemCard(gem) {
    const card = document.createElement('div');
    card.className = 'card-template player-card';
    card.style.boxShadow = `0 0 20px ${gem.color}80`;

    const zones = this.zones.player;

    card.innerHTML = `
      <div class="card-zone card-art-zone" style="
        top: ${zones.art.top}%;
        left: ${zones.art.left}%;
        width: ${zones.art.width}%;
        height: ${zones.art.height}%;
      ">
        <span class="art-icon">${gem.icon}</span>
      </div>

      <div class="card-zone card-title-zone" style="
        top: ${zones.title.top}%;
        left: ${zones.title.left}%;
        width: ${zones.title.width}%;
        height: ${zones.title.height}%;
        background: ${gem.color}40;
      ">
        ${gem.tierName} ${gem.name}
      </div>

      <div class="card-zone card-desc-zone" style="
        top: ${zones.description.top}%;
        left: ${zones.description.left}%;
        width: ${zones.description.width}%;
        height: ${zones.description.height}%;
      ">
        <div class="card-stat">
          <span class="card-stat-name">${gem.stat === 'allStats' ? 'All Stats' : gem.stat}</span>
          <span class="card-stat-value" style="color: ${gem.color};">+${gem.statBonus}${gem.isPercent ? '%' : ''}</span>
        </div>
        <div class="card-special">Socket into equipment for bonus stats</div>
      </div>

      <div class="card-zone card-orb-zone" style="
        top: ${zones.orb.top}%;
        right: ${zones.orb.right}%;
        width: ${zones.orb.size}%;
        height: ${zones.orb.size * (this.dimensions.width / this.dimensions.height)}%;
      ">
        💎
      </div>

      <div class="card-zone card-badge-zone" style="
        bottom: ${zones.badge.bottom}%;
        right: ${zones.badge.right}%;
        width: ${zones.badge.width}%;
        height: ${zones.badge.height}%;
      ">
        ${gem.tier + 1}
      </div>
    `;

    return card;
  },

  /**
   * Render inventory as card grid
   */
  renderInventoryCards(inventory, container) {
    container.innerHTML = '';
    container.className = 'card-grid';

    if (!inventory || inventory.length === 0) {
      container.innerHTML = '<div style="color: #9ca3af; text-align: center; grid-column: 1/-1;">No items yet. Answer questions to find loot!</div>';
      return;
    }

    inventory.forEach(item => {
      const card = this.renderCard(item, {
        size: 'small',
        showActions: true
      });
      container.appendChild(card);
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // QUESTION SCROLL RENDERING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Render a question on the scroll template
   * @param {Object} question - Question object with text and options
   * @param {Object} options - Rendering options
   * @returns {HTMLElement} The scroll element
   */
  renderQuestionScroll(question, options = {}) {
    const {
      title = 'Question',
      questionNumber = null,
      onAnswerSelect = null,
      showCorrect = false,
      selectedIndex = null
    } = options;

    const scroll = document.createElement('div');
    scroll.className = 'question-scroll';

    // Build answer options HTML
    const optionsHtml = question.options.map((option, index) => {
      let classes = 'answer-option';
      if (selectedIndex === index) classes += ' selected';
      if (showCorrect && index === question.answer) classes += ' correct';
      if (showCorrect && selectedIndex === index && selectedIndex !== question.answer) classes += ' incorrect';

      return `
        <div class="${classes}" data-index="${index}">
          <span class="option-letter">${String.fromCharCode(65 + index)}.</span>
          ${option}
        </div>
      `;
    }).join('');

    scroll.innerHTML = `
      ${questionNumber !== null ? `<div class="scroll-badge">#${questionNumber}</div>` : ''}
      <div class="scroll-title">${title}</div>
      <div class="scroll-content">
        <div class="question-text">${question.question || question.text}</div>
        <div class="answer-options">
          ${optionsHtml}
        </div>
      </div>
    `;

    // Add click handlers for answer options
    if (onAnswerSelect) {
      scroll.querySelectorAll('.answer-option').forEach(opt => {
        opt.addEventListener('click', () => {
          const index = parseInt(opt.dataset.index);
          onAnswerSelect(index, question);
        });
      });
    }

    return scroll;
  },

  /**
   * Update a question scroll to show the selected answer
   * @param {HTMLElement} scroll - The scroll element
   * @param {number} selectedIndex - The index of the selected answer
   * @param {number} correctIndex - The index of the correct answer
   */
  updateScrollAnswer(scroll, selectedIndex, correctIndex) {
    const options = scroll.querySelectorAll('.answer-option');
    options.forEach((opt, index) => {
      opt.classList.remove('selected', 'correct', 'incorrect');
      if (index === selectedIndex) {
        opt.classList.add('selected');
        if (selectedIndex !== correctIndex) {
          opt.classList.add('incorrect');
        }
      }
      if (index === correctIndex) {
        opt.classList.add('correct');
      }
    });
  },

  /**
   * Create a question scroll container that can be used as a question display
   * @param {HTMLElement} targetElement - Where to render the scroll
   * @param {Object} question - The question to display
   * @param {Function} onAnswer - Callback when answer is selected
   */
  displayQuestion(targetElement, question, onAnswer) {
    const scroll = this.renderQuestionScroll(question, {
      title: question.category || 'Question',
      questionNumber: question.number,
      onAnswerSelect: (index, q) => {
        this.updateScrollAnswer(scroll, index, q.answer);
        if (onAnswer) {
          setTimeout(() => onAnswer(index, index === q.answer), 500);
        }
      }
    });

    targetElement.innerHTML = '';
    targetElement.appendChild(scroll);
    return scroll;
  },

  // ═══════════════════════════════════════════════════════════════
  // ANSWER SCROLL RENDERING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Render a single answer option as a scroll banner
   * @param {string} text - The answer text
   * @param {number} index - The option index (0-3 for A-D)
   * @param {Object} options - Rendering options
   * @returns {HTMLElement} The answer scroll element
   */
  renderAnswerScroll(text, index, options = {}) {
    const {
      selected = false,
      correct = false,
      incorrect = false,
      disabled = false,
      onClick = null
    } = options;

    const scroll = document.createElement('div');
    scroll.className = 'answer-scroll';
    scroll.dataset.index = index;

    if (selected) scroll.classList.add('selected');
    if (correct) scroll.classList.add('correct');
    if (incorrect) scroll.classList.add('incorrect');
    if (disabled) scroll.classList.add('disabled');

    const letter = String.fromCharCode(65 + index); // A, B, C, D

    scroll.innerHTML = `
      <div class="answer-letter">${letter}</div>
      <div class="answer-text">${text}</div>
    `;

    if (onClick && !disabled) {
      scroll.addEventListener('click', () => onClick(index));
    }

    return scroll;
  },

  /**
   * Render all answer options as scroll banners
   * @param {Array} options - Array of answer text strings
   * @param {Object} config - Configuration options
   * @returns {HTMLElement} Container with all answer scrolls
   */
  renderAnswerScrolls(options, config = {}) {
    const {
      onSelect = null,
      selectedIndex = null,
      correctIndex = null,
      showResult = false
    } = config;

    const container = document.createElement('div');
    container.className = 'answer-scrolls-container';

    options.forEach((text, index) => {
      const isSelected = selectedIndex === index;
      const isCorrect = showResult && index === correctIndex;
      const isIncorrect = showResult && isSelected && index !== correctIndex;
      const isDisabled = showResult && !isSelected && index !== correctIndex;

      const scroll = this.renderAnswerScroll(text, index, {
        selected: isSelected && !showResult,
        correct: isCorrect,
        incorrect: isIncorrect,
        disabled: isDisabled,
        onClick: onSelect
      });

      container.appendChild(scroll);
    });

    return container;
  },

  /**
   * Update answer scrolls to show selection result
   * @param {HTMLElement} container - The answer scrolls container
   * @param {number} selectedIndex - Which answer was selected
   * @param {number} correctIndex - Which answer is correct
   */
  showAnswerResult(container, selectedIndex, correctIndex) {
    const scrolls = container.querySelectorAll('.answer-scroll');

    scrolls.forEach((scroll, index) => {
      scroll.classList.remove('selected');

      if (index === correctIndex) {
        scroll.classList.add('correct');
      } else if (index === selectedIndex) {
        scroll.classList.add('incorrect');
      } else {
        scroll.classList.add('disabled');
      }
    });
  },

  /**
   * Display a complete question with separate answer scrolls
   * Uses question scroll for the question, answer scrolls for options
   * @param {HTMLElement} targetElement - Where to render
   * @param {Object} question - Question object
   * @param {Function} onAnswer - Callback (index, isCorrect)
   */
  displayQuestionWithAnswerScrolls(targetElement, question, onAnswer) {
    const display = document.createElement('div');
    display.className = 'quiz-card-display';

    // Create question scroll (without embedded answers)
    const questionScroll = document.createElement('div');
    questionScroll.className = 'question-scroll';
    questionScroll.innerHTML = `
      ${question.number ? `<div class="scroll-badge">#${question.number}</div>` : ''}
      <div class="scroll-title">${question.category || 'Question'}</div>
      <div class="scroll-content">
        <div class="question-text">${question.question || question.text}</div>
      </div>
    `;

    // Create answer scrolls
    const answersContainer = this.renderAnswerScrolls(question.options, {
      onSelect: (index) => {
        // Show result
        this.showAnswerResult(answersContainer, index, question.answer);

        // Callback after animation
        if (onAnswer) {
          setTimeout(() => {
            onAnswer(index, index === question.answer);
          }, 600);
        }
      }
    });

    display.appendChild(questionScroll);
    display.appendChild(answersContainer);

    targetElement.innerHTML = '';
    targetElement.appendChild(display);

    return { questionScroll, answersContainer, display };
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CardTemplates.init());
} else {
  CardTemplates.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardTemplates;
}
