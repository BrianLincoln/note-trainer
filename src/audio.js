let audioCtx = null;

export function playWrongSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    [[110, 0], [92.5, 0.19]].forEach(([freq, delay]) => {
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(0.11, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.22);
      osc.start(t + delay);
      osc.stop(t + delay + 0.23);
    });
  } catch(e) {}
}

export function playTone(midi, correct) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (correct ? 0.9 : 0.3));
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + (correct ? 0.9 : 0.3));
  } catch(e) {}
}
