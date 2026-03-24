import { describe, it, expect } from 'vitest';
import {
  KEY_SIGNATURES,
  TREBLE_SHARPS, BASS_SHARPS,
  TREBLE_FLATS, BASS_FLATS,
  getKeyPool,
} from '../../src/keySignatures/data.js';

describe('KEY_SIGNATURES array', () => {
  it('has exactly 12 entries', () => {
    expect(KEY_SIGNATURES).toHaveLength(12);
  });

  it('rootPc values cover all 12 pitch classes (0–11) with no duplicates', () => {
    const pcs = KEY_SIGNATURES.map(k => k.rootPc).sort((a, b) => a - b);
    expect(pcs).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('no entry has both sharps > 0 and flats > 0', () => {
    KEY_SIGNATURES.forEach(k => {
      expect(k.sharps > 0 && k.flats > 0).toBe(false);
    });
  });

  it('C major has sharps:0, flats:0, rootPc:0', () => {
    const c = KEY_SIGNATURES.find(k => k.name === 'C');
    expect(c).toBeDefined();
    expect(c.sharps).toBe(0);
    expect(c.flats).toBe(0);
    expect(c.rootPc).toBe(0);
  });

  it('sharp counts are in range 0–6', () => {
    KEY_SIGNATURES.forEach(k => {
      expect(k.sharps).toBeGreaterThanOrEqual(0);
      expect(k.sharps).toBeLessThanOrEqual(6);
    });
  });

  it('flat counts are in range 0–5', () => {
    KEY_SIGNATURES.forEach(k => {
      expect(k.flats).toBeGreaterThanOrEqual(0);
      expect(k.flats).toBeLessThanOrEqual(5);
    });
  });
});

describe('getKeyPool()', () => {
  it("'sharps' returns 7 entries, all with flats === 0", () => {
    const pool = getKeyPool('sharps');
    expect(pool).toHaveLength(7);
    pool.forEach(k => expect(k.flats).toBe(0));
  });

  it("'flats' returns 6 entries, all with sharps === 0", () => {
    const pool = getKeyPool('flats');
    expect(pool).toHaveLength(6);
    pool.forEach(k => expect(k.sharps).toBe(0));
  });

  it("'both' returns all 12 entries", () => {
    expect(getKeyPool('both')).toHaveLength(12);
  });

  it('C major appears in all three pools', () => {
    ['sharps', 'flats', 'both'].forEach(scope => {
      const pool = getKeyPool(scope);
      expect(pool.some(k => k.name === 'C')).toBe(true);
    });
  });
});

describe('Accidental position arrays', () => {
  const arrays = [TREBLE_SHARPS, BASS_SHARPS, TREBLE_FLATS, BASS_FLATS];
  const names  = ['TREBLE_SHARPS', 'BASS_SHARPS', 'TREBLE_FLATS', 'BASS_FLATS'];

  it('each array has exactly 7 entries', () => {
    arrays.forEach((arr, i) => {
      expect(arr, names[i]).toHaveLength(7);
    });
  });

  it('all pos values are numbers in range [0, 6.5]', () => {
    arrays.forEach((arr, i) => {
      arr.forEach(({ pos }) => {
        expect(typeof pos, names[i]).toBe('number');
        expect(pos, names[i]).toBeGreaterThanOrEqual(0);
        expect(pos, names[i]).toBeLessThanOrEqual(6.5);
      });
    });
  });
});
