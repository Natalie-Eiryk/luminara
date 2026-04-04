# Shockwave Arcade Feel - Implementation Plan

**Date**: 2026-03-26
**Goal**: Transform from "educational game" to "addictive arcade game where learning happens"
**Target Feel**: Early 2000s Shockwave/Flash games - simple, snappy, one-more-round addiction

---

## Current State: 5.25/10 Juice Score

| Category | Score | Issue |
|----------|-------|-------|
| Mechanics | 9/10 | Solid foundation |
| Visual Feedback | 5/10 | Academic, not arcade |
| Sound | 1/10 | Hooks exist but unused |
| Addiction Hooks | 6/10 | Present but muted |

---

## The Shockwave Game Philosophy

**What Made Flash Games Addictive:**
1. **Instant feedback** - Every click has a reaction (sound, visual, shake)
2. **Escalating tension** - Game gets harder, music speeds up, colors intensify
3. **Near-miss heartbreak** - "You were SO close!" moments
4. **One more round** - Quick restart, no friction
5. **Score chasing** - Visible high scores, rank climbing

**Current Ms. Luminara:**
- Answers feel like filling out a form
- Boss battles feel like reading a progress bar
- Streaks feel like a counter incrementing
- Game over feels like a page refresh

---

## TIER 1: Critical Juice (4 hours)

### 1.1 Screen Shake on Impact (30 min)

**File:** `820.31.0-styles.css`
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px) rotate(-0.5deg); }
  40% { transform: translateX(3px) rotate(0.5deg); }
  60% { transform: translateX(-2px) rotate(-0.3deg); }
  80% { transform: translateX(2px) rotate(0.3deg); }
}

body.shake { animation: shake 0.3s ease; }
body.big-shake { animation: shake 0.5s ease; }
```

**Wire in:** `820.31.1-app.js` - Add `document.body.classList.add('shake')` on:
- Wrong answer
- Boss attack
- Player taking damage

### 1.2 Flash on Correct Answer (15 min)

**File:** `820.31.0-styles.css`
```css
@keyframes correctFlash {
  0% { box-shadow: 0 0 0 0 rgba(90, 156, 111, 0.8); }
  50% { box-shadow: 0 0 30px 10px rgba(90, 156, 111, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(90, 156, 111, 0); }
}

.question-card.correct-flash {
  animation: correctFlash 0.4s ease-out;
}
```

### 1.3 Floating Damage Numbers (1 hour)

**New utility function:**
```javascript
function showDamageNumber(container, amount, isPositive = true) {
  const popup = document.createElement('div');
  popup.className = `damage-number ${isPositive ? 'positive' : 'negative'}`;
  popup.textContent = isPositive ? `+${amount}` : `-${amount}`;
  popup.style.left = `${50 + (Math.random() * 20 - 10)}%`;
  container.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}
```

**CSS:**
```css
.damage-number {
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
  pointer-events: none;
  animation: floatUp 1s ease-out forwards;
  z-index: 1000;
}
.damage-number.positive { color: #5aff5a; text-shadow: 0 0 10px #0f0; }
.damage-number.negative { color: #ff5a5a; text-shadow: 0 0 10px #f00; }

@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  50% { opacity: 1; transform: translateY(-30px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
}
```

**Use in:**
- Boss taking damage: `showDamageNumber(bossContainer, damage, true)`
- Player taking damage: `showDamageNumber(playerHPBar, damage, false)`
- XP gains: `showDamageNumber(xpBar, xp, true)`

### 1.4 Combo Visual Escalation (45 min)

**Current:** 🔥 emoji grows slightly
**Target:** Counter pulses, glows, changes color

```css
.combo-indicator {
  transition: all 0.2s ease;
}

.combo-indicator[data-combo="3"] { color: #ffff00; transform: scale(1.1); }
.combo-indicator[data-combo="5"] { color: #ffa500; transform: scale(1.2); text-shadow: 0 0 10px #ffa500; }
.combo-indicator[data-combo="10"] { color: #ff4500; transform: scale(1.3); text-shadow: 0 0 20px #ff4500; }
.combo-indicator[data-combo="15"] { color: #ff0000; transform: scale(1.4); text-shadow: 0 0 30px #ff0000; animation: comboPulse 0.3s infinite; }

@keyframes comboPulse {
  0%, 100% { transform: scale(1.4); }
  50% { transform: scale(1.5); }
}
```

**JavaScript:** Update `data-combo` attribute on combo change:
```javascript
comboIndicator.setAttribute('data-combo', Math.min(combo, 15));
```

### 1.5 Sound Hook Wiring (1.5 hours)

**Problem:** `soundHooks` defined in `820.31.3-gamification.js:29-38` but never triggered.

**Solution:** Add triggers in `processCorrectAnswer()` and `processWrongAnswer()`:

```javascript
// In processCorrectAnswer():
this.triggerHook('onCorrect', { xp: result.total, streak: this.currentStreak });

if (this.comboState.count === 3) this.triggerHook('onCombo', { count: 3 });
if (this.comboState.count === 5) this.triggerHook('onCombo', { count: 5 });
if (this.comboState.count === 10) this.triggerHook('onCombo', { count: 10 });

// In processWrongAnswer():
this.triggerHook('onWrong', { hp: currentHP });
```

**UI Registration (in app init):**
```javascript
// Simple Web Audio API beeps (no external files needed)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type = 'sine') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

gamification.soundHooks.onCorrect.push(() => playTone(880, 0.1));  // High beep
gamification.soundHooks.onWrong.push(() => playTone(220, 0.3, 'sawtooth'));  // Low buzz
gamification.soundHooks.onCombo.push(({count}) => {
  if (count === 5) playTone(1320, 0.15);
  if (count === 10) { playTone(1320, 0.1); setTimeout(() => playTone(1760, 0.15), 100); }
});
```

---

## TIER 2: Enhanced Experience (4 hours)

### 2.1 Wave Completion Banner (30 min)

**When wave completes, show dramatic banner:**
```javascript
function showWaveBanner(waveNumber, bonus) {
  const banner = document.createElement('div');
  banner.className = 'wave-banner';
  banner.innerHTML = `
    <div class="wave-text">WAVE ${waveNumber}</div>
    <div class="wave-subtext">CLEAR!</div>
    <div class="wave-bonus">+${bonus} XP</div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.classList.add('fade-out');
    setTimeout(() => banner.remove(), 500);
  }, 1500);
}
```

```css
.wave-banner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  font-family: 'Impact', sans-serif;
  text-align: center;
  animation: bannerPop 0.3s ease forwards;
  z-index: 2000;
}
.wave-banner .wave-text { font-size: 4rem; color: #ffd700; text-shadow: 0 0 20px #ffa500; }
.wave-banner .wave-subtext { font-size: 2rem; color: #fff; }
.wave-banner .wave-bonus { font-size: 1.5rem; color: #5aff5a; margin-top: 10px; }

@keyframes bannerPop {
  0% { transform: translate(-50%, -50%) scale(0); }
  70% { transform: translate(-50%, -50%) scale(1.1); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
```

### 2.2 Boss Phase Transition Drama (45 min)

**When boss hits 50% HP:**
```javascript
function triggerPhaseTwo(boss) {
  // Screen flash red
  const flash = document.createElement('div');
  flash.className = 'phase-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);

  // Shake
  document.body.classList.add('big-shake');
  setTimeout(() => document.body.classList.remove('big-shake'), 500);

  // Boss taunt
  showBossTaunt(boss.phaseTwoTaunt);

  // Visual change
  bossSprite.classList.add('phase-two', 'enraged');
}
```

```css
.phase-flash {
  position: fixed;
  inset: 0;
  background: rgba(255, 0, 0, 0.5);
  animation: flashFade 0.5s ease-out forwards;
  z-index: 3000;
  pointer-events: none;
}

@keyframes flashFade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

.boss-sprite.enraged {
  filter: hue-rotate(30deg) saturate(1.5);
  animation: enragedPulse 0.5s infinite;
}

@keyframes enragedPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 2.3 Near-Death Tension (30 min)

**When player HP < 25%:**
```javascript
function updateHPDisplay(currentHP, maxHP) {
  const percent = (currentHP / maxHP) * 100;

  if (percent <= 25) {
    document.body.classList.add('critical-hp');
    if (!this.lowHPWarningShown) {
      showWarning("⚠️ DANGER! ⚠️");
      this.lowHPWarningShown = true;
    }
  } else {
    document.body.classList.remove('critical-hp');
    this.lowHPWarningShown = false;
  }
}
```

```css
body.critical-hp {
  animation: criticalPulse 1s infinite;
}

body.critical-hp::before {
  content: '';
  position: fixed;
  inset: 0;
  border: 4px solid rgba(255, 0, 0, 0.5);
  pointer-events: none;
  animation: criticalBorder 0.5s infinite;
  z-index: 1000;
}

@keyframes criticalPulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(0.9) sepia(0.2); }
}

@keyframes criticalBorder {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
```

### 2.4 Quick Restart Flow (1 hour)

**Problem:** After gauntlet death, too many clicks to restart.

**Solution:** Immediate "RETRY?" prompt:
```javascript
function showGameOver(stats) {
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-content">
      <div class="game-over-title">GAME OVER</div>
      <div class="game-over-score">
        <div>Questions: ${stats.questionsAnswered}</div>
        <div>Best Streak: ${stats.bestStreak}</div>
        <div>Score: ${stats.score}</div>
      </div>
      <div class="game-over-buttons">
        <button class="retry-btn" onclick="quickRestart()">RETRY (SPACE)</button>
        <button class="menu-btn" onclick="returnToMenu()">MENU (ESC)</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Keyboard shortcuts
  document.addEventListener('keydown', function handler(e) {
    if (e.code === 'Space') { quickRestart(); document.removeEventListener('keydown', handler); }
    if (e.code === 'Escape') { returnToMenu(); document.removeEventListener('keydown', handler); }
  });
}
```

### 2.5 Milestone Callouts (30 min)

**At questions 10, 25, 50, 75, 100:**
```javascript
const MILESTONES = [10, 25, 50, 75, 100, 150, 200];

function checkMilestone(questionCount) {
  if (MILESTONES.includes(questionCount)) {
    showMilestone(questionCount);
    playTone(1760, 0.2);  // High celebration tone
  }
}

function showMilestone(count) {
  const popup = document.createElement('div');
  popup.className = 'milestone-popup';
  popup.innerHTML = `<span class="milestone-number">${count}</span><span class="milestone-text">QUESTIONS!</span>`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2000);
}
```

---

## TIER 3: Polish (4+ hours)

### 3.1 Boss Sprite Reactions
- Idle animation (breathing)
- Hit reaction (recoil)
- Attack animation (lunge)
- Death animation (fade + particles)

### 3.2 Particle Effects
- Confetti on level up
- Sparkles on Lucky Strike
- Smoke on boss death
- Fire particles on high streak

### 3.3 Background Music System
- Calm music for study mode
- Tense music for gauntlet
- Boss battle theme
- Victory fanfare

### 3.4 Leaderboard Integration
- Show rank after each run
- "New Personal Best!" celebration
- Daily/weekly/all-time boards

---

## Implementation Priority

### Sprint 1: Core Juice (1 day)
1. Screen shake on wrong answer
2. Flash on correct answer
3. Floating damage numbers
4. Sound hooks (Web Audio beeps)

### Sprint 2: Progression Feel (1 day)
5. Combo visual escalation
6. Wave completion banner
7. Near-death tension
8. Milestone callouts

### Sprint 3: Flow Optimization (1 day)
9. Quick restart flow
10. Boss phase transitions
11. Game over screen with keyboard shortcuts

### Sprint 4: Polish (optional)
12. Particle effects
13. Boss sprite animations
14. Background music

---

## Success Metrics

**Before:** Users complete 5-10 questions per session
**After:** Users complete 25-50 questions per session

**Before:** 30% return rate next day
**After:** 50%+ return rate next day

**Before:** "It's educational"
**After:** "I can't stop playing"

---

## Files to Modify

| File | Changes |
|------|---------|
| `820.31.0-styles.css` | Add shake, flash, float, pulse keyframes |
| `820.31.1-app.js` | Wire shake triggers, milestone checks |
| `820.31.2-renderer.js` | Add damage number system, banners |
| `820.31.3-gamification.js` | Wire sound hooks, combo visuals |
| `820.31.19-battle-scene.js` | Boss reactions, phase transitions |

## New Files

| File | Purpose |
|------|---------|
| `820.31.27-screen-effects.js` | Shake, flash, screen utilities |
| `820.31.28-sound-system.js` | Web Audio tone generation |

---

## The Vision

**Current:** "Answer questions to learn anatomy"
**Target:** "Beat the boss, don't die, get the high score... oh wait, I just learned anatomy"

The learning is the **byproduct**, not the **goal**. The player is trying to:
- Beat their high score
- Survive one more wave
- See what the next boss looks like
- Unlock the next power-up

The knowledge sticks because they're **motivated to answer correctly**, not because they're trying to memorize.
