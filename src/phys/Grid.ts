declare const GridValueBrand: unique symbol;

export type GridValue<T> = readonly (readonly T[])[] & {
  readonly [GridValueBrand]: true;
};

export default class Grid<T> {
  #value: (T | undefined)[][];

  constructor(
    readonly columns: number,
    readonly rows: number,
    init?: (x: number, y: number) => T | undefined
  ) {
    this.#value = Array.from({ length: rows }, (_, y) => {
      return Array.from({ length: columns }, (_, x) => init?.(x, y));
    });
  }

  get(x: number, y: number): T | undefined {
    return this.#value[y][x];
  }

  set(x: number, y: number, value: T | undefined): void {
    this.#value[y][x] = value;
  }

  get value(): GridValue<T | undefined> {
    return Object.freeze(
      this.#value.map((row) => Object.freeze([...row]))
    ) as GridValue<T | undefined>;
  }
}
