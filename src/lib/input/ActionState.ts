export default class ActionState {
  private pressed: boolean;
  private triggeredOnce: boolean;
  private repeats: number;
  private counter: number;
  private pressedOn: number;

  constructor() {
    this.pressed = false;
    this.triggeredOnce = false;
    this.repeats = 0;
    this.counter = 0;
    this.pressedOn = 0;
  }

  getPressedOn(): number {
    return this.pressedOn;
  }

  getPressed(): boolean {
    return this.pressed;
  }

  setPressed(pressed: boolean): void {
    this.pressed = pressed;
    this.pressedOn = Date.now();
  }

  resetRepeats(): void {
    this.repeats = 0;
  }

  getTriggeredOnce(): boolean {
    return this.triggeredOnce;
  }

  setTriggeredOnce(triggeredOnce: boolean): void {
    this.triggeredOnce = triggeredOnce;
  }

  getRepeats(): number {
    return this.repeats;
  }

  incrementRepeats(): void {
    this.repeats += 1;
  }

  getCounter(): number {
    return this.counter;
  }

  setCounter(counter: number): void {
    this.counter = counter;
  }

  reset(): void {
    this.pressed = false;
    this.triggeredOnce = false;
    this.repeats = 0;
    this.counter = 0;
    this.pressedOn = 0;
  }
}
