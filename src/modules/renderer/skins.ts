import { Container, Graphics, Sprite, Text, Ticker } from "pixi.js";
import { Libraries } from "@/Libraries";
import type HoldState from "../../modules/tetris/HoldState";
import type PlayfieldState from "../../modules/tetris/PlayfieldState";
import type { ISkin } from "./interfaces";

export class SlantedHoldSkin implements ISkin<Sprite, HoldState> {
  createFrame(w: number, h: number): Container {
    const frame = new (Libraries.getPIXI().Container)();
    const g = new (Libraries.getPIXI().Graphics)();
    const SLANT = 15;

    g.rect(0, 0, w, h);
    g.fill({ color: "black" });
    g.moveTo(w, 0);
    g.lineTo(0, 0);
    g.stroke({ alignment: 1, width: 20, color: 0xffffff });
    g.lineTo(0, h - SLANT);
    g.lineTo(SLANT, h);
    g.stroke({ alignment: 1, width: 4, color: 0xffffff });
    g.lineTo(w, h);
    g.stroke({ alignment: 1, width: 4, color: 0xffffff });
    g.lineTo(w, 0);
    g.stroke({ alignment: 1, width: 4, color: 0xffffff });
    g.closePath();

    frame.addChild(g);
    return frame;
  }

  createLabel(text: string): Text | Sprite {
    return new (Libraries.getPIXI().Text)({
      text,
      position: { x: 8, y: 2 },
      style: { fontSize: 14, fontWeight: "700", fill: 0x000000 },
    });
  }

  applyContentStyle(ticker: Ticker, sprite: Sprite, state?: HoldState) {
    sprite.alpha = state?.canSwap ? 1 : 0.5;
  }
}

export class PlayfieldBorderSkin implements ISkin<Sprite, PlayfieldState> {
  private borderColor: number;
  private borderWidth: number;
  private graphics: Graphics;

  constructor(borderColor: number = 0xffffff, borderWidth: number = 2) {
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
    this.graphics = new (Libraries.getPIXI().Graphics)();
  }

  createFrame(width: number, height: number): Container {
    const PIXI = Libraries.getPIXI();

    const container = new PIXI.Container();
    const childGraphics = new PIXI.Graphics();

    childGraphics.rect(0, 0, width, height);
    childGraphics.fill({ color: "black" });
    // Draw left border
    childGraphics.moveTo(0, 0);
    childGraphics.lineTo(0, height);

    // Draw right border
    childGraphics.lineTo(width, height);

    // Draw bottom border
    childGraphics.lineTo(width, 0);
    childGraphics.stroke({
      alignment: 0,
      width: this.borderWidth,
      color: this.borderColor,
    });
    childGraphics.lineTo(0, 0);
    childGraphics.closePath();

    this.graphics.addChild(childGraphics);
    container.addChild(this.graphics);

    return container;
  }
  applyContentStyle(
    ticker: Ticker,
    sprite: Sprite,
    state?: PlayfieldState
  ): void {
    if (!state) return;
  }
}
