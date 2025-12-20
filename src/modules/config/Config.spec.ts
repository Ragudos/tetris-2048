/**
 * @file Config.spec.ts
 * @module src/modules/config/Config
 * @description
 * BDD-style tests for the `Config` module.
 * These tests validate the following behaviors:
 * 1. Default configuration values.
 * 2. Merging partial configurations with defaults.
 * 3. Serialization and deserialization.
 * 4. Persistence in localStorage, including reset and fallback behavior.
 *
 * This test suite is written in a **specification style** to make it human-readable,
 * suitable for both documentation and automated testing.
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { DeepPartial } from "@/types/DeepPartial";
import Config, { type ConfigSchema, GHOST_SKIN, GRAVITY, WALL_KICK } from "./Config";

beforeEach(() => {
  localStorage.clear();
});

describe("Config Module", () => {
  describe("Default values", () => {
    it("should provide default sizes, gameplay, and controls", () => {
      const config = new Config();
      expect(config.sizes.blockSize).toBe(24);
      expect(config.sizes.rows).toBe(20);
      expect(config.sizes.columns).toBe(10);

      expect(config.gameplay.gravity).toBe(GRAVITY.NORMAL);
      expect(config.gameplay.wallKick).toBe(WALL_KICK.SRS);
      expect(config.gameplay.ghost.skin).toBe(GHOST_SKIN.TRANSPARENT);

      expect(config.controls.input.delay).toBe(1);
      expect(config.controls.input.initialDelay).toBe(6);
    });
  });

  describe("Partial configuration", () => {
    it("should merge partial config values with defaults", () => {
      const partial: DeepPartial<ConfigSchema> = {
        sizes: { blockSize: 32 },
        gameplay: { gravity: GRAVITY.ENGAGING },
      };
      const config = new Config(partial);
      expect(config.sizes.blockSize).toBe(32);
      expect(config.gameplay.gravity).toBe(GRAVITY.ENGAGING);
      expect(config.sizes.rows).toBe(20); // default remains
      expect(config.gameplay.wallKick).toBe(WALL_KICK.SRS);
    });
  });

  describe("Serialization", () => {
    it("toJSON should return a correct JSON representation", () => {
      const config = new Config();
      const json = config.toJSON();
      expect(json.sizes.blockSize).toBe(24);
      expect(json.gameplay.gravity).toBe(GRAVITY.NORMAL);
    });
  });

  describe("Persistence with localStorage", () => {
    it("should save and load config correctly", () => {
      const config = new Config({ gameplay: { gravity: GRAVITY.SPICY } });
      config.save();
      const loaded = Config.load();
      expect(loaded.gameplay.gravity).toBe(GRAVITY.SPICY);
    });

    it("should fallback to defaults if localStorage is empty or invalid", () => {
      expect(Config.load().gameplay.gravity).toBe(GRAVITY.NORMAL);
      localStorage.setItem(Config.STORAGE_KEY, "invalid json");
      expect(Config.load().gameplay.gravity).toBe(GRAVITY.NORMAL);
    });

    it("reset should clear storage and return default config", () => {
      const config = new Config({ gameplay: { gravity: GRAVITY.SPICY } });
      config.save();
      const resetConfig = Config.reset();
      expect(resetConfig.gameplay.gravity).toBe(GRAVITY.NORMAL);
      expect(localStorage.getItem(Config.STORAGE_KEY)).toBeNull();
    });
  });
});
