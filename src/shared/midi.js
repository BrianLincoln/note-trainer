import { drawPiano } from './piano.js';
import { playTone } from './audio.js';

export function createOnMidi(getModule) {
  return function onMidi(event) {
    const [status, note, velocity] = event.data;
    if ((status & 0xf0) !== 0x90 || velocity === 0) return;
    if (!document.getElementById('screen-game').classList.contains('active')) {
      playTone(note, true);
      return;
    }
    drawPiano(note % 12);
    getModule()?.handleMidiInput(note);
  };
}

export async function connectMidi(silent = false, onMidi, onConnect) {
  if (!navigator.requestMIDIAccess) {
    if (!silent) document.getElementById('midi-name').textContent = 'not supported in this browser';
    return;
  }
  if (silent && navigator.permissions) {
    try {
      const perm = await navigator.permissions.query({ name: 'midi', sysex: false });
      if (perm.state !== 'granted') return;
    } catch { /* permissions API unavailable, fall through */ }
  }
  try {
    const access = await navigator.requestMIDIAccess();
    const inputs = [...access.inputs.values()];
    if (!inputs.length) {
      if (!silent) document.getElementById('midi-name').textContent = 'no devices found — plug in first';
      return;
    }
    inputs.forEach(i => i.onmidimessage = onMidi);
    document.getElementById('midi-name').textContent = inputs[0].name || 'keyboard connected';
    document.getElementById('midi-dot').classList.add('on');
    onConnect?.();
  } catch {
    if (!silent) document.getElementById('midi-name').textContent = 'access denied';
  }
}
