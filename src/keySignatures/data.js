// ── Key signature definitions ─────────────────────────────────
// 12 major keys, one per pitch class (no enharmonic duplicates).
export const KEY_SIGNATURES = [
  { name: 'C',  rootPc: 0,  sharps: 0, flats: 0 },
  { name: 'G',  rootPc: 7,  sharps: 1, flats: 0 },
  { name: 'D',  rootPc: 2,  sharps: 2, flats: 0 },
  { name: 'A',  rootPc: 9,  sharps: 3, flats: 0 },
  { name: 'E',  rootPc: 4,  sharps: 4, flats: 0 },
  { name: 'B',  rootPc: 11, sharps: 5, flats: 0 },
  { name: 'F♯', rootPc: 6,  sharps: 6, flats: 0 },
  { name: 'F',  rootPc: 5,  sharps: 0, flats: 1 },
  { name: 'B♭', rootPc: 10, sharps: 0, flats: 2 },
  { name: 'E♭', rootPc: 3,  sharps: 0, flats: 3 },
  { name: 'A♭', rootPc: 8,  sharps: 0, flats: 4 },
  { name: 'D♭', rootPc: 1,  sharps: 0, flats: 5 },
];

// ── Accidental staff positions ────────────────────────────────
// pos system: 1 = bottom staff line, 0.5 increments per space/line.
// Sharp order: F C G D A E B
export const TREBLE_SHARPS = [
  { pos: 5   },  // F♯ — top line
  { pos: 3.5 },  // C♯ — 3rd space
  { pos: 5.5 },  // G♯ — above top line
  { pos: 4   },  // D♯ — 4th line
  { pos: 2.5 },  // A♯ — 2nd space
  { pos: 4.5 },  // E♯ — 4th space
  { pos: 3   },  // B♯ — middle line
];

export const BASS_SHARPS = [
  { pos: 4   },  // F♯ — 4th line
  { pos: 2.5 },  // C♯ — 2nd space
  { pos: 4.5 },  // G♯ — 4th space
  { pos: 3   },  // D♯ — middle line
  { pos: 1.5 },  // A♯ — 1st space
  { pos: 3.5 },  // E♯ — 3rd space
  { pos: 2   },  // B♯ — 2nd line
];

// Flat order: B♭ E♭ A♭ D♭ G♭ C♭ F♭
export const TREBLE_FLATS = [
  { pos: 3   },  // B♭ — middle line
  { pos: 4.5 },  // E♭ — 4th space
  { pos: 2.5 },  // A♭ — 2nd space
  { pos: 4   },  // D♭ — 4th line
  { pos: 2   },  // G♭ — 2nd line
  { pos: 3.5 },  // C♭ — 3rd space
  { pos: 1.5 },  // F♭ — 1st space
];

export const BASS_FLATS = [
  { pos: 2   },  // B♭ — 2nd line
  { pos: 3.5 },  // E♭ — 3rd space
  { pos: 1.5 },  // A♭ — 1st space
  { pos: 3   },  // D♭ — middle line
  { pos: 1   },  // G♭ — bottom line
  { pos: 2.5 },  // C♭ — 2nd space
  { pos: 0.5 },  // F♭ — below staff
];

// ── Pool helpers ──────────────────────────────────────────────
// 'sharps' → 7 keys (C + 6 sharp keys)
// 'flats'  → 6 keys (C + 5 flat keys)
// 'both'   → all 12 keys
export function getKeyPool(scope) {
  if (scope === 'sharps') return KEY_SIGNATURES.filter(k => k.flats === 0);
  if (scope === 'flats')  return KEY_SIGNATURES.filter(k => k.sharps === 0);
  return KEY_SIGNATURES;
}
