// game.js
// Game state and rules. Depends on globals from maze.js: MAZE, TUNNEL_ROW,
// PACMAN_START, GHOST_STARTS.

const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };

const PACMAN_SPEED = 0.125; // 1/8 cell/frame -> aligns every 8 frames
const GHOST_SPEED = 0.1;    // 1/10 cell/frame

// Create a new game. Copies MAZE (pristine) into game.grid so dots can be eaten
// without destroying the original, and so the game can be restarted.
function createGame() {
  const grid = MAZE.map( ( row ) => row.slice() );
  // Pacman's starting cell starts without a dot.
  grid[ PACMAN_START.y ][ PACMAN_START.x ] = 0;

  let dots = 0;
  for ( const row of grid ) for ( const v of row ) if ( v === 2 ) dots++;

  return {
    state: 'start',
    score: 0,
    lives: 3,
    dotsRemaining: dots,
    grid,
    pacman: {
      x: PACMAN_START.x,
      y: PACMAN_START.y,
      dir: 'left',
      nextDir: null,
      speed: PACMAN_SPEED,
    },
    ghosts: GHOST_STARTS.map( ( g ) => ( {
      x: g.x,
      y: g.y,
      dir: 'up',
      speed: GHOST_SPEED,
      kind: g.kind,
    } ) ),
  };
}

function aligned( v ) {
  return Math.abs( v - Math.round( v ) ) < 1e-3;
}

// Is a cell a wall for the given actor?
//   pacman: blocked by wall (1) and door (3)
//   ghost:  blocked only by wall (1)
function isWall( grid, x, y, actor ) {
  if ( y < 0 || y >= grid.length ) return true;
  if ( x < 0 || x >= grid[ 0 ].length ) return true;
  const v = grid[ y ][ x ];
  if ( v === 1 ) return true;
  if ( v === 3 && actor === 'pacman' ) return true;
  return false;
}

// Can the actor move forward from (x,y) in the dir direction?
function canMove( grid, x, y, dir, actor ) {
  const d = DIRS[ dir ];
  if ( !d ) return false;
  const tx = x + d.x;
  const ty = y + d.y;
  // Tunnel: leaving through an edge on the tunnel row is always valid.
  if ( ty === TUNNEL_ROW && ( tx < 0 || tx >= grid[ 0 ].length ) ) return true;
  return !isWall( grid, tx, ty, actor );
}

function wrapTunnel( a, width ) {
  if ( Math.round( a.y ) === TUNNEL_ROW ) {
    if ( a.x < 0 ) a.x += width;
    else if ( a.x >= width ) a.x -= width;
  }
}

function movePacman( game ) {
  const p = game.pacman;
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( p.x ) && aligned( p.y ) ) {
    p.x = Math.round( p.x );
    p.y = Math.round( p.y );

    // Apply pending turn if possible.
    if ( p.nextDir && canMove( grid, p.x, p.y, p.nextDir, 'pacman' ) ) {
      p.dir = p.nextDir;
      p.nextDir = null;
    }
    // Eat dot.
    if ( grid[ p.y ][ p.x ] === 2 ) {
      grid[ p.y ][ p.x ] = 0;
      game.score += 10;
      game.dotsRemaining--;
    }
    // If it can't keep moving, it stops on the cell.
    if ( !canMove( grid, p.x, p.y, p.dir, 'pacman' ) ) return;
  }

  const d = DIRS[ p.dir ];
  p.x += d.x * p.speed;
  p.y += d.y * p.speed;
  wrapTunnel( p, width );
}

// The point a ghost aims at, depending on its kind.
//   blinky: Pac-Man's current position (direct pursuit)
//   pinky:  4 cells ahead of Pac-Man (anticipatory pursuit)
//   inkey:  midpoint between Pac-Man and Blinky (dual-target pursuit)
//   clyde:  Pac-Man's position (only used when far; near Pac-Man it flees)
function ghostTarget( game, g ) {
  const p = game.pacman;
  const px = Math.round( p.x );
  const py = Math.round( p.y );

  if ( g.kind === 'blinky' ) return { x: px, y: py };

  if ( g.kind === 'pinky' ) {
    const d = DIRS[ p.dir ];
    return { x: px + d.x * 4, y: py + d.y * 4 };
  }

  if ( g.kind === 'inkey' ) {
    const blinky = game.ghosts.find( ( o ) => o.kind === 'blinky' );
    const bx = blinky ? Math.round( blinky.x ) : px;
    const by = blinky ? Math.round( blinky.y ) : py;
    return { x: ( px + bx ) / 2, y: ( py + by ) / 2 };
  }

  return { x: px, y: py };
}

// Direction among `choices` whose next cell is nearest to (tx, ty).
function nearestChoice( g, choices, tx, ty ) {
  let best = choices[ 0 ];
  let bestDist = Infinity;
  for ( const dir of choices ) {
    const d = DIRS[ dir ];
    const dist = Math.abs( g.x + d.x - tx ) + Math.abs( g.y + d.y - ty );
    if ( dist < bestDist ) {
      bestDist = dist;
      best = dir;
    }
  }
  return best;
}

// Direction among `choices` whose next cell is farthest from Pac-Man.
function farthestChoice( g, choices, px, py ) {
  let best = choices[ 0 ];
  let bestDist = -Infinity;
  for ( const dir of choices ) {
    const d = DIRS[ dir ];
    const dist = Math.abs( g.x + d.x - px ) + Math.abs( g.y + d.y - py );
    if ( dist > bestDist ) {
      bestDist = dist;
      best = dir;
    }
  }
  return best;
}

// Is the ghost still inside the pen (interior cells or the door row)?
// The test must exclude the tunnel row (row 14) segments outside the pen,
// so it checks a box (rows 12-15, cols 11-16) rather than just the y value.
function ghostInPen( g ) {
  const x = Math.round( g.x );
  const y = Math.round( g.y );
  if ( y === 12 ) return x === 13 || x === 14; // door cells
  return y >= 13 && y <= 15 && x >= 11 && x <= 16;
}

function decideGhost( game, g ) {
  const grid = game.grid;
  const p = game.pacman;

  const options = Object.keys( DIRS ).filter(
    ( dir ) => dir !== OPPOSITE[ g.dir ] && canMove( grid, g.x, g.y, dir, 'ghost' )
  );
  // Dead end: allow the 180-degree turn.
  const choices = options.length ? options : [ '' + OPPOSITE[ g.dir ] ];

  // Avoid overlapping another ghost: prefer moves that don't land on a cell
  // another ghost currently occupies, as long as such a move exists.
  const free = choices.filter( ( dir ) => {
    const d = DIRS[ dir ];
    const nx = g.x + d.x;
    const ny = g.y + d.y;
    return !game.ghosts.some(
      ( o ) =>
        o !== g &&
        Math.round( o.x ) === Math.round( nx ) &&
        Math.round( o.y ) === Math.round( ny )
    );
  } );
  const moves = free.length ? free : choices;

  // While inside the pen, head for the point just above the door so the ghost
  // gets out into the maze; the kind-specific AI only applies once outside.
  // Without this, Manhattan chase keeps ghosts oscillating inside the pen,
  // because "down" is always a cell closer to Pac-Man than "up" is.
  if ( ghostInPen( g ) ) {
    g.dir = nearestChoice( g, moves, 13.5, 11 );
    return;
  }

  const px = Math.round( p.x );
  const py = Math.round( p.y );

  // clyde flees when close (< 2 cells), otherwise wanders toward Pac-Man.
  if ( g.kind === 'clyde' ) {
    if ( Math.abs( g.x - px ) + Math.abs( g.y - py ) < 2 ) {
      g.dir = farthestChoice( g, moves, px, py );
    } else {
      // Wander: half the time chase, half the time pick a random move.
      if ( Math.random() < 0.5 ) g.dir = nearestChoice( g, moves, px, py );
      else g.dir = moves[ Math.floor( Math.random() * moves.length ) ];
    }
    return;
  }

  const t = ghostTarget( game, g );
  g.dir = nearestChoice( g, moves, t.x, t.y );
}

function moveGhost( game, g ) {
  const grid = game.grid;
  const width = grid[ 0 ].length;

  if ( aligned( g.x ) && aligned( g.y ) ) {
    g.x = Math.round( g.x );
    g.y = Math.round( g.y );
    decideGhost( game, g );
    if ( !canMove( grid, g.x, g.y, g.dir, 'ghost' ) ) return;
  }

  const d = DIRS[ g.dir ];
  g.x += d.x * g.speed;
  g.y += d.y * g.speed;
  wrapTunnel( g, width );
}

function resetPositions( game ) {
  const p = game.pacman;
  p.x = PACMAN_START.x;
  p.y = PACMAN_START.y;
  p.dir = 'left';
  p.nextDir = null;
  game.ghosts.forEach( ( g, i ) => {
    g.x = GHOST_STARTS[ i ].x;
    g.y = GHOST_STARTS[ i ].y;
    g.dir = 'up';
  } );
}

function collides( a, b ) {
  return Math.abs( a.x - b.x ) < 0.5 && Math.abs( a.y - b.y ) < 0.5;
}

function update( game ) {
  movePacman( game );
  game.ghosts.forEach( ( g ) => moveGhost( game, g ) );

  for ( const g of game.ghosts ) {
    if ( collides( game.pacman, g ) ) {
      game.lives--;
      if ( game.lives <= 0 ) {
        game.state = 'lost';
        return;
      }
      resetPositions( game );
      break;
    }
  }

  if ( game.dotsRemaining <= 0 ) game.state = 'won';
}

window.createGame = createGame;
window.update = update;
window.DIRS = DIRS;
