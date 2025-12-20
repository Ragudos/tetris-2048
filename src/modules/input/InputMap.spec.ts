/**
 * @file InputMap.test.ts
 * @module src/modules/input/InputMap.test
 * @description
 * Vitest test suite for the InputMap class.
 * This file tests initialization, key binding, event listening, serialization/deserialization, and destruction.
 * Each test contains explanations and examples of how the class works in practice.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import InputMap from "./InputMap";

describe("InputMap", () => {
  let target: HTMLElement;

  beforeEach(() => {
    // Create a DOM element to attach listeners to for each test.
    target = document.createElement("div");
    target.id = "test-target";
    document.body.appendChild(target);
  });

  /**
   * Test: Default initialization
   * Ensures that the class correctly sets its initial state when autoListen is false.
   */
  it("should initialize with default values", () => {
    const map = new InputMap(target, false);

    const json = map.toJSON();
    expect(json.autoListen).toBe(false);
    expect(json.keys).toEqual({});
    expect(json.keysDown).toEqual([]);
    expect(json.targetId).toBe("test-target");
  });

  /**
   * Test: Keyboard event handling
   * Verifies that pressing and releasing keys updates the `keysDown` set correctly.
   */
  it("should track keydown and keyup events", () => {
    const map = new InputMap(target, true);

    const eventDown = new KeyboardEvent("keydown", { code: "KeyA" });
    const eventUp = new KeyboardEvent("keyup", { code: "KeyA" });

    // Press a key
    target.dispatchEvent(eventDown);
    expect(map.toJSON().keysDown).toContain("KeyA");

    // Release the key
    target.dispatchEvent(eventUp);
    expect(map.toJSON().keysDown).not.toContain("KeyA");

    map.destroy();
  });

  /**
   * Test: bind/unbind functionality
   * Ensures that keys can be dynamically bound and unbound from actions.
   */
  it("should bind and unbind keys correctly", () => {
    const map = new InputMap(target, true);

    // Bind keys to an action
    map.bind("jump", "Space", "KeyW");
    expect(map.pressed("jump")).toBe(false); // Nothing pressed yet

    // Simulate pressing "Space"
    const eventDown = new KeyboardEvent("keydown", { code: "Space" });
    target.dispatchEvent(eventDown);
    expect(map.pressed("jump")).toBe(true);

    // Simulate releasing "Space"
    const eventUp = new KeyboardEvent("keyup", { code: "Space" });
    target.dispatchEvent(eventUp);
    expect(map.pressed("jump")).toBe(false);

    // Unbind "KeyW" and verify it does not break
    map.unbind("jump", "KeyW");
    expect(map.pressed("jump")).toBe(false);
  });

  /**
   * Test: pressed() with multiple keys
   * Checks that pressing any bound key returns true.
   */
  it("pressed() returns true if any bound key is down", () => {
    const map = new InputMap(target, true); // autoListen = true
    map.bind("fire", "KeyF", "KeyG");

    // Simulate pressing "KeyG"
    const keyDownEvent = new KeyboardEvent("keydown", { code: "KeyG" });
    target.dispatchEvent(keyDownEvent);

    expect(map.pressed("fire")).toBe(true);

    // Simulate releasing "KeyG"
    const keyUpEvent = new KeyboardEvent("keyup", { code: "KeyG" });
    target.dispatchEvent(keyUpEvent);

    expect(map.pressed("fire")).toBe(false);
  });

  /**
   * Test: listen() method
   * Confirms that manually calling listen() attaches event listeners if autoListen was false.
   */
  it("should attach event listeners when listen() is called", () => {
    const map = new InputMap(target, false);
    const spyAdd = vi.spyOn(target, "addEventListener");

    map.listen();
    expect(spyAdd).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(spyAdd).toHaveBeenCalledWith("keyup", expect.any(Function));
  });

  /**
   * Test: destroy() method
   * Ensures that event listeners are removed and the listening flag is updated.
   */
  it("should remove event listeners when destroyed", () => {
    const map = new InputMap(target, true);
    const spyRemove = vi.spyOn(target, "removeEventListener");

    map.destroy();
    expect(spyRemove).toHaveBeenCalledWith("keydown", expect.any(Function));
    expect(spyRemove).toHaveBeenCalledWith("keyup", expect.any(Function));
  });

  /**
   * Test: toJSON with shouldDestroy
   * Verifies that toJSON optionally destroys the map if `shouldDestroy` is true.
   */
  it("should optionally destroy on toJSON", () => {
    const map = new InputMap(target, true);
    const json = map.toJSON(true);

    expect(json.autoListen).toBe(true);
    expect(map["listening"]).toBe(false); // internal flag after destroy
  });

  /**
   * Test: fromJSON()
   * Confirms that an InputMap instance can be restored from JSON.
   */
  it("should serialize and deserialize correctly", () => {
    const map = new InputMap(target, false);
    map.bind("jump", "Space");

    const json = map.toJSON();
    const restored = InputMap.fromJSON(json);

    expect(restored.toJSON()).toEqual(json);
  });

  /**
   * Test: fromJSON with invalid target
   * Ensures that an error is thrown if the target element does not exist.
   */
  it("should throw an error if deserializing with invalid targetId", () => {
    const json = {
      autoListen: true,
      keys: {},
      keysDown: [],
      targetId: "nonexistent",
    };

    expect(() => InputMap.fromJSON(json)).toThrowError(
      /InputMap target with id nonexistent does not exist/
    );
  });
});
