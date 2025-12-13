import Config from "@/lib/config/Config";
import Tetromino from "./Tetromino";
import Logger from "@/lib/log/Logger";
import Grid from "@/Grid";
import { collidesBottom } from "@/lib/phys/collisions";

export default class GhostTetromino {
  private logger: Logger;
  private positionY: number;

  constructor() {
    this.logger = Logger.createLogger("GhostTetromino");
    this.positionY = 0;
  }

  update(grid: Grid<unknown>, refTetromino: Tetromino): void {
    if (!Config.getInstance().getGameplayConfig().getEnableGhost()) {
      this.logger.info("Ghost is disabled. Cancelling ghost update");

      return;
    }

    this.logger.info("Updating Ghost y position.");

    const tmp = refTetromino.getTetrominoBody().getPosition().clone();

    while (
      !collidesBottom(grid, tmp, refTetromino.getTetrominoBody().getShape(), 1)
    ) {
      tmp.setY(tmp.getY() + 1);
    }

    this.positionY = tmp.getY();
  }

  getPositionY(): number {
    return this.positionY;
  }
}
