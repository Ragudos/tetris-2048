import { generateRandomId } from "./modules/util/string";

export default class TetrisContainer {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement("div");

    this.element.setAttribute("id", generateRandomId());
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
