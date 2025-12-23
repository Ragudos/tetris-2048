import type { Container } from "pixi.js";
import { Libraries } from "@/Libraries";
import Logger from "../log/Logger";

export default abstract class ALayout {
  protected logger: Logger;
  protected dirty: boolean;
  protected container: Container;

  constructor(parent: Container) {
    this.logger = Logger.createLogger(ALayout.name);
    this.container = new (Libraries.getPIXI().Container)({
      parent,
      label: "Layout",
    });
    this.dirty = true;
  }

  markDirty(): void {
    this.logger.info("Marking dirty...");

    this.dirty = true;
  }

  addChild<T extends Container>(...children: T[]): T {
    this.logger.info("Adding child...");

    const result = this.container.addChild(...children);

    this.markDirty();

    return result;
  }

  removeChild<T extends Container>(...children: T[]): T {
    this.logger.info("Removing child...");

    const result = this.container.removeChild(...children);

    this.markDirty();

    return result;
  }

  tryUpdateLayout(): void {
    this.logger.info("Updating layout if dirty");

    if (!this.dirty) {
      return;
    }

    this.dirty = false;

    this.logger.info("Updating layout");
    this.layout();
    this.logger.info("Layout updated");
  }

  protected abstract layout(): void;

  getContainer(): Container {
    return this.container;
  }
}
