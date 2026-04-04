/**
 * Ms. Luminara Quiz - Story Engine
 * @file 820.31.95-story-engine.js
 * @version 2026-03-31
 *
 * Provides narrative context for map progression. Each map/act has a story
 * layer that gives meaning to the journey. The story engine:
 * - Displays dialogue/narration at key nodes
 * - Tracks narrative state (suspicion, fun, mad-libs choices)
 * - Personalizes Ms. Luminara's boss dialogue based on run history
 * - Creates the "why do I care" emotional hook for learning
 *
 * Stories are modular - each act can have its own story or share themes.
 */

const StoryEngine = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════

  let state = {
    active: false,
    currentStory: null,      // Story ID (e.g., 'waterfall-detour')
    currentNode: 0,          // Node index in story
    madLibs: {},             // Player's mad-lib choices
    meters: {
      suspicion: 0,          // 0-100: How suspicious NPCs are
      fun: 0,                // 0-100: How much fun you're having
      knowledge: 0           // 0-100: Questions answered correctly
    },
    events: [],              // Log of story events for boss reference
    startTime: null,
    wrongAnswerEvidence: []  // Physical evidence from wrong answers
  };

  // ═══════════════════════════════════════════════════════════════════════
  // STORY REGISTRY
  // ═══════════════════════════════════════════════════════════════════════

  const STORIES = {
    'waterfall-detour': {
      id: 'waterfall-detour',
      name: 'The Waterfall Detour',
      map: 'verdant-wilds',
      description: 'A mischievous morning adventure before class',

      // Opening narration
      intro: {
        title: 'The Waterfall Detour',
        text: `The morning alarm blares. School awaits. But the forest path whispers of adventure...

Today, you've decided to take "the scenic route."`,
        choices: null // No choice, just continue
      },

      // Mad-libs collected during story
      madLibPrompts: [
        { id: 'excuse_noun', prompt: 'Your excuse involves helping your...', type: 'noun', examples: ['grandma', 'neighbor', 'pet iguana'] },
        { id: 'excuse_adj', prompt: 'They had a very...', type: 'adjective', examples: ['urgent', 'mysterious', 'explosive'] },
        { id: 'excuse_problem', prompt: '...problem with their...', type: 'noun', examples: ['car', 'plumbing', 'rocket ship'] },
        { id: 'jump_exclamation', prompt: 'What do you yell as you jump?', type: 'exclamation', examples: ['YOLO!', 'CANNONBALL!', 'FOR SCIENCE!'] },
        { id: 'found_item', prompt: 'You find something in the water...', type: 'noun', examples: ['old coin', 'rubber duck', 'mysterious key'] }
      ],

      // Node-specific story beats (keyed by node index)
      nodes: {
        0: {
          type: 'narration',
          title: 'Home',
          text: `You slip out the back door, bag slung over one shoulder. The forest path beckons.`,
          mood: 'anticipation'
        },
        1: {
          type: 'madlib',
          promptId: 'excuse_noun',
          text: `Better have an excuse ready, just in case...`
        },
        2: {
          type: 'narration',
          title: 'The Forest Path',
          text: `Sunlight filters through the canopy. Birds chirp warnings to each other. Or maybe encouragement?`,
          mood: 'adventure'
        },
        3: {
          type: 'encounter',
          title: 'Suspicious Squirrel',
          text: `A squirrel stares at you with judgmental eyes. It knows what you're doing.`,
          wrongPenalty: { suspicion: 5, evidence: 'The squirrel will remember this.' }
        },
        4: {
          type: 'narration',
          text: `The path winds upward. You can hear the waterfall now...`,
          mood: 'excitement'
        },
        5: {
          type: 'madlib',
          promptId: 'excuse_adj',
          text: `Your excuse is coming together nicely...`
        },
        6: {
          type: 'narration',
          title: 'The Waterfall',
          text: `There it is. Crystal clear water cascading into a perfect swimming hole. School can wait.`,
          mood: 'temptation',
          funBonus: 10
        },
        7: {
          type: 'encounter',
          title: 'The Climb',
          text: `The rocks are slippery. One wrong step and you'll be explaining those bruises.`,
          wrongPenalty: { suspicion: 10, evidence: 'scraped knees' }
        },
        8: {
          type: 'narration',
          text: `You reach the top. The pool below shimmers invitingly.`,
          mood: 'anticipation'
        },
        9: {
          type: 'madlib',
          promptId: 'jump_exclamation',
          text: `This is it. The moment of truth. What do you yell?`
        },
        10: {
          type: 'narration',
          title: 'THE JUMP',
          text: `You leap into the void, time slowing as the world tilts...`,
          mood: 'exhilaration',
          funBonus: 25,
          animation: 'jump'
        },
        11: {
          type: 'splash',
          title: 'SPLASH!',
          text: `Cold water engulfs you. Pure joy. Pure freedom. Pure... lateness to class.`,
          funBonus: 20,
          suspicionBonus: 15, // Being wet is evidence!
          evidence: 'wet hair and clothes'
        },
        12: {
          type: 'boss_intro',
          title: 'The Reckoning',
          text: `You emerge from the forest path, dripping, grinning...

And there she stands. Arms crossed. One eyebrow raised.

Ms. Luminara.

"Well, well, well..."`,
          boss: 'MS_LUMINARA'
        }
      },

      // Boss configuration for this story
      boss: {
        id: 'MS_LUMINARA',
        name: 'Ms. Luminara',
        phases: [
          {
            name: 'The Stare',
            description: 'She just... looks at you.',
            questionCount: 2,
            dialogue: {
              intro: `*silence*\n\n*continued silence*\n\n*the silence somehow gets louder*`,
              correct: [`...Acceptable.`, `Hmph.`, `At least your brain isn't waterlogged.`],
              wrong: [`*eyebrow raises further*`, `Interesting.`, `The waterfall washed away that knowledge, did it?`]
            }
          },
          {
            name: 'The Interrogation',
            description: 'Questions. So many questions.',
            questionCount: 3,
            dialogue: {
              intro: `"Since you're SO eager to learn today, let's see what you actually know."`,
              correct: [`Correct. Surprising.`, `So you CAN learn. Even while truant.`, `Lucky guess.`],
              wrong: [`Wrong. But we have ALL of detention to review this.`, `Fascinating. Tell me more about the waterfall instead.`, `*writes in notebook*`]
            }
          },
          {
            name: 'The Deduction',
            description: 'She knows everything.',
            questionCount: 2,
            usesEvidence: true,
            dialogue: {
              intro: `"Let me piece together your morning, shall I?"`,
              deductions: [
                { evidence: 'wet hair and clothes', line: `"Your hair is wet. Interesting choice for a school day."` },
                { evidence: 'scraped knees', line: `"Those scrapes on your knees suggest... climbing? Rocks, perhaps?"` },
                { evidence: 'The squirrel will remember this.', line: `"A little bird told me you were seen near the forest path."` }
              ],
              correct: [`You counter my deduction. Impressive.`, `Fine. Perhaps I was mistaken about THAT detail.`],
              wrong: [`Just as I suspected.`, `The evidence doesn't lie.`]
            }
          }
        ],
        // Final dialogue based on performance
        endings: {
          perfect: {
            threshold: 90,
            text: `"Well, well. It seems the waterfall didn't wash away ALL your neurons."

*She almost smiles. Almost.*

"You may take your seat. But know this: I'm watching you. ALWAYS."

*As you walk past, she mutters:*

"Perhaps mischief and learning aren't mutually exclusive after all..."`,
            reward: 'grudging_respect'
          },
          good: {
            threshold: 70,
            text: `"Acceptable performance. Barely."

"Detention. One hour. Bring your textbook."

*pause*

"...And perhaps a towel."`,
            reward: 'detention_light'
          },
          mediocre: {
            threshold: 50,
            text: `"As I suspected. The waterfall has replaced your cerebral cortex."

"Detention. Three hours. We're going to have... fun."

*The way she says 'fun' makes it clear it won't be.*`,
            reward: 'detention_heavy'
          },
          poor: {
            threshold: 0,
            text: `"I see. The waterfall experience was educational in ALL the wrong ways."

"Detention. Every day this week. You're going to learn EVERYTHING."

*She hands you a mop.*

"Starting with the floors."`,
            reward: 'detention_eternal'
          }
        }
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Start a story for the current map
   * @param {string} mapId - The map ID (e.g., 'verdant-wilds')
   * @returns {Object} Story configuration or null if no story
   */
  function startStory(mapId) {
    // Find story for this map
    const story = Object.values(STORIES).find(s => s.map === mapId);
    if (!story) {
      console.log('[StoryEngine] No story for map:', mapId);
      return null;
    }

    state = {
      active: true,
      currentStory: story.id,
      currentNode: 0,
      madLibs: {},
      meters: { suspicion: 0, fun: 0, knowledge: 0 },
      events: [],
      startTime: Date.now(),
      wrongAnswerEvidence: []
    };

    console.log('[StoryEngine] Started story:', story.name);
    return story;
  }

  /**
   * Get story beat for current node
   * @param {number} nodeIndex - The node index on the map
   * @returns {Object} Story beat or null
   */
  function getNodeStory(nodeIndex) {
    if (!state.active || !state.currentStory) return null;

    const story = STORIES[state.currentStory];
    if (!story || !story.nodes) return null;

    return story.nodes[nodeIndex] || null;
  }

  /**
   * Record a mad-lib choice
   * @param {string} promptId - The prompt ID
   * @param {string} value - Player's input
   */
  function recordMadLib(promptId, value) {
    state.madLibs[promptId] = value;
    state.events.push({ type: 'madlib', promptId, value, time: Date.now() });
    console.log('[StoryEngine] Mad-lib recorded:', promptId, '=', value);
  }

  /**
   * Record wrong answer consequences
   * @param {Object} penalty - The penalty object from node config
   */
  function recordWrongAnswer(penalty) {
    if (!penalty) return;

    if (penalty.suspicion) {
      state.meters.suspicion = Math.min(100, state.meters.suspicion + penalty.suspicion);
    }
    if (penalty.evidence) {
      state.wrongAnswerEvidence.push(penalty.evidence);
    }
    state.events.push({ type: 'wrong_answer', penalty, time: Date.now() });
  }

  /**
   * Record correct answer
   */
  function recordCorrectAnswer() {
    state.meters.knowledge = Math.min(100, state.meters.knowledge + 5);
    state.events.push({ type: 'correct_answer', time: Date.now() });
  }

  /**
   * Apply fun bonus from story node
   * @param {number} bonus - Fun points to add
   */
  function addFun(bonus) {
    state.meters.fun = Math.min(100, state.meters.fun + bonus);
  }

  /**
   * Get current meters
   * @returns {Object} Current meter values
   */
  function getMeters() {
    return { ...state.meters };
  }

  /**
   * Get all mad-lib values
   * @returns {Object} Mad-lib choices
   */
  function getMadLibs() {
    return { ...state.madLibs };
  }

  /**
   * Get evidence collected from wrong answers
   * @returns {Array} Evidence strings
   */
  function getEvidence() {
    return [...state.wrongAnswerEvidence];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOSS DIALOGUE GENERATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get personalized boss intro dialogue
   * @returns {string} Dialogue with mad-libs inserted
   */
  function getBossIntro() {
    if (!state.currentStory) return null;

    const story = STORIES[state.currentStory];
    if (!story || !story.boss) return null;

    const madLibs = state.madLibs;
    const evidence = state.wrongAnswerEvidence;

    // Build personalized intro
    let intro = `"Ah, my favorite student. How... damp you look today."`;

    // Reference their excuse if they gave one
    if (madLibs.excuse_noun) {
      intro += `\n\n"I heard something about helping your ${madLibs.excuse_noun}`;
      if (madLibs.excuse_adj && madLibs.excuse_problem) {
        intro += ` with their ${madLibs.excuse_adj} ${madLibs.excuse_problem}`;
      }
      intro += `? Fascinating."`;
    }

    // Reference evidence
    if (evidence.length > 0) {
      intro += `\n\n*She eyes you critically*`;
      if (evidence.includes('wet hair and clothes')) {
        intro += `\n\n"Is that... algae in your hair?"`;
      }
    }

    // Reference jump exclamation if high fun
    if (madLibs.jump_exclamation && state.meters.fun > 50) {
      intro += `\n\n"I could hear someone yelling '${madLibs.jump_exclamation}' from my classroom window. How curious."`;
    }

    return intro;
  }

  /**
   * Get dialogue for a boss phase
   * @param {number} phase - Phase index
   * @param {string} type - 'intro', 'correct', 'wrong'
   * @returns {string} Dialogue line
   */
  function getBossDialogue(phase, type) {
    if (!state.currentStory) return null;

    const story = STORIES[state.currentStory];
    if (!story || !story.boss || !story.boss.phases[phase]) return null;

    const phaseConfig = story.boss.phases[phase];
    const dialogues = phaseConfig.dialogue[type];

    if (type === 'intro') {
      return dialogues;
    }

    // For correct/wrong, pick a random line
    if (Array.isArray(dialogues)) {
      return dialogues[Math.floor(Math.random() * dialogues.length)];
    }

    return dialogues;
  }

  /**
   * Get deduction dialogue based on evidence
   * @returns {Array} Deduction lines for collected evidence
   */
  function getDeductions() {
    if (!state.currentStory) return [];

    const story = STORIES[state.currentStory];
    if (!story || !story.boss) return [];

    const deductionPhase = story.boss.phases.find(p => p.usesEvidence);
    if (!deductionPhase) return [];

    const evidence = state.wrongAnswerEvidence;
    const deductions = [];

    for (const ded of deductionPhase.dialogue.deductions) {
      if (evidence.includes(ded.evidence)) {
        deductions.push(ded.line);
      }
    }

    return deductions;
  }

  /**
   * Get ending based on performance
   * @param {number} score - Performance score (0-100)
   * @returns {Object} Ending configuration
   */
  function getEnding(score) {
    if (!state.currentStory) return null;

    const story = STORIES[state.currentStory];
    if (!story || !story.boss || !story.boss.endings) return null;

    const endings = story.boss.endings;

    if (score >= endings.perfect.threshold) return endings.perfect;
    if (score >= endings.good.threshold) return endings.good;
    if (score >= endings.mediocre.threshold) return endings.mediocre;
    return endings.poor;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UI RENDERING
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Show story dialogue overlay
   * @param {Object} beat - Story beat configuration
   * @param {Function} onContinue - Callback when player continues
   */
  function showDialogue(beat, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'story-dialogue-overlay';
    overlay.innerHTML = `
      <div class="story-dialogue">
        ${beat.title ? `<h2 class="story-title">${beat.title}</h2>` : ''}
        <div class="story-text">${beat.text.replace(/\n/g, '<br>')}</div>
        <button class="story-continue-btn">Continue</button>
      </div>
    `;

    // Add styles if not present
    if (!document.getElementById('story-engine-styles')) {
      const style = document.createElement('style');
      style.id = 'story-engine-styles';
      style.textContent = getStyles();
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    // Handle continue
    overlay.querySelector('.story-continue-btn').onclick = () => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        if (beat.funBonus) addFun(beat.funBonus);
        if (beat.suspicionBonus) {
          state.meters.suspicion = Math.min(100, state.meters.suspicion + beat.suspicionBonus);
        }
        if (beat.evidence) {
          state.wrongAnswerEvidence.push(beat.evidence);
        }
        if (onContinue) onContinue();
      }, 300);
    };

    // Animate in
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }

  /**
   * Show mad-lib input prompt
   * @param {Object} prompt - Mad-lib prompt config
   * @param {Function} onSubmit - Callback with player's input
   */
  function showMadLibPrompt(prompt, onSubmit) {
    const overlay = document.createElement('div');
    overlay.className = 'story-dialogue-overlay madlib-prompt';
    overlay.innerHTML = `
      <div class="story-dialogue madlib-dialogue">
        <h2 class="story-title">Mad Libs!</h2>
        <p class="madlib-prompt-text">${prompt.prompt}</p>
        <p class="madlib-type">(Enter a ${prompt.type})</p>
        <input type="text" class="madlib-input" placeholder="${prompt.examples[Math.floor(Math.random() * prompt.examples.length)]}" maxlength="30">
        <div class="madlib-examples">
          Examples: ${prompt.examples.join(', ')}
        </div>
        <button class="story-continue-btn madlib-submit">Submit</button>
      </div>
    `;

    if (!document.getElementById('story-engine-styles')) {
      const style = document.createElement('style');
      style.id = 'story-engine-styles';
      style.textContent = getStyles();
      document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    const input = overlay.querySelector('.madlib-input');
    const submitBtn = overlay.querySelector('.madlib-submit');

    const submit = () => {
      const value = input.value.trim() || prompt.examples[0];
      recordMadLib(prompt.id, value);
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        if (onSubmit) onSubmit(value);
      }, 300);
    };

    submitBtn.onclick = submit;
    input.onkeypress = (e) => {
      if (e.key === 'Enter') submit();
    };

    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      input.focus();
    });
  }

  /**
   * Get CSS styles for story UI
   */
  function getStyles() {
    return `
      .story-dialogue-overlay {
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
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .story-dialogue-overlay.visible {
        opacity: 1;
      }
      .story-dialogue-overlay.fade-out {
        opacity: 0;
      }

      .story-dialogue {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 3px solid #c9a55c;
        border-radius: 16px;
        padding: 30px 40px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,165,92,0.2);
        transform: translateY(20px);
        animation: story-slide-up 0.4s ease forwards;
      }

      @keyframes story-slide-up {
        to { transform: translateY(0); }
      }

      .story-title {
        color: #c9a55c;
        font-family: Georgia, serif;
        font-size: 1.8rem;
        margin: 0 0 20px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      .story-text {
        color: #e0e0e0;
        font-size: 1.1rem;
        line-height: 1.7;
        margin-bottom: 25px;
        font-family: Georgia, serif;
      }

      .story-continue-btn {
        padding: 12px 40px;
        background: linear-gradient(135deg, #c9a55c 0%, #a08040 100%);
        border: 2px solid #8b7355;
        border-radius: 8px;
        color: #1a1a2e;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
      }
      .story-continue-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(201,165,92,0.4);
      }

      /* Mad-lib specific */
      .madlib-dialogue {
        max-width: 500px;
      }
      .madlib-prompt-text {
        color: #fff;
        font-size: 1.2rem;
        margin-bottom: 10px;
      }
      .madlib-type {
        color: #c9a55c;
        font-size: 0.9rem;
        margin-bottom: 20px;
        font-style: italic;
      }
      .madlib-input {
        width: 100%;
        padding: 15px;
        font-size: 1.2rem;
        border: 2px solid #c9a55c;
        border-radius: 8px;
        background: rgba(255,255,255,0.1);
        color: #fff;
        text-align: center;
        margin-bottom: 15px;
      }
      .madlib-input::placeholder {
        color: rgba(255,255,255,0.4);
      }
      .madlib-input:focus {
        outline: none;
        box-shadow: 0 0 15px rgba(201,165,92,0.3);
      }
      .madlib-examples {
        color: #888;
        font-size: 0.85rem;
        margin-bottom: 20px;
      }

      /* Story meters display */
      .story-meters {
        position: fixed;
        top: 70px;
        right: 20px;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #c9a55c;
        z-index: 9999;
      }
      .story-meter {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .story-meter:last-child {
        margin-bottom: 0;
      }
      .meter-icon {
        font-size: 1.2rem;
      }
      .meter-bar {
        width: 80px;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        overflow: hidden;
      }
      .meter-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      .meter-suspicion .meter-fill { background: #ff6b6b; }
      .meter-fun .meter-fill { background: #51cf66; }
      .meter-knowledge .meter-fill { background: #339af0; }
    `;
  }

  /**
   * Show/update story meters UI
   */
  function showMeters() {
    let metersEl = document.querySelector('.story-meters');
    if (!metersEl) {
      metersEl = document.createElement('div');
      metersEl.className = 'story-meters';
      document.body.appendChild(metersEl);
    }

    metersEl.innerHTML = `
      <div class="story-meter meter-suspicion">
        <span class="meter-icon">👁️</span>
        <div class="meter-bar"><div class="meter-fill" style="width: ${state.meters.suspicion}%"></div></div>
      </div>
      <div class="story-meter meter-fun">
        <span class="meter-icon">😄</span>
        <div class="meter-bar"><div class="meter-fill" style="width: ${state.meters.fun}%"></div></div>
      </div>
      <div class="story-meter meter-knowledge">
        <span class="meter-icon">📚</span>
        <div class="meter-bar"><div class="meter-fill" style="width: ${state.meters.knowledge}%"></div></div>
      </div>
    `;
  }

  /**
   * Hide story meters UI
   */
  function hideMeters() {
    const metersEl = document.querySelector('.story-meters');
    if (metersEl) metersEl.remove();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Check if a story exists for a map
   * @param {string} mapId - The map ID
   * @returns {boolean} True if story exists
   */
  function hasStory(mapId) {
    return Object.values(STORIES).some(s => s.map === mapId);
  }

  /**
   * End the current story
   */
  function endStory() {
    state.active = false;
    state.currentStory = null;
    hideMeters();
    console.log('[StoryEngine] Story ended');
  }

  return {
    // Lifecycle
    startStory,
    getNodeStory,
    hasStory,
    endStory,
    isActive: () => state.active,
    getState: () => ({ ...state }),

    // Story data
    getStory: (id) => STORIES[id],
    getAllStories: () => ({ ...STORIES }),

    // Recording
    recordMadLib,
    recordWrongAnswer,
    recordCorrectAnswer,
    addFun,

    // Getters
    getMeters,
    getMadLibs,
    getEvidence,

    // Boss dialogue
    getBossIntro,
    getBossDialogue,
    getDeductions,
    getEnding,

    // UI
    showDialogue,
    showMadLibPrompt,
    showMeters,
    hideMeters,

    // Aliases for backwards compatibility
    showMetersHUD: showMeters,
    hideMetersHUD: hideMeters
  };
})();

// Export for use
window.StoryEngine = StoryEngine;
