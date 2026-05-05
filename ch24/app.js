(function () {
  "use strict";

  const moduleData = window.CH24_QUIZ;
  const STORAGE_KEY = "luminara.ch24.practice.v2";
  const letters = ["A", "B", "C", "D", "E", "F"];

  const els = {
    savedStatus: document.getElementById("savedStatus"),
    deckSummary: document.getElementById("deckSummary"),
    scoreText: document.getElementById("scoreText"),
    scoreMeter: document.getElementById("scoreMeter"),
    visibleCount: document.getElementById("visibleCount"),
    questionList: document.getElementById("questionList"),
    resetButton: document.getElementById("resetButton"),
    hideAnswersButton: document.getElementById("hideAnswersButton"),
    reviewList: document.getElementById("reviewList")
  };

  const state = {
    filter: "all",
    progress: loadProgress()
  };

  function loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    els.savedStatus.textContent = "Saved";
    window.setTimeout(() => {
      els.savedStatus.textContent = "Ready";
    }, 700);
  }

  function getRecord(cardId) {
    return state.progress[cardId] || {};
  }

  function setRecord(cardId, patch) {
    state.progress[cardId] = {
      ...getRecord(cardId),
      ...patch,
      lastSeenAt: new Date().toISOString()
    };
    saveProgress();
  }

  function cardMatchesFilter(card) {
    if (state.filter === "all") return true;
    if (state.filter === "review") return getRecord(card.id).review === true;
    return card.kind === state.filter;
  }

  function render() {
    const anchor = getRenderAnchor();
    const cards = moduleData.cards.filter(cardMatchesFilter);

    renderFilterButtons();
    renderQuestions(cards);
    renderScore();
    renderReviewQueue();

    els.deckSummary.textContent = `${moduleData.cards.length} text-only questions`;
    els.visibleCount.textContent = `${cards.length} shown`;
    restoreRenderAnchor(anchor);
  }

  function getRenderAnchor() {
    const activeElement = document.activeElement;
    const questionNode = activeElement?.closest?.("[data-question-id]");

    if (!questionNode) return null;

    return {
      id: questionNode.dataset.questionId,
      top: questionNode.getBoundingClientRect().top
    };
  }

  function restoreRenderAnchor(anchor) {
    if (!anchor) return;

    window.requestAnimationFrame(() => {
      const questionNode = document.querySelector(`[data-question-id="${anchor.id}"]`);
      if (!questionNode) return;

      const delta = questionNode.getBoundingClientRect().top - anchor.top;
      if (Math.abs(delta) > 1) {
        window.scrollBy(0, delta);
      }
    });
  }

  function renderFilterButtons() {
    document.querySelectorAll(".mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === state.filter);
    });
  }

  function renderQuestions(cards) {
    clearElement(els.questionList);

    if (!cards.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = state.filter === "review" ? "No questions are marked for review." : "No questions match this filter.";
      els.questionList.appendChild(empty);
      return;
    }

    cards.forEach((card) => {
      els.questionList.appendChild(renderQuestionCard(card));
    });
  }

  function renderQuestionCard(card) {
    const record = getRecord(card.id);
    const revealed = record.revealed === true;
    const article = document.createElement("article");
    const header = document.createElement("div");
    const source = document.createElement("span");
    const kind = document.createElement("span");
    const prompt = document.createElement("h3");
    const body = document.createElement("div");
    const actions = document.createElement("div");
    const revealButton = document.createElement("button");
    const reviewButton = document.createElement("button");

    article.className = "question-card";
    article.dataset.questionId = card.id;
    header.className = "question-meta";
    source.textContent = card.source;
    kind.textContent = kindLabel(card.kind);
    prompt.textContent = card.prompt;
    body.className = "question-body";
    actions.className = "action-row";

    header.append(source, kind);
    article.append(header, prompt, body);

    if (card.kind === "matching") {
      body.appendChild(renderMatching(card, record, revealed));
    } else if (card.kind === "written") {
      body.appendChild(renderWrittenIntro());
    } else {
      body.appendChild(renderChoices(card, record, revealed));
    }

    revealButton.type = "button";
    revealButton.className = "primary-button";
    revealButton.textContent = revealed ? "Hide" : "Reveal";
    revealButton.addEventListener("click", () => toggleReveal(card));

    reviewButton.type = "button";
    reviewButton.className = getRecord(card.id).review === true ? "review-button" : "secondary-button";
    reviewButton.textContent = getRecord(card.id).review === true ? "In review" : "Mark review";
    reviewButton.addEventListener("click", () => toggleReview(card.id));

    actions.append(revealButton, reviewButton);

    if (card.kind === "written") {
      const gotItButton = document.createElement("button");
      gotItButton.type = "button";
      gotItButton.className = "success-button";
      gotItButton.textContent = "Got it";
      gotItButton.addEventListener("click", () => markOutcome(card.id, "correct"));
      actions.appendChild(gotItButton);
    }

    article.appendChild(actions);

    if (revealed) {
      article.appendChild(renderAnswer(card));
    }

    return article;
  }

  function renderChoices(card, record, revealed) {
    const list = document.createElement("div");
    list.className = "choice-list";

    card.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      const letter = document.createElement("span");
      const label = document.createElement("span");

      button.type = "button";
      button.className = "choice-button";
      letter.className = "choice-letter";
      letter.textContent = letters[index] || String(index + 1);
      label.textContent = choice;

      if (record.choiceIndex === index) button.classList.add("selected");
      if (revealed && index === card.answerIndex) button.classList.add("correct");
      if (revealed && record.choiceIndex === index && index !== card.answerIndex) button.classList.add("incorrect");

      button.addEventListener("click", () => chooseAnswer(card, index));
      button.append(letter, label);
      list.appendChild(button);
    });

    return list;
  }

  function renderMatching(card, record, revealed) {
    const selections = record.matchSelections || {};
    const wrap = document.createElement("div");
    wrap.className = "matching-list";

    card.pairs.forEach((pair, rowIndex) => {
      const row = document.createElement("div");
      const statement = document.createElement("p");
      const select = document.createElement("select");
      const placeholder = document.createElement("option");

      row.className = "matching-row";
      statement.textContent = pair.prompt;
      placeholder.value = "";
      placeholder.textContent = "Choose...";
      select.appendChild(placeholder);

      card.choices.forEach((choice, choiceIndex) => {
        const option = document.createElement("option");
        option.value = String(choiceIndex);
        option.textContent = choice;
        select.appendChild(option);
      });

      if (typeof selections[rowIndex] === "number") {
        select.value = String(selections[rowIndex]);
      }

      if (revealed) {
        row.classList.add(selections[rowIndex] === pair.answerIndex ? "correct" : "incorrect");
      }

      select.addEventListener("change", () => chooseMatch(card, rowIndex, select.value));
      row.append(statement, select);
      wrap.appendChild(row);
    });

    return wrap;
  }

  function renderWrittenIntro() {
    const panel = document.createElement("div");
    const text = document.createElement("p");
    panel.className = "written-panel";
    text.textContent = "Think through the answer, then reveal the sample points.";
    panel.appendChild(text);
    return panel;
  }

  function renderAnswer(card) {
    const panel = document.createElement("div");
    const label = document.createElement("p");
    const answer = document.createElement("div");
    const explanation = document.createElement("p");

    panel.className = "answer-panel";
    label.className = "answer-label";
    label.textContent = "Answer";
    explanation.className = "explanation";
    explanation.textContent = card.explanation || "";

    if (card.kind === "written") {
      answer.appendChild(renderList(card.sampleAnswer));
    } else if (card.kind === "matching") {
      const points = card.pairs.map((pair) => `${pair.prompt} ${card.choices[pair.answerIndex]}.`);
      answer.appendChild(renderList(points));
    } else {
      const strong = document.createElement("strong");
      strong.textContent = card.choices[card.answerIndex];
      answer.appendChild(strong);
    }

    panel.append(label, answer, explanation);
    return panel;
  }

  function renderList(points) {
    const list = document.createElement("ul");
    points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      list.appendChild(item);
    });
    return list;
  }

  function chooseAnswer(card, index) {
    const correct = index === card.answerIndex;
    setRecord(card.id, {
      choiceIndex: index,
      revealed: true,
      outcome: correct ? "correct" : "incorrect",
      review: !correct
    });
    render();
  }

  function chooseMatch(card, rowIndex, value) {
    const selectedIndex = value === "" ? null : Number.parseInt(value, 10);
    const selections = { ...(getRecord(card.id).matchSelections || {}) };

    if (Number.isInteger(selectedIndex)) {
      selections[rowIndex] = selectedIndex;
    } else {
      delete selections[rowIndex];
    }

    const outcome = getMatchingOutcome(card, selections);
    setRecord(card.id, {
      matchSelections: selections,
      outcome: outcome || "",
      review: outcome ? outcome !== "correct" : getRecord(card.id).review === true
    });
    render();
  }

  function toggleReveal(card) {
    const record = getRecord(card.id);
    const patch = { revealed: record.revealed !== true };

    if (card.kind === "matching" && patch.revealed) {
      const outcome = getMatchingOutcome(card, record.matchSelections || {});
      if (outcome) {
        patch.outcome = outcome;
        patch.review = outcome !== "correct";
      }
    }

    setRecord(card.id, patch);
    render();
  }

  function getMatchingOutcome(card, selections) {
    const answered = card.pairs.filter((_, index) => typeof selections[index] === "number").length;
    if (answered !== card.pairs.length) return "";
    return card.pairs.every((pair, index) => selections[index] === pair.answerIndex) ? "correct" : "incorrect";
  }

  function toggleReview(cardId) {
    setRecord(cardId, { review: getRecord(cardId).review !== true });
    render();
  }

  function markOutcome(cardId, outcome) {
    setRecord(cardId, {
      revealed: true,
      outcome,
      review: outcome !== "correct"
    });
    render();
  }

  function hideAllAnswers() {
    Object.keys(state.progress).forEach((cardId) => {
      state.progress[cardId] = {
        ...state.progress[cardId],
        revealed: false
      };
    });
    saveProgress();
    render();
  }

  function resetProgress() {
    state.progress = {};
    localStorage.removeItem(STORAGE_KEY);
    els.savedStatus.textContent = "Reset";
    render();
  }

  function renderScore() {
    let attempted = 0;
    let correct = 0;

    moduleData.cards.forEach((card) => {
      const outcome = getRecord(card.id).outcome;
      if (outcome === "correct" || outcome === "incorrect") attempted += 1;
      if (outcome === "correct") correct += 1;
    });

    const percentage = attempted ? Math.round((correct / attempted) * 100) : 0;
    els.scoreText.textContent = `${correct} / ${attempted}`;
    els.scoreMeter.style.width = `${percentage}%`;
  }

  function renderReviewQueue() {
    clearElement(els.reviewList);
    const reviewCards = moduleData.cards.filter((card) => getRecord(card.id).review === true);

    if (!reviewCards.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Nothing marked yet.";
      els.reviewList.appendChild(empty);
      return;
    }

    reviewCards.forEach((card) => {
      const button = document.createElement("button");
      const source = document.createElement("strong");
      const prompt = document.createElement("span");

      button.type = "button";
      button.className = "review-item";
      source.textContent = card.source;
      prompt.textContent = card.prompt;
      button.append(source, prompt);
      button.addEventListener("click", () => jumpToCard(card.id));
      els.reviewList.appendChild(button);
    });
  }

  function jumpToCard(cardId) {
    let node = document.querySelector(`[data-question-id="${cardId}"]`);

    if (!node) {
      state.filter = "all";
      render();
      node = document.querySelector(`[data-question-id="${cardId}"]`);
    }

    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearElement(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function kindLabel(kind) {
    const labels = {
      matching: "Matching",
      "multiple-choice": "Multiple choice",
      "true-false": "True/false",
      written: "Written"
    };
    return labels[kind] || "Practice";
  }

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });

  els.hideAnswersButton.addEventListener("click", hideAllAnswers);
  els.resetButton.addEventListener("click", resetProgress);

  render();
})();
