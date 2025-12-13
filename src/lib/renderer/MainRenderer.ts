import Grid from "@/Grid";
import { Libraries } from "@/Libraries";
import { Container, Sprite } from "pixi.js";
import Config from "@config/Config";
import Game from "@/Game";
import Logger from "../log/Logger";
import { TetrominoNames } from "@/constants";
import Initializeable from "@/common/Initializeable";
import { getErrorMsg } from "../util/general";
import Tetromino from "@/tetromino/Tetromino";

export default class MainRenderer implements Initializeable {
  private logger: Logger;
  private pixiContainer: Container;
  private grid: Grid<Tetromino>;
  private game: Game;
  private spriteToNameWeakMap: WeakMap<
    Sprite,
    TetrominoNames | "ghost" | "background"
  >;
  private initialized: boolean;

  constructor(game: Game, grid: Grid<Tetromino>) {
    this.logger = Logger.createLogger("MainRenderer");
    this.pixiContainer = new (Libraries.getPIXI().Container)();
    this.grid = grid;
    this.game = game;
    this.spriteToNameWeakMap = new WeakMap();
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
    this.logger.info("Getting config");

    const screenConfig = Config.getInstance().getScreenConfig();
    const gameScreen = this.game.getApp().screen;
    const screenW = screenConfig.getWidth();
    const screenH = screenConfig.getHeight();
    const blockSize = screenConfig.getBlockSize();
    const scale = Math.min(
      gameScreen.width / screenW,
      gameScreen.height / screenH,
      1
    );

    this.logger.info("Setting scale");
    this.pixiContainer.scale.set(scale);
    this.logger.info("Setting position");
    this.pixiContainer.position.set(
      gameScreen.width / 2 - (screenW * scale) / 2,
      gameScreen.height / 2 - (screenH * scale) / 2
    );
    this.logger.groupCollapsed(
      "Initialize Cells",
      "Setting grid cells' sprites"
    );

    for (let i = 0; i < this.grid.getTotalCells(); ++i) {
      this.logger.info("Converting index to 2D coordinates");

      const point = this.grid.getCoordsFrom1D(i);
      const sprite = new (Libraries.getPIXI().Sprite)();
      sprite.width = blockSize;
      sprite.height = blockSize;
      sprite.tint = "#fff";

      this.logger.info("Setting cell position");
      sprite.position.set(point.getX() * blockSize, point.getY() * blockSize);
      this.logger.info("Adding cell sprite to weak map");
      this.spriteToNameWeakMap.set(sprite, "background");
      this.logger.info("Adding cell sprite to Pixi container");
      this.pixiContainer.addChild(sprite);
    }

    this.logger.groupEnd();

    this.initialized = true;

    this.logger.groupEnd();
  }

  destroy(): void {
    this.logger.info("Destroying MainRenderer");
    this.pixiContainer.destroy();

    this.initialized = false;
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
    this.logger.info("Updating grid");

    for (let i = 0; i < this.grid.getTotalCells(); ++i) {
      const block = this.grid.getValue()[i];

      this.updateByIndex(i, block?.getName() ?? null);
    }
  }

  updateTetromino(tetromino: Tetromino): void {
    this.logger.info("Updating tetromino");

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

    this.logger.info("Updating ghost tetromino");

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

  getPixiContainer(): typeof this.pixiContainer {
    return this.pixiContainer;
  }
}
