import { BASS, BASS_ACC, BASS_FLAT } from './notes.js';
import { playTone, playWrongSound } from '../shared/audio.js';
import { drawNote } from './staff.js';
import { drawPiano } from '../shared/piano.js';
import { midiNoteName, midiFullName, getPool } from './theory.js';
import { initialState, applyCorrect, applyWrong, isSessionDone } from '../shared/gameState.js';

// ── Module state ─────────────────────────────────────────────
let enforceOctave = false;
let currentNote = null;
let state = initialState();
let waitingForNext = false;
let lastPlayedPc = -1;
let _config = null;

// ── Octave toggle (note-reading specific, wired by main.js) ──
export function toggleOctave() {
  enforceOctave = !enforceOctave;
  document.getElementById('octave-toggle').classList.toggle('on', enforceOctave);
}

// ── Exercise interface ────────────────────────────────────────
export function startGame(config) {
  _config = config;
  enforceOctave = false;
  document.getElementById('octave-toggle').classList.remove('on');
  state = initialState();
  updateStats();
  buildStreakPips();
  const qc = document.getElementById('q-counter');
  qc.textContent = config.questionLimit ? '0 / ' + config.questionLimit : '';
  nextNote();
}

export function handlePianoInput(pc) {
  if (!currentNote || waitingForNext) return;
  if (currentNote.midi % 12 === pc) {
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
  if (!currentNote || waitingForNext) return;
  const isCorrect = enforceOctave
    ? midi === currentNote.midi
    : midiNoteName(midi) === midiNoteName(currentNote.midi);
  const playedLabel = enforceOctave ? midiFullName(midi) : midiNoteName(midi);
  if (isCorrect) {
    handleCorrect();
  } else {
    lastPlayedPc = midi % 12;
    handleWrong(playedLabel);
  }
}

export function stopGame() {
  currentNote = null;
  waitingForNext = false;
}

export function redrawCurrent() {
  if (currentNote) {
    const isBass = BASS.includes(currentNote) || BASS_ACC.includes(currentNote) || BASS_FLAT.includes(currentNote);
    drawNote(currentNote, isBass);
    drawPiano();
  }
}

// ── Internal helpers ──────────────────────────────────────────
function nextNote() {
  waitingForNext = false;
  const pool = getPool(_config.clef, _config.includeAccidentals);
  let n;
  do { n = pool[Math.floor(Math.random() * pool.length)]; }
  while (pool.length > 1 && n === currentNote);
  currentNote = n;

  const isBass = BASS.includes(n) || BASS_ACC.includes(n) || BASS_FLAT.includes(n);
  document.getElementById('clef-tag').textContent = isBass ? 'bass clef' : 'treble clef';
  drawNote(n, isBass);
  drawPiano();

  document.getElementById('note-reveal').classList.remove('show');
  document.getElementById('note-reveal').textContent = '';
  document.getElementById('octave-hint').textContent = '';
  setFeedback('play the note shown above', '');
}

function handleCorrect() {
  state = applyCorrect(state);
  updateStats();
  revealNote();
  playTone(currentNote.midi, true);
  setFeedback('✓ correct', 'correct');
  waitingForNext = true;
  const done = isSessionDone(state, _config.questionLimit);
  setTimeout(done ? finishSession : nextNote, 1100);
}

function handleWrong(played) {
  state = applyWrong(state);
  updateStats();
  revealNote();
  playWrongSound();
  setFeedback('✗  you played ' + played + ' — this is ' + currentNote.name, 'wrong');
  waitingForNext = true;

  const correctPc = currentNote.midi % 12;
  const wpc = lastPlayedPc;
  drawPiano(correctPc, wpc);
  setTimeout(() => drawPiano(-1, wpc),        300);
  setTimeout(() => drawPiano(correctPc, wpc), 600);
  setTimeout(() => drawPiano(-1, wpc),        900);
  setTimeout(() => drawPiano(correctPc, wpc), 1200);

  const done = isSessionDone(state, _config.questionLimit);
  setTimeout(done ? finishSession : nextNote, 1800);
}

function finishSession() {
  currentNote = null;
  waitingForNext = false;
  _config.onComplete(state);
}

function revealNote() {
  const el = document.getElementById('note-reveal');
  el.textContent = currentNote.name;
  el.classList.add('show');
  document.getElementById('octave-hint').textContent = '';
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
