import { BASS, TREBLE, BASS_ACC, TREBLE_ACC, BASS_FLAT, TREBLE_FLAT } from './notes.js';

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/**
 * Returns the pitch-class name for a MIDI number (uses sharps).
 * @param {number} midi — integer 0–127
 * @returns {string} — e.g. 'C', 'C#', 'D', ..., 'B'
 */
export function midiNoteName(midi) {
  return NOTE_NAMES[midi % 12];
}

/**
 * Returns the full note name including octave.
 * Convention: MIDI 60 = C4, MIDI 0 = C-1.
 * @param {number} midi — integer 0–127
 * @returns {string} — e.g. 'C4', 'D#3'
 */
export function midiFullName(midi) {
  const letter = midiNoteName(midi);
  const octave = Math.floor(midi / 12) - 1;
  return letter + octave;
}

/**
 * Returns the note pool for the given game settings.
 * In 'both' mode, C4 is supplied only once (from TREBLE, not BASS).
 * @param {'treble'|'bass'|'both'} clefMode
 * @param {boolean} includeAccidentals
 * @returns {Array<{name:string, midi:number, pos:number, acc?:string}>}
 */
export function getPool(clefMode, includeAccidentals) {
  if (clefMode === 'treble') {
    return includeAccidentals ? [...TREBLE, ...TREBLE_ACC, ...TREBLE_FLAT] : TREBLE;
  }
  if (clefMode === 'bass') {
    return includeAccidentals ? [...BASS, ...BASS_ACC, ...BASS_FLAT] : BASS;
  }
  // 'both': exclude C4 from BASS to avoid duplication with TREBLE
  const bassNotes = BASS.filter(n => n.name !== 'C4');
  if (includeAccidentals) {
    return [...bassNotes, ...BASS_ACC, ...BASS_FLAT, ...TREBLE, ...TREBLE_ACC, ...TREBLE_FLAT];
  }
  return [...bassNotes, ...TREBLE];
}
