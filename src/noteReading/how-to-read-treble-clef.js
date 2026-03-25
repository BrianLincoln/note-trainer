import '../style.css';
import { TREBLE } from './notes.js';

const BY_NAME = Object.fromEntries(TREBLE.map(n => [n.name, n]));

// ── Static staff renderer ─────────────────────────────────────────────────────
// Draws one or more notes on a named canvas. Uses the same geometry as
// staff.js but supports multiple notes and note-name labels for education.
function drawStaticStaff(canvasId, notes, { labelNotes = true } = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const container = canvas.parentElement;
  const cs = getComputedStyle(container);
  const innerW = container.clientWidth
    - parseFloat(cs.paddingLeft)
    - parseFloat(cs.paddingRight);
  const W = Math.max(innerW, 160);
  const s = W / 300;
  const H = Math.round((labelNotes ? 162 : 150) * s);
  canvas.width  = W;
  canvas.height = H;

  const ctx      = canvas.getContext('2d');
  const dark     = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const ink      = dark ? '#f0ede4' : '#1c1a14';
  const accent   = dark ? '#7ab88a' : '#2d5a3d';

  ctx.clearRect(0, 0, W, H);

  const staffTop  = 32 * s;
  const ls        = 13 * s;
  const left      = 62 * s;
  const w         = 196 * s;
  const bottomLine = staffTop + 4 * ls;
  const rx = 7 * s, ry = 5.5 * s;

  // Staff lines
  ctx.strokeStyle = ink;
  ctx.lineWidth   = 0.8 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(left, staffTop + i * ls);
    ctx.lineTo(left + w, staffTop + i * ls);
    ctx.stroke();
  }

  // Treble clef
  ctx.fillStyle = ink;
  ctx.font = `${Math.round(62 * s)}px serif`;
  ctx.fillText('𝄞', left - 42 * s, staffTop + 50 * s);

  // Distribute notes horizontally; single notes get the original centred position
  const count   = notes.length;
  const noteXs  = notes.map((_, i) =>
    count === 1
      ? left + w / 2 + 14 * s
      : left + (w / (count + 1)) * (i + 1)
  );

  notes.forEach((note, i) => {
    const noteX = noteXs[i];
    const noteY = bottomLine - (note.pos - 1) * ls;

    // Ledger line below staff (C4, D4 — pos ≤ 0.5)
    ctx.strokeStyle = ink;
    ctx.lineWidth   = 1 * s;
    if (note.pos <= 0.5) {
      ctx.beginPath();
      ctx.moveTo(noteX - rx - 5 * s, bottomLine + ls);
      ctx.lineTo(noteX + rx + 5 * s, bottomLine + ls);
      ctx.stroke();
    }
    // Ledger line above staff (pos ≥ 6)
    if (note.pos >= 6) {
      ctx.beginPath();
      ctx.moveTo(noteX - rx - 5 * s, staffTop - ls);
      ctx.lineTo(noteX + rx + 5 * s, staffTop - ls);
      ctx.stroke();
    }

    // Note head (drawn in accent colour so it pops on the educational page)
    ctx.beginPath();
    ctx.ellipse(noteX, noteY, rx, ry, -0.15, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();

    // Stem
    const stemDir = note.pos < 3 ? -1 : 1;
    const stemX   = stemDir === 1 ? noteX - rx + 1 * s : noteX + rx - 1 * s;
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 1.4 * s;
    ctx.moveTo(stemX, noteY);
    ctx.lineTo(stemX, noteY + stemDir * ls * 3.2);
    ctx.stroke();

    // Note-name label below the staff
    if (labelNotes) {
      ctx.fillStyle    = ink;
      ctx.font         = `${Math.round(10 * s)}px "DM Mono", monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(note.name, noteX, bottomLine + 2.4 * ls);
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  });
}

// ── Draw all four educational staves ─────────────────────────────────────────
function initStaves() {
  // G4 — shows where the clef curl sits
  drawStaticStaff('staff-g4', [BY_NAME['G4']]);

  // Five line notes: E4 G4 B4 D5 F5
  drawStaticStaff('staff-lines', ['E4', 'G4', 'B4', 'D5', 'F5'].map(n => BY_NAME[n]));

  // Four space notes: F4 A4 C5 E5
  drawStaticStaff('staff-spaces', ['F4', 'A4', 'C5', 'E5'].map(n => BY_NAME[n]));

  // Middle C — one ledger line below the staff
  drawStaticStaff('staff-middlec', [BY_NAME['C4']]);
}

// Wait for custom fonts to load before drawing so labels render at the right size
document.fonts.ready.then(() => {
  initStaves();
  window.addEventListener('resize', initStaves);
});
