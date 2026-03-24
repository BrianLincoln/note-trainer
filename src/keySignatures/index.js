import { playTone, playWrongSound } from '../shared/audio.js';
import { drawPiano } from '../shared/piano.js';
import { drawKeySignature } from './staff.js';
import { getKeyPool } from './data.js';
import { initialState, applyCorrect, applyWrong, isSessionDone } from '../shared/gameState.js';

// ── Module state ─────────────────────────────────────────────
let currentKey = null;
let state = initialState();
let waitingForNext = false;
let lastPlayedPc = -1;
let _config = null;
let _isBass = false;

// ── Exercise interface ────────────────────────────────────────
export function startGame(config) {
  _config = config;
  state = initialState();
  updateStats();
  buildStreakPips();
  const qc = document.getElementById('q-counter');
  qc.textContent = config.questionLimit ? '0 / ' + config.questionLimit : '';
  nextKey();
}

export function handlePianoInput(pc) {
  if (!currentKey || waitingForNext) return;
  if (currentKey.rootPc === pc) {
    handleCorrect();
  } else {
    lastPlayedPc = pc;
    const key = document.querySelector(`.piano-key-white[data-pc="${pc}"], .piano-key-black[data-pc="${pc}"]`);
    const label = key
      ? (key.dataset.label || key.querySelector('.pk-label').textContent)
      : String(pc);
    handleWrong(label);
  }
}

export function handleMidiInput(midi) {
  if (!currentKey || waitingForNext) return;
  const pc = midi % 12;
  if (currentKey.rootPc === pc) {
    handleCorrect();
  } else {
    lastPlayedPc = pc;
    const key = document.querySelector(`.piano-key-white[data-pc="${pc}"], .piano-key-black[data-pc="${pc}"]`);
    const label = key
      ? (key.dataset.label || key.querySelector('.pk-label').textContent)
      : String(pc);
    handleWrong(label);
  }
}

export function stopGame() {
  currentKey = null;
  waitingForNext = false;
}

export function redrawCurrent() {
  if (currentKey) {
    drawKeySignature(currentKey, _isBass);
    drawPiano();
  }
}

// ── Internal helpers ──────────────────────────────────────────
function nextKey() {
  waitingForNext = false;
  const pool = getKeyPool(_config.keyScope);
  let k;
  do { k = pool[Math.floor(Math.random() * pool.length)]; }
  while (pool.length > 1 && k === currentKey);
  currentKey = k;

  // Determine clef for this question
  if (_config.clef === 'both') {
    _isBass = Math.random() < 0.5;
  } else {
    _isBass = _config.clef === 'bass';
  }

  document.getElementById('clef-tag').textContent = _isBass ? 'bass clef' : 'treble clef';
  drawKeySignature(currentKey, _isBass);
  drawPiano();

  document.getElementById('note-reveal').classList.remove('show');
  document.getElementById('note-reveal').textContent = '';
  document.getElementById('octave-hint').textContent = '';
  setFeedback('name this key — click its root note', '');
}

function handleCorrect() {
  state = applyCorrect(state);
  updateStats();
  revealKey();
  // Play the root note (MIDI 60 = C4, offset by rootPc)
  playTone(60 + currentKey.rootPc, true);
  setFeedback('✓ correct', 'correct');
  waitingForNext = true;
  const done = isSessionDone(state, _config.questionLimit);
  setTimeout(done ? finishSession : nextKey, 1100);
}

function handleWrong(played) {
  state = applyWrong(state);
  updateStats();
  revealKey();
  playWrongSound();
  setFeedback('✗  you played ' + played + ' — this is ' + currentKey.name + ' major', 'wrong');
  waitingForNext = true;

  const correctPc = currentKey.rootPc;
  const wpc = lastPlayedPc;
  drawPiano(correctPc, wpc);
  setTimeout(() => drawPiano(-1, wpc),        300);
  setTimeout(() => drawPiano(correctPc, wpc), 600);
  setTimeout(() => drawPiano(-1, wpc),        900);
  setTimeout(() => drawPiano(correctPc, wpc), 1200);

  const done = isSessionDone(state, _config.questionLimit);
  setTimeout(done ? finishSession : nextKey, 1800);
}

function finishSession() {
  currentKey = null;
  waitingForNext = false;
  _config.onComplete(state);
}

function revealKey() {
  const el = document.getElementById('note-reveal');
  el.textContent = currentKey.name + ' major';
  el.classList.add('show');
  const accCount = currentKey.sharps || currentKey.flats;
  const accWord  = currentKey.sharps ? 'sharp' : 'flat';
  document.getElementById('octave-hint').textContent =
    accCount === 0 ? 'no accidentals' : accCount + ' ' + accWord + (accCount > 1 ? 's' : '');
}

function setFeedback(msg, cls) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = 'feedback-bar ' + cls;
}

function updateStats() {
  document.getElementById('s-correct').textContent = state.correct;
  document.getElementById('s-wrong').textContent = state.wrong;
  document.getElementById('s-streak').textContent = state.streak;
  if (_config && _config.questionLimit) {
    document.getElementById('q-counter').textContent = state.questionCount + ' / ' + _config.questionLimit;
  }
  updatePips();
}

function buildStreakPips() {
  const bar = document.getElementById('streak-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'streak-pip';
    d.id = 'pip-' + i;
    bar.appendChild(d);
  }
}

function updatePips() {
  for (let i = 0; i < 10; i++) {
    const p = document.getElementById('pip-' + i);
    if (p) p.classList.toggle('lit', i < state.streak);
  }
}
