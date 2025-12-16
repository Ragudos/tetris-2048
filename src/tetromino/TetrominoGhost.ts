import Logger from "@/lib/log/Logger";
import Tetromino from "./Tetromino";
import Grid from "@/Grid";
import Config from "@/lib/config/Config";
import { collidesBottom } from "@/lib/phys/collisions";

export default class TetrominoGhost {
  private logger: Logger;
  private tetromino: Tetromino | undefined;
  private positionY: number;

  constructor() {
    this.logger = Logger.createLogger("TetrominoGhost");
    this.positionY = 0;
  }

  setTetromino(ref: Tetromino): void {
    this.tetromino = ref;
  }

  update(grid: Grid<Tetromino>): void {
    if (!Config.getInstance().getGameplayConfig().getEnableGhost()) {
      this.logger.info("Ghost is disabled. Cancelling ghost update");

      return;
    }

    this.logger.info("Updating Ghost position.");

    if (!this.tetromino) {
      this.logger.warn("Tetromino is not yet assigned. Ghost cannot update.");

      return;
    }

    const tmpPos = this.tetromino.getTetrominoBody().getPosition().clone();
    const shape = this.tetromino.getTetrominoBody().getShape();

    while (!collidesBottom(grid, tmpPos, shape, 1)) {
      tmpPos.setY(tmpPos.getY() + 1);
    }

    this.positionY = tmpPos.getY();
  }

  getPositionY(): number {
    return this.positionY;
  }
}
