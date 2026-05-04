(function () {
  const data = window.STUDY_DATA;
  const guideItems = [];

  function add(system, section, category, term, visual, trap, aliases) {
    guideItems.push({
      system,
      section,
      category,
      term,
      visual,
      trap: trap || "Say the exact spelling before moving on.",
      aliases: aliases || []
    });
  }

  add("Respiratory", "Exercise 36 - Fetal Pig", "gross", "Epiglottis", "Leaf-like flap at the top of the larynx that protects the airway during swallowing.", "Do not spell it as epiglotis; do not call it the glottis.");
  add("Respiratory", "Exercise 36 - Fetal Pig", "gross", "Larynx", "Voice-box region between pharynx and trachea.", "It is the whole region, not just the opening.");
  add("Respiratory", "Exercise 36 - Fetal Pig", "gross", "Trachea", "Open windpipe with firm cartilaginous support.", "It stays open; the esophagus is usually collapsed.");
  add("Respiratory", "Exercise 36 - Fetal Pig", "gross", "Primary bronchus", "First large branch leaving the trachea toward a lung.", "Singular is bronchus; plural is bronchi.", ["Primary bronchi"]);
  add("Respiratory", "Exercise 36 - Fetal Pig", "gross", "Diaphragm", "Sheet-like muscle separating thoracic and abdominal cavities.", "Do not confuse with abdominal wall muscle.");
  add("Respiratory", "Human torso/head model", "gross", "Nasal cavity", "Hollow space inside the nose superior to the oral cavity.", "Spell nasal with one s.");
  add("Respiratory", "Human torso/head model", "gross", "Pharynx", "Shared throat passage behind nasal and oral cavities.", "Use pharynx for the shared tube, not larynx.");
  add("Respiratory", "Human torso/head model", "gross", "Nasopharynx", "Pharynx region behind the nasal cavity.", "Prefix naso- anchors it to the nose.");
  add("Respiratory", "Human torso/head model", "gross", "Oropharynx", "Pharynx region behind the mouth.", "Prefix oro- anchors it to oral cavity.");
  add("Respiratory", "Human torso/head model", "gross", "Laryngopharynx", "Lowest pharynx region near the larynx.", "Long spelling: laryngo + pharynx.");
  add("Respiratory", "Human torso/head model", "gross", "Secondary bronchus", "Branch that supplies a lung lobe.", "Secondary comes after primary.", ["Secondary bronchi"]);
  add("Respiratory", "Sagittal skull/head model", "gross", "Paranasal sinuses", "Air spaces around the nasal cavity.", "Name the specific sinus when the pointer is local.");
  add("Respiratory", "Sagittal skull/head model", "gross", "Frontal sinus", "Sinus in the frontal bone, superior/anterior in the forehead region.", "Frontal means forehead.");
  add("Respiratory", "Sagittal skull/head model", "gross", "Maxillary sinus", "Sinus in the cheek/maxilla region.", "Maxillary is not usually shown on the listed model.");
  add("Respiratory", "Sagittal skull/head model", "gross", "Ethmoid sinus", "Sinus region between the eyes.", "Ethmoid sits medial/deep, not in the forehead.");
  add("Respiratory", "Sagittal skull/head model", "gross", "Sphenoid sinus", "Deep posterior sinus behind the nasal cavity.", "Sphenoid is the deepest/posterior sinus in the guide.");
  add("Respiratory", "Larynx model", "gross", "Hyoid bone", "U-shaped bone superior to the larynx.", "It is a bone above laryngeal cartilage.");
  add("Respiratory", "Larynx model", "gross", "Thyroid cartilage", "Large anterior laryngeal cartilage.", "The laryngeal prominence is a feature on it.");
  add("Respiratory", "Larynx model", "gross", "Laryngeal prominence", "Anterior bulge of the thyroid cartilage.", "Prominence is the bulge, not a separate large cartilage.");
  add("Respiratory", "Larynx model", "gross", "Cricoid cartilage", "Ring-shaped cartilage inferior to thyroid cartilage.", "Cricoid is below thyroid cartilage.");
  add("Respiratory", "Larynx model", "gross", "Glottis", "Opening of the larynx.", "The glottis is the opening; epiglottis is the flap.");
  add("Respiratory", "Larynx model", "gross", "Arytenoid cartilage", "Small paired posterior cartilages of the larynx.", "Spelling starts ary-.");
  add("Respiratory", "Larynx model", "gross", "Corniculate cartilage", "Tiny cartilages sitting above the arytenoids.", "Corniculate is smaller and superior to arytenoid.");
  add("Respiratory", "Lung model", "gross", "Tertiary bronchus", "Smaller bronchial branch deeper than secondary bronchus.", "Third level: primary, secondary, tertiary.", ["Tertiary bronchi"]);
  add("Respiratory", "Lung model", "gross", "Lobes of the lung", "Major subdivisions of the lungs.", "Name lobe level before smaller airway if the pointer is broad.");
  add("Respiratory", "Histology", "histology", "Lung", "Open air-space field with alveoli and very thin simple squamous lining.", "Healthy lung has open alveolar spaces; diseased lung looks filled or thickened.");
  add("Respiratory", "Histology", "histology", "Alveoli", "Tiny open air sacs in lung tissue.", "Singular is alveolus; plural is alveoli.", ["Alveolus"]);
  add("Respiratory", "Histology", "histology", "Simple squamous epithelium", "Thin, flat cell layer used for diffusion in alveoli.", "Do not call lung lining columnar.");
  add("Respiratory", "Histology", "histology", "Diseased lung", "Pneumonia/tuberculosis slide has less open air space and more filled/inflamed tissue.", "Contrast with healthy open alveoli.", ["Pneumonia lung", "Tuberculosis lung"]);
  add("Respiratory", "Histology", "histology", "Pseudostratified ciliated columnar epithelium", "Tall respiratory lining with nuclei at different heights and cilia.", "Classic trachea clue.");
  add("Respiratory", "Histology", "histology", "Goblet cells", "Mucus-producing pale cells in respiratory or digestive epithelium.", "They are cells, not glands.");
  add("Respiratory", "Histology", "histology", "Hyaline cartilage", "Smooth glassy cartilage supporting the trachea.", "Cartilage plus ciliated epithelium points trachea.");
  add("Respiratory", "Histology", "histology", "Trachea opening", "Open lumen held open by cartilage.", "The esophagus opening is collapsed.");
  add("Respiratory", "Histology", "histology", "Esophagus opening", "Collapsed muscular tube posterior to trachea.", "Collapsed opening separates it from open trachea.");

  add("Digestive", "Exercise 38 - Human torso model", "gross", "Parotid salivary gland", "Large salivary gland near the cheek/ear region.", "Parotid is not submandibular.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Submandibular salivary gland", "Salivary gland tucked beneath the mandible.", "Submandibular means below the jaw.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Hard palate", "Anterior bony roof of the mouth.", "Hard is anterior and bony.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Soft palate", "Posterior muscular roof of the mouth.", "Soft is posterior.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Esophagus", "Food tube from pharynx to stomach.", "On histology it is stratified squamous.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Stomach", "J-shaped organ with rugae and greater/lesser curvatures.", "Use rugae and pyloric sphincter as anchors.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Greater curvature", "Long outer curve of the stomach.", "Greater is the larger lateral/inferior curve.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Greater omentum", "Fatty apron-like peritoneal fold hanging from stomach.", "Omentum is a fold, not a stomach wall layer.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Lesser curvature", "Short inner curve of the stomach.", "Lesser is the smaller medial/superior curve.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Pyloric sphincter", "Ring at the stomach exit into the duodenum.", "Pyloric is distal stomach, not gastroesophageal.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Rugae", "Folds inside the stomach.", "Rugae are stomach folds.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Small intestine", "Long narrow intestinal tube; histology has villi.", "Villi distinguish it from large intestine.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Ileocecal valve", "Valve between ileum and cecum.", "Ileocecal means ileum to cecum.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Large intestine", "Wider colon pathway; no villi on histology.", "Do not use villi as a large intestine clue.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Cecum", "Pouch at the beginning of the large intestine.", "Cecum sits near appendix and ileocecal valve.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Appendix", "Small worm-like projection from the cecum.", "Appendix is attached to cecum.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Ascending colon", "Colon segment traveling upward.", "Ascending goes up.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Transverse colon", "Colon segment traveling across.", "Transverse goes across.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Descending colon", "Colon segment traveling downward.", "Descending goes down.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Sigmoid colon", "S-shaped distal colon.", "Sigmoid means S-shaped.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Liver", "Large accessory digestive organ producing bile.", "Duct labels near it may be common hepatic/common bile.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Common hepatic duct", "Duct draining bile from the liver.", "Hepatic means liver.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Common bile duct", "Bile duct heading toward the small intestine.", "Often formed after hepatic/cystic duct connection.", ["Bile duct"]);
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Gall bladder", "Small sac under the liver storing bile.", "Two words in the guide: gall bladder.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Cystic duct", "Duct from the gall bladder.", "Cystic is gall bladder, not liver.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Pancreas", "Accessory organ near duodenum; digestive and endocrine roles.", "Do not confuse with spleen.");
  add("Digestive", "Exercise 38 - Human torso model", "gross", "Spleen", "Lymphatic organ lateral to stomach.", "Listed with digestive model but not a digestive gland.");
  add("Digestive", "Histology", "histology", "Stratified squamous epithelium", "Layered protective epithelium; esophagus and anal side of recto-anal junction.", "Not simple columnar.");
  add("Digestive", "Histology", "histology", "Simple columnar epithelium with goblet cells", "Tall single-layer lining with mucus cells in digestive tract.", "Seen in stomach/intestine contexts in the guide.");
  add("Digestive", "Histology", "histology", "Gastric pits", "Small pits/openings in stomach mucosa.", "Stomach clue with rugae.");
  add("Digestive", "Histology", "histology", "Villi", "Finger-like projections in small intestine mucosa.", "Villi means small intestine, not large intestine.");
  add("Digestive", "Histology", "histology", "Crypts of Lieberkuhn", "Intestinal crypts between villi.", "Spell Lieberkuhn carefully.", ["Intestinal crypts"]);
  add("Digestive", "Histology", "histology", "Brunner's glands", "Submucosal glands in small intestine model.", "They belong in submucosa.");
  add("Digestive", "Histology", "histology", "Peyer's patches", "Lymphatic nodules in intestinal tissue.", "Apostrophe after Peyer.");
  add("Digestive", "Histology", "histology", "Recto-anal junction", "Transition from simple columnar to stratified squamous epithelium.", "The transition is the key clue.");
  add("Digestive", "Small intestine model", "histology", "Mucosa", "Inner layer with villi, epithelium, lamina propria, and muscularis mucosae.", "Mucosa is innermost.");
  add("Digestive", "Small intestine model", "histology", "Lamina propria", "Loose connective tissue core/support inside mucosa.", "Part of mucosa, not submucosa.");
  add("Digestive", "Small intestine model", "histology", "Muscularis mucosae", "Thin smooth muscle layer of the mucosa.", "Different from muscularis externa.");
  add("Digestive", "Small intestine model", "histology", "Capillaries", "Small blood vessels inside villi.", "Do not confuse with lacteal.");
  add("Digestive", "Small intestine model", "histology", "Lacteal", "Lymphatic vessel in a villus.", "Lacteal is lymph, not blood capillary.");
  add("Digestive", "Small intestine model", "histology", "Submucosa", "Layer beneath mucosa containing glands/nodules/plexus.", "Submucosa is below mucosa.");
  add("Digestive", "Small intestine model", "histology", "Lymphatic nodule", "Round immune tissue cluster in intestinal wall.", "Can appear as Peyer's patches.");
  add("Digestive", "Small intestine model", "histology", "Submucosal plexus", "Nerve plexus in the submucosa.", "Submucosal plexus is not myenteric plexus.");
  add("Digestive", "Small intestine model", "histology", "Muscularis externa", "Smooth muscle layer with inner circular and outer longitudinal layers.", "Do not confuse with muscularis mucosae.");
  add("Digestive", "Small intestine model", "histology", "Circular layer", "Inner ring-like layer of muscularis externa.", "Inner circular, outer longitudinal.");
  add("Digestive", "Small intestine model", "histology", "Longitudinal layer", "Outer lengthwise layer of muscularis externa.", "Outer longitudinal.");
  add("Digestive", "Small intestine model", "histology", "Myenteric plexus", "Nerve plexus between circular and longitudinal muscle layers.", "Myenteric sits in muscularis externa.");
  add("Digestive", "Small intestine model", "histology", "Serosa", "Outer simple squamous covering.", "Serosa is the outer covering.");

  add("Urinary", "Exercise 40 - Human torso/model", "gross", "Kidney", "Bean-shaped organ that filters blood and makes urine.", "Plural is kidneys.");
  add("Urinary", "Exercise 40 - Human torso/model", "gross", "Ureter", "Tube carrying urine from kidney to urinary bladder.", "Ureter goes kidney to bladder; urethra exits bladder.", ["Ureters"]);
  add("Urinary", "Exercise 40 - Human torso/model", "gross", "Urinary bladder", "Sac that stores urine.", "Do not confuse bladder with uterus on pelvic models.");
  add("Urinary", "Urinary system model", "gross", "Adrenal gland", "Small gland sitting superior to kidney.", "Endocrine gland on top of kidney.");
  add("Urinary", "Urinary system model", "gross", "Renal artery", "Blood vessel bringing blood to kidney.", "Artery enters; vein leaves.");
  add("Urinary", "Urinary system model", "gross", "Renal vein", "Blood vessel draining blood from kidney.", "Vein leaves kidney.");
  add("Urinary", "Urinary system model", "gross", "Cortex", "Outer kidney region; histology has renal corpuscles.", "Cortex is outer.");
  add("Urinary", "Urinary system model", "gross", "Medulla", "Inner kidney region containing pyramids.", "Medulla is inner.");
  add("Urinary", "Urinary system model", "gross", "Medullary pyramids", "Triangular/pyramid-shaped inner kidney structures.", "Also called renal pyramids.", ["Renal pyramids"]);
  add("Urinary", "Urinary system model", "gross", "Minor calyx", "Small cup collecting urine from a pyramid.", "Minor comes before major.");
  add("Urinary", "Urinary system model", "gross", "Major calyx", "Larger cup formed by minor calyces.", "Major drains toward renal pelvis.");
  add("Urinary", "Urinary system model", "gross", "Renal pelvis", "Funnel-like collecting region before ureter.", "Pelvis leads to ureter.");
  add("Urinary", "Three-part kidney model", "gross", "Pelvis", "Funnel region of kidney collecting urine.", "In this model, pelvis means renal pelvis.");
  add("Urinary", "Three-part kidney model", "gross", "Segmental artery", "Renal arterial branch before interlobar arteries.", "Segmental is early branch.");
  add("Urinary", "Three-part kidney model", "gross", "Interlobar artery and vein", "Vessels running between renal pyramids.", "Interlobar means between lobes/pyramids.");
  add("Urinary", "Three-part kidney model", "gross", "Arcuate artery and vein", "Arc-shaped vessels along cortex-medulla boundary.", "Arcuate means arched.");
  add("Urinary", "Three-part kidney model", "gross", "Cortical radiate artery and vein", "Small vessels radiating into cortex.", "Formerly interlobular in many texts.");
  add("Urinary", "Three-part kidney model", "gross", "Afferent arteriole", "Small vessel entering the glomerulus.", "Afferent arrives.");
  add("Urinary", "Three-part kidney model", "gross", "Efferent arteriole", "Small vessel leaving the glomerulus.", "Efferent exits.");
  add("Urinary", "Three-part kidney model", "histology", "Nephron", "Microscopic kidney unit from renal corpuscle through tubules to collecting duct.", "Know the order.");
  add("Urinary", "Three-part kidney model", "histology", "Renal corpuscle", "Glomerulus plus Bowman's capsule.", "Renal corpuscle anchors cortex.");
  add("Urinary", "Three-part kidney model", "histology", "Glomerulus", "Capillary tuft inside Bowman's capsule.", "Glomerulus is the tuft, not the capsule.");
  add("Urinary", "Three-part kidney model", "histology", "Bowman's capsule", "Capsule surrounding the glomerulus.", "Also called glomerular capsule.", ["Glomerular capsule"]);
  add("Urinary", "Three-part kidney model", "histology", "Parietal layer of Bowman's capsule", "Outer layer of Bowman's capsule.", "Parietal means wall side.");
  add("Urinary", "Three-part kidney model", "histology", "Visceral layer of Bowman's capsule", "Inner layer hugging the glomerulus.", "Visceral means organ/glomerulus side.");
  add("Urinary", "Three-part kidney model", "histology", "Proximal convoluted tubule", "First convoluted tubule after renal corpuscle.", "Proximal comes before loop of Henle.");
  add("Urinary", "Three-part kidney model", "histology", "Descending limb of the Loop of Henle", "Downward limb of nephron loop.", "Descending goes down.");
  add("Urinary", "Three-part kidney model", "histology", "Ascending limb of the Loop of Henle", "Upward limb of nephron loop.", "Ascending goes up.");
  add("Urinary", "Three-part kidney model", "histology", "Distal convoluted tubule", "Convoluted tubule after ascending limb.", "Distal comes after loop of Henle.");
  add("Urinary", "Three-part kidney model", "histology", "Collecting duct", "Tubule receiving filtrate from distal convoluted tubules.", "Collecting duct comes late in urine pathway.");
  add("Urinary", "Histology", "histology", "Renal tubules", "Tubular structures around renal corpuscles in kidney section.", "Use renal corpuscles to call cortex.");

  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Pituitary gland", "Small gland below brain; histology has anterior and posterior lobes.", "Do not miss lobe distinction.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Pineal gland", "Small endocrine gland in the brain.", "Pineal is not pituitary.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Thyroid gland", "Neck endocrine gland; histology has follicles.", "Thyroid follicles are the visual clue.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Adrenal glands", "Paired glands sitting on kidneys.", "Adrenal is superior to kidney.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Pancreas", "Mixed endocrine/digestive organ.", "May be tested in digestive and endocrine contexts.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Ovaries", "Female gonads with endocrine function.", "Plural ovaries; singular ovary.");
  add("Endocrine", "Exercise 27 - Human torso model", "gross", "Testes", "Male gonads with endocrine function.", "Plural testes; singular testis.");
  add("Endocrine", "Histology", "histology", "Anterior lobe", "Darker/more cellular lobe of pituitary on many slides.", "Anterior versus posterior is the required distinction.");
  add("Endocrine", "Histology", "histology", "Posterior lobe", "Lighter/fibrous-looking lobe of pituitary on many slides.", "Posterior versus anterior is the required distinction.");
  add("Endocrine", "Histology", "histology", "Follicles", "Large round spaces in thyroid surrounded by follicular cells.", "Follicles identify thyroid.");
  add("Endocrine", "Histology", "histology", "Follicular cells", "Cells surrounding thyroid follicles.", "Follicular cells form the follicle wall.");
  add("Endocrine", "Histology", "histology", "Adrenal layers", "Distinct cortex/medulla organization in adrenal gland.", "Layering is the adrenal clue.");
  add("Endocrine", "Histology", "histology", "Adrenal cortex", "Outer layered region of adrenal gland.", "Cortex is outside medulla.");
  add("Endocrine", "Histology", "histology", "Adrenal medulla", "Central adrenal region.", "Medulla is center.");

  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Seminal vesicles", "Paired glands posterior to bladder adding fluid to semen.", "Plural vesicles.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Ejaculatory duct", "Duct carrying semen toward urethra.", "Do not confuse with vas deferens.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Prostate gland", "Gland inferior to bladder surrounding urethra.", "Prostate is singular.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Bulbourethral glands", "Small paired male glands also called Cowper's glands.", "Bulbourethral has urethral in the spelling.", ["Cowper's glands"]);
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Urethra", "Tube leaving urinary bladder; shared urinary/reproductive path in male.", "Urethra exits bladder; ureter enters bladder.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Testes", "Male gonads.", "Plural testes; singular testis.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Epididymis", "Coiled structure on testis where sperm mature.", "Spelling: epi-didymis.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Vas deferens", "Duct carrying sperm away from epididymis.", "Also called ductus deferens in some classes.");
  add("Reproductive", "Exercise 42 - Male reproductive model", "gross", "Penis", "External male organ containing erectile tissue and urethra.", "Histology asks corpora cavernosa/corpus spongiosum.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Uterus", "Central female reproductive organ.", "Cervix is the lower narrow part.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Cervix", "Lower narrow portion of uterus.", "Cervix belongs to uterus.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Myometrium", "Muscular wall layer of uterus.", "Myo- means muscle.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Vagina", "Canal inferior to cervix.", "Do not confuse with urethra.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Ovary", "Female gonad.", "Singular ovary; plural ovaries.");
  add("Reproductive", "Exercise 42 - Female reproductive model", "gross", "Uterine tubes", "Tubes leading from ovary region toward uterus.", "Also called fallopian tubes.", ["Fallopian tubes"]);
  add("Reproductive", "Male reproductive histology", "histology", "Seminiferous tubules", "Round/coiled tubules in testis where sperm form.", "Seminiferous tubules identify testis.");
  add("Reproductive", "Male reproductive histology", "histology", "Interstitial cells", "Cells between seminiferous tubules.", "Interstitial means between tubules.");
  add("Reproductive", "Male reproductive histology", "histology", "Corpora cavernosa", "Paired dorsal erectile bodies in penis histology.", "Plural corpora; singular corpus.");
  add("Reproductive", "Male reproductive histology", "histology", "Corpus spongiosum", "Erectile tissue surrounding urethra in penis.", "Spongiosum surrounds urethra.");
  add("Reproductive", "Female reproductive histology", "histology", "Ovarian cortex", "Outer ovary region containing follicles.", "Cortex contains follicles.");
  add("Reproductive", "Female reproductive histology", "histology", "Primordial follicles", "Tiny earliest follicles in ovarian cortex.", "Primordial is earliest/smallest.");
  add("Reproductive", "Female reproductive histology", "histology", "Primary follicle with oocyte", "Growing follicle with visible oocyte.", "Primary is smaller than mature Graafian.");
  add("Reproductive", "Female reproductive histology", "histology", "Oocyte", "Egg cell inside follicle.", "Oocyte is the cell, not the whole follicle.");
  add("Reproductive", "Female reproductive histology", "histology", "Mature follicle (Graafian follicle)", "Large ovarian follicle with prominent antrum.", "Graafian has a large antrum.", ["Graafian follicle"]);
  add("Reproductive", "Female reproductive histology", "histology", "Antrum", "Large fluid-filled space in mature follicle.", "Antrum is the space.");
  add("Reproductive", "Female reproductive histology", "histology", "Corpus luteum", "Post-ovulation ovarian structure.", "Different from corpus spongiosum.");

  add("Fetal Pig", "Fetal pig digestive", "gross", "Hard palate", "Anterior bony roof of pig mouth.", "Hard palate is anterior.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Soft palate", "Posterior softer roof of pig mouth.", "Soft palate is posterior.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Esophagus", "Food tube leading to stomach.", "Collapsed tube; do not call trachea.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Stomach", "Curved sac with rugae, curvatures, and sphincters.", "Use curvature and rugae clues.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Gastroesophageal sphincter", "Sphincter at esophagus-stomach junction.", "Also cardiac/lower esophageal sphincter.", ["Cardiac sphincter", "Lower esophageal sphincter"]);
  add("Fetal Pig", "Fetal pig digestive", "gross", "Duodenum", "First segment of small intestine after stomach.", "Duodenum comes before ileum.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Ileum", "Later segment of small intestine near ileocecal valve.", "Ileum is not ilium.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Mesentery", "Thin membrane anchoring intestines.", "Membrane, not tube.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Spiral colon", "Coiled pig large-intestine structure.", "Pig-specific strong clue.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Rectum", "Distal large intestine before anus.", "Rectum is after colon.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Liver", "Large multi-lobed organ in upper abdomen.", "Ducts nearby may be hepatic/bile.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Gall bladder", "Small bile-storage sac associated with liver.", "Two words in guide.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Common hepatic duct", "Duct draining bile from liver.", "Hepatic means liver.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Cystic duct", "Duct from gall bladder.", "Cystic means gall bladder.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Common bile duct", "Bile duct heading toward intestine.", "Can be listed simply as bile duct.", ["Bile duct"]);
  add("Fetal Pig", "Fetal pig digestive", "gross", "Pancreas", "Soft glandular tissue near stomach/duodenum.", "Do not confuse with spleen.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Spleen", "Elongated organ near stomach.", "Spleen is not pancreas.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Parietal peritoneum", "Membrane lining the body wall.", "Parietal lines wall.");
  add("Fetal Pig", "Fetal pig digestive", "gross", "Visceral peritoneum", "Membrane covering organs.", "Visceral covers organs.");
  add("Fetal Pig", "Fetal pig urinary", "gross", "Kidney", "Bean-shaped urinary organ.", "Starred in guide.");
  add("Fetal Pig", "Fetal pig urinary", "gross", "Ureter", "Tube from kidney to urinary bladder.", "Ureter is not urethra.");
  add("Fetal Pig", "Fetal pig urinary", "gross", "Urinary bladder", "Urine storage sac.", "Bladder may sit low in pelvis.");
  add("Fetal Pig", "Fetal pig urinary", "gross", "Renal artery", "Blood vessel to kidney.", "Artery with renal vein.");
  add("Fetal Pig", "Fetal pig urinary", "gross", "Renal vein", "Blood vessel from kidney.", "Vein with renal artery.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Ovaries", "Female pig gonads.", "Plural ovaries.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Uterine horns", "Long paired extensions of pig uterus.", "Pig-specific reproductive clue.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Fallopian tubes", "Tubes near ovaries leading toward uterus.", "Also uterine tubes.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Uterus", "Female reproductive organ connected to uterine horns.", "Do not confuse with urinary bladder.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Vagina", "Female reproductive canal.", "Different from urethra.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Urethra", "Tube leaving bladder.", "Can appear in male and female lists.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Testicular artery", "Artery supplying testis.", "Testicular, not renal.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Vas deferens", "Male duct carrying sperm from epididymis.", "Keep in male pathway.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Inguinal canal", "Passage in groin region.", "Inguinal means groin.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Testes", "Male pig gonads.", "Plural testes.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Epididymis", "Coiled structure on testis.", "Spelling matters.");
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Cowper's glands", "Male bulbourethral glands.", "Alias for bulbourethral glands.", ["Bulbourethral glands"]);
  add("Fetal Pig", "Fetal pig reproductive", "gross", "Penis", "Male external reproductive organ.", "Listed with urethra in male pig.");
  add("Fetal Pig", "Fetal pig endocrine", "gross", "Thyroid gland", "Endocrine gland in neck region.", "Fetal pig endocrine list.");
  add("Fetal Pig", "Fetal pig endocrine", "gross", "Pancreas", "Also in endocrine list because it has endocrine tissue.", "Same organ appears in digestive list.");

  data.examGuideSource = "Lab Exam II Study Guide - SPRING2026.pdf";
  data.quickRollItems = guideItems.map((item, index) => ({
    ...item,
    id: `guide_${String(index + 1).padStart(3, "0")}_${slug(item.system)}_${slug(item.term)}`
  }));
  data.quickRollSections = ["All sections", ...Array.from(new Set(data.quickRollItems.map((item) => item.section)))];

  mergeGuideGlossary(data.quickRollItems);

  function mergeGuideGlossary(items) {
    items.forEach((item) => {
      if (!data.glossary[item.system]) {
        data.glossary[item.system] = [];
      }
      const exists = data.glossary[item.system].some(
        (entry) => entry.term.toLowerCase() === item.term.toLowerCase()
      );
      if (!exists) {
        data.glossary[item.system].push({
          term: item.term,
          definition: `${item.visual} Source: ${item.section}.`
        });
      }
    });
  }

  function slug(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48);
  }
})();
