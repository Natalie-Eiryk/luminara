Object.assign(window.STUDY_DATA.atlas, {
  Respiratory: {
    title: "Respiratory route board",
    summary: "A schematic airway plate for tracing flow from upper airway to alveoli. Use it to rehearse branch levels and support structures before a station starts.",
    checks: [
      "Name the route air takes from the nasal cavity into the lungs.",
      "Separate the epiglottis, glottis, thyroid cartilage, and cricoid cartilage.",
      "Point to the diaphragm before you name any lung lobe."
    ],
    parts: [
      {
        id: "nasal",
        label: "Nasal cavity",
        description: "Upper airway chamber that warms, filters, and humidifies incoming air."
      },
      {
        id: "pharynx",
        label: "Pharynx",
        description: "Shared passage behind the nasal and oral cavities before air reaches the larynx."
      },
      {
        id: "larynx",
        label: "Larynx",
        description: "Voice box region that houses the glottis and sits superior to the trachea."
      },
      {
        id: "trachea",
        label: "Trachea",
        description: "Cartilage-supported airway tube descending to the main bronchi."
      },
      {
        id: "bronchi",
        label: "Primary bronchi",
        description: "First large airway branches after the trachea enters the thorax."
      },
      {
        id: "lungs",
        label: "Lungs",
        description: "Paired respiratory organs that contain the bronchial tree and alveoli."
      },
      {
        id: "alveoli",
        label: "Alveoli",
        description: "Tiny distal air sacs where gas exchange occurs."
      },
      {
        id: "diaphragm",
        label: "Diaphragm",
        description: "Main breathing muscle that forms the floor of the thoracic cavity."
      }
    ],
    svg: `
<svg viewBox="0 0 520 520" role="img" aria-label="Respiratory atlas diagram">
  <defs>
    <linearGradient id="resp-lungs" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6ae7d2" />
      <stop offset="100%" stop-color="#28a6b7" />
    </linearGradient>
    <linearGradient id="resp-airway" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffd98d" />
      <stop offset="100%" stop-color="#ff9d76" />
    </linearGradient>
  </defs>
  <path class="body-shell" d="M260 36c42 0 72 30 72 69 0 28-10 48-10 71v31c0 23 16 39 16 75 0 59-40 112-78 112s-78-53-78-112c0-36 16-52 16-75v-31c0-23-10-43-10-71 0-39 30-69 72-69z" />
  <g class="diagram-part" data-part="nasal">
    <ellipse class="diagram-shape" cx="260" cy="86" rx="38" ry="22" fill="#ffd98d" />
    <path class="diagram-shape" d="M246 86c0-8 7-14 14-14s14 6 14 14-7 14-14 14-14-6-14-14z" fill="#ffb571" />
    <text class="diagram-label" x="312" y="76">Nasal cavity</text>
  </g>
  <g class="diagram-part" data-part="pharynx">
    <rect class="diagram-shape" x="248" y="106" width="24" height="42" rx="11" fill="#ffbf80" />
    <text class="diagram-label" x="309" y="126">Pharynx</text>
  </g>
  <g class="diagram-part" data-part="larynx">
    <path class="diagram-shape" d="M241 154c0-10 8-18 19-18s19 8 19 18-8 18-19 18-19-8-19-18z" fill="url(#resp-airway)" />
    <text class="diagram-label" x="306" y="160">Larynx</text>
  </g>
  <g class="diagram-part" data-part="trachea">
    <rect class="diagram-shape" x="248" y="172" width="24" height="88" rx="12" fill="url(#resp-airway)" />
    <path class="diagram-detail" d="M248 190h24M248 208h24M248 226h24M248 244h24" />
    <text class="diagram-label" x="306" y="214">Trachea</text>
  </g>
  <g class="diagram-part" data-part="bronchi">
    <path class="diagram-shape" d="M260 260l-42 36a10 10 0 0 0 13 15l29-24 29 24a10 10 0 0 0 13-15l-42-36z" fill="#ff9d76" />
    <text class="diagram-label" x="318" y="290">Primary bronchi</text>
  </g>
  <g class="diagram-part" data-part="lungs">
    <path class="diagram-shape" d="M220 210c-42 16-73 60-73 120 0 48 23 93 58 121 14-12 26-29 33-49 8-24 10-47 10-70v-81c0-22-11-39-28-41z" fill="url(#resp-lungs)" />
    <path class="diagram-shape" d="M300 210c42 16 73 60 73 120 0 48-23 93-58 121-14-12-26-29-33-49-8-24-10-47-10-70v-81c0-22 11-39 28-41z" fill="url(#resp-lungs)" />
    <text class="diagram-label" x="88" y="276">Lungs</text>
  </g>
  <g class="diagram-part" data-part="alveoli">
    <circle class="diagram-shape" cx="180" cy="350" r="9" fill="#f8f3d1" />
    <circle class="diagram-shape" cx="196" cy="336" r="8" fill="#f8f3d1" />
    <circle class="diagram-shape" cx="199" cy="356" r="8" fill="#f8f3d1" />
    <circle class="diagram-shape" cx="214" cy="345" r="8" fill="#f8f3d1" />
    <text class="diagram-label" x="82" y="342">Alveoli</text>
  </g>
  <g class="diagram-part" data-part="diaphragm">
    <path class="diagram-shape" d="M130 428c26 28 80 48 130 48s104-20 130-48" fill="none" stroke="#ffd56a" stroke-width="18" stroke-linecap="round" />
    <text class="diagram-label" x="322" y="454">Diaphragm</text>
  </g>
</svg>`
  }
});
