let clefMode = 'treble';
let questionLimit = 10;
let showNoteNames = true;

export function initSetupUI() {
  function selectClef(c) {
    clefMode = c;
    ['treble', 'bass', 'both'].forEach(x =>
      document.getElementById('clef-' + x).classList.toggle('selected', x === c)
    );
  }
  document.getElementById('clef-treble').addEventListener('click', () => selectClef('treble'));
  document.getElementById('clef-bass').addEventListener('click',   () => selectClef('bass'));
  document.getElementById('clef-both').addEventListener('click',   () => selectClef('both'));

  function selectCount(n) {
    questionLimit = n;
    const opts = [5, 10, 20, null];
    opts.forEach(v => {
      const el = document.getElementById('count-' + (v === null ? 'inf' : v));
      if (el) el.classList.toggle('selected', v === n);
    });
  }
  document.getElementById('count-5').addEventListener('click',   () => selectCount(5));
  document.getElementById('count-10').addEventListener('click',  () => selectCount(10));
  document.getElementById('count-20').addEventListener('click',  () => selectCount(20));
  document.getElementById('count-inf').addEventListener('click', () => selectCount(null));

  document.getElementById('note-names-row').addEventListener('click', () => {
    showNoteNames = !showNoteNames;
    document.getElementById('note-names-toggle').classList.toggle('on', showNoteNames);
    document.getElementById('piano').classList.toggle('labels-hidden', !showNoteNames);
  });
}

export function getSetupConfig() {
  return { clef: clefMode, questionLimit, showNoteNames };
}
