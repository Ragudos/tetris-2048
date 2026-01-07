import Logger from "@/lib/log/Logger";
import Point from "@/modules/tetris/common/Point";
import LinkedList from "@/modules/util/ds/LinkedList";
import Tetromino from "./Tetromino";
import {
  TETROMINO_NAMES,
  TETROMINO_SHAPES,
  type TetrominoNames,
} from "./constants";
/**
 *
 * use names to limit object creation,
 * as all a renderer needs is the name of the
 * tetromino. Then, for the active tetromino,
 * we can just change its type by name whenever
 * there's a change (e.g. swap).
 *
 */
export default class TetrominoBag {
  static MAX_QUEUE_VIEW = 4;

  private logger: Logger;
  private tetrominoNames: TetrominoNames[];
  /**
   * Next tetrominoes
   */
  private queueView: LinkedList<TetrominoNames>;
  private counter: number;

  private heldTetromino: TetrominoNames | undefined;
  private activeTetromino: Tetromino;

  private canSwap: boolean;
  private heldTetrominoDirty: boolean;
  private activeTetrominoDirty: boolean;
  private queueDirty: boolean;

  constructor() {
    this.logger = Logger.createLogger("TetrominoBag");
    this.tetrominoNames = [...TETROMINO_NAMES];
    this.counter = 0;
    this.queueView = new LinkedList();

    this.shuffle();

    for (let i = 0; i < TetrominoBag.MAX_QUEUE_VIEW; ++i) {
      this.queueView.append(this.getTetrominoName());
    }

    const name = this.consumeQueue();
    this.activeTetromino = new Tetromino(
      name,
      0,
      new Point(3, 0),
      TETROMINO_SHAPES[name].map((val) => [...val])
    );
    this.canSwap = true;
    this.heldTetrominoDirty = true;
    this.activeTetrominoDirty = true;
    this.queueDirty = true;
  }

  /**
   * Shuffles the tetromino bag using the Fisher Yates Algorithm
   *
   * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   */
  private shuffle(): void {
    this.logger.info("Shuffling...");

    for (let i = 0; i < this.tetrominoNames.length; ++i) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.tetrominoNames[i], this.tetrominoNames[j]] = [
        this.tetrominoNames[j],
        this.tetrominoNames[i],
      ];
    }
  }

  private getTetrominoName(): TetrominoNames {
    if (this.counter === this.tetrominoNames.length - 1) {
      this.counter = 0;
      this.shuffle();
    }

    this.queueDirty = true;

    return this.tetrominoNames[this.counter++];
  }

  resetDirty(): void {
    this.activeTetromino.resetDirty();

    this.activeTetrominoDirty = false;
    this.heldTetrominoDirty = false;
    this.queueDirty = false;
  }

  holdActive(): boolean {
    if (!this.canSwap) {
      return false;
    }

    let name: TetrominoNames;

    if (!this.heldTetromino) {
      name = this.consumeQueue();
    } else {
      name = this.heldTetromino;
    }

    this.heldTetromino = this.activeTetromino.getName();
    this.heldTetrominoDirty = true;
    this.canSwap = false;

    this.activeTetromino.changeType(name);

    return true;
  }

  consumeQueue(): TetrominoNames {
    this.queueView.append(this.getTetrominoName());

    if (!this.canSwap) {
      this.heldTetrominoDirty = true;
    }

    this.canSwap = true;

    // biome-ignore lint/style/noNonNullAssertion: This will never be null
    return this.queueView.shift()!;
  }

  getFirstInQueue(): TetrominoNames {
    // biome-ignore lint/style/noNonNullAssertion: This will never be null
    return this.queueView.getFirst()!;
  }

  getQueueView(): LinkedList<TetrominoNames> {
    return this.queueView.map((val) => val);
  }

  getActiveTetromino(): Tetromino {
    return this.activeTetromino;
  }

  getHeldTetrominoName(): TetrominoNames | undefined {
    return this.heldTetromino;
  }

  getCounter(): number {
    return this.counter;
  }

  getCanSwap(): boolean {
    return this.canSwap;
  }

  getHeldTetrominoDirty(): boolean {
    return this.heldTetrominoDirty;
  }

  /**
   *
   * @returns true if active tetromino changes
   * or its properties (e.g. position, shape) changes
   */
  getActiveTetrominoDirty(): boolean {
    return this.activeTetrominoDirty || this.activeTetromino.getDirty();
  }

  getQueueDirty(): boolean {
    return this.queueDirty;
  }
}
