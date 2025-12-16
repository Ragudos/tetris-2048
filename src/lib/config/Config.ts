import Cloneable from "@/common/Cloneable";
import { GRAVITY, KickDataKey, SpriteType } from "@/constants";
import InputMap from "./InputMap";
import { ControlAction } from "../input/ActionProcessor";

export const DEFAULT_CONFIG = Object.freeze({
  screenConfig: {
    rows: 20,
    columns: 10,
    width: 250,
    height: 500,
    blockSize: 25,
  },
  controlsConfig: {
    inputDelay: 2,
    initialInputDelay: 10,
    inputMap: {
      bindings: {
        [ControlAction.MOVE_LEFT]: ["ArrowLeft", "KeyA"],
        [ControlAction.MOVE_RIGHT]: ["ArrowRight", "KeyD"],
        [ControlAction.SOFT_DROP]: ["ArrowDown", "KeyS"],
        [ControlAction.HARD_DROP]: ["Space"],
        [ControlAction.ROTATE_CW]: ["ArrowUp", "KeyX"],
        [ControlAction.ROTATE_CCW]: ["KeyZ"],
        [ControlAction.HOLD]: ["ShiftLeft", "ShiftRight"],
      } as Record<string, string[]>,
    },
  },
  gameplayConfig: {
    lockDelayMaxResets: 20,
    lockDelayDt: 60,
    spriteType: "shiny",
    kickDataKey: "SRS",
    enableGhost: true,
    enableLock: true,
    gravityMode: "NORMAL",
  },
} as const);

export default class Config implements Cloneable<Config> {
  static readonly STORAGE_KEY = "__TETRIS__Config";

  private static instance: Config;

  private screenConfig: ScreenConfig;
  private controlsConfig: ControlsConfig;
  private gameplayConfig: GameplayConfig;

  private constructor(
    screenConfig?: ScreenConfig,
    controlsConfig?: ControlsConfig,
    gameplayConfig?: GameplayConfig,
  ) {
    this.screenConfig =
      screenConfig ||
      new ScreenConfig(
        DEFAULT_CONFIG.screenConfig.rows,
        DEFAULT_CONFIG.screenConfig.columns,
        DEFAULT_CONFIG.screenConfig.width,
        DEFAULT_CONFIG.screenConfig.height,
        DEFAULT_CONFIG.screenConfig.blockSize,
      );

    this.controlsConfig =
      controlsConfig ??
      new ControlsConfig(
        DEFAULT_CONFIG.controlsConfig.inputDelay,
        DEFAULT_CONFIG.controlsConfig.initialInputDelay,
        new InputMap(
          window,
          new Map(
            Object.entries(DEFAULT_CONFIG.controlsConfig.inputMap.bindings).map(
              ([action, keys]) => [action, new Set(keys)],
            ),
          ),
        ),
      );

    this.gameplayConfig =
      gameplayConfig ??
      new GameplayConfig(
        DEFAULT_CONFIG.gameplayConfig.lockDelayMaxResets,
        DEFAULT_CONFIG.gameplayConfig.lockDelayDt,
        DEFAULT_CONFIG.gameplayConfig.spriteType,
        DEFAULT_CONFIG.gameplayConfig.kickDataKey,
        DEFAULT_CONFIG.gameplayConfig.enableGhost,
        DEFAULT_CONFIG.gameplayConfig.enableLock,
        DEFAULT_CONFIG.gameplayConfig.gravityMode,
      );
  }

  /** Returns the singleton instance */
  static getInstance(): Config {
    if (!Config.instance) {
      const saved = localStorage.getItem(Config.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved, (key, value) => {
            if (value && value.$type) {
              switch (value.$type) {
                case "ScreenConfig":
                  return new ScreenConfig(
                    value.rows,
                    value.columns,
                    value.width,
                    value.height,
                    value.blockSize,
                  );
                case "GameplayConfig":
                  return new GameplayConfig(
                    value.lockDelayMaxResets,
                    value.lockDelayDt,
                    value.spriteType,
                    value.kickDataKey,
                    value.enableGhost,
                    value.enableLock,
                    value.gravityMode,
                  );
                case "ControlsConfig":
                  return new ControlsConfig(
                    value.inputDelay,
                    value.initialInputDelay,
                    new InputMap(
                      window,
                      new Map(
                        value.inputMap.bindings.map(([action, keys]: [string, string[]]) => [
                          action,
                          new Set(keys),
                        ]),
                      ),
                    ),
                  );
              }
            }
            return value;
          });

          Config.instance = new Config(
            parsed.screenConfig,
            parsed.controlsConfig,
            parsed.gameplayConfig,
          );
        } catch {
          console.warn("Invalid config in localStorage, using defaults.");
          Config.instance = new Config();
        }
      } else {
        Config.instance = new Config();
      }
    }

    return Config.instance;
  }

  /** Save the current config to localStorage */
  save(): void {
    localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(this));
  }

  clone(): Config {
    return new Config();
  }

  getScreenConfig(): ScreenConfig {
    return this.screenConfig;
  }

  getControlsConfig(): ControlsConfig {
    return this.controlsConfig;
  }

  getGameplayConfig(): GameplayConfig {
    return this.gameplayConfig;
  }
}

export class GameplayConfig implements Cloneable<GameplayConfig> {
  /**
   * How many times a player can delay their piece lock
   * before the game decides to lock it indefinitely
   */
  private lockDelayMaxResets: number;
  private lockDelayDt: number;
  private spriteType: SpriteType;
  private kickDataKey: KickDataKey;
  private enableGhost: boolean;
  private enableLock: boolean;
  private gravityMode: (typeof GRAVITY)[number];

  constructor(
    lockDelayMaxResets: number,
    lockDelayDt: number,
    spriteType: SpriteType,
    kickDataKey: KickDataKey,
    enableGhost: boolean,
    enableLock: boolean,
    gravityMode: (typeof GRAVITY)[number],
  ) {
    this.lockDelayMaxResets = lockDelayMaxResets;
    this.lockDelayDt = lockDelayDt;
    this.spriteType = spriteType;
    this.kickDataKey = kickDataKey;
    this.enableGhost = enableGhost;
    this.enableLock = enableLock;
    this.gravityMode = gravityMode;
  }

  toJSON() {
    return {
      lockDelayMaxResets: this.lockDelayMaxResets,
      lockDelayDt: this.lockDelayDt,
      spriteType: this.spriteType,
      kickDataKey: this.kickDataKey,
      enableGhost: this.enableGhost,
      enableLock: this.enableLock,
      gravityMode: this.gravityMode,
      $type: "GameplayConfig",
    };
  }

  clone(): GameplayConfig {
    return new GameplayConfig(
      this.lockDelayMaxResets,
      this.lockDelayDt,
      this.spriteType,
      this.kickDataKey,
      this.enableGhost,
      this.enableLock,
      this.gravityMode,
    );
  }

  getLockDelayMaxResets(): number {
    return this.lockDelayMaxResets;
  }

  getLockDelayDt(): number {
    return this.lockDelayDt;
  }

  getSpriteType(): SpriteType {
    return this.spriteType;
  }

  getKickDataKey(): KickDataKey {
    return this.kickDataKey;
  }

  getEnableGhost(): boolean {
    return this.enableGhost;
  }

  getEnableLock(): boolean {
    return this.enableLock;
  }

  getGravityMode(): (typeof GRAVITY)[number] {
    return this.gravityMode;
  }
}
export class ControlsConfig implements Cloneable<ControlsConfig> {
  /**
   * How many process frames before accepting the input
   */
  private inputDelay: number;
  /**
   * Initially, how many process frames before accepting the input
   */
  private initialInputDelay: number;

  private inputMap: InputMap;

  constructor(inputDelay: number, initialInputDelay: number, inputMap: InputMap) {
    this.inputDelay = inputDelay;
    this.initialInputDelay = initialInputDelay;
    this.inputMap = inputMap;
  }

  toJSON() {
    return {
      inputDelay: this.inputDelay,
      initialInputDelay: this.initialInputDelay,
      inputMap: {
        bindings: Array.from(this.inputMap.getBinding().entries()).map(([action, keys]) => [
          action,
          Array.from(keys),
        ]),
      },
      $type: "ControlsConfig",
    };
  }

  clone(): ControlsConfig {
    return new ControlsConfig(this.inputDelay, this.initialInputDelay, this.inputMap.clone());
  }

  getInputDelay(): number {
    return this.inputDelay;
  }

  getInitialInputDelay(): number {
    return this.initialInputDelay;
  }

  getInputMap(): InputMap {
    return this.inputMap;
  }
}

export class ScreenConfig implements Cloneable<ScreenConfig> {
  private rows: number;
  private columns: number;
  private width: number;
  private height: number;
  private blockSize: number;

  constructor(rows: number, columns: number, width: number, height: number, blockSize: number) {
    this.rows = rows;
    this.columns = columns;
    this.width = width;
    this.height = height;
    this.blockSize = blockSize;
  }

  toJSON() {
    return {
      rows: this.rows,
      columns: this.columns,
      width: this.width,
      height: this.height,
      blockSize: this.blockSize,
      $type: "ScreenConfig",
    };
  }

  clone(): ScreenConfig {
    return new ScreenConfig(this.rows, this.columns, this.width, this.height, this.blockSize);
  }

  getColumns(): number {
    return this.columns;
  }

  getRows(): number {
    return this.rows;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getBlockSize(): number {
    return this.blockSize;
  }
}
