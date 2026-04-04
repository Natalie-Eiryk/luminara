#!/usr/bin/env python3
"""
Merge mechanism objects into the respiratory vocabulary file.
Run this script from the respiratory directory.
"""

import json

# All mechanism objects from the three batches
mechanisms = [
  {
    "id": "900.5.01",
    "mechanism": {
      "title": "Air-Blood Swap",
      "content": "External respiration occurs when oxygen diffuses from alveolar air into pulmonary capillary blood while CO2 diffuses the opposite direction. This bidirectional exchange happens across the thin respiratory membrane driven by partial pressure gradients. The process refreshes blood with oxygen and removes metabolic waste CO2 before blood returns to the heart.",
      "metaphor": "Like a loading dock where delivery trucks (blood) exchange full oxygen crates for empty CO2 containers, both vehicles arriving and leaving simultaneously through the same gate."
    }
  },
  {
    "id": "900.5.02",
    "mechanism": {
      "title": "Microscopic Air Pockets",
      "content": "Alveoli are grape-like sacs at the end of respiratory bronchioles with walls only one cell thick, creating minimal diffusion distance. Their enormous collective surface area (70 m2) surrounded by dense capillary networks maximizes gas exchange efficiency. Each alveolus is coated with surfactant to prevent collapse during exhalation.",
      "metaphor": "Like bubble wrap where each tiny bubble is wrapped in blood vessels - millions of microscopic balloons creating a massive contact zone between air and blood in a compact space."
    }
  },
  {
    "id": "900.5.03",
    "mechanism": {
      "title": "Breathing Floor",
      "content": "The diaphragm is a dome-shaped skeletal muscle separating the thoracic and abdominal cavities that contracts downward during inspiration. When it flattens, it increases vertical chest dimension and decreases intrathoracic pressure, causing air to rush into lungs. Relaxation allows passive exhalation as the dome returns upward.",
      "metaphor": "Like a trampoline that pulls downward when stretched - when the diaphragm contracts and flattens, it creates suction that inflates the lungs like pulling a plunger on a syringe."
    }
  },
  {
    "id": "900.5.04",
    "mechanism": {
      "title": "Central Air Tube",
      "content": "The trachea is a 10-12 cm tube reinforced by C-shaped cartilage rings that prevent collapse during pressure changes of breathing. The posterior membranous wall allows esophageal expansion during swallowing. Ciliated pseudostratified epithelium with mucus-secreting goblet cells trap and sweep debris upward toward the pharynx.",
      "metaphor": "Like a vacuum cleaner hose with rigid rings to keep it open - the rings prevent kinking while the soft back wall lets your esophagus expand when you swallow large bites."
    }
  },
  {
    "id": "900.5.05",
    "mechanism": {
      "title": "Sound Chamber",
      "content": "The larynx houses the vocal cords (vocal folds) which vibrate when air passes through the glottis during exhalation. Pitch is controlled by tension of the cords via intrinsic laryngeal muscles, while volume depends on air pressure. The larynx also protects the airway by closing during swallowing.",
      "metaphor": "Like a guitar where tightening strings (vocal cords) creates higher notes - air from your lungs strums the strings while muscles tune them, all inside a protective cartilage box."
    }
  },
  {
    "id": "900.5.06",
    "mechanism": {
      "title": "Wall Lining",
      "content": "The parietal pleura is the outer layer of the pleural sac that adheres to the thoracic wall, diaphragm, and mediastinum. It is continuous with the visceral pleura at the lung root (hilum), creating a sealed potential space containing a thin film of pleural fluid. This allows frictionless lung movement during breathing while coupling lung expansion to chest wall movement.",
      "metaphor": "Like the inside of a wet plastic bag pressed against your ribs - the bag's outer layer (parietal) clings to your chest wall while the inner layer glides smoothly against your lungs with every breath."
    }
  },
  {
    "id": "900.5.07",
    "mechanism": {
      "title": "Bubble Stabilizer",
      "content": "Surfactant is a phospholipid mixture secreted by type II alveolar cells that reduces surface tension at the air-liquid interface of alveoli. By lowering surface tension, it prevents alveolar collapse during exhalation and reduces the work of breathing. Surfactant also helps equalize pressure across alveoli of different sizes, preventing smaller alveoli from emptying into larger ones.",
      "metaphor": "Like dish soap in bubble solution - without it, tiny bubbles pop immediately, but with surfactant, even microscopic alveolar bubbles stay inflated with minimal effort between breaths."
    }
  },
  {
    "id": "900.5.08",
    "mechanism": {
      "title": "Resting Breath Size",
      "content": "Tidal volume is the amount of air (approximately 500 mL) that moves in or out of the lungs during normal quiet breathing. It represents only a fraction of total lung capacity, leaving substantial inspiratory and expiratory reserve volumes available. Tidal volume can increase dramatically during exercise as metabolic oxygen demand rises.",
      "metaphor": "Like sipping from a glass instead of chugging - you only use a small fraction of your lung capacity with each normal breath, keeping plenty in reserve for when you suddenly need to sprint."
    }
  },
  {
    "id": "900.5.09",
    "mechanism": {
      "title": "Airway Split Point",
      "content": "The carina is the internal ridge where the trachea bifurcates into right and left main bronchi, located at the level of the sternal angle (T4-T5). It contains highly sensitive mucosa that triggers violent coughing when irritated, protecting against aspiration. The right main bronchus is wider and more vertical, making it the more common site for foreign body aspiration.",
      "metaphor": "Like a wishbone dividing a single tube into two branches - touch this sensitive ridge with food or a medical instrument and you'll trigger an explosive cough reflex to protect your lungs."
    }
  },
  {
    "id": "900.5.10",
    "mechanism": {
      "title": "Air Hunger Sensation",
      "content": "Dyspnea is the subjective sensation of difficult or labored breathing, often described as shortness of breath or air hunger. It arises from mismatches between respiratory effort and ventilatory output, mediated by mechanoreceptors in airways and chemoreceptors detecting blood gas imbalances. Dyspnea can occur without hypoxia in conditions affecting respiratory mechanics or perception.",
      "metaphor": "Like trying to breathe through a coffee stirrer while running - your brain screams for more air but your respiratory system can't deliver it fast enough, creating a desperate sensation even if oxygen levels are adequate."
    }
  },
  {
    "id": "900.5.11",
    "mechanism": {
      "title": "Swallowing Trapdoor",
      "content": "The epiglottis is a leaf-shaped elastic cartilage that passively covers the laryngeal inlet during swallowing, redirecting food and liquid into the esophagus. The upward laryngeal movement during swallowing tips the epiglottis posteriorly like a hinged lid. This prevents aspiration while allowing normal breathing when the larynx is at rest.",
      "metaphor": "Like a one-way drain cover that flips closed when water (food) flows - when you swallow, your larynx rises and tips this flexible lid backward to seal your windpipe shut."
    }
  },
  {
    "id": "900.5.12",
    "mechanism": {
      "title": "Iron Oxygen Courier",
      "content": "Hemoglobin is a quaternary protein in red blood cells with four heme groups, each containing an iron atom that reversibly binds one oxygen molecule. Cooperative binding causes oxygen affinity to increase as more O2 binds (sigmoidal saturation curve). Hemoglobin also transports about 20% of CO2 and buffers blood pH through its amino acid side chains.",
      "metaphor": "Like a four-person taxi with iron seats - when the first passenger (oxygen) gets in, it becomes easier for the next three to hop in, and when they all exit at tissues, the empty cab picks up CO2 for the return trip."
    }
  },
  {
    "id": "900.5.13",
    "mechanism": {
      "title": "Automatic Breath Control",
      "content": "Respiratory centers in the medulla oblongata and pons automatically generate rhythmic breathing by controlling diaphragm and intercostal muscle contraction. The medullary rhythmicity center sets the basic breathing rate, while pontine centers (pneumotaxic and apneustic) modulate rhythm smoothness. Central chemoreceptors respond to CSF pH changes from CO2, while peripheral chemoreceptors detect blood O2, CO2, and pH.",
      "metaphor": "Like a conductor (medulla) keeping orchestra tempo while assistant directors (pons) adjust phrasing - the conductor reads sheet music (blood chemistry) and automatically cues musicians (respiratory muscles) without conscious thought."
    }
  },
  {
    "id": "900.5.14",
    "mechanism": {
      "title": "Collapsed Lung Air",
      "content": "Pneumothorax occurs when air enters the pleural space, breaking the negative pressure that keeps lungs inflated against the chest wall. The affected lung collapses toward the hilum due to its natural elastic recoil as the pressure gradient is lost. Tension pneumothorax occurs when a one-way valve effect allows air to accumulate with each breath, progressively compressing mediastinal structures.",
      "metaphor": "Like a vacuum-sealed bag of coffee that gets punctured - once air enters the sealed space, the compressed contents (lung) spring away from the walls and the packaging loses its shape."
    }
  },
  {
    "id": "900.5.15",
    "mechanism": {
      "title": "Tissue Oxygen Drop",
      "content": "Internal respiration is the exchange of gases between systemic capillary blood and tissue cells throughout the body. Oxygen diffuses from blood into metabolically active cells along its concentration gradient, while CO2 produced by cellular respiration diffuses into blood. This process sustains cellular ATP production and removes acidic waste products.",
      "metaphor": "Like a delivery truck dropping off oxygen groceries at every house (cell) on its route while picking up trash bags (CO2) at each stop - the same principle as lung exchange but reversed."
    }
  },
  {
    "id": "900.5.16",
    "mechanism": {
      "title": "Nose Dividing Wall",
      "content": "The nasal septum is a midline partition of bone (perpendicular plate of ethmoid and vomer) and cartilage that divides the nasal cavity into right and left chambers. It provides structural support to the external nose and creates two parallel airflow channels. Deviation of the septum can obstruct airflow and impair nasal breathing.",
      "metaphor": "Like a vertical diving board in a swimming pool - the septum splits one nose into two tunnels, keeping left and right airflows separate while supporting the bridge of your nose."
    }
  },
  {
    "id": "900.5.17",
    "mechanism": {
      "title": "Blood Oxygen Fullness",
      "content": "Oxygen saturation (SpO2) is the percentage of hemoglobin binding sites occupied by oxygen, normally 95-100% in arterial blood. It reflects the balance between oxygen loading in lungs and oxygen consumption by tissues. Saturation is measured noninvasively by pulse oximetry, which uses differential light absorption by oxygenated vs deoxygenated hemoglobin.",
      "metaphor": "Like parking lot fullness - if 98 of 100 parking spots (hemoglobin sites) are filled with cars (oxygen molecules), your lot is 98% saturated, indicating healthy oxygen delivery capacity."
    }
  },
  {
    "id": "900.5.18",
    "mechanism": {
      "title": "Three-Layer Barrier",
      "content": "The respiratory membrane consists of the alveolar wall (simple squamous epithelium), fused basement membranes, and the capillary wall (endothelium). This three-layer structure is only 0.5 micrometers thick, minimizing diffusion distance for gases. Oxygen and CO2 cross all three layers rapidly following their partial pressure gradients.",
      "metaphor": "Like three sheets of tissue paper pressed together - air on one side, blood on the other, and only three impossibly thin layers between them allowing oxygen and CO2 to pass through almost instantly."
    }
  },
  {
    "id": "900.5.19",
    "mechanism": {
      "title": "Active Chest Expansion",
      "content": "Inspiration is the active phase of breathing where diaphragm contraction and external intercostal muscle contraction expand thoracic volume. This expansion decreases intrathoracic pressure below atmospheric pressure, creating a pressure gradient that drives air into the lungs. Quiet inspiration requires muscle work, while exhalation is typically passive elastic recoil.",
      "metaphor": "Like pulling the plunger on a syringe - your muscles actively expand your chest cavity, creating suction that pulls air in through your nose and mouth until pressures equalize."
    }
  },
  {
    "id": "900.5.20",
    "mechanism": {
      "title": "Chemical CO2 Shuttle",
      "content": "About 70% of CO2 is transported in blood as bicarbonate ions formed when CO2 combines with water catalyzed by carbonic anhydrase in red blood cells. This reaction (CO2 + H2O - H2CO3 - H+ + HCO3-) is reversed in lung capillaries, releasing CO2 for exhalation. Bicarbonate transport also serves as the major blood pH buffer system.",
      "metaphor": "Like dissolving sugar in coffee for transport - CO2 can't ride freely in blood plasma, so it dissolves into bicarbonate solution for the journey, then crystallizes back into gas when it reaches the lungs."
    }
  },
  {
    "id": "900.5.21",
    "mechanism": {
      "title": "Right Lung Tripartite",
      "content": "The right lung is divided into superior, middle, and inferior lobes by the horizontal and oblique fissures, while the left lung has only superior and inferior lobes. This asymmetry exists because the heart occupies more space on the left side of the thorax. The right lung is also slightly larger than the left, contributing about 55% of total lung capacity.",
      "metaphor": "Like a bookshelf where the right side has three shelves and the left has two - the heart acts like a bulky object on the left, leaving room for only two compartments instead of three."
    }
  },
  {
    "id": "900.5.22",
    "mechanism": {
      "title": "Lung Root Gateway",
      "content": "The hilum is the medial depression on each lung where the bronchi, pulmonary vessels, lymphatics, and nerves enter and exit, collectively forming the lung root. This is the only site where the visceral and parietal pleura are continuous. The hilum serves as the structural and vascular pedicle anchoring the lung within the thorax.",
      "metaphor": "Like the base of a tree trunk where all the roots meet - all the tubes (airways, blood vessels, nerves) that keep the lung alive bundle together at this single entry/exit point."
    }
  },
  {
    "id": "900.5.23",
    "mechanism": {
      "title": "Trapped Reserve Air",
      "content": "Residual volume (approximately 1200 mL) is the air remaining in lungs after maximal forced exhalation that cannot be voluntarily expelled. It keeps alveoli from collapsing completely and maintains some gas exchange even between breaths. Residual volume increases with age and in obstructive lung diseases as elastic recoil diminishes.",
      "metaphor": "Like the last bit of toothpaste you can never squeeze out - no matter how hard you exhale, your lungs keep about a liter of air trapped inside to prevent the alveoli from sticking shut."
    }
  },
  {
    "id": "900.5.24",
    "mechanism": {
      "title": "Mucus Factory Cells",
      "content": "Goblet cells are specialized columnar epithelial cells scattered throughout respiratory passages that synthesize and secrete mucus glycoproteins. Their mucus traps inhaled particles, pathogens, and debris, which are then swept toward the pharynx by ciliary action (mucociliary escalator). Goblet cell numbers increase in chronic inflammatory conditions, contributing to excessive mucus production.",
      "metaphor": "Like automated glue dispensers on an assembly line - these cells continuously pump out sticky mucus that acts as flypaper, trapping dust and bacteria before beating cilia sweep the whole mess upward to be swallowed or coughed out."
    }
  },
  {
    "id": "900.5.25",
    "mechanism": {
      "title": "Diffusion Rate Law",
      "content": "Fick's law states that the rate of gas diffusion across a membrane is proportional to surface area and partial pressure difference, and inversely proportional to membrane thickness and molecular weight. The respiratory membrane is optimized for rapid diffusion with enormous surface area (70 m2), minimal thickness (0.5 um), and steep pressure gradients. Diseases that thicken the membrane or reduce surface area impair gas exchange.",
      "metaphor": "Like water seeping through a paper towel faster when it's thin, wet, and has lots of area - gases cross your lung membrane quickest when the pressure difference is steep, the barrier is thin, and the contact zone is huge."
    }
  },
  {
    "id": "900.5.26",
    "mechanism": {
      "title": "Lung Air Prefix",
      "content": "The prefix pneumo- derives from Greek 'pneuma' meaning air, breath, or lung and appears in medical terms related to the respiratory system. Examples include pneumonia (lung inflammation), pneumothorax (air in pleural cavity), and pneumonectomy (lung removal). It distinguishes respiratory conditions from similar terms using 'pulmo-' (Latin for lung).",
      "metaphor": "Like how 'aqua-' signals water in words - when you see 'pneumo-', think lungs and air, whether it's pneumonia (lung infection), pneumothorax (collapsed lung), or pneumococcus (a lung bacterium)."
    }
  },
  {
    "id": "900.5.27",
    "mechanism": {
      "title": "Airway Tree Prefix",
      "content": "The prefix broncho- refers to the bronchi and bronchial tree, the branching airways that conduct air from trachea to alveoli. Terms include bronchitis (airway inflammation), bronchodilator (medication that widens airways), and bronchoscopy (visual examination of airways). It distinguishes airway-specific conditions from general lung or alveolar pathology.",
      "metaphor": "Like 'cardio-' points to the heart - 'broncho-' points specifically to the airway tubes, whether you're dilating them (bronchodilator), inflaming them (bronchitis), or scoping them (bronchoscopy)."
    }
  },
  {
    "id": "900.5.28",
    "mechanism": {
      "title": "Breathing Suffix",
      "content": "The suffix -pnea means breathing or respiration, derived from Greek 'pnoia.' It combines with prefixes to describe breathing patterns: dyspnea (difficult), tachypnea (rapid), bradypnea (slow), apnea (absent), orthopnea (difficulty when lying flat). The suffix allows precise clinical description of respiratory abnormalities.",
      "metaphor": "Like '-ology' means study of - '-pnea' means breathing, so you can decode medical terms: tachy-pnea is fast-breathing, brady-pnea is slow-breathing, and a-pnea is no-breathing."
    }
  },
  {
    "id": "900.5.29",
    "mechanism": {
      "title": "Tissue Oxygen Starvation",
      "content": "Hypoxia is inadequate oxygen delivery to tissues despite potentially normal blood oxygen levels, caused by low oxygen content, poor perfusion, or impaired cellular uptake. Cells switch to less efficient anaerobic metabolism, producing lactate and triggering compensatory responses like increased ventilation and heart rate. Severe hypoxia causes organ dysfunction and cell death.",
      "metaphor": "Like a town where grocery delivery trucks (blood) might be full but roads are blocked - tissues starve for oxygen even if your lungs are working fine, because the oxygen can't reach cells that desperately need it."
    }
  },
  {
    "id": "900.5.30",
    "mechanism": {
      "title": "CO2 Blood Buildup",
      "content": "Hypercapnia is elevated arterial CO2 (PaCO2 > 45 mmHg) resulting from inadequate alveolar ventilation relative to CO2 production. It causes respiratory acidosis as CO2 combines with water to form carbonic acid, lowering blood pH. Symptoms include headache, confusion, and dyspnea, while severe hypercapnia can cause CO2 narcosis and respiratory failure.",
      "metaphor": "Like trash piling up when garbage trucks stop running - your blood becomes a toxic dump of CO2 waste when breathing can't keep pace with cellular production, poisoning your system with acid."
    }
  },
  {
    "id": "900.5.31",
    "mechanism": {
      "title": "Blue Skin Oxygen Sign",
      "content": "Cyanosis is bluish discoloration of skin and mucous membranes caused by elevated deoxygenated hemoglobin (>5 g/dL) in capillary blood. It appears first in areas with thin skin and high blood flow like lips, tongue, and nail beds. Central cyanosis indicates low arterial oxygen saturation, while peripheral cyanosis reflects sluggish local blood flow.",
      "metaphor": "Like how a blue tint appears when you hold your breath underwater - deoxygenated blood looks bluish-purple through skin, signaling that hemoglobin is running around without its oxygen cargo."
    }
  },
  {
    "id": "900.5.32",
    "mechanism": {
      "title": "Rapid Breathing Rate",
      "content": "Tachypnea is abnormally rapid breathing rate (>20 breaths/min in adults) that may or may not involve increased tidal volume. It compensates for hypoxia, hypercapnia, metabolic acidosis, or increased metabolic demand like fever or exercise. Unlike hyperventilation, tachypnea doesn't necessarily cause hypocapnia and respiratory alkalosis.",
      "metaphor": "Like a dog panting on a hot day - quick, shallow breaths that move air rapidly without necessarily taking bigger gulps, often triggered by oxygen need or body heat rather than conscious control."
    }
  },
  {
    "id": "900.5.33",
    "mechanism": {
      "title": "Slow Breathing Rate",
      "content": "Bradypnea is abnormally slow breathing rate (<12 breaths/min in adults) that can result from respiratory center depression by drugs, brain injury, or metabolic alkalosis. Slow breathing reduces minute ventilation, potentially causing hypercapnia and respiratory acidosis. It contrasts with normal sleep-related breathing rate reduction.",
      "metaphor": "Like a clock running in slow motion - your breathing drops below normal pace, often from sedatives or brain injury suppressing the automatic breathing centers, risking CO2 buildup."
    }
  },
  {
    "id": "900.5.34",
    "mechanism": {
      "title": "Upright-Only Breathing",
      "content": "Orthopnea is dyspnea that occurs or worsens when lying flat and is relieved by sitting or standing upright. It results from increased venous return and pulmonary blood volume in recumbent position, worsening pulmonary congestion in heart failure. Patients often sleep propped on multiple pillows to maintain an upright position.",
      "metaphor": "Like a flood that only happens in low-lying areas - when you lie down, extra blood pools in your lungs like water collecting in a valley, making breathing harder until you sit upright and drain the excess."
    }
  },
  {
    "id": "900.5.35",
    "mechanism": {
      "title": "Excess Ventilation Blowoff",
      "content": "Hyperventilation is breathing in excess of metabolic needs, lowering arterial CO2 (hypocapnia) and causing respiratory alkalosis. It can be triggered by anxiety, pain, hypoxia, or voluntary overbreathing. Low CO2 causes cerebral vasoconstriction (dizziness), increased neuromuscular excitability (tingling, tetany), and shifts the oxygen-hemoglobin dissociation curve leftward.",
      "metaphor": "Like over-ventilating a room until it's too cold - breathing too much blows off CO2 faster than cells produce it, making blood alkaline and triggering tingling sensations like your body's complaining about the imbalance."
    }
  },
  {
    "id": "900.5.36",
    "mechanism": {
      "title": "Shallow Breathing Crisis",
      "content": "Hypoventilation occurs when alveolar ventilation is insufficient to remove CO2 produced by metabolism, causing respiratory acidosis. The reduced minute ventilation means CO2 accumulates faster than it can be exhaled, raising arterial PCO2 above 45 mmHg.",
      "metaphor": "Like a fireplace with a blocked chimney - the smoke (CO2) keeps building up because the ventilation system can't clear it fast enough."
    }
  },
  {
    "id": "900.5.37",
    "mechanism": {
      "title": "Pressure-Volume Seesaw",
      "content": "Boyle's Law states that at constant temperature, gas pressure and volume are inversely related (P1V1 = P2V2). During inspiration, thoracic volume increases which decreases pressure, causing air to flow into the lungs down its pressure gradient.",
      "metaphor": "Like a bicycle pump in reverse - pull the plunger out (increase volume) and pressure inside drops, sucking air in."
    }
  },
  {
    "id": "900.5.38",
    "mechanism": {
      "title": "Pressure Drives Dissolution",
      "content": "Henry's Law states that the amount of gas dissolving in liquid is directly proportional to its partial pressure above the liquid. Higher alveolar PO2 drives more oxygen into solution in blood plasma, where it can bind to hemoglobin.",
      "metaphor": "Like carbonation in soda - higher CO2 pressure forces more gas to dissolve in the liquid; open the cap (drop pressure) and bubbles escape."
    }
  },
  {
    "id": "900.5.39",
    "mechanism": {
      "title": "Independent Gas Pressures",
      "content": "Dalton's Law states that total gas pressure equals the sum of partial pressures of individual gases (Ptotal = PO2 + PCO2 + PN2 + ...). Each gas exerts pressure independently proportional to its percentage in the mixture.",
      "metaphor": "Like roommates sharing rent - each person contributes their portion independently, and all portions add up to the total bill."
    }
  },
  {
    "id": "900.5.40",
    "mechanism": {
      "title": "Sea Level Oxygen",
      "content": "At sea level with atmospheric pressure of 760 mmHg, oxygen comprises 21% of dry air, giving a partial pressure of approximately 159 mmHg (0.21 x 760). This is the driving pressure for oxygen diffusion into the respiratory system.",
      "metaphor": "Like the water pressure at the top of a fountain - this is the starting pressure that drives the entire cascade downward into the lungs."
    }
  },
  {
    "id": "900.5.41",
    "mechanism": {
      "title": "Diluted By Humidity",
      "content": "Alveolar PO2 drops to ~104 mmHg because inspired air is humidified (adding water vapor pressure of 47 mmHg) and mixes with residual alveolar gas containing CO2. The alveolar gas equation accounts for this dilution effect.",
      "metaphor": "Like adding ice to a drink - the original concentration gets diluted by the added water (vapor) and leftover liquid (residual gas) from the last sip."
    }
  },
  {
    "id": "900.5.42",
    "mechanism": {
      "title": "CO2 Set Point",
      "content": "Arterial PCO2 is tightly regulated at ~40 mmHg by chemoreceptors that adjust ventilation rate. This balance represents equilibrium between metabolic CO2 production (~200 mL/min) and alveolar elimination.",
      "metaphor": "Like a thermostat maintaining room temperature - sensors constantly measure the level and adjust the ventilation fan to keep it at the set point."
    }
  },
  {
    "id": "900.5.43",
    "mechanism": {
      "title": "Rightward Release Signal",
      "content": "The oxygen-hemoglobin dissociation curve shifts right when tissues need more O2 (increased temperature, CO2, H+, or 2,3-BPG). This decreases hemoglobin's affinity for oxygen, promoting release to metabolically active tissues.",
      "metaphor": "Like loosening your grip on a package when it gets hot - the cargo (O2) becomes easier to release exactly when the recipient (tissues) needs it most."
    }
  },
  {
    "id": "900.5.44",
    "mechanism": {
      "title": "Deoxygenation Helps Loading",
      "content": "The Haldane effect describes how deoxygenated hemoglobin binds CO2 and H+ more readily than oxygenated hemoglobin. In tissues, as O2 unloads, Hb's increased affinity for CO2 facilitates waste removal; in lungs, O2 loading promotes CO2 release.",
      "metaphor": "Like a two-door elevator - as passengers (O2) exit one door in tissues, it creates room for waste (CO2) to enter the other door; reverse happens in lungs."
    }
  },
  {
    "id": "900.5.45",
    "mechanism": {
      "title": "Chloride-Bicarbonate Swap",
      "content": "As CO2 enters RBCs and converts to bicarbonate (HCO3-), the bicarbonate exits to plasma while chloride (Cl-) enters to maintain electrical neutrality. This chloride shift enables buffering of CO2 without changing RBC charge balance.",
      "metaphor": "Like a store exchange policy - as bicarbonate leaves the cell (returns product), chloride enters (replacement item) to keep the charge balance sheet even."
    }
  },
  {
    "id": "900.5.46",
    "mechanism": {
      "title": "Direct CO2 Binding",
      "content": "About 5-10% of CO2 binds directly to amino groups on hemoglobin forming carbaminohemoglobin, without requiring conversion to bicarbonate. Deoxygenated hemoglobin binds CO2 more readily than oxygenated form (Haldane effect).",
      "metaphor": "Like a taxi with a bike rack - some cargo (CO2) attaches directly to the outside of the vehicle (hemoglobin) rather than going through the trunk (bicarbonate conversion)."
    }
  },
  {
    "id": "900.5.47",
    "mechanism": {
      "title": "CO2 Conversion Catalyst",
      "content": "Carbonic anhydrase in RBCs catalyzes the reversible reaction CO2 + H2O - H2CO3 - H+ + HCO3-, accelerating it ~5000-fold. This enzyme is essential for efficient CO2 transport as bicarbonate (~70% of total CO2).",
      "metaphor": "Like an assembly line supervisor - speeds up the conversion process thousands of times faster than workers (molecules) could manage on their own."
    }
  },
  {
    "id": "900.5.48",
    "mechanism": {
      "title": "Conducting Zone Volume",
      "content": "Anatomical dead space (~150 mL) is the volume of airways that conduct air but don't participate in gas exchange (nose to terminal bronchioles). This means the first 150 mL of each breath is wasted air from the last exhalation.",
      "metaphor": "Like the pipes leading to a shower - water sits in the plumbing doing nothing useful until it reaches the showerhead (alveoli) where it actually works."
    }
  },
  {
    "id": "900.5.49",
    "mechanism": {
      "title": "Resting Air Reserve",
      "content": "FRC (~2400 mL) is the volume remaining in lungs at the end of passive exhalation, where inward elastic recoil equals outward chest wall tension. This reservoir prevents alveolar collapse and provides oxygen between breaths.",
      "metaphor": "Like a emergency generator battery - maintains a baseline charge (gas volume) between power cycles (breaths) so the system never fully shuts down."
    }
  },
  {
    "id": "900.5.50",
    "mechanism": {
      "title": "Maximum Lung Volume",
      "content": "TLC (~6000 mL in adult males) is the volume in lungs after maximum inspiration, limited by chest wall and respiratory muscle strength. It represents the sum of all lung volumes: vital capacity plus residual volume.",
      "metaphor": "Like filling a balloon to its absolute maximum - you can't add more air because the elastic limits of the container (thorax and lungs) have been reached."
    }
  },
  {
    "id": "900.5.51",
    "mechanism": {
      "title": "Stretchability Coefficient",
      "content": "Compliance (dV/dP) measures how easily lungs expand per unit pressure change, typically ~200 mL/cm H2O. High compliance means lungs inflate easily; low compliance requires more work to breathe.",
      "metaphor": "Like comparing a balloon to a tire - the balloon (high compliance) expands easily with a little puff, while the tire (low compliance) needs a pump."
    }
  },
  {
    "id": "900.5.52",
    "mechanism": {
      "title": "Floppy Lungs Paradox",
      "content": "Emphysema destroys alveolar walls and elastic fibers, increasing compliance - lungs inflate too easily but don't recoil well during expiration. Patients have hyperinflation, air trapping, and must actively force air out.",
      "metaphor": "Like an overstretched sweater - it's easy to pull on (inflate) but won't spring back to shape (deflate) because the elastic fibers are destroyed."
    }
  },
  {
    "id": "900.5.53",
    "mechanism": {
      "title": "Stiff Lung Syndrome",
      "content": "Pulmonary fibrosis deposits collagen in lung tissue, decreasing compliance - lungs become stiff and require greater pressure to inflate. Patients have restrictive disease with reduced lung volumes and rapid, shallow breathing.",
      "metaphor": "Like trying to inflate a leather bag instead of a paper bag - the stiff material resists expansion, requiring much more effort to breathe."
    }
  },
  {
    "id": "900.5.54",
    "mechanism": {
      "title": "Diaphragm Power Cable",
      "content": "The phrenic nerve (C3, C4, C5) innervates the diaphragm, the primary muscle of respiration. Spinal injury above C3 causes respiratory failure because the diaphragm can't contract; 'C3-4-5 keeps the diaphragm alive.'",
      "metaphor": "Like the power cord to your refrigerator - if the connection is severed above the plug (C3), the whole appliance (breathing) shuts down."
    }
  },
  {
    "id": "900.5.55",
    "mechanism": {
      "title": "Ribcage Elevator Muscles",
      "content": "External intercostals run downward and forward between ribs; when they contract, they lift the ribcage up and out, increasing thoracic volume for inspiration. They work synergistically with the diaphragm during normal breathing.",
      "metaphor": "Like bucket handles lifting up and out - pulling the handles (ribs) upward increases the bucket's (thorax's) capacity."
    }
  },
  {
    "id": "900.5.56",
    "mechanism": {
      "title": "Active Exhalation Muscles",
      "content": "Internal intercostals run upward and forward; they pull ribs downward and inward, decreasing thoracic volume during forced expiration (exercise, coughing). Normal quiet breathing doesn't require their active contraction.",
      "metaphor": "Like squeezing a accordion closed - these muscles actively compress the bellows (ribcage) to force air out faster than passive recoil alone."
    }
  },
  {
    "id": "900.5.57",
    "mechanism": {
      "title": "Gas Exchange Pavement",
      "content": "Type I pneumocytes cover ~95% of alveolar surface area with extremely thin squamous cells (~0.2 um thick), optimized for rapid gas diffusion. Their large surface area and minimal thickness minimize diffusion distance.",
      "metaphor": "Like saran wrap stretched over a bowl - incredibly thin coverage (cells) that lets gas pass through easily while keeping structure intact."
    }
  },
  {
    "id": "900.5.58",
    "mechanism": {
      "title": "Surfactant Factories",
      "content": "Type II pneumocytes (~5% of surface area) are cuboidal cells that secrete pulmonary surfactant, which reduces surface tension to prevent alveolar collapse. They also serve as progenitor cells that can differentiate into Type I cells.",
      "metaphor": "Like soap dispensers in a bubble-blowing kit - they produce the special liquid (surfactant) that keeps bubbles (alveoli) from popping."
    }
  },
  {
    "id": "900.5.59",
    "mechanism": {
      "title": "Lung Cleanup Crew",
      "content": "Alveolar macrophages patrol the alveolar surface, phagocytosing inhaled particles, bacteria, and debris. They migrate up the mucociliary escalator or into lymphatics, keeping the gas exchange surface clean.",
      "metaphor": "Like Roomba vacuum robots - constantly patrolling the floor (alveolar surface) to clean up dust and dirt particles before they cause problems."
    }
  },
  {
    "id": "900.5.60",
    "mechanism": {
      "title": "Mucus Conveyor Belt",
      "content": "Cilia on respiratory epithelium beat in coordinated waves (~12 Hz) to propel a mucus layer upward toward the pharynx at ~1-2 cm/minute. This escalator traps and removes inhaled particles before they reach alveoli.",
      "metaphor": "Like a airport moving walkway with sticky floor - the constantly moving belt (beating cilia) carries luggage (trapped particles) up and out of the terminal."
    }
  },
  {
    "id": "900.5.61",
    "mechanism": {
      "title": "Reversible Airway Squeeze",
      "content": "Asthma causes reversible bronchospasm, inflammation, and mucus hypersecretion triggered by allergens, exercise, or irritants. Smooth muscle contraction narrows airways (wheezing), but responds to bronchodilators unlike fixed obstructions.",
      "metaphor": "Like a garden hose someone is squeezing - the blockage (bronchospasm) can be relieved by letting go (bronchodilators), unlike a kink (structural damage)."
    }
  },
  {
    "id": "900.5.62",
    "mechanism": {
      "title": "Permanent Airflow Block",
      "content": "COPD combines emphysema (alveolar destruction, loss of elastic recoil) with chronic bronchitis (airway inflammation, mucus hypersecretion). This creates irreversible airflow limitation, unlike asthma which is reversible.",
      "metaphor": "Like a collapsed and clogged storm drain - both the structure is damaged (emphysema) and debris blocks flow (chronic bronchitis), making obstruction permanent."
    }
  },
  {
    "id": "900.5.63",
    "mechanism": {
      "title": "Alveolar Wall Demolition",
      "content": "Emphysema results from destruction of alveolar walls and elastic fibers, usually by smoking-induced protease-antiprotease imbalance. Loss of alveoli reduces surface area for gas exchange and eliminates elastic recoil needed for passive expiration.",
      "metaphor": "Like removing walls between rooms in a house - you get a bigger open space (air trapping) but lose structural support and functional compartments (gas exchange surface)."
    }
  },
  {
    "id": "900.5.64",
    "mechanism": {
      "title": "Three Month Cough Rule",
      "content": "Chronic bronchitis is clinically defined as productive cough for at least 3 months per year for 2 consecutive years, without other cause. Smoking triggers goblet cell hyperplasia and chronic airway inflammation.",
      "metaphor": "Like a factory with overactive production lines - the mucus-making cells (goblet cells) work overtime for months, clogging the facility with excess product."
    }
  },
  {
    "id": "900.5.65",
    "mechanism": {
      "title": "Flooded Alveoli",
      "content": "Pulmonary edema occurs when fluid leaks from capillaries into alveolar spaces due to increased hydrostatic pressure (heart failure) or increased permeability (ARDS, toxins). Fluid impairs gas diffusion causing hypoxemia.",
      "metaphor": "Like a basement flooding - water (fluid) fills the living space (alveoli) where it doesn't belong, making the room unusable for its intended purpose (gas exchange)."
    }
  },
  {
    "id": "900.5.66",
    "mechanism": {
      "title": "Circulation Roadblock",
      "content": "Pulmonary embolism occurs when a blood clot (usually from deep leg veins) lodges in pulmonary arteries, blocking blood flow. This creates ventilation-perfusion mismatch - ventilated alveoli receive no blood for gas exchange.",
      "metaphor": "Like a truck jackknifed on a highway - traffic (blood) backs up behind the obstruction while downstream lanes (alveoli) sit empty despite being open."
    }
  },
  {
    "id": "900.5.67",
    "mechanism": {
      "title": "Alveolar Infection Battle",
      "content": "Pneumonia is infection of lung parenchyma causing alveoli to fill with inflammatory exudate (neutrophils, fibrin, fluid). Consolidation impairs gas exchange and appears as opacification on chest X-ray.",
      "metaphor": "Like a sponge soaked with glue - the normally air-filled pores (alveoli) become packed with sticky debris (exudate), losing their ability to function."
    }
  },
  {
    "id": "900.5.68",
    "mechanism": {
      "title": "Apical Oxygen Preference",
      "content": "Mycobacterium tuberculosis preferentially infects lung apices because they have higher oxygen tension (PO2) due to better ventilation-perfusion ratio. The obligate aerobe thrives in this oxygen-rich environment.",
      "metaphor": "Like mold growing on the top shelf - the organism prefers the well-ventilated upper area where oxygen (its preferred nutrient) is most abundant."
    }
  },
  {
    "id": "900.5.69",
    "mechanism": {
      "title": "Bronchial Ballooning Disease",
      "content": "Bronchiectasis is irreversible bronchial dilation from chronic infection or obstruction that destroys airway walls. Widened airways trap mucus, creating a vicious cycle of infection, inflammation, and further damage.",
      "metaphor": "Like a balloon stretched too many times - the airways lose their elastic structure and stay permanently widened, becoming pooling sites for fluid (mucus) and bacteria."
    }
  },
  {
    "id": "900.5.70",
    "mechanism": {
      "title": "Thick Mucus Genetics",
      "content": "Cystic fibrosis results from CFTR gene mutations causing defective chloride channels. Decreased chloride and water secretion produces abnormally thick, sticky mucus that obstructs airways, traps bacteria, and causes chronic lung infections.",
      "metaphor": "Like replacing WD-40 with peanut butter in a lock - the thickened lubricant (mucus) clogs the mechanism (airways) instead of keeping it clean and moving smoothly."
    }
  },
  {
    "id": "900.5.71",
    "mechanism": {
      "title": "Obstructive Sleep Apnea",
      "content": "During sleep, throat muscles relax excessively, causing the airway to collapse intermittently. Each blockage triggers oxygen desaturation until the brain briefly arouses to restore breathing, fragmenting sleep architecture.",
      "metaphor": "Like a garden hose that gets kinked when you lay it down - water stops flowing until you shake it straight again, but it keeps happening all night."
    }
  },
  {
    "id": "900.5.72",
    "mechanism": {
      "title": "Stretch-Activated Safety Brake",
      "content": "Pulmonary stretch receptors detect when lungs reach near-maximal inflation and send inhibitory signals via the vagus nerve to the medullary respiratory center. This negative feedback prevents overinflation damage by terminating inspiration early.",
      "metaphor": "Like a pressure relief valve on a tire pump - when the tire is full enough, the valve automatically stops more air from being forced in."
    }
  },
  {
    "id": "900.5.73",
    "mechanism": {
      "title": "Brainstem pH Sensors",
      "content": "Specialized neurons in the medulla monitor hydrogen ion concentration in cerebrospinal fluid. Rising CO2 diffuses across the blood-brain barrier, forms carbonic acid, lowers CSF pH, and triggers increased ventilation to restore normal levels.",
      "metaphor": "Like a smoke detector in the basement of your house - it senses the earliest warning signs (acid buildup) before the problem spreads upstairs."
    }
  },
  {
    "id": "900.5.74",
    "mechanism": {
      "title": "Arterial Oxygen Sentries",
      "content": "Chemoreceptor cells in the carotid and aortic bodies continuously sample arterial blood for oxygen, CO2, and pH. When oxygen drops below 60 mmHg, they fire rapidly along cranial nerves IX and X to stimulate breathing.",
      "metaphor": "Like border guards stationed at critical checkpoints - they constantly monitor what's passing through and sound the alarm when oxygen cargo runs dangerously low."
    }
  },
  {
    "id": "900.5.75",
    "mechanism": {
      "title": "CO2 Drives Breathing",
      "content": "Under normal conditions, rising arterial CO2 (not low oxygen) is the primary driver of ventilation. CO2 forms carbonic acid, lowering blood pH, which central and peripheral chemoreceptors detect to increase respiratory drive.",
      "metaphor": "Like a thermostat that responds to heat buildup rather than cold - your body cares more about getting rid of CO2 waste than about oxygen shortage (until oxygen gets critically low)."
    }
  },
  {
    "id": "900.5.76",
    "mechanism": {
      "title": "Waxing-Waning Breathing Cycles",
      "content": "Cheyne-Stokes breathing features rhythmic crescendo-decrescendo tidal volumes separated by apneic pauses. It occurs when circulation delays between lungs and chemoreceptors cause oscillating feedback, common in heart failure or high altitude.",
      "metaphor": "Like adjusting shower temperature with a long delay between the knob and the water - you overshoot hot, then cold, creating cycles because you can't feel the change immediately."
    }
  },
  {
    "id": "900.5.77",
    "mechanism": {
      "title": "Deep Acidosis Breathing",
      "content": "Severe metabolic acidosis triggers deep, rapid, labored breathing as the body attempts respiratory compensation. By hyperventilating, CO2 is blown off to shift blood pH toward normal despite excess metabolic acids.",
      "metaphor": "Like opening all windows and running fans on high to clear smoke from a house - the lungs work overtime to exhaust acid (CO2) when the body is overwhelmed by metabolic waste."
    }
  },
  {
    "id": "900.5.78",
    "mechanism": {
      "title": "Chaotic Breathing Pattern",
      "content": "Biot's breathing shows irregular depth and rhythm with unpredictable apneic periods, indicating severe brainstem damage affecting the medullary respiratory center. The normal coordinated breathing pattern disintegrates into random, ineffective cycles.",
      "metaphor": "Like a broken metronome that ticks erratically - sometimes fast, sometimes slow, sometimes stopping - because the internal timing mechanism is damaged beyond reliable function."
    }
  },
  {
    "id": "900.5.79",
    "mechanism": {
      "title": "Popping Airway Sounds",
      "content": "Crackles (rales) are discontinuous popping sounds heard when collapsed small airways or alveoli suddenly snap open during inspiration. Fluid, pus, or exudate in the airways creates surface tension that must be overcome, producing audible pops.",
      "metaphor": "Like pulling apart Velcro or stepping on bubble wrap - the sticky surfaces resist separating until enough pressure builds, then they suddenly release with a popping sound."
    }
  },
  {
    "id": "900.5.80",
    "mechanism": {
      "title": "High-Pitched Airway Whistling",
      "content": "Wheezing occurs when airflow accelerates through narrowed bronchioles, causing airway walls to vibrate at high frequency. Bronchoconstriction, mucus, or edema reduces airway diameter, creating the musical whistling sound typically on expiration.",
      "metaphor": "Like blowing air through pursed lips or a narrow gap in a balloon - the smaller the opening, the higher pitched the whistle as air rushes through."
    }
  },
  {
    "id": "900.5.81",
    "mechanism": {
      "title": "Upper Airway Turbulence",
      "content": "Stridor is a harsh, high-pitched sound caused by turbulent airflow through a significantly narrowed trachea or larynx. The obstruction creates audible noise during inspiration as air is forcefully drawn through the constricted upper airway.",
      "metaphor": "Like a drinking straw that's partially crushed - the narrower it gets, the louder the slurping sound becomes as you try to suck liquid through the pinched section."
    }
  },
  {
    "id": "900.5.82",
    "mechanism": {
      "title": "Rubbing Inflamed Membranes",
      "content": "When pleural inflammation roughens the normally smooth pleural surfaces, the visceral and parietal layers scrape against each other during breathing. This creates a grating, creaking sound synchronous with respiration that disappears if pleural effusion develops to separate the layers.",
      "metaphor": "Like two pieces of sandpaper rubbing together - the roughened surfaces create friction noise with every movement until you pour oil (fluid) between them to lubricate the interface."
    }
  },
  {
    "id": "900.5.83",
    "mechanism": {
      "title": "Transmitted Voice Clarity",
      "content": "Bronchophony tests how clearly spoken sounds transmit through lung tissue. Consolidated lung (pneumonia) conducts sound better than normal air-filled lung, making whispered words unusually clear and loud through the stethoscope.",
      "metaphor": "Like how you hear better through a solid wall versus air - dense lung tissue conducts sound waves more efficiently, amplifying the voice like a megaphone."
    }
  },
  {
    "id": "900.5.84",
    "mechanism": {
      "title": "Voice Frequency Shift",
      "content": "Egophony occurs when consolidated or compressed lung tissue selectively filters out lower voice frequencies while amplifying higher ones. When patients say 'E', the transmitted sound is heard as a nasal 'A' through the stethoscope due to this acoustic filtering.",
      "metaphor": "Like talking through a kazoo - the instrument filters and transforms your voice by selectively amplifying certain frequencies and dampening others, changing the sound quality."
    }
  },
  {
    "id": "900.5.85",
    "mechanism": {
      "title": "One-Second Blast Volume",
      "content": "FEV1 measures how much air you can forcefully exhale in the first second after a maximal inhalation. It reflects airway resistance and elastic recoil - obstructed airways reduce FEV1 because air can't escape quickly despite maximal effort.",
      "metaphor": "Like squeezing a water bottle as hard as you can and measuring how much shoots out in one second - a narrow opening limits flow no matter how hard you squeeze."
    }
  },
  {
    "id": "900.5.86",
    "mechanism": {
      "title": "Obstruction Ratio Marker",
      "content": "In obstructive diseases, airways narrow but total lung capacity often remains normal or increases. This reduces FEV1 more than FVC, lowering the FEV1/FVC ratio below 70%. Air gets trapped behind narrowed passages, taking longer to exhale completely.",
      "metaphor": "Like a funnel with a clogged neck - the total container size (FVC) is normal, but only a trickle gets out quickly (FEV1), so the ratio of fast-to-total flow drops."
    }
  },
  {
    "id": "900.5.87",
    "mechanism": {
      "title": "Stiff Lung Constraint",
      "content": "Restrictive diseases reduce lung compliance, making lungs harder to expand. Both FEV1 and FVC decrease proportionally, so the FEV1/FVC ratio remains normal or elevated. The lungs simply can't hold as much air, but what's there empties normally.",
      "metaphor": "Like a smaller water balloon versus a clogged one - both the total capacity and one-second flow decrease together, keeping their ratio normal because the problem is size, not drainage speed."
    }
  },
  {
    "id": "900.5.88",
    "mechanism": {
      "title": "Maximal Flow Speed",
      "content": "Peak expiratory flow rate measures the fastest airflow velocity during a forced exhalation. It's effort-dependent and reflects large airway caliber - useful for monitoring asthma because bronchoconstriction immediately reduces peak flow even before symptoms appear.",
      "metaphor": "Like measuring your car's top speed - it tells you if the engine (airways) is running freely or if something's restricting maximum performance, even if cruising seems fine."
    }
  },
  {
    "id": "900.5.89",
    "mechanism": {
      "title": "Light-Based Oxygen Detector",
      "content": "Pulse oximetry shines red and infrared light through tissue to measure oxygen saturation. Oxygenated hemoglobin absorbs different wavelengths than deoxygenated hemoglobin, and the ratio of transmitted light calculates SpO2 percentage non-invasively.",
      "metaphor": "Like holding a flashlight behind your hand - red blood looks different than blue blood when light passes through, so the device can tell how much oxygen is loaded just by analyzing the color."
    }
  },
  {
    "id": "900.5.90",
    "mechanism": {
      "title": "Direct Blood Chemistry",
      "content": "Arterial blood gas analysis directly measures pH, PaCO2, PaO2, and bicarbonate from arterial blood. This reveals respiratory function, acid-base balance, and oxygenation status simultaneously, providing the gold standard for assessing gas exchange and metabolic state.",
      "metaphor": "Like taking a water sample directly from the source rather than trusting sensor readings - you get exact chemical concentrations instead of indirect estimates."
    }
  },
  {
    "id": "900.5.91",
    "mechanism": {
      "title": "CO2 Retention Acidosis",
      "content": "Respiratory acidosis occurs when ventilation fails to eliminate CO2 adequately. Rising arterial CO2 combines with water to form carbonic acid, lowering blood pH. Causes include airway obstruction, respiratory depression, or lung disease impairing gas exchange.",
      "metaphor": "Like a car running in a closed garage - the exhaust (CO2) builds up because it can't escape, making the air (blood) increasingly toxic and acidic."
    }
  },
  {
    "id": "900.5.92",
    "mechanism": {
      "title": "CO2 Depletion Alkalosis",
      "content": "Respiratory alkalosis results from hyperventilation that eliminates CO2 faster than it's produced. Decreased arterial CO2 reduces carbonic acid formation, raising blood pH. Common causes include anxiety, pain, hypoxia, or excessive mechanical ventilation.",
      "metaphor": "Like over-ventilating a room in winter - you blow out so much warm air (CO2) that the environment becomes too cold (alkaline) for comfort."
    }
  },
  {
    "id": "900.5.93",
    "mechanism": {
      "title": "Lung Tissue Feeders",
      "content": "Bronchial arteries branch from the aorta to supply oxygenated blood to lung tissue itself (airways, pleura, lymph nodes). This systemic circulation nourishes the structural components of the lungs, separate from pulmonary circulation that handles gas exchange.",
      "metaphor": "Like the electrical wiring that powers a factory versus the assembly line inside - bronchial arteries keep the building (lung tissue) running, while pulmonary vessels do the actual product work (gas exchange)."
    }
  },
  {
    "id": "900.5.94",
    "mechanism": {
      "title": "Deoxygenated Blood Delivery",
      "content": "Pulmonary arteries carry deoxygenated blood from the right ventricle to the lungs for gas exchange. Despite being arteries, they contain venous (oxygen-poor) blood - the only arteries in the body with this unique characteristic.",
      "metaphor": "Like a delivery truck bringing dirty laundry to the cleaners - even though it's an 'artery' (truck making deliveries), it's carrying waste (deoxygenated blood) instead of fresh goods."
    }
  },
  {
    "id": "900.5.95",
    "mechanism": {
      "title": "Oxygenated Blood Return",
      "content": "Pulmonary veins transport freshly oxygenated blood from the lungs back to the left atrium. These are the only veins in the body carrying oxygen-rich blood, completing the pulmonary circulation loop before blood enters systemic circulation.",
      "metaphor": "Like trucks returning from the cleaners with fresh laundry - even though they're 'veins' (return vehicles), they carry the cleaned product (oxygenated blood) back to be distributed."
    }
  },
  {
    "id": "900.5.96",
    "mechanism": {
      "title": "Optimized Gas Exchange",
      "content": "V/Q matching balances ventilation (airflow) with perfusion (blood flow) in each lung region. Gravity and local regulation ensure well-ventilated alveoli receive more blood flow while poorly ventilated areas get less, maximizing oxygen uptake efficiency.",
      "metaphor": "Like routing delivery trucks to stores that have merchandise - it's wasteful to send trucks (blood) to empty warehouses (unventilated alveoli), so the system directs flow where goods (oxygen) are actually available."
    }
  },
  {
    "id": "900.5.97",
    "mechanism": {
      "title": "Local Oxygen Diversion",
      "content": "When alveolar oxygen levels drop, nearby pulmonary arterioles constrict to redirect blood away from poorly ventilated regions toward better-oxygenated areas. This local reflex optimizes V/Q matching by reducing perfusion to hypoxic zones.",
      "metaphor": "Like traffic automatically diverting from a congested highway exit - blood flow redirects away from oxygen-poor neighborhoods toward areas where oxygen loading is more efficient."
    }
  },
  {
    "id": "900.5.98",
    "mechanism": {
      "title": "Alveolar Collapse Cascade",
      "content": "Atelectasis occurs when alveoli collapse due to airway obstruction, external compression, or surfactant deficiency. Collapsed units can't participate in gas exchange, creating shunt (perfusion without ventilation) and reducing overall oxygenation.",
      "metaphor": "Like empty grocery bags collapsing flat when not held open - without internal air pressure or structural support (surfactant), the delicate alveolar walls stick together and collapse."
    }
  },
  {
    "id": "900.5.99",
    "mechanism": {
      "title": "Premature Surfactant Shortage",
      "content": "Infant respiratory distress syndrome occurs when premature babies lack sufficient pulmonary surfactant, which normally reduces alveolar surface tension. Without surfactant, alveoli collapse on expiration and require enormous effort to re-expand, causing progressive atelectasis and hypoxemia.",
      "metaphor": "Like trying to inflate a balloon coated with glue on the inside - the walls stick together and resist opening, requiring much more force than a normal balloon with slippery surfaces."
    }
  },
  {
    "id": "900.5.100",
    "mechanism": {
      "title": "Coughing Blood Source",
      "content": "Hemoptysis indicates bleeding from the respiratory tract, ranging from bronchial irritation to serious causes like tuberculosis, cancer, or pulmonary embolism. Blood-streaked sputum suggests airway inflammation, while frank blood indicates vessel damage or erosion.",
      "metaphor": "Like seeing red water coming from your faucet - it means there's a break or leak somewhere in the plumbing system upstream, requiring investigation to find the source."
    }
  },
  {
    "id": "900.5.101",
    "mechanism": {
      "title": "Nose-Related Term Prefix",
      "content": "The prefix 'rhino-' derives from Greek 'rhis' meaning nose. It appears in medical terms like rhinitis (nasal inflammation), rhinoplasty (nose surgery), and rhinorrhea (runny nose), identifying conditions or procedures involving nasal structures.",
      "metaphor": "Like 'hydro-' always means water - when you see 'rhino-' at the start of a medical word, you immediately know it's talking about something nose-related."
    }
  },
  {
    "id": "900.5.102",
    "mechanism": {
      "title": "Inflamed Throat Lining",
      "content": "Pharyngitis involves inflammation of the pharynx (throat), usually caused by viral or bacterial infection. Inflamed tissue becomes red, swollen, and painful, with increased mucus production and potential exudate formation on the pharyngeal walls.",
      "metaphor": "Like the inside of your mouth after burning it with hot pizza - the tissue becomes red, swollen, painful, and produces extra saliva to try to heal the damage."
    }
  },
  {
    "id": "900.5.103",
    "mechanism": {
      "title": "Vocal Cord Swelling",
      "content": "Laryngitis inflames the larynx and vocal cords, causing swelling that interferes with normal vibration. This produces hoarseness or voice loss as the cords can't close properly or vibrate freely, plus cough from local irritation.",
      "metaphor": "Like guitar strings that are wet and swollen - they can't vibrate cleanly to produce clear tones, resulting in muted, distorted sound or no sound at all."
    }
  },
  {
    "id": "900.5.104",
    "mechanism": {
      "title": "Surgical Airway Access",
      "content": "Tracheostomy creates a surgical opening directly into the trachea below the larynx. This bypasses upper airway obstruction, enables long-term mechanical ventilation, or facilitates secretion removal in patients who can't protect their airway naturally.",
      "metaphor": "Like cutting a side door into a building when the front entrance is blocked - it provides direct access to the interior (lungs) without going through the obstructed path (mouth/throat)."
    }
  },
  {
    "id": "900.5.105",
    "mechanism": {
      "title": "Airway Camera Inspection",
      "content": "Bronchoscopy involves inserting a flexible camera through the nose or mouth down into the trachea and bronchi. This allows direct visualization of airway anatomy, biopsy of suspicious lesions, removal of foreign bodies, or therapeutic interventions like tumor ablation.",
      "metaphor": "Like using a plumbing snake with a camera - you can see exactly what's blocking the pipes, take samples of buildup, or even remove obstructions while looking directly at them."
    }
  }
]

def main():
    # Load the vocabulary file
    vocab_path = "900.5-vocabulary.json"

    with open(vocab_path, 'r', encoding='utf-8') as f:
        vocab = json.load(f)

    # Create a lookup dict for mechanisms
    mech_lookup = {m['id']: m['mechanism'] for m in mechanisms}

    # Add mechanisms to each question
    updated = 0
    for question in vocab['questions']:
        qid = question['id']
        if qid in mech_lookup:
            question['mechanism'] = mech_lookup[qid]
            updated += 1

    # Write updated file
    with open(vocab_path, 'w', encoding='utf-8') as f:
        json.dump(vocab, f, indent=2, ensure_ascii=False)

    print(f"Updated {updated} questions with mechanism objects")
    print(f"Saved to {vocab_path}")

if __name__ == "__main__":
    main()
