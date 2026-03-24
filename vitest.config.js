import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/theory.js', 'src/gameState.js', 'src/notes.js'],
      thresholds: {
        lines: 90,
        functions: 100,
      },
    },
  },
});
