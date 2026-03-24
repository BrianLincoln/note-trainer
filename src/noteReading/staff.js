export function drawNote(note, isBass) {
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

  const staffTop = 32 * s;
  const ls     = 13 * s;
  const left   = 62 * s;
  const w      = 196 * s;
  const bottomLine = staffTop + 4 * ls;
  const noteX  = left + w / 2 + 14 * s;
  const rx = 7 * s, ry = 5.5 * s;

  ctx.strokeStyle = ink;
  ctx.lineWidth = 0.8 * s;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(left, staffTop + i * ls);
    ctx.lineTo(left + w, staffTop + i * ls);
    ctx.stroke();
  }

  ctx.fillStyle = ink;
  if (isBass) {
    ctx.font = `${Math.round(46 * s)}px serif`;
    ctx.fillText('𝄢', left - 46 * s, staffTop + 34 * s);
  } else {
    ctx.font = `${Math.round(62 * s)}px serif`;
    ctx.fillText('𝄞', left - 42 * s, staffTop + 50 * s);
  }

  const noteY = bottomLine - (note.pos - 1) * ls;

  ctx.lineWidth = 1 * s;
  if (note.pos <= 0.5) {
    ctx.beginPath();
    ctx.moveTo(noteX - rx - 5 * s, bottomLine + ls);
    ctx.lineTo(noteX + rx + 5 * s, bottomLine + ls);
    ctx.stroke();
  }
  if (note.pos >= 6) {
    ctx.beginPath();
    ctx.moveTo(noteX - rx - 5 * s, staffTop - ls);
    ctx.lineTo(noteX + rx + 5 * s, staffTop - ls);
    ctx.stroke();
  }

  if (note.acc) {
    const accChar = note.acc === '#' ? '♯' : '♭';
    ctx.font = `bold ${Math.round(15 * s)}px serif`;
    ctx.fillStyle = ink;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(accChar, noteX - rx - 3 * s, noteY);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  ctx.beginPath();
  ctx.ellipse(noteX, noteY, rx, ry, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();

  const stemDir = note.pos < 3 ? -1 : 1;
  const stemX = stemDir === 1 ? noteX - rx + 1 * s : noteX + rx - 1 * s;
  ctx.beginPath();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.4 * s;
  ctx.moveTo(stemX, noteY);
  ctx.lineTo(stemX, noteY + stemDir * ls * 3.2);
  ctx.stroke();
}
