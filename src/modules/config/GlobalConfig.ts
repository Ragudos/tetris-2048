/**
 * @file GlobalConfig.ts
 * @module src/modules/config/GlobalConfig
 * @description
 * Singleton factory for the game's global configuration ({@link Config}).
 *
 * Provides:
 * - Lazy loading from localStorage
 * - Explicit initialization with defaults or partial overrides
 * - Merge/update of partial configs
 * - Reset to defaults
 * - Event listeners for reactive updates
 *
 * This ensures there is a single source of truth for configuration
 * throughout the app.
 *
 * @see {@link Config} for full config structure and defaults.
 * @see {@link GRAVITY} for available gravity modes.
 * @see {@link WALL_KICK} for wall kick rotation systems.
 * @see {@link GHOST_SKIN} for ghost piece rendering styles.
 *
 * @example
 * ```ts
 * import { GlobalConfig } from "@/modules/config/GlobalConfig";
 * import { GRAVITY } from "@/modules/config/Config";
 *
 * // Access the global config
 * const config = GlobalConfig.get();
 *
 * // Update a setting globally
 * GlobalConfig.update({ gameplay: { gravity: GRAVITY.ENGAGING } });
 *
 * // Reset the config to defaults
 * GlobalConfig.reset();
 *
 * // Listen for changes
 * GlobalConfig.onChange((cfg) => {
 *   console.log("Config updated:", cfg);
 * });
 * ```
 */
import { DeepPartial } from "@/types/DeepPartial";
import Config, { type ConfigSchema } from "./Config";

/* -------------------------------- GlobalConfig ------------------------------- */

/**
 * @class GlobalConfig
 * @description
 * Singleton factory for the game's global {@link Config} instance.
 * Ensures a single source of truth for configuration throughout the app.
 */
export class GlobalConfig {
  /** Singleton instance */
  private static instance: Config;

  /** Registered change listeners */
  private static listeners: ((config: Config) => void)[] = [];

  /**
   * @description Initialize the global config.
   * Overrides any existing instance.
   *
   * @param config Optional partial config to merge with defaults
   * @returns {Config} Initialized Config instance
   */
  static init(config?: DeepPartial<ConfigSchema>): Config {
    GlobalConfig.instance = new Config(config);
    GlobalConfig.instance.save(); // persist immediately
    GlobalConfig.notify();
    return GlobalConfig.instance;
  }

  /**
   * @description Returns the singleton Config instance.
   * Loads from localStorage if not yet initialized.
   */
  static get(): Config {
    if (!GlobalConfig.instance) {
      GlobalConfig.instance = Config.load();
    }
    return GlobalConfig.instance;
  }

  /**
   * @description Merge a partial config into the global instance and persist.
   *
   * @param config Partial configuration to merge
   * @returns {Config} Updated Config instance
   */
  static update(config: DeepPartial<ConfigSchema>): Config {
    const current = GlobalConfig.get();
    const merged = new Config({
      ...current.toJSON(),
      ...config,
      sizes: { ...current.sizes, ...(config.sizes ?? {}) },
      gameplay: { ...current.gameplay, ...(config.gameplay ?? {}) },
      controls: { ...current.controls, ...(config.controls ?? {}) },
    });

    GlobalConfig.instance = merged;
    merged.save();
    GlobalConfig.notify();
    return merged;
  }

  /**
   * @description Reset the global config to defaults and persist.
   *
   * @returns {Config} Config instance with default values
   */
  static reset(): Config {
    const defaultConfig = Config.reset();
    GlobalConfig.instance = defaultConfig;
    GlobalConfig.notify();
    return defaultConfig;
  }

  /**
   * @description Register a listener to react whenever the global config changes.
   *
   * @param listener Callback function receiving the updated {@link Config} instance
   */
  static onChange(listener: (config: Config) => void): void {
    GlobalConfig.listeners.push(listener);
  }

  /**
   * @description Notify all registered listeners of a config update.
   * @private
   */
  private static notify(): void {
    GlobalConfig.listeners.forEach((cb) => cb(GlobalConfig.get()));
  }
}
