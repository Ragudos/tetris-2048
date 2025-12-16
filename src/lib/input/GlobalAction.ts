import ActionProcessor, { ControlAction } from "./ActionProcessor";
import InputMap from "../config/InputMap";
import Config from "../config/Config";

export default class GlobalAction {
  private static instance: GlobalAction;

  private actionProcessor: ActionProcessor;

  static getInstance(): GlobalAction {
    if (GlobalAction.instance === undefined) {
      GlobalAction.instance = new GlobalAction();
    }

    return GlobalAction.instance;
  }

  private constructor() {
    this.actionProcessor = new ActionProcessor(
      Config.getInstance().getControlsConfig().getInputMap(),
    );

    this.initialize();
  }

  private initialize(): void {}

  getActionProcessor(): ActionProcessor {
    return this.actionProcessor;
  }
}
