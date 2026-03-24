import { BASS, TREBLE, BASS_ACC, TREBLE_ACC, BASS_FLAT, TREBLE_FLAT } from './notes.js';
import { playTone, playWrongSound } from './audio.js';
import { drawNote } from './staff.js';
import { drawPiano } from './piano.js';

// ── State ──────────────────────────────────────────────────
let clefMode = 'treble';
let enforceOctave = false;
let includeAccidentals = false;
let questionLimit = 10;
let midiConnected = false;
let currentNote = null;
let correct = 0, wrong = 0, streak = 0, questionCount = 0, bestStreak = 0;
let waitingForNext = false;
let lastPlayedPc = -1;

// ── Setup ──────────────────────────────────────────────────
export function toggleOctave() {
  enforceOctave = !enforceOctave;
  document.getElementById('octave-toggle').classList.toggle('on', enforceOctave);
}

export function toggleAccidentals() {
  includeAccidentals = !includeAccidentals;
  document.getElementById('acc-toggle').classList.toggle('on', includeAccidentals);
}

export function selectCount(n) {
  questionLimit = n;
  const opts = [5, 10, 20, null];
  opts.forEach(v => {
    const el = document.getElementById('count-' + (v === null ? 'inf' : v));
    if (el) el.classList.toggle('selected', v === n);
  });
}

export function selectClef(c) {
  clefMode = c;
  ['treble','bass','both'].forEach(x =>
    document.getElementById('clef-'+x).classList.toggle('selected', x===c)
  );
}

export async function connectMidi(silent = false) {
  if (!navigator.requestMIDIAccess) {
    if (!silent) document.getElementById('midi-name').textContent = 'not supported in this browser';
    return;
  }
  if (silent && navigator.permissions) {
    try {
      const perm = await navigator.permissions.query({ name: 'midi', sysex: false });
      if (perm.state !== 'granted') return;
    } catch(e) { /* permissions API unavailable, fall through */ }
  }
  try {
    const access = await navigator.requestMIDIAccess();
    const inputs = [...access.inputs.values()];
    if (!inputs.length) {
      if (!silent) document.getElementById('midi-name').textContent = 'no devices found — plug in first';
      return;
    }
    inputs.forEach(i => i.onmidimessage = onMidi);
    midiConnected = true;
    document.getElementById('midi-name').textContent = inputs[0].name || 'keyboard connected';
    document.getElementById('midi-dot').classList.add('on');
    document.getElementById('octave-row').style.display = '';
  } catch(e) {
    if (!silent) document.getElementById('midi-name').textContent = 'access denied';
  }
}

export function startGame() {
  correct = 0; wrong = 0; streak = 0; questionCount = 0; bestStreak = 0;
  updateStats();
  buildStreakPips();
  const qc = document.getElementById('q-counter');
  qc.textContent = questionLimit ? '0 / ' + questionLimit : '';
  showScreen('game');
  nextNote();
}

export function playAgain() {
  startGame();
}

export function handleButtonPress(pitchClass, label) {
  if (!currentNote || waitingForNext) return;
  if (currentNote.midi % 12 === pitchClass) {
    handleCorrect();
  } else {
    lastPlayedPc = pitchClass;
    handleWrong(label);
  }
}

export function pianoClickHandler(e) {
  const key = e.target.closest('.piano-key-white, .piano-key-black');
  if (!key) return;
  const pc = parseInt(key.dataset.pc, 10);
  const label = key.dataset.label || key.querySelector('.pk-label').textContent;
  drawPiano(pc);
  handleButtonPress(pc, label);
}

export function goBack() {
  currentNote = null;
  waitingForNext = false;
  showScreen('setup');
}

export function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
}

// ── Game ───────────────────────────────────────────────────
function getPool() {
  if (clefMode === 'treble') {
    return includeAccidentals ? [...TREBLE, ...TREBLE_ACC, ...TREBLE_FLAT] : TREBLE;
  }
  if (clefMode === 'bass') {
    return includeAccidentals ? [...BASS, ...BASS_ACC, ...BASS_FLAT] : BASS;
  }
  const bassNotes = BASS.filter(n => n.name !== 'C4');
  if (includeAccidentals) {
    return [...bassNotes, ...BASS_ACC, ...BASS_FLAT, ...TREBLE, ...TREBLE_ACC, ...TREBLE_FLAT];
  }
  return [...bassNotes, ...TREBLE];
}

function nextNote() {
  waitingForNext = false;
  const pool = getPool();
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

function onMidi(event) {
  const [status, note, velocity] = event.data;
  if ((status & 0xf0) !== 0x90 || velocity === 0) return;

  if (!document.getElementById('screen-game').classList.contains('active')) {
    playTone(note, true);
    return;
  }

  drawPiano(note % 12);

  if (!currentNote || waitingForNext) return;

  const isCorrect = enforceOctave
    ? note === currentNote.midi
    : midiNoteName(note) === midiNoteName(currentNote.midi);
  const playedLabel = enforceOctave ? midiFullName(note) : midiNoteName(note);

  if (isCorrect) {
    handleCorrect();
  } else {
    lastPlayedPc = note % 12;
    handleWrong(playedLabel);
  }
}

function midiNoteName(midi) {
  return ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][midi % 12];
}

function midiFullName(midi) {
  const letter = midiNoteName(midi);
  const octave = Math.floor(midi / 12) - 1;
  return letter + octave;
}

function handleCorrect() {
  correct++;
  streak++;
  questionCount++;
  if (streak > bestStreak) bestStreak = streak;
  updateStats();
  revealNote();
  playTone(currentNote.midi, true);
  setFeedback('✓ correct', 'correct');
  waitingForNext = true;
  const done = questionLimit && questionCount >= questionLimit;
  setTimeout(done ? showSummary : nextNote, 1100);
}

function handleWrong(played) {
  wrong++;
  streak = 0;
  questionCount++;
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

  const done = questionLimit && questionCount >= questionLimit;
  setTimeout(done ? showSummary : nextNote, 1800);
}

function showSummary() {
  currentNote = null;
  waitingForNext = false;
  const total = correct + wrong;
  const pct = total ? Math.round(correct / total * 100) : 0;
  document.getElementById('sum-score').textContent = correct + ' / ' + total;
  document.getElementById('sum-pct').textContent = pct + '% correct';
  document.getElementById('sum-correct').textContent = correct;
  document.getElementById('sum-wrong').textContent = wrong;
  document.getElementById('sum-streak').textContent = bestStreak;
  showScreen('summary');
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
  document.getElementById('s-correct').textContent = correct;
  document.getElementById('s-wrong').textContent = wrong;
  document.getElementById('s-streak').textContent = streak;
  if (questionLimit) {
    document.getElementById('q-counter').textContent = questionCount + ' / ' + questionLimit;
  }
  updatePips();
}

export function buildStreakPips() {
  const bar = document.getElementById('streak-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div');
    d.className = 'streak-pip';
    d.id = 'pip-'+i;
    bar.appendChild(d);
  }
}

function updatePips() {
  for (let i = 0; i < 10; i++) {
    const p = document.getElementById('pip-'+i);
    if (p) p.classList.toggle('lit', i < streak);
  }
}

export function redrawCurrent() {
  if (currentNote) {
    const isBass = BASS.includes(currentNote) || BASS_ACC.includes(currentNote) || BASS_FLAT.includes(currentNote);
    drawNote(currentNote, isBass);
    drawPiano();
  }
}
