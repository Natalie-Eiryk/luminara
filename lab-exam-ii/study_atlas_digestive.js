Object.assign(window.STUDY_DATA.atlas, {
  Digestive: {
    title: "Digestive pathway board",
    summary: "A simplified gut and accessory-organ plate for rehearsing the order of the digestive tract plus the organs students often confuse in lab.",
    checks: [
      "Trace food from mouth to rectum before naming accessory organs.",
      "Use stomach clues first, then separate liver, gall bladder, and pancreas.",
      "Say what proves small intestine versus large intestine."
    ],
    parts: [
      {
        id: "mouth",
        label: "Oral cavity",
        description: "Starting point for ingestion and early mechanical breakdown."
      },
      {
        id: "esophagus",
        label: "Esophagus",
        description: "Muscular tube that carries the bolus from the pharynx to the stomach."
      },
      {
        id: "liver",
        label: "Liver",
        description: "Large accessory organ that makes bile and anchors orientation in the upper abdomen."
      },
      {
        id: "stomach",
        label: "Stomach",
        description: "Expanded sac with curvatures and rugae that stores and churns food."
      },
      {
        id: "gallbladder",
        label: "Gall bladder",
        description: "Small bile storage sac tucked under the liver."
      },
      {
        id: "pancreas",
        label: "Pancreas",
        description: "Elongated gland posterior to the stomach with digestive and endocrine roles."
      },
      {
        id: "small-intestine",
        label: "Small intestine",
        description: "Long absorptive tube with villi that fills the center of the abdomen."
      },
      {
        id: "large-intestine",
        label: "Large intestine",
        description: "Framing tube around the small intestine that includes cecum, colon, and rectum."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Digestive atlas diagram">
  <defs>
    <linearGradient id="dig-tube" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffd98d" />
      <stop offset="100%" stop-color="#ff9d76" />
    </linearGradient>
    <linearGradient id="dig-organ" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#56d1b3" />
      <stop offset="100%" stop-color="#1f8d8a" />
    </linearGradient>
  </defs>
  <path class="body-shell" d="M260 42c74 0 126 46 126 114 0 44-22 78-22 125 0 96-56 171-104 171s-104-75-104-171c0-47-22-81-22-125 0-68 52-114 126-114z" />
  <g class="diagram-part" data-part="mouth">
    <ellipse class="diagram-shape" cx="260" cy="90" rx="34" ry="18" fill="#ffd98d" />
    <text class="diagram-label" x="306" y="86">Oral cavity</text>
  </g>
  <g class="diagram-part" data-part="esophagus">
    <rect class="diagram-shape" x="250" y="108" width="20" height="98" rx="10" fill="url(#dig-tube)" />
    <text class="diagram-label" x="302" y="152">Esophagus</text>
  </g>
  <g class="diagram-part" data-part="liver">
    <path class="diagram-shape" d="M172 182c26-25 78-33 141-14 21 6 40 20 42 39-6 28-44 45-92 45-62 0-101-25-91-70z" fill="url(#dig-organ)" />
    <text class="diagram-label" x="104" y="186">Liver</text>
  </g>
  <g class="diagram-part" data-part="gallbladder">
    <path class="diagram-shape" d="M310 230c0-15 10-24 21-24 10 0 18 9 18 22 0 15-11 34-19 45-9-11-20-28-20-43z" fill="#8be8a9" />
    <text class="diagram-label" x="362" y="224">Gall bladder</text>
  </g>
  <g class="diagram-part" data-part="stomach">
    <path class="diagram-shape" d="M206 232c-10 0-24 12-27 29-6 38 10 89 47 89 33 0 54-17 63-45 8-23 5-57-11-72-16-15-50-18-72-1z" fill="#ffb571" />
    <text class="diagram-label" x="104" y="280">Stomach</text>
  </g>
  <g class="diagram-part" data-part="pancreas">
    <path class="diagram-shape" d="M245 318c13-14 60-18 96-9 20 4 27 16 16 28-14 16-88 24-118 12-14-5-12-19 6-31z" fill="#56d1b3" />
    <text class="diagram-label" x="356" y="332">Pancreas</text>
  </g>
  <g class="diagram-part" data-part="small-intestine">
    <path class="diagram-shape" d="M205 340c-26 10-43 43-26 61 13 14 39 12 53 2 9-6 20-7 28-2 12 8 27 7 39 2 12-6 28-7 43-1 16 6 34 4 42-11 11-20-4-48-23-60-21-13-43-9-57-3-13 5-29 5-42 0-21-9-37-7-57 12z" fill="#f8f3d1" />
    <path class="diagram-detail" d="M198 374c19-5 34 2 47 12M232 404c20-8 37-7 54 2M292 378c14-6 31-4 44 5" />
    <text class="diagram-label" x="90" y="386">Small intestine</text>
  </g>
  <g class="diagram-part" data-part="large-intestine">
    <path class="diagram-shape" d="M161 312c0-20 15-35 35-35h128c20 0 35 15 35 35v114c0 20-15 35-35 35h-27v-34h-74v34h-27c-20 0-35-15-35-35z" fill="none" stroke="#ffd56a" stroke-width="18" stroke-linejoin="round" />
    <text class="diagram-label" x="336" y="430">Large intestine</text>
  </g>
</svg>`
  }
});
