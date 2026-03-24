import { describe, it, expect } from 'vitest';
import { midiNoteName, midiFullName, getPool } from '../../src/noteReading/theory.js';
import { BASS, TREBLE, BASS_ACC, TREBLE_ACC, BASS_FLAT, TREBLE_FLAT } from '../../src/noteReading/notes.js';

// ── midiNoteName ─────────────────────────────────────────────────────────────

describe('midiNoteName', () => {
  it('midi 60 (C4) → "C"', () => expect(midiNoteName(60)).toBe('C'));
  it('midi 61 (C#4/Db4) → "C#"', () => expect(midiNoteName(61)).toBe('C#'));
  it('midi 62 (D4) → "D"', () => expect(midiNoteName(62)).toBe('D'));
  it('midi 69 (A4) → "A"', () => expect(midiNoteName(69)).toBe('A'));
  it('midi 0 → "C"', () => expect(midiNoteName(0)).toBe('C'));
  it('midi 11 → "B"', () => expect(midiNoteName(11)).toBe('B'));
  it('midi 127 → "G"', () => expect(midiNoteName(127)).toBe('G'));

  it('octave wrapping: midi 72 → "C" (same pitch class as midi 60)', () => {
    expect(midiNoteName(72)).toBe('C');
  });

  it('returns all 12 pitch classes in correct order', () => {
    const expected = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const result = Array.from({ length: 12 }, (_, i) => midiNoteName(i));
    expect(result).toEqual(expected);
  });
});

// ── midiFullName ─────────────────────────────────────────────────────────────

describe('midiFullName', () => {
  it('midi 60 → "C4"', () => expect(midiFullName(60)).toBe('C4'));
  it('midi 61 → "C#4"', () => expect(midiFullName(61)).toBe('C#4'));
  it('midi 69 → "A4"', () => expect(midiFullName(69)).toBe('A4'));
  it('midi 48 → "C3"', () => expect(midiFullName(48)).toBe('C3'));
  it('midi 21 → "A0" (lowest standard piano key)', () => expect(midiFullName(21)).toBe('A0'));
  it('midi 43 → "G2" (lowest BASS note)', () => expect(midiFullName(43)).toBe('G2'));
  it('midi 77 → "F5" (highest TREBLE note)', () => expect(midiFullName(77)).toBe('F5'));

  it('octave boundary: midi 59 → "B3", midi 60 → "C4"', () => {
    expect(midiFullName(59)).toBe('B3');
    expect(midiFullName(60)).toBe('C4');
  });
});

// ── getPool ───────────────────────────────────────────────────────────────────

describe('getPool — treble, no accidentals', () => {
  it('returns 11 entries', () => {
    expect(getPool('treble', false)).toHaveLength(11);
  });

  it('contains no entries with acc property', () => {
    expect(getPool('treble', false).every(n => n.acc === undefined)).toBe(true);
  });

  it('returns the TREBLE array by reference', () => {
    expect(getPool('treble', false)).toBe(TREBLE);
  });
});

describe('getPool — treble, with accidentals', () => {
  it('has length 11 + 7 + 7 = 25', () => {
    expect(getPool('treble', true)).toHaveLength(25);
  });

  it('contains entries with acc "#"', () => {
    expect(getPool('treble', true).some(n => n.acc === '#')).toBe(true);
  });

  it('contains entries with acc "b"', () => {
    expect(getPool('treble', true).some(n => n.acc === 'b')).toBe(true);
  });

  it('includes all TREBLE_ACC entries', () => {
    const pool = getPool('treble', true);
    expect(TREBLE_ACC.every(n => pool.includes(n))).toBe(true);
  });

  it('includes all TREBLE_FLAT entries', () => {
    const pool = getPool('treble', true);
    expect(TREBLE_FLAT.every(n => pool.includes(n))).toBe(true);
  });
});

describe('getPool — bass, no accidentals', () => {
  it('returns 11 entries', () => {
    expect(getPool('bass', false)).toHaveLength(11);
  });

  it('returns the BASS array by reference', () => {
    expect(getPool('bass', false)).toBe(BASS);
  });
});

describe('getPool — bass, with accidentals', () => {
  it('has length 11 + 7 + 7 = 25', () => {
    expect(getPool('bass', true)).toHaveLength(25);
  });

  it('includes all BASS_ACC entries', () => {
    const pool = getPool('bass', true);
    expect(BASS_ACC.every(n => pool.includes(n))).toBe(true);
  });
});

describe('getPool — both, no accidentals', () => {
  it('has 10 + 11 = 21 entries (BASS minus C4, plus all TREBLE)', () => {
    expect(getPool('both', false)).toHaveLength(21);
  });

  it('C4 appears exactly once', () => {
    const pool = getPool('both', false);
    const c4Count = pool.filter(n => n.name === 'C4' && n.acc === undefined).length;
    expect(c4Count).toBe(1);
  });

  it('contains no entries with acc property', () => {
    expect(getPool('both', false).every(n => n.acc === undefined)).toBe(true);
  });

  it('does not include the BASS C4 entry', () => {
    const pool = getPool('both', false);
    const bassC4 = BASS.find(n => n.name === 'C4');
    expect(pool.includes(bassC4)).toBe(false);
  });

  it('includes the TREBLE C4 entry', () => {
    const pool = getPool('both', false);
    const trebleC4 = TREBLE.find(n => n.name === 'C4');
    expect(pool.includes(trebleC4)).toBe(true);
  });
});

describe('getPool — both, with accidentals', () => {
  it('has 10 + 7 + 7 + 11 + 7 + 7 = 49 entries', () => {
    expect(getPool('both', true)).toHaveLength(49);
  });

  it('C4 natural appears exactly once', () => {
    const pool = getPool('both', true);
    const c4Count = pool.filter(n => n.name === 'C4' && n.acc === undefined).length;
    expect(c4Count).toBe(1);
  });
});
