# Project Architecture

## Directory Structure

```
note-trainer/
  index.html          Lean HTML template — no inline scripts or styles
  src/
    notes.js          Note data constants (BASS, TREBLE, ACC, FLAT arrays)
    theory.js         Pure music-theory functions (midiNoteName, midiFullName, getPool)
    gameState.js      Pure state machine (applyCorrect, applyWrong, isSessionDone, summaryStats)
    audio.js          Web Audio API synthesis (playTone, playWrongSound)
    staff.js          HTML5 Canvas rendering of the musical staff and note head
    piano.js          DOM class toggling for HTML/CSS piano key feedback
    game.js           Game orchestration — imports all modules, owns DOM side-effects
    main.js           Entry point — event listeners, init calls
    style.css         All application styles
  tests/
    notes.test.js     Data integrity checks for note arrays
    theory.test.js    Unit tests for pure music-theory functions
    gameState.test.js Unit tests for the pure state machine
  .github/
    workflows/
      ci.yml          Lint → Test → Build → Deploy pipeline
```

## Module Responsibilities

- **notes.js**: Static data only. Six exported arrays of note objects `{ name, midi, pos, acc? }`.
- **theory.js**: Pure functions with no side effects. No DOM, no audio, no imports beyond notes.js.
- **gameState.js**: Pure state machine. No DOM. Functions take a state object and return a new one (immutable).
- **audio.js**: Web Audio API. Creates oscillators on demand; shares a single `AudioContext` instance.
- **staff.js**: Draws the 5-line staff, clef symbol, note head, stem, ledger lines, and accidentals on a `<canvas>`.
- **piano.js**: The piano is rendered as **HTML/CSS `<div>` elements** (not canvas). `piano.js` only toggles CSS classes (`pk-active`, `pk-wrong`) for visual feedback.
- **game.js**: Imports theory, gameState, audio, staff, and piano. Owns all DOM getElementById calls and setTimeout-based answer flow.
- **main.js**: Wires `addEventListener` calls to the exported functions from game.js. No logic lives here.

## Data Flow

```
User Input (MIDI note-on / piano div click)
  → game.js (handleButtonPress / onMidi)
    → theory.js  (compare note names)
    → gameState.js  (applyCorrect / applyWrong → new state)
    → DOM updates  (stats, feedback, pip bar)
    → audio.js  (playTone / playWrongSound)
    → staff.js  (drawNote on next question)
    → piano.js  (drawPiano — class toggling)
```

## Implementation Rules

- No module-level side effects (DOM reads/writes only inside exported functions).
- `theory.js` and `gameState.js` must remain free of any DOM or Web API references.
- Music theory calculations and state transitions must have unit tests in `tests/`.
- Use `export`/`import` for all inter-module dependencies.
