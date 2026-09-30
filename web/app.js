/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECTS: AI (A*), ADSA (Graph & Max-Heap), OOPJ, Python Regression
 * Next-Level Interactive Simulation Engine
 * ==============================================================================
 */

// City Node Coordinates (scaled for canvas 900x480)
let NODES = {
  DEPOT:  { id: 'DEPOT',  name: 'Central Depot',     x: 80,  y: 410, type: 'depot' },
  INT_1:  { id: 'INT_1',  name: 'West Junction',     x: 240, y: 300, type: 'junction' },
  INT_2:  { id: 'INT_2',  name: 'Central Crossing',  x: 520, y: 270, type: 'junction' },
  INT_3:  { id: 'INT_3',  name: 'North Crossing',    x: 440, y: 110, type: 'junction' },
  BIN_01: { id: 'BIN_01', name: 'City Center Market',x: 230, y: 160, type: 'bin', capacity: 500, fill: 410, initialFill: 410, rate: 8.49, isCollected: false },
  BIN_02: { id: 'BIN_02', name: 'Greenwood Suburb',  x: 430, y: 35,  type: 'bin', capacity: 400, fill: 110, initialFill: 110, rate: 3.27, isCollected: false },
  BIN_03: { id: 'BIN_03', name: 'Railway Food St.',  x: 760, y: 70,  type: 'bin', capacity: 600, fill: 450, initialFill: 450, rate: 7.82, isCollected: false },
  BIN_04: { id: 'BIN_04', name: 'Riverside Park',    x: 830, y: 250, type: 'bin', capacity: 350, fill: 90,  initialFill: 90,  rate: 2.49, isCollected: false },
  BIN_05: { id: 'BIN_05', name: 'Metro Transit Hub', x: 670, y: 390, type: 'bin', capacity: 700, fill: 520, initialFill: 520, rate: 8.98, isCollected: false },
  BIN_06: { id: 'BIN_06', name: 'Tech University',   x: 350, y: 410, type: 'bin', capacity: 500, fill: 240, initialFill: 240, rate: 4.03, isCollected: false },
  BIN_07: { id: 'BIN_07', name: 'Grand Plaza Mall',  x: 540, y: 160, type: 'bin', capacity: 600, fill: 390, initialFill: 390, rate: 6.57, isCollected: false },
  BIN_08: { id: 'BIN_08', name: 'Old Town Alley',    x: 130, y: 70,  type: 'bin', capacity: 300, fill: 70,  initialFill: 70,  rate: 1.78, isCollected: false },
};

// Road Network Edges (Distance in km, Street Names & Real-time Traffic Factor)
const EDGES = [
  { u: 'DEPOT', v: 'INT_1', dist: 2.8, name: 'Harbor Expressway', traffic: 1.0 },
  { u: 'DEPOT', v: 'BIN_06', dist: 3.2, name: 'University Way', traffic: 1.1 },
  { u: 'INT_1', v: 'BIN_06', dist: 1.4, name: 'Campus Link', traffic: 1.0 },
  { u: 'INT_1', v: 'BIN_01', dist: 3.0, name: 'Market Central Ave', traffic: 1.4 },
  { u: 'INT_1', v: 'INT_2', dist: 3.2, name: 'Grand Trunk Blvd', traffic: 1.2 },
  { u: 'INT_2', v: 'BIN_05', dist: 1.4, name: 'Metro Flyover', traffic: 1.0 },
  { u: 'INT_2', v: 'BIN_07', dist: 3.0, name: 'Plaza Mall Arterial', traffic: 1.5 },
  { u: 'INT_2', v: 'BIN_04', dist: 3.2, name: 'Riverside Corridor', traffic: 1.1 },
  { u: 'BIN_05', v: 'BIN_04', dist: 2.8, name: 'East Ring Road', traffic: 1.0 },
  { u: 'BIN_01', v: 'BIN_08', dist: 3.2, name: 'Heritage Lane', traffic: 1.0 },
  { u: 'BIN_01', v: 'INT_3', dist: 2.8, name: 'North Market Rd', traffic: 1.3 },
  { u: 'BIN_01', v: 'BIN_07', dist: 3.2, name: 'Commerce Street', traffic: 1.2 },
  { u: 'INT_3', v: 'BIN_08', dist: 3.2, name: 'Old Town Bypass', traffic: 1.0 },
  { u: 'INT_3', v: 'BIN_02', dist: 2.0, name: 'Greenwood Highway', traffic: 1.0 },
  { u: 'INT_3', v: 'BIN_07', dist: 1.4, name: 'Mall Connector', traffic: 1.2 },
  { u: 'INT_3', v: 'BIN_03', dist: 3.2, name: 'Food St. Express', traffic: 1.4 },
  { u: 'BIN_07', v: 'BIN_03', dist: 2.8, name: 'Station Boulevard', traffic: 1.3 },
  { u: 'BIN_04', v: 'BIN_03', dist: 4.1, name: 'River-Station Link', traffic: 1.1 },
  { u: 'BIN_02', v: 'BIN_03', dist: 3.2, name: 'North-East Radial', traffic: 1.0 },
];

// Algorithm Comparison Models
let currentAlgoMode = 'astar'; // 'astar' | 'dijkstra' | 'conventional'
let showTrafficOverlay = false;

const ALGO_ROUTES = {
  astar: {
    name: 'NORMAL Route (A* AI)',
    path: ['DEPOT', 'INT_1', 'BIN_01', 'INT_1', 'INT_2', 'BIN_05', 'BIN_04', 'BIN_03', 'BIN_07', 'INT_2', 'INT_1', 'BIN_06', 'DEPOT'],
    dist: 33.90,
    fuel: 9.69,
    saved: '39.5%',
    co2: '16.9 kg',
    color: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    desc: 'Heuristic f(n)=g(n)+h(n) optimizes multi-stop path visiting urgent bins.'
  },
  dijkstra: {
    name: 'WARNING Route (Dijkstra)',
    path: ['DEPOT', 'BIN_06', 'INT_1', 'BIN_01', 'INT_3', 'BIN_07', 'INT_2', 'BIN_05', 'BIN_04', 'BIN_03', 'INT_3', 'BIN_01', 'INT_1', 'DEPOT'],
    dist: 48.20,
    fuel: 13.77,
    saved: '13.9%',
    co2: '6.0 kg',
    color: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    desc: 'Uniform cost expansion without heuristic guidance, expanding extra nodes.'
  },
  conventional: {
    name: 'CRITICAL OVERFLOW Tour (Fixed)',
    path: ['DEPOT', 'INT_1', 'BIN_01', 'BIN_08', 'INT_3', 'BIN_02', 'BIN_03', 'BIN_07', 'INT_2', 'BIN_04', 'BIN_05', 'BIN_06', 'DEPOT'],
    dist: 56.00,
    fuel: 16.00,
    saved: '0.0%',
    co2: '0.0 kg',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    desc: 'Blind fixed-order schedule visiting every bin regardless of fill level.'
  }
};

function toggleTrafficOverlay() {
  showTrafficOverlay = !showTrafficOverlay;
  const btn = document.getElementById('trafficToggleBtn');
  if (btn) {
    btn.style.background = showTrafficOverlay ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : '';
    btn.style.color = showTrafficOverlay ? '#ffffff' : '';
    btn.style.borderColor = showTrafficOverlay ? '#fbbf24' : '';
  }
  drawMap();
}

// Graph Adjacency Helper
function getGraphAdjacency() {
  const adj = {};
  for (const n of Object.keys(NODES)) adj[n] = [];
  for (const e of EDGES) {
    const trafficMult = showTrafficOverlay ? (e.traffic || 1.0) : 1.0;
    const cost = e.dist * trafficMult;
    adj[e.u].push({ node: e.v, dist: e.dist, cost: cost });
    adj[e.v].push({ node: e.u, dist: e.dist, cost: cost });
  }
  return adj;
}

// A* Shortest Path between any two graph nodes
function findAStarPath(startId, goalId) {
  if (startId === goalId) return [startId];
  const adj = getGraphAdjacency();

  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  for (const n of Object.keys(NODES)) {
    gScore[n] = Infinity;
    fScore[n] = Infinity;
  }
  gScore[startId] = 0;
  fScore[startId] = heuristicDist(startId, goalId);

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;
    for (const node of openSet) {
      if (fScore[node] < lowestF) {
        lowestF = fScore[node];
        current = node;
      }
    }

    if (current === goalId) {
      const path = [current];
      while (cameFrom[path[0]]) {
        path.unshift(cameFrom[path[0]]);
      }
      return path;
    }

    openSet.delete(current);

    for (const edge of adj[current]) {
      const neighbor = edge.node;
      const tentativeG = gScore[current] + edge.cost;
      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristicDist(neighbor, goalId);
        openSet.add(neighbor);
      }
    }
  }

  return [startId, goalId];
}

function heuristicDist(u, v) {
  if (currentAlgoMode === 'dijkstra') return 0; // Dijkstra is A* with zero heuristic
  const nu = NODES[u];
  const nv = NODES[v];
  if (!nu || !nv) return 0;
  const dx = nu.x - nv.x;
  const dy = nu.y - nv.y;
  return (Math.sqrt(dx * dx + dy * dy) / 100) * 3.5;
}

function getEdgeDist(u, v) {
  const edge = EDGES.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
  return edge ? edge.dist : 2.5;
}

// Switch Router Mode between NORMAL, WARNING, and CRITICAL OVERFLOW
function switchAlgorithmMode(mode) {
  if (!ALGO_ROUTES[mode]) return;
  isSingleBinDispatch = false;
  singleBinTargetId = null;
  currentAlgoMode = mode;
  const plan = ALGO_ROUTES[mode];

  document.querySelectorAll('.algo-pill').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`algo${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
  if (activePill) activePill.classList.add('active');

  currentPath = [...plan.path];
  resetSimulation();
  setPipelineStep(4);

  // Update Metrics accurately for each algorithm mode
  document.querySelectorAll('.metricDistanceVal').forEach(el => el.innerText = `${plan.dist.toFixed(1)} km`);
  document.querySelectorAll('.metricFuelVal').forEach(el => el.innerText = `${plan.fuel.toFixed(2)} L`);
  document.querySelectorAll('.metricSavedVal').forEach(el => el.innerText = plan.saved);
  document.querySelectorAll('.metricCo2Val').forEach(el => el.innerText = plan.co2);

  const mDist = document.getElementById('metricDistance');
  const mFuel = document.getElementById('metricFuel');
  const mSaved = document.getElementById('metricSaved');
  const mCo2 = document.getElementById('metricCo2');
  if (mDist) mDist.innerText = `${plan.dist.toFixed(1)} km`;
  if (mFuel) mFuel.innerText = `${plan.fuel.toFixed(2)} L`;
  if (mSaved) mSaved.innerText = plan.saved;
  if (mCo2) mCo2.innerText = plan.co2;

  populateAStarCostTable();
  drawMap();
}

let isSingleBinDispatch = false;
let singleBinTargetId = null;

// Dynamically compute and dispatch vehicle to ONLY the selected sandbox bin
function dispatchSingleBin(selBinId) {
  const bin = NODES[selBinId];
  if (!bin) return;

  isSingleBinDispatch = true;
  singleBinTargetId = selBinId;

  // Unmark router pill active styles to indicate dedicated single-bin direct dispatch mode
  document.querySelectorAll('.algo-pill').forEach(p => p.classList.remove('active'));

  // Ensure selected bin has waste to collect
  if (bin.fill === 0 || bin.isCollected) {
    bin.fill = Math.round(bin.capacity * 0.85);
    bin.initialFill = bin.fill;
    bin.isCollected = false;
  }

  // Compute direct roundtrip shortest path: DEPOT -> selBinId -> DEPOT
  const outbound = findAStarPath('DEPOT', selBinId);
  const inbound = findAStarPath(selBinId, 'DEPOT');
  const path = [...outbound];
  for (let i = 1; i < inbound.length; i++) {
    path.push(inbound[i]);
  }
  currentPath = path;

  // Reset truck & animation state
  isAnimating = false;
  animProgress = 0;
  activePathSegmentIndex = 0;
  truckWasteLoad = 0;
  truckTrail.length = 0;
  truckPos = { x: NODES.DEPOT.x, y: NODES.DEPOT.y };

  // Calculate live route distance
  let totalKm = 0;
  for (let i = 0; i < currentPath.length - 1; i++) {
    totalKm += getEdgeDist(currentPath[i], currentPath[i + 1]);
  }
  const totalFuel = totalKm / 3.5;
  const convFuel = 16.0;
  const savedPct = Math.max(0, ((convFuel - totalFuel) / convFuel) * 100).toFixed(1) + '%';
  const co2Saved = Math.max(0, (convFuel - totalFuel) * 2.68).toFixed(1) + ' kg';

  // Update metrics
  document.querySelectorAll('.metricDistanceVal').forEach(el => el.innerText = `${totalKm.toFixed(1)} km`);
  document.querySelectorAll('.metricFuelVal').forEach(el => el.innerText = `${totalFuel.toFixed(2)} L`);
  document.querySelectorAll('.metricSavedVal').forEach(el => el.innerText = savedPct);
  document.querySelectorAll('.metricCo2Val').forEach(el => el.innerText = co2Saved);

  const mDist = document.getElementById('metricDistance');
  const mFuel = document.getElementById('metricFuel');
  const mSaved = document.getElementById('metricSaved');
  const mCo2 = document.getElementById('metricCo2');
  if (mDist) mDist.innerText = `${totalKm.toFixed(1)} km`;
  if (mFuel) mFuel.innerText = `${totalFuel.toFixed(2)} L`;
  if (mSaved) mSaved.innerText = savedPct;
  if (mCo2) mCo2.innerText = co2Saved;

  const hudFuel = document.getElementById('hudFuelVal');
  const hudLoad = document.getElementById('hudLoadVal');
  if (hudFuel) hudFuel.innerText = '0.00 L';
  if (hudLoad) hudLoad.innerText = '0 / 2500 L';

  syncSandboxSlider();
  updateHeapDisplay();
  updateBinsList();
  renderRegressionGraph();
  updateStepCounter();
  populateAStarCostTable();
  drawMap();

  // Immediately launch the vehicle along the dedicated single-bin route!
  setPipelineStep(4);
  isAnimating = true;
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.innerText = '⏸ Pause Route';
  playSuccessSound();
}

// Dynamically insert selected Sandbox bin into active route if needed
function applySandboxRouteUpdate() {
  const sandSelect = document.getElementById('sandboxBinSelect');
  const selBinId = sandSelect ? sandSelect.value : selectedBinId;
  const bin = NODES[selBinId];
  if (!bin) return;

  if (isSingleBinDispatch) {
    dispatchSingleBin(selBinId);
    return;
  }

  if (currentAlgoMode === 'conventional') {
    currentPath = [...ALGO_ROUTES.conventional.path];
  } else if (currentAlgoMode === 'dijkstra') {
    if (bin.fill > 0 && !ALGO_ROUTES.dijkstra.path.includes(selBinId)) {
      if (selBinId === 'BIN_02') {
        currentPath = ['DEPOT', 'BIN_06', 'INT_1', 'BIN_01', 'INT_3', 'BIN_02', 'BIN_03', 'INT_3', 'BIN_07', 'INT_2', 'BIN_05', 'BIN_04', 'BIN_03', 'INT_3', 'BIN_01', 'INT_1', 'DEPOT'];
      } else if (selBinId === 'BIN_08') {
        currentPath = ['DEPOT', 'BIN_06', 'INT_1', 'BIN_01', 'BIN_08', 'INT_3', 'BIN_07', 'INT_2', 'BIN_05', 'BIN_04', 'BIN_03', 'INT_3', 'BIN_01', 'INT_1', 'DEPOT'];
      } else {
        currentPath = [...ALGO_ROUTES.dijkstra.path];
      }
    } else {
      currentPath = [...ALGO_ROUTES.dijkstra.path];
    }
  } else {
    if (bin.fill > 0 && !ALGO_ROUTES.astar.path.includes(selBinId)) {
      if (selBinId === 'BIN_02') {
        currentPath = ['DEPOT', 'INT_1', 'BIN_01', 'INT_3', 'BIN_02', 'BIN_03', 'BIN_07', 'INT_2', 'BIN_05', 'BIN_04', 'INT_2', 'INT_1', 'BIN_06', 'DEPOT'];
      } else if (selBinId === 'BIN_08') {
        currentPath = ['DEPOT', 'INT_1', 'BIN_01', 'BIN_08', 'INT_3', 'BIN_07', 'BIN_03', 'BIN_04', 'BIN_05', 'INT_2', 'INT_1', 'BIN_06', 'DEPOT'];
      } else {
        currentPath = [...ALGO_ROUTES.astar.path];
      }
    } else {
      currentPath = [...ALGO_ROUTES.astar.path];
    }
  }

  // Calculate live route distance
  let totalKm = 0;
  for (let i = 0; i < currentPath.length - 1; i++) {
    totalKm += getEdgeDist(currentPath[i], currentPath[i + 1]);
  }
  const totalFuel = totalKm / 3.5;
  const convFuel = 16.0;
  const savedPct = Math.max(0, ((convFuel - totalFuel) / convFuel) * 100).toFixed(1) + '%';
  const co2Saved = Math.max(0, (convFuel - totalFuel) * 2.68).toFixed(1) + ' kg';

  document.querySelectorAll('.metricDistanceVal').forEach(el => el.innerText = `${totalKm.toFixed(1)} km`);
  document.querySelectorAll('.metricFuelVal').forEach(el => el.innerText = `${totalFuel.toFixed(2)} L`);
  document.querySelectorAll('.metricSavedVal').forEach(el => el.innerText = savedPct);
  document.querySelectorAll('.metricCo2Val').forEach(el => el.innerText = co2Saved);

  const mDist = document.getElementById('metricDistance');
  const mFuel = document.getElementById('metricFuel');
  const mSaved = document.getElementById('metricSaved');
  const mCo2 = document.getElementById('metricCo2');
  if (mDist) mDist.innerText = `${totalKm.toFixed(1)} km`;
  if (mFuel) mFuel.innerText = `${totalFuel.toFixed(2)} L`;
  if (mSaved) mSaved.innerText = savedPct;
  if (mCo2) mCo2.innerText = co2Saved;

  updateStepCounter();
  populateAStarCostTable();
  drawMap();
}

// Presets for Scenario Simulation
const SCENARIOS = {
  normal: {
    data: {
      BIN_01: { fill: 410, rate: 8.49 },
      BIN_02: { fill: 110, rate: 3.27 },
      BIN_03: { fill: 450, rate: 7.82 },
      BIN_04: { fill: 90,  rate: 2.49 },
      BIN_05: { fill: 520, rate: 8.98 },
      BIN_06: { fill: 240, rate: 4.03 },
      BIN_07: { fill: 390, rate: 6.57 },
      BIN_08: { fill: 70,  rate: 1.78 },
    }
  },
  festival: {
    data: {
      BIN_01: { fill: 480, rate: 12.5 },
      BIN_02: { fill: 140, rate: 3.5 },
      BIN_03: { fill: 580, rate: 14.0 },
      BIN_04: { fill: 120, rate: 3.0 },
      BIN_05: { fill: 660, rate: 13.2 },
      BIN_06: { fill: 260, rate: 4.2 },
      BIN_07: { fill: 570, rate: 11.8 },
      BIN_08: { fill: 90,  rate: 2.1 },
    }
  },
  monsoon: {
    data: {
      BIN_01: { fill: 430, rate: 9.1 },
      BIN_02: { fill: 360, rate: 8.5 },
      BIN_03: { fill: 490, rate: 9.0 },
      BIN_04: { fill: 320, rate: 7.9 },
      BIN_05: { fill: 540, rate: 9.5 },
      BIN_06: { fill: 310, rate: 6.2 },
      BIN_07: { fill: 420, rate: 7.8 },
      BIN_08: { fill: 260, rate: 6.0 },
    }
  },
  campus: {
    data: {
      BIN_01: { fill: 350, rate: 7.0 },
      BIN_02: { fill: 120, rate: 2.8 },
      BIN_03: { fill: 520, rate: 11.2 },
      BIN_04: { fill: 110, rate: 2.5 },
      BIN_05: { fill: 480, rate: 8.0 },
      BIN_06: { fill: 485, rate: 13.5 },
      BIN_07: { fill: 410, rate: 7.1 },
      BIN_08: { fill: 80,  rate: 1.9 },
    }
  }
};

let currentPath = [...ALGO_ROUTES.astar.path];
let currentStep = 1;
let animProgress = 0;
let isAnimating = false;
let simSpeedMultiplier = 1.0;
let truckPos = { x: NODES.DEPOT.x, y: NODES.DEPOT.y };
let activePathSegmentIndex = 0;
let truckWasteLoad = 0;

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// ==============================================================================
// WEB AUDIO API SOUND SYNTHESIZER ENGINE
// ==============================================================================
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  if (btn) {
    btn.innerHTML = soundEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
    btn.style.color = soundEnabled ? '#34d399' : '#94a3b8';
  }
  if (soundEnabled) {
    initAudio();
    playBeep(587, 'sine', 0.08, 0.15);
  }
}

function playBeep(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.1) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Gracefully handle browser restrictions
  }
}

function playClickSound() {
  playBeep(800, 'sine', 0.04, 0.08);
}

function playChimeSound() {
  playBeep(523.25, 'triangle', 0.12, 0.15);
  setTimeout(() => playBeep(659.25, 'triangle', 0.12, 0.15), 60);
  setTimeout(() => playBeep(783.99, 'triangle', 0.18, 0.18), 120);
}

function playSuccessSound() {
  playBeep(523.25, 'sine', 0.15, 0.15);
  setTimeout(() => playBeep(659.25, 'sine', 0.15, 0.15), 100);
  setTimeout(() => playBeep(783.99, 'sine', 0.15, 0.15), 200);
  setTimeout(() => playBeep(1046.50, 'sine', 0.3, 0.2), 300);
}

function playWrongSound() {
  playBeep(220, 'sawtooth', 0.15, 0.12);
  setTimeout(() => playBeep(196, 'sawtooth', 0.25, 0.12), 120);
}

// ==============================================================================
// INTERACTIVE STUDENT VIVA QUIZ CONTROLLER
// ==============================================================================
const QUIZ_DATA = [
  {
    id: 1,
    correct: 1,
    explanation: "✅ <strong>Correct!</strong> An admissible heuristic must satisfy $h(n) \\le h^*(n)$ (never overestimate the true remaining path cost). Because Euclidean distance is the straight-line distance, physical roads can only be equal or longer due to turns, guaranteeing that A* finds the optimal shortest path."
  },
  {
    id: 2,
    correct: 2,
    explanation: "✅ <strong>Correct!</strong> In a complete binary tree stored in a 0-indexed array: <code>LeftChild(i) = 2i + 1</code>, <code>RightChild(i) = 2i + 2</code>, and <code>Parent(i) = floor((i - 1) / 2)</code>."
  },
  {
    id: 3,
    correct: 1,
    explanation: "✅ <strong>Correct!</strong> Encapsulation hides the internal state of the Truck object. Mutations are governed exclusively by validated business methods like <code>loadWaste(int liters)</code>, preventing illegal over-capacity states."
  },
  {
    id: 4,
    correct: 0,
    explanation: "✅ <strong>Correct!</strong> In Ordinary Least Squares (OLS) regression, the slope $m = \\Delta y / \\Delta x$ represents the rate of change of fill percentage with respect to time (units: % fill per hour)."
  },
  {
    id: 5,
    correct: 2,
    explanation: "✅ <strong>Correct!</strong> The conventional route blindly visits all 8 bins (56.0 km / 16.0 L). The Smart Router visits only prioritized bins (33.9 km / 9.69 L), achieving a <strong>39.5% fuel reduction</strong> and preventing 16.92 kg of CO₂ per run."
  }
];

let quizAnswers = {};

function openQuizModal() {
  initAudio();
  playClickSound();
  const modal = document.getElementById('quizModal');
  if (modal) modal.classList.add('open');
}

function closeQuizModal() {
  const modal = document.getElementById('quizModal');
  if (modal) modal.classList.remove('open');
}

function checkQuizAnswer(qNum, selectedOptIndex) {
  initAudio();
  if (quizAnswers[qNum] !== undefined) return;

  const q = QUIZ_DATA.find(item => item.id === qNum);
  if (!q) return;

  const card = document.getElementById(`qCard${qNum}`);
  if (!card) return;

  const buttons = card.querySelectorAll('.quiz-opt-btn');
  const isCorrect = selectedOptIndex === q.correct;
  quizAnswers[qNum] = isCorrect;

  buttons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) {
      btn.classList.add('correct');
    } else if (idx === selectedOptIndex && !isCorrect) {
      btn.classList.add('incorrect');
    }
  });

  const expl = document.getElementById(`qExpl${qNum}`);
  if (expl) {
    expl.innerHTML = isCorrect 
      ? q.explanation 
      : `❌ <strong>Incorrect.</strong> ${q.explanation.replace('✅ <strong>Correct!</strong> ', '')}`;
    expl.classList.add('show');
    expl.style.borderColor = isCorrect ? '#10b981' : '#ef4444';
  }

  if (isCorrect) {
    playSuccessSound();
  } else {
    playWrongSound();
  }

  updateQuizScore();
}

function updateQuizScore() {
  const answeredCount = Object.keys(quizAnswers).length;
  const correctCount = Object.values(quizAnswers).filter(Boolean).length;
  const pct = Math.round((correctCount / 5) * 100);

  const label = document.getElementById('quizScoreLabel');
  if (label) {
    label.innerText = `${correctCount} / 5 (${pct}%)`;
  }

  const badge = document.getElementById('quizBadgeStatus');
  if (badge) {
    if (answeredCount < 5) {
      badge.innerText = `Answered ${answeredCount}/5`;
      badge.style.background = 'rgba(56,189,248,0.2)';
      badge.style.color = '#38bdf8';
    } else if (correctCount === 5) {
      badge.innerText = '🌟 Viva Master (100%)';
      badge.style.background = 'rgba(16,185,129,0.25)';
      badge.style.color = '#34d399';
    } else if (correctCount >= 3) {
      badge.innerText = '👍 Viva Ready (Pass)';
      badge.style.background = 'rgba(245,158,11,0.25)';
      badge.style.color = '#fbbf24';
    } else {
      badge.innerText = '⚠️ Needs Review';
      badge.style.background = 'rgba(239,68,68,0.25)';
      badge.style.color = '#f87171';
    }
  }
}

function resetQuiz() {
  quizAnswers = {};
  for (let i = 1; i <= 5; i++) {
    const card = document.getElementById(`qCard${i}`);
    if (card) {
      const buttons = card.querySelectorAll('.quiz-opt-btn');
      buttons.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
      });
      const expl = document.getElementById(`qExpl${i}`);
      if (expl) {
        expl.classList.remove('show');
        expl.innerHTML = '';
      }
    }
  }
  updateQuizScore();
  playClickSound();
}

function setSimSpeed(speed, btn) {
  simSpeedMultiplier = speed;
  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Priority score calculation: Fill% + (Rate * 6h) + EmergencyBonus
function getBinPriority(bin, includeRegression = true) {
  const fillPct = (bin.fill / bin.capacity) * 100;
  const rateEffect = includeRegression ? (bin.rate * 6.0) : 0;
  const emergencyBonus = (fillPct >= 80) ? 25 : 0;
  return fillPct + rateEffect + emergencyBonus;
}

// Scenario Switcher
function applyScenario(scenarioKey) {
  document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`scen-${scenarioKey}`);
  if (btn) btn.classList.add('active');

  const scen = SCENARIOS[scenarioKey];
  if (!scen) return;

  for (const [binId, val] of Object.entries(scen.data)) {
    if (NODES[binId]) {
      NODES[binId].fill = val.fill;
      NODES[binId].initialFill = val.fill;
      NODES[binId].rate = val.rate;
      NODES[binId].isCollected = false;
    }
  }

  syncSandboxSlider();
  resetSimulation();
  updateHeapDisplay();
  updateBinsList();
  renderRegressionGraph();
  populateAStarCostTable();
  drawMap();
}

// Sandbox Slider Handlers
function onSandboxBinSelectChanged() {
  const selBinId = document.getElementById('sandboxBinSelect').value;
  selectedBinId = selBinId;
  syncSandboxSlider();
  const regSelect = document.getElementById('binSelect');
  if (regSelect) regSelect.value = selBinId;
  renderRegressionGraph();
  updateBinsList();
  playBeep(580, 'sine', 0.06);
  drawMap();
}

function syncSandboxSlider() {
  const selBinId = document.getElementById('sandboxBinSelect') ? document.getElementById('sandboxBinSelect').value : selectedBinId;
  const bin = NODES[selBinId];
  if (!bin) return;

  const pct = Math.round((bin.fill / bin.capacity) * 100);
  const slider = document.getElementById('binFillSlider');
  if (slider) slider.value = pct;

  const label = document.getElementById('sliderFillLabel');
  if (label) label.innerText = `${bin.fill} L (${pct}%)`;

  const badge = document.getElementById('sliderUrgencyBadge');
  if (badge) {
    if (bin.isCollected || pct === 0) {
      badge.innerText = '✅ SERVICED (CLEAN)';
      badge.style.color = '#10b981';
    } else if (pct >= 80) {
      badge.innerText = '🚨 CRITICAL OVERFLOW';
      badge.style.color = '#ef4444';
    } else if (pct >= 50) {
      badge.innerText = '⚠️ WARNING';
      badge.style.color = '#f59e0b';
    } else {
      badge.innerText = '🟢 NORMAL';
      badge.style.color = '#10b981';
    }
  }
}

function onSliderFillChange(val) {
  const selBinId = document.getElementById('sandboxBinSelect').value;
  const bin = NODES[selBinId];
  if (!bin) return;

  const newFill = Math.round((val / 100) * bin.capacity);
  bin.fill = newFill;
  bin.initialFill = newFill;
  bin.isCollected = (newFill === 0);

  syncSandboxSlider();
  updateHeapDisplay();
  updateBinsList();
  renderRegressionGraph();
  drawMap();
}

function forceCollectSelectedBin() {
  const selBinId = document.getElementById('sandboxBinSelect') ? document.getElementById('sandboxBinSelect').value : selectedBinId;
  dispatchSingleBin(selBinId);
}

// Splash Screen Flashpage Controls
function dismissSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.add('hidden');
  }
}

function openSplashScreen() {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.classList.remove('hidden');
  }
}

// Render Regression Graph Component
function renderRegressionGraph() {
  const regCanvas = document.getElementById('regressionCanvas');
  if (!regCanvas) return;
  const rCtx = regCanvas.getContext('2d');
  const binId = document.getElementById('binSelect').value || 'BIN_01';
  const bin = NODES[binId];
  if (!bin) return;

  // Match drawing buffer to CSS render size to avoid any vertical blurriness
  const displayWidth = regCanvas.clientWidth || 450;
  const displayHeight = regCanvas.clientHeight || 145;
  if (regCanvas.width !== displayWidth || regCanvas.height !== displayHeight) {
    regCanvas.width = displayWidth;
    regCanvas.height = displayHeight;
  }

  rCtx.clearRect(0, 0, regCanvas.width, regCanvas.height);

  const curPct = (bin.fill / bin.capacity) * 100;
  const slope = bin.rate;
  const intercept = Math.max(5, curPct - (6 * slope));

  document.getElementById('regSlope').innerText = `+${slope.toFixed(2)}%/hr`;
  document.getElementById('regR2').innerText = '0.999';
  const hrsToFull = slope > 0 ? ((100 - curPct) / slope).toFixed(1) : '999';
  document.getElementById('regFull').innerText = `${hrsToFull} hrs`;

  const padLeft = 38;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 22;
  const plotW = regCanvas.width - padLeft - padRight;
  const plotH = regCanvas.height - padTop - padBottom;

  // Background subtle grid lines
  rCtx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  rCtx.lineWidth = 1;
  rCtx.fillStyle = 'rgba(148, 163, 184, 0.75)';
  rCtx.font = '9px Inter, sans-serif';
  rCtx.textAlign = 'right';

  [0, 50, 80, 100].forEach(p => {
    const y = padTop + plotH - (p / 100) * plotH;
    rCtx.beginPath();
    rCtx.moveTo(padLeft, y);
    rCtx.lineTo(regCanvas.width - padRight, y);
    if (p === 80) {
      rCtx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      rCtx.setLineDash([3, 3]);
      rCtx.stroke();
      rCtx.setLineDash([]);
      rCtx.fillStyle = '#fb7185';
      rCtx.fillText('80% Critical', padLeft - 4, y + 3);
      rCtx.fillStyle = 'rgba(148, 163, 184, 0.75)';
    } else {
      rCtx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      rCtx.stroke();
      rCtx.fillText(`${p}%`, padLeft - 4, y + 3);
    }
  });

  // X-Axis Hour Labels
  rCtx.textAlign = 'center';
  for (let h = 0; h <= 6; h++) {
    const x = padLeft + (h / 6) * plotW;
    rCtx.beginPath();
    rCtx.moveTo(x, padTop);
    rCtx.lineTo(x, padTop + plotH);
    rCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    rCtx.stroke();
    rCtx.fillStyle = h === 6 ? '#38bdf8' : 'rgba(148, 163, 184, 0.8)';
    rCtx.font = h === 6 ? 'bold 9px Inter, sans-serif' : '9px Inter, sans-serif';
    rCtx.fillText(h === 6 ? 'Now' : `-${6 - h}h`, x, regCanvas.height - 6);
  }

  // Regression points
  const points = [];
  for (let h = 0; h <= 6; h++) {
    const yVal = Math.min(100, Math.max(5, intercept + h * slope + (Math.sin(h * 3) * 1.2)));
    const xPixel = padLeft + (h / 6) * plotW;
    const yPixel = padTop + plotH - (yVal / 100) * plotH;
    points.push({ x: xPixel, y: yPixel });
  }

  // Gradient area under regression line
  const startY = padTop + plotH - (intercept / 100) * plotH;
  const endY = padTop + plotH - (curPct / 100) * plotH;

  const areaGrad = rCtx.createLinearGradient(0, padTop, 0, padTop + plotH);
  areaGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  areaGrad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');

  rCtx.beginPath();
  rCtx.moveTo(padLeft, startY);
  rCtx.lineTo(padLeft + plotW, endY);
  rCtx.lineTo(padLeft + plotW, padTop + plotH);
  rCtx.lineTo(padLeft, padTop + plotH);
  rCtx.closePath();
  rCtx.fillStyle = areaGrad;
  rCtx.fill();

  // Outer Line Glow
  rCtx.beginPath();
  rCtx.moveTo(padLeft, startY);
  rCtx.lineTo(padLeft + plotW, endY);
  rCtx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  rCtx.lineWidth = 5;
  rCtx.stroke();

  // Sharp Core Line
  rCtx.beginPath();
  rCtx.moveTo(padLeft, startY);
  rCtx.lineTo(padLeft + plotW, endY);
  rCtx.strokeStyle = '#06b6d4';
  rCtx.lineWidth = 2.5;
  rCtx.stroke();

  // Scatter points
  points.forEach((p, idx) => {
    rCtx.beginPath();
    rCtx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    rCtx.fillStyle = idx === points.length - 1 ? (curPct >= 80 ? '#f43f5e' : '#10b981') : '#f59e0b';
    rCtx.fill();
    rCtx.strokeStyle = '#ffffff';
    rCtx.lineWidth = 1.5;
    rCtx.stroke();
  });

  // Formula badge in top-right
  rCtx.fillStyle = '#38bdf8';
  rCtx.font = 'bold 9.5px Inter, sans-serif';
  rCtx.textAlign = 'right';
  rCtx.fillText(`y = ${slope.toFixed(2)}x + ${intercept.toFixed(1)} (OLS)`, regCanvas.width - padRight, 13);
}

// Render SVG Binary Heap Tree
function renderHeapTreeSvg() {
  const svg = document.getElementById('heapTreeSvg');
  if (!svg) return;
  const bins = Object.values(NODES).filter(n => n.type === 'bin');
  const includeReg = currentStep >= 2;
  const sorted = [...bins].sort((a, b) => getBinPriority(b, includeReg) - getBinPriority(a, includeReg));

  const coords = [
    { x: 190, y: 24 },  // Root (0)
    { x: 100, y: 70 },  // Left child (1)
    { x: 280, y: 70 },  // Right child (2)
    { x: 55,  y: 118 }, // (3)
    { x: 145, y: 118 }, // (4)
    { x: 235, y: 118 }, // (5)
    { x: 325, y: 118 }, // (6)
  ];

  let svgHtml = '';

  // Connecting branch lines
  for (let i = 0; i < Math.min(sorted.length, 7); i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < 7 && left < sorted.length) {
      svgHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[left].x}" y2="${coords[left].y}" stroke="rgba(56,189,248,0.35)" stroke-width="1.8"/>`;
    }
    if (right < 7 && right < sorted.length) {
      svgHtml += `<line x1="${coords[i].x}" y1="${coords[i].y}" x2="${coords[right].x}" y2="${coords[right].y}" stroke="rgba(56,189,248,0.35)" stroke-width="1.8"/>`;
    }
  }

  // Node circles & labels
  for (let i = 0; i < Math.min(sorted.length, 7); i++) {
    const b = sorted[i];
    const score = getBinPriority(b, includeReg).toFixed(0);
    const isRoot = i === 0;
    const circleColor = isRoot ? '#f43f5e' : '#2563eb';

    svgHtml += `
      <g>
        ${isRoot ? `<circle cx="${coords[i].x}" cy="${coords[i].y}" r="17" fill="none" stroke="rgba(244,63,94,0.6)" stroke-width="1.5" stroke-dasharray="3,3"/>` : ''}
        <circle cx="${coords[i].x}" cy="${coords[i].y}" r="14" fill="${circleColor}" stroke="#ffffff" stroke-width="1.5"/>
        <text x="${coords[i].x}" y="${coords[i].y - 2}" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${b.id.replace('BIN_', 'B')}</text>
        <text x="${coords[i].x}" y="${coords[i].y + 6}" font-size="7" font-weight="bold" fill="#fef08a" text-anchor="middle">${score}</text>
      </g>
    `;
  }

  svg.innerHTML = svgHtml;
}

// Compute & Render Max-Heap Array & Status
function updateHeapDisplay() {
  const bins = Object.values(NODES).filter(n => n.type === 'bin');
  const includeReg = currentStep >= 2;
  const sortedBins = [...bins].sort((a, b) => getBinPriority(b, includeReg) - getBinPriority(a, includeReg));
  
  const container = document.getElementById('heapArrayContainer');
  if (container) {
    container.innerHTML = '';
    sortedBins.forEach((b, idx) => {
      const score = getBinPriority(b, includeReg).toFixed(1);
      const cell = document.createElement('div');
      cell.className = `heap-cell ${idx === 0 ? 'root' : ''}`;
      cell.innerHTML = `
        <div class="heap-cell-idx">[${idx}]</div>
        <div class="heap-cell-val">${b.id}</div>
        <div style="font-size:0.65rem; color:${idx === 0 ? '#ef4444' : '#94a3b8'}">${score}</div>
      `;
      container.appendChild(cell);
    });
  }

  const rootBin = sortedBins[0];
  const rootScore = getBinPriority(rootBin, includeReg).toFixed(1);
  const expl = document.getElementById('heapRootExplanation');
  if (expl) {
    expl.innerHTML = `Current Heap Root: <strong>${rootBin.id}</strong> (${rootBin.name}) &bull; Dynamic Urgency: <strong>${rootScore}</strong>`;
  }

  renderHeapTreeSvg();
}

// Populate Step-by-Step Cost Table (Dynamically tailored to active algorithm or single-bin dispatch)
function populateAStarCostTable() {
  const tableBody = document.getElementById('astarCostTableBody');
  if (!tableBody) return;

  let logs = [];
  if (isSingleBinDispatch && singleBinTargetId) {
    let runningG = 0;
    const targetIdx = currentPath.indexOf(singleBinTargetId);
    logs.push({
      step: 1,
      node: 'DEPOT',
      goal: singleBinTargetId,
      g: '0.00',
      h: heuristicDist('DEPOT', singleBinTargetId).toFixed(2),
      f: heuristicDist('DEPOT', singleBinTargetId).toFixed(2),
      status: `Start Dispatch -> ${singleBinTargetId}`
    });

    for (let i = 1; i < currentPath.length; i++) {
      const prev = currentPath[i - 1];
      const curr = currentPath[i];
      runningG += getEdgeDist(prev, curr);
      const isTarget = curr === singleBinTargetId && i === targetIdx;
      const isDepotReturn = curr === 'DEPOT' && i === currentPath.length - 1;
      const activeGoal = (i <= targetIdx) ? singleBinTargetId : 'DEPOT';
      const hVal = (curr === activeGoal) ? 0 : heuristicDist(curr, activeGoal);
      const fVal = (runningG + hVal).toFixed(2);

      let statusMsg = 'Expanded';
      if (isTarget) statusMsg = `🎯 Reached & Collected (${singleBinTargetId})`;
      else if (isDepotReturn) statusMsg = '🏁 Returned to Depot';

      logs.push({
        step: i + 1,
        node: curr,
        goal: activeGoal,
        g: runningG.toFixed(2),
        h: hVal.toFixed(2),
        f: fVal,
        status: statusMsg
      });
    }
  } else if (currentAlgoMode === 'astar') {
    logs = [
      { step: 1, node: 'DEPOT', goal: 'BIN_01', g: '0.00', h: '3.61', f: '3.61', status: 'Start Depot' },
      { step: 2, node: 'INT_1', goal: 'BIN_01', g: '2.80', h: '3.00', f: '5.80', status: 'Expanded' },
      { step: 3, node: 'BIN_01', goal: 'BIN_01', g: '5.80', h: '0.00', f: '5.80', status: '🎯 Reached & Collected' },
      { step: 4, node: 'INT_2', goal: 'BIN_05', g: '12.00', h: '1.40', f: '13.40', status: 'Expanded' },
      { step: 5, node: 'BIN_05', goal: 'BIN_05', g: '13.40', h: '0.00', f: '13.40', status: '🎯 Reached & Collected' },
      { step: 6, node: 'BIN_03', goal: 'BIN_03', g: '20.30', h: '0.00', f: '20.30', status: '🎯 Reached & Collected' },
      { step: 7, node: 'BIN_07', goal: 'BIN_07', g: '23.10', h: '0.00', f: '23.10', status: '🎯 Reached & Collected' },
      { step: 8, node: 'DEPOT', goal: 'DEPOT', g: '33.90', h: '0.00', f: '33.90', status: '🏁 Returned to Depot' },
    ];
  } else if (currentAlgoMode === 'dijkstra') {
    logs = [
      { step: 1, node: 'DEPOT', goal: 'ALL', g: '0.00', h: '0.00', f: '0.00', status: 'Start Depot (h=0)' },
      { step: 2, node: 'BIN_06', goal: 'INT_1', g: '3.20', h: '0.00', f: '3.20', status: 'Uniform Expand' },
      { step: 3, node: 'INT_1', goal: 'BIN_01', g: '4.60', h: '0.00', f: '4.60', status: 'Uniform Expand' },
      { step: 4, node: 'BIN_01', goal: 'INT_3', g: '7.60', h: '0.00', f: '7.60', status: 'Uniform Expand' },
      { step: 5, node: 'INT_3', goal: 'BIN_07', g: '10.40', h: '0.00', f: '10.40', status: 'Uniform Expand' },
      { step: 6, node: 'BIN_07', goal: 'INT_2', g: '11.80', h: '0.00', f: '11.80', status: 'Uniform Expand' },
      { step: 7, node: 'INT_2', goal: 'BIN_05', g: '14.80', h: '0.00', f: '14.80', status: 'Uniform Expand' },
      { step: 8, node: 'DEPOT', goal: 'DEPOT', g: '48.20', h: '0.00', f: '48.20', status: '🏁 Returned (High Overhead)' },
    ];
  } else {
    logs = [
      { step: 1, node: 'DEPOT', goal: 'BIN_01', g: '0.00', h: 'N/A', f: '0.00', status: 'Fixed Step 1' },
      { step: 2, node: 'BIN_01', goal: 'BIN_08', g: '5.80', h: 'N/A', f: '5.80', status: 'Fixed Step 2' },
      { step: 3, node: 'BIN_08', goal: 'BIN_02', g: '12.20', h: 'N/A', f: '12.20', status: 'Fixed Step 3' },
      { step: 4, node: 'BIN_02', goal: 'BIN_03', g: '17.40', h: 'N/A', f: '17.40', status: 'Fixed Step 4' },
      { step: 5, node: 'BIN_03', goal: 'BIN_07', g: '23.40', h: 'N/A', f: '23.40', status: 'Fixed Step 5' },
      { step: 6, node: 'BIN_07', goal: 'BIN_04', g: '29.60', h: 'N/A', f: '29.60', status: 'Fixed Step 6' },
      { step: 7, node: 'BIN_04', goal: 'BIN_05', g: '35.60', h: 'N/A', f: '35.60', status: 'Fixed Step 7' },
      { step: 8, node: 'DEPOT', goal: 'DEPOT', g: '56.00', h: 'N/A', f: '56.00', status: '🏁 Returned (Fuel Wasted)' },
    ];
  }

  tableBody.innerHTML = logs.map(l => `
    <tr>
      <td><strong>#${l.step}</strong></td>
      <td><code>${l.node}</code></td>
      <td><code>${l.goal}</code></td>
      <td>${l.g} km</td>
      <td>${l.h} km</td>
      <td><strong>${l.f}</strong></td>
      <td>${l.status}</td>
    </tr>
  `).join('');
}

let selectedBinId = 'BIN_01';

function selectBin(binId) {
  if (!NODES[binId]) return;
  selectedBinId = binId;

  // Sync Regression dropdown
  const regSelect = document.getElementById('binSelect');
  if (regSelect) {
    regSelect.value = binId;
    renderRegressionGraph();
  }

  // Sync Sandbox dropdown
  const sandSelect = document.getElementById('sandboxBinSelect');
  if (sandSelect) {
    sandSelect.value = binId;
    syncSandboxSlider();
  }

  playBeep(640, 'sine', 0.08);
  updateBinsList();
  drawMap();
}

// Update Bins List in Sidebar with ADSA Max-Heap Status & Complete Telemetry till the last bin
function updateBinsList() {
  const container = document.getElementById('binsListContainer');
  if (!container) return;
  container.innerHTML = '';

  const bins = Object.values(NODES).filter(n => n.type === 'bin');
  const includeReg = currentStep >= 2;
  
  // Sort bins by ADSA Max-Heap Priority Score (Highest to Lowest)
  const sortedBins = [...bins].sort((a, b) => getBinPriority(b, includeReg) - getBinPriority(a, includeReg));

  sortedBins.forEach((bin, rankIdx) => {
    const isCollected = (bin.isCollected === true || bin.fill === 0);
    const pct = Math.round((bin.fill / bin.capacity) * 100);
    const isRoot = rankIdx === 0 && !isCollected;
    
    // Filled uncollected bins are RED (#ef4444); Serviced/Clean bins are GREEN (#10b981)
    const fillColor = isCollected ? '#10b981' : '#ef4444';
    const badgeClass = isCollected ? 'badge-normal' : 'badge-urgent';
    const rankLabel = isCollected ? '✅ Serviced (Clean)' : (isRoot ? '👑 #1 Heap Root' : `🚨 Rank #${rankIdx + 1}`);

    const priority = getBinPriority(bin, includeReg).toFixed(1);
    const isSelected = bin.id === selectedBinId;

    const item = document.createElement('div');
    item.className = `bin-item ${isSelected ? 'selected' : ''}`;
    item.onclick = () => selectBin(bin.id);

    const hrsToFull = bin.rate > 0 ? ((100 - pct) / bin.rate).toFixed(1) : '0.0';
    const dispatchStatus = isCollected ? '✅ Serviced & Clean' : '⚡ Pending Collection (RED)';

    item.innerHTML = `
      <div class="bin-main-row">
        <div class="bin-info">
          <div class="bin-name-row">
            <span class="bin-name">${bin.id}: ${bin.name}</span>
            <span class="bin-badge-tag ${badgeClass}">${rankLabel}</span>
          </div>
          <span class="bin-meta">${bin.fill}/${bin.capacity} L (${pct}%) &bull; +${bin.rate}%/hr &bull; Status: <strong style="color:${fillColor}">${isCollected ? 'Clean (0%)' : 'Filled (Red)'}</strong></span>
        </div>
        <div class="bin-bar-wrap">
          <div class="bin-bar-fill" style="width:${isCollected ? 0 : pct}%; background:${fillColor};"></div>
        </div>
      </div>

      <!-- Expanded Details on Tap: Telemetry & ADSA Max-Heap Status -->
      <div class="bin-detail-drawer">
        <div class="bin-detail-grid">
          <div class="bin-detail-chip">
            <span>Capacity / Fill</span>
            <strong>${bin.fill} L / ${bin.capacity} L (${pct}%)</strong>
          </div>
          <div class="bin-detail-chip">
            <span>Fill Rate (OLS)</span>
            <strong>+${bin.rate}% / hr</strong>
          </div>
          <div class="bin-detail-chip">
            <span>Bin State</span>
            <strong style="color:${fillColor}">${isCollected ? '✅ Cleaned (Green)' : '🚨 Filled (Red)'}</strong>
          </div>
          <div class="bin-detail-chip">
            <span>ADSA Max-Heap Status</span>
            <strong style="color:${isCollected ? '#10b981' : (isRoot ? '#fb7185' : '#38bdf8')}">${isCollected ? 'Collected by Fleet' : (isRoot ? 'Root Node (Max Priority)' : `Rank #${rankIdx + 1} (Score: ${priority})`)}</strong>
          </div>
        </div>
        <div style="margin-top:0.35rem; font-size:0.68rem; color:${isCollected ? '#10b981' : '#fb7185'}; display:flex; justify-content:space-between;">
          <span>Action: <strong>${dispatchStatus}</strong></span>
          <span>Location: <strong>City Sector ${bin.id.replace('BIN_0', '')}</strong></span>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Step-by-Step Navigator Controls
function updateStepCounter() {
  const lbl = document.getElementById('stepCounterLabel');
  if (lbl) {
    lbl.innerText = `Step ${activePathSegmentIndex}/${currentPath.length - 1}`;
  }
}

function stepNextSegment() {
  setPipelineStep(4);
  if (activePathSegmentIndex < currentPath.length - 1) {
    activePathSegmentIndex++;
    const node = NODES[currentPath[activePathSegmentIndex]];
    truckPos.x = node.x;
    truckPos.y = node.y;
    if (node.type === 'bin') {
      if (!node.isCollected) {
        node.isCollected = true;
        truckWasteLoad += (node.initialFill !== undefined ? node.initialFill : node.fill);
        node.fill = 0; // Empty the bin immediately so it turns green!
        playChimeSound();
        updateBinsList();
        updateHeapDisplay();
        renderRegressionGraph();
        syncSandboxSlider();
      } else {
        playBeep(520, 'sine', 0.08);
      }
    } else if (node.id === 'DEPOT') {
      truckWasteLoad = 0;
      playBeep(450, 'sine', 0.06);
    } else {
      playBeep(450, 'sine', 0.06);
    }

    const hudFuel = document.getElementById('hudFuelVal');
    const hudLoad = document.getElementById('hudLoadVal');
    if (hudFuel) hudFuel.innerText = `${((activePathSegmentIndex * 2.8) / 3.5).toFixed(2)} L`;
    if (hudLoad) hudLoad.innerText = `${truckWasteLoad} / 2500 L`;

    updateStepCounter();
    drawMap();
  }
}

function stepPreviousSegment() {
  setPipelineStep(4);
  if (activePathSegmentIndex > 0) {
    activePathSegmentIndex--;
    const node = NODES[currentPath[activePathSegmentIndex]];
    truckPos.x = node.x;
    truckPos.y = node.y;
    
    // Restore all bins to initial filled state
    Object.values(NODES).forEach(b => {
      if (b.type === 'bin') {
        b.isCollected = false;
        b.fill = b.initialFill !== undefined ? b.initialFill : b.fill;
      }
    });

    let load = 0;
    // Replay collection up to activePathSegmentIndex
    for (let i = 0; i <= activePathSegmentIndex; i++) {
      const stepNode = NODES[currentPath[i]];
      if (stepNode && stepNode.type === 'bin' && !stepNode.isCollected) {
        stepNode.isCollected = true;
        load += (stepNode.initialFill !== undefined ? stepNode.initialFill : stepNode.fill);
        stepNode.fill = 0; // Turn green
      } else if (stepNode && stepNode.id === 'DEPOT' && i > 0) {
        load = 0;
      }
    }
    truckWasteLoad = load;

    const hudFuel = document.getElementById('hudFuelVal');
    const hudLoad = document.getElementById('hudLoadVal');
    if (hudFuel) hudFuel.innerText = `${((activePathSegmentIndex * 2.8) / 3.5).toFixed(2)} L`;
    if (hudLoad) hudLoad.innerText = `${truckWasteLoad} / 2500 L`;

    updateStepCounter();
    updateBinsList();
    updateHeapDisplay();
    renderRegressionGraph();
    syncSandboxSlider();
    drawMap();
  }
}

// 3D Isometric Projection Engine
let is3DMode = false;

function toggleViewMode() {
  is3DMode = !is3DMode;
  const btn = document.getElementById('viewModeBtn');
  if (btn) {
    btn.innerHTML = is3DMode ? '🗺️ 2D Plan View' : '🏙️ 3D Isometric View';
    btn.style.background = is3DMode ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '';
    btn.style.color = is3DMode ? '#ffffff' : '';
    btn.style.borderColor = is3DMode ? '#38bdf8' : '';
  }
  drawMap();
}

function projectPoint(x, y, z = 0) {
  if (!is3DMode) {
    return { x, y: y - z };
  }
  // Isometric transformation centered around canvas (450, 240)
  const nx = (x - 450) / 450;
  const ny = (y - 240) / 240;

  const isoX = 450 + (nx - ny) * 350;
  const isoY = 240 + (nx + ny) * 160 - z;
  return { x: isoX, y: isoY };
}

// Particle trail storage for moving truck
const truckTrail = [];

// Draw the Road Network Map (2D Plan View & 3D Isometric Perspective)
function drawMap() {
  const now = performance.now() / 1000;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // In 3D Mode: Draw 3D Isometric Ground Grid
  if (is3DMode) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    for (let gx = 50; gx <= 850; gx += 80) {
      const p1 = projectPoint(gx, 50, 0);
      const p2 = projectPoint(gx, 430, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let gy = 50; gy <= 430; gy += 60) {
      const p1 = projectPoint(50, gy, 0);
      const p2 = projectPoint(850, gy, 0);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  // 1. Draw Roads (Edges)
  EDGES.forEach(edge => {
    const u = NODES[edge.u];
    const v = NODES[edge.v];
    const pu = projectPoint(u.x, u.y, 0);
    const pv = projectPoint(v.x, v.y, 0);

    // In 3D: Road foundation shadow
    if (is3DMode) {
      ctx.beginPath();
      ctx.moveTo(pu.x, pu.y + 3);
      ctx.lineTo(pv.x, pv.y + 3);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // Traffic Condition Highlight
    if (showTrafficOverlay) {
      const tColor = edge.traffic <= 1.0 ? '#10b981' : (edge.traffic <= 1.2 ? '#f59e0b' : '#ef4444');
      ctx.beginPath();
      ctx.moveTo(pu.x, pu.y);
      ctx.lineTo(pv.x, pv.y);
      ctx.strokeStyle = tColor;
      ctx.lineWidth = is3DMode ? 6 : 5.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(pu.x, pu.y);
    ctx.lineTo(pv.x, pv.y);
    ctx.strokeStyle = is3DMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = is3DMode ? 4 : 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    const midX = (u.x + v.x) / 2;
    const midY = (u.y + v.y) / 2;
    const pMid = projectPoint(midX, midY, is3DMode ? 6 : 0);
    
    if (showTrafficOverlay && edge.name) {
      ctx.fillStyle = edge.traffic > 1.2 ? '#f87171' : (edge.traffic > 1.0 ? '#fbbf24' : '#34d399');
      ctx.font = 'bold 8.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.name, pMid.x, pMid.y - 12);
    }

    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${edge.dist} km`, pMid.x, pMid.y - 3);
  });

  // 2. Draw Route Trajectory (Step >= 4) with Dynamic Green Serviced Line
  if (currentStep >= 4) {
    const algoConfig = ALGO_ROUTES[currentAlgoMode] || ALGO_ROUTES.astar;
    const isFullCompleted = activePathSegmentIndex >= currentPath.length - 1 && !isAnimating;

    // A. Draw Upcoming / Pending Unvisited Route Line (Cyan / Theme Color)
    if (!isFullCompleted) {
      const isParkedAtDepot = (activePathSegmentIndex === 0 && animProgress === 0 && !isAnimating);
      const effectiveStartX = isParkedAtDepot ? NODES.DEPOT.x : truckPos.x;
      const effectiveStartY = isParkedAtDepot ? NODES.DEPOT.y : truckPos.y;
      const pTruckProj = projectPoint(effectiveStartX, effectiveStartY, is3DMode ? 4 : 0);

      // Pending glow underline
      ctx.beginPath();
      ctx.moveTo(pTruckProj.x, pTruckProj.y);
      for (let i = activePathSegmentIndex + 1; i < currentPath.length; i++) {
        const p = projectPoint(NODES[currentPath[i]].x, NODES[currentPath[i]].y, is3DMode ? 4 : 0);
        ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = algoConfig.glowColor;
      ctx.lineWidth = is3DMode ? 7 : 6;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Pending marching laser dashed line
      ctx.beginPath();
      ctx.moveTo(pTruckProj.x, pTruckProj.y);
      for (let i = activePathSegmentIndex + 1; i < currentPath.length; i++) {
        const p = projectPoint(NODES[currentPath[i]].x, NODES[currentPath[i]].y, is3DMode ? 4 : 0);
        ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = algoConfig.color;
      ctx.lineWidth = 3.5;
      ctx.lineDashOffset = -(now * 28) % 20;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // B. Draw Completed / Serviced Collection Path in BRIGHT GREEN (#10b981)
    if (activePathSegmentIndex > 0 || animProgress > 0 || isFullCompleted) {
      const pStart = projectPoint(NODES[currentPath[0]].x, NODES[currentPath[0]].y, is3DMode ? 4 : 0);
      
      // Green Underglow
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      for (let i = 1; i <= activePathSegmentIndex; i++) {
        const p = projectPoint(NODES[currentPath[i]].x, NODES[currentPath[i]].y, is3DMode ? 4 : 0);
        ctx.lineTo(p.x, p.y);
      }
      if (!isFullCompleted && (activePathSegmentIndex < currentPath.length - 1)) {
        const pTruckProj = projectPoint(truckPos.x, truckPos.y, is3DMode ? 4 : 0);
        ctx.lineTo(pTruckProj.x, pTruckProj.y);
      }
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = is3DMode ? 8 : 7;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Solid Bright Green Traversed Route
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      for (let i = 1; i <= activePathSegmentIndex; i++) {
        const p = projectPoint(NODES[currentPath[i]].x, NODES[currentPath[i]].y, is3DMode ? 4 : 0);
        ctx.lineTo(p.x, p.y);
      }
      if (!isFullCompleted && (activePathSegmentIndex < currentPath.length - 1)) {
        const pTruckProj = projectPoint(truckPos.x, truckPos.y, is3DMode ? 4 : 0);
        ctx.lineTo(pTruckProj.x, pTruckProj.y);
      }
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // 3. Depth Sorting: Painter's Algorithm for flawless 3D overlap
  const sortedNodes = Object.values(NODES).sort((a, b) => {
    if (is3DMode) {
      return (a.x + a.y) - (b.x + b.y);
    }
    return 0;
  });

  // Draw Nodes (Depot, Junctions, Bins)
  sortedNodes.forEach((node, nodeIdx) => {
    const pBase = projectPoint(node.x, node.y, 0);

    if (node.type === 'depot') {
      if (is3DMode) {
        // 3D Isometric Municipal Building Block
        const bHeight = 36;
        const pTop = projectPoint(node.x, node.y, bHeight);

        // Ground Drop Shadow
        ctx.beginPath();
        ctx.ellipse(pBase.x + 4, pBase.y + 4, 22, 11, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // Left Extruded Face
        ctx.beginPath();
        ctx.moveTo(pBase.x - 16, pBase.y);
        ctx.lineTo(pBase.x, pBase.y + 8);
        ctx.lineTo(pTop.x, pTop.y + 8);
        ctx.lineTo(pTop.x - 16, pTop.y);
        ctx.closePath();
        ctx.fillStyle = '#1d4ed8';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();

        // Right Extruded Face
        ctx.beginPath();
        ctx.moveTo(pBase.x, pBase.y + 8);
        ctx.lineTo(pBase.x + 16, pBase.y);
        ctx.lineTo(pTop.x + 16, pTop.y);
        ctx.lineTo(pTop.x, pTop.y + 8);
        ctx.closePath();
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();

        // Top Roof Diamond
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y - 8);
        ctx.lineTo(pTop.x + 16, pTop.y);
        ctx.lineTo(pTop.x, pTop.y + 8);
        ctx.lineTo(pTop.x - 16, pTop.y);
        ctx.closePath();
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Blinking Dispatch Beacon on Roof
        const isBeaconOn = Math.sin(now * 6) > 0;
        ctx.beginPath();
        ctx.arc(pTop.x, pTop.y - 12, isBeaconOn ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isBeaconOn ? '#ef4444' : '#991b1b';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, pTop.x, pTop.y - 18);
      } else {
        // 2D Top-Down View
        const haloR = 20 + Math.sin(now * 2.5) * 3;
        ctx.beginPath();
        ctx.arc(pBase.x, pBase.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.18)';
        ctx.fill();

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(pBase.x - 14, pBase.y - 14, 28, 28, 7);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏢', pBase.x, pBase.y + 5);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.fillText(node.name, pBase.x, pBase.y + 24);
      }
    } else if (node.type === 'junction') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(pBase.x, pBase.y, is3DMode ? 6 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, pBase.x, pBase.y - (is3DMode ? 9 : 10));
    } else if (node.type === 'bin') {
      const isCollected = (node.isCollected === true || node.fill === 0);
      const pct = (node.fill / node.capacity) * 100;
      // All filled uncollected bins are visible in RED (#ef4444). Once reached by truck -> GREEN (#10b981)
      const color = isCollected ? '#10b981' : '#ef4444';
      const isFilledPending = (!isCollected) && (node.fill > 0);
      const isSelected = node.id === selectedBinId;

      if (is3DMode) {
        // 3D Extruded Cylinder Waste Pillar (Height = Fill Level %)
        const pillarHeight = isCollected ? 14 : (16 + (pct / 100) * 34);
        const pTop = projectPoint(node.x, node.y, pillarHeight);

        // Ground Drop Shadow
        ctx.beginPath();
        ctx.ellipse(pBase.x + 3, pBase.y + 3, 14, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fill();

        // 3D Concentric Radar Waves on Ground (only for uncollected filled bins)
        if (isFilledPending) {
          for (let w = 0; w < 2; w++) {
            const wavePhase = (now * 0.85 + w * 0.5 + nodeIdx * 0.15) % 1;
            const waveRadius = 12 + wavePhase * 18;
            const waveAlpha = (1 - wavePhase) * 0.45;
            ctx.beginPath();
            ctx.ellipse(pBase.x, pBase.y, waveRadius * 1.3, waveRadius * 0.65, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${waveAlpha})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }

        // Extruded 3D Cylinder Body
        const rad = 11;
        const grad = ctx.createLinearGradient(pBase.x - rad, 0, pBase.x + rad, 0);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, '#0f172a');

        ctx.beginPath();
        ctx.moveTo(pBase.x - rad, pBase.y);
        ctx.lineTo(pBase.x + rad, pBase.y);
        ctx.lineTo(pTop.x + rad, pTop.y);
        ctx.lineTo(pTop.x - rad, pTop.y);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 3D Top Cap Ellipse
        ctx.beginPath();
        ctx.ellipse(pTop.x, pTop.y, rad, rad * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Selected Highlighting 3D Aura
        if (isSelected) {
          const ringPulse = 14 + Math.sin(now * 4) * 2;
          ctx.beginPath();
          ctx.ellipse(pTop.x, pTop.y, ringPulse * 1.2, ringPulse * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Labels floating in 3D space
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.id, pTop.x, pTop.y - 12);

        ctx.fillStyle = color;
        ctx.font = 'bold 8.5px Inter, sans-serif';
        ctx.fillText(isCollected ? '✅ Clean (0%)' : `${Math.round(pct)}%`, pTop.x, pTop.y - 3);

      } else {
        // 2D View
        if (isFilledPending) {
          for (let w = 0; w < 2; w++) {
            const wavePhase = (now * 0.85 + w * 0.5 + nodeIdx * 0.15) % 1;
            const waveRadius = 14 + wavePhase * 18;
            const waveAlpha = (1 - wavePhase) * 0.45;
            ctx.beginPath();
            ctx.arc(pBase.x, pBase.y, waveRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${waveAlpha})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }

        if (isSelected) {
          const ringPulse = 21 + Math.sin(now * 4) * 2;
          ctx.beginPath();
          ctx.arc(pBase.x, pBase.y, ringPulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pBase.x, pBase.y, 27, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(pBase.x, pBase.y, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pBase.x, pBase.y, isCollected ? 4 : Math.max(3, 7 * (pct / 100)), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.id, pBase.x, pBase.y - 16);

        ctx.fillStyle = color;
        ctx.font = 'bold 8.5px Inter, sans-serif';
        ctx.fillText(isCollected ? '✅ 0% (CLEAN)' : `${Math.round(pct)}%`, pBase.x, pBase.y + 22);
      }
    }
  });

  // 4. Draw Animated Waste Collection Truck (with Underneath Headlights, Dual Ground Glow Rings & Shadow)
  const isParkedAtDepot = (activePathSegmentIndex === 0 && animProgress === 0 && !isAnimating);
  const currentTargetNode = NODES[currentPath[activePathSegmentIndex]] || NODES.DEPOT;
  const nextTargetNode = NODES[currentPath[activePathSegmentIndex + 1]] || currentTargetNode;

  const effectiveTruckX = truckPos.x;
  const effectiveTruckY = truckPos.y;

  const truckAltitude = is3DMode ? (10 + Math.sin(now * 4) * 2) : 0;
  const pTruck = projectPoint(effectiveTruckX, effectiveTruckY, truckAltitude);
  const pGround = projectPoint(effectiveTruckX, effectiveTruckY, 0);

  // Calculate heading angle for forward road headlights & directional sprite
  const dx = (nextTargetNode.x - currentTargetNode.x);
  const dy = (nextTargetNode.y - currentTargetNode.y);
  const headingAngle = (dx === 0 && dy === 0) ? 0 : Math.atan2(dy, dx);
  const isMovingRight = dx > 0;

  // ==========================================
  // UNDERNEATH TRUCK: 1. Ground Drop Shadow
  // ==========================================
  ctx.beginPath();
  if (is3DMode) {
    ctx.ellipse(pGround.x + 3, pGround.y + 4, 18, 9, 0, 0, Math.PI * 2);
  } else {
    ctx.ellipse(pGround.x + 2, pGround.y + 3, 16, 11, 0, 0, Math.PI * 2);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fill();

  // ==========================================
  // UNDERNEATH TRUCK: 2. Directional Forward Road Headlight Beam
  // ==========================================
  if (isAnimating && nextTargetNode && nextTargetNode !== currentTargetNode) {
    ctx.save();
    ctx.translate(pGround.x, pGround.y);
    ctx.rotate(headingAngle);

    const beamLen = is3DMode ? 55 : 70;
    const beamHalfWidth = is3DMode ? 18 : 22;
    const lightGrad = ctx.createLinearGradient(0, 0, beamLen, 0);
    lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.65)');
    lightGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.35)');
    lightGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(beamLen, -beamHalfWidth);
    ctx.lineTo(beamLen, beamHalfWidth);
    ctx.lineTo(10, 4);
    ctx.closePath();
    ctx.fillStyle = lightGrad;
    ctx.fill();

    // Sharp core yellow headlight center rays
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, -3);
    ctx.lineTo(24, -5);
    ctx.moveTo(10, 3);
    ctx.lineTo(24, 5);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // UNDERNEATH TRUCK: 3. Dual Concentric Neon Ground Rings
  // ==========================================
  for (let r = 0; r < 2; r++) {
    const ringPhase = (now * 1.5 + r * 0.5) % 1;
    const ringRadius = 10 + ringPhase * 18;
    const ringAlpha = (1 - ringPhase) * 0.65;
    ctx.beginPath();
    if (is3DMode) {
      ctx.ellipse(pGround.x, pGround.y, ringRadius * 1.35, ringRadius * 0.7, 0, 0, Math.PI * 2);
    } else {
      ctx.arc(pGround.x, pGround.y, ringRadius, 0, Math.PI * 2);
    }
    ctx.strokeStyle = `rgba(6, 182, 212, ${ringAlpha})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // ==========================================
  // UNDERNEATH TRUCK: 4. Live Extraction Beam to Target Bin
  // ==========================================
  if (isAnimating && nextTargetNode && nextTargetNode.type === 'bin' && animProgress > 0.65) {
    const pBinBase = projectPoint(nextTargetNode.x, nextTargetNode.y, 0);
    ctx.beginPath();
    ctx.moveTo(pGround.x, pGround.y);
    ctx.lineTo(pBinBase.x, pBinBase.y);
    ctx.strokeStyle = `rgba(16, 185, 129, ${(animProgress - 0.65) * 2.8})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Record trail position
  if (isAnimating && (truckTrail.length === 0 || Math.hypot(truckTrail[truckTrail.length - 1].x - pTruck.x, truckTrail[truckTrail.length - 1].y - pTruck.y) > 5)) {
    truckTrail.push({ x: pTruck.x, y: pTruck.y, alpha: 0.85 });
    if (truckTrail.length > 12) truckTrail.shift();
  }

  // Draw fading trail particles
  for (let i = 0; i < truckTrail.length; i++) {
    const p = truckTrail[i];
    p.alpha *= 0.94;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 * p.alpha, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha * 0.4})`;
    ctx.fill();
  }

  // ==========================================
  // TRUCK SPRITE & FLOATING LIVE HUD BADGE
  // ==========================================
  ctx.save();
  ctx.translate(pTruck.x, pTruck.y);

  // Glowing aura around truck
  const truckAura = 20 + Math.sin(now * 5) * 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, truckAura, 0, Math.PI * 2);
  ctx.fillStyle = isParkedAtDepot ? 'rgba(56, 189, 248, 0.22)' : 'rgba(6, 182, 212, 0.32)';
  ctx.fill();

  // Dual emergency hazard flashers on truck roof
  const isFlashing = Math.sin(now * 10) > 0;
  ctx.beginPath();
  ctx.arc(-8, -12, isFlashing ? 3 : 1.8, 0, Math.PI * 2);
  ctx.arc(8, -12, isFlashing ? 3 : 1.8, 0, Math.PI * 2);
  ctx.fillStyle = isFlashing ? '#fbbf24' : '#b45309';
  ctx.fill();

  // Directional Truck Emoji Sprite
  ctx.save();
  if (isMovingRight) {
    ctx.scale(-1, 1);
  }
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🚛', 0, 0);
  ctx.restore();

  // Sleek Floating HUD Pill Tag
  const hudTagText = isParkedAtDepot 
    ? '🅿️ Ready @ Depot' 
    : `🚛 ${truckWasteLoad}/2500 L | ⚡ ${(simSpeedMultiplier * 36).toFixed(0)}kph`;

  ctx.fillStyle = 'rgba(11, 19, 38, 0.94)';
  ctx.beginPath();
  ctx.roundRect(-46, -34, 92, 16, 6);
  ctx.fill();
  ctx.strokeStyle = isParkedAtDepot ? '#38bdf8' : '#06b6d4';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = isParkedAtDepot ? '#7dd3fc' : '#38bdf8';
  ctx.font = 'bold 8px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hudTagText, 0, -23);

  ctx.restore();
}

// Step Controller
function setPipelineStep(step) {
  currentStep = step;
  for (let i = 1; i <= 4; i++) {
    const btn = document.getElementById(`stepBtn${i}`);
    if (btn) {
      if (i === step) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  }

  updateHeapDisplay();
  updateBinsList();
  renderRegressionGraph();
  drawMap();
}

// Global Continuous Animation Engine (60 FPS)
let animFrameId = null;

function toggleRouteAnimation() {
  const playBtn = document.getElementById('playBtn');
  if (isAnimating) {
    isAnimating = false;
    if (playBtn) playBtn.innerText = '▶ Resume Route';
    return;
  }

  // If previous run already completed, reset and run from Depot
  if (!currentPath || activePathSegmentIndex >= currentPath.length - 1) {
    if (isSingleBinDispatch && singleBinTargetId) {
      dispatchSingleBin(singleBinTargetId);
      return;
    } else {
      resetSimulation();
    }
  }

  setPipelineStep(4);
  isAnimating = true;
  if (playBtn) playBtn.innerText = '⏸ Pause Route';
}

function startGlobalMasterLoop() {
  function masterLoop() {
    if (isAnimating) {
      if (!currentPath || currentPath.length < 2 || activePathSegmentIndex >= currentPath.length - 1) {
        isAnimating = false;
        const playBtn = document.getElementById('playBtn');
        if (playBtn) playBtn.innerText = '✅ Route Completed';
      } else {
        const currentTargetNode = NODES[currentPath[activePathSegmentIndex]] || NODES.DEPOT;
        const nextTargetNode = NODES[currentPath[activePathSegmentIndex + 1]] || currentTargetNode;

        animProgress += 0.02 * simSpeedMultiplier;
        if (animProgress >= 1.0) {
          animProgress = 0;
          activePathSegmentIndex++;

          const arrivedNode = NODES[currentPath[activePathSegmentIndex]];
          if (arrivedNode && arrivedNode.type === 'bin') {
            if (!arrivedNode.isCollected) {
              arrivedNode.isCollected = true;
              truckWasteLoad += (arrivedNode.initialFill !== undefined ? arrivedNode.initialFill : arrivedNode.fill);
              arrivedNode.fill = 0; // Empty the bin immediately -> Turns GREEN (#10b981)!
              playChimeSound();
              updateBinsList();
              updateHeapDisplay();
              renderRegressionGraph();
              syncSandboxSlider();
            } else {
              playBeep(520, 'sine', 0.08);
            }
          } else if (arrivedNode && arrivedNode.id === 'DEPOT') {
            truckWasteLoad = 0;
            playBeep(450, 'sine', 0.06);
          }
          updateStepCounter();
        }

        // Update HUD telemetry values
        const currentDistKm = (activePathSegmentIndex * 2.8) + (animProgress * 2.8);
        const currentFuelBurned = (currentDistKm / 3.5).toFixed(2);
        const hudFuel = document.getElementById('hudFuelVal');
        const hudLoad = document.getElementById('hudLoadVal');
        if (hudFuel) hudFuel.innerText = `${currentFuelBurned} L`;
        if (hudLoad) hudLoad.innerText = `${truckWasteLoad} / 2500 L`;

        if (currentTargetNode && nextTargetNode) {
          truckPos.x = currentTargetNode.x + (nextTargetNode.x - currentTargetNode.x) * animProgress;
          truckPos.y = currentTargetNode.y + (nextTargetNode.y - currentTargetNode.y) * animProgress;
        }
      }
    }

    drawMap();
    requestAnimationFrame(masterLoop);
  }

  requestAnimationFrame(masterLoop);
}

function resetSimulation() {
  isAnimating = false;
  animProgress = 0;
  activePathSegmentIndex = 0;
  truckWasteLoad = 0;
  truckTrail.length = 0;
  truckPos = { x: NODES.DEPOT.x, y: NODES.DEPOT.y };

  if (isSingleBinDispatch && singleBinTargetId) {
    const targetBin = NODES[singleBinTargetId];
    if (targetBin) {
      targetBin.isCollected = false;
      if (targetBin.initialFill !== undefined) targetBin.fill = targetBin.initialFill;
    }
  } else {
    // Restore all bins to their initial filled state (RED)
    Object.values(NODES).forEach(b => {
      if (b.type === 'bin') {
        b.isCollected = false;
        if (b.initialFill !== undefined) {
          b.fill = b.initialFill;
        }
      }
    });
  }

  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.innerText = '▶ Run Route';
  
  const hudFuel = document.getElementById('hudFuelVal');
  const hudLoad = document.getElementById('hudLoadVal');
  if (hudFuel) hudFuel.innerText = '0.00 L';
  if (hudLoad) hudLoad.innerText = '0 / 2500 L';

  updateStepCounter();
  updateBinsList();
  updateHeapDisplay();
  renderRegressionGraph();
  syncSandboxSlider();
  drawMap();
  setPipelineStep(1);
}

// Tab Switcher
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  const btn = btnElement || (window.event ? window.event.currentTarget : null);
  if (btn && btn.classList) {
    btn.classList.add('active');
  }
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  playClickSound();
}

// Modal Report
function openReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.classList.add('open');
}

function closeReportModal() {
  const modal = document.getElementById('reportModal');
  if (modal) modal.classList.remove('open');
}

// Canvas Mouse Hover Tag Listener (Supports 2D & 3D Projections)
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  const tooltip = document.getElementById('hoverTooltip');
  if (!tooltip) return;

  let hoveredNode = null;
  let hoveredScreenPos = null;

  for (const node of Object.values(NODES)) {
    const pScreen = projectPoint(node.x, node.y, is3DMode ? 16 : 0);
    const dx = mouseX - pScreen.x;
    const dy = mouseY - pScreen.y;
    if (Math.sqrt(dx * dx + dy * dy) < (is3DMode ? 26 : 22)) {
      hoveredNode = node;
      hoveredScreenPos = pScreen;
      break;
    }
  }

  if (hoveredNode && hoveredScreenPos) {
    let title = '';
    let body = '';

    if (hoveredNode.type === 'depot') {
      title = `🏢 ${hoveredNode.name} (DEPOT)`;
      body = `Central Dispatch Hub & Fleet Base<br>Truck Start/End Terminal`;
    } else if (hoveredNode.type === 'junction') {
      title = `🔀 ${hoveredNode.id}: ${hoveredNode.name}`;
      body = `City Road Network Intersection<br>Connected Streets: ${EDGES.filter(ed => ed.u === hoveredNode.id || ed.v === hoveredNode.id).length} Roads`;
    } else {
      const isCollected = (hoveredNode.isCollected === true || hoveredNode.fill === 0);
      const pct = Math.round((hoveredNode.fill / hoveredNode.capacity) * 100);
      const pri = getBinPriority(hoveredNode, currentStep >= 2).toFixed(1);
      const statusBadge = isCollected 
        ? '<span class="hover-tag-badge" style="background:#10b981; color:#fff;">✅ SERVICED & CLEAN (GREEN)</span>' 
        : '<span class="hover-tag-badge" style="background:#ef4444; color:#fff;">🚨 FILLED BIN (RED)</span>';
      
      title = `🗑️ ${hoveredNode.id}: ${hoveredNode.name} ${statusBadge}`;
      body = `Fill Level: <strong>${hoveredNode.fill} / ${hoveredNode.capacity} L (${pct}%)</strong><br>
              Predicted Rate: <strong>+${hoveredNode.rate}% / hr</strong> (OLS)<br>
              Heap Urgency Score: <strong>${pri}</strong><br>
              Status: <em style="color:${isCollected ? '#34d399' : '#f87171'}">${isCollected ? 'Emptied and Cleaned by EcoFleet' : 'Filled - Scheduled for collection'}</em>`;
    }

    tooltip.innerHTML = `
      <div class="hover-tag-title">${title}</div>
      <div class="hover-tag-meta">${body}</div>
    `;

    const cssX = (hoveredScreenPos.x / canvas.width) * rect.width;
    const cssY = (hoveredScreenPos.y / canvas.height) * rect.height;
    tooltip.style.left = `${cssX}px`;
    tooltip.style.top = `${cssY}px`;
    tooltip.style.display = 'block';
    canvas.style.cursor = 'pointer';
  } else {
    tooltip.style.display = 'none';
    canvas.style.cursor = 'default';
  }
});

canvas.addEventListener('mouseleave', () => {
  const tooltip = document.getElementById('hoverTooltip');
  if (tooltip) tooltip.style.display = 'none';
});

// Canvas Click to Select Node (Supports 2D & 3D)
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

  for (const node of Object.values(NODES)) {
    const pScreen = projectPoint(node.x, node.y, is3DMode ? 16 : 0);
    const dx = mouseX - pScreen.x;
    const dy = mouseY - pScreen.y;
    if (Math.sqrt(dx * dx + dy * dy) < (is3DMode ? 26 : 22)) {
      if (node.type === 'bin') {
        selectBin(node.id);
      }
      break;
    }
  }
});

// Initial Setup
window.addEventListener('DOMContentLoaded', () => {
  setPipelineStep(1);
  renderRegressionGraph();
  populateAStarCostTable();
  syncSandboxSlider();
  updateStepCounter();
  selectBin('BIN_01');
  startGlobalMasterLoop();
});
