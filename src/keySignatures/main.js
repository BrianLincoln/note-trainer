import '../style.css';
import * as exercise from './index.js';
import { drawPiano } from '../shared/piano.js';
import { summaryStats } from '../shared/gameState.js';
import { initSetupUI, getSetupConfig } from '../shared/setupUI.js';
import { connectMidi, createOnMidi } from '../shared/midi.js';

let keyScope = 'sharps';
let currentModule = null;
let lastConfig = null;

initSetupUI();

// Exercise-specific: key scope
function selectScope(s) {
  keyScope = s;
  ['sharps', 'flats', 'both'].forEach(x =>
    document.getElementById('scope-' + x).classList.toggle('selected', x === s)
  );
}
document.getElementById('scope-sharps').addEventListener('click', () => selectScope('sharps'));
document.getElementById('scope-flats').addEventListener('click',  () => selectScope('flats'));
document.getElementById('scope-both').addEventListener('click',   () => selectScope('both'));

// ── Screen management ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showSummary(state) {
  const { total, pct } = summaryStats(state);
  document.getElementById('sum-score').textContent = state.correct + ' / ' + total;
  document.getElementById('sum-pct').textContent = pct + '% correct';
  document.getElementById('sum-correct').textContent = state.correct;
  document.getElementById('sum-wrong').textContent = state.wrong;
  document.getElementById('sum-streak').textContent = state.bestStreak;
  showScreen('summary');
}

// ── Start game ───────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  const { clef, questionLimit } = getSetupConfig();
  currentModule = exercise;
  lastConfig = { clef, questionLimit, keyScope, onComplete: showSummary };
  showScreen('game');
  exercise.startGame(lastConfig);
});

// ── Back from game ───────────────────────────────────────────
document.querySelector('#screen-game .back-btn').addEventListener('click', () => {
  exercise.stopGame();
  showScreen('setup');
});

// ── Back from setup → home ───────────────────────────────────
document.getElementById('setup-home-btn').addEventListener('click', () => {
  window.location.href = '../';
});

// ── Summary buttons ──────────────────────────────────────────
document.getElementById('summary-menu-btn').addEventListener('click', () => {
  window.location.href = '../';
});
document.getElementById('summary-again-btn').addEventListener('click', () => {
  if (lastConfig) {
    showScreen('game');
    exercise.startGame(lastConfig);
  }
});

// ── Piano click ──────────────────────────────────────────────
document.getElementById('piano').addEventListener('click', e => {
  const key = e.target.closest('.piano-key-white, .piano-key-black');
  if (!key) return;
  const pc = parseInt(key.dataset.pc, 10);
  drawPiano(pc);
  currentModule?.handlePianoInput(pc);
});

// ── Resize ───────────────────────────────────────────────────
window.addEventListener('resize', () => currentModule?.redrawCurrent());

// ── MIDI ─────────────────────────────────────────────────────
const onMidi = createOnMidi(() => currentModule);
connectMidi(true, onMidi);
document.querySelector('.connect-link').addEventListener('click', () => connectMidi(false, onMidi));
