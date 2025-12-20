export default class Offsets {
  private top: number;
  private left: number;
  private bottom: number;
  private right: number;

  constructor(top: number, left: number, bottom: number, right: number) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }

  getTop(): number {
    return this.top;
  }

  getLeft(): number {
    return this.left;
  }

  getBottom(): number {
    return this.bottom;
  }

  getRight(): number {
    return this.right;
  }
}
