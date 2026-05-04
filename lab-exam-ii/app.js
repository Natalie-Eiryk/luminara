const ALL_SYSTEMS = "All systems";
const ALL_SECTIONS = "All sections";
const STORAGE_KEY = "lab_exam_ii_study_progress_v2";
const QUICK_RECORD_PREFIX = "quick:";
const DEFAULT_VIEW = "quick";
const QUICK_MODES = ["mixed", "multiple-choice", "true-false", "spelling", "identify", "visual", "histology", "station"];
const QUIZ_MODES = {
  smart: "Smart mix",
  weak: "Weak spots",
  fresh: "Fresh cards",
  favorites: "Favorites",
  sprint: "Random sprint"
};

const state = {
  view: DEFAULT_VIEW,
  selectedSystem: ALL_SYSTEMS,
  quizMode: "smart",
  quizLength: 10,
  quickMode: "mixed",
  quickSection: ALL_SECTIONS,
  quickQueue: [],
  quickCursor: 0,
  quickRevealed: false,
  quickSelection: "",
  quickScored: false,
  glossaryQuery: "",
  queue: [],
  currentCardId: null,
  answerVisible: false,
  atlasSystem: window.STUDY_DATA.systems[0],
  atlasPartId: null,
  atlasLabelsVisible: true,
  progress: loadProgress(),
  session: createSession(),
  message: "Build a session to start."
};

const els = {
  heroMetrics: byId("heroMetrics"),
  systemPills: byId("systemPills"),
  clearSystemBtn: byId("clearSystemBtn"),
  dashboardBadge: byId("dashboardBadge"),
  launchPlan: byId("launchPlan"),
  coverageSnapshot: byId("coverageSnapshot"),
  focusLadder: byId("focusLadder"),
  scaffoldPreview: byId("scaffoldPreview"),
  quizSystemSelect: byId("quizSystemSelect"),
  quizModeSelect: byId("quizModeSelect"),
  quizLengthSelect: byId("quizLengthSelect"),
  rebuildSessionBtn: byId("rebuildSessionBtn"),
  quickSystemSelect: byId("quickSystemSelect"),
  quickModeSelect: byId("quickModeSelect"),
  quickSectionSelect: byId("quickSectionSelect"),
  quickShuffleBtn: byId("quickShuffleBtn"),
  quickMeta: byId("quickMeta"),
  quickPrompt: byId("quickPrompt"),
  quickCounter: byId("quickCounter"),
  quickTagRow: byId("quickTagRow"),
  quickChoiceShell: byId("quickChoiceShell"),
  quickAnswerCard: byId("quickAnswerCard"),
  quickAnswerTerm: byId("quickAnswerTerm"),
  quickVisualCue: byId("quickVisualCue"),
  quickContext: byId("quickContext"),
  quickTrap: byId("quickTrap"),
  quickFigureStrip: byId("quickFigureStrip"),
  quickRevealBtn: byId("quickRevealBtn"),
  quickPrevBtn: byId("quickPrevBtn"),
  quickNextBtn: byId("quickNextBtn"),
  quickScoreButtons: [...document.querySelectorAll("[data-quick-score]")],
  quickQueueSummary: byId("quickQueueSummary"),
  quickQueuePreview: byId("quickQueuePreview"),
  quizSystemLabel: byId("quizSystemLabel"),
  quizPrompt: byId("quizPrompt"),
  quizTagRow: byId("quizTagRow"),
  supportLevelLabel: byId("supportLevelLabel"),
  supportLevelBadge: byId("supportLevelBadge"),
  supportLevelSummary: byId("supportLevelSummary"),
  supportWarmups: byId("supportWarmups"),
  supportAnchors: byId("supportAnchors"),
  supportTraps: byId("supportTraps"),
  supportChallenge: byId("supportChallenge"),
  quizAnswerCard: byId("quizAnswerCard"),
  quizAnswerText: byId("quizAnswerText"),
  revealAnswerBtn: byId("revealAnswerBtn"),
  nextCardBtn: byId("nextCardBtn"),
  favoriteCardBtn: byId("favoriteCardBtn"),
  scoreButtons: [...document.querySelectorAll("[data-score]")],
  quizFeedback: byId("quizFeedback"),
  queueSummary: byId("queueSummary"),
  queuePreview: byId("queuePreview"),
  weakSpotList: byId("weakSpotList"),
  guideWeakSpotList: byId("guideWeakSpotList"),
  favoriteList: byId("favoriteList"),
  recentWinsList: byId("recentWinsList"),
  glossarySystemSelect: byId("glossarySystemSelect"),
  glossarySearchInput: byId("glossarySearchInput"),
  glossaryCount: byId("glossaryCount"),
  glossaryGrid: byId("glossaryGrid"),
  atlasTabs: byId("atlasTabs"),
  toggleLabelsBtn: byId("toggleLabelsBtn"),
  atlasTitle: byId("atlasTitle"),
  atlasSummary: byId("atlasSummary"),
  atlasStage: byId("atlasStage"),
  atlasLegend: byId("atlasLegend"),
  atlasFocusCard: byId("atlasFocusCard"),
  atlasFigureGallery: byId("atlasFigureGallery"),
  masterScaffoldList: byId("masterScaffoldList"),
  systemScaffoldHeading: byId("systemScaffoldHeading"),
  systemScaffoldList: byId("systemScaffoldList"),
  scaffoldCoach: byId("scaffoldCoach"),
  scaffoldLadder: byId("scaffoldLadder"),
  sessionPulse: byId("sessionPulse"),
  systemConfidence: byId("systemConfidence"),
  recentNotes: byId("recentNotes")
};

setup();

function setup() {
  applyRoute();
  buildSystemSelects();
  bindEvents();
  buildQuickQueue(false);
  buildSession(false);
  renderApp();
}

function bindEvents() {
  document.body.addEventListener("click", onBodyClick);

  els.quizSystemSelect.addEventListener("change", (event) => {
    setSelectedSystem(event.target.value, false);
    buildSession();
  });

  els.glossarySystemSelect.addEventListener("change", (event) => {
    setSelectedSystem(event.target.value);
    if (state.view !== "glossary") {
      setView("glossary");
    }
  });

  els.quizModeSelect.addEventListener("change", (event) => {
    state.quizMode = event.target.value;
    buildSession();
  });

  els.quizLengthSelect.addEventListener("change", (event) => {
    state.quizLength = Number(event.target.value);
    buildSession();
  });

  els.rebuildSessionBtn.addEventListener("click", () => buildSession());

  els.quickSystemSelect.addEventListener("change", (event) => {
    setSelectedSystem(event.target.value, false);
    buildQuickQueue();
  });

  els.quickModeSelect.addEventListener("change", (event) => {
    state.quickMode = event.target.value;
    buildQuickQueue();
  });

  els.quickSectionSelect.addEventListener("change", (event) => {
    state.quickSection = event.target.value;
    buildQuickQueue();
  });

  els.quickShuffleBtn.addEventListener("click", () => buildQuickQueue(true, true));
  els.quickRevealBtn.addEventListener("click", () => toggleQuickReveal());
  els.quickPrevBtn.addEventListener("click", () => stepQuickCard(-1));
  els.quickNextBtn.addEventListener("click", () => stepQuickCard(1));

  els.glossarySearchInput.addEventListener("input", (event) => {
    state.glossaryQuery = event.target.value;
    renderGlossary();
  });

  els.toggleLabelsBtn.addEventListener("click", () => {
    state.atlasLabelsVisible = !state.atlasLabelsVisible;
    renderAtlas();
  });

  document.addEventListener("keydown", onKeydown);
  window.addEventListener("popstate", () => {
    applyRoute();
    buildQuickQueue(false);
    buildSession(false);
    renderApp();
  });
}

function onBodyClick(event) {
  const navButton = event.target.closest("[data-nav-view]");
  if (navButton) {
    setView(navButton.dataset.navView);
    return;
  }

  const jumpButton = event.target.closest("[data-jump-view]");
  if (jumpButton) {
    setView(jumpButton.dataset.jumpView);
    return;
  }

  const systemButton = event.target.closest("[data-system-focus]");
  if (systemButton) {
    setSelectedSystem(systemButton.dataset.systemFocus);
    return;
  }

  const atlasSystemButton = event.target.closest("[data-atlas-system]");
  if (atlasSystemButton) {
    setSelectedSystem(atlasSystemButton.dataset.atlasSystem, false);
    state.atlasSystem = atlasSystemButton.dataset.atlasSystem;
    syncAtlasPart();
    state.view = "atlas";
    renderApp();
    return;
  }

  const atlasPartButton = event.target.closest("[data-atlas-part]");
  if (atlasPartButton) {
    state.atlasPartId = atlasPartButton.dataset.atlasPart;
    renderAtlas();
    return;
  }

  const stagePart = event.target.closest(".diagram-part");
  if (stagePart) {
    state.atlasPartId = stagePart.dataset.part;
    emitV2TeachingSignal("atlas_focus", stagePart.dataset.part, { kind: "atlas_part" });
    renderAtlas();
    return;
  }

  const scoreButton = event.target.closest("[data-score]");
  if (scoreButton) {
    scoreCurrentCard(scoreButton.dataset.score);
    return;
  }

  const quickChoiceButton = event.target.closest("[data-quick-choice]");
  if (quickChoiceButton) {
    state.quickSelection = quickChoiceButton.dataset.quickChoice;
    state.quickRevealed = true;
    const item = currentQuickItem();
    emitV2TeachingSignal("choice", item?.id, {
      kind: promptKindForQuickItem(item),
      selected: quickChoiceButton.dataset.quickChoice
    });
    renderQuickRoll();
    return;
  }

  const quickScoreButton = event.target.closest("[data-quick-score]");
  if (quickScoreButton) {
    scoreQuickCard(quickScoreButton.dataset.quickScore);
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) {
    return;
  }

  switch (action.dataset.action) {
    case "clear-system":
      setSelectedSystem(ALL_SYSTEMS);
      break;
    case "reveal":
      toggleAnswer();
      break;
    case "skip":
      skipCurrentCard();
      break;
    case "favorite":
      toggleFavorite();
      break;
    case "study-card":
      startFocusedDrill(action.dataset.cardId);
      break;
    default:
      break;
  }
}

function onKeydown(event) {
  const activeTag = document.activeElement && document.activeElement.tagName;
  if (activeTag === "INPUT" || activeTag === "SELECT" || activeTag === "TEXTAREA") {
    return;
  }

  if (state.view === "quick") {
    if (event.code === "Space") {
      event.preventDefault();
      if (state.quickRevealed) {
        stepQuickCard(1);
      } else {
        toggleQuickReveal();
      }
    }
    if (event.key.toLowerCase() === "n") {
      stepQuickCard(1);
    }
    if (event.key.toLowerCase() === "b") {
      stepQuickCard(-1);
    }
    if (event.key === "1") {
      scoreQuickCard("easy");
    }
    if (event.key === "2") {
      scoreQuickCard("shaky");
    }
    if (event.key === "3") {
      scoreQuickCard("hard");
    }
    return;
  }

  if (state.view !== "quiz") {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (currentCard()) {
      if (state.answerVisible) {
        skipCurrentCard();
      } else {
        toggleAnswer();
      }
    } else {
      buildSession();
    }
  }

  if (!state.answerVisible) {
    return;
  }

  if (event.key === "1") {
    scoreCurrentCard("easy");
  }
  if (event.key === "2") {
    scoreCurrentCard("shaky");
  }
  if (event.key === "3") {
    scoreCurrentCard("hard");
  }
  if (event.key.toLowerCase() === "f") {
    toggleFavorite();
  }
}

function applyRoute() {
  const params = new URLSearchParams(window.location.search);
  const nextView = params.get("view");
  const nextSystem = params.get("system");
  const nextSection = params.get("section");
  const nextQuickMode = params.get("quick");

  if (nextView && isView(nextView)) {
    state.view = nextView;
  }

  if (nextSystem && (window.STUDY_DATA.systems.includes(nextSystem) || nextSystem === ALL_SYSTEMS)) {
    state.selectedSystem = nextSystem;
    if (nextSystem !== ALL_SYSTEMS) {
      state.atlasSystem = nextSystem;
    }
  }

  if (nextSection && (window.STUDY_DATA.quickRollSections || []).includes(nextSection)) {
    state.quickSection = nextSection;
  }

  if (nextQuickMode && QUICK_MODES.includes(nextQuickMode)) {
    state.quickMode = nextQuickMode;
  }

  syncAtlasPart();
}

function syncUrl() {
  const params = new URLSearchParams();
  if (state.view !== DEFAULT_VIEW) {
    params.set("view", state.view);
  }
  if (state.selectedSystem !== ALL_SYSTEMS) {
    params.set("system", state.selectedSystem);
  }
  if (state.view === "quick" && state.quickMode !== "mixed") {
    params.set("quick", state.quickMode);
  }
  if (state.view === "quick" && state.quickSection !== ALL_SECTIONS) {
    params.set("section", state.quickSection);
  }

  const nextPath = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  try {
    window.history.replaceState(null, "", nextPath);
  } catch (error) {
    void error;
  }
}

function setView(view) {
  if (!isView(view)) {
    return;
  }
  state.view = view;
  if (view === "quick") {
    buildQuickQueue();
    return;
  }
  if (view === "quiz" && currentCard() && state.selectedSystem !== ALL_SYSTEMS && currentCard().system !== state.selectedSystem) {
    buildSession();
    return;
  }
  syncUrl();
  renderViewState();
}

function setSelectedSystem(system, renderNow = true) {
  if (system === ALL_SYSTEMS) {
    state.selectedSystem = ALL_SYSTEMS;
  } else if (window.STUDY_DATA.systems.includes(system)) {
    state.selectedSystem = system;
    state.atlasSystem = system;
    syncAtlasPart();
  } else {
    return;
  }

  if (renderNow) {
    if (state.view === "quick") {
      buildQuickQueue();
    } else if (state.view === "quiz") {
      buildSession();
    } else {
      state.message = state.selectedSystem === ALL_SYSTEMS
        ? "All systems are back in rotation."
        : `${state.selectedSystem} is now the active focus.`;
      renderApp();
    }
  }
}

function buildSystemSelects() {
  const options = [ALL_SYSTEMS, ...window.STUDY_DATA.systems]
    .map((system) => `<option value="${escapeHtml(system)}">${escapeHtml(system)}</option>`)
    .join("");

  els.quizSystemSelect.innerHTML = options;
  els.glossarySystemSelect.innerHTML = options;
  els.quickSystemSelect.innerHTML = options;
  els.quickSectionSelect.innerHTML = (window.STUDY_DATA.quickRollSections || [ALL_SECTIONS])
    .map((section) => `<option value="${escapeHtml(section)}">${escapeHtml(section)}</option>`)
    .join("");
}

function buildQuickQueue(renderNow = true, randomize = false) {
  let items = quickPool(state.selectedSystem);
  if (randomize) {
    items = shuffle(items);
  }
  state.quickQueue = items.map((item) => item.id);
  state.quickCursor = 0;
  state.quickRevealed = false;
  state.quickSelection = "";
  state.quickScored = false;

  if (renderNow) {
    renderApp();
  }
}

function toggleQuickReveal() {
  if (!currentQuickItem()) {
    buildQuickQueue();
    return;
  }
  state.quickRevealed = !state.quickRevealed;
  if (!state.quickRevealed) {
    state.quickSelection = "";
  } else {
    const item = currentQuickItem();
    emitV2TeachingSignal("reveal", item?.id, { kind: promptKindForQuickItem(item) });
  }
  renderQuickRoll();
}

function scoreQuickCard(score) {
  if (!currentQuickItem() || !state.quickRevealed || state.quickScored) {
    return;
  }
  recordQuickAttempt(score);
  stepQuickCard(1);
}

function recordQuickAttempt(score) {
  const item = currentQuickItem();
  if (!item || !["easy", "shaky", "hard"].includes(score)) {
    return;
  }

  const record = ensureQuickRecord(item.id);
  record.attempts += 1;
  record[score] += 1;
  record.lastOutcome = score;
  record.lastSeen = Date.now();
  record.streak = score === "easy" ? record.streak + 1 : 0;
  state.quickScored = true;
  saveProgress();
  emitV2TeachingScore(item.id, score, {
    kind: promptKindForQuickItem(item),
    aggregateContext: {
      attempts: record.attempts,
      confidence: quickConfidence(item.id)
    }
  });
}

function stepQuickCard(direction) {
  if (!state.quickQueue.length) {
    buildQuickQueue();
    return;
  }
  const size = state.quickQueue.length;
  state.quickCursor = (state.quickCursor + direction + size) % size;
  state.quickRevealed = false;
  state.quickSelection = "";
  state.quickScored = false;
  renderQuickRoll();
}

function buildSession(renderNow = true) {
  let cards = questionPool(state.selectedSystem);
  let fallbackNote = "";

  switch (state.quizMode) {
    case "weak":
      cards = weakCards(state.selectedSystem);
      if (!cards.length) {
        cards = questionPool(state.selectedSystem).sort((a, b) => cardPriority(b) - cardPriority(a));
        fallbackNote = "No saved weak cards yet, so this deck fell back to Smart mix.";
      }
      break;
    case "fresh": {
      const unseen = cards.filter((card) => !readRecord(card.id).attempts);
      const reviewed = cards
        .filter((card) => readRecord(card.id).attempts)
        .sort((a, b) => readRecord(a.id).attempts - readRecord(b.id).attempts);
      cards = shuffle(unseen).concat(shuffle(reviewed));
      break;
    }
    case "favorites":
      cards = favoriteCards(state.selectedSystem);
      if (!cards.length) {
        cards = questionPool(state.selectedSystem).sort((a, b) => cardPriority(b) - cardPriority(a));
        fallbackNote = "No favorites saved yet, so this deck fell back to Smart mix.";
      }
      break;
    case "sprint":
      cards = shuffle(cards);
      break;
    default:
      cards = cards.sort((a, b) => cardPriority(b) - cardPriority(a));
      break;
  }

  const limited = state.quizLength === 999 ? cards : cards.slice(0, state.quizLength);
  state.queue = limited.map((card) => card.id);
  state.currentCardId = null;
  state.answerVisible = false;
  state.session = createSession();
  state.session.built = state.queue.length;
  state.message = limited.length
    ? fallbackNote || "Session ready. Reveal the answer, then score yourself."
    : "No cards matched the current filter.";

  advanceCard();

  if (renderNow) {
    renderApp();
  }
}

function advanceCard() {
  state.currentCardId = state.queue.shift() || null;
  state.answerVisible = false;
  if (!state.currentCardId && state.session.answered) {
    state.message = "Session complete. Build another deck or review weak spots next.";
  }
}

function toggleAnswer() {
  if (!currentCard()) {
    buildSession();
    return;
  }
  state.answerVisible = !state.answerVisible;
  state.message = state.answerVisible
    ? "Compare your answer, then score the card."
    : "Answer hidden again.";
  if (state.answerVisible) {
    emitV2TeachingSignal("reveal", currentCard()?.id, { kind: "question" });
  }
  renderQuiz();
}

function skipCurrentCard() {
  if (!currentCard()) {
    buildSession();
    return;
  }
  state.queue.push(state.currentCardId);
  state.message = "Card moved to the back of the queue.";
  advanceCard();
  renderApp();
}

function scoreCurrentCard(score) {
  const card = currentCard();
  if (!card || !state.answerVisible) {
    return;
  }

  const record = ensureRecord(card.id);
  record.attempts += 1;
  record[score] += 1;
  record.lastOutcome = score;
  record.lastSeen = Date.now();
  record.streak = score === "easy" ? record.streak + 1 : 0;

  state.session.answered += 1;
  state.session[score] += 1;

  if (score !== "easy" && (state.session.requeued[card.id] || 0) < 1) {
    state.session.requeued[card.id] = (state.session.requeued[card.id] || 0) + 1;
    state.queue.push(card.id);
  }

  saveProgress();
  emitV2TeachingScore(card.id, score, {
    kind: "question",
    aggregateContext: {
      attempts: record.attempts,
      confidence: cardConfidence(card.id),
      sessionAnswered: state.session.answered
    }
  });
  state.message = {
    easy: "Locked in. Next card ready.",
    shaky: "Marked shaky. This card will come back once more.",
    hard: "Marked hard. This card will come back before the session ends."
  }[score];

  advanceCard();
  renderApp();
}

function startFocusedDrill(cardId) {
  const card = questionById(cardId);
  if (!card) {
    return;
  }

  setSelectedSystem(card.system, false);
  const supportCards = weakCards(card.system)
    .map((item) => item.id)
    .filter((id) => id !== cardId)
    .slice(0, 4);

  state.queue = [cardId, ...supportCards];
  state.currentCardId = null;
  state.answerVisible = false;
  state.session = createSession();
  state.session.built = state.queue.length;
  state.message = "Focused drill loaded from your review list.";
  advanceCard();
  state.view = "quiz";
  renderApp();
}

function toggleFavorite() {
  const card = currentCard();
  if (!card) {
    return;
  }

  const record = ensureRecord(card.id);
  record.favorite = !record.favorite;
  record.lastSeen = record.lastSeen || Date.now();
  saveProgress();
  emitV2TeachingSignal(record.favorite ? "favorite" : "unfavorite", card.id, { kind: "question" });
  state.message = record.favorite ? "Card saved to favorites." : "Card removed from favorites.";
  renderApp();
}

function renderApp() {
  syncAtlasPart();
  syncUrl();
  renderViewState();
  renderNavigation();
  renderHero();
  renderQuickRoll();
  renderDashboard();
  renderQuiz();
  renderReview();
  renderGlossary();
  renderAtlas();
  renderScaffolds();
  renderSidebar();
}

function renderViewState() {
  document.querySelectorAll("[data-view]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.view === state.view);
  });

  document.querySelectorAll("[data-nav-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.navView === state.view);
  });
}

function renderNavigation() {
  els.systemPills.innerHTML = window.STUDY_DATA.systems
    .map((system) => {
      const summary = systemSummary(system);
      const active = state.selectedSystem === system;
      return `
        <button class="system-pill ${active ? "is-active" : ""}" type="button" data-system-focus="${escapeHtml(system)}">
          <span>${escapeHtml(system)}</span>
          <small>${summary.studied}/${summary.total}</small>
        </button>`;
    })
    .join("");

  els.clearSystemBtn.classList.toggle("is-active", state.selectedSystem === ALL_SYSTEMS);
  els.quizSystemSelect.value = state.selectedSystem;
  els.quickSystemSelect.value = state.selectedSystem;
  els.quickModeSelect.value = state.quickMode;
  els.quickSectionSelect.value = state.quickSection;
  els.glossarySystemSelect.value = state.selectedSystem;
  els.quizModeSelect.value = state.quizMode;
  els.quizLengthSelect.value = String(state.quizLength);
}

function renderHero() {
  const totalTerms = Object.values(window.STUDY_DATA.glossary).reduce((sum, items) => sum + items.length, 0);
  const seenCards = window.STUDY_DATA.questions.filter((card) => readRecord(card.id).attempts).length;
  const favoritesCount = favoriteCards(ALL_SYSTEMS).length;

  els.heroMetrics.innerHTML = [
    metricPill("Guide cards", `${(window.STUDY_DATA.quickRollItems || []).length}`),
    metricPill("Cards", `${window.STUDY_DATA.questions.length}`),
    metricPill("Seen", `${seenCards}`),
    metricPill("Terms", `${totalTerms}`),
    metricPill("Atlas plates", `${Object.keys(window.STUDY_DATA.atlas).length}`),
    metricPill("Favorites", `${favoritesCount}`)
  ].join("");
}

function renderQuickRoll() {
  const item = currentQuickItem();
  const queueItems = state.quickQueue
    .slice(state.quickCursor, state.quickCursor + 7)
    .map((id) => quickItemById(id))
    .filter(Boolean);

  if (!item) {
    els.quickMeta.textContent = state.selectedSystem;
    els.quickPrompt.textContent = "No exam-guide cards match this filter.";
    els.quickCounter.textContent = "0/0";
    els.quickTagRow.innerHTML = "";
    els.quickAnswerTerm.textContent = "";
    els.quickVisualCue.textContent = "";
    els.quickContext.textContent = "";
    els.quickTrap.textContent = "";
    els.quickChoiceShell.innerHTML = "";
    els.quickFigureStrip.innerHTML = "";
    els.quickAnswerCard.classList.remove("is-visible");
    els.quickRevealBtn.textContent = "Reload";
    els.quickPrevBtn.disabled = true;
    els.quickNextBtn.disabled = true;
    els.quickScoreButtons.forEach((button) => {
      button.disabled = true;
    });
    els.quickQueueSummary.textContent = "No guide cards queued.";
    els.quickQueuePreview.innerHTML = `<p class="empty-state">Try all sections or all systems.</p>`;
    return;
  }

  const promptKind = promptKindForQuickItem(item);
  const choiceState = quickChoiceState(item, promptKind);
  const quickRecord = readQuickRecord(item.id);
  els.quickMeta.textContent = `${item.system} - ${item.section}`;
  els.quickPrompt.textContent = promptForQuickItem(item, promptKind, choiceState);
  els.quickCounter.textContent = `${state.quickCursor + 1}/${state.quickQueue.length}`;
  els.quickTagRow.innerHTML = [
    `<span class="chip">${escapeHtml(item.system)}</span>`,
    `<span class="chip">${escapeHtml(item.category)}</span>`,
    `<span class="chip chip-soft">${escapeHtml(promptLabel(promptKind))}</span>`,
    `<span class="chip chip-soft">${escapeHtml(quickStatusLabel(item.id))}</span>`
  ].join("");
  els.quickChoiceShell.innerHTML = renderQuickChoiceShell(item, promptKind, choiceState);
  els.quickAnswerTerm.textContent = state.quickRevealed ? answerTextForQuickItem(item) : "";
  els.quickVisualCue.textContent = state.quickRevealed ? item.visual : "";
  els.quickContext.textContent = state.quickRevealed ? item.section : "";
  els.quickTrap.textContent = state.quickRevealed ? item.trap : "";
  els.quickFigureStrip.innerHTML = state.quickRevealed
    ? figuresForSystem(item.system).slice(0, 2).map((figure) => `
      <figure class="quick-figure-card">
        <img src="${escapeHtml(figure.src)}" alt="${escapeHtml(figure.title)}" loading="lazy" />
        <figcaption>${escapeHtml(figure.title)}</figcaption>
      </figure>`).join("")
    : "";
  els.quickAnswerCard.classList.toggle("is-visible", state.quickRevealed);
  els.quickRevealBtn.textContent = state.quickRevealed ? "Hide answer" : "Show answer";
  els.quickPrevBtn.disabled = state.quickQueue.length < 2;
  els.quickNextBtn.disabled = state.quickQueue.length < 2;
  els.quickScoreButtons.forEach((button) => {
    button.disabled = !state.quickRevealed || state.quickScored;
  });
  els.quickQueueSummary.textContent = `${state.quickQueue.length} guide card${state.quickQueue.length === 1 ? "" : "s"} in this roll. Current: ${quickRecord.attempts ? quickStatusLabel(item.id) : "new"}.`;
  els.quickQueuePreview.innerHTML = queueItems.length
    ? queueItems.map((queueItem, index) => renderQuickQueueCard(queueItem, index === 0)).join("")
    : `<p class="empty-state">No queued guide cards.</p>`;
}

function renderDashboard() {
  const summaries = sortedSystemSummaries();
  const weakest = summaries[0];
  const strongest = summaries[summaries.length - 1];
  const seenCards = window.STUDY_DATA.questions.filter((card) => readRecord(card.id).attempts).length;
  const focusSystem = currentFocusSystem();

  els.dashboardBadge.textContent = state.selectedSystem === ALL_SYSTEMS
    ? "All systems loaded"
    : `${state.selectedSystem} focus`;

  const launchItems = [
    seenCards
      ? `Start with a ${QUIZ_MODES[state.quizMode].toLowerCase()} deck and push your weakest system: ${weakest.system}.`
      : "Start with a 10-card Smart mix, then score honestly so the review engine has something to work with.",
    `Open the ${focusSystem} atlas and rehearse: ${window.STUDY_DATA.systemMeta[focusSystem].atlasPrompt}`,
    "Use the scaffold panel before any timed self-test so you keep the station questions consistent."
  ];

  els.launchPlan.innerHTML = renderBulletList(launchItems);

  els.coverageSnapshot.innerHTML = `
    <div class="kpi-grid">
      ${kpiCard("Cards practiced", `${seenCards}/${window.STUDY_DATA.questions.length}`, "How much of the bank has at least one score saved.")}
      ${kpiCard("Weak cards", `${weakCards(ALL_SYSTEMS).length}`, "Cards that still trend hard or low-confidence.")}
      ${kpiCard("Strongest system", strongest.system, `${strongest.confidence}% confidence across studied cards.`)}
      ${kpiCard("Current focus", focusSystem, window.STUDY_DATA.systemMeta[focusSystem].cue)}
    </div>`;

  els.focusLadder.innerHTML = summaries
    .map((summary) => {
      const coverage = Math.round((summary.studied / summary.total) * 100);
      return `
        <article class="system-row">
          <div>
            <h4>${escapeHtml(summary.system)}</h4>
            <p>${summary.studied}/${summary.total} cards practiced · ${summary.confidence}% confidence · ${summary.hard} current trouble cards</p>
          </div>
          <div class="system-row-actions">
            <div class="confidence-track"><span style="width:${Math.max(8, coverage)}%"></span></div>
            <button class="mini-btn" type="button" data-system-focus="${escapeHtml(summary.system)}">Focus</button>
          </div>
        </article>`;
    })
    .join("");

  els.scaffoldPreview.innerHTML = `
    <p class="mini-copy">Use the master drill first, then add the ${escapeHtml(focusSystem)} cues.</p>
    <div class="chip-cluster">
      ${window.STUDY_DATA.scaffolds.master.slice(0, 3).map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}
      ${window.STUDY_DATA.scaffolds.systems[focusSystem].map((item) => `<span class="chip chip-soft">${escapeHtml(item)}</span>`).join("")}
    </div>`;
}

function renderQuiz() {
  const card = currentCard();
  const nextCards = [state.currentCardId, ...state.queue].filter(Boolean).slice(0, 6);
  const supportSystem = card ? card.system : currentFocusSystem();
  const supportLevel = scaffoldLevelFor(supportSystem);
  const supportData = scaffoldLevelData(supportLevel);
  const supportBundle = supportBundleFor(supportSystem);
  const supportLists = scaffoldListsForLevel(supportBundle, supportLevel);

  if (!card) {
    els.quizSystemLabel.textContent = state.selectedSystem;
    els.quizPrompt.textContent = "No active card.";
    els.quizAnswerText.textContent = state.session.answered
      ? `You finished ${state.session.answered} cards in this session.`
      : "Build a session to start drilling.";
    els.quizTagRow.innerHTML = "";
    els.quizAnswerCard.classList.remove("is-visible");
    els.favoriteCardBtn.disabled = true;
    els.favoriteCardBtn.classList.remove("is-active");
    els.favoriteCardBtn.textContent = "Save";
    els.revealAnswerBtn.textContent = "Build session";
    els.nextCardBtn.textContent = "Build session";
  } else {
    const record = readRecord(card.id);
    els.quizSystemLabel.textContent = card.system;
    els.quizPrompt.textContent = card.prompt;
    els.quizAnswerText.textContent = state.answerVisible ? card.answer : "Answer hidden until you reveal it.";
    els.quizTagRow.innerHTML = [
      ...card.tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`),
      `<span class="chip chip-soft">${cardStatusLabel(card.id)}</span>`
    ].join("");
    els.quizAnswerCard.classList.toggle("is-visible", state.answerVisible);
    els.favoriteCardBtn.disabled = false;
    els.favoriteCardBtn.classList.toggle("is-active", Boolean(record.favorite));
    els.favoriteCardBtn.textContent = record.favorite ? "Saved" : "Save";
    els.revealAnswerBtn.textContent = state.answerVisible ? "Hide answer" : "Reveal answer";
    els.nextCardBtn.textContent = "Skip for now";
  }

  els.supportLevelLabel.textContent = `${supportData.label} for ${supportSystem}`;
  els.supportLevelBadge.textContent = supportData.label;
  els.supportLevelSummary.textContent = `${supportData.summary} This model is adapted from the teaching-library scaffold system.`;
  els.supportWarmups.innerHTML = supportLists.warmups.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.supportAnchors.innerHTML = supportLists.anchors.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.supportTraps.innerHTML = supportLists.traps.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.supportChallenge.innerHTML = supportLists.challenge.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  els.scoreButtons.forEach((button) => {
    button.disabled = !card || !state.answerVisible;
  });

  els.quizFeedback.textContent = state.message;
  els.queueSummary.textContent = `Answered ${state.session.answered}/${Math.max(state.session.built, state.session.answered)} · Remaining ${nextCards.length ? nextCards.length - 1 : 0}`;
  els.queuePreview.innerHTML = nextCards.length
    ? nextCards.map((cardId, index) => renderQueueCard(cardId, index === 0)).join("")
    : `<p class="empty-state">No queued cards yet.</p>`;
}

function renderReview() {
  const focus = state.selectedSystem;
  els.weakSpotList.innerHTML = renderReviewGroup(
    weakCards(focus).slice(0, 6),
    "No weak spots saved yet. Score a few cards first and this panel will sharpen."
  );
  els.guideWeakSpotList.innerHTML = renderGuideReviewGroup(
    weakQuickItems(focus).slice(0, 6),
    "No guide weak spots yet. Score Quick Roll cards to build this list."
  );
  els.favoriteList.innerHTML = renderReviewGroup(
    favoriteCards(focus).slice(0, 6),
    "Save a few cards from quiz mode to build a quick custom deck."
  );
  els.recentWinsList.innerHTML = renderReviewGroup(
    recentWins(focus).slice(0, 6),
    "Your rebounds will appear here once you start stacking easy scores."
  );
}

function renderGlossary() {
  const query = state.glossaryQuery.trim().toLowerCase();
  const items = glossaryPool(state.selectedSystem).filter((item) => {
    if (!query) {
      return true;
    }
    return [item.term, item.definition, item.system].some((value) => value.toLowerCase().includes(query));
  });

  els.glossaryCount.textContent = `${items.length} term${items.length === 1 ? "" : "s"} shown`;
  els.glossaryGrid.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="glossary-card">
              <p class="glossary-system">${escapeHtml(item.system)}</p>
              <h4>${escapeHtml(item.term)}</h4>
              <p>${escapeHtml(item.definition)}</p>
            </article>`
        )
        .join("")
    : `<p class="empty-state">No glossary matches for that search yet.</p>`;
}

function renderAtlas() {
  const atlas = window.STUDY_DATA.atlas[state.atlasSystem];
  if (!atlas) {
    return;
  }
  const figures = figuresForSystem(state.atlasSystem);

  els.atlasTabs.innerHTML = window.STUDY_DATA.systems
    .map((system) => `
      <button class="tab-pill ${state.atlasSystem === system ? "is-active" : ""}" type="button" data-atlas-system="${escapeHtml(system)}">
        ${escapeHtml(system)}
      </button>`)
    .join("");

  els.atlasTitle.textContent = atlas.title;
  els.atlasSummary.textContent = atlas.summary;
  els.atlasStage.innerHTML = atlas.svg;
  els.atlasStage.classList.toggle("labels-hidden", !state.atlasLabelsVisible);
  els.toggleLabelsBtn.textContent = state.atlasLabelsVisible ? "Hide labels" : "Show labels";

  els.atlasLegend.innerHTML = atlas.parts
    .map(
      (part) => `
        <button class="legend-btn ${state.atlasPartId === part.id ? "is-active" : ""}" type="button" data-atlas-part="${escapeHtml(part.id)}">
          ${escapeHtml(part.label)}
        </button>`
    )
    .join("");

  els.atlasStage.querySelectorAll(".diagram-part").forEach((node) => {
    node.classList.toggle("is-active", node.dataset.part === state.atlasPartId);
  });

  const activePart = atlas.parts.find((part) => part.id === state.atlasPartId) || atlas.parts[0];
  els.atlasFocusCard.innerHTML = `
    <h4>${escapeHtml(activePart.label)}</h4>
    <p>${escapeHtml(activePart.description)}</p>
    <div class="chip-cluster">
      ${atlas.checks.map((check) => `<span class="chip chip-soft">${escapeHtml(check)}</span>`).join("")}
    </div>`;

  els.atlasFigureGallery.innerHTML = figures.length
    ? `
      <h5>Teaching library figures</h5>
      ${figures.map((figure) => `
        <figure class="figure-card">
          <img src="${escapeHtml(figure.src)}" alt="${escapeHtml(figure.title)}" loading="lazy" />
          <figcaption>
            <strong>${escapeHtml(figure.title)}</strong>
            <span>${escapeHtml(figure.caption)}</span>
          </figcaption>
        </figure>`).join("")}`
    : `<p class="empty-state">No bundled teaching-library figures are attached to this system yet.</p>`;
}

function renderScaffolds() {
  const focusSystem = currentFocusSystem();
  const systemItems = window.STUDY_DATA.scaffolds.systems[focusSystem] || [];
  const supportBundle = supportBundleFor(focusSystem);

  els.masterScaffoldList.innerHTML = window.STUDY_DATA.scaffolds.master
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  els.systemScaffoldHeading.textContent = `${focusSystem} cues`;
  els.systemScaffoldList.innerHTML = systemItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  els.scaffoldCoach.innerHTML = renderBulletList([
    "Call out the body system before you commit to an exact structure.",
    `Use the ${focusSystem} cue list to name flow, tissue clue, or supporting landmark.`,
    "If you are stuck, say the look-alike structure and the one clue that separates them."
  ]);

  els.scaffoldLadder.innerHTML = Object.entries(window.STUDY_SUPPORT.levels)
    .map(([levelKey, levelData]) => `
      <article class="ladder-card ${scaffoldLevelFor(focusSystem) === levelKey ? "is-active" : ""}">
        <div class="note-head">
          <span class="status-chip ${levelKey}">${escapeHtml(levelData.label)}</span>
          <span>${escapeHtml(focusSystem)}</span>
        </div>
        <p>${escapeHtml(levelData.summary)}</p>
        <ul class="bullet-list">
          ${scaffoldListsForLevel(supportBundle, levelKey).warmups.slice(0, 2).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          ${scaffoldListsForLevel(supportBundle, levelKey).challenge.slice(0, 1).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </article>`)
    .join("");
}

function renderSidebar() {
  const focusSystem = currentFocusSystem();
  const supportLevel = scaffoldLevelFor(focusSystem);
  const supportData = scaffoldLevelData(supportLevel);

  els.sessionPulse.innerHTML = `
    <div class="pulse-grid">
      ${miniStat("Deck", QUIZ_MODES[state.quizMode])}
      ${miniStat("Focus", state.selectedSystem === ALL_SYSTEMS ? "Mixed" : state.selectedSystem)}
      ${miniStat("Scaffold", supportData.label)}
      ${miniStat("Answered", `${state.session.answered}`)}
      ${miniStat("Hard", `${state.session.hard}`)}
    </div>
    <p class="mini-copy">${escapeHtml(state.message)}</p>`;

  els.systemConfidence.innerHTML = sortedSystemSummaries()
    .map((summary) => {
      const percent = summary.studied ? summary.confidence : 4;
      return `
        <div class="confidence-row">
          <div class="confidence-head">
            <strong>${escapeHtml(summary.system)}</strong>
            <span>${summary.confidence}%</span>
          </div>
          <div class="confidence-track"><span style="width:${percent}%"></span></div>
          <p>${summary.studied}/${summary.total} cards practiced</p>
        </div>`;
    })
    .join("");

  const recent = recentNotes().slice(0, 5);
  els.recentNotes.innerHTML = recent.length
    ? recent
        .map(
          (item) => `
            <article class="note-card">
              <div class="note-head">
                <span class="status-chip ${item.record.lastOutcome}">${escapeHtml(item.record.lastOutcome || "new")}</span>
                <span>${escapeHtml(timeAgo(item.record.lastSeen))}</span>
              </div>
              <h4>${escapeHtml(shortText(item.card.prompt, 82))}</h4>
              <p>${escapeHtml(item.card.system)}</p>
            </article>`
        )
        .join("")
    : `<p class="empty-state">Once you score a few cards, your recent attempts will land here.</p>`;
}

function currentCard() {
  return questionById(state.currentCardId);
}

function currentQuickItem() {
  return quickItemById(state.quickQueue[state.quickCursor]);
}

function quickItemById(itemId) {
  return (window.STUDY_DATA.quickRollItems || []).find((item) => item.id === itemId) || null;
}

function quickPool(system) {
  let items = [...(window.STUDY_DATA.quickRollItems || [])];
  if (system !== ALL_SYSTEMS) {
    items = filterQuickItemsBySystem(items, system);
  }
  if (state.quickSection !== ALL_SECTIONS) {
    items = items.filter((item) => item.section === state.quickSection);
  }
  if (state.quickMode === "histology") {
    items = items.filter((item) => item.category === "histology");
  }
  return items;
}

function filterQuickItemsBySystem(items, system) {
  if (system === ALL_SYSTEMS) {
    return items;
  }
  return system === "Histology"
    ? items.filter((item) => item.category === "histology")
    : items.filter((item) => item.system === system);
}

function promptKindForQuickItem(item) {
  if (state.quickMode !== "mixed") {
    return state.quickMode;
  }
  if (item.category === "histology") {
    const histologyCycle = ["multiple-choice", "true-false", "histology", "station"];
    return histologyCycle[state.quickCursor % histologyCycle.length];
  }
  const cycle = state.quickCursor % 6;
  return ["multiple-choice", "true-false", "station", "identify", "spelling", "visual"][cycle];
}

function promptForQuickItem(item, promptKind, choiceState = null) {
  switch (promptKind) {
    case "multiple-choice":
      return `Choose the exact guide term for this clue: ${item.visual}`;
    case "true-false":
      return choiceState
        ? choiceState.statement
        : `True or false: this clue belongs with the hidden guide term: ${item.visual}`;
    case "spelling":
      return `Spell the exact guide term for this clue: ${item.visual}`;
    case "visual":
      return `Use the visual cue to name the hidden guide term: ${item.visual}`;
    case "histology":
      return `Slide drill: identify the structure or tissue from this clue: ${item.visual}`;
    case "station":
      return `Station practical: name the exact structure, then say one look-alike trap. Clue: ${item.visual}`;
    case "identify":
    default:
      return `Identify the guide term: ${item.visual}`;
  }
}

function promptLabel(promptKind) {
  const labels = {
    "multiple-choice": "multiple choice",
    "true-false": "true / false",
    spelling: "spelling",
    identify: "identify",
    visual: "visual cue",
    histology: "histology",
    station: "station practical"
  };
  return labels[promptKind] || promptKind;
}

function isChoicePrompt(promptKind) {
  return promptKind === "multiple-choice" || promptKind === "true-false";
}

function quickChoiceState(item, promptKind) {
  if (promptKind === "multiple-choice") {
    const distractors = quickDistractors(item, 3);
    const choices = stableQuickShuffle([
      {
        label: item.term,
        value: item.id,
        correct: true
      },
      ...distractors.map((distractor) => ({
        label: distractor.term,
        value: distractor.id,
        correct: false
      }))
    ], `${item.id}:${state.quickCursor}:mc`);

    return {
      kind: "multiple-choice",
      choices,
      correctValue: item.id,
      feedback: `Answer: ${answerTextForQuickItem(item)}`
    };
  }

  if (promptKind === "true-false") {
    const falseItem = quickDistractors(item, 1)[0];
    const isTrueStatement = !falseItem || stableHash(`${item.id}:${state.quickCursor}:tf`) % 2 === 0;
    const displayedItem = isTrueStatement ? item : falseItem;
    return {
      kind: "true-false",
      statement: `True or false: ${displayedItem.term} matches this clue: ${item.visual}`,
      choices: [
        {
          label: "True",
          value: "true",
          correct: isTrueStatement
        },
        {
          label: "False",
          value: "false",
          correct: !isTrueStatement
        }
      ],
      correctValue: isTrueStatement ? "true" : "false",
      feedback: isTrueStatement
        ? `True. ${answerTextForQuickItem(item)} matches that clue.`
        : `False. The clue points to ${answerTextForQuickItem(item)}, not ${displayedItem.term}.`
    };
  }

  return null;
}

function renderQuickChoiceShell(item, promptKind, choiceState) {
  if (!isChoicePrompt(promptKind) || !choiceState) {
    const stationCopy = promptKind === "station"
      ? "Name the structure, name the source station, then name the nearest look-alike before you reveal."
      : "Say the spelling out loud, picture the structure, then reveal when ready.";
    return `
      <div class="quick-think-card">
        <span>Think it first</span>
        <p>${escapeHtml(stationCopy)}</p>
      </div>`;
  }

  const selected = state.quickSelection;
  const choices = choiceState.choices.map((choice) => {
    const isSelected = selected === choice.value;
    const isResolved = state.quickRevealed;
    const stateClass = [
      isSelected ? "is-selected" : "",
      isResolved && choice.correct ? "is-correct" : "",
      isResolved && isSelected && !choice.correct ? "is-incorrect" : ""
    ].filter(Boolean).join(" ");
    return `
      <button class="choice-btn ${stateClass}" type="button" data-quick-choice="${escapeHtml(choice.value)}" data-quick-correct="${choice.correct ? "true" : "false"}" ${state.quickRevealed || state.quickScored ? "disabled" : ""}>
        <span>${escapeHtml(choice.label)}</span>
      </button>`;
  }).join("");

  const feedbackText = !selected
    ? choiceState.feedback
    : `${selected === choiceState.correctValue ? "Correct." : "Review."} ${choiceState.feedback}`;
  const feedback = state.quickRevealed
    ? `<p class="choice-feedback">${escapeHtml(feedbackText)}</p>`
    : `<p class="choice-feedback is-muted">Answer stays hidden until you pick or reveal.</p>`;

  return `
    <div class="choice-grid" role="list">
      ${choices}
    </div>
    ${feedback}`;
}

function answerTextForQuickItem(item) {
  return item.aliases.length
    ? `${item.term} (${item.aliases.join("; ")})`
    : item.term;
}

function quickDistractors(item, count) {
  const itemTerms = new Set([item.term, ...item.aliases].map(normalizeAnswerText));
  const candidates = (window.STUDY_DATA.quickRollItems || [])
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => !itemTerms.has(normalizeAnswerText(candidate.term)))
    .map((candidate) => ({
      candidate,
      score:
        (candidate.system === item.system ? 0 : 8) +
        (candidate.category === item.category ? 0 : 4) +
        (candidate.section === item.section ? 0 : 2) +
        (stableHash(`${item.id}:${candidate.id}`) % 2)
    }))
    .sort((a, b) => a.score - b.score || a.candidate.term.localeCompare(b.candidate.term));

  return candidates.slice(0, count).map((entry) => entry.candidate);
}

function normalizeAnswerText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function questionById(cardId) {
  return window.STUDY_DATA.questions.find((card) => card.id === cardId) || null;
}

function questionPool(system) {
  if (system === ALL_SYSTEMS) {
    return [...window.STUDY_DATA.questions];
  }
  return window.STUDY_DATA.questions.filter((card) => card.system === system);
}

function glossaryPool(system) {
  const systems = system === ALL_SYSTEMS ? window.STUDY_DATA.systems : [system];
  return systems.flatMap((itemSystem) =>
    (window.STUDY_DATA.glossary[itemSystem] || []).map((item) => ({
      ...item,
      system: itemSystem
    }))
  );
}

function ensureRecord(cardId) {
  if (!state.progress[cardId]) {
    state.progress[cardId] = {
      attempts: 0,
      easy: 0,
      shaky: 0,
      hard: 0,
      favorite: false,
      lastOutcome: "",
      lastSeen: 0,
      streak: 0
    };
  }
  return state.progress[cardId];
}

function readRecord(cardId) {
  return {
    attempts: 0,
    easy: 0,
    shaky: 0,
    hard: 0,
    favorite: false,
    lastOutcome: "",
    lastSeen: 0,
    streak: 0,
    ...state.progress[cardId]
  };
}

function quickRecordId(itemId) {
  return `${QUICK_RECORD_PREFIX}${itemId}`;
}

function ensureQuickRecord(itemId) {
  return ensureRecord(quickRecordId(itemId));
}

function readQuickRecord(itemId) {
  return readRecord(quickRecordId(itemId));
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveProgress() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  } catch (error) {
    void error;
  }
}

function createSession() {
  return {
    built: 0,
    answered: 0,
    easy: 0,
    shaky: 0,
    hard: 0,
    requeued: {}
  };
}

function sortedSystemSummaries() {
  return window.STUDY_DATA.systems
    .map((system) => systemSummary(system))
    .sort((a, b) => {
      const aScore = a.confidence + (a.studied / a.total) * 100;
      const bScore = b.confidence + (b.studied / b.total) * 100;
      return aScore - bScore;
    });
}

function systemSummary(system) {
  const cards = questionPool(system);
  const studiedCards = cards.filter((card) => readRecord(card.id).attempts);
  const confidence = studiedCards.length
    ? Math.round(studiedCards.reduce((sum, card) => sum + cardConfidence(card.id), 0) / studiedCards.length)
    : 0;
  const hard = cards.filter((card) => {
    const record = readRecord(card.id);
    return record.hard > record.easy;
  }).length;

  return {
    system,
    total: cards.length,
    studied: studiedCards.length,
    confidence,
    hard
  };
}

function weakCards(system) {
  return questionPool(system)
    .filter((card) => readRecord(card.id).attempts)
    .sort((a, b) => {
      const aRecord = readRecord(a.id);
      const bRecord = readRecord(b.id);
      return (cardConfidence(a.id) + aRecord.easy * 5) - (cardConfidence(b.id) + bRecord.easy * 5);
    });
}

function favoriteCards(system) {
  return questionPool(system).filter((card) => readRecord(card.id).favorite);
}

function weakQuickItems(system) {
  return filterQuickItemsBySystem([...(window.STUDY_DATA.quickRollItems || [])], system)
    .filter((item) => {
      const record = readQuickRecord(item.id);
      return record.attempts && (record.lastOutcome !== "easy" || quickConfidence(item.id) < 80);
    })
    .sort((a, b) => {
      const aRecord = readQuickRecord(a.id);
      const bRecord = readQuickRecord(b.id);
      return (quickConfidence(a.id) + aRecord.easy * 5) - (quickConfidence(b.id) + bRecord.easy * 5);
    });
}

function recentWins(system) {
  return questionPool(system)
    .filter((card) => {
      const record = readRecord(card.id);
      return record.lastOutcome === "easy" && record.streak >= 1;
    })
    .sort((a, b) => readRecord(b.id).lastSeen - readRecord(a.id).lastSeen);
}

function recentNotes() {
  return Object.entries(state.progress)
    .filter(([, record]) => record.lastSeen)
    .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
    .map(([cardId, record]) => ({
      card: questionById(cardId),
      record
    }))
    .filter((item) => item.card);
}

function cardPriority(card) {
  const record = readRecord(card.id);
  if (!record.attempts) {
    return 220 + Math.random() * 20;
  }
  const hoursSince = record.lastSeen ? Math.min(168, (Date.now() - record.lastSeen) / 3600000) : 72;
  return record.hard * 20 + record.shaky * 12 - record.easy * 6 + hoursSince + (100 - cardConfidence(card.id));
}

function cardConfidence(cardId) {
  const record = readRecord(cardId);
  if (!record.attempts) {
    return 0;
  }
  return Math.round(((record.easy + record.shaky * 0.55) / record.attempts) * 100);
}

function quickConfidence(itemId) {
  const record = readQuickRecord(itemId);
  if (!record.attempts) {
    return 0;
  }
  return Math.round(((record.easy + record.shaky * 0.55) / record.attempts) * 100);
}

function currentFocusSystem() {
  return state.selectedSystem === ALL_SYSTEMS ? state.atlasSystem : state.selectedSystem;
}

function syncAtlasPart() {
  const atlas = window.STUDY_DATA.atlas[state.atlasSystem];
  if (!atlas) {
    return;
  }
  const currentExists = atlas.parts.some((part) => part.id === state.atlasPartId);
  if (!currentExists) {
    state.atlasPartId = atlas.parts[0].id;
  }
}

function supportBundleFor(system) {
  const support = window.STUDY_SUPPORT && window.STUDY_SUPPORT.systems
    ? window.STUDY_SUPPORT.systems[system]
    : null;

  if (support) {
    return support;
  }

  return {
    warmups: window.STUDY_DATA.scaffolds.master.slice(0, 3),
    anchors: window.STUDY_DATA.scaffolds.systems[system] || [],
    traps: ["Name the body system before you name the exact structure."],
    mechanism: ["Tie the visible clue to the structure's job before locking in the answer."],
    challenge: ["Contrast the answer with its nearest look-alike."]
  };
}

function figuresForSystem(system) {
  return window.STUDY_SUPPORT && window.STUDY_SUPPORT.figures && window.STUDY_SUPPORT.figures[system]
    ? window.STUDY_SUPPORT.figures[system]
    : [];
}

function scaffoldLevelData(level) {
  return window.STUDY_SUPPORT.levels[level] || window.STUDY_SUPPORT.levels.moderate;
}

function scaffoldLevelFor(system) {
  const summary = systemSummary(system);
  const recentRatio = recentScoreRatio(system, 6);

  if (summary.studied < 3 || recentRatio === null) {
    return "moderate";
  }

  if (summary.confidence < 40 || recentRatio < 0.45) {
    return "heavy";
  }
  if (summary.confidence < 60 || recentRatio < 0.62) {
    return "moderate";
  }
  if (summary.confidence < 82 || recentRatio < 0.82) {
    return "light";
  }
  return "challenge";
}

function scaffoldListsForLevel(bundle, level) {
  const warmups = bundle.warmups || [];
  const anchors = bundle.anchors || [];
  const traps = bundle.traps || [];
  const mechanism = bundle.mechanism || [];
  const challenge = bundle.challenge || [];

  switch (level) {
    case "heavy":
      return {
        warmups: warmups.slice(0, 3),
        anchors: anchors.slice(0, 2),
        traps: traps.slice(0, 2),
        challenge: mechanism.slice(0, 2)
      };
    case "light":
      return {
        warmups: warmups.slice(0, 1),
        anchors: anchors.slice(0, 3),
        traps: traps.slice(0, 1),
        challenge: [...mechanism.slice(0, 1), ...challenge.slice(0, 2)]
      };
    case "challenge":
      return {
        warmups: warmups.slice(0, 1),
        anchors: anchors.slice(0, 2),
        traps: traps.slice(0, 1),
        challenge: [...challenge.slice(0, 2), ...mechanism.slice(0, 2)]
      };
    default:
      return {
        warmups: warmups.slice(0, 2),
        anchors: anchors.slice(0, 3),
        traps: traps.slice(0, 2),
        challenge: [...mechanism.slice(0, 1), ...challenge.slice(0, 1)]
      };
  }
}

function recentScoreRatio(system, count) {
  const recent = questionPool(system)
    .map((card) => ({
      card,
      record: readRecord(card.id)
    }))
    .filter((item) => item.record.lastSeen)
    .sort((a, b) => b.record.lastSeen - a.record.lastSeen)
    .slice(0, count);

  if (!recent.length) {
    return null;
  }

  const total = recent.reduce((sum, item) => sum + ({
    easy: 1,
    shaky: 0.6,
    hard: 0.2
  }[item.record.lastOutcome] || 0.4), 0);

  return total / recent.length;
}

function renderReviewGroup(cards, emptyText) {
  if (!cards.length) {
    return `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  }

  return cards
    .map((card) => {
      const record = readRecord(card.id);
      return `
        <article class="review-card">
          <div class="note-head">
            <span class="status-chip ${record.lastOutcome || "new"}">${escapeHtml(record.lastOutcome || "new")}</span>
            <span>${cardConfidence(card.id)}% confidence</span>
          </div>
          <h4>${escapeHtml(shortText(card.prompt, 92))}</h4>
          <p>${escapeHtml(card.system)}</p>
          <button class="mini-btn" type="button" data-action="study-card" data-card-id="${escapeHtml(card.id)}">Study card</button>
        </article>`;
    })
    .join("");
}

function renderGuideReviewGroup(items, emptyText) {
  if (!items.length) {
    return `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
  }

  return items
    .map((item) => {
      const record = readQuickRecord(item.id);
      return `
        <article class="review-card">
          <div class="note-head">
            <span class="status-chip ${record.lastOutcome || "new"}">${escapeHtml(record.lastOutcome || "new")}</span>
            <span>${quickConfidence(item.id)}% guide confidence</span>
          </div>
          <h4>${escapeHtml(item.term)}</h4>
          <p>${escapeHtml(shortText(item.visual, 92))}</p>
        </article>`;
    })
    .join("");
}

function renderQueueCard(cardId, isCurrent) {
  const card = questionById(cardId);
  if (!card) {
    return "";
  }
  return `
    <article class="queue-card ${isCurrent ? "is-current" : ""}">
      <div class="note-head">
        <span class="status-chip ${isCurrent ? "current" : "queued"}">${isCurrent ? "Now" : "Next"}</span>
        <span>${escapeHtml(card.system)}</span>
      </div>
      <h4>${escapeHtml(shortText(card.prompt, 72))}</h4>
      <p>${cardStatusLabel(card.id)}</p>
    </article>`;
}

function renderQuickQueueCard(item, isCurrent) {
  return `
    <article class="queue-card ${isCurrent ? "is-current" : ""}">
      <div class="note-head">
        <span class="status-chip ${isCurrent ? "current" : "queued"}">${isCurrent ? "Now" : "Next"}</span>
        <span>${escapeHtml(item.system)}</span>
      </div>
      <h4>${escapeHtml(shortText(item.visual, 82))}</h4>
      <p>${escapeHtml(item.section)} - ${escapeHtml(item.category)} - ${escapeHtml(quickStatusLabel(item.id))}</p>
    </article>`;
}

function renderBulletList(items) {
  return `<ul class="bullet-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function metricPill(label, value) {
  return `<div class="metric-pill"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function kpiCard(label, value, detail) {
  return `
    <article class="kpi-card">
      <p>${escapeHtml(label)}</p>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(detail)}</span>
    </article>`;
}

function miniStat(label, value) {
  return `
    <div class="mini-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>`;
}

function cardStatusLabel(cardId) {
  const record = readRecord(cardId);
  if (!record.attempts) {
    return "New card";
  }
  if (record.favorite) {
    return `${cardConfidence(cardId)}% confidence · saved`;
  }
  return `${cardConfidence(cardId)}% confidence`;
}

function quickStatusLabel(itemId) {
  const record = readQuickRecord(itemId);
  if (!record.attempts) {
    return "New guide card";
  }
  return `${quickConfidence(itemId)}% guide confidence`;
}

function shortText(text, maxLength) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trim()}...`;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function stableQuickShuffle(items, seed) {
  return [...items].sort((a, b) =>
    stableHash(`${seed}:${a.value}`) - stableHash(`${seed}:${b.value}`)
  );
}

function stableHash(text) {
  let hash = 2166136261;
  String(text).split("").forEach((character) => {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function timeAgo(timestamp) {
  if (!timestamp) {
    return "new";
  }
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 1) {
    return "just now";
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function isView(view) {
  return ["quick", "dashboard", "quiz", "review", "glossary", "atlas", "scaffolds"].includes(view);
}

function byId(id) {
  return document.getElementById(id);
}

function emitV2TeachingSignal(action, sourceId, detail = {}) {
  if (!sourceId || !window.LabExamTeachingV2 || typeof window.LabExamTeachingV2.record !== "function") {
    return null;
  }
  return window.LabExamTeachingV2.record(action, sourceId, detail);
}

function emitV2TeachingScore(sourceId, outcome, detail = {}) {
  if (!sourceId || !window.LabExamTeachingV2 || typeof window.LabExamTeachingV2.score !== "function") {
    return null;
  }
  return window.LabExamTeachingV2.score(sourceId, outcome, detail);
}
