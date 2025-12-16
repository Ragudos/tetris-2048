export const ControlAction = Object.freeze({
  MOVE_LEFT: "move_left",
  MOVE_RIGHT: "move_right",
  SOFT_DROP: "soft_drop",
  HARD_DROP: "hard_drop",
  ROTATE_CW: "rotate_cw",
  ROTATE_CCW: "rotate_ccw",
  HOLD: "hold", // ← Shift
} as const);

export type ControlAction = (typeof ControlAction)[keyof typeof ControlAction];
