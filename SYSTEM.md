# Note Trainer: System Overview

## Mission
To provide a friction-free, browser-based environment for beginner musicians to master sight-reading and music theory. 

## Core Principles
1. **Low Latency:** Audio and visual feedback must be near-instant.
2. **Web-Standard First:** Use Vanilla JS/Vite. Avoid heavy frameworks (React/Vue) unless complexity demands it.
3. **Accessibility:** Support MIDI input and keyboard shortcuts.
4. **Vibe:** Clean, educational, and encouraging.

## Tech Stack
- **Build Tool:** Vite
- **Language:** JavaScript (ESM)
- **Rendering:** HTML5 Canvas (Staff only); Piano uses HTML/CSS divs with absolute-positioned black keys
- **Audio:** Web Audio API
- **Deployment:** GitHub Pages