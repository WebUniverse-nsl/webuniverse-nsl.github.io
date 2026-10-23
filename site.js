'use strict';

const stages = [
  ['REAL SOURCES → TASKS', 'Construct tasks from repositories and web pages.', 'Extract application behavior from repository code and documentation to generate text-grounded tasks. Collect screenshots and supporting assets from real web pages to construct vision-grounded tasks.'],
  ['TASKS + WORKSPACES + CODING AGENTS → CANDIDATE SOLUTION', 'Let agents develop in executable workspaces.', 'Collect development trajectories through independent sampling and trajectory refinement. Independent sampling starts a fresh conversation from the designated task workspace. Refinement continues failed or interrupted attempts through workspace handover or conversation continuation.'],
  ['CANDIDATE SOLUTION → VERIFIED SOLUTION', 'Check behavior and appearance against the task.', 'Browser scripts or a GUI agent verify functional requirements. A model-based visual judge compares pages with reference screenshots. Verification outcomes inform trajectory selection; available failure feedback is used for trajectory refinement.'],
  ['VERIFIED TRAJECTORIES → TRAINING DATA', 'Select trajectories for training and reuse.', 'Apply task-specific passing conditions, then check trajectory structure, image references and training-format compatibility. The selected trajectories form WebUniverse-Mix.'],
  ['TASK INPUTS + WORKSPACES + VERIFICATION CRITERIA → WEBUNIVERSE-ENV', 'Package reusable task environments.', 'Package task inputs, workspaces, and verification criteria as WebUniverse-Env. Reuse these environments for further solving, verification, and trajectory collection.']
];
const stageTabs = [...document.querySelectorAll('[data-stage]')];
const stagePanel = document.querySelector('#stage-panel');
function selectStage(index, focus = false) {
  stageTabs.forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
  });
  stagePanel.setAttribute('aria-labelledby', stageTabs[index].id);
  stagePanel.querySelector('.stage-kicker').textContent = stages[index][0];
  stagePanel.querySelector('h3').textContent = stages[index][1];
  stagePanel.querySelector('.stage-description').textContent = stages[index][2];
  if (focus) stageTabs[index].focus();
}
stageTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectStage(index));
  button.addEventListener('keydown', event => {
    const next = {ArrowRight: (index + 1) % stages.length, ArrowLeft: (index + stages.length - 1) % stages.length, Home: 0, End: stages.length - 1}[event.key];
    if (next !== undefined) { event.preventDefault(); selectStage(next, true); }
  });
});
document.querySelector('.stage-tabs').hidden = false;
stagePanel.hidden = false;

const release = {
  "counts": [
    6355,
    4145,
    1283,
    1069,
    2148
  ],
  "envCounts": [
    6355,
    4145,
    1283,
    1069,
    2148
  ],
  "methodCounts": [
    13026,
    1974
  ],
  "jointCounts": [
    [
      5961,
      394
    ],
    [
      3855,
      290
    ],
    [
      394,
      889
    ],
    [
      1069,
      0
    ],
    [
      1747,
      401
    ]
  ]
};
window.renderWebUniverseSunburst(document.querySelector('#task-sunburst'), document.querySelector('#task-readout'), {kind: 'tasks', version: 'the release', counts: release.counts});
document.querySelector('.sunburst-grid').hidden = false;
document.querySelector('.sunburst-family-legend').hidden = false;
document.querySelector('#release-count-details').open = false;

document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-example]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#functional-example').hidden = button.dataset.example !== 'functional';
  document.querySelector('#visual-example').hidden = button.dataset.example !== 'visual';
}));
document.querySelector('#visual-example').hidden = true;
document.querySelector('.example-controls').hidden = false;

document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
  const interactive = button.dataset.preview === 'interactive';
  document.querySelectorAll('[data-preview]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#functional-comparison').hidden = interactive;
  document.querySelector('.functional-grid').hidden = !interactive;
  document.querySelectorAll('.live-preview').forEach(item => {
    item.hidden = !interactive;
    const frame = item.querySelector('iframe');
    if (interactive && !frame.hasAttribute('src')) frame.src = frame.dataset.src;
  });
  document.querySelector('#interactive-hint').hidden = !interactive;
}));
document.querySelector('.preview-controls').hidden = false;

const comparisonDialog = document.querySelector('.comparison-dialog');
const enlargedArt = comparisonDialog.querySelector('.enlarged-art');
const enlargeScroll = comparisonDialog.querySelector('.enlarge-scroll');
let zoom = 1;
function setComparisonZoom(value) {
  zoom = Math.min(4, Math.max(1, value));
  enlargedArt.style.width = `${zoom * 100}%`;
  comparisonDialog.querySelector('[data-zoom="reset"]').textContent = `${Math.round(zoom * 100)}%`;
  comparisonDialog.querySelector('[data-zoom="out"]').disabled = zoom === 1;
  comparisonDialog.querySelector('[data-zoom="in"]').disabled = zoom === 4;
}
document.querySelectorAll('[data-enlarge]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const figure = link.closest('figure');
  const art = figure.querySelector('img');
  enlargedArt.src = art.src;
  enlargedArt.alt = art.alt;
  comparisonDialog.querySelector('h2').textContent = link.closest('.scaling-plots') ? `${figure.querySelector('figcaption').textContent} · Data scaling` : link.closest('#visual-example') ? 'Visual reproduction' : 'Functional development';
  setComparisonZoom(1);
  comparisonDialog.showModal();
  enlargeScroll.scrollTo(0, 0);
}));
comparisonDialog.querySelector('[data-zoom="in"]').addEventListener('click', () => setComparisonZoom(zoom + 0.5));
comparisonDialog.querySelector('[data-zoom="out"]').addEventListener('click', () => setComparisonZoom(zoom - 0.5));
comparisonDialog.querySelector('[data-zoom="reset"]').addEventListener('click', () => { setComparisonZoom(1); enlargeScroll.scrollTo(0, 0); });
comparisonDialog.querySelector('[data-close-comparison]').addEventListener('click', () => comparisonDialog.close());
comparisonDialog.addEventListener('click', event => { if (event.target === comparisonDialog) comparisonDialog.close(); });
