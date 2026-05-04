Object.assign(window.STUDY_DATA.atlas, {
  Reproductive: {
    title: "Reproductive comparison board",
    summary: "A side-by-side male and female reference plate for separating gonads, ducts, glands, and the structures students confuse most often during lab practicals.",
    checks: [
      "Keep the male and female pathways separate in your head before naming any structure.",
      "Use the side-by-side view to compare ducts, gonads, and accessory glands.",
      "Tie each structure to what moves through it next."
    ],
    parts: [
      {
        id: "testes",
        label: "Testes and epididymis",
        description: "Male gonads with the attached coiled epididymis where sperm mature."
      },
      {
        id: "vas",
        label: "Vas deferens",
        description: "Muscular duct carrying sperm away from the epididymis."
      },
      {
        id: "prostate",
        label: "Prostate and glands",
        description: "Accessory gland region around the proximal urethra."
      },
      {
        id: "uterus",
        label: "Uterus",
        description: "Central female reproductive organ between the uterine tubes and vagina."
      },
      {
        id: "tubes",
        label: "Uterine tubes and ovaries",
        description: "Lateral female structures that collect the oocyte and connect the ovary region to the uterus."
      },
      {
        id: "cervix",
        label: "Cervix and vagina",
        description: "Lower narrow uterine region leading into the vaginal canal."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Reproductive atlas diagram">
  <rect x="60" y="54" width="170" height="412" rx="26" class="panel-shell" />
  <rect x="290" y="54" width="170" height="412" rx="26" class="panel-shell" />
  <text class="figure-heading" x="145" y="92" text-anchor="middle">Male</text>
  <text class="figure-heading" x="375" y="92" text-anchor="middle">Female</text>
  <g class="diagram-part" data-part="vas">
    <path class="diagram-shape" d="M140 144c0 35 38 52 52 78 14 25 14 58 14 89" fill="none" stroke="#56d1b3" stroke-width="10" stroke-linecap="round" />
    <path class="diagram-shape" d="M150 144c0 18 14 29 28 41" fill="none" stroke="#56d1b3" stroke-width="10" stroke-linecap="round" />
    <text class="diagram-label" x="72" y="154">Vas deferens</text>
  </g>
  <g class="diagram-part" data-part="prostate">
    <path class="diagram-shape" d="M156 286c10-20 33-30 50-21 16 8 22 27 14 46-7 16-20 27-39 27-23 0-40-24-25-52z" fill="#ffd98d" />
    <circle class="diagram-shape" cx="180" cy="364" r="8" fill="#ff9d76" />
    <circle class="diagram-shape" cx="198" cy="364" r="8" fill="#ff9d76" />
    <text class="diagram-label" x="74" y="304">Prostate and glands</text>
  </g>
  <g class="diagram-part" data-part="testes">
    <ellipse class="diagram-shape" cx="164" cy="420" rx="24" ry="32" fill="#ffb571" />
    <ellipse class="diagram-shape" cx="208" cy="420" rx="24" ry="32" fill="#ffb571" />
    <path class="diagram-detail" d="M152 392c16 8 16 32 2 46M196 392c16 8 16 32 2 46" />
    <text class="diagram-label" x="64" y="422">Testes and epididymis</text>
  </g>
  <g class="diagram-part" data-part="uterus">
    <path class="diagram-shape" d="M350 234c0-30 18-52 25-52s25 22 25 52v55c0 23-18 43-25 43s-25-20-25-43z" fill="#ff9d76" />
    <text class="diagram-label" x="314" y="246">Uterus</text>
  </g>
  <g class="diagram-part" data-part="tubes">
    <path class="diagram-shape" d="M375 194c-28-24-60-34-74-29-10 4-12 15-3 22 13 9 41 8 56 20M375 194c28-24 60-34 74-29 10 4 12 15 3 22-13 9-41 8-56 20" fill="none" stroke="#56d1b3" stroke-width="10" stroke-linecap="round" />
    <ellipse class="diagram-shape" cx="299" cy="176" rx="16" ry="12" fill="#f8f3d1" />
    <ellipse class="diagram-shape" cx="451" cy="176" rx="16" ry="12" fill="#f8f3d1" />
    <text class="diagram-label" x="306" y="150">Uterine tubes and ovaries</text>
  </g>
  <g class="diagram-part" data-part="cervix">
    <path class="diagram-shape" d="M364 332c0 14 5 24 11 31 6 7 9 17 9 31v48" fill="none" stroke="#ffd56a" stroke-width="14" stroke-linecap="round" />
    <text class="diagram-label" x="306" y="370">Cervix and vagina</text>
  </g>
</svg>`
  }
});
