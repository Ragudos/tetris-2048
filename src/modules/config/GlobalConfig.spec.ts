/**
 * @file GlobalConfig.spec.ts
 * @module src/modules/config/GlobalConfig
 * @description
 * BDD-style tests for the `GlobalConfig` singleton/factory module.
 *
 * This suite ensures that the global configuration:
 * - behaves as a singleton,
 * - supports initialization with custom partial config,
 * - merges updates correctly,
 * - persists changes to localStorage, and
 * - notifies registered listeners on changes.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import Config, { GRAVITY, WALL_KICK } from "./Config";
import { GlobalConfig } from "./GlobalConfig";

beforeEach(() => {
  localStorage.clear();
});

describe("GlobalConfig", () => {
  it("get() should load a singleton instance", () => {
    const cfg1 = GlobalConfig.get();
    const cfg2 = GlobalConfig.get();
    expect(cfg1).toBe(cfg2);
  });

  it("init() should create a new instance and persist it", () => {
    const cfg = GlobalConfig.init({ gameplay: { gravity: GRAVITY.ENGAGING } });
    expect(cfg.gameplay.gravity).toBe(GRAVITY.ENGAGING);

    const loaded = Config.load();
    expect(loaded.gameplay.gravity).toBe(GRAVITY.ENGAGING);
  });

  it("update() should merge partial config and notify listeners", () => {
    const listener = vi.fn();
    GlobalConfig.onChange(listener);

    GlobalConfig.init();
    const updated = GlobalConfig.update({
      gameplay: { wallKick: WALL_KICK.ARS },
    });
    expect(updated.gameplay.wallKick).toBe(WALL_KICK.ARS);
    expect(listener).toHaveBeenCalledWith(updated);

    // persisted
    const loaded = Config.load();
    expect(loaded.gameplay.wallKick).toBe(WALL_KICK.ARS);
  });

  it("reset() should clear instance and return default", () => {
    GlobalConfig.init({ gameplay: { gravity: GRAVITY.SPICY } });
    const resetCfg = GlobalConfig.reset();
    expect(resetCfg.gameplay.gravity).toBe(GRAVITY.NORMAL);
    expect(Config.load().gameplay.gravity).toBe(GRAVITY.NORMAL);
  });

  it("onChange() should register multiple listeners", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    GlobalConfig.onChange(listener1);
    GlobalConfig.onChange(listener2);

    const updated = GlobalConfig.update({
      gameplay: { gravity: GRAVITY.SUBZERO },
    });
    expect(listener1).toHaveBeenCalledWith(updated);
    expect(listener2).toHaveBeenCalledWith(updated);
  });
});
