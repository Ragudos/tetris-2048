export const TETROMINO_COLORS = Object.freeze({
  I: "00ffff",
  L: "0000ff",
  J: "ffa500",
  O: "ffff00",
  S: "00ff00",
  T: "800080",
  Z: "ff0000",
} as const);

export const SPRITE_TYPES = Object.freeze(["shiny", "blocky"] as const);

export const TETROMINO_NAMES = Object.freeze([
  "I",
  "J",
  "L",
  "O",
  "S",
  "T",
  "Z",
] as const);

export const KICK_DATA = Object.freeze({
  SRS: {},
  NONE: {},
} as const);

export const ROTATION = Object.freeze({
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1,
} as const);

export const TETROMINO_DEFAULT_ROTATIONS: {
  [Property in KickDataKey]: {
    [Property in TetrominoNames]: number[][];
  };
} = Object.freeze({
  SRS: {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    L: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    J: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  NONE: {
    I: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    L: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    J: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    O: [
      [1, 1],
      [1, 1],
    ],
    S: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    T: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    Z: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
} as const);

/**
 * SRS KICK DATA
 * @description
 * How far the game will kick/move the tetromino when it collides with a wall or the stack.
 * @see https://tetris.wiki/Super_Rotation_System
 *
 * legend:
 *
 * - 0: Spawn state (initial state)
 * - R = Right or clockwise rotation
 * - L = Left or counterclockwise rotation
 * - 2 = 180° rotation or two successive 90° rotations
 */
export const SRS_KICK_DATA = Object.freeze([
  // JLSZT
  [
    [0, 0],
    [-1, 0],
    [-1, +1],
    [0, -2],
    [-1, -2],
  ], // 0 -> R, idx 0;
  [
    [0, 0],
    [+1, 0],
    [+1, -1],
    [0, +2],
    [+1, +2],
  ], // R -> 0, idx 1;
  [
    [0, 0],
    [+1, 0],
    [+1, -1],
    [0, +2],
    [+1, +2],
  ], // R -> 2, idx 2;
  [
    [0, 0],
    [-1, 0],
    [-1, +1],
    [0, -2],
    [-1, -2],
  ], // 2 -> R, idx 3;
  // Reverse rotation
  [
    [0, 0],
    [+1, 0],
    [+1, +1],
    [0, -2],
    [+1, -2],
  ], // 2 -> L, idx 4;
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, +2],
    [-1, +2],
  ], // L -> 2, idx 5;
  [
    [0, 0],
    [-1, 0],
    [-1, -1],
    [0, +2],
    [-1, +2],
  ], // L -> 0, idx 6;
  [
    [0, 0],
    [+1, 0],
    [+1, +1],
    [0, -2],
    [+1, -2],
  ], // 0 -> L, idx 7;
  // I
  [
    [0, 0],
    [-2, 0],
    [+1, 0],
    [+1, +2],
    [-2, -1],
  ], // 0 -> R, idx 0;
  [
    [0, 0],
    [+2, 0],
    [-1, 0],
    [+2, +1],
    [-1, -2],
  ], // R -> 0, idx 1;
  [
    [0, 0],
    [-1, 0],
    [+2, 0],
    [-1, +2],
    [+2, -1],
  ], // R -> 2, idx 2;
  [
    [0, 0],
    [-2, 0],
    [+1, 0],
    [-2, +1],
    [+1, -1],
  ], // 2 -> R, idx 3;

  // Reverse rotation
  [
    [0, 0],
    [+2, 0],
    [-1, 0],
    [+2, +1],
    [-1, -1],
  ], // 2 -> L, idx 4;
  [
    [0, 0],
    [+1, 0],
    [-2, 0],
    [+1, +2],
    [-2, -1],
  ], // L -> 2, idx 5;
  [
    [0, 0],
    [-2, 0],
    [+1, 0],
    [-2, +1],
    [+1, -2],
  ], // L -> 0, idx 6;
  [
    [0, 0],
    [+2, 0],
    [-1, 0],
    [-1, +2],
    [+2, -1],
  ], // 0 -> L, idx 7;
] as const);

/**
 * 4 angles (0, 90, 180, 270)
 */
export const MAX_TETROMINO_ROTATIONS = 4;

export const GRAVITY_ROWS_PER_FRAME_BY_LEVEL = Object.freeze([
  1 / 48,
  1 / 43,
  1 / 38,
  1 / 33,
  1 / 28,
  1 / 23,
  1 / 18,
  1 / 13,
  1 / 8,
  1 / 6,
] as const);

export const GRAVITY = Object.freeze([
  "SUBZERO",
  "RELAXED",
  "NORMAL",
  "ENGAGING",
  "SPICY",
  "STATIC",
] as const);

export const GRAVITY_PER_MODE: Record<(typeof GRAVITY)[number], GravityConfig> =
  {
    SUBZERO: { type: "none" },
    RELAXED: { type: "scaled", multiplier: 0.5 },
    NORMAL: { type: "scaled", multiplier: 1 },
    ENGAGING: { type: "scaled", multiplier: 1.5 },
    SPICY: { type: "scaled", multiplier: 2 },
    STATIC: { type: "instant" },
  };

export type GravityConfig =
  | { type: "none" }
  | { type: "scaled"; multiplier: number }
  | { type: "instant" };
export type Rotation = (typeof ROTATION)[keyof typeof ROTATION];
export type SpriteType = (typeof SPRITE_TYPES)[number];
export type TetrominoNames = (typeof TETROMINO_NAMES)[number];
export type KickDataKey = keyof typeof KICK_DATA;
export type KickData = (typeof KICK_DATA)[KickDataKey];
