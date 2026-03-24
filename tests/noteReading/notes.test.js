import { describe, it, expect } from 'vitest';
import { BASS, TREBLE, BASS_ACC, TREBLE_ACC, BASS_FLAT, TREBLE_FLAT } from '../../src/noteReading/notes.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isStrictlyIncreasing(arr) {
  return arr.every((n, i) => i === 0 || n.midi > arr[i - 1].midi);
}

// ── BASS ─────────────────────────────────────────────────────────────────────

describe('BASS', () => {
  it('has exactly 11 entries', () => {
    expect(BASS).toHaveLength(11);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(BASS)).toBe(true);
  });

  it('no entry has an acc property', () => {
    expect(BASS.every(n => n.acc === undefined)).toBe(true);
  });

  it('starts at G2 (midi 43) and ends at C4 (midi 60)', () => {
    expect(BASS[0]).toMatchObject({ name: 'G2', midi: 43 });
    expect(BASS[BASS.length - 1]).toMatchObject({ name: 'C4', midi: 60 });
  });

  it('has no duplicate MIDI numbers', () => {
    const midis = BASS.map(n => n.midi);
    expect(new Set(midis).size).toBe(midis.length);
  });
});

// ── TREBLE ───────────────────────────────────────────────────────────────────

describe('TREBLE', () => {
  it('has exactly 11 entries', () => {
    expect(TREBLE).toHaveLength(11);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(TREBLE)).toBe(true);
  });

  it('no entry has an acc property', () => {
    expect(TREBLE.every(n => n.acc === undefined)).toBe(true);
  });

  it('starts at C4 (midi 60) and ends at F5 (midi 77)', () => {
    expect(TREBLE[0]).toMatchObject({ name: 'C4', midi: 60 });
    expect(TREBLE[TREBLE.length - 1]).toMatchObject({ name: 'F5', midi: 77 });
  });

  it('has no duplicate MIDI numbers', () => {
    const midis = TREBLE.map(n => n.midi);
    expect(new Set(midis).size).toBe(midis.length);
  });
});

// ── BASS and TREBLE overlap ───────────────────────────────────────────────────

describe('BASS and TREBLE overlap', () => {
  it('share exactly one note: C4 (midi 60)', () => {
    const bassMidis = new Set(BASS.map(n => n.midi));
    const trebleMidis = new Set(TREBLE.map(n => n.midi));
    const overlap = [...bassMidis].filter(m => trebleMidis.has(m));
    expect(overlap).toEqual([60]);
  });
});

// ── BASS_ACC ─────────────────────────────────────────────────────────────────

describe('BASS_ACC', () => {
  it('has exactly 7 entries', () => {
    expect(BASS_ACC).toHaveLength(7);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(BASS_ACC)).toBe(true);
  });

  it('every entry has acc === "#"', () => {
    expect(BASS_ACC.every(n => n.acc === '#')).toBe(true);
  });

  it('MIDI numbers do not duplicate any natural BASS note', () => {
    const bassMidis = new Set(BASS.map(n => n.midi));
    expect(BASS_ACC.every(n => !bassMidis.has(n.midi))).toBe(true);
  });
});

// ── TREBLE_ACC ───────────────────────────────────────────────────────────────

describe('TREBLE_ACC', () => {
  it('has exactly 7 entries', () => {
    expect(TREBLE_ACC).toHaveLength(7);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(TREBLE_ACC)).toBe(true);
  });

  it('every entry has acc === "#"', () => {
    expect(TREBLE_ACC.every(n => n.acc === '#')).toBe(true);
  });
});

// ── BASS_FLAT ─────────────────────────────────────────────────────────────────

describe('BASS_FLAT', () => {
  it('has exactly 7 entries', () => {
    expect(BASS_FLAT).toHaveLength(7);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(BASS_FLAT)).toBe(true);
  });

  it('every entry has acc === "b"', () => {
    expect(BASS_FLAT.every(n => n.acc === 'b')).toBe(true);
  });
});

// ── TREBLE_FLAT ───────────────────────────────────────────────────────────────

describe('TREBLE_FLAT', () => {
  it('has exactly 7 entries', () => {
    expect(TREBLE_FLAT).toHaveLength(7);
  });

  it('MIDI numbers are strictly increasing', () => {
    expect(isStrictlyIncreasing(TREBLE_FLAT)).toBe(true);
  });

  it('every entry has acc === "b"', () => {
    expect(TREBLE_FLAT.every(n => n.acc === 'b')).toBe(true);
  });
});

// ── Enharmonic pairing (ACC ↔ FLAT) ──────────────────────────────────────────

describe('Enharmonic pairing', () => {
  it('every BASS_ACC note has a BASS_FLAT counterpart with the same MIDI number', () => {
    const flatMidis = new Set(BASS_FLAT.map(n => n.midi));
    expect(BASS_ACC.every(n => flatMidis.has(n.midi))).toBe(true);
  });

  it('every TREBLE_ACC note has a TREBLE_FLAT counterpart with the same MIDI number', () => {
    const flatMidis = new Set(TREBLE_FLAT.map(n => n.midi));
    expect(TREBLE_ACC.every(n => flatMidis.has(n.midi))).toBe(true);
  });

  it('BASS_ACC and BASS_FLAT are the same length (fully paired)', () => {
    expect(BASS_ACC).toHaveLength(BASS_FLAT.length);
  });

  it('TREBLE_ACC and TREBLE_FLAT are the same length (fully paired)', () => {
    expect(TREBLE_ACC).toHaveLength(TREBLE_FLAT.length);
  });
});
