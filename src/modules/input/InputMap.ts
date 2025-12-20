/**
 * @file InputMap.ts
 * @module src/modules/input/InputMap
 * @description
 * InputMap is a utility class for tracking keyboard input on a given target (Window or HTMLElement).
 * It allows mapping actions to multiple keys, tracking which keys are pressed, and serializing/deserializing its state.
 *
 * ### Features
 * - Map multiple keys to a single action.
 * - Track currently pressed keys.
 * - Bind and unbind keys dynamically.
 * - Serialize and deserialize state to/from JSON.
 * - Automatically attach and detach keyboard event listeners.
 *
 * @example
 * ```ts
 * import InputMap from "src/modules/input/InputMap";
 *
 * const map = new InputMap(window, true);
 * map.bind("jump", "Space", "KeyW");
 *
 * if (map.pressed("jump")) {
 *   console.log("Jump action pressed!");
 * }
 *
 * const saved = map.toJSON();
 * const restored = InputMap.fromJSON(saved);
 * ```
 */

import z from "zod";

/**
 * @description Represents the name of an action that can be mapped to one or more keyboard keys.
 */
export type ActionName = string;

/**
 * @description Schema used for serializing and deserializing InputMap objects.
 * Ensures that JSON data passed to `fromJSON` has the correct structure.
 */
const schema = z.object({
  autoListen: z.boolean(),
  keys: z.record(z.string(), z.array(z.string())),
  keysDown: z.array(z.string()),
  targetId: z.string(),
});

/**
 * @class InputMap
 * @description Tracks keyboard input and manages key-action mappings for a given target.
 */
export default class InputMap {
  private target: Window | HTMLElement;
  private listening: boolean;
  private keys: Map<ActionName, Set<string>>;
  private keysDown: Set<string>;
  private keydownListener: typeof this.onKeyUp;
  private keyupListener: typeof this.onKeyDown;

  /**
   * @constructor
   * @param {Window | HTMLElement} [target=window] Target element to listen for keyboard events.
   * @param {boolean} [autoListen=true] Whether to automatically attach event listeners on creation.
   * @param {Map<ActionName, Set<string>>} [defaultKeys] Optional initial mapping of actions to keys.
   * @param {Set<string>} [defaultKeysDown] Optional initial set of currently pressed keys.
   *
   * @example
   * ```ts
   * const map = new InputMap(document.getElementById("game"), false);
   * map.listen();
   * ```
   */
  constructor(
    target: Window | HTMLElement = window,
    autoListen: boolean = true,
    defaultKeys?: Map<ActionName, Set<string>>,
    defaultKeysDown?: Set<string>
  ) {
    this.target = target;
    this.listening = autoListen;
    this.keys = defaultKeys ? defaultKeys : new Map();
    this.keysDown = defaultKeysDown ? defaultKeysDown : new Set();
    this.keydownListener = this.onKeyDown.bind(this);
    this.keyupListener = this.onKeyUp.bind(this);

    if (autoListen) {
      target.addEventListener("keydown", this.keydownListener);
      target.addEventListener("keyup", this.keyupListener);
    }
  }

  private onKeyDown(e: Event): void {
    this.keysDown.add((e as KeyboardEvent).code);
  }

  private onKeyUp(e: Event): void {
    this.keysDown.delete((e as KeyboardEvent).code);
  }

  /**
   * @method bind
   * @description Binds one or more keys to a given action.
   *
   * @param {ActionName} action - The action to bind keys to.
   * @param {...string} keys - Keyboard codes to bind to the action.
   *
   * @example
   * ```ts
   * map.bind("jump", "Space", "KeyW");
   * map.bind("fire", "KeyF");
   * ```
   */
  bind(action: ActionName, ...keys: string[]): void {
    if (!this.keys.has(action)) {
      this.keys.set(action, new Set(keys));

      return;
    }

    const set = this.keys.get(action)!;

    for (const key of keys) {
      set.add(key);
    }
  }

  /**
   * @method unbind
   * @description Removes one or more keys from a given action.
   *
   * @param {ActionName} action - The action to remove keys from.
   * @param {...string} keys - Keyboard codes to remove.
   *
   * @example
   * ```ts
   * map.unbind("jump", "KeyW");
   * ```
   */
  unbind(action: ActionName, ...keys: string[]): void {
    if (!this.keys.has(action)) {
      return;
    }

    const set = this.keys.get(action)!;

    for (const key of keys) {
      set.delete(key);
    }
  }

  /**
   * @method pressed
   * @description Checks if any of the keys bound to an action are currently pressed.
   *
   * @param {ActionName} action - The action to check.
   * @returns {boolean} True if any bound key is pressed.
   *
   * @example
   * ```ts
   * if (map.pressed("jump")) console.log("Jumping!");
   * ```
   */
  pressed(action: ActionName): boolean {
    if (!this.keys.has(action)) {
      return false;
    }

    const set = this.keys.get(action)!;

    for (const key of set) {
      if (this.keysDown.has(key)) {
        return true;
      }
    }

    return false;
  }

  listen(): void {
    if (this.listening) {
      return;
    }

    this.target.addEventListener("keydown", this.keydownListener);
    this.target.addEventListener("keyup", this.keyupListener);

    this.listening = true;
  }

  destroy(): void {
    if (!this.listening) {
      return;
    }

    this.target.removeEventListener("keydown", this.keydownListener);
    this.target.removeEventListener("keyup", this.keyupListener);

    this.listening = false;
  }

  /**
   * @method toJSON
   * @param {boolean} [shouldDestroy = false] Since we're serializing this object, there might be instances when this is deserialized again, and
   * autoListen would be true, then there would be multiple listeners to `target`, causing bugs.
   * @description Converts the current state of the InputMap to a JSON-serializable object.
   * @returns {object} JSON representation of the InputMap.
   *
   * @example
   * ```ts
   * const json = map.toJSON();
   * console.log(json.keysDown); // ['KeyA']
   * ```
   */
  toJSON(shouldDestroy: boolean = false): z.infer<typeof schema> {
    const listening = this.listening;

    if (shouldDestroy) {
      this.destroy();
    }

    return {
      autoListen: listening,
      keys: Object.fromEntries(
        [...this.keys.entries()].map(([key, value]) => [key, [...value]])
      ),
      keysDown: [...this.keysDown],
      targetId: this.target instanceof Window ? "window" : this.target.id,
    };
  }

  /**
   * @static
   * @method fromJSON
   * @description Creates an InputMap instance from a serialized JSON object.
   * Throws errors if the object is invalid or the target element does not exist.
   *
   * @param {unknown} obj - JSON object to deserialize.
   * @returns {InputMap} New InputMap instance.
   * @example
   * ```ts
   * const map = InputMap.fromJSON(savedJson);
   * ```
   */
  static fromJSON(obj: unknown): InputMap {
    const parseResult = schema.safeParse(obj);

    if (parseResult.error) {
      throw parseResult.error;
    }

    const target =
      parseResult.data.targetId === "window"
        ? window
        : document.getElementById(parseResult.data.targetId);

    if (!target) {
      throw new Error(
        `InputMap target with id ${parseResult.data.targetId} does not exist.`
      );
    }

    return new InputMap(
      target,
      parseResult.data.autoListen,
      new Map(
        Object.entries(parseResult.data.keys).map(([key, value]) => [
          key,
          new Set(value),
        ])
      ),
      new Set(parseResult.data.keysDown)
    );
  }
}
