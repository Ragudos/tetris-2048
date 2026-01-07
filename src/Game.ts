import type { Application, Container, Ticker } from "pixi.js";
import { Libraries } from "./Libraries";
import { GlobalConfig } from "./modules/config/GlobalConfig";
import Logger from "./lib/log/Logger";
import GameScene from "./modules/renderer/GameScene";
import GameState from "./modules/tetris/GameState";
import { debounce } from "./modules/util/debounce";
import { generateRandomId } from "./modules/util/string";
import TetrisContainer from "./TetrisContainer";

type GameProps = {
  container: HTMLElement | null;
};

/**
 * A Tetris Game.
 *
 * Not a singleton for potential multiplayer
 */
export default class Game {
  private id: string;
  private logger: Logger;
  private app: Application;
  private gameState: GameState;
  private gameScene: GameScene;
  private tetrisContainer: TetrisContainer;
  private initialized: boolean;

  constructor(props: GameProps) {
    const config = GlobalConfig.get();

    this.id = generateRandomId();
    this.logger = Logger.createLogger(`Game#${this.id}`);
    this.app = new (Libraries.getPIXI().Application)();
    this.gameState = new GameState();
    this.gameScene = new GameScene(
      this.app.stage,
      config.sizes.holdStage.width +
        config.sizes.playingStage.width +
        config.sizes.queueStage.width,
      config.sizes.playingStage.height
    );
    this.tetrisContainer = new TetrisContainer();
    this.initialized = false;

    if (!props.container) {
      document.appendChild(this.tetrisContainer.getElement());
    } else {
      props.container.appendChild(this.tetrisContainer.getElement());
    }
  }

  private update(ticker: Ticker): void {
    this.gameScene.render(ticker, this.gameState);
    this.gameState.update(ticker);
  }

  async initialize(): Promise<void> {
    this.logger.groupCollapsed("Initialize Game", "Initializing the game");
    this.logger.info("Initializing PIXI js app instance");
    await this.app.init({
      powerPreference: "high-performance",
      autoDensity: true,
      backgroundAlpha: 0,
      resizeTo: this.tetrisContainer.getElement(),
      preference: "webgpu",
      resolution: window.devicePixelRatio || 1,
    });

    if (__DEV__) {
      await (await import("@pixi/devtools")).initDevtools(this.app);
    }

    this.app.canvas.style.visibility = "hidden";

    this.logger.info("Appending app canvas to DOM");
    this.tetrisContainer.getElement().appendChild(this.app.canvas);
    this.gameScene.initialize();
    this.app.ticker.addOnce(() => {
      this.gameScene.resize(this.app.renderer.width, this.app.renderer.height);
      this.app.canvas.style.visibility = "visible";
    });
    this.app.renderer.on(
      "resize",
      debounce(this.gameScene.resize.bind(this.gameScene), 500)
    );
    this.logger.groupEnd();

    this.initialized = true;
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
}
