Object.assign(window.STUDY_DATA.atlas, {
  Urinary: {
    title: "Urinary flow board",
    summary: "A kidney and drainage board for keeping cortex, pelvis, ureter, bladder, and adrenal landmarks separate while you practice the urine pathway.",
    checks: [
      "Say the urine flow sequence from renal pyramid to ureter.",
      "Separate kidney blood supply terms from drainage terms.",
      "Point to the adrenal gland before naming the kidney."
    ],
    parts: [
      {
        id: "adrenal",
        label: "Adrenal glands",
        description: "Paired endocrine caps superior to the kidneys."
      },
      {
        id: "kidneys",
        label: "Kidneys",
        description: "Bean-shaped paired organs that filter blood and form urine."
      },
      {
        id: "pelvis",
        label: "Renal pelvis",
        description: "Funnel-like collection region at the hilum of each kidney."
      },
      {
        id: "ureters",
        label: "Ureters",
        description: "Paired muscular tubes carrying urine to the bladder."
      },
      {
        id: "bladder",
        label: "Urinary bladder",
        description: "Expandable storage sac for urine."
      },
      {
        id: "urethra",
        label: "Urethra",
        description: "Exit tube leaving the bladder."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Urinary atlas diagram">
  <defs>
    <linearGradient id="uri-kidney" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#56d1b3" />
      <stop offset="100%" stop-color="#297d8b" />
    </linearGradient>
  </defs>
  <path class="body-shell" d="M260 46c79 0 132 48 132 119 0 42-19 74-19 117 0 101-54 183-113 183S147 383 147 282c0-43-19-75-19-117 0-71 53-119 132-119z" />
  <g class="diagram-part" data-part="adrenal">
    <path class="diagram-shape" d="M174 140c10-25 31-33 49-19 12 10 12 30 0 43-15 16-40 14-54-4-6-8-5-13 5-20z" fill="#ffd56a" />
    <path class="diagram-shape" d="M346 140c-10-25-31-33-49-19-12 10-12 30 0 43 15 16 40 14 54-4 6-8 5-13-5-20z" fill="#ffd56a" />
    <text class="diagram-label" x="82" y="132">Adrenal glands</text>
  </g>
  <g class="diagram-part" data-part="kidneys">
    <path class="diagram-shape" d="M162 168c-34 0-56 34-56 74 0 56 32 112 78 112 39 0 58-25 58-65 0-74-31-121-80-121z" fill="url(#uri-kidney)" />
    <path class="diagram-shape" d="M358 168c34 0 56 34 56 74 0 56-32 112-78 112-39 0-58-25-58-65 0-74 31-121 80-121z" fill="url(#uri-kidney)" />
    <text class="diagram-label" x="73" y="220">Kidneys</text>
  </g>
  <g class="diagram-part" data-part="pelvis">
    <path class="diagram-shape" d="M220 250c18-4 24 8 20 19-4 12-13 19-25 22M300 250c-18-4-24 8-20 19 4 12 13 19 25 22" fill="none" stroke="#ff9d76" stroke-width="12" stroke-linecap="round" />
    <text class="diagram-label" x="314" y="248">Renal pelvis</text>
  </g>
  <g class="diagram-part" data-part="ureters">
    <path class="diagram-shape" d="M212 289c-18 42-24 84-18 127" fill="none" stroke="#ffb571" stroke-width="10" stroke-linecap="round" />
    <path class="diagram-shape" d="M308 289c18 42 24 84 18 127" fill="none" stroke="#ffb571" stroke-width="10" stroke-linecap="round" />
    <text class="diagram-label" x="314" y="322">Ureters</text>
  </g>
  <g class="diagram-part" data-part="bladder">
    <path class="diagram-shape" d="M214 396c14-14 37-21 46-21s32 7 46 21c18 17 17 46 0 69-13 18-30 28-46 28s-33-10-46-28c-17-23-18-52 0-69z" fill="#f8f3d1" />
    <text class="diagram-label" x="318" y="424">Urinary bladder</text>
  </g>
  <g class="diagram-part" data-part="urethra">
    <path class="diagram-shape" d="M260 468v32" fill="none" stroke="#ffd98d" stroke-width="10" stroke-linecap="round" />
    <text class="diagram-label" x="302" y="496">Urethra</text>
  </g>
</svg>`
  }
});
