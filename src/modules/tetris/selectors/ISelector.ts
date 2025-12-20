import type GameState from "../GameState";

export default interface ISelector<T> {
  select(gameState: GameState): T;
}
