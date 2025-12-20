/**
 * Represents the state of a single input (e.g., a key or button).
 * Tracks whether the input is currently pressed, how many times it has repeated,
 * and other related metadata useful for input handling systems.
 */
export default class InputState {
  /**
   * Indicates whether the input is currently pressed.
   * True if the key/button is held down, false otherwise.
   */
  #pressed: boolean = false;

  /**
   * Tracks if the input has been triggered once since the last reset.
   * Useful for detecting single press events without repetition.
   */
  triggeredOnce: boolean = false;

  /**
   * Counts the number of repeated activations of this input.
   * Useful for implementing key repeat behavior.
   */
  repeats: number = 0;

  /**
   * A general-purpose counter associated with this input.
   * Can be used for timing, repeat intervals, or other input-related logic.
   */
  counter: number = 0;

  /**
   * Stores the timestamp when the input was initially pressed.
   * Useful for measuring how long an input has been held down.
   */
  pressedOn: number = 0;

  /**
   * Resets all input state properties to their default values.
   * Typically called when initializing input states or after processing an input event.
   */
  reset(): void {
    this.pressed = false;
    this.triggeredOnce = false;
    this.repeats = 0;
    this.counter = 0;
    this.pressedOn = 0;
  }

  get pressed(): boolean {
    return this.#pressed;
  }

  set pressed(value: boolean) {
    this.#pressed = value;
    this.pressedOn = Date.now();
  }
}
