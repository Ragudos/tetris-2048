import type { Container } from "pixi.js";
import ALayout from "./ALayout";

export default class HStack extends ALayout {
  private gap: number;
  private centerIndex: number;
  private widthConstraint: number;

  constructor(parent: Container, gap: number, centerIndex: number, widthConstraint: number) {
    super(parent);

    this.gap = gap;
    this.centerIndex = centerIndex;
    this.widthConstraint = widthConstraint;
  }

  protected layout(): void {
    const center = this.container.children[this.centerIndex];

    if (!center) return;

    const containerCenterX = this.widthConstraint / 2;

    // 1️⃣ Place center
    center.x = containerCenterX - center.width / 2;

    // 2️⃣ Layout left side (right → left)
    let cursorX = center.x - this.gap;

    for (let i = this.centerIndex - 1; i >= 0; i--) {
      const child = this.container.children[i];
      cursorX -= child.width;
      child.x = cursorX;
      cursorX -= this.gap;
    }

    // 3️⃣ Layout right side (left → right)
    cursorX = center.x + center.width + this.gap;

    for (let i = this.centerIndex + 1; i < this.container.children.length; i++) {
      const child = this.container.children[i];
      child.x = cursorX;
      cursorX += child.width + this.gap;
    }
  }

  getGap(): number {
    return this.gap;
  }
}
