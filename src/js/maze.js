// maze.js
// 28x31 maze faithful to the geometry of Pac-Man level 1.
// Written as 31 strings of 28 chars (readable) and parsed into numbers.
//   '#' wall(1) · '.' dot(2) · ' ' walkable empty(0) · '-' pen door(3)
// Coordinates: cell (x,y), origin top-left. x in [0,27], y in [0,30].
// Symmetric about the central vertical axis (between cols 13 and 14).

const MAZE_STR = [
  '############################', // 0  border
  '#............##............#', // 1
  '#.####.#####.##.#####.####.#', // 2
  '#.####.#####.##.#####.####.#', // 3
  '#.####.#####.##.#####.####.#', // 4
  '#..........................#', // 5
  '#.####.##.########.##.####.#', // 6
  '#.####.##.########.##.####.#', // 7
  '#......##....##....##......#', // 8
  '######.#####.##.#####.######', // 9
  '######.#####.##.#####.######', // 10
  '######.##..........##.######', // 11
  '######.##.###--###.##.######', // 12  pen door cols 13-14
  '######.##.#      #.##.######', // 13  pen interior
  '          #      #          ', // 14  tunnel (open ends) + pen
  '######.##.#      #.##.######', // 15  pen interior
  '######.##.########.##.######', // 16  pen bottom
  '######.##..........##.######', // 17
  '######.#####.##.#####.######', // 18
  '######.#####.##.#####.######', // 19
  '#............##............#', // 20
  '#.####.#####.##.#####.####.#', // 21
  '#.####.#####.##.#####.####.#', // 22
  '#...##................##...#', // 23  Pacman start row (13,23)
  '###.##.##.########.##.##.###', // 24
  '###.##.##.########.##.##.###', // 25
  '#......##....##....##......#', // 26
  '#.##########.##.##########.#', // 27
  '#.##########.##.##########.#', // 28
  '#..........................#', // 29
  '############################', // 30  border
];

function parseTile( ch ) {
  if ( ch === '#' ) return 1;
  if ( ch === '.' ) return 2;
  if ( ch === '-' ) return 3;
  return 0; // space = walkable empty
}

// Pristine numeric matrix (not mutated; each game copies it).
const MAZE = MAZE_STR.map( ( row ) => row.split( '' ).map( parseTile ) );

const TUNNEL_ROW = 14;
const PACMAN_START = { x: 13, y: 23 };
const GHOST_STARTS = [
  { x: 13, y: 14, kind: 'blinky' },
  { x: 14, y: 14, kind: 'pinky' },
  { x: 13, y: 15, kind: 'inkey' },
  { x: 14, y: 15, kind: 'clyde' },
];

window.MAZE = MAZE;
window.TUNNEL_ROW = TUNNEL_ROW;
window.PACMAN_START = PACMAN_START;
window.GHOST_STARTS = GHOST_STARTS;
