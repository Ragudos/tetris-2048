import { TetrominoNames } from "../constants";
import type GameState from "../GameState";
import { collidesBottom } from "../physics/collisions";
import PlayfieldState from "../PlayfieldState";
import type ISelector from "./ISelector";

export default class PlayfieldStateSelector
  implements ISelector<PlayfieldState>
{
  private cachedGhostY: number = 0;
  private cachedX: number = 0;
  private cachedName: TetrominoNames | undefined;
  private cachedRotation: number = 0;

  select(gameState: GameState): PlayfieldState {
    const activeDirty = gameState.getActiveTetrominoDirty();

    if (activeDirty) {
      const active = gameState.getActiveTetromino();
      const pos = active.getPosition();

      if (
        this.cachedName !== active.getName() ||
        active.getCurrentRotation() !== this.cachedRotation ||
        pos.getX() !== this.cachedX
      ) {
        this.cachedX = pos.getX();
        this.cachedRotation = active.getCurrentRotation();
        this.cachedGhostY = 0;

        while (
          !collidesBottom(gameState.getGrid(), pos, active.getShape(), 1)
        ) {
          pos.setY(pos.getY() + 1);
        }

        this.cachedGhostY = pos.getY();
      }
    }

    const state = new PlayfieldState(
      false,
      gameState.getLockedDirty(),
      activeDirty,
      activeDirty,
      false,
      gameState.getActiveTetromino(),
      this.cachedGhostY,
      gameState.getGrid().getValue(),
      gameState.getLocking()
    );

    return state;
  }
}
