import type { TetrominoNames } from "@/constants";
import type Tetromino from "./Tetromino";

export default class PlayfieldState {
  constructor(
    readonly backgroundDirty: boolean,
    readonly lockedDirty: boolean,
    readonly activeDirty: boolean,
    readonly ghostDirty: boolean,
    readonly overflowDirty: boolean,
    readonly activeTetromino: Tetromino | undefined,
    readonly ghostPositions: { y: number; x: number; shape: number[][] },
    readonly grid: (TetrominoNames | undefined)[],
    readonly locking: boolean,
  ) {}
}
