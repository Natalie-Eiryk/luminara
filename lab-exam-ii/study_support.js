window.STUDY_SUPPORT = {
  levels: {
    heavy: {
      label: "Heavy support",
      summary: "Slow down, rehearse the foundation, and use landmarks before naming the exact structure."
    },
    moderate: {
      label: "Moderate support",
      summary: "Use a short warmup, then name the clue that separates the target from its nearest look-alike."
    },
    light: {
      label: "Light support",
      summary: "Move quickly through anchor cues, then explain the why behind the answer."
    },
    challenge: {
      label: "Challenge mode",
      summary: "Skip the easy warmup and connect structure, function, and contrast in one pass."
    }
  },
  systems: {
    Respiratory: {
      warmups: [
        "Is this upper airway, lower airway, or gas-exchange surface?",
        "What comes immediately before and after this structure in the airflow pathway?",
        "What cartilage, epithelium, or lobe clue locks the ID?"
      ],
      anchors: [
        "Separate epiglottis from glottis before committing to the answer.",
        "If it branches, name the branch level out loud: primary, secondary, then tertiary.",
        "On slides, decide trachea versus lung before naming any smaller detail."
      ],
      traps: [
        "Students often confuse the airway opening with the flap covering it.",
        "Students over-call bronchioles when the image still shows larger bronchial support tissue."
      ],
      mechanism: [
        "Ask what this structure contributes to conduction, protection, or gas exchange.",
        "Tie the tissue type to its job: thin for exchange, thicker/ciliated for transport and cleanup."
      ],
      challenge: [
        "Trace airflow from nasal cavity to alveoli without pausing.",
        "Contrast a trachea slide with a lung slide in one sentence."
      ]
    },
    Digestive: {
      warmups: [
        "Is this GI tube or accessory organ?",
        "What comes before and after it in the food or bile pathway?",
        "What tissue clue proves stomach, small intestine, or large intestine?"
      ],
      anchors: [
        "Use stomach clues first: rugae, curvatures, pyloric region.",
        "Use villi to call small intestine and absence of villi to support large intestine.",
        "Separate liver, gall bladder, bile ducts, and pancreas by location plus function."
      ],
      traps: [
        "Learners often name nearby accessory organs instead of the duct or sphincter being tested.",
        "Pancreas and surrounding digestive tissues are easy to blur together without tracing connections."
      ],
      mechanism: [
        "Name whether the structure stores, propels, digests, secretes, or absorbs.",
        "Tie the epithelial or gland pattern to the job the tissue performs."
      ],
      challenge: [
        "Describe the bile route from liver to intestine.",
        "Compare small and large intestine on both model and histology."
      ]
    },
    Urinary: {
      warmups: [
        "Is this part of blood filtration or urine drainage?",
        "Are you in gross kidney anatomy or nephron anatomy?",
        "What clue tells you cortex versus medulla?"
      ],
      anchors: [
        "Say the urine path from pyramid to ureter before you name a calyx.",
        "Afferent enters, efferent exits. Use the direction first, then the label.",
        "Renal corpuscles instantly anchor cortex on histology."
      ],
      traps: [
        "Students mix up drainage structures with vessels because both cluster near the hilum.",
        "Collecting ducts and tubules get confused when the cortex/medulla context is ignored."
      ],
      mechanism: [
        "Ask whether this structure filters, modifies filtrate, or transports urine.",
        "Tie the location to the nephron sequence before saying the specific label."
      ],
      challenge: [
        "Name the major nephron segments in order.",
        "Contrast afferent versus efferent arterioles without using hand gestures."
      ]
    },
    Endocrine: {
      warmups: [
        "Where is this gland in the body?",
        "Is the key clue a lobe, follicle pattern, or layered cortex/medulla?",
        "What hormone family or secretion style is associated with it?"
      ],
      anchors: [
        "Pituitary means lobe distinction first.",
        "Thyroid means follicles first.",
        "Adrenal means cortex/medulla layering first."
      ],
      traps: [
        "Students often name the organ correctly but miss the specific lobe or microscopic structure.",
        "Endocrine organs can be confused with nearby non-endocrine anatomy unless location is stated first."
      ],
      mechanism: [
        "Tie the architecture to endocrine release: follicles store, lobes differ, cortex layers specialize.",
        "Ask how the organ is organized before you ask what it secretes."
      ],
      challenge: [
        "Name all major endocrine organs from head to pelvis.",
        "Contrast anterior/posterior pituitary or thyroid/adrenal histology in one breath."
      ]
    },
    Reproductive: {
      warmups: [
        "Male or female anatomy?",
        "Is this a gonad, duct, gland, or external structure?",
        "If a gamete were here, where would it travel next?"
      ],
      anchors: [
        "For male anatomy, keep testis, epididymis, vas deferens, and accessory glands in sequence.",
        "For female anatomy, use uterus as the center and orient tubes, ovary, cervix, and vagina around it.",
        "On histology, call seminiferous tubules or follicle stage before naming the organ."
      ],
      traps: [
        "Students confuse surrounding gland tissue with the transport duct being pointed at.",
        "Ovarian follicle stages are often missed because size and antrum are not checked first."
      ],
      mechanism: [
        "Ask whether the structure produces gametes, transports them, or adds supporting secretions.",
        "On histology, tie the visible tissue pattern to function before labeling."
      ],
      challenge: [
        "Trace the sperm pathway outward from the testis.",
        "Contrast a primary follicle with a mature Graafian follicle."
      ]
    },
    "Fetal Pig": {
      warmups: [
        "What human system does this pig structure help you remember?",
        "What nearby look-alike structure could trap you?",
        "What would material flow to next?"
      ],
      anchors: [
        "Use hard versus soft palate as an early oral-cavity check.",
        "Use the spiral colon as a pig-specific digestive anchor.",
        "State whether a membrane lines the wall or covers the organ."
      ],
      traps: [
        "Students bring over a human mental map too literally and miss pig-specific arrangements.",
        "Pig peritoneal labels are easy to miss if you do not ask wall versus organ first."
      ],
      mechanism: [
        "Treat the pig like a comparison model: map the function before the exact label.",
        "When stuck, translate the pig structure into the human system you already know."
      ],
      challenge: [
        "Explain why spiral colon is such a strong pig clue.",
        "Contrast parietal versus visceral peritoneum without pointing."
      ]
    },
    Histology: {
      warmups: [
        "What organ or tissue are you in first?",
        "What epithelium or dominant structure do you see?",
        "What look-alike tissue should you rule out?"
      ],
      anchors: [
        "Trachea means cilia plus cartilage; lung means alveolar air space.",
        "Kidney cortex means renal corpuscles immediately.",
        "Thyroid means follicles; adrenal means layered cortex plus medulla."
      ],
      traps: [
        "Students jump straight to a label before naming the organ-level pattern.",
        "One clue is not enough on histology; use a confirming feature before committing."
      ],
      mechanism: [
        "Tie the tissue architecture to its job: protection, diffusion, secretion, absorption, or transport.",
        "Say why it is not the nearest confusion, not just why it is correct."
      ],
      challenge: [
        "Separate trachea and esophagus in one sentence.",
        "Call the organ, epithelium, and confirming clue as a three-part drill."
      ]
    }
  },
  figures: {
    Respiratory: [
      {
        src: "assets/teaching/respiratory-conducting-zone.svg",
        title: "Conducting zone map",
        caption: "Teaching-library diagram showing the conducting portion of the respiratory tree."
      },
      {
        src: "assets/teaching/respiratory-larynx.svg",
        title: "Larynx figure",
        caption: "Teaching-library diagram for laryngeal landmarks and airway support structures."
      }
    ],
    Digestive: [
      {
        src: "assets/teaching/digestive-pancreas.svg",
        title: "Pancreas overview",
        caption: "Teaching-library pancreas anatomy figure for organ position and duct context."
      },
      {
        src: "assets/teaching/digestive-pancreas-structures.svg",
        title: "Pancreas separated structures",
        caption: "Teaching-library breakdown of major pancreatic structures."
      }
    ],
    Urinary: [
      {
        src: "assets/teaching/urinary-nephron.png",
        title: "Nephron figure",
        caption: "Teaching-library nephron image for segment orientation."
      }
    ],
    Endocrine: [
      {
        src: "assets/teaching/endocrine-system.svg",
        title: "Endocrine system map",
        caption: "Teaching-library endocrine figure for gland locations across the body."
      },
      {
        src: "assets/teaching/endocrine-thyroid-system.svg",
        title: "Thyroid system map",
        caption: "Teaching-library figure centered on thyroid relationships."
      }
    ],
    Histology: [
      {
        src: "assets/teaching/histology-trachea.jpg",
        title: "Trachea histology",
        caption: "Teaching-library micrograph showing tracheal tissue patterning."
      },
      {
        src: "assets/teaching/histology-sweat-gland.jpg",
        title: "Sweat gland histology",
        caption: "Teaching-library micrograph for glandular tissue recognition."
      },
      {
        src: "assets/teaching/histology-breast.png",
        title: "Breast histology",
        caption: "Teaching-library tissue image for gland/duct context."
      },
      {
        src: "assets/teaching/histology-urethra.jpg",
        title: "Female urethra histology",
        caption: "Teaching-library histology reference for urinary epithelium context."
      }
    ]
  }
};
