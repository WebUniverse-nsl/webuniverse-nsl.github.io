'use strict';

const stages = [
  ['REAL SOURCES → TASKS', 'Construct tasks from repositories and web pages.', 'Extract application behavior from repository code and documentation to generate text-grounded tasks. Collect screenshots and supporting assets from real web pages to construct vision-grounded tasks.'],
  ['TASKS + WORKSPACES → SOLUTIONS', 'Let agents develop in executable workspaces.', 'Agents edit code, run the application and inspect it in a browser. Independent sampling starts a fresh conversation; trajectory refinement can continue from a saved workspace and available failure feedback.'],
  ['DELIVERED APPLICATIONS → VERIFICATION', 'Check behavior and appearance against the task.', 'Browser scripts or a GUI agent verify functional requirements. A visual judge compares pages with reference screenshots. The task inputs, initial workspace and verification criteria also form reusable environments.'],
  ['PASSING SOLUTIONS → TRAINING DATA', 'Select trajectories for training and reuse.', 'Apply task-specific passing conditions, then check trajectory structure, image references and training-format compatibility. The selected trajectories form WebUniverse-Mix; the corresponding tasks are packaged as WebUniverse-Env.']
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
    const next = {ArrowRight: (index + 1) % 4, ArrowLeft: (index + 3) % 4, Home: 0, End: 3}[event.key];
    if (next !== undefined) { event.preventDefault(); selectStage(next, true); }
  });
});
document.querySelector('.stage-tabs').hidden = false;
stagePanel.hidden = false;

const versions = {
  v1: {counts: [6355, 4145, 1283, 1069, 2148], description: 'trajectories · paper training set'},
  v2: {counts: [6947, 4895, 3611, 1993, 2901], description: 'trajectories · complete expanded release'}
};
document.querySelectorAll('[data-version]').forEach(button => button.addEventListener('click', () => {
  const version = button.dataset.version;
  const {counts, description} = versions[version];
  const total = counts.reduce((sum, n) => sum + n, 0);
  const textShare = (counts[0] + counts[1]) / total * 100;
  document.querySelectorAll('[data-version]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('[data-count]').forEach(cell => { cell.textContent = counts[Number(cell.dataset.count)].toLocaleString('en-US'); });
  document.querySelector('#trajectory-total').textContent = total.toLocaleString('en-US');
  document.querySelector('#version-description').textContent = description;
  document.querySelector('#text-share').style.width = `${textShare}%`;
  document.querySelector('#vision-share').style.width = `${100 - textShare}%`;
  const precision = version === 'v1' ? 0 : 1;
  document.querySelector('#text-percent').textContent = `${textShare.toFixed(precision)}%`;
  document.querySelector('#vision-percent').textContent = `${(100 - textShare).toFixed(precision)}%`;
  document.querySelector('#version-announcement').textContent = `${version}: ${total.toLocaleString('en-US')} trajectories.`;
}));
document.querySelector('.version-controls').hidden = false;

const ablationToggle = document.querySelector('#show-ablations');
function updateAblations() {
  document.querySelectorAll('.ablation-row').forEach(row => { row.hidden = !ablationToggle.checked; });
}
ablationToggle.addEventListener('change', updateAblations);
updateAblations();
document.querySelector('.ablation-control').hidden = false;

document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-example]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#functional-example').hidden = button.dataset.example !== 'functional';
  document.querySelector('#visual-example').hidden = button.dataset.example !== 'visual';
}));
document.querySelector('#visual-example').hidden = true;
document.querySelector('.example-controls').hidden = false;
