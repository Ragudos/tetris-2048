import Grid from "@/Grid";
import Tetromino from "./Tetromino";
import TetrominoBag from "./TetrominoBag";

export default class TetrominoHandler {
  private grid: Grid<Tetromino>;
  private tetrominoBag: TetrominoBag;

  constructor(grid: Grid<Tetromino>, tetrominoBag: TetrominoBag) {
    this.grid = grid;
    this.tetrominoBag = tetrominoBag;
  }
}
