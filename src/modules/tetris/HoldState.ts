import type { TetrominoNames } from "@/constants";

export default class HoldState {
  constructor(
    readonly heldDirty: boolean,
    readonly canSwap: boolean,
    readonly heldTetrominoName: TetrominoNames | undefined,
  ) {}
}
