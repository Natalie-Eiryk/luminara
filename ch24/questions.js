(function () {
  "use strict";

  const respirationChoices = [
    "Citric acid (Krebs) cycle",
    "Electron transport chain",
    "Glycolysis"
  ];

  const heatChoices = [
    "Evaporation",
    "Radiation",
    "Convection",
    "Conduction"
  ];

  window.CH24_QUIZ = {
    id: "ch24-metabolism-nutrition",
    title: "Chapter 24: Metabolism and Nutrition",
    version: "2026.05.05-text-extract",
    cards: [
      {
        id: "q1-cellular-respiration-match",
        source: "Question 1",
        kind: "matching",
        prompt: "Match each statement to the correct cellular respiration stage.",
        choices: respirationChoices,
        pairs: [
          {
            prompt: "Glucose serves as the initial reactant.",
            answerIndex: 2,
            explanation: "Glycolysis begins with glucose and splits it into two pyruvic acid molecules."
          },
          {
            prompt: "Involves the use of oxygen to pick up excess hydrogen and electrons.",
            answerIndex: 1,
            explanation: "Oxygen is the final electron acceptor at the end of the electron transport chain."
          },
          {
            prompt: "Occurs in the cytosol of a cell.",
            answerIndex: 2,
            explanation: "Glycolysis occurs in the cytosol; the Krebs cycle and electron transport chain occur in mitochondria."
          },
          {
            prompt: "Produces the most ATP.",
            answerIndex: 1,
            explanation: "Most ATP from glucose oxidation is produced through oxidative phosphorylation at the electron transport chain."
          },
          {
            prompt: "Involves the removal of hydrogen electrons and CO2 from the substrate molecule.",
            answerIndex: 0,
            explanation: "The citric acid cycle strips carbon and high-energy electrons from acetyl CoA."
          }
        ],
        explanation: "The flow is glycolysis in the cytosol, citric acid cycle in mitochondria, then electron transport chain using oxygen."
      },
      {
        id: "q2-heat-transfer-match",
        source: "Question 2",
        kind: "matching",
        prompt: "Match each heat-transfer example to the correct mechanism.",
        choices: heatChoices,
        pairs: [
          {
            prompt: "Heat transfer into the chair you are sitting on.",
            answerIndex: 3,
            explanation: "Conduction transfers heat through direct contact."
          },
          {
            prompt: "Heat exchange when you are under a ceiling fan.",
            answerIndex: 2,
            explanation: "Convection moves heat by moving air or fluid across a surface."
          },
          {
            prompt: "Heat loss during sweating.",
            answerIndex: 0,
            explanation: "Evaporation removes heat as liquid sweat changes into vapor."
          },
          {
            prompt: "Heat loss in the form of infrared waves.",
            answerIndex: 1,
            explanation: "Radiation transfers heat by electromagnetic waves."
          }
        ],
        explanation: "Heat moves by contact, moving air or fluid, phase change, or infrared waves."
      },
      {
        id: "q3-glucose-sparing",
        source: "Question 3",
        kind: "true-false",
        prompt: "The increased use of noncarbohydrate molecules for energy to conserve glucose is called glucose sparing.",
        choices: ["True", "False"],
        answerIndex: 0,
        explanation: "Glucose sparing shifts fuel use toward fats and other noncarbohydrate molecules."
      },
      {
        id: "q4-essential-nutrient",
        source: "Question 4",
        kind: "true-false",
        prompt: "The term essential nutrient refers to chemicals that can be interconverted in the liver so that the body can maintain life and good health.",
        choices: ["True", "False"],
        answerIndex: 1,
        explanation: "Essential nutrients must be obtained from the diet because the body cannot make enough of them."
      },
      {
        id: "q5-nitrogen-balance",
        source: "Question 5",
        kind: "true-false",
        prompt: "The body is considered to be in nitrogen balance when the amount of nitrogen ingested in lipids equals the amount excreted in urine.",
        choices: ["True", "False"],
        answerIndex: 1,
        explanation: "Nitrogen balance compares nitrogen intake from proteins with nitrogen loss, mostly through urea in urine."
      },
      {
        id: "q6-protein-needs",
        source: "Question 6",
        kind: "true-false",
        prompt: "The amount of protein needed by each person is determined by age, size, metabolic rate, and the need to build new proteins.",
        choices: ["True", "False"],
        answerIndex: 0,
        explanation: "Protein requirements rise with growth, repair, body size, and metabolic demand."
      },
      {
        id: "q7-lipid-transport",
        source: "Question 7",
        kind: "true-false",
        prompt: "Triglycerides and cholesterol do not circulate freely in the bloodstream.",
        choices: ["True", "False"],
        answerIndex: 0,
        explanation: "Lipids are hydrophobic, so they travel in lipoprotein particles."
      },
      {
        id: "q8-hdl-role",
        source: "Question 8",
        kind: "true-false",
        prompt: "The major role of high-density lipoproteins (HDLs) is to store energy in the form of fat.",
        choices: ["True", "False"],
        answerIndex: 1,
        explanation: "HDLs help return cholesterol from tissues to the liver."
      },
      {
        id: "q9-lipids-structures",
        source: "Question 9",
        kind: "multiple-choice",
        prompt: "Which food molecule type provides components for cellular structures like plasma membranes, myelin sheaths, and steroid hormones?",
        choices: ["Glucose", "Complex carbohydrates", "Lipids", "Protein"],
        answerIndex: 2,
        explanation: "Lipids form membranes, myelin, and steroid hormone precursors."
      },
      {
        id: "q10-cholesterol-importance",
        source: "Question 10",
        kind: "multiple-choice",
        prompt: "Cholesterol, though it is not an energy molecule, has importance in the body because it:",
        choices: [
          "Helps mobilize fats during periods of starvation",
          "Is a stabilizing component of plasma membranes and the parent molecule of steroid hormones",
          "Enters the glycolytic pathway without being altered",
          "Helps provide essential nutrients to the brain and lungs"
        ],
        answerIndex: 1,
        explanation: "Cholesterol stabilizes membranes and is the precursor for steroid hormones."
      },
      {
        id: "q11-vitamins",
        source: "Question 11",
        kind: "multiple-choice",
        prompt: "It is important to ensure that your diet is adequately rich in vitamins because:",
        choices: [
          "Vitamins provide protection against the common cold",
          "Very few foods contain vitamins",
          "All vitamins are water soluble and pass out of the body too quickly to ensure utilization",
          "Most vitamins are coenzymes needed to help the body utilize essential nutrients"
        ],
        answerIndex: 3,
        explanation: "Many vitamins act as coenzymes in metabolic reactions."
      },
      {
        id: "q12-cellular-respiration-pathway",
        source: "Question 12",
        kind: "multiple-choice",
        prompt: "Which choice describes the pathway of cellular respiration, the complete oxidation of glucose?",
        choices: [
          "Glycogenesis, lipogenesis, electron transport chain",
          "Gluconeogenesis, citric acid (Krebs) cycle, lipolysis",
          "Lipolysis, glycogenolysis, beta oxidation",
          "Glycolysis, citric acid (Krebs) cycle, electron transport chain, oxidative phosphorylation"
        ],
        answerIndex: 3,
        explanation: "Glucose is processed through glycolysis, the Krebs cycle, and the electron transport chain to make ATP."
      },
      {
        id: "q13-catabolism",
        source: "Question 13",
        kind: "multiple-choice",
        prompt: "Catabolism would be best described as a process that:",
        choices: [
          "Builds up triglycerides during the postabsorptive state",
          "Causes a decline in circulating ketone bodies",
          "Elevates glucagon levels",
          "Breaks down complex structures to simpler ones"
        ],
        answerIndex: 3,
        explanation: "Catabolism breaks larger molecules down and releases usable energy."
      },
      {
        id: "q14-transamination",
        source: "Question 14",
        kind: "multiple-choice",
        prompt: "Transamination is the process whereby the amine group of an amino acid is:",
        choices: ["Transferred to acetyl CoA", "Converted to ammonia", "Transferred to a keto acid", "Converted to urea"],
        answerIndex: 2,
        explanation: "Transamination moves an amino group to a keto acid to form a different amino acid."
      },
      {
        id: "q15-glycogen-state",
        source: "Question 15",
        kind: "multiple-choice",
        prompt: "Glycogen is formed in the liver during the:",
        choices: ["Postabsorptive state", "Starvation period", "Absorptive state", "Period when the metabolic rate is lowest"],
        answerIndex: 2,
        explanation: "After a meal, insulin favors glycogenesis and nutrient storage."
      },
      {
        id: "q16-gluconeogenesis",
        source: "Question 16",
        kind: "multiple-choice",
        prompt: "Gluconeogenesis is the process in which:",
        choices: [
          "Glycogen is formed",
          "Glucose is converted into carbon dioxide and water",
          "Glycogen is broken down to release glucose",
          "Glucose is formed from noncarbohydrate molecules"
        ],
        answerIndex: 3,
        explanation: "Gluconeogenesis makes new glucose from molecules such as amino acids and glycerol."
      },
      {
        id: "q17-glycolysis",
        source: "Question 17",
        kind: "multiple-choice",
        prompt: "Glycolysis is best defined as a catabolic reaction based upon the:",
        choices: [
          "Formation of sugar",
          "Conversion of glucose into carbon dioxide and water",
          "Conversion of glucose into two molecules of pyruvic acid",
          "Conversion of pyruvic acid into carbon dioxide and water"
        ],
        answerIndex: 2,
        explanation: "Glycolysis splits one glucose into two pyruvic acid molecules."
      },
      {
        id: "q18-thermogenesis",
        source: "Question 18",
        kind: "multiple-choice",
        prompt: "The ingestion of which nutrient type results in the greatest food-induced thermogenesis?",
        choices: ["Vitamins", "Carbohydrates", "Proteins", "Lipids"],
        answerIndex: 2,
        explanation: "Protein digestion and metabolism have the highest thermic effect among these nutrient groups."
      },
      {
        id: "q19-liver-function",
        source: "Question 19",
        kind: "multiple-choice",
        prompt: "Which of the following is not an important function of the liver?",
        choices: ["Synthesis of vitamin K", "Carbohydrate and lipid metabolism", "Protein metabolism", "Synthesis of bile salts"],
        answerIndex: 0,
        explanation: "The liver uses vitamin K, but vitamin K is supplied by diet and gut bacteria rather than synthesized by the liver."
      },
      {
        id: "q20-postabsorptive-gluconeogenesis",
        source: "Question 20",
        kind: "multiple-choice",
        prompt: "In gluconeogenesis, during the postabsorptive state, amino acids and _____ are converted to glucose.",
        choices: ["Glycogen", "Acetyl CoA", "Glucagon", "Glycerol"],
        answerIndex: 3,
        explanation: "Amino acids and glycerol are common substrates for making new glucose."
      },
      {
        id: "q21-complex-carbs",
        source: "Question 21",
        kind: "multiple-choice",
        prompt: "Which of the following provides a good source of complex carbohydrates?",
        choices: ["Chicken breast", "Fruit", "Grain", "Vegetable oil"],
        answerIndex: 2,
        explanation: "Grains are a major source of starch, a complex carbohydrate."
      },
      {
        id: "q22-energy-per-gram",
        source: "Question 22",
        kind: "multiple-choice",
        prompt: "Which nutrients yield the highest amount of energy per gram when metabolized?",
        choices: ["Vitamins and minerals", "Proteins", "Foods and beverages high in caffeine", "Fats"],
        answerIndex: 3,
        explanation: "Fats yield about 9 kcal per gram, more than carbohydrates or proteins."
      },
      {
        id: "q23-fadh2-atp",
        source: "Question 23",
        kind: "multiple-choice",
        prompt: "Which of the following is correct?",
        choices: [
          "Most ATP from cellular respiration are produced directly in the citric acid (Krebs) cycle.",
          "Most of the ATP are produced by substrate-level phosphorylation.",
          "Glycolysis relies on substrate-level oxidation for the four ATP produced in this pathway.",
          "Each FADH2 yields about 1.5 ATP via oxidative phosphorylation."
        ],
        answerIndex: 3,
        explanation: "FADH2 enters the electron transport chain downstream of NADH and yields about 1.5 ATP."
      },
      {
        id: "q24-complete-proteins",
        source: "Question 24",
        kind: "multiple-choice",
        prompt: "Which food groups are considered good sources of complete proteins?",
        choices: [
          "Corn, cottonseed oil, soy oil, and wheat germ",
          "Eggs, milk, yogurt, meat, and fish",
          "Egg yolk, fish roe (eggs), and grains",
          "Lima beans, kidney beans, nuts, and cereals"
        ],
        answerIndex: 1,
        explanation: "Animal proteins such as eggs, dairy, meat, and fish usually contain all essential amino acids."
      },
      {
        id: "q25-ldl-not-function",
        source: "Question 25",
        kind: "multiple-choice",
        prompt: "Which is not a function of low-density lipoproteins (LDLs)?",
        choices: [
          "Transport cholesterol from the peripheral tissues to the liver",
          "Make cholesterol available to tissue cells for membrane formation",
          "Assist in the storage of cholesterol when supply exceeds demand",
          "Make cholesterol available to tissue cells for hormone synthesis"
        ],
        answerIndex: 0,
        explanation: "Returning cholesterol from peripheral tissues to the liver is mainly an HDL role."
      },
      {
        id: "q26-negative-nitrogen-balance",
        source: "Question 26",
        kind: "multiple-choice",
        prompt: "Which best defines negative nitrogen balance?",
        choices: [
          "Protein breakdown exceeds protein synthesis.",
          "A negative nitrogen balance is normal and is a way of maintaining homeostasis.",
          "It is a condition usually caused by having a diet low in fish and meat.",
          "It occurs when amino acids are broken down by liver enzymes and carried to the bloodstream."
        ],
        answerIndex: 0,
        explanation: "Negative nitrogen balance means the body is losing more protein nitrogen than it gains."
      },
      {
        id: "q27-goiter-mineral",
        source: "Question 27",
        kind: "multiple-choice",
        prompt: "While traveling abroad in Africa you observe many people with goiter, an enlarged thyroid. Which mineral deficiency could be responsible?",
        choices: ["Chromium", "Fluorine", "Iodine", "Iron"],
        answerIndex: 2,
        explanation: "Iodine is required to make thyroid hormones; deficiency can cause goiter."
      },
      {
        id: "q28-obesity",
        source: "Question 28",
        kind: "written",
        prompt: "What is obesity, and what health problems accompany or follow its onset?",
        sampleAnswer: [
          "Obesity is excessive accumulation of body fat, often defined clinically by body weight far above desirable range or a BMI of 30 or higher.",
          "It increases risk for hypertension, atherosclerosis, coronary artery disease, stroke, type 2 diabetes, sleep apnea or respiratory strain, osteoarthritis, gallbladder disease, and some cancers."
        ],
        explanation: "For full credit, define obesity and connect it to multiple downstream health risks."
      },
      {
        id: "q29-young-coronary-disease",
        source: "Question 29",
        kind: "written",
        prompt: "Hank, a 17-year-old high school student, suffered a heart attack during a recreational swim. An autopsy revealed atherosclerosis and death from coronary artery disease. What might have caused this disease that usually strikes much older people?",
        sampleAnswer: [
          "The young age strongly suggests an inherited lipid disorder, especially familial hypercholesterolemia.",
          "Very high LDL cholesterol can drive early plaque buildup, atherosclerosis, coronary artery disease, and premature heart attack."
        ],
        explanation: "Diet and lifestyle can contribute, but premature severe coronary disease points strongly toward a genetic cholesterol disorder."
      }
    ]
  };
})();
