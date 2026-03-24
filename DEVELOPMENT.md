# Development Lifecycle

## 1. When to Write Tests

**Theory Logic:** Any function in `src/theory.js` that calculates note names, MIDI mapping, or builds note pools must have a corresponding unit test in `tests/theory.test.js`.

**Regressions:** If a bug is found (e.g., "Eb4 is showing as D#4"), a failing test must be written before the fix is implemented.

**State Transitions:** Test score and streak logic in `tests/gameState.test.js` to ensure correct/wrong events increment and reset properly.

## 2. Running Tests and Linting

```bash
npm run lint            # ESLint — must pass with zero errors
npm run test            # Vitest single-pass (CI mode)
npm run test:watch      # Vitest watch mode (development)
npm run test:coverage   # Vitest with V8 coverage report
```

## 3. Pre-Deployment Checklist

Before pushing to `main`:

1. **Lint:** `npm run lint` passes with zero errors.
2. **Test suite:** `npm run test` — all tests green.
3. **Coverage:** `npm run test:coverage` meets thresholds (≥90% lines on `theory.js`, `gameState.js`, `notes.js`).
4. **Local build:** `npm run build` completes without error, producing `docs/`.
5. **Mobile layout:** Open `npm run preview` at 375px viewport — the HTML/CSS div piano and staff canvas are not clipped and render correctly.
6. **Dark mode:** Verify the staff canvas renders correctly in `prefers-color-scheme: dark`.

## 4. Deployment Flow

Deployment is fully automated via GitHub Actions on push to `main`.

**Pipeline:** `lint` → `test` → `build` → deploy to `gh-pages` branch

- The Action builds the project (`npm run build` → `docs/`) and pushes the output to the `gh-pages` branch using `peaceiris/actions-gh-pages`.
- GitHub Pages serves from the `gh-pages` branch root.
- The `docs/` directory is **not committed to `main`** — it is a local build artifact only.

**When asked to "deploy," Claude should:**
1. Run `npm run lint` and `npm run test` locally. Fix any failures.
2. Commit changes with a descriptive message.
3. Push to `main`.
4. Confirm the GitHub Actions CI run has started (check the Actions tab).
