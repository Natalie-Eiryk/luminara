Object.assign(window.STUDY_DATA.atlas, {
  Endocrine: {
    title: "Endocrine landmark board",
    summary: "A gland-location board for rehearsing where each major endocrine organ sits and which architectural clue makes it memorable on slides.",
    checks: [
      "Name the neck gland before the abdominal glands.",
      "Pair each gland with its signature architecture clue.",
      "Remember that pancreas, ovaries, and testes also count here."
    ],
    parts: [
      {
        id: "pituitary",
        label: "Pituitary gland",
        description: "Master endocrine gland hanging below the brain."
      },
      {
        id: "thyroid",
        label: "Thyroid gland",
        description: "Butterfly-shaped neck gland recognized on histology by follicles."
      },
      {
        id: "adrenal",
        label: "Adrenal glands",
        description: "Paired superior caps above the kidneys with cortex and medulla."
      },
      {
        id: "pancreas",
        label: "Pancreas",
        description: "Mixed gland in the upper abdomen with endocrine islets inside."
      },
      {
        id: "ovaries",
        label: "Ovaries",
        description: "Female gonads with endocrine function and visible follicles."
      },
      {
        id: "testes",
        label: "Testes",
        description: "Male gonads that also act as endocrine organs."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Endocrine atlas diagram">
  <path class="body-shell" d="M260 42c75 0 130 49 130 122 0 42-20 74-20 118 0 99-52 180-110 180S150 381 150 282c0-44-20-76-20-118 0-73 55-122 130-122z" />
  <g class="diagram-part" data-part="pituitary">
    <circle class="diagram-shape" cx="260" cy="94" r="18" fill="#ffd56a" />
    <text class="diagram-label" x="294" y="90">Pituitary</text>
  </g>
  <g class="diagram-part" data-part="thyroid">
    <path class="diagram-shape" d="M214 152c0-19 15-33 33-33 10 0 18 4 23 12 5-8 13-12 23-12 18 0 33 14 33 33 0 24-14 43-33 43-10 0-18-4-23-12-5 8-13 12-23 12-19 0-33-19-33-43z" fill="#ff9d76" />
    <text class="diagram-label" x="336" y="156">Thyroid gland</text>
  </g>
  <g class="diagram-part" data-part="adrenal">
    <path class="diagram-shape" d="M194 228c10-22 31-28 48-15 11 9 12 23 2 35-12 15-38 17-55 2-8-7-7-12 5-22z" fill="#ffd98d" />
    <path class="diagram-shape" d="M326 228c-10-22-31-28-48-15-11 9-12 23-2 35 12 15 38 17 55 2 8-7 7-12-5-22z" fill="#ffd98d" />
    <text class="diagram-label" x="88" y="224">Adrenal glands</text>
  </g>
  <g class="diagram-part" data-part="pancreas">
    <path class="diagram-shape" d="M188 286c14-12 72-20 116-11 26 5 37 20 22 34-17 16-105 28-140 14-17-7-16-24 2-37z" fill="#56d1b3" />
    <text class="diagram-label" x="336" y="300">Pancreas</text>
  </g>
  <g class="diagram-part" data-part="ovaries">
    <ellipse class="diagram-shape" cx="198" cy="410" rx="28" ry="18" fill="#f8f3d1" />
    <ellipse class="diagram-shape" cx="322" cy="410" rx="28" ry="18" fill="#f8f3d1" />
    <path class="diagram-detail" d="M225 406c12-8 25-14 35-14s23 6 35 14" />
    <text class="diagram-label" x="336" y="394">Ovaries</text>
  </g>
  <g class="diagram-part" data-part="testes">
    <ellipse class="diagram-shape" cx="232" cy="468" rx="20" ry="26" fill="#ffb571" />
    <ellipse class="diagram-shape" cx="288" cy="468" rx="20" ry="26" fill="#ffb571" />
    <text class="diagram-label" x="316" y="476">Testes</text>
  </g>
</svg>`
  }
});
