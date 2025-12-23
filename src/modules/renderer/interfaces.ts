import type { Container, Sprite, Text, Ticker } from "pixi.js";
import type ISelector from "@tetris/selectors/ISelector";

export interface IRenderer<TState> {
  render(ticker: Ticker, state: TState): void;
  destroy(): void;
  getContainer(): Container;
  getSelector(): ISelector<TState>;
}

export interface ISkin<TContent, TState> {
  createFrame(w: number, h: number): Container;
  createLabel?(text: string): Text | Sprite;
  applyContentStyle?(
    ticker: Ticker,
    item: TContent,
    state?: TState,
    itemLabel?: string
  ): void;
}

export interface IView<TContent> {
  root: Container;
  contentLayer: Container;
  initialize?(): void;
  addContent(item: TContent): void;
}
