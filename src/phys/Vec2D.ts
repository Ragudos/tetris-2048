export default class Vec2D {
  #x: number;
  #y: number;

  constructor(x: number, y: number) {
    this.#x = x;
    this.#y = y;
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  set x(val: number) {
    this.#x = val;
  }

  set y(val: number) {
    this.#y = val;
  }
}
