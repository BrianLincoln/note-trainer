/**
 * Pure state machine for Note Trainer game sessions.
 * All functions are side-effect free — they take a state object
 * and return a new one without mutating the input.
 */

/**
 * Returns a fresh initial state object.
 * @returns {{ correct: number, wrong: number, streak: number, questionCount: number, bestStreak: number }}
 */
export function initialState() {
  return { correct: 0, wrong: 0, streak: 0, questionCount: 0, bestStreak: 0 };
}

/**
 * Applies a correct-answer event to state.
 * @param {{ correct: number, wrong: number, streak: number, questionCount: number, bestStreak: number }} state
 * @returns {{ correct: number, wrong: number, streak: number, questionCount: number, bestStreak: number }}
 */
export function applyCorrect(state) {
  const streak = state.streak + 1;
  return {
    ...state,
    correct: state.correct + 1,
    streak,
    questionCount: state.questionCount + 1,
    bestStreak: Math.max(state.bestStreak, streak),
  };
}

/**
 * Applies a wrong-answer event to state.
 * @param {{ correct: number, wrong: number, streak: number, questionCount: number, bestStreak: number }} state
 * @returns {{ correct: number, wrong: number, streak: number, questionCount: number, bestStreak: number }}
 */
export function applyWrong(state) {
  return {
    ...state,
    wrong: state.wrong + 1,
    streak: 0,
    questionCount: state.questionCount + 1,
  };
}

/**
 * Returns true if the session is complete.
 * @param {{ questionCount: number }} state
 * @param {number|null} questionLimit — null or 0 means infinite
 * @returns {boolean}
 */
export function isSessionDone(state, questionLimit) {
  if (!questionLimit) return false;
  return state.questionCount >= questionLimit;
}

/**
 * Computes summary stats for the end-of-session screen.
 * @param {{ correct: number, wrong: number }} state
 * @returns {{ total: number, pct: number }}
 */
export function summaryStats(state) {
  const total = state.correct + state.wrong;
  const pct = total ? Math.round(state.correct / total * 100) : 0;
  return { total, pct };
}
