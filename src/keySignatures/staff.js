import { TREBLE_SHARPS, TREBLE_FLATS, BASS_SHARPS, BASS_FLATS } from './data.js';

export function drawKeySignature(keySig, isBass) {
  const canvas = document.getElementById('staff');
  const card = canvas.closest('.staff-card');
  const style = getComputedStyle(card);
  const innerW = card.clientWidth
    - parseFloat(style.paddingLeft)
    - parseFloat(style.paddingRight);
  const W = Math.max(innerW, 160);
  const s = W / 300;
  const H = Math.round(150 * s);
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const ink = dark ? '#f0ede4' : '#1c1a14';

  const staffTop  = 32 * s;
  const ls        = 13 * s;
  const left      = 62 * s;
  const w         = 196 * s;
  const bottomLine = staffTop + 4 * ls;

  // Draw staff lines
  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(left, staffTop + i * ls);
    ctx.lineTo(left + w, staffTop + i * ls);
    ctx.stroke();
  }

  // Draw clef
  ctx.fillStyle = ink;
  if (isBass) {
    ctx.font = `${Math.round(46 * s)}px serif`;
    ctx.fillText('𝄢', left - 46 * s, staffTop + 34 * s);
  } else {
    ctx.font = `${Math.round(62 * s)}px serif`;
    ctx.fillText('𝄞', left - 42 * s, staffTop + 50 * s);
  }

  // Draw accidentals
  const accPositions = isBass
    ? (keySig.sharps ? BASS_SHARPS.slice(0, keySig.sharps) : BASS_FLATS.slice(0, keySig.flats))
    : (keySig.sharps ? TREBLE_SHARPS.slice(0, keySig.sharps) : TREBLE_FLATS.slice(0, keySig.flats));

  const accChar    = keySig.sharps ? '♯' : '♭';
  const accStartX  = left + 4 * s;
  const accSpacing = 11 * s;

  ctx.font = `bold ${Math.round(14 * s)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ink;

  accPositions.forEach(({ pos }, i) => {
    const x = accStartX + i * accSpacing;
    const y = bottomLine - (pos - 1) * ls;
    ctx.fillText(accChar, x, y);
  });

  // Reset text defaults
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
