import { Container, Sprite, type Text } from "pixi.js";
import { Libraries } from "@/Libraries";
import type { ISkin, IView } from "./interfaces";

export class GenericView<TContent, TState> implements IView<TContent> {
  private skin: ISkin<TContent, TState>;
  private label?: Text | Sprite;

  readonly root: Container;
  readonly contentLayer: Container;

  constructor(skin: ISkin<TContent, TState>, w: number, h: number, labelText?: string) {
    this.root = new (Libraries.getPIXI().Container)();
    this.contentLayer = new (Libraries.getPIXI().Container)();
    this.skin = skin;
    const frame = this.skin.createFrame(w, h);

    this.root.addChild(frame);

    if (labelText && this.skin.createLabel) {
      this.label = this.skin.createLabel(labelText);

      this.root.addChild(this.label);
    }

    this.root.addChild(this.contentLayer);
  }

  initialize(): void {}

  addContent(item: TContent): void {
    if (item instanceof Sprite || item instanceof Container) {
      this.contentLayer.addChild(item as unknown as Container);
    }
  }

  getSkin(): ISkin<TContent, TState> {
    return this.skin;
  }
}
