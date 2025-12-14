import Grid from "@/Grid";
import { Libraries } from "@/Libraries";
import { Application, Container, Renderer, Sprite, Ticker } from "pixi.js";
import Config from "@config/Config";
import Logger from "../log/Logger";
import { TetrominoNames } from "@/constants";
import Initializeable from "@/common/Initializeable";
import { getErrorMsg, getTimeEaseOut } from "../util/general";
import Tetromino from "@/tetromino/Tetromino";
import { debounce } from "../util/debounce";

export default class MainRenderer implements Initializeable {
  private logger: Logger;
  private pixiContainer: Container;
  private grid: Grid<Tetromino>;
  private app: Application<Renderer>;
  private spriteToNameWeakMap: WeakMap<
    Sprite,
    TetrominoNames | "ghost" | "background"
  >;
  private timeSinceLastFlicker: number;
  private initialized: boolean;

  constructor(app: Application<Renderer>, grid: Grid<Tetromino>) {
    this.logger = Logger.createLogger("MainRenderer");
    this.pixiContainer = new (Libraries.getPIXI().Container)();
    this.grid = grid;
    this.app = app;
    this.spriteToNameWeakMap = new WeakMap();
    this.timeSinceLastFlicker = 0;
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn("Trying to initialize despite being initialized.");

      return;
    }

    this.logger.groupCollapsed(
      "Initialize MainRenderer",
      "Initializing the main renderer"
    );
    this.setSize(this.app.screen.width, this.app.screen.height);
    this.logger.groupCollapsed(
      "Initialize Cells",
      "Setting grid cells' sprites"
    );

    this.logger.info("Getting config");

    const screenConfig = Config.getInstance().getScreenConfig();
    const blockSize = screenConfig.getBlockSize();

    for (let i = 0; i < this.grid.getTotalCells(); ++i) {
      this.logger.info("Converting index to 2D coordinates");

      const point = this.grid.getCoordsFrom1D(i);
      const sprite = new (Libraries.getPIXI().Sprite)();
      sprite.width = blockSize;
      sprite.height = blockSize;
      sprite.tint = "rgb(150,150,150)";

      this.logger.info("Setting cell position");
      sprite.position.set(point.getX() * blockSize, point.getY() * blockSize);
      this.logger.info("Adding cell sprite to weak map");
      this.spriteToNameWeakMap.set(sprite, "background");
      this.logger.info("Adding cell sprite to Pixi container");
      this.pixiContainer.addChild(sprite);
    }

    this.logger.groupEnd();
    this.app.renderer.on("resize", debounce(this.setSize.bind(this), 1000));

    this.initialized = true;

    this.logger.groupEnd();
  }

  destroy(): void {
    this.logger.info("Destroying MainRenderer");
    this.pixiContainer.destroy();

    this.initialized = false;
  }

  setSize(sw: number, sh: number): void {
    this.logger.groupCollapsed("Resize", "Resizing Main Renderer");
    this.logger.info("Getting config");

    const screenConfig = Config.getInstance().getScreenConfig();
    const screenW = screenConfig.getWidth();
    const screenH = screenConfig.getHeight();
    const scale = Math.min(sw / screenW, sh / screenH);

    this.logger.info("Scale calculated:" + scale);

    this.logger.info("Setting scale");
    this.pixiContainer.scale.set(scale);
    this.logger.info("Setting position");
    this.pixiContainer.position.set(
      (sw - screenW * scale) / 2,
      (sh - screenH * scale) / 2
    );
    this.logger.groupEnd();
  }

  /**
   * Update a cell's sprite via sprite name
   * in coords
   *
   * @param row
   * @param column
   * @param name
   * @returns
   */
  private updateByCoords(
    row: number,
    column: number,
    name: TetrominoNames | "ghost" | null
  ): void {
    if (row < 0 || column < 0) {
      return;
    }

    this.updateByIndex(this.grid.get1DIndexFromCoords(column, row), name);
  }

  private updateByIndex(
    index: number,
    name: TetrominoNames | "ghost" | null
  ): void {
    try {
      const sprite = this.pixiContainer.getChildAt(index);

      if (sprite instanceof Sprite) {
        const spriteName = this.spriteToNameWeakMap.get(sprite);

        if (
          (spriteName === "background" || spriteName === "ghost") &&
          name !== null
        ) {
          sprite.texture = Libraries.getPIXI().Cache.get(
            `${Config.getInstance()
              .getGameplayConfig()
              .getSpriteType()}_${name.toLowerCase()}`
          );
        } else {
          this.spriteToNameWeakMap.set(sprite, "background");

          sprite.texture = Libraries.getPIXI().Cache.get("background");
        }
      } else {
        this.logger.warn("A non-Sprite child is in Pixi container");
      }
    } catch (err) {
      this.logger.error(getErrorMsg(err));
    }
  }

  updateGrid(): void {
    for (let i = 0; i < this.grid.getTotalCells(); ++i) {
      const block = this.grid.getValue()[i];

      this.updateByIndex(i, block?.getName() ?? null);
    }
  }

  updateTetromino(tetromino: Tetromino): void {
    const shape = tetromino.getTetrominoBody().getShape();
    const position = tetromino.getTetrominoBody().getPosition();
    const posX = position.getX();
    const posY = position.getY();
    const name = tetromino.getName();

    for (let y = 0; y < shape.length; ++y) {
      const row = shape[y];

      for (let x = 0; x < row.length; ++x) {
        if (row[x]) {
          this.updateByCoords(posY + y, posX + x, name);
        }
      }
    }
  }

  updateGhost(ghostY: number, tetromino: Tetromino): void {
    if (!Config.getInstance().getGameplayConfig().getEnableGhost()) {
      return;
    }

    const shape = tetromino.getTetrominoBody().getShape();
    const position = tetromino.getTetrominoBody().getPosition();
    const posX = position.getX();

    for (let y = 0; y < shape.length; ++y) {
      const row = shape[y];

      for (let x = 0; x < row.length; ++x) {
        if (row[x]) {
          this.updateByCoords(ghostY + y, posX + x, "ghost");
        }
      }
    }
  }

  resetFlicker(tetromino: Tetromino): void {
    this.timeSinceLastFlicker = 0;

    this.changeAlpha(tetromino, 1);
  }

  flickerBlock(ticker: Ticker, tetromino: Tetromino) {
    this.timeSinceLastFlicker += ticker.deltaTime;

    // Since we want this to fade out, we subtract the fraction to one
    // If we don't, the initial value will be 0, and it will fade in
    // The fraction was acquired from
    /** @see https://javascript.info/js-animation */
    const fraction =
      1 -
      (ticker.deltaTime - this.timeSinceLastFlicker) /
        (Config.getInstance().getGameplayConfig().getLockDelayDt() * 2);
    const newAlpha = getTimeEaseOut(fraction);

    this.changeAlpha(tetromino, newAlpha);
  }

  private changeAlpha(tetromino: Tetromino, alpha: number): void {
    const position = tetromino.getTetrominoBody().getPosition();
    const shape = tetromino.getTetrominoBody().getShape();

    for (let y = 0; y < shape.length; ++y) {
      const row = shape[y];

      for (let x = 0; x < row.length; ++x) {
        if (row[x]) {
          const sprite = this.pixiContainer.getChildAt(
            this.grid.get1DIndexFromCoords(
              position.getX() + x,
              position.getY() + y
            )
          );

          sprite.alpha = alpha;
        }
      }
    }
  }

  getPixiContainer(): typeof this.pixiContainer {
    return this.pixiContainer;
  }
}
