import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'src/noteReading/theory.js',
        'src/noteReading/notes.js',
        'src/shared/gameState.js',
        'src/keySignatures/data.js',
      ],
      thresholds: {
        lines: 90,
        functions: 100,
      },
    },
  },
});
