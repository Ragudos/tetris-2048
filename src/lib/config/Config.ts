import Cloneable from "@/common/Cloneable";
import { KickDataKey, SpriteType } from "@/constants";

export default class Config implements Cloneable<Config> {
  private static instance: Config;

  private screenConfig: ScreenConfig;
  private controlsConfig: ControlsConfig;
  private gameplayConfig: GameplayConfig;

  static getInstance(): Config {
    if (Config.instance === undefined) {
      Config.instance = new Config();
    }

    return Config.instance;
  }

  private constructor() {
    this.screenConfig = new ScreenConfig(20, 10, 250, 500, 25);
    this.controlsConfig = new ControlsConfig(2, 10);
    this.gameplayConfig = new GameplayConfig(20, 60, "blocky", "SRS", true);
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

  constructor(
    lockDelayMaxResets: number,
    lockDelayDt: number,
    spriteType: SpriteType,
    kickDataKey: KickDataKey,
    enableGhost: boolean
  ) {
    this.lockDelayMaxResets = lockDelayMaxResets;
    this.lockDelayDt = lockDelayDt;
    this.spriteType = spriteType;
    this.kickDataKey = kickDataKey;
    this.enableGhost = enableGhost;
  }

  clone(): GameplayConfig {
    return new GameplayConfig(
      this.lockDelayMaxResets,
      this.lockDelayDt,
      this.spriteType,
      this.kickDataKey,
      this.enableGhost
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

  constructor(inputDelay: number, initialInputDelay: number) {
    this.inputDelay = inputDelay;
    this.initialInputDelay = initialInputDelay;
  }

  clone(): ControlsConfig {
    return new ControlsConfig(this.inputDelay, this.initialInputDelay);
  }

  getInputDelay(): number {
    return this.inputDelay;
  }

  getInitialInputDelay(): number {
    return this.initialInputDelay;
  }
}

export class ScreenConfig implements Cloneable<ScreenConfig> {
  private columns: number;
  private rows: number;
  private width: number;
  private height: number;
  private blockSize: number;

  constructor(
    columns: number,
    rows: number,
    width: number,
    height: number,
    blockSize: number
  ) {
    this.columns = columns;
    this.rows = rows;
    this.width = width;
    this.height = height;
    this.blockSize = blockSize;
  }

  clone(): ScreenConfig {
    return new ScreenConfig(
      this.columns,
      this.rows,
      this.width,
      this.height,
      this.blockSize
    );
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
