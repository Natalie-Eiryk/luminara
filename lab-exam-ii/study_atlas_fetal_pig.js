Object.assign(window.STUDY_DATA.atlas, {
  "Fetal Pig": {
    title: "Fetal pig comparison board",
    summary: "A study plate that treats the fetal pig as a comparison model. The goal is not perfect anatomy art; it is remembering the pig-specific landmarks that make stations easier to recognize.",
    checks: [
      "Map each pig landmark to the human system it helps you remember.",
      "Use the palate and spiral colon as fast anchors.",
      "Practice saying whether a membrane lines the wall or covers the organ."
    ],
    parts: [
      {
        id: "palate",
        label: "Hard and soft palate",
        description: "Anterior bony palate followed by the posterior muscular palate."
      },
      {
        id: "stomach",
        label: "Stomach",
        description: "Food-processing sac that helps orient the upper digestive tract."
      },
      {
        id: "spiral",
        label: "Spiral colon",
        description: "Pig-specific large-intestine arrangement that stands out immediately."
      },
      {
        id: "cecum",
        label: "Cecum",
        description: "Pouch at the start of the large intestine."
      },
      {
        id: "horns",
        label: "Uterine horns",
        description: "Distinct female reproductive extensions found in the fetal pig."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Fetal pig atlas diagram">
  <path class="body-shell" d="M92 260c0-82 66-146 154-146h68c62 0 114 38 139 89 25 51 18 112-19 154-30 34-73 54-124 54h-59c-88 0-159-68-159-151z" />
  <path class="body-shell" d="M426 242c24-2 42 13 42 34s-18 36-42 34" />
  <path class="body-shell" d="M126 166c-34-20-59-20-76 7 31-8 53-1 71 18" />
  <g class="diagram-part" data-part="palate">
    <path class="diagram-shape" d="M150 214c16-10 37-14 56-9 6 2 8 9 4 14-9 11-38 17-63 15-10-1-9-14 3-20z" fill="#ffd98d" />
    <path class="diagram-shape" d="M148 236c21-1 42 1 56 10 10 6 6 18-6 19-25 2-56-8-66-18-6-6 3-11 16-11z" fill="#ff9d76" />
    <text class="diagram-label" x="76" y="210">Hard / soft palate</text>
  </g>
  <g class="diagram-part" data-part="stomach">
    <path class="diagram-shape" d="M232 218c-26 0-50 25-50 59 0 43 27 71 64 71 28 0 46-13 58-38 13-28 8-65-11-82-16-14-35-10-61-10z" fill="#56d1b3" />
    <text class="diagram-label" x="180" y="196">Stomach</text>
  </g>
  <g class="diagram-part" data-part="spiral">
    <path class="diagram-shape" d="M314 250c34 4 59 27 59 56s-22 53-56 53c-29 0-49-15-49-37 0-18 13-30 31-30 13 0 23 8 23 18 0 7-5 12-11 12" fill="none" stroke="#ffd56a" stroke-width="16" stroke-linecap="round" />
    <text class="diagram-label" x="358" y="236">Spiral colon</text>
  </g>
  <g class="diagram-part" data-part="cecum">
    <path class="diagram-shape" d="M248 360c12-15 33-20 48-12 15 8 18 30 8 49-13 23-40 31-56 17-14-12-14-35 0-54z" fill="#f8f3d1" />
    <text class="diagram-label" x="196" y="416">Cecum</text>
  </g>
  <g class="diagram-part" data-part="horns">
    <path class="diagram-shape" d="M286 388c18 18 34 28 55 33M286 388c24 0 48 8 82 28" fill="none" stroke="#ffb571" stroke-width="10" stroke-linecap="round" />
    <text class="diagram-label" x="340" y="440">Uterine horns</text>
  </g>
</svg>`
  }
});
