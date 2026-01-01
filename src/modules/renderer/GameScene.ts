import { Container, Graphics, Ticker } from "pixi.js";
import { Libraries } from "@/Libraries";
import Logger from "../../modules/log/Logger";
import type GameState from "../../modules/tetris/GameState";
import HStack from "../layout/HStack";
import { HoldRenderer, PlayfieldRenderer } from "./renderers";
import { PlayfieldBorderSkin, SlantedHoldSkin } from "./skins";
import { range } from "../util/general";

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
  private playingContainer: Container;
  private background: Container;

  constructor(parent: Container, logicalWidth: number, logicalHeight: number) {
    this.wallShake = new WallShake();
    this.logger = Logger.createLogger(GameScene.name);
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.container = new (Libraries.getPIXI().Container)({ parent });
    this.playingContainer = new (Libraries.getPIXI().Container)({
      parent: this.container,
      zIndex: 2,
    });
    this.background = new (Libraries.getPIXI().Container)({
      parent: this.container,
      zIndex: 1,
      label: "Background",
    });
    this.layoutContainer = new HStack(
      this.playingContainer,
      2,
      1,
      logicalWidth
    );
    this.holdRenderer = new HoldRenderer(
      this.layoutContainer.getContainer(),
      new SlantedHoldSkin()
    );
    this.playfieldRenderer = new PlayfieldRenderer(
      this.layoutContainer.getContainer(),
      new PlayfieldBorderSkin(0xffffff, 4)
    );

    const bgBounds = new (Libraries.getPIXI().Graphics)({
      label: "Invisible Rect",
    });

    this.background.addChild(bgBounds);
  }

  initialize(): void {
    this.logger.groupCollapsed("Initialize", "Initializing game scene");
    this.holdRenderer.initialize();
    this.playfieldRenderer.initialize();
    this.logger.groupEnd();
  }

  render(ticker: Ticker, state: GameState): void {
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

    this.wallShake.update(ticker.deltaTime);

    this.wallShake.apply(this.layoutContainer.getContainer());
    this.playfieldRenderer.render(
      ticker,
      this.playfieldRenderer.getSelector().select(state)
    );
    this.holdRenderer.render(
      ticker,
      this.holdRenderer.getSelector().select(state)
    );
  }

  /** === BG LINE EFFECT === */
  private bgLines: BgLine[] = [];

  private spawnBackgroundLine(): void {
    const PIXI = Libraries.getPIXI();
    const gfx = new PIXI.Graphics();
    this.background.addChild(gfx);

    const horizontal = Math.random() < 0.5;
    const speed = 0.02 + Math.random() * 0.02;

    let startX: number;
    let startY: number;
    let length: number;
    let dir: number;

    if (horizontal) {
      // Horizontal line → y is random along the height
      startY = range(0, this.background.height);

      // Start from left or right edge
      if (Math.random() < 0.5) {
        startX = 0; // grow right
        dir = 1;
      } else {
        startX = this.background.width; // grow left
        dir = -1;
      }

      length = this.background.width; // always spans full width
    } else {
      // Vertical line → x is random along the width
      startX = range(0, this.background.width);

      // Start from top or bottom edge
      if (Math.random() < 0.5) {
        startY = 0; // grow down
        dir = 1;
      } else {
        startY = this.background.height; // grow up
        dir = -1;
      }

      length = this.background.height; // always spans full height
    }

    this.background.addChild(gfx);
    // Push the new line
    this.bgLines.push({
      gfx,
      horizontal,
      startX,
      startY,
      dir,
      progress: 0,
      speed,
      length,
      phase: 0,
    });
  }

  private animateBackground(ticker: Ticker, state: GameState): void {
    const actions = state.getActiveTetromino().actions;

    if (actions.hardDrop || actions.collidingRight || actions.collidingLeft) {
      this.spawnBackgroundLine();
    }

    const dt = ticker.deltaTime;

    for (let i = this.bgLines.length - 1; i >= 0; i--) {
      const line = this.bgLines[i];
      line.progress += line.speed * dt;

      line.gfx.clear();

      if (line.phase === 0) {
        // Growing phase
        const t = Math.min(line.progress, 1);

        if (line.horizontal) {
          line.gfx.moveTo(line.startX, line.startY);
          line.gfx.lineTo(
            line.startX + line.dir * line.length * t,
            line.startY
          );
        } else {
          line.gfx.moveTo(line.startX, line.startY);
          line.gfx.lineTo(
            line.startX,
            line.startY + line.dir * line.length * t
          );
        }

        line.gfx.stroke({ width: 2, color: 0xffffff, alpha: 1 });

        if (t >= 1) {
          // Switch to fade phase
          line.phase = 1;
          line.progress = 0; // reset for fade
        }
      } else if (line.phase === 1) {
        // Fade/recede phase
        const t = Math.min(line.progress, 1); // 0 → 1
        const fade = 1 - t;

        if (line.horizontal) {
          line.gfx.moveTo(
            line.startX + line.dir * line.length * t,
            line.startY
          );
          line.gfx.lineTo(line.startX + line.dir * line.length, line.startY);
        } else {
          line.gfx.moveTo(
            line.startX,
            line.startY + line.dir * line.length * t
          );
          line.gfx.lineTo(line.startX, line.startY + line.dir * line.length);
        }

        line.gfx.stroke({ width: 2, color: 0xffffff, alpha: fade });

        if (t >= 1) {
          // Line fully faded → remove
          line.gfx.destroy();
          this.bgLines.splice(i, 1);
        }
      }
    }
  }

  /** === BG LINE EFFECT === */

  resize(sw: number, sh: number): void {
    this.logger.groupCollapsed("Resize", "Resizing game scene");

    this.logger.info("Performing calculations...");
    const scale = Math.min(sw / this.logicalWidth, sh / this.logicalHeight, 1);
    const x = (sw - this.logicalWidth * scale) / 2;
    const y = (sh - this.logicalHeight * scale) / 2;

    const bgBounds = this.background.getChildByLabel(
      "Invisible Rect"
    ) as Graphics;

    bgBounds.clear();
    bgBounds.rect(0, 0, sw, sh);
    bgBounds.fill({ color: 0x000000, alpha: 0 });

    this.playingContainer.scale.set(scale);
    this.playingContainer.position.set(x, y);
    this.layoutContainer.markDirty();
    this.layoutContainer.tryUpdateLayout();

    this.logger.groupEnd();
  }

  destroy(): void {
    this.holdRenderer.destroy();
    this.playfieldRenderer.destroy();
  }
}

type BgLine = {
  gfx: Graphics;
  horizontal: boolean;
  startX: number;
  startY: number;
  dir: number;
  progress: number; // 0→1
  speed: number;
  length: number;
  phase: 0 | 1; // 0 = grow, 1 = fade
};
