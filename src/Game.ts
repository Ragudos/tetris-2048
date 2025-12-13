import type { Application, Ticker } from "pixi.js";
import { generateRandomId } from "./lib/util/string";
import { Libraries } from "./Libraries";
import TetrisContainer from "./TetrisContainer";
import Logger from "./lib/log/Logger";
import MainRenderer from "./lib/renderer/MainRenderer";
import Grid from "./Grid";
import Config from "./lib/config/Config";
import Initializeable from "./common/Initializeable";
import TetrominoBag from "./tetromino/TetrominoBag";
import Tetromino from "./tetromino/Tetromino";
import GhostTetromino from "./tetromino/GhostTetromino";

/**
 * A Tetris Game.
 *
 * Not a singleton for potential multiplayer
 */
export default class Game implements Initializeable {
  private id: string;
  private logger: Logger;
  private app: Application;
  private grid: Grid<Tetromino>;
  private mainRenderer: MainRenderer;
  private tetrisContainer: TetrisContainer;
  private tetrominoBag: TetrominoBag;
  private initialized: boolean;
  private tetrominoGhost: GhostTetromino;

  constructor() {
    const screenConfig = Config.getInstance().getScreenConfig();

    this.id = generateRandomId();
    this.logger = Logger.createLogger(`Game#${this.id}`);
    this.app = new (Libraries.getPIXI().Application)();
    this.grid = new Grid(screenConfig.getRows(), screenConfig.getColumns());
    this.mainRenderer = new MainRenderer(this, this.grid);
    this.tetrisContainer = new TetrisContainer();
    this.tetrominoBag = new TetrominoBag();
    this.initialized = false;
    this.tetrominoGhost = new GhostTetromino();
  }

  private update(ticker: Ticker): void {
    this.logger.groupCollapsed(
      "Game Update",
      "New tick... Updating game state"
    );

    const currentTetromino = this.tetrominoBag.getCurrentTetronimo();

    this.mainRenderer.updateGrid();
    this.mainRenderer.updateGhost(
      this.tetrominoGhost.getPositionY(),
      currentTetromino
    );
    this.mainRenderer.updateTetromino(currentTetromino);
    this.logger.groupEnd();
  }

  async initialize(): Promise<void> {
    this.logger.groupCollapsed("Initialize Game", "Initializing the game");
    this.logger.info("Initializing Pixi.js app instance");
    await this.app.init({
      powerPreference: "high-performance",
      autoDensity: true,
      backgroundAlpha: 0,
      resizeTo: this.tetrisContainer.getElement(),
    });
    this.logger.info("Adding app instance's canvas");
    this.tetrisContainer.getElement().appendChild(this.app.canvas);
    this.logger.info("Initializing main renderer");
    await this.mainRenderer.initialize();
    await this.tetrominoBag.initialize();
    this.logger.groupEnd();
    this.initialized = true;
  }

  start(): void {
    if (!this.initialized || !this.app.ticker.started) {
      return;
    }

    this.logger.info("Starting Game...");
    this.app.ticker.add(this.update, this);
    this.app.stage.addChild(this.mainRenderer.getPixiContainer());
    this.tetrominoGhost.update(
      this.grid,
      this.tetrominoBag.getCurrentTetronimo()
    );
  }

  stop(): void {}

  destroy(): void {
    this.app.destroy(true, true);
  }

  getId(): string {
    return this.id;
  }

  getTetrisContainer(): TetrisContainer {
    return this.tetrisContainer;
  }

  getApp(): Application {
    return this.app;
  }
}
