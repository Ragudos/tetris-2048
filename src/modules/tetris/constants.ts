export const WALL_KICKS = {
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
  SRS: {
    I: [
      [
        [0, 0],
        [-2, 0],
        [1, 0],
        [1, 2],
        [-2, -1],
      ], // 0 -> R, idx 0;
      [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -2],
      ], // R -> 0, idx 1;
      [
        [0, 0],
        [-1, 0],
        [2, 0],
        [-1, 2],
        [2, -1],
      ], // R -> 2, idx 2;
      [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, 1],
        [1, -1],
      ], // 2 -> R, idx 3;

      // Reverse rotation
      [
        [0, 0],
        [2, 0],
        [-1, 0],
        [2, 1],
        [-1, -1],
      ], // 2 -> L, idx 4;
      [
        [0, 0],
        [1, 0],
        [-2, 0],
        [1, 2],
        [-2, -1],
      ], // L -> 2, idx 5;
      [
        [0, 0],
        [-2, 0],
        [1, 0],
        [-2, 1],
        [1, -2],
      ], // L -> 0, idx 6;
      [
        [0, 0],
        [2, 0],
        [-1, 0],
        [-1, 2],
        [2, -1],
      ], // 0 -> L, idx 7;
    ],
    JLSZT: [
      [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ], // 0 -> R, idx 0;
      [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ], // R -> 0, idx 1;
      [
        [0, 0],
        [1, 0],
        [1, -1],
        [0, 2],
        [1, 2],
      ], // R -> 2, idx 2;
      [
        [0, 0],
        [-1, 0],
        [-1, 1],
        [0, -2],
        [-1, -2],
      ], // 2 -> R, idx 3;
      // Reverse rotation
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ], // 2 -> L, idx 4;
      [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ], // L -> 2, idx 5;
      [
        [0, 0],
        [-1, 0],
        [-1, -1],
        [0, 2],
        [-1, 2],
      ], // L -> 0, idx 6;
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, -2],
        [1, -2],
      ], // 0 -> L, idx 7;
    ],
  },
};
export const SPRITE_NAMES = Object.freeze({
  background: "background",
  shiny: Object.freeze({
    I: "shiny_i",
    J: "shiny_j",
    L: "shiny_l",
    O: "shiny_o",
    S: "shiny_s",
    T: "shiny_t",
    Z: "shiny_z",
    GHOST: "shiny_ghost",
  }),

  blocky: Object.freeze({
    I: "blocky_i",
    J: "blocky_j",
    L: "blocky_l",
    O: "blocky_o",
    S: "blocky_s",
    T: "blocky_t",
    Z: "blocky_z",
    GHOST: "blocky_ghost",
  }),
} as const);
export const ROTATION = Object.freeze({
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1,
} as const);
export const GRAVITY_PER_MODE: Record<(typeof GRAVITY.TYPES)[number], GravityConfig> =
  Object.freeze({
    subzero: { type: "none" },
    relaxed: { type: "scaled", multiplier: 0.5 },
    normal: { type: "scaled", multiplier: 1 },
    engaging: { type: "scaled", multiplier: 1.5 },
    spicy: { type: "scaled", multiplier: 2 },
    static: { type: "instant" },
  } as const);
export const SPRITE_TYPES = Object.freeze(["shiny", "blocky"] as const);
export const GRAVITY = Object.freeze({
  TYPES: ["subzero", "relaxed", "normal", "engaging", "spicy", "static"],
  SOFT_DROP_MULTIPLIER: 20,
  ROWS_PER_FRAME: [
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
    1 / 5,
    1 / 5,
    1 / 5,
    1 / 4,
    1 / 4,
    1 / 4,
    1 / 3,
    1 / 3,
    1 / 3,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1 / 2,
    1,
  ],
} as const);
export const TETROMINO_NAMES = Object.freeze(["I", "J", "L", "O", "S", "T", "Z"] as const);
export const TETROMINO_SHAPES = Object.freeze({
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
} as const);
export const MAX_TETROMINO_ROTATIONS = 4;

export type GravityConfig =
  | { type: "none" }
  | { type: "scaled"; multiplier: number }
  | { type: "instant" };
export type Rotation = (typeof ROTATION)[keyof typeof ROTATION];
export type SpriteType = (typeof SPRITE_TYPES)[number];
export type TetrominoNames = (typeof TETROMINO_NAMES)[number];
export type WallKick = (typeof WALL_KICKS)[keyof typeof WALL_KICKS];
