import './style.css';
import * as noteReadingExercise from './noteReading/index.js';
import * as keySignaturesExercise from './keySignatures/index.js';
import { drawPiano } from './shared/piano.js';
import { playTone } from './shared/audio.js';
import { summaryStats } from './shared/gameState.js';

// ── Setup state ─────────────────────────────────────────────
let clefMode = 'treble';
let questionLimit = 10;
let includeAccidentals = false;
let keyScope = 'sharps';

// ── Exercise routing ─────────────────────────────────────────
let currentExercise = null;
let currentExerciseModule = null;
let lastConfig = null;

// ── Screen management ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function showSetupFor(exercise) {
  currentExercise = exercise;
  document.querySelector('.setup-section--note-reading').style.display =
    exercise === 'noteReading' ? '' : 'none';
  document.querySelector('.setup-section--key-sig').style.display =
    exercise === 'keySig' ? '' : 'none';
  document.querySelector('#screen-setup .setup-sub').textContent =
    exercise === 'noteReading' ? 'sight reading · staff drill' : 'key signature · identification';
  const midiConnected = document.getElementById('midi-dot').classList.contains('on');
  document.getElementById('octave-row').style.display =
    (exercise === 'noteReading' && midiConnected) ? '' : 'none';
  showScreen('setup');
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

// ── Home screen ──────────────────────────────────────────────
document.getElementById('ex-note-reading').addEventListener('click', () => showSetupFor('noteReading'));
document.getElementById('ex-key-sig').addEventListener('click', () => showSetupFor('keySig'));

// ── Setup: Clef ──────────────────────────────────────────────
function selectClef(c) {
  clefMode = c;
  ['treble', 'bass', 'both'].forEach(x =>
    document.getElementById('clef-' + x).classList.toggle('selected', x === c)
  );
}
document.getElementById('clef-treble').addEventListener('click', () => selectClef('treble'));
document.getElementById('clef-bass').addEventListener('click',   () => selectClef('bass'));
document.getElementById('clef-both').addEventListener('click',   () => selectClef('both'));

// ── Setup: Count ─────────────────────────────────────────────
function selectCount(n) {
  questionLimit = n;
  const opts = [5, 10, 20, null];
  opts.forEach(v => {
    const el = document.getElementById('count-' + (v === null ? 'inf' : v));
    if (el) el.classList.toggle('selected', v === n);
  });
}
document.getElementById('count-5').addEventListener('click',   () => selectCount(5));
document.getElementById('count-10').addEventListener('click',  () => selectCount(10));
document.getElementById('count-20').addEventListener('click',  () => selectCount(20));
document.getElementById('count-inf').addEventListener('click', () => selectCount(null));

// ── Setup: Accidentals toggle (note reading only) ────────────
document.getElementById('acc-toggle').closest('.toggle-row').addEventListener('click', () => {
  includeAccidentals = !includeAccidentals;
  document.getElementById('acc-toggle').classList.toggle('on', includeAccidentals);
});

// ── Setup: Key scope (key sigs only) ─────────────────────────
function selectScope(s) {
  keyScope = s;
  ['sharps', 'flats', 'both'].forEach(x =>
    document.getElementById('scope-' + x).classList.toggle('selected', x === s)
  );
}
document.getElementById('scope-sharps').addEventListener('click', () => selectScope('sharps'));
document.getElementById('scope-flats').addEventListener('click',  () => selectScope('flats'));
document.getElementById('scope-both').addEventListener('click',   () => selectScope('both'));

// ── Setup: Octave toggle (note reading + MIDI only) ──────────
document.getElementById('octave-row').addEventListener('click', noteReadingExercise.toggleOctave);

// ── MIDI ─────────────────────────────────────────────────────
export async function connectMidi(silent = false) {
  if (!navigator.requestMIDIAccess) {
    if (!silent) document.getElementById('midi-name').textContent = 'not supported in this browser';
    return;
  }
  if (silent && navigator.permissions) {
    try {
      const perm = await navigator.permissions.query({ name: 'midi', sysex: false });
      if (perm.state !== 'granted') return;
    } catch { /* permissions API unavailable, fall through */ }
  }
  try {
    const access = await navigator.requestMIDIAccess();
    const inputs = [...access.inputs.values()];
    if (!inputs.length) {
      if (!silent) document.getElementById('midi-name').textContent = 'no devices found — plug in first';
      return;
    }
    inputs.forEach(i => i.onmidimessage = onMidi);
    document.getElementById('midi-name').textContent = inputs[0].name || 'keyboard connected';
    document.getElementById('midi-dot').classList.add('on');
    if (currentExercise === 'noteReading') {
      document.getElementById('octave-row').style.display = '';
    }
  } catch {
    if (!silent) document.getElementById('midi-name').textContent = 'access denied';
  }
}

function onMidi(event) {
  const [status, note, velocity] = event.data;
  if ((status & 0xf0) !== 0x90 || velocity === 0) return;
  if (!document.getElementById('screen-game').classList.contains('active')) {
    playTone(note, true);
    return;
  }
  drawPiano(note % 12);
  currentExerciseModule?.handleMidiInput(note);
}

document.querySelector('.connect-link').addEventListener('click', () => connectMidi());

// ── Start game ───────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', () => {
  if (currentExercise === 'noteReading') {
    currentExerciseModule = noteReadingExercise;
  } else if (currentExercise === 'keySig') {
    currentExerciseModule = keySignaturesExercise;
  } else {
    return;
  }
  lastConfig = {
    clef: clefMode,
    questionLimit,
    includeAccidentals,
    keyScope,
    onComplete: showSummary,
  };
  showScreen('game');
  currentExerciseModule.startGame(lastConfig);
});

// ── Back from game ───────────────────────────────────────────
document.querySelector('#screen-game .back-btn').addEventListener('click', () => {
  currentExerciseModule?.stopGame();
  showSetupFor(currentExercise);
});

// ── Back from setup → home ───────────────────────────────────
document.getElementById('setup-home-btn').addEventListener('click', () => showScreen('home'));

// ── Summary buttons ──────────────────────────────────────────
document.getElementById('summary-menu-btn').addEventListener('click', () => showScreen('home'));
document.getElementById('summary-again-btn').addEventListener('click', () => {
  if (currentExerciseModule && lastConfig) {
    showScreen('game');
    currentExerciseModule.startGame(lastConfig);
  }
});

// ── Piano click ──────────────────────────────────────────────
document.getElementById('piano').addEventListener('click', e => {
  const key = e.target.closest('.piano-key-white, .piano-key-black');
  if (!key) return;
  const pc = parseInt(key.dataset.pc, 10);
  drawPiano(pc);
  currentExerciseModule?.handlePianoInput(pc);
});

// ── Resize ───────────────────────────────────────────────────
window.addEventListener('resize', () => currentExerciseModule?.redrawCurrent());

// ── Init ─────────────────────────────────────────────────────
connectMidi(true);
