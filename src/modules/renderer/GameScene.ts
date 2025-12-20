import type { Container, Ticker } from "pixi.js";
import { Libraries } from "@/Libraries";
import Logger from "../../modules/log/Logger";
import type GameState from "../../modules/tetris/GameState";
import HStack from "../layout/HStack";
import { HoldRenderer, PlayfieldRenderer } from "./renderers";
import { PlayfieldBorderSkin, SlantedHoldSkin } from "./skins";
type ShakeAxis = "x" | "y";

interface ShakeImpulse {
  axis: ShakeAxis;
  strength: number;
  decay: number;
}

export class WallShake {
  offsetX = 0;
  offsetY = 0;

  velocityX = 0;
  velocityY = 0;

  // Spring constants
  stiffness = 0.05; // spring strength (higher = snappier)
  damping = 0.15; // damping (higher = less bounce)
  maxShake = 12; // maximum pixel displacement

  addImpulse(axis: "x" | "y", strength: number) {
    if (axis === "x") this.velocityX += strength;
    else this.velocityY += strength;
  }

  update(dt: number) {
    // Integrate spring physics: simple semi-implicit Euler
    // F = -k * x - c * v

    // X axis
    const forceX =
      -this.stiffness * this.offsetX - this.damping * this.velocityX;
    this.velocityX += forceX * dt;
    this.offsetX += this.velocityX * dt;

    // Y axis
    const forceY =
      -this.stiffness * this.offsetY - this.damping * this.velocityY;
    this.velocityY += forceY * dt;
    this.offsetY += this.velocityY * dt;

    // Clamp max shake
    this.offsetX = Math.max(
      -this.maxShake,
      Math.min(this.maxShake, this.offsetX)
    );
    this.offsetY = Math.max(
      -this.maxShake,
      Math.min(this.maxShake, this.offsetY)
    );
  }

  apply(container: Container) {
    container.x = Math.round(this.offsetX);
    container.y = Math.round(this.offsetY);
  }
}

export default class GameScene {
  private logger: Logger;
  private logicalWidth: number;
  private logicalHeight: number;
  private container: Container;
  private layoutContainer: HStack;
  private holdRenderer: HoldRenderer;
  private playfieldRenderer: PlayfieldRenderer;
  private wallShake: WallShake;

  constructor(parent: Container, logicalWidth: number, logicalHeight: number) {
    this.wallShake = new WallShake();
    this.logger = Logger.createLogger(GameScene.name);
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.container = new (Libraries.getPIXI().Container)({ parent });
    this.layoutContainer = new HStack(this.container, 2, 1, logicalWidth);
    this.holdRenderer = new HoldRenderer(
      this.layoutContainer.getContainer(),
      new SlantedHoldSkin()
    );
    this.playfieldRenderer = new PlayfieldRenderer(
      this.layoutContainer.getContainer(),
      new PlayfieldBorderSkin(0xffffff, 4)
    );
  }

  initialize(): void {
    this.logger.groupCollapsed("Initialize", "Initializing game scene");
    this.holdRenderer.initialize();
    this.playfieldRenderer.initialize();
    this.logger.groupEnd();
  }
  render(_ticker: Ticker, state: GameState): void {
    const actions = state.getActiveTetromino().actions;

    if (actions.collidingRight) {
      this.wallShake.addImpulse("x", 2);
    } else if (actions.collidingLeft) {
      this.wallShake.addImpulse("x", -2);
    }

    if (actions.hardDrop) {
      this.wallShake.addImpulse("y", 5);
    }

    if (actions.softDrop) {
      this.wallShake.addImpulse("y", 0.8);
    }

    this.wallShake.update(_ticker.deltaTime);
    this.wallShake.apply(this.layoutContainer.getContainer());

    this.playfieldRenderer.render(
      this.playfieldRenderer.getSelector().select(state)
    );
    this.holdRenderer.render(this.holdRenderer.getSelector().select(state));
  }

  resize(sw: number, sh: number): void {
    this.logger.groupCollapsed("Resize", "Resizing game scene");

    this.logger.info("Performing calculations...");
    const scale = Math.min(sw / this.logicalWidth, sh / this.logicalHeight, 1);
    const x = (sw - this.logicalWidth * scale) / 2;
    const y = (sh - this.logicalHeight * scale) / 2;
    this.logger.info("Acquired(scale, x, y): " + [scale, x, y].toString());

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
