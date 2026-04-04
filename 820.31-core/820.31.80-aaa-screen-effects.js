/**
 * 820.31.80-aaa-screen-effects.js - AAA Visual Effects System
 * @codon 820.31.80
 * @version 2026-03-29
 * @description Enhanced visual feedback with Persona 5 style animations
 *
 * Features:
 * - Card slam animations with ink splash
 * - Floating damage numbers with comic effects
 * - Screen shake for impacts
 * - Combo fire effects
 * - Slow motion for dramatic moments
 * - Particle burst system
 */

const ScreenEffects = {
    // Configuration
    config: {
        shakeEnabled: true,
        particlesEnabled: true,
        slowMoEnabled: true,
        comboFireEnabled: true
    },

    // Initialize the effects system
    init() {
        this.createParticleContainer();
        this.createComboFireContainer();
        this.injectStyles();
    },

    // Create container for particle effects
    createParticleContainer() {
        if (document.getElementById('particle-container')) return;

        const container = document.createElement('div');
        container.id = 'particle-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            overflow: hidden;
        `;
        document.body.appendChild(container);
    },

    // Create container for combo fire effects
    createComboFireContainer() {
        if (document.getElementById('combo-fire-container')) return;

        const container = document.createElement('div');
        container.id = 'combo-fire-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            overflow: hidden;
        `;
        document.body.appendChild(container);
    },

    // Inject CSS animations
    injectStyles() {
        if (document.getElementById('screen-effects-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'screen-effects-styles';
        styles.textContent = `
            /* Card Slam Animation */
            @keyframes cardSlam {
                0% { transform: translateY(-100vh) rotate(-10deg) scale(1.2); opacity: 0; }
                60% { transform: translateY(10px) rotate(2deg) scale(1.1); opacity: 1; }
                80% { transform: translateY(-5px) rotate(-1deg) scale(1.05); }
                100% { transform: translateY(0) rotate(0deg) scale(1); }
            }

            @keyframes inkSplash {
                0% { transform: scale(0); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.8; }
                100% { transform: scale(2); opacity: 0; }
            }

            @keyframes cardExplode {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.8; }
                100% { transform: scale(0); opacity: 0; }
            }

            @keyframes cardShatter {
                0% { transform: scale(1) rotate(0deg); opacity: 1; }
                100% { transform: scale(0.5) rotate(15deg); opacity: 0; }
            }

            /* Damage Numbers */
            @keyframes damageFloat {
                0% { transform: translateY(0) scale(0.5); opacity: 0; }
                20% { transform: translateY(-20px) scale(1.2); opacity: 1; }
                80% { transform: translateY(-60px) scale(1); opacity: 1; }
                100% { transform: translateY(-80px) scale(0.8); opacity: 0; }
            }

            @keyframes critDamage {
                0% { transform: translateY(0) scale(0.5) rotate(-5deg); opacity: 0; }
                20% { transform: translateY(-30px) scale(1.5) rotate(5deg); opacity: 1; }
                40% { transform: translateY(-40px) scale(1.3) rotate(-3deg); }
                80% { transform: translateY(-70px) scale(1.1) rotate(2deg); opacity: 1; }
                100% { transform: translateY(-90px) scale(0.9) rotate(0deg); opacity: 0; }
            }

            /* Combo Fire */
            @keyframes fireFlicker {
                0%, 100% { opacity: 0.7; transform: scaleY(1); }
                50% { opacity: 1; transform: scaleY(1.1); }
            }

            @keyframes fireGrow {
                from { height: 0; opacity: 0; }
                to { height: var(--fire-height); opacity: 1; }
            }

            /* Screen Shake */
            @keyframes screenShake {
                0%, 100% { transform: translateX(0); }
                10% { transform: translateX(-5px) rotate(-0.5deg); }
                20% { transform: translateX(5px) rotate(0.5deg); }
                30% { transform: translateX(-4px) rotate(-0.3deg); }
                40% { transform: translateX(4px) rotate(0.3deg); }
                50% { transform: translateX(-3px) rotate(-0.2deg); }
                60% { transform: translateX(3px) rotate(0.2deg); }
                70% { transform: translateX(-2px) rotate(-0.1deg); }
                80% { transform: translateX(2px) rotate(0.1deg); }
                90% { transform: translateX(-1px); }
            }

            @keyframes heavyShake {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                10% { transform: translate(-10px, -5px) rotate(-1deg); }
                20% { transform: translate(10px, 5px) rotate(1deg); }
                30% { transform: translate(-8px, -4px) rotate(-0.8deg); }
                40% { transform: translate(8px, 4px) rotate(0.8deg); }
                50% { transform: translate(-6px, -3px) rotate(-0.5deg); }
                60% { transform: translate(6px, 3px) rotate(0.5deg); }
                70% { transform: translate(-4px, -2px) rotate(-0.3deg); }
                80% { transform: translate(4px, 2px) rotate(0.3deg); }
                90% { transform: translate(-2px, -1px) rotate(-0.1deg); }
            }

            /* Particle effects */
            .particle {
                position: absolute;
                pointer-events: none;
                border-radius: 50%;
            }

            @keyframes particleExplode {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }

            @keyframes particleRise {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-100px) scale(0.5); opacity: 0; }
            }

            /* Slow motion overlay */
            .slow-mo-active {
                filter: saturate(1.3) contrast(1.1);
            }

            /* Level up effect */
            @keyframes levelUpGlow {
                0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.8); }
                50% { box-shadow: 0 0 60px 30px rgba(255, 215, 0, 0.4); }
                100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
            }

            /* POW/BAM comic effects */
            .comic-effect {
                position: absolute;
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-weight: bold;
                -webkit-text-stroke: 3px black;
                text-shadow: 4px 4px 0 rgba(0,0,0,0.3);
                pointer-events: none;
                z-index: 10000;
            }

            @keyframes comicPop {
                0% { transform: scale(0) rotate(-15deg); opacity: 0; }
                50% { transform: scale(1.3) rotate(5deg); opacity: 1; }
                70% { transform: scale(0.9) rotate(-2deg); opacity: 1; }
                100% { transform: scale(1) rotate(0deg); opacity: 0; }
            }

            /* Combo fire edges */
            .combo-fire {
                position: absolute;
                bottom: 0;
                width: 100%;
                background: linear-gradient(to top,
                    rgba(255, 100, 0, 0.8) 0%,
                    rgba(255, 200, 0, 0.6) 40%,
                    rgba(255, 255, 0, 0.3) 70%,
                    transparent 100%);
                animation: fireFlicker 0.3s ease-in-out infinite;
            }

            .combo-fire.left {
                left: 0;
                width: 60px;
                background: linear-gradient(to right,
                    rgba(255, 100, 0, 0.8) 0%,
                    rgba(255, 200, 0, 0.4) 50%,
                    transparent 100%);
            }

            .combo-fire.right {
                right: 0;
                width: 60px;
                background: linear-gradient(to left,
                    rgba(255, 100, 0, 0.8) 0%,
                    rgba(255, 200, 0, 0.4) 50%,
                    transparent 100%);
            }
        `;
        document.head.appendChild(styles);
    },

    // Card slam animation (Persona 5 style)
    cardSlam(cardEl, callback) {
        if (!cardEl) return;

        // Add ink splash behind card
        const splash = document.createElement('div');
        splash.style.cssText = `
            position: absolute;
            width: 150%;
            height: 150%;
            top: -25%;
            left: -25%;
            background: radial-gradient(circle, rgba(0,0,0,0.3) 0%, transparent 70%);
            animation: inkSplash 0.5s ease-out forwards;
            pointer-events: none;
        `;
        cardEl.style.position = 'relative';
        cardEl.appendChild(splash);

        // Slam animation
        cardEl.style.animation = 'cardSlam 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

        // Play sound
        if (typeof SoundSystem !== 'undefined') {
            SoundSystem.play('cardPlay');
        }

        setTimeout(() => {
            splash.remove();
            cardEl.style.animation = '';
            if (callback) callback();
        }, 500);
    },

    // Card explosion for correct answers
    cardExplode(cardEl, callback) {
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Particle burst
        this.particleBurst(centerX, centerY, 'gold');

        // Explode animation
        cardEl.style.animation = 'cardExplode 0.3s ease-out forwards';

        setTimeout(() => {
            if (callback) callback();
        }, 300);
    },

    // Card shatter for wrong answers
    cardShatter(cardEl, callback) {
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Red shatter particles
        this.particleBurst(centerX, centerY, 'shatter');

        // Shatter animation
        cardEl.style.animation = 'cardShatter 0.3s ease-out forwards';

        setTimeout(() => {
            if (callback) callback();
        }, 300);
    },

    // Floating damage numbers
    damageNumber(target, amount, isCrit = false, breakdown = null) {
        const container = document.getElementById('particle-container');
        if (!container) return;

        let targetEl = typeof target === 'string' ? document.querySelector(target) : target;
        let x, y;

        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 4;
        } else {
            x = window.innerWidth / 2;
            y = window.innerHeight / 3;
        }

        // Main damage number
        const num = document.createElement('div');
        num.className = 'damage-number';
        num.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: ${isCrit ? '64px' : '48px'};
            font-weight: bold;
            color: ${isCrit ? '#ff4444' : '#ffcc00'};
            -webkit-text-stroke: 2px ${isCrit ? '#880000' : '#886600'};
            text-shadow: 3px 3px 0 rgba(0,0,0,0.5);
            transform: translateX(-50%);
            animation: ${isCrit ? 'critDamage' : 'damageFloat'} ${isCrit ? '1s' : '0.8s'} ease-out forwards;
            z-index: 10001;
            pointer-events: none;
        `;
        num.textContent = amount;
        container.appendChild(num);

        // CRIT! text for critical hits
        if (isCrit) {
            const critText = document.createElement('div');
            critText.className = 'comic-effect';
            critText.style.cssText = `
                position: fixed;
                left: ${x - 60}px;
                top: ${y - 40}px;
                font-size: 36px;
                color: #ff0000;
                animation: comicPop 0.6s ease-out forwards;
            `;
            critText.textContent = 'CRIT!';
            container.appendChild(critText);

            setTimeout(() => critText.remove(), 600);
            this.screenShake('heavy');
        }

        // Breakdown numbers (smaller, staggered)
        if (breakdown && Array.isArray(breakdown)) {
            breakdown.forEach((item, i) => {
                setTimeout(() => {
                    const breakdownNum = document.createElement('div');
                    breakdownNum.style.cssText = `
                        position: fixed;
                        left: ${x + (i % 2 === 0 ? -40 : 40)}px;
                        top: ${y + 30 + i * 20}px;
                        font-family: 'Arial', sans-serif;
                        font-size: 18px;
                        font-weight: bold;
                        color: #aaaaff;
                        text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
                        animation: damageFloat 0.6s ease-out forwards;
                        z-index: 10000;
                        pointer-events: none;
                    `;
                    breakdownNum.textContent = `+${item.value} ${item.label}`;
                    container.appendChild(breakdownNum);

                    setTimeout(() => breakdownNum.remove(), 600);
                }, i * 100);
            });
        }

        setTimeout(() => num.remove(), isCrit ? 1000 : 800);
    },

    // Comic book POW/BAM effects
    comicEffect(x, y, text = 'POW!', color = '#ffcc00') {
        const container = document.getElementById('particle-container');
        if (!container) return;

        const effect = document.createElement('div');
        effect.className = 'comic-effect';
        effect.style.cssText = `
            left: ${x - 50}px;
            top: ${y - 30}px;
            font-size: 48px;
            color: ${color};
            animation: comicPop 0.8s ease-out forwards;
        `;
        effect.textContent = text;
        container.appendChild(effect);

        setTimeout(() => effect.remove(), 800);
    },

    // Combo fire effect on screen edges
    comboFire(level) {
        if (!this.config.comboFireEnabled) return;

        const container = document.getElementById('combo-fire-container');
        if (!container) return;

        // Clear existing fires
        container.innerHTML = '';

        if (level <= 0) return;

        // Calculate fire intensity (0-1)
        const intensity = Math.min(level / 10, 1);
        const height = 50 + intensity * 150; // 50px to 200px

        // Left fire
        const leftFire = document.createElement('div');
        leftFire.className = 'combo-fire left';
        leftFire.style.cssText = `
            --fire-height: ${height}px;
            height: ${height}px;
            opacity: ${0.3 + intensity * 0.7};
        `;
        container.appendChild(leftFire);

        // Right fire
        const rightFire = document.createElement('div');
        rightFire.className = 'combo-fire right';
        rightFire.style.cssText = `
            --fire-height: ${height}px;
            height: ${height}px;
            opacity: ${0.3 + intensity * 0.7};
        `;
        container.appendChild(rightFire);

        // Bottom fire for high combos
        if (level >= 5) {
            const bottomFire = document.createElement('div');
            bottomFire.className = 'combo-fire';
            bottomFire.style.cssText = `
                height: ${height * 0.5}px;
                opacity: ${intensity * 0.5};
            `;
            container.appendChild(bottomFire);
        }
    },

    // Screen shake effect
    screenShake(intensity = 'normal') {
        if (!this.config.shakeEnabled) return;

        const body = document.body;
        const animation = intensity === 'heavy' ? 'heavyShake' : 'screenShake';
        const duration = intensity === 'heavy' ? '0.5s' : '0.3s';

        body.style.animation = `${animation} ${duration} ease-out`;

        setTimeout(() => {
            body.style.animation = '';
        }, intensity === 'heavy' ? 500 : 300);
    },

    // Slow motion effect
    slowMotion(duration = 500, callback) {
        if (!this.config.slowMoEnabled) {
            if (callback) setTimeout(callback, duration);
            return;
        }

        document.body.classList.add('slow-mo-active');

        // Slow down CSS animations
        document.body.style.setProperty('--animation-speed', '0.3');

        setTimeout(() => {
            document.body.classList.remove('slow-mo-active');
            document.body.style.removeProperty('--animation-speed');
            if (callback) callback();
        }, duration);
    },

    // Particle burst effect
    particleBurst(x, y, type = 'gold') {
        if (!this.config.particlesEnabled) return;

        const container = document.getElementById('particle-container');
        if (!container) return;

        const particleConfigs = {
            gold: { colors: ['#ffd700', '#ffec8b', '#ffa500'], count: 20, size: [8, 16] },
            shatter: { colors: ['#ff4444', '#cc0000', '#880000'], count: 15, size: [6, 12] },
            heal: { colors: ['#44ff44', '#00cc00', '#88ff88'], count: 12, size: [6, 10] },
            level: { colors: ['#ffd700', '#ffffff', '#87ceeb', '#ff69b4'], count: 30, size: [10, 20] },
            purple: { colors: ['#a855f7', '#7c3aed', '#c084fc'], count: 15, size: [8, 14] },
            blue: { colors: ['#3b82f6', '#60a5fa', '#1e40af'], count: 15, size: [8, 14] }
        };

        const config = particleConfigs[type] || particleConfigs.gold;

        for (let i = 0; i < config.count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
            const distance = 50 + Math.random() * 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            const duration = 0.5 + Math.random() * 0.3;

            particle.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                box-shadow: 0 0 ${size/2}px ${color};
                --tx: ${tx}px;
                --ty: ${ty}px;
                animation: particleExplode ${duration}s ease-out forwards;
            `;

            container.appendChild(particle);

            setTimeout(() => particle.remove(), duration * 1000);
        }
    },

    // Rising particles (for healing, buffs)
    particleRise(x, y, type = 'heal', count = 10) {
        if (!this.config.particlesEnabled) return;

        const container = document.getElementById('particle-container');
        if (!container) return;

        const colors = {
            heal: ['#44ff44', '#00cc00'],
            buff: ['#ffd700', '#ffec8b'],
            mana: ['#4488ff', '#88bbff']
        };

        const particleColors = colors[type] || colors.heal;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';

                const offsetX = (Math.random() - 0.5) * 60;
                const size = 4 + Math.random() * 6;
                const color = particleColors[Math.floor(Math.random() * particleColors.length)];

                particle.style.cssText = `
                    left: ${x + offsetX}px;
                    top: ${y}px;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    box-shadow: 0 0 ${size}px ${color};
                    animation: particleRise 1s ease-out forwards;
                `;

                container.appendChild(particle);

                setTimeout(() => particle.remove(), 1000);
            }, i * 50);
        }
    },

    // Level up effect
    levelUpEffect(targetEl) {
        if (!targetEl) targetEl = document.querySelector('.player-avatar, .player-info');
        if (!targetEl) return;

        const rect = targetEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Big particle burst
        this.particleBurst(x, y, 'level');

        // Glow animation on element
        targetEl.style.animation = 'levelUpGlow 1s ease-out';

        // Comic effect
        this.comicEffect(x, y - 50, 'LEVEL UP!', '#ffd700');

        // Screen flash
        this.screenFlash('#ffd700', 0.3);

        setTimeout(() => {
            targetEl.style.animation = '';
        }, 1000);
    },

    // Screen flash
    screenFlash(color = '#ffffff', opacity = 0.5, duration = 200) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${color};
            opacity: ${opacity};
            pointer-events: none;
            z-index: 99999;
            transition: opacity ${duration}ms ease-out;
        `;
        document.body.appendChild(flash);

        requestAnimationFrame(() => {
            flash.style.opacity = '0';
        });

        setTimeout(() => flash.remove(), duration);
    },

    // Victory effect
    victoryEffect() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Multiple particle bursts
        this.particleBurst(centerX, centerY, 'gold');
        setTimeout(() => this.particleBurst(centerX - 100, centerY - 50, 'gold'), 100);
        setTimeout(() => this.particleBurst(centerX + 100, centerY - 50, 'gold'), 200);

        // Big comic effect
        this.comicEffect(centerX, centerY, 'VICTORY!', '#ffd700');

        // Confetti
        this.confetti();
    },

    // Confetti effect for victories
    confetti(duration = 3000) {
        const container = document.getElementById('particle-container');
        if (!container) return;

        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const x = Math.random() * window.innerWidth;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = 5 + Math.random() * 10;
                const fallDuration = 2 + Math.random() * 2;

                confetti.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: -20px;
                    width: ${size}px;
                    height: ${size * 0.6}px;
                    background: ${color};
                    transform: rotate(${Math.random() * 360}deg);
                    animation: confettiFall ${fallDuration}s linear forwards;
                    z-index: 10000;
                `;

                container.appendChild(confetti);

                setTimeout(() => confetti.remove(), fallDuration * 1000);
            }, Math.random() * duration * 0.5);
        }

        // Add confetti animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); }
                    100% { transform: translateY(${window.innerHeight + 50}px) rotate(720deg); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Boss intro effect
    bossIntro(bossName) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99998;
            animation: fadeIn 0.3s ease-out;
        `;

        const nameCard = document.createElement('div');
        nameCard.style.cssText = `
            font-family: 'Impact', 'Arial Black', sans-serif;
            font-size: 64px;
            color: #ff4444;
            -webkit-text-stroke: 3px #880000;
            text-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
            animation: bossNameSlide 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        `;
        nameCard.textContent = bossName;

        const subtitle = document.createElement('div');
        subtitle.style.cssText = `
            font-family: 'Arial', sans-serif;
            font-size: 24px;
            color: #ff8888;
            margin-top: 20px;
            opacity: 0;
            animation: fadeIn 0.5s ease-out 0.5s forwards;
        `;
        subtitle.textContent = 'BOSS BATTLE';

        overlay.appendChild(nameCard);
        overlay.appendChild(subtitle);
        document.body.appendChild(overlay);

        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes bossNameSlide {
                0% { transform: translateX(-100vw) rotate(-10deg); }
                60% { transform: translateX(20px) rotate(2deg); }
                80% { transform: translateX(-10px) rotate(-1deg); }
                100% { transform: translateX(0) rotate(0deg); }
            }
        `;
        document.head.appendChild(style);

        this.screenShake('heavy');

        setTimeout(() => {
            overlay.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                overlay.remove();
                style.remove();
            }, 500);
        }, 2000);

        // Add fadeOut animation
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        `;
        document.head.appendChild(fadeOutStyle);
        setTimeout(() => fadeOutStyle.remove(), 2500);
    },

    // Correct answer flash (green pulse)
    flashCorrect(element) {
        if (!element) return;

        const originalBg = element.style.backgroundColor;
        element.style.transition = 'background-color 0.1s ease-out';
        element.style.backgroundColor = '#22c55e';

        setTimeout(() => {
            element.style.backgroundColor = originalBg || '';
            setTimeout(() => {
                element.style.transition = '';
            }, 100);
        }, 200);
    },

    // Wrong answer shake (red shake)
    flashWrong(element) {
        if (!element) return;

        const originalBg = element.style.backgroundColor;
        element.style.transition = 'background-color 0.1s ease-out';
        element.style.backgroundColor = '#ef4444';
        element.style.animation = 'screenShake 0.3s ease-out';

        setTimeout(() => {
            element.style.backgroundColor = originalBg || '';
            element.style.animation = '';
            setTimeout(() => {
                element.style.transition = '';
            }, 100);
        }, 300);
    },

    // Critical HP state (near-death visual effect)
    setCriticalHP(isCritical) {
        if (isCritical) {
            document.body.classList.add('critical-hp');
        } else {
            document.body.classList.remove('critical-hp');
        }
    },

    // Check and set critical HP based on percentage
    checkCriticalHP(currentHP, maxHP) {
        const percent = (currentHP / maxHP) * 100;
        const wasCritical = document.body.classList.contains('critical-hp');
        const isCritical = percent <= 25;

        this.setCriticalHP(isCritical);

        // Play warning sound when entering critical
        if (isCritical && !wasCritical && typeof SoundSystem !== 'undefined' && SoundSystem.playDanger) {
            SoundSystem.playDanger();
        }

        return isCritical;
    },

    // Victory flash effect (golden glow)
    victoryFlash() {
        // Create overlay
        let overlay = document.getElementById('victory-flash-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'victory-flash-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.8) 0%, rgba(218, 165, 32, 0.4) 50%, transparent 70%);
                pointer-events: none;
                z-index: 9998;
                opacity: 0;
            `;
            document.body.appendChild(overlay);
        }

        // Animate the flash
        overlay.style.opacity = '1';
        overlay.style.transition = 'opacity 0.3s ease-in';

        setTimeout(() => {
            overlay.style.transition = 'opacity 1s ease-out';
            overlay.style.opacity = '0';
        }, 300);

        // Optional screen shake
        this.screenShake('normal');
    },

    // Boss intro flash effect (red/dark)
    bossIntroFlash() {
        let overlay = document.getElementById('boss-intro-flash');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'boss-intro-flash';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, rgba(220, 38, 38, 0.6) 0%, rgba(139, 0, 0, 0.3) 50%, transparent 70%);
                pointer-events: none;
                z-index: 9998;
                opacity: 0;
            `;
            document.body.appendChild(overlay);
        }

        // Flash red
        overlay.style.opacity = '1';
        overlay.style.transition = 'opacity 0.2s ease-in';

        setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s ease-out';
            overlay.style.opacity = '0';
        }, 200);

        this.screenShake('heavy');
    },

    // ═══════════════════════════════════════════════════════════════
    // COMBO MILESTONE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Show combo milestone popup (5x, 10x, etc.)
     * Called from gamification.js when combo reaches milestone thresholds
     */
    showComboMilestone(count) {
        const milestones = {
            5: { text: 'COMBO x5!', color: '#22c55e' },
            10: { text: 'COMBO x10!!', color: '#3b82f6' },
            15: { text: 'UNSTOPPABLE!!!', color: '#a855f7' },
            20: { text: 'LEGENDARY!!!!', color: '#f59e0b' },
            25: { text: 'GODLIKE!!!!!', color: '#ef4444' }
        };

        const milestone = milestones[count];
        if (!milestone) return;

        const popup = document.createElement('div');
        popup.className = 'combo-milestone-popup';
        popup.textContent = milestone.text;
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 3rem;
            font-weight: 900;
            color: ${milestone.color};
            text-shadow: 0 0 20px ${milestone.color}, 0 4px 8px rgba(0,0,0,0.5);
            z-index: 10000;
            pointer-events: none;
            animation: comboMilestoneAnim 1s ease-out forwards;
            font-family: 'Impact', 'Arial Black', sans-serif;
            letter-spacing: 2px;
        `;
        document.body.appendChild(popup);

        // Inject animation if not present
        if (!document.getElementById('combo-milestone-anim-style')) {
            const style = document.createElement('style');
            style.id = 'combo-milestone-anim-style';
            style.textContent = `
                @keyframes comboMilestoneAnim {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                    30% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) scale(0.8) translateY(-50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Play sound if available
        if (typeof SoundSystem !== 'undefined' && SoundSystem.playCombo) {
            SoundSystem.playCombo(count);
        }

        // Screen shake for big milestones
        if (count >= 10) {
            this.screenShake(count >= 20 ? 'heavy' : 'normal');
        }

        setTimeout(() => popup.remove(), 1000);
    },

    // ═══════════════════════════════════════════════════════════════
    // QUESTION MILESTONE (total questions answered)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Show milestone popup for total questions answered (10, 25, 50, etc.)
     * Different from combo milestones - this is lifetime achievement
     */
    showMilestone(count) {
        const popup = document.createElement('div');
        popup.className = 'milestone-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 2.5rem;
            font-weight: 900;
            color: #ffd700;
            text-shadow: 0 0 20px #ffd700, 0 4px 8px rgba(0,0,0,0.5);
            z-index: 10000;
            pointer-events: none;
            animation: milestoneAnim 1.5s ease-out forwards;
            font-family: 'Impact', 'Arial Black', sans-serif;
            letter-spacing: 2px;
        `;
        popup.innerHTML = `<span style="font-size: 3.5rem;">${count}</span> <span>QUESTIONS!</span>`;
        document.body.appendChild(popup);

        // Inject animation if not present
        if (!document.getElementById('milestone-anim-style')) {
            const style = document.createElement('style');
            style.id = 'milestone-anim-style';
            style.textContent = `
                @keyframes milestoneAnim {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                    30% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) scale(0.8) translateY(-50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Play sound if available
        if (typeof SoundSystem !== 'undefined' && SoundSystem.playMilestone) {
            SoundSystem.playMilestone();
        }

        // Confetti for big milestones
        if (count >= 50) {
            this.confetti(2000);
        }

        // Particle burst
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        this.particleBurst(centerX, centerY, 'level');

        setTimeout(() => popup.remove(), 1500);
    },

    /**
     * Check if question count hits a milestone threshold
     * Called after each question is answered
     */
    checkMilestone(questionCount) {
        const milestones = [10, 25, 50, 75, 100, 150, 200, 250, 300];
        if (milestones.includes(questionCount)) {
            this.showMilestone(questionCount);
            return true;
        }
        return false;
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ScreenEffects.init());
    } else {
        ScreenEffects.init();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScreenEffects;
}
