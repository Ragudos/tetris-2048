import type { Application, Ticker } from "pixi.js";
import { generateRandomId } from "./lib/util/string";
import { Libraries } from "./Libraries";
import TetrisContainer from "./TetrisContainer";
import Logger from "./lib/log/Logger";
import MainRenderer from "./lib/renderer/MainRenderer";
import Initializeable from "./common/Initializeable";
import GlobalAction from "./lib/input/GlobalAction";
import GameState from "./lib/state/GameState";

/**
 * A Tetris Game.
 *
 * Not a singleton for potential multiplayer
 */
export default class Game implements Initializeable {
  private id: string;
  private logger: Logger;
  private app: Application;
  private gameState: GameState;
  private mainRenderer: MainRenderer;
  private tetrisContainer: TetrisContainer;
  private initialized: boolean;

  constructor() {
    this.id = generateRandomId();
    this.logger = Logger.createLogger(`Game#${this.id}`);
    this.app = new (Libraries.getPIXI().Application)();
    this.gameState = new GameState();
    this.mainRenderer = new MainRenderer(this.app, this.gameState);
    this.tetrisContainer = new TetrisContainer();
    this.initialized = false;
  }

  private update(ticker: Ticker): void {
    this.gameState.update(ticker);
    this.mainRenderer.update(ticker);
    GlobalAction.getInstance().getActionProcessor().getInputMap().endFrame();
  }

  async initialize(): Promise<void> {
    this.logger.groupCollapsed("Initialize Game", "Initializing the game");
    this.logger.info("Initializing Pixi.js app instance");
    await this.app.init({
      powerPreference: "high-performance",
      autoDensity: true,
      backgroundAlpha: 0,
      resizeTo: this.tetrisContainer.getElement(),
      preference: "webgpu",
      resolution: window.devicePixelRatio || 1,
    });
    this.logger.info("Adding app instance's canvas");
    this.tetrisContainer.getElement().appendChild(this.app.canvas);
    this.logger.info("Initializing Game State");
    await this.gameState.initialize();
    this.logger.info("Initializing main renderer");
    await this.mainRenderer.initialize();
    this.logger.groupEnd();

    this.initialized = true;

    requestAnimationFrame(() => {
      this.app.renderer.resize(
        this.tetrisContainer.getElement().clientWidth,
        this.tetrisContainer.getElement().clientHeight,
      );
    });
  }

  start(): void {
    if (!this.initialized) {
      this.logger.warn("Initialize the Game first before starting.");

      return;
    }

    if (!this.app.ticker.started) {
      this.logger.info("Resuming Game...");
      this.app.ticker.start();

      return;
    }

    this.logger.info("Starting Game...");
    this.app.ticker.add(this.update, this);
    this.app.stage.addChild(this.mainRenderer.getPixiContainer());
  }

  stop(): void {
    this.logger.info("Pausing Game...");
    this.app.stop();
  }

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
