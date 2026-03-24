import { describe, it, expect } from 'vitest';
import { initialState, applyCorrect, applyWrong, isSessionDone, summaryStats } from '../src/gameState.js';

// ── initialState ──────────────────────────────────────────────────────────────

describe('initialState', () => {
  it('returns the correct shape with all zeros', () => {
    expect(initialState()).toEqual({
      correct: 0,
      wrong: 0,
      streak: 0,
      questionCount: 0,
      bestStreak: 0,
    });
  });

  it('returns a new object each time (not a shared reference)', () => {
    const a = initialState();
    const b = initialState();
    expect(a).not.toBe(b);
  });
});

// ── applyCorrect ──────────────────────────────────────────────────────────────

describe('applyCorrect', () => {
  it('increments correct by 1', () => {
    const s = applyCorrect(initialState());
    expect(s.correct).toBe(1);
  });

  it('increments streak by 1', () => {
    const s = applyCorrect(initialState());
    expect(s.streak).toBe(1);
  });

  it('increments questionCount by 1', () => {
    const s = applyCorrect(initialState());
    expect(s.questionCount).toBe(1);
  });

  it('does not mutate the input state', () => {
    const original = initialState();
    applyCorrect(original);
    expect(original).toEqual(initialState());
  });

  it('updates bestStreak when new streak exceeds it', () => {
    const s = applyCorrect(applyCorrect(applyCorrect(initialState())));
    expect(s.bestStreak).toBe(3);
  });

  it('does not decrease bestStreak when streak is below it', () => {
    let s = applyCorrect(applyCorrect(applyCorrect(initialState()))); // bestStreak = 3
    s = applyWrong(s);                                                // streak resets
    s = applyCorrect(s);                                              // streak = 1
    expect(s.bestStreak).toBe(3);
  });

  it('does not change wrong count', () => {
    const s = applyCorrect(initialState());
    expect(s.wrong).toBe(0);
  });
});

// ── applyWrong ────────────────────────────────────────────────────────────────

describe('applyWrong', () => {
  it('increments wrong by 1', () => {
    const s = applyWrong(initialState());
    expect(s.wrong).toBe(1);
  });

  it('resets streak to 0', () => {
    let s = applyCorrect(applyCorrect(applyCorrect(initialState())));
    expect(s.streak).toBe(3);
    s = applyWrong(s);
    expect(s.streak).toBe(0);
  });

  it('increments questionCount by 1', () => {
    const s = applyWrong(initialState());
    expect(s.questionCount).toBe(1);
  });

  it('does not mutate the input state', () => {
    const original = initialState();
    applyWrong(original);
    expect(original).toEqual(initialState());
  });

  it('does not change bestStreak', () => {
    let s = applyCorrect(applyCorrect(initialState())); // bestStreak = 2
    s = applyWrong(s);
    expect(s.bestStreak).toBe(2);
  });

  it('does not change correct count', () => {
    const s = applyWrong(initialState());
    expect(s.correct).toBe(0);
  });
});

// ── Sequence tests ────────────────────────────────────────────────────────────

describe('sequences', () => {
  it('3 corrects then 1 wrong: streak=0, bestStreak=3, correct=3, wrong=1, questionCount=4', () => {
    let s = initialState();
    s = applyCorrect(s);
    s = applyCorrect(s);
    s = applyCorrect(s);
    s = applyWrong(s);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(3);
    expect(s.correct).toBe(3);
    expect(s.wrong).toBe(1);
    expect(s.questionCount).toBe(4);
  });

  it('wrong then 2 corrects: streak=2, bestStreak=2, correct=2, wrong=1', () => {
    let s = initialState();
    s = applyWrong(s);
    s = applyCorrect(s);
    s = applyCorrect(s);
    expect(s.streak).toBe(2);
    expect(s.bestStreak).toBe(2);
    expect(s.correct).toBe(2);
    expect(s.wrong).toBe(1);
  });
});

// ── isSessionDone ─────────────────────────────────────────────────────────────

describe('isSessionDone', () => {
  it('returns false when questionCount < questionLimit', () => {
    const s = { ...initialState(), questionCount: 5 };
    expect(isSessionDone(s, 10)).toBe(false);
  });

  it('returns true when questionCount === questionLimit', () => {
    const s = { ...initialState(), questionCount: 10 };
    expect(isSessionDone(s, 10)).toBe(true);
  });

  it('returns true when questionCount > questionLimit', () => {
    const s = { ...initialState(), questionCount: 11 };
    expect(isSessionDone(s, 10)).toBe(true);
  });

  it('returns false when questionLimit is null (infinite mode)', () => {
    const s = { ...initialState(), questionCount: 999 };
    expect(isSessionDone(s, null)).toBe(false);
  });

  it('returns false when questionLimit is 0 (treated as infinite)', () => {
    const s = { ...initialState(), questionCount: 999 };
    expect(isSessionDone(s, 0)).toBe(false);
  });
});

// ── summaryStats ──────────────────────────────────────────────────────────────

describe('summaryStats', () => {
  it('pct is 100 when all correct', () => {
    const s = { ...initialState(), correct: 10, wrong: 0 };
    expect(summaryStats(s)).toEqual({ total: 10, pct: 100 });
  });

  it('pct is 0 when all wrong', () => {
    const s = { ...initialState(), correct: 0, wrong: 10 };
    expect(summaryStats(s)).toEqual({ total: 10, pct: 0 });
  });

  it('pct is 75 for correct=3, wrong=1', () => {
    const s = { ...initialState(), correct: 3, wrong: 1 };
    expect(summaryStats(s)).toEqual({ total: 4, pct: 75 });
  });

  it('pct rounds to nearest integer', () => {
    const s = { ...initialState(), correct: 1, wrong: 2 };
    // 1/3 = 33.33... → rounds to 33
    expect(summaryStats(s).pct).toBe(33);
  });

  it('total is 0 and pct is 0 when no questions answered (no divide-by-zero)', () => {
    expect(summaryStats(initialState())).toEqual({ total: 0, pct: 0 });
  });
});
