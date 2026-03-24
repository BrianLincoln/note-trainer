export function drawPiano(activePc = -1, wrongPc = -1) {
  document.querySelectorAll('.piano-key-white, .piano-key-black').forEach(el => {
    const pc = parseInt(el.dataset.pc, 10);
    el.classList.toggle('pk-active', pc === activePc);
    el.classList.toggle('pk-wrong',  pc === wrongPc);
  });
}
