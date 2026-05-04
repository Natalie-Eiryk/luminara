Object.assign(window.STUDY_DATA.atlas, {
  Histology: {
    title: "Histology clue wall",
    summary: "This board is a visual memory wall rather than a body diagram. Each tile stands for a classic slide pattern you should be able to identify quickly during review.",
    checks: [
      "Say the organ before you say the epithelium.",
      "Name the clue that rules out the nearest look-alike tissue.",
      "Use the wall as a rapid warm-up before full quiz sessions."
    ],
    parts: [
      {
        id: "trachea",
        label: "Trachea",
        description: "Think pseudostratified ciliated columnar epithelium plus cartilage."
      },
      {
        id: "lung",
        label: "Lung",
        description: "Large open air spaces lined by thin simple squamous epithelium."
      },
      {
        id: "kidney",
        label: "Kidney cortex",
        description: "Renal corpuscles and packed tubules anchor cortex immediately."
      },
      {
        id: "thyroid",
        label: "Thyroid",
        description: "Round follicles full of colloid are the giveaway."
      },
      {
        id: "adrenal",
        label: "Adrenal",
        description: "Layered cortex with a distinct medulla inside."
      },
      {
        id: "testis",
        label: "Testis",
        description: "Seminiferous tubules dominate the slide."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Histology clue board">
  <rect x="62" y="70" width="396" height="380" rx="28" class="panel-shell" />
  <g class="diagram-part" data-part="trachea">
    <rect class="diagram-shape" x="98" y="108" width="136" height="120" rx="18" fill="#56d1b3" />
    <path class="diagram-detail" d="M112 146h108M112 168h108M112 190h108" />
    <circle class="diagram-detail" cx="126" cy="210" r="10" />
    <circle class="diagram-detail" cx="160" cy="210" r="10" />
    <circle class="diagram-detail" cx="194" cy="210" r="10" />
    <text class="figure-heading" x="166" y="134" text-anchor="middle">Trachea</text>
  </g>
  <g class="diagram-part" data-part="lung">
    <rect class="diagram-shape" x="286" y="108" width="136" height="120" rx="18" fill="#f8f3d1" />
    <circle class="diagram-detail" cx="316" cy="150" r="18" />
    <circle class="diagram-detail" cx="350" cy="166" r="16" />
    <circle class="diagram-detail" cx="380" cy="146" r="20" />
    <circle class="diagram-detail" cx="396" cy="184" r="14" />
    <text class="figure-heading" x="354" y="134" text-anchor="middle">Lung</text>
  </g>
  <g class="diagram-part" data-part="kidney">
    <rect class="diagram-shape" x="98" y="252" width="136" height="120" rx="18" fill="#ff9d76" />
    <circle class="diagram-detail" cx="130" cy="290" r="16" />
    <circle class="diagram-detail" cx="170" cy="314" r="15" />
    <circle class="diagram-detail" cx="198" cy="286" r="13" />
    <text class="figure-heading" x="166" y="278" text-anchor="middle">Kidney cortex</text>
  </g>
  <g class="diagram-part" data-part="thyroid">
    <rect class="diagram-shape" x="286" y="252" width="136" height="120" rx="18" fill="#ffd98d" />
    <circle class="diagram-detail" cx="322" cy="288" r="17" />
    <circle class="diagram-detail" cx="356" cy="318" r="17" />
    <circle class="diagram-detail" cx="390" cy="290" r="17" />
    <text class="figure-heading" x="354" y="278" text-anchor="middle">Thyroid</text>
  </g>
  <g class="diagram-part" data-part="adrenal">
    <path class="diagram-shape" d="M146 402c20-20 80-20 100 0M308 402c20-20 80-20 100 0" fill="none" stroke="#ffd56a" stroke-width="16" stroke-linecap="round" />
    <text class="diagram-label" x="110" y="436">Adrenal layers</text>
  </g>
  <g class="diagram-part" data-part="testis">
    <path class="diagram-shape" d="M286 388c42 0 68 20 83 54" fill="none" stroke="#56d1b3" stroke-width="14" stroke-linecap="round" />
    <path class="diagram-shape" d="M314 388c34 0 56 18 69 48" fill="none" stroke="#56d1b3" stroke-width="14" stroke-linecap="round" />
    <text class="diagram-label" x="316" y="438">Seminiferous tubules</text>
  </g>
</svg>`
  }
});
