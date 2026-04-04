/**
 * 820.31.84-artistry-engine.js - Comprehensive Game Artistry System
 * @codon 820.31.84
 * @version 2026-03-30
 * @description 13-point artistry upgrade implementing AAA visual polish
 *
 * Features:
 * 1. Biome Expansion (5 new themed backgrounds)
 * 2. Boss Phase Transitions
 * 3. Monster Sprite System
 * 4. Streak Visualization
 * 5. Answer Button Juice
 * 6. Victory Celebration Tiers
 * 7. Map Mode Visual Overhaul
 * 8. Damage Feedback Enhancement
 * 9. Loading & Transition Screens
 * 10. Dynamic UI Theming
 * 11. Explanation Card Artistry
 * 12. Power-Up Activation Effects
 * 13. Ambient Polish Layer
 */

const ArtistryEngine = {
    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    config: {
        enabled: true,
        ambientParticles: true,
        scanlines: false,
        warmFilter: false,
        reducedMotion: false,
        quality: 'high' // 'low', 'medium', 'high'
    },

    state: {
        currentStreak: 0,
        currentCombo: 0,
        sessionDuration: 0,
        isOnFire: false,
        currentBiome: null,
        bossPhase: 1,
        ambientFrame: null
    },

    // ═══════════════════════════════════════════════════════════════
    // #1: BIOME EXPANSION - 5 New Themed Backgrounds
    // ═══════════════════════════════════════════════════════════════

    newBiomes: {
        '300': {
            name: 'Cardiovascular',
            description: 'Pumping hearts, flowing blood vessels, pulsing arteries',
            colors: {
                base: '#2a0a0a',
                mid: '#4a1515',
                accent: '#ef4444',
                glow: '#dc2626'
            },
            particles: {
                type: 'bloodcells',
                count: 45,
                shapes: ['disc', 'oval'],
                colors: ['#ef4444', '#dc2626', '#b91c1c', '#fca5a5'],
                sizeRange: [6, 18],
                speedRange: [2, 5]
            },
            elements: [
                { type: 'heart-pulse', count: 1 },
                { type: 'vessel', count: 4 },
                { type: 'bloodflow', count: 6 }
            ]
        },

        '350': {
            name: 'Respiratory',
            description: 'Floating alveoli, oxygen bubbles, bronchial trees',
            colors: {
                base: '#0a1a2a',
                mid: '#153045',
                accent: '#38bdf8',
                glow: '#0ea5e9'
            },
            particles: {
                type: 'oxygen',
                count: 40,
                shapes: ['bubble', 'circle'],
                colors: ['#38bdf8', '#0ea5e9', '#7dd3fc', '#bae6fd'],
                sizeRange: [4, 20],
                speedRange: [0.5, 2]
            },
            elements: [
                { type: 'alveolus', count: 8 },
                { type: 'bronchus', count: 3 },
                { type: 'oxygen-bubble', count: 15 }
            ]
        },

        '450': {
            name: 'Digestive',
            description: 'Enzyme cascades, peristaltic waves, villi forests',
            colors: {
                base: '#1a1a0a',
                mid: '#2a2a15',
                accent: '#facc15',
                glow: '#eab308'
            },
            particles: {
                type: 'enzymes',
                count: 35,
                shapes: ['hexagon', 'diamond', 'circle'],
                colors: ['#facc15', '#eab308', '#fde047', '#fef08a'],
                sizeRange: [5, 15],
                speedRange: [0.3, 1.5]
            },
            elements: [
                { type: 'villus', count: 12 },
                { type: 'enzyme', count: 8 },
                { type: 'wave', count: 2 }
            ]
        },

        '550': {
            name: 'Muscular',
            description: 'Contracting sarcomeres, sliding filaments, ATP sparks',
            colors: {
                base: '#1a0a1a',
                mid: '#2a152a',
                accent: '#f472b6',
                glow: '#ec4899'
            },
            particles: {
                type: 'atp',
                count: 30,
                shapes: ['spark', 'line', 'star'],
                colors: ['#f472b6', '#ec4899', '#f9a8d4', '#fbcfe8'],
                sizeRange: [3, 12],
                speedRange: [1, 4]
            },
            elements: [
                { type: 'sarcomere', count: 6 },
                { type: 'filament', count: 10 },
                { type: 'atp-spark', count: 8 }
            ]
        },

        '650': {
            name: 'Urinary',
            description: 'Nephron filters, glomerular rain, tubule spirals',
            colors: {
                base: '#0a1a1a',
                mid: '#152a2a',
                accent: '#2dd4bf',
                glow: '#14b8a6'
            },
            particles: {
                type: 'filtrate',
                count: 35,
                shapes: ['drop', 'circle', 'wave'],
                colors: ['#2dd4bf', '#14b8a6', '#5eead4', '#99f6e4'],
                sizeRange: [4, 14],
                speedRange: [0.8, 2.5]
            },
            elements: [
                { type: 'nephron', count: 4 },
                { type: 'glomerulus', count: 6 },
                { type: 'tubule', count: 5 }
            ]
        }
    },

    // Register new biomes with DynamicBackgrounds
    registerNewBiomes() {
        if (typeof DynamicBackgrounds !== 'undefined') {
            Object.assign(DynamicBackgrounds.biomes, this.newBiomes);
            console.log('[Artistry] Registered 5 new biomes');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // #2: BOSS PHASE TRANSITIONS
    // ═══════════════════════════════════════════════════════════════

    bossPhaseTransition(newPhase, bossName) {
        this.state.bossPhase = newPhase;

        const container = document.getElementById('particle-container') || document.body;

        // Screen distortion wave
        const distortion = document.createElement('div');
        distortion.className = 'boss-phase-distortion';
        distortion.innerHTML = `
            <div class="distortion-ring"></div>
            <div class="phase-banner">
                <span class="phase-number">PHASE ${newPhase}</span>
                <span class="phase-subtitle">${this.getPhaseSubtitle(newPhase)}</span>
            </div>
        `;
        container.appendChild(distortion);

        // Intensity spike
        if (typeof DynamicBackgrounds !== 'undefined') {
            DynamicBackgrounds.setIntensity(1.0);
        }

        // Screen shake
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.screenShake('heavy');
        }

        // Sound
        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play('boss_intro');
        }

        // Remove after animation
        setTimeout(() => {
            distortion.remove();
            if (typeof DynamicBackgrounds !== 'undefined') {
                DynamicBackgrounds.setIntensity(0.7);
            }
        }, 2000);
    },

    getPhaseSubtitle(phase) {
        const subtitles = {
            2: 'DESPERATE MEASURES',
            3: 'FINAL FORM'
        };
        return subtitles[phase] || 'INTENSIFYING';
    },

    // ═══════════════════════════════════════════════════════════════
    // #3: MONSTER SPRITE SYSTEM (CSS Pixel Art)
    // ═══════════════════════════════════════════════════════════════

    monsterSprites: {
        'cell-slime': {
            idle: [
                // Frame 1 - neutral
                `radial-gradient(ellipse 80% 60% at 50% 60%, var(--monster-color) 0%, transparent 100%)`,
                // Frame 2 - squish
                `radial-gradient(ellipse 90% 50% at 50% 65%, var(--monster-color) 0%, transparent 100%)`
            ],
            color: '#4ade80',
            eyes: { x: 40, y: 35, size: 8, spacing: 20 }
        },
        'mind-flayer': {
            idle: [
                `radial-gradient(ellipse 70% 90% at 50% 40%, var(--monster-color) 0%, transparent 100%)`,
                `radial-gradient(ellipse 65% 95% at 50% 38%, var(--monster-color) 0%, transparent 100%)`
            ],
            color: '#a855f7',
            eyes: { x: 40, y: 30, size: 10, spacing: 25 },
            tentacles: 4
        },
        'synapse-serpent': {
            idle: [
                `linear-gradient(135deg, transparent 20%, var(--monster-color) 50%, transparent 80%)`,
                `linear-gradient(140deg, transparent 18%, var(--monster-color) 52%, transparent 82%)`
            ],
            color: '#3b82f6',
            eyes: { x: 65, y: 25, size: 6, spacing: 0 }
        },
        'tissue-titan': {
            idle: [
                `repeating-linear-gradient(0deg, var(--monster-color) 0px, var(--monster-color) 4px, transparent 4px, transparent 8px)`,
                `repeating-linear-gradient(2deg, var(--monster-color) 0px, var(--monster-color) 4px, transparent 4px, transparent 8px)`
            ],
            color: '#f97316',
            eyes: { x: 35, y: 20, size: 12, spacing: 30 }
        }
    },

    createMonsterSprite(spriteId, container) {
        const sprite = this.monsterSprites[spriteId];
        if (!sprite) return null;

        const el = document.createElement('div');
        el.className = 'monster-sprite-animated';
        el.style.setProperty('--monster-color', sprite.color);
        el.innerHTML = `
            <div class="sprite-body"></div>
            <div class="sprite-eyes">
                <div class="sprite-eye left"></div>
                ${sprite.eyes.spacing > 0 ? '<div class="sprite-eye right"></div>' : ''}
            </div>
            ${sprite.tentacles ? '<div class="sprite-tentacles"></div>' : ''}
        `;

        // Animate idle
        let frame = 0;
        const animateIdle = () => {
            if (!el.isConnected) return;
            el.querySelector('.sprite-body').style.background = sprite.idle[frame % sprite.idle.length];
            frame++;
            setTimeout(animateIdle, 500);
        };
        animateIdle();

        if (container) container.appendChild(el);
        return el;
    },

    monsterHitReaction(spriteEl) {
        if (!spriteEl) return;
        spriteEl.classList.add('monster-hit');
        setTimeout(() => spriteEl.classList.remove('monster-hit'), 300);
    },

    monsterDefeated(spriteEl) {
        if (!spriteEl) return;
        spriteEl.classList.add('monster-dissolve');

        // Particle dissolution
        const rect = spriteEl.getBoundingClientRect();
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.particleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 'shatter');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // #4: STREAK VISUALIZATION
    // ═══════════════════════════════════════════════════════════════

    updateStreakVisuals(streak) {
        this.state.currentStreak = streak;
        const container = document.querySelector('.question-card, .quiz-container, #questionDisplay');
        if (!container) return;

        // Remove old streak classes
        container.classList.remove('streak-1', 'streak-2', 'streak-3', 'streak-fire');
        document.body.classList.remove('on-fire-mode');

        if (streak >= 10) {
            // ON FIRE mode
            container.classList.add('streak-fire');
            document.body.classList.add('on-fire-mode');
            this.state.isOnFire = true;
            this.startFireParticles();
            if (typeof ScreenEffects !== 'undefined') {
                ScreenEffects.comboFire(10);
            }
        } else if (streak >= 6) {
            container.classList.add('streak-3');
            this.state.isOnFire = false;
            if (typeof ScreenEffects !== 'undefined') {
                ScreenEffects.comboFire(streak);
            }
        } else if (streak >= 3) {
            container.classList.add('streak-2');
            this.startSparkleParticles();
        } else if (streak >= 1) {
            container.classList.add('streak-1');
        }
    },

    startFireParticles() {
        // Fire particles on answer buttons
        const buttons = document.querySelectorAll('.answer-btn, .option-btn');
        buttons.forEach(btn => {
            if (!btn.querySelector('.fire-particles')) {
                const fireContainer = document.createElement('div');
                fireContainer.className = 'fire-particles';
                btn.appendChild(fireContainer);
            }
        });
    },

    startSparkleParticles() {
        const buttons = document.querySelectorAll('.answer-btn, .option-btn');
        buttons.forEach(btn => {
            if (!btn.querySelector('.sparkle-particles')) {
                const sparkleContainer = document.createElement('div');
                sparkleContainer.className = 'sparkle-particles';
                for (let i = 0; i < 5; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.style.setProperty('--delay', `${i * 0.2}s`);
                    sparkle.style.setProperty('--x', `${Math.random() * 100}%`);
                    sparkleContainer.appendChild(sparkle);
                }
                btn.appendChild(sparkleContainer);
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // #5: ANSWER BUTTON JUICE
    // ═══════════════════════════════════════════════════════════════

    initAnswerButtonJuice() {
        // Delegate events for dynamic buttons
        document.addEventListener('mouseenter', (e) => {
            if (e.target.matches('.answer-btn, .option-btn')) {
                this.onButtonHover(e.target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.matches('.answer-btn, .option-btn')) {
                this.onButtonLeave(e.target);
            }
        }, true);

        document.addEventListener('mousedown', (e) => {
            if (e.target.matches('.answer-btn, .option-btn')) {
                this.onButtonPress(e.target, e);
            }
        }, true);
    },

    onButtonHover(btn) {
        if (btn.disabled || btn.classList.contains('disabled')) return;
        btn.classList.add('juice-hover');

        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play('ui_hover');
        }
    },

    onButtonLeave(btn) {
        btn.classList.remove('juice-hover');
    },

    onButtonPress(btn, event) {
        if (btn.disabled || btn.classList.contains('disabled')) return;
        btn.classList.add('juice-press');

        // Ripple effect from click point
        const rect = btn.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);

        setTimeout(() => {
            btn.classList.remove('juice-press');
            ripple.remove();
        }, 400);

        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play('ui_click');
        }
    },

    showCorrectFeedback(btn) {
        btn.classList.add('answer-correct');

        // Checkmark burst
        const rect = btn.getBoundingClientRect();
        const burst = document.createElement('div');
        burst.className = 'correct-burst';
        burst.innerHTML = '<span class="checkmark">✓</span>';
        burst.style.left = `${rect.left + rect.width/2}px`;
        burst.style.top = `${rect.top + rect.height/2}px`;
        document.body.appendChild(burst);

        // Green pulse wave
        btn.classList.add('pulse-correct');

        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.particleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 'gold');
        }

        setTimeout(() => {
            burst.remove();
            btn.classList.remove('pulse-correct');
        }, 600);
    },

    showWrongFeedback(btn) {
        btn.classList.add('answer-wrong');

        // X shatter
        const rect = btn.getBoundingClientRect();
        const shatter = document.createElement('div');
        shatter.className = 'wrong-shatter';
        shatter.innerHTML = '<span class="x-mark">✗</span>';
        shatter.style.left = `${rect.left + rect.width/2}px`;
        shatter.style.top = `${rect.top + rect.height/2}px`;
        document.body.appendChild(shatter);

        // Red shake
        btn.classList.add('shake-wrong');

        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.particleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 'shatter');
            ScreenEffects.screenShake('normal');
        }

        setTimeout(() => {
            shatter.remove();
            btn.classList.remove('shake-wrong');
        }, 500);
    },

    disableOtherButtons(selectedBtn) {
        const buttons = document.querySelectorAll('.answer-btn, .option-btn');
        buttons.forEach(btn => {
            if (btn !== selectedBtn) {
                btn.classList.add('fade-disabled');
            }
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // #6: VICTORY CELEBRATION TIERS
    // ═══════════════════════════════════════════════════════════════

    celebrateVictory(performance) {
        // performance: { firstTryPercent, totalQuestions, correctCount, isBossDefeat, bossName }
        const percent = performance.firstTryPercent || (performance.correctCount / performance.totalQuestions * 100);

        if (performance.isBossDefeat) {
            this.bossDefeatCelebration(performance.bossName);
        } else if (percent >= 100) {
            this.perfectWinCelebration();
        } else if (percent >= 75) {
            this.goodWinCelebration();
        } else if (percent >= 50) {
            this.basicWinCelebration();
        } else {
            this.minimalWinCelebration();
        }
    },

    basicWinCelebration() {
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.confetti(2000);
            ScreenEffects.particleBurst(window.innerWidth/2, window.innerHeight/2, 'gold');
        }
        this.showBanner('VICTORY!', '#ffd700');
    },

    goodWinCelebration() {
        this.basicWinCelebration();

        // Add fireworks
        setTimeout(() => this.launchFirework(window.innerWidth * 0.3, window.innerHeight * 0.3), 200);
        setTimeout(() => this.launchFirework(window.innerWidth * 0.7, window.innerHeight * 0.4), 400);
        setTimeout(() => this.launchFirework(window.innerWidth * 0.5, window.innerHeight * 0.25), 600);

        this.showBanner('EXCELLENT!', '#22c55e');
    },

    perfectWinCelebration() {
        this.goodWinCelebration();

        // Screen-filling celebration
        document.body.classList.add('perfect-victory');

        // Extra fireworks
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.launchFirework(
                    Math.random() * window.innerWidth,
                    Math.random() * window.innerHeight * 0.5
                );
            }, 800 + i * 200);
        }

        // Golden flash
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.screenFlash('#ffd700', 0.4, 300);
        }

        this.showBanner('FLAWLESS!', '#ffd700', true);

        setTimeout(() => {
            document.body.classList.remove('perfect-victory');
        }, 4000);
    },

    bossDefeatCelebration(bossName) {
        this.perfectWinCelebration();

        // Boss-specific explosion
        const center = { x: window.innerWidth/2, y: window.innerHeight/2 };

        if (typeof ScreenEffects !== 'undefined') {
            // Multiple bursts
            for (let i = 0; i < 8; i++) {
                setTimeout(() => {
                    const angle = (i / 8) * Math.PI * 2;
                    const dist = 100;
                    ScreenEffects.particleBurst(
                        center.x + Math.cos(angle) * dist,
                        center.y + Math.sin(angle) * dist,
                        'level'
                    );
                }, i * 100);
            }

            ScreenEffects.screenShake('heavy');
        }

        // Loot explosion effect
        this.lootExplosion(center.x, center.y);

        this.showBanner(`${bossName} DEFEATED!`, '#ef4444', true);
    },

    minimalWinCelebration() {
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.particleBurst(window.innerWidth/2, window.innerHeight/2, 'gold');
        }
    },

    launchFirework(x, y) {
        const container = document.getElementById('particle-container') || document.body;
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${x}px`;
        firework.style.top = `${y}px`;

        // Create explosion particles
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            const angle = (i / 20) * Math.PI * 2;
            const distance = 50 + Math.random() * 50;
            particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            firework.appendChild(particle);
        }

        container.appendChild(firework);
        setTimeout(() => firework.remove(), 1500);
    },

    lootExplosion(x, y) {
        const container = document.getElementById('particle-container') || document.body;
        const lootItems = ['💎', '⭐', '🏆', '📜', '🔮', '💰'];

        for (let i = 0; i < 8; i++) {
            const loot = document.createElement('div');
            loot.className = 'loot-item';
            loot.textContent = lootItems[Math.floor(Math.random() * lootItems.length)];
            const angle = (i / 8) * Math.PI * 2;
            const distance = 80 + Math.random() * 40;
            loot.style.left = `${x}px`;
            loot.style.top = `${y}px`;
            loot.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            loot.style.setProperty('--ty', `${Math.sin(angle) * distance - 50}px`);
            container.appendChild(loot);
            setTimeout(() => loot.remove(), 1500);
        }
    },

    showBanner(text, color, isLarge = false) {
        const banner = document.createElement('div');
        banner.className = `victory-banner ${isLarge ? 'large' : ''}`;
        banner.style.setProperty('--banner-color', color);
        banner.textContent = text;
        document.body.appendChild(banner);

        setTimeout(() => {
            banner.classList.add('fade-out');
            setTimeout(() => banner.remove(), 500);
        }, 2500);
    },

    // ═══════════════════════════════════════════════════════════════
    // #7: MAP MODE VISUAL OVERHAUL
    // ═══════════════════════════════════════════════════════════════

    enhanceMapCell(cell, cellData) {
        // cellData: { explored, current, hasTreasure, hasMonster, isBoss, visited }

        if (!cellData.explored && !cellData.current) {
            cell.classList.add('fog-of-war');
        }

        if (cellData.visited && !cellData.current) {
            this.addBreadcrumb(cell);
        }

        if (cellData.hasTreasure && !cellData.explored) {
            cell.classList.add('treasure-glow');
        }

        if (cellData.hasMonster && !cellData.explored) {
            this.addMonsterSilhouette(cell);
        }

        if (cellData.isBoss) {
            cell.classList.add('boss-cell');
            this.addBossGlow(cell);
        }
    },

    addBreadcrumb(cell) {
        if (cell.querySelector('.breadcrumb')) return;
        const crumb = document.createElement('div');
        crumb.className = 'breadcrumb';
        cell.appendChild(crumb);
    },

    addMonsterSilhouette(cell) {
        if (cell.querySelector('.monster-silhouette')) return;
        const silhouette = document.createElement('div');
        silhouette.className = 'monster-silhouette';
        silhouette.textContent = '?';
        cell.appendChild(silhouette);
    },

    addBossGlow(cell) {
        cell.classList.add('ominous-glow');
    },

    animateTreasureOpen(cell) {
        cell.classList.add('treasure-opening');

        const chest = cell.querySelector('.treasure-chest');
        if (chest) {
            chest.classList.add('open');
        }

        // Particle burst
        const rect = cell.getBoundingClientRect();
        if (typeof ScreenEffects !== 'undefined') {
            ScreenEffects.particleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 'gold');
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // #8: DAMAGE FEEDBACK ENHANCEMENT
    // ═══════════════════════════════════════════════════════════════

    showEnhancedDamage(options) {
        // options: { amount, x, y, type, isCrit, isHeal, comboMultiplier, damageType }
        const container = document.getElementById('particle-container') || document.body;

        const num = document.createElement('div');
        num.className = 'enhanced-damage-number';

        if (options.isHeal) {
            num.classList.add('heal');
            num.textContent = `+${options.amount}`;
        } else {
            num.textContent = options.isCrit ? `${options.amount}!` : `-${options.amount}`;
        }

        if (options.isCrit) {
            num.classList.add('critical');
        }

        // Damage type indicator
        if (options.damageType) {
            const typeIcons = {
                fire: '🔥',
                shock: '⚡',
                poison: '💧',
                holy: '✨',
                dark: '💀'
            };
            if (typeIcons[options.damageType]) {
                num.setAttribute('data-type', typeIcons[options.damageType]);
            }
        }

        // Physics-based positioning
        const startX = options.x + (Math.random() - 0.5) * 30;
        const startY = options.y;
        const driftX = (Math.random() - 0.5) * 60;

        num.style.left = `${startX}px`;
        num.style.top = `${startY}px`;
        num.style.setProperty('--drift-x', `${driftX}px`);

        container.appendChild(num);

        // Combo multiplier banner
        if (options.comboMultiplier && options.comboMultiplier > 1) {
            this.showComboMultiplier(options.x, options.y - 40, options.comboMultiplier);
        }

        setTimeout(() => num.remove(), 1200);
    },

    showComboMultiplier(x, y, multiplier) {
        const container = document.getElementById('particle-container') || document.body;

        const combo = document.createElement('div');
        combo.className = 'combo-multiplier-banner';
        combo.textContent = `${multiplier}x`;
        combo.style.left = `${x}px`;
        combo.style.top = `${y}px`;

        container.appendChild(combo);
        setTimeout(() => combo.remove(), 800);
    },

    // ═══════════════════════════════════════════════════════════════
    // #9: LOADING & TRANSITION SCREENS
    // ═══════════════════════════════════════════════════════════════

    showTransition(type, data) {
        // type: 'category-start', 'question', 'bank-complete', 'session-end'
        const transition = document.createElement('div');
        transition.className = `transition-screen transition-${type}`;

        switch (type) {
            case 'category-start':
                transition.innerHTML = `
                    <div class="transition-icon">${data.icon || '📚'}</div>
                    <div class="transition-title">${data.categoryName}</div>
                    <div class="transition-subtitle">Get Ready!</div>
                `;
                break;

            case 'question':
                transition.innerHTML = `<div class="card-flip-container"><div class="card-flip"></div></div>`;
                break;

            case 'bank-complete':
                transition.innerHTML = `
                    <div class="progress-celebration">
                        <div class="progress-bar-big">
                            <div class="progress-fill" style="width: ${data.percent}%"></div>
                        </div>
                        <div class="progress-text">${data.correct}/${data.total} Correct!</div>
                    </div>
                `;
                break;

            case 'session-end':
                transition.innerHTML = `
                    <div class="session-summary">
                        <div class="grade-reveal">
                            <span class="grade-letter">${data.grade}</span>
                        </div>
                        <div class="session-stats">
                            <div class="stat">Questions: ${data.total}</div>
                            <div class="stat">Correct: ${data.correct}</div>
                            <div class="stat">Streak: ${data.bestStreak}</div>
                        </div>
                    </div>
                `;
                break;
        }

        document.body.appendChild(transition);

        // Animate in
        requestAnimationFrame(() => {
            transition.classList.add('active');
        });

        const duration = type === 'question' ? 400 : 1500;

        return new Promise(resolve => {
            setTimeout(() => {
                transition.classList.add('fade-out');
                setTimeout(() => {
                    transition.remove();
                    resolve();
                }, 300);
            }, duration);
        });
    },

    // ═══════════════════════════════════════════════════════════════
    // #10: DYNAMIC UI THEMING
    // ═══════════════════════════════════════════════════════════════

    applyBiomeTheme(biomeKey) {
        const biome = this.newBiomes[biomeKey] ||
                      (typeof DynamicBackgrounds !== 'undefined' ? DynamicBackgrounds.biomes[biomeKey] : null);

        if (!biome) return;

        this.state.currentBiome = biomeKey;

        // Set CSS variables for theming
        document.documentElement.style.setProperty('--biome-base', biome.colors.base);
        document.documentElement.style.setProperty('--biome-mid', biome.colors.mid);
        document.documentElement.style.setProperty('--biome-accent', biome.colors.accent);
        document.documentElement.style.setProperty('--biome-glow', biome.colors.glow);

        // Add biome class to body
        document.body.className = document.body.className.replace(/biome-\w+/g, '');
        document.body.classList.add(`biome-${biomeKey}`);
    },

    // ═══════════════════════════════════════════════════════════════
    // #11: EXPLANATION CARD ARTISTRY
    // ═══════════════════════════════════════════════════════════════

    enhanceExplanation(explanationEl, data) {
        // data: { text, keyTerms, relatedConcepts, citations }
        if (!explanationEl) return;

        // Animated reveal
        explanationEl.classList.add('explanation-enhanced');

        // Highlight key terms
        if (data.keyTerms && data.keyTerms.length > 0) {
            let html = explanationEl.innerHTML;
            data.keyTerms.forEach(term => {
                const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                html = html.replace(regex, '<span class="key-term">$1</span>');
            });
            explanationEl.innerHTML = html;
        }

        // Add deep dive button if there's more content
        if (data.relatedConcepts && data.relatedConcepts.length > 0) {
            const deepDive = document.createElement('div');
            deepDive.className = 'deep-dive-section collapsed';
            deepDive.innerHTML = `
                <button class="deep-dive-toggle">📖 Related Concepts</button>
                <div class="deep-dive-content">
                    ${data.relatedConcepts.map(c => `<span class="related-concept">${c}</span>`).join('')}
                </div>
            `;
            explanationEl.appendChild(deepDive);

            deepDive.querySelector('.deep-dive-toggle').addEventListener('click', () => {
                deepDive.classList.toggle('collapsed');
            });
        }

        // Scholarly citation styling
        if (data.citations) {
            const citationEl = document.createElement('div');
            citationEl.className = 'citation-block';
            citationEl.innerHTML = `<span class="citation-icon">📝</span> ${data.citations}`;
            explanationEl.appendChild(citationEl);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // #12: POWER-UP ACTIVATION EFFECTS
    // ═══════════════════════════════════════════════════════════════

    activatePowerUp(powerUpType, sourceEl) {
        const container = document.getElementById('particle-container') || document.body;

        // Card flies to center
        const card = document.createElement('div');
        card.className = 'powerup-activation-card';
        card.textContent = this.getPowerUpEmoji(powerUpType);

        if (sourceEl) {
            const rect = sourceEl.getBoundingClientRect();
            card.style.left = `${rect.left}px`;
            card.style.top = `${rect.top}px`;
        } else {
            card.style.left = '50%';
            card.style.top = '80%';
        }

        container.appendChild(card);

        // Animate to center then shatter
        requestAnimationFrame(() => {
            card.classList.add('fly-to-center');
        });

        setTimeout(() => {
            card.classList.add('shatter');
            this.applyPowerUpEffect(powerUpType);

            // Shatter particles
            if (typeof ScreenEffects !== 'undefined') {
                ScreenEffects.particleBurst(window.innerWidth/2, window.innerHeight/2, 'purple');
            }
        }, 400);

        setTimeout(() => card.remove(), 1000);
    },

    getPowerUpEmoji(type) {
        const emojis = {
            'fifty-fifty': '⚖️',
            'skip': '⏭️',
            'heal': '💚',
            'shield': '🛡️',
            'double-xp': '✨',
            'time-freeze': '⏱️',
            'hint': '💡'
        };
        return emojis[type] || '🎴';
    },

    applyPowerUpEffect(powerUpType) {
        switch (powerUpType) {
            case 'fifty-fifty':
                this.fiftyFiftyEffect();
                break;
            case 'skip':
                this.skipEffect();
                break;
            case 'heal':
                this.healEffect();
                break;
            case 'shield':
                this.shieldEffect();
                break;
        }
    },

    fiftyFiftyEffect() {
        const wrongButtons = document.querySelectorAll('.answer-btn.will-remove, .option-btn[data-wrong="true"]');
        wrongButtons.forEach((btn, i) => {
            setTimeout(() => {
                btn.classList.add('dramatic-cross-out');
            }, i * 200);
        });
    },

    skipEffect() {
        const questionCard = document.querySelector('.question-card, #questionDisplay');
        if (questionCard) {
            questionCard.classList.add('slide-away');
        }
    },

    healEffect() {
        const playerEl = document.querySelector('.player-stats-bar, .player-hp-bar');
        if (playerEl) {
            // Rising heal particles
            const rect = playerEl.getBoundingClientRect();
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    if (typeof ScreenEffects !== 'undefined') {
                        ScreenEffects.particleRise(
                            rect.left + Math.random() * rect.width,
                            rect.bottom,
                            'heal',
                            1
                        );
                    }
                }, i * 50);
            }
        }
    },

    shieldEffect() {
        const shield = document.createElement('div');
        shield.className = 'shield-aura';
        document.body.appendChild(shield);

        setTimeout(() => {
            shield.classList.add('active');
        }, 10);

        // Shield persists for duration (handled by game logic)
    },

    removeShieldEffect() {
        const shield = document.querySelector('.shield-aura');
        if (shield) {
            shield.classList.add('fade-out');
            setTimeout(() => shield.remove(), 500);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // #13: AMBIENT POLISH LAYER
    // ═══════════════════════════════════════════════════════════════

    initAmbientEffects() {
        if (!this.config.ambientParticles) return;

        this.createDustMotes();
        this.createAmbientVignette();

        if (this.config.scanlines) {
            this.createScanlines();
        }

        if (this.config.warmFilter) {
            this.createWarmFilter();
        }

        // Start session duration tracking
        this.state.sessionDuration = 0;
        setInterval(() => {
            this.state.sessionDuration++;
            this.updateAmbientDensity();
        }, 60000); // Every minute
    },

    createDustMotes() {
        const container = document.createElement('div');
        container.id = 'dust-motes';
        container.className = 'dust-motes-container';

        for (let i = 0; i < 20; i++) {
            const mote = document.createElement('div');
            mote.className = 'dust-mote';
            mote.style.setProperty('--delay', `${Math.random() * 10}s`);
            mote.style.setProperty('--duration', `${15 + Math.random() * 10}s`);
            mote.style.setProperty('--x-start', `${Math.random() * 100}%`);
            mote.style.setProperty('--y-start', `${Math.random() * 100}%`);
            container.appendChild(mote);
        }

        document.body.appendChild(container);
    },

    createAmbientVignette() {
        const vignette = document.createElement('div');
        vignette.id = 'ambient-vignette';
        vignette.className = 'ambient-vignette';
        document.body.appendChild(vignette);
    },

    updateVignetteIntensity(combo) {
        const vignette = document.getElementById('ambient-vignette');
        if (vignette) {
            const intensity = Math.min(0.3 + combo * 0.05, 0.6);
            vignette.style.setProperty('--vignette-intensity', intensity);
        }
    },

    createScanlines() {
        const scanlines = document.createElement('div');
        scanlines.id = 'crt-scanlines';
        scanlines.className = 'crt-scanlines';
        document.body.appendChild(scanlines);
    },

    toggleScanlines(enabled) {
        this.config.scanlines = enabled;
        const existing = document.getElementById('crt-scanlines');
        if (enabled && !existing) {
            this.createScanlines();
        } else if (!enabled && existing) {
            existing.remove();
        }
    },

    createWarmFilter() {
        const filter = document.createElement('div');
        filter.id = 'warm-filter';
        filter.className = 'warm-study-filter';
        document.body.appendChild(filter);
    },

    toggleWarmFilter(enabled) {
        this.config.warmFilter = enabled;
        const existing = document.getElementById('warm-filter');
        if (enabled && !existing) {
            this.createWarmFilter();
        } else if (!enabled && existing) {
            existing.remove();
        }
    },

    updateAmbientDensity() {
        // Increase dust motes over time (max at 30 min)
        const density = Math.min(1 + this.state.sessionDuration * 0.1, 4);
        const container = document.getElementById('dust-motes');
        if (container) {
            container.style.setProperty('--density-multiplier', density);
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION & STYLES
    // ═══════════════════════════════════════════════════════════════

    init() {
        this.injectStyles();
        this.registerNewBiomes();
        this.initAnswerButtonJuice();
        this.initAmbientEffects();
        this.loadSettings();

        console.log('[ArtistryEngine] Initialized with 13-point artistry system');
        return true;
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('luminara_artistry_settings');
            if (saved && typeof QuizSecurity !== 'undefined') {
                QuizSecurity.safeAssign(this.config, QuizSecurity.safeJsonParse(saved, {}));
            } else if (saved) {
                // Fallback if QuizSecurity not loaded yet
                const parsed = JSON.parse(saved);
                for (const key of Object.keys(parsed)) {
                    if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
                        this.config[key] = parsed[key];
                    }
                }
            }
        } catch (e) {
            // Use defaults
        }
    },

    saveSettings() {
        try {
            localStorage.setItem('luminara_artistry_settings', JSON.stringify(this.config));
        } catch (e) {
            // Ignore
        }
    },

    injectStyles() {
        if (document.getElementById('artistry-engine-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'artistry-engine-styles';
        styles.textContent = `
            /* ═══════════════════════════════════════════════════════════════
               ARTISTRY ENGINE STYLES
               ═══════════════════════════════════════════════════════════════ */

            /* CSS Variables for Biome Theming */
            :root {
                --biome-base: #1a1612;
                --biome-mid: #2a2420;
                --biome-accent: #c9a55c;
                --biome-glow: #b8944a;
                --vignette-intensity: 0.3;
            }

            /* ═══════════════════════════════════════════════════════════════
               #2: BOSS PHASE TRANSITIONS
               ═══════════════════════════════════════════════════════════════ */

            .boss-phase-distortion {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                pointer-events: none;
            }

            .distortion-ring {
                position: absolute;
                width: 10px;
                height: 10px;
                border: 3px solid #ef4444;
                border-radius: 50%;
                animation: distortionExpand 0.8s ease-out forwards;
            }

            @keyframes distortionExpand {
                0% { transform: scale(0); opacity: 1; border-width: 20px; }
                100% { transform: scale(100); opacity: 0; border-width: 1px; }
            }

            .phase-banner {
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: phaseBannerSlam 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
            }

            .phase-number {
                font-size: 64px;
                font-weight: bold;
                color: #ef4444;
                text-shadow: 0 0 30px rgba(239, 68, 68, 0.8);
                -webkit-text-stroke: 2px #7f1d1d;
            }

            .phase-subtitle {
                font-size: 24px;
                color: #fca5a5;
                letter-spacing: 0.3em;
                margin-top: 10px;
            }

            @keyframes phaseBannerSlam {
                0% { transform: scale(3) translateY(-50px); opacity: 0; }
                60% { transform: scale(0.9) translateY(5px); opacity: 1; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }

            /* ═══════════════════════════════════════════════════════════════
               #3: MONSTER SPRITE SYSTEM
               ═══════════════════════════════════════════════════════════════ */

            .monster-sprite-animated {
                position: relative;
                width: 100px;
                height: 100px;
            }

            .sprite-body {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .sprite-eyes {
                position: absolute;
                top: 30%;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 15px;
            }

            .sprite-eye {
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                position: relative;
            }

            .sprite-eye::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                background: black;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: eyeLook 3s ease-in-out infinite;
            }

            @keyframes eyeLook {
                0%, 100% { transform: translate(-50%, -50%); }
                25% { transform: translate(-30%, -50%); }
                75% { transform: translate(-70%, -50%); }
            }

            .monster-hit {
                animation: monsterHitFlash 0.3s ease-out;
            }

            @keyframes monsterHitFlash {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(3) saturate(0); }
            }

            .monster-dissolve {
                animation: monsterDissolve 1s ease-out forwards;
            }

            @keyframes monsterDissolve {
                0% { transform: scale(1); opacity: 1; filter: blur(0); }
                50% { transform: scale(1.2); opacity: 0.5; filter: blur(2px); }
                100% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
            }

            /* ═══════════════════════════════════════════════════════════════
               #4: STREAK VISUALIZATION
               ═══════════════════════════════════════════════════════════════ */

            .streak-1 {
                box-shadow: 0 0 10px rgba(201, 165, 92, 0.3);
            }

            .streak-2 {
                box-shadow: 0 0 20px rgba(201, 165, 92, 0.5);
                border-color: var(--biome-accent) !important;
            }

            .streak-3 {
                box-shadow: 0 0 30px rgba(201, 165, 92, 0.7), inset 0 0 20px rgba(201, 165, 92, 0.1);
                border-color: var(--biome-accent) !important;
                animation: streakPulse 1s ease-in-out infinite;
            }

            .streak-fire {
                box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(251, 191, 36, 0.6);
                border-color: #ef4444 !important;
                animation: firePulse 0.5s ease-in-out infinite;
            }

            @keyframes streakPulse {
                0%, 100% { box-shadow: 0 0 30px rgba(201, 165, 92, 0.7); }
                50% { box-shadow: 0 0 40px rgba(201, 165, 92, 0.9); }
            }

            @keyframes firePulse {
                0%, 100% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(251, 191, 36, 0.6); }
                50% { box-shadow: 0 0 50px rgba(239, 68, 68, 1), 0 0 80px rgba(251, 191, 36, 0.8); }
            }

            .on-fire-mode::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at center, transparent 40%, rgba(239, 68, 68, 0.15) 100%);
                pointer-events: none;
                z-index: 9990;
                animation: fireVignette 0.5s ease-in-out infinite alternate;
            }

            @keyframes fireVignette {
                0% { opacity: 0.8; }
                100% { opacity: 1; }
            }

            .sparkle-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }

            .sparkle {
                position: absolute;
                width: 6px;
                height: 6px;
                background: #ffd700;
                border-radius: 50%;
                left: var(--x);
                animation: sparkleFloat 2s ease-in-out infinite;
                animation-delay: var(--delay);
                opacity: 0;
            }

            @keyframes sparkleFloat {
                0%, 100% { transform: translateY(100%) scale(0); opacity: 0; }
                50% { transform: translateY(-50%) scale(1); opacity: 1; }
            }

            .fire-particles {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 20px;
                background: linear-gradient(to top, rgba(239, 68, 68, 0.5), transparent);
                pointer-events: none;
                animation: fireFlicker 0.2s ease-in-out infinite alternate;
            }

            /* ═══════════════════════════════════════════════════════════════
               #5: ANSWER BUTTON JUICE
               ═══════════════════════════════════════════════════════════════ */

            .answer-btn, .option-btn {
                transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
                position: relative;
                overflow: hidden;
            }

            .juice-hover {
                transform: scale(1.02) translateY(-2px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }

            .juice-press {
                transform: scale(0.98);
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }

            .click-ripple {
                position: absolute;
                width: 10px;
                height: 10px;
                background: rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: rippleExpand 0.4s ease-out forwards;
                pointer-events: none;
            }

            @keyframes rippleExpand {
                to { transform: translate(-50%, -50%) scale(20); opacity: 0; }
            }

            .answer-correct {
                background: linear-gradient(135deg, #22c55e, #16a34a) !important;
                border-color: #15803d !important;
            }

            .answer-wrong {
                background: linear-gradient(135deg, #ef4444, #dc2626) !important;
                border-color: #b91c1c !important;
            }

            .pulse-correct {
                animation: correctPulse 0.4s ease-out;
            }

            @keyframes correctPulse {
                0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                100% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0); }
            }

            .shake-wrong {
                animation: shakeWrong 0.4s ease-out;
            }

            @keyframes shakeWrong {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-10px); }
                40% { transform: translateX(10px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
            }

            .correct-burst, .wrong-shatter {
                position: fixed;
                transform: translate(-50%, -50%);
                font-size: 48px;
                z-index: 10000;
                pointer-events: none;
                animation: burstPop 0.6s ease-out forwards;
            }

            .correct-burst .checkmark {
                color: #22c55e;
                text-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
            }

            .wrong-shatter .x-mark {
                color: #ef4444;
                text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
            }

            @keyframes burstPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }

            .fade-disabled {
                opacity: 0.4;
                filter: grayscale(0.8);
                transition: all 0.3s ease;
                pointer-events: none;
            }

            /* ═══════════════════════════════════════════════════════════════
               #6: VICTORY CELEBRATION TIERS
               ═══════════════════════════════════════════════════════════════ */

            .victory-banner {
                position: fixed;
                top: 30%;
                left: 50%;
                transform: translateX(-50%) scale(0);
                font-size: 48px;
                font-weight: bold;
                color: var(--banner-color, #ffd700);
                text-shadow: 0 0 30px var(--banner-color, #ffd700),
                             2px 2px 0 rgba(0, 0, 0, 0.5);
                -webkit-text-stroke: 2px rgba(0, 0, 0, 0.3);
                z-index: 10001;
                animation: bannerSlam 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
            }

            .victory-banner.large {
                font-size: 72px;
            }

            .victory-banner.fade-out {
                animation: bannerFadeOut 0.5s ease-out forwards;
            }

            @keyframes bannerSlam {
                0% { transform: translateX(-50%) scale(0) rotate(-10deg); }
                60% { transform: translateX(-50%) scale(1.2) rotate(3deg); }
                100% { transform: translateX(-50%) scale(1) rotate(0deg); }
            }

            @keyframes bannerFadeOut {
                to { transform: translateX(-50%) scale(1.5); opacity: 0; }
            }

            .perfect-victory {
                animation: perfectPulse 0.5s ease-in-out infinite alternate;
            }

            @keyframes perfectPulse {
                0% { filter: brightness(1); }
                100% { filter: brightness(1.1) saturate(1.2); }
            }

            .firework {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
            }

            .firework-particle {
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                animation: fireworkBurst 1s ease-out forwards;
            }

            @keyframes fireworkBurst {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }

            .loot-item {
                position: fixed;
                font-size: 32px;
                pointer-events: none;
                z-index: 10000;
                animation: lootPop 1.5s ease-out forwards;
            }

            @keyframes lootPop {
                0% { transform: translate(0, 0) scale(0); opacity: 0; }
                30% { transform: translate(calc(var(--tx) * 0.5), calc(var(--ty) * 0.5)) scale(1.2); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0.8); opacity: 0; }
            }

            /* ═══════════════════════════════════════════════════════════════
               #7: MAP MODE VISUAL OVERHAUL
               ═══════════════════════════════════════════════════════════════ */

            .fog-of-war {
                filter: blur(3px) brightness(0.4);
                transition: filter 0.5s ease;
            }

            .fog-of-war:hover {
                filter: blur(1px) brightness(0.6);
            }

            .breadcrumb {
                position: absolute;
                width: 8px;
                height: 8px;
                background: rgba(201, 165, 92, 0.5);
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .monster-silhouette {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                color: rgba(239, 68, 68, 0.6);
                text-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
                animation: silhouettePulse 2s ease-in-out infinite;
            }

            @keyframes silhouettePulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.8; }
            }

            .treasure-glow {
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
                animation: treasureGlow 1.5s ease-in-out infinite;
            }

            @keyframes treasureGlow {
                0%, 100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); }
                50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9); }
            }

            .boss-cell.ominous-glow {
                box-shadow: 0 0 20px rgba(139, 0, 0, 0.8), inset 0 0 10px rgba(139, 0, 0, 0.3);
                animation: ominousPulse 2s ease-in-out infinite;
            }

            @keyframes ominousPulse {
                0%, 100% { box-shadow: 0 0 20px rgba(139, 0, 0, 0.8); }
                50% { box-shadow: 0 0 35px rgba(139, 0, 0, 1); }
            }

            .treasure-opening {
                animation: treasureOpen 0.5s ease-out;
            }

            @keyframes treasureOpen {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* ═══════════════════════════════════════════════════════════════
               #8: DAMAGE FEEDBACK ENHANCEMENT
               ═══════════════════════════════════════════════════════════════ */

            .enhanced-damage-number {
                position: fixed;
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-size: 36px;
                font-weight: bold;
                color: #ffcc00;
                -webkit-text-stroke: 2px #664400;
                text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
                pointer-events: none;
                z-index: 10001;
                animation: enhancedDamageFloat 1.2s ease-out forwards;
            }

            .enhanced-damage-number.critical {
                font-size: 52px;
                color: #ff4444;
                -webkit-text-stroke: 3px #660000;
                animation: criticalDamageFloat 1.2s ease-out forwards;
            }

            .enhanced-damage-number.heal {
                color: #22c55e;
                -webkit-text-stroke: 2px #0f5132;
            }

            .enhanced-damage-number::before {
                content: attr(data-type);
                position: absolute;
                left: -25px;
                font-size: 20px;
            }

            @keyframes enhancedDamageFloat {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                15% { transform: translateY(-15px) scale(1.2); opacity: 1; }
                30% { transform: translateY(-25px) translateX(var(--drift-x, 0)) scale(1); }
                100% { transform: translateY(-80px) translateX(var(--drift-x, 0)) scale(0.8); opacity: 0; }
            }

            @keyframes criticalDamageFloat {
                0% { transform: translateY(0) scale(0.3) rotate(-5deg); opacity: 0; }
                15% { transform: translateY(-20px) scale(1.5) rotate(5deg); opacity: 1; }
                30% { transform: translateY(-35px) scale(1.2) rotate(-2deg); }
                100% { transform: translateY(-100px) scale(0.9) rotate(0deg); opacity: 0; }
            }

            .combo-multiplier-banner {
                position: fixed;
                font-family: 'Impact', sans-serif;
                font-size: 24px;
                color: #a855f7;
                -webkit-text-stroke: 1px #581c87;
                pointer-events: none;
                z-index: 10000;
                animation: comboBannerPop 0.8s ease-out forwards;
            }

            @keyframes comboBannerPop {
                0% { transform: scale(0); opacity: 0; }
                30% { transform: scale(1.3); opacity: 1; }
                100% { transform: scale(1) translateY(-30px); opacity: 0; }
            }

            /* ═══════════════════════════════════════════════════════════════
               #9: LOADING & TRANSITION SCREENS
               ═══════════════════════════════════════════════════════════════ */

            .transition-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10002;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .transition-screen.active {
                opacity: 1;
            }

            .transition-screen.fade-out {
                opacity: 0;
            }

            .transition-icon {
                font-size: 80px;
                animation: iconBounce 0.6s ease-out;
            }

            .transition-title {
                font-size: 36px;
                color: var(--biome-accent, #c9a55c);
                margin-top: 20px;
                animation: titleSlide 0.5s ease-out 0.2s both;
            }

            .transition-subtitle {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 10px;
                animation: titleSlide 0.5s ease-out 0.4s both;
            }

            @keyframes iconBounce {
                0% { transform: scale(0) rotate(-180deg); }
                60% { transform: scale(1.2) rotate(10deg); }
                100% { transform: scale(1) rotate(0deg); }
            }

            @keyframes titleSlide {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .card-flip-container {
                perspective: 1000px;
            }

            .card-flip {
                width: 150px;
                height: 200px;
                background: linear-gradient(135deg, var(--biome-mid), var(--biome-base));
                border: 3px solid var(--biome-accent);
                border-radius: 10px;
                animation: cardFlipAnim 0.4s ease-in-out;
            }

            @keyframes cardFlipAnim {
                0% { transform: rotateY(0deg) scale(0.8); }
                50% { transform: rotateY(90deg) scale(0.9); }
                100% { transform: rotateY(180deg) scale(1); }
            }

            .progress-celebration {
                text-align: center;
            }

            .progress-bar-big {
                width: 300px;
                height: 30px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 15px;
                overflow: hidden;
                border: 2px solid var(--biome-accent);
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--biome-accent), var(--biome-glow));
                border-radius: 15px;
                animation: progressFillAnim 1s ease-out forwards;
            }

            @keyframes progressFillAnim {
                from { width: 0 !important; }
            }

            .progress-text {
                font-size: 24px;
                color: white;
                margin-top: 15px;
            }

            .grade-reveal {
                margin-bottom: 30px;
            }

            .grade-letter {
                font-size: 120px;
                font-weight: bold;
                color: var(--biome-accent);
                text-shadow: 0 0 40px var(--biome-glow);
                animation: gradeReveal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            @keyframes gradeReveal {
                0% { transform: scale(0) rotate(-20deg); opacity: 0; }
                60% { transform: scale(1.3) rotate(5deg); }
                100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }

            .session-stats .stat {
                font-size: 18px;
                color: rgba(255, 255, 255, 0.8);
                margin: 10px 0;
            }

            /* ═══════════════════════════════════════════════════════════════
               #10: DYNAMIC UI THEMING
               ═══════════════════════════════════════════════════════════════ */

            .biome-300 .monster-hp-fill { background: linear-gradient(90deg, #dc2626, #ef4444); }
            .biome-350 .monster-hp-fill { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
            .biome-450 .monster-hp-fill { background: linear-gradient(90deg, #eab308, #facc15); }
            .biome-550 .monster-hp-fill { background: linear-gradient(90deg, #ec4899, #f472b6); }
            .biome-650 .monster-hp-fill { background: linear-gradient(90deg, #14b8a6, #2dd4bf); }

            /* Question card biome borders */
            .question-card, #questionDisplay {
                border-color: var(--biome-accent);
                transition: border-color 0.5s ease, box-shadow 0.5s ease;
            }

            /* ═══════════════════════════════════════════════════════════════
               #11: EXPLANATION CARD ARTISTRY
               ═══════════════════════════════════════════════════════════════ */

            .explanation-enhanced {
                animation: explanationReveal 0.4s ease-out;
            }

            @keyframes explanationReveal {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .key-term {
                color: var(--biome-accent);
                font-weight: bold;
                text-shadow: 0 0 5px var(--biome-glow);
                cursor: help;
            }

            .deep-dive-section {
                margin-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                padding-top: 10px;
            }

            .deep-dive-toggle {
                background: none;
                border: 1px solid var(--biome-accent);
                color: var(--biome-accent);
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .deep-dive-toggle:hover {
                background: var(--biome-accent);
                color: var(--biome-base);
            }

            .deep-dive-content {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
                max-height: 200px;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .deep-dive-section.collapsed .deep-dive-content {
                max-height: 0;
                margin-top: 0;
            }

            .related-concept {
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 10px;
                border-radius: 15px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.8);
            }

            .citation-block {
                margin-top: 15px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-left: 3px solid var(--biome-accent);
                font-size: 12px;
                font-style: italic;
                color: rgba(255, 255, 255, 0.6);
            }

            .citation-icon {
                margin-right: 5px;
            }

            /* ═══════════════════════════════════════════════════════════════
               #12: POWER-UP ACTIVATION EFFECTS
               ═══════════════════════════════════════════════════════════════ */

            .powerup-activation-card {
                position: fixed;
                width: 60px;
                height: 80px;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                border: 3px solid #c084fc;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 32px;
                z-index: 10003;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            }

            .powerup-activation-card.fly-to-center {
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) scale(1.5);
            }

            .powerup-activation-card.shatter {
                animation: cardShatter 0.4s ease-out forwards;
            }

            @keyframes cardShatter {
                0% { transform: translate(-50%, -50%) scale(1.5); }
                50% { transform: translate(-50%, -50%) scale(2); filter: brightness(2); }
                100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            }

            .dramatic-cross-out {
                position: relative;
                animation: crossOut 0.4s ease-out forwards;
            }

            .dramatic-cross-out::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                width: 100%;
                height: 4px;
                background: #ef4444;
                transform: scaleX(0);
                animation: crossOutLine 0.3s ease-out 0.1s forwards;
            }

            @keyframes crossOut {
                to { opacity: 0.3; filter: grayscale(1); }
            }

            @keyframes crossOutLine {
                to { transform: scaleX(1); }
            }

            .slide-away {
                animation: slideAway 0.5s ease-out forwards;
            }

            @keyframes slideAway {
                to { transform: translateX(100%); opacity: 0; }
            }

            .shield-aura {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 5px solid transparent;
                border-image: linear-gradient(45deg, #3b82f6, #60a5fa, #3b82f6) 1;
                pointer-events: none;
                z-index: 9995;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .shield-aura.active {
                opacity: 1;
                animation: shieldPulse 2s ease-in-out infinite;
            }

            @keyframes shieldPulse {
                0%, 100% { box-shadow: inset 0 0 30px rgba(59, 130, 246, 0.3); }
                50% { box-shadow: inset 0 0 50px rgba(59, 130, 246, 0.5); }
            }

            /* ═══════════════════════════════════════════════════════════════
               #13: AMBIENT POLISH LAYER
               ═══════════════════════════════════════════════════════════════ */

            .dust-motes-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            }

            .dust-mote {
                position: absolute;
                width: 3px;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: var(--x-start);
                top: var(--y-start);
                animation: dustFloat var(--duration) ease-in-out infinite;
                animation-delay: var(--delay);
            }

            @keyframes dustFloat {
                0%, 100% {
                    transform: translate(0, 0);
                    opacity: 0.2;
                }
                25% {
                    transform: translate(30px, -40px);
                    opacity: 0.5;
                }
                50% {
                    transform: translate(60px, -20px);
                    opacity: 0.3;
                }
                75% {
                    transform: translate(30px, -60px);
                    opacity: 0.4;
                }
            }

            .ambient-vignette {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center,
                    transparent 40%,
                    rgba(0, 0, 0, var(--vignette-intensity, 0.3)) 100%);
                pointer-events: none;
                z-index: 9990;
                transition: all 0.5s ease;
            }

            .crt-scanlines {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.1) 0px,
                    rgba(0, 0, 0, 0.1) 1px,
                    transparent 1px,
                    transparent 3px
                );
                pointer-events: none;
                z-index: 9991;
                opacity: 0.3;
            }

            .warm-study-filter {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 200, 150, 0.05);
                pointer-events: none;
                z-index: 9989;
                mix-blend-mode: overlay;
            }

            /* ═══════════════════════════════════════════════════════════════
               BIOME ELEMENT STYLES (for new biomes)
               ═══════════════════════════════════════════════════════════════ */

            .biome-element.heart-pulse {
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 50%);
                animation: heartbeatPulse 1s ease-in-out infinite;
            }

            @keyframes heartbeatPulse {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                15% { transform: scale(1.15); opacity: 0.5; }
                30% { transform: scale(1); opacity: 0.3; }
                45% { transform: scale(1.08); opacity: 0.4; }
            }

            .biome-element.alveolus {
                width: 40px;
                height: 40px;
                background: radial-gradient(circle, rgba(56, 189, 248, 0.4) 30%, transparent 70%);
                border-radius: 50%;
                animation: float 4s ease-in-out infinite, pulse 2s ease-in-out infinite;
            }

            .biome-element.villus {
                width: 8px;
                height: 30px;
                background: linear-gradient(to top, rgba(250, 204, 21, 0.6), transparent);
                border-radius: 4px 4px 0 0;
                animation: sway 3s ease-in-out infinite;
            }

            @keyframes sway {
                0%, 100% { transform: rotate(-5deg); }
                50% { transform: rotate(5deg); }
            }

            .biome-element.sarcomere {
                width: 60px;
                height: 20px;
                background: repeating-linear-gradient(
                    90deg,
                    rgba(244, 114, 182, 0.6) 0px,
                    rgba(244, 114, 182, 0.6) 5px,
                    transparent 5px,
                    transparent 10px
                );
                animation: contract 1s ease-in-out infinite;
            }

            @keyframes contract {
                0%, 100% { width: 60px; }
                50% { width: 40px; }
            }

            .biome-element.nephron {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(45, 212, 191, 0.5);
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                animation: filterPulse 2s ease-in-out infinite;
            }

            @keyframes filterPulse {
                0%, 100% { border-color: rgba(45, 212, 191, 0.3); }
                50% { border-color: rgba(45, 212, 191, 0.7); }
            }
        `;

        document.head.appendChild(styles);
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ArtistryEngine.init());
    } else {
        ArtistryEngine.init();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArtistryEngine;
}
