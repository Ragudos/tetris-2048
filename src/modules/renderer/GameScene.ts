import { type Container, Graphics, Point, type Ticker } from "pixi.js";
import { Libraries } from "@/Libraries";
import Logger from "../../lib/log/Logger";
import type GameState from "../../modules/tetris/GameState";
import HStack from "../layout/HStack";
import { HoldRenderer, PlayfieldRenderer } from "./renderers";
import { PlayfieldBorderSkin, SlantedHoldSkin } from "./skins";
import { GlobalConfig } from "../config/GlobalConfig";

export type CollisionSide = "left" | "right" | "ground";

interface GrowingCircle {
  side: CollisionSide;
  gfx: Graphics;
  radius: number;
}

export interface ShapeCollisionSource {
  shape: number[][]; // [row][col]
  position: Point; // world-space top-left
  cellSize: number; // px per cell
}
export class CollisionCircleEffect {
  private circles = new Map<CollisionSide, GrowingCircle>();
  private previousCollisions = new Set<CollisionSide>();

  constructor(
    private readonly container: Container,
    private readonly initialRadius = 2,
    private readonly maxRadius = 20,
    private readonly growthRate = 1.6
  ) {}

  private computeContactPoint(
    source: ShapeCollisionSource,
    side: CollisionSide
  ): Point | null {
    const { shape, position, cellSize } = source;

    let bestRow = -1;
    let bestCol = -1;

    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (!shape[row][col]) continue;

        if (bestRow === -1) {
          bestRow = row;
          bestCol = col;
          continue;
        }

        switch (side) {
          case "ground":
            if (row > bestRow) {
              bestRow = row;
              bestCol = col;
            }
            break;

          case "left":
            if (col < bestCol) {
              bestRow = row;
              bestCol = col;
            }
            break;

          case "right":
            if (col > bestCol) {
              bestRow = row;
              bestCol = col;
            }
            break;
        }
      }
    }

    console.log(bestCol, bestRow);

    if (bestRow === -1) return null;

    const worldX = ((position.x + bestCol) * cellSize) / 2;
    const worldY = ((position.y + bestRow) * cellSize) / 2;

    return new Point(worldX, worldY);
  }

  handleCollision(
    source: ShapeCollisionSource,
    currentCollisions: Set<CollisionSide>
  ) {
    for (const side of currentCollisions) {
      const isNewCollision = !this.previousCollisions.has(side);

      if (!isNewCollision) continue;
      if (this.circles.has(side)) continue;

      const contact = this.computeContactPoint(source, side);
      if (!contact) continue;

      const gfx = new Graphics();
      gfx.position.copyFrom(contact);

      this.container.addChild(gfx);

      this.circles.set(side, {
        side,
        gfx,
        radius: this.initialRadius,
      });
    }

    this.previousCollisions = new Set(currentCollisions);
  }

  resetCollisionState() {
    this.previousCollisions.clear();
  }

  update(delta: number) {
    for (const [side, circle] of this.circles) {
      circle.radius += this.growthRate * delta;

      circle.gfx.clear();
      circle.gfx.circle(0, 0, circle.radius);
      circle.gfx.stroke({ width: 2, color: 0xffffff, alpha: 0.9 });

      if (circle.radius >= this.maxRadius) {
        this.container.removeChild(circle.gfx);
        circle.gfx.destroy();
        this.circles.delete(side);
      }
    }
  }

  clear() {
    for (const c of this.circles.values()) {
      this.container.removeChild(c.gfx);
      c.gfx.destroy();
    }
    this.circles.clear();
  }
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
  private circleEffect: CollisionCircleEffect;
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

    this.circleEffect = new CollisionCircleEffect(
      this.playfieldRenderer.getContainer()
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

      const pos = state.getActiveTetromino().getPosition();

      this.circleEffect.handleCollision(
        {
          shape: state.getActiveTetromino().getShape(),
          position: new Point(pos.getX(), pos.getY()),
          cellSize: GlobalConfig.get().sizes.blockSize,
        },
        new Set(["right"])
      );
    } else {
      this.circleEffect.resetCollisionState();
    }

    if (actions.collidingLeft) {
      this.wallShake.addImpulse("x", -2);

      const pos = state.getActiveTetromino().getPosition();

      this.circleEffect.handleCollision(
        {
          shape: state.getActiveTetromino().getShape(),
          position: new Point(pos.getX(), pos.getY()),
          cellSize: GlobalConfig.get().sizes.blockSize,
        },
        new Set(["left"])
      );
    } else {
      this.circleEffect.resetCollisionState();
    }

    if (actions.hardDrop) {
      this.wallShake.addImpulse("y", 5);
    }

    if (actions.softDrop) {
      this.wallShake.addImpulse("y", 0.8);
    }

    this.wallShake.update(ticker.deltaTime);
    this.circleEffect.update(ticker.deltaTime);

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
