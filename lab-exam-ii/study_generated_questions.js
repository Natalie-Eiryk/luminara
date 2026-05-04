(function generateVocabularyQuestions() {
  const data = window.STUDY_DATA;

  if (!data || !Array.isArray(data.questions) || !data.glossary) {
    return;
  }

  const existingIds = new Set(data.questions.map((question) => question.id));

  for (const system of data.systems) {
    const glossaryItems = data.glossary[system] || [];

    for (const item of glossaryItems) {
      const question = {
        id: buildId(system, "vocab", item.term),
        system,
        tags: ["vocabulary", "generated", "definition"],
        prompt: `Which ${system} term matches this definition: ${item.definition}`,
        answer: `${item.term}. ${item.definition}`
      };

      pushQuestion(question);
    }

    let systemCount = data.questions.filter((question) => question.system === system).length;
    let extraIndex = 0;

    while (systemCount < 20 && glossaryItems.length > 0) {
      const item = glossaryItems[extraIndex % glossaryItems.length];
      const question = {
        id: buildId(system, `recall-${extraIndex + 1}`, item.term),
        system,
        tags: ["vocabulary", "generated", "recall"],
        prompt: `What does the ${system} term "${item.term}" refer to?`,
        answer: item.definition
      };

      pushQuestion(question);
      extraIndex += 1;
      systemCount = data.questions.filter((entry) => entry.system === system).length;
    }
  }

  function pushQuestion(question) {
    if (existingIds.has(question.id)) {
      return;
    }

    data.questions.push(question);
    existingIds.add(question.id);
  }

  function buildId(system, mode, term) {
    return `${slugify(system)}_${mode}_${slugify(term)}`;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
})();
