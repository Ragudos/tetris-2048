import {
  ColorMatrixFilter,
  type Container,
  type Sprite,
  type Ticker,
} from "pixi.js";
import { Libraries } from "@/Libraries";
import { GlobalConfig } from "../config/GlobalConfig";
import Logger from "../log/Logger";
import type HoldState from "../tetris/HoldState";
import type PlayfieldState from "../tetris/PlayfieldState";
import HoldStateSelector from "../tetris/selectors/HoldStateSelector";
import type ISelector from "../tetris/selectors/ISelector";
import PlayfieldStateSelector from "../tetris/selectors/PlayfieldStateSelector";
import { getPointFrom1D } from "../util/general";
import type { IRenderer, ISkin, IView } from "./interfaces";
import { GenericView } from "./views";
import { SPRITE_NAMES, TETROMINO_SHAPES } from "../tetris/constants";
import { getTimeEaseOut } from "../util/animations";

function applyDarken(filter: ColorMatrixFilter, strength: number) {
  filter.reset();
  filter.brightness(strength, false);
}

export abstract class GenericRenderer<TState, TContent>
  implements IRenderer<TState>
{
  protected container: Container;
  protected view: IView<TContent>;
  protected selector: ISelector<TState>;

  constructor(
    parent: Container,
    view: IView<TContent>,
    selector: ISelector<TState>
  ) {
    this.container = new (Libraries.getPIXI().Container)({
      parent,
      label: "Renderer",
    });
    this.view = view;
    this.selector = selector;

    this.container.addChild(view.root);
  }

  getContainer(): Container {
    return this.container;
  }

  getSelector(): ISelector<TState> {
    return this.selector;
  }

  abstract initialize(): void;
  abstract render(ticker: Ticker, state: TState): void;

  destroy(): void {
    this.container.destroy({ children: true });
  }
}

export class HoldRenderer extends GenericRenderer<HoldState, Sprite> {
  constructor(parent: Container, skin: ISkin<Sprite, HoldState>) {
    super(
      parent,
      new GenericView<Sprite, HoldState>(
        skin,
        GlobalConfig.get().sizes.blockSize * 5,
        GlobalConfig.get().sizes.blockSize * 4,
        "HOLD"
      ),
      new HoldStateSelector()
    );
  }

  initialize(): void {
    const blockSize = GlobalConfig.get().sizes.blockSize;

    for (let i = 0; i < 4; i++) {
      const sprite = new (Libraries.getPIXI().Sprite)({
        width: blockSize,
        height: blockSize,
        texture: Libraries.getPIXI().Texture.EMPTY,
      });

      this.view.addContent(sprite);
    }
  }

  render(ticker: Ticker, state: HoldState): void {
    if (!state.heldDirty || !state.heldTetrominoName) {
      return;
    }

    const blockSize = GlobalConfig.get().sizes.blockSize;
    const shape = TETROMINO_SHAPES[state.heldTetrominoName];
    const spriteName =
      // @ts-expect-error
      SPRITE_NAMES[GlobalConfig.get().gameplay.sprites.tetrominoType][
        state.heldTetrominoName
      ];

    const rows = shape.length;
    const cols = shape[0].length;
    let index = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (!shape[y][x]) continue;

        const sprite = this.view.contentLayer.getChildAt(index++) as Sprite;
        sprite.texture = Libraries.getPIXI().Cache.get(spriteName);

        // TODO: Centralize this. So ugly :>>
        if (state.heldTetrominoName === "I") {
          sprite.pivot.set(
            cols * (this.container.width / blockSize) * -0.5,
            rows * (this.container.height / blockSize) * -1
          );
        } else if (state.heldTetrominoName === "O") {
          sprite.pivot.set(
            cols * (this.container.width / blockSize) * -1 * 3,
            rows * (this.container.height / blockSize) * -1 * 3.35
          );
        } else {
          sprite.pivot.set(
            cols * (this.container.width / blockSize) * -1 * 1.25,
            rows * (this.container.height / blockSize) * -1 * 2.25
          );
        }

        sprite.position.set(
          Math.round(x * blockSize),
          Math.round(y * blockSize)
        );

        (this.view as GenericView<Sprite, HoldState>)
          .getSkin()
          .applyContentStyle?.(ticker, sprite, state);
      }
    }
  }
}

export class PlayfieldRenderer extends GenericRenderer<PlayfieldState, Sprite> {
  private logger: Logger;

  private backgroundLayer: Container;
  private lockedLayer: Container;
  private activeLayer: Container;
  private ghostLayer: Container;
  private overflowLayer: Container;

  constructor(parent: Container, skin: ISkin<Sprite, PlayfieldState>) {
    super(
      parent,
      new GenericView<Sprite, PlayfieldState>(
        skin,
        GlobalConfig.get().sizes.playingStage.width,
        GlobalConfig.get().sizes.playingStage.height,
        "STAGE"
      ),
      new PlayfieldStateSelector()
    );

    const PIXI = Libraries.getPIXI();

    this.logger = Logger.createLogger(PlayfieldRenderer.name);

    this.backgroundLayer = new PIXI.Container({
      label: "Tetris Background Grid",
    });
    this.lockedLayer = new PIXI.Container({ label: "Tetris Locked Blocks" });
    this.activeLayer = new PIXI.Container({ label: "Tetris Active Block" });
    this.ghostLayer = new PIXI.Container({ label: "Tetris Ghost Block" });
    this.overflowLayer = new PIXI.Container();

    this.ghostLayer.blendMode = "add";
    this.overflowLayer.blendMode = "multiply";

    this.view.root.addChild(
      this.backgroundLayer,
      this.overflowLayer,
      this.lockedLayer,
      this.ghostLayer,
      this.activeLayer
    );
  }

  initialize(): void {
    const SCREEN_CONFIG = GlobalConfig.get().sizes;
    const rows = SCREEN_CONFIG.rows;
    const columns = SCREEN_CONFIG.columns;
    const blockSize = SCREEN_CONFIG.blockSize;
    const totalCells = rows * columns;

    // background
    for (let i = 0; i < totalCells; ++i) {
      const pos = getPointFrom1D(totalCells, columns, i);

      this.backgroundLayer.addChild(
        new (Libraries.getPIXI().Sprite)({
          position: {
            x: pos.getX() * blockSize,
            y: pos.getY() * blockSize,
          },
          width: blockSize,
          height: blockSize,
          texture: Libraries.getPIXI().Cache.get(SPRITE_NAMES.background),
        })
      );
    }

    // active
    for (let i = 0; i < 4; ++i) {
      this.activeLayer.addChild(
        new (Libraries.getPIXI().Sprite)({
          position: {
            x: i * blockSize,
            y: 0,
          },
          width: blockSize,
          height: blockSize,
          texture: Libraries.getPIXI().Texture.EMPTY,
          filters: [new ColorMatrixFilter()],
        })
      );
    }

    // ghost
    const sprite =
      SPRITE_NAMES[
        GlobalConfig.get().gameplay.sprites
          .tetrominoType as keyof typeof SPRITE_NAMES
      ];

    if (sprite === "background") {
      this.logger.warn("SpriteType became background");

      return;
    }

    const spriteType = GlobalConfig.get().gameplay.sprites.tetrominoType;
    const val = SPRITE_NAMES[spriteType as keyof typeof SPRITE_NAMES];

    if (val === "background") {
      return;
    }

    for (let i = 0; i < 4; ++i) {
      this.ghostLayer.addChild(
        new (Libraries.getPIXI().Sprite)({
          position: {
            x: i * blockSize,
            y: rows * blockSize - 1,
          },
          width: blockSize,
          height: blockSize,
          texture: Libraries.getPIXI().Cache.get(val.GHOST),
          alpha: 0.87,
        })
      );
    }

    // locked
    for (let i = 0; i < totalCells; ++i) {
      const pos = getPointFrom1D(totalCells, columns, i);

      this.lockedLayer.addChild(
        new (Libraries.getPIXI().Sprite)({
          position: {
            x: pos.getX() * blockSize,
            y: pos.getY() * blockSize,
          },
          width: blockSize,
          height: blockSize,
          texture: Libraries.getPIXI().Texture.EMPTY,
          alpha: 0.97,
        })
      );
    }
  }

  private renderLockedLayer(state: PlayfieldState): void {
    const spriteType = GlobalConfig.get().gameplay.sprites
      .tetrominoType as keyof typeof SPRITE_NAMES;

    if (spriteType === "background") {
      return;
    }

    for (let i = 20; i < state.grid.length; ++i) {
      const name = state.grid[i];

      const sprite = this.lockedLayer.getChildAt(i - 20) as Sprite;
      sprite.texture = name
        ? Libraries.getPIXI().Cache.get(SPRITE_NAMES[spriteType][name])
        : Libraries.getPIXI().Texture.EMPTY;
    }
  }

  private renderGhostLayer(state: PlayfieldState): void {
    const blockSize = GlobalConfig.get().sizes.blockSize;
    let counter = 0;
    const shape = state.activeTetromino.getShape();

    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < shape[y].length; ++x) {
        if (!shape[y][x]) {
          continue;
        }

        const sprite = this.ghostLayer.getChildAt(counter++) as Sprite;

        sprite.position.set(
          (x + state.activeTetromino.getPosition().getX()) * blockSize,
          (-2 + (y + state.ghostY)) * blockSize
        );
      }
    }
  }

  private renderActiveLayer(state: PlayfieldState): void {
    const blockSize = GlobalConfig.get().sizes.blockSize;
    const name = state.activeTetromino.getName();
    const shape = state.activeTetromino.getShape();
    const position = state.activeTetromino.getPosition();
    const spriteType = GlobalConfig.get().gameplay.sprites
      .tetrominoType as keyof typeof SPRITE_NAMES;
    let counter = 0;

    if (spriteType === "background") {
      return;
    }

    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < shape[y].length; ++x) {
        if (!shape[y][x]) {
          continue;
        }

        const sprite = this.activeLayer.getChildAt(counter++) as Sprite;
        sprite.texture = Libraries.getPIXI().Cache.get(
          SPRITE_NAMES[spriteType][name]
        );

        sprite.position.set(
          (x + position.getX()) * blockSize,
          (-2 + (y + position.getY())) * blockSize
        );
      }
    }
  }

  private renderOverflowLayer(_state: PlayfieldState): void {}

  private isLockingAnimating = false;
  private alpha = 0;

  private startLockingAnimation(ticker: Ticker, state: PlayfieldState): void {
    this.isLockingAnimating = true;

    const shape = state.activeTetromino.getShape();
    const spriteType = GlobalConfig.get().gameplay.sprites
      .tetrominoType as keyof typeof SPRITE_NAMES;
    let counter = 0;

    const fraction = Math.min(
      ticker.deltaMS /
        (GlobalConfig.get().gameplay.lock.delayFrames * (1000 / ticker.FPS))
    );
    this.alpha += fraction;
    const newAlpha = getTimeEaseOut(1 - this.alpha);

    if (spriteType === "background") {
      return;
    }

    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < shape[y].length; ++x) {
        if (!shape[y][x]) {
          continue;
        }

        const sprite = this.activeLayer.getChildAt(counter++) as Sprite;

        applyDarken(sprite.filters[0] as ColorMatrixFilter, newAlpha);
      }
    }
  }

  private cancelLockingAnimation(_ticker: Ticker, state: PlayfieldState): void {
    if (this.isLockingAnimating) {
      const shape = state.activeTetromino.getShape();
      const spriteType = GlobalConfig.get().gameplay.sprites
        .tetrominoType as keyof typeof SPRITE_NAMES;
      let counter = 0;

      if (spriteType === "background") {
        return;
      }

      for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < shape[y].length; ++x) {
          if (!shape[y][x]) {
            continue;
          }

          const sprite = this.activeLayer.getChildAt(counter++) as Sprite;

          applyDarken(sprite.filters[0] as ColorMatrixFilter, 1);
        }
      }

      this.isLockingAnimating = false;
      this.alpha = 0;
    }
  }
  render(ticker: Ticker, state: PlayfieldState): void {
    if (state.lockedDirty) this.renderLockedLayer(state);
    if (state.ghostDirty) this.renderGhostLayer(state);
    if (state.activeDirty) this.renderActiveLayer(state);
    if (state.overflowDirty) this.renderOverflowLayer(state);

    if (state.locking) {
      this.startLockingAnimation(ticker, state);
    } else {
      this.cancelLockingAnimation(ticker, state);
    }
  }
}
