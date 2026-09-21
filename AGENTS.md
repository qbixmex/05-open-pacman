# AGENTS.md

Vanilla JS/HTML/CSS Pac-Man clone. No build tooling, dependencies, tests, lint, or CI — running anything from `package.json` will fail, and verification is manual in a browser.

## Run it

- Open `src/index.html` directly in a browser. Plain `<script>` tags, no server or bundler required.

## Architecture (do not "modernize")

- Scripts are classic (NOT ES modules) and share state via `window` globals. Load order in `src/index.html` is load-bearing:
  `maze.js` → `game.js` → `render.js` → `main.js`. Never add `import`/`export`, reorder tags, or rename exported globals without updating dependents.
- `maze.js` exposes `MAZE`, `TUNNEL_ROW`, `PACMAN_START`, `GHOST_STARTS`; `game.js` exposes `createGame`/`update`/`DIRS`; `render.js` exposes `draw`; `main.js` is the entrypoint (keyboard, overlay screens, `requestAnimationFrame` loop).
- Maze is a numeric grid: `0` empty, `1` wall, `2` dot, `3` pen door. `createGame()` copy of `MAZE` into `game.grid` per game; render reads `game.grid`, never `MAZE`, so eaten dots persist. Maze rows are symmetric about the vertical center.

## Conventions

- Code style (consistent across `src/js`): single quotes, semicolons, spaces inside parens `( x )`, 2-space indent.
- All comments and user-visible strings are English. Do not reintroduce Spanish text.

## Workflow

- This repo is a spec-driven development exercise. For new features use the pinned skills (`.agents/skills/spec`, `spec-impl`; hashes locked in `skills-lock.json`, symlinked from `.opencode/skills`). `spec-impl` creates a branch named after the spec.
- No tests exist; confirm behavior by playing the game with arrow keys in the browser.