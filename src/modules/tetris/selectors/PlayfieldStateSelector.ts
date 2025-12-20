import type GameState from "../GameState";
import PlayfieldState from "../PlayfieldState";
import type ISelector from "./ISelector";

export default class PlayfieldStateSelector implements ISelector<PlayfieldState> {
  select(gameState: GameState): PlayfieldState {
    const state = new PlayfieldState(
      false,
      gameState.getLockedDirty(),
      gameState.getActiveTetrominoDirty(),
      gameState.getGhostTetrominoDirty(),
      false,
      gameState.getActiveTetromino(),
      gameState.getGhostTetrominoData(),
      gameState.getGrid(),
      gameState.getLocking(),
    );

    return state;
  }
}
