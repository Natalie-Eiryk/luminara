/**
 * 820.31.83-dynamic-backgrounds.js - Dynamic Category Backgrounds
 * @codon 820.31.83
 * @version 2026-03-29
 * @description Living, breathing environments that react to gameplay
 *
 * Features:
 * - Category-themed biomes with unique visuals
 * - Parallax layered backgrounds
 * - Reactive particles (correct/wrong/combo)
 * - Intensity-based effects
 * - Smooth transitions between categories
 */

const DynamicBackgrounds = {
    // Configuration
    config: {
        enabled: true,
        particlesEnabled: true,
        parallaxEnabled: true,
        animationsEnabled: true,
        quality: 'high' // 'low', 'medium', 'high'
    },

    // Current state
    state: {
        currentBiome: null,
        intensity: 0,
        particles: [],
        animationFrame: null
    },

    // Biome definitions by category prefix
    biomes: {
        '000': {
            name: 'Cellular',
            description: 'Floating organelles, mitochondria pulsing with energy',
            colors: {
                base: '#0a2f23',
                mid: '#134e3d',
                accent: '#4ade80',
                glow: '#22c55e'
            },
            particles: {
                type: 'organelles',
                count: 30,
                shapes: ['circle', 'oval', 'blob'],
                colors: ['#4ade80', '#22c55e', '#86efac', '#bbf7d0'],
                sizeRange: [10, 40],
                speedRange: [0.2, 1]
            },
            elements: [
                { type: 'mitochondria', count: 5 },
                { type: 'ribosome', count: 10 },
                { type: 'membrane', count: 1 }
            ]
        },

        '100': {
            name: 'Neural',
            description: 'Synapse lightning storms, neurotransmitter rain',
            colors: {
                base: '#1a1033',
                mid: '#2d1b4e',
                accent: '#a855f7',
                glow: '#7c3aed'
            },
            particles: {
                type: 'neurotransmitters',
                count: 40,
                shapes: ['spark', 'dot', 'line'],
                colors: ['#a855f7', '#7c3aed', '#c084fc', '#e879f9'],
                sizeRange: [3, 15],
                speedRange: [1, 3]
            },
            elements: [
                { type: 'synapse', count: 8 },
                { type: 'axon', count: 3 },
                { type: 'lightning', count: 2 }
            ]
        },

        '200': {
            name: 'Sensory',
            description: 'Eye motifs, sound waves, tactile textures',
            colors: {
                base: '#1a1a2e',
                mid: '#16213e',
                accent: '#00d9ff',
                glow: '#0088cc'
            },
            particles: {
                type: 'waves',
                count: 25,
                shapes: ['wave', 'circle', 'ring'],
                colors: ['#00d9ff', '#0088cc', '#88ddff', '#ffffff'],
                sizeRange: [5, 30],
                speedRange: [0.5, 2]
            },
            elements: [
                { type: 'eye', count: 3 },
                { type: 'soundwave', count: 5 },
                { type: 'spectrum', count: 1 }
            ]
        },

        '400': {
            name: 'Tissue',
            description: 'Muscle fiber contractions, collagen weaving, healing',
            colors: {
                base: '#2d1515',
                mid: '#4a2020',
                accent: '#f87171',
                glow: '#ef4444'
            },
            particles: {
                type: 'fibers',
                count: 35,
                shapes: ['line', 'strand', 'weave'],
                colors: ['#f87171', '#ef4444', '#fca5a5', '#fecaca'],
                sizeRange: [8, 25],
                speedRange: [0.3, 1.5]
            },
            elements: [
                { type: 'fiber', count: 8 },
                { type: 'collagen', count: 5 },
                { type: 'healing', count: 2 }
            ]
        },

        '500': {
            name: 'Organ Systems',
            description: 'Heartbeat camera pulse, breathing expansion, blood flow',
            colors: {
                base: '#2a0a0a',
                mid: '#4a1010',
                accent: '#dc2626',
                glow: '#b91c1c'
            },
            particles: {
                type: 'bloodcells',
                count: 50,
                shapes: ['disc', 'circle'],
                colors: ['#dc2626', '#b91c1c', '#ef4444', '#991b1b'],
                sizeRange: [8, 20],
                speedRange: [1, 4]
            },
            elements: [
                { type: 'heartbeat', count: 1 },
                { type: 'bloodflow', count: 3 },
                { type: 'vessel', count: 5 }
            ]
        },

        '600': {
            name: 'Endocrine',
            description: 'Hormone cascades, gland pulses, chemical signals',
            colors: {
                base: '#1a2a1a',
                mid: '#2a4a2a',
                accent: '#84cc16',
                glow: '#65a30d'
            },
            particles: {
                type: 'hormones',
                count: 30,
                shapes: ['hexagon', 'circle', 'diamond'],
                colors: ['#84cc16', '#65a30d', '#a3e635', '#bef264'],
                sizeRange: [6, 18],
                speedRange: [0.5, 2]
            },
            elements: [
                { type: 'gland', count: 4 },
                { type: 'cascade', count: 3 },
                { type: 'receptor', count: 6 }
            ]
        },

        // Default fallback
        'default': {
            name: 'Knowledge',
            description: 'Abstract knowledge space',
            colors: {
                base: '#1a1a2e',
                mid: '#2a2a4e',
                accent: '#60a5fa',
                glow: '#3b82f6'
            },
            particles: {
                type: 'stars',
                count: 30,
                shapes: ['circle', 'star'],
                colors: ['#60a5fa', '#3b82f6', '#93c5fd', '#ffffff'],
                sizeRange: [3, 12],
                speedRange: [0.2, 1]
            },
            elements: []
        }
    },

    // Container element
    container: null,
    canvas: null,
    ctx: null,

    // Initialize the background system
    init() {
        this.createContainer();
        this.loadSettings();
        return true;
    },

    // Create the background container
    createContainer() {
        if (document.getElementById('dynamic-background')) return;

        // Main container
        this.container = document.createElement('div');
        this.container.id = 'dynamic-background';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
            transition: background-color 0.5s ease;
        `;

        // Canvas for particle rendering
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        this.container.appendChild(this.canvas);

        // Gradient overlay
        const overlay = document.createElement('div');
        overlay.id = 'background-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%);
            pointer-events: none;
        `;
        this.container.appendChild(overlay);

        document.body.insertBefore(this.container, document.body.firstChild);

        // Setup canvas
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Inject styles
        this.injectStyles();
    },

    // Resize canvas to window size
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    // Inject background-specific styles
    injectStyles() {
        if (document.getElementById('background-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'background-styles';
        styles.textContent = `
            /* Biome-specific element animations */
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
            }

            @keyframes drift {
                0% { transform: translateX(-10px); }
                100% { transform: translateX(10px); }
            }

            @keyframes synapseFire {
                0% { opacity: 0; transform: scale(0); }
                50% { opacity: 1; transform: scale(1.2); }
                100% { opacity: 0; transform: scale(0.5); }
            }

            @keyframes heartbeat {
                0%, 100% { transform: scale(1); }
                15% { transform: scale(1.1); }
                30% { transform: scale(1); }
                45% { transform: scale(1.05); }
            }

            @keyframes bloodFlow {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }

            .biome-element {
                position: absolute;
                pointer-events: none;
                opacity: 0.6;
            }

            .biome-element.mitochondria {
                width: 60px;
                height: 30px;
                background: radial-gradient(ellipse, #4ade80 0%, #22c55e 50%, transparent 100%);
                border-radius: 50%;
                animation: float 4s ease-in-out infinite, pulse 2s ease-in-out infinite;
            }

            .biome-element.synapse {
                width: 40px;
                height: 40px;
                background: radial-gradient(circle, #a855f7 0%, transparent 70%);
                border-radius: 50%;
                animation: synapseFire 0.5s ease-out infinite;
                animation-delay: var(--delay, 0s);
            }

            .biome-element.eye {
                width: 80px;
                height: 80px;
                background: radial-gradient(circle at 30% 30%,
                    white 0%, white 20%,
                    #00d9ff 20%, #00d9ff 40%,
                    black 40%, black 50%,
                    transparent 50%);
                border-radius: 50%;
                animation: float 6s ease-in-out infinite;
            }

            .biome-element.fiber {
                width: 100px;
                height: 4px;
                background: linear-gradient(90deg, transparent, #f87171, transparent);
                animation: drift 2s ease-in-out infinite alternate;
            }

            .biome-element.heartbeat {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 50%,
                    rgba(220, 38, 38, 0.3) 0%,
                    transparent 50%);
                animation: heartbeat 1s ease-in-out infinite;
            }

            .biome-element.bloodcell {
                width: 20px;
                height: 8px;
                background: #dc2626;
                border-radius: 50%;
                animation: bloodFlow 3s linear infinite;
            }

            /* Intensity effects */
            .intensity-low { filter: saturate(0.8); }
            .intensity-medium { filter: saturate(1.2); }
            .intensity-high { filter: saturate(1.5) brightness(1.1); }
            .intensity-max { filter: saturate(2) brightness(1.2); animation: intensePulse 0.5s ease-in-out infinite; }

            @keyframes intensePulse {
                0%, 100% { filter: saturate(2) brightness(1.2); }
                50% { filter: saturate(2.5) brightness(1.4); }
            }
        `;
        document.head.appendChild(styles);
    },

    // Load settings from localStorage (with prototype pollution protection)
    loadSettings() {
        try {
            const saved = localStorage.getItem('luminara_bg_settings');
            if (saved && typeof QuizSecurity !== 'undefined') {
                QuizSecurity.safeAssign(this.config, QuizSecurity.safeJsonParse(saved, {}));
            } else if (saved) {
                // Fallback if QuizSecurity not loaded yet
                const settings = JSON.parse(saved);
                for (const key of Object.keys(settings)) {
                    if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
                        this.config[key] = settings[key];
                    }
                }
            }
        } catch (e) {
            // Use defaults
        }
    },

    // Set current biome based on category
    setCurrent(categoryId) {
        if (!this.config.enabled) return;

        const prefix = categoryId?.substring(0, 3) || 'default';
        const biome = this.biomes[prefix] || this.biomes['default'];

        if (this.state.currentBiome === prefix) return;

        this.state.currentBiome = prefix;

        // Set background color
        if (this.container) {
            this.container.style.backgroundColor = biome.colors.base;
        }

        // Clear existing elements
        this.clearElements();

        // Create new biome elements
        this.createBiomeElements(biome);

        // Initialize particles
        this.initParticles(biome);

        // Start animation loop if not running
        if (!this.state.animationFrame && this.config.animationsEnabled) {
            this.animate();
        }
    },

    // Clear biome elements
    clearElements() {
        if (!this.container) return;

        const elements = this.container.querySelectorAll('.biome-element');
        elements.forEach(el => el.remove());
    },

    // Create biome-specific elements
    createBiomeElements(biome) {
        if (!this.container || !biome.elements) return;

        biome.elements.forEach(elementDef => {
            for (let i = 0; i < elementDef.count; i++) {
                const el = document.createElement('div');
                el.className = `biome-element ${elementDef.type}`;
                el.style.left = `${Math.random() * 100}%`;
                el.style.top = `${Math.random() * 100}%`;
                el.style.setProperty('--delay', `${Math.random() * 2}s`);
                this.container.appendChild(el);
            }
        });
    },

    // Initialize particle system
    initParticles(biome) {
        this.state.particles = [];

        if (!biome.particles || !this.config.particlesEnabled) return;

        const count = this.getParticleCount(biome.particles.count);

        for (let i = 0; i < count; i++) {
            this.state.particles.push(this.createParticle(biome.particles));
        }
    },

    // Get particle count based on quality setting
    getParticleCount(base) {
        const multipliers = { low: 0.3, medium: 0.6, high: 1 };
        return Math.floor(base * (multipliers[this.config.quality] || 1));
    },

    // Create a single particle
    createParticle(config) {
        const sizeRange = config.sizeRange || [5, 15];
        const speedRange = config.speedRange || [0.5, 2];

        return {
            x: Math.random() * (this.canvas?.width || window.innerWidth),
            y: Math.random() * (this.canvas?.height || window.innerHeight),
            size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
            speedX: (Math.random() - 0.5) * speedRange[1],
            speedY: (Math.random() - 0.5) * speedRange[1],
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            shape: config.shapes[Math.floor(Math.random() * config.shapes.length)],
            opacity: 0.3 + Math.random() * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };
    },

    // Animation loop
    animate() {
        if (!this.config.animationsEnabled) return;

        this.updateParticles();
        this.renderParticles();

        this.state.animationFrame = requestAnimationFrame(() => this.animate());
    },

    // Update particle positions
    updateParticles() {
        const width = this.canvas?.width || window.innerWidth;
        const height = this.canvas?.height || window.innerHeight;

        // Apply intensity-based speed multiplier
        const speedMult = 1 + this.state.intensity * 0.5;

        this.state.particles.forEach(p => {
            p.x += p.speedX * speedMult;
            p.y += p.speedY * speedMult;
            p.rotation += p.rotationSpeed;

            // Wrap around edges
            if (p.x < -p.size) p.x = width + p.size;
            if (p.x > width + p.size) p.x = -p.size;
            if (p.y < -p.size) p.y = height + p.size;
            if (p.y > height + p.size) p.y = -p.size;
        });
    },

    // Render particles to canvas
    renderParticles() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.state.particles.forEach(p => {
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = p.opacity * (0.5 + this.state.intensity * 0.5);

            this.drawParticleShape(p);

            this.ctx.restore();
        });
    },

    // Draw particle shape
    drawParticleShape(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();

        switch (p.shape) {
            case 'circle':
            case 'dot':
            case 'disc':
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                break;

            case 'oval':
            case 'blob':
                this.ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
                break;

            case 'spark':
            case 'star':
                this.drawStar(p.size / 2, 5);
                break;

            case 'line':
            case 'strand':
                this.ctx.rect(-p.size / 2, -1, p.size, 2);
                break;

            case 'wave':
            case 'ring':
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                return;

            case 'hexagon':
                this.drawPolygon(p.size / 2, 6);
                break;

            case 'diamond':
                this.drawPolygon(p.size / 2, 4);
                break;

            default:
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        }

        this.ctx.fill();

        // Add glow for intensity
        if (this.state.intensity > 0.5) {
            this.ctx.shadowBlur = p.size * this.state.intensity;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    },

    // Draw star shape
    drawStar(radius, points) {
        const step = Math.PI / points;
        this.ctx.moveTo(0, -radius);
        for (let i = 0; i < 2 * points; i++) {
            const r = (i % 2 === 0) ? radius : radius / 2;
            const x = r * Math.sin(i * step);
            const y = -r * Math.cos(i * step);
            this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
    },

    // Draw polygon shape
    drawPolygon(radius, sides) {
        const step = (Math.PI * 2) / sides;
        this.ctx.moveTo(radius, 0);
        for (let i = 1; i <= sides; i++) {
            this.ctx.lineTo(
                radius * Math.cos(i * step),
                radius * Math.sin(i * step)
            );
        }
        this.ctx.closePath();
    },

    // Set intensity level (0-1)
    setIntensity(level) {
        this.state.intensity = Math.max(0, Math.min(1, level));

        // Update container class for CSS effects
        if (this.container) {
            this.container.classList.remove('intensity-low', 'intensity-medium', 'intensity-high', 'intensity-max');

            if (level < 0.25) {
                this.container.classList.add('intensity-low');
            } else if (level < 0.5) {
                this.container.classList.add('intensity-medium');
            } else if (level < 0.75) {
                this.container.classList.add('intensity-high');
            } else {
                this.container.classList.add('intensity-max');
            }
        }
    },

    // React to game events
    react(event) {
        if (!this.config.enabled) return;

        switch (event) {
            case 'correct':
                this.flashReaction('correct');
                this.setIntensity(Math.min(1, this.state.intensity + 0.1));
                break;

            case 'wrong':
                this.flashReaction('wrong');
                this.setIntensity(Math.max(0, this.state.intensity - 0.15));
                break;

            case 'combo':
                this.flashReaction('combo');
                this.setIntensity(Math.min(1, this.state.intensity + 0.15));
                break;

            case 'boss':
                this.setIntensity(0.8);
                this.bossMode();
                break;

            case 'victory':
                this.flashReaction('victory');
                break;

            case 'reset':
                this.setIntensity(0.3);
                break;
        }
    },

    // Flash reaction effect
    flashReaction(type) {
        if (!this.container) return;

        const colors = {
            correct: '#22c55e',
            wrong: '#ef4444',
            combo: '#fbbf24',
            victory: '#ffd700'
        };

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${colors[type] || '#ffffff'};
            opacity: 0.2;
            pointer-events: none;
            transition: opacity 0.3s ease-out;
        `;
        this.container.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '0';
        });

        setTimeout(() => overlay.remove(), 300);
    },

    // Boss mode visual effects
    bossMode() {
        if (!this.container) return;

        // Add dark vignette
        const vignette = document.createElement('div');
        vignette.id = 'boss-vignette';
        vignette.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, transparent 40%, rgba(139, 0, 0, 0.4) 100%);
            pointer-events: none;
            animation: bossVignette 2s ease-in-out infinite;
        `;
        this.container.appendChild(vignette);

        // Add style if not exists
        if (!document.getElementById('boss-mode-style')) {
            const style = document.createElement('style');
            style.id = 'boss-mode-style';
            style.textContent = `
                @keyframes bossVignette {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Clear boss mode
    clearBossMode() {
        const vignette = document.getElementById('boss-vignette');
        if (vignette) vignette.remove();
    },

    // Enable/disable background
    setEnabled(enabled) {
        this.config.enabled = enabled;

        if (this.container) {
            this.container.style.display = enabled ? 'block' : 'none';
        }

        if (!enabled && this.state.animationFrame) {
            cancelAnimationFrame(this.state.animationFrame);
            this.state.animationFrame = null;
        } else if (enabled && !this.state.animationFrame) {
            this.animate();
        }
    },

    // Set quality level
    setQuality(quality) {
        this.config.quality = quality;
        // Reinitialize particles with new count
        if (this.state.currentBiome) {
            const biome = this.biomes[this.state.currentBiome] || this.biomes['default'];
            this.initParticles(biome);
        }
    },

    // Get current settings
    getSettings() {
        return { ...this.config };
    },

    // Cleanup
    destroy() {
        if (this.state.animationFrame) {
            cancelAnimationFrame(this.state.animationFrame);
        }
        if (this.container) {
            this.container.remove();
        }
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DynamicBackgrounds.init());
    } else {
        DynamicBackgrounds.init();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicBackgrounds;
}
