import './style.css';
import {
  selectClef,
  selectCount,
  toggleAccidentals,
  toggleOctave,
  connectMidi,
  startGame,
  playAgain,
  goBack,
  pianoClickHandler,
  buildStreakPips,
  redrawCurrent,
} from './game.js';

// Clef buttons
document.getElementById('clef-treble').addEventListener('click', () => selectClef('treble'));
document.getElementById('clef-bass').addEventListener('click',   () => selectClef('bass'));
document.getElementById('clef-both').addEventListener('click',   () => selectClef('both'));

// Count buttons
document.getElementById('count-5').addEventListener('click',   () => selectCount(5));
document.getElementById('count-10').addEventListener('click',  () => selectCount(10));
document.getElementById('count-20').addEventListener('click',  () => selectCount(20));
document.getElementById('count-inf').addEventListener('click', () => selectCount(null));

// Toggles
document.getElementById('acc-toggle').closest('.toggle-row').addEventListener('click', toggleAccidentals);
document.getElementById('octave-row').addEventListener('click', toggleOctave);

// MIDI connect link
document.querySelector('.connect-link').addEventListener('click', () => connectMidi());

// Start / nav buttons
document.getElementById('start-btn').addEventListener('click', startGame);
document.querySelector('#screen-game .back-btn').addEventListener('click', goBack);
document.querySelector('#screen-summary .secondary-btn').addEventListener('click', goBack);
document.querySelector('#screen-summary .start-btn').addEventListener('click', playAgain);

// Piano
document.getElementById('piano').addEventListener('click', pianoClickHandler);

// Resize
window.addEventListener('resize', redrawCurrent);

// Init
buildStreakPips();
connectMidi(true);
