import type { Container, Ticker } from "pixi.js";
import { Libraries } from "@/Libraries";
import Logger from "../../modules/log/Logger";
import type GameState from "../../modules/tetris/GameState";
import HStack from "../layout/HStack";
import { HoldRenderer, PlayfieldRenderer } from "./renderers";
import { PlayfieldBorderSkin, SlantedHoldSkin } from "./skins";

export default class GameScene {
  private logger: Logger;
  private logicalWidth: number;
  private logicalHeight: number;
  private container: Container;
  private layoutContainer: HStack;
  private holdRenderer: HoldRenderer;
  private playfieldRenderer: PlayfieldRenderer;

  constructor(parent: Container, logicalWidth: number, logicalHeight: number) {
    this.logger = Logger.createLogger(GameScene.name);
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.container = new (Libraries.getPIXI().Container)({ parent });
    this.layoutContainer = new HStack(this.container, 2, 1, logicalWidth);
    this.holdRenderer = new HoldRenderer(
      this.layoutContainer.getContainer(),
      new SlantedHoldSkin(),
    );
    this.playfieldRenderer = new PlayfieldRenderer(
      this.layoutContainer.getContainer(),
      new PlayfieldBorderSkin(0xffffff, 4),
    );
  }

  initialize(): void {
    this.logger.groupCollapsed("Initialize", "Initializing game scene");
    this.holdRenderer.initialize();
    this.playfieldRenderer.initialize();
    this.logger.groupEnd();
  }

  render(ticker: Ticker, state: GameState): void {
    this.playfieldRenderer.render(this.playfieldRenderer.getSelector().select(state));
    this.holdRenderer.render(this.holdRenderer.getSelector().select(state));
  }

  resize(sw: number, sh: number): void {
    this.logger.groupCollapsed("Resize", "Resizing game scene");

    this.logger.info("Performing calculations...");
    const scale = Math.min(sw / this.logicalWidth, sh / this.logicalHeight, 1);
    const x = (sw - this.logicalWidth * scale) / 2;
    const y = (sh - this.logicalHeight * scale) / 2;
    this.logger.info("Acquired(scale, x, y): " + [scale, x, y].toString());

    console.log(scale, sw, sh);

    this.container.scale.set(scale);
    this.container.position.set(x, y);
    this.layoutContainer.markDirty();
    this.layoutContainer.tryUpdateLayout();

    this.logger.groupEnd();
  }

  destroy(): void {
    this.holdRenderer.destroy();
    this.playfieldRenderer.destroy();
  }
}
