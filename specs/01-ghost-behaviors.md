# SPEC 01-ghost-behaviors — 4 Distinct Ghost AI

> **Status:** Approved
> **Depends on:** None (standalone spec)
> **Date:** 2026-09-21
> **Objective:** Implement 4 ghosts in the Pac-Man game, each with unique behavior and path-following strategy.

## Why this spec exists

The original game had 2 ghosts (Blinky and Pinky) with identical AI. To increase challenge and variety, we need 4 ghosts, each following Pac-Man from different paths. This improves gameplay depth and keeps players engaged.

## Scope

**In:**
- 4 ghost entities (blinky, pinky, inkey, clyde) with distinct AI strategies
- Updated ghost spawn positions and movement logic
- Ghost color scheme reflecting personality
- Collision handling and life loss tracking

**Out of scope:**
- Additional ghost types (e.g., frisky, raver) – kept within the 4-ghost constraint
- Level progression systems – handled separately
- Power pellets or other power-ups – unchanged

## Data model

```javascript
// Ghost kind constants
const KIND_BLINKY = 'blinky';    // Direct pursuit – chases Pac-Man's current position
const KIND_PINKY = 'pinky';      // Target 4 cells ahead – anticipatory pursuit
const KIND_INKEY = 'inkey';      // Chase Pac-Man AND Blinky – dual-target pursuit
const KIND_CLYDE = 'clyde';     // Roam when far, flee when close – evasive behavior

// Each ghost maintains its own kind throughout the game
```

## Implementation plan

1. **Update maze.js** – Define 4 distinct ghost start positions inside the pen area with unique `kind` values.
2. **Update game.js** – Replace the generic `decideGhost` function with kind-specific AI:
   - `blinky`: shortest-path to Pac-Man (Manhattan distance)
   - `pinky`: target 4 cells ahead of Pac-Man
   - `inkey`: combine Pac-Man and Blinky positions (dual-target)
   - `clyde`: flee when close (< 2 cells), otherwise wander toward Pac-Man
3. **Update render.js** – Assign distinct colors to each ghost kind for visual distinction.
4. **Verify** – Ensure all 4 ghosts move independently and collide correctly.

## Acceptance criteria

- [x] Step One: All 4 ghosts spawn in the pen area at distinct coordinates
- [x] Step Two: Each ghost has a unique AI behavior (see kinds above)
- [x] Step Three: Ghosts follow Pac-Man from different paths (not identical)
- [x] Step Four: Collision detection works (lives decrease when ghost catches Pac-Man)
- [x] Step Five: Game remains playable (no infinite loops, proper wrapping)
- [x] Step Six: Colors distinguish each ghost visually

## Decisions taken and discarded

| Decision | Reason |
|----------|---------|
| 4 distinct ghosts instead of 2 | Matches requirement for "4 ghosts, each with own behavior" |
| Unique start positions inside the pen | Avoids immediate clustering; gives each ghost a distinct identity |
| Dual-target for inkey (Pac-Man + Blinky) | Provides meaningful variation without adding complexity |
| Evasive flee for clyde | Creates dynamic tension – ghosts aren't predictable |
| Color-coded ghosts | Improves readability in the arcade UI |
| Pen-exit routine (while inside the pen, aim at the point above the door) | Pure Manhattan chase keeps ghosts oscillating inside the pen; routing them out lets all 4 reach the maze |

## Identified risks

- **Collision overlap**: If ghosts start too close, they may interfere early. Mitigated by spacing starts apart.
- **Performance**: 4 ghosts × 1 decision per frame is trivial for this engine.
- **AI balance**: Some ghosts (like clyde) may be too passive. Tuning flee threshold if needed.

## What is NOT in this spec

- Power pellets / extra lives
- Level progression / difficulty scaling
- Sound effects (handled separately)
- Multiplayer support

## Glossary

- **Ghost**: Enemy entity that chases Pac-Man
- **Kind**: Behavior category distinguishing ghost AI strategy
- **Tunnel row**: Row 14 of the maze (passage between left/right corridors)
