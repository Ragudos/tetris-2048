/**
 * @file Config.ts
 * @module src/modules/config/Config
 * @description
 * Serializable and deserializable configuration for Tetris-like games.
 * Supports sizes, gameplay, and controls. Includes default values and static
 * initialization from localStorage. All enums are frozen objects with snake_case
 * values for consistency.
 *
 * Enums:
 * - {@link GRAVITY} — available gravity modes.
 * - {@link WALL_KICK} — available wall kick rotation systems.
 * - {@link GHOST_SKIN} — ghost piece rendering skins.
 */

import z from "zod";
import Logger from "@log/Logger";
import type { DeepPartial } from "@/types/DeepPartial";
import { INPUT_MAP_SCHEMA } from "@input/InputMap";
import { ControlAction } from "@tetris/ControlAction";
import { getErrorMsg, mergeDefaults } from "@util/general";

/* --------------------------------- Enums --------------------------------- */

/**
 * @description Enum for wall kick systems used by various rotation mechanics.
 * @see [Wall Kicks](https://tetris.wiki/Wall_kick)
 */
export const WALL_KICK = Object.freeze({
    /**
     * Super Rotation System (modern guideline used in Tetris Guideline games)
     * @see [SRS on Tetris Wiki](https://tetris.wiki/SRS)
     */
    SRS: "srs",

    /**
     * Arika Rotation System (used in Tetris The Grand Master / Arika titles)
     * @see [ARS on Tetris Wiki](https://tetris.wiki/Arika_Rotation_System)
     */
    ARS: "ars",

    /**
     * TGM (Tetris The Grand Master) legacy rotation system
     * @see [TGM Rotation on Tetris Wiki](https://tetris.fandom.com/wiki/TGM_Rotation)
     */
    TGM: "tgm",

    /**
     * Cultris II wall kick system (fan-made Tetris clone)
     * @see [Cultris II on Hard Drop Wiki](https://harddrop.com/wiki/Cultris_II)
     */
    CULTRIS: "cultris",

    /**
     * Classic Tetris wall kick (no kicks, old-school NES style)
     * @see [Classic Wall Kick on Tetris Wiki](https://tetris.wiki/Wall_kick)
     */
    CLASSIC: "classic",
} as const);

/**
 * @description Enum for ghost skins.
 */
export const GHOST_SKIN = Object.freeze({
    TRANSPARENT: "transparent",
    OUTLINE: "outline",
} as const);

/**
 * @description Enum for gravity modes.
 */
export const GRAVITY = Object.freeze({
    SUBZERO: "subzero",
    RELAXED: "relaxed",
    NORMAL: "normal",
    ENGAGING: "engaging",
    SPICY: "spicy",
    STATIC: "static",
} as const);

/* ------------------------------- Config Schema ------------------------------- */

/**
 * @description Zod schema for the full Config object.
 * Validates runtime data, ensuring that enums match the constants.
 */
export const CONFIG_SCHEMA = z.object({
    sizes: z.object({
        blockSize: z.number().min(1), // blockSize in pixels
        rows: z.number().min(1),
        columns: z.number().min(1),
        holdStage: z.object({
            width: z.number().min(1), // pixel width
            height: z.number().min(1), // pixel height
        }),
        playingStage: z.object({
            width: z.number().min(1),
            height: z.number().min(1),
        }),
        queueStage: z.object({
            width: z.number().min(1),
            height: z.number().min(1),
        }),
    }),
    gameplay: z.object({
        sprites: z.object({ tetrominoType: z.string() }),
        ghost: z.object({
            enabled: z.boolean(),
            skin: z.enum(
                Object.values(GHOST_SKIN) as [
                    (typeof GHOST_SKIN)[keyof typeof GHOST_SKIN],
                    ...(typeof GHOST_SKIN)[keyof typeof GHOST_SKIN][]
                ]
            ),
        }),
        wallKick: z.enum(
            Object.values(WALL_KICK) as [
                (typeof WALL_KICK)[keyof typeof WALL_KICK],
                ...(typeof WALL_KICK)[keyof typeof WALL_KICK][]
            ]
        ),
        lock: z.object({
            enabled: z.boolean(),
            maxResets: z.number().min(0),
            delayFrames: z.number().min(0),
        }),
        gravity: z.enum(
            Object.values(GRAVITY) as [
                (typeof GRAVITY)[keyof typeof GRAVITY],
                ...(typeof GRAVITY)[keyof typeof GRAVITY][]
            ]
        ),
    }),
    controls: z.object({
        input: z.object({
            delay: z.number().min(0),
            initialDelay: z.number().min(0),
            map: INPUT_MAP_SCHEMA,
        }),
    }),
});

export type ConfigSchema = z.infer<typeof CONFIG_SCHEMA>;

/* ------------------------------- Config Defaults ------------------------------- */

/**
 * Converts stage width/height units into pixels
 * @param units stage width or height in blocks
 * @param blockSize block size in pixels
 */
const stagePixels = (units: number, blockSize: number) => units * blockSize;

const DEFAULTS: ConfigSchema = {
    sizes: {
        blockSize: 24, // each block is 24px
        rows: 20,
        columns: 10,
        holdStage: { width: stagePixels(6, 24), height: stagePixels(6, 24) },
        playingStage: {
            width: stagePixels(10, 24),
            height: stagePixels(20, 24),
        },
        queueStage: { width: stagePixels(6, 24), height: stagePixels(20, 24) },
    },
    gameplay: {
        sprites: { tetrominoType: "blocky" },
        ghost: { enabled: true, skin: GHOST_SKIN.TRANSPARENT },
        wallKick: WALL_KICK.SRS,
        lock: { enabled: true, maxResets: 15, delayFrames: 30 },
        gravity: GRAVITY.NORMAL,
    },
    controls: {
        input: {
            delay: 1,
            initialDelay: 6,
            map: {
                autoListen: true,
                keys: {
                    [ControlAction.MOVE_LEFT]: ["ArrowLeft", "KeyA"],
                    [ControlAction.MOVE_RIGHT]: ["ArrowRight", "KeyD"],
                    [ControlAction.SOFT_DROP]: ["ArrowDown", "KeyS"],
                    [ControlAction.HARD_DROP]: ["Space"],
                    [ControlAction.ROTATE_CW]: ["ArrowUp", "KeyX"],
                    [ControlAction.ROTATE_CCW]: ["KeyZ"],
                    [ControlAction.HOLD]: ["ShiftLeft", "ShiftRight"],
                },
                keysDown: [],
                targetId: "window",
            },
        },
    },
};

/* ------------------------------- Config Class ------------------------------- */

/**
 * @class Config
 * @description
 * Serializable and deserializable game configuration. Includes:
 *
 * - **Sizes**: blockSize, rows, columns, stage dimensions.
 * - **Gameplay**: sprites, ghost, wall kicks, lock mechanics, gravity.
 * - **Controls**: input delays, key mapping via InputMap.
 *
 * Config can be saved to and loaded from localStorage for persistence.
 * Defaults are provided for all fields.
 *
 * @example
 * ```ts
 * // Load existing config or use defaults
 * const config = Config.load();
 *
 * // Modify a setting
 * config.sizes.blockSize = 32;
 *
 * // Persist to localStorage
 * config.save();
 * ```
 */
export default class Config {
    private static logger: Logger = Logger.createLogger(Config.name);
    static readonly STORAGE_KEY = "__TETRIS__config";

    sizes: ConfigSchema["sizes"];
    gameplay: ConfigSchema["gameplay"];
    controls: ConfigSchema["controls"];

    /**
     * @constructor
     * @param config Optional partial config to override defaults
     */
    constructor(config?: DeepPartial<ConfigSchema>) {
        const merged = mergeDefaults(DEFAULTS, config);
        this.sizes = merged.sizes;
        this.gameplay = merged.gameplay;
        this.controls = merged.controls;
    }

    /**
     * @method toJSON
     * @description Serializes the current config into a JSON object.
     */
    toJSON(): ConfigSchema {
        return {
            sizes: this.sizes,
            gameplay: this.gameplay,
            controls: this.controls,
        };
    }

    /**
     * @method save
     * @description Saves the current config to localStorage using {@link Config.STORAGE_KEY}.
     */
    save(): void {
        try {
            Config.logger.groupCollapsed("Save", "Saving Config...");
            localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(this.toJSON()));
            Config.logger.info("Saved");
        } catch (err) {
            Config.logger.error(getErrorMsg(err));
        } finally {
            Config.logger.groupEnd();
        }
    }

    /**
     * @static
     * @method load
     * @description Loads the config from localStorage.
     * Returns a Config instance validated by zod.
     * Defaults are returned if the key does not exist or validation fails.
     *
     * @returns {Config} Config instance
     */
    static load(): Config {
        Config.logger.groupCollapsed("Load", "Loading config...");

        const stored = localStorage.getItem(Config.STORAGE_KEY);

        if (!stored) {
            Config.logger.info("No stored config. Proceeding to default.");
            Config.logger.groupEnd();

            return new Config();
        }

        Config.logger.info("Config loaded. Parsing...");

        try {
            const parsed = JSON.parse(stored);
            const parseResult = CONFIG_SCHEMA.safeParse(parsed);

            if (parseResult.error) {
                Config.logger.error(parseResult.error.message);

                return new Config();
            }

            Config.logger.info("Config parsed. Success!");

            return new Config(parseResult.data);
        } catch (err) {
            Config.logger.error(getErrorMsg(err));

            return new Config();
        } finally {
            Config.logger.groupEnd();
        }
    }

    /**
     * @static
     * @method reset
     * @description Clears config in localStorage and returns a new Config with default values.
     *
     * @returns {Config} Config instance with defaults
     */
    static reset(): Config {
        localStorage.removeItem(Config.STORAGE_KEY);
        return new Config();
    }
}
