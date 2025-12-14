export type ActionName = string;

export default class InputMap {
  private bindings: Map<ActionName, Set<string>>;
  private keyDownSet: Set<string> = new Set<string>();
  private previousKeyDownSet: Set<string> = new Set<string>();
  private listening: boolean;
  private target: Window | HTMLElement;
  private keydownListener: typeof this.onKeyUp;
  private keyupListener: typeof this.onKeyDown;

  constructor(target: Window | HTMLElement = window) {
    this.bindings = new Map<ActionName, Set<string>>();
    this.listening = true;
    this.target = target;
    this.keydownListener = this.onKeyDown.bind(this);
    this.keyupListener = this.onKeyUp.bind(this);

    target.addEventListener("keydown", this.keydownListener);
    target.addEventListener("keyup", this.keyupListener);
  }

  bind(action: ActionName, ...keys: string[]): void {
    if (!this.bindings.has(action)) {
      this.bindings.set(action, new Set<string>());
    }

    const keySet = this.bindings.get(action)!;

    for (const key of keys) {
      keySet.add(key);
    }
  }

  unbind(action: ActionName, ...keys: string[]): void {
    if (!this.bindings.has(action)) {
      return;
    }

    const keySet = this.bindings.get(action)!;

    for (const key of keys) {
      keySet.delete(key);
    }
  }

  isActionDown(action: ActionName): boolean {
    if (!this.bindings.has(action)) {
      return false;
    }

    const keySet = this.bindings.get(action)!;

    if (!keySet) {
      return false;
    }

    for (const key of keySet) {
      if (this.keyDownSet.has(key)) {
        return true;
      }
    }

    return false;
  }

  isActionPressed(action: ActionName): boolean {
    if (!this.bindings.has(action)) {
      return false;
    }

    const keySet = this.bindings.get(action)!;

    if (!keySet) {
      return false;
    }

    for (const key of keySet) {
      if (this.keyDownSet.has(key) && !this.previousKeyDownSet.has(key)) {
        return true;
      }
    }

    return false;
  }

  isActionReleased(action: ActionName): boolean {
    const keys = this.bindings.get(action);
    if (!keys) return false;

    for (const key of keys) {
      if (!this.keyDownSet.has(key) && this.previousKeyDownSet.has(key)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Called at the end of each frame to update internal state
   */
  endFrame(): void {
    this.previousKeyDownSet = new Set<string>(this.keyDownSet);
  }

  destroy(): void {
    if (!this.listening) {
      return;
    }

    this.target.removeEventListener("keydown", this.keydownListener);
    this.target.removeEventListener("keyup", this.keyupListener);

    this.listening = false;
  }

  listenToTarget(): void {
    if (this.listening) {
      return;
    }

    this.target.addEventListener("keydown", this.keydownListener);
    this.target.addEventListener("keyup", this.keyupListener);

    this.listening = true;
  }

  private onKeyDown(e: Event): void {
    const ke = e as KeyboardEvent;

    this.keyDownSet.add(ke.code);
  }

  private onKeyUp(e: Event): void {
    const ke = e as KeyboardEvent;

    this.keyDownSet.delete(ke.code);
  }
}
