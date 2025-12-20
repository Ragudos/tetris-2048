import type GameState from "../GameState";
import HoldState from "../HoldState";
import type ISelector from "./ISelector";

export default class HoldStateSelector implements ISelector<HoldState> {
  select(gameState: GameState): HoldState {
    return new HoldState(
      gameState.getHeldTetrominoNameDirty(),
      gameState.getCanSwap(),
      gameState.getHeldTetrominoName(),
    );
  }
}
