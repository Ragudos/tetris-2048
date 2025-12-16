import Point from "@/common/Point";
import Tetromino from "./Tetromino";
import { TETROMINO_COLORS } from "@/constants";
import Initializeable from "@/common/Initializeable";
import Grid from "@/Grid";
import Logger from "@/lib/log/Logger";

export default class TetrominoBag implements Initializeable {
  private logger: Logger;
  private tetrominoes: Tetromino[];
  private counter: number = 0;

  private previousTetromino: Tetromino | undefined;
  private currentTetromino: Tetromino | undefined;
  private nextTetromino: Tetromino | undefined;
  private heldTetromino: Tetromino | undefined;

  constructor() {
    this.logger = Logger.createLogger("TetrominoBag");
    this.tetrominoes = [
      Tetromino.createTetromino("I", new Point(0, 0), TETROMINO_COLORS.I),
      Tetromino.createTetromino("J", new Point(0, 0), TETROMINO_COLORS.J),
      Tetromino.createTetromino("L", new Point(0, 0), TETROMINO_COLORS.L),
      Tetromino.createTetromino("O", new Point(0, 0), TETROMINO_COLORS.O),
      Tetromino.createTetromino("S", new Point(0, 0), TETROMINO_COLORS.S),
      Tetromino.createTetromino("T", new Point(0, 0), TETROMINO_COLORS.T),
      Tetromino.createTetromino("Z", new Point(0, 0), TETROMINO_COLORS.Z),
    ];
  }

  async initialize(): Promise<void> {
    this.shuffle();
  }

  /**
   * Shuffles the tetromino bag using the Fisher Yates Algorithm
   *
   * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   */
  private shuffle(): void {
    this.logger.info("Shuffling...");

    for (let i = 0; i < this.tetrominoes.length; ++i) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.tetrominoes[i], this.tetrominoes[j]] = [this.tetrominoes[j], this.tetrominoes[i]];
    }
  }

  makeNextTetrominoCurrent(): void {
    this.logger.info("Making next tetromino the current one");

    this.previousTetromino = this.currentTetromino;
    this.currentTetromino = this.getNextTetromino();
    this.nextTetromino = this.getTetromino();
  }

  swap(): void {
    this.logger.info("Swapping held and current tetromino.");

    if (!this.heldTetromino) {
      this.heldTetromino = this.currentTetromino = this.nextTetromino = this.getTetromino();
    } else {
      const tmp = this.heldTetromino;

      this.heldTetromino = this.currentTetromino;
      this.currentTetromino = tmp;
    }

    const currPos = this.currentTetromino.getTetrominoBody().getPosition();
    const heldPos = this.currentTetromino.getTetrominoBody().getPosition();

    this.currentTetromino.getTetrominoBody().resetRotation();
    this.heldTetromino!.getTetrominoBody().resetRotation();
    currPos.setX(0);
    currPos.setY(0);
    heldPos.setX(0);
    heldPos.setY(0);
  }

  getHeldTetromino(): Tetromino | undefined {
    return this.heldTetromino;
  }

  getCurrentTetronimo(): Tetromino {
    if (this.currentTetromino === undefined) {
      this.currentTetromino = this.getTetromino();
    }

    return this.currentTetromino;
  }

  getNextTetromino(): Tetromino {
    if (this.nextTetromino === undefined) {
      this.nextTetromino = this.getTetromino();
    }

    return this.nextTetromino;
  }

  getPreviousTetromino(): Tetromino | undefined {
    return this.previousTetromino;
  }

  private getTetromino(): Tetromino {
    if (this.counter === this.tetrominoes.length - 1) {
      this.counter = 1;
      this.shuffle();

      return this.tetrominoes[0].clone();
    }

    this.counter += 1;

    return this.tetrominoes[this.counter].clone();
  }

  getCounter(): number {
    return this.counter;
  }
}
