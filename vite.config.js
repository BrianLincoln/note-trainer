import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home:               resolve(__dirname, 'index.html'),
        noteReading:        resolve(__dirname, 'note-reading/index.html'),
        noteReadingContent: resolve(__dirname, 'note-reading/how-to-read-treble-clef.html'),
        keySig:             resolve(__dirname, 'key-signatures/index.html'),
        keySigContent:      resolve(__dirname, 'key-signatures/circle-of-fifths-chart.html'),
      },
    },
  },
})
