/**
 * Ms. Luminara Quiz - Multi-Representational Engine
 *
 * Opportunity 6: Multi-Representational Pilot
 *
 * Present the same concept through multiple representations:
 * - Verbal (text descriptions)
 * - Graphical (diagrams, charts, images)
 * - Clinical (case studies, patient scenarios)
 *
 * Research Basis (Mestre 2001, Chi 2005):
 * "Expert-novice differences stem from representational fluency - the ability
 * to translate between different representations of the same concept."
 *
 * Usage:
 *   const engine = new RepresentationEngine(questionStatistics);
 *   const enriched = engine.enrichQuestion(question);
 *   // Returns question with alternative representations attached
 */

class RepresentationEngine {
  constructor(questionStatistics = null) {
    this.questionStatistics = questionStatistics;

    // Representation types
    this.TYPES = {
      VERBAL: 'verbal',
      GRAPHICAL: 'graphical',
      CLINICAL: 'clinical',
      ANALOGICAL: 'analogical',  // Metaphors and analogies
      PROCEDURAL: 'procedural'   // Step-by-step processes
    };

    // Track which representations helped which students
    this.representationEffectiveness = {};

    // Pilot questions with multi-representational content
    this.pilotBank = this.createPilotBank();
  }

  // ═══════════════════════════════════════════════════════════════
  // PILOT QUESTION BANK (10 questions with multiple representations)
  // ═══════════════════════════════════════════════════════════════

  createPilotBank() {
    return [
      // Question 1: Action Potential - Depolarization
      {
        id: 'repr_001',
        concept: 'action_potential_depolarization',
        dewey: '612.81',
        representations: {
          verbal: {
            q: "What happens during depolarization of a neuron?",
            options: [
              "Sodium ions rush into the cell, making it more positive",
              "Potassium ions leave the cell, making it more negative",
              "Chloride ions enter the cell",
              "Calcium ions are released from storage"
            ],
            answer: 0,
            explain: "Depolarization occurs when voltage-gated Na+ channels open, allowing sodium to rush in down its electrochemical gradient, changing membrane potential from -70mV toward +30mV."
          },
          graphical: {
            q: "Looking at the action potential graph below, which phase is marked by the sharp upward spike?",
            diagram: "action_potential_graph",
            diagramCaption: "[Graph showing membrane potential vs time: resting at -70mV, sharp rise to +30mV (marked), then fall back]",
            options: [
              "Depolarization - Na+ channels opening",
              "Repolarization - K+ channels opening",
              "Hyperpolarization - K+ channels still open",
              "Resting state - leak channels only"
            ],
            answer: 0,
            explain: "The sharp upward spike represents depolarization, where sodium ions flood in through voltage-gated channels."
          },
          clinical: {
            q: "A patient with a channelopathy has defective voltage-gated sodium channels that won't open properly. What symptom would you expect?",
            options: [
              "Muscle weakness or paralysis (neurons can't fire properly)",
              "Muscle spasms (neurons fire too easily)",
              "Excessive sweating (autonomic overactivity)",
              "Memory loss (hippocampal damage)"
            ],
            answer: 0,
            explain: "Without proper Na+ channel function, neurons cannot depolarize effectively, leading to weak or absent action potentials and muscle weakness."
          },
          analogical: {
            q: "If depolarization were like opening a dam, what would the 'water' represent?",
            options: [
              "Sodium ions rushing into the cell",
              "Potassium ions leaving the cell",
              "ATP energy being released",
              "Neurotransmitters being released"
            ],
            answer: 0,
            explain: "Like water rushing through an opened dam, sodium ions flood into the cell when voltage-gated channels open during depolarization."
          }
        }
      },

      // Question 2: Synaptic Transmission
      {
        id: 'repr_002',
        concept: 'synaptic_transmission',
        dewey: '612.81',
        representations: {
          verbal: {
            q: "What triggers neurotransmitter release at a synapse?",
            options: [
              "Calcium ions entering the axon terminal",
              "Sodium ions entering the axon terminal",
              "Potassium ions leaving the terminal",
              "ATP binding to receptors"
            ],
            answer: 0,
            explain: "When an action potential reaches the axon terminal, voltage-gated Ca2+ channels open. Calcium influx triggers vesicle fusion and neurotransmitter release."
          },
          graphical: {
            q: "In this diagram of a synapse, which structure contains the neurotransmitters before release?",
            diagram: "synapse_diagram",
            diagramCaption: "[Diagram showing: presynaptic terminal with small circles (vesicles), synaptic cleft, postsynaptic membrane with receptors]",
            options: [
              "The small circular structures (synaptic vesicles)",
              "The gap between neurons (synaptic cleft)",
              "The protein structures on the receiving cell (receptors)",
              "The mitochondria in the terminal"
            ],
            answer: 0,
            explain: "Synaptic vesicles are membrane-bound spheres that store neurotransmitters until calcium triggers their release."
          },
          clinical: {
            q: "Botulinum toxin (Botox) prevents synaptic vesicles from fusing with the membrane. What effect would this have?",
            options: [
              "Paralysis - neurotransmitters can't be released",
              "Spasms - excessive neurotransmitter release",
              "Numbness - sensory neurons affected",
              "Tremors - irregular release patterns"
            ],
            answer: 0,
            explain: "By blocking vesicle fusion, Botox prevents acetylcholine release at neuromuscular junctions, causing targeted muscle paralysis."
          },
          procedural: {
            q: "Arrange these steps of synaptic transmission in correct order: 1) Vesicle fusion 2) Action potential arrives 3) Ca2+ enters terminal 4) Neurotransmitter binds receptor",
            options: [
              "2 → 3 → 1 → 4",
              "3 → 2 → 4 → 1",
              "1 → 2 → 3 → 4",
              "4 → 3 → 2 → 1"
            ],
            answer: 0,
            explain: "Action potential arrives → Ca2+ enters → Vesicles fuse with membrane → Neurotransmitter released and binds receptors."
          }
        }
      },

      // Question 3: Blood-Brain Barrier
      {
        id: 'repr_003',
        concept: 'blood_brain_barrier',
        dewey: '612.82',
        representations: {
          verbal: {
            q: "What is the primary function of the blood-brain barrier?",
            options: [
              "Protect the brain from toxins and pathogens in blood",
              "Supply oxygen to neurons",
              "Remove waste products from brain tissue",
              "Regulate body temperature"
            ],
            answer: 0,
            explain: "The BBB, formed by tight junctions between endothelial cells, selectively blocks harmful substances while allowing essential nutrients to pass."
          },
          graphical: {
            q: "In this cross-section of a brain capillary, what feature creates the selective barrier?",
            diagram: "bbb_cross_section",
            diagramCaption: "[Cross-section showing: endothelial cells with tight junctions (marked), astrocyte foot processes, basement membrane]",
            options: [
              "Tight junctions between endothelial cells",
              "The thick basement membrane",
              "Surrounding muscle cells",
              "Large gaps between cells"
            ],
            answer: 0,
            explain: "Tight junctions seal the gaps between endothelial cells, preventing paracellular transport and forcing substances through the cells themselves."
          },
          clinical: {
            q: "A patient with bacterial meningitis has inflammation that temporarily disrupts the blood-brain barrier. What risk does this create?",
            options: [
              "Toxins and pathogens can now enter the brain more easily",
              "The brain will run out of glucose",
              "Neurons will fire uncontrollably",
              "Blood pressure will drop dramatically"
            ],
            answer: 0,
            explain: "BBB disruption allows bacteria and inflammatory molecules to enter the CNS, worsening infection and potentially causing brain damage."
          },
          analogical: {
            q: "If the blood-brain barrier were a security checkpoint at an airport, what would 'glucose transporters' be?",
            options: [
              "Special lanes for pre-approved essential items",
              "Guards checking IDs",
              "Metal detectors",
              "The exit doors"
            ],
            answer: 0,
            explain: "Like TSA PreCheck lanes, glucose transporters are specific pathways that allow essential molecules to bypass the general screening and enter quickly."
          }
        }
      },

      // Question 4: Sympathetic vs Parasympathetic
      {
        id: 'repr_004',
        concept: 'ans_divisions',
        dewey: '612.89',
        representations: {
          verbal: {
            q: "Which division of the autonomic nervous system increases heart rate?",
            options: [
              "Sympathetic nervous system",
              "Parasympathetic nervous system",
              "Somatic nervous system",
              "Enteric nervous system"
            ],
            answer: 0,
            explain: "The sympathetic ('fight or flight') system increases heart rate to prepare for action. Parasympathetic ('rest and digest') slows it down."
          },
          graphical: {
            q: "Looking at this diagram comparing the two ANS divisions, which pathway would be active when you're being chased by a bear?",
            diagram: "ans_comparison",
            diagramCaption: "[Side-by-side: LEFT shows dilated pupils, fast heart, relaxed bronchi (marked). RIGHT shows constricted pupils, slow heart, constricted bronchi]",
            options: [
              "The left pathway (sympathetic)",
              "The right pathway (parasympathetic)",
              "Both equally",
              "Neither - this requires voluntary control"
            ],
            answer: 0,
            explain: "The sympathetic system (left) prepares you for action: dilated pupils for better vision, faster heart for more blood flow, open airways for more oxygen."
          },
          clinical: {
            q: "A patient taking a beta-blocker (which blocks sympathetic effects on the heart) reports feeling tired during exercise. Why?",
            options: [
              "Heart can't increase rate adequately for exercise demands",
              "Blood pressure is too high",
              "Parasympathetic system is overactive",
              "Muscles aren't receiving enough glucose"
            ],
            answer: 0,
            explain: "Beta-blockers prevent norepinephrine from increasing heart rate. During exercise, the heart can't speed up enough to meet oxygen demands."
          },
          analogical: {
            q: "If your ANS were a car, the sympathetic system would be the _____ and parasympathetic would be the _____.",
            options: [
              "Accelerator; brake",
              "Steering wheel; mirrors",
              "Headlights; horn",
              "Engine; transmission"
            ],
            answer: 0,
            explain: "Sympathetic accelerates body functions for action; parasympathetic brakes to slow things down for rest and digestion."
          }
        }
      },

      // Question 5: Hypothalamus Functions
      {
        id: 'repr_005',
        concept: 'hypothalamus_function',
        dewey: '612.82',
        representations: {
          verbal: {
            q: "Which brain structure is considered the master regulator of homeostasis?",
            options: [
              "Hypothalamus",
              "Cerebral cortex",
              "Cerebellum",
              "Medulla oblongata"
            ],
            answer: 0,
            explain: "The hypothalamus monitors and regulates body temperature, hunger, thirst, sleep, and circadian rhythms - the major homeostatic functions."
          },
          graphical: {
            q: "In this midsagittal brain diagram, identify the structure that connects to the pituitary gland and controls hormone release.",
            diagram: "midsagittal_brain",
            diagramCaption: "[Midsagittal view: thalamus (large central), hypothalamus (below, connecting to pituitary), brainstem, cerebellum]",
            options: [
              "Hypothalamus (small structure below thalamus, attached to pituitary)",
              "Thalamus (large oval structure)",
              "Pineal gland (posterior)",
              "Pons (in brainstem)"
            ],
            answer: 0,
            explain: "The hypothalamus sits below ('hypo') the thalamus and extends down to connect with the pituitary gland via the infundibulum."
          },
          clinical: {
            q: "A patient with a hypothalamic tumor presents with uncontrolled eating, inability to regulate body temperature, and sleep disturbances. Why are so many functions affected?",
            options: [
              "The hypothalamus controls all these homeostatic functions",
              "The tumor has spread to multiple brain regions",
              "These symptoms are unrelated to the tumor",
              "The pituitary gland is destroyed"
            ],
            answer: 0,
            explain: "The hypothalamus integrates hunger, thermoregulation, and sleep centers. Damage to it disrupts all these homeostatic mechanisms simultaneously."
          },
          procedural: {
            q: "When you're dehydrated, what is the correct sequence of hypothalamic response?",
            options: [
              "Osmoreceptors detect high blood concentration → Hypothalamus releases ADH → Kidneys retain water → Thirst sensation",
              "Thirst first → Then ADH release → Then kidney response",
              "ADH release → Osmoreceptor activation → Thirst",
              "Kidney response → Hypothalamus notified → Thirst"
            ],
            answer: 0,
            explain: "Osmoreceptors in the hypothalamus detect dehydration first, triggering both ADH release (to conserve water) and the conscious sensation of thirst."
          }
        }
      },

      // Question 6: Myelin and Saltatory Conduction
      {
        id: 'repr_006',
        concept: 'myelin_saltatory',
        dewey: '612.81',
        representations: {
          verbal: {
            q: "Why does myelin increase the speed of nerve impulse conduction?",
            options: [
              "Action potentials 'jump' between nodes of Ranvier (saltatory conduction)",
              "Myelin provides extra energy for the impulse",
              "Myelin makes the axon thicker",
              "Myelin adds more sodium channels"
            ],
            answer: 0,
            explain: "Myelin insulates the axon, so action potentials only regenerate at nodes of Ranvier, allowing the signal to 'jump' and travel faster."
          },
          graphical: {
            q: "In this diagram of a myelinated axon, where do action potentials actually occur?",
            diagram: "myelinated_axon",
            diagramCaption: "[Axon with myelin segments (white), gaps between them (nodes of Ranvier, marked), and arrows showing signal 'jumping']",
            options: [
              "At the gaps (nodes of Ranvier)",
              "Along the entire myelin sheath",
              "Only at the cell body",
              "Randomly along the axon"
            ],
            answer: 0,
            explain: "Ion channels are concentrated at nodes of Ranvier. The signal jumps from node to node, regenerating only at these gaps."
          },
          clinical: {
            q: "Multiple sclerosis destroys myelin sheaths in the CNS. What symptom would result from demyelination of motor pathways?",
            options: [
              "Muscle weakness and poor coordination (slower, weaker signals)",
              "Increased muscle strength (more signals)",
              "Loss of pain sensation only",
              "Improved reflexes"
            ],
            answer: 0,
            explain: "Without myelin, signals slow down and may fail to reach their targets, causing weakness, spasticity, and coordination problems."
          },
          analogical: {
            q: "If a myelinated axon were a highway, the nodes of Ranvier would be like:",
            options: [
              "Express lanes where you speed up between exits",
              "Toll booths that slow you down",
              "Rest stops where you take breaks",
              "Construction zones"
            ],
            answer: 0,
            explain: "Like express travel where you only 'stop' briefly at exits (nodes), saltatory conduction lets signals move faster by jumping between nodes."
          }
        }
      },

      // Question 7: Pupillary Reflex
      {
        id: 'repr_007',
        concept: 'pupillary_reflex',
        dewey: '612.84',
        representations: {
          verbal: {
            q: "Which cranial nerve carries the parasympathetic fibers that constrict the pupil?",
            options: [
              "Oculomotor nerve (CN III)",
              "Optic nerve (CN II)",
              "Trigeminal nerve (CN V)",
              "Facial nerve (CN VII)"
            ],
            answer: 0,
            explain: "The oculomotor nerve (CN III) carries parasympathetic fibers from the Edinger-Westphal nucleus that cause pupil constriction (miosis)."
          },
          graphical: {
            q: "Looking at this reflex arc diagram, trace the path: bright light hits retina → where does the signal go next?",
            diagram: "pupillary_reflex_arc",
            diagramCaption: "[Arc showing: Eye → Optic nerve → Pretectal nucleus → E-W nucleus → CN III → Ciliary ganglion → Pupil]",
            options: [
              "Optic nerve → Pretectal nucleus → Edinger-Westphal nucleus",
              "Directly to the pupil muscles",
              "To the occipital cortex first",
              "To the spinal cord"
            ],
            answer: 0,
            explain: "Light signals travel via optic nerve to pretectal nuclei (brainstem), then to Edinger-Westphal nucleus, which sends output via CN III."
          },
          clinical: {
            q: "A patient has a fixed, dilated pupil that doesn't respond to light. CN III is damaged. Which other signs would you expect?",
            options: [
              "Ptosis (droopy eyelid) and eye deviation down and out",
              "Loss of hearing on that side",
              "Inability to smell",
              "Weakness of facial muscles"
            ],
            answer: 0,
            explain: "CN III also controls most extraocular muscles and eyelid elevation. Damage causes ptosis, and the eye deviates due to unopposed action of other muscles."
          },
          procedural: {
            q: "Arrange the pupillary light reflex components in order: 1) CN III activation 2) Photoreceptor stimulation 3) Pretectal nucleus processing 4) Pupil constriction",
            options: [
              "2 → 3 → 1 → 4",
              "1 → 2 → 3 → 4",
              "3 → 2 → 1 → 4",
              "4 → 3 → 2 → 1"
            ],
            answer: 0,
            explain: "Light hits retina (photoreceptors) → Signal to pretectal nucleus → Edinger-Westphal activates CN III → CN III causes pupil constriction."
          }
        }
      },

      // Question 8: Neurotransmitter Degradation
      {
        id: 'repr_008',
        concept: 'neurotransmitter_degradation',
        dewey: '612.81',
        representations: {
          verbal: {
            q: "What enzyme breaks down acetylcholine in the synaptic cleft?",
            options: [
              "Acetylcholinesterase (AChE)",
              "Monoamine oxidase (MAO)",
              "COMT (catechol-O-methyltransferase)",
              "Tyrosine hydroxylase"
            ],
            answer: 0,
            explain: "Acetylcholinesterase rapidly hydrolyzes ACh into acetate and choline, terminating the signal. This happens extremely fast - within milliseconds."
          },
          graphical: {
            q: "In this diagram of a cholinergic synapse, what would happen if the enzyme (marked with scissors) was blocked?",
            diagram: "cholinergic_synapse",
            diagramCaption: "[Synapse showing: ACh vesicles, ACh molecules in cleft, AChE enzyme (scissors icon), and receptors]",
            options: [
              "ACh would accumulate, causing continuous stimulation",
              "ACh release would stop",
              "The receptors would be destroyed",
              "The presynaptic terminal would die"
            ],
            answer: 0,
            explain: "Without AChE to clear ACh, the neurotransmitter keeps activating receptors, causing overstimulation (as seen with nerve agents or some pesticides)."
          },
          clinical: {
            q: "A patient with myasthenia gravis is given pyridostigmine, which inhibits acetylcholinesterase. Why does this help their muscle weakness?",
            options: [
              "More ACh accumulates to compensate for antibody-blocked receptors",
              "It destroys the harmful antibodies",
              "It directly stimulates muscle fibers",
              "It regenerates damaged neurons"
            ],
            answer: 0,
            explain: "In MG, antibodies block ACh receptors. By inhibiting AChE, more ACh remains in the cleft, increasing the chance of successful transmission."
          },
          analogical: {
            q: "If neurotransmitters were text messages, acetylcholinesterase would be like:",
            options: [
              "Auto-delete that erases messages after reading",
              "A spam filter blocking messages",
              "The send button",
              "The notification sound"
            ],
            answer: 0,
            explain: "Like auto-delete clears messages after they're read, AChE clears ACh after it's transmitted, preventing continuous signaling."
          }
        }
      },

      // Question 9: Resting Membrane Potential
      {
        id: 'repr_009',
        concept: 'resting_membrane_potential',
        dewey: '612.81',
        representations: {
          verbal: {
            q: "What is the approximate resting membrane potential of a typical neuron?",
            options: [
              "-70 mV (inside negative relative to outside)",
              "+70 mV (inside positive)",
              "0 mV (no charge difference)",
              "-7 mV (slightly negative)"
            ],
            answer: 0,
            explain: "The resting potential of about -70mV is maintained by K+ leak channels and the Na+/K+ pump (3 Na+ out, 2 K+ in)."
          },
          graphical: {
            q: "This diagram shows ion concentrations inside and outside a neuron. Which ion's gradient is responsible for the negative resting potential?",
            diagram: "ion_concentrations",
            diagramCaption: "[Cell diagram: Inside shows high K+, low Na+. Outside shows low K+, high Na+. K+ leak channels shown (marked)]",
            options: [
              "Potassium (K+) - it leaks out, leaving negative charges behind",
              "Sodium (Na+) - it's higher outside",
              "Chloride (Cl-) - it rushes in",
              "Calcium (Ca2+) - it's stored inside"
            ],
            answer: 0,
            explain: "K+ leak channels allow potassium to flow out down its concentration gradient, leaving behind negative proteins and creating the -70mV potential."
          },
          clinical: {
            q: "A patient with severe hypokalemia (low blood potassium) might experience muscle weakness and cardiac arrhythmias. How does low K+ affect the resting potential?",
            options: [
              "Cells become hyperpolarized (more negative), harder to excite",
              "Cells become depolarized (less negative), easier to excite",
              "No effect on membrane potential",
              "Cells die immediately"
            ],
            answer: 0,
            explain: "With less K+ outside, the gradient steepens, causing more K+ to leave the cell, making it more negative (hyperpolarized) and harder to excite."
          },
          procedural: {
            q: "What maintains the resting potential over time? Arrange in order of importance:",
            options: [
              "K+ leak channels (primary) → Na+/K+ ATPase (maintenance) → Na+ channels (closed at rest)",
              "Na+ channels first → K+ channels → ATP pump",
              "ATP pump alone maintains everything",
              "No active process needed - it's passive"
            ],
            answer: 0,
            explain: "K+ leak creates the potential, Na+/K+ pump maintains gradients long-term, and voltage-gated Na+ channels stay closed at rest."
          }
        }
      },

      // Question 10: Cerebrospinal Fluid
      {
        id: 'repr_010',
        concept: 'csf_function',
        dewey: '612.82',
        representations: {
          verbal: {
            q: "Where is cerebrospinal fluid (CSF) primarily produced?",
            options: [
              "Choroid plexus in the ventricles",
              "Meninges surrounding the brain",
              "Cerebral cortex neurons",
              "Spinal cord gray matter"
            ],
            answer: 0,
            explain: "The choroid plexus, a network of capillaries and ependymal cells in the ventricles, produces about 500mL of CSF daily."
          },
          graphical: {
            q: "In this diagram of CSF circulation, trace the flow. Where does CSF ultimately drain?",
            diagram: "csf_circulation",
            diagramCaption: "[Brain ventricles → Subarachnoid space → Arachnoid granulations (marked) → Superior sagittal sinus]",
            options: [
              "Through arachnoid granulations into venous sinuses",
              "Back into the ventricles",
              "Into the spinal cord",
              "Out through the nose"
            ],
            answer: 0,
            explain: "CSF flows through ventricles, into subarachnoid space, and is absorbed through arachnoid granulations into the superior sagittal sinus."
          },
          clinical: {
            q: "A patient has hydrocephalus (fluid accumulation in brain). A blockage in the cerebral aqueduct would cause which type?",
            options: [
              "Non-communicating (obstructive) - CSF can't flow between ventricles",
              "Communicating - too much CSF produced",
              "Normal pressure hydrocephalus",
              "External hydrocephalus"
            ],
            answer: 0,
            explain: "Blocking the narrow cerebral aqueduct prevents CSF from flowing from 3rd to 4th ventricle, causing upstream ventricle enlargement (obstructive hydrocephalus)."
          },
          analogical: {
            q: "If the ventricular system were plumbing, the cerebral aqueduct would be:",
            options: [
              "A narrow pipe connecting two larger tanks",
              "The main water supply line",
              "The drain",
              "A water filter"
            ],
            answer: 0,
            explain: "Like a narrow pipe between tanks, the cerebral aqueduct connects the 3rd and 4th ventricles. Blockage here causes backup upstream."
          }
        }
      }
    ];
  }

  // ═══════════════════════════════════════════════════════════════
  // REPRESENTATION SELECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get the best representation for a student based on their learning profile
   *
   * @param {string} questionId - Question ID from pilot bank
   * @param {object} learnerProfile - Student's learning profile (from LearningAnalyticsEngine)
   * @returns {object} Question in the best representation
   */
  getBestRepresentation(questionId, learnerProfile = null) {
    const pilotQ = this.pilotBank.find(q => q.id === questionId);
    if (!pilotQ) return null;

    // Default to verbal if no profile
    let representationType = this.TYPES.VERBAL;

    if (learnerProfile) {
      // Check effectiveness data for this learner
      const effectiveness = this.getRepresentationEffectiveness(learnerProfile.learnerId);

      if (effectiveness.bestType) {
        representationType = effectiveness.bestType;
      } else {
        // Heuristic selection based on learning patterns
        representationType = this.selectRepresentationHeuristically(learnerProfile);
      }
    }

    // Get the representation
    const repr = pilotQ.representations[representationType];
    if (!repr) {
      // Fall back to verbal
      return this.formatQuestion(pilotQ, this.TYPES.VERBAL);
    }

    return this.formatQuestion(pilotQ, representationType);
  }

  /**
   * Get all representations for a concept (for comparison/practice)
   */
  getAllRepresentations(questionId) {
    const pilotQ = this.pilotBank.find(q => q.id === questionId);
    if (!pilotQ) return [];

    return Object.entries(pilotQ.representations).map(([type, repr]) => {
      return this.formatQuestion(pilotQ, type);
    });
  }

  /**
   * Format a question with its representation type
   */
  formatQuestion(pilotQ, representationType) {
    const repr = pilotQ.representations[representationType];
    if (!repr) return null;

    return {
      id: `${pilotQ.id}_${representationType}`,
      originalId: pilotQ.id,
      concept: pilotQ.concept,
      dewey: pilotQ.dewey,
      representationType: representationType,
      q: repr.q,
      options: repr.options,
      answer: repr.answer,
      explain: repr.explain,
      diagram: repr.diagram || null,
      diagramCaption: repr.diagramCaption || null,
      // Metadata for scaffolding
      mechanism: {
        content: repr.explain,
        metaphor: pilotQ.representations.analogical?.q || null
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // REPRESENTATION EFFECTIVENESS TRACKING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Record how well a representation worked for a learner
   */
  recordRepresentationResult(learnerId, questionId, representationType, wasCorrect, responseTime) {
    const key = `${learnerId}_${representationType}`;

    if (!this.representationEffectiveness[key]) {
      this.representationEffectiveness[key] = {
        attempts: 0,
        correct: 0,
        totalTime: 0
      };
    }

    const data = this.representationEffectiveness[key];
    data.attempts++;
    if (wasCorrect) data.correct++;
    data.totalTime += responseTime || 0;

    // Save to localStorage
    this.saveEffectivenessData();

    return {
      accuracy: data.correct / data.attempts,
      avgTime: data.totalTime / data.attempts
    };
  }

  /**
   * Get effectiveness data for a learner
   */
  getRepresentationEffectiveness(learnerId) {
    const effectiveness = {};
    let bestType = null;
    let bestAccuracy = 0;

    for (const type of Object.values(this.TYPES)) {
      const key = `${learnerId}_${type}`;
      const data = this.representationEffectiveness[key];

      if (data && data.attempts >= 3) { // Minimum attempts for reliability
        const accuracy = data.correct / data.attempts;
        effectiveness[type] = {
          accuracy,
          avgTime: data.totalTime / data.attempts,
          attempts: data.attempts
        };

        if (accuracy > bestAccuracy) {
          bestAccuracy = accuracy;
          bestType = type;
        }
      }
    }

    return {
      byType: effectiveness,
      bestType,
      bestAccuracy
    };
  }

  /**
   * Select representation heuristically based on learning patterns
   */
  selectRepresentationHeuristically(learnerProfile) {
    // If student struggles with abstract concepts, try graphical
    if (learnerProfile.abstractStruggle) {
      return this.TYPES.GRAPHICAL;
    }

    // If student is in healthcare/clinical program, try clinical
    if (learnerProfile.clinicalFocus) {
      return this.TYPES.CLINICAL;
    }

    // If student responds well to step-by-step, try procedural
    if (learnerProfile.proceduralLearner) {
      return this.TYPES.PROCEDURAL;
    }

    // If student likes metaphors/stories, try analogical
    if (learnerProfile.narrativeLearner) {
      return this.TYPES.ANALOGICAL;
    }

    // Default to verbal
    return this.TYPES.VERBAL;
  }

  // ═══════════════════════════════════════════════════════════════
  // CROSS-REPRESENTATIONAL PRACTICE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Generate a cross-representational practice session
   * Shows the same concept in different representations
   */
  generateCrossRepresentationalPractice(concept) {
    const pilotQ = this.pilotBank.find(q => q.concept === concept);
    if (!pilotQ) return null;

    const representations = Object.entries(pilotQ.representations);
    const shuffled = this.shuffleArray([...representations]);

    return {
      concept: pilotQ.concept,
      dewey: pilotQ.dewey,
      questions: shuffled.map(([type, repr], index) => ({
        ...this.formatQuestion(pilotQ, type),
        sequenceNumber: index + 1,
        totalInSequence: representations.length,
        instruction: this.getCrossRepresentationalInstruction(type, index === 0)
      }))
    };
  }

  /**
   * Get instruction text for cross-representational practice
   */
  getCrossRepresentationalInstruction(type, isFirst) {
    const instructions = {
      [this.TYPES.VERBAL]: isFirst
        ? "Let's start with a text-based question."
        : "Now let's see the same concept described in words.",
      [this.TYPES.GRAPHICAL]: "Now visualize this concept with a diagram.",
      [this.TYPES.CLINICAL]: "How does this apply to a real patient?",
      [this.TYPES.ANALOGICAL]: "Here's an analogy to help it stick.",
      [this.TYPES.PROCEDURAL]: "Let's think through the steps."
    };

    return instructions[type] || "Here's another perspective:";
  }

  // ═══════════════════════════════════════════════════════════════
  // PILOT BANK ACCESS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all pilot questions for a specific Dewey code
   */
  getPilotQuestionsForDewey(deweyCode) {
    return this.pilotBank.filter(q => q.dewey.startsWith(deweyCode));
  }

  /**
   * Get a random pilot question
   */
  getRandomPilotQuestion(representationType = null) {
    const randomQ = this.pilotBank[Math.floor(Math.random() * this.pilotBank.length)];

    if (representationType) {
      return this.formatQuestion(randomQ, representationType);
    }

    // Random representation
    const types = Object.keys(randomQ.representations);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return this.formatQuestion(randomQ, randomType);
  }

  /**
   * Get all concepts in the pilot bank
   */
  getPilotConcepts() {
    return this.pilotBank.map(q => ({
      id: q.id,
      concept: q.concept,
      dewey: q.dewey,
      representationCount: Object.keys(q.representations).length
    }));
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  saveEffectivenessData() {
    try {
      localStorage.setItem('luminara_representation_effectiveness',
        JSON.stringify(this.representationEffectiveness));
    } catch (e) {
      console.warn('[RepresentationEngine] Failed to save effectiveness data:', e);
    }
  }

  loadEffectivenessData() {
    try {
      const saved = localStorage.getItem('luminara_representation_effectiveness');
      if (saved) {
        this.representationEffectiveness = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[RepresentationEngine] Failed to load effectiveness data:', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let representationEngine = null;

function initRepresentationEngine(questionStatistics) {
  if (!representationEngine) {
    representationEngine = new RepresentationEngine(questionStatistics);
    representationEngine.loadEffectivenessData();
    console.log('[RepresentationEngine] Multi-representational pilot initialized with',
      representationEngine.pilotBank.length, 'concepts');
  }
  return representationEngine;
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RepresentationEngine, initRepresentationEngine };
}
