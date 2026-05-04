window.STUDY_DATA = {
  systems: [
    "Respiratory",
    "Digestive",
    "Urinary",
    "Endocrine",
    "Reproductive",
    "Fetal Pig",
    "Histology"
  ],
  systemMeta: {
    Respiratory: {
      cue: "Trace the route of air, then separate cartilage landmarks from the airway opening.",
      atlasPrompt: "Name the passage, then say what comes immediately before and after it."
    },
    Digestive: {
      cue: "Follow the tube, then use obvious accessory organs and tissue clues to anchor location.",
      atlasPrompt: "Move from oral cavity to rectum and call out what each organ adds to digestion."
    },
    Urinary: {
      cue: "Keep filtration structures separate from urine-drainage structures.",
      atlasPrompt: "Trace urine flow out loud from the cortex to the exit."
    },
    Endocrine: {
      cue: "Focus on gland location and the architecture that makes each slide or organ recognizable.",
      atlasPrompt: "Pair each gland with the shape clue that gives it away fastest."
    },
    Reproductive: {
      cue: "Split male and female pathways cleanly, then map ducts, glands, and gonads.",
      atlasPrompt: "Say what leaves each structure next: gamete, fluid, or both."
    },
    "Fetal Pig": {
      cue: "Map pig structures onto the human system you already know, then watch for pig-specific twists.",
      atlasPrompt: "Use the pig plate as a comparison board, not a one-to-one human diagram."
    },
    Histology: {
      cue: "Identify the organ first, then the epithelium, then the clue that confirms it.",
      atlasPrompt: "Treat the slide board like a visual memory wall for classic tissue giveaways."
    }
  },
  questions: [],
  glossary: {},
  scaffolds: {
    master: [
      "What am I looking at?",
      "What body system am I in?",
      "Is this gross anatomy, histology, a model, or fetal pig?",
      "What landmark proves my location?",
      "What exact structure is being pointed to?",
      "What is it connected to or continuous with?",
      "What does it do?",
      "What is the easiest thing to confuse it with?",
      "What single clue separates those two?"
    ],
    systems: {
      "Respiratory": [
        "Upper airway or lower airway?",
        "Conducting zone or gas exchange zone?",
        "Which branch level am I at?",
        "What epithelium/cartilage clue confirms the tissue?"
      ],
      "Digestive": [
        "Where is this in the food pathway?",
        "Is this GI tube or accessory organ?",
        "What comes before and after it?",
        "What tissue clue proves the region?"
      ],
      "Urinary": [
        "Is this a blood structure or urine drainage structure?",
        "Am I in gross kidney anatomy or nephron anatomy?",
        "What comes before and after this in filtration or urine flow?",
        "What clue tells me cortex versus medulla?"
      ],
      "Endocrine": [
        "Where is the gland located in the body?",
        "What secretory architecture stands out?",
        "Is this a lobe, follicle-based gland, or layered gland?"
      ],
      "Reproductive": [
        "Male or female anatomy?",
        "Is this a gonad, duct, gland, or external structure?",
        "If gametes were here, where do they go next?",
        "What histology clue anchors the ID?"
      ],
      "Fetal Pig": [
        "What human system does this pig structure map onto?",
        "Where would material flow next?",
        "What is the easiest nearby look-alike structure?"
      ],
      "Histology": [
        "What organ or tissue is this?",
        "What epithelium do I see?",
        "What supporting structure confirms it?",
        "What is the most likely confusion trap?"
      ]
    }
  },
  atlas: {}
};
