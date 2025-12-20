import type { Container, Sprite, Text } from "pixi.js";
import { Libraries } from "@/Libraries";
import type HoldState from "../../modules/tetris/HoldState";
import type PlayfieldState from "../../modules/tetris/PlayfieldState";
import type { ISkin } from "./interfaces";

export class SlantedHoldSkin implements ISkin<Sprite, HoldState> {
  createFrame(w: number, h: number): Container {
    const frame = new (Libraries.getPIXI().Container)();
    const g = new (Libraries.getPIXI().Graphics)();
    const SLANT = 15;

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

  applyContentStyle(sprite: Sprite, state?: HoldState) {
    sprite.alpha = state?.canSwap ? 1 : 0.5;
  }
}

export class PlayfieldBorderSkin implements ISkin<Sprite, PlayfieldState> {
  private borderColor: number;
  private borderWidth: number;

  constructor(borderColor: number = 0xffffff, borderWidth: number = 2) {
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;
  }

  createFrame(width: number, height: number): Container {
    const PIXI = Libraries.getPIXI();

    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();

    // Draw left border
    graphics.moveTo(0, 0);
    graphics.lineTo(0, height);

    // Draw right border
    graphics.lineTo(width, height);

    // Draw bottom border
    graphics.lineTo(width, 0);
    graphics.stroke({
      alignment: 0,
      width: this.borderWidth,
      color: this.borderColor,
    });
    graphics.lineTo(0, 0);
    graphics.closePath();

    container.addChild(graphics);

    return container;
  }

  applyContentStyle(_sprite: Sprite, _state?: PlayfieldState): void {}
}
