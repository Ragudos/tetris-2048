export default class CollisionResult {
  private top: boolean;
  private left: boolean;
  private bottom: boolean;
  private right: boolean;

  constructor(top: boolean, left: boolean, bottom: boolean, right: boolean) {
    this.top = top;
    this.left = left;
    this.bottom = bottom;
    this.right = right;
  }

  getTop(): boolean {
    return this.top;
  }

  getLeft(): boolean {
    return this.left;
  }

  getBottom(): boolean {
    return this.bottom;
  }

  getRight(): boolean {
    return this.right;
  }

  collidesVertical(): boolean {
    return this.top && this.bottom;
  }

  collidesHorizontal(): boolean {
    return this.left && this.right;
  }

  collidesAll(): boolean {
    return this.top && this.left && this.bottom && this.right;
  }
}
